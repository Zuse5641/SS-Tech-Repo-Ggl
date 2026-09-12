import React from 'react';
import { Home, Wrench, Sparkles, Search, MessageCircle, PhoneCall } from 'lucide-react';
import { BusinessSettings } from '../../types';
import { buildWhatsAppQuoteUrl } from '../../utils/whatsapp';
import { trackEvent } from '../../utils/analytics';

interface MobileBottomNavProps {
  settings: BusinessSettings;
  activeRoute: string;
  onNavigate: (route: string) => void;
  onOpenTrackModal: () => void;
  onOpenQuoteWizard?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  settings,
  activeRoute,
  onNavigate,
  onOpenTrackModal,
  onOpenQuoteWizard
}) => {
  const handleWhatsApp = () => {
    trackEvent('whatsapp_clicked', { source: 'mobile_bottom_dock' });
    const url = buildWhatsAppQuoteUrl({
      businessNumber: settings.whatsappNumber
    });
    window.open(url, '_blank');
  };

  const handleBookClick = () => {
    trackEvent('cta_clicked', { action: 'mobile_bottom_book_now' });
    if (activeRoute !== '/') {
      onNavigate('/');
      setTimeout(() => {
        const wizard = document.getElementById('hero-quote-wizard-card');
        if (wizard) {
          wizard.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    } else {
      const wizard = document.getElementById('hero-quote-wizard-card');
      if (wizard) {
        wizard.scrollIntoView({ behavior: 'smooth' });
      } else if (onOpenQuoteWizard) {
        onOpenQuoteWizard();
      }
    }
  };

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#0d0f17]/95 backdrop-blur-xl border-t border-[#222638] px-2 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.5)] transition-transform select-none"
    >
      <div className="grid grid-cols-5 items-center max-w-md mx-auto">
        {/* 1. Home */}
        <button
          onClick={() => onNavigate('/')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors cursor-pointer min-h-[44px] ${
            activeRoute === '/' ? 'text-[#FF5A1F]' : 'text-gray-400 hover:text-gray-200'
          }`}
          aria-label="Home"
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-semibold tracking-tight">Home</span>
          {activeRoute === '/' && <span className="w-1 h-1 rounded-full bg-[#FF5A1F] mt-0.5" />}
        </button>

        {/* 2. Track Repair */}
        <button
          onClick={onOpenTrackModal}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors cursor-pointer min-h-[44px] ${
            activeRoute === '/track' ? 'text-[#FF5A1F]' : 'text-gray-400 hover:text-gray-200'
          }`}
          aria-label="Track Repair Status"
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-semibold tracking-tight">Track</span>
          {activeRoute === '/track' && <span className="w-1 h-1 rounded-full bg-[#FF5A1F] mt-0.5" />}
        </button>

        {/* 3. Center CTA: Book Doorstep Visit */}
        <div className="flex items-center justify-center -mt-3">
          <button
            onClick={handleBookClick}
            className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF5A1F] to-[#FF7A45] text-white shadow-lg shadow-[#FF5A1F]/35 active:scale-95 transition-transform cursor-pointer border border-[#FF8A55]/40"
            aria-label="Book Doorstep Repair"
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[8px] font-black uppercase tracking-tighter mt-0.5">Book</span>
          </button>
        </div>

        {/* 4. Call Dispatch */}
        <a
          href={`tel:${settings.phone}`}
          className="flex flex-col items-center justify-center py-1 rounded-xl text-gray-400 hover:text-gray-200 transition-colors cursor-pointer min-h-[44px]"
          aria-label="Call Customer Support"
        >
          <PhoneCall className="w-5 h-5 mb-0.5 text-sky-400" />
          <span className="text-[10px] font-semibold tracking-tight">Call</span>
        </a>

        {/* 5. WhatsApp */}
        <button
          onClick={handleWhatsApp}
          className="flex flex-col items-center justify-center py-1 rounded-xl text-gray-400 hover:text-gray-200 transition-colors cursor-pointer min-h-[44px]"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="w-5 h-5 mb-0.5 text-[#25D366]" />
          <span className="text-[10px] font-semibold tracking-tight">WhatsApp</span>
        </button>
      </div>
    </nav>
  );
};
