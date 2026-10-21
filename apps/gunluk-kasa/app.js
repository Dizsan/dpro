/**
 * ==========================================================================
 * DİZSAN GÜNLÜK KASA FORMU & KASA TAKİP SİSTEMİ (app.js)
 * Sürüm: v1.0.1 (%100 Manuel Giriş & Bağımsız Mod)
 * - Hiçbir dış veritabanından (Logo/SQL/ERP) veya hazır örnekten veri çekmez.
 * - Tüm tablolar 0,00 TL olarak sıfırdan başlar ve tamamen MANUEL girilir.
 * - Hem tablo içi hızlı manuel giriş satırları hem de detaylı kayıt penceresi vardır.
 * - Şifreli Giriş & 4 Kademeli Rol / Granüler Yetki Matrisi:
 *   1) Tam Yetki / Yönetici (Görüntüleme + Ekleme + Değişiklik + Silme + Yetki Yönetimi)
 *   2) Değişiklik / Düzenleme Yetkisi (Görüntüleme + Ekleme + Değişiklik + Silme)
 *   3) Sadece Ekleme Yetkisi (Görüntüleme + Yeni Kayıt Ekleme — Değişiklik/Silme Kilitli)
 *   4) Sadece Görüntüleme (Salt Okunur + A4/Excel Çıktı)
 * - Eski Excel "GÜNLÜK KASA FORMU" Birebir A4 Baskı Motoru
 * ==========================================================================
 */

const CURRENT_APP_VERSION = "1.0.5";
window.CURRENT_APP_VERSION = CURRENT_APP_VERSION;

const OLD_DEMO_STORAGE_KEY = "dizsan_gunluk_kasa_state_v1";
const STORAGE_KEY_KASA_STATE = "dizsan_gunluk_kasa_manual_v2";
const STORAGE_KEY_KASA_SESSION = "dizsan_gunluk_kasa_active_user";
const STORAGE_KEY_KASA_REMEMBER = "dizsan_gunluk_kasa_remember";
const STORAGE_KEY_KASA_THEME = "dizsan_gunluk_kasa_theme";

const DEFAULT_PIN_STAMP = "3592512679-3759997292-303417646"; // "123456"
const CORP_MAIL_HOST = ["dizsan", "com", "tr"].join(".");

// ==================== 1. SHA-256 VE KULLANICI DOĞRULAMA ====================
function sha256Hex(str) {
    const utf8 = unescape(encodeURIComponent(String(str)));
    const K = [
        0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
        0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
        0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
        0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
        0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
        0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
        0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
        0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
    ];
    const H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    const words = [];
    for (let i = 0; i < utf8.length; i++) {
        words[i >> 2] |= (utf8.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
    }
    const bitLen = utf8.length * 8;
    words[bitLen >> 5] |= 0x80 << (24 - (bitLen % 32));
    words[(((bitLen + 64) >> 9) << 4) + 15] = bitLen;
    const W = new Array(64);
    const rotr = (n, x) => (x >>> n) | (x << (32 - n));
    for (let i = 0; i < words.length; i += 16) {
        let [a, b, c, d, e, f, g, h] = H;
        for (let t = 0; t < 64; t++) {
            if (t < 16) W[t] = words[i + t] | 0;
            else {
                const s0 = rotr(7, W[t - 15]) ^ rotr(18, W[t - 15]) ^ (W[t - 15] >>> 3);
                const s1 = rotr(17, W[t - 2]) ^ rotr(19, W[t - 2]) ^ (W[t - 2] >>> 10);
                W[t] = (W[t - 16] + s0 + W[t - 7] + s1) | 0;
            }
            const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
            const ch = (e & f) ^ (~e & g);
            const temp1 = (h + S1 + ch + K[t] + W[t]) | 0;
            const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
            const maj = (a & b) ^ (a & c) ^ (b & c);
            const temp2 = (S0 + maj) | 0;
            h = g; g = f; f = e; e = (d + temp1) | 0;
            d = c; c = b; b = a; a = (temp1 + temp2) | 0;
        }
        H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
        H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }
    return H.map(v => (v >>> 0).toString(16).padStart(8, "0")).join("");
}

function hashPin(val) {
    const s = String(val || "").trim();
    if (!s) return "";
    if (/^\d{6,10}-\d{6,10}-\d{6,10}$/.test(s)) return s;
    const hex = sha256Hex("dizsan_auth_v1:" + s);
    return `${parseInt(hex.slice(0, 8), 16)}-${parseInt(hex.slice(8, 16), 16)}-${parseInt(hex.slice(16, 24), 16)}`;
}

function verifyUserPin(user, inputVal) {
    if (!user) return false;
    const candidate = String(inputVal || "").trim();
    if (!candidate) return false;
    const stored = user.pinStamp || DEFAULT_PIN_STAMP;
    return stored === hashPin(candidate) || stored === candidate;
}

// ==================== 2. ROL VE YETKİ MATRİSİ (RBAC) ====================
const ROLE_PRESETS = {
    ADMIN: {
        code: "ADMIN",
        label: "Tam Yetki (Yönetici)",
        badgeClass: "badge-success",
        permissions: { view: true, add: true, edit: true, delete: true, lockDay: true, manageUsers: true }
    },
    EDITOR: {
        code: "EDITOR",
        label: "Değişiklik & Düzenleme",
        badgeClass: "badge-info",
        permissions: { view: true, add: true, edit: true, delete: true, lockDay: true, manageUsers: false }
    },
    CONTRIBUTOR: {
        code: "CONTRIBUTOR",
        label: "Sadece Ekleme Yetkisi",
        badgeClass: "badge-warning",
        permissions: { view: true, add: true, edit: false, delete: false, lockDay: false, manageUsers: false }
    },
    VIEWER: {
        code: "VIEWER",
        label: "Sadece Görüntüleme",
        badgeClass: "badge-info",
        permissions: { view: true, add: false, edit: false, delete: false, lockDay: false, manageUsers: false }
    },
    NONE: {
        code: "NONE",
        label: "Hiçbiri (Erişime Kapalı / Erişim Engeli)",
        badgeClass: "badge-danger",
        permissions: { view: false, add: false, edit: false, delete: false, lockDay: false, manageUsers: false }
    }
};

const DEFAULT_USERS = [
    {
        order: 0,
        name: "ÖMER EREN",
        username: "ömer",
        email: `oeren@${CORP_MAIL_HOST}`,
        pinStamp: "2697120930-1230232798-23831670",
        dept: "Yönetim Kurulu / Sistem Yöneticisi",
        rolePreset: "ADMIN",
        permissions: { view: true, add: true, edit: true, delete: true, lockDay: true, manageUsers: true }
    },
    {
        order: 1,
        name: "GÖKHAN ÖZBULUT",
        username: "gokhan.ozbulut",
        email: `gozbulut@${CORP_MAIL_HOST}`,
        pinStamp: "3741314348-4038843960-1626309061",
        dept: "Kasa Sorumlusu / Muhasebe & Finans",
        rolePreset: "EDITOR",
        permissions: { view: true, add: true, edit: true, delete: true, lockDay: true, manageUsers: false }
    },
    {
        order: 2,
        name: "RAFET CANBEK",
        username: "rafet.canbek",
        email: `rcanbek@${CORP_MAIL_HOST}`,
        pinStamp: DEFAULT_PIN_STAMP,
        dept: "Genel Müdür / Kontrol Eden",
        rolePreset: "ADMIN",
        permissions: { view: true, add: true, edit: true, delete: true, lockDay: true, manageUsers: true }
    },
    {
        order: 3,
        name: "ERTUĞRUL ERDEM",
        username: "ertugrul.erdem",
        email: `eerdem@${CORP_MAIL_HOST}`,
        pinStamp: DEFAULT_PIN_STAMP,
        dept: "Servis Danışmanı (Kayıt Ekleme)",
        rolePreset: "CONTRIBUTOR",
        permissions: { view: true, add: true, edit: false, delete: false, lockDay: false, manageUsers: false }
    },
    {
        order: 4,
        name: "NECATİ DEMİRCİ",
        username: "necati.demirci",
        email: `ndemirci@${CORP_MAIL_HOST}`,
        pinStamp: DEFAULT_PIN_STAMP,
        dept: "Servis Danışmanı (Kayıt Ekleme)",
        rolePreset: "CONTRIBUTOR",
        permissions: { view: true, add: true, edit: false, delete: false, lockDay: false, manageUsers: false }
    },
    {
        order: 5,
        name: "HAKAN AYDIN",
        username: "hakan.aydin",
        email: `haydin@${CORP_MAIL_HOST}`,
        pinStamp: "3552174369-58562770-3993401784",
        dept: "Servis Müdürü (Görüntüleme)",
        rolePreset: "VIEWER",
        permissions: { view: true, add: false, edit: false, delete: false, lockDay: false, manageUsers: false }
    },
    {
        order: 6,
        name: "FATİH KIROĞLU",
        username: "fatih.kiroglu",
        email: `fkiroglu@${CORP_MAIL_HOST}`,
        pinStamp: "567307289-1446660830-2254300224",
        dept: "Yedek Parça / Depo (Görüntüleme)",
        rolePreset: "VIEWER",
        permissions: { view: true, add: false, edit: false, delete: false, lockDay: false, manageUsers: false }
    }
];

function getUserPerms(u = currentUser) {
    if (!u) return { view: false, add: false, edit: false, delete: false, lockDay: false, manageUsers: false };
    if (normalizeTR(u.username) === "ömer" || normalizeTR(u.name) === "ömer eren") {
        return { view: true, add: true, edit: true, delete: true, lockDay: true, manageUsers: true };
    }
    const preset = ROLE_PRESETS[u.rolePreset] || ROLE_PRESETS.VIEWER;
    return {
        ...preset.permissions,
        ...(u.permissions || {})
    };
}

function hasPermission(permKey, u = currentUser) {
    const p = getUserPerms(u);
    return Boolean(p[permKey]);
}

function assertPermission(permKey, actionLabel = "Bu işlem") {
    if (!currentUser) {
        alert("Lütfen önce şifrenizle giriş yapınız.");
        return false;
    }
    if (!hasPermission(permKey, currentUser)) {
        const roleInfo = ROLE_PRESETS[currentUser.rolePreset]?.label || currentUser.rolePreset;
        alert(`Yetki Sınırlaması: "${actionLabel}" için yetkiniz bulunmamaktadır.\n\nAktif Yetki Profiliniz: ${roleInfo}\n(Yetki değişikliği için Sistem Yöneticisi Ömer Eren ile iletişime geçiniz.)`);
        return false;
    }
    return true;
}

// ==================== 3. TARİH, PARA VE TDR TEDARİK YARDIMCILARI ====================
function normalizeTR(str) {
    return String(str || "").trim().toLocaleLowerCase("tr-TR");
}

function escapeHtml(str) {
    return String(str ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function todayISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function dateToISO(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function parseAnyDateToISO(str) {
    if (!str) return todayISO();
    const s = String(str).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const dotParts = s.split(".");
    if (dotParts.length === 3) {
        const dd = dotParts[0].padStart(2, "0");
        const mm = dotParts[1].padStart(2, "0");
        const yyyy = dotParts[2].length === 2 ? "20" + dotParts[2] : dotParts[2];
        return `${yyyy}-${mm}-${dd}`;
    }
    const slashParts = s.split("/");
    if (slashParts.length === 3) {
        const dd = slashParts[0].padStart(2, "0");
        const mm = slashParts[1].padStart(2, "0");
        const yyyy = slashParts[2].length === 2 ? "20" + slashParts[2] : slashParts[2];
        return `${yyyy}-${mm}-${dd}`;
    }
    return todayISO();
}

function parseAnyDateToObj(str) {
    const iso = parseAnyDateToISO(str);
    const [y, m, d] = iso.split("-").map(Number);
    if (!y || !m || !d) return new Date();
    return new Date(y, m - 1, d, 12, 0, 0);
}

function addDaysISO(isoStr, days) {
    const d = parseAnyDateToObj(isoStr);
    d.setDate(d.getDate() + Number(days || 0));
    return dateToISO(d);
}

function formatDateToTR(dateStr) {
    if (!dateStr) return "";
    const iso = parseAnyDateToISO(dateStr);
    const parts = iso.split("-");
    if (parts.length === 3) {
        return `${parts[2]}.${parts[1]}.${parts[0]}`;
    }
    return String(dateStr);
}

function formatDateSlashTR(dateStr) {
    if (!dateStr) return "";
    const iso = parseAnyDateToISO(dateStr);
    const parts = iso.split("-");
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return String(dateStr);
}

function formatDateTimeTR(dateObj = new Date()) {
    const pad = n => String(n).padStart(2, "0");
    return `${pad(dateObj.getDate())}.${pad(dateObj.getMonth() + 1)}.${dateObj.getFullYear()} ${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:${pad(dateObj.getSeconds())}`;
}

function formatNumberTR(amount) {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num);
}

function formatMoneyTR(amount) {
    return `${formatNumberTR(amount)} ₺`;
}

function parseMoneyInputTR(rawVal) {
    if (rawVal === null || rawVal === undefined) return 0;
    if (typeof rawVal === "number") return isFinite(rawVal) ? rawVal : 0;
    let s = String(rawVal).trim().replace(/[₺\s]/g, "");
    if (!s) return 0;
    if (s.includes(",")) {
        s = s.replace(/\./g, "").replace(",", ".");
    } else {
        const dotCount = (s.match(/\./g) || []).length;
        if (dotCount > 1) {
            s = s.replace(/\./g, "");
        } else if (dotCount === 1) {
            const parts = s.split(".");
            if (parts[1] && parts[1].length === 3) {
                s = s.replace(/\./g, "");
            }
        }
    }
    const n = parseFloat(s);
    return isFinite(n) ? n : 0;
}

function formatMoneyInputLive(inputEl) {
    if (!inputEl) return;
    const raw = String(inputEl.value || "");
    if (!raw) return;

    const cleaned = raw.replace(/[^0-9,]/g, "");
    const commaIdx = cleaned.indexOf(",");
    let intPart = commaIdx !== -1 ? cleaned.slice(0, commaIdx) : cleaned;
    let decPart = commaIdx !== -1 ? cleaned.slice(commaIdx + 1).replace(/,/g, "").slice(0, 2) : null;

    intPart = intPart.replace(/^0+(?=\d)/, "");
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    const nextVal = decPart !== null ? `${formattedInt || "0"},${decPart}` : formattedInt;
    if (inputEl.value !== nextVal) {
        inputEl.value = nextVal;
    }
}

function isTdrSupplyItem(entry) {
    if (!entry) return false;
    const code = String(entry.code || "").trim().toUpperCase();
    const desc = String(entry.desc || "").trim().toUpperCase();
    const col1 = String(entry.col1 || "").trim().toUpperCase();
    if (/^TDR([.\-\s]|$)/i.test(code) || code.startsWith("TDR")) return true;
    if (/^TDR([.\-\s]|$)/i.test(desc) || /^TDR([.\-\s]|$)/i.test(col1)) return true;
    if (code.includes("TEDAR") || desc.includes("TEDARİK") || desc.includes("TEDARIK")) return true;
    return false;
}

const SECTION_LABELS = {
    CASH_IN: "Nakit Kasa Girişi",
    CASH_OUT: "Günlük Nakit Ödeme",
    POS_CC: "Kredi Kartı (POS)",
    CARI_CC: "Şirket Kredi Kartı ile Ödeme (Gider)",
    CHECK_OUT: "Çek - Senet Çıkışı",
    CHECK_CARI_BANK: "Çek Çıkış Cari / Banka",
    WIRE_IN: "Gelen Havale",
    WIRE_OUT: "Giden Havale"
};

// ==================== 4. %100 SIFIRDAN MANUEL BAŞLANGIÇ VERİTABANI (DIŞ VERİ ÇEKMEZ) ====================
function buildInitialState() {
    return {
        version: CURRENT_APP_VERSION,
        updatedAt: formatDateTimeTR(),
        updatedAtMs: Date.now(),
        stateRevision: 1,
        users: DEFAULT_USERS.map(u => ({ ...u, permissions: { ...u.permissions } })),
        days: {},
        auditLogs: [
            {
                timestamp: formatDateTimeTR(),
                user: "Sistem",
                category: "SİSTEM",
                detail: "Dizsan Günlük Kasa Formu %100 manuel giriş modunda (0,00 TL başlangıç ile) hazırlandı."
            }
        ]
    };
}

let appState = buildInitialState();
let currentUser = null;
let activePasswordReset = null;

const uiState = {
    activeTab: "form",
    selectedDateISO: todayISO()
};

// ==================== 5. DENETİM LOG MOTORU ====================
function addAuditLog(category, detail) {
    if (!Array.isArray(appState.auditLogs)) appState.auditLogs = [];
    appState.auditLogs.unshift({
        timestamp: formatDateTimeTR(),
        user: currentUser ? currentUser.name : "Sistem",
        category: category || "İŞLEM",
        detail: detail || ""
    });
    if (appState.auditLogs.length > 500) {
        appState.auditLogs.length = 500;
    }
}

// ==================== 6. ZİNCİRLEME KASA DEVRİ VE GÜNLÜK HESAPLAMA MOTORU ====================
function ensureDayObject(dateISO) {
    const iso = parseAnyDateToISO(dateISO);
    if (!appState.days) appState.days = {};
    if (!appState.days[iso]) {
        const prevISO = addDaysISO(iso, -1);
        appState.days[iso] = {
            dateISO: iso,
            euroRate: "--",
            usdRate: "--",
            prevInOverride: null,
            prevOutOverride: null,
            carryoverOverride: null,
            carryoverLabel: `${formatDateSlashTR(prevISO)} TARİHLİ KASA DEVRİ ( + ) BAKİYESİ`,
            cashierName: "GÖKHAN ÖZBULUT",
            controllerName: "RAFET CANBEK",
            controllerApproved: false,
            isLocked: false,
            entries: []
        };
    }
    if (!Array.isArray(appState.days[iso].entries)) {
        appState.days[iso].entries = [];
    }
    return appState.days[iso];
}

function calculateDayMetrics(targetDateISO) {
    const targetISO = parseAnyDateToISO(targetDateISO);
    ensureDayObject(targetISO);

    const allDates = Object.keys(appState.days || {}).sort();
    if (!allDates.includes(targetISO)) {
        allDates.push(targetISO);
        allDates.sort();
    }

    let runningBalance = 0;
    let lastProcessedISO = null;
    const metricsByDate = {};

    for (const iso of allDates) {
        const dayObj = appState.days[iso] || ensureDayObject(iso);
        const entries = dayObj.entries || [];

        const hasOverride = dayObj.carryoverOverride !== null && dayObj.carryoverOverride !== undefined && dayObj.carryoverOverride !== "";
        const carryover = hasOverride ? (Number(dayObj.carryoverOverride) || 0) : runningBalance;
        const carrySourceDateISO = lastProcessedISO || addDaysISO(iso, -1);

        const sumSection = (sec) => entries
            .filter(e => e.section === sec)
            .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

        const cashInEntriesSum = Number(sumSection("CASH_IN").toFixed(2));
        const cashOutSum = Number(sumSection("CASH_OUT").toFixed(2));
        const posCcSum = Number(sumSection("POS_CC").toFixed(2));
        const cariCcSum = Number(sumSection("CARI_CC").toFixed(2));
        const checkOutSum = Number(sumSection("CHECK_OUT").toFixed(2));
        const checkCariSum = Number(sumSection("CHECK_CARI_BANK").toFixed(2));
        const wireInSum = Number(sumSection("WIRE_IN").toFixed(2));
        const wireOutSum = Number(sumSection("WIRE_OUT").toFixed(2));

        const totalGelirAll = Number((cashInEntriesSum + posCcSum + wireInSum).toFixed(2));
        const totalGiderAll = Number((cashOutSum + wireOutSum + cariCcSum + checkOutSum + checkCariSum).toFixed(2));
        const totalInWithCarry = Number((carryover + totalGelirAll).toFixed(2));
        const netClosing = Number((carryover + totalGelirAll - totalGiderAll).toFixed(2));

        metricsByDate[iso] = {
            dateISO: iso,
            carrySourceDateISO,
            carryover,
            hasOverride,
            cashInEntriesSum,
            totalGelirAll,
            totalGiderAll,
            totalInWithCarry,
            cashOutSum,
            netClosing,
            posCcSum,
            cariCcSum,
            checkOutSum,
            checkCariSum,
            wireInSum,
            wireOutSum
        };

        runningBalance = netClosing;
        lastProcessedISO = iso;
    }

    const currentMetrics = metricsByDate[targetISO];
    const currentDayObj = appState.days[targetISO];
    const prevDateISO = addDaysISO(targetISO, -1);
    const computedPrev = metricsByDate[prevDateISO] || {
        dateISO: prevDateISO,
        totalInWithCarry: currentMetrics.carryover,
        cashOutSum: 0,
        netClosing: currentMetrics.carryover
    };

    const prevMetrics = {
        dateISO: prevDateISO,
        totalInWithCarry: (currentDayObj.prevInOverride !== null && currentDayObj.prevInOverride !== undefined && currentDayObj.prevInOverride !== "")
            ? Number(currentDayObj.prevInOverride)
            : computedPrev.totalInWithCarry,
        cashOutSum: (currentDayObj.prevOutOverride !== null && currentDayObj.prevOutOverride !== undefined && currentDayObj.prevOutOverride !== "")
            ? Number(currentDayObj.prevOutOverride)
            : computedPrev.cashOutSum,
        netClosing: currentMetrics.carryover
    };

    return {
        dayObj: currentDayObj,
        current: currentMetrics,
        prev: prevMetrics,
        allMetrics: metricsByDate
    };
}

// ==================== 7. YEREL KAYIT MOTORU (DIŞ SİSTEMDEN VERİ ÇEKMEZ) ====================
function setSyncBadge(mode) {
    const ind = document.getElementById("sync-status-indicator");
    if (!ind) return;
    if (mode === "saving") {
        ind.innerHTML = `<i class="fa-solid fa-rotate fa-spin" style="color:var(--dizsan-cyan);"></i> Kaydediliyor...`;
    } else {
        ind.innerHTML = `<i class="fa-solid fa-circle-check" style="color:var(--emerald-ok);"></i> Manuel Kayıt Aktif`;
    }
}

function saveStateLocally() {
    try {
        localStorage.removeItem(OLD_DEMO_STORAGE_KEY);
        localStorage.setItem(STORAGE_KEY_KASA_STATE, JSON.stringify(appState));
    } catch (e) {}
}

async function syncStateToServer() {
    const nowMs = Date.now();
    appState.updatedAtMs = nowMs;
    appState.updatedAt = formatDateTimeTR(new Date(nowMs));
    appState.stateRevision = (Number(appState.stateRevision) || 0) + 1;
    appState.version = CURRENT_APP_VERSION;
    saveStateLocally();
    setSyncBadge("saving");

    try {
        if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
            await fetch("/api/kasa-state", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(appState)
            });
        }
    } catch (e) {}

    setSyncBadge("ok");
}

async function loadStateFromStorageAndServer() {
    let localCandidate = null;
    try {
        localStorage.removeItem(OLD_DEMO_STORAGE_KEY);
        const raw = localStorage.getItem(STORAGE_KEY_KASA_STATE);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.days && Array.isArray(parsed.users)) {
                localCandidate = parsed;
            }
        }
    } catch (e) {}

    let remoteCandidate = null;
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (isLocal) {
        try {
            const res = await fetch("/api/kasa-state?t=" + Date.now(), { cache: "no-store" });
            if (res.ok) {
                const srv = await res.json();
                if (srv && srv.days && Array.isArray(srv.users)) {
                    remoteCandidate = srv;
                }
            }
        } catch (e) {}
    }

    if (!remoteCandidate) {
        try {
            const resFile = await fetch("shared_state.json?t=" + Date.now(), { cache: "no-store" });
            if (resFile.ok) {
                const fileData = await resFile.json();
                if (fileData && fileData.days && Array.isArray(fileData.users)) {
                    remoteCandidate = fileData;
                }
            }
        } catch (e) {}
    }

    if (localCandidate && remoteCandidate) {
        const localRev = Number(localCandidate.stateRevision) || 0;
        const remoteRev = Number(remoteCandidate.stateRevision) || 0;
        const localMs = Number(localCandidate.updatedAtMs) || 0;
        const remoteMs = Number(remoteCandidate.updatedAtMs) || 0;

        if (remoteRev > localRev || (remoteRev === localRev && remoteMs > localMs)) {
            appState = { ...buildInitialState(), ...remoteCandidate };
            saveStateLocally();
        } else {
            appState = { ...buildInitialState(), ...localCandidate };
            if (isLocal && (localRev > remoteRev || localMs > remoteMs)) {
                syncStateToServer();
            }
        }
    } else if (remoteCandidate) {
        appState = { ...buildInitialState(), ...remoteCandidate };
        saveStateLocally();
    } else if (localCandidate) {
        appState = { ...buildInitialState(), ...localCandidate };
        if (isLocal) syncStateToServer();
    }
}

