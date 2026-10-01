"use strict";
const KEY = "libraryMS.v1";
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const day = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const today = () => day(0);

function seed() {
  return {
    nid: 100,
    books: [
      { id: 1, title: "Introduction to Algorithms", author: "Cormen et al.", isbn: "9780262033848", cat: "Computer Science", total: 4 },
      { id: 2, title: "Database System Concepts", author: "Silberschatz", isbn: "9780073523323", cat: "Computer Science", total: 3 },
      { id: 3, title: "Clean Code", author: "Robert C. Martin", isbn: "9780132350884", cat: "Software Engineering", total: 2 },
      { id: 4, title: "Operating System Concepts", author: "Silberschatz", isbn: "9781118063330", cat: "Computer Science", total: 3 },
      { id: 5, title: "Wings of Fire", author: "A. P. J. Abdul Kalam", isbn: "9788173711466", cat: "Biography", total: 5 },
    ],
    members: [
      { id: 1, name: "Priya Sharma", rno: "BCA2301", type: "Student", email: "priya@example.com" },
      { id: 2, name: "Rahul Nair", rno: "BCA2314", type: "Student", email: "rahul@example.com" },
      { id: 3, name: "Dr. Anjali Rao", rno: "F-112", type: "Faculty", email: "anjali@example.com" },
    ],
    txns: [
      { id: 1, bookId: 1, memberId: 1, issued: day(-10), due: day(-3), returned: null, fine: 0 },
      { id: 2, bookId: 3, memberId: 2, issued: day(-4), due: day(10), returned: null, fine: 0 },
      { id: 3, bookId: 2, memberId: 3, issued: day(-20), due: day(-13), returned: day(-12), fine: 0 },
    ],
  };
}
let S;
function load() { try { const r = localStorage.getItem(KEY); S = r ? JSON.parse(r) : seed(); } catch (e) { S = seed(); } }
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

const FINE_PER_DAY = 2;
const book = id => S.books.find(b => b.id === id) || { title: "(removed book)" };
const member = id => S.members.find(m => m.id === id) || { name: "(removed member)" };
const activeTxns = () => S.txns.filter(t => !t.returned);
const issuedCount = bookId => activeTxns().filter(t => t.bookId === bookId).length;
const available = b => b.total - issuedCount(b.id);

function renderStats() {
  const active = activeTxns();
  const overdue = active.filter(t => t.due < today()).length;
  $("stats").innerHTML = `
    <div class="chip"><b>${S.books.length}</b>Titles</div>
    <div class="chip"><b>${S.books.reduce((a, b) => a + b.total, 0)}</b>Total copies</div>
    <div class="chip"><b>${active.length}</b>Issued</div>
    <div class="chip ${overdue ? 'bad' : ''}"><b>${overdue}</b>Overdue</div>
    <div class="chip"><b>${S.members.length}</b>Members</div>`;
}

let tab = "books";
function renderToolbar() {
  const tb = $("toolbar");
  if (tab === "books") {
    tb.innerHTML = `<input id="q" type="search" placeholder="Search title, author or ISBN"><button class="btn" id="addBook">Add book</button>`;
    $("q").oninput = render; $("addBook").onclick = () => { $("fBook").reset(); $("bTitle").textContent = "Add book"; fBookMode = "add"; $("dBook").showModal(); };
  } else if (tab === "members") {
    tb.innerHTML = `<input id="q" type="search" placeholder="Search name or roll number"><button class="btn" id="addMember">Add member</button>`;
    $("q").oninput = render; $("addMember").onclick = () => { $("fMember").reset(); $("dMember").showModal(); };
  } else if (tab === "issue") {
    tb.innerHTML = `<button class="btn" id="newIssue">Issue a book</button>`;
    $("newIssue").onclick = openIssueDialog;
  } else {
    tb.innerHTML = `<input id="q" type="search" placeholder="Search by book or member">`;
    $("q").oninput = render;
  }
}

