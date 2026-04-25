import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useSession } from '../context/SessionContext'

const PROGRESS_STEPS = [
  'Analyzing your session...',
  'Finding relevant support...',
  'Generating your reflection...',
  'Almost ready...',
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
          pipelineError?.message ||
            'Unable to complete your reflection right now. Please retry.'
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
    unmountedRef.current = false
    runPipeline()

    return () => {
      unmountedRef.current = true
    }
  }, [runPipeline])

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
    <main className="min-h-screen bg-void-black px-4 py-8 text-silver-white sm:px-6">
      <section className="mx-auto w-full max-w-2xl rounded-2xl border border-neutral-gray/30 bg-slate-black p-6 sm:p-8">
        <button
          type="button"
          onClick={handleBack}
          className="h-8 -translate-y-3 self-start rounded-md border border-neutral-gray/40 bg-void-black px-2 py-0.5 text-[10px] font-medium text-silver-white"
        >
          Back
        </button>
        <h1 className="text-2xl font-semibold">Preparing Your AI Reflection</h1>
        <p className="mt-2 text-sm text-neutral-gray">This may take 15–30 seconds.</p>

        <div className="mt-6 rounded-lg border border-neutral-gray/30 bg-void-black/40 p-4">
          <p className="text-sm text-silver-white">{PROGRESS_STEPS[stepIndex]}</p>
          <ol className="mt-3 space-y-2 text-sm text-neutral-gray">
            {PROGRESS_STEPS.map((step, index) => (
              <li key={step} className={index <= stepIndex ? 'text-silver-white' : ''}>
                {index + 1}. {step}
              </li>
            ))}
          </ol>
        </div>

        {error ? (
          <div className="mt-4 rounded-lg border border-memory-violet/40 bg-memory-violet/10 p-4">
            <p className="text-sm text-silver-white">{error}</p>
            <button
              type="button"
              onClick={runPipeline}
              disabled={isLoading}
              className="mt-3 min-h-12 rounded-lg bg-unity-amber px-4 py-2 text-sm font-semibold text-void-black disabled:opacity-60"
            >
              Retry
            </button>
          </div>
        ) : null}
      </section>
    </main>
  )
}
