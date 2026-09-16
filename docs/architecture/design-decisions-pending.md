# Các quyết định thiết kế chờ duyệt

[SRS được cung cấp](../Wolfari_SRS_v1.0_Duyet.docx) và yêu cầu khởi tạo dự án đã xác định ranh giới dịch vụ cùng hạ tầng. Các nội dung dưới đây cần được duyệt riêng trước khi triển khai phần đang bị chặn. Tên khóa YAML giữ nguyên theo định dạng quyết định đã thống nhất; phần diễn giải dùng tiếng Việt.

```yaml
- DECISION REQUIRED: Công cụ ORM và migration riêng cho từng dịch vụ
  Context: Mỗi dịch vụ nghiệp vụ cần migration có phiên bản riêng, nhưng chưa chọn ORM.
  Why it matters: Công cụ được chọn quyết định cách tổ chức mã nguồn, định dạng migration và cập nhật lược đồ.
  Options: ORM kèm migration; bộ tạo truy vấn kèm migration; SQL thuần và trình điều khiển.
  Blocked implementation: Bộ kết nối cơ sở dữ liệu, lớp truy cập dữ liệu và tệp migration.

- DECISION REQUIRED: Lược đồ vật lý cho 5 database
  Context: Mục 10 của SRS có danh mục dữ liệu, còn ERD vật lý chưa được duyệt.
  Why it matters: Không thể tự suy ra bảng, ràng buộc, chỉ mục và quan hệ dữ liệu.
  Options: Rà soát danh mục trong SRS và duyệt ERD vật lý riêng cho từng dịch vụ.
  Blocked implementation: Thực thể, bảng và migration nghiệp vụ.

- DECISION REQUIRED: Hợp đồng REST API và gRPC nghiệp vụ
  Context: Mục 6 của SRS mô tả giao tiếp ở mức logic, chưa duyệt đường dẫn API hoặc phương thức RPC cụ thể.
  Why it matters: DTO, thông điệp Protobuf, tên phương thức và cách quản lý phiên bản cần được thống nhất.
  Options: Duyệt thiết kế OpenAPI và Protobuf cho từng ranh giới dịch vụ.
  Blocked implementation: Bộ điều khiển nghiệp vụ, bộ xử lý RPC và cấu hình kênh giao tiếp.

- DECISION REQUIRED: Danh mục sự kiện nghiệp vụ
  Context: Mục 9 của SRS nêu các luồng đề xuất, nhưng hợp đồng sự kiện chưa được duyệt để triển khai.
  Why it matters: Khóa định tuyến, nội dung thông điệp, vỏ thông điệp và khả năng tương thích ảnh hưởng đến bên nhận.
  Options: Duyệt danh mục sự kiện và quy tắc quản lý phiên bản trước khi định nghĩa thông điệp.
  Blocked implementation: Bộ phát, bộ nhận và định nghĩa sự kiện.

- DECISION REQUIRED: Sơ đồ trạng thái có thể triển khai
  Context: SRS có quy tắc vòng đời đề xuất, nhưng thiết kế triển khai chưa được duyệt.
  Why it matters: Các bước chuyển trạng thái và điều kiện bảo vệ ảnh hưởng đến lưu trữ cùng hành vi API.
  Options: Duyệt sơ đồ và bảng chuyển trạng thái cho từng vòng đời liên quan.
  Blocked implementation: Kiểu trạng thái, mã chuyển trạng thái và migration liên quan.

- DECISION REQUIRED: Chi tiết giao dịch và phục hồi khi có lỗi
  Context: Mục 8-9 của SRS định hướng dùng ACID cục bộ, outbox/inbox, xử lý lặp an toàn và thử lại có giới hạn; không dùng 2PC hoặc saga engine.
  Why it matters: Ranh giới thao tác, thời hạn chờ và cách phục hồi cần hợp đồng cụ thể.
  Options: Xác định điều kiện bảo vệ thao tác, nơi sở hữu outbox/inbox, quy tắc thử lại và đối soát cho từng luồng.
  Blocked implementation: Lệnh liên dịch vụ, bảng outbox/inbox và tiến trình phục hồi.
```
