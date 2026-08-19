import { describe, expect, it } from "vitest";
import { createEmptyState } from "@/lib/seed";
import { OrbWorkspace } from "./engine";
import { applyMutations } from "./mutations";
import { compactWorkspace } from "./snapshot";
import { mapInvoiceRows } from "./spreadsheet";

const company = {
  id: "co-1",
  name: "Andes SpA",
  rut: "76.543.210-3",
  giro: "Software",
  address: "Apoquindo 1",
  city: "Santiago",
  region: "RM",
  phone: "",
  email: "hola@andes.cl",
  ivaRate: 0.19,
  logoColor: "#aaa",
  bank: "Chile",
  account: "1",
};

function office() {
  const state = createEmptyState({
    companies: [company],
    activeCompanyId: "co-1",
  });
  return new OrbWorkspace(compactWorkspace(state, "2026-08-19"));
}

describe("OrbWorkspace", () => {
  it("creates a client and a factura with folio and IVA", () => {
    const ws = office();
    const created = ws.createDocument({
      clientName: "Mercado Norte",
      kind: "factura",
      items: [{ description: "Licencia anual", quantity: 1, unitPrice: 1_000_000 }],
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(created.summary).toContain("F-0001");
    expect(created.summary).toContain("$1.190.000");
    expect(created.href).toMatch(/^\/facturacion\//);
    expect(created.mutations?.some((item) => item.type === "upsertInvoice")).toBe(true);
    expect(created.mutations?.some((item) => item.type === "upsertClient")).toBe(true);
  });

  it("applies mutations into app state", () => {
    const ws = office();
    const created = ws.createDocument({
      clientName: "Puerto Austral",
      items: [{ description: "Flete", quantity: 2, unitPrice: 50_000 }],
    });
    if (!created.ok || !created.mutations) throw new Error("expected mutations");
    const next = applyMutations(
      createEmptyState({ companies: [company], activeCompanyId: "co-1" }),
      created.mutations,
    );
    expect(next.clients).toHaveLength(1);
    expect(next.invoices).toHaveLength(1);
    expect(next.invoices[0].number).toBe("F-0001");
  });

  it("emits a factura to the SII sandbox", async () => {
    const ws = office();
    ws.createClient({
      name: "Mercado Norte SpA",
      rut: "76.334.118-6",
      giro: "Comercio",
      address: "Independencia 1",
      city: "Santiago",
    });
    const created = ws.createDocument({
      clientName: "Mercado Norte SpA",
      kind: "factura",
      items: [{ description: "Licencia anual", quantity: 1, unitPrice: 1_000_000 }],
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    const invoiceMut = created.mutations?.find((item) => item.type === "upsertInvoice");
    if (invoiceMut?.type !== "upsertInvoice") throw new Error("expected invoice");
    const emitted = await ws.emitDocument(invoiceMut.invoice.number);
    expect(emitted.ok).toBe(true);
    if (!emitted.ok) return;
    expect(emitted.summary).toContain("folio 1");
    expect(emitted.summary).toContain("sandbox");
  });

  it("maps spreadsheet invoice rows", () => {
    const rows = mapInvoiceRows(
      [
        {
          Cliente: "Bosque Austral",
          RUT: "76.111.222-3",
          Descripción: "Mantención",
          Total: "800.000",
        },
      ],
      "2026-08-19",
    );
    expect(rows).toEqual([
      expect.objectContaining({
        clientName: "Bosque Austral",
        unitPrice: 800_000,
        description: "Mantención",
      }),
    ]);
  });

  it("creates a notification", () => {
    const ws = office();
    const note = ws.notifyUser({
      title: "Cobranza",
      body: "Hay 2 facturas vencidas",
      href: "/facturacion/cobranza",
    });
    expect(note.ok).toBe(true);
    if (!note.ok) return;
    expect(note.mutation?.type).toBe("addNotification");
  });
});
