import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = "/Users/admin/Work/trivita/medvita-prototype/output";
const outputFile = `${outputDir}/MedVita_Module_3_Master_Plan.xlsx`;
const previewDir = "/private/tmp/medvita-module3-master-plan-clean";

const wb = Workbook.create();
const sheetNames = [
  "Tổng quan", "Project Charter", "Roadmap", "Master Plan", "Features", "Sprint Plan", "Milestones",
  "RACI", "Dependencies", "Risk Register", "KPI", "Go-NoGo", "Action Plan"
];
sheetNames.forEach((name) => wb.worksheets.add(name));

const c = {
  navy: "#17365D", blue: "#1F4E78", teal: "#0F6B78", paleBlue: "#DCE6F1",
  paleTeal: "#DDEBF7", gray: "#E7E6E6", light: "#F6F8FA", border: "#C8D2DC",
  text: "#243447", muted: "#66788A", white: "#FFFFFF", amber: "#FFF2CC",
  amberText: "#7F6000", green: "#E2F0D9", greenText: "#375623", red: "#FCE4D6",
  redText: "#9C0006"
};

function setup(sheet, title, note, lastCol) {
  sheet.showGridLines = false;
  sheet.getRange(`A2:${lastCol}2`).merge();
  sheet.getRange("A2").values = [[title]];
  sheet.getRange(`A2:${lastCol}2`).format = {
    font: { name: "Arial", size: 15, bold: true, color: c.navy },
    verticalAlignment: "center", rowHeight: 26
  };
  sheet.getRange(`A3:${lastCol}3`).merge();
  sheet.getRange("A3").values = [[note]];
  sheet.getRange(`A3:${lastCol}3`).format = {
    font: { name: "Arial", size: 10, italic: true, color: c.muted },
    verticalAlignment: "center", wrapText: true, rowHeight: 28,
    borders: { bottom: { style: "thin", color: c.border } }
  };
}

function tableHeader(sheet, range) {
  sheet.getRange(range).format = {
    fill: c.blue, font: { name: "Arial", size: 10, bold: true, color: c.white },
    horizontalAlignment: "center", verticalAlignment: "center", wrapText: true,
    borders: { insideVertical: { style: "thin", color: c.white }, bottom: { style: "medium", color: c.navy } }
  };
}

function tableBody(sheet, range) {
  sheet.getRange(range).format = {
    font: { name: "Arial", size: 10, color: c.text }, verticalAlignment: "top",
    wrapText: true, borders: { bottom: { style: "thin", color: c.border } }
  };
}

function section(sheet, row, text, lastCol) {
  sheet.getRange(`A${row}:${lastCol}${row}`).merge();
  sheet.getRange(`A${row}`).values = [[text]];
  sheet.getRange(`A${row}:${lastCol}${row}`).format = {
    fill: c.paleBlue, font: { name: "Arial", size: 11, bold: true, color: c.navy },
    verticalAlignment: "center", rowHeight: 23, borders: { bottom: { style: "thin", color: c.border } }
  };
}

function widths(sheet, values) {
  values.forEach((width, index) => sheet.getRangeByIndexes(0, index, 100, 1).format.columnWidthPx = width);
}

function statusValidation(sheet, range, values) {
  sheet.getRange(range).dataValidation = { rule: { type: "list", values } };
}

// Tổng quan
{
  const s = wb.worksheets.getItem("Tổng quan");
  setup(s, "MedVita Module 3 — Master Plan", "Bản dự thảo phát triển sản phẩm. Timeline theo tuần là giả định để team estimate và phê duyệt.", "H");

  s.getRange("A5:B11").values = [
    ["Nội dung", "Mô tả"],
    ["Mục tiêu", "Hỗ trợ bác sĩ lập và hoàn thiện bệnh án điện tử nhanh hơn. AI tạo bản nháp; bác sĩ kiểm tra, chỉnh sửa và xác nhận."],
    ["Định hướng", "Module 3 phải vận hành độc lập khi chưa kết nối HIS/EMR. Dữ liệu từ HIS/EMR và Module 1–2 là nguồn bổ sung khi sẵn sàng."],
    ["Người dùng chính", "Bác sĩ và nhân viên y tế được phân quyền tham gia lập, rà soát hoặc hoàn thiện hồ sơ."],
    ["Phạm vi phát hành đầu", "Một luồng bệnh án ưu tiên, chạy độc lập, có AI hỗ trợ soạn thảo, review, versioning, audit và cơ chế tích hợp có kiểm soát."],
    ["Trạng thái tài liệu", "Dự thảo. Cần Product, Clinical, Engineering và phía bệnh viện cùng estimate và phê duyệt."],
    ["Nguồn lập kế hoạch", "Mục tiêu Module 3 đã được thống nhất và tài liệu Product Discovery Module 3."],
  ];
  tableHeader(s, "A5:B5"); tableBody(s, "A6:B11");

  s.getRange("D5:H10").values = [
    ["Chỉ số kế hoạch", "Giá trị", "Đơn vị", "Trạng thái", "Ý nghĩa"],
    ["Số feature", 25, "feature", "Đề xuất", "Capability có thể bàn giao và kiểm thử độc lập"],
    ["Số sprint", 15, "sprint", "Dự kiến", "Sprint hai tuần, chưa phải cam kết"],
    ["Khoảng thời gian", 30, "tuần", "Dự kiến", "Planning hypothesis, chưa phải cam kết"],
    ["Tiêu chí Go/No-Go", 11, "tiêu chí", "Cần chốt", "Mỗi tiêu chí cần evidence và người duyệt"],
    ["Tiêu chí đã đạt", null, "tiêu chí", "Tự động", "Cập nhật theo sheet Go-NoGo"],
  ];
  s.getRange("E10").formulas = [["=COUNTIF('Go-NoGo'!F6:F16,\"Đạt\")"]];
  tableHeader(s, "D5:H5"); tableBody(s, "D6:H10");
  s.getRange("E6:E10").format.numberFormat = "#,##0";

  section(s, 13, "Đường găng và quyết định cần chốt", "H");
  s.getRange("A14:H19").values = [
    ["Loại", "Nội dung", "Owner quyết định", "Cần trước", "Ảnh hưởng", "Trạng thái", "Phương án", "Ghi chú"],
    ["Đường găng", "Khởi động → Clinical foundation → Standalone core → AI authoring → Validation → Pilot → Scale decision", "Delivery Lead", "Khi baseline kế hoạch", "Quyết định thời điểm pilot", "Dự kiến", "Team estimate lại sau khi chốt scope", "Integration chạy song song"],
    ["Quyết định", "Chọn khoa, loại bệnh án và nhóm bác sĩ pilot", "Sponsor/PO", "Gate G1", "Xác định phạm vi và bộ dữ liệu", "Cần chốt", "Bắt đầu với một luồng ưu tiên", ""],
    ["Quyết định", "Chỉ định Clinical Owner và hội đồng review", "Sponsor/PO", "Gate G1", "Quyết định tiêu chí an toàn và chất lượng", "Cần chốt", "Phân quyền dừng pilot khi cần", ""],
    ["Quyết định", "Chốt KPI, ngưỡng chất lượng và điều kiện Go/No-Go", "Clinical Owner + PO", "Trước G5", "Không thể nghiệm thu nếu chưa có ngưỡng", "Cần chốt", "Dùng baseline pilot để điều chỉnh", ""],
    ["Quyết định", "Chọn phạm vi tích hợp cho pilot", "PO + Tech Lead", "Trước G4", "Ảnh hưởng dependency với bệnh viện", "Cần chốt", "Pilot standalone nếu integration chưa sẵn sàng", ""],
  ];
  tableHeader(s, "A14:H14"); tableBody(s, "A15:H19");
  s.getRange("A21:H23").merge();
  s.getRange("A21").values = [["Nguyên tắc release: Module 3 chỉ cung cấp bản nháp và hỗ trợ điền thông tin. Bác sĩ phải xem lại và xác nhận trước khi dữ liệu trở thành nội dung chính thức của bệnh án."]];
  s.getRange("A21:H23").format = { fill: c.amber, font: { name: "Arial", size: 11, bold: true, color: c.amberText }, wrapText: true, verticalAlignment: "center", borders: { preset: "outside", style: "thin", color: "#D6B656" } };
  widths(s, [135, 420, 145, 170, 95, 95, 120, 220]);
}

