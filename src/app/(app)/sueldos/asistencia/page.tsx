"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/skeleton";
import { useBoot } from "@/hooks/useBoot";
import { useCompanyData, useStore } from "@/lib/store";
import { attendanceLabel } from "@/lib/status";
import type { AttendanceStatus } from "@/lib/types";

const STATUSES: AttendanceStatus[] = [
  "presente",
  "ausente",
  "atraso",
  "permiso",
  "vacaciones",
];

export default function AsistenciaPage() {
  const loading = useBoot();
  const { employees, attendance } = useCompanyData();
  const { setAttendance, company } = useStore();

  const dates = [...new Set(attendance.map((a) => a.date))].sort().slice(-10);

  if (loading) return <PageSkeleton />;

  return (
    <div>
      <PageHeader
        kicker="RRHH"
        title="Asistencia"
        description="Últimos días hábiles. Cambia el estado y se persiste en el store de la empresa activa."
      />
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-elevated text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-3 py-3 font-medium">Persona</th>
              {dates.map((date) => (
                <th key={date} className="px-2 py-3 font-medium">
                  {date.slice(8)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id} className="border-t border-line">
                <td className="px-3 py-2 text-ink">
                  {employee.firstName} {employee.lastName}
                </td>
                {dates.map((date) => {
                  const row = attendance.find(
                    (a) => a.employeeId === employee.id && a.date === date,
                  );
                  const status = row?.status ?? "presente";
                  return (
                    <td key={date} className="px-2 py-2">
                      <Select
                        value={status}
                        className="h-8 px-2 text-[11px]"
                        onChange={(e) =>
                          setAttendance({
                            id: row?.id,
                            employeeId: employee.id,
                            companyId: company?.id ?? employee.companyId,
                            date,
                            status: e.target.value as AttendanceStatus,
                            hours: e.target.value === "presente" ? 9 : e.target.value === "atraso" ? 8 : 0,
                          })
                        }
                      >
                        {STATUSES.map((item) => (
                          <option key={item} value={item}>
                            {attendanceLabel(item)}
                          </option>
                        ))}
                      </Select>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <div className="mt-4 flex flex-wrap gap-2">
        {STATUSES.map((item) => (
          <Badge key={item}>{attendanceLabel(item)}</Badge>
        ))}
      </div>
    </div>
  );
}
