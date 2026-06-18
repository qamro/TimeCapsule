import { useState } from 'react'
import { motion } from 'framer-motion'
import { getDurationDate, formatDate } from '../../utils/helpers'
import styles from './LockDurationPicker.module.css'

const DURATIONS = [
  { key: '1month',  label: '1 Month',   sub: 'A quick check-in',        icon: '🌱' },
  { key: '1year',   label: '1 Year',    sub: 'A year of growth',         icon: '🌿' },
  { key: '5years',  label: '5 Years',   sub: 'Half a decade ahead',      icon: '🌳' },
  { key: '10years', label: '10 Years',  sub: 'A decade into the future', icon: '🏔️' },
  { key: 'custom',  label: 'Custom',    sub: 'Choose your own date',     icon: '📅' },
]

export default function LockDurationPicker({ value, onChange }) {
  const [customDate, setCustomDate] = useState('')

  function handleSelect(key) {
    if (key === 'custom') {
      onChange({ key, date: customDate ? new Date(customDate) : null })
    } else {
      onChange({ key, date: getDurationDate(key) })
    }
  }

  function handleCustomDate(e) {
    const d = e.target.value
    setCustomDate(d)
    if (d) onChange({ key: 'custom', date: new Date(d) })
  }

  // Min date = tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  return (
    <div className={styles.wrap}>
      <div className={styles.grid}>
        {DURATIONS.map((d) => {
          const selected = value?.key === d.key
          const unlockDate = d.key !== 'custom' ? getDurationDate(d.key) : null
          return (
            <motion.button
              key={d.key}
              type="button"
              className={`${styles.option} ${selected ? styles.selected : ''}`}
              onClick={() => handleSelect(d.key)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className={styles.optIcon}>{d.icon}</span>
              <span className={styles.optLabel}>{d.label}</span>
              <span className={styles.optSub}>{d.sub}</span>
              {unlockDate && (
                <span className={styles.optDate}>{formatDate(unlockDate)}</span>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Custom date input */}
      {value?.key === 'custom' && (
        <motion.div
          className={styles.customWrap}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <label className={styles.customLabel}>Choose unlock date</label>
          <input
            type="date"
            className={styles.customInput}
            min={minDate}
            value={customDate}
            onChange={handleCustomDate}
          />
        </motion.div>
      )}
    </div>
  )
}
