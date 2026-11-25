import type { Grade } from "./lessons";
import type { QuizStep } from "./lesson-engine";

type Base = { id: string; grade: Grade; title: string; outcomeId: string };
type Mode =
  | { kind: "match"; pairs: readonly (readonly [string, string])[] }
  | { kind: "order"; prompt: string; items: readonly string[]; explanation: string }
  | { kind: "quiz"; questions: readonly QuizStep[] };
export type EducationalGame = Base & Mode;

function game(grade: Grade, id: string, title: string, topic: string, mode: Mode): EducationalGame {
  return { grade, id, title, outcomeId: `vn-gdpt2018-${grade}-${topic}-01`, ...mode };
}

function question(question: string, options: string[], correct: number, explanation: string): QuizStep {
  return { kind: "quiz", question, options, correct, explanation };
}

export const educationalGames = [
  game(1, "sum-pairs", "Ghép phép tính", "math-addition", { kind: "match", pairs: [["3 + 5", "8"], ["7 − 3", "4"], ["10 + 6", "16"], ["9 − 2", "7"]] }),
  game(1, "grade-one-number-trail", "Đường đua số", "math-number", { kind: "order",
    prompt: "Chọn các số từ bé đến lớn.", items: ["9", "19", "29", "41", "63"], explanation: "9 có một chữ số. Các số còn lại có số chục tăng dần: 1, 2, 4 và 6." }),
  game(1, "grade-one-shape-match", "Ghép tên các hình", "math-shapes", { kind: "match",
    pairs: [["● Hình có đường bao cong", "Hình tròn"], ["▲ Hình ba cạnh", "Hình tam giác"],
      ["■ Hình bốn cạnh bằng nhau và bốn góc vuông", "Hình vuông"], ["▬ Hình có bốn góc vuông, hai cạnh dài và hai cạnh ngắn", "Hình chữ nhật"]] }),
  game(2, "clock-pairs", "Đồng hồ chỉ mấy giờ?", "math-time", { kind: "match", pairs: [["Kim giờ ở 7, kim phút ở 12", "7 giờ"], ["Kim giờ giữa 9 và 10, kim phút ở 6", "9 giờ 30 phút"], ["Kim giờ vừa qua 2, kim phút ở 3", "2 giờ 15 phút"]] }),
  game(3, "reading-clues", "Thám tử chi tiết", "language-read", { kind: "quiz", questions: [
    question("Chiều thứ ba, Mai mượn một cuốn truyện ở thư viện. Mai đến đâu?", ["Nhà sách", "Thư viện", "Sân trường"], 1, "Cụm «ở thư viện» chỉ nơi Mai mượn sách."),
    question("Trong giờ ra chơi, Nam nhặt chiếc bút đỏ cạnh cửa lớp. Nam nhặt vật gì?", ["Bút đỏ", "Bút xanh", "Quyển vở"], 0, "Đoạn văn nói rõ vật Nam nhặt là chiếc bút đỏ."),
    question("Mưa vừa tạnh, Linh mang áo khoác ra phơi ngoài hiên. Linh phơi áo ở đâu?", ["Trong lớp", "Trong bếp", "Ngoài hiên"], 2, "Chi tiết «ngoài hiên» chỉ nơi Linh phơi áo."),
  ] }),
  game(4, "fraction-pairs", "Ghép phân số", "math-fractions", { kind: "match", pairs: [["Lấy 2 trong 7 phần bằng nhau", "2/7"], ["Lấy 1 trong 4 phần bằng nhau", "1/4"], ["Lấy 5 trong 8 phần bằng nhau", "5/8"]] }),
  game(5, "percent-order", "Xếp mức giảm giá", "math-percentage", { kind: "order",
    prompt: "Mỗi món giá 200.000 đồng. Chọn các mức giảm từ số tiền giảm ít nhất đến nhiều nhất.",
    items: ["5%", "10%", "20%", "35%"], explanation: "Bốn mức giảm lần lượt là 10.000, 20.000, 40.000 và 70.000 đồng." }),
  game(6, "integer-line", "Xếp trên trục số", "math-integers", { kind: "order",
    prompt: "Chọn các số theo thứ tự từ trái sang phải trên trục số.", items: ["−8", "−3", "0", "2", "9"], explanation: "Giá trị tăng dần từ trái sang phải. Trong hai số âm, số có giá trị tuyệt đối lớn hơn đứng bên trái." }),
  game(7, "rate-order", "Xếp giỏ hàng", "math-ratio", { kind: "order",
    prompt: "Mỗi cuốn vở giá 8.000 đồng. Xếp các giỏ từ ít tiền nhất đến nhiều tiền nhất.", items: ["2 cuốn", "3 cuốn", "5 cuốn", "7 cuốn"], explanation: "Giá tiền tỉ lệ thuận với số vở. Các giỏ có giá 16.000, 24.000, 40.000 và 56.000 đồng." }),
  game(8, "pressure-quiz", "Thử thách áp suất", "science-pressure", { kind: "quiz", questions: [
    question("Lực ép giữ nguyên, diện tích tiếp xúc giảm một nửa. Áp suất thay đổi thế nào?", ["Giảm một nửa", "Tăng gấp đôi", "Giữ nguyên"], 1, "p = F/S, nên diện tích giảm một nửa làm áp suất tăng gấp đôi."),
    question("Giữ nguyên diện tích, lực ép tăng gấp ba. Áp suất thế nào?", ["Tăng gấp ba", "Còn một phần ba", "Giữ nguyên"], 0, "Khi diện tích giữ nguyên, áp suất tỉ lệ thuận với lực ép."),
    question("Vật tạo lực ép 60 N lên diện tích 2 m². Áp suất là bao nhiêu?", ["120 Pa", "60 Pa", "30 Pa"], 2, "Áp suất bằng 60 ÷ 2 = 30 Pa."),
  ] }),
  game(9, "parabola-order", "Xếp điểm trên parabol", "math-quadratic", { kind: "order",
    prompt: "Với y = x², xếp các hoành độ theo tung độ tương ứng từ thấp đến cao.", items: ["x = 0", "x = −1", "x = 2", "x = −3"], explanation: "Các tung độ lần lượt là 0, 1, 4 và 9." }),
  game(10, "set-pairs", "Ghép phép toán tập hợp", "math-sets", { kind: "match", pairs: [["∪", "Hợp"], ["∩", "Giao"], ["∖", "Hiệu"]] }),
  game(11, "sequence-quiz", "Giải mã cấp số", "math-sequences", { kind: "quiz", questions: [
    question("Cấp số cộng bắt đầu bằng 3, 7, 11. Số hạng tiếp theo là?", ["15", "14", "17"], 0, "Mỗi bước cộng 4, nên số hạng tiếp theo là 11 + 4 = 15."),
    question("Cấp số nhân bắt đầu bằng 2, 6, 18. Công bội là?", ["2", "6", "3"], 2, "Tỉ số của hai số hạng liên tiếp là 6/2 = 18/6 = 3."),
    question("Cấp số cộng có u₁ = 10, d = −2. Tính u₄.", ["2", "4", "6"], 1, "Từ u₁ đến u₄ có ba bước, nên u₄ = 10 + 3 × (−2) = 4."),
  ] }),
  game(12, "derivative-quiz", "Đọc dấu đạo hàm", "math-functions", { kind: "quiz", questions: [
    question("Nếu f′(x) < 0 trên một khoảng thì f có tính chất nào trên khoảng đó?", ["Đồng biến", "Nghịch biến", "Không đổi"], 1, "Đạo hàm âm trên cả khoảng cho biết hàm số nghịch biến."),
    question("Qua x₀, f′ đổi dấu từ dương sang âm. Giả sử f liên tục tại x₀. X₀ là điểm gì?", ["Cực đại", "Cực tiểu", "Không có cực trị"], 0, "Hàm số tăng trước x₀ và giảm sau x₀ nên đạt cực đại tại đó."),
    question("Hàm f(x) = x² − 4x + 7 đạt giá trị nhỏ nhất tại x nào?", ["x = −2", "x = 4", "x = 2"], 2, "f′(x) = 2x − 4 đổi dấu từ âm sang dương qua x = 2."),
  ] }),
];

export const gameKinds = { match: "Ghép cặp", order: "Sắp xếp", quiz: "Trắc nghiệm" };

export function shuffleItems(count: number) {
  const order = Array.from({ length: count }, (_, index) => index);
  for (let index = order.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [order[index], order[other]] = [order[other], order[index]];
  }
  if (count > 1 && order.every((item, index) => item === index)) order.push(order.shift()!);
  return order;
}
