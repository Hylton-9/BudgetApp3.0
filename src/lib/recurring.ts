
export type Recurrence = { id:string; rule:'monthly'|'weekly'; day?:number; weekday?:number; template:any; lastApplied?:string }

export function dueDatesSince(lastISO:string, nowISO:string, r:Recurrence) {
  const out:string[] = []
  const d = new Date(lastISO); const now = new Date(nowISO)
  const step = new Date(d)
  while (step <= now) {
    if (r.rule==='monthly') step.setMonth(step.getMonth()+1)
    else step.setDate(step.getDate()+7)
    if (step <= now) out.push(step.toISOString().slice(0,10))
  }
  return out
}
