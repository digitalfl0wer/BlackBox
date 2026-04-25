import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import useRecorder from '../hooks/useRecorder'

const SESSION_STORAGE_KEY = 'blackbox_sessions'
const CURRENT_SESSION_STORAGE_KEY = 'blackbox_current_session'
const REFLECTION_STORAGE_KEY = 'blackbox_reflection'

const SessionContext = createContext(undefined)

function readStorageValue(key, fallbackValue) {
  if (typeof window === 'undefined') {
    return fallbackValue
  }

  try {
    const serialized = window.localStorage.getItem(key)
    return serialized ? JSON.parse(serialized) : fallbackValue
  } catch (storageError) {
    return fallbackValue
  }
}

function writeStorageValue(key, value) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (storageError) {
    // Local storage may be unavailable in private contexts.
  }
}

export function SessionProvider({ children }) {
  const recorder = useRecorder()

  const [isRecording, setIsRecording] = useState(false)
  const [isDiscreet, setIsDiscreet] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [startedAt, setStartedAt] = useState(null)
  const [signalSent, setSignalSent] = useState(false)
  const [signalSentAt, setSignalSentAt] = useState(null)
  const [currentSession, setCurrentSession] = useState(() =>
    readStorageValue(CURRENT_SESSION_STORAGE_KEY, null)
  )
  const [reflection, setReflectionState] = useState(() =>
    readStorageValue(REFLECTION_STORAGE_KEY, null)
  )

  const startSession = useCallback(async () => {
    const nextSessionId = `${Date.now()}`
    const nextStartedAt = new Date().toISOString()

    setSessionId(nextSessionId)
    setStartedAt(nextStartedAt)
    setIsRecording(true)
    setSignalSent(false)
    setSignalSentAt(null)
    setIsDiscreet(false)
    setReflectionState(null)

    const didStart = await recorder.startRecording()

    if (!didStart) {
      setIsRecording(false)
    }

    return {
      didStart,
      sessionId: nextSessionId,
      startedAt: nextStartedAt,
    }
  }, [recorder])

  const endSession = useCallback(async () => {
    const endedAt = new Date().toISOString()
    const audioBlob = await recorder.stopRecording()

    setIsRecording(false)
    setIsDiscreet(false)

    const durationSeconds = startedAt
      ? Math.max(0, Math.round((Date.parse(endedAt) - Date.parse(startedAt)) / 1000))
      : recorder.elapsedSeconds

    const audioUrl = audioBlob ? URL.createObjectURL(audioBlob) : null

    const sessionSnapshot = {
      sessionId,
      startedAt,
      endedAt,
      durationSeconds,
      signalSent,
      signalSentAt,
      audioUrl,
      audioMimeType: audioBlob?.type || null,
    }

    setCurrentSession(sessionSnapshot)
    writeStorageValue(CURRENT_SESSION_STORAGE_KEY, sessionSnapshot)

    return sessionSnapshot
  }, [
    recorder,
    sessionId,
    startedAt,
    signalSent,
    signalSentAt,
  ])

  const enterDiscreet = useCallback(() => {
    setIsDiscreet(true)
  }, [])

  const exitDiscreet = useCallback(() => {
    setIsDiscreet(false)
  }, [])

  const sendSignal = useCallback(() => {
    const sentAt = new Date().toISOString()
    setSignalSent(true)
    setSignalSentAt(sentAt)
    return sentAt
  }, [])

  const saveSession = useCallback((payload) => {
    const existingSessions = readStorageValue(SESSION_STORAGE_KEY, [])
    const nextSessions = Array.isArray(existingSessions)
      ? [payload, ...existingSessions]
      : [payload]

    writeStorageValue(SESSION_STORAGE_KEY, nextSessions)
    setCurrentSession(payload)
    writeStorageValue(CURRENT_SESSION_STORAGE_KEY, payload)

    return nextSessions
  }, [])

  const setReflection = useCallback((data) => {
    setReflectionState(data)
    writeStorageValue(REFLECTION_STORAGE_KEY, data)
    return data
  }, [])

  const resetSession = useCallback(() => {
    setIsRecording(false)
    setIsDiscreet(false)
    setSessionId(null)
    setStartedAt(null)
    setSignalSent(false)
    setSignalSentAt(null)
    setCurrentSession(null)
    writeStorageValue(CURRENT_SESSION_STORAGE_KEY, null)
  }, [])

  // Stable context contract for all screens.
  const value = useMemo(
    () => ({
      isRecording,
      isDiscreet,
      sessionId,
      startedAt,
      signalSent,
      signalSentAt,
      currentSession,
      reflection,
      recordingState: recorder.recordingState,
      elapsedSeconds: recorder.elapsedSeconds,
      recorderError: recorder.error,
      startSession,
      endSession,
      enterDiscreet,
      exitDiscreet,
      sendSignal,
      saveSession,
      setReflection,
      resetSession,
    }),
    [
      isRecording,
      isDiscreet,
      sessionId,
      startedAt,
      signalSent,
      signalSentAt,
      currentSession,
      reflection,
      recorder,
      startSession,
      endSession,
      enterDiscreet,
      exitDiscreet,
      sendSignal,
      saveSession,
      setReflection,
      resetSession,
    ]
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

/**
 * useSession exports the canonical session contract used by screens.
 */
export function useSession() {
  const context = useContext(SessionContext)

  if (!context) {
    throw new Error('useSession must be used within a SessionProvider')
  }

  return context
}

export default SessionContext
