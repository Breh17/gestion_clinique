import { sql } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  timestamp,
  decimal,
  integer,
  boolean,
  uuid,
  jsonb,
  date,
  pgEnum
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum("user_role", [
  "superviseur",
  "medecin", 
  "secretaire",
  "pharmacien",
  "caissier",
  "comptable",
  "intervenant"
]);

export const patientStatusEnum = pgEnum("patient_status", ["actif", "inactif", "decede"]);
export const appointmentStatusEnum = pgEnum("appointment_status", ["programme", "en_attente", "en_consultation", "termine", "annule"]);
export const invoiceStatusEnum = pgEnum("invoice_status", ["brouillon", "validee", "payee", "partiellement_payee", "annulee"]);
export const paymentMethodEnum = pgEnum("payment_method", ["especes", "carte", "cheque", "virement", "mobile_money"]);
export const medicationStatusEnum = pgEnum("medication_status", ["disponible", "stock_faible", "rupture", "perime"]);
export const commissionStatusEnum = pgEnum("commission_status", ["a_payer", "payee"]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  email: varchar("email", { length: 255 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Patients table
export const patients = pgTable("patients", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  fileNumber: varchar("file_number", { length: 20 }).notNull().unique(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  birthDate: date("birth_date"),
  gender: varchar("gender", { length: 10 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  region: varchar("region", { length: 100 }),
  country: varchar("country", { length: 100 }).default("Maroc"),
  bloodType: varchar("blood_type", { length: 5 }),
  allergies: text("allergies"),
  medicalHistory: text("medical_history"),
  emergencyContact: varchar("emergency_contact", { length: 255 }),
  status: patientStatusEnum("status").default("actif"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Insurance companies
export const insuranceCompanies = pgTable("insurance_companies", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // "principale", "complementaire"
  coverageRates: jsonb("coverage_rates"), // { "consultation": 70, "medication": 80 }
  ceilings: jsonb("ceilings"), // plafonds par acte/période
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// Patient insurance affiliations
export const patientInsurance = pgTable("patient_insurance", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  insuranceId: uuid("insurance_id").references(() => insuranceCompanies.id).notNull(),
  memberNumber: varchar("member_number", { length: 100 }),
  isPrimary: boolean("is_primary").default(false),
  validFrom: date("valid_from"),
  validTo: date("valid_to"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// Service/Prestation catalog
export const services = pgTable("services", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  publicPrice: decimal("public_price", { precision: 10, scale: 2 }).notNull(),
  insurancePrice: decimal("insurance_price", { precision: 10, scale: 2 }),
  duration: integer("duration"), // en minutes
  department: varchar("department", { length: 100 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// Appointments
export const appointments = pgTable("appointments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  doctorId: uuid("doctor_id").references(() => users.id).notNull(),
  serviceId: uuid("service_id").references(() => services.id),
  appointmentDate: timestamp("appointment_date").notNull(),
  duration: integer("duration").default(30),
  reason: text("reason"),
  status: appointmentStatusEnum("status").default("programme"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Consultations
export const consultations = pgTable("consultations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  doctorId: uuid("doctor_id").references(() => users.id).notNull(),
  appointmentId: uuid("appointment_id").references(() => appointments.id),
  consultationDate: timestamp("consultation_date").defaultNow(),
  reason: text("reason"),
  anamnesis: text("anamnesis"),
  clinicalExam: text("clinical_exam"),
  vitals: jsonb("vitals"), // TA, FC, Temp, Poids
  diagnosis: text("diagnosis"),
  diagnosisCode: varchar("diagnosis_code", { length: 10 }), // CIM-10
  recommendations: text("recommendations"),
  followUpDate: date("follow_up_date"),
  createdAt: timestamp("created_at").defaultNow()
});

// Medications
export const medications = pgTable("medications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  dci: varchar("dci", { length: 255 }), // Dénomination Commune Internationale
  form: varchar("form", { length: 100 }), // comprimé, gélule, sirop
  dosage: varchar("dosage", { length: 100 }),
  packaging: varchar("packaging", { length: 100 }),
  barcode: varchar("barcode", { length: 50 }),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }),
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }),
  tax: decimal("tax", { precision: 5, scale: 2 }).default("20.00"),
  category: varchar("category", { length: 100 }),
  requiresPrescription: boolean("requires_prescription").default(true),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// Medication lots/batches
export const medicationLots = pgTable("medication_lots", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  medicationId: uuid("medication_id").references(() => medications.id).notNull(),
  lotNumber: varchar("lot_number", { length: 100 }).notNull(),
  expiryDate: date("expiry_date").notNull(),
  quantity: integer("quantity").notNull(),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }),
  supplierId: uuid("supplier_id"),
  receivedDate: date("received_date").defaultNow(),
  status: medicationStatusEnum("status").default("disponible"),
  createdAt: timestamp("created_at").defaultNow()
});

// Prescriptions
export const prescriptions = pgTable("prescriptions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  consultationId: uuid("consultation_id").references(() => consultations.id).notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  doctorId: uuid("doctor_id").references(() => users.id).notNull(),
  prescriptionDate: timestamp("prescription_date").defaultNow(),
  isDispensed: boolean("is_dispensed").default(false),
  dispensedAt: timestamp("dispensed_at"),
  dispensedBy: uuid("dispensed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow()
});

// Prescription items
export const prescriptionItems = pgTable("prescription_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  prescriptionId: uuid("prescription_id").references(() => prescriptions.id).notNull(),
  medicationId: uuid("medication_id").references(() => medications.id).notNull(),
  dosage: varchar("dosage", { length: 255 }),
  frequency: varchar("frequency", { length: 100 }),
  duration: varchar("duration", { length: 100 }),
  quantity: integer("quantity").notNull(),
  instructions: text("instructions"),
  isDispensed: boolean("is_dispensed").default(false)
});

// Pharmacy dispensing
export const pharmacyDispensing = pgTable("pharmacy_dispensing", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  prescriptionItemId: uuid("prescription_item_id").references(() => prescriptionItems.id),
  medicationLotId: uuid("medication_lot_id").references(() => medicationLots.id).notNull(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }),
  dispensedBy: uuid("dispensed_by").references(() => users.id).notNull(),
  dispensedAt: timestamp("dispensed_at").defaultNow()
});

// Invoices
export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: varchar("invoice_number", { length: 20 }).notNull().unique(),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  consultationId: uuid("consultation_id").references(() => consultations.id),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  insuranceCoverage: decimal("insurance_coverage", { precision: 10, scale: 2 }).default("0"),
  patientAmount: decimal("patient_amount", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  status: invoiceStatusEnum("status").default("brouillon"),
  invoiceDate: timestamp("invoice_date").defaultNow(),
  dueDate: date("due_date"),
  createdBy: uuid("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

// Invoice items
export const invoiceItems = pgTable("invoice_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: uuid("invoice_id").references(() => invoices.id).notNull(),
  serviceId: uuid("service_id").references(() => services.id),
  medicationId: uuid("medication_id").references(() => medications.id),
  description: varchar("description", { length: 255 }),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  insuranceCoverage: decimal("insurance_coverage", { precision: 10, scale: 2 }).default("0")
});

// Payments
export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: uuid("invoice_id").references(() => invoices.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  method: paymentMethodEnum("method").notNull(),
  reference: varchar("reference", { length: 100 }),
  paymentDate: timestamp("payment_date").defaultNow(),
  receivedBy: uuid("received_by").references(() => users.id).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});

// Cash registers
export const cashRegisters = pgTable("cash_registers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  openingDate: timestamp("opening_date").defaultNow(),
  closingDate: timestamp("closing_date"),
  openingBalance: decimal("opening_balance", { precision: 10, scale: 2 }).notNull(),
  closingBalance: decimal("closing_balance", { precision: 10, scale: 2 }),
  expectedBalance: decimal("expected_balance", { precision: 10, scale: 2 }),
  variance: decimal("variance", { precision: 10, scale: 2 }),
  isOpen: boolean("is_open").default(true),
  notes: text("notes")
});

// External practitioners for commissions
export const externalPractitioners = pgTable("external_practitioners", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  specialty: varchar("specialty", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }), // pourcentage
  commissionType: varchar("commission_type", { length: 20 }).default("percentage"), // percentage or fixed
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// Commissions
export const commissions = pgTable("commissions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  practitionerId: uuid("practitioner_id").references(() => externalPractitioners.id).notNull(),
  invoiceId: uuid("invoice_id").references(() => invoices.id),
  serviceId: uuid("service_id").references(() => services.id),
  baseAmount: decimal("base_amount", { precision: 10, scale: 2 }).notNull(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }),
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).notNull(),
  period: varchar("period", { length: 20 }), // "2024-01"
  status: commissionStatusEnum("status").default("a_payer"),
  calculatedAt: timestamp("calculated_at").defaultNow(),
  paidAt: timestamp("paid_at")
});

// Expenses
export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  supplier: varchar("supplier", { length: 255 }),
  paymentMethod: paymentMethodEnum("payment_method"),
  receiptNumber: varchar("receipt_number", { length: 100 }),
  expenseDate: date("expense_date").defaultNow(),
  attachmentPath: varchar("attachment_path", { length: 500 }),
  recordedBy: uuid("recorded_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

// Audit log
export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 100 }),
  entityId: uuid("entity_id"),
  beforeData: jsonb("before_data"),
  afterData: jsonb("after_data"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow()
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  appointments: many(appointments),
  consultations: many(consultations),
  prescriptions: many(prescriptions),
  invoicesCreated: many(invoices),
  paymentsReceived: many(payments),
  cashRegisters: many(cashRegisters),
  expensesRecorded: many(expenses),
  auditLogs: many(auditLog)
}));

