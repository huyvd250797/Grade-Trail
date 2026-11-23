begin;

create table public.studio_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('author', 'reviewer'))
);

create table public.studio_curriculum_outcomes (
  id text primary key
);

create table public.studio_lessons (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id),
  outcome_id text not null references public.studio_curriculum_outcomes(id),
  title text not null check (char_length(btrim(title)) between 1 and 140),
  summary text not null check (char_length(btrim(summary)) between 1 and 480),
  body text not null check (char_length(body) <= 16000 and char_length(btrim(body)) >= 1),
  status text not null default 'draft' check (status in ('draft', 'in_review', 'returned', 'published')),
  review_note text not null default '' check (char_length(review_note) <= 2000),
  reviewer_id uuid references auth.users(id),
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  revision integer not null default 1,
  check ((status = 'published') = (published_at is not null))
);

create index studio_lessons_author_idx on public.studio_lessons(author_id, updated_at desc);
create index studio_lessons_status_idx on public.studio_lessons(status, updated_at desc);
create index studio_lessons_outcome_published_idx on public.studio_lessons(outcome_id, published_at desc) where status = 'published';

alter table public.studio_members enable row level security;
alter table public.studio_curriculum_outcomes enable row level security;
alter table public.studio_lessons enable row level security;

revoke all on public.studio_members, public.studio_curriculum_outcomes, public.studio_lessons from public, anon, authenticated;
grant select on public.studio_members, public.studio_lessons to authenticated;

create policy studio_members_read_own on public.studio_members for select to authenticated
using (user_id = (select auth.uid()));

create policy studio_lessons_read on public.studio_lessons for select to authenticated
using (
  (author_id = (select auth.uid()) and exists (select 1 from public.studio_members where user_id = (select auth.uid()) and role = 'author'))
  or (status in ('in_review', 'returned', 'published') and exists (select 1 from public.studio_members where user_id = (select auth.uid()) and role = 'reviewer'))
);

create function public.studio_save_lesson(p_id uuid, p_revision integer, p_outcome_id text, p_title text, p_summary text, p_body text)
returns public.studio_lessons
language plpgsql security definer set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_lesson public.studio_lessons;
begin
  if not exists (select 1 from public.studio_members where user_id = v_user and role = 'author') then
    raise exception 'STUDIO_FORBIDDEN';
  end if;
  if not exists (select 1 from public.studio_curriculum_outcomes where id = p_outcome_id) then
    raise exception 'STUDIO_OUTCOME_INVALID';
  end if;

  if p_id is null then
    insert into public.studio_lessons (author_id, outcome_id, title, summary, body)
    values (v_user, p_outcome_id, btrim(p_title), btrim(p_summary), btrim(p_body))
    returning * into v_lesson;
  else
    update public.studio_lessons
    set outcome_id = p_outcome_id, title = btrim(p_title), summary = btrim(p_summary),
        body = btrim(p_body), revision = revision + 1, updated_at = now()
    where id = p_id and author_id = v_user and revision = p_revision and status in ('draft', 'returned')
    returning * into v_lesson;
    if not found then raise exception 'STUDIO_STALE'; end if;
  end if;
  return v_lesson;
end;
$$;

create function public.studio_transition_lesson(p_id uuid, p_revision integer, p_action text, p_note text default '')
returns public.studio_lessons
language plpgsql security definer set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_role text;
  v_lesson public.studio_lessons;
begin
  select role into v_role from public.studio_members where user_id = v_user;
  if p_action = 'submit' and v_role = 'author' then
    update public.studio_lessons
    set status = 'in_review', review_note = '', reviewer_id = null, revision = revision + 1, updated_at = now()
    where id = p_id and author_id = v_user and revision = p_revision and status in ('draft', 'returned')
    returning * into v_lesson;
  elsif p_action in ('publish', 'return') and v_role = 'reviewer' then
    if p_action = 'return' and char_length(btrim(coalesce(p_note, ''))) = 0 then
      raise exception 'STUDIO_NOTE_REQUIRED';
    end if;
    update public.studio_lessons
    set status = case p_action when 'publish' then 'published' else 'returned' end,
        review_note = case p_action when 'return' then btrim(p_note) else '' end,
        reviewer_id = v_user, published_at = case p_action when 'publish' then now() end,
        revision = revision + 1, updated_at = now()
    where id = p_id and author_id <> v_user and revision = p_revision and status = 'in_review'
    returning * into v_lesson;
  else
    raise exception 'STUDIO_FORBIDDEN';
  end if;
  if v_lesson.id is null then raise exception 'STUDIO_STALE'; end if;
  return v_lesson;
