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
    assert.match(lookup[0], /setHisPrefill\(patient\)/);
    const prefill = html.match(/function setHisPrefill\([\s\S]*?\n}/);
    assert.ok(prefill, 'prefill function must be present');
    assert.match(prefill[0], /getElementById\('patient-full-name'\)\.value = patient\.name/);
    assert.match(prefill[0], /getElementById\('patient-cccd'\)\.value = patient\.cccd/);
    assert.match(prefill[0], /getElementById\('patient-birth-year'\)\.value = patient\.dob\.slice\(0, 4\)/);
    assert.match(prefill[0], /getElementById\('patient-gender'\)\.value = patient\.gender/);
  }],
  ['patient name stays visible and optional with or without a patient ID', () => {
    assert.match(html, /function handlePatientIdInput\(/);
    assert.match(html, /optional-name-field/);
    const patientIdHandler = html.match(/function handlePatientIdInput\([\s\S]*?\n}/);
    assert.ok(patientIdHandler, 'patient ID input handler must be present');
    assert.doesNotMatch(patientIdHandler[0], /optional-name-field'\)\.hidden/);
    assert.doesNotMatch(patientIdHandler[0], /patient-full-name'\)\.value = ''/);
    assert.match(html, /data\.name && !validatePatientName\(data\.name\)/);
    assert.match(html, /intakeState\.requireName && !data\.name/);
    assert.doesNotMatch(html, /'BỆNH NHÂN MỚI'/);
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
    const newPatientFlow = html.match(/function processPatientIdentity\(\)[\s\S]*?\n}\n\nfunction beginConsent[\s\S]*?\n}/);
    assert.ok(newPatientFlow, 'new patient flow must continue to consent');
    assert.match(newPatientFlow[0], /store\.findProfiles\(/);
    assert.match(newPatientFlow[0], /beginConsent\(createPatientProfile\(data\)\)/);
    assert.match(newPatientFlow[0], /prepareConsent\(\);\s*goToIntakeStep\('consent'\)/);
    assert.match(html, /id="intake-status"[^>]*role="status"[^>]*aria-live="polite"/);
  }],
  ['backend simulation handles returning lookup and new profile creation', () => {
    assert.match(html, /function processPatientIdentity\(/);
    assert.match(html, /function lookupPatientById\(/);
    assert.match(html, /function createPatientProfile\(/);
  }],
  ['AI symptom conversation builds a read-only summary that is edited through chat', () => {
    assert.match(html, /id="symptom-chat"/);
    assert.match(html, /function submitSymptomAnswer\(/);
    assert.match(html, /id="patient-summary"[^>]*role="document"/);
    assert.doesNotMatch(html, /id="patient-summary"[^>]*contenteditable/);
    assert.match(html, /onclick="editSummaryViaChat\(\)">Chỉnh sửa thông tin<\/button>/);
    assert.match(html, /onclick="confirmPatientSummary\(\)">Xác nhận thông tin<\/button>/);
    assert.match(html, /function editSummaryViaChat\(/);
  }],
  ['AI chat supports reviewed Vietnamese voice transcription', () => {
    assert.match(html, /id="btn-voice-input"/);
    assert.match(html, /id="voice-status"[^>]*role="status"/);
    assert.match(html, /SpeechRecognition|webkitSpeechRecognition/);
    assert.match(html, /recognition\.lang = 'vi-VN'/);
    assert.match(html, /function toggleVoiceRecording\(/);
    assert.match(html, /symptom-answer/);
  }],
  ['patient confirmation adds a pending nurse review item and issues a kiosk number', () => {
    assert.match(html, /function confirmPatientSummary\(/);
    assert.match(html, /store\.addSummary\(/);
    assert.match(html, /status:\s*'Pending Nurse Review'/);
    assert.match(html, /store\.issueKioskNumber\(/);
  }],
  ['identity step prefills HIS data, reports HIS errors and lets patients choose a profile (MV-375)', () => {
    assert.doesNotMatch(html, /id="his-confirm"/);
    assert.match(html, /function setHisPrefill\(patient\)/);
    assert.match(html, /setHisFieldsLocked\(true\)/);
    assert.match(html, /function handlePatientIdInput\(\) \{[\s\S]*?clearHisPrefill\(\)/);
    assert.match(html, /const HIS_ERROR_CODE = 'BN-TN-ERR'/);
    assert.match(html, /Chưa thể kiểm tra thông tin với bệnh viện/);
    assert.match(html, /id="profile-chooser"/);
    assert.match(html, /Không phải thông tin của tôi/);
    assert.match(html, /MedVitaKioskStore\.maskCccd\(/);
  }],
  ['declining consent asks to end or cancel before closing the session (MV-376)', () => {
    assert.doesNotMatch(html, /id="consent-declined"/);
    assert.match(html, /Bạn chưa đồng ý sử dụng AI nên không thể tiếp tục khai báo triệu chứng\./);
    assert.match(html, /label: 'Cancel'/);
    assert.match(html, /label: 'Kết thúc'/);
    assert.match(html, /endKioskSession\('consent-declined'\)/);
  }],
  ['chat offers finish early and red-flag warnings (MV-421)', () => {
    assert.match(html, /id="btn-finish-early"[^>]*>Xong sớm<\/button>/);
    assert.match(html, /const REDFLAG_KEYWORDS = \['đau ngực'/);
    assert.match(html, /store\.addRedflag\(/);
    assert.match(html, /label: 'Tiếp tục khai báo'/);
    assert.match(html, /label: 'Kết thúc khai báo'/);
  }],
  ['queue ticket shows kiosk number, name, hospital and issue time (MV-378)', () => {
    assert.match(html, /id="ticket-name-row"/);
    assert.match(html, /id="ticket-hospital"/);
    assert.match(html, /id="ticket-issued-at"/);
  }],
  ['kiosk cancel button and idle timeout close the session (MV-377)', () => {
    assert.match(html, /id="btn-cancel-intake"[^>]*>Hủy khai báo<\/button>/);
    assert.match(html, /title: 'Hủy khai báo\?'/);
    assert.match(html, /Thông tin chưa xác nhận sẽ không được gửi cho điều dưỡng\./);
    assert.match(html, /intake: 120000, ticket: 60000, warning: 30000, processing: 60000/);
    assert.match(html, /get\('timeout'\) === 'fast'/);
    assert.match(html, /id="kiosk-idle"/);
    assert.match(html, /function endKioskSession\(/);
  }],
  ['nurse dashboard shows the kiosk number and can announce the call (MV-460)', () => {
    assert.match(html, /pill kiosk/);
    assert.match(html, /id="rv-announce" checked/);
    assert.match(html, /Phát thông báo gọi bệnh nhân/);
    assert.match(html, /store\.callTemplate\(hospital\)\.replace\('\{số kiosk\}', number\)/);
    assert.match(html, /utterance\.lang = 'vi-VN'/);
    assert.match(html, /id="btn-rv-replay"[^>]*>Phát lại thông báo<\/button>/);
  }],
  ['LCD hides stale data when the connection drops (MV-459)', () => {
    const lcd = fs.readFileSync('lcd.html', 'utf8');
    assert.match(lcd, /id="lcd-offline"/);
    assert.match(lcd, /addEventListener\('offline'/);
    assert.match(lcd, /addEventListener\('online'/);
  }],
  ['dashboard, LCD and user flow use the shared kiosk store and story map', () => {
    assert.match(html, /<script src="shared\/kiosk-store\.js"><\/script>/);
    const lcd = fs.readFileSync('lcd.html', 'utf8');
    assert.match(lcd, /<script src="shared\/kiosk-store\.js"><\/script>/);
    assert.match(lcd, /pendingKioskQueue\(/);
    assert.match(lcd, /recentApproved\(HOSPITAL, 20\)/);
    assert.match(lcd, /class="queue-row/);
    assert.match(lcd, /const PAGE_INTERVAL_MS = 8000/);
    assert.match(lcd, /function paginatePending\(/);
    assert.doesNotMatch(lcd, /số khác đang chờ/);
    const flow = fs.readFileSync('kiosk-flow.html', 'utf8');
    assert.match(flow, /class="mermaid"/);
    for (const key of ['MV-374', 'MV-375', 'MV-376', 'MV-421', 'MV-450', 'MV-378', 'MV-377', 'MV-459', 'MV-460']) assert.match(flow, new RegExp(key));
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
