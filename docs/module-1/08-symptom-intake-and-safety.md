# Symptom Intake, Summary and Safety

AI hỏi theo ngữ cảnh với giới hạn tối đa bảy câu follow-up theo MV-18. Text là
fallback bắt buộc nếu voice không ổn định. Câu trả lời đã gửi không được mất khi
người dùng thoát app hoặc mất kết nối.

Trong kiosk, voice input dùng nhận dạng tiếng Việt. Transcript phải được đưa vào
ô nhập để bệnh nhân kiểm tra và chỉnh sửa; hệ thống chỉ gửi khi bệnh nhân chủ động
bấm gửi. Nếu microphone bị chặn, trình duyệt không hỗ trợ hoặc nhận dạng thất bại,
text vẫn phải hoạt động. Audio/transcript tạm phải được dọn khi kết thúc session.

Summary phải phân biệt dữ liệu người dùng cung cấp với nội dung AI tổ chức hoặc
suy luận. Metadata nên cho phép trace `session_id`, timestamp, model, prompt và
rule version khi các trường này nằm trong scope kỹ thuật.

Red-flag là cảnh báo cho nhân viên y tế, không phải chẩn đoán. Rule chỉ được bật
khi có owner chuyên môn, version, test set và phạm vi áp dụng được phê duyệt.

Các định nghĩa chưa chốt: summary schema, trường bắt buộc, tiêu chí completeness,
ngưỡng đề xuất khoa và quy trình review định kỳ của red-flag rules.

Kiosk không được biến cảnh báo hoặc AI summary thành chẩn đoán tự động. Khi phát
hiện nội dung có thể là red-flag, hệ thống vẫn tạo cảnh báo cho nhân viên có quyền
và hướng dẫn bệnh nhân tìm hỗ trợ tại chỗ theo rule được duyệt.
