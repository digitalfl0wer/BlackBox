# Black Boxx
### Product Requirements Document — Hackathon Build
**Event:** Blackathon 2026 | **Track:** AI for Coding | **Deadline:** Sat April 25, 10:00 AM PT

---

## 1. North Star

> Black Boxx helps you preserve the truth, understand the pattern, and reach support — without being left alone after something unsafe happens.

Named after the flight recorder: built to survive pressure, built to tell the truth afterward.

---

## 2. Problem

When something unsafe happens — a police encounter, harassment, coercion, a moment of danger — people have to survive first and process later. By then:

- Details blur
- Evidence goes undocumented
- Support feels out of reach
- The person is alone with chaos

For Black communities navigating systems that may not protect them, this is compounded. Black Boxx closes that gap.

---

## 3. Track Fit — AI for Coding

Black Boxx uses AI not as decoration, but as the core product experience:

- An **OrchestratorAgent** receives session data and routes it to specialized sub-agents
- A **KeywordAgent** scans transcripts and notes for safety signals using rule-based detection + LLM analysis
- A **ReflectionAgent** generates a structured, trauma-aware plain-language analysis of what happened
- A **ResourceAgent** matches concern categories to relevant support organizations and next steps
- All agents return structured JSON that drives the UI — no generic chat, no freeform dumps

The user never "talks to an AI." The AI organizes what happened and connects them to support.

---

## 4. Core Product Language

| Feature | Product Name |
|---|---|
| Recording mode | Black Boxx Session |
| Trusted contacts | Kinfolk |
| Alert action | Send Signal |
| Incident log | Private Timeline |
| AI analysis | AI Reflection |
| Resources | Support Options |
| Quick exit | Discreet |
| Saved record | Box Record |

**Never use:** Panic Mode, Emergency Contact, Abuse Report, Evidence Vault, AI Diagnosis, Victim Resources, Quick Exit — anything that escalates danger if seen on screen.

---

## 5. Agent Architecture

```
User Input (notes + tags + session metadata)
          │
          ▼
  React App (browser)
  POST /api/reflect
          │
          ▼  (server-side — key never exposed to browser)
┌─────────────────────────────┐
│       api/reflect.js        │  ← Vercel Serverless Function (Node.js)
│      OrchestratorAgent      │  ← entry point, routes + assembles
└──────────┬──────────────────┘
           │
     sequential calls
           │
    ┌──────▼───────┐
    │ KeywordAgent │  gpt-4o-mini
    │ rule-based + │  → categories + flaggedPhrases
    │ LLM validate │    + requiresImmediateSignal
    └──────┬───────┘
           │
    ┌──────▼────────┐
    │ ResourceAgent │  gpt-4o-mini
    │ selects from  │  → 3–4 curated orgs
    │ static list   │    matched to categories
    └──────┬────────┘
           │
    ┌──────▼──────────┐
    │ ReflectionAgent │  gpt-4o
    │ full context in │  → AIReflection JSON
    │ structured JSON │    (8 sections)
    └──────┬──────────┘
           │
           ▼
  JSON response to React app
  → ReflectionView renders
```

### Agent Roles

#### OrchestratorAgent (`api/reflect.js`)
- **Model:** `gpt-4o`
- **Role:** Entry point of the serverless function. Receives raw session payload. Calls sub-agents sequentially (KeywordAgent → ResourceAgent → ReflectionAgent). Assembles and validates the final structured response. Returns a safe fallback if any sub-agent fails — never propagates a crash to the user.
- **Guardrail:** `buildFallbackReflection()` always returns a valid `AIReflection` object. A broken pipeline never shows a blank screen.

#### KeywordAgent
- **Model:** `gpt-4o-mini`
- **Role:** Two-pass detection. Pass 1 is rule-based (phrase list from `src/agents/keywords.js`) — zero latency, no API call. Pass 2 sends flagged text to the LLM to validate signals and assign concern category + urgency level.
- **Returns:** `{ categories, flaggedPhrases: [{ phrase, category, urgency }], requiresImmediateSignal }`
- **Guardrail:** Never labels a situation as confirmed harm. Uses "possible," "may suggest," "worth reviewing."

