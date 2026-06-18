import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { signOut } from '../../services/auth'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()
  const [menu, setMenu] = useState(false)
  const menuRef    = useRef(null)

  const isLanding = location.pathname === '/'

  // Close on outside click
  useEffect(() => {
    function handle(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

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
            <Link
              to="/dashboard"
              className={`${styles.link} ${location.pathname === '/dashboard' ? styles.active : ''}`}
            >
              My Capsules
            </Link>
            <Link to="/create" className={styles.createBtn}>
              + New Capsule
            </Link>

            {/* Avatar + dropdown — wrapped together so dropdown is relative to this */}
            <div ref={menuRef} className={styles.avatarWrap}>
              <button className={styles.avatar} onClick={() => setMenu(m => !m)}>
                {user.photoURL
                  ? <img src={user.photoURL} alt="avatar" className={styles.avatarImg} />
                  : <span>{(user.displayName || user.email || 'U').charAt(0).toUpperCase()}</span>
                }
              </button>

              <AnimatePresence>
                {menu && (
                  <motion.div
                    className={styles.dropdown}
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0,  scale: 1    }}
                    exit={{    opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <ProfilePanel user={user} onSignOut={handleSignOut} onClose={() => setMenu(false)} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {!user && (
          <Link to="/login" className={styles.signInBtn}>Sign In →</Link>
        )}
      </div>
    </nav>
  )
}

// ── Full profile panel (like Idea City) ──────────────────────
function ProfilePanel({ user, onSignOut, onClose }) {
  const [name,        setName]        = useState(() => {
    const saved = localStorage.getItem(`tc_profile_${user?.uid}`)
    return saved ? JSON.parse(saved).name || user?.displayName || 'Time Traveler' : user?.displayName || 'Time Traveler'
  })
  const [desc,        setDesc]        = useState(() => {
    const saved = localStorage.getItem(`tc_profile_${user?.uid}`)
    return saved ? JSON.parse(saved).desc || '' : ''
  })
  const [avatar,      setAvatar]      = useState(() => {
    const saved = localStorage.getItem(`tc_profile_${user?.uid}`)
    return saved ? JSON.parse(saved).avatar || null : null
  })
  const [editingName, setEditingName] = useState(false)
  const [editingDesc, setEditingDesc] = useState(false)
  const nameRef = useRef(null)
  const descRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => { if (editingName) setTimeout(() => nameRef.current?.focus(), 50) }, [editingName])
  useEffect(() => { if (editingDesc) setTimeout(() => descRef.current?.focus(), 50) }, [editingDesc])

  const photoURL = avatar || user?.photoURL
  const initial  = (name || 'T').charAt(0).toUpperCase()

  function save(updates) {
    const existing = JSON.parse(localStorage.getItem(`tc_profile_${user?.uid}`) || '{}')
    localStorage.setItem(`tc_profile_${user?.uid}`, JSON.stringify({ ...existing, ...updates }))
  }

  function saveName() {
    if (!name.trim()) return
    save({ name })
    setEditingName(false)
  }

  function saveDesc() {
    save({ desc })
    setEditingDesc(false)
  }

  function handleAvatar(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setAvatar(ev.target.result)
      save({ avatar: ev.target.result })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className={styles.profilePanel}>
      {/* Avatar + name header */}
      <div className={styles.profileHeader}>
        <div className={styles.profileAvatarWrap} onClick={() => fileRef.current?.click()}>
          {photoURL
            ? <img src={photoURL} alt="avatar" className={styles.profileAvatarImg} />
            : <span className={styles.profileAvatarInitial}>{initial}</span>
          }
          <div className={styles.profileAvatarOverlay}>📷</div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatar} />
        </div>

        <div className={styles.profileInfo}>
          {editingName ? (
            <div className={styles.inlineEdit}>
              <input
                ref={nameRef}
                className={styles.inlineInput}
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false) }}
                maxLength={32}
              />
              <button className={styles.saveBtn} onClick={saveName}>✓</button>
            </div>
          ) : (
            <div className={styles.nameRow}>
              <span className={styles.profileName}>{name}</span>
              <button className={styles.editBtn} onClick={() => setEditingName(true)}>✏️</button>
            </div>
          )}
          <span className={styles.profileEmail}>{user?.email}</span>
        </div>
      </div>

      {/* Description */}
      <div className={styles.profileSection}>
        <div className={styles.sectionLabel}>About me</div>
        {editingDesc ? (
          <div className={styles.descEditWrap}>
            <textarea
              ref={descRef}
              className={styles.descInput}
              value={desc}
              onChange={e => setDesc(e.target.value)}
              onKeyDown={e => { if (e.key === 'Escape') setEditingDesc(false) }}
              placeholder="What memories will you seal for the future?"
              maxLength={120}
              rows={3}
            />
            <button className={styles.saveBtn} onClick={saveDesc}>Save</button>
          </div>
        ) : (
          <div className={styles.descRow} onClick={() => setEditingDesc(true)}>
            <span className={styles.descText}>{desc || 'Add a description…'}</span>
            <button className={styles.editBtn}>✏️</button>
          </div>
        )}
      </div>

      <div className={styles.profileDivider} />

      {/* Nav links */}
      <Link to="/dashboard" className={styles.profileItem} onClick={onClose}>
        📦 My Capsules
      </Link>
      <Link to="/create" className={styles.profileItem} onClick={onClose}>
        ✍️ Create Capsule
      </Link>

      <div className={styles.profileDivider} />

      {/* Sign out */}
      <button className={`${styles.profileItem} ${styles.profileSignOut}`} onClick={onSignOut}>
        🚪 Sign Out
      </button>
    </div>
  )
}