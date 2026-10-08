import React from "react";
import { SparkIcon } from "./Icons";

export function Header() {
  return (
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
  );
}
