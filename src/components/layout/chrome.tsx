"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { OrbState } from "@/lib/orb";

export type ShellMode = "platform" | "chat";

type ChromeValue = {
  mode: ShellMode;
  setMode: (mode: ShellMode) => void;
  orbState: OrbState;
  setOrbState: (state: OrbState) => void;
};

const ChromeContext = createContext<ChromeValue | null>(null);
const MODE_KEY = "orbix.shell.mode";

export function ChromeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ShellMode>("platform");
  const [orbState, setOrbState] = useState<OrbState>("idle");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(MODE_KEY);
      if (saved === "chat" || saved === "platform") setModeState(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const setMode = useCallback((next: ShellMode) => {
    setModeState(next);
    if (next !== "chat") setOrbState("idle");
    try {
      window.localStorage.setItem(MODE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({ mode, setMode, orbState, setOrbState }),
    [mode, setMode, orbState],
  );

  return <ChromeContext.Provider value={value}>{children}</ChromeContext.Provider>;
}

export function useChrome() {
  const ctx = useContext(ChromeContext);
  if (!ctx) throw new Error("useChrome must be used within ChromeProvider");
  return ctx;
}
