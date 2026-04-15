import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import { lazy, Suspense } from 'react'

const Login = lazy(() => import('./pages/Login.jsx').then((m) => ({ default: m.Login })))
const Dashboard = lazy(() =>
  import('./pages/Dashboard.jsx').then((m) => ({ default: m.Dashboard })),
)
const Learning = lazy(() => import('./pages/Learning.jsx').then((m) => ({ default: m.Learning })))
const Simulator = lazy(() =>
  import('./pages/Simulator.jsx').then((m) => ({ default: m.Simulator })),
)
const Quiz = lazy(() => import('./pages/Quiz.jsx').then((m) => ({ default: m.Quiz })))
const Game = lazy(() => import('./pages/Game.jsx').then((m) => ({ default: m.Game })))
const Playground = lazy(() =>
  import('./pages/Playground.jsx').then((m) => ({ default: m.Playground })),
)
const Leaderboard = lazy(() =>
  import('./pages/Leaderboard.jsx').then((m) => ({ default: m.Leaderboard })),
)

function Loading() {
  return (
    <div className="cosmos-card p-6 text-sm text-cosmos-text2">
      Loading<span className="ml-1 inline-block w-2 animate-caretBlink text-cosmos-accent2">▍</span>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
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
    </Suspense>
  )
}