#### ResourceAgent
- **Model:** `gpt-4o-mini`
- **Role:** Receives concern categories from KeywordAgent. Selects 3–4 most relevant resources from the pre-curated static list in `src/data/resources.js`. Agent selects only — it never generates organization names. This prevents hallucination entirely.
- **Returns:** `{ resources: [{ name, category, description, url }] }`

#### ReflectionAgent
- **Model:** `gpt-4o`
- **Role:** The synthesis agent. Receives notes, tags, keyword flags, and matched resources. Generates the full structured AI Reflection JSON with all 8 sections.
- **System prompt:** Trauma-aware, culturally respectful, plain language. Explicitly not a lawyer, therapist, investigator, or judge.
- **Returns:** Full `AIReflection` object (8 sections — see §8 Data Model)
- **Guardrail:** Explicit prohibition on legal conclusions, diagnostic language, pressure to report, or generic affirmations like "stay strong."

---

## 6. API Layer — Vercel Serverless Functions (Option A)

### Why server-side agents, not client-side

The OpenAI API key must never be exposed in the browser bundle. `VITE_`-prefixed env vars are injected into the client at build time — anyone can open DevTools and extract the key from a client-side call. The serverless function keeps the key in Vercel's server environment only.

One endpoint. All agents run inside it. The React app POSTs session data and receives reflection JSON — it never imports or calls the OpenAI SDK directly.

### File layout

```
black-box/
├── api/
│   └── reflect.js          ← Vercel serverless function
│                               imports agent modules from src/agents/
├── src/
│   ├── agents/
│   │   ├── orchestrator.js      ← client-side: fetch('/api/reflect') + fallback
│   │   ├── keywordAgent.js      ← server-side: imported by api/reflect.js
│   │   ├── resourceAgent.js     ← server-side: imported by api/reflect.js
│   │   ├── reflectionAgent.js   ← server-side: imported by api/reflect.js
│   │   ├── fallback.js          ← shared: used by both api/ and orchestrator.js
│   │   └── keywords.js          ← phrase lists, imported by keywordAgent.js
│   └── ...
├── .env.local              ← OPENAI_API_KEY=sk-... (no VITE_ prefix)
└── vercel.json             ← REQUIRED: sets Node 20 runtime for ESM compatibility
```

> **Why `vercel.json` is required — ESM/CJS conflict:** Vite scaffolds with `"type": "module"`
> in `package.json`, making the entire project ESM. Vercel's Node runtime defaults to CommonJS
> for serverless functions unless explicitly told otherwise. Without `vercel.json`, the `import`
> statements in `api/reflect.js` throw a runtime error on deploy even though they work fine
> locally with `vercel dev`. The fix is a one-time 3-line config:
> ```json
> {
>   "functions": {
>     "api/reflect.js": { "runtime": "nodejs20.x" }
>   }
> }
> ```

### Environment variables

| Variable | Location | Notes |
|---|---|---|
| `OPENAI_API_KEY` | `.env.local` + Vercel dashboard | No `VITE_` prefix — server only |

Never use `VITE_OPENAI_API_KEY`. The `VITE_` prefix intentionally exposes vars to the browser.

### The serverless endpoint

```javascript
// api/reflect.js
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

  const { sessionPayload } = req.body

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
    console.error('Agent pipeline error:', error)
    return res.status(200).json(buildFallbackReflection(sessionPayload))
  }
}
```

### How the React app calls it

```javascript
// src/agents/orchestrator.js — client-side only
import { buildFallbackReflection } from './fallback.js'

export async function runAgentPipeline(sessionPayload) {
  try {
    // Strip audioUrl before sending — base64 audio blobs are 1–2MB and the agents
    // never use the audio server-side (they only read notes + scenarioTags).
    // Sending it risks hitting Vercel's 4.5MB request body limit and wastes bandwidth.
    // The audioUrl stays in localStorage for the user's own record.
    const { audioUrl, ...safePayload } = sessionPayload

    const response = await fetch('/api/reflect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionPayload: safePayload })
    })
    if (!response.ok) throw new Error('Pipeline request failed')
    return await response.json()
  } catch (error) {
    console.error('Orchestrator error:', error)
    return buildFallbackReflection(sessionPayload)
  }
}
```

### Local development

Use `vercel dev` — not `npm run dev`. This serves both the React app and `api/` together on `localhost:3000`.

```bash
npm install -g vercel
vercel login        # authenticate first — opens browser or prompts email
vercel link         # links this folder to a Vercel project (creates one if needed)
vercel dev          # now works cleanly without interactive prompts
```

