/* Main entry point for the application - renders the root React component */
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './main.css'
import './styles/legacy-bridge.css'
import { vigiarVersao } from './lib/version-watch'

// @skip-protected: Do not remove. Required for React rendering.
createRoot(document.getElementById('root')!).render(<App />)

// Publicar não basta: quem já está com o sistema aberto continua rodando o
// bundle antigo (JS imutável por um ano). Isto avisa e recarrega.
vigiarVersao()
