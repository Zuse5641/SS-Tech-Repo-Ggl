import React, { useState, useEffect } from 'react';
import {
  Wrench,
  MessageCircle,
  Menu,
  X,
  ShieldCheck,
  Search,
  UserCheck,
  Briefcase,
  ChevronRight,
  PhoneCall
} from 'lucide-react';
import { buildWhatsAppQuoteUrl } from '../../utils/whatsapp';
import { trackEvent } from '../../utils/analytics';
import { BusinessSettings } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  settings: BusinessSettings;
  activeRoute: string;
  onNavigate: (route: string) => void;
  onOpenTrackModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  activeRoute,
  onNavigate,
  onOpenTrackModal
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAdminAuthenticated, isTechAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleWhatsAppClick = () => {
    trackEvent('whatsapp_clicked', { source: 'navbar' });
    const url = buildWhatsAppQuoteUrl({
      businessNumber: settings.whatsappNumber
    });
    window.open(url, '_blank');
  };

  const navLinks = [
    { label: 'Home', route: '/' },
    { label: 'Phone Repair', route: '/phone-repair' },
    { label: 'Laptop Repair', route: '/laptop-repair' },
    { label: 'Tablet Repair', route: '/tablet-repair' },
    { label: 'About', route: '/about' },
    { label: 'Contact', route: '/contact' }
  ];

  return (
    <header
      id="main-navbar"
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0f1118]/95 backdrop-blur-md border-b border-[#232738] shadow-xl py-3'
          : 'bg-[#0b0c10]/90 backdrop-blur-sm border-b border-[#1c1f2e] py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          id="nav-logo"
          onClick={() => onNavigate('/')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF5A1F] to-[#E04812] flex items-center justify-center shadow-lg shadow-[#FF5A1F]/20 group-hover:scale-105 transition-transform">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-white font-['Space_Grotesk']">
                SS CARE
              </span>
              <span className="text-xl font-bold text-[#FF5A1F]">TECH</span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium tracking-wide flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              BANGALORE DOORSTEP
            </p>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => (
            <button
              key={link.route}
              id={`nav-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => onNavigate(link.route)}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 ${
                activeRoute === link.route
                  ? 'text-[#FF5A1F] bg-[#FF5A1F]/10'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Track Repair */}
          <button
            id="nav-track-repair-btn"
            onClick={onOpenTrackModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-gray-300 hover:text-white bg-[#1a1d29] hover:bg-[#232738] border border-gray-800 transition-colors"
            title="Track your existing repair with Request ID"
          >
            <Search className="w-3.5 h-3.5 text-[#FF5A1F]" />
            <span>Track Repair</span>
          </button>

          {/* If authenticated as Admin or Tech, show quick portal jump */}
          {isAdminAuthenticated && (
            <button
              onClick={() => onNavigate('/admin')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer"
              title="Return to Central Admin Console"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Admin Portal</span>
            </button>
          )}

          {isTechAuthenticated && (
            <button
              onClick={() => onNavigate('/technician')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-500/10 border border-sky-500/30 text-sky-400 hover:bg-sky-500/20 transition-all cursor-pointer"
              title="Return to Field Technician Portal"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Tech Portal</span>
            </button>
          )}

          {/* WhatsApp CTA Button */}
          <button
            id="nav-whatsapp-cta"
            onClick={handleWhatsAppClick}
            className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-[#25D366]/20 transition-all hover:scale-102 active:scale-98"
          >
            <MessageCircle className="w-4 h-4 fill-white text-[#25D366]" />
            <span className="hidden sm:inline">WhatsApp Us</span>
            <span className="sm:hidden">Chat</span>
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            id="nav-mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/5 border border-gray-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-menu"
          className="lg:hidden bg-[#10121a]/98 backdrop-blur-2xl border-b border-[#232738] px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2 shadow-2xl"
        >
          {navLinks.map((link) => (
            <button
              key={link.route}
              onClick={() => {
                onNavigate(link.route);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold min-h-[44px] ${
                activeRoute === link.route
                  ? 'text-[#FF5A1F] bg-[#FF5A1F]/15 font-bold'
                  : 'text-gray-300 hover:bg-white/5 active:bg-white/10'
              }`}
            >
              <span>{link.label}</span>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
          ))}

          {/* Quick Device Shortcuts on Mobile */}
          <div className="pt-2">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider px-2 mb-1.5">
              Quick Doorstep Repairs
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { name: 'Phones', route: '/phone-repair' },
                { name: 'Laptops', route: '/laptop-repair' },
                { name: 'iPads/Tablets', route: '/tablet-repair' },
                { name: 'Consoles/PS5', route: '/gaming-console-repair' }
              ].map((cat) => (
                <button
                  key={cat.route}
                  onClick={() => {
                    onNavigate(cat.route);
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-2 rounded-lg bg-[#161824] hover:bg-[#1f2233] text-left text-xs text-gray-300 font-medium flex items-center justify-between"
                >
                  <span>{cat.name}</span>
                  <ChevronRight className="w-3 h-3 text-gray-500" />
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-800 space-y-2">
            <button
              onClick={() => {
                onOpenTrackModal();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1c202d] text-white text-sm font-semibold border border-gray-700 min-h-[44px] active:scale-98 transition-transform"
            >
              <Search className="w-4 h-4 text-[#FF5A1F]" />
              <span>Track Repair Status</span>
            </button>

            <a
              href={`tel:${settings.phone}`}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#161822] text-gray-300 text-sm font-medium border border-gray-800 min-h-[44px]"
            >
              <PhoneCall className="w-4 h-4 text-[#FF5A1F]" />
              <span>Call Us: {settings.phone}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
