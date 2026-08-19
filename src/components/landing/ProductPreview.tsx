"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Orb } from "@/components/orb/Orb";
import { cn } from "@/lib/cn";

const METRICS = [
  { label: "Cobrados", value: "$19.504.100", hint: "6 pagadas" },
  { label: "Pendientes", value: "$9.049.950", hint: "3 por cobrar" },
  { label: "Nómina", value: "$11.194.828", hint: "6 en ficha" },
];

const ROWS = [
  { title: "F-1049 enviada", detail: "Constructora Río Claro", amount: "$2.850.550" },
  { title: "Nómina aprobada", detail: "Camila Soto · julio", amount: "Ayer" },
  { title: "F-1050 emitida", detail: "Colegio Los Alerces", amount: "$1.240.000" },
];

const BEATS = [
  { status: "Trabajando", text: "Emitiendo F-1050…" },
  { status: "Revisando", text: "3 facturas vencidas" },
  { status: "Listo", text: "4 facturas · $8.240.000" },
];

export function ProductPreview({ className }: { className?: string }) {
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setBeat((n) => (n + 1) % BEATS.length);
    }, 3400);
    return () => window.clearInterval(id);
  }, []);

  const current = BEATS[beat] ?? BEATS[0];

  return (
    <div className={cn("relative", className)} aria-hidden>
      <div className="pointer-events-none absolute -inset-12 rounded-[48px] bg-foreground/[0.04] blur-3xl" />
      <motion.div
        className="relative overflow-hidden rounded-[22px] border border-line bg-elevated shadow-[0_24px_70px_rgba(23,23,22,0.10)] dark:shadow-[0_32px_90px_rgba(0,0,0,0.55)]"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex h-11 items-center gap-3 border-b border-line px-4">
          <span className="flex gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full bg-faint/80" />
            <i className="h-2.5 w-2.5 rounded-full bg-faint/60" />
            <i className="h-2.5 w-2.5 rounded-full bg-faint/40" />
          </span>
          <span className="text-[11px] font-medium text-secondary">Escritorio</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden rounded-full border border-line px-2.5 py-0.5 text-[10px] text-secondary sm:inline">
              Tú controlas
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-foreground/[0.04] px-2.5 py-0.5 text-[10px] text-ink">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground/70 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-foreground" />
              </span>
              En vivo
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-[200px_minmax(0,1fr)]">
          <aside className="hidden border-r border-line bg-base/50 p-4 lg:flex lg:flex-col">
            <p className="text-[10px] uppercase tracking-[0.22em] text-faint">Chat con Orb</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl bg-foreground/[0.04] px-3 py-2.5 text-[12px] leading-relaxed text-secondary">
                Cierra la facturación de agosto y avísame.
                <p className="mt-1.5 text-[10px] text-faint">Tú</p>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={beat}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.28 }}
                  className="rounded-2xl border border-line bg-surface px-3 py-2.5"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <Orb size={20} trackPointer={false} label="" />
                    <span className="text-[10px] uppercase tracking-wider text-muted">{current.status}</span>
                  </div>
                  <p className="text-[12px] leading-relaxed text-ink">{current.text}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </aside>

          <div className="bg-base p-3 sm:p-5">
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted">Dashboard</p>
            <div className="mt-1 flex items-end justify-between gap-3">
              <h3 className="text-[15px] font-medium tracking-tight text-ink sm:text-lg">
                Andes Tecnología SpA
              </h3>
              <span className="hidden rounded-full border border-line px-2 py-0.5 text-[10px] text-secondary sm:inline">
                Agosto 2026
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {METRICS.map((metric) => (
                <div key={metric.label} className="rounded-xl border border-line bg-surface px-2.5 py-2.5 sm:px-3 sm:py-3">
                  <p className="text-[9px] uppercase tracking-wider text-muted">{metric.label}</p>
                  <p className="mt-1 font-mono text-[11px] text-ink sm:text-[13px]">{metric.value}</p>
                  <p className="mt-0.5 text-[10px] text-faint">{metric.hint}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-xl border border-line bg-surface p-3">
                <p className="text-[11px] text-secondary">Ingresos</p>
                <Sparkline />
              </div>
              <div className="rounded-xl border border-line bg-surface p-3">
                <p className="text-[11px] text-secondary">Actividad</p>
                <ul className="mt-2 space-y-2">
                  {ROWS.map((row) => (
                    <li key={row.title} className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-[11px] text-ink">{row.title}</p>
                        <p className="truncate text-[10px] text-faint">{row.detail}</p>
                      </div>
                      <span className="shrink-0 font-mono text-[10px] text-muted">{row.amount}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-base via-base/40 to-transparent" />
      </motion.div>
    </div>
  );
}

function Sparkline() {
  return (
    <svg viewBox="0 0 320 110" className="mt-1 h-[84px] w-full sm:h-[108px]" fill="none">
      <defs>
        <linearGradient id="orbix-spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--orbix-ink)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--orbix-ink)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 70 C28 68, 48 92, 72 78 S118 28, 150 36 S198 88, 230 72 S280 44, 320 38 V110 H0 Z"
        fill="url(#orbix-spark)"
      />
      <path
        d="M0 70 C28 68, 48 92, 72 78 S118 28, 150 36 S198 88, 230 72 S280 44, 320 38"
        stroke="var(--orbix-ink)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M0 58 C40 60, 80 62, 120 64 S200 70, 240 76 S290 86, 320 90"
        stroke="var(--orbix-muted)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
