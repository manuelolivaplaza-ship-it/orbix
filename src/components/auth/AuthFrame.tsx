"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Orb } from "@/components/orb/Orb";
import type { OrbState } from "@/lib/orb";
import { ThemeToggle } from "@/components/theme-toggle";

export function AuthFrame({
  title,
  subtitle,
  children,
  orb = "idle",
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  orb?: OrbState;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-base text-ink px-4 py-12 overflow-hidden selection:bg-foreground/10">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-[36rem] rounded-full bg-gradient-to-b from-amber-500/10 via-violet-500/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_srgb,var(--foreground)_5%,transparent),transparent_60%)]" />

      {/* Top navigation */}
      <div className="absolute top-5 left-5 right-5 mx-auto max-w-5xl flex items-center justify-between z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-line bg-base/60 backdrop-blur-md px-3.5 py-1.5 text-xs font-medium text-secondary hover:text-ink hover:bg-foreground/[0.04] transition-all"
        >
          <ArrowLeft size={13} />
          <span>Inicio</span>
        </Link>
        <ThemeToggle className="rounded-full size-9 border-line bg-base/60 backdrop-blur-md" />
      </div>

      {/* Auth Card */}
      <div className="relative w-full max-w-[420px] rounded-[28px] border border-line bg-surface/85 backdrop-blur-2xl shadow-[0_24px_70px_rgba(0,0,0,0.06)] dark:shadow-[0_30px_90px_rgba(0,0,0,0.45)] p-7 sm:p-9 z-10 transition-all">
        <div className="mb-6 flex flex-col items-center justify-center text-center">
          <Link href="/" className="group inline-flex items-center justify-center p-1 mb-3 transition-transform group-hover:scale-105">
            <Orb size={76} state={orb} playful hop flourish />
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
          <p className="mt-1.5 text-sm text-secondary leading-relaxed">{subtitle}</p>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
