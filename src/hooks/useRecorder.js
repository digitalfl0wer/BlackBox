import { useCallback, useEffect, useRef, useState } from 'react'

function resolveSupportedMimeType() {
  if (typeof window === 'undefined' || typeof window.MediaRecorder === 'undefined') {
    return ''
  }

  if (window.MediaRecorder.isTypeSupported('audio/webm')) {
    return 'audio/webm'
  }

  if (window.MediaRecorder.isTypeSupported('audio/mp4')) {
    return 'audio/mp4'
  }

  return ''
}

export function useRecorder() {
  const [recordingState, setRecordingState] = useState('idle')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [error, setError] = useState(null)

  const streamRef = useRef(null)
  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  const mimeTypeRef = useRef('')
  const intervalRef = useRef(null)
  const pendingStopResolveRef = useRef(null)

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    stopTimer()
    intervalRef.current = setInterval(() => {
      setElapsedSeconds((previousValue) => previousValue + 1)
    }, 1000)
  }, [stopTimer])

  const requestMicrophone = useCallback(async () => {
    if (streamRef.current) {
      return streamRef.current
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      setError(null)
      return stream
    } catch (requestError) {
      setError('Microphone permission denied or unavailable.')
      return null
    }
  }, [])

  const initializeRecorder = useCallback(async () => {
    if (recorderRef.current) {
      return recorderRef.current
    }

    if (typeof window === 'undefined' || typeof window.MediaRecorder === 'undefined') {
      setError('MediaRecorder is not supported in this browser.')
      return null
    }

    const stream = await requestMicrophone()
    if (!stream) {
      return null
    }

    const mimeType = resolveSupportedMimeType()
    mimeTypeRef.current = mimeType

    const recorder = new window.MediaRecorder(stream, mimeType ? { mimeType } : {})

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunksRef.current.push(event.data)
      }
    }

    recorder.onstart = () => {
      setRecordingState('recording')
    }

    recorder.onstop = () => {
      stopTimer()
      setRecordingState('stopped')

      const chunkType = chunksRef.current[0]?.type
      const blobType = mimeTypeRef.current || chunkType || 'audio/webm'
      const blob = new Blob(chunksRef.current, { type: blobType })

      if (pendingStopResolveRef.current) {
        pendingStopResolveRef.current(blob)
        pendingStopResolveRef.current = null
      }
    }

    recorder.onerror = () => {
      stopTimer()
      setRecordingState('idle')
      setError('Recording failed. Please try again.')

      if (pendingStopResolveRef.current) {
        pendingStopResolveRef.current(null)
        pendingStopResolveRef.current = null
      }
    }

    recorderRef.current = recorder
    return recorder
  }, [requestMicrophone, stopTimer])

  const startRecording = useCallback(async () => {
    const recorder = await initializeRecorder()
    if (!recorder) {
      return false
    }

    if (recorder.state === 'recording') {
      return true
    }

    setError(null)
    setElapsedSeconds(0)
    chunksRef.current = []

    try {
      recorder.start()
      startTimer()
      return true
    } catch (startError) {
      setRecordingState('idle')
      stopTimer()
      setError('Unable to start recording.')
      return false
    }
  }, [initializeRecorder, startTimer, stopTimer])

  const stopRecording = useCallback(async () => {
    const recorder = recorderRef.current

    if (!recorder) {
      return null
    }

    if (recorder.state !== 'recording') {
      stopTimer()
      setRecordingState('stopped')

      if (chunksRef.current.length === 0) {
        return null
      }

      const chunkType = chunksRef.current[0]?.type
      const blobType = mimeTypeRef.current || chunkType || 'audio/webm'
      return new Blob(chunksRef.current, { type: blobType })
    }

    stopTimer()

    return await new Promise((resolve) => {
      pendingStopResolveRef.current = resolve

      try {
        recorder.stop()
      } catch (stopError) {
        pendingStopResolveRef.current = null
        setRecordingState('idle')
        setError('Unable to stop recording cleanly.')
        resolve(null)
      }
    })
  }, [stopTimer])

  useEffect(() => {
    return () => {
      stopTimer()

      if (recorderRef.current && recorderRef.current.state === 'recording') {
        try {
          recorderRef.current.stop()
        } catch (stopError) {
          // No-op during unmount cleanup.
        }
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stopTimer])

  return {
    recordingState,
    elapsedSeconds,
    error,
    startRecording,
    stopRecording,
  }
}

export default useRecorder
