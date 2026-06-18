import { useState, useCallback, useRef } from 'react'

export function useToast() {
  const [toast,  setToast]  = useState(null)
  const timerRef = useRef(null)

  const showToast = useCallback((message, type = 'info') => {
    clearTimeout(timerRef.current)
    setToast({ message, type, id: Date.now() })
    timerRef.current = setTimeout(() => setToast(null), 3200)
  }, [])

  return { toast, showToast }
}
