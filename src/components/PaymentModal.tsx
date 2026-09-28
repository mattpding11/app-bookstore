import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { backToDetail, backToPayment, backToProduct, setCustomer } from '../store/cartSlice'
import {
  selectCheckoutStep,
  selectCustomer,
  selectDelivery,
  selectSelectedProduct,
} from '../store/cartSelectors'
import { BASE_FEE_CENTS, DELIVERY_FEE_CENTS, submitTransaction } from '../store/transactionSlice'
import { selectTransactionStatus } from '../store/transactionSelectors'
import { tokenizeCard } from '../services/wompi'
import { savePurchaseSummary } from '../services/purchaseSummaryStorage'
import { detectCardBrand } from '../utils/cardBrand'
import { Modal } from './Modal'
import type { DocumentType } from '../services/api'

const DOCUMENT_TYPES: DocumentType[] = ['CC', 'CE', 'NIT', 'PASSPORT']
const MIN_EXP_YEAR = 26

interface FormValues {
  email: string
  fullName: string
  phoneNumber: string
  documentNumber: string
  cardNumber: string
  cvc: string
  expMonth: string
  expYear: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

function validateForm(values: FormValues): FormErrors {
  const errors: FormErrors = {}

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (values.fullName.trim().length < 3) {
    errors.fullName = 'Enter the full name.'
  }

  if (!/^[0-9]{7,15}$/.test(values.phoneNumber)) {
    errors.phoneNumber = 'Enter a valid phone number (7-15 digits).'
  }

  if (!/^[0-9]{4,15}$/.test(values.documentNumber)) {
    errors.documentNumber = 'Enter a valid document number.'
  }

  if (!/^[0-9]{13,19}$/.test(values.cardNumber)) {
    errors.cardNumber = 'Card number must have 13 to 19 digits.'
  }

  if (!/^[0-9]{3,4}$/.test(values.cvc)) {
    errors.cvc = 'CVC must have 3 or 4 digits.'
  }

  const month = Number(values.expMonth)
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    errors.expMonth = 'Month must be between 01 and 12.'
  }

  const year = Number(values.expYear)
  if (!Number.isInteger(year) || year <= MIN_EXP_YEAR) {
    errors.expYear = `Year must be greater than ${MIN_EXP_YEAR}.`
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

export function PaymentModal() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const step = useAppSelector(selectCheckoutStep)
  const selectedProduct = useAppSelector(selectSelectedProduct)
  const customer = useAppSelector(selectCustomer)
  const delivery = useAppSelector(selectDelivery)
  const transactionStatus = useAppSelector(selectTransactionStatus)

  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [documentType, setDocumentType] = useState<DocumentType>('CC')
  const [documentNumber, setDocumentNumber] = useState('')

  const [cardNumber, setCardNumber] = useState('')
  const [cvc, setCvc] = useState('')
  const [expMonth, setExpMonth] = useState('')
  const [expYear, setExpYear] = useState('')

  const [errors, setErrors] = useState<FormErrors>({})
  const [isTokenizing, setIsTokenizing] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)

  if (!selectedProduct || step === 'product' || step === 'detail') {
    return null
  }

  const cardBrand = detectCardBrand(cardNumber)
  const isPaying = isTokenizing || transactionStatus === 'loading'
  const totalCents = selectedProduct.priceCents + BASE_FEE_CENTS + DELIVERY_FEE_CENTS

  function handleDocumentNumberChange(event: ChangeEvent<HTMLInputElement>) {
    setDocumentNumber(event.target.value.replace(/[^0-9]/g, ''))
  }

  function handleCardNumberChange(event: ChangeEvent<HTMLInputElement>) {
    setCardNumber(event.target.value.replace(/[^0-9]/g, '').slice(0, 19))
  }

  function handleCvcChange(event: ChangeEvent<HTMLInputElement>) {
    setCvc(event.target.value.replace(/[^0-9]/g, '').slice(0, 4))
  }

  function handleExpMonthChange(event: ChangeEvent<HTMLInputElement>) {
    const digitsOnly = event.target.value.replace(/[^0-9]/g, '').slice(0, 2)
    if (digitsOnly !== '' && Number(digitsOnly) > 12) {
      return
    }
    setExpMonth(digitsOnly)
  }

  function handleExpMonthBlur() {
    if (expMonth.length === 1 && expMonth !== '0') {
      setExpMonth(expMonth.padStart(2, '0'))
    }
  }

  function handleExpYearChange(event: ChangeEvent<HTMLInputElement>) {
    setExpYear(event.target.value.replace(/[^0-9]/g, '').slice(0, 2))
  }

