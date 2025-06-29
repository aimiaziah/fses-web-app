// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { HelmetProvider } from 'react-helmet-async'
import { RouterProvider } from 'react-router-dom'
import { router } from './Router/Routes.jsx'
import { AuthProvider } from './contexts/AuthContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <div className='w-full back-gr'>
          <RouterProvider router={router} />
        </div>
      </AuthProvider>
    </HelmetProvider>
  </StrictMode>,
)