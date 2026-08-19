"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/field";
import { Money } from "@/components/ui/Money";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/user-avatar";
import { useBoot } from "@/hooks/useBoot";
import { useStore } from "@/lib/store";
import { collectedRevenue, receivables } from "@/lib/finance";
import { computeLiquidacion, defaultExtrasForSalary } from "@/lib/payroll";

export default function EmpresasPage() {
  const loading = useBoot();
  const { state, company, setActiveCompany, persistCompany } = useStore();
  const [form, setForm] = useState(company);

  useEffect(() => {
    setForm(company);
  }, [company]);

  if (loading || !form || !company) return <PageSkeleton />;

  const consolidated = state.companies.map((item) => {
    const invoices = state.invoices.filter((i) => i.companyId === item.id);
    const team = state.employees.filter((e) => e.companyId === item.id && e.estado !== "inactivo");
    const nomina = team.reduce((sum, e) => {
      const extras = defaultExtrasForSalary(e.sueldoBase);
      return sum + computeLiquidacion({ sueldoBase: e.sueldoBase, ...extras }).liquido;
    }, 0);
    return {
      company: item,
      ingresos: collectedRevenue(invoices),
      cxc: receivables(invoices),
      headcount: team.length,
      nomina,
    };
  });

  return (
    <div>
      <PageHeader
        kicker="Estudio"
        title="Empresas"
        description="Vista consolidada para el contador: caja comercial de cada razón social."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {consolidated.map((row) => {
          const active = row.company.id === state.activeCompanyId;
          return (
            <button key={row.company.id} onClick={() => setActiveCompany(row.company.id)} className="text-left">
              <Card hover className={active ? "border-primary p-5" : "p-5"}>
                <div className="flex items-center gap-3">
                  <Avatar name={row.company.name} color={row.company.logoColor} size={44} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{row.company.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{row.company.rut}</p>
                  </div>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <dt className="text-muted-foreground">Cobrados</dt>
                    <dd>
                      <Money value={row.ingresos} className="text-sm" />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Por cobrar</dt>
                    <dd>
                      <Money value={row.cxc} className="text-sm" />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Equipo</dt>
                    <dd className="font-mono">{row.headcount}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Nómina</dt>
                    <dd>
                      <Money value={row.nomina} className="text-sm" />
                    </dd>
                  </div>
                </dl>
                <div className="mt-3">
                  {active ? <Badge tone="accent">Empresa activa</Badge> : <Badge>Cambiar</Badge>}
                </div>
              </Card>
            </button>
          );
        })}
      </div>

      <Card className="mt-6 p-6">
        <h2 className="text-lg font-medium">Datos de {company.name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">Configuración fiscal y logo (monograma).</p>
        <form
          className="mt-6 grid gap-4 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            void persistCompany(company.id, form);
          }}
        >
          <div>
            <Label>Razón social</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>RUT</Label>
            <Input value={form.rut} onChange={(e) => setForm({ ...form, rut: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <Label>Giro</Label>
            <Textarea value={form.giro} onChange={(e) => setForm({ ...form, giro: e.target.value })} />
          </div>
          <div>
            <Label>Dirección</Label>
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div>
            <Label>Ciudad</Label>
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <Label>Región</Label>
            <Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
          </div>
          <div>
            <Label>Teléfono</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <Label>Banco</Label>
            <Input value={form.bank} onChange={(e) => setForm({ ...form, bank: e.target.value })} />
          </div>
          <div>
            <Label>Cuenta</Label>
            <Input value={form.account} onChange={(e) => setForm({ ...form, account: e.target.value })} />
          </div>
          <div>
            <Label>Color de logo</Label>
            <Input
              type="color"
              value={form.logoColor}
              onChange={(e) => setForm({ ...form, logoColor: e.target.value })}
              className="h-10 cursor-pointer p-1"
            />
          </div>
          <div className="md:col-span-2">
            <Button type="submit">Guardar empresa</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
