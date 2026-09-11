const fs = require('node:fs');
const assert = require('node:assert/strict');

const html = fs.readFileSync('module2.html', 'utf8');

const checks = [
  ['toast exposes polite live status', () => {
    assert.match(html, /id="toast"[^>]*role="status"[^>]*aria-live="polite"/);
  }],
  ['dialogs expose modal semantics', () => {
    const overlays = [...html.matchAll(/<div id="[^"]+" class="overlay hidden"/g)];
    assert.ok(overlays.length > 0);
    assert.match(html, /querySelectorAll\('\.overlay'\)/);
    assert.match(html, /overlay\.setAttribute\('role','dialog'\)/);
    assert.match(html, /overlay\.setAttribute\('aria-modal','true'\)/);
  }],
  ['icon-only close buttons have accessible names', () => {
    assert.match(html, /querySelectorAll\('\.x'\)/);
    assert.match(html, /button\.setAttribute\('aria-label','Đóng'\)/);
  }],
  ['editable clinical sections are named textboxes', () => {
    for (const id of ['compactReason', 'compactHistory', 'compactSymptoms', 'compactMeds']) {
      assert.match(html, new RegExp(`id="${id}"[^>]*role="textbox"[^>]*aria-label="[^"]+"`));
    }
  }],
  ['mobile HIS navigation remains available', () => {
    assert.match(html, /class="mobile-his-nav"/);
    assert.match(html, /@media\(max-width:900px\)[^{]*\{[^}]*\.mobile-his-nav\{display:flex/s);
  }],
  ['reduced motion is supported', () => {
    assert.match(html, /@media\(prefers-reduced-motion:reduce\)/);
  }],
  ['confirmation uses a safety dialog', () => {
    assert.match(html, /id="clinicalConfirmModal"[^>]*role="dialog"/);
    assert.match(html, /id="finalizeClinicalConfirm"/);
    assert.match(html, /function requestClinicalConfirmation\(/);
  }],
  ['overlay controller handles focus and escape', () => {
    assert.match(html, /function openOverlay\(/);
    assert.match(html, /function closeOverlay\(/);
    assert.match(html, /e\.key==='Escape'/);
  }],
  ['new encounters reset encounter-scoped state', () => {
    assert.match(html, /function resetEncounterState\(/);
    assert.match(html, /state\.confirmed=false/);
    assert.match(html, /state\.linkedVisits=\[\]/);
  }],
  ['leaving an active recording is guarded', () => {
    assert.match(html, /id="leaveRecordingModal"/);
    assert.match(html, /function requestWorkspaceExit\(/);
  }],
  ['recap requires a doctor-authored source', () => {
    assert.match(html, /id="recapModal"/);
    assert.match(html, /id="recapSource"/);
    assert.match(html, /function submitRecap\(/);
  }],
  ['sharing validates recipients and exposes progress', () => {
    assert.match(html, /function validateRecipient\(/);
    assert.match(html, /function sendShareResult\(/);
  }],
  ['HIS sync exposes failure recovery', () => {
    assert.match(html, /id="syncStatusPanel"/);
    assert.match(html, /function retryHisSync\(/);
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