// ==================== 8. YETKİ KALKANI VE ARAYÜZ UYGULAMASI ====================
function applyRolePermissionsToDOM() {
    const perms = getUserPerms(currentUser);
    const preset = ROLE_PRESETS[currentUser?.rolePreset] || ROLE_PRESETS.VIEWER;

    const roleBadge = document.getElementById("active-role-badge");
    const sideRole = document.getElementById("sidebar-user-role");
    const banner = document.getElementById("role-permission-banner");

    if (roleBadge) {
        roleBadge.className = `badge ${preset.badgeClass}`;
        roleBadge.innerHTML = `<i class="fa-solid fa-shield-halved"></i> ${escapeHtml(preset.label)}`;
    }
    if (sideRole) {
        sideRole.textContent = `${preset.label} • ${currentUser?.dept || ""}`;
    }

    if (banner) {
        if (!perms.view) {
            banner.style.display = "flex";
            banner.style.background = "rgba(244, 63, 94, 0.22)";
            banner.style.border = "1px solid rgba(244, 63, 94, 0.55)";
            banner.style.color = "#fecdd3";
            banner.innerHTML = `
                <span><i class="fa-solid fa-ban"></i> <strong>Erişim Engeli / Erişime Kapalı:</strong> Bu kullanıcı hesabı için kasa erişim yetkisi kapatılmıştır.</span>
                <span class="badge badge-danger">Erişime Kapalı</span>
            `;
        } else if (!perms.add && !perms.edit) {
            banner.style.display = "flex";
            banner.style.background = "rgba(56, 189, 248, 0.14)";
            banner.style.border = "1px solid rgba(56, 189, 248, 0.38)";
            banner.style.color = "#e0f2fe";
            banner.innerHTML = `
                <span><i class="fa-solid fa-eye"></i> <strong>Salt Okunur (Sadece Görüntüleme) Yetkisi:</strong> Günlük kasa formlarını inceleyebilir ve <strong>A4 / Excel çıktısı</strong> alabilirsiniz.</span>
                <span class="badge badge-info">Sadece Görüntüleme</span>
            `;
        } else if (perms.add && !perms.edit) {
            banner.style.display = "flex";
            banner.style.background = "rgba(245, 158, 11, 0.14)";
            banner.style.border = "1px solid rgba(245, 158, 11, 0.4)";
            banner.style.color = "#fde68a";
            banner.innerHTML = `
                <span><i class="fa-solid fa-plus-circle"></i> <strong>Sadece Ekleme Yetkisi:</strong> Tablolara <strong>yeni kayıt ekleyebilir</strong> ve <strong>A4 çıktı</strong> alabilirsiniz. Mevcut kayıtlar üzerinde değişiklik veya silme yapılamaz.</span>
                <span class="badge badge-warning">Sadece Ekleme</span>
            `;
        } else {
            banner.style.display = "none";
        }
    }

    document.querySelectorAll(".perm-require-add").forEach(el => {
        el.disabled = !perms.add;
        el.classList.toggle("disabled-by-role", !perms.add);
    });

    document.querySelectorAll(".perm-require-edit").forEach(el => {
        el.disabled = !perms.edit;
        el.classList.toggle("disabled-by-role", !perms.edit);
    });

    document.querySelectorAll(".perm-require-admin").forEach(el => {
        el.disabled = !perms.manageUsers;
        el.classList.toggle("disabled-by-role", !perms.manageUsers);
    });

    ["fx-eur-input", "fx-usd-input", "sig-cashier-input", "sig-controller-input"].forEach(id => {
        const inp = document.getElementById(id);
        if (inp) inp.readOnly = !perms.edit;
    });
}

// ==================== 9. KART ALTI HIZLI KAYIT EKLEME & ALT SEKME GEÇİŞİ ====================
let activeSubtableTab = "POS_CC";
let showAllSubtablesMode = false;

function switchSubtableTab(subKey) {
    activeSubtableTab = subKey;
    document.querySelectorAll(".subtable-tab-btn").forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-subtab") === subKey);
    });
    document.querySelectorAll(".subtable-pane").forEach(pane => {
        pane.classList.toggle("active", pane.getAttribute("data-subpane") === subKey);
    });
}

function toggleShowAllSubtables() {
    showAllSubtablesMode = !showAllSubtablesMode;
    const container = document.getElementById("subtables-body-container");
    const tabsBar = document.getElementById("subtable-tabs-bar");
    const lbl = document.getElementById("lbl-toggle-all-subtables");
    if (container) container.classList.toggle("show-all-grid", showAllSubtablesMode);
    if (tabsBar) tabsBar.style.display = showAllSubtablesMode ? "none" : "grid";
    if (lbl) lbl.textContent = showAllSubtablesMode ? "Sekmeli Görünüme Dön" : "Tümünü Açık Göster";
}

