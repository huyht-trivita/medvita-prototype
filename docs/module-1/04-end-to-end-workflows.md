# End-to-End Workflows

## Standard workflow

```text
Mở MedVita
→ định danh Account
→ xác định Health Profile và hospital context nếu có
→ xác nhận Health Profile
→ kiểm tra Consent AI
→ khai báo triệu chứng
→ AI hỏi bổ sung, kiểm tra red-flag và đề xuất khoa
→ tạo summary ở Pending Nurse Review
→ điều dưỡng review, chỉnh phân luồng và chọn phòng khám
→ approve
→ gửi HIS nếu hospital context hợp lệ
```

## Entry modes

- **App bệnh viện:** xác thực request, tra cứu HIS và xác định Account, Health
  Profile cùng hospital context.
- **SĐT/OTP và bệnh viện:** kiểm tra HIS theo bệnh viện trước khi hoàn tất định danh.
- **SĐT/OTP độc lập:** không gọi HIS và không tạo hospital context; dữ liệu chỉ lưu
  trong MedVita.

## Consent branches

```text
Consent hợp lệ → bắt đầu khai báo
Chưa có/hết hiệu lực → accept hoặc re-consent
Decline → dừng luồng AI
```

Nếu không xác định chắc chắn Account, Health Profile hoặc hospital context, hệ
thống phải dừng và không tự suy đoán.

## Hospital kiosk workflow

```text
Kiosk Operator đăng nhập và kích hoạt tablet
→ hệ thống mở Kiosk Home, không hiển thị dashboard điều dưỡng
→ bệnh nhân bắt đầu phiên riêng tư
→ chọn bệnh nhân quay lại hoặc bệnh nhân mới
→ quay lại: nhập mã bệnh nhân + CCCD, đối chiếu HIS
→ mới: nhập họ tên + CCCD + ngày sinh + giới tính
→ mới: nhận diện khuôn mặt, sau đó tạo Account/Health Profile
→ hiển thị Consent AI
→ accept: khai báo bằng text hoặc voice
→ AI tự tạo summary
→ bệnh nhân kiểm tra, chỉnh sửa và xác nhận
→ summary chuyển sang Pending Nurse Review
→ kết thúc và dọn dữ liệu phiên
→ trở lại Kiosk Home
```

Nếu bệnh nhân decline Consent AI, phiên AI dừng và kiosk hướng dẫn chuyển sang
quy trình khai báo thủ công. Lối vào nhân viên từ Kiosk Home phải quay về màn
hình đăng nhập; không dùng PIN chung để mở dashboard.
