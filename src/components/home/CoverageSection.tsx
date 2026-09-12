import React, { useState } from 'react';
import { MapPin, Search, CheckCircle, AlertCircle, Clock, Send } from 'lucide-react';
import { ServiceArea } from '../../types';

interface CoverageSectionProps {
  areas: ServiceArea[];
  onSelectAreaForQuote: (areaName: string) => void;
}

export const CoverageSection: React.FC<CoverageSectionProps> = ({ areas, onSelectAreaForQuote }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [outsideModalOpen, setOutsideModalOpen] = useState(false);
  const [outsidePincode, setOutsidePincode] = useState('');
  const [outsideSubmitted, setOutsideSubmitted] = useState(false);

  const filteredAreas = areas.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return a.name.toLowerCase().includes(q) || a.pincode.includes(q);
  });

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    const match = areas.find(
      (a) => (a.name.toLowerCase() === query || a.pincode === query) && a.active
    );

    if (match) {
      onSelectAreaForQuote(match.name);
    } else {
      setOutsidePincode(searchQuery);
      setOutsideModalOpen(true);
    }
  };

  return (
    <section id="coverage-section" className="py-16 sm:py-20 bg-[#0b0c10]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF5A1F] bg-[#FF5A1F]/10 px-3 py-1 rounded-full">
            BANGALORE SERVICE COVERAGE
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white font-['Space_Grotesk'] mt-3 tracking-tight">
            Doorstep Technicians Across Bengaluru
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            We service major residential societies, tech parks, and office corridors across East, West, North, and South Bangalore.
          </p>

          {/* Quick Locality / Pincode Search Bar */}
          <form onSubmit={handlePincodeCheck} className="mt-6 flex max-w-md mx-auto gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter your Bangalore locality or pincode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#151722] border border-[#272c3d] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5A1F]"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-[#FF5A1F] hover:bg-[#e04812] text-white text-xs sm:text-sm font-bold shrink-0 transition-colors"
            >
              Check Availability
            </button>
          </form>
        </div>

        {/* Coverage Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {filteredAreas.map((area) => (
            <div
              key={area.id}
              onClick={() => onSelectAreaForQuote(area.name)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer group ${
                area.active
                  ? 'bg-[#12141e] border-[#202436] hover:border-[#FF5A1F] hover:bg-[#181b28]'
                  : 'bg-[#0e1017] border-gray-900 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <MapPin className="w-4 h-4 text-[#FF5A1F] shrink-0 mt-0.5" />
                <span className="text-[10px] font-mono text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded">
                  {area.pincode}
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white mt-2 group-hover:text-[#FF5A1F] transition-colors">
                {area.name}
              </h4>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-1">
                <Clock className="w-3 h-3" />
                <span>ETA: {area.serviceEta}</span>
              </div>
              <div className="text-[10px] text-gray-500 mt-1">
                {area.serviceFee === 0 ? 'Free Doorstep Visit' : `₹${area.serviceFee} Visit Fee`}
              </div>
            </div>
          ))}
        </div>

        {/* If no locality matches search */}
        {filteredAreas.length === 0 && (
          <div className="text-center py-10 bg-[#12141e] border border-dashed border-gray-800 rounded-2xl max-w-lg mx-auto">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-sm text-gray-300 font-semibold">No direct match for "{searchQuery}"</p>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              We service all major Bangalore BBMP zones. You can leave your pincode and our team will confirm technician dispatch.
            </p>
            <button
              onClick={() => {
                setOutsidePincode(searchQuery);
                setOutsideModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#1f2334] text-white text-xs font-semibold hover:bg-gray-700"
            >
              Request Service For My Pincode
            </button>
          </div>
        )}

        {/* Outside Coverage Modal */}
        {outsideModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#151722] border border-[#2b3046] rounded-2xl p-6 max-w-md w-full animate-in zoom-in-95">
              {!outsideSubmitted ? (
                <>
                  <div className="flex items-center gap-2.5 text-amber-400 mb-3">
                    <AlertCircle className="w-6 h-6 shrink-0" />
                    <h3 className="text-base font-bold text-white">Location Outside Standard Fast-Track Area</h3>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed mb-4">
                    We don't currently have an instant 45-minute slot for this location ({outsidePincode || 'pincode'}), but you can leave your details and our Bangalore dispatch manager will contact you within 15 minutes to arrange a custom visit.
                  </p>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setOutsideSubmitted(true);
                    }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1">Your Mobile Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="10-digit mobile number"
                        className="w-full bg-[#1b1e2d] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1">Locality / Landmark</label>
                      <input
                        type="text"
                        defaultValue={outsidePincode}
                        placeholder="e.g. Attibele, Nelamangala, etc."
                        className="w-full bg-[#1b1e2d] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setOutsideModalOpen(false)}
                        className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-[#FF5A1F] hover:bg-[#e04812] text-white text-xs font-bold flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Details</span>
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-white">Details Received</h4>
                  <p className="text-xs text-gray-400 mt-1 mb-4">
                    Our Bangalore central coordinator will call or WhatsApp you shortly.
                  </p>
                  <button
                    onClick={() => {
                      setOutsideModalOpen(false);
                      setOutsideSubmitted(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-gray-800 text-white text-xs font-semibold hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
