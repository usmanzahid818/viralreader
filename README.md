# ViralReader

ViralReader is a React + Vite creator research dashboard backed by an Express API. The backend serves the production frontend and keeps Gemini/YouTube API keys server-side.

## Requirements
- Node.js 22 (Node 22.12+ recommended for Vite 8)
- npm
- Optional: Google Gemini API key and YouTube Data API v3 key

## Run locally
1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and add keys if available.
3. Start the combined Express + Vite development server: `npm run dev`
4. Open `http://localhost:3000`.

Without API keys, some AI/data features may show demo/fallback results. Do not put private API keys in frontend code or commit a real `.env` file.

## Production build and start
```sh
npm install
npm run lint
npm run build
NODE_ENV=production npm start
```
The server serves `dist/` and API routes from the same origin.

## Deploy to Render
A `render.yaml` blueprint is included.
1. Push this repository to GitHub.
2. In Render, create a new Blueprint and select this repository.
3. Add `GEMINI_API_KEY` and `YOUTUBE_API_KEY` as secret environment variables in Render (optional, but needed for live AI/YouTube functionality).
4. Wait for the deploy, then open the generated `onrender.com` URL.
5. Verify `/api/health` returns JSON and the home page loads.

The included GitHub Actions workflow runs TypeScript checks and a production build on pushes and pull requests. A green workflow is required before considering the build verified.

## Current limitations / release checklist
- Real AI calls require a valid server-side `GEMINI_API_KEY`.
- Live YouTube data requires a valid server-side `YOUTUBE_API_KEY`; quota limits are controlled by Google.
- User records are stored in a local JSON file. This is suitable only for a prototype/single instance: use persistent disk or migrate to a managed database before production scale. Confirm persistence and backups on the chosen host.
- Payment checkout is not enabled by this repository configuration. Do not advertise paid plans as purchasable until a supported payment provider, webhook verification, subscription state updates, and test transactions are implemented.
- Before public launch, test signup/login/logout, password reset, admin permissions, mobile layouts, API error states, quota handling, and saved content persistence.
- Do not commit credentials, user data, or production database files.
