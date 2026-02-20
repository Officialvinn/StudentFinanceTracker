# Ledger — Student Finance Tracker

A responsive, accessible, vanilla HTML/CSS/JS personal finance tracker built for students. Track income and expenses, set monthly spending caps, search records with regex, and manage your finances entirely in the browser.
 
🌐 **Live Demo:**  https://officialvinn.github.io/studentfinancetracker/
🎥 **Demo Video:** [https://youtu.be/_LiYgxZUn2w

---

## Theme
**Student Finance Tracker** — budgets, transactions, search

---

## Features

- Add, edit, and delete income/expense transactions
- Dashboard with total income, total expenses, balance, and saving rate
- Monthly spending cap with progress bar (green → orange → red)
- Live regex search with match highlighting and case-sensitive toggle
- Sort records by date, description (A↕Z), or amount
- Dark/Light theme toggle (persisted to localStorage)
- Currency support: USD, KSH, RWF with manual exchange rates
- JSON import/export with structure validation
- Fully responsive across mobile, tablet, and desktop
- Accessible — keyboard navigable, ARIA live regions, skip link

---

## File Structure

```
studentfinancetracker/
├── index.html              # Main HTML — all pages/sections
├── styles/
│   └── main.css            # Mobile-first CSS with variables and animations
├── scripts/
│   ├── app.js              # Entry point — event handlers, navigation, init
│   ├── ui.js               # DOM rendering — dashboard, table, chart, progress bar
│   ├── state.js            # In-memory state, CRUD, currency helpers
│   ├── storage.js          # localStorage read/write
│   ├── validators.js       # All regex validation rules
│   └── search.js           # Regex compiler, filter, highlight
├── assets/
│   └── logo-placeholder.png
└── seed.json               # 12 sample transactions for testing
```

---

## How to Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/YOURUSERNAME/studentfinancetracker.git
   ```
2. Open the folder in VS Code
3. Install the **Live Server** extension (by Ritwick Dey)
4. Right-click `index.html` → **Open with Live Server**
5. App opens at `http://127.0.0.1:5500`

> ⚠️ Must be run via a local server (not opened directly as a file) due to ES module imports.

---

## Regex Catalog

| Rule | Pattern | Purpose | Example Input |
|------|---------|---------|---------------|
| Description | `/^\S(?:.*\S)?$/` | No leading/trailing spaces | `"Lunch"` ✅ `" Lunch "` ❌ |
| Amount | `/^(0\|[1-9]\d*)(\.\d{1,2})?$/` | Valid positive number, up to 2 decimals | `"12.50"` ✅ `"12.999"` ❌ |
| Date | `/^\d{4}-(0[1-9]\|1[0-2])-(0[1-9]\|[12]\d\|3[01])$/` | YYYY-MM-DD format | `"2026-02-01"` ✅ `"01-02-2026"` ❌ |
| Category | `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/` | Letters, spaces, hyphens only | `"Food"` ✅ `"Food2"` ❌ |
| Duplicate word *(advanced)* | `/\b(\w+)\s+\1\b/i` | Back-reference catches repeated words | `"the the lunch"` ❌ |

### Example Search Patterns (Records page)
| Pattern | What it finds |
|---------|--------------|
| `food` | Any record mentioning food |
| `^Lunch` | Descriptions starting with "Lunch" |
| `\.\d{2}` | Amounts with cents |
| `(coffee\|tea)` | Records with coffee or tea |
| `\b(\w+)\s+\1\b` | Descriptions with duplicate words |

---

## Keyboard Map

| Key | Action |
|-----|--------|
| `Tab` | Move focus forward through interactive elements |
| `Shift + Tab` | Move focus backward |
| `Enter` / `Space` | Activate focused button or link |
| `Tab` to skip link → `Enter` | Skip header and jump to main content |
| Arrow keys | Navigate month back/forward (when buttons focused) |

---

## Accessibility Notes

- **Semantic landmarks:** `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>` used throughout
- **Skip link:** "Skip to main content" visible on focus at top of page
- **ARIA live regions:**
  - Cap warning uses `aria-live="polite"` when under cap, `aria-live="assertive"` when exceeded
  - Form status, errors, and table updates use `role="status"` or `role="alert"`
- **Labels:** All inputs have associated `<label>` elements
- **Focus styles:** Visible `:focus-visible` outline using accent color
- **Color contrast:** Tested against WCAG AA — muted text on light/dark backgrounds
- **Keyboard flow:** Full add, edit, delete, search, sort, and settings flow without a mouse

---

## Development Milestones

- **M1:** Planned data model (`id`, `description`, `amount`, `category`, `date`, `createdAt`, `updatedAt`), wireframes, and accessibility plan
- **M2:** Built semantic HTML structure with all sections, mobile-first base CSS, Flexbox layout
- **M3:** Implemented 5 regex validation rules (including back-reference advanced rule), inline error messages
- **M4:** Rendered records table, sorting by date/description/amount, live regex search with safe compiler and `<mark>` highlighting
- **M5:** Dashboard stats (income, expenses, balance, saving rate), spending cap logic, ARIA live cap warning, cap progress bar
- **M6:** localStorage persistence, JSON import/export with structure validation, currency settings (USD/KSH/RWF) with manual rates
- **M7:** Dark mode toggle, responsive polish across 3 breakpoints, keyboard audit, skip link, focus styles, fade animations

---

## Data Model

```json
{
  "id": "rec_0001",
  "type": "income",
  "description": "Monthly salary from part-time job",
  "amount": 450.00,
  "category": "Salary",
  "date": "2026-02-01",
  "createdAt": "2026-02-01T08:00:00.000Z",
  "updatedAt": "2026-02-01T08:00:00.000Z"
}
```

---

## Import/Export

- **Export:** Click "Export JSON" in Settings to download all transactions as `ledger_backup.json`
- **Import:** Click "Import JSON" and select a `.json` file — the app validates structure before loading
- Use `seed.json` included in the repo to load 12 sample transactions for testing

---

## Academic Integrity

This project was built individually. AI tools were used only for documentation assistance and seed data generation. All HTML, CSS, and JavaScript logic is original work.
