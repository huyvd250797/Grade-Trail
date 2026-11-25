"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, BookOpen, Check, ChevronRight, CircleHelp, Compass, Download, Gamepad2, GraduationCap, House, Layers3, MonitorDown, Radio, Smartphone, Sprout, Target, X } from "lucide-react";
import { ContentStudio, PublishedLibrary } from "./content-studio";
import { GradeOneMath } from "./grade-one-math";
import { AdaptivePractice } from "./adaptive-practice";
import { GameHub } from "./game-hub";
import { LessonPlayer } from "./lesson-player";
import { CurriculumBrowser } from "./curriculum-browser";
import { grades, lessons, stages, type Grade } from "../lib/lessons";

const storageKey = "nachoc:study:v1";
const localEvent = "nachoc:study-change";
const emptyProgress = { lastGrade: null, done: [] };
let temporaryProgress: string | undefined;

type Progress = { lastGrade: Grade | null; done: Grade[] };
type InstallEvent = Event & { prompt: () => Promise<unknown> };

function subscribeProgress(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(localEvent, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(localEvent, callback);
  };
}

function progressSnapshot() {
  if (temporaryProgress !== undefined) return temporaryProgress;
  try {
    return localStorage.getItem(storageKey) ?? "";
  } catch {
    return "";
  }
}

function isGrade(value: unknown): value is Grade {
  return typeof value === "number" && grades.some((grade) => grade === value);
}

function readProgress(raw: string): Progress {
  if (!raw) return emptyProgress;
  try {
    const value = JSON.parse(raw) as Partial<Progress> | null;
    return {
      lastGrade: isGrade(value?.lastGrade) ? value.lastGrade : null,
      done: Array.isArray(value?.done) ? [...new Set(value.done.filter(isGrade))] : [],
    };
  } catch {
    return emptyProgress;
  }
}

function saveProgress(update: (existing: Progress) => Progress) {
  const next = JSON.stringify(update(readProgress(progressSnapshot())));
  try {
    localStorage.setItem(storageKey, next);
    temporaryProgress = undefined;
  } catch {
    temporaryProgress = next;
  }
  window.dispatchEvent(new Event(localEvent));
}

