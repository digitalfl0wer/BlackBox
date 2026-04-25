import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useSession } from '../context/SessionContext'

const PROGRESS_STEPS = [
  'Transcribing your recording...',
  'Analyzing your session...',
  'Finding relevant support...',
  'Generating your reflection...',
]

const AGENT_MODULES = import.meta.glob('../agents/*.js')

async function getRunAgentPipeline() {
  const orchestratorLoader = AGENT_MODULES['../agents/orchestrator.js']

  if (!orchestratorLoader) {
    throw new Error('Agent pipeline is unavailable in this build.')
  }

  const module = await orchestratorLoader()

  if (!module || typeof module.runAgentPipeline !== 'function') {
    throw new Error('Agent pipeline is unavailable in this build.')
  }

  return module.runAgentPipeline
}

export default function ReflectionLoading() {
  const navigate = useNavigate()
  const { currentSession, setReflection } = useSession()

  const [stepIndex, setStepIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const unmountedRef = useRef(false)

  const runPipeline = useCallback(async () => {
    setIsLoading(true)
    setError('')
    setStepIndex(0)

    const progressTimer = window.setInterval(() => {
      setStepIndex((previous) => Math.min(previous + 1, PROGRESS_STEPS.length - 1))
    }, 3500)

    try {
      const runAgentPipeline = await getRunAgentPipeline()
      const data = await runAgentPipeline(currentSession)

      if (!data || typeof data !== 'object') {
        throw new Error('Invalid reflection response.')
      }

      if (unmountedRef.current) {
        return
      }

      setReflection(data)
      navigate('/reflection', { replace: true })
    } catch (pipelineError) {
      if (!unmountedRef.current) {
        setError(
          pipelineError?.message || 'Unable to load your reflection right now. Please retry.'
        )
      }
    } finally {
      window.clearInterval(progressTimer)
      if (!unmountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [currentSession, navigate, setReflection])

  useEffect(() => {
    if (!currentSession) return

    unmountedRef.current = false
    runPipeline()

    return () => {
      unmountedRef.current = true
    }
  }, [runPipeline, currentSession])

  if (!currentSession) {
    return <Navigate to="/home" replace />
  }

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/home', { replace: true })
  }

  return (
    <main className="bb-page">
      <section className="bb-shell bb-panel max-w-2xl">
        <button
          type="button"
          onClick={handleBack}
          className="bb-back mb-4"
        >
          ← Back
        </button>
        <p className="bb-label">AI MEMORY SYNTHESIS</p>
        <h1 className="bb-title mt-2 text-2xl">Preparing Your AI Reflection</h1>
        <p className="mt-2 text-sm text-mist-gray">This may take 15–30 seconds.</p>

        <div className="mt-6 rounded-control border border-divider-gray bg-void-black/45 p-4">
          <p className="text-sm text-silver-white">{PROGRESS_STEPS[stepIndex]}</p>
          <ol className="mt-3 space-y-2 text-sm text-neutral-gray">
            {PROGRESS_STEPS.map((step, index) => (
              <li key={step} className={index <= stepIndex ? 'text-silver-white' : 'text-neutral-gray'}>
                {index + 1}. {step}
              </li>
            ))}
          </ol>
        </div>

        {error ? (
          <div className="mt-4 rounded-control border border-memory-violet/45 bg-memory-violet/10 p-4">
            <p className="text-sm text-silver-white">{error}</p>
            <button
              type="button"
              onClick={runPipeline}
              disabled={isLoading}
              className="bb-btn-primary mt-3"
            >
              Retry
            </button>
          </div>
        ) : null}
      </section>
    </main>
  )
}
