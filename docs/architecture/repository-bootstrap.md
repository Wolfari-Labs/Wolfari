# Hướng dẫn khởi tạo kho mã nguồn Wolfari

Kho mã nguồn này chứa bộ khung kỹ thuật theo [Wolfari SRS v1.0](../Wolfari_SRS_v1.0_Duyet.docx) và yêu cầu khởi tạo dự án. Hiện chưa có API, RPC, sự kiện, thực thể hoặc bảng dữ liệu nghiệp vụ. ERD vật lý vẫn chờ duyệt.

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
| `packages/contracts`               | Thư mục Protobuf và hợp đồng sự kiện còn trống, chờ duyệt thiết kế.                                                                                   |
| `packages/testing`                 | Vị trí dành cho tiện ích kiểm thử kỹ thuật dùng chung khi cần.                                                                                        |
| `infrastructure`                   | Docker Compose cho một PostgreSQL instance, RabbitMQ và MinIO.                                                                                        |
| `docs`                             | SRS, tài liệu thiết kế và [các quyết định chờ duyệt](design-decisions-pending.md).                                                                    |

## Quy tắc sở hữu dữ liệu và giao tiếp

PostgreSQL chứa 5 database: `identity_db`, `trip_db`, `travel_db`, `finance_db` và `automation_db`. Mỗi dịch vụ nghiệp vụ có tài khoản database riêng và thư mục `migrations/` riêng hiện còn trống. Script khởi tạo chỉ tạo database và tài khoản, không tạo bảng nghiệp vụ. Mỗi dịch vụ chỉ được truy cập database của mình. Không dùng khóa ngoại, `JOIN`, trigger hoặc transaction xuyên database. Gateway và Export Worker không có tài khoản database nghiệp vụ.

Ứng dụng khách giao tiếp với Gateway qua REST/HTTPS. Các lệnh gọi đồng bộ giữa Gateway và dịch vụ, hoặc giữa các dịch vụ, sẽ dùng gRPC với Protobuf sau khi hợp đồng được duyệt. Sự kiện nghiệp vụ bất đồng bộ sẽ đi qua RabbitMQ. MinIO lưu nội dung tệp và đối tượng; thông tin mô tả cùng quyền truy cập vẫn do dịch vụ sở hữu dữ liệu quản lý. Bước khởi tạo này chưa định nghĩa phương thức gRPC, đường dẫn API nghiệp vụ, hàng đợi, sự kiện hoặc bucket lưu trữ.

<a id="chay-cuc-bo"></a>

## Chạy cục bộ

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

## Thiết kế chờ duyệt

Công cụ ORM và migration, bảng dữ liệu vật lý, hợp đồng REST/gRPC nghiệp vụ, sự kiện nghiệp vụ, sơ đồ trạng thái và chi tiết phục hồi giao dịch được ghi trong [danh sách quyết định chờ duyệt](design-decisions-pending.md). Không suy diễn chức năng nghiệp vụ từ bộ khung hiện tại.
