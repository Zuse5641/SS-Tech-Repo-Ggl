import React from 'react';
import { Wrench, Shield, CheckCircle, Star } from 'lucide-react';
import { BusinessSettings } from '../../types';

interface TrustBarProps {
  settings: BusinessSettings;
}

export const TrustBar: React.FC<TrustBarProps> = ({ settings }) => {
  const metrics = [
    {
      icon: <Wrench className="w-5 h-5 text-[#FF5A1F]" />,
      value: settings.trustMetrics.repairsCompleted,
      label: 'Doorstep Repairs Done',
      subtext: 'Across all Bangalore zones'
    },
    {
      icon: <Shield className="w-5 h-5 text-emerald-400" />,
      value: settings.trustMetrics.warrantyDays,
      label: 'Genuine Warranty',
      subtext: 'Hassle-free digital claims'
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-sky-400" />,
      value: settings.trustMetrics.certifiedTechs,
      label: 'Certified Technicians',
      subtext: 'Police & skill verified'
    },
    {
      icon: <Star className="w-5 h-5 text-amber-400 fill-amber-400" />,
      value: settings.trustMetrics.avgRating,
      label: 'Customer Rating',
      subtext: 'Based on 2,400+ reviews'
    }
  ];

  return (
    <section id="trust-bar" className="bg-[#0f1118] border-y border-[#1e2233] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {metrics.map((m, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3.5"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#171a26] border border-[#272c40] flex items-center justify-center shrink-0 shadow-inner">
                {m.icon}
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-white font-['Space_Grotesk'] tracking-tight">
                  {m.value}
                </div>
                <div className="text-xs font-bold text-gray-200">{m.label}</div>
                <div className="text-[11px] text-gray-500 hidden sm:block">{m.subtext}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
