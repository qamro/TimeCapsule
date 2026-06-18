import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from './AuthContext'
import {
  subscribeCapsules,
  createCapsule,
  openCapsule,
  deleteCapsule,
  toTimestamp,
  fromTimestamp,
} from '../services/db'

const CapsuleContext = createContext(null)

export function CapsuleProvider({ children }) {
  const { user }          = useAuth()
  const [capsules,  setCapsules]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const unsubRef = useRef(null)

  // ── Subscribe to capsules ───────────────────
  useEffect(() => {
    if (!user) {
      setCapsules([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    unsubRef.current?.()
    unsubRef.current = subscribeCapsules(
      user.uid,
      (data) => {
        setCapsules(data)
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubRef.current?.()
  }, [user])

  // ── Create capsule ──────────────────────────
  const addCapsule = useCallback(async (data) => {
    if (!user) throw new Error('Not authenticated')
    try {
      const unlockDate = toTimestamp(new Date(data.unlockDate))
      const id = await createCapsule(user.uid, {
        title:      data.title,
        type:       data.type,       // 'letter' | 'image' | 'video'
        content:    data.content,    // text or base64
        tags:       data.tags || [],
        unlockDate,
        mood:       data.mood || null,
      })
      return id
    } catch (e) {
      console.error('addCapsule error:', e.message)
      throw e
    }
  }, [user])

  // ── Open capsule ────────────────────────────
  const markOpened = useCallback(async (capsuleId) => {
    if (!user) return
    try {
      await openCapsule(user.uid, capsuleId)
    } catch (e) {
      console.error('openCapsule error:', e.message)
    }
  }, [user])

  // ── Delete capsule ──────────────────────────
  const removeCapsule = useCallback(async (capsuleId) => {
    if (!user) return
    try {
      await deleteCapsule(user.uid, capsuleId)
    } catch (e) {
      console.error('deleteCapsule error:', e.message)
    }
  }, [user])

  // ── Computed ────────────────────────────────
  const locked   = capsules.filter((c) => {
    const unlock = fromTimestamp(c.unlockDate)
    return unlock && unlock > new Date()
  })
  const unlocked = capsules.filter((c) => {
    const unlock = fromTimestamp(c.unlockDate)
    return unlock && unlock <= new Date()
  })

  return (
    <CapsuleContext.Provider value={{
      capsules, locked, unlocked,
      loading, error,
      addCapsule, markOpened, removeCapsule,
    }}>
      {children}
    </CapsuleContext.Provider>
  )
}

export const useCapsules = () => useContext(CapsuleContext)
