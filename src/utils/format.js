export function formatINR(amount = 0) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

export function discountPercent(mrp, price) {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

export function formatDate(date, options = { day: "numeric", month: "short", year: "numeric" }) {
  return new Date(date).toLocaleDateString("en-IN", options);
}
