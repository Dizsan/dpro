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

const CURRENT_APP_VERSION = "1.0.1";
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
        label: "Değişiklik & Düzenleme Yetkisi",
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
        label: "Sadece Görüntüleme (Salt Okunur)",
        badgeClass: "badge-danger",
        permissions: { view: true, add: false, edit: false, delete: false, lockDay: false, manageUsers: false }
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
    CARI_CC: "Cari Kredi Kartı Ödemesi",
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

        const cashInEntriesSum = sumSection("CASH_IN");
        const totalInWithCarry = Number((carryover + cashInEntriesSum).toFixed(2));
        const cashOutSum = Number(sumSection("CASH_OUT").toFixed(2));
        const netClosing = Number((totalInWithCarry - cashOutSum).toFixed(2));

        const posCcSum = Number(sumSection("POS_CC").toFixed(2));
        const cariCcSum = Number(sumSection("CARI_CC").toFixed(2));
        const checkOutSum = Number(sumSection("CHECK_OUT").toFixed(2));
        const checkCariSum = Number(sumSection("CHECK_CARI_BANK").toFixed(2));
        const wireInSum = Number(sumSection("WIRE_IN").toFixed(2));
        const wireOutSum = Number(sumSection("WIRE_OUT").toFixed(2));

        metricsByDate[iso] = {
            dateISO: iso,
            carrySourceDateISO,
            carryover,
            hasOverride,
            cashInEntriesSum,
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
    try {
        // Eski hazır/örnek veriyi kesin olarak temizle
        localStorage.removeItem(OLD_DEMO_STORAGE_KEY);
        const raw = localStorage.getItem(STORAGE_KEY_KASA_STATE);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.days && Array.isArray(parsed.users)) {
                appState = { ...buildInitialState(), ...parsed };
                return;
            }
        }
    } catch (e) {}

    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        try {
            const res = await fetch("/api/kasa-state?t=" + Date.now(), { cache: "no-store" });
            if (res.ok) {
                const srv = await res.json();
                if (srv && srv.days && Array.isArray(srv.users)) {
                    appState = { ...buildInitialState(), ...srv };
                    saveStateLocally();
                }
            }
        } catch (e) {}
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
        if (!perms.add && !perms.edit) {
            banner.style.display = "flex";
            banner.style.background = "rgba(244, 63, 94, 0.14)";
            banner.style.border = "1px solid rgba(244, 63, 94, 0.38)";
            banner.style.color = "#fecdd3";
            banner.innerHTML = `
                <span><i class="fa-solid fa-eye"></i> <strong>Salt Okunur (Sadece Görüntüleme) Yetkisi:</strong> Günlük kasa formlarını inceleyebilir ve <strong>A4 / Excel çıktısı</strong> alabilirsiniz. Kayıt ekleme ve değiştirme kapalıdır.</span>
                <span class="badge badge-danger">Salt Okunur</span>
            `;
        } else if (perms.add && !perms.edit) {
            banner.style.display = "flex";
            banner.style.background = "rgba(245, 158, 11, 0.14)";
            banner.style.border = "1px solid rgba(245, 158, 11, 0.4)";
            banner.style.color = "#fde68a";
            banner.innerHTML = `
                <span><i class="fa-solid fa-plus-circle"></i> <strong>Sadece Ekleme Yetkisi:</strong> Tablolara <strong>manuel yeni kayıt ekleyebilir</strong> ve <strong>A4 çıktı</strong> alabilirsiniz. Mevcut kayıtlar üzerinde değişiklik veya silme yapılamaz.</span>
                <span class="badge badge-warning">Ekleme + Görüntüleme</span>
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

// ==================== 9. TABLO İÇİ DOĞRUDAN MANUEL SATIR EKLEME (INLINE ENTRY) ====================
function handleInlineQuickAdd(sectionKey) {
    if (!assertPermission("add", "Yeni manuel kayıt ekleme")) return;
    const iso = uiState.selectedDateISO;
    const dayObj = ensureDayObject(iso);
    if (dayObj.isLocked && !hasPermission("manageUsers")) {
        alert("Bu gün kilitlenmiştir.");
        return;
    }

    const col1El = document.getElementById(`inline-col1-${sectionKey}`);
    const dueEl = document.getElementById(`inline-due-${sectionKey}`);
    const descEl = document.getElementById(`inline-desc-${sectionKey}`);
    const amtEl = document.getElementById(`inline-amt-${sectionKey}`);

    const col1 = (col1El ? col1El.value : "").trim().toUpperCase();
    const dueDate = (dueEl ? dueEl.value : "").trim();
    const desc = (descEl ? descEl.value : "").trim().toUpperCase();
    const amount = Number(amtEl ? amtEl.value : 0) || 0;

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

    addAuditLog("MANUEL GİRİŞ", `${formatDateToTR(iso)} [${SECTION_LABELS[sectionKey]}] "${desc}" (${formatMoneyTR(amount)}) manuel eklendi.`);
    syncStateToServer();
    renderAll();
}

function handleInlineKeydown(event, sectionKey) {
    if (event.key === "Enter") {
        event.preventDefault();
        handleInlineQuickAdd(sectionKey);
    }
}

// ==================== 10. GÜNLÜK KASA FORMU RENDER MOTORU ====================
function renderDailyFormSection() {
    const iso = uiState.selectedDateISO;
    const { dayObj, current, prev } = calculateDayMetrics(iso);
    const perms = getUserPerms(currentUser);
    const isDayLocked = Boolean(dayObj.isLocked);
    const canModifyToday = !isDayLocked || perms.manageUsers;
    const canAddRow = perms.add && canModifyToday;

    const dateInput = document.getElementById("kasa-date-input");
    if (dateInput) dateInput.value = formatDateToTR(iso);

    const pill = document.getElementById("active-date-pill");
    if (pill) pill.textContent = formatDateToTR(iso);

    const lblRightDate = document.getElementById("lbl-right-date");
    if (lblRightDate) lblRightDate.textContent = formatDateToTR(iso);

    const eurIn = document.getElementById("fx-eur-input");
    const usdIn = document.getElementById("fx-usd-input");
    if (eurIn) eurIn.value = dayObj.euroRate || "--";
    if (usdIn) usdIn.value = dayObj.usdRate || "--";

    const cashierIn = document.getElementById("sig-cashier-input");
    const controllerIn = document.getElementById("sig-controller-input");
    if (cashierIn) cashierIn.value = dayObj.cashierName || "GÖKHAN ÖZBULUT";
    if (controllerIn) controllerIn.value = dayObj.controllerName || "RAFET CANBEK";

    const lockBtn = document.getElementById("btn-toggle-day-lock");
    if (lockBtn) {
        if (isDayLocked) {
            lockBtn.className = "btn btn-danger btn-sm";
            lockBtn.innerHTML = `<i class="fa-solid fa-lock"></i> <span>Gün Kilitli</span>`;
        } else {
            lockBtn.className = "btn btn-sm";
            lockBtn.innerHTML = `<i class="fa-solid fa-lock-open" style="color:#10b981;"></i> <span>Gün Açık</span>`;
        }
    }

    const ctrlBtn = document.getElementById("btn-controller-approve");
    const ctrlSub = document.getElementById("sub-controller-approve");
    if (ctrlBtn && ctrlSub) {
        if (dayObj.controllerApproved) {
            ctrlBtn.className = "btn btn-xs btn-success";
            ctrlBtn.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>Kontrol Onaylandı</span>`;
            ctrlSub.textContent = `${dayObj.controllerName || "RAFET CANBEK"} tarafından onaylı`;
        } else {
            ctrlBtn.className = "btn btn-xs btn-primary";
            ctrlBtn.innerHTML = `<i class="fa-solid fa-check-double"></i> <span>Kontrol Onayı Ver</span>`;
            ctrlSub.textContent = "Onay bekliyor";
        }
    }

    // KPI Kartları
    const cashOutEntries = (dayObj.entries || []).filter(e => e.section === "CASH_OUT");
    const cashInEntries = (dayObj.entries || []).filter(e => e.section === "CASH_IN");
    const posEntries = (dayObj.entries || []).filter(e => e.section === "POS_CC");

    document.getElementById("kpi-net-closing").textContent = formatMoneyTR(current.netClosing);
    document.getElementById("kpi-net-closing-sub").textContent = `Girişler (${formatMoneyTR(current.totalInWithCarry)}) − Ödemeler (${formatMoneyTR(current.cashOutSum)})`;

    document.getElementById("kpi-total-in").textContent = formatMoneyTR(current.totalInWithCarry);
    document.getElementById("kpi-total-in-sub").textContent = `Devir: ${formatMoneyTR(current.carryover)} | Gün İçi: ${formatMoneyTR(current.cashInEntriesSum)}`;

    document.getElementById("kpi-total-out").textContent = formatMoneyTR(current.cashOutSum);
    document.getElementById("kpi-total-out-sub").textContent = `${cashOutEntries.length} Kalem Nakit Çıkış`;

    document.getElementById("kpi-pos-total").textContent = formatMoneyTR(current.posCcSum);
    document.getElementById("kpi-pos-sub").textContent = `${posEntries.length} Adet Kredi Kartı / POS Çekimi`;

    const otherSum = current.cariCcSum + current.checkOutSum + current.checkCariSum + current.wireInSum + current.wireOutSum;
    document.getElementById("kpi-other-total").textContent = formatMoneyTR(otherSum);
    document.getElementById("kpi-other-sub").textContent = `Cari Kart: ${formatMoneyTR(current.cariCcSum)} | Havale/Çek: ${formatMoneyTR(otherSum - current.cariCcSum)}`;

    // Önceki Gün Üst Şerit Özeti
    document.getElementById("prev-summary-date-label").textContent = formatDateToTR(prev.dateISO);
    document.getElementById("prev-summary-in-val").textContent = formatMoneyTR(prev.totalInWithCarry);
    document.getElementById("prev-summary-out-val").textContent = formatMoneyTR(prev.cashOutSum);
    document.getElementById("prev-summary-carry-val").textContent = formatMoneyTR(current.carryover);

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

    // 1. ÜST SOL TABLO: KASA DEVRİ VE GÜNLÜK NAKİT GİRİŞLER
    const carryDesc = dayObj.carryoverLabel || `${formatDateSlashTR(current.carrySourceDateISO)} TARİHLİ KASA DEVRİ ( + ) BAKİYESİ`;
    const tbodyCashIn = document.getElementById("tbody-cash-in");
    if (tbodyCashIn) {
        let html = `
            <tr class="carryover-row">
                <td>KASA DEVRİ</td>
                <td>${escapeHtml(carryDesc)}</td>
                <td class="amount-cell">${formatNumberTR(current.carryover)}</td>
                <td style="text-align:right;">
                    ${perms.edit && canModifyToday ? `<button class="btn btn-xs" onclick="openCarryoverOverrideModal()" title="Manuel Devir Tutarı Gir"><i class="fa-solid fa-pen"></i></button>` : `<i class="fa-solid fa-check-circle"></i>`}
                </td>
            </tr>
        `;
        html += cashInEntries.map(e => `
            <tr>
                <td><strong>${escapeHtml(e.col1 || "NAKİT GİRİŞ")}</strong></td>
                <td>${escapeHtml(e.desc)}${renderTdrBadge(e)}</td>
                <td class="amount-cell" style="color:#34d399;">${formatNumberTR(e.amount)}</td>
                <td style="text-align:right;">${buildActionButtons(e.id)}</td>
            </tr>
        `).join("");

        if (canAddRow) {
            html += `
                <tr style="background:rgba(16,185,129,0.05);">
                    <td><input type="text" id="inline-col1-CASH_IN" class="form-control" style="padding:4px 7px; font-size:0.74rem;" placeholder="Tür (Örn: NAKİT)" onkeydown="handleInlineKeydown(event, 'CASH_IN')"></td>
                    <td><input type="text" id="inline-desc-CASH_IN" class="form-control" style="padding:4px 7px; font-size:0.74rem;" placeholder="Manuel nakit giriş açıklaması yazın..." onkeydown="handleInlineKeydown(event, 'CASH_IN')"></td>
                    <td><input type="number" step="0.01" id="inline-amt-CASH_IN" class="form-control" style="padding:4px 7px; font-size:0.74rem; text-align:right;" placeholder="0.00" onkeydown="handleInlineKeydown(event, 'CASH_IN')"></td>
                    <td style="text-align:right;">
                        <button type="button" class="btn btn-success btn-xs" onclick="handleInlineQuickAdd('CASH_IN')" title="Satırı Ekle"><i class="fa-solid fa-plus"></i> Ekle</button>
                    </td>
                </tr>
            `;
        }
        tbodyCashIn.innerHTML = html;
    }
    document.getElementById("tfoot-cash-in-total").textContent = formatMoneyTR(current.totalInWithCarry);

    // 2. ÜST SAĞ TABLO: GÜNLÜK NAKİT ÖDEMELER
    const tbodyCashOut = document.getElementById("tbody-cash-out");
    if (tbodyCashOut) {
        let html = cashOutEntries.map(e => `
            <tr>
                <td>
                    ${e.col1 && e.col1 !== "NAKİT ÖDEME" ? `<span class="badge badge-info" style="margin-right:5px; font-size:0.62rem;">${escapeHtml(e.col1)}</span>` : ""}
                    <strong>${escapeHtml(e.desc)}</strong>${renderTdrBadge(e)}
                </td>
                <td class="amount-cell">${formatNumberTR(e.amount)}</td>
                <td style="text-align:right;">${buildActionButtons(e.id)}</td>
            </tr>
        `).join("");

        if (canAddRow) {
            html += `
                <tr style="background:rgba(244,63,94,0.05);">
                    <td><input type="text" id="inline-desc-CASH_OUT" class="form-control" style="padding:4px 7px; font-size:0.74rem;" placeholder="Manuel ödeme açıklaması yazın..." onkeydown="handleInlineKeydown(event, 'CASH_OUT')"></td>
                    <td><input type="number" step="0.01" id="inline-amt-CASH_OUT" class="form-control" style="padding:4px 7px; font-size:0.74rem; text-align:right;" placeholder="0.00" onkeydown="handleInlineKeydown(event, 'CASH_OUT')"></td>
                    <td style="text-align:right;">
                        <button type="button" class="btn btn-danger btn-xs" onclick="handleInlineQuickAdd('CASH_OUT')" title="Ödeme Satırı Ekle"><i class="fa-solid fa-plus"></i> Ekle</button>
                    </td>
                </tr>
            `;
        } else if (cashOutEntries.length === 0) {
            html = `<tr><td colspan="3" style="color:var(--text-muted); font-size:0.73rem; text-align:center; padding:12px;">Kayıt yok (0,00 ₺)</td></tr>`;
        }
        tbodyCashOut.innerHTML = html;
    }
    document.getElementById("tfoot-cash-out-total").textContent = formatMoneyTR(current.cashOutSum);
    document.getElementById("tfoot-grand-total").textContent = formatMoneyTR(current.netClosing);

    // 3. ALT TABLO 1: ÇEK - SENET ÇIKIŞI
    const checkOutList = (dayObj.entries || []).filter(e => e.section === "CHECK_OUT");
    const tbodyCheckOut = document.getElementById("tbody-check-out");
    if (tbodyCheckOut) {
        let html = checkOutList.map(e => `
            <tr>
                <td><strong>${escapeHtml(e.col1 || "ÇEK")}</strong></td>
                <td>${escapeHtml(formatDateToTR(e.dueDate))}</td>
                <td>${escapeHtml(e.desc)}${renderTdrBadge(e)}</td>
                <td class="amount-cell">${formatNumberTR(e.amount)}</td>
                <td style="text-align:right;">${buildActionButtons(e.id)}</td>
            </tr>
        `).join("");
        if (canAddRow) {
            html += `
                <tr>
                    <td><input type="text" id="inline-col1-CHECK_OUT" class="form-control" style="padding:3px 6px; font-size:0.72rem;" placeholder="Çek/Senet" onkeydown="handleInlineKeydown(event, 'CHECK_OUT')"></td>
                    <td><input type="text" id="inline-due-CHECK_OUT" class="form-control" style="padding:3px 6px; font-size:0.72rem;" placeholder="GG.AA.YYYY" onkeydown="handleInlineKeydown(event, 'CHECK_OUT')"></td>
                    <td><input type="text" id="inline-desc-CHECK_OUT" class="form-control" style="padding:3px 6px; font-size:0.72rem;" placeholder="Müşteri ismi..." onkeydown="handleInlineKeydown(event, 'CHECK_OUT')"></td>
                    <td><input type="number" step="0.01" id="inline-amt-CHECK_OUT" class="form-control" style="padding:3px 6px; font-size:0.72rem; text-align:right;" placeholder="0.00" onkeydown="handleInlineKeydown(event, 'CHECK_OUT')"></td>
                    <td style="text-align:right;"><button type="button" class="btn btn-primary btn-xs" onclick="handleInlineQuickAdd('CHECK_OUT')"><i class="fa-solid fa-plus"></i></button></td>
                </tr>
            `;
        } else if (checkOutList.length === 0) {
            html = `<tr><td colspan="5" style="color:var(--text-muted); font-size:0.72rem; text-align:center;">Kayıt yok (0,00 ₺)</td></tr>`;
        }
        tbodyCheckOut.innerHTML = html;
    }
    document.getElementById("tfoot-check-out").textContent = formatMoneyTR(current.checkOutSum);

    // 4. DİĞER ALT TABLOLAR (3 Kolonlu + Inline Girişli)
    const renderThreeColTable = (sectionKey, tbodyId, tfootId, totalVal, col1Ph, descPh) => {
        const list = (dayObj.entries || []).filter(e => e.section === sectionKey);
        const tb = document.getElementById(tbodyId);
        if (tb) {
            let html = list.map(e => `
                <tr>
                    <td><strong>${escapeHtml(e.col1 || "-")}</strong></td>
                    <td>${escapeHtml(e.desc)}${renderTdrBadge(e)}</td>
                    <td class="amount-cell">${formatNumberTR(e.amount)}</td>
                    <td style="text-align:right;">${buildActionButtons(e.id)}</td>
                </tr>
            `).join("");
            if (canAddRow) {
                html += `
                    <tr>
                        <td><input type="text" id="inline-col1-${sectionKey}" class="form-control" style="padding:3px 6px; font-size:0.72rem;" placeholder="${escapeHtml(col1Ph)}" onkeydown="handleInlineKeydown(event, '${sectionKey}')"></td>
                        <td><input type="text" id="inline-desc-${sectionKey}" class="form-control" style="padding:3px 6px; font-size:0.72rem;" placeholder="${escapeHtml(descPh)}" onkeydown="handleInlineKeydown(event, '${sectionKey}')"></td>
                        <td><input type="number" step="0.01" id="inline-amt-${sectionKey}" class="form-control" style="padding:3px 6px; font-size:0.72rem; text-align:right;" placeholder="0.00" onkeydown="handleInlineKeydown(event, '${sectionKey}')"></td>
                        <td style="text-align:right;"><button type="button" class="btn btn-primary btn-xs" onclick="handleInlineQuickAdd('${sectionKey}')" title="Satır Ekle"><i class="fa-solid fa-plus"></i></button></td>
                    </tr>
                `;
            } else if (list.length === 0) {
                html = `<tr><td colspan="4" style="color:var(--text-muted); font-size:0.72rem; text-align:center;">Kayıt yok (0,00 ₺)</td></tr>`;
            }
            tb.innerHTML = html;
        }
        const tf = document.getElementById(tfootId);
        if (tf) tf.textContent = formatMoneyTR(totalVal);
    };

    renderThreeColTable("CHECK_CARI_BANK", "tbody-check-cari", "tfoot-check-cari", current.checkCariSum, "Cari / Banka", "Açıklama yazın...");
    renderThreeColTable("CARI_CC", "tbody-cari-cc", "tfoot-cari-cc", current.cariCcSum, "Cari İsmi", "Kart çekim açıklaması...");
    renderThreeColTable("WIRE_OUT", "tbody-wire-out", "tfoot-wire-out", current.wireOutSum, "Banka", "Alıcı cari / açıklama...");
    renderThreeColTable("POS_CC", "tbody-pos-cc", "tfoot-pos-cc", current.posCcSum, "Banka (Örn: ZİRAAT)", "Cari / fatura açıklaması...");
    renderThreeColTable("WIRE_IN", "tbody-wire-in", "tfoot-wire-in", current.wireInSum, "Banka", "Gönderen cari / açıklama...");

    const badgeToday = document.getElementById("nav-badge-today-items");
    if (badgeToday) badgeToday.textContent = (dayObj.entries || []).length;
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
                <td style="width:9%; text-align:center;">${escapeHtml(dayObj.euroRate || "--")}</td>
                <td rowspan="2" class="main-form-heading" style="width:45%;">GÜNLÜK KASA FORMU</td>
                <td style="width:35%;">&nbsp;</td>
            </tr>
            <tr>
                <td style="font-weight:700; text-align:center;">Dolar Kuru</td>
                <td style="text-align:center;">${escapeHtml(dayObj.usdRate || "--")}</td>
                <td>&nbsp;</td>
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
                        </select>
                    </td>
                    <td>
                        <div style="display:flex; flex-wrap:wrap; gap:5px;">
                            <label class="perm-pill-check"><input type="checkbox" checked disabled> <span>Görüntüleme</span></label>
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
    syncStateToServer();
    renderAll();
}

