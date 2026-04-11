export const env = {
  baseUrl: import.meta.env.VITE_BASE_URL || import.meta.env.BASE_URL || "http://localhost:8080",
  aiUrl: import.meta.env.VITE_AI_URL || import.meta.env.AI_URL || "",
};

if (!env.baseUrl) {
  throw new Error("VITE_BASE_URL is required");
}
