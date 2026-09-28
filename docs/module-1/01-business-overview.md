# Business Overview

## Problem

Quy trình tiếp nhận cần xác định đúng người bệnh, thu thập đủ thông tin ban đầu
và chuyển dữ liệu đúng bệnh viện. Nếu chỉ dựa vào tài khoản hoặc số điện thoại,
dữ liệu có thể gắn nhầm người; nếu thiếu thông tin có cấu trúc, nhân viên y tế
phải hỏi lại và việc phân luồng bị chậm.

## Proposed value

- Xác định Account, Health Profile và hospital context của phiên.
- Chỉ cho phép khai báo bằng AI khi consent hợp lệ.
- Thu thập triệu chứng và thông tin an toàn bằng text hoặc voice.
- Tạo summary, red-flag và đề xuất khoa để điều dưỡng kiểm tra.
- Chỉ chuyển HIS sau khi điều dưỡng approve và hospital context hợp lệ.
- Cho phép bệnh nhân tự khai báo tại kiosk/tablet của bệnh viện mà không nhìn thấy
  dashboard hoặc dữ liệu của bệnh nhân khác.

## Product principles

1. Đúng người bệnh trước khi thu thập dữ liệu.
2. Số điện thoại không phải patient identity.
3. Hospital context thuộc phiên hiện tại, không suy đoán từ lịch sử.
4. Consent là gate bắt buộc của luồng AI.
5. AI tạo nội dung hỗ trợ; điều dưỡng kiểm tra và quyết định vận hành.
6. Không có hospital context thì dữ liệu chỉ lưu trong MedVita.
7. Red-flag phải có rule, owner, version và test set được phê duyệt.
8. Quyền kiosk và quyền nghiệp vụ điều dưỡng phải được tách bằng RBAC.
9. Thiết bị dùng chung phải xoá dữ liệu hiển thị của phiên trước khi nhận bệnh
   nhân tiếp theo.
