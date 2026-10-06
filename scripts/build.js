import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const frontend = resolve(root, "frontend");

console.log("Installing frontend dependencies if missing...");
if (!existsSync(resolve(frontend, "node_modules", "vite"))) {
  execSync("npm install", { cwd: frontend, stdio: "inherit" });
}

console.log("Building frontend with Vite...");
execSync("npm run build", { cwd: frontend, stdio: "inherit" });

const frontendDist = resolve(frontend, "dist");
const rootDist = resolve(root, "dist");

if (existsSync(frontendDist)) {
  mkdirSync(rootDist, { recursive: true });
  cpSync(frontendDist, rootDist, { recursive: true });
  console.log("Build completed successfully: dist is available in both frontend/dist and ./dist");
} else {
  console.error("Vite build did not produce frontend/dist!");
  process.exit(1);
}
