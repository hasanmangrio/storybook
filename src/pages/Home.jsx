import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Home.module.css'

const MOOD_GRADIENTS = {
  reflective: 'linear-gradient(145deg, #1C3A5E 0%, #2E5F9E 55%, #1A3A6A 100%)',
  calm:       'linear-gradient(145deg, #1A3B28 0%, #2E6B48 55%, #1A4532 100%)',
  hopeful:    'linear-gradient(145deg, #5C3010 0%, #C47020 55%, #A05010 100%)',
  curious:    'linear-gradient(145deg, #28184C 0%, #5030A0 55%, #341868 100%)',
  grateful:   'linear-gradient(145deg, #4C1824 0%, #903050 55%, #68182E 100%)',
  default:    'linear-gradient(145deg, #282420 0%, #484038 55%, #342E28 100%)',
}

const MOOD_SHIMMER = {
  reflective: 'rgba(80,140,220,0.15)',
  calm:       'rgba(60,160,100,0.15)',
  hopeful:    'rgba(220,140,40,0.15)',
  curious:    'rgba(120,60,220,0.15)',
  grateful:   'rgba(200,60,100,0.15)',
  default:    'rgba(160,140,120,0.1)',
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

// Returns transform style for a card at integer/fractional offset from center
function getCardStyle(offset) {
  const abs = Math.abs(offset)
  const sign = Math.sign(offset) || 1

  if (abs === 0) {
    return {
      transform: 'translate(-50%, -50%) rotateY(0deg) scale(1) translateZ(0px)',
      opacity: 1,
      zIndex: 50,
      pointerEvents: 'auto',
    }
  }

  // Side cards: shift outward, tilt inward, recede
  const xShift    = sign * Math.min(200 + (abs - 1) * 130, 460)
  const rotateY   = sign * -54
  const scaleVal  = Math.max(1 - abs * 0.09, 0.55)
  const zDepth    = -Math.min(abs * 80, 260)
  const opacity   = Math.max(1 - abs * 0.28, 0.08)

  return {
    transform: `translate(calc(-50% + ${xShift}px), -50%) rotateY(${rotateY}deg) scale(${scaleVal}) translateZ(${zDepth}px)`,
    opacity,
    zIndex: Math.max(50 - Math.round(abs) * 12, 1),
    pointerEvents: abs <= 2 ? 'auto' : 'none',
    cursor: 'pointer',
  }
}

function CoverCard({ entry, offset, onClick }) {
  const gradient = MOOD_GRADIENTS[entry.mood] || MOOD_GRADIENTS.default
  const shimmer  = MOOD_SHIMMER[entry.mood]  || MOOD_SHIMMER.default
  const style    = getCardStyle(offset)
  const isActive = offset === 0

  return (
    <div
      className={`${styles.cardWrap} ${isActive ? styles.cardWrapActive : ''}`}
      style={style}
      onClick={onClick}
      role="button"
      tabIndex={isActive ? 0 : -1}
      aria-label={entry.title}
    >
      {/* Colored glow behind the card */}
      <div className={styles.cardGlow} style={{ background: gradient }} />

      {/* Main face */}
      <div className={styles.card} style={{ background: gradient }}>
        <div className={styles.cardShimmer} style={{ background: shimmer }} />
        <div className={styles.cardInner}>
          <p className={styles.cardDate}>{formatDate(entry.date)}</p>
          <h2 className={styles.cardTitle}>{entry.title}</h2>
        </div>
        <div className={styles.cardGloss} />
      </div>

      {/* Reflection */}
      <div className={styles.reflection} aria-hidden="true">
        <div className={styles.card} style={{ background: gradient }}>
          <div className={styles.cardInner}>
            <p className={styles.cardDate}>{formatDate(entry.date)}</p>
            <h2 className={styles.cardTitle}>{entry.title}</h2>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home({ journal }) {
  const navigate = useNavigate()
  const [activeIndex, setActiveIndex] = useState(0)
  const [animDir, setAnimDir] = useState(null)
  const entries = journal.entries
  const wheelLock = useRef(false)

  const go = useCallback((dir) => {
    setActiveIndex(prev => {
      const next = Math.max(0, Math.min(entries.length - 1, prev + dir))
      if (next !== prev) setAnimDir(dir > 0 ? 'right' : 'left')
      return next
    })
  }, [entries.length])

  const openEntry = useCallback((id) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => navigate(`/entry/${id}`))
    } else {
      navigate(`/entry/${id}`)
    }
  }, [navigate])

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft')  go(-1)
      if (e.key === 'Enter' && entries[activeIndex]) openEntry(entries[activeIndex].id)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, activeIndex, entries, openEntry])

  // Mouse wheel navigation (debounced)
  useEffect(() => {
    const onWheel = (e) => {
      e.preventDefault()
      if (wheelLock.current) return
      wheelLock.current = true
      go(e.deltaX > 0 || e.deltaY > 0 ? 1 : -1)
      setTimeout(() => { wheelLock.current = false }, 320)
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [go])

  // Clear animation direction after transition
  useEffect(() => {
    if (animDir) {
      const t = setTimeout(() => setAnimDir(null), 400)
      return () => clearTimeout(t)
    }
  }, [animDir])

  const active = entries[activeIndex]

  if (entries.length === 0) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <Brand />
          <button className={styles.newBtn} onClick={() => navigate('/new')}>
            <PlusIcon /> New entry
          </button>
        </header>
        <div className={styles.empty}>
          <span className={styles.emptyGlyph}>✦</span>
          <p className={styles.emptyTitle}>Your journal awaits</p>
          <p className={styles.emptySub}>Begin with whatever is on your mind.</p>
          <button className={styles.openBtn} onClick={() => navigate('/new')}>
            Write your first entry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Brand />
        <button className={styles.newBtn} onClick={() => navigate('/new')}>
          <PlusIcon /> New entry
        </button>
      </header>

      {/* Cover flow stage */}
      <section className={styles.stage} aria-label="Journal entries">
        <div className={styles.stageScene}>
          {entries.map((entry, i) => {
            const offset = i - activeIndex
            if (Math.abs(offset) > 3) return null
            return (
              <CoverCard
                key={entry.id}
                entry={entry}
                offset={offset}
                onClick={() => offset === 0 ? openEntry(entry.id) : go(offset)}
              />
            )
          })}
        </div>

        {/* Nav arrows */}
        <button
          className={`${styles.arrow} ${styles.arrowLeft}`}
          onClick={() => go(-1)}
          disabled={activeIndex === 0}
          aria-label="Previous entry"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <button
          className={`${styles.arrow} ${styles.arrowRight}`}
          onClick={() => go(1)}
          disabled={activeIndex === entries.length - 1}
          aria-label="Next entry"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </section>

    </div>
  )
}

function Brand() {
  return (
    <div className={styles.brand}>
      <div className={styles.logo}>
        <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
          <path d="M22 6C22 6 18 10 12 14C8 16.5 6 20 6 20C6 20 8 19 10 19C10 19 7 22 7 26C7 26 10 22 13 21C13 21 12 23 12 25C12 25 15 20 18 17C20 15 24 12 26 8L22 6Z" fill="currentColor" />
        </svg>
      </div>
      <span className={styles.brandName}>Storybook</span>
    </div>
  )
}

function PlusIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}
