export function formatFlightPrice(amount: number, currency: string): string {
  const cur = currency || 'EUR';
  try {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: cur,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount} ${cur}`;
  }
}
