import { businessAgent } from "../agents/businessAgent";
import { competitorAgent } from "../agents/competitorAgent";
import { innovationAgent } from "../agents/innovationAgent";
import { landingAgent } from "../agents/landingAgent";
import { marketAgent } from "../agents/marketAgent";
import { pitchAgent } from "../agents/pitchAgent";
import { riskAgent } from "../agents/riskAgent";
import { roadmapAgent } from "../agents/roadmapAgent";
import { summaryAgent } from "../agents/summaryAgent";

export async function runFounderFactory(idea, onProgress) {
  const normalizedIdea = idea.trim();
  if (!normalizedIdea) {
    throw new Error("Describe your startup idea before starting.");
  }

  const update = (step) => onProgress?.(step);

  update("Market Research");
  const market = await marketAgent(normalizedIdea);

  update("Competitor Analysis");
  const competitors = await competitorAgent(normalizedIdea, market);

  update("Risk Detection");
  const risks = await riskAgent(normalizedIdea, market, competitors);

  update("Innovation");
  const innovation = await innovationAgent(
    normalizedIdea,
    market,
    competitors,
    risks,
  );

  update("Business Model");
  const business = await businessAgent(innovation);

  update("Landing Page");
  const landing = await landingAgent(innovation, business);

  update("Pitch Deck");
  const pitch = await pitchAgent(innovation, business);

  update("Roadmap");
  const roadmap = await roadmapAgent(innovation);

  update("Founder Summary");
  const summary = await summaryAgent({
    market,
    competitors,
    risks,
    innovation,
    business,
    landing,
    pitch,
    roadmap,
  });

  return {
    market,
    competitors,
    risks,
    innovation,
    business,
    landing,
    pitch,
    roadmap,
    summary,
  };
}
