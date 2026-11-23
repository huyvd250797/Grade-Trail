import type { Grade } from "./lessons";
import { outcomesByGrade } from "./curriculum-outcomes";

export const curriculumVersion = "1.0.0";
export const curriculumSources = {
  plan: { label: "Chương trình tổng thể (Bộ GDĐT)", url: "https://moet.gov.vn/content/vanban/Lists/VBPQ/Attachments/1483/vbhn-chuong-trinh-tong-the.pdf" },
  base: { label: "Thông tư 32/2018/TT-BGDĐT", url: "https://vbpl.moj.gov.vn/bogiaoducdaotao/Pages/vbpq-toanvan.aspx?ItemID=146721" },
  subjects: { label: "Các chương trình môn học kèm theo Thông tư 32/2018", url: "https://thptchucdong.hanoi.edu.vn/hoat-dong-chuyen-mon/chuong-trinh-giao-duc-pho-thong-2018-kem-theo-thong-tu-32/ctmb/20374/19483" },
  update2022: { label: "Thông tư 13/2022/TT-BGDĐT", url: "https://vanban.chinhphu.vn/?docid=206343&pageid=27160" },
  update2025: { label: "Thông tư 17/2025/TT-BGDĐT", url: "https://vanban.chinhphu.vn/?docid=215347&pageid=27160" },
  defence: { label: "Thông tư 46/2020/TT-BGDĐT", url: "https://vanban.chinhphu.vn/?docid=201927&pageid=27160" },
  languages: { label: "Chương trình Ngoại ngữ 1 theo Thông tư 19/2021", url: "https://vanban.chinhphu.vn/default.aspx?docid=203762&pageid=27160" },
} as const;

type SourceId = keyof typeof curriculumSources;
type SubjectKind = "required" | "choice" | "optional";
export const subjectKinds: Record<SubjectKind, string> = {
  required: "Bắt buộc", choice: "Lựa chọn", optional: "Tự chọn",
};
type SubjectRule = {
  id: string; title: string; from: Grade; to: Grade; kind: SubjectKind; sourceIds: SourceId[];
};
const subjects: SubjectRule[] = [
  { id: "math", title: "Toán", from: 1, to: 12, kind: "required", sourceIds: ["subjects"] },
  { id: "language", title: "Tiếng Việt", from: 1, to: 5, kind: "required", sourceIds: ["subjects"] },
  { id: "language", title: "Ngữ văn", from: 6, to: 12, kind: "required", sourceIds: ["subjects"] },
  { id: "english", title: "Tiếng Anh (làm quen)", from: 1, to: 2, kind: "optional", sourceIds: ["subjects"] },
  { id: "foreign-1", title: "Ngoại ngữ 1", from: 3, to: 12, kind: "required", sourceIds: ["subjects", "languages"] },
  { id: "foreign-2", title: "Ngoại ngữ 2", from: 6, to: 12, kind: "optional", sourceIds: ["subjects"] },
  { id: "minority-language", title: "Tiếng dân tộc thiểu số", from: 1, to: 12, kind: "optional", sourceIds: ["plan"] },
  { id: "ethics", title: "Đạo đức", from: 1, to: 5, kind: "required", sourceIds: ["subjects"] },
  { id: "civics", title: "Giáo dục công dân", from: 6, to: 9, kind: "required", sourceIds: ["subjects"] },
  { id: "nature-society", title: "Tự nhiên và Xã hội", from: 1, to: 3, kind: "required", sourceIds: ["subjects"] },
  { id: "primary-science", title: "Khoa học", from: 4, to: 5, kind: "required", sourceIds: ["subjects"] },
  { id: "science", title: "Khoa học tự nhiên", from: 6, to: 9, kind: "required", sourceIds: ["subjects"] },
  { id: "history-geography", title: "Lịch sử và Địa lí", from: 4, to: 9, kind: "required", sourceIds: ["subjects", "update2025"] },
  { id: "computing-technology", title: "Tin học và Công nghệ", from: 3, to: 5, kind: "required", sourceIds: ["subjects"] },
  { id: "computing", title: "Tin học", from: 6, to: 9, kind: "required", sourceIds: ["subjects"] },
  { id: "technology", title: "Công nghệ", from: 6, to: 9, kind: "required", sourceIds: ["subjects"] },
  { id: "physical", title: "Giáo dục thể chất", from: 1, to: 12, kind: "required", sourceIds: ["subjects"] },
  { id: "arts", title: "Nghệ thuật (Âm nhạc, Mĩ thuật)", from: 1, to: 9, kind: "required", sourceIds: ["subjects"] },
  { id: "experience", title: "Hoạt động trải nghiệm", from: 1, to: 5, kind: "required", sourceIds: ["subjects"] },
  { id: "experience", title: "Hoạt động trải nghiệm, hướng nghiệp", from: 6, to: 12, kind: "required", sourceIds: ["subjects"] },
  { id: "local", title: "Nội dung giáo dục của địa phương", from: 6, to: 12, kind: "required", sourceIds: ["plan"] },
  { id: "history", title: "Lịch sử", from: 10, to: 12, kind: "required", sourceIds: ["update2022", "update2025"] },
  { id: "defence", title: "Giáo dục quốc phòng và an ninh", from: 10, to: 12, kind: "required", sourceIds: ["defence"] },
  { id: "geography", title: "Địa lí", from: 10, to: 12, kind: "choice", sourceIds: ["subjects", "update2025"] },
  { id: "economics-law", title: "Giáo dục kinh tế và pháp luật", from: 10, to: 12, kind: "choice", sourceIds: ["subjects", "update2025"] },
  { id: "physics", title: "Vật lí", from: 10, to: 12, kind: "choice", sourceIds: ["subjects"] },
  { id: "chemistry", title: "Hoá học", from: 10, to: 12, kind: "choice", sourceIds: ["subjects"] },
  { id: "biology", title: "Sinh học", from: 10, to: 12, kind: "choice", sourceIds: ["subjects"] },
  { id: "technology", title: "Công nghệ", from: 10, to: 12, kind: "choice", sourceIds: ["subjects", "update2022"] },
  { id: "computing", title: "Tin học", from: 10, to: 12, kind: "choice", sourceIds: ["subjects", "update2022"] },
  { id: "music", title: "Âm nhạc", from: 10, to: 12, kind: "choice", sourceIds: ["subjects"] },
  { id: "art", title: "Mĩ thuật", from: 10, to: 12, kind: "choice", sourceIds: ["subjects"] },
];

export function getCurriculumSubjects(grade: Grade) {
  return subjects.filter((subject) => grade >= subject.from && grade <= subject.to).map((subject) => ({
    ...subject,
    topics: (outcomesByGrade[grade][subject.id] ?? []).map(([code, title, outcomes]) => ({
      id: `vn-gdpt2018-${grade}-${subject.id}-${code}`,
      title,
      outcomes: [{ id: `vn-gdpt2018-${grade}-${subject.id}-${code}-01`, text: outcomes }],
    })),
  }));
}

export function normalizeCurriculumSearch(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/đ/g, "d").trim();
}
