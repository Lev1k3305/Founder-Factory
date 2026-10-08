import { askGemini } from "../services/gemini";

export async function roadmapAgent(innovation) {
  return askGemini(`
You are the Roadmap Agent inside Founder Factory.

Startup concept:
${innovation}

Return a practical roadmap covering:
- First 30 days
- Days 31-60
- Days 61-90
- Key milestones and measurable outcomes

IMPORTANT LANGUAGE REQUIREMENT: Respond in the exact same language as the context provided (e.g. if written in Russian, reply entirely in Russian).
`);
}