import { documentKind, type InvoiceStatus } from "@/lib/invoice";
import { uid } from "./ids";
import type {
  Activity,
  AppState,
  Attendance,
  Client,
  Employee,
  Invoice,
  LiquidacionRecord,
  Notification,
  Vacation,
} from "@/lib/types";

export type AgentMutation =
  | { type: "upsertClient"; client: Client }
  | { type: "upsertInvoice"; invoice: Invoice }
  | { type: "setInvoiceStatus"; id: string; status: InvoiceStatus }
  | { type: "sendReminder"; id: string; at: string }
  | { type: "upsertEmployee"; employee: Employee }
  | { type: "upsertLiquidacion"; record: LiquidacionRecord }
  | { type: "addNotification"; notification: Notification }
  | { type: "matchBankTx"; txId: string; invoiceId: string | null }
  | { type: "markPayablePaid"; id: string }
  | { type: "setAttendance"; row: Attendance }
  | { type: "upsertVacation"; vacation: Vacation }
  | { type: "addActivity"; activity: Activity };

export type ToolOk = {
  ok: true;
  summary: string;
  href?: string;
  mutation?: AgentMutation;
  mutations?: AgentMutation[];
};

export type ToolErr = { ok: false; summary: string };

export type ToolResult = ToolOk | ToolErr;

export function mutationsFromToolOutput(output: unknown): AgentMutation[] {
  if (!output || typeof output !== "object") return [];
  const value = output as { mutation?: AgentMutation; mutations?: AgentMutation[] };
  const list: AgentMutation[] = [];
  if (Array.isArray(value.mutations)) list.push(...value.mutations);
  if (value.mutation) list.push(value.mutation);
  return list;
}

export function applyMutations(state: AppState, mutations: AgentMutation[]): AppState {
  let next = state;
  for (const mutation of mutations) {
    next = applyOne(next, mutation);
  }
  return next;
}

function applyOne(state: AppState, mutation: AgentMutation): AppState {
  switch (mutation.type) {
    case "upsertClient": {
      const exists = state.clients.some((item) => item.id === mutation.client.id);
      return {
        ...state,
        clients: exists
          ? state.clients.map((item) => (item.id === mutation.client.id ? mutation.client : item))
          : [mutation.client, ...state.clients],
      };
    }
    case "upsertInvoice": {
      const exists = state.invoices.some((item) => item.id === mutation.invoice.id);
      const invoices = exists
        ? state.invoices.map((item) =>
            item.id === mutation.invoice.id ? { ...item, ...mutation.invoice } : item,
          )
        : [mutation.invoice, ...state.invoices];
      return { ...state, invoices };
    }
    case "setInvoiceStatus": {
      return {
        ...state,
        invoices: state.invoices.map((invoice) => {
          if (invoice.id !== mutation.id) return invoice;
          return {
            ...invoice,
            status: mutation.status,
            sentAt:
              mutation.status === "enviada" || mutation.status === "vencida"
                ? invoice.sentAt ?? todayish()
                : invoice.sentAt,
            paidAt: mutation.status === "pagada" ? todayish() : invoice.paidAt,
          };
        }),
      };
    }
    case "sendReminder": {
      return {
        ...state,
        invoices: state.invoices.map((invoice) =>
          invoice.id === mutation.id
            ? {
                ...invoice,
                reminderCount: (invoice.reminderCount ?? 0) + 1,
                reminderSentAt: mutation.at,
              }
            : invoice,
        ),
      };
    }
    case "upsertEmployee": {
      const exists = state.employees.some((item) => item.id === mutation.employee.id);
      return {
        ...state,
        employees: exists
          ? state.employees.map((item) =>
              item.id === mutation.employee.id ? mutation.employee : item,
            )
          : [mutation.employee, ...state.employees],
      };
    }
    case "upsertLiquidacion": {
      const exists = state.liquidaciones.some((item) => item.id === mutation.record.id);
      return {
        ...state,
        liquidaciones: exists
          ? state.liquidaciones.map((item) =>
              item.id === mutation.record.id ? mutation.record : item,
            )
          : [mutation.record, ...state.liquidaciones],
      };
    }
    case "addNotification": {
      return {
        ...state,
        notifications: [mutation.notification, ...state.notifications],
      };
    }
    case "matchBankTx": {
      return {
        ...state,
        bankTxs: state.bankTxs.map((tx) =>
          tx.id === mutation.txId ? { ...tx, matchedInvoiceId: mutation.invoiceId } : tx,
        ),
        invoices: mutation.invoiceId
          ? state.invoices.map((invoice) =>
              invoice.id === mutation.invoiceId
                ? { ...invoice, status: "pagada", paidAt: todayish() }
                : invoice,
            )
          : state.invoices,
      };
    }
    case "markPayablePaid": {
      return {
        ...state,
        payables: state.payables.map((item) =>
          item.id === mutation.id ? { ...item, status: "pagada" } : item,
        ),
      };
    }
    case "setAttendance": {
      const existing = state.attendance.find(
        (row) =>
          row.employeeId === mutation.row.employeeId && row.date === mutation.row.date,
      );
      const saved = { ...mutation.row, id: mutation.row.id || existing?.id || uid("att") };
      return {
        ...state,
        attendance: existing
          ? state.attendance.map((row) => (row.id === existing.id ? saved : row))
          : [saved, ...state.attendance],
      };
    }
    case "upsertVacation": {
      const exists = state.vacations.some((item) => item.id === mutation.vacation.id);
      return {
        ...state,
        vacations: exists
          ? state.vacations.map((item) =>
              item.id === mutation.vacation.id ? mutation.vacation : item,
            )
          : [mutation.vacation, ...state.vacations],
      };
    }
    case "addActivity": {
      return {
        ...state,
        activity: [mutation.activity, ...state.activity],
      };
    }
    default:
      return state;
  }
}

function todayish() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function documentHref(invoice: { id: string; kind?: Invoice["kind"] }) {
  const kind = documentKind(invoice);
  if (kind === "cotizacion" || kind === "factura" || kind === "boleta") {
    return `/facturacion/${invoice.id}`;
  }
  return `/facturacion/${invoice.id}`;
}
