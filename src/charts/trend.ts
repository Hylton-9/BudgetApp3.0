
import { Chart } from 'chart.js/auto'

export function renderMonthlyTrend(ctx, transactions) {
  // aggregate to YYYY-MM income/expense and draw a line or bar chart
  const map = new Map()
  for (const t of transactions) {
    const m = t.dateISO.slice(0,7)
    const key = m + '|' + t.type
    map.set(key, (map.get(key)||0) + t.amountCents)
  }
  const months = Array.from(new Set(Array.from(map.keys()).map(k=>k.split('|')[0]))).sort()
  const income = months.map(m=> map.get(m+'|income')||0).map(v=>v/100)
  const expense = months.map(m=> map.get(m+'|expense')||0).map(v=>v/100)

  new Chart(ctx, {
    type: 'bar',
    data: { labels: months, datasets: [{ label:'Income', data: income }, { label:'Expenses', data: expense }] },
    options: { responsive: true, maintainAspectRatio: false }
  })
}
