import { computeInvoiceTotals, isReceivableDocument, isRevenueDocument } from "./invoice";
import { DEMO_TODAY } from "./format";
import { computeLiquidacion, defaultExtrasForSalary } from "./payroll";
import type {
  BankTx,
  Client,
  Employee,
  Invoice,
  LiquidacionRecord,
  Payable,
  Vacation,
} from "./types";

export type AgingBucket = "current" | "d30" | "d60" | "d90" | "d90p";

export const AGING_LABEL: Record<AgingBucket, string> = {
  current: "Al día",
  d30: "1–30",
  d60: "31–60",
  d90: "61–90",
  d90p: "+90",
};

export function daysBetween(from: string, to: string): number {
  const ms = Date.parse(to) - Date.parse(from);
  return Math.round(ms / 86_400_000);
}

export function agingBucket(dueDate: string, today: string = DEMO_TODAY): AgingBucket {
  const days = daysBetween(dueDate, today);
  if (days <= 0) return "current";
  if (days <= 30) return "d30";
  if (days <= 60) return "d60";
  if (days <= 90) return "d90";
  return "d90p";
}

export function invoiceTotal(invoice: Invoice): number {
  return computeInvoiceTotals(invoice.items, invoice.taxRate).total;
}

export function agingSummary(
  invoices: Invoice[],
  today: string = DEMO_TODAY,
): Record<AgingBucket, { count: number; amount: number }> {
  const empty = (): { count: number; amount: number } => ({ count: 0, amount: 0 });
  const result: Record<AgingBucket, { count: number; amount: number }> = {
    current: empty(),
    d30: empty(),
    d60: empty(),
    d90: empty(),
    d90p: empty(),
  };
  for (const invoice of invoices.filter(isReceivableDocument)) {
    const bucket = agingBucket(invoice.dueDate, today);
    result[bucket].count += 1;
    result[bucket].amount += invoiceTotal(invoice);
  }
  return result;
}

export function receivables(invoices: Invoice[]): number {
  return invoices.filter(isReceivableDocument).reduce((sum, inv) => sum + invoiceTotal(inv), 0);
}

export function collectedRevenue(invoices: Invoice[]): number {
  return invoices.filter(isRevenueDocument).reduce((sum, inv) => sum + invoiceTotal(inv), 0);
}

export function payablesOpen(payables: Payable[]): number {
  return payables
    .filter((item) => item.status === "pendiente")
    .reduce((sum, item) => sum + item.amount, 0);
}

export function cashBalance(txs: BankTx[]): number {
  return txs.reduce((sum, tx) => sum + tx.amount, 0);
}

export type InboxTask = {
  id: string;
  href: string;
  title: string;
  detail: string;
  amount?: number;
  urgency: "critical" | "warn" | "info";
  kind: "cobranza" | "nomina" | "hr" | "caja" | "venta";
};

