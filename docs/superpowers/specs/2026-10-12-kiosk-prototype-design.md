# Kiosk prototype theo Epic MV-373 — Design

**Ngày:** 2026-10-12 · **Nguồn yêu cầu:** Jira Epic MV-373 và các story MV-374, MV-375, MV-376, MV-421, MV-450, MV-378, MV-377, MV-459, MV-460 (trạng thái ngày 2026-10-12).

## Mục tiêu

Làm lại prototype kiosk trong `nurse-dashboard.html` cho khớp toàn bộ Epic MV-373, thêm màn hình chờ LCD và phần gọi bệnh nhân trên Dashboard điều dưỡng, đồng thời vẽ user flow high level.

Prototype là bằng chứng tương tác, không phải đặc tả. Khi prototype và Jira lệch nhau, Jira đúng.

## File

| File | Vai trò |
| --- | --- |
| `shared/kiosk-store.js` (mới) | Store demo dùng chung: summary, hàng đợi số kiosk, số khám, red-flag alert, hồ sơ bệnh nhân. Lưu localStorage key `medvita.kiosk.v1`, phát thay đổi qua `BroadcastChannel('medvita-kiosk')` và sự kiện `storage`. Viết dạng UMD để Node test được. |
| `nurse-dashboard.html` | Luồng kiosk mới và Dashboard điều dưỡng đọc/ghi qua store. Bỏ `reviewItems`/`redflagItems` hardcode, chuyển thành seed của store. |
| `lcd.html` (mới) | Màn hình chờ LCD, chỉ đọc store. |
| `kiosk-flow.html` (mới) | User flow high level bằng Mermaid (CDN jsdelivr), chia làn theo actor. |
| `index.html` | Thêm thẻ link tới `lcd.html` và `kiosk-flow.html`. |
| `tests/module1-kiosk-store.test.js` (mới), `tests/module1-patient-intake.test.js` | Test store và cập nhật test regex theo hành vi mới. |

## Store (`shared/kiosk-store.js`)

API (global `MedVitaKioskStore`, `module.exports` trên Node):

- `createStore({ storage, channel, now })` — `storage` có `getItem/setItem`; mặc định dùng `localStorage`, lỗi thì dùng bộ nhớ trong.
- `getState()`, `reset()`, `subscribe(fn)`.
- `issueKioskNumber(summaryId, hospital)` — sequence theo `hospital + ngày`, bắt đầu `001`, định dạng demo `K-001`. Gọi lại với cùng `summaryId` trả số cũ.
- `addSummary(item)`, `approveSummary(id, dept)` — khi duyệt cấp số khám theo `hospital + khoa + ngày` (giả lập MV-176), lưu `approvedAt`.
- `pendingKioskQueue(hospital)` — summary có số kiosk và đang `Pending Nurse Review`, theo thứ tự cấp số.
- `recentApproved(hospital, limit = 20)` — mới duyệt trước, gồm cả bệnh nhân app.
- `addRedflag(item)`.
- `findProfiles({ hospital, cccd, birthYear, gender, name })` — đối chiếu theo MV-446: không có tên thì khớp CCCD + năm sinh + giới tính; các hồ sơ giống hệt định danh gộp thành một lựa chọn.

## Luồng kiosk

1. **Định danh (MV-375/MV-447).** Có Mã BN → Kiểm tra: tìm thấy thì điền sẵn họ tên, CCCD, năm sinh, giới tính vào form và khóa sửa; muốn đổi thì sửa hoặc xóa mã (form tự xóa và mở lại) — quyết định 2026-10-12, bỏ thẻ xác nhận **Đúng là tôi / Không phải tôi**; không tìm thấy thì báo và cho nhập lại hoặc tự nhập; mã `BN-TN-ERR` giả lập HIS lỗi ("chưa thể kiểm tra", không báo "không tìm thấy"). Không có mã: đối chiếu hồ sơ; một hồ sơ khớp thì dùng; nhiều hồ sơ khác tên thì hiện danh sách (họ tên, năm sinh, giới tính, CCCD che còn 4 số cuối) kèm **Không phải thông tin của tôi** (bắt buộc bổ sung họ tên rồi đối chiếu lại); không khớp thì tạo hồ sơ mới gắn Kiosk Operator.
2. **Consent (MV-376/MV-449).** Từ chối → hộp thoại "Bạn chưa đồng ý sử dụng AI nên không thể tiếp tục khai báo triệu chứng." với **Kết thúc** (ghi `DECLINED`, đóng và làm sạch phiên) và **Cancel** (đóng hộp thoại, quay lại Consent). Bỏ màn "chuyển quy trình thủ công".
3. **Chat (MV-421/MV-452).** Text và voice (transcript sửa được trước khi gửi, không tự gửi). Nút **Xong sớm**. Từ khóa red-flag demo (`đau ngực`, `khó thở`, `ngất`, `méo miệng`, `co giật`) → tạm dừng, hiện cảnh báo hướng dẫn báo nhân viên y tế với **Tiếp tục khai báo / Kết thúc khai báo**, tạo red-flag alert trong store. Kết thúc hội thoại (hết câu hỏi, Xong sớm, Kết thúc khai báo) → tạo tóm tắt.
4. **Tóm tắt (MV-450/MV-454).** Chỉ xem. **Chỉnh sửa thông tin** → quay lại chat chế độ bổ sung, bấm **Xong** thì tạo lại tóm tắt. **Xác nhận thông tin** → `addSummary` (`Pending Nurse Review`, `source: 'kiosk'`) → `issueKioskNumber`.
5. **Phiếu số thứ tự (MV-378/MV-458).** Số kiosk, họ tên (ẩn nếu chưa có), bệnh viện, ngày giờ cấp. **In số thứ tự**, **Hoàn tất**.
6. **Kết thúc phiên (MV-377/MV-466).** Nút **Hủy khai báo** trên topbar từ định danh đến tóm tắt, có hộp xác nhận "Hủy khai báo? Thông tin chưa xác nhận sẽ không được gửi cho điều dưỡng." Thời gian chờ 2 phút (khai báo), 60 giây (phiếu số), cảnh báo đếm ngược 30 giây, chạm màn hình là reset; tạm dừng khi đang chờ AI hoặc ghi âm. `?timeout=fast` dùng 15/10/10 giây cho demo. Mọi cách đóng phiên đều gọi chung `endKioskSession(reason)`: dừng ghi âm, xóa dữ liệu hiển thị, về màn bắt đầu, giữ đăng nhập Kiosk Operator.

