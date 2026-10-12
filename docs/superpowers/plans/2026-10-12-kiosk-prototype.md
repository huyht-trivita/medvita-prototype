# Kiosk prototype theo Epic MV-373 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> Ghi chú 2026-10-12: kế hoạch được thực thi inline ngay trong phiên đã viết nó, nên mỗi task ghi interface và cách kiểm tra thay vì chép toàn bộ code. Các task 2–7 cùng sửa `nurse-dashboard.html`, không chạy song song.

**Goal:** Prototype kiosk, Dashboard điều dưỡng, màn hình LCD và user flow khớp Epic MV-373 (spec `docs/superpowers/specs/2026-10-12-kiosk-prototype-design.md`).

**Architecture:** Store demo dùng chung `shared/kiosk-store.js` (UMD, localStorage + BroadcastChannel) cho `nurse-dashboard.html` và `lcd.html`. Các trang vẫn là HTML một file, JS thuần, không build.

**Tech Stack:** HTML/CSS/JS thuần, Web Speech API (nhận dạng và đọc), Mermaid 11 qua cdn.jsdelivr.net, test bằng Node `assert`.

## Global Constraints

- Văn bản giao diện tiếng Việt; câu chữ lấy nguyên từ ticket khi ticket đã quy định (hộp thoại từ chối Consent, hộp xác nhận Hủy, câu thông báo audio).
- Thời gian chờ mặc định: 120000 ms màn khai báo, 60000 ms màn phiếu số, cảnh báo 30000 ms, ngưỡng xử lý 60000 ms; `?timeout=fast` dùng 15000/10000/10000.
- Số kiosk demo dạng `K-001`, sequence theo bệnh viện + ngày. Số khám dạng `001`, sequence theo bệnh viện + khoa + ngày.
- LCD phần ngang giới hạn 20 bệnh nhân.
- Không đổi ID/HTML mà test hiện có dựa vào, trừ các assert được cập nhật trong Task 9.

---

### Task 1: Store dùng chung

**Files:** Create `shared/kiosk-store.js`, `tests/module1-kiosk-store.test.js`

**Interfaces (Produces):** `MedVitaKioskStore.createStore({ storage?, now?, broadcast? })` trả về `{ getState, reset, subscribe(fn) → unsubscribe, listSummaries(), addSummary(item) → summary, approveSummary(id, dept) → summary, issueKioskNumber(summaryId) → { number, issuedAt }, pendingKioskQueue(hospital), recentApproved(hospital, limit=20), listRedflags(), addRedflag(item), updateRedflag(id, patch), findProfiles(query), createProfile(data), findOrCreateHisProfile(hisPatient, hospital, createdBy) }`. Ngày giờ lưu dạng ISO string.

- [ ] Viết test: số kiosk `K-001`, `K-002` theo bệnh viện + ngày, sang ngày mới về `K-001`; gọi lại cùng summary trả số cũ; `pendingKioskQueue` bỏ item đã duyệt, sắp theo giờ cấp; `approveSummary` cấp số khám theo khoa; `recentApproved` mới nhất trước, tối đa 20; `findProfiles` gộp hồ sơ trùng định danh, có họ tên thì đối chiếu thêm họ tên.
- [ ] Chạy `node tests/module1-kiosk-store.test.js` → FAIL (chưa có file).
- [ ] Viết store, dữ liệu seed (12 summary app, 2 summary kiosk đang chờ, 7 red-flag, hồ sơ demo trùng CCCD).
- [ ] Chạy lại → PASS.

### Task 2: Dashboard điều dưỡng đọc store, số kiosk và gọi audio (MV-460)

**Files:** Modify `nurse-dashboard.html` (script data, review list/drawer, red-flag list/drawer, CSS)

**Interfaces (Consumes):** store Task 1. **Produces:** `showToast(message)`, `announceKioskCall(kioskNumber)`.

- [ ] Thêm `<script src="shared/kiosk-store.js">`, khởi tạo `const store = MedVitaKioskStore.createStore()`, bỏ mảng `reviewItems`/`redflagItems` hardcode, render từ store, `store.subscribe` để render lại.
- [ ] Card và drawer hiện nhãn `Số kiosk K-xxx`; drawer có checkbox `#rv-announce` "Phát thông báo gọi bệnh nhân" (mặc định tắt) khi item có số kiosk và đang chờ duyệt.
- [ ] Approve → `store.approveSummary` → nếu bật thì `announceKioskCall` (speechSynthesis vi-VN, không có giọng vi thì toast) → toast kết quả có số khám.
- [ ] Red-flag đổi trạng thái qua `store.updateRedflag`.

