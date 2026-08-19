import type { SupabaseClient } from "@supabase/supabase-js";
import type { Company, Role, Session, User } from "./types";

export type ProfileRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  title: string | null;
  avatar_color: string | null;
  active_company_id: string | null;
};

export type CompanyRow = {
  id: string;
  name: string;
  rut: string;
  giro: string;
  address: string;
  city: string;
  region: string;
  phone: string;
  email: string;
  iva_rate: number | string;
  logo_color: string;
  bank: string;
  account: string;
};

export type MemberRow = {
  company_id: string;
  user_id: string;
  role: Role;
  profiles: ProfileRow | ProfileRow[] | null;
};

export type Workspace = {
  session: Session;
  companies: Company[];
  users: User[];
  activeCompanyId: string;
};

export function mapCompany(row: CompanyRow): Company {
  return {
    id: row.id,
    name: row.name,
    rut: row.rut ?? "",
    giro: row.giro ?? "",
    address: row.address ?? "",
    city: row.city ?? "",
    region: row.region ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    ivaRate: Number(row.iva_rate ?? 0.19),
    logoColor: row.logo_color ?? "#a3a3a3",
    bank: row.bank ?? "",
    account: row.account ?? "",
  };
}

function oneProfile(value: MemberRow["profiles"]): ProfileRow | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function asRole(value: string | null | undefined): Role {
  if (value === "contador" || value === "rrhh" || value === "lectura" || value === "admin") {
    return value;
  }
  return "admin";
}

export async function ensureAndLoadWorkspace(
  supabase: SupabaseClient,
  user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> },
  companyName?: string,
): Promise<Workspace> {
  const metaCompany =
    typeof user.user_metadata?.company_name === "string" ? user.user_metadata.company_name : "";
  const { error: ensureError } = await supabase.rpc("ensure_workspace", {
    company_name: companyName || metaCompany || "Mi empresa",
  });
  if (ensureError) {
    throw new Error(
      ensureError.message.includes("ensure_workspace") || ensureError.code === "PGRST202"
        ? "Falta ejecutar supabase/schema.sql en el SQL Editor de tu proyecto."
        : ensureError.message,
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, name, email, phone, title, avatar_color, active_company_id")
    .eq("id", user.id)
    .single();
  if (profileError) throw new Error(profileError.message);

  const { data: memberships, error: memberError } = await supabase
    .from("company_members")
    .select("company_id, user_id, role")
    .eq("user_id", user.id);
  if (memberError) throw new Error(memberError.message);

  const companyIds = (memberships ?? []).map((row) => row.company_id as string);
  let companies: Company[] = [];
  if (companyIds.length) {
    const { data: companyRows, error: companyError } = await supabase
      .from("companies")
      .select(
        "id, name, rut, giro, address, city, region, phone, email, iva_rate, logo_color, bank, account",
      )
      .in("id", companyIds);
    if (companyError) throw new Error(companyError.message);
    companies = (companyRows ?? []).map((row) => mapCompany(row as CompanyRow));
  }

  const activeCompanyId =
    (profile?.active_company_id && companyIds.includes(profile.active_company_id)
      ? profile.active_company_id
      : companyIds[0]) ?? "";

  const role =
    asRole(
      (memberships ?? []).find((row) => row.company_id === activeCompanyId)?.role as string,
    ) ?? "admin";

  let users: User[] = [];
  if (activeCompanyId) {
    const { data: team, error: teamError } = await supabase
      .from("company_members")
      .select("company_id, user_id, role, profiles ( id, name, email, phone, title, avatar_color, active_company_id )")
      .eq("company_id", activeCompanyId);
    if (teamError) throw new Error(teamError.message);
    users = (team ?? []).map((row) => {
      const member = row as MemberRow;
      const p = oneProfile(member.profiles);
      return {
        id: member.user_id,
        name: p?.name || p?.email || "Usuario",
        email: p?.email || "",
        role: asRole(member.role),
        companyIds: [member.company_id],
        phone: p?.phone ?? "",
        title: p?.title ?? "",
        avatarColor: p?.avatar_color ?? "#171716",
      };
    });
  }

  const session: Session = {
    userId: user.id,
    email: profile?.email || user.email || "",
    name: profile?.name || (typeof user.user_metadata?.name === "string" ? user.user_metadata.name : "") || "",
    role,
    phone: profile?.phone ?? "",
    title: profile?.title ?? "",
    avatarColor: profile?.avatar_color ?? "#171716",
  };

  return { session, companies, users, activeCompanyId };
}

export function companyToRow(patch: Partial<Company>) {
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.rut !== undefined) row.rut = patch.rut;
  if (patch.giro !== undefined) row.giro = patch.giro;
  if (patch.address !== undefined) row.address = patch.address;
  if (patch.city !== undefined) row.city = patch.city;
  if (patch.region !== undefined) row.region = patch.region;
  if (patch.phone !== undefined) row.phone = patch.phone;
  if (patch.email !== undefined) row.email = patch.email;
  if (patch.ivaRate !== undefined) row.iva_rate = patch.ivaRate;
  if (patch.logoColor !== undefined) row.logo_color = patch.logoColor;
  if (patch.bank !== undefined) row.bank = patch.bank;
  if (patch.account !== undefined) row.account = patch.account;
  return row;
}
