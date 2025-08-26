import {
  users,
  patients,
  appointments,
  consultations,
  medications,
  medicationLots,
  prescriptions,
  prescriptionItems,
  pharmacyDispensing,
  invoices,
  invoiceItems,
  payments,
  cashRegisters,
  services,
  insuranceCompanies,
  patientInsurance,
  externalPractitioners,
  commissions,
  expenses,
  auditLog,
  type User,
  type Patient,
  type Appointment,
  type Consultation,
  type Medication,
  type Invoice,
  type Payment,
  type Expense,
  type Service,
  type InsuranceCompany,
  type Commission,
  type ExternalPractitioner,
  type InsertUser,
  type InsertPatient,
  type InsertAppointment,
  type InsertConsultation,
  type InsertMedication,
  type InsertInvoice,
  type InsertPayment,
  type InsertExpense
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, asc, sql, count, sum } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  authenticateUser(username: string, password: string): Promise<User | null>;

  // Patient operations
  getPatients(limit?: number, offset?: number): Promise<Patient[]>;
  getPatient(id: string): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: string, patient: Partial<InsertPatient>): Promise<Patient>;
  searchPatients(query: string): Promise<Patient[]>;

  // Appointment operations
  getAppointments(date?: Date): Promise<Appointment[]>;
  getAppointment(id: string): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, appointment: Partial<InsertAppointment>): Promise<Appointment>;

  // Consultation operations
  getConsultations(patientId?: string): Promise<Consultation[]>;
  getConsultation(id: string): Promise<Consultation | undefined>;
  createConsultation(consultation: InsertConsultation): Promise<Consultation>;
  updateConsultation(id: string, consultation: Partial<InsertConsultation>): Promise<Consultation>;

  // Medication operations
  getMedications(): Promise<Medication[]>;
  getMedication(id: string): Promise<Medication | undefined>;
  createMedication(medication: InsertMedication): Promise<Medication>;
  updateMedication(id: string, medication: Partial<InsertMedication>): Promise<Medication>;

  // Invoice operations
  getInvoices(patientId?: string): Promise<Invoice[]>;
  getInvoice(id: string): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, invoice: Partial<InsertInvoice>): Promise<Invoice>;

  // Payment operations
  getPayments(invoiceId?: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;

  // Cash register operations
  getCurrentCashRegister(userId: string): Promise<any>;
  openCashRegister(userId: string, openingBalance: number): Promise<any>;
  closeCashRegister(id: string, closingBalance: number): Promise<any>;

  // Expense operations
  getExpenses(startDate?: Date, endDate?: Date): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;

  // Service operations
  getServices(): Promise<Service[]>;

  // Insurance operations
  getInsuranceCompanies(): Promise<InsuranceCompany[]>;

  // Commission operations
  getCommissions(period?: string): Promise<Commission[]>;
  calculateCommissions(period: string): Promise<void>;

  // Dashboard statistics
  getDashboardStats(): Promise<any>;

  // Reports
  generateFinancialReport(startDate: Date, endDate: Date): Promise<any>;
  generatePatientReport(startDate: Date, endDate: Date): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const [user] = await db
      .insert(users)
      .values({ ...userData, password: hashedPassword })
      .returning();
    return user;
  }

  async authenticateUser(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;
    
    return user;
  }

  // Patient operations
  async getPatients(limit = 50, offset = 0): Promise<Patient[]> {
    return await db
      .select()
      .from(patients)
      .orderBy(desc(patients.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getPatient(id: string): Promise<Patient | undefined> {
    // Add validation to prevent [object Object] errors
    if (typeof id !== 'string' || !id.trim()) {
      console.error('Invalid patient ID provided:', id, typeof id);
      throw new Error('Invalid patient ID');
    }
    
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient;
  }

  async createPatient(patientData: InsertPatient): Promise<Patient> {
    // Generate file number
    const fileNumber = `P-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    
    const [patient] = await db
      .insert(patients)
      .values({ ...patientData, fileNumber })
      .returning();
    return patient;
  }

  async updatePatient(id: string, patientData: Partial<InsertPatient>): Promise<Patient> {
    const [patient] = await db
      .update(patients)
      .set({ ...patientData, updatedAt: new Date() })
      .where(eq(patients.id, id))
      .returning();
    return patient;
  }

  async searchPatients(query: string): Promise<Patient[]> {
    return await db
      .select()
      .from(patients)
      .where(
        sql`${patients.firstName} ILIKE ${`%${query}%`} OR 
            ${patients.lastName} ILIKE ${`%${query}%`} OR 
            ${patients.fileNumber} ILIKE ${`%${query}%`}`
      )
      .limit(20);
  }

  // Appointment operations
  async getAppointments(date?: Date): Promise<Appointment[]> {
    let query = db.select().from(appointments);
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query = query.where(
        and(
          gte(appointments.appointmentDate, startOfDay),
          lte(appointments.appointmentDate, endOfDay)
        )
      );
    }
    
    return await query.orderBy(asc(appointments.appointmentDate));
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment;
  }

  async createAppointment(appointmentData: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db
      .insert(appointments)
      .values(appointmentData)
      .returning();
    return appointment;
  }

  async updateAppointment(id: string, appointmentData: Partial<InsertAppointment>): Promise<Appointment> {
    const [appointment] = await db
      .update(appointments)
      .set({ ...appointmentData, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();
    return appointment;
  }

  // Consultation operations
  async getConsultations(patientId?: string): Promise<Consultation[]> {
    let query = db.select().from(consultations);
    
    if (patientId) {
      query = query.where(eq(consultations.patientId, patientId));
    }
    
    return await query.orderBy(desc(consultations.consultationDate));
  }

  async getConsultation(id: string): Promise<Consultation | undefined> {
    const [consultation] = await db.select().from(consultations).where(eq(consultations.id, id));
    return consultation;
  }

  async createConsultation(consultationData: InsertConsultation): Promise<Consultation> {
    const [consultation] = await db
      .insert(consultations)
      .values(consultationData)
      .returning();
    return consultation;
  }

  async updateConsultation(id: string, consultationData: Partial<InsertConsultation>): Promise<Consultation> {
    const [consultation] = await db
      .update(consultations)
      .set(consultationData)
      .where(eq(consultations.id, id))
      .returning();
    return consultation;
  }

  // Medication operations
  async getMedications(): Promise<Medication[]> {
    return await db
      .select()
      .from(medications)
      .where(eq(medications.isActive, true))
      .orderBy(asc(medications.name));
  }

  async getMedication(id: string): Promise<Medication | undefined> {
    const [medication] = await db.select().from(medications).where(eq(medications.id, id));
    return medication;
  }

  async createMedication(medicationData: InsertMedication): Promise<Medication> {
    const [medication] = await db
      .insert(medications)
      .values(medicationData)
      .returning();
    return medication;
  }

  async updateMedication(id: string, medicationData: Partial<InsertMedication>): Promise<Medication> {
    const [medication] = await db
      .update(medications)
      .set(medicationData)
      .where(eq(medications.id, id))
      .returning();
    return medication;
  }

  // Invoice operations
  async getInvoices(patientId?: string): Promise<Invoice[]> {
    let query = db.select().from(invoices);
    
    if (patientId) {
      query = query.where(eq(invoices.patientId, patientId));
    }
    
    return await query.orderBy(desc(invoices.invoiceDate));
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }

  async createInvoice(invoiceData: InsertInvoice): Promise<Invoice> {
    // Generate invoice number
    const invoiceNumber = `F-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    
    const [invoice] = await db
      .insert(invoices)
      .values({ ...invoiceData, invoiceNumber })
      .returning();
    return invoice;
  }

  async updateInvoice(id: string, invoiceData: Partial<InsertInvoice>): Promise<Invoice> {
    const [invoice] = await db
      .update(invoices)
      .set(invoiceData)
      .where(eq(invoices.id, id))
      .returning();
    return invoice;
  }

  // Payment operations
  async getPayments(invoiceId?: string): Promise<Payment[]> {
    let query = db.select().from(payments);
    
    if (invoiceId) {
      query = query.where(eq(payments.invoiceId, invoiceId));
    }
    
    return await query.orderBy(desc(payments.paymentDate));
  }

  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(paymentData)
      .returning();
    return payment;
  }

  // Cash register operations
  async getCurrentCashRegister(userId: string): Promise<any> {
    const [cashRegister] = await db
      .select()
      .from(cashRegisters)
      .where(and(eq(cashRegisters.userId, userId), eq(cashRegisters.isOpen, true)))
      .orderBy(desc(cashRegisters.openingDate));
    return cashRegister;
  }

  async openCashRegister(userId: string, openingBalance: number): Promise<any> {
    const [cashRegister] = await db
      .insert(cashRegisters)
      .values({ userId, openingBalance, isOpen: true })
      .returning();
    return cashRegister;
  }

  async closeCashRegister(id: string, closingBalance: number): Promise<any> {
    const [cashRegister] = await db
      .update(cashRegisters)
      .set({ 
        closingBalance, 
        closingDate: new Date(),
        isOpen: false,
        variance: sql`${closingBalance} - expected_balance`
      })
      .where(eq(cashRegisters.id, id))
      .returning();
    return cashRegister;
  }

  // Expense operations
  async getExpenses(startDate?: Date, endDate?: Date): Promise<Expense[]> {
    let query = db.select().from(expenses);
    
    if (startDate && endDate) {
      query = query.where(
        and(
          gte(expenses.expenseDate, startDate),
          lte(expenses.expenseDate, endDate)
        )
      );
    }
    
    return await query.orderBy(desc(expenses.expenseDate));
  }

  async createExpense(expenseData: InsertExpense): Promise<Expense> {
    const [expense] = await db
      .insert(expenses)
      .values(expenseData)
      .returning();
    return expense;
  }

  // Service operations
  async getServices(): Promise<Service[]> {
    return await db
      .select()
      .from(services)
      .where(eq(services.isActive, true))
      .orderBy(asc(services.name));
  }

  // Insurance operations
  async getInsuranceCompanies(): Promise<InsuranceCompany[]> {
    return await db
      .select()
      .from(insuranceCompanies)
      .where(eq(insuranceCompanies.isActive, true))
      .orderBy(asc(insuranceCompanies.name));
  }

  // Commission operations
  async getCommissions(period?: string): Promise<Commission[]> {
    let query = db.select().from(commissions);
    
    if (period) {
      query = query.where(eq(commissions.period, period));
    }
    
    return await query.orderBy(desc(commissions.calculatedAt));
  }

  async calculateCommissions(period: string): Promise<void> {
    // This would implement commission calculation logic
    // For now, returning empty implementation
  }

  // Dashboard statistics
  async getDashboardStats(): Promise<any> {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Get today's appointments
    const todayAppointments = await db
      .select({ count: count() })
      .from(appointments)
      .where(
        and(
          gte(appointments.appointmentDate, startOfDay),
          lte(appointments.appointmentDate, endOfDay)
        )
      );

    // Get today's revenue
    const todayRevenue = await db
      .select({ total: sum(payments.amount) })
      .from(payments)
      .where(
        and(
          gte(payments.paymentDate, startOfDay),
          lte(payments.paymentDate, endOfDay)
        )
      );

    // Get pending appointments
    const pendingAppointments = await db
      .select({ count: count() })
      .from(appointments)
      .where(eq(appointments.status, "en_attente"));

    // Get low stock medications (placeholder)
    const lowStockMeds = await db
      .select({ count: count() })
      .from(medicationLots)
      .where(sql`quantity < 20`);

    return {
      todayPatients: todayAppointments[0]?.count || 0,
      todayRevenue: todayRevenue[0]?.total || 0,
      pendingAppointments: pendingAppointments[0]?.count || 0,
      lowStockMedications: lowStockMeds[0]?.count || 0
    };
  }

  // Reports
  async generateFinancialReport(startDate: Date, endDate: Date): Promise<any> {
    // Revenue by payment method
    const revenueByMethod = await db
      .select({
        method: payments.method,
        total: sum(payments.amount)
      })
      .from(payments)
      .where(
        and(
          gte(payments.paymentDate, startDate),
          lte(payments.paymentDate, endDate)
        )
      )
      .groupBy(payments.method);

    // Total expenses
    const totalExpenses = await db
      .select({ total: sum(expenses.amount) })
      .from(expenses)
      .where(
        and(
          gte(expenses.expenseDate, startDate),
          lte(expenses.expenseDate, endDate)
        )
      );

    return {
      revenueByMethod,
      totalExpenses: totalExpenses[0]?.total || 0
    };
  }

  async generatePatientReport(startDate: Date, endDate: Date): Promise<any> {
    // Patient demographics by city
    const patientsByCity = await db
      .select({
        city: patients.city,
        count: count()
      })
      .from(patients)
      .where(
        and(
          gte(patients.createdAt, startDate),
          lte(patients.createdAt, endDate)
        )
      )
      .groupBy(patients.city);

    return {
      patientsByCity
    };
  }
}

export const storage = new DatabaseStorage();
