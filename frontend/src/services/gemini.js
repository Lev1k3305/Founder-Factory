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
    throw new Error(result?.error || `AI request failed (${response.status}).`);
  }
  if (typeof result?.text !== "string" || !result.text.trim()) {
    throw new Error("AI returned an empty response.");
  }

  return result.text;
}