// Dizsan Aylık Ödeme Takvimi (v3.0 - Sadece Kredi Kartları & Banka Kredileri + Mobil App)

// 1. Durum Yönetimi (State)
const state = {
  currentDate: new Date(),
  activeView: 'calendar', // 'calendar' | 'cards' | 'loans' | 'list' | 'mobile'
  cardSearchQuery: '',
  listSearchQuery: '',
  filters: {
    category: 'all', // 'all' | 'kredi-karti' | 'kredi'
    status: 'all'    // 'all' | 'paid' | 'partial' | 'unpaid'
  }
};

const MONTH_NAMES = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];

// LocalStorage Anahtarları
const CARD_MONTHLY_STATE_KEY = 'dizsan_odeme_takvimi_kart_aylik_v3';

// 2. Önceki Sohbetlerden Alınan Gerçek 16 Kredi Kartı Listesi (Banka, Kart Adı, Son 4 Hane, Kart Sahibi, Şirket/Şahsi, Hesap Kesim ve Son Ödeme Günleri)
const COMPANY_CREDIT_CARDS = [
  { sira: 1,  id: "cc-6010", bank: "Garanti BBVA",   cardName: "Bonus Trink",      holder: "Ömer Eren", company: "Dizsan Lojistik", fullNumber: "5400 3702 3496 6010", last4: "6010", skt: "05/26", cutOffDay: 1,  dueDay: 7  },
  { sira: 2,  id: "cc-3481", bank: "Akbank",         cardName: "Axess",            holder: "Ömer Eren", company: "Dizsan Lojistik", fullNumber: "4256 6920 3748 3481", last4: "3481", skt: "11/30", cutOffDay: 7,  dueDay: 12 },
  { sira: 3,  id: "cc-6539", bank: "Akbank",         cardName: "Axess",            holder: "Ömer Eren", company: "Dizsan Otomotiv", fullNumber: "4256 6920 1127 6539", last4: "6539", skt: "11/30", cutOffDay: 7,  dueDay: 12 },
  { sira: 4,  id: "cc-9097", bank: "TEB",            cardName: "Bonus",            holder: "Ömer Eren", company: "Şahsi",           fullNumber: "5128 0300 2728 9097", last4: "9097", skt: "10/28", cutOffDay: 7,  dueDay: 17 },
  { sira: 5,  id: "cc-8765", bank: "Halkbank",       cardName: "Paraf",            holder: "Ömer Eren", company: "Şahsi",           fullNumber: "5430 8115 9334 8765", last4: "8765", skt: "04/26", cutOffDay: 15, dueDay: 25 },
  { sira: 6,  id: "cc-7265", bank: "Ziraat Bankası", cardName: "Combo",            holder: "Ömer Eren", company: "Şahsi",           fullNumber: "4446 7808 3127 7265", last4: "7265", skt: "04/28", cutOffDay: 22, dueDay: 3  },
  { sira: 7,  id: "cc-0031", bank: "Garanti BBVA",   cardName: "Bonus Platinum",   holder: "Ömer Eren", company: "Şahsi",           fullNumber: "5407 0959 3006 0031", last4: "0031", skt: "02/27", cutOffDay: 23, dueDay: 2  },
  { sira: 8,  id: "cc-4360", bank: "Garanti BBVA",   cardName: "Corporate",        holder: "Ömer Eren", company: "Dizsan Otomotiv", fullNumber: "9792 2901 0419 4360", last4: "4360", skt: "09/28", cutOffDay: 21, dueDay: 31 },
  { sira: 9,  id: "cc-4352", bank: "Garanti BBVA",   cardName: "Corporate",        holder: "Ömer Eren", company: "Dizsan Lojistik", fullNumber: "9792 2901 0419 4352", last4: "4352", skt: "09/28", cutOffDay: 21, dueDay: 30 },
  { sira: 10, id: "cc-3017", bank: "Garanti BBVA",   cardName: "Bonus Trink",      holder: "Ömer Eren", company: "Dizsan Otomotiv", fullNumber: "5400 3702 3496 3017", last4: "3017", skt: "05/26", cutOffDay: 26, dueDay: 1  },
  { sira: 11, id: "cc-1634", bank: "Vakıfbank",      cardName: "World",            holder: "Ömer Eren", company: "Dizsan Lojistik", fullNumber: "4289 4501 4889 1634", last4: "1634", skt: "11/29", cutOffDay: 28, dueDay: 4  },
  { sira: 12, id: "cc-3232", bank: "Ziraat Bankası", cardName: "Başak",            holder: "Ömer Eren", company: "Dizsan Otomotiv", fullNumber: "4698 8400 1398 3232", last4: "3232", skt: "03/28", cutOffDay: 28, dueDay: 7  },
  { sira: 13, id: "cc-4635", bank: "İş Bankası",     cardName: "Maximum Business", holder: "İsimsiz",   company: "Dizsan Otomotiv", fullNumber: "4508 0311 3416 4635", last4: "4635", skt: "02/28", cutOffDay: 29, dueDay: 7  },
  { sira: 14, id: "cc-6298", bank: "İş Bankası",     cardName: "Maximum Business", holder: "İsimsiz",   company: "Dizsan Lojistik", fullNumber: "4508 0311 3468 6298", last4: "6298", skt: "02/28", cutOffDay: 29, dueDay: 7  },
  { sira: 15, id: "cc-4593", bank: "İş Bankası",     cardName: "Maximum Business", holder: "İsimsiz",   company: "DsMot",           fullNumber: "4508 0311 1444 4593", last4: "4593", skt: "03/28", cutOffDay: 29, dueDay: 7  },
  { sira: 16, id: "cc-8815", bank: "İş Bankası",     cardName: "Maximiles Black",  holder: "Ömer Eren", company: "Şahsi",           fullNumber: "4743 4010 9037 8815", last4: "8815", skt: "07/28", cutOffDay: 3,  dueDay: 7  },
  { sira: 17, id: "cc-3311", bank: "Garanti BBVA",   cardName: "Bonus",            holder: "Ömer Eren", company: "Dizsan Otomotiv", fullNumber: "5400 3702 3496 3311", last4: "3311", skt: "08/28", cutOffDay: 21, dueDay: 1  }
];

