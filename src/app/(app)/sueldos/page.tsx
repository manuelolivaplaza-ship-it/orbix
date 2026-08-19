"use client";

import Link from "next/link";
import { CalendarDays, ClipboardList, Wallet } from "lucide-react";
import { Avatar } from "@/components/ui/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Money } from "@/components/ui/Money";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/skeleton";
import { useBoot } from "@/hooks/useBoot";
import { useCompanyData } from "@/lib/store";
import { employeeTone } from "@/lib/status";

export default function SueldosPage() {
  const loading = useBoot();
  const { employees } = useCompanyData();

  if (loading) return <PageSkeleton />;

  return (
    <div>
      <PageHeader
        kicker="Sueldos / RRHH"
        title="Equipo"
        description="Fichas con foto, cargo, sueldo y estado. Entra a una persona para generar su liquidación."
        actions={
          <>
            <Link href="/sueldos/liquidaciones">
              <Button size="sm" variant="secondary">
                <Wallet size={14} /> Liquidaciones
              </Button>
            </Link>
            <Link href="/sueldos/calendario">
              <Button size="sm" variant="secondary">
                <CalendarDays size={14} /> Calendario
              </Button>
            </Link>
            <Link href="/sueldos/asistencia">
              <Button size="sm">
                <ClipboardList size={14} /> Asistencia
              </Button>
            </Link>
          </>
        }
      />

      {employees.length === 0 ? (
        <EmptyState
          title="Sin colaboradores en esta empresa"
          description="Cambia de empresa o agrega fichas desde la configuración del equipo."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {employees.map((employee) => {
            const name = `${employee.firstName} ${employee.lastName}`;
            return (
              <Link key={employee.id} href={`/sueldos/${employee.id}`}>
                <Card hover className="p-5">
                  <div className="flex items-start gap-3">
                    <Avatar name={name} color={employee.color} size={48} />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{name}</p>
                      <p className="text-sm text-secondary">{employee.cargo}</p>
                      <p className="text-xs text-muted">{employee.departamento}</p>
                    </div>
                    <Badge tone={employeeTone(employee.estado)} className="ml-auto capitalize">
                      {employee.estado}
                    </Badge>
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted">Sueldo base</p>
                      <Money value={employee.sueldoBase} className="text-lg text-ink" />
                    </div>
                    <p className="font-mono text-xs text-muted">{employee.rut}</p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