// Project Charter
{
  const s = wb.worksheets.getItem("Project Charter");
  setup(s, "Project Charter", "Xác định mục tiêu, phạm vi và nguyên tắc trước khi team estimate hoặc cam kết timeline.", "H");
  section(s, 5, "Mục tiêu và kết quả mong đợi", "H");
  s.getRange("A6:H10").values = [
    ["Mục tiêu", "Kết quả quan sát được", "Người hưởng lợi", "Cách đo", "Mức mục tiêu", "Owner", "Mốc", "Ghi chú"],
    ["Giảm thời gian lập bệnh án", "Bác sĩ hoàn thành hồ sơ với ít thao tác nhập lại hơn", "Bác sĩ", "Thời gian trung vị hoàn tất một hồ sơ", "Cần chốt", "PO + Clinical Owner", "Pilot", "Đo baseline trước pilot"],
    ["Nâng cao độ đầy đủ và nhất quán", "Bản nháp có đủ section bắt buộc và sử dụng đúng dữ liệu nguồn", "Bác sĩ/Bệnh viện", "Tỷ lệ đầy đủ và lỗi nghiêm trọng", "Cần chốt", "Clinical Owner", "Trước pilot", "Phải có bộ tiêu chí lâm sàng"],
    ["Vận hành độc lập", "Bác sĩ vẫn tạo và hoàn thiện bệnh án khi chưa có HIS/EMR", "Bệnh viện", "Tỷ lệ luồng standalone hoàn tất", "Cần chốt", "Product + Tech Lead", "G3", "Standalone là capability nền tảng"],
    ["Khai thác dữ liệu liên module", "Module 1–2 và HIS/EMR bổ sung context mà không làm gián đoạn luồng chính", "Bác sĩ", "Tỷ lệ giao dịch thành công và lỗi mapping", "Cần chốt", "Integration Lead", "G4", "Có provenance và fallback"],
  ];
  tableHeader(s, "A6:H6"); tableBody(s, "A7:H10");

  section(s, 12, "Phạm vi", "H");
  s.getRange("A13:H21").values = [
    ["Nhóm", "Nội dung", "Lý do", "Đầu ra", "Nghiệm thu", "Owner", "Giai đoạn", "Ghi chú"],
    ["Trong phạm vi", "Clinical workspace để tạo/chọn người bệnh, lượt khám và hồ sơ", "Cho phép chạy độc lập", "Luồng standalone E2E", "Bác sĩ hoàn tất hồ sơ không cần HIS", "Product/BE", "P2", ""],
    ["Trong phạm vi", "AI hỗ trợ tạo bản nháp theo section", "Giảm nhập liệu thủ công", "Draft có nguồn dữ liệu", "Đạt bộ tiêu chí được duyệt", "AI/Clinical", "P4", ""],
    ["Trong phạm vi", "Review, chỉnh sửa, so sánh phiên bản và xác nhận", "Bảo đảm human-in-the-loop", "Luồng review và audit", "Không ghi chính thức khi chưa xác nhận", "FE/BE", "P4", ""],
    ["Trong phạm vi", "Nhận dữ liệu từ Module 1–2 và HIS/EMR khi có", "Tăng chất lượng context", "Adapter và data contract", "Có provenance, retry và fallback", "Integration", "P3", "Có thể pilot standalone"],
    ["Trong phạm vi", "RBAC, audit, bảo mật, hiệu năng và vận hành on-prem", "Điều kiện triển khai bệnh viện", "Security/operations package", "Đạt release gate", "Tech/Security", "P5", ""],
    ["Ngoài phạm vi", "AI tự chẩn đoán, kê đơn hoặc ký bệnh án thay bác sĩ", "Không phù hợp trách nhiệm lâm sàng", "Không phát triển", "Không xuất hiện trong luồng", "Clinical Owner", "Toàn dự án", ""],
    ["Ngoài phạm vi", "Thay thế toàn bộ HIS/EMR", "Module 3 là công cụ hỗ trợ", "Không phát triển", "Không mở rộng ngoài boundary", "PO", "Toàn dự án", ""],
    ["Ngoài phạm vi", "Triển khai mọi loại biểu mẫu và mọi khoa ngay đợt đầu", "Giảm rủi ro và thời gian học", "Backlog sau pilot", "Chỉ mở rộng khi pilot đạt", "PO", "P7", ""],
  ];
  tableHeader(s, "A13:H13"); tableBody(s, "A14:H21");
  widths(s, [130, 300, 220, 210, 250, 130, 100, 190]); s.freezePanes.freezeRows(6);
}

// Roadmap
{
  const s = wb.worksheets.getItem("Roadmap");
  setup(s, "Roadmap phát triển", "Mốc theo tuần là dự kiến. Track standalone nằm trên đường găng; track integration chạy song song và không được làm gián đoạn standalone.", "J");
  const rows = [
    ["Phase", "Giai đoạn", "Dự kiến", "Mục tiêu", "Đầu ra chính", "Điều kiện bắt đầu", "Điều kiện hoàn tất", "Phụ thuộc", "Track", "Trạng thái kế hoạch"],
    ["P0", "Khởi động và discovery", "Tuần 1–3", "Chốt vấn đề, đối tượng pilot và cách đo", "Charter, scope, workflow, KPI draft, governance", "Sponsor xác nhận khởi động", "Gate G1", "—", "Chung", "Dự thảo"],
    ["P1", "Clinical và product foundation", "Tuần 4–7", "Chốt dữ liệu, template, trách nhiệm lâm sàng và kiến trúc", "Clinical rules, data model, UX, architecture decisions", "G1", "Gate G2", "P0", "Chung", "Dự thảo"],
    ["P2", "Standalone core", "Tuần 8–14", "Cho phép bác sĩ lập hồ sơ không phụ thuộc HIS", "Patient/encounter/document workspace, version, audit", "G2", "Gate G3", "P1", "Standalone", "Dự thảo"],
    ["P3", "Context và integration", "Tuần 12–18", "Nhận dữ liệu M1–2/HIS có provenance và fallback", "Context hub, contracts, adapters, reconciliation", "G2; data contract", "Gate G4", "P1; phối hợp bên ngoài", "Integration", "Dự thảo"],
    ["P4", "AI clinical authoring", "Tuần 15–21", "Tạo bản nháp theo section và hỗ trợ review", "Drafting, explain source, compare, approve", "G3; evaluation protocol", "Gate G5", "P2; P3 nếu dùng context tích hợp", "Standalone", "Dự thảo"],
    ["P5", "Validation và hardening", "Tuần 22–25", "Đạt yêu cầu chất lượng, an toàn và vận hành", "Clinical eval, security, performance, UAT, SOP, rollback", "G5", "Gate G6", "P2–P4", "Chung", "Dự thảo"],
    ["P6", "Pilot có kiểm soát", "Tuần 26–29", "Kiểm chứng giá trị và khả năng vận hành tại bệnh viện", "Pilot data, feedback, incident log, KPI report", "G6", "Gate G7", "P5", "Chung", "Dự thảo"],
    ["P7", "Quyết định mở rộng", "Tuần 30", "Quyết định scale, cải tiến hoặc dừng", "Pilot review, roadmap tiếp theo, baseline mới", "G7", "Gate G8", "P6", "Chung", "Dự thảo"],
  ];
  s.getRange(`A5:J${4+rows.length}`).values = rows; tableHeader(s, "A5:J5"); tableBody(s, `A6:J${4+rows.length}`);
  statusValidation(s, `J6:J${4+rows.length}`, ["Dự thảo", "Đã phê duyệt", "Cần điều chỉnh"]);
  widths(s, [60, 190, 95, 250, 290, 190, 180, 180, 100, 130]); s.freezePanes.freezeRows(5);
}

