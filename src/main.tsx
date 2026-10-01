import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { LanguageProvider } from './i18n/LanguageContext'
import { applyPauseButtons, pauseButtonsShown } from './lib/pauseButtons'

// A visitor who chose to always see the pause buttons gets them on every page, before anything moves.
applyPauseButtons(pauseButtonsShown())

const container = document.getElementById('root')!

const app = (
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>
)

// Built pages arrive prerendered (see scripts/prerender.mjs); `npm run dev` serves an empty root.
if (container.hasChildNodes()) hydrateRoot(container, app)
else createRoot(container).render(app)
