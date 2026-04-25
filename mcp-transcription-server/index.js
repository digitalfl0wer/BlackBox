#!/usr/bin/env node
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { spawn } from 'node:child_process'
import express from 'express'
import OpenAI from 'openai'
import { z } from 'zod'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'

const HOST = process.env.MCP_HOST || '127.0.0.1'
const PORT = Number(process.env.MCP_PORT || 3333)
const OUTPUT_DIR = path.resolve(process.cwd(), process.env.TRANSCRIPT_OUTPUT_DIR || './transcripts')
const TRANSCRIBER_MODE = (process.env.TRANSCRIBER_MODE || 'openai').toLowerCase()
const TRANSCRIPTION_MODEL = process.env.TRANSCRIPTION_MODEL || 'whisper-1'
const WHISPER_BIN = process.env.WHISPER_BIN || 'whisper'
const WHISPER_MODEL_PATH = process.env.WHISPER_MODEL_PATH || ''

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null

const app = express()
app.use(express.json())

await ensureDir(OUTPUT_DIR)

const mcp = new McpServer(
  {
    name: 'blackbox-audio-transcription-mcp',
    version: '0.1.0',
  },
  {
    instructions:
      'Single speaker English transcription server. Supports file-path input and base64 audio input. Stores transcript files locally.',
  }
)

mcp.registerTool(
  'transcribe_audio',
  {
    description: 'Transcribe one single-speaker English audio file from a local path or base64 payload and store transcript files.',
    inputSchema: {
      filePath: z.string().min(1).optional(),
      audioBase64: z.string().min(1).optional(),
      fileName: z.string().min(1).optional(),
      sourceLabel: z.string().min(1).optional(),
    },
  },
  async (args) => {
    const hasFilePath = Boolean(args.filePath)
    const hasBase64 = Boolean(args.audioBase64)

    if (!hasFilePath && !hasBase64) {
      throw new Error('Provide either filePath or audioBase64.')
    }

    let audioPath = ''
    let cleanupTemp = false

    if (hasFilePath) {
      audioPath = path.resolve(args.filePath)
      await assertReadableFile(audioPath)
    } else {
      const extension = inferExtension(args.fileName)
      const tempName = `mcp-audio-${Date.now()}-${randomUUID()}${extension}`
      audioPath = path.join(os.tmpdir(), tempName)
      const bytes = Buffer.from(args.audioBase64, 'base64')
      await fsp.writeFile(audioPath, bytes)
      cleanupTemp = true
    }

    try {
      const transcriptText = await transcribe(audioPath)
      const record = await persistTranscript({
        transcriptText,
        sourceAudioPath: audioPath,
        sourceLabel: args.sourceLabel || args.fileName || path.basename(audioPath),
      })

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                ok: true,
                transcriptId: record.id,
                createdAt: record.createdAt,
                transcriptJsonFile: record.jsonFile,
                transcriptTextFile: record.textFile,
                outputDirectory: OUTPUT_DIR,
              },
              null,
              2
            ),
          },
        ],
      }
    } finally {
      if (cleanupTemp) {
        await safeUnlink(audioPath)
      }
    }
  }
)

mcp.registerTool(
  'get_transcript',
  {
    description: 'Retrieve one or more past transcripts by exact filename, transcript id, or date (YYYY-MM-DD).',
    inputSchema: {
      filename: z.string().min(1).optional(),
      transcriptId: z.string().min(1).optional(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    },
  },
  async (args) => {
    const items = await readTranscriptRecords()

    const byFilename = args.filename
      ? items.filter((item) => item.jsonFile === args.filename || item.textFile === args.filename)
      : []
    const byId = args.transcriptId ? items.filter((item) => item.id === args.transcriptId) : []
    const byDate = args.date
      ? items.filter((item) => item.createdAt && item.createdAt.startsWith(args.date))
      : []

    const merged = dedupeRecords([...byFilename, ...byId, ...byDate])

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              ok: true,
              count: merged.length,
              transcripts: merged,
            },
            null,
            2
          ),
        },
      ],
    }
  }
)

mcp.registerTool(
  'list_transcripts',
  {
    description: 'List transcript metadata from local storage with optional date filter and limit.',
    inputSchema: {
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      limit: z.number().int().min(1).max(200).default(50),
    },
  },
  async (args) => {
    const items = await readTranscriptRecords()
    let filtered = items

    if (args.date) {
      filtered = filtered.filter((item) => item.createdAt && item.createdAt.startsWith(args.date))
    }

    const sorted = filtered
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, args.limit)

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              ok: true,
              count: sorted.length,
              transcripts: sorted,
            },
            null,
            2
          ),
        },
      ],
    }
  }
)

const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: randomUUID })
await mcp.connect(transport)

app.get('/healthz', (_req, res) => {
  res.json({
    ok: true,
    name: 'blackbox-audio-transcription-mcp',
    mode: TRANSCRIBER_MODE,
    outputDirectory: OUTPUT_DIR,
  })
})

