const { fetchLiteAttributes } = require('./detail-lite');
const { scrapeDetail } = require('./detail-full');

const url =
  process.argv[2] ||
  'https://vbpl.vn/van-ban/chi-tiet/thong-tu-so-26-2026-tt-nhnn-quy-dinh-cac-gioi-han-ty-le-bao-dam-an-toan-trong-hoat-dong-cua-ngan-hang-phat-trien-viet-nam--a9cd9430-710a-11f1-ae81-c57414013587?tabs=thuoc-tinh';

(async () => {
  console.log('--- lite (axios + cheerio, không cần browser) ---');
  console.log(JSON.stringify(await fetchLiteAttributes(url), null, 2));

  console.log('\n--- full (puppeteer, đầy đủ bảng Thuộc tính) ---');
  console.log(JSON.stringify(await scrapeDetail(url), null, 2));
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});