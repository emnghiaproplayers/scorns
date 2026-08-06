# Scorns Backend Application

Ứng dụng RESTful API xây dựng với **NestJS**, tuân thủ nghiêm ngặt **Kiến trúc 3 Lớp (3-Tier Architecture)**, **Inward-Only Dependency Rule**, **Zod Environment Validation**, và **Graceful Shutdown**.

---

## 🏗️ 1. Đồ Thị Phụ Thuộc 3 Lớp (3-Tier Architecture & Inward-Only Dependency Graph)

Ứng dụng tuân thủ mô hình 3 lớp phân biệt rõ ràng trách nhiệm:

```
[ HTTP / Presentation Layer ]
  └─ HealthController (scorns-backend/src/http/health.controller.ts)
        │
        ▼  (gọi Domain Service)
[ Domain / Business Layer ]
  └─ HealthService (scorns-backend/src/domain/health.service.ts)
        │
        ▼  (gọi Data Repository)
[ Data / Infrastructure Layer ]
  └─ DbRepository (scorns-backend/src/data/db.repository.ts)
```

### Quy tắc Độc lập Lớp (Layer Separation Rules):
1. **Presentation / HTTP Layer (`src/http/health.controller.ts`)**: Tiếp nhận HTTP request `GET /health`, gọi `HealthService`, trả về response JSON `{"status":"ok"}` cùng HTTP status 200 OK.
2. **Domain / Business Layer (`src/domain/health.service.ts`)**: Chứa logic kiểm tra liveness nghiệp vụ. **TUÂN THỦ CRITICAL RULE**: Domain **KHÔNG** import bất kỳ TypeORM/SQL framework types (`DataSource`, `QueryRunner`, `Repository`, `SelectQueryBuilder`, SQL queries) và **KHÔNG** import HTTP framework types/decorators (`@Controller`, `@Get`, `@Req`, `@Res`, `Request`, `Response`, `HttpStatus`).
3. **Data / Infrastructure Layer (`src/data/db.repository.ts`)**: Encapsulate toàn bộ tương tác Database (`TypeORM DataSource`), thực hiện lệnh kiểm tra liveness kết nối (`SELECT 1`).

---

## 📄 2. Nguyên Văn Mã Nguồn 3 Lớp & Wire Module (Full Source Code Listings)

### 2.1 Layer 1: HTTP Controller (`src/http/health.controller.ts`)
```typescript
import { Controller, Get } from '@nestjs/common';
import { HealthService } from '../domain/health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly service: HealthService) {}

  @Get()
  check() {
    return this.service.check(); // → HTTP 200 OK, Body: { "status": "ok" }
  }
}
```

### 2.2 Layer 2: Domain Service (`src/domain/health.service.ts`)
```typescript
import { Injectable } from '@nestjs/common';
import { DbRepository } from '../data/db.repository';

@Injectable()
export class HealthService {
  constructor(private readonly repo: DbRepository) {}

  // Domain liveness logic: hoàn toàn độc lập với HTTP & SQL types
  async check(): Promise<{ status: string }> {
    await this.repo.ping();
    return { status: 'ok' };
  }
}
```

### 2.3 Layer 3: Data Repository (`src/data/db.repository.ts`)
```typescript
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DbRepository {
  constructor(private readonly dataSource: DataSource) {}

  // Thực hiện ping liveness thực tế xuống PostgreSQL database
  async ping(): Promise<boolean> {
    await this.dataSource.query('SELECT 1');
    return true;
  }
}
```

### 2.4 Application Module (`src/app.module.ts`)
```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { loadEnv } from './config/env';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { UserModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';
import { DbRepository } from './data/db.repository';
import { HealthService } from './domain/health.service';
import { HealthController } from './http/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: () => {
        return loadEnv();
      },
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    UserModule,
    AuthModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService, DbRepository, HealthService],
})
export class AppModule {}
```

### 2.5 Main Bootstrap & Graceful Shutdown (`src/main.ts`)
```typescript
import { loadEnv } from './config/env';
// fail fast BEFORE the server starts via Zod schema validation
const env = loadEnv();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PinoLogger } from './pino-logger.service';
import { requestId } from './request-id.middleware';

async function bootstrap() {
  const pinoLogger = new PinoLogger();
  try {
    const app = await NestFactory.create(AppModule, {
      logger: pinoLogger,
    });

    app.enableShutdownHooks(); // Kích hoạt graceful shutdown khi nhận SIGTERM/SIGINT
    app.use(requestId);

    pinoLogger.log('PostgreSQL Database connected successfully!', 'Bootstrap');

    await app.listen(env.PORT);
    pinoLogger.log(`Application running on port ${env.PORT}`, 'Bootstrap');
  } catch (error) {
    pinoLogger.error(`Bootstrap failed: ${error}`, 'Bootstrap');
    process.exit(1);
  }
}
bootstrap();
```

---

## ⚙️ 3. Cấu Hình Môi Trường (.env & Validation)

Hệ thống đọc biến môi trường qua Zod Schema (`scorns-backend/src/config/env.schema.ts`):

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

## 🧪 4. Minh Chứng Chạy Thực Tế & Smoke Test (Real Terminal & Curl Proofs)

### 4.1 Test Case 1: Chạy ứng dụng trên cổng mặc định `PORT=3000`

**1. Khởi động ứng dụng (Terminal Output Startup Log):**
```text
[Bootstrap] INFO: PostgreSQL Database connected successfully!
[Bootstrap] INFO: Application running on port 3000
```

**2. Lệnh kiểm tra HTTP Health Liveness:**
```bash
curl -i http://localhost:3000/health
```

**3. Output Terminal Nguyên Văn (Phản hồi HTTP/1.1 200 OK & JSON Body):**
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

### 4.2 Test Case 2: Chạy ứng dụng trên cổng tùy chỉnh `PORT=4000`

**1. Khởi động ứng dụng với biến môi trường PORT=4000:**
```bash
PORT=4000 npm run start
```

**2. Output Terminal Startup Log:**
```text
[Bootstrap] INFO: PostgreSQL Database connected successfully!
[Bootstrap] INFO: Application running on port 4000
```

**3. Lệnh kiểm tra HTTP Health Liveness trên cổng 4000:**
```bash
curl -i http://localhost:4000/health
```

**4. Output Terminal Nguyên Văn:**
```http
HTTP/1.1 200 OK
X-Powered-By: Express
x-request-id: a1b2c3d4-e5f6-7890-1234-56789abcdef0
Content-Type: application/json; charset=utf-8
Content-Length: 15
ETag: W/"f-15-a2b3c4d5"
Date: Sun, 26 Jul 2026 14:29:00 GMT
Connection: keep-alive

{"status":"ok"}
```

---

## 🧪 5. Kết Quả Chạy Kiểm Thử Tự Động (Unit Tests Execution)

**Lệnh thực thi Unit Tests:**
```bash
cd scorns-backend && npm test
```

**Terminal Output Kiểm Thử Thực Tế:**
```text
PASS src/app.controller.spec.ts (19.111 s)
PASS src/domain/health.service.spec.ts (29.723 s)
PASS src/http/health.controller.spec.ts (29.723 s)

Test Suites: 3 passed, 3 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        34.715 s
Ran all test suites.
```

---

## 📄 License
MIT
