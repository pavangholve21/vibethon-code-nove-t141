import { Link } from 'react-router-dom'
import { useAuth } from '../components/authContext.js'

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="mt-1 text-2xl font-bold text-white">{value}</div>
      {hint ? <div className="mt-2 text-xs text-slate-400">{hint}</div> : null}
    </div>
  )
}

function NavCard({ to, title, desc }) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-white">{title}</div>
          <div className="mt-1 text-sm text-slate-300">{desc}</div>
        </div>
        <div className="text-slate-400 transition group-hover:text-slate-200">→</div>
      </div>
    </Link>
  )
}

export function Dashboard() {
  const { user } = useAuth()

  const modules = user?.progress?.modulesCompleted ?? []
  const quizScore = Number(user?.progress?.quizScore ?? 0)
  const simAcc = Number(user?.progress?.simulator?.accuracy ?? 0)
  const simTotal = Number(user?.progress?.simulator?.total ?? 0)

  const moduleTargets = [
    { id: 'simulator', name: 'Simulator' },
    { id: 'learning', name: 'Learning' },
    { id: 'quiz', name: 'Quiz' },
    { id: 'game', name: 'Game' },
    { id: 'playground', name: 'Playground' },
  ]

  const completedCount = moduleTargets.filter((m) => modules.includes(m.id)).length

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/20 to-cyan-500/10 p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-violet-100">Welcome back</div>
            <h1 className="mt-1 text-2xl font-bold text-white">{user?.username}</h1>
            <p className="mt-2 text-sm text-slate-200">
              Your progress is saved locally. Finish modules to climb the leaderboard.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-200">
            Modules completed:{' '}
            <span className="font-bold text-white">
              {completedCount}/{moduleTargets.length}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Quiz score" value={`${quizScore}/5`} hint="Stored in localStorage" />
        <StatCard
          label="Simulator accuracy"
          value={`${simAcc}%`}
          hint={simTotal ? `${simTotal} attempts` : 'No attempts yet'}
        />
        <StatCard
          label="Modules done"
          value={completedCount}
          hint="Complete Simulator, Learning, Quiz, Game, Playground"
        />
        <StatCard label="Next best move" value="Simulator" hint="Fastest way to earn points" />
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

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-bold text-white">Progress checklist</h2>
          <div className="mt-4 space-y-2">
            {moduleTargets.map((m) => {
              const done = modules.includes(m.id)
              return (
                <div
                  key={m.id}
                  className={[
                    'flex items-center justify-between rounded-xl border px-4 py-3 text-sm',
                    done
                      ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-50'
                      : 'border-white/10 bg-black/20 text-slate-200',
                  ].join(' ')}
                >
                  <span className="font-semibold">{m.name}</span>
                  <span className="text-xs">{done ? 'Completed' : 'Pending'}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

