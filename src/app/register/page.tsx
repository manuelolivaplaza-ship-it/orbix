"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthFrame } from "@/components/auth/AuthFrame";
import { SetupCallout } from "@/components/auth/SetupCallout";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { SuccessBanner } from "@/components/ui/EmptyState";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth-errors";
import { useStore } from "@/lib/store";

export default function RegisterPage() {
  const router = useRouter();
  const { register, configured } = useStore();
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orb, setOrb] = useState<"idle" | "working" | "error" | "happy">("idle");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!configured) {
      setError("Conecta Supabase antes de crear la cuenta.");
      setOrb("error");
      return;
    }
    if (password !== password2) {
      setError("Las claves no coinciden.");
      setOrb("error");
      return;
    }
    setSubmitting(true);
    setOrb("working");
    setError("");
    const result = await register(name, email, password, companyName);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      setOrb("error");
      return;
    }
    if (result.needsEmailConfirm) {
      setConfirmEmail(email);
      setOrb("happy");
      return;
    }
    setOrb("happy");
    router.push("/dashboard");
  }

  if (confirmEmail) {
    return (
      <AuthFrame title="Revisa tu correo" subtitle="Confirmamos la cuenta antes de entrar." orb="happy">
        <SuccessBanner>
          Te enviamos un enlace a {confirmEmail}. Ábrelo y vuelve a iniciar sesión.
        </SuccessBanner>
        <Link href="/login">
          <Button className="mt-4 w-full" variant="secondary">
            Ir al login
          </Button>
        </Link>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame title="Crea tu workspace" subtitle="Tu empresa, no una cuenta de prueba." orb={orb}>
      <form onSubmit={submit} className="space-y-4">
        <SetupCallout />
        <div>
          <Label>Nombre</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Francisca Lagos"
            autoComplete="name"
            required
          />
        </div>
        <div>
          <Label>Empresa</Label>
          <Input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Nombre de tu empresa"
            required
          />
        </div>
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
        <div>
          <Label>Contraseña</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`}
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD_LENGTH}
          />
        </div>
        <div>
          <Label>Repite la contraseña</Label>
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
        <Button type="submit" className="w-full" disabled={submitting || !configured}>
          {submitting ? "Creando…" : "Crear cuenta"}
        </Button>
        <p className="text-center text-sm text-muted">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-ink hover:text-foreground">
            Entrar
          </Link>
        </p>
      </form>
    </AuthFrame>
  );
}
