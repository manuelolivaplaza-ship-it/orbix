"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthFrame } from "@/components/auth/AuthFrame";
import { SetupCallout } from "@/components/auth/SetupCallout";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { useStore } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const { login, configured } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orb, setOrb] = useState<"idle" | "working" | "error" | "success">("idle");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!configured) {
      setError("Conecta Supabase antes de entrar.");
      setOrb("error");
      return;
    }
    setSubmitting(true);
    setOrb("working");
    setError("");
    const result = await login(email, password);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      setOrb("error");
      return;
    }
    setOrb("success");
    const next = new URLSearchParams(window.location.search).get("next");
    router.push(next?.startsWith("/") ? next : "/dashboard");
  }

  return (
    <AuthFrame title="Entrar a Orbix" subtitle="Usa tu correo y contraseña." orb={orb}>
      <form onSubmit={submit} className="space-y-4">
        <SetupCallout />
        <div>
          <Label>Correo</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            placeholder="tu@empresa.cl"
          />
        </div>
        <div>
          <Label>Contraseña</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={submitting || !configured}>
          {submitting ? "Entrando…" : "Entrar"}
        </Button>
        <div className="flex items-center justify-between text-sm text-muted">
          <Link href="/forgot" className="hover:text-ink">
            Olvidé mi clave
          </Link>
          <Link href="/register" className="hover:text-ink">
            Crear cuenta
          </Link>
        </div>
      </form>
    </AuthFrame>
  );
}
