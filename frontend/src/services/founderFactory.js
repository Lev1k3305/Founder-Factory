import { businessAgent } from "../agents/businessAgent";
import { competitorAgent } from "../agents/competitorAgent";
import { innovationAgent } from "../agents/innovationAgent";
import { landingAgent } from "../agents/landingAgent";
import { marketAgent } from "../agents/marketAgent";
import { pitchAgent } from "../agents/pitchAgent";
import { riskAgent } from "../agents/riskAgent";
import { roadmapAgent } from "../agents/roadmapAgent";
import { summaryAgent } from "../agents/summaryAgent";

export async function runFounderFactory(idea, onProgress, onStepResult) {
  const normalizedIdea = idea.trim();
  if (!normalizedIdea) {
    throw new Error("Describe your startup idea before starting.");
  }

  const update = (step) => onProgress?.(step);
  const emitResult = (key, val) => onStepResult?.(key, val);

  update("Market Research");
  const market = await marketAgent(normalizedIdea);
  emitResult("market", market);

  update("Competitor Analysis");
  const competitors = await competitorAgent(normalizedIdea, market);
  emitResult("competitors", competitors);

  update("Risk Detection");
  const risks = await riskAgent(normalizedIdea, market, competitors);
  emitResult("risks", risks);

  update("Innovation");
  const innovation = await innovationAgent(
    normalizedIdea,
    market,
    competitors,
    risks,
  );
  emitResult("innovation", innovation);

  update("Business Model");
  const business = await businessAgent(innovation);
  emitResult("business", business);

  update("Landing Page");
  const landingPromise = landingAgent(innovation, business).then((res) => {
    emitResult("landing", res);
    return res;
  });

  update("Pitch Deck");
  const pitchPromise = pitchAgent(innovation, business).then((res) => {
    emitResult("pitch", res);
    return res;
  });

  update("Roadmap");
  const roadmapPromise = roadmapAgent(innovation).then((res) => {
    emitResult("roadmap", res);
    return res;
  });

  const [landing, pitch, roadmap] = await Promise.all([
    landingPromise,
    pitchPromise,
    roadmapPromise,
  ]);

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
  emitResult("summary", summary);

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
