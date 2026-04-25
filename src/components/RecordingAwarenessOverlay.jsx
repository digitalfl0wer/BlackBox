import { useEffect, useState } from 'react'

const DISMISS_DELAY_SECONDS = 5

export default function RecordingAwarenessOverlay() {
  const [dismissed, setDismissed] = useState(false)
  const [secondsRemaining, setSecondsRemaining] = useState(DISMISS_DELAY_SECONDS)

  useEffect(() => {
    if (secondsRemaining <= 0) {
      return undefined
    }

    const timer = window.setInterval(() => {
      setSecondsRemaining((previous) => Math.max(0, previous - 1))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [secondsRemaining])

  if (dismissed) {
    return null
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-end bg-void-black/50 p-4 sm:items-center sm:justify-center sm:p-6">
      <aside className="pointer-events-auto w-full max-w-xl rounded-card border border-neutral-gray/50 bg-surface-2 p-4 sm:p-5">
        <h2 className="text-base font-semibold text-silver-white">Recording Awareness</h2>
        <div className="mt-3 space-y-2 text-sm leading-6 text-silver-white/90">
          <p>This app is for personal safety documentation and education. It does not provide legal advice.</p>
          <p>
            Recording laws vary by state. If you plan to use this recording later, double-check your local laws
            or speak with a qualified legal advocate.
          </p>
          <p>AI can make mistakes. Review summaries, concern areas, and resources before relying on them.</p>
        </div>
        <button
          type="button"
          disabled={secondsRemaining > 0}
          onClick={() => setDismissed(true)}
          className="mt-4 min-h-touch w-full rounded-control bg-unity-amber px-4 py-3 text-sm font-semibold text-void-black disabled:cursor-not-allowed disabled:bg-unity-amber/55"
        >
          {secondsRemaining > 0 ? `I Understand (${secondsRemaining}s)` : 'I Understand'}
        </button>
      </aside>
    </div>
  )
}
