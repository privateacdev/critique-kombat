import { useEffect, useState } from 'react';

interface HitEffectProps {
  x: number;
  y: number;
  type: 'blood' | 'spark' | 'block';
  id: string;
  onComplete: (id: string) => void;
}

export default function HitEffect({ x, y, type, id, onComplete }: HitEffectProps) {
  const [opacity, setOpacity] = useState(1);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const fadeInterval = setInterval(() => {
      setOpacity(prev => {
        const newOpacity = prev - 0.15; // Fade faster
        if (newOpacity <= 0) {
          onComplete(id);
          return 0;
        }
        return newOpacity;
      });
      setScale(prev => prev + 0.08); // Expand outward
    }, 25);

    return () => clearInterval(fadeInterval);
  }, [id, onComplete]);

  const renderEffect = () => {
    if (type === 'blood') {
      // MK-style blood splatter - chunky red pixels spreading outward
      return (
        <div className="relative w-20 h-20" style={{ transform: `scale(${scale})` }}>
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30) * Math.PI / 180;
            const distance = 8 + (i % 3) * 6;
            const offsetX = Math.cos(angle) * distance;
            const offsetY = Math.sin(angle) * distance;
            const size = i % 2 === 0 ? 6 : 4;

            return (
              <div
                key={i}
                className="absolute"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: '50%',
                  top: '50%',
                  transform: `translate(${offsetX}px, ${offsetY}px)`,
                  backgroundColor: i % 3 === 0 ? '#dc2626' : '#991b1b',
                  opacity: opacity,
                  imageRendering: 'pixelated',
                  boxShadow: `0 0 4px rgba(220, 38, 38, ${opacity * 0.8})`,
                }}
              />
            );
          })}
        </div>
      );
    } else if (type === 'spark') {
      // MK-style impact sparks - bright white/yellow pixels
      return (
        <div className="relative w-24 h-24" style={{ transform: `scale(${scale})` }}>
          {[...Array(8)].map((_, i) => {
            const angle = (i * 45) * Math.PI / 180;
            const distance = 12 + (i % 2) * 8;
            const offsetX = Math.cos(angle) * distance;
            const offsetY = Math.sin(angle) * distance;
            const isYellow = i % 2 === 0;

            return (
              <div
                key={i}
                className="absolute"
                style={{
                  width: '8px',
                  height: '8px',
                  left: '50%',
                  top: '50%',
                  transform: `translate(${offsetX}px, ${offsetY}px)`,
                  backgroundColor: isYellow ? '#fbbf24' : '#fff',
                  opacity: opacity,
                  imageRendering: 'pixelated',
                  boxShadow: isYellow
                    ? `0 0 8px rgba(251, 191, 36, ${opacity}), 0 0 4px #fff`
                    : `0 0 8px rgba(255, 255, 255, ${opacity})`,
                }}
              />
            );
          })}
        </div>
      );
    } else if (type === 'block') {
      // MK-style block effect - white/cyan flash burst
      return (
        <div className="relative w-28 h-28" style={{ transform: `scale(${scale})` }}>
          {/* Center flash */}
          <div
            className="absolute"
            style={{
              width: '16px',
              height: '16px',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: '#fff',
              opacity: opacity * 1.2,
              boxShadow: `0 0 16px rgba(255, 255, 255, ${opacity}), 0 0 8px rgba(96, 165, 250, ${opacity})`,
              imageRendering: 'pixelated',
            }}
          />
          {/* Radiating lines */}
          {[...Array(8)].map((_, i) => {
            const angle = (i * 45) * Math.PI / 180;
            const distance = 14;
            const offsetX = Math.cos(angle) * distance;
            const offsetY = Math.sin(angle) * distance;
            const isHorizontal = i % 2 === 0;

            return (
              <div
                key={i}
                className="absolute"
                style={{
                  width: isHorizontal ? '12px' : '6px',
                  height: isHorizontal ? '6px' : '12px',
                  left: '50%',
                  top: '50%',
                  transform: `translate(${offsetX}px, ${offsetY}px) translate(-50%, -50%)`,
                  backgroundColor: i % 3 === 0 ? '#60a5fa' : '#fff',
                  opacity: opacity,
                  imageRendering: 'pixelated',
                  boxShadow: `0 0 6px rgba(255, 255, 255, ${opacity * 0.6})`,
                }}
              />
            );
          })}
        </div>
      );
    }
  };

  return (
    <div
      className="absolute pointer-events-none z-20"
      style={{
        left: `${x}px`,
        bottom: `${y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {renderEffect()}
    </div>
  );
}
