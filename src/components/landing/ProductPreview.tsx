"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Landmark,
  Users,
  Building2,
  BarChart3,
  Settings,
  PanelLeft,
  CheckCircle2,
  Plus,
  Check,
} from "lucide-react";
import { Orb } from "@/components/orb/Orb";
import { cn } from "@/lib/cn";

type NavSection = "dashboard" | "facturacion" | "sueldos" | "caja";

const NAV_ITEMS = [
  { id: "dashboard" as NavSection, label: "Dashboard", icon: LayoutDashboard, badge: "Hoy" },
  { id: "facturacion" as NavSection, label: "Facturación", icon: FileText, badge: "3" },
  { id: "sueldos" as NavSection, label: "Equipo & Nómina", icon: Users, badge: "6" },
  { id: "caja" as NavSection, label: "Caja & Banco", icon: Landmark, badge: "" },
];

const SECONDARY_NAV = [
  { label: "Empresas", icon: Building2 },
  { label: "Reportes", icon: BarChart3 },
  { label: "Configuración", icon: Settings },
];

const ORB_BEATS = [
  { status: "Trabajando", text: "Emitiendo F-1050 para Los Alerces…" },
  { status: "Revisando", text: "3 facturas conciliadas con Banco de Chile" },
  { status: "Listo", text: "Liquidaciones de agosto listas para firmar" },
];