// 3. Banka Kredileri Verisi (Dizsan Kredi Takip Sisteminden)
const BASE_LOAN_DATA = {
  "is_bankasi": {
    "bankName": "İş Bankası",
    "title": "İş Bankası Kredisi (#0758487)",
    "installments": [
      {"taksit_no": 1, "vade": "28.10.2024", "taksit_tutari": 357400.09},
      {"taksit_no": 2, "vade": "27.11.2024", "taksit_tutari": 357400.09},
      {"taksit_no": 3, "vade": "27.12.2024", "taksit_tutari": 357400.09},
      {"taksit_no": 4, "vade": "27.01.2025", "taksit_tutari": 357400.09},
      {"taksit_no": 5, "vade": "27.02.2025", "taksit_tutari": 357400.09},
      {"taksit_no": 6, "vade": "27.03.2025", "taksit_tutari": 357400.09},
      {"taksit_no": 7, "vade": "28.04.2025", "taksit_tutari": 357400.09},
      {"taksit_no": 8, "vade": "27.05.2025", "taksit_tutari": 357400.09},
      {"taksit_no": 9, "vade": "27.06.2025", "taksit_tutari": 357400.09},
      {"taksit_no": 10, "vade": "28.07.2025", "taksit_tutari": 357400.09},
      {"taksit_no": 11, "vade": "27.08.2025", "taksit_tutari": 357400.09},
      {"taksit_no": 12, "vade": "29.09.2025", "taksit_tutari": 357400.09},
      {"taksit_no": 13, "vade": "27.10.2025", "taksit_tutari": 357400.09},
      {"taksit_no": 14, "vade": "27.11.2025", "taksit_tutari": 357400.09},
      {"taksit_no": 15, "vade": "29.12.2025", "taksit_tutari": 357400.09},
      {"taksit_no": 16, "vade": "27.01.2026", "taksit_tutari": 357400.09},
      {"taksit_no": 17, "vade": "27.02.2026", "taksit_tutari": 357400.09},
      {"taksit_no": 18, "vade": "27.03.2026", "taksit_tutari": 357400.09},
      {"taksit_no": 19, "vade": "27.04.2026", "taksit_tutari": 357400.09},
      {"taksit_no": 20, "vade": "01.06.2026", "taksit_tutari": 357400.09},
      {"taksit_no": 21, "vade": "29.06.2026", "taksit_tutari": 357400.09},
      {"taksit_no": 22, "vade": "27.07.2026", "taksit_tutari": 357400.09},
      {"taksit_no": 23, "vade": "27.08.2026", "taksit_tutari": 357400.09},
      {"taksit_no": 24, "vade": "28.09.2026", "taksit_tutari": 357400.09},
      {"taksit_no": 25, "vade": "27.10.2026", "taksit_tutari": 357400.09},
      {"taksit_no": 26, "vade": "27.11.2026", "taksit_tutari": 357400.09},
      {"taksit_no": 27, "vade": "28.12.2026", "taksit_tutari": 357400.09},
      {"taksit_no": 28, "vade": "27.01.2027", "taksit_tutari": 357400.09},
      {"taksit_no": 29, "vade": "01.03.2027", "taksit_tutari": 357400.09},
      {"taksit_no": 30, "vade": "29.03.2027", "taksit_tutari": 357400.09},
      {"taksit_no": 31, "vade": "27.04.2027", "taksit_tutari": 357400.09},
      {"taksit_no": 32, "vade": "27.05.2027", "taksit_tutari": 357400.09},
      {"taksit_no": 33, "vade": "28.06.2027", "taksit_tutari": 357400.09},
      {"taksit_no": 34, "vade": "27.07.2027", "taksit_tutari": 357400.09},
      {"taksit_no": 35, "vade": "27.08.2027", "taksit_tutari": 357400.09},
      {"taksit_no": 36, "vade": "27.09.2027", "taksit_tutari": 357400.15}
    ]
  },
  "ziraat_bankasi": {
    "bankName": "Ziraat Bankası",
    "title": "Ziraat Bankası Kredisi",
    "installments": [
      {"taksit_no": 1, "vade": "15.01.2026", "taksit_tutari": 87281.25},
      {"taksit_no": 2, "vade": "16.02.2026", "taksit_tutari": 87281.25},
      {"taksit_no": 3, "vade": "16.03.2026", "taksit_tutari": 87281.25},
      {"taksit_no": 4, "vade": "15.04.2026", "taksit_tutari": 87281.25},
      {"taksit_no": 5, "vade": "15.05.2026", "taksit_tutari": 87281.25},
      {"taksit_no": 6, "vade": "15.06.2026", "taksit_tutari": 133281.03},
      {"taksit_no": 7, "vade": "16.07.2026", "taksit_tutari": 133281.03},
      {"taksit_no": 8, "vade": "17.08.2026", "taksit_tutari": 133281.03},
      {"taksit_no": 9, "vade": "15.09.2026", "taksit_tutari": 133281.03},
      {"taksit_no": 10, "vade": "15.10.2026", "taksit_tutari": 133281.03},
      {"taksit_no": 11, "vade": "16.11.2026", "taksit_tutari": 133281.03},
      {"taksit_no": 12, "vade": "15.12.2026", "taksit_tutari": 133281.03},
      {"taksit_no": 13, "vade": "15.01.2027", "taksit_tutari": 133281.03},
      {"taksit_no": 14, "vade": "15.02.2027", "taksit_tutari": 133281.03},
      {"taksit_no": 15, "vade": "15.03.2027", "taksit_tutari": 133281.03},
      {"taksit_no": 16, "vade": "15.04.2027", "taksit_tutari": 133281.03},
      {"taksit_no": 17, "vade": "20.05.2027", "taksit_tutari": 133281.03},
      {"taksit_no": 18, "vade": "15.06.2027", "taksit_tutari": 133281.03},
      {"taksit_no": 19, "vade": "16.07.2027", "taksit_tutari": 133281.03},
      {"taksit_no": 20, "vade": "16.08.2027", "taksit_tutari": 133281.03},
      {"taksit_no": 21, "vade": "15.09.2027", "taksit_tutari": 133281.03},
      {"taksit_no": 22, "vade": "15.10.2027", "taksit_tutari": 133281.03},
      {"taksit_no": 23, "vade": "15.11.2027", "taksit_tutari": 133281.03},
      {"taksit_no": 24, "vade": "15.12.2027", "taksit_tutari": 133281.03},
      {"taksit_no": 25, "vade": "17.01.2028", "taksit_tutari": 133281.03},
      {"taksit_no": 26, "vade": "15.02.2028", "taksit_tutari": 133281.03},
      {"taksit_no": 27, "vade": "15.03.2028", "taksit_tutari": 133281.03},
      {"taksit_no": 28, "vade": "17.04.2028", "taksit_tutari": 133281.03},
      {"taksit_no": 29, "vade": "15.05.2028", "taksit_tutari": 133281.03},
      {"taksit_no": 30, "vade": "15.06.2028", "taksit_tutari": 133281.03},
      {"taksit_no": 31, "vade": "17.07.2028", "taksit_tutari": 133281.03},
      {"taksit_no": 32, "vade": "15.08.2028", "taksit_tutari": 133281.03},
      {"taksit_no": 33, "vade": "15.09.2028", "taksit_tutari": 133281.03},
      {"taksit_no": 34, "vade": "16.10.2028", "taksit_tutari": 133281.03},
      {"taksit_no": 35, "vade": "15.11.2028", "taksit_tutari": 133281.03},
      {"taksit_no": 36, "vade": "15.12.2028", "taksit_tutari": 133280.90}
    ]
  },
  "ziraat_otomotiv_2": {
    "bankName": "Ziraat Bankası (Otomotiv -2-)",
    "title": "Ziraat Otomotiv Kredisi -2-",
    "installments": [
      {"taksit_no": 1, "vade": "20.05.2026", "taksit_tutari": 106151.12},
      {"taksit_no": 2, "vade": "22.06.2026", "taksit_tutari": 106151.12},
      {"taksit_no": 3, "vade": "20.07.2026", "taksit_tutari": 106151.12},
      {"taksit_no": 4, "vade": "20.08.2026", "taksit_tutari": 106151.12},
      {"taksit_no": 5, "vade": "21.09.2026", "taksit_tutari": 106151.12},
      {"taksit_no": 6, "vade": "20.10.2026", "taksit_tutari": 106151.12},
      {"taksit_no": 7, "vade": "20.11.2026", "taksit_tutari": 106151.12},
      {"taksit_no": 8, "vade": "21.12.2026", "taksit_tutari": 106151.12},
      {"taksit_no": 9, "vade": "20.01.2027", "taksit_tutari": 106151.12},
      {"taksit_no": 10, "vade": "22.02.2027", "taksit_tutari": 106151.12},
      {"taksit_no": 11, "vade": "22.03.2027", "taksit_tutari": 106151.12},
      {"taksit_no": 12, "vade": "20.04.2027", "taksit_tutari": 106151.12},
      {"taksit_no": 13, "vade": "20.05.2027", "taksit_tutari": 106151.12},
      {"taksit_no": 14, "vade": "21.06.2027", "taksit_tutari": 106151.12},
      {"taksit_no": 15, "vade": "20.07.2027", "taksit_tutari": 106151.12},
      {"taksit_no": 16, "vade": "20.08.2027", "taksit_tutari": 106151.12},
      {"taksit_no": 17, "vade": "20.09.2027", "taksit_tutari": 106151.12},
      {"taksit_no": 18, "vade": "20.10.2027", "taksit_tutari": 106151.12},
      {"taksit_no": 19, "vade": "22.11.2027", "taksit_tutari": 106151.12},
      {"taksit_no": 20, "vade": "20.12.2027", "taksit_tutari": 106151.12},
      {"taksit_no": 21, "vade": "20.01.2028", "taksit_tutari": 106151.12},
      {"taksit_no": 22, "vade": "21.02.2028", "taksit_tutari": 106151.12},
      {"taksit_no": 23, "vade": "20.03.2028", "taksit_tutari": 106151.12},
      {"taksit_no": 24, "vade": "20.04.2028", "taksit_tutari": 106151.03}
    ]
  },
  "vakifbank_otomotiv": {
    "bankName": "Vakıfbank (Otomotiv)",
    "title": "Vakıfbank Otomotiv Kredisi (#6501650232)",
    "installments": [
      {"taksit_no": 1, "vade": "21.09.2026", "taksit_tutari": 398066.70},
      {"taksit_no": 2, "vade": "21.10.2026", "taksit_tutari": 398066.70},
      {"taksit_no": 3, "vade": "21.11.2026", "taksit_tutari": 398066.70},
      {"taksit_no": 4, "vade": "21.12.2026", "taksit_tutari": 398066.70},
      {"taksit_no": 5, "vade": "21.01.2027", "taksit_tutari": 398066.70},
      {"taksit_no": 6, "vade": "21.02.2027", "taksit_tutari": 398066.70},
      {"taksit_no": 7, "vade": "21.03.2027", "taksit_tutari": 398066.70},
      {"taksit_no": 8, "vade": "21.04.2027", "taksit_tutari": 398066.70},
      {"taksit_no": 9, "vade": "21.05.2027", "taksit_tutari": 398066.70},
      {"taksit_no": 10, "vade": "21.06.2027", "taksit_tutari": 398066.70},
      {"taksit_no": 11, "vade": "21.07.2027", "taksit_tutari": 398066.70},
      {"taksit_no": 12, "vade": "21.08.2027", "taksit_tutari": 398066.70},
      {"taksit_no": 13, "vade": "21.09.2027", "taksit_tutari": 398066.70},
      {"taksit_no": 14, "vade": "21.10.2027", "taksit_tutari": 398066.70},
      {"taksit_no": 15, "vade": "21.11.2027", "taksit_tutari": 398066.70},
      {"taksit_no": 16, "vade": "21.12.2027", "taksit_tutari": 398066.70},
      {"taksit_no": 17, "vade": "21.01.2028", "taksit_tutari": 398066.70},
      {"taksit_no": 18, "vade": "21.02.2028", "taksit_tutari": 398066.70},
      {"taksit_no": 19, "vade": "21.03.2028", "taksit_tutari": 398066.70},
      {"taksit_no": 20, "vade": "21.04.2028", "taksit_tutari": 398066.70},
      {"taksit_no": 21, "vade": "21.05.2028", "taksit_tutari": 398066.70},
      {"taksit_no": 22, "vade": "21.06.2028", "taksit_tutari": 398066.70},
      {"taksit_no": 23, "vade": "21.07.2028", "taksit_tutari": 398066.70},
      {"taksit_no": 24, "vade": "21.08.2028", "taksit_tutari": 398066.31}
    ]
  }
};

