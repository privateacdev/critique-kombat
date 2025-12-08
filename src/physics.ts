import type { FighterState } from './types';
import type { MoveData } from './assets';

export const HURTBOX_SIZES: Record<string, { width: number; height: number }> = {
  khayati: { width: 200, height: 450 },
  bureaucrat: { width: 200, height: 460 },
  professor: { width: 200, height: 450 },
  maoist: { width: 200, height: 430 },
  debord: { width: 200, height: 460 }
};

export const checkHitboxCollision = (
  attacker: FighterState,
  defender: FighterState,
  move: MoveData
): boolean => {
  // Use move-specific hitbox if available, otherwise calculate from range
  // Note: move.hitbox is the new optional field we added
  
  // Hurtbox for defender
  const baseBottom = 80 + defender.y;
  const isCrouching = defender.action === 'CROUCH' || defender.action.includes('CROUCH_ATTACK');
  const isAirborne = defender.y > 0;
  const base = HURTBOX_SIZES[defender.id] || { width: 100, height: 200 };
  const hurtWidth = isCrouching ? base.width * 0.8 : base.width;
  const hurtHeight = isCrouching ? base.height * 0.6 : isAirborne ? base.height * 0.8 : base.height;
  const hurtLeft = defender.x - hurtWidth / 2;
  const hurtRight = defender.x + hurtWidth / 2;
  const hurtTop = baseBottom + hurtHeight;
  const hurtBottom = baseBottom;

  // Hitbox for attacker
  let hitLeft, hitRight, hitTop, hitBottom;

  if (move.hitbox) {
      // Use explicit hitbox data relative to attacker position
      const { width, height, offsetX = 0, offsetY = 0 } = move.hitbox;
      const dir = attacker.facingLeft ? -1 : 1;
      const centerX = attacker.x + (offsetX * dir);
      const centerY = 80 + attacker.y + offsetY;
      
      hitLeft = centerX - width / 2;
      hitRight = centerX + width / 2;
      hitBottom = centerY;
      hitTop = centerY + height;
  } else {
      // Legacy calculation based on rangeX/rangeY
      const hitWidth = (move.rangeX + 150); 
      const hitHeight = move.rangeY + 150;
      // Bias less forward so the debug box hugs the fighter more
      const forwardBias = hitWidth * 0.25;
      const hitCenterX = attacker.x + (attacker.facingLeft ? -forwardBias : forwardBias);
      const hitBaseY = 80 + attacker.y;
      
      hitLeft = hitCenterX - hitWidth / 2;
      hitRight = hitCenterX + hitWidth / 2;
      hitTop = hitBaseY + hitHeight;
      hitBottom = hitBaseY;
  }

  // Overlap check
  const overlapsX = hitRight >= hurtLeft && hitLeft <= hurtRight;
  const overlapsY = hitTop >= hurtBottom && hitBottom <= hurtTop;

  if (!overlapsX || !overlapsY) {
    return false;
  }

  // Lows must hit grounded
  if (move.type === 'low' && isAirborne) {
    return false;
  }

  return true;
};

export const isInActiveFrames = (fighter: FighterState, move: MoveData): boolean => {
  return fighter.actionFrame >= move.startup &&
         fighter.actionFrame < move.startup + move.active;
};

export const resolvePushCollision = (
  p1: FighterState,
  p2: FighterState,
  pushRadius: number = 60
): { p1x: number; p2x: number } => {
  // Only push if both grounded
  if (p1.y > 0 || p2.y > 0) return { p1x: p1.x, p2x: p2.x };

  const dist = p1.x - p2.x;
  const absDist = Math.abs(dist);
  const minSeparation = pushRadius * 2;

  if (absDist < minSeparation) {
    const overlap = minSeparation - absDist;
    const pushAmt = overlap / 2;
    // Push apart
    if (dist > 0) {
      return { p1x: p1.x + pushAmt, p2x: p2.x - pushAmt };
    } else {
      return { p1x: p1.x - pushAmt, p2x: p2.x + pushAmt };
    }
  }
  return { p1x: p1.x, p2x: p2.x };
};
