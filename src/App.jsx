import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import { Login } from './pages/Login.jsx'
import { Dashboard } from './pages/Dashboard.jsx'
import { Learning } from './pages/Learning.jsx'
import { Simulator } from './pages/Simulator.jsx'
import { Quiz } from './pages/Quiz.jsx'
import { Game } from './pages/Game.jsx'
import { Playground } from './pages/Playground.jsx'
import { Leaderboard } from './pages/Leaderboard.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/learning" element={<Learning />} />
        <Route path="/simulator" element={<Simulator />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/game" element={<Game />} />
        <Route path="/playground" element={<Playground />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
