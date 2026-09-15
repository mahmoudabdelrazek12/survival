import React, { useState, useEffect } from 'react';
import { 
  Shield, Fuel, Zap, Crosshair, Pause, DollarSign, Wrench, Skull, 
  Flame, Rocket, Bomb, Sun, Moon, Sunrise, Sunset, Radio, 
  ChevronLeft, ChevronRight, Gauge, AlertTriangle, Compass, MapPin
} from 'lucide-react';
import { GameEngine } from '../game/core/GameEngine';
import { INITIAL_WEAPONS } from '../game/data/gameData';
import { WeaponType } from '../types/game';
import { t } from '../game/data/translations';
import { SoundSynthesizer } from '../game/audio/SoundSynthesizer';
import { MiniMapRadar } from './MiniMapRadar';
import { TacticalMapModal } from './TacticalMapModal';
import { VirtualJoystick } from './VirtualJoystick';
import { Sliders } from 'lucide-react';

interface GameHUDProps {
  engine: GameEngine;
  onPause: () => void;
  showTouchControls: boolean;
}

export const GameHUD: React.FC<GameHUDProps> = ({ engine, onPause, showTouchControls }) => {
  const [, setTick] = useState(0);
  const [showTacticalMap, setShowTacticalMap] = useState(false);

  // 30fps HUD tick
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 33);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut for tactical map: [M]
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'm' || e.key === 'M') {
        setShowTacticalMap(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const player = engine.playerVehicle;
  if (!player) return null;

  const lang = engine.saveData.settings.language || 'ar';
  const controlMode = engine.saveData.settings.controlMode || 'joystick';
  const hpRatio = Math.max(0, Math.min(1, player.hp / player.maxHp));
  const fuelRatio = Math.max(0, Math.min(1, player.fuel / player.maxFuel));
  const boostRatio = Math.max(0, Math.min(1, player.boostTank / player.maxBoost));
  const speedKmh = Math.round(player.currentSpeed * 0.28);
  const maxSpeedKmh = Math.round(player.maxSpeed * 0.28);
  const activeWeaponId = engine.saveData.activeWeaponId;
  const isLowFuel = fuelRatio < 0.25;

  // Day/Night info
  const dayNightPhase = engine.dayNightPhase;
  const isNight = dayNightPhase === 'NIGHT';
  const isDusk = dayNightPhase === 'DUSK';

  // Base Tactical Missile status
  const missileCooldownRatio = Math.max(0, engine.missileCooldown / engine.missileMaxCooldown);
  const isMissileReady = engine.missileCooldown <= 0;

  // Automatic Transmission Gear State (P / R / N / D)
  const isReverse = engine.input.throttle < -0.1 || engine.input.touchReverse;
  const isDrive = engine.input.throttle > 0.1 || engine.input.touchGas || speedKmh > 10;
  const gear = isReverse ? 'R' : isDrive ? 'D' : 'N';

  const availableWeapons: WeaponType[] = ['vulcan', 'plasma', 'flak', 'missile', 'flamethrower'];

  const getWeaponIcon = (id: WeaponType) => {
    switch (id) {
      case 'vulcan': return <Crosshair className="w-4 h-4 text-amber-400" />;
      case 'plasma': return <Zap className="w-4 h-4 text-sky-400" />;
      case 'flak': return <Bomb className="w-4 h-4 text-orange-400" />;
      case 'missile': return <Rocket className="w-4 h-4 text-red-400" />;
      case 'flamethrower': return <Flame className="w-4 h-4 text-rose-400" />;
    }
  };

  const handleTriggerMissile = () => {
    if (isMissileReady) {
      engine.triggerBaseMissile();
    }
  };

  return (
    <div 
      dir={lang === 'ar' ? 'rtl' : 'ltr'} 
      className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2 sm:p-4 select-none font-sans"
    >
      {/* Top Header Cockpit Console */}
      <div className="flex justify-between items-start w-full gap-2">
        {/* Left: Health, Fuel, Boost Dashboard */}
        <div className="pointer-events-auto bg-zinc-950/90 border border-zinc-800/90 rounded-2xl p-3 shadow-2xl backdrop-blur-md w-56 sm:w-68 flex flex-col gap-2">
          {/* Hull HP */}
          <div>
            <div className="flex justify-between text-xs font-black mb-1 tracking-wider text-zinc-300">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" /> 
                <span>{t(lang, 'hullIntegrity')}</span>
              </span>
              <span className={hpRatio < 0.3 ? 'text-red-400 animate-pulse font-mono' : 'text-emerald-400 font-mono'}>
                {Math.round(player.hp)} / {Math.round(player.maxHp)}
              </span>
            </div>
            <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-800">
              <div
                className={`h-full rounded-full transition-all duration-150 ${
                  hpRatio > 0.5 
                    ? 'bg-gradient-to-r from-emerald-500 to-green-400' 
                    : hpRatio > 0.25 
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400' 
                    : 'bg-gradient-to-r from-red-600 to-rose-500'
                }`}
                style={{ width: `${hpRatio * 100}%` }}
              />
            </div>
          </div>

          {/* Fuel Tank */}
          <div>
            <div className="flex justify-between text-xs font-black mb-1 tracking-wider text-zinc-300">
              <span className="flex items-center gap-1.5">
                <Fuel className={`w-3.5 h-3.5 ${isLowFuel ? 'text-red-500 animate-bounce' : 'text-amber-400'}`} /> 
                <span>{t(lang, 'fuelRemaining')}</span>
              </span>
              <span className={isLowFuel ? 'text-red-400 animate-pulse font-mono' : 'text-amber-400 font-mono'}>
                {Math.round(player.fuel)}L
              </span>
            </div>
            <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-800">
              <div
                className={`h-full rounded-full transition-all duration-150 ${
                  fuelRatio > 0.3 
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400' 
                    : 'bg-gradient-to-r from-red-600 to-rose-500 animate-pulse'
                }`}
                style={{ width: `${fuelRatio * 100}%` }}
              />
            </div>
          </div>

          {/* Nitro Boost Reserve */}
          <div>
            <div className="flex justify-between text-[11px] font-black mb-1 text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-cyan-400" /> 
                <span>{t(lang, 'nitroTank')}</span>
              </span>
              <span className="text-cyan-400 font-mono">{Math.round(boostRatio * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all duration-100"
                style={{ width: `${boostRatio * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center: Vehicle Speedometer Dial & Day/Night Cluster */}
        <div className="flex flex-col items-center gap-1">
          <div className="bg-zinc-950/90 border border-zinc-800/90 rounded-2xl px-4 py-2 shadow-2xl backdrop-blur-md flex items-center gap-4">
            {/* Speed Gauge */}
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-zinc-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={player.isBoosting ? 'text-cyan-400 shadow-[0_0_12px_#38bdf8]' : 'text-amber-400'}
                    strokeDasharray={`${Math.min(100, (speedKmh / (maxSpeedKmh || 120)) * 100)}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <Gauge className="w-4 h-4 text-zinc-400 absolute" />
              </div>

              <div className="flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl sm:text-3xl font-black font-mono leading-none tracking-tight ${player.isBoosting ? 'text-cyan-300' : 'text-zinc-100'}`}>
                    {speedKmh}
                  </span>
                  {/* Transmission Gear Indicator [P] [R] [N] [D] */}
                  <div className="flex items-center gap-0.5 ml-1 px-1.5 py-0.5 rounded bg-black/80 border border-zinc-800 text-[10px] font-mono font-black">
                    <span className={gear === 'R' ? 'text-rose-400 font-bold' : 'text-zinc-600'}>R</span>
                    <span className={gear === 'N' ? 'text-amber-400 font-bold' : 'text-zinc-600'}>N</span>
                    <span className={gear === 'D' ? 'text-emerald-400 font-bold' : 'text-zinc-600'}>D</span>
                  </div>
                </div>
                <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">
                  {t(lang, 'speedKmh')}
                </span>
              </div>
            </div>

            <div className="h-9 w-px bg-zinc-800" />

            {/* Day / Night Cycle Status */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5 mb-0.5">
                {dayNightPhase === 'DAY' && <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />}
                {dayNightPhase === 'DUSK' && <Sunset className="w-4 h-4 text-orange-400" />}
                {dayNightPhase === 'NIGHT' && <Moon className="w-4 h-4 text-purple-400 animate-pulse" />}
                {dayNightPhase === 'DAWN' && <Sunrise className="w-4 h-4 text-yellow-300" />}
                <span className={`text-xs font-black uppercase tracking-wider ${
                  isNight ? 'text-rose-400 animate-pulse' : isDusk ? 'text-orange-400' : 'text-amber-300'
                }`}>
                  {dayNightPhase === 'DAY' && (lang === 'ar' ? 'نهار' : 'DAY')}
                  {dayNightPhase === 'DUSK' && (lang === 'ar' ? 'غروب' : 'DUSK')}
                  {dayNightPhase === 'NIGHT' && (lang === 'ar' ? 'ليل (زومبي)' : 'NIGHT')}
                  {dayNightPhase === 'DAWN' && (lang === 'ar' ? 'شروق' : 'DAWN')}
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">
                {Math.floor(engine.runTime / 60)}:{(Math.floor(engine.runTime % 60)).toString().padStart(2, '0')}
              </span>
            </div>

            <div className="h-9 w-px bg-zinc-800 hidden sm:block" />

            {/* Kills */}
            <div className="hidden sm:flex flex-col items-center">
              <span className="text-2xl font-black font-mono text-rose-400 leading-none flex items-center gap-1">
                <Skull className="w-4 h-4 text-rose-500" /> {engine.enemiesKilled}
              </span>
              <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">
                {t(lang, 'enemiesDefeated')}
              </span>
            </div>
          </div>

          {/* Night Zombie Danger Banner */}
          {isNight && (
            <div className="bg-purple-950/80 border border-purple-500/40 text-purple-200 px-4 py-1 rounded-full text-xs font-black flex items-center gap-2 shadow-lg animate-pulse backdrop-blur-md">
              <AlertTriangle className="w-3.5 h-3.5 text-purple-400" />
              <span>{t(lang, 'nightHordeAlert')}</span>
            </div>
          )}
        </div>

        {/* Right: Real-time Mini-Map & Radar + Currency + Pause */}
        <div className="pointer-events-auto flex items-start gap-2">
          {/* Mini-Map Radar Widget */}
          <MiniMapRadar
            engine={engine}
            onExpand={() => setShowTacticalMap(true)}
            lang={lang}
          />

          <div className="flex flex-col gap-2">
            <div className="bg-zinc-950/90 border border-zinc-800/90 rounded-2xl px-3 py-1.5 shadow-2xl backdrop-blur-md flex flex-col gap-1 text-right">
              <div className="flex items-center justify-end gap-1.5 text-amber-400 font-black font-mono text-xs sm:text-sm">
                <span>{engine.saveData.coins.toLocaleString()}</span>
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="flex items-center justify-end gap-1.5 text-zinc-300 font-black font-mono text-xs sm:text-sm">
                <span>{engine.saveData.scrap.toLocaleString()}</span>
                <Wrench className="w-3.5 h-3.5 text-zinc-400" />
              </div>
            </div>

            <button
              onClick={onPause}
              className="bg-zinc-950/90 hover:bg-zinc-800 text-zinc-200 p-2.5 rounded-2xl border border-zinc-800 shadow-xl transition active:scale-95 cursor-pointer flex items-center justify-center"
              title="Pause Game [ESC / P]"
            >
              <Pause className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Critical Low Fuel Alert Toast */}
      {isLowFuel && (
        <div className="self-center bg-red-600/90 text-white font-black text-sm tracking-wider px-5 py-1.5 rounded-full border border-red-400 shadow-2xl animate-pulse">
          {t(lang, 'lowFuelAlert')}
        </div>
      )}

      {/* Bottom Vehicular Cockpit Driving Controls & Weapons Toolbar */}
      <div className="flex justify-between items-end w-full gap-2 sm:gap-4">
        {/* Left Side: Touch Joystick / Steering Paddles */}
        {showTouchControls ? (
          <div className="pointer-events-auto flex items-end gap-2 pb-1">
            {controlMode === 'joystick' ? (
              /* Mobile Swipe Virtual Joystick (عصا التحكم باللمس والسحب) */
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-[10px] font-bold text-amber-400 bg-zinc-950/80 px-2 py-0.5 rounded-full border border-zinc-800">
                    {lang === 'ar' ? 'عصا السحب والقيادة' : 'Touch Joystick'}
                  </span>
                  <button
                    onClick={() => {
                      engine.saveData.settings.controlMode = 'buttons';
                      setTick(t => t + 1);
                    }}
                    className="p-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 border border-zinc-800 text-[9px] font-mono transition"
                    title={lang === 'ar' ? 'تبديل إلى دواسات منفصلة' : 'Switch to pedals'}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-end gap-2">
                  <VirtualJoystick engine={engine} size={145} lang={lang} />
                  
                  {/* Quick Drift / Handbrake Button alongside joystick */}
                  <button
                    onTouchStart={(e) => { e.preventDefault(); engine.input.touchHandbrake = true; }}
                    onTouchEnd={(e) => { e.preventDefault(); engine.input.touchHandbrake = false; }}
                    onMouseDown={() => { engine.input.touchHandbrake = true; }}
                    onMouseUp={() => { engine.input.touchHandbrake = false; }}
                    className="w-13 h-18 sm:w-15 sm:h-20 rounded-2xl bg-gradient-to-b from-amber-600 to-orange-800 active:from-amber-500 active:to-orange-700 border-2 border-amber-400 shadow-xl flex flex-col items-center justify-center text-black font-black text-[10px] transition-all active:scale-95 touch-none select-none relative mb-1"
                  >
                    <div className="w-5 h-1.5 rounded-full bg-amber-300 mb-1" />
                    <span className="leading-tight text-center px-1">{t(lang, 'driftHandbrake')}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Classic Steering Paddles Mode */
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-[10px] font-bold text-zinc-400 bg-zinc-950/80 px-2 py-0.5 rounded-full border border-zinc-800">
                    {lang === 'ar' ? 'أزرار التوجيه' : 'Steer Buttons'}
                  </span>
                  <button
                    onClick={() => {
                      engine.saveData.settings.controlMode = 'joystick';
                      setTick(t => t + 1);
                    }}
                    className="p-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 border border-zinc-800 text-[9px] font-mono transition"
                    title={lang === 'ar' ? 'تبديل إلى عصا التحكم اللمسية' : 'Switch to swipe joystick'}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-end gap-2">
                  {/* Steer Left Paddle */}
                  <button
                    onTouchStart={(e) => { e.preventDefault(); engine.input.touchSteerLeft = true; }}
                    onTouchEnd={(e) => { e.preventDefault(); engine.input.touchSteerLeft = false; }}
                    onMouseDown={() => { engine.input.touchSteerLeft = true; }}
                    onMouseUp={() => { engine.input.touchSteerLeft = false; }}
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-950 active:from-amber-600 active:to-amber-900 border-2 border-zinc-600 active:border-amber-400 shadow-[0_8px_20px_rgba(0,0,0,0.6)] flex flex-col items-center justify-center text-zinc-200 active:text-black transition-all active:scale-95 touch-none select-none relative overflow-hidden group"
                  >
                    <div className="absolute top-1 left-2 w-2 h-2 rounded-full bg-zinc-700 group-active:bg-amber-300" />
                    <ChevronLeft className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2.5]" />
                    <span className="text-[10px] font-black uppercase font-mono">{t(lang, 'steerLeft')}</span>
                  </button>

                  {/* Steer Right Paddle */}
                  <button
                    onTouchStart={(e) => { e.preventDefault(); engine.input.touchSteerRight = true; }}
                    onTouchEnd={(e) => { e.preventDefault(); engine.input.touchSteerRight = false; }}
                    onMouseDown={() => { engine.input.touchSteerRight = true; }}
                    onMouseUp={() => { engine.input.touchSteerRight = false; }}
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-950 active:from-amber-600 active:to-amber-900 border-2 border-zinc-600 active:border-amber-400 shadow-[0_8px_20px_rgba(0,0,0,0.6)] flex flex-col items-center justify-center text-zinc-200 active:text-black transition-all active:scale-95 touch-none select-none relative overflow-hidden group"
                  >
                    <div className="absolute top-1 right-2 w-2 h-2 rounded-full bg-zinc-700 group-active:bg-amber-300" />
                    <ChevronRight className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2.5]" />
                    <span className="text-[10px] font-black uppercase font-mono">{t(lang, 'steerRight')}</span>
                  </button>

                  {/* Rally Hydraulic Handbrake Lever (Drift) */}
                  <button
                    onTouchStart={(e) => { e.preventDefault(); engine.input.touchHandbrake = true; }}
                    onTouchEnd={(e) => { e.preventDefault(); engine.input.touchHandbrake = false; }}
                    onMouseDown={() => { engine.input.touchHandbrake = true; }}
                    onMouseUp={() => { engine.input.touchHandbrake = false; }}
                    className="w-14 h-16 sm:w-16 sm:h-18 rounded-2xl bg-gradient-to-b from-amber-600 to-orange-800 active:from-amber-500 active:to-orange-700 border-2 border-amber-400 shadow-xl flex flex-col items-center justify-center text-black font-black text-[10px] transition-all active:scale-95 touch-none select-none relative"
                  >
                    <div className="w-6 h-1.5 rounded-full bg-amber-300 mb-1" />
                    <span className="leading-tight">{t(lang, 'driftHandbrake')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="hidden sm:flex flex-col text-[11px] text-zinc-400 bg-zinc-950/85 p-3 rounded-xl border border-zinc-800 backdrop-blur-md space-y-1">
            <div className="text-zinc-200 font-bold mb-0.5">{lang === 'ar' ? 'أزرار القيادة:' : 'Driving Keys:'}</div>
            <span>[W / S] {lang === 'ar' ? 'دواسة البنزين والرجوع' : 'Gas & Reverse Pedals'}</span>
            <span>[A / D] {lang === 'ar' ? 'التوجيه يمين ويسار' : 'Steer Left & Right'}</span>
            <span>[SPACE] {lang === 'ar' ? 'فرامل اليد والتفحيط' : 'Drift Handbrake'}</span>
            <span>[SHIFT] {lang === 'ar' ? 'نيترو توربو NOS' : 'Nitro Boost'}</span>
            <span>[E / F] {lang === 'ar' ? 'صاروخ القاعدة التكتيكي' : 'Base Tactical Missile'}</span>
            <span>[M] {lang === 'ar' ? 'الخريطة التكتيكية الفضائية' : 'Tactical Map'}</span>
          </div>
        )}

        {/* Center: Weapons Selector Console */}
        <div className="pointer-events-auto bg-zinc-950/90 border border-zinc-800/90 p-1.5 rounded-2xl backdrop-blur-md shadow-2xl flex items-center gap-1.5 mb-1 max-w-[280px] sm:max-w-none overflow-x-auto">
          {availableWeapons.map((wId, idx) => {
            const isUnlocked = engine.saveData.unlockedWeaponIds.includes(wId);
            const isActive = activeWeaponId === wId;
            const def = INITIAL_WEAPONS[wId];

            return (
              <button
                key={wId}
                disabled={!isUnlocked}
                onClick={() => {
                  if (isUnlocked) {
                    SoundSynthesizer.playClick();
                    engine.saveData.activeWeaponId = wId;
                    setTick(t => t + 1);
                  }
                }}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-amber-500 text-black shadow-md'
                    : isUnlocked
                    ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200'
                    : 'bg-zinc-950 text-zinc-600 opacity-40 cursor-not-allowed'
                }`}
              >
                <span className="text-[10px] opacity-70 font-mono">[{idx + 1}]</span>
                {getWeaponIcon(wId)}
                <span className="hidden md:inline">{def.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Right Side: Realistic Car Cockpit Pedals & Actions */}
        {showTouchControls && (
          <div className="pointer-events-auto flex items-end gap-1.5 sm:gap-3 pb-1">
            {/* Tactical Base Missile Launch Switch */}
            <button
              onClick={handleTriggerMissile}
              disabled={!isMissileReady}
              className={`relative w-13 h-15 sm:w-16 sm:h-18 rounded-2xl border-2 flex flex-col items-center justify-center transition-all shadow-xl active:scale-95 touch-none select-none ${
                isMissileReady
                  ? 'bg-gradient-to-b from-amber-500 via-orange-600 to-red-600 border-amber-300 text-black animate-pulse cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                  : 'bg-zinc-900/90 border-zinc-800 text-zinc-500 cursor-not-allowed opacity-60'
              }`}
            >
              <Radio className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-[8px] sm:text-[9px] font-black leading-tight mt-1 text-center">
                {isMissileReady ? t(lang, 'tacticalMissile') : `${Math.ceil(engine.missileCooldown)}s`}
              </span>
            </button>

            {/* NOS Nitrous Oxide Boost Purge Switch */}
            <button
              onTouchStart={(e) => { e.preventDefault(); engine.input.touchBoost = true; }}
              onTouchEnd={(e) => { e.preventDefault(); engine.input.touchBoost = false; }}
              onMouseDown={() => { engine.input.touchBoost = true; }}
              onMouseUp={() => { engine.input.touchBoost = false; }}
              className="w-13 h-15 sm:w-16 sm:h-18 rounded-2xl bg-gradient-to-b from-cyan-600 to-blue-900 active:from-cyan-400 active:to-blue-700 border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] flex flex-col items-center justify-center text-white active:scale-95 touch-none select-none"
            >
              <Zap className="w-5 h-5 sm:w-7 sm:h-7" />
              <span className="text-[8px] sm:text-[9px] font-black uppercase font-mono mt-0.5">NOS</span>
            </button>

            {/* In Buttons mode, render explicit Reverse and Gas pedals. In Joystick mode, the joystick provides full 360 throttle/reverse/steering, so we render a simplified Quick Brake / Reverse if needed, or buttons mode pedals */}
            {controlMode === 'buttons' ? (
              <>
                {/* REALISTIC CAR BRAKE & REVERSE PEDAL */}
                <button
                  onTouchStart={(e) => { e.preventDefault(); engine.input.touchReverse = true; }}
                  onTouchEnd={(e) => { e.preventDefault(); engine.input.touchReverse = false; }}
                  onMouseDown={() => { engine.input.touchReverse = true; }}
                  onMouseUp={() => { engine.input.touchReverse = false; }}
                  className="w-15 h-20 sm:w-18 sm:h-26 rounded-2xl bg-gradient-to-b from-rose-800 via-red-900 to-zinc-950 active:from-red-600 active:to-rose-900 border-3 border-red-500 active:border-red-300 shadow-[0_10px_25px_rgba(225,29,72,0.5)] flex flex-col items-center justify-between p-2 text-white active:scale-95 transition-all touch-none select-none relative overflow-hidden"
                >
                  <div className="w-full flex justify-between px-1">
                    <span className="w-2 h-2 rounded-full bg-zinc-700 border border-zinc-500" />
                    <span className="w-2 h-2 rounded-full bg-zinc-700 border border-zinc-500" />
                  </div>
                  <div className="w-full flex flex-col items-center gap-1 my-1">
                    <div className="w-8 sm:w-10 h-1 bg-red-400/80 rounded-full" />
                    <div className="w-8 sm:w-10 h-1 bg-red-400/80 rounded-full" />
                    <div className="w-8 sm:w-10 h-1 bg-red-400/80 rounded-full" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-red-100 font-mono">
                    {t(lang, 'reverse')}
                  </span>
                </button>

                {/* REALISTIC CAR SPORT GAS PEDAL */}
                <button
                  onTouchStart={(e) => { e.preventDefault(); engine.input.touchGas = true; }}
                  onTouchEnd={(e) => { e.preventDefault(); engine.input.touchGas = false; }}
                  onMouseDown={() => { engine.input.touchGas = true; }}
                  onMouseUp={() => { engine.input.touchGas = false; }}
                  className="w-16 h-24 sm:w-20 sm:h-30 rounded-2xl bg-gradient-to-b from-emerald-600 via-teal-800 to-zinc-950 active:from-emerald-400 active:to-teal-700 border-3 border-emerald-400 active:border-emerald-200 shadow-[0_12px_30px_rgba(16,185,129,0.5)] flex flex-col items-center justify-between p-2 text-white active:scale-95 transition-all touch-none select-none relative overflow-hidden"
                >
                  <div className="w-full flex justify-between px-1">
                    <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-zinc-300 border border-zinc-600 shadow-inner" />
                    <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-zinc-300 border border-zinc-600 shadow-inner" />
                  </div>
                  <div className="w-full flex flex-col items-center gap-1 sm:gap-1.5 my-1">
                    <div className="w-10 sm:w-12 h-1 sm:h-1.5 bg-emerald-200/90 rounded-full shadow" />
                    <div className="w-10 sm:w-12 h-1 sm:h-1.5 bg-emerald-200/90 rounded-full shadow" />
                    <div className="w-10 sm:w-12 h-1 sm:h-1.5 bg-emerald-200/90 rounded-full shadow" />
                    <div className="w-10 sm:w-12 h-1 sm:h-1.5 bg-emerald-200/90 rounded-full shadow" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-emerald-100 font-mono">
                    {t(lang, 'gasPedal')}
                  </span>
                </button>
              </>
            ) : (
              /* In Joystick Mode, provide Emergency Hard Brake & Reverse assist pedal */
              <button
                onTouchStart={(e) => { e.preventDefault(); engine.input.touchReverse = true; }}
                onTouchEnd={(e) => { e.preventDefault(); engine.input.touchReverse = false; }}
                onMouseDown={() => { engine.input.touchReverse = true; }}
                onMouseUp={() => { engine.input.touchReverse = false; }}
                className="w-15 h-20 sm:w-17 sm:h-24 rounded-2xl bg-gradient-to-b from-rose-700 via-rose-900 to-zinc-950 active:from-red-600 active:to-rose-800 border-2 border-rose-500 shadow-xl flex flex-col items-center justify-between p-2 text-white active:scale-95 transition-all touch-none select-none relative overflow-hidden"
              >
                <div className="w-full flex justify-between px-1">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                </div>
                <div className="w-full flex flex-col items-center gap-1 my-1">
                  <div className="w-8 h-1 bg-rose-300 rounded-full" />
                  <div className="w-8 h-1 bg-rose-300 rounded-full" />
                </div>
                <span className="text-[9px] font-black uppercase font-mono text-center leading-tight">
                  {lang === 'ar' ? 'فرملة / رجوع' : 'Brake / Rev'}
                </span>
              </button>
            )}

            {/* FIGHTER-COCKPIT TURRET TRIGGER (زناد السلاح الرئيسي) */}
            <button
              onTouchStart={(e) => { e.preventDefault(); engine.input.touchFire = true; }}
              onTouchEnd={(e) => { e.preventDefault(); engine.input.touchFire = false; }}
              onMouseDown={() => { engine.input.touchFire = true; }}
              onMouseUp={() => { engine.input.touchFire = false; }}
              className="w-18 h-24 sm:w-22 sm:h-30 rounded-2xl bg-gradient-to-b from-amber-500 via-orange-600 to-zinc-950 active:from-amber-400 active:to-orange-500 border-3 border-amber-400 shadow-[0_12px_30px_rgba(245,158,11,0.5)] flex flex-col items-center justify-between p-2 text-black active:scale-95 transition-all touch-none select-none relative overflow-hidden"
            >
              <div className="w-full flex justify-between px-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-200" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-200" />
              </div>

              <div className="flex flex-col items-center my-auto">
                <Crosshair className="w-9 h-9 sm:w-11 sm:h-11 stroke-[2.5] text-zinc-900 animate-pulse" />
              </div>

              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-zinc-950 font-mono">
                {t(lang, 'fireWeapon')}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Expandable Tactical Satellite Map Modal */}
      {showTacticalMap && (
        <TacticalMapModal
          engine={engine}
          onClose={() => setShowTacticalMap(false)}
          lang={lang}
        />
      )}
    </div>
  );
};
