import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function readSessions() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem('blackbox_sessions') || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function formatSessionDate(isoDate) {
  if (!isoDate) {
    return 'No date'
  }

  return new Date(isoDate).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function Timeline() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    setSessions(readSessions())
  }, [])

  function openReflection(session) {
    window.localStorage.setItem('blackbox_current_session', JSON.stringify(session))

    if (session.reflection) {
      window.localStorage.setItem('blackbox_reflection', JSON.stringify(session.reflection))
    }

    navigate('/reflection')
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
        <p className="bb-label">PRIVATE TIMELINE</p>
        <h1 className="bb-title mt-2 text-2xl sm:text-3xl">Private Timeline</h1>

        {sessions.length === 0 ? (
          <p className="mt-4 rounded-control border border-divider-gray bg-void-black/45 p-4 text-sm text-neutral-gray">
            No sessions saved yet.
          </p>
        ) : (
          <ul className="mt-5 space-y-3">
            {sessions.map((session, index) => (
              <li key={`${session.id || session.sessionId || index}-${index}`}>
                <button
                  type="button"
                  onClick={() => openReflection(session)}
                  className="w-full rounded-card border border-divider-gray/80 bg-void-black/45 p-4 text-left transition hover:border-memory-violet/55 hover:shadow-violet-glow"
                >
                  <p className="text-base font-semibold text-silver-white">
                    {session.title || `Session ${sessions.length - index}`}
                  </p>
                  <p className="mt-1 text-sm text-mist-gray">
                    {formatSessionDate(session.savedAt || session.endedAt || session.startedAt)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(Array.isArray(session.scenarioTags) ? session.scenarioTags : []).map((tag) => (
                      <span key={`${session.id || index}-${tag}`} className="bb-chip">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-mist-gray">
                    Signal sent: <span className="text-silver-white">{session.signalSent ? 'Yes' : 'No'}</span>
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