app.all('/mcp', async (req, res) => {
  await transport.handleRequest(req, res, req.body)
})

app.listen(PORT, HOST, () => {
  console.log(`[mcp] blackbox-audio-transcription-mcp listening on http://${HOST}:${PORT}`)
  console.log(`[mcp] connect Claude to: http://${HOST}:${PORT}/mcp`)
  console.log(`[mcp] transcript output dir: ${OUTPUT_DIR}`)
  if (TRANSCRIBER_MODE === 'openai' && !openai) {
    console.warn('[mcp] OPENAI_API_KEY is missing. Set it before calling transcribe_audio.')
  }
})

async function transcribe(audioPath) {
  if (TRANSCRIBER_MODE === 'local') {
    return await transcribeWithLocalWhisper(audioPath)
  }

  if (!openai) {
    throw new Error('OPENAI_API_KEY is required for TRANSCRIBER_MODE=openai.')
  }

  const response = await openai.audio.transcriptions.create({
    file: fs.createReadStream(audioPath),
    model: TRANSCRIPTION_MODEL,
    language: 'en',
    response_format: 'json',
  })

  const transcriptText = typeof response?.text === 'string' ? response.text.trim() : ''

  if (!transcriptText) {
    throw new Error('Transcription service returned an empty transcript.')
  }

  return transcriptText
}

async function transcribeWithLocalWhisper(audioPath) {
  const outputBase = path.join(os.tmpdir(), `whisper-${Date.now()}-${randomUUID()}`)
  const args = [audioPath, '--language', 'en', '--output_format', 'txt', '--output_dir', path.dirname(outputBase)]

  if (WHISPER_MODEL_PATH) {
    args.push('--model', WHISPER_MODEL_PATH)
  }

  await spawnAndWait(WHISPER_BIN, args)

  const expectedTxt = path.join(path.dirname(outputBase), `${path.parse(audioPath).name}.txt`)
  const text = await fsp.readFile(expectedTxt, 'utf8')

  if (!text.trim()) {
    throw new Error('Local whisper returned empty text output.')
  }

  return text.trim()
}

async function persistTranscript({ transcriptText, sourceAudioPath, sourceLabel }) {
  const createdAt = new Date().toISOString()
  const id = `${createdAt.slice(0, 10)}-${randomUUID()}`

  const jsonFile = `${id}.json`
  const textFile = `${id}.txt`

  const jsonPath = path.join(OUTPUT_DIR, jsonFile)
  const textPath = path.join(OUTPUT_DIR, textFile)

  const record = {
    id,
    createdAt,
    language: 'en',
    speakerMode: 'single',
    sourceLabel,
    sourceAudioPath,
    transcript: transcriptText,
    jsonFile,
    textFile,
  }

  await fsp.writeFile(jsonPath, `${JSON.stringify(record, null, 2)}\n`, 'utf8')
  await fsp.writeFile(textPath, `${transcriptText}\n`, 'utf8')

  return record
}

async function readTranscriptRecords() {
  await ensureDir(OUTPUT_DIR)
  const files = await fsp.readdir(OUTPUT_DIR)
  const jsonFiles = files.filter((file) => file.endsWith('.json'))

  const records = []

  for (const file of jsonFiles) {
    try {
      const fullPath = path.join(OUTPUT_DIR, file)
      const raw = await fsp.readFile(fullPath, 'utf8')
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') {
        records.push(parsed)
      }
    } catch {
      // Skip malformed files to keep server resilient.
    }
  }

  return records
}

function dedupeRecords(records) {
  const seen = new Set()
  const out = []

  for (const record of records) {
    const key = record?.id || `${record?.jsonFile || ''}:${record?.createdAt || ''}`
    if (!seen.has(key)) {
      seen.add(key)
      out.push(record)
    }
  }

  return out
}

function inferExtension(fileName = '') {
  const ext = path.extname(fileName || '').toLowerCase()
  const allowed = new Set(['.wav', '.mp3', '.m4a', '.mp4', '.webm', '.ogg'])
  return allowed.has(ext) ? ext : '.wav'
}

async function assertReadableFile(filePath) {
  try {
    const stats = await fsp.stat(filePath)
    if (!stats.isFile()) {
      throw new Error('Not a file')
    }
    await fsp.access(filePath, fs.constants.R_OK)
  } catch {
    throw new Error(`Audio file is not readable: ${filePath}`)
  }
}

async function ensureDir(dirPath) {
  await fsp.mkdir(dirPath, { recursive: true })
}

async function safeUnlink(filePath) {
  try {
    await fsp.unlink(filePath)
  } catch {
    // No-op.
  }
}

async function spawnAndWait(cmd, args) {
  await new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] })

    let stderr = ''
    child.stderr.on('data', (chunk) => {
      stderr += String(chunk)
    })

    child.on('error', (error) => {
      reject(error)
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Local whisper exited with code ${code}. ${stderr}`.trim()))
      }
    })
  })
}
