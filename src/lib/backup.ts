
import { getState } from '../stores/appStore'
import { migrate } from './migrate'
import { writeData } from './db'

export function exportJSON() {
  const blob = new Blob([JSON.stringify(getState(), null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'budget-backup.json'; a.click()
  URL.revokeObjectURL(url)
}

export async function importJSON(file: File) {
  const text = await file.text()
  const data = migrate(JSON.parse(text))
  await writeData(data)
  location.reload()
}
