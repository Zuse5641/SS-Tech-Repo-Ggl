import React, { useState, useEffect } from 'react';
import {
  Users,
  Layers,
  MapPin,
  Wrench,
  Star,
  HelpCircle,
  Settings,
  TrendingUp,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Trash2,
  Edit,
  Plus,
  Phone,
  MessageCircle,
  Eye,
  ShieldCheck,
  Award,
  AlertCircle,
  LogOut,
  ExternalLink,
  Lock,
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import {
  RepairRequestLead,
  LeadStatus,
  Technician,
  ServiceArea,
  CustomerReview,
  FAQItem,
  BusinessSettings,
  DeviceBrand,
  RepairIssue
} from '../types';
import { dataService } from '../services/dataService';
import {
  buildWhatsAppQuoteUrl,
  buildLeadDispatchWhatsAppUrl,
  buildTechnicianJobAssignmentWhatsAppUrl,
  buildTestLeadWhatsAppUrl,
  sanitizePhoneNumber
} from '../utils/whatsapp';
import { securityService, SecurityAuditLog } from '../services/securityService';
import { useAuth } from '../context/AuthContext';

interface AdminDashboardProps {
  onNavigateHome?: () => void;
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateHome,
  onLogout
}) => {
  const { user, logoutAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'leads' | 'catalog' | 'areas' | 'technicians' | 'reviews' | 'faqs' | 'settings' | 'security' | 'analytics'
  >('leads');

  // Core state from dataService
  const [leads, setLeads] = useState<RepairRequestLead[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [areas, setAreas] = useState<ServiceArea[]>([]);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>(dataService.getSettings());

  // Security & Auth state
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([]);
  const [techSecurityList, setTechSecurityList] = useState<any[]>([]);
  const [currentAdminPassword, setCurrentAdminPassword] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [passwordChangeStatus, setPasswordChangeStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selectedTechForPin, setSelectedTechForPin] = useState<string>('tech-01');
  const [newTechPin, setNewTechPin] = useState<string>('');
  const [pinChangeStatus, setPinChangeStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [settingsSavedAlert, setSettingsSavedAlert] = useState(false);

  // Filter & Search states
  const [leadSearch, setLeadSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedLead, setSelectedLead] = useState<RepairRequestLead | null>(null);

  // New Area modal state
  const [showAddAreaModal, setShowAddAreaModal] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaPincode, setNewAreaPincode] = useState('');
  const [newAreaEta, setNewAreaEta] = useState('45-60 mins');
  const [newAreaFee, setNewAreaFee] = useState(0);

  // New Technician modal state
  const [showAddTechModal, setShowAddTechModal] = useState(false);
  const [newTechName, setNewTechName] = useState('');
  const [newTechPhone, setNewTechPhone] = useState('');
  const [newTechEmail, setNewTechEmail] = useState('');
  const [newTechSpecialty, setNewTechSpecialty] = useState('phones,laptops');

  // Load and subscribe
  const refreshData = () => {
    setLeads(dataService.getLeads());
    setTechnicians(dataService.getTechnicians());
    setAreas(dataService.getServiceAreas());
    setReviews(dataService.getReviews());
    setFaqs(dataService.getFAQs());
    setSettings(dataService.getSettings());
    setAuditLogs(securityService.getAuditLogs());
    setTechSecurityList(securityService.getTechniciansSecurityStatus());
  };

  useEffect(() => {
    refreshData();
    const unsub = dataService.subscribe(refreshData);
    return () => unsub();
  }, []);

  const handleChangeAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeStatus(null);

    if (newAdminPassword !== confirmAdminPassword) {
      setPasswordChangeStatus({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    if (newAdminPassword.length < 6) {
      setPasswordChangeStatus({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }

    const res = await securityService.changeAdminPassword(
      user?.email || 'admin@sscaretechnology.com',
      currentAdminPassword,
      newAdminPassword
    );

    if (res.success) {
      setPasswordChangeStatus({
        type: 'success',
        message: 'Admin password successfully rotated with PBKDF2-SHA256 and fresh cryptographic salt.'
      });
      setCurrentAdminPassword('');
      setNewAdminPassword('');
      setConfirmAdminPassword('');
      setAuditLogs(securityService.getAuditLogs());
    } else {
      setPasswordChangeStatus({
        type: 'error',
        message: res.error || 'Failed to update admin password.'
      });
    }
  };

  const handleUpdateTechPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeStatus(null);

    if (!/^\d{4,6}$/.test(newTechPin.trim())) {
      setPinChangeStatus({ type: 'error', message: 'Technician PIN must be 4 to 6 numeric digits.' });
      return;
    }

    const res = await securityService.updateTechnicianPin(selectedTechForPin, newTechPin.trim());
    if (res.success) {
      setPinChangeStatus({
        type: 'success',
        message: `Security PIN for ${selectedTechForPin} updated and re-hashed with PBKDF2.`
      });
      setNewTechPin('');
      setTechSecurityList(securityService.getTechniciansSecurityStatus());
      setAuditLogs(securityService.getAuditLogs());
    } else {
      setPinChangeStatus({
        type: 'error',
        message: res.error || 'Failed to update technician PIN.'
      });
    }
  };

  // Filtered leads
  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.id.toLowerCase().includes(leadSearch.toLowerCase()) ||
      l.customerName.toLowerCase().includes(leadSearch.toLowerCase()) ||
      l.phone.includes(leadSearch) ||
      l.brand.toLowerCase().includes(leadSearch.toLowerCase()) ||
      l.locality.toLowerCase().includes(leadSearch.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['RequestID,CustomerName,Phone,WhatsApp,Locality,Device,Repair,Status,QuotedPrice,Date'];
    const rows = leads.map((l) =>
      `"${l.id}","${l.customerName}","${l.phone}","${l.whatsappNumber}","${l.locality}","${l.brand} ${l.model}","${l.repairIssue}","${l.status}","${l.quotedStartingPrice}","${l.createdAt}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sscare_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Assign Technician
  const handleAssignTechnician = (leadId: string, techId: string) => {
    const tech = technicians.find((t) => t.id === techId);
    if (!tech) return;

    dataService.assignTechnician(leadId, tech.id, tech.name);
    if (selectedLead?.id === leadId) {
      setSelectedLead(dataService.getLeadById(leadId) || null);
    }
  };

  // Change Status
  const handleUpdateLeadStatus = (leadId: string, nextStatus: LeadStatus) => {
    dataService.updateLead(leadId, { status: nextStatus });
    if (selectedLead?.id === leadId) {
      setSelectedLead(dataService.getLeadById(leadId) || null);
    }
  };

  // Create new Area
  const handleCreateArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAreaName.trim() || !newAreaPincode.trim()) return;

    dataService.addServiceArea({
      name: newAreaName.trim(),
      pincode: newAreaPincode.trim(),
      zone: 'Central',
      active: true,
      serviceEta: newAreaEta,
      serviceFee: Number(newAreaFee) || 0
    });

    setNewAreaName('');
    setNewAreaPincode('');
    setShowAddAreaModal(false);
  };

  // Create new Technician
  const handleCreateTech = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTechName.trim() || !newTechPhone.trim()) return;

    dataService.addTechnician({
      name: newTechName.trim(),
      phone: newTechPhone.trim(),
      email: newTechEmail.trim() || 'tech@sscaretechnology.com',
      specialties: newTechSpecialty.split(',') as any,
      active: true,
      serviceAreas: ['All Bangalore Zones'],
      rating: 4.9,
      repairsCompleted: 0
    });

    setNewTechName('');
    setNewTechPhone('');
    setNewTechEmail('');
    setShowAddTechModal(false);
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    dataService.saveSettings(settings);
    alert('Business settings updated successfully!');
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Admin Title & Nav Tabs */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white font-['Space_Grotesk']">
              SS Care Central Admin
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold uppercase tracking-wider">
              Admin Role
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Manage inbound Bangalore repair leads, technician assignments, catalog pricing, and coverage areas.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1a1d29] hover:bg-[#222738] text-white text-xs font-semibold border border-gray-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#FF5A1F]" />
            <span>Export CSV</span>
          </button>

          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#161824] hover:bg-[#1e2232] text-gray-300 hover:text-white text-xs font-semibold border border-gray-800 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
              <span>Customer Site</span>
            </button>
          )}

          <button
            onClick={() => {
              logoutAdmin();
              if (onLogout) {
                onLogout();
              } else if (onNavigateHome) {
                onNavigateHome();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1.5 border-b border-gray-800 pb-2 mb-6 overflow-x-auto no-scrollbar scroll-smooth">
        {[
          { id: 'leads', label: 'Leads & Dispatches', icon: <Users className="w-4 h-4" /> },
          { id: 'areas', label: 'Service Areas', icon: <MapPin className="w-4 h-4" /> },
          { id: 'technicians', label: 'Technicians', icon: <Wrench className="w-4 h-4" /> },
          { id: 'reviews', label: 'Reviews', icon: <Star className="w-4 h-4" /> },
          { id: 'faqs', label: 'FAQs', icon: <HelpCircle className="w-4 h-4" /> },
          { id: 'settings', label: 'Business Settings', icon: <Settings className="w-4 h-4" /> },
          { id: 'security', label: 'Security & Auth', icon: <Lock className="w-4 h-4" /> },
          { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors min-h-[40px] shrink-0 ${
              activeTab === tab.id
                ? 'bg-[#FF5A1F] text-white shadow-md shadow-[#FF5A1F]/20'
                : 'text-gray-400 hover:text-white hover:bg-[#151722]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ================= TAB 1: LEADS MANAGEMENT ================= */}
      {activeTab === 'leads' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Controls Bar: Search & Status Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#12141e] border border-[#212536] p-3 rounded-2xl">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by ID, name, phone, area..."
                value={leadSearch}
                onChange={(e) => setLeadSearch(e.target.value)}
                className="w-full bg-[#171a26] border border-gray-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5A1F] min-h-[40px]"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar pb-1 sm:pb-0">
              <Filter className="w-3.5 h-3.5 text-gray-500 shrink-0 hidden sm:block" />
              {(['ALL', 'NEW', 'CONFIRMED', 'ASSIGNED', 'TECHNICIAN_ON_WAY', 'IN_PROGRESS', 'COMPLETED'] as const).map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors shrink-0 min-h-[36px] ${
                      statusFilter === st
                        ? 'bg-[#FF5A1F]/20 text-[#FF5A1F] border border-[#FF5A1F]/40'
                        : 'text-gray-400 hover:text-white bg-[#171a26]'
                    }`}
                  >
                    {st.replace(/_/g, ' ')}
                  </button>
                )
              )}
            </div>
          </div>

          {/* MOBILE CARDS VIEW (< 768px) */}
          <div className="block md:hidden space-y-3">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="bg-[#12141e] border border-[#212536] rounded-2xl p-4 space-y-3 shadow-lg hover:border-[#2d334a] transition-all"
              >
                {/* Header: ID, Status, Eye */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#FF5A1F]">{lead.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        lead.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : lead.status === 'NEW'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-sky-500/20 text-sky-400'
                      }`}
                    >
                      {lead.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedLead(lead)}
                    className="p-2 rounded-xl bg-[#1a1e2d] text-gray-300 hover:text-white min-w-[36px] min-h-[36px] flex items-center justify-center"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {/* Customer info & Quick Contact */}
                <div className="flex items-center justify-between border-y border-gray-800/80 py-2">
                  <div>
                    <h4 className="text-white font-bold text-sm">{lead.customerName}</h4>
                    <p className="text-xs text-gray-400">{lead.locality} • {lead.pincode}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${lead.phone}`}
                      className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 flex items-center justify-center min-w-[36px] min-h-[36px]"
                      title="Call Customer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={buildWhatsAppQuoteUrl({
                        businessNumber: lead.whatsappNumber,
                        requestId: lead.id,
                        customerName: lead.customerName
                      })}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 hover:bg-[#25D366]/20 flex items-center justify-center min-w-[36px] min-h-[36px]"
                      title="WhatsApp Customer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Device & Issue */}
                <div className="text-xs">
                  <span className="text-white font-medium">{lead.brand} {lead.model}</span>
                  <p className="text-[11px] text-gray-400 mt-0.5">{lead.repairIssue}</p>
                </div>

                {/* Price & Technician Assignment */}
                <div className="flex items-center justify-between pt-1 gap-2">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase block font-semibold">Estimated Price</span>
                    <span className="text-sm font-black text-emerald-400 font-mono">
                      ₹{(lead.approvedFinalPrice || lead.quotedStartingPrice).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="w-1/2">
                    <span className="text-[10px] text-gray-500 uppercase block font-semibold mb-0.5">Assign Tech</span>
                    <select
                      value={lead.assignedTechnicianId || ''}
                      onChange={(e) => handleAssignTechnician(lead.id, e.target.value)}
                      className="w-full bg-[#181b28] border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white"
                    >
                      <option value="">Unassigned</option>
                      {technicians.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* WhatsApp Dispatch Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-800/80">
                  <a
                    href={buildLeadDispatchWhatsAppUrl({
                      businessNumber: settings.whatsappNumber,
                      requestId: lead.id,
                      customerName: lead.customerName,
                      phone: lead.phone,
                      whatsappNumber: lead.whatsappNumber,
                      locality: lead.locality,
                      pincode: lead.pincode,
                      address: lead.address,
                      category: lead.category,
                      brand: lead.brand,
                      model: lead.model,
                      repairIssue: lead.repairIssue,
                      quotedStartingPrice: lead.quotedStartingPrice,
                      preferredDate: lead.preferredDate,
                      preferredTime: lead.preferredTime,
                      serviceOtp: lead.serviceOtp,
                      notes: lead.notes
                    })}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-1.5 px-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    title="Forward entire lead ticket to business WhatsApp"
                  >
                    <MessageCircle className="w-3 h-3 fill-emerald-400" />
                    <span>Send to Desk WA</span>
                  </a>

                  {lead.assignedTechnicianId && (
                    <a
                      href={buildTechnicianJobAssignmentWhatsAppUrl(
                        technicians.find((t) => t.id === lead.assignedTechnicianId)?.phone || settings.whatsappNumber,
                        {
                          businessNumber: settings.whatsappNumber,
                          requestId: lead.id,
                          customerName: lead.customerName,
                          phone: lead.phone,
                          whatsappNumber: lead.whatsappNumber,
                          locality: lead.locality,
                          pincode: lead.pincode,
                          address: lead.address,
                          category: lead.category,
                          brand: lead.brand,
                          model: lead.model,
                          repairIssue: lead.repairIssue,
                          quotedStartingPrice: lead.approvedFinalPrice || lead.quotedStartingPrice,
                          preferredDate: lead.preferredDate,
                          preferredTime: lead.preferredTime,
                          serviceOtp: lead.serviceOtp
                        }
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-1.5 px-2 bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      title="Dispatch job assignment to technician on WhatsApp"
                    >
                      <Wrench className="w-3 h-3" />
                      <span>Route to Tech</span>
                    </a>
                  )}
                </div>
              </div>
            ))}

            {filteredLeads.length === 0 && (
              <div className="bg-[#12141e] border border-dashed border-gray-800 rounded-2xl p-8 text-center text-gray-500 text-xs">
                No repair leads match your search or filter criteria.
              </div>
            )}
          </div>

          {/* DESKTOP LEADS TABLE (>= 768px) */}
          <div className="hidden md:block bg-[#12141e] border border-[#212536] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#171a26] text-gray-400 uppercase font-bold tracking-wider border-b border-gray-800">
                  <tr>
                    <th className="py-3 px-4">Request ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Device & Repair</th>
                    <th className="py-3 px-4">Locality</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Technician</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 text-gray-300">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-[#181b28]/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#FF5A1F]">
                        {lead.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{lead.customerName}</div>
                        <div className="text-[11px] text-gray-400 flex items-center gap-2">
                          <a href={`tel:${lead.phone}`} className="hover:text-emerald-400">
                            {lead.phone}
                          </a>
                          <a
                            href={buildWhatsAppQuoteUrl({
                              businessNumber: lead.whatsappNumber,
                              requestId: lead.id,
                              customerName: lead.customerName
                            })}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-400 hover:underline"
                          >
                            WA
                          </a>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-white font-medium">{lead.brand} {lead.model}</div>
                        <div className="text-[11px] text-gray-400 truncate max-w-[180px]">{lead.repairIssue}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-gray-200">{lead.locality}</span>
                        <span className="text-[10px] text-gray-500 block">Pin: {lead.pincode}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            lead.status === 'COMPLETED'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : lead.status === 'NEW'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-sky-500/20 text-sky-400'
                          }`}
                        >
                          {lead.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={lead.assignedTechnicianId || ''}
                          onChange={(e) => handleAssignTechnician(lead.id, e.target.value)}
                          className="bg-[#171a26] border border-gray-700 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-[#FF5A1F]"
                        >
                          <option value="">Unassigned</option>
                          {technicians.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-400">
                        ₹{(lead.approvedFinalPrice || lead.quotedStartingPrice).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={buildLeadDispatchWhatsAppUrl({
                              businessNumber: settings.whatsappNumber,
                              requestId: lead.id,
                              customerName: lead.customerName,
                              phone: lead.phone,
                              whatsappNumber: lead.whatsappNumber,
                              locality: lead.locality,
                              pincode: lead.pincode,
                              address: lead.address,
                              category: lead.category,
                              brand: lead.brand,
                              model: lead.model,
                              repairIssue: lead.repairIssue,
                              quotedStartingPrice: lead.quotedStartingPrice,
                              preferredDate: lead.preferredDate,
                              preferredTime: lead.preferredTime,
                              serviceOtp: lead.serviceOtp,
                              notes: lead.notes
                            })}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors"
                            title="Forward lead ticket to SS Care WhatsApp Desk"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-emerald-400" />
                          </a>

                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
                            title="View Full Lead Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredLeads.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-500">
                        No repair leads match your search or filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lead Detail Modal */}
          {selectedLead && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#151722] border border-[#2b3046] rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Request Details</span>
                    <h3 className="text-xl font-bold text-white font-mono">{selectedLead.id}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#1a1d29] p-3 rounded-xl">
                    <div>
                      <span className="text-gray-500 uppercase text-[10px]">Customer Name</span>
                      <p className="text-white font-bold text-sm">{selectedLead.customerName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 uppercase text-[10px]">Phone / WhatsApp</span>
                      <p className="text-white font-bold">{selectedLead.phone}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 uppercase text-[10px]">Bangalore Locality</span>
                      <p className="text-white">{selectedLead.locality} ({selectedLead.pincode})</p>
                    </div>
                    <div>
                      <span className="text-gray-500 uppercase text-[10px]">Full Address</span>
                      <p className="text-white">{selectedLead.address}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#1a1d29] p-3 rounded-xl">
                    <div>
                      <span className="text-gray-500 uppercase text-[10px]">Device & Model</span>
                      <p className="text-white font-bold">{selectedLead.brand} {selectedLead.model}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 uppercase text-[10px]">Repair / Issue</span>
                      <p className="text-[#FF5A1F] font-bold">{selectedLead.repairIssue}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 uppercase text-[10px]">Preferred Slot</span>
                      <p className="text-white">{selectedLead.preferredDate} - {selectedLead.preferredTime}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 uppercase text-[10px]">Arrival OTP</span>
                      <p className="text-amber-400 font-mono font-bold">{selectedLead.serviceOtp || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div>
                    <label className="block text-gray-400 mb-1 font-semibold">Change Lifecycle Status</label>
                    <select
                      value={selectedLead.status}
                      onChange={(e) => handleUpdateLeadStatus(selectedLead.id, e.target.value as any)}
                      className="w-full bg-[#1a1d29] border border-gray-700 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="NEW">NEW</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="ASSIGNED">ASSIGNED</option>
                      <option value="TECHNICIAN_ON_WAY">TECHNICIAN_ON_WAY</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={buildLeadDispatchWhatsAppUrl({
                        businessNumber: settings.whatsappNumber,
                        requestId: selectedLead.id,
                        customerName: selectedLead.customerName,
                        phone: selectedLead.phone,
                        whatsappNumber: selectedLead.whatsappNumber,
                        locality: selectedLead.locality,
                        pincode: selectedLead.pincode,
                        address: selectedLead.address,
                        category: selectedLead.category,
                        brand: selectedLead.brand,
                        model: selectedLead.model,
                        repairIssue: selectedLead.repairIssue,
                        quotedStartingPrice: selectedLead.quotedStartingPrice,
                        preferredDate: selectedLead.preferredDate,
                        preferredTime: selectedLead.preferredTime,
                        serviceOtp: selectedLead.serviceOtp,
                        notes: selectedLead.notes
                      })}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                      title="Send complete booking payload to SS Care Desk"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-emerald-400" />
                      <span>Forward to Desk WA</span>
                    </a>

                    {selectedLead.assignedTechnicianId && (
                      <a
                        href={buildTechnicianJobAssignmentWhatsAppUrl(
                          technicians.find((t) => t.id === selectedLead.assignedTechnicianId)?.phone || settings.whatsappNumber,
                          {
                            businessNumber: settings.whatsappNumber,
                            requestId: selectedLead.id,
                            customerName: selectedLead.customerName,
                            phone: selectedLead.phone,
                            whatsappNumber: selectedLead.whatsappNumber,
                            locality: selectedLead.locality,
                            pincode: selectedLead.pincode,
                            address: selectedLead.address,
                            category: selectedLead.category,
                            brand: selectedLead.brand,
                            model: selectedLead.model,
                            repairIssue: selectedLead.repairIssue,
                            quotedStartingPrice: selectedLead.approvedFinalPrice || selectedLead.quotedStartingPrice,
                            preferredDate: selectedLead.preferredDate,
                            preferredTime: selectedLead.preferredTime,
                            serviceOtp: selectedLead.serviceOtp
                          }
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                        title="Send assignment order to assigned technician WhatsApp"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Dispatch to Tech WA</span>
                      </a>
                    )}

                    <a
                      href={buildWhatsAppQuoteUrl({
                        businessNumber: selectedLead.whatsappNumber,
                        requestId: selectedLead.id,
                        customerName: selectedLead.customerName
                      })}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-white" />
                      <span>Chat with Customer</span>
                    </a>
                  </div>

                  <button
                    onClick={() => setSelectedLead(null)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: SERVICE AREAS ================= */}
      {activeTab === 'areas' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Bangalore Coverage Localities ({areas.length})</h2>
            <button
              onClick={() => setShowAddAreaModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FF5A1F] text-white text-xs font-bold hover:bg-[#e04812]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Bangalore Locality</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {areas.map((a) => (
              <div
                key={a.id}
                className="bg-[#12141e] border border-[#212536] rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-sm font-bold text-white">{a.name}</h4>
                  <p className="text-xs text-gray-400">Pincode: {a.pincode} • ETA: {a.serviceEta}</p>
                  <p className="text-[11px] text-emerald-400">
                    {a.serviceFee === 0 ? 'Free Doorstep Visit' : `₹${a.serviceFee} Visit Fee`}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => dataService.toggleServiceArea(a.id)}
                    className={`px-2 py-1 rounded text-[10px] font-bold ${
                      a.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {a.active ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {showAddAreaModal && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <form
                onSubmit={handleCreateArea}
                className="bg-[#151722] border border-gray-800 rounded-2xl p-6 max-w-md w-full space-y-4 animate-in zoom-in-95"
              >
                <h3 className="text-base font-bold text-white">Add New Bangalore Service Locality</h3>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Locality Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Richmond Town"
                    value={newAreaName}
                    onChange={(e) => setNewAreaName(e.target.value)}
                    className="w-full bg-[#1a1d29] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 560025"
                    value={newAreaPincode}
                    onChange={(e) => setNewAreaPincode(e.target.value)}
                    className="w-full bg-[#1a1d29] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Service ETA</label>
                  <input
                    type="text"
                    value={newAreaEta}
                    onChange={(e) => setNewAreaEta(e.target.value)}
                    className="w-full bg-[#1a1d29] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddAreaModal(false)}
                    className="px-4 py-2 text-xs text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#FF5A1F] text-white text-xs font-bold rounded-xl"
                  >
                    Save Locality
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: TECHNICIANS ================= */}
      {activeTab === 'technicians' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Technician Fleet ({technicians.length})</h2>
            <button
              onClick={() => setShowAddTechModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FF5A1F] text-white text-xs font-bold hover:bg-[#e04812]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Technician</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {technicians.map((t) => (
              <div
                key={t.id}
                className="bg-[#12141e] border border-[#212536] rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF5A1F]/20 to-amber-500/20 border border-[#FF5A1F]/30 flex items-center justify-center text-[#FF5A1F] font-bold">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{t.name}</h4>
                      <p className="text-[11px] text-gray-400">{t.phone}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                    {t.active ? 'Active' : 'Offline'}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-gray-300 border-t border-gray-800/80 pt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Repairs Completed</span>
                    <span className="font-bold text-white">{t.repairsCompleted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Rating</span>
                    <span className="text-amber-400 font-bold">★ {t.rating}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Specialties</span>
                    <span className="text-gray-300">{t.specialties.join(', ')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showAddTechModal && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <form
                onSubmit={handleCreateTech}
                className="bg-[#151722] border border-gray-800 rounded-2xl p-6 max-w-md w-full space-y-4 animate-in zoom-in-95"
              >
                <h3 className="text-base font-bold text-white">Register Field Technician</h3>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Technician Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={newTechName}
                    onChange={(e) => setNewTechName(e.target.value)}
                    className="w-full bg-[#1a1d29] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Mobile Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 9845012345"
                    value={newTechPhone}
                    onChange={(e) => setNewTechPhone(e.target.value)}
                    className="w-full bg-[#1a1d29] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Specialties (comma-separated)</label>
                  <input
                    type="text"
                    value={newTechSpecialty}
                    onChange={(e) => setNewTechSpecialty(e.target.value)}
                    className="w-full bg-[#1a1d29] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddTechModal(false)}
                    className="px-4 py-2 text-xs text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#FF5A1F] text-white text-xs font-bold rounded-xl"
                  >
                    Save Technician
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: REVIEWS ================= */}
      {activeTab === 'reviews' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Customer Reviews ({reviews.length})</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-[#12141e] border border-[#212536] rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{rev.customerName}</h4>
                    <p className="text-xs text-gray-400">{rev.locality} • {rev.device}</p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                    ★ {rev.rating} ({rev.source})
                  </div>
                </div>

                <p className="text-xs text-gray-300 italic">"{rev.reviewText}"</p>

                <div className="flex items-center justify-between pt-2 border-t border-gray-800 text-[11px]">
                  <span className="text-emerald-400">{rev.verified ? '✓ Verified Customer' : 'Unverified'}</span>
                  <span className="text-gray-500">{rev.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 5: FAQS ================= */}
      {activeTab === 'faqs' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <h2 className="text-base font-bold text-white">Customer FAQs ({faqs.length})</h2>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-[#12141e] border border-[#212536] rounded-xl p-4">
                <h4 className="text-sm font-bold text-white">{faq.question}</h4>
                <p className="text-xs text-gray-400 mt-1">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 6: BUSINESS SETTINGS ================= */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6 max-w-3xl bg-[#12141e] border border-[#212536] p-6 rounded-2xl animate-in fade-in duration-150">
          <div>
            <h2 className="text-base font-bold text-white font-['Space_Grotesk']">
              Business Contact & Lead Routing Settings
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Configure communication channels, business information, and WhatsApp dispatch numbers.
            </p>
          </div>

          {/* DEDICATED WHATSAPP LEAD RECEPTION & DISPATCH SECTION */}
          <div className="bg-gradient-to-br from-[#14231b] to-[#111922] border border-emerald-500/40 rounded-2xl p-5 space-y-3 shadow-lg shadow-black/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366]">
                  <MessageCircle className="w-4 h-4 fill-[#25D366]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    WhatsApp Lead Reception & Automated Routing
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Primary desk receiving all Bangalore doorstep repair leads and booking requests
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30">
                ACTIVE
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Lead Receiving WhatsApp Number (International format or 10 digits)
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-mono">
                    wa.me/
                  </span>
                  <input
                    type="text"
                    required
                    value={settings.whatsappNumber}
                    onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                    placeholder="919880123456"
                    className="w-full bg-[#0d1017] border border-emerald-500/30 rounded-xl pl-18 pr-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <a
                  href={buildTestLeadWhatsAppUrl(settings.whatsappNumber)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-[#25D366]/20 transition-all shrink-0 cursor-pointer"
                  title="Send sample test lead ticket to verify WhatsApp connectivity"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-white" />
                  <span>Test WhatsApp Dispatch</span>
                </a>
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
                <span>
                  Normalized API recipient: <code className="text-emerald-400 font-mono font-semibold">+{sanitizePhoneNumber(settings.whatsappNumber)}</code>
                </span>
                <span className="text-gray-500">Auto-includes Request ID, Device, Customer, Locality & Arrival OTP</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1 font-semibold">Business Name</label>
              <input
                type="text"
                value={settings.businessName}
                onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                className="w-full bg-[#181a26] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1 font-semibold">Support Helpline Phone</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full bg-[#181a26] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1 font-semibold">Support Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full bg-[#181a26] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1 font-semibold">Operating Hours</label>
              <input
                type="text"
                value={settings.businessHours}
                onChange={(e) => setSettings({ ...settings, businessHours: e.target.value })}
                className="w-full bg-[#181a26] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1 font-semibold">Doorstep Hub Address</label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full bg-[#181a26] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1 font-semibold">Warranty Period Tag</label>
            <input
              type="text"
              value={settings.trustMetrics.warrantyDays}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  trustMetrics: { ...settings.trustMetrics, warrantyDays: e.target.value }
                })
              }
              className="w-full bg-[#181a26] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#FF5A1F] hover:bg-[#e04812] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#FF5A1F]/20 cursor-pointer"
            >
              Save All Business Settings
            </button>
            {settingsSavedAlert && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Settings saved to local dispatch storage!</span>
              </span>
            )}
          </div>
        </form>
      )}

      {/* ================= TAB 7: ENCRYPTED SECURITY & AUTH ================= */}
      {activeTab === 'security' && (
        <div className="space-y-6 max-w-5xl animate-in fade-in duration-150">
          <div>
            <h2 className="text-base font-bold text-white font-['Space_Grotesk']">
              Cryptographic Security & Access Control
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              PBKDF2 with SHA-256 (100,000 rounds), per-user random salting, constant-time comparison & session token signing.
            </p>
          </div>

          {/* Security Standards Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-[#12141e] border border-[#212536] p-4 rounded-2xl">
              <div className="flex items-center gap-2 mb-2 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-bold">PBKDF2-SHA256</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Passwords and PINs hashed with 100,000 derivation rounds via WebCrypto API.
              </p>
            </div>

            <div className="bg-[#12141e] border border-[#212536] p-4 rounded-2xl">
              <div className="flex items-center gap-2 mb-2 text-sky-400">
                <KeyRound className="w-4 h-4" />
                <span className="text-xs font-bold">16-Byte Random Salts</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Unique cryptographically secure random salt generated per credential to prevent rainbow tables.
              </p>
            </div>

            <div className="bg-[#12141e] border border-[#212536] p-4 rounded-2xl">
              <div className="flex items-center gap-2 mb-2 text-amber-400">
                <Lock className="w-4 h-4" />
                <span className="text-xs font-bold">Constant-Time Verify</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Timing-safe string comparison engine protects against side-channel timing analysis attacks.
              </p>
            </div>

            <div className="bg-[#12141e] border border-[#212536] p-4 rounded-2xl">
              <div className="flex items-center gap-2 mb-2 text-[#FF5A1F]">
                <ShieldAlert className="w-4 h-4" />
                <span className="text-xs font-bold">Brute-Force Guard</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Automatic lockout after 5 consecutive failed attempts with audit trail recording.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Admin Password Rotation Form */}
            <div className="bg-[#12141e] border border-[#212536] p-5 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-4 h-4 text-[#FF5A1F]" />
                <h3 className="text-sm font-bold text-white">Rotate Central Admin Password</h3>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                Updating your password re-hashes the credential with a fresh 16-byte random salt and replaces the stored cryptographic digest.
              </p>

              {passwordChangeStatus && (
                <div
                  className={`p-3 rounded-xl mb-4 text-xs flex items-center gap-2 ${
                    passwordChangeStatus.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                      : 'bg-red-500/10 border border-red-500/30 text-red-400'
                  }`}
                >
                  {passwordChangeStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{passwordChangeStatus.message}</span>
                </div>
              )}

              <form onSubmit={handleChangeAdminPassword} className="space-y-3.5">
                <div>
                  <label className="block text-xs text-gray-300 font-semibold mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentAdminPassword}
                    onChange={(e) => setCurrentAdminPassword(e.target.value)}
                    placeholder="Enter current password (default: admin123)"
                    className="w-full bg-[#181a26] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-300 font-semibold mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-[#181a26] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-300 font-semibold mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmAdminPassword}
                    onChange={(e) => setConfirmAdminPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full bg-[#181a26] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#FF5A1F] hover:bg-[#e04812] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#FF5A1F]/20 transition-all cursor-pointer"
                >
                  Hash & Save New Admin Password
                </button>
              </form>
            </div>

            {/* Technician Security PIN Management */}
            <div className="bg-[#12141e] border border-[#212536] p-5 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <Wrench className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Technician Security PIN Management</h3>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                Field engineers sign into the dispatch app using their 4-digit PIN. PINs are salted and encrypted using PBKDF2-SHA256.
              </p>

              {pinChangeStatus && (
                <div
                  className={`p-3 rounded-xl mb-4 text-xs flex items-center gap-2 ${
                    pinChangeStatus.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                      : 'bg-red-500/10 border border-red-500/30 text-red-400'
                  }`}
                >
                  {pinChangeStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{pinChangeStatus.message}</span>
                </div>
              )}

              <form onSubmit={handleUpdateTechPin} className="space-y-3.5 mb-5">
                <div>
                  <label className="block text-xs text-gray-300 font-semibold mb-1">
                    Select Field Technician
                  </label>
                  <select
                    value={selectedTechForPin}
                    onChange={(e) => setSelectedTechForPin(e.target.value)}
                    className="w-full bg-[#181a26] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {technicians.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.id} - {t.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-300 font-semibold mb-1">
                    New 4-Digit Security PIN
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={newTechPin}
                    onChange={(e) => setNewTechPin(e.target.value)}
                    placeholder="e.g. 5678"
                    className="w-full bg-[#181a26] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white font-mono tracking-widest"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-600/20 transition-all cursor-pointer"
                >
                  Update Technician PIN
                </button>
              </form>

              {/* Status overview */}
              <div className="border-t border-gray-800 pt-3">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  Encrypted Fleet Status
                </span>
                <div className="space-y-2">
                  {techSecurityList.map((ts) => (
                    <div
                      key={ts.id}
                      className="p-2.5 rounded-xl bg-[#161824] border border-gray-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="text-white font-semibold">{ts.name}</span>
                        <span className="text-gray-500 text-[10px] block font-mono">{ts.id}</span>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20">
                          {ts.status}
                        </span>
                        <span className="text-gray-500 text-[9px] block mt-0.5">
                          Updated {new Date(ts.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Security Audit Log */}
          <div className="bg-[#12141e] border border-[#212536] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Cryptographic Security Audit Log</h3>
              </div>
              <span className="text-[11px] text-gray-400">
                {auditLogs.length} logged authentication events
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#171a26] text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-gray-800">
                  <tr>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Identity</th>
                    <th className="py-2.5 px-3">Event</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 text-gray-300 text-[11px]">
                  {auditLogs.slice(0, 10).map((log) => (
                    <tr key={log.id} className="hover:bg-[#181b28]/60 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-gray-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-white">
                        {log.identifier}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-gray-300">
                        {log.action}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.status === 'SUCCESS'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/15 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-gray-400 max-w-xs truncate">
                        {log.details || '—'}
                      </td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-gray-500 text-xs">
                        No security audit records logged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 7: ANALYTICS ================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#12141e] border border-[#212536] p-5 rounded-2xl">
              <span className="text-xs text-gray-400 font-semibold uppercase">Total Leads Captured</span>
              <p className="text-2xl font-black text-white font-['Space_Grotesk'] mt-1">{leads.length}</p>
              <p className="text-[11px] text-emerald-400 mt-1">Direct from Google & Website</p>
            </div>

            <div className="bg-[#12141e] border border-[#212536] p-5 rounded-2xl">
              <span className="text-xs text-gray-400 font-semibold uppercase">Completed Repairs</span>
              <p className="text-2xl font-black text-emerald-400 font-['Space_Grotesk'] mt-1">
                {leads.filter((l) => l.status === 'COMPLETED').length}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">Doorstep warranty delivered</p>
            </div>

            <div className="bg-[#12141e] border border-[#212536] p-5 rounded-2xl">
              <span className="text-xs text-gray-400 font-semibold uppercase">Top Bangalore Locality</span>
              <p className="text-2xl font-black text-[#FF5A1F] font-['Space_Grotesk'] mt-1">Koramangala</p>
              <p className="text-[11px] text-gray-400 mt-1">Followed by Indiranagar & HSR</p>
            </div>

            <div className="bg-[#12141e] border border-[#212536] p-5 rounded-2xl">
              <span className="text-xs text-gray-400 font-semibold uppercase">Fleet Conversion Rate</span>
              <p className="text-2xl font-black text-sky-400 font-['Space_Grotesk'] mt-1">78.4%</p>
              <p className="text-[11px] text-emerald-400 mt-1">+12% via WhatsApp follow-up</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
