import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from './authContext.js'

function TopNavLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'rounded-lg px-3 py-2 text-sm font-medium transition',
          isActive ? 'bg-white/10 text-white' : 'text-slate-200 hover:bg-white/5',
        ].join(' ')
      }
    >
      {children}
    </NavLink>
  )
}

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <button
            className="text-left"
            onClick={() => navigate('/')}
            type="button"
          >
            <div className="text-sm font-semibold text-white">NeuralPlayground Pro</div>
            <div className="text-xs text-slate-400">Hackathon Edition</div>
          </button>

          <nav className="hidden flex-wrap items-center gap-1 md:flex">
            <TopNavLink to="/">Dashboard</TopNavLink>
            <TopNavLink to="/simulator">Simulator</TopNavLink>
            <TopNavLink to="/learning">Learning</TopNavLink>
            <TopNavLink to="/quiz">Quiz</TopNavLink>
            <TopNavLink to="/game">Game</TopNavLink>
            <TopNavLink to="/playground">Playground</TopNavLink>
            <TopNavLink to="/leaderboard">Leaderboard</TopNavLink>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-xs text-slate-400">Logged in as</div>
              <div className="text-sm font-semibold text-white">{user?.username}</div>
            </div>
            <button
              type="button"
              className="rounded-lg bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15"
              onClick={() => logout()}
            >
              Log out
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-3 md:hidden">
          <div className="flex flex-wrap gap-1">
            <TopNavLink to="/">Dashboard</TopNavLink>
            <TopNavLink to="/simulator">Simulator</TopNavLink>
            <TopNavLink to="/learning">Learning</TopNavLink>
            <TopNavLink to="/quiz">Quiz</TopNavLink>
            <TopNavLink to="/game">Game</TopNavLink>
            <TopNavLink to="/playground">Playground</TopNavLink>
            <TopNavLink to="/leaderboard">Leaderboard</TopNavLink>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}

