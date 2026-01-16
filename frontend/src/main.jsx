import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3200,
          style: {
            background: '#0b1020',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 12px 40px rgba(3, 10, 25, 0.5)',
            backdropFilter: 'blur(8px)',
          },
          success: {
            iconTheme: {
              primary: '#00d2ff',
              secondary: '#0b1020',
            },
            style: {
              border: '1px solid rgba(0, 210, 255, 0.4)',
            },
          },
          error: {
            iconTheme: {
              primary: '#ff4d4f',
              secondary: '#0b1020',
            },
            style: {
              border: '1px solid rgba(255, 77, 79, 0.4)',
            },
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>,
)
