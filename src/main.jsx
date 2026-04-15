import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './components/AuthProvider.jsx'
import { NeuralBackground } from './components/NeuralBackground.jsx'
import { AchievementProvider } from './components/AchievementProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <AchievementProvider>
        <BrowserRouter>
          <NeuralBackground mode="network" />
          <App />
        </BrowserRouter>
      </AchievementProvider>
    </AuthProvider>
  </StrictMode>,
)
