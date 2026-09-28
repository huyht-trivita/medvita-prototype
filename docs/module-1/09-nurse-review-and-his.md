# Nurse Review and HIS Handoff

Dashboard điều dưỡng cần tách summary chờ review và red-flag cần xử lý. Danh sách
phải giữ đúng bệnh viện, Health Profile, thời gian, trạng thái và đề xuất phân khoa.

Điều dưỡng kiểm tra nội dung AI, xác nhận hoặc chỉnh khoa/phân khoa, chọn phòng
khám/công khám và approve. Hệ thống phải giữ giá trị AI đề xuất ban đầu và quyết
định cuối để audit và đánh giá chất lượng.

Với red-flag, điều dưỡng xem chi tiết, cập nhật trạng thái và ghi chú theo workflow;
lịch sử xử lý phải hiển thị và truy vết được.

HIS handoff chỉ diễn ra sau approve và khi hospital context hợp lệ. Retry phải
idempotent. Mapping payload, retry limit và reconciliation cần đặc tả tích hợp riêng.

## Kiosk separation

Account Kiosk Operator chỉ được tạo intake session; không được đọc summary
worklist, red-flag worklist hoặc dữ liệu bệnh nhân khác. Nurse Reviewer,
Emergency Nurse và Nurse Supervisor chỉ thấy menu và API tương ứng với permission.

Sau khi bệnh nhân xác nhận, kiosk chỉ hiển thị trạng thái hoàn tất. Việc review,
phân khoa, xử lý red-flag và HIS handoff tiếp tục trong dashboard điều dưỡng và
không được expose ngược về patient session.
