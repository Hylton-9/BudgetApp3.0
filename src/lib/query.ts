
export function filterTransactions(txs, { q='', categoryId='all', from, to, type='all' }) {
    return txs.filter(t => {
      if (categoryId!=='all' && t.categoryId!==categoryId) return false
      if (type!=='all' && t.type!==type) return false
      if (from && t.dateISO < from) return false
      if (to && t.dateISO > to) return false
      if (q) {
        const hay = (t.notes || '').toLowerCase()
        if (!hay.includes(q.toLowerCase())) return false
      }
      return true
    }).sort((a,b)=> b.dateISO.localeCompare(a.dateISO))
  }
  