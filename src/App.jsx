import { Routes, Route } from 'react-router-dom'
import { useJournal } from './hooks/useJournal'
import Home from './pages/Home'
import Editor from './pages/Editor'
import Entry from './pages/Entry'

function App() {
  const journal = useJournal()

  return (
    <Routes>
      <Route path="/" element={<Home journal={journal} />} />
      <Route path="/new" element={<Editor journal={journal} />} />
      <Route path="/edit/:id" element={<Editor journal={journal} />} />
      <Route path="/entry/:id" element={<Entry journal={journal} />} />
    </Routes>
  )
}

export default App
