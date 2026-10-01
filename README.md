# Library Management System (BCA Final Project)

A working, static library management system for a college library \u2014 book catalog, member registry, issue/return workflow with automatic fine calculation, and transaction history. Runs entirely in the browser, hosted free on GitHub Pages.

**Live demo:** https://YOUR-USERNAME.github.io/library-management-system/

## Features
- **Books:** add, delete, search by title/author/ISBN, live available-copies count.
- **Members:** add, delete, search by name or roll/staff number.
- **Issue / Return:** issue a book to a member with a due date; returning it automatically calculates a late fine (\u20b92/day).
- **History:** full log of every transaction, including fines charged.
- **Dashboard:** live counts of titles, total copies, books issued, overdue, and members.

## Run locally
Open `index.html` in a browser. No build step, no dependencies.

## Deploy on GitHub Pages
1. Create a public GitHub repo named `library-management-system`.
2. Upload `index.html`, `style.css`, `app.js`, and this `README.md` to the repo root.
3. Go to **Settings \u2192 Pages**, set Source to **Deploy from a branch**, branch `main`, folder `/root`, then Save.
4. After a minute, your live link appears at `https://YOUR-USERNAME.github.io/library-management-system/`.

## Data and limits
Data is saved in `localStorage`, so it's private to one browser and not shared across devices \u2014 fine for a demo or classroom walkthrough, not for real library records. Clearing browser data erases it.

## Natural next steps for a fuller version
- A shared backend (Firebase/Supabase or a small PHP+MySQL API) so the catalog is the same for every user.
- Barcode/ISBN scanning for faster book entry (same technique as the QR scanning in the robotics-lab-tracker project).
- Admin login so only librarians can add/delete books and members.
- Overdue-notice emails and a printable fine receipt.

## Tech stack
HTML, CSS, vanilla JavaScript. No framework, no backend \u2014 kept deliberately simple so the whole project is easy to read and explain in a viva.
