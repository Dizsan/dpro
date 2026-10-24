// CardFlow Application Logic

// Initial Mock Data to populate the dashboard if localStorage is empty
const INITIAL_CARDS = [
  { id: "card-1",  bank: "Garanti BBVA",   name: "Bonus Trink (Dizsan Lojistik)",      holder: "Ömer Eren (Dizsan Lojistik)", number: "6010", type: "corporate", limit: 150000, debt: 0, cutOffDay: 1,  dueDay: 7,  dueOffset: 6  },
  { id: "card-2",  bank: "Akbank",         name: "Axess (Dizsan Lojistik)",            holder: "Ömer Eren (Dizsan Lojistik)", number: "3481", type: "corporate", limit: 250000, debt: 0, cutOffDay: 7,  dueDay: 12, dueOffset: 5  },
  { id: "card-3",  bank: "Akbank",         name: "Axess (Dizsan Otomotiv)",            holder: "Ömer Eren (Dizsan Otomotiv)", number: "6539", type: "corporate", limit: 300000, debt: 0, cutOffDay: 7,  dueDay: 12, dueOffset: 5  },
  { id: "card-4",  bank: "TEB",            name: "Bonus (Şahsi)",                      holder: "Ömer Eren (Şahsi)",           number: "9097", type: "personal",  limit: 80000,  debt: 0, cutOffDay: 7,  dueDay: 17, dueOffset: 10 },
  { id: "card-5",  bank: "Halkbank",       name: "Paraf (Şahsi)",                      holder: "Ömer Eren (Şahsi)",           number: "8765", type: "personal",  limit: 120000, debt: 0, cutOffDay: 15, dueDay: 25, dueOffset: 10 },
  { id: "card-6",  bank: "Ziraat Bankası", name: "Combo (Şahsi)",                      holder: "Ömer Eren (Şahsi)",           number: "7265", type: "personal",  limit: 150000, debt: 0, cutOffDay: 22, dueDay: 3,  dueOffset: 11 },
  { id: "card-7",  bank: "Garanti BBVA",   name: "Bonus Platinum (Şahsi)",             holder: "Ömer Eren (Şahsi)",           number: "0031", type: "personal",  limit: 500000, debt: 0, cutOffDay: 23, dueDay: 2,  dueOffset: 10 },
  { id: "card-8",  bank: "Garanti BBVA",   name: "Corporate (Dizsan Otomotiv)",        holder: "Ömer Eren (Dizsan Otomotiv)", number: "4360", type: "corporate", limit: 750000, debt: 0, cutOffDay: 21, dueDay: 31, dueOffset: 10 },
  { id: "card-9",  bank: "Garanti BBVA",   name: "Corporate (Dizsan Lojistik)",        holder: "Ömer Eren (Dizsan Lojistik)", number: "4352", type: "corporate", limit: 600000, debt: 0, cutOffDay: 21, dueDay: 30, dueOffset: 9  },
  { id: "card-10", bank: "Garanti BBVA",   name: "Bonus Trink (Dizsan Otomotiv)",      holder: "Ömer Eren (Dizsan Otomotiv)", number: "3017", type: "corporate", limit: 90000,  debt: 0, cutOffDay: 26, dueDay: 1,  dueOffset: 5  },
  { id: "card-11", bank: "Vakıfbank",      name: "World (Dizsan Lojistik)",            holder: "Ömer Eren (Dizsan Lojistik)", number: "1634", type: "corporate", limit: 200000, debt: 0, cutOffDay: 28, dueDay: 4,  dueOffset: 6  },
  { id: "card-12", bank: "Ziraat Bankası", name: "Başak (Dizsan Otomotiv)",            holder: "Ömer Eren (Dizsan Otomotiv)", number: "3232", type: "corporate", limit: 400000, debt: 0, cutOffDay: 28, dueDay: 7,  dueOffset: 9  },
  { id: "card-13", bank: "İş Bankası",     name: "Maximum Business (Dizsan Otomotiv)", holder: "İsimsiz (Dizsan Otomotiv)",   number: "4635", type: "corporate", limit: 350000, debt: 0, cutOffDay: 29, dueDay: 7,  dueOffset: 8  },
  { id: "card-14", bank: "İş Bankası",     name: "Maximum Business (Dizsan Lojistik)", holder: "İsimsiz (Dizsan Lojistik)",   number: "6298", type: "corporate", limit: 350000, debt: 0, cutOffDay: 29, dueDay: 7,  dueOffset: 8  },
  { id: "card-15", bank: "İş Bankası",     name: "Maximum Business (DsMot)",           holder: "İsimsiz (DsMot)",             number: "4593", type: "corporate", limit: 250000, debt: 0, cutOffDay: 29, dueDay: 7,  dueOffset: 8  },
  { id: "card-16", bank: "İş Bankası",     name: "Maximiles Black (Şahsi)",            holder: "Ömer Eren (Şahsi)",           number: "8815", type: "personal",  limit: 450000, debt: 0, cutOffDay: 3,  dueDay: 7,  dueOffset: 4  },
  { id: "card-17", bank: "Garanti BBVA",   name: "Bonus (Dizsan Otomotiv)",            holder: "Ömer Eren (Dizsan Otomotiv)", number: "3311", type: "corporate", limit: 300000, debt: 0, cutOffDay: 21, dueDay: 1,  dueOffset: 10 }
];

