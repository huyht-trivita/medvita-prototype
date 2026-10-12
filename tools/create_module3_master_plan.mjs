import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outDir = "/Users/admin/Work/trivita/medvita-prototype/output";
const outFile = `${outDir}/MedVita_Module_3_Master_Plan.xlsx`;
const previewDir = "/private/tmp/medvita-module3-plan-previews";

const wb = Workbook.create();
const names = ["Tổng quan", "Master Plan", "Workstreams", "Milestones", "Dependencies", "RACI", "Issues", "Risk Register", "Go-NoGo", "Actions"];
for (const n of names) wb.worksheets.add(n);

const C = {
  navy: "#16365C", blue: "#1F4E78", sky: "#D9EAF7", pale: "#EAF2F8",
  green: "#E2F0D9", greenText: "#376623", amber: "#FFF2CC", amberText: "#7F6000",
  red: "#FCE4D6", redText: "#9C0006", gray: "#E7E6E6", light: "#F7F9FB", white: "#FFFFFF",
  border: "#B4C6D7", text: "#203040"
};

function title(sheet, text, subtitle, lastCol) {
  sheet.showGridLines = false;
  sheet.getRange(`A1:${lastCol}1`).merge();
  sheet.getRange("A1").values = [[text]];
  sheet.getRange(`A1:${lastCol}1`).format = { fill: C.navy, font: { color: C.white, bold: true, size: 18 }, rowHeight: 34, verticalAlignment: "center" };
  sheet.getRange(`A2:${lastCol}2`).merge();
  sheet.getRange("A2").values = [[subtitle]];
  sheet.getRange(`A2:${lastCol}2`).format = { fill: C.pale, font: { color: C.text, italic: true, size: 10 }, wrapText: true, rowHeight: 34, verticalAlignment: "center" };
}

function header(sheet, range) {
  sheet.getRange(range).format = { fill: C.blue, font: { color: C.white, bold: true }, wrapText: true, verticalAlignment: "center", horizontalAlignment: "center", borders: { preset: "all", style: "thin", color: C.border } };
}

function body(sheet, range) {
  sheet.getRange(range).format = { font: { color: C.text, size: 10 }, wrapText: true, verticalAlignment: "top", borders: { preset: "all", style: "thin", color: C.border } };
}

function statusValidation(sheet, range) {
  sheet.getRange(range).dataValidation = { rule: { type: "list", values: ["Chưa bắt đầu", "Đang thực hiện", "Đang review", "Hoàn thành", "Bị chặn", "Cần xác nhận"] } };
}

