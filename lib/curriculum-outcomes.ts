import type { Grade } from "./lessons";

type Topic = readonly [code: string, title: string, outcome: string];

// Mã giữ ổn định khi sửa cách diễn đạt. Các yêu cầu dưới đây là bản tóm lược biên soạn.
export const outcomesByGrade: Record<Grade, Record<string, readonly Topic[]>> = {
  1: {
    math: [
      ["number", "Số đến 100", "Đọc, viết và so sánh các số trong phạm vi 100."],
      ["addition", "Cộng và trừ", "Thực hiện phép cộng, phép trừ không nhớ trong phạm vi 100."],
      ["shapes", "Hình phẳng", "Nhận biết hình vuông, hình tròn, hình tam giác và hình chữ nhật."],
    ],
    language: [
      ["decode", "Âm, vần và tiếng", "Đọc đúng các âm, vần, tiếng và từ đã học."],
      ["write", "Viết chữ và chính tả", "Viết chữ thường, chữ số và chép hoặc nghe viết đoạn ngắn phù hợp."],
    ],
    "nature-society": [["school", "Trường học", "Giới thiệu lớp học và nêu cách giữ an toàn khi học tập, vui chơi ở trường."]],
    ethics: [["care", "Tự chăm sóc bản thân", "Nhận biết và thực hiện những việc phù hợp để chăm sóc bản thân."]],
  },
  2: {
    math: [
      ["number", "Số đến 1.000", "Đọc, viết và so sánh các số trong phạm vi 1.000."],
      ["multiply", "Phép nhân, phép chia", "Vận dụng bảng nhân, bảng chia 2 và 5 trong tính toán."],
      ["time", "Xem đồng hồ", "Đọc giờ trên đồng hồ khi kim phút chỉ số 12, số 3 hoặc số 6."],
    ],
    language: [
      ["read", "Đọc hiểu chi tiết", "Trả lời câu hỏi về nhân vật, sự việc và chi tiết nổi bật trong văn bản ngắn."],
      ["write", "Viết đoạn ngắn", "Viết vài câu về người, vật hoặc việc quen thuộc dựa vào gợi ý."],
    ],
    "nature-society": [["plants-animals", "Môi trường sống của sinh vật", "Chỉ ra nơi sống của một số cây hoặc con vật và nêu cách bảo vệ môi trường sống của chúng."]],
    ethics: [["honesty", "Nhận lỗi và sửa lỗi", "Biết nhận lỗi và thực hiện cách sửa lỗi phù hợp với tình huống quen thuộc."]],
  },
  3: {
    math: [
      ["number", "Số đến 100.000", "Đọc, viết và xác định giá trị theo hàng của các chữ số trong phạm vi 100.000."],
      ["operations", "Nhân và chia", "Thực hiện phép nhân hoặc phép chia số có nhiều chữ số với số có một chữ số trong phạm vi đã học."],
      ["measure", "Chu vi và diện tích", "Tính chu vi và diện tích hình chữ nhật, hình vuông trong tình huống đơn giản."],
    ],
    language: [
      ["read", "Đọc và tìm thông tin", "Tìm chi tiết và nêu nội dung chính của văn bản ngắn phù hợp lứa tuổi."],
      ["write", "Kể lại sự việc", "Viết đoạn văn ngắn thuật lại một sự việc đã chứng kiến hoặc tham gia."],
    ],
    "foreign-1": [["introduce", "Tiếng Anh · Thông tin cá nhân", "Chào hỏi và trao đổi thông tin cá nhân bằng câu ngắn trong tình huống quen thuộc."]],
    "nature-society": [["earth", "Trái Đất", "Nhận biết hình dạng Trái Đất qua quả địa cầu và chỉ được một số thành phần chính trên mô hình."]],
    "computing-technology": [["information", "Thông tin và quyết định", "Nêu được ví dụ về thông tin giúp đưa ra một quyết định trong sinh hoạt."]],
  },
  4: {
    math: [
      ["natural", "Số tự nhiên", "Đọc, viết, so sánh số tự nhiên có nhiều chữ số và thực hiện tính toán trong phạm vi học."],
      ["fractions", "Phân số", "Hiểu tử số, mẫu số, so sánh phân số và thực hiện các phép tính với phân số trong trường hợp đã học."],
      ["angles", "Góc và đường thẳng", "Nhận biết góc nhọn, góc tù, góc bẹt và nhận biết hai đường thẳng vuông góc hoặc song song."],
    ],
    language: [
      ["read", "Đọc truyện và thơ", "Nêu ý chính và giải thích chi tiết liên quan đến nhân vật hoặc sự việc."],
      ["write", "Miêu tả", "Viết bài văn miêu tả cây cối hoặc con vật với đặc điểm nổi bật."],
    ],
    "foreign-1": [["routine", "Tiếng Anh · Sinh hoạt hằng ngày", "Hỏi và trả lời câu hỏi ngắn về thói quen, thời gian hoặc hoạt động quen thuộc."]],
    "primary-science": [["water", "Nước", "Mô tả sự chuyển thể của nước và lấy ví dụ trong đời sống."], ["light", "Ánh sáng", "Giải thích sự tạo bóng ở mức đơn giản qua quan sát hoặc thí nghiệm."]],
    "computing-technology": [["search", "Tìm kiếm thông tin", "Dùng từ khóa để tìm thông tin phù hợp với một nhiệm vụ học tập đơn giản."]],
  },
  5: {
    math: [
      ["decimal", "Số thập phân", "Đọc, viết và so sánh số thập phân, thực hiện bốn phép tính ở mức độ quy định."],
      ["percentage", "Tỉ số phần trăm", "Tìm tỉ số phần trăm và tính giá trị phần trăm của một số trong tình huống thực tế."],
      ["solids", "Hình khối và thể tích", "Tính thể tích hình hộp chữ nhật và hình lập phương với số đo cho trước."],
    ],
    language: [
      ["read", "Thông tin và chi tiết", "Tóm tắt ý chính và nhận ra vai trò của một số chi tiết trong văn bản."],
      ["write", "Miêu tả người và phong cảnh", "Viết bài văn tả người hoặc phong cảnh có bố cục và đặc điểm chọn lọc."],
    ],
    "foreign-1": [["communication", "Tiếng Anh · Giao tiếp quen thuộc", "Hiểu và trao đổi thông tin đơn giản về bản thân, gia đình, trường học và hoạt động quen thuộc."]],
    "primary-science": [["soil", "Đất và bảo vệ đất", "Nêu một số vai trò của đất đối với cây trồng và cách hạn chế ô nhiễm, xói mòn đất."]],
    "computing-technology": [["programming", "Lập trình trực quan", "Tạo chương trình trực quan đơn giản theo trình tự các lệnh."]],
  },
  6: {
    math: [
      ["integers", "Số nguyên", "Biểu diễn số nguyên trên trục số, so sánh và thực hiện phép tính với số nguyên."],
      ["fractions", "Phân số và số thập phân", "So sánh và tính toán với phân số và số thập phân trong tình huống thực tế."],
      ["symmetry", "Đối xứng", "Nhận ra trục đối xứng hoặc tâm đối xứng ở hình phẳng và hình ảnh quen thuộc."],
    ],
    language: [
      ["folk", "Truyện dân gian", "Nhận biết chi tiết, nhân vật và các yếu tố tiêu biểu của truyện dân gian."],
      ["write", "Kể lại trải nghiệm", "Viết bài văn kể một trải nghiệm của bản thân bằng ngôi kể phù hợp."],
    ],
    "foreign-1": [["school", "Tiếng Anh · Trường học và nơi ở", "Trao đổi thông tin đơn giản về trường học, nhà ở và khu vực sinh sống."]],
    science: [["cells", "Tế bào", "Nhận biết tế bào là đơn vị cấu trúc của cơ thể sống và phân biệt một số thành phần cơ bản trên hình."], ["forces", "Lực", "Nêu ví dụ lực gây biến đổi chuyển động hoặc làm vật biến dạng."]],
    civics: [["self", "Tự nhận thức bản thân", "Nhận ra điểm mạnh, điểm hạn chế của bản thân và đề xuất cách phát huy hoặc cải thiện."]],
    computing: [["networks", "Mạng máy tính và Internet", "Nêu lợi ích của mạng máy tính và phân biệt một số thành phần cơ bản của mạng."]],
  },
  7: {
    math: [
      ["rational", "Số hữu tỉ và số thực", "Biểu diễn số hữu tỉ, thực hiện tính toán và nhận biết số vô tỉ trong tình huống đơn giản."],
      ["ratio", "Đại lượng tỉ lệ", "Giải quyết bài toán thực tế đơn giản về tỉ lệ thuận và tỉ lệ nghịch."],
      ["triangles", "Tam giác bằng nhau", "Nhận biết các trường hợp bằng nhau của tam giác và sử dụng chúng để suy ra yếu tố tương ứng."],
    ],
    language: [["read", "Đề tài và chủ đề", "Nhận biết đề tài, chủ đề và vai trò của một số chi tiết trong văn bản văn học."], ["write", "Nêu ý kiến", "Viết bài nghị luận về một vấn đề đời sống bằng lí lẽ và bằng chứng phù hợp."]],
    science: [["elements", "Nguyên tử và nguyên tố", "Trình bày mô hình nguyên tử ở mức đơn giản và nhận biết kí hiệu của một số nguyên tố."], ["speed", "Tốc độ", "Tính tốc độ từ quãng đường và thời gian, chuyển đổi giữa các đơn vị thông dụng."]],
    civics: [["heritage", "Bảo tồn di sản văn hoá", "Giải thích ý nghĩa bảo tồn di sản và nêu việc có thể làm để góp phần bảo vệ di sản."]],
    computing: [["spreadsheet", "Bảng tính điện tử", "Dùng địa chỉ ô và công thức để tính toán trên bảng tính đơn giản."]],
  },
  8: {
    math: [
      ["polynomial", "Đa thức và hằng đẳng thức", "Vận dụng các hằng đẳng thức đã học để biến đổi biểu thức và phân tích đa thức thành nhân tử."],
      ["linear", "Hàm số bậc nhất", "Nhận biết và vẽ đồ thị hàm số bậc nhất trong trường hợp đơn giản."],
      ["thales", "Định lí Thalès", "Vận dụng định lí Thalès và hệ quả để xác định độ dài đoạn thẳng."],
    ],
    language: [["read", "Thể loại và ngôn ngữ văn học", "Phân tích tác dụng của chi tiết hoặc biện pháp nghệ thuật trong văn bản."], ["write", "Phân tích tác phẩm", "Viết bài phân tích một tác phẩm văn học, nêu được nội dung và đặc sắc nghệ thuật."]],
    science: [["reaction", "Phản ứng hoá học", "Nhận biết dấu hiệu phản ứng hoá học và lập phương trình hoá học đơn giản."], ["pressure", "Áp suất", "Giải thích ảnh hưởng của lực ép và diện tích tiếp xúc tới áp suất."]],
    civics: [["environment", "Bảo vệ môi trường", "Đề xuất hành động bảo vệ môi trường và tài nguyên phù hợp với lứa tuổi."]],
    computing: [["data", "Sắp xếp và lọc dữ liệu", "Sắp xếp, lọc dữ liệu và trình bày kết quả bằng biểu đồ phù hợp."]],
  },
  9: {
    math: [
      ["equations", "Hệ phương trình bậc nhất", "Giải hệ hai phương trình bậc nhất hai ẩn và vận dụng vào bài toán thực tế."],
      ["quadratic", "Hàm số y = ax² và phương trình bậc hai", "Nhận biết đồ thị y = ax² và giải phương trình bậc hai một ẩn trong trường hợp phù hợp."],
      ["circles", "Đường tròn", "Vận dụng quan hệ giữa góc nội tiếp và cung bị chắn để giải bài toán."],
    ],
    language: [["read", "Phân tích văn bản", "Phân tích chủ đề và vai trò của các chi tiết, hình ảnh hoặc lời kể trong văn bản."], ["write", "Nghị luận về vấn đề cần giải quyết", "Đề xuất giải pháp cho vấn đề thực tế và dùng lí lẽ, bằng chứng để làm rõ quan điểm."]],
    science: [["genetics", "Di truyền", "Phân biệt gene, DNA và nhiễm sắc thể ở mức cơ bản."], ["energy", "Điện và năng lượng", "Vận dụng định luật Ohm khi giải bài toán mạch điện đơn giản."]],
    civics: [["peace", "Bảo vệ hoà bình", "Nêu biểu hiện và ý nghĩa của hoà bình, đề xuất cách giải quyết xung đột bằng đối thoại."]],
    computing: [["presentation", "Trình bày và trao đổi thông tin", "Sử dụng công cụ số phù hợp để trình bày và chia sẻ thông tin trong nhiệm vụ học tập."]],
  },
  10: {
    math: [
      ["sets", "Mệnh đề và tập hợp", "Nhận biết mệnh đề và thực hiện các phép hợp, giao, hiệu của tập hợp."],
      ["quadratic", "Hàm số bậc hai", "Vẽ parabol, tìm đỉnh và trục đối xứng, đọc khoảng biến thiên từ đồ thị."],
      ["vectors", "Vectơ", "Thực hiện các phép toán vectơ và vận dụng vào bài toán hình học đơn giản."],
    ],
    language: [["read", "Đọc theo thể loại", "Phân tích vai trò của nhân vật, người kể chuyện và chi tiết trong tác phẩm truyện."], ["write", "Nghị luận về một tác phẩm", "Viết bài nghị luận phân tích và đánh giá nội dung, nghệ thuật của tác phẩm văn học."]],
    history: [["historical-knowledge", "Lịch sử và sử học", "Phân biệt hiện thực lịch sử với nhận thức lịch sử và nêu vai trò của sử liệu."]],
    physics: [["motion", "Động học", "Mô tả chuyển động bằng độ dịch chuyển, vận tốc và gia tốc."], ["newton", "Các định luật Newton", "Vận dụng các định luật Newton để giải thích tình huống chuyển động đơn giản."]],
    chemistry: [["atoms", "Cấu tạo nguyên tử", "Mô tả thành phần nguyên tử và xác định số proton, electron, neutron từ dữ kiện phù hợp."]],
    biology: [["cell-biology", "Sinh học tế bào", "Phân biệt tế bào nhân sơ và tế bào nhân thực dựa trên đặc điểm cấu trúc."]],
  },
  11: {
    math: [
      ["trig", "Hàm số lượng giác", "Nhận biết tính tuần hoàn và giải phương trình lượng giác cơ bản."],
      ["sequences", "Dãy số và cấp số", "Nhận biết cấp số cộng, cấp số nhân và xác định số hạng theo quy luật."],
      ["limits", "Giới hạn và liên tục", "Tính một số giới hạn đơn giản và xét tính liên tục tại một điểm trong trường hợp cơ bản."],
      ["derivative", "Đạo hàm", "Tính đạo hàm của hàm số đơn giản và giải thích ý nghĩa của đạo hàm với tiếp tuyến."],
    ],
    language: [["read", "Đọc thơ và truyện", "Phân tích cách tổ chức hình ảnh, ngôn ngữ hoặc điểm nhìn trong văn bản văn học."], ["write", "Đánh giá tác phẩm", "Viết bài nghị luận phân tích và đánh giá tác phẩm dựa trên dẫn chứng."]],
    history: [["revolutions", "Cách mạng tư sản", "Trình bày tiền đề, mục tiêu, kết quả và ý nghĩa của một số cuộc cách mạng tư sản tiêu biểu."]],
    physics: [["oscillation", "Dao động", "Nhận biết các đại lượng mô tả dao động điều hoà và đọc chúng từ phương trình hoặc đồ thị."]],
    chemistry: [["equilibrium", "Cân bằng hoá học", "Giải thích sự chuyển dịch cân bằng khi thay đổi các điều kiện của hệ."]],
    biology: [["metabolism", "Trao đổi chất và chuyển hoá năng lượng", "Giải thích vai trò của quang hợp và hô hấp đối với đời sống thực vật."]],
  },
  12: {
    math: [
      ["functions", "Ứng dụng đạo hàm", "Dùng đạo hàm để khảo sát biến thiên, cực trị và giải bài toán tối ưu đơn giản."],
      ["integration", "Nguyên hàm và tích phân", "Tính tích phân trong trường hợp cơ bản và vận dụng vào tính diện tích hình phẳng."],
      ["space", "Toạ độ trong không gian", "Sử dụng hệ toạ độ để viết và đọc phương trình mặt phẳng, đường thẳng và mặt cầu."],
      ["probability", "Xác suất có điều kiện", "Tính xác suất có điều kiện trong tình huống đơn giản từ các biến cố đã cho."],
    ],
    language: [["read", "So sánh văn bản văn học", "Nhận ra điểm giống và khác nhau về nội dung hoặc hình thức giữa những văn bản thích hợp."], ["write", "So sánh, đánh giá tác phẩm", "Viết bài nghị luận so sánh và đánh giá hai tác phẩm văn học bằng tiêu chí rõ ràng."]],
    history: [["asean", "ASEAN", "Trình bày quá trình hình thành, phát triển của ASEAN và giải thích ý nghĩa hợp tác khu vực."]],
    physics: [["thermal", "Vật lí nhiệt", "Phân biệt nội năng và nhiệt lượng, vận dụng nguyên lí I nhiệt động lực học trong trường hợp cơ bản."]],
    chemistry: [["polymers", "Polymer", "Phân loại polymer và liên hệ tính chất với một số ứng dụng của vật liệu polymer."], ["electrochemistry", "Điện hoá", "Giải thích ở mức cơ bản sự chuyển hoá giữa năng lượng hoá học và điện năng."]],
    biology: [["population-genetics", "Di truyền quần thể", "Xác định tần số allele và kiểu gene trong trường hợp đơn giản, nêu ý nghĩa cân bằng di truyền."]],
  },
};
