import { computeInvoiceTotals } from "@/lib/invoice";
import { siiRut } from "@/lib/rut";
import type { Client, Company, Invoice } from "@/lib/types";
import { paymentCode, type DteType } from "./dte";

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function clip(value: string, max: number): string {
  return value.trim().slice(0, max);
}

export type DteBuildInput = {
  company: Company;
  client: Client;
  invoice: Invoice;
  dteType: DteType;
  folio: number;
  issuedAt: string;
};

export function buildDteXml(input: DteBuildInput): string {
  const { company, client, invoice, dteType, folio, issuedAt } = input;
  const totals = computeInvoiceTotals(invoice.items, invoice.taxRate);
  const emisorRut = siiRut(company.rut);
  const receptorRut = siiRut(client.rut);
  const comunaEmisor = (company.comuna || company.city).trim();
  const comunaRecep = (client.comuna || client.city).trim();
  const id = `F${dteType}T${folio}`;
  const lines = invoice.items.filter((item) => item.description.trim() && item.quantity > 0);
  const detalle = lines
    .map((item, index) => {
      const monto = Math.round(item.quantity * item.unitPrice);
      return [
        `      <Detalle>`,
        `        <NroLinDet>${index + 1}</NroLinDet>`,
        `        <NmbItem>${esc(clip(item.description, 80))}</NmbItem>`,
        `        <QtyItem>${item.quantity}</QtyItem>`,
        `        <PrcItem>${Math.round(item.unitPrice)}</PrcItem>`,
        `        <MontoItem>${monto}</MontoItem>`,
        `      </Detalle>`,
      ].join("\n");
    })
    .join("\n");

  const ivaNode =
    invoice.taxRate > 0
      ? [
          `        <MntNeto>${totals.neto}</MntNeto>`,
          `        <TasaIVA>${Math.round(invoice.taxRate * 100)}</TasaIVA>`,
          `        <IVA>${totals.iva}</IVA>`,
        ].join("\n")
      : `        <MntExe>${totals.neto}</MntExe>`;

  const firstItem = clip(lines[0]?.description || "Item", 40);
  const tedStamp = `${invoice.issueDate}T12:00:00`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<DTE version="1.0">
  <Documento ID="${id}">
    <Encabezado>
      <IdDoc>
        <TipoDTE>${dteType}</TipoDTE>
        <Folio>${folio}</Folio>
        <FchEmis>${invoice.issueDate}</FchEmis>
        <FmaPago>${paymentCode(invoice.paymentMethod)}</FmaPago>
        <FchVenc>${invoice.dueDate}</FchVenc>
      </IdDoc>
      <Emisor>
        <RUTEmisor>${esc(emisorRut)}</RUTEmisor>
        <RznSoc>${esc(clip(company.name, 100))}</RznSoc>
        <GiroEmis>${esc(clip(company.giro, 80))}</GiroEmis>
        ${company.acteco ? `<Acteco>${esc(company.acteco.trim())}</Acteco>` : ""}
        <DirOrigen>${esc(clip(company.address, 70))}</DirOrigen>
        <CmnaOrigen>${esc(clip(comunaEmisor, 20))}</CmnaOrigen>
        <CiudadOrigen>${esc(clip(company.city || comunaEmisor, 20))}</CiudadOrigen>
      </Emisor>
      <Receptor>
        <RUTRecep>${esc(receptorRut)}</RUTRecep>
        <RznSocRecep>${esc(clip(client.name, 100))}</RznSocRecep>
        <GiroRecep>${esc(clip(client.giro || "Particular", 40))}</GiroRecep>
        <DirRecep>${esc(clip(client.address || comunaRecep || "Santiago", 70))}</DirRecep>
        <CmnaRecep>${esc(clip(comunaRecep || "Santiago", 20))}</CmnaRecep>
        <CiudadRecep>${esc(clip(client.city || comunaRecep || "Santiago", 20))}</CiudadRecep>
      </Receptor>
      <Totales>
${ivaNode}
        <MntTotal>${totals.total}</MntTotal>
      </Totales>
    </Encabezado>
${detalle}
    <TED version="1.0">
      <DD>
        <RE>${esc(emisorRut)}</RE>
        <TD>${dteType}</TD>
        <F>${folio}</F>
        <FE>${invoice.issueDate}</FE>
        <RR>${esc(receptorRut)}</RR>
        <RSR>${esc(clip(client.name.toUpperCase(), 40))}</RSR>
        <MNT>${totals.total}</MNT>
        <IT1>${esc(firstItem)}</IT1>
        <CAF version="1.0">
          <DA>
            <RE>${esc(emisorRut)}</RE>
            <RS>${esc(clip(company.name.toUpperCase(), 40))}</RS>
            <TD>${dteType}</TD>
            <RNG><D>1</D><H>1000</H></RNG>
            <FA>${invoice.issueDate}</FA>
            <RSAPK><M>ORBIXSANDBOX</M><E>AQAB</E></RSAPK>
            <IDK>100</IDK>
          </DA>
          <FRMA algoritmo="SHA1withRSA">ORBIX-SANDBOX-CAF</FRMA>
        </CAF>
        <TSTED>${tedStamp}</TSTED>
      </DD>
      <FRMT algoritmo="SHA1withRSA">ORBIX-SANDBOX-${id}-${issuedAt}</FRMT>
    </TED>
    <TmstFirma>${issuedAt}</TmstFirma>
  </Documento>
</DTE>
`.replace(/^\s*\n/gm, "");
}

export function buildOpenFacturaPayload(input: DteBuildInput) {
  const { company, client, invoice, dteType, folio } = input;
  const totals = computeInvoiceTotals(invoice.items, invoice.taxRate);
  const lines = invoice.items.filter((item) => item.description.trim() && item.quantity > 0);
  const encabezado: Record<string, unknown> = {
    IdDoc: {
      TipoDTE: dteType,
      Folio: folio,
      FchEmis: invoice.issueDate,
      FmaPago: paymentCode(invoice.paymentMethod),
      FchVenc: invoice.dueDate,
    },
    Emisor: {
      RUTEmisor: siiRut(company.rut),
      RznSoc: company.name.trim(),
      GiroEmis: company.giro.trim(),
      DirOrigen: company.address.trim(),
      CmnaOrigen: (company.comuna || company.city).trim(),
      ...(company.acteco ? { Acteco: Number(company.acteco) || company.acteco } : {}),
    },
    Receptor: {
      RUTRecep: siiRut(client.rut),
      RznSocRecep: client.name.trim(),
      GiroRecep: client.giro.trim() || "Particular",
      DirRecep: client.address.trim() || client.city || "Santiago",
      CmnaRecep: (client.comuna || client.city || "Santiago").trim(),
    },
    Totales:
      invoice.taxRate > 0
        ? {
            MntNeto: totals.neto,
            TasaIVA: Math.round(invoice.taxRate * 100),
            IVA: totals.iva,
            MntTotal: totals.total,
          }
        : {
            MntExe: totals.neto,
            MntTotal: totals.total,
          },
  };

  return {
    response: ["XML", "PDF"],
    dte: {
      Encabezado: encabezado,
      Detalle: lines.map((item, index) => ({
        NroLinDet: index + 1,
        NmbItem: item.description.trim().slice(0, 80),
        QtyItem: item.quantity,
        PrcItem: Math.round(item.unitPrice),
        MontoItem: Math.round(item.quantity * item.unitPrice),
      })),
    },
  };
}