end;
$$;

create function public.studio_published_lessons(p_outcome_id text default null, p_before timestamptz default null, p_before_id uuid default null)
returns table (id uuid, outcome_id text, title text, summary text, body text, published_at timestamptz)
language sql stable security definer set search_path = ''
as $$
  select l.id, l.outcome_id, l.title, l.summary, l.body, l.published_at
  from public.studio_lessons l
  where l.status = 'published'
    and (p_outcome_id is null or l.outcome_id = p_outcome_id)
    and (p_before is null or (l.published_at, l.id) < (p_before, p_before_id))
  order by l.published_at desc, l.id desc limit 25;
$$;

revoke all on function public.studio_save_lesson(uuid, integer, text, text, text, text) from public, anon, authenticated;
revoke all on function public.studio_transition_lesson(uuid, integer, text, text) from public, anon, authenticated;
revoke all on function public.studio_published_lessons(text, timestamptz, uuid) from public, anon, authenticated;
grant execute on function public.studio_save_lesson(uuid, integer, text, text, text, text) to authenticated;
grant execute on function public.studio_transition_lesson(uuid, integer, text, text) to authenticated;
grant execute on function public.studio_published_lessons(text, timestamptz, uuid) to anon, authenticated;

insert into public.studio_curriculum_outcomes (id) values
  ('vn-gdpt2018-1-math-number-01'),
  ('vn-gdpt2018-1-math-addition-01'),
  ('vn-gdpt2018-1-math-shapes-01'),
  ('vn-gdpt2018-1-language-decode-01'),
  ('vn-gdpt2018-1-language-write-01'),
  ('vn-gdpt2018-1-ethics-care-01'),
  ('vn-gdpt2018-1-nature-society-school-01'),
  ('vn-gdpt2018-2-math-number-01'),
  ('vn-gdpt2018-2-math-multiply-01'),
  ('vn-gdpt2018-2-math-time-01'),
  ('vn-gdpt2018-2-language-read-01'),
  ('vn-gdpt2018-2-language-write-01'),
  ('vn-gdpt2018-2-ethics-honesty-01'),
  ('vn-gdpt2018-2-nature-society-plants-animals-01'),
  ('vn-gdpt2018-3-math-number-01'),
  ('vn-gdpt2018-3-math-operations-01'),
  ('vn-gdpt2018-3-math-measure-01'),
  ('vn-gdpt2018-3-language-read-01'),
  ('vn-gdpt2018-3-language-write-01'),
  ('vn-gdpt2018-3-foreign-1-introduce-01'),
  ('vn-gdpt2018-3-nature-society-earth-01'),
  ('vn-gdpt2018-3-computing-technology-information-01'),
  ('vn-gdpt2018-4-math-natural-01'),
  ('vn-gdpt2018-4-math-fractions-01'),
  ('vn-gdpt2018-4-math-angles-01'),
  ('vn-gdpt2018-4-language-read-01'),
  ('vn-gdpt2018-4-language-write-01'),
  ('vn-gdpt2018-4-foreign-1-routine-01'),
  ('vn-gdpt2018-4-primary-science-water-01'),
  ('vn-gdpt2018-4-primary-science-light-01'),
  ('vn-gdpt2018-4-computing-technology-search-01'),
  ('vn-gdpt2018-5-math-decimal-01'),
  ('vn-gdpt2018-5-math-percentage-01'),
  ('vn-gdpt2018-5-math-solids-01'),
  ('vn-gdpt2018-5-language-read-01'),
  ('vn-gdpt2018-5-language-write-01'),
  ('vn-gdpt2018-5-foreign-1-communication-01'),
  ('vn-gdpt2018-5-primary-science-soil-01'),
  ('vn-gdpt2018-5-computing-technology-programming-01'),
  ('vn-gdpt2018-6-math-integers-01'),
  ('vn-gdpt2018-6-math-fractions-01'),
  ('vn-gdpt2018-6-math-symmetry-01'),
  ('vn-gdpt2018-6-language-folk-01'),
  ('vn-gdpt2018-6-language-write-01'),
  ('vn-gdpt2018-6-foreign-1-school-01'),
  ('vn-gdpt2018-6-civics-self-01'),
  ('vn-gdpt2018-6-science-cells-01'),
  ('vn-gdpt2018-6-science-forces-01'),
  ('vn-gdpt2018-6-computing-networks-01'),
  ('vn-gdpt2018-7-math-rational-01'),
  ('vn-gdpt2018-7-math-ratio-01'),
  ('vn-gdpt2018-7-math-triangles-01'),
  ('vn-gdpt2018-7-language-read-01'),
  ('vn-gdpt2018-7-language-write-01'),
  ('vn-gdpt2018-7-civics-heritage-01'),
  ('vn-gdpt2018-7-science-elements-01'),
  ('vn-gdpt2018-7-science-speed-01'),
  ('vn-gdpt2018-7-computing-spreadsheet-01'),
  ('vn-gdpt2018-8-math-polynomial-01'),
  ('vn-gdpt2018-8-math-linear-01'),
  ('vn-gdpt2018-8-math-thales-01'),
  ('vn-gdpt2018-8-language-read-01'),
  ('vn-gdpt2018-8-language-write-01'),
  ('vn-gdpt2018-8-civics-environment-01'),
  ('vn-gdpt2018-8-science-reaction-01'),
  ('vn-gdpt2018-8-science-pressure-01'),
  ('vn-gdpt2018-8-computing-data-01'),
  ('vn-gdpt2018-9-math-equations-01'),
  ('vn-gdpt2018-9-math-quadratic-01'),
  ('vn-gdpt2018-9-math-circles-01'),
  ('vn-gdpt2018-9-language-read-01'),
  ('vn-gdpt2018-9-language-write-01'),
  ('vn-gdpt2018-9-civics-peace-01'),
  ('vn-gdpt2018-9-science-genetics-01'),
  ('vn-gdpt2018-9-science-energy-01'),
  ('vn-gdpt2018-9-computing-presentation-01'),
  ('vn-gdpt2018-10-math-sets-01'),
  ('vn-gdpt2018-10-math-quadratic-01'),
  ('vn-gdpt2018-10-math-vectors-01'),
  ('vn-gdpt2018-10-language-read-01'),
  ('vn-gdpt2018-10-language-write-01'),
  ('vn-gdpt2018-10-history-historical-knowledge-01'),
  ('vn-gdpt2018-10-physics-motion-01'),
  ('vn-gdpt2018-10-physics-newton-01'),
  ('vn-gdpt2018-10-chemistry-atoms-01'),
  ('vn-gdpt2018-10-biology-cell-biology-01'),
  ('vn-gdpt2018-11-math-trig-01'),
  ('vn-gdpt2018-11-math-sequences-01'),
  ('vn-gdpt2018-11-math-limits-01'),
  ('vn-gdpt2018-11-math-derivative-01'),
  ('vn-gdpt2018-11-language-read-01'),
  ('vn-gdpt2018-11-language-write-01'),
  ('vn-gdpt2018-11-history-revolutions-01'),
  ('vn-gdpt2018-11-physics-oscillation-01'),
  ('vn-gdpt2018-11-chemistry-equilibrium-01'),
  ('vn-gdpt2018-11-biology-metabolism-01'),
  ('vn-gdpt2018-12-math-functions-01'),
  ('vn-gdpt2018-12-math-integration-01'),
  ('vn-gdpt2018-12-math-space-01'),
  ('vn-gdpt2018-12-math-probability-01'),
  ('vn-gdpt2018-12-language-read-01'),
  ('vn-gdpt2018-12-language-write-01'),
  ('vn-gdpt2018-12-history-asean-01'),
  ('vn-gdpt2018-12-physics-thermal-01'),
  ('vn-gdpt2018-12-chemistry-polymers-01'),
  ('vn-gdpt2018-12-chemistry-electrochemistry-01'),
  ('vn-gdpt2018-12-biology-population-genetics-01');

commit;
