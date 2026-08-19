"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/field";
import { Money } from "@/components/ui/Money";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/skeleton";
import { useBoot } from "@/hooks/useBoot";
import { useCompanyData, useStore } from "@/lib/store";
import { formatDate, formatPeriod } from "@/lib/format";
import { employeeTone } from "@/lib/status";

export default function PortalColaboradorPage() {
  const loading = useBoot();
  const { session, requestVacation } = useStore();
  const { employees, liquidaciones, vacations, company } = useCompanyData();
  const [start, setStart] = useState("2026-09-21");
  const [end, setEnd] = useState("2026-09-25");

  const employee = useMemo(() => {
    const byEmail = employees.find((e) => e.email === session?.email);
    return byEmail ?? employees[0];
  }, [employees, session?.email]);

  if (loading) return <PageSkeleton />;
  if (!employee) {
    return (
      <div>
        <PageHeader title="Portal del colaborador" description="No hay ficha en esta empresa." />
      </div>
    );
  }

  const name = `${employee.firstName} ${employee.lastName}`;
  const mine = liquidaciones.filter((l) => l.employeeId === employee.id);
  const myVac = vacations.filter((v) => v.employeeId === employee.id);
  const days = Math.max(1, Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000) + 1);

  return (
    <div>
      <PageHeader
        kicker="Portal"
        title="Mi espacio"
        description={`Hola ${employee.firstName}. Liquidaciones, vacaciones y documentos de ${company?.name}.`}
      />

      <div className="mb-6 flex items-center gap-4">
        <Avatar name={name} color={employee.color} size={56} />
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-muted-foreground">{employee.cargo}</p>
          <Badge tone={employeeTone(employee.estado)} className="mt-1 capitalize">
            {employee.estado}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-sm font-medium">Mis liquidaciones</h2>
          <ul className="mt-4 space-y-3">
            {mine.map((item) => (
              <li key={item.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                <span className="text-sm">{formatPeriod(item.period)}</span>
                <Money value={item.liquido} />
              </li>
            ))}
            {mine.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aún no hay liquidaciones.</p>
            ) : null}
          </ul>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-medium">Pedir vacaciones</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Desde</Label>
              <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div>
              <Label>Hasta</Label>
              <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>
          <Button
            className="mt-4"
            onClick={() =>
              requestVacation({
                employeeId: employee.id,
                companyId: employee.companyId,
                start,
                end,
                days,
              })
            }
          >
            Enviar solicitud · {days} días
          </Button>
          <ul className="mt-6 space-y-2 text-sm">
            {myVac.map((vac) => (
              <li key={vac.id} className="flex justify-between">
                <span>
                  {formatDate(vac.start)} — {formatDate(vac.end)}
                </span>
                <span className="text-muted-foreground">{vac.status}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-4 flex gap-2">
        <Link href={`/sueldos/${employee.id}/contrato/imprimir`}>
          <Button variant="secondary">Ver contrato</Button>
        </Link>
        <Link href={`/sueldos/${employee.id}`}>
          <Button variant="outline">Abrir ficha RRHH</Button>
        </Link>
      </div>
    </div>
  );
}
