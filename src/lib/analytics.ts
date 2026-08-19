import { computeInvoiceTotals, isRevenueDocument } from "./invoice";
import type { Employee, Invoice } from "./types";

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function inRange(iso: string, from: string, to: string): boolean {
  return iso >= from && iso <= to;
}

export function invoiceRevenue(invoices: Invoice[], from?: string, to?: string) {
  return invoices
    .filter(isRevenueDocument)
    .filter((invoice) => !from || !to || inRange(invoice.issueDate, from, to))
    .reduce((sum, invoice) => sum + computeInvoiceTotals(invoice.items, invoice.taxRate).total, 0);
}

export function pendingInvoices(invoices: Invoice[]) {
  return invoices.filter((invoice) => invoice.status === "enviada" || invoice.status === "vencida");
}

export function monthlyBilling(invoices: Invoice[], months: string[]) {
  return months.map((month) => {
    const subset = invoices.filter((invoice) => monthKey(invoice.issueDate) === month);
    const total = subset.reduce(
      (sum, invoice) => sum + computeInvoiceTotals(invoice.items, invoice.taxRate).total,
      0,
    );
    const cobrado = subset
      .filter(isRevenueDocument)
      .reduce(
        (sum, invoice) => sum + computeInvoiceTotals(invoice.items, invoice.taxRate).total,
        0,
      );
    return { month, total, cobrado };
  });
}

export function incomeVsExpense(
  invoices: Invoice[],
  payrollCost: number[],
  months: string[],
) {
  return months.map((month, index) => {
    const ingresos = invoices
      .filter((invoice) => isRevenueDocument(invoice) && monthKey(invoice.issueDate) === month)
      .reduce(
        (sum, invoice) => sum + computeInvoiceTotals(invoice.items, invoice.taxRate).total,
        0,
      );
    return {
      month,
      ingresos,
      gastos: payrollCost[index] ?? 0,
    };
  });
}

export function costDistribution(employees: Employee[]) {
  const byDept = new Map<string, number>();
  for (const employee of employees) {
    byDept.set(
      employee.departamento,
      (byDept.get(employee.departamento) ?? 0) + employee.sueldoBase,
    );
  }
  return [...byDept.entries()].map(([name, value]) => ({ name, value }));
}

export function headcountByDept(employees: Employee[]) {
  const byDept = new Map<string, number>();
  for (const employee of employees) {
    if (employee.estado === "inactivo") continue;
    byDept.set(employee.departamento, (byDept.get(employee.departamento) ?? 0) + 1);
  }
  return [...byDept.entries()].map(([name, value]) => ({ name, value }));
}

export function lastMonths(count: number, from = new Date()): string[] {
  const result: string[] = [];
  const cursor = new Date(from.getFullYear(), from.getMonth(), 1);
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(cursor.getFullYear(), cursor.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    result.push(`${y}-${m}`);
  }
  return result;
}

export function monthLabel(key: string): string {
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const idx = Number(key.slice(5, 7)) - 1;
  return months[idx] ?? key;
}
