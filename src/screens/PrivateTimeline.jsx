import { useMemo, useState } from 'react'

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

function formatDateTime(value) {
  const date = value ? new Date(value) : new Date()
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${dateStr} · ${timeStr}`
}

export default function PrivateTimeline({ sessions = [], onBack, onOpenSession }) {
  const [activeFilter, setActiveFilter] = useState(null)

  const filters = useMemo(
    () => ['All', ...new Set(sessions.flatMap((session) => session.tags || []))],
    [sessions]
  )

  const filtered = activeFilter
    ? sessions.filter((session) => session.tags?.includes(activeFilter))
    : sessions

  return (
    <main className="bbx-page">
      <div className="pointer-events-none fixed right-[-8%] top-[12%] h-[240px] w-[240px] bg-[radial-gradient(circle,rgba(123,79,255,0.08)_0%,transparent_70%)]" />

      <section className="bbx-shell max-w-4xl">
        <div className="bbx-card p-4 sm:p-6 lg:p-8">
          <header className="flex items-center justify-between gap-3">
            <button type="button" className="bbx-back" onClick={onBack}>← Back</button>
            <p className="text-[10px] font-medium tracking-[0.2em] text-[#555570]">PRIVATE TIMELINE</p>
          </header>

          <h1 className="bbx-font-display mt-5 text-3xl font-extrabold sm:text-4xl">Your Record</h1>
          <p className="mt-2 text-sm leading-7 text-[#9090A8]">
            {sessions.length > 0
              ? `${sessions.length} session${sessions.length > 1 ? 's' : ''} preserved. This record is yours alone.`
              : 'Your preserved truth will appear here.'}
          </p>

          {sessions.length > 0 ? (
            <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
              {filters.map((tag) => {
                const isActive = (tag === 'All' && activeFilter === null) || activeFilter === tag
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setActiveFilter(tag === 'All' || activeFilter === tag ? null : tag)}
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      isActive
                        ? 'border-[#7B4FFF]/45 bg-[#7B4FFF]/20 text-[#bca9ff]'
                        : 'border-white/10 bg-[#0f0f1a] text-[#9090A8]'
                    }`}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
          ) : null}

          {filtered.length > 0 ? (
            <div className="mt-4 space-y-3">
              {filtered.map((session, index) => (
                <button
                  key={session.id || index}
                  type="button"
                  onClick={() => onOpenSession?.(session)}
                  className="group w-full rounded-2xl border border-white/10 border-l-2 border-l-white/10 bg-[#0f0f1a] p-4 text-left transition hover:translate-x-[2px] hover:border-l-[#7B4FFF]/55 hover:bg-[#141422]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold text-white">{session.title || 'Untitled Session'}</p>
                      <p className="mt-1 text-xs text-[#555570]">{formatDateTime(session.startedAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#555570]">
                      {session.duration ? <span className="bbx-font-mono">{session.duration}</span> : null}
                      <span>→</span>
                    </div>
                  </div>

                  {session.tags?.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {session.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-[#7B4FFF]/30 bg-[#7B4FFF]/10 px-2.5 py-0.5 text-[11px] text-[#9f86ff]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className={`text-[11px] font-medium ${session.signalSent ? 'text-[#2ED573]' : 'text-[#555570]'}`}>
                      {session.signalSent ? '◉ Signal sent' : '◎ No signal sent'}
                    </span>
                    {session.reflection ? (
                      <span className="rounded-full bg-[#F5A623]/10 px-2 py-0.5 text-[11px] font-medium text-[#F5A623]">
                        AI Reflection ready
                      </span>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          ) : sessions.length > 0 ? (
            <div className="py-14 text-center">
              <p className="text-sm text-[#9090A8]">No sessions match &quot;{activeFilter}&quot;</p>
              <button type="button" className="mt-3 text-sm text-[#7B4FFF]" onClick={() => setActiveFilter(null)}>
                Clear filter
              </button>
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-5xl text-[#7B4FFF]/20">◎</p>
              <p className="bbx-font-display mt-4 text-2xl font-bold text-white">No sessions yet</p>
              <p className="mx-auto mt-2 max-w-[28rem] text-sm leading-7 text-[#9090A8]">
                When you complete a Black Boxx session, your record will be preserved here - private,
                organized, and ready when you need it.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export { SCENARIO_TAGS }
