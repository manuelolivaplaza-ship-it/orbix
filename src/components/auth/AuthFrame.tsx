"use client";

import Link from "next/link";
import { Orb } from "@/components/orb/Orb";
import type { OrbState } from "@/lib/orb";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_srgb,var(--foreground)_6%,transparent),transparent_42%)]" />
      <ThemeToggle className="absolute top-4 right-4" />
      <Card className="relative w-full max-w-md p-8">
        <CardContent className="p-0">
          <Link href="/" className="mb-6 flex items-center justify-center">
            <Orb size={76} state={orb} playful />
          </Link>
          <h1 className="text-center text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-center text-sm text-secondary">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </CardContent>
      </Card>
    </div>
  );
}
