# Black Box — Agentic Task List
**Hackathon Build | Solo | Deadline: Sat April 25, 10:00 AM PT**

Work top to bottom. Do not skip ahead. Each task has a clear done condition.
Check off each task as you complete it. Estimated total: ~18–20 focused hours.

Global Rules to follow (apply before coding):
1. Review the current codebase first:
- Read PRD.md and tasks.md.
- Inspect existing files in your scope and identify what is already done vs missing.
- Do not assume unchecked tasks are incomplete; verify in code.

2. Task tracking discipline:
- Only check off tasks in tasks.md that you personally verified in code and/or runtime.
- Only check off tasks in your assigned scope.
- If a task is partially done, leave it unchecked and add a short note in your handoff.
- If you find a checked task is broken, uncheck it and report why.

3. Proof required for each checkbox:
- Reference changed file paths and a quick validation note (build/run/manual test).

4. Collaboration safety:
- You are not alone in the codebase. Do not revert others' edits.
- Make minimal edits outside your scope only if required for integration, and explain them.

5. Deliverables in final handoff:
- Tasks checked (exact task IDs)
- Tasks still open (exact task IDs)
- Files changed
- Risks/blockers


---

## PHASE 0 — Setup (Est. 30 min)

### T-00 · Scaffold the project
- [x] Run scaffold commands:
  ```bash
  npm create vite@latest black-box -- --template react
  cd black-box
  npm install
  npm install tailwindcss @tailwindcss/vite react-router-dom openai
  npm install -g vercel
  ```
- [x] Init Tailwind: `npx tailwindcss init`
- [x] Configure `vite.config.js` to include Tailwind plugin
- [x] Create `.env.local` with `OPENAI_API_KEY=` (no `VITE_` prefix)
- [x] Delete boilerplate (`App.css`, `logo.svg`, default content in `App.jsx`)
- [x] Create folder structure:
  ```
  api/
  src/agents/
  src/screens/
  src/components/
  src/context/
  src/hooks/
  src/data/
  ```

- [x] **[FIX — ESM/CJS crash on Vercel]** Vite scaffolds with `"type": "module"` in `package.json`.
  Vercel's Node runtime defaults to CommonJS for serverless functions, which causes `import` statements
  in `api/reflect.js` to throw a runtime error on deploy. Fix this now before writing any agent code:

  Add `vercel.json` at the project root:
  ```json
  {
    "functions": {
      "api/reflect.js": {
        "runtime": "nodejs20.x"
      }
    }
  }
  ```

  Confirm `package.json` already has `"type": "module"` (Vite adds it by default). If it does,
  the combination of `"type": "module"` + Node 20 runtime tells Vercel to treat `api/reflect.js`
  as ESM. Without this, `import OpenAI from 'openai'` in the serverless function crashes at runtime
  even though it works fine locally with `vercel dev`.

- [x] **[FIX — vercel dev requires auth before it works]** `vercel dev` will block on an interactive
  login prompt the first time it runs on a new machine. Do this before you need it mid-build:
  ```bash
  vercel login        # authenticate — opens browser or prompts email
  vercel link         # links this folder to a Vercel project (creates one if needed)
  vercel dev          # now works cleanly without prompts
  ```
  Skipping `vercel login` + `vercel link` means hitting an unexpected auth wall at 11 PM
  when your build momentum is running. Do it now.

- [x] Confirm `vercel dev` serves the React app at `localhost:3000` with no console errors

**Done when:** `vercel dev` serves a blank React app at localhost:3000 with no errors. `vercel.json` present at root.

---

### T-01 · Define global design tokens
- [x] Extend `tailwind.config.js` with Black Box color palette:
  - Deep black: `#0A0A0A`
  - Off-white: `#F5F0EB`
  - Warm amber: `#C8933A`
  - Muted sage: `#6B7B6E`
  - Alert red: `#C0392B` (use sparingly)
- [x] Load `DM Sans` via Google Fonts in `index.html`
- [x] Set `font-family` globally in `index.css`
- [x] Set body background to deep black in `index.css`
- [x] Confirm custom color classes work in a test `<div>`

**Done when:** Custom color classes render correctly and body background is set.

---

## PHASE 1 — Session State Foundation (Est. 1.5 hrs)

### T-10 · Build `useRecorder` hook
File: `src/hooks/useRecorder.js`

