import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useSession } from '../context/SessionContext'

const COMPONENT_MODULES = import.meta.glob('../components/*.jsx', { eager: true })

function getOptionalComponent(name) {
  const entry = Object.entries(COMPONENT_MODULES).find(([path]) => path.endsWith(`/${name}.jsx`))
  return entry?.[1]?.default || null
}

function readStoredReflection() {
  try {
    return JSON.parse(window.localStorage.getItem('blackbox_reflection') || 'null')
  } catch {
    return null
  }
}

function readStoredSession() {
  try {
    return JSON.parse(window.localStorage.getItem('blackbox_current_session') || 'null')
  } catch {
    return null
  }
}

export default function ReflectionView() {
  const navigate = useNavigate()
  const { reflection, currentSession } = useSession()
  const [resolvedReflection, setResolvedReflection] = useState(reflection)
  const [resolvedSession, setResolvedSession] = useState(currentSession)

  const Guardrail = useMemo(() => getOptionalComponent('Guardrail'), [])
  const ResourceCard = useMemo(() => getOptionalComponent('ResourceCard'), [])
  const AffirmingMessage = useMemo(() => getOptionalComponent('AffirmingMessage'), [])

  useEffect(() => {
    if (reflection) {
      setResolvedReflection(reflection)
      return
    }

    const stored = readStoredReflection()
    if (stored) {
      setResolvedReflection(stored)
    }
  }, [reflection])

  useEffect(() => {
    if (currentSession) {
      setResolvedSession(currentSession)
      return
    }

    const stored = readStoredSession()
    if (stored) {
      setResolvedSession(stored)
    }
  }, [currentSession])

  if (!resolvedReflection) {
    return <Navigate to="/home" replace />
  }

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/home', { replace: true })
  }

  const timeline = Array.isArray(resolvedReflection.timeline) ? resolvedReflection.timeline : []
  const concernAreas = Array.isArray(resolvedReflection.concernAreas)
    ? resolvedReflection.concernAreas
    : []
  const whyFlagged = Array.isArray(resolvedReflection.whyFlagged) ? resolvedReflection.whyFlagged : []
  const nextSteps = Array.isArray(resolvedReflection.nextSteps) ? resolvedReflection.nextSteps : []
  const supportOptions = Array.isArray(resolvedReflection.supportOptions)
    ? resolvedReflection.supportOptions
    : []
  const audioSource = resolvedSession?.audioUrl

  return (
    <main className="bb-page">
      <section className="bb-shell max-w-4xl space-y-4">
        {resolvedReflection.pipelineNotice ? (
          <div className="rounded-control border border-unity-amber/50 bg-unity-amber/10 p-4 text-sm text-silver-white">
            {resolvedReflection.pipelineNotice}
          </div>
        ) : null}

        <header className="bb-panel">
          <button
            type="button"
            onClick={handleBack}
            className="bb-back mb-4"
          >
            Back
          </button>
          <p className="bb-label">AI REFLECTION</p>
          <h1 className="bb-title mt-2 text-2xl sm:text-3xl">Session Reflection</h1>
        </header>

        {audioSource ? (
          <section className="bb-panel">
            <h2 className="text-lg font-semibold">Session Audio</h2>
            <audio
              className="mt-3 w-full"
              controls
              preload="metadata"
              src={audioSource}
            >
              Your browser does not support audio playback.
            </audio>
          </section>
        ) : null}

        <section className="bb-panel">
          <h2 className="text-lg font-semibold">1. Plain-Language Summary</h2>
          <p className="mt-3 leading-7 text-silver-white/90">{resolvedReflection.summary || 'No summary available.'}</p>
        </section>

        <section className="bb-panel">
          <h2 className="text-lg font-semibold">2. Timeline</h2>
          {timeline.length > 0 ? (
            <ol className="mt-3 space-y-3 text-sm text-silver-white/90">
              {timeline.map((item, index) => (
                <li key={`${item.time || index}-${item.event || index}`} className="rounded-control border border-divider-gray/80 bg-void-black/50 p-3">
                  <p className="text-xs uppercase tracking-wide text-neutral-gray">{item.time || `Step ${index + 1}`}</p>
                  <p className="mt-1">{item.event || 'No event text provided.'}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 text-sm text-neutral-gray">No timeline points were returned.</p>
          )}
        </section>

        <section className="bb-panel">
          <h2 className="text-lg font-semibold">3. Possible Concern Areas</h2>
          {concernAreas.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {concernAreas.map((area) => (
                <span key={area} className="bb-chip text-sm">
                  {area}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-neutral-gray">No concern areas were identified.</p>
          )}
        </section>

        <section className="bb-panel">
          <h2 className="text-lg font-semibold">4. Why These Were Flagged</h2>
          {whyFlagged.length > 0 ? (
            <div className="mt-3 space-y-3">
              {whyFlagged.map((item, index) => (
                <article key={`${item.area || index}-${index}`} className="rounded-control border border-divider-gray/80 bg-void-black/50 p-4">
                  <p className="text-sm font-semibold text-silver-white">{item.area || 'Possible concern area'}</p>
                  <p className="mt-1 text-sm text-silver-white/90">{item.reason || 'No reason provided.'}</p>
                  {Array.isArray(item.phrases) && item.phrases.length > 0 ? (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-gray">
                      {item.phrases.map((phrase, phraseIndex) => (
                        <li key={`${phrase}-${phraseIndex}`}>{phrase}</li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-neutral-gray">No flagged explanation details were returned.</p>
          )}
        </section>

        <section className="bb-panel">
          <h2 className="text-lg font-semibold">5. What This Does Not Mean</h2>
          <div className="mt-3">
            {Guardrail ? (
              <Guardrail variant="reflection" />
            ) : (
              <p className="rounded-lg border border-neutral-gray/30 bg-void-black/50 p-4 text-sm text-neutral-gray">
                {resolvedReflection.whatThisDoesNotMean ||
                  'This reflection is for personal documentation only and may contain errors.'}
              </p>
            )}
          </div>
        </section>

        <section className="bb-panel">
          <h2 className="text-lg font-semibold">6. Suggested Next Steps</h2>
          {nextSteps.length > 0 ? (
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-silver-white/90">
              {nextSteps.map((step, index) => (
                <li key={`${step}-${index}`}>{step}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-neutral-gray">No next steps were returned.</p>
          )}
        </section>

        <section className="bb-panel">
          <h2 className="text-lg font-semibold">7. Support Options</h2>
          {supportOptions.length > 0 ? (
            <div className="mt-3 grid grid-cols-1 gap-3">
              {supportOptions.map((resource, index) =>
                ResourceCard ? (
                  <ResourceCard key={`${resource.name || index}-${index}`} resource={resource} />
                ) : (
                  <article
                    key={`${resource.name || index}-${index}`}
                    className="rounded-lg border border-neutral-gray/30 bg-void-black/50 p-4"
                  >
                    <p className="text-sm font-semibold text-silver-white">{resource.name}</p>
                    <p className="mt-1 text-sm text-neutral-gray">{resource.description}</p>
                    {resource.url ? (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-block text-sm text-unity-amber"
                      >
                        Visit resource
                      </a>
                    ) : null}
                  </article>
                )
              )}
            </div>
          ) : (
            <p className="mt-3 text-sm text-neutral-gray">No support options were returned.</p>
          )}
        </section>

        <section className="bb-panel border-memory-violet/40 bg-memory-violet/10">
          <h2 className="text-lg font-semibold">8. Affirming Message</h2>
          <div className="mt-3">
            {AffirmingMessage ? (
              <AffirmingMessage message={resolvedReflection.affirmingMessage} />
            ) : (
              <p className="text-sm leading-7 text-silver-white/95">
                {resolvedReflection.affirmingMessage ||
                  'You took an important step by documenting this session.'}
              </p>
            )}
          </div>
        </section>
      </section>
    </main>
  )
}
