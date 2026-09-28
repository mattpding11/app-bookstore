import { Link } from 'react-router-dom'

export function ForbiddenPage() {
  return (
    <section className="result">
      <span className="error-page__code">403</span>
      <h2 className="modal-title">Access denied</h2>
      <p className="result-message">You don&apos;t have permission to view this page.</p>
      <Link to="/" className="button button--primary button--full">
        Back to store
      </Link>
    </section>
  )
}

export default ForbiddenPage
