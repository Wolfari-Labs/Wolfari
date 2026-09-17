# Kiểm tra bộ tài liệu và artifact Wolfari

## Đối chiếu bố cục hiện tại

- Năm file Mermaid đã được đặt trong `docs/erd/`; năm migration và ba test constraint SQL nằm trong service sở hữu; hai script SQL dùng chung nằm trong `infrastructure/postgres/`.
- 15 file Mermaid/SQL/test trên khớp byte với [`SHA256SUMS.source-bundle.txt`](SHA256SUMS.source-bundle.txt). [`SHA256SUMS.txt`](SHA256SUMS.txt) ghi checksum của toàn bộ 18 artifact hiện có theo đường dẫn mới, gồm ba DOCX ở gốc `docs/`.
- Hai DOCX ERD và DDL/API/Event hiện có **không khớp checksum** DOCX tương ứng trong bộ bàn giao cũ. Điều này chỉ chứng minh file đã khác byte; chưa xác định nội dung khác ở đâu.
- Checksum nguồn nhắc `Wolfari_SRS_v2.2_ThayThe_TuMuc10.docx`, nhưng file này chưa có trong kho mã nguồn. DOCX SRS hiện có là v2.0; ERD và đặc tả DDL/API/Event cũng nhắc đến bản thay thế v2.2. Cần xác nhận hoặc bổ sung tài liệu đó trước khi dùng các mục liên quan làm đầu vào triển khai.

## Kết quả ghi nhận từ bộ bàn giao trước

- Phân tích cú pháp bằng parser PostgreSQL cho 10 file SQL, gồm migration và test fixture: đạt theo ghi nhận trước.
- Kiểm tra 54 bảng trong 5 database và 46 FK cùng database: đạt theo ghi nhận trước.
- Bộ Word mô tả 33/33 FR bằng 170 REST endpoint, 19 RPC và 19 message theo ghi nhận trước.

Các kết quả này chưa được chạy lại trong lần sắp xếp kho mã nguồn này. Việc khớp checksum của SQL/Mermaid/test cho thấy nội dung của những file đó được giữ nguyên khi chuyển vị trí; nó không thay thế kiểm tra trên PostgreSQL.

## Giới hạn

- Chưa chạy bootstrap PostgreSQL, V001, test fixture hoặc seed trong lần sắp xếp này; không xác nhận trạng thái database đang có ở máy khác.
- Chưa chạy kiểm thử tích hợp, kiểm thử tranh chấp, AT01–AT18 hoặc đo NFR. Đây là bộ thiết kế và migration baseline, không phải báo cáo nghiệm thu ứng dụng.
- SQL dành cho cài mới, không phải chuyển đổi dữ liệu từ schema cũ.
