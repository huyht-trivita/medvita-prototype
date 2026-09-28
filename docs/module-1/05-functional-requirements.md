# Functional Requirements

## Identity and consent

- **FR-01:** Phân biệt Account, Health Profile và hồ sơ HIS.
- **FR-02:** Phiên phải có Health Profile được người dùng xác nhận.
- **FR-03:** Hospital context chỉ được tạo từ thông tin phiên hiện tại.
- **FR-04:** AI intake chỉ bắt đầu khi Consent AI hợp lệ.
- **FR-05:** Hỗ trợ accept, decline và re-consent.

## Intake

- **FR-06:** Hỗ trợ text và voice khi tính năng được bật.
- **FR-07:** AI hỏi tối đa bảy câu follow-up theo ngữ cảnh.
- **FR-08:** Lưu lý do khám, triệu chứng và thông tin an toàn trong scope.
- **FR-09:** Tạo summary gắn với Health Profile và intake session.
- **FR-10:** Summary mới ở trạng thái `Pending Nurse Review`.
- **FR-11:** Red-flag được đánh giá trong phiên.
- **FR-12:** Đề xuất khoa/phân khoa là giá trị có thể chỉnh sửa.

## Nurse operations and HIS

- **FR-13:** Điều dưỡng xem được worklist summary và red-flag chờ xử lý.
- **FR-14:** Điều dưỡng review nội dung và phân luồng trước approve.
- **FR-15:** Chọn phòng khám/công khám theo rule trước xác nhận.
- **FR-16:** Ghi trạng thái xử lý và audit events.
- **FR-17:** Không gửi HIS trước approve hoặc khi thiếu hospital context hợp lệ.
- **FR-18:** Retry không tạo trùng Account, Health Profile hoặc submission.

## Kiosk, RBAC and shared-device privacy

- **FR-19:** Account có `kiosk.activate` và `patient_intake.create` được mở Kiosk
  Mode mà không nhận quyền xem dashboard điều dưỡng.
- **FR-20:** Kiosk cung cấp nhánh bệnh nhân quay lại và bệnh nhân mới với đúng bộ
  trường định danh đã quy định.
- **FR-21:** Bệnh nhân quay lại được đối chiếu bằng mã bệnh nhân + CCCD với HIS
  trước khi chuyển sang Consent AI.
- **FR-22:** Bệnh nhân mới phải hoàn thành nhận diện khuôn mặt trước khi MedVita
  tạo Account và Health Profile.
- **FR-23:** Consent AI được hiển thị sau khi định danh/xác minh thành công và
  trước khi mở chat AI.
- **FR-24:** Voice input nhận dạng tiếng Việt và đưa transcript vào ô nhập để
  bệnh nhân kiểm tra/chỉnh sửa; hệ thống không tự gửi transcript.
- **FR-25:** Khi voice không khả dụng, bị từ chối permission hoặc lỗi nhận dạng,
  bệnh nhân tiếp tục bằng text.
- **FR-26:** Xác nhận summary tạo item `Pending Nurse Review` nhưng không cho
  bệnh nhân mở worklist điều dưỡng.
- **FR-27:** Kết thúc hoặc decline phải xoá thông tin định danh, context, chat,
  transcript tạm và summary khỏi giao diện trước khi trở lại Kiosk Home.
- **FR-28:** Lối vào nhân viên từ kiosk phải yêu cầu đăng nhập account và chỉ mở
  capability được permission cho phép.