// 4. Yardımcı Biçimlendirme Fonksiyonları
function formatDateToTR(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }
  return dateStr;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(amount) || 0);
}

function formatDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getEffectivePaidAmount(payment) {
  const total = Number(payment.amount) || 0;
  if (payment.status === 'paid') return total;
  if (payment.status === 'partial') {
    const pAmt = Number(payment.paidAmount) || 0;
    return Math.min(Math.max(pAmt, 0), total);
  }
  return 0;
}

function getEffectiveRemainingAmount(payment) {
  const total = Number(payment.amount) || 0;
  return Math.max(total - getEffectivePaidAmount(payment), 0);
}

function getCardMonthlyStateMap() {
  try {
    return JSON.parse(localStorage.getItem(CARD_MONTHLY_STATE_KEY) || '{}') || {};
  } catch (e) {
    return {};
  }
}

function saveCardMonthlyStateMap(mapObj) {
  localStorage.setItem(CARD_MONTHLY_STATE_KEY, JSON.stringify(mapObj));
}

// 5. Kredi Kartları Ödemelerini Seçili Ay İçin Oluştur (Tutar Yazmasa Bile Son 4 Hane, Kart Sahibi ve Banka Bilgileriyle Gelir)
function getCardPaymentsForMonth(year, month) {
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const mStr = String(month + 1).padStart(2, '0');
  const cardStateMap = getCardMonthlyStateMap();

  return COMPANY_CREDIT_CARDS.map(card => {
    const effectiveDueDay = Math.min(card.dueDay, totalDaysInMonth);
    const effectiveCutOffDay = Math.min(card.cutOffDay, totalDaysInMonth);
    const dStr = String(effectiveDueDay).padStart(2, '0');
    const dateStr = `${year}-${mStr}-${dStr}`;
    const paymentId = `card-pay-${card.last4}-${year}-${mStr}`;

    const saved = cardStateMap[paymentId] || {};
    const amount = saved.amount !== undefined ? Number(saved.amount) : 0;
    const status = saved.status || 'unpaid';
    const paidAmount = status === 'paid' ? amount : (status === 'partial' ? (Number(saved.paidAmount) || 0) : 0);

    return {
      id: paymentId,
      type: 'card',
      category: 'kredi-karti',
      sira: card.sira,
      bank: card.bank,
      cardName: card.cardName,
      last4: card.last4,
      fullNumber: card.fullNumber,
      holder: card.holder,
      company: card.company,
      cutOffDay: card.cutOffDay,
      dueDay: card.dueDay,
      effectiveCutOffDay,
      effectiveDueDay,
      title: `${card.bank} ${card.cardName} (*${card.last4})`,
      subtitle: `${card.holder} • ${card.company}`,
      amount,
      paidAmount,
      date: dateStr,
      status,
      notes: saved.notes || `Hesap Kesim: Her Ayın ${card.cutOffDay}'i • Son Ödeme: Her Ayın ${card.dueDay}'i`
    };
  });
}

