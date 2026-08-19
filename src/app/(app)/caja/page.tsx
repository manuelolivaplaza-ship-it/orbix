"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Money } from "@/components/ui/Money";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/skeleton";
import { Select } from "@/components/ui/field";
import { Metric } from "@/components/app/Metric";
import { Sparkline } from "@/components/app/Sparkline";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBoot } from "@/hooks/useBoot";
import { useCompanyData, useStore } from "@/lib/store";
import {
  cashBalance,
  cashForecast,
  invoiceTotal,
  payablesOpen,
  receivables,
  suggestMatch,
} from "@/lib/finance";
import { isReceivableDocument } from "@/lib/invoice";
import { DEMO_TODAY, formatDate } from "@/lib/format";

export default function CajaPage() {
  const loading = useBoot();
  const { invoices, bankTxs, payables, employees } = useCompanyData();
  const { matchBankTx, markPayablePaid } = useStore();

  if (loading) return <PageSkeleton />;

  const caja = cashBalance(bankTxs);
  const forecast = cashForecast({ invoices, payables, employees, bankTxs, today: DEMO_TODAY });
  const open = invoices.filter(isReceivableDocument);

  return (
    <div>
      <PageHeader
        kicker="Tesorería"
        title="Caja"
        description="Cartola, conciliación sugerida y flujo de caja a 30 días."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Saldo en banco" value={caja} hint="Suma de la cartola" />
        <Metric label="Por cobrar" value={receivables(invoices)} hint="Facturas abiertas" />
        <Metric label="Por pagar" value={payablesOpen(payables)} hint="Proveedores + Previred" />
      </div>

      <Card className="mt-6 p-5">
        <h2 className="mb-4 text-sm font-medium">Flujo proyectado</h2>
        <Sparkline points={forecast} />
      </Card>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-medium">Cartola y conciliación</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Movimiento</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead>Match</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bankTxs.map((tx) => {
                const suggested = suggestMatch(tx, invoices);
                return (
                  <TableRow key={tx.id}>
                    <TableCell className="text-muted-foreground">{formatDate(tx.date)}</TableCell>
                    <TableCell>{tx.description}</TableCell>
                    <TableCell className="text-right">
                      <Money value={tx.amount} className={tx.amount < 0 ? "text-red-400" : ""} />
                    </TableCell>
                    <TableCell>
                      {tx.amount <= 0 ? (
                        <Badge variant="muted">Egreso</Badge>
                      ) : (
                        <Select
                          value={tx.matchedInvoiceId ?? ""}
                          onChange={(e) => matchBankTx(tx.id, e.target.value || null)}
                          className="h-8 min-w-[140px] text-xs"
                        >
                          <option value="">Sin conciliar</option>
                          {open.map((inv) => (
                            <option key={inv.id} value={inv.id}>
                              {inv.number} · {invoiceTotal(inv)}
                            </option>
                          ))}
                          {tx.matchedInvoiceId && !open.some((i) => i.id === tx.matchedInvoiceId) ? (
                            <option value={tx.matchedInvoiceId}>{tx.matchedInvoiceId}</option>
                          ) : null}
                        </Select>
                      )}
                      {suggested && !tx.matchedInvoiceId ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="mt-1"
                          onClick={() => matchBankTx(tx.id, suggested.id)}
                        >
                          Sugerido {suggested.number}
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-medium">Cuentas por pagar</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proveedor</TableHead>
                <TableHead>Vence</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {payables.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p>{item.vendor}</p>
                    <p className="text-[11px] text-muted-foreground">{item.concept}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(item.dueDate)}</TableCell>
                  <TableCell className="text-right">
                    <Money value={item.amount} />
                  </TableCell>
                  <TableCell className="text-right">
                    {item.status === "pagada" ? (
                      <Badge tone="success">Pagada</Badge>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => markPayablePaid(item.id)}>
                        Pagar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
