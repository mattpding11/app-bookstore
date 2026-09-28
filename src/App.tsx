import './App.css'
import { Route, Routes } from 'react-router-dom'
import { ProductList } from './components/ProductList'
import { ProductDetail } from './components/ProductDetail'
import { SummaryPage } from './pages/SummaryPage'
import { ForbiddenPage } from './pages/ForbiddenPage'
import { NotFoundPage } from './pages/NotFoundPage'

function App() {
  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Bookstore</h1>
      </header>

      <main className="app__main">
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/detalle/:productId" element={<ProductDetail />} />
          <Route path="/summary/:reference" element={<SummaryPage />} />
          <Route path="/403" element={<ForbiddenPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
