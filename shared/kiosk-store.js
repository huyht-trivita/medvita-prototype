/*
 * MedVita kiosk demo store — dùng chung cho nurse-dashboard.html (kiosk + Dashboard điều dưỡng) và lcd.html.
 * Lưu localStorage để các tab cùng thấy dữ liệu; báo thay đổi qua BroadcastChannel và sự kiện storage.
 * Đây là dữ liệu giả lập cho prototype, không phải dữ liệu bệnh nhân thật.
 */
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.MedVitaKioskStore = api;
})(typeof window !== 'undefined' ? window : null, function () {
    'use strict';

    const STORAGE_KEY = 'medvita.kiosk.v1';
    const CHANNEL_NAME = 'medvita-kiosk';
    const DEFAULT_HOSPITAL = 'Bệnh viện Thái Nguyên';
    const DEFAULT_CALL_TEMPLATE = 'Bệnh nhân số thứ tự chờ khám {số kiosk} đã được xếp khám, vui lòng tới quầy thu ngân.';
    const PENDING = 'Pending Nurse Review';
    const APPROVED = 'Approved';

    function pad3(value) { return String(value).padStart(3, '0'); }
    function dayKey(date) {
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    function normalizeName(name) { return String(name || '').trim().replace(/\s+/g, ' ').toUpperCase(); }
    function maskCccd(cccd) { const value = String(cccd || ''); return '•'.repeat(Math.max(0, value.length - 4)) + value.slice(-4); }
    function clone(value) { return value === undefined ? undefined : JSON.parse(JSON.stringify(value)); }
    function uid(prefix) { return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`; }
    function memoryStorage() {
        const data = {};
        return { getItem: key => (key in data ? data[key] : null), setItem: (key, value) => { data[key] = String(value); } };
    }
    function defaultStorage() {
        try {
            const storage = window.localStorage;
            storage.setItem('__medvita_probe__', '1');
            storage.removeItem('__medvita_probe__');
            return storage;
        } catch (error) {
            return memoryStorage();
        }
    }

    function seedState(now) {
        const base = now.getTime();
        const ago = minutes => new Date(base - minutes * 60000).toISOString();
        const H = DEFAULT_HOSPITAL;
        const app = (item) => ({ source: 'app', hospital: H, conflict: false, ...item });
        const summaries = [
            {
                id: 'k1', source: 'kiosk', hospital: H, profileId: 'HP-1004', name: 'LÊ THỊ HOA', age: 51, gender: 'Nữ',
                chief: 'Ho và sốt nhẹ 2 ngày nay.', allergy: 'Không ghi nhận', meds: 'Không dùng thuốc', chronic: 'Không ghi nhận',
                aiDept: 'Khoa Hô Hấp', status: PENDING, time: ago(9), conflict: false, kioskNumber: 'K-001', kioskIssuedAt: ago(9),
                summary: 'Lý do đến khám: Ho và sốt nhẹ 2 ngày nay.\n\nKhởi phát và diễn biến: Bắt đầu 2 ngày trước, sốt về chiều.\n\nTriệu chứng kèm theo, bệnh nền, dị ứng và thuốc đang dùng: Không ghi nhận.'
            },
            {
                id: 'k2', source: 'kiosk', hospital: H, profileId: 'HP-1006', name: '', age: 34, gender: 'Nam',
                chief: 'Đau bụng vùng thượng vị sau ăn.', allergy: 'Không ghi nhận', meds: 'Không dùng thuốc', chronic: 'Không ghi nhận',
                aiDept: 'Khoa Tiêu Hóa', status: PENDING, time: ago(4), conflict: false, kioskNumber: 'K-002', kioskIssuedAt: ago(4),
                summary: 'Lý do đến khám: Đau bụng vùng thượng vị sau ăn.\n\nKhởi phát và diễn biến: 3 ngày nay, tăng khi đói.\n\nTriệu chứng kèm theo, bệnh nền, dị ứng và thuốc đang dùng: Không ghi nhận.'
            },
            app({ id: 'r1', name: 'NGUYỄN VĂN TÙNG', age: 32, gender: 'Nam', chief: 'Đau bụng âm ỉ vùng quanh rốn, xuất hiện từ đêm qua.', allergy: 'Dị ứng Penicillin', meds: 'Không dùng thuốc', chronic: 'Tiểu đường', aiDept: 'Khoa Tiêu Hóa', status: PENDING, time: ago(12), conflict: true }),
            app({ id: 'r2', name: 'TRẦN THỊ MAI', age: 38, gender: 'Nữ', chief: 'Ho khan kéo dài 3 ngày, kèm sốt nhẹ.', allergy: 'Không ghi nhận', meds: 'Paracetamol', chronic: 'Không ghi nhận', aiDept: 'Khoa Hô Hấp', status: APPROVED, time: ago(40), approvedDept: 'Khoa Hô Hấp', approvedAt: ago(30), examNumber: '001' }),
            app({ id: 'r3', name: 'PHẠM VĂN ĐỨC', age: 45, gender: 'Nam', chief: 'Đau thắt ngực khi gắng sức.', allergy: 'Không ghi nhận', meds: 'Aspirin', chronic: 'Tăng huyết áp', aiDept: 'Khoa Tim Mạch', status: PENDING, time: ago(55) }),
            app({ id: 'r4', name: 'HOÀNG THỊ LAN', age: 27, gender: 'Nữ', chief: 'Buồn nôn, chóng mặt 2 ngày nay.', allergy: 'Dị ứng hải sản', meds: 'Không dùng thuốc', chronic: 'Không ghi nhận', aiDept: 'Khoa Nội Tổng Quát', status: PENDING, time: ago(70) }),
            app({ id: 'r5', name: 'VŨ MINH TUẤN', age: 60, gender: 'Nam', chief: 'Ho đờm, khó thở khi nằm.', allergy: 'Không ghi nhận', meds: 'Thuốc hen', chronic: 'Hen suyễn', aiDept: 'Khoa Hô Hấp', status: APPROVED, time: ago(90), approvedDept: 'Khoa Hô Hấp', approvedAt: ago(20), examNumber: '002' }),
            app({ id: 'r6', name: 'ĐỖ THỊ HƯƠNG', age: 33, gender: 'Nữ', chief: 'Đau vùng thượng vị sau ăn.', allergy: 'Không ghi nhận', meds: 'Omeprazole', chronic: 'Không ghi nhận', aiDept: 'Khoa Tiêu Hóa', status: PENDING, time: ago(110) }),
            app({ id: 'r7', name: 'NGÔ VĂN SƠN', age: 50, gender: 'Nam', chief: 'Đau lưng, tê chân trái.', allergy: 'Không ghi nhận', meds: 'Không dùng thuốc', chronic: 'Không ghi nhận', aiDept: 'Khoa Nội Tổng Quát', status: PENDING, time: ago(130) }),
            app({ id: 'r8', name: 'BÙI THỊ NGA', age: 41, gender: 'Nữ', chief: 'Sốt cao 39 độ kèm ớn lạnh.', allergy: 'Không ghi nhận', meds: 'Paracetamol', chronic: 'Không ghi nhận', aiDept: 'Khoa Nội Tổng Quát', status: APPROVED, time: ago(150), approvedDept: 'Khoa Nội Tổng Quát', approvedAt: ago(35), examNumber: '001' }),
            app({ id: 'r9', name: 'LÝ VĂN PHÚC', age: 29, gender: 'Nam', chief: 'Khó thở, thở khò khè.', allergy: 'Dị ứng phấn hoa', meds: 'Không dùng thuốc', chronic: 'Hen suyễn', aiDept: 'Khoa Hô Hấp', status: PENDING, time: ago(170) }),
            app({ id: 'r10', name: 'DƯƠNG THỊ THU', age: 36, gender: 'Nữ', chief: 'Đau đầu kéo dài kèm buồn nôn.', allergy: 'Không ghi nhận', meds: 'Không dùng thuốc', chronic: 'Không ghi nhận', aiDept: 'Khoa Nội Tổng Quát', status: PENDING, time: ago(190) }),
            app({ id: 'r11', name: 'TRỊNH VĂN LONG', age: 58, gender: 'Nam', chief: 'Đau ngực âm ỉ, mệt mỏi.', allergy: 'Không ghi nhận', meds: 'Metformin', chronic: 'Tiểu đường', aiDept: 'Khoa Tim Mạch', status: PENDING, time: ago(210) }),
            app({ id: 'r12', name: 'PHAN THỊ YẾN', age: 24, gender: 'Nữ', chief: 'Đau bụng dưới, kinh nguyệt bất thường.', allergy: 'Không ghi nhận', meds: 'Không dùng thuốc', chronic: 'Không ghi nhận', aiDept: 'Khoa Nội Tổng Quát', status: APPROVED, time: ago(230), approvedDept: 'Khoa Nội Tổng Quát', approvedAt: ago(15), examNumber: '002' })
        ];
        const redflag = (item) => ({ hospital: H, note: '', ...item });
        const redflags = [
            redflag({ id: 'a1', name: 'LÊ VĂN HÙNG', age: 55, gender: 'Nam', reason: 'Câu trả lời chứa từ khóa "đau ngực, khó thở" — nghi ngờ hội chứng vành cấp.', content: '"Tôi thấy đau ngực trái và khó thở khi leo cầu thang."', contact: 'SĐT: 09xx xxx 456 (Health Profile, hiển thị đầy đủ trong hệ thống thật)', protocol: 'Ưu tiên gọi điện xác minh trong 5 phút. Nếu không liên lạc được, thông báo lễ tân kiểm tra tại chỗ.', status: 'New', time: ago(3) }),
            redflag({ id: 'a2', name: 'NGUYỄN THỊ HẠNH', age: 68, gender: 'Nữ', reason: 'Câu trả lời chứa từ khóa "liệt, méo miệng" — nghi ngờ đột quỵ.', content: '"Tay trái của mẹ tôi tự nhiên yếu, không cầm được đũa, miệng hơi méo."', contact: 'SĐT: 09xx xxx 112 (con gái khai hộ)', protocol: 'Gọi ngay 115 theo quy trình FAST-stroke. Không chờ xác minh qua điện thoại.', status: 'New', time: ago(8) }),
            redflag({ id: 'a3', name: 'TRẦN VĂN BÌNH', age: 42, gender: 'Nam', reason: 'Câu trả lời chứa từ khóa "ngất, mất ý thức".', content: '"Tôi bị ngất khoảng 30 giây lúc đang đứng xếp hàng, sau đó tỉnh lại bình thường."', contact: 'SĐT: 09xx xxx 778', protocol: 'Liên hệ xác minh trong 10 phút, kiểm tra tiền sử tim mạch/huyết áp trước khi quyết định.', status: 'Đang xử lý', time: ago(25), note: 'Đã gọi lần 1, chưa liên lạc được, đang gọi lại.' }),
            redflag({ id: 'a4', name: 'PHẠM THỊ THẢO', age: 30, gender: 'Nữ', reason: 'Câu trả lời chứa từ khóa "khó thở" khi đang mang thai.', content: '"Tôi đang mang thai tuần 32, hôm nay thấy khó thở hơn bình thường khi đi lại."', contact: 'SĐT: 09xx xxx 334', protocol: 'Ưu tiên chuyển khoa Sản cấp cứu, xác minh thêm dấu hiệu phù/huyết áp.', status: 'Đang xử lý', time: ago(48), note: 'Đã liên hệ, đang hướng dẫn đến khoa Sản.' }),
            redflag({ id: 'a5', name: 'ĐINH VĂN KHOA', age: 61, gender: 'Nam', reason: 'Câu trả lời chứa từ khóa "đau ngực" — nghi ngờ hội chứng vành cấp.', content: '"Tôi có đau nhẹ vùng ngực sau khi leo cầu thang, đỡ khi nghỉ."', contact: 'SĐT: 09xx xxx 990', protocol: 'Đã gọi xác minh, bệnh nhân xác nhận đau đã hết, không cần can thiệp cấp cứu tức thời — vẫn hẹn tái khám khoa Tim mạch.', status: 'Đã xử lý', time: ago(65), note: 'Đã gọi điện xác minh lúc 14:20 — bệnh nhân ổn định, hẹn tái khám khoa Tim mạch trong tuần.' }),
            redflag({ id: 'a6', name: 'VÕ THỊ KIM', age: 19, gender: 'Nữ', reason: 'Câu trả lời chứa từ khóa "khó thở" nhưng ngữ cảnh là hen suyễn nhẹ đã biết trước.', content: '"Tôi hơi khó thở do thời tiết, tôi có tiền sử hen suyễn nhẹ, đã dùng thuốc xịt như bình thường."', contact: 'SĐT: 09xx xxx 221', protocol: 'Không cần can thiệp — dấu hiệu khớp với hen suyễn mãn tính đã kiểm soát tốt theo hồ sơ.', status: 'Bỏ qua', time: ago(95), note: 'Đã xác minh — thuộc bệnh nền hen suyễn đã kiểm soát, không phải dấu hiệu cấp tính mới.' }),
            redflag({ id: 'a7', name: 'LƯƠNG VĂN ĐẠT', age: 47, gender: 'Nam', reason: 'Câu trả lời chứa từ khóa "cấp cứu" do người dùng tự mô tả mức độ nghiêm trọng.', content: '"Cần cấp cứu gấp, tôi bị đau bụng dữ dội không chịu nổi."', contact: 'SĐT: 09xx xxx 556', protocol: 'Xác minh mức độ đau, kiểm tra dấu hiệu ruột thừa/viêm tụy cấp, chuyển cấp cứu nếu cần.', status: 'New', time: ago(120) })
        ];
        const profiles = [
            { id: 'HP-1001', hospital: H, name: 'NGUYỄN VĂN BÌNH', cccd: '079123456789', birthYear: '1990', gender: 'Nam' },
            { id: 'HP-1002', hospital: H, name: 'TRẦN VĂN BÌNH', cccd: '079123456789', birthYear: '1990', gender: 'Nam' },
            { id: 'HP-1003', hospital: H, name: 'NGUYỄN VĂN BÌNH', cccd: '079123456789', birthYear: '1990', gender: 'Nam' },
            { id: 'HP-1004', hospital: H, name: 'LÊ THỊ HOA', cccd: '001234567890', birthYear: '1975', gender: 'Nữ' },
            { id: 'HP-1005', hospital: H, name: 'NGUYỄN THỊ AN', cccd: '012345678901', birthYear: '1989', gender: 'Nữ', hisPatientId: 'BN-TN-1024' },
            { id: 'HP-1006', hospital: H, name: '', cccd: '036098765432', birthYear: '1992', gender: 'Nam' }
        ];
        const day = dayKey(now);
        return {
            version: 1,
            summaries,
            redflags,
            profiles,
            counters: {
                kiosk: { [`${H}|${day}`]: 2 },
                exam: { [`${H}|Khoa Hô Hấp|${day}`]: 2, [`${H}|Khoa Nội Tổng Quát|${day}`]: 2 }
            }
        };
    }

    function createStore(options = {}) {
        const now = options.now || (() => new Date());
        const storage = options.storage || defaultStorage();
        const listeners = new Set();
        let channel = null;

        function save(nextState) {
            try { storage.setItem(STORAGE_KEY, JSON.stringify(nextState)); } catch (error) { /* chạy tiếp bằng bộ nhớ trong */ }
        }
        function load() {
            try {
                const parsed = JSON.parse(storage.getItem(STORAGE_KEY));
                if (parsed && parsed.version === 1 && Array.isArray(parsed.summaries)) return parsed;
            } catch (error) { /* dữ liệu hỏng: tạo lại seed */ }
            const seeded = seedState(now());
            save(seeded);
            return seeded;
        }
        let state = load();

        function emit() { listeners.forEach(fn => { try { fn(api); } catch (error) { console.error(error); } }); }
        function reloadFromOutside() { state = load(); emit(); }
        function commit() {
            save(state);
            if (channel) { try { channel.postMessage('changed'); } catch (error) { /* ignore */ } }
            emit();
        }

        if (options.broadcast !== false && typeof BroadcastChannel !== 'undefined') {
            try { channel = new BroadcastChannel(CHANNEL_NAME); channel.onmessage = reloadFromOutside; } catch (error) { channel = null; }
        }
        if (options.listenStorage !== false && typeof window !== 'undefined' && window.addEventListener) {
            window.addEventListener('storage', event => { if (event.key === STORAGE_KEY) reloadFromOutside(); });
        }

        const byTimeDesc = field => (a, b) => new Date(b[field]) - new Date(a[field]);
        const findSummary = id => state.summaries.find(item => item.id === id);

        const api = {
            getState: () => clone(state),
            reset() { state = seedState(now()); commit(); },
            subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },

            listSummaries: () => clone([...state.summaries].sort(byTimeDesc('time'))),
            getSummary: id => clone(findSummary(id)),
            addSummary(item) {
                const summary = { id: uid('S'), status: PENDING, conflict: false, time: now().toISOString(), ...item };
                state.summaries.unshift(summary);
                commit();
                return clone(summary);
            },
            issueKioskNumber(summaryId) {
                const summary = findSummary(summaryId);
                if (!summary) throw new Error(`Không tìm thấy bản tóm tắt ${summaryId}`);
                if (!summary.kioskNumber) {
                    const key = `${summary.hospital}|${dayKey(now())}`;
                    const next = (state.counters.kiosk[key] || 0) + 1;
                    state.counters.kiosk[key] = next;
                    summary.kioskNumber = `K-${pad3(next)}`;
                    summary.kioskIssuedAt = now().toISOString();
                    commit();
                }
                return { number: summary.kioskNumber, issuedAt: summary.kioskIssuedAt };
            },
            approveSummary(id, dept) {
                const summary = findSummary(id);
                if (!summary) throw new Error(`Không tìm thấy bản tóm tắt ${id}`);
                if (summary.status !== APPROVED) {
                    summary.status = APPROVED;
                    summary.approvedDept = dept || summary.aiDept;
                    summary.approvedAt = now().toISOString();
                    const key = `${summary.hospital}|${summary.approvedDept}|${dayKey(now())}`;
                    const next = (state.counters.exam[key] || 0) + 1;
                    state.counters.exam[key] = next;
                    summary.examNumber = pad3(next);
                    commit();
                }
                return clone(summary);
            },
            // MV-459: phần dọc LCD chỉ gồm số kiosk cấp trong ngày.
            pendingKioskQueue: hospital => clone(state.summaries
                .filter(item => item.kioskNumber && item.status === PENDING && item.hospital === hospital
                    && dayKey(item.kioskIssuedAt) === dayKey(now()))
                .sort((a, b) => new Date(a.kioskIssuedAt) - new Date(b.kioskIssuedAt)
                    || Number(a.kioskNumber.slice(2)) - Number(b.kioskNumber.slice(2)))),
            recentApproved: (hospital, limit = 20) => clone(state.summaries
                .filter(item => item.status === APPROVED && item.examNumber && item.hospital === hospital)
                .sort(byTimeDesc('approvedAt'))
                .slice(0, limit)),

            // MV-460: mẫu câu gọi bệnh nhân cấu hình theo bệnh viện, chưa cấu hình thì dùng mẫu mặc định.
            callTemplate: hospital => (state.callTemplates && state.callTemplates[hospital]) || DEFAULT_CALL_TEMPLATE,
            setCallTemplate(hospital, template) {
                state.callTemplates = { ...(state.callTemplates || {}), [hospital]: template };
                commit();
            },

            listRedflags: () => clone([...state.redflags].sort(byTimeDesc('time'))),
            addRedflag(item) {
                const alert = { id: uid('RF'), status: 'New', note: '', time: now().toISOString(), ...item };
                state.redflags.unshift(alert);
                commit();
                return clone(alert);
            },
            updateRedflag(id, patch) {
                const alert = state.redflags.find(item => item.id === id);
                if (!alert) return undefined;
                Object.assign(alert, patch);
                commit();
                return clone(alert);
            },

            findProfiles({ hospital, cccd, birthYear, gender, name }) {
                const nameKey = normalizeName(name);
                const seen = new Set();
                return clone(state.profiles.filter(profile => profile.hospital === hospital
                    && profile.cccd === cccd
                    && String(profile.birthYear) === String(birthYear)
                    && profile.gender === gender
                    && (!nameKey || normalizeName(profile.name) === nameKey))
                    .filter(profile => {
                        const identity = [normalizeName(profile.name), profile.cccd, profile.birthYear, profile.gender].join('|');
                        if (seen.has(identity)) return false;
                        seen.add(identity);
                        return true;
                    }));
            },
            createProfile(data) {
                const profile = {
                    id: uid('HP'), hospital: data.hospital, name: normalizeName(data.name), cccd: data.cccd,
                    birthYear: String(data.birthYear), gender: data.gender, hisPatientId: data.hisPatientId,
                    createdBy: data.createdBy, createdAt: now().toISOString()
                };
                state.profiles.push(profile);
                commit();
                return clone(profile);
            },
            findOrCreateHisProfile(hisPatient, hospital, createdBy) {
                const linked = state.profiles.find(profile => profile.hisPatientId === hisPatient.patientId && profile.hospital === hospital);
                if (linked) return clone(linked);
                return api.createProfile({
                    hospital, name: hisPatient.name, cccd: hisPatient.cccd, birthYear: hisPatient.dob.slice(0, 4),
                    gender: hisPatient.gender, hisPatientId: hisPatient.patientId, createdBy
                });
            }
        };
        return api;
    }

    return { createStore, seedState, dayKey, maskCccd, normalizeName, STORAGE_KEY, DEFAULT_HOSPITAL, DEFAULT_CALL_TEMPLATE };
});
