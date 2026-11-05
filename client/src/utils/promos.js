// Works out the discount for one promo
export function applyPromo(subtotal, promo) {
  if (!promo) return { discount: 0, total: subtotal };
 
  const raw =
    promo.discountType === 'percentage'
      ? (subtotal * promo.discountValue) / 100
      : promo.discountValue;
 
  const discount = Math.min(raw, subtotal); // never goes below zero
  return { discount, total: subtotal - discount };
}
 
// Picks the promo that applies to a date (the one that saves the most)
export function getActivePromo(promos, date, villaType, subtotal = 0) {
  const valid = promos.filter(
    (p) =>
      p.active !== false &&
      p.startDate <= date &&
      date <= p.endDate && // YYYY-MM-DD text compares correctly
      (!p.villaType || p.villaType === 'all' || p.villaType === villaType)
  );
 
  valid.sort(
    (a, b) => applyPromo(subtotal, b).discount - applyPromo(subtotal, a).discount
  );
  return valid[0] ?? null;
}