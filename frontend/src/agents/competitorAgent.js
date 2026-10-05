import { askGemini } from "../services/gemini";

export async function competitorAgent(idea, market) {
  return askGemini(`
You are the Competitor Analysis Agent inside Founder Factory.

Startup idea:
${idea}

Market research:
${market}

Return:
- Main competitors
- Strengths and weaknesses
- Market gaps
- Differentiation opportunities

Be specific and distinguish verified facts from assumptions.
`);
}