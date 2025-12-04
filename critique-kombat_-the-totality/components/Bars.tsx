
import React from 'react';
import { COMBO_TEXT } from '../constants';

interface BarProps {
  value: number;
  max: number;
  label: string;
  side: 'left' | 'right';
  roundsWon: number;
  meterValue?: number;
  meterName?: string;
  comboCount?: number;
  comboTitles?: string[];
}

export const StatBar: React.FC<BarProps> = ({ 
    value, max, label, side, roundsWon, 
    meterValue = 0, meterName = "METER", 
    comboCount = 0, comboTitles = [] 
}) => {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));
  
  // Gothic colors
  const barColor = "linear-gradient(180deg, #22c55e 0%, #15803d 50%, #14532d 100%)"; 
  const damageColor = "#450a0a"; 

  // Get dynamic title or fallback
  const currentComboTitle = comboCount > 0 
    ? (comboTitles[Math.min(comboCount - 1, comboTitles.length - 1)] || COMBO_TEXT[Math.min(comboCount, COMBO_TEXT.length - 1)] || "HIT")
    : "";

  return (
    <div className={`flex flex-col w-full relative ${side === 'right' ? 'items-end' : 'items-start'}`}>
      
      {/* Name Plate - Stone Style */}
      <div className={`relative mb-1 z-10 w-2/3 ${side === 'right' && 'flex justify-end'}`}>
          <div className="bg-stone-800 text-stone-200 border-2 border-stone-600 px-3 py-1 font-serif tracking-widest uppercase text-sm shadow-md flex items-center gap-2 transform skew-x-[-10deg]">
               <div className="w-2 h-2 bg-yellow-600 rotate-45"></div>
               {label}
               <div className="w-2 h-2 bg-yellow-600 rotate-45"></div>
          </div>
      </div>

      {/* Health Bar Container (Ornate) */}
      <div className={`
        w-full h-8 relative border-y-4 border-stone-700 bg-stone-900 shadow-lg
        ${side === 'left' ? 'rounded-l-sm' : 'rounded-r-sm'}
      `}
      >
        {/* Decorative Ends */}
        <div className={`absolute top-0 bottom-0 w-8 bg-stone-600 z-20 flex items-center justify-center border-r border-stone-500
            ${side === 'left' ? 'left-[-8px] rounded-l-lg' : 'right-[-8px] rounded-r-lg'}
        `}>
             <div className="w-4 h-4 rounded-full bg-red-900 border border-red-500 shadow-[0_0_10px_red]"></div>
        </div>

        {/* Liquid */}
        <div className="absolute inset-0 bg-red-950/80"></div>
        <div 
          className="h-full relative transition-all duration-200 ease-out box-border border-b-2 border-green-300/30"
          style={{ 
              width: `${percentage}%`, 
              float: side === 'left' ? 'right' : 'left', 
              background: barColor,
              boxShadow: 'inset 0 2px 5px rgba(255,255,255,0.2)'
          }}
        />
      </div>

      {/* Meter Bar */}
      <div className={`w-3/4 h-3 mt-1 bg-black border border-stone-500 relative overflow-hidden flex ${side === 'left' ? 'flex-row' : 'flex-row-reverse'}`}>
           <div className={`h-full transition-all duration-300 ${meterValue >= 100 ? 'bg-yellow-500 animate-pulse' : meterValue >= 50 ? 'bg-blue-500' : 'bg-blue-900'}`} 
                style={{ width: `${meterValue}%` }}>
           </div>
           <div className="absolute inset-0 flex items-center justify-center">
               <span className="text-[8px] text-white font-bold tracking-[0.2em] opacity-80">{meterName}</span>
           </div>
      </div>

      {/* Rounds - Dragon Gems */}
      <div className={`flex gap-1 mt-1 ${side === 'right' ? 'flex-row-reverse' : 'flex-row'}`}>
          {[...Array(2)].map((_, i) => (
              <div key={i} className={`
                 w-6 h-6 rotate-45 border-2 border-stone-500 shadow-lg flex items-center justify-center
                 ${i < roundsWon ? 'bg-red-800' : 'bg-black'}
              `}>
                  {i < roundsWon && <div className="w-2 h-2 bg-red-400 rounded-full blur-[1px]"></div>}
              </div>
          ))}
      </div>
      
      {/* Combo Counter */}
      {comboCount > 1 && (
          <div className={`absolute top-24 ${side === 'left' ? 'right-[-50px]' : 'left-[-50px]'} z-50 text-center pointer-events-none`}>
               <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_4px_0_#000] italic font-serif animate-bounce">
                   {comboCount} 
               </div>
               <div className="text-xl font-bold text-stone-200 bg-red-900/90 px-3 py-1 -skew-x-12 border border-red-500 shadow-lg whitespace-nowrap">
                   {currentComboTitle}
               </div>
          </div>
      )}
    </div>
  );
};
