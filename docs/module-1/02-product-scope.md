# Product Scope

## Included

- Định danh từ app bệnh viện, SĐT/OTP có chọn bệnh viện và SĐT/OTP độc lập.
- Chọn, xác nhận, xem, tạo và xóa Health Profile tự tạo theo quyền.
- Consent AI: accept, decline và re-consent.
- Thu thập triệu chứng bằng text và voice khi được bật.
- Tối đa bảy câu hỏi bổ sung theo ngữ cảnh.
- Ghi nhận triệu chứng, tiền sử, thuốc và dị ứng trong scope được duyệt.
- Summary ở trạng thái `Pending Nurse Review`.
- Red-flag và đề xuất khoa/phân khoa.
- Dashboard điều dưỡng, review/approve, chọn phòng khám và xử lý cảnh báo.
- HIS handoff sau approve khi hospital context hợp lệ.
- Audit/trace cho các hành động trọng yếu.
- Kiosk trên tablet tại Bệnh viện Thái Nguyên, được kích hoạt bằng account có
  quyền `kiosk.activate`.
- Hai nhánh tự định danh: bệnh nhân quay lại bằng mã bệnh nhân + CCCD; bệnh nhân
  mới bằng họ tên + CCCD + ngày sinh + giới tính.
- Nhận diện khuôn mặt cho bệnh nhân mới trước khi tạo Account/Health Profile.
- Patient Kiosk Mode tách khỏi dashboard điều dưỡng và dọn dữ liệu sau mỗi phiên.
- RBAC cho Kiosk Operator, Nurse Reviewer, Emergency Nurse và Nurse Supervisor.
- Voice input tiếng Việt, cho phép kiểm tra/chỉnh transcript trước khi gửi AI.

## Excluded or separately governed

- Chẩn đoán, kê đơn hoặc quyết định chuyên môn tự động.
- Gửi HIS trực tiếp từ màn hình bệnh nhân.
- Tự suy ra bệnh viện từ liên kết HIS cũ của Health Profile.
- Quy trình khám và tài liệu lâm sàng trong buổi khám; thuộc Module 2.
- Retention, legal hold và data-subject request khi chưa có requirement riêng.
- Lưu trữ ảnh hoặc dữ liệu sinh trắc học từ nhận diện khuôn mặt; prototype hiện
  chỉ mô phỏng và chưa xác định nhà cung cấp/cơ chế production.

## Open scope decisions

- Schema chính thức và tiêu chí completeness của summary.
- Tiêu chí đủ thông tin để đề xuất khoa.
- Kết quả hiển thị cho bệnh nhân sau khai báo.
- Phạm vi chính thức của copy Chat History.
- Cơ chế production cho face verification, retry limit và manual fallback.
- Thời hạn kiosk session và chính sách tự động reset khi không hoạt động.
