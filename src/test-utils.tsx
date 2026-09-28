import type { PropsWithChildren, ReactElement } from 'react'
import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { render, type RenderOptions } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import catalogReducer from './store/catalogSlice'
import cartReducer from './store/cartSlice'
import transactionReducer from './store/transactionSlice'
import type { RootState } from './store/store'

// combineReducers (rather than a plain ReducersMapObject) gives configureStore a single Reducer
// whose declared PreloadedState slot is already `Partial<RootState>`, matching what tests pass in
const rootReducer = combineReducers({
  catalog: catalogReducer,
  cart: cartReducer,
  transaction: transactionReducer,
})

export type TestStore = ReturnType<typeof setupTestStore>

// A fresh, isolated store per test (avoids the singleton `store`'s import-time localStorage side effects)
export function setupTestStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
  })
}

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>
  store?: TestStore
  route?: string
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState,
    store = setupTestStore(preloadedState),
    route = '/',
    ...renderOptions
  }: RenderWithProvidersOptions = {},
) {
  function Wrapper({ children }: PropsWithChildren) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </Provider>
    )
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  }
}

export * from '@testing-library/react'
