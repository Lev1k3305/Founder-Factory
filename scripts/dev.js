import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { API_VERSION, GEMINI_MODEL } from "../backend/config.js";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const frontendDirectory = resolve(projectRoot, "frontend");
const children = [];
let stopping = false;

async function getApiHealth() {
  try {
    const response = await fetch("http://127.0.0.1:3001/api/health", {
      signal: AbortSignal.timeout(1000),
    });
    if (!response.ok) return null;

    const health = await response.json();
    return health.status === "ok" ? health : null;
  } catch {
    return null;
  }
}

function stop(signal = "SIGTERM") {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (child.exitCode === null) child.kill(signal);
  }
}

function start(command, args, options = {}) {
  const child = spawn(command, args, {
    cwd: process.cwd(),
    stdio: "inherit",
    ...options,
  });
  children.push(child);

  child.on("error", (error) => {
    console.error(`Could not start ${command}:`, error.message);
    process.exitCode = 1;
    stop();
  });

  child.on("exit", (code) => {
    if (stopping) return;
    process.exitCode = code ?? 1;
    stop();
  });

  return child;
}

process.on("SIGINT", () => stop("SIGINT"));
process.on("SIGTERM", () => stop("SIGTERM"));

const apiHealth = await getApiHealth();
if (
  apiHealth &&
  (apiHealth.model !== GEMINI_MODEL || apiHealth.version !== API_VERSION)
) {
  console.error(
    `An outdated Founder Factory API is running on port 3001 (model: ${apiHealth.model ?? "unknown"}, version: ${apiHealth.version ?? "unknown"}). Stop that server, then run npm run dev again.`,
  );
  process.exitCode = 1;
  process.exit();
} else if (apiHealth) {
  console.log("Reusing the existing Founder Factory API on port 3001.");
} else {
  start(
    process.execPath,
    [
      `--env-file=${resolve(projectRoot, ".env")}`,
      resolve(projectRoot, "backend", "server.js"),
    ],
    { cwd: projectRoot },
  );
}

start(
  process.execPath,
  [resolve(frontendDirectory, "node_modules", "vite", "bin", "vite.js")],
  { cwd: frontendDirectory },
);
