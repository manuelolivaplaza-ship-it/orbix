"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Orb } from "@/components/orb/Orb";
import { ProductPreview } from "@/components/landing/ProductPreview";
import { LandingCurtain, Reveal, RevealLine, RevealOnScroll } from "@/components/landing/Reveal";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    title: "Habla con Orbix como con un colega",
    body: "Facturación, sueldos y reportes en un solo hilo. Le das el trabajo, Orbix lo cierra y te avisa cuando hay que aprobar.",
  },
  {
    title: "Varias empresas, un mismo control",
    body: "Cambia de RUT en un clic. Cada empresa mantiene giro, logo y configuración fiscal chilena.",
  },
  {
    title: "La nómina se calcula, no se adivina",
    body: "Liquidaciones con haberes, descuentos y líquido a pagar. Asistencia y vacaciones en el mismo lugar.",
  },
  {
    title: "Reportes que se pueden enviar",
    body: "Filtra por fecha y exporta a Excel o PDF cuando el directorio lo pida. Sin maquillar la planilla.",
  },
];

const JOBS = [
  "Facturación electrónica",
  "Cobranza activa",
  "Nómina & Liquidaciones",
  "Previred & Leyes sociales",
  "Asistencia y Vacaciones",
  "Conciliación bancaria",
  "Caja y Flujo real",
  "Reportes contables",
  "Roles y Permisos",
  "Asistente Orb IA",
];

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
      "Pasamos de tres planillas y un WhatsApp eterno a cerrar el mes en una tarde.",
    name: "Camila Soto",
    role: "COO, Andes Tecnología",
  },
  {
    quote:
      "La liquidación sale con haberes, descuentos y líquido. El Excel quedó de lado.",
    name: "Diego Sepúlveda",
    role: "Contador general",
  },
  {
    quote:
      "Cambio de Puerto Austral a Cordillera y el contexto se actualiza entero.",
    name: "Javiera Alarcón",
    role: "Operaciones, Puerto Austral",
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
            ? "border-b border-line bg-base/80 backdrop-blur-xl shadow-xs"
            : "border-b border-transparent bg-transparent backdrop-blur-none"
        )}
      >
        <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8 transition-all">
          <Link href="/" className="flex items-center gap-3 group">
            <Orb size={38} state="idle" playful className="transition-transform group-hover:scale-105" />
            <span className="text-lg font-semibold tracking-tight">Orbix</span>
          </Link>
          <nav className="hidden items-center gap-8 text-[15px] font-medium text-secondary md:flex">
            <a href="#producto" className="hover:text-ink transition-colors">
              Producto
            </a>
            <a href="#precios" className="hover:text-ink transition-colors">
              Precios
            </a>
            <a href="#voces" className="hover:text-ink transition-colors">
              Equipo
            </a>
          </nav>
          <div className="flex items-center gap-3.5">
            <ThemeToggle className="size-9 rounded-full" />
            <Link
              href="/login"
              className="hidden text-[15px] font-medium text-secondary hover:text-ink sm:block transition-colors px-3.5 py-1.5 rounded-full hover:bg-foreground/[0.04]"
            >
              Entrar
            </Link>
            <Link href="/register">
              <Button size="lg" className="rounded-full px-6 h-10 text-[15px] font-medium shadow-sm transition-transform active:scale-95">
                Empezar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="relative z-10 mx-auto grid max-w-[1400px] items-center gap-8 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-10 lg:py-24 xl:gap-14">
          <div className="min-w-0">
            <Reveal delay={0.22}>
              <p className="mb-6 text-xs font-medium uppercase tracking-[0.28em] text-muted">
                Early beta
              </p>
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
                Un compañero de trabajo al que le das operación real. Facturas, sueldos y
                reportes — y vuelve cuando hay que firmar.
              </p>
            </Reveal>
            <Reveal delay={0.6}>
              <div className="mt-10 flex flex-wrap gap-3.5">
                <Link href="/register">
                  <Button size="lg" className="h-12 rounded-full px-7 text-base font-medium shadow-md shadow-foreground/5 hover:scale-[1.02] transition-all">
                    Empezar gratis
                    <ArrowRight size={17} />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="secondary" className="h-12 rounded-full px-7 text-base font-medium hover:bg-foreground/[0.04] transition-all">
                    Ver el producto
                  </Button>
                </Link>
              </div>
              <p className="mt-5 text-xs text-faint">Crea tu cuenta en 1 minuto. Sin usuarios de prueba.</p>
            </Reveal>
          </div>
          <ProductPreview />
        </div>
      </section>

      <section id="producto" className="border-t border-line py-24">
        <RevealOnScroll className="mx-auto max-w-6xl px-5">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">Producto</p>
          <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-ink sm:text-5xl">
            Dale trabajo. Vuelve cuando esté listo.
          </h2>
          <div className="mt-16 grid gap-x-16 gap-y-14 md:grid-cols-2">
            {FEATURES.map((feature) => (
              <article key={feature.title}>
                <h3 className="text-xl font-medium text-ink">{feature.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-secondary">{feature.body}</p>
              </article>
            ))}
          </div>
          <div className="mt-20 flex flex-wrap gap-2">
            {JOBS.map((job) => (
              <span
                key={job}
                className="rounded-full border border-line px-4 py-1.5 text-sm text-secondary"
              >
                {job}
              </span>
            ))}
          </div>
        </RevealOnScroll>
      </section>

      <section id="precios" className="border-t border-line py-24">
        <RevealOnScroll className="mx-auto max-w-7xl px-6 sm:px-8">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">Precios</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-5xl">
            Planes claros. 1 empresa por suscripción.
          </h2>
          <p className="mt-3 text-secondary text-base max-w-2xl">
            Cada plan incluye todo lo necesario para operar tu empresa. Si tienes más de un RUT, puedes abrir un workspace independiente para cada uno.
          </p>

          <div className="mt-14 grid gap-6 lg:grid-cols-3 items-stretch">
            {PLANS.map((plan) => (
              <article
                key={plan.name}
                className={
                  plan.featured
                    ? "relative rounded-[28px] border-2 border-foreground/30 bg-foreground/[0.03] dark:bg-foreground/[0.05] p-8 sm:p-9 shadow-xl flex flex-col justify-between"
                    : "relative rounded-[28px] border border-line bg-surface/40 p-8 sm:p-9 flex flex-col justify-between"
                }
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-base font-semibold text-ink">{plan.name}</p>
                    {"badge" in plan && plan.badge ? (
                      <span className="rounded-full bg-foreground text-background text-[11px] font-semibold px-3 py-0.5">
                        {plan.badge}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-4 font-mono text-4xl font-semibold text-ink">
                    {plan.price}
                    <span className="text-sm font-normal text-muted"> + IVA /mes</span>
                  </p>
                  <p className="mt-2 text-xs font-medium text-secondary">{plan.detail}</p>
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
                  <Button className="w-full h-11 rounded-xl text-sm font-medium" variant={plan.featured ? "primary" : "secondary"}>
                    Empezar con {plan.name}
                  </Button>
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-line bg-foreground/[0.02] p-5 text-center text-xs text-muted max-w-3xl mx-auto">
            💡 <strong>¿Tienes múltiples empresas o un estudio contable?</strong> Cada empresa opera con su propio RUT, base de datos y facturación separada para mantener la contabilidad 100% ordenada y protegida.
          </div>
        </RevealOnScroll>
      </section>

      <section id="voces" className="border-t border-line py-24">
        <RevealOnScroll className="mx-auto max-w-6xl px-5">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">En el equipo</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-5xl">
            Lo usa quien cierra el mes.
          </h2>
          <div className="mt-14 grid gap-10 lg:grid-cols-3">
            {QUOTES.map((item) => (
              <blockquote key={item.name}>
                <p className="text-[17px] leading-relaxed text-secondary">“{item.quote}”</p>
                <footer className="mt-6 text-sm">
                  <p className="text-ink">{item.name}</p>
                  <p className="text-xs text-muted">{item.role}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </RevealOnScroll>
      </section>

      <section className="border-t border-line py-24">
        <RevealOnScroll className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Conoce a tu primer Orb
            </h2>
            <p className="mt-3 max-w-md text-secondary">
              Un compañero al que le puedes confiar el cierre.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/register">
              <Button size="lg" className="h-11 rounded-full px-6">
                Empezar
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="secondary" className="h-11 rounded-full px-6">
                Contactar
              </Button>
            </Link>
          </div>
        </RevealOnScroll>
      </section>

      <footer className="border-t border-line py-14">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <Orb size={22} state="idle" trackPointer={false} />
              <span className="text-sm font-medium">Orbix</span>
            </div>
            <p className="mt-3 text-sm text-muted">Santiago, Chile</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-faint">Producto</p>
            <ul className="mt-3 space-y-2 text-sm text-secondary">
              <li>Facturación</li>
              <li>Sueldos</li>
              <li>Reportes</li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-faint">Empresa</p>
            <ul className="mt-3 space-y-2 text-sm text-secondary">
              <li>Sobre Orbix</li>
              <li>Legal</li>
              <li>Privacidad</li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-faint">Contacto</p>
            <ul className="mt-3 space-y-2 text-sm text-secondary">
              <li>hola@orbix.cl</li>
              <li>© {new Date().getFullYear()} Orbix SpA</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
