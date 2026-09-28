import { Route, Routes, useParams } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders, screen, waitFor } from '../test-utils'
import { ProductList } from './ProductList'
import * as api from '../services/api'
import type { Product } from '../services/api'

vi.mock('../services/api', () => ({
  getProducts: vi.fn(),
}))

function createProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p1',
    title: 'Don Quijote de la Mancha',
    description: 'A classic novel.',
    priceCents: 8000000,
    currency: 'COP',
    imageUrl: 'https://example.com/quijote.jpg',
    stock: 5,
    isActive: true,
    ...overrides,
  }
}

function DetailPlaceholder() {
  const { productId } = useParams<{ productId: string }>()
  return <p>Detail page for {productId}</p>
}

function renderProductList() {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<ProductList />} />
      <Route path="/detalle/:productId" element={<DetailPlaceholder />} />
    </Routes>,
  )
}

beforeEach(() => {
  vi.mocked(api.getProducts).mockReset()
})

describe('ProductList', () => {
  it('shows a loading message, then displays the fetched books', async () => {
    let resolveRequest: (products: Product[]) => void = () => {}
    vi.mocked(api.getProducts).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve
        }),
    )

    renderProductList()

    expect(screen.getByText(/loading products/i)).toBeInTheDocument()

    resolveRequest([createProduct()])

    expect(await screen.findByText('Don Quijote de la Mancha')).toBeInTheDocument()
  })

  it('renders only active books returned by the catalog, with their stock', async () => {
    const active = createProduct({ id: 'active', title: 'Cien años de soledad', stock: 3 })
    const inactive = createProduct({ id: 'inactive', title: 'Hidden Book', isActive: false })
    vi.mocked(api.getProducts).mockResolvedValue([active, inactive])

    renderProductList()

    expect(await screen.findByText('Cien años de soledad')).toBeInTheDocument()
    expect(screen.getByText('3 in stock')).toBeInTheDocument()
    expect(screen.queryByText('Hidden Book')).not.toBeInTheDocument()
  })

  it('shows an out-of-stock badge and disables the Buy button when stock is zero', async () => {
    vi.mocked(api.getProducts).mockResolvedValue([createProduct({ stock: 0 })])

    renderProductList()

    expect(await screen.findAllByText('Out of stock')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Out of stock' })).toBeDisabled()
  })

  it('shows an empty-state message when the catalog has no products', async () => {
    vi.mocked(api.getProducts).mockResolvedValue([])

    renderProductList()

    expect(await screen.findByText('No products available.')).toBeInTheDocument()
  })

  it('shows an error message with a Retry button, and retrying re-fetches the catalog', async () => {
    const user = userEvent.setup()
    vi.mocked(api.getProducts)
      .mockRejectedValueOnce(new Error('Request failed with status 429'))
      .mockResolvedValueOnce([createProduct()])

    renderProductList()

    expect(await screen.findByText(/couldn.t load the books/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(await screen.findByText('Don Quijote de la Mancha')).toBeInTheDocument()
    expect(api.getProducts).toHaveBeenCalledTimes(2)
  })

  it('navigates to the product detail route when Buy is clicked', async () => {
    const user = userEvent.setup()
    vi.mocked(api.getProducts).mockResolvedValue([createProduct({ id: 'p1' })])

    renderProductList()

    await user.click(await screen.findByRole('button', { name: 'Buy' }))

    await waitFor(() => {
      expect(screen.getByText('Detail page for p1')).toBeInTheDocument()
    })
  })
})
