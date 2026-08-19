"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { Orb } from "@/components/orb/Orb";
import { ProductPreview } from "@/components/landing/ProductPreview";
import { IntegrationsBar } from "@/components/landing/IntegrationsBar";
import { BentoFeatures } from "@/components/landing/BentoFeatures";
import { InteractiveSimulator } from "@/components/landing/InteractiveSimulator";
import { AiShowcase } from "@/components/landing/AiShowcase";
import { ComparisonSection } from "@/components/landing/ComparisonSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { LandingCurtain, Reveal, RevealLine, RevealOnScroll } from "@/components/landing/Reveal";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Starter",
    price: "$29.990",
    detail: "1 empresa (1 RUT) · Comercial & Caja",
    items: [
      "Facturación electrónica y cotizaciones",
      "Cobranza activa y recordatorios",
      "Dashboard financiero en tiempo real",
      "Control de caja y conciliación bancaria",
      "Exportación a Excel y PDF oficial",
      "Hasta 3 usuarios con roles",
    ],
  },
  {
    name: "Pro",
    price: "$59.990",
    detail: "1 empresa (1 RUT) · Nómina & Operación Total",
    featured: true,
    badge: "Más popular",
    items: [
      "Todo lo del plan Starter",
      "Nómina y liquidaciones (AFP, Isapre, Fonasa)",
      "Control de asistencia, turnos y vacaciones",
      "Contratos y finiquitos para imprimir",
      "Asistente Orb IA para cierres y alertas",
      "Roles dedicados (Admin, Contador, RRHH)",
      "Usuarios y colaboradores ilimitados",
    ],
  },
  {
    name: "Empresa",
    price: "$119.990",
    detail: "1 empresa (1 RUT) · Alto Volumen & Automatización",
    items: [
      "Todo lo del plan Pro",
      "Cierre mensual automatizado con libros",
      "Integraciones bancarias y API personalizada",
      "Onboarding dedicado y migración de datos",
      "Reportería avanzada para directorio",
      "Soporte prioritario por WhatsApp y SLA garantizado",
    ],
  },
];