// Master Plan
{
  const s = wb.worksheets.getItem("Master Plan");
  setup(s, "Master Plan — Work Package", "Kế hoạch cấp dự án. Feature backlog và user story được quản lý riêng; sheet này theo dõi đầu ra và phụ thuộc giữa các workstream.", "L");
  const rows = [
    ["ID", "Phase", "Workstream", "Work package", "Đầu ra", "Tiêu chí hoàn tất", "Dự kiến", "Phụ thuộc", "Responsible", "Accountable", "Trạng thái kế hoạch", "Ghi chú"],
    ["WP-01", "P0", "Product/BA", "Chốt scope và workflow pilot", "Scope statement, workflow, glossary", "Clinical và Product duyệt boundary", "Tuần 1–2", "—", "PO/BA", "Sponsor/PO", "Dự thảo", "Chọn một luồng ưu tiên"],
    ["WP-02", "P0", "Governance", "Thiết lập cơ chế quyết định", "RACI, cadence, change control", "Mỗi quyết định có một A", "Tuần 1–3", "WP-01", "Delivery Lead", "Sponsor/PO", "Dự thảo", ""],
    ["WP-03", "P0", "Measurement", "Chốt baseline và KPI", "KPI dictionary, measurement plan", "Định nghĩa, nguồn và owner được duyệt", "Tuần 2–3", "WP-01", "PO/Data", "Sponsor/PO", "Dự thảo", "Mức mục tiêu cần chốt"],
    ["WP-04", "P1", "Clinical", "Định nghĩa nội dung và rule lâm sàng", "Template, mandatory fields, review policy", "Clinical Owner ký duyệt", "Tuần 4–6", "WP-01", "Clinical BA", "Clinical Owner", "Dự thảo", "Không dùng AI để quyết định thay bác sĩ"],
    ["WP-05", "P1", "UX", "Thiết kế luồng làm việc của bác sĩ", "Prototype và usability findings", "Bác sĩ pilot hoàn thành luồng mẫu", "Tuần 4–7", "WP-01, WP-04", "UX/BA", "PO", "Dự thảo", ""],
    ["WP-06", "P1", "Architecture", "Chốt kiến trúc standalone và integrated", "ADR, data model, source precedence", "Tech, Security và Product duyệt", "Tuần 4–7", "WP-01, WP-04", "Tech Lead", "Architecture Owner", "Dự thảo", ""],
    ["WP-07", "P2", "Platform/BE", "Xây clinical workspace độc lập", "Patient, encounter, document services", "E2E standalone tạo và lưu hồ sơ", "Tuần 8–13", "WP-06", "BE Lead", "Tech Lead", "Dự thảo", ""],
    ["WP-08", "P2", "Application/FE", "Xây giao diện nhập, review và version", "Clinical editor, history, draft states", "Bác sĩ review và hoàn tất hồ sơ", "Tuần 9–14", "WP-05, WP-07", "FE Lead", "Tech Lead", "Dự thảo", ""],
    ["WP-09", "P2", "Audit/Security", "Thiết lập RBAC và audit nền tảng", "Roles, permissions, audit events", "Kiểm thử quyền và truy vết đạt", "Tuần 9–14", "WP-06, WP-07", "Security/BE", "Tech Lead", "Dự thảo", ""],
    ["WP-10", "P3", "Integration", "Định nghĩa data contract M1–2/HIS", "Schemas, mapping, version policy", "Contract tests và owner được duyệt", "Tuần 12–14", "WP-06", "Integration Lead", "Tech Lead", "Dự thảo", ""],
    ["WP-11", "P3", "Integration", "Xây context hub và adapters", "Context API, provenance, retry, reconciliation", "Luồng không mất dữ liệu và có fallback", "Tuần 14–18", "WP-10", "Integration/BE", "Tech Lead", "Dự thảo", "Không block standalone"],
    ["WP-12", "P4", "AI", "Tạo bản nháp theo section", "Context assembly, drafting, source references", "Đạt evaluation protocol đã duyệt", "Tuần 15–20", "WP-04, WP-07", "AI Lead", "Clinical Owner", "Dự thảo", ""],
    ["WP-13", "P4", "Application", "Review và xác nhận bản nháp", "Compare, edit, approve, safe write", "Không ghi chính thức trước xác nhận", "Tuần 17–21", "WP-08, WP-12", "FE/BE Leads", "Tech Lead", "Dự thảo", ""],
    ["WP-14", "P5", "QA/Clinical", "Clinical evaluation và regression", "Test suite, evaluation report", "Ngưỡng được duyệt đều đạt", "Tuần 22–24", "WP-12, WP-13", "QA + Clinical", "Clinical Owner", "Dự thảo", ""],
    ["WP-15", "P5", "Security/Platform", "Hardening cho môi trường bệnh viện", "Security, performance, resilience evidence", "Không còn release blocker", "Tuần 22–25", "WP-09, WP-11, WP-13", "Security/Platform", "Tech Lead", "Dự thảo", ""],
    ["WP-16", "P5", "Operations", "Chuẩn bị UAT và vận hành pilot", "UAT, SOP, training, support, rollback", "Các bên ký Go/No-Go", "Tuần 23–25", "WP-14, WP-15", "QA/Ops", "Sponsor/PO", "Dự thảo", ""],
    ["WP-17", "P6", "Pilot", "Vận hành pilot giới hạn", "KPI, feedback, incident log", "Hoàn tất thời gian pilot đã duyệt", "Tuần 26–29", "WP-16", "Hospital Ops + PO", "Sponsor/PO", "Dự thảo", ""],
    ["WP-18", "P7", "Product/Governance", "Đánh giá và quyết định mở rộng", "Pilot report và roadmap kế tiếp", "Steering Committee ra quyết định", "Tuần 30", "WP-17", "PO/Delivery", "Sponsor/PO", "Dự thảo", ""],
  ];
  s.getRange(`A5:L${4+rows.length}`).values = rows; tableHeader(s, "A5:L5"); tableBody(s, `A6:L${4+rows.length}`);
  statusValidation(s, `K6:K${4+rows.length}`, ["Dự thảo", "Đã phê duyệt", "Cần điều chỉnh"]);
  widths(s, [70, 55, 120, 250, 260, 260, 95, 150, 130, 135, 125, 190]); s.freezePanes.freezeRows(5); s.freezePanes.freezeColumns(2);
}

