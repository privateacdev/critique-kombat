import { useEffect, useState } from 'react';

interface DamageNumberProps {
  damage: number;
  x: number;
  y: number;
  id: string;
  isBlocked: boolean;
  onComplete: (id: string) => void;
}

export default function DamageNumber({ damage, x, y, id, isBlocked, onComplete }: DamageNumberProps) {
  const [offset, setOffset] = useState(0);
  const [opacity, setOpacity] = useState(1);
  // Add random offset to prevent stacking
  const [randomOffsetX] = useState(() => (Math.random() - 0.5) * 60); // -30 to +30 pixels
  const [randomOffsetY] = useState(() => (Math.random() - 0.5) * 40); // -20 to +20 pixels

  useEffect(() => {
    const floatInterval = setInterval(() => {
      setOffset(prev => prev + 4); // Float up even faster
      setOpacity(prev => {
        const newOpacity = prev - 0.12; // Fade out much faster
        if (newOpacity <= 0) {
          onComplete(id);
          return 0;
        }
        return newOpacity;
      });
    }, 20); // Update even more frequently

    return () => clearInterval(floatInterval);
  }, [id, onComplete]);

  const displayDamage = Math.round(damage);
  const color = isBlocked ? '#60a5fa' : displayDamage >= 15 ? '#ef4444' : '#fbbf24';
  const size = displayDamage >= 15 ? 'text-3xl' : displayDamage >= 10 ? 'text-2xl' : 'text-xl'; // Smaller sizes

  return (
    <div
      className={`absolute pointer-events-none z-30 font-black ${size}`}
      style={{
        left: `${x + randomOffsetX}px`,
        bottom: `${y + offset + randomOffsetY}px`,
        color: color,
        opacity: opacity,
        fontFamily: 'Orbitron, monospace',
        textShadow: `
          0 0 8px ${color},
          2px 2px 0 #000,
          -1px -1px 0 #000
        `,
        transform: 'translate(-50%, -50%)',
        WebkitTextStroke: '1px #000',
        letterSpacing: '0.05em'
      }}
    >
      {isBlocked && <span style={{ fontSize: '0.6em' }}>BLOCKED! </span>}
      {displayDamage}
    </div>
  );
}
