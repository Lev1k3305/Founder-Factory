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