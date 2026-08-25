/**
 * Lấy nhanh thuộc tính văn bản từ HTML tĩnh (không cần browser).
 *
 * vbpl.vn là app Next.js: phần khung trang (tiêu đề, JSON-LD) được render
 * sẵn trong HTML, nhưng riêng bảng "Thuộc tính" (Ngày có hiệu lực, Người ký,
 * Chức danh, Ngành, Lĩnh vực...) được load bằng JS sau khi trang hydrate,
 * nên KHÔNG có trong HTML thô. Script này chỉ lấy được các trường có sẵn
 * trong khối <script type="application/ld+json" ... @type":"Legislation">.
 *
 * Muốn lấy đủ toàn bộ bảng thuộc tính như trong ảnh -> dùng detail-full.js
 * (Puppeteer, render trang thật).
 *
 * npm install axios cheerio
 */
const axios = require('axios');
const cheerio = require('cheerio');

async function fetchLiteAttributes(url) {
  const { data: html } = await axios.get(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8',
    },
    timeout: 20000,
  });

  const $ = cheerio.load(html);

  // h1 chỉ xuất hiện sau khi trang hydrate, HTML tĩnh không có -> lấy title
  // từ og:title (đã được server render sẵn cho SEO).
  const title = $('meta[property="og:title"]').attr('content')?.trim() || null;

  let legislation = null;
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).contents().text());
      if (json['@type'] === 'Legislation') legislation = json;
    } catch (_) {
      /* ignore malformed blocks */
    }
  });

  return {
    url,
    title,
    soHieu: legislation?.legislationIdentifier ?? null,
    loaiVanBan: legislation?.legislationType ?? null,
    ngayBanHanh: legislation?.legislationDate ?? null,
    coQuanBanHanh: legislation?.legislationPassedBy?.name ?? null,
    // Trường này là "tình trạng pháp lý" tổng quát của schema.org (InForce/NotInForce...),
    // KHÔNG phải đúng nhãn "Tình trạng hiệu lực" hiển thị trên UI — cần detail-full.js để lấy đúng.
    legislationLegalForce: legislation?.legislationLegalForce ?? null,
  };
}

if (require.main === module) {
  const url =
    process.argv[2] ||
    'https://vbpl.vn/van-ban/chi-tiet/thong-tu-so-26-2026-tt-nhnn-quy-dinh-cac-gioi-han-ty-le-bao-dam-an-toan-trong-hoat-dong-cua-ngan-hang-phat-trien-viet-nam--a9cd9430-710a-11f1-ae81-c57414013587?tabs=thuoc-tinh';

  fetchLiteAttributes(url)
    .then((data) => console.log(JSON.stringify(data, null, 2)))
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}

module.exports = { fetchLiteAttributes };
