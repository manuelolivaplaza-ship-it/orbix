"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Users,
  Landmark,
  Building2,
  CheckCircle2,
  Send,
  Download,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Check,
  Percent,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function BentoFeatures() {
  const [activePayrollTab, setActivePayrollTab] = useState<"camila" | "diego">("camila");
  const [reminderSent, setReminderSent] = useState(false);
  const [bankMatched, setBankMatched] = useState(true);
  const [activeCompanyDemo, setActiveCompanyDemo] = useState<"andes" | "puerto">("andes");

  const triggerReminder = () => {
    setReminderSent(true);
    setTimeout(() => setReminderSent(false), 3000);
  };

  return (
    <section id="producto" className="py-24 relative overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">Capacidades del Sistema</p>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink">
            Todo lo que tu empresa necesita en un solo motor operativo
          </h2>
          <p className="mt-4 text-base sm:text-lg text-secondary leading-relaxed">
            Diseñado para reemplazar el desorden de múltiples planillas y sistemas desconectados. Facturación, nómina, bancos y tu asistente inteligente en perfecta sintonía.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Bento Card 1: Facturación & Cobranza Activa (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl border border-line bg-surface/50 p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:border-foreground/20 transition-all">
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-line bg-foreground/[0.04] text-xs font-semibold text-ink">
                  <FileText size={14} /> Facturación & Cobranza DTE
                </div>
                <span className="text-[11px] font-mono text-emerald-500 font-bold flex items-center gap-1">
                  <CheckCircle2 size={13} /> SII En Línea
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
                Emite facturas y cobra a tiempo sin fricción
              </h3>
              <p className="mt-2 text-sm text-secondary leading-relaxed">
                Calcula IVA, genera el PDF timbrado con código de barras y envía recordatorios de cobranza automáticos por correo y WhatsApp.
              </p>
            </div>

            {/* Interactive Invoice Card Preview */}
            <div className="mt-6 rounded-2xl border border-line bg-surface p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div>
                  <span className="text-[10px] font-bold font-mono text-muted uppercase">DTE Electrónico</span>
                  <p className="text-sm font-bold text-ink">Factura Nº 1052 · Constructora Río Claro</p>
                </div>
                <span className="text-xs font-mono font-bold text-ink bg-foreground/[0.05] px-2.5 py-1 rounded-lg">
                  $3.450.000 + IVA
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs py-1">
                <div className="p-2 rounded-xl bg-foreground/[0.02] border border-line">
                  <span className="text-[10px] text-muted block font-semibold">Neto</span>
                  <span className="font-mono font-bold text-ink">$3.450.000</span>
                </div>
                <div className="p-2 rounded-xl bg-foreground/[0.02] border border-line">
                  <span className="text-[10px] text-muted block font-semibold">IVA (19%)</span>
                  <span className="font-mono font-bold text-ink">$655.500</span>
                </div>
                <div className="p-2 rounded-xl bg-foreground/[0.05] border border-line">
                  <span className="text-[10px] text-muted block font-semibold">Total</span>
                  <span className="font-mono font-bold text-ink">$4.105.500</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-[11px] text-amber-500 font-semibold flex items-center gap-1">
                  ⏳ Vencimiento: En 3 días
                </span>
                <button
                  onClick={triggerReminder}
                  disabled={reminderSent}
                  className="h-8 px-3.5 rounded-xl bg-foreground text-background text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Send size={12} />
                  {reminderSent ? "✓ Aviso Enviado por WhatsApp" : "Enviar Recordatorio de Cobro"}
                </button>
              </div>
            </div>
          </div>

          {/* Bento Card 2: Nómina & Previred Exacto (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl border border-line bg-surface/50 p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:border-foreground/20 transition-all">
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-line bg-foreground/[0.04] text-xs font-semibold text-ink">
                  <Users size={14} /> Nómina & Previred
                </div>
                <span className="text-[11px] font-mono text-emerald-500 font-bold">100% Automático</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
                Leyes sociales y liquidaciones sin errores
              </h3>
              <p className="mt-2 text-sm text-secondary leading-relaxed">
                AFP, Isapre, Fonasa, Gratificación legal 25%, turnos y vacaciones calculados en un clic.
              </p>
            </div>

            {/* Interactive Liquidación Toggle */}
            <div className="mt-6 rounded-2xl border border-line bg-surface p-4 shadow-xs space-y-3">
              <div className="flex gap-1.5 p-1 rounded-xl bg-foreground/[0.03] border border-line">
                <button
                  onClick={() => setActivePayrollTab("camila")}
                  className={cn(
                    "flex-1 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                    activePayrollTab === "camila" ? "bg-foreground text-background shadow-xs" : "text-secondary hover:text-ink"
                  )}
                >
                  Camila (Habitat/Fonasa)
                </button>
                <button
                  onClick={() => setActivePayrollTab("diego")}
                  className={cn(
                    "flex-1 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                    activePayrollTab === "diego" ? "bg-foreground text-background shadow-xs" : "text-secondary hover:text-ink"
                  )}
                >
                  Diego (Cuprum/Colmena)
                </button>
              </div>

              <div className="space-y-1.5 text-xs">
                {activePayrollTab === "camila" ? (
                  <>
                    <div className="flex justify-between text-secondary">
                      <span>Sueldo Base + Gratificación (25%):</span>
                      <span className="font-mono font-medium text-ink">$2.280.000</span>
                    </div>
                    <div className="flex justify-between text-muted text-[11.5px]">
                      <span>Descuentos (AFP Habitat + Fonasa 7% + AFC):</span>
                      <span className="font-mono text-red-500">-$430.000</span>
                    </div>
                    <div className="flex justify-between font-bold pt-1.5 border-t border-line text-ink">
                      <span>Líquido a Pagar:</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 text-sm">$1.850.000</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-secondary">
                      <span>Sueldo Base + Gratificación:</span>
                      <span className="font-mono font-medium text-ink">$1.760.000</span>
                    </div>
                    <div className="flex justify-between text-muted text-[11.5px]">
                      <span>Descuentos (AFP Cuprum + Colmena + AFC):</span>
                      <span className="font-mono text-red-500">-$340.000</span>
                    </div>
                    <div className="flex justify-between font-bold pt-1.5 border-t border-line text-ink">
                      <span>Líquido a Pagar:</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 text-sm">$1.420.000</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Bento Card 3: Conciliación Bancaria & Caja (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl border border-line bg-surface/50 p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:border-foreground/20 transition-all">
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-line bg-foreground/[0.04] text-xs font-semibold text-ink">
                  <Landmark size={14} /> Caja & Bancos
                </div>
                <span className="text-[11px] font-mono text-emerald-500 font-bold">Cartolas al día</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
                Conciliación bancaria en tiempo real
              </h3>
              <p className="mt-2 text-sm text-secondary leading-relaxed">
                Vincula depósitos y transferencias con sus facturas correspondientes. Detecta descalces y proyecta tu flujo de caja.
              </p>
            </div>

            {/* Interactive Bank Match Visual */}
            <div className="mt-6 rounded-2xl border border-line bg-surface p-4 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-ink">
                <span>Movimiento en Banco de Chile</span>
                <span className="font-mono text-emerald-500 font-bold">+$4.150.000</span>
              </div>
              <div className="p-2.5 rounded-xl bg-foreground/[0.02] border border-line text-xs flex items-center justify-between">
                <div>
                  <p className="font-semibold text-ink">Transferencia Recibida: Clínica Austral</p>
                  <p className="text-[10px] text-muted">RUT 77.204.100-8 · 19 Agosto 2026</p>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] border border-emerald-500/20">
                  ✓ Match 100%
                </span>
              </div>
            </div>
          </div>

          {/* Bento Card 4: Multi-RUT & Estudios Contables (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl border border-line bg-surface/50 p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:border-foreground/20 transition-all">
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-line bg-foreground/[0.04] text-xs font-semibold text-ink">
                  <Building2 size={14} /> Multi-Empresa & Estudio
                </div>
                <span className="text-[11px] font-mono text-muted">1 RUT por plan</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
                Maneja múltiples razones sociales sin mezclar datos
              </h3>
              <p className="mt-2 text-sm text-secondary leading-relaxed">
                Cada empresa cuenta con su propia base de datos tributaria, clientes, colaboradores y configuración fiscal independiente. Cambia de empresa en 1 clic.
              </p>
            </div>

            {/* Interactive Multi-Company Switcher */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setActiveCompanyDemo("andes")}
                className={cn(
                  "p-3.5 rounded-2xl border transition-all cursor-pointer select-none",
                  activeCompanyDemo === "andes"
                    ? "border-foreground bg-surface shadow-xs"
                    : "border-line bg-surface/50 opacity-70 hover:opacity-100"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="size-6 rounded-lg bg-amber-500 text-white font-bold text-xs flex items-center justify-center">
                    A
                  </div>
                  {activeCompanyDemo === "andes" && (
                    <span className="text-[10px] font-bold text-emerald-500">● Activa</span>
                  )}
                </div>
                <p className="font-bold text-xs text-ink mt-2">Andes Tecnología SpA</p>
                <p className="text-[10px] text-muted font-mono">RUT 76.849.200-1 · 6 Colaboradores</p>
              </div>

              <div
                onClick={() => setActiveCompanyDemo("puerto")}
                className={cn(
                  "p-3.5 rounded-2xl border transition-all cursor-pointer select-none",
                  activeCompanyDemo === "puerto"
                    ? "border-foreground bg-surface shadow-xs"
                    : "border-line bg-surface/50 opacity-70 hover:opacity-100"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="size-6 rounded-lg bg-sky-500 text-white font-bold text-xs flex items-center justify-center">
                    P
                  </div>
                  {activeCompanyDemo === "puerto" && (
                    <span className="text-[10px] font-bold text-emerald-500">● Activa</span>
                  )}
                </div>
                <p className="font-bold text-xs text-ink mt-2">Puerto Austral Logística</p>
                <p className="text-[10px] text-muted font-mono">RUT 77.204.100-8 · 14 Colaboradores</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
