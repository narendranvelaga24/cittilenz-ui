function normalizeUrl(value) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
}

export const env = {
  // Vite's BASE_URL is the app asset base path (usually "/"), not the backend API origin.
  baseUrl: normalizeUrl(import.meta.env.VITE_BASE_URL) || "http://localhost:8080",
  aiUrl: normalizeUrl(import.meta.env.VITE_AI_URL) || "http://localhost:8000",
};

if (!env.baseUrl) {
  throw new Error("VITE_BASE_URL is required");
}
