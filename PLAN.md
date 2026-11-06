# Kế hoạch Hương Muối

## Mục tiêu

Shop quần áo tiếng Việt có carousel lookbook, phòng phối đồ kéo thả cho Nam/Nữ, mẫu minh hoạ thay đổi theo size, giỏ hàng và đặt hàng COD thực sự lưu vào cơ sở dữ liệu. Giao diện đỏ/trắng lấy cảm hứng từ mẫu Outfit Carousel, dùng nhận diện và nội dung riêng.

## Các mốc

| Mốc | Nội dung | Trạng thái |
| --- | --- | --- |
| 1. Giao diện | Skin đỏ, responsive, ảnh người mẫu thật, phối đồ kéo thả/chạm | Đã dựng bản mô phỏng ảnh |
| 2. Luồng mua | Giỏ, chọn size, form COD, lưu đơn mẫu trên trình duyệt | Đã dựng |
| 3. Quản trị | Thêm/sửa/ẩn sản phẩm, ảnh, tồn kho, trạng thái đơn | Đã dựng; đồng bộ cần Supabase |
| 4. Dữ liệu online | Chạy SQL, tạo tài khoản admin, điền URL/publishable key | Chờ tài khoản Supabase của shop |
| 5. Xuất bản | Đẩy repo lên GitHub, bật GitHub Pages | Chờ repository GitHub của shop |
| 6. Mở bán | Thay dữ liệu demo, chốt vận chuyển/đổi trả/bảo mật, thử đơn thật | Chờ thông tin shop |

## Trước khi mở bán công khai

- Thay tên shop, ảnh, mô tả, giá, bảng size và tồn kho mẫu bằng dữ liệu thật; xác nhận quyền sử dụng ảnh.
- Cung cấp chính sách đổi trả, vận chuyển, bảo mật, thông tin liên hệ và địa chỉ kinh doanh.
- GitHub Pages phục vụ giao diện tĩnh. Cần dự án Supabase để dữ liệu sản phẩm và đơn hàng được chia sẻ giữa mọi khách. URL mặc định có thể là `username.github.io/repository/`; tên miền riêng thêm sau.
- Nếu muốn thanh toán online, đăng ký tài khoản merchant VNPay/MoMo hoặc nhà cung cấp phù hợp rồi tích hợp API và webhook. COD hoạt động trước.
- Ảnh hiện tại là ảnh nguyên bộ có sẵn; chọn size không thay đổi người mẫu. Chưa mô phỏng độ vừa vặn chính xác hoặc các tổ hợp chưa có ảnh. Muốn thử đồ tự do cần bộ ảnh đầy đủ hoặc dịch vụ virtual try-on riêng.

## Kiến trúc

- Frontend: HTML/CSS/JavaScript thuần, GitHub Pages, responsive.
- Backend dữ liệu: Supabase REST/Auth/Storage/Postgres khi kết nối; RLS bảo vệ dữ liệu.
- Dữ liệu demo: `catalog.json` và localStorage. Thay đổi trong quản trị demo chỉ hiển thị trên trình duyệt đang dùng.
- Thanh toán: COD. Hàm Postgres xác minh giá và tồn kho khi kết nối Supabase; trình duyệt chỉ gửi ID, size và số lượng.

## Tiêu chí hoàn thành bản đầu

- Có thể phối đồ bằng kéo thả hoặc chạm, đổi giới tính/size và thêm set vào giỏ.
- Tạo đơn COD từ giỏ và nhận mã đơn; đơn xuất hiện trong quản trị. Chế độ demo chỉ lưu cục bộ; chế độ Supabase lưu dùng chung.
- Giỏ không mất khi tải lại trang; kiểm tra các trường bắt buộc, giá và tồn kho phía cơ sở dữ liệu sau khi kết nối Supabase.
- Giao diện usable ở desktop và điện thoại, có điều hướng bàn phím và chế độ giảm chuyển động.

## Trước khi công khai nhận đơn

- Thử tạo đơn từ hai trình duyệt khác nhau và xác nhận đơn xuất hiện trong quản trị.
- Xác minh khách không thể xem dữ liệu người mua, sửa giá/tồn kho hoặc xem toàn bộ đơn qua API.
- Thêm biện pháp chống spam đơn, sao lưu dữ liệu và kiểm tra các chính sách kinh doanh.

