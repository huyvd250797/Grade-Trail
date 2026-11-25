"use client";

import { useSyncExternalStore } from "react";
import { ArrowLeft, ArrowRight, Check, Gamepad2 } from "lucide-react";
import { gradeOneMath, mathBooks } from "../lib/grade-one-math";
import { LessonPlayer } from "./lesson-player";

const storageKey = "gradetrail:grade-one-math:v1";
const changeEvent = "gradetrail:grade-one-math-change";
let temporaryProgress: string | undefined;

function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(changeEvent, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(changeEvent, listener);
  };
}

function snapshot() {
  if (temporaryProgress !== undefined) return temporaryProgress;
  try { return window.localStorage.getItem(storageKey) ?? "[]"; } catch { return "[]"; }
}

function readDone(raw: string) {
  try {
    const data: unknown = JSON.parse(raw);
    return gradeOneMath.filter((lesson) => Array.isArray(data) && data.includes(lesson.id)).map((lesson) => lesson.id);
  } catch { return []; }
}

function markDone(id: string) {
  const next = JSON.stringify([...new Set([...readDone(snapshot()), id])]);
  try { window.localStorage.setItem(storageKey, next); temporaryProgress = undefined; } catch { temporaryProgress = next; }
  window.dispatchEvent(new Event(changeEvent));
}

export function GradeOneMath({ lessonId }: { lessonId?: string }) {
  const done = readDone(useSyncExternalStore(subscribe, snapshot, () => "[]"));
  const lesson = gradeOneMath.find((item) => item.id === lessonId);
  const next = lesson && gradeOneMath[gradeOneMath.indexOf(lesson) + 1];

  if (lesson) return <section className="inner-view math-course math-lesson" aria-labelledby="math-title">
    <a className="back-link" href="#toan-lop-1"><ArrowLeft size={16} /> Về lộ trình Toán lớp 1</a>
    <p className="eyebrow">Toán lớp 1 · {mathBooks[lesson.book].title}</p>
    <h1 id="math-title">{lesson.title}</h1>
    <p className="section-intro">{lesson.goal}</p>
    <p className="course-reference"><a href={mathBooks[lesson.book].url} target="_blank" rel="noreferrer">
      Đối chiếu SGK · {mathBooks[lesson.book].title} · {lesson.reference}
    </a></p>
    <LessonPlayer key={lesson.id} steps={lesson.steps} storageId={"grade-one-math:" + lesson.id} onComplete={() => markDone(lesson.id)} />
    {done.includes(lesson.id) && <div className="math-lesson-next">
      <span className="game-solved"><Check size={16} /> Đã hoàn thành</span>
      {next && <a className="button primary" href={"#toan-lop-1/" + next.id}>Bài tiếp theo <ArrowRight size={16} /></a>}
    </div>}
  </section>;

  return <section className="inner-view math-course" aria-labelledby="math-title">
    <div className="games-heading">
      <div><a className="back-link" href="#lop-1"><ArrowLeft size={16} /> Về lớp 1</a>
        <h1 id="math-title">Toán lớp 1</h1>
        <p className="section-intro">Luyện các bài đã chọn theo thứ tự trong bộ Kết nối tri thức với cuộc sống.</p></div>
      <div className="lesson-progress">
        <strong>{done.length}/{gradeOneMath.length} bài đã hoàn thành</strong>
        <progress aria-label="Số bài Toán lớp 1 đã hoàn thành" value={done.length} max={gradeOneMath.length} />
      </div>
    </div>
    {lessonId && <p className="studio-error" role="status">Không tìm thấy bài học. Hãy chọn bài bên dưới.</p>}
    <div className="math-course-actions">
      <a className="button primary" href={"#toan-lop-1/" + (gradeOneMath.find((item) => !done.includes(item.id))?.id ?? gradeOneMath[0].id)}>
        {done.length === gradeOneMath.length ? "Ôn lại từ đầu" : done.length ? "Học bài chưa hoàn thành" : "Bắt đầu học"} <ArrowRight size={16} />
      </a>
      <a className="button secondary" href="#tro-choi-1"><Gamepad2 size={17} /> Trò chơi Toán lớp 1</a>
    </div>
    <div className="math-unit-grid">
      {Object.entries(mathBooks).map(([book, unit]) => <article key={book} className="studio-panel math-unit">
        <h2>{unit.title}</h2>
        <ul>{gradeOneMath.filter((item) => item.book === book).map((item) =>
          <li key={item.id}><a href={"#toan-lop-1/" + item.id}>
            <span><strong>{item.title}</strong><small>{item.reference} · {item.goal}</small></span>
            {done.includes(item.id) ? <span className="game-solved"><Check size={16} /> <span className="math-done-text">Đã học</span></span> : <ArrowRight size={16} aria-hidden="true" />}
          </a></li>)}</ul>
      </article>)}
    </div>
  </section>;
}
