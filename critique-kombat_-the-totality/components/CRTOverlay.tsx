
import React from 'react';

export const CRTOverlay: React.FC = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 h-full w-full overflow-hidden select-none">
      {/* Scanlines */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))",
          backgroundSize: "100% 2px, 3px 100%"
        }}
      />
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />
      
      {/* PS2 Fuzz: Slight Blur & Contrast Bump */}
      <div className="absolute inset-0 backdrop-blur-[0.5px] opacity-100 pointer-events-none mix-blend-normal" style={{ backdropFilter: 'blur(0.8px) contrast(1.1)' }} />
    </div>
  );
};
