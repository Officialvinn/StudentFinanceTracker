import { getMonthTransactions, getTransactions, getCurrencySymbol, convertAmount, getSettings, updateTransaction, deleteTransaction } from './state.js';
import { highlight, compileRegex, filterTransactions } from './search.js';
import { validateDescription, validateAmount, validateDate } from './validators.js';

const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

let sortField = 'date';
let sortAsc = true;

// ─── FORMAT HELPER ────────────────────────────────────────────────────────────
function formatAmount(value) {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function renderDashboard(viewYear, viewMonth) {
  const monthTxs = getMonthTransactions();
  let totalIncome = 0;
  let totalExpenses = 0;

  monthTxs.forEach(tx => {
    if (tx.type === 'income') totalIncome += tx.amount;
    else totalExpenses += tx.amount;
  });

  const savingRate = totalIncome > 0
    ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)
    : 0;

  const symbol = getCurrencySymbol();

  document.getElementById('totalIncome').textContent = symbol + formatAmount(convertAmount(totalIncome));
  document.getElementById('totalExpenses').textContent = symbol + formatAmount(convertAmount(totalExpenses));

  const balance = totalIncome - totalExpenses;
  const balanceEl = document.getElementById('balance');
  balanceEl.textContent = symbol + formatAmount(convertAmount(Math.abs(balance)));
  balanceEl.className = 'card-value ' + (balance < 0 ? 'warning' : 'income');

  document.getElementById('savingRate').textContent = savingRate + '%';

  renderCapWarning(totalExpenses);
  renderCapProgress(totalExpenses);
}

function renderCapWarning(totalExpenses) {
  const { cap } = getSettings();
  const warning = document.getElementById('capWarning');

  if (cap <= 0) {
    warning.className = 'cap-warning';
    warning.textContent = '';
    return;
  }

  const remaining = cap - totalExpenses;
  const symbol = getCurrencySymbol();

  if (totalExpenses > cap) {
    warning.className = 'cap-warning over';
    warning.setAttribute('aria-live', 'assertive');
    warning.textContent = `⚠️ You have exceeded your spending cap by ${symbol}${formatAmount(convertAmount(Math.abs(remaining)))}!`;
  } else {
    warning.className = 'cap-warning under';
    warning.setAttribute('aria-live', 'polite');
    warning.textContent = `✅ You have ${symbol}${formatAmount(convertAmount(remaining))} remaining from your monthly cap.`;
  }
}

function renderCapProgress(totalExpenses) {
  const { cap } = getSettings();
  const card = document.getElementById('capProgressCard');

  if (!cap || cap <= 0) {
    card.style.display = 'none';
    return;
  }

  card.style.display = 'flex';

  const symbol = getCurrencySymbol();
  const converted = convertAmount(totalExpenses);
  const convertedCap = convertAmount(cap);
  const pct = Math.min((totalExpenses / cap) * 100, 100);
  const isOver = totalExpenses > cap;
  const isWarn = pct >= 75 && !isOver;

  document.getElementById('capProgressPct').textContent =
    isOver ? 'Over cap!' : Math.round(pct) + '%';

  const fill = document.getElementById('capProgressFill');
  fill.style.width = pct + '%';
  fill.className = 'cap-progress-bar-fill' +
    (isOver ? ' over' : isWarn ? ' warn' : '');

  const track = document.getElementById('capProgressTrack');
  track.setAttribute('aria-valuenow', Math.round(pct));

  document.getElementById('capProgressSpent').textContent =
    'Spent: ' + symbol + formatAmount(converted);
  document.getElementById('capProgressLimit').textContent =
    'Cap: ' + symbol + formatAmount(convertedCap);
}

export function renderMonthLabel(viewYear, viewMonth) {
  document.getElementById('monthLabel').textContent = monthNames[viewMonth] + ' ' + viewYear;
}

export function updateNextButton(viewYear, viewMonth, currentYear, currentMonth) {
  const nextBtn = document.getElementById('nextMonth');
  nextBtn.disabled = viewYear === currentYear && viewMonth === currentMonth;
}

