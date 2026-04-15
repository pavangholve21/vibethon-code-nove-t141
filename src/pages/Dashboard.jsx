import { Link } from 'react-router-dom'
import { useAuth } from '../components/authContext.js'
import { useCountUp } from '../components/useCountUp.js'
import { getAllAchievements } from '../utils/achievements.js'
import { leaderboardScore } from '../utils/scoring.js'
import { Icon } from '../components/NavIcons.jsx'
import { useEffect } from 'react'

function RingStat({ label, value, accent = 'accent2', hint }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0))
  const ring = `conic-gradient(#06B6D4 ${pct}%, rgba(255,255,255,0.08) 0)`
  return (
    <div className="cosmos-card cosmos-card-hover p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs text-cosmos-text2">{label}</div>
          <div className="mt-1 font-heading text-2xl font-semibold text-cosmos-text">
            {pct.toFixed(1)}%
          </div>
          {hint ? <div className="mt-2 text-xs text-cosmos-text2">{hint}</div> : null}
        </div>
        <div
          className="grid h-16 w-16 place-items-center rounded-full"
          style={{ background: ring }}
        >
          <div className="grid h-[54px] w-[54px] place-items-center rounded-full bg-cosmos-bg text-sm font-semibold text-cosmos-text">
            {Math.round(pct)}%
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, hint, accent = 'accent1', children }) {
  return (
    <div className="cosmos-card cosmos-card-hover p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs text-cosmos-text2">{label}</div>
          <div className="mt-1 font-heading text-2xl font-semibold text-cosmos-text">{value}</div>
          {hint ? <div className="mt-2 text-xs text-cosmos-text2">{hint}</div> : null}
        </div>
        {children ? (
          <div
            className={[
              'grid h-10 w-10 place-items-center rounded-xl',
              accent === 'accent3'
                ? 'bg-cosmos-accent3/15 text-cosmos-accent3'
                : accent === 'success'
                  ? 'bg-cosmos-success/15 text-cosmos-success'
                  : accent === 'accent2'
                    ? 'bg-cosmos-accent2/15 text-cosmos-accent2'
                    : 'bg-cosmos-accent1/15 text-cosmos-accent1',
            ].join(' ')}
          >
            {children}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function NavCard({ to, title, desc }) {
  return (
    <Link
      to={to}
      className="group cosmos-card cosmos-card-hover p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-cosmos-text">{title}</div>
          <div className="mt-1 text-sm text-cosmos-text2">{desc}</div>
        </div>
        <div className="text-cosmos-text2 transition group-hover:text-cosmos-accent2">→</div>
      </div>
    </Link>
  )
}

export function Dashboard() {
  const { user, updateProgress } = useAuth()

  useEffect(() => {
    const existing = user?.progress?.modulesCompleted ?? []
    if (existing.includes('dashboard')) return
    updateProgress({ modulesCompleted: [...existing, 'dashboard'] })
  }, [updateProgress, user])

  const modules = user?.progress?.modulesCompleted ?? []
  const quizScore = Number(user?.progress?.quizScore ?? 0)
  const simAcc = Number(user?.progress?.simulator?.accuracy ?? 0)
  const simTotal = Number(user?.progress?.simulator?.total ?? 0)
  const xp = leaderboardScore(user)
  const badges = user?.progress?.badges ?? []

  const moduleTargets = [
    { id: 'simulator', name: 'Simulator' },
    { id: 'learning', name: 'Learning' },
    { id: 'quiz', name: 'Quiz' },
    { id: 'game', name: 'Game' },
    { id: 'playground', name: 'Playground' },
    { id: 'leaderboard', name: 'Leaderboard' },
    { id: 'dashboard', name: 'Dashboard' },
  ]

  const completedCount = moduleTargets.filter((m) => modules.includes(m.id)).length
  const quizCount = useCountUp(quizScore, { durationMs: 800 })
  const modulesCount = useCountUp(completedCount, { durationMs: 900 })
  const xpCount = useCountUp(xp, { durationMs: 1100 })

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-cosmos bg-gradient-to-br from-cosmos-surface to-cosmos-surface2 p-6">
        <div className="pointer-events-none absolute -right-32 -top-28 h-80 w-80 rounded-full bg-cosmos-accent1/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-36 -left-36 h-96 w-96 rounded-full bg-cosmos-accent2/15 blur-3xl" />

        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-cosmos-accent1">Welcome back,</div>
            <h1 className="mt-1 font-heading text-[32px] font-semibold leading-tight text-cosmos-text">
              {user?.username}
              <span className="ml-1 inline-block w-2 align-baseline text-cosmos-accent2 animate-caretBlink">
                ▍
              </span>
            </h1>
            <p className="mt-2 max-w-xl text-sm text-cosmos-text2">
              You’re inside the <span className="text-cosmos-text">Neural Cosmos</span>. Train your intuition,
              earn XP, unlock achievements.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-full border border-cosmos bg-black/20 px-4 py-2 text-sm text-cosmos-text2">
              XP <span className="font-heading font-semibold text-cosmos-text">{Math.round(xpCount)}</span>
            </div>
            <div className="rounded-full border border-cosmos bg-black/20 px-4 py-2 text-sm text-cosmos-text2">
              Modules{' '}
              <span className="font-heading font-semibold text-cosmos-text">
                {Math.round(modulesCount)}/{moduleTargets.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Quiz Score" value={`${Math.round(quizCount)}/5`} hint="Answer one at a time" accent="accent1">
          <Icon name="quiz" className="h-5 w-5" />
        </StatCard>
        <RingStat label="Simulator Accuracy" value={simAcc} hint={simTotal ? `${simTotal} attempts` : 'No attempts yet'} />
        <StatCard label="Modules Done" value={`${Math.round(modulesCount)}/${moduleTargets.length}`} hint="Green checks = completed" accent="success">
          <Icon name="learning" className="h-5 w-5" />
        </StatCard>
        <StatCard label="Next Best Move" value="Simulator" hint="Most XP potential" accent="accent3">
          <span className="animate-pulse">➜</span>
        </StatCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-4 md:grid-cols-2">
          <NavCard
            to="/simulator"
            title="AI Decision Simulator"
            desc="Spam detection: You vs Model + accuracy tracking."
          />
          <NavCard
            to="/learning"
            title="Learning Module"
            desc="Classification basics + spam example + visual."
          />
          <NavCard to="/quiz" title="Quiz (5 MCQs)" desc="Answer and store your score." />
          <NavCard
            to="/game"
            title="Mini Game: Hyperparameters"
            desc="Sliders + overfitting warning + chart."
          />
          <NavCard
            to="/playground"
            title="Coding Playground"
            desc="Edit a threshold and run a simulated output."
          />
          <NavCard
            to="/leaderboard"
            title="Leaderboard (Local)"
            desc="Rank users by quiz + simulator accuracy."
          />
        </div>

        <div className="space-y-4">
          <div className="cosmos-card p-6">
            <h2 className="font-heading text-lg font-semibold text-cosmos-text">Progress checklist</h2>
            <div className="mt-4 space-y-2">
              {moduleTargets.map((m) => {
                const done = modules.includes(m.id)
                return (
                  <div
                    key={m.id}
                    className={[
                      'flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition',
                      done
                        ? 'border-cosmos-success/30 bg-cosmos-success/10 text-emerald-50'
                        : 'border-cosmos bg-black/20 text-cosmos-text2',
                    ].join(' ')}
                  >
                    <span className="font-semibold text-cosmos-text">{m.name}</span>
                    {done ? (
                      <span className="text-xs text-cosmos-success">✓</span>
                    ) : (
                      <span className="h-2 w-2 animate-pulse rounded-full bg-white/20" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="cosmos-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold text-cosmos-text">Badges</h2>
              <div className="text-xs text-cosmos-text2">{badges.length}/5</div>
            </div>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {getAllAchievements().map((a) => {
                const earned = badges.includes(a.id)
                return (
                  <div
                    key={a.id}
                    title={earned ? `${a.name} — earned` : `${a.name} — locked`}
                    className={[
                      'grid aspect-square place-items-center rounded-2xl border text-xl',
                      earned
                        ? 'border-cosmos-accent3/35 bg-cosmos-accent3/10 shadow-[0_0_25px_rgba(245,158,11,0.18)]'
                        : 'border-cosmos bg-black/20 opacity-50',
                    ].join(' ')}
                  >
                    {a.icon}
                  </div>
                )
              })}
            </div>
            <div className="mt-3 text-xs text-cosmos-text2">
              Unlock achievements as you explore modules.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

