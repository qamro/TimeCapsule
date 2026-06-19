import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { signOut } from '../../services/auth'
import { getUserProfile, saveUserProfile, subscribeUserProfile } from '../../services/db'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()
  const [menu, setMenu] = useState(false)
  const menuRef    = useRef(null)

  const isLanding = location.pathname === '/'

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
        <Link to={user ? '/dashboard' : '/'} className={styles.logo}>
          <span className={styles.logoIcon}>⧗</span>
          <span className={styles.logoText}>TimeCapsule</span>
        </Link>

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

            <div ref={menuRef} className={styles.avatarWrap}>
              <AvatarButton user={user} onClick={() => setMenu(m => !m)} />

              <AnimatePresence>
                {menu && (
                  <motion.div
                    className={styles.dropdown}
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0,  scale: 1    }}
                    exit={{    opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <ProfilePanel
                      user={user}
                      onSignOut={handleSignOut}
                      onClose={() => setMenu(false)}
                    />
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

// ── Avatar button — shows Firestore photo if available ───────
function AvatarButton({ user, onClick }) {
  const [photoURL, setPhotoURL] = useState(user?.photoURL || null)

  useEffect(() => {
    if (!user?.uid) return
    const unsub = subscribeUserProfile(user.uid, (profile) => {
      if (profile?.photoURL) setPhotoURL(profile.photoURL)
      else setPhotoURL(user?.photoURL || null)
    })
    return unsub
  }, [user?.uid])

  const initial = (user?.displayName || user?.email || 'T').charAt(0).toUpperCase()

  return (
    <button className={styles.avatar} onClick={onClick}>
      {photoURL
        ? <img src={photoURL} alt="avatar" className={styles.avatarImg} />
        : <span>{initial}</span>
      }
    </button>
  )
}

// ── Full profile panel — syncs with Firestore ────────────────
function ProfilePanel({ user, onSignOut, onClose }) {
  const [profile,     setProfile]     = useState(null)
  const [editingName, setEditingName] = useState(false)
  const [editingDesc, setEditingDesc] = useState(false)
  const [name,        setName]        = useState('')
  const [desc,        setDesc]        = useState('')
  const [photoURL,    setPhotoURL]    = useState(null)
  const [saving,      setSaving]      = useState(false)
  const nameRef = useRef(null)
  const descRef = useRef(null)
  const fileRef = useRef(null)

  // ── Load profile from Firestore on open ──
  useEffect(() => {
    if (!user?.uid) return
    const unsub = subscribeUserProfile(user.uid, (data) => {
      if (data) {
        setProfile(data)
        setName(data.displayName || user?.displayName || 'Time Traveler')
        setDesc(data.description || '')
        setPhotoURL(data.photoURL || user?.photoURL || null)
      } else {
        setName(user?.displayName || 'Time Traveler')
        setPhotoURL(user?.photoURL || null)
      }
    })
    return unsub
  }, [user?.uid])

  useEffect(() => { if (editingName) setTimeout(() => nameRef.current?.focus(), 50) }, [editingName])
  useEffect(() => { if (editingDesc) setTimeout(() => descRef.current?.focus(), 50) }, [editingDesc])

  const initial = (name || 'T').charAt(0).toUpperCase()

  // ── Save name to Firestore ──
  async function saveName() {
    if (!name.trim()) return
    setSaving(true)
    await saveUserProfile(user.uid, { displayName: name.trim() })
    setSaving(false)
    setEditingName(false)
  }

  // ── Save description to Firestore ──
  async function saveDesc() {
    setSaving(true)
    await saveUserProfile(user.uid, { description: desc })
    setSaving(false)
    setEditingDesc(false)
  }

  // ── Upload photo → save base64 to Firestore ──
  async function handleAvatar(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      alert('Image too large. Please choose an image under 2MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const b64 = ev.target.result
      setPhotoURL(b64)
      await saveUserProfile(user.uid, { photoURL: b64 })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className={styles.profilePanel}>
      {/* ── Header: avatar + name ── */}
      <div className={styles.profileHeader}>
        <div className={styles.profileAvatarWrap} onClick={() => fileRef.current?.click()}>
          {photoURL
            ? <img src={photoURL} alt="avatar" className={styles.profileAvatarImg} />
            : <span className={styles.profileAvatarInitial}>{initial}</span>
          }
          <div className={styles.profileAvatarOverlay}>📷</div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatar}
          />
        </div>

        <div className={styles.profileInfo}>
          {editingName ? (
            <div className={styles.inlineEdit}>
              <input
                ref={nameRef}
                className={styles.inlineInput}
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') saveName()
                  if (e.key === 'Escape') setEditingName(false)
                }}
                maxLength={32}
              />
              <button className={styles.saveBtn} onClick={saveName} disabled={saving}>
                {saving ? '…' : '✓'}
              </button>
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

      {/* ── Description ── */}
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
            <button className={styles.saveBtn} onClick={saveDesc} disabled={saving}>
              {saving ? '…' : 'Save'}
            </button>
          </div>
        ) : (
          <div className={styles.descRow} onClick={() => setEditingDesc(true)}>
            <span className={styles.descText}>{desc || 'Add a description…'}</span>
            <button className={styles.editBtn}>✏️</button>
          </div>
        )}
      </div>

      <div className={styles.profileDivider} />

      {/* ── Nav links ── */}
      <Link to="/dashboard" className={styles.profileItem} onClick={onClose}>
        📦 My Capsules
      </Link>
      <Link to="/create" className={styles.profileItem} onClick={onClose}>
        ✍️ Create Capsule
      </Link>

      <div className={styles.profileDivider} />

      {/* ── Sign out ── */}
      <button className={`${styles.profileItem} ${styles.profileSignOut}`} onClick={onSignOut}>
        🚪 Sign Out
      </button>
    </div>
  )
}