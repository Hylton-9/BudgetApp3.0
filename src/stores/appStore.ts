import { nanoid } from 'nanoid'
import { readData, writeData } from '../lib/db'
import { migrate } from '../lib/migrate'
import type { AppData, Transaction, Category } from '../lib/types'

let state: AppData = migrate(await readData())
if (!state.categories?.length) {
  state.categories = [
    { id: 'income', name: 'Income' },
    { id: 'groceries', name: 'Groceries' },
    { id: 'bills', name: 'Bills' },
    { id: 'entertainment', name: 'Entertainment' },
    { id: 'uncategorized', name: 'Uncategorized' }
  ]
}

const save = async()=> writeData(state)
export const getState = ()=> state

export async function addTransaction(input: Omit<Transaction,'id'|'createdAt'|'updatedAt'>) {
  const now = new Date().toISOString()
  const tx: Transaction = { id: nanoid(), createdAt: now, updatedAt: now, ...input }
  state.transactions.unshift(tx); await save(); return tx
}
export async function updateTransaction(id:string, patch: Partial<Transaction>) {
  const i = state.transactions.findIndex(t=>t.id===id); if (i<0) return
  state.transactions[i] = { ...state.transactions[i], ...patch, updatedAt: new Date().toISOString() }
  await save()
}
export async function removeTransaction(id:string) {
  state.transactions = state.transactions.filter(t=>t.id!==id); await save()
}
export async function addCategory(cat:Category){ state.categories.push(cat); await save() }
