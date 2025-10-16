import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './utils/environmentValidation'
import ProductionErrorBoundary from './components/ProductionErrorBoundary'

createRoot(document.getElementById("root")!).render(
  <ProductionErrorBoundary>
    <App />
  </ProductionErrorBoundary>
);