// Application State
let state = {
  cards: [],
  currentFilter: 'all', // 'all', 'personal', 'corporate'
  chartInstance: null,
  calendarDate: new Date()
};

// Initialization
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  setupEventListeners();
  createTooltipElement();
  renderDashboard();
});

// Load data from localStorage or load mock data
function loadData() {
  const savedCards = localStorage.getItem("cardflow_cards_v3");
  if (savedCards) {
    state.cards = JSON.parse(savedCards);
    const existingNumbers = new Set(state.cards.map(c => String(c.number)));
    let updated = false;
    for (const defCard of INITIAL_CARDS) {
      if (!existingNumbers.has(String(defCard.number))) {
        state.cards.push({ ...defCard });
        existingNumbers.add(String(defCard.number));
        updated = true;
      }
    }
    if (updated) saveData();
  } else {
    state.cards = [...INITIAL_CARDS];
    saveData();
  }
}

// Save data to localStorage
function saveData() {
  localStorage.setItem("cardflow_cards_v3", JSON.stringify(state.cards));
}

// Set up UI Event Listeners
function setupEventListeners() {
  // Modal toggle buttons
  document.getElementById("add-card-btn").addEventListener("click", () => openCardModal());
  document.getElementById("add-card-placeholder-btn").addEventListener("click", () => openCardModal());
  document.getElementById("modal-close-btn").addEventListener("click", closeCardModal);
  document.getElementById("cancel-card-btn").addEventListener("click", closeCardModal);
  
  // Card Form Submission
  document.getElementById("card-form").addEventListener("submit", handleCardSubmit);
  
  // Delete Card Button
  document.getElementById("delete-card-btn").addEventListener("click", handleDeleteCard);

  // Filters
  document.getElementById("filter-all-btn").addEventListener("click", () => setFilter('all'));
  document.getElementById("filter-personal-btn").addEventListener("click", () => setFilter('personal'));
  document.getElementById("filter-corporate-btn").addEventListener("click", () => setFilter('corporate'));

  // Sidebar Links
  document.getElementById("nav-dashboard").addEventListener("click", (e) => {
    e.preventDefault();
    setFilter('all');
  });
  document.getElementById("nav-cards-btn").addEventListener("click", (e) => {
    e.preventDefault();
    const scrollContainer = document.getElementById("cards-container");
    scrollContainer.scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById("nav-settings").addEventListener("click", (e) => {
    e.preventDefault();
    alert("Ayarlar bölümü prototip aşamasındadır. Kredi kartı ekleme/silme ve veri saklama özellikleri tamamen aktiftir.");
  });

  // Fast Import Button
  document.getElementById("run-import-btn").addEventListener("click", handleFastImport);

  // Calendar Navigation
  document.getElementById("calendar-prev-btn").addEventListener("click", () => changeCalendarMonth(-1));
  document.getElementById("calendar-next-btn").addEventListener("click", () => changeCalendarMonth(1));
}

// Open modal for add or edit
function openCardModal(cardId = null) {
  const modal = document.getElementById("card-modal");
  const form = document.getElementById("card-form");
  const titleText = document.getElementById("modal-title-text");
  const deleteBtn = document.getElementById("delete-card-btn");

  form.reset();

  if (cardId) {
    // Edit mode
    const card = state.cards.find(c => c.id === cardId);
    if (!card) return;

    titleText.textContent = "Kredi Kartını Düzenle";
    document.getElementById("card-id").value = card.id;
    document.getElementById("card-bank-input").value = card.bank;
    document.getElementById("card-name-input").value = card.name;
    document.getElementById("card-holder-input").value = card.holder;
    document.getElementById("card-number-input").value = card.number;
    document.querySelector(`input[name="card-type"][value="${card.type}"]`).checked = true;
    document.getElementById("card-limit-input").value = card.limit;
    document.getElementById("card-debt-input").value = card.debt;
    document.getElementById("card-cutoff-input").value = card.cutOffDay;
    document.getElementById("card-due-offset-input").value = card.dueOffset || 10;

    deleteBtn.style.display = "block";
  } else {
    // Add mode
    titleText.textContent = "Yeni Kredi Kartı Ekle";
    document.getElementById("card-id").value = "";
    deleteBtn.style.display = "none";
  }

  modal.classList.add("show");
}

// Close Modal
function closeCardModal() {
  document.getElementById("card-modal").classList.remove("show");
}

// Handle Add/Edit Card Form Submit
function handleCardSubmit(e) {
  e.preventDefault();

  const id = document.getElementById("card-id").value;
  const bank = document.getElementById("card-bank-input").value.trim();
  const name = document.getElementById("card-name-input").value.trim();
  const holder = document.getElementById("card-holder-input").value.trim();
  const number = document.getElementById("card-number-input").value.trim();
  const type = document.querySelector('input[name="card-type"]:checked').value;
  const limit = parseFloat(document.getElementById("card-limit-input").value);
  const debt = parseFloat(document.getElementById("card-debt-input").value);
  const cutOffDay = parseInt(document.getElementById("card-cutoff-input").value);
  const dueOffset = parseInt(document.getElementById("card-due-offset-input").value) || 10;

  if (id) {
    // Update existing
    const cardIndex = state.cards.findIndex(c => c.id === id);
    if (cardIndex !== -1) {
      state.cards[cardIndex] = { ...state.cards[cardIndex], bank, name, holder, number, type, limit, debt, cutOffDay, dueOffset };
    }
  } else {
    // Add new
    const newCard = {
      id: 'card-' + Date.now(),
      bank,
      name,
      holder,
      number,
      type,
      limit,
      debt,
      cutOffDay,
      dueOffset
    };
    state.cards.push(newCard);
  }

  saveData();
  closeCardModal();
  renderDashboard();
}

// Handle Delete Card
function handleDeleteCard() {
  const id = document.getElementById("card-id").value;
  if (!id) return;

  if (confirm("Bu kredi kartını silmek istediğinize emin misiniz?")) {
    state.cards = state.cards.filter(c => c.id !== id);
    saveData();
    closeCardModal();
    renderDashboard();
  }
}

// Change filtering mode
function setFilter(filterMode) {
  state.currentFilter = filterMode;
  
  // Update button active state styling
  const buttons = {
    all: document.getElementById("filter-all-btn"),
    personal: document.getElementById("filter-personal-btn"),
    corporate: document.getElementById("filter-corporate-btn")
  };

  Object.keys(buttons).forEach(key => {
    if (key === filterMode) {
      buttons[key].classList.add("btn-primary");
      buttons[key].classList.remove("btn-glass");
    } else {
      buttons[key].classList.remove("btn-primary");
      buttons[key].classList.add("btn-glass");
    }
  });

  renderDashboard();
}

// Format Currency Utility
function formatCurrency(val) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);
}

