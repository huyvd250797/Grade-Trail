"use client";

import { useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowRight, RotateCcw, Target } from "lucide-react";
import { grades, type Grade } from "../lib/lessons";
import { practiceTopics, readReviewStats, recordPracticeAnswer, reviewQueue, type PracticeQuestion, type ReviewStats } from "../lib/adaptive-practice";

const storageKey = "gradetrail:practice:v1";
const changed = "gradetrail:practice-change";
let sessionStorageFallback: string | undefined;

function snapshot() {
  if (sessionStorageFallback !== undefined) return sessionStorageFallback;
  try { return window.localStorage.getItem(storageKey) ?? "{}"; } catch { return "{}"; }
}

function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(changed, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(changed, listener);
  };
}

function saveAnswer(question: PracticeQuestion, correct: boolean) {
  const next = JSON.stringify(recordPracticeAnswer(readReviewStats(snapshot()), question.id, correct, Date.now()));
  try {
    window.localStorage.setItem(storageKey, next);
    sessionStorageFallback = undefined;
  } catch {
    sessionStorageFallback = next;
  }
  window.dispatchEvent(new Event(changed));
}

type PracticeSession = { questions: PracticeQuestion[]; mode: "Luyện tập" | "Ôn tập" };

function makeSession(mode: PracticeSession["mode"], pool: PracticeQuestion[], stats: ReviewStats): PracticeSession {
  const now = Date.now();
  const ranked = reviewQueue(pool, stats, now);
  const due = ranked.filter((question) => stats[question.id]?.dueAt <= now);
  const questions = mode === "Luyện tập" ? pool : due.length ? due : ranked;
  return { mode, questions: questions.map((question) => {
    const indices = question.options.map((_, index) => index);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return { ...question, options: indices.map((index) => question.options[index]), correct: indices.indexOf(question.correct) };
  }) };
}

export function AdaptivePractice({ initialGrade, initialTopic }: { initialGrade?: Grade; initialTopic?: string }) {
  const seed = practiceTopics.find((topic) => topic.outcomeId === initialTopic);
  const [grade, setGrade] = useState<Grade>(seed?.grade ?? initialGrade ?? 1);
  const [subject, setSubject] = useState(seed?.subject ?? "");
  const [topicId, setTopicId] = useState(seed?.outcomeId ?? "");
  const [session, setSession] = useState<PracticeSession | null>(null);
  const stats = readReviewStats(useSyncExternalStore(subscribe, snapshot, () => "{}"));
  const gradeTopics = practiceTopics.filter((topic) => topic.grade === grade);
  const subjects = [...new Set(gradeTopics.map((topic) => topic.subject))];
  const subjectTopics = gradeTopics.filter((topic) => !subject || topic.subject === subject);
  const topics = subjectTopics.filter((topic) => !topicId || topic.outcomeId === topicId);
  const pool = topics.flatMap((topic) => topic.questions);

  function start(mode: PracticeSession["mode"]) {
    if (pool.length) setSession(makeSession(mode, pool, stats));
  }

  return <section className="inner-view review-view" aria-labelledby="review-title">
    <h1 id="review-title">Luyện tập &amp; ôn tập</h1>
    {session ? <PracticeRound session={session} close={() => setSession(null)} /> : <>
      <p className="section-intro">Chọn nội dung để luyện. Ôn tập ưu tiên câu đã làm sai và câu đến hạn.</p>
      <div className="review-filters">
        <label>Khối lớp<select value={grade} onChange={(event) => {
          const next = grades.find((item) => String(item) === event.target.value);
          if (next) { setGrade(next); setSubject(""); setTopicId(""); }
        }}>{grades.map((item) => <option key={item} value={item}>Lớp {item}</option>)}</select></label>
        <label>Môn học<select value={subject} onChange={(event) => { setSubject(event.target.value); setTopicId(""); }}>
          <option value="">Tất cả môn</option>{subjects.map((item) => <option key={item}>{item}</option>)}
        </select></label>
        <label>Chủ đề<select value={topicId} onChange={(event) => setTopicId(event.target.value)}>
          <option value="">Tất cả chủ đề</option>{subjectTopics.map((topic) => <option key={topic.outcomeId} value={topic.outcomeId}>{topic.title}</option>)}
        </select></label>
      </div>
      <div className="review-actions">
        <button className="button secondary" type="button" onClick={() => start("Luyện tập")}><Target size={17} /> Luyện tập</button>
        <button className="button primary" type="button" onClick={() => start("Ôn tập")}><RotateCcw size={17} /> Ôn tập ưu tiên</button>
      </div>
      <div className="review-topics">
        {topics.map((topic) => {
          const records = topic.questions.map((question) => stats[question.id]).filter(Boolean);
          const needsReview = records.filter((record) => record.streak === 0).length;
          const correctLatest = records.length - needsReview;
          return <article className="studio-panel" key={topic.outcomeId}>
            <p className="eyebrow">{topic.subject}</p>
            <h2>{topic.title}</h2><p>{topic.objective}</p>
            <p><strong>{correctLatest}/{topic.questions.length}</strong> câu đúng ở lần làm gần nhất</p>
            <p className={needsReview ? "review-needs" : "section-intro"}>{needsReview ? `${needsReview} câu cần luyện lại` : records.length ? "Không có câu sai gần nhất" : "Chưa luyện chủ đề này"}</p>
          </article>;
        })}
      </div>
    </>}
  </section>;
}

