import { askGemini } from "../services/gemini";

export async function summaryAgent({
  market,
  competitors,
  risks,
  innovation,
  business,
  landing,
  pitch,
  roadmap,
}) {
  return askGemini(`
You are the Founder Summary Agent inside Founder Factory.
Combine the research below into a concise, coherent startup blueprint. Preserve
uncertainties and do not present assumptions as established facts.
IMPORTANT LANGUAGE REQUIREMENT: Respond in the exact same language as the research below (e.g. if written in Russian, reply entirely in Russian).

Market research:
${market}

Competitor analysis:
${competitors}

Risk assessment:
${risks}

Improved concept:
${innovation}

Business model:
${business}

Landing page:
${landing}

Pitch deck:
${pitch}

Roadmap:
${roadmap}
`);
}