## Dashboard điều dưỡng (MV-460/MV-464)

- Danh sách và drawer đọc từ store, tự render lại khi store đổi.
- Item từ kiosk có nhãn số kiosk.
- Drawer có checkbox **Phát thông báo gọi bệnh nhân** (mặc định bật, quyết định 2026-10-12) cho item có số kiosk. Approve thành công → `approveSummary` → nếu bật thì đọc `speechSynthesis` vi-VN theo mẫu câu của bệnh viện (`store.callTemplate(hospital)`; mặc định "Bệnh nhân số thứ tự chờ khám {số kiosk} đã được xếp khám, vui lòng tới quầy thu ngân."). Không có giọng vi-VN thì hiện câu thông báo dạng toast.
- Sau khi duyệt, item có số kiosk có nút **Phát lại thông báo**.
- Red-flag từ kiosk xuất hiện trong danh sách cảnh báo.

## LCD (`lcd.html`, MV-459/MV-463)

- Header: tên bệnh viện, đồng hồ.
- Phần dọc chữ to: "Đang chờ điều dưỡng tiếp nhận" — mỗi bệnh nhân một dòng (số kiosk + họ tên) theo thứ tự cấp số, chỉ gồm số cấp trong ngày. Danh sách dài hơn màn hình thì chia trang theo số dòng vừa khung, tự lật trang mỗi 8 giây, hiện "Trang x/y" (quyết định 2026-10-12).
- Phần ngang chạy chữ phía dưới: "Đã xếp khám" — số khám · họ tên · khoa của 20 bệnh nhân mới duyệt.
- Trạng thái trống; dòng không có họ tên chỉ hiện số. Không hiển thị nội dung tóm tắt.
- Mất kết nối (sự kiện `offline` của trình duyệt): ẩn danh sách, hiện "Mất kết nối"; có kết nối lại thì hiển thị lại.
- Ghi chú demo: bản thật dùng tài khoản thiết bị LCD riêng theo bệnh viện, chỉ đọc.

## User flow (`kiosk-flow.html`)

Mermaid flowchart 5 làn: Nhân viên (Kiosk Operator) · Bệnh nhân tại kiosk · MedVita (BE/AI) · Điều dưỡng · Màn hình LCD. Mỗi bước gắn mã story. Thể hiện các nhánh: HIS lỗi/không tìm thấy, nhiều hồ sơ, từ chối Consent (Kết thúc/Cancel), red-flag, Xong sớm, chỉnh sửa tóm tắt, cấp số và in, Hoàn tất/Hủy/hết thời gian chờ → làm sạch phiên, điều dưỡng duyệt → audio → LCD chuyển sang danh sách chờ khám. Có chú giải và danh sách story.

## Xử lý lỗi

- localStorage không dùng được → store chạy bộ nhớ trong (chỉ một tab).
- `speechSynthesis` không có hoặc không có giọng vi-VN → toast chữ.
- Không có Web Speech recognition → giữ hành vi hiện tại (báo và nhập text).

## Test

- `tests/module1-kiosk-store.test.js`: số kiosk tăng dần theo bệnh viện + ngày và reset sang ngày mới; idempotent theo `summaryId`; `pendingKioskQueue` bỏ item đã duyệt; `recentApproved` giới hạn 20 và mới nhất trước; số khám theo khoa; `findProfiles` gộp hồ sơ trùng định danh.
- `tests/module1-patient-intake.test.js`: thay assert `contenteditable` của tóm tắt bằng assert chỉ xem; thêm assert cho hộp thoại từ chối Consent, Xong sớm, red-flag, Hủy khai báo, thời gian chờ.
- Kiểm tra tay trên trình duyệt theo kịch bản demo 3 tab.

## Ngoài phạm vi

Xác thực LCD thật, máy in thật, TTS phía server, cấu hình thời gian chờ cho quản trị, nhân viên thoát kiosk giữa phiên (MV-445 còn mở).
