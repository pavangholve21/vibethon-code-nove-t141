import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../components/authContext.js'
import { clamp, round1 } from '../utils/scoring.js'
import Prism from 'prismjs'
import 'prismjs/components/prism-python'
import { motion } from 'framer-motion'
import { usePrefersReducedMotion } from '../components/usePrefersReducedMotion.js'

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
  const reduced = usePrefersReducedMotion()
  const [code, setCode] = useState(STARTER)
  const [history, setHistory] = useState(() => [
    { ts: new Date().toLocaleTimeString(), text: 'Click Run to simulate output.' },
  ])
  const [typing, setTyping] = useState('')
  const textareaRef = useRef(null)
  const preRef = useRef(null)

  useEffect(() => {
    const existing = user?.progress?.modulesCompleted ?? []
    if (existing.includes('playground')) return
    updateProgress({ modulesCompleted: [...existing, 'playground'] })
  }, [updateProgress, user])

  const threshold = useMemo(() => {
    const t = extractThreshold(code)
    return t === null ? 0.5 : clamp(t, 0, 1)
  }, [code])

  const lineNumbers = useMemo(() => {
    const lines = code.split('\n').length
    return Array.from({ length: lines }, (_, i) => i + 1)
  }, [code])

  const highlighted = useMemo(() => {
    const html = Prism.highlight(code, Prism.languages.python, 'python')
    // underline the editable threshold assignment line
    return html.replace(
      /(threshold\s*=\s*[0-9]*\.?[0-9]+)/i,
      '<span class="np-threshold">$1</span>',
    )
  }, [code])

  useEffect(() => {
    const ta = textareaRef.current
    const pre = preRef.current
    if (!ta || !pre) return
    const sync = () => {
      pre.scrollTop = ta.scrollTop
      pre.scrollLeft = ta.scrollLeft
    }
    sync()
    ta.addEventListener('scroll', sync)
    return () => ta.removeEventListener('scroll', sync)
  }, [])

  useEffect(() => {
    if (!typing) return
    if (reduced) return
    let i = 0
    const full = typing
    setTyping('')
    const id = setInterval(() => {
      i += 2
      setTyping(full.slice(0, i))
      if (i >= full.length) clearInterval(id)
    }, 10)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.length])

  function run() {
    // Simulated "email_score" to keep it interactive.
    const emailScore = round1(clamp(0.6 + Math.random() * 0.35, 0, 1))
    const label = emailScore >= threshold ? 'spam' : 'ham'
    const arrow = label === 'spam' ? '→ 🔴 SPAM' : '→ 🟢 HAM'
    const text = `email_score=${emailScore} | threshold=${round1(threshold)} ${arrow}`
    const ts = new Date().toLocaleTimeString()
    setHistory((h) => [...h, { ts, text }])
    setTyping(`[${ts}] ${text}`)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 cosmos-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-cosmos-text">Coding Playground</h1>
            <p className="mt-2 text-sm text-cosmos-text2">
          Edit the <span className="font-semibold text-white">threshold</span> value and run a simulated
          classification.
            </p>
          </div>
          <button type="button" onClick={run} className="cosmos-button cosmos-button-primary">
            Run ▶
          </button>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-cosmos bg-black/35">
          <div className="flex items-center justify-between border-b border-cosmos bg-black/25 px-4 py-2">
            <div className="text-xs text-cosmos-text2">neural_editor.py</div>
            <div className="text-xs text-cosmos-text2">
              Parsed threshold: <span className="font-semibold text-cosmos-accent3">{round1(threshold)}</span>
            </div>
          </div>

          <div className="relative grid grid-cols-[48px_1fr]">
            <div className="select-none border-r border-cosmos bg-black/20 px-3 py-4 text-right font-mono text-xs text-cosmos-text2">
              {lineNumbers.map((n) => (
                <div key={n} className="leading-6">
                  {n}
                </div>
              ))}
            </div>

            <div className="relative">
              <pre
                ref={preRef}
                className="pointer-events-none absolute inset-0 overflow-auto p-4 font-mono text-sm leading-6 text-cosmos-text"
              >
                <code
                  className="language-python"
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: highlighted }}
                />
              </pre>
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="relative h-[360px] w-full resize-none bg-transparent p-4 font-mono text-sm leading-6 text-transparent caret-cosmos-accent3 outline-none selection:bg-cosmos-accent1/30"
                spellCheck={false}
              />
            </div>
          </div>
        </div>

        <style>{`
          .np-threshold { text-decoration: underline; text-decoration-thickness: 3px; text-decoration-color: rgba(245,158,11,0.8); }
          .token.comment { color: rgba(148,163,184,0.7); }
          .token.keyword { color: rgba(124,58,237,0.9); }
          .token.string { color: rgba(6,182,212,0.85); }
          .token.number { color: rgba(245,158,11,0.9); }
          .token.function { color: rgba(241,245,249,0.9); }
        `}</style>
      </div>

      <div className="space-y-6">
        <div className="cosmos-card p-6">
          <h2 className="font-heading text-lg font-semibold text-cosmos-text">Output terminal</h2>
          <div className="mt-4 rounded-2xl border border-cosmos bg-black/35 p-4 font-mono text-sm text-cosmos-text">
            <div className="mb-3 text-xs text-cosmos-text2">session.log</div>
            <div className="space-y-2">
              {history.slice(-6).map((h, i) => (
                <div key={`${h.ts}-${i}`} className="text-cosmos-text2">
                  <span className="text-cosmos-text">[{h.ts}]</span> {h.text}
                </div>
              ))}
              {typing ? (
                <motion.div
                  className="text-cosmos-success"
                  initial={reduced ? false : { opacity: 0 }}
                  animate={reduced ? {} : { opacity: 1 }}
                >
                  {typing}
                  <span className="ml-1 inline-block w-2 animate-caretBlink text-cosmos-accent2">▍</span>
                </motion.div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="cosmos-card p-6">
          <h2 className="font-heading text-lg font-semibold text-cosmos-text">What to notice</h2>
          <ul className="mt-3 space-y-2 text-sm text-cosmos-text2">
            <li>- Lower threshold predicts “spam” more often (more false positives).</li>
            <li>- Higher threshold is conservative (more false negatives).</li>
            <li>- Thresholds are the “decision boundary” in 1D.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

