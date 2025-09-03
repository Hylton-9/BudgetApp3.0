
import Papa from 'papaparse'

export function exportCSV(transactions) {
  const rows = transactions.map(t => ({
    date: t.dateISO,
    type: t.type,
    amount: (t.amountCents/100).toFixed(2),
    currency: t.currency,
    categoryId: t.categoryId,
    notes: t.notes || ''
  }))
  const csv = Papa.unparse(rows)
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'transactions.csv'; a.click()
  URL.revokeObjectURL(url)
}

export function importCSV(file, defaults={currency:'JMD'}) {
  return new Promise((resolve,reject)=>{
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({data})=>{
        const txs = data.map(r => ({
          dateISO: r.date,
          type: r.type?.toLowerCase()==='income' ? 'income' : 'expense',
          amountCents: Math.round(parseFloat(r.amount)*100),
          currency: r.currency || defaults.currency,
          categoryId: r.categoryId || 'uncategorized',
          notes: r.notes || ''
        }))
        resolve(txs)
      },
      error: reject
    })
  })
}
