import { detectKeywords } from './keywords.js'

const SYSTEM_PROMPT = `You are a safety signal analyzer for a personal documentation app.
Your job is to review user-written notes for possible safety concerns.

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
  const scenarioTags = sessionPayload?.scenarioTags || []

  // Pass 1: rule-based, zero latency
  const ruleResults = detectKeywords(notes)

  // If notes are empty, return rule results only (tags may still provide category signal)
  if (!notes.trim()) {
    const tagCategories = scenarioTags.filter(Boolean)
    return {
      categories: Array.from(new Set([...ruleResults.categories, ...tagCategories])),
      flaggedPhrases: [],
      requiresImmediateSignal: false,
    }
  }

  // Pass 2: LLM validation
  try {
    const userMessage = [
      `Session scenario tags: ${scenarioTags.length ? scenarioTags.join(', ') : 'None'}`,
      `User notes:\n${notes}`,
      `Rule-based phrases already detected: ${
        ruleResults.flaggedPhrases.length
          ? ruleResults.flaggedPhrases.map((p) => `"${p.phrase}" (${p.category})`).join(', ')
          : 'none'
      }`,
      'Analyze the notes and return the JSON schema described in the system prompt.',
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

    // Merge and deduplicate rule-based + LLM results
    const mergedCategories = Array.from(
      new Set([
        ...ruleResults.categories,
        ...(Array.isArray(llmResult.categories) ? llmResult.categories : []),
        ...scenarioTags.filter(Boolean),
      ])
    )

    const llmPhrases = Array.isArray(llmResult.flaggedPhrases) ? llmResult.flaggedPhrases : []

    // Rule-based phrases get urgency 'informational' as default; LLM phrases keep their urgency
    const rulePhrases = ruleResults.flaggedPhrases.map((p) => ({
      phrase: p.phrase,
      category: p.category,
      urgency: 'informational',
    }))

    // Deduplicate phrases by phrase text
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
    // Graceful degradation: return rule-based results with scenario tags
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
