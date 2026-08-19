import { NextResponse } from "next/server";
import { emitDte } from "@/lib/sii/emit";
import type { SiiSettings } from "@/lib/sii/dte";
import type { Client, Company, Invoice } from "@/lib/types";
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
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    invoice?: Invoice;
    company?: Company;
    client?: Client;
    settings?: SiiSettings;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (!body.invoice || !body.company || !body.client || !body.settings) {
    return NextResponse.json({ error: "Faltan invoice, company, client o settings." }, { status: 400 });
  }

  const result = await emitDte({
    invoice: body.invoice,
    company: body.company,
    client: body.client,
    settings: body.settings,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.message, issues: result.issues },
      { status: 422 },
    );
  }

  const { apiKey: _apiKey, ...safeSettings } = result.settings;
  return NextResponse.json({
    invoice: result.invoice,
    settings: safeSettings,
    xml: result.xml,
    trackId: result.trackId,
    folio: result.folio,
    dteType: result.dteType,
    provider: result.provider,
  });
}
