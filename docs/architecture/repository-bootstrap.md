# Hướng dẫn khởi tạo kho mã nguồn Wolfari

Kho mã nguồn này bắt đầu từ bước khởi tạo kỹ thuật. Bộ tài liệu hiện hành gồm [SRS v2.0](../Wolfari_SRS_v2.0_ChinhThuc.docx), [ERD v1.1](../Wolfari_ERD_Database_v1.1_ChinhThuc.docx) và [đặc tả DDL/API/Event v1.0](../Wolfari_DDL_API_Event_Specification_v1.0.docx). Thiết kế đã có, nhưng kho mã nguồn chưa triển khai API, RPC, event handler hay thực thể nghiệp vụ. Năm file migration SQL đã được đặt trong service tương ứng và chưa chạy trên PostgreSQL.

## Kiến trúc kho mã nguồn

| Thư mục                            | Vai trò                                                                                                                                               |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/api-gateway`                 | Ranh giới API Gateway/BFF cho trang web người dùng, trang web quản trị và ứng dụng di động qua REST/HTTPS. Hiện chỉ có đường dẫn kiểm tra tiến trình. |
| `apps/identity-service`            | Sẽ sở hữu thông tin nhận diện, thông tin đăng nhập, phiên và hồ sơ người dùng.                                                                        |
| `apps/trip-workspace-service`      | Sẽ sở hữu Trip, thành viên, kế hoạch, liên kết chia sẻ và thông tin tác vụ xuất tệp.                                                                  |
| `apps/travel-intelligence-service` | Sẽ sở hữu bộ kết nối nhà cung cấp dữ liệu du lịch, tìm kiếm, tuyến đường, thời tiết và gợi ý.                                                         |
| `apps/finance-service`             | Sẽ sở hữu quỹ, khoản đóng góp, khoản chi, thanh toán và đóng quỹ.                                                                                     |
| `apps/automation-service`          | Sẽ sở hữu thông báo, nhắc việc, lịch tác vụ và theo dõi giá.                                                                                          |
| `apps/export-worker`               | Tiến trình xuất tệp chạy nền; **không phải** dịch vụ nghiệp vụ thứ sáu và không có cơ sở dữ liệu nghiệp vụ riêng.                                     |
| `packages/common`                  | Chỉ chứa cấu hình, kiểm tra dữ liệu cấu hình, nhật ký JSON, correlation ID và kiểm tra tiến trình dùng chung.                                         |
| `packages/contracts`               | Thư mục Protobuf và hợp đồng sự kiện chưa có file hợp đồng; đặc tả thiết kế đã có trong DOCX.                                                         |
| `packages/testing`                 | Vị trí dành cho tiện ích kiểm thử kỹ thuật dùng chung khi cần.                                                                                        |
| `infrastructure`                   | Docker Compose cho một PostgreSQL instance, RabbitMQ và MinIO.                                                                                        |
| `docs`                             | Ba DOCX nguồn, [bộ thiết kế hiện hành](design-baseline.md), hướng dẫn database và sơ đồ ERD.                                                          |

## Quy tắc sở hữu dữ liệu và giao tiếp

Kiến trúc PostgreSQL gồm 5 database: `identity_db`, `trip_db`, `travel_db`, `finance_db` và `automation_db`. Mỗi dịch vụ nghiệp vụ có tài khoản database và migration `V001.sql` riêng. Script Docker khởi tạo chỉ tạo database và tài khoản khi volume trống; nó không áp dụng migration. Mỗi dịch vụ chỉ được truy cập database của mình. Không dùng khóa ngoại, `JOIN`, trigger hoặc transaction xuyên database. Gateway và Export Worker không có tài khoản database nghiệp vụ. Xem [hướng dẫn database](../database/README.md) trước khi sử dụng các file SQL.

Ứng dụng khách giao tiếp với Gateway qua REST/HTTPS. Các lệnh gọi đồng bộ giữa Gateway và dịch vụ, hoặc giữa các dịch vụ, dùng gRPC với Protobuf; sự kiện nghiệp vụ bất đồng bộ đi qua RabbitMQ. MinIO lưu nội dung tệp và đối tượng; thông tin mô tả cùng quyền truy cập do dịch vụ sở hữu dữ liệu quản lý. Đặc tả DOCX mô tả REST, RPC và event ở mức thiết kế; các hợp đồng máy đọc được và phần xử lý tương ứng chưa được thêm vào kho mã nguồn.

<a id="chay-cuc-bo"></a>

## Chạy cục bộ

Các lệnh dưới đây là hướng dẫn cho lần chạy sau; việc sắp xếp tài liệu và file trong kho mã nguồn không khởi động hạ tầng hoặc tạo dữ liệu.

Yêu cầu môi trường: Node.js 22 trở lên, pnpm 10 và Docker Compose. Phiên bản trình quản lý gói được pin trong `package.json`; có thể dùng `corepack pnpm` nếu máy chưa có lệnh `pnpm` trực tiếp.

```sh
cp .env.example .env
# Thay các giá trị change-me trong .env trước khi khởi động hạ tầng.
pnpm install
pnpm infra:up
pnpm dev
```

Trên PowerShell, có thể dùng `Copy-Item .env.example .env` thay cho `cp`. Tệp `.env` ở thư mục gốc chỉ được Docker Compose sử dụng. Các tiến trình NestJS không đọc tệp này, nên cấu hình ứng dụng không chia sẻ mật khẩu database của dịch vụ khác.

`pnpm dev` khởi động 7 tiến trình NestJS. Mỗi tiến trình chỉ có `GET /health/live` trên cổng cục bộ 3000 hoặc 3101–3106. Có thể ghi đè cổng của từng tiến trình bằng biến môi trường tương ứng: `GATEWAY_PORT`, `IDENTITY_PORT`, `TRIP_PORT`, `TRAVEL_PORT`, `FINANCE_PORT`, `AUTOMATION_PORT` hoặc `EXPORT_WORKER_PORT`. Phản hồi gồm tên tiến trình và header `x-correlation-id`. Đây là kiểm tra tiến trình; kiểm tra khả năng sẵn sàng của các thành phần phụ thuộc sẽ được bổ sung sau khi thiết kế bộ kết nối được duyệt. Các tiến trình chỉ lắng nghe trên `127.0.0.1` khi chạy cục bộ. Reverse proxy HTTPS cho Gateway và giao diện nghiệp vụ chưa thuộc bước khởi tạo này.

```sh
pnpm lint
pnpm build
pnpm test
docker compose --env-file .env -f infrastructure/docker-compose.yml config
pnpm infra:down
```

`infra:down` giữ lại các volume đã đặt tên. Script khởi tạo PostgreSQL chỉ chạy khi volume dữ liệu còn trống; sửa `.env` sau đó không tự thay đổi mật khẩu database đã tạo. Tệp `.env` được Git bỏ qua, còn `.env.example` chỉ chứa giá trị mẫu.

## Thiết kế hiện hành

SRS, ERD và đặc tả DDL/API/Event hiện có là đầu vào cho bước triển khai tiếp theo. [Bộ thiết kế hiện hành](design-baseline.md) ghi rõ nguồn và ranh giới. Công cụ ORM/migration runner chưa được chọn trong kho mã nguồn; không suy diễn rằng các hợp đồng thiết kế đã được triển khai. [Tài liệu kiểm tra](../database/validation.md) ghi các chênh lệch của bộ tài liệu hiện có.
