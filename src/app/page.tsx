"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Orb } from "@/components/orb/Orb";
import { ProductPreview } from "@/components/landing/ProductPreview";
import { HeroAmbientGlow } from "@/components/landing/HeroAmbientGlow";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

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
  "Facturación",
  "Cobranza",
  "Nómina",
  "RRHH",
  "Multi-empresa",
  "Reportes",
  "Roles",
  "SII (mock)",
];

const PLANS = [
  {
    name: "Starter",
    price: "$29.990",
    detail: "1 empresa · hasta 5 usuarios",
    items: ["Facturación y clientes", "Dashboard de métricas", "Exportes básicos"],
  },
  {
    name: "Pro",
    price: "$59.990",
    detail: "3 empresas · usuarios ilimitados",
    featured: true,
    items: ["Nómina y liquidaciones", "Asistencia y vacaciones", "Reportes avanzados", "Roles granulares"],
  },
  {
    name: "Empresa",
    price: "$119.990",
    detail: "Empresas ilimitadas · SLA",
    items: ["Onboarding dedicado", "Integraciones SII / banco", "SSO y auditoría"],
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
  return (
    <div className="min-h-screen bg-base text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-base/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Orb size={34} state="idle" playful className="transition-transform group-hover:scale-105" />
            <span className="text-base font-semibold tracking-tight">Orbix</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-secondary md:flex">
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
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login" className="hidden text-sm text-secondary hover:text-ink sm:block transition-colors">
              Entrar
            </Link>
            <Link href="/register">
              <Button size="sm" className="rounded-full">
                Empezar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <HeroAmbientGlow />
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 sm:py-20 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-8 lg:py-24 xl:gap-12">
          <div className="min-w-0">
            <p className="mb-6 text-xs font-medium uppercase tracking-[0.28em] text-muted">
              Early beta
            </p>
            <h1 className="flex flex-nowrap items-center gap-x-2.5 whitespace-nowrap text-[1.65rem] font-semibold tracking-tight text-ink sm:gap-x-3.5 sm:text-4xl sm:leading-none lg:text-5xl">
              <span className="whitespace-nowrap">Conoce a</span>
              <Orb
                size={66}
                state="idle"
                flourish
                playful
                hop
                label="Orb"
                className="origin-center scale-[0.85] translate-y-0.5 sm:scale-100 sm:translate-y-1 drop-shadow-sm cursor-pointer"
              />
              <span>Orbix</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-secondary">
              Un compañero de trabajo al que le das operación real. Facturas, sueldos y
              reportes — y vuelve cuando hay que firmar.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/register">
                <Button size="lg" className="h-11 rounded-full px-6">
                  Empezar
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="secondary" className="h-11 rounded-full px-6">
                  Ver el producto
                </Button>
              </Link>
            </div>
            <p className="mt-5 text-xs text-faint">Crea tu cuenta. Sin usuarios de prueba.</p>
          </div>
          <ProductPreview />
        </div>
      </section>

      <section id="producto" className="border-t border-line py-24">
        <div className="mx-auto max-w-6xl px-5">
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
        </div>
      </section>

      <section id="precios" className="border-t border-line py-24">
        <div className="mx-auto max-w-6xl px-5">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">Precios</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-5xl">
            Tres planes. Sin ruido.
          </h2>
          <div className="mt-14 grid gap-4 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <article
                key={plan.name}
                className={
                  plan.featured
                    ? "rounded-3xl border border-foreground/20 bg-foreground/[0.03] p-8"
                    : "rounded-3xl border border-line p-8"
                }
              >
                <p className="text-sm text-secondary">{plan.name}</p>
                <p className="mt-4 font-mono text-4xl text-ink">
                  {plan.price}
                  <span className="text-sm text-muted"> /mes</span>
                </p>
                <p className="mt-2 text-xs text-muted">{plan.detail}</p>
                <ul className="mt-8 space-y-2.5 text-sm text-secondary">
                  {plan.items.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <Check size={14} className="text-ink" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="mt-10 block">
                  <Button className="w-full" variant={plan.featured ? "primary" : "secondary"}>
                    Elegir {plan.name}
                  </Button>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="voces" className="border-t border-line py-24">
        <div className="mx-auto max-w-6xl px-5">
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
        </div>
      </section>

      <section className="border-t border-line py-24">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-5 sm:flex-row sm:items-center sm:justify-between">
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
        </div>
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