// Date Calculations logic for Statement & Due Dates
function calculateCardDates(card) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  
  // Calculate cut-off date for this cycle
  let cutOffDate = new Date(currentYear, currentMonth, card.cutOffDay);
  
  // If the cut-off day has already passed in this month, project to the next month's cut-off
  if (today.getDate() > card.cutOffDay) {
    cutOffDate = new Date(currentYear, currentMonth + 1, card.cutOffDay);
  }

  // Due date is X days after cut-off
  const dueDate = new Date(cutOffDate.getTime());
  dueDate.setDate(dueDate.getDate() + (card.dueOffset || 10));

  // Diff in days (using UTC to avoid daylight savings discrepancies)
  const utcToday = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const utcDue = Date.UTC(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  const diffDays = Math.ceil((utcDue - utcToday) / (1000 * 60 * 60 * 24));

  return {
    cutOffDate,
    dueDate,
    diffDays
  };
}

// Main Render Function
function renderDashboard() {
  const filteredCards = state.cards.filter(card => {
    if (state.currentFilter === 'all') return true;
    return card.type === state.currentFilter;
  });

  // 1. Calculate KPI Metrics
  let totalDebt = 0;
  let totalLimit = 0;
  let totalAvailable = 0;
  let upcomingPayments = 0;

  filteredCards.forEach(card => {
    totalDebt += card.debt;
    totalLimit += card.limit;
    totalAvailable += Math.max(0, card.limit - card.debt);
    
    // If due date is within this billing cycle (this month/next few days) and has debt
    if (card.debt > 0) {
      upcomingPayments += card.debt;
    }
  });

  // Update KPI displays
  document.getElementById("val-total-debt").textContent = formatCurrency(totalDebt);
  document.getElementById("val-total-limit").textContent = formatCurrency(totalLimit);
  document.getElementById("val-available-limit").textContent = formatCurrency(totalAvailable);
  document.getElementById("val-upcoming-payments").textContent = formatCurrency(upcomingPayments);

  // Update Page Title description based on filters
  const pageSub = document.getElementById("page-subtitle");
  if (state.currentFilter === 'personal') {
    pageSub.textContent = "Sadece şahsi kredi kartlarınızın güncel mali durumu listeleniyor.";
  } else if (state.currentFilter === 'corporate') {
    pageSub.textContent = "Sadece şirketinize tanımlı ticari kredi kartlarının güncel mali durumu listeleniyor.";
  } else {
    pageSub.textContent = "Tüm şahsi ve şirket kredi kartlarınızın güncel durumu.";
  }

  // 2. Render Cards Grid
  renderCardsGrid(filteredCards);

  // 3. Render Upcoming Payments Calendar
  renderCalendar(filteredCards);

  // 4. Render Chart
  renderChart(filteredCards);
}