- [x] Request `getUserMedia({ audio: true })`
- [x] **[FIX — iOS Safari MediaRecorder format mismatch]** `MediaRecorder` on iOS Safari only supports
  `audio/mp4`, not `audio/webm` (Chrome/Android default). Passing no mimeType or the wrong type causes
  recording to fail silently or throw on iPhone. Detect the supported format before initializing:
  ```javascript
  const mimeType = MediaRecorder.isTypeSupported('audio/webm')
    ? 'audio/webm'
    : MediaRecorder.isTypeSupported('audio/mp4')
      ? 'audio/mp4'
      : ''
  const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {})
  ```
  This ensures recording works on any browser a judge might use — Chrome, Firefox, Safari, Android.
- [x] Initialize `MediaRecorder` on permission grant using the format check above
- [x] `startRecording()` — begins recording, collects chunks via `ondataavailable`
- [x] `stopRecording()` — assembles chunks into audio `Blob`, returns it
- [x] Expose `recordingState`: `'idle' | 'recording' | 'stopped'`
- [x] Expose `elapsedSeconds` — increments via `setInterval` while recording
- [x] Handle mic permission denied gracefully — set error state, never throw to UI
- [ ] Test: button starts/stops recording and logs blob to console

**Done when:** Start/stop recording works and audio blob is logged to console. Test in both Chrome and Safari if possible.

---

### T-11 · Build `SessionContext`
File: `src/context/SessionContext.jsx`

- [x] Define state shape:
  ```javascript
  {
    isRecording: false,
    isDiscreet: false,
    sessionId: null,
    startedAt: null,
    signalSent: false,
    signalSentAt: null,
    currentSession: null,
    reflection: null,
  }
  ```
- [x] Implement `startSession()` — sets `isRecording: true`, generates `sessionId` (uuid or Date.now()), sets `startedAt`
- [x] Implement `endSession()` — sets `isRecording: false`
- [x] Implement `enterDiscreet()` — sets `isDiscreet: true`
- [x] Implement `exitDiscreet()` — sets `isDiscreet: false`
- [x] Implement `sendSignal()` — sets `signalSent: true`, `signalSentAt`
- [x] Implement `saveSession(payload)` — writes to `localStorage` key `blackbox_sessions`
- [x] Implement `setReflection(data)` — stores completed reflection in state + localStorage
- [x] Wrap `App.jsx` in `<SessionProvider>`
- [x] Confirm context values persist across route changes

**Done when:** Context values accessible from any component, survive navigation.

---

### T-12 · Set up React Router
File: `src/App.jsx`

- [x] Install and configure `BrowserRouter`
- [x] Define routes:
  ```
  /           → Welcome
  /setup      → KinfolkSetup
  /home       → Home
  /session    → ActiveSession
  /end        → EndSession
  /reflecting → ReflectionLoading
  /reflection → ReflectionView
  /timeline   → Timeline
  ```
- [x] Create `<ProtectedRoute>` — redirects to `/setup` if `blackbox_kinfolk` not in localStorage
- [x] Protect: `/home`, `/session`, `/end`, `/reflecting`, `/reflection`, `/timeline`
- [ ] Confirm all routes navigate without console errors

**Done when:** All routes navigate correctly. Missing Kinfolk redirects to setup.

---

## PHASE 2 — Screens (Est. 4 hrs)

### T-20 · Welcome screen
File: `src/screens/Welcome.jsx`

- [x] Render app name: **Black Box**
- [x] Render tagline: *"Preserve the truth. Understand the pattern. Reach support."*
- [x] Render 2-sentence mission statement
- [x] Render disclaimer: "This app is for personal safety documentation and education. It does not provide legal advice."
- [x] Render **Get Started** button → navigates to `/setup`
- [x] Full-screen layout, centered, dark background, amber CTA
- [ ] Confirm no overflow at 390px mobile viewport

**Done when:** Screen renders correctly on 390px width, button navigates to setup.

---

### T-21 · Kinfolk Setup screen
File: `src/screens/KinfolkSetup.jsx`

- [x] Form fields: your name, your state, Kinfolk name, Kinfolk phone/email, preferred signal message (pre-filled), consent checkbox
- [x] Validate all required fields on submit
- [x] Checkbox must be checked to enable submit button
- [x] Save to `localStorage` as `blackbox_kinfolk` on submit
- [x] Navigate to `/home` on success
- [x] Confirm data persists after page refresh

