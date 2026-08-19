import { computeInvoiceTotals } from "./invoice";
import { computeLiquidacion, defaultExtrasForSalary } from "./payroll";
import type {
  Activity,
  AppState,
  Attendance,
  BankTx,
  Client,
  Company,
  Contract,
  Employee,
  Integration,
  Invoice,
  InvoiceEvent,
  LiquidacionRecord,
  Notification,
  Payable,
  Session,
  User,
  Vacation,
} from "./types";

export const COMPANIES: Company[] = [
  {
    id: "co-andes",
    name: "Andes Tecnología SpA",
    rut: "76.543.210-K",
    giro: "Desarrollo de software y consultoría informática",
    address: "Av. Apoquindo 4501, oficina 1202",
    city: "Las Condes",
    region: "Región Metropolitana",
    phone: "+56 2 2945 1100",
    email: "hola@andestec.cl",
    ivaRate: 0.19,
    logoColor: "#a3a3a3",
    bank: "Banco de Chile",
    account: "00-123-45678-9",
  },
  {
    id: "co-puerto",
    name: "Puerto Austral Ltda",
    rut: "77.891.234-5",
    giro: "Logística, almacenamiento y transporte de carga",
    address: "Av. Costanera 890",
    city: "Puerto Montt",
    region: "Los Lagos",
    phone: "+56 65 234 8800",
    email: "ops@puertoaustral.cl",
    ivaRate: 0.19,
    logoColor: "#38bdf8",
    bank: "Banco Santander",
    account: "00-882-19023-1",
  },
  {
    id: "co-cordillera",
    name: "Cordillera Alimentos SpA",
    rut: "76.112.889-3",
    giro: "Elaboración y comercialización de alimentos",
    address: "Camino Lo Echevers 251",
    city: "Quilicura",
    region: "Región Metropolitana",
    phone: "+56 2 2588 4400",
    email: "contacto@cordilleraalimentos.cl",
    ivaRate: 0.19,
    logoColor: "#84cc16",
    bank: "Banco BCI",
    account: "11-440-77821-4",
  },
];

export const CLIENTS: Client[] = [
  {
    id: "cli-1",
    companyId: "co-andes",
    name: "Mercado Norte SpA",
    rut: "76.334.118-2",
    giro: "Comercio al por menor",
    email: "finanzas@mercadonorte.cl",
    phone: "+56 2 2341 9000",
    address: "Av. Independencia 1450",
    city: "Santiago",
  },
  {
    id: "cli-2",
    companyId: "co-andes",
    name: "Clínica del Valle",
    rut: "65.221.009-7",
    giro: "Prestación de servicios de salud",
    email: "abastecimiento@clinicadelvalle.cl",
    phone: "+56 2 2755 3000",
    address: "Las Hortensias 220",
    city: "Ñuñoa",
  },
  {
    id: "cli-3",
    companyId: "co-andes",
    name: "Constructora Río Claro",
    rut: "78.100.554-1",
    giro: "Construcción de obras civiles",
    email: "pagos@rioclaro.cl",
    phone: "+56 2 2890 1122",
    address: "Av. Vicuña Mackenna 6100",
    city: "La Florida",
  },
  {
    id: "cli-4",
    companyId: "co-andes",
    name: "Vinícola Santa Nieves",
    rut: "76.998.221-6",
    giro: "Elaboración de vinos",
    email: "admin@santanieves.cl",
    phone: "+56 72 234 5500",
    address: "Ruta 5 Sur km 112",
    city: "Rancagua",
  },
  {
    id: "cli-5",
    companyId: "co-andes",
    name: "Colegio Los Alerces",
    rut: "71.445.880-K",
    giro: "Educación básica y media",
    email: "direccion@losalerces.cl",
    phone: "+56 2 2410 7788",
    address: "El Arrayán 890",
    city: "Lo Barnechea",
  },
  {
    id: "cli-6",
    companyId: "co-puerto",
    name: "Salmones del Sur S.A.",
    rut: "96.772.310-8",
    giro: "Acuicultura",
    email: "logistica@salmonesdelsur.cl",
    phone: "+56 65 256 4000",
    address: "Camino a Chinquihue 3200",
    city: "Puerto Montt",
  },
  {
    id: "cli-7",
    companyId: "co-puerto",
    name: "Ferretería Austral",
    rut: "76.201.667-4",
    giro: "Venta de materiales de construcción",
    email: "compras@ferreteriaaustral.cl",
    phone: "+56 65 228 1190",
    address: "Av. Presidente Ibáñez 540",
    city: "Puerto Montt",
  },
  {
    id: "cli-8",
    companyId: "co-cordillera",
    name: "Supermercados El Roble",
    rut: "76.550.019-5",
    giro: "Venta al por menor en supermercados",
    email: "abastecimiento@elroble.cl",
    phone: "+56 2 2677 3300",
    address: "Av. Américo Vespucio 1501",
    city: "Cerrillos",
  },
  {
    id: "cli-9",
    companyId: "co-cordillera",
    name: "Hotel Cordón Andino",
    rut: "76.881.440-2",
    giro: "Hotelería y gastronomía",
    email: "finanzas@cordonandino.cl",
    phone: "+56 2 2248 9900",
    address: "Camino Farellones 2100",
    city: "Lo Barnechea",
  },
];

