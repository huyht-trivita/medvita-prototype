const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

function load(...files) {
  const ctx = { window: {}, console };
  vm.createContext(ctx);
  for (const f of files) vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f });
  return ctx.window.M3;
}
const j = (x) => JSON.parse(JSON.stringify(x));

const M3 = load('module3/js/core/domain.js');
const D = M3.domain;

const drugs = [
  { name: 'Baclofen', aliases: [], units: ['mg'], baseUnit: 'mg', maxSingle: 20, maxDaily: 80 },
  { name: 'Paracetamol', aliases: ['Acetaminophen'], units: ['mg', 'g'], baseUnit: 'mg', maxSingle: 1000, maxDaily: 4000 },
  { name: 'Ceftriaxone', aliases: [], units: ['g', 'mg'], baseUnit: 'mg', maxSingle: 2000, maxDaily: 4000 },
  { name: 'NaCl 0,9%', aliases: ['Natri clorid 0,9%'], units: ['ml'], baseUnit: 'ml', maxSingle: 1000, maxDaily: 3000 },
];

const template = {
  sections: [
    { id: 'a', title: 'A', fields: [{ id: 'x', label: 'X', required: true }, { id: 'y', label: 'Y', required: false }] },
    { id: 'b', title: 'B', fields: [{ id: 'z', label: 'Z', required: true }] },
  ],
};