// Milestones
// Features
{
  const s = wb.worksheets.getItem("Features");
  setup(s, "Danh sách feature Module 3", "Bảng phân rã nội bộ. Ưu tiên và sprint là đề xuất lập kế hoạch, cần Product, Clinical và Engineering xác nhận.", "M");
  const rows = [
    ["Feature ID", "Nhóm", "Tên feature", "Mô tả", "Giá trị", "Người dùng", "Nguồn dữ liệu", "Ưu tiên", "Nguồn yêu cầu", "Mức độ rõ", "Phụ thuộc", "Số lần xếp sprint", "Ghi chú cần chốt"],
    ["F3-001", "Clinical Workspace", "Quản lý người bệnh và lượt khám độc lập", "Tạo hoặc chọn người bệnh và encounter trong Module 3 khi chưa kết nối HIS/EMR.", "Cho phép vận hành độc lập", "Bác sĩ/Nhân viên y tế", "Nhập trực tiếp", "Must", "Mục tiêu sản phẩm", "Cần chốt", "—", null, "Quy tắc định danh và chống trùng"],
    ["F3-002", "Clinical Workspace", "Tạo và chọn hồ sơ bệnh án", "Tạo hồ sơ mới, mở hồ sơ đang làm và liên kết hồ sơ với đúng encounter.", "Bảo đảm đúng ngữ cảnh hồ sơ", "Bác sĩ", "Module 3", "Must", "Product Discovery", "Cần chốt", "F3-001", null, "Loại hồ sơ đầu tiên"],
    ["F3-003", "Clinical Workspace", "Biểu mẫu bệnh án có cấu hình", "Hiển thị section, field bắt buộc và rule theo mẫu được bệnh viện phê duyệt.", "Dùng chung nền tảng cho nhiều mẫu", "Bác sĩ/Quản trị", "Cấu hình hệ thống", "Must", "Product Discovery", "Cần chốt", "F3-002", null, "Mẫu pilot và quyền cấu hình"],
    ["F3-004", "Clinical Workspace", "Lưu nháp và khôi phục phiên làm việc", "Giữ nội dung đang làm, khôi phục khi gián đoạn và không ghi đè ngoài ý muốn.", "Giảm mất dữ liệu", "Bác sĩ", "Module 3", "Must", "Product Discovery", "Cần chốt", "F3-002", null, "Chính sách autosave và conflict"],
    ["F3-005", "Clinical Context", "Nhận dữ liệu Module 1", "Nhận thông tin trước khám và bản tóm tắt đã được phép sử dụng cho encounter hiện tại.", "Giảm nhập lại thông tin", "Bác sĩ", "Module 1", "Should", "Mục tiêu sản phẩm", "Cần chốt", "F3-008", null, "Data contract và trạng thái summary"],
    ["F3-006", "Clinical Context", "Nhận dữ liệu Module 2", "Nhận transcript, ghi chú hoặc bản tóm tắt buổi khám theo phạm vi được duyệt.", "Bổ sung ngữ cảnh buổi khám", "Bác sĩ", "Module 2", "Should", "Mục tiêu sản phẩm", "Cần chốt", "F3-008", null, "Loại dữ liệu nào được dùng làm context"],
    ["F3-007", "Clinical Context", "Nhận dữ liệu HIS/EMR", "Đọc dữ liệu người bệnh, encounter và hồ sơ liên quan từ hệ thống bệnh viện khi tích hợp sẵn sàng.", "Tận dụng dữ liệu hiện có", "Bác sĩ", "HIS/EMR", "Should", "Mục tiêu sản phẩm", "Cần chốt", "F3-008", null, "API, mapping và môi trường test"],
    ["F3-008", "Clinical Context", "Chọn clinical context cho hồ sơ", "Cho phép chọn dữ liệu nào được dùng cho lần tạo bản nháp hiện tại.", "Tránh dùng dữ liệu không phù hợp", "Bác sĩ", "Module 3/M1/M2/HIS", "Must", "Healthcare BA", "Cần chốt", "F3-001", null, "Quyền chọn và context mặc định"],
    ["F3-009", "Clinical Context", "Hiển thị nguồn và xử lý xung đột dữ liệu", "Ghi nhận provenance, ưu tiên nguồn và cảnh báo khi dữ liệu không đồng nhất.", "Tăng khả năng kiểm tra", "Bác sĩ", "Mọi nguồn", "Must", "Product Discovery", "Cần chốt", "F3-008", null, "Source precedence do ai duyệt"],
    ["F3-010", "AI Authoring", "Tạo bản nháp theo section", "AI tạo nội dung cho từng section dựa trên context đã chọn và template hiện tại.", "Giảm thời gian soạn thảo", "Bác sĩ", "Clinical context", "Must", "Mục tiêu sản phẩm", "Cần chốt", "F3-003, F3-008", null, "Section nào được AI hỗ trợ"],
    ["F3-011", "AI Authoring", "Bổ sung và viết lại nội dung theo yêu cầu", "Bác sĩ yêu cầu AI bổ sung, rút gọn hoặc viết lại một phần bản nháp.", "Hỗ trợ chỉnh sửa nhanh", "Bác sĩ", "Bản nháp hiện tại", "Should", "Product Discovery", "Cần chốt", "F3-010", null, "Giới hạn loại lệnh"],
    ["F3-012", "AI Authoring", "Phát hiện thông tin thiếu hoặc mâu thuẫn", "Đánh dấu dữ liệu còn thiếu hoặc không nhất quán để bác sĩ xem lại.", "Giảm bỏ sót", "Bác sĩ", "Clinical context", "Must", "Product Discovery", "Cần chốt", "F3-009, F3-010", null, "Taxonomy và rule chuyên môn"],
    ["F3-013", "AI Authoring", "Giải thích nguồn của nội dung AI", "Cho biết dữ liệu hoặc tài liệu nào đã được dùng để tạo phần nội dung tương ứng.", "Tăng khả năng truy vết", "Bác sĩ", "Clinical context", "Must", "Healthcare BA", "Cần chốt", "F3-009, F3-010", null, "Mức chi tiết provenance"],
    ["F3-014", "AI Authoring", "Từ chối an toàn và chuyển sang nhập tay", "Không tạo nội dung khi thiếu context, ngoài phạm vi hoặc không đủ điều kiện; giữ luồng nhập tay.", "Giảm rủi ro lâm sàng", "Bác sĩ", "Clinical context", "Must", "Healthcare BA", "Cần chốt", "F3-010", null, "Điều kiện abstention"],
    ["F3-015", "Review & Finalize", "So sánh bản nháp với nội dung hiện tại", "Hiển thị phần được thêm, sửa hoặc xóa trước khi bác sĩ áp dụng.", "Giúp review nhanh và có kiểm soát", "Bác sĩ", "Bản nháp/phiên bản", "Must", "Product Discovery", "Cần chốt", "F3-010", null, "Cách hiển thị thay đổi"],
    ["F3-016", "Review & Finalize", "Chỉnh sửa và review bản nháp", "Bác sĩ chỉnh sửa nội dung AI và xác nhận từng phần hoặc toàn bộ hồ sơ.", "Giữ trách nhiệm của bác sĩ", "Bác sĩ", "Bản nháp", "Must", "Mục tiêu sản phẩm", "Cần chốt", "F3-015", null, "Review theo section hay toàn hồ sơ"],
    ["F3-017", "Review & Finalize", "Lịch sử phiên bản và khôi phục", "Lưu các phiên bản, người thay đổi và cho phép khôi phục phiên bản phù hợp.", "Tránh mất lịch sử chỉnh sửa", "Bác sĩ/Quản trị", "Module 3", "Must", "Product Discovery", "Cần chốt", "F3-004, F3-016", null, "Retention và quyền restore"],
    ["F3-018", "Review & Finalize", "Xác nhận hồ sơ chính thức", "Chuyển hồ sơ từ Draft sang trạng thái được chấp nhận theo quy trình bệnh viện.", "Ngăn AI tự ghi hồ sơ", "Bác sĩ", "Module 3", "Must", "Mục tiêu sản phẩm", "Cần chốt", "F3-016, F3-017", null, "Trạng thái và thẩm quyền xác nhận"],
    ["F3-019", "Review & Finalize", "Ghi hoặc xuất hồ sơ có kiểm soát", "Ghi sang HIS/EMR hoặc xuất theo định dạng được duyệt sau khi bác sĩ xác nhận.", "Hoàn tất luồng dữ liệu", "Bác sĩ/Hệ thống", "Module 3/HIS", "Should", "Product Discovery", "Cần chốt", "F3-018, F3-007", null, "Safe write, retry và reconciliation"],
    ["F3-020", "Security & Governance", "Phân quyền theo vai trò và phạm vi chăm sóc", "Kiểm soát quyền xem, tạo, sửa, xác nhận và xuất hồ sơ.", "Bảo vệ dữ liệu và trách nhiệm", "Bác sĩ/Quản trị", "Identity/RBAC", "Must", "Healthcare BA", "Cần chốt", "F3-001", null, "Role matrix và hospital context"],
    ["F3-021", "Security & Governance", "Audit toàn bộ vòng đời hồ sơ", "Ghi nhận truy cập, tạo, sửa, AI generation, review, xác nhận và xuất dữ liệu.", "Đáp ứng truy vết", "Quản trị/An toàn", "Audit log", "Must", "Healthcare BA", "Cần chốt", "F3-002, F3-020", null, "Audit event catalog"],
    ["F3-022", "Security & Governance", "Bảo vệ dữ liệu và cấu hình lưu trữ", "Áp dụng chính sách privacy, retention, masking và xử lý dữ liệu trên môi trường bệnh viện.", "Giảm rủi ro dữ liệu", "Quản trị/Security", "On-prem/Storage", "Must", "Healthcare BA", "Cần chốt", "F3-020, F3-021", null, "Policy và phê duyệt DPO/Security"],
    ["F3-023", "Operations", "Theo dõi vận hành và cảnh báo", "Theo dõi lỗi, độ trễ, giao dịch tích hợp và tình trạng dịch vụ mà không log dữ liệu ngoài phạm vi.", "Phát hiện sự cố sớm", "Vận hành", "Telemetry", "Must", "Product Discovery", "Cần chốt", "F3-021", null, "SLO và dữ liệu được phép log"],
    ["F3-024", "Operations", "Duy trì luồng khi AI hoặc hệ thống ngoài gián đoạn", "Timeout, retry, fallback và chế độ nhập tay giúp bác sĩ tiếp tục công việc.", "Bảo đảm liên tục vận hành", "Bác sĩ/Vận hành", "AI/HIS/M1/M2", "Must", "Mục tiêu sản phẩm", "Cần chốt", "F3-004, F3-023", null, "Fallback theo từng dependency"],
    ["F3-025", "Operations", "Quản lý cấu hình template và phiên bản", "Quản lý phiên bản biểu mẫu, rule và cấu hình triển khai theo bệnh viện/khoa.", "Hỗ trợ mở rộng sau pilot", "Quản trị", "Configuration", "Could", "Product Discovery", "Cần chốt", "F3-003, F3-021", null, "Quy trình publish và rollback cấu hình"],
  ];
  s.getRange(`A5:M${4 + rows.length}`).values = rows;
  tableHeader(s, "A5:M5"); tableBody(s, `A6:M${4 + rows.length}`);
  for (let row = 6; row <= 30; row++) {
    s.getRange(`L${row}`).formulas = [[`=COUNTIF('Sprint Plan'!$D$6:$D$30,A${row})`]];
  }
  s.getRange("L6:L30").format.numberFormat = "#,##0";
  statusValidation(s, "H6:H30", ["Must", "Should", "Could", "Won't"]);
  statusValidation(s, "J6:J30", ["Đủ", "Cần chốt"]);
  widths(s, [80, 135, 245, 345, 220, 145, 150, 80, 140, 100, 145, 110, 240]);
  s.freezePanes.freezeRows(5); s.freezePanes.freezeColumns(3);
}