// 1. Tổng quan
{
  const s = wb.worksheets.getItem("Tổng quan");
  title(s, "MEDVITA MODULE 3 — MASTER PROJECT PLAN", "Bản lập kế hoạch ngày 10/10/2026. Timeline theo tuần là giả định để tổ chức công việc, chưa phải cam kết triển khai.", "H");
  s.getRange("A4:B10").values = [
    ["Hạng mục", "Nội dung"],
    ["Mục tiêu", "Hỗ trợ bác sĩ lập và hoàn thiện bệnh án điện tử nhanh hơn; AI tạo bản nháp, bác sĩ kiểm tra và chịu trách nhiệm xác nhận."],
    ["Nguyên tắc sản phẩm", "Chạy độc lập khi chưa có HIS/EMR; đồng thời có thể nhận dữ liệu từ HIS/EMR và Module 1–2 khi sẵn sàng."],
    ["Phạm vi pilot đề xuất", "Ổn định Phiếu Theo Dõi Điều Trị, bổ sung clinical workspace độc lập, hợp nhất ngữ cảnh, review/versioning và cơ chế tích hợp có kiểm soát."],
    ["Ngoài phạm vi pilot", "Tự động ký bệnh án thay bác sĩ; tự quyết định chẩn đoán/y lệnh; triển khai hàng loạt cho mọi loại biểu mẫu ngay từ đầu."],
    ["Tình trạng hiện tại", "CHƯA SẴN SÀNG PRODUCTION — còn lỗi Urgent/High ảnh hưởng an toàn lâm sàng và tính đúng đắn dữ liệu."],
    ["Nguồn", "Product Discovery Module 3; Epic MV-211 và Jira snapshot ngày 10/10/2026."],
  ];
  header(s, "A4:B4"); body(s, "A5:B10");
  s.getRange("A12:D17").values = [
    ["Chỉ số điều hành", "Giá trị", "Ý nghĩa", "Nguồn"],
    ["Story thuộc MV-211", 9, "Phạm vi hiện có đang được theo dõi", "Jira snapshot"],
    ["Story hoàn thành", 0, "Chưa có story ở trạng thái Done", "Jira snapshot"],
    ["Bug đang mở", 21, "Cần xử lý/triage trước pilot", "Jira snapshot"],
    ["Bug Urgent", 2, "Blocker an toàn và tính đúng dữ liệu", "MV-406, MV-407"],
    ["Bug High", 5, "Rủi ro lớn đối với luồng bác sĩ", "Jira snapshot"],
  ];
  header(s, "A12:D12"); body(s, "A13:D17");
  s.getRange("F4:H10").values = [
    ["Quyết định cần chốt", "Vai trò chốt", "Mốc cần có"],
    ["Clinical Owner và hội đồng duyệt tiêu chí an toàn", "Sponsor/PO bệnh viện", "Trước Gate G1"],
    ["Phạm vi khoa/phòng và mẫu bệnh án pilot", "PO + Clinical Owner", "Trước Gate G1"],
    ["Nguồn dữ liệu chuẩn khi chạy độc lập và khi tích hợp", "PO + Tech Lead", "Trước Gate G2"],
    ["Ngưỡng chấp nhận AI và bộ dữ liệu đánh giá", "Clinical Owner + AI Lead", "Trước Gate G3"],
    ["Năng lực đội ngũ và timeline cam kết", "Sponsor + Delivery Lead", "Sau estimation"],
    ["Điều kiện Go/No-Go pilot", "Steering Committee", "Gate G6"],
  ];
  header(s, "F4:H4"); body(s, "F5:H10");
  s.getRange("F12:H17").values = [
    ["Release gate", "Trạng thái", "Nhận định"],
    ["An toàn lâm sàng", "Đỏ", "Còn MV-406 và lỗi liên quan dữ liệu/ngữ cảnh."],
    ["Tính toàn vẹn dữ liệu", "Đỏ", "Còn MV-407, MV-413, MV-420."],
    ["Trải nghiệm bác sĩ", "Vàng", "Luồng chính đang phát triển và còn lỗi hiệu năng/ngữ cảnh."],
    ["Bảo mật & truy vết", "Cần xác nhận", "Cần evidence về audit, phân quyền, prompt leakage và triển khai on-prem."],
    ["Sẵn sàng vận hành", "Cần xác nhận", "Chưa có UAT, SOP, rollback và ownership được phê duyệt."],
  ];
  header(s, "F12:H12"); body(s, "F13:H17");
  s.getRange("G13:G14").format = { fill: C.red, font: { color: C.redText, bold: true }, horizontalAlignment: "center" };
  s.getRange("G15").format = { fill: C.amber, font: { color: C.amberText, bold: true }, horizontalAlignment: "center" };
  s.getRange("A19:H21").merge();
  s.getRange("A19").values = [["Khuyến nghị: chưa đưa Module 3 lên production. Ưu tiên đóng lỗi Urgent/High, chốt Clinical Owner và tiêu chí đánh giá, sau đó mới mở pilot có giới hạn với cơ chế bác sĩ review bắt buộc."]];
  s.getRange("A19:H21").format = { fill: C.red, font: { color: C.redText, bold: true, size: 12 }, wrapText: true, verticalAlignment: "center", horizontalAlignment: "left", borders: { preset: "outside", style: "medium", color: "#C65911" } };
  [140, 390, 110, 130, 22, 230, 130, 240].forEach((w,i)=>s.getRange(`${String.fromCharCode(65+i)}:${String.fromCharCode(65+i)}`).format.columnWidthPx=w);
  s.freezePanes.freezeRows(2);
}