// Render the credit card visual items
function renderCardsGrid(cardsList) {
  const container = document.getElementById("cards-container");
  
  // Clear all except the placeholders
  const placeholders = Array.from(container.querySelectorAll('.add-card-placeholder'));
  container.innerHTML = '';

  cardsList.forEach(card => {
    const cardEl = document.createElement("div");
    cardEl.className = `credit-card ${card.type}`;
    cardEl.innerHTML = `
      <div class="card-header">
        <span class="card-bank">${card.bank}</span>
        <span class="card-badge">${card.type === 'personal' ? 'Şahsi' : 'Şirket'}</span>
      </div>
      <div class="card-mid">
        <div class="card-chip"></div>
        <i class="card-type-icon fa-brands fa-cc-${card.name.toLowerCase().includes('visa') ? 'visa' : 'mastercard'}"></i>
      </div>
      <div class="card-number">•••• •••• •••• ${card.number || '0000'}</div>
      <div class="card-footer">
        <div class="card-holder">
          <span class="card-holder-label">Kart Sahibi</span>
          <span class="card-holder-name">${card.holder}</span>
        </div>
        <div class="card-meta">
          <div class="card-meta-item">
            <span class="card-meta-label">Güncel Borç</span>
            <span class="card-meta-val">${formatCurrency(card.debt)}</span>
          </div>
          <div class="card-meta-item">
            <span class="card-meta-label">Kart Adı</span>
            <span class="card-meta-val">${card.name}</span>
          </div>
        </div>
      </div>
    `;

    // Click to Edit
    cardEl.addEventListener("click", () => openCardModal(card.id));
    container.appendChild(cardEl);
  });

  // Re-append placeholders
  placeholders.forEach(p => container.appendChild(p));
}

// Change Calendar Month Navigation Handler
function changeCalendarMonth(offset) {
  const current = state.calendarDate;
  state.calendarDate = new Date(current.getFullYear(), current.getMonth() + offset, 1);
  renderDashboard();
}

