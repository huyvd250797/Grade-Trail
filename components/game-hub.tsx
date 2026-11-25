"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { ArrowLeft, ArrowRight, Check, Gamepad2, Trophy } from "lucide-react";
import { getCurriculumSubjects } from "../lib/curriculum";
import { educationalGames, gameKinds, shuffleItems, type EducationalGame } from "../lib/educational-games";
import { grades, type Grade } from "../lib/lessons";
import { LessonPlayer } from "./lesson-player";

const storageKey = "gradetrail:games:v1";
const resultEvent = "gradetrail:games-change";
let sessionResults: string | undefined;

function getResults() {
  if (sessionResults !== undefined) return sessionResults;
  try { return window.localStorage.getItem(storageKey) ?? "[]"; } catch { return "[]"; }
}

function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(resultEvent, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(resultEvent, listener);
  };
}

function completedGames(value: string) {
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) return educationalGames.filter((game) => parsed.includes(game.id)).map((game) => game.id);
  } catch { /* Treat unreadable storage as empty. */ }
  return [];
}

function recordResult(id: string) {
  const next = JSON.stringify([...new Set([...completedGames(getResults()), id])]);
  try {
    window.localStorage.setItem(storageKey, next);
    sessionResults = undefined;
  } catch {
    sessionResults = next;
  }
  window.dispatchEvent(new Event(resultEvent));
}

const gameDetails = educationalGames.map((game) => {
  const subject = getCurriculumSubjects(game.grade).find((subject) =>
    subject.topics.some((topic) => topic.outcomes.some((outcome) => outcome.id === game.outcomeId)),
  );
  const topic = subject?.topics.find((topic) => topic.outcomes.some((outcome) => outcome.id === game.outcomeId));
  const outcome = topic?.outcomes.find((outcome) => outcome.id === game.outcomeId);
  return { game, subject: subject?.title, topic: topic?.title, outcome: outcome?.text };
});

export function GameHub({ gameId, initialGrade }: { gameId?: string; initialGrade?: Grade }) {
  const [grade, setGrade] = useState<Grade | null>(initialGrade ?? null);
  const done = completedGames(useSyncExternalStore(subscribe, getResults, () => "[]"));
  const detail = gameDetails.find(({ game }) => game.id === gameId);
  if (detail) return <GameScreen key={detail.game.id} detail={detail} completedBefore={done.includes(detail.game.id)} />;

  const visible = gameDetails.filter(({ game }) => grade === null || game.grade === grade);
  return <section className="inner-view games" aria-labelledby="games-title">
    <header className="games-heading">
      <div><h1 id="games-title">Trò chơi học tập</h1><p className="section-intro">Luyện kiến thức theo khối lớp qua ghép cặp, sắp xếp và trắc nghiệm.</p></div>
      <span className="game-total"><Trophy size={18} aria-hidden="true" /> {done.length}/{educationalGames.length} trò đã hoàn thành</span>
    </header>
    {gameId && <p className="studio-error" role="status">Không tìm thấy trò chơi. Hãy chọn một trò dưới đây.</p>}
    <label className="game-filter">Khối lớp<select value={grade ?? ""} onChange={(event) => {
      setGrade(grades.find((grade) => String(grade) === event.target.value) ?? null);
    }}>
      <option value="">Tất cả lớp</option>
      {grades.map((grade) => <option key={grade} value={grade}>Lớp {grade}</option>)}
    </select></label>
    <div className="game-grid">
      {visible.map(({ game, subject, topic }) => <article key={game.id} className="studio-panel game-card">
        <div className="game-card-label"><Gamepad2 size={19} aria-hidden="true" /><span>Lớp {game.grade} · {subject}</span></div>
        <h2>{game.title}</h2>
        <p>{gameKinds[game.kind]} · {topic}</p>
        <div className="game-card-actions">
          {done.includes(game.id) && <span className="game-solved"><Check size={16} aria-hidden="true" /> Đã hoàn thành</span>}
          <a className="button primary" href={"#tro-choi/" + game.id}>{done.includes(game.id) ? "Chơi lại" : "Chơi"} <ArrowRight size={15} /></a>
        </div>
      </article>)}
    </div>
  </section>;
}

