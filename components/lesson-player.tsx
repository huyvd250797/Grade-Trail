"use client";

import { useId, useRef, useState } from "react";
import { LessonAudio } from "./lesson-audio";
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
  const [tiles, setTiles] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const title = useRef<HTMLHeadingElement>(null);
  const choices = useId();
  const step = steps[position.current];
  const complete = position.current === steps.length;
  const scored = step?.kind === "quiz" || step?.kind === "assembly";
  const correct = step?.kind === "assembly"
    ? tiles.length === step.answer.length && step.answer.every((tile, index) => tile === tiles[index])
    : step?.kind === "quiz" && selected === step.correct;
  const ready = step?.kind === "assembly" ? tiles.length === step.answer.length : selected !== null;
  const checkedCorrect = checked && correct;

  function navigate(index: number, reset = false) {
    const next = { current: index, furthest: reset ? 0 : Math.max(index, position.furthest) };
    setPosition(next);
    setSelected(null);
    setTiles([]);
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
    <h3 ref={title} tabIndex={-1}>{complete ? "Hoàn thành bài học!" : step.kind === "reading" ? step.title : step.kind === "assembly" ? "Ghép chữ" : "Vận dụng"}</h3>
    {complete ? <p role="status">Em đã hoàn thành {steps.length} bước của bài học này.</p> :
      step.kind === "reading" ? <>
        <div className={step.audioText ? "studio-body vietnamese-reading" : "studio-body"}>{step.text}</div>
        {step.audioText && <LessonAudio key={position.current} text={step.audioText} />}
      </> : <fieldset>
        <legend>{step.question}</legend>
        {step.kind === "assembly" ? <>
          <p className="letter-result" aria-live="polite">
            {checkedCorrect ? step.result : tiles.map((tile) => step.tiles[tile]).join(" + ") || "Chọn các thẻ bên dưới"}
          </p>
          <div className="letter-tiles">
            {step.tiles.map((label, index) => <button type="button" className="button secondary" key={index}
              disabled={tiles.includes(index) || tiles.length >= step.answer.length}
              onClick={() => { setTiles([...tiles, index]); setChecked(false); }}>{label}</button>)}
            <button type="button" className="button secondary" disabled={!tiles.length} onClick={() => {
              setTiles(tiles.slice(0, -1));
              setChecked(false);
            }}>Bỏ thẻ cuối</button>
          </div>
        </> : step.options.map((label, index) => <label className="option" key={index}>
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
        {scored && !checkedCorrect && <button type="button" className="button secondary" disabled={!ready || checked} onClick={() => setChecked(true)}>Kiểm tra</button>}
        <button type="button" className="button primary" disabled={scored && !checkedCorrect && position.current >= position.furthest} onClick={() => navigate(position.current + 1)}>
          {position.current === steps.length - 1 ? "Hoàn thành" : "Bước tiếp theo"}
        </button>
      </>}
    </div>
  </section>;
}
