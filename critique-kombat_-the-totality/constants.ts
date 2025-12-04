
import { Character, MoveData, ActionState, Scenario } from './types';

export const MAX_HP = 100;
export const MAX_METER = 100;
export const GROUND_Y = 0;
export const GRAVITY = 0.8;
export const JUMP_FORCE = 18;
export const MOVE_SPEED = 6;
export const PARRY_WINDOW = 8; // Frames
export const SPECTACLE_DURATION = 300; // Frames

// Physics coordinates for Stage 2
export const BONUS_CAR_X = 600; 
export const BOSS_PROJECTOR_X = 1050;

export const COMBO_TEXT = [
    "",
    "HIT",
    "DOUBLE",
    "TRIPLE",
    "MULTI",
    "MEGA",
    "ULTRA"
];

export const ROUND_START_TEXT = ["THESIS...", "ANTITHESIS...", "SYNTHESIZE!"];

export const MOVE_LISTS: Record<string, string[]> = {
    khayati: [
        "Pamphlet: ↓ ↘ → + A/S",
        "Scandal Grab: ↓ ↙ ← + Z/X",
        "Radical Kick: Heavy Kick (X)",
        "Style Switch: Shift"
    ],
    bureaucrat: [
        "Red Tape: ↓ ↓ + Z/X",
        "Compromise Grab: ↓ ↙ ← + A/S",
        "Style Switch: Shift"
    ],
    professor: [
        "Bell Curve: ↓ ↘ → + A/S",
        "Sabbatical: ↓ ↑ + Z/X",
        "Style Switch: Shift"
    ],
    maoist: [
        "Great Leap: ↓ ↑ + A/S",
        "Self Crit: ↓ ↓ + Z/X",
        "Style Switch: Shift"
    ]
};

export const LOSE_SCENARIOS: Record<string, Scenario> = {
    'khayati': {
        id: 'lose_khayati',
        title: 'THE RECUPERATION',
        backgroundClass: 'bg-black',
        actors: [
            { characterId: 'khayati', position: 'center', action: ActionState.DEFEAT_SELLOUT, direction: 1 }
        ],
        dialogue: [
            { speaker: "Mustapha Khayati", text: "I have decided to accept the position at the advertising agency." },
            { speaker: "Narrator", text: "The revolution has been commodified. You are now a brand." }
        ]
    },
    'bureaucrat': {
        id: 'lose_bureaucrat',
        title: 'EARLY RETIREMENT',
        backgroundClass: 'bg-black',
        actors: [
            { characterId: 'bureaucrat', position: 'center', action: ActionState.DEFEAT, direction: 1 }
        ],
        dialogue: [
            { speaker: "The Bureaucrat", text: "My pension... it's gone!" },
            { speaker: "Narrator", text: "Inefficiency has been purged." }
        ]
    },
    'professor': {
        id: 'lose_professor',
        title: 'DENIED TENURE',
        backgroundClass: 'bg-black',
        actors: [
            { characterId: 'professor', position: 'center', action: ActionState.DEFEAT, direction: 1 }
        ],
        dialogue: [
            { speaker: "Professor", text: "But my h-index was rising!" },
            { speaker: "Narrator", text: "You have been replaced by an AI chatbot." }
        ]
    },
    'maoist': {
        id: 'lose_maoist',
        title: 'COUNTER-REVOLUTIONARY',
        backgroundClass: 'bg-black',
        actors: [
            { characterId: 'maoist', position: 'center', action: ActionState.DEFEAT, direction: 1 }
        ],
        dialogue: [
            { speaker: "Maoist", text: "I must engage in self-criticism..." },
            { speaker: "Narrator", text: "History has moved on without you." }
        ]
    }
};

