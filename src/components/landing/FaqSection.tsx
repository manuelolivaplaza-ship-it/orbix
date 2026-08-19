"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: "¿Por qué cada plan/suscripción es para 1 sola empresa?",
    a: "Para mantener tu contabilidad, libros de ventas y remuneraciones 100% ordenados y protegidos por RUT. Cada empresa tiene su propia razón social, giro, cuentas bancarias y colaboradores. Si administras más de una empresa o tienes un estudio contable, puedes crear workspaces adicionales de forma independiente.",
  },
  {
    q: "¿Orbix está homologado para emitir Facturas y DTEs ante el SII?",
    a: "Sí. Orbix genera documentos tributarios electrónicos (DTE 33 Facturas afectas, DTE 34 Facturas exentas, DTE 61 Notas de crédito y Boletas) cumpliendo con el formato XML, código de barras CAF y timbraje digital exigido por el Servicio de Impuestos Internos de Chile.",
  },
  {
    q: "¿Cómo se calculan las leyes sociales y Previred?",
    a: "Orbix integra las tablas vigentes de AFP (Habitat, Provida, Cuprum, Capital, Modelo, PlanVital, Uno), Fonasa (7%), Isapres, Seguro de Cesantía (AFC), Seguro de Invalidez y Sobrevivencia (SIS) y Mutual de Seguridad. Las liquidaciones se calculan automáticamente con Gratificación Legal (25% con tope de 4.75 IMM) y descuentos de segunda categoría.",
  },
  {
    q: "¿Puedo importar mis datos desde planillas Excel o mi software anterior?",
    a: "Totalmente. Puedes cargar archivos .xlsx y .csv de clientes, proveedores, catálogo de productos y nómina de trabajadores. Además, puedes pedirle a Orb (el asistente de IA) que procese cualquier planilla desordenada y la cargue en segundos.",
  },
  {
    q: "¿Qué puede hacer el Asistente Orb con IA?",
    a: "Orb está conectado con permisos seguros a tu empresa. No inventa datos: puede consultar facturas vencidas, redactar borradores de facturas, simular liquidaciones, auditar cotizaciones previsionales, notificar cobranzas por WhatsApp y resumir tu balance mensual en segundos.",
  },
  {
    q: "¿Cómo se protegen los datos bancarios y tributarios?",
    a: "Toda la información viaja cifrada con TLS 1.3 y se almacena con encriptación de nivel bancario (AES-256). Contamos con políticas estrictas de seguridad por fila (RLS) en base de datos para que únicamente los miembros autorizados de tu empresa tengan acceso a tus registros.",
  },
];

export function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="py-24 border-t border-line">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-line bg-surface text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-3">
            <HelpCircle size={14} /> Preguntas Frecuentes
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            Todo lo que necesitas saber antes de empezar
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
            Resolvemos las dudas más comunes sobre la operación con Orbix.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={faq.q}
                className={cn(
                  "rounded-2xl border transition-all overflow-hidden",
                  isOpen
                    ? "border-neutral-400/40 dark:border-neutral-700 bg-surface shadow-sm"
                    : "border-line bg-surface/60 hover:bg-surface hover:border-neutral-400/30"
                )}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <span className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-50 leading-snug">
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className={cn(
                      "text-neutral-500 dark:text-neutral-400 shrink-0 transition-transform duration-200",
                      isOpen && "rotate-180 text-neutral-900 dark:text-neutral-100"
                    )}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed border-t border-line pt-4 font-normal">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
