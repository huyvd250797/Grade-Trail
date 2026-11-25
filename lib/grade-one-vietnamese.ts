import { curriculumSources } from "./curriculum";
import type { AssemblyStep, LessonStep, QuizStep } from "./lesson-engine";

export const vietnameseRoute = "#tieng-viet-lop-1";
export const gradeOneSources = {
  program: curriculumSources.subjects,
  decision: {
    label: "Quyết định 3588/QĐ-BGDĐT",
    url: "https://xaydungchinhsach.chinhphu.vn/quyet-dinh-so-3588-qd-bgddt-ve-bo-sach-giao-khoa-giao-duc-pho-thong-su-dung-thong-nhat-toan-quoc-119251227145448874.htm",
  },
  first: {
    label: "SGK Tiếng Việt 1, tập một · NXBGDVN",
    url: "https://hanhtrangso.nxbgd.vn/sach-dien-tu/tieng-viet-1-tap-mot-409",
  },
  second: {
    label: "SGK Tiếng Việt 1, tập hai · NXBGDVN",
    url: "https://hanhtrangso.nxbgd.vn/sach-dien-tu/tieng-viet-1-tap-hai-410",
  },
};

export const vietnameseUnits = [
  { id: "opening", title: "Làm quen với việc đọc", book: "first" },
  { id: "letters", title: "Âm, chữ và dấu thanh", book: "first" },
  { id: "rhymes", title: "Học vần và ghép tiếng", book: "first" },
  { id: "texts", title: "Tập đọc theo chủ điểm", book: "second" },
] as const;

type Unit = typeof vietnameseUnits[number]["id"];

function quiz(question: string, options: string[], correct: number, explanation: string): QuizStep {
  return { kind: "quiz", question, options, correct, explanation };
}

function assemble(question: string, tiles: string[], answer: number[], result: string, explanation: string): AssemblyStep {
  return { kind: "assembly", question, tiles, answer, result, explanation };
}

function lesson(id: string, unit: Unit, title: string, reference: string, goal: string, text: string, audioText: string, ...practice: LessonStep[]) {
  const steps: LessonStep[] = [
    { kind: "reading", title: unit === "texts" ? "Đọc đoạn văn" : "Cùng học", text, audioText },
    ...practice,
  ];
  return { id, unit, title, reference, goal, steps };
}