**Done when:** Form saves to localStorage, checkbox blocks submission, routes to home.

---

### T-22 · Home screen
File: `src/screens/Home.jsx`

- [x] Read and display Kinfolk name from localStorage: *"Your Kinfolk: [name]"*
- [x] Render large buttons: **Start Black Box Session** (primary/amber), **Private Timeline**, **Kinfolk**, **Support Options**
- [x] All buttons route correctly
- [x] If `isRecording` is true: show pulsing dot + **Return to Session** button
- [x] Buttons are minimum 48px tap target

**Done when:** All nav buttons route. Recording indicator shows when session active.

---

### T-23 · Active Session screen
File: `src/screens/ActiveSession.jsx`

- [x] On mount: call `startSession()` → triggers `useRecorder.startRecording()`
- [x] Display MM:SS timer, updates every second
- [x] Show pulsing recording indicator
- [ ] **Send Signal** button → calls `sendSignal()`, triggers `SignalButton` modal
- [x] **Discreet** button → calls `enterDiscreet()`
- [x] **End Session** button → calls `endSession()`, navigates to `/end`
- [ ] `RecordingAwarenessOverlay` renders 1 second after mount
- [x] Discreet overlay renders on top when `isDiscreet === true` — recording does NOT stop
- [x] Confirm recording continues across Discreet toggle

**Done when:** Timer counts, recording starts on mount, all 3 buttons work, recording survives Discreet.

---

### T-24 · End Session + Save screen
File: `src/screens/EndSession.jsx`

- [x] Display session metadata: start time, duration, signal sent status
- [x] Title field (required)
- [ ] `<TagPicker />` component (multi-select)
- [x] Notes textarea with placeholder copy
- [x] **Save & Generate Reflection** button
- [x] On save: construct `SessionPayload` from context + form values
- [x] Call `saveSession(payload)` then navigate to `/reflecting`
- [x] Block save if title is empty

**Done when:** Form constructs correct payload, saves to localStorage, navigates to loading screen.

---

### T-25 · Reflection Loading screen
File: `src/screens/ReflectionLoading.jsx`

- [x] **[FIX — null session crash on direct navigation]** If `currentSession` is null (e.g. direct
  navigation to `/reflecting` or a page refresh), calling `runAgentPipeline(null)` will throw or
  return a meaningless fallback with no user data. Guard at the top of the component:
  ```javascript
  const { currentSession } = useSession()
  if (!currentSession) return <Navigate to="/home" replace />
  ```
- [x] On mount: call `runAgentPipeline(currentSession)` from `orchestrator.js`
- [x] Show step progress as each agent completes:
  - "Analyzing your session..."
  - "Finding relevant support..."
  - "Generating your reflection..."
  - "Almost ready..."
- [x] Show copy: "This may take 15–30 seconds."
- [x] On pipeline success: call `setReflection(data)`, navigate to `/reflection`
- [x] On pipeline failure: show error notice + retry button — never a blank screen

**Done when:** Pipeline fires on mount, progress steps update, routes to reflection on success, error handled gracefully. Direct navigation with no session redirects to `/home`.

---

### T-26 · Reflection View screen
File: `src/screens/ReflectionView.jsx`

- [x] **[FIX — null reflection crash on direct navigation]** If a judge or tester navigates directly
  to `/reflection` without a completed pipeline, `reflection` is `null` and every `.map()` and
  property access throws immediately. The `ProtectedRoute` only guards against missing Kinfolk —
  it does not guard against missing reflection data. Add a null guard at the top of the component:
  ```javascript
  const { reflection } = useSession()
  if (!reflection) return <Navigate to="/home" replace />
  ```
  This also protects against browser refresh on the reflection screen mid-session,
  which clears in-memory state even if localStorage has the data. For production resilience,
  also try loading from localStorage before redirecting.
- [x] Section 1: Plain-Language Summary — paragraph
- [x] Section 2: Timeline — ordered list of `{ time, event }` items
- [x] Section 3: Possible Concern Areas — badge chips per category
- [x] Section 4: Why These Were Flagged — per area: reason + cited phrase(s)
- [ ] Section 5: What This Does Not Mean — `<Guardrail variant="reflection" />`
- [x] Section 6: Suggested Next Steps — bulleted list
- [ ] Section 7: Support Options — `<ResourceCard />` per org
- [ ] Section 8: Affirming Message — `<AffirmingMessage />` component, rendered prominently at bottom
- [ ] Guardrail block visible without scrolling past content
- [ ] All 8 sections render with real API data

