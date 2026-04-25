import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Discreet from './Discreet'
import SignalButton from '../components/SignalButton'
import { useSession } from '../context/SessionContext'

function readKinfolk() {
  try {
    return JSON.parse(window.localStorage.getItem('blackbox_kinfolk') || 'null')
  } catch {
    return null
  }
}

function ActionBtn({ label, sub, color, onClick, flash, icon, disabled }) {
  const [pressed, setPressed] = useState(false)

  const active = (flash || pressed) && !disabled
  const bgColor = active
    ? `rgba(${color === '#F5A623' ? '245,166,35' : color === '#7B4FFF' ? '123,79,255' : '144,144,168'},0.15)`
    : '#0f0f1a'

  return (
    <button
      type="button"
      style={{
        ...styles.actionBtn,
        background: bgColor,
        borderColor: active ? color : 'rgba(255,255,255,0.07)',
        transform: pressed && !disabled ? 'scale(0.96)' : 'none',
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      onClick={disabled ? undefined : onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      disabled={disabled}
    >
      <span style={{ ...styles.actionIcon, color }}>{icon}</span>
      <span style={styles.actionLabel}>{label}</span>
      <span style={styles.actionSub}>{sub}</span>
    </button>
  )
}

export function ActiveSessionScreen({
  onBack,
  onSendSignal,
  onDiscreet,
  onEndSession,
  kinfolkName,
  signalSent,
  isRecording,
  onStartRecording,
  recorderError,
}) {
  const [elapsed, setElapsed] = useState(0)
  const [signalFlash, setSignalFlash] = useState(false)

  useEffect(() => {
    if (!isRecording) {
      return undefined
    }

    const interval = window.setInterval(() => setElapsed((current) => current + 1), 1000)
    return () => window.clearInterval(interval)
  }, [isRecording])

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0')
    const secs = (seconds % 60).toString().padStart(2, '0')
    return `${minutes}:${secs}`
  }

  const handleStartRecording = () => {
    setElapsed(0)
    onStartRecording?.()
  }

  const handleSignal = () => {
    if (!isRecording) return
    setSignalFlash(true)
    window.setTimeout(() => setSignalFlash(false), 1500)
    onSendSignal?.()
  }

  return (
    <div className="active-session-root" style={styles.root}>
      <div style={styles.glowAmber} />
      <div style={styles.glowPurple} />

      <header style={styles.header}>
        <button type="button" style={styles.back} onClick={onBack}>← Back</button>
        <div style={styles.eyebrow}>BLACK BOXX SESSION</div>
      </header>

      <div style={styles.timerHero}>
        <div style={styles.timerRing}>
          <div style={styles.timerRingInner} />
          <span style={styles.timerValue}>{formatTime(elapsed)}</span>
          <span style={styles.timerLabel}>elapsed</span>
        </div>

        <div style={isRecording ? styles.statusActive : styles.statusIdle}>
          <div style={isRecording ? styles.statusDotActive : styles.statusDotIdle} />
          <span>{isRecording ? 'Recording' : 'Ready when you are'}</span>
        </div>
      </div>

      {!isRecording ? (
        <button type="button" style={styles.btnRecord} onClick={handleStartRecording}>
          Start Recording
        </button>
      ) : null}

      {signalSent ? (
        <div style={styles.signalConfirm}>
          <span style={styles.signalConfirmIcon}>✓</span>
          <span>Signal sent to {kinfolkName || 'your Kinfolk'}</span>
        </div>
      ) : null}

      <div style={styles.actionRow}>
        <ActionBtn
          label="Send Signal"
          sub={kinfolkName ? `Alert ${kinfolkName}` : 'Alert Kinfolk'}
          color="#F5A623"
          flash={signalFlash}
          onClick={handleSignal}
          icon="◉"
          disabled={!isRecording}
        />
        <ActionBtn
          label="Discreet"
          sub="Hide this screen"
          color="#9090A8"
          onClick={onDiscreet}
          icon="◈"
          disabled={!isRecording}
        />
        <ActionBtn
          label="End Session"
          sub="Save & reflect"
          color="#7B4FFF"
          onClick={onEndSession}
          icon="◎"
          disabled={!isRecording}
        />
      </div>

      {recorderError ? (
        <div style={{ ...styles.awareness, borderLeft: '2px solid rgba(255,71,87,0.4)', background: 'rgba(255,71,87,0.05)' }}>
          <p style={{ ...styles.awarenessTitle, color: '#FF4757' }}>MICROPHONE NOTICE</p>
          <p style={styles.awarenessText}>{recorderError}</p>
        </div>
      ) : (
        <div style={styles.awareness}>
          <p style={styles.awarenessTitle}>RECORDING NOTICE</p>
          <p style={styles.awarenessText}>
            Recording laws vary by state. This app is for personal safety documentation and education.
            It does not provide legal advice.
          </p>
        </div>
      )}

      <p style={styles.affirmation}>You are not alone. Your truth is being preserved.</p>
    </div>
  )
}

export default function ActiveSessionRoute() {
  const navigate = useNavigate()
  const {
    isRecording,
    signalSent,
    recorderError,
    isDiscreet,
    enterDiscreet,
    exitDiscreet,
    startSession,
    endSession,
  } = useSession()

  const [showSignalModal, setShowSignalModal] = useState(false)
  const kinfolk = useMemo(() => readKinfolk(), [])

  async function handleStartRecording() {
    await startSession()
  }

  async function handleEndSession() {
    if (!isRecording) return
    await endSession()
    navigate('/end')
  }

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }
    navigate('/home', { replace: true })
  }

  function handleDiscreet() {
    if (!isRecording) return
    enterDiscreet()
  }

  function handleSendSignal() {
    if (!isRecording) return
    setShowSignalModal(true)
  }

  return (
    <>
      <ActiveSessionScreen
        onBack={handleBack}
        onSendSignal={handleSendSignal}
        onDiscreet={handleDiscreet}
        onEndSession={handleEndSession}
        kinfolkName={kinfolk?.kinfolkName}
        signalSent={signalSent}
        isRecording={isRecording}
        onStartRecording={handleStartRecording}
        recorderError={recorderError}
      />
      <SignalButton
        externalOpen={showSignalModal}
        onExternalClose={() => setShowSignalModal(false)}
      />
      {isDiscreet ? <Discreet onExit={exitDiscreet} /> : null}
    </>
  )
}

