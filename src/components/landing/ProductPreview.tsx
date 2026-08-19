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
  Plus,
  Check,
  TrendingUp,
  Sparkles,
  Search,
  MessageSquare,
  Paperclip,
  ArrowUp,
  Wallet,
  CircleUser,
} from "lucide-react";
import { Orb } from "@/components/orb/Orb";
import { cn } from "@/lib/cn";

type NavSection = "dashboard" | "facturacion" | "cobranza" | "caja" | "sueldos";
type AppMode = "platform" | "chat";

interface Task {
  id: string;
  text: string;
  tag: string;
  done: boolean;
}

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
    items: [{ id: "dashboard" as NavSection, label: "Dashboard", icon: LayoutDashboard, badge: "" }],
  },
  {
    label: "Comercial",
    items: [
      { id: "facturacion" as NavSection, label: "Facturación", icon: FileText, badge: "3" },
      { id: "cobranza" as NavSection, label: "Cobranza", icon: Wallet, badge: "" },
      { id: "caja" as NavSection, label: "Caja", icon: Landmark, badge: "" },
    ],
  },
  {
    label: "Personas",
    items: [
      { id: "sueldos" as NavSection, label: "Equipo", icon: Users, badge: "6" },
      { id: "sueldos" as NavSection, label: "Cerrar mes", icon: Wallet, badge: "" },
    ],
  },
  {
    label: "Estudio",
    items: [
      { id: "dashboard" as NavSection, label: "Empresas", icon: Building2, badge: "" },
      { id: "dashboard" as NavSection, label: "Reportes", icon: BarChart3, badge: "" },
      { id: "dashboard" as NavSection, label: "Configuración", icon: Settings, badge: "" },
    ],
  },
];

