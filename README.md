# Học Trình V0.1.0 — Foundation & PWA

Học Trình là không gian tự học dành cho học sinh Việt Nam từ lớp 1 đến lớp 12. Tên gọi thể hiện lộ trình học từng bước, từ tiểu học đến hết trung học phổ thông.

Bản đầu có trang chủ, bộ chọn 12 khối lớp, 12 bài mẫu tự biên soạn, câu hỏi có phản hồi, phần tiếp tục học, và trang tiến độ. Bài mẫu minh họa luồng học. Danh mục CTGDPT 2018 sẽ được xây dựng ở bước dữ liệu chương trình.

Không cần tài khoản, biến môi trường, Supabase hay migration. Lớp vừa mở và bài đã hoàn thành được lưu trong trình duyệt bằng localStorage. Tiến độ gắn với trình duyệt và địa chỉ app đang dùng, có thể mất khi xóa dữ liệu trình duyệt hoặc đổi thiết bị.

## Chạy trên máy

Yêu cầu Node.js 22 hoặc 24 LTS và npm. Source dùng Next.js 16 App Router, React 19 và TypeScript. `package-lock.json` khóa các phiên bản đã dùng.

Giải nén ZIP, mở terminal tại thư mục `HocTrinh`, rồi chạy:

```bash
npm ci
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000). Chọn một khối lớp và làm bài mẫu. Khi cần kiểm tra package:

```bash
npm run lint
npm run typecheck
npm run build
npm start
```

Dừng `npm run dev` trước khi chạy `npm start` nếu cổng 3000 đang được dùng. Bản build tạo thư mục `out` và tự sinh service worker dựa vào nội dung của bản build.

## Cài PWA và kiểm tra ngoại tuyến

1. Mở bản production tại `localhost` hoặc một địa chỉ HTTPS. Khi thử trên điện thoại, dùng địa chỉ HTTPS, vì IP LAN qua HTTP có thể không đủ điều kiện đăng ký service worker.
2. Đợi trạng thái **Sẵn sàng học ngoại tuyến** ở cuối trang. Tại thời điểm đó service worker đã lưu giao diện, tài nguyên và 12 bài mẫu.
3. Trên iPhone/iPad, mở Safari → Chia sẻ → Thêm vào MH chính. Trình duyệt tương thích trên Android và máy tính có thể hiện nút cài hoặc mục cài trong menu.
4. Tắt mạng, mở lại địa chỉ hoặc biểu tượng đã cài. Chọn một lớp chưa mở, chọn đáp án và xem tiến độ.
5. Khi có bản mới, mở app qua mạng để trình duyệt tải worker mới. Sau khi tải xong, đóng các tab/cửa sổ của app và mở lại để kích hoạt phiên bản mới.

Nếu đang dùng `npm run dev`, app chỉ bật luồng giao diện và bài mẫu. Khi kiểm tra PWA, luôn dùng `npm run build` rồi `npm start`. Nếu trình duyệt chặn bộ nhớ cục bộ hoặc đang dùng chế độ riêng tư, khả năng giữ tiến độ và ngoại tuyến phụ thuộc vào trình duyệt.

## Push GitHub và deploy Vercel

Với repo GitHub mới và rỗng, chạy từ thư mục chứa `package.json`. Thay địa chỉ minh họa bằng repo của Boss:

```bash
git init
git add .
git commit -m "Release Hoc Trinh V0.1.0"
git branch -M main
git remote add origin https://github.com/TEN-TAI-KHOAN/TEN-REPO.git
git push -u origin main
```

Với repo đã có nội dung, clone repo, mở nhánh tích hợp và đưa source vào đúng thư mục dự án. Nếu gặp `fetch first`, fetch và tích hợp thay đổi từ remote trước khi push.

1. Trong Vercel, chọn **Add New → Project**, rồi import repo GitHub và đặt production branch là `main` hoặc nhánh Boss đang dùng.
2. Chọn thư mục chứa `package.json` làm **Root Directory**. `vercel.json` đặt framework Next.js, lệnh build `npm run build` và thư mục xuất `out`. Chọn Node.js 22.x hoặc 24.x.
3. Deploy, mở URL HTTPS và kiểm tra trang chủ, chọn lớp, tiến độ và trạng thái ngoại tuyến.
4. Lần sau, push vào production branch để Vercel triển khai. Có thể rollback về bản deploy trước trong Vercel khi cần. Tiến độ hiện tại ở trình duyệt, vì vậy giữ cùng tên miền khi nâng phiên bản.

## Nâng cấp tiếp theo

Gửi lại ZIP phiên bản mới nhất và yêu cầu triển khai **V0.2.0 — Curriculum Master Data**. Xem chi tiết trong `ROADMAP.md`.
