import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Laptop,
  Tablet,
  Monitor,
  Gamepad2,
  CheckCircle2,
  Sparkles,
  Clock,
  ShieldCheck,
  MessageCircle,
  X,
  MapPin,
  Calendar,
  Gift,
  ArrowRight,
  Phone,
  User,
  Check,
  Zap
} from 'lucide-react';
import { DeviceCategory, RepairRequestLead, BusinessSettings } from '../../types';
import { dataService } from '../../services/dataService';
import { trackEvent } from '../../utils/analytics';
import { buildWhatsAppQuoteUrl } from '../../utils/whatsapp';

export interface DeviceConsultationData {
  category: DeviceCategory;
  name: string;
  shortName: string;
  icon: React.ReactNode;
  hookTitle: string;
  hookSubtitle: string;
  tagline: string;
  popularBrands: string[];
  diagnosticPoints: string[];
  normalPrice: number;
  offerPrice: number;
  eta: string;
  badge: string;
}

export const DEVICE_CONSULTATION_DATA: Record<DeviceCategory, DeviceConsultationData> = {
  phones: {
    category: 'phones',
    name: 'Smartphones & iPhones',
    shortName: 'Smartphone',
    icon: <Smartphone className="w-5 h-5" />,
    hookTitle: 'Get your Free Smartphone Consultation / Check-up Today',
    hookSubtitle:
      'Is your iPhone or Android overheating, battery draining fast, screen flickering, or charging intermittently? Our certified master technician visits your home or office for a thorough 18-point diagnostic at absolutely zero cost.',
    tagline: '18-Point Hardware, Battery & Logic Board Diagnostic',
    popularBrands: ['Apple iPhone', 'Samsung Galaxy', 'OnePlus', 'Google Pixel', 'Xiaomi'],
    diagnosticPoints: [
      'Battery Capacity & Maximum Health % Test',
      'OLED/LCD Display Sensor & TrueTone Calibration',
      'Charging Port Current Draw & Moisture Litmus Check',
      'Microphone, Earpiece & Stereo Speaker Audio Test',
      'Motherboard Standby Power Leakage Diagnostic'
    ],
    normalPrice: 499,
    offerPrice: 0,
    eta: '15–20 Mins On-Site Diagnostic',
    badge: '100% Free Doorstep Inspection'
  },
  laptops: {
    category: 'laptops',
    name: 'MacBooks & Laptops',
    shortName: 'Laptop',
    icon: <Laptop className="w-5 h-5" />,
    hookTitle: 'Get your Free Laptop Consultation / Check-up Today',
    hookSubtitle:
      'MacBook or Windows laptop running hot, fans making loud noise, slow booting, or battery swelling? We bring precision diagnostic gear directly to your desk in Bangalore with zero obligation to repair.',
    tagline: 'Deep Thermal, Motherboard & Battery Cycle Audit',
    popularBrands: ['MacBook Pro/Air', 'Dell XPS/Inspiron', 'HP Spectre/Pavilion', 'Lenovo ThinkPad', 'ASUS ROG'],
    diagnosticPoints: [
      'Thermal Paste Degradation & Fan Dust Airflow Audit',
      'NVMe SSD SMART Health & RAM Sector Stress Test',
      'Battery Cycle Count & Charging IC Controller Check',
      'Motherboard Power Rails & Short-Circuit Diagnostic',
      'Hinge Resistance & Internal Ribbon Cable Inspection'
    ],
    normalPrice: 699,
    offerPrice: 0,
    eta: '25–30 Mins On-Site Diagnostic',
    badge: '₹0 Bangalore Doorstep Visit'
  },
  tablets: {
    category: 'tablets',
    name: 'iPads & Android Tablets',
    shortName: 'iPad / Tablet',
    icon: <Tablet className="w-5 h-5" />,
    hookTitle: 'Get your Free iPad & Tablet Consultation / Check-up Today',
    hookSubtitle:
      'iPad touch latency stuttering, Apple Pencil disconnecting, or screen cracked? Get an honest, upfront on-site assessment before spending thousands on unnecessary replacements.',
    tagline: 'Touch Digitizer, Apple Pencil Sensor & Battery Check',
    popularBrands: ['iPad Pro / Air / Mini', 'Samsung Galaxy Tab', 'Lenovo Tab', 'Xiaomi Pad'],
    diagnosticPoints: [
      'Digitizer Multi-Touch Grid & Apple Pencil Latency Test',
      'Battery Cell Degradation & Safe Current Draw Test',
      'USB-C / Lightning Flex Port Soldering Inspection',
      'Aluminum Chassis Bent Warp & Logic Board Stress Check'
    ],
    normalPrice: 499,
    offerPrice: 0,
    eta: '15–20 Mins On-Site Diagnostic',
    badge: 'Zero Obligation • Honest Advice'
  },
  desktops: {
    category: 'desktops',
    name: 'Gaming PCs & Desktops',
    shortName: 'Desktop / PC',
    icon: <Monitor className="w-5 h-5" />,
    hookTitle: 'Get your Free PC & Desktop Consultation / Check-up Today',
    hookSubtitle:
      'PC not powering on, random Blue Screens (BSOD), or GPU thermal throttling? Our desktop hardware specialist will diagnose your motherboard, PSU, and drives in front of you.',
    tagline: 'SMPS Power Supply, GPU Thermals & Boot Analysis',
    popularBrands: ['Custom Gaming Rig', 'Apple iMac / Mac Mini', 'Dell OptiPlex', 'HP Omen', 'Workstations'],
    diagnosticPoints: [
      'SMPS 12V/5V Power Rail Voltage & Capacitor Leak Test',
      'GPU VRAM Artifacts & Hotspot Thermal Benchmark',
      'CPU Liquid Cooler / AIO Pump Flow & Paste Inspection',
      'System RAM Error Testing & Storage Sector Verification'
    ],
    normalPrice: 799,
    offerPrice: 0,
    eta: '30–40 Mins Doorstep Inspection',
    badge: 'Expert Hardware Diagnostics'
  },
  consoles: {
    category: 'consoles',
    name: 'PlayStation & Xbox Consoles',
    shortName: 'Gaming Console',
    icon: <Gamepad2 className="w-5 h-5" />,
    hookTitle: 'Get your Free Console Consultation / Check-up Today',
    hookSubtitle:
      'PlayStation 5 or Xbox Series X shutting down mid-match, HDMI loose or no signal, or controller stick drifting? Get a certified diagnostic right at home.',
    tagline: 'APU Liquid Metal, HDMI Port & Drift Inspection',
    popularBrands: ['Sony PlayStation 5 / PS4', 'Xbox Series X / S', 'Nintendo Switch'],
    diagnosticPoints: [
      'APU Liquid Metal Thermal Spread & Heat-Sink Clog Test',
      'HDMI Port Pins & Signal Eye Integrity Analysis',
      'Controller Analog Stick Deadzone & Potentiometer Drift Check',
      'Power Supply Internal Rail Stability Test'
    ],
    normalPrice: 599,
    offerPrice: 0,
    eta: '20–25 Mins On-Site Diagnostic',
    badge: 'Console Specialist Inspection'
  }
};

