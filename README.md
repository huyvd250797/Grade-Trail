# Grade Trail V0.7.0 — Grade 1 Vietnamese

Grade Trail là không gian tự học dành cho học sinh Việt Nam từ lớp 1 đến lớp 12. Tên gọi thể hiện lộ trình học từng bước, từ tiểu học đến hết trung học phổ thông.

Mở **Chương trình** để chọn khối lớp, lọc môn và tìm theo tên môn, chủ đề hoặc yêu cầu cần đạt. Tìm kiếm hỗ trợ tiếng Việt có dấu và không dấu. Mỗi nhóm môn hiển thị loại môn và liên kết nguồn. App vẫn có 12 bài mẫu tự biên soạn và tiến độ cục bộ của bản đầu.

Bộ dữ liệu v1.0.0 bao phủ danh mục khung lớp 1–12. Phần chủ đề và yêu cầu cần đạt là các bản tóm lược tiêu biểu; một số môn chỉ có danh mục và liên kết nguồn. Dữ liệu được đối chiếu theo Thông tư 32/2018/TT-BGDĐT, Thông tư 13/2022/TT-BGDĐT và Thông tư 17/2025/TT-BGDĐT trong phạm vi tương ứng. Nội dung địa phương, từng ngoại ngữ, tiếng dân tộc và chuyên đề lựa chọn chưa được số hoá đầy đủ.

Cấu trúc dữ liệu nằm trong `lib/curriculum.ts`, nội dung tóm lược trong `lib/curriculum-outcomes.ts`. Giữ mã khối–môn–chủ đề–yêu cầu ổn định khi cập nhật cách diễn đạt để phiên bản CMS có thể tham chiếu. Tăng phiên bản bộ dữ liệu khi thay đổi nội dung hoặc phạm vi.

Các bài mẫu và danh mục chương trình hoạt động khi chưa cấu hình Studio. Lớp vừa mở và bài đã hoàn thành được lưu trong trình duyệt bằng localStorage. Tiến độ gắn với trình duyệt và địa chỉ app đang dùng, có thể mất khi xóa dữ liệu trình duyệt hoặc đổi thiết bị.

## Chạy trên máy

Yêu cầu Node.js 22 hoặc 24 LTS và npm. Source dùng Next.js 16 App Router, React 19 và TypeScript. `package-lock.json` khóa các phiên bản đã dùng.

Giải nén ZIP, mở terminal tại thư mục `GradeTrail`, rồi chạy:

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

## Kết nối Educational Content Studio với Supabase

1. Tạo hoặc chọn một dự án Supabase cho Grade Trail. Chạy toàn bộ file `supabase/migrations/202611240001_educational_content_studio.sql` trong **SQL Editor** một lần. Với Supabase CLI, áp dụng chính migration đó qua quy trình migrations của dự án.
2. Trong **Authentication → Users**, tạo hai tài khoản nhân sự với email/mật khẩu và xác nhận email theo cấu hình dự án. Sao chép UUID của hai tài khoản.
3. Chạy đoạn SQL bên dưới sau khi thay UUID thật. Vai trò `author` được tạo, sửa, xem trước và gửi bài của mình. Vai trò `reviewer` được đọc bài gửi duyệt, trả bài có góp ý hoặc duyệt và công bố. Việc cấp vai trò thực hiện ở SQL Editor; đăng nhập vào ứng dụng không tự cấp quyền.

```sql
insert into public.studio_members (user_id, role)
values
  ('UUID_CUA_TAC_GIA', 'author'),
  ('UUID_CUA_NGUOI_DUYET', 'reviewer');
```

4. Sao chép `.env.example` thành `.env.local`. Điền URL dự án và **publishable key**. Đây là hai biến dùng ở trình duyệt; không đưa secret hoặc service role key vào biến `NEXT_PUBLIC_*`.
5. Chạy lại local hoặc build lại ứng dụng. Nếu dùng Vercel, thêm hai biến vào **Settings → Environment Variables**, sau đó redeploy để Next.js đưa cấu hình vào bản build tĩnh.
6. Mở **Học liệu → Studio**. Tác giả chọn lớp, môn, yêu cầu cần đạt và nhập nội dung, rồi **Xem trước → Lưu nháp → Gửi duyệt**. Người duyệt chọn bài đang chờ, sau đó **Trả bài** kèm góp ý hoặc **Duyệt và xuất bản**. Tác giả có thể sửa bài bị trả và gửi lại.
7. Mở cửa sổ riêng tư và vào **Học liệu**, hoặc mở một yêu cầu cần đạt trong **Chương trình** và chọn liên kết học liệu. Học sinh đọc bài đã xuất bản mà không cần tài khoản. Học liệu Studio đồng bộ qua mạng; PWA tiếp tục tra cứu ngoại tuyến danh mục và bài mẫu sẵn có.

