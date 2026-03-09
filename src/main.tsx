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
            background: 'hsl(252 22% 11%)',
            color: 'hsl(252 15% 92%)',
            border: '1px solid hsl(252 18% 18%)',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Space Grotesk, system-ui, sans-serif',
          },
          success: {
            iconTheme: { primary: 'hsl(257 93% 68%)', secondary: 'white' },
          },
          error: {
            iconTheme: { primary: 'hsl(0 72% 55%)', secondary: 'white' },
          },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>,
)
