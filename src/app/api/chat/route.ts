import { createAgentUIStreamResponse } from "ai";
import { NextResponse } from "next/server";
import { createOrbAgent } from "@/lib/ai/agent";
import { getOpenCodeGoConfig } from "@/lib/ai/config";
import { OrbWorkspace } from "@/lib/ai/engine";
import { isWorkspaceSnapshot } from "@/lib/ai/snapshot";
import type { ChatAttachment } from "@/lib/ai/spreadsheet";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

async function requireUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cfg = getOpenCodeGoConfig();
  if (!cfg.configured) {
    return NextResponse.json(
      {
        error:
          "Orb no está conectado. Agrega OPENCODE_API_KEY (OpenCode Go) en .env.local.",
      },
      { status: 503 },
    );
  }

  let body: {
    messages?: unknown;
    uiMessages?: unknown;
    workspace?: unknown;
    attachments?: ChatAttachment[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const messages = body.messages ?? body.uiMessages;
  if (!Array.isArray(messages)) {
    return NextResponse.json({ error: "messages required" }, { status: 400 });
  }
  if (!isWorkspaceSnapshot(body.workspace)) {
    return NextResponse.json({ error: "workspace required" }, { status: 400 });
  }

  const workspace = new OrbWorkspace(body.workspace, body.attachments ?? []);
  const agent = createOrbAgent(workspace);

  return createAgentUIStreamResponse({
    agent,
    uiMessages: messages,
    abortSignal: request.signal,
  });
}
