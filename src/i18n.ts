
export const messages = {
    'en-JM': { income: 'Income', expense: 'Expense', addTx: 'Add transaction' },
    'en-US': { income: 'Income', expense: 'Expense', addTx: 'Add transaction' }
  }
  let locale = navigator.language in messages ? navigator.language : 'en-JM'
  export const t = (key:string) => messages[locale][key] ?? key
  export const setLocale = (l:string)=>{ locale = l }
  