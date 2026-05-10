import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styles from './Entry.module.css'

const MOOD_DOT = {
  reflective: '#7B9EC9',
  calm:       '#6BBF8A',
  hopeful:    '#E8A94B',
  curious:    '#9B7BC9',
  grateful:   '#C97B7B',
  default:    '#A8A5A0',
}

const MOOD_LABEL = {
  reflective: 'Reflective',
  calm:       'Calm',
  hopeful:    'Hopeful',
  curious:    'Curious',
  grateful:   'Grateful',
}

function navWithTransition(navigate, to) {
  if (document.startViewTransition) {
    document.startViewTransition(() => navigate(to))
  } else {
    navigate(to)
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function Entry({ journal }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const entry = journal.getEntry(id)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!entry) {
    return (
      <div className={styles.notFound}>
        <p>Entry not found</p>
        <button className={styles.backBtn} onClick={() => navWithTransition(navigate, '/')}>← Back</button>
      </div>
    )
  }

  const dot   = MOOD_DOT[entry.mood]   || MOOD_DOT.default
  const label = MOOD_LABEL[entry.mood] || ''
  const paragraphs = entry.content.split('\n').filter((p) => p.trim())

  const handleDelete = () => {
    if (confirmDelete) {
      journal.deleteEntry(id)
      navWithTransition(navigate, '/')
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navWithTransition(navigate, '/')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
          All entries
        </button>

        <div className={styles.headerActions}>
          <button className={styles.editBtn} onClick={() => navWithTransition(navigate, `/edit/${id}`)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit
          </button>

          <button
            className={`${styles.deleteBtn} ${confirmDelete ? styles.deleteBtnConfirm : ''}`}
            onClick={handleDelete}
          >
            {confirmDelete ? 'Tap again to delete' : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <article className={styles.article}>
          <div className={styles.entryMeta}>
            <time className={styles.entryDate}>{formatDate(entry.date)}</time>
            {label && (
              <span className={styles.moodBadge} style={{ '--dot-color': dot }}>
                <span className={styles.moodBadgeDot} />
                {label}
              </span>
            )}
          </div>

          <h1 className={styles.title}>{entry.title}</h1>

          <div className={styles.divider} />

          <div className={styles.body}>
            {paragraphs.map((para, i) => (
              <p key={i} className={styles.paragraph}>{para}</p>
            ))}
          </div>

          <footer className={styles.entryFooter}>
            <span>{entry.wordCount} words</span>
            <span className={styles.sep}>·</span>
            <span>{Math.ceil(entry.wordCount / 200)} min read</span>
          </footer>
        </article>
      </main>
    </div>
  )
}