function quickToggleUserPerm(username, permKey, isChecked) {
    if (!assertPermission("manageUsers", "Kullanıcı izin anahtarı değiştirme")) return;
    const u = (appState.users || []).find(x => x.username === username);
    if (!u) return;
    if (!u.permissions) u.permissions = { ...getUserPerms(u) };
    u.permissions[permKey] = Boolean(isChecked);

    if (u.permissions.manageUsers) u.rolePreset = "ADMIN";
    else if (u.permissions.edit || u.permissions.delete) u.rolePreset = "EDITOR";
    else if (u.permissions.add) u.rolePreset = "CONTRIBUTOR";
    else u.rolePreset = "VIEWER";

    if (currentUser && currentUser.username === u.username) currentUser = u;
    addAuditLog("YETKİ DEĞİŞİKLİĞİ", `${u.name} için "${permKey}" izni ${isChecked ? "AÇILDI" : "KAPATILDI"}.`);
    syncStateToServer();
    renderAll();
}

// ==================== 14. DETAYLI MODAL İLE KAYIT EKLEME, DÜZENLEME VE SİLME ====================
function handleEntrySectionChange(sectionVal) {
    const lblCol1 = document.getElementById("lbl-entry-col1");
    const inpCol1 = document.getElementById("entry-col1");
    const grpCol1 = document.getElementById("group-entry-col1");
    const grpDue = document.getElementById("group-entry-due");
    const lblDesc = document.getElementById("lbl-entry-desc");

    if (grpDue) grpDue.style.display = sectionVal === "CHECK_OUT" ? "block" : "none";
    if (grpCol1) grpCol1.style.display = "block";

    if (sectionVal === "CASH_IN") {
        lblCol1.textContent = "Giriş Türü / Kaynak";
        inpCol1.placeholder = "Örn: NAKİT TAHSİLAT, KASA GİRİŞİ";
        lblDesc.textContent = "Açıklama / Müşteri / Fatura Bilgisi";
    } else if (sectionVal === "CASH_OUT") {
        lblCol1.textContent = "Gider Grubu (Opsiyonel)";
        inpCol1.placeholder = "Örn: MUTFAK, ARAÇ GİDERİ, TEDARİK";
        lblDesc.textContent = "Ödeme Açıklaması";
    } else if (sectionVal === "POS_CC") {
        lblCol1.textContent = "POS Bankası";
        inpCol1.placeholder = "Örn: ZİRAAT, GARANTİ, İŞ BANKASI";
        lblDesc.textContent = "Cari Hesap / Fatura Açıklaması";
    } else if (sectionVal === "CARI_CC") {
        lblCol1.textContent = "Cari / Müşteri İsmi";
        inpCol1.placeholder = "Cari veya müşteri adı";
        lblDesc.textContent = "Kart Çekim Açıklaması";
    } else if (sectionVal === "CHECK_OUT") {
        lblCol1.textContent = "Senet / Çek Bilgisi";
        inpCol1.placeholder = "Örn: ÇEK / SENET";
        lblDesc.textContent = "Müşteri / Alıcı Cari İsmi";
    } else if (sectionVal === "CHECK_CARI_BANK") {
        lblCol1.textContent = "Cari Hesap / Banka";
        inpCol1.placeholder = "Cari veya banka adı";
        lblDesc.textContent = "Açıklama";
    } else if (sectionVal === "WIRE_IN") {
        lblCol1.textContent = "Alıcı Bankamız";
        inpCol1.placeholder = "Banka adı";
        lblDesc.textContent = "Gönderen Cari / Havale Açıklaması";
    } else if (sectionVal === "WIRE_OUT") {
        lblCol1.textContent = "Gönderen Bankamız";
        inpCol1.placeholder = "Banka adı";
        lblDesc.textContent = "Alıcı Cari / Ödeme Açıklaması";
    }
}

