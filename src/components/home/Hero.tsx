import React from 'react';
import {
  ShieldCheck,
  MapPin,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowDown,
  Gift
} from 'lucide-react';
import { BusinessSettings, RepairRequestLead, DeviceCategory } from '../../types';
import { QuoteWizard } from './QuoteWizard';
import { buildWhatsAppQuoteUrl } from '../../utils/whatsapp';
import { trackEvent } from '../../utils/analytics';

interface HeroProps {
  settings: BusinessSettings;
  onLeadCreated: (lead: RepairRequestLead) => void;
  onTrackRequest: (requestId: string) => void;
  onCategorySelect?: (cat: DeviceCategory) => void;
  onOpenConsultation?: (cat?: DeviceCategory) => void;
}

export const Hero: React.FC<HeroProps> = ({
  settings,
  onLeadCreated,
  onTrackRequest,
  onOpenConsultation
}) => {
  const handleWhatsApp = () => {
    trackEvent('whatsapp_clicked', { source: 'hero_secondary_cta' });
    const url = buildWhatsAppQuoteUrl({
      businessNumber: settings.whatsappNumber
    });
    window.open(url, '_blank');
  };

  const scrollToWizard = () => {
    const el = document.getElementById('hero-quote-wizard-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToConsultation = () => {
    const el = document.getElementById('free-consultation-hook');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else if (onOpenConsultation) {
      onOpenConsultation();
    }
  };

  return (
    <section id="hero-section" className="relative pt-6 pb-16 lg:pt-12 lg:pb-24 overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FF5A1F]/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Value Prop & Headlines */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            {/* Eyebrow badge & Free Consultation Hook Trigger */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1c202e] border border-[#2b3147] shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#FF5A1F] animate-ping" />
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#FF5A1F]">
                  BANGALORE'S DOORSTEP REPAIR SERVICE
                </span>
              </div>

              <button
                id="hero-free-consultation-pill"
                onClick={scrollToConsultation}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 hover:bg-emerald-500/25 text-[11px] font-bold transition-all hover:scale-105 cursor-pointer shadow-sm group"
              >
                <Gift className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
                <span>Get your Free Consultation / Check-up Today →</span>
              </button>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl xl:text-6xl font-black text-white font-['Space_Grotesk'] leading-[1.1] tracking-tight">
              Electronics Repair <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5A1F] via-[#FF7A45] to-amber-400">
                at Your Doorstep
              </span>{' '}
              in Bangalore
            </h1>

            {/* Subheadline */}
            <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Cracked screen? Dead battery? Charging problem? We dispatch background-verified master technicians directly to your home or office anywhere in Bangalore.
            </p>

            {/* Highlights List */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 pt-2 max-w-lg mx-auto lg:mx-0 text-left text-xs font-medium text-gray-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#FF5A1F] shrink-0" />
                <span>Repaired in front of you</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Up to 6 Months Warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Fast 45-90 min doorstep visit</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>All Bangalore pin codes</span>
              </div>
            </div>

            {/* Quick Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                id="hero-get-quote-cta"
                onClick={scrollToWizard}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#FF5A1F] hover:bg-[#e04812] text-white px-6 py-3.5 rounded-xl font-extrabold text-sm shadow-xl shadow-[#FF5A1F]/25 transition-all hover:scale-102 active:scale-98 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Get Instant Repair Quote</span>
                <ArrowDown className="w-4 h-4 sm:hidden" />
              </button>

              <button
                id="hero-free-checkup-cta"
                onClick={scrollToConsultation}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:brightness-110 text-white px-5 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all hover:scale-102 active:scale-98 cursor-pointer"
              >
                <Gift className="w-4 h-4" />
                <span>Free Check-up (₹0)</span>
              </button>

              <button
                id="hero-whatsapp-cta"
                onClick={handleWhatsApp}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1d2130] hover:bg-[#252a3d] border border-gray-700 text-white px-5 py-3.5 rounded-xl font-bold text-sm shadow-lg transition-all hover:scale-102 active:scale-98 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366] fill-[#25D366]/20" />
                <span>WhatsApp Us</span>
              </button>
            </div>

            {/* Transparent Pricing Disclaimer Note */}
            <p className="text-[11px] text-gray-500 italic">
              *Starting prices shown. Final price is confirmed after technician diagnosis before beginning work.
            </p>
          </div>

          {/* Right Column: Hero Repair Quote Selector Wizard */}
          <div className="lg:col-span-6">
            <QuoteWizard
              onLeadCreated={onLeadCreated}
              onTrackRequest={onTrackRequest}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