function GameScreen({ detail, completedBefore }: { detail: (typeof gameDetails)[number]; completedBefore: boolean }) {
  const { game, subject, topic, outcome } = detail;
  const [attempt, setAttempt] = useState<{ round: number; order: number[]; left: number[] }>();
  const [finished, setFinished] = useState(false);
  const panelHeading = useRef<HTMLHeadingElement>(null);

  function start() {
    const count = game.kind === "match" ? game.pairs.length : game.kind === "order" ? game.items.length : game.questions.length;
    const order = shuffleItems(count);
    const left = game.kind === "match" ? shuffleItems(count) : [];
    if (left.length && left.every((item, index) => item === order[index])) left.push(left.shift()!);
    setAttempt({ round: (attempt?.round ?? 0) + 1, order, left });
    setFinished(false);
    panelHeading.current?.focus();
  }

  function complete() {
    recordResult(game.id);
    setFinished(true);
    panelHeading.current?.focus();
  }

  const criterion = {
    match: "Ghép đúng tất cả các cặp.",
    order: "Xếp đúng toàn bộ thứ tự.",
    quiz: "Trả lời đúng tất cả câu hỏi. Có thể thử lại từng câu.",
  }[game.kind];

  return <section className="inner-view games game-screen" aria-labelledby="game-title">
    <a className="back-link" href={"#tro-choi-" + game.grade}><ArrowLeft size={16} /> Về trò chơi lớp {game.grade}</a>
    <div className="games-heading">
      <div><p className="eyebrow">Lớp {game.grade} · {subject} · {gameKinds[game.kind]}</p>
      <h1 id="game-title">{game.title}</h1></div>
      {completedBefore && <span className="game-solved"><Check size={16} aria-hidden="true" /> Đã hoàn thành</span>}
    </div>
    <div className="studio-panel game-objective">
      <h2>{topic}</h2><p>{outcome}</p>
      <p><strong>Để hoàn thành</strong> · {criterion}</p>
      <a className="curriculum-resource" href={"#chuong-trinh-" + game.grade}>Xem chương trình lớp {game.grade}</a>
    </div>
    <div className="game-round">
      <h2 ref={panelHeading} tabIndex={-1}>{finished ? "Hoàn thành trò chơi!" : "Lượt chơi"}</h2>
      {finished ? <div className="studio-panel game-result">
        <Trophy size={26} aria-hidden="true" />
        <p role="status">Em đã đạt mục tiêu của trò chơi này.</p>
        {game.kind === "order" && <p>{game.explanation}</p>}
        <button className="button primary" type="button" onClick={start}>Chơi lại</button>
      </div> : !attempt ? <button className="button primary" type="button" onClick={start}>Bắt đầu</button> :
        game.kind === "quiz" ? <LessonPlayer key={attempt.round} steps={attempt.order.map((index) => game.questions[index])} onComplete={complete} /> :
        <GameBoard key={attempt.round} game={game} order={attempt.order} left={attempt.left} onComplete={complete} />}
    </div>
  </section>;
}

function GameBoard({ game, order, left, onComplete }: {
  game: Extract<EducationalGame, { kind: "match" | "order" }>;
  order: number[]; left: number[]; onComplete: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [solved, setSolved] = useState<number[]>([]);
  const [feedback, setFeedback] = useState("");
  const match = game.kind === "match";
  const count = match ? game.pairs.length : game.items.length;

  function check(index: number) {
    if (solved.includes(index)) return;
    const correct = match ? selected === index : solved.length === index;
    if (!correct) {
      setFeedback(match ? "Cặp này chưa đúng. Em hãy chọn đáp án khác." : "Mục này chưa đúng vị trí. Em hãy thử chọn mục khác.");
      return;
    }
    setSelected(null);
    setFeedback(match ? `Đúng! ${game.pairs[index][0]} ghép với ${game.pairs[index][1]}.` : `Đúng! ${game.items[index]} ở vị trí ${solved.length + 1}.`);
    setSolved([...solved, index]);
    if (solved.length + 1 === count) onComplete();
  }

  return <div className="studio-panel">
    <p>{match ? "Chọn một thẻ bên trái rồi chọn thẻ tương ứng bên phải." : game.prompt}</p>
    <div className="lesson-progress">
      <span>{solved.length}/{count} đã đúng</span>
      <progress value={solved.length} max={count} aria-label="Tiến độ lượt chơi" />
    </div>
    {match ? <div className="game-match">
      <div className="game-tiles" aria-label="Thẻ câu hỏi">{left.map((index) => <button className="game-tile" type="button" key={index}
        aria-pressed={selected === index} disabled={solved.includes(index)} onClick={() => { setSelected(index); setFeedback(""); }}>{game.pairs[index][0]}</button>)}</div>
      <div className="game-tiles" aria-label="Thẻ đáp án">{order.map((index) => <button className="game-tile" type="button" key={index}
        disabled={selected === null || solved.includes(index)} onClick={() => check(index)}>{game.pairs[index][1]}</button>)}</div>
    </div> : <>
      <div className="game-tiles game-order">{order.map((index) => <button className="game-tile" type="button" key={index}
        disabled={solved.includes(index)} onClick={() => check(index)}>{game.items[index]}</button>)}</div>
      {solved.length > 0 && <ol className="game-sequence" aria-label="Thứ tự đã chọn">{solved.map((index) => <li key={index}>{game.items[index]}</li>)}</ol>}
    </>}
    <p className="game-feedback" role="status">{feedback}</p>
  </div>;
}