// Check which card payments are due on a specific day of the displayed calendar month/year
function getCardPaymentsForDay(cards, day, month, year) {
  const events = [];
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  cards.forEach(card => {
    if (card.dueDay) {
      const effectiveDueDay = Math.min(card.dueDay, totalDaysInMonth);
      if (effectiveDueDay === day) {
        events.push({
          card,
          dueDate: new Date(year, month, effectiveDueDay)
        });
      }
      return;
    }
    // Fallback for custom cards without explicit dueDay
    [-1, 0, 1].forEach(offsetMonth => {
      const cutoff = new Date(year, month + offsetMonth, card.cutOffDay);
      const due = new Date(cutoff.getTime());
      due.setDate(due.getDate() + (card.dueOffset || 10));

      if (due.getFullYear() === year && due.getMonth() === month && due.getDate() === day) {
        events.push({
          card,
          dueDate: due
        });
      }
    });
  });
  return events;
}

// Render the Monthly Payment Calendar Grid
function renderCalendar(cardsList) {
  const container = document.getElementById("calendar-days-container");
  const monthYearLabel = document.getElementById("calendar-month-year");
  
  if (!container || !monthYearLabel) return;

  const date = state.calendarDate;
  const year = date.getFullYear();
  const month = date.getMonth();

  // Set header month name
  const monthNames = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];
  monthYearLabel.textContent = `${monthNames[month]} ${year}`;

  container.innerHTML = '';

  // Get index of first day of the month (Monday start mapping: Mon=0, Tue=1 ... Sun=6)
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const startDayIndex = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  // Days in current and previous months
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevTotalDays = new Date(year, month, 0).getDate();

  const today = new Date();
  let daysHTML = '';

  // 1. Render previous month's overlapping days
  for (let i = startDayIndex - 1; i >= 0; i--) {
    const prevDay = prevTotalDays - i;
    daysHTML += `
      <div class="calendar-day other-month">
        <span class="calendar-day-num">${prevDay}</span>
      </div>
    `;
  }

  // 2. Render current month's days
  for (let d = 1; d <= totalDays; d++) {
    const isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
    const dayEvents = getCardPaymentsForDay(cardsList, d, month, year);

    let eventsHTML = '';
    if (dayEvents.length > 0) {
      eventsHTML = `<div class="calendar-events-container">`;
      dayEvents.forEach(evt => {
        const card = evt.card;
        const displayAmount = card.debt > 0 ? (card.debt >= 1000 ? (card.debt / 1000).toFixed(0) + 'k₺' : card.debt + '₺') : `*${card.number}`;
        const eventClass = `${card.type}`;
        
        eventsHTML += `
          <div class="calendar-event-item ${eventClass}" 
               title="${card.bank} - ${card.name}\nSon 4 Hane: *${card.number}\nKart Sahibi: ${card.holder}${card.debt > 0 ? '\nBorç: ' + formatCurrency(card.debt) : ''}"
               onclick="event.stopPropagation(); openCardModal('${card.id}')">
            <span>${card.bank.split(' ')[0]} *${card.number}</span>
            <span style="font-size:0.65rem; opacity:0.9;">${card.debt > 0 ? displayAmount : card.holder.split(' ')[0]}</span>
          </div>
        `;
      });
      eventsHTML += `</div>`;
    }

    daysHTML += `
      <div class="calendar-day ${isToday ? 'today' : ''}" onclick="openAddCardForDay(${d})">
        <span class="calendar-day-num">${d}</span>
        ${eventsHTML}
      </div>
    `;
  }

  // 3. Render next month's overlapping days to align grid
  const totalCellsSoFar = startDayIndex + totalDays;
  const totalCellsRequired = Math.ceil(totalCellsSoFar / 7) * 7;
  const nextMonthCells = totalCellsRequired - totalCellsSoFar;

  for (let i = 1; i <= nextMonthCells; i++) {
    daysHTML += `
      <div class="calendar-day other-month">
        <span class="calendar-day-num">${i}</span>
      </div>
    `;
  }

  container.innerHTML = daysHTML;

  // Bind custom hover popovers for cells that contain card payments
  const cells = container.querySelectorAll('.calendar-day');
  cells.forEach(cell => {
    if (cell.classList.contains('other-month')) return;

    const dayNumEl = cell.querySelector('.calendar-day-num');
    if (!dayNumEl) return;

    const dayNum = parseInt(dayNumEl.textContent);
    const dayEvents = getCardPaymentsForDay(cardsList, dayNum, month, year);

    if (dayEvents.length > 0) {
      cell.addEventListener('mouseenter', (e) => showTooltip(e, dayEvents, dayNum, month, year));
      cell.addEventListener('mouseleave', hideTooltip);
      cell.addEventListener('mousemove', moveTooltip);
    }
  });
}

