"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { computeInvoiceTotals, documentKind } from "@/lib/invoice";
import { formatCLP, formatDate } from "@/lib/format";
import { useStore } from "@/lib/store";
import { DTE_LABEL, resolveDteType } from "@/lib/sii/dte";
import { documentKindLabel } from "@/lib/status";

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
  const kind = documentKind(invoice);
  const dteType = invoice.dteType ?? resolveDteType(kind, invoice.taxRate);
  const folio = invoice.folio ?? invoice.number;
  const title = dteType ? DTE_LABEL[dteType] : documentKindLabel(kind);
  const comunaEmisor = company.comuna || company.city;
  const comunaRecep = client.comuna || client.city;

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
      <article className="mx-auto max-w-3xl border-2 border-zinc-900 p-8">
        <header className="grid grid-cols-[1fr_220px] gap-6">
          <div>
            <p className="text-lg font-semibold tracking-tight">{company.name}</p>
            <p className="mt-1 text-sm">{company.giro}</p>
            <p className="text-sm">
              {company.address}
              {comunaEmisor ? ` · ${comunaEmisor}` : ""}
            </p>
            {company.siiResolutionNumber ? (
              <p className="mt-2 text-[11px] text-zinc-600">
                Resolución SII N° {company.siiResolutionNumber}
                {company.siiResolutionDate ? ` del ${formatDate(company.siiResolutionDate)}` : ""}
              </p>
            ) : null}
          </div>
          <div className="border-2 border-zinc-900 px-3 py-3 text-center">
            <p className="font-mono text-sm font-semibold">R.U.T.: {company.rut}</p>
            <p className="mt-2 text-[11px] font-semibold uppercase leading-tight">{title}</p>
            <p className="mt-2 font-mono text-xl font-semibold">N° {folio}</p>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-500">
              {invoice.siiStatus === "aceptado" ? "Timbre electrónico SII" : "Documento interno"}
            </p>
          </div>
        </header>

        <section className="mt-6 grid grid-cols-2 gap-4 border border-zinc-300 p-4 text-sm">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Señor(es)</p>
            <p className="font-medium">{client.name}</p>
            <p>RUT {client.rut}</p>
            <p>{client.giro}</p>
            <p>
              {client.address}
              {comunaRecep ? ` · ${comunaRecep}` : ""}
            </p>
          </div>
          <div className="text-right">
            <p>Fecha emisión {formatDate(invoice.issueDate)}</p>
            <p>Vencimiento {formatDate(invoice.dueDate)}</p>
            <p>
              Forma de pago {invoice.paymentMethod === "contado" ? "Contado" : "Crédito"}
            </p>
            {dteType ? <p>Tipo DTE {dteType}</p> : null}
          </div>
        </section>

        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-y-2 border-zinc-900 text-left text-[10px] uppercase tracking-wider">
              <th className="py-2">Descripción</th>
              <th className="py-2 text-right">Cant.</th>
              <th className="py-2 text-right">Precio</th>
              <th className="py-2 text-right">Monto</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id} className="border-b border-zinc-200">
                <td className="py-2">{item.description}</td>
                <td className="py-2 text-right">{item.quantity}</td>
                <td className="py-2 text-right">{formatCLP(item.unitPrice)}</td>
                <td className="py-2 text-right">{formatCLP(item.quantity * item.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 ml-auto w-72 space-y-1 border border-zinc-300 p-3 text-sm">
          <p className="flex justify-between">
            <span>Monto neto</span>
            <span className="font-mono">{formatCLP(totals.neto)}</span>
          </p>
          <p className="flex justify-between">
            <span>IVA {Math.round(invoice.taxRate * 100)}%</span>
            <span className="font-mono">{formatCLP(totals.iva)}</span>
          </p>
          <p className="flex justify-between border-t border-zinc-900 pt-2 text-base font-semibold">
            <span>Total</span>
            <span className="font-mono">{formatCLP(totals.total)}</span>
          </p>
        </div>

        <footer className="mt-10 grid grid-cols-[160px_1fr] items-end gap-6">
          <div className="flex h-36 w-40 items-center justify-center border-2 border-dashed border-zinc-400 text-center text-[10px] leading-relaxed text-zinc-500">
            {invoice.siiTrackId ? (
              <span>
                TED
                <br />
                {invoice.siiTrackId}
              </span>
            ) : (
              <span>
                Timbre electrónico
                <br />
                pendiente
              </span>
            )}
          </div>
          <div className="text-[11px] text-zinc-600">
            <p>Timbre electrónico SII</p>
            <p className="mt-1">
              Verifique documento en www.sii.cl · {invoice.siiStatus === "aceptado" ? "Aceptado" : "Sin timbrar"}
            </p>
            {invoice.notes ? <p className="mt-3">Notas: {invoice.notes}</p> : null}
          </div>
        </footer>
      </article>
    </div>
  );
}
