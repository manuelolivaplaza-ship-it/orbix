"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthFrame } from "@/components/auth/AuthFrame";
import { SetupCallout } from "@/components/auth/SetupCallout";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { SuccessBanner } from "@/components/ui/EmptyState";
import { useStore } from "@/lib/store";

export default function ForgotPage() {
  const { resetPassword, configured } = useStore();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const result = await resetPassword(email);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSent(true);
  }

  return (
    <AuthFrame
      title="Recuperar acceso"
      subtitle="Te enviamos un enlace real a tu correo."
      orb={sent ? "success" : error ? "error" : "thinking"}
    >
      {sent ? (
        <div className="space-y-4">
          <SuccessBanner>Listo. Revisa {email} y abre el enlace para elegir una clave nueva.</SuccessBanner>
          <Link href="/login">
            <Button className="w-full" variant="secondary">
              Volver a entrar
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <SetupCallout />
          <div>
            <Label>Correo</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@empresa.cl"
              autoComplete="email"
              required
            />
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={submitting || !configured}>
            {submitting ? "Enviando…" : "Enviar instrucciones"}
          </Button>
          <p className="text-center text-sm text-muted">
            <Link href="/login" className="hover:text-ink">
              Volver al login
            </Link>
          </p>
        </form>
      )}
    </AuthFrame>
  );
}
