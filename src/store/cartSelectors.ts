import type { RootState } from './store'

// Atomic selectors (rule 5.9/5.10): each component subscribes only to the field it renders
export const selectCheckoutStep = (state: RootState) => state.cart.step
export const selectSelectedProduct = (state: RootState) => state.cart.selectedProduct
export const selectCustomer = (state: RootState) => state.cart.customer
export const selectDelivery = (state: RootState) => state.cart.delivery

export const selectDeliveryDraft = (productId: string) => (state: RootState) =>
  state.cart.deliveryDrafts[productId]
