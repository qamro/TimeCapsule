import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import styles from './LandingPage.module.css'

const FADE = (delay = 0) => ({
  initial:    { opacity: 0, y: 28 },
  animate:    { opacity: 1, y: 0  },
  transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] },
})

const FEATURES = [
  { icon: '✉️', title: 'Write Letters',      desc: 'Pour your heart into words. Seal your thoughts for the future.' },
  { icon: '📸', title: 'Capture Memories',   desc: 'A photo that holds a moment in time, waiting to resurface.' },
  { icon: '🎬', title: 'Record Your Voice',  desc: 'Hear your own voice from the past. Nothing is more powerful.' },
  { icon: '⏳', title: 'Choose Your Lock',   desc: '1 month to 10 years. Time is yours to command.' },
  { icon: '🔔', title: 'Future Delivery',    desc: 'When the moment comes, a message arrives: your past is calling.' },
  { icon: '🔐', title: 'Private & Secure',   desc: 'Your memories are yours alone. Locked until the time is right.' },
]

export default function LandingPage() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const canvasRef  = useRef(null)

  // Redirect if logged in
  useEffect(() => {
    if (user) navigate('/dashboard')
  }, [user])

  // Animated particles background
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let particles = []
    let animId

    function resize() {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }

    function init() {
      particles = Array.from({ length: 60 }, () => ({
        x:    Math.random() * canvas.width,
        y:    Math.random() * canvas.height,
        r:    Math.random() * 1.4 + 0.3,
        a:    Math.random() * 0.5 + 0.1,
        vx:   (Math.random() - 0.5) * 0.12,
        vy:   -Math.random() * 0.15 - 0.05,
      }))
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(201, 169, 110, ${p.a})`
        ctx.fill()
        p.x += p.vx
        p.y += p.vy
        if (p.y < -5) { p.y = canvas.height + 5; p.x = Math.random() * canvas.width }
        if (p.x < -5) p.x = canvas.width + 5
        if (p.x > canvas.width + 5) p.x = -5
      })
      animId = requestAnimationFrame(draw)
    }

    resize()
    init()
    draw()
    window.addEventListener('resize', () => { resize(); init() })
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className={styles.page}>
      {/* Particle canvas */}
      <canvas ref={canvasRef} className={styles.canvas} />

      {/* Ambient glow */}
      <div className={styles.glow1} />
      <div className={styles.glow2} />

      {/* Navbar */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <span className={styles.navLogoIcon}>⧗</span>
          <span className={styles.navLogoText}>TimeCapsule</span>
        </div>
        <Link to="/login" className={styles.navSignIn}>Sign In →</Link>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <motion.div className={styles.heroTag} {...FADE(0.2)}>
          ✦ Your memories deserve a future
        </motion.div>

        <motion.h1 className={styles.heroTitle} {...FADE(0.45)}>
          Send a message to<br />
          <em>your future self.</em>
        </motion.h1>

        <motion.p className={styles.heroSub} {...FADE(0.7)}>
          Seal your letters, photos and videos in a time capsule.<br />
          Unlock them when the moment finally arrives.
        </motion.p>

        <motion.div className={styles.heroCtas} {...FADE(0.95)}>
          <Link to="/login" className={styles.ctaPrimary}>
            Create your first capsule
          </Link>
          <a href="#features" className={styles.ctaSecondary}>
            See how it works ↓
          </a>
        </motion.div>

        {/* Floating capsule preview */}
        <motion.div
          className={styles.heroCard}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ delay: 1.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.heroCardBadge}>⧗ Sealed · Opens in 1 year</div>
          <div className={styles.heroCardTitle}>
            "Dear future me, I hope you made it."
          </div>
          <div className={styles.heroCardMeta}>Written today · Unlocks {new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className={styles.features}>
        <motion.div
          className={styles.featuresHeader}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className={styles.featuresTitle}>Everything you need to<br />preserve a moment.</h2>
        </motion.div>

        <div className={styles.featuresGrid}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              className={styles.featureCard}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
            >
              <span className={styles.featureIcon}>{f.icon}</span>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA section */}
      <section className={styles.cta}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className={styles.ctaBox}
        >
          <div className={styles.ctaTag}>⧗ Start your journey</div>
          <h2 className={styles.ctaTitle}>What would you tell<br />yourself in 10 years?</h2>
          <p className={styles.ctaSub}>The best time to write was yesterday. The second best time is now.</p>
          <Link to="/login" className={styles.ctaPrimary}>
            Seal your first memory
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <span className={styles.footerLogo}>⧗ TimeCapsule</span>
        <span className={styles.footerCopy}>Your memories, delivered to your future.</span>
      </footer>
    </div>
  )
}
