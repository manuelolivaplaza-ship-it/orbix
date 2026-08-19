import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServiceRoleKey, getSiteUrl, getSupabaseConfig } from "@/lib/supabase/config";
import { createClient as createServerSupabase } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { url, configured } = getSupabaseConfig();
  const serviceKey = getServiceRoleKey();
  if (!configured || !serviceKey) {
    return NextResponse.json({ sent: false, reason: "no-service-role" }, { status: 200 });
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { email?: string; name?: string };
  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { name: body.name ?? "" },
    redirectTo: `${getSiteUrl()}/auth/callback?next=/dashboard`,
  });
  if (error) {
    return NextResponse.json({ sent: false, reason: error.message }, { status: 200 });
  }
  return NextResponse.json({ sent: true });
}
