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
  ['patient intake uses one identity form without patient-type tabs', () => {
    assert.doesNotMatch(html, /id="patient-type-returning"/);
    assert.doesNotMatch(html, /id="patient-type-new"/);
    assert.match(html, /id="patient-identity-form"/);
    assert.match(html, /id="optional-name-field"/);
    assert.match(html, /Vui lòng nhập thông tin bên dưới\. Nếu đã từng khám tại bệnh viện, hãy nhập mã bệnh nhân để tìm hồ sơ nhanh hơn\./);
    assert.match(html, /id="patient-id-hint"[^>]*>Nếu đã từng khám tại bệnh viện, hãy nhập mã bệnh nhân để tìm thông tin nhanh hơn\.<\/div>/);
  }],
  ['all patient identity inputs have explicit labels', () => {
    for (const id of ['patient-id', 'patient-full-name', 'patient-cccd', 'patient-birth-year', 'patient-gender']) {
      assert.match(html, new RegExp(`<label[^>]*for="${id}"`));
      assert.match(html, new RegExp(`id="${id}"[^>]*aria-describedby="[^"]*${id}-error[^"]*"`));
      assert.match(html, new RegExp(`id="${id}-error"[^>]*role="alert"`));
    }
  }],
  ['patient ID lookup only validates the ID and fills HIS identity fields', () => {
    assert.match(html, /id="btn-check-patient"[^>]*>Kiểm tra<\/button>/);
    assert.match(html, /function checkPatientOnServer\(/);
    assert.match(html, /function lookupPatientById\(/);
    assert.match(html, /identityVerified/);
    const lookup = html.match(/function checkPatientOnServer\([\s\S]*?\n}\n\nfunction continueWithReturningPatient/);
    assert.ok(lookup, 'lookup function must be present');
    assert.doesNotMatch(lookup[0], /validateIdentityData/);
    assert.match(lookup[0], /if \(!data\.patientId\)/);
    assert.match(lookup[0], /getElementById\('patient-full-name'\)\.value = patient\.name/);
    assert.match(lookup[0], /getElementById\('patient-cccd'\)\.value = patient\.cccd/);
    assert.match(lookup[0], /getElementById\('patient-birth-year'\)\.value = patient\.dob\.slice\(0, 4\)/);
    assert.match(lookup[0], /getElementById\('patient-gender'\)\.value = patient\.gender/);
  }],
  ['patient name stays visible and optional with or without a patient ID', () => {
    assert.match(html, /function handlePatientIdInput\(/);
    assert.match(html, /optional-name-field/);
    const patientIdHandler = html.match(/function handlePatientIdInput\([\s\S]*?\n}/);
    assert.ok(patientIdHandler, 'patient ID input handler must be present');
    assert.doesNotMatch(patientIdHandler[0], /optional-name-field'\)\.hidden/);
    assert.doesNotMatch(patientIdHandler[0], /patient-full-name'\)\.value = ''/);
    assert.match(html, /data\.name && !validatePatientName\(data\.name\)/);
    assert.match(html, /data\.name \|\| 'BỆNH NHÂN MỚI'/);
  }],
  ['kiosk home recommends Mobile while keeping kiosk available', () => {
    assert.match(html, /class="mobile-recommendation"/);
    assert.match(html, /<h2>Khai báo thuận tiện hơn với ứng dụng MedVita<\/h2>/);
    assert.match(html, /Bạn nên khai báo thông tin trước khám trên <strong>Ứng Dụng MedVita<\/strong>\./);
    assert.match(html, /số thứ tự/);
    assert.match(html, /chủ động thời gian và hạn chế chờ\./);
    assert.match(html, /\.mobile-recommendation-copy>p\{text-align:justify;/);
    assert.match(html, /<\/a>\s*<\/div>\s*<p class="kiosk-fallback">Nếu chưa sử dụng Mobile, bạn vẫn có thể tiếp tục khai báo tại kiosk này\.<\/p>\s*<button class="kiosk-start"/);
  }],
  ['Mobile recommendation includes an accessible demo download QR', () => {
    assert.match(html, /class="mobile-download-qr"[^>]*href="https:\/\/medvita\.vn\/download"[^>]*aria-label="[^"]+"/);
    assert.match(html, /class="qr-code"[^>]*viewBox="0 0 37 37"[^>]*shape-rendering="crispEdges"/);
    assert.match(html, /Quét mã để tải ứng dụng/);
    assert.match(html, /@media\s*\(max-width:\s*760px\)[\s\S]*\.mobile-recommendation/);
    assert.match(html, /\.qr-code\{[^}]*width:184px;[^}]*height:184px;/);
  }],
  ['patient information continues directly to written AI consent without face recognition', () => {
    assert.doesNotMatch(html, /id="intake-stepper"/);
    assert.doesNotMatch(html, /function renderStepper\(/);
    assert.doesNotMatch(html, /id="intake-step-face"/);
    assert.doesNotMatch(html, /function startFaceRecognition\(/);
    assert.doesNotMatch(html, /prepareFaceRecognition|confirmFaceRecognition|faceScanAttempts/);
    assert.match(html, /id="intake-step-consent"/);
    assert.match(html, /function handleConsentDecision\(/);
    assert.match(html, /\['info', 'consent', 'chat', 'summary'\]/);
    const newPatientFlow = html.match(/function processPatientIdentity\(\)[\s\S]*?\n}\n\nfunction prepareConsent/);
    assert.ok(newPatientFlow, 'new patient flow must continue to consent');
    assert.match(newPatientFlow[0], /intakeState\.patient = createPatientProfile\(data\)/);
    assert.match(newPatientFlow[0], /prepareConsent\(\);\s*goToIntakeStep\('consent'\)/);
    assert.match(html, /id="intake-status"[^>]*role="status"[^>]*aria-live="polite"/);
  }],
  ['backend simulation handles returning lookup and new profile creation', () => {
    assert.match(html, /function processPatientIdentity\(/);
    assert.match(html, /function lookupPatientById\(/);
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
  ['completed intake shows a printable queue number without changing the intake flow', () => {
    assert.match(html, /Số thứ tự chờ khám của bạn/);
    assert.match(html, /id="patient-queue-number"/);
    assert.match(html, /onclick="printQueueTicket\(\)"/);
    assert.match(html, /function printQueueTicket\(/);
    assert.match(html, /window\.print\(\)/);
    assert.match(html, /@media\s+print/);
    assert.match(html, /document\.getElementById\('patient-queue-number'\)\.innerText/);
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
