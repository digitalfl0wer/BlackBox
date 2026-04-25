import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../context/SessionContext'

function readKinfolk() {
  try {
    return JSON.parse(window.localStorage.getItem('blackbox_kinfolk') || 'null')
  } catch {
    return null
  }
}

export default function Home() {
  const navigate = useNavigate()
  const { isRecording } = useSession()

  const kinfolk = useMemo(() => readKinfolk(), [])

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/', { replace: true })
  }

  return (
    <main className="bb-page">
      <section className="bb-shell max-w-2xl bb-panel">
        <button
          type="button"
          onClick={handleBack}
          className="bb-back mb-4"
        >
          Back
        </button>
        <p className="bb-label">BLACK BOX WORKSPACE</p>
        <h1 className="bb-title mt-2 text-3xl">Home</h1>
        <p className="mt-2 text-sm text-mist-gray sm:text-base">
          Your Kinfolk: <span className="text-silver-white">{kinfolk?.kinfolkName || 'Not set yet'}</span>
        </p>

        {isRecording ? (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-control border border-memory-violet/45 bg-memory-violet/10 p-3 shadow-violet-glow">
            <div className="flex items-center gap-2 text-sm text-silver-white">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-safety-green shadow-[0_0_10px_rgb(92_255_178/0.75)]" />
              Recording in progress
            </div>
            <button
              type="button"
              onClick={() => navigate('/session')}
              className="bb-btn-primary"
            >
              Return to Session
            </button>
          </div>
        ) : null}

        <div className="mt-6 grid grid-cols-1 gap-3">
          <button
            type="button"
            onClick={() => navigate('/session')}
            className="bb-btn-primary justify-start"
          >
            Start Black Box Session
          </button>

          <button
            type="button"
            onClick={() => navigate('/timeline')}
            className="bb-btn-ghost justify-start"
          >
            Private Timeline
          </button>

          <button
            type="button"
            onClick={() => navigate('/setup')}
            className="bb-btn-ghost justify-start"
          >
            Kinfolk
          </button>

          <button
            type="button"
            onClick={() => {
              const hasReflection = Boolean(window.localStorage.getItem('blackbox_reflection'))
              navigate(hasReflection ? '/reflection' : '/timeline')
            }}
            className="bb-btn-secondary justify-start"
          >
            Support Options
          </button>
        </div>
      </section>
    </main>
  )
}
