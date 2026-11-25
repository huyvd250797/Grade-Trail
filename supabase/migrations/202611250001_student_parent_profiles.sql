begin;

create table public.family_students (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 1 and 60),
  grade smallint not null check (grade between 1 and 12),
  created_at timestamptz not null default now()
);

create index family_students_parent_idx on public.family_students(parent_id, created_at);

create table public.family_lesson_progress (
  student_id uuid not null references public.family_students(id) on delete cascade,
  lesson_key text not null check (lesson_key ~ '^(math|vietnamese)/[a-z0-9-]{1,80}$'),
  current_step smallint not null check (current_step between 0 and 100),
  furthest_step smallint not null check (furthest_step between current_step and 100),
  completed boolean not null,
  last_activity_at timestamptz,
  last_result boolean,
  last_result_at timestamptz,
  primary key (student_id, lesson_key),
  check ((last_result is null) = (last_result_at is null))
);

alter table public.family_students enable row level security;
alter table public.family_lesson_progress enable row level security;

revoke all on public.family_students, public.family_lesson_progress from public, anon, authenticated;
grant select on public.family_students, public.family_lesson_progress to authenticated;
grant insert (id, display_name, grade), update (display_name, grade) on public.family_students to authenticated;

create policy family_students_read_own on public.family_students for select to authenticated
using (parent_id = (select auth.uid()));

create policy family_students_create_own on public.family_students for insert to authenticated
with check (parent_id = (select auth.uid()));

create policy family_students_edit_own on public.family_students for update to authenticated
using (parent_id = (select auth.uid()))
with check (parent_id = (select auth.uid()));

create policy family_progress_read_own on public.family_lesson_progress for select to authenticated
using (exists (
  select 1 from public.family_students s
  where s.id = student_id and s.parent_id = (select auth.uid())
));

create function public.family_save_lesson_progress(
  p_student_id uuid, p_lesson_key text, p_current_step smallint, p_furthest_step smallint,
  p_completed boolean, p_activity_at timestamptz, p_result boolean, p_result_at timestamptz
)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_row public.family_lesson_progress;
begin
  if not exists (
    select 1 from public.family_students
    where id = p_student_id and parent_id = auth.uid()
  ) then
    raise exception 'FAMILY_FORBIDDEN' using errcode = '42501';
  end if;

  if (p_activity_at is null and p_result is not null)
    or ((p_result is null) <> (p_result_at is null)) then
    raise exception 'FAMILY_INVALID_PROGRESS' using errcode = '22023';
  end if;

  insert into public.family_lesson_progress as stored (
    student_id, lesson_key, current_step, furthest_step, completed,
    last_activity_at, last_result, last_result_at
  ) values (
    p_student_id, p_lesson_key, p_current_step, p_furthest_step, p_completed,
    case when p_activity_at is not null then least(p_activity_at, now()) end,
    p_result, case when p_result_at is not null then least(p_result_at, now()) end
  )
  on conflict (student_id, lesson_key) do update set
    current_step = case
      when excluded.last_activity_at >= stored.last_activity_at
        or (stored.last_activity_at is null and (excluded.last_activity_at is not null or excluded.furthest_step > stored.furthest_step))
      then excluded.current_step else stored.current_step end,
    furthest_step = case
      when excluded.last_activity_at >= stored.last_activity_at
        or (stored.last_activity_at is null and (excluded.last_activity_at is not null or excluded.furthest_step > stored.furthest_step))
      then excluded.furthest_step else stored.furthest_step end,
    completed = stored.completed or excluded.completed,
    last_activity_at = greatest(stored.last_activity_at, excluded.last_activity_at),
    last_result = case
      when excluded.last_result_at is not null and (stored.last_result_at is null or excluded.last_result_at >= stored.last_result_at)
      then excluded.last_result else stored.last_result end,
    last_result_at = greatest(stored.last_result_at, excluded.last_result_at)
  returning * into v_row;

  return to_jsonb(v_row);
end;
$$;

revoke all on function public.family_save_lesson_progress(uuid, text, smallint, smallint, boolean, timestamptz, boolean, timestamptz)
  from public, anon, authenticated;
grant execute on function public.family_save_lesson_progress(uuid, text, smallint, smallint, boolean, timestamptz, boolean, timestamptz)
  to authenticated;

commit;
