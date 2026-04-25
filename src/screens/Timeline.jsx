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
    <main className="min-h-screen bg-void-black px-4 py-8 text-silver-white sm:px-6">
      <section className="mx-auto w-full max-w-3xl rounded-2xl border border-neutral-gray/30 bg-slate-black p-5 sm:p-7">
        <button
          type="button"
          onClick={handleBack}
          className="h-8 -translate-y-3 self-start rounded-md border border-neutral-gray/40 bg-void-black px-2 py-0.5 text-[10px] font-medium text-silver-white"
        >
          Back
        </button>
        <h1 className="text-2xl font-semibold sm:text-3xl">Private Timeline</h1>

        {sessions.length === 0 ? (
          <p className="mt-4 rounded-lg border border-neutral-gray/30 bg-void-black/40 p-4 text-sm text-neutral-gray">
            No sessions saved yet.
          </p>
        ) : (
          <ul className="mt-5 space-y-3">
            {sessions.map((session, index) => (
              <li key={`${session.id || session.sessionId || index}-${index}`}>
                <button
                  type="button"
                  onClick={() => openReflection(session)}
                  className="w-full rounded-xl border border-neutral-gray/30 bg-void-black/40 p-4 text-left transition hover:border-memory-violet/50"
                >
                  <p className="text-base font-semibold text-silver-white">
                    {session.title || `Session ${sessions.length - index}`}
                  </p>
                  <p className="mt-1 text-sm text-neutral-gray">
                    {formatSessionDate(session.savedAt || session.endedAt || session.startedAt)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(Array.isArray(session.scenarioTags) ? session.scenarioTags : []).map((tag) => (
                      <span
                        key={`${session.id || index}-${tag}`}
                        className="rounded-full border border-memory-violet/40 bg-memory-violet/10 px-2.5 py-1 text-xs text-silver-white"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-neutral-gray">
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
