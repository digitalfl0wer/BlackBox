import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PrivateTimeline from './PrivateTimeline'

function readSessions() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem('blackbox_sessions') || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function formatDuration(totalSeconds) {
  const safe = Number.isFinite(totalSeconds) ? Math.max(0, totalSeconds) : 0
  const minutes = String(Math.floor(safe / 60)).padStart(2, '0')
  const seconds = String(safe % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

function normalizeSession(session) {
  return {
    ...session,
    tags: session.tags || session.scenarioTags || [],
    duration: session.duration || formatDuration(session.durationSeconds),
  }
}

export default function TimelineRoute() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    setSessions(readSessions().map(normalizeSession))
  }, [])

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/home', { replace: true })
  }

  function openSession(session) {
    window.localStorage.setItem('blackbox_current_session', JSON.stringify(session))
    if (session.reflection) {
      window.localStorage.setItem('blackbox_reflection', JSON.stringify(session.reflection))
    }
    navigate('/reflection')
  }

  return <PrivateTimeline sessions={sessions} onBack={handleBack} onOpenSession={openSession} />
}
