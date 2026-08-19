export const OPENCODE_GO_BASE_URL = "https://opencode.ai/zen/go/v1";
export const OPENCODE_GO_MODEL = "deepseek-v4-flash";

export function getOpenCodeGoConfig() {
  const apiKey = (
    process.env.OPENCODE_API_KEY ??
    process.env.OPENCODE_GO_API_KEY ??
    ""
  ).trim();
  const baseURL = (process.env.OPENCODE_BASE_URL ?? OPENCODE_GO_BASE_URL).replace(/\/$/, "");
  const model = (process.env.OPENCODE_MODEL ?? OPENCODE_GO_MODEL).trim() || OPENCODE_GO_MODEL;
  return {
    apiKey,
    baseURL,
    model,
    configured: apiKey.length > 12,
  };
}
