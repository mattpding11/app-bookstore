import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { processTransaction } from '../services/api'
import type { ProcessTransactionPayload, Transaction } from '../services/api'

export type RequestStatus = 'idle' | 'loading' | 'success' | 'error'

// Fixed fees applied to every order, shown in the payment summary breakdown
export const BASE_FEE_CENTS = 150000
export const DELIVERY_FEE_CENTS = 5000

interface TransactionState {
  status: RequestStatus
  data: Transaction | null
  error: string | null
}

const initialState: TransactionState = {
  status: 'idle',
  data: null,
  error: null,
}

// Wompi-adjacent: action type, payload/return shape, and call site in PaymentModal are unchanged
export const submitTransaction = createAsyncThunk(
  'checkout/submitTransaction',
  async (payload: ProcessTransactionPayload) => {
    return processTransaction(payload)
  },
)

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    resetTransaction(state) {
      state.status = 'idle'
      state.data = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitTransaction.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(submitTransaction.fulfilled, (state, action) => {
        state.status = 'success'
        state.data = action.payload
      })
      .addCase(submitTransaction.rejected, (state, action) => {
        state.status = 'error'
        state.error = action.error.message ?? 'Failed to process transaction'
      })
  },
})

export const { resetTransaction } = transactionSlice.actions
export default transactionSlice.reducer