// 2. Master Plan
{
  const s = wb.worksheets.getItem("Master Plan");
  title(s, "LỘ TRÌNH PHÁT TRIỂN MODULE 3", "Các mốc tuần là planning hypothesis để team estimate và chốt lại. Critical path: P0 → P1 → P2 → P3 → P4 → P6 → P7.", "J");
  const rows = [
    ["Phase", "Mục tiêu", "Kết quả chính", "Dự kiến", "Điều kiện bắt đầu", "Điều kiện hoàn tất", "Owner vai trò", "Phụ thuộc", "Trạng thái", "Ghi chú"],
    ["P0", "Chốt phạm vi và governance", "Clinical Owner; mẫu pilot; KPI; source of truth; RACI; backlog ưu tiên", "Tuần 1–2", "Sponsor xác nhận kickoff", "Gate G1 được duyệt", "PO/Delivery Lead", "—", "Chưa bắt đầu", "Không phát triển rộng trước khi chốt phạm vi"],
    ["P1", "Ổn định lõi MV-211", "Đóng Urgent/High; ngăn ghi sai/ghi ngầm; xác nhận luồng review", "Tuần 3–6", "G1", "Không còn blocker; regression pass", "Tech Lead + QA Lead", "P0", "Đang thực hiện", "Bám backlog Jira hiện tại"],
    ["P2", "Clinical workspace độc lập", "Tạo/chọn hồ sơ; nhập dữ liệu; lập phiếu khi không có HIS/EMR", "Tuần 5–10", "G1; kiến trúc được duyệt", "Demo E2E standalone và audit trail", "Product + Platform Lead", "P0, P1 nền tảng", "Chưa bắt đầu", "Cho phép chạy độc lập"],
    ["P3", "Hợp nhất ngữ cảnh bệnh nhân", "Nhận dữ liệu M1/M2/HIS; provenance; chống dữ liệu cũ/xung đột", "Tuần 9–14", "Data contract được duyệt", "Context pack có nguồn và kiểm thử", "Integration Lead", "P2", "Chưa bắt đầu", "Không để integration trở thành điểm lỗi duy nhất"],
    ["P4", "AI hỗ trợ soạn thảo có kiểm soát", "Draft theo section; compare; review; version; xác nhận bác sĩ", "Tuần 11–16", "Bộ tiêu chí clinical/AI", "Clinical evaluation đạt ngưỡng", "AI Lead + Clinical Owner", "P1, P2, P3", "Chưa bắt đầu", "Human-in-the-loop bắt buộc"],
    ["P5", "Khung biểu mẫu mở rộng", "Cấu hình template/section; thử thêm 1 mẫu ưu tiên", "Tuần 15–20", "P4 ổn định", "Mẫu thứ hai không cần fork lõi", "Product + Platform Lead", "P4", "Chưa bắt đầu", "Không là blocker của pilot lõi"],
    ["P6", "Hardening và pilot readiness", "Security; performance; resilience; observability; UAT; SOP; rollback", "Tuần 17–22", "Luồng E2E ổn định", "Gate G6 đủ evidence", "Delivery + QA + Security", "P2, P3, P4", "Chưa bắt đầu", "Có test mất kết nối HIS/AI"],
    ["P7", "Pilot có kiểm soát", "Đào tạo; chạy pilot; theo dõi KPI; incident review; quyết định mở rộng", "Tuần 23–26", "Go decision", "Pilot report và quyết định tiếp theo", "PO + Hospital Ops", "P6", "Chưa bắt đầu", "Giới hạn khoa/phạm vi"],
  ];
  s.getRange(`A4:J${3+rows.length}`).values = rows;
  header(s, "A4:J4"); body(s, `A5:J${3+rows.length}`); statusValidation(s, `I5:I${3+rows.length}`);
  const widths=[70,210,330,95,190,240,170,150,120,220]; widths.forEach((w,i)=>s.getRangeByIndexes(0,i,30,1).format.columnWidthPx=w);
  s.freezePanes.freezeRows(4); s.getRange("A4:J4").format.rowHeight=36;
}

