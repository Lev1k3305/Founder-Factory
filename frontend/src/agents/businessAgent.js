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
`);
}