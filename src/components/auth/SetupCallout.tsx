"use client";

import { useAuth } from "@/lib/auth";

export function SetupCallout() {
  const { configured } = useAuth();
  if (configured) return null;
  return (
    <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-sm leading-relaxed text-secondary">
      Falta conectar Supabase. Copia .env.example a .env.local, pega URL y anon key,
      corre supabase/schema.sql en el SQL Editor y reinicia el servidor.
    </div>
  );
}
