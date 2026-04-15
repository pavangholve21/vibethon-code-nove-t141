import { useMemo, useState } from 'react'
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

function fakeTrain({ learningRate, epochs }) {
  // Peak around lr ~ 0.2, epochs ~ 35; degrade when too high/low.
  const lrScore = 1 - Math.min(1, Math.abs(Math.log10(learningRate) - Math.log10(0.2)) / 1.2)
  const epochScore = 1 - Math.min(1, Math.abs(epochs - 35) / 55)
  const overfitPenalty = epochs > 70 ? (epochs - 70) * 0.35 : 0

  const noise = (Math.random() - 0.5) * 3.5
  const acc = clamp(55 + lrScore * 25 + epochScore * 20 - overfitPenalty + noise, 45, 98)

  const curve = []
  for (let e = 1; e <= epochs; e += Math.max(1, Math.floor(epochs / 20))) {
    const growth = 1 - Math.exp(-e / 18)
    const val = clamp(50 + growth * (acc - 50) - (e > 70 ? (e - 70) * 0.2 : 0), 40, 99)
    curve.push(round1(val))
  }
  return { accuracy: round1(acc), curve }
}

export function Game() {
  const { user, updateProgress } = useAuth()
  const [learningRate, setLearningRate] = useState(0.2)
  const [epochs, setEpochs] = useState(35)
  const [result, setResult] = useState(() => ({ accuracy: 0, curve: [] }))

  const overfitting = epochs > 70
  const best = Number(user?.progress?.gameBestAccuracy ?? 0)

  const chartData = useMemo(() => {
    const labels = result.curve.map((_, i) => `Step ${i + 1}`)
    return {
      labels,
      datasets: [
        {
          label: 'Accuracy',
          data: result.curve,
          borderColor: 'rgba(167, 139, 250, 1)',
          backgroundColor: 'rgba(167, 139, 250, 0.15)',
          pointRadius: 3,
          tension: 0.35,
        },
      ],
    }
  }, [result.curve])

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
      },
      scales: {
        y: { min: 40, max: 100, ticks: { color: 'rgba(226,232,240,0.7)' } },
        x: { ticks: { color: 'rgba(226,232,240,0.6)' } },
      },
    }),
    [],
  )

  function train() {
    const next = fakeTrain({ learningRate, epochs })
    setResult(next)

    const existing = user?.progress?.modulesCompleted ?? []
    const nextModules = existing.includes('game') ? existing : [...existing, 'game']
    const nextBest = Math.max(best, next.accuracy)
    updateProgress({ modulesCompleted: nextModules, gameBestAccuracy: nextBest })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h1 className="text-2xl font-bold text-white">Mini Game: Hyperparameter Challenge</h1>
          <p className="mt-2 text-sm text-slate-300">
            Tune learning rate + epochs to maximize accuracy (simulated). Watch for overfitting.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-white">Learning rate</div>
                <div className="rounded-lg bg-white/10 px-2 py-1 text-xs text-slate-200">
                  {learningRate.toFixed(2)}
                </div>
              </div>
              <input
                className="mt-4 w-full"
                type="range"
                min="0.01"
                max="1"
                step="0.01"
                value={learningRate}
                onChange={(e) => setLearningRate(Number(e.target.value))}
              />
              <div className="mt-2 text-xs text-slate-400">
                Too small = slow learning. Too large = unstable updates.
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-white">Epochs</div>
                <div className="rounded-lg bg-white/10 px-2 py-1 text-xs text-slate-200">
                  {epochs}
                </div>
              </div>
              <input
                className="mt-4 w-full"
                type="range"
                min="1"
                max="100"
                step="1"
                value={epochs}
                onChange={(e) => setEpochs(Number(e.target.value))}
              />
              <div className="mt-2 text-xs text-slate-400">
                More epochs can help… until it starts to overfit.
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-300">
              Accuracy:{' '}
              <span className="font-bold text-white">{result.accuracy ? `${result.accuracy}%` : '—'}</span>
              {overfitting ? (
                <span className="ml-3 rounded-lg border border-amber-300/30 bg-amber-500/10 px-2 py-1 text-xs text-amber-100">
                  Warning: Overfitting risk (epochs too high)
                </span>
              ) : null}
            </div>
            <button
              type="button"
              onClick={train}
              className="rounded-xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-400"
            >
              Train (simulate)
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-bold text-white">Training curve</h2>
          <p className="mt-1 text-sm text-slate-300">A simple line graph using Chart.js.</p>

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
            {result.curve.length ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <div className="py-10 text-center text-sm text-slate-400">
                Click <span className="text-white">Train</span> to generate a curve.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-bold text-white">Best score</h2>
          <div className="mt-4 rounded-xl bg-black/30 p-4">
            <div className="text-xs text-slate-400">Your best simulated accuracy</div>
            <div className="mt-1 text-3xl font-bold text-white">{best ? `${round1(best)}%` : '—'}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-bold text-white">Quick strategy</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li>
              - Start near <span className="font-semibold text-white">0.2</span> learning rate.
            </li>
            <li>
              - Increase epochs until returns diminish.
            </li>
            <li>
              - If epochs {'>'} 70, watch the overfitting warning.
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

