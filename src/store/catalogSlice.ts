import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getProducts } from '../services/api'
import type { Product } from '../services/api'

export type RequestStatus = 'idle' | 'loading' | 'success' | 'error'

interface CatalogState {
  items: Product[]
  status: RequestStatus
  error: string | null
}

const initialState: CatalogState = {
  items: [],
  status: 'idle',
  error: null,
}

// Book catalog is public, read-only data — safe to fetch/cache independently of the cart/checkout flow
export const fetchCatalog = createAsyncThunk('catalog/fetch', async () => {
  return getProducts()
})

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCatalog.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchCatalog.fulfilled, (state, action) => {
        state.status = 'success'
        state.items = action.payload.filter((product) => product.isActive)
      })
      .addCase(fetchCatalog.rejected, (state, action) => {
        state.status = 'error'
        state.error = action.error.message ?? 'Failed to fetch products'
      })
  },
})

export default catalogSlice.reducer
