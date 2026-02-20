import { addTransaction, goToPrevMonth, goToNextMonth, getViewYear, getViewMonth, getCurrentYear, getCurrentMonth, generateId, updateSettings, getSettings, getCurrencySymbol, reverseConvert } from './state.js';
import { renderDashboard, renderMonthLabel, updateNextButton, renderTable, renderChart, setSortField, showStatus, setFieldError } from './ui.js';
import { validateDescription, validateAmount, validateDate, validateCap, validateImportData } from './validators.js';
import { loadTransactions, saveTransactions, loadSettings } from './storage.js';

// ─── NAVIGATION HELPER ────────────────────────────────────────────────────────
function navigateTo(page) {
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  const link = document.querySelector(`.nav-link[data-page="${page}"]`);
  const section = document.getElementById('page-' + page);

  if (link) link.classList.add('active');
  if (section) section.classList.add('active');

  if (page === 'records') {
    renderTable();
    renderChart();
  }
}

// ─── UPDATE CURRENCY LABEL ────────────────────────────────────────────────────
function updateCurrencyLabel() {
  const label = document.getElementById('currencyLabel');
  if (label) label.textContent = getCurrencySymbol().trim();
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
function init() {
  const settings = getSettings();

  if (settings.theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.getElementById('themeToggle').checked = true;
  }

  document.getElementById('capInput').value = settings.cap || '';
  document.getElementById('currencySelect').value = settings.currency || 'USD';
  document.getElementById('kshRate').value = settings.kshRate || 130;
  document.getElementById('rwfRate').value = settings.rwfRate || 1300;

  document.getElementById('txDate').value = new Date().toISOString().split('T')[0];

  // Set the currency label on the amount input
  updateCurrencyLabel();

  renderMonthLabel(getViewYear(), getViewMonth());
  updateNextButton(getViewYear(), getViewMonth(), getCurrentYear(), getCurrentMonth());
  renderDashboard(getViewYear(), getViewMonth());
}

// ─── NAVBAR NAVIGATION ────────────────────────────────────────────────────────
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const page = link.getAttribute('data-page');
    navigateTo(page);
  });
});

// ─── CTA LINK ON HOME PAGE ────────────────────────────────────────────────────
document.querySelectorAll('.cta-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const page = link.getAttribute('data-page');
    navigateTo(page);
  });
});

// ─── MONTH NAVIGATION ─────────────────────────────────────────────────────────
document.getElementById('prevMonth').addEventListener('click', () => {
  goToPrevMonth();
  renderMonthLabel(getViewYear(), getViewMonth());
  updateNextButton(getViewYear(), getViewMonth(), getCurrentYear(), getCurrentMonth());
  renderDashboard(getViewYear(), getViewMonth());
});

document.getElementById('nextMonth').addEventListener('click', () => {
  goToNextMonth();
  renderMonthLabel(getViewYear(), getViewMonth());
  updateNextButton(getViewYear(), getViewMonth(), getCurrentYear(), getCurrentMonth());
  renderDashboard(getViewYear(), getViewMonth());
});

// ─── ADD TRANSACTION ──────────────────────────────────────────────────────────
document.getElementById('addTxBtn').addEventListener('click', () => {
  const type = document.getElementById('txType').value;
  const amount = document.getElementById('txAmount').value;
  const description = document.getElementById('txDescription').value;
  const category = document.getElementById('txCategory').value;
  const date = document.getElementById('txDate').value;

  const descErr = validateDescription(description);
  const amountErr = validateAmount(amount);
  const dateErr = validateDate(date);

  setFieldError('txDescription', 'descError', descErr);
  setFieldError('txAmount', 'amountError', amountErr);
  setFieldError('txDate', 'dateError', dateErr);

  if (descErr || amountErr || dateErr) return;

  const now = new Date().toISOString();
  const tx = {
    id: generateId(),
    type,
    // reverseConvert translates the user's currency input back to USD for storage
    amount: reverseConvert(parseFloat(amount)),
    description: description.trim(),
    category,
    date,
    createdAt: now,
    updatedAt: now
  };

  addTransaction(tx);

  // Clear form
  document.getElementById('txAmount').value = '';
  document.getElementById('txDescription').value = '';
  setFieldError('txDescription', 'descError', '');
  setFieldError('txAmount', 'amountError', '');
  setFieldError('txDate', 'dateError', '');

  showStatus('formStatus', '✅ Transaction added successfully!');

  // Redirect to Home after short delay so user sees the success message
  setTimeout(() => {
    navigateTo('home');
    renderDashboard(getViewYear(), getViewMonth());
  }, 1200);
});

// ─── SEARCH ───────────────────────────────────────────────────────────────────
document.getElementById('searchInput').addEventListener('input', () => {
  const pattern = document.getElementById('searchInput').value;
  const caseSensitive = document.getElementById('caseToggle').checked;
  renderTable(pattern, caseSensitive);
});

document.getElementById('caseToggle').addEventListener('change', () => {
  const pattern = document.getElementById('searchInput').value;
  const caseSensitive = document.getElementById('caseToggle').checked;
  renderTable(pattern, caseSensitive);
});

// ─── SORT ─────────────────────────────────────────────────────────────────────
document.querySelectorAll('.sort-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const field = btn.getAttribute('data-sort');
    setSortField(field);
    const pattern = document.getElementById('searchInput').value;
    const caseSensitive = document.getElementById('caseToggle').checked;
    renderTable(pattern, caseSensitive);
  });
});

// ─── SAVE CAP ─────────────────────────────────────────────────────────────────
document.getElementById('saveCap').addEventListener('click', () => {
  const cap = document.getElementById('capInput').value;
  const err = validateCap(cap);

  setFieldError('capInput', 'capError', err);
  if (err) return;

  // Store cap in USD internally
  updateSettings({ cap: reverseConvert(parseFloat(cap)) });
  showStatus('capSaveStatus', '✅ Spending cap saved!');
  renderDashboard(getViewYear(), getViewMonth());
});

// ─── SAVE RATES ───────────────────────────────────────────────────────────────
document.getElementById('saveRates').addEventListener('click', () => {
  updateSettings({
    currency: document.getElementById('currencySelect').value,
    kshRate: parseFloat(document.getElementById('kshRate').value) || 130,
    rwfRate: parseFloat(document.getElementById('rwfRate').value) || 1300
  });

  // Update the currency label on the amount input
  updateCurrencyLabel();

  showStatus('ratesSaveStatus', '✅ Currency settings saved!');
  renderDashboard(getViewYear(), getViewMonth());
  renderTable();
});

// ─── THEME TOGGLE ─────────────────────────────────────────────────────────────
document.getElementById('themeToggle').addEventListener('change', function () {
  const theme = this.checked ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  updateSettings({ theme });
});

// ─── EXPORT ───────────────────────────────────────────────────────────────────
document.getElementById('exportBtn').addEventListener('click', () => {
  const data = loadTransactions();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ledger_backup.json';
  a.click();
  URL.revokeObjectURL(url);
});

// ─── IMPORT ───────────────────────────────────────────────────────────────────
document.getElementById('importFile').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = evt => {
    try {
      const data = JSON.parse(evt.target.result);
      if (!validateImportData(data)) {
        showStatus('importStatus', '❌ Invalid file structure.', true);
        return;
      }
      saveTransactions(data);
      showStatus('importStatus', `✅ Imported ${data.length} transactions!`);
      renderDashboard(getViewYear(), getViewMonth());
    } catch {
      showStatus('importStatus', '❌ Could not read file. Make sure it is valid JSON.', true);
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});

init();