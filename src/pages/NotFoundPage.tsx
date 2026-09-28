import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="result">
      <span className="error-page__code">404</span>
      <h2 className="modal-title">Page not found</h2>
      <p className="result-message">The page you&apos;re looking for doesn&apos;t exist or was moved.</p>
      <Link to="/" className="button button--primary button--full">
        Back to store
      </Link>
    </section>
  )
}

export default NotFoundPage
