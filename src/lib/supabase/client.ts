import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./config";

export function createClient() {
  const { url, key, configured } = getSupabaseConfig();
  if (!configured) {
    throw new Error("Supabase no está configurado. Completa NEXT_PUBLIC_SUPABASE_URL y la anon key.");
  }
  return createBrowserClient(url, key);
}

export function tryCreateClient() {
  const { url, key, configured } = getSupabaseConfig();
  if (!configured) return null;
  return createBrowserClient(url, key);
}
