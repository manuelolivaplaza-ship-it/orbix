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
import { filterByCompany, selectActiveCompany, switchActiveCompany } from "./company";
import {
  computeInvoiceTotals,
  documentKind,
  nextDocumentNumber,
  type InvoiceStatus,
} from "./invoice";
import { computeLiquidacion, defaultExtrasForSalary } from "./payroll";
import { useAuth, type AuthResult } from "./auth";
import { createEmptyState } from "./seed";
import { DEMO_TODAY, todayISO } from "./format";
import type {
  AppState,
  Attendance,
  Client,
  Company,
  Employee,
  Invoice,
  InvoiceEvent,
  InvoiceItem,
  LiquidacionRecord,
  Role,
  Session,
  Vacation,
} from "./types";

const OPS_KEY = (userId: string) => `orbix.v3.${userId}`;

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

type PersistedOps = Pick<
  AppState,
  | "activeCompanyId"
  | "clients"
  | "invoices"
  | "employees"
  | "liquidaciones"
  | "attendance"
  | "vacations"
  | "notifications"
  | "activity"
  | "integrations"
  | "bankTxs"
  | "payables"
  | "contracts"
  | "notificationPrefs"
>;

function loadOps(userId: string): Partial<PersistedOps> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(OPS_KEY(userId));
    if (!raw) return {};
    return JSON.parse(raw) as Partial<PersistedOps>;
  } catch {
    return {};
  }
}

function dumpOps(state: AppState): PersistedOps {
  return {
    activeCompanyId: state.activeCompanyId,
    clients: state.clients,
    invoices: state.invoices,
    employees: state.employees,
    liquidaciones: state.liquidaciones,
    attendance: state.attendance,
    vacations: state.vacations,
    notifications: state.notifications,
    activity: state.activity,
    integrations: state.integrations,
    bankTxs: state.bankTxs,
    payables: state.payables,
    contracts: state.contracts,
    notificationPrefs: state.notificationPrefs,
  };
}

function event(kind: InvoiceEvent["kind"], detail: string): InvoiceEvent {
  return { id: uid("ev"), at: DEMO_TODAY, kind, detail };
}

type Toast = { id: string; title: string; tone: "success" | "error" | "info" };

