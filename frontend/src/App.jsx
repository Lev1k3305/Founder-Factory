import React, { useState } from "react";
import "./App.css";
import { Header } from "./components/Header";
import { IdeaForm } from "./components/IdeaForm";
import { ProcessProgress } from "./components/ProcessProgress";
import { ResultsView } from "./components/ResultsView";
import { Footer } from "./components/Footer";
import { runFounderFactory } from "./services/founderFactory";

const steps = [
  "Market Research",
  "Competitor Analysis",
  "Risk Detection",
  "Innovation",
  "Business Model",
  "Landing Page",
  "Pitch Deck",
  "Roadmap",
  "Founder Summary",
];

const examples = [
  "An AI coach for better focus",
  "A simpler way to plan team projects",
  "Personal finance for freelancers",
  "ИИ-помощник для автоматизации рутины",
];

function App() {
  const [idea, setIdea] = useState("");
  const [results, setResults] = useState(null);
  const [stepResults, setStepResults] = useState({});
  const [currentStep, setCurrentStep] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const buildStartup = async (event) => {
    event.preventDefault();
    if (loading || !idea.trim()) return;

    setLoading(true);
    setError("");
    setResults(null);
    setStepResults({});
    setCurrentStep("");

    try {
      const data = await runFounderFactory(
        idea,
        (step) => setCurrentStep(step),
        (key, val) => setStepResults((prev) => ({ ...prev, [key]: val })),
      );
      setResults(data);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "The startup blueprint could not be generated.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setStepResults({});
    setCurrentStep("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app-shell">
      <Header />

      <main>
        <IdeaForm
          idea={idea}
          setIdea={setIdea}
          onSubmit={buildStartup}
          loading={loading}
          error={error}
          examples={examples}
        />

        <ProcessProgress
          steps={steps}
          currentStep={currentStep}
          loading={loading}
          results={results}
          stepResults={stepResults}
        />

        {results && <ResultsView results={results} onReset={handleReset} />}
      </main>

      <Footer />
    </div>
  );
}

export default App;
