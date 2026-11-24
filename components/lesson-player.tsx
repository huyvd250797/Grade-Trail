"use client";

import { useId, useRef, useState } from "react";
import { readLessonPosition, type LessonPosition, type LessonStep } from "../lib/lesson-engine";

export function LessonPlayer({ steps, storageId, onComplete }: {
  steps: LessonStep[];
  storageId?: string;
  onComplete?: () => void;
}) {
  const storageKey = storageId ? "gradetrail:lesson:v1:" + storageId : undefined;
  const [position, setPosition] = useState<LessonPosition>(() => {
    try {
      return readLessonPosition(storageKey ? window.localStorage.getItem(storageKey) : null, steps.length);
    } catch {
      return { current: 0, furthest: 0 };
    }
  });
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const title = useRef<HTMLHeadingElement>(null);
  const choices = useId();
  const step = steps[position.current];
  const complete = position.current === steps.length;
  const correct = step?.kind === "quiz" && selected === step.correct;
  const checkedCorrect = checked && correct;

  function navigate(index: number, reset = false) {
    const next = { current: index, furthest: reset ? 0 : Math.max(index, position.furthest) };
    setPosition(next);
    setSelected(null);
    setChecked(false);
    if (storageKey) {
      try { window.localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* Continue in this session. */ }
    }
    if (!reset && index === steps.length && step) onComplete?.();
    title.current?.focus();
  }

  if (!steps.length) return <p>Chưa có nội dung bài học.</p>;

  return <section className="lesson-player" aria-label="Các bước học">
    <header className="lesson-progress">
      <span>{complete ? "Đã hoàn thành" : `Bước ${position.current + 1} / ${steps.length}`}</span>
      <progress aria-label="Số bước đã hoàn thành" value={position.furthest} max={steps.length} />
    </header>
    <h3 ref={title} tabIndex={-1}>{complete ? "Hoàn thành bài học!" : step.kind === "quiz" ? "Vận dụng" : step.title}</h3>
    {complete ? <p role="status">Em đã hoàn thành {steps.length} bước của bài học này.</p> :
      step.kind === "reading" ? <div className="studio-body">{step.text}</div> :
        <fieldset>
          <legend>{step.question}</legend>
          {step.options.map((label, index) => <label className="option" key={index}>
            <input type="radio" name={choices} checked={selected === index} onChange={() => {
              setSelected(index);
              setChecked(false);
            }} /><span>{label}</span>
          </label>)}
          <div aria-live="polite">
            {checked && <p className={checkedCorrect ? "feedback correct" : "feedback retry"}>
              {checkedCorrect ? "Chính xác! " + step.explanation : "Chưa đúng. Em hãy thử lại hoặc quay về bước trước để xem ví dụ."}
            </p>}
          </div>
        </fieldset>}
    <div className="studio-actions lesson-actions">
      <button type="button" className="button secondary" disabled={position.current === 0} onClick={() => navigate(position.current - 1)}>Bước trước</button>
      {complete ? <button type="button" className="button primary" onClick={() => navigate(0, true)}>Học lại</button> : <>
        {step.kind === "quiz" && !checkedCorrect && <button type="button" className="button secondary" disabled={selected === null || checked} onClick={() => setChecked(true)}>Kiểm tra</button>}
        <button type="button" className="button primary" disabled={step.kind === "quiz" && !checkedCorrect && position.current >= position.furthest} onClick={() => navigate(position.current + 1)}>
          {position.current === steps.length - 1 ? "Hoàn thành" : "Bước tiếp theo"}
        </button>
      </>}
    </div>
  </section>;
}
