import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCountdown } from '../../hooks/useCountdown'
import { formatDate, typeIcon, typeLabel, truncate } from '../../utils/helpers'
import { fromTimestamp } from '../../services/db'
import styles from './CapsuleCard.module.css'

export default function CapsuleCard({ capsule, index }) {
  const navigate  = useNavigate()
  const { countdown, unlocked } = useCountdown(capsule.unlockDate)
  const unlockDate = fromTimestamp(capsule.unlockDate)

  function handleClick() {
    if (unlocked) {
      navigate(`/capsule/${capsule.id}`)
    }
  }

  return (
    <motion.div
      className={`${styles.card} ${unlocked ? styles.unlocked : styles.locked}`}
      onClick={handleClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={unlocked ? { y: -4, scale: 1.01 } : { scale: 1.005 }}
    >
      {/* Status badge */}
      <div className={`${styles.badge} ${unlocked ? styles.badgeUnlocked : styles.badgeLocked}`}>
        {unlocked ? '✦ Open' : '⧗ Sealed'}
      </div>

      {/* Type icon */}
      <div className={styles.typeIcon}>{typeIcon(capsule.type)}</div>

      {/* Content */}
      <div className={styles.body}>
        <h3 className={styles.title}>{truncate(capsule.title, 48)}</h3>
        <span className={styles.type}>{typeLabel(capsule.type)}</span>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.dateInfo}>
          <span className={styles.dateLabel}>
            {unlocked ? 'Unlocked' : 'Opens'}
          </span>
          <span className={styles.dateVal}>
            {formatDate(unlockDate)}
          </span>
        </div>

        {!unlocked && countdown && (
          <div className={styles.countdown}>
            <span className={styles.countdownVal}>{countdown}</span>
            <span className={styles.countdownLabel}>remaining</span>
          </div>
        )}

        {unlocked && (
          <div className={styles.openCta}>
            Read memory →
          </div>
        )}
      </div>

      {/* Locked overlay shimmer */}
      {!unlocked && <div className={styles.shimmer} />}
    </motion.div>
  )
}
