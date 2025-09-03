
export const fmtMoney = (cents:number, currency='JMD', locale='en-JM') =>
    new Intl.NumberFormat(locale,{ style:'currency', currency }).format(cents/100)
  
  export const fmtDate = (iso:string, locale='en-JM') =>
    new Intl.DateTimeFormat(locale,{ year:'numeric', month:'short', day:'2-digit' }).format(new Date(iso))
  