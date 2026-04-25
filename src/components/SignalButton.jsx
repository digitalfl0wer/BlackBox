import { useEffect, useMemo, useState } from 'react'
import { useSession } from '../context/SessionContext'

function readKinfolk() {
  try {
    return JSON.parse(window.localStorage.getItem('blackbox_kinfolk') || 'null')
  } catch {
    return null
  }
}

function formatSignalMessage({
  displayName,
  startedAt,
  locationLabel,
}) {
  const resolvedName = displayName || 'Someone'
  const resolvedTime = startedAt
    ? new Date(startedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  const resolvedLocation = locationLabel || 'not shared'

  return `${resolvedName} may need you. They started a Black Box Session at ${resolvedTime}. Please check on them. Last known location: ${resolvedLocation}.`
}

function joinClasses(...classNames) {
  return classNames.filter(Boolean).join(' ')
}

export default function SignalButton({
  onConfirm,
  kinfolk: kinfolkProp,
  disabled = false,
  className = '',
}) {
  const { startedAt, currentSession, sendSignal, signalSent } = useSession()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const kinfolk = useMemo(() => kinfolkProp || readKinfolk(), [kinfolkProp])
  const startedAtValue = startedAt || currentSession?.startedAt || null
  const message = formatSignalMessage({
    displayName: kinfolk?.yourName,
    startedAt: startedAtValue,
    locationLabel: currentSession?.location?.label || 'not shared',
  })

  useEffect(() => {
    if (!showToast) {
      return undefined
    }

    const timer = window.setTimeout(() => setShowToast(false), 2400)
    return () => window.clearTimeout(timer)
  }, [showToast])

  function handleConfirm() {
    if (typeof onConfirm === 'function') {
      onConfirm()
    } else {
      sendSignal()
    }

    setIsModalOpen(false)
    setShowToast(true)
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled || signalSent}
        onClick={() => setIsModalOpen(true)}
        className={joinClasses(
          'min-h-touch rounded-control px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60',
          className
        )}
      >
        {signalSent ? 'Signal Sent' : 'Send Signal'}
      </button>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-end bg-void-black/82 p-4 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6">
          <section className="w-full max-w-xl rounded-card border border-divider-gray bg-slate-black/90 p-5 text-silver-white shadow-panel-glow sm:p-6">
            <p className="bb-label">SIGNAL PREVIEW</p>
            <h2 className="text-lg font-semibold">Signal Preview</h2>
            <p className="mt-1 text-sm text-mist-gray">
              This preview uses your current session details and Kinfolk settings.
            </p>
            <div className="mt-4 rounded-control border border-memory-violet/40 bg-void-black/60 p-4 text-sm leading-6 text-silver-white/95 shadow-violet-glow">
              {message}
            </div>
            <p className="mt-4 text-sm text-mist-gray">
              Sending to: {kinfolk?.kinfolkName || 'Kinfolk'} ({kinfolk?.kinfolkContact || 'No contact on file'})
            </p>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleConfirm}
                className="bb-btn-primary"
              >
                Confirm Signal
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="bb-btn-secondary"
              >
                Cancel
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {showToast ? (
        <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 mx-auto max-w-sm rounded-control border border-safety-green/45 bg-panel-black/90 px-4 py-3 text-sm text-silver-white shadow-[0_0_0_1px_rgb(92_255_178/0.35),0_10px_26px_rgb(92_255_178/0.2)] sm:inset-x-0">
          Signal confirmed and marked in this session.
        </div>
      ) : null}
    </>
  )
}
