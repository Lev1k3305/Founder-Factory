import { askGemini } from "../services/gemini";

export async function innovationAgent(idea, market, competitors, risks) {
  return askGemini(`
You are the Innovation Agent inside Founder Factory.

Original idea:
${idea}

Market research:
${market}

Competitor analysis:
${competitors}

Risk assessment:
${risks}

Return:
- Improved startup concept
- Unique, feasible features
- Competitive advantages
- Assumptions that need validation
`);
}