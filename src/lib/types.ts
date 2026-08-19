import type { DocumentKind, InvoiceStatus } from "./invoice";
import type { PayLine } from "./payroll";

export type { DocumentKind };

export type Company = {
  id: string;
  name: string;
  rut: string;
  giro: string;
  address: string;
  city: string;
  region: string;
  phone: string;
  email: string;
  ivaRate: number;
  logoColor: string;
  bank: string;
  account: string;
};

export type Client = {
  id: string;
  companyId: string;
  name: string;
  rut: string;
  giro: string;
  email: string;
  phone: string;
  address: string;
  city: string;
};

export type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

export type InvoiceEventKind =
  | "created"
  | "sent"
  | "viewed"
  | "paid"
  | "reminder"
  | "converted"
  | "credited"
  | "duplicated"
  | "reconciled";

export type InvoiceEvent = {
  id: string;
  at: string;
  kind: InvoiceEventKind;
  detail: string;
};

export type RecurringConfig = {
  interval: "monthly";
  nextDate: string;
  active: boolean;
};

export type Invoice = {
  id: string;
  number: string;
  companyId: string;
  clientId: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  taxRate: number;
  notes: string;
  kind?: DocumentKind;
  relatedId?: string;
  portalToken?: string;
  reminderCount?: number;
  reminderSentAt?: string;
  paidAt?: string;
  sentAt?: string;
  viewedAt?: string;
  recurring?: RecurringConfig;
  events?: InvoiceEvent[];
};

export type BankTx = {
  id: string;
  companyId: string;
  date: string;
  description: string;
  amount: number;
  matchedInvoiceId?: string | null;
};

export type Payable = {
  id: string;
  companyId: string;
  vendor: string;
  concept: string;
  dueDate: string;
  amount: number;
  status: "pendiente" | "pagada";
};

export type Contract = {
  id: string;
  employeeId: string;
  companyId: string;
  type: "indefinido" | "plazo_fijo" | "honorarios";
  start: string;
  end?: string;
  sueldoBase: number;
  jornada: "45" | "40" | "parcial";
};

export type EmployeeStatus = "activo" | "vacaciones" | "licencia" | "inactivo";

export type Employee = {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  rut: string;
  email: string;
  phone: string;
  cargo: string;
  departamento: string;
  sueldoBase: number;
  afp: string;
  salud: string;
  estado: EmployeeStatus;
  fechaIngreso: string;
  banco: string;
  cuenta: string;
  color: string;
};

export type LiquidacionRecord = {
  id: string;
  employeeId: string;
  companyId: string;
  period: string;
  haberes: PayLine[];
  descuentos: PayLine[];
  totalHaberes: number;
  totalDescuentos: number;
  liquido: number;
  createdAt: string;
};

export type AttendanceStatus =
  | "presente"
  | "ausente"
  | "atraso"
  | "permiso"
  | "vacaciones";

export type Attendance = {
  id: string;
  employeeId: string;
  companyId: string;
  date: string;
  status: AttendanceStatus;
  hours: number;
};

export type Vacation = {
  id: string;
  employeeId: string;
  companyId: string;
  start: string;
  end: string;
  days: number;
  status: "aprobada" | "pendiente" | "rechazada";
};

export type Role = "admin" | "contador" | "rrhh" | "lectura";

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  companyIds: string[];
  phone?: string;
  title?: string;
  avatarColor?: string;
};

export type Session = {
  userId: string;
  email: string;
  name: string;
  role: Role;
  phone?: string;
  title?: string;
  avatarColor?: string;
};

export type Notification = {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  href: string;
};

export type Activity = {
  id: string;
  companyId: string;
  title: string;
  detail: string;
  time: string;
  kind: "invoice" | "payroll" | "hr" | "system";
};

export type Integration = {
  id: string;
  name: string;
  description: string;
  connected: boolean;
};

export type AppState = {
  session: Session | null;
  activeCompanyId: string;
  companies: Company[];
  clients: Client[];
  invoices: Invoice[];
  employees: Employee[];
  liquidaciones: LiquidacionRecord[];
  attendance: Attendance[];
  vacations: Vacation[];
  users: User[];
  notifications: Notification[];
  activity: Activity[];
  integrations: Integration[];
  bankTxs: BankTx[];
  payables: Payable[];
  contracts: Contract[];
  notificationPrefs: {
    email: boolean;
    invoices: boolean;
    payroll: boolean;
    product: boolean;
  };
};
