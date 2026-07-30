export interface LineCalcResult {
  discount_amount: number;
  line_total_ht: number;
}

export interface TotalsResult {
  total_ht: number;
  tva_amount: number;
  total_ttc: number;
}

export const calculateLine = (
  qty: number,
  price: number,
  discountPct: number
): LineCalcResult => {
  const brut = qty * price;
  const remise = brut * discountPct;
  return { discount_amount: remise, line_total_ht: brut - remise };
};

export const calculateTotals = (
  lines: Array<{ line_total_ht: number }>,
  tvaRate = 0.20
): TotalsResult => {
  const total_ht = lines.reduce((sum, l) => sum + l.line_total_ht, 0);
  const tva_amount = total_ht * tvaRate;
  const total_ttc = total_ht + tva_amount;
  return { total_ht, tva_amount, total_ttc };
};

export const formatMAD = (amount: number): string => {
  return new Intl.NumberFormat('fr-MA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount) + ' MAD';
};
