export const grades = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
export type Grade = (typeof grades)[number];

type Lesson = {
  title: string;
  subject: string;
  concept: string;
  question: string;
  options: readonly string[];
  correct: number;
  explanation: string;
};

export const stages = [
  { id: "elementary", name: "Tiểu học", range: "Lớp 1 – 5", description: "Làm quen với chữ, số và thế giới quanh em.", grades: [1, 2, 3, 4, 5] },
  { id: "middle", name: "Trung học cơ sở", range: "Lớp 6 – 9", description: "Kết nối kiến thức và rèn luyện tư duy.", grades: [6, 7, 8, 9] },
  { id: "high", name: "Trung học phổ thông", range: "Lớp 10 – 12", description: "Hiểu sâu khái niệm và luyện cách vận dụng.", grades: [10, 11, 12] },
] as const;

export const lessons: Record<Grade, Lesson> = {
  1: { title: "Gộp hai nhóm", subject: "Toán", concept: "Khi gộp hai nhóm đồ vật, em có thể đếm tất cả đồ vật để biết tổng số. Ví dụ, 2 bút chì và 1 bút chì là 3 bút chì.", question: "Em có 3 quả cam và được thêm 2 quả. Em có tất cả bao nhiêu quả cam?", options: ["4 quả", "5 quả", "6 quả"], correct: 1, explanation: "3 + 2 = 5. Em có thể đếm tiếp từ 3 thêm hai bước: 4, 5." },
  2: { title: "Mỗi giờ có bao nhiêu phút?", subject: "Toán", concept: "Một giờ có 60 phút. Khi kim phút quay tròn một vòng, kim giờ tiến thêm một giờ.", question: "Từ 8 giờ đến 9 giờ là bao nhiêu phút?", options: ["30 phút", "50 phút", "60 phút"], correct: 2, explanation: "Từ 8 giờ đến 9 giờ là đúng một giờ, bằng 60 phút." },
  3: { title: "Tìm chi tiết trong đoạn văn", subject: "Tiếng Việt", concept: "Khi tìm một chi tiết, em đọc câu hỏi trước rồi quay lại đoạn văn để tìm từ khóa.", question: "«Sáng chủ nhật, An mang bình nước ra vườn tưới cây bạc hà.» An tưới cây gì?", options: ["Cây bạc hà", "Cây hoa hồng", "Cây xương rồng"], correct: 0, explanation: "Cuối câu có cụm «tưới cây bạc hà», cho biết cây An đã tưới." },
  4: { title: "Những phần bằng nhau", subject: "Toán", concept: "Nếu chia một hình thành các phần bằng nhau, mẫu số cho biết số phần và tử số cho biết số phần được lấy.", question: "Một hình tròn chia thành 8 phần bằng nhau. Tô 3 phần được phân số nào?", options: ["5/8", "3/8", "3/5"], correct: 1, explanation: "Có 8 phần bằng nhau và tô 3 phần, nên phân số là 3/8." },
  5: { title: "Tính một phần trăm", subject: "Toán", concept: "Phần trăm cho biết số phần trong 100 phần. Để tính 10% của một số, em chia số đó cho 10.", question: "10% của 250 là bao nhiêu?", options: ["25", "2,5", "250"], correct: 0, explanation: "250 chia 10 bằng 25, vậy 10% của 250 là 25." },
  6: { title: "Khám phá trục số", subject: "Toán", concept: "Trên trục số nằm ngang, số tăng dần từ trái sang phải. Số âm nằm bên trái số 0.", question: "Số nào nằm bên trái số −2 trên trục số?", options: ["−1", "0", "−4"], correct: 2, explanation: "−4 nhỏ hơn −2 nên nằm bên trái −2." },
  7: { title: "Cùng tăng theo tỉ lệ", subject: "Toán", concept: "Khi hai đại lượng tỉ lệ thuận, đại lượng thứ nhất tăng bao nhiêu lần thì đại lượng thứ hai cũng tăng bấy nhiêu lần.", question: "Ba cuốn vở cùng giá có tổng giá 24.000 đồng. Sáu cuốn giá bao nhiêu nếu đơn giá giữ nguyên?", options: ["36.000 đồng", "48.000 đồng", "72.000 đồng"], correct: 1, explanation: "Sáu cuốn gấp đôi ba cuốn, nên tổng giá là 24.000 × 2 = 48.000 đồng." },
  8: { title: "Áp suất và diện tích tiếp xúc", subject: "Khoa học tự nhiên", concept: "Áp suất được tính bằng lực ép chia cho diện tích bị ép. Cùng lực ép, diện tích nhỏ hơn tạo áp suất lớn hơn.", question: "Giữ nguyên lực ép và tăng diện tích tiếp xúc gấp đôi. Áp suất thay đổi thế nào?", options: ["Giảm còn một nửa", "Giữ nguyên", "Tăng gấp đôi"], correct: 0, explanation: "Trong công thức p = F/S, khi S tăng gấp đôi và F giữ nguyên, p giảm còn một nửa." },
  9: { title: "Đọc tọa độ trên đồ thị", subject: "Toán", concept: "Điểm (x, y) thuộc đồ thị hàm số khi thay x vào công thức của hàm số cho kết quả đúng bằng y.", question: "Điểm nào thuộc đồ thị y = x²?", options: ["(2, 2)", "(−2, −4)", "(−2, 4)"], correct: 2, explanation: "Khi x = −2, bình phương của −2 bằng 4, nên (−2, 4) thuộc đồ thị." },
  10: { title: "Đọc tập hợp từ điều kiện", subject: "Toán", concept: "Tập hợp có thể viết bằng cách nêu điều kiện của phần tử. Ký hiệu ℤ chỉ tập số nguyên.", question: "Tập A gồm các số nguyên x thỏa mãn −1 < x ≤ 2. A gồm những phần tử nào?", options: ["0, 1, 2", "−1, 0, 1, 2", "0, 1"], correct: 0, explanation: "Dấu < loại −1 và dấu ≤ giữ 2. Các số nguyên còn lại là 0, 1, 2." },
  11: { title: "Tìm công sai", subject: "Toán", concept: "Trong cấp số cộng, ta lấy một số hạng trừ số hạng ngay trước để tìm công sai.", question: "Cấp số cộng bắt đầu bằng 7, 4, 1. Công sai bằng bao nhiêu?", options: ["3", "−3", "−4"], correct: 1, explanation: "4 − 7 = −3 và 1 − 4 = −3. Công sai bằng −3." },
  12: { title: "Đạo hàm và chiều biến thiên", subject: "Toán", concept: "Nếu đạo hàm dương tại mọi điểm trên một khoảng, hàm số đồng biến trên khoảng đó.", question: "Hàm f(x) = x³ có đạo hàm f′(x) = 3x². Trên khoảng (0; +∞), hàm số có tính chất nào?", options: ["Nghịch biến", "Không đổi", "Đồng biến"], correct: 2, explanation: "Với mọi x > 0, 3x² > 0, nên f đồng biến trên khoảng (0; +∞)." },
};