// Sprint Plan
{
  const s = wb.worksheets.getItem("Sprint Plan");
  setup(s, "Sprint Plan dự kiến", "15 sprint, mỗi sprint hai tuần. Đây là phương án sequencing theo dependency; team cần estimate và rebaseline trước khi cam kết.", "J");
  const assignments = [
    ["Sprint 1", "Tuần 1–2", "Khởi động, scope và governance", "F3-020", "Thiết lập boundary phân quyền", "—", "G1", "Dự kiến", "Song song discovery"],
    ["Sprint 1", "Tuần 1–2", "Khởi động, scope và governance", "F3-021", "Xác định audit event nền tảng", "F3-020", "G1", "Dự kiến", ""],
    ["Sprint 2", "Tuần 3–4", "Mô hình lâm sàng và template", "F3-001", "Nền tảng người bệnh và encounter", "—", "G2", "Dự kiến", ""],
    ["Sprint 2", "Tuần 3–4", "Mô hình lâm sàng và template", "F3-002", "Nền tảng hồ sơ bệnh án", "F3-001", "G2", "Dự kiến", ""],
    ["Sprint 3", "Tuần 5–6", "Template và workspace", "F3-003", "Biểu mẫu pilot", "F3-002", "G2", "Dự kiến", ""],
    ["Sprint 3", "Tuần 5–6", "Template và workspace", "F3-004", "Lưu nháp và phục hồi", "F3-002", "G2", "Dự kiến", ""],
    ["Sprint 4", "Tuần 7–8", "Context nền tảng", "F3-008", "Chọn context cho encounter", "F3-001", "G3", "Dự kiến", ""],
    ["Sprint 4", "Tuần 7–8", "Context nền tảng", "F3-009", "Provenance và conflict handling", "F3-008", "G3", "Dự kiến", ""],
    ["Sprint 5", "Tuần 9–10", "Review workspace", "F3-015", "Hiển thị so sánh nội dung", "F3-003, F3-004", "G3", "Dự kiến", ""],
    ["Sprint 5", "Tuần 9–10", "Review workspace", "F3-016", "Chỉnh sửa và review", "F3-015", "G3", "Dự kiến", ""],
    ["Sprint 6", "Tuần 11–12", "Version và xác nhận", "F3-017", "Version history và restore", "F3-004, F3-016", "G3", "Dự kiến", ""],
    ["Sprint 6", "Tuần 11–12", "Version và xác nhận", "F3-018", "Xác nhận hồ sơ", "F3-016, F3-017", "G3", "Dự kiến", ""],
    ["Sprint 7", "Tuần 13–14", "Standalone hardening", "F3-022", "Privacy và retention nền tảng", "F3-020, F3-021", "G3", "Dự kiến", ""],
    ["Sprint 7", "Tuần 13–14", "Standalone hardening", "F3-024", "Fallback cho luồng chính", "F3-004", "G3", "Dự kiến", ""],
    ["Sprint 8", "Tuần 15–16", "AI draft nền tảng", "F3-010", "Tạo draft theo section", "F3-003, F3-008", "G5", "Dự kiến", ""],
    ["Sprint 8", "Tuần 15–16", "AI draft nền tảng", "F3-014", "Abstention và nhập tay", "F3-010", "G5", "Dự kiến", ""],
    ["Sprint 9", "Tuần 17–18", "AI review và provenance", "F3-012", "Thiếu/mâu thuẫn", "F3-009, F3-010", "G5", "Dự kiến", ""],
    ["Sprint 9", "Tuần 17–18", "AI review và provenance", "F3-013", "Nguồn nội dung AI", "F3-009, F3-010", "G5", "Dự kiến", ""],
    ["Sprint 10", "Tuần 19–20", "AI authoring hoàn chỉnh", "F3-011", "Bổ sung và viết lại", "F3-010", "G5", "Dự kiến", ""],
    ["Sprint 10", "Tuần 19–20", "AI authoring hoàn chỉnh", "F3-023", "Telemetry vận hành", "F3-021", "G5", "Dự kiến", ""],
    ["Sprint 11", "Tuần 21–22", "Context liên module", "F3-005", "Nhận dữ liệu Module 1", "F3-008", "G4", "Dự kiến", "Có thể tách khỏi pilot standalone"],
    ["Sprint 11", "Tuần 21–22", "Context liên module", "F3-006", "Nhận dữ liệu Module 2", "F3-008", "G4", "Dự kiến", "Có thể tách khỏi pilot standalone"],
    ["Sprint 12", "Tuần 23–24", "HIS và safe write", "F3-007", "Nhận dữ liệu HIS/EMR", "F3-008", "G4", "Dự kiến", "Phụ thuộc bệnh viện/vendor"],
    ["Sprint 12", "Tuần 23–24", "HIS và safe write", "F3-019", "Ghi/xuất sau xác nhận", "F3-007, F3-018", "G4/G6", "Dự kiến", "Có thể pilot standalone"],
    ["Sprint 13", "Tuần 25–26", "Cấu hình và release readiness", "F3-025", "Quản lý template version", "F3-003, F3-021", "G6", "Dự kiến", "Could; có thể chuyển sau pilot"],
  ];
  const headers = [["Sprint", "Tuần", "Mục tiêu Sprint", "Feature ID", "Feature", "Ưu tiên", "Phụ thuộc", "Gate", "Trạng thái kế hoạch", "Ghi chú"]];
  s.getRange("A5:J5").values = headers;
  s.getRange(`A6:J${5 + assignments.length}`).values = assignments.map((r) => [r[0], r[1], r[2], r[3], null, null, r[5], r[6], r[7], r[8]]);
  for (let row = 6; row <= 30; row++) {
    s.getRange(`E${row}`).formulas = [[`=INDEX(Features!$C$6:$C$30,MATCH(D${row},Features!$A$6:$A$30,0))`]];
    s.getRange(`F${row}`).formulas = [[`=INDEX(Features!$H$6:$H$30,MATCH(D${row},Features!$A$6:$A$30,0))`]];
  }
  tableHeader(s, "A5:J5"); tableBody(s, "A6:J30");
  statusValidation(s, "I6:I30", ["Dự kiến", "Đã phê duyệt", "Cần điều chỉnh"]);
  s.getRange("A32:J33").values = [
    ["Sprint 14", "Tuần 27–28", "Validation và pilot readiness", "—", "Clinical evaluation, regression, security, performance và UAT", "Release work", "Toàn bộ feature Must trong phạm vi pilot", "G6", "Dự kiến", "Sprint nghiệm thu; không tạo feature mới"],
    ["Sprint 15", "Tuần 29–30", "Pilot và quyết định mở rộng", "—", "Vận hành pilot, đo KPI, review sự cố và quyết định scale", "Release work", "G6", "G7/G8", "Dự kiến", "Phạm vi và thời lượng pilot cần được duyệt"],
  ];
  tableBody(s, "A32:J33");
  statusValidation(s, "I32:I33", ["Dự kiến", "Đã phê duyệt", "Cần điều chỉnh"]);
  section(s, 35, "Kiểm tra phân bổ feature", "J");
  s.getRange("A36:D39").values = [
    ["Kiểm tra", "Giá trị", "Kỳ vọng", "Kết quả"],
    ["Tổng feature", null, 25, null],
    ["Feature chưa xếp sprint", null, 0, null],
    ["Feature xếp trùng", null, 0, null],
  ];
  s.getRange("B37").formulas = [["=COUNTA(Features!$A$6:$A$30)"]];
  s.getRange("B38").formulas = [["=COUNTIF(Features!$L$6:$L$30,0)"]];
  s.getRange("B39").formulas = [["=COUNTIF(Features!$L$6:$L$30,\">1\")"]];
  s.getRange("D37").formulas = [["=IF(B37=C37,\"OK\",\"LỆCH\")"]];
  s.getRange("D38").formulas = [["=IF(B38=C38,\"OK\",\"LỆCH\")"]];
  s.getRange("D39").formulas = [["=IF(B39=C39,\"OK\",\"LỆCH\")"]];
  tableHeader(s, "A36:D36"); tableBody(s, "A37:D39");
  widths(s, [90, 95, 230, 80, 250, 80, 170, 80, 125, 225]);
  s.freezePanes.freezeRows(5); s.freezePanes.freezeColumns(4);
}

