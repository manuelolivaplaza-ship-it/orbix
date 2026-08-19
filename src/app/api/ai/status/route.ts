import { NextResponse } from "next/server";
import { getOpenCodeGoConfig } from "@/lib/ai/config";

export async function GET() {
  const cfg = getOpenCodeGoConfig();
  return NextResponse.json({
    configured: cfg.configured,
    model: cfg.model,
    provider: "opencode-go",
  });
}
