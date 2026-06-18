import { fromTimestamp } from '../services/db'

/**
 * Format a date nicely
 */
export function formatDate(date) {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

/**
 * Get countdown string from now to a future date
 */
export function getCountdown(unlockDate) {
  const target = unlockDate instanceof Date ? unlockDate : fromTimestamp(unlockDate)
  if (!target) return null

  const now   = new Date()
  const diff  = target - now

  if (diff <= 0) return null // already unlocked

  const days    = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 365) {
    const years = Math.floor(days / 365)
    const rem   = days % 365
    return `${years}y ${Math.floor(rem / 30)}m`
  }
  if (days > 30) {
    const months = Math.floor(days / 30)
    const rem    = days % 30
    return `${months}mo ${rem}d`
  }
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

/**
 * Check if a capsule is unlocked
 */
export function isUnlocked(unlockDate) {
  const target = unlockDate instanceof Date ? unlockDate : fromTimestamp(unlockDate)
  if (!target) return false
  return target <= new Date()
}

/**
 * Get unlock date from a duration key
 */
export function getDurationDate(key, customDate = null) {
  const now = new Date()
  const map = {
    '1month':  new Date(now.getFullYear(), now.getMonth() + 1,  now.getDate()),
    '1year':   new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()),
    '5years':  new Date(now.getFullYear() + 5, now.getMonth(), now.getDate()),
    '10years': new Date(now.getFullYear() + 10, now.getMonth(), now.getDate()),
    'custom':  customDate ? new Date(customDate) : null,
  }
  return map[key] || null
}

/**
 * Truncate string
 */
export function truncate(str, n = 60) {
  return str?.length > n ? str.slice(0, n - 1) + '…' : str
}

/**
 * Get type icon
 */
export function typeIcon(type) {
  return { letter: '✉️', image: '📸', video: '🎬' }[type] || '✉️'
}

/**
 * Get type label
 */
export function typeLabel(type) {
  return { letter: 'Letter', image: 'Photo', video: 'Video' }[type] || 'Letter'
}

/**
 * Convert file to base64
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
