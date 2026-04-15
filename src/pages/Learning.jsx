import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../components/authContext.js'
import { AnimatePresence, motion } from 'framer-motion'
import { usePrefersReducedMotion } from '../components/usePrefersReducedMotion.js'

export function Learning() {
  const { user, updateProgress } = useAuth()
  const reduced = usePrefersReducedMotion()
  const [showToast, setShowToast] = useState(false)
  const [flip, setFlip] = useState(false)

  useEffect(() => {
    const existing = user?.progress?.modulesCompleted ?? []
    if (existing.includes('learning')) return
    updateProgress({ modulesCompleted: [...existing, 'learning'] })
    setShowToast(true)
  }, [updateProgress, user])

  useEffect(() => {
    if (!showToast) return
    const t = setTimeout(() => setShowToast(false), 2600)
    return () => clearTimeout(t)
  }, [showToast])

  const draw = useMemo(() => {
    // simple two-region boundary curve
    return 'M10,120 C80,55 150,170 220,105 C290,40 360,160 430,95'
  }, [])

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden cosmos-card p-6">
        <div className="pointer-events-none absolute -right-28 -top-24 h-72 w-72 rounded-full bg-cosmos-accent1/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-28 h-72 w-72 rounded-full bg-cosmos-accent2/15 blur-3xl" />

        <h1 className="font-heading text-3xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cosmos-accent1 via-cosmos-accent2 to-cosmos-accent3">
          Learn: AIML Fundamentals
        </h1>
        <p className="mt-3 text-sm text-cosmos-text2">
          Classification is when a model assigns an input to a category (a “label”).
          In spam detection, the labels are often <span className="font-semibold text-white">spam</span> and{' '}
          <span className="font-semibold text-white">not spam</span>.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="cosmos-card cosmos-card-hover p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-cosmos-accent1/15 text-cosmos-accent1">
              🧠
            </div>
            <div className="text-sm font-semibold text-cosmos-text">1) Features</div>
          </div>
          <p className="mt-3 text-sm text-cosmos-text2">
            We turn text into signals (words, patterns, counts). These signals help decide the label.
          </p>
        </div>
        <div className="cosmos-card cosmos-card-hover p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-cosmos-accent2/15 text-cosmos-accent2">
              📈
            </div>
            <div className="text-sm font-semibold text-cosmos-text">2) Decision rule</div>
          </div>
          <p className="mt-3 text-sm text-cosmos-text2">
            A model learns a boundary. If the score is above a threshold, it predicts “spam”.
          </p>
        </div>
        <div className="cosmos-card cosmos-card-hover p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-cosmos-accent3/15 text-cosmos-accent3">
              {'</>'}
            </div>
            <div className="text-sm font-semibold text-cosmos-text">3) Accuracy</div>
          </div>
          <p className="mt-3 text-sm text-cosmos-text2">
            Accuracy = correct predictions / total predictions. Great for a quick evaluation.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="cosmos-card p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-semibold text-cosmos-text">Spam detection example</h2>
              <p className="mt-1 text-sm text-cosmos-text2">
                Tap the card to flip (front: raw email, back: classification result).
              </p>
            </div>
            <button type="button" className="cosmos-ghost" onClick={() => setFlip((f) => !f)}>
              Flip
            </button>
          </div>

          <div className="mt-5 perspective-[1200px]">
            <motion.div
              className="relative h-44 w-full"
              animate={reduced ? {} : { rotateY: flip ? 180 : 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              style={{ transformStyle: 'preserve-3d' }}
              onClick={() => setFlip((f) => !f)}
            >
              <div
                className="absolute inset-0 rounded-2xl border border-cosmos bg-black/25 p-5"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="text-xs font-semibold uppercase tracking-widest text-cosmos-text2">Email</div>
                <div className="mt-3 text-base text-cosmos-text">
                  “Win money now!!! Click here to claim your prize.”
                </div>
                <div className="mt-3 text-sm text-cosmos-text2">
                  Hints: <span className="text-cosmos-text">win</span>, <span className="text-cosmos-text">prize</span>, <span className="text-cosmos-text">click</span>
                </div>
              </div>

              <div
                className="absolute inset-0 rounded-2xl border border-cosmos bg-black/25 p-5"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <div className="text-xs font-semibold uppercase tracking-widest text-cosmos-text2">
                  Classification
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="font-heading text-2xl font-semibold text-cosmos-danger">spam</div>
                  <div className="text-sm text-cosmos-text2">
                    Confidence <span className="font-semibold text-cosmos-text">92%</span>
                  </div>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-white/10">
                  <div className="h-2 w-[92%] rounded-full bg-gradient-to-r from-cosmos-accent1 to-cosmos-accent2" />
                </div>
                <div className="mt-3 text-sm text-cosmos-text2">
                  Think: <span className="font-semibold text-cosmos-text">score → threshold → label</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="cosmos-card p-6">
          <h2 className="font-heading text-lg font-semibold text-cosmos-text">Decision boundary</h2>
          <p className="mt-2 text-sm text-cosmos-text2">
            Regions show where the model leans “ham” vs “spam”.
          </p>

          <div className="mt-5 rounded-2xl border border-cosmos bg-black/20 p-4">
            <svg viewBox="0 0 440 160" className="h-40 w-full">
              <defs>
                <linearGradient id="ham" x1="0" x2="1">
                  <stop offset="0" stopColor="#06B6D4" stopOpacity="0.30" />
                  <stop offset="1" stopColor="#06B6D4" stopOpacity="0.05" />
                </linearGradient>
                <linearGradient id="spam" x1="0" x2="1">
                  <stop offset="0" stopColor="#EF4444" stopOpacity="0.12" />
                  <stop offset="1" stopColor="#EF4444" stopOpacity="0.30" />
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="440" height="160" rx="18" fill="rgba(255,255,255,0.02)" />
              <path d="M0,0 L0,160 L440,160 L440,0 Z" fill="url(#ham)" opacity="0.35" />
              <path d="M0,0 L0,160 L440,160 L440,0 Z" fill="url(#spam)" opacity="0.22" />
              <motion.path
                d={draw}
                stroke="#06B6D4"
                strokeWidth="3"
                fill="none"
                initial={reduced ? false : { pathLength: 0 }}
                animate={reduced ? {} : { pathLength: 1 }}
                transition={{ duration: 1.1, ease: 'easeOut' }}
              />
              <text x="18" y="28" fill="#94A3B8" fontSize="12">
                ham region
              </text>
              <text x="350" y="28" fill="#94A3B8" fontSize="12">
                spam region
              </text>
            </svg>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showToast ? (
          <motion.div
            className="fixed right-4 top-20 z-[65] rounded-2xl border border-cosmos bg-gradient-to-br from-cosmos-surface to-cosmos-surface2 px-4 py-3 text-sm text-cosmos-text shadow-[0_20px_50px_rgba(124,58,237,0.2)]"
            initial={reduced ? false : { opacity: 0, y: -14 }}
            animate={reduced ? {} : { opacity: 1, y: 0 }}
            exit={reduced ? {} : { opacity: 0, y: -14 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <span className="mr-2">✨</span>
            Module Complete!
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

