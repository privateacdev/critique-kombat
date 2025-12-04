import { useEffect, useState, memo } from 'react';
import audioManager from './audioManager';

type FatalityPhase = 'cast' | 'critique' | 'explosion' | 'reify';

interface FatalityProps {
  victimId: string;
  attackerId: string;
  onComplete: () => void;
}

// Character-specific fatality data
const FATALITY_DATA: Record<string, {
  projectile: string;
  critiqueText: string;
  finalMessage: string;
  finalImage: string;
}> = {
  khayati: {
    projectile: '/assets/liukang/sprites/special/book-sprites.png',
    critiqueText: 'THE STUDENT IS THE MOST UNIVERSALLY DESPISED CREATURE IN FRANCE. HE TAKES HIS TRIVIALITIES AS REVOLUTIONARY ACTS.',
    finalMessage: 'IMPOVERISHED BY STUDENT LIFE',
    finalImage: '' // No cabinet for this fatality
  },
  bureaucrat: {
    projectile: '/assets/props/finalities/bureaucrat-finality-paperwork.png',
    critiqueText: 'ALL FORMS ARE REQUISITE. ALL PROCEDURES MUST BE FOLLOWED. THE SYSTEM IS ETERNAL. RESISTANCE IS PROCEDURALLY INVALID.',
    finalMessage: 'PROCESSED TO DEATH',
    finalImage: '/assets/props/finalities/bureaucrat-finality-paperwork.png'
  },
  professor: {
    projectile: '/assets/props/finalities/professor-finality-paper.png',
    critiqueText: 'YOUR METHODOLOGY IS FLAWED. YOUR CITATIONS ARE INSUFFICIENT. YOUR THEORY IS DERIVATIVE. YOUR PRAXIS IS NON-EXISTENT.',
    finalMessage: 'FAILED TO PUBLISH: PERISHED',
    finalImage: '/assets/props/finalities/professor-finality-paper.png'
  },
  maoist: {
    projectile: '/assets/props/finalities/little-red-book.png',
    critiqueText: 'INDIVIDUALISM MUST BE DESTROYED. THE PARTY LINE IS ABSOLUTE. SELF-CRITICISM IS INSUFFICIENT. THE GREAT LEAP CONTINUES.',
    finalMessage: 'REEDUCATED PERMANENTLY',
    finalImage: '/assets/props/finalities/little-red-book.png'
  },
  debord: {
    projectile: '/assets/props/finalities/film-strip-finality.png',
    critiqueText: 'EVERYTHING THAT WAS DIRECTLY LIVED HAS RECEDED INTO A REPRESENTATION. THE SPECTACLE IS NOT A COLLECTION OF IMAGES BUT A SOCIAL RELATION.',
    finalMessage: 'CONSUMED BY THE SPECTACLE',
    finalImage: '/assets/props/finalities/film-strip-finality.png'
  }
};

/**
 * Renders character-specific fatality sequences.
 * Phases:
 * 1) Casting: projectile flies across screen.
 * 2) Critique: character-specific scrolling text overlay.
 * 3) Explosion: victim head-blowup sprites in grayscale ink look.
 * 4) Reification: victim replaced by arcade cabinet, ending text shown.
 */
