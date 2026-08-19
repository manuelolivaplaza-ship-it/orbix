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
  chatWidth: number;
  setChatWidth: (width: number) => void;
};

const ChromeContext = createContext<ChromeValue | null>(null);
const MODE_KEY = "orbix.shell.mode";
const WIDTH_KEY = "orbix.shell.chatWidth";
export const CHAT_WIDTH_MIN = 18;
export const CHAT_WIDTH_MAX = 36;
export const CHAT_WIDTH_DEFAULT = 22.5;

export function ChromeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ShellMode>("platform");
  const [orbState, setOrbState] = useState<OrbState>("idle");
  const [chatWidth, setChatWidthState] = useState(CHAT_WIDTH_DEFAULT);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(MODE_KEY);
      if (saved === "chat" || saved === "platform") setModeState(saved);
      const width = Number(window.localStorage.getItem(WIDTH_KEY));
      if (Number.isFinite(width) && width >= CHAT_WIDTH_MIN && width <= CHAT_WIDTH_MAX) {
        setChatWidthState(width);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setChatWidth = useCallback((width: number) => {
    const next = Math.min(CHAT_WIDTH_MAX, Math.max(CHAT_WIDTH_MIN, width));
    setChatWidthState(next);
    try {
      window.localStorage.setItem(WIDTH_KEY, String(next));
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
    () => ({ mode, setMode, orbState, setOrbState, chatWidth, setChatWidth }),
    [mode, setMode, orbState, chatWidth, setChatWidth],
  );

  return <ChromeContext.Provider value={value}>{children}</ChromeContext.Provider>;
}

export function useChrome() {
  const ctx = useContext(ChromeContext);
  if (!ctx) throw new Error("useChrome must be used within ChromeProvider");
  return ctx;
}