function render() {
  renderStats();
  const v = $("view"), q = ($("q") && $("q").value || "").toLowerCase();
  if (tab === "books") {
    const rows = S.books.filter(b => (b.title + " " + b.author + " " + b.isbn).toLowerCase().includes(q));
    v.innerHTML = rows.length ? `<table><thead><tr><th>Title</th><th>Author</th><th>Category</th><th>Available</th><th></th></tr></thead><tbody>` +
      rows.map(b => { const av = available(b);
        return `<tr><td><b>${esc(b.title)}</b><br><span class="pill">${esc(b.isbn || "no ISBN")}</span></td><td>${esc(b.author)}</td><td>${esc(b.cat || "-")}</td>` +
        `<td><span class="pill ${av ? 'ok' : 'out'}">${av} of ${b.total}</span></td><td><button class="btn ghost sm" data-delbook="${b.id}">Delete</button></td></tr>`;
      }).join("") + `</tbody></table>` : `<div class="empty">No books match. Try a different search or add one.</div>`;
  } else if (tab === "members") {
    const rows = S.members.filter(m => (m.name + " " + m.rno).toLowerCase().includes(q));
    v.innerHTML = rows.length ? `<table><thead><tr><th>Name</th><th>Roll / Staff No.</th><th>Type</th><th>Contact</th><th></th></tr></thead><tbody>` +
      rows.map(m => `<tr><td><b>${esc(m.name)}</b></td><td>${esc(m.rno)}</td><td>${esc(m.type)}</td><td>${esc(m.email || "-")}</td><td><button class="btn ghost sm" data-delmember="${m.id}">Delete</button></td></tr>`).join("") +
      `</tbody></table>` : `<div class="empty">No members match.</div>`;
  } else if (tab === "issue") {
    const rows = activeTxns().sort((a, b) => a.due < b.due ? -1 : 1);
    v.innerHTML = rows.length ? `<table><thead><tr><th>Book</th><th>Member</th><th>Due</th><th></th></tr></thead><tbody>` +
      rows.map(t => { const overdue = t.due < today();
        return `<tr><td>${esc(book(t.bookId).title)}</td><td>${esc(member(t.memberId).name)}</td>` +
        `<td class="${overdue ? 'late' : ''}">${overdue ? 'Overdue since ' : ''}${t.due}</td><td><button class="btn sm" data-return="${t.id}">Return</button></td></tr>`;
      }).join("") + `</tbody></table>` : `<div class="empty">Nothing is currently issued.</div>`;
  } else {
    const rows = S.txns.slice().reverse().filter(t => (book(t.bookId).title + " " + member(t.memberId).name).toLowerCase().includes(q));
    v.innerHTML = rows.length ? `<table><thead><tr><th>Book</th><th>Member</th><th>Issued</th><th>Due</th><th>Returned</th><th>Fine</th></tr></thead><tbody>` +
      rows.map(t => `<tr><td>${esc(book(t.bookId).title)}</td><td>${esc(member(t.memberId).name)}</td><td>${t.issued}</td><td>${t.due}</td>` +
        `<td>${t.returned || "Still out"}</td><td>${t.fine ? '\u20b9' + t.fine : '-'}</td></tr>`).join("") +
      `</tbody></table>` : `<div class="empty">No transaction history yet.</div>`;
  }
}

function switchTab(t) { tab = t; document.querySelectorAll(".tab").forEach(b => b.setAttribute("aria-selected", b.dataset.t === t)); renderToolbar(); render(); }
document.querySelectorAll(".tab").forEach(b => b.onclick = () => switchTab(b.dataset.t));

function openIssueDialog() {
  const freeBooks = S.books.filter(b => available(b) > 0);
  $("iBook").innerHTML = freeBooks.map(b => `<option value="${b.id}">${esc(b.title)} (${available(b)} free)</option>`).join("") || `<option value="">No copies available</option>`;
  $("iMember").innerHTML = S.members.map(m => `<option value="${m.id}">${esc(m.name)} \u2014 ${esc(m.rno)}</option>`).join("");
  $("iDue").min = today(); $("iDue").value = day(14);
  $("dIssue").showModal();
}

let fBookMode = "add";
$("fBook").onsubmit = () => {
  S.books.push({ id: ++S.nid, title: $("bT").value.trim(), author: $("bA").value.trim(), isbn: $("bI").value.trim(), cat: $("bC").value.trim(), total: Math.max(1, +$("bQ").value) });
  save(); render();
};
$("fMember").onsubmit = () => {
  S.members.push({ id: ++S.nid, name: $("mN").value.trim(), rno: $("mR").value.trim(), type: $("mTy").value, email: $("mE").value.trim() });
  save(); render();
};
$("fIssue").onsubmit = () => {
  const bookId = +$("iBook").value, memberId = +$("iMember").value, due = $("iDue").value;
  if (!bookId) return;
  S.txns.push({ id: ++S.nid, bookId, memberId, issued: today(), due, returned: null, fine: 0 });
  save(); render();
};

document.addEventListener("click", e => {
  const t = e.target;
  if (t.hasAttribute("data-close")) { t.closest("dialog").close(); return; }
  if (t.dataset.delbook) {
    const id = +t.dataset.delbook;
    if (issuedCount(id)) return alert("This book has copies issued. Wait for returns before deleting.");
    if (confirm("Delete this book from the catalog?")) { S.books = S.books.filter(b => b.id !== id); save(); render(); }
    return;
  }
  if (t.dataset.delmember) {
    const id = +t.dataset.delmember;
    if (activeTxns().some(tx => tx.memberId === id)) return alert("This member has a book issued. Wait for its return before deleting.");
    if (confirm("Delete this member?")) { S.members = S.members.filter(m => m.id !== id); save(); render(); }
    return;
  }
  if (t.dataset.return) {
    const tx = S.txns.find(x => x.id === +t.dataset.return);
    if (!tx) return;
    tx.returned = today();
    const lateDays = Math.max(0, Math.round((new Date(tx.returned) - new Date(tx.due)) / 864e5));
    tx.fine = lateDays * FINE_PER_DAY;
    save(); render();
  }
});

load(); switchTab("books");
