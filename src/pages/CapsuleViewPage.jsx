import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useCapsules } from '../context/CapsuleContext'
import { getCapsule, fromTimestamp } from '../services/db'
import { formatDate, typeIcon } from '../utils/helpers'
import Navbar from '../components/layout/Navbar'
import Button from '../components/ui/Button'
import styles from './CapsuleViewPage.module.css'

export default function CapsuleViewPage() {
  const { id }       = useParams()
  const { user }     = useAuth()
  const { markOpened, removeCapsule } = useCapsules()
  const navigate     = useNavigate()

  const [capsule,  setCapsule]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    load()
  }, [user, id])

  async function load() {
    setLoading(true)
    try {
      const data = await getCapsule(user.uid, id)
      if (!data) { navigate('/dashboard'); return }

      // Check if it's actually unlocked
      const unlock = fromTimestamp(data.unlockDate)
      if (unlock && unlock > new Date()) {
        navigate('/dashboard')
        return
      }

      setCapsule(data)

      // Mark as opened if not already
      if (!data.opened) {
        await markOpened(id)
      }
    } catch (e) {
      console.error('load capsule error:', e)
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    await removeCapsule(id)
    navigate('/dashboard')
  }

  if (loading) {
    return (
      <div className={styles.loadPage}>
        <Navbar />
        <div className={styles.loadWrap}>
          <motion.div
            className={styles.loadIcon}
            animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            ⧗
          </motion.div>
          <p className={styles.loadText}>Opening your capsule…</p>
        </div>
      </div>
    )
  }

  if (!capsule) return null

  const unlockDate   = fromTimestamp(capsule.unlockDate)
  const createdDate  = fromTimestamp(capsule.createdAt)

  return (
    <div className={styles.page}>
      <Navbar />

      {/* Ambient background */}
      <div className={styles.ambient} />

      <motion.div
        className={styles.inner}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Back */}
        <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
          ← Back to capsules
        </button>

        {/* Header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          <div className={styles.headerBadge}>
            {typeIcon(capsule.type)} Unlocked · {formatDate(unlockDate)}
          </div>
          <h1 className={styles.title}>{capsule.title}</h1>
          <p className={styles.meta}>
            Written {formatDate(createdDate)} · {capsule.type}
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          className={styles.contentWrap}
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          {capsule.type === 'letter' && (
            <div className={styles.letterContent}>
              <div className={styles.letterBody}>
                {capsule.content?.split('\n').map((line, i) => (
                  <p key={i} className={styles.letterLine}>
                    {line || <br />}
                  </p>
                ))}
              </div>
            </div>
          )}

          {capsule.type === 'image' && capsule.content && (
            <div className={styles.imageContent}>
              <img
                src={capsule.content}
                alt={capsule.title}
                className={styles.image}
              />
            </div>
          )}

          {capsule.type === 'video' && capsule.content && (
            <div className={styles.videoContent}>
              <video
                src={capsule.content}
                controls
                className={styles.video}
              />
            </div>
          )}
        </motion.div>

        {/* Footer actions */}
        <motion.div
          className={styles.actions}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Button onClick={() => navigate('/create')} variant="secondary">
            ✍️ Create a new capsule
          </Button>

          {!showDelete ? (
            <Button variant="ghost" onClick={() => setShowDelete(true)}>
              Delete capsule
            </Button>
          ) : (
            <div className={styles.deleteConfirm}>
              <span className={styles.deleteText}>Are you sure? This cannot be undone.</span>
              <Button variant="danger" loading={deleting} onClick={handleDelete} size="sm">
                Yes, delete
              </Button>
              <Button variant="ghost" onClick={() => setShowDelete(false)} size="sm">
                Cancel
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
