export type ReadingStep = { kind: "reading"; title: string; text: string; audioText?: string };
export type QuizStep = { kind: "quiz"; question: string; options: readonly string[]; correct: number; explanation: string };
export type AssemblyStep = {
  kind: "assembly";
  question: string;
  tiles: readonly string[];
  answer: readonly number[];
  result: string;
  explanation: string;
};
export type LessonStep = ReadingStep | QuizStep | AssemblyStep;

export const lessonFormat = "@grade-trail/lesson-v1";
export const lessonTemplate = `${lessonFormat}
## Khám phá
Viết nội dung chính của bài học tại đây.

## Ví dụ
Thêm ví dụ minh họa trước khi học sinh luyện tập.

:::quiz
10% của 50 bằng bao nhiêu?
- [ ] 2
- [x] 5
- [ ] 10
Giải thích: Chia 50 cho 10 để tìm 10%.
:::

## Ghi nhớ
Viết lại ý chính mà học sinh cần ghi nhớ.`;

type ParseResult = { steps: LessonStep[]; error?: string };

export function parseLessonBody(body: string): ParseResult {
  const text = body.replace(/\r\n?/g, "\n").trim();
  const lines = text.split("\n").map((line) => line.trimEnd());
  if (lines[0] !== lessonFormat) {
    return {
      steps: text.split(/\n[ \t]*\n(?:[ \t]*\n)*/).filter(Boolean).map((paragraph, index) =>
        ({ kind: "reading", title: index === 0 ? "Nội dung bài học" : "Phần " + (index + 1), text: paragraph.trim() })),
    };
  }

  const steps: LessonStep[] = [];
  const invalid = (line: number, message: string): ParseResult => ({ steps: [], error: `Dòng ${line + 1}: ${message}` });
  let cursor = 1;

  while (cursor < lines.length) {
    const start = cursor;
    const line = lines[cursor++].trim();
    if (!line) continue;

    if (line.startsWith("## ")) {
      const paragraphs: string[] = [];
      while (cursor < lines.length && !/^(## |:::)/.test(lines[cursor].trim())) paragraphs.push(lines[cursor++]);
      const content = paragraphs.join("\n").trim();
      if (!content) return invalid(start, "Thêm nội dung cho bước này.");
      steps.push({ kind: "reading", title: line.slice(3).trim(), text: content });
      continue;
    }

    if (line !== ":::quiz") return invalid(start, "Mỗi bước bắt đầu bằng «## Tên bước» hoặc «:::quiz».");
    const block: string[] = [];
    while (cursor < lines.length && lines[cursor].trim() !== ":::") block.push(lines[cursor++].trim());
    if (cursor === lines.length) return invalid(start, "Thiếu dấu đóng «:::» ở cuối câu hỏi.");
    cursor++;
    const [question, ...fields] = block.filter(Boolean);
    const explanation = fields.pop();
    const options = fields.map((field) => /^- \[([ xX])\]\s+(.+)$/.exec(field));
    if (!question || question.startsWith("- [") || options.length < 2 || options.length > 6 || options.some((option) => !option)) {
      return invalid(start, "Cần một câu hỏi và 2–6 lựa chọn, viết theo mẫu «- [ ] Đáp án».");
    }
    const correct = options.findIndex((option) => option?.[1].toLowerCase() === "x");
    if (correct < 0 || options.filter((option) => option?.[1].toLowerCase() === "x").length !== 1) {
      return invalid(start, "Đánh dấu đúng một đáp án bằng «[x]».");
    }
    const answerLabels = options.map((option) => option![2].trim());
    if (new Set(answerLabels).size !== answerLabels.length) return invalid(start, "Các lựa chọn phải khác nhau.");
    const feedback = /^Giải thích:\s*(.+)$/.exec(explanation ?? "")?.[1].trim();
    if (!feedback) return invalid(start, "Thêm dòng «Giải thích: …» sau các lựa chọn.");
    steps.push({ kind: "quiz", question, options: answerLabels, correct, explanation: feedback });
  }

  return steps.length ? { steps } : invalid(0, "Thêm ít nhất một bước học.");
}

export type LessonPosition = { current: number; furthest: number };

export function readLessonPosition(value: string | null, total: number): LessonPosition {
  const initial = { current: 0, furthest: 0 };
  if (!value) return initial;
  try {
    const saved = JSON.parse(value);
    if (!Number.isInteger(saved?.current) || !Number.isInteger(saved?.furthest) ||
        saved.current < 0 || saved.current > saved.furthest || saved.furthest > total) return initial;
    return { current: saved.current, furthest: saved.furthest };
  } catch {
    return initial;
  }
}
