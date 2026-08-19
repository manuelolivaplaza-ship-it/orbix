import { documentKind } from "@/lib/invoice";
import { formatRut, GENERIC_BOLETA_RUT, isValidRut } from "@/lib/rut";
import type { Client, Company, Invoice } from "@/lib/types";
import { allocateFolio, resolveDteType, type SiiSettings } from "./dte";
import { emitOpenFactura } from "./openfactura";
import { collectEmitIssues, type EmitIssue } from "./validate";
import { buildDteXml } from "./xml";

export type EmitOk = {
  ok: true;
  invoice: Invoice;
  settings: SiiSettings;
  xml: string;
  trackId: string;
  folio: number;
  dteType: number;
  provider: "sandbox" | "openfactura";
};

export type EmitErr = {
  ok: false;
  issues: EmitIssue[];
  message: string;
};

export type EmitResult = EmitOk | EmitErr;

function stamp(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

function withReceptorRut(client: Client, dteType: number): Client {
  if (client.rut.trim() && isValidRut(client.rut)) {
    return { ...client, rut: formatRut(client.rut) };
  }
  if (dteType === 39 || dteType === 41) {
    return { ...client, rut: formatRut(GENERIC_BOLETA_RUT) };
  }
  return client;
}

export async function emitDte(input: {
  company: Company;
  client: Client;
  invoice: Invoice;
  settings: SiiSettings;
}): Promise<EmitResult> {
  const issues = collectEmitIssues(input);
  if (issues.length) {
    return { ok: false, issues, message: issues[0]?.message ?? "No se puede emitir el DTE." };
  }

  const kind = documentKind(input.invoice);
  const dteType = resolveDteType(kind, input.invoice.taxRate);
  if (!dteType) {
    return {
      ok: false,
      issues: [{ field: "kind", message: "Este documento no es un DTE." }],
      message: "Este documento no es un DTE.",
    };
  }

  const client = withReceptorRut(input.client, dteType);
  let folio = input.invoice.folio;
  let settings = input.settings;
  if (!folio) {
    const allocated = allocateFolio(settings, dteType);
    if (!allocated.ok) {
      return {
        ok: false,
        issues: [{ field: "folio", message: allocated.message }],
        message: allocated.message,
      };
    }
    folio = allocated.folio;
    settings = allocated.settings;
  }

  const issuedAt = stamp();
  const build = {
    company: { ...input.company, rut: formatRut(input.company.rut) },
    client,
    invoice: input.invoice,
    dteType,
    folio,
    issuedAt,
  };
  const xml = buildDteXml(build);

  if (settings.provider === "openfactura") {
    const remote = await emitOpenFactura(build, settings.apiKey ?? "", settings.environment);
    if (!remote.ok) {
      return {
        ok: false,
        issues: [{ field: "openfactura", message: remote.message }],
        message: remote.message,
      };
    }
    folio = remote.folio;
    const invoice: Invoice = {
      ...input.invoice,
      folio,
      dteType,
      number: input.invoice.number,
      status: input.invoice.status === "borrador" ? "enviada" : input.invoice.status,
      sentAt: input.invoice.sentAt ?? issuedAt.slice(0, 10),
      siiStatus: "aceptado",
      siiTrackId: remote.trackId,
      siiXml: remote.xml ?? xml,
      siiError: undefined,
      siiIssuedAt: issuedAt,
    };
    return {
      ok: true,
      invoice,
      settings: { ...settings, connected: true, lastError: undefined, lastTestAt: issuedAt },
      xml: invoice.siiXml ?? xml,
      trackId: remote.trackId,
      folio,
      dteType,
      provider: "openfactura",
    };
  }

  const trackId = `SANDBOX-${dteType}-${folio}`;
  const invoice: Invoice = {
    ...input.invoice,
    folio,
    dteType,
    status: input.invoice.status === "borrador" ? "enviada" : input.invoice.status,
    sentAt: input.invoice.sentAt ?? issuedAt.slice(0, 10),
    siiStatus: "aceptado",
    siiTrackId: trackId,
    siiXml: xml,
    siiError: undefined,
    siiIssuedAt: issuedAt,
  };
  return {
    ok: true,
    invoice,
    settings: { ...settings, connected: true, lastError: undefined, lastTestAt: issuedAt },
    xml,
    trackId,
    folio,
    dteType,
    provider: "sandbox",
  };
}

export function isInvoiceLocked(invoice: Pick<Invoice, "siiStatus">): boolean {
  return invoice.siiStatus === "aceptado" || invoice.siiStatus === "enviado";
}
