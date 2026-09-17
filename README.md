<a id="readme-top"></a>

<div align="center">
  <h1>🐺 Wolfari</h1>
  <p><strong>Cùng lên kế hoạch cho mỗi chuyến đi, từ lịch trình đến chi phí.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Giai%20%C4%91o%E1%BA%A1n-Kh%E1%BB%9Fi%20t%E1%BA%A1o-315b7d?style=flat-square" alt="Giai đoạn khởi tạo" />
    <img src="https://img.shields.io/badge/M%C3%A1y%20ch%E1%BB%A7-NestJS%20%2B%20TypeScript-ea2845?style=flat-square" alt="NestJS và TypeScript" />
    <img src="https://img.shields.io/badge/Kho%20m%C3%A3%20ngu%E1%BB%93n-pnpm-f69220?style=flat-square" alt="Kho mã nguồn pnpm" />
  </p>

  <p>
    <a href="docs/Wolfari_SRS_v2.0_ChinhThuc.docx"><strong>Đọc SRS</strong></a>
    · <a href="docs/architecture/repository-bootstrap.md">Hướng dẫn kho mã nguồn</a>
    · <a href="docs/architecture/design-baseline.md">Bộ thiết kế hiện hành</a>
  </p>
</div>

## Mục lục

1. [Giới thiệu](#gioi-thieu)
2. [Công nghệ](#cong-nghe)
3. [Bắt đầu](#bat-dau)
4. [Sử dụng](#su-dung)
5. [Lộ trình](#lo-trinh)
6. [Đóng góp](#dong-gop)
7. [Giấy phép](#giay-phep)
8. [Liên hệ](#lien-he)

<a id="gioi-thieu"></a>

## Giới thiệu

Wolfari được định hướng là không gian chung cho người đi du lịch một mình hoặc theo nhóm nhỏ: cùng chuẩn bị lịch trình, lưu địa điểm, theo dõi quỹ chuyến đi, nhận nhắc việc và xuất kế hoạch để lưu hoặc chia sẻ. Mục tiêu sản phẩm trong [SRS](docs/Wolfari_SRS_v2.0_ChinhThuc.docx) bao gồm trang web cho người dùng, trang web quản trị và ứng dụng di động.

> **Trạng thái hiện tại:** SRS v2.0, ERD v1.1 và đặc tả DDL/API/Event v1.0 đã có trong `docs/`. Năm migration SQL đã được đặt theo service nhưng chưa chạy; chưa có giao diện web, API nghiệp vụ, handler gRPC/event hay dữ liệu khởi tạo. Xem [bộ thiết kế hiện hành](docs/architecture/design-baseline.md) và [hướng dẫn database](docs/database/README.md).

Phần máy chủ được tổ chức quanh API Gateway/BFF, 5 dịch vụ nghiệp vụ và một Export Worker chạy nền. Ranh giới của từng ứng dụng, quy tắc sở hữu cơ sở dữ liệu và giao tiếp giữa các thành phần được ghi trong [hướng dẫn kho mã nguồn](docs/architecture/repository-bootstrap.md).

<p align="right"><a href="#readme-top">Về đầu trang ↑</a></p>

<a id="cong-nghe"></a>

## Công nghệ

- **Phần máy chủ:** TypeScript, NestJS.
- **Kho mã nguồn:** pnpm workspace.
- **Hạ tầng MVP:** PostgreSQL, RabbitMQ, MinIO, Docker Compose.

Giao diện web và ứng dụng di động thuộc phạm vi sản phẩm trong SRS, nhưng chưa được khởi tạo trong kho mã nguồn này.

<p align="right"><a href="#readme-top">Về đầu trang ↑</a></p>

<a id="bat-dau"></a>

## Bắt đầu

### Yêu cầu môi trường

- Node.js 22 trở lên.
- pnpm 10 (phiên bản được pin trong `package.json`).
- Docker Compose để chạy hạ tầng cục bộ.

### Cài đặt

Trong thư mục gốc của kho mã nguồn:

```sh
pnpm install
cp .env.example .env
# Thay các giá trị change-me trong .env trước khi khởi động hạ tầng.
pnpm infra:up
pnpm dev
```

Trên PowerShell, có thể dùng `Copy-Item .env.example .env` thay cho `cp`. Tệp `.env` ở thư mục gốc chỉ phục vụ Docker Compose; các tiến trình NestJS không đọc chung tệp chứa thông tin đăng nhập này. Hướng dẫn cổng, cấu hình tiến trình và dừng hạ tầng nằm trong [tài liệu khởi tạo](docs/architecture/repository-bootstrap.md#chay-cuc-bo).

<p align="right"><a href="#readme-top">Về đầu trang ↑</a></p>

<a id="su-dung"></a>

## Sử dụng

Ở giai đoạn này, `pnpm dev` khởi động 7 ứng dụng NestJS với **đường dẫn kiểm tra tiến trình**. Có thể kiểm tra Gateway tại:

```sh
curl http://127.0.0.1:3000/health/live
```

Phản hồi mẫu: `{"status":"ok","service":"api-gateway"}`. Đây là kiểm tra tiến trình; chưa phải giao diện web hoặc API nghiệp vụ.

```sh
pnpm lint
pnpm build
pnpm test
```

<p align="right"><a href="#readme-top">Về đầu trang ↑</a></p>

<a id="lo-trinh"></a>

## Lộ trình

- [x] Khởi tạo pnpm workspace, 7 ứng dụng NestJS và hạ tầng cục bộ.
- [x] Đưa ERD vật lý, đặc tả API/gRPC/event và migration baseline vào kho mã nguồn.
- [ ] Đối chiếu bộ tài liệu tham chiếu còn thiếu trước khi triển khai nghiệp vụ.
- [ ] Phát triển trang web cho người dùng, trang web quản trị và các luồng nghiệp vụ theo SRS đã cập nhật.
- [ ] Kiểm thử tích hợp và nghiệm thu MVP.

Tình trạng bộ tài liệu và giới hạn kiểm tra được ghi trong [tài liệu kiểm tra](docs/database/validation.md).

<p align="right"><a href="#readme-top">Về đầu trang ↑</a></p>

<a id="dong-gop"></a>

## Đóng góp

Nhóm phát triển nên đọc [SRS](docs/Wolfari_SRS_v2.0_ChinhThuc.docx), [bộ thiết kế hiện hành](docs/architecture/design-baseline.md) và [quy tắc kho mã nguồn](docs/architecture/repository-bootstrap.md) trước khi đề xuất thay đổi. Với thay đổi mã nguồn, chạy `pnpm lint`, `pnpm build` và `pnpm test` trước khi mở pull request. Mọi thay đổi lược đồ hoặc hợp đồng giao tiếp nghiệp vụ cần đối chiếu và cập nhật bộ tài liệu thiết kế liên quan.

<p align="right"><a href="#readme-top">Về đầu trang ↑</a></p>

<a id="giay-phep"></a>

## Giấy phép

Dự án chưa công bố giấy phép sử dụng. Thông tin này sẽ được cập nhật khi nhóm chọn và thêm tệp `LICENSE`.

<p align="right"><a href="#readme-top">Về đầu trang ↑</a></p>

<a id="lien-he"></a>

## Liên hệ

Kho mã nguồn: [thepiece27/Wolfari](https://github.com/thepiece27/Wolfari).

<p align="right"><a href="#readme-top">Về đầu trang ↑</a></p>
