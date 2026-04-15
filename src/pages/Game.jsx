import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { useAuth } from '../components/authContext.js'
import { clamp, round1 } from '../utils/scoring.js'
import { AnimatePresence, motion } from 'framer-motion'
import { usePrefersReducedMotion } from '../components/usePrefersReducedMotion.js'
import { useCountUp } from '../components/useCountUp.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

function fakeTrain({ learningRate, epochs }) {
  // Peak around lr ~ 0.2, epochs ~ 35; degrade when too high/low.
  const lrScore = 1 - Math.min(1, Math.abs(Math.log10(learningRate) - Math.log10(0.2)) / 1.2)
  const epochScore = 1 - Math.min(1, Math.abs(epochs - 35) / 55)
  const overfitPenalty = epochs > 70 ? (epochs - 70) * 0.35 : 0

  const noise = (Math.random() - 0.5) * 3.5
  const acc = clamp(55 + lrScore * 25 + epochScore * 20 - overfitPenalty + noise, 45, 98)

  const curve = []
  const valCurve = []
  const stepSize = Math.max(1, Math.floor(epochs / 20))
  for (let e = 1; e <= epochs; e += stepSize) {
    const growth = 1 - Math.exp(-e / 18)
    const val = clamp(50 + growth * (acc - 50) - (e > 70 ? (e - 70) * 0.2 : 0), 40, 99)
    curve.push(round1(val))
    const generalizationDrop = e > 70 ? (e - 70) * 0.35 : 0
    valCurve.push(round1(clamp(val - 2.5 - generalizationDrop + (Math.random() - 0.5) * 2.2, 35, 99)))
  }
  return { accuracy: round1(acc), curve, valCurve, steps: curve.length }
}