// 3. Workstreams
{
  const s = wb.worksheets.getItem("Workstreams");
  title(s, "WORKSTREAM & DELIVERABLE PLAN", "Mỗi dòng là một đầu ra quản lý được; không thay thế feature backlog hoặc user story chi tiết.", "K");
  const rows = [
    ["ID","Phase","Workstream","Deliverable","Evidence hoàn tất","Phụ thuộc","Responsible","Accountable","Mốc","Trạng thái","Nguồn"],
    ["WS-01","P0","Product/BA","Scope pilot và outcome/KPI được duyệt","Scope statement + KPI dictionary có sign-off","—","PO/BA","Sponsor/PO","G1","Chưa bắt đầu","Discovery"],
    ["WS-02","P0","Clinical Governance","Clinical Owner, review board và clinical safety policy","Danh sách vai trò, cadence và quyền quyết định","—","Clinical Owner","Sponsor/PO","G1","Chưa bắt đầu","Discovery"],
    ["WS-03","P0","Architecture","Kiến trúc standalone + integrated và source of truth","Architecture decision records được duyệt","WS-01","Tech Lead","CTO/Architecture Owner","G2","Chưa bắt đầu","Discovery"],
    ["WS-04","P1","Engineering","Đóng MV-406, MV-407 và các bug High","Regression evidence; không còn blocker mở","WS-02","FE/BE/AI Leads","Tech Lead","G2","Đang thực hiện","Jira MV-211"],
    ["WS-05","P1","QA","Bộ test dữ liệu hiện tại, ghi phiếu, multi-turn và drug safety","Test suite chạy qua môi trường pilot","WS-04","QA Lead","Tech Lead","G2","Chưa bắt đầu","Issues"],
    ["WS-06","P2","Product/UX","Luồng bác sĩ làm việc độc lập không HIS","Prototype được bác sĩ review; usability findings đóng","WS-01","UX + BA","PO","G3","Chưa bắt đầu","Discovery"],
    ["WS-07","P2","Platform/BE","Patient/encounter/document workspace độc lập","API + audit + demo E2E","WS-03","BE Lead","Tech Lead","G3","Chưa bắt đầu","Discovery"],
    ["WS-08","P3","Integration","Data contract cho M1/M2/HIS và provenance","Contract tests + mapping + fallback","WS-03, WS-07","Integration Lead","Tech Lead","G4","Chưa bắt đầu","Discovery"],
    ["WS-09","P4","AI","Clinical context assembly và section drafting","Evaluation report theo bộ ca đã duyệt","WS-02, WS-05, WS-08","AI Lead","Clinical Owner","G5","Chưa bắt đầu","Discovery"],
    ["WS-10","P4","Application","Review/compare/version/approve trước khi ghi","Không có ghi ngầm; audit đầy đủ","WS-07, WS-09","FE + BE Leads","Tech Lead","G5","Chưa bắt đầu","Discovery"],
    ["WS-11","P5","Platform","Template framework và 1 mẫu mở rộng","Mẫu mới cấu hình được, không fork lõi","WS-10","Platform Lead","Tech Lead","G5","Chưa bắt đầu","Roadmap"],
    ["WS-12","P6","Security","Threat model, RBAC, audit, privacy, prompt leakage","Security review và remediation evidence","WS-07, WS-08","Security Lead","Tech Lead","G6","Chưa bắt đầu","Discovery"],
    ["WS-13","P6","Performance/Resilience","SLO, load test, timeout/retry/fallback","Kết quả test đạt ngưỡng được duyệt","WS-07, WS-09","SRE/Platform","Tech Lead","G6","Chưa bắt đầu","Discovery"],
    ["WS-14","P6","UAT/Operations","UAT, SOP, training, support và rollback","Biên bản UAT + runbook + roster hỗ trợ","WS-10, WS-12, WS-13","QA + Hospital Ops","PO","G6","Chưa bắt đầu","Pilot readiness"],
    ["WS-15","P7","Pilot","Pilot giới hạn và đo KPI","Pilot report; issue log; decision mở rộng","WS-14","PO + Hospital Ops","Sponsor/PO","G7","Chưa bắt đầu","Pilot"],
  ];
  s.getRange(`A4:K${3+rows.length}`).values=rows; header(s,"A4:K4"); body(s,`A5:K${3+rows.length}`); statusValidation(s,`J5:J${3+rows.length}`);
  const widths=[70,60,135,245,265,140,150,150,75,120,110]; widths.forEach((w,i)=>s.getRangeByIndexes(0,i,40,1).format.columnWidthPx=w);
  s.freezePanes.freezeRows(4);
}

// 4. Milestones
{
  const s=wb.worksheets.getItem("Milestones");
  title(s,"MILESTONE & RELEASE GATE","Chỉ chuyển gate khi có bằng chứng; trạng thái không được suy ra từ cảm nhận.","H");
  const rows=[
    ["Gate","Mốc","Dự kiến","Điều kiện đạt","Evidence","Người duyệt","Trạng thái","Quyết định"],
    ["G0","Kickoff","Tuần 1","Sponsor xác nhận mục tiêu và đầu mối","Kickoff minutes","Sponsor/PO","Chưa bắt đầu","—"],
    ["G1","Scope & Governance","Cuối tuần 2","Scope, pilot cohort, Clinical Owner, KPI và RACI được chốt","Signed scope pack","Sponsor/PO + Clinical Owner","Chưa bắt đầu","—"],
    ["G2","Core Stabilized","Cuối tuần 6","Không còn Urgent/High blocker; regression pass","QA report + Jira evidence","Tech Lead + QA Lead","Đang thực hiện","—"],
    ["G3","Standalone E2E","Cuối tuần 10","Bác sĩ tạo và hoàn thiện hồ sơ khi không có HIS","Demo + UAT notes + audit evidence","PO + Clinical Owner","Chưa bắt đầu","—"],
    ["G4","Context Hub Ready","Cuối tuần 14","M1/M2/HIS data contract, provenance và fallback pass","Contract test report","Tech Lead","Chưa bắt đầu","—"],
    ["G5","Clinical AI Accepted","Cuối tuần 16","AI đạt ngưỡng safety/quality đã phê duyệt","Clinical evaluation report","Clinical Owner","Chưa bắt đầu","—"],
    ["G6","Pilot Go/No-Go","Cuối tuần 22","Security, performance, UAT, SOP, support, rollback đều đạt","Go-NoGo checklist","Steering Committee","Chưa bắt đầu","—"],
    ["G7","Pilot Review","Cuối tuần 26","KPI, incident và feedback được tổng hợp","Pilot report","Steering Committee","Chưa bắt đầu","—"],
  ];
  s.getRange(`A4:H${3+rows.length}`).values=rows; header(s,"A4:H4"); body(s,`A5:H${3+rows.length}`); statusValidation(s,`G5:G${3+rows.length}`);
  [65,190,105,310,230,170,120,120].forEach((w,i)=>s.getRangeByIndexes(0,i,30,1).format.columnWidthPx=w); s.freezePanes.freezeRows(4);
}

