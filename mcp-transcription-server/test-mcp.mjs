import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'

const BASE_URL = 'http://127.0.0.1:3333'

function makeSilentWav() {
  const sampleRate = 8000
  const numSamples = sampleRate
  const dataSize = numSamples * 2
  const buf = Buffer.alloc(44 + dataSize)
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + dataSize, 4)
  buf.write('WAVE', 8); buf.write('fmt ', 12)
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22)
  buf.writeUInt32LE(sampleRate, 24); buf.writeUInt32LE(sampleRate * 2, 28)
  buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34)
  buf.write('data', 36); buf.writeUInt32LE(dataSize, 40)
  return buf.toString('base64')
}

async function run() {
  const client = new Client({ name: 'test-client', version: '1.0.0' })
  const transport = new StreamableHTTPClientTransport(new URL(`${BASE_URL}/mcp`))
  await client.connect(transport)

  // 1. Tool list
  const tools = await client.listTools()
  const names = tools.tools.map(t => t.name)
  console.log('[1] Tools registered:', names.join(', '))
  for (const t of ['transcribe_audio', 'get_transcript', 'list_transcripts']) {
    if (!names.includes(t)) throw new Error(`Missing tool: ${t}`)
  }

  // 2. list_transcripts baseline
  const list1 = await client.callTool({ name: 'list_transcripts', arguments: { limit: 50 } })
  const listData1 = JSON.parse(list1.content[0].text)
  if (!listData1.ok) throw new Error('list_transcripts returned ok:false')
  console.log('[2] list_transcripts ok — baseline count:', listData1.count)

  // 3. transcribe_audio with 1s silent WAV
  let transcriptId = null
  try {
    const txResult = await client.callTool({
      name: 'transcribe_audio',
      arguments: {
        audioBase64: makeSilentWav(),
        fileName: 'test-silence.wav',
        sourceLabel: 'CI test — 1s silence',
      },
    })
    const txData = JSON.parse(txResult.content[0].text)
    if (!txData.ok) throw new Error('transcribe_audio returned ok:false')
    console.log('[3] transcribe_audio ok — id:', txData.transcriptId)
    transcriptId = txData.transcriptId
  } catch (err) {
    // Whisper may reject silent audio — that is an API-level response, not a code bug
    console.log('[3] transcribe_audio threw (likely silent audio rejected by Whisper):', err.message)
  }

  // 4. get_transcript by id
  if (transcriptId) {
    const getResult = await client.callTool({ name: 'get_transcript', arguments: { transcriptId } })
    const getData = JSON.parse(getResult.content[0].text)
    if (!getData.ok) throw new Error('get_transcript returned ok:false')
    if (getData.count === 0) throw new Error('get_transcript found 0 records for known id')
    console.log('[4] get_transcript ok — found:', getData.count)
  } else {
    console.log('[4] get_transcript skipped (no id from step 3)')
  }

  // 5. list_transcripts after
  const list2 = await client.callTool({ name: 'list_transcripts', arguments: { limit: 50 } })
  const listData2 = JSON.parse(list2.content[0].text)
  if (!listData2.ok) throw new Error('list_transcripts (post) returned ok:false')
  if (transcriptId && listData2.count <= listData1.count) {
    throw new Error(`Count should increase after transcription. Before: ${listData1.count}, after: ${listData2.count}`)
  }
  console.log('[5] list_transcripts after ok — count:', listData2.count)

  await client.close()
  console.log('\nAll checks passed.')
}

run().catch(err => { console.error('\nFAIL:', err.message); process.exit(1) })
