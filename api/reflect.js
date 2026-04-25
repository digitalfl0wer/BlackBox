import OpenAI from 'openai'
import { runKeywordAgent } from '../src/agents/keywordAgent.js'
import { runResourceAgent } from '../src/agents/resourceAgent.js'
import { runReflectionAgent } from '../src/agents/reflectionAgent.js'
import { buildFallbackReflection } from '../src/agents/fallback.js'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { sessionPayload } = req.body || {}

  if (!sessionPayload) {
    return res.status(400).json({ error: 'Missing sessionPayload' })
  }

  try {
    const keywordAnalysis = await runKeywordAgent(sessionPayload, openai)
    const resources = await runResourceAgent(keywordAnalysis.categories, openai)
    const reflection = await runReflectionAgent(
      { sessionPayload, keywordAnalysis, resources },
      openai
    )

    return res.status(200).json(reflection)
  } catch (error) {
    console.error('Agent pipeline error:', error?.message || error)
    return res.status(200).json(buildFallbackReflection(sessionPayload))
  }
}
