"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Orb } from "@/components/orb/Orb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Money } from "@/components/ui/Money";
import { computeInvoiceTotals, documentKind } from "@/lib/invoice";
import { formatDate } from "@/lib/format";
import { documentKindLabel } from "@/lib/status";
import { useStore } from "@/lib/store";

export default function ClientPortalPage() {
  const params = useParams<{ token: string }>();
  const { state, markInvoicePaid } = useStore();
  const invoice = state.invoices.find(
    (item) => item.portalToken === params.token || item.id === params.token,
  );
  const company = state.companies.find((c) => c.id === invoice?.companyId);
  const client = state.clients.find((c) => c.id === invoice?.clientId);

  if (!invoice || !company || !client) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
        <Orb size={64} state="error" />
        <p className="mt-4 text-sm text-muted-foreground">Este enlace no es válido.</p>
      </div>
    );
  }

  const totals = computeInvoiceTotals(invoice.items, invoice.taxRate);
  const paid = invoice.status === "pagada";

  return (
    <div className="min-h-screen bg-background px-4 py-16">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 flex items-center gap-3">
          <Orb size={36} state="idle" />
          <div>
            <p className="text-sm font-medium">{company.name}</p>
            <p className="text-xs text-muted-foreground">Portal de pago Orbix</p>
          </div>
        </div>
        <Card className="p-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {documentKindLabel(documentKind(invoice))}
          </p>
          <h1 className="mt-2 font-mono text-2xl">{invoice.number}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{client.name}</p>
          <p className="mt-6 text-xs text-muted-foreground">Total a pagar</p>
          <Money value={totals.total} className="text-4xl font-semibold" />
          <p className="mt-2 text-xs text-muted-foreground">Vence {formatDate(invoice.dueDate)}</p>
          <ul className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
            {invoice.items.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span className="text-muted-foreground">{item.description}</span>
                <Money value={item.quantity * item.unitPrice} />
              </li>
            ))}
          </ul>
          {paid ? (
            <p className="mt-6 rounded-lg bg-foreground/5 px-4 py-3 text-sm">Este documento ya está pagado. Gracias.</p>
          ) : (
            <Button className="mt-6 w-full" onClick={() => markInvoicePaid(invoice.id)}>
              Pagar {invoice.number}
            </Button>
          )}
        </Card>
        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Demo: el pago queda marcado en el store local.{" "}
          <Link href="/login" className="underline">
            Entrar a Orbix
          </Link>
        </p>
      </div>
    </div>
  );
}
