"use client";

import { useSyncExternalStore } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { gradeOneSources, gradeOneVietnamese, vietnameseRoute, vietnameseUnits } from "../lib/grade-one-vietnamese";
import { lessonPosition } from "../lib/family-progress";
import { useFamily } from "./family-provider";
import { LessonPlayer } from "./lesson-player";

const storageKey = "gradetrail:grade-one-vietnamese:v1";
const changeEvent = "gradetrail:grade-one-vietnamese-change";
let sessionProgress: string | undefined;

function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(changeEvent, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(changeEvent, listener);
  };
}

function snapshot() {
  try { return sessionProgress ?? window.localStorage.getItem(storageKey) ?? "[]"; } catch { return "[]"; }
}

function readDone(raw: string) {
  try {
    const data: unknown = JSON.parse(raw);
    return new Set(gradeOneVietnamese.filter(({ id }) => Array.isArray(data) && data.includes(id)).map(({ id }) => id));
  } catch {
    return new Set<string>();
  }
}

function markDone(id: string) {
  const done = readDone(snapshot()).add(id);
  const serialized = JSON.stringify([...done]);
  try { window.localStorage.setItem(storageKey, serialized); sessionProgress = undefined; } catch { sessionProgress = serialized; }
  window.dispatchEvent(new Event(changeEvent));
}

function studyLink(id: string) {
  return vietnameseRoute + "/" + id;
}

export function GradeOneVietnamese({ lessonId }: { lessonId?: string }) {
  const guestDone = readDone(useSyncExternalStore(subscribe, snapshot, () => "[]"));
  const family = useFamily();
  const done = family.student
    ? new Set(family.rows.filter((row) => row.completed && gradeOneVietnamese.some((item) => row.lesson_key === "vietnamese/" + item.id)).map((row) => row.lesson_key.slice(11)))
    : guestDone;
  const lesson = gradeOneVietnamese.find((item) => item.id === lessonId);
  const lessonKey = "vietnamese/" + lessonId;
  const familyRow = family.rows.find((row) => row.lesson_key === lessonKey);
  const next = lesson && gradeOneVietnamese[gradeOneVietnamese.indexOf(lesson) + 1];

  if (lesson) {
    const unit = vietnameseUnits.find((item) => item.id === lesson.unit)!;
    return <section className="inner-view math-course math-lesson" aria-labelledby="vietnamese-title">
      <a className="back-link" href={vietnameseRoute}><ArrowLeft size={16} /> Về Tiếng Việt lớp 1</a>
      <p className="eyebrow">Tiếng Việt lớp 1 · {unit.title}</p>
      <h1 id="vietnamese-title">{lesson.title}</h1>
      <p className="section-intro">{lesson.goal}</p>
      <p className="course-reference"><a href={gradeOneSources[unit.book].url} target="_blank" rel="noreferrer">
        Đối chiếu SGK · {lesson.reference}
      </a></p>
      <LessonPlayer key={(family.student?.id ?? "guest") + ":" + lesson.id} steps={lesson.steps}
        storageId={family.student ? undefined : "grade-one-vietnamese:" + lesson.id}
        initialPosition={family.student ? lessonPosition(familyRow, lesson.steps.length) : undefined}
        onComplete={family.student ? undefined : () => markDone(lesson.id)}
        onProgress={family.student ? (position, completed, result) => family.record(lessonKey, position, completed, result) : undefined} />
      {done.has(lesson.id) && <div className="math-lesson-next">
        <span className="game-solved"><Check size={16} /> Đã hoàn thành</span>
        {next && <a className="button primary" href={studyLink(next.id)}>Bài luyện tiếp theo <ArrowRight size={16} /></a>}
      </div>}
    </section>;
  }

  const firstUnfinished = gradeOneVietnamese.find((item) => !done.has(item.id));

  return <section className="inner-view math-course" aria-labelledby="vietnamese-title">
    <div className="games-heading">
      <div>
        <a className="back-link" href="#lop-1"><ArrowLeft size={16} /> Về lớp 1</a>
        <h1 id="vietnamese-title">Tiếng Việt lớp 1</h1>
        <p className="section-intro">Luyện âm, vần và tập đọc theo các bài đã chọn trong bộ Kết nối tri thức với cuộc sống.</p>
      </div>
      <div className="lesson-progress">
        <strong>{done.size}/{gradeOneVietnamese.length} bài đã hoàn thành</strong>
        <progress aria-label="Số bài Tiếng Việt lớp 1 đã hoàn thành" value={done.size} max={gradeOneVietnamese.length} />
      </div>
    </div>
    {lessonId && <p className="studio-error" role="status">Không tìm thấy bài học. Em hãy chọn bài bên dưới.</p>}
    <div className="math-course-actions">
      <a className="button primary" href={studyLink(firstUnfinished?.id ?? gradeOneVietnamese[0].id)}>
        {!firstUnfinished ? "Ôn lại từ đầu" : done.size ? "Học bài chưa hoàn thành" : "Bắt đầu học"} <ArrowRight size={16} />
      </a>
      <a className="button secondary" href="#toan-lop-1">Toán lớp 1</a>
    </div>
    <p className="section-intro">Em chọn bài khớp với nội dung đang học trên lớp. Mục tập đọc dành cho các em đã học xong phần âm, vần trong sách.</p>
    <div className="math-unit-grid">
      {vietnameseUnits.map((unit) => <article key={unit.id} className="studio-panel math-unit">
        <h2>{unit.title}</h2>
        <ul>{gradeOneVietnamese.filter((item) => item.unit === unit.id).map((item) =>
          <li key={item.id}><a href={studyLink(item.id)}>
            <span><strong>{item.title}</strong><small>{item.reference}</small></span>
            {done.has(item.id) ? <span className="game-solved"><Check size={16} /> <span>Đã học</span></span> : <ArrowRight size={16} aria-hidden="true" />}
          </a></li>)}</ul>
      </article>)}
    </div>
    <details className="course-sources">
      <summary>Nguồn và phạm vi học liệu</summary>
      <p>Grade Trail biên soạn các bài luyện bổ trợ theo yêu cầu đọc đúng âm, vần, tiếng, từ, câu và trả lời câu hỏi về chi tiết trong đoạn ngắn. Danh sách gồm các mốc chọn lọc ở hai tập sách.</p>
      <ul>{Object.values(gradeOneSources).map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a></li>)}</ul>
    </details>
  </section>;
}
