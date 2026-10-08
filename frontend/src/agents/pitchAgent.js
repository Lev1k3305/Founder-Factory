import { askGemini } from "../services/gemini";

export async function pitchAgent(innovation, business) {
  return askGemini(`
You are the Pitch Deck Agent inside Founder Factory.

Startup concept:
${innovation}

Business model:
${business}

Create an investor pitch deck outline with 10 slides. For each slide, include
the title and its key points. Do not invent traction or financial results.

IMPORTANT LANGUAGE REQUIREMENT: Respond in the exact same language as the context provided (e.g. if written in Russian, reply entirely in Russian).
`);
}