function item(id: string, description: string, quantity: number, unitPrice: number) {
  return { id, description, quantity, unitPrice };
}

export const INVOICES: Invoice[] = [
  {
    id: "inv-1",
    number: "F-1042",
    companyId: "co-andes",
    clientId: "cli-1",
    status: "pagada",
    issueDate: "2026-03-04",
    dueDate: "2026-04-03",
    taxRate: 0.19,
    notes: "Implementación módulo de inventario Q1.",
    items: [
      item("i1", "Desarrollo plataforma e-commerce", 1, 4_800_000),
      item("i2", "Integración transbank y facturación", 1, 1_250_000),
    ],
  },
  {
    id: "inv-2",
    number: "F-1043",
    companyId: "co-andes",
    clientId: "cli-2",
    status: "enviada",
    issueDate: "2026-07-12",
    dueDate: "2026-08-11",
    taxRate: 0.19,
    notes: "Soporte mensual HIS.",
    items: [
      item("i1", "Soporte plataforma HIS", 1, 980_000),
      item("i2", "Horas extra integración FHIR", 12, 65_000),
    ],
  },
  {
    id: "inv-3",
    number: "F-1044",
    companyId: "co-andes",
    clientId: "cli-3",
    status: "vencida",
    issueDate: "2026-05-18",
    dueDate: "2026-06-17",
    taxRate: 0.19,
    notes: "Portal de avance de obra.",
    items: [item("i1", "Portal de control de obra", 1, 3_450_000)],
  },
  {
    id: "inv-4",
    number: "F-1045",
    companyId: "co-andes",
    clientId: "cli-4",
    status: "pagada",
    issueDate: "2026-04-22",
    dueDate: "2026-05-22",
    taxRate: 0.19,
    notes: "",
    items: [
      item("i1", "App de trazabilidad de cosecha", 1, 2_200_000),
      item("i2", "Capacitación equipo de campo", 8, 45_000),
    ],
  },
  {
    id: "inv-5",
    number: "F-1046",
    companyId: "co-andes",
    clientId: "cli-5",
    status: "borrador",
    issueDate: "2026-08-01",
    dueDate: "2026-08-31",
    taxRate: 0.19,
    notes: "Pendiente aprobación rectoría.",
    items: [item("i1", "Plataforma de matrícula 2027", 1, 1_680_000)],
  },
  {
    id: "inv-6",
    number: "F-1047",
    companyId: "co-andes",
    clientId: "cli-1",
    status: "pagada",
    issueDate: "2026-06-09",
    dueDate: "2026-07-09",
    taxRate: 0.19,
    notes: "",
    items: [item("i1", "Mantenimiento plataforma", 1, 720_000)],
  },
  {
    id: "inv-7",
    number: "F-1048",
    companyId: "co-andes",
    clientId: "cli-2",
    status: "pagada",
    issueDate: "2026-01-15",
    dueDate: "2026-02-14",
    taxRate: 0.19,
    notes: "",
    items: [item("i1", "Migración servidores clínicos", 1, 5_100_000)],
  },
  {
    id: "inv-8",
    number: "F-1049",
    companyId: "co-andes",
    clientId: "cli-3",
    status: "enviada",
    issueDate: "2026-08-05",
    dueDate: "2026-09-04",
    taxRate: 0.19,
    notes: "",
    items: [
      item("i1", "Módulo de subcontratos", 1, 1_950_000),
      item("i2", "Licencias anuales", 5, 89_000),
    ],
  },
  {
    id: "inv-9",
    number: "F-2101",
    companyId: "co-puerto",
    clientId: "cli-6",
    status: "pagada",
    issueDate: "2026-05-03",
    dueDate: "2026-06-02",
    taxRate: 0.19,
    notes: "Temporada de cosecha.",
    items: [
      item("i1", "Transporte refrigerado Puerto Montt–Santiago", 14, 420_000),
      item("i2", "Almacenamiento frío 30 días", 1, 1_800_000),
    ],
  },
  {
    id: "inv-10",
    number: "F-2102",
    companyId: "co-puerto",
    clientId: "cli-7",
    status: "enviada",
    issueDate: "2026-07-28",
    dueDate: "2026-08-27",
    taxRate: 0.19,
    notes: "",
    items: [item("i1", "Distribución regional julio", 1, 2_340_000)],
  },
  {
    id: "inv-11",
    number: "F-3101",
    companyId: "co-cordillera",
    clientId: "cli-8",
    status: "pagada",
    issueDate: "2026-06-16",
    dueDate: "2026-07-16",
    taxRate: 0.19,
    notes: "",
    items: [
      item("i1", "Línea de conservas premium", 240, 8_900),
      item("i2", "Despacho RM", 12, 45_000),
    ],
  },
  {
    id: "inv-12",
    number: "F-3102",
    companyId: "co-cordillera",
    clientId: "cli-9",
    status: "vencida",
    issueDate: "2026-04-08",
    dueDate: "2026-05-08",
    taxRate: 0.19,
    notes: "Eventos corporativos abril.",
    items: [item("i1", "Catering eventos corporativos", 1, 3_780_000)],
  },
  {
    id: "inv-13",
    number: "F-1050",
    companyId: "co-andes",
    clientId: "cli-4",
    status: "pagada",
    issueDate: "2026-02-11",
    dueDate: "2026-03-13",
    taxRate: 0.19,
    notes: "",
    items: [item("i1", "Dashboard de vendimia", 1, 1_420_000)],
  },
  {
    id: "inv-14",
    number: "F-1051",
    companyId: "co-andes",
    clientId: "cli-5",
    status: "pagada",
    issueDate: "2026-07-02",
    dueDate: "2026-08-01",
    taxRate: 0.19,
    notes: "",
    items: [item("i1", "Soporte plataforma académica", 1, 540_000)],
  },
  {
    id: "inv-15",
    number: "F-1052",
    companyId: "co-andes",
    clientId: "cli-1",
    status: "enviada",
    issueDate: "2026-06-02",
    dueDate: "2026-07-01",
    taxRate: 0.19,
    notes: "Retainer mensual.",
    kind: "factura",
    items: [item("i1", "Retainer plataforma e-commerce", 1, 890_000)],
    recurring: { interval: "monthly", nextDate: "2026-09-02", active: true },
  },
  {
    id: "inv-16",
    number: "C-0088",
    companyId: "co-andes",
    clientId: "cli-5",
    status: "enviada",
    issueDate: "2026-08-10",
    dueDate: "2026-08-25",
    taxRate: 0.19,
    notes: "Propuesta LMS 2027.",
    kind: "cotizacion",
    items: [
      item("i1", "Plataforma LMS colegios", 1, 4_200_000),
      item("i2", "Capacitación docentes", 20, 38_000),
    ],
  },
  {
    id: "inv-17",
    number: "C-0089",
    companyId: "co-andes",
    clientId: "cli-4",
    status: "borrador",
    issueDate: "2026-08-16",
    dueDate: "2026-08-30",
    taxRate: 0.19,
    notes: "",
    kind: "cotizacion",
    items: [item("i1", "Integración sensores de bodega", 1, 1_150_000)],
  },
  {
    id: "inv-18",
    number: "NC-0012",
    companyId: "co-andes",
    clientId: "cli-1",
    status: "enviada",
    issueDate: "2026-03-20",
    dueDate: "2026-03-20",
    taxRate: 0.19,
    notes: "Ajuste horas no usadas.",
    kind: "nota_credito",
    relatedId: "inv-1",
    items: [item("i1", "Nota de crédito implementación", 1, 180_000)],
  },
];

