"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { Money } from "@/components/ui/Money";
import { ErrorState } from "@/components/ui/EmptyState";
import {
  computeInvoiceTotals,
  DEFAULT_IVA_RATE,
  DOCUMENT_KINDS,
  documentKind,
  type DocumentKind,
  type InvoiceStatus,
} from "@/lib/invoice";
import { documentKindLabel } from "@/lib/status";
import { formatCLP } from "@/lib/format";
import { newInvoiceItem, useCompanyData, useStore } from "@/lib/store";
import type { Invoice } from "@/lib/types";

export function InvoiceEditor({
  invoice,
  initialKind,
}: {
  invoice?: Invoice;
  initialKind?: DocumentKind;
}) {
  const router = useRouter();
  const { saveInvoice } = useStore();
  const { company, clients } = useCompanyData();
  const [error, setError] = useState("");
  const [kind, setKind] = useState<DocumentKind>(invoice ? documentKind(invoice) : initialKind ?? "factura");
  const [clientId, setClientId] = useState(invoice?.clientId ?? clients[0]?.id ?? "");
  const [status, setStatus] = useState<InvoiceStatus>(invoice?.status ?? "borrador");
  const [issueDate, setIssueDate] = useState(invoice?.issueDate ?? "2026-08-18");
  const [dueDate, setDueDate] = useState(invoice?.dueDate ?? "2026-09-17");
  const [taxRate, setTaxRate] = useState(invoice?.taxRate ?? company?.ivaRate ?? DEFAULT_IVA_RATE);
  const [notes, setNotes] = useState(invoice?.notes ?? "");
  const [items, setItems] = useState(invoice?.items ?? [newInvoiceItem()]);

  const totals = useMemo(() => computeInvoiceTotals(items, taxRate), [items, taxRate]);
  const client = clients.find((c) => c.id === clientId);

  function updateItem(id: string, patch: Partial<(typeof items)[number]>) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function save(nextStatus: InvoiceStatus) {
    if (!company) {
      setError("No hay empresa activa.");
      return;
    }
    if (!clientId) {
      setError("Selecciona un cliente.");
      return;
    }
    if (!items.length || items.every((item) => !item.description || item.unitPrice <= 0)) {
      setError("Agrega al menos un ítem con descripción y precio.");
      return;
    }
    setError("");
    const saved = saveInvoice({
      id: invoice?.id,
      number: invoice?.number,
      companyId: company.id,
      clientId,
      status: nextStatus,
      issueDate,
      dueDate,
      items,
      taxRate,
      notes,
      kind,
      relatedId: invoice?.relatedId,
      portalToken: invoice?.portalToken,
      recurring: invoice?.recurring,
      events: invoice?.events,
    });
    router.push(`/facturacion/${saved.id}`);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-5">
        <Card className="grid gap-4 p-5 md:grid-cols-2">
          <div>
            <Label>Tipo</Label>
            <Select value={kind} onChange={(e) => setKind(e.target.value as DocumentKind)}>
              {DOCUMENT_KINDS.map((item) => (
                <option key={item} value={item}>
                  {documentKindLabel(item)}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Cliente</Label>
            <Select value={clientId} onChange={(e) => setClientId(e.target.value)}>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Estado</Label>
            <Select value={status} onChange={(e) => setStatus(e.target.value as InvoiceStatus)}>
              <option value="borrador">Borrador</option>
              <option value="enviada">Enviada</option>
              <option value="pagada">Pagada</option>
              <option value="vencida">Vencida</option>
            </Select>
          </div>
          <div>
            <Label>Emisión</Label>
            <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
          </div>
          <div>
            <Label>Vencimiento</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div>
            <Label>IVA</Label>
            <Select value={String(taxRate)} onChange={(e) => setTaxRate(Number(e.target.value))}>
              <option value="0.19">19%</option>
              <option value="0">Exento 0%</option>
            </Select>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-ink">Ítems</h2>
            <Button size="sm" variant="secondary" onClick={() => setItems((prev) => [...prev, newInvoiceItem()])}>
              <Plus size={14} /> Agregar
            </Button>
          </div>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="grid gap-2 md:grid-cols-[1fr_90px_140px_40px]">
                <Input
                  placeholder="Descripción"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, { description: e.target.value })}
                />
                <Input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
                />
                <Input
                  type="number"
                  min={0}
                  value={item.unitPrice}
                  onChange={(e) => updateItem(item.id, { unitPrice: Number(e.target.value) })}
                />
                <button
                  onClick={() => setItems((prev) => prev.filter((row) => row.id !== item.id))}
                  className="flex h-10 items-center justify-center rounded-xl text-muted hover:bg-ink/[0.04] hover:text-red-400"
                  aria-label="Quitar ítem"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Label>Notas</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </Card>

        {error ? (
          <ErrorState
            description={error}
            action={
              <Button variant="secondary" onClick={() => setError("")}>
                Entendido
              </Button>
            }
          />
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => save("borrador")} variant="secondary">
            Guardar borrador
          </Button>
          <Button onClick={() => save(status === "borrador" ? "enviada" : status)}>
            Guardar y enviar
          </Button>
        </div>
      </div>

      <Card className="h-fit p-6">
        <p className="text-xs uppercase tracking-wider text-muted">Preview en tiempo real</p>
        <h2 className="mt-2 text-lg font-semibold text-ink">
          {invoice?.number ?? "Nueva factura"}
        </h2>
        <p className="text-sm text-secondary">{company?.name}</p>
        <p className="text-xs text-muted">{company?.rut}</p>
        <div className="mt-5 rounded-xl bg-elevated p-4 text-sm">
          <p className="text-muted">Cliente</p>
          <p className="text-ink">{client?.name ?? "—"}</p>
          <p className="text-xs text-muted">{client?.rut}</p>
          <p className="text-xs text-muted">{client?.giro}</p>
        </div>
        <ul className="mt-4 space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3 text-secondary">
              <span className="truncate">
                {item.quantity} × {item.description || "Ítem"}
              </span>
              <Money value={item.quantity * item.unitPrice} />
            </li>
          ))}
        </ul>
        <div className="mt-5 space-y-1 border-t border-line pt-4 text-sm">
          <Row label="Neto" value={totals.neto} />
          <Row label={`IVA ${Math.round(taxRate * 100)}%`} value={totals.iva} />
          <div className="flex justify-between pt-2 text-base font-medium text-ink">
            <span>Total</span>
            <Money value={totals.total} />
          </div>
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-secondary">
      <span>{label}</span>
      <span className="font-mono">{formatCLP(value)}</span>
    </div>
  );
}
