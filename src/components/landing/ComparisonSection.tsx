"use client";

import { Check, X } from "lucide-react";

const COMPARISONS = [
  {
    feature: "Cierre mensual de finanzas",
    oldWay: "3 a 5 días copiando y pegando datos entre 4 planillas",
    orbixWay: "1 tarde. Todo consolidado con libros contables listos",
  },
  {
    feature: "Leyes sociales & Previred",
    oldWay: "Fórmulas manuales de Excel propensas a multas e intereses",
    orbixWay: "Cálculo exacto en 1 clic según tablas oficiales de Chile",
  },
  {
    feature: "Facturación & Cobranza activa",
    oldWay: "Ingresar al portal del SII y perseguir pagos por correo manual",
    orbixWay: "Emisión directa con cálculo de IVA y recordatorios automáticos",
  },
  {
    feature: "Conciliación bancaria",
    oldWay: "Revisar cartola PDF línea por línea marcando con lápiz",
    orbixWay: "Match inteligente entre transferencias bancarias y DTEs",
  },
  {
    feature: "Asistente con Inteligencia Artificial",
    oldWay: "Inexistente o chatbots genéricos que no conocen tus números",
    orbixWay: "Orb AI: conectado a tu empresa, emite y audita en tiempo real",
  },
  {
    feature: "Manejo de múltiples empresas (Multi-RUT)",
    oldWay: "Cerrar sesión, abrir otra ventana o comprar licencias caras",
    orbixWay: "Workspace aislado por RUT con cambio instantáneo",
  },
];

export function ComparisonSection() {
  return (
    <section className="py-24 border-t border-line bg-surface/20">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">¿Por qué cambiar?</p>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink">
            El software antiguo vs la era de Orbix
          </h2>
          <p className="mt-3 text-sm sm:text-base text-secondary">
            Compara cómo cambia tu día a día operativo al dejar atrás el caos de archivos sueltos.
          </p>
        </div>

        <div className="max-w-4xl mx-auto rounded-3xl border border-line bg-surface/80 overflow-hidden shadow-lg backdrop-blur-xl">
          {/* Header Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-b border-line bg-foreground/[0.03]">
            <div className="p-4 sm:p-6 text-muted text-xs font-bold uppercase tracking-wider border-b md:border-b-0 md:border-r border-line">
              ❌ Software Antiguo / Planillas de Excel
            </div>
            <div className="p-4 sm:p-6 text-ink text-xs font-bold uppercase tracking-wider flex items-center justify-between">
              <span>✨ Orbix con Inteligencia Artificial</span>
              <span className="text-emerald-500 text-[11px] font-mono">Modo Moderno</span>
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-line">
            {COMPARISONS.map((row) => (
              <div key={row.feature} className="grid grid-cols-1 md:grid-cols-2 p-4 sm:p-6 gap-4 sm:gap-6 hover:bg-foreground/[0.01] transition-colors">
                <div className="space-y-1.5 md:border-r md:border-line md:pr-6">
                  <p className="text-xs font-bold text-muted uppercase tracking-wider">{row.feature}</p>
                  <p className="text-xs sm:text-sm text-secondary flex items-start gap-2">
                    <X size={15} className="text-red-400 shrink-0 mt-0.5" />
                    <span>{row.oldWay}</span>
                  </p>
                </div>

                <div className="space-y-1.5 flex flex-col justify-center">
                  <p className="text-xs sm:text-sm font-medium text-ink flex items-start gap-2">
                    <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>{row.orbixWay}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
