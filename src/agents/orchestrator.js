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

async function transcribeAudio(audioUrl, mimeType) {
  if (!audioUrl || typeof audioUrl !== 'string') return ''

  try {
    // audioUrl is a data URL: "data:audio/webm;base64,<data>"
    const commaIndex = audioUrl.indexOf(',')
    if (commaIndex < 0) return ''
    const base64 = audioUrl.slice(commaIndex + 1)
    if (!base64) return ''

    const response = await fetch('/api/transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioBase64: base64, mimeType: mimeType || 'audio/webm' }),
    })

    if (!response.ok) return ''
    const data = await response.json()
    return typeof data.transcript === 'string' ? data.transcript : ''
  } catch {
    return ''
  }
}

export async function runAgentPipeline(sessionPayload) {
  const resolvedPayload = sessionPayload && typeof sessionPayload === 'object' ? sessionPayload : {}
  const { audioUrl, audioMimeType, ...safePayload } = resolvedPayload

  // Transcribe audio first — transcript feeds into all three agents
  const transcript = await transcribeAudio(audioUrl, audioMimeType)

  const enrichedPayload = { ...safePayload, transcript }

  try {
    const response = await fetch('/api/reflect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionPayload: enrichedPayload }),
    })

    if (!response.ok) {
      console.error(`Reflection API returned ${response.status} — using fallback.`)
      return { ...buildFallbackReflection(resolvedPayload), transcript }
    }

    const data = await response.json()

    if (!hasRequiredReflectionShape(data)) {
      console.error('Reflection response was malformed — using fallback.')
      return { ...buildFallbackReflection(resolvedPayload), transcript }
    }

    return { ...data, transcript }
  } catch (networkError) {
    console.error('Reflection request failed:', networkError?.message)
    return { ...buildFallbackReflection(resolvedPayload), transcript }
  }
}
