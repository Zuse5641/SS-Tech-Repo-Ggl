import {
  RepairRequestLead,
  BusinessSettings,
  DeviceBrand,
  DeviceModel,
  RepairIssue,
  ServiceArea,
  CustomerReview,
  FAQItem,
  Technician,
  LeadStatus,
  JobStatus,
  InvoiceRecord,
  WarrantyRecord
} from '../types';
import {
  INITIAL_SETTINGS,
  INITIAL_BRANDS,
  INITIAL_MODELS,
  INITIAL_REPAIRS,
  INITIAL_BANGALORE_AREAS,
  INITIAL_DEMO_LEADS,
  INITIAL_REVIEWS,
  INITIAL_FAQS,
  INITIAL_TECHNICIANS
} from '../config/constants';
import { getDb, handleFirestoreError, OperationType } from '../firebase/config';
import { collection, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';

const STORAGE_KEYS = {
  LEADS: 'sscare_leads_v2',
  SETTINGS: 'sscare_settings_v2',
  BRANDS: 'sscare_brands_v2',
  MODELS: 'sscare_models_v2',
  REPAIRS: 'sscare_repairs_v2',
  AREAS: 'sscare_areas_v2',
  REVIEWS: 'sscare_reviews_v2',
  FAQS: 'sscare_faqs_v2',
  TECHNICIANS: 'sscare_technicians_v2',
  INVOICES: 'sscare_invoices_v2',
  WARRANTIES: 'sscare_warranties_v2'
};

class DataService {
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.initStorage();
  }

  private initStorage() {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BRANDS)) {
      localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(INITIAL_BRANDS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MODELS)) {
      localStorage.setItem(STORAGE_KEYS.MODELS, JSON.stringify(INITIAL_MODELS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REPAIRS)) {
      localStorage.setItem(STORAGE_KEYS.REPAIRS, JSON.stringify(INITIAL_REPAIRS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AREAS)) {
      localStorage.setItem(STORAGE_KEYS.AREAS, JSON.stringify(INITIAL_BANGALORE_AREAS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.FAQS)) {
      localStorage.setItem(STORAGE_KEYS.FAQS, JSON.stringify(INITIAL_FAQS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TECHNICIANS)) {
      localStorage.setItem(STORAGE_KEYS.TECHNICIANS, JSON.stringify(INITIAL_TECHNICIANS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LEADS)) {
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(INITIAL_DEMO_LEADS));
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error('Listener notify error:', err);
      }
    });
  }

  // --- SETTINGS ---
  public getSettings(): BusinessSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  }

  public updateSettings(settings: Partial<BusinessSettings>): BusinessSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));

    // Async sync to firestore if available
    const db = getDb();
    if (db) {
      setDoc(doc(db, 'settings', 'general'), updated, { merge: true }).catch((e) =>
        handleFirestoreError(e, OperationType.WRITE, 'settings/general')
      );
    }

    this.notify();
    return updated;
  }

  public saveSettings(newSettings: BusinessSettings): void {
    this.updateSettings(newSettings);
  }

  // --- LEADS / REPAIRS ---
  public getLeads(): RepairRequestLead[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LEADS);
      return data ? JSON.parse(data) : INITIAL_DEMO_LEADS;
    } catch {
      return INITIAL_DEMO_LEADS;
    }
  }

  public getLeadById(id: string): RepairRequestLead | undefined {
    const leads = this.getLeads();
    return leads.find((l) => l.id.toUpperCase() === id.trim().toUpperCase());
  }

  public generateRequestId(): string {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `SSC-${dateStr}-${randomSuffix}`;
  }

  public createLead(
    leadData: Omit<RepairRequestLead, 'id' | 'createdAt' | 'updatedAt' | 'statusHistory' | 'status'>
  ): RepairRequestLead {
    const id = this.generateRequestId();
    const now = new Date().toISOString();
    
    // Generate a 4-digit arrival OTP
    const serviceOtp = String(Math.floor(1000 + Math.random() * 9000));

    const newLead: RepairRequestLead = {
      ...leadData,
      id,
      status: 'NEW',
      serviceOtp,
      createdAt: now,
      updatedAt: now,
      statusHistory: [
        {
          previousStatus: 'NONE',
          newStatus: 'NEW',
          timestamp: now,
          updatedBy: 'Customer Portal',
          note: 'Online repair request received'
        }
      ]
    };

    const leads = [newLead, ...this.getLeads()];
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));

    // Sync to Firestore
    const db = getDb();
    if (db) {
      setDoc(doc(db, 'leads', id), newLead).catch((e) =>
        handleFirestoreError(e, OperationType.CREATE, `leads/${id}`)
      );
    }

    this.notify();
    return newLead;
  }

  public updateLeadStatus(
    id: string,
    newStatus: LeadStatus,
    updatedBy: string,
    note?: string,
    additionalUpdates: Partial<RepairRequestLead> = {}
  ): RepairRequestLead | undefined {
    const leads = this.getLeads();
    const index = leads.findIndex((l) => l.id === id);
    if (index === -1) return undefined;

    const currentLead = leads[index];
    const previousStatus = currentLead.status;
    const now = new Date().toISOString();

    const updatedEntry = {
      previousStatus,
      newStatus,
      timestamp: now,
      updatedBy,
      note
    };

    const updatedLead: RepairRequestLead = {
      ...currentLead,
      ...additionalUpdates,
      status: newStatus,
      updatedAt: now,
      statusHistory: [updatedEntry, ...currentLead.statusHistory]
    };

    leads[index] = updatedLead;
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));

    const db = getDb();
    if (db) {
      updateDoc(doc(db, 'leads', id), updatedLead as any).catch((e) =>
        handleFirestoreError(e, OperationType.UPDATE, `leads/${id}`)
      );
    }

    this.notify();
    return updatedLead;
  }

  public assignTechnician(leadId: string, technicianId: string, technicianName: string): RepairRequestLead | undefined {
    return this.updateLeadStatus(
      leadId,
      'ASSIGNED',
      'Admin Dispatch',
      `Assigned to technician ${technicianName}`,
      {
        assignedTechnicianId: technicianId,
        assignedTechnicianName: technicianName,
        jobStatus: 'ASSIGNED'
      }
    );
  }

  public updateLead(leadId: string, patch: Partial<RepairRequestLead>): RepairRequestLead | undefined {
    return this.updateLeadStatus(
      leadId,
      patch.status || 'CONFIRMED',
      'Admin Manager',
      'Lead details updated from Admin Dashboard',
      patch
    );
  }

  public updateJobStatus(
    leadId: string,
    jobStatus: JobStatus,
    updatedBy: string,
    note?: string,
    patch: Partial<RepairRequestLead> = {}
  ): RepairRequestLead | undefined {
    let leadStatus: LeadStatus = 'ASSIGNED';
    if (jobStatus === 'ON_THE_WAY' || jobStatus === 'EN_ROUTE') leadStatus = 'TECHNICIAN_ON_WAY';
    else if (
      jobStatus === 'ARRIVED' ||
      jobStatus === 'DIAGNOSING' ||
      jobStatus === 'IN_DIAGNOSIS' ||
      jobStatus === 'REPAIRING' ||
      jobStatus === 'TESTING' ||
      jobStatus === 'AWAITING_APPROVAL' ||
      jobStatus === 'AWAITING_PART'
    ) {
      leadStatus = 'IN_PROGRESS';
    } else if (jobStatus === 'COMPLETED') {
      leadStatus = 'COMPLETED';
    } else if (jobStatus === 'CANCELLED') {
      leadStatus = 'CANCELLED';
    }

    return this.updateLeadStatus(leadId, leadStatus, updatedBy, note, {
      ...patch,
      jobStatus
    });
  }

  // --- CATALOGS ---
  public getBrands(category?: string): DeviceBrand[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BRANDS);
      const all: DeviceBrand[] = data ? JSON.parse(data) : INITIAL_BRANDS;
      return category ? all.filter((b) => b.category === category && b.active) : all;
    } catch {
      return INITIAL_BRANDS;
    }
  }

  public addBrand(brand: Omit<DeviceBrand, 'id'>): DeviceBrand {
    const id = `b-${Date.now()}`;
    const newBrand: DeviceBrand = { ...brand, id };
    const all = [...this.getBrands(), newBrand];
    localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(all));
    this.notify();
    return newBrand;
  }

  public getModels(brandName?: string, category?: string): DeviceModel[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MODELS);
      const all: DeviceModel[] = data ? JSON.parse(data) : INITIAL_MODELS;
      return all.filter((m) => {
        if (!m.active) return false;
        if (brandName && m.brandName !== brandName) return false;
        if (category && m.category !== category) return false;
        return true;
      });
    } catch {
      return INITIAL_MODELS;
    }
  }

  public addModel(model: Omit<DeviceModel, 'id'>): DeviceModel {
    const id = `m-${Date.now()}`;
    const newModel: DeviceModel = { ...model, id };
    const all = [...this.getModels(), newModel];
    localStorage.setItem(STORAGE_KEYS.MODELS, JSON.stringify(all));
    this.notify();
    return newModel;
  }

  public getRepairs(category?: string): RepairIssue[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REPAIRS);
      const all: RepairIssue[] = data ? JSON.parse(data) : INITIAL_REPAIRS;
      return category ? all.filter((r) => r.category === category && r.active) : all;
    } catch {
      return INITIAL_REPAIRS;
    }
  }

  public updateRepair(id: string, patch: Partial<RepairIssue>) {
    const all = this.getRepairs();
    const idx = all.findIndex((r) => r.id === id);
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...patch };
      localStorage.setItem(STORAGE_KEYS.REPAIRS, JSON.stringify(all));
      this.notify();
    }
  }

  public addRepair(repair: Omit<RepairIssue, 'id'>): RepairIssue {
    const id = `r-${Date.now()}`;
    const newRepair: RepairIssue = { ...repair, id };
    const all = [...this.getRepairs(), newRepair];
    localStorage.setItem(STORAGE_KEYS.REPAIRS, JSON.stringify(all));
    this.notify();
    return newRepair;
  }

  // --- SERVICE AREAS ---
  public getServiceAreas(): ServiceArea[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AREAS);
      return data ? JSON.parse(data) : INITIAL_BANGALORE_AREAS;
    } catch {
      return INITIAL_BANGALORE_AREAS;
    }
  }

  public addServiceArea(area: Omit<ServiceArea, 'id'>): ServiceArea {
    const id = `a-${Date.now()}`;
    const newArea: ServiceArea = { ...area, id };
    const all = [...this.getServiceAreas(), newArea];
    localStorage.setItem(STORAGE_KEYS.AREAS, JSON.stringify(all));
    this.notify();
    return newArea;
  }

  public toggleAreaActive(id: string) {
    const all = this.getServiceAreas();
    const idx = all.findIndex((a) => a.id === id);
    if (idx !== -1) {
      all[idx].active = !all[idx].active;
      localStorage.setItem(STORAGE_KEYS.AREAS, JSON.stringify(all));
      this.notify();
    }
  }

  public toggleServiceArea(id: string) {
    this.toggleAreaActive(id);
  }

  // --- TECHNICIANS ---
  public getTechnicians(): Technician[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TECHNICIANS);
      return data ? JSON.parse(data) : INITIAL_TECHNICIANS;
    } catch {
      return INITIAL_TECHNICIANS;
    }
  }

  public addTechnician(tech: Omit<Technician, 'id'>): Technician {
    const id = `tech-${Date.now()}`;
    const newTech: Technician = { ...tech, id };
    const all = [...this.getTechnicians(), newTech];
    localStorage.setItem(STORAGE_KEYS.TECHNICIANS, JSON.stringify(all));
    this.notify();
    return newTech;
  }

  // --- REVIEWS ---
  public getReviews(): CustomerReview[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      return data ? JSON.parse(data) : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  }

  public addReview(review: Omit<CustomerReview, 'id'>): CustomerReview {
    const id = `rev-${Date.now()}`;
    const newRev: CustomerReview = { ...review, id };
    const all = [newRev, ...this.getReviews()];
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(all));
    this.notify();
    return newRev;
  }

  // --- FAQS ---
  public getFaqs(): FAQItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAQS);
      return data ? JSON.parse(data) : INITIAL_FAQS;
    } catch {
      return INITIAL_FAQS;
    }
  }

  public getFAQs(): FAQItem[] {
    return this.getFaqs();
  }

  public addFaq(faq: Omit<FAQItem, 'id'>): FAQItem {
    const id = `faq-${Date.now()}`;
    const newFaq: FAQItem = { ...faq, id };
    const all = [...this.getFaqs(), newFaq];
    localStorage.setItem(STORAGE_KEYS.FAQS, JSON.stringify(all));
    this.notify();
    return newFaq;
  }

  public completeJob(
    leadId: string,
    finalAmount: number,
    paymentMethod: string,
    technicianNotes?: string,
    signature?: string
  ): RepairRequestLead | undefined {
    const lead = this.getLeadById(leadId);
    if (!lead) return undefined;

    const updatedLead: RepairRequestLead = {
      ...lead,
      approvedFinalPrice: finalAmount,
      technicianNotes,
      customerSignature: signature
    };

    const { invoice, warranty } = this.generateInvoiceAndWarranty(updatedLead, paymentMethod);
    return this.updateLeadStatus(
      leadId,
      'COMPLETED',
      lead.assignedTechnicianName || 'Technician',
      `Job completed. Paid via ${paymentMethod}. Invoice #${invoice.invoiceNumber}. Warranty #${warranty.warrantyNumber}`,
      {
        jobStatus: 'COMPLETED',
        approvedFinalPrice: finalAmount,
        paymentStatus: 'PAID',
        paymentMethod: paymentMethod as any,
        invoiceId: invoice.id,
        warrantyId: warranty.id,
        technicianNotes,
        customerSignature: signature
      }
    );
  }

  // --- INVOICES & WARRANTIES ---
  public generateInvoiceAndWarranty(lead: RepairRequestLead, paymentMethod: string): { invoice: InvoiceRecord; warranty: WarrantyRecord } {
    const partsCost = Math.round((lead.approvedFinalPrice || lead.quotedStartingPrice) * 0.7);
    const labourCost = Math.round((lead.approvedFinalPrice || lead.quotedStartingPrice) * 0.3);
    const total = partsCost + labourCost;

    const invoice: InvoiceRecord = {
      id: `INV-${Date.now()}`,
      invoiceNumber: `SSC-INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      requestId: lead.id,
      customerName: lead.customerName,
      phone: lead.phone,
      address: `${lead.address}, ${lead.locality}, Bengaluru - ${lead.pincode}`,
      device: `${lead.brand} ${lead.model}`,
      repair: lead.repairIssue,
      partsCost,
      labourCost,
      additionalCharges: 0,
      discount: 0,
      tax: Math.round(total * 0.18),
      total: Math.round(total * 1.18),
      paymentStatus: 'PAID',
      paymentMethod,
      technicianName: lead.assignedTechnicianName || 'Certified Technician',
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    };

    const warranty: WarrantyRecord = {
      id: `WAR-${Date.now()}`,
      warrantyNumber: `SSC-WAR-${Math.floor(100000 + Math.random() * 900000)}`,
      requestId: lead.id,
      customerName: lead.customerName,
      device: `${lead.brand} ${lead.model}`,
      repair: lead.repairIssue,
      warrantyPeriod: '6 Months Genuine Warranty',
      startDate: new Date().toISOString().slice(0, 10),
      expiryDate: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      terms: 'Covers touch calibration, internal display defects, and component failure. Physical or liquid damage excluded.',
      status: 'ACTIVE'
    };

    // Save
    const invoices = this.getInvoices();
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify([invoice, ...invoices]));

    const warranties = this.getWarranties();
    localStorage.setItem(STORAGE_KEYS.WARRANTIES, JSON.stringify([warranty, ...warranties]));

    // Update lead record with invoice and warranty IDs
    this.updateLeadStatus(lead.id, 'COMPLETED', lead.assignedTechnicianName || 'Technician', 'Repair finished & invoice issued', {
      jobStatus: 'COMPLETED',
      invoiceId: invoice.id,
      warrantyId: warranty.id,
      paymentStatus: 'PAID',
      paymentMethod: paymentMethod as any
    });

    return { invoice, warranty };
  }

  public getInvoices(): InvoiceRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INVOICES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public getInvoiceByRequestId(requestId: string): InvoiceRecord | undefined {
    return this.getInvoices().find((i) => i.requestId === requestId);
  }

  public getWarranties(): WarrantyRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WARRANTIES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public getWarrantyByRequestId(requestId: string): WarrantyRecord | undefined {
    return this.getWarranties().find((w) => w.requestId === requestId);
  }

  public resetToDefaultSeed() {
    localStorage.removeItem(STORAGE_KEYS.LEADS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.BRANDS);
    localStorage.removeItem(STORAGE_KEYS.MODELS);
    localStorage.removeItem(STORAGE_KEYS.REPAIRS);
    localStorage.removeItem(STORAGE_KEYS.AREAS);
    localStorage.removeItem(STORAGE_KEYS.REVIEWS);
    localStorage.removeItem(STORAGE_KEYS.FAQS);
    localStorage.removeItem(STORAGE_KEYS.TECHNICIANS);
    this.initStorage();
    this.notify();
  }
}

export const dataService = new DataService();