interface FreeConsultationHookProps {
  initialCategory?: DeviceCategory;
  settings?: BusinessSettings;
  onLeadCreated?: (lead: RepairRequestLead) => void;
  onTrackRequest?: (requestId: string) => void;
  className?: string;
  compactBannerOnly?: boolean;
}

export const FreeConsultationHook: React.FC<FreeConsultationHookProps> = ({
  initialCategory = 'phones',
  settings,
  onLeadCreated,
  onTrackRequest,
  className = '',
  compactBannerOnly = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<DeviceCategory>(initialCategory);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states inside modal
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [locality, setLocality] = useState('Koramangala');
  const [deviceModel, setDeviceModel] = useState('');
  const [preferredDate, setPreferredDate] = useState('Today');
  const [preferredTime, setPreferredTime] = useState('45-60 mins');
  const [issueNotes, setIssueNotes] = useState('');
  const [submittedLead, setSubmittedLead] = useState<RepairRequestLead | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync if initialCategory changes externally
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const currentDeviceData = DEVICE_CONSULTATION_DATA[selectedCategory];

  const handleOpenModal = (cat?: DeviceCategory) => {
    if (cat) setSelectedCategory(cat);
    trackEvent('free_consultation_modal_opened', { category: cat || selectedCategory });
    setIsModalOpen(true);
  };

  const handleWhatsAppConsult = () => {
    trackEvent('free_consultation_whatsapp_clicked', { category: selectedCategory });
    const waNumber = settings?.whatsappNumber || '919880123456';
    const text = encodeURIComponent(
      `Hi SS Care Technology! I would like to get my Free ${currentDeviceData.shortName} Consultation / Check-up Today in Bangalore (₹0 Doorstep Diagnostic). Please let me know technician availability.`
    );
    window.open(`https://wa.me/${waNumber}?text=${text}`, '_blank');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim()) return;

    setIsSubmitting(true);

    try {
      const newLead = dataService.createLead({
        customerName: customerName.trim(),
        phone: phone.trim(),
        whatsappNumber: phone.trim(),
        address: `${locality}, Bengaluru, Karnataka`,
        locality: locality,
        pincode: '560034',
        addressType: 'Home',
        category: selectedCategory,
        brand: currentDeviceData.popularBrands[0] || 'General',
        model: deviceModel.trim() || `${currentDeviceData.shortName} Check-up`,
        repairIssue: `Free Consultation & ${currentDeviceData.shortName} Health Check-up (₹0 Diagnostic)`,
        notes: issueNotes.trim() || 'Booked via Free Consultation & Check-up hook',
        quotedStartingPrice: 0,
        approvedFinalPrice: 0,
        preferredDate: preferredDate,
        preferredTime: preferredTime,
        sourcePage: 'Free Consultation Hook'
      });

      trackEvent('free_consultation_booked', {
        leadId: newLead.id,
        category: selectedCategory,
        locality
      });

      setSubmittedLead(newLead);
      if (onLeadCreated) {
        onLeadCreated(newLead);
      }
    } catch (err) {
      console.error('Failed to book free consultation:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const bangaloreLocalities = [
    'Koramangala',
    'Indiranagar',
    'HSR Layout',
    'Whitefield',
    'Jayanagar',
    'JP Nagar',
    'BTM Layout',
    'Electronic City',
    'Marathahalli',
    'Hebbal'
  ];

  return (
    <>
      <section
        id="free-consultation-hook"
        className={`relative overflow-hidden ${className}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Card Container */}
          <div className="relative rounded-3xl bg-gradient-to-b from-[#151826] via-[#12141f] to-[#0d0f17] border border-[#272c40] p-6 sm:p-8 lg:p-10 shadow-2xl">
            {/* Background ambient decorative glow */}
            <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#FF5A1F]/10 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-10 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

            {/* Top Bar: Eyebrow, Live Slots Tag, Guarantee */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800/80 pb-5 mb-6">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5A1F]/15 border border-[#FF5A1F]/30 text-[11px] font-extrabold text-[#FF5A1F] uppercase tracking-wider">
                  <Gift className="w-3.5 h-3.5 text-[#FF5A1F]" />
                  <span>Bangalore Doorstep Promotion</span>
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-bold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>₹0 Doorstep Diagnostic</span>
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>7 Free Slots Remaining Today</span>
                </span>
                <span className="text-gray-600 hidden sm:inline">•</span>
                <span className="hidden sm:inline">No repair obligation</span>
              </div>
            </div>

            {/* Dynamic Device Selector Tabs */}
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                <span>Select Your Device for Instant Check-up Scope:</span>
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {(Object.keys(DEVICE_CONSULTATION_DATA) as DeviceCategory[]).map((catKey) => {
                  const item = DEVICE_CONSULTATION_DATA[catKey];
                  const isSelected = selectedCategory === catKey;

                  return (
                    <button
                      key={catKey}
                      id={`hook-device-tab-${catKey}`}
                      onClick={() => {
                        setSelectedCategory(catKey);
                        trackEvent('free_consultation_tab_switched', { category: catKey });
                      }}
                      className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-[#FF5A1F] border-[#FF5A1F] text-white shadow-lg shadow-[#FF5A1F]/25 scale-102 font-bold'
                          : 'bg-[#181b28] border-[#262a3d] text-gray-300 hover:bg-[#1f2334] hover:text-white'
                      }`}
                    >
                      <div
                        className={`p-1.5 rounded-lg ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-[#131520] text-[#FF5A1F]'
                        }`}
                      >
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs truncate font-bold">{item.shortName}</div>
                        <div
                          className={`text-[10px] truncate ${
                            isSelected ? 'text-white/80' : 'text-gray-500'
                          }`}
                        >
                          Free Check-up
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Hook Content Body */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#161926]/90 border border-[#262b3e] p-6 sm:p-8 rounded-2xl">
              {/* Left Column: Dynamic Headlines & Value */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg">
                    {currentDeviceData.badge}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    <span>{currentDeviceData.eta}</span>
                  </span>
                </div>

                {/* THE CORE REQUESTED HOOK HEADLINE */}
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-['Space_Grotesk'] leading-tight">
                  {currentDeviceData.hookTitle}
                </h2>

                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  {currentDeviceData.hookSubtitle}
                </p>

                {/* Checklist of what's inspected */}
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                    What's Included in Your Free {currentDeviceData.shortName} Check-up:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-200">
                    {currentDeviceData.diagnosticPoints.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#FF5A1F] shrink-0 mt-0.5" />
                        <span className="leading-snug">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Popular Brands covered */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2 text-[11px] text-gray-400">
                  <span className="text-gray-500 font-medium">Covered brands:</span>
                  {currentDeviceData.popularBrands.map((b, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-[#1d2030] text-gray-300 border border-gray-800"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right Column: Free Consultation Claim Box */}
              <div className="lg:col-span-5 bg-[#12141f] border border-[#292f44] rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-xl">
                <div>
                  <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                        Diagnostic Fee
                      </span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-['Space_Grotesk']">
                          ₹0 FREE
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          ₹{currentDeviceData.normalPrice}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      100% Waived
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-gray-300">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Conducted live in front of you (100% data safe)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#FF5A1F] shrink-0" />
                      <span>Doorstep visit anywhere across Bangalore</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>No obligation to repair if you decide not to proceed</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-2">
                  <button
                    id={`claim-free-consultation-btn-${selectedCategory}`}
                    onClick={() => handleOpenModal()}
                    className="w-full py-3.5 px-5 rounded-xl bg-[#FF5A1F] hover:bg-[#e04812] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#FF5A1F]/30 transition-all hover:scale-102 active:scale-98 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Claim Free {currentDeviceData.shortName} Check-up</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    id={`whatsapp-free-consultation-btn-${selectedCategory}`}
                    onClick={handleWhatsAppConsult}
                    className="w-full py-3 px-4 rounded-xl bg-[#1d2130] hover:bg-[#252a3d] border border-gray-700 hover:border-[#25D366]/50 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-[#25D366] fill-[#25D366]/20" />
                    <span>Ask Tech on WhatsApp First</span>
                  </button>
                </div>

                <p className="text-[10px] text-center text-gray-500">
                  Instant confirmation • Technician brings genuine diagnostic equipment
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MODAL: 1-CLICK FREE CONSULTATION BOOKING ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141724] border border-[#2b3046] rounded-3xl p-6 sm:p-8 max-w-lg w-full animate-in zoom-in-95 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-800 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FF5A1F]/15 text-[#FF5A1F] border border-[#FF5A1F]/30 uppercase tracking-wider">
                  ₹0 Bangalore Doorstep Visit
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white font-['Space_Grotesk'] mt-1">
                  Book Your Free {currentDeviceData.shortName} Check-up
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  A master technician will inspect your {currentDeviceData.shortName} in front of you.
                </p>
              </div>

              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSubmittedLead(null);
                }}
                className="text-gray-400 hover:text-white p-1 rounded-lg bg-gray-800/60 hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success State */}
            {submittedLead ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white font-['Space_Grotesk']">
                    Free Consultation Booked!
                  </h4>
                  <p className="text-xs text-gray-300 mt-1 max-w-xs mx-auto">
                    Your request has been dispatched to our nearest Bangalore field technician.
                  </p>
                </div>

                <div className="bg-[#191d2c] border border-gray-800 p-4 rounded-2xl space-y-2 text-xs text-left max-w-sm mx-auto">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Request ID</span>
                    <span className="font-mono font-bold text-[#FF5A1F]">{submittedLead.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Device</span>
                    <span className="text-white font-medium">{submittedLead.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Consultation Fee</span>
                    <span className="text-emerald-400 font-bold">₹0 (Free Check-up)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Locality</span>
                    <span className="text-white">{submittedLead.locality}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Slot</span>
                    <span className="text-white">{submittedLead.preferredDate} ({submittedLead.preferredTime})</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      if (onTrackRequest) onTrackRequest(submittedLead.id);
                      setIsModalOpen(false);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1b1e2c] border border-gray-700 text-xs font-bold text-white hover:bg-[#232738]"
                  >
                    Track Live Status
                  </button>

                  <a
                    href={buildWhatsAppQuoteUrl({
                      businessNumber: settings?.whatsappNumber || '919880123456',
                      requestId: submittedLead.id,
                      customerName: submittedLead.customerName
                    })}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#25D366] text-xs font-bold text-white flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>WhatsApp Updates</span>
                  </a>
                </div>
              </div>
            ) : (
              /* Booking Form */
              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Device Selector in Modal */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    Device for Consultation
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                    {(Object.keys(DEVICE_CONSULTATION_DATA) as DeviceCategory[]).map((catKey) => {
                      const item = DEVICE_CONSULTATION_DATA[catKey];
                      const isSel = selectedCategory === catKey;
                      return (
                        <button
                          type="button"
                          key={catKey}
                          onClick={() => setSelectedCategory(catKey)}
                          className={`p-2 rounded-xl border text-center text-xs transition-colors cursor-pointer ${
                            isSel
                              ? 'bg-[#FF5A1F] border-[#FF5A1F] text-white font-bold'
                              : 'bg-[#1b1e2d] border-gray-800 text-gray-400 hover:text-white'
                          }`}
                        >
                          <div className="flex justify-center mb-1">{item.icon}</div>
                          <span className="block truncate text-[10px]">{item.shortName}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Your Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Farhan Shariff"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-[#1b1e2c] border border-gray-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5A1F]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Phone / WhatsApp Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 9880123456"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#1b1e2c] border border-gray-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5A1F]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Bangalore Locality
                    </label>
                    <select
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      className="w-full bg-[#1b1e2c] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5A1F]"
                    >
                      {bangaloreLocalities.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Specific Model / Brand (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. iPhone 14, Dell XPS 15, PS5"
                      value={deviceModel}
                      onChange={(e) => setDeviceModel(e.target.value)}
                      className="w-full bg-[#1b1e2c] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5A1F]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Preferred Date
                    </label>
                    <select
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full bg-[#1b1e2c] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5A1F]"
                    >
                      <option value="Today">Today (Fastest Dispatch)</option>
                      <option value="Tomorrow">Tomorrow</option>
                      <option value="This Weekend">This Weekend</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Preferred Time Slot
                    </label>
                    <select
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className="w-full bg-[#1b1e2c] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5A1F]"
                    >
                      <option value="45-60 mins (Immediate)">Immediate (in 45–60 mins)</option>
                      <option value="11:00 AM - 01:00 PM">Morning (11 AM – 1 PM)</option>
                      <option value="02:00 PM - 05:00 PM">Afternoon (2 PM – 5 PM)</option>
                      <option value="06:00 PM - 08:30 PM">Evening (6 PM – 8:30 PM)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Symptoms / Suspected Issue (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Battery drops fast, random restarts, screen lines..."
                    value={issueNotes}
                    onChange={(e) => setIssueNotes(e.target.value)}
                    className="w-full bg-[#1b1e2c] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>

                {/* Price Waiver Guarantee Notice */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-start gap-2.5 text-xs text-emerald-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Zero-Risk Doorstep Diagnostic:</span> You will receive
                    a transparent diagnosis. If no repair is required or you choose not to proceed, you pay{' '}
                    <span className="font-black text-white">₹0</span>.
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-[#FF5A1F] hover:bg-[#e04812] text-white text-xs font-extrabold shadow-lg shadow-[#FF5A1F]/20 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Booking Slot...' : 'Confirm Free Check-up (₹0)'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
