import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import NinjaRenderer from './NinjaRenderer';
import StatBar from './StatBar';
import DamageNumber from './DamageNumber';
import { SCENARIOS, LOSE_SCENARIOS, ROUND_START_TEXT, type Scenario, type ScenarioActor } from './narrative';
import Fatality from './Fatality';
import { STAGES, CHARACTER_DATA, MAX_HP, MAX_METER, MOVE_SPEED, GRAVITY, JUMP_FORCE, STAGE_LEFT_BOUND, STAGE_RIGHT_BOUND } from './assets';
import type { ActionType, MoveData } from './assets';
import audioManager, { initializeAudio } from './audioManager';

// Randomly select a stage
const STAGE_LIST = Object.values(STAGES);
const RANDOM_STAGE = STAGE_LIST[Math.floor(Math.random() * STAGE_LIST.length)];
const BLOOD_SPRITES = [
  "/assets/props/effects/blood/2025/blood5_04.png",
  "/assets/props/effects/blood/2025/blood5_05.png",
  "/assets/props/effects/blood/2025/blood5_06.png",
  "/assets/props/effects/blood/2025/blood5_07.png",
  "/assets/props/effects/blood/2025/blood5_10.png",
  "/assets/props/effects/blood/2025/blood5_11.png"
];
const SPARK_SPRITES = [
  "/assets/props/effects/fire01.png",
  "/assets/props/effects/fire02.png",
  "/assets/props/effects/fire03.png"
];
const SMOKE_SPRITES = [
  "/assets/props/effects/smoke01.gif",
  "/assets/props/effects/smoke02.png",
  "/assets/props/effects/smoke03.png"
];
const BLOCK_SPARK_SPRITES = [
  "/assets/props/effects/explosion01.png",
  "/assets/props/effects/explosion02.png",
  "/assets/props/effects/explosion03.png"
];
const PROJECTILE_SPRITES: Record<string, string> = {
  khayati: "/assets/liukang/sprites/special/book-sprites.png", // Pamphlet sprite sheet
  bureaucrat: "/assets/props/finalities/bureaucrat-finality-paperwork.png",
  professor: "/assets/props/finalities/professor-finality-paper.png",
  maoist: "/assets/props/finalities/little-red-book.png",
  debord: "/assets/props/finalities/film-strip-finality.png"
};
// Default combo labels used if a character has no specific comboTitles
const COMBO_TEXT_MAP: Record<number, string> = {
  3: "NICE!",
  5: "BRUTAL!",
  7: "SAVAGE!",
  10: "DEVASTATING!",
  15: "LEGENDARY!"
};
const STORY_BACKGROUNDS = [
  "/assets/backgrounds/versus.png",
  "/assets/backgrounds/buyin.png",
  "/assets/backgrounds/blueportal.png",
  "/assets/backgrounds/orangeportal.png"
];
// Hurtbox sizes roughly matched to visible sprite footprint
const HURTBOX_SIZES: Record<string, { width: number; height: number }> = {
  khayati: { width: 200, height: 450 },
  bureaucrat: { width: 200, height: 460 },
  professor: { width: 200, height: 450 },
  maoist: { width: 200, height: 430 },
  debord: { width: 200, height: 460 }
};
const CABINET_MAX_HP = 400;
const DEBUG_LOG = true;
const dbg = (...args: unknown[]) => {
  if (!DEBUG_LOG) return;
  // Drop spammy frame logs when actors are idling/walking
  const payload = (args[1] ?? args[0]) as any;
  const action = payload?.action;
  if (action && (action === 'IDLE' || action?.includes('WALK'))) return;
  console.log('[CRITIQUE]', ...args);
};
const STAGE_MAP: Record<string, string> = {
  bureaucrat: STAGES.scorpionsLair,
  professor: STAGES.scislacBusorez,
  maoist: STAGES.jadesDesert,
  debord: STAGES.rooftop
};
const BANNER_TEXT: Record<string, string> = {
  bureaucrat: 'Disciplinary Hearing',
  professor: 'Tenure Review',
  maoist: 'Sectarian Split',
  debord: 'The Spectacle'
};

const styleDefault = { power: 1, speed: 1, defense: 1 };
const getStyleModifiers = (fighter: FighterState) => {
  const idx = fighter.styleIndex || 0;
  switch (fighter.id) {
    case 'khayati':
      return idx === 1 ? { power: 1.1, speed: 1.05, defense: 0.95 } : styleDefault;
    case 'bureaucrat':
      return idx === 1 ? { power: 1.2, speed: 0.9, defense: 1.1 } : styleDefault;
    case 'professor':
      return idx === 1 ? { power: 0.9, speed: 1.1, defense: 1 } : styleDefault;
    case 'maoist':
      return idx === 1 ? { power: 1.1, speed: 1.05, defense: 0.9 } : styleDefault;
    case 'debord':
      return idx === 1 ? { power: 1.2, speed: 1.0, defense: 1.1 } : styleDefault;
    default:
      return styleDefault;
  }
};