// Milestones
{
  const s = wb.worksheets.getItem("Milestones");
  setup(s, "Milestone và Quality Gate", "Milestone là điểm quyết định. Không chuyển giai đoạn nếu chưa có evidence và người có thẩm quyền phê duyệt.", "I");
  const rows = [
    ["Gate", "Milestone", "Dự kiến", "Điều kiện đạt", "Evidence", "Người duyệt", "Nếu chưa đạt", "Trạng thái kế hoạch", "Ghi chú"],
    ["G0", "Project kickoff", "Đầu tuần 1", "Sponsor xác nhận mục tiêu và đầu mối", "Kickoff record", "Sponsor/PO", "Chưa bắt đầu execution", "Dự thảo", ""],
    ["G1", "Scope approved", "Cuối tuần 3", "Scope, cohort, Clinical Owner, KPI draft và RACI được chốt", "Approved charter", "Sponsor/PO", "Quay lại P0", "Dự thảo", ""],
    ["G2", "Foundation approved", "Cuối tuần 7", "Clinical rules, UX, architecture và source precedence được duyệt", "Clinical pack + ADR", "Sponsor/PO", "Không bắt đầu build lõi", "Dự thảo", "Clinical và Architecture cung cấp sign-off"],
    ["G3", "Standalone E2E ready", "Cuối tuần 14", "Bác sĩ hoàn tất hồ sơ không cần HIS", "E2E demo + test evidence", "Sponsor/PO", "Không bắt đầu AI pilot flow", "Dự thảo", "Clinical Owner xác nhận luồng phù hợp"],
    ["G4", "Integration ready", "Cuối tuần 18", "Context, provenance, contract và fallback đạt", "Contract/integration report", "Tech Lead", "Pilot standalone hoặc dời integration", "Dự thảo", "Không block standalone"],
    ["G5", "AI clinical acceptance", "Cuối tuần 21", "AI đạt bộ tiêu chí chất lượng và an toàn được duyệt", "Clinical evaluation report", "Clinical Owner", "Không chuyển UAT", "Dự thảo", ""],
    ["G6", "Pilot Go/No-Go", "Cuối tuần 25", "UAT, security, performance, SOP, support và rollback đạt", "Signed Go/No-Go checklist", "Steering Committee", "No-Go", "Dự thảo", ""],
    ["G7", "Pilot completed", "Cuối tuần 29", "Đủ dữ liệu KPI, feedback và incident review", "Pilot report", "Sponsor/PO", "Kéo dài hoặc dừng pilot", "Dự thảo", ""],
    ["G8", "Scale decision", "Tuần 30", "Có quyết định mở rộng, cải tiến hoặc dừng", "Decision record + roadmap", "Steering Committee", "Rebaseline", "Dự thảo", ""],
  ];
  s.getRange(`A5:I${4+rows.length}`).values = rows; tableHeader(s, "A5:I5"); tableBody(s, `A6:I${4+rows.length}`);
  statusValidation(s, `H6:H${4+rows.length}`, ["Dự thảo", "Đã phê duyệt", "Cần điều chỉnh"]);
  widths(s, [60, 190, 105, 320, 230, 175, 210, 125, 160]); s.freezePanes.freezeRows(5);
}

// RACI
{
  const s = wb.worksheets.getItem("RACI");
  setup(s, "RACI", "A = chịu trách nhiệm cuối; R = thực hiện; C = tham vấn; I = được thông báo. Mỗi dòng có đúng một A.", "I");
  const rows = [
    ["Đầu ra / Quyết định", "Sponsor/PO", "Clinical Owner", "Delivery Lead", "Tech Lead", "AI Lead", "QA Lead", "Hospital Ops/HIS", "Ghi chú"],
    ["Duyệt Project Charter và scope pilot", "A", "C", "R", "C", "I", "I", "C", ""],
    ["Duyệt clinical rules và template", "I", "A", "C", "C", "C", "R", "C", "Clinical Owner có quyền từ chối release"],
    ["Duyệt kiến trúc standalone/integrated", "I", "C", "C", "A", "R", "C", "C", ""],
    ["Chốt KPI và evaluation protocol", "C", "A", "R", "C", "R", "R", "C", "Không tự đặt ngưỡng"],
    ["Chốt data contract M1–2/HIS", "I", "C", "C", "A", "I", "C", "R", ""],
    ["Duyệt AI clinical acceptance", "I", "A", "C", "C", "R", "R", "C", ""],
    ["Duyệt security và production readiness", "I", "C", "R", "A", "C", "R", "C", "Cần Security/DPO tham gia theo tổ chức"],
    ["Duyệt UAT", "A", "R", "C", "C", "C", "R", "R", ""],
    ["Quyết định Go/No-Go pilot", "A", "C", "R", "C", "C", "C", "C", "Dựa trên evidence, không dựa vào % hoàn thành"],
    ["Điều phối incident trong pilot", "I", "C", "A", "R", "R", "R", "R", "Theo runbook và escalation path"],
    ["Quyết định mở rộng sau pilot", "A", "C", "R", "C", "C", "C", "C", ""],
  ];
  s.getRange(`A5:I${4+rows.length}`).values = rows; tableHeader(s, "A5:I5"); tableBody(s, `A6:I${4+rows.length}`);
  s.getRange(`B6:H${4+rows.length}`).format.horizontalAlignment = "center";
  widths(s, [285, 95, 110, 105, 95, 85, 85, 125, 250]); s.freezePanes.freezeRows(5);
}

// Dependencies
{
  const s = wb.worksheets.getItem("Dependencies");
  setup(s, "Dependency Register", "Chỉ ghi dependency ảnh hưởng trực tiếp đến phạm vi, timeline hoặc release decision. Owner thực tế cần được chỉ định khi baseline.", "J");
  const rows = [
    ["ID", "Phụ thuộc", "Loại", "Bên cung cấp", "Cần trước", "Điều kiện sẵn sàng", "Nếu chưa có", "Phương án giảm phụ thuộc", "Owner theo dõi", "Trạng thái"],
    ["D-01", "Clinical Owner và bác sĩ pilot", "Tổ chức", "Bệnh viện", "G1", "Có quyền quyết định và lịch review", "Không duyệt được rule, evaluation, UAT", "Chốt đầu mối và lịch cố định", "Cần chỉ định", "Cần xác nhận"],
    ["D-02", "Mẫu bệnh án và quy trình thực tế", "Nghiệp vụ", "Bệnh viện", "G2", "Có mẫu, field bắt buộc và rule", "Scope và AI output không kiểm thử được", "Giới hạn một mẫu ưu tiên", "Cần chỉ định", "Cần xác nhận"],
    ["D-03", "Bộ dữ liệu lâm sàng đã khử định danh", "Dữ liệu", "Bệnh viện/Clinical", "G5", "Có protocol, provenance và quyền sử dụng", "Không đánh giá được chất lượng AI", "Tạo bộ ca tổng hợp được Clinical duyệt", "Cần chỉ định", "Cần xác nhận"],
    ["D-04", "Data contract Module 1–2", "Nội bộ", "Teams Module 1–2", "G4", "Schema versioned và contract tests", "Thiếu context liên module", "Fallback sang dữ liệu standalone", "Cần chỉ định", "Cần xác nhận"],
    ["D-05", "API và môi trường HIS/EMR", "Bên ngoài", "Bệnh viện/HIS vendor", "G4", "Tài liệu, sample data, test access", "Integration trễ hoặc mapping sai", "Adapter mock; pilot standalone", "Cần chỉ định", "Cần xác nhận"],
    ["D-06", "Hạ tầng on-prem", "Kỹ thuật", "Infra/Security", "G6", "Capacity, network, backup và monitoring", "Không đạt hiệu năng/availability", "Benchmark sớm; capacity plan", "Cần chỉ định", "Cần xác nhận"],
    ["D-07", "Chính sách dữ liệu, audit và retention", "Tuân thủ", "Security/DPO", "G6", "Policy và evidence được duyệt", "Không đủ điều kiện pilot", "Security review từ P1", "Cần chỉ định", "Cần xác nhận"],
    ["D-08", "Nguồn lực Product/Clinical/UX/FE/BE/AI/QA", "Nguồn lực", "Delivery/Sponsor", "Sau G1", "Capacity và allocation được chốt", "Timeline dự kiến không khả thi", "Team estimate và rebaseline", "Cần chỉ định", "Cần xác nhận"],
  ];
  s.getRange(`A5:J${4+rows.length}`).values = rows; tableHeader(s, "A5:J5"); tableBody(s, `A6:J${4+rows.length}`);
  statusValidation(s, `J6:J${4+rows.length}`, ["Cần xác nhận", "Đã xác nhận", "Có rủi ro", "Không sẵn sàng"]);
  widths(s, [65, 255, 100, 145, 85, 230, 235, 240, 120, 120]); s.freezePanes.freezeRows(5);
}

