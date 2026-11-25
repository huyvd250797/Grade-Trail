"use client";

import { practiceTopics } from "../lib/adaptive-practice";
import { educationalGames } from "../lib/educational-games";
import { useState } from "react";
import { ArrowRight, BookOpen, ExternalLink, Search } from "lucide-react";
import { curriculumSources, curriculumVersion, getCurriculumSubjects, normalizeCurriculumSearch, subjectKinds } from "../lib/curriculum";
import { grades, type Grade } from "../lib/lessons";

export function CurriculumBrowser({ initialGrade }: { initialGrade: Grade }) {
  const [grade, setGrade] = useState(initialGrade);
  const [subjectId, setSubjectId] = useState("");
  const [search, setSearch] = useState("");
  const subjects = getCurriculumSubjects(grade);
  const terms = normalizeCurriculumSearch(search).split(/\s+/).filter(Boolean);
  const containsTerms = (value: string) => {
    const normalized = normalizeCurriculumSearch(value);
    return terms.every((term) => normalized.includes(term));
  };
  const visible = subjects.filter((subject) => !subjectId || subject.id === subjectId).flatMap((subject) => {
    const matchesSubject = containsTerms(subject.title);
    const topics = matchesSubject ? subject.topics : subject.topics.filter((topic) => containsTerms(
      [subject.title, topic.title, ...topic.outcomes.map((outcome) => outcome.text)].join(" "),
    ));
    return matchesSubject || topics.length ? [{ ...subject, topics }] : [];
  });
  const totalTopics = visible.reduce((total, subject) => total + subject.topics.length, 0);

  return <section className="inner-view curriculum" aria-labelledby="curriculum-title">
    <p className="eyebrow">Chương trình GDPT 2018 · Dữ liệu v{curriculumVersion}</p>
    <h1 id="curriculum-title">Chương trình học</h1>
    <p className="section-intro">Tra cứu môn học, chủ đề và yêu cầu cần đạt theo từng lớp. Bản này có các yêu cầu cần đạt tiêu biểu đã được tóm lược.</p>
    <div className="curriculum-filters">
      <label>Khối lớp
        <select value={grade} onChange={(event) => {
          const next = grades.find((item) => String(item) === event.target.value);
          if (next) {
            setGrade(next);
            setSubjectId("");
          }
        }}>
          {grades.map((item) => <option key={item} value={item}>Lớp {item}</option>)}
        </select>
      </label>
      <label>Môn và hoạt động
        <select value={subjectId} onChange={(event) => setSubjectId(event.target.value)}>
          <option value="">Tất cả môn và hoạt động</option>
          {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.title}</option>)}
        </select>
      </label>
      <label>Tìm trong chương trình<span className="curriculum-search">
        <Search size={17} aria-hidden="true" />
        <input type="search" placeholder="Tìm môn, chủ đề, yêu cầu" value={search} onChange={(event) => setSearch(event.target.value)} />
      </span></label>
    </div>
    <div className="curriculum-toolbar">
      <p role="status">{visible.length} môn và hoạt động · {totalTopics} chủ đề hiển thị</p>
      <a href={"#lop-" + grade}>Làm bài mẫu lớp {grade} <ArrowRight size={15} /></a>
    </div>
    {visible.length ? <div className="curriculum-list">
      {visible.map((subject) => <article key={subject.id} className="curriculum-subject">
        <header><h2><BookOpen size={19} aria-hidden="true" />{subject.title}</h2><span className="curriculum-kind">{subjectKinds[subject.kind]}</span></header>
        {subject.topics.length ? subject.topics.map((topic) => <details key={topic.id} className="curriculum-topic">
          <summary>{topic.title}</summary>
          <ul>{topic.outcomes.map((outcome) => {
            const game = educationalGames.find((item) => item.outcomeId === outcome.id);
            return <li key={outcome.id}>{outcome.text}<br />
              <a className="curriculum-resource" href={"#hoc-lieu/" + outcome.id}>Học liệu theo yêu cầu này</a>
              {game && <><br /><a className="curriculum-resource" href={"#tro-choi/" + game.id}>Chơi: {game.title}</a></>}
              {practiceTopics.some((item) => item.outcomeId === outcome.id) && <><br /><a className="curriculum-resource" href={"#on-tap/" + outcome.id}>Luyện tập chủ đề này</a></>}
            </li>;
          })}</ul>
        </details>) : <p className="curriculum-note">Chưa có chủ đề tóm lược cho mục này. Có thể xem văn bản nguồn bên dưới.</p>}
        <ul className="curriculum-sources" aria-label={"Nguồn đối chiếu môn " + subject.title}>
          {subject.sourceIds.map((id) => <li key={id}><a href={curriculumSources[id].url} target="_blank" rel="noreferrer">
            {curriculumSources[id].label} <ExternalLink size={12} aria-hidden="true" />
          </a></li>)}
        </ul>
      </article>)}
    </div> : <div className="empty-state">
      <h2>Không tìm thấy kết quả</h2>
      <button type="button" className="button secondary" onClick={() => { setSearch(""); setSubjectId(""); }}>Xóa bộ lọc</button>
    </div>}
    <details className="curriculum-references">
      <summary>Nguồn và phạm vi bộ dữ liệu</summary>
      <p>Danh mục theo khung chương trình quốc gia. Các nội dung địa phương, ngoại ngữ và tiếng dân tộc cụ thể phụ thuộc chương trình được tổ chức. Cấp THPT có môn lựa chọn và chuyên đề học tập riêng.</p>
      <ul className="curriculum-sources">{Object.values(curriculumSources).map((source) => <li key={source.url}>
        <a href={source.url} target="_blank" rel="noreferrer">{source.label} <ExternalLink size={12} aria-hidden="true" /></a>
      </li>)}</ul>
    </details>
  </section>;
}