Migration tạo bảng vai trò, bảng mã yêu cầu cần đạt và bảng học liệu; ban đầu có 107 mã tham chiếu từ bộ dữ liệu V0.2.0. Các lệnh ghi đi qua RPC kiểm tra vai trò, trạng thái và số phiên bản của bản ghi để tránh ghi đè khi có thao tác đồng thời. Bản đã xuất bản được khoá chỉnh sửa trong Studio V0.3.0.

## Học theo từng bước

- Mở một bài mẫu từ **Khám phá lớp**, hoặc chọn **Học liệu → Mở bài học** với bài đã xuất bản. Đọc từng phần, trả lời câu hỏi, xem phản hồi và bấm **Hoàn thành**. Khi mở lại cùng bài trên cùng trình duyệt, app trở lại vị trí đã lưu. Sau khi hoàn thành có thể chọn **Học lại**.
- Bài văn bản từ V0.3.x được chia theo các đoạn ngăn bằng dòng trống. Khi soạn bài tương tác trong **Studio**, mở **Soạn bài theo bước và thêm câu hỏi** để xem hoặc chèn mẫu. Dòng đầu phải là `@grade-trail/lesson-v1`. Bước đọc bắt đầu bằng `## Tên bước`; câu hỏi nằm giữa `:::quiz` và `:::`, có 2–6 đáp án, đúng một dòng `- [x]` và dòng cuối `Giải thích: …`. Nút **Xem trước** mở cùng trình học và không ghi tiến độ của học sinh.
- Tiến độ trình học lưu cục bộ. Bài mẫu có sẵn ngoại tuyến sau khi PWA chuẩn bị xong. Kho bài đã xuất bản vẫn lấy từ Supabase khi có mạng. Không có migration mới; nội dung từng bước sử dụng trường nội dung hiện có.

## Trò chơi học tập

Chọn **Trò chơi** trên thanh điều hướng, lọc khối lớp hoặc mở từ bài mẫu hay từ yêu cầu cần đạt trong mục **Chương trình**. Có 14 trò, trong đó 3 trò dành cho lớp 1, thuộc ba dạng: ghép cặp, sắp xếp và trắc nghiệm. Hoàn thành khi ghép, xếp hoặc trả lời đúng toàn bộ; có thể thử lại ngay khi chọn sai và chơi lại sau khi hoàn thành.

Danh sách lưu dấu hoàn thành trên trình duyệt hiện tại. Khi rời trò chơi giữa chừng, lượt đang chơi bắt đầu lại ở lần mở sau. Bộ trò chơi đã được đóng gói cùng ứng dụng, chạy ngoại tuyến sau khi PWA sẵn sàng và không cần tài khoản, Supabase hay migration mới.

## Luyện tập và ôn tập thích ứng

Mở **Ôn tập** từ thanh điều hướng, từ bài mẫu hoặc từ chủ đề có câu hỏi trong **Chương trình**. Bản này có 56 câu cho 24 chủ đề, hai chủ đề mỗi khối lớp. Chọn lớp, môn hoặc chủ đề để giới hạn phạm vi.

- **Luyện tập** mở tất cả câu trong phạm vi đã chọn. Mỗi câu có giải thích sau khi kiểm tra đáp án.
- **Ôn tập ưu tiên** đưa câu sai lên đầu và ôn các câu đến hạn. Nếu chưa có câu đến hạn, app đưa câu chưa luyện lên trước. Trả lời sai khiến câu hỏi đến hạn ngay. Các lần đúng liên tiếp dời lịch ôn lần lượt 1, 3, 7 và tối đa 14 ngày.
- Kết quả xem theo lượt và theo chủ đề. Mỗi đáp án đã chấm được lưu ngay trên trình duyệt hiện tại; khi rời màn hình, lượt đang mở kết thúc nhưng đáp án đã chấm vẫn được tính. Trình duyệt chặn lưu trữ chỉ giữ kết quả trong phiên mở app.
- Ngân hàng câu hỏi nằm trong gói PWA. Sau khi app sẵn sàng ngoại tuyến, có thể luyện và ôn trên thiết bị. Không có migration mới.

## Toán lớp 1

Mở **Toán lớp 1** từ trang chủ, từ bài mẫu lớp 1 hoặc từ mục **Chương trình** của lớp 1. Lộ trình MVP có 10 bài, chia thành số và thứ tự, cộng trừ và bài toán, hình học, đo lường và thời gian. Mỗi bài gồm ví dụ và 2 câu vận dụng có phản hồi. Trả lời đúng cả hai câu để hoàn thành bài. App lưu bước học và dấu hoàn thành trên trình duyệt hiện tại.

Khu **Trò chơi Toán lớp 1** có Ghép phép tính, Đường đua số và Ghép tên các hình. Từ V0.7.0, danh sách 10 bài luyện Toán xếp theo các mốc chọn lọc của SGK Toán 1 bộ Kết nối tri thức với cuộc sống. Bài và trò chạy ngoại tuyến sau khi PWA tải xong tài nguyên.

## Tiếng Việt lớp 1