// 5. Dependencies
{
  const s=wb.worksheets.getItem("Dependencies");
  title(s,"DEPENDENCY REGISTER","Tập trung vào phụ thuộc có thể làm thay đổi phạm vi, timeline hoặc release decision.","I");
  const rows=[
    ["ID","Phụ thuộc","Loại","Provider/Owner","Cần trước","Trạng thái","Nếu chậm/thiếu","Phương án xử lý","Mốc rà soát"],
    ["D-01","Clinical Owner và thời gian bác sĩ tham gia","Tổ chức","Bệnh viện","G1","Cần xác nhận","Không chốt được tiêu chí an toàn/UAT","Escalate sponsor; chốt lịch review cố định","Tuần 1"],
    ["D-02","Mẫu bệnh án và quy trình pilot","Nghiệp vụ","Bệnh viện","G1","Cần xác nhận","Scope trôi; khó đánh giá đúng/sai","Chọn 1 khoa và 1 mẫu ưu tiên","Tuần 1"],
    ["D-03","Data contract Module 1–2","Nội bộ","Teams M1/M2","G4","Cần xác nhận","Thiếu context hoặc mapping sai","Versioned schema + contract tests","Tuần 6"],
    ["D-04","Tài liệu/API HIS/EMR và môi trường test","Bên ngoài","Bệnh viện/HIS vendor","G4","Cần xác nhận","Trễ integration; dữ liệu không ổn định","Adapter + mock + chế độ standalone","Tuần 4"],
    ["D-05","Bộ ca lâm sàng đã khử định danh","Dữ liệu","Clinical Owner","G5","Cần xác nhận","Không đo được chất lượng AI","Duyệt data protocol và sampling plan","Tuần 3"],
    ["D-06","Hạ tầng on-prem và năng lực model","Kỹ thuật","Infra/Security","G6","Cần xác nhận","Không đạt latency/availability","Benchmark sớm; capacity plan; fallback","Tuần 4"],
    ["D-07","Chính sách bảo mật, retention, audit","Tuân thủ","Security/DPO","G6","Cần xác nhận","Không đủ điều kiện pilot","Security review từ P0","Tuần 2"],
    ["D-08","Nguồn lực FE/BE/AI/QA/Integration","Nguồn lực","Delivery Lead","Sau G1","Cần xác nhận","Timeline giả định không khả thi","Team estimation và capacity plan","Tuần 2"],
  ];
  s.getRange(`A4:I${3+rows.length}`).values=rows; header(s,"A4:I4"); body(s,`A5:I${3+rows.length}`); statusValidation(s,`F5:F${3+rows.length}`);
  [65,250,100,150,85,120,240,260,95].forEach((w,i)=>s.getRangeByIndexes(0,i,30,1).format.columnWidthPx=w); s.freezePanes.freezeRows(4);
}

// 6. RACI
{
  const s=wb.worksheets.getItem("RACI");
  title(s,"RACI — VAI TRÒ VÀ QUYỀN QUYẾT ĐỊNH","A = Accountable, R = Responsible, C = Consulted, I = Informed. Mỗi đầu ra có đúng một A.","J");
  const rows=[
    ["Đầu ra/Quyết định","Sponsor/PO","Clinical Owner","Delivery Lead","Tech Lead","AI Lead","QA Lead","Security Lead","Hospital/HIS","Ghi chú"],
    ["Duyệt scope pilot","A","C","R","C","I","I","I","C","PO chịu trách nhiệm cuối"],
    ["Duyệt tiêu chí an toàn lâm sàng","I","A","C","C","R","C","C","C","Clinical Owner có quyền dừng pilot"],
    ["Chốt kiến trúc standalone/integrated","I","C","C","A","R","C","C","C","ADR bắt buộc"],
    ["Ưu tiên và đóng bug blocker","I","C","R","A","R","R","C","I","Không waive Urgent nếu thiếu clinical sign-off"],
    ["Duyệt bộ dữ liệu/evaluation AI","I","A","C","C","R","R","C","C","Có provenance và khử định danh"],
    ["Duyệt security & privacy","I","C","R","C","C","C","A","C","Evidence trước G6"],
    ["Duyệt UAT","A","R","C","C","C","R","I","R","Biên bản UAT"],
    ["Quyết định Go/No-Go pilot","A","C","R","C","C","C","C","C","Dựa trên checklist và evidence"],
    ["Incident response trong pilot","I","C","A","R","R","R","R","R","Runbook + escalation path"],
  ];
  s.getRange(`A4:J${3+rows.length}`).values=rows; header(s,"A4:J4"); body(s,`A5:J${3+rows.length}`);
  s.getRange(`B5:I${3+rows.length}`).format.horizontalAlignment="center";
  [250,95,110,105,95,85,85,100,110,240].forEach((w,i)=>s.getRangeByIndexes(0,i,30,1).format.columnWidthPx=w); s.freezePanes.freezeRows(4);
}