function eventsFor(invoice: Invoice): InvoiceEvent[] {
  const rows: InvoiceEvent[] = [
    { id: `${invoice.id}-ev-1`, at: invoice.issueDate, kind: "created", detail: "Documento creado" },
  ];
  if (invoice.status !== "borrador") {
    rows.push({
      id: `${invoice.id}-ev-2`,
      at: invoice.issueDate,
      kind: "sent",
      detail: "Enviado al cliente",
    });
  }
  if (invoice.status === "pagada") {
    rows.push({
      id: `${invoice.id}-ev-3`,
      at: invoice.dueDate,
      kind: "paid",
      detail: "Pago recibido",
    });
  }
  if (invoice.status === "vencida") {
    rows.push({
      id: `${invoice.id}-ev-4`,
      at: invoice.dueDate,
      kind: "reminder",
      detail: "Recordatorio automático",
    });
  }
  if (invoice.kind === "cotizacion" && invoice.status === "enviada") {
    rows.push({
      id: `${invoice.id}-ev-5`,
      at: invoice.issueDate,
      kind: "viewed",
      detail: "Abierta por el cliente",
    });
  }
  return rows;
}

function enrichInvoice(invoice: Invoice): Invoice {
  return {
    kind: "factura",
    portalToken: `pt-${invoice.id}`,
    reminderCount: invoice.status === "vencida" ? 2 : 0,
    events: eventsFor(invoice),
    sentAt: invoice.status === "borrador" ? undefined : invoice.issueDate,
    paidAt: invoice.status === "pagada" ? invoice.dueDate : undefined,
    viewedAt: invoice.kind === "cotizacion" ? invoice.issueDate : undefined,
    ...invoice,
    items: invoice.items.map((it) => ({ ...it })),
  };
}