**Done when:** All 8 sections render with live pipeline data. Guardrail visible. Direct navigation to `/reflection` with no data redirects to `/home` cleanly.

---

### T-27 · Timeline screen (MVP — minimal)
File: `src/screens/Timeline.jsx`

- [x] Read all sessions from `localStorage` key `blackbox_sessions`
- [x] Render list: title, date, scenario tags, signal status per session
- [x] Tap → navigate to that session's ReflectionView
- [x] Empty state: "No sessions saved yet."
- [ ] At least 1 saved session displays correctly after completing the full flow

**Done when:** Saved session appears and links to its reflection.

---

## PHASE 3 — Components (Est. 2 hrs)

### T-30 · Recording Awareness Overlay
File: `src/components/RecordingAwarenessOverlay.jsx`

- [ ] Renders as absolute-positioned overlay over ActiveSession
- [ ] Appears after 1 second delay (not blocking recording)
- [ ] "I Understand" button disabled for first 5 seconds, then enabled
- [ ] Dismiss sets local `dismissed` state — overlay disappears
- [ ] Recording indicator still visible underneath
- [ ] Copy renders at minimum 14px, not styled as fine print

**Done when:** Overlay appears after 1s, cannot be dismissed immediately, recording continues underneath.

---

### T-31 · Discreet overlay
File: `src/screens/Discreet.jsx`

- [ ] Renders as absolute overlay when `isDiscreet === true` — not a route
- [ ] Shows neutral "Daily Notes" content (see PRD §7 F5 for exact copy)
- [ ] Zero safety language visible on screen
- [ ] Triple-tap on "Daily Notes" title calls `exitDiscreet()`
  - Track tap timestamps in local ref
  - Three taps within 1.5 seconds triggers exit
- [ ] Recording continues — confirm via timer that keeps running beneath overlay
- [ ] No red X, no visible return button

**Done when:** Overlay covers session screen, recording confirmed continuing, triple-tap returns to session.

---

### T-32 · Send Signal component
File: `src/components/SignalButton.jsx`

- [ ] On tap: pull Kinfolk + session data from context
- [ ] Generate alert message:
  > "[Name] may need you. They started a Black Box Session at [time]. Please check on them. Last known location: [location or 'not shared']."
- [ ] Show full-screen preview modal with the generated message
- [ ] Confirm button → sets `signalSent: true` in context, shows success toast, closes modal
- [ ] Cancel button → closes modal, no state change
- [ ] Message preview uses actual Kinfolk name and real timestamp

**Done when:** Message preview renders with correct data, confirmation updates signal status.

---

### T-33 · TagPicker component
File: `src/components/TagPicker.jsx`

- [ ] Renders all 10 scenario tags as chip buttons:
  Police Encounter, Workplace Concern, Relationship Safety, Boundary / Consent Concern, Public Harassment, Stalking / Unwanted Contact, Digital Safety, Exploitation / Restricted Movement, Medical Concern, Other
- [ ] Multi-select: tapping toggles selected state
- [ ] Selected chips: filled amber background
- [ ] Unselected chips: outlined, muted
- [ ] Calls `onChange(selectedTags)` on each toggle
- [ ] Tags wrap correctly on 390px viewport

**Done when:** Tags toggle, selected state is correct, values passed to parent correctly.

---

### T-34 · Guardrail component
File: `src/components/Guardrail.jsx`

- [ ] Accepts `variant` prop: `'default'` | `'legal'` | `'reflection'`
- [ ] `default` — general AI disclaimer
- [ ] `legal` — recording laws copy
- [ ] `reflection` — full 4-line reflection guardrail (see PRD §11)
- [ ] Minimum 14px font — never fine print
- [ ] Left border accent in muted amber
- [ ] Renders in `EndSession` and `ReflectionView`

**Done when:** All three variants render correctly in their respective screens.

---

### T-35 · AffirmingMessage component
File: `src/components/AffirmingMessage.jsx`

