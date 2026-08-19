"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Money } from "@/components/ui/Money";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/skeleton";
import { Select } from "@/components/ui/field";
import { SuccessBanner } from "@/components/ui/EmptyState";
import { useBoot } from "@/hooks/useBoot";
import { useCompanyData, useStore } from "@/lib/store";
import { computeLiquidacion, defaultExtrasForSalary, previredRows } from "@/lib/payroll";
import { downloadExcel, downloadPdf, pdfLinesFromRows } from "@/lib/export";
import { formatPeriod } from "@/lib/format";
import { Avatar } from "@/components/ui/user-avatar";

const PERIODS = ["2026-06", "2026-07", "2026-08"];

export default function CerrarMesPage() {
  const loading = useBoot();
  const { employees, liquidaciones, company } = useCompanyData();
  const { generatePeriod } = useStore();
  const [period, setPeriod] = useState("2026-08");
  const [step, setStep] = useState(0);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const team = employees.filter((e) => e.estado !== "inactivo");
  const rows = useMemo(
    () =>
      team.map((employee) => {
        const extras = defaultExtrasForSalary(employee.sueldoBase);
        const breakdown = computeLiquidacion({ sueldoBase: employee.sueldoBase, ...extras });
        const exists = liquidaciones.some((l) => l.employeeId === employee.id && l.period === period);
        return { employee, breakdown, exists };
      }),
    [liquidaciones, period, team],
  );
  const missing = rows.filter((r) => !r.exists);
  const totalLiquido = rows.reduce((sum, r) => sum + r.breakdown.liquido, 0);

  function close() {
    if (!company) return;
    const result = generatePeriod(company.id, period);
    if (result.created) {
      setNote(`${result.created} liquidaciones de ${formatPeriod(period)}.`);
      setError("");
      setStep(3);
    } else {
      setError(result.error || "No se generaron liquidaciones.");
    }
  }

  function exportPrevired() {
    const data = previredRows(team);
    downloadExcel(`previred-${period}.xlsx`, "Previred", data);
  }

  function exportLre() {
    const data = rows.map((row) => ({
      RUT: row.employee.rut,
      Nombre: `${row.employee.firstName} ${row.employee.lastName}`,
      Cargo: row.employee.cargo,
      Haberes: row.breakdown.totalHaberes,
      Descuentos: row.breakdown.totalDescuentos,
      Liquido: row.breakdown.liquido,
    }));
    downloadExcel(`lre-${period}.xlsx`, "LRE", data);
    downloadPdf(
      `lre-${period}.pdf`,
      `Libro de remuneraciones ${formatPeriod(period)}`,
      pdfLinesFromRows(`LRE ${period}`, data),
    );
  }

  if (loading) return <PageSkeleton />;

  return (
    <div>
      <PageHeader
        kicker="Nómina"
        title="Cerrar mes"
        description="Revisa el equipo, genera todas las liquidaciones y exporta Previred / LRE."
        actions={
          <Select value={period} onChange={(e) => setPeriod(e.target.value)} className="w-40">
            {PERIODS.map((p) => (
              <option key={p} value={p}>
                {formatPeriod(p)}
              </option>
            ))}
          </Select>
        }
      />

      <div className="mb-6 flex gap-2">
        {["Equipo", "Revisar", "Generar", "Exportar"].map((label, i) => (
          <button
            key={label}
            onClick={() => setStep(i)}
            className={`rounded-full px-3 py-1 text-xs ${
              step === i ? "bg-primary text-primary-foreground" : "bg-foreground/8 text-muted-foreground"
            }`}
          >
            {i + 1}. {label}
          </button>
        ))}
      </div>

      {note ? <div className="mb-4"><SuccessBanner>{note}</SuccessBanner></div> : null}
      {error ? <p className="mb-4 text-sm text-red-400">{error}</p> : null}

      {step === 0 || step === 1 ? (
        <div className="grid gap-3">
          {rows.map(({ employee, breakdown, exists }) => {
            const name = `${employee.firstName} ${employee.lastName}`;
            return (
              <Card key={employee.id} className="flex items-center justify-between gap-4 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={name} color={employee.color} size={40} />
                  <div className="min-w-0">
                    <Link href={`/sueldos/${employee.id}`} className="truncate text-sm font-medium">
                      {name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{employee.cargo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Money value={breakdown.liquido} className="text-sm" />
                  <Badge tone={exists ? "success" : "warning"}>
                    {exists ? "Lista" : "Pendiente"}
                  </Badge>
                </div>
              </Card>
            );
          })}
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setStep(2)}>Continuar</Button>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <Card className="p-6">
          <h2 className="text-lg font-medium">Generar {formatPeriod(period)}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {missing.length} liquidaciones nuevas · líquido estimado <Money value={totalLiquido} />
          </p>
          <div className="mt-6 flex gap-2">
            <Button onClick={close} disabled={!missing.length}>
              Cerrar {formatPeriod(period)}
            </Button>
            <Button variant="secondary" onClick={() => setStep(3)}>
              Saltar a exportar
            </Button>
          </div>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card className="p-6">
          <h2 className="text-lg font-medium">Archivos del mes</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Demo de Previred y Libro de Remuneraciones Electrónico.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button onClick={exportPrevired}>Exportar Previred</Button>
            <Button variant="secondary" onClick={exportLre}>
              Exportar LRE
            </Button>
            <Link href="/sueldos/liquidaciones">
              <Button variant="outline">Ver liquidaciones</Button>
            </Link>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
