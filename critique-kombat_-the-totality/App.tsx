
import React, { useState, useEffect, useRef } from 'react';
import { GameState, Character, ActionState, FighterState, BloodSplatter, Projectile, Scenario, StageId, FatalityEffect } from './types';
import { ROSTER, MAX_HP, GRAVITY, GROUND_Y, JUMP_FORCE, MOVE_SPEED, MOVES, ROUND_START_TEXT, BONUS_CAR_X, BOSS_PROJECTOR_X, SCENARIOS, PARRY_WINDOW, SPECTACLE_DURATION, LOSE_SCENARIOS, MOVE_LISTS } from './constants';
import { generateBattleBanters, generateCarBanter } from './services/geminiService';
import { CRTOverlay } from './components/CRTOverlay';
import { StatBar } from './components/Bars';
import { CharacterModel } from './components/CharacterModel';

const KEYS = {
  LEFT: 'ArrowLeft',
  RIGHT: 'ArrowRight',
  UP: 'ArrowUp',
  DOWN: 'ArrowDown',
  P1: 'a', P2: 's', K1: 'z', K2: 'x',
  BLOCK: ' ',
  STYLE: 'Shift'
};

const STAGE_WIDTH = 1500;
const MAX_PROJECTILES = 20; 
const INITIAL_PLAYER_X = 200;
const INITIAL_ENEMY_X = 600;

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [hoveredChar, setHoveredChar] = useState<Character | null>(null);
  const [opponent, setOpponent] = useState<Character | null>(null);
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [stage, setStage] = useState<number>(1);
  const [dialogue, setDialogue] = useState<string>("");
  const [speaker, setSpeaker] = useState<string>("");
  const [cutsceneIndex, setCutsceneIndex] = useState(0);
  const [finishTimer, setFinishTimer] = useState(0);

  // Refs
  const requestRef = useRef<number>();
  const playerRef = useRef<FighterState | null>(null);
  const enemyRef = useRef<FighterState | null>(null);
  const projectilesRef = useRef<Projectile[]>([]);
  const bloodRef = useRef<BloodSplatter[]>([]);
  const fatalityEffectsRef = useRef<FatalityEffect[]>([]);
  const keysPressed = useRef<Set<string>>(new Set());
  const inputBufferRef = useRef<string[]>([]);
  const gameTimeRef = useRef<number>(99);
  const lastTimeRef = useRef<number>(0);
  const bonusCarHpRef = useRef<number>(100);
  const bonusStageCompleteRef = useRef<boolean>(false);
  const bossProjectorHpRef = useRef<number>(100);
  const spectacleTimerRef = useRef<number>(0);
  const hasResetRound = useRef<boolean>(false);

  const [cameraX, setCameraX] = useState(0);
  const [hudState, setHudState] = useState({
    p1Hp: 100, p2Hp: 100, timer: 99, p1Rounds: 0, p2Rounds: 0,
    p1Meter: 0, p2Meter: 0, p1Combo: 0, p2Combo: 0, p1Style: 0,
    p1Titles: [] as string[], p2Titles: [] as string[]
  });

  // --- Input ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.repeat) return; // Debounce holding key
        const k = e.key;
        keysPressed.current.add(k.toLowerCase());
        keysPressed.current.add(k);
        
        // Input Buffer for Specials
        inputBufferRef.current.push(k.toLowerCase());
        if (inputBufferRef.current.length > 8) inputBufferRef.current.shift();

        if ((gameState === GameState.INTRO_CUTSCENE || gameState === GameState.LOSE_CUTSCENE) && e.key === 'Enter') advanceCutscene();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
        keysPressed.current.delete(e.key.toLowerCase());
        keysPressed.current.delete(e.key);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, cutsceneIndex]);

  const createFighter = (char: Character, x: number, direction: 1 | -1): FighterState => ({
    id: char.id,
    hp: MAX_HP, maxHp: MAX_HP, meter: 0,
    position: { x, y: 0 }, velocity: { x: 0, y: 0 },
    direction, action: ActionState.IDLE, frame: 0,
    isGrounded: true, hitbox: { width: 60, height: 120, offsetX: 0, offsetY: 0 },
    characterId: char.id, roundsWon: 0, comboCount: 0,
    styleIndex: 0, styles: char.styles
  });

  const speak = (name: string, text: string) => {
      setSpeaker(name); setDialogue(text);
      setTimeout(() => { setDialogue(""); setSpeaker(""); }, 3000);
  };

  const updatePhysics = (fighter: FighterState, speedMult: number) => {
    if (!fighter.isGrounded) fighter.velocity.y -= GRAVITY;
    fighter.position.x += fighter.velocity.x * speedMult;
    fighter.position.y += fighter.velocity.y;
    if (fighter.position.y < GROUND_Y) {
      fighter.position.y = GROUND_Y;
      fighter.velocity.y = 0;
      fighter.isGrounded = true;
      if (fighter.action === ActionState.JUMP || fighter.action === ActionState.JUMP_ATTACK_P || fighter.action === ActionState.JUMP_ATTACK_K) {
          fighter.action = ActionState.IDLE;
      }
    }
    // Stage Boundaries
    if (fighter.position.x < 50) fighter.position.x = 50;
    if (fighter.position.x > STAGE_WIDTH - 50) fighter.position.x = STAGE_WIDTH - 50;
    if (fighter.isGrounded) fighter.velocity.x *= 0.8; // Friction
  };

  const spawnProjectile = (owner: FighterState, type: 'paper' | 'book' | 'rope' | 'grade_f' | 'word_hazard' = 'paper') => {
      if (projectilesRef.current.length >= MAX_PROJECTILES) return;

      const isBoss = owner.id === 'debord';
      const bossWords = ["BOREDOM", "TOURISM", "SURVIVAL", "WORK"];
      const randomWord = bossWords[Math.floor(Math.random() * bossWords.length)];
      
      const startX = isBoss ? owner.position.x + (Math.random() * 600 - 300) : owner.position.x + (40 * owner.direction);
      const startY = isBoss ? 500 : owner.position.y + 240; // Spawn at Head/Chest height
      const velX = isBoss ? 0 : 12 * owner.direction;
      const velY = isBoss ? -5 : 0;

      projectilesRef.current.push({
          id: Date.now() + Math.random(),
          ownerId: owner.id,
          position: { x: startX, y: startY },
          velocity: { x: velX, y: velY },
          damage: 10,
          type: type,
          text: isBoss ? randomWord : undefined,
          active: true
      });
  };

  const checkMotionInput = (buffer: string[]) => {
      const len = buffer.length;
      if (len < 3) return null;
      const last3 = buffer.slice(-3);
      if (last3.some(k => k === 'arrowdown') && last3.some(k => k === 'arrowright')) return 'QCF';
      if (last3.some(k => k === 'arrowdown') && last3.some(k => k === 'arrowleft')) return 'QCB';
      if (last3.some(k => k === 'arrowdown') && last3.some(k => k === 'arrowup')) return 'DU';
      if (buffer.slice(-2).every(k => k === 'arrowdown')) return 'DD';
      return null;
  };

  const processInput = (fighter: FighterState, keys: Set<string>) => {
    if (fighter.action === ActionState.HIT_STUN && fighter.meter >= 50) {
        if (keys.has(KEYS.BLOCK) && (keys.has(KEYS.RIGHT) || keys.has(KEYS.LEFT))) {
             fighter.meter -= 50;
             fighter.action = ActionState.IDLE;
             fighter.velocity.x = -15 * fighter.direction; 
             fighter.velocity.y = 5;
             speak(ROSTER.find(c=>c.id===fighter.id)?.name || "", "INTERRUPTION!");
             return;
        }
    }
    const isLocked = [
        ActionState.ATTACK_LP, ActionState.ATTACK_RP, ActionState.ATTACK_LK, ActionState.ATTACK_RK, 
        ActionState.JUMP_ATTACK_P, ActionState.JUMP_ATTACK_K, ActionState.CROUCH_ATTACK_P, ActionState.CROUCH_ATTACK_K,
        ActionState.HIT_STUN, ActionState.KNOCKDOWN, ActionState.VICTORY, ActionState.DEFEAT, 
        ActionState.GRABBED, ActionState.INTRO, ActionState.FATALITY, ActionState.PARRY, 
        ActionState.SPECIAL_1, ActionState.SPECIAL_2, ActionState.SPECIAL_3, ActionState.SPECIAL_4, 
        ActionState.DEFEAT_SELLOUT, ActionState.DEFEAT_FATAL, ActionState.DIZZY, ActionState.TIME_OVER
    ].includes(fighter.action);
    if (isLocked) return;
    if (keys.has(KEYS.STYLE.toLowerCase()) || keys.has(KEYS.STYLE)) {
        if (!fighter.isSpeaking) {
             fighter.styleIndex = fighter.styleIndex === 0 ? 1 : 0;
             fighter.isSpeaking = true; 
             setTimeout(() => fighter.isSpeaking = false, 500);
        }
    }
    const motion = checkMotionInput(inputBufferRef.current);
    if (keys.has(KEYS.P1) || keys.has(KEYS.P2)) {
         if (motion === 'QCF') { setAction(fighter, ActionState.SPECIAL_1); return; }
         if (motion === 'QCB') { setAction(fighter, ActionState.SPECIAL_2); return; }
         if (motion === 'DU') { setAction(fighter, ActionState.SPECIAL_3); return; }
    }
    if (keys.has(KEYS.K1) || keys.has(KEYS.K2)) {
         if (motion === 'QCB') { setAction(fighter, ActionState.SPECIAL_2); return; }
         if (motion === 'DU') { setAction(fighter, ActionState.SPECIAL_3); return; }
         if (motion === 'DD') { setAction(fighter, ActionState.SPECIAL_4); return; }
    }
    if (fighter.meter >= 100 && keys.has(' ') && keys.has('arrowdown')) {
        fighter.meter = 0;
        spectacleTimerRef.current = SPECTACLE_DURATION;
        speak(ROSTER.find(c=>c.id===fighter.id)?.name || "", "THE SITUATION HAS BEEN CONSTRUCTED!");
        return;
    }
    if (keys.has(KEYS.P1)) {
        if (!fighter.isGrounded) setAction(fighter, ActionState.JUMP_ATTACK_P);
        else if (keys.has(KEYS.DOWN)) setAction(fighter, ActionState.CROUCH_ATTACK_P);
        else setAction(fighter, ActionState.ATTACK_LP);
    }
    else if (keys.has(KEYS.P2)) {
        if (!fighter.isGrounded) setAction(fighter, ActionState.JUMP_ATTACK_P);
        else if (keys.has(KEYS.DOWN)) setAction(fighter, ActionState.CROUCH_ATTACK_P);
        else setAction(fighter, ActionState.ATTACK_RP);
    }
    else if (keys.has(KEYS.K1)) {
        if (!fighter.isGrounded) setAction(fighter, ActionState.JUMP_ATTACK_K);
        else if (keys.has(KEYS.DOWN)) setAction(fighter, ActionState.CROUCH_ATTACK_K);
        else setAction(fighter, ActionState.ATTACK_LK);
    }
    else if (keys.has(KEYS.K2)) {
        if (!fighter.isGrounded) setAction(fighter, ActionState.JUMP_ATTACK_K);
        else if (keys.has(KEYS.DOWN)) setAction(fighter, ActionState.CROUCH_ATTACK_K);
        else setAction(fighter, ActionState.ATTACK_RK);
    }
    else if (keys.has(KEYS.LEFT)) {
      fighter.velocity.x = -MOVE_SPEED;
      fighter.action = ActionState.WALK_BACKWARD; 
    }
    else if (keys.has(KEYS.RIGHT)) {
      fighter.velocity.x = MOVE_SPEED;
      fighter.action = ActionState.WALK_FORWARD;
    }
    else if (keys.has(KEYS.UP) && fighter.isGrounded) {
      fighter.velocity.y = JUMP_FORCE;
      fighter.isGrounded = false;
      fighter.action = ActionState.JUMP;
    }
    else if (keys.has(KEYS.DOWN) && fighter.isGrounded) {
       fighter.action = ActionState.CROUCH;
       fighter.velocity.x = 0;
    } else if (fighter.isGrounded) {
        fighter.action = ActionState.IDLE;
    }
    if (enemyRef.current && gameState === GameState.FIGHTING) {
         if (fighter.position.x < enemyRef.current.position.x) fighter.direction = 1;
         else fighter.direction = -1;
    }
  };

  const setAction = (fighter: FighterState, action: ActionState) => {
    fighter.action = action;
    fighter.frame = 0;
    const moveset = MOVES[fighter.id] || MOVES.default;
    const move = moveset[action] || MOVES.default[action];
    if (move?.isProjectile) setTimeout(() => spawnProjectile(fighter, move.name === 'The Bell Curve' ? 'grade_f' : 'paper'), move.startup * 16);
    if (fighter.id === 'professor' && action === ActionState.SPECIAL_3) speak("Professor", "See you next fall.");
    if (fighter.id === 'maoist' && action === ActionState.SPECIAL_3) speak("Maoist", "FORWARD!");
  };

  const spawnFatalityEffect = (target: FighterState, winnerId: string) => {
      let type: FatalityEffect['type'] = 'tv_drop';
      if (winnerId === 'bureaucrat') type = 'stamp';
      if (winnerId === 'professor') type = 'grade_crush';
      if (winnerId === 'maoist') type = 'crowd_rush';
      
      fatalityEffectsRef.current.push({
          id: Date.now(),
          type,
          x: target.position.x,
          y: 600, // Spawn high above
          frame: 0
      });
  };

  const checkCollisions = () => {
      const p1 = playerRef.current;
      const p2 = enemyRef.current;
      if (!p1 || !p2) return;
      if (stage === 3 && p1.action.includes('ATTACK')) {
          const move = (MOVES[p1.id]?.[p1.action] || MOVES.default[p1.action]);
          if (move && Math.abs(p1.position.x - BOSS_PROJECTOR_X) < 100 && p1.frame === move.active) {
              bossProjectorHpRef.current -= move.damage;
              bloodRef.current.push(createBlood(BOSS_PROJECTOR_X, 100, true)); // Sparks
              if (bossProjectorHpRef.current <= 0) {
                  setGameState(GameState.BSOD);
                  return;
              }
          }
      }
      const handleHit = (attacker: FighterState, defender: FighterState, isProjectile = false) => {
           // Hit Detection for FINISH HIM
           if (gameState === GameState.FINISH_HIM && defender.action === ActionState.DIZZY) {
               // Verify distance to trigger
               const dist = Math.abs(attacker.position.x - defender.position.x);
               if (dist < 150) { // Must be close
                   attacker.action = ActionState.FATALITY;
                   defender.action = ActionState.DEFEAT_FATAL;
                   defender.hp = 0;
                   spawnFatalityEffect(defender, attacker.id);
                   speak("Announcer", "TOTAL NEGATION!");
                   setTimeout(() => handleMatchEnd(attacker.id), 4000);
               }
               return;
           }
           const move = isProjectile ? null : (MOVES[attacker.id]?.[attacker.action] || MOVES.default[attacker.action]);
           if (!move && !isProjectile) return;
           const damage = isProjectile ? 10 : (move?.damage || 5);
           let hit = isProjectile;
           if (!isProjectile && move && attacker.frame >= move.startup && attacker.frame < move.startup + move.active) {
               const dist = Math.abs(attacker.position.x - defender.position.x);
               if (dist < move.rangeX && Math.abs(attacker.position.y - defender.position.y) < 50) hit = true;
           }
           if (hit && ![ActionState.HIT_STUN, ActionState.KNOCKDOWN, ActionState.DEFEAT, ActionState.DEFEAT_SELLOUT, ActionState.DEFEAT_FATAL, ActionState.DIZZY, ActionState.TIME_OVER].includes(defender.action)) {
               if (keysPressed.current.has(KEYS.BLOCK) && defender.id === p1.id) { 
                   defender.action = ActionState.PARRY;
                   defender.frame = 0;
                   defender.meter = Math.min(100, defender.meter + 20);
                   bloodRef.current.push(createBlood(defender.position.x, defender.position.y + 60, true)); // Block Spark
                   speak(ROSTER.find(c=>c.id===defender.id)?.name || "", "CO-OPTED!");
                   return;
               }
               if (move?.isGrab) {
                   defender.action = ActionState.GRABBED;
                   defender.hp -= damage;
                   defender.meter = 0; 
                   speak("Announcer", "ACCESS DENIED");
               } else {
                   defender.hp -= damage;
                   defender.action = ActionState.HIT_STUN;
                   defender.frame = 0;
                   defender.velocity.x = (move?.knockback || 10) * attacker.direction * 5; 
                   defender.comboCount = 0;
                   attacker.comboCount++;
                   if (attacker.comboCount % 3 === 0) {
                       attacker.meter = Math.min(100, attacker.meter + 5);
                   }
               }
               attacker.meter = Math.min(100, attacker.meter + 10);
               defender.meter = Math.min(100, defender.meter + 5);
               bloodRef.current.push(createBlood(defender.position.x, defender.position.y));
               if (defender.hp < 20 && !defender.isSoldOut) {
                   defender.isSoldOut = true;
                   speak(ROSTER.find(c=>c.id===defender.id)?.name || "", "I love Big Brother.");
               }
               if (defender.hp <= 0) {
                   defender.hp = 0;
                   if (gameState === GameState.FIGHTING) handleRoundEnd(attacker);
               }
           }
      };
      projectilesRef.current.forEach(proj => {
          if (!proj.active) return;
          const target = proj.ownerId === p1.id ? p2 : p1;
          const dist = Math.abs(proj.position.x - target.position.x);
          if (dist < 60 && Math.abs(proj.position.y - (target.position.y + 200)) < 150) { 
              handleHit(proj.ownerId === p1.id ? p1 : p2, target, true);
              proj.active = false;
          }
      });
      handleHit(p1, p2);
      handleHit(p2, p1);
  };

  const handleTimeOver = () => {
      const p1 = playerRef.current;
      const p2 = enemyRef.current;
      if (!p1 || !p2) return;
      speak("Announcer", "HISTORY HAS ENDED");
      p1.action = ActionState.TIME_OVER; p2.action = ActionState.TIME_OVER;
      p1.velocity.x = 0; p2.velocity.x = 0;
      setTimeout(() => {
          if (p1.hp > p2.hp) handleRoundEnd(p1);
          else if (p2.hp > p1.hp) handleRoundEnd(p2);
          else { speak("Announcer", "MUTUAL DESTRUCTION"); setTimeout(resetRound, 3000); }
      }, 2000);
  };

  const handleRoundEnd = (winner: FighterState) => {
      if (hasResetRound.current) return;
      hasResetRound.current = true;
      winner.roundsWon += 1;
      if (winner.roundsWon >= 2) {
           setGameState(GameState.FINISH_HIM);
           const loser = winner.id === playerRef.current?.id ? enemyRef.current : playerRef.current;
           if (loser) { loser.action = ActionState.DIZZY; loser.hp = 0; }
           speak("Announcer", "CRITIQUE HIM!");
           setFinishTimer(5);
           hasResetRound.current = false;
      } else {
           speak("Announcer", "ANTITHESIS...");
           setTimeout(() => resetRound(), 2000);
      }
  };

  const resetRound = () => {
      if (!playerRef.current || !enemyRef.current) return;
      playerRef.current.hp = MAX_HP; enemyRef.current.hp = MAX_HP;
      playerRef.current.position = { x: INITIAL_PLAYER_X, y: 0 };
      enemyRef.current.position = { x: INITIAL_ENEMY_X, y: 0 };
      playerRef.current.action = ActionState.IDLE; enemyRef.current.action = ActionState.IDLE;
      playerRef.current.comboCount = 0; enemyRef.current.comboCount = 0;
      gameTimeRef.current = 99; projectilesRef.current = []; bloodRef.current = []; hasResetRound.current = false;
  };

  const handleMatchEnd = (winnerId: string) => {
      if (winnerId !== playerRef.current?.id) {
          const charId = playerRef.current?.id || 'khayati';
          const loseScenario = LOSE_SCENARIOS[charId] || LOSE_SCENARIOS['khayati'];
          setCurrentScenario(loseScenario);
          setCutsceneIndex(0);
          setTimeout(() => setGameState(GameState.LOSE_CUTSCENE), 2000);
      } else {
          if (stage === 1) { setTimeout(() => { setStage(2); startBonusStage(); }, 3000); } 
          else if (stage === 3) { setTimeout(() => setGameState(GameState.BSOD), 3000); }
          else { setStage(3); startFight(); }
      }
  };

  const createBlood = (x: number, y: number, isSpark = false) => ({
      id: Date.now() + Math.random(),
      x: x + (Math.random() * 60 - 30), y: y + (isSpark ? 0 : 150) + (Math.random() * 40),
      scale: isSpark ? 1 : 0.5 + Math.random(), 
      rotation: Math.random() * 360, 
      opacity: 1,
      isSpark // New property to distinguish blood from hit sparks
  });

  const updateBonusStage = (p1: FighterState) => {
      processInput(p1, keysPressed.current);
      updatePhysics(p1, 1);
      p1.frame++;
      if (p1.position.x < 100) p1.position.x = 100;
      if (p1.position.x > BONUS_CAR_X - 60) p1.position.x = BONUS_CAR_X - 60;
      const moveset = MOVES[p1.id] || MOVES.default;
      const move = moveset[p1.action] || MOVES.default[p1.action];
      if (move && p1.frame === move.startup) {
          if (Math.abs((p1.position.x + 60) - BONUS_CAR_X) < 120) {
              bonusCarHpRef.current -= 8;
              bloodRef.current.push(createBlood(BONUS_CAR_X, 100, true)); // Sparks, raised Y
              if (bonusCarHpRef.current <= 0 && !bonusStageCompleteRef.current) {
                  bonusStageCompleteRef.current = true;
                  speak("Announcer", "URBANISM IS PURGED!");
                  setTimeout(() => {
                      setStage(3);
                      setOpponent(ROSTER.find(c => c.id === 'debord') || null);
                      const bossScenarioKey = `${p1.id}_vs_debord`;
                      setCurrentScenario(SCENARIOS[bossScenarioKey] || SCENARIOS['khayati_vs_debord']);
                      setGameState(GameState.INTRO_CUTSCENE);
                      setCutsceneIndex(0);
                  }, 2000);
              }
          }
      }
      if (p1.frame > (move ? move.startup + move.active + move.recovery : 20)) {
           p1.action = ActionState.IDLE;
      }
      setHudState({
        p1Hp: p1.hp, p2Hp: bonusCarHpRef.current, timer: gameTimeRef.current,
        p1Rounds: p1.roundsWon, p2Rounds: 0,
        p1Meter: p1.meter, p2Meter: 0, p1Combo: 0, p2Combo: 0, p1Style: p1.styleIndex,
        p1Titles: selectedChar?.comboTitles || [], p2Titles: []
      });
  }

  const gameLoop = (time: number) => {
    if (gameState !== GameState.FIGHTING && gameState !== GameState.BONUS_STAGE && gameState !== GameState.FINISH_HIM) return;
    if (time - lastTimeRef.current > 1000) {
        if (gameTimeRef.current > 0) gameTimeRef.current -= 1;
        else if (gameTimeRef.current === 0 && gameState === GameState.FIGHTING) handleTimeOver();
        
        if (gameState === GameState.FINISH_HIM) {
             if (finishTimer > 0) setFinishTimer(prev => prev - 1);
             else {
                 // Failsafe: if timer runs out and no fatality happened, end match anyway
                 const p1 = playerRef.current;
                 if (p1 && enemyRef.current && enemyRef.current.action === ActionState.DIZZY) {
                     enemyRef.current.action = ActionState.DEFEAT;
                     p1.action = ActionState.VICTORY;
                     handleMatchEnd(p1.id);
                 }
             }
        }
        lastTimeRef.current = time;
    }
    
    // Process Fatality Effects
    let crushHappened = false;
    fatalityEffectsRef.current.forEach(f => {
        if (f.y > 0) {
            f.y -= 25; // Speed of drop
            if (f.y < 0) {
                f.y = 0;
                crushHappened = true;
                // Add impact blood
                for (let i = 0; i < 5; i++) bloodRef.current.push(createBlood(f.x, 0));
            }
        }
    });
    
    const p1 = playerRef.current;
    const p2 = enemyRef.current;

    // Crush Logic
    if (crushHappened && p2 && p2.action === ActionState.DEFEAT_FATAL) {
        // We will handle the visual squash in CharacterModel based on DEFEAT_FATAL + logic check
        // But for state, we might want to ensure they stay grounded
        p2.velocity.y = 0;
        p2.position.y = GROUND_Y;
    }

    if (gameState === GameState.BONUS_STAGE && playerRef.current) {
        updateBonusStage(playerRef.current);
        requestRef.current = requestAnimationFrame(gameLoop);
        return;
    }
    
    if (p1 && (p2 || gameState === GameState.BONUS_STAGE) && p1.action !== ActionState.TIME_OVER) {
        if (spectacleTimerRef.current > 0) {
            spectacleTimerRef.current--;
            p1.isWireframe = true; 
            if (p2) p2.isWireframe = true;
        } else {
            p1.isWireframe = false; 
            if (p2) p2.isWireframe = false;
        }
        const timeScaleP1 = spectacleTimerRef.current > 0 ? 1.5 : 1;
        const timeScaleP2 = spectacleTimerRef.current > 0 ? 0.5 : 1;
        if (gameState !== GameState.FINISH_HIM) {
            processInput(p1, keysPressed.current);
            if (p2 && p2.hp > 0 && p2.action !== ActionState.TIME_OVER) {
                 const dist = Math.abs(p2.position.x - p1.position.x);
                 if (p2.position.x < p1.position.x) p2.direction = 1; else p2.direction = -1;
                 if (Math.random() < 0.05) {
                     if (dist > 100) { p2.velocity.x = p2.direction * MOVE_SPEED; p2.action = ActionState.WALK_FORWARD; }
                     else { p2.action = ActionState.ATTACK_RP; }
                 }
                 updatePhysics(p2, timeScaleP2);
            }
        } else {
            processInput(p1, keysPressed.current);
            // Collision check handles fatality trigger
        }
        updatePhysics(p1, timeScaleP1);
        if (stage === 3 && p2 && Math.random() < 0.02 && projectilesRef.current.length < MAX_PROJECTILES && gameState === GameState.FIGHTING) {
             spawnProjectile(p2, 'word_hazard');
        }
        projectilesRef.current.forEach(p => {
            if (p.active) {
                p.position.x += p.velocity.x;
                p.position.y += p.velocity.y;
                if (p.position.x < -100 || p.position.x > STAGE_WIDTH + 100 || p.position.y < -100 || p.position.y > 1000) p.active = false;
            }
        });
        projectilesRef.current = projectilesRef.current.filter(p => p.active);
        [p1, p2].forEach(f => {
             if (!f) return;
             
             // Prevent Dizzy/Fatal loop from exiting if in FINISH HIM state
             if ((f.action === ActionState.DIZZY || f.action === ActionState.DEFEAT_FATAL) && gameState === GameState.FINISH_HIM) {
                 f.frame++; 
                 // Do not reset to IDLE
                 return;
             }

             if (f.action !== ActionState.INTRO && f.action !== ActionState.DIZZY && f.action !== ActionState.TIME_OVER && f.action !== ActionState.FATALITY && f.action !== ActionState.DEFEAT_FATAL) f.frame++;
             const charMoves = MOVES[f.id] || {};
             const move = charMoves[f.action] || MOVES.default[f.action];
             if (move && f.frame >= move.startup + move.active + move.recovery) f.action = ActionState.IDLE;
        });
        checkCollisions();
        let targetCamX = 0;
        if (p2) {
             const midX = (p1.position.x + p2.position.x) / 2;
             targetCamX = midX - (window.innerWidth / 2);
        } else {
             targetCamX = p1.position.x - (window.innerWidth / 2);
        }
        targetCamX = Math.max(0, Math.min(targetCamX, STAGE_WIDTH - window.innerWidth));
        setCameraX(prev => prev + (targetCamX - prev) * 0.1);
        setHudState({
            p1Hp: p1.hp, p2Hp: p2 ? p2.hp : 0, timer: gameTimeRef.current,
            p1Rounds: p1.roundsWon, p2Rounds: p2 ? p2.roundsWon : 0,
            p1Meter: p1.meter, p2Meter: p2 ? p2.meter : 0,
            p1Combo: p1.comboCount, p2Combo: p2 ? p2.comboCount : 0, p1Style: p1.styleIndex || 0,
            p1Titles: selectedChar?.comboTitles || [], p2Titles: opponent?.comboTitles || []
        });
    }
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    if (gameState === GameState.FIGHTING || gameState === GameState.BONUS_STAGE || gameState === GameState.FINISH_HIM) requestRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [gameState]);

  const startGame = () => { setStage(1); setGameState(GameState.CHARACTER_SELECT); };
  
  const startBonusStage = () => {
      playerRef.current = createFighter(selectedChar!, INITIAL_PLAYER_X, 1);
      enemyRef.current = null;
      bonusCarHpRef.current = 100;
      bonusStageCompleteRef.current = false;
      gameTimeRef.current = 30; 
      setGameState(GameState.BONUS_STAGE);
      setCameraX(0);
  };

  const selectCharacter = (char: Character) => {
    setSelectedChar(char);
    const enemies = ROSTER.filter(c => c.id !== char.id && c.id !== 'debord');
    const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
    setOpponent(randomEnemy);
    const scenarioKey = `${char.id}_vs_${randomEnemy.id}`;
    setCurrentScenario(SCENARIOS[scenarioKey] || SCENARIOS['khayati_vs_bureaucrat']);
    setCutsceneIndex(0);
    setGameState(GameState.INTRO_CUTSCENE);
  };

  const advanceCutscene = () => {
      if (!currentScenario) return;
      if (cutsceneIndex < currentScenario.dialogue.length - 1) {
          setCutsceneIndex(prev => prev + 1);
      } else {
          if (gameState === GameState.LOSE_CUTSCENE) setGameState(GameState.GAME_OVER);
          else startFight();
      }
  };

  const startFight = () => {
    let enemy = opponent;
    if (stage === 3) enemy = ROSTER.find(c => c.id === 'debord') || selectedChar; 
    if (!enemy) return;
    
    playerRef.current = createFighter(selectedChar!, INITIAL_PLAYER_X, 1);
    enemyRef.current = createFighter(enemy, INITIAL_ENEMY_X, -1);
    
    if (stage === 3) enemyRef.current.id = 'debord';
    
    bossProjectorHpRef.current = 100;
    projectilesRef.current = []; bloodRef.current = [];
    gameTimeRef.current = 99;
    setCameraX(0);
    hasResetRound.current = false;
    fatalityEffectsRef.current = [];
    setGameState(GameState.FIGHTING);
  };

  const renderBackground = () => {
      const px = (factor: number) => ({ transform: `translateX(${-cameraX * factor}px)` });
      
      const overlayColor = stage === 1 ? '#4a5d23' : 
                           stage === 2 ? '#253a5a' : 
                           '#5a1a1a';                
      const blendMode = stage === 2 ? 'soft-light' : 'color-burn';
      
      return (
        <div className="absolute inset-0 w-full h-full preserve-3d">
            <div className="absolute inset-0 pointer-events-none z-40 opacity-60" style={{ backgroundColor: overlayColor, mixBlendMode: blendMode as any }}></div>
            <div className="absolute inset-0 pointer-events-none z-50 opacity-50" 
                 style={{ background: 'radial-gradient(circle at 50% 50%, transparent 20%, rgba(0,0,0,0.8) 100%)' }}></div>

            <div className="absolute top-0 left-0 w-[200vw] h-[800px] -z-20 bg-gradient-to-b from-black to-gray-900" style={px(0.1)}>
                {stage === 1 && (
                    <div className="w-full h-full bg-[#222]">
                         <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_100px,#000_100px,#000_120px)] opacity-50"></div>
                         <div className="absolute top-20 left-20 text-[8rem] font-black text-[#111] opacity-50">INDUSTRY</div>
                    </div>
                )}
                {stage === 2 && (
                    <div className="w-full h-full bg-[#889] perspective-[500px]">
                         {[...Array(6)].map((_, i) => (
                             <div key={i} className="absolute h-full w-40 bg-gray-400 border-x-4 border-black transform" 
                                  style={{ left: i * 300, transform: 'skewX(-10deg)' }}></div>
                         ))}
                    </div>
                )}
                {stage === 3 && (
                    <div className="w-full h-full bg-black flex items-center justify-center">
                         <div className="w-[800px] h-[400px] bg-white/10 relative overflow-hidden box-border border-8 border-[#333]">
                             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/noise.png')] opacity-30"></div>
                         </div>
                    </div>
                )}
            </div>

            <div className="absolute bottom-[-100px] left-[-500px] w-[3000px] h-[1000px] origin-top -z-10"
                 style={{ 
                     transform: `rotateX(75deg) translateZ(0) translateX(${-cameraX}px)`,
                     backgroundSize: '128px 128px',
                     backgroundImage: stage === 2 ? 'linear-gradient(45deg, #ccc 25%, #bbb 25%, #bbb 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)' 
                                    : stage === 3 ? 'linear-gradient(to right, #300 4px, transparent 4px), linear-gradient(to bottom, #300 4px, transparent 4px)'
                                    : 'linear-gradient(to right, #444 2px, transparent 2px), linear-gradient(to bottom, #444 2px, transparent 2px)',
                     backgroundColor: stage === 2 ? '#ddd' : stage === 3 ? '#100' : '#222',
                     boxShadow: 'inset 0 0 200px rgba(0,0,0,0.9)'
                 }}>
            </div>
        </div>
      );
  };

  const renderInstructions = () => {
    if (gameState !== GameState.FIGHTING && gameState !== GameState.BONUS_STAGE && gameState !== GameState.FINISH_HIM) return null;
    if (!selectedChar) return null;
    const moves = MOVE_LISTS[selectedChar.id] || [];
    const showSpectacleAlert = hudState.p1Meter >= 100;
    return (
        <>
            <div className="absolute top-48 left-4 z-40 bg-black/70 border border-white/20 p-2 text-white font-mono text-xs pointer-events-none opacity-80 hover:opacity-100 transition-opacity transform -rotate-1">
                <p className="text-yellow-400 font-bold border-b border-gray-600 mb-1 tracking-widest bg-red-900/50">TECHNIQUES</p>
                {moves.map((m, i) => <div key={i} className="mb-1">{m}</div>)}
            </div>
            {showSpectacleAlert && (
                <div className="absolute top-32 w-full text-center z-40 pointer-events-none">
                     <p className="text-yellow-300 font-black text-2xl animate-pulse bg-black/80 inline-block px-4 border-2 border-white transform rotate-2">SPECTACLE READY: SPACE + DOWN</p>
                </div>
            )}
        </>
    );
  };

  const renderFighting = () => {
    if (!playerRef.current) return null;
    const p1 = playerRef.current;
    const p2 = enemyRef.current;
    const isDark = gameState === GameState.FINISH_HIM;

    // Determine if victim is crushed for rendering pass
    const isP2Crushed = p2 && p2.action === ActionState.DEFEAT_FATAL && fatalityEffectsRef.current.some(f => f.y === 0);

    return (
        <div className={`h-full w-full relative overflow-hidden`}>
            {renderInstructions()}
            
            <div className="absolute inset-0 w-full h-full pointer-events-none preserve-3d">
                {renderBackground()}
            </div>

            <div className="absolute inset-0 w-full h-full" style={{ transform: `translateX(${-cameraX}px)` }}>
                
                {gameState === GameState.BONUS_STAGE && (
                    <div className="absolute bottom-[160px] z-20" style={{ left: BONUS_CAR_X }}>
                        {/* W140 Style Luxury Sedan */}
                        <div className={`w-[450px] h-[140px] relative transition-all duration-100 origin-bottom 
                            ${bonusCarHpRef.current < 50 ? 'skew-x-2 scale-y-95' : ''}
                            ${bonusCarHpRef.current < 20 ? 'scale-y-60 skew-x-6 rotate-1' : ''}
                        `}>
                            {/* Wheels */}
                            <div className="absolute bottom-[-25px] left-10 w-24 h-24 bg-black rounded-full border-4 border-gray-600 shadow-xl overflow-hidden">
                                <div className="absolute inset-2 border-4 border-gray-400 rounded-full border-dashed"></div>
                            </div>
                            <div className="absolute bottom-[-25px] right-10 w-24 h-24 bg-black rounded-full border-4 border-gray-600 shadow-xl overflow-hidden">
                                <div className="absolute inset-2 border-4 border-gray-400 rounded-full border-dashed"></div>
                            </div>
                            
                            {/* Main Body */}
                            <div className="absolute bottom-6 left-0 w-full h-32 bg-gray-300 border-2 border-black rounded-sm shadow-inner"
                                 style={{ background: 'linear-gradient(to bottom, #ddd 0%, #aaa 50%, #888 100%)' }}>
                                {/* Trim */}
                                <div className="absolute top-12 w-full h-2 bg-black opacity-80"></div>
                                <div className="absolute bottom-2 w-full h-6 bg-gray-800"></div>
                            </div>
                            
                            {/* Greenhouse (Windows) */}
                            <div className="absolute bottom-36 left-12 w-[360px] h-20 bg-gray-400 border-2 border-black transform skew-x-[-10deg]">
                                <div className="flex h-full w-full">
                                    <div className="flex-1 bg-[#112] border-r-4 border-gray-400 opacity-90 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-tr from-transparent to-white opacity-20"></div>
                                    </div>
                                    <div className="flex-1 bg-[#112] border-r-4 border-gray-400 opacity-90 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-tr from-transparent to-white opacity-20"></div>
                                    </div>
                                    <div className="w-10 bg-gray-400"></div> {/* C-Pillar */}
                                </div>
                            </div>

                            {/* Lights */}
                            <div className="absolute bottom-20 left-[-5px] w-4 h-10 bg-orange-500 border border-black"></div>
                            <div className="absolute bottom-20 right-[-5px] w-4 h-10 bg-red-600 border border-black"></div>

                            {/* Damage Overlay */}
                            <div className="absolute inset-0 mix-blend-multiply opacity-60 bg-[url('https://www.transparenttextures.com/patterns/cracked-concrete.png')]"
                                 style={{ opacity: (100 - bonusCarHpRef.current) / 100 }}></div>
                        </div>
                    </div>
                )}

                {/* Fatality Effects */}
                {fatalityEffectsRef.current.map(f => (
                    <div key={f.id} className="absolute z-50 transition-transform" 
                         style={{ left: f.x - 100, bottom: 0 + (f.y > 0 ? f.y : 0), width: 200, height: 200 }}>
                         {f.type === 'tv_drop' && (
                             <div className="w-full h-full bg-gray-800 border-8 border-black flex items-center justify-center shadow-2xl">
                                 <div className="w-[90%] h-[90%] bg-white animate-pulse">
                                     <div className="text-black font-black text-center mt-10 text-4xl">NO<br/>SIGNAL</div>
                                 </div>
                             </div>
                         )}
                         {f.type === 'stamp' && (
                             <div className="w-full h-full border-8 border-red-900 bg-red-800 flex items-center justify-center rounded-full opacity-90">
                                 <div className="text-white font-black text-6xl rotate-[-20deg]">DENIED</div>
                             </div>
                         )}
                         {f.type === 'grade_crush' && (
                             <div className="text-[200px] font-serif font-bold text-red-700 drop-shadow-[10px_10px_0_#000]">F</div>
                         )}
                         {f.type === 'crowd_rush' && (
                             <div className="w-[300px] flex flex-wrap gap-2">
                                 {[...Array(20)].map((_, i) => <div key={i} className="w-8 h-12 bg-green-800 rounded-t-lg border border-black"></div>)}
                             </div>
                         )}
                    </div>
                ))}

                {bloodRef.current.map(b => (
                    <div key={b.id} className="absolute bg-white"
                         style={{ 
                             left: b.x, top: 550, width: 60, height: 60,
                             transform: `scale(${b.scale}) rotate(${b.rotation}deg)`, 
                             opacity: b.opacity,
                             clipPath: b.isSpark ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' // Star
                                                 : 'polygon(10% 0, 50% 10%, 90% 0, 100% 50%, 80% 100%, 20% 100%, 0 50%)', // Blob
                             mixBlendMode: 'screen', // Additive
                             background: b.isSpark ? 'radial-gradient(circle, #fff 0%, #ff0 50%, transparent 100%)' 
                                                   : 'radial-gradient(circle, #a00 0%, #500 60%, transparent 100%)'
                         }} />
                ))}

                {projectilesRef.current.map(proj => proj.active && (
                    <div key={proj.id} className="absolute z-30 transform"
                         style={{ left: proj.position.x, bottom: proj.position.y }}> 
                         {proj.type === 'grade_f' && <div className="text-red-600 font-serif font-bold text-6xl drop-shadow-[2px_2px_0_#000]">F</div>}
                         {proj.type === 'paper' && <div className="w-8 h-10 bg-white border border-black rotate-12 shadow-sm flex items-center justify-center text-[6px]">TXT</div>}
                         {proj.type === 'book' && <div className="w-10 h-12 bg-red-700 border-l-4 border-red-900 shadow-md"></div>}
                         {proj.type === 'word_hazard' && <div className="bg-white border-2 border-black p-1 text-xs font-black uppercase shadow-[4px_4px_0_rgba(0,0,0,0.5)]">{proj.text}</div>}
                    </div>
                ))}
                
                <div className="absolute bottom-[100px] left-0 w-full h-full z-30 pointer-events-none">
                     <div className="absolute transition-transform duration-75" style={{ left: p1.position.x - 70, bottom: p1.position.y }}>
                         <CharacterModel 
                             colors={selectedChar!.colors} characterId={p1.characterId} textureType={selectedChar!.textureType}
                             action={p1.action} direction={p1.direction} frame={p1.frame} isSoldOut={p1.isSoldOut} isWireframe={p1.isWireframe}
                         />
                     </div>
                     {p2 && (
                        <div className="absolute transition-transform duration-75" style={{ 
                            left: p2.position.x - 70, 
                            bottom: p2.position.y,
                            transform: isP2Crushed ? 'scaleY(0.05) translateY(2000px)' : 'none', // SQUASH LOGIC
                            transformOrigin: 'bottom center'
                        }}>
                            <CharacterModel 
                                colors={opponent?.colors || selectedChar!.colors} characterId={p2.characterId} textureType={opponent?.textureType || selectedChar!.textureType}
                                action={p2.action} direction={p2.direction} frame={p2.frame} isSoldOut={p2.isSoldOut} isWireframe={p2.isWireframe}
                            />
                        </div>
                     )}
                </div>
            </div>

            <div className={`absolute top-4 w-full px-4 z-50 transition-opacity ${isDark ? 'opacity-0' : 'opacity-100'}`}>
                 <div className="flex justify-center items-start gap-4 max-w-6xl mx-auto relative">
                    <div className="flex-1 pt-4"><StatBar value={hudState.p1Hp} max={MAX_HP} label={selectedChar?.name || "P1"} side="left" roundsWon={hudState.p1Rounds} meterValue={hudState.p1Meter} meterName={selectedChar?.meterName} comboCount={hudState.p1Combo} comboTitles={hudState.p1Titles} /></div>
                    <div className="relative z-20 mt-2 text-6xl font-black text-white drop-shadow-md">{hudState.timer}</div>
                    <div className="flex-1 pt-4"><StatBar value={hudState.p2Hp} max={MAX_HP} label={stage === 3 ? "THE SPECTACLE" : stage === 2 ? "CONSUMERISM" : opponent?.name || "P2"} side="right" roundsWon={hudState.p2Rounds} meterValue={hudState.p2Meter} meterName="SPECTACLE" comboCount={hudState.p2Combo} comboTitles={hudState.p2Titles} /></div>
                 </div>
                 <div className="absolute top-28 left-4 text-yellow-500 font-subtitle text-2xl border-2 border-black bg-black/80 px-2 rotate-[-2deg]">
                     STYLE: {selectedChar?.styles[hudState.p1Style]}
                 </div>
            </div>
            
            {dialogue && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full text-center z-50 animate-fade-in-up pointer-events-none">
                    <p className="text-yellow-300 font-subtitle text-4xl uppercase tracking-wide drop-shadow-[3px_3px_0_#000] stroke-black" 
                       style={{ WebkitTextStroke: '2px black' }}>{dialogue}</p>
                </div>
            )}
            
            {isDark && (
                <div className="absolute top-1/3 left-0 w-full text-center z-50">
                    <h1 className="text-9xl font-black text-red-600 animate-pulse drop-shadow-[0_0_10px_#fff]">CRITIQUE HIM!</h1>
                    <p className="text-2xl text-white mt-4 blink bg-black inline-block px-4 border border-white">CLOSE RANGE + ANY ATTACK</p>
                </div>
            )}
        </div>
    );
  };

  const renderCutscene = () => {
    if (!currentScenario) return null;
    const currentLine = currentScenario.dialogue[cutsceneIndex];
    if (!currentLine) return null;

    return (
      <div className={`h-full flex flex-col relative text-white font-serif overflow-hidden cursor-pointer ${currentScenario.backgroundClass}`} onClick={advanceCutscene}>
           <div className="absolute inset-0 w-full h-full preserve-3d perspective-[1000px]">
                {currentScenario.actors.map((actor, i) => {
                    const charData = ROSTER.find(c => c.id === actor.characterId) || ROSTER[0];
                    let leftPos = 200;
                    if (actor.position === 'center') leftPos = window.innerWidth / 2 - 100;
                    if (actor.position === 'right') leftPos = window.innerWidth - 400;

                    const speakingName = actor.isFake ? "Girlfriend" : charData.name;
                    const isActorSpeaking = currentLine.speaker === speakingName || (speakingName.includes("Bureaucrat") && currentLine.speaker === "The Bureaucrat");

                    return (
                        <div key={i} className="absolute bottom-20 transition-all duration-500 z-10 scale-125" style={{ left: leftPos }}>
                            <CharacterModel 
                                colors={charData.colors} 
                                characterId={actor.characterId} 
                                textureType={charData.textureType} 
                                action={actor.action === ActionState.DEFEAT ? ActionState.DEFEAT : (isActorSpeaking ? ActionState.INTRO : ActionState.IDLE)}
                                direction={actor.direction} 
                                frame={cutsceneIndex * 10} 
                                isSpeaking={isActorSpeaking}
                            />
                        </div>
                    );
                })}
           </div>

           <div className="z-20 flex flex-col h-full justify-between p-12 pointer-events-none">
               <h2 className="text-4xl text-red-600 font-bold bg-black inline-block px-4 text-center mt-10 border-2 border-white self-center transform -skew-x-12 shadow-[5px_5px_0_rgba(255,255,255,0.2)]">{currentScenario.title}</h2>
               <div className="absolute bottom-10 left-0 w-full text-center pb-10">
                    <div className="bg-black/80 p-4 inline-block transform -skew-x-6 border-2 border-yellow-500 max-w-4xl shadow-lg relative">
                        <div className="absolute -top-4 -left-4 w-8 h-8 bg-white border-2 border-black"></div> {/* Tape effect */}
                        <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-white border-2 border-black"></div>
                        <p className="text-yellow-300 font-subtitle text-3xl uppercase tracking-wide drop-shadow-[2px_2px_0_#000] stroke-black transform skew-x-6 leading-relaxed" style={{ WebkitTextStroke: '1px black' }}>
                        <span className="text-white block text-sm mb-2 bg-red-900 inline-block px-2">{currentLine.speaker}</span>
                        "{currentLine.text}"
                        </p>
                    </div>
                    <p className="text-gray-500 text-sm mt-2 animate-pulse">(CLICK TO CONTINUE)</p>
               </div>
           </div>
      </div>
    );
  };

  return (
    <div className="w-full h-screen bg-black overflow-hidden select-none font-serif relative">
      {gameState === GameState.MENU && (
        <div className="flex flex-col items-center justify-center h-full relative overflow-hidden bg-black text-white">
            <h1 className="text-8xl font-serif text-yellow-600 drop-shadow-[0_0_25px_rgba(255,200,0,0.6)] tracking-widest uppercase mb-4 z-10 transform -rotate-2">CRITIQUE<br/><span className="text-red-700 text-9xl">KOMBAT</span></h1>
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/concrete-wall.png')]"></div>
            <button onClick={startGame} className="mt-20 text-3xl font-serif text-gray-300 hover:text-white uppercase tracking-[0.5em] animate-pulse z-20 hover:scale-110 transition-transform border-b-2 border-transparent hover:border-red-500">ARCADE MODE</button>
            <div className="absolute bottom-4 text-xs text-gray-600">v1.1 - THE SPECTACLE EDITION</div>
        </div>
      )}
      {gameState === GameState.CHARACTER_SELECT && (
        <div className="flex h-full bg-[#111] text-white font-serif">
            <div className="w-1/2 p-12 flex flex-col justify-center bg-black z-20 border-r-4 border-gray-800 relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/noise.png')] opacity-10 pointer-events-none"></div>
                <h2 className="text-4xl text-yellow-600 mb-8 bg-black inline-block p-2 transform -skew-x-12 border-l-4 border-red-600 self-start">SELECT IDEOLOGY</h2>
                <div className="grid grid-cols-1 gap-4 relative z-10">
                    {ROSTER.filter(c => c.id !== 'debord').map(c => (
                        <button 
                            key={c.id} 
                            onClick={() => selectCharacter(c)} 
                            onMouseEnter={() => setHoveredChar(c)}
                            onMouseLeave={() => setHoveredChar(null)}
                            className="border-l-4 border-transparent hover:border-yellow-600 hover:bg-white/5 p-6 transition-all text-2xl uppercase font-bold text-left group"
                        >
                            <span className="group-hover:translate-x-4 transition-transform inline-block">{c.name}</span>
                        </button>
                    ))}
                </div>
            </div>
            <div className="w-1/2 bg-gray-900 flex flex-col items-center justify-center relative overflow-hidden">
                 <div className="absolute inset-0 bg-blue-900/20 pointer-events-none"></div>
                 <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,black_1px,transparent_1px)] bg-[length:4px_4px] pointer-events-none"></div>
                 {hoveredChar && (
                     <>
                        <div className="scale-[2.0] z-10 filter drop-shadow-[10px_10px_0_rgba(0,0,0,0.5)]"><CharacterModel colors={hoveredChar.colors} characterId={hoveredChar.id} textureType={hoveredChar.textureType} action={ActionState.IDLE} /></div>
                        <div className="absolute bottom-20 text-center z-20">
                            <h3 className="text-4xl font-black italic text-white/20 transform -rotate-2">{hoveredChar.archetype}</h3>
                            <p className="text-yellow-500 mt-2 max-w-md mx-auto bg-black p-2 transform rotate-1">{hoveredChar.description}</p>
                        </div>
                     </>
                 )}
                 {!hoveredChar && (
                     <div className="text-center opacity-30 animate-pulse">
                         <h2 className="text-4xl">SELECT A FIGHTER</h2>
                     </div>
                 )}
            </div>
        </div>
      )}
      {(gameState === GameState.INTRO_CUTSCENE || gameState === GameState.LOSE_CUTSCENE) && renderCutscene()}
      {(gameState === GameState.FIGHTING || gameState === GameState.BONUS_STAGE || gameState === GameState.FINISH_HIM) && renderFighting()} 
      {gameState === GameState.GAME_OVER && (
          <div className="flex flex-col items-center justify-center h-full bg-black text-white">
              <h1 className="text-6xl text-red-600 font-bold mb-8">GAME OVER</h1>
              <p className="text-2xl mb-8">INSERT COIN TO CONTINUE</p>
              <button onClick={() => setGameState(GameState.MENU)} className="bg-white text-black px-6 py-2 font-bold hover:bg-gray-300">MAIN MENU</button>
          </div>
      )}
      {gameState === GameState.BSOD && (
          <div className="h-full bg-[#0000AA] text-white font-mono p-10 cursor-pointer flex flex-col items-center justify-center text-xl" onClick={() => setGameState(GameState.MENU)}>
              <div className="max-w-3xl">
                <p className="bg-white text-[#0000AA] inline-block px-2 mb-8">WINDOWS</p>
                <p>A fatal exception 0E has occurred at 0028:C0011E36 in VXD VMM(01) + 00010E36.</p>
                <p>The current application will be terminated.</p>
                <br/>
                <p>* Press any key to accept the Spectacle.</p>
                <p>* Press CTRL+ALT+DEL to restart your alienation.</p>
                <br/>
                <p className="mt-10 text-center animate-pulse text-yellow-300">THE REVOLUTION HAS FAILED.</p>
                <p className="mt-2 text-center text-sm opacity-50">Click to reboot.</p>
              </div>
          </div>
      )}
      
      {/* Visual Overlay Last - Ensures z-index dominance over 3D scene */}
      <div className="absolute inset-0 pointer-events-none z-[100]">
          <CRTOverlay />
      </div>
    </div>
  );
};

export default App;