import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './app/app'
import { ErrorBoundary } from './app/error-boundary'
import { AppearanceProvider } from './themes/appearance-provider'
import { readAppearance } from './themes/storage'
import { applyAppearance } from './themes/runtime'

// Resolve saved appearance before rendering any application content.
const initial = readAppearance()
applyAppearance(initial.record)
document.documentElement.style.visibility = 'visible'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AppearanceProvider initial={initial}>
        <App />
      </AppearanceProvider>
    </ErrorBoundary>
  </StrictMode>,
)
