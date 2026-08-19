"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  Building2,
  CircleUser,
  FileText,
  Landmark,
  LayoutDashboard,
  LogOut,
  Moon,
  PanelLeft,
  Search,
  Settings,
  Sun,
  Users,
  Wallet,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Orb } from "@/components/orb/Orb";
import { CommandPalette, useCommandPalette } from "@/components/app/CommandPalette";
import dynamic from "next/dynamic";
import { ModeSwitch } from "@/components/chat/ModeSwitch";
import { useEffect, useRef } from "react";
import { useChrome } from "./chrome";

const OrbChat = dynamic(
  () => import("@/components/chat/OrbChat").then((mod) => mod.OrbChat),
  { ssr: false },
);
import { SidebarIcon } from "./SidebarIcon";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const GROUPS = [
  {
    label: "Hoy",
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Comercial",
    items: [
      { href: "/facturacion", label: "Facturación", icon: FileText },
      { href: "/facturacion/cobranza", label: "Cobranza", icon: Wallet },
      { href: "/caja", label: "Caja", icon: Landmark },
    ],
  },
  {
    label: "Personas",
    items: [
      { href: "/sueldos", label: "Equipo", icon: Users },
      { href: "/sueldos/cerrar", label: "Cerrar mes", icon: Wallet },
      { href: "/mi", label: "Portal colaborador", icon: CircleUser },
    ],
  },
  {
    label: "Estudio",
    items: [
      { href: "/empresas", label: "Empresas", icon: Building2 },
      { href: "/reportes", label: "Reportes", icon: BarChart3 },
      { href: "/configuracion", label: "Configuración", icon: Settings },
    ],
  },
];

