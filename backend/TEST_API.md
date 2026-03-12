Hướng dẫn test nhanh API backend (SQL Server)

Yêu cầu:
- Đã cấu hình file `.env` trỏ tới SQL Server.
- Đã cài node modules: `npm install` trong thư mục `backend`.

Bước chạy server (Windows cmd):

cd backend
npm run dev

Màn hình console sẽ in ra: `✅ SQL Server database connected successfully.` nếu kết nối OK.

Script test nhanh (Windows): `test_api.bat` — chạy trong cmd để thực thi một vài request mẫu.

Endpoints mẫu (giả sử server chạy trên `http://localhost:4000`):
- GET /api/modules
- GET /api/categories?module_id=1
- GET /api/contents?categoryId=1
- POST /api/auth/register
- POST /api/auth/login

Lưu ý:
- Một số endpoint yêu cầu authentication (token). `authRoutesDemo` là route demo, nếu project cấu hình auth khác, hãy dùng route tương ứng.
- Nếu database schema ở SQL Server khác (ví dụ chưa chuyển `AUTO_INCREMENT` → `IDENTITY`), các INSERT có thể lỗi. Cần chạy migration hoặc tạo bảng tương ứng trước khi test.
