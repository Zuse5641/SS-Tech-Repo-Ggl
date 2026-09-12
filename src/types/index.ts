/**
 * Core type definitions for SS Care Technology Doorstep Electronics Repair Platform
 */

export type DeviceCategory = 'phones' | 'tablets' | 'laptops' | 'desktops' | 'consoles';

export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUOTED'
  | 'CUSTOMER_RESPONDED'
  | 'CONFIRMED'
  | 'ASSIGNED'
  | 'TECHNICIAN_ON_WAY'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'LOST';

export type JobStatus =
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'ON_THE_WAY'
  | 'EN_ROUTE'
  | 'ARRIVED'
  | 'DIAGNOSING'
  | 'IN_DIAGNOSIS'
  | 'AWAITING_PART'
  | 'AWAITING_APPROVAL'
  | 'REPAIRING'
  | 'TESTING'
  | 'COMPLETED'
  | 'CANCELLED';

export type UserRole = 'admin' | 'technician' | 'customer' | 'guest';

export interface DeviceBrand {
  id: string;
  name: string;
  category: DeviceCategory;
  logo?: string;
  active: boolean;
  sortOrder: number;
}

export interface DeviceModel {
  id: string;
  brandId: string;
  brandName: string;
  name: string;
  category: DeviceCategory;
  releaseYear?: number;
  active: boolean;
}

export interface RepairIssue {
  id: string;
  category: DeviceCategory;
  name: string;
  description: string;
  estimatedTime: string;
  startingPrice: number;
  warrantyPeriod: string;
  popular?: boolean;
  active: boolean;
}

export interface PricingRule {
  id: string;
  category: DeviceCategory;
  brandId?: string;
  modelId?: string;
  repairId: string;
  partGrade: 'OEM Equivalent' | 'Genuine High-Grade' | 'Premium Original';
  startingPrice: number;
  maximumPrice?: number;
  estimatedTime: string;
  warrantyMonths: number;
  doorstepAvailable: boolean;
  active: boolean;
}

export interface ServiceArea {
  id: string;
  name: string;
  pincode: string;
  zone: 'East' | 'West' | 'North' | 'South' | 'Central';
  active: boolean;
  serviceEta: string; // e.g. "Same Day - 2 to 4 hrs"
  serviceFee: number; // 0 for free doorstep
}

export interface StatusHistoryEntry {
  previousStatus: string;
  newStatus: string;
  timestamp: string;
  updatedBy: string;
  note?: string;
}

export interface RepairRequestLead {
  id: string; // e.g. SSC-20260911-0012
  customerName: string;
  phone: string;
  whatsappNumber: string;
  email?: string;
  address: string;
  locality: string;
  pincode: string;
  addressType: 'Home' | 'Office' | 'Other';
  
  category: DeviceCategory;
  brand: string;
  model: string;
  repairIssue: string;
  notes?: string;
  
  quotedStartingPrice: number;
  approvedFinalPrice?: number;
  preferredDate: string;
  preferredTime: string;
  
  status: LeadStatus;
  jobStatus?: JobStatus;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  
  serviceOtp?: string; // 4-digit arrival OTP
  otpVerified?: boolean;
  diagnosisNotes?: string;
  partNeeded?: string;
  additionalCost?: number;
  customerApprovedAdditionalCost?: boolean;
  customerSignature?: string;
  technicianNotes?: string;
  
  beforePhotos?: string[];
  afterPhotos?: string[];
  
  sourcePage?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  
  createdAt: string;
  updatedAt: string;
  statusHistory: StatusHistoryEntry[];
  
  paymentStatus?: 'PENDING' | 'PAID';
  paymentMethod?: 'UPI' | 'Cash' | 'Card' | 'Online';
  transactionId?: string;
  invoiceId?: string;
  warrantyId?: string;
}

export interface Technician {
  id: string;
  name: string;
  phone: string;
  email?: string;
  photo?: string;
  serviceAreas: string[];
  skills?: DeviceCategory[];
  specialties?: string[];
  availability?: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  rating: number;
  totalJobs?: number;
  repairsCompleted?: number;
  active: boolean;
}

export interface CustomerReview {
  id: string;
  customerName: string;
  locality: string;
  device: string;
  repair: string;
  reviewText: string;
  rating: number;
  photo?: string;
  verified: boolean;
  source: 'Verified Google Review' | 'Verified Customer' | 'WhatsApp Review';
  date: string;
  active: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  sortOrder: number;
  active: boolean;
}

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  requestId: string;
  customerName: string;
  phone: string;
  address: string;
  device: string;
  repair: string;
  partsCost: number;
  labourCost: number;
  additionalCharges: number;
  discount: number;
  tax: number;
  total: number;
  paymentStatus: 'PAID' | 'PENDING';
  paymentMethod: string;
  technicianName: string;
  date: string;
}

export interface WarrantyRecord {
  id: string;
  warrantyNumber: string;
  requestId: string;
  customerName: string;
  device: string;
  repair: string;
  warrantyPeriod: string; // e.g. "6 Months"
  startDate: string;
  expiryDate: string;
  terms: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CLAIMED';
}

export interface BusinessSettings {
  businessName: string;
  tagline: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  googleMapsUrl: string;
  businessHours: string;
  defaultWarranty: string;
  currency: string;
  timezone: string;
  heroHeadline: string;
  heroSubheadline: string;
  trustMetrics: {
    repairsCompleted: string;
    warrantyDays: string;
    certifiedTechs: string;
    avgRating: string;
  };
}
