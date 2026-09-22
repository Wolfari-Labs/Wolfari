# Wolfari

[![CI](https://github.com/thepiece27/Wolfari/actions/workflows/contracts.yml/badge.svg)](https://github.com/thepiece27/Wolfari/actions/workflows/contracts.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Wolfari là nền tảng lập kế hoạch chuyến đi cho cá nhân và nhóm nhỏ. Sản phẩm hướng tới việc cùng xây dựng lịch trình, lưu địa điểm, quản lý quỹ, nhận nhắc việc và xuất kế hoạch.

Repository hiện cung cấp **baseline kỹ thuật** cho một pnpm monorepo gồm 7 ứng dụng NestJS, hạ tầng local, migration runner PostgreSQL, health check và bộ contract Protobuf/event v1.

> Phạm vi hiện tại tập trung vào nền tảng backend và hạ tầng phát triển. API nghiệp vụ, runtime gRPC/RabbitMQ, giao diện sản phẩm và seed dữ liệu nghiệp vụ sẽ được triển khai ở các đợt tiếp theo.

## Kiến trúc

| Thành phần                  | Vai trò                                           |   Cổng |
| --------------------------- | ------------------------------------------------- | -----: |
| API Gateway/BFF             | Điểm vào REST/HTTPS, không sở hữu database        | `3000` |
| Identity Service            | Tài khoản và định danh, sở hữu `identity_db`      | `3101` |
| Trip Workspace Service      | Không gian lịch trình, sở hữu `trip_db`           | `3102` |
| Travel Intelligence Service | Dữ liệu và phân tích điểm đến, sở hữu `travel_db` | `3103` |
| Finance Service             | Quỹ và giao dịch chuyến đi, sở hữu `finance_db`   | `3104` |
| Automation Service          | Nhắc việc và tự động hóa, sở hữu `automation_db`  | `3105` |
| Export Worker               | Tác vụ xuất file, không sở hữu database           | `3106` |

Hạ tầng local chạy bằng Docker Compose:

- PostgreSQL: 5 database riêng, mỗi service nghiệp vụ sở hữu một database;
- RabbitMQ: nền tảng cho sự kiện bất đồng bộ;
- MinIO: lưu trữ nội dung file;
- `@wolfari/common`, `@wolfari/database` và `@wolfari/contracts`: các package dùng chung.

Mỗi service nghiệp vụ chỉ truy cập database của mình. Không dùng foreign key, JOIN, trigger hoặc transaction xuyên database. Chi tiết ranh giới và quyết định kiến trúc nằm trong [baseline thiết kế](docs/architecture/design-baseline.md).

## Yêu cầu

- Node.js `24.x`;
- Docker Desktop có Docker Compose;
- Corepack;
- pnpm `10.34.5` được pin trong `package.json`.

## Khởi động nhanh

Từ thư mục gốc repository:

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm env:init
corepack pnpm infra:up
corepack pnpm infra:check
corepack pnpm db:migrate
corepack pnpm db:status
corepack pnpm dev
```

Mở terminal khác để kiểm tra 7 ứng dụng:

```sh
corepack pnpm dev:check
```

`env:init` tạo root `.env` cho Compose và file `.env` riêng cho từng app. Các file đã tồn tại không bị ghi đè; secret không được in ra terminal. Dùng `Ctrl+C` để dừng launcher và `corepack pnpm infra:down` để dừng container mà vẫn giữ named volume.

## Health check

Tất cả ứng dụng cung cấp:

```text
GET /health/live
```

Năm service nghiệp vụ bổ sung:

```text
GET /health/ready
```

Readiness kiểm tra kết nối đúng database/role và migration baseline `V001`. Trạng thái sẵn sàng trả `200`; lỗi database hoặc thiếu migration trả `503`. Response không chứa connection string hay lỗi SQL thô.

## Lệnh phát triển

```sh
# Kiểm tra hạ tầng
corepack pnpm infra:check

# Migration và database
corepack pnpm db:status
corepack pnpm db:migrate
corepack pnpm db:migrate --service identity
corepack pnpm db:inspect
corepack pnpm db:test

# Contract
corepack pnpm contracts:lint
corepack pnpm contracts:generate
corepack pnpm contracts:check
corepack pnpm contracts:test

# Chất lượng mã nguồn
corepack pnpm lint
corepack pnpm test
corepack pnpm build
```

`db:test` tạo Compose project, cổng và volume thử nghiệm riêng rồi tự dọn khi hoàn tất. Không chạy fixture phá lỗi trên database local đang dùng để phát triển.

## Tài liệu

- [Hướng dẫn khởi tạo repository](docs/architecture/repository-bootstrap.md)
- [Môi trường phát triển](docs/architecture/development-environment.md)
- [Baseline thiết kế](docs/architecture/design-baseline.md)
- [Protobuf và event contract](docs/architecture/contracts.md)
- [Database và migration](docs/database/README.md)
- [Kết quả kiểm tra database](docs/database/validation.md)
- [SRS v2.0](docs/Wolfari_SRS_v2.0_ChinhThuc.docx)
- [ERD v1.1](docs/Wolfari_ERD_Database_v1.1_ChinhThuc.docx)
- [DDL/API/Event Specification v1.0](docs/Wolfari_DDL_API_Event_Specification_v1.0.docx)

SRS v2.2 được một số tài liệu tham chiếu nhưng chưa có trong repository. Vì vậy, các migration `V001` hiện có chỉ được xem là baseline kỹ thuật, không phải toàn bộ nghiệp vụ đã triển khai.

## Trạng thái phạm vi

- [x] Workspace 7 ứng dụng NestJS và hạ tầng local tái lập.
- [x] Migration runner cho 5 database và database provider dùng chung.
- [x] Liveness/readiness và kiểm thử tích hợp nền tảng.
- [x] Protobuf/event contract v1, mã sinh, validator và kiểm tra tương thích.
- [ ] Đối chiếu đầy đủ với SRS v2.2.
- [ ] API nghiệp vụ, runtime gRPC/RabbitMQ và giao diện sản phẩm.

## Đóng góp và giấy phép

Trước khi mở pull request, chạy `corepack pnpm lint`, `corepack pnpm test`, `corepack pnpm build` và các kiểm thử tích hợp liên quan. Khi thay đổi schema hoặc contract, hãy cập nhật tài liệu thiết kế và mã sinh tương ứng.

Wolfari được phát hành theo [MIT License](LICENSE). Repository: [thepiece27/Wolfari](https://github.com/thepiece27/Wolfari).
