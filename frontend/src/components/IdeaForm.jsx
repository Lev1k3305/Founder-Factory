import React from "react";
import { ArrowIcon, CheckIcon } from "./Icons";

export function IdeaForm({ idea, setIdea, onSubmit, loading, error, examples }) {
  return (
    <section className="workspace" aria-labelledby="page-title">
      <div className="intro">
        <p className="eyebrow"><span>01</span> FROM FIRST THOUGHT TO FIRST MOVE</p>
        <h1 id="page-title">Big ideas start<br />with <span>one sentence.</span></h1>
        <p className="intro-copy">
          Bring the rough idea. Leave with a thoughtful blueprint for what
          to build, who it&apos;s for, and what to do next.
        </p>
        <div className="trust-note">
          <span className="trust-icon"><CheckIcon /></span>
          Nine focused AI agents. One clear direction.
        </div>
      </div>

      <div className="idea-card">
        <div className="card-topline">
          <span className="card-label">YOUR STARTING POINT</span>
          <span className="step-count">01 <span>/ 02</span></span>
        </div>
        <form onSubmit={onSubmit}>
          <label htmlFor="startup-idea">What have you been thinking about?</label>
          <p className="field-hint">A sentence is enough. Describe in English or Russian.</p>
          <textarea
            id="startup-idea"
            value={idea}
            onChange={(event) => setIdea(event.target.value)}
            placeholder="I want to make it easier for..."
            required
            rows={4}
            disabled={loading}
            maxLength={100000}
          />
          <div className="form-footer">
            <span className="private-note">
              <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
                <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M5.3 7V4.8a2.7 2.7 0 0 1 5.4 0V7" stroke="currentColor" strokeWidth="1.3" />
              </svg>
              Your idea stays yours
            </span>
            <span className="char-count">{idea.length.toLocaleString()} / 100,000</span>
          </div>
          <button className="submit-button" type="submit" disabled={loading || !idea.trim()}>
            <span>{loading ? "Building your blueprint..." : "Build my blueprint"}</span>
            <span className="button-icon"><ArrowIcon /></span>
          </button>
        </form>
        {!idea.trim() && (
          <div className="examples">
            <span className="examples-label">NEED A NUDGE?</span>
            <div className="example-list">
              {examples.map((example) => (
                <button
                  className="example-chip"
                  key={example}
                  type="button"
                  onClick={() => setIdea(example)}
                  disabled={loading}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}
        {error && (
          <div className="error-message" role="alert">
            <span className="error-mark">!</span>
            <span>{error}</span>
          </div>
        )}
      </div>
    </section>
  );
}
