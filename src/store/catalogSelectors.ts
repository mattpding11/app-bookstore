import type { RootState } from './store'

// Atomic selectors (rule 5.9/5.10): components subscribe only to the field they render,
// so a status/error change never re-renders something that only reads `items`.
export const selectCatalogItems = (state: RootState) => state.catalog.items
export const selectCatalogStatus = (state: RootState) => state.catalog.status
export const selectCatalogError = (state: RootState) => state.catalog.error

export const selectProductById = (id: string) => (state: RootState) =>
  state.catalog.items.find((product) => product.id === id)
