import {
  agingSummary,
  cashBalance,
  inboxTasks,
  invoiceTotal,
  payablesOpen,
  receivables,
  collectedRevenue,
} from "@/lib/finance";
import { formatCLP } from "@/lib/format";
import {
  computeInvoiceTotals,
  DEFAULT_IVA_RATE,
  documentKind,
  isInvoiceStatus,
  nextDocumentNumber,
  type DocumentKind,
  type InvoiceStatus,
} from "@/lib/invoice";
import { computeLiquidacion, defaultExtrasForSalary } from "@/lib/payroll";
import type {
  Attendance,
  Client,
  Employee,
  Invoice,
  InvoiceItem,
  LiquidacionRecord,
  Notification,
  Vacation,
} from "@/lib/types";
import { uid } from "./ids";
import { addDaysISO } from "./money";
import { documentHref, type AgentMutation, type ToolResult } from "./mutations";
import {
  detectSheetMode,
  mapClientRows,
  mapInvoiceRows,
  type ChatAttachment,
} from "./spreadsheet";
import type { CompactInvoice, WorkspaceSnapshot } from "./snapshot";

const KIND_ALIASES: Record<string, DocumentKind> = {
  factura: "factura",
  invoice: "factura",
  cotizacion: "cotizacion",
  cotización: "cotizacion",
  quote: "cotizacion",
  boleta: "boleta",
  nota_credito: "nota_credito",
  "nota de credito": "nota_credito",
  "nota de crédito": "nota_credito",
  nota_debito: "nota_debito",
};

function digits(value: string) {
  return value.replace(/[^0-9kK]/g, "").toUpperCase();
}