export const SCENARIOS: Record<string, Scenario> = {
    // KHAYATI VS X
    'khayati_vs_bureaucrat': {
        id: 'khayati_vs_bureaucrat',
        title: 'THE PARKING LOT CONFRONTATION',
        backgroundClass: 'bg-slate-800',
        actors: [
            { characterId: 'khayati', position: 'left', action: ActionState.IDLE, direction: 1 },
            { characterId: 'bureaucrat', position: 'right', action: ActionState.ATTACK_RP, direction: -1 },
        ],
        dialogue: [
            { speaker: "The Bureaucrat", text: "You fool! You cannot defeat the hegemony of the commodity! I have tenure!" },
            { speaker: "Girlfriend", text: "Mustapha! Help! He is trying to force me to participate in a reformist dialogue!" },
            { speaker: "Khayati", text: "Let her go! Your structuralism is a paper tiger! I will negate your negation with my foot!" }
        ]
    },
    'khayati_vs_professor': {
        id: 'khayati_vs_professor',
        title: 'THE TENURE REVIEW',
        backgroundClass: 'bg-stone-900',
        actors: [
            { characterId: 'khayati', position: 'left', action: ActionState.IDLE, direction: 1 },
            { characterId: 'professor', position: 'right', action: ActionState.IDLE, direction: -1 }
        ],
        dialogue: [
            { speaker: "Professor", text: "Your thesis lacks citations. Specifically, citations of... ME." },
            { speaker: "Khayati", text: "I do not cite history. I make it." },
            { speaker: "Professor", text: "Then you shall fail. The university is a fortress of thought!" },
            { speaker: "Khayati", text: "Then I will burn it down." }
        ]
    },
    'khayati_vs_maoist': {
        id: 'khayati_vs_maoist',
        title: 'THE SECTARIAN SPLIT',
        backgroundClass: 'bg-green-900',
        actors: [
            { characterId: 'khayati', position: 'left', action: ActionState.IDLE, direction: 1 },
            { characterId: 'maoist', position: 'right', action: ActionState.ATTACK_RP, direction: -1 }
        ],
        dialogue: [
            { speaker: "Maoist", text: "Comrade! Why do you not wear the uniform? The Party requires uniformity!" },
            { speaker: "Khayati", text: "I am not a Marxist. I am a revolutionary." },
            { speaker: "Maoist", text: "Deviationist! Revisionist! Paper Tiger! I will critique you physically!" }
        ]
    },
    'khayati_vs_debord': {
        id: 'khayati_vs_debord',
        title: 'THE CINEMA',
        backgroundClass: 'bg-black',
        actors: [
            { characterId: 'khayati', position: 'left', action: ActionState.IDLE, direction: 1 },
            { characterId: 'debord', position: 'center', action: ActionState.IDLE, direction: -1 }
        ],
        dialogue: [
            { speaker: "Guy Debord", text: "Everything that was directly lived has moved away into a representation." },
            { speaker: "Khayati", text: "Guy? Is that you? I thought you were dead." },
            { speaker: "Guy Debord", text: "I am not dead. I have merely become an image. Defeat yourself to defeat me." },
            { speaker: "Khayati", text: "I will destroy the projector!" }
        ]
    },

    // BUREAUCRAT VS X
    'bureaucrat_vs_khayati': {
        id: 'bureaucrat_vs_khayati',
        title: 'THE DISCIPLINARY HEARING',
        backgroundClass: 'bg-slate-800',
        actors: [
            { characterId: 'bureaucrat', position: 'left', action: ActionState.IDLE, direction: 1 },
            { characterId: 'khayati', position: 'right', action: ActionState.IDLE, direction: -1 }
        ],
        dialogue: [
            { speaker: "The Bureaucrat", text: "Mr. Khayati, your behavior in the parking lot was... irregular." },
            { speaker: "Khayati", text: "I do not recognize your authority!" },
            { speaker: "The Bureaucrat", text: "Then I must enforce compliance through heavy grappling." }
        ]
    },
    'bureaucrat_vs_professor': {
        id: 'bureaucrat_vs_professor',
        title: 'BUDGET CUTS',
        backgroundClass: 'bg-stone-800',
        actors: [
            { characterId: 'bureaucrat', position: 'left', action: ActionState.IDLE, direction: 1 },
            { characterId: 'professor', position: 'right', action: ActionState.IDLE, direction: -1 }
        ],
        dialogue: [
            { speaker: "The Bureaucrat", text: "Professor, your department is underperforming. We are cutting your funding." },
            { speaker: "Professor", text: "Preposterous! My citations are in the 99th percentile!" },
            { speaker: "The Bureaucrat", text: "Citations do not equal revenue. Prepare for restructuring." }
        ]
    },
    'bureaucrat_vs_maoist': {
        id: 'bureaucrat_vs_maoist',
        title: 'PERMIT APPLICATION',
        backgroundClass: 'bg-slate-700',
        actors: [
            { characterId: 'bureaucrat', position: 'left', action: ActionState.IDLE, direction: 1 },
            { characterId: 'maoist', position: 'right', action: ActionState.ATTACK_RP, direction: -1 }
        ],
        dialogue: [
            { speaker: "The Bureaucrat", text: "You cannot stage a revolution here without a Form 27-B." },
            { speaker: "Maoist", text: "The revolution does not fill out forms! It burns them!" },
            { speaker: "The Bureaucrat", text: "Then I shall file you under 'Denied'." }
        ]
    },
    'bureaucrat_vs_debord': {
        id: 'bureaucrat_vs_debord',
        title: 'THE FINAL AUDIT',
        backgroundClass: 'bg-black',
        actors: [
            { characterId: 'bureaucrat', position: 'left', action: ActionState.IDLE, direction: 1 },
            { characterId: 'debord', position: 'center', action: ActionState.IDLE, direction: -1 }
        ],
        dialogue: [
            { speaker: "The Bureaucrat", text: "Mr. Debord, the Spectacle is exceeding its operational budget." },
            { speaker: "Guy Debord", text: "The Spectacle creates its own value. You are merely its accountant." },
            { speaker: "The Bureaucrat", text: "I will liquidate your assets!" }
        ]
    },

    // PROFESSOR VS X
    'professor_vs_khayati': {
        id: 'professor_vs_khayati',
        title: 'THE ORAL EXAM',
        backgroundClass: 'bg-stone-900',
        actors: [
            { characterId: 'professor', position: 'left', action: ActionState.IDLE, direction: 1 },
            { characterId: 'khayati', position: 'right', action: ActionState.IDLE, direction: -1 }
        ],
        dialogue: [
            { speaker: "Professor", text: "Sit down. Today we discuss the failures of the 1968 uprisings." },
            { speaker: "Khayati", text: "I lived it! You merely studied it!" },
            { speaker: "Professor", text: "Anecdotal evidence is inadmissible. F!" }
        ]
    },
    'professor_vs_bureaucrat': {
        id: 'professor_vs_bureaucrat',
        title: 'GRANT APPLICATION',
        backgroundClass: 'bg-stone-800',
        actors: [
            { characterId: 'professor', position: 'left', action: ActionState.IDLE, direction: 1 },
            { characterId: 'bureaucrat', position: 'right', action: ActionState.IDLE, direction: -1 }
        ],
        dialogue: [
            { speaker: "Professor", text: "My research on 'Post-Structuralist Pot-Making' is vital!" },
            { speaker: "The Bureaucrat", text: "The committee disagrees. We prefer 'Concrete Pouring'." },
            { speaker: "Professor", text: "Philistine! I will educate you!" }
        ]
    },
    'professor_vs_maoist': {
        id: 'professor_vs_maoist',
        title: 'CLASSROOM DISRUPTION',
        backgroundClass: 'bg-green-900',
        actors: [
            { characterId: 'professor', position: 'left', action: ActionState.IDLE, direction: 1 },
            { characterId: 'maoist', position: 'right', action: ActionState.ATTACK_RP, direction: -1 }
        ],
        dialogue: [
            { speaker: "Maoist", text: "Your teachings are bourgeois poison! Read the Little Red Book!" },
            { speaker: "Professor", text: "I have. The prose is repetitive and the logic circular." },
            { speaker: "Maoist", text: "Silence, intellectual! Struggle Session begins now!" }
        ]
    },
    'professor_vs_debord': {
        id: 'professor_vs_debord',
        title: 'THEORY VS REALITY',
        backgroundClass: 'bg-black',
        actors: [
            { characterId: 'professor', position: 'left', action: ActionState.IDLE, direction: 1 },
            { characterId: 'debord', position: 'center', action: ActionState.IDLE, direction: -1 }
        ],
        dialogue: [
            { speaker: "Professor", text: "Debord! I teach your theories every semester!" },
            { speaker: "Guy Debord", text: "Then you have betrayed them. To teach is to negate." },
            { speaker: "Professor", text: "But... the syllabus!" }
        ]
    },

    // MAOIST VS X
    'maoist_vs_khayati': {
        id: 'maoist_vs_khayati',
        title: 'IDEOLOGICAL PURITY',
        backgroundClass: 'bg-red-900',
        actors: [
            { characterId: 'maoist', position: 'left', action: ActionState.IDLE, direction: 1 },
            { characterId: 'khayati', position: 'right', action: ActionState.IDLE, direction: -1 }
        ],
        dialogue: [
            { speaker: "Maoist", text: "You are an anarchist running dog!" },
            { speaker: "Khayati", text: "And you are a Stalinist cosplayer." },
            { speaker: "Maoist", text: "How dare you! My costume was very expensive!" }
        ]
    },
    'maoist_vs_bureaucrat': {
        id: 'maoist_vs_bureaucrat',
        title: 'SMASH THE STATE',
        backgroundClass: 'bg-gray-800',
        actors: [
            { characterId: 'maoist', position: 'left', action: ActionState.IDLE, direction: 1 },
            { characterId: 'bureaucrat', position: 'right', action: ActionState.IDLE, direction: -1 }
        ],
        dialogue: [
            { speaker: "Maoist", text: "The state must be smashed!" },
            { speaker: "The Bureaucrat", text: "I am the state. And I am quite solid." },
            { speaker: "Maoist", text: "Then I will use my head!" }
        ]
    },
    'maoist_vs_professor': {
        id: 'maoist_vs_professor',
        title: 'RE-EDUCATION',
        backgroundClass: 'bg-green-800',
        actors: [
            { characterId: 'maoist', position: 'left', action: ActionState.IDLE, direction: 1 },
            { characterId: 'professor', position: 'right', action: ActionState.IDLE, direction: -1 }
        ],
        dialogue: [
            { speaker: "Maoist", text: "Intellectuals must be sent to the countryside!" },
            { speaker: "Professor", text: "But there are no coffee shops there!" },
            { speaker: "Maoist", text: "Exactly! Only labor!" }
        ]
    },
    'maoist_vs_debord': {
        id: 'maoist_vs_debord',
        title: 'FALSE IDOLS',
        backgroundClass: 'bg-black',
        actors: [
            { characterId: 'maoist', position: 'left', action: ActionState.IDLE, direction: 1 },
            { characterId: 'debord', position: 'center', action: ActionState.IDLE, direction: -1 }
        ],
        dialogue: [
            { speaker: "Maoist", text: "You are not Chairman Mao!" },
            { speaker: "Guy Debord", text: "I am nothing. I am the reflection of your own desire for leadership." },
            { speaker: "Maoist", text: "Confusing! Attack!" }
        ]
    }
};

