# Context dự án MedVita cho PO/BA

File context của dự án MedVita, được skill `po-ba-assistant` đọc trước khi viết hoặc review requirement. Đây là bản đồ discovery, không phải snapshot trạng thái delivery. Luôn mở Jira để kiểm tra nội dung, child work items, liên kết và trạng thái hiện tại.

**Rà soát gần nhất:** 2026-10-10.

## Sản phẩm

MedVita — trợ lý AI cho bệnh viện: tiếp nhận người bệnh trước khám, ghi nhận buổi khám, hỗ trợ điền bệnh án và chăm sóc cá nhân hóa. Có yếu tố lâm sàng nên luôn đọc kèm reference Healthcare BA của skill.

## Jira

- Site `trivitaai.atlassian.net`, project key `MV`.
- Title Epic / Story dùng tiền tố module, vd `[Module 1] …`. Một số bug thêm khu vực, vd `[BUG][Module 1][Speech]`, `[Module 1][Thu thập triệu chứng]`.
- Mã rule đang dùng có dạng `BR-xx`, `MV7-BR-01`; giữ đúng mã có sẵn.

## Cách đọc nguồn

1. Đọc Epic hoặc tài liệu gốc xác định outcome và boundary.
2. Đọc các Story hoặc Task liên quan trực tiếp; không suy ra scope chỉ từ title trong danh sách child work items.
3. Đọc ticket phụ thuộc, ticket dùng lại logic và tài liệu được liên kết khi chúng ảnh hưởng input, output, trạng thái hoặc ownership.
4. Với báo cáo tiến độ, lấy trạng thái trực tiếp từ Jira và ghi thời điểm lấy dữ liệu.
5. Prototype chỉ là bằng chứng về tương tác mong muốn, không chứng minh production đã triển khai.

Khi nguồn mâu thuẫn: quyết định mới nhất đã được chốt rõ → Jira hiện tại → `docs/` → prototype.

## Module 1

- **Epic nền tảng:** MV-7 — định danh, Consent và hồ sơ người bệnh.
- **Epic khai báo:** MV-18 — thu thập triệu chứng và tiền sử.
- **Epic điều dưỡng:** MV-26 — điều dưỡng kiểm tra và xử lý sau khai báo.
- **Epic kiosk:** MV-373 — người bệnh tự khai báo trên tablet dùng chung tại bệnh viện.
- **Nhóm Story kiosk đã biết:** MV-374, MV-375, MV-376, MV-377, MV-378, MV-379, MV-421; MV-422 là Design task. Mở Epic MV-373 để xác minh danh sách mới nhất trước khi sử dụng.
- **Tài liệu:** `docs/module-1/`.
- **Prototype chính:** `patient.html`, `nurse-dashboard.html`.

## Module 2

- **Epic:** MV-195, MV-258, MV-259, MV-260, MV-261.
- **Tài liệu:** `docs/module-2/`; xem `README.md` để biết scope map và terminology.
- **Prototype chính:** `recording.html`, `module2.html`.

## Module 3

- **Epic:** MV-211 — AI hỗ trợ điền Phiếu Theo Dõi Điều Trị.
- **Story chức năng đã biết:** MV-230, MV-249, MV-250, MV-251, MV-255, MV-256, MV-257, MV-323. Epic còn có Task kỹ thuật, Design, QC và Bug; mở MV-211 để xác minh danh sách hiện tại.
- **Prototype chính:** `module3/` — chạy độc lập theo master plan v0.5 (D-02 hướng 1); bản một file `module3-v2.html` tạo bằng `node module3/build.mjs`. `module3.html` là bản cũ, mở từ HIS.
- **Spec / plan prototype:** `docs/superpowers/specs/2026-10-11-module3-prototype-design.md`, `docs/superpowers/plans/2026-10-11-module3-prototype.md`.
- **Tài liệu:** chưa có bộ `docs/module-3/` tại thời điểm rà soát. Không dùng file trong `output/` làm nguồn requirement nếu file đó chỉ là deliverable tổng hợp.

## Module khác

Nếu module chưa có trong bản đồ này, tìm Epic hoặc tài liệu gốc trước. Không suy ra scope từ tên prototype hoặc file output.

## Tài liệu sản phẩm

Bộ tài liệu đầy đủ của một module theo cấu trúc `docs/module-1/`: `README.md` (document map, terminology) và các file scope, users, workflows, functional requirements, business rules, acceptance criteria. PRD hoặc tài liệu mới của module lưu trong `docs/module-<n>/`.

## Thuật ngữ team

`transcript`, `audio`, `recording`, `consent`, `Draft`, `HIS/EMR`, `FE`, `BE`, `AI`, `QC`; Account, Health Profile, hospital context, Pending Nurse Review. Xem thêm phần Terminology trong `README.md` của từng module.

## Deliverable

- File xuất ra lưu trong `output/` khi người dùng không chỉ định vị trí khác. Tên file phải phản ánh đúng phạm vi hiện tại; không giữ tên cũ nếu nội dung đã mở rộng sang module khác, trừ khi người dùng yêu cầu giữ nguyên.
- Tên file bảng tính năng: `MedVita_Module_<n>_<Loại_bảng>.xlsx`.
- File mẫu: `output/MedVita_Module_4_Features_List.xlsx` (phân rã nội bộ), `output/MedVita_Danh_sach_tinh_nang_Module_1_2.xlsx` (bản cho khách hàng).
- Tiền tố ID trong bảng phân rã: `MV<n>-01` cho nhóm chức năng, `F<n>-001` cho feature.

## Dữ liệu demo của prototype

- Tài khoản nhân viên trong `nurse-dashboard.html`: `kiosk.tn01` (Kiosk Operator), `dieuduong.tn01`, `dieuduong.capcuu`, `dieuduong.supervisor`; mật khẩu `123456`.
- Bệnh nhân quay lại khám: mã `BN-TN-1024`, CCCD `012345678901`.
- Đây là dữ liệu demo của prototype, không phải dữ liệu thật.