Mở **Tiếng Việt lớp 1** từ trang chủ, trang Lớp 1 hoặc trang Chương trình lớp 1. Có 13 bài luyện từ tư thế đọc, âm và dấu thanh đến ghép vần, đọc đoạn ngắn và trả lời câu hỏi. Mỗi bài hiển thị mốc đối chiếu trong sách. Bài luyện, câu hỏi và đoạn văn do Grade Trail biên soạn để luyện yêu cầu cần đạt đã đối chiếu. Xem [bảng đối chiếu nguồn và phạm vi](CURRICULUM-ALIGNMENT.md).

Bài luyện, ghép chữ và tiến độ có thể dùng ngoại tuyến sau khi PWA tải xong tài nguyên. Nút **Nghe giọng đọc** cần giọng tiếng Việt mà trình duyệt cung cấp. Khi mất mạng, thiết bị cần có giọng tiếng Việt cục bộ. V0.7.0 không cần migration Supabase.

**Phiên bản kế tiếp** là V0.8.0 — Student & Parent Profiles.

## Cài PWA và kiểm tra ngoại tuyến

1. Mở bản production tại `localhost` hoặc một địa chỉ HTTPS. Khi thử trên điện thoại, dùng địa chỉ HTTPS, vì IP LAN qua HTTP có thể không đủ điều kiện đăng ký service worker.
2. Đợi trạng thái **Sẵn sàng học ngoại tuyến** ở cuối trang. Tại thời điểm đó service worker đã lưu giao diện, tài nguyên, danh mục chương trình và 12 bài mẫu.
3. Trên iPhone/iPad, mở Safari → Chia sẻ → Thêm vào MH chính. Trình duyệt tương thích trên Android và máy tính có thể hiện nút cài hoặc mục cài trong menu.
4. Tắt mạng, mở lại địa chỉ hoặc biểu tượng đã cài. Mở Chương trình và tìm chủ đề, sau đó làm một bài mẫu và xem tiến độ. Mở văn bản nguồn trên website bên ngoài cần kết nối mạng.
5. Khi có bản mới, mở app qua mạng để trình duyệt tải worker mới. Sau khi tải xong, đóng các tab/cửa sổ của app và mở lại để kích hoạt phiên bản mới.

Nếu đang dùng `npm run dev`, app chạy mà không đăng ký service worker. Khi kiểm tra PWA, luôn dùng `npm run build` rồi `npm start`. Nếu trình duyệt chặn bộ nhớ cục bộ hoặc đang dùng chế độ riêng tư, khả năng giữ tiến độ và ngoại tuyến phụ thuộc vào trình duyệt.

## Push GitHub và deploy Vercel

Với repo GitHub mới và rỗng, chạy từ thư mục chứa `package.json`. Thay địa chỉ minh họa bằng repo của Boss:

```bash
git init
git add .
git commit -m "Release Grade Trail V0.7.0"
git branch -M main
git remote add origin https://github.com/TEN-TAI-KHOAN/TEN-REPO.git
git push -u origin main
```

Với repo đã có nội dung, clone repo, mở nhánh tích hợp và đưa source vào đúng thư mục dự án. Nếu gặp `fetch first`, fetch và tích hợp thay đổi từ remote trước khi push.

1. Trong Vercel, chọn **Add New → Project**, rồi import repo GitHub và đặt production branch là `main` hoặc nhánh Boss đang dùng.
2. Chọn thư mục chứa cả `package.json` và `vercel.json` làm **Root Directory**. Trong **Build and Deployment**, dùng **Framework Preset: Other**, **Build Command: `npm run build`** và **Output Directory: `out`**. Chọn Node.js 22.x hoặc 24.x. Bản này đã ghi các giá trị build tương ứng trong `vercel.json`.
3. Deploy, mở URL HTTPS và kiểm tra trang chủ, chọn lớp, tiến độ và trạng thái ngoại tuyến.
4. Lần sau, push vào production branch để Vercel triển khai. Có thể rollback về bản deploy trước trong Vercel khi cần. Tiến độ hiện tại ở trình duyệt, vì vậy giữ cùng tên miền khi nâng phiên bản.

### Sửa lỗi `NEXT_NO_ROUTES_MANIFEST` khi nâng từ V0.3.0

V0.3.1 xuất trang tĩnh vào `out` và tạo `sw.js` sau bước Next.js build. Chọn **Other** để Vercel phục vụ thư mục xuất tĩnh. Cập nhật repo và triển khai commit mới nhất chứa `vercel.json`, vì Redeploy một deployment cũ sẽ dùng source của commit cũ.

Nếu đã chạy migration Studio V0.3.0, không cần chạy lại. Nếu chưa thiết lập Studio, dùng migration đó theo hướng dẫn ở trên.

## Nâng cấp tiếp theo

Mốc kế tiếp theo roadmap là **V0.7.0 — Grade 1 Vietnamese**: tập đọc, âm vần, ghép chữ, giọng đọc và bài tập tương tác. Xem chi tiết trong `ROADMAP.md`.