> **Why `vercel login` + `vercel link` must come first:** The first time `vercel dev` runs on a
> new machine or project, it blocks on an interactive authentication and project-linking flow.
> Running these two setup commands upfront means `vercel dev` works immediately when you need it
> mid-build — no unexpected auth wall at 11 PM.

Set up `vercel dev` on day one. Don't wait until deployment to discover the `api/` folder doesn't work with Vite's dev server.

### Deployment

```bash
vercel --prod
```

Add `OPENAI_API_KEY` in Vercel → Project → Settings → Environment Variables before first deploy. The key never touches source control.

---

## 7. MVP Feature Set

### F1 — Welcome + Kinfolk Setup
- User sets display name, state, Kinfolk name + contact
- Stored in `localStorage`
- Consent/awareness acknowledgment required before proceeding

### F2 — Start Black Boxx Session
- Single tap → recording begins immediately (before overlay)
- Timer starts, timestamp saved, optional location captured
- `MediaRecorder` API via custom `useRecorder` hook

### F3 — Recording Awareness Overlay
- Appears 1 second after recording starts
- Dismissible after 5 seconds
- Recording continues underneath
- Plain-language copy about recording laws + AI limits

### F4 — Send Signal
- Generates alert message: name + timestamp + location + "Please check on me"
- MVP: simulated with toast confirmation + preview of what would be sent
- Stretch: real email via Resend API

### F5 — Discreet Mode
- Tapping "Discreet" replaces UI with neutral "Daily Notes" screen
- Recording continues via `SessionProvider` above UI layer
- Return: triple-tap on "Daily Notes" title
- No visible safety language on Discreet screen

### F6 — End Session + Save
- Recording stops, audio blob saved to `localStorage` as base64
- User adds: title, scenario tags, notes
- Save triggers agent pipeline

### F7 — Agent Pipeline (AI Reflection)
- On save: session payload POSTed to `/api/reflect`
- Server runs: KeywordAgent → ResourceAgent → ReflectionAgent sequentially
- Loading state shown during processing with per-step progress
- Fallback reflection always returned if pipeline errors

### F8 — Reflection Screen
- Displays all 8 structured sections
- Visible guardrail block on every view (no fine print)
- Affirming message rendered last, prominently
- Support resources linked by category

### F9 — Private Timeline
- List of saved Box Records
- Each shows: title, date, tags, signal status, link to reflection
- MVP: single session (no full list required for demo)

---

## 8. Data Model

```typescript
// Session payload — sent from React app to POST /api/reflect
interface SessionPayload {
  id: string
  userId: string
  displayName: string
  state: string
  startedAt: string
  endedAt: string
  duration: number
  location?: { lat: number; lng: number; label: string }
  audioUrl?: string         // base64 blob URL (stored client-side only)
  notes: string             // user-typed notes
  scenarioTags: ScenarioTag[]
  signalSent: boolean
  signalSentAt?: string
}

type ScenarioTag =
  | 'Police Encounter'
  | 'Workplace Concern'
  | 'Relationship Safety'
  | 'Boundary / Consent Concern'
  | 'Public Harassment'
  | 'Stalking / Unwanted Contact'
  | 'Digital Safety'
  | 'Exploitation / Restricted Movement'
  | 'Medical Concern'
  | 'Other'

// KeywordAgent output — internal to api/reflect.js
interface KeywordAnalysis {
  categories: string[]
  flaggedPhrases: {
    phrase: string
    category: string
    urgency: 'immediate' | 'elevated' | 'informational'
  }[]
  requiresImmediateSignal: boolean
}

// ResourceAgent output — internal to api/reflect.js
interface ResourceMatch {
  resources: {
    name: string
    category: string
    description: string
    url: string
  }[]
}

// AIReflection — returned from /api/reflect to React app
interface AIReflection {
  summary: string
  timeline: { time: string; event: string }[]
  concernAreas: string[]
  whyFlagged: { area: string; reason: string; phrases: string[] }[]
  whatThisDoesNotMean: string
  nextSteps: string[]
  supportOptions: ResourceMatch['resources']
  affirmingMessage: string
}
```

---

