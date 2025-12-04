
export enum GameState {
  MENU = 'MENU',
  CHARACTER_SELECT = 'CHARACTER_SELECT',
  INTRO_CUTSCENE = 'INTRO_CUTSCENE',
  FIGHTING = 'FIGHTING',
  FINISH_HIM = 'FINISH_HIM', // New state for Fatality window
  BONUS_STAGE = 'BONUS_STAGE',
  ENDING = 'ENDING',
  GAME_OVER = 'GAME_OVER',
  BSOD = 'BSOD', // Blue Screen of Death
  LOSE_CUTSCENE = 'LOSE_CUTSCENE'
}

export enum ActionState {
  IDLE = 'IDLE',
  INTRO = 'INTRO',
  WALK_FORWARD = 'WALK_FORWARD',
  WALK_BACKWARD = 'WALK_BACKWARD',
  CROUCH = 'CROUCH',
  JUMP = 'JUMP',
  ATTACK_LP = 'ATTACK_LP', 
  ATTACK_RP = 'ATTACK_RP', 
  ATTACK_LK = 'ATTACK_LK', 
  ATTACK_RK = 'ATTACK_RK',
  JUMP_ATTACK_P = 'JUMP_ATTACK_P', // Aerial Punch
  JUMP_ATTACK_K = 'JUMP_ATTACK_K', // Aerial Kick
  CROUCH_ATTACK_P = 'CROUCH_ATTACK_P', // Low Punch
  CROUCH_ATTACK_K = 'CROUCH_ATTACK_K', // Sweep
  SPECIAL_1 = 'SPECIAL_1', // QCF / Projectile
  SPECIAL_2 = 'SPECIAL_2', // HCB / Command Grab
  SPECIAL_3 = 'SPECIAL_3', // Down Up / Buff / Trap
  SPECIAL_4 = 'SPECIAL_4', // Down Down
  BLOCK = 'BLOCK',
  PARRY = 'PARRY', // Recuperation
  HIT_STUN = 'HIT_STUN',
  GRABBED = 'GRABBED',
  KNOCKDOWN = 'KNOCKDOWN',
  DIZZY = 'DIZZY', // New state for loser
  VICTORY = 'VICTORY',
  DEFEAT = 'DEFEAT',
  DEFEAT_SELLOUT = 'DEFEAT_SELLOUT', // Handshake
  DEFEAT_FATAL = 'DEFEAT_FATAL', // Being fatalitied
  FATALITY = 'FATALITY', 
  SPECIAL_PROJECTILE = 'SPECIAL_PROJECTILE',
  SPECIAL_GRAB = 'SPECIAL_GRAB',
  TELEPORT_OUT = 'TELEPORT_OUT',
  TELEPORT_IN = 'TELEPORT_IN',
  XRAY = 'XRAY',
  TIME_OVER = 'TIME_OVER'
}

export enum StageId {
  FACTORY = 'FACTORY',
  SUPERMARKET = 'SUPERMARKET',
  UNIVERSITY = 'UNIVERSITY',
  CINEMA = 'CINEMA'
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface FighterState {
  id: string;
  hp: number;
  maxHp: number;
  meter: number;
  position: Vector2;
  velocity: Vector2;
  direction: 1 | -1;
  action: ActionState;
  frame: number;
  isGrounded: boolean;
  hitbox: { width: number; height: number; offsetX: number; offsetY: number };
  characterId: string;
  roundsWon: number;
  isSpeaking?: boolean;
  isSoldOut?: boolean; // HP < 20%
  isWireframe?: boolean; // Spectacle Mode
  comboCount: number;
  styleIndex: number;
  styles: string[];
}

export interface Projectile {
    id: number;
    ownerId: string;
    position: Vector2;
    velocity: Vector2;
    damage: number;
    type: 'paper' | 'book' | 'rope' | 'grade_f' | 'word_hazard';
    text?: string; // For Boss "Words"
    active: boolean;
}

export interface FatalityEffect {
    id: number;
    type: 'tv_drop' | 'stamp' | 'grade_crush' | 'crowd_rush';
    x: number;
    y: number;
    frame: number;
}

export interface Character {
  id: string;
  name: string;
  archetype: string;
  description: string;
  stats: {
    speed: number;
    power: number;
    defense: number;
  };
  introQuote: string;
  winQuote: string;
  loseQuote: string;
  meterName: string;
  fightingStyle: string;
  styles: string[];
  comboTitles: string[]; // Custom text for combos
  textureType: 'leather' | 'suit' | 'tweed' | 'military' | 'wine';
  colors: {
    skin: string;
    torso: string;
    legs: string;
    detail: string;
  };
  scale: number;
}

export interface MoveData {
  name: string;
  damage: number;
  meterGain: number;
  startup: number;
  active: number;
  recovery: number;
  hitStun: number;
  rangeX: number;
  rangeY: number;
  type: 'high' | 'mid' | 'low';
  knockback: number;
  isProjectile?: boolean;
  isGrab?: boolean;
  selfDamage?: number;
}

export interface BloodSplatter {
  id: number;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  isSpark?: boolean;
}

export interface DialogueLine {
    speaker: string;
    text: string;
}

export interface ScenarioActor {
    characterId: string;
    position: 'left' | 'right' | 'center';
    action: ActionState;
    direction: 1 | -1;
    isFake?: boolean; 
}

export interface Scenario {
    id: string;
    title: string;
    backgroundClass: string;
    dialogue: DialogueLine[];
    actors: ScenarioActor[];
    propName?: string; 
}

export interface BattleState {
  player: FighterState;
  enemy: FighterState;
  timer: number;
  round: number;
  log: string[];
  winner: 'player' | 'enemy' | null;
  bloodSplatters: BloodSplatter[];
  spectacleActive: boolean; // Matrix mode
  projectorHp: number; // Boss objective
}
