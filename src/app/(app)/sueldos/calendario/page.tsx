"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/skeleton";
import { useBoot } from "@/hooks/useBoot";
import { useCompanyData, useStore } from "@/lib/store";
import { formatDate } from "@/lib/format";

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export default function CalendarioPage() {
  const loading = useBoot();
  const { employees, vacations } = useCompanyData();
  const { setVacationStatus } = useStore();
  const year = 2026;
  const month = 7;
  const days = daysInMonth(year, month);
  const startWeekday = new Date(year, month, 1).getDay();
  const blanks = (startWeekday + 6) % 7;

  if (loading) return <PageSkeleton />;

  const payday = 28;

  return (
    <div>
      <PageHeader
        kicker="RRHH"
        title="Calendario de pagos y vacaciones"
        description="Agosto 2026. El día 28 es pago de sueldos. Las barras de vacaciones se aprueban acá."
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-5">
          <div className="mb-3 grid grid-cols-7 text-center text-[11px] uppercase tracking-wider text-muted">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: blanks }).map((_, i) => (
              <div key={`b-${i}`} className="h-20 rounded-xl bg-transparent" />
            ))}
            {Array.from({ length: days }).map((_, i) => {
              const day = i + 1;
              const iso = `2026-08-${String(day).padStart(2, "0")}`;
              const onVacation = vacations.filter(
                (v) => v.status === "aprobada" && v.start <= iso && v.end >= iso,
              );
              const isPay = day === payday;
              return (
                <div
                  key={iso}
                  className="flex h-20 flex-col rounded-xl border border-line bg-elevated p-2"
                >
                  <span className="text-xs text-secondary">{day}</span>
                  {isPay ? (
                    <span className="mt-auto text-[10px] text-foreground">Pago nómina</span>
                  ) : null}
                  {onVacation.length ? (
                    <span className="mt-auto truncate text-[10px] text-sky-300">
                      {onVacation.length} vac.
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </Card>

        <div className="space-y-3">
          {vacations.map((item) => {
            const employee = employees.find((e) => e.id === item.employeeId);
            return (
              <Card key={item.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-ink">
                      {employee
                        ? `${employee.firstName} ${employee.lastName}`
                        : item.employeeId}
                    </p>
                    <p className="text-xs text-muted">
                      {formatDate(item.start)} → {formatDate(item.end)} · {item.days} días
                    </p>
                  </div>
                  <Badge
                    tone={
                      item.status === "aprobada"
                        ? "success"
                        : item.status === "rechazada"
                          ? "danger"
                          : "warning"
                    }
                    className="capitalize"
                  >
                    {item.status}
                  </Badge>
                </div>
                {item.status === "pendiente" ? (
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" onClick={() => setVacationStatus(item.id, "aprobada")}>
                      Aprobar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setVacationStatus(item.id, "rechazada")}
                    >
                      Rechazar
                    </Button>
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