const INITIAL_TASKS: Task[] = [
  { id: "1", text: "Emitir F-1052 a Colegio Los Alerces", tag: "SII", done: true },
  { id: "2", text: "Conciliar 3 depósitos en Banco de Chile", tag: "Banco", done: true },
  { id: "3", text: "Enviar aviso cobranza F-1051 Río Claro", tag: "Cobranza", done: false },
  { id: "4", text: "Firmar liquidaciones de agosto (6 fichas)", tag: "Nómina", done: false },
];

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
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [factFilter, setFactFilter] = useState<"todas" | "pendientes" | "pagadas">("todas");
  const [orbStatus, setOrbStatus] = useState<"idle" | "working" | "happy">("idle");
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatScrollerRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: "init",
      sender: "orb",
      text: "¡Hola Camila! Soy Orb. Puedo facturar, leer un Excel, avisar cobranzas y mover la oficina.",
      time: "10:30",
    },
  ]);

  // Scroll ONLY the internal container without shifting or scrolling the browser window
  useEffect(() => {
    if (chatScrollerRef.current) {
      chatScrollerRef.current.scrollTop = chatScrollerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
    setOrbStatus("happy");
    setTimeout(() => setOrbStatus("idle"), 2200);
  };

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
        className="relative h-[530px] sm:h-[560px] w-full overflow-hidden rounded-2xl sm:rounded-[26px] border border-line bg-surface/95 shadow-[0_25px_80px_rgba(0,0,0,0.10)] dark:shadow-[0_35px_110px_rgba(0,0,0,0.65)] ring-1 ring-foreground/[0.04] transition-all backdrop-blur-xl flex flex-col"
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
                {mode === "chat" ? `chat-orb` : activeTab}
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
                : "w-44 sm:w-48"
            )}
          >
            <div className="flex flex-col min-h-0 flex-1">
              {/* Brand Header */}
              <div className="h-12 border-b border-sidebar-border flex items-center justify-between px-2 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="size-8 flex items-center justify-center shrink-0">
                    <Orb size={26} state={orbStatus} playful trackPointer={false} />
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
                      <LayoutDashboard size={11} /> Dashboard
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
                    title="Dashboard"
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

                  {/* Conversation Messages Thread (Scoped Scrollable div, NEVER scrolls the page) */}
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
                  <div>
                    {/* Search Fake Bar */}
                    {!collapsed && (
                      <div className="px-2 pt-2">
                        <div className="h-7 px-2 rounded-lg border border-sidebar-border bg-sidebar-accent/50 flex items-center justify-between text-[10.5px] text-muted-foreground select-none">
                          <span className="flex items-center gap-1.5"><Search size={11} /> Buscar</span>
                          <span className="text-[9px] font-mono">Ctrl K</span>
                        </div>
                      </div>
                    )}

                    {/* Navigation Groups matching real Sidebar.tsx */}
                    <div className="p-1.5 space-y-1.5 overflow-y-auto">
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
                                  "h-8 w-full flex items-center rounded-lg text-xs font-medium transition-colors cursor-pointer",
                                  collapsed ? "justify-center px-0" : "px-1.5 gap-2",
                                  isActive
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-2xs"
                                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                                )}
                              >
                                <div className="size-6 flex items-center justify-center shrink-0">
                                  <Icon size={14} />
                                </div>
                                {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
                                {!collapsed && item.badge && (
                                  <span
                                    className={cn(
                                      "px-1.5 py-0.2 rounded-full text-[9px] font-semibold",
                                      isActive ? "bg-foreground/10 text-foreground" : "bg-sidebar-accent text-muted-foreground"
                                    )}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sidebar User Footer */}
                  <div className="p-1.5 border-t border-sidebar-border">
                    <div
                      className={cn(
                        "h-8.5 w-full flex items-center rounded-lg p-1 text-xs",
                        collapsed ? "justify-center px-0" : "gap-2 px-1.5"
                      )}
                    >
                      <div className="size-6 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-bold flex items-center justify-center text-[10px] shadow-xs shrink-0">
                        CS
                      </div>
                      {!collapsed && (
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <p className="truncate text-[11px] font-semibold text-sidebar-foreground leading-tight">Camila Soto</p>
                          <p className="truncate text-[9px] text-muted-foreground leading-tight">Andes SpA · Admin</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* MAIN PLATFORM WORKSPACE */}
          <main className="flex flex-col justify-between p-3.5 sm:p-4.5 overflow-hidden bg-background min-h-0">
            {/* View Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-line gap-2 shrink-0">
              <div>
                <h4 className="text-sm font-bold tracking-tight text-ink flex items-center gap-2">
                  {activeTab === "dashboard" && "Dashboard General"}
                  {activeTab === "facturacion" && "Facturación Electrónica DTE"}
                  {activeTab === "cobranza" && "Cobranza Activa"}
                  {activeTab === "sueldos" && "Nómina y Liquidaciones"}
                  {activeTab === "caja" && "Conciliación Bancaria"}
                </h4>
                <p className="text-[10px] text-muted hidden sm:block">
                  Andes Tecnología SpA · RUT 76.849.200-1 · Agosto 2026
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                {mode === "platform" ? (
                  <button
                    type="button"
                    onClick={() => setMode("chat")}
                    className="h-6.5 px-2.5 rounded-lg border border-line bg-surface text-secondary hover:text-ink text-[10.5px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <MessageSquare size={11} />
                    <span>Abrir Chat con Orb</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMode("platform")}
                    className="h-6.5 px-2.5 rounded-lg border border-line bg-surface text-secondary hover:text-ink text-[10.5px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <LayoutDashboard size={11} />
                    <span>Ver Menú</span>
                  </button>
                )}
                <button
                  type="button"
                  className="h-6.5 px-2.5 rounded-lg bg-foreground text-background text-[11px] font-semibold flex items-center gap-1 hover:opacity-90 transition-all shadow-xs cursor-pointer"
                >
                  <Plus size={12} />
                  <span className="hidden sm:inline">Nuevo</span>
                </button>
              </div>
            </div>

            {/* Scrollable View Content */}
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
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-xl border border-line bg-surface p-2.5">
                        <p className="text-[9.5px] font-bold text-muted uppercase">Ingresos Mes</p>
                        <p className="font-mono text-[14px] font-bold text-ink mt-0.5">$24.850.000</p>
                        <span className="text-[9.5px] font-semibold text-emerald-500">↑ 18.2% vs julio</span>
                      </div>
                      <div className="rounded-xl border border-line bg-surface p-2.5">
                        <p className="text-[9.5px] font-bold text-muted uppercase">Por Cobrar</p>
                        <p className="font-mono text-[14px] font-bold text-amber-500 mt-0.5">$9.049.950</p>
                        <span className="text-[9.5px] text-muted">3 DTEs pendientes</span>
                      </div>
                      <div className="rounded-xl border border-line bg-surface p-2.5">
                        <p className="text-[9.5px] font-bold text-muted uppercase">Nómina Previred</p>
                        <p className="font-mono text-[14px] font-bold text-ink mt-0.5">$6.820.000</p>
                        <span className="text-[9.5px] text-emerald-500 font-semibold">✓ 6 fichas listas</span>
                      </div>
                    </div>

                    {/* Interactive Task List */}
                    <div className="rounded-xl border border-line bg-surface p-2.5 space-y-1.5">
                      <div className="flex items-center justify-between text-[10.5px]">
                        <span className="font-bold text-ink">Cierre Operativo de Agosto</span>
                        <span className="text-muted font-mono">{tasks.filter((t) => t.done).length}/{tasks.length} Listas</span>
                      </div>
                      <div className="space-y-1">
                        {tasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => toggleTask(task.id)}
                            className={cn(
                              "p-1.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors",
                              task.done ? "border-line bg-foreground/[0.02] opacity-60" : "border-line bg-surface hover:bg-foreground/[0.02]"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  "size-4 rounded border flex items-center justify-center",
                                  task.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-line"
                                )}
                              >
                                {task.done && <Check size={10} strokeWidth={3} />}
                              </div>
                              <span className={cn("text-[11px]", task.done && "line-through text-muted")}>
                                {task.text}
                              </span>
                            </div>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-foreground/[0.05] text-muted">
                              {task.tag}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
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
                {activeTab === "sueldos" && (
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
              </AnimatePresence>
            </div>
          </main>
        </div>
      </motion.div>
    </div>
  );
}