// Risk Register
{
  const s = wb.worksheets.getItem("Risk Register");
  setup(s, "Risk Register", "Khả năng và mức ảnh hưởng chưa được workshop định lượng nên để Cần đánh giá. Không sử dụng điểm rủi ro giả định.", "L");
  const rows = [
    ["ID", "Rủi ro", "Nhóm", "Thất bại nếu", "Khả năng", "Ảnh hưởng", "Bằng chứng cần lấy", "Giảm thiểu", "Phương án dự phòng", "Owner", "Rà soát", "Trạng thái"],
    ["R-01", "Bác sĩ không thấy tiết kiệm thời gian", "Adoption", "Bản nháp phải sửa nhiều hơn nhập tay", "Cần đánh giá", "Cần đánh giá", "Baseline time, edit distance, usability", "Co-design và thử luồng hẹp", "Giảm scope về section có giá trị rõ", "Cần chỉ định", "Mỗi gate", "Mở"],
    ["R-02", "AI tạo nội dung sai hoặc thiếu ngữ cảnh", "Clinical Safety", "Output ảnh hưởng quyết định lâm sàng", "Cần đánh giá", "Cần đánh giá", "Clinical evaluation theo bộ ca", "Provenance, abstention, mandatory review", "Tắt AI section; nhập thủ công", "Clinical Owner", "Mỗi gate", "Mở"],
    ["R-03", "Source of truth không rõ", "Data", "Form, HIS và AI context xung đột", "Cần đánh giá", "Cần đánh giá", "Data flow và conflict scenarios", "Source precedence và audit", "Chạy standalone, chặn safe write", "Tech Lead", "Mỗi gate", "Mở"],
    ["R-04", "Integration làm chậm hoặc chặn sản phẩm", "Dependency", "HIS/M1–2 chưa cung cấp contract đúng hạn", "Cần đánh giá", "Cần đánh giá", "Access plan và contract readiness", "Standalone-first và adapter boundary", "Pilot không tích hợp", "Integration Lead", "Hai tuần", "Mở"],
    ["R-05", "Dữ liệu đánh giá không đại diện", "AI/Data", "Bộ ca không phản ánh thực tế khoa pilot", "Cần đánh giá", "Cần đánh giá", "Sampling protocol và clinical review", "Stratified cases và error taxonomy", "Giới hạn use case", "Clinical + AI", "Mỗi gate", "Mở"],
    ["R-06", "Hạ tầng on-prem không đáp ứng", "Technical", "Latency hoặc capacity làm gián đoạn bác sĩ", "Cần đánh giá", "Cần đánh giá", "Benchmark trên hạ tầng đích", "Capacity plan và performance budget", "Degrade gracefully/manual fallback", "Platform Lead", "Mỗi gate", "Mở"],
    ["R-07", "Thiếu audit, privacy hoặc phân quyền", "Compliance", "Không truy vết được hoặc lộ dữ liệu", "Cần đánh giá", "Cần đánh giá", "Threat model, privacy review, audit test", "Privacy by design và RBAC", "No-Go", "Security Lead", "Mỗi gate", "Mở"],
    ["R-08", "Scope mở rộng quá sớm", "Product", "Nhiều form/khoa được thêm trước khi lõi ổn định", "Cần đánh giá", "Cần đánh giá", "Change requests và WIP", "Một form và một cohort pilot", "Đưa phần mở rộng sang roadmap sau pilot", "PO", "Hàng tuần", "Mở"],
    ["R-09", "Không đủ nguồn lực Clinical/Engineering", "Delivery", "Review hoặc build bị đứt quãng", "Cần đánh giá", "Cần đánh giá", "Capacity và allocation", "Chốt nguồn lực sau G1", "Rebaseline phạm vi/timeline", "Delivery Lead", "Hàng tuần", "Mở"],
    ["R-10", "Pilot không có cơ chế hỗ trợ và rollback", "Operations", "Sự cố kéo dài hoặc ảnh hưởng quy trình bệnh viện", "Cần đánh giá", "Cần đánh giá", "Runbook và drill", "Support roster, monitoring, rollback", "Dừng pilot an toàn", "Hospital Ops", "Trước G6", "Mở"],
  ];
  s.getRange(`A5:L${4+rows.length}`).values = rows; tableHeader(s, "A5:L5"); tableBody(s, `A6:L${4+rows.length}`);
  widths(s, [65, 240, 105, 250, 105, 105, 230, 250, 235, 125, 90, 80]); s.freezePanes.freezeRows(5);
}

// KPI
{
  const s = wb.worksheets.getItem("KPI");
  setup(s, "KPI và Measurement Plan", "Mức mục tiêu chưa được stakeholder phê duyệt nên để Cần chốt. Baseline phải được đo trước pilot.", "K");
  const rows = [
    ["ID", "Mục tiêu", "KPI", "Định nghĩa", "Đơn vị", "Baseline", "Mục tiêu", "Nguồn dữ liệu", "Tần suất", "Owner", "Ghi chú"],
    ["KPI-01", "Giảm thời gian lập bệnh án", "Thời gian hoàn tất hồ sơ", "Từ lúc mở hồ sơ đến lúc bác sĩ xác nhận", "Phút/hồ sơ", "Cần đo", "Cần chốt", "Application audit", "Theo tuần/pilot", "Product/Data", "Dùng median và phân vị"],
    ["KPI-02", "Giảm nhập liệu lại", "Tỷ lệ nội dung AI được giữ lại", "Phần nội dung cuối cùng xuất phát từ draft AI sau chỉnh sửa", "% nội dung", "Cần đo", "Cần chốt", "Version comparison", "Theo tuần/pilot", "AI/Product", "Không dùng riêng lẻ để kết luận chất lượng"],
    ["KPI-03", "Bảo đảm đầy đủ", "Tỷ lệ hồ sơ đủ trường bắt buộc", "Hồ sơ đủ các field/section theo template đã duyệt", "% hồ sơ", "Cần đo", "Cần chốt", "Document validation", "Theo ngày/tuần", "Clinical/QA", "Theo từng loại biểu mẫu"],
    ["KPI-04", "Bảo đảm an toàn", "Tỷ lệ lỗi lâm sàng nghiêm trọng", "Output có lỗi thuộc taxonomy nghiêm trọng được Clinical duyệt", "% output", "Cần đo", "Cần chốt", "Clinical evaluation", "Mỗi release", "Clinical Owner", "Ngưỡng do Clinical phê duyệt"],
    ["KPI-05", "Tăng sử dụng", "Tỷ lệ bác sĩ sử dụng", "Bác sĩ pilot dùng Module 3 trên số bác sĩ thuộc cohort", "% bác sĩ", "Cần đo", "Cần chốt", "Usage telemetry", "Theo tuần", "PO", "Kèm phản hồi định tính"],
    ["KPI-06", "Hoàn tất workflow", "Tỷ lệ hồ sơ hoàn tất", "Hồ sơ bắt đầu và được xác nhận thành công", "% hồ sơ", "Cần đo", "Cần chốt", "Application audit", "Theo ngày/tuần", "Product/Ops", "Tách standalone và integrated"],
    ["KPI-07", "Tích hợp ổn định", "Tỷ lệ trao đổi dữ liệu thành công", "Giao dịch hợp lệ, không mất dữ liệu và reconciliation hoàn tất", "% giao dịch", "Cần đo", "Cần chốt", "Integration logs", "Theo ngày", "Integration Lead", "Chỉ áp dụng khi tích hợp"],
    ["KPI-08", "Hiệu năng phù hợp", "P95 thời gian phản hồi", "Thời gian phản hồi tại các bước chính", "Giây", "Cần đo", "Cần chốt", "APM/Telemetry", "Theo release/pilot", "Platform Lead", "Đo trên hạ tầng pilot"],
    ["KPI-09", "Truy vết đầy đủ", "Tỷ lệ sự kiện bắt buộc có audit", "Sự kiện bắt buộc được ghi đủ actor, action, time, object", "% sự kiện", "Cần đo", "Cần chốt", "Audit validation", "Mỗi release", "Security/QA", "Danh mục event cần duyệt"],
    ["KPI-10", "Trải nghiệm bác sĩ", "Mức độ hài lòng", "Đánh giá của bác sĩ pilot theo thang đo đã chọn", "Điểm/%", "Cần đo", "Cần chốt", "Pilot survey", "Giữa/cuối pilot", "UX/PO", "Chốt thang đo trước pilot"],
  ];
  s.getRange(`A5:K${4+rows.length}`).values = rows; tableHeader(s, "A5:K5"); tableBody(s, `A6:K${4+rows.length}`);
  widths(s, [70, 190, 200, 300, 100, 90, 90, 145, 105, 120, 210]); s.freezePanes.freezeRows(5);
}

