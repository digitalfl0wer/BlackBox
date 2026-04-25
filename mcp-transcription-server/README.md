# Black Box Audio MCP Server

Local Node.js MCP server for audio transcription.

## MVP scope
- Single-speaker audio
- English-only transcription (`language: en`)
- File-based input (`filePath`) plus optional base64 payload input (`audioBase64`)
- Flat-file local storage (`.json` + `.txt` per transcript)
- Retrieval by filename or date

## Run

1. Install dependencies:
```bash
cd mcp-transcription-server
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# then set OPENAI_API_KEY in .env
```

3. Start:
```bash
node index.js
# or
npm run start
```

Server defaults:
- `http://127.0.0.1:3333/sse` (MCP SSE endpoint)
- `http://127.0.0.1:3333/messages` (MCP message endpoint)
- `http://127.0.0.1:3333/healthz` (health)

## Claude MCP registration (local URL)

Add a custom MCP server entry in Claude settings using:
- URL: `http://127.0.0.1:3333/sse`

If your Claude client requires a JSON config format, use the local URL transport entry it expects and point it to `/sse`.

## Tools

### `transcribe_audio`
Input:
- `filePath` (string, optional)
- `audioBase64` (string, optional)
- `fileName` (string, optional, helps extension inference)
- `sourceLabel` (string, optional)

Behavior:
- Sends audio to OpenAI transcription API by default.
- Writes two files to `TRANSCRIPT_OUTPUT_DIR`:
  - `<id>.json` (full metadata + transcript)
  - `<id>.txt` (plain transcript text)

### `get_transcript`
Input:
- `filename` (string, optional)
- `transcriptId` (string, optional)
- `date` (string `YYYY-MM-DD`, optional)

Behavior:
- Returns matching transcript records from local storage.

### `list_transcripts`
Input:
- `date` (string `YYYY-MM-DD`, optional)
- `limit` (int, optional, default 50)

Behavior:
- Returns recent transcript metadata records.

## Config

Environment variables:
- `OPENAI_API_KEY` (required for `TRANSCRIBER_MODE=openai`)
- `MCP_HOST` (default `127.0.0.1`)
- `MCP_PORT` (default `3333`)
- `TRANSCRIPT_OUTPUT_DIR` (default `./transcripts`)
- `TRANSCRIBER_MODE` (`openai` or `local`, default `openai`)
- `TRANSCRIPTION_MODEL` (default `whisper-1`)
- `WHISPER_BIN` (default `whisper`, for local mode)
- `WHISPER_MODEL_PATH` (optional, for local mode)

## Notes
- This server stores transcripts as plain files and does not include encryption-at-rest.
- For hackathon MVP, keep the output directory on trusted local disk only.
