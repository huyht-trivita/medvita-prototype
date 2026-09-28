# MedVita Module 1 — Product Documentation

Module 1 hỗ trợ tiếp nhận bệnh nhân trước buổi khám: định danh đúng người bệnh,
ghi nhận consent sử dụng AI, thu thập triệu chứng, tạo tóm tắt chờ kiểm tra và
chuyển kết quả sang quy trình xử lý của điều dưỡng.

## Nguồn và phạm vi

Nguồn chính là các Epic Jira [MV-7](https://trivitaai.atlassian.net/browse/MV-7),
[MV-18](https://trivitaai.atlassian.net/browse/MV-18) và
[MV-26](https://trivitaai.atlassian.net/browse/MV-26), cùng child item và bug
liên quan. Jira xác định phạm vi nghiệp vụ; trạng thái triển khai phải được kiểm
tra trực tiếp trên Jira.

Phần mở rộng **Kiosk tự khai báo tại Bệnh viện Thái Nguyên** được stakeholder
chốt trực tiếp ngày 28/09/2026 và được ghi nhận trong bộ tài liệu này như
requirement mới. Phần mở rộng chưa được gán Jira key; cần tạo hoặc liên kết ticket
trước khi dùng bảng traceability để theo dõi delivery.

## Document map

1. [Business overview](01-business-overview.md)
2. [Product scope](02-product-scope.md)
3. [Users and system boundaries](03-users-and-system-boundaries.md)
4. [End-to-end workflows](04-end-to-end-workflows.md)
5. [Functional requirements](05-functional-requirements.md)
6. [Business rules](06-business-rules.md)
7. [Identity, consent and context](07-identity-consent-and-context.md)
8. [Symptom intake and safety](08-symptom-intake-and-safety.md)
9. [Nurse review and HIS](09-nurse-review-and-his.md)
10. [Errors and recovery](10-errors-and-recovery.md)
11. [Acceptance criteria](11-acceptance-criteria.md)

## Terminology

- **Account:** tài khoản đăng nhập, có thể quản lý nhiều Health Profile.
- **Health Profile:** hồ sơ sức khỏe được chọn làm chủ thể dữ liệu của phiên.
- **Hospital context:** bệnh viện và hồ sơ HIS được xác định từ phiên hiện tại.
- **AI summary:** bản tóm tắt hỗ trợ, chưa phải kết luận chuyên môn.
- **Pending Nurse Review:** trạng thái bắt buộc trước khi điều dưỡng kiểm tra.
- **Red-flag:** cảnh báo theo bộ rule được duyệt; không phải chẩn đoán.
- **Kiosk Operator:** account chỉ có quyền kích hoạt kiosk và tạo phiên khai báo;
  không được truy cập worklist điều dưỡng.
- **Kiosk session:** phiên riêng tư của một bệnh nhân trên tablet dùng chung; dữ
  liệu hiển thị phải được dọn trước khi bệnh nhân tiếp theo bắt đầu.
