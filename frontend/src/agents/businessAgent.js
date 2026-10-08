import { askGemini } from "../services/gemini";

export async function businessAgent(innovation) {
  return askGemini(`
You are the Business Model Agent inside Founder Factory.

Improved startup concept:
${innovation}

Return:
- Customer segments
- Value proposition
- Revenue streams
- Pricing strategy
- MVP scope
- Cost structure

IMPORTANT LANGUAGE REQUIREMENT: Respond in the exact same language as the context provided (e.g. if written in Russian, reply entirely in Russian).
`);
}