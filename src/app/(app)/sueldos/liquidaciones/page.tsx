"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
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
import { EmptyState, SuccessBanner } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/field";
import { Money } from "@/components/ui/Money";
import { MoneyTooltip } from "@/components/ui/ChartTooltip";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/skeleton";
import { useBoot } from "@/hooks/useBoot";
import { useCompanyData, useStore } from "@/lib/store";
import { formatPeriod } from "@/lib/format";
import { CHART } from "@/lib/status";

export default function LiquidacionesPage() {
  const loading = useBoot();
  const { employees, liquidaciones } = useCompanyData();
  const { generatePeriod, company } = useStore();
  const [period, setPeriod] = useState("2026-08");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const rows = useMemo(
    () =>
      liquidaciones
        .filter((item) => item.period === period)
        .map((item) => ({
          ...item,
          employee: employees.find((e) => e.id === item.employeeId),
        })),
    [employees, liquidaciones, period],
  );

  const costChart = employees.map((employee) => ({
    name: employee.firstName,
    costo: employee.sueldoBase,
  }));

  function generateAll() {
    if (!company) return;
    const result = generatePeriod(company.id, period);
    if (result.created) {
      setNote(`${result.created} liquidaciones generadas para ${formatPeriod(period)}.`);
      setError("");
    } else {
      setError(result.error || "No se generaron liquidaciones.");
      setNote("");
    }
  }

  if (loading) return <PageSkeleton />;

  return (
    <div>
      <PageHeader
        kicker="Nómina"
        title="Liquidaciones"
        description="Genera el periodo para todo el equipo y revisa haberes, descuentos y líquido."
        actions={
          <>
            <Select value={period} onChange={(e) => setPeriod(e.target.value)} className="w-40">
              <option value="2026-06">Junio 2026</option>
              <option value="2026-07">Julio 2026</option>
              <option value="2026-08">Agosto 2026</option>
            </Select>
            <Button onClick={generateAll}>Generar periodo</Button>
          </>
        }
      />

      {note ? <div className="mb-4"><SuccessBanner>{note}</SuccessBanner></div> : null}
      {error ? <p className="mb-4 text-sm text-red-400">{error}</p> : null}

      <Card className="mb-6 p-5">
        <h2 className="mb-3 text-sm font-medium text-ink">Costo de personal (sueldo base)</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={costChart}>
              <CartesianGrid stroke={CHART.grid} vertical={false} />
              <XAxis dataKey="name" stroke={CHART.axis} fontSize={12} />
              <YAxis stroke={CHART.axis} fontSize={11} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
              <Tooltip content={<MoneyTooltip />} />
              <Bar dataKey="costo" name="Sueldo" fill="var(--foreground)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {rows.length === 0 ? (
        <EmptyState
          state="thinking"
          title={`Sin liquidaciones en ${formatPeriod(period)}`}
          description="Genera el periodo o abre una ficha para crear una individual."
        />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-elevated text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Persona</th>
                <th className="px-4 py-3 font-medium">Haberes</th>
                <th className="px-4 py-3 font-medium">Descuentos</th>
                <th className="px-4 py-3 font-medium text-right">Líquido</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <Link href={`/sueldos/${row.employeeId}`} className="hover:text-foreground">
                      {row.employee
                        ? `${row.employee.firstName} ${row.employee.lastName}`
                        : row.employeeId}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Money value={row.totalHaberes} />
                  </td>
                  <td className="px-4 py-3">
                    <Money value={row.totalDescuentos} />
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-ink">
                    <Money value={row.liquido} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