// 6. Banka Kredisi Taksitlerini Seçili Ay İçin Oluştur (Banka Adı + Ödeme Tutarı)
function getLoanPaymentsForMonth(year, month) {
  let userState = {};
  let customLoans = {};
  try { userState = JSON.parse(localStorage.getItem('dizsan_kredi_takip_verileri') || '{}'); } catch (e) {}
  try { customLoans = JSON.parse(localStorage.getItem('dizsan_eklenen_krediler') || '{}'); } catch (e) {}

  if (!localStorage.getItem('dizsan_kredi_takip_verileri')) {
    const cutoff = new Date('2026-05-29');
    userState = { is_bankasi: {}, ziraat_bankasi: {}, ziraat_otomotiv_2: {}, vakifbank_otomotiv: {} };
    ['is_bankasi', 'ziraat_bankasi', 'ziraat_otomotiv_2'].forEach(k => {
      BASE_LOAN_DATA[k].installments.forEach(inst => {
        const [d, m, y] = inst.vade.split('.');
        if (new Date(`${y}-${m}-${d}`) < cutoff) {
          userState[k][inst.taksit_no] = { is_paid: true };
        }
      });
    });
  }

  const allLoans = { ...BASE_LOAN_DATA, ...customLoans };
  const loanPayments = [];

  for (const [key, loan] of Object.entries(allLoans)) {
    const bankName = loan.bankName || loan.name || loan.title || (loan.details && loan.details.title) || key;
    const loanTitle = loan.title || loan.name || bankName;
    const totalCount = (loan.installments || []).length;

    (loan.installments || []).forEach(inst => {
      const parts = (inst.vade || '').split('.');
      if (parts.length !== 3) return;
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[2], 10);
      if (y !== year || m !== month) return;

      const dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      const savedStatus = userState[key] && userState[key][inst.taksit_no];
      const isPaid = savedStatus ? savedStatus.is_paid : Boolean(inst.is_paid);

      let amount = inst.taksit_tutari;
      if (amount === undefined && inst.parsed_data) amount = inst.parsed_data.taksit_tutari;
      if (amount === undefined && Array.isArray(inst.values)) amount = inst.values[4] || inst.values[0];
      amount = Number(amount) || 0;

      const status = isPaid ? 'paid' : (savedStatus && savedStatus.notes && savedStatus.notes.toLowerCase().includes('kısmi') ? 'partial' : 'unpaid');
      const paidAmount = isPaid ? amount : (savedStatus && savedStatus.paidAmount ? Number(savedStatus.paidAmount) : 0);

      loanPayments.push({
        id: `loan-pay-${key}-${inst.taksit_no}`,
        type: 'loan',
        category: 'kredi',
        loanKey: key,
        taksitNo: inst.taksit_no,
        totalCount,
        bankName,
        title: `${bankName}`,
        subtitle: `${loanTitle} (${inst.taksit_no}/${totalCount}. Taksit)`,
        amount,
        paidAmount,
        date: dateStr,
        status,
        notes: savedStatus && savedStatus.notes ? savedStatus.notes : `${loanTitle} - Taksit #${inst.taksit_no}/${totalCount}`
      });
    });
  }
  return loanPayments;
}

async function syncLoanStateFromPortal() {
  try {
    const res = await fetch('/api/kredi-state', { cache: 'no-store' });
    if (!res.ok) return;
    const shared = await res.json();
    if (shared && shared.userState && Object.keys(shared.userState).length > 0) {
      localStorage.setItem('dizsan_kredi_takip_verileri', JSON.stringify(shared.userState));
      if (shared.customLoans) {
        localStorage.setItem('dizsan_eklenen_krediler', JSON.stringify(shared.customLoans));
      }
      renderAllViews();
    }
  } catch (e) {}
}

function pushLoanStateToPortal(userState, customLoans) {
  fetch('/api/kredi-state', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userState: userState || {},
      customLoans: customLoans || {},
      lastUpdated: new Date().toISOString()
    })
  }).catch(() => {});
}

// 7. Seçili Ayın Tüm Ödemelerini (Sadece Kredi Kartları + Banka Kredileri) Getir ve Filtrele
function getAllMonthPayments(year, month) {
  const cards = getCardPaymentsForMonth(year, month);
  const loans = getLoanPaymentsForMonth(year, month);
  return [...cards, ...loans];
}

function getFilteredMonthPayments() {
  const year = state.currentDate.getFullYear();
  const month = state.currentDate.getMonth();
  const allMonthItems = getAllMonthPayments(year, month);

  return allMonthItems.filter(p => {
    const catMatch = state.filters.category === 'all' || p.category === state.filters.category;
    const statMatch = state.filters.status === 'all' || p.status === state.filters.status;
    return catMatch && statMatch;
  });
}

// 8. KPI ve Sol Menü Sayaçlarını Güncelle
function updateKPIsAndCounts() {
  const year = state.currentDate.getFullYear();
  const month = state.currentDate.getMonth();
  const allMonthItems = getAllMonthPayments(year, month);
  const filteredItems = getFilteredMonthPayments();

  let total = 0;
  let paid = 0;
  let unpaid = 0;

  filteredItems.forEach(p => {
    const amt = Number(p.amount) || 0;
    const effPaid = getEffectivePaidAmount(p);
    const effRem = getEffectiveRemainingAmount(p);
    total += amt;
    paid += effPaid;
    unpaid += effRem;
  });

  document.getElementById('kpi-total').textContent = formatCurrency(total);
  document.getElementById('kpi-paid').textContent = formatCurrency(paid);
  document.getElementById('kpi-unpaid').textContent = formatCurrency(unpaid);

  const countCards = allMonthItems.filter(p => p.category === 'kredi-karti').length;
  const countLoans = allMonthItems.filter(p => p.category === 'kredi').length;

  const elAll = document.getElementById('count-all');
  const elCards = document.getElementById('count-kredi-karti');
  const elLoans = document.getElementById('count-kredi');
  if (elAll) elAll.textContent = countCards + countLoans;
  if (elCards) elCards.textContent = countCards;
  if (elLoans) elLoans.textContent = countLoans;
}

