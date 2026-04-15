import { useEffect, useMemo, useState } from 'react'
import { EMAIL_DATASET } from '../data/emails.js'
import { useAuth } from '../components/authContext.js'
import { calcAccuracy, clamp, round1 } from '../utils/scoring.js'

function pickNextIndex(current, total) {
  if (total <= 1) return 0
  let next = Math.floor(Math.random() * total)
  if (next === current) next = (next + 1) % total
  return next
}

function fakeModelPrediction(email) {
  const text = email.text.toLowerCase()
  const spamHints = ['win', 'prize', 'free', 'gift card', 'urgent', 'offer', 'jackpot', 'click']
  const score = spamHints.reduce((acc, hint) => acc + (text.includes(hint) ? 1 : 0), 0)

  const baseSpam = score >= 2
  const flip = Math.random() < 0.18
  const label = flip ? (baseSpam ? 'ham' : 'spam') : baseSpam ? 'spam' : 'ham'
  const confidence = clamp(70 + Math.random() * 25 + score * 2, 70, 95)

  return { label, confidence: round1(confidence) }
}

export function Simulator() {
  const { user, updateProgress } = useAuth()

  const initialStats = useMemo(() => {
    const sim = user?.progress?.simulator
    return {
      correct: Number(sim?.correct ?? 0),
      total: Number(sim?.total ?? 0),
      accuracy: Number(sim?.accuracy ?? 0),
    }
  }, [user])

  const [index, setIndex] = useState(0)
  const [feedback, setFeedback] = useState(null) // { ok, actual, you, model, confidence }
  const [stats, setStats] = useState(initialStats)

  const email = EMAIL_DATASET[index]
  const model = useMemo(() => fakeModelPrediction(email), [email])

  useEffect(() => {
    // keep local view in sync after login switches
    setStats(initialStats)
  }, [initialStats])

  function markModuleDoneIfNeeded(nextProgress) {
    const existing = user?.progress?.modulesCompleted ?? []
    if (existing.includes('simulator')) return nextProgress
    return { ...nextProgress, modulesCompleted: [...existing, 'simulator'] }
  }

  function answer(youLabel) {
    const actual = email.label
    const ok = (youLabel === 'spam' && actual === 'spam') || (youLabel === 'ham' && actual === 'ham')

    setStats((prev) => {
      const nextCorrect = prev.correct + (ok ? 1 : 0)
      const nextTotal = prev.total + 1
      const nextAccuracy = round1(calcAccuracy(nextCorrect, nextTotal))
      const next = { correct: nextCorrect, total: nextTotal, accuracy: nextAccuracy }

      const nextProgress = markModuleDoneIfNeeded({
        simulator: next,
      })
      updateProgress(nextProgress)
      return next
    })

    setFeedback({
      ok,
      actual,
      you: youLabel,
      model: model.label,
      confidence: model.confidence,
    })

    setIndex((prev) => pickNextIndex(prev, EMAIL_DATASET.length))
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">AI Decision Simulator</h1>
              <p className="mt-1 text-sm text-slate-300">
                Classify emails as <span className="font-semibold text-white">Spam</span> or{' '}
                <span className="font-semibold text-white">Not Spam</span>.
              </p>
            </div>
            <div className="rounded-xl bg-black/30 px-3 py-2 text-xs text-slate-300">
              Fake model confidence: <span className="font-semibold text-white">70–95%</span>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Email
            </div>
            <div className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-slate-100">
              {email.text}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => answer('spam')}
              className="flex-1 rounded-xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-400"
            >
              Spam
            </button>
            <button
              type="button"
              onClick={() => answer('ham')}
              className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-400"
            >
              Not Spam
            </button>
          </div>

          {feedback ? (
            <div
              className={[
                'mt-5 rounded-2xl border px-4 py-3 text-sm',
                feedback.ok
                  ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-50'
                  : 'border-rose-400/30 bg-rose-500/10 text-rose-50',
              ].join(' ')}
            >
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <div className="font-semibold">
                  {feedback.ok ? 'Correct!' : 'Not quite.'}
                </div>
                <div className="text-white/80">
                  Actual: <span className="font-semibold text-white">{feedback.actual}</span>
                </div>
                <div className="text-white/80">
                  You: <span className="font-semibold text-white">{feedback.you}</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-bold text-white">Your stats</h2>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-black/30 p-3">
              <div className="text-xs text-slate-400">Correct</div>
              <div className="mt-1 text-xl font-bold text-white">{stats.correct}</div>
            </div>
            <div className="rounded-xl bg-black/30 p-3">
              <div className="text-xs text-slate-400">Attempts</div>
              <div className="mt-1 text-xl font-bold text-white">{stats.total}</div>
            </div>
            <div className="rounded-xl bg-black/30 p-3">
              <div className="text-xs text-slate-400">Accuracy</div>
              <div className="mt-1 text-xl font-bold text-white">{stats.accuracy}%</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-bold text-white">You vs Model</h2>
          <p className="mt-1 text-sm text-slate-300">
            The model gives a label + a confidence score (simulated).
          </p>

          <div className="mt-4 space-y-3">
            <div className="rounded-xl bg-black/30 p-4">
              <div className="text-xs text-slate-400">Model prediction</div>
              <div className="mt-1 flex items-center justify-between">
                <div className="text-base font-semibold text-white">{model.label}</div>
                <div className="text-sm text-slate-200">
                  {model.confidence}% <span className="text-slate-400">conf.</span>
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-black/30 p-4">
              <div className="text-xs text-slate-400">Tip</div>
              <div className="mt-1 text-sm text-slate-200">
                Classification often uses a threshold. Words like “free”, “win”, “urgent” can shift the decision boundary.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

