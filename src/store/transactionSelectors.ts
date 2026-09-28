import type { RootState } from './store'

// Atomic selectors (rule 5.9/5.10): the summary/result UI only re-renders on the field it reads
export const selectTransactionStatus = (state: RootState) => state.transaction.status
export const selectTransactionData = (state: RootState) => state.transaction.data
export const selectTransactionError = (state: RootState) => state.transaction.error
