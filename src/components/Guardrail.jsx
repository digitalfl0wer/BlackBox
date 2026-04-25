const VARIANT_COPY = {
  default: [
    'This app is for personal safety documentation and education. It does not provide legal advice.',
    'AI can make mistakes. Review all summaries, concern areas, and resources before relying on them.',
    'Possible concern areas are not legal conclusions.',
  ],
  legal: [
    'This app is for personal safety documentation and education. It does not provide legal advice.',
    'Recording laws vary by state. If you plan to use a recording later, double-check your local laws or speak with a qualified legal advocate.',
  ],
  reflection: [
    'This app is for personal safety documentation and education. It does not provide legal advice.',
    'Recording laws vary by state. If you plan to use a recording later, double-check your local laws or speak with a qualified legal advocate.',
    'AI can make mistakes. Review all summaries, concern areas, and resources before relying on them.',
    'Possible concern areas are not legal conclusions.',
  ],
}

export default function Guardrail({ variant = 'default' }) {
  const lines = VARIANT_COPY[variant] || VARIANT_COPY.default

  return (
    <aside className="rounded-control border border-divider-gray border-l-4 border-l-unity-amber bg-panel-black/80 px-4 py-3 text-sm leading-6 text-silver-white/95 backdrop-blur-sm">
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </aside>
  )
}
