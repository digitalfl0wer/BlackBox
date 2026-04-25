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

  const response = await fetch('/api/reflect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionPayload: safePayload }),
  })

  if (!response.ok) {
    let message = `Reflection API returned ${response.status}.`
    try {
      const errorPayload = await response.json()
      if (typeof errorPayload?.message === 'string' && errorPayload.message.trim()) {
        message = errorPayload.message
      } else if (typeof errorPayload?.error === 'string' && errorPayload.error.trim()) {
        message = errorPayload.error
      }
    } catch {
      // Keep default status-based message.
    }
    throw new Error(message)
  }

  const data = await response.json()

  if (!hasRequiredReflectionShape(data)) {
    throw new Error('Reflection response was malformed.')
  }

  return data
}
