import type { AttendanceStatus } from "./types";
import type { InvoiceStatus } from "./invoice";

export function invoiceTone(status: InvoiceStatus) {
  if (status === "pagada") return "success" as const;
  if (status === "enviada") return "info" as const;
  if (status === "vencida") return "danger" as const;
  return "muted" as const;
}

export function invoiceLabel(status: InvoiceStatus) {
  return status[0].toUpperCase() + status.slice(1);
}

export function documentKindLabel(kind: string) {
  const map: Record<string, string> = {
    cotizacion: "Cotización",
    factura: "Factura",
    boleta: "Boleta",
    nota_credito: "Nota de crédito",
    nota_debito: "Nota de débito",
  };
  return map[kind] ?? "Factura";
}

export function eventLabel(kind: string) {
  const map: Record<string, string> = {
    created: "Creado",
    sent: "Enviado",
    viewed: "Visto por el cliente",
    paid: "Pagado",
    reminder: "Recordatorio",
    converted: "Convertido a factura",
    credited: "Nota de crédito",
    duplicated: "Duplicado",
    reconciled: "Conciliado",
    sii_sent: "Enviado al SII",
    sii_accepted: "Aceptado por el SII",
    sii_rejected: "Rechazado por el SII",
  };
  return map[kind] ?? kind;
}

export function siiTone(status?: string) {
  if (status === "aceptado") return "success" as const;
  if (status === "enviado") return "info" as const;
  if (status === "rechazado" || status === "anulado") return "danger" as const;
  if (status === "pendiente") return "warning" as const;
  return "muted" as const;
}

export function siiLabel(status?: string) {
  const map: Record<string, string> = {
    pendiente: "Pendiente SII",
    enviado: "Enviado SII",
    aceptado: "Aceptada SII",
    rechazado: "Rechazada SII",
    anulado: "Anulada",
  };
  return status ? map[status] ?? status : "Sin timbrar";
}

export function employeeTone(status: string) {
  if (status === "activo") return "success" as const;
  if (status === "vacaciones") return "info" as const;
  if (status === "licencia") return "warning" as const;
  return "muted" as const;
}

export function attendanceLabel(status: AttendanceStatus) {
  const map: Record<AttendanceStatus, string> = {
    presente: "Presente",
    ausente: "Ausente",
    atraso: "Atraso",
    permiso: "Permiso",
    vacaciones: "Vacaciones",
  };
  return map[status];
}

export const CHART = {
  accent: "var(--foreground)",
  amber: "var(--orbix-secondary)",
  sky: "var(--orbix-muted)",
  green: "var(--orbix-faint)",
  violet: "var(--muted-foreground)",
  rose: "var(--orbix-faint)",
  grid: "color-mix(in srgb, var(--foreground) 8%, transparent)",
  axis: "var(--orbix-muted)",
};

export const MONTH_LABELS: Record<string, string> = {
  "01": "Ene",
  "02": "Feb",
  "03": "Mar",
  "04": "Abr",
  "05": "May",
  "06": "Jun",
  "07": "Jul",
  "08": "Ago",
  "09": "Sep",
  "10": "Oct",
  "11": "Nov",
  "12": "Dic",
};
