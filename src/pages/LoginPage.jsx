import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { signInWithGoogle } from '../services/auth'
import { useAuth } from '../context/AuthContext'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const { user }    = useAuth()
  const navigate    = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (user) navigate('/dashboard')
  }, [user])

  async function handleGoogle() {
    setError(null)
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch (e) {
      setError('Could not sign in. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.glow} />

      {/* Back to home */}
      <Link to="/" className={styles.back}>← Back</Link>

      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1    }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo */}
        <div className={styles.logo}>
          <span className={styles.logoIcon}>⧗</span>
          <span className={styles.logoText}>TimeCapsule</span>
        </div>

        <h1 className={styles.title}>Welcome back,<br /><em>time traveler.</em></h1>
        <p className={styles.sub}>Sign in to access your sealed memories and create new capsules.</p>

        {/* Google button */}
        <button
          className={styles.googleBtn}
          onClick={handleGoogle}
          disabled={loading}
        >
          {loading ? (
            <span className={styles.spinner} />
          ) : (
            <GoogleIcon />
          )}
          {loading ? 'Signing in…' : 'Continue with Google'}
        </button>

        {error && (
          <motion.p
            className={styles.error}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        )}

        <p className={styles.fine}>
          By signing in, you agree to keep your memories safe and your promises to yourself.
        </p>
      </motion.div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}
