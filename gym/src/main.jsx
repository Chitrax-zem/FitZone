import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './contexts/ThemeContext.jsx'

// Optional: ensure fixed header offset globally
document.body.classList.add('has-fixed-header')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)

// Register SW only in production
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  // navigator.serviceWorker.register('/sw.js');
}
