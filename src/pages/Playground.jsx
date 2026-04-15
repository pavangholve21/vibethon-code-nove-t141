import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../components/authContext.js'
import { clamp, round1 } from '../utils/scoring.js'

const STARTER = `# Tiny spam classifier (toy example)
threshold = 0.50

email_score = 0.73
if email_score >= threshold:
    label = "spam"
else:
    label = "ham"

print(label)
`

function extractThreshold(code) {
  const match = code.match(/threshold\s*=\s*([0-9]*\.?[0-9]+)/i)
  if (!match) return null
  const val = Number(match[1])
  return Number.isFinite(val) ? val : null
}

export function Playground() {
  const { user, updateProgress } = useAuth()
  const [code, setCode] = useState(STARTER)
  const [output, setOutput] = useState('Click Run to simulate output.')

  useEffect(() => {
    const existing = user?.progress?.modulesCompleted ?? []
    if (existing.includes('playground')) return
    updateProgress({ modulesCompleted: [...existing, 'playground'] })
  }, [updateProgress, user])

  const threshold = useMemo(() => {
    const t = extractThreshold(code)
    return t === null ? 0.5 : clamp(t, 0, 1)
  }, [code])

  function run() {
    // Simulated "email_score" to keep it interactive.
    const emailScore = round1(clamp(0.6 + Math.random() * 0.35, 0, 1))
    const label = emailScore >= threshold ? 'spam' : 'ham'
    setOutput(`email_score=${emailScore} | threshold=${round1(threshold)} => ${label}`)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-bold text-white">Coding Playground (Light)</h1>
        <p className="mt-2 text-sm text-slate-300">
          Edit the <span className="font-semibold text-white">threshold</span> value and run a simulated
          classification.
        </p>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="mt-5 h-[340px] w-full resize-none rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-sm leading-relaxed text-slate-100 outline-none ring-violet-400 focus:ring-2"
          spellCheck={false}
        />

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-300">
            Parsed threshold:{' '}
            <span className="font-semibold text-white">{round1(threshold)}</span>
          </div>
          <button
            type="button"
            onClick={run}
            className="rounded-xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-400"
          >
            Run
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-bold text-white">Output</h2>
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4 font-mono text-sm text-slate-100">
            {output}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-bold text-white">What to notice</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li>
              - A lower threshold predicts “spam” more often (higher recall, potentially more false positives).
            </li>
            <li>
              - A higher threshold is more conservative (fewer spam predictions).
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