export const BANK_TXS: BankTx[] = [
  {
    id: "tx-open",
    companyId: "co-andes",
    date: "2026-01-02",
    description: "Saldo inicial Banco de Chile",
    amount: 8_250_000,
  },
  {
    id: "tx-1",
    companyId: "co-andes",
    date: "2026-04-03",
    description: "Transferencia Mercado Norte SpA",
    amount: 7_199_500,
    matchedInvoiceId: "inv-1",
  },
  {
    id: "tx-2",
    companyId: "co-andes",
    date: "2026-05-22",
    description: "Abono Vinícola Santa Nieves",
    amount: 3_046_400,
    matchedInvoiceId: "inv-4",
  },
  {
    id: "tx-3",
    companyId: "co-andes",
    date: "2026-07-09",
    description: "Transferencia Mercado Norte",
    amount: 856_800,
    matchedInvoiceId: "inv-6",
  },
  {
    id: "tx-4",
    companyId: "co-andes",
    date: "2026-02-14",
    description: "Clínica del Valle — migración",
    amount: 6_069_000,
    matchedInvoiceId: "inv-7",
  },
  {
    id: "tx-5",
    companyId: "co-andes",
    date: "2026-03-13",
    description: "Santa Nieves dashboard",
    amount: 1_689_800,
    matchedInvoiceId: "inv-13",
  },
  {
    id: "tx-6",
    companyId: "co-andes",
    date: "2026-08-01",
    description: "Colegio Los Alerces soporte",
    amount: 642_600,
    matchedInvoiceId: "inv-14",
  },
  {
    id: "tx-7",
    companyId: "co-andes",
    date: "2026-08-12",
    description: "Abono sin identificar — Transbank",
    amount: 1_166_200,
  },
  {
    id: "tx-8",
    companyId: "co-andes",
    date: "2026-08-05",
    description: "Arriendo Apoquindo 4501",
    amount: -1_890_000,
  },
  {
    id: "tx-9",
    companyId: "co-andes",
    date: "2026-07-31",
    description: "Nómina julio",
    amount: -12_480_000,
  },
  {
    id: "tx-10",
    companyId: "co-andes",
    date: "2026-08-15",
    description: "AWS + herramientas",
    amount: -420_000,
  },
];