export const MOVES: Record<string, Record<string, MoveData | null>> = {
  default: {
    [ActionState.ATTACK_LP]: { 
      name: 'Critique (Jab)', damage: 4, meterGain: 5, 
      startup: 4, active: 4, recovery: 6, hitStun: 10, 
      rangeX: 70, rangeY: 20, type: 'high', knockback: 3 
    },
    [ActionState.ATTACK_RP]: { 
      name: 'Antithesis (Cross)', damage: 10, meterGain: 10, 
      startup: 8, active: 6, recovery: 12, hitStun: 18, 
      rangeX: 80, rangeY: 20, type: 'mid', knockback: 8 
    },
    [ActionState.ATTACK_LK]: { 
      name: 'Low Theory', damage: 6, meterGain: 8, 
      startup: 6, active: 5, recovery: 10, hitStun: 12, 
      rangeX: 75, rangeY: 10, type: 'low', knockback: 4 
    },
    [ActionState.ATTACK_RK]: { 
      name: 'Praxis Kick', damage: 14, meterGain: 15, 
      startup: 12, active: 8, recovery: 18, hitStun: 24, 
      rangeX: 90, rangeY: 30, type: 'mid', knockback: 15 
    },
    // NEW JUMP/CROUCH ATTACKS
    [ActionState.JUMP_ATTACK_P]: { 
      name: 'Aerial Dialectic', damage: 8, meterGain: 8, 
      startup: 4, active: 10, recovery: 10, hitStun: 15, 
      rangeX: 70, rangeY: 80, type: 'high', knockback: 5 
    },
    [ActionState.JUMP_ATTACK_K]: { 
      name: 'Flying Kick', damage: 12, meterGain: 12, 
      startup: 6, active: 12, recovery: 12, hitStun: 20, 
      rangeX: 90, rangeY: 60, type: 'high', knockback: 10 
    },
    [ActionState.CROUCH_ATTACK_P]: { 
      name: 'Low Jab', damage: 4, meterGain: 4, 
      startup: 4, active: 4, recovery: 6, hitStun: 10, 
      rangeX: 70, rangeY: 10, type: 'low', knockback: 2 
    },
    [ActionState.CROUCH_ATTACK_K]: { 
      name: 'Sweep', damage: 10, meterGain: 10, 
      startup: 8, active: 8, recovery: 18, hitStun: 20, 
      rangeX: 85, rangeY: 10, type: 'low', knockback: 0 
    },
    [ActionState.IDLE]: null,
    [ActionState.HIT_STUN]: { name: 'Stun', damage: 0, meterGain: 0, startup: 0, active: 20, recovery: 0, hitStun: 0, rangeX: 0, rangeY: 0, type: 'mid', knockback: 0 },
    [ActionState.GRABBED]: { name: 'Grabbed', damage: 0, meterGain: 0, startup: 0, active: 60, recovery: 0, hitStun: 0, rangeX: 0, rangeY: 0, type: 'mid', knockback: 0 },
    [ActionState.KNOCKDOWN]: { name: 'Down', damage: 0, meterGain: 0, startup: 0, active: 60, recovery: 20, hitStun: 0, rangeX: 0, rangeY: 0, type: 'mid', knockback: 0 },
    [ActionState.INTRO]: { name: 'Intro', damage: 0, meterGain: 0, startup: 0, active: 100, recovery: 0, hitStun: 0, rangeX: 0, rangeY: 0, type: 'mid', knockback: 0 },
    [ActionState.VICTORY]: { name: 'Win', damage: 0, meterGain: 0, startup: 0, active: 200, recovery: 0, hitStun: 0, rangeX: 0, rangeY: 0, type: 'mid', knockback: 0 },
    [ActionState.DEFEAT]: { name: 'Lose', damage: 0, meterGain: 0, startup: 0, active: 200, recovery: 0, hitStun: 0, rangeX: 0, rangeY: 0, type: 'mid', knockback: 0 },
    [ActionState.DEFEAT_SELLOUT]: { name: 'Sellout', damage: 0, meterGain: 0, startup: 0, active: 200, recovery: 0, hitStun: 0, rangeX: 0, rangeY: 0, type: 'mid', knockback: 0 },
    [ActionState.FATALITY]: { name: 'Fatality', damage: 0, meterGain: 0, startup: 0, active: 300, recovery: 0, hitStun: 0, rangeX: 0, rangeY: 0, type: 'mid', knockback: 0 },
    [ActionState.PARRY]: { name: 'Parry', damage: 0, meterGain: 0, startup: 0, active: 20, recovery: 10, hitStun: 0, rangeX: 0, rangeY: 0, type: 'mid', knockback: 0 },
    [ActionState.DIZZY]: { name: 'Dizzy', damage: 0, meterGain: 0, startup: 0, active: 60, recovery: 0, hitStun: 0, rangeX: 0, rangeY: 0, type: 'mid', knockback: 0 },
    [ActionState.TIME_OVER]: { name: 'Time Over', damage: 0, meterGain: 0, startup: 0, active: 100, recovery: 0, hitStun: 0, rangeX: 0, rangeY: 0, type: 'mid', knockback: 0 },
    [ActionState.SPECIAL_1]: { name: 'Special 1', damage: 10, meterGain: 10, startup: 10, active: 10, recovery: 10, hitStun: 15, rangeX: 100, rangeY: 50, type: 'mid', knockback: 5 },
    [ActionState.SPECIAL_2]: { name: 'Special 2', damage: 10, meterGain: 10, startup: 10, active: 10, recovery: 10, hitStun: 15, rangeX: 100, rangeY: 50, type: 'mid', knockback: 5 },
    [ActionState.SPECIAL_3]: { name: 'Special 3', damage: 10, meterGain: 10, startup: 10, active: 10, recovery: 10, hitStun: 15, rangeX: 100, rangeY: 50, type: 'mid', knockback: 5 },
    [ActionState.SPECIAL_4]: { name: 'Special 4', damage: 10, meterGain: 10, startup: 10, active: 10, recovery: 10, hitStun: 15, rangeX: 100, rangeY: 50, type: 'mid', knockback: 5 },
  },
  khayati: {
      [ActionState.ATTACK_RK]: { 
          name: 'Radical Subjectivity', damage: 18, meterGain: 20,
          startup: 10, active: 30, recovery: 20, hitStun: 30,
          rangeX: 140, rangeY: 60, type: 'mid', knockback: 25
      },
      [ActionState.SPECIAL_1]: { 
          name: 'The Pamphlet', damage: 5, meterGain: 10,
          startup: 12, active: 20, recovery: 20, hitStun: 15,
          rangeX: 600, rangeY: 30, type: 'high', knockback: 5, isProjectile: true
      },
      [ActionState.SPECIAL_2]: { 
          name: 'The Scandal', damage: 25, meterGain: 0,
          startup: 8, active: 5, recovery: 30, hitStun: 60,
          rangeX: 60, rangeY: 20, type: 'mid', knockback: 0, isGrab: true
      }
  }, 
  professor: {
      [ActionState.ATTACK_LP]: { 
          name: 'The Questionnaire', damage: 5, meterGain: 10,
          startup: 15, active: 5, recovery: 25, hitStun: 15,
          rangeX: 800, rangeY: 20, type: 'high', knockback: 5,
          isProjectile: true
      },
      [ActionState.SPECIAL_1]: { 
          name: 'The Bell Curve', damage: 15, meterGain: 15,
          startup: 20, active: 10, recovery: 30, hitStun: 25,
          rangeX: 800, rangeY: 100, type: 'high', knockback: 20, isProjectile: true
      },
      [ActionState.SPECIAL_3]: { 
          name: 'Sabbatical', damage: 0, meterGain: 5,
          startup: 5, active: 20, recovery: 5, hitStun: 0,
          rangeX: 0, rangeY: 0, type: 'mid', knockback: 0
      }
  },
  bureaucrat: {
      [ActionState.SPECIAL_2]: { 
          name: 'The Compromise', damage: 15, meterGain: 0,
          startup: 10, active: 10, recovery: 40, hitStun: 60,
          rangeX: 80, rangeY: 20, type: 'mid', knockback: 0,
          isGrab: true
      },
      [ActionState.SPECIAL_4]: { 
          name: 'Red Tape', damage: 10, meterGain: 10,
          startup: 10, active: 60, recovery: 20, hitStun: 30,
          rangeX: 100, rangeY: 50, type: 'mid', knockback: 40
      }
  },
  maoist: {
      [ActionState.ATTACK_RP]: { 
          name: 'Blind Dogma', damage: 20, meterGain: 10,
          startup: 20, active: 10, recovery: 40, hitStun: 10,
          rangeX: 60, rangeY: 20, type: 'mid', knockback: 5,
          selfDamage: 10 
      },
      [ActionState.SPECIAL_3]: { 
          name: 'Great Leap', damage: 25, meterGain: 20,
          startup: 15, active: 20, recovery: 60, hitStun: 40,
          rangeX: 150, rangeY: 80, type: 'high', knockback: 20,
          selfDamage: 5
      },
      [ActionState.SPECIAL_4]: {
          name: 'Self Crit', damage: 15, meterGain: 15,
          startup: 10, active: 20, recovery: 30, hitStun: 30,
          rangeX: 80, rangeY: 20, type: 'low', knockback: 10,
          selfDamage: 5
      }
  },
  debord: {
      [ActionState.ATTACK_RP]: { 
          name: 'Detournement', damage: 25, meterGain: 30,
          startup: 15, active: 10, recovery: 20, hitStun: 30,
          rangeX: 100, rangeY: 30, type: 'mid', knockback: 20
      }
  }
};