export function ProductPreview({ className }: { className?: string }) {
  const [activeTab, setActiveTab] = useState<NavSection>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setBeat((n) => (n + 1) % ORB_BEATS.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, []);

  const currentBeat = ORB_BEATS[beat] ?? ORB_BEATS[0];

  return (
    <div className={cn("relative", className)}>
      {/* Background glow behind preview window */}
      <div className="pointer-events-none absolute -inset-8 rounded-[48px] bg-gradient-to-tr from-amber-500/10 via-violet-500/10 to-sky-500/10 blur-3xl opacity-70" />

      <motion.div
        className="relative overflow-hidden rounded-2xl sm:rounded-[26px] border border-line bg-surface shadow-[0_24px_70px_rgba(0,0,0,0.09)] dark:shadow-[0_32px_100px_rgba(0,0,0,0.55)] transition-all"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Window Chrome / Titlebar */}
        <div className="flex h-11 items-center justify-between border-b border-line bg-base/80 px-4 backdrop-blur-md select-none">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <i className="h-3 w-3 rounded-full bg-red-400/80 hover:opacity-100 transition-opacity" />
              <i className="h-3 w-3 rounded-full bg-amber-400/80 hover:opacity-100 transition-opacity" />
              <i className="h-3 w-3 rounded-full bg-emerald-400/80 hover:opacity-100 transition-opacity" />
            </div>
            <div className="ml-3 hidden sm:flex items-center gap-1.5 text-xs font-medium text-secondary">
              <span className="text-ink font-semibold">app.orbix.cl</span>
              <span className="text-faint">/</span>
              <span className="capitalize">{activeTab}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-line bg-foreground/[0.03] px-2.5 py-0.5 text-secondary">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Chile SII (demo)
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-emerald-600 dark:text-emerald-400 font-medium">
              Interactiva
            </span>
          </div>
        </div>

        {/* Inner App Shell (Sidebar + Main View) */}
        <div className="grid grid-cols-[auto_1fr] min-h-[440px] sm:min-h-[480px] text-ink bg-base">
          {/* Collapsible App Sidebar */}
          <aside
            className={cn(
              "border-r border-line bg-surface/50 flex flex-col justify-between transition-all duration-300 select-none",
              collapsed ? "w-14 sm:w-16" : "w-48 sm:w-56"
            )}
          >
            <div>
              {/* Sidebar Header / Brand */}
              <div className={cn("p-3 border-b border-line flex items-center", collapsed ? "justify-center" : "justify-between")}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <Orb size={collapsed ? 26 : 32} state="idle" playful trackPointer={false} className="shrink-0" />
                  {!collapsed && (
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold tracking-tight text-ink">Orbix</p>
                      <p className="truncate text-[10px] text-muted">Andes SpA</p>
                    </div>
                  )}
                </div>
                {!collapsed && (
                  <button
                    onClick={() => setCollapsed(true)}
                    className="p-1 rounded-md text-muted hover:text-ink hover:bg-foreground/[0.05] transition-colors"
                    title="Contraer menú"
                  >
                    <PanelLeft size={14} />
                  </button>
                )}
              </div>

              {/* Collapsed Expand Trigger */}
              {collapsed && (
                <div className="p-1 flex justify-center border-b border-line">
                  <button
                    onClick={() => setCollapsed(false)}
                    className="p-1 rounded-md text-muted hover:text-ink hover:bg-foreground/[0.05] transition-colors"
                    title="Expandir menú"
                  >
                    <PanelLeft size={13} />
                  </button>
                </div>
              )}

              {/* Navigation Items */}
              <div className="p-1.5 space-y-0.5">
                {!collapsed && (
                  <p className="px-2 py-1 text-[9px] font-medium uppercase tracking-wider text-muted">
                    Plataforma
                  </p>
                )}
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={cn(
                        "w-full flex items-center gap-2 rounded-lg text-xs font-medium transition-all",
                        collapsed ? "justify-center py-2 px-1" : "px-2.5 py-1.5 text-left",
                        isActive
                          ? "bg-foreground text-background shadow-xs font-semibold"
                          : "text-secondary hover:text-ink hover:bg-foreground/[0.04]"
                      )}
                    >
                      <Icon size={14} className="shrink-0" />
                      {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                      {!collapsed && item.badge && (
                        <span
                          className={cn(
                            "px-1.5 py-0.2 rounded-full text-[9px]",
                            isActive ? "bg-background/20 text-background" : "bg-foreground/[0.06] text-muted"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}

                {!collapsed && (
                  <>
                    <p className="px-2 pt-2.5 pb-1 text-[9px] font-medium uppercase tracking-wider text-muted">
                      Estudio
                    </p>
                    {SECONDARY_NAV.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className="flex items-center gap-2 px-2.5 py-1 text-xs text-muted hover:text-secondary rounded-lg transition-colors cursor-pointer"
                        >
                          <Icon size={13} className="shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>

            {/* Sidebar Footer User */}
            <div className="p-2 border-t border-line">
              <div className={cn("flex items-center gap-2 rounded-lg p-1 text-xs", collapsed ? "justify-center" : "")}>
                <div className="size-6 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold flex items-center justify-center text-[10px] shrink-0">
                  CS
                </div>
                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-medium text-ink">Camila Soto</p>
                    <p className="truncate text-[9px] text-muted">Administrador</p>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Main App Content View Area */}
          <main className="p-3 sm:p-4.5 overflow-hidden flex flex-col justify-between bg-base">
            <div>
              {/* App View Header */}
              <div className="flex items-center justify-between pb-3 border-b border-line gap-2">
                <div>
                  <h4 className="text-sm font-semibold tracking-tight text-ink flex items-center gap-2">
                    {activeTab === "dashboard" && "Dashboard General"}
                    {activeTab === "facturacion" && "Facturación Electrónica"}
                    {activeTab === "sueldos" && "Nómina y Liquidaciones"}
                    {activeTab === "caja" && "Conciliación Bancaria"}
                  </h4>
                  <p className="text-[10px] text-muted hidden sm:block">
                    Andes Tecnología SpA · RUT 76.849.200-1 · Período Agosto 2026
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full border border-line bg-surface text-[10px] text-secondary">
                    <CheckCircle2 size={11} className="text-emerald-500" />
                    <span>Al día</span>
                  </div>
                  <button className="h-6 px-2 rounded-md bg-foreground text-background text-[10px] font-medium flex items-center gap-1 hover:opacity-90 transition-opacity">
                    <Plus size={11} />
                    <span className="hidden sm:inline">Nuevo</span>
                  </button>
                </div>
              </div>

              {/* Dynamic View Tab Content */}
              <div className="pt-3">
                <AnimatePresence mode="wait">
                  {/* TAB 1: DASHBOARD */}
                  {activeTab === "dashboard" && (
                    <motion.div
                      key="dash"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      {/* Metric Cards */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="rounded-xl border border-line bg-surface p-2.5">
                          <p className="text-[9px] uppercase tracking-wider text-muted font-medium">Cobrado</p>
                          <p className="mt-0.5 font-mono text-[12px] sm:text-[14px] font-semibold text-ink">$19.504.100</p>
                          <p className="text-[9px] text-emerald-500 font-medium">+12% vs mes ant.</p>
                        </div>
                        <div className="rounded-xl border border-line bg-surface p-2.5">
                          <p className="text-[9px] uppercase tracking-wider text-muted font-medium">Por cobrar</p>
                          <p className="mt-0.5 font-mono text-[12px] sm:text-[14px] font-semibold text-ink">$9.049.950</p>
                          <p className="text-[9px] text-amber-500 font-medium">3 por vencer</p>
                        </div>
                        <div className="rounded-xl border border-line bg-surface p-2.5">
                          <p className="text-[9px] uppercase tracking-wider text-muted font-medium">Nómina Líquida</p>
                          <p className="mt-0.5 font-mono text-[12px] sm:text-[14px] font-semibold text-ink">$11.194.828</p>
                          <p className="text-[9px] text-muted">6 colaboradores</p>
                        </div>
                      </div>

                      {/* Chart & Quick List */}
                      <div className="grid gap-2 sm:grid-cols-[1.2fr_0.8fr]">
                        <div className="rounded-xl border border-line bg-surface p-2.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-medium text-ink">Flujo de Ingresos</span>
                            <span className="font-mono text-muted text-[9px]">Últimos 6 meses</span>
                          </div>
                          <MiniChart />
                        </div>

                        <div className="rounded-xl border border-line bg-surface p-2.5 space-y-1.5">
                          <p className="text-[10px] font-medium text-ink">Tareas por cerrar</p>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] p-1.5 rounded-lg bg-foreground/[0.02] border border-line">
                              <span className="truncate">F-1050 Constructora Río</span>
                              <span className="font-mono text-[9px] text-amber-500">Cobrar</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] p-1.5 rounded-lg bg-foreground/[0.02] border border-line">
                              <span className="truncate">Liquidaciones Agosto</span>
                              <span className="font-mono text-[9px] text-emerald-500">Listas</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 2: FACTURACIÓN */}
                  {activeTab === "facturacion" && (
                    <motion.div
                      key="fact"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2"
                    >
                      <div className="rounded-xl border border-line bg-surface overflow-hidden">
                        <div className="grid grid-cols-[auto_1fr_auto] gap-2 p-2 border-b border-line bg-foreground/[0.02] text-[10px] font-medium text-muted">
                          <span>Folio</span>
                          <span>Cliente / Empresa</span>
                          <span>Total</span>
                        </div>
                        <div className="divide-y divide-line text-xs">
                          <div className="grid grid-cols-[auto_1fr_auto] gap-2 p-2 items-center hover:bg-foreground/[0.02]">
                            <span className="font-mono text-[10px] font-semibold">F-1050</span>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-[11px] text-ink">Colegio Los Alerces</p>
                              <p className="truncate text-[9px] text-emerald-500">Emitida al SII</p>
                            </div>
                            <span className="font-mono text-[11px] font-semibold">$1.240.000</span>
                          </div>
                          <div className="grid grid-cols-[auto_1fr_auto] gap-2 p-2 items-center hover:bg-foreground/[0.02]">
                            <span className="font-mono text-[10px] font-semibold">F-1049</span>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-[11px] text-ink">Constructora Río Claro</p>
                              <p className="truncate text-[9px] text-amber-500">Pendiente pago</p>
                            </div>
                            <span className="font-mono text-[11px] font-semibold">$2.850.550</span>
                          </div>
                          <div className="grid grid-cols-[auto_1fr_auto] gap-2 p-2 items-center hover:bg-foreground/[0.02]">
                            <span className="font-mono text-[10px] font-semibold">F-1048</span>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-[11px] text-ink">Clínica Puerto Austral</p>
                              <p className="truncate text-[9px] text-emerald-500">Pagada</p>
                            </div>
                            <span className="font-mono text-[11px] font-semibold">$4.150.000</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 3: SUELDOS / EQUIPO */}
                  {activeTab === "sueldos" && (
                    <motion.div
                      key="sueldos"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2"
                    >
                      <div className="rounded-xl border border-line bg-surface overflow-hidden">
                        <div className="grid grid-cols-[1fr_auto_auto] gap-2 p-2 border-b border-line bg-foreground/[0.02] text-[10px] font-medium text-muted">
                          <span>Colaborador</span>
                          <span>Previsión</span>
                          <span>Líquido</span>
                        </div>
                        <div className="divide-y divide-line text-xs">
                          <div className="grid grid-cols-[1fr_auto_auto] gap-2 p-2 items-center hover:bg-foreground/[0.02]">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="size-5 rounded-full bg-violet-500/20 text-violet-600 dark:text-violet-400 font-bold text-[9px] flex items-center justify-center">CS</span>
                              <div className="min-w-0">
                                <p className="truncate text-[11px] font-medium text-ink">Camila Soto</p>
                                <p className="truncate text-[9px] text-muted">COO</p>
                              </div>
                            </div>
                            <span className="text-[9px] text-muted">Habitat · Fonasa</span>
                            <span className="font-mono text-[11px] font-semibold">$1.850.000</span>
                          </div>
                          <div className="grid grid-cols-[1fr_auto_auto] gap-2 p-2 items-center hover:bg-foreground/[0.02]">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="size-5 rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-400 font-bold text-[9px] flex items-center justify-center">DS</span>
                              <div className="min-w-0">
                                <p className="truncate text-[11px] font-medium text-ink">Diego Sepúlveda</p>
                                <p className="truncate text-[9px] text-muted">Contador</p>
                              </div>
                            </div>
                            <span className="text-[9px] text-muted">Cuprum · Colmena</span>
                            <span className="font-mono text-[11px] font-semibold">$1.420.000</span>
                          </div>
                          <div className="grid grid-cols-[1fr_auto_auto] gap-2 p-2 items-center hover:bg-foreground/[0.02]">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="size-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[9px] flex items-center justify-center">MR</span>
                              <div className="min-w-0">
                                <p className="truncate text-[11px] font-medium text-ink">Matías Rojas</p>
                                <p className="truncate text-[9px] text-muted">Desarrollador</p>
                              </div>
                            </div>
                            <span className="text-[9px] text-muted">Provida · Banmédica</span>
                            <span className="font-mono text-[11px] font-semibold">$1.650.000</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 4: CAJA */}
                  {activeTab === "caja" && (
                    <motion.div
                      key="caja"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-xl border border-line bg-surface p-2.5">
                          <p className="text-[9px] text-muted font-medium">Saldo Banco de Chile</p>
                          <p className="font-mono text-[13px] font-semibold text-ink">$14.280.000</p>
                        </div>
                        <div className="rounded-xl border border-line bg-surface p-2.5">
                          <p className="text-[9px] text-muted font-medium">Conciliación</p>
                          <p className="text-[12px] font-medium text-emerald-500 flex items-center gap-1">
                            <Check size={12} /> 100% al día
                          </p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-line bg-surface p-2 text-xs space-y-1">
                        <div className="flex items-center justify-between text-[10px] p-1.5 rounded-lg bg-foreground/[0.02] border border-line">
                          <span>Transferencia Recibida (F-1048)</span>
                          <span className="font-mono font-semibold text-emerald-500">+$4.150.000</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] p-1.5 rounded-lg bg-foreground/[0.02] border border-line">
                          <span>Pago Previred (Sueldos Jul)</span>
                          <span className="font-mono font-semibold text-muted">-$2.450.000</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Bottom Live Assistant Orb Message Pill */}
            <div className="mt-3 pt-2 border-t border-line flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <Orb size={20} state="idle" playful trackPointer={false} className="shrink-0" />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={beat}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.25 }}
                    className="truncate text-[11px] text-secondary"
                  >
                    <span className="font-semibold text-ink mr-1">{currentBeat.status}:</span>
                    <span>{currentBeat.text}</span>
                  </motion.div>
                </AnimatePresence>
              </div>
              <span className="text-[9px] font-mono text-muted uppercase shrink-0">Orb AI</span>
            </div>
          </main>
        </div>
      </motion.div>
    </div>
  );
}

function MiniChart() {
  return (
    <svg viewBox="0 0 280 65" className="mt-1 h-14 w-full" fill="none">
      <defs>
        <linearGradient id="orbix-clone-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--orbix-ink)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--orbix-ink)" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path
        d="M0 45 C20 40, 45 52, 70 36 S115 15, 140 22 S185 50, 215 30 S255 12, 280 8 V65 H0 Z"
        fill="url(#orbix-clone-grad)"
      />
      <path
        d="M0 45 C20 40, 45 52, 70 36 S115 15, 140 22 S185 50, 215 30 S255 12, 280 8"
        stroke="var(--orbix-ink)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

