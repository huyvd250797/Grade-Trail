import type { LessonStep, QuizStep } from "./lesson-engine";

export const mathUnits = [
  { id: "numbers", title: "Số và thứ tự" },
  { id: "operations", title: "Cộng, trừ và bài toán" },
  { id: "geometry", title: "Hình học" },
  { id: "measurement", title: "Đo lường và thời gian" },
] as const;

type Unit = (typeof mathUnits)[number]["id"];

function quiz(question: string, options: string[], correct: number, explanation: string): QuizStep {
  return { kind: "quiz", question, options, correct, explanation };
}

function lesson(id: string, unit: Unit, title: string, goal: string, example: string, ...questions: QuizStep[]) {
  const steps: LessonStep[] = [{ kind: "reading", title: "Cùng học qua ví dụ", text: example }, ...questions];
  return { id, unit, title, goal, steps };
}

export const gradeOneMath = [
  lesson("count", "numbers", "Đếm đến 10", "Đếm mỗi vật đúng một lần.",
    "Đếm từng vật từ trái sang phải.\n● ● ● ●\nChỉ lần lượt từng chấm và đọc: 1, 2, 3, 4. Có 4 chấm.",
    quiz("Có mấy chấm? ● ● ● ● ● ●", ["5", "7", "6"], 2, "Đếm từng chấm: 1, 2, 3, 4, 5, 6."),
    quiz("Số nào đứng ngay sau 8?", ["9", "7", "10"], 0, "Khi đếm tăng dần: 7, 8, 9, 10.")),
  lesson("place-value", "numbers", "Chục và đơn vị", "Đọc và viết số có hai chữ số.",
    "Gom 10 que tính thành 1 bó gọi là 1 chục.\n[10] [10] + 3 que rời = 2 chục và 3 đơn vị = 23.",
    quiz("4 chục và 2 đơn vị tạo thành số nào?", ["24", "42", "40"], 1, "4 chục là 40. Thêm 2 đơn vị được 42."),
    quiz("Số 57 có mấy chục?", ["5 chục", "7 chục", "57 chục"], 0, "Chữ số 5 ở hàng chục và chữ số 7 ở hàng đơn vị.")),
  lesson("compare", "numbers", "So sánh số đến 100", "Xếp số theo thứ tự từ bé đến lớn.",
    "So sánh số chục trước. Nếu số chục bằng nhau, nhìn số đơn vị.\n34 và 37 đều có 3 chục. Vì 4 bé hơn 7 nên 34 < 37. Số 100 lớn hơn mọi số có hai chữ số.",
    quiz("Điền dấu: 58 … 62.", ["=", ">", "<"], 2, "58 có 5 chục. 62 có 6 chục. Vậy 58 < 62."),
    quiz("Dãy nào đi từ bé đến lớn?", ["19, 11, 23", "11, 19, 23", "23, 19, 11"], 1, "11 bé hơn 19. Cả hai đều bé hơn 23.")),
  lesson("operations-ten", "operations", "Cộng và trừ trong phạm vi 10", "Dùng cách gộp và bớt để tìm kết quả.",
    "Gộp hai nhóm là cộng: ● ● ● + ● ● = 5 chấm.\nTừ 5 chấm bớt 2 chấm thì còn 3 chấm.",
    quiz("4 + 3 bằng bao nhiêu?", ["8", "7", "6"], 1, "Đếm thêm 3 từ 4: 5, 6, 7."),
    quiz("9 − 4 bằng bao nhiêu?", ["4", "6", "5"], 2, "Bớt 4 từ 9 còn 5. Kiểm tra lại: 5 + 4 = 9.")),
  lesson("operations-hundred", "operations", "Cộng và trừ không nhớ", "Tính cộng và trừ không nhớ trong phạm vi 100.",
    "Tính riêng hàng đơn vị và hàng chục.\n23 + 14: 3 + 4 = 7 đơn vị, 2 + 1 = 3 chục. Kết quả là 37.\n46 − 12: 6 − 2 = 4 đơn vị, 4 − 1 = 3 chục. Kết quả là 34.",
    quiz("32 + 15 bằng bao nhiêu?", ["47", "46", "57"], 0, "Có 2 + 5 = 7 đơn vị và 3 + 1 = 4 chục."),
    quiz("68 − 23 bằng bao nhiêu?", ["35", "55", "45"], 2, "Có 8 − 3 = 5 đơn vị và 6 − 2 = 4 chục.")),
  lesson("word-problems", "operations", "Bài toán thêm và bớt", "Chọn phép tính phù hợp với câu chuyện.",
    "Đọc xem ban đầu có bao nhiêu và số đó tăng hay giảm.\nMai có 5 quả lê, được thêm 2 quả. Mai có 5 + 2 = 7 quả lê.",
    quiz("Nam có 8 nhãn dán, cho bạn 3 cái. Nam còn mấy cái?", ["11 cái", "5 cái", "3 cái"], 1, "Cho đi làm số nhãn dán giảm. Tính 8 − 3 = 5 cái."),
    quiz("Có 12 bạn đang chơi. Thêm 5 bạn tham gia. Có tất cả bao nhiêu bạn?", ["17 bạn", "7 bạn", "15 bạn"], 0, "Thêm bạn là cộng: 12 + 5 = 17 bạn.")),
  lesson("flat-shapes", "geometry", "Nhận biết hình phẳng", "Nhận biết hình tròn, tam giác, vuông và chữ nhật.",
    "● Hình tròn có đường bao cong liền.\n▲ Hình tam giác có 3 cạnh.\n■ Hình vuông có 4 cạnh bằng nhau và 4 góc vuông.\n▬ Hình chữ nhật có 4 góc vuông. Hình minh họa có 2 cạnh dài và 2 cạnh ngắn.",
    quiz("Hình nào là hình tam giác?", ["● Hình có đường bao cong", "▲ Hình có 3 cạnh", "■ Hình có 4 cạnh"], 1, "Hình tam giác có ba cạnh."),
    quiz("Vật nào có mặt giống hình tròn?", ["Mặt đồng xu tròn", "Mặt quyển vở chữ nhật", "Mặt viên gạch vuông"], 0, "Mặt đồng xu tròn có đường bao cong liền.")),
  lesson("solid-shapes", "geometry", "Khối lập phương và khối hộp chữ nhật", "Nhận biết hai dạng khối qua đồ vật quen thuộc.",
    "Con xúc xắc dạng khối lập phương có 6 mặt vuông bằng nhau. Một hộp bút dạng khối hộp chữ nhật thường có mặt dài và mặt ngắn.",
    quiz("Vật nào giống khối lập phương nhất?", ["Quả bóng", "Bút chì", "Con xúc xắc dạng khối vuông"], 2, "Con xúc xắc dạng khối vuông có các mặt vuông bằng nhau."),
    quiz("Hộp khăn dài có các mặt phẳng hình chữ nhật giống khối nào?", ["Khối hộp chữ nhật", "Khối cầu", "Khối trụ"], 0, "Hộp khăn dạng này có hình dáng của khối hộp chữ nhật.")),
  lesson("centimeters", "measurement", "Đo độ dài bằng xăng-ti-mét", "Đặt vật tại vạch 0 và đọc độ dài theo cm.",
    "Đặt một đầu bút ở vạch 0. Nếu đầu còn lại trùng vạch 6 trên thước cm thì bút dài 6 cm.",
    quiz("Dải giấy đặt từ vạch 0 đến vạch 9 trên thước cm. Dải giấy dài bao nhiêu?", ["9 cm", "0 cm", "10 cm"], 0, "Đầu thứ hai trùng vạch 9 khi đo từ 0, nên độ dài là 9 cm."),
    quiz("Dây đỏ dài 5 cm, dây xanh dài 8 cm. Dây nào dài hơn?", ["Dây đỏ", "Hai dây bằng nhau", "Dây xanh"], 2, "8 lớn hơn 5, nên dây xanh dài hơn.")),
  lesson("whole-hours", "measurement", "Xem giờ đúng", "Đọc giờ đúng trên đồng hồ có kim.",
    "Khi kim dài chỉ số 12, đồng hồ đang chỉ giờ đúng. Đọc số mà kim ngắn chỉ. Kim dài chỉ 12 và kim ngắn chỉ 4 là 4 giờ.",
    quiz("Kim dài chỉ 12, kim ngắn chỉ 7. Đồng hồ chỉ mấy giờ?", ["12 giờ", "7 giờ", "6 giờ"], 1, "Đang là giờ đúng, nên đọc số 7 mà kim ngắn chỉ."),
    quiz("Ở 9 giờ đúng, kim dài chỉ số mấy?", ["9", "6", "12"], 2, "Ở giờ đúng, kim dài luôn chỉ số 12.")),
];