const Fatality = memo(function Fatality({ victimId, attackerId, onComplete }: FatalityProps) {
  const [phase, setPhase] = useState<FatalityPhase>('cast');
  const [explosionFrame, setExplosionFrame] = useState(0);
  const [victoryFrame, setVictoryFrame] = useState(0);

  // Get character-specific fatality data, fallback to khayati
  const fatalityData = FATALITY_DATA[attackerId] || FATALITY_DATA.khayati;

  const [projectileRain] = useState(() => {
    // Create stacking effect by having pamphlets land in different spots with slight offsets
    const centerX = 50; // center of screen
    const spreadRadius = 15; // percentage spread from center
    return Array.from({ length: 640 }).map((_, i) => {
      // Use angle and distance for radial distribution
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.sqrt(Math.random()) * spreadRadius; // sqrt for even distribution
      const landX = centerX + Math.cos(angle) * distance;

      // Vary the landing height to create a pile effect
      // Later pamphlets land higher on the pile
      const baseHeight = 85; // vh - base ground level
      const pileHeight = -30; // vh - how tall the pile can get
      const pileProgress = i / 640; // 0 to 1
      const landY = baseHeight + (pileHeight * pileProgress) + (Math.random() * 3 - 1.5); // add jitter

      return {
        id: `projectile-${i}`,
        left: Math.random() * 100, // start position across full width
        landX, // where it lands (clustered in center)
        landY, // vertical position in the pile
        delay: Math.random() * 2.5, // stagger over 2.5 seconds
        duration: 2.5 + Math.random() * 1.5, // fall duration 2.5-4s
        scale: 0.6 + Math.random() * 0.8, // size variation
        rotation: Math.random() * 360, // initial rotation
        finalRotation: Math.random() * 360 // final rotation when landed
      };
    });
  });

  // DEBUG
  console.log('🎬 FATALITY COMPONENT MOUNTED!', { victimId, attackerId, phase, fatalityData });
  console.log('📚 Projectile rain count:', projectileRain.length);
  console.log('📚 Sample rain projectile:', projectileRain[0]);

  useEffect(() => {
    // Debug phase transitions to verify overlay runs
    console.log('[Fatality] phase', phase);
  }, [phase]);

  useEffect(() => {
    // Phase timing chain with sound effects
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Stop arena music and play fatality begin sound
    audioManager.stopMusic();
    audioManager.play('fatalityBegin', { volume: 0.9 });

    // Cast (pamphlet flight) for 2s
    timers.push(setTimeout(() => {
      setPhase('critique');
      audioManager.play('projectile', { volume: 0.6 });
    }, 2000));

    // Critique text + rain stays for 5s to let pamphlets fall dramatically
    timers.push(setTimeout(() => {
      setPhase('explosion');
      audioManager.play('hitHeavy', { volume: 0.8 });
    }, 2000 + 5000));

    // Explosion lasts 2s
    timers.push(setTimeout(() => {
      setPhase('reify');
      audioManager.play('fatalityEnd', { volume: 0.7 });
    }, 2000 + 5000 + 2000));

    // Reify shows for 3s before ending
    timers.push(setTimeout(onComplete, 2000 + 5000 + 2000 + 3000));

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  // Explosion sprite cycling
  useEffect(() => {
    if (phase !== 'explosion') return;
    const id = setInterval(() => {
      setExplosionFrame(f => (f + 1) % explosionSprites.length);
    }, 80);
    return () => clearInterval(id);
  }, [phase]);

  // Victory sprite cycling (during critique/rain phase)
  useEffect(() => {
    if (phase !== 'critique' && phase !== 'explosion' && phase !== 'reify') return;
    const id = setInterval(() => {
      setVictoryFrame(f => (f + 1) % victorySprites.length);
    }, 100);
    return () => clearInterval(id);
  }, [phase]);

  // Character-specific victory sprite sequences
  const VICTORY_SPRITES: Record<string, string[]> = {
    khayati: [
      '/assets/liukang/sprites/victory/01.png',
      '/assets/liukang/sprites/victory/02.png',
      '/assets/liukang/sprites/victory/03.png',
      '/assets/liukang/sprites/victory/04.png',
      '/assets/liukang/sprites/victory/05.png',
      '/assets/liukang/sprites/victory/06.png',
      '/assets/liukang/sprites/victory/07.png',
      '/assets/liukang/sprites/victory/08.png',
      '/assets/liukang/sprites/victory/09.png',
      '/assets/liukang/sprites/victory/10.png',
      '/assets/liukang/sprites/victory/11.png',
      '/assets/liukang/sprites/victory/12.png',
      '/assets/liukang/sprites/victory/13.png',
      '/assets/liukang/sprites/victory/14.png',
      '/assets/liukang/sprites/victory/15.png'
    ],
    bureaucrat: [
      '/assets/stryker/sprites/victory/01.png',
      '/assets/stryker/sprites/victory/02.png',
      '/assets/stryker/sprites/victory/03.png',
      '/assets/stryker/sprites/victory/04.png',
      '/assets/stryker/sprites/victory/05.png',
      '/assets/stryker/sprites/victory/06.png',
      '/assets/stryker/sprites/victory/07.png',
      '/assets/stryker/sprites/victory/08.png',
      '/assets/stryker/sprites/victory/09.png',
      '/assets/stryker/sprites/victory/10.png',
      '/assets/stryker/sprites/victory/11.png',
      '/assets/stryker/sprites/victory/12.png',
      '/assets/stryker/sprites/victory/13.png',
      '/assets/stryker/sprites/victory/14.png',
      '/assets/stryker/sprites/victory/15.png',
      '/assets/stryker/sprites/victory/16.png',
      '/assets/stryker/sprites/victory/17.png',
      '/assets/stryker/sprites/victory/18.png',
      '/assets/stryker/sprites/victory/19.png',
      '/assets/stryker/sprites/victory/20.png',
      '/assets/stryker/sprites/victory/21.png',
      '/assets/stryker/sprites/victory/22.png'
    ],
    professor: [
      '/assets/shangtsung/sprites/victory/01.png',
      '/assets/shangtsung/sprites/victory/02.png',
      '/assets/shangtsung/sprites/victory/03.png',
      '/assets/shangtsung/sprites/victory/04.png',
      '/assets/shangtsung/sprites/victory/05.png',
      '/assets/shangtsung/sprites/victory/06.png',
      '/assets/shangtsung/sprites/victory/07.png',
      '/assets/shangtsung/sprites/victory/08.png',
      '/assets/shangtsung/sprites/victory/09.png',
      '/assets/shangtsung/sprites/victory/10.png',
      '/assets/shangtsung/sprites/victory/11.png',
      '/assets/shangtsung/sprites/victory/12.png',
      '/assets/shangtsung/sprites/victory/13.png',
      '/assets/shangtsung/sprites/victory/14.png',
      '/assets/shangtsung/sprites/victory/15.png',
      '/assets/shangtsung/sprites/victory/16.png'
    ],
    maoist: [
      '/assets/kunglao/sprites/victory/01.gif',
      '/assets/kunglao/sprites/victory/02.gif',
      '/assets/kunglao/sprites/victory/03.gif',
      '/assets/kunglao/sprites/victory/04.gif',
      '/assets/kunglao/sprites/victory/05.gif',
      '/assets/kunglao/sprites/victory/06.gif',
      '/assets/kunglao/sprites/victory/07.gif',
      '/assets/kunglao/sprites/victory/08.gif',
      '/assets/kunglao/sprites/victory/09.gif',
      '/assets/kunglao/sprites/victory/10.gif',
      '/assets/kunglao/sprites/victory/11.gif',
      '/assets/kunglao/sprites/victory/12.gif',
      '/assets/kunglao/sprites/victory/13.gif',
      '/assets/kunglao/sprites/victory/14.gif',
      '/assets/kunglao/sprites/victory/15.gif',
      '/assets/kunglao/sprites/victory/16.gif'
    ],
    debord: [
      '/assets/noobsaibot/sprites/victory/01.png',
      '/assets/noobsaibot/sprites/victory/02.png',
      '/assets/noobsaibot/sprites/victory/03.png',
      '/assets/noobsaibot/sprites/victory/04.png',
      '/assets/noobsaibot/sprites/victory/05.png',
      '/assets/noobsaibot/sprites/victory/06.png',
      '/assets/noobsaibot/sprites/victory/07.png',
      '/assets/noobsaibot/sprites/victory/08.png',
      '/assets/noobsaibot/sprites/victory/09.png',
      '/assets/noobsaibot/sprites/victory/10.png'
    ]
  };

  const victorySprites = VICTORY_SPRITES[attackerId] || VICTORY_SPRITES.khayati;

  const explosionSprites = [
    '/assets/props/effects/blood/2025/blood5_01.png',
    '/assets/props/effects/blood/2025/blood5_02.png',
    '/assets/props/effects/blood/2025/blood5_03.png',
    '/assets/props/effects/blood/2025/blood5_04.png',
    '/assets/props/effects/blood/2025/blood5_05.png',
    '/assets/props/effects/blood/2025/blood5_06.png',
    '/assets/props/effects/blood/2025/blood5_07.png',
    '/assets/props/effects/blood/2025/blood5_08.png',
    '/assets/props/effects/blood/2025/blood5_09.png',
    '/assets/props/effects/blood/2025/blood5_10.png',
    '/assets/props/effects/blood/2025/blood5_11.png',
    '/assets/props/effects/blood/2025/blood5_12.png',
    '/assets/props/effects/blood/2025/blood5_13.png',
    '/assets/props/effects/blood/2025/blood5_14.png',
    '/assets/props/effects/blood/2025/blood5_15.png',
    '/assets/props/effects/blood/2025/blood5_16.png',
    '/assets/props/effects/blood/2025/blood5_17.png',
    '/assets/props/effects/blood/2025/blood5_18.png',
    '/assets/props/effects/blood/2025/blood5_19.png'
  ];

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Local keyframes for pamphlet + text scroll */}
      <style>
        {`
        @keyframes pamphlet-flight {
          0% { transform: translate(-20%, -10%) rotate(-10deg); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translate(120%, 0%) rotate(8deg); opacity: 1; }
        }
        @keyframes scroll-text {
          0% { transform: translateY(100%); }
          100% { transform: translateY(-100%); }
        }
        @keyframes book-fall {
          0% {
            transform: translateX(0%) translateY(-20vh) rotate(var(--start-rotation));
            opacity: 0;
          }
          10% { opacity: 1; }
          100% {
            transform: translateX(var(--land-offset)) translateY(var(--land-y)) rotate(var(--final-rotation));
            opacity: 1;
          }
        }
        `}
      </style>

      {/* Phase 1: casting + projectile */}
      {phase === 'cast' && (
        <div className="absolute inset-0 flex items-center">
          <img
            src={fatalityData.projectile}
            alt="projectile"
            className="h-24 w-32 object-contain"
            style={{
              animation: 'pamphlet-flight 1.2s linear forwards',
              filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.8))',
              imageRendering: 'pixelated'
            }}
          />
        </div>
      )}

      {/* Phase 2: critique text overlay */}
      {phase === 'critique' && (
        <div className="absolute inset-0 text-green-400 font-mono text-3xl flex overflow-hidden transition-opacity duration-300 z-[200]">
          <div
            className="w-full leading-tight px-6 drop-shadow-[0_0_8px_rgba(0,0,0,0.9)]"
            style={{
              animation: 'scroll-text 4s linear infinite',
              textShadow: '2px 2px 4px rgba(0,0,0,0.95), -1px -1px 2px rgba(0,0,0,0.8)'
            }}
          >
            {fatalityData.critiqueText}
          </div>
        </div>
      )}

      {/* Phase 3: explosion (ink) */}
      {phase === 'explosion' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={explosionSprites[explosionFrame]}
            alt="ink explosion"
            className="w-[420px] h-[420px] object-contain"
            style={{ filter: 'grayscale(1) brightness(0.2)', imageRendering: 'pixelated' }}
          />
        </div>
      )}

      {/* Projectile rain overlay (starts once projectile lands / critique begins) */}
      {(phase === 'critique' || phase === 'explosion' || phase === 'reify') && (() => {
        console.log('🌧️ RENDERING RAIN OVERLAY', { phase, projectileCount: projectileRain.length, projectileSrc: fatalityData.projectile });
        return (
        <div className="absolute pointer-events-none z-10" style={{ left: 0, top: 0, width: '100%', height: '100%' }}>
          {projectileRain.map(proj => {
            // Calculate horizontal offset needed to move from start (proj.left) to landing (proj.landX)
            const landOffsetPercent = proj.landX - proj.left;
            return (
              <img
                key={proj.id}
                src={fatalityData.projectile}
                alt="falling-projectile"
                className="absolute"
                style={{
                  left: `${proj.left}%`,
                  top: 0,
                  width: `${200 * proj.scale}px`,
                  height: `${90 * proj.scale}px`,
                  objectFit: 'contain',
                  imageRendering: 'pixelated',
                  filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.6))',
                  animation: `book-fall ${proj.duration}s ease-in ${proj.delay}s forwards`,
                  opacity: 0.95,
                  // CSS custom properties for animation
                  ['--start-rotation' as any]: `${proj.rotation}deg`,
                  ['--final-rotation' as any]: `${proj.finalRotation}deg`,
                  ['--land-offset' as any]: `${landOffsetPercent}%`,
                  ['--land-y' as any]: `${proj.landY}vh`
                }}
              />
            );
          })}
        </div>
        );
      })()}

      {/* Victory pose - appears in front of pamphlets and enemy during rain/explosion/reify phases */}
      {(phase === 'critique' || phase === 'explosion' || phase === 'reify') && (() => {
        // Khayati uses base scale 3.5, others get 30% larger = 4.55
        const scale = attackerId === 'khayati' ? 3.5 : 4.55;
        const maxHeight = attackerId === 'khayati' ? '600px' : '780px';

        return (
          <div
            className="absolute z-[1000]"
            style={{
              left: '50%',
              bottom: '10vh',
              transform: `translateX(-50%) scale(${scale})`,
              transformOrigin: 'bottom center'
            }}
          >
            <img
              src={victorySprites[victoryFrame]}
              alt={`${attackerId}-victory`}
              className="w-auto h-auto object-contain"
              style={{
                imageRendering: 'pixelated',
                filter: 'drop-shadow(0 0 30px rgba(0,0,0,1))',
                maxHeight
              }}
            />
          </div>
        );
      })()}

      {/* Phase 4: reification - show fatality message over the buried victim */}
      {phase === 'reify' && (
        <div className="absolute flex items-center justify-center z-[150]" style={{ left: 0, top: 0, width: '100%', height: '100%' }}>
          {/* Fatality message */}
          <div
            className="text-7xl font-black uppercase tracking-[0.4em] text-red-600 relative z-20 px-8 text-center"
            style={{
              fontFamily: 'Orbitron, monospace',
              textShadow: '0 0 40px #000, 0 0 60px #000, 4px 4px 8px #000, -3px -3px 6px #000',
              WebkitTextStroke: '3px black',
              lineHeight: '1.2'
            }}
          >
            {fatalityData.finalMessage}
          </div>
        </div>
      )}
    </div>
  );
});

export default Fatality;
