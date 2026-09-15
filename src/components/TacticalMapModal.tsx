import React, { useRef, useEffect } from 'react';
import { X, Compass, MapPin, Fuel, Wrench, Skull, Shield, Crosshair } from 'lucide-react';
import { GameEngine } from '../game/core/GameEngine';
import { Language } from '../game/data/translations';
import { SoundSynthesizer } from '../game/audio/SoundSynthesizer';

interface TacticalMapModalProps {
  engine: GameEngine;
  onClose: () => void;
  lang?: Language;
}

export const TacticalMapModal: React.FC<TacticalMapModalProps> = ({ engine, onClose, lang = 'ar' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const p = engine.playerVehicle;

    // Draw background topographic desert grid
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (!p) return;

    const scale = 0.12; // World to map scale
    const mapCenterX = width / 2;
    const mapCenterY = height / 2;

    const toMapX = (wx: number) => mapCenterX + (wx - p.x) * scale;
    const toMapY = (wy: number) => mapCenterY + (wy - p.y) * scale;

    // Danger zone circles
    ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
    ctx.beginPath();
    ctx.arc(mapCenterX + 120, mapCenterY - 80, 110, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(192, 132, 252, 0.08)';
    ctx.beginPath();
    ctx.arc(mapCenterX - 100, mapCenterY + 110, 95, 0, Math.PI * 2);
    ctx.fill();

    // Render Loot Items
    const loot = engine.loot.items;
    for (const item of loot) {
      const mx = toMapX(item.x);
      const my = toMapY(item.y);
      if (mx < 0 || mx > width || my < 0 || my > height) continue;

      if (item.type === 'fuel') {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(mx, my, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (item.type === 'scrap') {
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(mx - 3, my - 3, 6, 6);
      }
    }

    // Render Enemies
    const enemies = engine.enemies;
    for (const enemy of enemies) {
      const mx = toMapX(enemy.x);
      const my = toMapY(enemy.y);
      if (mx < 0 || mx > width || my < 0 || my > height) continue;

      if (enemy.isBoss) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(mx, my, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (enemy.type.startsWith('zombie_')) {
        ctx.fillStyle = '#c084fc';
        ctx.beginPath();
        ctx.arc(mx, my, 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(mx, my, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Player position
    ctx.save();
    ctx.translate(mapCenterX, mapCenterY);
    ctx.rotate(p.angle);

    // Pulse wave
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.stroke();

    // Arrow
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(-8, -7);
    ctx.lineTo(-4, 0);
    ctx.lineTo(-8, 7);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }, [engine]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-lg font-sans">
      <div 
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        className="bg-zinc-950 border border-amber-500/30 rounded-3xl w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800 bg-zinc-900/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-zinc-100 tracking-wide">
                {lang === 'ar' ? 'الخريطة التكتيكية الفضائية للقطاع' : 'TACTICAL SECTOR SATELLITE MAP'}
              </h2>
              <p className="text-xs text-zinc-400">
                {lang === 'ar' ? 'موقع مركبتك المباشر، إحداثيات البنزين، ومواقع تجمعات الأعداء والزومبي' : 'Live vehicle telemetry, resource caches, and threat radar'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              SoundSynthesizer.playClick();
              onClose();
            }}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Canvas */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden p-2 min-h-[340px]">
          <canvas
            ref={canvasRef}
            width={720}
            height={420}
            className="w-full h-full max-h-[55vh] object-contain rounded-2xl border border-zinc-800"
          />

          <div className="absolute top-4 left-4 bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-amber-400 font-mono">
            <span>SECTOR: 04 // LAT: {Math.round(engine.playerVehicle?.x || 0)} LON: {Math.round(engine.playerVehicle?.y || 0)}</span>
          </div>
        </div>

        {/* Map Legend */}
        <div className="p-4 bg-zinc-900/60 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 text-amber-400 font-bold">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span>{lang === 'ar' ? 'مركبتك' : 'Your Rig'}</span>
            </span>

            <span className="flex items-center gap-1.5 text-yellow-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <span>{lang === 'ar' ? 'براميل وقود' : 'Fuel Cans'}</span>
            </span>

            <span className="flex items-center gap-1.5 text-sky-400 font-bold">
              <span className="w-2.5 h-2.5 bg-sky-400" />
              <span>{lang === 'ar' ? 'خردة معدنية' : 'Scrap Metal'}</span>
            </span>

            <span className="flex items-center gap-1.5 text-rose-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>{lang === 'ar' ? 'مركبات العدو' : 'Raiders'}</span>
            </span>

            <span className="flex items-center gap-1.5 text-purple-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              <span>{lang === 'ar' ? 'وحوش الزومبي' : 'Night Zombies'}</span>
            </span>

            <span className="flex items-center gap-1.5 text-red-500 font-bold">
              <span className="w-3.5 h-3.5 rounded-full bg-red-600 border border-white" />
              <span>{lang === 'ar' ? 'زعيم المنطقة' : 'Titan Boss'}</span>
            </span>
          </div>

          <button
            onClick={() => {
              SoundSynthesizer.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition active:scale-95 cursor-pointer shadow-lg"
          >
            {lang === 'ar' ? 'العودة للقيادة' : 'Resume Driving'}
          </button>
        </div>
      </div>
    </div>
  );
};
