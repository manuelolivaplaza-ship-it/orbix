"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, FileSpreadsheet, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function formatCLP(val: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(val);
}

export function InteractiveSimulator() {
  const [tab, setTab] = useState<"sueldo" | "iva">("sueldo");
  const [sueldoBruto, setSueldoBruto] = useState(1500000);
  const [netoFactura, setNetoFactura] = useState(2500000);

  // Chilean Payroll Calculation
  const afpRate = 0.1145; // Habitat / standard average
  const fonasaRate = 0.07; // 7% legal
  const afcWorkerRate = 0.006; // 0.6% plazo indefinido
  const totalWorkerDiscountRate = afpRate + fonasaRate + afcWorkerRate; // ~19.05%

  const afpAmount = Math.round(sueldoBruto * afpRate);
  const fonasaAmount = Math.round(sueldoBruto * fonasaRate);
  const afcAmount = Math.round(sueldoBruto * afcWorkerRate);
  const totalWorkerDiscounts = afpAmount + fonasaAmount + afcAmount;
  const sueldoLiquido = sueldoBruto - totalWorkerDiscounts;

  // Employer costs (Chile)
  const sisRate = 0.0149; // 1.49% SIS
  const mutualRate = 0.0093; // 0.93% Ley Accidentes
  const afcEmployerRate = 0.024; // 2.4% AFC empleador
  const employerCost = Math.round(sueldoBruto * (1 + sisRate + mutualRate + afcEmployerRate));

  // Invoice IVA calculation
  const ivaRate = 0.19;
  const ivaAmount = Math.round(netoFactura * ivaRate);
  const totalFactura = netoFactura + ivaAmount;
  const ppmEstimated = Math.round(netoFactura * 0.015); // 1.5% standard PPM

  return (
    <section className="py-24 border-t border-line bg-surface/20 relative overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">Simulador Interactivo</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-ink">
            Calcula en tiempo real con las leyes de Chile
          </h2>
          <p className="mt-3 text-sm sm:text-base text-secondary">
            Prueba cómo Orbix automatiza las matemáticas de nómina y facturación sin planillas complejas.
          </p>

          {/* Toggle Tab Pills */}
          <div className="mt-8 inline-flex p-1 rounded-2xl bg-surface border border-line shadow-xs">
            <button
              onClick={() => setTab("sueldo")}
              className={cn(
                "px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2",
                tab === "sueldo" ? "bg-foreground text-background shadow-xs" : "text-secondary hover:text-ink"
              )}
            >
              <Calculator size={14} /> Sueldo Líquido & Previred
            </button>
            <button
              onClick={() => setTab("iva")}
              className={cn(
                "px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2",
                tab === "iva" ? "bg-foreground text-background shadow-xs" : "text-secondary hover:text-ink"
              )}
            >
              <FileSpreadsheet size={14} /> Facturación & IVA (19%)
            </button>
          </div>
        </div>

        {/* Simulator Box */}
        <div className="max-w-4xl mx-auto rounded-3xl border border-line bg-surface/70 p-6 sm:p-10 shadow-lg backdrop-blur-xl">
          <AnimatePresence mode="wait">
            {tab === "sueldo" ? (
              <motion.div
                key="sueldo-sim"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted">
                      Sueldo Bruto Imponible:
                    </label>
                    <span className="font-mono text-2xl font-bold text-ink">{formatCLP(sueldoBruto)}</span>
                  </div>
                  <input
                    type="range"
                    min={500000}
                    max={4500000}
                    step={50000}
                    value={sueldoBruto}
                    onChange={(e) => setSueldoBruto(Number(e.target.value))}
                    className="w-full accent-foreground cursor-pointer h-2 bg-foreground/10 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-muted font-mono mt-1">
                    <span>$500.000</span>
                    <span>$2.500.000</span>
                    <span>$4.500.000</span>
                  </div>
                </div>

                {/* Calculation Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl border border-line bg-surface space-y-1">
                    <span className="text-[10.5px] font-bold text-muted uppercase tracking-wider">
                      Descuentos Previred
                    </span>
                    <p className="font-mono text-lg font-bold text-red-500">-{formatCLP(totalWorkerDiscounts)}</p>
                    <p className="text-[10px] text-muted">AFP (11.45%) + Fonasa (7%) + AFC</p>
                  </div>

                  <div className="p-4 rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/[0.04] space-y-1">
                    <span className="text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Sueldo Líquido a Pagar
                    </span>
                    <p className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCLP(sueldoLiquido)}
                    </p>
                    <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-medium">
                      Monto final transferido al trabajador
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-line bg-surface space-y-1">
                    <span className="text-[10.5px] font-bold text-muted uppercase tracking-wider">
                      Costo Total Empresa
                    </span>
                    <p className="font-mono text-lg font-bold text-ink">{formatCLP(employerCost)}</p>
                    <p className="text-[10px] text-muted">Incluye SIS (1.49%), Mutual y AFC</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="iva-sim"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted">
                      Monto Neto Factura:
                    </label>
                    <span className="font-mono text-2xl font-bold text-ink">{formatCLP(netoFactura)}</span>
                  </div>
                  <input
                    type="range"
                    min={200000}
                    max={15000000}
                    step={100000}
                    value={netoFactura}
                    onChange={(e) => setNetoFactura(Number(e.target.value))}
                    className="w-full accent-foreground cursor-pointer h-2 bg-foreground/10 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-muted font-mono mt-1">
                    <span>$200.000</span>
                    <span>$7.500.000</span>
                    <span>$15.000.000</span>
                  </div>
                </div>

                {/* Calculation Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl border border-line bg-surface space-y-1">
                    <span className="text-[10.5px] font-bold text-muted uppercase tracking-wider">
                      IVA Débito Fiscal (19%)
                    </span>
                    <p className="font-mono text-lg font-bold text-amber-500">+{formatCLP(ivaAmount)}</p>
                    <p className="text-[10px] text-muted">Impuesto a enterar en F29</p>
                  </div>

                  <div className="p-4 rounded-2xl border-2 border-foreground/30 bg-foreground/[0.03] space-y-1">
                    <span className="text-[10.5px] font-bold text-ink uppercase tracking-wider">
                      Total Facturado a Cobrar
                    </span>
                    <p className="font-mono text-2xl font-bold text-ink">{formatCLP(totalFactura)}</p>
                    <p className="text-[10px] text-secondary">Monto bruto DTE aceptado</p>
                  </div>

                  <div className="p-4 rounded-2xl border border-line bg-surface space-y-1">
                    <span className="text-[10.5px] font-bold text-muted uppercase tracking-wider">
                      PPM Estimado (1.5%)
                    </span>
                    <p className="font-mono text-lg font-bold text-ink">{formatCLP(ppmEstimated)}</p>
                    <p className="text-[10px] text-muted">Pago provisional mensual</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-secondary">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck size={16} className="text-emerald-500" /> Parámetros legales vigentes según normativa SII y Previred
            </span>
            <Link href="/register">
              <Button size="sm" className="rounded-full px-5 h-9 font-semibold">
                Emitir con Orbix <ArrowRight size={13} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
