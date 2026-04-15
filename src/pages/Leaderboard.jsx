import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../components/authContext.js'
import { loadUsers } from '../utils/storage.js'
import { leaderboardScore, round1 } from '../utils/scoring.js'
import { AnimatePresence, motion } from 'framer-motion'
import { usePrefersReducedMotion } from '../components/usePrefersReducedMotion.js'

const MOCK = [
  {
    username: 'Ada',
    progress: { quizScore: 5, simulator: { accuracy: 88.2 }, modulesCompleted: ['simulator', 'quiz'] },
  },
  {
    username: 'Turing',
    progress: { quizScore: 4, simulator: { accuracy: 91.7 }, modulesCompleted: ['simulator', 'learning', 'quiz'] },
  },
  {
    username: 'Hopper',
    progress: { quizScore: 3, simulator: { accuracy: 85.5 }, modulesCompleted: ['learning', 'quiz'] },
  },
]

export function Leaderboard() {
  const { user, updateProgress } = useAuth()
  const reduced = usePrefersReducedMotion()
  const [seed, setSeed] = useState(0)

  useEffect(() => {
    const existing = user?.progress?.modulesCompleted ?? []
    if (existing.includes('leaderboard')) return
    updateProgress({ modulesCompleted: [...existing, 'leaderboard'] })
  }, [updateProgress, user])

  const rows = useMemo(() => {
    const real = loadUsers()
    const map = new Map()
    for (const u of MOCK) map.set(u.username, u)
    for (const u of real) map.set(u.username, u)
    if (user) map.set(user.username, user)

    const arr = Array.from(map.values())
      .map((u) => ({
        username: u.username,
        quiz: Number(u?.progress?.quizScore ?? 0),
        simAcc: Number(u?.progress?.simulator?.accuracy ?? 0),
        score: leaderboardScore(u),
        isYou: user?.username === u.username,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
    return arr
  }, [seed, user])

  const podium = rows.slice(0, 3)
  const rest = rows.slice(3)

  return (
    <div className="space-y-6">
      <div className="cosmos-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-cosmos-text">Leaderboard</h1>
            <p className="mt-2 text-sm text-cosmos-text2">
              Score = <span className="font-semibold text-cosmos-text">quiz score + simulator accuracy</span>. Local demo (no backend).
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSeed((s) => s + 1)}
            className="cosmos-ghost flex items-center gap-2"
            title="Refresh & re-animate"
          >
            <motion.span
              animate={reduced ? {} : { rotate: 360 }}
              transition={reduced ? {} : { duration: 0.8, ease: 'easeOut' }}
              key={seed}
            >
              ⟳
            </motion.span>
            Refresh
          </button>
        </div>
      </div>

      {/* Podium */}
      <div className="cosmos-card overflow-hidden p-6">
        <div className="font-heading text-sm font-semibold text-cosmos-text">Top 3</div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            { idx: 1, height: 'h-32', medal: 'bg-gradient-to-br from-slate-200/40 to-slate-400/10', label: '2nd' },
            { idx: 0, height: 'h-40', medal: 'bg-gradient-to-br from-amber-300/45 to-amber-600/10', label: '1st' },
            { idx: 2, height: 'h-28', medal: 'bg-gradient-to-br from-orange-300/35 to-orange-600/10', label: '3rd' },
          ].map((slot) => {
            const r = podium[slot.idx]
            const crown = slot.label === '1st' ? ' 👑' : ''
            return (
              <motion.div
                key={`${slot.label}-${r?.username}-${seed}`}
                className="relative rounded-2xl border border-cosmos bg-black/20 p-5"
                initial={reduced ? false : { y: 40, opacity: 0 }}
                animate={reduced ? {} : { y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 240, damping: 24, delay: slot.idx * 0.08 }}
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs text-cosmos-text2">{slot.label}</div>
                  <div className={['grid h-9 w-9 place-items-center rounded-xl border border-cosmos', slot.medal].join(' ')}>
                    <span className="text-sm">🏅</span>
                  </div>
                </div>
                <div className="mt-3 font-heading text-xl font-semibold text-cosmos-text">
                  {r?.username ?? '—'}{slot.label === '1st' ? <span className="ml-1">{crown}</span> : null}
                </div>
                <div className="mt-1 text-sm text-cosmos-text2">
                  Score <span className="font-semibold text-cosmos-text">{r?.score ?? 0}</span>
                </div>
                <div className="mt-4">
                  <div className={['w-full rounded-2xl bg-gradient-to-b from-white/5 to-white/0', slot.height].join(' ')} />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-cosmos bg-gradient-to-br from-cosmos-surface to-cosmos-surface2">
        <div className="grid grid-cols-12 gap-2 border-b border-cosmos bg-black/20 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-cosmos-text2">
          <div className="col-span-2">Rank</div>
          <div className="col-span-5">User</div>
          <div className="col-span-2 text-right">Quiz</div>
          <div className="col-span-2 text-right">Sim Acc</div>
          <div className="col-span-1 text-right">Score</div>
        </div>

        <motion.div
          key={`rows-${seed}`}
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.05 } },
          }}
          className="divide-y divide-cosmos"
        >
          {rows.map((r, i) => (
            <motion.div
              key={r.username}
              variants={{
                hidden: reduced ? {} : { opacity: 0, y: 8 },
                show: reduced ? {} : { opacity: 1, y: 0 },
              }}
              className={[
                'grid grid-cols-12 items-center gap-2 px-4 py-3 text-sm',
                i === 0 ? 'relative' : '',
                r.isYou ? 'bg-cosmos-accent1/10 border-l-2 border-cosmos-accent1' : '',
                i % 2 === 1 ? 'bg-black/10' : '',
              ].join(' ')}
            >
              <div className="col-span-2 text-cosmos-text2">#{i + 1}</div>
              <div className="col-span-5 font-semibold text-cosmos-text">
                {r.username}{' '}
                {i === 0 ? (
                  <span className="ml-1 inline-block rounded-full bg-amber-300/15 px-2 py-0.5 text-xs text-amber-200">
                    #1 ✨
                  </span>
                ) : null}{' '}
                {r.isYou ? <span className="text-xs text-cosmos-accent1">(you)</span> : null}
              </div>
              <div className="col-span-2 text-right text-cosmos-text2">{r.quiz}/5</div>
              <div className="col-span-2 text-right text-cosmos-text2">{round1(r.simAcc)}%</div>
              <div className="col-span-1 text-right font-heading font-semibold text-cosmos-text">
                {r.score}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

