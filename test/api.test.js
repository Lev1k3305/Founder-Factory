import assert from "node:assert/strict";
import { test } from "node:test";
import generateHandler from "../api/generate.js";
import healthHandler from "../api/health.js";

function createMockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    status(code) {
      res.statusCode = code;
      return res;
    },
    setHeader(key, value) {
      res.headers[key] = value;
      return res;
    },
    json(data) {
      res.body = data;
      return res;
    },
  };
  return res;
}

test("health Vercel handler returns 200 OK", () => {
  const req = { method: "GET" };
  const res = createMockRes();
  healthHandler(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.status, "ok");
  assert.ok(res.body.model);
  assert.ok(res.body.version);
});

test("generate Vercel handler rejects non-POST methods with 405", async () => {
  const req = { method: "GET" };
  const res = createMockRes();
  await generateHandler(req, res);

  assert.equal(res.statusCode, 405);
  assert.equal(res.headers["Allow"], "POST");
  assert.equal(res.body.error, "Method Not Allowed");
});

test("generate Vercel handler returns 500 when GEMINI_API_KEY is missing", async () => {
  const originalKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;

  try {
    const req = { method: "POST", body: { prompt: "Test prompt" } };
    const res = createMockRes();
    await generateHandler(req, res);

    assert.equal(res.statusCode, 500);
    assert.match(res.body.error, /GEMINI_API_KEY/);
  } finally {
    if (originalKey) {
      process.env.GEMINI_API_KEY = originalKey;
    }
  }
});

test("generate Vercel handler rejects empty or invalid prompts with 400", async () => {
  process.env.GEMINI_API_KEY = "test-key";

  const req = { method: "POST", body: { prompt: "   " } };
  const res = createMockRes();
  await generateHandler(req, res);

  assert.equal(res.statusCode, 400);
  assert.match(res.body.error, /non-empty string/);
});

test("generate Vercel handler parses stringified body JSON", async () => {
  process.env.GEMINI_API_KEY = "test-key";

  const req = { method: "POST", body: JSON.stringify({ prompt: "   " }) };
  const res = createMockRes();
  await generateHandler(req, res);

  assert.equal(res.statusCode, 400);
  assert.match(res.body.error, /non-empty string/);
});
