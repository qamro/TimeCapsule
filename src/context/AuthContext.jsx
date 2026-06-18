import { createContext, useContext, useEffect, useState } from 'react'
import { onAuth } from '../services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(undefined) // undefined = loading
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuth((firebaseUser) => {
      setUser(firebaseUser ?? null)
      setLoading(false)
    })
    return unsub
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
