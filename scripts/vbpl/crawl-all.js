/**
 * Crawl toàn bộ văn bản trong sitemap.xml của vbpl.vn, lấy thuộc tính bằng
 * detail-lite.js (nhanh, không cần browser). Có thể đổi sang detail-full.js
 * nếu cần đủ trường (xem hàm `process` bên dưới).
 *
 * Đặc điểm:
 * - Tuần tự (không song song) + delay random (jitter) giữa các request,
 *   tránh gửi request đều tăm tắp dễ bị nhận diện là bot.
 * - Backoff cấp số khi gặp lỗi/nghi bị chặn, retry vài lần rồi bỏ qua
 *   (ghi log lỗi riêng) để 1 URL hỏng không chặn cả job.
 * - Resumable: ghi kết quả từng dòng vào output.jsonl ngay khi có, và khi
 *   chạy lại sẽ tự bỏ qua URL đã crawl xong.
 *
 * Chạy: node crawl-all.js
 * npm install axios cheerio fast-xml-parser
 */
const fs = require('fs');
const path = require('path');
const { fetchDetailUrls } = require('./sitemap');
const { fetchLiteAttributes } = require('./detail-lite');

const SITEMAP_CACHE_FILE = path.join(__dirname, 'sitemap-urls.json');
const OUTPUT_FILE = path.join(__dirname, 'output.jsonl');
const ERROR_LOG_FILE = path.join(__dirname, 'errors.log');

const MIN_DELAY_MS = 2000;
const MAX_DELAY_MS = 5000;
const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 10_000; // lần retry đầu chờ ~10s, sau đó nhân đôi

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const jitter = () => MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);

async function loadSitemapUrls() {
  if (fs.existsSync(SITEMAP_CACHE_FILE)) {
    console.error(`[cache] dùng lại ${SITEMAP_CACHE_FILE} (xoá file này nếu muốn lấy sitemap mới)`);
    return JSON.parse(fs.readFileSync(SITEMAP_CACHE_FILE, 'utf8'));
  }

  const urls = await fetchDetailUrls({
    onProgress: (done, total, count) =>
      console.error(`[sitemap] ${done}/${total} sitemap con - ${count} URL chi-tiet`),
  });
  fs.writeFileSync(SITEMAP_CACHE_FILE, JSON.stringify(urls, null, 2));
  return urls;
}

function loadDoneUrls() {
  if (!fs.existsSync(OUTPUT_FILE)) return new Set();
  const lines = fs.readFileSync(OUTPUT_FILE, 'utf8').split('\n').filter(Boolean);
  const done = new Set();
  for (const line of lines) {
    try {
      done.add(JSON.parse(line).url);
    } catch (_) {
      /* dòng lỗi/dở dang, bỏ qua */
    }
  }
  return done;
}

function appendResult(record) {
  fs.appendFileSync(OUTPUT_FILE, JSON.stringify(record) + '\n');
}

function logError(url, message) {
  fs.appendFileSync(ERROR_LOG_FILE, `${new Date().toISOString()}\t${url}\t${message}\n`);
}

async function crawlOne(url) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fetchLiteAttributes(url);
    } catch (err) {
      const isLastAttempt = attempt === MAX_RETRIES;
      console.error(`  [lỗi] ${url} (lần ${attempt + 1}/${MAX_RETRIES + 1}): ${err.message}`);
      if (isLastAttempt) throw err;
      await sleep(BASE_BACKOFF_MS * 2 ** attempt);
    }
  }
}

async function main() {
  const allUrls = await loadSitemapUrls();
  const done = loadDoneUrls();
  const remaining = allUrls.filter((u) => !done.has(u.url));

  console.error(`Tổng: ${allUrls.length} URL, đã xong: ${done.size}, còn lại: ${remaining.length}`);

  let processed = 0;
  for (const { url } of remaining) {
    try {
      const data = await crawlOne(url);
      appendResult(data);
      processed++;
      if (processed % 20 === 0) {
        console.error(`[progress] ${done.size + processed}/${allUrls.length}`);
      }
    } catch (err) {
      logError(url, err.message);
    }

    await sleep(jitter());
  }

  console.error(`Xong. Tổng đã crawl: ${done.size + processed}/${allUrls.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