// Pre-fill cutoff day when user clicks empty space on calendar day cell
window.openAddCardForDay = function(day) {
  openCardModal();
  document.getElementById("card-cutoff-input").value = day;
};

// Render Chart JS Distribution chart
function renderChart(cardsList) {
  const ctx = document.getElementById('debtChart').getContext('2d');
  
  // Destroy old instance if exists
  if (state.chartInstance) {
    state.chartInstance.destroy();
  }

  // Filter cards with positive debt
  const cardsWithDebt = cardsList.filter(c => c.debt > 0);

  if (cardsWithDebt.length === 0) {
    // Render placeholder chart
    state.chartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Borçsuz Dönem 🎉'],
        datasets: [{
          data: [100],
          backgroundColor: ['rgba(16, 185, 129, 0.2)'],
          borderColor: ['#10b981'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#f3f4f6', font: { family: 'Outfit' } }
          }
        }
      }
    });
    return;
  }

  const labels = cardsWithDebt.map(c => `${c.bank} (${c.name})`);
  const data = cardsWithDebt.map(c => c.debt);
  
  // Generate random cohesive colors
  const colors = [
    '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e', 
    '#3b82f6', '#06b6d4', '#10b981', '#fbbf24', '#f97316'
  ];

  state.chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors.slice(0, cardsWithDebt.length).map(c => c + 'cc'), // Add opacity
        borderColor: colors.slice(0, cardsWithDebt.length),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#f3f4f6',
            boxWidth: 12,
            font: { family: 'Outfit', size: 11 }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return ` Borç: ${formatCurrency(context.raw)}`;
            }
          }
        }
      },
      cutout: '65%'
    }
  });
}

// Preset SMS template helper
window.setPresetText = function(bankType) {
  const textarea = document.getElementById("import-text");
  
  const presets = {
    garanti: "Garanti BBVA: Sayin OMER EREN, sonu 4251 ile biten Bonus Gold kartinizin ekstre borcu 34.200,00 TL'dir. Son odeme tarihi: 25.07.2026. Asgari tutar: 13.680 TL.",
    yapi: "Yapi Kredi: Sonu 8832 ile biten Maximum Business kartinizdan bagimsiz olarak World kartiniz icin donem borcunuz 12.300 TL'dir. Son odeme: 20.07.2026.",
    akbank: "Akbank: Axess Business ticari kartiniz (Son hanesi 7115) ekstre borcu 4.200,00 TL son odeme gunu 08.07.2026."
  };

  textarea.value = presets[bankType] || '';
};

