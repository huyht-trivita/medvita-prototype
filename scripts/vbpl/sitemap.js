/**
 * Lấy toàn bộ URL trang chi tiết văn bản từ sitemap.xml của vbpl.vn.
 *
 * https://vbpl.vn/sitemap.xml là 1 sitemap index, trỏ tới ~36 sitemap con
 * (https://vbpl.vn/sitemap/0.xml ... 35.xml), mỗi sitemap con chứa tối đa
 * 5000 URL. Hầu hết URL khớp regex /van-ban/chi-tiet/<slug>.
 *
 * npm install axios fast-xml-parser
 */
const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');

const SITEMAP_INDEX_URL = 'https://vbpl.vn/sitemap.xml';
const DETAIL_URL_RE = /^https:\/\/vbpl\.vn\/van-ban\/chi-tiet\/.+/;

const parser = new XMLParser();

async function fetchXml(url) {
  const { data } = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    timeout: 30000,
  });
  return parser.parse(data);
}

// Sitemap con có thể có 0, 1, hoặc nhiều <url> - fast-xml-parser trả về
// object đơn (không phải array) khi chỉ có 1 phần tử, nên phải ép về array.
function toArray(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

async function fetchDetailUrls({ onProgress } = {}) {
  const index = await fetchXml(SITEMAP_INDEX_URL);
  const childSitemaps = toArray(index.sitemapindex?.sitemap).map((s) => s.loc);

  const urls = [];
  for (let i = 0; i < childSitemaps.length; i++) {
    const childUrl = childSitemaps[i];
    const xml = await fetchXml(childUrl);
    const entries = toArray(xml.urlset?.url);

    for (const entry of entries) {
      if (DETAIL_URL_RE.test(entry.loc)) {
        urls.push({ url: entry.loc, lastmod: entry.lastmod ?? null });
      }
    }

    onProgress?.(i + 1, childSitemaps.length, urls.length);
  }

  return urls;
}

if (require.main === module) {
  fetchDetailUrls({
    onProgress: (done, total, count) =>
      console.error(`[sitemap] ${done}/${total} sitemap con - ${count} URL chi-tiet`),
  })
    .then((urls) => console.log(JSON.stringify(urls, null, 2)))
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}

module.exports = { fetchDetailUrls, DETAIL_URL_RE };
