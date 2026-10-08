import React, { useState } from "react";
import { CheckIcon, CopyIcon, DownloadIcon, ResetIcon } from "./Icons";
import { MarkdownRenderer } from "./MarkdownRenderer";

const AGENT_TABS = [
  { id: "summary", name: "Founder Summary" },
  { id: "market", name: "Market Research" },
  { id: "competitors", name: "Competitor Analysis" },
  { id: "risks", name: "Risk Detection" },
  { id: "innovation", name: "Innovation" },
  { id: "business", name: "Business Model" },
  { id: "landing", name: "Landing Page" },
  { id: "pitch", name: "Pitch Deck" },
  { id: "roadmap", name: "Roadmap" },
];

export function ResultsView({ results, onReset }) {
  const [activeTab, setActiveTab] = useState("summary");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");

  if (!results) return null;

  const currentContent = results[activeTab] || "";

  const copyBlueprint = async () => {
    try {
      await navigator.clipboard.writeText(currentContent || results.summary);
      setCopied(true);
      setCopyError("");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
      setCopyError("Couldn't copy automatically. Select and copy text manually.");
    }
  };

  const downloadBlueprint = () => {
    let contentToDownload = currentContent;
    let filename = `startup-blueprint-${activeTab}.md`;

    if (activeTab === "summary") {
      filename = `startup-blueprint-full.md`;
      contentToDownload = `# STARTUP BLUEPRINT\n\n` +
        AGENT_TABS.map((tab) => {
          if (!results[tab.id]) return "";
          return `## ${tab.name}\n\n${results[tab.id]}\n\n---\n\n`;
        }).join("");
    }

    const blob = new Blob([contentToDownload], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="results-card" aria-labelledby="results-title">
      <div className="results-heading">
        <div>
          <p className="eyebrow">YOUR IDEA, WITH A WAY FORWARD</p>
          <h2 id="results-title">The first draft of something big.</h2>
        </div>
        <div className="results-actions">
          <button className="copy-button" type="button" onClick={copyBlueprint}>
            <CopyIcon /> {copied ? "Copied!" : "Copy view"}
          </button>
          <button className="copy-button download-btn" type="button" onClick={downloadBlueprint}>
            <DownloadIcon /> Export .md
          </button>
          <button className="copy-button reset-btn" type="button" onClick={onReset}>
            <ResetIcon /> Edit idea
          </button>
          <span className="results-badge"><CheckIcon /> BLUEPRINT READY</span>
        </div>
      </div>

      {copyError && <p className="copy-error" role="alert">{copyError}</p>}

      <div className="tab-navigation">
        {AGENT_TABS.map((tab) => {
          const hasContent = Boolean(results[tab.id]);
          return (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? "active" : ""} ${!hasContent ? "disabled" : ""}`}
              onClick={() => hasContent && setActiveTab(tab.id)}
              disabled={!hasContent}
            >
              {tab.name}
            </button>
          );
        })}
      </div>

      <div className="results-content">
        <MarkdownRenderer content={currentContent} />
      </div>
    </section>
  );
}
