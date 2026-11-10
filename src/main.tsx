import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { getFilterRenderStatItems } from './helpers/displayFilter'

// Una instancia por item de filterRenderStat, montada en #{item.render}
getFilterRenderStatItems().forEach((item) => {
  const container = document.getElementById(String(item.render))
  if (!container) return

  createRoot(container).render(
    <StrictMode>
      <App item={item} />
    </StrictMode>,
  )
})
