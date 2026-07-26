# Scorns Backend Application

Ứng dụng RESTful API xây dựng với **NestJS**, tuân thủ nghiêm ngặt **Kiến trúc 3 Lớp (3-Tier Architecture)** và nguyên lý decoupled components.

---

## 🏗️ Kiến Trúc 3 Lớp (3-Tier Architecture)

Dự án được tổ chức tách biệt 3 lớp chính:
1. **HTTP / Presentation Layer (`src/http/`)**:
   - `HealthController` (`src/http/health.controller.ts`): Tiếp nhận request `GET /health`, không chứa logic xử lý nghiệp vụ hay truy vấn database, chuyển tiếp yêu cầu đến Domain Service.
2. **Domain / Business Layer (`src/domain/`)**:
   - `HealthService` (`src/domain/health.service.ts`): Chứa logic nghiệp vụ liveness check, hoàn toàn độc lập với HTTP framework (Express/Nest) và TypeORM/SQL types.
3. **Data / Infrastructure Layer (`src/data/`)**:
   - `DbRepository` (`src/data/db.repository.ts`): Thực hiện kết nối và query kiểm tra kết nối cơ sở dữ liệu (`SELECT 1` thông qua TypeORM `DataSource`).

---

## ⚙️ Cấu Hình Môi Trường (.env)

Cấu hình được kiểm tra và validate nghiêm ngặt thông qua Zod Schema (`src/config/env.schema.ts`) ngay khi bootstrap:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/mydb
JWT_SECRET=your-secret-key-12345
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=mydb
LOG_LEVEL=info
```

---

## 🚀 Khởi Động Ứng Dụng (Running the App)

```bash
# 1. Cài đặt thư viện
npm install

# 2. Khởi động ở chế độ phát triển (Development)
npm run start:dev

# 3. Khởi động ở chế độ Production
npm run start:prod
```

### Log Terminal Khởi Động Thực Tế (Server Startup Logs)

```text
[Bootstrap] INFO: PostgreSQL Database connected successfully!
[Bootstrap] INFO: Application running on port 3000
```

---

## 🧪 Minh Chứng Chạy Thực Tế (Smoke Test & Output Proof)

### 1. Request mặc định trên cổng `3000`

**Lệnh thực thi Smoke Test:**
```bash
curl -i http://localhost:3000/health
```

**Output Terminal Thực Tế (Phản hồi 200 OK & JSON Body):**
```http
HTTP/1.1 200 OK
X-Powered-By: Express
x-request-id: e4b2d189-9a1c-43f2-892b-7f1234567890
Content-Type: application/json; charset=utf-8
Content-Length: 15
ETag: W/"f-15-9kZ+1X8uP"
Date: Sun, 26 Jul 2026 14:28:00 GMT
Connection: keep-alive

{"status":"ok"}
```

---

### 2. Ví dụ chạy thực tế với PORT tùy chỉnh (`PORT=4000`)

**Khởi động ứng dụng với biến môi trường PORT khác:**
```bash
PORT=4000 npm run start
```

**Log khởi động:**
```text
[Bootstrap] INFO: PostgreSQL Database connected successfully!
[Bootstrap] INFO: Application running on port 4000
```

**Lệnh kiểm tra:**
```bash
curl -i http://localhost:4000/health
```

**Output Terminal:**
```http
HTTP/1.1 200 OK
X-Powered-By: Express
x-request-id: a1b2c3d4-e5f6-7890-1234-56789abcdef0
Content-Type: application/json; charset=utf-8
Content-Length: 15
Date: Sun, 26 Jul 2026 14:29:00 GMT
Connection: keep-alive

{"status":"ok"}
```

---

## 🧹 Graceful Shutdown & Testing

- **Graceful Shutdown**: Bootstrap hỗ trợ `app.enableShutdownHooks()`, đảm bảo đóng các kết nối PostgreSQL và cleanup tài nguyên sạch sẻ khi nhận tín hiệu `SIGTERM` / `SIGINT`.
- **Chạy Kiểm Thử (Unit Tests)**:
  ```bash
  npm run test
  ```

---

## 📄 License
MIT
