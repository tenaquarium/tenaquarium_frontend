import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Prevent dragging of all images globally
document.addEventListener('dragstart', (e) => {
  if (e.target && e.target.tagName === 'IMG') {
    e.preventDefault();
  }
}, true);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    </StrictMode>,
)