export const PAYABLES: Payable[] = [
  {
    id: "pay-1",
    companyId: "co-andes",
    vendor: "Inmobiliaria Apoquindo",
    concept: "Arriendo septiembre",
    dueDate: "2026-09-05",
    amount: 1_890_000,
    status: "pendiente",
  },
  {
    id: "pay-2",
    companyId: "co-andes",
    vendor: "Amazon Web Services",
    concept: "Infraestructura agosto",
    dueDate: "2026-08-22",
    amount: 420_000,
    status: "pendiente",
  },
  {
    id: "pay-3",
    companyId: "co-andes",
    vendor: "Previred",
    concept: "Cotizaciones julio",
    dueDate: "2026-08-13",
    amount: 2_140_000,
    status: "pendiente",
  },
  {
    id: "pay-4",
    companyId: "co-puerto",
    vendor: "ENAP",
    concept: "Combustible flota",
    dueDate: "2026-08-20",
    amount: 980_000,
    status: "pendiente",
  },
];

export const EMPLOYEES: Employee[] = [
  {
    id: "emp-1",
    companyId: "co-andes",
    firstName: "Camila",
    lastName: "Soto Reyes",
    rut: "17.445.221-8",
    email: "camila.soto@andestec.cl",
    phone: "+56 9 8765 2211",
    cargo: "Gerenta de Operaciones",
    departamento: "Operaciones",
    sueldoBase: 2_850_000,
    afp: "Cuprum",
    salud: "Isapre Colmena",
    estado: "activo",
    fechaIngreso: "2021-03-08",
    banco: "Banco de Chile",
    cuenta: "00123456789",
    color: "#a3a3a3",
  },
  {
    id: "emp-2",
    companyId: "co-andes",
    firstName: "Matías",
    lastName: "Contreras Díaz",
    rut: "18.220.334-5",
    email: "matias.contreras@andestec.cl",
    phone: "+56 9 7654 8890",
    cargo: "Ingeniero de Software Senior",
    departamento: "Ingeniería",
    sueldoBase: 2_400_000,
    afp: "Habitat",
    salud: "Fonasa",
    estado: "activo",
    fechaIngreso: "2022-01-17",
    banco: "Banco Santander",
    cuenta: "00998877665",
    color: "#38bdf8",
  },
  {
    id: "emp-3",
    companyId: "co-andes",
    firstName: "Valentina",
    lastName: "Muñoz Paredes",
    rut: "19.102.778-K",
    email: "valentina.munoz@andestec.cl",
    phone: "+56 9 6543 1102",
    cargo: "Analista de Personas",
    departamento: "Personas",
    sueldoBase: 1_480_000,
    afp: "ProVida",
    salud: "Isapre Banmédica",
    estado: "vacaciones",
    fechaIngreso: "2023-06-01",
    banco: "Banco Estado",
    cuenta: "12345678901",
    color: "#a78bfa",
  },
  {
    id: "emp-4",
    companyId: "co-andes",
    firstName: "Diego",
    lastName: "Sepúlveda Lagos",
    rut: "16.887.441-2",
    email: "diego.sepulveda@andestec.cl",
    phone: "+56 9 8123 4400",
    cargo: "Contador General",
    departamento: "Finanzas",
    sueldoBase: 2_050_000,
    afp: "Capital",
    salud: "Isapre Consalud",
    estado: "activo",
    fechaIngreso: "2020-11-02",
    banco: "Banco BCI",
    cuenta: "44556677889",
    color: "#fbbf24",
  },
  {
    id: "emp-5",
    companyId: "co-andes",
    firstName: "Fernanda",
    lastName: "Rojas Campos",
    rut: "20.331.556-9",
    email: "fernanda.rojas@andestec.cl",
    phone: "+56 9 7001 3344",
    cargo: "Diseñadora de Producto",
    departamento: "Producto",
    sueldoBase: 1_920_000,
    afp: "Cuprum",
    salud: "Fonasa",
    estado: "activo",
    fechaIngreso: "2024-02-12",
    banco: "Banco de Chile",
    cuenta: "55667788990",
    color: "#fb7185",
  },
  {
    id: "emp-6",
    companyId: "co-andes",
    firstName: "Ignacio",
    lastName: "Palma Herrera",
    rut: "15.664.209-1",
    email: "ignacio.palma@andestec.cl",
    phone: "+56 9 9881 2200",
    cargo: "Ejecutivo Comercial",
    departamento: "Comercial",
    sueldoBase: 1_650_000,
    afp: "Habitat",
    salud: "Isapre Colmena",
    estado: "licencia",
    fechaIngreso: "2019-08-19",
    banco: "Banco Santander",
    cuenta: "66778899001",
    color: "#34d399",
  },
  {
    id: "emp-7",
    companyId: "co-puerto",
    firstName: "Javiera",
    lastName: "Alarcón Vera",
    rut: "17.990.112-4",
    email: "javiera.alarcon@puertoaustral.cl",
    phone: "+56 9 8455 6677",
    cargo: "Jefa de Bodega",
    departamento: "Operaciones",
    sueldoBase: 1_720_000,
    afp: "Modelo",
    salud: "Fonasa",
    estado: "activo",
    fechaIngreso: "2021-09-06",
    banco: "Banco Estado",
    cuenta: "77889900112",
    color: "#38bdf8",
  },
  {
    id: "emp-8",
    companyId: "co-puerto",
    firstName: "Pedro",
    lastName: "Cárdenas Silva",
    rut: "14.228.773-6",
    email: "pedro.cardenas@puertoaustral.cl",
    phone: "+56 9 6112 3344",
    cargo: "Chofer de larga distancia",
    departamento: "Logística",
    sueldoBase: 1_280_000,
    afp: "ProVida",
    salud: "Fonasa",
    estado: "activo",
    fechaIngreso: "2018-04-23",
    banco: "Banco Estado",
    cuenta: "88990011223",
    color: "#f59e0b",
  },
  {
    id: "emp-9",
    companyId: "co-cordillera",
    firstName: "Antonia",
    lastName: "Bravo Núñez",
    rut: "19.556.880-3",
    email: "antonia.bravo@cordilleraalimentos.cl",
    phone: "+56 9 7220 1188",
    cargo: "Jefa de Calidad",
    departamento: "Calidad",
    sueldoBase: 1_890_000,
    afp: "Cuprum",
    salud: "Isapre Banmédica",
    estado: "activo",
    fechaIngreso: "2022-07-11",
    banco: "Banco BCI",
    cuenta: "99001122334",
    color: "#84cc16",
  },
  {
    id: "emp-10",
    companyId: "co-cordillera",
    firstName: "Sebastián",
    lastName: "Fuentes Mora",
    rut: "16.441.990-7",
    email: "sebastian.fuentes@cordilleraalimentos.cl",
    phone: "+56 9 5330 4499",
    cargo: "Operario de planta",
    departamento: "Producción",
    sueldoBase: 980_000,
    afp: "Habitat",
    salud: "Fonasa",
    estado: "activo",
    fechaIngreso: "2023-01-09",
    banco: "Banco Estado",
    cuenta: "10111213141",
    color: "#22d3ee",
  },
];

