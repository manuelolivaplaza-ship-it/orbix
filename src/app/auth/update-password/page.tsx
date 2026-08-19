"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthFrame } from "@/components/auth/AuthFrame";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth-errors";
import { useStore } from "@/lib/store";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const { updatePassword, session, ready } = useStore();
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (password !== password2) {
      setError("Las claves no coinciden.");
      return;
    }
    setSubmitting(true);
    setError("");
    const result = await updatePassword(password);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/dashboard");
  }

  if (ready && !session) {
    return (
      <AuthFrame title="Enlace inválido" subtitle="Pide uno nuevo desde recuperar acceso." orb="error">
        <Link href="/forgot">
          <Button className="w-full">Recuperar acceso</Button>
        </Link>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame title="Nueva contraseña" subtitle="Elige una clave para esta cuenta." orb="idle">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label>Nueva clave</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            placeholder={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`}
          />
        </div>
        <div>
          <Label>Repite la clave</Label>
          <Input
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD_LENGTH}
          />
        </div>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Guardando…" : "Guardar y entrar"}
        </Button>
      </form>
    </AuthFrame>
  );
}
