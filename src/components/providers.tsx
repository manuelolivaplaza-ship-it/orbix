"use client";

import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth";
import { StoreProvider, useStore } from "@/lib/store";
import { useEffect } from "react";
import { toast } from "sonner";

function StoreToasts() {
  const { toasts, dismissToast } = useStore();

  useEffect(() => {
    toasts.forEach((item) => {
      if (item.tone === "success") toast.success(item.title);
      else if (item.tone === "error") toast.error(item.title);
      else toast(item.title);
      dismissToast(item.id);
    });
  }, [toasts, dismissToast]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      storageKey="orbix-theme"
    >
      <TooltipProvider>
        <AuthProvider>
          <StoreProvider>
            {children}
            <StoreToasts />
            <Toaster />
          </StoreProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
