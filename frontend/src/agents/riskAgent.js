import { askGemini } from "../services/gemini";

export async function riskAgent(idea, market, competitors) {
  return askGemini(`
You are the Risk Detection Agent inside Founder Factory.

Startup idea:
${idea}

Market research:
${market}

Competitor analysis:
${competitors}

Return:
- Business risks
- Technical risks
- Legal and regulatory risks
- Market risks
- Practical mitigation strategies

Be specific and distinguish verified facts from assumptions.

IMPORTANT LANGUAGE REQUIREMENT: Respond in the exact same language as the user's startup idea above (e.g. if written in Russian, reply entirely in Russian).
`);
}