### Task 3: Định danh bệnh nhân (MV-375)

**Files:** Modify `nurse-dashboard.html` (step `info`)

- [ ] Kiểm tra mã: tìm thấy → thẻ `#his-confirm` (họ tên, CCCD, năm sinh, giới tính) với **Đúng là tôi / Không phải tôi**; không tìm thấy → báo và gợi ý tự nhập; `BN-TN-ERR` → "Chưa thể kiểm tra thông tin với bệnh viện…".
- [ ] Không có mã → `store.findProfiles`: 1 → dùng; nhiều → `#profile-chooser` (CCCD che còn 4 số cuối) + **Không phải thông tin của tôi** (bắt buộc họ tên rồi đối chiếu lại); 0 → `createPatientProfile(data)` qua `store.createProfile`.
- [ ] Hồ sơ không có họ tên hiển thị "Chưa có họ tên".

### Task 4: Hộp thoại kiosk và từ chối Consent (MV-376)

**Files:** Modify `nurse-dashboard.html` (markup `#kiosk-modal`, step `consent`)

**Produces:** `openKioskModal({ tone, title, message, actions })`, `closeKioskModal()`, `setKioskModalMessage(text)`.

- [ ] Từ chối → hộp thoại "Bạn chưa đồng ý sử dụng AI nên không thể tiếp tục khai báo triệu chứng." với **Kết thúc** (`endKioskSession('consent-declined')`) và **Cancel**. Xóa panel `#consent-declined`.

### Task 5: Chat — Xong sớm, red-flag, bổ sung (MV-421)

**Files:** Modify `nurse-dashboard.html` (step `chat`)

**Produces:** `setProcessing(on)`, `finishConversation()`, `detectRedflag(text)`.

- [ ] Nút `#btn-finish-early` **Xong sớm**; ở chế độ bổ sung đổi nhãn thành **Xong**.
- [ ] Từ khóa red-flag → `store.addRedflag` + hộp thoại cảnh báo với **Tiếp tục khai báo / Kết thúc khai báo**.
- [ ] Độ trễ giả lập AI gọi `setProcessing(true/false)` để tạm dừng thời gian chờ.

### Task 6: Tóm tắt chỉ xem, xác nhận và phiếu số (MV-450, MV-378)

**Files:** Modify `nurse-dashboard.html` (step `summary`)

- [ ] `#patient-summary` chỉ xem; **Chỉnh sửa thông tin** → `editSummaryViaChat()`; **Xác nhận thông tin** → `store.addSummary` + `store.issueKioskNumber`.
- [ ] Phiếu: số, họ tên (ẩn nếu trống), bệnh viện, giờ cấp; **In số thứ tự**, **Hoàn tất**.

### Task 7: Hủy khai báo và thời gian chờ (MV-377)

**Files:** Modify `nurse-dashboard.html` (topbar, script)

**Produces:** `endKioskSession(reason)`, `resetIdleTimer()`; `finishKioskSession()` gọi `endKioskSession('complete')`.

- [ ] Nút `#btn-cancel-intake` trên topbar, chỉ hiện từ định danh đến tóm tắt; hộp xác nhận "Hủy khai báo? Thông tin chưa xác nhận sẽ không được gửi cho điều dưỡng."
- [ ] Đếm giờ theo hằng số trong Global Constraints, cảnh báo đếm ngược, chạm màn hình là reset, tạm dừng khi xử lý hoặc ghi âm.

### Task 8: Màn hình LCD (MV-459)

**Files:** Create `lcd.html`

- [ ] Header (bệnh viện, đồng hồ), phần dọc từ `pendingKioskQueue`, phần ngang chạy chữ từ `recentApproved(…, 20)`, trạng thái trống, dòng không tên chỉ hiện số, tôn trọng `prefers-reduced-motion`.

### Task 9: User flow, index và test

**Files:** Create `kiosk-flow.html`; Modify `index.html`, `tests/module1-patient-intake.test.js`

- [ ] `kiosk-flow.html`: Mermaid 5 làn với mã story, bảng bước bên dưới.
- [ ] `index.html`: thẻ LCD và User flow.
- [ ] Cập nhật test regex (tóm tắt chỉ xem, `store.addSummary`, `findProfiles`) và thêm assert cho hộp thoại từ chối, Xong sớm, red-flag, Hủy, thời gian chờ, `lcd.html`, `kiosk-flow.html`.
- [ ] Chạy `node tests/module1-patient-intake.test.js && node tests/module1-kiosk-store.test.js` → PASS. Kiểm tra cú pháp script inline. Chạy thử trên trình duyệt theo kịch bản 3 tab.
