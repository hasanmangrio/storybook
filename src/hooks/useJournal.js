import { useState, useEffect } from 'react'

const STORAGE_KEY = 'storybook_entries'

const SAMPLE_ENTRIES = [
  {
    id: '1',
    title: 'The morning light was different today',
    content: `There's a particular quality to the light in early spring that I've been trying to put into words for years. It's not the golden warmth of summer, nor the pale, tentative glow of late winter. It's something in between — a light that seems to hold its breath, unsure of itself, but quietly hopeful.\n\nI sat by the window this morning with my coffee going cold beside me, just watching the way it fell across the floor. The dust motes moved through it like tiny planets following their own invisible orbits. I thought about how this same light was falling on every city, every quiet room, every person pausing at their window just like me.\n\nThere's comfort in that, somehow.`,
    date: '2026-05-08',
    mood: 'reflective',
    wordCount: 118,
  },
  {
    id: '2',
    title: 'On learning to be still',
    content: `I've been trying to meditate. Not seriously — not with apps or cushions or any kind of discipline. Just sitting. Just trying to not be somewhere else in my head for five minutes.\n\nIt's harder than it sounds. My mind is a restless tenant, always rearranging furniture, always making lists of things that need doing. But today, for a moment, I managed it. A small clearing in the noise.`,
    date: '2026-05-06',
    mood: 'calm',
    wordCount: 80,
  },
  {
    id: '3',
    title: 'A letter to my past self',
    content: `You're going to be okay. I know that sounds like something people say when they don't know what else to say, but I mean it in the most specific way possible. The things you're worried about right now — they will resolve themselves in ways you couldn't have predicted.\n\nThe job will come. The apartment will come. The feeling of knowing where you're going — that will come too, slowly, in pieces, like a photograph developing in the dark.`,
    date: '2026-05-03',
    mood: 'hopeful',
    wordCount: 90,
  },
  {
    id: '4',
    title: 'What the city sounds like at 3am',
    content: `Couldn't sleep. Gave up around 2:30 and sat on the fire escape with a glass of water. The city at this hour is a different creature — quieter but not quiet, a low hum punctuated by distant sirens and the occasional cab.\n\nA fox crossed the street below me. Stopped. Looked up as if it had heard me thinking. Then continued on its way with total indifference, which felt, honestly, like exactly the right response.`,
    date: '2026-04-29',
    mood: 'curious',
    wordCount: 88,
  },
  {
    id: '5',
    title: 'Things I want to remember',
    content: `The way she laughs at her own jokes before she's finished telling them. The smell of rain on concrete in July. How the bookshop on the corner always has the exact book I need even when I don't know what I'm looking for. The feeling of finishing something hard.\n\nI keep a list. Not a formal one — just moments I don't want to lose to the general blur of time.`,
    date: '2026-04-25',
    mood: 'grateful',
    wordCount: 75,
  },
]

export function useJournal() {
  const [entries, setEntries] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : SAMPLE_ENTRIES
    } catch {
      return SAMPLE_ENTRIES
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  }, [entries])

  const addEntry = (entry) => {
    const newEntry = {
      ...entry,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      wordCount: entry.content.trim().split(/\s+/).filter(Boolean).length,
    }
    setEntries((prev) => [newEntry, ...prev])
    return newEntry
  }

  const updateEntry = (id, updates) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              ...updates,
              wordCount: (updates.content ?? e.content)
                .trim()
                .split(/\s+/)
                .filter(Boolean).length,
            }
          : e
      )
    )
  }

  const deleteEntry = (id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  const getEntry = (id) => entries.find((e) => e.id === id)

  return { entries, addEntry, updateEntry, deleteEntry, getEntry }
}
