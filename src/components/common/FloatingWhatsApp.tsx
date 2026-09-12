import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { buildWhatsAppQuoteUrl } from '../../utils/whatsapp';
import { trackEvent } from '../../utils/analytics';
import { BusinessSettings } from '../../types';

interface FloatingWhatsAppProps {
  settings: BusinessSettings;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ settings }) => {
  const [tooltipDismissed, setTooltipDismissed] = useState(false);

  const handleClick = () => {
    trackEvent('whatsapp_clicked', { source: 'floating_widget' });
    const url = buildWhatsAppQuoteUrl({
      businessNumber: settings.whatsappNumber
    });
    window.open(url, '_blank');
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-30 md:z-50 flex items-end flex-col gap-2 select-none">
      {/* Tooltip bubble - hidden on very small screens to avoid obstructing page content */}
      {!tooltipDismissed && (
        <div className="hidden sm:block bg-[#151824] border border-[#2b3147] text-white p-3 rounded-2xl shadow-2xl text-xs max-w-xs relative animate-in fade-in slide-in-from-bottom-2 duration-300">
          <button
            onClick={() => setTooltipDismissed(true)}
            className="absolute -top-1.5 -right-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full p-0.5"
            title="Dismiss"
          >
            <X className="w-3 h-3" />
          </button>
          <p className="font-bold text-[#25D366] flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-ping" />
            <span>Bangalore Support Online</span>
          </p>
          <p className="text-gray-300 leading-snug">
            Need an instant quote or technician ETA? Chat with us on WhatsApp!
          </p>
        </div>
      )}

      {/* Main floating button */}
      <button
        id="floating-whatsapp-btn"
        onClick={handleClick}
        aria-label="Chat on WhatsApp"
        className="w-14 h-14 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center shadow-xl shadow-[#25D366]/30 hover:scale-105 active:scale-95 transition-all duration-200 group cursor-pointer"
      >
        <MessageCircle className="w-7 h-7 fill-white text-[#25D366] group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
};
