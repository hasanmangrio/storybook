import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Home.module.css'

const MOOD_COLORS = {
  reflective: { bg: '#EEF2F7', dot: '#7B9EC9' },
  calm: { bg: '#EFF7F2', dot: '#6BBF8A' },
  hopeful: { bg: '#FEF7EC', dot: '#E8A94B' },
  curious: { bg: '#F2EEF7', dot: '#9B7BC9' },
  grateful: { bg: '#FDF0F0', dot: '#C97B7B' },
  default: { bg: '#F7F6F2', dot: '#A8A5A0' },
}

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function EntryCard({ entry, index, onClick }) {
  const colors = MOOD_COLORS[entry.mood] || MOOD_COLORS.default
  const excerpt = entry.content.slice(0, 120).trim()

  return (
    <article
      className={styles.card}
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className={styles.cardInner} style={{ '--card-bg': colors.bg }}>
        <div className={styles.cardMeta}>
          <span className={styles.dot} style={{ background: colors.dot }} />
          <time className={styles.date}>{formatDate(entry.date)}</time>
          <span className={styles.wordCount}>{entry.wordCount} words</span>
        </div>

        <h2 className={styles.cardTitle}>{entry.title}</h2>

        <p className={styles.cardExcerpt}>
          {excerpt}
          {entry.content.length > 120 ? '…' : ''}
        </p>

        <div className={styles.cardFooter}>
          <span className={styles.readMore}>Read entry →</span>
        </div>
      </div>
    </article>
  )
}

export default function Home({ journal }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return journal.entries
    const q = search.toLowerCase()
    return journal.entries.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.content.toLowerCase().includes(q)
    )
  }, [journal.entries, search])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                <path
                  d="M22 6C22 6 18 10 12 14C8 16.5 6 20 6 20C6 20 8 19 10 19C10 19 7 22 7 26C7 26 10 22 13 21C13 21 12 23 12 25C12 25 15 20 18 17C20 15 24 12 26 8L22 6Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span className={styles.brandName}>Storybook</span>
          </div>

          <div className={styles.headerActions}>
            <div className={styles.searchWrapper}>
              <svg className={styles.searchIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                className={styles.search}
                type="text"
                placeholder="Search entries…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button
              className={styles.newBtn}
              onClick={() => navigate('/new')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New entry
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {journal.entries.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>✦</div>
            <h2>Your journal awaits</h2>
            <p>Begin with whatever is on your mind.</p>
            <button className={styles.newBtn} onClick={() => navigate('/new')}>
              Write your first entry
            </button>
          </div>
        ) : (
          <>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>
                {search ? `"${search}"` : 'Your entries'}
              </h1>
              <span className={styles.entryCount}>
                {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className={styles.noResults}>
                <p>No entries match your search.</p>
              </div>
            ) : (
              <div className={styles.grid}>
                {filtered.map((entry, i) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    index={i}
                    onClick={() => navigate(`/entry/${entry.id}`)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
