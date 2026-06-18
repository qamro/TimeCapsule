import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { signOut } from '../../services/auth'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user }     = useAuth()
  const navigate     = useNavigate()
  const location     = useLocation()
  const [menu, setMenu] = useState(false)

  const isLanding = location.pathname === '/'

  async function handleSignOut() {
    await signOut()
    navigate('/')
    setMenu(false)
  }

  return (
    <nav className={`${styles.nav} ${isLanding ? styles.transparent : styles.solid}`}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link to={user ? '/dashboard' : '/'} className={styles.logo}>
          <span className={styles.logoIcon}>⧗</span>
          <span className={styles.logoText}>TimeCapsule</span>
        </Link>

        {/* Desktop nav */}
        {user && (
          <div className={styles.links}>
            <Link to="/dashboard" className={`${styles.link} ${location.pathname === '/dashboard' ? styles.active : ''}`}>
              My Capsules
            </Link>
            <Link to="/create" className={styles.createBtn}>
              + New Capsule
            </Link>
            <button className={styles.avatar} onClick={() => setMenu((m) => !m)}>
              {user.photoURL
                ? <img src={user.photoURL} alt="avatar" className={styles.avatarImg} />
                : <span>{(user.displayName || user.email || 'U').charAt(0).toUpperCase()}</span>
              }
            </button>
          </div>
        )}

        {!user && (
          <Link to="/login" className={styles.signInBtn}>Sign In</Link>
        )}
      </div>

      {/* Profile dropdown */}
      <AnimatePresence>
        {menu && user && (
          <motion.div
            className={styles.dropdown}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
          >
            <div className={styles.dropUser}>
              <div className={styles.dropName}>{user.displayName || 'Time Traveler'}</div>
              <div className={styles.dropEmail}>{user.email}</div>
            </div>
            <div className={styles.dropDivider} />
            <Link to="/dashboard" className={styles.dropItem} onClick={() => setMenu(false)}>
              📦 My Capsules
            </Link>
            <Link to="/create" className={styles.dropItem} onClick={() => setMenu(false)}>
              ✍️ Create Capsule
            </Link>
            <div className={styles.dropDivider} />
            <button className={`${styles.dropItem} ${styles.dropSignOut}`} onClick={handleSignOut}>
              🚪 Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {menu && <div className={styles.overlay} onClick={() => setMenu(false)} />}
    </nav>
  )
}