## 9. Technical Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | React 18 + Vite | Fast setup, component state, demo-ready |
| Styling | Tailwind CSS | Mobile-first utility classes, fast iteration |
| State | React Context (SessionProvider) | Recording lives above UI layer — critical for Discreet |
| Storage | localStorage | Zero backend setup, works offline, hackathon-safe |
| AI | OpenAI API (`gpt-4o` + `gpt-4o-mini`) | Structured outputs, agent routing |
| API Layer | Vercel Serverless (`api/reflect.js`) | Key stays server-side, one deploy, no separate backend |
| Recording | Browser `MediaRecorder` API | No dependency, works in mobile browsers |
| Transcription | Skipped for MVP — user types notes | Removes Whisper API complexity |
| Alerts | Simulated (toast) — stretch: Resend | Don't let Twilio setup eat build time |
| Local dev | `vercel dev` | Serves React app + api/ together on localhost |
| Deployment | Vercel | One command, free tier, live demo URL |

---

## 10. App Architecture (File Structure)

```
black-box/
├── api/
│   └── reflect.js                # Vercel serverless — agent pipeline entry point
│
├── .env.local                    # OPENAI_API_KEY=sk-... (no VITE_ prefix)
├── vercel.json                   # REQUIRED: Node 20 runtime for ESM — see §6
│
├── src/
│   ├── main.jsx
│   ├── App.jsx                   # Router + SessionProvider wrapper
│   │
│   ├── context/
│   │   └── SessionContext.jsx    # Recording state, Discreet toggle, session data
│   │
│   ├── hooks/
│   │   ├── useRecorder.js        # MediaRecorder abstraction (with iOS Safari format fix)
│   │   └── useKeyboard.js        # Triple-tap Discreet return handler
│   │
│   ├── agents/
│   │   ├── orchestrator.js       # Client: fetch('/api/reflect'), strips audioUrl, fallback
│   │   ├── keywordAgent.js       # Server: rule-based + LLM validation
│   │   ├── resourceAgent.js      # Server: category → curated resources
│   │   ├── reflectionAgent.js    # Server: final structured reflection
│   │   ├── fallback.js           # Shared: buildFallbackReflection() — client + server
│   │   └── keywords.js           # Phrase lists by category
│   │
│   ├── screens/
│   │   ├── Welcome.jsx
│   │   ├── KinfolkSetup.jsx
│   │   ├── Home.jsx
│   │   ├── ActiveSession.jsx
│   │   ├── Discreet.jsx
│   │   ├── EndSession.jsx
│   │   ├── ReflectionLoading.jsx # Guards: redirects to /home if currentSession is null
│   │   ├── ReflectionView.jsx    # Guards: redirects to /home if reflection is null
│   │   └── Timeline.jsx
│   │
│   ├── components/
│   │   ├── RecordingBar.jsx
│   │   ├── SignalButton.jsx
│   │   ├── TagPicker.jsx
│   │   ├── Guardrail.jsx
│   │   ├── AffirmingMessage.jsx
│   │   └── ResourceCard.jsx
│   │
│   └── data/
│       └── resources.js          # Curated resource list by category
```

---

## 11. Guardrail Requirements

These are non-negotiable — visible on every relevant screen, never in fine print:

```
This app is for personal safety documentation and education.
It does not provide legal advice.

Recording laws vary by state. If you plan to use a recording
later, double-check your local laws or speak with a qualified
legal advocate.

AI can make mistakes. Review all summaries, concern areas,
and resources before relying on them.

Possible concern areas are not legal conclusions.
```

---

## 12. Demo Flow (Judges see this in under 3 minutes)

1. Open app → Welcome screen
2. Set up Kinfolk (name + contact)
3. Tap "Start Black Boxx Session" → recording begins, overlay appears
4. Tap "Send Signal" → toast shows simulated alert preview
5. Tap "Discreet" → Daily Notes screen, recording continues
6. Triple-tap title → return to session
7. Tap "End Session" → notes + tags form
8. Save → POST to `/api/reflect`, agent pipeline runs with per-step loading state
9. AI Reflection loads → summary, concern areas, next steps, resources, affirming message
10. Guardrail block visible throughout

---

## 13. Out of Scope (V2)

- Real SMS / Twilio
- Audio transcription (Whisper)
- Supabase / cloud storage
- File hashing / tamper evidence
- Photo upload
- Location-specific resource matching
- Voice command launch
- Encrypted storage
- Native mobile app
- Teen mode / disguised icon