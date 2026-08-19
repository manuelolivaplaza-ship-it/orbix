import { describe, expect, it } from "vitest";
import { collectEmitIssues } from "./validate";
import { allocateFolio, defaultSiiSettings, resolveDteType } from "./dte";
import { emitDte } from "./emit";
import { buildDteXml } from "./xml";
import type { Client, Company, Invoice } from "@/lib/types";

const company: Company = {
  id: "co-1",
  name: "Andes Tecnología SpA",
  rut: "76.543.210-3",
  giro: "Desarrollo de software",
  address: "Av. Apoquindo 4501",
  city: "Las Condes",
  comuna: "Las Condes",
  region: "RM",
  phone: "+56 2 2945 1100",
  email: "hola@andes.cl",
  ivaRate: 0.19,
  logoColor: "#aaa",
  bank: "Chile",
  account: "1",
  acteco: "620200",
};

const client: Client = {
  id: "cli-1",
  companyId: "co-1",
  name: "Mercado Norte SpA",
  rut: "76.334.118-6",
  giro: "Comercio al por menor",
  email: "finanzas@mercadonorte.cl",
  phone: "",
  address: "Av. Independencia 1450",
  city: "Santiago",
  comuna: "Santiago",
};

function invoice(patch: Partial<Invoice> = {}): Invoice {
  return {
    id: "inv-1",
    number: "F-0001",
    companyId: "co-1",
    clientId: "cli-1",
    status: "borrador",
    issueDate: "2026-08-19",
    dueDate: "2026-09-18",
    items: [{ id: "it-1", description: "Licencia anual", quantity: 1, unitPrice: 1_000_000 }],
    taxRate: 0.19,
    notes: "",
    kind: "factura",
    paymentMethod: "credito",
    ...patch,
  };
}

describe("DTE types", () => {
  it("maps Chilean document kinds to SII codes", () => {
    expect(resolveDteType("factura", 0.19)).toBe(33);
    expect(resolveDteType("factura", 0)).toBe(34);
    expect(resolveDteType("boleta", 0.19)).toBe(39);
    expect(resolveDteType("boleta", 0)).toBe(41);
    expect(resolveDteType("nota_credito", 0.19)).toBe(61);
    expect(resolveDteType("cotizacion", 0.19)).toBeNull();
  });

  it("allocates sequential folios inside the CAF range", () => {
    const first = allocateFolio(defaultSiiSettings(), 33);
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(first.folio).toBe(1);
    const second = allocateFolio(first.settings, 33);
    expect(second.ok).toBe(true);
    if (!second.ok) return;
    expect(second.folio).toBe(2);
  });
});

describe("emit preflight", () => {
  it("blocks quotes and incomplete issuers", () => {
    const quote = collectEmitIssues({
      company,
      client,
      invoice: invoice({ kind: "cotizacion" }),
      settings: defaultSiiSettings(),
    });
    expect(quote.some((item) => item.field === "kind")).toBe(true);

    const badRut = collectEmitIssues({
      company: { ...company, rut: "76.543.210-K" },
      client,
      invoice: invoice(),
      settings: defaultSiiSettings(),
    });
    expect(badRut.some((item) => item.field === "rut")).toBe(true);
  });
});

describe("sandbox emit", () => {
  it("builds XML and accepts the DTE with a track id", async () => {
    const xml = buildDteXml({
      company,
      client,
      invoice: invoice(),
      dteType: 33,
      folio: 12,
      issuedAt: "2026-08-19T12:00:00Z",
    });
    expect(xml).toContain("<TipoDTE>33</TipoDTE>");
    expect(xml).toContain("<Folio>12</Folio>");
    expect(xml).toContain("<MntNeto>1000000</MntNeto>");
    expect(xml).toContain("<IVA>190000</IVA>");
    expect(xml).toContain("<MntTotal>1190000</MntTotal>");

    const result = await emitDte({
      company,
      client,
      invoice: invoice(),
      settings: defaultSiiSettings(),
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.provider).toBe("sandbox");
    expect(result.folio).toBe(1);
    expect(result.invoice.siiStatus).toBe("aceptado");
    expect(result.invoice.status).toBe("enviada");
    expect(result.trackId).toMatch(/^SANDBOX-33-1$/);
    expect(result.settings.folios[33]?.next).toBe(2);
  });
});
