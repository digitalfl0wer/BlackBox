import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../context/SessionContext'

const COMPONENT_MODULES = import.meta.glob('../components/*.jsx', { eager: true })
const SCREEN_MODULES = import.meta.glob('./*.jsx', { eager: true })

function getOptionalComponent(name) {
  const entry = Object.entries(COMPONENT_MODULES).find(([path]) => path.endsWith(`/${name}.jsx`))
  return entry?.[1]?.default || null
}

function getOptionalScreen(name) {
  const entry = Object.entries(SCREEN_MODULES).find(([path]) => path.endsWith(`/${name}.jsx`))
  return entry?.[1]?.default || null
}

function formatDuration(totalSeconds) {
  const safeSeconds = Number.isFinite(totalSeconds) ? Math.max(0, totalSeconds) : 0
  const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, '0')
  const seconds = String(safeSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

function readKinfolk() {
  try {
    return JSON.parse(window.localStorage.getItem('blackbox_kinfolk') || 'null')
  } catch {
    return null
  }
}

export default function ActiveSession() {
  const navigate = useNavigate()
  const {
    isRecording,
    elapsedSeconds,
    recorderError,
    isDiscreet,
    enterDiscreet,
    exitDiscreet,
    sendSignal,
    startSession,
    endSession,
  } = useSession()

  const [showAwareness, setShowAwareness] = useState(false)
  const [signalSentAt, setSignalSentAt] = useState(null)

  const RecordingAwarenessOverlay = useMemo(
    () => getOptionalComponent('RecordingAwarenessOverlay'),
    []
  )
  const SignalButton = useMemo(() => getOptionalComponent('SignalButton'), [])
  const DiscreetScreen = useMemo(() => getOptionalScreen('Discreet'), [])

  useEffect(() => {
    if (!isRecording) {
      setShowAwareness(false)
      return undefined
    }

    const overlayTimer = window.setTimeout(() => setShowAwareness(true), 1000)

    return () => window.clearTimeout(overlayTimer)
  }, [isRecording])

  async function handleEndSession() {
    await endSession()
    navigate('/end')
  }

  function handleSendSignal() {
    const sentAt = sendSignal()
    setSignalSentAt(sentAt)
  }

  async function handleStartSession() {
    await startSession()
  }

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/home', { replace: true })
  }

  const kinfolk = useMemo(() => readKinfolk(), [])

  return (
    <main className="relative min-h-screen bg-void-black px-4 py-8 text-silver-white sm:px-6">
      <section className="mx-auto w-full max-w-2xl rounded-2xl border border-neutral-gray/30 bg-slate-black p-5 sm:p-7">
        <button
          type="button"
          onClick={handleBack}
          className="h-8 -translate-y-3 self-start rounded-md border border-neutral-gray/40 bg-void-black px-2 py-0.5 text-[10px] font-medium text-silver-white"
        >
          Back
        </button>
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-gray">Black Box Session</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-silver-white">
            <span
              className={`h-2.5 w-2.5 rounded-full ${isRecording ? 'animate-pulse bg-emerald-500' : 'bg-red-500'}`}
            />
            {isRecording ? 'Recording live' : 'Recording not active'}
          </div>
          <span className="text-3xl font-semibold tabular-nums text-silver-white">
            {formatDuration(elapsedSeconds)}
          </span>
        </div>

        {recorderError ? (
          <p className="mt-3 rounded-lg border border-memory-violet/40 bg-memory-violet/10 p-3 text-sm text-silver-white">
            {recorderError}
          </p>
        ) : null}

        {signalSentAt ? (
          <p className="mt-3 text-sm text-neutral-gray">
            Signal sent to {kinfolk?.kinfolkName || 'your Kinfolk'} at{' '}
            {new Date(signalSentAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </p>
        ) : null}

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {!isRecording ? (
            <button
              type="button"
              onClick={handleStartSession}
              className="min-h-12 rounded-lg bg-unity-amber px-4 py-3 text-sm font-semibold text-void-black sm:col-span-3"
            >
              Start Black Box Session
            </button>
          ) : null}

          {SignalButton ? (
            <SignalButton
              onConfirm={handleSendSignal}
              kinfolk={kinfolk}
              disabled={!isRecording}
              className="min-h-12 rounded-lg bg-unity-amber px-4 py-3 text-sm font-semibold text-void-black disabled:cursor-not-allowed disabled:opacity-50"
            />
          ) : (
            <button
              type="button"
              onClick={handleSendSignal}
              disabled={!isRecording}
              className="min-h-12 rounded-lg bg-unity-amber px-4 py-3 text-sm font-semibold text-void-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send Signal
            </button>
          )}

          <button
            type="button"
            onClick={enterDiscreet}
            disabled={!isRecording}
            className="min-h-12 rounded-lg border border-neutral-gray/40 bg-void-black px-4 py-3 text-sm font-medium text-silver-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Discreet
          </button>

          <button
            type="button"
            onClick={handleEndSession}
            disabled={!isRecording}
            className="min-h-12 rounded-lg border border-memory-violet/50 bg-memory-violet/10 px-4 py-3 text-sm font-medium text-silver-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            End Session
          </button>
        </div>
      </section>

      {showAwareness && RecordingAwarenessOverlay ? <RecordingAwarenessOverlay /> : null}

      {isDiscreet ? (
        <div className="absolute inset-0 z-40 bg-void-black/95 px-4 py-8">
          {DiscreetScreen ? (
            <DiscreetScreen />
          ) : (
            <section className="mx-auto w-full max-w-lg rounded-2xl border border-neutral-gray/30 bg-slate-black p-6 text-silver-white">
              <h2 className="text-xl font-semibold">Daily Notes</h2>
              <p className="mt-2 text-sm text-neutral-gray">
                Keep this screen neutral while your Black Box Session continues in the background.
              </p>
              <button
                type="button"
                onClick={exitDiscreet}
                className="mt-6 min-h-12 w-full rounded-lg bg-unity-amber px-4 py-3 text-sm font-semibold text-void-black"
              >
                Return to Session
              </button>
            </section>
          )}
        </div>
      ) : null}
    </main>
  )
}
