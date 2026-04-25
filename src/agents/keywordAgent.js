import { detectKeywords } from './keywords.js'

const SYSTEM_PROMPT = `You are a safety signal analyzer for a personal documentation app.
Your job is to review user-written notes and audio transcript for possible safety concerns.

Rules:
- Use "possible", "may suggest", "worth reviewing" — never state conclusions as fact
- Do not diagnose abuse, trauma, or mental health conditions
- Do not determine whether a crime occurred
- Return ONLY valid JSON matching the required schema

Return this exact JSON structure:
{
  "categories": ["string array of concern categories detected"],
  "flaggedPhrases": [
    { "phrase": "exact phrase from text", "category": "concern category", "urgency": "immediate|elevated|informational" }
  ],
  "requiresImmediateSignal": false
}

Urgency levels:
- "immediate": direct statements of present danger or crisis
- "elevated": indicators of ongoing unsafe situation
- "informational": patterns worth noting but not acute`

export async function runKeywordAgent(sessionPayload, openai) {
  const notes = sessionPayload?.notes || ''
  const transcript = sessionPayload?.transcript || ''
  const scenarioTags = sessionPayload?.scenarioTags || []

  // Combine notes and transcript — transcript is primary when notes are sparse
  const combinedText = [transcript, notes].filter(Boolean).join('\n\n')

  // Pass 1: rule-based, zero latency
  const ruleResults = detectKeywords(combinedText)

  // If no text at all, return tag-only categories
  if (!combinedText.trim()) {
    const tagCategories = scenarioTags.filter(Boolean)
    return {
      categories: Array.from(new Set([...ruleResults.categories, ...tagCategories])),
      flaggedPhrases: [],
      requiresImmediateSignal: false,
    }
  }

  // Pass 2: LLM validation
  try {
    const textParts = []
    if (transcript) textParts.push(`Audio transcript:\n${transcript}`)
    if (notes) textParts.push(`User notes:\n${notes}`)

    const userMessage = [
      `Session scenario tags: ${scenarioTags.length ? scenarioTags.join(', ') : 'None'}`,
      ...textParts,
      `Rule-based phrases already detected: ${
        ruleResults.flaggedPhrases.length
          ? ruleResults.flaggedPhrases.map((p) => `"${p.phrase}" (${p.category})`).join(', ')
          : 'none'
      }`,
      'Analyze the text and return the JSON schema described in the system prompt.',
    ].join('\n\n')

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.2,
      max_tokens: 800,
    })

    const llmResult = JSON.parse(response.choices[0].message.content)

    const mergedCategories = Array.from(
      new Set([
        ...ruleResults.categories,
        ...(Array.isArray(llmResult.categories) ? llmResult.categories : []),
        ...scenarioTags.filter(Boolean),
      ])
    )

    const llmPhrases = Array.isArray(llmResult.flaggedPhrases) ? llmResult.flaggedPhrases : []
    const rulePhrases = ruleResults.flaggedPhrases.map((p) => ({
      phrase: p.phrase,
      category: p.category,
      urgency: 'informational',
    }))

    const seenPhrases = new Set()
    const mergedPhrases = []
    for (const p of [...llmPhrases, ...rulePhrases]) {
      const key = (p.phrase || '').toLowerCase().trim()
      if (key && !seenPhrases.has(key)) {
        seenPhrases.add(key)
        mergedPhrases.push({
          phrase: p.phrase || '',
          category: p.category || 'Other',
          urgency: p.urgency || 'informational',
        })
      }
    }

    return {
      categories: mergedCategories,
      flaggedPhrases: mergedPhrases,
      requiresImmediateSignal: Boolean(llmResult.requiresImmediateSignal),
    }
  } catch (err) {
    console.error('KeywordAgent LLM pass failed, returning rule-based results:', err?.message)
    return {
      categories: Array.from(new Set([...ruleResults.categories, ...scenarioTags.filter(Boolean)])),
      flaggedPhrases: ruleResults.flaggedPhrases.map((p) => ({
        phrase: p.phrase,
        category: p.category,
        urgency: 'informational',
      })),
      requiresImmediateSignal: false,
    }
  }
}