const styles = {
  root: {
    minHeight: '100dvh',
    width: '100%',
    background: '#080810',
    color: '#fff',
    fontFamily: "'DM Sans', sans-serif",
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  },
  glowAmber: {
    position: 'fixed',
    bottom: '20%',
    left: '-5%',
    width: '260px',
    height: '260px',
    background: 'radial-gradient(circle, rgba(245,166,35,0.07) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  glowPurple: {
    position: 'fixed',
    top: '10%',
    right: '-5%',
    width: '240px',
    height: '240px',
    background: 'radial-gradient(circle, rgba(123,79,255,0.07) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '24px',
    paddingBottom: '8px',
  },
  back: {
    padding: '10px 14px',
    background: '#0f0f1a',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '10px',
    color: '#9090A8',
    fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer',
  },
  eyebrow: {
    fontSize: '10px',
    letterSpacing: '0.2em',
    color: '#555570',
    fontWeight: 500,
  },
  timerHero: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '48px 0 40px',
    gap: '24px',
  },
  timerRing: {
    width: '180px',
    height: '180px',
    borderRadius: '50%',
    border: '1px solid rgba(245,166,35,0.2)',
    boxShadow: '0 0 0 8px rgba(245,166,35,0.04), 0 0 0 16px rgba(245,166,35,0.02)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    background: '#0f0f1a',
  },
  timerRingInner: {
    position: 'absolute',
    inset: '12px',
    borderRadius: '50%',
    border: '1px solid rgba(123,79,255,0.12)',
  },
  timerValue: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '40px',
    fontWeight: 500,
    color: '#fff',
    letterSpacing: '0.05em',
    lineHeight: 1,
  },
  timerLabel: {
    fontSize: '11px',
    color: '#555570',
    marginTop: '4px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
  },
  statusActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#FF4757',
    fontWeight: 500,
  },
  statusIdle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#9090A8',
  },
  statusDotActive: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#FF4757',
    boxShadow: '0 0 8px rgba(255,71,87,0.8)',
    animation: 'pulse 1.2s ease-in-out infinite',
  },
  statusDotIdle: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#555570',
  },
  btnRecord: {
    width: '100%',
    padding: '18px',
    background: '#F5A623',
    color: '#000',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 700,
    fontSize: '16px',
    border: 'none',
    borderRadius: '14px',
    cursor: 'pointer',
    boxShadow: '0 6px 24px rgba(245,166,35,0.2)',
    marginBottom: '16px',
  },
  signalConfirm: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    background: 'rgba(46,213,115,0.08)',
    border: '1px solid rgba(46,213,115,0.2)',
    borderRadius: '10px',
    color: '#2ED573',
    fontSize: '14px',
    marginBottom: '16px',
  },
  signalConfirmIcon: { fontWeight: 700 },
  actionRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
    marginBottom: '32px',
  },
  actionBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '16px 8px',
    background: '#0f0f1a',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '14px',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.15s ease',
  },
  actionIcon: {
    fontSize: '20px',
    marginBottom: '4px',
  },
  actionLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#fff',
  },
  actionSub: {
    fontSize: '10px',
    color: '#555570',
    textAlign: 'center',
  },
  awareness: {
    padding: '16px',
    background: 'rgba(245,166,35,0.04)',
    borderLeft: '2px solid rgba(245,166,35,0.3)',
    borderRadius: '0 10px 10px 0',
    marginBottom: '32px',
  },
  awarenessTitle: {
    fontSize: '9px',
    letterSpacing: '0.2em',
    color: '#F5A623',
    fontWeight: 600,
    marginBottom: '6px',
  },
  awarenessText: {
    fontSize: '12px',
    color: '#9090A8',
    lineHeight: 1.6,
  },
  affirmation: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#333348',
    fontStyle: 'italic',
    marginTop: 'auto',
    paddingTop: '20px',
  },
}