export const gradeOneVietnamese = [
  lesson("tu-the-doc", "opening", "Tư thế đọc", "Tập một · Tuần mở đầu",
    "Ngồi ngay ngắn, mở sách và giữ khoảng cách phù hợp khi đọc.",
    "Em ngồi thẳng lưng, mở sách trên bàn. Giữ mắt cách sách khoảng 25 cm.",
    "Em ngồi thẳng lưng, mở sách trên bàn. Giữ mắt cách sách khoảng hai mươi lăm xăng-ti-mét.",
    quiz("Em nên ngồi thế nào khi đọc sách?", ["Nằm trên bàn", "Ngồi thẳng lưng", "Cúi sát mặt vào sách"], 1, "Em ngồi thẳng lưng và để sách mở trước mặt.")),
  lesson("chu-a", "letters", "Chữ A và a", "Tập một · Bài 1",
    "Nhận ra chữ A hoa và a thường.",
    "A là chữ hoa. a là chữ thường. Em đọc âm a rồi tìm chữ a.",
    "a",
    quiz("Đâu là chữ a thường?", ["A", "a", "O"], 1, "Chữ a thường là a.")),
  lesson("chu-b-dau-huyen", "letters", "Chữ b và dấu huyền", "Tập một · Bài 2",
    "Ghép b với a, thêm dấu huyền để được tiếng bà.",
    "Ghép b với a được ba. Thêm dấu huyền trên a, em được bà.",
    "ba, bà",
    assemble("Chạm các thẻ theo thứ tự để ghép tiếng bà.", ["a", "dấu huyền", "b"], [2, 0, 1], "bà", "Ghép b và a, rồi thêm dấu huyền trên a."),
    quiz("Tiếng nào có dấu huyền?", ["ba", "bà"], 1, "Tiếng bà có dấu huyền trên chữ a.")),
  lesson("chu-c-dau-sac", "letters", "Chữ c và dấu sắc", "Tập một · Bài 3",
    "Đọc ca và phân biệt tiếng có dấu sắc.",
    "Ghép c với a được ca. Thêm dấu sắc trên a, em được cá.",
    "ca, cá",
    assemble("Chạm các thẻ theo thứ tự để ghép tiếng cá.", ["a", "dấu sắc", "c", "dấu huyền"], [2, 0, 1], "cá", "Ghép c và a, rồi thêm dấu sắc trên a."),
    quiz("Tiếng nào có dấu sắc?", ["cá", "ca", "cà"], 0, "Tiếng cá có dấu sắc trên chữ a.")),
  lesson("chu-e-va-e-mu", "letters", "Chữ e và ê", "Tập một · Bài 4",
    "Phân biệt e với ê khi đọc tiếng.",
    "Chữ ê có dấu mũ. Em đọc be, bê và quan sát chữ cuối mỗi tiếng.",
    "be, bê",
    assemble("Chạm các thẻ theo thứ tự để ghép tiếng bê.", ["e", "ê", "b"], [2, 1], "bê", "Chữ b đứng trước ê tạo thành bê."),
    quiz("Tiếng nào chứa ê?", ["be", "ba", "bê"], 2, "Tiếng bê có chữ ê.")),
  lesson("chu-o-dau-hoi", "letters", "Chữ o và dấu hỏi", "Tập một · Bài 6",
    "Nhận biết chữ o và dấu hỏi.",
    "Ghép b với o được bo. Thêm dấu hỏi trên o, em được bỏ.",
    "bo, bỏ",
    assemble("Chạm các thẻ theo thứ tự để ghép tiếng bỏ.", ["dấu hỏi", "o", "dấu sắc", "b"], [3, 1, 0], "bỏ", "Ghép b và o, rồi thêm dấu hỏi trên o."),
    quiz("Tiếng nào có dấu hỏi?", ["bỏ", "bo", "bó"], 0, "Tiếng bỏ có dấu hỏi trên chữ o.")),
  lesson("van-an-an-an", "rhymes", "Các vần an, ăn, ân", "Tập một · Bài 31",
    "Ghép các vần an, ăn, ân và tìm vần trong tiếng.",
    "Ghép a với n được an. Ghép ă với n được ăn. Ghép â với n được ân. Em đọc các tiếng lan, lăn, sân.",
    "lan, lăn, sân",
    assemble("Chạm các chữ theo thứ tự để ghép vần ăn.", ["n", "â", "ă", "a"], [2, 0], "ăn", "Chữ ă đứng trước n tạo thành vần ăn."),
    quiz("Tiếng sân có vần nào?", ["ăn", "ân", "an"], 1, "Trong tiếng sân, vần ân đứng sau s.")),
  lesson("van-am-am-am", "rhymes", "Các vần am, ăm, âm", "Tập một · Bài 34",
    "Phân biệt am, ăm, âm và ghép tiếng có các vần này.",
    "Các vần am, ăm, âm cùng kết thúc bằng m. Em đọc cam, tăm, câm.",
    "cam, tăm, câm",
    assemble("Chạm các chữ theo thứ tự để ghép tiếng tăm.", ["m", "â", "t", "ă"], [2, 3, 0], "tăm", "Chữ t đứng trước vần ăm tạo thành tiếng tăm."),
    quiz("Tiếng cam có vần nào?", ["ăm", "âm", "am"], 2, "Trong tiếng cam, vần am đứng sau c.")),
  lesson("van-ai-ay-ay", "rhymes", "Các vần ai, ay, ây", "Tập một · Bài 38",
    "Nhận ra vần ai, ay, ây khi đọc tiếng.",
    "Em đọc tai, tay, cây. Vần ai kết thúc bằng i. Vần ay và ây kết thúc bằng y.",
    "tai, tay, cây",
    assemble("Chạm các chữ theo thứ tự để ghép tiếng cây.", ["y", "a", "c", "â"], [2, 3, 0], "cây", "Chữ c đứng trước vần ây tạo thành tiếng cây."),
    quiz("Tiếng nào có vần ay?", ["tai", "tay", "cây"], 1, "Tiếng tay có vần ay.")),
  lesson("van-oi-oi-oi", "rhymes", "Các vần oi, ôi, ơi", "Tập một · Bài 39",
    "Nhận ra sự khác nhau giữa oi, ôi, ơi.",
    "Các vần oi, ôi, ơi cùng kết thúc bằng i. Em đọc voi, xôi, bơi.",
    "voi, xôi, bơi",
    assemble("Chạm các chữ theo thứ tự để ghép tiếng bơi.", ["ô", "i", "b", "ơ"], [2, 3, 1], "bơi", "Chữ b đứng trước vần ơi tạo thành tiếng bơi."),
    quiz("Tiếng nào có vần ôi?", ["voi", "bơi", "xôi"], 2, "Tiếng xôi có vần ôi.")),
  lesson("ban-moi", "texts", "Đôi bạn cùng đọc", "Tập hai · Chủ điểm Tôi và các bạn",
    "Đọc câu rõ ràng, ngắt ở dấu chấm và tìm chi tiết về bạn.",
    "Vy mang một cuốn truyện đến lớp. Giờ ra chơi, Vy mời Hà cùng đọc. Hai bạn đọc từng trang rồi kể cho nhau nghe về con mèo trong truyện.",
    "Vy mang một cuốn truyện đến lớp. Giờ ra chơi, Vy mời Hà cùng đọc. Hai bạn đọc từng trang rồi kể cho nhau nghe về con mèo trong truyện.",
    quiz("Vy mời ai cùng đọc truyện?", ["Hà", "Cô giáo", "Lan"], 0, "Câu thứ hai cho biết Vy mời Hà cùng đọc."),
    quiz("Hai bạn kể cho nhau nghe về con gì?", ["Con cá", "Con mèo", "Con thỏ"], 1, "Hai bạn kể về con mèo trong truyện.")),
  lesson("buoi-toi-o-nha", "texts", "Buổi tối ở nhà", "Tập hai · Chủ điểm Mái ấm gia đình",
    "Đọc đoạn ngắn và trả lời câu hỏi về việc từng người làm.",
    "Sau bữa tối, mẹ rửa bát. Nam lau bàn giúp mẹ. Bố trải chiếu, còn bà chọn một cuốn truyện. Cả nhà ngồi bên nhau nghe bà đọc.",
    "Sau bữa tối, mẹ rửa bát. Nam lau bàn giúp mẹ. Bố trải chiếu, còn bà chọn một cuốn truyện. Cả nhà ngồi bên nhau nghe bà đọc.",
    quiz("Nam giúp mẹ làm việc gì?", ["Rửa bát", "Trải chiếu", "Lau bàn"], 2, "Câu thứ hai cho biết Nam lau bàn."),
    quiz("Ai đọc truyện cho cả nhà nghe?", ["Bà", "Mẹ", "Bố"], 0, "Câu cuối cho biết cả nhà nghe bà đọc.")),
  lesson("goc-sach", "texts", "Góc sách của lớp", "Tập hai · Chủ điểm Mái trường mến yêu",
    "Đọc một đoạn thông tin ngắn và tìm chi tiết được nêu trong đoạn.",
    "Góc sách ở cạnh cửa sổ lớp em. Kệ dưới có sách tranh. Kệ trên có truyện ngắn. Đọc xong, các bạn đặt sách về đúng chỗ.",
    "Góc sách ở cạnh cửa sổ lớp em. Kệ dưới có sách tranh. Kệ trên có truyện ngắn. Đọc xong, các bạn đặt sách về đúng chỗ.",
    quiz("Góc sách ở đâu?", ["Ngoài sân", "Cạnh cửa sổ", "Sau cửa lớp"], 1, "Câu đầu cho biết góc sách ở cạnh cửa sổ."),
    quiz("Sách tranh ở kệ nào?", ["Kệ trên", "Cả hai kệ", "Kệ dưới"], 2, "Câu thứ hai cho biết sách tranh ở kệ dưới.")),
];
