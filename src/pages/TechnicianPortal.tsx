import React, { useState, useEffect, useRef } from 'react';
import {
  Briefcase,
  MapPin,
  Phone,
  Clock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Camera,
  CreditCard,
  PenTool,
  Wrench,
  Navigation,
  MessageCircle,
  FileCheck,
  RotateCcw,
  LogOut,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';
import { RepairRequestLead, JobStatus, Technician } from '../types';
import { dataService } from '../services/dataService';
import { useAuth } from '../context/AuthContext';
import { buildWhatsAppQuoteUrl } from '../utils/whatsapp';

interface TechnicianPortalProps {
  onNavigateHome?: () => void;
  onLogout?: () => void;
}

export const TechnicianPortal: React.FC<TechnicianPortalProps> = ({
  onNavigateHome,
  onLogout
}) => {
  const { user, technicianId = 'tech-01', logoutTechnician } = useAuth();
  const [leads, setLeads] = useState<RepairRequestLead[]>([]);
  const [activeJob, setActiveJob] = useState<RepairRequestLead | null>(null);

  // OTP form
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');

  // Diagnosis form
  const [diagnosisNotes, setDiagnosisNotes] = useState('');
  const [additionalCost, setAdditionalCost] = useState<number>(0);
  const [partNeeded, setPartNeeded] = useState('');

  // Payment & completion
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Cash' | 'Card'>('UPI');
  const [technicianNotes, setTechnicianNotes] = useState('');
  const [beforePhotoUploaded, setBeforePhotoUploaded] = useState(false);
  const [afterPhotoUploaded, setAfterPhotoUploaded] = useState(false);

  // Signature canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const isDrawing = useRef(false);

  // Responsive mobile view toggle: 'queue' or 'job'
  const [mobileView, setMobileView] = useState<'queue' | 'job'>('queue');

  // Dynamically size canvas to exact container width
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        const w = canvasRef.current.parentElement.clientWidth;
        if (w > 50) {
          canvasRef.current.width = w;
          canvasRef.current.height = 110;
        }
      }
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [activeJob, mobileView]);

  const loadData = () => {
    const all = dataService.getLeads();
    // Filter jobs assigned to this technician or unassigned demo jobs
    const myJobs = all.filter(
      (l) => l.assignedTechnicianId === technicianId || l.status === 'ASSIGNED' || l.status === 'TECHNICIAN_ON_WAY' || l.status === 'IN_PROGRESS'
    );
    setLeads(myJobs);

    if (activeJob) {
      const refreshed = dataService.getLeadById(activeJob.id);
      if (refreshed) setActiveJob(refreshed);
    } else if (myJobs.length > 0) {
      setActiveJob(myJobs[0]);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = dataService.subscribe(loadData);
    return () => unsub();
  }, [technicianId]);

  // Handle status transition
  const handleStatusUpdate = (nextStatus: JobStatus) => {
    if (!activeJob) return;
    const updated = dataService.updateJobStatus(
      activeJob.id,
      nextStatus,
      user?.displayName || 'Technician Karthik',
      `Status updated to ${nextStatus}`
    );
    setActiveJob(updated);
  };

  // Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeJob) return;
    setOtpError('');

    if (otpInput.trim() === activeJob.serviceOtp || otpInput.trim() === '1234') {
      const updated = dataService.updateJobStatus(
        activeJob.id,
        'IN_DIAGNOSIS',
        user?.displayName || 'Technician Karthik',
        'Customer arrival OTP verified successfully',
        { otpVerified: true }
      );
      setActiveJob(updated);
      setOtpInput('');
    } else {
      setOtpError('Invalid OTP. Please ask customer to read 4-digit code from their repair tracking screen.');
    }
  };

  // Submit diagnosis
  const handleSubmitDiagnosis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeJob) return;

    if (additionalCost > 0) {
      // requires customer approval
      const updated = dataService.updateJobStatus(
        activeJob.id,
        'AWAITING_APPROVAL',
        user?.displayName || 'Technician Karthik',
        `Diagnosis complete. Revision +₹${additionalCost}. Waiting for customer confirmation.`,
        {
          diagnosisNotes,
          additionalCost,
          partNeeded,
          customerApprovedAdditionalCost: false
        }
      );
      setActiveJob(updated);
    } else {
      // Proceed directly to repair
      const updated = dataService.updateJobStatus(
        activeJob.id,
        'REPAIRING',
        user?.displayName || 'Technician Karthik',
        `Diagnosis verified. Starting repair for ${activeJob.repairIssue}.`,
        {
          diagnosisNotes,
          additionalCost: 0,
          customerApprovedAdditionalCost: true,
          approvedFinalPrice: activeJob.quotedStartingPrice
        }
      );
      setActiveJob(updated);
    }
  };

  // Signature canvas handlers with responsive coordinate mapping
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    const coords = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoords(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // Complete Job & Generate Invoice + Warranty
  const handleCompleteJob = () => {
    if (!activeJob) return;

    let sigData = 'customer-signature-verified';
    if (canvasRef.current && hasSignature) {
      sigData = canvasRef.current.toDataURL();
    }

    const finalAmount = (activeJob.quotedStartingPrice || 0) + (activeJob.additionalCost || 0);

    const updated = dataService.completeJob(
      activeJob.id,
      finalAmount,
      paymentMethod,
      technicianNotes,
      sigData
    );

    setActiveJob(updated);
  };

  return (
    <div className="py-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Banner */}
      <div className="bg-[#12141e] border border-[#232738] rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white font-['Space_Grotesk']">
                Technician Field Portal
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                Online
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Logged in: <span className="text-white font-medium">{user?.displayName || 'Karthik N.'}</span> (ID: {technicianId}) • Bangalore Central Zone
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs text-gray-400">
            Total Jobs: <span className="text-white font-bold">{leads.length}</span>
          </div>

          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161824] hover:bg-[#1e2232] text-gray-300 hover:text-white text-xs font-semibold border border-gray-800 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
              <span>Customer Site</span>
            </button>
          )}

          <button
            onClick={() => {
              logoutTechnician();
              if (onLogout) {
                onLogout();
              } else if (onNavigateHome) {
                onNavigateHome();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Mobile View Toggle Bar (< 1024px) */}
      <div className="lg:hidden flex items-center bg-[#151724] p-1.5 rounded-2xl border border-gray-800 mb-5 shadow-lg">
        <button
          onClick={() => setMobileView('queue')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 min-h-[40px] ${
            mobileView === 'queue'
              ? 'bg-[#FF5A1F] text-white shadow-md shadow-[#FF5A1F]/20'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Job Queue ({leads.length})</span>
        </button>

        <button
          onClick={() => setMobileView('job')}
          disabled={!activeJob}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 min-h-[40px] ${
            mobileView === 'job'
              ? 'bg-[#FF5A1F] text-white shadow-md shadow-[#FF5A1F]/20'
              : 'text-gray-400 hover:text-white disabled:opacity-40'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Active Job {activeJob ? `(#${activeJob.id.split('-').pop()})` : ''}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Assigned Repairs List */}
        <div className={`${mobileView === 'job' ? 'hidden lg:block' : 'block'} lg:col-span-4 space-y-3`}>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Assigned Doorstep Jobs ({leads.length})
          </h2>

          <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1 no-scrollbar">
            {leads.map((j) => (
              <div
                key={j.id}
                onClick={() => {
                  setActiveJob(j);
                  setMobileView('job');
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  activeJob?.id === j.id
                    ? 'bg-[#181b28] border-[#FF5A1F] shadow-lg shadow-[#FF5A1F]/10'
                    : 'bg-[#12141e] border-[#202436] hover:bg-[#151824]'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono text-[#FF5A1F] font-bold">{j.id}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-300 font-semibold">
                    {j.jobStatus || j.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white truncate">{j.brand} {j.model}</h3>
                <p className="text-xs text-gray-400 truncate">{j.repairIssue}</p>

                <div className="flex items-center justify-between text-[11px] text-gray-500 mt-3 pt-2 border-t border-gray-800">
                  <span className="flex items-center gap-1 text-gray-400">
                    <MapPin className="w-3 h-3 text-[#FF5A1F]" />
                    {j.locality}
                  </span>
                  <span className="text-emerald-400 font-bold">₹{j.quotedStartingPrice}</span>
                </div>
              </div>
            ))}

            {leads.length === 0 && (
              <div className="text-center py-12 bg-[#12141e] border border-gray-800 rounded-xl">
                <p className="text-xs text-gray-500">No jobs currently dispatched to your ID.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Active Job Execution Workflow */}
        <div className={`${mobileView === 'queue' ? 'hidden lg:block' : 'block'} lg:col-span-8`}>
          {activeJob ? (
            <div className="bg-[#12141e] border border-[#232738] rounded-2xl p-4 sm:p-6 shadow-xl space-y-5 sm:space-y-6">
              {/* Mobile Back Button */}
              <div className="lg:hidden flex items-center justify-between pb-3 border-b border-gray-800">
                <button
                  type="button"
                  onClick={() => setMobileView('queue')}
                  className="flex items-center gap-1.5 text-xs text-[#FF5A1F] font-bold px-3 py-1.5 rounded-xl bg-[#FF5A1F]/10 border border-[#FF5A1F]/20 min-h-[38px] active:scale-95 transition-transform"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>← Back to Job Queue</span>
                </button>
                <span className="text-xs font-mono text-gray-400 font-bold">{activeJob.id}</span>
              </div>

              {/* Job Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-[#FF5A1F]">{activeJob.id}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">
                      {activeJob.jobStatus || activeJob.status}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1 font-['Space_Grotesk']">
                    {activeJob.brand} {activeJob.model} - {activeJob.repairIssue}
                  </h2>
                </div>

                {/* Quick Call & Map */}
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${activeJob.phone}`}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Customer</span>
                  </a>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${activeJob.address}, ${activeJob.locality}, Bengaluru`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-[#1a1d29] hover:bg-gray-800 text-white text-xs font-semibold flex items-center gap-1.5 border border-gray-700"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#FF5A1F]" />
                    <span>Navigate</span>
                  </a>
                </div>
              </div>

              {/* Customer Contact & Address Card */}
              <div className="bg-[#161824] border border-[#262b3d] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 uppercase font-semibold text-[10px]">Customer Details</span>
                  <p className="font-bold text-white text-sm mt-0.5">{activeJob.customerName}</p>
                  <p className="text-gray-300">Phone: {activeJob.phone}</p>
                  {activeJob.email && <p className="text-gray-400">Email: {activeJob.email}</p>}
                </div>
                <div>
                  <span className="text-gray-500 uppercase font-semibold text-[10px]">Doorstep Address</span>
                  <p className="text-white mt-0.5">{activeJob.address}</p>
                  <p className="text-[#FF5A1F] font-semibold">{activeJob.locality} (Pincode: {activeJob.pincode})</p>
                  <p className="text-gray-400 text-[11px] mt-1">Slot: {activeJob.preferredDate} - {activeJob.preferredTime}</p>
                </div>
              </div>

              {/* STEP 1: TRANSIT & ARRIVAL OTP */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#FF5A1F] text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Travel & Doorstep Verification</span>
                </h3>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleStatusUpdate('EN_ROUTE')}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold ${
                      activeJob.jobStatus === 'EN_ROUTE'
                        ? 'bg-[#FF5A1F] text-white'
                        : 'bg-[#181b28] text-gray-300 border border-gray-800 hover:bg-gray-800'
                    }`}
                  >
                    Mark "En Route"
                  </button>

                  <button
                    onClick={() => handleStatusUpdate('ARRIVED')}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold ${
                      activeJob.jobStatus === 'ARRIVED'
                        ? 'bg-[#FF5A1F] text-white'
                        : 'bg-[#181b28] text-gray-300 border border-gray-800 hover:bg-gray-800'
                    }`}
                  >
                    Mark "Arrived at Doorstep"
                  </button>
                </div>

                {/* OTP Verification Box */}
                {!activeJob.otpVerified && (
                  <form onSubmit={handleVerifyOtp} className="p-4 rounded-xl bg-[#1a1d29] border border-amber-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                      <KeyRound className="w-4 h-4" />
                      <span>Enter Customer Arrival OTP:</span>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Customer can see this on their tracking page. (Demo secret for testing: {activeJob.serviceOtp || '1234'})
                    </p>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Enter 4-digit OTP"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        className="bg-[#12141c] border border-gray-700 rounded-xl px-3 py-2 text-sm text-white font-mono tracking-widest focus:outline-none focus:border-amber-400"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold rounded-xl"
                      >
                        Verify OTP & Begin
                      </button>
                    </div>

                    {otpError && <p className="text-xs text-rose-400">{otpError}</p>}
                  </form>
                )}

                {activeJob.otpVerified && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Doorstep Arrival Verified with OTP</span>
                  </div>
                )}
              </div>

              {/* STEP 2: DIAGNOSIS & PRICE REVISION */}
              <div className="space-y-3 pt-2 border-t border-gray-800">
                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px]">2</span>
                  <span>Diagnosis & Pricing Confirmation</span>
                </h3>

                <form onSubmit={handleSubmitDiagnosis} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Diagnosis Findings</label>
                      <input
                        type="text"
                        placeholder="e.g. Display glass cracked, touch digitizer fully functional"
                        value={diagnosisNotes}
                        onChange={(e) => setDiagnosisNotes(e.target.value)}
                        className="w-full bg-[#181b28] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Additional Cost (₹)</label>
                      <input
                        type="number"
                        placeholder="0 if original quote stands"
                        value={additionalCost}
                        onChange={(e) => setAdditionalCost(Number(e.target.value))}
                        className="w-full bg-[#181b28] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Save Diagnosis & Confirm Pricing</span>
                  </button>
                </form>

                {activeJob.jobStatus === 'AWAITING_APPROVAL' && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs">
                    ⚠️ Revised quote submitted (+₹{activeJob.additionalCost}). Customer must approve on their tracking screen before you can complete the repair.
                  </div>
                )}
              </div>

              {/* STEP 3: WORK IN PROGRESS & TESTING */}
              <div className="space-y-3 pt-2 border-t border-gray-800">
                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">3</span>
                  <span>Repair In Progress & Bench Test</span>
                </h3>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleStatusUpdate('REPAIRING')}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold ${
                      activeJob.jobStatus === 'REPAIRING'
                        ? 'bg-amber-500 text-black font-bold'
                        : 'bg-[#181b28] text-gray-300 border border-gray-800 hover:bg-gray-800'
                    }`}
                  >
                    Set "Repairing"
                  </button>

                  <button
                    onClick={() => handleStatusUpdate('TESTING')}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold ${
                      activeJob.jobStatus === 'TESTING'
                        ? 'bg-amber-500 text-black font-bold'
                        : 'bg-[#181b28] text-gray-300 border border-gray-800 hover:bg-gray-800'
                    }`}
                  >
                    Set "Hardware Quality Testing"
                  </button>
                </div>

                {/* Photos capture simulation */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setBeforePhotoUploaded(!beforePhotoUploaded)}
                    className={`p-3 rounded-xl border text-center text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                      beforePhotoUploaded
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                        : 'bg-[#161824] border-gray-800 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                    <span>{beforePhotoUploaded ? '✓ Before Photo Logged' : '+ Upload Before Repair Photo'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAfterPhotoUploaded(!afterPhotoUploaded)}
                    className={`p-3 rounded-xl border text-center text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                      afterPhotoUploaded
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                        : 'bg-[#161824] border-gray-800 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                    <span>{afterPhotoUploaded ? '✓ After Photo Logged' : '+ Upload Completed Photo'}</span>
                  </button>
                </div>
              </div>

              {/* STEP 4: PAYMENT, SIGNATURE & COMPLETION */}
              <div className="space-y-4 pt-2 border-t border-gray-800">
                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">4</span>
                  <span>Payment Collection & Customer Sign-Off</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Payment Mode */}
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1 font-semibold">Payment Collected Via</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full bg-[#181b28] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                      <option value="Cash">Cash Collected at Doorstep</option>
                      <option value="Card">Card Swipe via Mobile POS</option>
                    </select>

                    <div className="mt-3 p-3 bg-black/40 rounded-xl border border-gray-800 text-xs">
                      <span className="text-gray-400">Total Amount Payable:</span>
                      <p className="text-xl font-black text-emerald-400 font-mono mt-1">
                        ₹{(activeJob.quotedStartingPrice || 0) + (activeJob.additionalCost || 0)}
                      </p>
                    </div>
                  </div>

                  {/* Customer Signature Canvas */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] text-gray-400 font-semibold flex items-center gap-1">
                        <PenTool className="w-3 h-3 text-[#FF5A1F]" />
                        <span>Customer Digital Signature</span>
                      </label>
                      <button
                        type="button"
                        onClick={clearCanvas}
                        className="text-[10px] text-gray-400 hover:text-white flex items-center gap-0.5"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Clear</span>
                      </button>
                    </div>

                    <div className="border border-gray-700 rounded-xl bg-black overflow-hidden">
                      <canvas
                        ref={canvasRef}
                        width={280}
                        height={100}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-[100px] cursor-crosshair touch-none"
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">Customer signs on screen to acknowledge service & warranty.</p>
                  </div>
                </div>

                {/* Final Completion Action */}
                <button
                  id="technician-complete-job-btn"
                  onClick={handleCompleteJob}
                  disabled={activeJob.status === 'COMPLETED'}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-sm shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>
                    {activeJob.status === 'COMPLETED'
                      ? 'Job Successfully Completed & Invoiced'
                      : 'Complete Job & Issue Digital Warranty Certificate'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-24 bg-[#12141e] border border-gray-800 rounded-2xl">
              <Wrench className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-400 font-medium">Select a job from the left to view customer & repair details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
