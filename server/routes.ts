import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertPatientSchema, insertAppointmentSchema, insertConsultationSchema, insertInvoiceSchema, insertPaymentSchema, insertExpenseSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const user = await storage.authenticateUser(username, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set session
      (req.session as any).user = { id: user.id, username: user.username, role: user.role };
      
      res.json({ user: { id: user.id, username: user.username, role: user.role, firstName: user.firstName, lastName: user.lastName } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    const user = (req.session as any)?.user;
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json({ user });
  });

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    const user = req.session?.user;
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    req.user = user;
    next();
  };

  // Middleware to check role-based access
  const requireRole = (allowedRoles: string[]) => {
    return (req: any, res: any, next: any) => {
      const user = req.session?.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      req.user = user;
      next();
    };
  };

  // Patient routes
  app.get("/api/patients", requireRole(['superviseur', 'medecin', 'secretaire']), async (req, res) => {
    try {
      const { limit = 50, offset = 0, search } = req.query;
      
      let patients;
      if (search) {
        patients = await storage.searchPatients(search as string);
      } else {
        patients = await storage.getPatients(parseInt(limit as string), parseInt(offset as string));
      }
      
      res.json(patients);
    } catch (error) {
      console.error("Get patients error:", error);
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  app.get("/api/patients/:id", requireRole(['superviseur', 'medecin', 'secretaire']), async (req, res) => {
    try {
      console.log('Getting patient with ID:', req.params.id, 'Type:', typeof req.params.id);
      const patient = await storage.getPatient(req.params.id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      res.json(patient);
    } catch (error) {
      console.error("Get patient error:", error);
      res.status(500).json({ message: "Failed to fetch patient" });
    }
  });

  app.post("/api/patients", requireRole(['superviseur', 'secretaire']), async (req, res) => {
    try {
      const validatedData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(validatedData);
      res.status(201).json(patient);
    } catch (error) {
      console.error("Create patient error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create patient" });
    }
  });

  app.put("/api/patients/:id", requireAuth, async (req, res) => {
    try {
      const validatedData = insertPatientSchema.partial().parse(req.body);
      const patient = await storage.updatePatient(req.params.id, validatedData);
      res.json(patient);
    } catch (error) {
      console.error("Update patient error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update patient" });
    }
  });

  // Appointment routes
  app.get("/api/appointments", requireAuth, async (req, res) => {
    try {
      const { date } = req.query;
      const filterDate = date ? new Date(date as string) : undefined;
      const appointments = await storage.getAppointments(filterDate);
      res.json(appointments);
    } catch (error) {
      console.error("Get appointments error:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.post("/api/appointments", requireAuth, async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(validatedData);
      res.status(201).json(appointment);
    } catch (error) {
      console.error("Create appointment error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  app.put("/api/appointments/:id", requireAuth, async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.partial().parse(req.body);
      const appointment = await storage.updateAppointment(req.params.id, validatedData);
      res.json(appointment);
    } catch (error) {
      console.error("Update appointment error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });

  // Consultation routes
  app.get("/api/consultations", requireRole(['superviseur', 'medecin']), async (req, res) => {
    try {
      const { patientId } = req.query;
      const consultations = await storage.getConsultations(patientId as string);
      res.json(consultations);
    } catch (error) {
      console.error("Get consultations error:", error);
      res.status(500).json({ message: "Failed to fetch consultations" });
    }
  });

  app.post("/api/consultations", requireRole(['superviseur', 'medecin']), async (req, res) => {
    try {
      const validatedData = insertConsultationSchema.parse({
        ...req.body,
        doctorId: req.user.id
      });
      const consultation = await storage.createConsultation(validatedData);
      res.status(201).json(consultation);
    } catch (error) {
      console.error("Create consultation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create consultation" });
    }
  });

  // Medication routes
  app.get("/api/medications", requireRole(['superviseur', 'medecin', 'pharmacien']), async (req, res) => {
    try {
      const medications = await storage.getMedications();
      res.json(medications);
    } catch (error) {
      console.error("Get medications error:", error);
      res.status(500).json({ message: "Failed to fetch medications" });
    }
  });

  // Invoice routes
  app.get("/api/invoices", requireAuth, async (req, res) => {
    try {
      const { patientId } = req.query;
      const invoices = await storage.getInvoices(patientId as string);
      res.json(invoices);
    } catch (error) {
      console.error("Get invoices error:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.post("/api/invoices", requireAuth, async (req, res) => {
    try {
      const validatedData = insertInvoiceSchema.parse({
        ...req.body,
        createdBy: req.user.id
      });
      const invoice = await storage.createInvoice(validatedData);
      res.status(201).json(invoice);
    } catch (error) {
      console.error("Create invoice error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  // Payment routes
  app.get("/api/payments", requireAuth, async (req, res) => {
    try {
      const { invoiceId } = req.query;
      const payments = await storage.getPayments(invoiceId as string);
      res.json(payments);
    } catch (error) {
      console.error("Get payments error:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.post("/api/payments", requireAuth, async (req, res) => {
    try {
      const validatedData = insertPaymentSchema.parse({
        ...req.body,
        receivedBy: req.user.id
      });
      const payment = await storage.createPayment(validatedData);
      res.status(201).json(payment);
    } catch (error) {
      console.error("Create payment error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  // Cash register routes
  app.get("/api/cash-register/current", requireAuth, async (req, res) => {
    try {
      const cashRegister = await storage.getCurrentCashRegister(req.user.id);
      res.json(cashRegister);
    } catch (error) {
      console.error("Get cash register error:", error);
      res.status(500).json({ message: "Failed to fetch cash register" });
    }
  });

  app.post("/api/cash-register/open", requireAuth, async (req, res) => {
    try {
      const { openingBalance } = req.body;
      const cashRegister = await storage.openCashRegister(req.user.id, openingBalance);
      res.status(201).json(cashRegister);
    } catch (error) {
      console.error("Open cash register error:", error);
      res.status(500).json({ message: "Failed to open cash register" });
    }
  });

  app.post("/api/cash-register/:id/close", requireAuth, async (req, res) => {
    try {
      const { closingBalance } = req.body;
      const cashRegister = await storage.closeCashRegister(req.params.id, closingBalance);
      res.json(cashRegister);
    } catch (error) {
      console.error("Close cash register error:", error);
      res.status(500).json({ message: "Failed to close cash register" });
    }
  });

  // Expense routes
  app.get("/api/expenses", requireAuth, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      const expenses = await storage.getExpenses(start, end);
      res.json(expenses);
    } catch (error) {
      console.error("Get expenses error:", error);
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.post("/api/expenses", requireAuth, async (req, res) => {
    try {
      const validatedData = insertExpenseSchema.parse({
        ...req.body,
        recordedBy: req.user.id
      });
      const expense = await storage.createExpense(validatedData);
      res.status(201).json(expense);
    } catch (error) {
      console.error("Create expense error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create expense" });
    }
  });

  // Service routes
  app.get("/api/services", requireAuth, async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      console.error("Get services error:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  // Insurance routes
  app.get("/api/insurance-companies", requireAuth, async (req, res) => {
    try {
      const companies = await storage.getInsuranceCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Get insurance companies error:", error);
      res.status(500).json({ message: "Failed to fetch insurance companies" });
    }
  });

  // Commission routes
  app.get("/api/commissions", requireAuth, async (req, res) => {
    try {
      const { period } = req.query;
      const commissions = await storage.getCommissions(period as string);
      res.json(commissions);
    } catch (error) {
      console.error("Get commissions error:", error);
      res.status(500).json({ message: "Failed to fetch commissions" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Report routes
  app.post("/api/reports/financial", requireAuth, async (req, res) => {
    try {
      const { startDate, endDate } = req.body;
      const report = await storage.generateFinancialReport(new Date(startDate), new Date(endDate));
      res.json(report);
    } catch (error) {
      console.error("Generate financial report error:", error);
      res.status(500).json({ message: "Failed to generate financial report" });
    }
  });

  app.post("/api/reports/patients", requireAuth, async (req, res) => {
    try {
      const { startDate, endDate } = req.body;
      const report = await storage.generatePatientReport(new Date(startDate), new Date(endDate));
      res.json(report);
    } catch (error) {
      console.error("Generate patient report error:", error);
      res.status(500).json({ message: "Failed to generate patient report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
