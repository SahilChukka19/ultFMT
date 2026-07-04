const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function fetchModels() {
  const res = await fetch(`${API_BASE_URL}/models`);
  if (!res.ok) throw new Error("Failed to fetch models");
  return res.json();
}

export async function fetchPricing() {
  const res = await fetch(`${API_BASE_URL}/pricing`);
  if (!res.ok) throw new Error("Failed to fetch pricing");
  return res.json();
}

export async function estimateTokens(text: string) {
  const res = await fetch(`${API_BASE_URL}/tools/token-estimator`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("Failed to estimate tokens");
  return res.json();
}

export async function calculateCost(modelId: string, inputTokens: number, outputTokens: number, requestsPerDay: number) {
  const res = await fetch(`${API_BASE_URL}/tools/cost-calculator`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model_id: modelId, input_tokens: inputTokens, output_tokens: outputTokens, requests_per_day: requestsPerDay }),
  });
  if (!res.ok) throw new Error("Failed to calculate cost");
  return res.json();
}

export async function checkContext(text: string) {
  const res = await fetch(`${API_BASE_URL}/tools/context-checker`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("Failed to check context window");
  return res.json();
}

export async function promptDiff(promptA: string, promptB: string) {
  const res = await fetch(`${API_BASE_URL}/tools/prompt-diff`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt_a: promptA, prompt_b: promptB }),
  });
  if (!res.ok) throw new Error("Failed to diff prompts");
  return res.json();
}

export async function extractVariables(prompt: string) {
  const res = await fetch(`${API_BASE_URL}/tools/variable-extractor`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) throw new Error("Failed to extract variables");
  return res.json();
}

export async function validateJson(jsonString: string) {
  const res = await fetch(`${API_BASE_URL}/tools/json-validator`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ json_string: jsonString }),
  });
  if (!res.ok) throw new Error("Failed to validate JSON");
  return res.json();
}
