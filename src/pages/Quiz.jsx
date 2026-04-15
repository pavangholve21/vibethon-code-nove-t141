import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../components/authContext.js'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { usePrefersReducedMotion } from '../components/usePrefersReducedMotion.js'

const QUESTIONS = [
  {
    id: 'q1',
    question: 'What is classification in machine learning?',
    options: [
      'Predicting a continuous number',
      'Assigning an input to a category (label)',
      'Sorting data alphabetically',
      'Compressing data into fewer bits',
    ],
    answerIndex: 1,
  },
  {
    id: 'q2',
    question: 'In spam detection, the labels are usually…',
    options: ['spam vs ham (not spam)', 'large vs small', 'image vs text', 'fast vs slow'],
    answerIndex: 0,
  },
  {
    id: 'q3',
    question: 'Accuracy is best described as…',
    options: [
      'correct predictions / total predictions',
      'number of features in the dataset',
      'the model’s confidence score',
      'the number of training epochs',
    ],
    answerIndex: 0,
  },
  {
    id: 'q4',
    question: 'A “threshold” is commonly used to…',
    options: [
      'convert a score into a final class label',
      'shuffle the training data',
      'reduce overfitting automatically',
      'increase the dataset size',
    ],
    answerIndex: 0,
  },
  {
    id: 'q5',
    question: 'Overfitting means the model…',
    options: [
      'performs well on new data but poorly on training data',
      'performs well on training data but poorly on new data',
      'has too few parameters to learn anything',
      'cannot be evaluated with accuracy',
    ],
    answerIndex: 1,
  },
]

export function Quiz() {
  const { user, updateProgress } = useAuth()
  const reduced = usePrefersReducedMotion()

  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState(() => QUESTIONS.map(() => null))
  const [submitted, setSubmitted] = useState(false)
  const [showResult, setShowResult] = useState(false)

  const score = useMemo(() => {
    let s = 0
    for (let i = 0; i < QUESTIONS.length; i++) {
      if (selected[i] === QUESTIONS[i].answerIndex) s += 1
    }
    return s
  }, [selected])

  function canSubmit() {
    return selected.every((v) => v !== null)
  }

  function submit() {
    if (!canSubmit()) return
    setSubmitted(true)
    setShowResult(true)

    const existing = user?.progress?.modulesCompleted ?? []
    const nextModules = existing.includes('quiz') ? existing : [...existing, 'quiz']
    updateProgress({ modulesCompleted: nextModules, quizScore: score })
  }

  useEffect(() => {
    if (!showResult) return
    if (reduced) return
    if (score >= 3) {
      confetti({
        particleCount: 120,
        spread: 75,
        origin: { y: 0.65 },
        colors: ['#7C3AED', '#06B6D4', '#F59E0B', '#10B981'],
      })
    }
  }, [reduced, score, showResult])

  const q = QUESTIONS[step]
  const progressPct = Math.round(((step + 1) / QUESTIONS.length) * 100)

  return (
    <div className="space-y-6">
      <div className="cosmos-card p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-cosmos-text">Quiz: Classification</h1>
            <p className="mt-2 text-sm text-cosmos-text2">
              One question at a time. Your score is saved locally.
            </p>
          </div>
          <div className="rounded-full border border-cosmos bg-black/20 px-4 py-2 text-sm text-cosmos-text2">
            Progress{' '}
            <span className="font-heading font-semibold text-cosmos-text">
              {step + 1}/{QUESTIONS.length}
            </span>
          </div>
        </div>

        <div className="mt-4 h-2 w-full rounded-full bg-white/10">
          <motion.div
            className="h-2 rounded-full bg-gradient-to-r from-cosmos-accent1 to-cosmos-accent2"
            initial={reduced ? false : { width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: reduced ? 0 : 0.35, ease: 'easeOut' }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={q.id}
          className="cosmos-card p-6"
          initial={reduced ? false : { opacity: 0, x: 24 }}
          animate={reduced ? {} : { opacity: 1, x: 0 }}
          exit={reduced ? {} : { opacity: 0, x: -24 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <div className="text-sm font-semibold text-cosmos-text">
            {step + 1}. {q.question}
          </div>
          <div className="mt-4 grid gap-2">
            {q.options.map((opt, optIdx) => {
              const picked = selected[step]
              const isPicked = picked === optIdx
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={submitted}
                  onClick={() => {
                    setSelected((prev) => {
                      const next = [...prev]
                      next[step] = optIdx
                      return next
                    })
                    if (step < QUESTIONS.length - 1) setStep((s) => s + 1)
                  }}
                  className={[
                    'rounded-full border px-4 py-3 text-left text-sm transition',
                    isPicked
                      ? 'border-cosmos-accent1/50 bg-cosmos-accent1/15 text-cosmos-text'
                      : 'border-cosmos bg-black/20 text-cosmos-text2 hover:bg-black/30 hover:text-cosmos-text',
                  ].join(' ')}
                >
                  {opt}
                </button>
              )
            })}
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-cosmos-text2">
              Selected: <span className="font-semibold text-cosmos-text">{selected[step] === null ? '—' : q.options[selected[step]]}</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="cosmos-ghost"
                disabled={step === 0}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
              >
                Back
              </button>
              {step === QUESTIONS.length - 1 ? (
                <button
                  type="button"
                  onClick={submit}
                  disabled={submitted || !canSubmit()}
                  className={[
                    'cosmos-button cosmos-button-primary',
                    submitted || !canSubmit() ? 'opacity-50' : '',
                  ].join(' ')}
                >
                  Submit
                </button>
              ) : (
                <button
                  type="button"
                  className="cosmos-button cosmos-button-primary"
                  disabled={selected[step] === null}
                  onClick={() => setStep((s) => Math.min(QUESTIONS.length - 1, s + 1))}
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showResult ? (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4"
            initial={reduced ? false : { opacity: 0 }}
            animate={reduced ? {} : { opacity: 1 }}
            exit={reduced ? {} : { opacity: 0 }}
            onClick={() => setShowResult(false)}
          >
            <motion.div
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-cosmos bg-gradient-to-br from-cosmos-surface to-cosmos-surface2 p-7 shadow-[0_30px_90px_rgba(6,182,212,0.12)]"
              initial={reduced ? false : { y: 16, scale: 0.98, opacity: 0 }}
              animate={reduced ? {} : { y: 0, scale: 1, opacity: 1 }}
              exit={reduced ? {} : { y: 10, scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-cosmos-accent1/25 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-cosmos-accent2/20 blur-3xl" />

              <div className="text-center">
                <div className="font-heading text-xs font-semibold tracking-widest text-cosmos-accent2">
                  QUIZ COMPLETE
                </div>
                <div className="mt-2 font-heading text-5xl font-semibold text-cosmos-text">
                  {score}/{QUESTIONS.length}
                </div>
                <div className="mt-2 text-sm text-cosmos-text2">
                  {score >= 3 ? 'Neural signal detected. Nice.' : 'Signal is weak — retry after Learning.'}
                </div>
                <div className="mt-6 flex justify-center gap-2">
                  <button type="button" className="cosmos-ghost" onClick={() => setShowResult(false)}>
                    Close
                  </button>
                  <button
                    type="button"
                    className="cosmos-button cosmos-button-primary"
                    onClick={() => {
                      setSelected(QUESTIONS.map(() => null))
                      setStep(0)
                      setSubmitted(false)
                      setShowResult(false)
                    }}
                  >
                    Try again
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