- [ ] Accepts `message` prop (string from reflection)
- [ ] Warm background card — slightly off-black or amber-tinted surface
- [ ] Slightly larger text than body (18px)
- [ ] No icon, no emoji — warmth through typography and spacing only
- [ ] Renders at bottom of ReflectionView, visually distinct from surrounding sections

**Done when:** Message renders prominently with correct styling at end of ReflectionView.

---

### T-36 · ResourceCard component
File: `src/components/ResourceCard.jsx`

- [ ] Props: `{ name, category, description, url }`
- [ ] Category badge — color-coded chip
- [ ] Org name — bold, prominent
- [ ] 1-sentence description in body text
- [ ] "Visit Resource" button — opens `url` in new tab
- [ ] Renders 3+ cards correctly in ReflectionView

**Done when:** Cards render with real resource data from the pipeline.

---

## PHASE 4 — Agent Pipeline (Est. 4 hrs) ← Core technical work

### T-40 · Curated resource data
File: `src/data/resources.js`

- [x] Build static array with minimum 2–3 resources per scenario tag category
- [x] Required entries:
  - [x] National Domestic Violence Hotline (Relationship Safety)
  - [x] RAINN (Boundary / Consent Concern)
  - [x] ACLU Know Your Rights (Police Encounter)
  - [x] EEOC (Workplace Concern)
  - [x] Crisis Text Line (Immediate Safety / Medical Concern)
  - [x] Coalition Against Stalkerware (Stalking / Unwanted Contact)
  - [x] Polaris Project (Exploitation / Restricted Movement)
  - [x] NAACP Legal Defense Fund (Police Encounter / civil rights)
  - [x] Digital Defense Fund (Digital Safety)
- [x] Every scenario tag has at least 2 matched resources
- [x] Each entry has: `{ name, category, description, url }`

**Done when:** All 10 scenario tag categories have matching resources in the array.

---

### T-41 · Keyword detection (rule-based)
File: `src/agents/keywords.js`

- [x] Export `KEYWORD_CATEGORIES` object — full phrase lists for all 10 categories from the original PRD
- [x] Export `detectKeywords(text)` function:
  - [x] Lowercases input
  - [x] Scans against all phrase lists
  - [x] Returns `{ categories: string[], flaggedPhrases: { phrase, category }[] }` deduplicated
- [x] Test: `detectKeywords("i said no and i need help")` returns `['Boundary / Consent Concern', 'Immediate Safety']`

**Done when:** Function returns correct categories and phrases for a test input.

---

### T-42 · KeywordAgent
File: `src/agents/keywordAgent.js`

- [x] Accept `(sessionPayload, openai)` — openai instance passed from `api/reflect.js`
- [x] Pass 1: call `detectKeywords(sessionPayload.notes)` — rule-based, zero latency
- [x] Pass 2: send flagged phrases + notes to `gpt-4o-mini` with `response_format: { type: 'json_object' }`
- [x] System prompt: safety signal analyzer, uses "possible" / "may suggest" / "worth reviewing" only, returns structured JSON
- [x] Merge rule-based + LLM results, deduplicate categories
- [x] Return: `{ categories, flaggedPhrases: [{ phrase, category, urgency }], requiresImmediateSignal }`
- [x] If notes are empty: return empty categories, skip LLM call

**Done when:** Agent returns valid JSON with categories + flagged phrases for a test session with notes.

---

### T-43 · ResourceAgent
File: `src/agents/resourceAgent.js`

- [x] Accept `(categories, openai)` — openai instance passed from `api/reflect.js`
- [x] Import and pass `RESOURCES` array to LLM as context — agent selects from list, never generates
- [x] Call `gpt-4o-mini` with `response_format: { type: 'json_object' }`
- [x] System prompt: "Select the 3–4 most relevant resources from the provided list only. Do not add organizations not in the list."
- [x] Return: `{ resources: [...] }` — subset of the static list
- [x] If categories is empty: return 2 general safety resources as defaults

**Done when:** Agent returns 3–4 resources matched to test categories with zero hallucinated org names.

---

### T-44 · ReflectionAgent
File: `src/agents/reflectionAgent.js`