function populateHeaderSelectors() {
  const monthSelect = document.getElementById('month-select');
  const yearSelect = document.getElementById('year-select');

  if (monthSelect && monthSelect.options.length === 0) {
    MONTH_NAMES.forEach((m, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = m;
      monthSelect.appendChild(opt);
    });
  }

  if (yearSelect && yearSelect.options.length === 0) {
    for (let y = 2024; y <= 2030; y++) {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      yearSelect.appendChild(opt);
    }
  }
}

// 9. Tüm Görünümleri Render Et
function renderAllViews() {
  const year = state.currentDate.getFullYear();
  const month = state.currentDate.getMonth();

  populateHeaderSelectors();
  document.getElementById('month-select').value = month;
  document.getElementById('year-select').value = year;

  const monthYearStr = `${MONTH_NAMES[month]} ${year}`;
  document.getElementById('print-title').textContent = `${monthYearStr.toUpperCase()} ÖDEME TAKVİMİ (KREDİ KARTLARI & BANKA KREDİLERİ)`;

  const activePayments = getFilteredMonthPayments();
  updateKPIsAndCounts();

  renderCalendarGrid(year, month, activePayments);
  renderCardsView(year, month);
  renderLoansView(year, month);
  renderListView(activePayments);
  renderMobileSimulator(year, month, activePayments);
}

// GÖRÜNÜM 1: Aylık Takvim Grid Render
function renderCalendarGrid(year, month, activePayments) {
  const gridContainer = document.getElementById('calendar-days-grid');
  if (!gridContainer) return;
  gridContainer.innerHTML = '';

  let firstDayIndex = new Date(year, month, 1).getDay();
  firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = prevMonthTotalDays - i;
    const prevMonthDate = new Date(year, month - 1, dayNum);
    createDayCell(gridContainer, dayNum, prevMonthDate, true);
  }

  const today = new Date();
  for (let d = 1; d <= totalDays; d++) {
    const currentCellDate = new Date(year, month, d);
    const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    createDayCell(gridContainer, d, currentCellDate, false, isToday, activePayments);
  }

  const totalCellsWritten = firstDayIndex + totalDays;
  const remainingCells = totalCellsWritten % 7 === 0 ? 0 : 7 - (totalCellsWritten % 7);
  for (let i = 1; i <= remainingCells; i++) {
    const nextMonthDate = new Date(year, month + 1, i);
    createDayCell(gridContainer, i, nextMonthDate, true);
  }
}

function createDayCell(container, dayNum, dateObj, isOtherMonth = false, isToday = false, activePayments = []) {
  const cell = document.createElement('div');
  cell.className = 'calendar-day';
  if (isOtherMonth) cell.classList.add('other-month');
  if (isToday) cell.classList.add('today');

  const numEl = document.createElement('span');
  numEl.className = 'day-num';
  numEl.textContent = dayNum;
  cell.appendChild(numEl);

  const eventsContainer = document.createElement('div');
  eventsContainer.className = 'day-events';

  const dateStr = formatDateString(dateObj);
  const dayPayments = activePayments.filter(p => p.date === dateStr);

  dayPayments.forEach(payment => {
    const item = document.createElement('div');
    item.className = `payment-event cat-${payment.category} ${payment.status}`;

    if (payment.type === 'card') {
      // KREDİ KARTI: Tutar yazmasa bile Banka, Son 4 Hane ve Kart Sahibi / Şirket gözüksün
      const titleEl = document.createElement('div');
      titleEl.className = 'title';
      titleEl.textContent = `💳 ${payment.bank} ${payment.cardName} (*${payment.last4})`;

      const subEl = document.createElement('div');
      subEl.className = 'sub-meta';
      subEl.textContent = `👤 ${payment.holder} • ${payment.company}`;

      item.appendChild(titleEl);
      item.appendChild(subEl);

      if (payment.amount > 0) {
        const amountEl = document.createElement('div');
        amountEl.className = 'amount';
        const effRem = getEffectiveRemainingAmount(payment);
        const effPaid = getEffectivePaidAmount(payment);
        if (payment.status === 'partial' && effPaid > 0) {
          amountEl.innerHTML = `<span style="font-weight:700; color:#fbbf24;">Kalan: ${formatCurrency(effRem)}</span>`;
        } else {
          amountEl.innerHTML = `<span style="font-weight:700;">${formatCurrency(payment.amount)}</span>`;
        }
        item.appendChild(amountEl);
      }

      item.title = `${payment.bank} - ${payment.cardName}\nSon 4 Hane: *${payment.last4}\nKart Sahibi: ${payment.holder} (${payment.company})\nHesap Kesim: Ayın ${payment.cutOffDay}'i | Son Ödeme: Ayın ${payment.dueDay}'i${payment.amount > 0 ? `\nEkstre Tutarı: ${formatCurrency(payment.amount)}` : ''}`;
    } else {
      // BANKA KREDİSİ: Banka Adı ve Ödeme Tutarı yazsın
      const titleEl = document.createElement('div');
      titleEl.className = 'title';
      titleEl.textContent = `🏦 ${payment.bankName}`;

      const amountEl = document.createElement('div');
      amountEl.className = 'amount';
      amountEl.innerHTML = `<span style="font-weight:800; font-size:0.74rem;">${formatCurrency(payment.amount)}</span>`;

      item.appendChild(titleEl);
      item.appendChild(amountEl);

      item.title = `${payment.bankName}\n${payment.subtitle}\nÖdeme Tutarı: ${formatCurrency(payment.amount)}\nDurum: ${payment.status === 'paid' ? 'Ödendi' : 'Bekliyor'}`;
    }

    item.addEventListener('click', (e) => {
      e.stopPropagation();
      openEditModal(payment.id);
    });

    eventsContainer.appendChild(item);
  });

  cell.appendChild(eventsContainer);
  container.appendChild(cell);
}

