import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./config/quillConfigWordLike.js";
import "react-quill-new/dist/quill.snow.css";
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './contexts/ThemeContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
