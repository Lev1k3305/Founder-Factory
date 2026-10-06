import { createServer } from "node:http";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  API_VERSION,
  GEMINI_FALLBACK_MODEL,
  GEMINI_MODEL,
} from "./config.js";

const MAX_BODY_BYTES = 256 * 1024;
const MAX_PROMPT_LENGTH = 100_000;

class RequestError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

export function explainGeminiError(error) {
  const status = error?.status;
  const providerMessage = String(error?.message || "");

  if (status === 400) {
    return "Gemini rejected the request. Check the prompt and selected model.";
  }
  if (status === 401 || status === 403) {
    return "Gemini rejected the API key or the key does not have permission to use this model. Check GEMINI_API_KEY in the root .env file.";
  }
  if (status === 404 && /model/i.test(providerMessage)) {
    const recommendation = providerMessage.match(/use models\/([\w.-]+)/i);
    const hint = recommendation
      ? ` The provider recommends "${recommendation[1]}".`
      : "";
    return `The configured Gemini model "${GEMINI_MODEL}" is unavailable for this API key.${hint} Restart the API after updating the model.`;
  }
  if (status === 404) {
    return "Gemini API endpoint was not found. Check the SDK and API endpoint configuration.";
  }
  if (status === 429) {
    return "Gemini rate limit or quota exceeded. Check your Google AI Studio billing and usage limits, then try again later.";
  }
  if (typeof status === "number" && status >= 500) {
    return `Gemini is temporarily unavailable (HTTP ${status}). Try again later.`;
  }
  if (error instanceof TypeError) {
    return "Could not connect to the Gemini API. Check your internet connection, proxy, or firewall.";
  }
  return "Gemini request failed unexpectedly. Check the API server log for details.";
}

export async function generateWithRetry(
  generateContent,
  prompt,
  {
    maxRetries = 4,
    delay = (milliseconds) =>
      new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
      }),
  } = {},
) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await generateContent(prompt);
    } catch (error) {
      if (error?.status !== 503 || attempt >= maxRetries) {
        throw error;
      }
      await delay(1000 * 2 ** attempt);
    }
  }
}

export function createGeminiGenerator(generateContent, {
  primaryModel = GEMINI_MODEL,
  fallbackModel = GEMINI_FALLBACK_MODEL,
  delay,
  logFallback = console.warn,
} = {}) {
  let activeModel = primaryModel;

  return async (prompt) => {
    try {
      return await generateWithRetry(
        (text) => generateContent(activeModel, text),
        prompt,
        { maxRetries: activeModel === primaryModel ? 1 : 2, delay },
      );
    } catch (error) {
      if (
        ![429, 503].includes(error?.status) ||
        activeModel !== primaryModel
      ) {
        throw error;
      }

      activeModel = fallbackModel;
      logFallback(
        `Gemini model "${primaryModel}" returned HTTP ${error.status}; switching to "${fallbackModel}".`,
      );
      return generateWithRetry(
        (text) => generateContent(activeModel, text),
        prompt,
        { maxRetries: 2, delay },
      );
    }
  };
}

async function readJsonBody(request) {
  const chunks = [];
  let byteLength = 0;
  let tooLarge = false;

  for await (const chunk of request) {
    if (tooLarge) continue;
    byteLength += chunk.length;
    if (byteLength > MAX_BODY_BYTES) {
      tooLarge = true;
      chunks.length = 0;
      continue;
    }
    chunks.push(chunk);
  }

  if (tooLarge) {
    throw new RequestError(413, "Request body is too large.");
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new RequestError(400, "Request body must be valid JSON.");
  }
}

export function createApiServer(generateContent, { logError = console.error } = {}) {
  return createServer(async (request, response) => {
    const pathname = new URL(request.url, "http://localhost").pathname;

    if (request.method === "GET" && pathname === "/api/health") {
      sendJson(response, 200, {
        status: "ok",
        model: GEMINI_MODEL,
        version: API_VERSION,
      });
      return;
    }

    if (request.method !== "POST" || pathname !== "/api/generate") {
      sendJson(response, 404, { error: "Not found." });
      return;
    }

    if (!request.headers["content-type"]?.includes("application/json")) {
      sendJson(response, 415, { error: "Content-Type must be application/json." });
      return;
    }

    let body;
    try {
      body = await readJsonBody(request);
    } catch (error) {
      if (error instanceof RequestError) {
        sendJson(response, error.statusCode, { error: error.message });
        return;
      }
      sendJson(response, 400, { error: "Invalid request body." });
      return;
    }

    if (
      typeof body?.prompt !== "string" ||
      !body.prompt.trim() ||
      body.prompt.length > MAX_PROMPT_LENGTH
    ) {
      sendJson(response, 400, {
        error: `Prompt must be a non-empty string of at most ${MAX_PROMPT_LENGTH} characters.`,
      });
      return;
    }

    try {
      const text = await generateContent(body.prompt);
      if (typeof text !== "string" || !text.trim()) {
        throw new Error("Gemini returned an empty response.");
      }
      sendJson(response, 200, { text });
    } catch (error) {
      logError("Gemini generation failed:", error);
      sendJson(response, 502, {
        error: explainGeminiError(error),
      });
    }
  });
}

export function startServer() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing. Copy .env.example to .env and add your key.",
    );
  }

  const port = Number(process.env.PORT || 3001);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535.");
  }

  const gemini = new GoogleGenerativeAI(apiKey);
  const models = new Map(
    [GEMINI_MODEL, GEMINI_FALLBACK_MODEL].map((modelName) => [
      modelName,
      gemini.getGenerativeModel({ model: modelName }),
    ]),
  );
  const generateContent = createGeminiGenerator(async (modelName, prompt) => {
    const result = await models.get(modelName).generateContent(prompt);
    return result.response.text();
  });
  const server = createApiServer(generateContent);

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(
        `Cannot start the API: port ${port} is already in use. Stop the other API process or set PORT to a free port and update the Vite proxy.`,
      );
    } else {
      console.error("Cannot start the API server:", error);
    }
    process.exitCode = 1;
  });

  server.listen(port, "127.0.0.1", () => {
    console.log(`Founder Factory API listening on http://127.0.0.1:${port}`);
  });

  return server;
}

const isMainModule =
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isMainModule) {
  startServer();
}
