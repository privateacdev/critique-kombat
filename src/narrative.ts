export interface DialogueLine {
  speaker: string;
  text: string;
}

export interface ScenarioActor {
  characterId: string;
  position: 'left' | 'right' | 'center';
  action: string;
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

export const ROUND_START_TEXT = ['THESIS...', 'ANTITHESIS...', 'SYNTHESIZE!'];

export const LOSE_SCENARIOS: Record<string, Scenario> = {
  khayati: {
    id: 'lose_khayati',
    title: 'THE RECUPERATION',
    backgroundClass: 'bg-black',
    actors: [
      { characterId: 'khayati', position: 'center', action: 'DEFEAT_SELLOUT', direction: 1 }
    ],
    dialogue: [
      { speaker: 'Mustapha Khayati', text: 'I have decided to accept the position at the advertising agency.' },
      { speaker: 'Narrator', text: 'The revolution has been commodified. You are now a brand.' }
    ]
  },
  bureaucrat: {
    id: 'lose_bureaucrat',
    title: 'EARLY RETIREMENT',
    backgroundClass: 'bg-black',
    actors: [
      { characterId: 'bureaucrat', position: 'center', action: 'DEFEAT', direction: 1 }
    ],
    dialogue: [
      { speaker: 'The Bureaucrat', text: 'My pension... it\'s gone!' },
      { speaker: 'Narrator', text: 'Inefficiency has been purged.' }
    ]
  },
  professor: {
    id: 'lose_professor',
    title: 'DENIED TENURE',
    backgroundClass: 'bg-black',
    actors: [
      { characterId: 'professor', position: 'center', action: 'DEFEAT', direction: 1 }
    ],
    dialogue: [
      { speaker: 'Professor', text: 'But my h-index was rising!' },
      { speaker: 'Narrator', text: 'You have been replaced by an AI chatbot.' }
    ]
  },
  maoist: {
    id: 'lose_maoist',
    title: 'COUNTER-REVOLUTIONARY',
    backgroundClass: 'bg-black',
    actors: [
      { characterId: 'maoist', position: 'center', action: 'DEFEAT', direction: 1 }
    ],
    dialogue: [
      { speaker: 'Maoist', text: 'I must engage in self-criticism...' },
      { speaker: 'Narrator', text: 'History has moved on without you.' }
    ]
  }
};

export const SCENARIOS: Record<string, Scenario> = {
  // KHAYATI VS X
  khayati_vs_bureaucrat: {
    id: 'khayati_vs_bureaucrat',
    title: 'THE PARKING LOT CONFRONTATION',
    backgroundClass: 'bg-slate-800',
    actors: [
      { characterId: 'khayati', position: 'left', action: 'IDLE', direction: 1 },
      { characterId: 'bureaucrat', position: 'right', action: 'ATTACK_RP', direction: -1 }
    ],
    dialogue: [
      { speaker: 'Bureaucrat', text: 'Halt! Your occupation lacks the proper form 27B/6. Revolt denied.' },
      { speaker: 'Khayati', text: 'Your paperwork is a police cordon. I file nothing but communiqués.' },
      { speaker: 'Bureaucrat', text: 'Then I stamp you “RECUPERATED”. Prepare to be audited by force!' }
    ]
  },
  khayati_vs_professor: {
    id: 'khayati_vs_professor',
    title: 'THE TENURE REVIEW',
    backgroundClass: 'bg-stone-900',
    actors: [
      { characterId: 'khayati', position: 'left', action: 'IDLE', direction: 1 },
      { characterId: 'professor', position: 'right', action: 'IDLE', direction: -1 }
    ],
    dialogue: [
      { speaker: 'Professor', text: 'Your thesis lacks citations. Specifically, citations of... ME.' },
      { speaker: 'Khayati', text: 'I do not cite history. I make it.' },
      { speaker: 'Professor', text: 'Then you shall fail. The university is a fortress of thought!' },
      { speaker: 'Khayati', text: 'Then I will burn it down.' }
    ]
  },
  khayati_vs_maoist: {
    id: 'khayati_vs_maoist',
    title: 'THE SECTARIAN SPLIT',
    backgroundClass: 'bg-green-900',
    actors: [
      { characterId: 'khayati', position: 'left', action: 'IDLE', direction: 1 },
      { characterId: 'maoist', position: 'right', action: 'ATTACK_RP', direction: -1 }
    ],
    dialogue: [
      { speaker: 'Maoist', text: 'Comrade! Why do you not wear the uniform? The Party requires uniformity!' },
      { speaker: 'Khayati', text: 'I am not a Marxist. I am a revolutionary.' },
      { speaker: 'Maoist', text: 'Deviationist! Revisionist! Paper Tiger! I will critique you physically!' }
    ]
  },
  khayati_vs_debord: {
    id: 'khayati_vs_debord',
    title: 'THE CINEMA',
    backgroundClass: 'bg-black',
    actors: [
      { characterId: 'khayati', position: 'left', action: 'IDLE', direction: 1 },
      { characterId: 'debord', position: 'center', action: 'IDLE', direction: -1 }
    ],
    dialogue: [
      { speaker: 'Guy Debord', text: 'Everything that was directly lived has moved away into a representation.' },
      { speaker: 'Khayati', text: 'Guy? Is that you? I thought you were dead.' },
      { speaker: 'Guy Debord', text: 'I am not dead. I have merely become an image. Defeat yourself to defeat me.' },
      { speaker: 'Khayati', text: 'I will destroy the projector!' }
    ]
  },

  // BUREAUCRAT VS X
  bureaucrat_vs_khayati: {
    id: 'bureaucrat_vs_khayati',
    title: 'THE DISCIPLINARY HEARING',
    backgroundClass: 'bg-slate-800',
    actors: [
      { characterId: 'bureaucrat', position: 'left', action: 'IDLE', direction: 1 },
      { characterId: 'khayati', position: 'right', action: 'IDLE', direction: -1 }
    ],
    dialogue: [
      { speaker: 'The Bureaucrat', text: 'Mr. Khayati, your behavior in the parking lot was... irregular.' },
      { speaker: 'Khayati', text: 'I do not recognize your authority!' },
      { speaker: 'The Bureaucrat', text: 'Then I must enforce compliance through heavy grappling.' }
    ]
  },
  bureaucrat_vs_professor: {
    id: 'bureaucrat_vs_professor',
    title: 'BUDGET CUTS',
    backgroundClass: 'bg-stone-800',
    actors: [
      { characterId: 'bureaucrat', position: 'left', action: 'IDLE', direction: 1 },
      { characterId: 'professor', position: 'right', action: 'IDLE', direction: -1 }
    ],
    dialogue: [
      { speaker: 'The Bureaucrat', text: 'Professor, your department is underperforming. We are cutting your funding.' },
      { speaker: 'Professor', text: 'Preposterous! My citations are in the 99th percentile!' },
      { speaker: 'The Bureaucrat', text: 'Citations do not equal revenue. Prepare for restructuring.' }
    ]
  },
  bureaucrat_vs_maoist: {
    id: 'bureaucrat_vs_maoist',
    title: 'PERMIT APPLICATION',
    backgroundClass: 'bg-slate-700',
    actors: [
      { characterId: 'bureaucrat', position: 'left', action: 'IDLE', direction: 1 },
      { characterId: 'maoist', position: 'right', action: 'ATTACK_RP', direction: -1 }
    ],
    dialogue: [
      { speaker: 'Maoist', text: 'I demand an uprising permit!' },
      { speaker: 'The Bureaucrat', text: 'Denied. And here is a denial stamp to the face.' }
    ]
  },
  bureaucrat_vs_debord: {
    id: 'bureaucrat_vs_debord',
    title: 'PAPERWORK IN TRIPLICATE',
    backgroundClass: 'bg-black',
    actors: [
      { characterId: 'bureaucrat', position: 'left', action: 'IDLE', direction: 1 },
      { characterId: 'debord', position: 'center', action: 'IDLE', direction: -1 }
    ],
    dialogue: [
      { speaker: 'Guy Debord', text: 'Your paperwork is pure spectacle.' },
      { speaker: 'The Bureaucrat', text: 'It is also mandatory.' }
    ]
  },

  // PROFESSOR VS X
  professor_vs_khayati: {
    id: 'professor_vs_khayati',
    title: 'CITATION WAR',
    backgroundClass: 'bg-stone-900',
    actors: [
      { characterId: 'professor', position: 'left', action: 'IDLE', direction: 1 },
      { characterId: 'khayati', position: 'right', action: 'IDLE', direction: -1 }
    ],
    dialogue: [
      { speaker: 'Professor', text: 'Your citations of Debord are outdated.' },
      { speaker: 'Khayati', text: 'I am not a footnote. I am a rupture.' },
      { speaker: 'Professor', text: 'Then you will be revised.' }
    ]
  },
  professor_vs_bureaucrat: {
    id: 'professor_vs_bureaucrat',
    title: 'BUDGET NEGOTIATIONS',
    backgroundClass: 'bg-slate-800',
    actors: [
      { characterId: 'professor', position: 'left', action: 'IDLE', direction: 1 },
      { characterId: 'bureaucrat', position: 'right', action: 'IDLE', direction: -1 }
    ],
    dialogue: [
      { speaker: 'Professor', text: 'You cannot cut my program!' },
      { speaker: 'The Bureaucrat', text: 'I can and I will.' },
      { speaker: 'Professor', text: 'Then prepare to be peer reviewed.' }
    ]
  },
  professor_vs_maoist: {
    id: 'professor_vs_maoist',
    title: 'THE CULTURAL REVOLUTION',
    backgroundClass: 'bg-green-900',
    actors: [
      { characterId: 'professor', position: 'left', action: 'IDLE', direction: 1 },
      { characterId: 'maoist', position: 'right', action: 'IDLE', direction: -1 }
    ],
    dialogue: [
      { speaker: 'Maoist', text: 'Theory without practice is revisionism!' },
      { speaker: 'Professor', text: 'Practice without theory is barbarism.' }
    ]
  },
  professor_vs_debord: {
    id: 'professor_vs_debord',
    title: 'THE COLLOQUIUM',
    backgroundClass: 'bg-black',
    actors: [
      { characterId: 'professor', position: 'left', action: 'IDLE', direction: 1 },
      { characterId: 'debord', position: 'center', action: 'IDLE', direction: -1 }
    ],
    dialogue: [
      { speaker: 'Professor', text: 'Guy, your work lacks peer review.' },
      { speaker: 'Guy Debord', text: 'Your peer review lacks revolution.' }
    ]
  },

  // MAOIST VS X
  maoist_vs_khayati: {
    id: 'maoist_vs_khayati',
    title: 'THE RECTIFICATION CAMPAIGN',
    backgroundClass: 'bg-green-900',
    actors: [
      { characterId: 'maoist', position: 'left', action: 'IDLE', direction: 1 },
      { characterId: 'khayati', position: 'right', action: 'IDLE', direction: -1 }
    ],
    dialogue: [
      { speaker: 'Maoist', text: 'You must align with the Party line!' },
      { speaker: 'Khayati', text: 'I align with the proletariat.' },
      { speaker: 'Maoist', text: 'Then prove it in combat.' }
    ]
  },
  maoist_vs_bureaucrat: {
    id: 'maoist_vs_bureaucrat',
    title: 'SMASH THE STATE',
    backgroundClass: 'bg-slate-800',
    actors: [
      { characterId: 'maoist', position: 'left', action: 'IDLE', direction: 1 },
      { characterId: 'bureaucrat', position: 'right', action: 'IDLE', direction: -1 }
    ],
    dialogue: [
      { speaker: 'Maoist', text: 'The state must be smashed!' },
      { speaker: 'The Bureaucrat', text: 'I am the state. And I am quite solid.' },
      { speaker: 'Maoist', text: 'Then I will use my head!' }
    ]
  },
  maoist_vs_professor: {
    id: 'maoist_vs_professor',
    title: 'RE-EDUCATION',
    backgroundClass: 'bg-green-800',
    actors: [
      { characterId: 'maoist', position: 'left', action: 'IDLE', direction: 1 },
      { characterId: 'professor', position: 'right', action: 'IDLE', direction: -1 }
    ],
    dialogue: [
      { speaker: 'Maoist', text: 'Intellectuals must be sent to the countryside!' },
      { speaker: 'Professor', text: 'But there are no coffee shops there!' },
      { speaker: 'Maoist', text: 'Exactly! Only labor!' }
    ]
  },
  maoist_vs_debord: {
    id: 'maoist_vs_debord',
    title: 'FALSE IDOLS',
    backgroundClass: 'bg-black',
    actors: [
      { characterId: 'maoist', position: 'left', action: 'IDLE', direction: 1 },
      { characterId: 'debord', position: 'center', action: 'IDLE', direction: -1 }
    ],
    dialogue: [
      { speaker: 'Maoist', text: 'You are not Chairman Mao!' },
      { speaker: 'Guy Debord', text: 'I am nothing. I am the reflection of your own desire for leadership.' },
      { speaker: 'Maoist', text: 'Confusing! Attack!' }
    ]
  }
};
