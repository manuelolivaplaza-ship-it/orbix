"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppSidebar } from "./Sidebar";
import { ChromeProvider, useChrome } from "./chrome";
import { useStore } from "@/lib/store";
import { Orb } from "@/components/orb/Orb";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, ready } = useStore();
  const isPrint = pathname.includes("/imprimir");

  useEffect(() => {
    if (ready && !session) router.replace("/login");
  }, [ready, session, router]);

  if (!ready || !session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Orb size={72} state="working" playful />
        <p className="mt-4 text-sm text-muted">{ready ? "Redirigiendo al login…" : "Cargando sesión…"}</p>
      </div>
    );
  }

  if (isPrint) {
    return <div className="min-h-screen bg-white text-zinc-900">{children}</div>;
  }

  return (
    <ChromeProvider>
      <AppShellInner>{children}</AppShellInner>
    </ChromeProvider>
  );
}

function AppShellInner({ children }: { children: React.ReactNode }) {
  const { mode, setMode } = useChrome();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (mode === "chat") setOpen(true);
  }, [mode]);

  return (
    <SidebarProvider
      open={open}
      onOpenChange={(next) => {
        if (mode === "chat" && !next) setMode("platform");
        setOpen(next);
      }}
      style={
        {
          "--sidebar-width": mode === "chat" ? "22.5rem" : "13rem",
          "--sidebar-width-mobile": mode === "chat" ? "22rem" : "16rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <div className="flex h-12 items-center gap-2 border-b px-3 md:hidden">
          <SidebarTrigger />
          <span className="text-sm font-semibold">Orbix</span>
        </div>
        <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
