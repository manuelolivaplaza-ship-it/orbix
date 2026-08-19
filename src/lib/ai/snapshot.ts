import { filterByCompany, selectActiveCompany } from "@/lib/company";
import { todayISO } from "@/lib/format";
import type {
  AppState,
  Attendance,
  BankTx,
  Client,
  Company,
  Contract,
  Employee,
  Invoice,
  LiquidacionRecord,
  Notification,
  Payable,
  Vacation,
} from "@/lib/types";

export type CompactInvoice = Omit<Invoice, "events">;

export type WorkspaceSnapshot = {
  today: string;
  period: string;
  company: Company | null;
  clients: Client[];
  invoices: CompactInvoice[];
  employees: Employee[];
  liquidaciones: LiquidacionRecord[];
  attendance: Attendance[];
  vacations: Vacation[];
  notifications: Notification[];
  bankTxs: BankTx[];
  payables: Payable[];
  contracts: Contract[];
};

const LIMIT = 300;

export function compactWorkspace(
  state: AppState,
  today: string = todayISO(),
): WorkspaceSnapshot {
  const company = selectActiveCompany(state.companies, state.activeCompanyId);
  const companyId = company?.id ?? "";
  return {
    today,
    period: today.slice(0, 7),
    company: company ? { ...company } : null,
    clients: filterByCompany(state.clients, companyId).slice(0, LIMIT),
    invoices: filterByCompany(state.invoices, companyId)
      .slice(0, LIMIT)
      .map((inv) => {
        const copy = { ...inv };
        delete copy.events;
        return copy;
      }),
    employees: filterByCompany(state.employees, companyId).slice(0, LIMIT),
    liquidaciones: filterByCompany(state.liquidaciones, companyId).slice(0, LIMIT),
    attendance: filterByCompany(state.attendance, companyId).slice(0, 400),
    vacations: filterByCompany(state.vacations, companyId).slice(0, LIMIT),
    notifications: state.notifications.slice(0, 80),
    bankTxs: filterByCompany(state.bankTxs, companyId).slice(0, LIMIT),
    payables: filterByCompany(state.payables, companyId).slice(0, LIMIT),
    contracts: filterByCompany(state.contracts, companyId).slice(0, LIMIT),
  };
}

export function isWorkspaceSnapshot(value: unknown): value is WorkspaceSnapshot {
  if (!value || typeof value !== "object") return false;
  const snap = value as WorkspaceSnapshot;
  return (
    typeof snap.today === "string" &&
    Array.isArray(snap.clients) &&
    Array.isArray(snap.invoices) &&
    Array.isArray(snap.employees)
  );
}
