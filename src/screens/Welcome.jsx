import { useNavigate } from 'react-router-dom'

export default function Welcome() {
  const navigate = useNavigate()

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/', { replace: true })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-void-black px-5 py-8 text-silver-white">
      <section className="w-full max-w-xl rounded-2xl border border-neutral-gray/30 bg-slate-black p-6 shadow-xl shadow-void-black/50 sm:p-8">
        <button
          type="button"
          onClick={handleBack}
          className="h-8 -translate-y-3 self-start rounded-md border border-neutral-gray/40 bg-void-black px-2 py-0.5 text-[10px] font-medium text-silver-white"
        >
          Back
        </button>
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-gray">Black Box</p>
        <h1 className="mt-2 text-4xl font-semibold leading-tight text-silver-white sm:text-5xl">
          Preserve the truth.
        </h1>
        <p className="mt-1 text-xl text-memory-violet sm:text-2xl">Understand the pattern. Reach support.</p>

        <p className="mt-6 text-sm leading-6 text-silver-white/90 sm:text-base">
          Black Box helps you document what happened in your own words, then organizes your notes into
          a plain-language AI Reflection. It is built to help you keep your record clear and connect to
          support options without adding pressure.
        </p>

        <p className="mt-5 rounded-lg border border-neutral-gray/40 bg-void-black/40 p-4 text-sm leading-6 text-neutral-gray">
          This app is for personal safety documentation and education. It does not provide legal advice.
        </p>

        <button
          type="button"
          onClick={() => navigate('/setup')}
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-unity-amber px-4 py-3 text-sm font-semibold text-void-black transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-unity-amber/60"
        >
          Get Started
        </button>
      </section>
    </main>
  )
}