export function renderTable(searchPattern = '', caseSensitive = false) {
  const body = document.getElementById('recordsBody');
  const emptyRow = document.getElementById('emptyRow');
  const searchError = document.getElementById('searchError');

  const rows = body.querySelectorAll('tr.tx-row');
  rows.forEach(r => r.remove());

  const regex = compileRegex(searchPattern, caseSensitive);

  if (searchPattern && !regex) {
    searchError.textContent = 'Invalid regex pattern.';
  } else {
    searchError.textContent = '';
  }

  let data = getTransactions();
  if (regex) data = filterTransactions(data, regex);

  data = sortData(data);

  if (data.length === 0) {
    emptyRow.style.display = '';
    return;
  }

  emptyRow.style.display = 'none';
  const symbol = getCurrencySymbol();

  data.forEach(tx => {
    const row = document.createElement('tr');
    row.className = 'tx-row';
    row.setAttribute('data-id', tx.id);

    const descHighlight = highlight(tx.description, regex);
    const catHighlight = highlight(tx.category, regex);

    row.innerHTML = `
      <td>${tx.date}</td>
      <td>${descHighlight}</td>
      <td>${catHighlight}</td>
      <td><span class="badge badge-${tx.type}">${tx.type}</span></td>
      <td class="amount-${tx.type}">${symbol}${formatAmount(convertAmount(tx.amount))}</td>
      <td>
        <div class="action-btns">
          <button class="btn-edit" data-id="${tx.id}" aria-label="Edit transaction ${tx.description}">Edit</button>
          <button class="btn btn-danger" data-id="${tx.id}" aria-label="Delete transaction ${tx.description}">Delete</button>
        </div>
      </td>
    `;

    row.querySelector('.btn-edit').addEventListener('click', () => renderEditRow(tx));
    row.querySelector('.btn.btn-danger').addEventListener('click', () => handleDelete(tx.id, tx.description));

    body.appendChild(row);
  });
}

function sortData(data) {
  return data.slice().sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (sortField === 'amount') {
      valA = parseFloat(valA);
      valB = parseFloat(valB);
    } else {
      valA = String(valA).toLowerCase();
      valB = String(valB).toLowerCase();
    }

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });
}

export function setSortField(field) {
  if (sortField === field) {
    sortAsc = !sortAsc;
  } else {
    sortField = field;
    sortAsc = true;
  }

  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-sort') === field);
  });
}

function renderEditRow(tx) {
  const row = document.querySelector(`tr[data-id="${tx.id}"]`);
  if (!row) return;

  row.innerHTML = `
    <td><input class="edit-input" id="edit-date-${tx.id}" type="date" value="${tx.date}"></td>
    <td><input class="edit-input" id="edit-desc-${tx.id}" type="text" value="${tx.description}"></td>
    <td><input class="edit-input" id="edit-cat-${tx.id}" type="text" value="${tx.category}"></td>
    <td><span class="badge badge-${tx.type}">${tx.type}</span></td>
    <td><input class="edit-input" id="edit-amount-${tx.id}" type="number" value="${tx.amount}" step="0.01"></td>
    <td>
      <div class="action-btns">
        <button class="btn btn-primary" id="save-${tx.id}">Save</button>
        <button class="btn btn-secondary" id="cancel-${tx.id}">Cancel</button>
      </div>
    </td>
  `;

  document.getElementById(`save-${tx.id}`).addEventListener('click', () => handleSaveEdit(tx.id));
  document.getElementById(`cancel-${tx.id}`).addEventListener('click', () => renderTable());
}

function handleSaveEdit(id) {
  const desc = document.getElementById(`edit-desc-${id}`).value;
  const amount = document.getElementById(`edit-amount-${id}`).value;
  const date = document.getElementById(`edit-date-${id}`).value;
  const category = document.getElementById(`edit-cat-${id}`).value;

  const descErr = validateDescription(desc);
  const amountErr = validateAmount(amount);
  const dateErr = validateDate(date);

  if (descErr || amountErr || dateErr) {
    alert(descErr || amountErr || dateErr);
    return;
  }

  updateTransaction(id, {
    description: desc.trim(),
    amount: parseFloat(amount),
    date,
    category
  });

  renderTable();
}

function handleDelete(id, description) {
  if (confirm(`Are you sure you want to delete "${description}"?`)) {
    deleteTransaction(id);
    renderTable();
    renderDashboard();
  }
}

export function renderChart() {
  const container = document.getElementById('chartBars');
  container.innerHTML = '';

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }

  const dayLabels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const transactions = getTransactions();

  const totals = days.map(d => {
    const dateStr = d.toISOString().split('T')[0];
    return transactions
      .filter(tx => tx.type === 'expense' && tx.date === dateStr)
      .reduce((sum, tx) => sum + tx.amount, 0);
  });

  const maxVal = Math.max(...totals) || 1;

  days.forEach((d, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'chart-bar-wrap';

    const bar = document.createElement('div');
    bar.className = 'chart-bar';
    bar.style.height = ((totals[i] / maxVal) * 100) + '%';
    bar.title = getCurrencySymbol() + formatAmount(convertAmount(totals[i]));

    const label = document.createElement('div');
    label.className = 'chart-day';
    label.textContent = dayLabels[d.getDay()];

    wrap.appendChild(bar);
    wrap.appendChild(label);
    container.appendChild(wrap);
  });
}

export function showStatus(elementId, message, isError = false) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message;
  el.style.color = isError ? 'var(--danger)' : 'var(--accent)';
  setTimeout(() => { el.textContent = ''; }, 3000);
}

export function setFieldError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (input) input.classList.toggle('invalid', !!message);
  if (error) error.textContent = message;
}