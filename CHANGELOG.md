# Grade Trail — Changelog

## V0.5.0 — Educational Games

- Thêm 12 trò chơi cho lớp 1–12, với ba dạng ghép cặp, sắp xếp và trắc nghiệm.
- Liên kết trò chơi với từng yêu cầu cần đạt và bài mẫu theo lớp.
- Thêm phản hồi tức thì, chơi lại, lọc lớp và lưu trạng thái hoàn thành trên thiết bị.
- Trò chơi có trong bản PWA ngoại tuyến. Không có migration mới.

## V0.4.0 — Interactive Lesson Engine

- Thêm trình học từng bước, câu hỏi lựa chọn có giải thích, lưu tiến độ cục bộ và học lại.
- Dùng chung trình học cho 12 bài mẫu, kho học liệu và bản xem trước trong Studio.
- Thêm định dạng nội dung có bước đọc và câu hỏi trong trường nội dung hiện có. Bài dạng văn bản cũ vẫn mở được. Không có migration mới.

## V0.3.1 — Vercel Static Export Fix

- Dùng chế độ build tĩnh trên Vercel cho thư mục `out`, giữ bước tạo service worker sau build.
- Cập nhật hướng dẫn deploy để xử lý `NEXT_NO_ROUTES_MANIFEST`.
- Không có migration mới.

## V0.3.0 — Educational Content Studio

- Thêm Studio biên soạn và xem trước học liệu văn bản có liên kết với danh mục chương trình.
- Thêm luồng lưu nháp, gửi duyệt, trả bài kèm góp ý và duyệt xuất bản; kiểm tra vai trò và xung đột qua RPC Supabase.
- Thêm kho công khai cho bài đã xuất bản, có thể truy cập từ từng yêu cầu cần đạt.
- Thêm migration cấu trúc Studio và 107 mã yêu cầu cần đạt. Cần cấu hình Supabase để sử dụng học liệu trực tuyến.

## V0.2.0 — Curriculum Master Data

- Thêm mục Chương trình với danh mục môn và hoạt động lớp 1–12 theo CTGDPT 2018.
- Thêm bộ lọc khối, môn và tìm kiếm có dấu hoặc không dấu. Hiển thị chủ đề, yêu cầu cần đạt tiêu biểu, loại môn và nguồn đối chiếu.
- Đặt phiên bản dữ liệu và mã ổn định cho từng chủ đề, yêu cầu cần đạt để CMS có thể tham chiếu.
- Đổi tên hiển thị thành Grade Trail. Giữ định danh PWA và khóa tiến độ để người dùng trên cùng địa chỉ nâng cấp được.
- Đóng gói dữ liệu tra cứu trong bản PWA ngoại tuyến. Phiên bản này không yêu cầu migration.

## V0.1.0 — Foundation & PWA

- Đưa vào nhận diện ban đầu, biểu tượng bậc thang và giao diện tiếng Việt.
- Tạo trang chủ, bộ chọn 12 khối lớp theo 3 cấp học và màn hình tiến độ.
- Thêm 12 bài mẫu gốc, phần ghi nhớ, câu hỏi, phản hồi và lưu kết quả đúng trên trình duyệt.
- Hỗ trợ cài PWA qua manifest và icon, cùng bộ nhớ ngoại tuyến sinh từ bản build production.
- Bổ sung cấu hình Vercel và hướng dẫn chạy local. Phiên bản này không yêu cầu database hoặc migration.
