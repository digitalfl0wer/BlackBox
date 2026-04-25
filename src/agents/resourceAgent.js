import { RESOURCES } from '../data/resources.js'

// General-purpose fallback resources returned when categories are empty
const GENERAL_RESOURCE_NAMES = ['Crisis Text Line', '211 — United Way']

const SYSTEM_PROMPT = `You are a support resource matcher for a personal safety documentation app.

You will receive:
1. A list of concern categories detected in a session
2. A curated list of support organizations (JSON array)

Your task: Select the 3–4 most relevant organizations from the provided list ONLY.
Do NOT add, invent, or suggest any organizations not in the provided list.
Do NOT change any field values — copy them exactly.

Return this exact JSON structure:
{
  "resources": [
    { "name": "...", "category": "...", "description": "...", "url": "..." }
  ]
}`

export async function runResourceAgent(categories, openai) {
  // No categories → return general safety defaults
  if (!categories || categories.length === 0) {
    const defaults = RESOURCES.filter((r) => GENERAL_RESOURCE_NAMES.includes(r.name)).slice(0, 2)
    return { resources: defaults }
  }

  try {
    const userMessage = [
      `Concern categories identified in this session: ${categories.join(', ')}`,
      '',
      'Available resources (select from this list only):',
      JSON.stringify(RESOURCES, null, 2),
      '',
      'Select the 3–4 most relevant resources for these categories.',
    ].join('\n')

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.1,
      max_tokens: 1200,
    })

    const result = JSON.parse(response.choices[0].message.content)
    const resources = Array.isArray(result.resources) ? result.resources : []

    // Validate each resource against the source list to prevent hallucination
    const validNames = new Set(RESOURCES.map((r) => r.name))
    const validated = resources
      .filter((r) => r && r.name && validNames.has(r.name))
      .map((r) => {
        // Always return the authoritative data from our list, not the LLM's copy
        return RESOURCES.find((src) => src.name === r.name) || r
      })

    if (validated.length === 0) {
      throw new Error('ResourceAgent returned no valid resources after validation')
    }

    return { resources: validated }
  } catch (err) {
    console.error('ResourceAgent failed, returning category-matched fallback:', err?.message)

    // Rule-based fallback: match by category string
    const matched = RESOURCES.filter((r) =>
      categories.some(
        (cat) =>
          r.category.toLowerCase() === cat.toLowerCase() ||
          cat.toLowerCase().includes(r.category.toLowerCase())
      )
    ).slice(0, 4)

    if (matched.length > 0) return { resources: matched }

    // Last resort: return general resources
    const defaults = RESOURCES.filter((r) => GENERAL_RESOURCE_NAMES.includes(r.name)).slice(0, 2)
    return { resources: defaults }
  }
}
