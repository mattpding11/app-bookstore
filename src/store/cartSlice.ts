import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { CustomerInfo, DeliveryInfo, Product } from '../services/api'

// 1. product -> 2. detail (delivery, routed) -> 3. payment (card + customer, modal) -> 4. summary (modal)
export type CheckoutStep = 'product' | 'detail' | 'payment' | 'summary'

export const DELIVERY_DRAFTS_STORAGE_KEY = 'bookstore-delivery-drafts'

interface CartState {
  step: CheckoutStep
  selectedProduct: Product | null
  customer: CustomerInfo | null
  delivery: DeliveryInfo | null
  // Per-product delivery drafts, persisted so they survive a refresh on /detalle/:productId
  deliveryDrafts: Record<string, DeliveryInfo>
}

function loadDeliveryDrafts(): Record<string, DeliveryInfo> {
  try {
    const raw = localStorage.getItem(DELIVERY_DRAFTS_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, DeliveryInfo>) : {}
  } catch {
    return {}
  }
}

const initialState: CartState = {
  step: 'product',
  selectedProduct: null,
  customer: null,
  delivery: null,
  deliveryDrafts: loadDeliveryDrafts(),
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    selectProduct(state, action: PayloadAction<Product>) {
      state.selectedProduct = action.payload
      state.customer = null
      state.delivery = null
      state.step = 'detail'
    },
    saveDeliveryDraft(state, action: PayloadAction<{ productId: string; delivery: DeliveryInfo }>) {
      state.deliveryDrafts[action.payload.productId] = action.payload.delivery
    },
    setDelivery(state, action: PayloadAction<DeliveryInfo>) {
      state.delivery = action.payload
      state.step = 'payment'
    },
    setCustomer(state, action: PayloadAction<CustomerInfo>) {
      state.customer = action.payload
      state.step = 'summary'
    },
    backToDetail(state) {
      state.step = 'detail'
    },
    backToPayment(state) {
      state.step = 'payment'
    },
    backToProduct(state) {
      state.selectedProduct = null
      state.customer = null
      state.delivery = null
      state.step = 'product'
    },
  },
})

export const {
  selectProduct,
  saveDeliveryDraft,
  setDelivery,
  setCustomer,
  backToDetail,
  backToPayment,
  backToProduct,
} = cartSlice.actions

export default cartSlice.reducer
