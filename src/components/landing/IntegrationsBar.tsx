"use client";

import { motion } from "framer-motion";
import { FileCheck, ShieldCheck, Landmark, Scale, CheckCircle2 } from "lucide-react";

const INTEGRATIONS = [
  {
    icon: FileCheck,
    tag: "SII Homologado",
    title: "Facturación DTE",
    detail: "Facturas afectas, exentas, boletas, notas de crédito y débito con timbraje y envío.",
    badge: "100% Digital",
  },
  {
    icon: ShieldCheck,
    tag: "Previred Directo",
    title: "Leyes Sociales",
    detail: "Cálculo exacto de AFP, Fonasa, Isapres, AFC y Seguro Mutual sin errores manuales.",
    badge: "0 Multas",
  },
  {
    icon: Landmark,
    tag: "Banca Nacional",
    title: "Conciliación Bancaria",
    detail: "Banco de Chile, Santander, BCI, BancoEstado, Scotiabank e Itaú conectados.",
    badge: "Match Diario",
  },
  {
    icon: Scale,
    tag: "Dirección del Trabajo",
    title: "Libro de Remuneraciones",
    detail: "Contratos de trabajo, registro de turnos, asistencia y finiquitos estandarizados.",
    badge: "Norma DT",
  },
];

export function IntegrationsBar() {
  return (
    <section className="border-y border-line bg-surface/30 py-12 relative overflow-hidden backdrop-blur-sm">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-line">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">Ecosistema Oficial</p>
            <h3 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-ink">
              Construido específicamente para la normativa chilena
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-secondary shrink-0">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 size={14} className="text-emerald-500" /> Formato XML & CAF
            </span>
            <span className="text-faint">·</span>
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 size={14} className="text-emerald-500" /> Indicadores UF/UTM al día
            </span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {INTEGRATIONS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group relative rounded-2xl border border-line bg-surface/60 p-5 hover:bg-surface hover:border-foreground/20 transition-all shadow-2xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="size-9 rounded-xl bg-foreground/[0.05] border border-line flex items-center justify-center text-ink group-hover:scale-105 transition-transform">
                    <Icon size={18} />
                  </div>
                  <span className="text-[10.5px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                </div>

                <div className="mt-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{item.tag}</p>
                  <h4 className="text-base font-semibold text-ink mt-0.5">{item.title}</h4>
                  <p className="mt-2 text-xs text-secondary leading-relaxed">{item.detail}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
