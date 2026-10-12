/* Mở từng route bằng Chrome headless và kiểm nội dung đã render. */
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const assert = require('node:assert/strict');

function findBrowser() {
  if (process.env.CHROME) return process.env.CHROME;
  const cache = path.join(os.homedir(), 'Library/Caches/ms-playwright');
  if (fs.existsSync(cache)) {
    for (const dir of fs.readdirSync(cache).filter((d) => d.startsWith('chromium_headless_shell-')).sort().reverse()) {
      const root = path.join(cache, dir);
      for (const sub of fs.readdirSync(root)) {
        const bin = path.join(root, sub, 'chrome-headless-shell');
        if (fs.existsSync(bin)) return bin;
      }
    }
  }
  const app = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  return fs.existsSync(app) ? app : null;
}

const BROWSER = findBrowser();
if (!BROWSER) {
  console.log('SKIP render tests: không tìm thấy Chrome (đặt biến CHROME=<đường dẫn>)');
  process.exit(0);
}
const FILE = process.env.M3_FILE || 'module3/index.html';
const base = 'file://' + path.resolve(FILE);

// Chrome đầy đủ đôi khi không tự thoát sau --dump-dom: đọc tới </html> rồi dừng tiến trình.
function dump(url) {
  return new Promise((resolve, reject) => {
    const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'm3-render-'));
    const args = ['--disable-gpu', '--no-first-run', '--no-default-browser-check', '--user-data-dir=' + profile, '--virtual-time-budget=4000', '--dump-dom', url];
    if (!BROWSER.endsWith('chrome-headless-shell')) args.unshift('--headless=new');
    const child = spawn(BROWSER, args, { stdio: ['ignore', 'pipe', 'ignore'] });
    let out = '';
    let done = false;
    const finish = (err) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      child.kill();
      if (err) reject(err);
      else resolve(out);
    };
    const timer = setTimeout(() => finish(new Error('timeout')), 60000);
    child.stdout.on('data', (d) => {
      out += d;
      if (out.includes('</html>')) finish();
    });
    child.on('exit', () => {
      finish();
      try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 3 }); } catch (e) { /* thư mục tạm, bỏ qua */ }
    });
  });
}

// [query, hash, chuỗi phải có]
const CASES = [
  ['', '#/login', ['Đăng nhập', 'bs.phcn', 'Bệnh viện Đa khoa Demo']],
  ['?as=bs.phcn', '#/board', ['Bảng quản lý điều trị', 'Nguyễn Văn Hùng', 'Hoàng Gia Bảo', 'Chạy độc lập', 'Bảng demo']],
  ['?as=bs.noi', '#/board', ['Đỗ Văn Thắng', 'Nội tổng hợp', 'Bùi Đức Long']],
  ['?as=bs.phcn', '#/episode/E01/sheet/2026-10-11', ['TỜ ĐIỀU TRỊ', 'Dựng từ tờ 10/10', 'Trợ lý AI MedVita', 'Ngày 7']],
  ['?as=bs.phcn', '#/episode/E01/sheet/2026-10-10', ['Đã xác nhận lúc', 'Sửa tiếp (tạo phiên bản mới)', 'Đã xuất']],
  ['?as=bs.phcn', '#/episode/E02/sheet/2026-10-11', ['Bản nháp AI — chưa duyệt', 'Pregabalin 75 mg']],
  ['?as=bs.phcn', '#/episode/E05/sheet/2026-10-11', ['Bệnh nhân mới, chưa có tờ trước']],
  ['?as=dd.phcn', '#/episode/E01/sheet/2026-10-11', ['Điều dưỡng sửa ô Chăm sóc', 'Chỉ xem']],
  ['?as=bs.noi', '#/episode/E06/sheet/2026-10-11', ['Đỗ Văn Thắng', 'Dựng từ tờ 10/10']],
  ['?as=bs.phcn', '#/intake', ['Tạo bệnh nhân / đợt điều trị', 'Dùng tài liệu mẫu', 'Lấy từ HIS — tùy chọn']],
  ['?as=bs.phcn', '#/episode/E01/sources', ['Ghi âm đi buồng 11/10 07:40', 'Có thêm 2 nguồn từ tích hợp tùy chọn']],
  ['?as=bs.phcn', '#/episode/E02/sources', ['Đọc chính tả Y lệnh 11/10 08:15', 'Đang dùng ở:', 'Tờ 11/10 · Y lệnh']],
  ['?as=bs.phcn', '#/episode/E01/history', ['Nhật ký thao tác', 'Xác nhận tờ điều trị', 'Tờ điều trị 10/10']],
  ['?as=bs.phcn', '#/episode/E01/record', ['Bệnh án Phục hồi chức năng', 'AI soạn nháp các trường trống', 'VIII. Mục tiêu và kế hoạch PHCN', 'Bác sĩ nhập', 'Gợi ý mã']],
  ['?as=bs.phcn', '#/episode/E03/record', ['Đã xác nhận cuối lúc', 'Sửa tiếp']],
  ['?as=dd.phcn', '#/episode/E01/record', ['Xác nhận phần này']],
  ['?as=admin', '#/admin/templates', ['Cấu hình mẫu bệnh án', 'Lịch sử phiên bản mẫu', 'Chưa cấu hình', 'PHCN.LG.03']],
  ['?as=bs.phcn', '#/episode/E03/discharge', ['Sắp ra viện. Hoàn tất khi', 'Tổng kết bệnh án', 'AI soạn nháp các trường trống']],
  ['?as=bs.phcn', '#/episode/E01/discharge', ['Tờ điều trị tổng hợp', '6 ngày điều trị', 'Đánh dấu sắp ra viện']],
  ['?as=admin', '#/admin/integrations', ['Tích hợp (tùy chọn)', 'Bật tích hợp HIS / EMR', 'Mở Module 3 từ HIS']],
  ['?as=dd.phcn', '#/nursing', ['Phiếu chăm sóc điều dưỡng', 'Bắt đầu đọc sinh hiệu']],
  ['?as=tk.phcn', '#/reports', ['Báo cáo sử dụng và chất lượng', 'Số liệu demo', 'KPI-01']],
  ['?as=bs.phcn', '#/m/ward', ['Đi buồng', 'Buồng P201', 'Nguyễn Văn Hùng']],
  ['?as=bs.phcn', '#/m/patient/E01', ['Người bệnh / người nhà đồng ý ghi âm', 'Bản ghi hôm nay']],
  // cases:end
];

(async () => {
  let failed = 0;
  for (const [query, hash, expects] of CASES) {
    const name = FILE + (query || ' (chưa đăng nhập)') + ' ' + hash;
    try {
      // Bỏ <script>/<style> (bản gộp inline toàn bộ code) để chỉ kiểm phần đã render.
      const html = (await dump(base + query + hash)).replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '');
      assert.doesNotMatch(html, /Lỗi hiển thị|Không tìm thấy trang/, 'màn lỗi');
      for (const e of expects) assert.ok(html.includes(e), 'thiếu: ' + e);
      console.log('PASS ' + name);
    } catch (error) {
      failed++;
      console.error('FAIL ' + name);
      console.error(error.message);
    }
  }
  if (failed) process.exit(1);
})();
