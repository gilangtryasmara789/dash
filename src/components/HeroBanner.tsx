import React from 'react';
import bannerImg from '../assets/images/mining_excavator_banner_1790078332422.jpg';

export const HeroBanner: React.FC = () => {
  return (
    <div className="relative mb-6 rounded-2xl overflow-hidden border-2 border-slate-200/90 shadow-sm bg-slate-900 group">
      {/* Signature Red Outline Corner Accent matching user's screenshot */}
      <div className="absolute top-0 left-0 w-32 sm:w-48 h-1 bg-gradient-to-r from-red-600 to-rose-500 z-20"></div>
      <div className="absolute top-0 left-0 w-1.5 h-24 sm:h-32 bg-gradient-to-b from-red-600 to-rose-500 z-20"></div>

      {/* Background Mining Image with Sunset Excavator & Dump Truck */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <img
          src={bannerImg}
          alt="Coal Mining Excavator and Dump Truck Sangatta"
          className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-102 opacity-95"
        />
        {/* Crisp Gradient Overlay for Text Readability matching screenshot */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 sm:via-white/70 to-transparent"></div>
      </div>

      {/* Banner Content */}
      <div className="relative z-10 px-6 sm:px-8 py-7 sm:py-10 max-w-xl md:max-w-2xl">
        {/* Red Location Eyebrow */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-red-600">
            SANGATTA · EAST KALIMANTAN
          </span>
        </div>

        {/* Main Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          PM · Commissioning · Fuel Expiry
        </h1>

        {/* Subtitle */}
        <p className="mt-1.5 text-xs sm:text-sm text-slate-600 font-medium">
          Light Vehicle monitoring dashboard — Coal Mining.
        </p>

        {/* Quick Highlight Tag */}
        <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500 font-medium">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/80 border border-slate-200/80 text-slate-700 font-semibold shadow-2xs">
            Wajib PM Mingguan (7 Hari)
          </span>
          <span>•</span>
          <span>Inspeksi Keselamatan KPC</span>
        </div>
      </div>
    </div>
  );
};
