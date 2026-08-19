"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  FilePlus,
  FileText,
  LayoutDashboard,
  Users,
  Wallet,
  Landmark,
  Settings,
  BarChart3,
  Moon,
  Sun,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useTheme } from "next-themes";
import { documentKind } from "@/lib/invoice";
import { useStore } from "@/lib/store";
import { documentKindLabel } from "@/lib/status";

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { state, setActiveCompany } = useStore();
  const { resolvedTheme, setTheme } = useTheme();

  function go(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  if (!open) return null;

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Buscar en Orbix"
      description="Navega a facturas, personas y acciones."
    >
      <CommandInput placeholder="Buscar facturas, personas, empresas…" />
      <CommandList>
        <CommandEmpty>Sin resultados.</CommandEmpty>
        <CommandGroup heading="Ir a">
          <CommandItem onSelect={() => go("/dashboard")}>
            <LayoutDashboard /> Dashboard
          </CommandItem>
          <CommandItem onSelect={() => go("/facturacion/nueva")}>
            <FilePlus /> Nueva factura
          </CommandItem>
          <CommandItem onSelect={() => go("/facturacion/nueva?kind=cotizacion")}>
            <FileText /> Nueva cotización
          </CommandItem>
          <CommandItem onSelect={() => go("/sueldos/cerrar")}>
            <Wallet /> Cerrar mes de sueldos
          </CommandItem>
          <CommandItem onSelect={() => go("/caja")}>
            <Landmark /> Caja y conciliación
          </CommandItem>
          <CommandItem onSelect={() => go("/facturacion/cobranza")}>
            <FileText /> Cobranza
          </CommandItem>
          <CommandItem onSelect={() => go("/reportes")}>
            <BarChart3 /> Reportes
          </CommandItem>
          <CommandItem onSelect={() => go("/configuracion")}>
            <Settings /> Configuración
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Empresas">
          {state.companies.map((company) => (
            <CommandItem
              key={company.id}
              onSelect={() => {
                setActiveCompany(company.id);
                onOpenChange(false);
              }}
            >
              <Building2 />
              {company.name}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Documentos">
          {state.invoices.slice(0, 12).map((invoice) => (
            <CommandItem key={invoice.id} onSelect={() => go(`/facturacion/${invoice.id}`)}>
              <FileText />
              {invoice.number}
              <span className="text-muted-foreground">
                {documentKindLabel(documentKind(invoice))}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Apariencia">
          <CommandItem
            onSelect={() => {
              setTheme(resolvedTheme === "light" ? "dark" : "light");
              onOpenChange(false);
            }}
          >
            {resolvedTheme === "light" ? <Moon /> : <Sun />}
            {resolvedTheme === "light" ? "Modo oscuro" : "Modo claro"}
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Personas">
          {state.employees.slice(0, 10).map((employee) => (
            <CommandItem key={employee.id} onSelect={() => go(`/sueldos/${employee.id}`)}>
              <Users />
              {employee.firstName} {employee.lastName}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return { open, setOpen };
}
