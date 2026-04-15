import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { achievementById } from '../utils/achievements.js'
import { usePrefersReducedMotion } from './usePrefersReducedMotion.js'

const AchievementContext = createContext(null)

export function AchievementProvider({ children }) {
  const reduced = usePrefersReducedMotion()
  const [queue, setQueue] = useState([]) // array of achievement ids

  const enqueue = useCallback((ids) => {
    if (!ids?.length) return
    setQueue((prev) => [...prev, ...ids])
  }, [])

  const current = queue[0] ? achievementById(queue[0]) : null

  const dismiss = useCallback(() => {
    setQueue((prev) => prev.slice(1))
  }, [])

  const value = useMemo(() => ({ enqueue }), [enqueue])

  return (
    <AchievementContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {current ? (
          <motion.div
            key={current.id}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
            initial={reduced ? false : { opacity: 0 }}
            animate={reduced ? {} : { opacity: 1 }}
            exit={reduced ? {} : { opacity: 0 }}
            onClick={dismiss}
          >
            <motion.div
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-cosmos bg-gradient-to-br from-cosmos-surface to-cosmos-surface2 p-6 shadow-[0_30px_90px_rgba(124,58,237,0.25)]"
              initial={reduced ? false : { y: 16, opacity: 0, scale: 0.98 }}
              animate={reduced ? {} : { y: 0, opacity: 1, scale: 1 }}
              exit={reduced ? {} : { y: 10, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-cosmos-accent1/25 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-cosmos-accent2/20 blur-3xl" />

              <div className="flex items-start gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cosmos-accent3/30 to-cosmos-accent1/20 text-2xl">
                  {current.icon}
                </div>
                <div className="flex-1">
                  <div className="font-heading text-xs font-semibold tracking-widest text-cosmos-accent3">
                    ACHIEVEMENT UNLOCKED
                  </div>
                  <div className="mt-1 font-heading text-2xl font-semibold text-cosmos-text">
                    {current.name}
                  </div>
                  <div className="mt-2 text-sm text-cosmos-text2">{current.desc}</div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button type="button" className="cosmos-ghost" onClick={dismiss}>
                  Nice
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </AchievementContext.Provider>
  )
}

export function useAchievements() {
  const ctx = useContext(AchievementContext)
  if (!ctx) throw new Error('useAchievements must be used within AchievementProvider')
  return ctx
}

