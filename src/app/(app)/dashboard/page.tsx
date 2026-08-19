"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  FilePlus,
  Wallet,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Money } from "@/components/ui/Money";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/skeleton";
import { Metric } from "@/components/app/Metric";
import { Sparkline } from "@/components/app/Sparkline";
import { useBoot } from "@/hooks/useBoot";
import { useCompanyData } from "@/lib/store";
import { collectedRevenue } from "@/lib/finance";
import {
  AGING_LABEL,
  agingSummary,
  cashBalance,
  cashForecast,
  inboxTasks,
  payablesOpen,
  receivables,
  topDebtors,
  type InboxTask,
} from "@/lib/finance";
import { computeLiquidacion, defaultExtrasForSalary } from "@/lib/payroll";
import { DEMO_TODAY, formatPeriod } from "@/lib/format";

const URGENCY = {
  critical: "border-l-red-400",
  warn: "border-l-amber-400",
  info: "border-l-foreground/40",
};

export default function DashboardPage() {
  const loading = useBoot();
  const {
    company,
    invoices,
    employees,
    clients,
    liquidaciones,
    vacations,
    bankTxs,
    payables,
  } = useCompanyData();

  if (loading) return <PageSkeleton />;

  const ingresos = collectedRevenue(invoices);
  const cxc = receivables(invoices);
  const cxp = payablesOpen(payables);
  const caja = cashBalance(bankTxs);
  const paid = invoices.filter((inv) => inv.status === "pagada" && (inv.kind ?? "factura") !== "cotizacion");
  const nomina = employees
    .filter((e) => e.estado !== "inactivo")
    .reduce((sum, e) => {
      const extras = defaultExtrasForSalary(e.sueldoBase);
      return sum + computeLiquidacion({ sueldoBase: e.sueldoBase, ...extras }).liquido;
    }, 0);
  const tasks = inboxTasks({
    invoices,
    clients,
    employees,
    liquidaciones,
    vacations,
    bankTxs,
    payables,
    period: "2026-08",
    today: DEMO_TODAY,
  });
  const aging = agingSummary(invoices, DEMO_TODAY);
  const agingTotal = Object.values(aging).reduce((sum, b) => sum + b.amount, 0) || 1;
  const debtors = topDebtors(invoices, clients, 4);
  const forecast = cashForecast({ invoices, payables, employees, bankTxs, today: DEMO_TODAY });

  return (
    <div>
      <PageHeader
        kicker="Hoy"
        title={company?.name ?? "Orbix"}
        description="Lo que hay que hacer hoy: cobrar, pagar y cerrar el mes."
        actions={
          <>
            <Link href="/facturacion/nueva">
              <Button size="sm">
                <FilePlus size={14} /> Nueva factura
              </Button>
            </Link>
            <Link href="/sueldos/cerrar">
              <Button size="sm" variant="secondary">
                <Wallet size={14} /> Cerrar agosto
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Caja neta" value={caja} hint={`${bankTxs.length} movimientos`} />
        <Metric
          label="Ingresos cobrados"
          value={ingresos}
          hint={`${paid.length} facturas pagadas`}
        />
        <Metric label="Por cobrar" value={cxc} hint="Facturas enviadas o vencidas" />
        <Metric label="Nómina estimada" value={nomina} hint="Líquido del periodo" />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-foreground">Inbox de trabajo</h2>
              <p className="text-xs text-muted-foreground">{tasks.length} pendientes</p>
            </div>
            <Badge variant="secondary">{formatPeriod("2026-08")}</Badge>
          </div>
          {tasks.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Nada pendiente. Estás al día.</p>
          ) : (
            <ul className="space-y-2">
              {tasks.slice(0, 8).map((task) => (
                <InboxRow key={task.id} task={task} />
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium text-foreground">Aging de cobranza</h2>
              <Link href="/facturacion/cobranza" className="text-xs text-muted-foreground hover:text-foreground">
                Ver cobranza
              </Link>
            </div>
            <div className="flex h-3 overflow-hidden rounded-full bg-foreground/8">
              {(["current", "d30", "d60", "d90", "d90p"] as const).map((key, i) => (
                <div
                  key={key}
                  className="h-full"
                  style={{
                    width: `${(aging[key].amount / agingTotal) * 100}%`,
                    background: [
                      "var(--foreground)",
                      "var(--orbix-secondary)",
                      "var(--orbix-muted)",
                      "var(--orbix-faint)",
                      "#ef4444",
                    ][i],
                  }}
                />
              ))}
            </div>
            <ul className="mt-4 grid grid-cols-5 gap-2 text-center">
              {(["current", "d30", "d60", "d90", "d90p"] as const).map((key) => (
                <li key={key}>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {AGING_LABEL[key]}
                  </p>
                  <p className="mt-1 font-mono text-xs text-foreground">
                    {aging[key].count}
                  </p>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-medium text-foreground">Top deudores</h2>
            <ul className="space-y-3">
              {debtors.map((debtor) => (
                <li key={debtor.clientId} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">{debtor.name}</p>
                    <p className="text-[11px] text-muted-foreground">{debtor.count} docs</p>
                  </div>
                  <Money value={debtor.amount} className="text-sm" />
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">Flujo de caja 30 días</h2>
            <Link href="/caja" className="text-xs text-muted-foreground hover:text-foreground">
              Abrir caja
            </Link>
          </div>
          <Sparkline points={forecast} />
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-sm font-medium text-foreground">Acciones</h2>
          <div className="space-y-2">
            <Quick href="/facturacion/nueva?kind=cotizacion" label="Nueva cotización" />
            <Quick href="/facturacion/cobranza" label="Enviar recordatorios" />
            <Quick href="/sueldos/cerrar" label="Cerrar nómina de agosto" />
            <Quick href="/caja" label="Conciliar cartola" />
            <Quick href="/empresas" label="Vista consolidada" />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Por pagar {cxp > 0 ? "" : ""}</p>
          <Money value={cxp} className="text-lg text-foreground" />
          <p className="text-[11px] text-muted-foreground">Cuentas por pagar próximas</p>
        </Card>
      </div>
    </div>
  );
}

function InboxRow({ task }: { task: InboxTask }) {
  const Icon =
    task.urgency === "critical" ? AlertTriangle : task.urgency === "warn" ? Clock : CheckCircle2;
  return (
    <Link
      href={task.href}
      className={`flex items-center justify-between gap-3 rounded-lg border border-line border-l-2 bg-foreground/[0.03] px-3 py-2.5 transition-colors hover:bg-foreground/[0.06] ${URGENCY[task.urgency]}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <Icon size={14} className="shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <p className="truncate text-sm text-foreground">{task.title}</p>
          <p className="truncate text-[11px] text-muted-foreground">{task.detail}</p>
        </div>
      </div>
      {task.amount != null ? <Money value={task.amount} className="text-xs" /> : null}
    </Link>
  );
}

function Quick({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-foreground/5"
    >
      {label}
      <ArrowUpRight size={14} className="text-muted-foreground" />
    </Link>
  );
}
