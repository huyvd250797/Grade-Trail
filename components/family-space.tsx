"use client";

import { useRef, useState, type FormEvent } from "react";
import { ArrowRight, Check, UserRound } from "lucide-react";
import { studioClient as client } from "../lib/content-studio";
import { familyLessonByKey, familySubjects, lessonPosition, newestProgress, readLegacyProgress, resumeLesson, type FamilyStudent } from "../lib/family-progress";
import { useFamily } from "./family-provider";

const dateFormat = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" });

function ParentSignIn() {
  const [register, setRegister] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!client || busy) return;
    const form = new FormData(event.currentTarget);
    const credentials = { email: String(form.get("email")).trim(), password: String(form.get("password")) };
    setBusy(true);
    setMessage("");
    try {
      if (register) {
        const { data, error } = await client.auth.signUp({
          ...credentials, options: { emailRedirectTo: window.location.origin + window.location.pathname },
        });
        setMessage(error ? "Chưa tạo được tài khoản. Kiểm tra email, mật khẩu và thử lại."
          : data.session ? "Đã đăng nhập." : "Kiểm tra email để xác nhận tài khoản, sau đó đăng nhập.");
      } else {
        const { error } = await client.auth.signInWithPassword(credentials);
        if (error) setMessage("Chưa đăng nhập được. Kiểm tra email, mật khẩu và xác nhận email trước.");
      }
    } catch { setMessage("Không kết nối được. Hãy thử lại."); }
    finally { setBusy(false); }
  }

  return <div className="studio-panel family-auth">
    <h2>{register ? "Tạo tài khoản phụ huynh" : "Đăng nhập phụ huynh"}</h2>
    <form className="family-form" onSubmit={(event) => { void submit(event); }}>
      <label>Email<input name="email" required type="email" autoComplete="email" /></label>
      <label>Mật khẩu<input name="password" required type="password" minLength={register ? 8 : undefined}
        autoComplete={register ? "new-password" : "current-password"} /></label>
      <div className="studio-actions">
        <button type="submit" className="button primary" disabled={busy}>{busy ? "Đang xử lý…" : register ? "Đăng ký" : "Đăng nhập"}</button>
        <button type="button" className="button secondary" disabled={busy} onClick={() => { setRegister(!register); setMessage(""); }}>
          {register ? "Về đăng nhập" : "Tạo tài khoản"}
        </button>
      </div>
    </form>
    {message && <p role="status">{message}</p>}
  </div>;
}

function StudentForm({ student, onClose }: { student?: FamilyStudent; onClose: () => void }) {
  const family = useFamily();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const requestId = useRef<string | undefined>(undefined);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name")).trim();
    if (!name) { setError(true); return; }
    setBusy(true);
    setError(false);
    if (!student) requestId.current ??= crypto.randomUUID();
    const ok = await family.saveStudent(name, Number(data.get("grade")), student?.id, requestId.current);
    setBusy(false);
    if (ok) onClose();
    else setError(true);
  }

  return <form className="studio-panel family-form" onSubmit={(event) => { void submit(event); }}>
    <h2>{student ? "Sửa hồ sơ học sinh" : "Thêm hồ sơ học sinh"}</h2>
    <label>Tên hiển thị<input name="name" placeholder="Ví dụ Minh" required maxLength={60} defaultValue={student?.display_name} /></label>
    <label>Khối lớp<select name="grade" defaultValue={student?.grade ?? 1}>
      {Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>Lớp {index + 1}</option>)}
    </select></label>
    <div className="studio-actions">
      <button type="submit" className="button primary" disabled={busy}>{busy ? "Đang lưu…" : "Lưu hồ sơ"}</button>
      <button type="button" className="button secondary" disabled={busy} onClick={onClose}>Đóng</button>
    </div>
    {error && <p className="studio-error" role="alert">Chưa lưu được. Kiểm tra tên và kết nối rồi thử lại.</p>}
  </form>;
}

