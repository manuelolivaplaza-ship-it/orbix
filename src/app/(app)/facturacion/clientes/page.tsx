"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input, Label } from "@/components/ui/field";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/skeleton";
import { useBoot } from "@/hooks/useBoot";
import { useCompanyData, useStore } from "@/lib/store";
import type { Client } from "@/lib/types";
import { formatRut, isValidRut } from "@/lib/rut";

const EMPTY: Omit<Client, "id" | "companyId"> = {
  name: "",
  rut: "",
  giro: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  comuna: "",
};

export default function ClientesPage() {
  const loading = useBoot();
  const { company, clients } = useCompanyData();
  const { saveClient, deleteClient } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<string | undefined>();
  const [error, setError] = useState("");

  function openNew() {
    setEditId(undefined);
    setForm(EMPTY);
    setError("");
    setOpen(true);
  }

  function openEdit(client: Client) {
    setEditId(client.id);
    setForm({
      name: client.name,
      rut: client.rut,
      giro: client.giro,
      email: client.email,
      phone: client.phone,
      address: client.address,
      city: client.city,
      comuna: client.comuna ?? client.city,
    });
    setError("");
    setOpen(true);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!company) return;
    if (!form.name.trim() || !form.rut.trim()) {
      setError("Nombre y RUT son obligatorios.");
      return;
    }
    if (!isValidRut(form.rut)) {
      setError("El RUT no es válido (dígito verificador, módulo 11).");
      return;
    }
    saveClient({
      ...form,
      rut: formatRut(form.rut),
      comuna: form.comuna || form.city,
      id: editId,
      companyId: company.id,
    });
    setOpen(false);
  }

  if (loading) return <PageSkeleton />;

  return (
    <div>
      <PageHeader
        kicker="Facturación"
        title="Clientes"
        description="CRUD de clientes de la empresa activa. El RUT y el giro viajan a la factura."
        actions={<Button onClick={openNew}>Nuevo cliente</Button>}
      />

      {clients.length === 0 ? (
        <EmptyState
          title="Aún no hay clientes"
          description="Crea el primero para poder emitir facturas."
          action={<Button onClick={openNew}>Agregar cliente</Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {clients.map((client) => (
            <Card key={client.id} hover className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-medium text-ink">{client.name}</h2>
                  <p className="font-mono text-xs text-muted">{client.rut}</p>
                  <p className="mt-2 text-sm text-secondary">{client.giro}</p>
                  <p className="mt-1 text-xs text-muted">
                    {client.email} · {client.city}
                  </p>
                </div>
                <Badge>Cliente</Badge>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => openEdit(client)}>
                  Editar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => deleteClient(client.id)}>
                  Eliminar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} title={editId ? "Editar cliente" : "Nuevo cliente"} onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="grid gap-3">
          <div>
            <Label>Razón social</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>RUT</Label>
              <Input value={form.rut} onChange={(e) => setForm({ ...form, rut: e.target.value })} />
            </div>
            <div>
              <Label>Comuna</Label>
              <Input
                value={form.comuna ?? form.city}
                onChange={(e) => setForm({ ...form, comuna: e.target.value, city: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>Giro</Label>
            <Input value={form.giro} onChange={(e) => setForm({ ...form, giro: e.target.value })} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Dirección</Label>
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <Button type="submit">Guardar cliente</Button>
        </form>
      </Modal>
    </div>
  );
}
