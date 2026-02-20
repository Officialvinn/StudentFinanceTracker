const TRANSACTIONS_KEY = 'ledger:transactions';
const SETTINGS_KEY = 'ledger:settings';

export function loadTransactions() {
  try {
    return JSON.parse(localStorage.getItem(TRANSACTIONS_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveTransactions(transactions) {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
}

export function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {
      cap: 0,
      currency: 'USD',
      kshRate: 130,
      rwfRate: 1300,
      theme: 'light'
    };
  } catch {
    return {
      cap: 0,
      currency: 'USD',
      kshRate: 130,
      rwfRate: 1300,
      theme: 'light'
    };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}