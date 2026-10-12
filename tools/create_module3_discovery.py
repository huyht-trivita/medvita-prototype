from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.section import WD_SECTION
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.style import WD_STYLE_TYPE
from docx.enum.text import WD_BREAK
from pathlib import Path


OUT = Path("output/MedVita_Module_3_Product_Discovery.docx")
OUT.parent.mkdir(parents=True, exist_ok=True)

NAVY = "17365D"
BLUE = "2F75B5"
PALE_BLUE = "EAF2F8"
PALE_GRAY = "F3F5F7"
MID_GRAY = "D9E1E8"
DARK_GRAY = "44546A"
WHITE = "FFFFFF"
BLACK = "000000"


def set_cell_shading(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_margins(cell, top=100, start=120, bottom=100, end=120):
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for tag, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{tag}"))
        if node is None:
            node = OxmlElement(f"w:{tag}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def set_cell_border(cell, color="D9D9D9", size="6"):
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_borders = tc_pr.first_child_found_in("w:tcBorders")
    if tc_borders is None:
        tc_borders = OxmlElement("w:tcBorders")
        tc_pr.append(tc_borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        tag = f"w:{edge}"
        node = tc_borders.find(qn(tag))
        if node is None:
            node = OxmlElement(tag)
            tc_borders.append(node)
        node.set(qn("w:val"), "single")
        node.set(qn("w:sz"), size)
        node.set(qn("w:color"), color)


def set_repeat_table_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    tbl_header = OxmlElement("w:tblHeader")
    tbl_header.set(qn("w:val"), "true")
    tr_pr.append(tbl_header)


def set_col_widths(table, widths):
    for row in table.rows:
        for idx, width in enumerate(widths):
            row.cells[idx].width = Inches(width)


def add_page_number(paragraph):
    paragraph.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    run = paragraph.add_run("Trang ")
    run.font.size = Pt(9)
    fld_char1 = OxmlElement("w:fldChar")
    fld_char1.set(qn("w:fldCharType"), "begin")
    instr_text = OxmlElement("w:instrText")
    instr_text.set(qn("xml:space"), "preserve")
    instr_text.text = "PAGE"
    fld_char2 = OxmlElement("w:fldChar")
    fld_char2.set(qn("w:fldCharType"), "end")
    run._r.append(fld_char1)
    run._r.append(instr_text)
    run._r.append(fld_char2)


def add_hyperlink(paragraph, text, url):
    part = paragraph.part
    rid = part.relate_to(url, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink", is_external=True)
    hyperlink = OxmlElement("w:hyperlink")
    hyperlink.set(qn("r:id"), rid)
    new_run = OxmlElement("w:r")
    r_pr = OxmlElement("w:rPr")
    color = OxmlElement("w:color")
    color.set(qn("w:val"), BLUE)
    underline = OxmlElement("w:u")
    underline.set(qn("w:val"), "single")
    r_pr.append(color)
    r_pr.append(underline)
    new_run.append(r_pr)
    text_node = OxmlElement("w:t")
    text_node.text = text
    new_run.append(text_node)
    hyperlink.append(new_run)
    paragraph._p.append(hyperlink)
    return hyperlink


def add_bullet(doc, text, level=0):
    style = "List Bullet" if level == 0 else "List Bullet 2"
    p = doc.add_paragraph(style=style)
    p.add_run(text)
    return p


def add_number(doc, text, number, level=0):
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Inches(0.22 + 0.22 * level)
    p.paragraph_format.first_line_indent = Inches(-0.22)
    p.add_run(f"{number}. ").bold = True
    p.add_run(text)
    return p


def add_table(doc, headers, rows, widths=None, font_size=9):
    table = doc.add_table(rows=1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    header = table.rows[0]
    set_repeat_table_header(header)
    for i, label in enumerate(headers):
        cell = header.cells[i]
        set_cell_shading(cell, NAVY)
        set_cell_border(cell)
        set_cell_margins(cell)
        cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(str(label))
        r.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)
        r.font.size = Pt(font_size)
    for row_idx, values in enumerate(rows):
        cells = table.add_row().cells
        for i, value in enumerate(values):
            cell = cells[i]
            set_cell_border(cell)
            set_cell_margins(cell)
            set_cell_shading(cell, PALE_BLUE if row_idx % 2 else WHITE)
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            if i == 0 and len(headers) <= 4:
                pass
            r = p.add_run(str(value))
            r.font.size = Pt(font_size)
    if widths:
        set_col_widths(table, widths)
    doc.add_paragraph().paragraph_format.space_after = Pt(0)
    return table


def add_status_legend(doc):
    p = doc.add_paragraph()
    p.add_run("Quy ước bằng chứng. ").bold = True
    p.add_run("Dữ kiện đã xác minh là nội dung có trong Jira, tài liệu dự án hoặc nguồn sản phẩm chính thức. ")
    p.add_run("Định hướng đã chốt ").bold = True
    p.add_run("là quyết định người dùng xác nhận trong buổi làm việc. ")
    p.add_run("Đề xuất ").bold = True
    p.add_run("là nội dung cần PO, chuyên môn hoặc bệnh viện phê duyệt trước khi trở thành requirement.")


doc = Document()
sec = doc.sections[0]
sec.page_width = Inches(8.5)
sec.page_height = Inches(11)
sec.top_margin = Inches(0.72)
sec.bottom_margin = Inches(0.68)
sec.left_margin = Inches(0.76)
sec.right_margin = Inches(0.76)

styles = doc.styles
normal = styles["Normal"]
normal.font.name = "Arial"
normal._element.rPr.rFonts.set(qn("w:ascii"), "Arial")
normal._element.rPr.rFonts.set(qn("w:hAnsi"), "Arial")
normal.font.size = Pt(10.5)
normal.font.color.rgb = RGBColor(0, 0, 0)
normal.paragraph_format.space_after = Pt(6)
normal.paragraph_format.line_spacing = 1.13

for name, size, before, after in [
    ("Title", 25, 0, 18),
    ("Heading 1", 17, 16, 7),
    ("Heading 2", 13, 12, 5),
    ("Heading 3", 11, 9, 4),
]:
    st = styles[name]
    st.font.name = "Arial"
    st._element.rPr.rFonts.set(qn("w:ascii"), "Arial")
    st._element.rPr.rFonts.set(qn("w:hAnsi"), "Arial")
    st.font.size = Pt(size)
    st.font.bold = name != "Title" or True
    st.font.color.rgb = RGBColor(0, 0, 0)
    st.paragraph_format.space_before = Pt(before)
    st.paragraph_format.space_after = Pt(after)
    st.paragraph_format.keep_with_next = True

subtitle = styles.add_style("Subtitle Custom", WD_STYLE_TYPE.PARAGRAPH)
subtitle.font.name = "Arial"
subtitle._element.rPr.rFonts.set(qn("w:ascii"), "Arial")
subtitle._element.rPr.rFonts.set(qn("w:hAnsi"), "Arial")
subtitle.font.size = Pt(13)
subtitle.font.color.rgb = RGBColor(68, 84, 106)
subtitle.paragraph_format.space_after = Pt(12)

for section in doc.sections:
    hp = section.header.paragraphs[0]
    hp.text = "MEDVITA   |   MODULE 3 PRODUCT DISCOVERY"
    hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    for run in hp.runs:
        run.font.name = "Arial"
        run.font.size = Pt(8)
        run.font.bold = True
        run.font.color.rgb = RGBColor(68, 84, 106)
    add_page_number(section.footer.paragraphs[0])

# Cover
p = doc.add_paragraph(style="Title")
p.alignment = WD_ALIGN_PARAGRAPH.LEFT
p.add_run("MedVita Module 3\nProduct Discovery và Lộ trình phát triển")
p = doc.add_paragraph(style="Subtitle Custom")
p.add_run("Phân tích sản phẩm, đối thủ cạnh tranh, mô hình chức năng và kế hoạch phát triển nền tảng hỗ trợ lập bệnh án điện tử")

doc.add_paragraph("Phiên bản 1.0", style="Subtitle Custom")
doc.add_paragraph("Ngày lập: 10 tháng 10 năm 2026", style="Subtitle Custom")
doc.add_paragraph("Đối tượng sử dụng: Product Owner, Business Analyst, lãnh đạo sản phẩm, bác sĩ đại diện, Dev, AI, QC và đối tác bệnh viện", style="Subtitle Custom")

doc.add_paragraph().add_run("Kết luận chính").bold = True
p = doc.add_paragraph()
p.add_run("Module 3 nên được phát triển từ tính năng AI hỗ trợ điền Phiếu Theo Dõi Điều Trị thành nền tảng hỗ trợ bác sĩ lập và hoàn thiện bệnh án điện tử. ")
p.add_run("Nền tảng phải hoạt động độc lập trên MedVita; HIS/EMR là nguồn dữ liệu và đích đồng bộ tùy chọn. Dữ liệu từ Module 1 và Module 2 trở thành context có kiểm soát cho quá trình lập bệnh án.")

doc.add_paragraph().add_run("Phạm vi tài liệu").bold = True
for item in [
    "Hiện trạng và mục tiêu sản phẩm của Module 3.",
    "Phân tích thị trường và các sản phẩm cạnh tranh.",
    "Ma trận năng lực sản phẩm.",
    "Mô hình chức năng và dữ liệu mục tiêu.",
    "Gap analysis, lộ trình, KPI, guardrail, rủi ro và quyết định cần chốt.",
]:
    add_bullet(doc, item)

doc.add_page_break()

doc.add_heading("Mục lục nội dung", level=1)
toc_items = [
    "1. Tóm tắt điều hành",
    "2. Phạm vi và phương pháp nghiên cứu",
    "3. Hiện trạng Module 3",
    "4. Tầm nhìn và định vị sản phẩm",
    "5. Người dùng và nhu cầu chính",
    "6. Quy trình nghiệp vụ mục tiêu",
    "7. Mô hình dữ liệu và Context Hub",
    "8. Phân tích đối thủ cạnh tranh",
    "9. Ma trận năng lực cạnh tranh",
    "10. Danh mục tính năng mục tiêu",
    "11. Phân tích khoảng cách",
    "12. Lộ trình phát triển",
    "13. Tiêu chuẩn chất lượng và release gate",
    "14. AI guardrail và quản trị lâm sàng",
    "15. Chỉ số đánh giá",
    "16. Rủi ro và biện pháp kiểm soát",
    "17. Dependency và quyết định cần chốt",
    "18. Đề xuất hành động tiếp theo",
    "19. Nguồn tham khảo",
]
for item in toc_items:
    add_bullet(doc, item)

doc.add_heading("1 Tóm tắt điều hành", level=1)
p = doc.add_paragraph()
p.add_run("Định hướng đã chốt. ").bold = True
p.add_run("Module 3 có mục tiêu hỗ trợ bác sĩ lập bệnh án điện tử một cách tự động hơn. Hệ thống có thể sử dụng dữ liệu HIS/EMR nhưng không phụ thuộc vào HIS/EMR để hoạt động. Module 3 cũng có thể sử dụng dữ liệu đã được phép từ Module 1 và Module 2.")

p = doc.add_paragraph()
p.add_run("Kết luận nghiên cứu. ").bold = True
p.add_run("Các sản phẩm dẫn đầu như Microsoft Dragon Copilot, Oracle Health AI Agents, Abridge, Suki và Nabla đều hội tụ ở bốn năng lực: thu nhận thông tin lâm sàng, tạo tài liệu có cấu trúc, cho bác sĩ review và kết nối EHR. Khoảng trống thị trường phù hợp với MedVita là một nền tảng độc lập, hỗ trợ tiếng Việt, biểu mẫu bệnh án Việt Nam, triển khai on-premise và liên kết dữ liệu xuyên suốt hành trình trước khám, trong buổi khám và điều trị.")

p = doc.add_paragraph()
p.add_run("Khuyến nghị. ").bold = True
p.add_run("Không mở rộng ngay sang nhiều loại bệnh án. Trước tiên cần xử lý các lỗi an toàn trong MV-211, hoàn thiện vòng đời Draft → Review → Finalized → Sync, sau đó xây Clinical Workspace độc lập và Context Hub cho Module 1, Module 2 và HIS/EMR.")

add_table(doc,
    ["Ưu tiên", "Kết quả cần đạt"],
    [
        ["1", "Ổn định Phiếu Theo Dõi Điều Trị và đóng toàn bộ lỗi an toàn mức Urgent/High."],
        ["2", "Xây Clinical Workspace độc lập để Module 3 hoạt động không cần HIS/EMR."],
        ["3", "Xây Context Hub có provenance cho dữ liệu Module 1, Module 2, HIS và tài liệu bổ sung."],
        ["4", "Chuẩn hóa AI Clinical Authoring, review, versioning, amendment và audit."],
        ["5", "Mở rộng template bệnh án và connector cho nhiều HIS/bệnh viện."],
    ], [0.85, 5.95], 9.5)

doc.add_heading("2 Phạm vi và phương pháp nghiên cứu", level=1)
doc.add_heading("2.1 Câu hỏi nghiên cứu", level=2)
for item in [
    "Module 3 đang giải quyết nhu cầu nào và phạm vi hiện tại đã đủ chưa?",
    "Sản phẩm quốc tế nào đang giải quyết bài toán tương tự?",
    "Những năng lực nào đã trở thành tiêu chuẩn thị trường?",
    "MedVita nên tạo khác biệt ở đâu trong bối cảnh bệnh viện Việt Nam?",
    "Cần phát triển theo thứ tự nào để giảm rủi ro lâm sàng và rủi ro tích hợp?",
]:
    add_bullet(doc, item)

doc.add_heading("2.2 Nguồn và giới hạn", level=2)
add_status_legend(doc)
add_table(doc,
    ["Nguồn", "Mục đích sử dụng", "Mức tin cậy"],
    [
        ["Jira MV-211 và child work items", "Hiện trạng scope, Story, Task, Bug và trạng thái delivery", "Cao"],
        ["Tài liệu Module 1 và Module 2", "Xác định dữ liệu có thể cung cấp cho Module 3", "Cao"],
        ["Nguồn sản phẩm chính thức", "Xác minh chức năng của đối thủ", "Cao"],
        ["Trao đổi với người dùng", "Mục tiêu mới của Module 3", "Cao nhưng cần cập nhật vào Jira"],
        ["Suy luận sản phẩm", "Gap analysis và roadmap", "Đề xuất, cần phê duyệt"],
    ], [1.6, 3.8, 1.4], 9)

doc.add_paragraph("Thông tin đối thủ được tổng hợp từ tài liệu chính thức có thể thay đổi theo khu vực, cấu hình EHR và thời điểm. Ma trận không coi một tính năng là có sẵn nếu nguồn công khai chưa xác minh rõ.")

doc.add_heading("3 Hiện trạng Module 3", level=1)
doc.add_heading("3.1 Phạm vi hiện tại", level=2)
doc.add_paragraph("Epic MV-211 hiện định nghĩa Module 3 là AI hỗ trợ bác sĩ điền Phiếu Theo Dõi Điều Trị. Luồng chính gồm mở phiếu, nhận yêu cầu bằng văn bản hoặc giọng nói, tạo nội dung đề xuất, điền vào các trường, bác sĩ lưu và đồng bộ về HIS.")

add_table(doc,
    ["Nhóm chức năng", "Ticket chính", "Hiện trạng Jira ngày 10 tháng 10 năm 2026"],
    [
        ["Trang Phiếu Theo Dõi Điều Trị", "MV-323", "In Review"],
        ["Trợ lý AI nổi", "MV-255", "In Progress"],
        ["Giọng nói tự do", "MV-249", "In Progress"],
        ["Gõ chat", "MV-250", "In Progress"],
        ["Đọc chính tả", "MV-230", "To Do"],
        ["Tóm tắt diễn biến", "MV-256", "In Progress"],
        ["Điền dữ liệu vào phiếu", "MV-257", "In Progress"],
        ["Đồng bộ HIS", "MV-251", "In Progress"],
        ["Dùng chung nền tảng Module 1 và 2", "MV-95", "To Do"],
    ], [2.5, 1.2, 3.1], 8.8)

doc.add_heading("3.2 Đánh giá production readiness", level=2)
doc.add_paragraph("Tại thời điểm rà soát, không có Story nghiệp vụ nào trong Epic ở trạng thái Done. Jira còn 21 bug chưa hoàn tất, gồm 2 Urgent, 5 High và 14 Medium. Vì vậy Module 3 chưa phù hợp để chạy production bệnh viện.")
for item in [
    "AI có thể đưa thuốc hoặc liều nguy hiểm vào Y lệnh mà chưa có cơ chế kiểm soát phù hợp.",
    "AI có thể dùng dữ liệu đã lưu thay vì nội dung mới nhất đang hiển thị trên form.",
    "Có trường hợp điền sai ô, bỏ sót nội dung hoặc hiểu sai tham chiếu trong hội thoại.",
    "Hệ thống có thể thông báo đã cập nhật dù form chưa thay đổi.",
    "Cơ chế lưu nháp, xác nhận và đồng bộ chưa được tách rõ trong mọi luồng.",
]:
    add_bullet(doc, item)

doc.add_heading("3.3 Khoảng cách giữa hiện trạng và mục tiêu mới", level=2)
add_table(doc,
    ["Khía cạnh", "Hiện tại", "Mục tiêu"],
    [
        ["Phạm vi", "Một Phiếu Theo Dõi Điều Trị", "Nền tảng lập nhiều loại bệnh án điện tử"],
        ["Phụ thuộc", "Luồng chính thiên về HIS", "Standalone trước, HIS là tích hợp tùy chọn"],
        ["Patient và encounter", "Nhận từ HIS hoặc dữ liệu demo", "MedVita tự quản lý được"],
        ["Context", "HIS, form và lịch sử chat", "Module 1, Module 2, HIS và tài liệu bổ sung"],
        ["Vòng đời tài liệu", "Lưu và đồng bộ", "Draft, Reviewed, Finalized, Amended, Synced"],
        ["Provenance", "Có trong Epic nhưng chưa đủ đặc tả", "Truy được nguồn cho từng đề xuất"],
        ["Biểu mẫu", "Hard-code một form", "Template cấu hình theo bệnh viện và chuyên khoa"],
    ], [1.55, 2.45, 2.8], 9)

doc.add_heading("4 Tầm nhìn và định vị sản phẩm", level=1)
doc.add_heading("4.1 Product statement", level=2)
doc.add_paragraph("MedVita Module 3 là nền tảng AI hỗ trợ bác sĩ tổng hợp dữ liệu, soạn, hoàn thiện và quản lý bệnh án điện tử. Sản phẩm có thể hoạt động độc lập hoặc kết nối với HIS/EMR; AI tạo bản nháp có nguồn, bác sĩ review và xác nhận trước khi nội dung trở thành hồ sơ chính thức.")

doc.add_heading("4.2 Nguyên tắc sản phẩm", level=2)
principles = [
    "Standalone first: Module 3 phải hoàn thành được luồng chính khi không có HIS.",
    "Patient và encounter first: mọi tài liệu phải gắn đúng người bệnh và đúng lượt điều trị.",
    "Evidence before trust: nội dung AI phải truy được về nguồn.",
    "Human confirmation: AI tạo Draft; bác sĩ tạo Finalized record.",
    "Current form is source of truth during editing: AI phải dùng dữ liệu mới nhất mà bác sĩ đang xem và sửa.",
    "Independent destinations: lưu MedVita, sync HIS, xuất PDF và chia sẻ là các hành động riêng.",
    "Safe degradation: AI hoặc HIS lỗi không được cản bác sĩ hoàn thiện hồ sơ thủ công.",
    "Configurable templates: không hard-code mỗi biểu mẫu thành một sản phẩm riêng.",
]
for idx, item in enumerate(principles, start=1):
    add_number(doc, item, idx)

doc.add_heading("4.3 Định vị cạnh tranh", level=2)
doc.add_paragraph("Không nên định vị Module 3 chỉ là AI Scribe, chatbot hay công cụ Speech-to-Text. Định vị phù hợp hơn là Trợ lý AI hỗ trợ lập bệnh án điện tử cho bệnh viện Việt Nam.")
add_table(doc,
    ["Điểm khác biệt", "Giá trị"],
    [
        ["Tiếng Việt y khoa", "Nhận diện cách nói, thuật ngữ, viết tắt và tên thuốc trong bối cảnh Việt Nam."],
        ["Biểu mẫu Việt Nam", "Cấu hình theo biểu mẫu bệnh án và quy trình từng bệnh viện."],
        ["Standalone và đa HIS", "Không khóa sản phẩm vào một nhà cung cấp HIS."],
        ["Dữ liệu xuyên module", "Tận dụng thông tin trước khám, trong buổi khám và quá trình điều trị."],
        ["On-premise", "Phù hợp yêu cầu quản trị và lưu trữ dữ liệu của bệnh viện."],
        ["Provenance và audit", "Bác sĩ kiểm chứng nguồn; bệnh viện truy vết được quá trình xử lý."],
    ], [2.0, 4.8], 9.3)

doc.add_heading("5 Người dùng và nhu cầu chính", level=1)
add_table(doc,
    ["Actor", "Nhu cầu", "Trách nhiệm"],
    [
        ["Bác sĩ điều trị", "Hoàn thiện bệnh án nhanh, đúng và có đủ context", "Review, chỉnh sửa và xác nhận nội dung lâm sàng"],
        ["Điều dưỡng", "Ghi nhận phần chăm sóc trong phạm vi được cấp", "Chỉ thao tác trên trường và tài liệu được phân quyền"],
        ["Bác sĩ được mời", "Xem thông tin phục vụ phối hợp điều trị", "Không sửa hồ sơ khi chỉ được cấp quyền xem"],
        ["Quản trị bệnh viện", "Cấu hình biểu mẫu, quyền và tích hợp", "Quản trị tổ chức; không can thiệp nội dung chuyên môn"],
        ["PO và chuyên môn", "Kiểm soát scope, chất lượng và guardrail", "Phê duyệt rule, template và tiêu chuẩn ra mắt"],
        ["QC và vận hành", "Kiểm thử và giám sát hệ thống", "Xác minh luồng, quyền, audit, lỗi và khả năng khôi phục"],
    ], [1.45, 3.1, 2.25], 8.8)

doc.add_heading("6 Quy trình nghiệp vụ mục tiêu", level=1)
doc.add_heading("6.1 Luồng Standalone", level=2)
flow = [
    "Bác sĩ đăng nhập MedVita.",
    "Tìm hoặc tạo bệnh nhân và chọn Health Profile.",
    "Tạo encounter hoặc đợt điều trị.",
    "Chọn loại tài liệu cần lập.",
    "Chọn dữ liệu tham khảo từ Module 1, Module 2 hoặc tài liệu bổ sung.",
    "Nhập nội dung bằng giọng nói, văn bản hoặc trực tiếp trên form.",
    "AI tạo đề xuất có nguồn và diff.",
    "Bác sĩ chấp nhận, chỉnh sửa hoặc từ chối.",
    "Bác sĩ lưu Draft hoặc Finalize.",
    "Tùy chọn xuất PDF, chia sẻ hoặc đồng bộ sang hệ thống khác.",
]
for idx, item in enumerate(flow, start=1):
    add_number(doc, item, idx)

doc.add_heading("6.2 Luồng tích hợp HIS hoặc EMR", level=2)
doc.add_paragraph("HIS mở Module 3 với hospital, doctor, patient và encounter context. MedVita kiểm tra context, tải dữ liệu được phép, thực hiện cùng quy trình soạn và review. Chỉ record đã Finalized mới được đồng bộ về đúng encounter. Nếu HIS lỗi, record trên MedVita vẫn được giữ và có trạng thái chờ đồng bộ.")

doc.add_heading("6.3 Luồng chỉnh sửa sau xác nhận", level=2)
doc.add_paragraph("Record đã Finalized không bị ghi đè trực tiếp. Bác sĩ tạo amendment, nêu lý do, chỉnh nội dung và xác nhận phiên bản mới. Hệ thống giữ toàn bộ lịch sử và trạng thái đồng bộ của từng phiên bản.")

doc.add_heading("7 Mô hình dữ liệu và Context Hub", level=1)
doc.add_heading("7.1 Các thực thể chính", level=2)
add_table(doc,
    ["Thực thể", "Ý nghĩa"],
    [
        ["Patient", "Người bệnh được nhận diện trong MedVita và có thể liên kết với mã bệnh nhân ở nhiều bệnh viện."],
        ["Health Profile", "Hồ sơ sức khỏe gắn với patient và quyền truy cập phù hợp."],
        ["Encounter", "Một lượt khám hoặc lần tương tác cụ thể với một khoa hoặc bác sĩ."],
        ["Episode of care", "Nhóm encounter thuộc cùng một đợt điều trị hoặc hành trình chăm sóc."],
        ["Clinical document", "Một tài liệu lâm sàng như Phiếu Theo Dõi Điều Trị, hội chẩn hoặc giấy ra viện."],
        ["Context item", "Một nguồn tham khảo được phép dùng khi tạo tài liệu."],
        ["AI proposal", "Nội dung AI đề xuất, chưa phải hồ sơ chính thức."],
        ["Document version", "Phiên bản Draft, Finalized hoặc Amendment của tài liệu."],
        ["Sync transaction", "Một lần trao đổi dữ liệu với HIS/EMR hoặc hệ thống ngoài."],
    ], [1.65, 5.15], 9.1)

doc.add_heading("7.2 Nguồn dữ liệu", level=2)
add_table(doc,
    ["Nguồn", "Dữ liệu có thể cung cấp", "Quy tắc sử dụng"],
    [
        ["Module 1", "Định danh, triệu chứng tự khai, tiền sử, thuốc, dị ứng, summary trước khám, red-flag và review điều dưỡng", "Hiển thị đúng nguồn và trạng thái; không coi dữ liệu tự khai là đã được bác sĩ xác nhận"],
        ["Module 2", "Transcript, audio, summary buổi khám, nội dung bác sĩ sửa, evidence và trạng thái xác nhận", "Ưu tiên nội dung đã xác nhận; Draft chỉ dùng khi bác sĩ chủ động chọn"],
        ["HIS/EMR", "Patient, encounter, chẩn đoán, thuốc, xét nghiệm, hình ảnh, y lệnh và hồ sơ trước", "Kiểm tra quyền, thời điểm và mapping; không coi dữ liệu cũ là form hiện tại"],
        ["Bác sĩ", "Voice, text, nhập trực tiếp và tài liệu đính kèm", "Ghi provenance và thời điểm; file là dữ liệu không tin cậy đối với prompt"],
        ["Module 3", "Tài liệu và phiên bản đã lưu trước đó", "Chỉ dùng đúng patient, episode, encounter và trạng thái được phép"],
    ], [1.1, 3.0, 2.7], 8.5)

doc.add_heading("7.3 Thứ tự ưu tiên đề xuất", level=2)
doc.add_paragraph("Thứ tự dưới đây là đề xuất, chưa phải Business Rule chính thức:")
for idx, item in enumerate([
    "Nội dung được bác sĩ xác nhận trong encounter hiện tại.",
    "Dữ liệu chính thức, mới nhất từ HIS/EMR.",
    "Kết quả Module 2 đã được bác sĩ xác nhận.",
    "Kết quả Module 1 đã được điều dưỡng review.",
    "Dữ liệu bệnh nhân tự khai hoặc nội dung Draft.",
    "Tài liệu và ghi chú tham khảo do người dùng bổ sung.",
], start=1):
    add_number(doc, item, idx)
doc.add_paragraph("Khi các nguồn mâu thuẫn, hệ thống phải hiển thị mâu thuẫn cho bác sĩ thay vì tự chọn một giá trị mà không giải thích.")

doc.add_heading("8 Phân tích đối thủ cạnh tranh", level=1)
competitors = [
    ("Microsoft Dragon Copilot", "Đối thủ trực tiếp", "Ambient recording, dictation, voice command, prompt, note, order, review, versioning và EHR integration.", "Mạnh về giọng nói, workflow và triển khai doanh nghiệp.", "Khả năng sử dụng lịch sử EHR phụ thuộc cấu hình và loại phiên; sản phẩm không chuyên biệt cho biểu mẫu Việt Nam."),
    ("Oracle Health AI Agents", "Đối thủ trực tiếp trong hệ sinh thái EHR", "Tóm tắt chart, draft note và order, đọc patient history, hỗ trợ inpatient, outpatient, emergency và nursing voice capture.", "Tích hợp sâu với Oracle Health EHR.", "Phụ thuộc mạnh vào nền tảng Oracle; khó áp dụng trực tiếp cho nhiều HIS Việt Nam."),
    ("Abridge", "Đối thủ trực tiếp về inpatient documentation", "Ambient capture, structured note, inpatient progress note, prior-note context, orders và Linked Evidence.", "Mạnh về progress note, longitudinal context và provenance.", "Thiên về Epic và các thị trường đã có hạ tầng EHR trưởng thành."),
    ("Suki Assistant", "Đối thủ lân cận", "Patient summary, chart Q&A, voice pre-charting, ambient documentation, voice editing, order staging và EHR sync.", "Bao phủ workflow trước, trong và sau buổi khám.", "Tập trung trợ lý rộng; chưa xác minh mức phù hợp với biểu mẫu điều trị Việt Nam."),
    ("Nabla", "Đối thủ lân cận và nền tảng nhúng", "Ambient documentation, dictation, EHR context, structured notes, chart và flowsheet export, iframe/API integration.", "Triển khai nhanh, hỗ trợ nhiều EHR và structured field mapping.", "Một số năng lực progress note nâng cao còn phụ thuộc roadmap và EHR."),
    ("FPT AI Scribe", "Đối thủ tiềm năng trong khu vực", "AI scribe và nhận diện thuật ngữ y khoa theo tài liệu công khai.", "Nhà cung cấp công nghệ Việt Nam, có khả năng triển khai dự án doanh nghiệp.", "Chưa đủ bằng chứng công khai về inpatient workflow, provenance, standalone clinical record và đồng bộ đa HIS."),
]
for name, category, capabilities, strength, gap in competitors:
    doc.add_heading(name, level=2)
    p = doc.add_paragraph()
    p.add_run("Phân loại: ").bold = True
    p.add_run(category)
    p = doc.add_paragraph()
    p.add_run("Chức năng nổi bật: ").bold = True
    p.add_run(capabilities)
    p = doc.add_paragraph()
    p.add_run("Điểm mạnh: ").bold = True
    p.add_run(strength)
    p = doc.add_paragraph()
    p.add_run("Khoảng trống so với mục tiêu MedVita: ").bold = True
    p.add_run(gap)

doc.add_heading("9 Ma trận năng lực cạnh tranh", level=1)
doc.add_paragraph("Quy ước: Đầy đủ là nguồn chính thức mô tả rõ quy trình; Một phần là có năng lực liên quan nhưng chưa phủ toàn bộ mục tiêu; Chưa xác minh là nguồn công khai chưa đủ.")
add_table(doc,
    ["Năng lực", "MedVita mục tiêu", "Dragon", "Oracle", "Abridge", "Suki", "Nabla"],
    [
        ["Clinical note", "Đầy đủ", "Đầy đủ", "Đầy đủ", "Đầy đủ", "Đầy đủ", "Đầy đủ"],
        ["Progress note nội trú", "Cốt lõi", "Có", "Có", "Mạnh", "Một phần", "Đang mở rộng"],
        ["Voice và dictation", "Đầy đủ", "Mạnh", "Có", "Ambient", "Mạnh", "Mạnh"],
        ["Text prompt", "Đầy đủ", "Có", "Có", "Một phần", "Có", "Một phần"],
        ["Dùng context EHR", "Tùy chọn", "Một phần", "Mạnh", "Mạnh", "Mạnh", "Mạnh"],
        ["Standalone", "Bắt buộc", "Có giới hạn", "Chủ yếu EHR", "Có ứng dụng", "Có", "Có"],
        ["Structured fields", "Cấu hình", "Có", "Có", "Có", "Có", "Mạnh"],
        ["Provenance", "Bắt buộc", "Một phần", "Chưa rõ", "Mạnh", "Chưa rõ", "Chưa rõ"],
        ["Review trước lưu", "Bắt buộc", "Có", "Có", "Có", "Có", "Có"],
        ["Versioning", "Bắt buộc", "Có", "Trong EHR", "Một phần", "Chưa rõ", "Chưa rõ"],
        ["Đa HIS", "Bắt buộc", "Nhiều EHR", "Oracle", "EHR đối tác", "Nhiều EHR", "Mạnh"],
        ["Context Module 1 và 2", "Khác biệt", "Không tương ứng", "Không tương ứng", "Không tương ứng", "Không tương ứng", "Không tương ứng"],
        ["Biểu mẫu Việt Nam", "Khác biệt", "Không chuyên biệt", "Không chuyên biệt", "Không chuyên biệt", "Không chuyên biệt", "Không chuyên biệt"],
        ["On-premise", "Định hướng", "Chưa xác minh", "Theo hệ sinh thái", "Chủ yếu cloud", "Chủ yếu cloud", "Chủ yếu cloud"],
    ], [1.55, 1.1, 0.82, 0.82, 0.82, 0.82, 0.87], 7.6)

doc.add_heading("10 Danh mục tính năng mục tiêu", level=1)
feature_groups = [
    ("F3-01", "Clinical Workspace", "Quản lý patient, Health Profile, encounter, episode, worklist và clinical documents độc lập với HIS.", "Must"),
    ("F3-02", "Phiếu Theo Dõi Điều Trị", "Tạo, chỉnh sửa, review và hoàn tất Diễn biến bệnh, Y lệnh và Ghi chú chăm sóc, dinh dưỡng.", "Must"),
    ("F3-03", "Context Hub", "Tập hợp và kiểm soát dữ liệu từ Module 1, Module 2, HIS/EMR, Module 3 và tài liệu bổ sung.", "Must"),
    ("F3-04", "AI Clinical Authoring", "Nhận text/voice, hiểu thao tác, tạo đề xuất, xác định field, hiển thị diff và evidence.", "Must"),
    ("F3-05", "Review và Finalization", "Chấp nhận, chỉnh sửa, từ chối, undo, lưu Draft và Finalize bởi người có thẩm quyền.", "Must"),
    ("F3-06", "Versioning và Amendment", "Lưu phiên bản, so sánh thay đổi, đính chính record đã Finalized và giữ lịch sử.", "Must"),
    ("F3-07", "Template Management", "Cấu hình loại tài liệu, section, field, rule bắt buộc và mapping theo bệnh viện/chuyên khoa.", "Should"),
    ("F3-08", "HIS/EMR Integration", "Nhận context, đọc dữ liệu, đồng bộ record, retry, đối soát và xử lý xung đột.", "Should"),
    ("F3-09", "Export và Collaboration", "PDF, chia sẻ nội bộ, quyền xem và sử dụng trong quy trình tiếp theo.", "Should"),
    ("F3-10", "Clinical Governance", "RBAC, provenance, audit, retention, monitoring và quality evaluation.", "Must"),
    ("F3-11", "Ambient Capture", "Ghi nhận trao đổi trong quá trình điều trị để chuẩn bị bản nháp.", "Could"),
    ("F3-12", "Clinical Q&A", "Hỏi đáp có nguồn trên dữ liệu bệnh nhân và tài liệu được chọn.", "Could"),
]
add_table(doc,
    ["ID", "Nhóm tính năng", "Mô tả", "Ưu tiên"],
    feature_groups, [0.65, 1.7, 3.75, 0.7], 8.5)

doc.add_heading("11 Phân tích khoảng cách", level=1)
add_table(doc,
    ["Khoảng cách", "Ảnh hưởng", "Đề xuất xử lý"],
    [
        ["Chưa có Clinical Workspace độc lập", "Không đạt mục tiêu không phụ thuộc HIS", "Xây patient, encounter, worklist và document repository trên MedVita"],
        ["Context chưa có provenance đầy đủ", "Bác sĩ khó kiểm chứng và AI có thể dùng sai nguồn", "Xây Context Hub và ghi nguồn cho từng lần sinh nội dung"],
        ["AI có thể xử lý sai Y lệnh", "Rủi ro an toàn lâm sàng", "Giữ ở Draft, chuẩn hóa có kiểm soát, bắt buộc review và chặn tự Finalize"],
        ["Chưa phân biệt đủ Draft và dữ liệu chính thức", "Có thể lưu hoặc sync ngoài ý muốn", "Tách Proposal, Form Draft, Finalized Record và Sync Transaction"],
        ["Chưa có versioning/amendment", "Khó truy vết thay đổi sau xác nhận", "Bổ sung immutable version và luồng đính chính"],
        ["Form đang hard-code", "Chi phí mở rộng theo bệnh viện cao", "Xây template và mapping framework"],
        ["Chưa có tiêu chuẩn chất lượng AI", "Không có cơ sở Go/No-Go", "Xây evaluation set, chỉ số và ngưỡng do chuyên môn duyệt"],
        ["Lỗi hiệu năng và session", "Gián đoạn công việc bác sĩ", "Đặt SLA, timeout, retry, cancel và manual fallback"],
    ], [1.85, 2.25, 2.7], 8.6)

doc.add_heading("12 Lộ trình phát triển", level=1)
doc.add_paragraph("Lộ trình được tổ chức theo release gate thay vì ngày cố định. Thời gian và sprint chỉ được chốt sau khi team ước lượng capacity và dependency kỹ thuật.")
roadmap = [
    ("Giai đoạn 0", "Chốt product model", "Patient, encounter, document lifecycle, quyền, retention, template và tiêu chuẩn AI", "Các quyết định nền tảng được PO, bác sĩ và bệnh viện phê duyệt"),
    ("Giai đoạn 1", "Ổn định MV-211", "Đóng bug Urgent/High; hoàn thiện Draft, Review, Finalize và Sync", "Phiếu Theo Dõi Điều Trị an toàn trên staging/pilot"),
    ("Giai đoạn 2", "Clinical Workspace độc lập", "Patient, Health Profile, encounter, worklist, document repository và PDF", "Hoàn tất luồng không cần HIS"),
    ("Giai đoạn 3", "Context Hub", "Kết nối Module 1, Module 2, HIS và tài liệu; provenance và conflict handling", "Bác sĩ kiểm soát context và truy được nguồn"),
    ("Giai đoạn 4", "AI Clinical Authoring", "Text/voice, intent, field mapping, diff, evidence, undo và fallback", "AI hỗ trợ soạn nhưng không tự tạo hồ sơ chính thức"),
    ("Giai đoạn 5", "Template và mở rộng tài liệu", "Biểu mẫu theo bệnh viện/chuyên khoa; thêm hội chẩn, tóm tắt bệnh án, giấy ra viện", "Mở rộng không cần hard-code từng form"),
    ("Giai đoạn 6", "Integration Framework", "Connector, mapping, sync, retry, reconciliation và monitoring", "Tích hợp được nhiều HIS với cùng core product"),
    ("Giai đoạn 7", "Scale và tối ưu", "Ambient capture, Clinical Q&A, phân tích sử dụng và tối ưu chất lượng", "Mở rộng khi core đã ổn định"),
]
add_table(doc,
    ["Giai đoạn", "Mục tiêu", "Phạm vi", "Điều kiện hoàn tất"],
    roadmap, [0.85, 1.35, 2.9, 1.7], 8.2)

doc.add_heading("13 Tiêu chuẩn chất lượng và release gate", level=1)
add_table(doc,
    ["Gate", "Điều kiện tối thiểu"],
    [
        ["Safety", "Không còn lỗi Urgent/High liên quan patient context, Y lệnh, field mapping, lưu hoặc đồng bộ ngoài ý muốn."],
        ["Clinical quality", "Đạt ngưỡng chính xác, đầy đủ và unsupported-claim rate do bác sĩ chuyên môn phê duyệt."],
        ["Human review", "Mọi nội dung AI có nhãn Draft, có thể sửa và không Finalize nếu thiếu xác nhận của người có quyền."],
        ["Data integrity", "Không lẫn patient/encounter; retry không tạo trùng; current form được dùng đúng phiên bản."],
        ["Evidence", "Các đề xuất quan trọng truy được nguồn, thời điểm và trạng thái nguồn."],
        ["Resilience", "AI hoặc HIS lỗi vẫn cho phép bác sĩ tiếp tục nhập, lưu và hoàn tất công việc phù hợp."],
        ["Security", "RBAC, audit, dữ liệu nhạy cảm, secret và log được kiểm tra trước pilot."],
        ["UAT", "Bác sĩ và bệnh viện hoàn tất UAT trên dữ liệu và quy trình đại diện."],
    ], [1.35, 5.45], 9)

doc.add_heading("14 AI guardrail và quản trị lâm sàng", level=1)
doc.add_heading("14.1 Ranh giới của AI", level=2)
for item in [
    "AI được phép ghi nhận, trích xuất, tóm tắt, chuẩn hóa hình thức và soạn bản nháp.",
    "AI không tự chẩn đoán, quyết định điều trị, kê đơn, ký bệnh án hoặc xác nhận thay bác sĩ.",
    "AI không tự đồng bộ dữ liệu sang HIS hoặc chia sẻ ra ngoài khi chưa có hành động được phép.",
    "Khi không chắc chắn, AI phải nói rõ và yêu cầu bác sĩ kiểm tra; không được tỏ ra đã hoàn tất.",
]:
    add_bullet(doc, item)

doc.add_heading("14.2 Kiểm soát theo lớp", level=2)
add_table(doc,
    ["Lớp", "Kiểm soát"],
    [
        ["Input", "Xác thực patient/encounter, quyền truy cập, loại dữ liệu; coi file và dữ liệu ngoài là dữ liệu không tin cậy."],
        ["Model", "Giới hạn phạm vi, tool theo quyền tối thiểu, không làm theo chỉ dẫn nằm trong context."],
        ["Output", "Kiểm tra schema, field, source, nội dung thuốc/liều, PII và trạng thái Draft."],
        ["Action", "Diff, preview và explicit confirmation trước khi cập nhật form, Finalize hoặc Sync."],
        ["Human", "Bác sĩ review; quy trình escalation khi dữ liệu thiếu, mâu thuẫn hoặc có nguy cơ."],
        ["Operations", "Audit, monitoring, incident review và kill switch theo tính năng/model."],
    ], [1.1, 5.7], 9)

doc.add_heading("15 Chỉ số đánh giá", level=1)
doc.add_paragraph("Tài liệu không tự đặt ngưỡng. PO và chuyên môn cần chốt ngưỡng theo mức rủi ro của từng loại nội dung.")
add_table(doc,
    ["Nhóm", "Chỉ số gợi ý"],
    [
        ["Hiệu quả", "Thời gian hoàn thiện tài liệu; thời gian nhập tay; số thao tác; tỷ lệ hoàn tất trong ca làm việc."],
        ["Chấp nhận", "Tỷ lệ bác sĩ sử dụng lại; tỷ lệ đề xuất được chấp nhận; mức độ chỉnh sửa; đánh giá hữu ích."],
        ["Chất lượng", "Unsupported claims; bỏ sót; sai field; sai thuốc/liều/đơn vị; độ đầy đủ theo section."],
        ["An toàn", "Số lần lẫn patient/encounter; dùng sai phiên bản; Finalize/Sync sai quy trình; sự cố dữ liệu."],
        ["Vận hành", "Độ trễ; timeout; availability; tỷ lệ retry; tỷ lệ lỗi session; tỷ lệ fallback thủ công."],
        ["Tích hợp", "Tỷ lệ sync thành công; trùng dữ liệu; thời gian đối soát; lỗi mapping."],
        ["Governance", "Tỷ lệ proposal có provenance; audit đầy đủ; amendment đúng quy trình; truy cập sai quyền."],
    ], [1.3, 5.5], 9)

doc.add_heading("16 Rủi ro và biện pháp kiểm soát", level=1)
risks = [
    ("R1", "AI tạo nội dung lâm sàng không có trong nguồn", "Cao", "Evidence grounding, output validation, human review và evaluation set"),
    ("R2", "Sai patient hoặc encounter", "Rất cao", "Context lock, identity check, visible patient banner và cross-session isolation"),
    ("R3", "Y lệnh sai thuốc, liều hoặc đơn vị", "Rất cao", "Draft only, structured validation, explicit doctor confirmation và giới hạn scope"),
    ("R4", "Dùng dữ liệu cũ thay vì form hiện tại", "Cao", "Current-form snapshot, version ID và conflict detection"),
    ("R5", "Prompt injection từ file hoặc HIS", "Cao", "Tách instruction và data, sanitization, restricted tools và attack tests"),
    ("R6", "Phụ thuộc tích hợp HIS", "Trung bình", "Standalone core, connector abstraction và safe fallback"),
    ("R7", "Mỗi bệnh viện có biểu mẫu khác", "Cao", "Template engine, mapping configuration và versioned schema"),
    ("R8", "Chi phí và độ trễ AI", "Trung bình", "Caching phù hợp, giới hạn context, monitoring và model routing"),
    ("R9", "Truy cập dữ liệu vượt phạm vi", "Rất cao", "RBAC, relationship-based access, audit và minimum necessary"),
    ("R10", "Không được bác sĩ chấp nhận", "Cao", "Pilot có giám sát, đo edit burden, đào tạo và cải tiến theo feedback"),
]
add_table(doc, ["ID", "Rủi ro", "Mức", "Kiểm soát"], risks, [0.48, 2.35, 0.75, 3.22], 8.3)

doc.add_heading("17 Dependency và quyết định cần chốt", level=1)
doc.add_heading("17.1 Dependency", level=2)
for item in [
    "Module 1 cung cấp Health Profile, dữ liệu tự khai, trạng thái review và quyền sử dụng phù hợp.",
    "Module 2 cung cấp transcript, summary, evidence và trạng thái xác nhận ổn định.",
    "Bệnh viện cung cấp biểu mẫu, quy trình xác nhận, quyền và dữ liệu test đại diện.",
    "Đội HIS thống nhất authentication, API, mapping, lỗi và đối soát.",
    "Bác sĩ chuyên môn tham gia xây evaluation set và duyệt guardrail.",
    "Hạ tầng đáp ứng mô hình cloud hoặc on-premise và yêu cầu bảo vệ dữ liệu.",
]:
    add_bullet(doc, item)

doc.add_heading("17.2 Quyết định cần chốt", level=2)
decisions = [
    "Module 3 là hệ thống lưu hồ sơ chính thức hay lưu bản làm việc trước khi gửi HIS?",
    "Ai có quyền Finalize từng loại tài liệu?",
    "Điều dưỡng được tạo và chỉnh sửa những tài liệu hoặc field nào?",
    "Y lệnh AI chỉ ghi nhận nguyên văn hay được phép chuẩn hóa tên thuốc và liều?",
    "Những dữ liệu nào từ Module 1 và Module 2 được tự động thêm làm context?",
    "Khi dữ liệu MedVita và HIS mâu thuẫn, quy trình xử lý là gì?",
    "Chính sách lưu trữ, xóa, legal hold và amendment là gì?",
    "Mô hình triển khai cloud, on-premise hay hybrid?",
    "Loại bệnh án thứ hai sau Phiếu Theo Dõi Điều Trị là gì?",
    "Ngưỡng chất lượng nào cho phép pilot và điều kiện nào buộc rollback?",
]
for idx, item in enumerate(decisions, start=1):
    add_number(doc, item, idx)

doc.add_heading("18 Đề xuất hành động tiếp theo", level=1)
next_steps = [
    ("1", "Cập nhật MV-211", "Đưa mục tiêu standalone, Context Hub, document lifecycle và boundary AI vào nguồn Jira chính thức."),
    ("2", "Tạo Epic nền tảng Standalone", "Quản lý patient, encounter, worklist và clinical document repository."),
    ("3", "Tạo Epic Context Hub", "Định nghĩa contract dữ liệu Module 1, Module 2, HIS và provenance."),
    ("4", "Đóng blocker MV-211", "Ưu tiên toàn bộ bug Urgent/High trước khi mở rộng."),
    ("5", "Workshop chuyên môn", "Chốt template Phiếu Theo Dõi Điều Trị, Y lệnh, quyền và tiêu chuẩn chất lượng."),
    ("6", "Xây evaluation set", "Tạo bộ ca tiếng Việt có thuốc, liều, context mâu thuẫn, nhiều lượt và nhiều khoa."),
    ("7", "Thiết kế pilot", "Chọn khoa, nhóm bác sĩ, dữ liệu, monitoring, support và rollback."),
]
add_table(doc, ["Thứ tự", "Hành động", "Kết quả"], next_steps, [0.65, 1.75, 4.4], 8.8)

doc.add_heading("19 Nguồn tham khảo", level=1)
sources = [
    ("Jira MV-211", "https://trivitaai.atlassian.net/browse/MV-211"),
    ("Microsoft Dragon Copilot documentation", "https://learn.microsoft.com/en-us/industry/healthcare/dragon-copilot/"),
    ("Microsoft Dragon Copilot workflow", "https://support.microsoft.com/en-gb/dragon-copilot/physicians/get-started-with-microsoft-dragon-copilot"),
    ("Oracle Health AI Agents", "https://www.oracle.com/health/clinical-suite/ai-agents/"),
    ("Abridge product", "https://www.abridge.com/product"),
    ("Abridge Inside for Inpatient", "https://www.abridge.com/press-release/abridge-inside-for-inpatient-and-outpatient-orders"),
    ("Suki Assistant", "https://www.suki.ai/clinicians/"),
    ("Nabla EHR Integration", "https://nabla.com/ehr"),
    ("Nabla Dictation", "https://nabla.com/dictation"),
    ("FPT AI Scribe", "https://fptsoftware.com/pages/-/media/Project/FPT%20Software/Global/sustainability-report/FPT_AI%20Scribe_Transforming%20Healthcare"),
]
for idx, (label, url) in enumerate(sources, start=1):
    p = doc.add_paragraph()
    p.add_run(f"{idx}. {label}: ")
    add_hyperlink(p, url, url)

doc.add_paragraph()
p = doc.add_paragraph()
p.add_run("Ghi chú cuối. ").bold = True
p.add_run("Các phần roadmap, thứ tự ưu tiên, mô hình dữ liệu và guardrail trong tài liệu là đề xuất sản phẩm. Chúng chỉ trở thành requirement chính thức sau khi được cập nhật vào Jira hoặc tài liệu được PO, chuyên môn và stakeholder có thẩm quyền phê duyệt.")

# Keep table rows together where possible and set all table font explicitly.
for table in doc.tables:
    for row in table.rows:
        for cell in row.cells:
            for paragraph in cell.paragraphs:
                paragraph.paragraph_format.keep_together = True
                for run in paragraph.runs:
                    run.font.name = "Arial"
                    run._element.rPr.rFonts.set(qn("w:ascii"), "Arial")
                    run._element.rPr.rFonts.set(qn("w:hAnsi"), "Arial")

# Prevent headings from being stranded.
for paragraph in doc.paragraphs:
    if paragraph.style.name.startswith("Heading"):
        paragraph.paragraph_format.keep_with_next = True

doc.core_properties.title = "MedVita Module 3 Product Discovery và Lộ trình phát triển"
doc.core_properties.subject = "Phân tích sản phẩm, đối thủ, tính năng và roadmap Module 3"
doc.core_properties.author = "MedVita Product Team"
doc.core_properties.keywords = "MedVita, Module 3, Product Discovery, Clinical Documentation, EHR, HIS, AI"
doc.save(OUT)
print(OUT.resolve())
