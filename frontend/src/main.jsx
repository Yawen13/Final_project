import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root was not found in the document.');
}

// Mounts the React application into the page's root element.
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
