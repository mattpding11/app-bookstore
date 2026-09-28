import { configureStore } from '@reduxjs/toolkit'
import catalogReducer from './catalogSlice'
import cartReducer, { DELIVERY_DRAFTS_STORAGE_KEY } from './cartSlice'
import transactionReducer from './transactionSlice'

export const store = configureStore({
  reducer: {
    catalog: catalogReducer,
    cart: cartReducer,
    transaction: transactionReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Only per-product delivery drafts are persisted; selection/customer/step reset on refresh by
// design (card data is never persisted, and routing is the source of truth for which product page
// is shown)
let previousDeliveryDrafts = store.getState().cart.deliveryDrafts

store.subscribe(() => {
  const { deliveryDrafts } = store.getState().cart
  if (deliveryDrafts === previousDeliveryDrafts) return
  previousDeliveryDrafts = deliveryDrafts

  try {
    localStorage.setItem(DELIVERY_DRAFTS_STORAGE_KEY, JSON.stringify(deliveryDrafts))
  } catch {
    // localStorage may be unavailable (e.g. private browsing); ignore
  }
})
