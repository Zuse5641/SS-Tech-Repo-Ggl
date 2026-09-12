import React, { useState, useEffect } from 'react';
import { Sparkles, Gift, ArrowRight, X, Clock, ShieldCheck } from 'lucide-react';
import { DeviceCategory } from '../../types';

interface TopHookBannerProps {
  onClaimClick: (category?: DeviceCategory) => void;
}

const DEVICES: { cat: DeviceCategory; label: string }[] = [
  { cat: 'phones', label: 'Smartphones & iPhones' },
  { cat: 'laptops', label: 'Laptops & MacBooks' },
  { cat: 'tablets', label: 'iPads & Tablets' },
  { cat: 'desktops', label: 'Custom PCs & Desktops' },
  { cat: 'consoles', label: 'PS5 & Gaming Consoles' }
];

export const TopHookBanner: React.FC<TopHookBannerProps> = ({ onClaimClick }) => {
  const [deviceIndex, setDeviceIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  // Auto-cycle through device types every 4 seconds to emphasize dynamism
  useEffect(() => {
    const timer = setInterval(() => {
      setDeviceIndex((prev) => (prev + 1) % DEVICES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  if (isDismissed) return null;

  const currentDevice = DEVICES[deviceIndex];

  return (
    <div
      id="top-hook-banner"
      className="bg-gradient-to-r from-[#171322] via-[#21172a] to-[#1a131a] border-b border-[#3b2342]/60 text-white text-xs py-2 px-2.5 sm:px-3 relative z-40"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
        {/* Left: Dynamic Announcement Hook */}
        <div
          onClick={() => onClaimClick(currentDevice.cat)}
          className="flex items-center gap-1.5 sm:gap-2 overflow-hidden flex-1 cursor-pointer sm:cursor-default"
        >
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FF5A1F] text-white text-[9px] sm:text-[10px] font-black uppercase tracking-wider shrink-0 shadow-sm animate-pulse">
            <Gift className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span>₹0 DIAGNOSTIC</span>
          </span>

          <p className="truncate text-[11px] sm:text-xs text-gray-200">
            <span className="font-bold text-white">Free </span>
            <span
              key={currentDevice.cat}
              className="font-black text-amber-300 underline decoration-[#FF5A1F] underline-offset-2 transition-all duration-300 inline-block animate-in fade-in"
            >
              {currentDevice.label}
            </span>
            <span className="font-bold text-white"> Consultation & Check-up Today</span>
            <span className="hidden md:inline text-gray-400"> (Zero obligation doorstep visit across Bangalore)</span>
          </p>
        </div>

        {/* Right: Quick Action Button & Dismiss */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => onClaimClick(currentDevice.cat)}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-gradient-to-r from-[#FF5A1F] to-[#e04812] hover:brightness-110 text-white text-[10px] sm:text-[11px] font-extrabold shadow-md shadow-[#FF5A1F]/30 transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <span className="hidden sm:inline">Claim Free Check-up</span>
            <span className="sm:hidden">Claim Free</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            aria-label="Dismiss banner"
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
