"use client";

import Link from "next/link";
import { Orb } from "@/components/orb/Orb";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-background text-foreground select-none">
      {/* Orbital Wireframe Arcs Graphic (Inspired by SpaceX / x.ai minimalist horizon) */}
      <div className="relative w-full overflow-hidden pt-16 sm:pt-24 pb-0 flex flex-col items-center justify-end">
        <div className="w-full max-w-[1400px] px-4 mx-auto relative flex justify-center">
          <svg
            viewBox="0 0 1200 420"
            className="w-full max-w-5xl h-auto overflow-visible text-foreground/15 dark:text-foreground/20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.1"
          >
            {/* Grand Outer Orbital Arc */}
            <path
              d="M 120 420 A 480 480 0 0 1 1080 420"
              className="transition-opacity duration-500 hover:opacity-60"
            />

            {/* Left Secondary Orbital Arc */}
            <path
              d="M 270 420 A 130 130 0 0 1 530 420"
              strokeDasharray="2 2"
              className="opacity-70"
            />

            {/* Center Inner Orbital Arc */}
            <path
              d="M 480 420 A 120 120 0 0 1 720 420"
              className="opacity-90"
            />

            {/* Right Minor Arc */}
            <path
              d="M 760 420 A 90 90 0 0 1 940 420"
              strokeDasharray="3 3"
              className="opacity-50"
            />

            {/* Subtle Horizon Base Line */}
            <line x1="0" y1="420" x2="1200" y2="420" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          </svg>

          {/* Interactive Floating Orb at the Orbital Epicenter */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center group cursor-pointer">
            <div className="transition-transform duration-300 group-hover:-translate-y-2">
              <Orb size={32} state="idle" playful trackPointer className="drop-shadow-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links Container */}
      <div className="border-t border-line bg-background">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12 py-12 lg:py-16">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-start">
            {/* Brand Column */}
            <div className="lg:col-span-3 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-extrabold tracking-[0.28em] text-foreground uppercase">
                  ORBIX
                </span>
              </div>
              <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">
                © {new Date().getFullYear()} ORBIX SPA
              </p>
              <p className="text-xs text-secondary leading-relaxed max-w-xs pt-1">
                Oficina financiera inteligente para empresas en Chile. Facturación SII, Previred y bancos.
              </p>
            </div>

            {/* Navigation Columns (Divided by subtle vertical line on desktop) */}
            <div className="lg:col-span-9 lg:border-l lg:border-line lg:pl-12">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8">
                {/* Column 1: Productos */}
                <div className="space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-foreground">
                    Productos
                  </p>
                  <ul className="space-y-2 text-xs text-secondary">
                    <li><a href="#producto" className="hover:text-foreground transition-colors">Facturación DTE</a></li>
                    <li><a href="#producto" className="hover:text-foreground transition-colors">Nómina & Previred</a></li>
                    <li><a href="#producto" className="hover:text-foreground transition-colors">Conciliación</a></li>
                    <li><a href="#asistente" className="hover:text-foreground transition-colors">Orb Asistente IA</a></li>
                  </ul>
                </div>

                {/* Column 2: Soluciones */}
                <div className="space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-foreground">
                    Soluciones
                  </p>
                  <ul className="space-y-2 text-xs text-secondary">
                    <li><Link href="/register" className="hover:text-foreground transition-colors">Pymes & SpA</Link></li>
                    <li><Link href="/register" className="hover:text-foreground transition-colors">Estudios Contables</Link></li>
                    <li><Link href="/register" className="hover:text-foreground transition-colors">Multi-RUT</Link></li>
                    <li><a href="#precios" className="hover:text-foreground transition-colors">Planes y Precios</a></li>
                  </ul>
                </div>

                {/* Column 3: Desarrolladores */}
                <div className="space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-foreground">
                    Desarrolladores
                  </p>
                  <ul className="space-y-2 text-xs text-secondary">
                    <li><span className="cursor-pointer hover:text-foreground transition-colors">API DTE XML</span></li>
                    <li><span className="cursor-pointer hover:text-foreground transition-colors">Webhooks SII</span></li>
                    <li><span className="cursor-pointer hover:text-foreground transition-colors">Documentación</span></li>
                    <li><span className="cursor-pointer hover:text-foreground transition-colors">Estado de Red</span></li>
                  </ul>
                </div>

                {/* Column 4: Empresa */}
                <div className="space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-foreground">
                    Empresa
                  </p>
                  <ul className="space-y-2 text-xs text-secondary">
                    <li><a href="mailto:hola@orbix.cl" className="hover:text-foreground transition-colors">Contacto</a></li>
                    <li><a href="mailto:soporte@orbix.cl" className="hover:text-foreground transition-colors">Soporte 24/7</a></li>
                    <li><Link href="/login" className="hover:text-foreground transition-colors">Iniciar sesión</Link></li>
                    <li><Link href="/register" className="hover:text-foreground transition-colors">Crear cuenta</Link></li>
                  </ul>
                </div>

                {/* Column 5: Legal */}
                <div className="space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-foreground">
                    Legal
                  </p>
                  <ul className="space-y-2 text-xs text-secondary">
                    <li><span className="cursor-pointer hover:text-foreground transition-colors">Términos de Uso</span></li>
                    <li><span className="cursor-pointer hover:text-foreground transition-colors">Privacidad</span></li>
                    <li><span className="cursor-pointer hover:text-foreground transition-colors">Normativa SII</span></li>
                    <li><span className="cursor-pointer hover:text-foreground transition-colors">Dirección del Trabajo</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
