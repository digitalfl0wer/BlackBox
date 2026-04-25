const DEFAULT_MESSAGE =
  'You took an important step by documenting this session. Your voice and your memory both matter.'

export default function AffirmingMessage({ message }) {
  const resolvedMessage = message?.trim() || DEFAULT_MESSAGE

  return (
    <article className="rounded-card border border-unity-amber/45 bg-surface-2 px-5 py-5 sm:px-6">
      <p className="text-lg leading-8 text-silver-white">{resolvedMessage}</p>
    </article>
  )
}
