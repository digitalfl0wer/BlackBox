import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
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
  const hasKinfolkProfile = Boolean(
    kinfolk?.yourName &&
      kinfolk?.yourState &&
      kinfolk?.kinfolkName &&
      kinfolk?.kinfolkContact &&
      kinfolk?.consent
  )

  const recorderErrorMessage =
    recorderError === 'Microphone permission denied or unavailable.'
      ? 'Microphone access is blocked. Enable microphone permission for this site in your browser settings, then return and try again.'
      : recorderError

  if (!hasKinfolkProfile) {
    return (
      <Navigate
        to="/setup"
        replace
        state={{
          notice:
            'Set up your Kinfolk profile before starting a Black Box Session so Signal can route correctly.',
        }}
      />
    )
  }

  return (
    <main className="bb-page relative">
      <section className="bb-shell bb-panel max-w-2xl">
        <button
          type="button"
          onClick={handleBack}
          className="bb-back mb-4"
        >
          Back
        </button>
        <p className="bb-label">BLACK BOX SESSION</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-silver-white">
            <span
              className={`h-2.5 w-2.5 rounded-full ${isRecording ? 'animate-pulse bg-safety-green shadow-[0_0_10px_rgb(92_255_178/0.8)]' : 'bg-alert-red'}`}
            />
            {isRecording ? 'Recording live' : 'Recording not active'}
          </div>
          <span className="font-display text-3xl font-semibold tabular-nums text-silver-white">
            {formatDuration(elapsedSeconds)}
          </span>
        </div>

        {recorderErrorMessage ? (
          <p className="mt-3 rounded-control border border-memory-violet/45 bg-memory-violet/10 p-3 text-sm text-silver-white">
            {recorderErrorMessage}
          </p>
        ) : null}

        {signalSentAt ? (
          <p className="mt-3 text-sm text-mist-gray">
            Signal sent to {kinfolk?.kinfolkName || 'your Kinfolk'} at{' '}
            {new Date(signalSentAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </p>
        ) : null}

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {!isRecording ? (
            <button
              type="button"
              onClick={handleStartSession}
              className="bb-btn-primary sm:col-span-3"
            >
              Start Black Box Session
            </button>
          ) : null}

          {SignalButton ? (
            <SignalButton
              onConfirm={handleSendSignal}
              kinfolk={kinfolk}
              disabled={!isRecording}
              className="bb-btn-primary disabled:cursor-not-allowed disabled:opacity-50"
            />
          ) : (
            <button
              type="button"
              onClick={handleSendSignal}
              disabled={!isRecording}
              className="bb-btn-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send Signal
            </button>
          )}

          <button
            type="button"
            onClick={enterDiscreet}
            disabled={!isRecording}
            className="bb-btn-ghost disabled:cursor-not-allowed disabled:opacity-50"
          >
            Discreet
          </button>

          <button
            type="button"
            onClick={handleEndSession}
            disabled={!isRecording}
            className="bb-btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            End Session
          </button>
        </div>
      </section>

      {showAwareness && RecordingAwarenessOverlay ? <RecordingAwarenessOverlay /> : null}

      {isDiscreet ? (
        <div className="absolute inset-0 z-40 bg-void-black/95 px-4 py-8 backdrop-blur-md">
          {DiscreetScreen ? (
            <DiscreetScreen />
          ) : (
            <section className="bb-panel mx-auto w-full max-w-lg text-silver-white">
              <h2 className="text-xl font-semibold">Daily Notes</h2>
              <p className="mt-2 text-sm text-mist-gray">
                Keep this screen neutral while your Black Box Session continues in the background.
              </p>
              <button
                type="button"
                onClick={exitDiscreet}
                className="bb-btn-primary mt-6 w-full"
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
