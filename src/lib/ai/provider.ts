import { createOpenAI } from "@ai-sdk/openai";
import { getOpenCodeGoConfig } from "./config";

export function getOrbModel() {
  const cfg = getOpenCodeGoConfig();
  if (!cfg.configured) {
    throw new Error("OPENCODE_API_KEY no está configurada.");
  }
  const opencodeGo = createOpenAI({
    apiKey: cfg.apiKey,
    baseURL: cfg.baseURL,
    name: "opencode-go",
  });
  return opencodeGo.chat(cfg.model);
}
