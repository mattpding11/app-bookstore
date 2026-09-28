import { configureStore } from '@reduxjs/toolkit'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import catalogReducer, { fetchCatalog } from './catalogSlice'
import * as api from '../services/api'
import type { Product } from '../services/api'

vi.mock('../services/api', () => ({
  getProducts: vi.fn(),
}))

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

function setupStore() {
  return configureStore({ reducer: { catalog: catalogReducer } })
}

describe('catalogSlice reducer', () => {
  it('returns the initial state', () => {
    const state = catalogReducer(undefined, { type: '@@INIT' })
    expect(state).toEqual({ items: [], status: 'idle', error: null })
  })

  it('sets status to loading and clears the error on fetchCatalog.pending', () => {
    const previousState = { items: [], status: 'error' as const, error: 'boom' }

    const state = catalogReducer(previousState, fetchCatalog.pending('req-id', undefined))

    expect(state.status).toBe('loading')
    expect(state.error).toBeNull()
  })

  it('keeps only active products on fetchCatalog.fulfilled', () => {
    const active = createProduct({ id: 'active', isActive: true })
    const inactive = createProduct({ id: 'inactive', isActive: false })

    const state = catalogReducer(
      undefined,
      fetchCatalog.fulfilled([active, inactive], 'req-id', undefined),
    )

    expect(state.status).toBe('success')
    expect(state.items).toEqual([active])
  })

  it('sets the error message on fetchCatalog.rejected', () => {
    const action = fetchCatalog.rejected(new Error('Network down'), 'req-id', undefined)

    const state = catalogReducer(undefined, action)

    expect(state.status).toBe('error')
    expect(state.error).toBe('Network down')
  })

  it('falls back to Redux Toolkit\'s default "Rejected" message when no error is provided', () => {
    const action = fetchCatalog.rejected(null, 'req-id', undefined)

    const state = catalogReducer(undefined, action)

    expect(state.error).toBe('Rejected')
  })
})

describe('fetchCatalog thunk', () => {
  beforeEach(() => {
    vi.mocked(api.getProducts).mockReset()
  })

  it('stores only active products in the store when the request succeeds', async () => {
    const active = createProduct({ id: 'active', isActive: true })
    const inactive = createProduct({ id: 'inactive', isActive: false })
    vi.mocked(api.getProducts).mockResolvedValue([active, inactive])

    const store = setupStore()
    await store.dispatch(fetchCatalog())

    expect(api.getProducts).toHaveBeenCalledTimes(1)
    expect(store.getState().catalog).toEqual({
      items: [active],
      status: 'success',
      error: null,
    })
  })

  it('stores the error message in the store when the request fails', async () => {
    vi.mocked(api.getProducts).mockRejectedValue(
      new Error('Request failed with status 429: Too Many Requests'),
    )

    const store = setupStore()
    await store.dispatch(fetchCatalog())

    const state = store.getState().catalog
    expect(state.status).toBe('error')
    expect(state.error).toBe('Request failed with status 429: Too Many Requests')
    expect(state.items).toEqual([])
  })
})
