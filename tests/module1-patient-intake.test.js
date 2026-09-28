const fs = require('node:fs');
const assert = require('node:assert/strict');

const html = fs.readFileSync('nurse-dashboard.html', 'utf8');

const checks = [
  ['nurse login activates a separate patient kiosk', () => {
    assert.match(html, /id="view-kiosk"/);
    assert.match(html, /function startKioskMode\(/);
    assert.match(html, /btn-nurse-login[\s\S]*startKioskMode\(\)/);
    assert.match(html, /id="kiosk-home"/);
    assert.match(html, /id="kiosk-flow"/);
  }],
  ['patient kiosk does not expose nurse navigation', () => {
    const kiosk = html.match(/<div id="view-kiosk"[\s\S]*?<\/div>\s*<!-- ============ DETAIL DRAWER/);
    assert.ok(kiosk, 'kiosk shell must be separate from nurse dashboard');
    assert.doesNotMatch(kiosk[0], /class="sidebar"|data-view="review"|data-view="redflag"/);
  }],
  ['RBAC routes kiosk-only and reviewer accounts to permitted surfaces', () => {
    assert.match(html, /'kiosk\.tn01'/);
    assert.match(html, /permissions:\s*\['kiosk\.activate',\s*'patient_intake\.create'\]/);
    assert.match(html, /'summary\.review'/);
    assert.match(html, /'redflag\.manage'/);
    assert.match(html, /function hasPermission\(/);
    assert.match(html, /hasPermission\('kiosk\.activate'\)/);
    assert.doesNotMatch(html, /const STAFF_PIN/);
  }],
  ['staff exit from kiosk returns to account login', () => {
    assert.match(html, /function exitKioskToLogin\(/);
    assert.doesNotMatch(html, /id="staff-pin"/);
  }],
  ['patient intake distinguishes returning and new patients', () => {
    assert.match(html, /id="patient-type-returning"/);
    assert.match(html, /id="patient-type-new"/);
    assert.match(html, /id="returning-patient-form"/);
    assert.match(html, /id="new-patient-form"/);
  }],
  ['all patient identity inputs have explicit labels', () => {
    for (const id of ['existing-patient-id', 'existing-cccd', 'new-full-name', 'new-cccd', 'new-dob', 'new-gender']) {
      assert.match(html, new RegExp(`<label[^>]*for="${id}"`));
      assert.match(html, new RegExp(`id="${id}"[^>]*aria-describedby="${id}-error"`));
      assert.match(html, new RegExp(`id="${id}-error"[^>]*role="alert"`));
    }
  }],
  ['intake provides conditional face recognition and consent steps', () => {
    assert.doesNotMatch(html, /id="intake-stepper"/);
    assert.doesNotMatch(html, /function renderStepper\(/);
    assert.match(html, /id="intake-step-face"/);
    assert.match(html, /function startFaceRecognition\(/);
    assert.match(html, /id="intake-step-consent"/);
    assert.match(html, /function handleConsentDecision\(/);
    assert.match(html, /\['info', 'face', 'consent', 'chat', 'summary'\]/);
    assert.match(html, /\['info', 'consent', 'chat', 'summary'\]/);
    assert.match(html, /id="intake-status"[^>]*role="status"[^>]*aria-live="polite"/);
  }],
  ['backend simulation handles returning lookup and new profile creation', () => {
    assert.match(html, /function processPatientIdentity\(/);
    assert.match(html, /function lookupReturningPatient\(/);
    assert.match(html, /function createPatientProfile\(/);
  }],
  ['AI symptom conversation builds an editable summary', () => {
    assert.match(html, /id="symptom-chat"/);
    assert.match(html, /function submitSymptomAnswer\(/);
    assert.match(html, /id="patient-summary"/);
    assert.match(html, /contenteditable="true"/);
  }],
  ['AI chat supports reviewed Vietnamese voice transcription', () => {
    assert.match(html, /id="btn-voice-input"/);
    assert.match(html, /id="voice-status"[^>]*role="status"/);
    assert.match(html, /SpeechRecognition|webkitSpeechRecognition/);
    assert.match(html, /recognition\.lang = 'vi-VN'/);
    assert.match(html, /function toggleVoiceRecording\(/);
    assert.match(html, /symptom-answer/);
  }],
  ['patient confirmation adds a pending nurse review item', () => {
    assert.match(html, /function confirmPatientSummary\(/);
    assert.match(html, /reviewItems\.unshift\(/);
    assert.match(html, /status:\s*'Pending Nurse Review'/);
  }],
  ['completed or declined sessions reset to kiosk home', () => {
    assert.match(html, /function finishKioskSession\(/);
    assert.match(html, /finishKioskSession\(\)/);
    assert.match(html, /function showKioskHome\(/);
    assert.match(html, /getElementById\('symptom-chat'\)\.innerHTML = ''/);
    assert.match(html, /getElementById\('patient-summary'\)\.innerText = ''/);
  }],
  ['responsive layout and reduced motion are supported', () => {
    assert.match(html, /@media\s*\(max-width:\s*760px\)/);
    assert.match(html, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  }],
  ['patient kiosk is tablet-first and keeps voice inside the chat composer', () => {
    assert.match(html, /min-height:\s*100dvh/);
    assert.match(html, /@media\s*\(min-width:\s*761px\)\s*and\s*\(max-width:\s*900px\)/);
    assert.match(html, /@media\s*\(min-width:\s*901px\)\s*and\s*\(max-width:\s*1180px\)/);
    assert.match(html, /touch-action:\s*manipulation/);
    assert.match(html, /height:\s*clamp\([^;]*dvh/);
    assert.match(html, /class="chat-input-area"[\s\S]*class="chat-compose"[\s\S]*id="btn-voice-input"[\s\S]*id="symptom-answer"[\s\S]*id="btn-send-symptom"/);
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