function Brand() {
  const { state, isMobile } = useSidebar();
  const { orbState } = useChrome();
  const collapsed = state === "collapsed" && !isMobile;
  const orbSize = collapsed ? 24 : 40;

  return (
    <Link
      href="/dashboard"
      className={cn(
        "flex items-center gap-2 rounded-md outline-none ring-sidebar-ring focus-visible:ring-2",
        collapsed ? "h-8 w-8 justify-center" : "px-1 py-0.5",
      )}
    >
      <Orb
        size={orbSize}
        state={orbState}
        className="shrink-0 transition-[width,height] duration-200 ease-out"
      />
      <div
        className={cn(
          "grid min-w-0 flex-1 text-left leading-tight",
          collapsed && "hidden",
        )}
      >
        <span className="truncate text-sm font-semibold">Orbix</span>
        <span className="truncate text-[11px] text-muted-foreground">Oficina financiera</span>
      </div>
    </Link>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { state, isMobile, toggleSidebar, setOpen: setSidebarOpen } = useSidebar();
  const { mode } = useChrome();
  const collapsed = state === "collapsed" && !isMobile;
  const chat = mode === "chat" && !collapsed;
  const peeked = useRef(false);
  const { open, setOpen } = useCommandPalette();
  const { resolvedTheme, setTheme } = useTheme();
  const { state: app, session, setActiveCompany, logout, markNotificationsRead } = useStore();
  const unread = app.notifications.filter((item) => !item.read).length;
  const activeCompany = app.companies.find((company) => company.id === app.activeCompanyId);
  const isDark = resolvedTheme !== "light";
  let iconIndex = 0;
  const menuSide = collapsed ? "right" : "top";

  return (
    <Sidebar
      collapsible="icon"
      onMouseEnter={() => {
        if (mode === "chat" || isMobile) return;
        if (state === "collapsed") {
          peeked.current = true;
          setSidebarOpen(true);
        }
      }}
      onMouseLeave={() => {
        if (mode === "chat" || isMobile || !peeked.current) return;
        peeked.current = false;
        setSidebarOpen(false);
      }}
    >
      <CommandPalette open={open} onOpenChange={setOpen} />

      <SidebarHeader className="overflow-visible">
        <div
          className={cn(
            "flex items-center",
            collapsed ? "justify-center py-1" : "gap-1",
          )}
        >
          <Brand />
          {collapsed || chat ? null : (
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Colapsar barra"
              title="Colapsar barra"
              className="ml-auto inline-flex size-7 items-center justify-center rounded-md text-sidebar-foreground/70 outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2"
            >
              <PanelLeft className="size-4" />
            </button>
          )}
        </div>
        <ModeSwitch />
        {chat ? null : (
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Buscar" onClick={() => setOpen(true)}>
              <Search />
              <span>Buscar</span>
              <span className="ml-auto text-[10px] tracking-wide text-muted-foreground group-data-[collapsible=icon]:hidden">
                Ctrl K
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {collapsed ? (
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Expandir barra" onClick={toggleSidebar}>
                <PanelLeft />
                <span>Expandir</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : null}
        </SidebarMenu>
        )}
      </SidebarHeader>

      <SidebarContent className={chat ? "relative min-h-0 overflow-hidden p-0" : undefined}>
        {chat ? (
          <OrbChat />
        ) : GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const index = iconIndex++;
                  const active =
                    item.href === "/facturacion"
                      ? pathname === "/facturacion" ||
                        (pathname.startsWith("/facturacion/") &&
                          !pathname.startsWith("/facturacion/cobranza"))
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                        <Link href={item.href}>
                          <SidebarIcon icon={item.icon} index={index} />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {chat ? null : (
      <SidebarFooter className="gap-1 overflow-visible p-1.5">
        <SidebarSeparator className="mx-0 mb-1" />
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  tooltip="Notificaciones"
                  className="relative"
                  onClick={() => markNotificationsRead()}
                >
                  <Bell />
                  <span>Avisos</span>
                  {unread ? (
                    <>
                      <SidebarMenuBadge className="bg-foreground/10">{unread}</SidebarMenuBadge>
                      <span className="absolute top-1.5 right-1.5 hidden size-1.5 rounded-full bg-foreground group-data-[collapsible=icon]:block" />
                    </>
                  ) : null}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side={menuSide}
                align={collapsed ? "end" : "start"}
                className="w-80"
              >
                <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {app.notifications.length === 0 ? (
                  <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                    No hay avisos.
                  </p>
                ) : (
                  app.notifications.map((item) => (
                    <DropdownMenuItem key={item.id} asChild>
                      <Link href={item.href} className="flex flex-col items-start gap-0.5">
                        <span className="text-sm text-foreground">{item.title}</span>
                        <span className="text-xs text-muted-foreground">{item.body}</span>
                        <span className="text-[11px] text-faint">{item.time}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  tooltip={session?.name ?? "Perfil"}
                  className="h-10 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:overflow-visible!"
                >
                  <UserAvatar
                    name={session?.name ?? "Invitado"}
                    color={session?.avatarColor}
                    size={24}
                    className="size-6! shrink-0 rounded-full"
                  />
                  <span className="min-w-0 flex-1 truncate text-left group-data-[collapsible=icon]:hidden">
                    <span className="block truncate text-[13px] leading-tight">
                      {session?.name ?? "Invitado"}
                    </span>
                    <span className="block truncate text-[11px] font-normal text-muted-foreground">
                      {activeCompany?.name ?? session?.email}
                    </span>
                  </span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side={menuSide}
                align={collapsed ? "end" : "start"}
                className="w-56"
              >
                <DropdownMenuLabel>
                  <p className="text-sm font-medium">{session?.name}</p>
                  <p className="text-xs font-normal text-muted-foreground">{session?.email}</p>
                </DropdownMenuLabel>
                {app.companies.length > 0 ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-[11px] font-normal text-muted-foreground">
                      Empresa activa
                    </DropdownMenuLabel>
                    {app.companies.map((company) => (
                      <DropdownMenuItem
                        key={company.id}
                        onClick={() => setActiveCompany(company.id)}
                      >
                        <Building2 />
                        <span className="truncate">{company.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/configuracion">
                    <Settings />
                    Perfil y cuenta
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme(isDark ? "light" : "dark")}>
                  {isDark ? <Sun /> : <Moon />}
                  {isDark ? "Modo claro" : "Modo oscuro"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    void logout().then(() => router.push("/login"));
                  }}
                >
                  <LogOut />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      )}
      {chat ? <ChatResizeHandle /> : <SidebarRail />}
    </Sidebar>
  );
}

function ChatResizeHandle() {
  const { setChatWidth } = useChrome();
  const dragging = useRef(false);

  useEffect(() => {
    function onMove(event: MouseEvent) {
      if (!dragging.current) return;
      const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      setChatWidth(event.clientX / rem);
    }
    function onUp() {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [setChatWidth]);

  return (
    <button
      type="button"
      aria-label="Ajustar ancho del chat"
      title="Arrastra para ajustar"
      onMouseDown={(event) => {
        event.preventDefault();
        dragging.current = true;
        document.body.style.cursor = "ew-resize";
        document.body.style.userSelect = "none";
      }}
      className="absolute inset-y-0 right-0 z-20 hidden w-2 cursor-ew-resize sm:flex"
    />
  );
}

export { AppSidebar as Sidebar };
