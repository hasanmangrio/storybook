import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styles from './Editor.module.css'

const MOODS = [
  { id: 'reflective', label: 'Reflective', color: '#7B9EC9' },
  { id: 'calm', label: 'Calm', color: '#6BBF8A' },
  { id: 'hopeful', label: 'Hopeful', color: '#E8A94B' },
  { id: 'curious', label: 'Curious', color: '#9B7BC9' },
  { id: 'grateful', label: 'Grateful', color: '#C97B7B' },
]

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function readingTime(words) {
  const mins = Math.ceil(words / 200)
  return mins === 1 ? '1 min read' : `${mins} min read`
}

export default function Editor({ journal }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)
  const existing = isEditing ? journal.getEntry(id) : null

  const [title, setTitle] = useState(existing?.title ?? '')
  const [content, setContent] = useState(existing?.content ?? '')
  const [mood, setMood] = useState(existing?.mood ?? 'reflective')
  const [saved, setSaved] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [focused, setFocused] = useState(false)
  const saveTimer = useRef(null)
  const savedIdRef = useRef(id ?? null)
  const contentRef = useRef(null)

  const words = wordCount(content)

  const autoSave = useCallback(() => {
    if (!title.trim() && !content.trim()) return

    setSaving(true)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      if (savedIdRef.current) {
        journal.updateEntry(savedIdRef.current, { title, content, mood })
      } else {
        const entry = journal.addEntry({ title, content, mood })
        savedIdRef.current = entry.id
        window.history.replaceState(null, '', `/edit/${entry.id}`)
      }
      setSaving(false)
      setSaved(true)
    }, 1200)
  }, [title, content, mood, journal])

  useEffect(() => {
    if (title || content) {
      setSaved(false)
      autoSave()
    }
    return () => clearTimeout(saveTimer.current)
  }, [title, content, mood])

  const handleFinish = () => {
    clearTimeout(saveTimer.current)
    if (title.trim() || content.trim()) {
      if (savedIdRef.current) {
        journal.updateEntry(savedIdRef.current, { title, content, mood })
      } else {
        journal.addEntry({ title, content, mood })
      }
    }
    navigate('/')
  }

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleFinish()
    }
  }

  useEffect(() => {
    if (!isEditing && contentRef.current) {
      setTimeout(() => contentRef.current?.focus(), 100)
    }
  }, [isEditing])

  return (
    <div className={`${styles.page} ${focused ? styles.focused : ''}`} onKeyDown={handleKeyDown}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
          All entries
        </button>

        <div className={styles.status}>
          {saving ? (
            <span className={styles.saving}>
              <span className={styles.savingDot} />
              Saving…
            </span>
          ) : saved ? (
            <span className={styles.savedLabel}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m20 6-11 11-5-5" />
              </svg>
              Saved
            </span>
          ) : (
            <span className={styles.unsaved}>Unsaved</span>
          )}
        </div>

        <div className={styles.headerRight}>
          {words > 0 && (
            <span className={styles.stats}>
              {words} words · {readingTime(words)}
            </span>
          )}
          <button
            className={styles.finishBtn}
            onClick={handleFinish}
            disabled={!title.trim() && !content.trim()}
          >
            {isEditing ? 'Done' : 'Finish'}
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.editorWrap}>
          <div className={styles.dateLine}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>

          <input
            className={styles.titleInput}
            type="text"
            placeholder="Give this moment a title…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            maxLength={120}
          />

          <textarea
            ref={contentRef}
            className={styles.contentArea}
            placeholder="What's on your mind today? Write freely — this is just for you."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />

          <div className={styles.moodRow}>
            <span className={styles.moodLabel}>Mood</span>
            <div className={styles.moods}>
              {MOODS.map((m) => (
                <button
                  key={m.id}
                  className={`${styles.moodChip} ${mood === m.id ? styles.moodActive : ''}`}
                  style={{ '--mood-color': m.color }}
                  onClick={() => setMood(m.id)}
                  type="button"
                >
                  <span className={styles.moodDot} />
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      <div className={styles.hint}>
        <kbd>⌘</kbd><kbd>↵</kbd> to finish
      </div>
    </div>
  )
}