const QUOTES = [
  {
    quote:
      "Pasamos de tres planillas y un WhatsApp eterno a cerrar el mes en una sola tarde.",
    name: "Camila Soto",
    role: "COO, Andes Tecnología SpA",
  },
  {
    quote:
      "La liquidación sale exacta con haberes, descuentos y líquido. El Excel quedó en el pasado.",
    name: "Diego Sepúlveda",
    role: "Contador General",
  },
  {
    quote:
      "Cambio entre dos empresas en un segundo y el contexto tributario no se mezcla jamás.",
    name: "Javiera Alarcón",
    role: "Directora de Operaciones, Puerto Austral",
  },
];

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-base text-ink">
      <LandingCurtain />
      <header
        className={cn(
          "landing-header sticky top-0 z-20 transition-all duration-300",
          isScrolled
            ? "border-b border-line bg-base/85 backdrop-blur-xl shadow-xs"
            : "border-b border-transparent bg-transparent backdrop-blur-none"
        )}
      >
        <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8 transition-all">
          <Link href="/" className="flex items-center gap-3 group">
            <Orb size={38} state="idle" playful className="transition-transform group-hover:scale-105" />
            <span className="text-lg font-semibold tracking-tight">Orbix</span>
          </Link>
          <nav className="hidden items-center gap-7 text-[14.5px] font-medium text-secondary md:flex">
            <a href="#producto" className="hover:text-ink transition-colors">
              Capacidades
            </a>
            <a href="#simulador" className="hover:text-ink transition-colors">
              Simulador
            </a>
            <a href="#asistente" className="hover:text-ink transition-colors">
              Orb IA
            </a>
            <a href="#precios" className="hover:text-ink transition-colors">
              Precios
            </a>
            <a href="#faq" className="hover:text-ink transition-colors">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-3.5">
            <ThemeToggle className="size-9 rounded-full" />
            <Link
              href="/login"
              className="hidden text-[14.5px] font-medium text-secondary hover:text-ink sm:block transition-colors px-3.5 py-1.5 rounded-full hover:bg-foreground/[0.04]"
            >
              Entrar
            </Link>
            <Link href="/register">
              <Button size="lg" className="rounded-full px-6 h-10 text-[14.5px] font-semibold shadow-xs transition-transform active:scale-95">
                Empezar gratis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="relative z-10 mx-auto grid max-w-[1400px] items-center gap-8 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-10 lg:py-24 xl:gap-14">
          <div className="min-w-0">
            <Reveal delay={0.22}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-line bg-foreground/[0.03] text-xs font-semibold text-secondary mb-6">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                Oficina Financiera Inteligente · Chile
              </div>
            </Reveal>
            <h1 className="flex flex-nowrap items-center gap-x-3 whitespace-nowrap text-[1.85rem] font-bold tracking-tight text-ink sm:gap-x-4 sm:text-5xl lg:text-[3.5rem] lg:leading-tight">
              <RevealLine delay={0.28} className="whitespace-nowrap">
                Conoce a
              </RevealLine>
              <span className="landing-orb origin-center" style={{ animationDelay: "0.4s" }}>
                <Orb
                  size={76}
                  state="idle"
                  flourish
                  playful
                  hop
                  intro
                  label="Orb"
                  className="origin-center scale-[0.88] translate-y-0.5 sm:scale-100 sm:translate-y-1 drop-shadow-md cursor-pointer"
                />
              </span>
              <RevealLine delay={0.36}>Orbix</RevealLine>
            </h1>
            <Reveal delay={0.5}>
              <p className="mt-8 max-w-xl text-lg sm:text-xl leading-relaxed text-secondary">
                Tu compañero financiero y operativo con inteligencia real. Emite facturas SII, calcula liquidaciones con Previred y concilia bancos en una sola tarde.
              </p>
            </Reveal>
            <Reveal delay={0.6}>
              <div className="mt-10 flex flex-wrap gap-3.5">
                <Link href="/register">
                  <Button size="lg" className="h-12 rounded-full px-7 text-base font-semibold shadow-md shadow-foreground/5 hover:scale-[1.02] transition-all">
                    Empezar gratis
                    <ArrowRight size={17} />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="secondary" className="h-12 rounded-full px-7 text-base font-medium hover:bg-foreground/[0.04] transition-all">
                    Entrar a la plataforma
                  </Button>
                </Link>
              </div>
              <p className="mt-5 text-xs text-muted">Configura tu empresa en 1 minuto. Sin tarjetas ni contratos forzados.</p>
            </Reveal>
          </div>
          <ProductPreview />
        </div>
      </section>

      {/* Official Integrations Ecosystem */}
      <IntegrationsBar />

      {/* Bento Grid Features */}
      <BentoFeatures />

      {/* Interactive Chilean Salary & Invoice Simulator */}
      <div id="simulador">
        <InteractiveSimulator />
      </div>

      {/* Dedicated AI Agent Showcase */}
      <div id="asistente">
        <AiShowcase />
      </div>

      {/* Comparison: Old Way vs Orbix Way */}
      <ComparisonSection />

      {/* Pricing Section */}
      <section id="precios" className="border-t border-line py-24">
        <RevealOnScroll className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">Precios Simples</p>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink">
              Planes claros. 1 empresa por suscripción.
            </h2>
            <p className="mt-4 text-base text-secondary">
              Cada plan incluye todo lo necesario para operar tu empresa. Si tienes más de un RUT, puedes abrir un workspace independiente para cada uno sin mezclar balances.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3 items-stretch">
            {PLANS.map((plan) => (
              <article
                key={plan.name}
                className={
                  plan.featured
                    ? "relative rounded-[28px] border-2 border-foreground/40 bg-foreground/[0.03] dark:bg-foreground/[0.06] p-8 sm:p-9 shadow-xl flex flex-col justify-between"
                    : "relative rounded-[28px] border border-line bg-surface/50 p-8 sm:p-9 flex flex-col justify-between shadow-2xs hover:border-foreground/20 transition-all"
                }
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-lg font-bold text-ink">{plan.name}</p>
                    {"badge" in plan && plan.badge ? (
                      <span className="rounded-full bg-foreground text-background text-[11px] font-bold px-3 py-0.5">
                        {plan.badge}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-4 font-mono text-4xl font-bold text-ink">
                    {plan.price}
                    <span className="text-sm font-normal text-muted"> + IVA /mes</span>
                  </p>
                  <p className="mt-2 text-xs font-semibold text-secondary">{plan.detail}</p>
                  <div className="border-t border-line my-6" />
                  <ul className="space-y-3 text-sm text-secondary">
                    {plan.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href="/register" className="mt-8 block">
                  <Button className="w-full h-11 rounded-xl text-sm font-semibold" variant={plan.featured ? "primary" : "secondary"}>
                    Empezar con {plan.name}
                  </Button>
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-line bg-foreground/[0.02] p-5 text-center text-xs text-muted max-w-3xl mx-auto">
            💡 <strong>¿Tienes múltiples razones sociales o un estudio contable?</strong> Cada empresa opera con su propio RUT, base de datos y facturación separada para mantener la contabilidad 100% ordenada y protegida.
          </div>
        </RevealOnScroll>
      </section>

      {/* Customer Voices */}
      <section id="voces" className="border-t border-line py-24 bg-surface/20">
        <RevealOnScroll className="mx-auto max-w-6xl px-5">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">En el equipo</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-ink">
              Lo usa quien realmente cierra el mes
            </h2>
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            {QUOTES.map((item) => (
              <blockquote key={item.name} className="p-6 rounded-3xl border border-line bg-surface/70 shadow-2xs flex flex-col justify-between">
                <p className="text-base sm:text-lg leading-relaxed text-secondary">“{item.quote}”</p>
                <footer className="mt-6 pt-4 border-t border-line text-sm">
                  <p className="font-bold text-ink">{item.name}</p>
                  <p className="text-xs text-muted">{item.role}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </RevealOnScroll>
      </section>

      {/* FAQ Section */}
      <div id="faq">
        <FaqSection />
      </div>

      {/* Final Call to Action */}
      <section className="border-t border-line py-24 relative overflow-hidden">
        <div className="pointer-events-none absolute -inset-20 rounded-full bg-gradient-to-tr from-amber-500/10 via-violet-500/10 to-sky-500/10 blur-3xl opacity-60" />
        <RevealOnScroll className="mx-auto max-w-5xl px-5 text-center relative z-10 space-y-6">
          <div className="inline-flex justify-center">
            <Orb size={64} state="happy" hop playful trackPointer={false} />
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-ink">
            Empieza a operar con Orbix hoy mismo
          </h2>
          <p className="max-w-xl mx-auto text-base sm:text-lg text-secondary">
            Crea tu cuenta en menos de un minuto y descubre lo que se siente tener a tu oficina financiera y operativa al día.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-3.5">
            <Link href="/register">
              <Button size="lg" className="h-12 rounded-full px-8 text-base font-semibold shadow-md">
                Crear cuenta gratis
                <ArrowRight size={17} />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="secondary" className="h-12 rounded-full px-8 text-base font-medium">
                Iniciar sesión
              </Button>
            </Link>
          </div>
        </RevealOnScroll>
      </section>

      {/* Footer */}
      <footer className="border-t border-line py-16 bg-surface/30">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-4 sm:px-6 lg:px-8 md:grid-cols-5">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <Orb size={26} state="idle" trackPointer={false} />
              <span className="text-base font-bold tracking-tight text-ink">Orbix</span>
            </div>
            <p className="text-xs text-secondary max-w-sm leading-relaxed">
              La plataforma de gestión financiera, facturación DTE, nómina Previred y conciliación bancaria con inteligencia artificial para empresas en Chile.
            </p>
            <p className="text-[11px] text-muted">Santiago de Chile · © {new Date().getFullYear()} Orbix SpA.</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted mb-3">Producto</p>
            <ul className="space-y-2 text-xs text-secondary">
              <li><a href="#producto" className="hover:text-ink transition-colors">Facturación DTE</a></li>
              <li><a href="#producto" className="hover:text-ink transition-colors">Nómina & Previred</a></li>
              <li><a href="#producto" className="hover:text-ink transition-colors">Conciliación Bancaria</a></li>
              <li><a href="#asistente" className="hover:text-ink transition-colors">Orb Asistente IA</a></li>
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted mb-3">Herramientas</p>
            <ul className="space-y-2 text-xs text-secondary">
              <li><a href="#simulador" className="hover:text-ink transition-colors">Calculadora Sueldo Líquido</a></li>
              <li><a href="#simulador" className="hover:text-ink transition-colors">Calculadora IVA (19%)</a></li>
              <li><a href="#precios" className="hover:text-ink transition-colors">Planes y Precios</a></li>
              <li><a href="#faq" className="hover:text-ink transition-colors">Preguntas Frecuentes</a></li>
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted mb-3">Acceso</p>
            <ul className="space-y-2 text-xs text-secondary">
              <li><Link href="/login" className="hover:text-ink transition-colors">Iniciar sesión</Link></li>
              <li><Link href="/register" className="hover:text-ink transition-colors">Registrar empresa</Link></li>
              <li><a href="mailto:hola@orbix.cl" className="hover:text-ink transition-colors">hola@orbix.cl</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
