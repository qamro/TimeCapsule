import { useState, useEffect } from 'react'
import { getCountdown, isUnlocked } from '../utils/helpers'
import { fromTimestamp } from '../services/db'

export function useCountdown(unlockDate) {
  const target   = fromTimestamp(unlockDate)
  const [countdown, setCountdown] = useState(() => getCountdown(target))
  const [unlocked,  setUnlocked]  = useState(() => isUnlocked(target))

  useEffect(() => {
    if (!target) return
    if (isUnlocked(target)) { setUnlocked(true); return }

    const tick = () => {
      const cd = getCountdown(target)
      setCountdown(cd)
      if (!cd) setUnlocked(true)
    }

    tick()
    const id = setInterval(tick, 60000) // update every minute
    return () => clearInterval(id)
  }, [unlockDate])

  return { countdown, unlocked }
}
