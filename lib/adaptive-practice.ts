import { getCurriculumSubjects } from "./curriculum";
import { educationalGames } from "./educational-games";
import { grades, lessons, type Grade } from "./lessons";
import type { QuizStep } from "./lesson-engine";

type Question = Omit<QuizStep, "kind">;
export type PracticeQuestion = Question & { id: string; outcomeId: string };
type Stats = { attempts: number; correct: number; streak: number; dueAt: number };
export type ReviewStats = Record<string, Stats>;

function q(question: string, correct: string, wrong1: string, wrong2: string, explanation: string): Question {
  return { question, options: [correct, wrong1, wrong2], correct: 0, explanation };
}

const additional: Record<Grade, [string, Question, Question]> = {
  1: ["math-number", q("Số nào bé hơn 40?", "39", "41", "49", "39 có 3 chục, ít hơn 4 chục."), q("Số gồm 6 chục và 2 đơn vị là số nào?", "62", "26", "60", "6 chục và 2 đơn vị là 60 + 2 = 62.")],
  2: ["math-multiply", q("Có 5 túi, mỗi túi 2 quả. Tất cả có bao nhiêu quả?", "10", "7", "12", "5 nhóm, mỗi nhóm 2 quả, có 2 × 5 = 10 quả."), q("Chia đều 20 viên bi cho 5 bạn. Mỗi bạn được mấy viên?", "4", "5", "10", "20 : 5 = 4, vì 5 × 4 = 20.")],
  3: ["math-measure", q("Hình chữ nhật dài 8 cm, rộng 3 cm. Chu vi là bao nhiêu?", "22 cm", "24 cm", "11 cm", "Cộng chiều dài và chiều rộng rồi nhân 2: (8 + 3) × 2 = 22 cm."), q("Hình vuông cạnh 5 cm có diện tích bao nhiêu?", "25 cm²", "20 cm²", "10 cm²", "Diện tích hình vuông bằng cạnh nhân cạnh: 5 × 5 = 25 cm².")],
  4: ["primary-science-water", q("Đá trong cốc tan thành nước. Nước chuyển từ thể nào sang thể nào?", "Rắn sang lỏng", "Lỏng sang rắn", "Khí sang lỏng", "Đá là nước ở thể rắn. Khi tan, đá trở thành nước lỏng."), q("Giọt nước đọng ngoài cốc lạnh hình thành do đâu?", "Hơi nước trong không khí ngưng tụ", "Nước trong cốc thấm qua thành cốc", "Cốc lạnh làm không khí đông thành đá", "Hơi nước gặp bề mặt lạnh chuyển sang thể lỏng và tạo thành các giọt nước.")],
  5: ["math-decimal", q("Số nào lớn hơn 3,08?", "3,8", "3,008", "3,07", "3,8 = 3,80. Phần thập phân 0,80 lớn hơn 0,08."), q("2,4 + 0,35 bằng bao nhiêu?", "2,75", "2,39", "2,45", "Viết 2,4 thành 2,40 rồi cộng 0,35 để được 2,75.")],
  6: ["science-forces", q("Khi bóp một miếng bọt biển, lực của tay gây ra tác dụng nào?", "Làm miếng bọt biển biến dạng", "Làm khối lượng của miếng bọt biển tăng", "Làm miếng bọt biển đổi màu", "Lực bóp làm hình dạng của miếng bọt biển thay đổi."), q("Quả bóng đang đứng yên bị đá và lăn đi. Tác dụng chính được quan sát là gì?", "Lực làm bóng thay đổi chuyển động", "Lực làm bóng tăng khối lượng", "Lực làm bóng phát sáng", "Cú đá làm bóng chuyển từ đứng yên sang chuyển động.")],
  7: ["science-speed", q("Xe đi 60 km trong 2 giờ. Tốc độ trung bình là bao nhiêu?", "30 km/h", "120 km/h", "62 km/h", "Tốc độ trung bình bằng quãng đường chia thời gian: 60 ÷ 2 = 30 km/h."), q("10 m/s bằng bao nhiêu km/h?", "36 km/h", "10 km/h", "3,6 km/h", "Nhân số đo m/s với 3,6. Ta có 10 × 3,6 = 36 km/h.")],
  8: ["math-linear", q("Điểm nào nằm trên đồ thị y = 2x + 1?", "(1; 3)", "(1; 2)", "(0; 2)", "Thay x = 1 vào 2x + 1 được y = 3."), q("Đồ thị y = −x + 3 cắt trục tung ở đâu?", "(0; 3)", "(3; 0)", "(0; −3)", "Trên trục tung, x = 0. Thay vào hàm số được y = 3.")],
  9: ["science-energy", q("Điện trở 6 Ω nối với hiệu điện thế 12 V. Cường độ dòng điện là bao nhiêu?", "2 A", "6 A", "72 A", "Theo định luật Ohm, I = U/R = 12/6 = 2 A."), q("Qua điện trở 4 Ω có dòng điện 3 A. Hiệu điện thế hai đầu điện trở bằng bao nhiêu?", "12 V", "7 V", "1 V", "Theo định luật Ohm, U = IR = 3 × 4 = 12 V.")],
  10: ["physics-motion", q("Một vật chuyển động thẳng theo chiều dương từ vị trí 2 m đến 9 m. Độ dịch chuyển là bao nhiêu?", "+7 m", "+11 m", "−7 m", "Độ dịch chuyển bằng tọa độ cuối trừ tọa độ đầu: 9 − 2 = +7 m."), q("Vận tốc tăng đều từ 4 lên 10 m/s trong 3 s. Gia tốc là bao nhiêu?", "2 m/s²", "14 m/s²", "6 m/s²", "Gia tốc bằng độ thay đổi vận tốc chia thời gian: (10 − 4)/3 = 2 m/s².")],
  11: ["math-derivative", q("Đạo hàm của f(x) = x³ là gì?", "3x²", "x²", "3x³", "Áp dụng quy tắc lũy thừa: (x³)′ = 3x²."), q("Tiếp tuyến của y = x² tại điểm có x = 2 có hệ số góc bao nhiêu?", "4", "2", "8", "Hệ số góc là giá trị đạo hàm y′ = 2x tại x = 2, bằng 4.")],
  12: ["math-integration", q("Một nguyên hàm của 2x là hàm nào?", "x²", "2x²", "2", "Đạo hàm của x² bằng 2x."), q("Tích phân của 2x trên đoạn [0; 2] bằng bao nhiêu?", "4", "2", "8", "Lấy hiệu giá trị của nguyên hàm x² ở 2 và 0: 4 − 0 = 4.")],
};

