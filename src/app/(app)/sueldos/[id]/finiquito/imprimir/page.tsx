"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { DEMO_TODAY, formatCLP, formatDate } from "@/lib/format";
import { computeFiniquito } from "@/lib/payroll";
import { useStore } from "@/lib/store";

export default function FiniquitoPrintPage() {
  const params = useParams<{ id: string }>();
  const { state } = useStore();
  const employee = state.employees.find((e) => e.id === params.id);
  const company = state.companies.find((c) => c.id === employee?.companyId);

  if (!employee || !company) {
    return (
      <div className="p-10">
        <p>No se encontró el finiquito.</p>
        <Link href="/sueldos">Volver</Link>
      </div>
    );
  }

  const name = `${employee.firstName} ${employee.lastName}`;
  const finiquito = computeFiniquito({
    sueldoBase: employee.sueldoBase,
    fechaIngreso: employee.fechaIngreso,
    endDate: DEMO_TODAY,
    vacacionesPendientes: 10,
  });

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
        <p className="text-xs uppercase tracking-widest">Finiquito laboral</p>
        <h1 className="mt-2 text-2xl font-semibold">{name}</h1>
        <p className="mt-6">
          {company.name} y {name} dejan constancia del término de la relación laboral al {formatDate(DEMO_TODAY)},
          con {finiquito.years} años de servicio desde el {formatDate(employee.fechaIngreso)}.
        </p>
        <table className="mt-6 w-full">
          <tbody>
            <tr className="border-b">
              <td className="py-2">Indemnización por años de servicio</td>
              <td className="py-2 text-right font-mono">{formatCLP(finiquito.indemnizacion)}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2">Vacaciones proporcionales</td>
              <td className="py-2 text-right font-mono">{formatCLP(finiquito.vacaciones)}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2">Aviso previo</td>
              <td className="py-2 text-right font-mono">{formatCLP(finiquito.aviso)}</td>
            </tr>
            <tr>
              <td className="py-3 font-medium">Total</td>
              <td className="py-3 text-right font-mono text-lg">{formatCLP(finiquito.total)}</td>
            </tr>
          </tbody>
        </table>
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
