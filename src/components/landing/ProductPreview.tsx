"use client";

import { useState } from "react";
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
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { Orb } from "@/components/orb/Orb";
import { cn } from "@/lib/cn";

type NavSection = "dashboard" | "facturacion" | "sueldos" | "caja";

interface Task {
  id: string;
  text: string;
  tag: string;
  done: boolean;
}

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

const INITIAL_TASKS: Task[] = [
  { id: "1", text: "Emitir F-1050 a Colegio Los Alerces", tag: "SII", done: true },
  { id: "2", text: "Conciliar 3 depósitos en Banco de Chile", tag: "Banco", done: true },
  { id: "3", text: "Enviar aviso de cobranza F-1049 Río Claro", tag: "Cobranza", done: false },
  { id: "4", text: "Firmar liquidaciones de agosto (6 fichas)", tag: "Nómina", done: false },
];

const PROMPT_SUGGESTIONS = [
  { prompt: "¿Cuánto falta por cobrar?", reply: "Hay $9.049.950 pendientes de cobro repartidos en 3 facturas." },
  { prompt: "Conciliar Banco de Chile", reply: "Conciliación completada: 3 transferencias vinculadas con éxito." },
  { prompt: "Estado de Nómina", reply: "6 liquidaciones de agosto calculadas y listas para transferir." },
];

