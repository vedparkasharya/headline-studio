# Headline Studio AI

A lightweight installable PWA for creating news headline overlays from screenshots. Includes 20 editorial panel styles, transparent 1080×1350 PNG export, bilingual AI copy generation, and user-triggered web research.

## Deploy on Vercel
1. Import this repository in Vercel.
2. Set **Root Directory** to `headline-studio-pwa`.
3. In Project Settings → Environment Variables, add `OPENAI_API_KEY` with your newly rotated secret key. Do not put the key in source code or commit it to GitHub.
4. Add `OPENAI_MODEL` (optional, default `gpt-4.1-mini`) and `OPENAI_RESEARCH_MODEL` (optional, default `gpt-4.1-mini`).
5. Redeploy after saving environment variables.

## Features
- Upload and preview screenshot.
- Ask the AI to extract a two-line headline, caption, description, hashtags and claims to verify.
- Research only runs when the user presses the Research button; the API uses the Responses API web-search tool.
- 20 selectable headline styles.
- Transparent 1080×1350 PNG output.
- PWA manifest and service worker.

## Safety
Never publish claims without checking source links. Research results are leads, not a guarantee. API key stays server-side in Vercel environment variables. Rotate any key previously shared in a chat.

## API routes
- `POST /api/analyze` accepts JSON `{ image: "data:image/...", language: "Hindi" }`.
- `POST /api/research` accepts JSON `{ query: "...", language: "Hindi" }`.