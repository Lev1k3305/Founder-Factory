import { askGemini } from "../services/gemini";

export async function marketAgent(idea) {
  const prompt = `
You are the Market Research Agent inside Founder Factory.

Your role:
Analyze a startup idea like a senior startup market researcher.

Startup idea:
${idea}

Return the answer in this structure:

# Market Overview

# Target Audience

# Industry Trends

# Market Opportunities

# Key Challenges

# Founder Recommendation

Be specific.
Avoid generic startup advice.
Focus on actionable insights.
`;

  return await askGemini(prompt);
}