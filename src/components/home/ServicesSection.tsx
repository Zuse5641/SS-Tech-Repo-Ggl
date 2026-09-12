import React from 'react';
import {
  Smartphone,
  Laptop,
  Tablet,
  Monitor,
  Gamepad2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { DeviceCategory } from '../../types';

interface ServicesSectionProps {
  onSelectService: (category: DeviceCategory) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onSelectService }) => {
  const services: {
    category: DeviceCategory;
    title: string;
    description: string;
    icon: React.ReactNode;
    startingPrice: string;
    commonFixes: string[];
    warranty: string;
    slug: string;
  }[] = [
    {
      category: 'phones',
      title: 'Phone Repair',
      description: 'Display screen, battery replacement, charging port, and motherboard chip-level repair.',
      icon: <Smartphone className="w-6 h-6 text-[#FF5A1F]" />,
      startingPrice: '₹1,299',
      commonFixes: ['Broken OLED / LCD Glass', 'Battery Degradation', 'Charging Flex / Mic', 'Water Damage'],
      warranty: 'Up to 6 Months',
      slug: '/phone-repair'
    },
    {
      category: 'laptops',
      title: 'Laptop Repair',
      description: 'MacBook & Windows laptop panel replacement, keyboard swap, thermal paste, and SSD upgrades.',
      icon: <Laptop className="w-6 h-6 text-sky-400" />,
      startingPrice: '₹1,499',
      commonFixes: ['Cracked FHD/Retina Screens', 'Battery Replacement', 'Hinge Fabrication', 'RAM / SSD Upgrade'],
      warranty: 'Up to 6 Months',
      slug: '/laptop-repair'
    },
    {
      category: 'tablets',
      title: 'Tablet & iPad Repair',
      description: 'Precision digitizer bonding, iPad battery replacement, logic board diagnostics.',
      icon: <Tablet className="w-6 h-6 text-emerald-400" />,
      startingPrice: '₹2,299',
      commonFixes: ['iPad Digitizer Glass', 'Battery Draining', 'Charging Port Soldering', 'Housing Bent Fix'],
      warranty: 'Up to 6 Months',
      slug: '/tablet-repair'
    },
    {
      category: 'desktops',
      title: 'Desktop & PC Repair',
      description: 'Custom gaming PCs, iMacs, workstation diagnostics, SMPS replacement, and OS installation.',
      icon: <Monitor className="w-6 h-6 text-amber-400" />,
      startingPrice: '₹799',
      commonFixes: ['No Display / SMPS Failure', 'GPU Diagnostic & Thermal', 'Deep Fan Cleaning', 'Clean OS / Anti-virus'],
      warranty: '3 Months',
      slug: '/desktop-repair'
    },
    {
      category: 'consoles',
      title: 'Gaming Console Repair',
      description: 'Sony PlayStation 5 / 4 & Xbox Series X HDMI port soldering, stick drift repair, and liquid metal.',
      icon: <Gamepad2 className="w-6 h-6 text-purple-400" />,
      startingPrice: '₹999',
      commonFixes: ['PS5 Torn HDMI Micro-solder', 'DualSense Stick Drift', 'Overheating Liquid Metal', 'PSU / Disc Drive'],
      warranty: '3 Months',
      slug: '/gaming-console-repair'
    }
  ];

  return (
    <section id="services-section" className="py-16 sm:py-20 bg-[#0b0c10]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF5A1F] bg-[#FF5A1F]/10 px-3 py-1 rounded-full">
            WHAT WE FIX
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white font-['Space_Grotesk'] mt-3 tracking-tight">
            Every Device, At Your Door
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            No need to navigate Bangalore traffic or leave your device behind. Our technicians fix electronics right in your living room or conference cabin.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc) => (
            <div
              key={svc.category}
              id={`service-card-${svc.category}`}
              className="bg-[#12141d] border border-[#212536] hover:border-[#FF5A1F]/40 rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#FF5A1F]/5 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#1a1d29] border border-[#2c3144] flex items-center justify-center group-hover:scale-105 transition-transform">
                    {svc.icon}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-500 uppercase block font-medium">Starts From</span>
                    <span className="text-base font-black text-[#FF5A1F]">{svc.startingPrice}*</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 font-['Space_Grotesk']">
                  {svc.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  {svc.description}
                </p>

                {/* Common Fixes bullet list */}
                <div className="space-y-1.5 border-t border-gray-800/80 pt-3 mb-4">
                  {svc.commonFixes.map((fix, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-gray-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#FF5A1F] shrink-0" />
                      <span className="truncate">{fix}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] text-gray-400 mb-4 pt-2 border-t border-gray-800/60">
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {svc.warranty} Warranty
                  </span>
                  <span>Doorstep Visit Available</span>
                </div>

                <button
                  id={`btn-quote-${svc.category}`}
                  onClick={() => onSelectService(svc.category)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#1a1d2b] hover:bg-[#FF5A1F] text-white text-xs sm:text-sm font-bold border border-gray-700 hover:border-[#FF5A1F] flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Book {svc.title}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-500 mt-8">
          *Starting prices shown. Final price is confirmed after technician diagnosis before beginning work.
        </p>
      </div>
    </section>
  );
};