// GÖRÜNÜM 2: Kredi Kartları Listesi (16 Kart) Render
function renderCardsView(year, month) {
  const tbody = document.getElementById('cards-view-tbody');
  if (!tbody) return;

  const cards = getCardPaymentsForMonth(year, month);
  const q = (state.cardSearchQuery || '').toLowerCase();

  const filtered = cards
    .filter(c => {
      if (state.filters.status !== 'all' && c.status !== state.filters.status) return false;
      if (!q) return true;
      return (
        c.bank.toLowerCase().includes(q) ||
        c.cardName.toLowerCase().includes(q) ||
        c.last4.includes(q) ||
        c.holder.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => a.effectiveDueDay - b.effectiveDueDay);

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:2rem; color:var(--text-muted);">Aranan kriterlere uygun kredi kartı bulunamadı.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(c => {
    const statusLabel = c.status === 'paid' ? '✅ Ödendi' : (c.status === 'partial' ? '⏳ Kısmi Ödendi' : '🕒 Son Ödeme Bekliyor');
    const isPersonal = c.company === 'Şahsi';
    return `
      <tr onclick="openEditModal('${c.id}')" style="cursor:pointer;">
        <td style="font-weight:800; color:#60a5fa; white-space:nowrap;">Her Ayın ${c.dueDay}. Günü <div style="font-size:0.72rem; color:var(--text-secondary); font-weight:500;">(${formatDateToTR(c.date)})</div></td>
        <td style="color:var(--text-secondary);">Her Ayın ${c.cutOffDay}. Günü</td>
        <td>
          <div style="font-weight:700;">💳 ${c.bank}</div>
          <div style="font-size:0.78rem; color:var(--text-secondary);">${c.cardName}</div>
        </td>
        <td><span class="cat-badge" style="font-family:monospace; font-size:0.85rem; color:#38bdf8; border-color:rgba(56,189,248,0.35);">*${c.last4}</span></td>
        <td style="font-weight:600;">👤 ${c.holder}</td>
        <td>
          <span class="cat-badge" style="background:${isPersonal ? 'rgba(168,85,247,0.15)' : 'rgba(59,130,246,0.15)'}; color:${isPersonal ? '#c084fc' : '#60a5fa'};">
            ${c.company}
          </span>
        </td>
        <td style="font-weight:700;">${c.amount > 0 ? formatCurrency(c.amount) : '<span style="color:var(--text-muted); font-weight:500;">Tutar Girilmedi</span>'}</td>
        <td><span class="status-pill ${c.status}">${statusLabel}</span></td>
        <td>
          <button type="button" class="btn btn-glass" style="padding:0.35rem 0.65rem; font-size:0.78rem;" onclick="event.stopPropagation(); openEditModal('${c.id}')">
            <i class="fa-solid fa-pen-to-square"></i> Tutar / Durum
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// GÖRÜNÜM 3: Banka Kredileri Listesi Render
function renderLoansView(year, month) {
  const tbody = document.getElementById('loans-view-tbody');
  if (!tbody) return;

  const loans = getLoanPaymentsForMonth(year, month)
    .filter(l => state.filters.status === 'all' || l.status === state.filters.status)
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  if (loans.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:2rem; color:var(--text-muted);">Bu ay için vadesi gelen banka kredi taksiti bulunamadı.</td></tr>`;
    return;
  }

  tbody.innerHTML = loans.map(l => {
    const effPaid = getEffectivePaidAmount(l);
    const effRem = getEffectiveRemainingAmount(l);
    const statusLabel = l.status === 'paid' ? '✅ Ödendi' : (l.status === 'partial' ? '⏳ Kısmi Ödeme' : '⚠️ Ödenmedi');
    return `
      <tr onclick="openEditModal('${l.id}')" style="cursor:pointer;">
        <td style="font-weight:800; color:#fbbf24; white-space:nowrap;">${formatDateToTR(l.date)}</td>
        <td style="font-weight:800; font-size:0.92rem;">🏦 ${l.bankName}</td>
        <td style="color:var(--text-secondary);">${l.subtitle}</td>
        <td style="font-weight:800; font-size:0.95rem;">${formatCurrency(l.amount)}</td>
        <td style="color:#34d399; font-weight:600;">${formatCurrency(effPaid)}</td>
        <td style="color:${effRem > 0 ? '#fbbf24' : '#94a3b8'}; font-weight:700;">${formatCurrency(effRem)}</td>
        <td><span class="status-pill ${l.status}">${statusLabel}</span></td>
        <td>
          <button type="button" class="btn btn-glass" style="padding:0.35rem 0.65rem; font-size:0.78rem;" onclick="event.stopPropagation(); openEditModal('${l.id}')">
            <i class="fa-solid fa-pen"></i> Durum
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// GÖRÜNÜM 4: Aylık Tüm Ödemeler (Kart + Kredi) Kronolojik Liste Render
function renderListView(activePayments) {
  const tbody = document.getElementById('list-view-tbody');
  if (!tbody) return;

  const q = (state.listSearchQuery || '').toLowerCase();
  const sorted = [...activePayments]
    .filter(p => {
      if (!q) return true;
      const hay = `${p.title} ${p.subtitle || ''} ${p.last4 || ''} ${p.holder || ''} ${p.company || ''} ${p.bankName || ''}`.toLowerCase();
      return hay.includes(q);
    })
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  if (sorted.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-muted);">Bu ay için seçili filtreye uygun kayıt bulunamadı.</td></tr>`;
    return;
  }

  tbody.innerHTML = sorted.map(p => {
    const isCard = p.type === 'card';
    const statusLabel = p.status === 'paid' ? '✅ Ödendi' : (p.status === 'partial' ? '⏳ Kısmi Ödeme' : '🕒 Bekliyor');
    const detailHtml = isCard
      ? `<div style="font-weight:700;">💳 ${p.bank} ${p.cardName} <span style="color:#38bdf8; font-family:monospace;">(*${p.last4})</span></div>
         <div style="font-size:0.74rem; color:var(--text-secondary);">Hesap Kesim: Ayın ${p.cutOffDay}'i • Son Ödeme: Ayın ${p.dueDay}'i</div>`
      : `<div style="font-weight:800; color:#fbbf24;">🏦 ${p.bankName}</div>
         <div style="font-size:0.74rem; color:var(--text-secondary);">${p.subtitle}</div>`;

    const holderHtml = isCard
      ? `<strong>👤 ${p.holder}</strong> <span class="cat-badge" style="margin-left:4px;">${p.company}</span>`
      : `<span class="cat-badge">Ticari Banka Kredisi</span>`;

    const amountHtml = isCard && p.amount === 0
      ? `<span style="color:var(--text-muted); font-size:0.8rem;">Tutar Girilmedi</span>`
      : `<span style="font-weight:800;">${formatCurrency(p.amount)}</span>`;

    return `
      <tr onclick="openEditModal('${p.id}')" style="cursor:pointer;">
        <td style="font-weight:700; white-space:nowrap;">${formatDateToTR(p.date)}</td>
        <td>
          <span class="cat-badge" style="color:${isCard ? '#60a5fa' : '#fbbf24'};">
            ${isCard ? '💳 Kredi Kartı' : '🏦 Banka Kredisi'}
          </span>
        </td>
        <td>${detailHtml}</td>
        <td>${holderHtml}</td>
        <td>${amountHtml}</td>
        <td><span class="status-pill ${p.status}">${statusLabel}</span></td>
        <td>
          <button type="button" class="btn btn-glass" style="padding:0.35rem 0.65rem; font-size:0.78rem;" onclick="event.stopPropagation(); openEditModal('${p.id}')">
            <i class="fa-solid fa-pen-to-square"></i> Düzenle
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// GÖRÜNÜM 5: Mobil Simülatör Render
function renderMobileSimulator(year, month, activePayments) {
  const listEl = document.getElementById('mobile-sim-list');
  const titleEl = document.getElementById('mobile-sim-month-title');
  const badgeEl = document.getElementById('mobile-sim-total-badge');
  if (!listEl) return;

  if (titleEl) titleEl.textContent = `${MONTH_NAMES[month]} ${year} Takvimi`;

  const sorted = [...activePayments].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  const totalRem = sorted.reduce((acc, p) => acc + getEffectiveRemainingAmount(p), 0);
  if (badgeEl) badgeEl.textContent = formatCurrency(totalRem);

  listEl.innerHTML = sorted.map(p => {
    const isCard = p.type === 'card';
    return `
      <div class="mob-sim-item ${isCard ? 'card' : 'loan'}" onclick="openEditModal('${p.id}')">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
          <span style="font-size:0.7rem; font-weight:700; color:${isCard ? '#60a5fa' : '#fbbf24'};">
            📅 ${formatDateToTR(p.date)} • ${isCard ? 'Kredi Kartı' : 'Banka Kredisi'}
          </span>
          <span class="status-pill ${p.status}" style="font-size:0.64rem; padding:0.1rem 0.45rem;">
            ${p.status === 'paid' ? 'Ödendi ✓' : (p.status === 'partial' ? 'Kısmi' : 'Bekliyor')}
          </span>
        </div>
        ${isCard ? `
          <div style="font-weight:800; font-size:0.84rem;">💳 ${p.bank} ${p.cardName} <span style="color:#38bdf8;">(*${p.last4})</span></div>
          <div style="font-size:0.74rem; color:#cbd5e1; margin-top:2px;">👤 ${p.holder} • ${p.company}</div>
          ${p.amount > 0 ? `<div style="font-weight:700; font-size:0.8rem; color:#34d399; margin-top:3px;">${formatCurrency(p.amount)}</div>` : ''}
        ` : `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:2px;">
            <div style="font-weight:800; font-size:0.86rem;">🏦 ${p.bankName}</div>
            <div style="font-weight:800; font-size:0.86rem; color:#fbbf24;">${formatCurrency(p.amount)}</div>
          </div>
          <div style="font-size:0.7rem; color:#94a3b8;">${p.subtitle}</div>
        `}
      </div>
    `;
  }).join('');
}

// 10. Görünüm (Alt Başlık) Değiştirme Fonksiyonu (D-Pro Üst Bar ve Mobil Alt Bar Uyumlu)
function switchView(viewName) {
  if (!['calendar', 'cards', 'loans', 'list', 'mobile'].includes(viewName)) {
    viewName = 'calendar';
  }
  state.activeView = viewName;

  document.querySelectorAll('#submodule-tabs .filter-item').forEach(item => {
    item.classList.toggle('active', item.dataset.view === viewName);
  });

  document.querySelectorAll('#mobile-bottom-nav .mob-nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });

  const views = {
    calendar: document.getElementById('view-calendar'),
    cards: document.getElementById('view-cards'),
    loans: document.getElementById('view-loans'),
    list: document.getElementById('view-list'),
    mobile: document.getElementById('view-mobile')
  };

  Object.entries(views).forEach(([k, el]) => {
    if (!el) return;
    if (k === viewName) {
      el.style.display = 'flex';
      el.classList.add('active');
    } else {
      el.style.display = 'none';
      el.classList.remove('active');
    }
  });

  renderAllViews();
}
window.switchTab = switchView;

// 11. Modal İşlemleri (Kredi Kartı Ekstre Tutarı / Ödeme Durumu ve Banka Kredisi Durumu)
const modal = document.getElementById('payment-modal');
const paymentForm = document.getElementById('payment-form');

function updatePartialPaymentRowVisibility() {
  const statusRadios = document.getElementsByName('payment-status');
  let selected = 'unpaid';
  statusRadios.forEach(r => { if (r.checked) selected = r.value; });

  const row = document.getElementById('partial-payment-row');
  if (row) {
    row.style.display = selected === 'partial' ? 'grid' : 'none';
  }
  updateRemainingPreview();
}

function updateRemainingPreview() {
  const total = parseFloat(document.getElementById('payment-amount').value) || 0;
  const paid = parseFloat(document.getElementById('payment-paid-amount').value) || 0;
  const rem = Math.max(total - paid, 0);
  const preview = document.getElementById('payment-remaining-preview');
  if (preview) {
    preview.textContent = formatCurrency(rem);
  }
}

function openEditModal(paymentId) {
  const year = state.currentDate.getFullYear();
  const month = state.currentDate.getMonth();
  const allItems = getAllMonthPayments(year, month);
  const payment = allItems.find(p => p.id === paymentId);
  if (!payment) return;

  const isCard = payment.type === 'card';
  const metaBox = document.getElementById('card-meta-info-box');

  if (isCard) {
    document.getElementById('modal-title-text').textContent = 'Kredi Kartı Ödeme & Tutar Detayı';
    document.getElementById('payment-amount').disabled = false;
    if (metaBox) {
      metaBox.style.display = 'block';
      metaBox.innerHTML = `
        <div><strong>🏦 Banka & Kart:</strong> ${payment.bank} - ${payment.cardName}</div>
        <div><strong>🔢 Son 4 Hane:</strong> *${payment.last4} <span style="opacity:0.75;">(${payment.fullNumber})</span></div>
        <div><strong>👤 Kart Sahibi:</strong> ${payment.holder} (${payment.company})</div>
        <div><strong>📅 Kesim & Son Ödeme:</strong> Hesap Kesim: Ayın ${payment.cutOffDay}'i • Son Ödeme: Ayın ${payment.dueDay}'i</div>
      `;
    }
  } else {
    document.getElementById('modal-title-text').textContent = 'Banka Kredisi Taksit Durumu';
    document.getElementById('payment-amount').disabled = true;
    if (metaBox) {
      metaBox.style.display = 'block';
      metaBox.innerHTML = `
        <div><strong>🏦 Banka Adı:</strong> ${payment.bankName}</div>
        <div><strong>📑 Kredi Bilgisi:</strong> ${payment.subtitle}</div>
        <div><strong>💰 Taksit Tutarı:</strong> ${formatCurrency(payment.amount)}</div>
      `;
    }
  }

  document.getElementById('payment-id').value = payment.id;
  document.getElementById('payment-title').value = isCard
    ? `${payment.bank} ${payment.cardName} (*${payment.last4}) — ${payment.holder} (${payment.company})`
    : `${payment.bankName} — ${ formatCurrency(payment.amount) }`;
  document.getElementById('payment-amount').value = payment.amount > 0 ? payment.amount : '';
  document.getElementById('payment-paid-amount').value = payment.status === 'partial' ? (payment.paidAmount || '') : '';
  document.getElementById('payment-date').value = payment.date;
  document.getElementById('payment-notes').value = payment.notes || '';

  const statusRadios = document.getElementsByName('payment-status');
  statusRadios.forEach(radio => {
    radio.checked = radio.value === payment.status;
  });

  updatePartialPaymentRowVisibility();
  modal.classList.add('show');
}
window.openEditModal = openEditModal;

function closeModal() {
  modal.classList.remove('show');
}

document.getElementsByName('payment-status').forEach(radio => {
  radio.addEventListener('change', updatePartialPaymentRowVisibility);
});
document.getElementById('payment-amount').addEventListener('input', updateRemainingPreview);
document.getElementById('payment-paid-amount').addEventListener('input', updateRemainingPreview);

paymentForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('payment-id').value;
  const amount = parseFloat(document.getElementById('payment-amount').value) || 0;
  const date = document.getElementById('payment-date').value;
  const notes = document.getElementById('payment-notes').value.trim();

  let status = 'unpaid';
  document.getElementsByName('payment-status').forEach(r => { if (r.checked) status = r.value; });

  let paidAmount = 0;
  if (status === 'paid') {
    paidAmount = amount;
  } else if (status === 'partial') {
    paidAmount = Math.min(Math.max(parseFloat(document.getElementById('payment-paid-amount').value) || 0, 0), amount);
  }

  if (id.startsWith('card-pay-')) {
    const mapObj = getCardMonthlyStateMap();
    mapObj[id] = {
      amount,
      status,
      paidAmount,
      notes,
      updatedAt: new Date().toISOString()
    };
    saveCardMonthlyStateMap(mapObj);
  } else if (id.startsWith('loan-pay-')) {
    const parts = id.split('-');
    const loanKey = parts.slice(2, parts.length - 1).join('-');
    const taksitNo = parts[parts.length - 1];
    let userState = {};
    try { userState = JSON.parse(localStorage.getItem('dizsan_kredi_takip_verileri') || '{}'); } catch (err) {}
    if (!userState[loanKey]) userState[loanKey] = {};
    if (!userState[loanKey][taksitNo]) userState[loanKey][taksitNo] = {};
    userState[loanKey][taksitNo].is_paid = (status === 'paid');
    userState[loanKey][taksitNo].paidAmount = paidAmount;
    userState[loanKey][taksitNo].payment_date = date;
    userState[loanKey][taksitNo].notes = notes || (status === 'partial' ? `Kısmi ödeme: ${formatCurrency(paidAmount)}` : '');
    userState[loanKey][taksitNo].source = 'Ödeme Takvimi';
    localStorage.setItem('dizsan_kredi_takip_verileri', JSON.stringify(userState));
    let customLoans = {};
    try { customLoans = JSON.parse(localStorage.getItem('dizsan_eklenen_krediler') || '{}'); } catch (err) {}
    pushLoanStateToPortal(userState, customLoans);
  }

  closeModal();
  renderAllViews();
});

document.getElementById('modal-close-btn').addEventListener('click', closeModal);
document.getElementById('cancel-payment-btn').addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

// 12. Navigasyon & Filtre Dinleyicileri
document.getElementById('prev-month-btn').addEventListener('click', () => {
  state.currentDate.setMonth(state.currentDate.getMonth() - 1);
  renderAllViews();
});

document.getElementById('next-month-btn').addEventListener('click', () => {
  state.currentDate.setMonth(state.currentDate.getMonth() + 1);
  renderAllViews();
});

document.getElementById('today-btn').addEventListener('click', () => {
  state.currentDate = new Date();
  renderAllViews();
});

document.getElementById('month-select').addEventListener('change', (e) => {
  state.currentDate.setMonth(parseInt(e.target.value, 10));
  renderAllViews();
});

document.getElementById('year-select').addEventListener('change', (e) => {
  state.currentDate.setFullYear(parseInt(e.target.value, 10));
  renderAllViews();
});

document.getElementById('submodule-tabs').addEventListener('click', (e) => {
  const target = e.target.closest('.filter-item');
  if (!target || !target.dataset.view) return;
  switchView(target.dataset.view);
});

document.getElementById('category-filters').addEventListener('click', (e) => {
  const target = e.target.closest('.filter-item');
  if (!target) return;
  document.querySelectorAll('#category-filters .filter-item').forEach(i => i.classList.remove('active'));
  target.classList.add('active');
  state.filters.category = target.dataset.category;
  renderAllViews();
});

document.getElementById('status-filters').addEventListener('click', (e) => {
  const target = e.target.closest('.filter-item');
  if (!target) return;
  document.querySelectorAll('#status-filters .filter-item').forEach(i => i.classList.remove('active'));
  target.classList.add('active');
  state.filters.status = target.dataset.status;
  renderAllViews();
});

const cardSearchInput = document.getElementById('card-search-input');
if (cardSearchInput) {
  cardSearchInput.addEventListener('input', (e) => {
    state.cardSearchQuery = e.target.value.trim();
    renderAllViews();
  });
}

const listSearchInput = document.getElementById('list-search-input');
if (listSearchInput) {
  listSearchInput.addEventListener('input', (e) => {
    state.listSearchQuery = e.target.value.trim();
    renderAllViews();
  });
}

document.getElementById('print-calendar-btn').addEventListener('click', () => window.print());

function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (!themeToggleBtn) return;
  const currentTheme = localStorage.getItem('theme_preference') || 'dark';
  if (currentTheme === 'light') {
    document.body.classList.add('light-theme');
    themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i> Karanlık Mod';
  } else {
    document.body.classList.remove('light-theme');
    themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i> Aydınlık Mod';
  }

  themeToggleBtn.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-theme');
    localStorage.setItem('theme_preference', isLight ? 'light' : 'dark');
    themeToggleBtn.innerHTML = isLight ? '<i class="fa-solid fa-moon"></i> Karanlık Mod' : '<i class="fa-solid fa-sun"></i> Aydınlık Mod';
  });
}

// 13. PWA Service Worker & Mobil Uygulama Kurulum Desteği
let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
});

const triggerPwaBtn = document.getElementById('trigger-pwa-install-btn');
if (triggerPwaBtn) {
  triggerPwaBtn.addEventListener('click', async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
    } else {
      alert('📱 Telefona Kurulum:\n\n• iPhone / iPad (Safari): Alt bardaki Paylaş (⬆️) butonuna basıp "Ana Ekrana Ekle" seçeneğine dokunun.\n• Android (Chrome): Sağ üstteki 3 nokta menüsünden "Uygulamayı Yükle / Ana ekrana ekle" seçeneğine dokunun.');
    }
  });
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

window.addEventListener('DOMContentLoaded', () => {
  renderAllViews();
  initTheme();
  syncLoanStateFromPortal();
});

// D-Pro Üst Bar Alt Başlık (Submodule) Köprüsü
window.addEventListener('message', (ev) => {
  const d = ev.data || {};
  if (d.type === 'DPRO_SWITCH_SUBMODULE' && d.targetTab) {
    switchView(d.targetTab);
  }
});
