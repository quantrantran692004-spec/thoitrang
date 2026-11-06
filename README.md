# Hương Muối — shop thời trang

Website thời trang tiếng Việt có carousel người mẫu, tủ sản phẩm, giỏ hàng COD và trang quản trị. Mỗi bộ phối dùng một ảnh nguyên bộ có sẵn; chạm hoặc kéo sản phẩm để xem chi tiết và các bộ có chứa sản phẩm. Ảnh trong `assets/looks` được tạo riêng cho dự án.

## Xem trên máy

Mở terminal tại thư mục này và chạy:

```powershell
python -m http.server 4173
```

Truy cập `http://localhost:4173/` và `http://localhost:4173/admin.html`. Cần dùng máy chủ HTTP; mở `index.html` trực tiếp bằng `file://` sẽ khiến `fetch('catalog.json')` không hoạt động trong nhiều trình duyệt.

## Hai chế độ dữ liệu

- **Demo:** để trống `config.js`. Sản phẩm lấy từ `catalog.json`, thay đổi trong quản trị và đơn hàng chỉ lưu bằng localStorage của trình duyệt đó. Đây là chế độ xem và thử tính năng, **không nhận đơn từ khách ở máy khác**.
- **Online:** kết nối Supabase. Sản phẩm/ảnh/đơn hàng dùng chung; hàm SQL `place_order` lấy giá từ database, khoá dòng sản phẩm và kiểm tra tồn kho trước khi tạo đơn COD. Trang quản trị yêu cầu đăng nhập và quyền trong `admin_users`.

## Kết nối Supabase để nhận đơn thật

1. Tạo dự án Supabase và mở **SQL Editor**. Chạy `supabase/schema.sql`, sau đó `supabase/seed.sql`.
2. Tạo tài khoản quản trị ở **Authentication → Users**. Sau đó chạy SQL dưới đây, thay email bằng email đã tạo:

   ```sql
   insert into public.admin_users(user_id)
   select id from auth.users where email = 'email-cua-ban@example.com'
   on conflict do nothing;
   ```

3. Trong **Connect** hoặc **Settings → API Keys**, lấy Project URL và **publishable key** (`sb_publishable_...`). Điền vào `config.js`:

   ```js
   window.SHOP_CONFIG = {
     supabaseUrl: 'https://PROJECT_REF.supabase.co',
     supabasePublishableKey: 'sb_publishable_...'
   };
   ```

   Publishable key dùng được trong web công khai, nhưng **không bao giờ** đặt secret/service role key vào `config.js` hoặc GitHub. Quyền truy cập dựa trên Postgres grants và RLS trong `schema.sql`.

4. Đăng nhập tại `admin.html`, cập nhật tên, giá, tồn kho từng size và ảnh sản phẩm. Các URL ảnh mặc thử trong quản trị hiện chỉ được lưu; muốn thêm bộ phối vào carousel cần khai báo ảnh nguyên bộ và danh sách sản phẩm trong `catalog.json`. Tạo một đơn thử từ cửa sổ ẩn danh, kiểm tra đơn xuất hiện trong quản trị. Sau đó xoá/huỷ đơn thử trong Supabase Dashboard nếu cần.

**Lưu ý:** chưa có tích hợp thanh toán online; khách đặt COD. Tổng tiền chưa gồm phí giao hàng, shop xác nhận khi liên hệ. Nên thêm chống spam đơn, chính sách vận chuyển/đổi trả/bảo mật và thông tin liên hệ trước khi mở bán công khai.

## Đưa lên GitHub Pages

Repo này dùng đường dẫn tương đối, chạy được trên URL kiểu `username.github.io/ten-repo/`.

1. Tạo repository GitHub và đẩy các file của dự án lên nhánh mặc định.
2. Vào **Settings → Pages → Build and deployment**, chọn **Deploy from a branch**, nhánh mặc định và thư mục `/(root)`, rồi **Save**.
3. Kiểm tra URL Pages sau khi GitHub xuất bản. `admin.html` có ở cùng URL thêm `/admin.html`.

GitHub Pages chỉ lưu file tĩnh; để nhận đơn từ các thiết bị khác nhau cần hoàn thành phần Supabase ở trên. Không có Git remote hoặc tài khoản GitHub được cấu hình trong checkout hiện tại, nên chưa thể tự xuất bản từ máy này.

## Nội dung và giới hạn

- `catalog.json` chứa giá, kho và tên **demo**. Đừng mở bán khi chưa thay bằng dữ liệu thật.
- Carousel chỉ dùng ảnh nguyên bộ có sẵn, không ghép ảnh quần áo lên người. Size được chọn để mua, không thay đổi ảnh mẫu. Khi món không nằm trong bộ đang xem, trang giữ nguyên ảnh và gợi ý những bộ có ảnh của món đó. Đây chưa phải virtual try-on AI hay công cụ đo độ vừa vặn.
- `tryon-provider.js` tách bộ xử lý ảnh khỏi giao diện; hiện dùng ảnh có sẵn, không gửi dữ liệu ra dịch vụ ngoài. Có thể thay provider khi phát triển AI sau này.
- Khi có Supabase, ảnh upload từ quản trị lưu trong bucket `products` công khai. Ảnh lookbook hiện là file tĩnh trong repo.
- `supabase/seed.sql` được tạo từ `catalog.json` bằng `node scripts/build-seed.mjs`; lệnh seed không ghi đè sản phẩm đã chỉnh.

## Tài liệu nền

- [GitHub Pages: publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Supabase: Data API security](https://supabase.com/docs/guides/api/securing-your-api)
- [Supabase: API keys](https://supabase.com/docs/guides/getting-started/api-keys)
