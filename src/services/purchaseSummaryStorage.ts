import { decryptValue, encryptValue } from '../utils/secureStorage'
import type { CustomerInfo, DeliveryInfo, Product } from './api'

const STORAGE_PREFIX = 'bookstore-summary:'

export interface PurchaseSummary {
  reference: string
  status: string
  product: Product
  customer: CustomerInfo
  delivery: DeliveryInfo
  baseFeeCents: number
  deliveryFeeCents: number
  totalCents: number
  createdAt: string
}

function getPassphrase(): string {
  const passphrase = import.meta.env.VITE_SECRET_LOCAL_STORAGE
  if (!passphrase) {
    throw new Error('VITE_SECRET_LOCAL_STORAGE is not configured')
  }
  return passphrase
}

export async function savePurchaseSummary(summary: PurchaseSummary): Promise<void> {
  const encrypted = await encryptValue(summary, getPassphrase())
  localStorage.setItem(`${STORAGE_PREFIX}${summary.reference}`, encrypted)
}

export async function loadPurchaseSummary(reference: string): Promise<PurchaseSummary | null> {
  const raw = localStorage.getItem(`${STORAGE_PREFIX}${reference}`)
  if (!raw) return null

  return decryptValue<PurchaseSummary>(raw, getPassphrase())
}
