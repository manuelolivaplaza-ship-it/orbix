"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = !mounted || resolvedTheme !== "light";

  return (
    <Button
      variant="outline"
      size="icon-sm"
      className={className}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  );
}

export function ThemePicker() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const current = mounted && resolvedTheme === "light" ? "light" : "dark";

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={cn(
          "rounded-2xl border border-line p-3 text-left transition-colors hover:bg-foreground/[0.03]",
          current === "light" && "ring-2 ring-foreground/80",
        )}
      >
        <div className="overflow-hidden rounded-xl bg-[#f3f3f0] ring-1 ring-black/8">
          <div className="flex h-8 items-center gap-1.5 border-b border-black/8 px-3">
            <span className="size-1.5 rounded-full bg-[#d4d4d0]" />
            <span className="size-1.5 rounded-full bg-[#c4c4be]" />
            <span className="ml-2 h-1.5 w-12 rounded-full bg-[#171716]/25" />
          </div>
          <div className="grid grid-cols-[36px_1fr] gap-2 p-2">
            <div className="h-14 rounded-md bg-[#ebebe6]" />
            <div className="space-y-1.5">
              <div className="h-5 rounded-md bg-[#e3e3de]" />
              <div className="h-8 rounded-md bg-[#e8e8e4]" />
            </div>
          </div>
        </div>
        <p className="mt-3 text-sm font-medium text-ink">Claro</p>
        <p className="mt-0.5 text-xs text-muted-foreground">Papel, un tono bajo el blanco.</p>
      </button>

      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={cn(
          "rounded-2xl border border-line p-3 text-left transition-colors hover:bg-foreground/[0.03]",
          current === "dark" && "ring-2 ring-foreground/80",
        )}
      >
        <div className="overflow-hidden rounded-xl bg-[#0f1112] ring-1 ring-white/10">
          <div className="flex h-8 items-center gap-1.5 border-b border-white/8 px-3">
            <span className="size-1.5 rounded-full bg-[#3d3d3d]" />
            <span className="size-1.5 rounded-full bg-[#2a2a2a]" />
            <span className="ml-2 h-1.5 w-12 rounded-full bg-white/25" />
          </div>
          <div className="grid grid-cols-[36px_1fr] gap-2 p-2">
            <div className="h-14 rounded-md bg-[#181c1f]" />
            <div className="space-y-1.5">
              <div className="h-5 rounded-md bg-[#22272b]" />
              <div className="h-8 rounded-md bg-[#1c2124]" />
            </div>
          </div>
        </div>
        <p className="mt-3 text-sm font-medium text-ink">Oscuro</p>
        <p className="mt-0.5 text-xs text-muted-foreground">Carbón, para trabajar de noche.</p>
      </button>
    </div>
  );
}
