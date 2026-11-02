# Afterhours Case Files (AI Mystery Room)

A fictional detective game. Write a premise, review the evidence, and make one final accusation. The player API never includes the culprit or internal clue annotations before an accusation is accepted.

## Stack

- React, Vite, TypeScript, React Router, Lucide
- Express, TypeScript, Mongoose, MongoDB
- Google Gemini through the official `@google/genai` SDK
- Shared Zod contracts in `shared/`

## Run locally

1. Install Node.js 20+ and run `npm install` from the repository root.
2. Start MongoDB locally, or provide a MongoDB connection string.
3. Copy `.env.example` to `.env`. Set `MONGODB_URI`; add `GEMINI_API_KEY` for AI generated cases. Keep the key on the server.
4. Run `npm run dev`. The client runs at `http://localhost:5173`; the API runs at `http://localhost:5000`.

With `DEMO_MODE=true` (the default), the app uses a deterministic, fictional sample case when no Gemini key is configured. The sample includes labeled illustrative image evidence and a simulated CCTV viewer; it does not claim those assets are generated photographs or video. Set `DEMO_MODE=false` to require Gemini. Gemini text generation does not imply image or video generation; media-provider integration is not configured in this MVP.

## Deploy

See [DEPLOY.md](./DEPLOY.md) for a free deployment walkthrough using Render and MongoDB Atlas. The root `render.yaml` deploys the API and built React app as one service.

## Commands

- `npm run dev` — start client and server
- `npm run build` — build shared contracts, API, and client
- `npm run typecheck` — type-check all workspaces
- `npm start` — start the built API (requires MongoDB)

## API

- `GET /api/health` — server and database status
- `POST /api/cases` — validate configuration, generate, validate, and persist a case
- `GET /api/cases/:id` — public case and evidence; solution only after solve
- `GET /api/cases/:id/evidence/:evidenceId` — one public evidence artifact
- `POST /api/cases/:id/accusations` — accept one accusation and return stored solution

Generation request: `{ "scenario": "...", "caseType": "Any Mystery", "difficulty": "Medium", "evidenceStyle": "Mixed", "suspectCount": 4 }`. Case type, difficulty, and evidence style are constrained by shared schemas. API errors use `{ error: { code, message } }`.

## Product and security notes

- MongoDB is required. `solution` is excluded from normal Mongoose queries and explicitly selected only by trusted accusation handling. Public responses are serialized without internal evidence explanations or classifications.
- The current MVP permits one final accusation. The server checks case status before accepting it; authentication and ownership are deferred by the spec.
- Gemini output is JSON-parsed and schema-validated with bounded repair requests. Deterministic validation checks the culprit and suspect references, required evidence types, clue coverage, red herring resolution, IDs, and timestamps. Deep semantic timeline review still needs stronger validation before production use.
- Cases and evidence are fictional. Messaging interfaces are fictional representations, not exports from real services.
- Local media storage configuration is reserved; the current demo composes visual evidence in the client and stores no binaries.

## Current implementation boundary

The main end-to-end play path is implemented: premise intake, persisted case generation, suspect and evidence navigation, five evidence viewer types, final accusation, and a result reconstructed from the stored solution. Accounts, multiplayer, actual image/video generation, background jobs, historical case browsing, and automated test suites remain outside this initial implementation.
