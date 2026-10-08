import React from "react";
import { CheckIcon } from "./Icons";

export function ProcessProgress({ steps, currentStep, loading, results, stepResults }) {
  const currentStepIndex = steps.indexOf(currentStep);
  const displayedStep = currentStepIndex >= 0 ? currentStepIndex + 1 : 0;
  const progress = results ? steps.length : displayedStep;

  return (
    <section
      className={`process-card${loading ? " is-loading" : ""}${results ? " is-complete" : ""}`}
      aria-label="Blueprint process"
    >
      <div className="process-heading">
        <div>
          <p className="eyebrow">A LITTLE HELP, A LOT OF CLARITY</p>
          <h2>
            {loading
              ? "Your idea is taking shape"
              : results
              ? "Your founder's team came through."
              : "A founder's team, ready when you are."}
          </h2>
        </div>
        <span className={`agent-count${results ? " all-done" : ""}`}>
          <span /> {results ? "ALL DONE" : "09 AGENTS"}
        </span>
      </div>
      {(loading || results) && (
        <div className="progress-area">
          <div className="progress-copy" role="status" aria-live="polite">
            <span>{results ? "Blueprint ready to explore" : currentStep || "Getting started"}</span>
            <span>
              {progress} / {steps.length} {results ? "complete" : "steps"}
            </span>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-label="Blueprint generation progress"
            aria-valuemin={0}
            aria-valuemax={steps.length}
            aria-valuenow={progress}
            aria-valuetext={
              results
                ? "All 9 steps complete"
                : `${progress} of ${steps.length} steps reached`
            }
          >
            <span
              className="progress-fill"
              style={{ "--progress": `${(progress / steps.length) * 100}%` }}
            />
          </div>
        </div>
      )}
      <ol className="agent-list">
        {steps.map((step, index) => {
          const complete =
            Boolean(results) ||
            Boolean(stepResults && stepResults[step.toLowerCase().replace(/ .*/, "")]) ||
            (loading && currentStepIndex > index);
          const active = loading && currentStepIndex === index;
          return (
            <li className={active ? "active" : complete ? "complete" : ""} key={step}>
              <span className="agent-number">
                {complete ? <CheckIcon /> : String(index + 1).padStart(2, "0")}
              </span>
              <span className="agent-name">{step}</span>
              {active && <span className="agent-pulse" />}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
