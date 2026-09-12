import React, { useState } from 'react';
import {
  BusinessSettings,
  ServiceArea,
  CustomerReview,
  FAQItem,
  RepairRequestLead,
  DeviceCategory
} from '../types';
import { Hero } from '../components/home/Hero';
import { TrustBar } from '../components/home/TrustBar';
import { ServicesSection } from '../components/home/ServicesSection';
import { ProcessSection } from '../components/home/ProcessSection';
import { CoverageSection } from '../components/home/CoverageSection';
import { ReviewsSection } from '../components/home/ReviewsSection';
import { FaqSection } from '../components/home/FaqSection';
import { QuoteWizard } from '../components/home/QuoteWizard';
import { FreeConsultationHook } from '../components/home/FreeConsultationHook';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  ShieldCheck,
  Award,
  Send,
  CheckCircle2,
  AlertCircle,
  Wrench
} from 'lucide-react';
import { buildWhatsAppQuoteUrl, buildWhatsAppSupportUrl } from '../utils/whatsapp';
import { trackEvent } from '../utils/analytics';
import { dataService } from '../services/dataService';

interface PublicPageProps {
  currentRoute: string;
  settings: BusinessSettings;
  areas: ServiceArea[];
  reviews: CustomerReview[];
  faqs: FAQItem[];
  onNavigate: (route: string) => void;
  onLeadCreated: (lead: RepairRequestLead) => void;
  onTrackRequest: (requestId: string) => void;
}

