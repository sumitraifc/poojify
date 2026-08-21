export function formatINR(amount = 0) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

export function discountPercent(mrp, price) {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

export function formatDate(date, options = { day: "numeric", month: "short", year: "numeric" }) {
  const d = new Date(date);
  // Use UTC values to avoid timezone shift (e.g. 19T18:30 UTC showing as 20th in IST)
  const utc = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  return utc.toLocaleDateString("en-IN", options);
}
