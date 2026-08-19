"use client";

import { useState, useRef, useEffect } from "react";
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
  Check,
  Search,
  MessageSquare,
  Paperclip,
  ArrowUp,
  ArrowUpRight,
  Wallet,
  Bell,
  FilePlus,
  AlertTriangle,
  Clock,
  CircleUser,
} from "lucide-react";
import { Orb } from "@/components/orb/Orb";
import { UserAvatar } from "@/components/ui/user-avatar";
import { formatCLP } from "@/lib/format";
import { cn } from "@/lib/cn";

type NavSection =
  | "dashboard"
  | "facturacion"
  | "cobranza"
  | "caja"
  | "sueldos"
  | "cerrar"
  | "portal"
  | "empresas"
  | "reportes"
  | "configuracion";
type AppMode = "platform" | "chat";

interface ChatMsg {
  id: string;
  sender: "user" | "orb";
  text: string;
  toolCall?: {
    name: string;
    output: string;
  };
  time: string;
}

const GROUPS = [
  {
    label: "Hoy",
    items: [{ id: "dashboard" as NavSection, label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Comercial",
    items: [
      { id: "facturacion" as NavSection, label: "Facturación", icon: FileText },
      { id: "cobranza" as NavSection, label: "Cobranza", icon: Wallet },
      { id: "caja" as NavSection, label: "Caja", icon: Landmark },
    ],
  },
  {
    label: "Personas",
    items: [
      { id: "sueldos" as NavSection, label: "Equipo", icon: Users },
      { id: "cerrar" as NavSection, label: "Cerrar mes", icon: Wallet },
      { id: "portal" as NavSection, label: "Portal colaborador", icon: CircleUser },
    ],
  },
  {
    label: "Estudio",
    items: [
      { id: "empresas" as NavSection, label: "Empresas", icon: Building2 },
      { id: "reportes" as NavSection, label: "Reportes", icon: BarChart3 },
      { id: "configuracion" as NavSection, label: "Configuración", icon: Settings },
    ],
  },
];

const TAB_META: Record<NavSection, { kicker: string; title: string }> = {
  dashboard: { kicker: "Hoy", title: "Andes Tecnología SpA" },
  facturacion: { kicker: "Comercial", title: "Facturación" },
  cobranza: { kicker: "Comercial", title: "Cobranza" },
  caja: { kicker: "Comercial", title: "Caja" },
  sueldos: { kicker: "Personas", title: "Equipo" },
  cerrar: { kicker: "Personas", title: "Cerrar mes" },
  portal: { kicker: "Personas", title: "Portal colaborador" },
  empresas: { kicker: "Estudio", title: "Empresas" },
  reportes: { kicker: "Estudio", title: "Reportes" },
  configuracion: { kicker: "Estudio", title: "Configuración" },
};

const CHAT_PROMPTS = [
  {
    q: "¿Qué tengo vencido por cobrar?",
    tab: "facturacion" as NavSection,
    tool: "queryInvoices({ status: 'vencida' })",
    toolOut: "3 Facturas Vencidas · Total $9.049.950",
    a: "Tienes 3 facturas vencidas: Constructora Río Claro ($2.850.550), Colegio Los Alerces ($1.240.000) y Minera del Sur ($4.959.400). ¿Quieres que envíe un aviso automático por WhatsApp ahora?",
  },
  {
    q: "Crea borrador de factura para Los Alerces por $2.400.000",
    tab: "facturacion" as NavSection,
    tool: "createDraftInvoice({ client: 'Colegio Los Alerces', net: 2400000, iva: 456000 })",
    toolOut: "Borrador DTE Nº 1053 Generado con Éxito",
    a: "Factura borrador Nº 1053 creada: $2.400.000 Neto + $456.000 IVA (19%) = Total $2.856.000. Vencimiento a 30 días. Lista para tu firma digital.",
  },
  {
    q: "Audita la nómina de agosto en Previred",
    tab: "sueldos" as NavSection,
    tool: "auditPayrollPrevired({ period: '2026-08' })",
    toolOut: "Previred 100% OK · 6 Colaboradores Verificados",
    a: "Auditoría completada sin descalces. Las cotizaciones de Habitat, Cuprum, Fonasa y Colmena cuadran exactamente con las tablas oficiales vigentes.",
  },
  {
    q: "Concilia los depósitos de Banco de Chile",
    tab: "caja" as NavSection,
    tool: "matchBankTransactions({ account: 'Banco de Chile ****4920' })",
    toolOut: "3 Transferencias Conciliadas · +$14.280.000",
    a: "He conciliado 3 transferencias con sus facturas emitidas. Saldo en cuenta corriente actualizado al 100%.",
  },
];

export function ProductPreview({ className }: { className?: string }) {
  const [mode, setMode] = useState<AppMode>("platform");
  const [activeTab, setActiveTab] = useState<NavSection>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [factFilter, setFactFilter] = useState<"todas" | "pendientes" | "pagadas">("todas");
  const [orbStatus, setOrbStatus] = useState<"idle" | "working" | "happy">("idle");
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatScrollerRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: "init",
      sender: "orb",
      text: "¡Hola Catalina! Soy Orb. Puedo facturar, leer un Excel, avisar cobranzas y mover la oficina.",
      time: "10:30",
    },
  ]);

  // Scroll ONLY the internal container without shifting or scrolling the browser window
  useEffect(() => {
    if (chatScrollerRef.current) {
      chatScrollerRef.current.scrollTop = chatScrollerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendPrompt = (item: (typeof CHAT_PROMPTS)[0]) => {
    const userMsg: ChatMsg = {
      id: String(Date.now()),
      sender: "user",
      text: item.q,
      time: "Ahora",
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    setOrbStatus("working");
    if (item.tab) setActiveTab(item.tab);

    setTimeout(() => {
      setIsTyping(false);
      setOrbStatus("happy");
      const botMsg: ChatMsg = {
        id: String(Date.now() + 1),
        sender: "orb",
        text: item.a,
        toolCall: {
          name: item.tool,
          output: item.toolOut,
        },
        time: "Ahora",
      };
      setMessages((prev) => [...prev, botMsg]);
      setTimeout(() => setOrbStatus("idle"), 3000);
    }, 550);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const text = chatInput.trim();
    setChatInput("");

    const matched = CHAT_PROMPTS.find(
      (p) => p.q.toLowerCase().includes(text.toLowerCase()) || text.toLowerCase().includes("factura") || text.toLowerCase().includes("vencid") || text.toLowerCase().includes("nómina") || text.toLowerCase().includes("banco")
    ) ?? CHAT_PROMPTS[0];

    const userMsg: ChatMsg = {
      id: String(Date.now()),
      sender: "user",
      text,
      time: "Ahora",
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    setOrbStatus("working");
    if (matched.tab) setActiveTab(matched.tab);

    setTimeout(() => {
      setIsTyping(false);
      setOrbStatus("happy");
      const botMsg: ChatMsg = {
        id: String(Date.now() + 1),
        sender: "orb",
        text: matched.a,
        toolCall: {
          name: matched.tool,
          output: matched.toolOut,
        },
        time: "Ahora",
      };
      setMessages((prev) => [...prev, botMsg]);
      setTimeout(() => setOrbStatus("idle"), 3000);
    }, 650);
  };

  return (
    <div className={cn("relative w-full", className)}>
      {/* Dynamic Ambient Background Glow */}
      <div className="pointer-events-none absolute -inset-8 rounded-[50px] bg-gradient-to-tr from-amber-500/15 via-violet-500/10 to-sky-500/15 blur-3xl opacity-75 dark:opacity-60" />

      <motion.div
        className="relative h-[560px] sm:h-[640px] w-full overflow-hidden rounded-2xl sm:rounded-[26px] border border-line bg-surface/95 shadow-[0_25px_80px_rgba(0,0,0,0.10)] dark:shadow-[0_35px_110px_rgba(0,0,0,0.65)] ring-1 ring-foreground/[0.04] transition-all backdrop-blur-xl flex flex-col"
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
              <span className="capitalize font-mono text-[11px] text-muted">
                {mode === "chat" ? "chat-orb" : activeTab}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[11px] font-mono text-muted">Orbix OS v2.0</span>
          </div>
        </div>

        {/* Inner App Shell (Sidebar + Main App Content) */}
        <div className="grid grid-cols-[auto_1fr] flex-1 min-h-0 text-ink bg-background overflow-hidden">
          {/* Collapsible Sidebar (Hosts standard navigation OR transforms into Orb Chat) */}
          <aside
            className={cn(
              "border-r border-sidebar-border bg-sidebar flex flex-col justify-between transition-[width] duration-200 select-none overflow-hidden shrink-0",
              collapsed
                ? "w-12"
                : mode === "chat"
                ? "w-64 sm:w-72 md:w-80"
                : "w-48 sm:w-52"
            )}
          >
            <div className="flex flex-col min-h-0 flex-1">
              {/* Brand Header */}
              <div className="h-12 border-b border-sidebar-border flex items-center justify-between px-2.5 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="size-7 flex items-center justify-center shrink-0">
                    <Orb size={24} state={orbStatus} playful trackPointer={false} />
                  </div>
                  {!collapsed && (
                    <div className="min-w-0 overflow-hidden">
                      <p className="truncate text-xs font-bold tracking-tight text-sidebar-foreground">Orbix</p>
                      <p className="truncate text-[10px] text-muted-foreground font-medium">Oficina financiera</p>
                    </div>
                  )}
                </div>
                {!collapsed && (
                  <button
                    onClick={() => setCollapsed(true)}
                    className="size-7 flex items-center justify-center rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors shrink-0"
                    title="Contraer menú lateral"
                  >
                    <PanelLeft size={13} />
                  </button>
                )}
              </div>

              {/* Collapsed Expand Button */}
              {collapsed && (
                <div className="p-1 flex justify-center border-b border-sidebar-border">
                  <button
                    onClick={() => setCollapsed(false)}
                    className="size-7 flex items-center justify-center rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                    title="Expandir menú lateral"
                  >
                    <PanelLeft size={13} />
                  </button>
                </div>
              )}

              {/* Mode Switch (Dashboard vs Chat) */}
              {!collapsed ? (
                <div className="p-2 border-b border-sidebar-border shrink-0">
                  <div className="grid grid-cols-2 p-0.5 rounded-md border border-sidebar-border bg-sidebar text-[10.5px] font-medium">
                    <button
                      type="button"
                      onClick={() => setMode("platform")}
                      className={cn(
                        "py-1 rounded-[5px] transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                        mode === "platform"
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-2xs"
                          : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
                      )}
                    >
                      <LayoutDashboard size={11} /> Plataforma
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("chat")}
                      className={cn(
                        "py-1 rounded-[5px] transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                        mode === "chat"
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-2xs"
                          : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
                      )}
                    >
                      <MessageSquare size={11} /> Chat
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-1 border-b border-sidebar-border flex flex-col gap-1 items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setCollapsed(false);
                      setMode("platform");
                    }}
                    title="Plataforma"
                    className={cn(
                      "size-7 rounded-md flex items-center justify-center transition-colors",
                      mode === "platform" ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
                    )}
                  >
                    <LayoutDashboard size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCollapsed(false);
                      setMode("chat");
                    }}
                    title="Chat"
                    className={cn(
                      "size-7 rounded-md flex items-center justify-center transition-colors",
                      mode === "chat" ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
                    )}
                  >
                    <MessageSquare size={13} />
                  </button>
                </div>
              )}

              {/* SIDEBAR BODY: CHAT CONVERSATION OR PLATFORM NAVIGATION */}
              {mode === "chat" && !collapsed ? (
                /* LIVE ORB CHAT CONVERSATION INSIDE SIDEBAR */
                <div className="flex flex-col flex-1 min-h-0 justify-between">
                  {/* Conversation Messages Thread */}
                  <div ref={chatScrollerRef} className="flex-1 overflow-y-auto p-2.5 space-y-2.5 min-h-0 text-xs">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex flex-col gap-1 max-w-[95%]",
                          msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                        )}
                      >
                        {msg.toolCall && (
                          <div className="w-full p-2 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 text-[10px] space-y-0.5 mb-0.5">
                            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                              <CheckCircle2 size={11} /> {msg.toolCall.output}
                            </div>
                            <div className="text-[8.5px] font-mono text-muted-foreground truncate">
                              Tool: {msg.toolCall.name}
                            </div>
                          </div>
                        )}

                        <div
                          className={cn(
                            "px-2.5 py-1.5 rounded-xl leading-relaxed text-[11.5px]",
                            msg.sender === "user"
                              ? "bg-foreground text-background font-medium rounded-tr-xs shadow-2xs"
                              : "bg-sidebar-accent text-sidebar-accent-foreground rounded-tl-xs border border-sidebar-border shadow-2xs"
                          )}
                        >
                          <p>{msg.text}</p>
                        </div>
                      </div>
                    ))}

                    {isTyping && (
                      <div className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground py-1">
                        <Orb size={14} state="working" trackPointer={false} />
                        <span className="animate-pulse">Orb está calculando…</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Prompts & Mini Input inside Sidebar */}
                  <div className="p-2 border-t border-sidebar-border bg-sidebar space-y-1.5 shrink-0">
                    <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[9px]">
                      {CHAT_PROMPTS.map((p) => (
                        <button
                          key={p.q}
                          type="button"
                          onClick={() => handleSendPrompt(p)}
                          className="shrink-0 px-2 py-0.5 rounded-full border border-sidebar-border bg-sidebar-accent/50 hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-foreground transition-colors cursor-pointer"
                        >
                          {p.q}
                        </button>
                      ))}
                    </div>

                    <form onSubmit={handleCustomSubmit} className="flex items-center gap-1">
                      <div className="flex-1 relative flex items-center">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Escribe a Orb…"
                          className="w-full h-7 pl-2.5 pr-6 rounded-lg border border-sidebar-border bg-sidebar text-[11px] text-sidebar-foreground placeholder:text-muted-foreground focus:outline-none focus:border-sidebar-ring"
                        />
                        <Paperclip size={11} className="absolute right-2 text-muted-foreground pointer-events-none" />
                      </div>
                      <button
                        type="submit"
                        disabled={!chatInput.trim()}
                        className="size-7 rounded-lg bg-foreground text-background flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-30 cursor-pointer shrink-0"
                      >
                        <ArrowUp size={12} />
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                /* STANDARD PLATFORM NAVIGATION INSIDE SIDEBAR */
                <div className="flex flex-col flex-1 min-h-0 justify-between">
                  {/* Scrollable Navigation Groups */}
                  <div className="flex-1 overflow-y-auto p-1.5 space-y-2 min-h-0">
                    {/* Search Bar */}
                    {!collapsed && (
                      <div className="px-1 pt-0.5 pb-1">
                        <div className="h-7 px-2 rounded-lg border border-sidebar-border bg-sidebar-accent/40 flex items-center justify-between text-[10.5px] text-muted-foreground select-none">
                          <span className="flex items-center gap-1.5"><Search size={11} /> Buscar</span>
                          <span className="text-[9px] font-mono">Ctrl K</span>
                        </div>
                      </div>
                    )}

                    {GROUPS.map((group) => (
                      <div key={group.label} className="space-y-0.5">
                        {!collapsed && (
                          <p className="px-2 pt-1 pb-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                            {group.label}
                          </p>
                        )}
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = activeTab === item.id;
                          return (
                            <button
                              key={item.label}
                              type="button"
                              onClick={() => setActiveTab(item.id)}
                              title={collapsed ? item.label : undefined}
                              className={cn(
                                "h-7.5 w-full flex items-center rounded-lg text-xs font-medium transition-colors cursor-pointer",
                                collapsed ? "justify-center px-0" : "px-2 gap-2",
                                isActive
                                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-2xs"
                                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                              )}
                            >
                              <div className="size-5 flex items-center justify-center shrink-0">
                                <Icon size={14} />
                              </div>
                              {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  {/* Sidebar Footer with Notifications & User Profile */}
                  <div className="p-1.5 border-t border-sidebar-border space-y-1 shrink-0">
                    {!collapsed && (
                      <div className="h-7 w-full flex items-center justify-between px-2 rounded-lg text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 cursor-pointer transition-colors">
                        <div className="flex items-center gap-2">
                          <Bell size={13} />
                          <span className="text-[11px] font-medium">Avisos</span>
                        </div>
                        <span className="px-1.5 py-0.2 rounded-full bg-foreground/10 text-[9px] font-semibold text-foreground">
                          3
                        </span>
                      </div>
                    )}

                    <div
                      className={cn(
                        "h-9 w-full flex items-center rounded-lg p-1 text-xs hover:bg-sidebar-accent/40 cursor-pointer transition-colors",
                        collapsed ? "justify-center px-0" : "gap-2 px-1.5"
                      )}
                    >
                      <UserAvatar name="Catalina Reyes" color="#d4d4d4" size={24} className="size-6! shrink-0 rounded-full" />
                      {!collapsed && (
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <p className="truncate text-[11px] font-semibold text-sidebar-foreground leading-tight">Catalina Reyes</p>
                          <p className="truncate text-[9px] text-muted-foreground leading-tight">Andes Tecnología SpA</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* MAIN PLATFORM WORKSPACE */}
          <main className="flex flex-col overflow-hidden bg-background min-h-0">
            {activeTab !== "dashboard" ? (
              <div className="flex items-center justify-between px-3 sm:px-4 pt-3 pb-2.5 border-b border-line gap-2 shrink-0">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted">
                    {TAB_META[activeTab].kicker}
                  </p>
                  <h3 className="text-sm sm:text-base font-semibold tracking-tight text-ink">
                    {TAB_META[activeTab].title}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab("facturacion")}
                    className="h-7 px-2.5 rounded-lg bg-foreground text-background text-[11px] font-semibold flex items-center gap-1 hover:opacity-90 transition-all shadow-xs cursor-pointer"
                  >
                    <FilePlus size={12} />
                    <span className="hidden sm:inline">Nueva factura</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("cerrar")}
                    className="h-7 px-2.5 rounded-lg border border-line bg-surface text-secondary hover:text-ink text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Wallet size={12} />
                    <span className="hidden sm:inline">Cerrar agosto</span>
                  </button>
                </div>
              </div>
            ) : null}

            <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 py-3 min-h-0">
              <AnimatePresence mode="wait">
                {activeTab === "dashboard" && (
                  <motion.div
                    key="dash"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                  >
                    <PreviewDashboard onNavigate={setActiveTab} />
                  </motion.div>
                )}

                {/* TAB 2: FACTURACION */}
                {(activeTab === "facturacion" || activeTab === "cobranza") && (
                  <motion.div
                    key="fact"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-2"
                  >
                    <div className="flex gap-1.5 pb-1 text-[10.5px]">
                      {(["todas", "pendientes", "pagadas"] as const).map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setFactFilter(f)}
                          className={cn(
                            "px-2 py-0.5 rounded-md capitalize font-semibold transition-colors cursor-pointer",
                            factFilter === f ? "bg-foreground text-background" : "text-muted hover:text-ink"
                          )}
                        >
                          {f}
                        </button>
                      ))}
                    </div>

                    <div className="rounded-xl border border-line bg-surface divide-y divide-line text-xs">
                      <div className="p-2 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-ink text-[11px]">Factura Nº 1052</p>
                          <p className="text-[9.5px] text-muted">Constructora Río Claro SpA</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-ink text-[11px]">$3.450.000 + IVA</p>
                          <span className="text-[9px] font-semibold text-amber-500 bg-amber-500/10 px-1.5 py-0.2 rounded">
                            Vence en 3 días
                          </span>
                        </div>
                      </div>

                      <div className="p-2 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-ink text-[11px]">Factura Nº 1051</p>
                          <p className="text-[9.5px] text-muted">Colegio Los Alerces</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-ink text-[11px]">$1.240.000 + IVA</p>
                          <span className="text-[9px] font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                            Pagada
                          </span>
                        </div>
                      </div>

                      <div className="p-2 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-ink text-[11px]">Factura Nº 1050</p>
                          <p className="text-[9.5px] text-muted">Servicios Mineros Austral</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-ink text-[11px]">$4.959.400 + IVA</p>
                          <span className="text-[9px] font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                            Pagada
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* TAB 3: SUELDOS */}
                {(activeTab === "sueldos" || activeTab === "cerrar") && (
                  <motion.div
                    key="sueldos"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-2"
                  >
                    <div className="rounded-xl border border-line bg-surface p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-muted uppercase">Previred Agosto</span>
                        <p className="font-mono text-[13px] font-bold text-ink">$6.820.000 Total Líquido</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] border border-emerald-500/20">
                        ✓ Tablas 2026
                      </span>
                    </div>

                    <div className="rounded-xl border border-line bg-surface divide-y divide-line text-xs">
                      <div className="p-2 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-ink text-[11px]">Camila Soto</p>
                          <p className="text-[9.5px] text-muted">Habitat · Fonasa 7%</p>
                        </div>
                        <p className="font-mono font-bold text-ink text-[11px]">$1.850.000 Líq.</p>
                      </div>
                      <div className="p-2 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-ink text-[11px]">Diego Sepúlveda</p>
                          <p className="text-[9.5px] text-muted">Cuprum · Colmena</p>
                        </div>
                        <p className="font-mono font-bold text-ink text-[11px]">$1.420.000 Líq.</p>
                      </div>
                      <div className="p-2 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-ink text-[11px]">Matías Rojas</p>
                          <p className="text-[9.5px] text-muted">Provida · Banmédica</p>
                        </div>
                        <p className="font-mono font-bold text-ink text-[11px]">$1.650.000 Líq.</p>
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

                {/* TAB 5: EMPRESAS */}
                {activeTab === "empresas" && (
                  <motion.div
                    key="empresas"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-2"
                  >
                    <div className="p-3 rounded-xl border border-line bg-surface space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-ink text-[12px]">Andes Tecnología SpA</p>
                          <p className="text-[10px] text-muted font-mono">RUT 76.849.200-1 · Principal</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-[9px]">
                          Activa
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "portal" && (
                  <motion.div
                    key="portal"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-2"
                  >
                    <div className="p-3 rounded-2xl border border-line bg-surface/75 space-y-1.5">
                      <p className="font-semibold text-ink text-sm">Catalina Reyes</p>
                      <p className="text-[11px] text-muted">Liquidación agosto · Habitat · Fonasa</p>
                      <p className="font-mono text-sm font-semibold text-foreground">{formatCLP(1850000)} líquido</p>
                    </div>
                  </motion.div>
                )}

                {/* TAB 6: REPORTES */}
                {activeTab === "reportes" && (
                  <motion.div
                    key="reportes"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-2"
                  >
                    <div className="p-3 rounded-xl border border-line bg-surface space-y-2 text-xs">
                      <p className="font-bold text-ink text-[12px]">Balance y Estado de Resultados</p>
                      <p className="text-[10px] text-muted">Margen Operacional: 42.8% · EBITDA: $18.420.000</p>
                    </div>
                  </motion.div>
                )}

                {/* TAB 7: CONFIGURACION */}
                {activeTab === "configuracion" && (
                  <motion.div
                    key="configuracion"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-2"
                  >
                    <div className="p-3 rounded-xl border border-line bg-surface space-y-2 text-xs">
                      <p className="font-bold text-ink text-[12px]">Certificado Digital & API SII</p>
                      <p className="text-[10px] text-muted font-mono">CAF Vigente · Firma Activa · Ambiente Producción</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>
      </motion.div>
    </div>
  );
}

const METRICS = [
  { label: "Caja neta", value: 14130300, hint: "11 movimientos" },
  { label: "Ingresos cobrados", value: 19504100, hint: "6 facturas pagadas" },
  { label: "Por cobrar", value: 10109050, hint: "Facturas enviadas o vencidas" },
  { label: "Nómina estimada", value: 11194828, hint: "Líquido del periodo" },
];

const INBOX: Array<{
  id: string;
  title: string;
  detail: string;
  amount?: number;
  urgency: "critical" | "warn" | "info";
}> = [
  { id: "1", title: "F-1044 vencida", detail: "Constructora Río Claro · 62 días", amount: 4185500, urgency: "critical" },
  { id: "2", title: "Pagar Previred", detail: "Cotizaciones julio", amount: 2140000, urgency: "critical" },
  { id: "3", title: "F-1043 vencida", detail: "Clínica del Valle · 7 días", amount: 2694400, urgency: "warn" },
  { id: "4", title: "F-1052 vencida", detail: "Mercado Norte SpA · 48 días", amount: 1859100, urgency: "warn" },
];

const AGING = [
  { key: "Al día", count: 1, color: "var(--foreground)" },
  { key: "1–30", count: 1, color: "var(--orbix-secondary)" },
  { key: "31–60", count: 1, color: "var(--orbix-muted)" },
  { key: "61–90", count: 1, color: "var(--orbix-faint)" },
  { key: "+90", count: 0, color: "#ef4444" },
];

const DEBTORS = [
  { name: "Constructora Río Claro", count: 2, amount: 6955550 },
  { name: "Clínica del Valle", count: 1, amount: 2694400 },
  { name: "Mercado Norte SpA", count: 1, amount: 1859100 },
];

const ACTIONS = [
  { id: "facturacion" as NavSection, label: "Nueva cotización" },
  { id: "cobranza" as NavSection, label: "Enviar recordatorios" },
  { id: "cerrar" as NavSection, label: "Cerrar nómina de agosto" },
  { id: "caja" as NavSection, label: "Conciliar cartola" },
  { id: "empresas" as NavSection, label: "Vista consolidada" },
];

const CASH_POINTS = [14130300, 13980000, 13820000, 3200000, 3380000, 3475522];

const URGENCY_BORDER = {
  critical: "border-l-red-400",
  warn: "border-l-amber-400",
  info: "border-l-foreground/40",
};

function PreviewDashboard({
  onNavigate,
}: {
  onNavigate: (tab: NavSection) => void;
}) {
  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-0.5 text-[10px] font-medium uppercase tracking-[0.22em] text-muted">Hoy</p>
          <h3 className="text-lg font-semibold tracking-tight text-ink sm:text-xl">Andes Tecnología SpA</h3>
          <p className="mt-1 max-w-md text-[11px] text-secondary sm:text-xs">
            Lo que hay que hacer hoy: cobrar, pagar y cerrar el mes.
          </p>
        </div>
        <div className="flex shrink-0 flex-nowrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onNavigate("facturacion")}
            className="h-7 shrink-0 px-2.5 rounded-lg bg-foreground text-background text-[11px] font-semibold inline-flex items-center gap-1 hover:opacity-90 shadow-xs cursor-pointer whitespace-nowrap"
          >
            <FilePlus size={12} /> Nueva factura
          </button>
          <button
            type="button"
            onClick={() => onNavigate("cerrar")}
            className="h-7 shrink-0 px-2.5 rounded-lg border border-line bg-surface text-[11px] font-semibold inline-flex items-center gap-1 text-secondary hover:text-ink cursor-pointer whitespace-nowrap"
          >
            <Wallet size={12} /> Cerrar agosto
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
        {METRICS.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-line bg-surface/75 p-3">
            <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{metric.label}</p>
            <p className="mt-1.5 font-mono text-[13px] sm:text-[15px] font-semibold tracking-tight text-foreground tabular-nums">
              {formatCLP(metric.value)}
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">{metric.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 grid gap-2 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-line bg-surface/75 p-3">
          <div className="mb-2.5 flex items-center justify-between">
            <div>
              <h4 className="text-[12px] font-medium text-foreground">Inbox de trabajo</h4>
              <p className="text-[10px] text-muted-foreground">{INBOX.length} pendientes</p>
            </div>
            <span className="inline-flex h-5 items-center rounded-full border border-line bg-foreground/[0.06] px-2 text-[10px] font-semibold text-secondary">
              Agosto 2026
            </span>
          </div>
          <ul className="space-y-1.5">
            {INBOX.map((task) => {
              const Icon = task.urgency === "critical" ? AlertTriangle : task.urgency === "warn" ? Clock : CheckCircle2;
              return (
                <li
                  key={task.id}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-lg border border-line border-l-2 bg-foreground/[0.03] px-2.5 py-1.5",
                    URGENCY_BORDER[task.urgency],
                  )}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Icon size={12} className="shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="truncate text-[11px] text-foreground">{task.title}</p>
                      <p className="truncate text-[9.5px] text-muted-foreground">{task.detail}</p>
                    </div>
                  </div>
                  {task.amount != null ? (
                    <span className="font-mono tabular-nums text-[10px] text-foreground shrink-0">{formatCLP(task.amount)}</span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="space-y-2">
          <div className="rounded-2xl border border-line bg-surface/75 p-3">
            <div className="mb-2.5 flex items-center justify-between">
              <h4 className="text-[12px] font-medium text-foreground">Aging de cobranza</h4>
              <span className="text-[10px] text-muted-foreground">Ver cobranza</span>
            </div>
            <div className="flex h-2.5 overflow-hidden rounded-full bg-foreground/8">
              {AGING.map((bucket) => (
                <div
                  key={bucket.key}
                  className="h-full"
                  style={{ width: `${bucket.count === 0 ? 0 : 25}%`, background: bucket.color }}
                />
              ))}
            </div>
            <ul className="mt-3 grid grid-cols-5 gap-1 text-center">
              {AGING.map((bucket) => (
                <li key={bucket.key}>
                  <p className="text-[8.5px] uppercase tracking-wider text-muted-foreground">{bucket.key}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-foreground">{bucket.count}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-line bg-surface/75 p-3">
            <h4 className="mb-2 text-[12px] font-medium text-foreground">Top deudores</h4>
            <ul className="space-y-2">
              {DEBTORS.map((debtor) => (
                <li key={debtor.name} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[11px] text-foreground">{debtor.name}</p>
                    <p className="text-[9.5px] text-muted-foreground">{debtor.count} docs</p>
                  </div>
                  <span className="font-mono tabular-nums text-[11px] text-foreground shrink-0">{formatCLP(debtor.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-2 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-line bg-surface/75 p-3">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-[12px] font-medium text-foreground">Flujo de caja 30 días</h4>
            <span className="text-[10px] text-muted-foreground">Abrir caja</span>
          </div>
          <MiniCashSpark points={CASH_POINTS} />
          <p className="mt-1 text-[10px] text-muted-foreground">Proyección 17/09: {formatCLP(3475522)}</p>
        </div>

        <div className="rounded-2xl border border-line bg-surface/75 p-3">
          <h4 className="mb-2 text-[12px] font-medium text-foreground">Acciones</h4>
          <div className="space-y-1.5">
            {ACTIONS.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => onNavigate(action.id)}
                className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] text-foreground hover:bg-foreground/5 cursor-pointer"
              >
                {action.label}
                <ArrowUpRight size={12} className="text-muted-foreground" />
              </button>
            ))}
          </div>
          <p className="mt-3 text-[10px] text-muted-foreground">Por pagar</p>
          <p className="font-mono text-sm font-semibold text-foreground tabular-nums">{formatCLP(4450000)}</p>
          <p className="text-[9.5px] text-muted-foreground">Cuentas por pagar próximas</p>
        </div>
      </div>
    </div>
  );
}

function MiniCashSpark({ points }: { points: number[] }) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const w = 320;
  const h = 72;
  const d = points
    .map((value, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((value - min) / span) * (h - 10) - 5;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-16 w-full" aria-hidden>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground" />
    </svg>
  );
}