function subscribeHash(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

function getHash() {
  return window.location.hash;
}

function Brand() {
  return <a className="brand" href="#" aria-label="Grade Trail, trang chủ">
    <span className="brand-mark"><span /></span>
    <span>Grade<span className="brand-accent"> Trail</span></span>
  </a>;
}

function HeroArtwork() {
  return <div className="hero-art" aria-hidden="true">
    <div className="orbit orbit-outer" />
    <div className="orbit orbit-inner" />
    <div className="art-spark spark-top">✦</div><div className="art-spark spark-right">✧</div>
    <div className="art-dot dot-left" /><div className="art-dot dot-right" />
    <div className="art-cube"><span /><span /><span /></div>
    <div className="book book-bottom"><span className="book-pages" /><span className="book-cover" /></div>
    <div className="book book-middle"><span className="book-pages" /><span className="book-cover" /></div>
    <div className="book book-top"><span className="book-pages" /><span className="book-cover"><i /><i /><i /></span></div>
    <div className="art-spark spark-bottom">✦</div>
  </div>;
}

function Practice({ grade, done }: { grade: Grade; done: boolean }) {
  const lesson = lessons[grade];
  return <section className="practice" aria-labelledby="lesson-title">
    <div className="practice-links"><a href="#lop" className="back-link"><ArrowLeft size={17} /> Quay lại chọn lớp</a><a href={"#chuong-trinh-" + grade} className="back-link">Chương trình lớp {grade} <ArrowRight size={16} /></a><a href={"#tro-choi-" + grade} className="back-link">Trò chơi lớp {grade} <Gamepad2 size={16} /></a><a href={"#on-tap-" + grade} className="back-link">Luyện tập lớp {grade} <Target size={16} /></a></div>
    <div className="practice-heading">
      <p className="eyebrow">Lớp {grade} <span>·</span> {lesson.subject} <span>·</span> Bài mẫu</p>
      <h1 id="lesson-title">{lesson.title}</h1>
      {done && <p className="lesson-done"><Check size={17} /> Đã hoàn thành bài này</p>}
    </div>
    {grade === 1 && <a className="button primary" href="#toan-lop-1">Mở lộ trình Toán lớp 1 <ArrowRight size={16} /></a>}
    <LessonPlayer storageId={"sample:" + grade} steps={[
      { kind: "reading", title: "Ghi nhớ", text: lesson.concept },
      { kind: "quiz", question: lesson.question, options: lesson.options, correct: lesson.correct, explanation: lesson.explanation },
    ]} onComplete={() => saveProgress((existing) => ({ lastGrade: grade, done: [...new Set([...existing.done, grade])] }))} />
  </section>;
}

export function StudySpace() {
  const hash = useSyncExternalStore(subscribeHash, getHash, () => "");
  const progress = readProgress(useSyncExternalStore(subscribeProgress, progressSnapshot, () => ""));
  const candidate = /^#lop-(\d+)$/.exec(hash);
  const gradeNumber = candidate ? Number(candidate[1]) : null;
  const grade = isGrade(gradeNumber) ? gradeNumber : null;
  const curriculumMatch = /^#chuong-trinh(?:-(\d+))?$/.exec(hash);
  const curriculumGrade = Number(curriculumMatch?.[1]);
  const libraryMatch = /^#hoc-lieu(?:\/([a-z0-9-]+))?$/.exec(hash);
  const gameMatch = /^#tro-choi(?:\/([a-z0-9-]+)|-(\d+))?$/.exec(hash);
  const gameGrade = Number(gameMatch?.[2]);
  const reviewMatch = /^#on-tap(?:\/([a-z0-9-]+)|-(\d+))?$/.exec(hash);
  const reviewGrade = Number(reviewMatch?.[2]);
  const mathMatch = /^#toan-lop-1(?:\/([a-z0-9-]+))?$/.exec(hash);
  const active = mathMatch ? "math" : reviewMatch ? "review" : gameMatch ? "games" : hash === "#studio" ? "studio" : libraryMatch ? "library" : curriculumMatch ? "curriculum" : hash === "#lop" || grade ? "grades" : hash === "#tien-do" ? "progress" : "home";
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);
  const [offlineReady, setOfflineReady] = useState(false);
  const [installed, setInstalled] = useState(false);
  const installDialog = useRef<HTMLDialogElement>(null);
  const main = useRef<HTMLElement>(null);
  const viewKey = active === "curriculum" || active === "library" || active === "games" || active === "review" || active === "math" ? hash : grade ?? active;
  const lastView = useRef(viewKey);

  useEffect(() => {
    if (lastView.current === viewKey) return;
    lastView.current = viewKey;
    main.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [viewKey]);

  useEffect(() => {
    if (grade !== null) saveProgress((existing) => ({ ...existing, lastGrade: grade }));
  }, [grade]);

  useEffect(() => {
    let active = true;
    const capture = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallEvent);
    };
    const onInstalled = () => { setInstalled(true); setInstallEvent(null); };
    const standalone = window.matchMedia("(display-mode: standalone)");
    const updateDisplay = () => setInstalled(standalone.matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);
    updateDisplay();
    standalone.addEventListener("change", updateDisplay);
    window.addEventListener("beforeinstallprompt", capture);
    window.addEventListener("appinstalled", onInstalled);

    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js")
        .then(() => navigator.serviceWorker.ready)
        .then(() => { if (active) setOfflineReady(true); })
        .catch(() => { if (active) setOfflineReady(false); });
    }

    return () => {
      active = false;
      standalone.removeEventListener("change", updateDisplay);
      window.removeEventListener("beforeinstallprompt", capture);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function showInstall() {
    if (installEvent && !installed) {
      try {
        await installEvent.prompt();
        setInstallEvent(null);
        return;
      } catch {
        setInstallEvent(null);
      }
    }
    installDialog.current?.showModal();
  }

  return <>
    <a className="skip-link" href="#noi-dung" onClick={(event) => { event.preventDefault(); main.current?.focus(); }}>Đến nội dung</a>
    <aside className="sidebar" aria-label="Thanh điều hướng">
      <Brand />
      <nav className="nav" aria-label="Điều hướng chính">
        <a href="#" aria-current={active === "home" ? "page" : undefined}><House size={19} /> <span>Trang chủ</span></a>
        <a href="#lop" aria-current={(active === "grades" || active === "math") ? "page" : undefined}><Compass size={19} /> <span>Khám phá lớp</span></a>
        <a href="#chuong-trinh" aria-current={active === "curriculum" ? "page" : undefined}><Layers3 size={19} /> <span>Chương trình</span></a>
        <a href="#hoc-lieu" aria-current={active === "library" || active === "studio" ? "page" : undefined}><BookOpen size={19} /> <span>Học liệu</span></a>
        <a href="#tro-choi" aria-current={active === "games" ? "page" : undefined}><Gamepad2 size={19} /> <span>Trò chơi</span></a>
        <a href="#on-tap" aria-current={active === "review" ? "page" : undefined}><Target size={19} /> <span>Ôn tập</span></a>
        <a href="#tien-do" aria-current={active === "progress" ? "page" : undefined}><BookOpen size={19} /> <span>Tiến độ của em</span></a>
      </nav>
      <div className="sidebar-bottom">
        <button type="button" className="sidebar-install" onClick={showInstall}><Download size={18} /> Cài ứng dụng</button>
        <p>Grade Trail <span>·</span> V0.6.1</p>
      </div>
    </aside>
    <div className="workspace">
      <header className="topbar">
        <div className="compact-brand"><Brand /></div>
        <p className="breadcrumb"><span>Không gian học tập</span><ChevronRight size={15} />{active === "home" ? "Trang chủ" : active === "grades" ? grade ? "Lớp " + grade : "Khám phá lớp" : active === "curriculum" ? "Chương trình" : active === "studio" ? "Studio" : active === "library" ? "Học liệu" : active === "games" ? "Trò chơi" : active === "review" ? "Ôn tập" : active === "math" ? "Toán lớp 1" : "Tiến độ của em"}</p>
        <button className="install-button" type="button" onClick={showInstall}><Download size={16} /> <span>{installed ? "Ứng dụng" : "Cài ứng dụng"}</span></button>
      </header>
      <main ref={main} tabIndex={-1} id="noi-dung" className="main">
        {active === "home" && <>
          <section className="hero" aria-labelledby="home-title">
            <div className="hero-copy">
              <p className="hero-kicker"><span /> TỰ HỌC TỪ LỚP 1 ĐẾN LỚP 12</p>
              <h1 id="home-title">Học từng bước,<br /><em>hiểu từng bài.</em></h1>
              <p>Chọn lớp của em, đọc phần ghi nhớ và thử sức với một bài luyện tập ngắn.</p>
              <div className="hero-actions">
                <a className="button primary" href={progress.lastGrade ? "#lop-" + progress.lastGrade : "#lop"}>{progress.lastGrade ? "Tiếp tục học" : "Bắt đầu học"} <ArrowRight size={18} /></a>
                <a className="button secondary" href="#toan-lop-1">Toán lớp 1</a>
                <a className="text-button" href="#chuong-trinh">Xem chương trình <ArrowDown size={15} /></a>
              </div>
            </div>
            <HeroArtwork />
          </section>
          <GradeGrid done={progress.done} />
        </>}
        {active === "grades" && (grade ? <Practice key={grade} grade={grade} done={progress.done.includes(grade)} /> :
          <div className="inner-view"><GradeGrid done={progress.done} full /></div>)}
        {active === "curriculum" && <CurriculumBrowser key={hash} initialGrade={isGrade(curriculumGrade) ? curriculumGrade : progress.lastGrade ?? 1} />}
        {active === "games" && <GameHub key={hash} gameId={gameMatch?.[1]} initialGrade={isGrade(gameGrade) ? gameGrade : undefined} />}
        {active === "review" && <AdaptivePractice key={hash} initialTopic={reviewMatch?.[1]} initialGrade={isGrade(reviewGrade) ? reviewGrade : progress.lastGrade ?? 1} />}
        {active === "math" && <GradeOneMath lessonId={mathMatch?.[1]} />}
        {active === "studio" && <ContentStudio />}
        {active === "library" && <PublishedLibrary key={hash} outcomeId={libraryMatch?.[1]} />}
        {active === "progress" && <section className="inner-view progress-view" aria-labelledby="progress-title">
          <p className="eyebrow">Luyện tập</p>
          <h1 id="progress-title">Tiến độ của em</h1>
          <p className="section-intro">Tiến độ bài mẫu được lưu trên thiết bị này.</p>
          <div className="progress-summary">
            <div><strong>{progress.done.length} / {grades.length}</strong><span>Bài mẫu đã hoàn thành</span></div>
            <progress value={progress.done.length} max={grades.length} aria-label="Số bài mẫu đã hoàn thành" />
          </div>
          {progress.done.length ? <ul className="completed-list">{grades.filter((item) => progress.done.includes(item)).map((item) =>
            <li key={item}><a href={"#lop-" + item}><Check size={18} /><span><strong>{lessons[item].title}</strong><small>Lớp {item} · {lessons[item].subject}</small></span><ArrowRight size={17} /></a></li>
          )}</ul> : <div className="empty-state"><BookOpen size={26} /><h2>Em chưa hoàn thành bài mẫu nào</h2><a href="#lop" className="button primary">Chọn lớp <ArrowRight size={16} /></a></div>}
        </section>}
        <footer className="footer"><span>Grade Trail · V0.6.1</span><span><Radio size={15} aria-hidden="true" /> {offlineReady ? "Sẵn sàng học ngoại tuyến" : "Học trực tiếp trên trình duyệt"}</span></footer>
      </main>
    </div>
    <dialog ref={installDialog} className="install-dialog" aria-labelledby="install-title">
      <div className="dialog-heading"><h2 id="install-title">Cài Grade Trail</h2><button type="button" className="icon-button" onClick={() => installDialog.current?.close()} aria-label="Đóng"><X size={21} /></button></div>
      {installed ? <p>Grade Trail đang mở ở chế độ ứng dụng.</p> : <>
        <p><Smartphone size={20} /><span><strong>iPhone / iPad</strong>Mở trong Safari, chạm Chia sẻ → Thêm vào MH chính.</span></p>
        <p><MonitorDown size={20} /><span><strong>Android và máy tính</strong>Mở menu trình duyệt và chọn Cài đặt ứng dụng hoặc Thêm vào màn hình chính nếu có.</span></p>
      </>}
      <p><CircleHelp size={20} />{offlineReady ? "Có thể xem chương trình và mở bài mẫu khi mất mạng." : "Mở app qua HTTPS và chờ bộ nhớ ngoại tuyến chuẩn bị xong."}</p>
    </dialog>
  </>;
}

function GradeGrid({ done, full = false }: { done: Grade[]; full?: boolean }) {
  const icons = [Sprout, Layers3, GraduationCap];
  const title = full ? <h1 id="grade-title">Chọn lớp của em</h1> : <h2 id="grade-title">Chọn lớp của em</h2>;
  return <section id="cac-cap-hoc" className="grade-section" aria-labelledby="grade-title">
    <div className="grade-heading">
      <div>{title}<p>Mỗi lớp có một bài mẫu để em học thử.</p></div>
      <span className="grade-count"><Layers3 size={16} /> 12 khối lớp</span>
    </div>
    <div className="grade-grid">
      {stages.map((stage, index) => {
        const Icon = icons[index];
        return <article className={"stage " + stage.id} key={stage.id}>
          <div className="stage-top"><span className="stage-icon"><Icon size={24} strokeWidth={1.9} /></span><span className="stage-range">{stage.range}</span></div>
          <h3>{stage.name}</h3><p>{stage.description}</p>
          <div className="grade-links">
            {stage.grades.map((grade) => <a key={grade} href={"#lop-" + grade} aria-label={"Lớp " + grade + (done.includes(grade) ? ", đã hoàn thành bài mẫu" : "")}>Lớp {grade}{done.includes(grade) && <Check size={13} aria-hidden="true" />}</a>)}
          </div>
        </article>;
      })}
    </div>
  </section>;
}
