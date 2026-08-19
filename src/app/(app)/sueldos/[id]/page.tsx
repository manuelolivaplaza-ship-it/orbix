"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Avatar } from "@/components/ui/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, SuccessBanner } from "@/components/ui/EmptyState";
import { Input, Label, Select } from "@/components/ui/field";
import { Money } from "@/components/ui/Money";
import { MoneyTooltip } from "@/components/ui/ChartTooltip";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/lib/store";
import { DEMO_TODAY, formatDate, formatPeriod } from "@/lib/format";
import { computeFiniquito, computeLiquidacion, defaultExtrasForSalary } from "@/lib/payroll";
import { attendanceLabel, CHART, employeeTone } from "@/lib/status";
import type { EmployeeStatus } from "@/lib/types";

export default function FichaEmpleadoPage() {
  const params = useParams<{ id: string }>();
  const { state, saveEmployee, generateLiquidacion, setVacationStatus } = useStore();
  const employee = state.employees.find((item) => item.id === params.id);
  const contract = state.contracts.find((c) => c.employeeId === params.id);
  const [period, setPeriod] = useState("2026-08");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const liquidaciones = useMemo(
    () => state.liquidaciones.filter((item) => item.employeeId === params.id),
    [params.id, state.liquidaciones],
  );
  const attendance = state.attendance.filter((a) => a.employeeId === params.id).slice(0, 14);
  const vacations = state.vacations.filter((v) => v.employeeId === params.id);

  if (!employee) {
    return (
      <EmptyState
        state="error"
        title="Persona no encontrada"
        description="Revisa el listado o cambia de empresa."
        action={
          <Link href="/sueldos">
            <Button variant="secondary">Volver al equipo</Button>
          </Link>
        }
      />
    );
  }

  const name = `${employee.firstName} ${employee.lastName}`;
  const preview = computeLiquidacion({
    sueldoBase: employee.sueldoBase,
    ...defaultExtrasForSalary(employee.sueldoBase),
  });
  const finiquito = computeFiniquito({
    sueldoBase: employee.sueldoBase,
    fechaIngreso: employee.fechaIngreso,
    endDate: DEMO_TODAY,
    vacacionesPendientes: 10,
  });

  function generate() {
    const result = generateLiquidacion(employee!.id, period);
    if ("error" in result) {
      setError(result.error);
      setMessage("");
      return;
    }
    setError("");
    setMessage(`Liquidación de ${formatPeriod(period)} lista.`);
  }

  return (
    <div>
      <PageHeader
        kicker="Ficha 360"
        title={name}
        description={`${employee.cargo} · ${employee.departamento}`}
        actions={
          <div className="flex gap-2">
            <Link href={`/sueldos/${employee.id}/contrato/imprimir`}>
              <Button variant="secondary" size="sm">
                Contrato
              </Button>
            </Link>
            <Link href={`/sueldos/${employee.id}/finiquito/imprimir`}>
              <Button variant="secondary" size="sm">
                Finiquito
              </Button>
            </Link>
          </div>
        }
      />

      <div className="mb-6 flex items-center gap-4">
        <Avatar name={name} color={employee.color} size={64} />
        <div>
          <p className="font-mono text-xs text-muted-foreground">{employee.rut}</p>
          <Badge tone={employeeTone(employee.estado)} className="mt-2 capitalize">
            {employee.estado}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="datos">
        <TabsList variant="line" className="mb-6">
          <TabsTrigger value="datos">Datos</TabsTrigger>
          <TabsTrigger value="contrato">Contrato</TabsTrigger>
          <TabsTrigger value="liquidaciones">Liquidaciones</TabsTrigger>
          <TabsTrigger value="asistencia">Asistencia</TabsTrigger>
          <TabsTrigger value="vacaciones">Vacaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="datos">
          <Card className="max-w-xl p-6">
            <form
              className="grid gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                saveEmployee(employee);
              }}
            >
              <div>
                <Label>Cargo</Label>
                <Input
                  value={employee.cargo}
                  onChange={(e) => saveEmployee({ ...employee, cargo: e.target.value })}
                />
              </div>
              <div>
                <Label>Sueldo base</Label>
                <Input
                  type="number"
                  value={employee.sueldoBase}
                  onChange={(e) =>
                    saveEmployee({ ...employee, sueldoBase: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label>Estado</Label>
                <Select
                  value={employee.estado}
                  onChange={(e) =>
                    saveEmployee({ ...employee, estado: e.target.value as EmployeeStatus })
                  }
                >
                  <option value="activo">Activo</option>
                  <option value="vacaciones">Vacaciones</option>
                  <option value="licencia">Licencia</option>
                  <option value="inactivo">Inactivo</option>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                AFP {employee.afp} · Salud {employee.salud} · {employee.banco} {employee.cuenta}
              </p>
              <p className="text-xs text-muted-foreground">
                Ingreso {formatDate(employee.fechaIngreso)} · {employee.email}
              </p>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="contrato">
          <Card className="p-6">
            <p className="text-sm">
              {contract?.type === "indefinido" ? "Indefinido" : contract?.type} · jornada{" "}
              {contract?.jornada ?? "40"} hrs
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Desde {contract ? formatDate(contract.start) : formatDate(employee.fechaIngreso)}
            </p>
            <div className="mt-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Sueldo pacto</p>
              <Money value={contract?.sueldoBase ?? employee.sueldoBase} className="text-2xl" />
            </div>
            <div className="mt-6 rounded-lg border border-border p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Finiquito estimado a hoy
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{finiquito.years} años de servicio</p>
              <ul className="mt-3 space-y-1 text-sm">
                <li className="flex justify-between">
                  <span>Indemnización</span>
                  <Money value={finiquito.indemnizacion} />
                </li>
                <li className="flex justify-between">
                  <span>Vacaciones</span>
                  <Money value={finiquito.vacaciones} />
                </li>
                <li className="flex justify-between">
                  <span>Aviso</span>
                  <Money value={finiquito.aviso} />
                </li>
                <li className="flex justify-between border-t border-border pt-2 font-medium">
                  <span>Total</span>
                  <Money value={finiquito.total} />
                </li>
              </ul>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="liquidaciones">
          <div className="grid gap-5 xl:grid-cols-2">
            <Card className="p-6">
              <h2 className="text-sm font-medium">Generar liquidación</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <Input
                  type="month"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="max-w-[180px]"
                />
                <Button onClick={generate}>Generar</Button>
              </div>
              {message ? (
                <div className="mt-4">
                  <SuccessBanner>{message}</SuccessBanner>
                </div>
              ) : null}
              {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
              <div className="mt-6 flex justify-between border-t border-border pt-4 text-sm">
                <span>Líquido preview</span>
                <Money value={preview.liquido} className="text-lg" />
              </div>
            </Card>
            <Card className="p-5">
              <h2 className="mb-3 text-sm font-medium">Histórico</h2>
              {liquidaciones.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aún no hay liquidaciones.</p>
              ) : (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={liquidaciones
                        .slice()
                        .reverse()
                        .map((item) => ({
                          name: item.period.slice(5),
                          liquido: item.liquido,
                        }))}
                    >
                      <CartesianGrid stroke={CHART.grid} vertical={false} />
                      <XAxis dataKey="name" stroke={CHART.axis} fontSize={12} />
                      <YAxis hide />
                      <Tooltip content={<MoneyTooltip />} />
                      <Bar dataKey="liquido" name="Líquido" fill="var(--foreground)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <ul className="mt-4 space-y-2 text-sm">
                {liquidaciones.map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span>{formatPeriod(item.period)}</span>
                    <Money value={item.liquido} />
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="asistencia">
          <Card className="p-5">
            <ul className="divide-y divide-border">
              {attendance.map((row) => (
                <li key={row.id} className="flex items-center justify-between py-2 text-sm">
                  <span>{formatDate(row.date)}</span>
                  <span className="text-muted-foreground">{attendanceLabel(row.status)}</span>
                  <span className="font-mono text-xs">{row.hours}h</span>
                </li>
              ))}
            </ul>
          </Card>
        </TabsContent>

        <TabsContent value="vacaciones">
          <Card className="p-5">
            {vacations.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin solicitudes.</p>
            ) : (
              <ul className="space-y-3">
                {vacations.map((vac) => (
                  <li key={vac.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm">
                        {formatDate(vac.start)} — {formatDate(vac.end)}
                      </p>
                      <p className="text-xs text-muted-foreground">{vac.days} días</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        tone={
                          vac.status === "aprobada" ? "success" : vac.status === "rechazada" ? "danger" : "warning"
                        }
                      >
                        {vac.status}
                      </Badge>
                      {vac.status === "pendiente" ? (
                        <>
                          <Button size="sm" onClick={() => setVacationStatus(vac.id, "aprobada")}>
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setVacationStatus(vac.id, "rechazada")}
                          >
                            Rechazar
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
