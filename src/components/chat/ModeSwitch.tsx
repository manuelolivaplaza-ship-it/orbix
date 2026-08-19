"use client";

import { LayoutDashboard, MessageSquare } from "lucide-react";
import { useChrome } from "@/components/layout/chrome";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function ModeSwitch() {
  const { mode, setMode } = useChrome();
  const { state, isMobile, setOpen } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;

  function go(next: "platform" | "chat") {
    setMode(next);
    if (next === "chat") setOpen(true);
  }

  if (collapsed) {
    return (
      <div className="mx-auto flex w-8 flex-col gap-0.5 rounded-md border border-sidebar-border p-0.5">
        <button
          type="button"
          title="Plataforma"
          aria-label="Plataforma"
          onClick={() => go("platform")}
          className={cn(
            "flex size-7 items-center justify-center rounded-[5px] text-sidebar-foreground/70 outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2",
            mode === "platform" && "bg-sidebar-accent text-sidebar-accent-foreground",
          )}
        >
          <LayoutDashboard className="size-3.5" />
        </button>
        <button
          type="button"
          title="Chat"
          aria-label="Chat"
          onClick={() => go("chat")}
          className={cn(
            "flex size-7 items-center justify-center rounded-[5px] text-sidebar-foreground/70 outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2",
            mode === "chat" && "bg-sidebar-accent text-sidebar-accent-foreground",
          )}
        >
          <MessageSquare className="size-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      role="tablist"
      aria-label="Modo de la barra"
      className="grid grid-cols-2 rounded-md border border-sidebar-border bg-sidebar p-0.5"
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === "platform"}
        onClick={() => go("platform")}
        className={cn(
          "inline-flex h-7 items-center justify-center gap-1.5 rounded-[5px] px-2 text-[11px] font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-colors hover:text-sidebar-foreground focus-visible:ring-2",
          mode === "platform" && "bg-sidebar-accent text-sidebar-accent-foreground",
        )}
      >
        <LayoutDashboard className="size-3" />
        Plataforma
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "chat"}
        onClick={() => go("chat")}
        className={cn(
          "inline-flex h-7 items-center justify-center gap-1.5 rounded-[5px] px-2 text-[11px] font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-colors hover:text-sidebar-foreground focus-visible:ring-2",
          mode === "chat" && "bg-sidebar-accent text-sidebar-accent-foreground",
        )}
      >
        <MessageSquare className="size-3" />
        Chat
      </button>
    </div>
  );
}