// Fast Text Parser Engine
function handleFastImport() {
  const text = document.getElementById("import-text").value.trim();
  if (!text) {
    alert("Lütfen önce analiz edilecek bir metin yapıştırın.");
    return;
  }

  const lowercaseText = text.toLowerCase();
  
  // 1. Find matching card
  let matchedCard = null;

  // Search by card digits (e.g. "sonu 4251 ile biten")
  const digitsMatch = text.match(/\b\d{4}\b/);
  if (digitsMatch) {
    const digits = digitsMatch[0];
    matchedCard = state.cards.find(c => c.number === digits);
  }

  // If not matched by card numbers, search by bank and product names
  if (!matchedCard) {
    for (const card of state.cards) {
      const bankKeyword = card.bank.toLowerCase().split(' ')[0]; // E.g. "garanti", "iş"
      const nameKeyword = card.name.toLowerCase().split(' ')[0]; // E.g. "bonus", "maximum"

      if (lowercaseText.includes(bankKeyword) || lowercaseText.includes(nameKeyword)) {
        matchedCard = card;
        break;
      }
    }
  }

  if (!matchedCard) {
    alert("Üzgünüz, metinden hangi karta ait olduğunu tespit edemedik. Lütfen kartın bankasını, adını veya son 4 hanesini metinde bulundurun.");
    return;
  }

  // 2. Find amounts in text
  // Match Turkish currency format: 34.200,00 or 12.300 or 12500 etc.
  const amounts = [];
  
  // Regex to match numbers that look like currency values (excluding dates)
  // Matching: 34.200,00 or 12.300 or 4.200,00
  const currencyRegex = /\b\d{1,3}(?:\.\d{3})*(?:,\d{2})?\b|\b\d+(?:\.\d{2})?\b/g;
  let match;
  
  while ((match = currencyRegex.exec(text)) !== null) {
    const rawVal = match[0];
    
    // Ignore match if it's a date segment (like 25.07.2026 or 15.07) or matches card number
    if (rawVal.includes('.') && rawVal.split('.').length === 3) continue; // Full date dd.mm.yyyy
    if (rawVal === matchedCard.number) continue; // Card digits
    if (rawVal.length <= 2 && !rawVal.includes(',')) continue; // Small numbers (like offset days or day indicators)
    
    // Parse Turkish double formatting
    let parsedVal = rawVal;
    if (rawVal.includes('.') && rawVal.includes(',')) {
      // Formatted with thousands dots and decimal comma: 34.200,00 -> 34200.00
      parsedVal = rawVal.replace(/\./g, '').replace(',', '.');
    } else if (rawVal.includes(',')) {
      // Decimal comma only: 12500,50 -> 12500.50
      parsedVal = rawVal.replace(',', '.');
    } else if (rawVal.includes('.') && rawVal.split('.').length === 2 && rawVal.split('.')[1].length === 3) {
      // Thousands separator only: 34.200 -> 34200
      parsedVal = rawVal.replace(/\./g, '');
    }

    const floatVal = parseFloat(parsedVal);
    if (!isNaN(floatVal) && floatVal > 0) {
      amounts.push(floatVal);
    }
  }

  if (amounts.length === 0) {
    alert("Metin içinde geçerli bir borç tutarı bulunamadı.");
    return;
  }

  // Select the primary amount
  // Usually, the first large amount in the SMS or the one before "TL"
  // Let's take the first one or if we have multiple, the largest one (under the card limit)
  let selectedAmount = amounts[0];
  if (amounts.length > 1) {
    // If one of the amounts is followed by 'tl' or '₺' in the text, choose that
    const tlIndices = [];
    let idx = lowercaseText.indexOf('tl');
    while (idx !== -1) {
      tlIndices.push(idx);
      idx = lowercaseText.indexOf('tl', idx + 1);
    }
    
    let bestDist = Infinity;
    amounts.forEach((amt) => {
      // Find the index of raw match in original text
      const rawStr = amt.toLocaleString('tr-TR');
      const amtIdx = text.indexOf(rawStr);
      if (amtIdx !== -1) {
        tlIndices.forEach(tlIdx => {
          const dist = tlIdx - amtIdx;
          if (dist > 0 && dist < bestDist) {
            bestDist = dist;
            selectedAmount = amt;
          }
        });
      }
    });
  }

  // Confirm and update
  const confirmMsg = `Analiz Sonucu:\n\nKart: ${matchedCard.bank} (${matchedCard.name})\nTespit Edilen Borç: ${formatCurrency(selectedAmount)}\n\nBu kartın borç bilgisini güncellemek istiyor musunuz?`;
  
  if (confirm(confirmMsg)) {
    const cardIndex = state.cards.findIndex(c => c.id === matchedCard.id);
    if (cardIndex !== -1) {
      state.cards[cardIndex].debt = selectedAmount;
      saveData();
      document.getElementById("import-text").value = ""; // Clear text
      renderDashboard();
    }
  }
}

// Tooltip Helpers for Rich Calendar Hover Details
function createTooltipElement() {
  if (document.getElementById("calendar-tooltip")) return;
  const tooltip = document.createElement("div");
  tooltip.id = "calendar-tooltip";
  tooltip.className = "custom-tooltip";
  document.body.appendChild(tooltip);
}

