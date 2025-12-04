export type ActionType =
  | 'IDLE'
  | 'WALK_FORWARD'
  | 'WALK_BACKWARD'
  | 'CROUCH'
  | 'JUMP'
  | 'BLOCK'
  | 'ATTACK_LP'  // Light Punch
  | 'ATTACK_RP'  // Right Punch
  | 'ATTACK_LK'  // Light Kick
  | 'ATTACK_RK'  // Right Kick
  | 'JUMP_ATTACK_P'
  | 'JUMP_ATTACK_K'
  | 'CROUCH_ATTACK_P'
  | 'CROUCH_ATTACK_K'
  | 'SPECIAL_1'
  | 'SPECIAL_2'
  | 'SPECIAL_3'
  | 'SPECIAL_4'
  | 'HIT_STUN'
  | 'GRABBED'
  | 'KNOCKDOWN'
  | 'DIZZY'
  | 'VICTORY'
  | 'DEFEAT';

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

export interface CharacterData {
  id: string;
  name: string;
  archetype: string;
  portrait?: string;
  styles?: string[];
  stats: {
    speed: number;
    power: number;
    defense: number;
  };
  meterName: string;
  comboTitles: string[];
  moves: {
    [key in ActionType]?: MoveData;
  };
}

export const CHARACTERS = {
  khayati: {
    IDLE: [
      "/assets/liukang/sprites/stance/01.png",
      "/assets/liukang/sprites/stance/02.png",
      "/assets/liukang/sprites/stance/03.png",
      "/assets/liukang/sprites/stance/04.png",
      "/assets/liukang/sprites/stance/05.png",
      "/assets/liukang/sprites/stance/06.png",
      "/assets/liukang/sprites/stance/07.png",
      "/assets/liukang/sprites/stance/08.png",
      "/assets/liukang/sprites/stance/09.png"
    ],
    WALK_FORWARD: [
      "/assets/liukang/sprites/walk/01.png",
      "/assets/liukang/sprites/walk/02.png",
      "/assets/liukang/sprites/walk/03.png",
      "/assets/liukang/sprites/walk/04.png",
      "/assets/liukang/sprites/walk/05.png",
      "/assets/liukang/sprites/walk/06.png",
      "/assets/liukang/sprites/walk/07.png",
      "/assets/liukang/sprites/walk/08.png"
    ],
    WALK_BACKWARD: [
      "/assets/liukang/sprites/walk/08.png",
      "/assets/liukang/sprites/walk/07.png",
      "/assets/liukang/sprites/walk/06.png",
      "/assets/liukang/sprites/walk/05.png",
      "/assets/liukang/sprites/walk/04.png",
      "/assets/liukang/sprites/walk/03.png",
      "/assets/liukang/sprites/walk/02.png",
      "/assets/liukang/sprites/walk/01.png"
    ],
    CROUCH: [
      "/assets/liukang/sprites/block/d01.png",
      "/assets/liukang/sprites/block/d02.png",
      "/assets/liukang/sprites/block/d03.png"
    ],
    JUMP: [
      "/assets/liukang/sprites/duckjump/f01.png",
      "/assets/liukang/sprites/duckjump/f02.png",
      "/assets/liukang/sprites/duckjump/f03.png",
      "/assets/liukang/sprites/duckjump/f04.png",
      "/assets/liukang/sprites/duckjump/f05.png",
      "/assets/liukang/sprites/duckjump/f06.png",
      "/assets/liukang/sprites/duckjump/f07.png",
      "/assets/liukang/sprites/duckjump/f08.png"
    ],
    ATTACK_LP: [
      "/assets/liukang/sprites/punch/01.png",
      "/assets/liukang/sprites/punch/02.png",
      "/assets/liukang/sprites/punch/03.png",
      "/assets/liukang/sprites/punch/04.png"
    ],
    ATTACK_RP: [
      "/assets/liukang/sprites/punch/04.png",
      "/assets/liukang/sprites/punch/05.png",
      "/assets/liukang/sprites/punch/06.png",
      "/assets/liukang/sprites/punch/07.png",
      "/assets/liukang/sprites/punch/08.png",
      "/assets/liukang/sprites/punch/09.png"
    ],
    ATTACK_LK: [
      "/assets/liukang/sprites/kick/01.png",
      "/assets/liukang/sprites/kick/02.png",
      "/assets/liukang/sprites/kick/03.png",
      "/assets/liukang/sprites/kick/04.png",
      "/assets/liukang/sprites/kick/05.png",
      "/assets/liukang/sprites/kick/06.png"
    ],
    ATTACK_RK: [
      "/assets/liukang/sprites/kick/r01.png",
      "/assets/liukang/sprites/kick/r02.png",
      "/assets/liukang/sprites/kick/r03.png",
      "/assets/liukang/sprites/kick/r04.png",
      "/assets/liukang/sprites/kick/r05.png",
      "/assets/liukang/sprites/kick/r06.png",
      "/assets/liukang/sprites/kick/r07.png",
      "/assets/liukang/sprites/kick/r08.png"
    ],
    CROUCH_ATTACK_P: [
      "/assets/liukang/sprites/punch/u01.png",
      "/assets/liukang/sprites/punch/u02.png",
      "/assets/liukang/sprites/punch/u03.png",
      "/assets/liukang/sprites/punch/u04.png",
      "/assets/liukang/sprites/punch/u05.png"
    ],
    CROUCH_ATTACK_K: [
      "/assets/liukang/sprites/kick/s01.png",
      "/assets/liukang/sprites/kick/s02.png",
      "/assets/liukang/sprites/kick/s03.png",
      "/assets/liukang/sprites/kick/s04.png",
      "/assets/liukang/sprites/kick/s05.png",
      "/assets/liukang/sprites/kick/s06.png"
    ],
    JUMP_ATTACK_P: [
      "/assets/liukang/sprites/punch/a01.png",
      "/assets/liukang/sprites/punch/a02.png",
      "/assets/liukang/sprites/punch/a03.png"
    ],
    JUMP_ATTACK_K: [
      "/assets/liukang/sprites/kick/a01.png",
      "/assets/liukang/sprites/kick/a02.png",
      "/assets/liukang/sprites/kick/a03.png",
      "/assets/liukang/sprites/kick/a04.png",
      "/assets/liukang/sprites/kick/a05.png",
      "/assets/liukang/sprites/kick/a06.png"
    ],
    SPECIAL_1: [
      "/assets/liukang/sprites/special/101.png",
      "/assets/liukang/sprites/special/102.png",
      "/assets/liukang/sprites/special/103.png"
    ],
    SPECIAL_2: [
      "/assets/liukang/sprites/special/201.png",
      "/assets/liukang/sprites/special/202.png",
      "/assets/liukang/sprites/special/203.png"
    ],
    SPECIAL_3: [
      "/assets/liukang/sprites/special/301.png",
      "/assets/liukang/sprites/special/302.png",
      "/assets/liukang/sprites/special/303.png",
      "/assets/liukang/sprites/special/304.png"
    ],
    SPECIAL_4: [
      "/assets/liukang/sprites/special/501.png",
      "/assets/liukang/sprites/special/502.png",
      "/assets/liukang/sprites/special/503.png",
      "/assets/liukang/sprites/special/504.png",
      "/assets/liukang/sprites/special/505.png"
    ],
    HIT_STUN: [
      "/assets/liukang/sprites/block/01.png",
      "/assets/liukang/sprites/block/02.png",
      "/assets/liukang/sprites/block/03.png"
    ],
    GRABBED: [
      "/assets/liukang/sprites/block/01.png",
      "/assets/liukang/sprites/block/02.png",
      "/assets/liukang/sprites/block/03.png"
    ],
    KNOCKDOWN: [
      "/assets/liukang/sprites/beinghit/s01.png",
      "/assets/liukang/sprites/beinghit/s02.png",
      "/assets/liukang/sprites/beinghit/s03.png",
      "/assets/liukang/sprites/beinghit/s04.png",
      "/assets/liukang/sprites/beinghit/s05.png",
      "/assets/liukang/sprites/beinghit/s06.png",
      "/assets/liukang/sprites/beinghit/s07.png"
    ],
    BLOCK: [
      "/assets/liukang/sprites/block/01.png",
      "/assets/liukang/sprites/block/02.png",
      "/assets/liukang/sprites/block/03.png"
    ],
    DIZZY: [
      "/assets/liukang/sprites/dizzy/01.png",
      "/assets/liukang/sprites/dizzy/02.png",
      "/assets/liukang/sprites/dizzy/03.png"
    ],
    VICTORY: "/assets/liukang/sprites/victory/a1.gif",
    DEFEAT: [
      "/assets/liukang/sprites/fall/f01.png",
      "/assets/liukang/sprites/fall/f02.png",
      "/assets/liukang/sprites/fall/f03.png",
      "/assets/liukang/sprites/fall/f04.png",
      "/assets/liukang/sprites/fall/f05.png",
      "/assets/liukang/sprites/fall/f06.png",
      "/assets/liukang/sprites/fall/f07.png",
      "/assets/liukang/sprites/fall/f08.png"
    ]
  },
  bureaucrat: {
    IDLE: [
      "/assets/stryker/sprites/stance/01.png",
      "/assets/stryker/sprites/stance/02.png",
      "/assets/stryker/sprites/stance/03.png",
      "/assets/stryker/sprites/stance/04.png",
      "/assets/stryker/sprites/stance/05.png",
      "/assets/stryker/sprites/stance/06.png",
      "/assets/stryker/sprites/stance/07.png"
    ],
    WALK_FORWARD: [
      "/assets/stryker/sprites/walk/01.png",
      "/assets/stryker/sprites/walk/02.png",
      "/assets/stryker/sprites/walk/03.png",
      "/assets/stryker/sprites/walk/04.png",
      "/assets/stryker/sprites/walk/05.png",
      "/assets/stryker/sprites/walk/06.png",
      "/assets/stryker/sprites/walk/07.png",
      "/assets/stryker/sprites/walk/08.png",
      "/assets/stryker/sprites/walk/09.png"
    ],
    WALK_BACKWARD: [
      "/assets/stryker/sprites/walk/09.png",
      "/assets/stryker/sprites/walk/08.png",
      "/assets/stryker/sprites/walk/07.png",
      "/assets/stryker/sprites/walk/06.png",
      "/assets/stryker/sprites/walk/05.png",
      "/assets/stryker/sprites/walk/04.png",
      "/assets/stryker/sprites/walk/03.png",
      "/assets/stryker/sprites/walk/02.png",
      "/assets/stryker/sprites/walk/01.png"
    ],
    CROUCH: [
      "/assets/stryker/sprites/block/d01.png",
      "/assets/stryker/sprites/block/d02.png",
      "/assets/stryker/sprites/block/d03.png"
    ],
    JUMP: [
      "/assets/stryker/sprites/duckjump/f01.png",
      "/assets/stryker/sprites/duckjump/f02.png",
      "/assets/stryker/sprites/duckjump/f03.png",
      "/assets/stryker/sprites/duckjump/f04.png",
      "/assets/stryker/sprites/duckjump/f05.png",
      "/assets/stryker/sprites/duckjump/f06.png",
      "/assets/stryker/sprites/duckjump/f07.png",
      "/assets/stryker/sprites/duckjump/f08.png"
    ],
    ATTACK_LP: [
      "/assets/stryker/sprites/punch/01.png",
      "/assets/stryker/sprites/punch/02.png",
      "/assets/stryker/sprites/punch/03.png",
      "/assets/stryker/sprites/punch/04.png"
    ],
    ATTACK_RP: [
      "/assets/stryker/sprites/punch/04.png",
      "/assets/stryker/sprites/punch/05.png",
      "/assets/stryker/sprites/punch/06.png",
      "/assets/stryker/sprites/punch/07.png",
      "/assets/stryker/sprites/punch/08.png",
      "/assets/stryker/sprites/punch/09.png"
    ],
    ATTACK_LK: [
      "/assets/stryker/sprites/kick/01.png",
      "/assets/stryker/sprites/kick/02.png",
      "/assets/stryker/sprites/kick/03.png",
      "/assets/stryker/sprites/kick/04.png",
      "/assets/stryker/sprites/kick/05.png",
      "/assets/stryker/sprites/kick/06.png"
    ],
    ATTACK_RK: [
      "/assets/stryker/sprites/kick/r01.png",
      "/assets/stryker/sprites/kick/r02.png",
      "/assets/stryker/sprites/kick/r03.png",
      "/assets/stryker/sprites/kick/r04.png",
      "/assets/stryker/sprites/kick/r05.png",
      "/assets/stryker/sprites/kick/r06.png",
      "/assets/stryker/sprites/kick/r07.png",
      "/assets/stryker/sprites/kick/r08.png"
    ],
    CROUCH_ATTACK_P: [
      "/assets/stryker/sprites/punch/08.png",
      "/assets/stryker/sprites/punch/09.png"
    ],
    CROUCH_ATTACK_K: [
      "/assets/stryker/sprites/kick/s01.png",
      "/assets/stryker/sprites/kick/s02.png",
      "/assets/stryker/sprites/kick/s03.png",
      "/assets/stryker/sprites/kick/s04.png"
    ],
    JUMP_ATTACK_P: [
      "/assets/stryker/sprites/punch/a01.png",
      "/assets/stryker/sprites/punch/a02.png",
      "/assets/stryker/sprites/punch/a03.png"
    ],
    JUMP_ATTACK_K: [
      "/assets/stryker/sprites/kick/a01.png",
      "/assets/stryker/sprites/kick/a02.png",
      "/assets/stryker/sprites/kick/a03.png",
      "/assets/stryker/sprites/kick/a04.png",
      "/assets/stryker/sprites/kick/a05.png",
      "/assets/stryker/sprites/kick/a06.png"
    ],
    SPECIAL_1: [
      "/assets/stryker/sprites/special/101.png",
      "/assets/stryker/sprites/special/102.png",
      "/assets/stryker/sprites/special/103.png"
    ],
    SPECIAL_2: [
      "/assets/stryker/sprites/special/201.png",
      "/assets/stryker/sprites/special/202.png",
      "/assets/stryker/sprites/special/203.png"
    ],
    SPECIAL_3: [
      "/assets/stryker/sprites/special/301.png",
      "/assets/stryker/sprites/special/302.png",
      "/assets/stryker/sprites/special/303.png",
      "/assets/stryker/sprites/special/304.png"
    ],
    SPECIAL_4: [
      "/assets/stryker/sprites/special/201.png",
      "/assets/stryker/sprites/special/202.png",
      "/assets/stryker/sprites/special/203.png",
      "/assets/stryker/sprites/special/204.png"
    ],
    HIT_STUN: [
      "/assets/stryker/sprites/beinghit/h01.png",
      "/assets/stryker/sprites/beinghit/h02.png",
      "/assets/stryker/sprites/beinghit/h03.png"
    ],
    GRABBED: [
      "/assets/stryker/sprites/beinghit/h01.png",
      "/assets/stryker/sprites/beinghit/h02.png",
      "/assets/stryker/sprites/beinghit/h03.png"
    ],
    KNOCKDOWN: [
      "/assets/stryker/sprites/beinghit/s01.png",
      "/assets/stryker/sprites/beinghit/s02.png",
      "/assets/stryker/sprites/beinghit/s03.png",
      "/assets/stryker/sprites/beinghit/s04.png",
      "/assets/stryker/sprites/beinghit/s05.png",
      "/assets/stryker/sprites/beinghit/s06.png",
      "/assets/stryker/sprites/beinghit/s07.png"
    ],
    BLOCK: [
      "/assets/stryker/sprites/block/01.png",
      "/assets/stryker/sprites/block/02.png",
      "/assets/stryker/sprites/block/03.png"
    ],
    DIZZY: [
      "/assets/stryker/sprites/dizzy/01.png",
      "/assets/stryker/sprites/dizzy/02.png",
      "/assets/stryker/sprites/dizzy/03.png"
    ],
    VICTORY: "/assets/stryker/sprites/victory/a1.gif",
    DEFEAT: [
      "/assets/stryker/sprites/fall/01.png",
      "/assets/stryker/sprites/fall/02.png",
      "/assets/stryker/sprites/fall/03.png"
    ]
  },
  professor: {
    IDLE: [
      "/assets/shangtsung/sprites/stance/01.png",
      "/assets/shangtsung/sprites/stance/02.png",
      "/assets/shangtsung/sprites/stance/03.png",
      "/assets/shangtsung/sprites/stance/04.png",
      "/assets/shangtsung/sprites/stance/05.png",
      "/assets/shangtsung/sprites/stance/06.png",
      "/assets/shangtsung/sprites/stance/07.png",
      "/assets/shangtsung/sprites/stance/08.png",
      "/assets/shangtsung/sprites/stance/09.png"
    ],
    WALK_FORWARD: [
      "/assets/shangtsung/sprites/walk/01.png",
      "/assets/shangtsung/sprites/walk/02.png",
      "/assets/shangtsung/sprites/walk/03.png",
      "/assets/shangtsung/sprites/walk/04.png",
      "/assets/shangtsung/sprites/walk/05.png",
      "/assets/shangtsung/sprites/walk/06.png",
      "/assets/shangtsung/sprites/walk/07.png",
      "/assets/shangtsung/sprites/walk/08.png"
    ],
    WALK_BACKWARD: [
      "/assets/shangtsung/sprites/walk/08.png",
      "/assets/shangtsung/sprites/walk/07.png",
      "/assets/shangtsung/sprites/walk/06.png",
      "/assets/shangtsung/sprites/walk/05.png",
      "/assets/shangtsung/sprites/walk/04.png",
      "/assets/shangtsung/sprites/walk/03.png",
      "/assets/shangtsung/sprites/walk/02.png",
      "/assets/shangtsung/sprites/walk/01.png"
    ],
    CROUCH: [
      "/assets/shangtsung/sprites/block/d01.png",
      "/assets/shangtsung/sprites/block/d02.png",
      "/assets/shangtsung/sprites/block/d03.png"
    ],
    JUMP: [
      "/assets/shangtsung/sprites/duckjump/f01.png",
      "/assets/shangtsung/sprites/duckjump/f02.png",
      "/assets/shangtsung/sprites/duckjump/f03.png",
      "/assets/shangtsung/sprites/duckjump/f04.png",
      "/assets/shangtsung/sprites/duckjump/f05.png",
      "/assets/shangtsung/sprites/duckjump/f06.png",
      "/assets/shangtsung/sprites/duckjump/f07.png",
      "/assets/shangtsung/sprites/duckjump/f08.png"
    ],
    ATTACK_LP: [
      "/assets/shangtsung/sprites/punch/01.png",
      "/assets/shangtsung/sprites/punch/02.png",
      "/assets/shangtsung/sprites/punch/03.png",
      "/assets/shangtsung/sprites/punch/04.png"
    ],
    ATTACK_RP: [
      "/assets/shangtsung/sprites/punch/04.png",
      "/assets/shangtsung/sprites/punch/05.png",
      "/assets/shangtsung/sprites/punch/06.png",
      "/assets/shangtsung/sprites/punch/07.png",
      "/assets/shangtsung/sprites/punch/08.png",
      "/assets/shangtsung/sprites/punch/09.png"
    ],
    ATTACK_LK: [
      "/assets/shangtsung/sprites/kick/01.png",
      "/assets/shangtsung/sprites/kick/02.png",
      "/assets/shangtsung/sprites/kick/03.png",
      "/assets/shangtsung/sprites/kick/04.png",
      "/assets/shangtsung/sprites/kick/05.png",
      "/assets/shangtsung/sprites/kick/06.png"
    ],
    ATTACK_RK: [
      "/assets/shangtsung/sprites/kick/r01.png",
      "/assets/shangtsung/sprites/kick/r02.png",
      "/assets/shangtsung/sprites/kick/r03.png",
      "/assets/shangtsung/sprites/kick/r04.png",
      "/assets/shangtsung/sprites/kick/r05.png",
      "/assets/shangtsung/sprites/kick/r06.png",
      "/assets/shangtsung/sprites/kick/r07.png",
      "/assets/shangtsung/sprites/kick/r08.png"
    ],
    CROUCH_ATTACK_P: [
      "/assets/shangtsung/sprites/punch/08.png",
      "/assets/shangtsung/sprites/punch/09.png"
    ],
    CROUCH_ATTACK_K: [
      "/assets/shangtsung/sprites/kick/s01.png",
      "/assets/shangtsung/sprites/kick/s02.png",
      "/assets/shangtsung/sprites/kick/s03.png",
      "/assets/shangtsung/sprites/kick/s04.png"
    ],
    JUMP_ATTACK_P: [
      "/assets/shangtsung/sprites/punch/a01.png",
      "/assets/shangtsung/sprites/punch/a02.png",
      "/assets/shangtsung/sprites/punch/a03.png"
    ],
    JUMP_ATTACK_K: [
      "/assets/shangtsung/sprites/kick/a01.png",
      "/assets/shangtsung/sprites/kick/a02.png",
      "/assets/shangtsung/sprites/kick/a03.png",
      "/assets/shangtsung/sprites/kick/a04.png",
      "/assets/shangtsung/sprites/kick/a05.png",
      "/assets/shangtsung/sprites/kick/a06.png"
    ],
    SPECIAL_1: [
      "/assets/shangtsung/sprites/special/101.png",
      "/assets/shangtsung/sprites/special/102.png",
      "/assets/shangtsung/sprites/special/103.png"
    ],
    SPECIAL_2: [
      "/assets/shangtsung/sprites/special/201.png",
      "/assets/shangtsung/sprites/special/202.png",
      "/assets/shangtsung/sprites/special/203.png"
    ],
    SPECIAL_3: [
      "/assets/shangtsung/sprites/special/201.png",
      "/assets/shangtsung/sprites/special/202.png",
      "/assets/shangtsung/sprites/special/203.png",
      "/assets/shangtsung/sprites/special/204.png"
    ],
    SPECIAL_4: [
      "/assets/shangtsung/sprites/special/101.png",
      "/assets/shangtsung/sprites/special/102.png",
      "/assets/shangtsung/sprites/special/103.png",
      "/assets/shangtsung/sprites/special/104.png"
    ],
    HIT_STUN: [
      "/assets/shangtsung/sprites/beinghit/h01.png",
      "/assets/shangtsung/sprites/beinghit/h02.png",
      "/assets/shangtsung/sprites/beinghit/h03.png"
    ],
    GRABBED: [
      "/assets/shangtsung/sprites/beinghit/h01.png",
      "/assets/shangtsung/sprites/beinghit/h02.png",
      "/assets/shangtsung/sprites/beinghit/h03.png"
    ],
    KNOCKDOWN: [
      "/assets/shangtsung/sprites/beinghit/s01.png",
      "/assets/shangtsung/sprites/beinghit/s02.png",
      "/assets/shangtsung/sprites/beinghit/s03.png",
      "/assets/shangtsung/sprites/beinghit/s04.png",
      "/assets/shangtsung/sprites/beinghit/s05.png",
      "/assets/shangtsung/sprites/beinghit/s06.png",
      "/assets/shangtsung/sprites/beinghit/s07.png",
      "/assets/shangtsung/sprites/beinghit/s08.png",
      "/assets/shangtsung/sprites/beinghit/s09.png"
    ],
    BLOCK: [
      "/assets/shangtsung/sprites/block/01.png",
      "/assets/shangtsung/sprites/block/02.png",
      "/assets/shangtsung/sprites/block/03.png"
    ],
    DIZZY: [
      "/assets/shangtsung/sprites/dizzy/01.png",
      "/assets/shangtsung/sprites/dizzy/02.png",
      "/assets/shangtsung/sprites/dizzy/03.png"
    ],
    VICTORY: "/assets/shangtsung/sprites/victory/a1.gif",
    DEFEAT: [
      "/assets/shangtsung/sprites/fall/01.png",
      "/assets/shangtsung/sprites/fall/02.png",
      "/assets/shangtsung/sprites/fall/03.png"
    ]
  },
  maoist: {
    IDLE: [
      "/assets/kunglao/sprites/stance/01.gif",
      "/assets/kunglao/sprites/stance/02.gif",
      "/assets/kunglao/sprites/stance/03.gif",
      "/assets/kunglao/sprites/stance/04.gif",
      "/assets/kunglao/sprites/stance/05.gif",
      "/assets/kunglao/sprites/stance/06.gif",
      "/assets/kunglao/sprites/stance/07.gif",
      "/assets/kunglao/sprites/stance/08.gif",
      "/assets/kunglao/sprites/stance/09.gif"
    ],
    WALK_FORWARD: [
      "/assets/kunglao/sprites/walk/01.gif",
      "/assets/kunglao/sprites/walk/02.gif",
      "/assets/kunglao/sprites/walk/03.gif",
      "/assets/kunglao/sprites/walk/04.gif",
      "/assets/kunglao/sprites/walk/05.gif",
      "/assets/kunglao/sprites/walk/06.gif",
      "/assets/kunglao/sprites/walk/07.gif",
      "/assets/kunglao/sprites/walk/08.gif",
      "/assets/kunglao/sprites/walk/09.gif"
    ],
    WALK_BACKWARD: [
      "/assets/kunglao/sprites/walk/09.gif",
      "/assets/kunglao/sprites/walk/08.gif",
      "/assets/kunglao/sprites/walk/07.gif",
      "/assets/kunglao/sprites/walk/06.gif",
      "/assets/kunglao/sprites/walk/05.gif",
      "/assets/kunglao/sprites/walk/04.gif",
      "/assets/kunglao/sprites/walk/03.gif",
      "/assets/kunglao/sprites/walk/02.gif",
      "/assets/kunglao/sprites/walk/01.gif"
    ],
    CROUCH: [
      "/assets/kunglao/sprites/block/d01.gif",
      "/assets/kunglao/sprites/block/d02.gif",
      "/assets/kunglao/sprites/block/d03.gif"
    ],
    JUMP: [
      "/assets/kunglao/sprites/duckjump/f01.gif",
      "/assets/kunglao/sprites/duckjump/f02.gif",
      "/assets/kunglao/sprites/duckjump/f03.gif",
      "/assets/kunglao/sprites/duckjump/f04.png",
      "/assets/kunglao/sprites/duckjump/f05.png",
      "/assets/kunglao/sprites/duckjump/f06.png",
      "/assets/kunglao/sprites/duckjump/f07.png",
      "/assets/kunglao/sprites/duckjump/f08.png"
    ],
    ATTACK_LP: [
      "/assets/kunglao/sprites/punch/01.gif",
      "/assets/kunglao/sprites/punch/02.gif",
      "/assets/kunglao/sprites/punch/03.gif",
      "/assets/kunglao/sprites/punch/04.gif"
    ],
    ATTACK_RP: [
      "/assets/kunglao/sprites/punch/04.gif",
      "/assets/kunglao/sprites/punch/05.gif",
      "/assets/kunglao/sprites/punch/06.gif",
      "/assets/kunglao/sprites/punch/07.gif",
      "/assets/kunglao/sprites/punch/08.gif",
      "/assets/kunglao/sprites/punch/09.gif"
    ],
    ATTACK_LK: [
      "/assets/kunglao/sprites/kick/01.gif",
      "/assets/kunglao/sprites/kick/02.gif",
      "/assets/kunglao/sprites/kick/03.gif",
      "/assets/kunglao/sprites/kick/04.gif",
      "/assets/kunglao/sprites/kick/05.gif",
      "/assets/kunglao/sprites/kick/06.gif"
    ],
    ATTACK_RK: [
      "/assets/kunglao/sprites/kick/r01.png",
      "/assets/kunglao/sprites/kick/r02.png",
      "/assets/kunglao/sprites/kick/r03.png",
      "/assets/kunglao/sprites/kick/r04.png",
      "/assets/kunglao/sprites/kick/r05.png",
      "/assets/kunglao/sprites/kick/r06.png",
      "/assets/kunglao/sprites/kick/r07.png",
      "/assets/kunglao/sprites/kick/r08.png"
    ],
    CROUCH_ATTACK_P: [
      "/assets/kunglao/sprites/punch/08.gif",
      "/assets/kunglao/sprites/punch/09.gif"
    ],
    CROUCH_ATTACK_K: [
      "/assets/kunglao/sprites/kick/s01.png",
      "/assets/kunglao/sprites/kick/s02.png",
      "/assets/kunglao/sprites/kick/s03.png",
      "/assets/kunglao/sprites/kick/s04.png"
    ],
    JUMP_ATTACK_P: [
      "/assets/kunglao/sprites/punch/a01.png",
      "/assets/kunglao/sprites/punch/a02.png",
      "/assets/kunglao/sprites/punch/a03.png"
    ],
    JUMP_ATTACK_K: [
      "/assets/kunglao/sprites/kick/a01.png",
      "/assets/kunglao/sprites/kick/a02.png",
      "/assets/kunglao/sprites/kick/a03.png",
      "/assets/kunglao/sprites/kick/a04.png",
      "/assets/kunglao/sprites/kick/a05.png",
      "/assets/kunglao/sprites/kick/a06.png"
    ],
    SPECIAL_1: [
      "/assets/kunglao/sprites/special/101.gif",
      "/assets/kunglao/sprites/special/102.gif",
      "/assets/kunglao/sprites/special/103.gif"
    ],
    SPECIAL_2: [
      "/assets/kunglao/sprites/special/201.png",
      "/assets/kunglao/sprites/special/202.png",
      "/assets/kunglao/sprites/special/203.png"
    ],
    SPECIAL_3: [
      "/assets/kunglao/sprites/special/301.png",
      "/assets/kunglao/sprites/special/302.png",
      "/assets/kunglao/sprites/special/303.png",
      "/assets/kunglao/sprites/special/304.png"
    ],
    SPECIAL_4: [
      "/assets/kunglao/sprites/special/201.png",
      "/assets/kunglao/sprites/special/202.png",
      "/assets/kunglao/sprites/special/203.png",
      "/assets/kunglao/sprites/special/204.png"
    ],
    HIT_STUN: [
      "/assets/kunglao/sprites/beinghit/h01.png",
      "/assets/kunglao/sprites/beinghit/h02.png",
      "/assets/kunglao/sprites/beinghit/h03.png"
    ],
    GRABBED: [
      "/assets/kunglao/sprites/beinghit/h01.png",
      "/assets/kunglao/sprites/beinghit/h02.png",
      "/assets/kunglao/sprites/beinghit/h03.png"
    ],
    KNOCKDOWN: [
      "/assets/kunglao/sprites/beinghit/s01.gif",
      "/assets/kunglao/sprites/beinghit/s02.gif",
      "/assets/kunglao/sprites/beinghit/s03.gif",
      "/assets/kunglao/sprites/beinghit/s04.gif",
      "/assets/kunglao/sprites/beinghit/s05.gif",
      "/assets/kunglao/sprites/beinghit/s06.gif",
      "/assets/kunglao/sprites/beinghit/s07.gif",
      "/assets/kunglao/sprites/beinghit/s08.gif"
    ],
    BLOCK: [
      "/assets/kunglao/sprites/block/01.png",
      "/assets/kunglao/sprites/block/02.png",
      "/assets/kunglao/sprites/block/03.png"
    ],
    DIZZY: [
      "/assets/kunglao/sprites/dizzy/01.png",
      "/assets/kunglao/sprites/dizzy/02.png",
      "/assets/kunglao/sprites/dizzy/03.png"
    ],
    VICTORY: "/assets/kunglao/sprites/victory/a1.gif",
    DEFEAT: [
      "/assets/kunglao/sprites/fall/f01.gif",
      "/assets/kunglao/sprites/fall/f02.gif",
      "/assets/kunglao/sprites/fall/f03.gif"
    ]
  },
  debord: {
    IDLE: "/assets/noobsaibot/sprites/stance/a1.gif",
    WALK_FORWARD: "/assets/noobsaibot/sprites/walk/a1.gif",
    WALK_BACKWARD: "/assets/noobsaibot/sprites/walk/a1.gif",
    CROUCH: [
      "/assets/noobsaibot/sprites/duckjump/d01.png",
      "/assets/noobsaibot/sprites/duckjump/d02.png",
      "/assets/noobsaibot/sprites/duckjump/d03.png"
    ],
    JUMP: [
      "/assets/noobsaibot/sprites/duckjump/f01.png",
      "/assets/noobsaibot/sprites/duckjump/f02.png",
      "/assets/noobsaibot/sprites/duckjump/f03.png",
      "/assets/noobsaibot/sprites/duckjump/f04.png",
      "/assets/noobsaibot/sprites/duckjump/f05.png",
      "/assets/noobsaibot/sprites/duckjump/f06.png",
      "/assets/noobsaibot/sprites/duckjump/f07.png"
    ],
    ATTACK_LP: [
      "/assets/noobsaibot/sprites/punch/06.png",
      "/assets/noobsaibot/sprites/punch/13.png"
    ],
    ATTACK_RP: [
      "/assets/noobsaibot/sprites/punch/06.png",
      "/assets/noobsaibot/sprites/punch/u05.png",
      "/assets/noobsaibot/sprites/punch/13.png"
    ],
    ATTACK_LK: [
      "/assets/noobsaibot/sprites/kick/06.png",
      "/assets/noobsaibot/sprites/kick/12.png"
    ],
    ATTACK_RK: [
      "/assets/noobsaibot/sprites/kick/06.png",
      "/assets/noobsaibot/sprites/kick/12.png",
      "/assets/noobsaibot/sprites/kick/12.png"
    ],
    CROUCH_ATTACK_P: "/assets/noobsaibot/sprites/punch/06.png",
    CROUCH_ATTACK_K: "/assets/noobsaibot/sprites/kick/12.png",
    JUMP_ATTACK_P: "/assets/noobsaibot/sprites/punch/u05.png",
    JUMP_ATTACK_K: "/assets/noobsaibot/sprites/kick/06.png",
    SPECIAL_1: "/assets/noobsaibot/sprites/special/103.png",
    SPECIAL_2: "/assets/noobsaibot/sprites/punch/u05.png",
    SPECIAL_3: [
      "/assets/noobsaibot/sprites/special/301.png",
      "/assets/noobsaibot/sprites/special/302.png",
      "/assets/noobsaibot/sprites/special/303.png"
    ],
    SPECIAL_4: [
      "/assets/noobsaibot/sprites/special/401.png",
      "/assets/noobsaibot/sprites/special/402.png",
      "/assets/noobsaibot/sprites/special/403.png"
    ],
    HIT_STUN: "/assets/noobsaibot/sprites/block/03.png",
    GRABBED: "/assets/noobsaibot/sprites/block/03.png",
    KNOCKDOWN: "/assets/noobsaibot/sprites/dizzy/01.png",
    BLOCK: "/assets/noobsaibot/sprites/block/03.png",
    DIZZY: "/assets/noobsaibot/sprites/dizzy/01.png",
    VICTORY: "/assets/noobsaibot/sprites/victory/106.png",
    DEFEAT: "/assets/noobsaibot/sprites/dizzy/01.png"
  }
} as const;

