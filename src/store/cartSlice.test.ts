import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CustomerInfo, DeliveryInfo, Product } from '../services/api'

const STORAGE_KEY = 'bookstore-delivery-drafts'

function createProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p1',
    title: 'Test Book',
    description: 'A test book',
    priceCents: 1000,
    currency: 'COP',
    imageUrl: 'https://example.com/image.jpg',
    stock: 5,
    isActive: true,
    ...overrides,
  }
}

const customer: CustomerInfo = {
  email: 'reader@example.com',
  fullName: 'Jane Reader',
  phoneNumber: '3000000000',
  documentType: 'CC',
  documentNumber: '123456789',
}

const delivery: DeliveryInfo = {
  addressLine: 'Calle 123 #45-67',
  city: 'Bogotá',
  region: 'Cundinamarca',
}

beforeEach(() => {
  localStorage.clear()
  vi.resetModules()
})

describe('cartSlice initial state', () => {
  it('starts with empty delivery drafts when localStorage is empty', async () => {
    const { default: cartReducer } = await import('./cartSlice')

    const state = cartReducer(undefined, { type: '@@INIT' })

    expect(state).toEqual({
      step: 'product',
      selectedProduct: null,
      customer: null,
      delivery: null,
      deliveryDrafts: {},
    })
  })

  it('loads previously persisted delivery drafts from localStorage', async () => {
    const stored = { p1: delivery }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))

    const { default: cartReducer } = await import('./cartSlice')
    const state = cartReducer(undefined, { type: '@@INIT' })

    expect(state.deliveryDrafts).toEqual(stored)
  })

  it('falls back to an empty object when localStorage contains invalid JSON', async () => {
    localStorage.setItem(STORAGE_KEY, '{not-json')

    const { default: cartReducer } = await import('./cartSlice')
    const state = cartReducer(undefined, { type: '@@INIT' })

    expect(state.deliveryDrafts).toEqual({})
  })
})

describe('cartSlice reducers', () => {
  it('selectProduct sets the product, resets customer/delivery, and moves to the detail step', async () => {
    const { default: cartReducer, selectProduct } = await import('./cartSlice')
    const product = createProduct()
    const initialState = cartReducer(undefined, { type: '@@INIT' })
    const previousState = { ...initialState, customer, delivery, step: 'summary' as const }

    const state = cartReducer(previousState, selectProduct(product))

    expect(state.selectedProduct).toEqual(product)
    expect(state.customer).toBeNull()
    expect(state.delivery).toBeNull()
    expect(state.step).toBe('detail')
  })

  it('saveDeliveryDraft stores a draft keyed by productId without touching other drafts', async () => {
    const { default: cartReducer, saveDeliveryDraft } = await import('./cartSlice')
    const initialState = cartReducer(undefined, { type: '@@INIT' })
    const previousState = { ...initialState, deliveryDrafts: { other: delivery } }

    const state = cartReducer(previousState, saveDeliveryDraft({ productId: 'p1', delivery }))

    expect(state.deliveryDrafts).toEqual({ other: delivery, p1: delivery })
  })

  it('setDelivery stores the delivery info and moves to the payment step', async () => {
    const { default: cartReducer, setDelivery } = await import('./cartSlice')
    const initialState = cartReducer(undefined, { type: '@@INIT' })

    const state = cartReducer(initialState, setDelivery(delivery))

    expect(state.delivery).toEqual(delivery)
    expect(state.step).toBe('payment')
  })

  it('setCustomer stores the customer info and moves to the summary step', async () => {
    const { default: cartReducer, setCustomer } = await import('./cartSlice')
    const initialState = cartReducer(undefined, { type: '@@INIT' })

    const state = cartReducer(initialState, setCustomer(customer))

    expect(state.customer).toEqual(customer)
    expect(state.step).toBe('summary')
  })

  it('backToDetail moves the step back to detail without touching other fields', async () => {
    const { default: cartReducer, backToDetail } = await import('./cartSlice')
    const initialState = cartReducer(undefined, { type: '@@INIT' })
    const previousState = { ...initialState, customer, delivery, step: 'summary' as const }

    const state = cartReducer(previousState, backToDetail())

    expect(state.step).toBe('detail')
    expect(state.customer).toEqual(customer)
    expect(state.delivery).toEqual(delivery)
  })

  it('backToPayment moves the step back to payment', async () => {
    const { default: cartReducer, backToPayment } = await import('./cartSlice')
    const initialState = cartReducer(undefined, { type: '@@INIT' })
    const previousState = { ...initialState, step: 'summary' as const }

    const state = cartReducer(previousState, backToPayment())

    expect(state.step).toBe('payment')
  })

  it('backToProduct clears the selection, customer, and delivery, returning to the product step', async () => {
    const { default: cartReducer, backToProduct } = await import('./cartSlice')
    const initialState = cartReducer(undefined, { type: '@@INIT' })
    const product = createProduct()
    const previousState = {
      ...initialState,
      selectedProduct: product,
      customer,
      delivery,
      step: 'summary' as const,
    }

    const state = cartReducer(previousState, backToProduct())

    expect(state).toEqual({
      ...initialState,
      step: 'product',
      selectedProduct: null,
      customer: null,
      delivery: null,
    })
  })

  it('backToProduct does not clear persisted delivery drafts', async () => {
    const { default: cartReducer, backToProduct } = await import('./cartSlice')
    const initialState = cartReducer(undefined, { type: '@@INIT' })
    const previousState = {
      ...initialState,
      deliveryDrafts: { p1: delivery },
      selectedProduct: createProduct(),
      step: 'summary' as const,
    }

    const state = cartReducer(previousState, backToProduct())

    expect(state.deliveryDrafts).toEqual({ p1: delivery })
  })
})
