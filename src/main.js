// --- tiny store (localStorage) ---
const KEY = 'budget-app'
function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || { transactions: [] } }
  catch { return { transactions: [] } }
}
function save(state) { localStorage.setItem(KEY, JSON.stringify(state)) }
let state = load()

// --- fmt helpers ---
const fmtMoney = (cents, currency='JMD', locale='en-JM') =>
  new Intl.NumberFormat(locale,{ style:'currency', currency }).format((cents||0)/100)
const fmtDate = iso =>
  new Intl.DateTimeFormat('en-JM',{ year:'numeric', month:'short', day:'2-digit' })
    .format(new Date(iso))

// --- DOM refs ---
const els = {
  tabs: Array.from(document.querySelectorAll('.tab')),
  panels: {
    add: document.getElementById('tab-add'),
    list: document.getElementById('tab-list'),
    reports: document.getElementById('tab-reports'),
    importexport: document.getElementById('tab-importexport')
  },
  form: document.getElementById('tx-form'),
  list: document.getElementById('tx-list'),
  filterQ: document.getElementById('filter-q'),
  filterType: document.getElementById('filter-type'),
  filterCat: document.getElementById('filter-cat'),
  totals: {
    inc: document.getElementById('total-income'),
    exp: document.getElementById('total-expense'),
    net: document.getElementById('total-net')
  },
  exportBtn: document.getElementById('export-btn'),
  importBtn: document.getElementById('import-btn')
}

// --- tabs ---
function show(tab) {
  Object.entries(els.panels).forEach(([k, node]) => {
    if (!node) return
    node.hidden = k !== tab
  })
}
els.tabs.forEach(btn => btn.addEventListener('click', () => show(btn.dataset.tab)))
show('add')

// --- rendering ---
function aggregates(txs) {
  let inc = 0, exp = 0
  txs.forEach(t => t.type === 'income' ? inc += t.amountCents : exp += t.amountCents)
  return { inc, exp, net: inc - exp }
}

function render() {
  const q = (els.filterQ?.value || '').toLowerCase()
  const type = els.filterType?.value || 'all'
  const cat = els.filterCat?.value?.trim() || 'all'

  let txs = [...state.transactions]
  if (q)   txs = txs.filter(t => (t.notes || '').toLowerCase().includes(q))
  if (type !== 'all') txs = txs.filter(t => t.type === type)
  if (cat !== 'all')  txs = txs.filter(t => t.categoryId === cat)

  els.list.innerHTML = txs.map(t => `
    <li class="row" data-id="${t.id}">
      <div>${fmtDate(t.dateISO)} · ${t.categoryId}</div>
      <div>${t.notes || ''}</div>
      <div style="min-width: 120px; text-align:right; ${t.type==='income'?'color:green':'color:#b00'}">
        ${fmtMoney(t.amountCents, t.currency)}
      </div>
      <button class="remove" type="button">Remove</button>
    </li>
  `).join('')

  const { inc, exp, net } = aggregates(state.transactions)
  els.totals.inc.textContent = fmtMoney(inc)
  els.totals.exp.textContent = fmtMoney(exp)
  els.totals.net.textContent = fmtMoney(net)
}

// --- events ---
els.form?.addEventListener('submit', e => {
  e.preventDefault()
  const fd = new FormData(els.form)
  const amount = Number(fd.get('amount') || 0)
  if (!amount) return
  const tx = {
    id: crypto.randomUUID(),
    dateISO: String(fd.get('date') || new Date().toISOString().slice(0,10)),
    type: (fd.get('type') || 'expense'),
    amountCents: Math.round(amount * 100),
    currency: String(fd.get('currency') || 'JMD'),
    categoryId: String(fd.get('category') || 'uncategorized'),
    notes: String(fd.get('notes') || ''),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  state.transactions.unshift(tx)
  save(state)
  els.form.reset()
  render()
})

els.list?.addEventListener('click', e => {
  const btn = e.target.closest?.('.remove')
  if (!btn) return
  const li = btn.closest('li[data-id]')
  const id = li?.getAttribute('data-id')
  if (!id) return
  state.transactions = state.transactions.filter(t => t.id !== id)
  save(state); render()
})

;[els.filterQ, els.filterType, els.filterCat].forEach(el => el?.addEventListener('input', render))

// CSV export/import (very minimal)
els.exportBtn?.addEventListener('click', () => {
  const rows = state.transactions.map(t => ({
    date: t.dateISO, type: t.type, amount: (t.amountCents/100).toFixed(2),
    currency: t.currency, categoryId: t.categoryId, notes: t.notes || ''
  }))
  const header = 'date,type,amount,currency,categoryId,notes\n'
  const body = rows.map(r => `${r.date},${r.type},${r.amount},${r.currency},${r.categoryId},"${(r.notes||'').replace(/"/g,'""')}"`).join('\n')
  const blob = new Blob([header + body], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'transactions.csv'; a.click()
  URL.revokeObjectURL(url)
})

els.importBtn?.addEventListener('change', async () => {
  const file = els.importBtn.files?.[0]; if (!file) return
  const text = await file.text()
  const lines = text.trim().split(/\r?\n/).slice(1) // skip header
  for (const line of lines) {
    const [date, type, amount, currency, categoryId, notesRaw] = parseCSVLine(line)
    state.transactions.unshift({
      id: crypto.randomUUID(),
      dateISO: date, type,
      amountCents: Math.round(parseFloat(amount)*100),
      currency, categoryId,
      notes: notesRaw?.replace(/^"|"$/g,'').replace(/""/g,'"') || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }
  save(state); els.importBtn.value = ''; render()
})

function parseCSVLine(line) {
  // naive CSV parser: splits on commas not inside quotes
  const out = []; let cur = ''; let q = false
  for (const ch of line) {
    if (ch === '"') { q = !q; cur += ch; continue }
    if (ch === ',' && !q) { out.push(cur); cur=''; continue }
    cur += ch
  }
  out.push(cur)
  return out
}

// kick off
render()
