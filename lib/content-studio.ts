import { createClient } from "@supabase/supabase-js";
import { getCurriculumSubjects } from "./curriculum";
import { grades } from "./lessons";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const studioClient = url && key ? createClient(url, key) : null;

export type StudioRole = "author" | "reviewer";
export type LessonStatus = "draft" | "in_review" | "returned" | "published";
export type Draft = { title: string; summary: string; body: string; outcome_id: string };
export type PublishedLesson = Draft & { id: string; published_at: string };
export type StudioLesson = Draft & {
  id: string;
  status: LessonStatus;
  revision: number;
  review_note: string;
  updated_at: string;
};

export const lessonStatus: Record<LessonStatus, string> = {
  draft: "Bản nháp",
  in_review: "Chờ duyệt",
  returned: "Cần chỉnh sửa",
  published: "Đã xuất bản",
};

export const studioOutcomes = grades.flatMap((grade) => getCurriculumSubjects(grade).flatMap((subject) =>
  subject.topics.flatMap((topic) => topic.outcomes.map((outcome) => ({
    ...outcome, grade, subject: subject.title, topic: topic.title,
  }))),
));
export const studioOutcomeById = new Map(studioOutcomes.map((outcome) => [outcome.id, outcome]));

export function studioError(message: string) {
  if (message.includes("STUDIO_STALE")) return "Bài đã được thay đổi ở phiên khác hoặc không còn ở trạng thái phù hợp. Hãy tải lại danh sách.";
  if (message.includes("STUDIO_FORBIDDEN")) return "Tài khoản không có quyền thực hiện thao tác này.";
  if (message.includes("STUDIO_NOTE_REQUIRED")) return "Nhập lý do để tác giả biết phần cần chỉnh sửa.";
  if (message.includes("STUDIO_OUTCOME_INVALID")) return "Yêu cầu cần đạt chưa có trong dữ liệu Supabase.";
  return "Không thể hoàn thành thao tác. Kiểm tra kết nối hoặc cấu hình Studio rồi thử lại.";
}