function openEntryModal(defaultSection = "CASH_OUT") {
    if (!assertPermission("add", "Yeni kasa kaydı ekleme")) return;
    const dayObj = ensureDayObject(uiState.selectedDateISO);
    if (dayObj.isLocked && !hasPermission("manageUsers")) {
        alert("Bu gün kilitlenmiştir.");
        return;
    }

    document.getElementById("modal-entry-title").innerHTML = `<i class="fa-solid fa-plus-circle" style="color:var(--dizsan-cyan);"></i> <span>Yeni Manuel Kasa Kaydı Ekle</span>`;
    document.getElementById("entry-id").value = "";
    document.getElementById("entry-date").value = formatDateToTR(uiState.selectedDateISO);
    document.getElementById("entry-section").value = defaultSection;
    document.getElementById("entry-col1").value = "";
    document.getElementById("entry-due-date").value = "";
    document.getElementById("entry-desc").value = "";
    document.getElementById("entry-amount").value = "";
    document.getElementById("entry-code").value = "";

    handleEntrySectionChange(defaultSection);
    openModal("modal-entry");
    setTimeout(() => document.getElementById("entry-desc")?.focus(), 80);
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

    document.getElementById("modal-entry-title").innerHTML = `<i class="fa-solid fa-pen-to-square" style="color:var(--amber-warn);"></i> <span>Kasa Kaydını Değiştir / Düzenle</span>`;
    document.getElementById("entry-id").value = entry.id;
    document.getElementById("entry-date").value = formatDateToTR(entry.dateISO || uiState.selectedDateISO);
    document.getElementById("entry-section").value = entry.section;
    document.getElementById("entry-col1").value = entry.col1 || "";
    document.getElementById("entry-due-date").value = entry.dueDate ? formatDateToTR(entry.dueDate) : "";
    document.getElementById("entry-desc").value = entry.desc || "";
    document.getElementById("entry-amount").value = entry.amount;
    document.getElementById("entry-code").value = entry.code || "";

    handleEntrySectionChange(entry.section);
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
    const col1 = document.getElementById("entry-col1").value.trim().toUpperCase();
    const dueDate = document.getElementById("entry-due-date").value.trim();
    const desc = document.getElementById("entry-desc").value.trim().toUpperCase();
    const amount = Number(document.getElementById("entry-amount").value) || 0;
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
        addAuditLog("KAYIT DÜZENLEME", `${formatDateToTR(targetISO)} [${SECTION_LABELS[section]}] "${desc}" (${formatMoneyTR(amount)}) güncellendi.`);
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
        addAuditLog("MANUEL GİRİŞ", `${formatDateToTR(targetISO)} [${SECTION_LABELS[section]}] "${desc}" (${formatMoneyTR(amount)}) eklendi.`);
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

// ==================== 15. TARİH GEZGİNİ, MANUEL DEVİR VE SIFIRLAMA ====================
function stepSelectedDate(deltaDays) {
    uiState.selectedDateISO = addDaysISO(uiState.selectedDateISO, deltaDays);
    ensureDayObject(uiState.selectedDateISO);
    renderAll();
}

function handleDateInputChanged(val) {
    if (!val || val.trim().length < 8) return;
    uiState.selectedDateISO = parseAnyDateToISO(val);
    ensureDayObject(uiState.selectedDateISO);
    renderAll();
}

function jumpToDateISO(iso) {
    uiState.selectedDateISO = parseAnyDateToISO(iso);
    ensureDayObject(uiState.selectedDateISO);
    renderAll();
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
    const pIn = Number(document.getElementById("carry-modal-prev-in")?.value || 0);
    const pOut = Number(document.getElementById("carry-modal-prev-out")?.value || 0);
    if (pIn > 0 || pOut > 0) {
        const carryInput = document.getElementById("carry-modal-amount");
        if (carryInput) carryInput.value = (pIn - pOut).toFixed(2);
    }
}

function openCarryoverOverrideModal() {
    if (!assertPermission("edit", "Manuel kasa devri girişi")) return;
    const { dayObj, current, prev } = calculateDayMetrics(uiState.selectedDateISO);
    document.getElementById("carry-modal-date").value = formatDateToTR(uiState.selectedDateISO);
    document.getElementById("carry-modal-prev-in").value = dayObj.prevInOverride !== null && dayObj.prevInOverride !== undefined ? dayObj.prevInOverride : (prev.totalInWithCarry || "");
    document.getElementById("carry-modal-prev-out").value = dayObj.prevOutOverride !== null && dayObj.prevOutOverride !== undefined ? dayObj.prevOutOverride : (prev.cashOutSum || "");
    document.getElementById("carry-modal-label").value = dayObj.carryoverLabel || `${formatDateSlashTR(current.carrySourceDateISO)} TARİHLİ KASA DEVRİ ( + ) BAKİYESİ`;
    document.getElementById("carry-modal-amount").value = dayObj.carryoverOverride !== null && dayObj.carryoverOverride !== undefined ? dayObj.carryoverOverride : (current.carryover || "");
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
    dayObj.prevInOverride = rawPrevIn === "" ? null : Number(rawPrevIn);
    dayObj.prevOutOverride = rawPrevOut === "" ? null : Number(rawPrevOut);
    dayObj.carryoverOverride = rawAmt === "" ? null : Number(rawAmt);

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
    const rolePreset = document.getElementById("user-role-preset").value;

    const permissions = {
        view: true,
        add: document.getElementById("perm-chk-add").checked,
        edit: document.getElementById("perm-chk-edit").checked,
        delete: document.getElementById("perm-chk-delete").checked,
        lockDay: document.getElementById("perm-chk-lock").checked,
        manageUsers: document.getElementById("perm-chk-admin").checked
    };

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
        return `
            <button type="button" class="user-chip" onclick="fillQuickLogin('${escapeHtml(u.username)}')" title="Yetki: ${escapeHtml(p.label)}">
                <span>${escapeHtml(u.name)}</span>
                <span style="font-size:0.6rem; color:#38bdf8;">(${escapeHtml(p.code === "ADMIN" ? "Tam" : p.code === "EDITOR" ? "Düzenle" : p.code === "CONTRIBUTOR" ? "Ekle" : "İzle")})</span>
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
    if (!currentUser) {
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
        admin: ["KULLANICI & YETKİ SINIRLAMASI YÖNETİMİ", "Görüntüleme, Ekleme, Değişiklik ve Tam Yetki atamaları ile işlem denetim logları"]
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
            if (matched) currentUser = matched;
        } else {
            currentUser = appState.users[0];
        }
    } catch (e) {
        currentUser = appState.users[0];
    }

    applyAuthenticatedSession();
    setSyncBadge("ok");

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("sw.js?v=1.0.1").catch(() => {});
    }
});
