import type { FighterState } from '../types';
import type { ActionType } from '../assets';
import { CHARACTER_DATA, MOVE_SPEED, MAX_HP } from '../assets';
import { getStyleModifiers } from '../utils';

export type AIState = 'IDLE' | 'APPROACH' | 'RETREAT' | 'DEFEND' | 'ATTACK' | 'JUMP_IN' | 'ANTI_AIR' | 'ZONING';

export interface AIContext {
  state: AIState;
  timer: number;
  decisionTimer: number;
  aggression: number; // 0-1
  recoveryTimer: number; // Cooldown after attacking
  lastAction: string;
}

export const getInitialAIContext = (): AIContext => ({
  state: 'IDLE',
  timer: 0,
  decisionTimer: 0,
  aggression: 0.6, // Higher base aggression
  recoveryTimer: 0,
  lastAction: 'IDLE'
});

export const updateAI = (
  ctx: AIContext,
  ai: FighterState,
  opponent: FighterState
): { ctx: AIContext; updates: Partial<FighterState> } => {
  const nextCtx = { ...ctx };
  const updates: Partial<FighterState> = {};
  const aiData = CHARACTER_DATA[ai.id];

  // Detect transition from Attack -> Idle to trigger recovery
  const wasAttacking = ctx.lastAction.includes('ATTACK') || ctx.lastAction.includes('SPECIAL');
  const isIdle = ai.action === 'IDLE' || ai.action.includes('WALK');
  
  if (wasAttacking && isIdle && nextCtx.recoveryTimer === 0) {
      // Shorter cooldowns for more pressure
      // Set cooldown: 5-25 frames
      nextCtx.recoveryTimer = Math.max(5, 25 - Math.floor(nextCtx.aggression * 25));
  }
  nextCtx.lastAction = ai.action;

  // Handle recovery cooldown
  if (nextCtx.recoveryTimer > 0) {
      nextCtx.recoveryTimer--;
      // During recovery, allow blocking
      const dist = Math.abs(ai.x - opponent.x);
      if (dist < 200 && (opponent.action.includes('ATTACK') || opponent.action.includes('SPECIAL'))) {
          updates.action = 'BLOCK';
          updates.isBlocking = true;
          return { ctx: nextCtx, updates };
      }
      // Otherwise allow movement to spacing
      const spacing = 180;
      const speedMod = getStyleModifiers(ai).speed;
      if (dist < spacing) {
           // Back off
           if (ai.x < opponent.x) updates.x = ai.x - MOVE_SPEED * aiData.stats.speed * speedMod;
           else updates.x = ai.x + MOVE_SPEED * aiData.stats.speed * speedMod;
           updates.action = 'WALK_BACKWARD';
      } else {
           updates.action = 'IDLE';
      }
      return { ctx: nextCtx, updates };
  }

  // Adjust aggression based on HP diff and difficulty scaling (simulate by round)
  // Base aggression is high (0.6), increase if losing or if opponent is low
  if (ai.hp < opponent.hp) nextCtx.aggression = 0.8; // Desperate
  else if (opponent.hp < MAX_HP * 0.3) nextCtx.aggression = 0.9; // Killer instinct
  else nextCtx.aggression = 0.6;

  // Don't update if stunned or busy with an uncancellable action
  const canAct = ai.stunFrames === 0 && 
    (ai.action === 'IDLE' || ai.action.includes('WALK') || ai.action === 'CROUCH' || ai.action === 'BLOCK');

  if (!canAct) {
     return { ctx: nextCtx, updates };
  }

  nextCtx.decisionTimer++;
  // Faster reaction time
  const reactionThreshold = Math.max(1, 5 - Math.floor(nextCtx.aggression * 4));
  if (nextCtx.decisionTimer < reactionThreshold) return { ctx: nextCtx, updates };
  nextCtx.decisionTimer = 0;

  const dist = Math.abs(ai.x - opponent.x);
  const isClose = dist < 140;
  const isMid = dist >= 140 && dist < 400;
  const isFar = dist >= 400;
  const opponentAttacking = opponent.action.includes('ATTACK') || opponent.action.includes('SPECIAL');
  const opponentAirborne = opponent.y > 0;

  // --- TRANSITIONS ---

  // 1. Anti-Air (High Priority)
  if (opponentAirborne && isClose && Math.random() < 0.85) {
    nextCtx.state = 'ANTI_AIR';
  }
  // 2. Defend if threatened
  else if (opponentAttacking && isClose && Math.random() < 0.75) { 
    nextCtx.state = 'DEFEND';
  }
  // 3. Zoning (if character has projectile and is far)
  else if (isFar && Math.random() < 0.6) {
    nextCtx.state = 'ZONING';
  }
  // 4. Standard transitions
  else {
    switch (nextCtx.state) {
      case 'IDLE':
        if (isFar) nextCtx.state = Math.random() > 0.3 ? 'APPROACH' : 'ZONING';
        else if (isMid) nextCtx.state = Math.random() > 0.5 ? 'JUMP_IN' : 'APPROACH';
        else if (isClose) nextCtx.state = Math.random() > 0.2 ? 'ATTACK' : 'RETREAT';
        break;
      case 'APPROACH':
        if (isClose) nextCtx.state = 'ATTACK';
        else if (Math.random() > 0.95) nextCtx.state = 'IDLE';
        break;
      case 'RETREAT':
        if (isMid || isFar) nextCtx.state = 'IDLE';
        break;
      case 'DEFEND':
        if (!opponentAttacking) nextCtx.state = 'ATTACK'; // Punish after block
        break;
      case 'ATTACK':
      case 'ANTI_AIR':
      case 'ZONING':
        nextCtx.state = 'IDLE'; // Reset
        break;
      case 'JUMP_IN':
        if (ai.y === 0 && ai.velocityY === 0 && ai.action !== 'JUMP') nextCtx.state = 'ATTACK'; // Land into combo
        break;
    }
  }

  // --- EXECUTION ---
  const speedMod = getStyleModifiers(ai).speed;

  switch (nextCtx.state) {
    case 'APPROACH':
       if (ai.x < opponent.x) {
         updates.x = ai.x + MOVE_SPEED * aiData.stats.speed * speedMod;
         updates.facingLeft = false;
       } else {
         updates.x = ai.x - MOVE_SPEED * aiData.stats.speed * speedMod;
         updates.facingLeft = true;
       }
       updates.action = 'WALK_FORWARD';
       updates.isBlocking = false;
       break;

    case 'RETREAT':
       if (ai.x < opponent.x) {
         updates.x = ai.x - MOVE_SPEED * aiData.stats.speed * speedMod;
       } else {
         updates.x = ai.x + MOVE_SPEED * aiData.stats.speed * speedMod;
       }
       updates.action = 'WALK_BACKWARD';
       updates.isBlocking = false;
       break;

    case 'DEFEND':
       updates.action = 'BLOCK';
       updates.isBlocking = true;
       break;

    case 'ANTI_AIR':
       // Perform uppercut or high kick
       updates.action = Math.random() > 0.5 ? 'CROUCH_ATTACK_P' : 'ATTACK_RK';
       updates.actionFrame = 0;
       break;

    case 'ZONING':
       // Use projectile special if available
       if (ai.meter >= 10 && Math.random() > 0.3) {
         // Assuming SPECIAL_1 is usually projectile for most
         updates.action = 'SPECIAL_1'; 
       } else {
         updates.action = 'IDLE'; // Or taunt/charge meter
       }
       updates.actionFrame = 0;
       break;

    case 'ATTACK':
       // Smarter attack selection
       const rand = Math.random();
       let attack: ActionType = 'ATTACK_LP';
       
       if (opponent.action === 'BLOCK' && dist < 70) {
         // Throw if blocking close
         attack = 'SPECIAL_2'; // Assuming SPECIAL_2 is often a grab/close move
       } else {
         // Mixups
         if (rand > 0.7) attack = 'ATTACK_RK'; // High damage
         else if (rand > 0.5) attack = 'ATTACK_LK'; // Low
         else if (rand > 0.3) attack = 'ATTACK_RP'; // Mid
         
         // Special cancel / raw special
         if (rand > 0.8 && ai.meter >= 20) {
           attack = Math.random() > 0.5 ? 'SPECIAL_3' : 'SPECIAL_4';
         }
       }

       updates.action = attack;
       updates.actionFrame = 0;
       updates.isBlocking = false;
       break;

    case 'JUMP_IN':
       if (ai.y === 0) {
           updates.velocityY = 32;
           updates.action = 'JUMP';
           updates.actionFrame = 0;
           updates.velocityX = (ai.x < opponent.x ? 1 : -1) * MOVE_SPEED * 1.5;
       } else {
           // Attack late in jump for better hit confirm
           if (ai.velocityY < -5) {
               updates.action = Math.random() > 0.5 ? 'JUMP_ATTACK_K' : 'JUMP_ATTACK_P';
               updates.actionFrame = 0;
           }
       }
       updates.isBlocking = false;
       break;

    case 'IDLE':
       updates.action = 'IDLE';
       updates.isBlocking = false;
       break;
  }

  return { ctx: nextCtx, updates };
};
