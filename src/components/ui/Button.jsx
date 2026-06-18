import { motion } from 'framer-motion'
import styles from './Button.module.css'

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
}) {
  return (
    <motion.button
      type={type}
      className={`${styles.btn} ${styles[variant]} ${styles[size]} ${fullWidth ? styles.full : ''} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
      transition={{ duration: 0.15 }}
    >
      {loading ? (
        <span className={styles.spinner} />
      ) : children}
    </motion.button>
  )
}
