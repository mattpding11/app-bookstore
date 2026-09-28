import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchProducts, selectProduct } from '../store/checkoutSlice'
import type { Product } from '../services/api'

function formatPrice(cents: number, currency: string) {
  return (cents / 100).toLocaleString('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  })
}

function ProductCard({
  product,
  isSelected,
  onBuy,
}: {
  product: Product
  isSelected: boolean
  onBuy: (product: Product) => void
}) {
  return (
    <li
      className={`product-card${isSelected ? ' product-card--selected' : ''}`}
    >
      <img className="product-card__image" src={product.imageUrl} alt={product.title} />
      <div className="product-card__body">
        <span className="product-card__name">{product.title}</span>
        <span className="product-card__description">{product.description}</span>
        <div className="product-card__footer">
          <span className="product-card__price">
            {formatPrice(product.priceCents, product.currency)}
          </span>
          <button
            type="button"
            className="button button--gray"
            onClick={() => onBuy(product)}
          >
            {isSelected ? 'Selected' : 'Buy'}
          </button>
        </div>
      </div>
    </li>
  )
}

export function ProductList() {
  const dispatch = useAppDispatch()
  const { items, status, error } = useAppSelector((state) => state.checkout.products)
  const selectedProduct = useAppSelector((state) => state.checkout.cart.selectedProduct)

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  return (
    <section>
      <h2 className="app__section-title">Books</h2>

      {status === 'loading' && <p className="status-message">Loading products…</p>}
      {status === 'error' && (
        <p className="status-message">{error ?? 'Something went wrong.'}</p>
      )}
      {status === 'success' && items.length === 0 && (
        <p className="status-message">No products available.</p>
      )}

      {items.length > 0 && (
        <ul className="product-list">
          {items.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isSelected={selectedProduct?.id === product.id}
              onBuy={(p) => dispatch(selectProduct(p))}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

export default ProductList