export const CONTRACTS: Contract[] = EMPLOYEES.map((employee) => ({
  id: `ct-${employee.id}`,
  employeeId: employee.id,
  companyId: employee.companyId,
  type: "indefinido" as const,
  start: employee.fechaIngreso,
  sueldoBase: employee.sueldoBase,
  jornada: "40" as const,
}));

function liq(
  id: string,
  employee: Employee,
  period: string,
  createdAt: string,
): LiquidacionRecord {
  const extras = defaultExtrasForSalary(employee.sueldoBase);
  const breakdown = computeLiquidacion({ sueldoBase: employee.sueldoBase, ...extras });
  return {
    id,
    employeeId: employee.id,
    companyId: employee.companyId,
    period,
    createdAt,
    haberes: breakdown.haberes,
    descuentos: breakdown.descuentos,
    totalHaberes: breakdown.totalHaberes,
    totalDescuentos: breakdown.totalDescuentos,
    liquido: breakdown.liquido,
  };
}

export const LIQUIDACIONES: LiquidacionRecord[] = [
  liq("liq-1", EMPLOYEES[0], "2026-06", "2026-06-30"),
  liq("liq-2", EMPLOYEES[0], "2026-07", "2026-07-31"),
  liq("liq-3", EMPLOYEES[1], "2026-07", "2026-07-31"),
  liq("liq-4", EMPLOYEES[2], "2026-07", "2026-07-31"),
  liq("liq-5", EMPLOYEES[3], "2026-07", "2026-07-31"),
  liq("liq-6", EMPLOYEES[4], "2026-07", "2026-07-31"),
  liq("liq-7", EMPLOYEES[6], "2026-07", "2026-07-31"),
  liq("liq-8", EMPLOYEES[8], "2026-07", "2026-07-31"),
];