const primaryExtras: Partial<Record<Grade, Question[]>> = {
  1: [q("Lan có 12 viên bi, cho bạn 2 viên. Lan còn mấy viên?", "10", "14", "9", "Cho đi 2 viên thì lấy 12 trừ 2, còn 10 viên.")],
  2: [q("Kim giờ chỉ 6, kim phút chỉ 12. Đồng hồ chỉ mấy giờ?", "6 giờ", "12 giờ", "6 giờ 30 phút", "Kim phút ở số 12 nghĩa là đúng giờ, đọc giờ theo kim ngắn."), q("Kim phút ở 6, kim giờ nằm giữa 8 và 9. Đồng hồ chỉ mấy giờ?", "8 giờ 30 phút", "6 giờ 8 phút", "9 giờ 30 phút", "Kim phút ở số 6 là 30 phút. Kim giờ đang đi từ 8 sang 9.")],
  4: [q("Trong phân số 5/9, số 9 cho biết gì?", "Số phần bằng nhau tạo thành một đơn vị", "Số phần đã lấy", "Số đơn vị đã lấy", "Mẫu số cho biết một đơn vị được chia thành bao nhiêu phần bằng nhau.")],
  5: [q("Một túi có 80 viên bi. 25% số bi là bao nhiêu viên?", "20", "25", "40", "25% bằng một phần tư, nên 80 ÷ 4 = 20.")],
  6: [q("Số nào lớn nhất trong ba số −5, −2 và −8?", "−2", "−5", "−8", "Trong các số đã cho, −2 nằm xa nhất về bên phải trên trục số.")],
  7: [q("4 quyển vở cùng loại giá 32.000 đồng. 7 quyển giá bao nhiêu?", "56.000 đồng", "48.000 đồng", "64.000 đồng", "Mỗi quyển giá 8.000 đồng. Bảy quyển giá 7 × 8.000 = 56.000 đồng.")],
  9: [q("Điểm nào thuộc đồ thị y = 2x²?", "(2; 8)", "(2; 4)", "(−2; −8)", "Với x = 2, y = 2 × 2² = 8.")],
  10: [q("A = {1, 2} và B = {2, 3}. Tập A ∩ B là gì?", "{2}", "{1, 2, 3}", "{1, 3}", "Giao gồm các phần tử thuộc cả A và B. Phần tử chung duy nhất là 2.")],
};

