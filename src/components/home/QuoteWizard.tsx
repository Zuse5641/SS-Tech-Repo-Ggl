import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Gamepad2,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  MapPin,
  Calendar,
  Sparkles,
  MessageCircle,
  Search
} from 'lucide-react';
import {
  DeviceCategory,
  DeviceBrand,
  DeviceModel,
  RepairIssue,
  ServiceArea,
  RepairRequestLead
} from '../../types';
import { dataService } from '../../services/dataService';
import { trackEvent, getUtmParams } from '../../utils/analytics';
import {
  buildWhatsAppQuoteUrl,
  buildLeadDispatchWhatsAppUrl,
  buildLeadDispatchMessageText
} from '../../utils/whatsapp';

interface QuoteWizardProps {
  initialCategory?: DeviceCategory;
  onLeadCreated: (lead: RepairRequestLead) => void;
  onTrackRequest: (requestId: string) => void;
}

interface FormState {
  category: DeviceCategory;
  brand: string;
  model: string;
  repairIssue: string;
  quotedStartingPrice: number;
  customerName: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  locality: string;
  pincode: string;
  addressType: 'Home' | 'Office' | 'Other';
  preferredDate: string;
  preferredTime: string;
  notes: string;
}

const STORAGE_KEY = 'sscare_quote_draft_v1';