type StoreValue = {
  ready: boolean;
  configured: boolean;
  state: AppState;
  session: Session | null;
  company: Company | null;
  toasts: Toast[];
  dismissToast: (id: string) => void;
  login: (email: string, password: string) => Promise<AuthResult>;
  loginWithGoogle: () => Promise<AuthResult>;
  register: (
    name: string,
    email: string,
    password: string,
    companyName: string,
  ) => Promise<AuthResult>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
  setActiveCompany: (id: string) => void;
  updateCompany: (id: string, patch: Partial<Company>) => void;
  persistCompany: (id: string, patch: Partial<Company>) => Promise<AuthResult>;
  updateProfile: (patch: {
    name: string;
    email: string;
    phone?: string;
    title?: string;
    avatarColor?: string;
  }) => Promise<AuthResult>;
  changePassword: (current: string, next: string) => Promise<AuthResult>;
  updateUserRole: (id: string, role: Role) => Promise<AuthResult>;
  inviteUser: (name: string, email: string, role: Role) => Promise<AuthResult>;
  setNotificationPrefs: (prefs: AppState["notificationPrefs"]) => void;
  toggleIntegration: (id: string) => void;
  markNotificationsRead: () => void;
  saveInvoice: (invoice: Omit<Invoice, "id" | "number"> & { id?: string; number?: string }) => Invoice;
  deleteInvoice: (id: string) => void;
  setInvoiceStatus: (id: string, status: InvoiceStatus) => void;
  saveClient: (client: Omit<Client, "id"> & { id?: string }) => Client;
  deleteClient: (id: string) => void;
  saveEmployee: (employee: Omit<Employee, "id"> & { id?: string }) => Employee;
  generateLiquidacion: (employeeId: string, period: string) => LiquidacionRecord | { error: string };
  generatePeriod: (companyId: string, period: string) => { created: number; error?: string };
  setAttendance: (row: Omit<Attendance, "id"> & { id?: string }) => void;
  setVacationStatus: (id: string, status: "aprobada" | "pendiente" | "rechazada") => void;
  requestVacation: (input: Omit<Vacation, "id" | "status">) => void;
  convertQuote: (id: string) => Invoice | { error: string };
  duplicateInvoice: (id: string) => Invoice | { error: string };
  issueCreditNote: (id: string) => Invoice | { error: string };
  sendReminder: (id: string) => void;
  markInvoicePaid: (id: string) => void;
  toggleRecurring: (id: string) => void;
  matchBankTx: (txId: string, invoiceId: string | null) => void;
  markPayablePaid: (id: string) => void;
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const [state, setState] = useState<AppState>(() => createEmptyState());
  const [hydrated, setHydrated] = useState(false);
  const [boundUserId, setBoundUserId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const ready = auth.ready && hydrated && (auth.session ? boundUserId === auth.session.userId : true);

  useEffect(() => {
    if (!auth.ready) return;
    if (!auth.session) {
      setState(createEmptyState());
      setBoundUserId(null);
      setHydrated(true);
      return;
    }
    const ops = loadOps(auth.session.userId);
    const companies = auth.workspace?.companies ?? [];
    const users = auth.workspace?.users ?? [];
    const activeCompanyId =
      auth.workspace?.activeCompanyId ||
      ops.activeCompanyId ||
      companies[0]?.id ||
      "";
    setState({
      ...createEmptyState({
        session: auth.session,
        companies,
        users,
        activeCompanyId,
      }),
      ...ops,
      session: auth.session,
      companies,
      users,
      activeCompanyId,
    });
    setBoundUserId(auth.session.userId);
    setHydrated(true);
    // Only re-bootstrap operational data when the signed-in user changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.ready, auth.session?.userId]);

  useEffect(() => {
    if (!boundUserId || auth.session?.userId !== boundUserId) return;
    setState((prev) => ({
      ...prev,
      session: auth.session,
      companies: auth.workspace?.companies ?? prev.companies,
      users: auth.workspace?.users ?? prev.users,
    }));
  }, [boundUserId, auth.session, auth.workspace]);

  useEffect(() => {
    if (!hydrated || !state.session || state.session.userId !== boundUserId) return;
    window.localStorage.setItem(OPS_KEY(state.session.userId), JSON.stringify(dumpOps(state)));
  }, [state, hydrated, boundUserId]);

  const pushToast = useCallback((title: string, tone: Toast["tone"] = "info") => {
    const id = uid("toast");
    setToasts((prev) => [...prev, { id, title, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const login: StoreValue["login"] = useCallback(
    async (email, password) => {
      const result = await auth.login(email, password);
      if (result.ok) pushToast("Sesión iniciada", "success");
      return result;
    },
    [auth, pushToast],
  );

  const loginWithGoogle: StoreValue["loginWithGoogle"] = useCallback(async () => {
    return auth.loginWithGoogle();
  }, [auth]);

  const register: StoreValue["register"] = useCallback(
    async (name, email, password, companyName) => {
      const result = await auth.register(name, email, password, companyName);
      if (result.ok && !result.needsEmailConfirm) pushToast("Cuenta creada", "success");
      return result;
    },
    [auth, pushToast],
  );

  const logout = useCallback(async () => {
    await auth.logout();
    setState(createEmptyState());
  }, [auth]);

  const resetPassword = auth.resetPassword;
  const updatePassword = auth.updatePassword;

  const setActiveCompany = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      activeCompanyId: switchActiveCompany(
        prev.activeCompanyId,
        id,
        prev.companies.map((c) => c.id),
      ),
    }));
    void auth.setActiveCompanyId(id);
  }, [auth]);

  const updateCompany = useCallback((id: string, patch: Partial<Company>) => {
    setState((prev) => ({
      ...prev,
      companies: prev.companies.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }, []);

  const persistCompany: StoreValue["persistCompany"] = useCallback(
    async (id, patch) => {
      setState((prev) => ({
        ...prev,
        companies: prev.companies.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      }));
      const result = await auth.persistCompany(id, patch);
      if (result.ok) pushToast("Empresa actualizada", "success");
      else pushToast(result.error, "error");
      return result;
    },
    [auth, pushToast],
  );

  const updateProfile: StoreValue["updateProfile"] = useCallback(
    async (patch) => {
      const result = await auth.updateProfile(patch);
      if (result.ok) {
        setState((prev) => {
          if (!prev.session) return prev;
          return {
            ...prev,
            session: { ...prev.session, ...patch },
            users: prev.users.map((u) =>
              u.id === prev.session?.userId ? { ...u, ...patch } : u,
            ),
          };
        });
        pushToast("Perfil guardado", "success");
      }
      return result;
    },
    [auth, pushToast],
  );

  const changePassword: StoreValue["changePassword"] = useCallback(
    async (current, next) => {
      const result = await auth.changePassword(current, next);
      if (result.ok) pushToast("Contraseña actualizada", "success");
      return result;
    },
    [auth, pushToast],
  );

  const updateUserRole: StoreValue["updateUserRole"] = useCallback(
    async (id, role) => {
      const result = await auth.updateMemberRole(id, role);
      if (result.ok) {
        setState((prev) => ({
          ...prev,
          users: prev.users.map((u) => (u.id === id ? { ...u, role } : u)),
        }));
      }
      return result;
    },
    [auth],
  );

  const inviteUser: StoreValue["inviteUser"] = useCallback(
    async (name, email, role) => {
      const result = await auth.inviteMember(name, email, role);
      if (result.ok) pushToast("Invitación creada. Entra cuando se registre con ese correo.", "success");
      return result;
    },
    [auth, pushToast],
  );

  const setNotificationPrefs = useCallback((prefs: AppState["notificationPrefs"]) => {
    setState((prev) => ({ ...prev, notificationPrefs: prefs }));
    pushToast("Preferencias guardadas", "success");
  }, [pushToast]);

  const toggleIntegration = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      integrations: prev.integrations.map((item) =>
        item.id === id ? { ...item, connected: !item.connected } : item,
      ),
    }));
  }, []);

  const markNotificationsRead = useCallback(() => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  }, []);

  const saveInvoice: StoreValue["saveInvoice"] = useCallback((input) => {
    const kind = documentKind(input);
    let saved: Invoice = {
      id: input.id ?? uid("inv"),
      number: input.number ?? "",
      companyId: input.companyId,
      clientId: input.clientId,
      status: input.status,
      issueDate: input.issueDate,
      dueDate: input.dueDate,
      items: input.items.map((it) => ({ ...it, id: it.id || uid("it") })),
      taxRate: input.taxRate,
      notes: input.notes,
      kind,
      relatedId: input.relatedId,
      portalToken: input.portalToken ?? uid("pt"),
      reminderCount: input.reminderCount ?? 0,
      reminderSentAt: input.reminderSentAt,
      paidAt: input.paidAt ?? (input.status === "pagada" ? DEMO_TODAY : undefined),
      sentAt: input.sentAt ?? (input.status !== "borrador" ? DEMO_TODAY : undefined),
      viewedAt: input.viewedAt,
      recurring: input.recurring,
      events: input.events?.length ? input.events : [event("created", "Documento creado")],
    };
    setState((prev) => {
      const siblings = prev.invoices.filter((i) => i.companyId === saved.companyId);
      const number =
        saved.number || nextDocumentNumber(siblings.map((i) => i.number), kind);
      saved = { ...saved, number };
      const exists = prev.invoices.some((i) => i.id === saved.id);
      const invoices = exists
        ? prev.invoices.map((i) => (i.id === saved.id ? { ...i, ...saved } : i))
        : [saved, ...prev.invoices];
      const totals = computeInvoiceTotals(saved.items, saved.taxRate);
      return {
        ...prev,
        invoices,
        activity: [
          {
            id: uid("ac"),
            companyId: saved.companyId,
            title: exists ? `${saved.number} actualizado` : `${saved.number} creado`,
            detail: `Total ${totals.total}`,
            time: "Ahora",
            kind: "invoice" as const,
          },
          ...prev.activity,
        ],
      };
    });
    pushToast("Documento guardado", "success");
    return saved;
  }, [pushToast]);

  const deleteInvoice = useCallback((id: string) => {
    setState((prev) => ({ ...prev, invoices: prev.invoices.filter((i) => i.id !== id) }));
    pushToast("Factura eliminada", "info");
  }, [pushToast]);

  const setInvoiceStatus = useCallback((id: string, status: InvoiceStatus) => {
    setState((prev) => ({
      ...prev,
      invoices: prev.invoices.map((i) => {
        if (i.id !== id) return i;
        const extra: InvoiceEvent[] = [];
        if (status === "enviada") extra.push(event("sent", "Documento enviado"));
        if (status === "pagada") extra.push(event("paid", "Marcado como pagado"));
        return {
          ...i,
          status,
          sentAt: status === "enviada" || status === "vencida" ? i.sentAt ?? DEMO_TODAY : i.sentAt,
          paidAt: status === "pagada" ? DEMO_TODAY : i.paidAt,
          events: [...(i.events ?? []), ...extra],
        };
      }),
    }));
  }, []);

  const saveClient: StoreValue["saveClient"] = useCallback((input) => {
    const saved: Client = {
      id: input.id ?? uid("cli"),
      companyId: input.companyId,
      name: input.name,
      rut: input.rut,
      giro: input.giro,
      email: input.email,
      phone: input.phone,
      address: input.address,
      city: input.city,
    };
    setState((prev) => {
      const exists = prev.clients.some((c) => c.id === saved.id);
      return {
        ...prev,
        clients: exists
          ? prev.clients.map((c) => (c.id === saved.id ? saved : c))
          : [saved, ...prev.clients],
      };
    });
    pushToast(input.id ? "Cliente actualizado" : "Cliente creado", "success");
    return saved;
  }, [pushToast]);

  const deleteClient = useCallback((id: string) => {
    setState((prev) => ({ ...prev, clients: prev.clients.filter((c) => c.id !== id) }));
    pushToast("Cliente eliminado", "info");
  }, [pushToast]);

  const saveEmployee: StoreValue["saveEmployee"] = useCallback((input) => {
    const saved: Employee = {
      id: input.id ?? uid("emp"),
      ...input,
    };
    setState((prev) => {
      const exists = prev.employees.some((e) => e.id === saved.id);
      return {
        ...prev,
        employees: exists
          ? prev.employees.map((e) => (e.id === saved.id ? saved : e))
          : [saved, ...prev.employees],
      };
    });
    pushToast("Ficha guardada", "success");
    return saved;
  }, [pushToast]);

  const generateLiquidacion: StoreValue["generateLiquidacion"] = useCallback((employeeId, period) => {
    const employee = state.employees.find((e) => e.id === employeeId);
    if (!employee) return { error: "Empleado no encontrado." };
    if (state.liquidaciones.some((l) => l.employeeId === employeeId && l.period === period)) {
      return { error: `Ya existe una liquidación para ${period}.` };
    }
    const extras = defaultExtrasForSalary(employee.sueldoBase);
    const breakdown = computeLiquidacion({ sueldoBase: employee.sueldoBase, ...extras });
    const record: LiquidacionRecord = {
      id: uid("liq"),
      employeeId,
      companyId: employee.companyId,
      period,
      createdAt: todayISO(),
      haberes: breakdown.haberes,
      descuentos: breakdown.descuentos,
      totalHaberes: breakdown.totalHaberes,
      totalDescuentos: breakdown.totalDescuentos,
      liquido: breakdown.liquido,
    };
    setState((prev) => {
      if (prev.liquidaciones.some((l) => l.employeeId === employeeId && l.period === period)) {
        return prev;
      }
      return {
        ...prev,
        liquidaciones: [record, ...prev.liquidaciones],
        activity: [
          {
            id: uid("ac"),
            companyId: employee.companyId,
            title: `Liquidación ${period} generada`,
            detail: `${employee.firstName} ${employee.lastName}`,
            time: "Ahora",
            kind: "payroll",
          },
          ...prev.activity,
        ],
      };
    });
    pushToast("Liquidación generada", "success");
    return record;
  }, [pushToast, state.employees, state.liquidaciones]);

  const generatePeriod: StoreValue["generatePeriod"] = useCallback((companyId, period) => {
    const team = state.employees.filter(
      (employee) => employee.companyId === companyId && employee.estado !== "inactivo",
    );
    const created: LiquidacionRecord[] = [];
    for (const employee of team) {
      const already = state.liquidaciones.some(
        (item) => item.employeeId === employee.id && item.period === period,
      );
      if (already) continue;
      const extras = defaultExtrasForSalary(employee.sueldoBase);
      const breakdown = computeLiquidacion({ sueldoBase: employee.sueldoBase, ...extras });
      created.push({
        id: uid("liq"),
        employeeId: employee.id,
        companyId: employee.companyId,
        period,
        createdAt: todayISO(),
        haberes: breakdown.haberes,
        descuentos: breakdown.descuentos,
        totalHaberes: breakdown.totalHaberes,
        totalDescuentos: breakdown.totalDescuentos,
        liquido: breakdown.liquido,
      });
    }
    if (!created.length) return { created: 0, error: `Ya existe una liquidación para ${period}.` };
    setState((prev) => ({
      ...prev,
      liquidaciones: [...created, ...prev.liquidaciones],
      activity: [
        {
          id: uid("ac"),
          companyId,
          title: `Nómina ${period} generada`,
          detail: `${created.length} liquidaciones`,
          time: "Ahora",
          kind: "payroll",
        },
        ...prev.activity,
      ],
    }));
    pushToast(`${created.length} liquidaciones generadas`, "success");
    return { created: created.length };
  }, [pushToast, state.employees, state.liquidaciones]);

  const setAttendance = useCallback((row: Omit<Attendance, "id"> & { id?: string }) => {
    setState((prev) => {
      const existing = prev.attendance.find(
        (a) => a.employeeId === row.employeeId && a.date === row.date,
      );
      const saved: Attendance = {
        id: row.id ?? existing?.id ?? uid("att"),
        employeeId: row.employeeId,
        companyId: row.companyId,
        date: row.date,
        status: row.status,
        hours: row.hours,
      };
      const attendance = existing
        ? prev.attendance.map((a) => (a.id === existing.id ? saved : a))
        : [saved, ...prev.attendance];
      return { ...prev, attendance };
    });
  }, []);

  const setVacationStatus = useCallback((id: string, status: "aprobada" | "pendiente" | "rechazada") => {
    setState((prev) => ({
      ...prev,
      vacations: prev.vacations.map((v) => (v.id === id ? { ...v, status } : v)),
    }));
    pushToast(
      status === "aprobada" ? "Vacaciones aprobadas" : status === "rechazada" ? "Vacaciones rechazadas" : "Vacaciones pendientes",
      "success",
    );
  }, [pushToast]);

  const requestVacation: StoreValue["requestVacation"] = useCallback((input) => {
    setState((prev) => ({
      ...prev,
      vacations: [
        { ...input, id: uid("vac"), status: "pendiente" },
        ...prev.vacations,
      ],
    }));
    pushToast("Solicitud de vacaciones enviada", "success");
  }, [pushToast]);

  const convertQuote: StoreValue["convertQuote"] = useCallback((id) => {
    const quote = state.invoices.find((i) => i.id === id);
    if (!quote) return { error: "Cotización no encontrada." };
    if (documentKind(quote) !== "cotizacion") return { error: "Solo se pueden convertir cotizaciones." };
    const invoice: Invoice = {
      ...quote,
      id: uid("inv"),
      number: "",
      kind: "factura",
      relatedId: quote.id,
      status: "enviada",
      portalToken: uid("pt"),
      sentAt: DEMO_TODAY,
      events: [
        event("created", `Convertida desde ${quote.number}`),
        event("sent", "Factura emitida"),
      ],
    };
    setState((prev) => {
      const number = nextDocumentNumber(
        prev.invoices.filter((i) => i.companyId === quote.companyId).map((i) => i.number),
        "factura",
      );
      invoice.number = number;
      return {
        ...prev,
        invoices: [
          invoice,
          ...prev.invoices.map((i) =>
            i.id === id
              ? {
                  ...i,
                  status: "pagada" as const,
                  events: [...(i.events ?? []), event("converted", `Factura ${number}`)],
                }
              : i,
          ),
        ],
      };
    });
    pushToast("Cotización convertida a factura", "success");
    return invoice;
  }, [pushToast, state.invoices]);

  const duplicateInvoice: StoreValue["duplicateInvoice"] = useCallback((id) => {
    const source = state.invoices.find((i) => i.id === id);
    if (!source) return { error: "Documento no encontrado." };
    const kind = documentKind(source);
    const copy: Invoice = {
      ...source,
      id: uid("inv"),
      number: "",
      status: "borrador",
      issueDate: DEMO_TODAY,
      portalToken: uid("pt"),
      relatedId: source.id,
      paidAt: undefined,
      sentAt: undefined,
      reminderCount: 0,
      events: [event("duplicated", `Copia de ${source.number}`)],
      items: source.items.map((it) => ({ ...it, id: uid("it") })),
    };
    setState((prev) => {
      const number = nextDocumentNumber(
        prev.invoices.filter((i) => i.companyId === source.companyId).map((i) => i.number),
        kind,
      );
      copy.number = number;
      return { ...prev, invoices: [copy, ...prev.invoices] };
    });
    pushToast("Documento duplicado", "success");
    return copy;
  }, [pushToast, state.invoices]);

  const issueCreditNote: StoreValue["issueCreditNote"] = useCallback((id) => {
    const source = state.invoices.find((i) => i.id === id);
    if (!source) return { error: "Factura no encontrada." };
    const note: Invoice = {
      ...source,
      id: uid("inv"),
      number: "",
      kind: "nota_credito",
      relatedId: source.id,
      status: "enviada",
      issueDate: DEMO_TODAY,
      dueDate: DEMO_TODAY,
      portalToken: uid("pt"),
      sentAt: DEMO_TODAY,
      events: [event("created", `NC de ${source.number}`), event("sent", "Nota de crédito emitida")],
      items: source.items.map((it) => ({ ...it, id: uid("it") })),
    };
    setState((prev) => {
      const number = nextDocumentNumber(
        prev.invoices.filter((i) => i.companyId === source.companyId).map((i) => i.number),
        "nota_credito",
      );
      note.number = number;
      return {
        ...prev,
        invoices: [
          note,
          ...prev.invoices.map((i) =>
            i.id === id
              ? { ...i, events: [...(i.events ?? []), event("credited", number)] }
              : i,
          ),
        ],
      };
    });
    pushToast("Nota de crédito emitida", "success");
    return note;
  }, [pushToast, state.invoices]);

  const sendReminder = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      invoices: prev.invoices.map((i) =>
        i.id === id
          ? {
              ...i,
              reminderCount: (i.reminderCount ?? 0) + 1,
              reminderSentAt: DEMO_TODAY,
              events: [...(i.events ?? []), event("reminder", "Recordatorio de cobro enviado")],
            }
          : i,
      ),
    }));
    pushToast("Recordatorio enviado", "success");
  }, [pushToast]);

  const markInvoicePaid = useCallback((id: string) => {
    setInvoiceStatus(id, "pagada");
    pushToast("Marcada como pagada", "success");
  }, [pushToast, setInvoiceStatus]);

  const toggleRecurring = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      invoices: prev.invoices.map((i) => {
        if (i.id !== id) return i;
        const active = !i.recurring?.active;
        return {
          ...i,
          recurring: {
            interval: "monthly",
            nextDate: i.recurring?.nextDate ?? DEMO_TODAY,
            active,
          },
        };
      }),
    }));
    pushToast("Facturación recurrente actualizada", "success");
  }, [pushToast]);

  const matchBankTx = useCallback((txId: string, invoiceId: string | null) => {
    setState((prev) => ({
      ...prev,
      bankTxs: prev.bankTxs.map((tx) =>
        tx.id === txId ? { ...tx, matchedInvoiceId: invoiceId } : tx,
      ),
      invoices: invoiceId
        ? prev.invoices.map((i) =>
            i.id === invoiceId
              ? {
                  ...i,
                  status: "pagada" as const,
                  paidAt: DEMO_TODAY,
                  events: [...(i.events ?? []), event("reconciled", "Conciliado con cartola")],
                }
              : i,
          )
        : prev.invoices,
    }));
    pushToast(invoiceId ? "Movimiento conciliado" : "Conciliación deshecha", "success");
  }, [pushToast]);

  const markPayablePaid = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      payables: prev.payables.map((p) => (p.id === id ? { ...p, status: "pagada" } : p)),
    }));
    pushToast("Pago registrado", "success");
  }, [pushToast]);

  const company = selectActiveCompany(state.companies, state.activeCompanyId);

  const value = useMemo<StoreValue>(
    () => ({
      ready,
      configured: auth.configured,
      state,
      session: auth.session ?? state.session,
      company,
      toasts,
      dismissToast,
      login,
      loginWithGoogle,
      register,
      logout,
      resetPassword,
      updatePassword,
      setActiveCompany,
      updateCompany,
      persistCompany,
      updateProfile,
      changePassword,
      updateUserRole,
      inviteUser,
      setNotificationPrefs,
      toggleIntegration,
      markNotificationsRead,
      saveInvoice,
      deleteInvoice,
      setInvoiceStatus,
      saveClient,
      deleteClient,
      saveEmployee,
      generateLiquidacion,
      generatePeriod,
      setAttendance,
      setVacationStatus,
      requestVacation,
      convertQuote,
      duplicateInvoice,
      issueCreditNote,
      sendReminder,
      markInvoicePaid,
      toggleRecurring,
      matchBankTx,
      markPayablePaid,
    }),
    [
      ready,
      auth.configured,
      auth.session,
      state,
      company,
      toasts,
      dismissToast,
      login,
      loginWithGoogle,
      register,
      logout,
      resetPassword,
      updatePassword,
      setActiveCompany,
      updateCompany,
      persistCompany,
      updateProfile,
      changePassword,
      updateUserRole,
      inviteUser,
      setNotificationPrefs,
      toggleIntegration,
      markNotificationsRead,
      saveInvoice,
      deleteInvoice,
      setInvoiceStatus,
      saveClient,
      deleteClient,
      saveEmployee,
      generateLiquidacion,
      generatePeriod,
      setAttendance,
      setVacationStatus,
      requestVacation,
      convertQuote,
      duplicateInvoice,
      issueCreditNote,
      sendReminder,
      markInvoicePaid,
      toggleRecurring,
      matchBankTx,
      markPayablePaid,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function useCompanyData() {
  const { state, company } = useStore();
  const companyId = company?.id ?? "";
  return {
    company,
    clients: filterByCompany(state.clients, companyId),
    invoices: filterByCompany(state.invoices, companyId),
    employees: filterByCompany(state.employees, companyId),
    liquidaciones: filterByCompany(state.liquidaciones, companyId),
    attendance: filterByCompany(state.attendance, companyId),
    vacations: filterByCompany(state.vacations, companyId),
    activity: filterByCompany(state.activity, companyId),
    bankTxs: filterByCompany(state.bankTxs, companyId),
    payables: filterByCompany(state.payables, companyId),
    contracts: filterByCompany(state.contracts, companyId),
  };
}

export function newInvoiceItem(): InvoiceItem {
  return { id: uid("it"), description: "", quantity: 1, unitPrice: 0 };
}
