"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { computeInvoiceTotals } from "@/lib/invoice";
import { formatCLP, formatDate } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function ImprimirFacturaPage() {
  const params = useParams<{ id: string }>();
  const { state } = useStore();
  const invoice = state.invoices.find((item) => item.id === params.id);
  const company = state.companies.find((c) => c.id === invoice?.companyId);
  const client = state.clients.find((c) => c.id === invoice?.clientId);

  if (!invoice || !company || !client) {
    return (
      <div className="p-10">
        <p>No se pudo armar la factura.</p>
        <Link href="/facturacion">Volver</Link>
      </div>
    );
  }

  const totals = computeInvoiceTotals(invoice.items, invoice.taxRate);

  return (
    <div className="min-h-screen bg-white p-8 text-zinc-900 print:p-0">
      <div className="no-print mb-6 flex gap-2">
        <button
          onClick={() => window.print()}
          className="rounded-lg bg-black px-4 py-2 text-sm text-white"
        >
          Imprimir / PDF
        </button>
        <Link href={`/facturacion/${invoice.id}`} className="rounded-lg border px-4 py-2 text-sm">
          Volver al editor
        </Link>
      </div>
      <article className="mx-auto max-w-3xl border border-zinc-200 p-10">
        <header className="flex items-start justify-between border-b border-zinc-200 pb-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-black">Factura</p>
            <h1 className="mt-1 text-3xl font-semibold">{invoice.number}</h1>
            <p className="mt-2 text-sm">{company.name}</p>
            <p className="text-sm text-muted">{company.rut} · {company.giro}</p>
            <p className="text-sm text-muted">
              {company.address}, {company.city}
            </p>
          </div>
          <div className="text-right text-sm">
            <p>Emisión {formatDate(invoice.issueDate)}</p>
            <p>Vencimiento {formatDate(invoice.dueDate)}</p>
            <p className="mt-2 capitalize">Estado: {invoice.status}</p>
          </div>
        </header>
        <section className="mt-6 text-sm">
          <p className="text-xs uppercase tracking-wider text-muted">Cliente</p>
          <p className="font-medium">{client.name}</p>
          <p>{client.rut} · {client.giro}</p>
          <p>
            {client.address}, {client.city}
          </p>
        </section>
        <table className="mt-8 w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase text-muted">
              <th className="py-2">Descripción</th>
              <th className="py-2 text-right">Cant.</th>
              <th className="py-2 text-right">Precio</th>
              <th className="py-2 text-right">Monto</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id} className="border-b border-zinc-100">
                <td className="py-2">{item.description}</td>
                <td className="py-2 text-right">{item.quantity}</td>
                <td className="py-2 text-right">{formatCLP(item.unitPrice)}</td>
                <td className="py-2 text-right">{formatCLP(item.quantity * item.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-6 ml-auto w-64 space-y-1 text-sm">
          <p className="flex justify-between">
            <span>Neto</span>
            <span>{formatCLP(totals.neto)}</span>
          </p>
          <p className="flex justify-between">
            <span>IVA {Math.round(invoice.taxRate * 100)}%</span>
            <span>{formatCLP(totals.iva)}</span>
          </p>
          <p className="flex justify-between border-t pt-2 text-base font-semibold">
            <span>Total</span>
            <span>{formatCLP(totals.total)}</span>
          </p>
        </div>
        {invoice.notes ? <p className="mt-8 text-sm text-muted">Notas: {invoice.notes}</p> : null}
      </article>
    </div>
  );
}
