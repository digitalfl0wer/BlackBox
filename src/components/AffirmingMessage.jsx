const DEFAULT_MESSAGE =
  'You took an important step by documenting this session. Your voice and your memory both matter.'

export default function AffirmingMessage({ message }) {
  const resolvedMessage = message?.trim() || DEFAULT_MESSAGE

  return (
    <article className="rounded-card border border-memory-violet/45 bg-gradient-to-br from-slate-black to-panel-black px-5 py-5 shadow-violet-glow sm:px-6">
      <p className="text-lg leading-8 text-silver-white">{resolvedMessage}</p>
    </article>
  )
}
