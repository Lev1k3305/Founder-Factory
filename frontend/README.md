# Founder Factory frontend

This React/Vite app is served together with the API during development. From
the project root, configure the private `GEMINI_API_KEY` in `.env`, install
dependencies with `npm install` and `npm install --prefix frontend`, then run
`npm run dev` from either the project root or this directory. The development
command always starts both the API and frontend together.

Vite proxies `/api` requests to the local API server. Run `npm run lint` or
`npm run build` from the project root to validate the frontend.
