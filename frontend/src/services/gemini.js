export async function askGemini(prompt) {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  const result = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(
        "API endpoint not found (404). Make sure both backend and frontend are running via 'npm run dev' in the root project folder, and you are using http://localhost:5173 (not Live Server or file://).",
      );
    }
    throw new Error(result?.error || `AI request failed (${response.status}).`);
  }
  if (typeof result?.text !== "string" || !result.text.trim()) {
    throw new Error("AI returned an empty response.");
  }

  return result.text;
}