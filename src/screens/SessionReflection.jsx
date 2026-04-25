import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useSession } from '../context/SessionContext'

export function SessionReflection({ reflection, session, onBack }) {
  const [expandedSection, setExpandedSection] = useState(null)

  if (!reflection) return null

  const sections = [
    { key: 'timeline', label: 'Timeline', eyebrow: 'WHAT HAPPENED', content: reflection.timeline },
    {
      key: 'flagged',
      label: 'Why These Were Flagged',
      eyebrow: 'CONCERN DETAIL',
      content: reflection.flaggedReasons,
    },
    {
      key: 'notMean',
      label: 'What This Does Not Mean',
      eyebrow: 'IMPORTANT',
      content: reflection.doesNotMean,
    },
    {
      key: 'nextSteps',
      label: 'Suggested Next Steps',
      eyebrow: 'MOVING FORWARD',
      content: reflection.nextSteps,
    },
  ].filter((section) => section.content)

  return (
    <main className="bbx-page">
      <div className="pointer-events-none fixed right-[-8%] top-[10%] h-[240px] w-[240px] bg-[radial-gradient(circle,rgba(123,79,255,0.09)_0%,transparent_70%)]" />

      <section className="bbx-shell max-w-4xl">
        <div className="bbx-card p-4 sm:p-6 lg:p-8">
          <header className="flex items-center justify-between gap-3">
            <button type="button" className="bbx-back" onClick={onBack}>← Back</button>
            <p className="text-[10px] font-medium tracking-[0.2em] text-[#555570]">AI REFLECTION</p>
          </header>

          <h1 className="bbx-font-display mt-5 text-3xl font-extrabold sm:text-4xl">Session Reflection</h1>

          {reflection.affirmation ? (
            <div className="mt-5 rounded-2xl border border-[#C8933A]/30 px-5 py-4" style={{ background: 'rgba(200,147,58,0.07)' }}>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-[#C8933A]">FOR YOU</p>
              <p className="mt-2 text-[15px] leading-7 text-[#F5F0EB]">{reflection.affirmation}</p>
            </div>
          ) : null}

          {session?.audioUrl ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-[#0f0f1a] p-4">
              <span className="text-[9px] font-semibold tracking-[0.2em] text-[#555570]">SESSION AUDIO</span>
              <audio controls src={session.audioUrl} className="mt-2 w-full [accent-color:#F5A623]" />
            </div>
          ) : null}

          {reflection.summary ? (
            <div className="mt-4 flex overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f1a]">
              <div className="w-[3px] shrink-0 bg-[linear-gradient(to_bottom,#F5A623,#7B4FFF)]" />
              <div className="p-4">
                <p className="text-[10px] font-semibold tracking-[0.2em] text-[#F5A623]">What I heard</p>
                <p className="mt-2 text-[15px] leading-7 text-white">{reflection.summary}</p>
              </div>
            </div>
          ) : null}

          {reflection.concerns?.length > 0 ? (
            <div className="mt-5">
              <p className="text-[11px] tracking-[0.05em] text-[#9090A8]">Possible concern areas</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {reflection.concerns.map((concern) => (
                  <span
                    key={concern}
                    className="rounded-full border border-[#FF4757]/25 bg-[#FF4757]/10 px-3 py-1 text-xs font-medium text-[#FF4757]"
                  >
                    {concern}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-5 space-y-2.5">
            {sections.map((section) => (
              <ReflectionSection
                key={section.key}
                section={section}
                expanded={expandedSection === section.key}
                onToggle={() => setExpandedSection(expandedSection === section.key ? null : section.key)}
              />
            ))}
          </div>

          {reflection.resources?.length > 0 ? (
            <div className="mt-6">
              <p className="text-[10px] font-semibold tracking-[0.2em] text-[#9090A8]">SUPPORT OPTIONS</p>
              <div className="mt-3 space-y-3">
                {reflection.resources.map((resource, index) => {
                  const name = typeof resource === 'string' ? resource : resource.name
                  const description = typeof resource === 'string' ? '' : resource.description
                  const url = typeof resource === 'string' ? null : resource.url
                  const category = typeof resource === 'string' ? '' : resource.category
                  return (
                    <div
                      key={index}
                      className="rounded-2xl border border-[#7B4FFF]/20 bg-[#0f0f1a] p-4"
                      style={{ background: 'linear-gradient(135deg, rgba(123,79,255,0.06) 0%, rgba(15,15,26,1) 60%)' }}
                    >
                      {category ? (
                        <span className="inline-block rounded-full border border-[#7B4FFF]/30 bg-[#7B4FFF]/10 px-2 py-0.5 text-[10px] font-medium text-[#a78bfa]">
                          {category}
                        </span>
                      ) : null}
                      <p className="mt-2 text-sm font-semibold text-white">{name}</p>
                      {description ? (
                        <p className="mt-1 text-[13px] leading-6 text-[#9090A8]">{description}</p>
                      ) : null}
                      {url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-[#7B4FFF]/40 bg-[#7B4FFF]/15 px-3 py-1.5 text-xs font-semibold text-[#c4b5fd] transition hover:bg-[#7B4FFF]/25"
                        >
                          Visit Resource →
                        </a>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : null}

          <div className="bbx-disclaimer mt-6 px-4 py-3 text-xs leading-6">
            AI can make mistakes. Review all summaries, concern areas, and resources before relying on
            them. Possible concern areas are not legal conclusions.
          </div>
        </div>
      </section>
    </main>
  )
}

function ReflectionSection({ section, expanded, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full rounded-2xl border p-4 text-left transition ${
        expanded
          ? 'border-[#7B4FFF]/25 bg-[#141422]'
          : 'border-white/10 bg-[#0f0f1a]'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[9px] tracking-[0.2em] text-[#555570]">{section.eyebrow}</p>
          <p className="mt-1 text-sm font-semibold text-white">{section.label}</p>
        </div>
        <span
          className="text-base text-[#555570] transition-transform"
          style={{ transform: expanded ? 'rotate(90deg)' : 'none' }}
        >
          →
        </span>
      </div>
      {expanded ? (
        <div className="mt-3 border-t border-white/10 pt-3">
          {Array.isArray(section.content)
            ? section.content.map((item, index) => (
                <p key={index} className="mb-1.5 text-[13px] leading-7 text-[#9090A8] last:mb-0">
                  · {item}
                </p>
              ))
            : <p className="text-[13px] leading-7 text-[#9090A8]">{section.content}</p>}
        </div>
      ) : null}
    </button>
  )
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

function normalizeArray(arr, formatter) {
  if (!Array.isArray(arr)) return arr
  return arr.map((item) => (typeof item === 'string' ? item : formatter(item)))
}

function mapReflectionShape(data) {
  if (!data) return null

  return {
    summary: data.summary,
    concerns: data.concerns || data.concernAreas || [],
    timeline: normalizeArray(
      data.timeline,
      (item) => `${item.time || 'Moment'}: ${item.event || ''}`
    ),
    flaggedReasons: normalizeArray(
      data.flaggedReasons || data.whyFlagged,
      (item) => `${item.area || item.phrase || ''}: ${item.reason || ''}`
    ),
    doesNotMean: data.doesNotMean || data.whatThisDoesNotMean,
    nextSteps: data.nextSteps,
    resources: Array.isArray(data.resources || data.supportOptions)
      ? (data.resources || data.supportOptions)
      : [],
    affirmation: data.affirmation || data.affirmingMessage,
  }
}

export default function SessionReflectionRoute() {
  const navigate = useNavigate()
  const { reflection, currentSession } = useSession()
  const [resolvedReflection, setResolvedReflection] = useState(mapReflectionShape(reflection))
  const [resolvedSession, setResolvedSession] = useState(currentSession)

  useEffect(() => {
    setResolvedReflection(mapReflectionShape(reflection) || mapReflectionShape(readStoredReflection()))
  }, [reflection])

  useEffect(() => {
    setResolvedSession(currentSession || readStoredSession())
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

  return (
    <SessionReflection
      reflection={resolvedReflection}
      session={resolvedSession}
      onBack={handleBack}
    />
  )
}
