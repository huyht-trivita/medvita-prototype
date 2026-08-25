/**
 * Lấy đầy đủ bảng "Thuộc tính" của 1 trang chi tiết văn bản trên vbpl.vn,
 * đúng các trường như trong ảnh: Số hiệu, Loại văn bản, Ngành, Ngày ban hành,
 * Lĩnh vực, Ngày có hiệu lực, Tình trạng hiệu lực, Ngày hết hiệu lực,
 * Cơ quan ban hành, Chức danh, Người ký.
 *
 * Vì bảng này được render bằng JS phía client (không có trong HTML tĩnh -
 * đã kiểm chứng bằng cách curl trực tiếp và không thấy các trường này),
 * cần dùng headless browser để trang hydrate xong rồi mới đọc DOM.
 *
 * Cách lấy value: các cặp nhãn/giá trị trên trang này luôn là 2 phần tử
 * anh-em liền kề (label rồi tới value), giống pattern đã thấy ở phần footer
 * của trang ("Đơn vị chủ quản" -> <p>...</p><p class="font-bold">...</p>).
 * Nếu vbpl.vn đổi cấu trúc DOM, chỉnh lại hàm `extractAttributes` bên dưới
 * (mở DevTools > chọn 1 label > xem parent/sibling thực tế).
 *
 * npm install puppeteer
 */
const puppeteer = require('puppeteer');

const FIELD_LABELS = [
  'Số hiệu',
  'Loại văn bản',
  'Ngành',
  'Ngày ban hành',
  'Lĩnh vực',
  'Ngày có hiệu lực',
  'Tình trạng hiệu lực',
  'Ngày hết hiệu lực',
  'Cơ quan ban hành',
  'Chức danh',
  'Người ký',
];

async function scrapeDetail(url) {
  // channel: 'chrome' dùng Google Chrome đã cài sẵn trên máy (thay vì bản
  // "Chrome for Testing" mà puppeteer tự tải) - tránh lỗi kiến trúc/ký số
  // kiểu "spawn Unknown system error -88" khi bản tải về không khớp.
  // --no-sandbox: cần khi chạy trên server Linux dưới quyền root (VPS/Docker/CI),
  // vì sandbox của Chrome yêu cầu quyền mà container/root thường không có sẵn.
  const browser = await puppeteer.launch({
    headless: 'new',
    channel: 'chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    );

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // URL đã có ?tabs=thuoc-tinh, nhưng vẫn click thêm cho chắc phòng trường
    // hợp tab "Thuộc tính" cần 1 lần click để trigger fetch dữ liệu.
    await page.evaluate(() => {
      const tab = [...document.querySelectorAll('button, a, div[role="tab"]')].find(
        (el) => el.textContent.trim() === 'Thuộc tính'
      );
      if (tab) tab.click();
    });

    await page.waitForFunction(() => document.body.innerText.includes('Số hiệu'), {
      timeout: 30000,
    });

    const title = await page
      .$eval('h1', (el) => el.textContent.trim())
      .catch(() => null);

    const attributes = await page.evaluate((labels) => {
      const norm = (s) => s.replace(/\s+/g, ' ').replace(/:\s*$/, '').trim();

      // Chỉ xét node "lá" (không chứa element con) để tránh match nhầm
      // 1 khối cha bao luôn cả label+value.
      const leafNodes = Array.from(document.querySelectorAll('body *')).filter(
        (el) => el.children.length === 0 && el.textContent.trim().length > 0
      );

      const result = {};
      for (const label of labels) {
        const labelEl = leafNodes.find((el) => norm(el.textContent) === label);
        if (!labelEl) {
          result[label] = null;
          continue;
        }

        // Ưu tiên phần tử anh-em kế tiếp; nếu không có/rỗng thì thử phần tử
        // kế tiếp trong cùng parent của parent (fallback cho layout lồng nhau).
        let valueEl = labelEl.nextElementSibling;
        if (!valueEl || !valueEl.textContent.trim()) {
          valueEl = labelEl.parentElement?.nextElementSibling ?? null;
        }

        result[label] = valueEl ? norm(valueEl.textContent) : null;
      }
      return result;
    }, FIELD_LABELS);

    return { url, title, attributes };
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  const url =
    process.argv[2] ||
    'https://vbpl.vn/van-ban/chi-tiet/thong-tu-so-26-2026-tt-nhnn-quy-dinh-cac-gioi-han-ty-le-bao-dam-an-toan-trong-hoat-dong-cua-ngan-hang-phat-trien-viet-nam--a9cd9430-710a-11f1-ae81-c57414013587?tabs=thuoc-tinh';

  scrapeDetail(url)
    .then((data) => console.log(JSON.stringify(data, null, 2)))
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}

module.exports = { scrapeDetail };
