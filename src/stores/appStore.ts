
import { migrate } from '../lib/migrate'
import { readData, writeData } from '../lib/db'
import { nanoid } from 'nanoid' // npm i nanoid

let state = migrate(await readData())

export const getState = () => state
export async function save() { await writeData(state) }

export async function addTransaction(t) {
  const tx = { id: nanoid(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...t }
  state.transactions.unshift(tx)
  await save()
  return tx
}
export async function updateTransaction(id, patch) {
  const i = state.transactions.findIndex(t=>t.id===id)
  if (i>-1) {
    state.transactions[i] = { ...state.transactions[i], ...patch, updatedAt: new Date().toISOString() }
    await save()
  }
}
export async function removeTransaction(id) {
  state.transactions = state.transactions.filter(t=>t.id!==id)
  await save()
}
