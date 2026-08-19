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
import type { User as AuthUser } from "@supabase/supabase-js";
import { MIN_PASSWORD_LENGTH, translateAuthError } from "./auth-errors";
import { getSiteUrl, getSupabaseConfig } from "./supabase/config";
import { tryCreateClient } from "./supabase/client";
import { companyToRow, ensureAndLoadWorkspace, type Workspace } from "./workspace";
import type { Company, Role, Session } from "./types";

export type AuthResult =
  | { ok: true; needsEmailConfirm?: boolean }
  | { ok: false; error: string };

type ProfilePatch = {
  name: string;
  email: string;
  phone?: string;
  title?: string;
  avatarColor?: string;
};

type AuthValue = {
  ready: boolean;
  configured: boolean;
  session: Session | null;
  workspace: Workspace | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (name: string, email: string, password: string, companyName: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
  changePassword: (current: string, next: string) => Promise<AuthResult>;
  updateProfile: (patch: ProfilePatch) => Promise<AuthResult>;
  persistCompany: (id: string, patch: Partial<Company>) => Promise<AuthResult>;
  setActiveCompanyId: (id: string) => Promise<void>;
  updateMemberRole: (userId: string, role: Role) => Promise<AuthResult>;
  inviteMember: (name: string, email: string, role: Role) => Promise<AuthResult>;
  reloadWorkspace: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

function validatePassword(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `La clave debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = getSupabaseConfig().configured;
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);

  const hydrate = useCallback(async (user: AuthUser | null, companyName?: string) => {
    if (!user) {
      setSession(null);
      setWorkspace(null);
      return;
    }
    const supabase = tryCreateClient();
    if (!supabase) {
      setSession(null);
      setWorkspace(null);
      return;
    }
    const loaded = await ensureAndLoadWorkspace(supabase, user, companyName);
    setSession(loaded.session);
    setWorkspace(loaded);
  }, []);

  useEffect(() => {
    const supabase = tryCreateClient();
    if (!supabase) {
      setReady(true);
      return;
    }

    let cancelled = false;

    supabase.auth.getUser().then(async ({ data }) => {
      if (cancelled) return;
      try {
        await hydrate(data.user ?? null);
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setReady(true);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") return;
      void hydrate(nextSession?.user ?? null).catch((error) => console.error(error));
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [hydrate]);

  const login = useCallback<AuthValue["login"]>(async (email, password) => {
    const supabase = tryCreateClient();
    if (!supabase) {
      return { ok: false, error: translateAuthError("Supabase no está configurado") };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) return { ok: false, error: translateAuthError(error.message) };
    try {
      await hydrate(data.user);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: translateAuthError(err instanceof Error ? err.message : String(err)) };
    }
  }, [hydrate]);

  const register = useCallback<AuthValue["register"]>(async (name, email, password, companyName) => {
    if (!name.trim() || !email.trim() || !companyName.trim()) {
      return { ok: false, error: "Completa nombre, correo y empresa." };
    }
    const passwordError = validatePassword(password);
    if (passwordError) return { ok: false, error: passwordError };
    const supabase = tryCreateClient();
    if (!supabase) {
      return { ok: false, error: translateAuthError("Supabase no está configurado") };
    }
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { name: name.trim(), company_name: companyName.trim() },
        emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/dashboard`,
      },
    });
    if (error) return { ok: false, error: translateAuthError(error.message) };
    if (!data.session || !data.user) {
      return { ok: true, needsEmailConfirm: true };
    }
    try {
      await hydrate(data.user, companyName.trim());
      return { ok: true };
    } catch (err) {
      return { ok: false, error: translateAuthError(err instanceof Error ? err.message : String(err)) };
    }
  }, [hydrate]);

  const logout = useCallback(async () => {
    const supabase = tryCreateClient();
    await supabase?.auth.signOut();
    setSession(null);
    setWorkspace(null);
  }, []);

  const resetPassword = useCallback<AuthValue["resetPassword"]>(async (email) => {
    if (!email.includes("@")) return { ok: false, error: "Ingresa un correo válido." };
    const supabase = tryCreateClient();
    if (!supabase) {
      return { ok: false, error: translateAuthError("Supabase no está configurado") };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${getSiteUrl()}/auth/callback?next=/auth/update-password`,
    });
    if (error) return { ok: false, error: translateAuthError(error.message) };
    return { ok: true };
  }, []);

  const updatePassword = useCallback<AuthValue["updatePassword"]>(async (password) => {
    const passwordError = validatePassword(password);
    if (passwordError) return { ok: false, error: passwordError };
    const supabase = tryCreateClient();
    if (!supabase) {
      return { ok: false, error: translateAuthError("Supabase no está configurado") };
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { ok: false, error: translateAuthError(error.message) };
    return { ok: true };
  }, []);

  const changePassword = useCallback<AuthValue["changePassword"]>(async (current, next) => {
    if (!session?.email) return { ok: false, error: "Sesión inválida." };
    const passwordError = validatePassword(next);
    if (passwordError) return { ok: false, error: passwordError };
    const supabase = tryCreateClient();
    if (!supabase) {
      return { ok: false, error: translateAuthError("Supabase no está configurado") };
    }
    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: session.email,
      password: current,
    });
    if (reauthError) return { ok: false, error: "La clave actual no coincide." };
    const { error } = await supabase.auth.updateUser({ password: next });
    if (error) return { ok: false, error: translateAuthError(error.message) };
    return { ok: true };
  }, [session?.email]);

  const updateProfile = useCallback<AuthValue["updateProfile"]>(async (patch) => {
    const supabase = tryCreateClient();
    if (!supabase || !session) return { ok: false, error: "Sesión inválida." };
    const { error } = await supabase
      .from("profiles")
      .update({
        name: patch.name.trim(),
        phone: patch.phone?.trim() || null,
        title: patch.title?.trim() || null,
        avatar_color: patch.avatarColor ?? "#171716",
      })
      .eq("id", session.userId);
    if (error) return { ok: false, error: translateAuthError(error.message) };
    await supabase.auth.updateUser({ data: { name: patch.name.trim() } });
    if (patch.email.trim().toLowerCase() !== session.email.toLowerCase()) {
      const { error: emailError } = await supabase.auth.updateUser({
        email: patch.email.trim().toLowerCase(),
      });
      if (emailError) return { ok: false, error: translateAuthError(emailError.message) };
    }
    setSession((prev) => (prev ? { ...prev, ...patch, email: patch.email.trim().toLowerCase() } : prev));
    setWorkspace((prev) =>
      prev
        ? {
            ...prev,
            session: { ...prev.session, ...patch, email: patch.email.trim().toLowerCase() },
            users: prev.users.map((user) =>
              user.id === session.userId ? { ...user, ...patch, email: patch.email.trim().toLowerCase() } : user,
            ),
          }
        : prev,
    );
    return { ok: true };
  }, [session]);

  const persistCompany = useCallback<AuthValue["persistCompany"]>(async (id, patch) => {
    const supabase = tryCreateClient();
    if (!supabase) return { ok: false, error: translateAuthError("Supabase no está configurado") };
    const { error } = await supabase.from("companies").update(companyToRow(patch)).eq("id", id);
    if (error) return { ok: false, error: translateAuthError(error.message) };
    setWorkspace((prev) =>
      prev
        ? {
            ...prev,
            companies: prev.companies.map((company) => (company.id === id ? { ...company, ...patch } : company)),
          }
        : prev,
    );
    return { ok: true };
  }, []);

  const setActiveCompanyId = useCallback<AuthValue["setActiveCompanyId"]>(async (id) => {
    const supabase = tryCreateClient();
    if (!supabase || !session) return;
    await supabase.from("profiles").update({ active_company_id: id }).eq("id", session.userId);
    setWorkspace((prev) => (prev ? { ...prev, activeCompanyId: id } : prev));
  }, [session]);

  const updateMemberRole = useCallback<AuthValue["updateMemberRole"]>(async (userId, role) => {
    const supabase = tryCreateClient();
    const companyId = workspace?.activeCompanyId;
    if (!supabase || !companyId) return { ok: false, error: "No hay empresa activa." };
    const { error } = await supabase
      .from("company_members")
      .update({ role })
      .eq("company_id", companyId)
      .eq("user_id", userId);
    if (error) return { ok: false, error: translateAuthError(error.message) };
    setWorkspace((prev) =>
      prev
        ? {
            ...prev,
            users: prev.users.map((user) => (user.id === userId ? { ...user, role } : user)),
          }
        : prev,
    );
    if (session?.userId === userId) {
      setSession((prev) => (prev ? { ...prev, role } : prev));
    }
    return { ok: true };
  }, [session?.userId, workspace?.activeCompanyId]);

  const inviteMember = useCallback<AuthValue["inviteMember"]>(async (name, email, role) => {
    const supabase = tryCreateClient();
    const companyId = workspace?.activeCompanyId;
    if (!supabase || !session || !companyId) return { ok: false, error: "No hay empresa activa." };
    const normalized = email.trim().toLowerCase();
    if (!name.trim() || !normalized.includes("@")) {
      return { ok: false, error: "Completa nombre y un correo válido." };
    }
    const { error } = await supabase.from("invites").insert({
      company_id: companyId,
      email: normalized,
      name: name.trim(),
      role,
      invited_by: session.userId,
    });
    if (error) return { ok: false, error: translateAuthError(error.message) };
    await fetch("/api/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalized, name: name.trim() }),
    }).catch(() => undefined);
    return { ok: true };
  }, [session, workspace?.activeCompanyId]);

  const reloadWorkspace = useCallback(async () => {
    const supabase = tryCreateClient();
    if (!supabase) return;
    const { data } = await supabase.auth.getUser();
    await hydrate(data.user ?? null);
  }, [hydrate]);

  const value = useMemo<AuthValue>(
    () => ({
      ready,
      configured,
      session,
      workspace,
      login,
      register,
      logout,
      resetPassword,
      updatePassword,
      changePassword,
      updateProfile,
      persistCompany,
      setActiveCompanyId,
      updateMemberRole,
      inviteMember,
      reloadWorkspace,
    }),
    [
      ready,
      configured,
      session,
      workspace,
      login,
      register,
      logout,
      resetPassword,
      updatePassword,
      changePassword,
      updateProfile,
      persistCompany,
      setActiveCompanyId,
      updateMemberRole,
      inviteMember,
      reloadWorkspace,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
