import { describe, expect, it } from "vitest";
import { filterByCompany, selectActiveCompany, switchActiveCompany } from "./company";
import { COMPANIES, INVOICES } from "./seed";

describe("active company context", () => {
  it("selects the requested company and falls back to the first", () => {
    expect(selectActiveCompany(COMPANIES, "co-puerto")?.name).toBe("Puerto Austral Ltda");
    expect(selectActiveCompany(COMPANIES, "missing")?.id).toBe(COMPANIES[0].id);
    expect(selectActiveCompany(COMPANIES, null)?.id).toBe("co-andes");
    expect(selectActiveCompany([], "co-andes")).toBeNull();
  });

  it("only switches when the next id exists", () => {
    const ids = COMPANIES.map((c) => c.id);
    expect(switchActiveCompany("co-andes", "co-cordillera", ids)).toBe("co-cordillera");
    expect(switchActiveCompany("co-andes", "co-ghost", ids)).toBe("co-andes");
  });

  it("filters invoices by the active company", () => {
    const andes = filterByCompany(INVOICES, "co-andes");
    const puerto = filterByCompany(INVOICES, "co-puerto");
    expect(andes.every((inv) => inv.companyId === "co-andes")).toBe(true);
    expect(puerto.length).toBeGreaterThan(0);
    expect(andes.length + puerto.length).toBeLessThan(INVOICES.length + 1);
    expect(andes.some((inv) => inv.companyId === "co-puerto")).toBe(false);
  });
});
