
import { openDB } from 'idb'
const DB_NAME = 'budget-app'
const STORE = 'app-data'

export const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) { db.createObjectStore(STORE) }
})

export async function readData() {
  return (await dbPromise).get(STORE, 'root')
}
export async function writeData(data:any) {
  return (await dbPromise).put(STORE, data, 'root')
}