function handleInlineQuickAdd(sectionKey) {
    if (!assertPermission("add", "Yeni manuel kayıt ekleme")) return;
    const iso = uiState.selectedDateISO;
    const dayObj = ensureDayObject(iso);
    if (dayObj.isLocked && !hasPermission("manageUsers")) {
        alert("Bu gün kilitlenmiştir.");
        return;
    }

    const col1El = document.getElementById(`q-col1-${sectionKey}`) || document.getElementById(`inline-col1-${sectionKey}`);
    const dueEl = document.getElementById(`q-due-${sectionKey}`) || document.getElementById(`inline-due-${sectionKey}`);
    const descEl = document.getElementById(`q-desc-${sectionKey}`) || document.getElementById(`inline-desc-${sectionKey}`);
    const amtEl = document.getElementById(`q-amt-${sectionKey}`) || document.getElementById(`inline-amt-${sectionKey}`);

    const col1 = (col1El ? col1El.value : "").trim().toUpperCase();
    const dueDate = (dueEl ? dueEl.value : "").trim();
    const desc = (descEl ? descEl.value : "").trim().toUpperCase();
    const amount = parseMoneyInputTR(amtEl ? amtEl.value : 0);

    if (!desc || amount <= 0) {
        alert("Lütfen açıklama ve 0'dan büyük bir tutar yazınız.");
        if (descEl && !desc) descEl.focus();
        else if (amtEl) amtEl.focus();
        return;
    }

    dayObj.entries.push({
        id: `ENT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        dateISO: iso,
        section: sectionKey,
        col1,
        desc,
        dueDate: dueDate ? parseAnyDateToISO(dueDate) : "",
        amount,
        code: "",
        createdBy: currentUser ? currentUser.name : "Sistem",
        createdAt: formatDateTimeTR()
    });

    if (col1El) col1El.value = "";
    if (dueEl) dueEl.value = "";
    if (descEl) descEl.value = "";
    if (amtEl) amtEl.value = "";

    addAuditLog("MANUEL GİRİŞ", `${formatDateToTR(iso)} [${SECTION_LABELS[sectionKey]}] "${desc}" (${formatMoneyTR(amount)}) manuel eklendi.`);
    syncStateToServer();
    renderAll();

    setTimeout(() => {
        if (descEl) descEl.focus();
    }, 30);
}

function handleInlineKeydown(event, sectionKey) {
    if (event.key === "Enter") {
        event.preventDefault();
        handleInlineQuickAdd(sectionKey);
    }
}

// ==================== 10. GÜNLÜK KASA FORMU RENDER MOTORU (SADE VE TEMİZ EKRAN) ====================
function isGelirSection(sectionKey) {
    return sectionKey === "CASH_IN" || sectionKey === "POS_CC" || sectionKey === "WIRE_IN";
}

function renderDailyFormSection() {
    const iso = uiState.selectedDateISO;
    const { dayObj, current } = calculateDayMetrics(iso);
    const perms = getUserPerms(currentUser);
    const isDayLocked = Boolean(dayObj.isLocked);
    const canModifyToday = !isDayLocked || perms.manageUsers;

    const dateInput = document.getElementById("kasa-date-input");
    if (dateInput) dateInput.value = formatDateToTR(iso);

    const eurIn = document.getElementById("fx-eur-input");
    const usdIn = document.getElementById("fx-usd-input");
    if (eurIn) eurIn.value = dayObj.euroRate || "--";
    if (usdIn) usdIn.value = dayObj.usdRate || "--";
    updateTcmbBadgeLabel(iso);

    const entries = dayObj.entries || [];

    const totalGelirAll = Number((current.cashInEntriesSum + current.posCcSum + current.wireInSum).toFixed(2));
    const totalGiderAll = Number((current.cashOutSum + current.wireOutSum + current.cariCcSum + current.checkOutSum + current.checkCariSum).toFixed(2));
    const netKasaAll = Number((current.carryover + totalGelirAll - totalGiderAll).toFixed(2));

    const sumCarryEl = document.getElementById("clean-sum-carry");
    const sumInEl = document.getElementById("clean-sum-in");
    const sumOutEl = document.getElementById("clean-sum-out");
    const sumNetEl = document.getElementById("clean-sum-net");

    if (sumCarryEl) sumCarryEl.textContent = formatMoneyTR(current.carryover);
    if (sumInEl) sumInEl.textContent = formatMoneyTR(totalGelirAll);
    if (sumOutEl) sumOutEl.textContent = formatMoneyTR(totalGiderAll);
    if (sumNetEl) sumNetEl.textContent = formatMoneyTR(netKasaAll);

    const buildActionButtons = (entryId) => {
        const canEditRow = perms.edit && canModifyToday;
        const canDelRow = perms.delete && canModifyToday;
        if (!canEditRow && !canDelRow) {
            return `<span style="font-size:0.66rem; color:var(--text-muted);" title="Değişiklik yetkisi kapalı"><i class="fa-solid fa-lock"></i></span>`;
        }
        return `
            <div class="row-actions">
                ${canEditRow ? `<button class="btn btn-xs" onclick="openEditEntryModal('${escapeHtml(entryId)}')" title="Değiştir / Düzenle"><i class="fa-solid fa-pen" style="color:var(--dizsan-cyan);"></i></button>` : ""}
                ${canDelRow ? `<button class="btn btn-xs" onclick="deleteEntry('${escapeHtml(entryId)}')" title="Kaydı Sil"><i class="fa-solid fa-trash" style="color:var(--rose-danger);"></i></button>` : ""}
            </div>
        `;
    };

    const renderTdrBadge = (entry) => isTdrSupplyItem(entry)
        ? ` <span class="badge badge-tdr" title="TDR Kuralı: Tedarik Hizmetler / Parça Kalemi">TDR TEDARİK</span>`
        : "";

    const tbodyClean = document.getElementById("tbody-clean-entries");
    if (tbodyClean) {
        if (entries.length === 0) {
            tbodyClean.innerHTML = `<tr><td colspan="6" class="empty-row-placeholder">Henüz gelir veya gider kaydı eklenmedi. Üstteki "Ekle" düğmesine basarak kayıt ekleyebilirsiniz.</td></tr>`;
        } else {
            tbodyClean.innerHTML = entries.map(e => {
                const isGelir = isGelirSection(e.section);
                const flowBadge = isGelir
                    ? `<span class="badge badge-success"><i class="fa-solid fa-arrow-down-long"></i> GELİR</span>`
                    : `<span class="badge badge-danger"><i class="fa-solid fa-arrow-up-long"></i> GİDER</span>`;
                const amtColor = isGelir ? "#34d399" : "#fb7185";
                const sign = isGelir ? "+" : "-";
                const dueExtra = e.dueDate ? ` <span class="badge badge-info" style="font-size:0.62rem;">Vade: ${escapeHtml(formatDateToTR(e.dueDate))}</span>` : "";

                return `
                    <tr>
                        <td>${flowBadge}</td>
                        <td><strong>${escapeHtml(SECTION_LABELS[e.section] || e.section)}</strong></td>
                        <td>${escapeHtml(e.col1 || "-")}</td>
                        <td>${escapeHtml(e.desc)}${dueExtra}${renderTdrBadge(e)}</td>
                        <td class="amount-cell" style="color:${amtColor}; font-weight:800;">${sign}${formatNumberTR(e.amount)} ₺</td>
                        <td style="text-align:right;">${buildActionButtons(e.id)}</td>
                    </tr>
                `;
            }).join("");
        }
    }

    const badgeToday = document.getElementById("nav-badge-today-items");
    if (badgeToday) badgeToday.textContent = entries.length;
    const badgeDays = document.getElementById("nav-badge-days");
    if (badgeDays) badgeDays.textContent = Object.keys(appState.days || {}).length;
    const badgeUsers = document.getElementById("nav-badge-users");
    if (badgeUsers) badgeUsers.textContent = (appState.users || []).length;
}

// ==================== 11. BİREBİR KLASİK EXCEL FORMU & A4 BASKI RENDER MOTORU ====================
function renderA4SheetSection() {
    const iso = uiState.selectedDateISO;
    const { dayObj, current, prev } = calculateDayMetrics(iso);
    const sheet = document.getElementById("a4-printable-sheet");
    const toolbarDate = document.getElementById("a4-toolbar-date");
    if (toolbarDate) toolbarDate.textContent = formatDateToTR(iso);
    if (!sheet) return;

    const cashInList = (dayObj.entries || []).filter(e => e.section === "CASH_IN");
    const cashOutList = (dayObj.entries || []).filter(e => e.section === "CASH_OUT");
    const checkOutList = (dayObj.entries || []).filter(e => e.section === "CHECK_OUT");
    const checkCariList = (dayObj.entries || []).filter(e => e.section === "CHECK_CARI_BANK");
    const cariCcList = (dayObj.entries || []).filter(e => e.section === "CARI_CC");
    const wireOutList = (dayObj.entries || []).filter(e => e.section === "WIRE_OUT");
    const posCcList = (dayObj.entries || []).filter(e => e.section === "POS_CC");
    const wireInList = (dayObj.entries || []).filter(e => e.section === "WIRE_IN");

    const carryDesc = dayObj.carryoverLabel || `${formatDateSlashTR(current.carrySourceDateISO)} TARİHLİ KASA DEVRİ ( + ) BAKİYESİ`;

    const leftRows = [
        { col1: "KASA DEVRİ", desc: carryDesc, amount: current.carryover },
        ...cashInList.map(e => ({ col1: e.col1 || "", desc: e.desc || "", amount: e.amount }))
    ];
    const rightRows = cashOutList.map(e => ({ desc: e.desc || "", amount: e.amount }));

    const mainRowCount = Math.max(18, leftRows.length, rightRows.length);
    let mainRowsHtml = "";
    for (let i = 0; i < mainRowCount; i++) {
        const L = leftRows[i];
        const R = rightRows[i];
        mainRowsHtml += `
            <tr>
                <td style="font-weight:${i === 0 ? "700" : "400"};">${L ? escapeHtml(L.col1) : "&nbsp;"}</td>
                <td style="font-weight:${i === 0 ? "700" : "400"};">${L ? escapeHtml(L.desc) : "&nbsp;"}</td>
                <td class="excel-num" style="font-weight:${i === 0 ? "700" : "400"};">${L ? formatNumberTR(L.amount) : "&nbsp;"}</td>
                <td class="double-sep"></td>
                <td>${R ? escapeHtml(R.desc) : "&nbsp;"}</td>
                <td class="excel-num">${R ? formatNumberTR(R.amount) : "&nbsp;"}</td>
            </tr>
        `;
    }

    const build3ColRows = (items, minRows) => {
        const count = Math.max(minRows, items.length);
        let rows = "";
        for (let i = 0; i < count; i++) {
            const it = items[i];
            rows += `
                <tr>
                    <td style="width:24%;">${it ? escapeHtml(it.col1 || "") : "&nbsp;"}</td>
                    <td>${it ? escapeHtml(it.desc || "") : "&nbsp;"}</td>
                    <td class="excel-num" style="width:23%;">${it ? formatNumberTR(it.amount) : "&nbsp;"}</td>
                </tr>
            `;
        }
        return rows;
    };

    const checkOutRowCount = Math.max(2, checkOutList.length);
    let checkOutRowsHtml = "";
    for (let i = 0; i < checkOutRowCount; i++) {
        const it = checkOutList[i];
        checkOutRowsHtml += `
            <tr>
                <td style="width:20%;">${it ? escapeHtml(it.col1 || "") : "&nbsp;"}</td>
                <td style="width:18%; text-align:center;">${it ? escapeHtml(formatDateToTR(it.dueDate)) : "&nbsp;"}</td>
                <td>${it ? escapeHtml(it.desc || "") : "&nbsp;"}</td>
                <td class="excel-num" style="width:23%;">${it ? formatNumberTR(it.amount) : "&nbsp;"}</td>
            </tr>
        `;
    }

    sheet.innerHTML = `
        <table class="excel-top-title-table">
            <tr>
                <td style="width:11%; font-weight:700; text-align:center;">Euro Kuru</td>
                <td style="width:9%; text-align:center; font-weight:700;">${escapeHtml(dayObj.euroRate || "--")}</td>
                <td rowspan="2" class="main-form-heading" style="width:45%;">
                    <div style="font-size:15px; font-weight:800; letter-spacing:0.6px; color:#000;">GÜNLÜK KASA FORMU</div>
                </td>
                <td rowspan="2" style="width:35%; padding:2px 8px; vertical-align:middle; text-align:center;">
                    <img src="dizsan_full_logo.png" alt="Dizsan Logo" style="height:36px; width:auto; max-width:140px; object-fit:contain; display:inline-block; -webkit-print-color-adjust:exact; print-color-adjust:exact;">
                </td>
            </tr>
            <tr>
                <td style="font-weight:700; text-align:center;">Dolar Kuru</td>
                <td style="text-align:center; font-weight:700;">${escapeHtml(dayObj.usdRate || "--")}</td>
            </tr>
        </table>

        <table class="excel-main-kasa-table">
            <colgroup>
                <col style="width:11%;">
                <col style="width:28%;">
                <col style="width:11%;">
                <col style="width:1%;">
                <col style="width:37%;">
                <col style="width:12%;">
            </colgroup>
            <tbody>
                <tr>
                    <td>&nbsp;</td>
                    <td class="excel-bold-center">&nbsp;</td>
                    <td>&nbsp;</td>
                    <td class="double-sep"></td>
                    <td>&nbsp;</td>
                    <td class="excel-bold-center">${escapeHtml(formatDateToTR(prev.dateISO))}</td>
                </tr>
                <tr>
                    <td>&nbsp;</td>
                    <td class="excel-bold-center">DEVİR VE GİRİŞLER TOPLAMI</td>
                    <td class="excel-bold-right">${formatNumberTR(prev.totalInWithCarry)}</td>
                    <td class="double-sep"></td>
                    <td class="excel-bold-center">ÖDEMELER TOPLAMI</td>
                    <td class="excel-bold-right">${formatNumberTR(prev.cashOutSum)}</td>
                </tr>
                <tr>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td class="double-sep"></td>
                    <td class="excel-bold-center">BİR SONRAKİ GÜNE DEVREDEN BAKİYE</td>
                    <td class="excel-bold-right">${formatNumberTR(current.carryover)}</td>
                </tr>
                <tr>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td class="double-sep"></td>
                    <td>&nbsp;</td>
                    <td class="excel-bold-center">${escapeHtml(formatDateToTR(iso))}</td>
                </tr>

                ${mainRowsHtml}

                <tr>
                    <td>&nbsp;</td>
                    <td class="excel-bold-center">GİRİŞLER TOPLAMI</td>
                    <td class="excel-bold-right">${formatNumberTR(current.totalInWithCarry)}</td>
                    <td class="double-sep"></td>
                    <td class="excel-bold-center">ÖDEMELER TOPLAMI</td>
                    <td class="excel-bold-right">${formatNumberTR(current.cashOutSum)}</td>
                </tr>
                <tr>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td class="double-sep"></td>
                    <td class="excel-bold-center">GENEL TOPLAM</td>
                    <td class="excel-bold-right">${formatNumberTR(current.netClosing)}</td>
                </tr>
            </tbody>
        </table>

        <div class="excel-subtables-columns">
            <div>
                <table class="excel-sub-table">
                    <thead>
                        <tr><th colspan="4" class="sub-title">ÇEK - SENET ÇIKIŞI</th></tr>
                        <tr>
                            <th class="excel-bold-center" style="width:20%;">SENET/ ÇEK</th>
                            <th class="excel-bold-center" style="width:18%;">VADE</th>
                            <th class="excel-bold-center">MÜŞTERİ İSMİ</th>
                            <th class="excel-bold-center" style="width:23%;">MEBLAĞ</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${checkOutRowsHtml}
                        <tr>
                            <td colspan="3" class="excel-bold-center">TOPLAM</td>
                            <td class="excel-bold-right">${formatNumberTR(current.checkOutSum)}</td>
                        </tr>
                    </tbody>
                </table>

                <table class="excel-sub-table">
                    <thead><tr><th colspan="3" class="sub-title">ÇEK ÇIKIŞ CARİ HESAP / BANKA</th></tr></thead>
                    <tbody>
                        ${build3ColRows(checkCariList, 2)}
                        <tr>
                            <td colspan="2" class="excel-bold-center">TOPLAM</td>
                            <td class="excel-bold-right">${formatNumberTR(current.checkCariSum)}</td>
                        </tr>
                    </tbody>
                </table>

                <table class="excel-sub-table">
                    <thead><tr><th colspan="3" class="sub-title">CARİ KREDİ KARTI ÖDEMESİ</th></tr></thead>
                    <tbody>
                        ${build3ColRows(cariCcList, 8)}
                        <tr>
                            <td colspan="2" class="excel-bold-center">TOPLAM</td>
                            <td class="excel-bold-right">${formatNumberTR(current.cariCcSum)}</td>
                        </tr>
                    </tbody>
                </table>

                <table class="excel-sub-table">
                    <thead><tr><th colspan="3" class="sub-title">GİDEN HAVALE</th></tr></thead>
                    <tbody>
                        ${build3ColRows(wireOutList, 6)}
                        <tr>
                            <td colspan="2" class="excel-bold-center">TOPLAM</td>
                            <td class="excel-bold-right">${formatNumberTR(current.wireOutSum)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div>
                <table class="excel-sub-table">
                    <thead><tr><th colspan="3" class="sub-title">KREDİ KARTI</th></tr></thead>
                    <tbody>
                        ${build3ColRows(posCcList, 9)}
                        <tr>
                            <td colspan="2" class="excel-bold-center">TOPLAM</td>
                            <td class="excel-bold-right">${formatNumberTR(current.posCcSum)}</td>
                        </tr>
                    </tbody>
                </table>

                <table class="excel-sub-table" style="margin-top:10px;">
                    <thead><tr><th colspan="3" class="sub-title">GELEN HAVALE</th></tr></thead>
                    <tbody>
                        ${build3ColRows(wireInList, 7)}
                        <tr>
                            <td colspan="2" class="excel-bold-center">TOPLAM</td>
                            <td class="excel-bold-right">${formatNumberTR(current.wireInSum)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="excel-signatures-row">
            <div style="width:42%;">
                <table class="excel-sig-box" style="width:100%;">
                    <tr><td>KASA SORUMLUSU</td></tr>
                    <tr><td>${escapeHtml(dayObj.cashierName || "GÖKHAN ÖZBULUT")}</td></tr>
                </table>
                <div class="excel-sig-space"></div>
            </div>
            <div style="width:44%;">
                <table class="excel-sig-box" style="width:100%;">
                    <tr><td>KONTROL EDEN</td></tr>
                    <tr><td>${escapeHtml(dayObj.controllerName || "RAFET CANBEK")}</td></tr>
                </table>
                <div class="excel-sig-space"></div>
            </div>
        </div>
    `;
}

// ==================== 12. ARŞİV VE DETAYLI ARAMA RENDER MOTORU ====================
function renderArchiveSection() {
    const q = normalizeTR(document.getElementById("archive-search-input")?.value || "");
    const secFilter = document.getElementById("archive-section-filter")?.value || "ALL";
    const tdrFilter = document.getElementById("archive-tdr-filter")?.value || "ALL";

    const allDatesDesc = Object.keys(appState.days || {}).sort().reverse();
    const { allMetrics } = calculateDayMetrics(uiState.selectedDateISO);

    const matchedEntries = [];
    for (const dISO of allDatesDesc) {
        const dObj = appState.days[dISO];
        for (const ent of (dObj?.entries || [])) {
            if (secFilter !== "ALL" && ent.section !== secFilter) continue;
            if (tdrFilter === "ONLY_TDR" && !isTdrSupplyItem(ent)) continue;
            if (q) {
                const hay = normalizeTR(`${ent.col1 || ""} ${ent.desc || ""} ${ent.code || ""} ${formatDateToTR(dISO)}`);
                if (!hay.includes(q)) continue;
            }
            matchedEntries.push({ ...ent, dateISO: dISO });
        }
    }

    const tbodySearch = document.getElementById("tbody-archive-search");
    if (tbodySearch) {
        if (matchedEntries.length === 0) {
            tbodySearch.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:14px;">Henüz manuel girilmiş hareket bulunmuyor.</td></tr>`;
        } else {
            tbodySearch.innerHTML = matchedEntries.map(e => `
                <tr>
                    <td><strong>${escapeHtml(formatDateToTR(e.dateISO))}</strong></td>
                    <td><span class="badge badge-info">${escapeHtml(SECTION_LABELS[e.section] || e.section)}</span></td>
                    <td>${escapeHtml(e.col1 || "-")}</td>
                    <td>
                        ${escapeHtml(e.desc)}
                        ${isTdrSupplyItem(e) ? `<span class="badge badge-tdr">TDR TEDARİK</span>` : ""}
                    </td>
                    <td class="amount-cell">${formatMoneyTR(e.amount)}</td>
                    <td style="font-size:0.7rem; color:var(--text-muted);">${escapeHtml(e.createdBy || "-")}</td>
                    <td style="text-align:right;">
                        <button class="btn btn-xs" onclick="jumpToDateISO('${escapeHtml(e.dateISO)}'); switchTab('form');">
                            <i class="fa-solid fa-arrow-up-right-from-square"></i> Aç
                        </button>
                    </td>
                </tr>
            `).join("");
        }
    }

    const tbodyDays = document.getElementById("tbody-archive-days");
    if (tbodyDays) {
        tbodyDays.innerHTML = allDatesDesc.map(dISO => {
            const m = allMetrics[dISO] || calculateDayMetrics(dISO).current;
            const dObj = appState.days[dISO];
            const otherSum = m.cariCcSum + m.checkOutSum + m.checkCariSum + m.wireInSum + m.wireOutSum;
            return `
                <tr>
                    <td>
                        <strong>${escapeHtml(formatDateToTR(dISO))}</strong>
                        ${dISO === uiState.selectedDateISO ? `<span class="badge badge-info">Seçili</span>` : ""}
                    </td>
                    <td class="amount-cell">${formatMoneyTR(m.carryover)}</td>
                    <td class="amount-cell" style="color:#34d399;">${formatMoneyTR(m.totalInWithCarry)}</td>
                    <td class="amount-cell" style="color:#fb7185;">${formatMoneyTR(m.cashOutSum)}</td>
                    <td class="amount-cell" style="color:#38bdf8;">${formatMoneyTR(m.netClosing)}</td>
                    <td class="amount-cell">${formatMoneyTR(m.posCcSum)}</td>
                    <td class="amount-cell">${formatMoneyTR(otherSum)}</td>
                    <td style="font-size:0.71rem;">
                        ${escapeHtml(dObj?.cashierName || "GÖKHAN ÖZBULUT")} / ${escapeHtml(dObj?.controllerName || "RAFET CANBEK")}
                    </td>
                    <td style="text-align:right;">
                        <button class="btn btn-xs btn-primary" onclick="jumpToDateISO('${escapeHtml(dISO)}'); switchTab('form');">
                            <i class="fa-solid fa-folder-open"></i> Formu Aç
                        </button>
                        <button class="btn btn-xs btn-warning" onclick="jumpToDateISO('${escapeHtml(dISO)}'); printDailyKasaA4();" title="Bu Günün A4 Çıktısını Al">
                            <i class="fa-solid fa-print"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join("");
    }
}

// ==================== 13. KULLANICI & YETKİ YÖNETİMİ RENDER MOTORU ====================
function renderAdminSection() {
    const perms = getUserPerms(currentUser);
    const tbodyUsers = document.getElementById("tbody-admin-users");
    if (tbodyUsers) {
        tbodyUsers.innerHTML = (appState.users || []).map(u => {
            const up = getUserPerms(u);
            const preset = ROLE_PRESETS[u.rolePreset] || ROLE_PRESETS.VIEWER;
            const isOmer = normalizeTR(u.username) === "ömer";
            const disabledAttr = (!perms.manageUsers || isOmer) ? "disabled" : "";

            return `
                <tr>
                    <td>
                        <strong>${escapeHtml(u.name)}</strong>
                        <div style="font-size:0.69rem; color:var(--text-muted);">@${escapeHtml(u.username)}</div>
                    </td>
                    <td>${escapeHtml(u.dept || "-")}</td>
                    <td>
                        <select class="form-control" style="padding:4px 7px; font-size:0.72rem; width:auto;" ${disabledAttr}
                            onchange="quickChangeUserPreset('${escapeHtml(u.username)}', this.value)">
                            <option value="ADMIN" ${u.rolePreset === "ADMIN" ? "selected" : ""}>Tam Yetki (Yönetici)</option>
                            <option value="EDITOR" ${u.rolePreset === "EDITOR" ? "selected" : ""}>Değişiklik &amp; Düzenleme</option>
                            <option value="CONTRIBUTOR" ${u.rolePreset === "CONTRIBUTOR" ? "selected" : ""}>Sadece Ekleme Yetkisi</option>
                            <option value="VIEWER" ${u.rolePreset === "VIEWER" ? "selected" : ""}>Sadece Görüntüleme</option>
                            <option value="NONE" ${u.rolePreset === "NONE" ? "selected" : ""}>Hiçbiri (Erişime Kapalı / Erişim Engeli)</option>
                        </select>
                    </td>
                    <td>
                        <div style="display:flex; flex-wrap:wrap; gap:5px;">
                            <label class="perm-pill-check">
                                <input type="checkbox" ${up.view !== false ? "checked" : ""} ${disabledAttr}
                                    onchange="quickToggleUserPerm('${escapeHtml(u.username)}', 'view', this.checked)">
                                <span>Görüntüleme</span>
                            </label>
                            <label class="perm-pill-check">
                                <input type="checkbox" ${up.add ? "checked" : ""} ${disabledAttr}
                                    onchange="quickToggleUserPerm('${escapeHtml(u.username)}', 'add', this.checked)">
                                <span>Ekleme</span>
                            </label>
                            <label class="perm-pill-check">
                                <input type="checkbox" ${up.edit ? "checked" : ""} ${disabledAttr}
                                    onchange="quickToggleUserPerm('${escapeHtml(u.username)}', 'edit', this.checked)">
                                <span>Değişiklik</span>
                            </label>
                            <label class="perm-pill-check">
                                <input type="checkbox" ${up.delete ? "checked" : ""} ${disabledAttr}
                                    onchange="quickToggleUserPerm('${escapeHtml(u.username)}', 'delete', this.checked)">
                                <span>Silme</span>
                            </label>
                            <label class="perm-pill-check">
                                <input type="checkbox" ${up.manageUsers ? "checked" : ""} ${disabledAttr}
                                    onchange="quickToggleUserPerm('${escapeHtml(u.username)}', 'manageUsers', this.checked)">
                                <span>Yönetici</span>
                            </label>
                        </div>
                    </td>
                    <td style="text-align:right;">
                        ${perms.manageUsers ? `
                            <div class="row-actions">
                                <button class="btn btn-xs" onclick="openEditUserModal('${escapeHtml(u.username)}')" title="Kullanıcı &amp; Şifre Düzenle">
                                    <i class="fa-solid fa-user-pen" style="color:var(--dizsan-cyan);"></i>
                                </button>
                                ${!isOmer ? `
                                    <button class="btn btn-xs" onclick="deleteUserAccount('${escapeHtml(u.username)}')" title="Kullanıcıyı Sil">
                                        <i class="fa-solid fa-trash" style="color:var(--rose-danger);"></i>
                                    </button>
                                ` : ""}
                            </div>
                        ` : `<span class="badge ${preset.badgeClass}">${escapeHtml(preset.label)}</span>`}
                    </td>
                </tr>
            `;
        }).join("");
    }

    const tbodyLogs = document.getElementById("tbody-audit-logs");
    if (tbodyLogs) {
        tbodyLogs.innerHTML = (appState.auditLogs || []).slice(0, 100).map(l => `
            <tr>
                <td style="white-space:nowrap; font-size:0.7rem; color:var(--text-muted);">${escapeHtml(l.timestamp)}</td>
                <td><strong>${escapeHtml(l.user)}</strong></td>
                <td><span class="badge badge-info">${escapeHtml(l.category)}</span></td>
                <td>${escapeHtml(l.detail)}</td>
            </tr>
        `).join("");
    }
}

function quickChangeUserPreset(username, presetKey) {
    if (!assertPermission("manageUsers", "Kullanıcı yetki profili değiştirme")) return;
    const u = (appState.users || []).find(x => x.username === username);
    if (!u) return;
    const preset = ROLE_PRESETS[presetKey] || ROLE_PRESETS.VIEWER;
    u.rolePreset = preset.code;
    u.permissions = { ...preset.permissions };
    if (currentUser && currentUser.username === u.username) currentUser = u;
    addAuditLog("YETKİ DEĞİŞİKLİĞİ", `${u.name} kullanıcısının yetki profili "${preset.label}" olarak güncellendi.`);
    renderQuickUserChips();
    syncStateToServer();
    renderAll();
}

function quickToggleUserPerm(username, permKey, isChecked) {
    if (!assertPermission("manageUsers", "Kullanıcı izin anahtarı değiştirme")) return;
    const u = (appState.users || []).find(x => x.username === username);
    if (!u) return;
    if (!u.permissions) u.permissions = { ...getUserPerms(u) };
    u.permissions[permKey] = Boolean(isChecked);

    if (permKey === "view" && !isChecked) {
        u.permissions.add = false;
        u.permissions.edit = false;
        u.permissions.delete = false;
        u.permissions.lockDay = false;
        u.permissions.manageUsers = false;
        u.rolePreset = "NONE";
    } else {
        if (isChecked) u.permissions.view = true;
        if (!u.permissions.view) u.rolePreset = "NONE";
        else if (u.permissions.manageUsers) u.rolePreset = "ADMIN";
        else if (u.permissions.edit || u.permissions.delete) u.rolePreset = "EDITOR";
        else if (u.permissions.add) u.rolePreset = "CONTRIBUTOR";
        else u.rolePreset = "VIEWER";
    }

    if (currentUser && currentUser.username === u.username) currentUser = u;
    addAuditLog("YETKİ DEĞİŞİKLİĞİ", `${u.name} için "${permKey}" izni ${isChecked ? "AÇILDI" : "KAPATILDI"}.`);
    renderQuickUserChips();
    syncStateToServer();
    renderAll();
}

// ==================== 14. GELİR / GİDER SEÇMELİ MODAL İLE KAYIT EKLEME, DÜZENLEME VE SİLME ====================
const FLOW_CATEGORY_OPTIONS = {
    GELIR: [
        { value: "CASH_IN", label: "Nakit Gelir (Kasa Girişi)" },
        { value: "POS_CC", label: "Kredi Kartı (POS Çekimi)" },
        { value: "WIRE_IN", label: "Gelen Havale / EFT" }
    ],
    GIDER: [
        { value: "CASH_OUT", label: "Nakit Gider (Günlük Nakit Ödeme)" },
        { value: "WIRE_OUT", label: "Giden Havale / EFT" },
        { value: "CARI_CC", label: "Şirket Kredi Kartı ile Ödeme (Gider)" },
        { value: "CHECK_OUT", label: "Çek - Senet Çıkışı" },
        { value: "CHECK_CARI_BANK", label: "Çek Çıkış Cari Hesap / Banka" }
    ]
};

// 2 Kademeli Ana Kategori -> Alt Kalem Öneri Ağacı
const CATEGORY_SUBITEMS_TREE = {
    GIDER: [
        {
            group: "ARAÇ GİDERLERİ",
            items: [
                "YAKIT (MAZOT / BENZİN)",
                "HGS / OGS / KÖPRÜ GEÇİŞ",
                "ARAÇ MUAYENE (TÜVTÜRK)",
                "ARAÇ BAKIM & TAMİR",
                "LASTİK / AKÜ / YEDEK PARÇA",
                "TRAFİK SİGORTASI & KASKO",
                "MTV (MOTORLU TAŞITLAR VERGİSİ)",
                "ARAÇ YIKAMA & OTOPARK",
                "DİĞER ARAÇ GİDERİ"
            ]
        },
        {
            group: "TEDARİK & ATÖLYE",
            items: [
                "TEDARİK PARÇA ALIMI (TDR)",
                "DIŞ SERVİS / TORNA / İŞÇİLİK (TDR)",
                "SARF MALZEME & HIRDAVAT",
                "EL ALETLERİ & EKİPMAN",
                "SANAYİ TÜPÜ / OKSİJEN / GAZ",
                "İŞ GÜVENLİĞİ (KKD) MALZEMELERİ",
                "DİĞER ATÖLYE GİDERİ"
            ]
        },
        {
            group: "CARİ / FİRMA ÖDEMELERİ",
            items: [
                "YEDEK PARÇA TEDARİKÇİ ÖDEMESİ",
                "FATURALI CARİ HESAP ÖDEMESİ",
                "PEŞİN MALZEME ALIMI",
                "EMANET / İADE ÖDEMESİ",
                "DİĞER CARİ ÖDEME"
            ]
        },
        {
            group: "MUTFAK & İKRAM",
            items: [
                "GÜNLÜK YEMEK / LOKANTA",
                "ÇAY / KAHVE / ŞEKER",
                "DAMACANA & BARDAK SU",
                "MARKET / GIDA ALIŞVERİŞİ",
                "MİSAFİR İKRAM GİDERİ",
                "TEMİZLİK MALZEMESİ"
            ]
        },
        {
            group: "PERSONEL GİDERLERİ",
            items: [
                "MAAŞ ÖDEMESİ",
                "MAAŞ AVANSI",
                "İŞ / SAHA AVANSI",
                "FAZLA MESAİ ÖDEMESİ",
                "YOL & YEMEK ÜCRETİ",
                "PRİM / İKRAMİYE",
                "TAZMİNAT / ÇIKIŞ ÖDEMESİ"
            ]
        },
        {
            group: "KARGO & NAKLİYE",
            items: [
                "KARGO GÖNDERİM ÜCRETİ",
                "AMBAR / NAKLİYE ÖDEMESİ",
                "ŞEHİR İÇİ KURYE / TAKSİ",
                "GÜMRÜK / LOJİSTİK MASRAFI"
            ]
        },
        {
            group: "FATURA & ABONELİK",
            items: [
                "ELEKTRİK FATURASI",
                "SU FATURASI",
                "DOĞALGAZ FATURASI",
                "İNTERNET & SABİT TELEFON",
                "CEP TELEFONU (GSM) FATURALARI",
                "YAZILIM / SUNUCU / DOMAİN"
            ]
        },
        {
            group: "OFİS & İDARİ GİDERLER",
            items: [
                "KIRTASİYE & KAĞIT / TONER",
                "MATBAA / FATURA / EVRAK BASIMI",
                "BİLGİSAYAR & DONANIM",
                "AİDAT & GÜVENLİK",
                "TEMSİL & AĞIRLAMA"
            ]
        },
        {
            group: "VERGİ / SGK / RESMİ",
            items: [
                "SGK PRİM ÖDEMESİ",
                "VERGİ ÖDEMESİ (KDV / MUHTASAR / KURUMLAR)",
                "NOTER MASRAFI",
                "BELEDİYE / ÇEVRE / İLAN VERGİSİ",
                "TİCARET ODASI / RESMİ HARÇLAR",
                "MALİ MÜŞAVİR / MUHASEBE ÜCRETİ"
            ]
        },
        {
            group: "BİNA BAKIM & DEMİRBAŞ",
            items: [
                "ELEKTRİK / AYDINLATMA TAMİRİ",
                "SU / TESİSAT TAMİRİ",
                "MAKİNE / KOMPRESÖR / LİFT BAKIMI",
                "DEMİRBAŞ / MOBİLYA / KLİMA ALIMI",
                "TADİLAT & BOYA"
            ]
        },
        {
            group: "BANKA & FİNANSMAN",
            items: [
                "KREDİ TAKSİT ÖDEMESİ",
                "KREDİ KARTI EKSTRE ÖDEMESİ",
                "ÇEK / SENET ÖDEMESİ",
                "EFT / HAVALE / HESAP İŞLETİM MASRAFI",
                "KASADAN BANKAYA YATIRILAN"
            ]
        },
        {
            group: "DİĞER GİDERLER",
            items: [
                "BAĞIŞ / YARDIM",
                "CEZA ÖDEMELERİ",
                "ORTAK / ŞİRKET SAHİBİ ÇEKİMİ",
                "DİĞER (SERBEST GİRİŞ)"
            ]
        }
    ],
    GELIR: [
        {
            group: "SERVİS & İŞÇİLİK GELİRİ",
            items: [
                "ARAÇ SERVİS BAKIM TAHSİLATI",
                "ARIZA / ONARIM İŞÇİLİK",
                "DIŞ SERVİS / MOBİL HİZMET"
            ]
        },
        {
            group: "YEDEK PARÇA & TEDARİK",
            items: [
                "YEDEK PARÇA PEŞİN SATIŞ",
                "TEDARİK HİZMET / PARÇA (TDR)",
                "HURDA / ÇIKMA PARÇA SATIŞI"
            ]
        },
        {
            group: "CARİ HESAP TAHSİLATI",
            items: [
                "MÜŞTERİ CARİ NAKİT TAHSİLAT",
                "POS / KREDİ KARTI CARİ TAHSİLAT",
                "GELEN HAVALE / EFT CARİ TAHSİLAT",
                "ÇEK / SENET TAHSİLATI"
            ]
        },
        {
            group: "BANKA & DİĞER GİRİŞLER",
            items: [
                "BANKADAN KASAYA NAKİT ÇEKİLEN",
                "ORTAK / ŞİRKET SAHİBİ KASA GİRİŞİ",
                "İADE / FAZLA ÖDEME DÖNÜŞÜ",
                "DİĞER GELİR (SERBEST GİRİŞ)"
            ]
        }
    ]
};

// Kayıtlı Kredi Kartları (CardFlow Kredi Kartı Takip sistemindeki kartlarınız: Banka Adı + Son 4 Hane)
const REGISTERED_COMPANY_CARDS = [
    { id: "card-8",  bank: "GARANTİ BBVA",   number: "4360", name: "Corporate (Dizsan Otomotiv)",        type: "corporate" },
    { id: "card-9",  bank: "GARANTİ BBVA",   number: "4352", name: "Corporate (Dizsan Lojistik)",        type: "corporate" },
    { id: "card-1",  bank: "GARANTİ BBVA",   number: "6010", name: "Bonus Trink (Dizsan Lojistik)",      type: "corporate" },
    { id: "card-10", bank: "GARANTİ BBVA",   number: "3017", name: "Bonus Trink (Dizsan Otomotiv)",      type: "corporate" },
    { id: "card-3",  bank: "AKBANK",         number: "6539", name: "Axess (Dizsan Otomotiv)",            type: "corporate" },
    { id: "card-2",  bank: "AKBANK",         number: "3481", name: "Axess (Dizsan Lojistik)",            type: "corporate" },
    { id: "card-12", bank: "ZİRAAT BANKASI", number: "3232", name: "Başak (Dizsan Otomotiv)",            type: "corporate" },
    { id: "card-13", bank: "İŞ BANKASI",     number: "4635", name: "Maximum Business (Dizsan Otomotiv)", type: "corporate" },
    { id: "card-14", bank: "İŞ BANKASI",     number: "6298", name: "Maximum Business (Dizsan Lojistik)", type: "corporate" },
    { id: "card-15", bank: "İŞ BANKASI",     number: "4593", name: "Maximum Business (DsMot)",           type: "corporate" },
    { id: "card-11", bank: "VAKIFBANK",      number: "1634", name: "World (Dizsan Lojistik)",            type: "corporate" },
    { id: "card-7",  bank: "GARANTİ BBVA",   number: "0031", name: "Bonus Platinum (Şahsi)",             type: "personal"  },
    { id: "card-16", bank: "İŞ BANKASI",     number: "8815", name: "Maximiles Black (Şahsi)",            type: "personal"  },
    { id: "card-6",  bank: "ZİRAAT BANKASI", number: "7265", name: "Combo (Şahsi)",                      type: "personal"  },
    { id: "card-5",  bank: "HALKBANK",       number: "8765", name: "Paraf (Şahsi)",                      type: "personal"  },
    { id: "card-4",  bank: "TEB",            number: "9097", name: "Bonus (Şahsi)",                      type: "personal"  }
];

function getAvailableCreditCards() {
    try {
        const raw = localStorage.getItem("cardflow_cards_v3");
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.map(c => ({
                    bank: String(c.bank || "").toUpperCase(),
                    number: String(c.number || ""),
                    name: String(c.name || ""),
                    type: c.type || "corporate"
                }));
            }
        }
    } catch (e) {}
    return REGISTERED_COMPANY_CARDS;
}

function formatCreditCardValue(c) {
    return `${c.bank} - ${c.number} (${c.name})`;
}

function populateCreditCardSelector(existingCol1 = "") {
    const sel = document.getElementById("entry-cc-card-select");
    if (!sel) return;
    const cards = getAvailableCreditCards();
    const corpCards = cards.filter(c => c.type !== "personal");
    const persCards = cards.filter(c => c.type === "personal");

    let html = `<optgroup label="ŞİRKET / KURUMSAL KREDİ KARTLARI">`;
    for (const c of corpCards) {
        const val = formatCreditCardValue(c);
        html += `<option value="${escapeHtml(val)}">${escapeHtml(c.bank)} •••• ${escapeHtml(c.number)} — ${escapeHtml(c.name)}</option>`;
    }
    html += `</optgroup>`;

    if (persCards.length > 0) {
        html += `<optgroup label="ŞAHSİ KREDİ KARTLARI">`;
        for (const c of persCards) {
            const val = formatCreditCardValue(c);
            html += `<option value="${escapeHtml(val)}">${escapeHtml(c.bank)} •••• ${escapeHtml(c.number)} — ${escapeHtml(c.name)}</option>`;
        }
        html += `</optgroup>`;
    }

    sel.innerHTML = html;

    if (existingCol1) {
        for (const c of cards) {
            if (existingCol1.includes(c.number)) {
                sel.value = formatCreditCardValue(c);
                break;
            }
        }
    }
}

function syncCol1FromSelectors() {
    const sectionVal = document.getElementById("entry-section")?.value || "";
    const mainVal = document.getElementById("entry-main-cat")?.value || "";
    const subItemVal = document.getElementById("entry-sub-cat")?.value || "";
    const ccVal = document.getElementById("entry-cc-card-select")?.value || "";
    const inpCol1 = document.getElementById("entry-col1");
    const inpCode = document.getElementById("entry-code");
    if (!inpCol1) return;

    const isFreeInput = subItemVal.includes("SERBEST GİRİŞ");
    const catPart = isFreeInput ? mainVal : `${mainVal} / ${subItemVal}`;

    if (sectionVal === "CARI_CC" && ccVal) {
        inpCol1.value = `${ccVal} · ${catPart}`;
    } else if (isFreeInput) {
        inpCol1.value = mainVal;
        inpCol1.placeholder = "Özel cari / firma / gider başlığını buraya yazınız...";
    } else {
        inpCol1.value = catPart;
    }

    if (inpCode) {
        if (subItemVal.includes("(TDR)") || mainVal.includes("TEDARİK")) {
            inpCode.value = "TDR";
        } else if (inpCode.value === "TDR") {
            inpCode.value = "";
        }
    }
}

function handleCreditCardSelectChange() {
    syncCol1FromSelectors();
}

function populateCategoryTreeSelectors(flow, sectionVal, existingCol1 = "") {
    const mainSel = document.getElementById("entry-main-cat");
    const subSel = document.getElementById("entry-sub-cat");
    const lblMain = document.getElementById("lbl-entry-main-cat");
    const lblSub = document.getElementById("lbl-entry-sub-cat");
    if (!mainSel || !subSel) return;

    const tree = CATEGORY_SUBITEMS_TREE[flow] || CATEGORY_SUBITEMS_TREE.GIDER;
    if (lblMain) lblMain.textContent = flow === "GELIR" ? "Ana Gelir Grubu" : "Ana Gider Grubu";
    if (lblSub) lblSub.textContent = "Alt Kalem";

    mainSel.innerHTML = tree.map(g => `<option value="${escapeHtml(g.group)}">${escapeHtml(g.group)}</option>`).join("");

    // Varsayılan grup seçimi (işlem türüne göre akıllı başlangıç)
    let defaultMain = tree[0].group;
    if (flow === "GIDER") {
        if (sectionVal === "WIRE_OUT" || sectionVal === "CARI_CC") defaultMain = "CARİ / FİRMA ÖDEMELERİ";
        else if (sectionVal === "CHECK_OUT" || sectionVal === "CHECK_CARI_BANK") defaultMain = "BANKA & FİNANSMAN";
        else defaultMain = "ARAÇ GİDERLERİ";
    } else {
        if (sectionVal === "POS_CC" || sectionVal === "WIRE_IN") defaultMain = "CARİ HESAP TAHSİLATI";
        else defaultMain = "SERVİS & İŞÇİLİK GELİRİ";
    }

    let matchedMain = null;
    let matchedSub = null;
    if (existingCol1) {
        const cleanCol1 = existingCol1.includes(" · ") ? existingCol1.split(" · ").pop().trim() : existingCol1;
        const parts = cleanCol1.split(" / ").map(s => s.trim());
        if (parts.length >= 2) {
            const foundGrp = tree.find(g => g.group === parts[0]);
            if (foundGrp) {
                matchedMain = foundGrp.group;
                if (foundGrp.items.includes(parts[1])) {
                    matchedSub = parts[1];
                }
            }
        } else {
            for (const g of tree) {
                if (g.group === cleanCol1) {
                    matchedMain = g.group;
                    break;
                }
                if (g.items.includes(cleanCol1)) {
                    matchedMain = g.group;
                    matchedSub = cleanCol1;
                    break;
                }
            }
        }
    }

    mainSel.value = matchedMain || defaultMain;
    handleMainCategoryChange(mainSel.value, matchedSub, Boolean(existingCol1 && !matchedMain));
}

function handleMainCategoryChange(mainGroupVal, preferredSub = null, preserveExistingCol1 = false) {
    const flow = document.getElementById("entry-flow-type")?.value === "GIDER" ? "GIDER" : "GELIR";
    const tree = CATEGORY_SUBITEMS_TREE[flow] || CATEGORY_SUBITEMS_TREE.GIDER;
    const foundGrp = tree.find(g => g.group === mainGroupVal) || tree[0];

    const subSel = document.getElementById("entry-sub-cat");
    if (!subSel || !foundGrp) return;

    subSel.innerHTML = foundGrp.items.map(it => `<option value="${escapeHtml(it)}">${escapeHtml(it)}</option>`).join("");
    const targetSub = (preferredSub && foundGrp.items.includes(preferredSub)) ? preferredSub : foundGrp.items[0];
    subSel.value = targetSub;

    if (!preserveExistingCol1) {
        handleSubCategoryChange(targetSub);
    }
}

function handleSubCategoryChange() {
    syncCol1FromSelectors();
}

function handleFlowTypeChange(flowVal, preferredSection = null) {
    const flow = flowVal === "GIDER" ? "GIDER" : "GELIR";
    const flowSelect = document.getElementById("entry-flow-type");
    if (flowSelect) {
        flowSelect.value = flow;
        flowSelect.setAttribute("data-flow", flow);
    }

    const lblSec = document.getElementById("lbl-entry-section");
    if (lblSec) {
        lblSec.textContent = flow === "GELIR" ? "Gelir Türü" : "Gider Türü";
    }

    const secSelect = document.getElementById("entry-section");
    const opts = FLOW_CATEGORY_OPTIONS[flow] || FLOW_CATEGORY_OPTIONS.GELIR;
    if (secSelect) {
        secSelect.innerHTML = opts.map(o => `<option value="${o.value}">${escapeHtml(o.label)}</option>`).join("");
        const validPref = opts.some(o => o.value === preferredSection) ? preferredSection : opts[0].value;
        secSelect.value = validPref;
        handleEntrySectionChange(validPref);
    }
}

function handleEntrySectionChange(sectionVal) {
    const lblCol1 = document.getElementById("lbl-entry-col1");
    const inpCol1 = document.getElementById("entry-col1");
    const grpCol1 = document.getElementById("group-entry-col1");
    const grpDue = document.getElementById("group-entry-due");
    const grpCcCard = document.getElementById("group-entry-cc-card");
    const lblDesc = document.getElementById("lbl-entry-desc");
    const flow = isGelirSection(sectionVal) ? "GELIR" : "GIDER";

    if (grpDue) grpDue.style.display = sectionVal === "CHECK_OUT" ? "block" : "none";
    if (grpCol1) grpCol1.style.display = "block";
    if (grpCcCard) {
        grpCcCard.style.display = sectionVal === "CARI_CC" ? "block" : "none";
        if (sectionVal === "CARI_CC") {
            populateCreditCardSelector();
        }
    }

    populateCategoryTreeSelectors(flow, sectionVal);

    if (sectionVal === "CASH_IN") {
        lblCol1.textContent = "Seçilen Gelir Grubu / Cari (İsterseniz Değiştirin)";
        inpCol1.placeholder = "Örn: SERVİS & İŞÇİLİK GELİRİ / ARAÇ SERVİS BAKIM TAHSİLATI";
        lblDesc.textContent = "Gelir Açıklaması";
    } else if (sectionVal === "CASH_OUT") {
        lblCol1.textContent = "Seçilen Gider Grubu / Alt Kalem (İsterseniz Değiştirin)";
        inpCol1.placeholder = "Örn: ARAÇ GİDERLERİ / YAKIT (MAZOT / BENZİN)";
        lblDesc.textContent = "Gider / Ödeme Açıklaması";
    } else if (sectionVal === "POS_CC") {
        lblCol1.textContent = "POS Bankası / Seçilen Grup";
        inpCol1.placeholder = "Örn: ZİRAAT, GARANTİ, İŞ BANKASI";
        lblDesc.textContent = "Cari Hesap / Fatura Açıklaması";
    } else if (sectionVal === "CARI_CC") {
        lblCol1.textContent = "Seçilen Kart & Gider Grubu (Otomatik Dolar / Değiştirilebilir)";
        inpCol1.placeholder = "Örn: GARANTİ BBVA - 4360 · CARİ / FİRMA ÖDEMELERİ";
        lblDesc.textContent = "Şirket Kredi Kartı Ödeme Açıklaması";
    } else if (sectionVal === "CHECK_OUT") {
        lblCol1.textContent = "Senet / Çek Bilgisi";
        inpCol1.placeholder = "Örn: ÇEK / SENET";
        lblDesc.textContent = "Müşteri / Alıcı Cari İsmi";
    } else if (sectionVal === "CHECK_CARI_BANK") {
        lblCol1.textContent = "Cari Hesap / Banka";
        inpCol1.placeholder = "Cari veya banka adı";
        lblDesc.textContent = "Açıklama";
    } else if (sectionVal === "WIRE_IN") {
        lblCol1.textContent = "Alıcı Bankamız / Seçilen Grup";
        inpCol1.placeholder = "Banka adı";
        lblDesc.textContent = "Gönderen Cari / Havale Açıklaması";
    } else if (sectionVal === "WIRE_OUT") {
        lblCol1.textContent = "Gönderen Bankamız / Seçilen Grup";
        inpCol1.placeholder = "Banka adı";
        lblDesc.textContent = "Alıcı Cari / Ödeme Açıklaması";
    }
}

function openEntryModal(defaultSection = "CASH_IN") {
    if (!assertPermission("add", "Yeni gelir/gider kaydı ekleme")) return;
    const dayObj = ensureDayObject(uiState.selectedDateISO);
    if (dayObj.isLocked && !hasPermission("manageUsers")) {
        alert("Bu gün kilitlenmiştir.");
        return;
    }

    const defaultFlow = isGelirSection(defaultSection) ? "GELIR" : "GIDER";

    document.getElementById("modal-entry-title").innerHTML = `<i class="fa-solid fa-plus-circle" style="color:var(--dizsan-cyan);"></i> <span>Gelir / Gider Ekle</span>`;
    document.getElementById("entry-id").value = "";
    document.getElementById("entry-date").value = formatDateToTR(uiState.selectedDateISO);
    document.getElementById("entry-col1").value = "";
    document.getElementById("entry-due-date").value = "";
    document.getElementById("entry-desc").value = "";
    document.getElementById("entry-amount").value = "";
    document.getElementById("entry-code").value = "";

    handleFlowTypeChange(defaultFlow, defaultSection);
    openModal("modal-entry");
    setTimeout(() => document.getElementById("entry-main-cat")?.focus(), 80);
}

function openEditEntryModal(entryId) {
    if (!assertPermission("edit", "Mevcut kasa kaydını değiştirme / düzenleme")) return;
    const dayObj = ensureDayObject(uiState.selectedDateISO);
    if (dayObj.isLocked && !hasPermission("manageUsers")) {
        alert("Bu gün kilitlenmiştir.");
        return;
    }
    const entry = (dayObj.entries || []).find(e => e.id === entryId);
    if (!entry) return;

    const entryFlow = isGelirSection(entry.section) ? "GELIR" : "GIDER";

    document.getElementById("modal-entry-title").innerHTML = `<i class="fa-solid fa-pen-to-square" style="color:var(--amber-warn);"></i> <span>Gelir / Gider Kaydını Düzenle</span>`;
    document.getElementById("entry-id").value = entry.id;
    document.getElementById("entry-date").value = formatDateToTR(entry.dateISO || uiState.selectedDateISO);

    handleFlowTypeChange(entryFlow, entry.section);
    if (entry.section === "CARI_CC") {
        populateCreditCardSelector(entry.col1 || "");
    }
    populateCategoryTreeSelectors(entryFlow, entry.section, entry.col1 || "");

    document.getElementById("entry-col1").value = entry.col1 || "";
    document.getElementById("entry-due-date").value = entry.dueDate ? formatDateToTR(entry.dueDate) : "";
    document.getElementById("entry-desc").value = entry.desc || "";
    const amtNum = Number(entry.amount) || 0;
    document.getElementById("entry-amount").value = amtNum % 1 === 0 ? amtNum.toLocaleString("tr-TR") : formatNumberTR(amtNum);
    document.getElementById("entry-code").value = entry.code || "";

    openModal("modal-entry");
}

function handleSaveEntry(e) {
    e.preventDefault();
    const editId = document.getElementById("entry-id").value.trim();
    if (editId) {
        if (!assertPermission("edit", "Kasa kaydını değiştirme")) return;
    } else {
        if (!assertPermission("add", "Yeni kasa kaydı ekleme")) return;
    }

    const targetISO = parseAnyDateToISO(document.getElementById("entry-date").value);
    const section = document.getElementById("entry-section").value;
    const mainCat = (document.getElementById("entry-main-cat")?.value || "").trim().toUpperCase();
    const subCat = (document.getElementById("entry-sub-cat")?.value || "").trim().toUpperCase();
    let col1 = document.getElementById("entry-col1").value.trim().toUpperCase();
    if (!col1 && mainCat) {
        col1 = subCat && !subCat.includes("SERBEST GİRİŞ") ? `${mainCat} / ${subCat}` : mainCat;
    }

    const dueDate = document.getElementById("entry-due-date").value.trim();
    const desc = document.getElementById("entry-desc").value.trim().toUpperCase();
    const amount = parseMoneyInputTR(document.getElementById("entry-amount").value);
    const code = document.getElementById("entry-code").value.trim().toUpperCase();

    if (!desc || amount <= 0) {
        alert("Lütfen açıklama ve 0'dan büyük bir tutar giriniz.");
        return;
    }

    const dayObj = ensureDayObject(targetISO);

    if (editId) {
        for (const dKey of Object.keys(appState.days || {})) {
            const idx = (appState.days[dKey].entries || []).findIndex(x => x.id === editId);
            if (idx !== -1) {
                appState.days[dKey].entries.splice(idx, 1);
            }
        }
        dayObj.entries.push({
            id: editId,
            dateISO: targetISO,
            section,
            col1,
            desc,
            dueDate: dueDate ? parseAnyDateToISO(dueDate) : "",
            amount,
            code,
            createdBy: currentUser ? currentUser.name : "Sistem",
            createdAt: formatDateTimeTR()
        });
        addAuditLog("KAYIT DÜZENLEME", `${formatDateToTR(targetISO)} [${SECTION_LABELS[section]}] "${col1} - ${desc}" (${formatMoneyTR(amount)}) güncellendi.`);
    } else {
        dayObj.entries.push({
            id: `ENT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            dateISO: targetISO,
            section,
            col1,
            desc,
            dueDate: dueDate ? parseAnyDateToISO(dueDate) : "",
            amount,
            code,
            createdBy: currentUser ? currentUser.name : "Sistem",
            createdAt: formatDateTimeTR()
        });
        addAuditLog("MANUEL GİRİŞ", `${formatDateToTR(targetISO)} [${SECTION_LABELS[section]}] "${col1} - ${desc}" (${formatMoneyTR(amount)}) eklendi.`);
    }

    uiState.selectedDateISO = targetISO;
    closeModal("modal-entry");
    syncStateToServer();
    renderAll();
}

function deleteEntry(entryId) {
    if (!assertPermission("delete", "Kasa kaydı silme")) return;
    const dayObj = ensureDayObject(uiState.selectedDateISO);
    if (dayObj.isLocked && !hasPermission("manageUsers")) {
        alert("Bu gün kilitlenmiştir.");
        return;
    }
    const target = (dayObj.entries || []).find(e => e.id === entryId);
    if (!target) return;
    if (!confirm(`"${target.desc}" (${formatMoneyTR(target.amount)}) kaydını silmek istediğinize emin misiniz?`)) return;

    dayObj.entries = dayObj.entries.filter(e => e.id !== entryId);
    addAuditLog("KAYIT SİLME", `${formatDateToTR(uiState.selectedDateISO)} [${SECTION_LABELS[target.section]}] "${target.desc}" (${formatMoneyTR(target.amount)}) silindi.`);
    syncStateToServer();
    renderAll();
}

// ==================== 15. TARİH GEZGİNİ, TCMB 16:30 OTOMATİK KUR MOTORU, MANUEL DEVİR VE SIFIRLAMA ====================
let tcmbRateCache = {};
let tcmb1630TimerId = null;
let tcmbWatchdogIntervalId = null;

function isBefore1630Now() {
    const now = new Date();
    return now.getHours() < 16 || (now.getHours() === 16 && now.getMinutes() < 30);
}

function getExpectedTcmbSlot(dateISO) {
    const iso = parseAnyDateToISO(dateISO || uiState.selectedDateISO);
    if (iso === todayISO()) {
        return isBefore1630Now() ? `${iso}_BEFORE_1630` : `${iso}_AFTER_1630`;
    }
    return `${iso}_HISTORICAL`;
}

function updateTcmbBadgeLabel(dateISO, rateData = null) {
    const lblStatus = document.getElementById("lbl-tcmb-status");
    const btnTcmb = document.getElementById("btn-fetch-tcmb");
    if (!lblStatus) return;

    const iso = parseAnyDateToISO(dateISO || uiState.selectedDateISO);
    if (iso === todayISO()) {
        if (isBefore1630Now()) {
            lblStatus.textContent = "TCMB Önceki Gün (16:30'da Yenilenir)";
            if (btnTcmb) btnTcmb.title = "Saat 16:30'dan önceki kur, bir gün önceki resmi TCMB gösterge kurudur. Saat 16:30'da otomatik yenilenir.";
        } else {
            lblStatus.textContent = "TCMB 16:30 Güncel ✓";
            if (btnTcmb) btnTcmb.title = `TCMB 16:30 Resmi Gösterge Döviz Satış Kuru aktif${rateData?.bulletinDate ? ` (Bülten: ${rateData.bulletinDate})` : ""}.`;
        }
    } else {
        lblStatus.textContent = "TCMB Resmi Kur ✓";
        if (btnTcmb) btnTcmb.title = `${formatDateToTR(iso)} tarihli TCMB Resmi Döviz Satış Kuru`;
    }
}

async function fetchTcmbForexSellingRates(dateISO) {
    const iso = parseAnyDateToISO(dateISO || uiState.selectedDateISO);
    const slotKey = getExpectedTcmbSlot(iso);
    if (tcmbRateCache[slotKey]) return tcmbRateCache[slotKey];

    // 1. Öncelik: Yerel portal sunucusundan 16:30 kurallı TCMB Döviz Satış (ForexSelling) çekimi
    try {
        const res = await fetch(`/api/tcmb-rates?date=${encodeURIComponent(iso)}&slot=${encodeURIComponent(slotKey)}&t=${Date.now()}`, { cache: "no-store" });
        if (res.ok) {
            const data = await res.json();
            if (data && data.status === "ok" && data.eurFormatted && data.usdFormatted) {
                tcmbRateCache[slotKey] = data;
                return data;
            }
        }
    } catch (e) {}

    // 2. Yedek (Canlı PWA / GitHub Pages üzerinde backend olmadan çalışırken):
    try {
        if (iso === todayISO() && isBefore1630Now()) {
            // 16:30 öncesinde dün kaydedilmiş kur varsa onu koru
            const prevISO = addDaysISO(iso, -1);
            const prevDay = appState.days && appState.days[prevISO];
            if (prevDay && prevDay.euroRate && prevDay.euroRate !== "--" && prevDay.usdRate && prevDay.usdRate !== "--") {
                const prevFallback = {
                    status: "ok",
                    source: "TCMB Önceki Gün Gösterge Kuru",
                    ratePeriod: "BEFORE_1630",
                    usdFormatted: prevDay.usdRate,
                    eurFormatted: prevDay.euroRate
                };
                tcmbRateCache[slotKey] = prevFallback;
                return prevFallback;
            }
        }

        const res = await fetch("https://finans.truncgil.com/today.json", { cache: "no-store" });
        if (res.ok) {
            const j = await res.json();
            const usdRaw = j?.USD?.["Satış"] || j?.USD?.Satis;
            const eurRaw = j?.EUR?.["Satış"] || j?.EUR?.Satis;
            if (usdRaw && eurRaw) {
                const parseRate = (s) => parseFloat(String(s).replace(/\./g, "").replace(",", "."));
                const uVal = parseRate(usdRaw);
                const eVal = parseRate(eurRaw);
                if (uVal > 0 && eVal > 0) {
                    const fallbackData = {
                        status: "ok",
                        source: "TCMB Döviz Satış",
                        ratePeriod: (iso === todayISO() && isBefore1630Now()) ? "BEFORE_1630" : "AFTER_1630",
                        usd: uVal,
                        eur: eVal,
                        usdFormatted: uVal.toFixed(4).replace(".", ","),
                        eurFormatted: eVal.toFixed(4).replace(".", ",")
                    };
                    tcmbRateCache[slotKey] = fallbackData;
                    return fallbackData;
                }
            }
        }
    } catch (e) {}

    return null;
}

async function fetchAndApplyTcmbRates(dateISO, forceOverwrite = false) {
    const iso = parseAnyDateToISO(dateISO || uiState.selectedDateISO);
    const dayObj = ensureDayObject(iso);
    const expectedSlot = getExpectedTcmbSlot(iso);

    const hasEur = dayObj.euroRate && dayObj.euroRate !== "--" && dayObj.euroRate !== "0" && dayObj.euroRate !== "0,00";
    const hasUsd = dayObj.usdRate && dayObj.usdRate !== "--" && dayObj.usdRate !== "0" && dayObj.usdRate !== "0,00";
    const slotMismatch = dayObj.tcmbSlotKey !== expectedSlot;

    // Eğer kur zaten mevcutsa ve 16:30 dilimi değişmemişse tekrar çekmeye gerek yok
    if (!forceOverwrite && !slotMismatch && hasEur && hasUsd) {
        updateTcmbBadgeLabel(iso);
        return;
    }

    const lblStatus = document.getElementById("lbl-tcmb-status");
    if (lblStatus) lblStatus.textContent = "TCMB Çekiliyor...";

    if (forceOverwrite || slotMismatch) {
        delete tcmbRateCache[expectedSlot];
    }

    const rateData = await fetchTcmbForexSellingRates(iso);
    if (rateData && rateData.eurFormatted && rateData.usdFormatted) {
        dayObj.euroRate = rateData.eurFormatted;
        dayObj.usdRate = rateData.usdFormatted;
        dayObj.tcmbSlotKey = expectedSlot;

        updateTcmbBadgeLabel(iso, rateData);
        saveStateLocally();
        syncStateToServer();
        renderAll();
    } else {
        updateTcmbBadgeLabel(iso);
    }
}

function scheduleNext1630Timer() {
    if (tcmb1630TimerId) clearTimeout(tcmb1630TimerId);
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 30, 2, 0);
    if (now >= target) {
        target.setDate(target.getDate() + 1);
    }
    const msUntil1630 = Math.max(1000, target.getTime() - now.getTime());
    tcmb1630TimerId = setTimeout(async () => {
        tcmbRateCache = {};
        const today = todayISO();
        await fetchAndApplyTcmbRates(today, true);
        if (uiState.selectedDateISO !== today) {
            await fetchAndApplyTcmbRates(uiState.selectedDateISO, false);
        }
        scheduleNext1630Timer();
    }, msUntil1630);
}

function initTcmb1630AutoRefreshScheduler() {
    scheduleNext1630Timer();
    if (tcmbWatchdogIntervalId) clearInterval(tcmbWatchdogIntervalId);
    tcmbWatchdogIntervalId = setInterval(() => {
        const today = todayISO();
        const todayObj = ensureDayObject(today);
        const expectedTodaySlot = getExpectedTcmbSlot(today);
        if (todayObj.tcmbSlotKey !== expectedTodaySlot) {
            fetchAndApplyTcmbRates(today, true);
        }
        if (uiState.selectedDateISO === today) {
            updateTcmbBadgeLabel(today);
        }
    }, 20000);
}

function stepSelectedDate(deltaDays) {
    uiState.selectedDateISO = addDaysISO(uiState.selectedDateISO, deltaDays);
    ensureDayObject(uiState.selectedDateISO);
    renderAll();
    fetchAndApplyTcmbRates(uiState.selectedDateISO, false);
}

function handleDateInputChanged(val) {
    if (!val || val.trim().length < 8) return;
    uiState.selectedDateISO = parseAnyDateToISO(val);
    ensureDayObject(uiState.selectedDateISO);
    renderAll();
    fetchAndApplyTcmbRates(uiState.selectedDateISO, false);
}

function jumpToDateISO(iso) {
    uiState.selectedDateISO = parseAnyDateToISO(iso);
    ensureDayObject(uiState.selectedDateISO);
    renderAll();
    fetchAndApplyTcmbRates(uiState.selectedDateISO, false);
}

function jumpToToday() {
    jumpToDateISO(todayISO());
}

function updateDayMetaField(field, value) {
    if (!assertPermission("edit", "Form üst bilgisi / imza alanı düzenleme")) {
        renderAll();
        return;
    }
    const dayObj = ensureDayObject(uiState.selectedDateISO);
    dayObj[field] = String(value || "").trim();
    addAuditLog("FORM META", `${formatDateToTR(uiState.selectedDateISO)} ${field} alanı "${dayObj[field]}" olarak güncellendi.`);
    syncStateToServer();
    renderAll();
}

function autoCalcCarryFromPrevInputs() {
    const pIn = parseMoneyInputTR(document.getElementById("carry-modal-prev-in")?.value || 0);
    const pOut = parseMoneyInputTR(document.getElementById("carry-modal-prev-out")?.value || 0);
    if (pIn > 0 || pOut > 0) {
        const carryInput = document.getElementById("carry-modal-amount");
        if (carryInput) {
            const diff = pIn - pOut;
            carryInput.value = diff % 1 === 0 ? diff.toLocaleString("tr-TR") : formatNumberTR(diff);
        }
    }
}

function openCarryoverOverrideModal() {
    if (!assertPermission("edit", "Manuel kasa devri girişi")) return;
    const { dayObj, current, prev } = calculateDayMetrics(uiState.selectedDateISO);
    const fmtVal = (v) => {
        if (v === null || v === undefined || v === "") return "";
        const n = Number(v) || 0;
        if (n === 0) return "";
        return n % 1 === 0 ? n.toLocaleString("tr-TR") : formatNumberTR(n);
    };
    document.getElementById("carry-modal-date").value = formatDateToTR(uiState.selectedDateISO);
    document.getElementById("carry-modal-prev-in").value = dayObj.prevInOverride !== null && dayObj.prevInOverride !== undefined ? fmtVal(dayObj.prevInOverride) : fmtVal(prev.totalInWithCarry);
    document.getElementById("carry-modal-prev-out").value = dayObj.prevOutOverride !== null && dayObj.prevOutOverride !== undefined ? fmtVal(dayObj.prevOutOverride) : fmtVal(prev.cashOutSum);
    document.getElementById("carry-modal-label").value = dayObj.carryoverLabel || `${formatDateSlashTR(current.carrySourceDateISO)} TARİHLİ KASA DEVRİ ( + ) BAKİYESİ`;
    document.getElementById("carry-modal-amount").value = dayObj.carryoverOverride !== null && dayObj.carryoverOverride !== undefined ? fmtVal(dayObj.carryoverOverride) : fmtVal(current.carryover);
    openModal("modal-carryover");
}

function handleSaveCarryoverOverride(e) {
    e.preventDefault();
    if (!assertPermission("edit", "Manuel kasa devri kaydetme")) return;
    const dayObj = ensureDayObject(uiState.selectedDateISO);
    const lbl = document.getElementById("carry-modal-label").value.trim().toUpperCase();
    const rawPrevIn = document.getElementById("carry-modal-prev-in").value.trim();
    const rawPrevOut = document.getElementById("carry-modal-prev-out").value.trim();
    const rawAmt = document.getElementById("carry-modal-amount").value.trim();

    if (lbl) dayObj.carryoverLabel = lbl;
    dayObj.prevInOverride = rawPrevIn === "" ? null : parseMoneyInputTR(rawPrevIn);
    dayObj.prevOutOverride = rawPrevOut === "" ? null : parseMoneyInputTR(rawPrevOut);
    dayObj.carryoverOverride = rawAmt === "" ? null : parseMoneyInputTR(rawAmt);

    addAuditLog("MANUEL KASA DEVRİ", `${formatDateToTR(uiState.selectedDateISO)} kasa devri ${dayObj.carryoverOverride === null ? "0,00 TL / Otomatik" : formatMoneyTR(dayObj.carryoverOverride)} olarak kaydedildi.`);
    closeModal("modal-carryover");
    syncStateToServer();
    renderAll();
}

function clearCarryoverOverride() {
    if (!assertPermission("edit", "Kasa devir bakiyesi sıfırlama")) return;
    const dayObj = ensureDayObject(uiState.selectedDateISO);
    dayObj.prevInOverride = null;
    dayObj.prevOutOverride = null;
    dayObj.carryoverOverride = null;
    closeModal("modal-carryover");
    syncStateToServer();
    renderAll();
}

function clearCurrentDayEntries() {
    if (!assertPermission("edit", "Günü sıfırlama")) return;
    const dTR = formatDateToTR(uiState.selectedDateISO);
    if (!confirm(`${dTR} tarihli kasa formundaki tüm manuel kayıtlar ve devir tutarı sıfırlansın mı?`)) return;
    delete appState.days[uiState.selectedDateISO];
    ensureDayObject(uiState.selectedDateISO);
    addAuditLog("GÜN SIFIRLAMA", `${dTR} tarihli kasa formu 0,00 TL olarak sıfırlandı.`);
    syncStateToServer();
    renderAll();
    fetchAndApplyTcmbRates(uiState.selectedDateISO, true);
}

function resetAllKasaDataToZero() {
    if (!assertPermission("manageUsers", "Tüm günleri sıfırlama")) return;
    if (!confirm("Tüm günlerdeki kayıtlar silinerek uygulama 0,00 TL ile tamamen sıfırlansın mı?")) return;
    appState.days = {};
    uiState.selectedDateISO = todayISO();
    ensureDayObject(uiState.selectedDateISO);
    addAuditLog("TAM SIFIRLAMA", "Tüm kasa günleri temizlendi; 0,00 TL manuel başlangıç durumuna geçildi.");
    syncStateToServer();
    renderAll();
    fetchAndApplyTcmbRates(uiState.selectedDateISO, true);
}

function toggleDayLockStatus() {
    if (!assertPermission("lockDay", "Gün kilitleme / onaylama")) return;
    const dayObj = ensureDayObject(uiState.selectedDateISO);
    dayObj.isLocked = !dayObj.isLocked;
    addAuditLog("GÜN KİLİDİ", `${formatDateToTR(uiState.selectedDateISO)} günü ${dayObj.isLocked ? "KİLİTLENDİ" : "KİLİDİ AÇILDI"}.`);
    syncStateToServer();
    renderAll();
}

function approveDayController() {
    if (!assertPermission("lockDay", "Kontrol eden onayı")) return;
    const dayObj = ensureDayObject(uiState.selectedDateISO);
    dayObj.controllerApproved = !dayObj.controllerApproved;
    addAuditLog("KONTROL ONAYI", `${formatDateToTR(uiState.selectedDateISO)} kontrol onayı: ${dayObj.controllerApproved ? "ONAYLANDI" : "KALDIRILDI"}.`);
    syncStateToServer();
    renderAll();
}

// ==================== 16. A4 ÇIKTI, EXCEL (.XLS) İNDİRME VE WHATSAPP PAYLAŞIM ====================
function printDailyKasaA4() {
    renderA4SheetSection();
    switchTab("a4");
    setTimeout(() => {
        window.print();
    }, 180);
}

function exportDailyKasaExcel() {
    renderA4SheetSection();
    const sheetHtml = document.getElementById("a4-printable-sheet")?.innerHTML || "";
    const dateTR = formatDateToTR(uiState.selectedDateISO);
    const fullExcelDoc = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta charset="UTF-8">
            <style>
                table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 10pt; }
                td, th { border: 1px solid #000000; padding: 3px 6px; }
                .excel-bold-center { font-weight: bold; text-align: center; }
                .excel-bold-right, .excel-num { text-align: right; }
                .sub-title, .main-form-heading { font-weight: bold; text-align: center; background: #f1f5f9; }
            </style>
        </head>
        <body>
            ${sheetHtml}
        </body>
        </html>
    `;
    const blob = new Blob(["\uFEFF" + fullExcelDoc], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `Gunluk_Kasa_Formu_${dateTR}.xls`;
    a.click();
    addAuditLog("EXCEL ÇIKTI", `${dateTR} tarihli Günlük Kasa Formu Excel (.xls) olarak indirildi.`);
}

function shareDailyKasaWhatsApp() {
    const { dayObj, current } = calculateDayMetrics(uiState.selectedDateISO);
    const dTR = formatDateToTR(uiState.selectedDateISO);
    const msg = [
        `*DİZSAN GÜNLÜK KASA FORMU (${dTR})*`,
        `• Kasa Devri (+): ${formatMoneyTR(current.carryover)}`,
        `• Günlük Girişler Toplamı: ${formatMoneyTR(current.totalInWithCarry)}`,
        `• Günlük Nakit Ödemeler: ${formatMoneyTR(current.cashOutSum)}`,
        `*• GENEL TOPLAM (Devreden Net Kasa): ${formatMoneyTR(current.netClosing)}*`,
        `• Kredi Kartı (POS) Toplamı: ${formatMoneyTR(current.posCcSum)}`,
        `• Cari Kredi Kartı Ödemesi: ${formatMoneyTR(current.cariCcSum)}`,
        `• Gelen / Giden Havale: ${formatMoneyTR(current.wireInSum)} / ${formatMoneyTR(current.wireOutSum)}`,
        `• Kasa Sorumlusu: ${dayObj.cashierName || "GÖKHAN ÖZBULUT"} | Kontrol: ${dayObj.controllerName || "RAFET CANBEK"}`
    ].join("\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
}

function exportArchiveSearchCSV() {
    const clean = s => String(s || "").replace(/;/g, ",");
    let csv = "\uFEFFTarih;Bölüm;Kaynak/Banka/Cari;Açıklama;Tutar;TDR Tedarik;Ekleyen\n";
    const allDatesDesc = Object.keys(appState.days || {}).sort().reverse();
    for (const dISO of allDatesDesc) {
        for (const e of (appState.days[dISO]?.entries || [])) {
            csv += `${formatDateToTR(dISO)};${clean(SECTION_LABELS[e.section] || e.section)};${clean(e.col1)};${clean(e.desc)};${formatNumberTR(e.amount)};${isTdrSupplyItem(e) ? "EVET" : "HAYIR"};${clean(e.createdBy)}\n`;
        }
    }
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `Dizsan_Kasa_Hareketleri_${formatDateToTR(todayISO())}.csv`;
    a.click();
}

// ==================== 17. KULLANICI EKLEME / DÜZENLEME MODALI VE YEDEKLEME ====================
function applyRolePresetCheckboxes(presetKey) {
    const preset = ROLE_PRESETS[presetKey] || ROLE_PRESETS.VIEWER;
    const p = preset.permissions;
    const chkView = document.getElementById("perm-chk-view");
    if (chkView) chkView.checked = Boolean(p.view);
    document.getElementById("perm-chk-add").checked = Boolean(p.add);
    document.getElementById("perm-chk-edit").checked = Boolean(p.edit);
    document.getElementById("perm-chk-delete").checked = Boolean(p.delete);
    document.getElementById("perm-chk-lock").checked = Boolean(p.lockDay);
    document.getElementById("perm-chk-admin").checked = Boolean(p.manageUsers);
}

function openUserModal() {
    if (!assertPermission("manageUsers", "Yeni kullanıcı tanımlama")) return;
    document.getElementById("modal-user-title").innerHTML = `<i class="fa-solid fa-user-plus" style="color:var(--dizsan-cyan);"></i> <span>Yeni Kullanıcı ve Yetki Tanımla</span>`;
    document.getElementById("user-edit-original-username").value = "";
    document.getElementById("user-name-input").value = "";
    document.getElementById("user-username-input").value = "";
    document.getElementById("user-dept-input").value = "";
    document.getElementById("user-pass-input").value = "";
    document.getElementById("user-role-preset").value = "CONTRIBUTOR";
    applyRolePresetCheckboxes("CONTRIBUTOR");
    openModal("modal-user");
}

function openEditUserModal(username) {
    if (!assertPermission("manageUsers", "Kullanıcı düzenleme")) return;
    const u = (appState.users || []).find(x => x.username === username);
    if (!u) return;
    const up = getUserPerms(u);

    document.getElementById("modal-user-title").innerHTML = `<i class="fa-solid fa-user-pen" style="color:var(--amber-warn);"></i> <span>Kullanıcı ve Yetki Düzenle: ${escapeHtml(u.name)}</span>`;
    document.getElementById("user-edit-original-username").value = u.username;
    document.getElementById("user-name-input").value = u.name;
    document.getElementById("user-username-input").value = u.username;
    document.getElementById("user-dept-input").value = u.dept || "";
    document.getElementById("user-pass-input").value = "";
    document.getElementById("user-role-preset").value = u.rolePreset || "VIEWER";

    const chkView = document.getElementById("perm-chk-view");
    if (chkView) chkView.checked = Boolean(up.view);
    document.getElementById("perm-chk-add").checked = Boolean(up.add);
    document.getElementById("perm-chk-edit").checked = Boolean(up.edit);
    document.getElementById("perm-chk-delete").checked = Boolean(up.delete);
    document.getElementById("perm-chk-lock").checked = Boolean(up.lockDay);
    document.getElementById("perm-chk-admin").checked = Boolean(up.manageUsers);

    openModal("modal-user");
}

function handleSaveUser(e) {
    e.preventDefault();
    if (!assertPermission("manageUsers", "Kullanıcı kaydetme")) return;

    const origUser = document.getElementById("user-edit-original-username").value.trim();
    const name = document.getElementById("user-name-input").value.trim().toUpperCase();
    const username = normalizeTR(document.getElementById("user-username-input").value.trim());
    const dept = document.getElementById("user-dept-input").value.trim();
    const pass = document.getElementById("user-pass-input").value.trim();
    let rolePreset = document.getElementById("user-role-preset").value;

    const isNoneRole = rolePreset === "NONE";
    const chkView = document.getElementById("perm-chk-view");
    const canView = isNoneRole ? false : (chkView ? chkView.checked : true);

    const permissions = {
        view: canView,
        add: canView ? document.getElementById("perm-chk-add").checked : false,
        edit: canView ? document.getElementById("perm-chk-edit").checked : false,
        delete: canView ? document.getElementById("perm-chk-delete").checked : false,
        lockDay: canView ? document.getElementById("perm-chk-lock").checked : false,
        manageUsers: canView ? document.getElementById("perm-chk-admin").checked : false
    };

    if (!canView) {
        rolePreset = "NONE";
    }

    if (origUser) {
        const existing = (appState.users || []).find(u => u.username === origUser);
        if (existing) {
            existing.name = name;
            existing.username = username;
            existing.dept = dept;
            existing.rolePreset = rolePreset;
            existing.permissions = permissions;
            if (pass) existing.pinStamp = hashPin(pass);
            if (currentUser && currentUser.username === origUser) currentUser = existing;
            addAuditLog("KULLANICI GÜNCELLEME", `${name} (@${username}) bilgileri ve yetkileri güncellendi.`);
        }
    } else {
        if ((appState.users || []).some(u => normalizeTR(u.username) === username)) {
            alert("Bu kullanıcı adı zaten kayıtlı!");
            return;
        }
        appState.users.push({
            order: appState.users.length,
            name,
            username,
            email: `${username}@${CORP_MAIL_HOST}`,
            pinStamp: pass ? hashPin(pass) : DEFAULT_PIN_STAMP,
            dept,
            rolePreset,
            permissions
        });
        addAuditLog("YENİ KULLANICI", `${name} (@${username}) sisteme eklendi.`);
    }

    closeModal("modal-user");
    renderQuickUserChips();
    syncStateToServer();
    renderAll();
}

function deleteUserAccount(username) {
    if (!assertPermission("manageUsers", "Kullanıcı silme")) return;
    if (normalizeTR(username) === "ömer") {
        alert("Ana Sistem Yöneticisi (Ömer Eren) silinemez!");
        return;
    }
    const target = (appState.users || []).find(u => u.username === username);
    if (!target) return;
    if (!confirm(`${target.name} (@${target.username}) kullanıcısını silmek istediğinize emin misiniz?`)) return;
    appState.users = appState.users.filter(u => u.username !== username);
    addAuditLog("KULLANICI SİLME", `${target.name} (@${target.username}) silindi.`);
    renderQuickUserChips();
    syncStateToServer();
    renderAll();
}

function exportAuditLogsCSV() {
    const clean = s => String(s || "").replace(/;/g, ",");
    let csv = "\uFEFFTarih Saat;Kullanıcı;Kategori;Detay\n";
    (appState.auditLogs || []).forEach(l => {
        csv += `${clean(l.timestamp)};${clean(l.user)};${clean(l.category)};${clean(l.detail)}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `Dizsan_Kasa_Log_${formatDateToTR(todayISO())}.csv`;
    a.click();
}

function exportFullBackupJSON() {
    const blob = new Blob([JSON.stringify(appState, null, 2)], { type: "application/json;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `Dizsan_Gunluk_Kasa_Yedek_${todayISO()}.json`;
    a.click();
}

function importFullBackupJSON(event) {
    if (!assertPermission("manageUsers", "Yedek geri yükleme")) return;
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const parsed = JSON.parse(ev.target.result);
            if (parsed && parsed.days && Array.isArray(parsed.users)) {
                appState = parsed;
                addAuditLog("YEDEK YÜKLEME", "JSON yedek dosyası geri yüklendi.");
                syncStateToServer();
                renderAll();
                alert("Yedek başarıyla geri yüklendi!");
            } else {
                alert("Geçersiz yedek dosyası formatı.");
            }
        } catch (err) {
            alert("JSON dosyası okunamadı.");
        }
    };
    reader.readAsText(file, "utf-8");
}

// ==================== 18. OTURUM, ŞİFRE VE NAVİGASYON ====================
function renderQuickUserChips() {
    const box = document.getElementById("quick-user-list");
    if (!box) return;
    box.innerHTML = (appState.users || []).map(u => {
        const p = ROLE_PRESETS[u.rolePreset] || ROLE_PRESETS.VIEWER;
        const shortTag = p.code === "ADMIN" ? "Tam" : p.code === "EDITOR" ? "Düzenle" : p.code === "CONTRIBUTOR" ? "Ekle" : p.code === "NONE" ? "Engelli" : "İzle";
        return `
            <button type="button" class="user-chip" onclick="fillQuickLogin('${escapeHtml(u.username)}')" title="Yetki: ${escapeHtml(p.label)}">
                <span>${escapeHtml(u.name)}</span>
                <span style="font-size:0.6rem; color:${p.code === "NONE" ? "#fb7185" : "#38bdf8"};">(${escapeHtml(shortTag)})</span>
            </button>
        `;
    }).join("");
}

function fillQuickLogin(username) {
    const uIn = document.getElementById("login-username");
    const pIn = document.getElementById("login-password");
    if (uIn) uIn.value = username;
    if (pIn) pIn.focus();
}

function handleLogin(e) {
    e.preventDefault();
    const uVal = normalizeTR(document.getElementById("login-username")?.value || "");
    const pVal = (document.getElementById("login-password")?.value || "").trim();
    const rem = document.getElementById("login-remember-me")?.checked;
    const errEl = document.getElementById("login-error");

    const matched = (appState.users || []).find(u =>
        (normalizeTR(u.username) === uVal || normalizeTR(u.name) === uVal || normalizeTR(u.email) === uVal) &&
        verifyUserPin(u, pVal)
    );

    if (!matched) {
        if (errEl) {
            errEl.style.display = "block";
            errEl.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> Kullanıcı adı veya şifre hatalı!`;
        }
        return;
    }

    const userPerms = getUserPerms(matched);
    if (matched.rolePreset === "NONE" || userPerms.view === false) {
        if (errEl) {
            errEl.style.display = "block";
            errEl.innerHTML = `<i class="fa-solid fa-ban"></i> Bu kullanıcının sisteme erişim yetkisi kapatılmıştır (Hiçbiri / Erişime Kapalı).`;
        }
        return;
    }

    if (errEl) errEl.style.display = "none";
    currentUser = matched;

    if (rem) {
        localStorage.setItem(STORAGE_KEY_KASA_REMEMBER, JSON.stringify({ username: matched.username, savedPass: pVal }));
        localStorage.setItem(STORAGE_KEY_KASA_SESSION, JSON.stringify(currentUser));
    } else {
        localStorage.removeItem(STORAGE_KEY_KASA_REMEMBER);
        sessionStorage.setItem(STORAGE_KEY_KASA_SESSION, JSON.stringify(currentUser));
    }

    addAuditLog("OTURUM", `${currentUser.name} sisteme giriş yaptı.`);
    syncStateToServer();
    applyAuthenticatedSession();
}

function applyAuthenticatedSession() {
    const overlay = document.getElementById("login-overlay");
    if (!currentUser || currentUser.rolePreset === "NONE" || getUserPerms(currentUser).view === false) {
        overlay?.classList.remove("hidden");
        return;
    }
    overlay?.classList.add("hidden");

    const nameEl = document.getElementById("sidebar-user-name");
    if (nameEl) nameEl.textContent = currentUser.name;

    applyRolePermissionsToDOM();
    renderAll();
}

function handleLogout() {
    if (currentUser) {
        addAuditLog("OTURUM", `${currentUser.name} çıkış yaptı.`);
        syncStateToServer();
    }
    currentUser = null;
    localStorage.removeItem(STORAGE_KEY_KASA_SESSION);
    sessionStorage.removeItem(STORAGE_KEY_KASA_SESSION);
    document.getElementById("login-overlay")?.classList.remove("hidden");
}

function openForgotPasswordModal() {
    document.getElementById("forgot-step-1").style.display = "block";
    document.getElementById("forgot-step-2").style.display = "none";
    openModal("modal-forgot-password");
}

function sendPasswordResetCode() {
    const uVal = normalizeTR(document.getElementById("forgot-username").value);
    const matched = (appState.users || []).find(u => normalizeTR(u.username) === uVal || normalizeTR(u.name) === uVal);
    if (!matched) {
        alert("Kullanıcı bulunamadı!");
        return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    activePasswordReset = { username: matched.username, code };
    document.getElementById("forgot-step-1").style.display = "none";
    document.getElementById("forgot-step-2").style.display = "block";
    document.getElementById("forgot-code-display").innerHTML = `${escapeHtml(matched.name)} için doğrulama kodu: <strong>${code}</strong>`;
}

function verifyAndResetPassword() {
    const code = document.getElementById("forgot-code-input").value.trim();
    const newPass = document.getElementById("forgot-new-pass").value.trim();
    if (!activePasswordReset || code !== activePasswordReset.code || newPass.length < 3) {
        alert("Doğrulama kodu hatalı veya şifre çok kısa!");
        return;
    }
    const u = appState.users.find(x => x.username === activePasswordReset.username);
    if (u) {
        u.pinStamp = hashPin(newPass);
        addAuditLog("ŞİFRE SIFIRLAMA", `${u.name} şifresini yeniledi.`);
        syncStateToServer();
        closeModal("modal-forgot-password");
        alert("Şifreniz başarıyla güncellendi.");
    }
}

function openChangePasswordModal() {
    openModal("modal-change-password");
}

function handleChangePasswordSubmit(e) {
    e.preventDefault();
    if (!currentUser) return;
    const oldP = document.getElementById("chg-old-pass").value.trim();
    const newP = document.getElementById("chg-new-pass").value.trim();
    const confP = document.getElementById("chg-confirm-pass").value.trim();

    if (!verifyUserPin(currentUser, oldP)) {
        alert("Mevcut şifreniz hatalı!");
        return;
    }
    if (newP.length < 3 || newP !== confP) {
        alert("Yeni şifreler eşleşmiyor veya en az 3 karakter olmalıdır!");
        return;
    }
    currentUser.pinStamp = hashPin(newP);
    const u = appState.users.find(x => x.username === currentUser.username);
    if (u) u.pinStamp = currentUser.pinStamp;

    addAuditLog("ŞİFRE DEĞİŞTİRME", `${currentUser.name} şifresini değiştirdi.`);
    syncStateToServer();
    closeModal("modal-change-password");
    alert("Şifreniz başarıyla değiştirildi.");
}

// ==================== 19. TEMA, SEKME GEÇİŞİ VE KLAVYE KISAYOLLARI ====================
function applyTheme(mode) {
    const saved = mode || localStorage.getItem(STORAGE_KEY_KASA_THEME) || "dark";
    localStorage.setItem(STORAGE_KEY_KASA_THEME, saved);
    const sel = document.getElementById("theme-mode-select");
    if (sel) sel.value = saved;

    let effective = saved;
    if (saved === "system") {
        effective = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    }
    document.documentElement.setAttribute("data-theme", effective);
}

function setThemeMode(mode) {
    applyTheme(mode);
}

function switchTab(tabId) {
    uiState.activeTab = tabId;
    document.querySelectorAll(".tab-section").forEach(sec => {
        sec.classList.toggle("active", sec.id === `tab-${tabId}`);
    });
    document.querySelectorAll(".side-nav-btn").forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-tab") === tabId);
    });
    document.querySelectorAll(".mob-nav-item").forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-tab") === tabId);
    });

    const titles = {
        form: ["GÜNLÜK KASA FORMU", "%100 Manuel Giriş — Nakit devir, günlük giriş/ödemeler, POS kredi kartı, cari kart, çek/senet ve havale"],
        a4: ["A4 ÇIKTI & KLASİK EXCEL FORMU", "Eski Excel Günlük Kasa Formunun birebir A4 kağıt önizlemesi ve tek sayfa baskı motoru"],
        archive: ["KASA ARŞİVİ & HAREKET ARAMA", "Manuel girilen tüm kasa, kart, çek ve havale kayıtlarında cari, plaka ve TDR tedarik arama"],
        admin: ["KULLANICI & YETKİ SINIRLAMASI YÖNETİMİ", "Görüntüleme, Ekleme, Değişiklik, Tam Yetki ve Erişime Kapalı (Hiçbiri) atamaları"]
    };

    const info = titles[tabId] || titles.form;
    const h1 = document.getElementById("current-page-title");
    const sub = document.getElementById("current-page-subtitle");
    if (h1) h1.textContent = info[0];
    if (sub) sub.textContent = info[1];

    document.getElementById("app-sidebar")?.classList.remove("mobile-open");
    renderAll();

    if (window.autoDateHelper && typeof window.autoDateHelper.init === "function") {
        window.autoDateHelper.init();
    }
}

function toggleMobileSidebar() {
    document.getElementById("app-sidebar")?.classList.toggle("mobile-open");
}

function toggleMobileViewportPreview() {
    document.body.classList.toggle("force-mobile-mode");
    const isMob = document.body.classList.contains("force-mobile-mode");
    const lbl = document.getElementById("lbl-mobile-preview");
    if (lbl) lbl.textContent = isMob ? "Web" : "Mobil";
}

function openModal(id) {
    document.getElementById(id)?.classList.add("open");
    if (window.autoDateHelper && typeof window.autoDateHelper.init === "function") {
        setTimeout(() => window.autoDateHelper.init(), 50);
    }
}

function closeModal(id) {
    document.getElementById(id)?.classList.remove("open");
}

function openInstallModal() {
    openModal("modal-install-guide");
}

function renderAll() {
    applyRolePermissionsToDOM();
    renderDailyFormSection();
    renderA4SheetSection();
    renderArchiveSection();
    renderAdminSection();
    if (window.autoDateHelper && typeof window.autoDateHelper.init === "function") {
        window.autoDateHelper.init();
    }
}

document.addEventListener("keydown", (e) => {
    const tag = (e.target?.tagName || "").toUpperCase();
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
        if (e.key === "Escape") {
            document.querySelectorAll(".modal-backdrop.open").forEach(m => m.classList.remove("open"));
        }
        return;
    }
    if (e.key === "Escape") {
        document.querySelectorAll(".modal-backdrop.open").forEach(m => m.classList.remove("open"));
    } else if (e.key === "g" || e.key === "G") {
        e.preventDefault();
        openEntryModal("CASH_IN");
    } else if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        openEntryModal("CASH_OUT");
    } else if (e.key === "k" || e.key === "K") {
        e.preventDefault();
        openEntryModal("POS_CC");
    } else if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        printDailyKasaA4();
    }
});

window.addEventListener("DOMContentLoaded", async () => {
    applyTheme();
    await loadStateFromStorageAndServer();
    renderQuickUserChips();

    try {
        const remRaw = localStorage.getItem(STORAGE_KEY_KASA_REMEMBER);
        if (remRaw) {
            const rem = JSON.parse(remRaw);
            if (rem?.username) document.getElementById("login-username").value = rem.username;
            if (rem?.savedPass) document.getElementById("login-password").value = rem.savedPass;
        }
        const sessRaw = localStorage.getItem(STORAGE_KEY_KASA_SESSION) || sessionStorage.getItem(STORAGE_KEY_KASA_SESSION);
        if (sessRaw) {
            const parsedUser = JSON.parse(sessRaw);
            const matched = (appState.users || []).find(u => u.username === parsedUser.username);
            if (matched && matched.rolePreset !== "NONE" && getUserPerms(matched).view !== false) {
                currentUser = matched;
            } else {
                currentUser = appState.users[0];
            }
        } else {
            currentUser = appState.users[0];
        }
    } catch (e) {
        currentUser = appState.users[0];
    }

    applyAuthenticatedSession();
    setSyncBadge("ok");
    await fetchAndApplyTcmbRates(uiState.selectedDateISO, false);
    initTcmb1630AutoRefreshScheduler();

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("sw.js?v=1.0.3").catch(() => {});
    }
});
