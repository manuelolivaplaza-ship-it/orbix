import { Badge } from "@/components/ui/badge";
import { siiLabel, siiTone } from "@/lib/status";
import { documentKind } from "@/lib/invoice";
import type { Invoice } from "@/lib/types";

export function SiiBadge({ invoice }: { invoice: Invoice }) {
  if (documentKind(invoice) === "cotizacion") {
    return <Badge tone="muted">No DTE</Badge>;
  }
  return <Badge tone={siiTone(invoice.siiStatus)}>{siiLabel(invoice.siiStatus)}</Badge>;
}
