import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { getProducts, processTransaction } from '../services/api'
import type { Product, ProcessTransactionPayload, Transaction } from '../services/api'

export type RequestStatus = 'idle' | 'loading' | 'success' | 'error'

interface CheckoutState {
  products: {
    items: Product[]
    status: RequestStatus
    error: string | null
  }
  cart: {
    selectedProduct: Product | null
    deliveryFeeCents: number
  }
  transaction: {
    status: RequestStatus
    data: Transaction | null
    error: string | null
  }
}

const initialState: CheckoutState = {
  products: {
    items: [],
    status: 'idle',
    error: null,
  },
  cart: {
    selectedProduct: null,
    deliveryFeeCents: 0,
  },
  transaction: {
    status: 'idle',
    data: null,
    error: null,
  },
}

export const fetchProducts = createAsyncThunk('checkout/fetchProducts', async () => {
  return getProducts()
})

export const submitTransaction = createAsyncThunk(
  'checkout/submitTransaction',
  async (payload: ProcessTransactionPayload) => {
    return processTransaction(payload)
  },
)

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    selectProduct(state, action: PayloadAction<Product>) {
      state.cart.selectedProduct = action.payload
    },
    clearCart(state) {
      state.cart.selectedProduct = null
      state.cart.deliveryFeeCents = 0
    },
    setDeliveryFeeCents(state, action: PayloadAction<number>) {
      state.cart.deliveryFeeCents = action.payload
    },
    resetTransaction(state) {
      state.transaction.status = 'idle'
      state.transaction.data = null
      state.transaction.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.products.status = 'loading'
        state.products.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.products.status = 'success'
        state.products.items = action.payload.filter((product) => product.isActive)
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.products.status = 'error'
        state.products.error = action.error.message ?? 'Failed to fetch products'
      })
      .addCase(submitTransaction.pending, (state) => {
        state.transaction.status = 'loading'
        state.transaction.error = null
      })
      .addCase(submitTransaction.fulfilled, (state, action) => {
        state.transaction.status = 'success'
        state.transaction.data = action.payload
      })
      .addCase(submitTransaction.rejected, (state, action) => {
        state.transaction.status = 'error'
        state.transaction.error = action.error.message ?? 'Failed to process transaction'
      })
  },
})

export const { selectProduct, clearCart, setDeliveryFeeCents, resetTransaction } =
  checkoutSlice.actions

export default checkoutSlice.reducer
