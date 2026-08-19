"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Copy, CreditCard, Mail, Repeat, SplitSquareHorizontal } from "lucide-react";
import { InvoiceEditor } from "@/components/invoices/InvoiceEditor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Money } from "@/components/ui/Money";
import { PageHeader } from "@/components/ui/PageHeader";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { computeInvoiceTotals, documentKind } from "@/lib/invoice";
import { formatDate, formatCLP } from "@/lib/format";
import { documentKindLabel, eventLabel, invoiceLabel, invoiceTone } from "@/lib/status";
import { useStore } from "@/lib/store";

export default function DocumentoPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const {
    state,
    convertQuote,
    duplicateInvoice,
    issueCreditNote,
    sendReminder,
    markInvoicePaid,
    toggleRecurring,
  } = useStore();
  const invoice = state.invoices.find((item) => item.id === params.id);
  const client = state.clients.find((c) => c.id === invoice?.clientId);
  const company = state.companies.find((c) => c.id === invoice?.companyId);

  if (!invoice) {
    return (
      <EmptyState
        state="error"
        title="Documento no encontrado"
        description="Puede que la hayas eliminado o que pertenezca a otra empresa."
        action={
          <Link href="/facturacion">
            <Button variant="secondary">Volver a facturas</Button>
          </Link>
        }
      />
    );
  }

  const totals = computeInvoiceTotals(invoice.items, invoice.taxRate);
  const kind = documentKind(invoice);
  const events = [...(invoice.events ?? [])].reverse();
  const portal = `/p/${invoice.portalToken ?? invoice.id}`;

  function run<T extends { error: string } | { id: string }>(result: T) {
    if ("error" in result && result.error) return;
    if ("id" in result) router.push(`/facturacion/${result.id}`);
  }

  return (
    <div>
      <PageHeader
        kicker={documentKindLabel(kind)}
        title={invoice.number}
        description={`${client?.name ?? "Cliente"} · ${formatDate(invoice.issueDate)}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Badge tone={invoiceTone(invoice.status)}>{invoiceLabel(invoice.status)}</Badge>
            {invoice.recurring?.active ? <Badge tone="info">Recurrente</Badge> : null}
            <Link href={`/facturacion/${invoice.id}/imprimir`}>
              <Button variant="secondary" size="sm">
                Imprimir
              </Button>
            </Link>
          </div>
        }
      />

      <Tabs defaultValue="documento">
        <TabsList variant="line" className="mb-6">
          <TabsTrigger value="documento">Documento</TabsTrigger>
          <TabsTrigger value="editar">Editar</TabsTrigger>
        </TabsList>
        <TabsContent value="documento">
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <Card className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {company?.name}
                  </p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">{company?.rut}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <Money value={totals.total} className="text-2xl font-semibold text-foreground" />
                </div>
              </div>
              <Separator className="my-5" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Cliente</p>
                  <p className="mt-1 text-sm text-foreground">{client?.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{client?.rut}</p>
                  <p className="text-xs text-muted-foreground">{client?.giro}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Fechas</p>
                  <p className="mt-1 text-sm">Emisión {formatDate(invoice.issueDate)}</p>
                  <p className="text-sm">Vence {formatDate(invoice.dueDate)}</p>
                </div>
              </div>
              <ul className="mt-6 space-y-2 text-sm">
                {invoice.items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-3 border-b border-border py-2 last:border-0">
                    <span className="text-secondary">
                      {item.quantity} × {item.description}
                    </span>
                    <Money value={item.quantity * item.unitPrice} />
                  </li>
                ))}
              </ul>
              <div className="mt-4 space-y-1 text-sm">
                <div className="flex justify-between text-secondary">
                  <span>Neto</span>
                  <span className="font-mono">{formatCLP(totals.neto)}</span>
                </div>
                <div className="flex justify-between text-secondary">
                  <span>IVA {Math.round(invoice.taxRate * 100)}%</span>
                  <span className="font-mono">{formatCLP(totals.iva)}</span>
                </div>
                <div className="flex justify-between pt-2 text-base font-medium">
                  <span>Total</span>
                  <Money value={totals.total} />
                </div>
              </div>
              {invoice.notes ? (
                <p className="mt-4 text-xs text-muted-foreground">{invoice.notes}</p>
              ) : null}
            </Card>

            <div className="space-y-4">
              <Card className="p-5">
                <h2 className="text-sm font-medium">Acciones</h2>
                <div className="mt-3 grid gap-2">
                  {kind === "cotizacion" && invoice.status !== "pagada" ? (
                    <Button
                      onClick={() => run(convertQuote(invoice.id))}
                    >
                      Convertir a factura
                    </Button>
                  ) : null}
                  {invoice.status !== "pagada" && kind !== "cotizacion" ? (
                    <Button onClick={() => markInvoicePaid(invoice.id)}>
                      <CreditCard size={14} /> Marcar pagada
                    </Button>
                  ) : null}
                  <Button variant="secondary" onClick={() => sendReminder(invoice.id)}>
                    <Mail size={14} /> Enviar recordatorio
                  </Button>
                  <Button variant="secondary" onClick={() => run(duplicateInvoice(invoice.id))}>
                    <Copy size={14} /> Duplicar
                  </Button>
                  {kind === "factura" ? (
                    <Button variant="secondary" onClick={() => run(issueCreditNote(invoice.id))}>
                      <SplitSquareHorizontal size={14} /> Nota de crédito
                    </Button>
                  ) : null}
                  <Button variant="secondary" onClick={() => toggleRecurring(invoice.id)}>
                    <Repeat size={14} />
                    {invoice.recurring?.active ? "Quitar recurrente" : "Hacer recurrente"}
                  </Button>
                  <Link href={portal}>
                    <Button variant="outline" className="w-full">
                      Portal del cliente
                    </Button>
                  </Link>
                </div>
                <p className="mt-3 text-[11px] text-muted-foreground">
                  {invoice.reminderCount ?? 0} recordatorios · token {invoice.portalToken}
                </p>
              </Card>

              <Card className="p-5">
                <h2 className="mb-4 text-sm font-medium">Actividad</h2>
                <ol className="space-y-4">
                  {events.map((item, index) => (
                    <li key={item.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span className="mt-1 size-2 rounded-full bg-foreground" />
                        {index < events.length - 1 ? (
                          <span className="mt-1 w-px flex-1 bg-border" />
                        ) : null}
                      </div>
                      <div className="pb-1">
                        <p className="text-sm text-foreground">{eventLabel(item.kind)}</p>
                        <p className="text-xs text-muted-foreground">{item.detail}</p>
                        <p className="text-[11px] text-muted-foreground">{formatDate(item.at)}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </Card>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="editar">
          <InvoiceEditor invoice={invoice} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
