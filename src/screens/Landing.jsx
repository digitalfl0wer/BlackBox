import { useEffect, useState } from 'react'

const PILLARS = [
  { label: 'Unity', icon: '⬡', desc: 'Keep your account of events coherent and intact. Many voices, one truth.' },
  { label: 'Memory', icon: '◎', desc: 'Organize what happened into a clear timeline with full context preserved.' },
  { label: 'Safety', icon: '◈', desc: 'Discreet operation, rapid trusted signals, and protected records - always.' },
  { label: 'Preserved Truth', icon: '◉', desc: 'Store your record privately. Review it, share it, or hold it. It is yours.' },
]

export default function Landing({ onEnter, onWorkspace }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 100)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <main className="landing-root">
      <div className="landing-glow-amber" />
      <div className="landing-glow-purple" />
      <div className="landing-grain" />

      <nav className="landing-nav">
        <div className="landing-nav-logo">
          <span>Black</span>
          <span>Box</span>
          <span className="landing-nav-logo-x">x</span>
        </div>
        <p className="landing-nav-tag">UNITY. MEMORY. PRESERVED.</p>
      </nav>

      <section
        className="landing-hero"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'none' : 'translateY(20px)',
        }}
      >
        <div className="landing-hero-left">
          <div className="landing-cube-wrapper">
            <div className="landing-cube-glow-amber" />
            <div className="landing-cube-glow-purple" />
            <img
              src="/images/logocube1.png"
              alt="Black Boxx Unity Cube"
              className="landing-cube-image"
            />
          </div>
        </div>

        <div className="landing-hero-right">
          <p className="landing-eyebrow"></p>

          <h1 className="landing-wordmark">
            <span>Black</span>
            <span>Box</span>
            <span className="landing-wordmark-x">x</span>
          </h1>

          <p className="landing-tagline">
            <span className="text-white">UNITY.</span>{' '}
            <span className="text-[#9090A8]">MEMORY.</span>{' '}
            <span className="text-[#7B4FFF]">PRESERVED.</span>
          </p>

          <p className="landing-body">
            For too long, our voices have been muted, our stories rewritten by hands not our own.
            Black Boxx preserves what actually happened your truth, held safe, ready when you need it.
          </p>

          <div className="landing-ctas">
            <button type="button" className="landing-btn-primary" onClick={onEnter}>
              Enter Black Boxx
            </button>
            <button type="button" className="landing-btn-secondary" onClick={onWorkspace}>
              Take Me Home
            </button>
          </div>

          <p className="landing-disclaimer">
            For personal safety documentation and education. Does not provide legal advice.
          </p>
        </div>
      </section>

      <section className="landing-pillars">
        {PILLARS.map((pillar) => (
          <article key={pillar.label} className="landing-pillar-card">
            <p className="landing-pillar-icon">{pillar.icon}</p>
            <p className="landing-pillar-label">{pillar.label}</p>
            <p className="landing-pillar-desc">{pillar.desc}</p>
          </article>
        ))}
      </section>

      <section className="landing-mission">
        <div className="landing-mission-inner">
          <p className="landing-mission-quote">
            &quot;Just like the Black Boxx on an airplane preserves what actually happened during a
            crash - this app preserves what happened in moments when your safety, memory, or
            boundaries may be at risk.&quot;
          </p>
        </div>
      </section>
    </main>
  )
}
