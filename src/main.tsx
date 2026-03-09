import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#e5e5e5',
            border: '1px solid #2a2a2a',
            borderRadius: '12px',
            fontSize: '13px',
            fontFamily: 'Inter, system-ui, sans-serif',
          },
          success: {
            iconTheme: { primary: '#6366f1', secondary: 'white' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: 'white' },
          },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>,
)
