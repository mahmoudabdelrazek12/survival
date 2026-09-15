import React, { useRef, useState, useCallback, useEffect } from 'react';
import { GameEngine } from '../game/core/GameEngine';
import { Language } from '../game/data/translations';

interface VirtualJoystickProps {
  engine: GameEngine;
  size?: number; // Outer base size (default 140px)
  lang?: Language;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ engine, size = 140, lang = 'ar' }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  const activeTouchIdRef = useRef<number | null>(null);

  const maxRadius = (size / 2) - 16;

  const updateJoystick = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const distance = Math.hypot(deltaX, deltaY);
    const angle = Math.atan2(deltaY, deltaX);

    // Clamp distance to maxRadius
    const clampedDistance = Math.min(distance, maxRadius);
    const clampedX = Math.cos(angle) * clampedDistance;
    const clampedY = Math.sin(angle) * clampedDistance;

    setKnobPos({ x: clampedX, y: clampedY });

    // Normalized outputs: -1 to +1
    const dx = clampedX / maxRadius;
    const dy = clampedY / maxRadius;
    const intensity = clampedDistance / maxRadius;

    engine.input.joystick.active = true;
    engine.input.joystick.x = clampedX;
    engine.input.joystick.y = clampedY;
    engine.input.joystick.dx = dx;
    engine.input.joystick.dy = dy;
    engine.input.joystick.angle = angle;
    engine.input.joystick.intensity = intensity;
  }, [engine, maxRadius]);

  const resetJoystick = useCallback(() => {
    setIsActive(false);
    setKnobPos({ x: 0, y: 0 });
    activeTouchIdRef.current = null;

    engine.input.joystick.active = false;
    engine.input.joystick.x = 0;
    engine.input.joystick.y = 0;
    engine.input.joystick.dx = 0;
    engine.input.joystick.dy = 0;
    engine.input.joystick.intensity = 0;
  }, [engine]);

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (activeTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    activeTouchIdRef.current = touch.identifier;
    setIsActive(true);
    updateJoystick(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (activeTouchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === activeTouchIdRef.current) {
        updateJoystick(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (activeTouchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === activeTouchIdRef.current) {
        resetJoystick();
        break;
      }
    }
  };

  // Mouse fallback for testing on PC browser
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsActive(true);
    updateJoystick(e.clientX, e.clientY);

    const onMouseMove = (moveEvent: MouseEvent) => {
      updateJoystick(moveEvent.clientX, moveEvent.clientY);
    };

    const onMouseUp = () => {
      resetJoystick();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  useEffect(() => {
    return () => {
      resetJoystick();
    };
  }, [resetJoystick]);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleMouseDown}
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`relative rounded-full border-2 shadow-[0_12px_36px_rgba(0,0,0,0.85)] backdrop-blur-md flex items-center justify-center touch-none select-none pointer-events-auto transition-colors ${
        isActive 
          ? 'bg-zinc-950/95 border-amber-500/80 shadow-[0_0_30px_rgba(245,158,11,0.3)]' 
          : 'bg-zinc-950/85 border-zinc-700/80 hover:border-zinc-500'
      }`}
    >
      {/* Outer Glow & Target Rings */}
      <div className="absolute inset-2 rounded-full border border-amber-500/20 pointer-events-none" />
      <div className="absolute inset-6 rounded-full border border-zinc-700/40 pointer-events-none" />
      
      {/* Axis Crosshair guides */}
      <div className="absolute w-full h-[1px] bg-zinc-700/40 pointer-events-none" />
      <div className="absolute h-full w-[1px] bg-zinc-700/40 pointer-events-none" />

      {/* Direction Guide Indicators */}
      <span className="absolute top-1.5 text-[9px] font-black font-mono text-zinc-400 pointer-events-none tracking-tighter">
        ▲ {lang === 'ar' ? 'أمام' : 'FWD'}
      </span>
      <span className="absolute bottom-1.5 text-[9px] font-black font-mono text-zinc-400 pointer-events-none tracking-tighter">
        ▼ {lang === 'ar' ? 'رجوع' : 'REV'}
      </span>
      <span className="absolute left-2 text-[10px] font-black font-mono text-zinc-400 pointer-events-none">
        ◄
      </span>
      <span className="absolute right-2 text-[10px] font-black font-mono text-zinc-400 pointer-events-none">
        ►
      </span>

      {/* Interactive Thumbstick Knob */}
      <div
        style={{
          transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          transition: isActive ? 'none' : 'transform 0.15s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
        }}
        className={`w-15 h-15 rounded-full border-2 flex items-center justify-center shadow-xl pointer-events-none transition-transform ${
          isActive
            ? 'bg-gradient-to-b from-amber-400 via-amber-500 to-orange-600 border-amber-200 shadow-[0_0_25px_rgba(245,158,11,0.7)] scale-110'
            : 'bg-gradient-to-b from-zinc-700 to-zinc-900 border-zinc-500 text-zinc-400'
        }`}
      >
        <div className={`w-5 h-5 rounded-full border ${isActive ? 'bg-amber-100 border-amber-400' : 'bg-zinc-600 border-zinc-400'}`} />
      </div>
    </div>
  );
};
