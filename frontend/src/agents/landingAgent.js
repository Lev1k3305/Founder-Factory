import { askGemini } from "../services/gemini";

export async function landingAgent(innovation, business) {
  return askGemini(`
You are the Landing Page Agent inside Founder Factory.

Startup concept:
${innovation}

Business model:
${business}

Create:
- Headline
- Subheadline
- Benefits
- Features
- Call to action
`);
}