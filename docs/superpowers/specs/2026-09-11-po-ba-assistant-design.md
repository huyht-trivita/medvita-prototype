# PO/BA Assistant Skill Design

## Mục tiêu

Tạo một Agent Skill dùng trong project `medvita-prototype`, hỗ trợ các công việc PO/BA thường xuyên và dùng chung một source cho Codex lẫn Claude Code.

## Phạm vi

Skill hỗ trợ năm nhóm công việc:

1. Viết và review Jira Epic, Story, Task, Bug.
2. Product discovery, competitor research và feature matrix.
3. Phân tích quy trình, integration flow và exception flow.
4. Healthcare BA cho MedVita, HIS, EMR/EHR và AI clinical documentation.
5. Daily/weekly report và stakeholder communication.

Skill không tự ý gọi API, sửa Jira/Confluence hoặc gửi thông báo nếu người dùng chưa yêu cầu hành động đó.

## Cấu trúc

```text
medvita-prototype/
├── .agents/
│   └── skills/
│       └── po-ba-assistant/
│           ├── SKILL.md
│           └── references/
│               ├── jira-requirements.md
│               ├── product-discovery.md
│               ├── process-analysis.md
│               ├── healthcare-ba.md
│               └── reporting.md
└── .claude/
    └── skills/
        └── po-ba-assistant -> ../../.agents/skills/po-ba-assistant
```

`.agents/skills/po-ba-assistant` là source duy nhất. `.claude/skills/po-ba-assistant` là symbolic link tương đối để repository vẫn portable khi đổi vị trí trên máy.

## Routing

`SKILL.md` chỉ chứa nguyên tắc chung, bảng nhận diện loại yêu cầu và đường dẫn tới reference cần đọc. Agent chỉ đọc reference liên quan đến yêu cầu hiện tại để giảm context.

| Yêu cầu | Reference |
| --- | --- |
| Epic, Story, Task, Bug, Scope, AC, Business Rules | `jira-requirements.md` |
| Research, đối thủ, benchmark, matrix | `product-discovery.md` |
| User flow, workflow, API, deeplink, WebView, HIS integration | `process-analysis.md` |
| MedVita, HIS, EMR/EHR, dữ liệu và AI y tế | `healthcare-ba.md` |
| Daily/weekly report, progress, blocker, risk, milestone | `reporting.md` |

## Quy tắc output chung

- Trả lời bằng tiếng Việt, trừ khi người dùng yêu cầu ngôn ngữ khác.
- Giữ văn phong tự nhiên và hạn chế thay đổi câu chữ khi người dùng yêu cầu chỉnh nhẹ.
- Không bịa requirement, dữ liệu nghiên cứu, trạng thái dự án hoặc quyết định stakeholder.
- Nếu thiếu dữ liệu ảnh hưởng đáng kể đến kết quả, hỏi một câu ngắn mỗi lần.
- Tách dữ kiện đã biết, giả định và đề xuất khi chúng có thể bị nhầm lẫn.
- Ưu tiên bảng cho matrix và Mermaid cho flow có nhiều nhánh hoặc trạng thái.

## Bốn quy tắc Jira của người dùng

1. Scope được gom theo responsibility của team hoặc component thực hiện.
2. Acceptance Criteria tập trung vào kết quả mà QC có thể kiểm chứng.
3. Business Rules tách khỏi Acceptance Criteria và dùng mã rule khi đã có.
4. Nội dung phải nhất quán giữa title, scope, dependency, output và trạng thái dữ liệu; review impact tới ticket liên quan trước khi chốt.

## Kiểm thử

Việc tạo skill tuân theo RED–GREEN–REFACTOR:

1. Chạy các prompt đại diện khi chưa nạp skill và ghi lại baseline.
2. Tạo skill tối thiểu để sửa các lỗi quan sát được.
3. Chạy lại cùng prompt khi có skill.
4. Kiểm tra YAML frontmatter, routing, symlink và toàn bộ đường dẫn reference.
5. Chỉ commit bản hoàn chỉnh sau khi tất cả kiểm tra đạt.

Các scenario tối thiểu:

- Viết backend task tạo transcript và hai bản tóm tắt ở trạng thái Draft.
- Review một Acceptance Criteria đang mô tả implementation thay vì kết quả QC.
- Lập competitor matrix nhưng nguồn dữ liệu chưa đầy đủ.
- Thiết kế flow MedVita nhúng trong HIS với fallback.
- Tổng hợp weekly report mà không tự suy diễn tiến độ còn thiếu.

## Tiêu chí hoàn thành

- Codex tìm được skill tại `.agents/skills/po-ba-assistant/SKILL.md`.
- Claude Code tìm được cùng nội dung qua symlink trong `.claude/skills`.
- Không tồn tại bản copy thứ hai của skill.
- Mọi reference được link từ `SKILL.md` và tồn tại trên filesystem.
- Skill áp dụng đúng bốn quy tắc Jira và không tự tạo dữ kiện.
- Package được commit trong Git và có thể chép vào root của `medvita-prototype`.
