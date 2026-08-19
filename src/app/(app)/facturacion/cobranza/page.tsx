"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Money } from "@/components/ui/Money";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/skeleton";
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
  AGING_LABEL,
  agingBucket,
  agingSummary,
  invoiceTotal,
  topDebtors,
  type AgingBucket,
} from "@/lib/finance";
import { isReceivableDocument } from "@/lib/invoice";
import { DEMO_TODAY, formatDate } from "@/lib/format";

import { useMemo, useState } from "react";

const BUCKETS: AgingBucket[] = ["current", "d30", "d60", "d90", "d90p"];

export default function CobranzaPage() {
  const loading = useBoot();
  const { invoices, clients } = useCompanyData();
  const { sendReminder } = useStore();
  const [bucket, setBucket] = useState<AgingBucket | "todas">("todas");

  const open = useMemo(
    () =>
      invoices
        .filter(isReceivableDocument)
        .map((invoice) => ({
          ...invoice,
          amount: invoiceTotal(invoice),
          bucket: agingBucket(invoice.dueDate, DEMO_TODAY),
          clientName: clients.find((c) => c.id === invoice.clientId)?.name ?? "Cliente",
        })),
    [clients, invoices],
  );
  const summary = agingSummary(invoices, DEMO_TODAY);
  const rows = bucket === "todas" ? open : open.filter((row) => row.bucket === bucket);
  const debtors = topDebtors(invoices, clients, 6);

  if (loading) return <PageSkeleton />;

  return (
    <div>
      <PageHeader
        kicker="Comercial"
        title="Cobranza"
        description="Aging 30 / 60 / 90 y recordatorios. Lo que Nubox llama gestión de cobranza."
      />

      <div className="grid gap-3 sm:grid-cols-5">
        {BUCKETS.map((key) => (
          <button key={key} onClick={() => setBucket(key)} className="text-left">
            <Card className={bucket === key ? "border-primary p-4" : "p-4"}>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {AGING_LABEL[key]}
              </p>
              <p className="mt-2 font-mono text-lg">
                <Money value={summary[key].amount} />
              </p>
              <p className="text-[11px] text-muted-foreground">{summary[key].count} docs</p>
            </Card>
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Folio</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Bucket</TableHead>
                <TableHead>Vence</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono">
                    <Link href={`/facturacion/${invoice.id}`}>{invoice.number}</Link>
                  </TableCell>
                  <TableCell>{invoice.clientName}</TableCell>
                  <TableCell>
                    <Badge tone={invoice.bucket === "d90p" || invoice.bucket === "d90" ? "danger" : "warning"}>
                      {AGING_LABEL[invoice.bucket]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(invoice.dueDate)}</TableCell>
                  <TableCell className="text-right">
                    <Money value={invoice.amount} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="secondary" onClick={() => sendReminder(invoice.id)}>
                      Recordatorio
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-medium">Top deudores</h2>
          <ul className="mt-4 space-y-3">
            {debtors.map((debtor) => (
              <li key={debtor.clientId} className="flex justify-between gap-3">
                <div>
                  <p className="text-sm">{debtor.name}</p>
                  <p className="text-[11px] text-muted-foreground">{debtor.count} documentos</p>
                </div>
                <Money value={debtor.amount} className="text-sm" />
              </li>
            ))}
          </ul>
          <Button
            className="mt-6 w-full"
            variant="secondary"
            onClick={() => rows.forEach((row) => sendReminder(row.id))}
          >
            Recordar a todos los de esta vista
          </Button>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Mock: no sale un mail real. Queda en la línea de tiempo del documento.
          </p>
        </Card>
      </div>
    </div>
  );
}
