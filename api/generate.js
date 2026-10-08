import {
  createConfiguredGenerator,
  explainGeminiError,
} from "../backend/server.js";

const MAX_PROMPT_LENGTH = 100_000;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "GEMINI_API_KEY is not configured in environment variables.",
    });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      // ignore parse error; prompt validation below will handle invalid structure
    }
  }

  const prompt = body?.prompt;

  if (
    typeof prompt !== "string" ||
    !prompt.trim() ||
    prompt.length > MAX_PROMPT_LENGTH
  ) {
    return res.status(400).json({
      error: `Prompt must be a non-empty string of at most ${MAX_PROMPT_LENGTH} characters.`,
    });
  }

  try {
    const generateContent = createConfiguredGenerator(apiKey);
    const text = await generateContent(prompt);
    if (typeof text !== "string" || !text.trim()) {
      return res.status(502).json({ error: "Gemini returned an empty response." });
    }

    return res.status(200).json({ text });
  } catch (error) {
    console.error("Gemini generation failed:", error);
    return res.status(502).json({
      error: explainGeminiError(error),
    });
  }
}