function PracticeRound({ session, close }: { session: PracticeSession; close: () => void }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const heading = useRef<HTMLHeadingElement>(null);
  const locked = useRef(false);
  const radioName = useId();
  const question = session.questions[index];
  const answered = results.length > index;
  const topic = question && practiceTopics.find((topic) => topic.outcomeId === question.outcomeId);

  useLayoutEffect(() => { heading.current?.focus(); }, [index]);

  function check() {
    if (!question || selected === null || locked.current) return;
    locked.current = true;
    const correct = selected === question.correct;
    saveAnswer(question, correct);
    setResults((previous) => [...previous, correct]);
  }

  function next() {
    locked.current = false;
    setSelected(null);
    setIndex((previous) => previous + 1);
  }

  return <div className="studio-panel review-round">
    <h2 ref={heading} tabIndex={-1}>{question ? `${session.mode} · Câu ${index + 1}/${session.questions.length}` : "Hoàn thành lượt luyện"}</h2>
    <div className="lesson-progress">
      <progress aria-label="Số câu đã trả lời" value={results.length} max={session.questions.length} />
    </div>
    {question ? <>
      <p className="eyebrow">{topic?.subject} · {topic?.title}</p>
      <fieldset disabled={answered}>
        <legend>{question.question}</legend>
        {question.options.map((option, choice) => <label className="option" key={option}>
          <input type="radio" name={radioName} checked={choice === selected} onChange={() => setSelected(choice)} />
          <span>{option}</span>
        </label>)}
      </fieldset>
      <div aria-live="polite">
        {answered && <p className={results[index] ? "feedback correct" : "feedback retry"}>
          {results[index] ? "Chính xác. " : `Chưa đúng. Đáp án: ${question.options[question.correct]}. `}{question.explanation}
        </p>}
      </div>
      <div className="studio-actions lesson-actions">
        <button className="button secondary" type="button" onClick={close}>Về danh sách</button>
        {answered ? <button className="button primary" type="button" onClick={next}>{index + 1 === session.questions.length ? "Xem kết quả" : "Câu tiếp theo"} <ArrowRight size={16} /></button> :
          <button className="button primary" type="button" onClick={check} disabled={selected === null}>Kiểm tra đáp án</button>}
      </div>
    </> : <>
      <p role="status">Em trả lời đúng <strong>{results.filter(Boolean).length}/{results.length}</strong> câu.</p>
      <ul className="review-breakdown">
        {[...new Set(session.questions.map((item) => item.outcomeId))].map((id) => {
          const indices = session.questions.flatMap((item, index) => item.outcomeId === id ? [index] : []);
          return <li key={id}>{practiceTopics.find((topic) => topic.outcomeId === id)?.title}: {indices.filter((index) => results[index]).length}/{indices.length} câu đúng</li>;
        })}
      </ul>
      {results.some((correct) => !correct) && <p>Các câu sai đã được đưa vào lượt ôn ưu tiên.</p>}
      <button className="button primary" type="button" onClick={close}>Về danh sách</button>
    </>}
  </div>;
}