function daysBack(n: number): string {
  const d = new Date(2026, 7, 18);
  d.setDate(d.getDate() - n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildAttendance(): Attendance[] {
  const rows: Attendance[] = [];
  let i = 0;
  for (const employee of EMPLOYEES) {
    for (let day = 0; day < 14; day += 1) {
      const date = daysBack(day);
      const weekday = new Date(date).getDay();
      if (weekday === 0 || weekday === 6) continue;
      let status: Attendance["status"] = "presente";
      let hours = 9;
      if (employee.estado === "vacaciones" && day < 8) {
        status = "vacaciones";
        hours = 0;
      } else if (employee.estado === "licencia" && day < 5) {
        status = "permiso";
        hours = 0;
      } else if (employee.id === "emp-2" && day === 3) {
        status = "atraso";
        hours = 8;
      } else if (employee.id === "emp-8" && day === 6) {
        status = "ausente";
        hours = 0;
      }
      rows.push({
        id: `att-${i++}`,
        employeeId: employee.id,
        companyId: employee.companyId,
        date,
        status,
        hours,
      });
    }
  }
  return rows;
}

export const ATTENDANCE = buildAttendance();

export const VACATIONS: Vacation[] = [
  {
    id: "vac-1",
    employeeId: "emp-3",
    companyId: "co-andes",
    start: "2026-08-11",
    end: "2026-08-22",
    days: 10,
    status: "aprobada",
  },
  {
    id: "vac-2",
    employeeId: "emp-5",
    companyId: "co-andes",
    start: "2026-09-07",
    end: "2026-09-11",
    days: 5,
    status: "pendiente",
  },
  {
    id: "vac-3",
    employeeId: "emp-2",
    companyId: "co-andes",
    start: "2026-12-21",
    end: "2027-01-02",
    days: 9,
    status: "aprobada",
  },
  {
    id: "vac-4",
    employeeId: "emp-7",
    companyId: "co-puerto",
    start: "2026-09-14",
    end: "2026-09-18",
    days: 5,
    status: "pendiente",
  },
];

export const USERS: User[] = [
  {
    id: "usr-1",
    name: "Manuela Vergara",
    email: "manuela@andestec.cl",
    password: "orbix123",
    role: "admin",
    companyIds: ["co-andes", "co-puerto", "co-cordillera"],
    phone: "+56 9 8765 4411",
    title: "Gerenta general",
    avatarColor: "#d4d4d4",
  },
  {
    id: "usr-2",
    name: "Diego Sepúlveda",
    email: "diego.sepulveda@andestec.cl",
    password: "orbix123",
    role: "contador",
    companyIds: ["co-andes"],
    phone: "+56 9 8123 4400",
    title: "Contador general",
    avatarColor: "#a3a3a3",
  },
  {
    id: "usr-3",
    name: "Valentina Muñoz",
    email: "valentina.munoz@andestec.cl",
    password: "orbix123",
    role: "rrhh",
    companyIds: ["co-andes"],
    phone: "+56 9 6543 1102",
    title: "Analista de Personas",
    avatarColor: "#5c5c57",
  },
];

export const NOTIFICATIONS: Notification[] = [
  {
    id: "nt-1",
    title: "Factura F-1044 vencida",
    body: "Constructora Río Claro tiene un saldo de $4.105.500.",
    time: "Hace 2 h",
    read: false,
    href: "/facturacion/inv-3",
  },
  {
    id: "nt-4",
    title: "Cotización C-0088 abierta",
    body: "Colegio Los Alerces revisó la propuesta LMS.",
    time: "Hoy 08:40",
    read: false,
    href: "/facturacion/inv-16",
  },
  {
    id: "nt-2",
    title: "Liquidaciones de julio listas",
    body: "6 liquidaciones de Andes Tecnología están listas para pagar.",
    time: "Ayer",
    read: false,
    href: "/sueldos/liquidaciones",
  },
  {
    id: "nt-3",
    title: "Vacaciones pendientes",
    body: "Fernanda Rojas pidió 5 días en septiembre.",
    time: "Hace 3 días",
    read: true,
    href: "/sueldos/calendario",
  },
];

export const ACTIVITY: Activity[] = [
  {
    id: "ac-1",
    companyId: "co-andes",
    title: "Factura F-1049 enviada",
    detail: "Constructora Río Claro · $2.850.550",
    time: "Hoy 09:14",
    kind: "invoice",
  },
  {
    id: "ac-2",
    companyId: "co-andes",
    title: "Camila Soto aprobó nómina",
    detail: "Periodo julio · 6 colaboradores",
    time: "Ayer 18:02",
    kind: "payroll",
  },
  {
    id: "ac-3",
    companyId: "co-andes",
    title: "Valentina Muñoz en vacaciones",
    detail: "11 al 22 de agosto",
    time: "Lun 11:20",
    kind: "hr",
  },
  {
    id: "ac-4",
    companyId: "co-andes",
    title: "Nuevo cliente Colegio Los Alerces",
    detail: "RUT 71.445.880-K",
    time: "Vie 16:40",
    kind: "system",
  },
  {
    id: "ac-5",
    companyId: "co-puerto",
    title: "Factura F-2102 enviada",
    detail: "Ferretería Austral · $2.784.600",
    time: "Hoy 08:05",
    kind: "invoice",
  },
  {
    id: "ac-6",
    companyId: "co-cordillera",
    title: "Pedido El Roble despachado",
    detail: "240 cajas de conservas premium",
    time: "Ayer 14:30",
    kind: "system",
  },
];

export const INTEGRATIONS: Integration[] = [
  {
    id: "int-sii",
    name: "SII — Factura electrónica",
    description: "Emisión y recepción de DTE.",
    connected: true,
  },
  {
    id: "int-banco",
    name: "Banco de Chile",
    description: "Conciliación de abonos y transferencias.",
    connected: true,
  },
  {
    id: "int-previred",
    name: "Previred",
    description: "Cotizaciones previsionales mensuales.",
    connected: false,
  },
  {
    id: "int-slack",
    name: "Slack",
    description: "Avisos de facturas vencidas y nómina.",
    connected: false,
  },
];

export function createEmptyState(input: {
  session?: Session | null;
  companies?: Company[];
  users?: User[];
  activeCompanyId?: string;
} = {}): AppState {
  const companies = (input.companies ?? []).map((company) => ({ ...company }));
  return {
    session: input.session ?? null,
    activeCompanyId: input.activeCompanyId ?? companies[0]?.id ?? "",
    companies,
    clients: [],
    invoices: [],
    employees: [],
    liquidaciones: [],
    attendance: [],
    vacations: [],
    users: (input.users ?? []).map((user) => ({ ...user, companyIds: [...user.companyIds] })),
    notifications: [],
    activity: [],
    integrations: INTEGRATIONS.map((item) => ({ ...item, connected: false })),
    bankTxs: [],
    payables: [],
    contracts: [],
    notificationPrefs: {
      email: true,
      invoices: true,
      payroll: true,
      product: false,
    },
  };
}

export function createSeedState(): AppState {
  return {
    session: {
      userId: "usr-1",
      email: "manuela@andestec.cl",
      name: "Manuela Vergara",
      role: "admin",
      phone: "+56 9 8765 4411",
      title: "Gerenta general",
      avatarColor: "#d4d4d4",
    },
    activeCompanyId: "co-andes",
    companies: COMPANIES.map((c) => ({ ...c })),
    clients: CLIENTS.map((c) => ({ ...c })),
    invoices: INVOICES.map(enrichInvoice),
    employees: EMPLOYEES.map((e) => ({ ...e })),
    liquidaciones: LIQUIDACIONES.map((l) => ({
      ...l,
      haberes: l.haberes.map((h) => ({ ...h })),
      descuentos: l.descuentos.map((d) => ({ ...d })),
    })),
    attendance: ATTENDANCE.map((a) => ({ ...a })),
    vacations: VACATIONS.map((v) => ({ ...v })),
    users: USERS.map((u) => ({ ...u, companyIds: [...u.companyIds] })),
    notifications: NOTIFICATIONS.map((n) => ({ ...n })),
    activity: ACTIVITY.map((a) => ({ ...a })),
    integrations: INTEGRATIONS.map((i) => ({ ...i })),
    bankTxs: BANK_TXS.map((tx) => ({ ...tx })),
    payables: PAYABLES.map((p) => ({ ...p })),
    contracts: CONTRACTS.map((c) => ({ ...c })),
    notificationPrefs: {
      email: true,
      invoices: true,
      payroll: true,
      product: false,
    },
  };
}

export function invoiceWithTotals(invoice: Invoice) {
  return { ...invoice, ...computeInvoiceTotals(invoice.items, invoice.taxRate) };
}
