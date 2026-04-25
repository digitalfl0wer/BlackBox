import OpenAI, { toFile } from 'openai'

const MAX_BYTES = 20 * 1024 * 1024 // 20 MB — Whisper limit is 25 MB

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { audioBase64, mimeType } = req.body || {}

  if (!audioBase64 || typeof audioBase64 !== 'string') {
    return res.status(400).json({ error: 'Missing audioBase64' })
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) {
    return res.status(200).json({ transcript: '', skipped: true })
  }

  try {
    const audioBuffer = Buffer.from(audioBase64, 'base64')

    if (audioBuffer.byteLength > MAX_BYTES) {
      console.warn(`[transcribe] Audio too large: ${audioBuffer.byteLength} bytes`)
      return res.status(200).json({ transcript: '', skipped: true, reason: 'audio_too_large' })
    }

    const resolvedMime = typeof mimeType === 'string' && mimeType ? mimeType : 'audio/webm'
    const ext = resolvedMime.includes('mp4') || resolvedMime.includes('m4a') ? 'm4a' : 'webm'

    const openai = new OpenAI({ apiKey })
    const file = await toFile(audioBuffer, `recording.${ext}`, { type: resolvedMime })

    const response = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language: 'en',
      response_format: 'json',
    })

    const transcript = typeof response.text === 'string' ? response.text.trim() : ''
    return res.status(200).json({ transcript })
  } catch (error) {
    console.error('[transcribe] Whisper error:', error?.message)
    return res.status(200).json({ transcript: '', error: error?.message })
  }
}
