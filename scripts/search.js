export function compileRegex(input, caseSensitive = false) {
  if (!input || input.trim() === '') return null;
  try {
    const flags = caseSensitive ? '' : 'i';
    return new RegExp(input, flags);
  } catch {
    return null;
  }
}

export function highlight(text, regex) {
  if (!regex) return escapeHtml(text);
  return escapeHtml(text).replace(regex, match => `<mark>${match}</mark>`);
}

export function filterTransactions(transactions, regex) {
  if (!regex) return transactions;
  return transactions.filter(tx =>
    regex.test(tx.description) ||
    regex.test(tx.category) ||
    regex.test(tx.date) ||
    regex.test(String(tx.amount))
  );
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}