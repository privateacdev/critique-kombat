import { CHARACTERS, CHARACTER_DATA } from './assets';
import type { ActionType } from './assets';

interface NinjaRendererProps {
  charId: string;
  action: ActionType;
  frameTick: number;
  facingLeft: boolean;
}

export default function NinjaRenderer({ charId, action, frameTick, facingLeft }: NinjaRendererProps) {
  const character = CHARACTERS[charId as keyof typeof CHARACTERS];

  if (!character) {
    return null;
  }

  // Try to get the specific action, fall back to IDLE
  type SpriteMap = Record<string, string | readonly string[]>;
  const spriteMap = character as SpriteMap;
  const idleAsset = spriteMap.IDLE;
  const asset = spriteMap[action] ?? idleAsset;

  if (!asset) {
    return null;
  }

  let imageSrc: string;

  if (typeof asset === 'string') {
    // Single GIF or PNG
    imageSrc = asset;
  } else {
    // Array of PNGs - cycle through based on frameTick
    let frames = asset as readonly string[];
    // Attack/special animations: moderate speed; Jump: very fast to show full tuck cycle; Others: slower
    const moveData = CHARACTER_DATA[charId]?.moves[action];
    const frameStride = moveData?.frameSpeed ?? (action.includes('ATTACK') || action.includes('SPECIAL') ? 3 : action === 'JUMP' ? 3 : 5);
    const rawIndex = Math.floor(frameTick / frameStride);
    if ((action.includes('ATTACK') || action.includes('SPECIAL')) && rawIndex >= frames.length && Array.isArray(idleAsset)) {
      frames = idleAsset as readonly string[];
    }
    // For JUMP, loop the animation continuously to avoid showing idle frames
    if (action === 'JUMP' && rawIndex >= frames.length) {
      // Don't fall back to idle - keep looping jump animation
    }
    let index: number;
    // Clamp KNOCKDOWN/DEFEAT to last frame so they stay down
    if ((action === 'KNOCKDOWN' || action === 'DEFEAT' || action === 'VICTORY') && rawIndex >= frames.length - 1) {
      index = frames.length - 1;
    }
    // Ping-pong idle for Khayati so the stance plays forward then backward
    else if (action === 'IDLE' && charId === 'khayati' && frames.length > 1) {
      const cycle = (frames.length - 1) * 2;
      const pos = rawIndex % cycle;
      index = pos < frames.length ? pos : (cycle - pos);
    } else {
      index = rawIndex % frames.length;
    }
    imageSrc = frames[index];
  }

  // Calculate responsive scale based on window height
  // Target: sprites should be much larger - ~40-50% of screen height
  const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
  const targetHeight = screenHeight * 0.45; // 45% of screen for good visibility
  const baseHeight = 100; // Approximate base sprite height in pixels
  const charScale = CHARACTER_DATA[charId]?.scale ?? 1.0;
  const scale = Math.max(4, targetHeight / baseHeight) * charScale; // Minimum 4x scale, usually more

  // Force ALL sprites to render at exact same scale regardless of source dimensions
  // Anchor sprites at the bottom center (feet position) instead of center
  const style: React.CSSProperties = {
    width: '400px',
    height: '400px',
    objectFit: 'none', // Don't scale to fit - render at actual size
    objectPosition: 'center bottom', // Anchor at bottom center (feet)
    imageRendering: 'pixelated',
    filter: 'contrast(1.1) sepia(0.2)',
    transform: facingLeft ? `scaleX(-1) scale(${scale})` : `scale(${scale})`,
    transformOrigin: 'center bottom', // Scale from feet position
  };

  return (
    <div style={{ width: '400px', height: '400px', position: 'relative', overflow: 'visible', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <img src={imageSrc} alt={`${charId} ${action}`} style={style} />
    </div>
  );
}
