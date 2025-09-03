
export function monthKey(iso:string){ return iso.slice(0,7) } // 'YYYY-MM'

export function categoryTotalsByMonth(transactions) {
  const map = new Map()
  for (const t of transactions) {
    const k = monthKey(t.dateISO)+'|'+t.categoryId
    map.set(k, (map.get(k)||0) + (t.type==='expense' ? -t.amountCents : t.amountCents))
  }
  return map // key -> netCents
}

export function applyRollovers(budgetTargets /* Map<catId, cents> */, totalsMap) {
  // simple example: surplus adds to next month’s available
}
