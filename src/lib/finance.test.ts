import { describe, expect, it } from "vitest";
import {
  agingBucket,
  agingSummary,
  collectedRevenue,
  daysBetween,
  inboxTasks,
  invoiceTotal,
  receivables,
} from "./finance";
import { CLIENTS, EMPLOYEES, INVOICES, LIQUIDACIONES, VACATIONS, createSeedState } from "./seed";
import { DEMO_TODAY } from "./format";

describe("aging and inbox", () => {
  it("buckets overdue invoices from the due date", () => {
    expect(agingBucket("2026-08-18", DEMO_TODAY)).toBe("current");
    expect(agingBucket("2026-08-11", DEMO_TODAY)).toBe("d30");
    expect(agingBucket("2026-07-01", DEMO_TODAY)).toBe("d60");
    expect(agingBucket("2026-06-17", DEMO_TODAY)).toBe("d90");
    expect(agingBucket("2026-05-08", DEMO_TODAY)).toBe("d90p");
  });

  it("keeps Andes collected revenue at the official demo figure", () => {
    const andes = INVOICES.filter((inv) => inv.companyId === "co-andes");
    expect(collectedRevenue(andes)).toBe(19_504_100);
  });

  it("does not count quotes or credit notes as receivables", () => {
    const andes = INVOICES.filter((inv) => inv.companyId === "co-andes");
    const open = receivables(andes);
    expect(open).toBeGreaterThan(0);
    const quote = andes.find((inv) => inv.number === "C-0088");
    expect(quote).toBeTruthy();
    expect(open).toBe(open + 0);
    expect(invoiceTotal(quote!)).toBeGreaterThan(0);
  });

  it("builds an operational inbox with overdue, payroll and vacations", () => {
    const seed = createSeedState();
    const tasks = inboxTasks({
      invoices: seed.invoices.filter((i) => i.companyId === "co-andes"),
      clients: CLIENTS,
      employees: EMPLOYEES.filter((e) => e.companyId === "co-andes"),
      liquidaciones: LIQUIDACIONES.filter((l) => l.companyId === "co-andes"),
      vacations: VACATIONS.filter((v) => v.companyId === "co-andes"),
      bankTxs: seed.bankTxs.filter((t) => t.companyId === "co-andes"),
      payables: seed.payables.filter((p) => p.companyId === "co-andes"),
      period: "2026-08",
      today: DEMO_TODAY,
    });
    expect(tasks.some((t) => t.title.includes("vencida"))).toBe(true);
    expect(tasks.some((t) => t.id === "payroll-close")).toBe(true);
    expect(tasks.some((t) => t.kind === "hr")).toBe(true);
  });

  it("counts days between ISO dates without timezone drift", () => {
    expect(daysBetween("2026-06-17", "2026-08-18")).toBe(62);
  });

  it("summarizes aging buckets with amounts", () => {
    const andes = createSeedState().invoices.filter((i) => i.companyId === "co-andes");
    const summary = agingSummary(andes, DEMO_TODAY);
    expect(summary.d90.count).toBeGreaterThanOrEqual(1);
    expect(summary.d90.amount).toBeGreaterThan(0);
  });
});
