"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Building2,
  KeyRound,
  Plug,
  Shield,
  UserRound,
  Users,
} from "lucide-react";
import { Avatar } from "@/components/ui/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/skeleton";
import { SuccessBanner } from "@/components/ui/EmptyState";
import { Switch } from "@/components/ui/labeled-switch";
import { ThemePicker } from "@/components/theme-toggle";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBoot } from "@/hooks/useBoot";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

const TABS = [
  { id: "perfil", label: "Perfil", icon: UserRound },
  { id: "cuenta", label: "Cuenta", icon: KeyRound },
  { id: "empresa", label: "Empresa", icon: Building2 },
  { id: "usuarios", label: "Equipo", icon: Users },
  { id: "notificaciones", label: "Avisos", icon: Bell },
  { id: "integraciones", label: "Integraciones", icon: Plug },
] as const;

const AVATAR_COLORS = ["#ffffff", "#d4d4d4", "#a3a3a3", "#737373", "#404040", "#111111"];

export default function ConfiguracionPage() {
  const loading = useBoot();
  const {
    state,
    session,
    company,
    updateProfile,
    changePassword,
    updateCompany,
    persistCompany,
    updateUserRole,
    inviteUser,
    setNotificationPrefs,
    toggleIntegration,
  } = useStore();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("perfil");
  const [name, setName] = useState(session?.name ?? "");
  const [email, setEmail] = useState(session?.email ?? "");
  const [phone, setPhone] = useState(session?.phone ?? "");
  const [title, setTitle] = useState(session?.title ?? "");
  const [avatarColor, setAvatarColor] = useState(session?.avatarColor ?? "#171716");
  const [currentPass, setCurrentPass] = useState("");
  const [nextPass, setNextPass] = useState("");
  const [nextPass2, setNextPass2] = useState("");
  const [passError, setPassError] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("lectura");
  const [saved, setSaved] = useState("");

  useEffect(() => {
    setName(session?.name ?? "");
    setEmail(session?.email ?? "");
    setPhone(session?.phone ?? "");
    setTitle(session?.title ?? "");
    setAvatarColor(session?.avatarColor ?? "#171716");
  }, [session]);

  if (loading) return <PageSkeleton />;

  return (
    <div>
      <PageHeader
        kicker="Workspace"
        title="Configuración"
        description="Tu perfil, la empresa activa, el equipo y cómo te avisamos."
      />

      <Tabs
        value={tab}
        onValueChange={(value) => {
          setTab(value as (typeof TABS)[number]["id"]);
          setSaved("");
        }}
        className="space-y-6"
      >
        <TabsList variant="line" className="h-auto w-full flex-wrap justify-start">
          {TABS.map((item) => {
            const Icon = item.icon;
            return (
              <TabsTrigger key={item.id} value={item.id} className="gap-1.5">
                <Icon className="size-4" />
                {item.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <div className="min-w-0 space-y-4">
          {saved ? <SuccessBanner>{saved}</SuccessBanner> : null}

          {tab === "perfil" ? (
            <Card className="p-6 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                <div className="flex flex-col items-center gap-3 sm:w-40">
                  <Avatar name={name || "Tú"} color={avatarColor} size={88} />
                  <p className="text-center text-xs text-muted">Color del avatar</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {AVATAR_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setAvatarColor(color)}
                        className={cn(
                          "h-6 w-6 rounded-full border",
                          avatarColor === color ? "border-ink ring-2 ring-ink/20" : "border-line",
                        )}
                        style={{ background: color }}
                        aria-label={`Color ${color}`}
                      />
                    ))}
                  </div>
                </div>
                <form
                  className="min-w-0 flex-1 space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const result = await updateProfile({ name, email, phone, title, avatarColor });
                    if (!result.ok) {
                      setSaved("");
                      return;
                    }
                    setSaved(
                      email.trim().toLowerCase() !== session?.email.toLowerCase()
                        ? "Perfil guardado. Si cambiaste el correo, confírmalo en tu bandeja."
                        : "Perfil actualizado.",
                    );
                  }}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Nombre completo</Label>
                      <Input value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div>
                      <Label>Cargo</Label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Gerenta general"
                      />
                    </div>
                    <div>
                      <Label>Correo</Label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Teléfono</Label>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+56 9 …"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <Shield size={14} />
                    Rol: <span className="capitalize text-ink">{session?.role}</span>
                  </div>
                  <Button type="submit">Guardar perfil</Button>
                </form>
              </div>
            </Card>
          ) : null}

          {tab === "cuenta" ? (
            <div className="space-y-4">
              <Card className="p-6 sm:p-8">
                <h2 className="text-base font-semibold text-ink">Apariencia</h2>
                <p className="mt-1 text-sm text-secondary">
                  Claro es papel, un tono bajo el blanco — no una hoja en blanco.
                </p>
                <div className="mt-5">
                  <ThemePicker />
                </div>
              </Card>
              <Card className="p-6 sm:p-8">
                <h2 className="text-base font-semibold text-ink">Sesión</h2>
                <p className="mt-1 text-sm text-secondary">
                  Entraste como {session?.email}. La sesión vive en Supabase y se refresca sola.
                </p>
              </Card>
              <Card className="p-6 sm:p-8">
                <h2 className="text-base font-semibold text-ink">Cambiar contraseña</h2>
                <form
                  className="mt-5 max-w-md space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (nextPass !== nextPass2) {
                      setPassError("Las claves nuevas no coinciden.");
                      return;
                    }
                    const result = await changePassword(currentPass, nextPass);
                    if (!result.ok) {
                      setPassError(result.error);
                      return;
                    }
                    setPassError("");
                    setCurrentPass("");
                    setNextPass("");
                    setNextPass2("");
                    setSaved("Contraseña actualizada.");
                  }}
                >
                  <div>
                    <Label>Clave actual</Label>
                    <Input
                      type="password"
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Nueva clave</Label>
                    <Input
                      type="password"
                      value={nextPass}
                      onChange={(e) => setNextPass(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Repite la nueva clave</Label>
                    <Input
                      type="password"
                      value={nextPass2}
                      onChange={(e) => setNextPass2(e.target.value)}
                    />
                  </div>
                  {passError ? <p className="text-sm text-red-400">{passError}</p> : null}
                  <Button type="submit">Actualizar clave</Button>
                </form>
              </Card>
            </div>
          ) : null}

          {tab === "empresa" && company ? (
            <Card className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <Avatar name={company.name} color={company.logoColor} size={56} />
                <div>
                  <h2 className="text-lg font-semibold text-ink">{company.name}</h2>
                  <p className="font-mono text-xs text-muted">{company.rut}</p>
                  <p className="mt-1 text-sm text-secondary">{company.giro}</p>
                </div>
              </div>
              <form
                className="mt-6 grid gap-4 sm:grid-cols-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const result = await persistCompany(company.id, {
                    email: company.email,
                    phone: company.phone,
                  });
                  if (result.ok) setSaved("Empresa actualizada.");
                }}
              >
                <div>
                  <Label>Email fiscal</Label>
                  <Input
                    value={company.email}
                    onChange={(e) => updateCompany(company.id, { email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Teléfono</Label>
                  <Input
                    value={company.phone}
                    onChange={(e) => updateCompany(company.id, { phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Dirección</Label>
                  <Input value={company.address} readOnly />
                </div>
                <div>
                  <Label>Ciudad / región</Label>
                  <Input value={`${company.city} · ${company.region}`} readOnly />
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit">Guardar datos fiscales</Button>
                </div>
              </form>
            </Card>
          ) : null}

          {tab === "usuarios" ? (
            <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
              <Card className="overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-elevated text-xs uppercase tracking-wider text-muted">
                    <tr>
                      <th className="px-4 py-3 font-medium">Persona</th>
                      <th className="px-4 py-3 font-medium">Correo</th>
                      <th className="px-4 py-3 font-medium">Rol</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.users.map((user) => (
                      <tr key={user.id} className="border-t border-line">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar
                              name={user.name}
                              color={user.avatarColor ?? "#171716"}
                              size={32}
                            />
                            <span>
                              <span className="block text-ink">{user.name}</span>
                              <span className="block text-xs text-muted">
                                {user.title ?? "—"}
                              </span>
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-secondary">{user.email}</td>
                        <td className="px-4 py-3">
                          <Select
                            value={user.role}
                            className="h-8 w-36 text-xs"
                            onChange={(e) => void updateUserRole(user.id, e.target.value as Role)}
                          >
                            <option value="admin">Admin</option>
                            <option value="contador">Contador</option>
                            <option value="rrhh">RRHH</option>
                            <option value="lectura">Lectura</option>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
              <Card className="p-5">
                <h2 className="text-sm font-medium text-ink">Invitar al workspace</h2>
                <p className="mt-1 text-xs text-muted">
                  Recibe acceso al registrarse con ese correo. Si configuraste la service role, también
                  le llega el email de invitación.
                </p>
                <form
                  className="mt-4 space-y-3"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!inviteName || !inviteEmail) return;
                    const result = await inviteUser(inviteName, inviteEmail, inviteRole);
                    if (!result.ok) {
                      setSaved("");
                      return;
                    }
                    setInviteName("");
                    setInviteEmail("");
                    setSaved("Invitación creada.");
                  }}
                >
                  <Input
                    placeholder="Nombre"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                  />
                  <Input
                    placeholder="Correo"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  <Select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as Role)}
                  >
                    <option value="admin">Admin</option>
                    <option value="contador">Contador</option>
                    <option value="rrhh">RRHH</option>
                    <option value="lectura">Lectura</option>
                  </Select>
                  <Button type="submit" className="w-full">
                    Invitar
                  </Button>
                </form>
              </Card>
            </div>
          ) : null}

          {tab === "notificaciones" ? (
            <Card className="divide-y divide-line px-6">
              <Switch
                label="Resumen por correo"
                hint="Un digest diario con lo que venció y lo que hay que pagar."
                checked={state.notificationPrefs.email}
                onChange={(email) =>
                  setNotificationPrefs({ ...state.notificationPrefs, email })
                }
              />
              <Switch
                label="Facturas vencidas"
                hint="Aviso cuando un cliente se pasa de la fecha."
                checked={state.notificationPrefs.invoices}
                onChange={(invoices) =>
                  setNotificationPrefs({ ...state.notificationPrefs, invoices })
                }
              />
              <Switch
                label="Nómina y liquidaciones"
                hint="Cuando el periodo está listo para pagar."
                checked={state.notificationPrefs.payroll}
                onChange={(payroll) =>
                  setNotificationPrefs({ ...state.notificationPrefs, payroll })
                }
              />
              <Switch
                label="Novedades de producto"
                hint="Cambios en Orbix. Poco ruido."
                checked={state.notificationPrefs.product}
                onChange={(product) =>
                  setNotificationPrefs({ ...state.notificationPrefs, product })
                }
              />
            </Card>
          ) : null}

          {tab === "integraciones" ? (
            <div className="grid gap-4 md:grid-cols-2">
              {state.integrations.map((item) => (
                <Card key={item.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">{item.name}</p>
                      <p className="mt-1 text-sm text-secondary">{item.description}</p>
                    </div>
                    <Badge tone={item.connected ? "success" : "muted"}>
                      {item.connected ? "Conectada" : "Disponible"}
                    </Badge>
                  </div>
                  <Button
                    className="mt-4"
                    size="sm"
                    variant={item.connected ? "secondary" : "primary"}
                    onClick={() => toggleIntegration(item.id)}
                  >
                    {item.connected ? "Desconectar" : "Conectar"}
                  </Button>
                </Card>
              ))}
            </div>
          ) : null}
        </div>
      </Tabs>
    </div>
  );
}
