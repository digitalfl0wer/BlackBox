import OpenAI from 'openai'
import { runKeywordAgent } from '../src/agents/keywordAgent.js'
import { runResourceAgent } from '../src/agents/resourceAgent.js'
import { runReflectionAgent } from '../src/agents/reflectionAgent.js'
import { buildFallbackReflection } from '../src/agents/fallback.js'

function createOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY?.trim()

  if (!apiKey) {
    return null
  }

  try {
    return new OpenAI({ apiKey })
  } catch (error) {
    console.error('OpenAI client initialization failed:', error?.message || error)
    return null
  }
}

function normalizeSessionPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return null
  }

  const normalizedTags = Array.isArray(payload.scenarioTags)
    ? payload.scenarioTags.filter((tag) => typeof tag === 'string' && tag.trim())
    : []

  return {
    ...payload,
    notes: typeof payload.notes === 'string' ? payload.notes : '',
    scenarioTags: normalizedTags,
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { sessionPayload } = req.body || {}
  const normalizedPayload = normalizeSessionPayload(sessionPayload)

  if (!normalizedPayload) {
    return res.status(400).json({ error: 'Invalid sessionPayload' })
  }

  const openai = createOpenAIClient()

  if (!openai) {
    console.error('OPENAI_API_KEY missing or invalid — returning fallback reflection.')
    return res.status(200).json(buildFallbackReflection(normalizedPayload))
  }

  try {
    const keywordAnalysis = await runKeywordAgent(normalizedPayload, openai)
    const resources = await runResourceAgent(keywordAnalysis.categories, openai)
    const reflection = await runReflectionAgent(
      { sessionPayload: normalizedPayload, keywordAnalysis, resources },
      openai
    )

    return res.status(200).json(reflection)
  } catch (error) {
    console.error('Agent pipeline error:', error?.message || error)
    return res.status(200).json(buildFallbackReflection(normalizedPayload))
  }
}
