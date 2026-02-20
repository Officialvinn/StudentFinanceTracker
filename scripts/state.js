import { loadTransactions, saveTransactions, loadSettings, saveSettings } from './storage.js';

let transactions = loadTransactions();
let settings = loadSettings();

const today = new Date();
let viewYear = today.getFullYear();
let viewMonth = today.getMonth();

export function getTransactions() { return transactions; }
export function getSettings() { return settings; }
export function getViewYear() { return viewYear; }
export function getViewMonth() { return viewMonth; }
export function getCurrentYear() { return today.getFullYear(); }
export function getCurrentMonth() { return today.getMonth(); }

export function generateId() {
  const count = transactions.length + 1;
  return 'rec_' + String(count).padStart(4, '0');
}

export function addTransaction(tx) {
  transactions.push(tx);
  saveTransactions(transactions);
}

export function deleteTransaction(id) {
  transactions = transactions.filter(tx => tx.id !== id);
  saveTransactions(transactions);
}

export function updateTransaction(id, updates) {
  transactions = transactions.map(tx => {
    if (tx.id === id) {
      return { ...tx, ...updates, updatedAt: new Date().toISOString() };
    }
    return tx;
  });
  saveTransactions(transactions);
}

export function updateSettings(newSettings) {
  settings = { ...settings, ...newSettings };
  saveSettings(settings);
}

export function goToPrevMonth() {
  viewMonth--;
  if (viewMonth < 0) {
    viewMonth = 11;
    viewYear--;
  }
}

export function goToNextMonth() {
  viewMonth++;
  if (viewMonth > 11) {
    viewMonth = 0;
    viewYear++;
  }
}

export function getMonthTransactions() {
  return transactions.filter(tx => {
    const date = new Date(tx.date);
    return date.getFullYear() === viewYear && date.getMonth() === viewMonth;
  });
}

export function getCurrencySymbol() {
  if (settings.currency === 'KSH') return 'KSH ';
  if (settings.currency === 'RWF') return 'RWF ';
  return '$ ';
}

// Convert from USD (stored) → display currency
export function convertAmount(amount) {
  if (settings.currency === 'KSH') return amount * settings.kshRate;
  if (settings.currency === 'RWF') return amount * settings.rwfRate;
  return amount;
}

// Convert from display currency (user input) → USD (stored)
export function reverseConvert(amount) {
  if (settings.currency === 'KSH') return amount / settings.kshRate;
  if (settings.currency === 'RWF') return amount / settings.rwfRate;
  return amount;
}