export const CHARACTER_DATA: Record<string, CharacterData> = {
  khayati: {
    id: 'khayati',
    name: 'Mustapha Khayati',
    archetype: 'Ungrateful Student',
    portrait: '/assets/mugshots/liukang.png',
    styles: ['POETRY', 'RIOTS'],
    stats: {
      speed: 1.2,
      power: 1.0,
      defense: 1.0
    },
    meterName: 'Class Consciousness',
    comboTitles: ['AGITATED', 'ORGANIZED', 'OCCUPIED', 'REVOLTED', 'TOTAL REV.'],
    moves: {
      ATTACK_LP: {
        name: 'Critique',
        damage: 4,
        meterGain: 5,
        startup: 4,
        active: 4,
        recovery: 6,
        hitStun: 10,
        rangeX: 70,
        rangeY: 40,
        type: 'high',
        knockback: 2
      },
      ATTACK_RP: {
        name: 'Antithesis',
        damage: 10,
        meterGain: 10,
        startup: 8,
        active: 6,
        recovery: 12,
        hitStun: 15,
        rangeX: 80,
        rangeY: 40,
        type: 'high',
        knockback: 5
      },
      ATTACK_LK: {
        name: 'Low Theory',
        damage: 6,
        meterGain: 8,
        startup: 6,
        active: 5,
        recovery: 10,
        hitStun: 12,
        rangeX: 75,
        rangeY: 30,
        type: 'low',
        knockback: 3
      },
      ATTACK_RK: {
        name: 'Radical Subjectivity',
        damage: 18,
        meterGain: 15,
        startup: 10,
        active: 8,
        recovery: 20,
        hitStun: 25,
        rangeX: 140,
        rangeY: 60,
        type: 'mid',
        knockback: 25
      },
      SPECIAL_1: {
        name: 'The Pamphlet',
        damage: 5,
        meterGain: 10,
        startup: 12,
        active: 20,
        recovery: 20,
        hitStun: 10,
        rangeX: 600,
        rangeY: 40,
        type: 'mid',
        knockback: 5,
        isProjectile: true
      },
      SPECIAL_2: {
        name: 'The Scandal',
        damage: 25,
        meterGain: 20,
        startup: 8,
        active: 5,
        recovery: 30,
        hitStun: 40,
        rangeX: 60,
        rangeY: 50,
        type: 'mid',
        knockback: 0,
        isGrab: true
      },
      SPECIAL_3: {
        name: 'Bicycle Barrage',
        damage: 22,
        meterGain: 18,
        startup: 12,
        active: 15,
        recovery: 25,
        hitStun: 35,
        rangeX: 120,
        rangeY: 60,
        type: 'high',
        knockback: 15
      },
      SPECIAL_4: {
        name: 'Flying Dragon',
        damage: 28,
        meterGain: 25,
        startup: 18,
        active: 20,
        recovery: 40,
        hitStun: 50,
        rangeX: 180,
        rangeY: 100,
        type: 'mid',
        knockback: 25
      },
      CROUCH_ATTACK_P: {
        name: 'Uppercut',
        damage: 14,
        meterGain: 12,
        startup: 8,
        active: 6,
        recovery: 18,
        hitStun: 22,
        rangeX: 70,
        rangeY: 120,
        type: 'high',
        knockback: 20
      },
      CROUCH_ATTACK_K: {
        name: 'Sweep',
        damage: 10,
        meterGain: 12,
        startup: 8,
        active: 8,
        recovery: 18,
        hitStun: 20,
        rangeX: 85,
        rangeY: 20,
        type: 'low',
        knockback: 0
      },
      JUMP_ATTACK_P: {
        name: 'Aerial Dialectic',
        damage: 8,
        meterGain: 10,
        startup: 4,
        active: 10,
        recovery: 10,
        hitStun: 15,
        rangeX: 70,
        rangeY: 80,
        type: 'mid',
        knockback: 8
      },
      JUMP_ATTACK_K: {
        name: 'Flying Kick',
        damage: 12,
        meterGain: 12,
        startup: 6,
        active: 12,
        recovery: 12,
        hitStun: 20,
        rangeX: 90,
        rangeY: 80,
        type: 'mid',
        knockback: 15
      }
    }
  },
  bureaucrat: {
    id: 'bureaucrat',
    name: 'Party Bureaucrat',
    archetype: 'Deadly Bore',
    portrait: '/assets/mugshots/stryker.png',
    styles: ['NEGOTIATION', 'RECUPERATION'],
    stats: {
      speed: 0.8,
      power: 1.4,
      defense: 1.2
    },
    meterName: 'Recuperation',
    comboTitles: ['FILED', 'AUDITED', 'APPROVED', 'STAMPED', 'LIQUIDATED'],
    moves: {
      ATTACK_LP: {
        name: 'Procedure',
        damage: 5,
        meterGain: 5,
        startup: 5,
        active: 4,
        recovery: 8,
        hitStun: 10,
        rangeX: 65,
        rangeY: 40,
        type: 'high',
        knockback: 2
      },
    ATTACK_RP: {
      name: 'Red Tape',
      damage: 12,
      meterGain: 12,
      startup: 10,
      active: 8,
      recovery: 15,
      hitStun: 18,
      rangeX: 75,
      rangeY: 40,
      type: 'high',
      knockback: 8
    },
      ATTACK_LK: {
        name: 'Policy Kick',
        damage: 7,
        meterGain: 8,
        startup: 7,
        active: 5,
        recovery: 12,
        hitStun: 12,
      rangeX: 70,
      rangeY: 30,
      type: 'low',
      knockback: 3
    },
    ATTACK_RK: {
      name: 'Crackdown Kick',
      damage: 16,
      meterGain: 14,
      startup: 11,
      active: 8,
      recovery: 18,
      hitStun: 22,
      rangeX: 110,
      rangeY: 50,
      type: 'mid',
      knockback: 14
    },
    SPECIAL_1: {
      name: 'Red Tape Shot',
      damage: 10,
      meterGain: 12,
      startup: 10,
      active: 14,
      recovery: 24,
      hitStun: 18,
      rangeX: 400,
      rangeY: 40,
      type: 'mid',
      knockback: 10,
      isProjectile: true
    },
    SPECIAL_2: {
      name: 'The Compromise',
      damage: 15,
      meterGain: 18,
      startup: 10,
      active: 10,
      recovery: 40,
      hitStun: 50,
      rangeX: 80,
      rangeY: 50,
      type: 'mid',
      knockback: 0,
      isGrab: true
    },
    SPECIAL_3: {
      name: 'Baton Rush',
      damage: 20,
      meterGain: 16,
      startup: 10,
        active: 12,
        recovery: 22,
        hitStun: 32,
        rangeX: 110,
        rangeY: 55,
        type: 'mid',
        knockback: 12
      },
      SPECIAL_4: {
        name: 'Arrest Tackle',
        damage: 26,
        meterGain: 22,
        startup: 16,
        active: 18,
        recovery: 35,
        hitStun: 45,
        rangeX: 160,
        rangeY: 70,
        type: 'mid',
        knockback: 20,
        isGrab: true
      },
      CROUCH_ATTACK_P: {
        name: 'Low Jab',
        damage: 5,
        meterGain: 5,
        startup: 5,
        active: 4,
        recovery: 8,
        hitStun: 8,
        rangeX: 55,
        rangeY: 30,
        type: 'low',
        knockback: 1
      },
      CROUCH_ATTACK_K: {
        name: 'Sweep',
        damage: 12,
        meterGain: 12,
        startup: 10,
        active: 8,
        recovery: 20,
        hitStun: 25,
        rangeX: 90,
        rangeY: 20,
        type: 'low',
        knockback: 0
      },
      JUMP_ATTACK_P: {
        name: 'Aerial Strike',
        damage: 9,
        meterGain: 10,
        startup: 5,
        active: 10,
        recovery: 10,
        hitStun: 15,
        rangeX: 65,
        rangeY: 80,
        type: 'mid',
        knockback: 10
      },
      JUMP_ATTACK_K: {
        name: 'Flying Stomp',
        damage: 14,
        meterGain: 12,
        startup: 7,
        active: 12,
        recovery: 15,
        hitStun: 22,
        rangeX: 85,
        rangeY: 80,
        type: 'mid',
        knockback: 18
      }
    }
  },
  professor: {
    id: 'professor',
    name: 'Sociology Professor',
    archetype: 'Thought Police',
    portrait: '/assets/mugshots/shangtsung.png',
    styles: ['LECTURE', 'GRADING'],
    stats: {
      speed: 1.0,
      power: 0.9,
      defense: 0.8
    },
    meterName: 'Tenure',
    comboTitles: ['CITED', 'REVIEWED', 'PEER REVIEWED', 'PUBLISHED', 'TENURED!'],
    moves: {
      ATTACK_LP: {
        name: 'Questionnaire',
        damage: 5,
        meterGain: 10,
        startup: 15,
        active: 5,
        recovery: 25,
        hitStun: 15,
        rangeX: 800,
        rangeY: 20,
        type: 'high',
        knockback: 5,
        isProjectile: true
      },
      ATTACK_RP: {
        name: 'Peer Review',
        damage: 10,
        meterGain: 10,
        startup: 8,
        active: 6,
        recovery: 12,
        hitStun: 15,
        rangeX: 80,
        rangeY: 40,
        type: 'mid',
        knockback: 6
      },
      ATTACK_LK: {
        name: 'Syllabus Sweep',
        damage: 6,
        meterGain: 8,
        startup: 6,
        active: 5,
        recovery: 10,
        hitStun: 12,
        rangeX: 75,
        rangeY: 30,
        type: 'low',
        knockback: 3
      },
      ATTACK_RK: {
        name: 'Faculty Meeting',
        damage: 14,
        meterGain: 15,
        startup: 12,
        active: 8,
        recovery: 18,
        hitStun: 20,
        rangeX: 90,
        rangeY: 60,
        type: 'mid',
        knockback: 12
      },
      SPECIAL_1: {
        name: 'Bell Curve',
        damage: 15,
        meterGain: 15,
        startup: 20,
        active: 10,
        recovery: 30,
        hitStun: 25,
        rangeX: 800,
        rangeY: 100,
        type: 'high',
        knockback: 20,
        isProjectile: true
      },
      SPECIAL_2: {
        name: 'Sabbatical',
        damage: 0,
        meterGain: 5,
        startup: 5,
        active: 20,
        recovery: 5,
        hitStun: 0,
        rangeX: 0,
        rangeY: 0,
        type: 'mid',
        knockback: 0
      },
      SPECIAL_3: {
        name: 'Citation Storm',
        damage: 18,
        meterGain: 15,
        startup: 14,
        active: 16,
        recovery: 28,
        hitStun: 38,
        rangeX: 140,
        rangeY: 75,
        type: 'mid',
        knockback: 14,
        isProjectile: true
      },
      SPECIAL_4: {
        name: 'Tenure Track',
        damage: 24,
        meterGain: 20,
        startup: 20,
        active: 22,
        recovery: 42,
        hitStun: 48,
        rangeX: 100,
        rangeY: 60,
        type: 'high',
        knockback: 18
      },
      CROUCH_ATTACK_P: {
        name: 'Footnote',
        damage: 4,
        meterGain: 5,
        startup: 4,
        active: 4,
        recovery: 6,
        hitStun: 10,
        rangeX: 60,
        rangeY: 30,
        type: 'low',
        knockback: 1
      },
      CROUCH_ATTACK_K: {
        name: 'Fieldwork Trip',
        damage: 10,
        meterGain: 12,
        startup: 8,
        active: 8,
        recovery: 18,
        hitStun: 20,
        rangeX: 85,
        rangeY: 20,
        type: 'low',
        knockback: 0
      },
      JUMP_ATTACK_P: {
        name: 'Conference Paper',
        damage: 8,
        meterGain: 10,
        startup: 4,
        active: 10,
        recovery: 10,
        hitStun: 15,
        rangeX: 70,
        rangeY: 80,
        type: 'mid',
        knockback: 8
      },
      JUMP_ATTACK_K: {
        name: 'Academic Kick',
        damage: 12,
        meterGain: 12,
        startup: 6,
        active: 12,
        recovery: 12,
        hitStun: 20,
        rangeX: 90,
        rangeY: 80,
        type: 'mid',
        knockback: 15
      }
    }
  },
  maoist: {
    id: 'maoist',
    name: 'Maoist Student',
    archetype: 'Little Red Parrot',
    portrait: '/assets/mugshots/kunglao.png',
    styles: ['THEORY', 'PRAXIS'],
    stats: {
      speed: 1.3,
      power: 0.5,
      defense: 0.8
    },
    meterName: 'Dogma',
    comboTitles: ['STRUGGLED', 'CRITICIZED', 'SELF-CRITICIZED', 'PURGED', 'REV. GUARDED'],
    moves: {
      ATTACK_LP: {
        name: 'Little Red Jab',
        damage: 4,
        meterGain: 5,
        startup: 4,
        active: 4,
        recovery: 6,
        hitStun: 8,
        rangeX: 70,
        rangeY: 40,
        type: 'high',
        knockback: 2
      },
      ATTACK_RP: {
        name: 'Blind Dogma',
        damage: 20,
        meterGain: 10,
        startup: 20,
        active: 10,
        recovery: 40,
        hitStun: 10,
        rangeX: 60,
        rangeY: 20,
        type: 'mid',
        knockback: 5,
        selfDamage: 10
      },
      ATTACK_LK: {
        name: 'Struggle Session',
        damage: 6,
        meterGain: 8,
        startup: 6,
        active: 5,
        recovery: 10,
        hitStun: 12,
        rangeX: 75,
        rangeY: 30,
        type: 'low',
        knockback: 3
      },
      ATTACK_RK: {
        name: 'Rectification Kick',
        damage: 14,
        meterGain: 12,
        startup: 10,
        active: 30,
        recovery: 20,
        hitStun: 20,
        rangeX: 140,
        rangeY: 60,
        type: 'mid',
        knockback: 20
      },
      SPECIAL_1: {
        name: 'Red Book Throw',
        damage: 8,
        meterGain: 12,
        startup: 15,
        active: 20,
        recovery: 25,
        hitStun: 12,
        rangeX: 500,
        rangeY: 40,
        type: 'mid',
        knockback: 8,
        isProjectile: true
      },
      SPECIAL_2: {
        name: 'Revolutionary Hat Toss',
        damage: 12,
        meterGain: 15,
        startup: 12,
        active: 30,
        recovery: 22,
        hitStun: 18,
        rangeX: 400,
        rangeY: 50,
        type: 'high',
        knockback: 10,
        isProjectile: true
      },
      SPECIAL_3: {
        name: 'Great Leap',
        damage: 25,
        meterGain: 20,
        startup: 15,
        active: 20,
        recovery: 60,
        hitStun: 40,
        rangeX: 150,
        rangeY: 80,
        type: 'high',
        knockback: 20,
        selfDamage: 5
      },
      SPECIAL_4: {
        name: 'Self Crit',
        damage: 15,
        meterGain: 15,
        startup: 10,
        active: 20,
        recovery: 30,
        hitStun: 30,
        rangeX: 80,
        rangeY: 20,
        type: 'low',
        knockback: 10,
        selfDamage: 5
      },
      CROUCH_ATTACK_P: {
        name: 'Pocket Dialectics',
        damage: 4,
        meterGain: 4,
        startup: 4,
        active: 4,
        recovery: 6,
        hitStun: 8,
        rangeX: 60,
        rangeY: 30,
        type: 'low',
        knockback: 1
      },
      CROUCH_ATTACK_K: {
        name: 'Sweep the Revisionists',
        damage: 10,
        meterGain: 10,
        startup: 8,
        active: 8,
        recovery: 18,
        hitStun: 20,
        rangeX: 85,
        rangeY: 20,
        type: 'low',
        knockback: 0
      },
      JUMP_ATTACK_P: {
        name: 'Wall Poster',
        damage: 8,
        meterGain: 8,
        startup: 4,
        active: 10,
        recovery: 10,
        hitStun: 15,
        rangeX: 70,
        rangeY: 80,
        type: 'mid',
        knockback: 8
      },
      JUMP_ATTACK_K: {
        name: 'Flying Hat Kick',
        damage: 12,
        meterGain: 12,
        startup: 6,
        active: 12,
        recovery: 12,
        hitStun: 20,
        rangeX: 90,
        rangeY: 80,
        type: 'mid',
        knockback: 15
      }
    }
  },
  debord: {
    id: 'debord',
    name: 'Guy Debord',
    archetype: 'The Master',
    portrait: '/assets/mugshots/noobsaibot.png',
    styles: ['SPECTACLE', 'TRUTH'],
    stats: {
      speed: 1.5,
      power: 1.5,
      defense: 1.5
    },
    meterName: 'Negation',
    comboTitles: ['MEDIATED', 'ILLUSIONED', 'SPECTACLED', 'BORED', 'SILENCED'],
    moves: {
      ATTACK_LP: {
        name: 'Negation Jab',
        damage: 6,
        meterGain: 6,
        startup: 4,
        active: 4,
        recovery: 6,
        hitStun: 12,
        rangeX: 80,
        rangeY: 40,
        type: 'high',
        knockback: 3
      },
      ATTACK_RP: {
        name: 'Detournement',
        damage: 25,
        meterGain: 20,
        startup: 12,
        active: 10,
        recovery: 20,
        hitStun: 25,
        rangeX: 100,
        rangeY: 40,
        type: 'mid',
        knockback: 20
      },
      ATTACK_LK: {
        name: 'Image Trip',
        damage: 8,
        meterGain: 8,
        startup: 6,
        active: 5,
        recovery: 10,
        hitStun: 12,
        rangeX: 75,
        rangeY: 30,
        type: 'low',
        knockback: 3
      },
      ATTACK_RK: {
        name: 'Spectacle Kick',
        damage: 18,
        meterGain: 15,
        startup: 10,
        active: 30,
        recovery: 20,
        hitStun: 25,
        rangeX: 140,
        rangeY: 60,
        type: 'mid',
        knockback: 25
      },
      SPECIAL_1: {
        name: 'Projected Image',
        damage: 15,
        meterGain: 15,
        startup: 12,
        active: 20,
        recovery: 20,
        hitStun: 18,
        rangeX: 600,
        rangeY: 40,
        type: 'mid',
        knockback: 8,
        isProjectile: true
      },
      SPECIAL_2: {
        name: 'Invisible Hand',
        damage: 20,
        meterGain: 15,
        startup: 10,
        active: 5,
        recovery: 30,
        hitStun: 30,
        rangeX: 60,
        rangeY: 50,
        type: 'mid',
        knockback: 10,
        isGrab: true
      },
      SPECIAL_3: {
        name: 'Society of Shadows',
        damage: 16,
        meterGain: 14,
        startup: 12,
        active: 14,
        recovery: 26,
        hitStun: 34,
        rangeX: 130,
        rangeY: 65,
        type: 'low',
        knockback: 12
      },
      SPECIAL_4: {
        name: 'Total Negation',
        damage: 30,
        meterGain: 28,
        startup: 22,
        active: 25,
        recovery: 50,
        hitStun: 55,
        rangeX: 90,
        rangeY: 50,
        type: 'mid',
        knockback: 22,
        isGrab: true
      },
      CROUCH_ATTACK_P: {
        name: 'Underground Hit',
        damage: 6,
        meterGain: 6,
        startup: 4,
        active: 4,
        recovery: 6,
        hitStun: 10,
        rangeX: 60,
        rangeY: 30,
        type: 'low',
        knockback: 2
      },
      CROUCH_ATTACK_K: {
        name: 'Sweep the Spectacle',
        damage: 12,
        meterGain: 12,
        startup: 8,
        active: 8,
        recovery: 18,
        hitStun: 20,
        rangeX: 85,
        rangeY: 20,
        type: 'low',
        knockback: 0
      },
      JUMP_ATTACK_P: {
        name: 'Aerial Negation',
        damage: 10,
        meterGain: 10,
        startup: 4,
        active: 10,
        recovery: 10,
        hitStun: 15,
        rangeX: 70,
        rangeY: 80,
        type: 'mid',
        knockback: 10
      },
      JUMP_ATTACK_K: {
        name: 'Shadow Kick',
        damage: 14,
        meterGain: 12,
        startup: 6,
        active: 12,
        recovery: 12,
        hitStun: 20,
        rangeX: 90,
        rangeY: 80,
        type: 'mid',
        knockback: 18
      }
    }
  }
};

export const STAGES = {
  scorpionsLair: "/assets/arenas/scorpionslair/p_bg.png",
  jadesDesert: "/assets/arenas/jadesdesert/p_bg.png",
  scislacBusorez: "/assets/arenas/scislacbusorez/p_bg.png",
  waterfront: "/assets/arenas/waterfront/p_5.png",
  rooftop: "/assets/arenas/rooftop/parallax.png",
  subway: "/assets/arenas/subway/parallax.png",
  balcony: "/assets/arenas/thebalcony/03.png"
} as const;

export const MAX_HP = 100;
export const MAX_METER = 100;
export const GRAVITY = 0.8;
export const JUMP_FORCE = 32;
export const MOVE_SPEED = 6;
export const STAGE_WIDTH = 2400; // Much wider arena
export const STAGE_LEFT_BOUND = 100;
export const STAGE_RIGHT_BOUND = 2300;