// 7. Issues
{
  const s=wb.worksheets.getItem("Issues");
  title(s,"CURRENT ISSUE REGISTER","Vấn đề đã quan sát trong Jira snapshot 10/10/2026; tách biệt với rủi ro tương lai.","I");
  const rows=[
    ["Ticket/Nhóm","Mức độ","Vấn đề","Ảnh hưởng","Trạng thái","Hành động kế tiếp","Owner","Block gate","Nguồn"],
    ["MV-406","Urgent","AI xử lý không an toàn nội dung thuốc/liều","Rủi ro an toàn lâm sàng","Mở","Root-cause, guardrail, clinical regression","Cần chỉ định","G2/G5","Jira"],
    ["MV-407","Urgent","AI dùng dữ liệu server cũ thay vì dữ liệu hiện tại trên form","Gợi ý sai theo ngữ cảnh cũ","Mở","Chốt source precedence; test stale data","Cần chỉ định","G2/G4","Jira"],
    ["MV-408/409/410/417/420","High","Sai field, chuẩn hóa thuốc sai, lỗi multi-turn/context và ghi form không đúng","Mất tin cậy và sai dữ liệu lâm sàng","Mở","Triage từng lỗi; regression theo use case","Cần chỉ định","G2/G5","Jira"],
    ["MV-413","Medium","Tự lưu/ghi đè khi mở hội thoại mới mà chưa Save","Mất hoặc thay đổi dữ liệu ngoài ý muốn","Mở","Bắt buộc explicit review/save; audit","Cần chỉ định","G2","Jira"],
    ["MV-412","Medium","Thời gian phản hồi chậm","Gián đoạn luồng bác sĩ","Mở","Đo baseline; đặt SLO; profiling","Cần chỉ định","G6","Jira"],
    ["MV-403","Medium","AI hallucination","Thông tin không có căn cứ","Mở","Provenance, evaluation, abstention policy","Cần chỉ định","G5","Jira"],
    ["MV-391","Medium","Lộ system prompt","Rủi ro bảo mật và hành vi ngoài ý muốn","Mở","Hardening prompt/tool boundary; security test","Cần chỉ định","G6","Jira"],
    ["MV-432","Medium","Tạo hội thoại mới lỗi 404","Không tiếp tục được workflow","Mở","Sửa route/state và regression","Cần chỉ định","G2","Jira"],
    ["Các bug Medium khác","Medium","Tổng cộng 14 bug Medium đang mở trong snapshot","Tăng rủi ro pilot","Mở","Triage theo clinical impact và tần suất","Cần chỉ định","G2/G6","Jira"],
  ];
  s.getRange(`A4:I${3+rows.length}`).values=rows; header(s,"A4:I4"); body(s,`A5:I${3+rows.length}`);
  s.getRange("B5:B6").format={fill:C.red,font:{color:C.redText,bold:true},horizontalAlignment:"center"};
  s.getRange("B7").format={fill:"#F4CCCC",font:{color:C.redText,bold:true},horizontalAlignment:"center"};
  [150,80,300,250,85,260,115,90,80].forEach((w,i)=>s.getRangeByIndexes(0,i,30,1).format.columnWidthPx=w); s.freezePanes.freezeRows(4);
}

