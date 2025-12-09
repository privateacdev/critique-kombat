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
  stamina: number;         // Run meter (0-100)
  isJuggled: boolean;      // Currently being juggled in air
  juggleCount: number;     // Number of hits during current juggle
  juggleGravity: number;   // Modified gravity during juggle
}

export interface GameStateProps {
    player: FighterState;
    enemy: FighterState;
    projectiles: any[]; // Define Projectile type properly later if needed
}
