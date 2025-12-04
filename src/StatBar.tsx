interface StatBarProps {
  health: number;
  meter: number;
  meterName: string;
  roundsWon: number;
  side: 'left' | 'right';
  characterName: string;
  portrait?: string;
  styleLabel?: string;
}

export default function StatBar({
  health,
  meter,
  meterName,
  roundsWon,
  side,
  characterName,
  portrait,
  styleLabel
}: StatBarProps) {
  const healthPercent = Math.max(0, Math.min(100, health));
  const meterPercent = Math.max(0, Math.min(100, meter));

  // Meter color based on fill
  const getMeterColor = () => {
    if (meterPercent >= 100) return '#fbbf24'; // Yellow/gold when full
    if (meterPercent >= 50) return '#3b82f6'; // Bright blue
    return '#1e3a8a'; // Dark blue
  };

  const containerClass = side === 'left'
    ? 'items-start text-left'
    : 'items-end text-right';

  const healthBarDirection = side === 'left'
    ? 'flex-row'
    : 'flex-row-reverse';

  return (
    <div className={`flex flex-col ${containerClass} gap-1 w-96`}>
      {/* Character Name */}
      <div className="flex items-center gap-3">
        {portrait && (
          <div className="w-14 h-14 overflow-hidden border-2 border-yellow-500 shadow-lg bg-black">
            <img src={portrait} alt={`${characterName} portrait`} className="w-full h-full object-contain" />
          </div>
        )}
        <div className="mk-text text-white text-2xl font-bold tracking-widest" style={{ fontFamily: 'Orbitron, monospace' }}>
          {characterName.toUpperCase()}
        </div>
        {styleLabel && (
          <div className="text-xs text-yellow-300 font-bold tracking-widest px-2 py-1 border border-yellow-600 bg-black/60">
            STYLE: {styleLabel}
          </div>
        )}
      </div>

      {/* Health Bar */}
      <div className={`flex ${healthBarDirection} items-center gap-2 w-full`}>
        <div className="flex-1 h-8 bg-black border-4 border-stone-600 relative overflow-hidden" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.8)' }}>
          <div
            className="h-full bg-gradient-to-r from-green-500 to-green-700 transition-all duration-200"
            style={{
              width: `${healthPercent}%`,
              transformOrigin: side === 'left' ? 'left' : 'right',
              boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3)'
            }}
          />
          {healthPercent < 20 && (
            <div className="absolute inset-0 bg-red-500 opacity-25 animate-pulse" />
          )}
        </div>

        {/* Rounds Won */}
        <div className="flex gap-1">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="w-4 h-4 transform rotate-45 border-2 border-red-600"
              style={{
                backgroundColor: i < roundsWon ? '#dc2626' : '#000',
                boxShadow: i < roundsWon ? '0 0 8px #dc2626' : 'none'
              }}
            >
              <div className="w-1 h-1 bg-red-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          ))}
        </div>
      </div>

      {/* Meter Bar */}
      <div className="w-full">
        <div className="text-xs text-gray-300 mb-0.5 uppercase tracking-widest" style={{ fontFamily: 'Teko, sans-serif', letterSpacing: '0.2em' }}>
          {meterName}
        </div>
        <div className="h-3 bg-black border-2 border-stone-700 overflow-hidden">
          <div
            className="h-full transition-all duration-200"
            style={{
              width: `${meterPercent}%`,
              backgroundColor: getMeterColor(),
              float: side === 'left' ? 'left' : 'right',
              boxShadow: meterPercent >= 100 ? '0 0 15px #fbbf24, inset 0 1px 3px rgba(255,255,255,0.4)' : 'inset 0 1px 2px rgba(255,255,255,0.2)'
            }}
          />
        </div>
      </div>
    </div>
  );
}
