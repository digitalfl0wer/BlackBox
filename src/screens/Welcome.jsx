import { useNavigate } from 'react-router-dom'
import logoCube from '../../images/logocube.png'

export default function Welcome() {
  const navigate = useNavigate()

  return (
    <main className="bb-page flex items-center">
      <section className="bb-shell max-w-6xl space-y-5">
        <div className="bb-panel overflow-hidden">
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="bb-label">UNITY. MEMORY. SAFETY. PRESERVED.</p>
              <h1 className="bb-title mt-3 max-w-xl">
                Black Box is a private system for preserving truth under pressure.
              </h1>
              <p className="bb-subtitle mt-4 max-w-2xl">
                Capture your experience in real time, reflect with context-aware AI, and keep your record
                grounded, organized, and ready when you need support.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/setup')}
                  className="bb-btn-primary min-w-[11rem]"
                >
                  Enter Black Box
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/home')}
                  className="bb-btn-secondary min-w-[11rem]"
                >
                  Open Workspace
                </button>
              </div>
              <p className="mt-5 text-sm leading-6 text-neutral-gray">
                This app is for personal safety documentation and education. It does not provide legal advice.
              </p>
            </div>

            <div className="relative mx-auto h-64 w-64 sm:h-72 sm:w-72">
              <div className="absolute inset-0 rounded-[2rem] bg-memory-violet/12 blur-2xl" />
              <div className="absolute inset-6 rounded-[1.8rem] bg-unity-amber/14 blur-2xl" />
              <div className="bb-logo-wrap bb-logo-float absolute inset-0">
                <img
                  src={logoCube}
                  alt="Black Box Unity Cube logo"
                  className="bb-logo-spin h-full w-full object-contain"
                />
                <div className="logo-glow" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Unity', 'Keep your account of events coherent and intact.'],
            ['Memory', 'Organize details into a clear timeline with context.'],
            ['Safety', 'Enable discreet operation and rapid trusted signals.'],
            ['Preserved Truth', 'Store records privately for later review and action.'],
          ].map(([title, description]) => (
            <article key={title} className="bb-panel-soft rounded-card">
              <p className="text-sm font-semibold text-silver-white">{title}</p>
              <p className="mt-2 text-sm leading-6 text-neutral-gray">{description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