export const ROSTER: Character[] = [
  {
    id: 'khayati',
    name: 'Mustapha Khayati',
    archetype: 'The Situationist',
    description: 'Style: Jeet Kune Do. Outfit: Leather jacket.',
    fightingStyle: 'Jeet Kune Do',
    styles: ['POETRY', 'RIOTS'],
    comboTitles: ["AGITATION", "INSURRECTION", "REVOLT", "ANARCHY", "TOTAL REV."],
    textureType: 'leather',
    stats: { speed: 1.2, power: 1.0, defense: 1.0 },
    introQuote: "The culture that is successfully imposed is strictly the culture of the dominant class.",
    winQuote: "NEVER! WORK! EVER!",
    loseQuote: "I... I think I'll apply for a grant...",
    meterName: "Class Consciousness",
    colors: {
        skin: '#dcb',
        torso: '#222', 
        legs: '#235', 
        detail: '#800' 
    },
    scale: 1.0
  },
  {
    id: 'bureaucrat',
    name: 'The Bureaucrat',
    archetype: 'The Grappler',
    description: 'Style: Heavy Wrestling. Appearance: Cheap suit.',
    fightingStyle: 'Heavy Wrestling',
    styles: ['NEGOTIATION', 'RECUPERATION'],
    comboTitles: ["FILING...", "AUDITING...", "APPROVED!", "STAMPED!", "LIQUIDATED!"],
    textureType: 'suit',
    stats: { speed: 0.8, power: 1.4, defense: 1.2 },
    introQuote: "We must proceed through the proper channels.",
    winQuote: "We have negotiated a 2% wage increase.",
    loseQuote: "This is not in the bylaws!",
    meterName: "Recuperation",
    colors: {
        skin: '#eaa',
        torso: '#556', 
        legs: '#445', 
        detail: '#a00' 
    },
    scale: 1.2
  },
  {
    id: 'professor',
    name: 'Sociology Professor',
    archetype: 'The Zoner',
    description: 'Style: Projectiles. Appearance: Tweedy jacket.',
    fightingStyle: 'Critical Theory',
    styles: ['LECTURE', 'GRADING'],
    comboTitles: ["CITE", "REVIEW", "PEER REVIEW", "PUBLISH", "TENURE!"],
    textureType: 'tweed',
    stats: { speed: 1.0, power: 0.9, defense: 0.8 },
    introQuote: "I have published three papers on this very interaction.",
    winQuote: "Your rebellion is statistically insignificant.",
    loseQuote: "But... I have tenure!",
    meterName: "Tenure",
    colors: {
        skin: '#eac',
        torso: '#654', 
        legs: '#222', 
        detail: '#fff' 
    },
    scale: 1.0
  },
  {
    id: 'maoist',
    name: 'Maoist Student',
    archetype: 'Joke Character',
    description: 'Style: Useless Flailing.',
    fightingStyle: 'Useless Flailing',
    styles: ['THEORY', 'PRAXIS'],
    comboTitles: ["STRUGGLE", "CRITICISM", "SELF-CRIT", "PURGE", "REV. GUARD"],
    textureType: 'military',
    stats: { speed: 1.3, power: 0.5, defense: 0.8 },
    introQuote: "The wind from the East overpowers the wind from the West!",
    winQuote: "I did it! I denounced my father!",
    loseQuote: "Self-criticism time...",
    meterName: "Dogma",
    colors: {
        skin: '#eb9',
        torso: '#353', 
        legs: '#242', 
        detail: '#f00' 
    },
    scale: 0.9
  },
  {
    id: 'debord',
    name: 'Guy Debord',
    archetype: 'The Master',
    description: 'Style: Pure Negation.',
    fightingStyle: 'The Spectacle',
    styles: ['SPECTACLE', 'TRUTH'],
    comboTitles: ["IMAGE", "ILLUSION", "SPECTACLE", "BOREDOM", "SILENCE"],
    textureType: 'wine',
    stats: { speed: 1.5, power: 1.5, defense: 1.5 },
    introQuote: "The spectacle is not a collection of images, but a social relation among people, mediated by images.",
    winQuote: "You are merely a consumer of your own life.",
    loseQuote: "The situation... has been constructed...",
    meterName: "Negation",
    colors: {
        skin: '#fdd',
        torso: '#fff', 
        legs: '#111', 
        detail: '#000' 
    },
    scale: 1.1
  }
];