export const QuoteWizard: React.FC<QuoteWizardProps> = ({
  initialCategory = 'phones',
  onLeadCreated,
  onTrackRequest
}) => {
  const [step, setStep] = useState<number>(1);
  const [submittedLead, setSubmittedLead] = useState<RepairRequestLead | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available data from service
  const [brands, setBrands] = useState<DeviceBrand[]>([]);
  const [models, setModels] = useState<DeviceModel[]>([]);
  const [repairs, setRepairs] = useState<RepairIssue[]>([]);
  const [areas, setAreas] = useState<ServiceArea[]>([]);

  // Wizard state with local session persistence
  const [formData, setFormData] = useState<FormState>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore
        }
      }
    }
    return {
      category: initialCategory,
      brand: '',
      model: '',
      repairIssue: '',
      quotedStartingPrice: 0,
      customerName: '',
      phone: '',
      whatsappNumber: '',
      email: '',
      address: '',
      locality: 'Koramangala',
      pincode: '560034',
      addressType: 'Home',
      preferredDate: 'Today',
      preferredTime: '02:00 PM – 04:00 PM',
      notes: ''
    };
  });

  // Sync to sessionStorage
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  // Load catalogs on category or brand change
  useEffect(() => {
    const loadedBrands = dataService.getBrands(formData.category);
    setBrands(loadedBrands);

    const loadedRepairs = dataService.getRepairs(formData.category);
    setRepairs(loadedRepairs);

    const loadedAreas = dataService.getServiceAreas();
    setAreas(loadedAreas);
  }, [formData.category]);

  useEffect(() => {
    if (formData.brand) {
      const loadedModels = dataService.getModels(formData.brand, formData.category);
      setModels(loadedModels);
    } else {
      setModels([]);
    }
  }, [formData.brand, formData.category]);

  const deviceCategories: { id: DeviceCategory; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'phones', label: 'Phones', icon: <Smartphone className="w-5 h-5" />, desc: 'iPhone, Galaxy, OnePlus, etc.' },
    { id: 'laptops', label: 'Laptops', icon: <Laptop className="w-5 h-5" />, desc: 'MacBook, Dell, HP, Lenovo' },
    { id: 'tablets', label: 'Tablets', icon: <Tablet className="w-5 h-5" />, desc: 'iPad, Samsung Tab, etc.' },
    { id: 'desktops', label: 'Desktops', icon: <Monitor className="w-5 h-5" />, desc: 'Custom PC, iMac, Workstations' },
    { id: 'consoles', label: 'Consoles', icon: <Gamepad2 className="w-5 h-5" />, desc: 'PS5, PS4, Xbox, Switch' }
  ];

  const handleSelectCategory = (cat: DeviceCategory) => {
    setFormData((prev) => ({
      ...prev,
      category: cat,
      brand: '',
      model: '',
      repairIssue: '',
      quotedStartingPrice: 0
    }));
    trackEvent('device_selected', { category: cat });
    setStep(2);
  };

  const handleSelectBrand = (brandName: string) => {
    setFormData((prev) => ({
      ...prev,
      brand: brandName,
      model: ''
    }));
    trackEvent('brand_selected', { brand: brandName });
    setStep(3);
  };

  const handleSelectModel = (modelName: string) => {
    setFormData((prev) => ({ ...prev, model: modelName }));
    trackEvent('model_selected', { model: modelName });
    setStep(4);
  };

  const handleSelectRepair = (repair: RepairIssue) => {
    setFormData((prev) => ({
      ...prev,
      repairIssue: repair.name,
      quotedStartingPrice: repair.startingPrice
    }));
    trackEvent('repair_selected', { repair: repair.name, startingPrice: repair.startingPrice });
    setStep(5);
  };

  const handleLocalityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const locName = e.target.value;
    const found = areas.find((a) => a.name === locName);
    setFormData((prev) => ({
      ...prev,
      locality: locName,
      pincode: found ? found.pincode : prev.pincode
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (!formData.customerName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.replace(/[^0-9]/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!formData.address.trim()) {
      setErrorMsg('Please enter your street address / apartment details.');
      return;
    }

    setIsSubmitting(true);
    const utm = getUtmParams();

    try {
      const newLead = dataService.createLead({
        customerName: formData.customerName.trim(),
        phone: formData.phone.trim(),
        whatsappNumber: formData.whatsappNumber.trim() || formData.phone.trim(),
        email: formData.email.trim() || undefined,
        address: formData.address.trim(),
        locality: formData.locality,
        pincode: formData.pincode,
        addressType: formData.addressType,
        category: formData.category,
        brand: formData.brand || 'Other / Not Listed',
        model: formData.model || 'Other / Custom Model',
        repairIssue: formData.repairIssue,
        notes: formData.notes.trim() || undefined,
        quotedStartingPrice: formData.quotedStartingPrice || 999,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        sourcePage: 'Homepage Quote Wizard',
        ...utm
      });

      trackEvent('quote_submitted', {
        requestId: newLead.id,
        category: newLead.category,
        repair: newLead.repairIssue,
        startingPrice: newLead.quotedStartingPrice,
        locality: newLead.locality
      });

      // Clear draft
      sessionStorage.removeItem(STORAGE_KEY);
      setSubmittedLead(newLead);
      onLeadCreated(newLead);
    } catch (err: any) {
      setErrorMsg('Failed to submit quote request. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render Confirmation Screen when submitted
  if (submittedLead) {
    const bizSettings = dataService.getSettings();
    const leadDispatchUrl = buildLeadDispatchWhatsAppUrl({
      businessNumber: bizSettings.whatsappNumber,
      requestId: submittedLead.id,
      customerName: submittedLead.customerName,
      phone: submittedLead.phone,
      whatsappNumber: submittedLead.whatsappNumber,
      locality: submittedLead.locality,
      pincode: submittedLead.pincode,
      address: submittedLead.address,
      addressType: submittedLead.addressType,
      category: submittedLead.category,
      brand: submittedLead.brand,
      model: submittedLead.model,
      repairIssue: submittedLead.repairIssue,
      quotedStartingPrice: submittedLead.quotedStartingPrice,
      preferredDate: submittedLead.preferredDate,
      preferredTime: submittedLead.preferredTime,
      serviceOtp: submittedLead.serviceOtp,
      notes: submittedLead.notes
    });

    const rawMessage = buildLeadDispatchMessageText({
      businessNumber: bizSettings.whatsappNumber,
      requestId: submittedLead.id,
      customerName: submittedLead.customerName,
      phone: submittedLead.phone,
      whatsappNumber: submittedLead.whatsappNumber,
      locality: submittedLead.locality,
      pincode: submittedLead.pincode,
      address: submittedLead.address,
      addressType: submittedLead.addressType,
      category: submittedLead.category,
      brand: submittedLead.brand,
      model: submittedLead.model,
      repairIssue: submittedLead.repairIssue,
      quotedStartingPrice: submittedLead.quotedStartingPrice,
      preferredDate: submittedLead.preferredDate,
      preferredTime: submittedLead.preferredTime,
      serviceOtp: submittedLead.serviceOtp,
      notes: submittedLead.notes
    });

    return (
      <div id="quote-confirmation-card" className="bg-[#12141d] border border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="text-center max-w-lg mx-auto">
          <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-400 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
            Doorstep Booking Confirmed
          </span>

          <h3 className="text-2xl sm:text-3xl font-bold text-white mt-2 font-['Space_Grotesk']">
            Lead Generated & Ready for Dispatch
          </h3>

          <div className="bg-[#181b28] border border-[#2b3044] rounded-xl p-4 my-5 text-left space-y-2 text-sm">
            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
              <span className="text-gray-400 text-xs uppercase font-medium">Request ID</span>
              <span className="text-[#FF5A1F] font-mono font-bold text-sm tracking-wider">{submittedLead.id}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Device</span>
              <span className="text-white font-semibold">{submittedLead.brand} - {submittedLead.model}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Selected Repair</span>
              <span className="text-white font-semibold">{submittedLead.repairIssue}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Doorstep Location</span>
              <span className="text-white">{submittedLead.locality} ({submittedLead.pincode})</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Arrival OTP</span>
              <span className="text-amber-400 font-mono font-bold">{submittedLead.serviceOtp || 'Pending'}</span>
            </div>
            <div className="flex justify-between items-center text-xs pt-1 border-t border-gray-800">
              <span className="text-gray-400">Starting Price</span>
              <span className="text-emerald-400 font-bold">₹{submittedLead.quotedStartingPrice.toLocaleString('en-IN')}*</span>
            </div>
          </div>

          {/* WhatsApp Notification Card */}
          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center gap-2 mb-1.5">
              <MessageCircle className="w-4 h-4 text-emerald-400 fill-emerald-400 shrink-0" />
              <span className="text-xs font-bold text-emerald-300">
                Direct WhatsApp Dispatch to Central Desk
              </span>
            </div>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              This booking is routed directly to the SS Care dispatch desk on WhatsApp{' '}
              <span className="text-emerald-400 font-mono font-semibold">
                (+{bizSettings.whatsappNumber.startsWith('91') ? bizSettings.whatsappNumber : `91 ${bizSettings.whatsappNumber}`})
              </span>
              . Tap below to send or confirm your ticket instantly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              id="confirm-whatsapp-cta"
              href={leadDispatchUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#25D366]/25 transition-all hover:scale-102"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Send to SS Care WhatsApp</span>
            </a>

            <button
              id="confirm-track-cta"
              onClick={() => onTrackRequest(submittedLead.id)}
              className="flex items-center justify-center gap-2 bg-[#1f2333] hover:bg-[#2a2f44] text-white px-5 py-3 rounded-xl font-semibold text-sm border border-gray-700 transition-all"
            >
              <Search className="w-4 h-4 text-[#FF5A1F]" />
              <span>Track Repair Status</span>
            </button>
          </div>

          <details className="mt-4 text-left group">
            <summary className="text-[11px] text-gray-500 hover:text-gray-400 cursor-pointer select-none text-center">
              Preview WhatsApp Dispatch Message
            </summary>
            <div className="mt-2 p-3 rounded-lg bg-[#0b0c12] border border-gray-800 text-[10px] text-gray-400 font-mono whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
              {rawMessage}
            </div>
          </details>

          <button
            onClick={() => {
              setSubmittedLead(null);
              setStep(1);
            }}
            className="mt-5 text-xs text-gray-500 hover:text-gray-300 underline block mx-auto"
          >
            Submit another repair request
          </button>
        </div>
      </div>
    );
  }

  const progressPercentage = Math.round((step / 5) * 100);

  return (
    <div
      id="hero-quote-wizard-card"
      className="bg-[#12141c]/95 border border-[#262a3d] rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-md relative"
    >
      {/* Wizard Header & Stepper */}
      <div className="flex items-center justify-between border-b border-[#1f2334] pb-3 mb-4">
        <div className="flex items-center gap-2">
          {step > 1 && (
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Go to previous step"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <span className="text-[11px] font-bold text-[#FF5A1F] uppercase tracking-wider">
              Step {step} of 5
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white font-['Space_Grotesk']">
              {step === 1 && 'Select Device Category'}
              {step === 2 && `Select ${formData.category.replace(/s$/, '')} Brand`}
              {step === 3 && `Select ${formData.brand} Model`}
              {step === 4 && 'Select Issue or Part Needed'}
              {step === 5 && 'Doorstep Service Details'}
            </h3>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-semibold text-gray-400">{progressPercentage}% Complete</span>
          <div className="w-20 sm:w-28 h-1.5 bg-gray-800 rounded-full mt-1 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF5A1F] to-amber-500 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* STEP 1: DEVICE CATEGORY */}
      {step === 1 && (
        <div className="space-y-2 animate-in fade-in duration-200">
          <p className="text-xs text-gray-400 mb-3">Which electronics item needs diagnosis & repair at your location?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {deviceCategories.map((cat) => (
              <button
                key={cat.id}
                id={`wizard-category-${cat.id}`}
                onClick={() => handleSelectCategory(cat.id)}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between group ${
                  formData.category === cat.id
                    ? 'bg-[#FF5A1F]/15 border-[#FF5A1F] text-white shadow-lg shadow-[#FF5A1F]/10'
                    : 'bg-[#171a26] border-[#24283b] text-gray-300 hover:bg-[#1f2334] hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      formData.category === cat.id ? 'bg-[#FF5A1F] text-white' : 'bg-gray-800 text-gray-400 group-hover:text-white'
                    }`}
                  >
                    {cat.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{cat.label}</h4>
                    <p className="text-[11px] text-gray-400">{cat.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-[#FF5A1F] group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: SELECT BRAND */}
      {step === 2 && (
        <div className="space-y-2 animate-in fade-in duration-200">
          <p className="text-xs text-gray-400 mb-3">Choose the manufacturer brand of your {formData.category.replace(/s$/, '')}:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
            {brands.map((b) => (
              <button
                key={b.id}
                id={`wizard-brand-${b.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => handleSelectBrand(b.name)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  formData.brand === b.name
                    ? 'bg-[#FF5A1F]/15 border-[#FF5A1F] text-white font-bold'
                    : 'bg-[#171a26] border-[#24283b] text-gray-300 hover:bg-[#1f2334] hover:border-gray-700 font-medium'
                }`}
              >
                <span className="text-xs sm:text-sm block">{b.name}</span>
              </button>
            ))}
            <button
              onClick={() => handleSelectBrand('Other / Not Listed')}
              className="p-3 rounded-xl border border-dashed border-gray-700 bg-transparent text-gray-400 hover:text-white hover:border-[#FF5A1F] text-xs font-medium text-center"
            >
              Other Brand / Custom
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SELECT MODEL */}
      {step === 3 && (
        <div className="space-y-2 animate-in fade-in duration-200">
          <p className="text-xs text-gray-400 mb-3">Select your model for accurate part matching:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
            {models.map((m) => (
              <button
                key={m.id}
                id={`wizard-model-${m.id}`}
                onClick={() => handleSelectModel(m.name)}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  formData.model === m.name
                    ? 'bg-[#FF5A1F]/15 border-[#FF5A1F] text-white font-bold'
                    : 'bg-[#171a26] border-[#24283b] text-gray-300 hover:bg-[#1f2334] hover:border-gray-700 font-medium'
                }`}
              >
                <span className="text-xs sm:text-sm">{m.name}</span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
              </button>
            ))}
            <button
              onClick={() => handleSelectModel('Other Model / Older Variant')}
              className="p-3 rounded-xl border border-dashed border-gray-700 bg-transparent text-gray-400 hover:text-white hover:border-[#FF5A1F] text-xs font-medium text-center sm:col-span-2"
            >
              My model is not listed (Tech will identify)
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: SELECT REPAIR / ISSUE */}
      {step === 4 && (
        <div className="space-y-2 animate-in fade-in duration-200">
          <p className="text-xs text-gray-400 mb-2">What issue are you facing with your {formData.brand} {formData.model}?</p>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {repairs.map((r) => (
              <button
                key={r.id}
                id={`wizard-repair-${r.id}`}
                onClick={() => handleSelectRepair(r)}
                className={`w-full p-3.5 rounded-xl border text-left flex items-start justify-between gap-3 transition-all ${
                  formData.repairIssue === r.name
                    ? 'bg-[#FF5A1F]/15 border-[#FF5A1F] text-white'
                    : 'bg-[#171a26] border-[#24283b] text-gray-300 hover:bg-[#1f2334] hover:border-gray-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-white">{r.name}</span>
                    {r.popular && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-semibold">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 line-clamp-1">{r.description}</p>
                  <div className="flex items-center gap-3 text-[11px] text-gray-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-sky-400" />
                      {r.estimatedTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      {r.warrantyPeriod} Warranty
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-gray-400 uppercase block">Starts from</span>
                  <span className="text-sm sm:text-base font-extrabold text-[#FF5A1F]">
                    ₹{r.startingPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <p className="text-[11px] text-gray-500 italic text-center pt-1">
            *Final price is confirmed after technician diagnosis at your location.
          </p>
        </div>
      )}

      {/* STEP 5: CUSTOMER & LOCATION DETAILS */}
      {step === 5 && (
        <form onSubmit={handleSubmit} className="space-y-3 animate-in fade-in duration-200">
          {/* Selected Summary Badge */}
          <div className="bg-[#191c2b] border border-[#2b3046] rounded-xl p-2.5 flex items-center justify-between text-xs">
            <div className="truncate">
              <span className="text-gray-400">Repairing: </span>
              <span className="text-white font-bold">{formData.brand} {formData.model}</span>
              <span className="text-[#FF5A1F] block truncate">{formData.repairIssue}</span>
            </div>
            <div className="text-right shrink-0 pl-2">
              <span className="text-xs font-black text-emerald-400">
                ₹{formData.quotedStartingPrice.toLocaleString('en-IN')}*
              </span>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="text-[10px] text-gray-400 hover:text-white underline block"
              >
                Change
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                Your Full Name *
              </label>
              <input
                id="wizard-input-name"
                type="text"
                required
                placeholder="e.g. Farhan Shariff"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full bg-[#161824] border border-[#2b3044] rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5A1F]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                Mobile Number (for technician call) *
              </label>
              <input
                id="wizard-input-phone"
                type="tel"
                required
                placeholder="e.g. 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value, whatsappNumber: formData.whatsappNumber || e.target.value })}
                className="w-full bg-[#161824] border border-[#2b3044] rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5A1F]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                Bangalore Locality *
              </label>
              <select
                id="wizard-select-locality"
                value={formData.locality}
                onChange={handleLocalityChange}
                className="w-full bg-[#161824] border border-[#2b3044] rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5A1F]"
              >
                {areas.map((a) => (
                  <option key={a.id} value={a.name}>
                    {a.name} ({a.pincode}) - {a.serviceEta}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                Pincode
              </label>
              <input
                id="wizard-input-pincode"
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full bg-[#161824] border border-[#2b3044] rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5A1F]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-300 mb-1">
              Flat / House / Building Address *
            </label>
            <input
              id="wizard-input-address"
              type="text"
              required
              placeholder="e.g. Flat 302, Prestige Ferns, 80ft Road"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-[#161824] border border-[#2b3044] rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5A1F]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                Address Type
              </label>
              <select
                id="wizard-select-addresstype"
                value={formData.addressType}
                onChange={(e) => setFormData({ ...formData, addressType: e.target.value as any })}
                className="w-full bg-[#161824] border border-[#2b3044] rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5A1F]"
              >
                <option value="Home">Home</option>
                <option value="Office">Office / Workplace</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                Preferred Date
              </label>
              <select
                id="wizard-select-date"
                value={formData.preferredDate}
                onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                className="w-full bg-[#161824] border border-[#2b3044] rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5A1F]"
              >
                <option value="Today">Today (Fast Dispatch)</option>
                <option value="Tomorrow">Tomorrow</option>
                <option value="Weekend">This Weekend</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                Time Window
              </label>
              <select
                id="wizard-select-time"
                value={formData.preferredTime}
                onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                className="w-full bg-[#161824] border border-[#2b3044] rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5A1F]"
              >
                <option value="10:00 AM – 12:00 PM">10:00 AM – 12:00 PM</option>
                <option value="12:00 PM – 02:00 PM">12:00 PM – 02:00 PM</option>
                <option value="02:00 PM – 04:00 PM">02:00 PM – 04:00 PM</option>
                <option value="04:00 PM – 06:00 PM">04:00 PM – 06:00 PM</option>
                <option value="06:00 PM – 08:00 PM">06:00 PM – 08:00 PM</option>
              </select>
            </div>
          </div>

          <button
            id="wizard-submit-quote-btn"
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-[#FF5A1F] hover:bg-[#e04812] text-white font-extrabold text-sm sm:text-base shadow-xl shadow-[#FF5A1F]/25 flex items-center justify-center gap-2 transition-all hover:scale-101 active:scale-98 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Submitting Request...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Confirm & Book Doorstep Visit</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-gray-400 text-center">
            No upfront payment required. You only pay after the repair is completed & verified.
          </p>
        </form>
      )}
    </div>
  );
};