// 8. Risks
{
  const s=wb.worksheets.getItem("Risk Register");
  title(s,"RISK REGISTER","Probability/Impact chưa có workshop định lượng nên để “Cần đánh giá”; không dùng điểm số giả định.","K");
  const rows=[
    ["ID","Rủi ro tương lai","Category","Probability","Impact","Dấu hiệu cảnh báo","Mitigation","Contingency","Owner","Review","Trạng thái"],
    ["R-01","Scope mở rộng sang nhiều loại bệnh án trước khi lõi ổn định","Product","Cần đánh giá","Cần đánh giá","Backlog tăng nhanh, gate trễ","Giới hạn 1 mẫu pilot; change control","Dời mẫu mở rộng khỏi critical path","PO","Hàng tuần","Mở"],
    ["R-02","Thiếu thời gian Clinical Owner để review","Organization","Cần đánh giá","Cần đánh giá","Review/evaluation bị hoãn","Chốt cadence và delegate","Escalate sponsor; giảm phạm vi pilot","Sponsor/PO","Hàng tuần","Mở"],
    ["R-03","Không rõ source of truth giữa form hiện tại, HIS và AI context","Data","Cần đánh giá","Cần đánh giá","Dữ liệu xung đột/stale","Data precedence + provenance + contract tests","Chạy standalone; chặn ghi tự động","Tech Lead","Mỗi gate","Mở"],
    ["R-04","Data contract M1/M2 thay đổi không tương thích","Dependency","Cần đánh giá","Cần đánh giá","Mapping lỗi hoặc missing field","Versioning + schema registry + contract tests","Fallback sang nhập tay/context tối thiểu","Integration Lead","Hai tuần","Mở"],
    ["R-05","HIS vendor hoặc môi trường test đến muộn","External","Cần đánh giá","Cần đánh giá","Không có API/sample data","Mock adapter và standalone-first","Pilot không tích hợp HIS ở giai đoạn đầu","PO/Integration","Hai tuần","Mở"],
    ["R-06","On-prem không đáp ứng latency/capacity","Technical","Cần đánh giá","Cần đánh giá","P95 tăng, timeout, queue dài","Benchmark sớm; capacity plan","Degrade gracefully; queue/manual fallback","Platform Lead","Mỗi gate","Mở"],
    ["R-07","Bác sĩ không tin hoặc không sử dụng bản nháp AI","Adoption","Cần đánh giá","Cần đánh giá","Tỷ lệ dùng/accept thấp","Co-design; explain source; đo edit distance","Thu hẹp use case có giá trị rõ","PO/UX","Trong pilot","Mở"],
    ["R-08","Thiếu audit/privacy/retention phù hợp bệnh viện","Compliance","Cần đánh giá","Cần đánh giá","Security review có finding lớn","Privacy by design; audit event catalog","No-Go cho pilot đến khi đóng finding","Security Lead","Mỗi gate","Mở"],
    ["R-09","Timeline giả định không phù hợp capacity thực tế","Delivery","Cần đánh giá","Cần đánh giá","Estimate lệch, WIP cao","Team estimate sau G1; capacity-based plan","Rebaseline scope/timeline","Delivery Lead","Sau G1","Mở"],
  ];
  s.getRange(`A4:K${3+rows.length}`).values=rows; header(s,"A4:K4"); body(s,`A5:K${3+rows.length}`);
  [65,260,105,105,105,220,250,250,130,90,80].forEach((w,i)=>s.getRangeByIndexes(0,i,30,1).format.columnWidthPx=w); s.freezePanes.freezeRows(4);
}

// 9. Go-NoGo
{
  const s=wb.worksheets.getItem("Go-NoGo");
  title(s,"PILOT GO / NO-GO CHECKLIST","Chỉ đánh dấu Đạt khi có evidence và người duyệt xác nhận; mọi tiêu chí bắt buộc phải Đạt trước Go.","H");
  const rows=[
    ["Nhóm","Tiêu chí bắt buộc","Evidence yêu cầu","Owner","Reviewer","Trạng thái","Quyết định nếu chưa đạt","Gate"],
    ["Clinical Safety","Không còn lỗi Urgent/High ảnh hưởng quyết định lâm sàng","Jira + clinical regression report","Tech/AI Lead","Clinical Owner","Chưa đạt","No-Go","G2/G5"],
    ["Human Review","AI chỉ tạo nháp; bác sĩ review/xác nhận trước khi ghi","E2E test + audit events","Product/Tech","Clinical Owner","Cần xác nhận","No-Go","G5"],
    ["Data Integrity","Không ghi đè/ghi ngầm; source precedence rõ ràng","Regression + provenance evidence","Tech Lead","QA Lead","Chưa đạt","No-Go","G2/G4"],
    ["Standalone","Luồng bác sĩ hoàn tất khi HIS gián đoạn/không tích hợp","UAT scenario + demo","Platform Lead","PO","Cần xác nhận","No-Go","G3"],
    ["Integration","M1/M2/HIS contract, retry, reconciliation và fallback đạt","Contract/integration test report","Integration Lead","Tech Lead","Cần xác nhận","Pilot standalone nếu được duyệt","G4"],
    ["AI Quality","Bộ ca evaluation đạt ngưỡng đã phê duyệt","Clinical evaluation report","AI Lead","Clinical Owner","Cần xác nhận","No-Go","G5"],
    ["Security/Privacy","RBAC, audit, privacy, retention và prompt security đạt","Security assessment","Security Lead","DPO/Security Owner","Cần xác nhận","No-Go","G6"],
    ["Performance","SLO và load test đạt trên hạ tầng pilot","Performance report","Platform Lead","Tech Lead","Cần xác nhận","No-Go hoặc giảm scope","G6"],
    ["Operations","SOP, monitoring, incident response, support roster, rollback sẵn sàng","Runbook + drill evidence","Delivery/Ops","Sponsor/PO","Cần xác nhận","No-Go","G6"],
    ["UAT & Training","Bác sĩ/người dùng pilot ký UAT và hoàn tất training","UAT sign-off + attendance","QA/Ops","PO/Clinical Owner","Cần xác nhận","No-Go","G6"],
  ];
  s.getRange(`A4:H${3+rows.length}`).values=rows; header(s,"A4:H4"); body(s,`A5:H${3+rows.length}`);
  s.getRange(`F5:F${3+rows.length}`).dataValidation={rule:{type:"list",values:["Chưa đạt","Cần xác nhận","Đạt","Không áp dụng"]}};
  [130,310,270,130,140,110,180,75].forEach((w,i)=>s.getRangeByIndexes(0,i,30,1).format.columnWidthPx=w); s.freezePanes.freezeRows(4);
}

