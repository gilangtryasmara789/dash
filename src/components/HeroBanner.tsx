import React, { useState } from 'react';
import fallbackLiebherr from '../assets/images/liebherr_logo.jpg';

const LIEBHERR_IMAGE_URL =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQh2p_o_FAibBMTRrotexMbDacDmQH5staH3I3SlwG9yw&s=10';

export const HeroBanner: React.FC = () => {
  const [bgSrc, setBgSrc] = useState(LIEBHERR_IMAGE_URL);

  return (
    <div className="relative mb-6 rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-white group min-h-[170px] sm:min-h-[185px]">
      {/* Signature Red Outline Corner Accent */}
      <div className="absolute top-0 left-0 w-32 sm:w-48 h-1 bg-gradient-to-r from-red-600 to-rose-500 z-30"></div>
      <div className="absolute top-0 left-0 w-1.5 h-24 sm:h-32 bg-gradient-to-b from-red-600 to-rose-500 z-30"></div>

      {/* Ambient background atmosphere derived from the photo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <img
          src={bgSrc}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center filter blur-xl scale-110 opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent"></div>
      </div>

      {/* Main Photo Showcase - Locked to Full Cover (Ukuran Penuh) */}
      <div className="absolute right-0 top-0 bottom-0 w-full sm:w-3/5 md:w-1/2 lg:w-5/12 h-full z-10 flex items-center justify-end overflow-hidden pointer-events-none">
        {/* Soft edge gradient to blend seamlessly into left content */}
        <div className="absolute inset-y-0 left-0 w-24 sm:w-36 bg-gradient-to-r from-white via-white/70 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-white/20 z-10"></div>

        <img
          src={bgSrc}
          alt="Liebherr Mining Equipment"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center transform transition-all duration-500 group-hover:scale-102 drop-shadow-xs"
          onError={() => {
            if (bgSrc !== fallbackLiebherr) {
              setBgSrc(fallbackLiebherr);
            }
          }}
        />
      </div>

      {/* Banner Content */}
      <div className="relative z-20 px-6 sm:px-8 py-5 sm:py-7 max-w-xl md:max-w-2xl">
        {/* Red Location Eyebrow */}
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-red-600">
            SANGATTA · EAST KALIMANTAN
          </span>
        </div>

        {/* Main Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          PM · Commissioning · Fuel Expiry
        </h1>

        {/* Subtitle */}
        <p className="mt-1 text-xs sm:text-sm text-slate-600 font-medium max-w-lg">
          Light Vehicle operations & regulatory compliance dashboard — Coal Mining.
        </p>

        {/* Quick Highlight Tag */}
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 font-medium flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-100/80 border border-slate-200/80 text-slate-700 font-semibold">
            Light Vehicle Fleet
          </span>
          <span className="text-slate-300">•</span>
          <span className="font-semibold text-slate-700">KPC Mine Safety Compliance</span>
        </div>
      </div>
    </div>
  );
};
