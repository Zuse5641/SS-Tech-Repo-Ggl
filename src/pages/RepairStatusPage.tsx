import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  FileText,
  AlertCircle,
  KeyRound,
  ArrowRight,
  Printer,
  Calendar,
  Wrench,
  ThumbsUp,
  MessageCircle
} from 'lucide-react';
import { RepairRequestLead, LeadStatus, InvoiceRecord, WarrantyRecord } from '../types';
import { dataService } from '../services/dataService';
import { buildWhatsAppQuoteUrl } from '../utils/whatsapp';

interface RepairStatusPageProps {
  initialRequestId?: string;
  onNavigateHome: () => void;
}

export const RepairStatusPage: React.FC<RepairStatusPageProps> = ({
  initialRequestId = '',
  onNavigateHome
}) => {
  const [searchId, setSearchId] = useState(initialRequestId);
  const [lead, setLead] = useState<RepairRequestLead | undefined>(() => {
    return initialRequestId ? dataService.getLeadById(initialRequestId) : undefined;
  });
  const [invoice, setInvoice] = useState<InvoiceRecord | undefined>();
  const [warranty, setWarranty] = useState<WarrantyRecord | undefined>();
  const [errorMsg, setErrorMsg] = useState('');
  const [approvalSubmitting, setApprovalSubmitting] = useState(false);

  useEffect(() => {
    if (initialRequestId) {
      const found = dataService.getLeadById(initialRequestId);
      setLead(found);
      if (found) {
        setInvoice(dataService.getInvoiceByRequestId(found.id));
        setWarranty(dataService.getWarrantyByRequestId(found.id));
      }
    }
  }, [initialRequestId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!searchId.trim()) return;

    const found = dataService.getLeadById(searchId.trim());
    if (found) {
      setLead(found);
      setInvoice(dataService.getInvoiceByRequestId(found.id));
      setWarranty(dataService.getWarrantyByRequestId(found.id));
    } else {
      setErrorMsg(`No repair request found for ID "${searchId.trim()}". Please check your ID.`);
      setLead(undefined);
    }
  };

  const handleApproveQuote = () => {
    if (!lead) return;
    setApprovalSubmitting(true);
    const updated = dataService.updateJobStatus(
      lead.id,
      'REPAIRING',
      lead.customerName,
      'Customer approved revised technician diagnosis quote',
      {
        customerApprovedAdditionalCost: true,
        approvedFinalPrice: (lead.quotedStartingPrice || 0) + (lead.additionalCost || 0)
      }
    );
    setLead(updated);
    setApprovalSubmitting(false);
  };

  // Timeline steps
  const timelineSteps = [
    { key: 'NEW', label: 'Request Received', desc: 'Received & routed to Bangalore central team' },
    { key: 'CONFIRMED', label: 'Price & Slot Confirmed', desc: 'Technician slot reserved' },
    { key: 'ASSIGNED', label: 'Technician Assigned', desc: 'Certified engineer allocated' },
    { key: 'TECHNICIAN_ON_WAY', label: 'Technician On The Way', desc: 'Traveling to your doorstep' },
    { key: 'IN_PROGRESS', label: 'Repair In Progress', desc: 'Diagnosis & precision fixing' },
    { key: 'COMPLETED', label: 'Completed & Delivered', desc: 'Warranty & invoice issued' }
  ];

  const getStepStatus = (stepKey: string, currentLeadStatus: LeadStatus) => {
    const order = ['NEW', 'CONFIRMED', 'ASSIGNED', 'TECHNICIAN_ON_WAY', 'IN_PROGRESS', 'COMPLETED'];
    const currentIndex = order.indexOf(currentLeadStatus);
    const stepIndex = order.indexOf(stepKey);

    if (currentLeadStatus === 'CANCELLED') return 'cancelled';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="py-10 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header & Search Form */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF5A1F] bg-[#FF5A1F]/10 px-3 py-1 rounded-full">
          LIVE SERVICE TRACKER
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-white font-['Space_Grotesk'] mt-2 tracking-tight">
          Track Your Doorstep Repair
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Enter your unique SS Care Request ID (e.g., SSC-20260911-001) to view real-time technician status.
        </p>

        <form onSubmit={handleSearch} className="mt-5 flex gap-2 max-w-md mx-auto">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="tracker-input-id"
              type="text"
              placeholder="e.g. SSC-20260911-001"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full bg-[#151722] border border-[#2b3046] rounded-xl pl-10 pr-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5A1F] uppercase font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#FF5A1F] hover:bg-[#e04812] text-white text-xs sm:text-sm font-bold shrink-0 transition-colors"
          >
            Track Status
          </button>
        </form>

        {errorMsg && (
          <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* When Lead is Found */}
      {lead && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Top Status Banner Card */}
          <div className="bg-[#12141e] border border-[#232738] rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800 pb-5">
              <div>
                <span className="text-xs text-gray-400">Request Reference ID:</span>
                <h2 className="text-xl sm:text-2xl font-black text-[#FF5A1F] font-mono tracking-wider">
                  {lead.id}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Booked on {new Date(lead.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {lead.preferredTime}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FF5A1F]/15 text-[#FF5A1F] border border-[#FF5A1F]/30 uppercase tracking-wider">
                  Status: {lead.status.replace(/_/g, ' ')}
                </span>
                {lead.jobStatus && (
                  <span className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                    {lead.jobStatus.replace(/_/g, ' ')}
                  </span>
                )}
              </div>
            </div>

            {/* Visual Timeline Stepper */}
            <div className="py-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                Service Progress Timeline
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                {timelineSteps.map((step, idx) => {
                  const state = getStepStatus(step.key, lead.status);
                  return (
                    <div
                      key={step.key}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        state === 'completed'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                          : state === 'current'
                          ? 'bg-[#FF5A1F]/15 border-[#FF5A1F] text-white shadow-lg shadow-[#FF5A1F]/10'
                          : 'bg-[#151722] border-gray-800 text-gray-500 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase">
                          0{idx + 1}
                        </span>
                        {state === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : state === 'current' ? (
                          <Clock className="w-4 h-4 text-[#FF5A1F] animate-spin" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-gray-700" />
                        )}
                      </div>
                      <h4 className="text-xs font-bold leading-tight">{step.label}</h4>
                      <p className="text-[10px] text-gray-400 mt-1 leading-snug hidden sm:block">
                        {step.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* OTP VERIFICATION CARD (Customer Displays to Technician upon Arrival) */}
            {lead.serviceOtp && lead.status !== 'COMPLETED' && (
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-xl p-4 my-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Technician Arrival Verification OTP</h4>
                    <p className="text-xs text-gray-400">
                      Show this 4-digit code to the technician when they arrive at your door to confirm dispatch.
                    </p>
                  </div>
                </div>

                <div className="px-5 py-2.5 bg-black/60 border border-amber-500/40 rounded-xl font-mono text-2xl font-black text-amber-400 tracking-widest">
                  {lead.serviceOtp}
                </div>
              </div>
            )}

            {/* DIAGNOSIS APPROVAL NOTICE IF TECHNICIAN SUBMITTED REVISED QUOTE */}
            {lead.jobStatus === 'AWAITING_APPROVAL' && !lead.customerApprovedAdditionalCost && (
              <div className="bg-[#1f1915] border border-amber-500/40 rounded-xl p-5 my-4 space-y-3 animate-in zoom-in-95">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Technician Diagnosis & Price Revision Awaiting Your Approval
                    </h4>
                    <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                      Technician Notes: <span className="text-amber-200 font-medium">{lead.diagnosisNotes || 'Additional IC board work required.'}</span>
                    </p>
                    <div className="flex items-center gap-4 text-xs mt-2">
                      <span className="text-gray-400">Original Starting Quote: ₹{lead.quotedStartingPrice}</span>
                      <span className="text-amber-400 font-bold">
                        Revised Final Cost: ₹{(lead.quotedStartingPrice || 0) + (lead.additionalCost || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={handleApproveQuote}
                    disabled={approvalSubmitting}
                    className="px-4 py-2 bg-[#FF5A1F] hover:bg-[#e04812] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-[#FF5A1F]/20 cursor-pointer"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Approve & Continue Repair</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Details Split: Device Details & Technician Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Device & Location Card */}
            <div className="bg-[#12141e] border border-[#232738] rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-['Space_Grotesk'] border-b border-gray-800 pb-2">
                Device & Location Info
              </h3>

              <div className="space-y-2 text-xs text-gray-300">
                <div className="flex justify-between">
                  <span className="text-gray-500">Device Model</span>
                  <span className="text-white font-semibold">{lead.brand} {lead.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Reported Issue</span>
                  <span className="text-white font-semibold">{lead.repairIssue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Service Location</span>
                  <span className="text-white">{lead.locality}, Bengaluru ({lead.pincode})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Address Details</span>
                  <span className="text-white truncate max-w-[200px]">{lead.address}</span>
                </div>
                <div className="flex justify-between border-t border-gray-800 pt-2">
                  <span className="text-gray-500">Starting Price</span>
                  <span className="text-emerald-400 font-bold">₹{lead.quotedStartingPrice.toLocaleString('en-IN')}*</span>
                </div>
              </div>
            </div>

            {/* Assigned Technician Card */}
            <div className="bg-[#12141e] border border-[#232738] rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-['Space_Grotesk'] border-b border-gray-800 pb-2">
                Assigned Technician
              </h3>

              {lead.assignedTechnicianName ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 flex items-center justify-center text-[#FF5A1F] font-bold text-lg">
                      {lead.assignedTechnicianName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{lead.assignedTechnicianName}</h4>
                      <p className="text-xs text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Certified Master Repair Engineer</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <a
                      href={`tel:+919845011223`}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#1a1d29] hover:bg-gray-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 border border-gray-700"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#FF5A1F]" />
                      <span>Call Tech</span>
                    </a>
                    <a
                      href={buildWhatsAppQuoteUrl({
                        businessNumber: '919880123456',
                        requestId: lead.id,
                        customerName: lead.customerName
                      })}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-white" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-2">
                  <Clock className="w-8 h-8 text-amber-400 mx-auto animate-pulse" />
                  <p className="text-xs text-gray-300 font-semibold">Assigning Nearest Technician</p>
                  <p className="text-[11px] text-gray-500">
                    We are matching the certified technician best suited for {lead.brand} in {lead.locality}.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* INVOICE & WARRANTY CERTIFICATES (If Completed) */}
          {(invoice || warranty || lead.status === 'COMPLETED') && (
            <div className="bg-[#12141e] border border-emerald-500/30 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                  <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                    Repair Completed • Digital Warranty & Invoice
                  </h3>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-white flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Certificate</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-[#171a26] border border-gray-800 space-y-2">
                  <span className="text-gray-400 uppercase font-bold text-[10px]">Official Tax Invoice</span>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Invoice Number</span>
                    <span className="font-mono text-white font-semibold">{invoice?.invoiceNumber || `SSC-INV-2026-8812`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount Paid</span>
                    <span className="text-emerald-400 font-bold">₹{invoice?.total || lead.approvedFinalPrice || lead.quotedStartingPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payment Status</span>
                    <span className="text-emerald-400 font-semibold">PAID (UPI/Card)</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#171a26] border border-gray-800 space-y-2">
                  <span className="text-gray-400 uppercase font-bold text-[10px]">Warranty Certificate</span>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Warranty ID</span>
                    <span className="font-mono text-white font-semibold">{warranty?.warrantyNumber || `SSC-WAR-492102`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration</span>
                    <span className="text-sky-400 font-bold">{warranty?.warrantyPeriod || '6 Months Genuine Warranty'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Expiry Date</span>
                    <span className="text-white">{warranty?.expiryDate || '180 Days from Service'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="text-center pt-4">
            <button
              onClick={onNavigateHome}
              className="text-xs text-gray-400 hover:text-white underline"
            >
              ← Return to SS Care Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
