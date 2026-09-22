# Wolfari

Wolfari là nền tảng lập kế hoạch chuyến đi cho cá nhân và nhóm nhỏ: cùng xây lịch trình, lưu địa điểm, quản lý quỹ, nhận nhắc việc và xuất kế hoạch.

Kho mã nguồn hiện có nền kỹ thuật cho 7 ứng dụng NestJS:

- API Gateway/BFF và Export Worker;
- Identity, Trip Workspace, Travel Intelligence, Finance và Automation Service;
- PostgreSQL, RabbitMQ và MinIO chạy bằng Docker Compose;
- migration runner SQL thuần và package database dùng chung;
- liveness cho cả 7 ứng dụng, readiness database/migration cho 5 service nghiệp vụ.

API nghiệp vụ, Protobuf, event handler, giao diện và seed nghiệp vụ chưa thuộc baseline này. Xem [thiết kế hiện hành](docs/architecture/design-baseline.md), [môi trường phát triển](docs/architecture/development-environment.md) và [hướng dẫn database](docs/database/README.md).

Mục tiêu sản phẩm trong SRS gồm web người dùng, web quản trị và ứng dụng di động. Backend được chia theo ranh giới dữ liệu: 5 service nghiệp vụ sở hữu 5 database riêng; Gateway là điểm vào REST/HTTPS, giao tiếp đồng bộ dự kiến dùng gRPC, sự kiện bất đồng bộ dùng RabbitMQ và nội dung file dùng MinIO.

## Bắt đầu

Yêu cầu: Node.js 24, Docker Desktop/Compose và Corepack. pnpm `10.34.5` đã được pin trong `package.json`.

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm env:init
corepack pnpm infra:up
corepack pnpm infra:check
corepack pnpm db:migrate
corepack pnpm db:status
corepack pnpm dev
```

Ở terminal khác:

```sh
corepack pnpm dev:check
```

`env:init` sinh root `.env` cho Compose và `.env` riêng cho từng app, không ghi đè file đã tồn tại và không in secret. Các tiến trình ứng dụng chỉ nhận cấu hình thuộc service của mình; Gateway và Export Worker không nhận credential database.

`infra:up` chờ PostgreSQL, RabbitMQ và MinIO healthy rồi chạy smoke test bằng credential thật. `infra:down` dừng container nhưng giữ named volume. Nếu credential trong volume cũ khác `.env`, công cụ sẽ báo lỗi và không tự đổi mật khẩu hay xóa dữ liệu.

## Endpoint kỹ thuật

- `GET /health/live`: cả 7 ứng dụng, tại cổng `3000` và `3101`–`3106`.
- `GET /health/ready`: 5 service nghiệp vụ; kiểm tra kết nối, đúng database/role và migration baseline.
- Readiness trả `200` khi sẵn sàng, `503` khi database lỗi hoặc thiếu migration; response không chứa connection string hay lỗi SQL thô.

## Lệnh thường dùng

```sh
corepack pnpm db:status
corepack pnpm db:migrate
corepack pnpm db:migrate --service identity
corepack pnpm db:inspect
corepack pnpm db:test
corepack pnpm lint
corepack pnpm test
corepack pnpm build
corepack pnpm infra:down
```

Chi tiết cấu hình, cổng, xử lý lỗi và nguyên tắc sở hữu dữ liệu nằm trong [hướng dẫn môi trường](docs/architecture/development-environment.md).

## Tài liệu nguồn

- [SRS v2.0](docs/Wolfari_SRS_v2.0_ChinhThuc.docx)
- [ERD v1.1](docs/Wolfari_ERD_Database_v1.1_ChinhThuc.docx)
- [DDL/API/Event Specification v1.0](docs/Wolfari_DDL_API_Event_Specification_v1.0.docx)

SRS v2.2 được các tài liệu khác tham chiếu nhưng chưa có trong repository; V001 hiện có là baseline kỹ thuật của đợt này.

## Kiểm thử

```sh
corepack pnpm lint
corepack pnpm test
corepack pnpm build
corepack pnpm db:test
```

`db:test` dùng Compose project, cổng và volume thử nghiệm riêng rồi tự dọn sau khi hoàn tất. Không chạy các fixture phá lỗi trên database local dùng để phát triển. Kết quả kiểm tra gần nhất được ghi tại [docs/database/validation.md](docs/database/validation.md).

## Trạng thái phạm vi

- [x] Workspace 7 ứng dụng và hạ tầng local tái lập.
- [x] Migration runner cho 5 database và database provider dùng chung.
- [x] Liveness/readiness và kiểm thử tích hợp nền kỹ thuật.
- [ ] Đối chiếu SRS v2.2 còn thiếu.
- [ ] API nghiệp vụ, RPC/event và giao diện sản phẩm.

## Đóng góp và giấy phép

Trước khi mở pull request, chạy `corepack pnpm lint`, `corepack pnpm test`, `corepack pnpm build` và các kiểm thử tích hợp liên quan. Mọi thay đổi schema hoặc hợp đồng giao tiếp cần cập nhật tài liệu thiết kế tương ứng.

Dự án chưa công bố giấy phép sử dụng; cần thêm `LICENSE` trước khi phân phối ngoài phạm vi nhóm.

Kho mã nguồn: [thepiece27/Wolfari](https://github.com/thepiece27/Wolfari).
