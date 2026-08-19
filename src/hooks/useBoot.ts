"use client";

import { useStore } from "@/lib/store";

/** True until auth session and workspace finish loading. */
export function useBoot() {
  const { ready } = useStore();
  return !ready;
}
