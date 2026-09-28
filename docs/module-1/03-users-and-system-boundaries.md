# Users and System Boundaries

## Actors

- **Bệnh nhân:** xác nhận hồ sơ, consent và cung cấp thông tin sức khỏe.
- **Người đại diện/người khai hộ:** khai báo cho Health Profile được phép.
- **Điều dưỡng:** review summary, xử lý red-flag và phân luồng.
- **Kiosk Operator:** kích hoạt kiosk và tạo phiên intake; không xem summary
  worklist hoặc red-flag nếu không có permission tương ứng.
- **Nurse Reviewer:** review summary và phân khoa.
- **Emergency Nurse:** xem và xử lý red-flag.
- **Nurse Supervisor:** có toàn bộ permission điều dưỡng và kiosk được cấp.
- **MedVita AI:** hỏi bổ sung, tạo draft, red-flag và đề xuất khoa.
- **HIS/EMR:** cung cấp hồ sơ theo context và nhận dữ liệu đã approve.
- **Ứng dụng bệnh viện:** khởi tạo phiên qua Universal Link.

## Entity boundaries

- Account dùng cho đăng nhập và quyền truy cập.
- Health Profile là chủ thể của dữ liệu y tế trong phiên.
- Hồ sơ HIS thuộc một bệnh viện, liên kết theo `hospital_id + identity_id`.
- Phiên giữ nguyên Health Profile và hospital context đã xác định.

AI không approve summary, không xác nhận phân khoa và không quyết định xử lý
red-flag. Điều dưỡng thực hiện quyết định vận hành; quy trình bệnh viện quyết định
hành động lâm sàng tiếp theo.

## RBAC boundaries

| Permission | Capability |
| --- | --- |
| `kiosk.activate` | Kích hoạt/thoát Kiosk Mode |
| `patient_intake.create` | Tạo phiên tự khai báo cho bệnh nhân |
| `summary.review` | Xem và review summary worklist |
| `department.assign` | Chỉnh/xác nhận phân khoa |
| `redflag.manage` | Xem và xử lý red-flag |

Kiosk account không được nhận dữ liệu worklist chỉ vì giao diện đã ẩn menu. BE
phải enforce permission trên API và dữ liệu trả về.
