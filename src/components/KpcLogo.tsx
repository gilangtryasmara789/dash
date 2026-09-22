import React, { useState } from 'react';

interface KpcLogoProps {
  className?: string;
  showSubtext?: boolean;
}

export const KpcLogo: React.FC<KpcLogoProps> = ({
  className = 'h-9 sm:h-10',
  showSubtext = true,
}) => {
  const [imageError, setImageError] = useState(false);
  const logoUrl = 'https://www.kpc.co.id/wp-content/uploads/2025/12/Logo_KPC.png';

  if (!imageError) {
    return (
      <div className={`flex items-center select-none ${className}`}>
        <img
          src={logoUrl}
          alt="PT Kaltim Prima Coal Logo"
          referrerPolicy="no-referrer"
          className="h-full w-auto max-h-11 object-contain"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // Fallback vector SVG if remote image fails to load
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <svg
        viewBox="0 0 240 70"
        className="h-full w-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform="translate(145, 2)">
          <path
            d="M 12 55 C 28 50, 48 38, 70 12 C 60 26, 52 35, 42 42 C 55 30, 72 20, 90 2 C 78 20, 68 34, 52 48 C 66 38, 80 32, 95 24 C 75 52, 45 64, 12 55 Z"
            fill="#E11D2A"
          />
        </g>
        <g fill="#111827">
          <path d="M 18 10 L 32 10 L 25 58 L 11 58 Z" />
          <path d="M 39 10 L 53 10 L 33 32 L 53 58 L 38 58 L 24 37 L 39 20 Z" />
          <path d="M 58 10 L 86 10 C 98 10, 105 16, 102 28 C 100 38, 91 44, 78 44 L 66 44 L 63 58 L 50 58 Z M 67 22 L 65 32 L 77 32 C 84 32, 88 29, 89 25 C 90 22, 87 22, 82 22 Z" />
          <path d="M 136 14 C 132 11, 125 10, 117 10 C 99 10, 89 23, 86 37 C 83 51, 93 59, 110 59 C 122 59, 131 56, 136 52 L 132 41 C 127 45, 121 47, 112 47 C 102 47, 98 42, 100 35 C 101 27, 107 22, 118 22 C 124 22, 129 24, 133 26 Z" />
        </g>
        {showSubtext && (
          <text
            x="14"
            y="68"
            fill="#374151"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
            fontSize="10.5"
            fontStyle="italic"
            fontWeight="600"
            letterSpacing="0.08em"
          >
            COAL FROM INDONESIA
          </text>
        )}
      </svg>
    </div>
  );
};
