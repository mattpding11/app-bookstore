const WOMPI_SANDBOX_URL = import.meta.env.VITE_WOMPI_SANDBOX_API_URL

export interface TokenizeCardPayload {
  number: string
  cvc: string
  expMonth: string
  expYear: string
  cardHolder: string
}

export interface WompiCardToken {
  id: string
  status: string
  [key: string]: unknown
}

interface WompiTokenResponse {
  status: string
  data: WompiCardToken
}

export async function tokenizeCard(
  payload: TokenizeCardPayload,
): Promise<WompiCardToken> {
  const response = await fetch(`${WOMPI_SANDBOX_URL}/tokens/cards`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_WOMPI_PUBLIC_KEY}`,
    },
    body: JSON.stringify({
      number: payload.number,
      cvc: payload.cvc,
      exp_month: payload.expMonth,
      exp_year: payload.expYear,
      card_holder: payload.cardHolder,
    }),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Card tokenization failed with status ${response.status}: ${body}`)
  }

  const result = (await response.json()) as WompiTokenResponse
  return result.data
}
