import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchCatalog } from '../store/catalogSlice'
import { selectCatalogItems, selectCatalogStatus } from '../store/catalogSelectors'
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
  onBuy,
}: {
  product: Product
  onBuy: (product: Product) => void
}) {
  const outOfStock = product.stock <= 0

  return (
    <li className="product-card">
      <img className="product-card__image" src={product.imageUrl} alt={product.title} />
      <div className="product-card__body">
        <span className="product-card__name">{product.title}</span>
        <span className="product-card__description">{product.description}</span>
        <span className={`stock-badge${outOfStock ? ' stock-badge--out' : ''}`}>
          {outOfStock ? 'Out of stock' : `${product.stock} in stock`}
        </span>
        <div className="product-card__footer">
          <span className="product-card__price">
            {formatPrice(product.priceCents, product.currency)}
          </span>
        </div>
        <button
          type="button"
          className="button button--gray button--full"
          onClick={() => onBuy(product)}
          disabled={outOfStock}
        >
          {outOfStock ? 'Out of stock' : 'Buy'}
        </button>
      </div>
    </li>
  )
}

export function ProductList() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const items = useAppSelector(selectCatalogItems)
  const status = useAppSelector(selectCatalogStatus)

  useEffect(() => {
    dispatch(fetchCatalog())
  }, [dispatch])

  return (
    <section>
      <h2 className="app__section-title">Books</h2>
      <br />
      {status === 'loading' && <p className="status-message">Loading products…</p>}
      {status === 'error' && (
        <div className="status-message">
          <p>We couldn&apos;t load the books. Please try again in a moment.</p>
          <button
            type="button"
            className="button button--gray"
            onClick={() => dispatch(fetchCatalog())}
          >
            Retry
          </button>
        </div>
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
              onBuy={(p) => navigate(`/detalle/${p.id}`)}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

export default ProductList
