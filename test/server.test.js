import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  createApiServer,
  createGeminiGenerator,
  generateWithRetry,
} from "../backend/server.js";
import { API_VERSION, GEMINI_MODEL } from "../backend/config.js";

const servers = new Set();

async function withApi(generateContent, run, options) {
  const server = createApiServer(generateContent, options);
  servers.add(server);
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  try {
    const { port } = server.address();
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    servers.delete(server);
  }
}

afterEach(async () => {
  await Promise.all(
    [...servers].map(
      (server) =>
        new Promise((resolve) => {
          server.close(() => resolve());
        }),
    ),
  );
  servers.clear();
});

test("health endpoint reports that the API is available", async () => {
  await withApi(async () => "unused", async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      status: "ok",
      model: GEMINI_MODEL,
      version: API_VERSION,
    });
  });
});

test("generate endpoint forwards a prompt and returns generated text", async () => {
  await withApi(async (prompt) => `Answer to: ${prompt}`, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "Research this idea" }),
    });

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      text: "Answer to: Research this idea",
    });
  });
});

test("generate endpoint rejects empty prompts", async () => {
  await withApi(async () => "unused", async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "  " }),
    });

    assert.equal(response.status, 400);
    assert.match((await response.json()).error, /non-empty string/);
  });
});

test("generate endpoint rejects oversized requests", async () => {
  await withApi(async () => "unused", async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "x".repeat(256 * 1024) }),
    });

    assert.equal(response.status, 413);
    assert.match((await response.json()).error, /too large/);
  });
});

test("generate endpoint returns a visible error when generation fails", async () => {
  await withApi(
    async () => {
      throw new Error("provider unavailable");
    },
    async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "Research this idea" }),
      });

      assert.equal(response.status, 502);
      assert.match((await response.json()).error, /request failed unexpectedly/);
    },
    { logError() {} },
  );
});

test("generate endpoint explains when the Gemini model is unavailable", async () => {
  const modelError = Object.assign(
    new Error("Model is unavailable. Please use models/gemini-3.8-flash."),
    { status: 404 },
  );

  await withApi(
    async () => {
      throw modelError;
    },
    async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "Research this idea" }),
      });

      assert.equal(response.status, 502);
      assert.match(
        (await response.json()).error,
        new RegExp(
          `configured Gemini model "${GEMINI_MODEL}" is unavailable`,
          "i",
        ),
      );
    },
    { logError() {} },
  );
});

test("generate endpoint reports API-key permission and quota errors", async (t) => {
  const cases = [
    {
      name: "permission error",
      error: Object.assign(new Error("permission denied"), { status: 403 }),
      expected: /API key.*permission/i,
    },
    {
      name: "quota error",
      error: Object.assign(new Error("quota exceeded"), { status: 429 }),
      expected: /quota exceeded/i,
    },
  ];

  for (const { name, error, expected } of cases) {
    await t.test(name, async () => {
      await withApi(
        async () => {
          throw error;
        },
        async (baseUrl) => {
          const response = await fetch(`${baseUrl}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: "Reply OK" }),
          });

          assert.equal(response.status, 502);
          assert.match((await response.json()).error, expected);
        },
        { logError() {} },
      );
    });
  }
});

test("Gemini generation retries temporary 503 responses", async () => {
  let attempts = 0;
  const delays = [];
  const result = await generateWithRetry(
    async (prompt) => {
      attempts += 1;
      if (attempts < 5) {
        throw Object.assign(new Error("model busy"), { status: 503 });
      }
      return `Generated: ${prompt}`;
    },
    "startup idea",
    { delay: async (milliseconds) => delays.push(milliseconds) },
  );

  assert.equal(result, "Generated: startup idea");
  assert.equal(attempts, 5);
  assert.deepEqual(delays, [1000, 2000, 4000, 8000]);
});

test("Gemini generation does not retry quota errors", async () => {
  let attempts = 0;

  await assert.rejects(
    generateWithRetry(
      async () => {
        attempts += 1;
        throw Object.assign(new Error("quota exceeded"), { status: 429 });
      },
      "startup idea",
      { delay: async () => assert.fail("Quota errors should not be retried.") },
    ),
    { status: 429 },
  );
  assert.equal(attempts, 1);
});

test("Gemini generation switches to the fallback model after primary 503s", async () => {
  const models = [];
  const warnings = [];
  const generator = createGeminiGenerator(
    async (model, prompt) => {
      models.push(model);
      if (model === "primary-model") {
        throw Object.assign(new Error("high demand"), { status: 503 });
      }
      return `Generated by ${model}: ${prompt}`;
    },
    {
      primaryModel: "primary-model",
      fallbackModel: "fallback-model",
      delay: async () => {},
      logFallback: (message) => warnings.push(message),
    },
  );

  assert.equal(await generator("startup idea"), "Generated by fallback-model: startup idea");
  assert.equal(await generator("another idea"), "Generated by fallback-model: another idea");
  assert.deepEqual(models, [
    "primary-model",
    "primary-model",
    "fallback-model",
    "fallback-model",
  ]);
  assert.equal(warnings.length, 1);
});

test("Gemini generation switches to the fallback model after primary quota errors", async () => {
  const models = [];
  const generator = createGeminiGenerator(
    async (model, prompt) => {
      models.push(model);
      if (model === "primary-model") {
        throw Object.assign(new Error("daily quota exceeded"), { status: 429 });
      }
      return `Generated by ${model}: ${prompt}`;
    },
    {
      primaryModel: "primary-model",
      fallbackModel: "fallback-model",
      delay: async () => assert.fail("Quota errors should not be retried."),
      logFallback() {},
    },
  );

  assert.equal(await generator("startup idea"), "Generated by fallback-model: startup idea");
  assert.deepEqual(models, ["primary-model", "fallback-model"]);
});

test("Gemini generation does not switch models for non-503 errors", async () => {
  const models = [];
  const generator = createGeminiGenerator(
    async (model) => {
      models.push(model);
      throw Object.assign(new Error("permission denied"), { status: 403 });
    },
    {
      primaryModel: "primary-model",
      fallbackModel: "fallback-model",
      delay: async () => assert.fail("Permission errors should not be retried."),
      logFallback: () => assert.fail("Permission errors should not switch models."),
    },
  );

  await assert.rejects(generator("startup idea"), { status: 403 });
  assert.deepEqual(models, ["primary-model"]);
});
