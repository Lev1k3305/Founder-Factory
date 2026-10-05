# Founder Factory architecture

Founder Factory uses nine sequential Gemini-powered agents. Each step returns
text that is passed to downstream agents as context:

1. Market Research
2. Competitor Analysis
3. Risk Detection
4. Innovation
5. Business Model
6. Landing Page
7. Pitch Deck
8. Roadmap
9. Founder Summary

The frontend orchestrator is `frontend/src/services/founderFactory.js`; each
agent prompt lives in `frontend/src/agents/`. `frontend/src/services/gemini.js`
calls the same-origin `/api/generate` endpoint. The Node API in
`backend/server.js` keeps the Gemini credential server-side and calls the
`gemini-3.1-flash-lite` model configured in `backend/config.js`. If that model
returns HTTP 429 or 503 after a retry, the API switches to
`gemini-flash-latest` and continues using the fallback for subsequent requests.
During local development, Vite forwards `/api` to the API server on port 3001.

These are sequential prompt-based agents, not autonomous processes. Later
agents receive the results of earlier steps, and the UI displays progress and
reports generation errors.
