# Identity, Consent and Hospital Context

Đăng nhập chỉ xác định Account. Hệ thống phải xác định và yêu cầu xác nhận Health
Profile trước khi tạo dữ liệu y tế. Một Account có thể quản lý nhiều Health Profile
theo quyền được cấp.

Hospital context gồm bệnh viện và định danh HIS của phiên. Nó được thiết lập từ
Universal Link hoặc luồng SĐT/OTP có chọn bệnh viện. Liên kết HIS cũ trong Health
Profile không tự động trở thành context của phiên mới.

Consent cần tối thiểu trạng thái, phiên bản nội dung, thời gian và actor. Accept,
decline và re-consent phải được audit. Decline không được biến thành accept ngầm.

Trong Kiosk Mode, bệnh nhân quay lại được đối chiếu bằng `patient_id + CCCD` tại
Bệnh viện Thái Nguyên. Bệnh nhân mới cung cấp họ tên, CCCD, ngày sinh và giới
tính, sau đó hoàn thành face verification trước khi hệ thống tạo Account/Health
Profile. Không dùng session của Kiosk Operator làm patient identity.

Consent kiosk phải được hiển thị sau khi identity đã xác định và trước AI chat.
Nội dung consent phải nêu mục đích thu thập, phạm vi dữ liệu, vai trò hỗ trợ của
AI, bước nurse review, quyền decline và việc chuyển voice thành transcript nếu
bệnh nhân sử dụng microphone.

Các ticket chi tiết gồm MV-8, MV-20, MV-51, MV-9, MV-12, MV-22, MV-27, MV-29
và MV-30.
