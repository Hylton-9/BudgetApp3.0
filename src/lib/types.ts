export type Transaction = {
    id: string
    dateISO: string
    type: 'income' | 'expense'
    amountCents: number
    currency: string
    categoryId: string
    notes?: string
    createdAt: string
    updatedAt: string
  }
  export type Category = { id: string; name: string; color?: string }
  export type AppData = {
    schemaVersion: number
    categories: Category[]
    transactions: Transaction[]
  }
  