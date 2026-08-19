"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FilePlus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/field";
import { Money } from "@/components/ui/Money";
import { EmptyState } from "@/components/ui/EmptyState";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBoot } from "@/hooks/useBoot";
import { useCompanyData, useStore } from "@/lib/store";
import {
  computeInvoiceTotals,
  DOCUMENT_KINDS,
  documentKind,
  INVOICE_STATUSES,
  type DocumentKind,
  type InvoiceStatus,
} from "@/lib/invoice";
import { formatDate } from "@/lib/format";
import { documentKindLabel, invoiceLabel, invoiceTone } from "@/lib/status";
import { SiiBadge } from "@/components/sii/SiiBadge";

type KindFilter = "todas" | DocumentKind;
type View = "todas" | "pipeline" | "vencidas" | "recurrentes";

export default function FacturacionPage() {
  const loading = useBoot();
  const { invoices, clients } = useCompanyData();
  const { deleteInvoice } = useStore();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"todas" | InvoiceStatus>("todas");
  const [kind, setKind] = useState<KindFilter>("todas");
  const [view, setView] = useState<View>("todas");

  const rows = useMemo(() => {
    return invoices
      .map((invoice) => {
        const client = clients.find((c) => c.id === invoice.clientId);
        return {
          ...invoice,
          kind: documentKind(invoice),
          clientName: client?.name ?? "Cliente",
          ...computeInvoiceTotals(invoice.items, invoice.taxRate),
        };
      })
      .filter((invoice) => (status === "todas" ? true : invoice.status === status))
      .filter((invoice) => (kind === "todas" ? true : invoice.kind === kind))
      .filter((invoice) => {
        if (view === "vencidas") return invoice.status === "vencida";
        if (view === "recurrentes") return Boolean(invoice.recurring?.active);
        if (view === "pipeline") return invoice.kind === "cotizacion" || invoice.status === "borrador";
        return true;
      })
      .filter((invoice) => {
        const q = query.toLowerCase();
        return (
          invoice.number.toLowerCase().includes(q) ||
          invoice.clientName.toLowerCase().includes(q)
        );
      });
  }, [clients, invoices, kind, query, status, view]);

  if (loading) return <PageSkeleton />;

  return (
    <div>
      <PageHeader
        kicker="Comercial"
        title="Facturas"
        description="Cotiza, emite DTE al SII y cobra. El folio fiscal vive en cada documento."
        actions={
          <>
            <Link href="/facturacion/clientes">
              <Button variant="secondary" size="sm">
                <Users size={14} /> Clientes
              </Button>
            </Link>
            <Link href="/facturacion/nueva?kind=cotizacion">
              <Button variant="secondary" size="sm">
                Cotización
              </Button>
            </Link>
            <Link href="/facturacion/nueva">
              <Button size="sm">
                <FilePlus size={14} /> Nueva factura
              </Button>
            </Link>
          </>
        }
      />

      <Tabs value={view} onValueChange={(v) => setView(v as View)} className="mb-4">
        <TabsList variant="line">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="vencidas">Vencidas</TabsTrigger>
          <TabsTrigger value="recurrentes">Recurrentes</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Buscar folio o cliente"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className="sm:max-w-[160px]"
        >
          <option value="todas">Estado</option>
          {INVOICE_STATUSES.map((item) => (
            <option key={item} value={item}>
              {invoiceLabel(item)}
            </option>
          ))}
        </Select>
        <Select
          value={kind}
          onChange={(e) => setKind(e.target.value as KindFilter)}
          className="sm:max-w-[180px]"
        >
          <option value="todas">Tipo</option>
          {DOCUMENT_KINDS.map((item) => (
            <option key={item} value={item}>
              {documentKindLabel(item)}
            </option>
          ))}
        </Select>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No hay documentos con ese filtro"
          description="Cambia la búsqueda o crea una factura o cotización."
          action={
            <Link href="/facturacion/nueva">
              <Button>Crear factura</Button>
            </Link>
          }
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Folio</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>SII</TableHead>
                <TableHead>Emisión</TableHead>
                <TableHead>Vence</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono">
                    <Link href={`/facturacion/${invoice.id}`} className="hover:text-foreground">
                      {invoice.number}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {documentKindLabel(invoice.kind)}
                  </TableCell>
                  <TableCell className="text-secondary">{invoice.clientName}</TableCell>
                  <TableCell>
                    <Badge tone={invoiceTone(invoice.status)}>{invoiceLabel(invoice.status)}</Badge>
                  </TableCell>
                  <TableCell>
                    <SiiBadge invoice={invoice} />
                  </TableCell>
                  <TableCell className="text-secondary">{formatDate(invoice.issueDate)}</TableCell>
                  <TableCell className="text-secondary">{formatDate(invoice.dueDate)}</TableCell>
                  <TableCell className="text-right">
                    <Money value={invoice.total} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => deleteInvoice(invoice.id)}>
                      Borrar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
