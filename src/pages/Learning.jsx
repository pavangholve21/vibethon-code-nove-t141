import { useEffect } from 'react'
import { useAuth } from '../components/authContext.js'

export function Learning() {
  const { user, updateProgress } = useAuth()

  useEffect(() => {
    const existing = user?.progress?.modulesCompleted ?? []
    if (existing.includes('learning')) return
    updateProgress({ modulesCompleted: [...existing, 'learning'] })
  }, [updateProgress, user])

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-bold text-white">Classification Basics</h1>
        <p className="mt-2 text-sm text-slate-300">
          Classification is when a model assigns an input to a category (a “label”).
          In spam detection, the labels are often <span className="font-semibold text-white">spam</span> and{' '}
          <span className="font-semibold text-white">not spam</span>.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm font-semibold text-white">1) Features</div>
          <p className="mt-2 text-sm text-slate-300">
            We turn text into signals (words, patterns, counts). These signals help decide the label.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm font-semibold text-white">2) Decision rule</div>
          <p className="mt-2 text-sm text-slate-300">
            A model learns a boundary. If the score is above a threshold, it predicts “spam”.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm font-semibold text-white">3) Accuracy</div>
          <p className="mt-2 text-sm text-slate-300">
            Accuracy = correct predictions / total predictions. Great for a quick evaluation.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-bold text-white">Example: Spam detection</h2>
          <p className="mt-2 text-sm text-slate-300">
            Email: <span className="text-white">“Win money now!!!”</span>
          </p>
          <p className="mt-2 text-sm text-slate-300">
            A simple heuristic might treat words like <span className="font-semibold text-white">win</span>,{' '}
            <span className="font-semibold text-white">free</span>, and <span className="font-semibold text-white">urgent</span> as spam indicators.
          </p>

          <div className="mt-4 rounded-xl bg-black/30 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Key idea
            </div>
            <div className="mt-2 text-sm text-slate-200">
              You can think of classification as: <span className="font-semibold text-white">score → threshold → label</span>.
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-bold text-white">Visual: Decision boundary (static)</h2>
          <p className="mt-2 text-sm text-slate-300">
            This is a simplified view: higher “spam score” moves the prediction toward spam.
          </p>

          <div className="mt-5 rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/15 to-cyan-500/10 p-5">
            <div className="flex items-center justify-between text-xs text-slate-200">
              <span>Not spam</span>
              <span>Spam</span>
            </div>
            <div className="mt-3 h-3 w-full rounded-full bg-black/30">
              <div className="h-3 w-[55%] rounded-full bg-gradient-to-r from-emerald-400 to-rose-400" />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
              <span>low score</span>
              <span className="text-white">threshold</span>
              <span>high score</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

