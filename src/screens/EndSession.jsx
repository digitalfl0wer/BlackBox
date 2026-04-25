import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useSession } from '../context/SessionContext'

export function EndSession({
  session,
  onBack,
  onSave,
  scenarios = [
    'Police Encounter',
    'Workplace Concern',
    'Relationship Safety',
    'Boundary / Consent Concern',
    'Public Harassment',
    'Stalking / Unwanted Contact',
    'Digital Safety',
    'Exploitation / Restricted Movement',
    'Medical Concern',
    'Other',
  ],
}) {
  const [title, setTitle] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [notes, setNotes] = useState('')

  const toggleTag = (tag) => {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((entry) => entry !== tag) : [...current, tag]
    )
  }

  function handleSave() {
    if (!title.trim()) return
    onSave?.({ title: title.trim(), tags: selectedTags, notes: notes.trim() })
  }

  const startedAt = session?.startedAt ? new Date(session.startedAt) : new Date()
  const startStamp = `${startedAt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })}, ${startedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`

  return (
    <main className="bbx-page">
      <div className="pointer-events-none fixed bottom-[8%] left-[-10%] h-[260px] w-[260px] bg-[radial-gradient(circle,rgba(245,166,35,0.08)_0%,transparent_70%)]" />

      <section className="bbx-shell max-w-4xl">
        <div className="bbx-card p-4 sm:p-6 lg:p-8">
          <header className="flex items-center justify-between gap-3">
            <button type="button" className="bbx-back" onClick={onBack}>← Back</button>
            <p className="text-[10px] font-medium tracking-[0.2em] text-[#555570]">SESSION WRAP-UP</p>
          </header>

          <h1 className="bbx-font-display mt-5 text-3xl font-extrabold sm:text-4xl">Wrap Up Your Session</h1>

          <div className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-[#0f0f1a] p-4 text-center sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:text-left">
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold tracking-[0.15em] text-[#555570]">START TIME</span>
              <span className="mt-1 text-sm font-semibold text-white">{startStamp}</span>
            </div>
            <div className="hidden w-px bg-white/10 sm:block" />
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold tracking-[0.15em] text-[#555570]">DURATION</span>
              <span className="bbx-font-mono mt-1 text-sm font-semibold text-white">{session?.duration || '00:00'}</span>
            </div>
            <div className="hidden w-px bg-white/10 sm:block" />
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold tracking-[0.15em] text-[#555570]">SIGNAL SENT</span>
              <span className={`mt-1 text-sm font-semibold ${session?.signalSent ? 'text-[#2ED573]' : 'text-[#9090A8]'}`}>
                {session?.signalSent ? 'Yes' : 'No'}
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#9090A8]">
                Session Title <span className="text-[#F5A623]">*</span>
              </span>
              <input
                className="w-full rounded-xl border border-white/10 bg-[#0c0c18] px-4 py-3 text-white outline-none focus:border-[#F5A623]"
                placeholder="Give this session a name you'll recognize later"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>

            <div>
              <p className="mb-2 text-sm font-medium text-[#9090A8]">What happened? (select all that apply)</p>
              <div className="flex flex-wrap gap-2">
                {scenarios.map((tag) => {
                  const selected = selectedTags.includes(tag)
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`rounded-full border px-3 py-2 text-xs font-medium transition ${
                        selected
                          ? 'border-[#7B4FFF]/50 bg-[#7B4FFF]/15 text-[#9f86ff]'
                          : 'border-white/10 bg-[#0f0f1a] text-[#9090A8]'
                      }`}
                    >
                      {tag}
                    </button>
                  )
                })}
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#9090A8]">Notes</span>
              <textarea
                className="min-h-[120px] w-full rounded-xl border border-white/10 bg-[#0c0c18] px-4 py-3 text-white outline-none focus:border-[#F5A623]"
                placeholder="What happened? Write as much detail as you remember. This is for you."
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </label>

            <div className="bbx-disclaimer px-4 py-3 text-xs leading-6">
              This app is for personal safety documentation and education. It does not provide legal advice.
              AI can make mistakes - review all summaries before relying on them.
            </div>

            <button
              type="button"
              className="bbx-action bbx-action-amber w-full text-base font-bold disabled:opacity-50"
              onClick={handleSave}
              disabled={!title.trim()}
            >
              Save &amp; Generate Reflection
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}

function formatDuration(totalSeconds) {
  const safe = Number.isFinite(totalSeconds) ? Math.max(0, totalSeconds) : 0
  const minutes = String(Math.floor(safe / 60)).padStart(2, '0')
  const seconds = String(safe % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

export default function EndSessionRoute() {
  const navigate = useNavigate()
  const { currentSession, saveSession } = useSession()

  if (!currentSession) {
    return <Navigate to="/home" replace />
  }

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }
    navigate('/home', { replace: true })
  }

  function handleSave({ title, tags, notes }) {
    const payload = {
      ...currentSession,
      id: currentSession.sessionId || `${Date.now()}`,
      title,
      notes,
      scenarioTags: tags,
      tags,
      duration: formatDuration(currentSession.durationSeconds),
      savedAt: new Date().toISOString(),
    }

    saveSession(payload)
    navigate('/reflecting')
  }

  return (
    <EndSession
      session={{ ...currentSession, duration: formatDuration(currentSession.durationSeconds) }}
      onBack={handleBack}
      onSave={handleSave}
    />
  )
}
