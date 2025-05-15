
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from './App.tsx'
import './index.css'
import { Toaster } from "./components/ui/toaster"

// Usar StrictMode para detectar problemas potenciales
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <Toaster />
  </StrictMode>
);
