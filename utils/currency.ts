export function getCurrencySign(currency: string) {
  const upperCurrency = currency.toUpperCase();
  if (upperCurrency === 'USD') return '$';
  if (upperCurrency === 'EUR') return '€';
  if (upperCurrency === 'UAH') return '₴';
  if (upperCurrency === 'PLN') return 'zł';
  return '';
}

export function formatAmount(amount: number, currency: string, forGraph: boolean = false) {
  // Protection against incorrect data
  if (typeof amount !== 'number' || !isFinite(amount)) {
    amount = 0;
  }
  
  const sign = getCurrencySign(currency);
  if (sign) {
    if (currency.toUpperCase() === 'PLN' || currency.toUpperCase() === 'UAH') {
      return `${amount.toFixed(2)}${sign}`;
    }
    return `${sign}${amount.toFixed(2)}`;
  }
  if (forGraph) {
    return amount.toFixed(2);
  }
  return `${amount.toFixed(2)} ${currency}`;
} 