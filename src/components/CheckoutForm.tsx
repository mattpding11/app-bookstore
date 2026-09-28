import { useState, type FormEvent } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { resetTransaction, submitTransaction } from '../store/checkoutSlice'
import { tokenizeCard } from '../services/wompi'
import type { DocumentType } from '../services/api'

const DELIVERY_FEE_CENTS = 5000
const DOCUMENT_TYPES: DocumentType[] = ['CC', 'CE', 'NIT', 'PASSPORT']

export function CheckoutForm() {
  const dispatch = useAppDispatch()
  const selectedProduct = useAppSelector((state) => state.checkout.cart.selectedProduct)
  const transactionStatus = useAppSelector((state) => state.checkout.transaction.status)
  const transactionError = useAppSelector((state) => state.checkout.transaction.error)

  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [documentType, setDocumentType] = useState<DocumentType>('CC')
  const [documentNumber, setDocumentNumber] = useState('')

  const [cardNumber, setCardNumber] = useState('')
  const [cvc, setCvc] = useState('')
  const [expMonth, setExpMonth] = useState('')
  const [expYear, setExpYear] = useState('')

  const [isTokenizing, setIsTokenizing] = useState(false)
  const [tokenizeError, setTokenizeError] = useState<string | null>(null)

  if (!selectedProduct) {
    return null
  }

  const isSubmitting = isTokenizing || transactionStatus === 'loading'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedProduct) return

    setTokenizeError(null)
    dispatch(resetTransaction())
    setIsTokenizing(true)

    try {
      const token = await tokenizeCard({
        number: cardNumber,
        cvc,
        expMonth,
        expYear,
      })

      dispatch(
        submitTransaction({
          productId: selectedProduct.id,
          customer: { email, fullName, phoneNumber, documentType, documentNumber },
          paymentToken: token.id,
          deliveryFeeCents: DELIVERY_FEE_CENTS,
        }),
      )
    } catch (error) {
      setTokenizeError(error instanceof Error ? error.message : 'Card tokenization failed')
    } finally {
      setIsTokenizing(false)
    }
  }

  return (
    <section className="checkout">
      <h2 className="app__section-title">Checkout</h2>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-field">
          <label htmlFor="fullName">Full name</label>
          <input
            id="fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-field">
          <label htmlFor="phoneNumber">Phone</label>
          <input
            id="phoneNumber"
            type="tel"
            required
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="documentType">Document type</label>
            <select
              id="documentType"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as DocumentType)}
              disabled={isSubmitting}
            >
              {DOCUMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="documentNumber">Document number</label>
            <input
              id="documentNumber"
              type="text"
              required
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="cardNumber">Card number</label>
          <input
            id="cardNumber"
            type="text"
            inputMode="numeric"
            autoComplete="cc-number"
            required
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="expMonth">Month (MM)</label>
            <input
              id="expMonth"
              type="text"
              inputMode="numeric"
              maxLength={2}
              placeholder="MM"
              required
              value={expMonth}
              onChange={(e) => setExpMonth(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-field">
            <label htmlFor="expYear">Year (YY)</label>
            <input
              id="expYear"
              type="text"
              inputMode="numeric"
              maxLength={2}
              placeholder="YY"
              required
              value={expYear}
              onChange={(e) => setExpYear(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-field">
            <label htmlFor="cvc">CVC</label>
            <input
              id="cvc"
              type="text"
              inputMode="numeric"
              maxLength={4}
              autoComplete="cc-csc"
              required
              value={cvc}
              onChange={(e) => setCvc(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <button
          type="submit"
          className="button button--primary button--full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing…' : 'Pay'}
        </button>

        {tokenizeError && <p className="form-message form-message--error">{tokenizeError}</p>}
        {transactionStatus === 'error' && (
          <p className="form-message form-message--error">
            {transactionError ?? 'Transaction failed.'}
          </p>
        )}
        {transactionStatus === 'success' && (
          <p className="form-message form-message--success">Payment successful.</p>
        )}
      </form>
    </section>
  )
}

export default CheckoutForm
