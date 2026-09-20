/**
 * A shekel amount for display: whole amounts stay plain (`6,400`), anything else gets two decimals
 * (`8,164.80`), so Smoobu's fractional totals never print as `8,164.8`. Only the display is formatted;
 * the reservation keeps Smoobu's exact figure.
 */
export function formatShekels(amount: number): string {
  const whole = Number.isInteger(amount)
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  })
}