export function ProductPreview({ className }: { className?: string }) {
  const [activeTab, setActiveTab] = useState<NavSection>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [factFilter, setFactFilter] = useState<"todas" | "pendientes" | "pagadas">("todas");
  const [orbText, setOrbText] = useState("Listo: Operación al día. 4 facturas emitidas este mes.");
  const [orbStatus, setOrbStatus] = useState<"idle" | "working" | "happy">("idle");
  const [orbTitle, setOrbTitle] = useState("Orb Asistente");

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
    setOrbStatus("happy");
    setOrbText("¡Tarea actualizada en el registro!");
    setTimeout(() => setOrbStatus("idle"), 2200);
  };

  const handlePromptClick = (p: { prompt: string; reply: string }) => {
    setOrbStatus("working");
    setOrbTitle("Orb analizando...");
    setOrbText("Consultando datos en tiempo real...");
    setTimeout(() => {
      setOrbStatus("happy");
      setOrbTitle("Orb Responde");
      setOrbText(p.reply);
      setTimeout(() => {
        setOrbStatus("idle");
        setOrbTitle("Orb Asistente");
      }, 4200);
    }, 500);
  };

  return (
    <div className={cn("relative w-full", className)}>
      {/* Dynamic Ambient Background Glow */}
      <div className="pointer-events-none absolute -inset-8 rounded-[50px] bg-gradient-to-tr from-amber-500/15 via-violet-500/10 to-sky-500/15 blur-3xl opacity-75 dark:opacity-60" />

      <motion.div
        className="relative h-[500px] sm:h-[530px] w-full overflow-hidden rounded-2xl sm:rounded-[26px] border border-line bg-surface/95 shadow-[0_25px_80px_rgba(0,0,0,0.10)] dark:shadow-[0_35px_110px_rgba(0,0,0,0.65)] ring-1 ring-foreground/[0.04] transition-all backdrop-blur-xl flex flex-col"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Top App Chrome / Titlebar */}
        <div className="flex h-11 shrink-0 items-center justify-between border-b border-line bg-base/90 px-4 backdrop-blur-md select-none">
          <div className="flex items-center gap-2.5">
            <div className="flex gap-1.5">
              <i className="h-3 w-3 rounded-full bg-red-400/80 hover:opacity-100 transition-opacity cursor-pointer" />
              <i className="h-3 w-3 rounded-full bg-amber-400/80 hover:opacity-100 transition-opacity cursor-pointer" />
              <i className="h-3 w-3 rounded-full bg-emerald-400/80 hover:opacity-100 transition-opacity cursor-pointer" />
            </div>
            <div className="ml-3 hidden sm:flex items-center gap-2 text-xs font-medium text-secondary">
              <span className="font-semibold text-ink">app.orbix.cl</span>
              <span className="text-faint">/</span>
              <span className="capitalize font-mono text-[11px] text-muted">{activeTab}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[11px] font-mono text-muted">Orbix OS v2.0</span>
          </div>
        </div>

        {/* Inner App Shell (Sidebar + Main App Content) */}
        <div className="grid grid-cols-[auto_1fr] flex-1 min-h-0 text-ink bg-base overflow-hidden">
          {/* Collapsible Sidebar (Fixed Icon Alignments & No Sliding) */}
          <aside
            className={cn(
              "border-r border-line bg-surface/60 flex flex-col justify-between transition-[width] duration-200 select-none overflow-hidden shrink-0",
              collapsed ? "w-12" : "w-44 sm:w-48"
            )}
          >
            <div className="flex flex-col min-h-0">
              {/* Brand Header */}
              <div className="h-12 border-b border-line flex items-center justify-between px-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="size-8 flex items-center justify-center shrink-0">
                    <Orb size={26} state={orbStatus} playful trackPointer={false} />
                  </div>
                  {!collapsed && (
                    <div className="min-w-0 overflow-hidden">
                      <p className="truncate text-xs font-bold tracking-tight text-ink">Orbix</p>
                      <p className="truncate text-[10px] text-muted font-medium">Andes SpA</p>
                    </div>
                  )}
                </div>
                {!collapsed && (
                  <button
                    onClick={() => setCollapsed(true)}
                    className="size-7 flex items-center justify-center rounded-md text-muted hover:text-ink hover:bg-foreground/[0.05] transition-colors shrink-0"
                    title="Contraer menú lateral"
                  >
                    <PanelLeft size={13} />
                  </button>
                )}
              </div>

              {/* Collapsed Expand Button */}
              {collapsed && (
                <div className="p-1 flex justify-center border-b border-line">
                  <button
                    onClick={() => setCollapsed(false)}
                    className="size-7 flex items-center justify-center rounded-md text-muted hover:text-ink hover:bg-foreground/[0.05] transition-colors"
                    title="Expandir menú lateral"
                  >
                    <PanelLeft size={13} />
                  </button>
                </div>
              )}

              {/* Navigation Items (Icons always anchored to the left) */}
              <div className="p-1.5 space-y-0.5 overflow-y-auto">
                {!collapsed && (
                  <p className="px-2 pt-1 pb-0.5 text-[9px] font-bold uppercase tracking-wider text-muted">
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
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "h-8.5 w-full flex items-center rounded-lg text-xs font-medium transition-colors cursor-pointer",
                        collapsed ? "justify-center px-0" : "px-1.5 gap-2",
                        isActive
                          ? "bg-foreground text-background font-semibold shadow-xs"
                          : "text-secondary hover:text-ink hover:bg-foreground/[0.04]"
                      )}
                    >
                      <div className="size-7 flex items-center justify-center shrink-0">
                        <Icon size={15} />
                      </div>
                      {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
                      {!collapsed && item.badge && (
                        <span
                          className={cn(
                            "px-1.5 py-0.2 rounded-full text-[9px] font-semibold",
                            isActive ? "bg-background/20 text-background" : "bg-foreground/[0.06] text-muted"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* Divider */}
                <div className="border-t border-line my-1.5" />

                {!collapsed && (
                  <p className="px-2 pt-1 pb-0.5 text-[9px] font-bold uppercase tracking-wider text-muted">
                    Estudio
                  </p>
                )}
                {SECONDARY_NAV.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "h-8 w-full flex items-center rounded-lg text-xs text-muted hover:text-secondary hover:bg-foreground/[0.03] transition-colors cursor-pointer",
                        collapsed ? "justify-center px-0" : "px-1.5 gap-2"
                      )}
                    >
                      <div className="size-7 flex items-center justify-center shrink-0">
                        <Icon size={14} />
                      </div>
                      {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sidebar User Footer (Fixed Anchor) */}
            <div className="p-1.5 border-t border-line">
              <div
                className={cn(
                  "h-8.5 w-full flex items-center rounded-lg p-1 text-xs",
                  collapsed ? "justify-center px-0" : "gap-2 px-1.5"
                )}
              >
                <div className="size-6.5 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-bold flex items-center justify-center text-[10px] shadow-xs shrink-0">
                  CS
                </div>
                {!collapsed && (
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p className="truncate text-[11px] font-semibold text-ink leading-tight">Camila Soto</p>
                    <p className="truncate text-[9px] text-muted leading-tight">Admin</p>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Main App Content View (Fixed height & Independent Scrollable Body) */}
          <main className="flex flex-col justify-between p-3.5 sm:p-4.5 overflow-hidden bg-base min-h-0">
            {/* View Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-line gap-2 shrink-0">
              <div>
                <h4 className="text-sm font-bold tracking-tight text-ink flex items-center gap-2">
                  {activeTab === "dashboard" && "Dashboard General"}
                  {activeTab === "facturacion" && "Facturación Electrónica"}
                  {activeTab === "sueldos" && "Nómina y Liquidaciones"}
                  {activeTab === "caja" && "Conciliación Bancaria"}
                </h4>
                <p className="text-[10px] text-muted hidden sm:block">
                  Andes Tecnología SpA · RUT 76.849.200-1 · Agosto 2026
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="hidden sm:flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-line bg-surface text-[10px] text-secondary">
                  <CheckCircle2 size={11} className="text-emerald-500" />
                  <span>Al día</span>
                </div>
                <button className="h-6.5 px-2.5 rounded-lg bg-foreground text-background text-[11px] font-semibold flex items-center gap-1 hover:opacity-90 transition-all shadow-xs cursor-pointer">
                  <Plus size={12} />
                  <span className="hidden sm:inline">Nuevo</span>
                </button>
              </div>
            </div>

            {/* Scrollable View Content (Never resizes container) */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden pt-2.5 pr-0.5 min-h-0">
              <AnimatePresence mode="wait">
                {/* TAB 1: DASHBOARD */}
                {activeTab === "dashboard" && (
                  <motion.div
                    key="dash"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-2.5"
                  >
                    {/* Metric Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="rounded-xl border border-line bg-surface p-2.5">
                        <p className="text-[9px] uppercase tracking-wider text-muted font-bold">Cobrado</p>
                        <p className="mt-0.5 font-mono text-[13px] font-bold text-ink">$19.504.100</p>
                        <p className="text-[9px] text-emerald-500 font-semibold flex items-center gap-0.5 mt-0.5">
                          <TrendingUp size={9} /> +12%
                        </p>
                      </div>
                      <div className="rounded-xl border border-line bg-surface p-2.5">
                        <p className="text-[9px] uppercase tracking-wider text-muted font-bold">Por cobrar</p>
                        <p className="mt-0.5 font-mono text-[13px] font-bold text-ink">$9.049.950</p>
                        <p className="text-[9px] text-amber-500 font-semibold mt-0.5">3 facturas</p>
                      </div>
                      <div className="rounded-xl border border-line bg-surface p-2.5">
                        <p className="text-[9px] uppercase tracking-wider text-muted font-bold">Nómina</p>
                        <p className="mt-0.5 font-mono text-[13px] font-bold text-ink">$11.194.828</p>
                        <p className="text-[9px] text-muted mt-0.5">6 fichas</p>
                      </div>
                      <div className="rounded-xl border border-line bg-surface p-2.5">
                        <p className="text-[9px] uppercase tracking-wider text-muted font-bold">Caja Banco</p>
                        <p className="mt-0.5 font-mono text-[13px] font-bold text-ink">$14.280.000</p>
                        <p className="text-[9px] text-emerald-500 font-semibold mt-0.5">B. Chile</p>
                      </div>
                    </div>

                    {/* Chart & Live Tasks */}
                    <div className="grid gap-2 sm:grid-cols-[1.1fr_0.9fr]">
                      {/* Chart */}
                      <div className="rounded-xl border border-line bg-surface p-2.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-ink">Flujo de Ingresos</span>
                          <span className="font-mono text-muted text-[9px]">Últimos 6 meses</span>
                        </div>
                        <MiniChart />
                      </div>

                      {/* Interactive Tasks Checklist */}
                      <div className="rounded-xl border border-line bg-surface p-2.5 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-ink">Tareas de hoy</span>
                          <span className="text-[9px] text-muted">Clic para marcar</span>
                        </div>
                        <div className="space-y-1">
                          {tasks.map((task) => (
                            <div
                              key={task.id}
                              onClick={() => toggleTask(task.id)}
                              className={cn(
                                "flex items-center justify-between text-[10.5px] p-1.5 rounded-lg border border-line transition-all cursor-pointer select-none",
                                task.done
                                  ? "bg-emerald-500/[0.04] text-muted line-through"
                                  : "bg-foreground/[0.02] text-ink hover:bg-foreground/[0.04]"
                              )}
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <div
                                  className={cn(
                                    "size-3.5 rounded border flex items-center justify-center transition-colors shrink-0",
                                    task.done
                                      ? "border-emerald-500 bg-emerald-500 text-white"
                                      : "border-line bg-surface"
                                  )}
                                >
                                  {task.done && <Check size={10} strokeWidth={3} />}
                                </div>
                                <span className="truncate">{task.text}</span>
                              </div>
                              <span className="font-mono text-[8.5px] text-muted ml-1.5 shrink-0 px-1 py-0.2 rounded bg-foreground/[0.04]">
                                {task.tag}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* TAB 2: FACTURACIÓN */}
                {activeTab === "facturacion" && (
                  <motion.div
                    key="fact"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex gap-1">
                        {(["todas", "pendientes", "pagadas"] as const).map((f) => (
                          <button
                            key={f}
                            onClick={() => setFactFilter(f)}
                            className={cn(
                              "px-2 py-0.5 rounded-md text-[11px] font-semibold capitalize transition-all cursor-pointer",
                              factFilter === f
                                ? "bg-foreground text-background"
                                : "text-muted hover:text-ink bg-foreground/[0.03]"
                            )}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                      <span className="text-[10px] text-muted">3 folios emitidos</span>
                    </div>

                    <div className="rounded-xl border border-line bg-surface overflow-hidden shadow-xs">
                      <div className="grid grid-cols-[auto_1fr_auto] gap-2.5 p-2 border-b border-line bg-foreground/[0.02] text-[9.5px] font-bold uppercase tracking-wider text-muted">
                        <span>Folio</span>
                        <span>Cliente</span>
                        <span>Total</span>
                      </div>
                      <div className="divide-y divide-line text-xs">
                        {(factFilter === "todas" || factFilter === "pendientes") && (
                          <div className="grid grid-cols-[auto_1fr_auto] gap-2.5 p-2 items-center hover:bg-foreground/[0.02] transition-colors">
                            <span className="font-mono text-[11px] font-bold text-ink">F-1050</span>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-[11px] text-ink">Colegio Los Alerces</p>
                              <p className="truncate text-[9.5px] text-emerald-500 font-medium">✓ Aceptada por SII</p>
                            </div>
                            <div className="text-right">
                              <p className="font-mono text-[11px] font-bold text-ink">$1.240.000</p>
                              <span className="text-[8.5px] text-amber-500 font-semibold">Vence en 5 días</span>
                            </div>
                          </div>
                        )}
                        {(factFilter === "todas" || factFilter === "pendientes") && (
                          <div className="grid grid-cols-[auto_1fr_auto] gap-2.5 p-2 items-center hover:bg-foreground/[0.02] transition-colors">
                            <span className="font-mono text-[11px] font-bold text-ink">F-1049</span>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-[11px] text-ink">Constructora Río Claro</p>
                              <p className="truncate text-[9.5px] text-amber-500 font-medium">Por cobrar · Aviso enviado</p>
                            </div>
                            <div className="text-right">
                              <p className="font-mono text-[11px] font-bold text-ink">$2.850.550</p>
                              <span className="text-[8.5px] text-amber-500 font-semibold">Vencida</span>
                            </div>
                          </div>
                        )}
                        {(factFilter === "todas" || factFilter === "pagadas") && (
                          <div className="grid grid-cols-[auto_1fr_auto] gap-2.5 p-2 items-center hover:bg-foreground/[0.02] transition-colors">
                            <span className="font-mono text-[11px] font-bold text-ink">F-1048</span>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-[11px] text-ink">Clínica Puerto Austral</p>
                              <p className="truncate text-[9.5px] text-emerald-500 font-medium">✓ Pagada · Banco match</p>
                            </div>
                            <div className="text-right">
                              <p className="font-mono text-[11px] font-bold text-ink">$4.150.000</p>
                              <span className="text-[8.5px] text-emerald-500 font-semibold">Conciliada</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* TAB 3: SUELDOS / EQUIPO */}
                {activeTab === "sueldos" && (
                  <motion.div
                    key="sueldos"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-foreground/[0.03] border border-line">
                      <span><strong>Total Líquido:</strong> $11.194.828</span>
                      <span className="text-emerald-500 font-semibold">✓ Previred Calculado</span>
                    </div>

                    <div className="rounded-xl border border-line bg-surface overflow-hidden shadow-xs">
                      <div className="grid grid-cols-[1fr_auto_auto] gap-2.5 p-2 border-b border-line bg-foreground/[0.02] text-[9.5px] font-bold uppercase tracking-wider text-muted">
                        <span>Colaborador</span>
                        <span className="hidden sm:inline">Previsión / Salud</span>
                        <span>Líquido</span>
                      </div>
                      <div className="divide-y divide-line text-xs">
                        <div className="grid grid-cols-[1fr_auto_auto] gap-2.5 p-2 items-center hover:bg-foreground/[0.02] transition-colors">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="size-5.5 rounded-full bg-violet-500/20 text-violet-600 dark:text-violet-400 font-bold text-[9.5px] flex items-center justify-center shrink-0">
                              CS
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-[11px] font-semibold text-ink">Camila Soto</p>
                              <p className="truncate text-[9.5px] text-muted">Directora Operaciones</p>
                            </div>
                          </div>
                          <span className="text-[9.5px] text-muted hidden sm:inline">Habitat · Fonasa</span>
                          <span className="font-mono text-[11px] font-bold text-ink">$1.850.000</span>
                        </div>

                        <div className="grid grid-cols-[1fr_auto_auto] gap-2.5 p-2 items-center hover:bg-foreground/[0.02] transition-colors">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="size-5.5 rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-400 font-bold text-[9.5px] flex items-center justify-center shrink-0">
                              DS
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-[11px] font-semibold text-ink">Diego Sepúlveda</p>
                              <p className="truncate text-[9.5px] text-muted">Contador General</p>
                            </div>
                          </div>
                          <span className="text-[9.5px] text-muted hidden sm:inline">Cuprum · Colmena</span>
                          <span className="font-mono text-[11px] font-bold text-ink">$1.420.000</span>
                        </div>

                        <div className="grid grid-cols-[1fr_auto_auto] gap-2.5 p-2 items-center hover:bg-foreground/[0.02] transition-colors">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="size-5.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[9.5px] flex items-center justify-center shrink-0">
                              MR
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-[11px] font-semibold text-ink">Matías Rojas</p>
                              <p className="truncate text-[9.5px] text-muted">Desarrollador</p>
                            </div>
                          </div>
                          <span className="text-[9.5px] text-muted hidden sm:inline">Provida · Banmédica</span>
                          <span className="font-mono text-[11px] font-bold text-ink">$1.650.000</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* TAB 4: CAJA */}
                {activeTab === "caja" && (
                  <motion.div
                    key="caja"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-2"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-line bg-surface p-2.5">
                        <p className="text-[9.5px] text-muted font-bold uppercase">Cta Corriente</p>
                        <p className="font-mono text-[13px] font-bold text-ink mt-0.5">$14.280.000</p>
                        <p className="text-[9.5px] text-muted mt-0.5">B. Chile · ****4920</p>
                      </div>
                      <div className="rounded-xl border border-line bg-surface p-2.5">
                        <p className="text-[9.5px] text-muted font-bold uppercase">Conciliación</p>
                        <p className="text-[12px] font-bold text-emerald-500 flex items-center gap-1 mt-0.5">
                          <Check size={13} strokeWidth={3} /> 100% al día
                        </p>
                        <p className="text-[9.5px] text-muted mt-0.5">Match automático</p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-line bg-surface p-2 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10.5px] p-1.5 rounded-lg bg-foreground/[0.02] border border-line">
                        <span>Transferencia F-1048 (Clínica)</span>
                        <span className="font-mono font-bold text-emerald-500">+$4.150.000</span>
                      </div>
                      <div className="flex items-center justify-between text-[10.5px] p-1.5 rounded-lg bg-foreground/[0.02] border border-line">
                        <span>Previred (Nómina Julio)</span>
                        <span className="font-mono font-bold text-muted">-$2.450.000</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Interactive Assistant Bar (Fixed at bottom) */}
            <div className="pt-2 border-t border-line space-y-1.5 shrink-0">
              {/* Quick Prompt Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[9.5px]">
                <span className="text-muted font-medium shrink-0 flex items-center gap-1">
                  <Sparkles size={10} className="text-amber-500" /> Pregunta:
                </span>
                {PROMPT_SUGGESTIONS.map((s) => (
                  <button
                    key={s.prompt}
                    onClick={() => handlePromptClick(s)}
                    className="shrink-0 px-2 py-0.5 rounded-full border border-line bg-surface hover:bg-foreground/[0.06] text-secondary hover:text-ink transition-colors cursor-pointer"
                  >
                    {s.prompt}
                  </button>
                ))}
              </div>

              {/* Orb Response Pill */}
              <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-surface border border-line text-xs shadow-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <Orb size={20} state={orbStatus} playful trackPointer={false} className="shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-[9px] uppercase text-muted leading-tight">{orbTitle}</p>
                    <p className="truncate text-[10.5px] font-medium text-ink leading-tight">{orbText}</p>
                  </div>
                </div>
                <span className="text-[8.5px] font-mono text-muted uppercase bg-foreground/[0.05] px-1.5 py-0.5 rounded-full shrink-0">
                  Orb AI
                </span>
              </div>
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
        <linearGradient id="orbix-clone-grad-2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--orbix-ink)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--orbix-ink)" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path
        d="M0 45 C20 40, 45 52, 70 36 S115 15, 140 22 S185 50, 215 30 S255 12, 280 8 V65 H0 Z"
        fill="url(#orbix-clone-grad-2)"
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