export const PublicPage: React.FC<PublicPageProps> = ({
  currentRoute,
  settings,
  areas,
  reviews,
  faqs,
  onNavigate,
  onLeadCreated,
  onTrackRequest
}) => {
  // Contact Form state
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactDevice, setContactDevice] = useState('Smartphone');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmittedLead, setContactSubmittedLead] = useState<RepairRequestLead | null>(null);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) return;

    trackEvent('contact_form_submitted', { name: contactName, phone: contactPhone, device: contactDevice });

    const newLead = dataService.createLead({
      customerName: contactName.trim(),
      phone: contactPhone.trim(),
      whatsappNumber: contactPhone.trim(),
      email: contactEmail.trim() || undefined,
      address: 'Contact Inquiry - Bangalore',
      locality: 'Koramangala',
      pincode: '560034',
      addressType: 'Home',
      category: 'phones',
      brand: 'General Inquiry',
      model: contactDevice,
      repairIssue: 'General Diagnostic / Repair Inquiry',
      notes: contactMessage.trim(),
      quotedStartingPrice: 499,
      preferredDate: 'Today',
      preferredTime: 'Anytime',
      sourcePage: 'Contact Page'
    });

    setContactSubmittedLead(newLead);
    onLeadCreated(newLead);
  };

  // --- 1. DEVICE CATEGORY LANDINGS ---
  if (
    currentRoute === '/phone-repair' ||
    currentRoute === '/laptop-repair' ||
    currentRoute === '/tablet-repair' ||
    currentRoute === '/desktop-repair' ||
    currentRoute === '/gaming-console-repair'
  ) {
    const categoryMap: Record<string, { cat: DeviceCategory; title: string; headline: string; subhead: string }> = {
      '/phone-repair': {
        cat: 'phones',
        title: 'Doorstep Phone Repair in Bangalore',
        headline: 'iPhone & Android Mobile Repair at Your Doorstep',
        subhead: 'Original grade OLED/LCD screens, certified batteries, charging flex soldering, and motherboard diagnostics across Bangalore.'
      },
      '/laptop-repair': {
        cat: 'laptops',
        title: 'Doorstep Laptop Repair Bangalore',
        headline: 'MacBook, Dell, HP & Lenovo Laptop Servicing',
        subhead: 'Broken laptop screen replacement, expanding battery swap, cooling fan cleaning, and high-speed NVMe SSD upgrades in front of you.'
      },
      '/tablet-repair': {
        cat: 'tablets',
        title: 'iPad & Tablet Repair in Bangalore',
        headline: 'Apple iPad & Samsung Galaxy Tab Doorstep Care',
        subhead: 'Touch glass digitizer bonding, retina display repair, battery replacement, and charging port fixes with up to 6 months warranty.'
      },
      '/desktop-repair': {
        cat: 'desktops',
        title: 'Doorstep PC & Desktop Repair Bangalore',
        headline: 'Custom Gaming PC, iMac & Workstation Repair',
        subhead: 'Dead SMPS power supply diagnosis, GPU thermal overhaul, clean OS installation, and deep hardware dust purging.'
      },
      '/gaming-console-repair': {
        cat: 'consoles',
        title: 'PlayStation & Xbox Repair in Bangalore',
        headline: 'PS5, PS4 & Xbox Console Doorstep Servicing',
        subhead: 'HDMI port micro-soldering, DualSense analog stick drift fixes, liquid metal replacement, and optical drive repairs.'
      }
    };

    const info = categoryMap[currentRoute];

    return (
      <div className="py-8 sm:py-12 animate-in fade-in duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-5">
              <span className="text-xs font-bold text-[#FF5A1F] bg-[#FF5A1F]/10 px-3 py-1 rounded-full uppercase tracking-wider">
                Bangalore Certified Doorstep Service
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-white font-['Space_Grotesk'] leading-tight">
                {info.headline}
              </h1>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                {info.subhead}
              </p>

              <div className="space-y-2 pt-2 text-xs sm:text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Up to 6 Months Genuine Warranty & Digital Certificate</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-[#FF5A1F]" />
                  <span>Repaired 100% in front of your eyes (Complete data safety)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-400" />
                  <span>Doorstep technician arrives in 45 – 90 minutes</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <QuoteWizard
                initialCategory={info.cat}
                onLeadCreated={onLeadCreated}
                onTrackRequest={onTrackRequest}
              />
            </div>
          </div>
        </div>

        {/* Dynamic Device Free Consultation & Check-up Hook */}
        <div className="mt-12">
          <FreeConsultationHook
            initialCategory={info.cat}
            settings={settings}
            onLeadCreated={onLeadCreated}
            onTrackRequest={onTrackRequest}
          />
        </div>

        <div className="mt-16">
          <CoverageSection areas={areas} onSelectAreaForQuote={() => {}} />
          <ReviewsSection reviews={reviews} />
          <FaqSection faqs={faqs} />
        </div>
      </div>
    );
  }

  // --- 2. ABOUT PAGE ---
  if (currentRoute === '/about') {
    return (
      <div className="py-12 sm:py-16 animate-in fade-in duration-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF5A1F] bg-[#FF5A1F]/10 px-3 py-1 rounded-full">
              ABOUT SS CARE TECHNOLOGY
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white font-['Space_Grotesk'] mt-3 tracking-tight">
              Bringing Professional Electronics Repair Directly to Bangalore
            </h1>
            <p className="text-sm sm:text-base text-gray-300 mt-4 leading-relaxed">
              Founded to eliminate the frustration of shady local repair shops, long turnaround times, and Bangalore traffic delays. We believe transparency, precision tools, and doorstep convenience should be the industry standard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#12141d] border border-[#232738] rounded-2xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#FF5A1F]/10 border border-[#FF5A1F]/20 flex items-center justify-center text-[#FF5A1F]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">100% Data Confidentiality</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Repairs are conducted right in front of you at your home or office desk. You never need to hand over sensitive passwords or leave your personal data behind.
              </p>
            </div>

            <div className="bg-[#12141d] border border-[#232738] rounded-2xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">Certified Master Techs</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Our technicians undergo rigorous background checks and chip-level micro-soldering certifications before handling customer devices.
              </p>
            </div>

            <div className="bg-[#12141d] border border-[#232738] rounded-2xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">Genuine Parts Warranty</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Every screen, battery, and replacement component comes with an instant digital warranty certificate valid up to 6 months with zero deductible claims.
              </p>
            </div>
          </div>

          <div className="bg-[#141724] border border-[#24293d] rounded-2xl p-8 space-y-4">
            <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">Our Service Philosophy</h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Electronics are essential to your daily life, work, and entertainment. When a screen cracks or a battery dies, you shouldn't have to spend half a day commuting through Silk Board or Outer Ring Road traffic just to drop off a device. SS Care Technology brings fully equipped mobile workstations straight to your doorstep across Bengaluru.
            </p>
            <div className="flex items-center gap-6 pt-4 text-xs font-semibold text-gray-400">
              <span>HQ: Koramangala 4th Block</span>
              <span>•</span>
              <span>Service: All BBMP Zones</span>
              <span>•</span>
              <span className="text-[#FF5A1F]">35+ Active Fleet Technicians</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- 3. CONTACT PAGE ---
  if (currentRoute === '/contact') {
    return (
      <div className="py-12 sm:py-16 animate-in fade-in duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF5A1F] bg-[#FF5A1F]/10 px-3 py-1 rounded-full">
              GET IN TOUCH
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white font-['Space_Grotesk'] mt-2 tracking-tight">
              Get a Quote or Reach Out
            </h1>
            <p className="text-sm text-gray-400 mt-2">
              Have questions or need emergency doorstep repair dispatch? We're available 7 days a week from 9 AM to 9 PM.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Col: Contact info & Google Maps integration */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#12141e] border border-[#212536] rounded-2xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">Bangalore Service Hub</h3>

                <div className="space-y-3 text-xs sm:text-sm text-gray-300">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#FF5A1F] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">{settings.address}</p>
                      <p className="text-gray-400">{settings.city}, {settings.state} - {settings.pincode}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-[#FF5A1F] shrink-0" />
                    <a href={`tel:${settings.phone}`} className="hover:text-white font-semibold">
                      {settings.phone}
                    </a>
                  </div>

                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    <a
                      href={buildWhatsAppSupportUrl(settings.whatsappNumber, 'Contact Page Inquiry')}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:underline font-semibold"
                    >
                      WhatsApp Direct Chat
                    </a>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-[#FF5A1F] shrink-0" />
                    <span>{settings.email}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#FF5A1F] shrink-0" />
                    <span>{settings.businessHours}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={settings.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#FF5A1F] hover:underline"
                  >
                    <span>Open in Google Maps →</span>
                  </a>
                </div>
              </div>

              {/* Google Maps Embed Frame */}
              <div className="bg-[#12141e] border border-[#212536] rounded-2xl overflow-hidden h-64 relative">
                <iframe
                  title="SS Care Technology Bangalore Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.58356976922!2d77.6223438750757!3d12.93448398737756!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1443685e13d1%3A0x6b4f7a77e9b0485c!2sKoramangala%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin"
                  className="w-full h-full border-0 filter grayscale invert contrast-125 opacity-80"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Right Col: Contact & Lead Form */}
            <div className="lg:col-span-7">
              <div className="bg-[#12141e] border border-[#212536] rounded-2xl p-6 sm:p-8">
                <h3 className="text-xl font-bold text-white mb-2 font-['Space_Grotesk']">
                  Send a Message / Fast Lead
                </h3>
                <p className="text-xs text-gray-400 mb-6">
                  Fill in your details below and our service team will connect with you via call or WhatsApp in under 15 minutes.
                </p>

                {contactSubmittedLead ? (
                  <div className="text-center py-8 space-y-4">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                    <h4 className="text-xl font-bold text-white">Lead Successfully Registered</h4>
                    <p className="text-xs text-gray-300">
                      Request ID: <span className="font-mono text-[#FF5A1F] font-bold">{contactSubmittedLead.id}</span>
                    </p>
                    <p className="text-xs text-gray-400">
                      Our coordinator is reviewing your request. You can also chat directly on WhatsApp right now.
                    </p>
                    <div className="flex gap-3 justify-center pt-2">
                      <a
                        href={buildWhatsAppQuoteUrl({
                          businessNumber: settings.whatsappNumber,
                          requestId: contactSubmittedLead.id,
                          customerName: contactSubmittedLead.customerName
                        })}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-[#25D366] text-white text-xs font-bold px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5"
                      >
                        <MessageCircle className="w-4 h-4 fill-white" />
                        <span>Chat on WhatsApp</span>
                      </a>
                      <button
                        onClick={() => setContactSubmittedLead(null)}
                        className="bg-gray-800 text-gray-300 text-xs font-semibold px-4 py-2.5 rounded-xl hover:text-white"
                      >
                        Send Another Note
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">Your Name *</label>
                        <input
                          type="text"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="e.g. Farhan Shariff"
                          className="w-full bg-[#181a26] border border-[#2b3046] rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5A1F]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder="e.g. 9876543210"
                          className="w-full bg-[#181a26] border border-[#2b3046] rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5A1F]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address</label>
                        <input
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="e.g. name@example.com"
                          className="w-full bg-[#181a26] border border-[#2b3046] rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5A1F]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">Device Type</label>
                        <select
                          value={contactDevice}
                          onChange={(e) => setContactDevice(e.target.value)}
                          className="w-full bg-[#181a26] border border-[#2b3046] rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5A1F]"
                        >
                          <option value="iPhone / Smartphone">iPhone / Smartphone</option>
                          <option value="MacBook / Laptop">MacBook / Laptop</option>
                          <option value="iPad / Tablet">iPad / Tablet</option>
                          <option value="Desktop PC / iMac">Desktop PC / iMac</option>
                          <option value="Gaming Console (PS5 / Xbox)">Gaming Console (PS5 / Xbox)</option>
                          <option value="Other Electronics">Other Electronics</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">Issue / Message</label>
                      <textarea
                        rows={3}
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="Describe the issue, device model, or preferred visit time..."
                        className="w-full bg-[#181a26] border border-[#2b3046] rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5A1F]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 px-4 rounded-xl bg-[#FF5A1F] hover:bg-[#e04812] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#FF5A1F]/20 transition-all cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit Inquiry & Get Call Back</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- 4. DEDICATED FULL FAQ PAGE ---
  if (currentRoute === '/faq') {
    return (
      <div className="py-12 animate-in fade-in duration-200">
        <FaqSection faqs={faqs} />
      </div>
    );
  }

  // --- 5. DEDICATED REPAIR REQUEST PAGE ---
  if (currentRoute === '/request-repair') {
    return (
      <div className="py-12 sm:py-16 animate-in fade-in duration-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF5A1F] bg-[#FF5A1F]/10 px-3 py-1 rounded-full">
              DOORSTEP REPAIR BOOKING
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white font-['Space_Grotesk'] mt-2">
              Book a Certified Technician in Bangalore
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Select your gadget, view estimated prices, and schedule a technician visit in 60 seconds.
            </p>
          </div>

          <QuoteWizard
            onLeadCreated={onLeadCreated}
            onTrackRequest={onTrackRequest}
          />
        </div>
      </div>
    );
  }

  // --- DEFAULT: HOME PAGE ---
  return (
    <div className="animate-in fade-in duration-200 space-y-12 sm:space-y-16">
      <Hero
        settings={settings}
        onLeadCreated={onLeadCreated}
        onTrackRequest={onTrackRequest}
      />
      <FreeConsultationHook
        settings={settings}
        onLeadCreated={onLeadCreated}
        onTrackRequest={onTrackRequest}
      />
      <TrustBar settings={settings} />
      <ServicesSection onSelectService={(cat) => onNavigate(`/${cat.replace(/s$/, '')}-repair`)} />
      <ProcessSection onStartQuote={() => onNavigate('/request-repair')} />
      <CoverageSection
        areas={areas}
        onSelectAreaForQuote={(area) => {
          onNavigate('/request-repair');
        }}
      />
      <ReviewsSection reviews={reviews} />
      <FaqSection faqs={faqs} />
    </div>
  );
};
