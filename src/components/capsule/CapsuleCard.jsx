import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCountdown } from '../../hooks/useCountdown'
import { useCapsules } from '../../context/CapsuleContext'
import { formatDate, typeIcon, typeLabel, truncate } from '../../utils/helpers'
import { fromTimestamp } from '../../services/db'
import styles from './CapsuleCard.module.css'

export default function CapsuleCard({ capsule, index }) {
  const navigate  = useNavigate()
  const { removeCapsule } = useCapsules()
  const { countdown, unlocked } = useCountdown(capsule.unlockDate)
  const unlockDate = fromTimestamp(capsule.unlockDate)

  const [showConfirm, setShowConfirm] = useState(false)
  const [secs,        setSecs]        = useState(5)
  const [deleting,    setDeleting]    = useState(false)
  const [deleted,     setDeleted]     = useState(false)
  const intervalRef = useRef(null)

  // Start countdown when confirm opens
  useEffect(() => {
    if (showConfirm) {
      setSecs(5)
      intervalRef.current = setInterval(() => {
        setSecs(s => {
          if (s <= 1) { clearInterval(intervalRef.current); return 0 }
          return s - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
      setSecs(5)
    }
    return () => clearInterval(intervalRef.current)
  }, [showConfirm])

  function handleClick() {
    if (unlocked && !showConfirm) navigate(`/capsule/${capsule.id}`)
  }

  function handleDeleteClick(e) {
    e.stopPropagation()
    setShowConfirm(true)
  }

  function handleCancel(e) {
    e.stopPropagation()
    setShowConfirm(false)
  }

  async function handleConfirm(e) {
    e.stopPropagation()
    if (secs > 0) return
    setDeleting(true)
    // Small dramatic pause before deleting
    setTimeout(async () => {
      await removeCapsule(capsule.id)
      setDeleted(true)
    }, 600)
  }

  // Deleted — fade out the card
  if (deleted) {
    return (
      <motion.div
        className={styles.card}
        style={{ border: '1px solid rgba(224,112,112,0.1)' }}
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.5 }}
      />
    )
  }

  return (
    <motion.div
      className={`${styles.card} ${unlocked ? styles.unlocked : styles.locked} ${showConfirm ? styles.confirming : ''}`}
      onClick={handleClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={unlocked && !showConfirm ? { y: -4, scale: 1.01 } : {}}
    >

      {/* ── Delete confirmation overlay ── */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={e => e.stopPropagation()}
          >
            {deleting ? (
              /* Deleting state */
              <motion.div
                className={styles.deletingState}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <motion.div
                  className={styles.deletingIcon}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                >
                  ⧗
                </motion.div>
                <p className={styles.deletingText}>Erasing this memory…</p>
              </motion.div>
            ) : (
              /* Confirm state */
              <motion.div
                className={styles.confirmContent}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {/* Warning icon */}
                <motion.div
                  className={styles.warnIcon}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  🕯️
                </motion.div>

                {/* Emotional message */}
                <p className={styles.warnTitle}>Are you certain?</p>
                <p className={styles.warnMsg}>
                  "<em>{truncate(capsule.title, 30)}</em>" will be gone forever.
                  <br />
                  <span>Your future self will never receive this memory.</span>
                </p>

                {/* Countdown progress ring */}
                {secs > 0 && (
                  <div className={styles.countdownRing}>
                    <svg viewBox="0 0 44 44" className={styles.ringSVG}>
                      <circle cx="22" cy="22" r="18" className={styles.ringBg} />
                      <motion.circle
                        cx="22" cy="22" r="18"
                        className={styles.ringFill}
                        strokeDasharray={`${113}`}
                        strokeDashoffset={113 - (113 * (5 - secs) / 5)}
                        animate={{ strokeDashoffset: 113 }}
                        transition={{ duration: 5, ease: 'linear' }}
                      />
                    </svg>
                    <span className={styles.ringSecs}>{secs}</span>
                  </div>
                )}

                {/* Buttons */}
                <div className={styles.confirmBtns}>
                  <motion.button
                    className={`${styles.deleteForever} ${secs === 0 ? styles.deleteReady : ''}`}
                    onClick={handleConfirm}
                    disabled={secs > 0}
                    whileTap={secs === 0 ? { scale: 0.96 } : {}}
                  >
                    {secs > 0
                      ? `Erase in ${secs}…`
                      : '🗑 Erase forever'
                    }
                  </motion.button>

                  <button className={styles.keepBtn} onClick={handleCancel}>
                    ← Keep this memory
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Normal card content ── */}
      <div className={styles.cardTop}>
        <div className={`${styles.badge} ${unlocked ? styles.badgeUnlocked : styles.badgeLocked}`}>
          {unlocked ? '✦ Open' : '⧗ Sealed'}
        </div>
        {!showConfirm && (
          <button className={styles.deleteBtn} onClick={handleDeleteClick} title="Delete capsule">
            ✕
          </button>
        )}
      </div>

      <div className={styles.typeIcon}>{typeIcon(capsule.type)}</div>

      <div className={styles.body}>
        <h3 className={styles.title}>{truncate(capsule.title, 48)}</h3>
        <span className={styles.type}>{typeLabel(capsule.type)}</span>
      </div>

      <div className={styles.footer}>
        <div className={styles.dateInfo}>
          <span className={styles.dateLabel}>{unlocked ? 'Unlocked' : 'Opens'}</span>
          <span className={styles.dateVal}>{formatDate(unlockDate)}</span>
        </div>
        {!unlocked && countdown && (
          <div className={styles.countdown}>
            <span className={styles.countdownVal}>{countdown}</span>
            <span className={styles.countdownLabel}>remaining</span>
          </div>
        )}
        {unlocked && <div className={styles.openCta}>Read memory →</div>}
      </div>

      {!unlocked && !showConfirm && <div className={styles.shimmer} />}
    </motion.div>
  )
}