- [x] Accept `({ sessionPayload, keywordAnalysis, resources }, openai)`
- [x] Build prompt from all inputs: notes, tags, flagged phrases, resource names
- [x] Call `gpt-4o` with `response_format: { type: 'json_object' }`
- [x] System prompt (use verbatim from PRD §5):
  > "You are an AI safety reflection assistant inside Black Box. Your role is to help users organize what happened, notice possible concern areas, and connect to support. You are not a lawyer, therapist, emergency responder, investigator, or judge. Do not determine whether a crime occurred. Do not give legal advice. Do not diagnose abuse, trauma, manipulation, or mental health conditions. Do not pressure the user to report. Do not tell the user to confront the other person. Do not claim certainty. Use plain language. Use trauma-aware, culturally respectful wording. Prioritize user safety, dignity, and control."
- [x] Return schema enforced in prompt: all 8 sections of `AIReflection`
- [x] Parse and validate JSON response before returning
- [x] Throw descriptive error if response is missing required sections

**Done when:** Agent returns valid, parseable JSON with all 8 sections populated for a test session.

---

### T-45 · Fallback builder
File: `src/agents/fallback.js`

- [x] Export `buildFallbackReflection(sessionPayload)` function
- [x] Returns a valid `AIReflection` object with safe, non-alarming content
- [x] `summary`: "We weren't able to generate a full reflection for this session. Your record has been saved."
- [x] `whatThisDoesNotMean`: standard guardrail copy
- [x] `affirmingMessage`: "You took an important step by documenting this. Your record is saved. When you're ready, consider reaching out to someone you trust or a trained advocate."
- [x] `supportOptions`: 2–3 general resources from `RESOURCES`
- [x] All other fields: empty arrays or placeholder strings — no nulls
- [x] Importable from both `api/reflect.js` (server) and `src/agents/orchestrator.js` (client)

**Done when:** Function returns a complete, valid `AIReflection` object with no null fields.

---

### T-46 · Vercel Serverless Endpoint
File: `api/reflect.js`

This is the secure entry point for the entire agent pipeline. The OpenAI key lives here only.

- [x] Import `OpenAI` from `'openai'`
- [x] Import `runKeywordAgent`, `runResourceAgent`, `runReflectionAgent` from `../src/agents/`
- [x] Import `buildFallbackReflection` from `../src/agents/fallback.js`
- [x] Initialize `openai` with `process.env.OPENAI_API_KEY` (no `VITE_` prefix)
- [x] Reject non-POST requests with 405
- [x] Reject missing `sessionPayload` with 400
- [x] Run pipeline sequentially:
  ```javascript
  const keywordAnalysis = await runKeywordAgent(sessionPayload, openai)
  const resources = await runResourceAgent(keywordAnalysis.categories, openai)
  const reflection = await runReflectionAgent({ sessionPayload, keywordAnalysis, resources }, openai)
  ```
- [x] Return `res.status(200).json(reflection)` on success
- [x] Catch all errors → return `res.status(200).json(buildFallbackReflection(sessionPayload))` — never a 500 to the user

- [ ] **[FIX — smoke test the pipeline before building any UI]** Do not wire the pipeline into
  the UI until you confirm it works end-to-end from the terminal. Discovering a broken agent
  after 4 hours of screen-building is a significant time loss. Run this curl command against
  `vercel dev` immediately after writing the endpoint:
  ```bash
  curl -X POST http://localhost:3000/api/reflect \
    -H "Content-Type: application/json" \
    -d '{
      "sessionPayload": {
        "id": "smoke-001",
        "displayName": "Test",
        "state": "CA",
        "notes": "I said no and they kept pressuring me. I wanted to leave.",
        "scenarioTags": ["Boundary / Consent Concern"],
        "signalSent": false,
        "startedAt": "2026-04-25T10:00:00Z",
        "endedAt": "2026-04-25T10:05:00Z",
        "duration": 300
      }
    }'
  ```
  Expected: a JSON object with all 8 fields — `summary`, `timeline`, `concernAreas`,
  `whyFlagged`, `whatThisDoesNotMean`, `nextSteps`, `supportOptions`, `affirmingMessage`.
  If the response is malformed, missing sections, or a 500 error, fix it here before
  touching `ReflectionLoading.jsx`. A passing smoke test means the full pipeline is
  confirmed working before any UI code depends on it.

- [ ] Confirm response is a valid `AIReflection` JSON object with all 8 sections
- [ ] Confirm API key is NOT in the response or visible in browser DevTools → Sources