function showTooltip(e, dayEvents, day, month, year) {
  const tooltip = document.getElementById("calendar-tooltip");
  if (!tooltip) return;

  const monthNames = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];

  let cardsHTML = '';
  let totalDebtOnDay = 0;
  let totalPaidOnDay = 0;
  let totalMinPayOnDay = 0;

  dayEvents.forEach(evt => {
    const card = evt.card;
    const isPaid = card.debt === 0;

    totalDebtOnDay += card.debt;
    // Calculate minimum payment (asgari ödeme): 40% of the balance in Turkey
    const minPayment = card.debt * 0.40;
    totalMinPayOnDay += minPayment;

    if (isPaid) {
      totalPaidOnDay += card.limit; // Or just show paid
    }

    cardsHTML += `
      <div class="tooltip-card-item">
        <div class="tooltip-card-name">
          <span>${card.bank} - ${card.name}</span>
          <span class="type-badge" style="background: ${card.type === 'personal' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(245, 158, 11, 0.2)'}; color: ${card.type === 'personal' ? '#60a5fa' : '#fbbf24'};">
            ${card.type === 'personal' ? 'Şahsi' : 'Şirket'}
          </span>
        </div>
        <div class="tooltip-card-details">
          <div>Borç: <span>${formatCurrency(card.debt)}</span></div>
          <div>Asgari (%40): <span>${formatCurrency(minPayment)}</span></div>
          <div>Limit: <span>${formatCurrency(card.limit)}</span></div>
          <div>Durum: <span style="color: ${isPaid ? '#34d399' : '#f87171'}; font-weight: 600;">${isPaid ? 'Ödendi ✓' : 'Ödenmedi'}</span></div>
        </div>
      </div>
    `;
  });

  let summaryHTML = '';
  if (dayEvents.length > 1) {
    summaryHTML = `
      <div class="tooltip-summary">
        <div class="tooltip-summary-row total-row">
          <span>Toplam Günlük Borç:</span>
          <span>${formatCurrency(totalDebtOnDay)}</span>
        </div>
        <div class="tooltip-summary-row">
          <span>Toplam Asgari Tutarı:</span>
          <span>${formatCurrency(totalMinPayOnDay)}</span>
        </div>
      </div>
    `;
  }

  tooltip.innerHTML = `
    <div class="tooltip-title">
      <span>📅 ${day} ${monthNames[month]} ${year}</span>
      <span style="font-size: 0.75rem; color: var(--text-secondary);">${dayEvents.length} Kart Ödemesi</span>
    </div>
    ${cardsHTML}
    ${summaryHTML}
  `;

  tooltip.classList.add("show");
  moveTooltip(e);
}

function hideTooltip() {
  const tooltip = document.getElementById("calendar-tooltip");
  if (tooltip) {
    tooltip.classList.remove("show");
  }
}

function moveTooltip(e) {
  const tooltip = document.getElementById("calendar-tooltip");
  if (!tooltip) return;

  const offsetX = 15;
  const offsetY = 15;

  let x = e.pageX + offsetX;
  let y = e.pageY + offsetY;

  const tooltipWidth = tooltip.offsetWidth || 320;
  const tooltipHeight = tooltip.offsetHeight || 200;

  // Prevent right-edge overflow
  if (x + tooltipWidth > window.innerWidth + window.scrollX) {
    x = e.pageX - tooltipWidth - offsetX;
  }

  // Prevent bottom-edge overflow
  if (y + tooltipHeight > window.innerHeight + window.scrollY) {
    y = e.pageY - tooltipHeight - offsetY;
  }

  // Prevent negative coordinates
  if (x < window.scrollX) x = window.scrollX + 5;
  if (y < window.scrollY) y = window.scrollY + 5;

  tooltip.style.left = x + 'px';
  tooltip.style.top = y + 'px';
}

// D-Pro Üst Bar Alt Başlık (Submodule) Köprüsü
window.switchTab = setFilter;
window.addEventListener('message', (ev) => {
  const d = ev.data || {};
  if (d.type === 'DPRO_SWITCH_SUBMODULE' && d.targetTab) {
    setFilter(d.targetTab);
  }
});

