
import type { AppData } from './types'

const LATEST = 2

export function migrate(raw: any): AppData {
  let data = raw || { schemaVersion: 0, categories: [], transactions: [] }

  if (data.schemaVersion < 1) {
    // v1: add currency default
    data.transactions = data.transactions.map((t:any)=>({ currency: 'JMD', ...t }))
    data.schemaVersion = 1
  }

  if (data.schemaVersion < 2) {
    // v2: normalize amountCents if numbers were floats
    data.transactions = data.transactions.map((t:any)=>({
      ...t,
      amountCents: Math.round(Number(t.amountCents ?? (t.amount*100)))
    }))
    data.schemaVersion = 2
  }

  return data as AppData
}

export const LATEST_SCHEMA = LATEST