**Done when:** Smoke test passes in terminal. Endpoint returns valid 8-section reflection. Key confirmed server-side only.
<!-- Server-side pipeline implemented. Smoke test required with `vercel dev` + curl (needs OPENAI_API_KEY set in .env.local). -->

---

### T-47 · Client-side Orchestrator
File: `src/agents/orchestrator.js`

- [ ] Export `runAgentPipeline(sessionPayload)`
- [ ] **[FIX — audio blob must not be sent to the API]** The `SessionPayload` includes `audioUrl`
  as a base64-encoded audio blob stored in localStorage. A 30-second recording encodes to ~1–2MB.
  Vercel serverless functions have a 4.5MB request body limit, and more importantly the agents only
  use `notes` and `scenarioTags` — the audio is never read server-side. Sending it wastes bandwidth
  and risks a 413 error that kills the pipeline. Strip it before POSTing:
  ```javascript
  const { audioUrl, ...safePayload } = sessionPayload
  const response = await fetch('/api/reflect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionPayload: safePayload })
  })
  ```
  The `audioUrl` stays in localStorage for the user's own record. It never goes to the server.
- [ ] POST `safePayload` (no `audioUrl`) to `/api/reflect`
- [ ] Parse and return JSON response
- [ ] On network error or non-200 response: return `buildFallbackReflection(sessionPayload)`
- [ ] Called from `ReflectionLoading.jsx` on mount
- [ ] No OpenAI SDK imports — this file is client-side only

**Done when:** `runAgentPipeline()` called from ReflectionLoading returns real reflection data end-to-end. Confirm via Network tab in DevTools that the request body does not contain `audioUrl`.

---

## PHASE 5 — Polish (Est. 2 hrs)

### T-50 · Mobile layout audit
- [ ] Test every screen at 390px width (iPhone 14 viewport in DevTools)
- [ ] All tap targets minimum 48px height
- [ ] No horizontal overflow on any screen
- [ ] Body text minimum 16px, secondary text minimum 14px
- [ ] Add `padding-bottom: env(safe-area-inset-bottom)` to bottom-anchored elements
- [ ] Confirm full flow navigable on mobile viewport with no layout breaks

**Done when:** Complete flow navigable on 390px viewport without layout issues.

---

### T-51 · Loading and error states
- [ ] Pipeline failure → fallback reflection shown + visible error notice
- [ ] Mic permission denied → clear error message with instructions to enable
- [ ] Kinfolk not configured → redirect to `/setup` with explanation
- [ ] Test each error path by deliberately breaking the condition
- [ ] No path ends in a blank screen or unhandled JS error

**Done when:** All three error paths show handled states, not crashes.

---

### T-52 · Guardrail audit
- [ ] Recording awareness overlay renders and is readable at 390px
- [ ] Reflection guardrail block (`whatThisDoesNotMean` section) visible without scrolling past all content
- [ ] Walk every screen — confirm no prohibited language (Panic, Emergency, Evidence Vault, Victim, etc.)
- [ ] All disclaimer text minimum 14px
- [ ] No disclaimer is gray-on-gray or visually buried

**Done when:** Every screen passes guardrail check. No prohibited terms found.

---

### T-53 · README
File: `README.md`

- [ ] What Black Box is (2–3 sentences)
- [ ] The problem it solves
- [ ] Agent architecture overview: OrchestratorAgent → KeywordAgent → ResourceAgent → ReflectionAgent
- [ ] API layer explanation: `api/reflect.js` is a Vercel serverless function — OpenAI key server-side only
- [ ] How to run locally:
  ```bash
  npm install
  npm install -g vercel
  # Add OPENAI_API_KEY to .env.local
  vercel dev
  ```
- [ ] Tech stack table
- [ ] MVP scope vs V2 roadmap
- [ ] Hackathon track: AI for Coding
- [ ] Disclaimer / safety notice
- [ ] Citations: OpenAI, React, Vite, Tailwind, any open-source resources used

**Done when:** A judge can clone the repo and run the app in under 5 minutes using only the README.

---

## PHASE 6 — Submission Assets (Est. 2 hrs — do not skip)