export function inboxTasks(input: {
  invoices: Invoice[];
  clients: Client[];
  employees: Employee[];
  liquidaciones: LiquidacionRecord[];
  vacations: Vacation[];
  bankTxs: BankTx[];
  payables: Payable[];
  period: string;
  today?: string;
}): InboxTask[] {
  const today = input.today ?? DEMO_TODAY;
  const tasks: InboxTask[] = [];
  const clientName = (id: string) => input.clients.find((c) => c.id === id)?.name ?? "Cliente";

  for (const invoice of input.invoices.filter(isReceivableDocument)) {
    const days = daysBetween(invoice.dueDate, today);
    const amount = invoiceTotal(invoice);
    if (days > 0) {
      tasks.push({
        id: `overdue-${invoice.id}`,
        href: `/facturacion/${invoice.id}`,
        title: `${invoice.number} vencida`,
        detail: `${clientName(invoice.clientId)} · ${days} días`,
        amount,
        urgency: days > 60 ? "critical" : "warn",
        kind: "cobranza",
      });
    } else if (days >= -7) {
      tasks.push({
        id: `due-${invoice.id}`,
        href: `/facturacion/${invoice.id}`,
        title: `${invoice.number} vence pronto`,
        detail: `${clientName(invoice.clientId)} · ${invoice.dueDate}`,
        amount,
        urgency: "info",
        kind: "cobranza",
      });
    }
  }

  const quotes = input.invoices.filter(
    (inv) => (inv.kind ?? "factura") === "cotizacion" && inv.status === "enviada",
  );
  for (const quote of quotes) {
    tasks.push({
      id: `quote-${quote.id}`,
      href: `/facturacion/${quote.id}`,
      title: `Cotización ${quote.number} abierta`,
      detail: clientName(quote.clientId),
      amount: invoiceTotal(quote),
      urgency: "info",
      kind: "venta",
    });
  }

  const active = input.employees.filter((e) => e.estado !== "inactivo");
  const missing = active.filter(
    (employee) =>
      !input.liquidaciones.some(
        (liq) => liq.employeeId === employee.id && liq.period === input.period,
      ),
  );
  if (missing.length) {
    tasks.push({
      id: "payroll-close",
      href: "/sueldos/cerrar",
      title: `Cerrar nómina ${input.period}`,
      detail: `${missing.length} liquidaciones pendientes`,
      urgency: "warn",
      kind: "nomina",
    });
  }

  const pendingVac = input.vacations.filter((v) => v.status === "pendiente");
  for (const vac of pendingVac) {
    const employee = input.employees.find((e) => e.id === vac.employeeId);
    tasks.push({
      id: `vac-${vac.id}`,
      href: "/sueldos/calendario",
      title: "Vacaciones por aprobar",
      detail: `${employee ? `${employee.firstName} ${employee.lastName}` : "Colaborador"} · ${vac.days} días`,
      urgency: "info",
      kind: "hr",
    });
  }

  const unmatched = input.bankTxs.filter(
    (tx) =>
      tx.amount > 0 &&
      !tx.matchedInvoiceId &&
      !/saldo inicial/i.test(tx.description),
  );
  if (unmatched.length) {
    const amount = unmatched.reduce((sum, tx) => sum + tx.amount, 0);
    tasks.push({
      id: "recon",
      href: "/caja",
      title: "Movimientos sin conciliar",
      detail: `${unmatched.length} abonos`,
      amount,
      urgency: "info",
      kind: "caja",
    });
  }

  const duePayables = input.payables.filter(
    (p) => p.status === "pendiente" && p.dueDate <= addDays(today, 7),
  );
  for (const payable of duePayables) {
    tasks.push({
      id: `pay-${payable.id}`,
      href: "/caja",
      title: `Pagar ${payable.vendor}`,
      detail: payable.concept,
      amount: payable.amount,
      urgency: payable.dueDate < today ? "critical" : "warn",
      kind: "caja",
    });
  }

  const rank = { critical: 0, warn: 1, info: 2 };
  return tasks.sort((a, b) => rank[a.urgency] - rank[b.urgency] || (b.amount ?? 0) - (a.amount ?? 0));
}

export function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export type CashPoint = { date: string; label: string; inflow: number; outflow: number; balance: number };

export function cashForecast(input: {
  invoices: Invoice[];
  payables: Payable[];
  employees: Employee[];
  bankTxs: BankTx[];
  today?: string;
  days?: number;
}): CashPoint[] {
  const today = input.today ?? DEMO_TODAY;
  const horizon = input.days ?? 30;
  let balance = cashBalance(input.bankTxs);
  const payroll = input.employees
    .filter((e) => e.estado !== "inactivo")
    .reduce((sum, e) => {
      const extras = defaultExtrasForSalary(e.sueldoBase);
      return sum + computeLiquidacion({ sueldoBase: e.sueldoBase, ...extras }).liquido;
    }, 0);
  const payrollDay = `${today.slice(0, 8)}30`;

  const points: CashPoint[] = [];
  for (let i = 0; i <= horizon; i += 1) {
    const date = addDays(today, i);
    let inflow = 0;
    let outflow = 0;
    for (const invoice of input.invoices.filter(isReceivableDocument)) {
      if (invoice.dueDate === date) inflow += invoiceTotal(invoice);
    }
    for (const payable of input.payables.filter((p) => p.status === "pendiente")) {
      if (payable.dueDate === date) outflow += payable.amount;
    }
    if (date === payrollDay || (i === 0 && payrollDay < today)) {
      outflow += payroll;
    }
    balance += inflow - outflow;
    if (i % 5 === 0 || i === horizon) {
      points.push({
        date,
        label: `${date.slice(8)}/${date.slice(5, 7)}`,
        inflow,
        outflow,
        balance,
      });
    }
  }
  return points;
}

export function topDebtors(
  invoices: Invoice[],
  clients: Client[],
  limit = 5,
): Array<{ clientId: string; name: string; amount: number; count: number }> {
  const map = new Map<string, { amount: number; count: number }>();
  for (const invoice of invoices.filter(isReceivableDocument)) {
    const current = map.get(invoice.clientId) ?? { amount: 0, count: 0 };
    current.amount += invoiceTotal(invoice);
    current.count += 1;
    map.set(invoice.clientId, current);
  }
  return [...map.entries()]
    .map(([clientId, stats]) => ({
      clientId,
      name: clients.find((c) => c.id === clientId)?.name ?? "Cliente",
      ...stats,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

export function suggestMatch(tx: BankTx, invoices: Invoice[]): Invoice | undefined {
  if (tx.amount <= 0 || tx.matchedInvoiceId) return undefined;
  const open = invoices.filter(isReceivableDocument);
  const exact = open.find((inv) => invoiceTotal(inv) === tx.amount);
  if (exact) return exact;
  return open.find((inv) => Math.abs(invoiceTotal(inv) - tx.amount) <= 1_000);
}