const checks = [
  ['transitions follow the record lifecycle', () => {
    assert.equal(D.canTransition('empty', 'draft'), true);
    assert.equal(D.canTransition('draft', 'confirmed'), true);
    assert.equal(D.canTransition('empty', 'confirmed'), false);
    assert.equal(D.canTransition('sending', 'draft'), false);
    const doc = { status: 'confirmed' };
    D.transition(doc, 'sending');
    assert.equal(doc.status, 'sending');
    assert.throws(() => D.transition({ status: 'empty' }, 'exported'), /Không chuyển được/);
    assert.equal(D.isLocked('draft'), false);
    assert.equal(D.isLocked('awaiting_sign'), true);
  }],
  ['confirm is blocked by empty required fields and unreviewed AI content', () => {
    const b = D.blockersForConfirm(D.SHEET_FIELDS, {
      dienbien: { text: 'Ổn định.', aiPending: true },
      ylenh: { text: '   ' },
      chamsoc: { text: '' },
    });
    assert.deepEqual(j(b.map((x) => [x.fieldId, x.reason])), [['dienbien', 'ai_pending'], ['ylenh', 'required']]);
  }],
  ['order check flags single dose, daily dose, unit and unknown drug', () => {
    const r = D.checkOrders([
      'Baclofen 100 mg — 1 viên, uống, 08:00 và 20:00',
      'Baclofen 10 mg — 1 viên, uống, 3 lần/ngày',
      'Baclofen 20 mg — uống 08:00, 12:00, 16:00, 20:00, 22:00',
      'Paracetamol 1 g — uống, 4 lần/ngày',
      'Paracetamol 500 mcg — uống khi đau',
      'Ceftriaxone 2 g — tiêm tĩnh mạch, 1 lần/ngày',
      'NaCl 0,9% 500 ml — truyền tĩnh mạch, 1 lần/ngày',
      'Thuốc ABC 50 mg — uống',
      'Vận động trị liệu 45 phút x 2 lần/ngày',
    ].join('\n'), drugs);
    const codes = j(r.map((x) => [x.lineNo, x.issues.map((i) => i.code)]));
    assert.deepEqual(codes, [
      [1, ['max_single']], [2, []], [3, ['max_daily']], [4, []], [5, ['unit']], [6, []], [7, []], [8, ['unknown']],
    ]);
    assert.match(r[0].issues[0].message, /100 mg/);
    assert.equal(D.orderIssues('Baclofen 10 mg — uống, 2 lần/ngày', drugs).length, 0);
  }],
  ['line diff marks kept, removed and added lines', () => {
    assert.deepEqual(j(D.diffLines('A\nB\nC', 'A\nC\nD')), [
      { type: 'same', text: 'A' }, { type: 'removed', text: 'B' }, { type: 'same', text: 'C' }, { type: 'added', text: 'D' },
    ]);
  }],
  ['inherited proposal keeps, changes, drops and adds lines', () => {
    const p = D.proposeInherited(
      { dienbien: { text: 'Tỉnh.\nHA 138/84 mmHg.\nĐau vai VAS 4/10.' }, ylenh: { text: 'Paracetamol 500 mg' }, chamsoc: { text: '' } },
      {
        dienbien: { replace: [{ prefix: 'HA 138', text: 'HA 132/80 mmHg.', sourceId: 'S04' }], drop: [{ prefix: 'Đau vai', sourceId: 'S06' }] },
        ylenh: { add: [{ text: 'Baclofen 10 mg', sourceId: 'S06' }] },
      });
    assert.deepEqual(j(p.dienbien.map((l) => [l.kind, l.checked])), [['keep', true], ['changed', true], ['drop', false]]);
    assert.equal(p.dienbien[1].old, 'HA 138/84 mmHg.');
    assert.equal(D.applyProposal(p.dienbien), 'Tỉnh.\nHA 132/80 mmHg.');
    assert.equal(D.applyProposal(p.ylenh), 'Paracetamol 500 mg\nBaclofen 10 mg');
    assert.deepEqual(j(D.provenanceFromProposal(p.ylenh, 'sheet:2026-10-10')), [
      { sentence: 'Paracetamol 500 mg', sourceId: 'sheet:2026-10-10' }, { sentence: 'Baclofen 10 mg', sourceId: 'S06' },
    ]);
    assert.deepEqual(j(p.chamsoc), []);
  }],
  ['editing a confirmed document creates a new version', () => {
    const doc = { status: 'confirmed', version: 1, versions: [], fields: { a: { text: 'v1' } } };
    const v = D.reopen(doc, { by: 'bs.phcn', at: '2026-10-11T09:00' });
    assert.equal(v, 2);
    assert.equal(doc.status, 'draft');
    assert.equal(doc.versions.length, 1);
    assert.equal(doc.versions[0].fields.a.text, 'v1');
    doc.fields.a.text = 'v2';
    assert.equal(doc.versions[0].fields.a.text, 'v1');
    assert.throws(() => D.reopen({ status: 'sending', version: 1, versions: [], fields: {} }, { by: 'x', at: 'y' }));
    assert.equal(D.reopen({ status: 'draft', version: 3, versions: [], fields: {} }, { by: 'x', at: 'y' }), 3);
  }],
  ['completeness and record blockers', () => {
    const fields = { x: { text: 'có' }, y: { text: '' }, z: { text: '', aiPending: false } };
    const c = D.completeness(template, fields);
    assert.deepEqual(j([c.total, c.filled, c.required, c.requiredFilled, c.pct]), [3, 1, 2, 1, 50]);
    assert.deepEqual(j(c.missing.map((m) => m.fieldId)), ['z']);
    const doc = { fields, sectionConfirm: { a: { by: 'dd.phcn' } } };
    const b = D.recordBlockers(template, doc);
    assert.deepEqual(j(b.map((x) => [x.sectionId, x.reason])), [['b', 'required'], ['b', 'section']]);
    assert.deepEqual(j(D.recordBlockers(template, doc, { requireSections: false }).map((x) => x.reason)), ['required']);
  }],
  ['role permissions', () => {
    assert.equal(D.can('doctor', 'sheet.confirm'), true);
    assert.equal(D.can('nurse', 'sheet.confirm'), false);
    assert.equal(D.can('nurse', 'sheet.editCare'), true);
    assert.equal(D.can('nurse', 'record.confirmFinal'), false);
    assert.equal(D.can('head', 'reports.view'), true);
    assert.equal(D.can('admin', 'sheet.edit'), false);
  }],
  ['provenance lookup and unsourced sentences', () => {
    const prov = [{ sentence: 'Tay phải cơ lực 3/5, chân phải 4-/5. Ashworth 1+.', sourceId: 'S05' }];
    assert.deepEqual(j(D.findProvenance(prov, 'chân phải 4-/5').map((p) => p.sourceId)), ['S05']);
    assert.equal(D.findProvenance(prov, 'xyz').length, 0);
    assert.deepEqual(j(D.unsourcedSentences('Tay phải cơ lực 3/5, chân phải 4-/5. Không rối loạn cơ tròn.', prov)), ['Không rối loạn cơ tròn.']);
  }],
  ['out-of-scope prompts are refused', () => {
    assert.equal(D.isOutOfScope('Chẩn đoán là gì?'), true);
    assert.equal(D.isOutOfScope('nên dùng thuốc gì cho bệnh nhân'), true);
    assert.equal(D.isOutOfScope('kê đơn giúp tôi'), true);
    assert.equal(D.isOutOfScope('Tóm tắt 24 giờ qua'), false);
  }],
  ['dates', () => {
    assert.equal(D.dayNumber('2026-10-05', '2026-10-11'), 7);
    assert.equal(D.addDays('2026-10-11', -1), '2026-10-10');
    assert.equal(D.addDays('2026-09-30', 1), '2026-10-01');
  }],
  ['vital signs are parsed from dictated text', () => {
    const v = D.parseVitals('Mạch 76, huyết áp 132/80, nhiệt độ 36,7, SpO2 97%, nhịp thở 18, đau VAS 2/10. Morse 45.');
    assert.deepEqual(j(v), { pulse: 76, bpSys: 132, bpDia: 80, temp: 36.7, spo2: 97, resp: 18, vas: 2, morse: 45 });
    assert.deepEqual(j(D.parseVitals('không đo được')), {});
  }],
  ['ICD suggestion returns code with basis', () => {
    const list = [{ pattern: 'nhồi máu não', code: 'I69.3', label: 'Di chứng nhồi máu não' }, { pattern: 'viêm phổi', code: 'J18.9', label: 'Viêm phổi' }];
    assert.deepEqual(j(D.suggestIcd('Liệt nửa người phải sau Nhồi máu não bán cầu trái', list)), [{ code: 'I69.3', label: 'Di chứng nhồi máu não', basis: 'Nhồi máu não' }]);
  }],
  ['combined sheets are sorted by date', () => {
    const rows = D.combineSheets({
      '2026-10-10': { date: '2026-10-10', time: '08:00', status: 'exported', fields: { dienbien: { text: 'B' }, ylenh: { text: '' }, chamsoc: { text: '' } } },
      '2026-10-09': { date: '2026-10-09', time: '08:00', status: 'exported', fields: { dienbien: { text: 'A' }, ylenh: { text: '' }, chamsoc: { text: '' } } },
    });
    assert.deepEqual(j(rows.map((r) => r.dienbien)), ['A', 'B']);
  }],
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
