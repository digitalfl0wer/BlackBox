import { RESOURCES } from '../data/resources.js'

const GENERAL_FALLBACK_RESOURCES = ['Crisis Text Line', '211 — United Way', 'National Center for Victims of Crime']

export function buildFallbackReflection(sessionPayload) {
  const rawTags = sessionPayload?.scenarioTags
  const tags = Array.isArray(rawTags) ? rawTags.filter((tag) => typeof tag === 'string' && tag.trim()) : []

  // Try to match at least 2–3 resources by the session's scenario tags
  let supportOptions = RESOURCES.filter((r) =>
    tags.some(
      (tag) =>
        r.category.toLowerCase() === tag.toLowerCase() ||
        tag.toLowerCase().includes(r.category.toLowerCase())
    )
  ).slice(0, 3)

  // Fill up to 3 with general resources if not enough matched
  if (supportOptions.length < 2) {
    const general = RESOURCES.filter((r) => GENERAL_FALLBACK_RESOURCES.includes(r.name))
    const existing = new Set(supportOptions.map((r) => r.name))
    for (const r of general) {
      if (!existing.has(r.name)) supportOptions.push(r)
      if (supportOptions.length >= 3) break
    }
  }

  return {
    summary:
      "We weren't able to generate a full reflection for this session. Your record has been saved.",
    timeline: [],
    concernAreas: tags.length > 0 ? tags : [],
    whyFlagged: [],
    whatThisDoesNotMean:
      'This reflection is for personal documentation only. It is not a legal conclusion, a diagnosis, or advice to take any specific action. AI can make mistakes — review everything carefully. Possible concern areas are not determinations of fault or harm.',
    nextSteps: [
      'Review what you documented and note anything you want to remember.',
      'Reach out to someone you trust — a friend, family member, or community advocate.',
      'If you feel unsafe right now, please contact a crisis line or emergency services.',
      'Consider connecting with one of the support organizations listed below.',
    ],
    supportOptions,
    affirmingMessage:
      'You took an important step by documenting this. Your record is saved. When you\'re ready, consider reaching out to someone you trust or a trained advocate.',
  }
}
