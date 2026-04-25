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
        <div className="fixed inset-0 z-50 flex items-end bg-void-black/80 p-4 sm:items-center sm:justify-center sm:p-6">
          <section className="w-full max-w-xl rounded-card border border-neutral-gray/45 bg-surface-2 p-5 text-silver-white sm:p-6">
            <h2 className="text-lg font-semibold">Signal Preview</h2>
            <p className="mt-1 text-sm text-soft-sage">
              This preview uses your current session details and Kinfolk settings.
            </p>
            <div className="mt-4 rounded-control border border-neutral-gray/35 bg-slate-black p-4 text-sm leading-6 text-silver-white/95">
              {message}
            </div>
            <p className="mt-4 text-sm text-soft-sage">
              Sending to: {kinfolk?.kinfolkName || 'Kinfolk'} ({kinfolk?.kinfolkContact || 'No contact on file'})
            </p>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleConfirm}
                className="min-h-touch rounded-control bg-unity-amber px-4 py-3 text-sm font-semibold text-void-black"
              >
                Confirm Signal
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="min-h-touch rounded-control border border-neutral-gray/45 bg-slate-black px-4 py-3 text-sm font-medium text-silver-white"
              >
                Cancel
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {showToast ? (
        <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 mx-auto max-w-sm rounded-control border border-neutral-gray/40 bg-surface-3 px-4 py-3 text-sm text-silver-white sm:inset-x-0">
          Signal confirmed and marked in this session.
        </div>
      ) : null}
    </>
  )
}
