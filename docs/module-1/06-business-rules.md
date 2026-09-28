# Business Rules

- **BR-01:** Dữ liệu y tế gắn với Health Profile đã chọn, không gắn trực tiếp Account.
- **BR-02:** SĐT không được dùng một mình để xác định người bệnh.
- **BR-03:** Người dùng phải xác nhận Health Profile trước intake.
- **BR-04:** Consent hợp lệ là điều kiện bắt đầu AI intake.
- **BR-05:** Hospital context chỉ đến từ phiên hiện tại và được giữ xuyên suốt.
- **BR-06:** Không có hospital context thì không gửi HIS.
- **BR-07:** AI summary bắt đầu ở `Pending Nurse Review`.
- **BR-08:** AI summary và phân khoa là nội dung hỗ trợ; điều dưỡng có thể sửa.
- **BR-09:** Chỉ summary đã approve và có context hợp lệ mới được gửi HIS.
- **BR-10:** Rule red-flag phải có owner, version và test set được duyệt.
- **BR-11:** Khi identity hoặc context không chắc chắn, hệ thống phải dừng.
- **BR-12:** Identity, consent, AI generation, nurse edit, approve, red-flag và HIS
  submission phải truy vết được.
- **BR-13:** Kiosk Operator không được truy cập summary worklist, red-flag hoặc
  dữ liệu bệnh nhân khác nếu không có permission tương ứng.
- **BR-14:** Ẩn menu ở FE không thay thế permission enforcement ở BE.
- **BR-15:** Bệnh nhân mới phải hoàn thành face verification trước khi tạo
  Account/Health Profile; bệnh nhân quay lại hợp lệ được bỏ qua bước này.
- **BR-16:** Decline Consent AI không được mở chat và phải kết thúc nhánh AI.
- **BR-17:** Transcript voice phải được bệnh nhân kiểm tra/chỉnh sửa trước khi
  chủ động gửi; không tự submit sau nhận dạng.
- **BR-18:** Mỗi kiosk session chỉ chứa context của một bệnh nhân và phải được
  dọn sạch trước phiên tiếp theo.
- **BR-19:** Không dùng PIN chung để mở dashboard từ kiosk; nhân viên phải đăng
  nhập bằng account có permission phù hợp.
