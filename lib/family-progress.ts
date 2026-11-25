import { gradeOneMath } from "./grade-one-math";
import { gradeOneVietnamese, vietnameseRoute } from "./grade-one-vietnamese";
import { readLessonPosition, type LessonPosition } from "./lesson-engine";

export const familyRoute = "#gia-dinh";
export const familySubjects = [
  { key: "math", title: "Toán lớp 1", route: "#toan-lop-1", lessons: gradeOneMath, legacy: "gradetrail:grade-one-math:v1", prefix: "grade-one-math:" },
  { key: "vietnamese", title: "Tiếng Việt lớp 1", route: vietnameseRoute, lessons: gradeOneVietnamese, legacy: "gradetrail:grade-one-vietnamese:v1", prefix: "grade-one-vietnamese:" },
] as const;

export type FamilyStudent = { id: string; display_name: string; grade: number };
export type FamilyProgress = {
  student_id: string;
  lesson_key: string;
  current_step: number;
  furthest_step: number;
  completed: boolean;
  last_activity_at: string | null;
  last_result: boolean | null;
  last_result_at: string | null;
};

export function lessonPosition(row: FamilyProgress | undefined, steps: number): LessonPosition {
  return readLessonPosition(row ? JSON.stringify({ current: row.current_step, furthest: row.furthest_step }) : null, steps);
}

export const familyLessons = familySubjects.flatMap((subject) => subject.lessons.map((lesson) => ({
  key: subject.key + "/" + lesson.id,
  title: lesson.title,
  steps: lesson.steps.length,
  route: subject.route + "/" + lesson.id,
})));
export const familyLessonByKey = new Map(familyLessons.map((lesson) => [lesson.key, lesson]));

export type LegacyProgress = Omit<FamilyProgress, "student_id">;

export function readLegacyProgress(storage: Pick<Storage, "getItem">): LegacyProgress[] {
  return familySubjects.flatMap((subject) => {
    let done: unknown;
    try { done = JSON.parse(storage.getItem(subject.legacy) ?? "[]"); } catch { done = []; }

    return subject.lessons.flatMap((lesson) => {
      let raw = null;
      try { raw = storage.getItem("gradetrail:lesson:v1:" + subject.prefix + lesson.id); } catch { /* Storage can be disabled. */ }
      const position = readLessonPosition(raw, lesson.steps.length);
      const completed = (Array.isArray(done) && done.includes(lesson.id)) || position.furthest === lesson.steps.length;
      if (!completed && position.furthest === 0) return [];
      return [{
        lesson_key: subject.key + "/" + lesson.id,
        current_step: completed && !position.furthest ? lesson.steps.length : position.current,
        furthest_step: completed && !position.furthest ? lesson.steps.length : position.furthest,
        completed,
        last_activity_at: null,
        last_result: null,
        last_result_at: null,
      }];
    });
  });
}

export function newestProgress(rows: FamilyProgress[]) {
  return rows.filter((row) => familyLessonByKey.has(row.lesson_key)).sort((a, b) =>
    (Date.parse(b.last_activity_at ?? "") || 0) - (Date.parse(a.last_activity_at ?? "") || 0));
}

export function resumeLesson(rows: FamilyProgress[]) {
  const started = newestProgress(rows).find((row) => {
    const lesson = familyLessonByKey.get(row.lesson_key)!;
    const position = lessonPosition(row, lesson.steps);
    return position.current < lesson.steps && (!row.completed || row.last_activity_at !== null || position.furthest > 0);
  });
  if (started) return familyLessonByKey.get(started.lesson_key);
  const completed = new Set(rows.filter((row) => row.completed).map((row) => row.lesson_key));
  return familyLessons.find((item) => !completed.has(item.key));
}

export function progressRpcArguments(row: FamilyProgress) {
  return {
    p_student_id: row.student_id,
    p_lesson_key: row.lesson_key,
    p_current_step: row.current_step,
    p_furthest_step: row.furthest_step,
    p_completed: row.completed,
    p_activity_at: row.last_activity_at,
    p_result: row.last_result,
    p_result_at: row.last_result_at,
  };
}
