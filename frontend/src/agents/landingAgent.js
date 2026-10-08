import { askGemini } from "../services/gemini";

export async function landingAgent(innovation, business) {
  return askGemini(`
You are the Landing Page Agent inside Founder Factory.

Startup concept:
${innovation}

Business model:
${business}

Create:
- Headline
- Subheadline
- Benefits
- Features
- Call to action

IMPORTANT LANGUAGE REQUIREMENT: Respond in the exact same language as the context provided (e.g. if written in Russian, reply entirely in Russian).
`);
}