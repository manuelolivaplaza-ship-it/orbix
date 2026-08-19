import { NextResponse } from "next/server";
import { testOpenFactura } from "@/lib/sii/openfactura";
import type { SiiEnvironment } from "@/lib/sii/dte";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

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
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { apiKey?: string; environment?: SiiEnvironment };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const apiKey = body.apiKey?.trim() ?? "";
  if (apiKey.length < 8) {
    return NextResponse.json({ error: "Pega una API key de OpenFactura." }, { status: 400 });
  }

  const result = await testOpenFactura(apiKey, body.environment ?? "certificacion");
  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 422 });
  }
  return NextResponse.json({ ok: true, provider: "openfactura" });
}
