// Rule 1: Description must not have leading/trailing spaces and no double spaces
const descriptionRegex = /^\S(?:.*\S)?$/;
// Rule 2: Amount must be a valid positive number with up to 2 decimal places
const amountRegex = /^(0|[1-9]\d*)(\.\d{1,2})?$/;
// Rule 3: Date must follow YYYY-MM-DD format
const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
// Rule 4: Category must only contain letters, spaces, and hyphens
const categoryRegex = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;
// Advanced Rule: Detect duplicate/repeated words (back-reference)
const duplicateWordRegex = /\b(\w+)\s+\1\b/i;

export function validateDescription(value) {
  if (!value || value.trim() === '') {
    return 'Description is required.';
  }
  if (!descriptionRegex.test(value)) {
    return 'Description cannot start or end with spaces.';
  }
  if (duplicateWordRegex.test(value)) {
    return 'Description contains a repeated word (e.g. "the the").';
  }
  return '';
}

export function validateAmount(value) {
  if (value === '' || value === null || value === undefined) {
    return 'Amount is required.';
  }
  if (!amountRegex.test(String(value))) {
    return 'Enter a valid amount (e.g. 12 or 12.50).';
  }
  if (parseFloat(value) <= 0) {
    return 'Amount must be greater than zero.';
  }
  return '';
}

export function validateDate(value) {
  if (!value) {
    return 'Date is required.';
  }
  if (!dateRegex.test(value)) {
    return 'Date must be in YYYY-MM-DD format.';
  }
  return '';
}

export function validateCategory(value) {
  if (!value) {
    return 'Category is required.';
  }
  if (!categoryRegex.test(value)) {
    return 'Category can only contain letters, spaces, or hyphens.';
  }
  return '';
}

export function validateCap(value) {
  if (value === '' || value === null || value === undefined) {
    return 'Please enter a spending cap.';
  }
  if (!amountRegex.test(String(value)) || parseFloat(value) < 0) {
    return 'Cap must be a valid positive number.';
  }
  return '';
}

export function validateImportData(data) {
  if (!Array.isArray(data)) return false;
  return data.every(item =>
    typeof item.id === 'string' &&
    typeof item.description === 'string' &&
    typeof item.amount === 'number' &&
    typeof item.category === 'string' &&
    typeof item.date === 'string' &&
    typeof item.type === 'string'
  );
}