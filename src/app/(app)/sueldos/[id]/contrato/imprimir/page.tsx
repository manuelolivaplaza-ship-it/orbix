"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { formatCLP, formatDate } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function ContratoPrintPage() {
  const params = useParams<{ id: string }>();
  const { state } = useStore();
  const employee = state.employees.find((e) => e.id === params.id);
  const company = state.companies.find((c) => c.id === employee?.companyId);
  const contract = state.contracts.find((c) => c.employeeId === params.id);

  if (!employee || !company) {
    return (
      <div className="p-10">
        <p>No se encontró el contrato.</p>
        <Link href="/sueldos">Volver</Link>
      </div>
    );
  }

  const name = `${employee.firstName} ${employee.lastName}`;

  return (
    <div className="min-h-screen bg-white p-8 text-zinc-900">
      <div className="no-print mb-6 flex gap-2">
        <button onClick={() => window.print()} className="rounded-lg bg-black px-4 py-2 text-sm text-white">
          Imprimir / PDF
        </button>
        <Link href={`/sueldos/${employee.id}`} className="rounded-lg border px-4 py-2 text-sm">
          Volver a la ficha
        </Link>
      </div>
      <article className="mx-auto max-w-3xl border border-zinc-200 p-10 text-sm leading-7">
        <p className="text-xs uppercase tracking-widest">Contrato de trabajo</p>
        <h1 className="mt-2 text-2xl font-semibold">{name}</h1>
        <p className="mt-6">
          Entre <strong>{company.name}</strong>, RUT {company.rut}, y <strong>{name}</strong>, RUT{" "}
          {employee.rut}, se celebra un contrato de trabajo {contract?.type ?? "indefinido"} a partir del{" "}
          {formatDate(contract?.start ?? employee.fechaIngreso)}, para desempeñar el cargo de {employee.cargo} en
          el área de {employee.departamento}, con una jornada de {contract?.jornada ?? "40"} horas semanales y una
          remuneración bruta mensual de {formatCLP(contract?.sueldoBase ?? employee.sueldoBase)}.
        </p>
        <p>
          El trabajador se obliga a cumplir el reglamento interno y la normativa laboral chilena vigente. El
          empleador pagará las cotizaciones previsionales correspondientes ({employee.afp} / {employee.salud}).
        </p>
        <div className="mt-16 grid grid-cols-2 gap-10 text-center">
          <div>
            <div className="mb-8 border-t border-zinc-400" />
            Empleador
          </div>
          <div>
            <div className="mb-8 border-t border-zinc-400" />
            Trabajador
          </div>
        </div>
      </article>
    </div>
  );
}
