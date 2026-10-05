# Founder Factory

Founder Factory turns a startup idea into a blueprint using nine Gemini-powered
agents. The agents run in sequence and pass earlier research into later steps.

## Requirements

- Node.js 20.6 or newer
- A Gemini API key

## Run locally

1. Copy `.env.example` to `.env` and set `GEMINI_API_KEY` to your own key.
2. From the project root, run `npm install` and `npm install --prefix frontend`
   if dependencies are not installed.
3. Run `npm run dev`.
4. Open the local URL printed by Vite.

The development command starts both the API and frontend. The API listens only
on `127.0.0.1:3001`; Vite proxies `/api` requests to it. Keep `.env` private.
If a Gemini key was previously configured as a `VITE_*` variable or committed,
revoke it and create a replacement before using the application.

## Checks

- `npm run lint` — lint frontend source
- `npm run build` — production frontend build
- `npm test` — API tests

For production, serve the frontend and API behind the same origin or configure
an HTTPS reverse proxy for `/api`. Do not put the Gemini API key in browser
code or a `VITE_*` variable.
