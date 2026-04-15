import { useEffect, useMemo, useState } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion.js'

export function useCountUp(target, { durationMs = 900 } = {}) {
  const reduced = usePrefersReducedMotion()
  const safeTarget = useMemo(() => (Number.isFinite(Number(target)) ? Number(target) : 0), [target])
  const [value, setValue] = useState(reduced ? safeTarget : 0)

  useEffect(() => {
    if (reduced) {
      setValue(safeTarget)
      return
    }
    const start = performance.now()
    const from = 0

    let raf = 0
    function tick(now) {
      const t = Math.min(1, (now - start) / durationMs)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(from + (safeTarget - from) * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [durationMs, reduced, safeTarget])

  return value
}

