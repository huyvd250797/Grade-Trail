"use client";

import { useEffect, useState, type FormEvent } from "react";
import { grades, type Grade } from "../lib/lessons";
import { lessonStatus, studioClient, studioError, studioOutcomeById, studioOutcomes, type Draft, type PublishedLesson, type StudioLesson, type StudioRole } from "../lib/content-studio";

const emptyDraft: Draft = { title: "", summary: "", body: "", outcome_id: "" };

function LessonPreview({ lesson }: { lesson: Draft }) {
  const outcome = studioOutcomeById.get(lesson.outcome_id);
  return <article className="studio-panel studio-preview">
    {outcome && <p className="eyebrow">Lớp {outcome.grade} · {outcome.subject}</p>}
    <h2>{lesson.title || "Bài học chưa có tiêu đề"}</h2>
    <p>{lesson.summary}</p>
    {outcome && <p className="studio-objective"><strong>{outcome.topic}</strong><br />{outcome.text}</p>}
    <div className="studio-body">{lesson.body}</div>
  </article>;
}

export function ContentStudio() {
  const [account, setAccount] = useState<string | null | undefined>(undefined);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!studioClient) return;
    const { data: { subscription } } = studioClient.auth.onAuthStateChange((_event, session) => {
      setAccount(session?.user.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!studioClient || busy) return;
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const { error } = await studioClient.auth.signInWithPassword({ email: String(data.get("email")).trim(), password: String(data.get("password")) });
      if (error) setError("Đăng nhập thất bại. Kiểm tra thông tin tài khoản và kết nối.");
    } catch {
      setError("Không thể kết nối để đăng nhập.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    if (!studioClient || busy) return;
    setBusy(true);
    setError("");
    try {
      const { error } = await studioClient.auth.signOut({ scope: "local" });
      if (error) setError("Không thể đăng xuất. Vui lòng thử lại.");
    } catch {
      setError("Không thể đăng xuất. Vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  }

  return <section className="inner-view studio" aria-labelledby="studio-title">
    <div className="studio-toolbar">
      <h1 id="studio-title">Biên soạn học liệu</h1>
      {account && <button type="button" className="button secondary" disabled={busy} onClick={signOut}>Đăng xuất</button>}
    </div>
    {error && <p className="studio-error" role="alert">{error}</p>}
    {!studioClient ? <p className="studio-panel">Studio chưa kết nối Supabase. Quản trị viên có thể thiết lập theo README.</p> :
      account === undefined ? <p role="status">Đang kiểm tra phiên đăng nhập…</p> :
      account ? <StudioWorkspace key={account} account={account} /> :
      <form className="studio-panel studio-form studio-login" onSubmit={signIn}>
        <label>Email<input name="email" type="email" autoComplete="username" required /></label>
        <label>Mật khẩu<input name="password" type="password" autoComplete="current-password" required /></label>
        <button className="button primary" disabled={busy}>{busy ? "Đang đăng nhập…" : "Đăng nhập"}</button>
      </form>}
  </section>;
}

function StudioWorkspace({ account }: { account: string }) {
  const [role, setRole] = useState<StudioRole | null | undefined>(undefined);
  const [rows, setRows] = useState<StudioLesson[]>([]);
  const [selected, setSelected] = useState<StudioLesson | "new" | null>(null);
  const [filter, setFilter] = useState("");
  const [loadError, setLoadError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const client = studioClient;
    if (!client) return;
    let current = true;
    const load = async () => {
      const member = await client.from("studio_members").select("role").eq("user_id", account).maybeSingle();
      if (member.error) throw member.error;
      if (!current) return;
      const assignedRole = member.data?.role as StudioRole | undefined;
      setRole(assignedRole ?? null);
      if (!assignedRole) return;
      let query = client.from("studio_lessons").select("id,title,summary,body,outcome_id,status,revision,review_note,updated_at")
        .order("updated_at", { ascending: false }).order("id").limit(100);
      if (filter) query = query.eq("status", filter);
      const result = await query;
      if (result.error) throw result.error;
      if (current) {
        setRows(result.data as StudioLesson[]);
        setLoadError("");
      }
    };
    void load().catch(() => { if (current) setLoadError("Không tải được danh sách. Kiểm tra kết nối và migration."); });
    return () => { current = false; };
  }, [account, filter, reload]);

  function refresh(saved?: StudioLesson) {
    if (saved) setSelected(saved);
    setReload((value) => value + 1);
  }

  return <>
    {loadError && <div className="studio-error" role="alert">{loadError} <button className="button secondary" onClick={() => refresh()}>Thử lại</button></div>}
    {role === undefined && !loadError && <p role="status">Đang tải Studio…</p>}
    {role === null && <p className="studio-panel">Tài khoản chưa được cấp quyền biên soạn hoặc duyệt học liệu.</p>}
    {role && <div className="studio-grid">
      <div className="studio-panel studio-list">
        <p className="eyebrow">{role === "author" ? "Biên soạn" : "Duyệt học liệu"}</p>
        {role === "author" && <button className="button primary" onClick={() => setSelected("new")}>Tạo bài</button>}
        <label>Trạng thái<select value={filter} onChange={(event) => setFilter(event.target.value)}>
          <option value="">Tất cả trạng thái</option>
          {Object.entries(lessonStatus).filter(([status]) => role === "author" || status !== "draft").map(([status, name]) => <option key={status} value={status}>{name}</option>)}
        </select></label>
        {rows.length === 0 && <p>Chưa có học liệu trong danh sách này.</p>}
        {rows.length === 100 && <p>Hiển thị 100 bài cập nhật gần nhất theo bộ lọc.</p>}
        <ul>{rows.map((row) => <li key={row.id}><button type="button" aria-pressed={typeof selected === "object" && selected?.id === row.id} onClick={() => setSelected(row)}>
          <strong>{row.title}</strong><span>{lessonStatus[row.status]}</span>
        </button></li>)}</ul>
      </div>
      <div className="studio-detail">
        {selected ? <StudioEditor key={selected === "new" ? "new" : selected.id + ":" + selected.revision}
          lesson={selected === "new" ? null : selected} role={role} onSave={refresh}
          onClose={() => { setSelected(null); refresh(); }} /> :
          <p className="studio-panel">{role === "author" ? "Tạo bài mới hoặc chọn bài để mở." : "Chọn một bài trong danh sách để xem nội dung."}</p>}
      </div>
    </div>}
  </>;
}

function StudioEditor({ lesson, role, onSave, onClose }: {
  lesson: StudioLesson | null; role: StudioRole; onSave: (lesson: StudioLesson) => void; onClose: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(lesson ?? emptyDraft);
  const [grade, setGrade] = useState<Grade>(studioOutcomeById.get(draft.outcome_id)?.grade ?? 1);
  const [subject, setSubject] = useState(studioOutcomeById.get(draft.outcome_id)?.subject ?? "");
  const [preview, setPreview] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const editable = role === "author" && (!lesson || lesson.status === "draft" || lesson.status === "returned");
  const savedDraft = lesson ?? emptyDraft;
  const dirty = (Object.keys(emptyDraft) as (keyof Draft)[]).some((field) => draft[field] !== savedDraft[field]);
  const options = studioOutcomes.filter((outcome) => outcome.grade === grade);
  const subjects = [...new Set(options.map((item) => item.subject))];
  const available = options.filter((outcome) => outcome.subject === subject);

  function change(field: keyof Draft, value: string) {
    setDraft((old) => ({ ...old, [field]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!studioClient || busy) return;
    const action = (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value") ?? "save";
    if (action !== "save" && !lesson) return;
    setError("");
    if (action === "save" && (!draft.title.trim() || !draft.summary.trim() || !draft.body.trim() || !draft.outcome_id)) {
      setError("Nhập đủ tiêu đề, tóm tắt, nội dung và yêu cầu cần đạt.");
      return;
    }
    setBusy(true);
    try {
      const result = action === "save"
        ? await studioClient.rpc("studio_save_lesson", {
          p_id: lesson?.id ?? null, p_revision: lesson?.revision ?? null,
          p_outcome_id: draft.outcome_id, p_title: draft.title, p_summary: draft.summary, p_body: draft.body,
        })
        : await studioClient.rpc("studio_transition_lesson", {
          p_id: lesson?.id, p_revision: lesson?.revision, p_action: action, p_note: note.trim(),
        });
      if (result.error) throw result.error;
      onSave(result.data as StudioLesson);
    } catch (failure) {
      setError(studioError((failure as { message?: string })?.message ?? ""));
    } finally {
      setBusy(false);
    }
  }

  return <form className="studio-panel studio-form" onSubmit={submit}>
    <div className="studio-toolbar"><h2>{lesson ? lessonStatus[lesson.status] : "Bài mới"}</h2>
      {editable && <button type="button" className="button secondary" onClick={() => setPreview(!preview)}>{preview ? "Về trình soạn" : "Xem trước"}</button>}
    </div>
    {lesson?.review_note && <p className="studio-objective"><strong>Góp ý duyệt</strong><br />{lesson.review_note}</p>}
    {editable && !preview ? <>
      <label>Tiêu đề<input required maxLength={140} value={draft.title} onChange={(event) => change("title", event.target.value)} /></label>
      <label>Tóm tắt<textarea required maxLength={480} rows={2} value={draft.summary} onChange={(event) => change("summary", event.target.value)} /></label>
      <div className="studio-selects">
        <label>Lớp<select value={grade} onChange={(event) => {
          const next = grades.find((item) => String(item) === event.target.value);
          if (next) { setGrade(next); setSubject(""); change("outcome_id", ""); }
        }}>{grades.map((item) => <option key={item} value={item}>Lớp {item}</option>)}</select></label>
        <label>Môn<select value={subject} onChange={(event) => { setSubject(event.target.value); change("outcome_id", ""); }}>
          <option value="">Chọn môn</option>{subjects.map((item) => <option key={item}>{item}</option>)}</select></label>
      </div>
      <label>Yêu cầu cần đạt<select required value={draft.outcome_id} onChange={(event) => change("outcome_id", event.target.value)}>
        <option value="">Chọn yêu cầu cần đạt</option>{available.map((item) => <option key={item.id} value={item.id}>{item.topic} — {item.text}</option>)}
      </select></label>
      <label>Nội dung bài học<textarea required maxLength={16000} rows={10} value={draft.body} onChange={(event) => change("body", event.target.value)} /></label>
    </> : <LessonPreview lesson={draft} />}
    {role === "reviewer" && lesson?.status === "in_review" && <label>Góp ý khi trả bài<textarea maxLength={2000} rows={3} value={note} onChange={(event) => setNote(event.target.value)} /></label>}
    {error && <p role="alert" className="studio-error">{error}</p>}
    <div className="studio-actions">
      <button type="button" className="button secondary" disabled={busy} onClick={() => {
        if (!dirty || window.confirm("Bỏ các thay đổi chưa lưu?")) onClose();
      }}>Đóng</button>
      {editable && <button className="button secondary" value="save" disabled={busy || !dirty}>Lưu nháp</button>}
      {editable && lesson && <button className="button primary" value="submit" disabled={busy || dirty}>Gửi duyệt</button>}
      {role === "reviewer" && lesson?.status === "in_review" && <>
        <button className="button secondary" value="return" disabled={busy || !note.trim()}>Trả bài</button>
        <button className="button primary" value="publish" disabled={busy} onClick={(event) => {
          if (!window.confirm("Duyệt và công khai học liệu này?")) event.preventDefault();
        }}>Duyệt và xuất bản</button>
      </>}
    </div>
  </form>;
}

export function PublishedLibrary({ outcomeId }: { outcomeId?: string }) {
  const [rows, setRows] = useState<PublishedLesson[]>([]);
  const [selected, setSelected] = useState<PublishedLesson | null>(null);
  const [loading, setLoading] = useState(!!studioClient);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [request, setRequest] = useState<{ at: string | null; id: string | null }>({ at: null, id: null });
  const outcome = outcomeId ? studioOutcomeById.get(outcomeId) : undefined;

  useEffect(() => {
    const client = studioClient;
    if (!client || (outcomeId && !outcome)) return;
    let current = true;
    void (async () => {
      try {
        const result = await client.rpc("studio_published_lessons", { p_outcome_id: outcomeId ?? null, p_before: request.at, p_before_id: request.id });
        if (result.error) throw result.error;
        if (!current) return;
        const page = result.data as PublishedLesson[];
        setRows((old) => request.id ? [...old, ...page] : page);
        setHasMore(page.length === 25);
      } catch {
        if (current) setError("Không tải được học liệu. Vui lòng kiểm tra kết nối.");
      } finally {
        if (current) setLoading(false);
      }
    })();
    return () => { current = false; };
  }, [outcomeId, outcome, request]);

  return <section className="inner-view studio" aria-labelledby="library-title">
    <div className="studio-toolbar"><h1 id="library-title">Học liệu đã xuất bản</h1><a className="button secondary" href="#studio">Studio</a></div>
    {outcome && <p className="section-intro">Lớp {outcome.grade} · {outcome.subject} · {outcome.topic}</p>}
    {outcomeId && !outcome ? <p>Không tìm thấy yêu cầu cần đạt.</p> :
      !studioClient ? <p className="studio-panel">Kho học liệu chưa kết nối Supabase.</p> :
      <>
        {error && <div role="alert" className="studio-error">{error} <button className="button secondary" onClick={() => {
          setError(""); setLoading(true); setRequest({ ...request });
        }}>Thử lại</button></div>}
        {loading && <p role="status">Đang tải học liệu…</p>}
        {!loading && !error && !rows.length && <p className="studio-panel">Chưa có học liệu đã xuất bản{outcome ? " cho yêu cầu này" : ""}.</p>}
        {selected ? <><button className="button secondary" onClick={() => setSelected(null)}>Về danh sách</button><LessonPreview lesson={selected} /></> :
          <div className="studio-public">{rows.map((row) => <article className="studio-panel" key={row.id}>
            <h2>{row.title}</h2><p>{row.summary}</p><button className="button secondary" onClick={() => setSelected(row)}>Đọc bài</button>
          </article>)}</div>}
        {hasMore && !loading && !error && !selected && <button className="button secondary" onClick={() => {
          const last = rows.at(-1);
          if (last) { setLoading(true); setRequest({ at: last.published_at, id: last.id }); }
        }}>Xem thêm</button>}
      </>}
  </section>;
}
