const SYSTEM_PROMPT = `You are an AI safety reflection assistant inside Black Boxx. Your role is to help users organize what happened, notice possible concern areas, and connect to support. You are not a lawyer, therapist, emergency responder, investigator, or judge. Do not determine whether a crime occurred. Do not give legal advice. Do not diagnose abuse, trauma, manipulation, or mental health conditions. Do not pressure the user to report. Do not tell the user to confront the other person. Do not claim certainty. Use plain language. Use trauma-aware, culturally respectful wording. Prioritize user safety, dignity, and control.

Return ONLY valid JSON with exactly these 8 fields:

{
  "summary": "A 2–4 sentence plain-language description of what the user documented. Use their words where possible. Do not add interpretations they did not express.",
  "timeline": [
    { "time": "approximate time or sequence label", "event": "brief description of what happened" }
  ],
  "concernAreas": ["string array of possible concern category labels, e.g. 'Boundary / Consent Concern'"],
  "whyFlagged": [
    { "area": "concern area name", "reason": "1–2 sentences explaining why this may be worth reviewing, using 'possible' or 'may suggest'", "phrases": ["exact phrase or paraphrase from the notes"] }
  ],
  "whatThisDoesNotMean": "Standard guardrail statement. Use this exact text: 'This reflection is for personal documentation only. It is not a legal conclusion, a diagnosis, or advice to take any specific action. AI can make mistakes — review everything carefully. Possible concern areas are not determinations of fault or harm.'",
  "nextSteps": ["array of 3–5 plain-language suggested next steps the user may consider — never mandatory, always their choice"],
  "supportOptions": [
    { "name": "org name", "category": "category", "description": "1-sentence description", "url": "url" }
  ],
  "affirmingMessage": "One warm, specific sentence acknowledging what the user did. Do not use generic phrases like 'stay strong'. Speak directly to the courage it takes to document and seek support."
}`

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

export async function runReflectionAgent({ sessionPayload, keywordAnalysis, resources }, openai) {
  const notes = sessionPayload?.notes || ''
  const transcript = sessionPayload?.transcript || ''
  const tags = sessionPayload?.scenarioTags || []
  const startedAt = sessionPayload?.startedAt || ''
  const endedAt = sessionPayload?.endedAt || ''
  const durationSeconds = sessionPayload?.duration || sessionPayload?.durationSeconds || 0
  const signalSent = sessionPayload?.signalSent || false
  const state = sessionPayload?.state || ''

  const flaggedPhrases = keywordAnalysis?.flaggedPhrases || []
  const categories = keywordAnalysis?.categories || []
  const requiresImmediateSignal = keywordAnalysis?.requiresImmediateSignal || false
  const matchedResources = resources?.resources || []

  const durationMin = Math.round(durationSeconds / 60)
  const durationLabel = durationMin > 0 ? `${durationMin} minute${durationMin !== 1 ? 's' : ''}` : 'less than a minute'

  const contentParts = []
  if (transcript) {
    contentParts.push(`Audio transcript (verbatim from recording):\n${transcript}`)
  }
  if (notes) {
    contentParts.push(`User notes (typed after session):\n${notes}`)
  }
  if (!transcript && !notes) {
    contentParts.push('(no transcript or notes provided)')
  }

  const userMessage = [
    `Session metadata:`,
    `- State: ${state || 'not specified'}`,
    `- Started: ${startedAt}`,
    `- Ended: ${endedAt}`,
    `- Duration: ${durationLabel}`,
    `- Signal sent to Kinfolk: ${signalSent ? 'Yes' : 'No'}`,
    `- Scenario tags selected by user: ${tags.length ? tags.join(', ') : 'None'}`,
    '',
    ...contentParts,
    '',
    `Possible concern areas identified:`,
    categories.length ? categories.join(', ') : 'None detected',
    '',
    `Flagged phrases:`,
    flaggedPhrases.length
      ? flaggedPhrases.map((p) => `"${p.phrase}" — ${p.category} (${p.urgency})`).join('\n')
      : 'None',
    '',
    `Immediate signal recommended: ${requiresImmediateSignal ? 'Yes' : 'No'}`,
    '',
    `Matched support resources:`,
    matchedResources.length
      ? matchedResources.map((r) => `- ${r.name} (${r.category}): ${r.url}`).join('\n')
      : 'None matched',
    '',
    'Generate the AI Reflection JSON with all 8 fields.',
    'Prioritize the audio transcript as the primary source when building the summary and timeline — it is verbatim.',
    'Use the matched support resources above for the supportOptions field — copy them exactly.',
    'If content is sparse, keep the reflection brief and honest rather than filling space with assumptions.',
  ].join('\n')

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.3,
    max_tokens: 2000,
  })

  const parsed = JSON.parse(response.choices[0].message.content)

  // Validate all 8 required fields are present
  const missing = REQUIRED_FIELDS.filter((field) => !(field in parsed))
  if (missing.length > 0) {
    throw new Error(`ReflectionAgent response missing required fields: ${missing.join(', ')}`)
  }

  // Normalize array fields to ensure they're never null
  return {
    summary: parsed.summary || '',
    timeline: Array.isArray(parsed.timeline) ? parsed.timeline : [],
    concernAreas: Array.isArray(parsed.concernAreas) ? parsed.concernAreas : [],
    whyFlagged: Array.isArray(parsed.whyFlagged) ? parsed.whyFlagged : [],
    whatThisDoesNotMean: parsed.whatThisDoesNotMean || '',
    nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps : [],
    supportOptions: Array.isArray(parsed.supportOptions) ? parsed.supportOptions : matchedResources,
    affirmingMessage: parsed.affirmingMessage || '',
  }
}
