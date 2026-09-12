import React, { useState } from 'react';
import { Star, CheckCircle2, MessageSquare, Quote } from 'lucide-react';
import { CustomerReview } from '../../types';

interface ReviewsSectionProps {
  reviews: CustomerReview[];
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews }) => {
  const [filter, setFilter] = useState<'ALL' | 'PHONE' | 'LAPTOP' | 'CONSOLE'>('ALL');

  const activeReviews = reviews.filter((r) => r.active);

  const filtered = activeReviews.filter((r) => {
    if (filter === 'ALL') return true;
    if (filter === 'PHONE') return r.device.toLowerCase().includes('iphone') || r.device.toLowerCase().includes('phone') || r.device.toLowerCase().includes('galaxy');
    if (filter === 'LAPTOP') return r.device.toLowerCase().includes('macbook') || r.device.toLowerCase().includes('laptop') || r.device.toLowerCase().includes('dell');
    if (filter === 'CONSOLE') return r.device.toLowerCase().includes('playstation') || r.device.toLowerCase().includes('xbox') || r.device.toLowerCase().includes('switch');
    return true;
  });

  return (
    <section id="reviews-section" className="py-16 sm:py-20 bg-[#0d0f15] border-y border-[#1a1d2b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF5A1F] bg-[#FF5A1F]/10 px-3 py-1 rounded-full">
              CUSTOMER TESTIMONIALS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white font-['Space_Grotesk'] mt-2 tracking-tight">
              Bangalore Loves Our Doorstep Care
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Read real doorstep repair reviews from customers across Bengaluru.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-[#141724] border border-[#232738] p-1 rounded-xl">
            {(['ALL', 'PHONE', 'LAPTOP', 'CONSOLE'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  filter === cat ? 'bg-[#FF5A1F] text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {cat === 'ALL' ? 'All Reviews' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#12141e] border border-[#202436] rounded-2xl p-5 flex flex-col justify-between hover:border-[#FF5A1F]/40 transition-all duration-200"
            >
              <div>
                {/* Rating Stars & Source Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-medium text-gray-400 bg-gray-800/80 px-2 py-0.5 rounded-full border border-gray-700">
                    {rev.source}
                  </span>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed italic mb-4">
                  "{rev.reviewText}"
                </p>
              </div>

              <div className="border-t border-gray-800/80 pt-3">
                <div className="flex items-center justify-between">
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-white truncate">{rev.customerName}</h4>
                    <p className="text-[10px] text-gray-400 truncate">{rev.locality}</p>
                  </div>
                  {rev.verified && (
                    <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified</span>
                    </div>
                  )}
                </div>

                <div className="mt-2 text-[10px] text-gray-500 flex items-center justify-between">
                  <span className="truncate text-[#FF5A1F] font-medium">{rev.device} • {rev.repair}</span>
                  <span>{rev.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
