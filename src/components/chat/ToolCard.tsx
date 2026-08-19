"use client";

import Link from "next/link";
import {
  Banknote,
  Bell,
  Check,
  FileSpreadsheet,
  FileText,
  Loader2,
  Users,
  Wallet,
} from "lucide-react";
import { getToolName, isToolUIPart, type UIMessage } from "ai";
import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = {
  getOfficeOverview: "Resumen",
  searchDocuments: "Documentos",
  getDocument: "Documento",
  listClients: "Clientes",
  listTeam: "Equipo",
  getCashPosition: "Caja",
  listAttachments: "Adjuntos",
  createClient: "Cliente",
  createDocument: "Documento",
  setDocumentStatus: "Estado",
  sendPaymentReminder: "Recordatorio",
  notifyUser: "Aviso",
  createEmployee: "Ficha",
  generatePayslip: "Liquidación",
  importSpreadsheet: "Excel",
  matchBankMovement: "Conciliación",
  markPayablePaid: "Pago",
  setAttendance: "Asistencia",
  requestTimeOff: "Vacaciones",
};

const ICONS: Record<string, typeof FileText> = {
  getOfficeOverview: Wallet,
  searchDocuments: FileText,
  getDocument: FileText,
  listClients: Users,
  listTeam: Users,
  getCashPosition: Banknote,
  listAttachments: FileSpreadsheet,
  createClient: Users,
  createDocument: FileText,
  setDocumentStatus: Check,
  sendPaymentReminder: Bell,
  notifyUser: Bell,
  createEmployee: Users,
  generatePayslip: Wallet,
  importSpreadsheet: FileSpreadsheet,
  matchBankMovement: Banknote,
  markPayablePaid: Banknote,
  setAttendance: Users,
  requestTimeOff: Users,
};

export function ToolCards({ message }: { message: UIMessage }) {
  const parts = message.parts.filter(isToolUIPart);
  if (!parts.length) return null;
  return (
    <div className="flex flex-col gap-1">
      {parts.map((part) => {
        const name = getToolName(part);
        const Icon = ICONS[name] ?? FileText;
        const label = LABELS[name] ?? name;
        const pending = part.state !== "output-available" && part.state !== "output-error";
        const output =
          part.state === "output-available" && part.output && typeof part.output === "object"
            ? (part.output as { summary?: string; href?: string; ok?: boolean })
            : null;
        return (
          <div
            key={part.toolCallId}
            className={cn(
              "rounded-md border border-sidebar-border/80 bg-sidebar-accent/40 px-2 py-1.5",
              output?.ok === false && "border-destructive/30",
            )}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-medium">
              {pending ? (
                <Loader2 className="size-3 animate-spin text-muted-foreground" />
              ) : (
                <Icon className="size-3 text-muted-foreground" />
              )}
              <span>{label}</span>
            </div>
            {output?.summary ? (
              <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                {output.summary}
              </p>
            ) : null}
            {output?.href ? (
              <Link
                href={output.href}
                className="mt-1 inline-block text-[11px] text-foreground underline-offset-2 hover:underline"
              >
                Abrir
              </Link>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