function LegacyImport({ student }: { student: FamilyStudent }) {
  const family = useFamily();
  const [legacy] = useState(() => {
    try { return readLegacyProgress(window.localStorage); } catch { return []; }
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  if (!legacy.length) return null;

  async function confirm() {
    setBusy(true);
    const ok = await family.importProgress(student.id, legacy);
    setBusy(false);
    setMessage(ok ? "Đã nhập tiến độ từ thiết bị." : "Chưa nhập hết. Em có thể thử lại để nhập các bài còn thiếu.");
  }

  return <details className="studio-panel course-sources">
    <summary>Nhập tiến độ cũ trên thiết bị</summary>
    <p>Nhập {legacy.length} bài vào hồ sơ <strong>{student.display_name}</strong>. Kiểm tra đây là tiến độ của đúng học sinh trước khi nhập.</p>
    <ul className="family-import-list">{legacy.map((row) => {
      const lesson = familyLessonByKey.get(row.lesson_key)!;
      return <li key={row.lesson_key}>{lesson.title} · {row.completed ? "Đã học" : "Đang học"}</li>;
    })}</ul>
    <button className="button secondary" type="button" disabled={busy || family.saving || family.saveFailed} onClick={() => { void confirm(); }}>
      {busy ? "Đang nhập…" : "Xác nhận nhập vào hồ sơ này"}
    </button>
    {message && <p role="status">{message}</p>}
  </details>;
}

export function FamilySaveStatus() {
  const family = useFamily();
  if (family.saveFailed) return <div className="studio-panel family-save" role="status">
    <p>Chưa lưu một số thay đổi. Kết nối lại và thử lưu trước khi đóng trang hoặc đăng xuất.</p>
    <button className="button secondary" type="button" onClick={family.retry}>Thử lưu lại</button>
  </div>;
  return family.saving ? <p className="family-save section-intro" role="status">Đang lưu tiến độ…</p> : null;
}

export function FamilyReport() {
  const family = useFamily();
  const student = family.student;
  if (!student) return null;
  const rows = newestProgress(family.rows);
  const next = resumeLesson(rows);
  const recent = rows.filter((row) => row.last_result_at).sort((a, b) =>
    Date.parse(b.last_result_at!) - Date.parse(a.last_result_at!)).slice(0, 5);

  return <section className="family-report" aria-labelledby="family-report-title">
    <div className="family-toolbar">
      <div><h2 id="family-report-title">Tiến độ của {student.display_name}</h2><p className="section-intro">Báo cáo các bài Toán và Tiếng Việt lớp 1 trong Grade Trail.</p></div>
      {next && <a className="button primary" href={next.route}>{rows.length ? "Tiếp tục học" : "Bắt đầu học"} <ArrowRight size={16} /></a>}
    </div>
    {rows[0]?.last_activity_at && <p className="section-intro">Lần học gần nhất · {dateFormat.format(new Date(rows[0].last_activity_at))}</p>}
    <div className="math-unit-grid">
      {familySubjects.map((subject) => {
        const progress = rows.filter((row) => row.lesson_key.startsWith(subject.key + "/"));
        const done = progress.filter((row) => row.completed).length;
        const unfinished = progress.find((row) => {
          const lesson = familyLessonByKey.get(row.lesson_key)!;
          return lessonPosition(row, lesson.steps).current < lesson.steps;
        });
        const lesson = unfinished && familyLessonByKey.get(unfinished.lesson_key)!;
        return <article className="studio-panel family-summary" key={subject.key}>
          <h3><a href={subject.route}>{subject.title}</a></h3>
          <p>{done}/{subject.lessons.length} bài đã hoàn thành</p>
          <progress aria-label={"Số bài đã hoàn thành, " + subject.title} value={done} max={subject.lessons.length} />
          {lesson && unfinished && <p>Đang học <a href={lesson.route}>{lesson.title}</a> · Bước {lessonPosition(unfinished, lesson.steps).current + 1}/{lesson.steps}</p>}
        </article>;
      })}
    </div>
    <div className="studio-panel family-results">
      <h3>Kết quả gần đây</h3>
      {recent.length ? <ul className="completed-list">{recent.map((row) => {
        const lesson = familyLessonByKey.get(row.lesson_key)!;
        return <li key={row.lesson_key}><a href={lesson.route}>
          <span><strong>{lesson.title}</strong><small>{dateFormat.format(new Date(row.last_result_at!))}</small></span>
          <span>{row.last_result ? "Trả lời đúng" : "Cần thử lại"}</span>
        </a></li>;
      })}</ul> : <p>Chưa có câu trả lời được ghi nhận.</p>}
    </div>
  </section>;
}

export function FamilySpace() {
  const family = useFamily();
  const [editing, setEditing] = useState<"new" | FamilyStudent | null>(null);
  const [signoutError, setSignoutError] = useState(false);
  async function signOut() {
    try {
      const response = await client?.auth.signOut({ scope: "local" });
      setSignoutError(Boolean(response?.error));
    } catch { setSignoutError(true); }
  }

  return <section className="inner-view math-course" aria-labelledby="family-title">
    <h1 id="family-title">Gia đình</h1>
    {!client ? <p className="section-intro">Tài khoản gia đình sẽ dùng được sau khi ứng dụng kết nối Supabase. Em vẫn có thể học trên thiết bị này.</p>
      : family.loading ? <p role="status">Đang tải hồ sơ…</p>
      : !family.account ? <ParentSignIn />
      : <>
        <div className="family-toolbar">
          <p className="section-intro">{family.account}</p>
          <button className="button secondary" type="button" disabled={family.saving} onClick={() => { void signOut(); }}>Đăng xuất</button>
        </div>
        {signoutError && <p role="alert">Chưa đăng xuất được. Hãy thử lại.</p>}
        {family.error ? <div className="studio-panel"><p role="alert">Chưa tải được hồ sơ. Kiểm tra kết nối và migration V0.8.0.</p>
          <button type="button" className="button secondary" onClick={family.reload}>Tải lại hồ sơ</button></div> : <>
          <div className="studio-panel family-profiles">
            <div className="family-toolbar">
              <h2>Hồ sơ học sinh</h2>
              <button className="button primary" type="button" onClick={() => setEditing("new")}>Thêm hồ sơ</button>
            </div>
            {family.students.length ? <ul>{family.students.map((item) => <li key={item.id}>
              <button className="button secondary" type="button" aria-pressed={family.student?.id === item.id} onClick={() => family.selectStudent(item.id)}>
                <UserRound size={16} aria-hidden="true" /><span>{item.display_name} · Lớp {item.grade}</span>
                {family.student?.id === item.id && <Check size={17} aria-label="Đang chọn" />}
              </button>
              <button className="button secondary" type="button" aria-label={"Sửa hồ sơ " + item.display_name} onClick={() => setEditing(item)}>Sửa</button>
            </li>)}</ul> : <p>Thêm hồ sơ đầu tiên để lưu tiến độ cho con.</p>}
          </div>
          {editing && <StudentForm key={editing === "new" ? editing : editing.id} student={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} />}
          {family.student && <>
            <FamilyReport />
            <LegacyImport key={family.student.id} student={family.student} />
          </>}
        </>}
      </>}
  </section>;
}
