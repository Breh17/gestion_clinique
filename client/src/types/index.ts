export interface Patient {
  id: string;
  fileNumber: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  region?: string;
  country?: string;
  bloodType?: string;
  allergies?: string;
  medicalHistory?: string;
  emergencyContact?: string;
  status: 'actif' | 'inactif' | 'decede';
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  serviceId?: string;
  appointmentDate: string;
  duration: number;
  reason?: string;
  status: 'programme' | 'en_attente' | 'en_consultation' | 'termine' | 'annule';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  consultationDate: string;
  reason?: string;
  anamnesis?: string;
  clinicalExam?: string;
  vitals?: any;
  diagnosis?: string;
  diagnosisCode?: string;
  recommendations?: string;
  followUpDate?: string;
  createdAt: string;
}

export interface Medication {
  id: string;
  name: string;
  dci?: string;
  form?: string;
  dosage?: string;
  packaging?: string;
  barcode?: string;
  purchasePrice?: string;
  salePrice?: string;
  tax?: string;
  category?: string;
  requiresPrescription: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  consultationId?: string;
  totalAmount: string;
  insuranceCoverage?: string;
  patientAmount: string;
  discount?: string;
  status: 'brouillon' | 'validee' | 'payee' | 'partiellement_payee' | 'annulee';
  invoiceDate: string;
  dueDate?: string;
  createdBy: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: string;
  method: 'especes' | 'carte' | 'cheque' | 'virement' | 'mobile_money';
  reference?: string;
  paymentDate: string;
  receivedBy: string;
  notes?: string;
  createdAt: string;
}

export interface Service {
  id: string;
  code: string;
  name: string;
  description?: string;
  publicPrice: string;
  insurancePrice?: string;
  duration?: number;
  department?: string;
  isActive: boolean;
  createdAt: string;
}

export interface InsuranceCompany {
  id: string;
  name: string;
  type: string;
  coverageRates?: any;
  ceilings?: any;
  isActive: boolean;
  createdAt: string;
}

export interface Commission {
  id: string;
  practitionerId: string;
  invoiceId?: string;
  serviceId?: string;
  baseAmount: string;
  commissionRate?: string;
  commissionAmount: string;
  period?: string;
  status: 'a_payer' | 'payee';
  calculatedAt: string;
  paidAt?: string;
}

export interface Expense {
  id: string;
  category: string;
  description?: string;
  amount: string;
  supplier?: string;
  paymentMethod?: 'especes' | 'carte' | 'cheque' | 'virement' | 'mobile_money';
  receiptNumber?: string;
  expenseDate: string;
  attachmentPath?: string;
  recordedBy: string;
  createdAt: string;
}
