import type { FighterState } from './types';

const styleDefault = { power: 1, speed: 1, defense: 1, meterGain: 1 };

export const getStyleModifiers = (fighter: FighterState) => {
  const idx = fighter.styleIndex || 0;
  let mods = { ...styleDefault };

  // Styles: [0, 1]
  switch (fighter.id) {
    case 'khayati':
      // Style 0: POETRY (Agile, High Meter gain, Low Damage)
      // Style 1: RIOTS (High Power, Glass Cannon)
      mods = idx === 0 
        ? { power: 0.85, speed: 1.3, defense: 0.95, meterGain: 1.4 } 
        : { power: 1.35, speed: 1.1, defense: 0.75, meterGain: 0.9 };
      break;
    case 'bureaucrat':
      // Style 0: NEGOTIATION (Turtle: High Defense, Low Speed) 
      // Style 1: RECUPERATION (Bruiser: Balanced Power/Defense)
      mods = idx === 0
        ? { power: 0.8, speed: 0.7, defense: 1.5, meterGain: 1.1 }
        : { power: 1.15, speed: 0.9, defense: 1.2, meterGain: 1.0 };
      break;
    case 'professor':
      // Style 0: LECTURE (Zoning: Low Speed, Good Defense, Meter) 
      // Style 1: GRADING (Punish: High Precision/Power)
      mods = idx === 0
        ? { power: 0.9, speed: 0.85, defense: 1.15, meterGain: 1.2 }
        : { power: 1.25, speed: 1.15, defense: 0.85, meterGain: 1.0 };
      break;
    case 'maoist':
      // Style 0: THEORY (Resource: Weak, Fast Meter) 
      // Style 1: PRAXIS (Rushdown: High Speed/Power, Low Defense)
      mods = idx === 0
        ? { power: 0.75, speed: 1.1, defense: 1.0, meterGain: 1.6 }
        : { power: 1.4, speed: 1.3, defense: 0.6, meterGain: 0.8 };
      break;
    case 'debord':
      // Style 0: SPECTACLE (Tricky: Very Fast, Low Damage) 
      // Style 1: TRUTH (Boss: High Power/Defense, Slow)
      mods = idx === 0
        ? { power: 0.9, speed: 1.4, defense: 0.9, meterGain: 1.3 }
        : { power: 1.5, speed: 0.7, defense: 1.3, meterGain: 0.8 };
      break;
    default:
      mods = styleDefault;
  }

  // Apply Spectacle Mode buffs (Global override)
  if (fighter.spectacleMode) {
    mods.power *= 1.3;
    mods.speed *= 1.2;
    mods.defense *= 1.3;
    mods.meterGain = 0; // Meter is consumed, no gain during mode
  }

  return mods;
};
