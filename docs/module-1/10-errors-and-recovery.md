# Errors, Recovery and Known Defects

## Required recovery behaviour

- Không chắc identity/profile/context: dừng và yêu cầu xử lý.
- Mất mạng hoặc đóng app: bảo toàn câu trả lời đã gửi và trạng thái phiên.
- Voice lỗi: tiếp tục bằng text.
- Microphone bị chặn hoặc browser không hỗ trợ: giải thích nguyên nhân và giữ text
  input khả dụng; không tự gửi transcript chưa được bệnh nhân kiểm tra.
- Face verification thất bại: cho phép retry hoặc chuyển sang manual fallback đã
  được bệnh viện phê duyệt; không tạo profile từ kết quả chưa xác minh.
- Mã bệnh nhân không tồn tại hoặc CCCD không khớp: giữ người dùng ở bước định danh.
- Kiosk account thiếu permission: không trả dashboard/worklist data.
- Kết thúc, decline hoặc huỷ session: dọn dữ liệu bệnh nhân trước khi về Kiosk Home.
- Lối vào nhân viên: quay về đăng nhập; account không đủ quyền không được mở màn
  hình bị giới hạn.
- HIS lỗi: giữ summary đã approve và cho phép retry an toàn.
- Retry: không tạo bản ghi hoặc submission trùng.

## Prefix-matched open defects

- **MV-115 — High:** tin nhắn đầu tiên của hội thoại mới có thể trả lỗi chung.
- **MV-166 — Medium:** thông báo hoàn tất summary bị TTS đọc bằng tiếng Thái;
  sửa tiếng Việt hoặc tắt voice cho system message đó.
- **MV-175 — High/Major:** kết thúc hỏi đáp không tự tạo summary; người dùng phải
  hỏi thêm. Đây là lỗi làm đứt luồng cốt lõi.

Ba lỗi trên ở trạng thái `To Do` khi tài liệu được cập nhật. Kiểm tra Jira trước
khi dùng thông tin này cho báo cáo tiến độ.
