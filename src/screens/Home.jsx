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
    <main className="min-h-screen bg-void-black px-4 py-8 text-silver-white sm:px-6">
      <section className="mx-auto w-full max-w-2xl rounded-2xl border border-neutral-gray/30 bg-slate-black p-5 sm:p-7">
        <button
          type="button"
          onClick={handleBack}
          className="h-8 -translate-y-3 self-start rounded-md border border-neutral-gray/40 bg-void-black px-2 py-0.5 text-[10px] font-medium text-silver-white"
        >
          Back
        </button>
        <h1 className="text-3xl font-semibold">Home</h1>
        <p className="mt-2 text-sm text-neutral-gray sm:text-base">
          Your Kinfolk: <span className="text-silver-white">{kinfolk?.kinfolkName || 'Not set yet'}</span>
        </p>

        {isRecording ? (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-memory-violet/40 bg-memory-violet/10 p-3">
            <div className="flex items-center gap-2 text-sm text-silver-white">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-unity-amber" />
              Recording in progress
            </div>
            <button
              type="button"
              onClick={() => navigate('/session')}
              className="min-h-12 rounded-lg bg-unity-amber px-4 text-sm font-semibold text-void-black"
            >
              Return to Session
            </button>
          </div>
        ) : null}

        <div className="mt-6 grid grid-cols-1 gap-3">
          <button
            type="button"
            onClick={() => navigate('/session')}
            className="min-h-12 rounded-lg bg-unity-amber px-4 py-3 text-left text-sm font-semibold text-void-black"
          >
            Start Black Box Session
          </button>

          <button
            type="button"
            onClick={() => navigate('/timeline')}
            className="min-h-12 rounded-lg border border-neutral-gray/40 bg-void-black px-4 py-3 text-left text-sm font-medium text-silver-white"
          >
            Private Timeline
          </button>

          <button
            type="button"
            onClick={() => navigate('/setup')}
            className="min-h-12 rounded-lg border border-neutral-gray/40 bg-void-black px-4 py-3 text-left text-sm font-medium text-silver-white"
          >
            Kinfolk
          </button>

          <button
            type="button"
            onClick={() => {
              const hasReflection = Boolean(window.localStorage.getItem('blackbox_reflection'))
              navigate(hasReflection ? '/reflection' : '/timeline')
            }}
            className="min-h-12 rounded-lg border border-memory-violet/50 bg-memory-violet/10 px-4 py-3 text-left text-sm font-medium text-silver-white"
          >
            Support Options
          </button>
        </div>
      </section>
    </main>
  )
}
