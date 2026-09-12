import React from 'react';
import {
  Wrench,
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  ShieldCheck,
  Award,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { BusinessSettings, ServiceArea } from '../../types';
import { buildWhatsAppSupportUrl } from '../../utils/whatsapp';

interface FooterProps {
  settings: BusinessSettings;
  areas: ServiceArea[];
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, areas, onNavigate }) => {
  const activeAreas = areas.filter((a) => a.active).slice(0, 16);

  return (
    <footer id="main-footer" className="bg-[#08090d] border-t border-[#1a1d29] text-gray-400 text-sm">
      {/* Top Value Banner */}
      <div className="border-b border-[#161824] py-8 bg-[#0c0e14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#FF5A1F]/10 border border-[#FF5A1F]/20 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-[#FF5A1F]" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Bangalore Doorstep Visit</h4>
              <p className="text-xs text-gray-400">Home & office service across the city</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Up to 6 Months Warranty</h4>
              <p className="text-xs text-gray-400">Digital certificate with every repair</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Certified Technicians</h4>
              <p className="text-xs text-gray-400">Background-verified master engineers</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Repaired In Front Of You</h4>
              <p className="text-xs text-gray-400">100% data security & transparent pricing</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF5A1F] to-[#E04812] flex items-center justify-center shadow-lg shadow-[#FF5A1F]/20">
                <Wrench className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-black text-white font-['Space_Grotesk'] tracking-tight">
                SS CARE <span className="text-[#FF5A1F]">TECHNOLOGY</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-md">
              Bangalore's premium doorstep electronics repair platform. We dispatch certified technicians equipped with OEM diagnostic gear to repair smartphones, laptops, iPads, desktops, and consoles right at your premises.
            </p>

            <div className="space-y-2 pt-2 text-xs text-gray-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#FF5A1F] shrink-0 mt-0.5" />
                <span>{settings.address}, {settings.city} - {settings.pincode}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#FF5A1F] shrink-0" />
                <a href={`tel:${settings.phone}`} className="hover:text-white transition-colors">{settings.phone}</a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#FF5A1F] shrink-0" />
                <span>{settings.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#FF5A1F] shrink-0" />
                <span>{settings.businessHours}</span>
              </div>
            </div>
          </div>

          {/* Doorstep Services */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4 font-['Space_Grotesk']">
              Repair Services
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button onClick={() => onNavigate('/phone-repair')} className="hover:text-[#FF5A1F] transition-colors">
                  Phone Repair Bangalore
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/laptop-repair')} className="hover:text-[#FF5A1F] transition-colors">
                  Laptop Screen & Battery
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/tablet-repair')} className="hover:text-[#FF5A1F] transition-colors">
                  iPad & Tablet Repair
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/desktop-repair')} className="hover:text-[#FF5A1F] transition-colors">
                  Desktop & PC Servicing
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/gaming-console-repair')} className="hover:text-[#FF5A1F] transition-colors">
                  PS5 & Xbox Repair
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/request-repair')} className="text-[#FF5A1F] font-semibold hover:underline">
                  Get Instant Quote →
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4 font-['Space_Grotesk']">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button onClick={() => onNavigate('/about')} className="hover:text-[#FF5A1F] transition-colors">
                  About SS Care
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/contact')} className="hover:text-[#FF5A1F] transition-colors">
                  Contact & Support
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/faq')} className="hover:text-[#FF5A1F] transition-colors">
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/request-repair')} className="hover:text-[#FF5A1F] transition-colors">
                  Book Doorstep Service
                </button>
              </li>
            </ul>
          </div>

          {/* WhatsApp Direct Connect */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4 font-['Space_Grotesk']">
              Instant Support
            </h4>
            <p className="text-xs text-gray-400 mb-3">
              Need immediate technical consultation or custom model parts check?
            </p>
            <a
              href={buildWhatsAppSupportUrl(settings.whatsappNumber, 'Doorstep Repair Help')}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-[#25D366]/15 transition-all w-full justify-center"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Chat on WhatsApp</span>
            </a>
            <p className="text-[11px] text-gray-500 mt-2 text-center">
              Replies typically in &lt; 5 minutes
            </p>
          </div>
        </div>

        {/* Bangalore Coverage Chips in Footer */}
        <div className="mt-12 pt-8 border-t border-[#161824]">
          <h5 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">
            Bangalore Doorstep Coverage Areas:
          </h5>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {activeAreas.map((area) => (
              <span
                key={area.id}
                className="px-2.5 py-1 rounded-md text-[11px] bg-[#12141d] border border-[#1f2333] text-gray-400 hover:text-gray-200 hover:border-[#FF5A1F]/40 transition-colors"
              >
                {area.name} ({area.pincode})
              </span>
            ))}
            <span className="px-2.5 py-1 rounded-md text-[11px] bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 text-[#FF5A1F] font-medium">
              + All across BBMP Bengaluru limits
            </span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-[#161824] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} {settings.businessName}. All rights reserved. Registered electronics repair provider in Karnataka.</p>
          
          {/* Discreet Staff & Partner Portals */}
          <div className="flex items-center gap-3 text-[11px] text-gray-500">
            <span className="text-gray-600">Staff Access:</span>
            <button
              onClick={() => onNavigate('/admin')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Admin Portal
            </button>
            <span className="text-gray-700">|</span>
            <button
              onClick={() => onNavigate('/technician')}
              className="hover:text-sky-400 transition-colors cursor-pointer"
            >
              Field Tech Login
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-400 font-medium">Verified Bangalore Doorstep</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
