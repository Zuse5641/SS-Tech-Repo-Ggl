import React from 'react';
import { Smartphone, CheckCircle, ShieldCheck, ArrowRight } from 'lucide-react';

interface ProcessSectionProps {
  onStartQuote: () => void;
}

export const ProcessSection: React.FC<ProcessSectionProps> = ({ onStartQuote }) => {
  const steps = [
    {
      num: '01',
      title: 'Select Device & Issue',
      description: 'Choose your phone, laptop, or console and specify the repair needed via our 60-second quote selector.',
      icon: <Smartphone className="w-6 h-6 text-[#FF5A1F]" />
    },
    {
      num: '02',
      title: 'Transparent Price Confirmation',
      description: 'See estimated starting pricing upfront. Technician reviews availability and confirms your preferred doorstep slot.',
      icon: <CheckCircle className="w-6 h-6 text-amber-400" />
    },
    {
      num: '03',
      title: 'Technician Visits & Repairs',
      description: 'Our certified engineer arrives with anti-static mats and parts. Device is fixed in front of you with up to 6 months warranty.',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />
    }
  ];

  return (
    <section id="process-section" className="py-16 sm:py-20 bg-[#0d0f15] border-y border-[#1a1d2b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF5A1F] bg-[#FF5A1F]/10 px-3 py-1 rounded-full">
            HOW IT WORKS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white font-['Space_Grotesk'] mt-3 tracking-tight">
            Doorstep Electronics Repair Made Simple
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            Experience zero-hassle repairs without stepping out of your Bangalore home or office.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
          {steps.map((step, idx) => (
            <div
              key={step.num}
              className="bg-[#13151f] border border-[#222638] rounded-2xl p-6 relative group hover:border-[#FF5A1F]/50 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#1b1e2c] border border-[#2a2f44] flex items-center justify-center">
                  {step.icon}
                </div>
                <span className="text-3xl font-black text-gray-700 font-['Space_Grotesk'] group-hover:text-[#FF5A1F]/30 transition-colors">
                  {step.num}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2 font-['Space_Grotesk']">
                {step.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <button
            onClick={onStartQuote}
            className="inline-flex items-center gap-2 bg-[#FF5A1F] hover:bg-[#e04812] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl shadow-[#FF5A1F]/20 transition-all"
          >
            <span>Start Your Repair Request</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
