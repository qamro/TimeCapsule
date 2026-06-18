import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useCapsules } from '../context/CapsuleContext'
import CapsuleCard from '../components/capsule/CapsuleCard'
import Navbar from '../components/layout/Navbar'
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
  const { user }               = useAuth()
  const { locked, unlocked, loading } = useCapsules()
  const navigate               = useNavigate()

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user])

  const name = user?.displayName?.split(' ')[0] || 'Traveler'

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.inner}>
        {/* Header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <p className={styles.greeting}>Welcome back, {name}</p>
            <h1 className={styles.title}>Your Time Capsules</h1>
          </div>
          <Link to="/create" className={styles.newBtn}>
            + New Capsule
          </Link>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className={styles.loadWrap}>
            <div className={styles.loadDots}>
              <span /><span /><span />
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && locked.length === 0 && unlocked.length === 0 && (
          <motion.div
            className={styles.empty}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className={styles.emptyIcon}>⧗</div>
            <h2 className={styles.emptyTitle}>No capsules yet</h2>
            <p className={styles.emptySub}>
              Your first time capsule is waiting to be created.<br />
              What would you tell your future self?
            </p>
            <Link to="/create" className={styles.emptyBtn}>
              Create your first capsule
            </Link>
          </motion.div>
        )}

        {/* Unlocked capsules */}
        {!loading && unlocked.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionDot} style={{ background: 'var(--gold)' }} />
                Ready to Open
              </h2>
              <span className={styles.sectionCount}>{unlocked.length}</span>
            </div>
            <div className={styles.grid}>
              {unlocked.map((c, i) => (
                <CapsuleCard key={c.id} capsule={c} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Locked capsules */}
        {!loading && locked.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionDot} style={{ background: 'var(--cream-40)' }} />
                Sealed
              </h2>
              <span className={styles.sectionCount}>{locked.length}</span>
            </div>
            <div className={styles.grid}>
              {locked.map((c, i) => (
                <CapsuleCard key={c.id} capsule={c} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
