import { useState } from "react";
import "./App.css";
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
];

function SparkIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path
        d="m12 2 1.9 7.1L21 11l-7.1 1.9L12 20l-1.9-7.1L3 11l7.1-1.9L12 2Z"
        fill="currentColor"
      />
      <path d="m19 15 .9 3.1L23 19l-3.1.9L19 23l-.9-3.1L15 19l3.1-.9L19 15Z" fill="currentColor" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M4 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="m5 10 3.2 3.2L15.5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <rect x="7" y="6" width="9" height="11" rx="1.7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12.5 6V4.7A1.7 1.7 0 0 0 10.8 3H5.7A1.7 1.7 0 0 0 4 4.7v7.1a1.7 1.7 0 0 0 1.7 1.7H7" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function renderInline(text, keyPrefix) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={key}>{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

function renderSummary(summary) {
  const lines = summary.split(/\r?\n/);
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const Heading = heading[1].length === 1 ? "h3" : "h4";
      blocks.push(
        <Heading key={`heading-${index}`}>
          {renderInline(heading[2], `heading-${index}`)}
        </Heading>,
      );
      index += 1;
      continue;
    }

    if (/^---+$/.test(line)) {
      blocks.push(<hr key={`rule-${index}`} />);
      index += 1;
      continue;
    }

    const unordered = line.match(/^\s*[-*]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      const isOrdered = Boolean(ordered);
      const List = isOrdered ? "ol" : "ul";
      const items = [];
      while (index < lines.length) {
        const item = lines[index].trim().match(
          isOrdered ? /^\d+[.)]\s+(.+)$/ : /^[-*]\s+(.+)$/,
        );
        if (!item) break;
        items.push(
          <li key={`item-${index}`}>
            {renderInline(item[1], `item-${index}`)}
          </li>,
        );
        index += 1;
      }
      blocks.push(<List key={`list-${index}`}>{items}</List>);
      continue;
    }

    const paragraph = [line];
    index += 1;
    while (index < lines.length && lines[index].trim()) {
      const next = lines[index].trim();
      if (/^(#{1,3})\s+/.test(next) || /^---+$/.test(next) || /^[-*]\s+/.test(next) || /^\d+[.)]\s+/.test(next)) {
        break;
      }
      paragraph.push(next);
      index += 1;
    }
    blocks.push(
      <p key={`paragraph-${index}`}>
        {renderInline(paragraph.join(" "), `paragraph-${index}`)}
      </p>,
    );
  }

  return blocks;
}

function App() {
  const [idea, setIdea] = useState("");
  const [results, setResults] = useState(null);
  const [currentStep, setCurrentStep] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const currentStepIndex = steps.indexOf(currentStep);
  const displayedStep = currentStepIndex >= 0 ? currentStepIndex + 1 : 0;
  const progress = results ? steps.length : displayedStep;

  const buildStartup = async (event) => {
    event.preventDefault();
    if (loading || !idea.trim()) return;

    setLoading(true);
    setError("");
    setResults(null);
    setCurrentStep("");
    setCopied(false);
    setCopyError("");

    try {
      const data = await runFounderFactory(idea, setCurrentStep);
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

  const copyBlueprint = async () => {
    try {
      await navigator.clipboard.writeText(results.summary);
      setCopied(true);
      setCopyError("");
    } catch {
      setCopied(false);
      setCopyError("Couldn't copy automatically. Select and copy the blueprint text instead.");
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Founder Factory home">
          <span className="brand-mark"><SparkIcon /></span>
          <span className="brand-name">founder<span>factory</span></span>
        </a>
        <div className="topbar-note">
          <span className="status-dot" />
          YOUR AI-POWERED STARTUP STUDIO
        </div>
      </header>

      <main>
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
            <form onSubmit={buildStartup}>
              <label htmlFor="startup-idea">What have you been thinking about?</label>
              <p className="field-hint">A sentence is enough. You can figure out the details as you go.</p>
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
                <span>{loading ? "Building your blueprint" : "Build my blueprint"}</span>
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

        <section className={`process-card${loading ? " is-loading" : ""}${results ? " is-complete" : ""}`} aria-label="Blueprint process">
          <div className="process-heading">
            <div>
              <p className="eyebrow">A LITTLE HELP, A LOT OF CLARITY</p>
              <h2>{loading ? "Your idea is taking shape" : results ? "Your founder's team came through." : "A founder's team, ready when you are."}</h2>
            </div>
            <span className={`agent-count${results ? " all-done" : ""}`}><span /> {results ? "ALL DONE" : "09 AGENTS"}</span>
          </div>
          {(loading || results) && (
            <div className="progress-area">
              <div className="progress-copy" role="status" aria-live="polite">
                <span>{results ? "Blueprint ready to explore" : currentStep || "Getting started"}</span>
                <span>{progress} / {steps.length} {results ? "complete" : "steps"}</span>
              </div>
              <div
                className="progress-track"
                role="progressbar"
                aria-label="Blueprint generation progress"
                aria-valuemin={0}
                aria-valuemax={steps.length}
                aria-valuenow={progress}
                aria-valuetext={results ? "All 9 steps complete" : `${progress} of ${steps.length} steps reached`}
              >
                <span className="progress-fill" style={{ "--progress": `${(progress / steps.length) * 100}%` }} />
              </div>
            </div>
          )}
          <ol className="agent-list">
            {steps.map((step, index) => {
              const complete = Boolean(results) || (loading && currentStepIndex > index);
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

        {results && (
          <section className="results-card" aria-labelledby="results-title">
            <div className="results-heading">
              <div>
                <p className="eyebrow">YOUR IDEA, WITH A WAY FORWARD</p>
                <h2 id="results-title">The first draft of something big.</h2>
              </div>
              <div className="results-actions">
                <button className="copy-button" type="button" onClick={copyBlueprint}>
                  <CopyIcon /> {copied ? "Copied!" : "Copy blueprint"}
                </button>
                <span className="results-badge"><CheckIcon /> BLUEPRINT READY</span>
              </div>
            </div>
            {copyError && <p className="copy-error" role="alert">{copyError}</p>}
            <div className="results-content">{renderSummary(results.summary)}</div>
          </section>
        )}
      </main>

      <footer className="site-footer">
        <span>MADE FOR THE MOMENT BEFORE IT ALL BEGINS.</span>
        <span>FOUNDER FACTORY <span className="footer-separator">/</span> YOUR NEXT MOVE STARTS HERE</span>
      </footer>
    </div>
  );
}

export default App;
