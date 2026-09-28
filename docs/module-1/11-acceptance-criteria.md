# Acceptance Criteria and Traceability

## Identity and consent

- **AC-01:** Account có nhiều Health Profile không làm hệ thống tự chọn sai người.
- **AC-02:** Intake bị chặn cho đến khi xác nhận Health Profile.
- **AC-03:** Intake bị chặn khi consent chưa có, hết hiệu lực hoặc bị decline.
- **AC-04:** Phiên độc lập không tự nhận hospital context từ liên kết lịch sử.

## Intake and safety

- **AC-05:** Text intake hoạt động khi voice bị tắt hoặc lỗi.
- **AC-06:** AI không hỏi quá giới hạn follow-up.
- **AC-07:** Kết thúc hội thoại tự tạo summary mà không cần hỏi thêm.
- **AC-08:** Summary mới ở `Pending Nurse Review` và không gửi HIS trực tiếp.
- **AC-09:** Red-flag dùng đúng rule version đã duyệt và tạo cảnh báo kịp thời.
- **AC-10:** Đề xuất khoa được hiển thị là đề xuất và có thể sửa.

## Nurse review and HIS

- **AC-11:** Điều dưỡng thấy đúng bệnh nhân, bệnh viện, summary và red-flag.
- **AC-12:** Approve bị chặn khi thiếu trường phân luồng bắt buộc.
- **AC-13:** Lưu AI suggestion ban đầu, nurse decision cuối và audit event.
- **AC-14:** Chỉ summary đã approve với context hợp lệ mới gửi HIS.
- **AC-15:** Retry HIS không tạo submission trùng hoặc làm mất summary.

## Kiosk, RBAC and voice

- **AC-16:** Account chỉ có `kiosk.activate` và `patient_intake.create` vào thẳng
  Kiosk Mode và không xem được summary/red-flag worklist.
- **AC-17:** Kiosk hiển thị đúng hai nhánh định danh và đúng trường bắt buộc cho
  bệnh nhân quay lại hoặc bệnh nhân mới.
- **AC-18:** Mã bệnh nhân không tồn tại hoặc CCCD không khớp bị chặn tại bước định
  danh và có thông báo sửa được.
- **AC-19:** Bệnh nhân quay lại hợp lệ bỏ qua face verification; bệnh nhân mới chỉ
  sang Consent AI sau khi face verification và tạo profile hoàn tất.
- **AC-20:** Decline Consent AI không mở chat và cho phép kết thúc session an toàn.
- **AC-21:** Voice tiếng Việt tạo transcript trong ô nhập, cho phép sửa và không tự
  gửi cho đến khi bệnh nhân bấm gửi.
- **AC-22:** Khi voice không khả dụng hoặc permission bị từ chối, text input vẫn
  hoạt động và hiển thị hướng dẫn phục hồi.
- **AC-23:** Xác nhận summary tạo item `Pending Nurse Review` nhưng không expose
  dashboard hoặc worklist trong patient session.
- **AC-24:** Kết thúc hoặc decline xoá identity, context, chat, transcript tạm và
  summary trước khi Kiosk Home nhận bệnh nhân tiếp theo.
- **AC-25:** Lối vào nhân viên quay về login; account chỉ mở các capability có
  permission tương ứng và không sử dụng PIN dùng chung.

## Traceability

| Area | Jira sources |
| --- | --- |
| Identity, profile, consent | MV-7; MV-8, MV-20, MV-51, MV-9, MV-12, MV-22, MV-27, MV-29, MV-30 |
| Intake, summary, red-flag | MV-18; MV-11, MV-10, MV-21, MV-19 |
| Nurse review and HIS gate | MV-26; MV-24, MV-25, MV-28, MV-105 |
| Prefix defects | MV-115, MV-166, MV-175 |
| Kiosk, RBAC, face recognition và voice extension | Stakeholder-approved 28/09/2026; Jira key chưa được gán |

Các AC được tài liệu hóa từ Jira; chúng không tự chứng minh implementation hoặc
kiểm thử đã hoàn thành.
