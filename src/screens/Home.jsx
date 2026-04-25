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
    <main className="bbx-page">
      <section className="bbx-shell max-w-3xl">
        <div className="bbx-card p-6 sm:p-8">
          <button type="button" onClick={handleBack} className="bbx-back">
            ← Back
          </button>
          <p className="mt-6 text-xs uppercase tracking-[0.22em] text-[#9090A8]">YOUR TRUTH. PROTECTED.</p>
          <h1 className="bbx-font-display mt-2 text-4xl">Home</h1>

          <div className="mt-5 rounded-xl border border-white/10 bg-[#171725] px-4 py-3 text-sm text-[#B3B3C8]">
            {kinfolk?.kinfolkName ? (
              <p className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#42D392]" />
                Kinfolk connected: <span className="font-semibold text-white">{kinfolk.kinfolkName}</span>
              </p>
            ) : (
              <p>
                Kinfolk status: <span className="text-[#F5A623]">Add one</span>{' '}
                <button type="button" onClick={() => navigate('/setup')} className="underline">
                  now
                </button>
              </p>
            )}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => navigate('/session')}
              className={`bbx-font-display h-[190px] w-[190px] rounded-full border text-center text-lg leading-6 sm:h-[220px] sm:w-[220px] ${
                isRecording
                  ? 'border-[#FF4C5B]/60 bg-[#2B1720] text-[#FFD9DE]'
                  : 'border-[#7B4FFF]/45 bg-[radial-gradient(circle_at_30%_25%,rgba(123,79,255,.45),rgba(15,15,28,.9))] text-white'
              }`}
              style={{ boxShadow: '0 24px 55px rgba(0,0,0,.42)' }}
            >
              {isRecording ? 'Return to Session' : 'Start Session'}
            </button>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => navigate('/timeline')}
              className="min-h-[4.5rem] rounded-2xl border border-[#7B4FFF]/50 bg-[#221b3a] px-4 text-left text-white"
            >
              <p className="bbx-font-display text-xl">Private Timeline</p>
            </button>
            <button
              type="button"
              onClick={() => navigate(kinfolk?.kinfolkName ? '/kinfolk' : '/setup')}
              className="min-h-[4.5rem] rounded-2xl border border-[#F5A623]/55 bg-[#2A2010] px-4 text-left text-white"
            >
              <p className="bbx-font-display text-xl">Kinfolk</p>
            </button>
            <button
              type="button"
              onClick={() => navigate('/support')}
              className="min-h-[4.5rem] rounded-2xl border border-white/14 bg-[#1a1a2a] px-4 text-left text-white sm:col-span-2"
            >
              <p className="bbx-font-display text-xl">Support Options</p>
            </button>
          </div>

          <p className="mt-7 text-sm text-[#9090A8]">
            Black Boxx preserves the truth when the world tries to rewrite it.
          </p>
        </div>
      </section>
    </main>
  )
}
