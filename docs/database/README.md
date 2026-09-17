# Hướng dẫn artifact database Wolfari

Thư mục này mô tả cách các artifact database được tổ chức trong kho mã nguồn. Baseline sử dụng PostgreSQL 16+, gồm 5 database độc lập và không có dữ liệu seed.

## Vị trí artifact

| Artifact | Vị trí |
| --- | --- |
| Bootstrap thủ công cho DBA | `infrastructure/postgres/bootstrap-databases.sql` |
| Migration Identity | `apps/identity-service/migrations/V001.sql` |
| Migration Trip Workspace | `apps/trip-workspace-service/migrations/V001.sql` |
| Migration Travel Intelligence | `apps/travel-intelligence-service/migrations/V001.sql` |
| Migration Finance | `apps/finance-service/migrations/V001.sql` |
| Migration Automation | `apps/automation-service/migrations/V001.sql` |
| Truy vấn kiểm tra schema | `infrastructure/postgres/inspect-schema.sql` |
| Test constraint | `apps/<service>/tests/database/V001_constraints.sql` |
| ERD Mermaid | `docs/erd/*.mmd` |

Ba tài liệu DOCX nguồn được giữ trực tiếp trong `docs/`.

## Bootstrap PostgreSQL

Docker Compose dùng `infrastructure/docker/init-databases.sh` để tạo role và database từ biến môi trường khi volume PostgreSQL còn trống. Luồng này không tự áp dụng migration nghiệp vụ.

`infrastructure/postgres/bootstrap-databases.sql` là phương án cài thủ công cho DBA ngoài Docker. Không chạy đồng thời hai phương án trên cùng một PostgreSQL instance. Script thủ công dùng các role `identity_app`, `trip_app`, `travel_app`, `finance_app` và `automation_app`; mật khẩu phải được cấp qua cơ chế secret phù hợp, không ghi vào repository.

Lệnh tham khảo cho môi trường cài mới:

```sh
psql -v ON_ERROR_STOP=1 -d postgres -f infrastructure/postgres/bootstrap-databases.sql
```

## Migration baseline

Mỗi `V001.sql` chỉ được chạy một lần trên database trống bằng đúng owner của database đó. File tự kiểm tra `current_database()`, chạy trong transaction và ghi phiên bản vào `schema_migrations`.

```sh
psql -v ON_ERROR_STOP=1 -U identity_app -d identity_db -f apps/identity-service/migrations/V001.sql
psql -v ON_ERROR_STOP=1 -U trip_app -d trip_db -f apps/trip-workspace-service/migrations/V001.sql
psql -v ON_ERROR_STOP=1 -U travel_app -d travel_db -f apps/travel-intelligence-service/migrations/V001.sql
psql -v ON_ERROR_STOP=1 -U finance_app -d finance_db -f apps/finance-service/migrations/V001.sql
psql -v ON_ERROR_STOP=1 -U automation_app -d automation_db -f apps/automation-service/migrations/V001.sql
```

Không dùng ORM synchronize, không chạy lại V001 để che schema drift và không sửa V001 sau khi đã triển khai. Hệ thống đã có dữ liệu phải dùng backup, schema diff, `V002` forward migration và kế hoạch backfill riêng.

## Kiểm tra

Sau khi áp dụng V001 trên database thử nghiệm riêng, có thể chạy test constraint của đúng service. Các fixture kết thúc bằng `ROLLBACK`.

```sh
psql -v ON_ERROR_STOP=1 -U identity_app -d identity_db -f apps/identity-service/tests/database/V001_constraints.sql
psql -v ON_ERROR_STOP=1 -U trip_app -d trip_db -f apps/trip-workspace-service/tests/database/V001_constraints.sql
psql -v ON_ERROR_STOP=1 -U finance_app -d finance_db -f apps/finance-service/tests/database/V001_constraints.sql
```

Chạy `infrastructure/postgres/inspect-schema.sql` riêng trong từng database để đối chiếu. Năm file Mermaid hỗ trợ đọc và chỉnh ERD độc lập; chúng không thay thế migration.

Trong lần tổ chức kho mã nguồn này, không có lệnh bootstrap, migration, test SQL hoặc seed nào được chạy. Xem [trạng thái kiểm tra](validation.md) để biết giới hạn hiện tại.
