export type CardBrand = 'Visa' | 'Mastercard'

// Detects card brand from the IIN/BIN prefix (Visa: 4; Mastercard: 51-55 and 2221-2720)
export function detectCardBrand(cardNumber: string): CardBrand | null {
  const digits = cardNumber.replace(/\D/g, '')

  if (/^4/.test(digits)) {
    return 'Visa'
  }

  if (/^5[1-5]/.test(digits) || /^2(2[2-9][1-9]|2[3-9]\d|[3-6]\d{2}|7[01]\d|720)/.test(digits)) {
    return 'Mastercard'
  }

  return null
}
