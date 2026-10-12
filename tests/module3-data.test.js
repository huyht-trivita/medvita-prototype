const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

function load(...files) {
  const ctx = { window: {}, console };
  vm.createContext(ctx);
  for (const f of files) vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f });
  return ctx.window.M3;
}
const M3 = load('module3/js/core/domain.js', 'module3/js/data/demo.js');
const D = M3.domain;
const data = M3.data;
const s = data.createDemoState();

function resolvable(ep, id) {
  if (id === 'patient') return true;
  if (id.startsWith('sheet:')) return Boolean(ep.sheets[id.slice(6)]);
  return ep.sources.some((x) => x.id === id);
}
function scriptSourceIds(script) {
  const ids = [];
  const walk = (v) => {
    if (Array.isArray(v)) { if (v.length === 2 && typeof v[0] === 'string' && typeof v[1] === 'string' && /^(S\d+|sheet:|patient)/.test(v[1])) ids.push(v[1]); else v.forEach(walk); }
    else if (v && typeof v === 'object') { if (typeof v.sourceId === 'string') ids.push(v.sourceId); Object.values(v).forEach(walk); }
  };
  walk(script);
  return ids;
}

const checks = [
  ['state has the expected size and demo date', () => {
    assert.equal(s.version, data.VERSION);
    assert.equal(s.today, '2026-10-11');
    assert.equal(s.users.length, 6);
    assert.equal(s.patients.length, 8);
    assert.equal(s.episodes.length, 8);
    assert.equal(s.templates.length, 2);
    assert.equal(s.toggles.his, false);
    assert.equal(s.toggles.modules, false);
    assert.equal(s.toggles.aiDown, false);
  }],
  ['episodes reference existing patients, users, departments and templates', () => {
    for (const ep of s.episodes) {
      assert.ok(s.patients.find((p) => p.id === ep.patientId), ep.id + ' patient');
      assert.ok(s.users.find((u) => u.id === ep.doctorId && u.role === 'doctor'), ep.id + ' doctor');
      assert.ok(s.users.find((u) => u.id === ep.nurseId && u.role === 'nurse'), ep.id + ' nurse');
      assert.ok(s.departments.find((d) => d.id === ep.dept), ep.id + ' dept');
      assert.ok(s.templates.find((t) => t.id === ep.templateId), ep.id + ' template');
      assert.ok(ep.record && ep.discharge && ep.discharge.summary && ep.discharge.paper, ep.id + ' docs');
    }
  }],
  ['sheets are well formed and keyed by date', () => {
    for (const ep of s.episodes) {
      for (const [date, sh] of Object.entries(ep.sheets)) {
        assert.equal(sh.date, date);
        for (const f of ['dienbien', 'ylenh', 'chamsoc']) assert.equal(typeof sh.fields[f].text, 'string', ep.id + ' ' + date + ' ' + f);
        assert.ok(D.STATUS[sh.status], ep.id + ' ' + date + ' status');
        assert.ok(date >= ep.admitted && date <= s.today, ep.id + ' ' + date + ' in range');
      }
    }
  }],
  ['every provenance and AI script source id resolves', () => {
    for (const ep of s.episodes) {
      for (const sh of Object.values(ep.sheets)) {
        for (const f of Object.values(sh.fields)) for (const p of f.provenance) assert.ok(resolvable(ep, p.sourceId), ep.id + ' ' + p.sourceId);
      }
      const script = data.AI[ep.id];
      if (script) for (const id of scriptSourceIds(script)) assert.ok(resolvable(ep, id), ep.id + ' script ' + id);
    }
  }],
  ['stored orders pass the demo drug check', () => {
    for (const ep of s.episodes) {
      for (const sh of Object.values(ep.sheets)) {
        assert.deepEqual(JSON.parse(JSON.stringify(D.orderIssues(sh.fields.ylenh.text, s.drugs))), [], ep.id + ' ' + sh.date);
      }
    }
  }],
  ['the E01 ward note carries the intended dose error', () => {
    const add = data.AI.E01.inherit.ylenh.add[0].text;
    assert.match(add, /Baclofen 100 mg/);
    assert.equal(D.orderIssues(add, s.drugs)[0].issues[0].code, 'max_single');
  }],
  ['templates have unique field ids and EMR codes', () => {
    for (const t of s.templates.concat([data.DISCHARGE.summary, data.DISCHARGE.paper])) {
      const ids = t.sections.flatMap((x) => x.fields.map((f) => f.id));
      assert.equal(new Set(ids).size, ids.length, t.title);
      for (const sec of t.sections) for (const f of sec.fields) assert.ok(f.emrCode, t.title + ' ' + f.id);
      assert.ok(t.sections.some((x) => x.fields.some((f) => f.required)), t.title);
    }
  }],
  ['record completeness varies across episodes', () => {
    const pct = (id) => {
      const ep = s.episodes.find((e) => e.id === id);
      return D.completeness(s.templates.find((t) => t.id === ep.templateId), ep.record.fields).pct;
    };
    assert.equal(pct('E03'), 100);
    assert.ok(s.episodes.find((e) => e.id === 'E03').record.finalConfirm);
    assert.ok(pct('E01') < 100 && pct('E01') > 0);
    assert.ok(pct('E05') < pct('E01'));
  }],
  ['each call returns an independent copy', () => {
    const a = data.createDemoState();
    a.patients[0].name = 'X';
    a.templates[0].sections[0].fields[0].label = 'Y';
    const b = data.createDemoState();
    assert.notEqual(b.patients[0].name, 'X');
    assert.notEqual(b.templates[0].sections[0].fields[0].label, 'Y');
  }],
  ['demo data does not mention real hospitals or Jira keys', () => {
    const blob = JSON.stringify(s) + JSON.stringify(data.AI) + JSON.stringify(data.HIS_PATIENT) + JSON.stringify(data.SAMPLE_DOC);
    assert.doesNotMatch(blob, /Đà Nẵng|MV-\d/);
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
