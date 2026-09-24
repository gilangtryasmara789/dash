import React, { useState } from 'react';
import fallbackLiebherr from '../assets/images/liebherr_logo.jpg';

interface LiebherrLogoProps {
  className?: string;
  src?: string;
}

export const LiebherrLogo: React.FC<LiebherrLogoProps> = ({
  className = 'h-8 sm:h-9',
  src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQh2p_o_FAibBMTRrotexMbDacDmQH5staH3I3SlwG9yw&s=10',
}) => {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <div className={`flex items-center select-none ${className}`}>
      <img
        src={imgSrc}
        alt="Liebherr Mining Equipment Logo"
        referrerPolicy="no-referrer"
        className="h-full w-auto max-h-10 object-contain"
        onError={() => {
          if (imgSrc !== fallbackLiebherr) {
            setImgSrc(fallbackLiebherr);
          }
        }}
      />
    </div>
  );
};
