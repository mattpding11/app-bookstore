import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch } from '../store/hooks'
import { fetchCatalog } from '../store/catalogSlice'
import { loadPurchaseSummary, type PurchaseSummary } from '../services/purchaseSummaryStorage'

function formatPrice(cents: number, currency: string) {
  return (cents / 100).toLocaleString('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  })
}

export function SummaryPage() {
  const { reference = '' } = useParams<{ reference: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const [summary, setSummary] = useState<PurchaseSummary | null>(null)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    let cancelled = false

    loadPurchaseSummary(reference)
      .then((result) => {
        if (cancelled) return
        setSummary(result)
        setStatus(result ? 'success' : 'error')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [reference])

  function handleContinueShopping() {
    dispatch(fetchCatalog())
    navigate('/')
  }

  if (status === 'loading') {
    return <p className="status-message">Loading summary…</p>
  }

  if (status === 'error' || !summary) {
    return (
      <section className="result">
        <h2 className="modal-title">Summary not found</h2>
        <p className="result-message">We couldn't find a purchase with that reference.</p>
        <button
          type="button"
          className="button button--primary button--full"
          onClick={handleContinueShopping}
        >
          Back to store
        </button>
      </section>
    )
  }

  const { product, customer, delivery, baseFeeCents, deliveryFeeCents, totalCents } = summary

  console.log("Summary", summary)

  return (
    <section className="result">
      <h2 className="modal-title">
        {summary.status === 'APPROVED' ? 'Payment successful' : summary.status === 'PENDING' ?  'Payment pending': 'Payment failed'}
      </h2>
      <p className="result-message">Your order for &quot;{product.title}&quot; was confirmed.</p>
      <p className="result-reference">Reference: {summary.reference}</p>

      <div className="summary">
        <div className="summary-row">
          <span>{product.title}</span>
          <span>{formatPrice(product.priceCents, product.currency)}</span>
        </div>
        <div className="summary-row">
          <span>Base fee</span>
          <span>{formatPrice(baseFeeCents, product.currency)}</span>
        </div>
        <div className="summary-row">
          <span>Delivery fee</span>
          <span>{formatPrice(deliveryFeeCents, product.currency)}</span>
        </div>
        <div className="summary-row summary-row--total">
          <span>Total</span>
          <span>{formatPrice(totalCents, product.currency)}</span>
        </div>
      </div>

      <div className="summary-customer">
        <span>{customer.fullName}</span>
        <span>{customer.email}</span>
        <span>{customer.phoneNumber}</span>
      </div>

      <div className="summary-customer">
        <span>{delivery.addressLine}</span>
        <span>
          {delivery.city}, {delivery.region}
        </span>
      </div>

      <button
        type="button"
        className="button button--primary button--full"
        onClick={handleContinueShopping}
      >
        Back to store
      </button>
    </section>
  )
}

export default SummaryPage
