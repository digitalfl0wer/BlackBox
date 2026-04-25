import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useSession } from '../context/SessionContext'

const COMPONENT_MODULES = import.meta.glob('../components/*.jsx', { eager: true })

const SCENARIO_TAGS = [
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
]

function getOptionalComponent(name) {
  const entry = Object.entries(COMPONENT_MODULES).find(([path]) => path.endsWith(`/${name}.jsx`))
  return entry?.[1]?.default || null
}

function formatDateTime(isoValue) {
  if (!isoValue) {
    return 'Not available'
  }

  return new Date(isoValue).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatDuration(totalSeconds) {
  if (!Number.isFinite(totalSeconds)) {
    return '00:00'
  }

  const safe = Math.max(0, totalSeconds)
  const minutes = String(Math.floor(safe / 60)).padStart(2, '0')
  const seconds = String(safe % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

export default function EndSession() {
  const navigate = useNavigate()
  const { currentSession, saveSession } = useSession()

  const TagPicker = useMemo(() => getOptionalComponent('TagPicker'), [])

  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [scenarioTags, setScenarioTags] = useState([])
  const [error, setError] = useState('')

  if (!currentSession) {
    return <Navigate to="/home" replace />
  }

  function handleFallbackTagToggle(tag) {
    setScenarioTags((previous) =>
      previous.includes(tag)
        ? previous.filter((existing) => existing !== tag)
        : [...previous, tag]
    )
  }

  function handleSave(event) {
    event.preventDefault()

    if (!title.trim()) {
      setError('Session title is required before saving.')
      return
    }

    const payload = {
      ...currentSession,
      id: currentSession.sessionId || `${Date.now()}`,
      title: title.trim(),
      notes: notes.trim(),
      scenarioTags,
      savedAt: new Date().toISOString(),
    }

    saveSession(payload)
    setError('')
    navigate('/reflecting')
  }

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/home', { replace: true })
  }

  return (
    <main className="min-h-screen bg-void-black px-4 py-8 text-silver-white sm:px-6">
      <section className="mx-auto w-full max-w-3xl rounded-2xl border border-neutral-gray/30 bg-slate-black p-5 sm:p-7">
        <button
          type="button"
          onClick={handleBack}
          className="h-8 -translate-y-3 self-start rounded-md border border-neutral-gray/40 bg-void-black px-2 py-0.5 text-[10px] font-medium text-silver-white"
        >
          Back
        </button>
        <h1 className="text-2xl font-semibold sm:text-3xl">End Session</h1>

        <div className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-neutral-gray/30 bg-void-black/40 p-4 text-sm text-neutral-gray sm:grid-cols-3">
          <p>
            <span className="block text-xs uppercase tracking-wide text-neutral-gray">Start Time</span>
            <span className="text-silver-white">{formatDateTime(currentSession.startedAt)}</span>
          </p>
          <p>
            <span className="block text-xs uppercase tracking-wide text-neutral-gray">Duration</span>
            <span className="text-silver-white">{formatDuration(currentSession.durationSeconds)}</span>
          </p>
          <p>
            <span className="block text-xs uppercase tracking-wide text-neutral-gray">Signal Sent</span>
            <span className="text-silver-white">{currentSession.signalSent ? 'Yes' : 'No'}</span>
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSave}>
          <label className="block">
            <span className="mb-1 block text-sm text-silver-white">Title</span>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="min-h-12 w-full rounded-lg border border-neutral-gray/40 bg-void-black px-3 text-silver-white outline-none focus:border-unity-amber"
              required
            />
          </label>

          <div className="space-y-2">
            <span className="block text-sm text-silver-white">Scenario Tags</span>
            {TagPicker ? (
              <TagPicker
                options={SCENARIO_TAGS}
                selectedTags={scenarioTags}
                value={scenarioTags}
                onChange={setScenarioTags}
              />
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {SCENARIO_TAGS.map((tag) => (
                  <label
                    key={tag}
                    className="flex min-h-12 items-center gap-2 rounded-lg border border-neutral-gray/30 bg-void-black/50 px-3 text-sm text-silver-white"
                  >
                    <input
                      type="checkbox"
                      checked={scenarioTags.includes(tag)}
                      onChange={() => handleFallbackTagToggle(tag)}
                      className="h-4 w-4 accent-memory-violet"
                    />
                    <span>{tag}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <label className="block">
            <span className="mb-1 block text-sm text-silver-white">Notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Write details you want to remember from this session."
              className="min-h-32 w-full rounded-lg border border-neutral-gray/40 bg-void-black px-3 py-2 text-silver-white outline-none focus:border-unity-amber"
            />
          </label>

          {error ? <p className="text-sm text-memory-violet">{error}</p> : null}

          <button
            type="submit"
            className="min-h-12 w-full rounded-lg bg-unity-amber px-4 py-3 text-sm font-semibold text-void-black"
          >
            Save &amp; Generate Reflection
          </button>
        </form>
      </section>
    </main>
  )
}
