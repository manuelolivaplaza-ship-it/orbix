"use client";

import { AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function SetupCallout() {
  const { configured } = useAuth();
  if (configured) return null;
  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.07] dark:bg-amber-500/[0.12] p-3.5 text-xs leading-relaxed text-secondary flex items-start gap-3">
      <AlertCircle className="size-4 text-amber-500 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <p className="font-medium text-ink">Supabase no está conectado</p>
        <p className="text-secondary leading-normal">
          Configura tus variables en <code className="rounded bg-foreground/[0.06] px-1 py-0.5 text-[11px] font-mono">.env.local</code> o en el panel de Vercel.
        </p>
      </div>
    </div>
  );
}
