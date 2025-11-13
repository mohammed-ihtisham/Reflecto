## Reflecto — Multimodal Journaling Companion

Reflecto is a multimodal journaling companion that blends dialogue, emotion, and imagery to help users debrief, gain perspective, and develop emotional awareness.

Each conversation ends with a comic‑style “snapshot of the day,” a visual narrative of moods and moments that you can revisit later.

## Why this project

- **Emotional reflection**: Guided conversations that adapt tone and prompts to how you feel.
- **Memory cues**: A lightweight visual summary helps anchor the day for future recall.
- **Portfolio value**: Demonstrates multi‑agent orchestration, prompt design, and modern UI implementation.

## Key features

- **Conversational journaling**: A responsive chat that encourages deeper reflection.
- **Tone and framing**: Simple agent/orchestrator pattern modulates style and goals per context.
- **Snapshot of the day**: Comic‑style grid that encapsulates the session’s moods and highlights.
- **Modern UI**: Layered dark gradient, glass surfaces, soft shadows, and micro‑animations.
- **SvelteKit app**: Fast, minimal, component‑driven implementation.

## How it works

1. User submits a message in the journal input.
2. The server endpoint (`src/routes/api/chat/+server.js`) processes the chat history.
3. An orchestrator coordinates one or more agents (`src/lib/orchestrators/*`, `src/lib/agents/*`), generating an assistant reply via the Gemini API wrapper (`src/lib/gemini.js`).
4. The UI renders the assistant message and updates the right‑side “Snapshot” panel to reflect the session’s themes.

## Tech stack

- **Framework**: SvelteKit + Vite
- **UI**: Tailwind CSS (CDN)
- **AI**: Google Gemini (via simple server wrapper)
- **Language**: TypeScript‑friendly Svelte project structure

## Project structure

```text
src/
  lib/
    agents/               # Agent behaviors and styles of response
    orchestrators/        # Orchestrates multiple agents
    components/
      journal/            # Chat UI (header, panel, bubble, input)
      snapshot/           # Snapshot-of-the-day panel
      layout/             # App shell & layout
    gemini.js             # Gemini client wrapper
  routes/
    api/chat/+server.js   # Chat API endpoint
    +page.svelte          # Main page wiring components together
```

## Run locally

Requirements:
- Node.js 20+
- npm

Setup:

```bash
git clone <your-repo-url>
cd Reflecto
npm install
cp .env.example .env   # create if missing
```

Environment variables (`.env`):

```env
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

Start dev server:

```bash
npm run dev
```

Then open `http://localhost:5173`.

## Deploy

Vercel works well for SvelteKit:
- Add `GEMINI_API_KEY` and `GEMINI_MODEL` in Vercel → Project Settings → Environment Variables.
- Deploy from your GitHub repo.
- Never commit secrets; `.env` is ignored by default.

## Customization

- **Conversation behavior**: Tweak or add agents in `src/lib/agents/*` and orchestration logic in `src/lib/orchestrators/*`.
- **UI look and feel**: Update layout (`src/lib/components/layout/AppShell.svelte`) and journal/snapshot components in `src/lib/components/*`.
- **Model settings**: Adjust `GEMINI_MODEL` or sampling params inside `src/lib/gemini.js`.

## Screenshots (suggested)

- Chat flow — empathic prompts and responses
- Snapshot of the day — comic‑style grid
- Light/hover states — subtle motion and depth

Add images to `docs/` and reference them here.

## Roadmap

- Richer snapshot generation (emoji/keyword tiles, captions, export)
- Optional voice and image inputs
- Local/session storage for journaling history
- Calendar view of past snapshots

## Notes on safety and ethics

- The assistant is a journaling companion, not a clinician.
- Encourage seeking professional help for crises; avoid diagnostic language.
- Do not log sensitive data by default; be mindful of storage and telemetry choices.

## Credits

- Built with SvelteKit and Tailwind CSS
- Uses Gemini via the Google AI API ([Google AI Studio](https://aistudio.google.com))
