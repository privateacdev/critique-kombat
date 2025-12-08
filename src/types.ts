import type { ActionType } from './assets';

export interface FighterState {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  hp: number;
  meter: number;
  action: ActionType;
  actionFrame: number;
  facingLeft: boolean;
  roundsWon: number;
  comboCount: number;
  isBlocking: boolean;
  stunFrames: number;
  spectacleMode: boolean;
  spectacleFrames: number;
  styleIndex: number;
}

export interface GameStateProps {
    player: FighterState;
    enemy: FighterState;
    projectiles: any[]; // Define Projectile type properly later if needed
}
