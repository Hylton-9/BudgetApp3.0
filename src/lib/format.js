export const fmtMoney = (n) =>
  `$${(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export const todayISO = () => new Date().toISOString().split("T")[0];
