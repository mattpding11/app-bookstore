export interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  stock: number
}

export type DocumentType = 'CC' | 'CE' | 'NIT' | 'PASSPORT'

export interface CustomerInfo {
  email: string
  fullName: string
  phoneNumber: string
  documentType: DocumentType
  documentNumber: string
}

export interface ProcessTransactionPayload {
  productId: string
  customer: CustomerInfo
  paymentToken: string
  deliveryFeeCents: number
}

export interface Transaction {
  id: string
  status: string
  [key: string]: unknown
}

const API_URL = import.meta.env.VITE_API_URL

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Request failed with status ${response.status}: ${body}`)
  }
  return response.json() as Promise<T>
}

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${API_URL}/products`)
  return parseResponse<Product[]>(response)
}

export async function processTransaction(
  payload: ProcessTransactionPayload,
): Promise<Transaction> {
  const response = await fetch(`${API_URL}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return parseResponse<Transaction>(response)
}
