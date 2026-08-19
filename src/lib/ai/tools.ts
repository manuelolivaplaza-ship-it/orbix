import { tool } from "ai";
import { z } from "zod";
import type { OrbWorkspace } from "./engine";

export function createOrbTools(workspace: OrbWorkspace) {
  return {
    getOfficeOverview: tool({
      description:
        "Resumen de la empresa activa: caja, cobranza, aging, inbox y conteos. Úsalo al empezar o cuando pregunten cómo está la oficina.",
      inputSchema: z.object({
        note: z.string().optional().describe("Opcional, ignóralo."),
      }),
      execute: async () => workspace.overview(),
    }),
    searchDocuments: tool({
      description:
        "Busca facturas, cotizaciones y boletas por cliente, folio, estado o vencidas.",
      inputSchema: z.object({
        query: z.string().optional().describe("Nombre de cliente, folio o texto."),
        status: z.enum(["borrador", "enviada", "pagada", "vencida"]).optional(),
        kind: z.string().optional().describe("factura, cotizacion, boleta, nota_credito"),
        overdue: z.boolean().optional(),
      }),
      execute: async (input) => workspace.searchDocuments(input),
    }),
    getDocument: tool({
      description: "Detalle de un documento por id o folio (F-0001, C-0003, etc.).",
      inputSchema: z.object({
        idOrNumber: z.string(),
      }),
      execute: async ({ idOrNumber }) => workspace.getDocument(idOrNumber),
    }),
    listClients: tool({
      description: "Lista o busca clientes de la empresa activa.",
      inputSchema: z.object({
        query: z.string().optional(),
      }),
      execute: async ({ query }) => workspace.listClients(query),
    }),
    listTeam: tool({
      description: "Lista el equipo y sueldos base.",
      inputSchema: z.object({
        query: z.string().optional(),
      }),
      execute: async ({ query }) => workspace.listTeam(query),
    }),
    getCashPosition: tool({
      description: "Caja, cartola bancaria y cuentas por pagar abiertas.",
      inputSchema: z.object({
        note: z.string().optional(),
      }),
      execute: async () => workspace.cashPosition(),
    }),
    listAttachments: tool({
      description:
        "Inspecciona Excel, CSV o textos que el usuario adjuntó en este mensaje. Úsalo antes de importar.",
      inputSchema: z.object({
        note: z.string().optional(),
      }),
      execute: async () => workspace.listAttachments(),
    }),
    createClient: tool({
      description: "Crea un cliente en la empresa activa.",
      inputSchema: z.object({
        name: z.string(),
        rut: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        giro: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
      }),
      execute: async (input) => workspace.createClient(input),
    }),
    createDocument: tool({
      description:
        "Crea una factura, cotización, boleta o nota. Los precios son CLP enteros, sin IVA (el IVA se calcula). Si el cliente no existe, se crea.",
      inputSchema: z.object({
        clientName: z.string().optional(),
        clientId: z.string().optional(),
        kind: z
          .enum(["factura", "cotizacion", "boleta", "nota_credito", "nota_debito"])
          .optional(),
        status: z.enum(["borrador", "enviada", "pagada", "vencida"]).optional(),
        issueDate: z.string().optional().describe("YYYY-MM-DD"),
        dueDate: z.string().optional().describe("YYYY-MM-DD"),
        notes: z.string().optional(),
        items: z
          .array(
            z.object({
              description: z.string(),
              quantity: z.number().positive(),
              unitPrice: z.number().describe("Precio unitario neto en CLP"),
            }),
          )
          .min(1),
      }),
      execute: async (input) => workspace.createDocument(input),
    }),
    emitDocument: tool({
      description:
        "Timbra y envía un DTE al SII (sandbox Orbix o OpenFactura). No sirve para cotizaciones. Usa el folio o id del documento.",
      inputSchema: z.object({
        idOrNumber: z.string().describe("Folio interno (F-0001) o id del documento"),
      }),
      execute: async ({ idOrNumber }) => workspace.emitDocument(idOrNumber),
    }),
    setDocumentStatus: tool({
      description: "Cambia el estado de un documento (borrador, enviada, pagada, vencida).",
      inputSchema: z.object({
        idOrNumber: z.string(),
        status: z.enum(["borrador", "enviada", "pagada", "vencida"]),
      }),
      execute: async ({ idOrNumber, status }) => workspace.setDocumentStatus(idOrNumber, status),
    }),
    sendPaymentReminder: tool({
      description: "Registra un recordatorio de cobro y deja un aviso en la oficina.",
      inputSchema: z.object({
        idOrNumber: z.string(),
      }),
      execute: async ({ idOrNumber }) => workspace.sendReminder(idOrNumber),
    }),
    notifyUser: tool({
      description:
        "Crea un aviso persistente en la campana de Orbix (cobranzas, plazos, recordatorios).",
      inputSchema: z.object({
        title: z.string(),
        body: z.string(),
        href: z.string().optional(),
      }),
      execute: async (input) => workspace.notifyUser(input),
    }),
    createEmployee: tool({
      description: "Crea una ficha de colaborador.",
      inputSchema: z.object({
        firstName: z.string(),
        lastName: z.string(),
        rut: z.string().optional(),
        email: z.string().optional(),
        cargo: z.string().optional(),
        departamento: z.string().optional(),
        sueldoBase: z.number(),
      }),
      execute: async (input) => workspace.createEmployee(input),
    }),
    generatePayslip: tool({
      description: "Genera la liquidación de un colaborador para un período YYYY-MM.",
      inputSchema: z.object({
        employeeName: z.string(),
        period: z.string().optional(),
      }),
      execute: async (input) => workspace.generatePayslip(input),
    }),
    importSpreadsheet: tool({
      description:
        "Importa clientes o facturas desde un Excel/CSV adjunto. Llama listAttachments primero si no conoces las columnas.",
      inputSchema: z.object({
        fileName: z.string().optional(),
        sheet: z.string().optional(),
        mode: z.enum(["auto", "invoices", "clients"]).optional(),
        status: z.enum(["borrador", "enviada"]).optional(),
        limit: z.number().optional(),
      }),
      execute: async (input) => workspace.importSpreadsheet(input),
    }),
    matchBankMovement: tool({
      description: "Concilia un movimiento de cartola con una factura, o deshace la conciliación.",
      inputSchema: z.object({
        txId: z.string(),
        invoiceIdOrNumber: z.string().nullable(),
      }),
      execute: async ({ txId, invoiceIdOrNumber }) => workspace.matchBank(txId, invoiceIdOrNumber),
    }),
    markPayablePaid: tool({
      description: "Marca una cuenta por pagar como pagada.",
      inputSchema: z.object({
        id: z.string(),
      }),
      execute: async ({ id }) => workspace.markPayable(id),
    }),
    setAttendance: tool({
      description: "Registra asistencia de un colaborador.",
      inputSchema: z.object({
        employeeName: z.string(),
        date: z.string().optional(),
        status: z.enum(["presente", "ausente", "atraso", "permiso", "vacaciones"]),
        hours: z.number().optional(),
      }),
      execute: async (input) => workspace.setAttendance(input),
    }),
    requestTimeOff: tool({
      description: "Crea una solicitud de vacaciones pendiente.",
      inputSchema: z.object({
        employeeName: z.string(),
        start: z.string(),
        end: z.string(),
        days: z.number(),
      }),
      execute: async (input) => workspace.requestVacation(input),
    }),
  };
}

export type OrbTools = ReturnType<typeof createOrbTools>;