interface FighterState {
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

interface BloodEffectData {
  id: string;
  x: number;
  y: number;
  src: string;
}

interface SparkEffectData {
  id: string;
  x: number;
  y: number;
  src: string;
}

interface SmokeEffectData {
  id: string;
  x: number;
  y: number;
  src: string;
}

interface DamageNumberData {
  id: string;
  damage: number;
  x: number;
  y: number;
  isBlocked: boolean;
}

interface ComboTextData {
  id: string;
  text: string;
  x: number;
  y: number;
}

interface Projectile {
  id: string;
  ownerId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  sprite: string;
  damage: number;
  gravity?: number;
  pierce?: boolean;
  frame?: number;
  totalFrames?: number;
  frameWidth?: number;
  frameHeight?: number;
  sheetWidth?: number;
  sheetHeight?: number;
  scale?: number;
}

type GameState = 'TITLE' | 'CHAR_SELECT' | 'INTRO_CUTSCENE' | 'FIGHTING' | 'ROUND_START' | 'ROUND_END' | 'FINISH_HIM' | 'GAME_OVER' | 'BONUS_STAGE' | 'LOSE_CUTSCENE';

function App() {
  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [timer, setTimer] = useState(99);
  const [message, setMessage] = useState('');
  const [currentScenario, setCurrentScenario] = useState<Scenario>(() => {
    const keys = Object.keys(SCENARIOS);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return SCENARIOS[randomKey] || SCENARIOS['khayati_vs_bureaucrat'];
  });
  const [cutsceneIndex, setCutsceneIndex] = useState(0);
  const [bloodEffects, setBloodEffects] = useState<BloodEffectData[]>([]);
  const [sparkEffects, setSparkEffects] = useState<SparkEffectData[]>([]);
  const [smokeEffects, setSmokeEffects] = useState<SmokeEffectData[]>([]);
  const [damageNumbers, setDamageNumbers] = useState<DamageNumberData[]>([]);
  const [comboTexts, setComboTexts] = useState<ComboTextData[]>([]);
  const [finishTimer, setFinishTimer] = useState(0); // Frames while in FINISH_HIM
  const [fatalityTriggered, setFatalityTriggered] = useState(false);
  const [ladderIndex, setLadderIndex] = useState(0);
  const [lastWinner, setLastWinner] = useState<'player' | 'enemy' | null>(null);
  const [stageBg, setStageBg] = useState<string>(RANDOM_STAGE);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [unlockedDebord, setUnlockedDebord] = useState(false);
  const [stageBanner, setStageBanner] = useState<string>('');
  const [toasty, setToasty] = useState(false);
  const [toastyPopup, setToastyPopup] = useState(false);
  const [toastyKey, setToastyKey] = useState(0); // force re-render to restart animation
  const [cabinetHp, setCabinetHp] = useState(CABINET_MAX_HP);
  // Cabinet positioned center-left of stage for bonus stage
  const [cabinetX] = useState(1150);
  const [pendingOpponent, setPendingOpponent] = useState<keyof typeof CHARACTER_DATA | null>(null);
  const [currentOpponentId, setCurrentOpponentId] = useState<keyof typeof CHARACTER_DATA>('bureaucrat');
  const [fatalityVictim, setFatalityVictim] = useState<string | null>(null);
  const [hitstopFrames, setHitstopFrames] = useState(0); // Freeze game on hit
  const [screenShake, setScreenShake] = useState({ x: 0, y: 0 }); // Screen shake offset
  const fatalityActiveRef = useRef(false);
  const bonusHitLock = useRef<{ action: ActionType | null } | null>(null); // Prevent multi-hit per swing in bonus stage
  const rootRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<FighterState | null>(null);
  const enemyRef = useRef<FighterState | null>(null);
  const selectedPlayerRef = useRef<keyof typeof CHARACTER_DATA>('khayati');
  // Prevent multiple hits from the same attack state
  const lastHitAction = useRef<{ player: ActionType | null; enemy: ActionType | null }>({ player: null, enemy: null });
  const toastyTimers = useRef<{ text?: number; popup?: number }>({});

  // Initialize audio on mount
  useEffect(() => {
    initializeAudio();
    return () => {
      audioManager.dispose();
    };
  }, []);

  useEffect(() => {
    fatalityActiveRef.current = fatalityTriggered;
  }, [fatalityTriggered]);

  const [player, setPlayer] = useState<FighterState>({
    id: 'khayati',
    x: 1000,
    y: 0,
    velocityX: 0,
    velocityY: 0,
    hp: MAX_HP,
    meter: 0,
    action: 'IDLE',
    actionFrame: 0,
    facingLeft: false,
    roundsWon: 0,
    comboCount: 0,
    isBlocking: false,
    stunFrames: 0,
    spectacleMode: false,
    spectacleFrames: 0,
    styleIndex: 0
  });

  const [enemy, setEnemy] = useState<FighterState>({
    id: 'bureaucrat',
    x: 1400,
    y: 0,
    velocityX: 0,
    velocityY: 0,
    hp: MAX_HP,
    meter: 0,
    action: 'IDLE',
    actionFrame: 0,
    facingLeft: true,
    roundsWon: 0,
    comboCount: 0,
    isBlocking: false,
    stunFrames: 0,
    spectacleMode: false,
    spectacleFrames: 0,
    styleIndex: 0
  });
  // Initialize refs once state is created
  if (!playerRef.current) playerRef.current = player;
  if (!enemyRef.current) enemyRef.current = enemy;

  const aiThinkTimer = useRef(0);
  const [selectedPlayerId, setSelectedPlayerId] = useState<keyof typeof CHARACTER_DATA>('khayati');

  const BASE_LADDER: (keyof typeof CHARACTER_DATA)[] = ['bureaucrat', 'professor', 'maoist']; // Debord becomes final boss
  const [ladderOrder, setLadderOrder] = useState<(keyof typeof CHARACTER_DATA)[]>(BASE_LADDER);

  // Roster for select screen (debord unlock gates his slot)
  const roster = useMemo(
    () => (Object.keys(CHARACTER_DATA) as (keyof typeof CHARACTER_DATA)[]).filter(id => id !== 'debord' || unlockedDebord),
    [unlockedDebord]
  );

  // Keep ref in sync with selection state
  useEffect(() => {
    selectedPlayerRef.current = selectedPlayerId;
  }, [selectedPlayerId]);

  const handleCharSelectNav = useCallback((dir: 'left' | 'right' | 'up' | 'down') => {
    console.log('🎯 handleCharSelectNav called', { dir, currentSelected: selectedPlayerId, roster });
    const cols = 2; // simple grid navigation
    const idx = roster.indexOf(selectedPlayerId);
    console.log('📍 Current index:', idx);
    if (idx === -1) {
      console.log('⚠️ selectedPlayerId not found in roster!');
      return;
    }
    let nextIdx = idx;
    if (dir === 'left') nextIdx = (idx - 1 + roster.length) % roster.length;
    if (dir === 'right') nextIdx = (idx + 1) % roster.length;
    if (dir === 'up') nextIdx = (idx - cols + roster.length) % roster.length;
    if (dir === 'down') nextIdx = (idx + cols) % roster.length;
    const nextId = roster[nextIdx] || selectedPlayerId;
    console.log('✨ Setting selectedPlayerId to:', nextId);
    selectedPlayerRef.current = nextId;
    setSelectedPlayerId(nextId);
    audioManager.play('menuMove', { volume: 0.7 });
  }, [roster, selectedPlayerId]);

  const keysPressed = useRef<Set<string>>(new Set());
  // Attack taps are captured on keydown (no repeat) and consumed once per update
  const attackTaps = useRef<Set<string>>(new Set());
  const inputBuffer = useRef<string[]>([]);

  // Get character data
  const playerData = CHARACTER_DATA[player.id];
  const enemyData = CHARACTER_DATA[enemy.id];

  const selectScenario = (pId: string, eId: string): Scenario => {
    const key = `${pId}_vs_${eId}`;
    if (SCENARIOS[key]) return SCENARIOS[key];
    // Fallback: synthesize a minimal scenario so player/enemy stay correct
    return {
      id: key,
      title: 'THE CHALLENGE',
      backgroundClass: 'bg-black',
      actors: [
        { characterId: pId as keyof typeof CHARACTER_DATA, position: 'left', action: 'IDLE', direction: 1 },
        { characterId: eId as keyof typeof CHARACTER_DATA, position: 'right', action: 'IDLE', direction: -1 }
      ],
      dialogue: [
        { speaker: CHARACTER_DATA[pId]?.name || 'Challenger', text: 'Let’s settle this.' },
        { speaker: CHARACTER_DATA[eId]?.name || 'Opponent', text: 'Prove your critique.' }
      ]
    };
  };

  // Round start countdown
  useEffect(() => {
    // Auto-focus game container so key events register
    const t = setTimeout(() => rootRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, []);

  // Keep preview/player state in sync with current selection during character select
  useEffect(() => {
    if (gameState !== 'CHAR_SELECT') return;
    setPlayer(prev => ({
      ...prev,
      id: selectedPlayerId,
      action: 'IDLE',
      actionFrame: 0,
      comboCount: 0,
      roundsWon: 0
    }));
  }, [gameState, selectedPlayerId]);

  useEffect(() => {
    if (gameState === 'ROUND_START') {
      // Show full Situationist round intro: THESIS > ANTITHESIS > SYNTHESIZE!
      setMessage(ROUND_START_TEXT[0]);
      audioManager.play('roundStart', { volume: 0.5 });
      const t1 = setTimeout(() => setMessage(ROUND_START_TEXT[1] || 'ANTITHESIS...'), 800);
      const t2 = setTimeout(() => setMessage(ROUND_START_TEXT[2] || 'SYNTHESIZE!'), 1600);
      const t3 = setTimeout(() => {
        setGameState('FIGHTING');
        setMessage('');
        // Start arena music when fighting begins
        const arenaMusics = ['arenaMusic1', 'arenaMusic2', 'arenaMusic3', 'arenaMusic4', 'arenaMusic5'];
        const randomMusic = arenaMusics[Math.floor(Math.random() * arenaMusics.length)];
        audioManager.playMusic(randomMusic, 0.4);
      }, 2400);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [gameState]);

  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  useEffect(() => {
    enemyRef.current = enemy;
  }, [enemy]);

  // Timer countdown
  useEffect(() => {
    if (gameState === 'FIGHTING') {
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 0) {
            handleTimeOver();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState]);

  // Game loop - 60fps
  useEffect(() => {
    const interval = setInterval(() => {
      // Handle hitstop countdown
      if (hitstopFrames > 0) {
        setHitstopFrames(prev => prev - 1);
        return; // Don't update game during hitstop
      }

      // Decay screen shake
      if (screenShake.x !== 0 || screenShake.y !== 0) {
        setScreenShake({
          x: screenShake.x * 0.8,
          y: screenShake.y * 0.8
        });
        if (Math.abs(screenShake.x) < 0.5 && Math.abs(screenShake.y) < 0.5) {
          setScreenShake({ x: 0, y: 0 });
        }
      }

      if (gameState === 'FIGHTING' || gameState === 'BONUS_STAGE' || gameState === 'FINISH_HIM') {
        updateGame();
      }
      if (gameState === 'FINISH_HIM') {
        setFinishTimer(prev => Math.max(0, prev - 1));
      }
    }, 16);

    return () => clearInterval(interval);
  }, [gameState, hitstopFrames]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      dbg('KEYDOWN', { key: e.key, gameState });
      if (gameState === 'TITLE' && e.key === 'Enter') {
        setGameState('CHAR_SELECT');
        return;
      }
      if ((gameState === 'INTRO_CUTSCENE' || gameState === 'LOSE_CUTSCENE') && e.key === 'Enter') {
        advanceCutscene();
        return;
      }
      if (gameState === 'CHAR_SELECT' && e.key === 'Enter') {
        console.log('⌨️ Enter pressed on char select', { selectedPlayerId, selectedPlayerRef: selectedPlayerRef.current });
        beginLadder(selectedPlayerRef.current);
        return;
      }

      // Allow inputs during fighting, bonus, and finish windows
      if (!(gameState === 'FIGHTING' || gameState === 'BONUS_STAGE' || gameState === 'FINISH_HIM')) return;
      const attackKey = ['j', 'k', 'l', 'i'].includes(e.key);
      // Ignore key repeat for attack buttons so we only queue one attack per tap
      if (attackKey && e.repeat) return;

      const alreadyHeld = keysPressed.current.has(e.key);
      keysPressed.current.add(e.key);

      // Only enqueue an attack when the key transitions from up -> down
      if (attackKey && !alreadyHeld) {
        let firedImmediate = false;
        // Fire the animation immediately so we don't wait a frame to see the punch/kick
        setPlayer(prev => {
          const next = { ...prev };
          // During FINISH_HIM, don't fire attacks immediately - let handlePlayerInput handle it
          if (gameState === 'FINISH_HIM') {
            return next; // Don't fire immediate attacks during FINISH_HIM
          }
          // Only override if player can currently act
          const canAct = (gameState === 'FIGHTING' || gameState === 'BONUS_STAGE') && next.stunFrames === 0;
          if (!canAct || isAttacking(next)) return next;

          const isCrouching = keysPressed.current.has('ArrowDown') && next.y === 0;
          const airborne = next.y > 0;

          if (airborne) {
            if (e.key === 'j') performAttack(next, 'JUMP_ATTACK_P');
            else if (e.key === 'l') performAttack(next, 'JUMP_ATTACK_K');
          } else if (isCrouching) {
            if (e.key === 'j') performAttack(next, 'CROUCH_ATTACK_P');
            else if (e.key === 'l') performAttack(next, 'CROUCH_ATTACK_K');
          } else {
            if (e.key === 'j') performAttack(next, 'ATTACK_LP');
            else if (e.key === 'k') performAttack(next, 'ATTACK_RP');
            else if (e.key === 'l') performAttack(next, 'ATTACK_LK');
            else if (e.key === 'i') performAttack(next, 'ATTACK_RK');
          }
          firedImmediate = true;
          return next;
        });
        // Only queue the tap if nothing fired immediately (e.g., stunned)
        if (!firedImmediate) {
          attackTaps.current.add(e.key);
        } else {
          attackTaps.current.delete(e.key);
        }
      }

      // Add to input buffer for special moves
      if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
        const direction = e.key.replace('Arrow', '').toUpperCase();
        inputBuffer.current.push(direction);
        if (inputBuffer.current.length > 8) inputBuffer.current.shift();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
      dbg('KEYUP', { key: e.key, size: keysPressed.current.size, gameState });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Character select navigation via arrow keys
  useEffect(() => {
    if (gameState !== 'CHAR_SELECT') return;
    const onKey = (e: KeyboardEvent) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
      e.preventDefault();
      const map: Record<string, 'left' | 'right' | 'up' | 'down'> = {
        ArrowLeft: 'left',
        ArrowRight: 'right',
        ArrowUp: 'up',
        ArrowDown: 'down'
      };
      handleCharSelectNav(map[e.key]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [gameState, roster, handleCharSelectNav]);

  // Character select navigation via arrow keys
  useEffect(() => {
    if (gameState !== 'CHAR_SELECT') return;
    const onKey = (e: KeyboardEvent) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
      e.preventDefault();
      const map: Record<string, 'left' | 'right' | 'up' | 'down'> = {
        ArrowLeft: 'left',
        ArrowRight: 'right',
        ArrowUp: 'up',
        ArrowDown: 'down'
      };
      handleCharSelectNav(map[e.key]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [gameState, roster, selectedPlayerId]);

  const startRoundFromScenario = (scenarioOverride?: Scenario) => {
    const scenario = scenarioOverride || currentScenario;
    // Prefer tracked opponent to avoid scenario mismatch
    const scenarioEnemy = scenario.actors.find((a: ScenarioActor) => a.position === 'right') ?? scenario.actors[1];

    // ALWAYS use latest selected player id
    const rawPlayerId = selectedPlayerRef.current || selectedPlayerId || player.id;
    const rawEnemyId = currentOpponentId || scenarioEnemy?.characterId || enemy.id;

    console.log('🎬 START ROUND FROM SCENARIO', {
      selectedPlayerRef: selectedPlayerRef.current,
      selectedPlayerId,
      playerId_current: player.id,
      rawPlayerId,
      currentOpponentId,
      scenarioEnemyId: scenarioEnemy?.characterId,
      enemyId_current: enemy.id,
      rawEnemyId
    });

    const playerId = CHARACTER_DATA[rawPlayerId] ? rawPlayerId : 'khayati';
    const enemyId = CHARACTER_DATA[rawEnemyId] ? rawEnemyId : 'bureaucrat';

    console.log('✅ FINAL IDs:', { playerId, enemyId });

    const mappedStage = STAGE_MAP[enemyId];
    const randomStage = STAGE_LIST[Math.floor(Math.random() * STAGE_LIST.length)];
    setStageBg(mappedStage || randomStage);
    setStageBanner(BANNER_TEXT[enemyId] || 'FIGHT!');

    // Clear any lingering fatality state
    setFatalityVictim(null);
    fatalityActiveRef.current = false;

    setPlayer(prev => ({
      ...prev,
      id: playerId,
      x: 1000,
      y: 0,
      velocityX: 0,
      velocityY: 0,
      hp: MAX_HP,
      meter: 0,
      action: 'IDLE',
      actionFrame: 0,
      facingLeft: false,
      roundsWon: 0,
      comboCount: 0,
      isBlocking: false,
      stunFrames: 0,
      spectacleMode: false,
      spectacleFrames: 0,
      styleIndex: 0
    }));

    setEnemy(prev => ({
      ...prev,
      id: enemyId,
      x: 1400,
      y: 0,
      velocityX: 0,
      velocityY: 0,
      hp: MAX_HP,
      meter: 0,
      action: 'IDLE',
      actionFrame: 0,
      facingLeft: true,
      roundsWon: 0,
      comboCount: 0,
      isBlocking: false,
      stunFrames: 0,
      spectacleMode: false,
      spectacleFrames: 0,
      styleIndex: 0
    }));

    setMessage(ROUND_START_TEXT[0]);
    setTimer(99);
    setCutsceneIndex(0);
    setGameState('ROUND_START');
  };

  // Stable callback for fatality completion to prevent component remounting
  const handleFatalityComplete = useCallback(() => {
    console.log('✅ Fatality onComplete called');
    console.log('📋 Current ladderOrder:', ladderOrder);
    setFatalityVictim(null);

    // Use functional setState to get current values
    setLadderIndex(currentIndex => {
      const nextIndex = currentIndex + 1;
      console.log('🎯 Advancing ladder:', {
        currentIndex,
        nextIndex,
        ladderOrder: ladderOrder,
        ladderOrderLength: ladderOrder.length,
        nextEnemy: ladderOrder[nextIndex]
      });

      if (nextIndex >= ladderOrder.length) {
        console.log('🏁 Ladder complete!');
        setMessage('YOU ARE THE SITUATION');
        setGameState('GAME_OVER');
        setUnlockedDebord(true);
        return currentIndex;
      }

      // Trigger bonus stage after second fight
      if (nextIndex === 2) {
        console.log('🎰 Triggering bonus stage');
        setPendingOpponent(ladderOrder[nextIndex]);
        setCabinetHp(CABINET_MAX_HP);
        setStageBg("/assets/mklk/cabinet_umk3.png");
        setMessage('SMASH THE COMMODITY');
        setGameState('BONUS_STAGE');
        setPlayer(prev => ({ ...prev, x: 900, y: 0, velocityX: 0, velocityY: 0 }));
        return nextIndex;
      }

      const nextEnemy = ladderOrder[nextIndex];
      console.log('👤 Setting next opponent:', nextEnemy);
      setCurrentOpponentId(nextEnemy);
      const scenario = selectScenario(player.id, nextEnemy);
      setCurrentScenario(scenario);
      setLastWinner(null);
      setFatalityTriggered(false);

      // Reset rounds won for new match
      setPlayer(prev => ({ ...prev, roundsWon: 0, hp: MAX_HP, meter: 0 }));
      setEnemy(prev => ({ ...prev, roundsWon: 0, hp: MAX_HP, meter: 0 }));

      setGameState('INTRO_CUTSCENE');
      setCutsceneIndex(0);

      return nextIndex;
    });
  }, [ladderOrder, player.id]);

  const beginLadder = (playerId: keyof typeof CHARACTER_DATA) => {
    console.log('🎮 BEGIN LADDER CALLED', { playerId, BASE_LADDER, unlockedDebord });
    const baseList = (unlockedDebord ? [...BASE_LADDER, 'debord'] : BASE_LADDER);
    console.log('📋 Base list:', baseList);
    const opponents = baseList.filter(id => id !== playerId);
    // Always append debord as final boss (if not already in list)
    const opponentsWithBoss = opponents.includes('debord') ? opponents : [...opponents, 'debord'];
    console.log('🥊 Opponents (THIS IS ladderOrder):', opponentsWithBoss, 'length:', opponentsWithBoss.length);
    const opponentId = opponentsWithBoss[0] || 'debord';
    console.log('👤 First opponent:', opponentId);
    selectedPlayerRef.current = playerId;
    setSelectedPlayerId(playerId);
    setLadderOrder(opponentsWithBoss);
    setLadderIndex(0);
    setCurrentOpponentId(opponentId);
    console.log('✅ Set player to:', playerId, 'first opponent:', opponentId);

    // Clear any lingering fatality state from previous matches
    setFatalityVictim(null);
    fatalityActiveRef.current = false;

    // Immediately set player/enemy IDs so the intro and first round use the selection
    setPlayer(prev => ({
      ...prev,
      id: playerId,
      x: 850,
      y: 0,
      velocityX: 0,
      velocityY: 0,
      hp: MAX_HP,
      meter: 0,
      action: 'IDLE',
      actionFrame: 0,
      facingLeft: false,
      roundsWon: 0,
      comboCount: 0,
      isBlocking: false,
      stunFrames: 0,
      spectacleMode: false,
      spectacleFrames: 0,
      styleIndex: 0
    }));

    setEnemy(prev => ({
      ...prev,
      id: opponentId,
      x: 1250,
      y: 0,
      velocityX: 0,
      velocityY: 0,
      hp: MAX_HP,
      meter: 0,
      action: 'IDLE',
      actionFrame: 0,
      facingLeft: true,
      roundsWon: 0,
      comboCount: 0,
      isBlocking: false,
      stunFrames: 0,
      spectacleMode: false,
      spectacleFrames: 0,
      styleIndex: 0
    }));

    const scenario = selectScenario(playerId, opponentId);
    setCurrentScenario(scenario);
    setGameState('INTRO_CUTSCENE');
    setCutsceneIndex(0);
  };

  const advanceLadder = () => {
    const nextIndex = ladderIndex + 1;
    if (nextIndex >= ladderOrder.length) {
      setMessage('YOU ARE THE SITUATION');
      setGameState('GAME_OVER');
      setUnlockedDebord(true);
      // After beating Debord, unlock and return to select
      setTimeout(() => {
        setGameState('CHAR_SELECT');
      }, 5000);
      return;
    }
    // Trigger bonus stage after second fight
    if (nextIndex === 2) {
      setPendingOpponent(ladderOrder[nextIndex]);
      setCabinetHp(CABINET_MAX_HP);
      setStageBg("/assets/mklk/cabinet_umk3.png");
      setMessage('SMASH THE COMMODITY');
      setGameState('BONUS_STAGE');
      // Reset player position for bonus
      setPlayer(prev => ({ ...prev, x: 900, y: 0, velocityX: 0, velocityY: 0 }));
      return;
    }
    setLadderIndex(nextIndex);
    const nextEnemy = ladderOrder[nextIndex];
    setCurrentOpponentId(nextEnemy);
    const scenario = selectScenario(player.id, nextEnemy);
    setCurrentScenario(scenario);
    setLastWinner(null);
    setFatalityTriggered(false);
    setGameState('INTRO_CUTSCENE');
    setCutsceneIndex(0);
  };

  const advanceCutscene = () => {
    if (!currentScenario) return;
    const lastIdx = Math.max(0, currentScenario.dialogue.length - 1);
    if (cutsceneIndex >= lastIdx) {
      // Clamp and start the round if we've reached or exceeded the final line
      setCutsceneIndex(lastIdx);
      startRoundFromScenario();
      return;
    }
    setCutsceneIndex(prev => Math.min(lastIdx, prev + 1));
  };

  const updateGame = () => {
    if (gameState === 'BONUS_STAGE') {
      const startPlayer = playerRef.current || player;
      const nextPlayer = updateFighter(startPlayer, true);
      playerRef.current = nextPlayer;
      setPlayer(nextPlayer);
      handleBonusStageHits(nextPlayer);
      updateProjectiles(nextPlayer, enemyRef.current || enemy);
      handleBonusProjectiles();
      return;
    }
    const startPlayer = playerRef.current || player;
    const startEnemy = enemyRef.current || enemy;
    const nextPlayer = updateFighter(startPlayer, true);
    const nextEnemy = updateFighter(startEnemy, false);
    playerRef.current = nextPlayer;
    enemyRef.current = nextEnemy;
    if (!isAttacking(nextPlayer)) lastHitAction.current.player = null;
    if (!isAttacking(nextEnemy)) lastHitAction.current.enemy = null;
    setPlayer(nextPlayer);
    setEnemy(nextEnemy);
    checkCollisions(nextPlayer, nextEnemy);
    updateProjectiles(nextPlayer, nextEnemy);
  };

  const updateProjectiles = (currentPlayer = player, currentEnemy = enemy) => {
    setProjectiles(prev => prev
      .map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + (p.vy || 0),
        vy: p.vy !== undefined && p.gravity ? p.vy + p.gravity : p.vy,
        frame: p.totalFrames ? ((p.frame ?? 0) + 1) % p.totalFrames : p.frame
      }))
      .filter(p => p.x > STAGE_LEFT_BOUND && p.x < STAGE_RIGHT_BOUND && p.y > 0 && p.y < 800));

    setProjectiles(prev => {
      const remaining: Projectile[] = [];
      prev.forEach(p => {
        // Bonus stage cabinet target
        if (gameState === 'BONUS_STAGE' && p.ownerId === currentPlayer.id) {
          const cabinetLeft = cabinetX - 220;
          const cabinetRight = cabinetX + 220;
          const cabinetBottom = 80;
          const cabinetTop = 620;
          const inX = p.x >= cabinetLeft && p.x <= cabinetRight;
          const inY = p.y >= cabinetBottom && p.y <= cabinetTop;
          if (inX && inY) {
            dbg('Bonus projectile hit', { projX: p.x, projY: p.y, damage: p.damage, cabinetHp, projId: p.id });
            spawnSparkEffect(cabinetX, 200, true);
            setMessage('COMMODITY DAMAGED');
            setTimeout(() => setMessage(''), 400);
            setCabinetHp(hp => {
              const newHp = Math.max(0, hp - p.damage);
              if (newHp <= 0) {
                dbg('Cabinet destroyed by projectile');
                setMessage('COMMODITY-FORM DEMYSTIFIED');
                setTimeout(() => {
                  const nextEnemy = pendingOpponent || 'maoist';
                  console.log('🎰 Bonus stage complete! Next enemy:', nextEnemy);
                  setCurrentOpponentId(nextEnemy);
                  setLadderIndex(2);
                  const scenario = selectScenario(player.id, nextEnemy);
                  setCurrentScenario(scenario);

                  // Reset rounds won for new match
                  setPlayer(prev => ({ ...prev, roundsWon: 0, hp: MAX_HP, meter: 0 }));
                  setEnemy(prev => ({ ...prev, roundsWon: 0, hp: MAX_HP, meter: 0 }));

                  setGameState('INTRO_CUTSCENE');
                  setCutsceneIndex(0);
                  setPendingOpponent(null);
                }, 4000);
              }
              return newHp;
            });
            return; // consume projectile
          } else {
            dbg('Bonus projectile miss', { projX: p.x, projY: p.y, inX, inY, cabinetLeft, cabinetRight, cabinetTop, cabinetBottom, projId: p.id });
          }
        }

        const targetState = p.ownerId === currentPlayer.id ? currentEnemy : currentPlayer;
        const distance = Math.abs(p.x - targetState.x);
        const vertical = Math.abs((80 + targetState.y + 120) - p.y); // center mass
        const facingOk = p.vx < 0 ? p.x >= targetState.x : p.x <= targetState.x;

        if (distance < 90 && vertical < 140 && facingOk) {
          // Apply projectile hit
          const moveStub: MoveData = {
            name: 'Projectile',
            damage: p.damage,
            meterGain: 5,
            startup: 0,
            active: 1,
            recovery: 0,
            hitStun: 12,
            rangeX: 0,
            rangeY: 0,
            type: 'mid',
            knockback: 10
          };
          if (p.ownerId === player.id) applyHit(player, enemy, moveStub, true);
          else applyHit(enemy, player, moveStub, false);
        } else {
          remaining.push(p);
        }
      });
      return remaining;
    });
  };

  const handleBonusStageHits = (fighterState: FighterState = player) => {
    // Cabinet hurtbox
    const cabinetLeft = cabinetX - 220;
    const cabinetRight = cabinetX + 220;
    const cabinetBottom = 80;
    const cabinetTop = 620; // generous height to match sprite

    let playerMove = getMoveData(fighterState);
    const isAttackingState = fighterState.action.includes('ATTACK') || fighterState.action.includes('SPECIAL');
    if (!playerMove && isAttackingState) {
      // Fallback generic move for bonus stage so every swing counts
      playerMove = {
        name: 'BonusSwing',
        damage: 8,
        meterGain: 0,
        startup: 0,
        active: 10,
        recovery: 5,
        hitStun: 0,
        rangeX: 240,
        rangeY: 320,
        type: 'mid',
        knockback: 0
      } as MoveData;
    }
    // In bonus stage we allow any attack state to be "active" so cabinet always registers hits
    const active = playerMove && (isAttackingState || isInActiveFrames(fighterState, playerMove));

    // Reset lock when not attacking
    if (!isAttackingState) {
      bonusHitLock.current = null;
    }

    if (isAttackingState) {
      dbg('Bonus stage attack check:', {
        action: fighterState.action,
        hasMove: !!playerMove,
        active,
        playerX: fighterState.x,
        playerY: fighterState.y,
        cabinetX,
        cabinetLeft,
        cabinetRight,
        cabinetTop,
        cabinetBottom,
        moveRangeX: playerMove?.rangeX,
        moveRangeY: playerMove?.rangeY
      });
      audioManager.play('hitLight', { volume: 0.25 });
    }

    if (playerMove && active) {
      const hitLeft = fighterState.x - playerMove.rangeX / 2;
      const hitRight = fighterState.x + playerMove.rangeX / 2;
      const hitBottom = 80 + fighterState.y;
      const hitTop = hitBottom + Math.max(playerMove.rangeY, 220); // widen vertical for cabinet

      const overlaps =
        hitRight >= cabinetLeft &&
        hitLeft <= cabinetRight &&
        hitTop >= cabinetBottom &&
        hitBottom <= cabinetTop;

      const alreadyHitThisAction = bonusHitLock.current?.action === fighterState.action;

      if (overlaps && !alreadyHitThisAction) {
        bonusHitLock.current = { action: fighterState.action };
        dbg('Bonus hit', { hitLeft, hitRight, hitTop, hitBottom, cabinetHp, damage: playerMove.damage, action: fighterState.action, frame: fighterState.actionFrame });
        spawnSparkEffect(cabinetX, 200, true);
        setMessage('COMMODITY DAMAGED');
        setTimeout(() => setMessage(''), 400);
        setCabinetHp(hp => {
          const newHp = Math.max(0, hp - playerMove.damage);
          if (newHp <= 0) {
            dbg('Cabinet destroyed');
            setMessage('COMMODITY-FORM DEMYSTIFIED');
            setTimeout(() => {
              const nextEnemy = pendingOpponent || 'maoist';
              console.log('🎰 Bonus stage complete! Next enemy:', nextEnemy);
              setCurrentOpponentId(nextEnemy);
              setLadderIndex(2);
              const scenario = selectScenario(player.id, nextEnemy);
              setCurrentScenario(scenario);

              // Reset rounds won for new match
              setPlayer(prev => ({ ...prev, roundsWon: 0, hp: MAX_HP, meter: 0 }));
              setEnemy(prev => ({ ...prev, roundsWon: 0, hp: MAX_HP, meter: 0 }));

              setGameState('INTRO_CUTSCENE');
              setCutsceneIndex(0);
              setPendingOpponent(null);
            }, 4000);
          }
          return newHp;
        });
      } else if (isAttackingState) {
        dbg('Bonus miss', {
          hitLeft, hitRight, hitTop, hitBottom,
          cabinetLeft, cabinetRight, cabinetTop, cabinetBottom
        });
      }
    }
  };

  // Handle projectiles hitting cabinet in bonus stage
  const handleBonusProjectiles = () => {
    // This logic is now folded into updateProjectiles; kept as a stub for clarity / future expansion
    return;
  };

  const updateFighter = (fighter: FighterState, isPlayer: boolean): FighterState => {
    let newState = { ...fighter };

    // Lock loser in dizzy during FINISH_HIM
    if (!isPlayer && gameState === 'FINISH_HIM') {
      newState.action = 'DIZZY';
      newState.stunFrames = 999;
      newState.velocityX = 0;
      newState.velocityY = 0;
    }

    // Update action frame
    newState.actionFrame++;

    // Handle Spectacle Mode countdown
    if (newState.spectacleMode) {
      newState.spectacleFrames--;
      if (newState.spectacleFrames <= 0) {
        newState.spectacleMode = false;
        newState.spectacleFrames = 0;
      }
    }

    // Handle stun (but keep loser frozen during FINISH_HIM)
    if (!(gameState === 'FINISH_HIM' && !isPlayer)) {
      if (newState.stunFrames > 0) {
        newState.stunFrames--;
        if (newState.stunFrames === 0) {
          newState.action = 'IDLE';
          newState.actionFrame = 0;
        }
      }
    }

    // Apply physics
    if (newState.y > 0 || newState.velocityY !== 0) {
      newState.velocityY -= GRAVITY;
      newState.y += newState.velocityY;

      if (newState.y <= 0) {
        newState.y = 0;
        newState.velocityY = 0;

        // Handle landing from knockdown - stay grounded
        if (newState.action === 'KNOCKDOWN') {
          // Character is now on the ground knocked down, they stay stunned
          // The move completion logic will handle transitioning to IDLE
        } else if (newState.action === 'JUMP' || newState.action.includes('JUMP_ATTACK')) {
          newState.action = 'IDLE';
          newState.actionFrame = 0;
        }
      } else if (!isAttacking(newState)) {
        // Keep a clean airborne idle pose while rising/falling if not attacking
        if (newState.action !== 'JUMP' && newState.action !== 'KNOCKDOWN') {
          newState.action = 'JUMP';
          newState.actionFrame = 0;
        }
      }
    }

    // Apply horizontal velocity (knockback)
    if (newState.velocityX !== 0) {
      newState.x += newState.velocityX;
      newState.velocityX *= 0.8; // Friction
      if (Math.abs(newState.velocityX) < 0.1) newState.velocityX = 0;
    }

    // Bounds checking - use stage bounds from assets
    newState.x = Math.max(STAGE_LEFT_BOUND, Math.min(STAGE_RIGHT_BOUND, newState.x));

    // Handle player input; allow control during FINISH_HIM even if previously stunned
    const allowPlayerControl = gameState === 'FINISH_HIM'
      ? true
      : (gameState === 'FIGHTING' || gameState === 'BONUS_STAGE') && newState.stunFrames === 0;

    if (isPlayer) {
      dbg('Player control check:', {
        gameState,
        allowPlayerControl,
        isFinishHim: gameState === 'FINISH_HIM',
        stunFrames: newState.stunFrames,
        action: newState.action
      });
    }

    if (isPlayer && allowPlayerControl) {
      handlePlayerInput(newState);
    } else if (isPlayer) {
      attackTaps.current.clear(); // drop buffered taps if player can't act
    }

    // Handle AI
    if (!isPlayer && gameState === 'FIGHTING' && newState.stunFrames === 0) {
      handleAI(newState);
    }

    // Check move completion
    const moveData = getMoveData(newState);
    const preserveDizzy = gameState === 'FINISH_HIM' && !isPlayer && (newState.action === 'DIZZY' || newState.action === 'DEFEAT');
    // Trim buffer so attacks return to idle promptly
    const animBuffer = moveData && (newState.action.includes('ATTACK') || newState.action.includes('SPECIAL')) ? 2 : 0;
    if (!preserveDizzy && moveData && newState.actionFrame >= moveData.startup + moveData.active + moveData.recovery + animBuffer) {
      newState.action = 'IDLE';
      newState.actionFrame = 0;
    }

    // Update facing direction - only flip when past opponent's center (add small deadzone to prevent jitter)
    const opponent = isPlayer ? enemy : player;
    if (newState.action === 'IDLE' || newState.action.includes('WALK')) {
      const FLIP_DEADZONE = 20; // pixels - prevents flipping at sprite edges
      if (newState.x > opponent.x + FLIP_DEADZONE) {
        newState.facingLeft = true; // I'm to the right, face left
      } else if (newState.x < opponent.x - FLIP_DEADZONE) {
        newState.facingLeft = false; // I'm to the left, face right
      }
      // Within deadzone: keep current facing
    }

    return newState;
  };

  const handleAI = (newState: FighterState) => {
    aiThinkTimer.current++;

    // AI thinks more frequently for better reactions (every 15 frames = 0.25 seconds)
    if (aiThinkTimer.current < 15) return;
    aiThinkTimer.current = 0;

    const distance = Math.abs(newState.x - player.x);
    const playerAbove = player.y > 50; // Player is jumping/airborne

    // Distance ranges for different tactics
    const isVeryFar = distance > 400;
    const isFar = distance > 200 && distance <= 400;
    const isMidRange = distance > 120 && distance <= 200;
    const isClose = distance > 60 && distance <= 120;
    const isVeryClose = distance <= 60;

    // Health-based aggression
    const aiHealthPercent = (newState.hp / MAX_HP) * 100;
    const playerHealthPercent = (player.hp / MAX_HP) * 100;
    const isLosing = aiHealthPercent < playerHealthPercent - 20;
    const isWinning = aiHealthPercent > playerHealthPercent + 20;

    // Meter awareness
    const hasSpecialMeter = newState.meter >= 20;
    const hasFullMeter = newState.meter >= 100;

    const rand = Math.random();

    if (isAttacking(newState)) return; // Don't interrupt attacks

    // DEFENSIVE TACTICS

    // React to player's Spectacle Mode - play more defensively
    if (player.spectacleMode && isClose && rand > 0.3) {
      newState.action = 'BLOCK';
      newState.isBlocking = true;
      return;
    }

    // React to incoming attacks with blocking or evasion
    if (player.action.includes('ATTACK') || player.action.includes('SPECIAL')) {
      if (isClose && rand > 0.5) {
        // Block incoming attacks
        newState.action = 'BLOCK';
        newState.isBlocking = true;
        return;
      } else if (isMidRange && rand > 0.6) {
        // Back up to avoid attack
        const speedMod = getStyleModifiers(newState).speed;
        if (newState.x < player.x) {
          newState.x -= MOVE_SPEED * enemyData.stats.speed * speedMod;
        } else {
          newState.x += MOVE_SPEED * enemyData.stats.speed * speedMod;
        }
        newState.action = 'WALK_BACKWARD';
        return;
      }
    }

    // Anti-air: Attack jumping player
    if (playerAbove && isMidRange && rand > 0.4) {
      // Use uppercut-style moves against airborne opponent
      if (rand > 0.7) {
        performAttack(newState, 'ATTACK_RK'); // Heavy kick
      } else {
        performAttack(newState, 'ATTACK_RP'); // Strong punch
      }
      return;
    }

    // OFFENSIVE TACTICS

    // Activate Spectacle Mode when strategically beneficial
    if (hasFullMeter && isLosing && rand > 0.7) {
      newState.spectacleMode = true;
      newState.spectacleFrames = 300;
      newState.meter = 0;
      return;
    }

    // Jump attacks when at mid range
    if (isMidRange && newState.y === 0 && rand > 0.7) {
      newState.velocityY = JUMP_FORCE;
      newState.action = 'JUMP_ATTACK_K';
      newState.actionFrame = 0;
      // Add forward momentum
      const speedMod = getStyleModifiers(newState).speed;
      if (newState.x < player.x) {
        newState.velocityX = MOVE_SPEED * enemyData.stats.speed * speedMod * 1.2;
      } else {
        newState.velocityX = -MOVE_SPEED * enemyData.stats.speed * speedMod * 1.2;
      }
      return;
    }

    // Special moves with meter management
    if (hasSpecialMeter) {
      // Projectile when far
      if ((isFar || isMidRange) && rand > 0.65) {
        performAttack(newState, 'SPECIAL_1');
        return;
      }
      // Grab when very close
      if (isVeryClose && rand > 0.6) {
        performAttack(newState, 'SPECIAL_2');
        return;
      }
      // Use SPECIAL_3 or SPECIAL_4 occasionally
      if (isClose && rand > 0.75) {
        if (rand > 0.85) {
          performAttack(newState, 'SPECIAL_4');
        } else {
          performAttack(newState, 'SPECIAL_3');
        }
        return;
      }
    }

    // Combo attacks at close range
    if (isVeryClose && rand > 0.4) {
      // Mix up attacks for unpredictability
      const attackChoice = rand;
      if (attackChoice > 0.85) {
        performAttack(newState, 'ATTACK_RK'); // Heavy kick
      } else if (attackChoice > 0.7) {
        performAttack(newState, 'ATTACK_RP'); // Strong punch
      } else if (attackChoice > 0.55) {
        performAttack(newState, 'ATTACK_LK'); // Light kick
      } else {
        performAttack(newState, 'ATTACK_LP'); // Jab
      }
      return;
    }

    // Regular attacks at close range
    if (isClose && rand > 0.45) {
      const attackChoice = rand;
      if (attackChoice > 0.8) {
        performAttack(newState, 'ATTACK_RK');
      } else if (attackChoice > 0.65) {
        performAttack(newState, 'ATTACK_LK');
      } else if (attackChoice > 0.5) {
        performAttack(newState, 'ATTACK_RP');
      } else {
        performAttack(newState, 'ATTACK_LP');
      }
      return;
    }

    // MOVEMENT AND POSITIONING

    // Aggressive movement when winning
    if (isWinning && (isFar || isMidRange) && rand > 0.5) {
      const speedMod = getStyleModifiers(newState).speed;
      if (newState.x < player.x) {
        newState.x += MOVE_SPEED * enemyData.stats.speed * speedMod;
      } else {
        newState.x -= MOVE_SPEED * enemyData.stats.speed * speedMod;
      }
      newState.action = 'WALK_FORWARD';
      return;
    }

    // Cautious approach when losing
    if (isLosing && isFar && rand > 0.6) {
      const speedMod = getStyleModifiers(newState).speed;
      if (newState.x < player.x) {
        newState.x += MOVE_SPEED * enemyData.stats.speed * speedMod * 0.6;
      } else {
        newState.x -= MOVE_SPEED * enemyData.stats.speed * speedMod * 0.6;
      }
      newState.action = 'WALK_FORWARD';
      return;
    }

    // Standard approach from far
    if (isVeryFar && rand > 0.5) {
      const speedMod = getStyleModifiers(newState).speed;
      if (newState.x < player.x) {
        newState.x += MOVE_SPEED * enemyData.stats.speed * speedMod * 0.9;
      } else {
        newState.x -= MOVE_SPEED * enemyData.stats.speed * speedMod * 0.9;
      }
      newState.action = 'WALK_FORWARD';
      return;
    }

    // Maintain optimal distance
    if (isVeryClose && rand > 0.4) {
      // Back up slightly to maintain spacing
      const speedMod = getStyleModifiers(newState).speed;
      if (newState.x < player.x) {
        newState.x -= MOVE_SPEED * enemyData.stats.speed * speedMod * 0.5;
      } else {
        newState.x += MOVE_SPEED * enemyData.stats.speed * speedMod * 0.5;
      }
      newState.action = 'WALK_BACKWARD';
      return;
    }

    // Default: release block
    newState.isBlocking = false;
  };

  const handlePlayerInput = (newState: FighterState) => {
    const keys = keysPressed.current;
    const attackKeys = attackTaps.current;

    // Style switch (Shift) - situationalist stance changes
    if (keys.has('Shift')) {
      const styles = playerData.styles || ['STYLE A', 'STYLE B'];
      newState.styleIndex = (newState.styleIndex + 1) % styles.length;
      setMessage(`STYLE: ${styles[newState.styleIndex]}`);
      setTimeout(() => setMessage(''), 800);
    }

    // FINISH_HIM state allows free movement - no special handling here
    // Fatality trigger is handled in the attack section below

    // Spectacle Mode activation (Down + Space with full meter)
    if (keys.has('ArrowDown') && keys.has(' ') && newState.meter >= 100 && !newState.spectacleMode) {
      newState.spectacleMode = true;
      newState.spectacleFrames = 300; // 5 seconds at 60fps
      newState.meter = 0;
      setMessage('THE SITUATION HAS BEEN CONSTRUCTED!');
      audioManager.play('spectacle', { volume: 0.8 });
      setTimeout(() => setMessage(''), 1500);
      return;
    }

    // Air control - allow slight horizontal movement while airborne
    if (newState.y > 0 && !isAttacking(newState)) {
      const speedMod = getStyleModifiers(newState).speed;
      if (keys.has('ArrowLeft')) {
        newState.velocityX = Math.max(newState.velocityX - 0.5, -MOVE_SPEED * playerData.stats.speed * speedMod * 1.2);
      } else if (keys.has('ArrowRight')) {
        newState.velocityX = Math.min(newState.velocityX + 0.5, MOVE_SPEED * playerData.stats.speed * speedMod * 1.2);
      }
    }

    // Crouch
    const isCrouching = keys.has('ArrowDown') && newState.y === 0 && !isAttacking(newState);

    // Movement
      if (keys.has('ArrowLeft') && newState.y === 0 && !isAttacking(newState) && !isCrouching) {
      newState.x -= MOVE_SPEED * playerData.stats.speed * getStyleModifiers(newState).speed;
      newState.action = 'WALK_BACKWARD';
      newState.facingLeft = true;
    } else if (keys.has('ArrowRight') && newState.y === 0 && !isAttacking(newState) && !isCrouching) {
      newState.x += MOVE_SPEED * playerData.stats.speed * getStyleModifiers(newState).speed;
      newState.action = 'WALK_FORWARD';
      newState.facingLeft = false;
    }

    // Jump (with horizontal momentum)
    if (keys.has('ArrowUp') && newState.y === 0 && !isAttacking(newState) && !isCrouching) {
      newState.velocityY = JUMP_FORCE;
      newState.action = 'JUMP';
      newState.actionFrame = 0;

      // Add horizontal momentum based on direction keys
      if (keys.has('ArrowLeft')) {
        newState.velocityX = -MOVE_SPEED * playerData.stats.speed * getStyleModifiers(newState).speed * 1.2; // Jump backward
      } else if (keys.has('ArrowRight')) {
        newState.velocityX = MOVE_SPEED * playerData.stats.speed * getStyleModifiers(newState).speed * 1.2; // Jump forward
      }
    }

    // Block
    if (keys.has('s') && newState.y === 0 && !isAttacking(newState) && !isCrouching) {
      newState.action = 'BLOCK';
      newState.isBlocking = true;
    } else {
      newState.isBlocking = false;
    }

    // Crouch attacks
    if (isCrouching && !isAttacking(newState)) {
      newState.action = 'CROUCH';
      if (attackKeys.has('j')) {
        performAttack(newState, 'CROUCH_ATTACK_P');
      } else if (attackKeys.has('l')) {
        performAttack(newState, 'CROUCH_ATTACK_K');
      }
    }

    // Jump attacks
    if (newState.y > 0 && !isAttacking(newState)) {
      if (attackKeys.has('j')) {
        performAttack(newState, 'JUMP_ATTACK_P');
      } else if (attackKeys.has('l')) {
        performAttack(newState, 'JUMP_ATTACK_K');
      }
    }

    // Ground attacks - only if not already attacking
    // ALWAYS enforce the attacking timer to prevent spam in all game modes

    // DEBUG: Log the condition checks during FINISH_HIM
    if (gameState === 'FINISH_HIM') {
      console.log('🔍 FINISH_HIM Debug:', {
        isAttacking: isAttacking(newState),
        yPos: newState.y,
        isCrouching,
        conditionPassed: !isAttacking(newState) && newState.y === 0 && !isCrouching,
        hasJKey: attackKeys.has('j'),
        attackKeysArray: Array.from(attackKeys),
        playerAction: newState.action
      });
    }

    // ALWAYS check isAttacking to prevent spam in ALL game modes
    if (gameState === 'FINISH_HIM') {
      console.log('🎯 FINISH_HIM attack check:', {
        isAttacking: isAttacking(newState),
        yPos: newState.y,
        isCrouching,
        attackKeys: Array.from(attackKeys),
        conditionPassed: !isAttacking(newState) && newState.y === 0 && !isCrouching
      });
    }
    if (!isAttacking(newState) && newState.y === 0 && !isCrouching) {
      if (attackKeys.has('j')) { // Light Punch OR Fatality trigger
        console.log('✅ J KEY DETECTED! gameState:', gameState);
        dbg('Ground J detected', { keys: Array.from(keys), action: newState.action, gameState });
        // FINISH_HIM: Trigger fatality instead of normal attack
        dbg('J pressed!', {
          gameState,
          fatalityTriggered,
          isFinishHim: gameState === 'FINISH_HIM',
          playerX: newState.x,
          enemyX: enemy.x,
          distance: Math.abs(newState.x - enemy.x)
        });

        if (gameState === 'FINISH_HIM' && !fatalityActiveRef.current) {
          const distance = Math.abs(newState.x - enemy.x);
          const inRange = distance < 350; // Increased from 250 to make it easier

          console.log('⚡ FATALITY CHECK:', { distance, inRange, threshold: 350, fatalityActiveRef: fatalityActiveRef.current });
          dbg('FINISH_HIM check:', { distance, inRange, threshold: 350, fatalityTriggered });

          if (inRange) {
            // FATALITY TRIGGERED!
            dbg('Fatality triggered!', { distance, playerX: newState.x, enemyX: enemy.x });
            fatalityActiveRef.current = true;
            setFatalityTriggered(true);
            setLastWinner('player');
            setFinishTimer(999); // keep window alive during the overlay

            // Capture positions for effects
            const targetX = enemy.x;
            const targetY = enemy.y;

            // CHARACTER-SPECIFIC FATALITIES - All characters now get full fatality overlay
            const playerId = newState.id;

            // Set character-specific message
            const fatalityMessages: Record<string, string> = {
              khayati: 'THE PAMPHLET OF DOOM',
              bureaucrat: 'RED TAPE ANNIHILATION',
              professor: 'GRADED TO DEATH',
              maoist: 'GREAT LEAP TO OBLIVION',
              debord: 'THE SPECTACLE CONSUMES'
            };
            setMessage(fatalityMessages[playerId] || 'FATALITY');

            // Spawn initial visual effects during fatality trigger
            if (playerId === 'bureaucrat') {
              for (let i = 0; i < 12; i++) {
                setTimeout(() => {
                  spawnBloodEffect(targetX + (Math.random() * 100 - 50), 80 + targetY + Math.random() * 60);
                  spawnSmokeEffect(targetX + (Math.random() * 80 - 40), 80 + targetY + Math.random() * 40);
                }, i * 80);
              }
            } else if (playerId === 'professor') {
              for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                  spawnSparkEffect(targetX, 80 + targetY + i * 20, false);
                }, i * 100);
              }
            } else if (playerId === 'maoist') {
              for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                  spawnSmokeEffect(targetX, 80 + targetY);
                  spawnBloodEffect(targetX, 80 + targetY + 60);
                }, i * 200);
              }
            } else if (playerId === 'debord') {
              for (let i = 0; i < 20; i++) {
                setTimeout(() => {
                  const angle = (i / 20) * Math.PI * 2;
                  const radius = 60;
                  spawnBloodEffect(
                    targetX + Math.cos(angle) * radius,
                    80 + targetY + 100 + Math.sin(angle) * radius
                  );
                }, i * 30);
              }
            } else {
              for (let i = 0; i < 8; i++) {
                spawnBloodEffect(targetX + (Math.random() * 80 - 40), 120 + targetY + Math.random() * 40);
              }
            }

            // Set enemy to defeated state
            setEnemy(prev => ({
              ...prev,
              hp: 0,
              action: 'DEFEAT',
              actionFrame: 0,
              stunFrames: 0
            }));

            // ALL characters now trigger the full fatality overlay
            console.log('💀 FATALITY VICTIM SET:', {
              victimId: enemy.id,
              attackerId: newState.id,
              gameState,
              playerRoundsWon: player.roundsWon,
              enemyRoundsWon: enemy.roundsWon
            });
            setFatalityVictim(enemy.id);
          } else {
            // Not in range - show message
            setMessage('GET CLOSER!');
            setTimeout(() => setMessage(''), 500);
          }
        } else if (gameState !== 'FINISH_HIM') {
          // Normal attack (blocked during FINISH_HIM)
          dbg('Perform attack from ground J');
          performAttack(newState, 'ATTACK_LP');
          const fallbackMove = getMoveDataForAction(newState.id, 'ATTACK_LP');
          const foe = enemyRef.current;
          if (fallbackMove && foe) {
            const dx = Math.abs(newState.x - foe.x);
            const dy = Math.abs((80 + newState.y) - (80 + foe.y));
            if (dx < 220 && dy < 180) {
              dbg('Fallback applyHit LP');
              applyHit(newState, foe, fallbackMove, true);
            }
          }
        }
      } else if (gameState !== 'FINISH_HIM' && attackKeys.has('k')) { // Right Punch (blocked during FINISH_HIM)
        dbg('Ground K detected', { keys: Array.from(keys), action: newState.action });
        performAttack(newState, 'ATTACK_RP');
        const fallbackMove = getMoveDataForAction(newState.id, 'ATTACK_RP');
        const foe = enemyRef.current;
        if (fallbackMove && foe) {
          const dx = Math.abs(newState.x - foe.x);
          const dy = Math.abs((80 + newState.y) - (80 + foe.y));
          if (dx < 220 && dy < 180) {
            dbg('Fallback applyHit RP');
            applyHit(newState, foe, fallbackMove, true);
          }
        }
      } else if (gameState !== 'FINISH_HIM' && attackKeys.has('l')) { // Light Kick (blocked during FINISH_HIM)
        dbg('Ground L detected', { keys: Array.from(keys), action: newState.action });
        performAttack(newState, 'ATTACK_LK');
        const fallbackMove = getMoveDataForAction(newState.id, 'ATTACK_LK');
        const foe = enemyRef.current;
        if (fallbackMove && foe) {
          const dx = Math.abs(newState.x - foe.x);
          const dy = Math.abs((80 + newState.y) - (80 + foe.y));
          if (dx < 220 && dy < 180) {
            dbg('Fallback applyHit LK');
            applyHit(newState, foe, fallbackMove, true);
          }
        }
      } else if (gameState !== 'FINISH_HIM' && attackKeys.has('i')) { // Right Kick (blocked during FINISH_HIM)
        dbg('Ground I detected', { keys: Array.from(keys), action: newState.action });
        performAttack(newState, 'ATTACK_RK');
        const fallbackMove = getMoveDataForAction(newState.id, 'ATTACK_RK');
        const foe = enemyRef.current;
        if (fallbackMove && foe) {
          const dx = Math.abs(newState.x - foe.x);
          const dy = Math.abs((80 + newState.y) - (80 + foe.y));
          if (dx < 220 && dy < 180) {
            dbg('Fallback applyHit RK');
            applyHit(newState, foe, fallbackMove, true);
          }
        }
      }
    }

    // Special moves - check input buffer (but skip during FINISH_HIM to avoid conflicts with fatality)
    if (gameState !== 'FINISH_HIM') {
      checkSpecialMoves(newState, attackKeys);
    }

    // Parry (recovery during stun)
    if (keys.has(' ') && newState.stunFrames > 0 && newState.meter >= 50) {
      newState.meter -= 50;
      newState.stunFrames = 0;
      newState.action = 'IDLE';
      newState.velocityX = newState.facingLeft ? 10 : -10; // Push back
      setMessage('CO-OPTED!');
      audioManager.play('parry', { volume: 0.7 });
      setTimeout(() => setMessage(''), 500);
    }

    // Consume attack taps after processing so holding the button doesn't repeat
    attackKeys.clear();
  };

  const checkSpecialMoves = (newState: FighterState, attackKeys: Set<string>) => {
    const buffer = inputBuffer.current.join(',');
    const keys = keysPressed.current;
    const forward = newState.facingLeft ? 'LEFT' : 'RIGHT';
    const back = newState.facingLeft ? 'RIGHT' : 'LEFT';

    // QCF (Down, Down-Forward, Forward) + Punch = SPECIAL_1
    if (buffer.includes(`DOWN,${forward}`) && attackKeys.has('j')) {
      performAttack(newState, 'SPECIAL_1');
      inputBuffer.current = [];
    }
    // QCB (Down, Down-Back, Back) + Kick = SPECIAL_2
    else if (buffer.includes(`DOWN,${back}`) && attackKeys.has('k')) {
      performAttack(newState, 'SPECIAL_2');
      inputBuffer.current = [];
    }
    // DP (Forward, Down, Down-Forward) + Punch = SPECIAL_3
    else if (buffer.includes(`${forward},DOWN,${forward}`) && attackKeys.has('j')) {
      performAttack(newState, 'SPECIAL_3');
      inputBuffer.current = [];
    }
    // HCF (Back, Down-Back, Down, Down-Forward, Forward) + Kick = SPECIAL_4
    else if (buffer.includes(`${back},DOWN,${forward}`) && attackKeys.has('k')) {
      performAttack(newState, 'SPECIAL_4');
      inputBuffer.current = [];
    }
  };

  const performAttack = (fighter: FighterState, action: ActionType) => {
    const moveData = getMoveDataForAction(fighter.id, action);
    if (moveData) {
      dbg('Performing attack', { fighter: fighter.id, action, move: moveData.name, rangeX: moveData.rangeX, rangeY: moveData.rangeY });
      fighter.action = action;
      fighter.actionFrame = 0;
      if (moveData.isProjectile) {
        const powerMod = getStyleModifiers(fighter).power * (fighter.spectacleMode ? 1.2 : 1);
        const speed = 14 + getStyleModifiers(fighter).speed * 4;
        spawnProjectile(fighter, speed, moveData.damage * powerMod);
      }
    }
  };

  const isAttacking = (fighter: FighterState): boolean => {
    return fighter.action.includes('ATTACK') || fighter.action.includes('SPECIAL');
  };

  const getMoveData = (fighter: FighterState): MoveData | null => {
    return getMoveDataForAction(fighter.id, fighter.action);
  };

  const getMoveDataForAction = (fighterId: string, action: ActionType): MoveData | null => {
    const data = CHARACTER_DATA[fighterId];
    return data?.moves[action] || null;
  };

  const checkCollisions = (currentPlayer: FighterState = player, currentEnemy: FighterState = enemy) => {
    // FINISH_HIM: Disable all collision detection - only fatality trigger matters
    if (gameState === 'FINISH_HIM') {
      return;
    }

    const playerMove = getMoveData(currentPlayer);
    const enemyMove = getMoveData(currentEnemy);

    const allowFreeHits = false; // No longer needed since FINISH_HIM exits early
    // Generous proximity window so hits connect when sprites visually overlap
    const closeEnough = Math.abs(currentPlayer.x - currentEnemy.x) < 200 && Math.abs(currentPlayer.y - currentEnemy.y) < 160;

    dbg('Collision tick', {
      gameState,
      playerAction: currentPlayer.action,
      enemyAction: currentEnemy.action,
      playerX: currentPlayer.x,
      playerY: currentPlayer.y,
      enemyX: currentEnemy.x,
      enemyY: currentEnemy.y,
      playerMove: playerMove?.name,
      enemyMove: enemyMove?.name,
      closeEnough
    });

    // Check if player hits enemy
    // Generous fallback hitbox when in any ATTACK/SPECIAL state to keep close hits connecting
    const fallbackMove: MoveData = {
      name: 'Default Jab',
      damage: 5,
      meterGain: 5,
      startup: 0,
      active: 14,
      recovery: 10,
      hitStun: 14,
      rangeX: 120, // tighter fallback reach
      rangeY: 180,
      type: 'mid',
      knockback: 6
    };

    const playerSwinging = playerMove || isAttacking(currentPlayer);
    const effectivePlayerMove = playerMove || (playerSwinging ? fallbackMove : null);
    const playerActiveNow = effectivePlayerMove && (allowFreeHits || isInActiveFrames(currentPlayer, effectivePlayerMove) || currentPlayer.action.includes('ATTACK'));
    if (effectivePlayerMove && playerActiveNow) {
      dbg('Player active move', {
        action: currentPlayer.action,
        frame: currentPlayer.actionFrame,
        move: effectivePlayerMove.name,
        rangeX: effectivePlayerMove.rangeX,
        rangeY: effectivePlayerMove.rangeY,
        allowFreeHits,
        closeEnough,
        attackerX: currentPlayer.x,
        attackerY: currentPlayer.y,
        defenderX: currentEnemy.x,
        defenderY: currentEnemy.y
      });
      // Allow hits even during stun so combos can continue; only gate defeated enemies
      const defenderAlive = currentEnemy.action !== 'DEFEAT';
      const landed = defenderAlive && (allowFreeHits || checkHitboxCollision(currentPlayer, currentEnemy, effectivePlayerMove));
      if (landed) {
        dbg('Player hit landed');
        applyHit(currentPlayer, currentEnemy, effectivePlayerMove, true);
      } else {
        dbg('Player attack did not land', {
          attackerX: currentPlayer.x,
          defenderX: currentEnemy.x,
          attackerY: currentPlayer.y,
          defenderY: currentEnemy.y,
          defenderStun: currentEnemy.stunFrames,
          allowFreeHits,
          moveRangeX: effectivePlayerMove.rangeX,
          moveRangeY: effectivePlayerMove.rangeY
        });
      }
    } else if (playerMove) {
      dbg('Player move not active yet', { action: currentPlayer.action, frame: currentPlayer.actionFrame, startup: playerMove.startup, active: playerMove.active });
    }

    // Check if enemy hits player (not needed in finish him, but keep for completeness)
    const enemySwinging = enemyMove || isAttacking(currentEnemy);
    const effectiveEnemyMove = enemyMove || (enemySwinging ? fallbackMove : null);

    const enemyActiveNow = effectiveEnemyMove && (allowFreeHits || isInActiveFrames(currentEnemy, effectiveEnemyMove) || currentEnemy.action.includes('ATTACK'));
    if (effectiveEnemyMove && enemyActiveNow) {
      const defenderAlive = currentPlayer.action !== 'DEFEAT';
      const landed = defenderAlive && (allowFreeHits || checkHitboxCollision(currentEnemy, currentPlayer, effectiveEnemyMove));
      if (landed) {
        applyHit(currentEnemy, currentPlayer, effectiveEnemyMove, false);
      }
    }
  };

  const checkHitboxCollision = (
    attacker: FighterState,
    defender: FighterState,
    move: MoveData
  ): boolean => {
    // Hurtbox for defender
    const baseBottom = 80 + defender.y;
    const isCrouching = defender.action === 'CROUCH' || defender.action.includes('CROUCH_ATTACK');
    const isAirborne = defender.y > 0;
    const base = HURTBOX_SIZES[defender.id] || { width: 0, height: 0 };
    const hurtWidth = isCrouching ? base.width * 0.8 : base.width;
    const hurtHeight = isCrouching ? base.height * 0.6 : isAirborne ? base.height * 0.8 : base.height;
    const hurtLeft = defender.x - hurtWidth / 2;
    const hurtRight = defender.x + hurtWidth / 2;
    const hurtTop = baseBottom + hurtHeight;
    const hurtBottom = baseBottom;

    // Hitbox for attacker based on move ranges
    const hitWidth = (move.rangeX + 150); // tightened horizontally
    const hitHeight = move.rangeY + 150;
    const hitCenterX = attacker.x + (attacker.facingLeft ? -(hitWidth * 0.25) : hitWidth * 0.25);
    const hitBottom = 80 + attacker.y;
    const hitLeft = hitCenterX - hitWidth / 2;
    const hitRight = hitCenterX + hitWidth / 2;
    const hitTop = hitBottom + hitHeight;

    // Overlap check
    const overlapsX = hitRight >= hurtLeft && hitLeft <= hurtRight;
    const overlapsY = hitTop >= hurtBottom && hitBottom <= hurtTop;

    if (!overlapsX || !overlapsY) {
      dbg('Collision miss', { attacker: attacker.id, defender: defender.id, hitLeft, hitRight, hitTop, hitBottom, hurtLeft, hurtRight, hurtTop, hurtBottom });
      return false;
    }

    // Lows must hit grounded
    if (move.type === 'low' && isAirborne) {
      dbg('Collision rejected (low vs airborne)');
      return false;
    }

    dbg('Collision hit', { attacker: attacker.id, defender: defender.id, move: move.name, hitLeft, hitRight, hitTop, hitBottom, hurtLeft, hurtRight, hurtTop, hurtBottom });
    return true;
  };

  const isInActiveFrames = (fighter: FighterState, move: MoveData): boolean => {
    return fighter.actionFrame >= move.startup &&
           fighter.actionFrame < move.startup + move.active;
  };

  const spawnBloodEffect = (x: number, y: number) => {
    const src = BLOOD_SPRITES[Math.floor(Math.random() * BLOOD_SPRITES.length)];
    const id = `blood-${Date.now()}-${Math.random()}`;
    const effect: BloodEffectData = { id, x, y, src };
    setBloodEffects(prev => [...prev, effect]);
    setTimeout(() => {
      setBloodEffects(prev => prev.filter(b => b.id !== id));
    }, 500);
  };

  const spawnSparkEffect = (x: number, y: number, isBlock = false) => {
    const id = `spark-${Date.now()}-${Math.random()}`;
    const sourceList = isBlock ? BLOCK_SPARK_SPRITES : SPARK_SPRITES;
    const src = sourceList[Math.floor(Math.random() * sourceList.length)];
    const effect: SparkEffectData = { id, x, y, src };
    setSparkEffects(prev => [...prev, effect]);
    setTimeout(() => {
      setSparkEffects(prev => prev.filter(s => s.id !== id));
    }, 250);
  };

  const spawnSmokeEffect = (x: number, y: number) => {
    const id = `smoke-${Date.now()}-${Math.random()}`;
    const src = SMOKE_SPRITES[Math.floor(Math.random() * SMOKE_SPRITES.length)];
    const effect: SmokeEffectData = { id, x, y, src };
    setSmokeEffects(prev => [...prev, effect]);
    setTimeout(() => {
      setSmokeEffects(prev => prev.filter(s => s.id !== id));
    }, 600);
  };

  const spawnProjectile = (owner: FighterState, speed: number, damage: number) => {
    const sprite = PROJECTILE_SPRITES[owner.id] || "/assets/props/effects/fire02.png";
    const dir = owner.facingLeft ? -1 : 1;
    const id = `proj-${Date.now()}-${Math.random()}`;
    // Spawn near hands; height varies per character and airborne state
    const handHeight: Record<string, number> = {
      khayati: owner.y > 0 ? 260 : 220,
      bureaucrat: owner.y > 0 ? 250 : 210,
      professor: owner.y > 0 ? 255 : 215,
      maoist: owner.y > 0 ? 250 : 210,
      debord: owner.y > 0 ? 265 : 225
    };
    const height = handHeight[owner.id] ?? (owner.y > 0 ? 250 : 210);
    const arc = owner.id === 'maoist';
    const proj: Projectile = {
      id,
      ownerId: owner.id,
      x: owner.x + dir * 130,
      y: 80 + owner.y + height,
      vx: speed * dir,
      vy: arc ? 4 : 0,
      gravity: arc ? 0.4 : 0,
      sprite,
      damage
    };
    // Special sprite for Khayati projectile – single large book frame
    if (owner.id === 'khayati') {
      proj.totalFrames = 1;
      proj.frame = 0;
      proj.frameWidth = 256;
      proj.frameHeight = 112;
      proj.sheetWidth = 256;
      proj.sheetHeight = 112;
      proj.scale = 1.2; // make the book visibly large
    }
    setProjectiles(prev => [...prev, proj]);
    audioManager.play('projectile', { volume: 0.4 });
  };

  const spawnDamageNumber = (damage: number, x: number, y: number, isBlocked: boolean) => {
    const id = `dmg-${Date.now()}-${Math.random()}`;
    const dmgNum: DamageNumberData = { id, damage, x, y, isBlocked };
    setDamageNumbers(prev => [...prev, dmgNum]);
  };

  const triggerToasty = () => {
    if (toastyTimers.current.text) clearTimeout(toastyTimers.current.text);
    if (toastyTimers.current.popup) clearTimeout(toastyTimers.current.popup);
    setToasty(true);
    setToastyPopup(true);
    setToastyKey(k => k + 1);
    toastyTimers.current.text = window.setTimeout(() => setToasty(false), 1500);
    toastyTimers.current.popup = window.setTimeout(() => setToastyPopup(false), 1700);
  };

  const removeDamageNumber = (id: string) => {
    setDamageNumbers(prev => prev.filter(d => d.id !== id));
  };

  const spawnComboText = (fighterId: string, comboCount: number, x: number, y: number) => {
    const titles = CHARACTER_DATA[fighterId]?.comboTitles;
    const thresholds = [3, 5, 7, 10, 15];
    const thresholdIndex = thresholds.findIndex(t => comboCount === t);
    const hasCustom = titles && titles.length > thresholdIndex && thresholdIndex >= 0;
    const text = hasCustom
      ? titles![thresholdIndex].toUpperCase()
      : COMBO_TEXT_MAP[comboCount];
    if (!text) return;

    const id = `combo-${Date.now()}-${Math.random()}`;
    const comboText: ComboTextData = { id, text, x, y };
    setComboTexts(prev => [...prev, comboText]);
    audioManager.play('combo', { volume: 0.8 });
    // Trigger Debord-style Toasty popup on combo milestones
    triggerToasty();

    // Auto-remove after animation (1.5 seconds)
    setTimeout(() => {
      setComboTexts(prev => prev.filter(c => c.id !== id));
    }, 1500);
  };

  const applyHit = (
    attacker: FighterState,
    defender: FighterState,
    move: MoveData,
    attackerIsPlayer: boolean
  ) => {
    // Suppress further damage once a fatality is underway to avoid stray ticks
    if (gameState === 'FINISH_HIM' && fatalityActiveRef.current) {
      dbg('Suppressing damage during fatality sequence');
      return;
    }

    // Check if defender is blocking
    const isBlocked = defender.isBlocking && defender.action === 'BLOCK';

    // Calculate damage with blocking reduction
    const atkMods = getStyleModifiers(attacker);
    const defMods = getStyleModifiers(defender);

    let damage = move.damage * CHARACTER_DATA[attacker.id].stats.power * atkMods.power;
    damage /= defMods.defense;
    if (isBlocked) {
      damage *= 0.25; // Blocking reduces damage to 25%

      // Spawn block effect at character's center/torso (using same coordinate system as character rendering)
      spawnSparkEffect(defender.x, 80 + defender.y + 110, true);

      // Give defender meter for blocking
      if (attackerIsPlayer) {
        setEnemy(prev => ({
          ...prev,
          meter: Math.min(MAX_METER, prev.meter + 10)
        }));
      } else {
        setPlayer(prev => ({
          ...prev,
          meter: Math.min(MAX_METER, prev.meter + 10)
        }));
      }
    } else {
      // Spawn blood splatter on clean hits
      spawnBloodEffect(defender.x, 80 + defender.y + 100);
      if (damage >= 20) {
        triggerToasty();
      }
    }

    // HITSTOP: Freeze game on hit for impact
    const hitstopDuration = isBlocked ? 2 : Math.min(8, Math.floor(damage / 5));
    setHitstopFrames(hitstopDuration);

    // SCREEN SHAKE: Shake on heavy hits
    if (!isBlocked && damage >= 12) {
      const shakeIntensity = Math.min(15, damage / 2);
      setScreenShake({
        x: (Math.random() - 0.5) * shakeIntensity,
        y: (Math.random() - 0.5) * shakeIntensity
      });
    }

    // Spawn damage number (position it near the defender's head, using bottom coordinate system)
    const damageY = 80 + defender.y + 180; // Above character's head
    spawnDamageNumber(damage, defender.x, damageY, isBlocked);

    if (attackerIsPlayer) {
      if (lastHitAction.current.player === attacker.action) return;
      lastHitAction.current.player = attacker.action;
      setEnemy(prev => {
        const newHp = Math.max(0, prev.hp - damage);
        const newMeter = Math.min(MAX_METER, prev.meter + 5); // Gain meter when hit

        // Reduce stun/knockback when blocking
        const stunMultiplier = isBlocked ? 0.3 : 1.0;
        const knockbackMultiplier = isBlocked ? 0.2 : 1.0;

        const knockdown = !isBlocked && (move.knockback > 15 || move.hitStun > 20);
        const launch = !isBlocked && attacker.action === 'ATTACK_RP' && defender.y <= 0;
        const isGrabbed = !isBlocked && move.isGrab;

        if (knockdown) {
          spawnSmokeEffect(defender.x, 80 + defender.y);
        }

        // Determine action based on hit type
        let newAction: ActionType = prev.action;
        if (!isBlocked) {
          if (isGrabbed) newAction = 'GRABBED';
          else if (knockdown) newAction = 'KNOCKDOWN';
          else newAction = 'HIT_STUN';
        }
        audioManager.play(isBlocked ? 'block' : move.damage > 15 ? 'hitHeavy' : 'hitLight', { volume: isBlocked ? 0.5 : 0.7 });

        return {
          ...prev,
          hp: newHp,
          meter: newMeter,
          action: newAction,
          actionFrame: 0,
          stunFrames: Math.floor(move.hitStun * stunMultiplier),
          velocityX: move.knockback * knockbackMultiplier * (attacker.facingLeft ? -1 : 1),
          velocityY: launch ? 15 : knockdown ? 10 : prev.velocityY,
          comboCount: 0 // Reset enemy combo
        };
      });

      setPlayer(prev => {
        const newMeter = Math.min(MAX_METER, prev.meter + move.meterGain);
        const newCombo = isBlocked ? prev.comboCount : prev.comboCount + 1;

        // Spawn combo text at milestone combos
        if (!isBlocked && newCombo >= 3) {
          spawnComboText(attacker.id, newCombo, attacker.x, 80 + attacker.y + 220);
        }

        return {
          ...prev,
          meter: newMeter,
          comboCount: newCombo
        };
      });

      // Check for KO
      if (defender.hp - damage <= 0) {
        handleRoundEnd(true);
      }
    } else {
      if (lastHitAction.current.enemy === attacker.action) return;
      lastHitAction.current.enemy = attacker.action;
      setPlayer(prev => {
        const newHp = Math.max(0, prev.hp - damage);
        const newMeter = Math.min(MAX_METER, prev.meter + 5);

        const stunMultiplier = isBlocked ? 0.3 : 1.0;
        const knockbackMultiplier = isBlocked ? 0.2 : 1.0;

        const knockdown = !isBlocked && (move.knockback > 15 || move.hitStun > 20);
        const launch = !isBlocked && attacker.action === 'ATTACK_RP' && defender.y <= 0;
        const isGrabbed = !isBlocked && move.isGrab;

        if (knockdown) {
          spawnSmokeEffect(defender.x, 80 + defender.y);
        }

        // Determine action based on hit type
        let newAction: ActionType = prev.action;
        if (!isBlocked) {
          if (isGrabbed) newAction = 'GRABBED';
          else if (knockdown) newAction = 'KNOCKDOWN';
          else newAction = 'HIT_STUN';
        }
        audioManager.play(isBlocked ? 'block' : move.damage > 15 ? 'hitHeavy' : 'hitLight', { volume: isBlocked ? 0.5 : 0.7 });

        return {
          ...prev,
          hp: newHp,
          meter: newMeter,
          action: newAction,
          actionFrame: 0,
          stunFrames: Math.floor(move.hitStun * stunMultiplier),
          velocityX: move.knockback * knockbackMultiplier * (attacker.facingLeft ? -1 : 1),
          velocityY: launch ? 15 : knockdown ? 10 : prev.velocityY,
          comboCount: 0
        };
      });

      setEnemy(prev => {
        const newMeter = Math.min(MAX_METER, prev.meter + move.meterGain);
        const newCombo = isBlocked ? prev.comboCount : prev.comboCount + 1;

        // Spawn combo text at milestone combos
        if (!isBlocked && newCombo >= 3) {
          spawnComboText(attacker.id, newCombo, attacker.x, 80 + attacker.y + 220);
        }

        return {
          ...prev,
          meter: newMeter,
          comboCount: newCombo
        };
      });

      if (defender.hp - damage <= 0) {
        handleRoundEnd(false);
      }
    }
  };

  const handleRoundEnd = (playerWon: boolean) => {
    if (playerWon) {
      setLastWinner('player');

      // DEBUG: Log current roundsWon BEFORE increment
      console.log('🏆 ROUND END - Player Won!', {
        currentRoundsWon: player.roundsWon,
        afterIncrement: player.roundsWon + 1,
        willEnterFinishHim: player.roundsWon + 1 >= 2
      });

      setPlayer(prev => ({
        ...prev,
        roundsWon: prev.roundsWon + 1,
        action: 'IDLE',
        actionFrame: 0
      }));
      setEnemy(prev => ({
        ...prev,
        action: 'DEFEAT',
        actionFrame: 0
      }));

      // Check if this should trigger FINISH_HIM (player won match - 2 rounds)
      if (player.roundsWon + 1 >= 2) {
        console.log('✅ ENTERING FINISH_HIM STATE', {
          currentRoundsWon: player.roundsWon,
          afterIncrement: player.roundsWon + 1,
          message: 'Player won the MATCH (2 rounds) - entering FINISH_HIM mode'
        });
        dbg('=== ENTERING FINISH_HIM STATE ===');
        setMessage('CRITIQUE HIM!');
        setFinishTimer(300); // 5 seconds at 60fps
        fatalityActiveRef.current = false;
        setFatalityTriggered(false);
        setGameState('FINISH_HIM'); // Go straight to FINISH_HIM, skip ROUND_END
        audioManager.play('finishHim', { volume: 0.7 });
        dbg('GameState set to FINISH_HIM, fatalityTriggered reset to false');
        setEnemy(prev => ({
          ...prev,
          action: 'DIZZY',
          actionFrame: 0,
          stunFrames: 999 // keep them frozen
        }));
        setPlayer(prev => ({ ...prev, stunFrames: 0 }));
      } else {
        console.log('➡️ Normal round end - Player won round', player.roundsWon + 1, 'of 2');
        // Normal round end
        setGameState('ROUND_END');
        setMessage(`${playerData.name.toUpperCase()} WINS ROUND`);
        setTimeout(() => resetRound(), 2000);
      }
    } else {
      setLastWinner('enemy');
      setEnemy(prev => ({
        ...prev,
        roundsWon: prev.roundsWon + 1,
        action: 'VICTORY',
        actionFrame: 0
      }));
      setPlayer(prev => ({
        ...prev,
        action: 'DEFEAT',
        actionFrame: 0
      }));

      if (enemy.roundsWon + 1 >= 2) {
        const loseScenario = LOSE_SCENARIOS[player.id] || LOSE_SCENARIOS['khayati'];
        setCurrentScenario(loseScenario);
        setCutsceneIndex(0);
        setMessage('GAME OVER');
        setGameState('LOSE_CUTSCENE');
      } else {
        setGameState('ROUND_END');
        setMessage(`${enemyData.name.toUpperCase()} WINS ROUND`);
        setTimeout(() => resetRound(), 2000);
      }
    }
  };

  const handleTimeOver = () => {
    setGameState('ROUND_END');

    if (player.hp > enemy.hp) {
      handleRoundEnd(true);
    } else if (enemy.hp > player.hp) {
      handleRoundEnd(false);
    } else {
      setMessage('MUTUAL DESTRUCTION');
      setTimeout(() => resetRound(), 2000);
    }
  };
  
  // Auto-end FINISH_HIM if timer expires; also safety-complete if fatality was triggered but overlay failed
  useEffect(() => {
    if (gameState === 'FINISH_HIM' && finishTimer === 0) {
      if (!fatalityTriggered) {
        setEnemy(prev => ({ ...prev, action: 'DEFEAT', actionFrame: 0, hp: 0 }));
        setLastWinner('player');
        setMessage('TIME OVER');
        setTimeout(() => setGameState('GAME_OVER'), 800);
      } else {
        // Fatality was triggered but nothing fired; force-complete to keep ladder moving
        if (!fatalityVictim) {
          console.log('⏰ FINISH_HIM timer expired with fatalityTriggered=true but no overlay - forcing completion');
          setFatalityVictim(enemy.id);
        }
        setTimeout(() => {
          setFatalityVictim(null);
          setGameState('GAME_OVER');
          setLastWinner('player');
          advanceLadder();
        }, 1200);
      }
    }
  }, [finishTimer, gameState, fatalityTriggered, fatalityVictim, enemy.id]);

  // Advance ladder on win at game over
  useEffect(() => {
    if (gameState === 'GAME_OVER' && lastWinner === 'player') {
      setTimeout(() => {
        advanceLadder();
      }, 1200);
    }
    if (gameState === 'LOSE_CUTSCENE') {
      // if player lost, exit back to title after cutscene advance
      const handler = setTimeout(() => {
        setGameState('TITLE');
        setLastWinner(null);
        setLadderIndex(0);
      }, 200);
      return () => clearTimeout(handler);
    }
  }, [gameState, lastWinner]);

  const resetRound = () => {
    // Clear any lingering fatality state
    setFatalityVictim(null);
    fatalityActiveRef.current = false;

    setPlayer(prev => ({
      ...prev,
      x: 1000,
      y: 0,
      velocityX: 0,
      velocityY: 0,
      hp: MAX_HP,
      meter: prev.meter, // Keep meter between rounds
      action: 'IDLE',
      actionFrame: 0,
      stunFrames: 0,
      comboCount: 0,
      spectacleMode: false,
      spectacleFrames: 0,
      styleIndex: 0
    }));

    setEnemy(prev => ({
      ...prev,
      x: 1400,
      y: 0,
      velocityX: 0,
      velocityY: 0,
      hp: MAX_HP,
      meter: prev.meter,
      action: 'IDLE',
      actionFrame: 0,
      stunFrames: 0,
      comboCount: 0,
      spectacleMode: false,
      spectacleFrames: 0,
      styleIndex: 0
    }));

    setBloodEffects([]);
    setSparkEffects([]);
    setSmokeEffects([]);
    setProjectiles([]);
    setDamageNumbers([]);
    setComboTexts([]);
    setTimer(99);
    const roundIndex = Math.max(player.roundsWon, enemy.roundsWon) % ROUND_START_TEXT.length;
    setMessage(ROUND_START_TEXT[roundIndex] ?? `ROUND ${Math.max(player.roundsWon, enemy.roundsWon) + 1}`);
    setGameState('ROUND_START');
  };

  const getComboTitle = (count: number, titles: string[]): string => {
    if (count <= 1) return '';
    if (count === 2) return titles[0];
    if (count === 3) return titles[1];
    if (count === 4) return titles[2];
    if (count === 5) return titles[3];
    return titles[4];
  };
  
  const getSpecialInstructions = (id: string) => {
    if (id === 'khayati') return 'SPECIALS: QCF+J (Pamphlet) | QCB+K (Scandal Grab)';
    if (id === 'bureaucrat') return 'SPECIALS: QCB+K (Compromise Grab) | QCF+J (Red Tape Shot)';
    if (id === 'professor') return 'SPECIALS: QCF+J (Bell Curve) | QCB+K (Sabbatical Buff)';
    if (id === 'maoist') return 'SPECIALS: DU+J (Great Leap) | DD+K (Self Crit)';
    if (id === 'debord') return 'SPECIALS: QCF+J (Spectacle Orb) | QCB+K (Invisible Hand)';
    return '';
  };

  if ((gameState === 'INTRO_CUTSCENE' || gameState === 'LOSE_CUTSCENE') && currentScenario) {
    const currentLine = currentScenario.dialogue[cutsceneIndex] ?? currentScenario.dialogue[currentScenario.dialogue.length - 1];
    const playerActor = currentScenario.actors.find((a: ScenarioActor) => a.position === 'left') ?? currentScenario.actors[0];
    const enemyActor = currentScenario.actors.find((a: ScenarioActor) => a.position === 'right') ?? currentScenario.actors[1];
    const storyBg = STORY_BACKGROUNDS[ladderIndex % STORY_BACKGROUNDS.length];

    return (
      <div
        className="w-full h-screen relative overflow-hidden text-white cursor-pointer"
        onClick={advanceCutscene}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${storyBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80" />
        <div className="absolute top-6 w-full flex flex-col items-center gap-2">
          <img src="/assets/logo.png" alt="logo" className="w-32 h-auto drop-shadow-[0_0_16px_rgba(0,0,0,0.8)]" />
          <div className="text-4xl font-black tracking-[0.3em]" style={{ fontFamily: 'Orbitron, monospace', textShadow: '0 0 12px #000' }}>
            {currentScenario.title}
          </div>
        </div>
        {/* VS Card (restored compact size) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-6 bg-black/60 border-2 border-yellow-500 px-6 py-4 shadow-2xl">
            <div className="flex flex-col items-center gap-2">
              {playerActor && CHARACTER_DATA[playerActor.characterId]?.portrait && (
                <img src={CHARACTER_DATA[playerActor.characterId].portrait} alt={playerActor.characterId} className="w-24 h-24 border-2 border-yellow-500 object-cover" />
              )}
              <div className="text-sm tracking-[0.2em]" style={{ fontFamily: 'Teko, sans-serif' }}>{playerActor?.characterId}</div>
            </div>
            <div className="text-5xl font-black text-yellow-300 drop-shadow-[0_0_10px_#000]" style={{ fontFamily: 'Orbitron, monospace', letterSpacing: '0.3em' }}>
              VS
            </div>
            <div className="flex flex-col items-center gap-2">
              {enemyActor && CHARACTER_DATA[enemyActor.characterId]?.portrait && (
                <img src={CHARACTER_DATA[enemyActor.characterId].portrait} alt={enemyActor.characterId} className="w-24 h-24 border-2 border-yellow-500 object-cover" />
              )}
              <div className="text-sm tracking-[0.2em]" style={{ fontFamily: 'Teko, sans-serif' }}>{enemyActor?.characterId}</div>
            </div>
          </div>
        </div>
        {/* Dialogue bar (extra large) */}
        <div className="absolute bottom-0 w-full flex items-end justify-center p-12">
          <div className="w-full max-w-7xl bg-black/85 border-4 border-yellow-500/80 shadow-2xl p-12 flex gap-10 items-center">
            {playerActor && CHARACTER_DATA[playerActor.characterId]?.portrait && (
              <img src={CHARACTER_DATA[playerActor.characterId].portrait} alt={playerActor.characterId} className="w-32 h-32 border-4 border-yellow-500 object-cover" />
            )}
            <div className="flex-1">
              {currentLine && (
                <>
                  <div className="text-xl uppercase tracking-[0.3em] text-yellow-300 mb-3">{currentLine.speaker}</div>
                  <div className="text-4xl leading-relaxed">{currentLine.text}</div>
                  <div className="text-lg text-gray-300 mt-3">{cutsceneIndex + 1} / {currentScenario.dialogue.length}</div>
                </>
              )}
            </div>
            {enemyActor && CHARACTER_DATA[enemyActor.characterId]?.portrait && (
              <img src={CHARACTER_DATA[enemyActor.characterId].portrait} alt={enemyActor.characterId} className="w-32 h-32 border-4 border-yellow-500 object-cover" />
            )}
          </div>
        </div>
        <div className="absolute bottom-4 w-full text-center text-yellow-300 text-xl font-semibold tracking-[0.25em] drop-shadow-[0_0_6px_#000]">
          CLICK OR PRESS ENTER TO ADVANCE
        </div>
      </div>
    );
  }

  if (gameState === 'TITLE') {
    return (
      <div
        className="w-full h-screen text-white flex flex-col items-center justify-center gap-10 relative overflow-hidden"
        style={{
          backgroundImage: "url('/assets/backgrounds/versus.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/60 to-black/85" />
        <div className="absolute inset-0 opacity-25 mix-blend-overlay" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 3px)',
        }} />
        <img
          src="/assets/logo.png"
          alt="Society of the Smacktacle: Detournament"
          className="w-[70vw] max-w-5xl h-auto drop-shadow-[0_0_40px_rgba(0,0,0,0.8)]"
        />
        <div
          className="relative text-5xl uppercase font-black text-yellow-300 px-6 py-4 tracking-[0.4em]"
          style={{
            fontFamily: 'monospace',
            imageRendering: 'pixelated',
            textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 2px 2px 4px rgba(0,0,0,0.6), 0 0 20px rgba(255,215,0,0.4)',
            WebkitTextStroke: '1px #000',
            letterSpacing: '0.35em',
            filter: 'blur(0.4px) contrast(140%) saturate(70%)'
          }}
        >
          PRESS ENTER TO START
          <div className="absolute inset-0 border-4 border-yellow-500/80 animate-pulse pointer-events-none" style={{ boxShadow: '0 0 20px rgba(255,215,0,0.8)' }} />
        </div>
      </div>
    );
  }

  if (gameState === 'CHAR_SELECT') {
    return (
      <div className="relative w-full h-screen bg-gradient-to-b from-black via-slate-900 to-black text-white flex flex-col p-12 gap-8 animate-fade-in overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/assets/backgrounds/versus.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/65 to-black/90" />
        <div className="pointer-events-none absolute inset-0 opacity-10 mix-blend-screen" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 3px)',
        }} />
        {/* Dragon watermark */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-10">
          <div
            className="w-[320px] h-[320px]"
            style={{
              backgroundImage: "url('/assets/props/effects/misc/dragon-emblem.png')",
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center'
            }}
          />
        </div>
        <div className="text-6xl font-black tracking-[0.35em] mb-4 text-yellow-200 text-center self-center" style={{ fontFamily: 'Orbitron, monospace', textShadow: '0 0 18px rgba(0,0,0,0.7)' }}>
          SELECT YOUR REPRESENTATION
        </div>
        <div className="grid gap-10 w-full max-w-[1600px] self-center animate-pop-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(24rem, 1fr))' }}>
          {roster.map(id => {
            const data = CHARACTER_DATA[id];
            const isSelected = selectedPlayerId === id;
            return (
              <button
                key={id}
                onClick={() => {
                  selectedPlayerRef.current = id;
                  setSelectedPlayerId(id);
                  audioManager.play('menuMove', { volume: 0.7 });
                }}
                className={`relative min-w-[22rem] border-2 ${isSelected ? 'border-yellow-400' : 'border-gray-700'} bg-gradient-to-br from-[#1a1a1a] via-[#0f0f0f] to-[#1a1a1a] p-8 flex items-center gap-6 hover:border-yellow-400 transition shadow-2xl w-full animate-card`}
                style={{
                  boxShadow: isSelected ? '0 0 24px rgba(234,179,8,0.45), 0 0 12px rgba(255,0,0,0.25)' : '0 0 14px rgba(0,0,0,0.6)',
                  transform: isSelected ? 'scale(1.03)' : undefined,
                  backgroundImage: 'linear-gradient(135deg, rgba(255,215,0,0.04), rgba(255,0,0,0.06), rgba(0,0,0,0))'
                }}
              >
                {/* Accent bar MK-style */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500/60 via-yellow-400/80 to-red-500/60 opacity-80" />
                {data.portrait && (
                  <img src={data.portrait} alt={data.name} className="w-28 h-28 object-cover border-2 border-gray-600 shadow-[0_0_12px_rgba(0,0,0,0.6)]" />
                )}
                <div className="flex flex-col items-start w-full text-left">
                  <div className="text-2xl md:text-3xl font-black uppercase leading-tight drop-shadow-[0_0_12px_rgba(0,0,0,0.8)]">{data.name}</div>
                  <div className="text-sm md:text-base text-gray-300 leading-tight">{data.archetype}</div>
                </div>
                {/* Coin icon when selected */}
                {isSelected && (
                  <div className="absolute -right-3 -top-3 w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 border-2 border-yellow-600 shadow-[0_0_18px_rgba(255,140,0,0.6)] flex items-center justify-center text-black font-black" style={{ fontFamily: 'Orbitron, monospace' }}>
                    ★
                  </div>
                )}
              </button>
            );
          })}
        </div>
      <button
        onClick={() => {
          selectedPlayerRef.current = selectedPlayerId;
          audioManager.play('menuConfirm', { volume: 0.8 });
          beginLadder(selectedPlayerId);
        }}
        className="mt-auto self-start px-8 py-4 bg-yellow-500 text-black font-black tracking-[0.35em] hover:bg-yellow-400 text-2xl shadow-xl"
        style={{ fontFamily: 'Orbitron, monospace' }}
      >
          REIFY
        </button>
        <div
          className="absolute bottom-8 w-full text-center text-yellow-300 text-3xl font-black tracking-[0.3em] drop-shadow-[0_0_16px_rgba(255,191,0,0.6)]"
          style={{ fontFamily: 'Orbitron, monospace', textShadow: '0 0 20px rgba(255,69,0,0.8)' }}
        >
          PRESS ENTER TO REIFY
        </div>

        <style>
          {`
            @keyframes fade-in {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes pop-grid {
              0% { transform: scale(0.98); opacity: 0.7; }
              50% { transform: scale(1.01); opacity: 1; }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes card-pulse {
              0% { box-shadow: 0 0 0 rgba(234, 179, 8, 0.0); transform: translateY(0); }
              50% { box-shadow: 0 0 18px rgba(234, 179, 8, 0.25); transform: translateY(-2px) scale(1.01); }
              100% { box-shadow: 0 0 0 rgba(234, 179, 8, 0.0); transform: translateY(0); }
            }
            .animate-fade-in {
              animation: fade-in 0.4s ease-out both;
            }
            .animate-pop-grid {
              animation: pop-grid 0.5s ease-out both;
            }
            .animate-card:hover {
              animation: card-pulse 0.9s ease-out;
            }
          `}
        </style>
      </div>
    );
  }

  // Calculate camera position - center between the two fighters
  const cameraX = (player.x + enemy.x) / 2;
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const cameraOffset = Math.max(0, Math.min(cameraX - screenWidth / 2, STAGE_RIGHT_BOUND - screenWidth));
  const showBoxes = false; // enable when debugging hit/hurt boxes
  const showDebug = false; // enable for runtime state overlay

  const computeHurtbox = (f: FighterState) => {
    const baseBottom = 80 + f.y;
    const isCrouching = f.action === 'CROUCH' || f.action.includes('CROUCH_ATTACK');
    const isAirborne = f.y > 0;
    const base = HURTBOX_SIZES[f.id] || { width: 50, height: 50 };
    const hurtWidth = isCrouching ? base.width * 0.8 : base.width;
    const hurtHeight = isCrouching ? base.height * 0.6 : isAirborne ? base.height * 0.8 : base.height;
    return {
      left: f.x - hurtWidth / 2,
      bottom: baseBottom,
      width: hurtWidth,
      height: hurtHeight
    };
  };

  const computeAttackBox = (f: FighterState) => {
    const move = getMoveData(f);
    if (!move) return null;
    const width = move.rangeX + 150;
    const height = move.rangeY + 150;
    // Bias less forward so the debug box hugs the fighter more
    const forwardBias = width * 0.25;
    const centerX = f.x + (f.facingLeft ? -forwardBias : forwardBias);
    const bottom = 80 + f.y;
    return {
      left: centerX - width / 2,
      bottom,
      width,
      height
    };
  };


  const debugKeys = Array.from(keysPressed.current);

  return (
    <div
      ref={rootRef}
  className="w-full h-screen overflow-hidden bg-black relative"
  tabIndex={0}
  onClick={e => (e.currentTarget as HTMLDivElement).focus()}
  style={{ outline: 'none' }}
>
      {/* Debord Toasty popup (bottom-right, head/shoulders) */}
      {toastyPopup && (
        <div
          key={`toasty-${toastyKey}`}
          className="pointer-events-none fixed right-3 bottom-3 z-50"
          style={{ animation: 'debordToastySlide 0.7s ease-out forwards' }}
        >
          <div className="relative w-64 h-64 overflow-hidden">
            <img
              src="/assets/noobsaibot/debord-toasty.png"
              alt="Debord Toasty"
              className="w-96 h-96 object-cover drop-shadow-[0_0_12px_rgba(0,0,0,0.9)]"
              style={{
                // No flip; show the original orientation
                objectPosition: 'center 5%' // focus on head/shoulders
              }}
            />
          </div>
          <style>
            {`
              @keyframes debordToastySlide {
                0% { transform: translate(140%, 20%) scale(0.9); opacity: 0; }
                20% { opacity: 1; }
                70% { transform: translate(0%, 0%) scale(1); opacity: 1; }
                100% { transform: translate(140%, 20%) scale(0.9); opacity: 0; }
              }
            `}
          </style>
        </div>
      )}

  {/* HUD - Fixed on screen, doesn't scroll */}
  <div className="absolute top-0 left-0 right-0 z-50 flex justify-between items-start p-4">
        <StatBar
          health={player.hp}
          meter={player.meter}
          meterName={playerData.meterName}
          roundsWon={player.roundsWon}
          side="left"
          characterName={playerData.name}
          portrait={playerData.portrait}
          styleLabel={(playerData.styles && playerData.styles[player.styleIndex]) || undefined}
        />

        <div className="flex flex-col items-center gap-2">
          <div className="mk-text text-white text-6xl font-black" style={{ fontFamily: 'Orbitron, monospace', textShadow: '0 0 20px rgba(255,255,255,0.5), 3px 3px 0 #000' }}>
            {timer}
          </div>
          {gameState === 'BONUS_STAGE' && (
            <div className="text-yellow-300 text-xl font-black tracking-[0.2em]" style={{ fontFamily: 'Teko, sans-serif' }}>
              COMMODITY HP: {cabinetHp}
            </div>
          )}
          <div className="text-2xl md:text-3xl text-gray-200 uppercase tracking-[0.2em] max-w-xl text-center leading-tight" style={{ fontFamily: 'Teko, sans-serif' }}>
            Stage {ladderIndex + 1} / {ladderOrder.length || 1} — {currentScenario?.title || 'Situation'}
          </div>
          {message && (
            <div className="mk-glow text-yellow-400 text-5xl font-black animate-pulse" style={{
              fontFamily: 'Orbitron, monospace',
              WebkitTextStroke: '2px #000',
              letterSpacing: '0.1em',
              textShadow: '0 0 30px #fbbf24, 0 0 60px #fbbf24, 3px 3px 0 #000, -2px -2px 0 #000'
            }}>
              {message}
            </div>
          )}
          {stageBanner && gameState === 'ROUND_START' && (
            <div className="text-3xl text-red-400 font-black uppercase tracking-[0.3em]" style={{ fontFamily: 'Teko, sans-serif' }}>
              {stageBanner}
            </div>
          )}
          {gameState === 'FINISH_HIM' && (
            <div className="flex flex-col items-center gap-1">
              <div className="text-red-500 text-5xl font-black tracking-[0.25em]" style={{ fontFamily: 'Teko, sans-serif' }}>
                CRITIQUE HIM!
              </div>
              <div className="text-red-400 text-2xl font-black" style={{ fontFamily: 'Teko, sans-serif', letterSpacing: '0.1em' }}>
                TIMER: {Math.ceil(finishTimer / 60)} | GET CLOSE + PRESS J
              </div>
              {Math.abs(player.x - enemy.x) < 350 && (
                <div className="text-green-400 text-3xl font-black animate-pulse" style={{ fontFamily: 'Teko, sans-serif', letterSpacing: '0.15em', textShadow: '0 0 20px #0f0' }}>
                  ★ IN RANGE - PRESS J! ★
                </div>
              )}
            </div>
          )}
          {toasty && (
            <div className="flex items-center gap-2">
              <div className="text-orange-400 text-4xl font-black animate-pulse" style={{ fontFamily: 'Teko, sans-serif', letterSpacing: '0.15em', textShadow: '0 0 12px #000' }}>
                TOASTY!
              </div>
            </div>
          )}
        </div>

        <StatBar
          health={enemy.hp}
          meter={enemy.meter}
          meterName={enemyData.meterName}
          roundsWon={enemy.roundsWon}
          side="right"
          characterName={enemyData.name}
          portrait={enemyData.portrait}
          styleLabel={(enemyData.styles && enemyData.styles[enemy.styleIndex]) || undefined}
        />
      </div>

      {/* Debug overlay (hidden by default) */}
      {showDebug && (
        <div className="absolute bottom-4 left-4 z-50 text-xs text-green-200 bg-black/70 p-2 border border-green-500" style={{ fontFamily: 'monospace' }}>
          <div>Game: {gameState}</div>
          <div>P: x{Math.round(player.x)} y{Math.round(player.y)} act:{player.action}</div>
          <div>E: x{Math.round(enemy.x)} y{Math.round(enemy.y)} act:{enemy.action}</div>
          <div>Keys: [{debugKeys.join(',')}]</div>
        </div>
      )}

      {/* Game world container - translates based on camera + screen shake */}
      <div
        className="absolute inset-0 transition-transform duration-100"
        style={{
          transform: `translateX(-${cameraOffset}px) translate(${screenShake.x}px, ${screenShake.y}px)`,
        }}
      >
        {/* Background (MK stage art provides ground) */}
        <div
          className="absolute inset-0"
          style={{
            width: '2400px',
            height: '1080px',
            backgroundImage: `url(${stageBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center bottom',
          }}
        />
        {gameState === 'BONUS_STAGE' && (
          <div
            className="absolute"
            style={{
              left: `${cabinetX - 162}px`,
              bottom: '80px',
              width: '351px',
              height: '648px',
              backgroundImage: "url('/assets/mklk/cabinet_umk3.png')",
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              opacity: Math.max(0, cabinetHp / CABINET_MAX_HP)
            }}
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-52 h-3 bg-red-900 border-2 border-yellow-500 shadow-lg">
              <div
                className="h-full bg-green-400"
                style={{ width: `${Math.max(0, (cabinetHp / CABINET_MAX_HP) * 100)}%`, transition: 'width 0.08s linear' }}
              />
            </div>
            {/* Hitbox visualization */}
            <div
              className="absolute inset-0 pointer-events-none border-2 border-yellow-500/50"
              style={{ boxShadow: '0 0 12px rgba(234,179,8,0.7)' }}
            />
            {/* Damage overlay */}
            {cabinetHp < CABINET_MAX_HP && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(255,0,0,0.25) 0%, rgba(0,0,0,0) 60%)',
                  mixBlendMode: 'multiply',
                  opacity: 0.8
                }}
              />
            )}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center text-yellow-300 text-sm font-black tracking-[0.15em]" style={{ fontFamily: 'Teko, sans-serif' }}>
              {cabinetHp > CABINET_MAX_HP * 0.66 ? 'INTACT' : cabinetHp > CABINET_MAX_HP * 0.33 ? 'CRACKED' : 'SHATTERED'}
            </div>
          </div>
        )}

      {/* Spectacle Mode Visual Overlay */}
      {(player.spectacleMode || enemy.spectacleMode) && (
        <div className="absolute inset-0 pointer-events-none z-5">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-blue-500/10 animate-pulse" />
          <div className="mk-glow absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-green-400 text-4xl font-black opacity-40" style={{
            fontFamily: 'Orbitron, monospace',
            letterSpacing: '0.15em',
            textShadow: '0 0 20px #4ade80, 0 0 40px #4ade80'
          }}>
            SPECTACLE MODE
          </div>
        </div>
      )}

      {/* Player */}
      <div
        className="absolute transition-all duration-75"
        style={{
          left: `${player.x}px`,
          bottom: `${80 + player.y}px`,
          transform: 'translateX(-50%)',
          filter: player.spectacleMode ? 'hue-rotate(120deg) saturate(2)' : undefined,
          outline: showBoxes ? '2px solid rgba(0,255,0,0.4)' : undefined,
          opacity: fatalityVictim ? 0 : 1 // Hide during fatality but keep in DOM
        }}
      >
        <NinjaRenderer
          charId={player.id}
          action={player.action === 'DIZZY' && gameState === 'FINISH_HIM' ? 'DIZZY' : player.action}
          frameTick={player.actionFrame}
          facingLeft={player.facingLeft}
        />
        {player.spectacleMode && (
          <div className="absolute inset-0 border-2 border-green-400 pointer-events-none animate-pulse" />
        )}
        {showBoxes && (
          <>
            {(() => {
              const hb = computeHurtbox(player);
              const atk = computeAttackBox(player);
              return (
                <>
                  <div
                    className="absolute"
                    style={{
                      left: `${hb.left - player.x}px`,
                      bottom: `${hb.bottom - (80 + player.y)}px`,
                      width: `${hb.width}px`,
                      height: `${hb.height}px`,
                      border: '2px solid rgba(0,255,0,0.7)',
                      backgroundColor: 'rgba(0,255,0,0.12)'
                    }}
                  />
                  {atk && (
                    <div
                      className="absolute"
                      style={{
                        left: `${atk.left - player.x}px`,
                        bottom: `${atk.bottom - (80 + player.y)}px`,
                        width: `${atk.width}px`,
                        height: `${atk.height}px`,
                        border: '2px dashed rgba(255,0,0,0.7)',
                        backgroundColor: 'rgba(255,0,0,0.1)'
                      }}
                    />
                  )}
                </>
              );
            })()}
          </>
        )}
      </div>

      {/* Enemy */}
      {gameState !== 'BONUS_STAGE' && (
        <div
          className="absolute transition-all duration-75"
          style={{
            left: `${enemy.x}px`,
            bottom: `${80 + enemy.y}px`,
            transform: 'translateX(-50%)',
            filter: enemy.spectacleMode ? 'hue-rotate(120deg) saturate(2)' : undefined,
            outline: showBoxes ? '2px solid rgba(255,255,0,0.4)' : undefined
            // Enemy stays visible - pamphlets in Fatality overlay (z-9999) will cover it
          }}
        >
          <NinjaRenderer
            charId={enemy.id}
            action={enemy.action}
            frameTick={enemy.actionFrame}
            facingLeft={enemy.facingLeft}
          />
          {enemy.spectacleMode && (
            <div className="absolute inset-0 border-2 border-green-400 pointer-events-none animate-pulse" />
          )}
          {showBoxes && (
            <>
              {(() => {
                const hb = computeHurtbox(enemy);
                const atk = computeAttackBox(enemy);
                return (
                  <>
                    <div
                      className="absolute"
                      style={{
                        left: `${hb.left - enemy.x}px`,
                        bottom: `${hb.bottom - (80 + enemy.y)}px`,
                        width: `${hb.width}px`,
                        height: `${hb.height}px`,
                        border: '2px solid rgba(255,255,0,0.7)',
                        backgroundColor: 'rgba(255,255,0,0.1)'
                      }}
                    />
                    {atk && (
                      <div
                        className="absolute"
                        style={{
                          left: `${atk.left - enemy.x}px`,
                          bottom: `${atk.bottom - (80 + enemy.y)}px`,
                          width: `${atk.width}px`,
                          height: `${atk.height}px`,
                          border: '2px dashed rgba(0,0,255,0.7)',
                          backgroundColor: 'rgba(0,0,255,0.08)'
                        }}
                      />
                    )}
                  </>
                );
              })()}
            </>
          )}
        </div>
      )}

      {/* Projectiles */}
      {projectiles.map(proj => (
        <div
          key={proj.id}
          className="absolute pointer-events-none z-10"
          style={{
            left: `${proj.x}px`,
            bottom: `${proj.y}px`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {proj.totalFrames && proj.frameWidth && proj.frameHeight && proj.sheetWidth && proj.sheetHeight ? (
            <div
              style={{
                width: `${proj.frameWidth * (proj.scale ?? 0.5)}px`,
                height: `${proj.frameHeight * (proj.scale ?? 0.5)}px`,
                backgroundImage: `url(${proj.sprite})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: `${proj.sheetWidth}px ${proj.sheetHeight}px`,
                backgroundPosition: `-${((proj.frame ?? 0) % Math.floor(proj.sheetWidth / proj.frameWidth)) * proj.frameWidth}px -${Math.floor((proj.frame ?? 0) / Math.floor(proj.sheetWidth / proj.frameWidth)) * proj.frameHeight}px`,
                imageRendering: 'pixelated'
              }}
            />
          ) : (
            <img
              src={proj.sprite}
              alt="projectile"
              className="object-contain"
              style={{
                imageRendering: 'pixelated',
                width: proj.ownerId === 'professor' || proj.ownerId === 'bureaucrat' ? '128px' : '64px',
                height: proj.ownerId === 'professor' || proj.ownerId === 'bureaucrat' ? '128px' : '64px'
              }}
            />
          )}
        </div>
      ))}

      {/* Blood Effects */}
      {bloodEffects.map(effect => (
        <div
          key={effect.id}
          className="absolute pointer-events-none z-20"
          style={{
            left: `${effect.x}px`,
            bottom: `${effect.y}px`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <img src={effect.src} alt="blood" className="w-24 h-24 object-contain" style={{ imageRendering: 'pixelated' }} />
        </div>
      ))}

      {/* Spark Effects */}
      {sparkEffects.map(effect => (
        <div
          key={effect.id}
          className="absolute pointer-events-none z-30"
          style={{
            left: `${effect.x}px`,
            bottom: `${effect.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <img src={effect.src} alt="spark" className="w-12 h-12 object-contain" style={{ imageRendering: 'pixelated' }} />
        </div>
      ))}

      {/* Smoke Effects */}
      {smokeEffects.map(effect => (
        <div
          key={effect.id}
          className="absolute pointer-events-none z-10"
          style={{
            left: `${effect.x}px`,
            bottom: `${effect.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <img src={effect.src} alt="smoke" className="w-24 h-24 object-contain opacity-80" style={{ imageRendering: 'pixelated' }} />
        </div>
      ))}

      {/* Damage Numbers */}
      {damageNumbers.map(dmg => (
        <DamageNumber
          key={dmg.id}
          id={dmg.id}
          damage={dmg.damage}
          x={dmg.x}
          y={dmg.y}
          isBlocked={dmg.isBlocked}
          onComplete={removeDamageNumber}
        />
      ))}

      {/* Combo Text Overlays */}
      {comboTexts.map(combo => (
        <div
          key={combo.id}
          className="absolute pointer-events-none animate-pulse"
          style={{
            left: `${combo.x}px`,
            bottom: `${combo.y}px`,
            transform: 'translate(-50%, -50%)',
            animation: 'comboFade 1.5s ease-out forwards',
          }}
        >
          <div
            className="text-6xl font-black tracking-wider"
            style={{
              fontFamily: 'Impact, sans-serif',
              color: '#FFD700',
              textShadow: '0 0 20px #FF0000, 0 0 40px #FF0000, 4px 4px 0px #000, -4px -4px 0px #000, 4px -4px 0px #000, -4px 4px 0px #000',
              WebkitTextStroke: '3px #000',
              letterSpacing: '0.1em',
            }}
          >
            {combo.text}
          </div>
        </div>
      ))}

      {/* Controls Hint */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-xs bg-black bg-opacity-80 px-4 py-2 rounded border border-yellow-600" style={{
        fontFamily: 'Teko, sans-serif',
        letterSpacing: '0.1em',
        textShadow: '1px 1px 2px #000'
      }}>
        ARROWS: MOVE | J/K: PUNCH | L/I: KICK | S: BLOCK | DOWN+J/L: CROUCH | SPACE: PARRY | DOWN+SPACE: SPECTACLE
      </div>
      {/* Special Move Hint */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-yellow-300 text-xs bg-black bg-opacity-80 px-4 py-2 rounded border border-yellow-600" style={{
        fontFamily: 'Teko, sans-serif',
        letterSpacing: '0.08em',
        textShadow: '1px 1px 2px #000'
      }}>
        {getSpecialInstructions(player.id)}
      </div>
      </div>
      {/* Close game world container */}

      {/* Fatality Overlay - positioned relative to viewport, NOT game world */}
      {fatalityVictim && (
        <Fatality
          key={`fatality-${fatalityVictim}`}
          victimId={fatalityVictim}
          attackerId={player.id}
          onComplete={handleFatalityComplete}
        />
      )}
    </div>
  );
}

export default App;
