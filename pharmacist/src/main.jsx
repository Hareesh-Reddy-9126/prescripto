import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { PharmacistProvider } from './context/PharmacistContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <PharmacistProvider>
        <App />
      </PharmacistProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
