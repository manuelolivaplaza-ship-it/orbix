"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Orb } from "@/components/orb/Orb";
import { Sparkles, Terminal, FileSpreadsheet, Bot, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Scenario {
  prompt: string;
  tool: string;
  outputTitle: string;
  response: string;
  badge: string;
}

const SCENARIOS: Scenario[] = [
  {
    prompt: "¿Cuánto tengo vencido por cobrar este mes?",
    tool: "queryInvoices({ status: 'vencida' })",
    outputTitle: "3 Facturas Encontradas · Total $9.049.950",
    response: "Tienes 3 facturas vencidas: Constructora Río Claro ($2.850.550), Colegio Los Alerces ($1.240.000) y Servicios Mineros ($4.959.400). ¿Quieres que envíe un recordatorio automático por WhatsApp ahora?",
    badge: "Cobranza Activa",
  },
  {
    prompt: "Crea un borrador de factura para Clínica Austral por $4.150.000 neto",
    tool: "createDraftInvoice({ client: 'Clínica Puerto Austral', net: 4150000, iva: 788500 })",
    outputTitle: "Borrador DTE Nº 1051 Creado Exitosamente",
    response: "Borrador de Factura Nº 1051 generado: $4.150.000 Neto + $788.500 IVA (19%) = Total $4.938.500. Vencimiento configurado a 30 días. Listo para tu firma digital.",
    badge: "Emisión DTE",
  },
  {
    prompt: "Revisa si la nómina de agosto tiene diferencias en Previred",
    tool: "auditPayrollPrevired({ period: '2026-08' })",
    outputTitle: "Auditoría Previred: 6 Colaboradores Verificados",
    response: "Auditoría completada al 100%. No hay descalces: los cálculos de Habitat, Cuprum, Fonasa y Colmena coinciden con los tramos oficiales de agosto 2026.",
    badge: "Auditoría Nómina",
  },
  {
    prompt: "Importa este archivo clientes.xlsx y actualiza sus RUTs",
    tool: "importSpreadsheet({ file: 'clientes.xlsx', rows: 42 })",
    outputTitle: "42 Clientes Sincronizados y Validados ante SII",
    response: "He procesado las 42 filas del Excel. Todos los RUTs fueron formateados con dígito verificador y vinculados al catálogo de facturación.",
    badge: "Excel / CSV",
  },
];

export function AiShowcase() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const current = SCENARIOS[selectedIdx];

  return (
    <section className="py-24 border-t border-line relative overflow-hidden bg-surface/30">
      {/* Background Glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-gradient-to-tr from-amber-500/10 via-violet-500/10 to-sky-500/10 blur-3xl opacity-60" />

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Description Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold">
              <Sparkles size={14} /> Inteligencia Operativa Real
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink leading-tight">
              Un asistente que no solo responde: ejecuta trabajo real
            </h2>

            <p className="text-base sm:text-lg text-secondary leading-relaxed">
              Orb está conectado directamente a tu base de datos tributaria y financiera. Le hablas en español cotidiano y realiza acciones complejas: emitir borradores, conciliar cuentas, auditar Previred y procesar planillas masivas.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="size-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  ✓
                </div>
                <p className="text-xs sm:text-sm text-secondary">
                  <strong>Cero alucinaciones financieras</strong>: Usa herramientas estrictas y datos de tu empresa.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  ✓
                </div>
                <p className="text-xs sm:text-sm text-secondary">
                  <strong>Humano en el control</strong>: Orb prepara los cálculos y borradores; tú siempre tienes la última palabra antes de timbrar o transferir.
                </p>
              </div>
            </div>

            <div className="pt-4">
              <Link href="/register">
                <Button size="lg" className="rounded-full px-6 h-11 text-sm font-semibold">
                  Probar Orb con tu empresa <ArrowRight size={15} />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Interactive Live Terminal */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-line bg-surface/90 p-5 sm:p-7 shadow-2xl backdrop-blur-2xl space-y-5">
              {/* Terminal Header */}
              <div className="flex items-center justify-between border-b border-line pb-4">
                <div className="flex items-center gap-3">
                  <Orb size={32} state="idle" playful trackPointer={false} />
                  <div>
                    <p className="text-xs font-bold text-ink flex items-center gap-1.5">
                      Orb AI Core <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    </p>
                    <p className="text-[10px] text-muted">Motor OpenCode Go · Latencia ultra-baja</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-line bg-foreground/[0.04] text-secondary">
                  {current.badge}
                </span>
              </div>

              {/* Prompt Scenario Selector Buttons */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Selecciona una instrucción de prueba:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SCENARIOS.map((s, idx) => (
                    <button
                      key={s.prompt}
                      onClick={() => setSelectedIdx(idx)}
                      className={cn(
                        "p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer",
                        selectedIdx === idx
                          ? "border-foreground bg-foreground text-background font-semibold shadow-xs"
                          : "border-line bg-surface hover:bg-foreground/[0.04] text-secondary hover:text-ink"
                      )}
                    >
                      <span className="line-clamp-2">💬 “{s.prompt}”</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Execution Box */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.prompt}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-2xl border border-line bg-base/80 p-4 space-y-3 font-sans"
                >
                  {/* Tool execution badge */}
                  <div className="flex items-center gap-2 text-[11px] font-mono text-muted">
                    <Terminal size={13} className="text-emerald-500" />
                    <span>Ejecutando tool:</span>
                    <span className="text-ink font-semibold truncate bg-foreground/[0.05] px-2 py-0.5 rounded">
                      {current.tool}
                    </span>
                  </div>

                  {/* Output Card */}
                  <div className="p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 text-xs flex items-center justify-between">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 size={14} /> {current.outputTitle}
                    </span>
                    <span className="text-[10px] font-mono text-muted">240ms</span>
                  </div>

                  {/* Final Natural Language Response */}
                  <div className="p-3.5 rounded-xl bg-surface border border-line text-xs text-ink leading-relaxed">
                    <p className="font-semibold text-muted text-[10px] uppercase mb-1">Orb Responde:</p>
                    <p>{current.response}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
