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
  const Guardrail = useMemo(() => getOptionalComponent('Guardrail'), [])

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
    <main className="bb-page">
      <section className="bb-shell bb-panel max-w-3xl">
        <button
          type="button"
          onClick={handleBack}
          className="bb-back mb-4"
        >
          Back
        </button>
        <p className="bb-label">SESSION WRAP-UP</p>
        <h1 className="bb-title mt-2 text-2xl sm:text-3xl">End Session</h1>

        <div className="mt-4 grid grid-cols-1 gap-3 rounded-control border border-divider-gray/80 bg-void-black/45 p-4 text-sm text-mist-gray sm:grid-cols-3">
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
              className="bb-input"
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
                    className="flex min-h-touch items-center gap-2 rounded-control border border-divider-gray bg-void-black/50 px-3 text-sm text-silver-white"
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
              className="bb-textarea min-h-32"
            />
          </label>

          {Guardrail ? <Guardrail /> : null}

          {error ? <p className="text-sm text-memory-violet">{error}</p> : null}

          <button
            type="submit"
            className="bb-btn-primary w-full"
          >
            Save &amp; Generate Reflection
          </button>
        </form>
      </section>
    </main>
  )
}