// 10. Actions
{
  const s=wb.worksheets.getItem("Actions");
  title(s,"ACTION & DECISION LOG","Danh sách hành động mở để biến planning hypothesis thành baseline đã cam kết.","I");
  const rows=[
    ["ID","Hành động/Quyết định","Loại","Owner vai trò","Hạn tương đối","Phụ thuộc","Evidence đầu ra","Trạng thái","Ghi chú"],
    ["A-01","Chỉ định Clinical Owner và nhóm review","Decision","Sponsor/PO","Tuần 1","—","Tên vai trò và lịch review","Chưa bắt đầu","Block G1"],
    ["A-02","Chọn khoa, mẫu bệnh án và cohort pilot","Decision","PO + Clinical Owner","Tuần 1","A-01","Scope pilot được duyệt","Chưa bắt đầu","Bắt đầu hẹp"],
    ["A-03","Workshop source of truth và data precedence","Workshop","PO + Tech Lead","Tuần 2","A-02","ADR + mapping decision","Chưa bắt đầu","Bao gồm form hiện tại/HIS/M1/M2"],
    ["A-04","Team estimate backlog và capacity plan","Planning","Delivery Lead","Sau G1","A-02, A-03","Estimate + staffing + baseline","Chưa bắt đầu","Thay timeline giả định"],
    ["A-05","Triage toàn bộ 21 bug theo clinical impact","Execution","Tech/QA/Clinical","Tuần 1","A-01","Bug priority và owner","Chưa bắt đầu","Ưu tiên MV-406/407"],
    ["A-06","Định nghĩa bộ ca và ngưỡng đánh giá AI","Decision","Clinical Owner + AI Lead","Tuần 3","A-01, A-02","Evaluation protocol","Chưa bắt đầu","Không tự đặt ngưỡng"],
    ["A-07","Chốt data contract với Module 1–2","Workshop","Integration Lead","Tuần 6","A-03","Versioned schema + tests","Chưa bắt đầu","Có backward compatibility"],
    ["A-08","Làm việc với HIS vendor về API/môi trường test","External","PO/Integration","Tuần 4","A-02","Access plan + sample payload","Chưa bắt đầu","Standalone không phụ thuộc kết quả"],
    ["A-09","Chốt Go/No-Go criteria và approver","Decision","Steering Committee","Trước G5","A-06","Signed checklist","Chưa bắt đầu","Không thay tiêu chí sát ngày pilot"],
    ["A-10","Thiết lập cadence báo cáo và change control","Governance","Delivery Lead","Tuần 1","—","Weekly report template + log","Chưa bắt đầu","Update Issues/Risks/Decisions"],
  ];
  s.getRange(`A4:I${3+rows.length}`).values=rows; header(s,"A4:I4"); body(s,`A5:I${3+rows.length}`); statusValidation(s,`H5:H${3+rows.length}`);
  [65,280,95,155,100,135,240,120,220].forEach((w,i)=>s.getRangeByIndexes(0,i,30,1).format.columnWidthPx=w); s.freezePanes.freezeRows(4);
}

// Common formatting and QA
for (const n of names) {
  const s=wb.worksheets.getItem(n);
  const used=s.getUsedRange();
  if (used) used.format.autofitRows();
  s.tabColor = n === "Tổng quan" ? C.navy : C.blue;
}

await wb.recalculate();
await fs.mkdir(outDir,{recursive:true});
await fs.mkdir(previewDir,{recursive:true});

const formulaErrors = await wb.inspect({kind:"match",searchTerm:"#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",options:{useRegex:true,maxResults:100},summary:"formula error scan"});
console.log(formulaErrors.ndjson);
const summaryInspect = await wb.inspect({kind:"region",sheetId:"Tổng quan",range:"A1:H21",maxChars:5000});
console.log(summaryInspect.ndjson);

for (const n of names) {
  const p=await wb.render({sheetName:n,autoCrop:"all",scale:0.75,format:"png"});
  await fs.writeFile(`${previewDir}/${n.replaceAll(" ","_").normalize("NFD").replace(/[\u0300-\u036f]/g,"")}.png`,new Uint8Array(await p.arrayBuffer()));
}

const xlsx=await SpreadsheetFile.exportXlsx(wb);
await xlsx.save(outFile);
console.log(JSON.stringify({outFile,previewDir,sheets:names},null,2));
