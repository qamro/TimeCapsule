import { AnimatePresence, motion } from 'framer-motion'
import styles from './Toast.module.css'

export default function Toast({ toast }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          className={`${styles.toast} ${styles[toast.type] || ''}`}
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0,  scale: 1    }}
          exit={{    opacity: 0, y: 10, scale: 0.96 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className={styles.icon}>
            {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ⓘ'}
          </span>
          {toast.message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
