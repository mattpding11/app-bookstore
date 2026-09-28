import { useAppDispatch, useAppSelector } from '../store/hooks'
import { clearCart, resetTransaction } from '../store/checkoutSlice'
import { CheckoutForm } from './CheckoutForm'

function formatPrice(cents: number, currency: string) {
  return (cents / 100).toLocaleString('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  })
}

export function ProductDetail() {
  const dispatch = useAppDispatch()
  const product = useAppSelector((state) => state.checkout.cart.selectedProduct)

  if (!product) {
    return null
  }

  function handleBack() {
    dispatch(clearCart())
    dispatch(resetTransaction())
  }

  return (
    <section className="product-detail">
      <button type="button" className="back-button" onClick={handleBack}>
        ← Back to books
      </button>

      <img className="product-detail__image" src={product.imageUrl} alt={product.title} />

      <div className="product-detail__body">
        <h2 className="product-detail__title">{product.title}</h2>
        <p className="product-detail__description">{product.description}</p>
        <span className="product-detail__price">
          {formatPrice(product.priceCents, product.currency)}
        </span>
      </div>

      <CheckoutForm />
    </section>
  )
}

export default ProductDetail
