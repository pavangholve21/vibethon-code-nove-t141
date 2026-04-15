import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './authContext.js'
import { AnimatePresence, motion } from 'framer-motion'
import { Icon } from './NavIcons.jsx'
import { usePrefersReducedMotion } from './usePrefersReducedMotion.js'
import { useAchievements } from './AchievementProvider.jsx'
import { useEffect, useRef } from 'react'
import { useTheme } from './ThemeProvider.jsx'

function initials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  const a = parts[0]?.[0] || '?'
  const b = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (a + b).toUpperCase()
}

function TopNavLink({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'relative rounded-full px-4 py-2 text-sm font-semibold transition',
          isActive ? 'text-cosmos-text' : 'text-cosmos-text2 hover:text-cosmos-text',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          {isActive ? (
            <motion.span
              layoutId="nav-pill"
              className="absolute inset-0 rounded-full bg-white/5 ring-1 ring-cosmos-accent1/25"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          ) : null}
          <span className="relative z-10">{label}</span>
        </>
      )}
    </NavLink>
  )
}

function MobileTab({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'relative flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px]',
          isActive ? 'text-cosmos-text' : 'text-cosmos-text2',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          <div
            className={[
              'transition duration-200',
              isActive ? 'scale-110 text-cosmos-accent1 drop-shadow-[0_0_18px_rgba(124,58,237,0.45)]' : '',
            ].join(' ')}
          >
            <Icon name={icon} className="h-5 w-5" />
          </div>
          <div className="font-semibold">{label}</div>
          {isActive ? (
            <motion.div
              layoutId="mobile-underline"
              className="absolute bottom-0 h-[2px] w-10 rounded-full bg-cosmos-accent1"
              transition={{ type: 'spring', stiffness: 500, damping: 36 }}
            />
          ) : null}
        </>
      )}
    </NavLink>
  )
}

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const reduced = usePrefersReducedMotion()
  const { enqueue } = useAchievements()
  const { theme, toggleTheme } = useTheme()

  const prevBadgesRef = useRef([])
  useEffect(() => {
    const next = user?.progress?.badges ?? []
    const prev = prevBadgesRef.current ?? []
    const prevSet = new Set(prev)
    const unlocked = next.filter((id) => !prevSet.has(id))
    if (unlocked.length) enqueue(unlocked)
    prevBadgesRef.current = next
  }, [enqueue, user?.progress?.badges])

  const streak = Number(user?.progress?.streak ?? 0)

  return (
    <div className="min-h-full pb-16 md:pb-0">
      <header className="sticky top-0 z-50 cosmos-glass">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <button
            className="text-left"
            onClick={() => navigate('/')}
            type="button"
          >
            <div className="flex items-center gap-2">
              <span className="relative inline-flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-cosmos-accent1/60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cosmos-accent1" />
              </span>
              <span className="cosmos-title text-sm">NeuralPlayground</span>
            </div>
            <div className="mt-0.5 text-xs text-cosmos-text2">VIBETHON • Neural Cosmos</div>
          </button>

          <nav className="hidden items-center gap-1 md:flex">
            <TopNavLink to="/" label="Dashboard" />
            <TopNavLink to="/simulator" label="Simulator" />
            <TopNavLink to="/learning" label="Learning" />
            <TopNavLink to="/quiz" label="Quiz" />
            <TopNavLink to="/game" label="Game" />
            <TopNavLink to="/playground" label="Playground" />
            <TopNavLink to="/leaderboard" label="Leaderboard" />
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="cosmos-ghost"
              onClick={toggleTheme}
              title="Toggle theme"
            >
              {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
            </button>
            <div className="hidden items-center gap-3 sm:flex">
              <div className="rounded-full border border-cosmos bg-white/5 px-3 py-1.5 text-xs text-cosmos-text2">
                <span className="mr-1">🔥</span>
                <span className="font-semibold text-cosmos-text">{streak}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cosmos-accent1 to-cosmos-accent2 p-[2px]">
                    <div className="grid h-full w-full place-items-center rounded-full bg-cosmos-bg font-heading text-sm font-semibold text-white">
                      {initials(user?.username)}
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-full animate-pulseRing" />
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-cosmos-text2">Logged in as</div>
                  <div className="text-sm font-semibold text-cosmos-text">{user?.username}</div>
                </div>
              </div>
            </div>
            <button
              type="button"
              className="cosmos-ghost hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-200"
              onClick={() => logout()}
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={reduced ? {} : { opacity: 1, y: 0 }}
            exit={reduced ? {} : { opacity: 0, y: 10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile bottom tabs */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-cosmos bg-cosmos-bg/90 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-6xl px-2">
          <MobileTab to="/" label="Home" icon="dashboard" />
          <MobileTab to="/simulator" label="Sim" icon="simulator" />
          <MobileTab to="/quiz" label="Quiz" icon="quiz" />
          <MobileTab to="/game" label="Game" icon="game" />
          <MobileTab to="/leaderboard" label="Rank" icon="leaderboard" />
        </div>
      </div>
    </div>
  )
}