export function Game() {
  const { user, updateProgress } = useAuth()
  const reduced = usePrefersReducedMotion()
  const [learningRate, setLearningRate] = useState(0.2)
  const [epochs, setEpochs] = useState(35)
  const [result, setResult] = useState(() => ({ accuracy: 0, curve: [], valCurve: [], steps: 0 }))
  const [training, setTraining] = useState(false)
  const [trainPct, setTrainPct] = useState(0)
  const [trainStep, setTrainStep] = useState(0)
  const timerRef = useRef(null)

  const overfitting = epochs > 70
  const best = Number(user?.progress?.gameBestAccuracy ?? 0)
  const accuracyCount = useCountUp(result.accuracy || 0, { durationMs: 800 })

  const chartData = useMemo(() => {
    const labels = result.curve.map((_, i) => `Step ${i + 1}`)
    return {
      labels,
      datasets: [
        {
          label: 'Train accuracy',
          data: result.curve,
          borderColor: '#7C3AED',
          backgroundColor: 'rgba(124, 58, 237, 0.15)',
          pointRadius: 3,
          tension: 0.35,
        },
        {
          label: 'Val accuracy',
          data: result.valCurve,
          borderColor: '#06B6D4',
          borderDash: [6, 5],
          backgroundColor: 'rgba(6, 182, 212, 0.08)',
          pointRadius: 2,
          tension: 0.35,
        },
      ],
    }
  }, [result.curve, result.valCurve])

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: {
          display: true,
          labels: { color: 'rgba(241,245,249,0.75)', boxWidth: 10, usePointStyle: true },
        },
        tooltip: { enabled: true },
      },
      scales: {
        y: {
          min: 35,
          max: 100,
          grid: { color: 'rgba(255,255,255,0.06)' },
          ticks: { color: 'rgba(241,245,249,0.65)' },
        },
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: 'rgba(241,245,249,0.55)' },
        },
      },
    }),
    [],
  )

  function lrLabel(lr) {
    if (lr < 0.08) return 'Too slow'
    if (lr > 0.55) return 'Too fast'
    return 'Just right'
  }
  function epochLabel(e) {
    if (e < 15) return 'Underfitting'
    if (e > 70) return 'Overfitting'
    return 'Optimal'
  }

  function train() {
    if (training) return
    setTraining(true)
    setTrainPct(0)
    setTrainStep(0)

    const totalMs = 800
    const start = performance.now()
    const steps = Math.max(10, Math.min(30, Math.floor(epochs / 4)))

    function tick(now) {
      const t = Math.min(1, (now - start) / totalMs)
      setTrainPct(Math.round(t * 100))
      setTrainStep(Math.min(steps, Math.max(1, Math.round(t * steps))))
      if (t < 1) timerRef.current = requestAnimationFrame(tick)
      else {
        const next = fakeTrain({ learningRate, epochs })
        setResult(next)

        const existing = user?.progress?.modulesCompleted ?? []
        const nextModules = existing.includes('game') ? existing : [...existing, 'game']
        const nextBest = Math.max(best, next.accuracy)
        updateProgress({ modulesCompleted: nextModules, gameBestAccuracy: nextBest })
        setTraining(false)
      }
    }
    timerRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current)
    }
  }, [])

  const beatRecord = result.accuracy && result.accuracy >= best && best !== 0

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="cosmos-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl font-semibold text-cosmos-text">Train Your Model</h1>
              <p className="mt-2 text-sm text-cosmos-text2">
                Tune hyperparameters. Watch the neural curve. Avoid overfitting.
              </p>
            </div>
            <div className="rounded-full border border-cosmos bg-black/20 px-4 py-2 text-sm text-cosmos-text2">
              ⚙️ Hyperparameter Challenge
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-cosmos bg-black/20 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-cosmos-text">Learning rate</div>
                <div className="rounded-lg bg-white/10 px-2 py-1 text-xs text-cosmos-text2">
                  {learningRate.toFixed(2)}
                </div>
              </div>
              <input
                className="mt-4 w-full accent-[#7C3AED]"
                type="range"
                min="0.01"
                max="1"
                step="0.01"
                value={learningRate}
                onChange={(e) => setLearningRate(Number(e.target.value))}
              />
              <div className="mt-2 text-xs text-cosmos-text2">
                {lrLabel(learningRate)} • Too small = slow, too large = unstable.
              </div>
            </div>

            <div className="rounded-2xl border border-cosmos bg-black/20 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-cosmos-text">Epochs</div>
                <div className="rounded-lg bg-white/10 px-2 py-1 text-xs text-cosmos-text2">
                  {epochs}
                </div>
              </div>
              <input
                className="mt-4 w-full accent-[#06B6D4]"
                type="range"
                min="1"
                max="100"
                step="1"
                value={epochs}
                onChange={(e) => setEpochs(Number(e.target.value))}
              />
              <div className="mt-2 text-xs text-cosmos-text2">
                {epochLabel(epochs)} • More epochs help… until they don’t.
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-cosmos-text2">
              Accuracy:{' '}
              <span className="font-heading font-semibold text-cosmos-accent2">
                {result.accuracy ? `${round1(accuracyCount)}%` : '—'}
              </span>
              <AnimatePresence>
                {overfitting ? (
                  <motion.span
                    className="ml-3 inline-flex items-center gap-2 rounded-full border border-cosmos-danger/30 bg-cosmos-danger/10 px-3 py-1 text-xs text-rose-100"
                    initial={reduced ? false : { x: 0 }}
                    animate={reduced ? {} : { x: [0, -6, 6, -4, 4, 0] }}
                    transition={{ duration: 0.45 }}
                  >
                    🔥 Overfitting risk
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </div>
            <motion.button
              type="button"
              onClick={train}
              disabled={training}
              className={[
                'cosmos-button cosmos-button-primary min-w-[200px]',
                training ? 'opacity-80' : '',
              ].join(' ')}
              animate={training && !reduced ? { scale: [1, 1.02, 1] } : {}}
              transition={training && !reduced ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' } : {}}
            >
              {training ? 'Training…' : 'Train (simulate)'}
            </motion.button>
          </div>

          {/* Training progress */}
          <AnimatePresence>
            {training ? (
              <motion.div
                className="mt-4 rounded-2xl border border-cosmos bg-black/20 p-4"
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={reduced ? {} : { opacity: 1, y: 0 }}
                exit={reduced ? {} : { opacity: 0, y: 8 }}
              >
                <div className="flex items-center justify-between text-xs text-cosmos-text2">
                  <div>Epoch {trainStep}/{Math.max(10, Math.min(30, Math.floor(epochs / 4)))}</div>
                  <div>{trainPct}%</div>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-cosmos-accent1 to-cosmos-accent2"
                    style={{ width: `${trainPct}%` }}
                  />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="cosmos-card p-6">
          <h2 className="font-heading text-lg font-semibold text-cosmos-text">Training curve</h2>
          <p className="mt-1 text-sm text-cosmos-text2">
            Violet = train accuracy, cyan dashed = validation accuracy.
          </p>

          <div className="mt-4 rounded-2xl border border-cosmos bg-black/20 p-4">
            {result.curve.length ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <div className="py-10 text-center text-sm text-cosmos-text2">
                Click <span className="text-cosmos-text">Train</span> to generate a curve.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="cosmos-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-cosmos-text">Personal best</h2>
            {beatRecord ? (
              <span className="rounded-full border border-cosmos-accent3/30 bg-cosmos-accent3/10 px-3 py-1 text-xs text-amber-100">
                🏆 New record!
              </span>
            ) : null}
          </div>
          <div className="mt-4 rounded-2xl border border-cosmos bg-black/20 p-4">
            <div className="text-xs text-cosmos-text2">Best simulated accuracy</div>
            <div className="mt-1 font-heading text-4xl font-semibold text-cosmos-text">
              {best ? `${round1(best)}%` : '—'}
            </div>
          </div>
        </div>

        <div className="cosmos-card p-6">
          <h2 className="font-heading text-lg font-semibold text-cosmos-text">Coach</h2>
          <div className="mt-3 space-y-2 text-sm text-cosmos-text2">
            <div className="rounded-xl border border-cosmos bg-black/20 px-4 py-3">
              Learning rate wants to be near <span className="font-semibold text-cosmos-text">0.2</span>.
            </div>
            <div className="rounded-xl border border-cosmos bg-black/20 px-4 py-3">
              Epochs in the <span className="font-semibold text-cosmos-text">30–60</span> range tend to be stable.
            </div>
            <div className="rounded-xl border border-cosmos bg-black/20 px-4 py-3">
              If validation drops while train rises, you’re overfitting.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

