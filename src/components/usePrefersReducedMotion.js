import { useEffect, useState } from 'react'

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mql) return
    const update = () => setReduced(!!mql.matches)
    update()
    if (mql.addEventListener) mql.addEventListener('change', update)
    else mql.addListener(update)
    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', update)
      else mql.removeListener(update)
    }
  }, [])

  return reduced
}