### T-60 · Deploy to Vercel
- [ ] Add `OPENAI_API_KEY` to Vercel dashboard → Project → Settings → Environment Variables
- [ ] Run `vercel --prod`
- [ ] Open live URL in private/incognito browser
- [ ] Run full flow end-to-end on live URL: Kinfolk setup → Session → Discreet → Save → Reflection
- [ ] Confirm pipeline returns real reflection on live deploy (not just localhost)
- [ ] Confirm API key is NOT visible in browser DevTools → Sources
- [ ] Copy live URL for submission form

**Done when:** App live on Vercel, full flow works, key confirmed server-side only.

---

### T-61 · Record demo video
Platform: YouTube (unlisted) or Loom | Target: 6–7 minutes | Hard limit: 10 minutes

- [ ] You appear on camera
- [ ] Cover in order:
  - [ ] Problem statement: who this is for, what gap it closes (30 sec)
  - [ ] Agent architecture: briefly show/describe OrchestratorAgent → sub-agents (30 sec)
  - [ ] Full demo flow: Kinfolk → Session → Signal → Discreet → End → Save → Reflection loads → all 8 sections (4–5 min)
  - [ ] Highlight guardrail blocks and affirming message — judges care (30 sec)
  - [ ] Impact close: why Black communities, why now (30 sec)
- [ ] Upload video
- [ ] Test URL in private/incognito browser — confirm publicly viewable
- [ ] Confirm video is under 10 minutes

**Done when:** Video live, under 10 min, you on camera, confirmed publicly accessible.

---

### T-62 · LinkedIn announcement post
- [ ] Write post: describe Black Box, who it's for, why you built it
- [ ] Tag all four required accounts:
  - [ ] NSBE SFBA
  - [ ] Algorythm
  - [ ] BlackWPT
  - [ ] Black Women in Tech
- [ ] Include GitHub or live demo link
- [ ] Publish post — confirm it's live
- [ ] Copy post URL

**Done when:** Post live, all 4 tags confirmed, URL copied.

---

### T-63 · GitHub repository
- [ ] Confirm repo visibility is **Public**
- [ ] Push final code — all files committed
- [ ] Confirm `README.md` is present and complete
- [ ] Open repo URL while logged out of GitHub — confirm accessible
- [ ] Copy repo URL

**Done when:** Repo public, README loads, all code present, accessible logged out.

---

### T-64 · Submit
URL: **https://blackathonscorecode.vercel.app/submit**

Go slowly. You cannot edit after confirming.

- [ ] **About You:** full legal name, email, affiliated org, role, LinkedIn URL
- [ ] **Team:** solo — your info only
- [ ] **Project:**
  - [ ] Name: `Black Box`
  - [ ] Track: `AI for Coding`
  - [ ] Description (30+ chars): 2–3 sentences — problem, solution, agent architecture. Include "Black communities" and "AI Reflection."
  - [ ] Tech used: React, Vite, Tailwind CSS, OpenAI API (GPT-4o + GPT-4o-mini), Vercel Serverless Functions, Browser MediaRecorder API, localStorage
  - [ ] GitHub URL
  - [ ] Live demo URL (Vercel)
- [ ] **Demo Video:** YouTube or Loom URL
- [ ] **LinkedIn:** post URL with all 4 tags
- [ ] **Review & Submit:** read the confirmation modal carefully
- [ ] Click submit — take a screenshot of the confirmation screen

If anything needs correcting after submit: email `info@blackwpt.com` immediately.

**Done when:** Confirmation screen shown. Screenshot saved.

---

## Final Checklist

- [ ] Full flow works on mobile: Kinfolk → Session → Discreet → Save → Reflection
- [ ] Agent pipeline returns real AI Reflection with all 8 sections via `/api/reflect`
- [ ] OpenAI key confirmed server-side only — not visible in DevTools
- [ ] Guardrail blocks visible on RecordingOverlay, EndSession, ReflectionView
- [ ] No prohibited language on any screen
- [ ] Discreet mode hides safety UI, recording continues, triple-tap returns
- [ ] Send Signal shows correct Kinfolk name and timestamp
- [ ] Fallback reflection works — pipeline failure never shows blank screen
- [ ] GitHub repo is public and has complete README
- [ ] Demo video: under 10 min, on camera, publicly viewable URL confirmed
- [ ] LinkedIn post live with all 4 required tags
- [ ] Vercel deploy live and tested in private browser
- [ ] Submission form filled completely and confirmed
- [ ] Confirmation screenshot saved
