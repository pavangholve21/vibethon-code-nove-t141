import { useMemo } from 'react'
import { useAuth } from '../components/authContext.js'
import { loadUsers } from '../utils/storage.js'
import { leaderboardScore, round1 } from '../utils/scoring.js'

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
  const { user } = useAuth()

  const rows = useMemo(() => {
    const real = loadUsers()
    const map = new Map()
    for (const u of MOCK) map.set(u.username, u)
    for (const u of real) map.set(u.username, u)
    if (user) map.set(user.username, user)

    return Array.from(map.values())
      .map((u) => ({
        username: u.username,
        quiz: Number(u?.progress?.quizScore ?? 0),
        simAcc: Number(u?.progress?.simulator?.accuracy ?? 0),
        score: leaderboardScore(u),
        isYou: user?.username === u.username,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
  }, [user])

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-bold text-white">Leaderboard (Local)</h1>
        <p className="mt-2 text-sm text-slate-300">
          Ranking score = <span className="font-semibold text-white">quiz score + simulator accuracy</span>.
          This is a local demo (no backend).
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div className="grid grid-cols-12 gap-2 border-b border-white/10 bg-black/20 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          <div className="col-span-2">Rank</div>
          <div className="col-span-5">User</div>
          <div className="col-span-2 text-right">Quiz</div>
          <div className="col-span-2 text-right">Sim Acc</div>
          <div className="col-span-1 text-right">Score</div>
        </div>

        <div className="divide-y divide-white/10">
          {rows.map((r, i) => (
            <div
              key={r.username}
              className={[
                'grid grid-cols-12 items-center gap-2 px-4 py-3 text-sm',
                r.isYou ? 'bg-violet-500/10' : '',
              ].join(' ')}
            >
              <div className="col-span-2 text-slate-300">#{i + 1}</div>
              <div className="col-span-5 font-semibold text-white">
                {r.username} {r.isYou ? <span className="text-xs text-violet-200">(you)</span> : null}
              </div>
              <div className="col-span-2 text-right text-slate-200">{r.quiz}/5</div>
              <div className="col-span-2 text-right text-slate-200">{round1(r.simAcc)}%</div>
              <div className="col-span-1 text-right font-bold text-white">{r.score}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