function norm(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export class OrbWorkspace {
  today: string;
  period: string;
  snapshot: WorkspaceSnapshot;
  attachments: ChatAttachment[];

  constructor(snapshot: WorkspaceSnapshot, attachments: ChatAttachment[] = []) {
    this.snapshot = {
      ...snapshot,
      clients: snapshot.clients.map((item) => ({ ...item })),
      invoices: snapshot.invoices.map((item) => ({ ...item, items: item.items.map((line) => ({ ...line })) })),
      employees: snapshot.employees.map((item) => ({ ...item })),
      liquidaciones: snapshot.liquidaciones.map((item) => ({ ...item })),
      attendance: snapshot.attendance.map((item) => ({ ...item })),
      vacations: snapshot.vacations.map((item) => ({ ...item })),
      notifications: snapshot.notifications.map((item) => ({ ...item })),
      bankTxs: snapshot.bankTxs.map((item) => ({ ...item })),
      payables: snapshot.payables.map((item) => ({ ...item })),
      contracts: snapshot.contracts.map((item) => ({ ...item })),
    };
    this.today = snapshot.today;
    this.period = snapshot.period || snapshot.today.slice(0, 7);
    this.attachments = attachments;
  }

  briefing(): string {
    const company = this.snapshot.company;
    const invoices = this.snapshot.invoices as Invoice[];
    const overdue = inboxTasks({
      invoices,
      clients: this.snapshot.clients,
      employees: this.snapshot.employees,
      liquidaciones: this.snapshot.liquidaciones,
      vacations: this.snapshot.vacations,
      bankTxs: this.snapshot.bankTxs,
      payables: this.snapshot.payables,
      period: this.period,
      today: this.today,
    }).filter((task) => task.kind === "cobranza" && task.urgency !== "info");
    const files = this.attachments.map((file) => {
      if (file.kind === "spreadsheet") {
        const sheets = (file.sheets ?? [])
          .map((sheet) => `${sheet.name} (${sheet.rows.length} filas)`)
          .join(", ");
        return `${file.name}: ${sheets || "sin filas"}`;
      }
      return file.name;
    });
    return [
      `Empresa activa: ${company ? `${company.name} · RUT ${company.rut} · IVA ${Math.round(company.ivaRate * 100)}%` : "ninguna"}`,
      `Hoy: ${this.today}`,
      `Clientes: ${this.snapshot.clients.length} · Documentos: ${this.snapshot.invoices.length} · Equipo: ${this.snapshot.employees.length}`,
      `Cobranza vencida: ${overdue.length} avisos`,
      files.length ? `Adjuntos de este turno: ${files.join(" · ")}` : "Sin adjuntos en este turno.",
    ].join("\n");
  }

  private companyId() {
    return this.snapshot.company?.id ?? "";
  }

  private requireCompany(): ToolResult | null {
    if (!this.snapshot.company) {
      return { ok: false, summary: "No hay una empresa activa." };
    }
    return null;
  }

  overview() {
    const invoices = this.snapshot.invoices as Invoice[];
    const aging = agingSummary(invoices, this.today);
    const inbox = inboxTasks({
      invoices,
      clients: this.snapshot.clients,
      employees: this.snapshot.employees,
      liquidaciones: this.snapshot.liquidaciones,
      vacations: this.snapshot.vacations,
      bankTxs: this.snapshot.bankTxs,
      payables: this.snapshot.payables,
      period: this.period,
      today: this.today,
    });
    return {
      ok: true as const,
      company: this.snapshot.company?.name ?? null,
      today: this.today,
      collected: formatCLP(collectedRevenue(invoices)),
      receivables: formatCLP(receivables(invoices)),
      cash: formatCLP(cashBalance(this.snapshot.bankTxs)),
      payables: formatCLP(payablesOpen(this.snapshot.payables)),
      aging: Object.fromEntries(
        Object.entries(aging).map(([key, value]) => [
          key,
          { count: value.count, amount: formatCLP(value.amount) },
        ]),
      ),
      inbox: inbox.slice(0, 12).map((task) => ({
        title: task.title,
        detail: task.detail,
        amount: task.amount != null ? formatCLP(task.amount) : undefined,
        urgency: task.urgency,
        href: task.href,
      })),
      counts: {
        clients: this.snapshot.clients.length,
        invoices: this.snapshot.invoices.length,
        employees: this.snapshot.employees.length,
      },
    };
  }

  findClient(query: string): Client | undefined {
    const q = norm(query);
    const d = digits(query);
    return this.snapshot.clients.find((client) => {
      if (d.length >= 6 && digits(client.rut) === d) return true;
      const name = norm(client.name);
      return name === q || name.includes(q) || q.includes(name);
    });
  }

  listClients(query?: string) {
    const q = query ? norm(query) : "";
    const rows = this.snapshot.clients
      .filter((client) => !q || norm(client.name).includes(q) || digits(client.rut).includes(digits(q)))
      .slice(0, 30)
      .map((client) => ({
        id: client.id,
        name: client.name,
        rut: client.rut,
        email: client.email,
        city: client.city,
      }));
    return { ok: true as const, count: rows.length, clients: rows };
  }

  searchDocuments(input: {
    query?: string;
    status?: string;
    kind?: string;
    overdue?: boolean;
  }) {
    const q = input.query ? norm(input.query) : "";
    const kind = input.kind ? KIND_ALIASES[norm(input.kind)] : undefined;
    const rows = (this.snapshot.invoices as Invoice[])
      .filter((invoice) => {
        if (input.status && invoice.status !== input.status) return false;
        if (kind && documentKind(invoice) !== kind) return false;
        if (input.overdue && !(invoice.status === "vencida" || (invoice.status === "enviada" && invoice.dueDate < this.today))) {
          return false;
        }
        if (!q) return true;
        const client = this.snapshot.clients.find((item) => item.id === invoice.clientId);
        return (
          norm(invoice.number).includes(q) ||
          norm(invoice.notes).includes(q) ||
          (client && norm(client.name).includes(q))
        );
      })
      .slice(0, 25)
      .map((invoice) => this.serializeInvoice(invoice));
    return { ok: true as const, count: rows.length, documents: rows };
  }

  getDocument(idOrNumber: string) {
    const invoice = this.snapshot.invoices.find(
      (item) => item.id === idOrNumber || item.number.toLowerCase() === idOrNumber.toLowerCase(),
    );
    if (!invoice) return { ok: false as const, summary: `No encontré el documento ${idOrNumber}.` };
    return { ok: true as const, document: this.serializeInvoice(invoice as Invoice) };
  }

  listTeam(query?: string) {
    const q = query ? norm(query) : "";
    const rows = this.snapshot.employees
      .filter((employee) => {
        if (!q) return true;
        const name = norm(`${employee.firstName} ${employee.lastName}`);
        return name.includes(q) || norm(employee.cargo).includes(q);
      })
      .slice(0, 40)
      .map((employee) => ({
        id: employee.id,
        name: `${employee.firstName} ${employee.lastName}`,
        cargo: employee.cargo,
        estado: employee.estado,
        sueldoBase: formatCLP(employee.sueldoBase),
        email: employee.email,
      }));
    return { ok: true as const, count: rows.length, employees: rows };
  }

  cashPosition() {
    return {
      ok: true as const,
      cash: formatCLP(cashBalance(this.snapshot.bankTxs)),
      payables: formatCLP(payablesOpen(this.snapshot.payables)),
      bankMoves: this.snapshot.bankTxs.slice(0, 12).map((tx) => ({
        id: tx.id,
        date: tx.date,
        description: tx.description,
        amount: formatCLP(tx.amount),
        matched: tx.matchedInvoiceId ?? null,
      })),
      openPayables: this.snapshot.payables
        .filter((item) => item.status === "pendiente")
        .slice(0, 12)
        .map((item) => ({
          id: item.id,
          vendor: item.vendor,
          concept: item.concept,
          dueDate: item.dueDate,
          amount: formatCLP(item.amount),
        })),
    };
  }

  listAttachments() {
    return {
      ok: true as const,
      files: this.attachments.map((file) => ({
        name: file.name,
        kind: file.kind,
        size: file.size,
        sheets: file.sheets?.map((sheet) => ({
          name: sheet.name,
          headers: sheet.headers,
          rows: sheet.rows.length,
          preview: sheet.rows.slice(0, 5),
        })),
        textPreview: file.text?.slice(0, 800),
      })),
    };
  }

  createClient(input: {
    name: string;
    rut?: string;
    email?: string;
    phone?: string;
    giro?: string;
    address?: string;
    city?: string;
  }): ToolResult {
    const blocked = this.requireCompany();
    if (blocked) return blocked;
    const existing = input.rut ? this.findClient(input.rut) : this.findClient(input.name);
    if (existing) {
      return {
        ok: true,
        summary: `El cliente ${existing.name} ya existía.`,
        href: "/facturacion/clientes",
      };
    }
    const client: Client = {
      id: uid("cli"),
      companyId: this.companyId(),
      name: input.name.trim(),
      rut: input.rut?.trim() || "",
      giro: input.giro?.trim() || "",
      email: input.email?.trim() || "",
      phone: input.phone?.trim() || "",
      address: input.address?.trim() || "",
      city: input.city?.trim() || "",
    };
    this.snapshot.clients.unshift(client);
    return {
      ok: true,
      summary: `Cliente ${client.name} creado.`,
      href: "/facturacion/clientes",
      mutation: { type: "upsertClient", client },
    };
  }

  createDocument(input: {
    clientName?: string;
    clientId?: string;
    kind?: string;
    status?: string;
    issueDate?: string;
    dueDate?: string;
    notes?: string;
    items: Array<{ description: string; quantity: number; unitPrice: number }>;
  }): ToolResult {
    const blocked = this.requireCompany();
    if (blocked) return blocked;
    if (!input.items?.length) return { ok: false, summary: "La factura necesita al menos un ítem." };
    let client =
      (input.clientId && this.snapshot.clients.find((item) => item.id === input.clientId)) ||
      (input.clientName ? this.findClient(input.clientName) : undefined);
    const mutations: AgentMutation[] = [];
    if (!client && input.clientName) {
      const created = this.createClient({ name: input.clientName });
      if (created.ok && created.mutation?.type === "upsertClient") {
        client = created.mutation.client;
        mutations.push(created.mutation);
      }
    }
    if (!client) return { ok: false, summary: "Indica el cliente (nombre o RUT)." };

    const kind = KIND_ALIASES[norm(input.kind ?? "factura")] ?? "factura";
    const status: InvoiceStatus = isInvoiceStatus(input.status ?? "")
      ? (input.status as InvoiceStatus)
      : "borrador";
    const issueDate = input.issueDate || this.today;
    const dueDate = input.dueDate || addDaysISO(issueDate, 30);
    const items: InvoiceItem[] = input.items.map((item) => ({
      id: uid("it"),
      description: item.description,
      quantity: item.quantity,
      unitPrice: Math.round(item.unitPrice),
    }));
    const taxRate = this.snapshot.company?.ivaRate ?? DEFAULT_IVA_RATE;
    const totals = computeInvoiceTotals(items, taxRate);
    const number = nextDocumentNumber(
      this.snapshot.invoices.map((invoice) => invoice.number),
      kind,
    );
    const invoice: Invoice = {
      id: uid("inv"),
      number,
      companyId: this.companyId(),
      clientId: client.id,
      status,
      issueDate,
      dueDate,
      items,
      taxRate,
      notes: input.notes ?? "",
      kind,
      portalToken: uid("pt"),
      reminderCount: 0,
      sentAt: status !== "borrador" ? this.today : undefined,
      paidAt: status === "pagada" ? this.today : undefined,
    };
    this.snapshot.invoices.unshift(invoice);
    mutations.push({ type: "upsertInvoice", invoice });
    mutations.push({
      type: "addActivity",
      activity: {
        id: uid("ac"),
        companyId: invoice.companyId,
        title: `${invoice.number} creado`,
        detail: `${client.name} · ${formatCLP(totals.total)}`,
        time: "Ahora",
        kind: "invoice",
      },
    });
    return {
      ok: true,
      summary: `${labelKind(kind)} ${invoice.number} para ${client.name}: neto ${formatCLP(totals.neto)}, IVA ${formatCLP(totals.iva)}, total ${formatCLP(totals.total)} (${status}).`,
      href: documentHref(invoice),
      mutations,
    };
  }

  setDocumentStatus(idOrNumber: string, status: string): ToolResult {
    if (!isInvoiceStatus(status)) return { ok: false, summary: "Estado inválido." };
    const invoice = this.snapshot.invoices.find(
      (item) => item.id === idOrNumber || item.number.toLowerCase() === idOrNumber.toLowerCase(),
    );
    if (!invoice) return { ok: false, summary: `No encontré ${idOrNumber}.` };
    invoice.status = status;
    if (status === "pagada") invoice.paidAt = this.today;
    if (status === "enviada") invoice.sentAt = invoice.sentAt ?? this.today;
    return {
      ok: true,
      summary: `${invoice.number} quedó en ${status}.`,
      href: documentHref(invoice),
      mutation: { type: "setInvoiceStatus", id: invoice.id, status },
    };
  }

  sendReminder(idOrNumber: string): ToolResult {
    const invoice = this.snapshot.invoices.find(
      (item) => item.id === idOrNumber || item.number.toLowerCase() === idOrNumber.toLowerCase(),
    );
    if (!invoice) return { ok: false, summary: `No encontré ${idOrNumber}.` };
    invoice.reminderCount = (invoice.reminderCount ?? 0) + 1;
    invoice.reminderSentAt = this.today;
    const client = this.snapshot.clients.find((item) => item.id === invoice.clientId);
    const notification: Notification = {
      id: uid("nt"),
      title: `Recordatorio ${invoice.number}`,
      body: `Cobranza a ${client?.name ?? "cliente"} por ${formatCLP(invoiceTotal(invoice as Invoice))}.`,
      time: "Ahora",
      read: false,
      href: documentHref(invoice),
    };
    this.snapshot.notifications.unshift(notification);
    return {
      ok: true,
      summary: `Recordatorio enviado para ${invoice.number} (${client?.name ?? "cliente"}).`,
      href: documentHref(invoice),
      mutations: [
        { type: "sendReminder", id: invoice.id, at: this.today },
        { type: "addNotification", notification },
      ],
    };
  }

  notifyUser(input: { title: string; body: string; href?: string }): ToolResult {
    const notification: Notification = {
      id: uid("nt"),
      title: input.title,
      body: input.body,
      time: "Ahora",
      read: false,
      href: input.href || "/dashboard",
    };
    this.snapshot.notifications.unshift(notification);
    return {
      ok: true,
      summary: `Aviso creado: ${input.title}.`,
      mutation: { type: "addNotification", notification },
    };
  }

  createEmployee(input: {
    firstName: string;
    lastName: string;
    rut?: string;
    email?: string;
    cargo?: string;
    sueldoBase: number;
    departamento?: string;
  }): ToolResult {
    const blocked = this.requireCompany();
    if (blocked) return blocked;
    const employee: Employee = {
      id: uid("emp"),
      companyId: this.companyId(),
      firstName: input.firstName,
      lastName: input.lastName,
      rut: input.rut ?? "",
      email: input.email ?? "",
      phone: "",
      cargo: input.cargo ?? "Colaborador",
      departamento: input.departamento ?? "General",
      sueldoBase: Math.round(input.sueldoBase),
      afp: "Habitat",
      salud: "Fonasa",
      estado: "activo",
      fechaIngreso: this.today,
      banco: "",
      cuenta: "",
      color: "#a3a3a3",
    };
    this.snapshot.employees.unshift(employee);
    return {
      ok: true,
      summary: `Ficha de ${employee.firstName} ${employee.lastName} creada.`,
      href: "/sueldos",
      mutation: { type: "upsertEmployee", employee },
    };
  }

  generatePayslip(input: { employeeName: string; period?: string }): ToolResult {
    const employee = this.snapshot.employees.find((item) => {
      const name = norm(`${item.firstName} ${item.lastName}`);
      return name.includes(norm(input.employeeName)) || item.id === input.employeeName;
    });
    if (!employee) return { ok: false, summary: `No encontré a ${input.employeeName}.` };
    const period = input.period || this.period;
    if (this.snapshot.liquidaciones.some((item) => item.employeeId === employee.id && item.period === period)) {
      return { ok: false, summary: `Ya existe liquidación de ${period} para ${employee.firstName}.` };
    }
    const extras = defaultExtrasForSalary(employee.sueldoBase);
    const breakdown = computeLiquidacion({ sueldoBase: employee.sueldoBase, ...extras });
    const record: LiquidacionRecord = {
      id: uid("liq"),
      employeeId: employee.id,
      companyId: employee.companyId,
      period,
      createdAt: this.today,
      haberes: breakdown.haberes,
      descuentos: breakdown.descuentos,
      totalHaberes: breakdown.totalHaberes,
      totalDescuentos: breakdown.totalDescuentos,
      liquido: breakdown.liquido,
    };
    this.snapshot.liquidaciones.unshift(record);
    return {
      ok: true,
      summary: `Liquidación ${period} de ${employee.firstName} ${employee.lastName}: líquido ${formatCLP(record.liquido)}.`,
      href: "/sueldos/liquidaciones",
      mutation: { type: "upsertLiquidacion", record },
    };
  }

  matchBank(txId: string, invoiceIdOrNumber: string | null): ToolResult {
    const tx = this.snapshot.bankTxs.find((item) => item.id === txId);
    if (!tx) return { ok: false, summary: "Movimiento no encontrado." };
    let invoiceId: string | null = null;
    if (invoiceIdOrNumber) {
      const invoice = this.snapshot.invoices.find(
        (item) =>
          item.id === invoiceIdOrNumber ||
          item.number.toLowerCase() === invoiceIdOrNumber.toLowerCase(),
      );
      if (!invoice) return { ok: false, summary: "Documento no encontrado para conciliar." };
      invoiceId = invoice.id;
      invoice.status = "pagada";
      invoice.paidAt = this.today;
    }
    tx.matchedInvoiceId = invoiceId;
    return {
      ok: true,
      summary: invoiceId ? "Movimiento conciliado." : "Conciliación deshecha.",
      mutation: { type: "matchBankTx", txId: tx.id, invoiceId },
    };
  }

  markPayable(id: string): ToolResult {
    const payable = this.snapshot.payables.find((item) => item.id === id);
    if (!payable) return { ok: false, summary: "Pago no encontrado." };
    payable.status = "pagada";
    return {
      ok: true,
      summary: `Marcado pagado: ${payable.vendor} · ${payable.concept}.`,
      mutation: { type: "markPayablePaid", id },
    };
  }

  setAttendance(input: {
    employeeName: string;
    date?: string;
    status: Attendance["status"];
    hours?: number;
  }): ToolResult {
    const employee = this.snapshot.employees.find((item) =>
      norm(`${item.firstName} ${item.lastName}`).includes(norm(input.employeeName)),
    );
    if (!employee) return { ok: false, summary: `No encontré a ${input.employeeName}.` };
    const row: Attendance = {
      id: uid("att"),
      employeeId: employee.id,
      companyId: employee.companyId,
      date: input.date || this.today,
      status: input.status,
      hours: input.hours ?? 9,
    };
    this.snapshot.attendance.unshift(row);
    return {
      ok: true,
      summary: `Asistencia de ${employee.firstName}: ${row.status} el ${row.date}.`,
      href: "/sueldos/asistencia",
      mutation: { type: "setAttendance", row },
    };
  }

  requestVacation(input: {
    employeeName: string;
    start: string;
    end: string;
    days: number;
  }): ToolResult {
    const employee = this.snapshot.employees.find((item) =>
      norm(`${item.firstName} ${item.lastName}`).includes(norm(input.employeeName)),
    );
    if (!employee) return { ok: false, summary: `No encontré a ${input.employeeName}.` };
    const vacation: Vacation = {
      id: uid("vac"),
      employeeId: employee.id,
      companyId: employee.companyId,
      start: input.start,
      end: input.end,
      days: input.days,
      status: "pendiente",
    };
    this.snapshot.vacations.unshift(vacation);
    return {
      ok: true,
      summary: `Solicitud de vacaciones para ${employee.firstName} (${input.days} días).`,
      href: "/sueldos/calendario",
      mutation: { type: "upsertVacation", vacation },
    };
  }

  importSpreadsheet(input: {
    fileName?: string;
    sheet?: string;
    mode?: "auto" | "invoices" | "clients";
    status?: string;
    limit?: number;
  }): ToolResult {
    const file =
      (input.fileName &&
        this.attachments.find((item) => norm(item.name).includes(norm(input.fileName!)))) ||
      this.attachments.find((item) => item.kind === "spreadsheet");
    if (!file || !file.sheets?.length) {
      return { ok: false, summary: "No hay un Excel o CSV adjunto para importar." };
    }
    const sheet =
      (input.sheet && file.sheets.find((item) => norm(item.name) === norm(input.sheet!))) ||
      file.sheets[0];
    const mode = input.mode && input.mode !== "auto" ? input.mode : detectSheetMode(sheet.headers);
    const cap = Math.min(input.limit ?? 80, 80);
    const mutations: AgentMutation[] = [];
    if (mode === "clients") {
      const rows = mapClientRows(sheet.rows).slice(0, cap);
      let created = 0;
      for (const row of rows) {
        const result = this.createClient(row);
        if (result.ok && result.mutation) {
          mutations.push(result.mutation);
          created += 1;
        }
      }
      return {
        ok: true,
        summary: `Importé ${created} clientes desde ${file.name}.`,
        href: "/facturacion/clientes",
        mutations,
      };
    }
    const rows = mapInvoiceRows(sheet.rows, this.today).slice(0, cap);
    if (!rows.length) {
      return {
        ok: false,
        summary: `No pude leer facturas en ${sheet.name}. Necesito columnas de cliente y monto/precio.`,
      };
    }
    let created = 0;
    const numbers: string[] = [];
    for (const row of rows) {
      const result = this.createDocument({
        clientName: row.clientName,
        kind: row.kind,
        status: input.status ?? "borrador",
        issueDate: row.issueDate,
        dueDate: row.dueDate || undefined,
        items: [
          {
            description: row.description,
            quantity: row.quantity,
            unitPrice: row.unitPrice,
          },
        ],
      });
      if (result.ok && result.mutations) {
        mutations.push(...result.mutations);
        created += 1;
        const invoiceMut = result.mutations.find((item) => item.type === "upsertInvoice");
        if (invoiceMut?.type === "upsertInvoice") numbers.push(invoiceMut.invoice.number);
      }
    }
    return {
      ok: true,
      summary: `Importé ${created} documentos desde ${file.name}${numbers.length ? `: ${numbers.slice(0, 8).join(", ")}` : ""}.`,
      href: "/facturacion",
      mutations,
    };
  }

  private serializeInvoice(invoice: Invoice | CompactInvoice) {
    const totals = computeInvoiceTotals(invoice.items, invoice.taxRate);
    const client = this.snapshot.clients.find((item) => item.id === invoice.clientId);
    return {
      id: invoice.id,
      number: invoice.number,
      kind: documentKind(invoice),
      status: invoice.status,
      client: client?.name ?? invoice.clientId,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      neto: formatCLP(totals.neto),
      iva: formatCLP(totals.iva),
      total: formatCLP(totals.total),
      notes: invoice.notes,
      href: documentHref(invoice),
      items: invoice.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: formatCLP(item.unitPrice),
      })),
    };
  }
}

function labelKind(kind: DocumentKind) {
  if (kind === "cotizacion") return "Cotización";
  if (kind === "boleta") return "Boleta";
  if (kind === "nota_credito") return "Nota de crédito";
  if (kind === "nota_debito") return "Nota de débito";
  return "Factura";
}
