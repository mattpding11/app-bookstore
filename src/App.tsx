import './App.css'
import { useAppSelector } from './store/hooks'
import { ProductList } from './components/ProductList'
import { ProductDetail } from './components/ProductDetail'

function App() {
  const selectedProduct = useAppSelector((state) => state.checkout.cart.selectedProduct)

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Bookstore</h1>
      </header>

      <main className="app__main">
        {selectedProduct ? <ProductDetail /> : <ProductList />}
      </main>
    </div>
  )
}

export default App
