import { buildFallbackReflection } from './fallback.js'

const REQUIRED_FIELDS = [
  'summary',
  'timeline',
  'concernAreas',
  'whyFlagged',
  'whatThisDoesNotMean',
  'nextSteps',
  'supportOptions',
  'affirmingMessage',
]

function hasRequiredReflectionShape(data) {
  if (!data || typeof data !== 'object') {
    return false
  }

  return REQUIRED_FIELDS.every((field) => Object.prototype.hasOwnProperty.call(data, field))
}

export async function runAgentPipeline(sessionPayload) {
  const resolvedPayload = sessionPayload && typeof sessionPayload === 'object' ? sessionPayload : {}
  const { audioUrl: _audioUrl, ...safePayload } = resolvedPayload

  try {
    const response = await fetch('/api/reflect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionPayload: safePayload }),
    })

    if (!response.ok) {
      console.error(`Reflection API returned ${response.status} — using fallback.`)
      return buildFallbackReflection(resolvedPayload)
    }

    const data = await response.json()

    if (!hasRequiredReflectionShape(data)) {
      console.error('Reflection response was malformed — using fallback.')
      return buildFallbackReflection(resolvedPayload)
    }

    return data
  } catch (networkError) {
    console.error('Reflection request failed:', networkError?.message)
    return buildFallbackReflection(resolvedPayload)
  }
}
