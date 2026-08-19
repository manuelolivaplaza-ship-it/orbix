"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { AuthFrame } from "@/components/auth/AuthFrame";
import { SetupCallout } from "@/components/auth/SetupCallout";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { SuccessBanner } from "@/components/ui/EmptyState";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth-errors";
import { useStore } from "@/lib/store";

export default function RegisterPage() {
  const router = useRouter();
  const { register, loginWithGoogle, configured } = useStore();
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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

  async function handleGoogleSignup() {
    if (!configured) {
      setError("Conecta Supabase antes de usar Google.");
      setOrb("error");
      return;
    }
    setGoogleLoading(true);
    setOrb("working");
    setError("");
    const result = await loginWithGoogle();
    if (!result.ok) {
      setGoogleLoading(false);
      setError(result.error);
      setOrb("error");
    }
  }

  if (confirmEmail) {
    return (
      <AuthFrame title="Revisa tu correo" subtitle="Confirmamos la cuenta antes de entrar." orb="happy">
        <SuccessBanner>
          Te enviamos un enlace de confirmación a <strong className="font-semibold text-ink">{confirmEmail}</strong>. Ábrelo para activar tu cuenta.
        </SuccessBanner>
        <Link href="/login" className="block mt-5">
          <Button className="w-full h-11 rounded-xl" variant="secondary">
            Ir a iniciar sesión
          </Button>
        </Link>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame title="Crea tu cuenta en Orbix" subtitle="Empieza a operar tu empresa en minutos" orb={orb}>
      <div className="space-y-4">
        <SetupCallout />

        {/* Google Sign In */}
        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={googleLoading || submitting}
          className="w-full flex items-center justify-center gap-3 h-11 px-4 rounded-xl border border-line bg-surface hover:bg-foreground/[0.04] text-ink text-sm font-medium transition-all shadow-xs active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          <svg className="size-4.5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>{googleLoading ? "Conectando…" : "Registrarse con Google"}</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-3">
          <div className="border-t border-line w-full" />
          <span className="bg-surface px-3 text-[11px] uppercase tracking-wider text-muted shrink-0 font-medium">
            o completa tus datos
          </span>
          <div className="border-t border-line w-full" />
        </div>

        <form onSubmit={submit} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-secondary">Tu nombre</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Francisca Lagos"
                autoComplete="name"
                required
                className="h-10 rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium text-secondary">Tu empresa</Label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Andes SpA"
                required
                className="h-10 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium text-secondary">Correo electrónico</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@empresa.cl"
              autoComplete="email"
              required
              className="h-10 rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium text-secondary">Contraseña</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`}
                autoComplete="new-password"
                required
                minLength={MIN_PASSWORD_LENGTH}
                className="h-10 rounded-xl pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors p-1"
                aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium text-secondary">Confirma tu contraseña</Label>
            <Input
              type={showPassword ? "text" : "password"}
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              placeholder="Repite la contraseña"
              autoComplete="new-password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              className="h-10 rounded-xl"
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-2.5 text-xs text-red-400">
              {error}
            </div>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="w-full h-11 rounded-xl text-sm font-medium shadow-sm transition-transform active:scale-[0.99] mt-2"
            disabled={submitting || googleLoading || !configured}
          >
            {submitting ? "Creando workspace…" : "Crear mi cuenta"}
          </Button>

          <p className="text-center text-xs text-secondary pt-2">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-semibold text-ink hover:underline">
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </AuthFrame>
  );
}