// Go-NoGo
{
  const s = wb.worksheets.getItem("Go-NoGo");
  setup(s, "Pilot Go / No-Go Checklist", "Mọi tiêu chí bắt buộc phải có evidence và người duyệt. Cập nhật cột Trạng thái để Tổng quan tự tính số tiêu chí đã đạt.", "I");
  const rows = [
    ["Nhóm", "Tiêu chí", "Evidence yêu cầu", "Owner", "Người duyệt", "Trạng thái", "Nếu chưa đạt", "Gate", "Ghi chú"],
    ["Clinical Safety", "AI không tự quyết định chẩn đoán, kê đơn hoặc ký thay bác sĩ", "E2E tests + clinical review", "Product/AI", "Clinical Owner", "Cần xác nhận", "No-Go", "G5", ""],
    ["Clinical Safety", "Bộ evaluation đạt ngưỡng chất lượng đã duyệt", "Clinical evaluation report", "AI/QA", "Clinical Owner", "Cần xác nhận", "No-Go", "G5", ""],
    ["Human Review", "Bác sĩ review và xác nhận trước khi ghi chính thức", "Audit trail + workflow tests", "FE/BE", "Clinical Owner", "Cần xác nhận", "No-Go", "G5", ""],
    ["Data Integrity", "Source precedence, provenance, version và reconciliation hoạt động đúng", "Data integrity report", "Tech/QA", "Tech Lead", "Cần xác nhận", "No-Go", "G4/G6", ""],
    ["Standalone", "Luồng chính hoàn tất khi HIS không kết nối", "UAT scenario", "Platform/QA", "PO", "Cần xác nhận", "No-Go", "G3/G6", ""],
    ["Integration", "Integration có contract tests, timeout, retry và fallback", "Integration test report", "Integration", "Tech Lead", "Cần xác nhận", "Pilot standalone nếu được duyệt", "G4/G6", "Chỉ áp dụng nếu pilot tích hợp"],
    ["Security", "RBAC, audit, privacy, retention và secrets đáp ứng yêu cầu", "Security assessment", "Security", "Security/DPO", "Cần xác nhận", "No-Go", "G6", ""],
    ["Performance", "Hiệu năng và capacity đạt ngưỡng đã duyệt trên hạ tầng pilot", "Performance report", "Platform", "Tech Lead", "Cần xác nhận", "No-Go hoặc giảm scope", "G6", ""],
    ["Operations", "Monitoring, support, incident response và rollback sẵn sàng", "Runbook + drill", "Delivery/Ops", "Sponsor/PO", "Cần xác nhận", "No-Go", "G6", ""],
    ["UAT", "Bác sĩ pilot ký xác nhận UAT", "Signed UAT record", "QA/Ops", "PO + Clinical Owner", "Cần xác nhận", "No-Go", "G6", ""],
    ["Training", "Người dùng và support team hoàn tất hướng dẫn", "Training record", "Hospital Ops", "PO", "Cần xác nhận", "No-Go", "G6", ""],
  ];
  s.getRange(`A5:I${4+rows.length}`).values = rows; tableHeader(s, "A5:I5"); tableBody(s, `A6:I${4+rows.length}`);
  statusValidation(s, `F6:F${4+rows.length}`, ["Cần xác nhận", "Chưa đạt", "Đạt", "Không áp dụng"]);
  widths(s, [130, 330, 240, 125, 145, 110, 205, 80, 185]); s.freezePanes.freezeRows(5);
}

// Action Plan
{
  const s = wb.worksheets.getItem("Action Plan");
  setup(s, "Action và Decision Plan", "Các việc cần hoàn tất để chuyển bản dự thảo thành baseline được phê duyệt. Owner tên thật và ngày cam kết chưa có nên không tự điền.", "J");
  const rows = [
    ["ID", "Hành động / Quyết định", "Loại", "Owner vai trò", "Cần trước", "Đầu ra", "Phụ thuộc", "Trạng thái", "Cách leo thang", "Ghi chú"],
    ["A-01", "Chỉ định Sponsor/PO và Clinical Owner", "Decision", "Phía dự án/bệnh viện", "G1", "Tên người, quyền quyết định, lịch review", "—", "Cần thực hiện", "Escalate ban chỉ đạo", ""],
    ["A-02", "Chọn khoa, loại bệnh án và cohort pilot", "Decision", "Sponsor/PO + Clinical", "G1", "Scope pilot được duyệt", "A-01", "Cần thực hiện", "Escalate Sponsor/PO", ""],
    ["A-03", "Chốt workflow hiện tại và baseline", "Discovery", "PO/BA + Clinical", "G1", "As-is flow và baseline measurement", "A-02", "Cần thực hiện", "Escalate PO", ""],
    ["A-04", "Chốt clinical rules, template và error taxonomy", "Decision", "Clinical Owner", "G2", "Clinical specification", "A-01, A-02", "Cần thực hiện", "Escalate Sponsor/PO", ""],
    ["A-05", "Chốt kiến trúc và source precedence", "Decision", "Tech Lead", "G2", "ADR và data flow", "A-03, A-04", "Cần thực hiện", "Escalate Architecture Owner", ""],
    ["A-06", "Team estimate và lập capacity plan", "Planning", "Delivery Lead", "Sau G2", "Baseline timeline và staffing", "A-04, A-05", "Cần thực hiện", "Escalate Sponsor/PO", "Thay timeline giả định"],
    ["A-07", "Chốt KPI, ngưỡng evaluation và Go/No-Go", "Decision", "PO + Clinical Owner", "Trước G5", "Measurement và release criteria", "A-03, A-04", "Cần thực hiện", "Escalate Steering Committee", ""],
    ["A-08", "Chốt data contract với Module 1–2", "Workshop", "Integration Lead", "G4", "Versioned schemas", "A-05", "Cần thực hiện", "Escalate Tech Lead", ""],
    ["A-09", "Xác nhận phạm vi và điều kiện tích hợp HIS", "External", "PO + Hospital/HIS", "G4", "Integration access plan", "A-02, A-05", "Cần thực hiện", "Escalate Sponsor/PO", "Pilot standalone nếu cần"],
    ["A-10", "Xác nhận hạ tầng on-prem và security requirements", "Technical", "Platform/Security", "G6", "Environment readiness plan", "A-05", "Cần thực hiện", "Escalate Tech Lead", ""],
    ["A-11", "Thiết lập cadence báo cáo, risk review và change control", "Governance", "Delivery Lead", "G1", "PM operating model", "A-01", "Cần thực hiện", "Escalate Sponsor/PO", ""],
    ["A-12", "Duyệt master plan và baseline", "Decision", "Steering Committee", "Sau A-06", "Approved master plan", "A-01 đến A-11", "Cần thực hiện", "Escalate Sponsor", ""],
  ];
  s.getRange(`A5:J${4+rows.length}`).values = rows; tableHeader(s, "A5:J5"); tableBody(s, `A6:J${4+rows.length}`);
  statusValidation(s, `H6:H${4+rows.length}`, ["Cần thực hiện", "Đang xử lý", "Hoàn thành", "Bị chặn"]);
  widths(s, [65, 300, 95, 160, 90, 250, 135, 115, 180, 180]); s.freezePanes.freezeRows(5);
}

// Common formatting
for (const name of sheetNames) {
  const s = wb.worksheets.getItem(name);
  const used = s.getUsedRange();
  if (used) {
    used.format.font = { ...used.format.font, name: "Arial" };
    used.format.autofitRows();
  }
  s.tabColor = name === "Tổng quan" ? c.navy : (name === "Risk Register" || name === "Go-NoGo" ? "#C65911" : c.blue);
}

await wb.recalculate();
await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(previewDir, { recursive: true });

const errorScan = await wb.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan"
});
console.log(errorScan.ndjson);

for (const name of sheetNames) {
  const rendered = await wb.render({ sheetName: name, autoCrop: "all", scale: 0.8, format: "png" });
  const safeName = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replaceAll(" ", "_");
  await fs.writeFile(`${previewDir}/${safeName}.png`, new Uint8Array(await rendered.arrayBuffer()));
}

const overviewCheck = await wb.inspect({ kind: "region", sheetId: "Tổng quan", range: "A5:H23", maxChars: 7000 });
console.log(overviewCheck.ndjson);
const planCheck = await wb.inspect({ kind: "region", sheetId: "Master Plan", range: "A5:L23", maxChars: 9000 });
console.log(planCheck.ndjson);

const output = await SpreadsheetFile.exportXlsx(wb);
await output.save(outputFile);
console.log(JSON.stringify({ outputFile, previewDir, sheets: sheetNames }, null, 2));
