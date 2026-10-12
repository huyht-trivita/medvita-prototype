/* Kiểm cấu trúc và accessibility của prototype Module 3. */
const fs = require('node:fs');
const assert = require('node:assert/strict');

const read = (f) => fs.readFileSync(f, 'utf8');
const index = read('module3/index.html');
const ui = read('module3/js/core/ui.js');
const screenFiles = fs.readdirSync('module3/js/screens').map((f) => 'module3/js/screens/' + f);
const allJs = ['module3/js/app.js', 'module3/js/core/ui.js'].concat(screenFiles).map(read).join('\n');

const checks = [
  ['core scripts load before screens and app.js loads last', () => {
    const order = [...index.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
    const at = (f) => order.indexOf(f);
    assert.ok(at('js/core/domain.js') === 0);
    assert.ok(at('js/data/demo.js') < at('js/core/store.js'));
    assert.ok(at('js/core/store.js') < at('js/core/ui.js'));
    assert.ok(at('js/core/ui.js') < at('js/screens/login.js'));
    assert.equal(order[order.length - 1], 'js/app.js');
    assert.match(index, /M3\.app\.start\(\)/);
  }],
  ['modal controller has dialog semantics, focus trap and Escape', () => {
    assert.match(ui, /role: 'dialog'/);
    assert.match(ui, /'aria-modal': 'true'/);
    assert.match(ui, /'aria-labelledby'/);
    assert.match(ui, /e\.key === 'Escape'/);
    assert.match(ui, /function trapFocus\(/);
  }],
  ['toast is a polite live region', () => {
    assert.match(ui, /role: 'status'/);
    assert.match(ui, /'aria-live': 'polite'/);
  }],
  ['icon-only buttons have accessible names', () => {
    assert.doesNotMatch(allJs, /class: 'icon-btn'(?![^}]*'aria-label')/);
  }],
  ['reduced motion is supported', () => {
    assert.match(read('module3/css/app.css'), /prefers-reduced-motion: reduce/);
  }],
  ['localStorage access is guarded', () => {
    const store = read('module3/js/core/store.js');
    assert.match(store, /try \{[^}]*localStorage\.getItem/);
    assert.match(store, /try \{[^}]*localStorage\.setItem/);
    assert.match(store, /'m3-proto-v1'/);
  }],
  ['every script and stylesheet in index.html exists', () => {
    const files = [...index.matchAll(/<script src="([^"]+)"><\/script>/g), ...index.matchAll(/<link rel="stylesheet" href="(css\/[^"]+)">/g)].map((m) => 'module3/' + m[1]);
    assert.ok(files.length >= 20);
    for (const f of files) assert.ok(fs.existsSync(f), 'thiếu ' + f);
  }],
  ['every route points to a registered screen and every episode tab is registered', () => {
    const router = read('module3/js/core/router.js');
    const screens = [...router.matchAll(/\['\/[^']*', '([a-z]+)'\]/g)].map((m) => m[1]);
    assert.ok(screens.length >= 10);
    for (const s of new Set(screens)) assert.match(allJs, new RegExp('M3\\.screens\\.' + s + ' = '), 'chưa đăng ký màn ' + s);
    for (const t of ['sheet', 'record', 'sources', 'discharge', 'history']) assert.match(allJs, new RegExp('M3\\.tabs\\.' + t + ' = '), 'chưa đăng ký tab ' + t);
  }],
  ['AI content is never applied without review', () => {
    const sheet = read('module3/js/screens/sheet.js');
    const record = read('module3/js/screens/record.js');
    assert.match(sheet, /f\.aiPending = !o\.manual/);
    assert.match(sheet, /function askMode\(/);
    assert.match(sheet, /function checkThen\(/);
    assert.match(record, /f\.aiPending = true;/);
    assert.match(read('module3/js/core/domain.js'), /còn nội dung AI chưa duyệt/);
  }],
  ['root index links the new prototype and keeps the old one', () => {
    const root = read('index.html');
    assert.match(root, /href="module3\/index\.html"/);
    assert.match(root, /href="module3\.html"/);
    assert.match(root, /Module 3 — bản cũ \(mở từ HIS\)/);
  }],
  ['single-file build inlines every script and stylesheet', () => {
    const built = read('module3-v2.html');
    assert.doesNotMatch(built, /<script src=/);
    assert.doesNotMatch(built, /<link rel="stylesheet" href="css\//);
    const order = [...index.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
    for (const src of order) assert.ok(built.includes('/* ' + src + ' */'), 'thiếu ' + src);
    assert.match(built, /M3\.app\.start\(\)/);
  }],
  // checks:end
];

let failed = 0;
for (const [name, check] of checks) {
  try {
    check();
    console.log(`PASS ${name}`);
  } catch (error) {
    failed++;
    console.error(`FAIL ${name}`);
    console.error(error.message);
  }
}
if (failed) process.exit(1);
