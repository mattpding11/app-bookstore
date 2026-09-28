import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { backToProduct, saveDeliveryDraft, selectProduct, setDelivery } from '../store/cartSlice'
import { selectCheckoutStep, selectDeliveryDraft, selectSelectedProduct } from '../store/cartSelectors'
import { fetchCatalog } from '../store/catalogSlice'
import { selectCatalogStatus, selectProductById } from '../store/catalogSelectors'
import { PaymentModal } from './PaymentModal'

interface DeliveryFormValues {
  addressLine: string
  city: string
  region: string
}

type DeliveryFormErrors = Partial<Record<keyof DeliveryFormValues, string>>

function validateDelivery(values: DeliveryFormValues): DeliveryFormErrors {
  const errors: DeliveryFormErrors = {}

  if (values.addressLine.trim().length < 5) {
    errors.addressLine = 'Enter a valid address.'
  }

  if (values.city.trim().length < 2) {
    errors.city = 'Enter a valid city.'
  }

  if (values.region.trim().length < 2) {
    errors.region = 'Enter a valid region.'
  }

  return errors
}

function formatPrice(cents: number, currency: string) {
  return (cents / 100).toLocaleString('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  })
}

export function ProductDetail() {
  const { productId = '' } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const product = useAppSelector(selectProductById(productId))
  const catalogStatus = useAppSelector(selectCatalogStatus)
  const selectedProduct = useAppSelector(selectSelectedProduct)
  const step = useAppSelector(selectCheckoutStep)
  const draft = useAppSelector(selectDeliveryDraft(productId))

  const [prevProductId, setPrevProductId] = useState(productId)
  const [addressLine, setAddressLine] = useState(draft?.addressLine ?? '')
  const [city, setCity] = useState(draft?.city ?? '')
  const [region, setRegion] = useState(draft?.region ?? '')
  const [errors, setErrors] = useState<DeliveryFormErrors>({})

  // Product changed (new route param): reload that product's saved draft into the form.
  // Adjusted during render (not an effect) per https://react.dev/learn/you-might-not-need-an-effect
  if (productId !== prevProductId) {
    setPrevProductId(productId)
    setAddressLine(draft?.addressLine ?? '')
    setCity(draft?.city ?? '')
    setRegion(draft?.region ?? '')
    setErrors({})
  }

  useEffect(() => {
    if (catalogStatus === 'idle') {
      dispatch(fetchCatalog())
    }
  }, [catalogStatus, dispatch])

  useEffect(() => {
    if (product && selectedProduct?.id !== product.id) {
      dispatch(selectProduct(product))
    }
  }, [product, selectedProduct, dispatch])

  function handleBack() {
    dispatch(backToProduct())
    navigate('/')
  }

  if (catalogStatus === 'loading' || catalogStatus === 'idle') {
    return <p className="status-message">Loading product…</p>
  }

  if (!product) {
    return (
      <section className="product-detail">
        <p className="status-message">Product not found.</p>
        <button type="button" className="button button--gray" onClick={() => navigate('/')}>
          ← Back to books
        </button>
      </section>
    )
  }

  const outOfStock = product.stock <= 0
  const isEditable = step === 'detail'

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const validationErrors = validateDelivery({ addressLine, city, region })
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      return
    }

    const delivery = { addressLine, city, region }
    dispatch(saveDeliveryDraft({ productId, delivery }))
    dispatch(setDelivery(delivery))
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
        <span className={`stock-badge${outOfStock ? ' stock-badge--out' : ''}`}>
          {outOfStock ? 'Out of stock' : `${product.stock} in stock`}
        </span>
        <span className="product-detail__price">
          {formatPrice(product.priceCents, product.currency)}
        </span>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        <h3 className="app__section-title">Delivery details</h3>

        <div className={`form-field${errors.addressLine ? ' form-field--invalid' : ''}`}>
          <label htmlFor="addressLine">Address</label>
          <input
            id="addressLine"
            type="text"
            required
            value={addressLine}
            onChange={(e) => setAddressLine(e.target.value)}
            disabled={!isEditable}
          />
          {errors.addressLine && <span className="field-error">{errors.addressLine}</span>}
        </div>

        <div className="form-row">
          <div className={`form-field${errors.city ? ' form-field--invalid' : ''}`}>
            <label htmlFor="city">City</label>
            <input
              id="city"
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={!isEditable}
            />
            {errors.city && <span className="field-error">{errors.city}</span>}
          </div>

          <div className={`form-field${errors.region ? ' form-field--invalid' : ''}`}>
            <label htmlFor="region">Region</label>
            <input
              id="region"
              type="text"
              required
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              disabled={!isEditable}
            />
            {errors.region && <span className="field-error">{errors.region}</span>}
          </div>
        </div>

        <button
          type="submit"
          className="button button--primary button--full"
          disabled={outOfStock || !isEditable}
        >
          Pay with credit card
        </button>
      </form>

      <PaymentModal />
    </section>
  )
}

export default ProductDetail
