
import React, { useEffect, useState } from 'react';
import { ActionState } from '../types';

interface CharacterModelProps {
  colors: {
    skin: string;
    torso: string;
    legs: string;
    detail: string;
  };
  characterId?: string;
  textureType?: 'leather' | 'suit' | 'tweed' | 'military' | 'wine';
  action: ActionState;
  direction?: 1 | -1;
  frame?: number;
  isSpeaking?: boolean;
  isSoldOut?: boolean;
  isWireframe?: boolean;
}

export const CharacterModel: React.FC<CharacterModelProps> = ({ 
    colors, 
    characterId = 'khayati',
    textureType = 'leather',
    action, 
    direction = 1, 
    frame = 0,
    isSpeaking = false,
    isSoldOut = false,
    isWireframe = false
}) => {
  
  const t = Date.now() / 1000;
  const [mouthOpen, setMouthOpen] = useState(0);

  useEffect(() => {
      if (!isSpeaking) {
          setMouthOpen(0);
          return;
      }
      const interval = setInterval(() => {
          setMouthOpen(Math.random() > 0.5 ? 4 : 1); 
      }, 100);
      return () => clearInterval(interval);
  }, [isSpeaking]);
  
  // ---------------------------------------------------------------------------
  // ANIMATION STATE MACHINE
  // ---------------------------------------------------------------------------
  // Default Idle Pose (MK Stance)
  let torsoRot = 0;
  let headRot = 0;
  let armL_Rot = 35;  // Back Arm
  let armR_Rot = -35; // Front Arm
  let forearmL_Rot = 85;
  let forearmR_Rot = 85;
  let legL_Rot = 10;   // Back Leg
  let legR_Rot = -10;  // Front Leg
  let shinL_Rot = 10;
  let shinR_Rot = 10;
  let yOffset = 0;
  let fullRot = 0;
  let opacity = 1;

  switch (action) {
      case ActionState.IDLE:
          // Classic MK Vertical Breathe
          yOffset = Math.sin(t * 5) * 3; 
          torsoRot = Math.sin(t * 2.5) * 2;
          headRot = -torsoRot; // Compensate to look forward
          
          armR_Rot = -45 + Math.cos(t * 5) * 5;
          forearmR_Rot = 100 + Math.sin(t * 5) * 5; 
          
          armL_Rot = 45 - Math.cos(t * 5) * 5;
          forearmL_Rot = 100 + Math.sin(t * 5) * 5;

          legR_Rot = -15; shinR_Rot = 25;
          legL_Rot = 15; shinL_Rot = 25;
          
          if (characterId === 'debord') {
               // Arm crossed / Chin stroke
               armR_Rot = -110; forearmR_Rot = -20; 
               armL_Rot = 20; forearmL_Rot = 10;
          }
          if (characterId === 'bureaucrat') {
               // Wide stance
               legL_Rot = 25; legR_Rot = -25;
               armL_Rot = 25; armR_Rot = -25;
               forearmL_Rot = 10; forearmR_Rot = 10; 
          }
          break;
      case ActionState.WALK_FORWARD:
          const walkCycle = t * 12;
          yOffset = Math.abs(Math.sin(walkCycle)) * 5;
          legL_Rot = Math.sin(walkCycle) * 35;
          shinL_Rot = Math.max(0, Math.cos(walkCycle) * 50);
          legR_Rot = Math.sin(walkCycle + Math.PI) * 35;
          shinR_Rot = Math.max(0, Math.cos(walkCycle + Math.PI) * 50);
          armR_Rot = Math.cos(walkCycle) * 25 - 20;
          armL_Rot = Math.cos(walkCycle + Math.PI) * 25 + 20;
          forearmR_Rot = 45; forearmL_Rot = 45;
          break;
      case ActionState.WALK_BACKWARD:
          const walkBack = t * 10;
          legL_Rot = Math.sin(walkBack) * -30;
          shinL_Rot = Math.max(0, Math.cos(walkBack) * 40);
          legR_Rot = Math.sin(walkBack + Math.PI) * -30;
          shinR_Rot = Math.max(0, Math.cos(walkBack + Math.PI) * 40);
          break;
      case ActionState.ATTACK_LP: 
          torsoRot = 25;
          armR_Rot = -90; forearmR_Rot = 0; // Jab
          armL_Rot = 45;
          break;
      case ActionState.ATTACK_RP: 
          torsoRot = -45;
          armR_Rot = 45; forearmR_Rot = -120; // Hook windup
          if (frame > 2) { armR_Rot = -45; forearmR_Rot = -45; } // Swing
          break;
      case ActionState.ATTACK_RK: 
          torsoRot = -20;
          legR_Rot = -100; shinR_Rot = 10; // High Kick
          if (characterId === 'khayati') {
              yOffset = -30;
              const spin = (frame * 60) % 360;
              torsoRot = -45 + spin;
              legL_Rot = 90; shinL_Rot = 90;
              legR_Rot = -90; shinR_Rot = 90;
          }
          break;
      case ActionState.SPECIAL_1: // Projectile
          torsoRot = 45;
          armR_Rot = -45; forearmR_Rot = -10; // Thrust
          legR_Rot = 40; legL_Rot = -20;
          break;
      case ActionState.HIT_STUN:
          torsoRot = -30; headRot = -45;
          armR_Rot = -60; armL_Rot = -60;
          yOffset = 10;
          break;
      case ActionState.DIZZY:
          torsoRot = Math.sin(t * 8) * 20;
          headRot = Math.cos(t * 6) * 30;
          armR_Rot = -20 + Math.sin(t * 8) * 30;
          armL_Rot = 20 + Math.cos(t * 8) * 30;
          yOffset = 5;
          break;
      case ActionState.KNOCKDOWN:
          fullRot = -90; yOffset = 120;
          legL_Rot = 10; legR_Rot = -10;
          break;
      case ActionState.VICTORY:
          torsoRot = -10;
          if (characterId === 'khayati') { armR_Rot = -130; forearmR_Rot = -120; }
          else { armR_Rot = -160; forearmR_Rot = -20; armL_Rot = 160; forearmL_Rot = -20; }
          break;
      case ActionState.DEFEAT_FATAL:
          yOffset = 0;
          torsoRot = Math.sin(t * 40) * 5; // Trembling
          armR_Rot = -140; armL_Rot = -140;
          break;
  }

  const activeColors = isSoldOut ? { skin: colors.skin, torso: '#555', legs: '#333', detail: '#000' } : colors;

  // ---------------------------------------------------------------------------
  // "DIGITIZED ACTOR" SHADER
  // ---------------------------------------------------------------------------
  // Simulates the grainy, low-res captured video look of MK1/2 sprites
  // Uses noise + directional lighting + color banding
  
  const getTexture = (color: string, type: 'skin' | 'cloth' | 'leather') => {
      const noise = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E")`;
      
      let gradient = '';
      if (type === 'skin') {
          gradient = `linear-gradient(90deg, rgba(0,0,0,0.6) 0%, ${color} 20%, #ffe0d0 50%, ${color} 80%, rgba(0,0,0,0.7) 100%)`;
      } else if (type === 'leather') {
          gradient = `linear-gradient(90deg, #000 0%, ${color} 30%, #555 45%, ${color} 60%, #000 100%)`;
      } else {
          gradient = `linear-gradient(90deg, rgba(0,0,0,0.8) 0%, ${color} 15%, ${color} 85%, rgba(0,0,0,0.9) 100%)`;
      }

      return {
          backgroundImage: `${gradient}, ${noise}`,
          backgroundBlendMode: 'overlay',
          backgroundSize: '100% 100%, 100px 100px',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
      };
  };

  const wireframeClass = isWireframe ? "wireframe-mode" : "";

  // ---------------------------------------------------------------------------
  // ANATOMY HELPERS
  // ---------------------------------------------------------------------------
  
  const Limb = ({ w, h, x, y, rot, color, children, z = 0, type = 'cloth', shape = 'rect' }: any) => {
      let clip = 'none';
      // Muscle/Clothing Shapes
      if (shape === 'deltoid') clip = 'polygon(10% 0, 90% 0, 100% 60%, 85% 100%, 15% 100%, 0 60%)';
      if (shape === 'bicep') clip = 'polygon(15% 0, 85% 0, 100% 40%, 90% 100%, 10% 100%, 0 40%)';
      if (shape === 'forearm') clip = 'polygon(10% 0, 90% 0, 100% 30%, 85% 100%, 15% 100%, 0 30%)';
      if (shape === 'thigh') clip = 'polygon(10% 0, 90% 0, 100% 40%, 85% 100%, 15% 100%, 0 40%)'; // Bulging quad
      if (shape === 'calf') clip = 'polygon(20% 0, 80% 0, 100% 30%, 90% 90%, 60% 100%, 40% 100%, 10% 90%, 0 30%)'; // Calf muscle + ankle taper
      if (shape === 'foot') clip = 'polygon(20% 0, 80% 0, 100% 100%, 0 100%)';

      return (
        <div 
            className={`absolute origin-top ${wireframeClass}`}
            style={{
                width: w, height: h, left: x, top: y,
                transform: `rotate(${rot}deg)`,
                zIndex: z,
                clipPath: clip,
                background: isWireframe ? 'transparent' : color, // Fallback
                ...(!isWireframe ? getTexture(color, type) : {}),
                border: isWireframe ? '1px solid #0f0' : 'none',
            }}
        >
            {children}
        </div>
      );
  };

  // ---------------------------------------------------------------------------
  // FACE GENERATOR
  // ---------------------------------------------------------------------------
  const Face = () => (
      <div className="absolute top-0 left-0 w-full h-full">
          {/* Eye Sockets - Deep shadows */}
          <div className="absolute top-9 left-2 w-6 h-4 bg-black/40 blur-[2px] rounded-full"></div>
          <div className="absolute top-9 right-2 w-6 h-4 bg-black/40 blur-[2px] rounded-full"></div>
          
          {/* Eyes - White + Pupil */}
          <div className="absolute top-10 left-3 w-4 h-2 bg-white flex items-center justify-center opacity-90"><div className="w-1 h-1 bg-black rounded-full"></div></div>
          <div className="absolute top-10 right-3 w-4 h-2 bg-white flex items-center justify-center opacity-90"><div className="w-1 h-1 bg-black rounded-full"></div></div>

          {/* Nose - Shadow gradient */}
          <div className="absolute top-9 left-1/2 -translate-x-1/2 w-4 h-10 bg-gradient-to-b from-transparent via-black/10 to-black/30" style={{ clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' }}></div>

          {/* Mouth */}
          <div className="absolute top-22 left-1/2 -translate-x-1/2 w-10 h-3 bg-[#311] opacity-80" 
               style={{ clipPath: 'polygon(0 50%, 50% 0, 100% 50%, 50% 100%)', transform: `scaleY(${Math.max(1, mouthOpen)})` }}></div>

          {/* Brows */}
          <div className="absolute top-8 left-2 w-8 h-2 bg-[#111] rotate-12 blur-[1px]"></div>
          <div className="absolute top-8 right-2 w-8 h-2 bg-[#111] -rotate-12 blur-[1px]"></div>

          {/* Character Specifics */}
          {characterId === 'khayati' && <div className="absolute top-6 left-0 w-2 h-8 bg-[#111] blur-[1px]"></div>} {/* Sideburns */}
          {characterId === 'bureaucrat' && <div className="absolute top-0 w-full h-4 bg-[#322] opacity-30"></div>} {/* Receding Hair */}
          {characterId === 'professor' && (
              <>
                <div className="absolute bottom-0 w-full h-10 bg-gray-400/90" style={{ clipPath: 'polygon(0 0, 100% 0, 80% 100%, 20% 100%)' }}></div> {/* Beard */}
                <div className="absolute top-9 left-1 w-full h-4 border-2 border-black/50 rounded-sm"></div> {/* Glasses frame */}
              </>
          )}
          {characterId === 'debord' && <div className="absolute top-9 left-1 w-full h-6 bg-black/80 rounded-sm"></div>} {/* Sunglasses */}
      </div>
  );

  // ---------------------------------------------------------------------------
  // MODEL COMPOSITION
  // ---------------------------------------------------------------------------
  // Heroic Proportions: Height ~320px. Head ~35px.
  // Center X = 80px (container is 160px wide)
  
  const torsoW = characterId === 'bureaucrat' ? 90 : 75; // Broad shoulders
  const torsoH = 110;
  const torsoX = 80 - (torsoW / 2);
  const torsoY = 40; // Neck starts here
  
  const shoulderY = 10;
  const hipY = 95;

  return (
    <div 
        className="relative w-40 h-96 select-none pointer-events-none transition-opacity preserve-3d"
        style={{ 
            transform: `scaleX(${direction}) translateY(${yOffset}px) rotate(${fullRot}deg)`, 
            opacity: opacity, 
            filter: 'contrast(1.1) brightness(0.9) sepia(0.2)' // Global grit filter
        }}
    >
        {/* Ground Shadow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-8 bg-black/50 blur-lg rounded-[100%] transform scale-y-50" />

        {/* --- BACK LAYER --- */}
        {/* Back Leg */}
        <div className="absolute z-0" style={{ left: 80, top: torsoY + hipY }}>
             <Limb w={45} h={80} x={-10} y={0} rot={legL_Rot} color={activeColors.legs} shape="thigh">
                 <Limb w={40} h={90} x={2} y={70} rot={shinL_Rot} color={activeColors.legs} shape="calf">
                     <Limb w={45} h={25} x={-2} y={85} rot={0} color="#111" shape="foot" type="leather" />
                 </Limb>
             </Limb>
        </div>

        {/* Back Arm */}
        <div className="absolute z-0" style={{ left: 80 + 30, top: torsoY + shoulderY }}>
             <Limb w={40} h={70} x={0} y={0} rot={armL_Rot} color={activeColors.torso} shape="deltoid">
                 <Limb w={35} h={70} x={2} y={60} rot={forearmL_Rot} color={activeColors.skin} shape="forearm" type="skin">
                     <div className="absolute bottom-0 left-0 w-10 h-10 bg-[#422] rounded-full border border-black/30"></div> {/* Fist */}
                 </Limb>
             </Limb>
        </div>

        {/* --- TORSO LAYER --- */}
        <div className={`absolute z-10 origin-bottom ${wireframeClass}`}
             style={{
                 left: torsoX, top: torsoY, width: torsoW, height: torsoH,
                 transform: `rotate(${torsoRot}deg)`,
                 background: isWireframe ? 'transparent' : 'transparent' // Container
             }}>
             
             {/* Chest / Jacket */}
             <div className="absolute top-0 w-full h-full" 
                  style={{ 
                      ...getTexture(activeColors.torso, characterId === 'khayati' ? 'leather' : 'cloth'),
                      clipPath: 'polygon(0 0, 100% 0, 85% 100%, 15% 100%)' // V-Taper
                  }}>
                  {/* Pecs / Abs definition via shadow */}
                  <div className="absolute top-20 left-1/2 -translate-x-1/2 w-2 h-40 bg-black/20 blur-sm"></div>
                  {characterId === 'khayati' && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-full bg-white clip-path-polygon(20% 0, 80% 0, 50% 100%) opacity-90"></div>} {/* T-shirt */}
                  {characterId === 'bureaucrat' && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-full bg-red-900 shadow-md"></div>} {/* Tie */}
             </div>

             {/* HEAD */}
             <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-20 h-24 origin-bottom" style={{ transform: `rotate(${headRot}deg)` }}>
                 <div className="w-full h-full bg-[#dcb] rounded-xl relative overflow-hidden" style={getTexture(activeColors.skin, 'skin')}>
                     {/* Hair Cap */}
                     <div className="absolute top-0 w-full h-6 bg-[#111]"></div>
                     <Face />
                 </div>
             </div>
        </div>

        {/* Jacket Flaps / Tabards (Hang lower than torso) */}
        <div className="absolute z-10" style={{ left: torsoX, top: torsoY + torsoH - 10, width: torsoW }}>
             {/* Left Flap */}
             <div className="absolute left-0 w-[45%] h-40 bg-black origin-top transition-transform duration-300"
                  style={{ 
                      ...getTexture(activeColors.torso, 'cloth'),
                      transform: `rotate(${legR_Rot * 0.5}deg) skewX(${legR_Rot}deg)` 
                  }}></div>
             {/* Right Flap */}
             <div className="absolute right-0 w-[45%] h-40 bg-black origin-top transition-transform duration-300"
                  style={{ 
                      ...getTexture(activeColors.torso, 'cloth'),
                      transform: `rotate(${legL_Rot * 0.5}deg) skewX(${legL_Rot}deg)` 
                  }}></div>
        </div>

        {/* --- FRONT LAYER --- */}
        {/* Front Leg */}
        <div className="absolute z-20" style={{ left: 80 - 10, top: torsoY + hipY }}>
             <Limb w={45} h={80} x={-30} y={0} rot={legR_Rot} color={activeColors.legs} shape="thigh">
                 <Limb w={40} h={90} x={2} y={70} rot={shinR_Rot} color={activeColors.legs} shape="calf">
                     <div className="absolute bottom-0 w-full h-32 bg-[#111] opacity-30 mix-blend-multiply"></div> {/* Shin guard shadow */}
                     <Limb w={45} h={25} x={-2} y={85} rot={0} color="#111" shape="foot" type="leather" />
                 </Limb>
             </Limb>
        </div>

        {/* Front Arm */}
        <div className="absolute z-30" style={{ left: 80 - 30, top: torsoY + shoulderY }}>
             <Limb w={40} h={70} x={-10} y={0} rot={armR_Rot} color={activeColors.torso} shape="deltoid">
                 <Limb w={35} h={70} x={2} y={60} rot={forearmR_Rot} color={activeColors.skin} shape="forearm" type="skin">
                     <div className="absolute bottom-0 left-0 w-10 h-10 bg-[#422] rounded-full border border-black/30 shadow-lg"></div> {/* Fist */}
                     
                     {/* Props */}
                     {characterId === 'khayati' && action === ActionState.SPECIAL_1 && (
                         <div className="absolute -top-10 -right-10 w-24 h-32 bg-white border border-black rotate-12 flex items-center justify-center shadow-xl animate-pulse">
                             <div className="text-[8px] text-center font-serif leading-tight">THE<br/>SOCIETY<br/>OF THE<br/>SPECTACLE</div>
                         </div>
                     )}
                 </Limb>
             </Limb>
        </div>

        {/* VFX */}
        {action === ActionState.DIZZY && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 flex justify-center gap-2">
                 {[...Array(3)].map((_,i) => <div key={i} className="text-yellow-500 text-4xl font-bold animate-bounce drop-shadow-[0_2px_0_#000]">?</div>)}
            </div>
        )}

    </div>
  );
};