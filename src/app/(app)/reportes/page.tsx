"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/field";
import { Money } from "@/components/ui/Money";
import { MoneyTooltip } from "@/components/ui/ChartTooltip";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useBoot } from "@/hooks/useBoot";
import { useCompanyData } from "@/lib/store";
import { computeInvoiceTotals } from "@/lib/invoice";
import {
  downloadExcel,
  downloadPdf,
  pdfLinesFromRows,
  rowsFromInvoices,
  type ReportRow,
} from "@/lib/export";
import { inRange } from "@/lib/analytics";
import { formatDate } from "@/lib/format";
import { CHART } from "@/lib/status";

export function buildInvoiceReportRows(
  invoices: Array<{
    number: string;
    clientName: string;
    status: string;
    issueDate: string;
    dueDate: string;
    items: Array<{ quantity: number; unitPrice: number }>;
    taxRate: number;
  }>,
  from: string,
  to: string,
) {
  return invoices
    .filter((invoice) => inRange(invoice.issueDate, from, to))
    .map((invoice) => {
      const totals = computeInvoiceTotals(invoice.items, invoice.taxRate);
      return {
        number: invoice.number,
        clientName: invoice.clientName,
        status: invoice.status,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        ...totals,
      };
    });
}

export default function ReportesPage() {
  const loading = useBoot();
  const { invoices, clients, employees, company } = useCompanyData();
  const [from, setFrom] = useState("2026-01-01");
  const [to, setTo] = useState("2026-08-31");

  const detailed = useMemo(() => {
    const withNames = invoices.map((invoice) => ({
      ...invoice,
      clientName: clients.find((c) => c.id === invoice.clientId)?.name ?? "Cliente",
    }));
    return buildInvoiceReportRows(withNames, from, to);
  }, [clients, from, invoices, to]);

  const excelRows: ReportRow[] = rowsFromInvoices(detailed);
  const total = detailed.reduce((sum, row) => sum + row.total, 0);
  const cobrado = detailed
    .filter((row) => row.status === "pagada")
    .reduce((sum, row) => sum + row.total, 0);

  const byMonth = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of detailed) {
      const key = row.issueDate.slice(0, 7);
      map.set(key, (map.get(key) ?? 0) + row.total);
    }
    return [...map.entries()].map(([month, value]) => ({ month, value }));
  }, [detailed]);

  const byStatus = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of detailed) {
      map.set(row.status, (map.get(row.status) ?? 0) + row.total);
    }
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [detailed]);

  function exportExcel() {
    downloadExcel(
      `orbix-reportes-${company?.id ?? "empresa"}.xlsx`,
      "Facturas",
      excelRows,
    );
  }

  function exportPdf() {
    downloadPdf(
      `orbix-reportes-${company?.id ?? "empresa"}.pdf`,
      `Reportes Orbix · ${company?.name ?? ""}`,
      pdfLinesFromRows(`Facturas ${from} a ${to} · Total ${total}`, excelRows),
    );
  }

  if (loading) return <PageSkeleton />;

  return (
    <div>
      <PageHeader
        kicker="Analytics"
        title="Reportes"
        description="Filtra por fecha, mira los gráficos y exporta el mismo dataset a Excel o PDF."
        actions={
          <>
            <Button variant="secondary" onClick={exportExcel}>
              Exportar Excel
            </Button>
            <Button onClick={exportPdf}>Exportar PDF</Button>
          </>
        }
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-xs text-muted">Desde</p>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <p className="mb-1 text-xs text-muted">Hasta</p>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="rounded-xl border border-line bg-surface px-4 py-2 text-sm text-secondary">
          {detailed.length} documentos · <Money value={total} /> emitidos ·{" "}
          <Money value={cobrado} /> cobrados
        </div>
      </div>

      {detailed.length === 0 ? (
        <EmptyState
          state="thinking"
          title="Sin documentos en el rango"
          description="Amplía las fechas para ver facturación y costos."
        />
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-2">
            <Card className="p-5">
              <h2 className="mb-3 text-sm font-medium text-ink">Facturación en el rango</h2>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={byMonth}>
                    <CartesianGrid stroke={CHART.grid} vertical={false} />
                    <XAxis dataKey="month" stroke={CHART.axis} fontSize={12} />
                    <YAxis stroke={CHART.axis} fontSize={11} tickFormatter={(v) => `${Math.round(v / 1e6)}M`} />
                    <Tooltip content={<MoneyTooltip />} />
                    <Area dataKey="value" name="Total" stroke={CHART.accent} fill={CHART.accent} fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card className="p-5">
              <h2 className="mb-3 text-sm font-medium text-ink">Por estado</h2>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byStatus}>
                    <CartesianGrid stroke={CHART.grid} vertical={false} />
                    <XAxis dataKey="name" stroke={CHART.axis} fontSize={12} />
                    <YAxis stroke={CHART.axis} fontSize={11} tickFormatter={(v) => `${Math.round(v / 1e6)}M`} />
                    <Tooltip content={<MoneyTooltip />} />
                    <Bar dataKey="value" name="Monto" fill={CHART.amber} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <Card className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-elevated text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Folio</th>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Emisión</th>
                  <th className="px-4 py-3 font-medium text-right">Neto</th>
                  <th className="px-4 py-3 font-medium text-right">IVA</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {detailed.map((row) => (
                  <tr key={row.number} className="border-t border-line">
                    <td className="px-4 py-3 font-mono">{row.number}</td>
                    <td className="px-4 py-3">{row.clientName}</td>
                    <td className="px-4 py-3 capitalize">{row.status}</td>
                    <td className="px-4 py-3 text-secondary">{formatDate(row.issueDate)}</td>
                    <td className="px-4 py-3 text-right">
                      <Money value={row.neto} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Money value={row.iva} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Money value={row.total} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <p className="mt-4 text-xs text-muted">
            Headcount activo: {employees.filter((e) => e.estado !== "inactivo").length}. El export
            usa las funciones de `src/lib/export.ts`.
          </p>
        </>
      )}
    </div>
  );
}
