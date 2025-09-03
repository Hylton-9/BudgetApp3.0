
export type Transaction = {
    id: string
    dateISO: string        // '2025-09-02'
    type: 'income' | 'expense'
    amountCents: number    // store cents not floats
    currency: string       // 'JMD' | 'USD'
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
  