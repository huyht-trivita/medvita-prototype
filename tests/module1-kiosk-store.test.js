const assert = require('node:assert/strict');
const { createStore, STORAGE_KEY, maskCccd, DEFAULT_CALL_TEMPLATE } = require('../shared/kiosk-store.js');

const HOSPITAL = 'Bệnh viện Thái Nguyên';

function memoryStorage() {
  const data = {};
  return { getItem: key => (key in data ? data[key] : null), setItem: (key, value) => { data[key] = String(value); }, data };
}

function makeStore(startIso = '2026-10-12T08:00:00') {
  let current = new Date(startIso);
  const storage = memoryStorage();
  const store = createStore({ storage, now: () => new Date(current), broadcast: false, listenStorage: false });
  return { store, storage, setNow: iso => { current = new Date(iso); } };
}

function newKioskSummary(store, name = 'PHẠM VĂN AN') {
  return store.addSummary({ source: 'kiosk', hospital: HOSPITAL, name, age: 40, gender: 'Nam', chief: 'Đau đầu', aiDept: 'Khoa Nội Tổng Quát', summary: 'Lý do đến khám: Đau đầu' });
}

const checks = [
  ['kiosk numbers continue the seeded daily sequence per hospital', () => {
    const { store } = makeStore();
    const first = store.issueKioskNumber(newKioskSummary(store).id);
    const second = store.issueKioskNumber(newKioskSummary(store).id);
    assert.equal(first.number, 'K-003');
    assert.equal(second.number, 'K-004');
  }],
  ['kiosk numbers restart on a new day', () => {
    const { store, setNow } = makeStore();
    store.issueKioskNumber(newKioskSummary(store).id);
    setNow('2026-10-13T07:30:00');
    assert.equal(store.issueKioskNumber(newKioskSummary(store).id).number, 'K-001');
  }],
  ['issuing again for the same summary returns the same number', () => {
    const { store } = makeStore();
    const id = newKioskSummary(store).id;
    const first = store.issueKioskNumber(id);
    const again = store.issueKioskNumber(id);
    assert.deepEqual(again, first);
    assert.equal(store.issueKioskNumber(newKioskSummary(store).id).number, 'K-004');
  }],
  ['pending kiosk queue lists waiting kiosk summaries in issue order and drops approved ones', () => {
    const { store, setNow } = makeStore();
    const a = newKioskSummary(store, 'A');
    store.issueKioskNumber(a.id);
    setNow('2026-10-12T08:05:00');
    const b = newKioskSummary(store, 'B');
    store.issueKioskNumber(b.id);
    let queue = store.pendingKioskQueue(HOSPITAL).map(s => s.kioskNumber);
    assert.deepEqual(queue, ['K-001', 'K-002', 'K-003', 'K-004']);
    store.approveSummary(a.id, 'Khoa Nội Tổng Quát');
    queue = store.pendingKioskQueue(HOSPITAL).map(s => s.kioskNumber);
    assert.deepEqual(queue, ['K-001', 'K-002', 'K-004']);
  }],
  ['pending kiosk queue keeps number order when numbers are issued at the same time', () => {
    const { store } = makeStore();
    for (const name of ['A', 'B', 'C']) store.issueKioskNumber(newKioskSummary(store, name).id);
    const queue = store.pendingKioskQueue(HOSPITAL).map(s => s.kioskNumber);
    assert.deepEqual(queue, ['K-001', 'K-002', 'K-003', 'K-004', 'K-005']);
  }],
  ['pending kiosk queue only shows numbers issued today', () => {
    const { store, setNow } = makeStore();
    store.issueKioskNumber(newKioskSummary(store, 'HOM QUA').id);
    setNow('2026-10-13T07:30:00');
    const today = store.issueKioskNumber(newKioskSummary(store, 'HOM NAY').id);
    const queue = store.pendingKioskQueue(HOSPITAL).map(s => s.kioskNumber);
    assert.deepEqual(queue, [today.number]);
  }],
  ['call template falls back to the default and can be set per hospital', () => {
    const { store } = makeStore();
    assert.equal(store.callTemplate(HOSPITAL), DEFAULT_CALL_TEMPLATE);
    assert.match(DEFAULT_CALL_TEMPLATE, /\{số kiosk\}/);
    store.setCallTemplate(HOSPITAL, 'Mời bệnh nhân số {số kiosk} tới quầy số 2.');
    assert.equal(store.callTemplate(HOSPITAL), 'Mời bệnh nhân số {số kiosk} tới quầy số 2.');
    assert.equal(store.callTemplate('Bệnh viện khác'), DEFAULT_CALL_TEMPLATE);
  }],
  ['approval issues an exam number per department and is idempotent', () => {
    const { store } = makeStore();
    const s1 = newKioskSummary(store);
    const s2 = newKioskSummary(store);
    const s3 = newKioskSummary(store);
    assert.equal(store.approveSummary(s1.id, 'Khoa Tim Mạch').examNumber, '001');
    assert.equal(store.approveSummary(s2.id, 'Khoa Tim Mạch').examNumber, '002');
    assert.equal(store.approveSummary(s3.id, 'Khoa Hô Hấp').examNumber, '003');
    const again = store.approveSummary(s1.id, 'Khoa Nhi');
    assert.equal(again.examNumber, '001');
    assert.equal(again.approvedDept, 'Khoa Tim Mạch');
  }],
  ['recent approved list is newest first and capped at 20', () => {
    const { store, setNow } = makeStore();
    for (let i = 0; i < 25; i++) {
      setNow(`2026-10-12T09:${String(i).padStart(2, '0')}:00`);
      store.approveSummary(newKioskSummary(store, `BN ${i}`).id, 'Khoa Nhi');
    }
    const recent = store.recentApproved(HOSPITAL);
    assert.equal(recent.length, 20);
    assert.equal(recent[0].name, 'BN 24');
    assert.ok(recent.every(item => item.status === 'Approved' && item.examNumber));
  }],
  ['profile matching merges identical identities and narrows by name', () => {
    const { store } = makeStore();
    const base = { hospital: HOSPITAL, cccd: '079123456789', birthYear: '1990', gender: 'Nam' };
    const withoutName = store.findProfiles(base);
    assert.equal(withoutName.length, 2);
    const withName = store.findProfiles({ ...base, name: '  trần   văn bình ' });
    assert.equal(withName.length, 1);
    assert.equal(withName[0].name, 'TRẦN VĂN BÌNH');
    assert.equal(store.findProfiles({ ...base, cccd: '000000000000' }).length, 0);
  }],
  ['HIS patients reuse the linked profile or create one', () => {
    const { store } = makeStore();
    const his = { patientId: 'BN-TN-1024', name: 'NGUYỄN THỊ AN', dob: '1989-06-12', gender: 'Nữ', cccd: '012345678901' };
    const linked = store.findOrCreateHisProfile(his, HOSPITAL, 'kiosk.tn01');
    assert.equal(linked.id, 'HP-1005');
    const created = store.findOrCreateHisProfile({ ...his, patientId: 'BN-TN-2048' }, HOSPITAL, 'kiosk.tn01');
    assert.equal(created.hisPatientId, 'BN-TN-2048');
    assert.equal(store.findOrCreateHisProfile({ ...his, patientId: 'BN-TN-2048' }, HOSPITAL, 'kiosk.tn01').id, created.id);
  }],
  ['state persists to storage and reloads in another store instance', () => {
    const { store, storage } = makeStore();
    const s = newKioskSummary(store);
    store.issueKioskNumber(s.id);
    assert.ok(storage.getItem(STORAGE_KEY));
    const other = createStore({ storage, now: () => new Date('2026-10-12T08:10:00'), broadcast: false, listenStorage: false });
    assert.equal(other.listSummaries().find(item => item.id === s.id).kioskNumber, 'K-003');
  }],
  ['red-flag alerts are added and updated', () => {
    const { store } = makeStore();
    const alert = store.addRedflag({ hospital: HOSPITAL, name: 'PHẠM VĂN AN', reason: 'đau ngực' });
    assert.equal(alert.status, 'New');
    store.updateRedflag(alert.id, { status: 'Đang xử lý', note: 'Đã gọi' });
    assert.equal(store.listRedflags().find(item => item.id === alert.id).status, 'Đang xử lý');
  }],
  ['CCCD is masked to the last four digits', () => {
    assert.equal(maskCccd('079123456789'), '••••••••6789');
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