  function handleContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const validationErrors = validateForm({
      email,
      fullName,
      phoneNumber,
      documentNumber,
      cardNumber,
      cvc,
      expMonth,
      expYear,
    })
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      return
    }

    dispatch(setCustomer({ email, fullName, phoneNumber, documentType, documentNumber }))
  }

  async function handlePay() {
    if (!customer || !selectedProduct || !delivery) return

    setPayError(null)
    setIsTokenizing(true)

    try {
      const token = await tokenizeCard({
        number: cardNumber,
        cvc,
        expMonth,
        expYear,
        cardHolder: fullName,
      })

      const transaction = await dispatch(
        submitTransaction({
          productId: selectedProduct.id,
          customer,
          paymentToken: token.id,
          deliveryFeeCents: DELIVERY_FEE_CENTS,
          delivery,
        }),
      ).unwrap()

      await savePurchaseSummary({
        reference: transaction.reference,
        status: transaction.status,
        product: selectedProduct,
        customer,
        delivery,
        baseFeeCents: BASE_FEE_CENTS,
        deliveryFeeCents: DELIVERY_FEE_CENTS,
        totalCents: selectedProduct.priceCents + BASE_FEE_CENTS + DELIVERY_FEE_CENTS,
        createdAt: new Date().toISOString(),
      })

      dispatch(backToProduct())
      navigate(`/summary/${transaction.reference}`)
    } catch (error) {
      setPayError(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setIsTokenizing(false)
    }
  }

  function handleClose() {
    dispatch(backToDetail())
  }

  return (
    <Modal onClose={!isPaying ? handleClose : undefined}>
      {step === 'payment' && (
        <>
          <div className="modal-header">
            <h2 className="modal-title">Pay with credit card</h2>
            <button type="button" className="modal-close" onClick={handleClose} aria-label="Close">
              ×
            </button>
          </div>

          <form className="form" onSubmit={handleContinue}>
            <div className={`form-field${errors.email ? ' form-field--invalid' : ''}`}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className={`form-field${errors.fullName ? ' form-field--invalid' : ''}`}>
              <label htmlFor="fullName">Full name</label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              {errors.fullName && <span className="field-error">{errors.fullName}</span>}
            </div>

            <div className={`form-field${errors.phoneNumber ? ' form-field--invalid' : ''}`}>
              <label htmlFor="phoneNumber">Phone</label>
              <input
                id="phoneNumber"
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              {errors.phoneNumber && <span className="field-error">{errors.phoneNumber}</span>}
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="documentType">Document type</label>
                <select
                  id="documentType"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                >
                  {DOCUMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className={`form-field${errors.documentNumber ? ' form-field--invalid' : ''}`}>
                <label htmlFor="documentNumber">Document number</label>
                <input
                  id="documentNumber"
                  type="text"
                  inputMode="numeric"
                  required
                  value={documentNumber}
                  onChange={handleDocumentNumberChange}
                />
                {errors.documentNumber && (
                  <span className="field-error">{errors.documentNumber}</span>
                )}
              </div>
            </div>

            <div className={`form-field${errors.cardNumber ? ' form-field--invalid' : ''}`}>
              <label htmlFor="cardNumber">
                Card number{' '}
                {cardBrand && <span className="card-brand-badge">{cardBrand}</span>}
              </label>
              <input
                id="cardNumber"
                type="text"
                inputMode="numeric"
                autoComplete="cc-number"
                required
                value={cardNumber}
                onChange={handleCardNumberChange}
              />
              {errors.cardNumber && <span className="field-error">{errors.cardNumber}</span>}
            </div>

            <div className="form-row">
              <div className={`form-field${errors.expMonth ? ' form-field--invalid' : ''}`}>
                <label htmlFor="expMonth">Month (MM)</label>
                <input
                  id="expMonth"
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  placeholder="MM"
                  required
                  value={expMonth}
                  onChange={handleExpMonthChange}
                  onBlur={handleExpMonthBlur}
                />
                {errors.expMonth && <span className="field-error">{errors.expMonth}</span>}
              </div>

              <div className={`form-field${errors.expYear ? ' form-field--invalid' : ''}`}>
                <label htmlFor="expYear">Year (YY)</label>
                <input
                  id="expYear"
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  placeholder="YY"
                  required
                  value={expYear}
                  onChange={handleExpYearChange}
                />
                {errors.expYear && <span className="field-error">{errors.expYear}</span>}
              </div>

              <div className={`form-field${errors.cvc ? ' form-field--invalid' : ''}`}>
                <label htmlFor="cvc">CVC</label>
                <input
                  id="cvc"
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  autoComplete="cc-csc"
                  required
                  value={cvc}
                  onChange={handleCvcChange}
                />
                {errors.cvc && <span className="field-error">{errors.cvc}</span>}
              </div>
            </div>

            <button type="submit" className="button button--primary button--full">
              Continue to summary
            </button>
          </form>
        </>
      )}

      {step === 'summary' && customer && (
        <>
          <div className="modal-header">
            <h2 className="modal-title">Order summary</h2>
            <button
              type="button"
              className="modal-close"
              onClick={handleClose}
              aria-label="Close"
              disabled={isPaying}
            >
              ×
            </button>
          </div>

          <div className="summary">
            <div className="summary-row">
              <span>{selectedProduct.title}</span>
              <span>{formatPrice(selectedProduct.priceCents, selectedProduct.currency)}</span>
            </div>
            <div className="summary-row">
              <span>Base fee</span>
              <span>{formatPrice(BASE_FEE_CENTS, selectedProduct.currency)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery fee</span>
              <span>{formatPrice(DELIVERY_FEE_CENTS, selectedProduct.currency)}</span>
            </div>
            <div className="summary-row summary-row--total">
              <span>Total</span>
              <span>{formatPrice(totalCents, selectedProduct.currency)}</span>
            </div>
          </div>

          <div className="summary-customer">
            <span>{customer.fullName}</span>
            <span>{customer.email}</span>
          </div>

          {payError && <p className="form-message form-message--error">{payError}</p>}

          <div className="summary-actions">
            <button
              type="button"
              className="button button--gray"
              onClick={() => dispatch(backToPayment())}
              disabled={isPaying}
            >
              Back
            </button>
            <button
              type="button"
              className="button button--primary button--full"
              onClick={handlePay}
              disabled={isPaying}
            >
              {isPaying ? 'Processing…' : 'Pay'}
            </button>
          </div>
        </>
      )}
    </Modal>
  )
}

export default PaymentModal
