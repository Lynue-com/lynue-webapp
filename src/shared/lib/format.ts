export function formatCurrency(amount?: number | null) {
  if (!amount && amount !== 0) {
    return "Price on request";
  }

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function compactNumber(value?: number | null) {
  if (!value && value !== 0) {
    return "-";
  }

  return new Intl.NumberFormat("en-NG", {
    notation: "compact",
  }).format(value);
}
