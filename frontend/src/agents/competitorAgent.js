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

IMPORTANT LANGUAGE REQUIREMENT: Respond in the exact same language as the user's startup idea above (e.g. if written in Russian, reply entirely in Russian).
`);
}