export const patientsRelations = relations(patients, ({ many }) => ({
  appointments: many(appointments),
  consultations: many(consultations),
  prescriptions: many(prescriptions),
  invoices: many(invoices),
  insurance: many(patientInsurance),
  pharmacyDispensing: many(pharmacyDispensing)
}));

export const consultationsRelations = relations(consultations, ({ one, many }) => ({
  patient: one(patients, { fields: [consultations.patientId], references: [patients.id] }),
  doctor: one(users, { fields: [consultations.doctorId], references: [users.id] }),
  appointment: one(appointments, { fields: [consultations.appointmentId], references: [appointments.id] }),
  prescriptions: many(prescriptions),
  invoices: many(invoices)
}));

export const medicationsRelations = relations(medications, ({ many }) => ({
  lots: many(medicationLots),
  prescriptionItems: many(prescriptionItems),
  invoiceItems: many(invoiceItems)
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  patient: one(patients, { fields: [invoices.patientId], references: [patients.id] }),
  consultation: one(consultations, { fields: [invoices.consultationId], references: [consultations.id] }),
  createdBy: one(users, { fields: [invoices.createdBy], references: [users.id] }),
  items: many(invoiceItems),
  payments: many(payments),
  commissions: many(commissions)
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPatientSchema = createInsertSchema(patients).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertConsultationSchema = createInsertSchema(consultations).omit({ id: true, createdAt: true });
export const insertMedicationSchema = createInsertSchema(medications).omit({ id: true, createdAt: true });
export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });
export const insertExpenseSchema = createInsertSchema(expenses).omit({ id: true, createdAt: true });

// Select types
export type User = typeof users.$inferSelect;
export type Patient = typeof patients.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type Consultation = typeof consultations.$inferSelect;
export type Medication = typeof medications.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type InsuranceCompany = typeof insuranceCompanies.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Commission = typeof commissions.$inferSelect;
export type ExternalPractitioner = typeof externalPractitioners.$inferSelect;

// Insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type InsertConsultation = z.infer<typeof insertConsultationSchema>;
export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
