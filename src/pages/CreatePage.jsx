import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCapsules } from '../context/CapsuleContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import LockDurationPicker from '../components/capsule/LockDurationPicker'
import Button from '../components/ui/Button'
import Toast from '../components/ui/Toast'
import Navbar from '../components/layout/Navbar'
import { fileToBase64 } from '../utils/helpers'
import styles from './CreatePage.module.css'

const TYPES = [
  { key: 'letter', icon: '✉️', label: 'Letter',     desc: 'Write your thoughts' },
  { key: 'image',  icon: '📸', label: 'Photo',      desc: 'Upload a memory'    },
  { key: 'video',  icon: '🎬', label: 'Video',      desc: 'Record or upload'   },
]

export default function CreatePage() {
  const { user }       = useAuth()
  const { addCapsule } = useCapsules()
  const navigate       = useNavigate()
  const { toast, showToast } = useToast()

  const [step,     setStep]     = useState(1) // 1=type, 2=content, 3=lock, 4=sealed
  const [type,     setType]     = useState(null)
  const [title,    setTitle]    = useState('')
  const [content,  setContent]  = useState('')  // text or base64
  const [fileName, setFileName] = useState('')
  const [duration, setDuration] = useState(null)
  const [sealing,  setSealing]  = useState(false)
  const [sealed,   setSealed]   = useState(false)
  const fileRef = useRef(null)

  if (!user) { navigate('/login'); return null }

  // ── Step 1: Type ─────────────────────────────
  function handleTypeSelect(t) {
    setType(t)
    setTimeout(() => setStep(2), 300)
  }

  // ── Step 2: Content ──────────────────────────
  async function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      showToast('File too large. Max 5MB.', 'error')
      return
    }
    const b64 = await fileToBase64(file)
    setContent(b64)
    setFileName(file.name)
  }

  function canGoToStep3() {
    if (!title.trim()) return false
    if (type === 'letter' && !content.trim()) return false
    if ((type === 'image' || type === 'video') && !content) return false
    return true
  }

  // ── Step 3 → Seal ────────────────────────────
  async function handleSeal() {
    if (!duration?.date) {
      showToast('Please choose a lock duration.', 'error')
      return
    }
    setSealing(true)
    try {
      await addCapsule({
        title:      title.trim(),
        type,
        content,
        unlockDate: duration.date.toISOString(),
      })
      setSealed(true)
      setStep(4)
    } catch (e) {
      showToast('Could not seal capsule. Please try again.', 'error')
    } finally {
      setSealing(false)
    }
  }

  // ── Step 4: Success ──────────────────────────
  if (sealed) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.sealedScreen}>
          <motion.div
            className={styles.sealedContent}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1   }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className={styles.sealedIcon}
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            >
              ⧗
            </motion.div>
            <h1 className={styles.sealedTitle}>Your capsule is sealed.</h1>
            <p className={styles.sealedSub}>
              "{title}" has been locked away.<br />
              It will be waiting for you when the time comes.
            </p>
            <div className={styles.sealedActions}>
              <Button onClick={() => navigate('/dashboard')} size="lg">
                View my capsules
              </Button>
              <Button variant="ghost" onClick={() => { setStep(1); setType(null); setTitle(''); setContent(''); setDuration(null); setSealed(false) }}>
                Create another
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <Toast toast={toast} />

      <div className={styles.inner}>
        {/* Progress */}
        <div className={styles.progress}>
          {[1, 2, 3].map((s) => (
            <div key={s} className={`${styles.progressStep} ${step >= s ? styles.progressActive : ''}`}>
              <div className={styles.progressDot} />
              <span className={styles.progressLabel}>
                {['Choose type', 'Add content', 'Set the lock'][s - 1]}
              </span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── Step 1: Type selection ── */}
          {step === 1 && (
            <motion.div
              key="step1"
              className={styles.step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0  }}
              exit={{    opacity: 0, x: -30 }}
              transition={{ duration: 0.35 }}
            >
              <h1 className={styles.stepTitle}>What will you seal?</h1>
              <p className={styles.stepSub}>Choose the type of memory you want to preserve.</p>

              <div className={styles.typeGrid}>
                {TYPES.map((t) => (
                  <motion.button
                    key={t.key}
                    className={`${styles.typeCard} ${type === t.key ? styles.typeSelected : ''}`}
                    onClick={() => handleTypeSelect(t.key)}
                    whileHover={{ scale: 1.03, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span className={styles.typeIcon}>{t.icon}</span>
                    <span className={styles.typeLabel}>{t.label}</span>
                    <span className={styles.typeDesc}>{t.desc}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Content ── */}
          {step === 2 && (
            <motion.div
              key="step2"
              className={styles.step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0  }}
              exit={{    opacity: 0, x: -30 }}
              transition={{ duration: 0.35 }}
            >
              <button className={styles.backBtn} onClick={() => setStep(1)}>← Back</button>
              <h1 className={styles.stepTitle}>
                {type === 'letter' ? 'Write your letter' : type === 'image' ? 'Upload a photo' : 'Add a video'}
              </h1>
              <p className={styles.stepSub}>This will be sealed until your unlock date arrives.</p>

              {/* Title */}
              <div className={styles.field}>
                <label className={styles.label}>Capsule title</label>
                <input
                  className={styles.input}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give this memory a name…"
                  maxLength={80}
                />
              </div>

              {/* Content */}
              {type === 'letter' && (
                <div className={styles.field}>
                  <label className={styles.label}>Your letter</label>
                  <textarea
                    className={styles.textarea}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Dear future me…"
                    rows={12}
                    maxLength={10000}
                  />
                  <div className={styles.charCount}>{content.length} / 10,000</div>
                </div>
              )}

              {(type === 'image' || type === 'video') && (
                <div className={styles.field}>
                  <label className={styles.label}>
                    {type === 'image' ? 'Upload photo (max 5MB)' : 'Upload video (max 5MB)'}
                  </label>
                  <div
                    className={`${styles.dropZone} ${content ? styles.dropZoneFilled : ''}`}
                    onClick={() => fileRef.current?.click()}
                  >
                    {content ? (
                      <div className={styles.fileFilled}>
                        {type === 'image'
                          ? <img src={content} alt="preview" className={styles.imagePreview} />
                          : <video src={content} className={styles.videoPreview} controls />
                        }
                        <p className={styles.fileName}>{fileName}</p>
                      </div>
                    ) : (
                      <div className={styles.dropPlaceholder}>
                        <span className={styles.dropIcon}>{type === 'image' ? '📸' : '🎬'}</span>
                        <span className={styles.dropText}>Click to upload</span>
                        <span className={styles.dropSub}>or drag and drop</span>
                      </div>
                    )}
                    <input
                      ref={fileRef}
                      type="file"
                      accept={type === 'image' ? 'image/*' : 'video/*'}
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
              )}

              <Button
                onClick={() => setStep(3)}
                disabled={!canGoToStep3()}
                size="lg"
                fullWidth
              >
                Continue to lock settings →
              </Button>
            </motion.div>
          )}

          {/* ── Step 3: Lock duration ── */}
          {step === 3 && (
            <motion.div
              key="step3"
              className={styles.step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0  }}
              exit={{    opacity: 0, x: -30 }}
              transition={{ duration: 0.35 }}
            >
              <button className={styles.backBtn} onClick={() => setStep(2)}>← Back</button>
              <h1 className={styles.stepTitle}>When will you open it?</h1>
              <p className={styles.stepSub}>Choose how long to lock your capsule. Once sealed, it cannot be opened early.</p>

              <div className={styles.field}>
                <LockDurationPicker value={duration} onChange={setDuration} />
              </div>

              {/* Summary */}
              {duration?.date && (
                <motion.div
                  className={styles.summary}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0  }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Capsule</span>
                    <span className={styles.summaryVal}>"{title}"</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Type</span>
                    <span className={styles.summaryVal}>{type}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Unlocks</span>
                    <span className={styles.summaryVal} style={{ color: 'var(--gold)' }}>
                      {duration.date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                </motion.div>
              )}

              <Button
                onClick={handleSeal}
                disabled={!duration?.date}
                loading={sealing}
                size="lg"
                fullWidth
                className={styles.sealBtn}
              >
                ⧗ Seal this capsule
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
