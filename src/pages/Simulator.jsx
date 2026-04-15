import { useEffect, useMemo, useRef, useState } from 'react'
import { EMAIL_DATASET } from '../data/emails.js'
import { useAuth } from '../components/authContext.js'
import { calcAccuracy, clamp, round1 } from '../utils/scoring.js'
import { AnimatePresence, motion } from 'framer-motion'
import { usePrefersReducedMotion } from '../components/usePrefersReducedMotion.js'

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

function useTypewriter(text, { msPerChar = 12 } = {}) {
  const reduced = usePrefersReducedMotion()
  const [shown, setShown] = useState(reduced ? text : '')

  useEffect(() => {
    if (reduced) {
      setShown(text)
      return
    }
    setShown('')
    let i = 0
    const id = setInterval(() => {
      i += 2
      setShown(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, msPerChar)
    return () => clearInterval(id)
  }, [msPerChar, reduced, text])

  return shown
}

export function Simulator() {
  const { user, updateProgress } = useAuth()
  const reduced = usePrefersReducedMotion()

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
  const [streak, setStreak] = useState(0)
  const [modelThinking, setModelThinking] = useState(false)
  const [modelShown, setModelShown] = useState(null)
  const [lastYou, setLastYou] = useState(null)
  const thinkingTimerRef = useRef(null)

  const email = EMAIL_DATASET[index]
  const model = useMemo(() => fakeModelPrediction(email), [email])
  const typedEmail = useTypewriter(email.text, { msPerChar: 12 })

  useEffect(() => {
    // keep local view in sync after login switches
    setStats(initialStats)
  }, [initialStats])

  useEffect(() => {
    // reset per-email UI state
    setModelThinking(true)
    setModelShown(null)
    setLastYou(null)
    if (thinkingTimerRef.current) clearTimeout(thinkingTimerRef.current)
    thinkingTimerRef.current = setTimeout(() => {
      setModelThinking(false)
      setModelShown(model)
    }, reduced ? 0 : 600)
    return () => {
      if (thinkingTimerRef.current) clearTimeout(thinkingTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email.text])

  function markModuleDoneIfNeeded(nextProgress) {
    const existing = user?.progress?.modulesCompleted ?? []
    if (existing.includes('simulator')) return nextProgress
    return { ...nextProgress, modulesCompleted: [...existing, 'simulator'] }
  }

  function answer(youLabel) {
    const actual = email.label
    const ok = (youLabel === 'spam' && actual === 'spam') || (youLabel === 'ham' && actual === 'ham')

    setLastYou(youLabel)
    setStreak((s) => (ok ? s + 1 : 0))

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

  const accuracyRing = `conic-gradient(#06B6D4 ${Math.max(0, Math.min(100, stats.accuracy))}%, rgba(255,255,255,0.08) 0)`

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        {/* Live stats bar */}
        <div className="cosmos-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-cosmos-accent2/15 px-3 py-1.5 text-sm text-cosmos-text2">
                Accuracy <span className="font-heading font-semibold text-cosmos-text">{stats.accuracy}%</span>
              </div>
              <div className="rounded-full bg-cosmos-accent3/15 px-3 py-1.5 text-sm text-cosmos-text2">
                <span className="mr-1">🔥</span>Streak{' '}
                <span className="font-heading font-semibold text-cosmos-text">{streak}</span>
              </div>
              <div className="rounded-full bg-white/5 px-3 py-1.5 text-sm text-cosmos-text2">
                Attempts <span className="font-heading font-semibold text-cosmos-text">{stats.total}</span>
              </div>
            </div>
            <div className="text-xs text-cosmos-text2">
              Model confidence is simulated (70–95%).
            </div>
          </div>
        </div>

        {/* Email card */}
        <div className="relative cosmos-card overflow-hidden p-6">
          <div className="pointer-events-none absolute -right-28 -top-24 h-72 w-72 rounded-full bg-cosmos-accent1/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-28 h-72 w-72 rounded-full bg-cosmos-accent2/15 blur-3xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl font-semibold text-cosmos-text">
                Spam Detection Simulator
              </h1>
              <p className="mt-1 text-sm text-cosmos-text2">
                Decide fast. Learn faster. The cosmos keeps score.
              </p>
            </div>
            <div
              className="grid h-16 w-16 place-items-center rounded-full"
              style={{ background: accuracyRing }}
            >
              <div className="grid h-[54px] w-[54px] place-items-center rounded-full bg-cosmos-bg text-sm font-semibold text-cosmos-text">
                {Math.round(stats.accuracy)}%
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-cosmos bg-black/25 p-5">
            <div className="text-xs font-semibold uppercase tracking-widest text-cosmos-text2">
              Incoming email
            </div>
            <div className="mt-3 whitespace-pre-wrap font-body text-lg leading-relaxed text-cosmos-text">
              {typedEmail}
              <span className="ml-1 inline-block w-2 animate-caretBlink align-baseline text-cosmos-accent2">
                ▍
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <motion.button
              type="button"
              whileTap={reduced ? {} : { scale: 0.98 }}
              onClick={() => answer('spam')}
              className="min-h-[54px] rounded-full bg-gradient-to-r from-cosmos-danger to-rose-600 px-6 text-left text-sm font-semibold text-white shadow-[0_18px_40px_rgba(239,68,68,0.18)]"
            >
              <div className="flex items-center justify-between">
                <span>Spam</span>
                <span className="text-white/80">✗</span>
              </div>
            </motion.button>
            <motion.button
              type="button"
              whileTap={reduced ? {} : { scale: 0.98 }}
              onClick={() => answer('ham')}
              className="min-h-[54px] rounded-full bg-gradient-to-r from-cosmos-success to-emerald-400 px-6 text-right text-sm font-semibold text-white shadow-[0_18px_40px_rgba(16,185,129,0.16)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-white/80">✓</span>
                <span>Not Spam</span>
              </div>
            </motion.button>
          </div>

          {/* Feedback banner */}
          <AnimatePresence>
            {feedback ? (
              <motion.div
                key={`${feedback.ok}-${feedback.actual}-${feedback.you}`}
                className={[
                  'mt-5 rounded-2xl border px-4 py-3 text-sm',
                  feedback.ok
                    ? 'border-cosmos-success/30 bg-cosmos-success/10 text-emerald-50'
                    : 'border-cosmos-danger/30 bg-cosmos-danger/10 text-rose-50',
                ].join(' ')}
                initial={reduced ? false : { opacity: 0, y: -8 }}
                animate={reduced ? {} : { opacity: 1, y: 0 }}
                exit={reduced ? {} : { opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <div className="font-semibold">
                    {feedback.ok ? '✓ Correct! ' : '✗ Not quite. '}
                    <span className="text-white/80">
                      {feedback.ok ? 'Nice read.' : 'The cosmos disagrees… this time.'}
                    </span>
                  </div>
                  <div className="text-white/80">
                    Actual: <span className="font-semibold text-white">{feedback.actual}</span>
                  </div>
                  <div className="text-white/80">
                    You: <span className="font-semibold text-white">{feedback.you}</span>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* You vs Model */}
      <div className="space-y-6">
        <div className="cosmos-card p-6">
          <h2 className="font-heading text-lg font-semibold text-cosmos-text">You vs Model</h2>
          <p className="mt-1 text-sm text-cosmos-text2">
            Model “thinks” for 600ms, then reveals label + confidence.
          </p>

          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl border border-cosmos bg-black/20 p-4">
              <div className="text-xs text-cosmos-text2">Your choice</div>
              <div className="mt-1 flex items-center justify-between">
                <div className="font-heading text-xl font-semibold text-cosmos-text">
                  {lastYou || '—'}
                </div>
                <div className="text-xs text-cosmos-text2">instant</div>
              </div>
            </div>

            <div className="rounded-2xl border border-cosmos bg-black/20 p-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-cosmos-text2">Model prediction</div>
                {modelThinking ? (
                  <div className="text-xs text-cosmos-text2">
                    thinking<span className="inline-block w-6 text-left">…</span>
                  </div>
                ) : (
                  <div className="text-xs text-cosmos-text2">ready</div>
                )}
              </div>

              <div className="mt-2 flex items-end justify-between gap-3">
                <div className="font-heading text-xl font-semibold text-cosmos-text">
                  {modelShown?.label ?? '—'}
                </div>
                <div className="text-sm text-cosmos-text2">
                  <span className="font-semibold text-cosmos-text">
                    {modelShown?.confidence ?? '—'}%
                  </span>{' '}
                  conf.
                </div>
              </div>

              <div className="mt-3 h-2 w-full rounded-full bg-white/10">
                <motion.div
                  className="h-2 rounded-full bg-gradient-to-r from-cosmos-accent1 to-cosmos-accent2"
                  initial={reduced ? false : { width: 0 }}
                  animate={{ width: `${modelShown?.confidence ?? 0}%` }}
                  transition={{ duration: reduced ? 0 : 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-cosmos bg-black/20 p-4">
              <div className="text-xs text-cosmos-text2">Tip</div>
              <div className="mt-1 text-sm text-cosmos-text2">
                Look for “free”, “win”, “urgent”, “click” — those words push the decision boundary.
              </div>
            </div>
          </div>
        </div>

        <div className="cosmos-card p-6">
          <h2 className="font-heading text-lg font-semibold text-cosmos-text">Totals</h2>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-cosmos bg-black/20 p-4">
              <div className="text-xs text-cosmos-text2">Correct</div>
              <div className="mt-1 font-heading text-xl font-semibold text-cosmos-text">{stats.correct}</div>
            </div>
            <div className="rounded-2xl border border-cosmos bg-black/20 p-4">
              <div className="text-xs text-cosmos-text2">Attempts</div>
              <div className="mt-1 font-heading text-xl font-semibold text-cosmos-text">{stats.total}</div>
            </div>
            <div className="rounded-2xl border border-cosmos bg-black/20 p-4">
              <div className="text-xs text-cosmos-text2">Accuracy</div>
              <div className="mt-1 font-heading text-xl font-semibold text-cosmos-text">{stats.accuracy}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