function makeTopic(grade: Grade, outcomeId: string, questions: Question[]) {
  for (const subject of getCurriculumSubjects(grade)) {
    for (const topic of subject.topics) {
      const outcome = topic.outcomes.find((item) => item.id === outcomeId);
      if (outcome) return {
        grade, outcomeId, subject: subject.title, title: topic.title, objective: outcome.text,
        questions: questions.map((item, index): PracticeQuestion => ({ ...item, outcomeId, id: outcomeId + ":q" + (index + 1) })),
      };
    }
  }
  throw new Error("Missing curriculum outcome: " + outcomeId);
}

export const practiceTopics = grades.flatMap((grade) => {
  const game = educationalGames.find((entry) => entry.grade === grade)!;
  const [additionalTopic, ...questions] = additional[grade];
  const primary = grade === 2 ? primaryExtras[2]! : [
    lessons[grade], ...(game.kind === "quiz" ? game.questions : primaryExtras[grade] ?? []),
  ];
  return [
    makeTopic(grade, game.outcomeId, primary),
    makeTopic(grade, `vn-gdpt2018-${grade}-${additionalTopic}-01`, questions),
  ];
});

const questionsById = new Set(practiceTopics.flatMap((topic) => topic.questions.map((question) => question.id)));
const day = 24 * 60 * 60 * 1000;

export function readReviewStats(raw: string): ReviewStats {
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null || Array.isArray(data)) return {};
    return Object.fromEntries(Object.entries(data).filter(([id, value]) =>
      questionsById.has(id) && value && Number.isSafeInteger(value.attempts) && value.attempts > 0 &&
      Number.isSafeInteger(value.correct) && value.correct >= 0 && value.correct <= value.attempts &&
      Number.isSafeInteger(value.streak) && value.streak >= 0 && value.streak <= value.correct &&
      Number.isFinite(value.dueAt) && value.dueAt >= 0,
    ));
  } catch { return {}; }
}

export function recordPracticeAnswer(stats: ReviewStats, questionId: string, correct: boolean, now: number): ReviewStats {
  const last = stats[questionId];
  const streak = correct ? (last?.streak ?? 0) + 1 : 0;
  const interval = [1, 3, 7, 14][Math.min(streak - 1, 3)];
  return { ...stats, [questionId]: {
    attempts: (last?.attempts ?? 0) + 1, correct: (last?.correct ?? 0) + Number(correct), streak,
    dueAt: correct ? now + interval * day : now,
  } };
}

export function reviewQueue(questions: PracticeQuestion[], stats: ReviewStats, now: number) {
  function priority(question: PracticeQuestion) {
    const data = stats[question.id];
    return !data ? 2 : data.streak === 0 ? 0 : data.dueAt <= now ? 1 : 3;
  }
  return [...questions].sort((a, b) => priority(a) - priority(b) ||
    ((stats[a.id]?.dueAt ?? 0) - (stats[b.id]?.dueAt ?? 0)));
}
