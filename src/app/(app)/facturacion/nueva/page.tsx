"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { InvoiceEditor } from "@/components/invoices/InvoiceEditor";
import { PageSkeleton } from "@/components/ui/skeleton";
import { documentKindLabel } from "@/lib/status";
import type { DocumentKind } from "@/lib/invoice";

function NuevaInner() {
  const params = useSearchParams();
  const raw = params.get("kind");
  const kind: DocumentKind =
    raw === "cotizacion" ||
    raw === "boleta" ||
    raw === "nota_credito" ||
    raw === "nota_debito" ||
    raw === "factura"
      ? raw
      : "factura";

  return (
    <div>
      <PageHeader
        kicker="Facturación"
        title={kind === "factura" ? "Nueva factura" : `Nueva ${documentKindLabel(kind).toLowerCase()}`}
        description="Ítems, impuestos y cliente. El preview de la derecha usa el mismo cálculo que se persiste."
      />
      <InvoiceEditor initialKind={kind} />
    </div>
  );
}

export default function NuevaFacturaPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <NuevaInner />
    </Suspense>
  );
}
