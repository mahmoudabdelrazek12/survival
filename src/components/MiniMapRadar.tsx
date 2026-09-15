import React, { useRef, useEffect } from 'react';
import { GameEngine } from '../game/core/GameEngine';
import { Compass, Maximize2 } from 'lucide-react';
import { Language } from '../game/data/translations';

interface MiniMapRadarProps {
  engine: GameEngine;
  onExpand?: () => void;
  lang?: Language;
}

export const MiniMapRadar: React.FC<MiniMapRadarProps> = ({ engine, onExpand, lang = 'ar' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = canvas.width;
      const center = size / 2;
      const radarRadius = center - 4;
      const radarRange = 1400; // World units visible in radar radius

      ctx.clearRect(0, 0, size, size);

      // 1. Radar Circular Background
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, radarRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(9, 9, 11, 0.88)';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#3f3f46';
      ctx.stroke();

      // Range concentric rings
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(center, center, radarRadius * 0.33, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(center, center, radarRadius * 0.66, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshairs
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.12)';
      ctx.beginPath();
      ctx.moveTo(center, center - radarRadius);
      ctx.lineTo(center, center + radarRadius);
      ctx.moveTo(center - radarRadius, center);
      ctx.lineTo(center + radarRadius, center);
      ctx.stroke();

      // Radar Sweep Line
      const sweepAngle = (Date.now() / 900) % (Math.PI * 2);
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radarRadius, sweepAngle, sweepAngle + 0.35);
      ctx.closePath();
      const sweepGrad = ctx.createRadialGradient(center, center, 0, center, center, radarRadius);
      sweepGrad.addColorStop(0, 'rgba(245, 158, 11, 0.25)');
      sweepGrad.addColorStop(1, 'rgba(245, 158, 11, 0.01)');
      ctx.fillStyle = sweepGrad;
      ctx.fill();

      // Clip within circle for items
      ctx.beginPath();
      ctx.arc(center, center, radarRadius - 2, 0, Math.PI * 2);
      ctx.clip();

      const p = engine.playerVehicle;
      if (!p) {
        ctx.restore();
        return;
      }

      // 2. Render Loot Items on Radar (Fuel cans, scrap, etc.)
      const lootItems = engine.loot.items;
      for (let i = 0; i < lootItems.length; i++) {
        const item = lootItems[i];
        const dx = item.x - p.x;
        const dy = item.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist > radarRange) continue;

        const rx = center + (dx / radarRange) * radarRadius;
        const ry = center + (dy / radarRange) * radarRadius;

        if (item.type === 'fuel') {
          // Yellow/Amber pulsing dot
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(rx, ry, 3.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (item.type === 'scrap') {
          // Cyan dot
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(rx - 2.5, ry - 2.5, 5, 5);
        } else if (item.type === 'repair') {
          // Green dot
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(rx, ry, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3. Render Enemies on Radar
      const enemies = engine.enemies;
      for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        const dx = e.x - p.x;
        const dy = e.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist > radarRange) continue;

        const rx = center + (dx / radarRange) * radarRadius;
        const ry = center + (dy / radarRange) * radarRadius;

        if (e.isBoss) {
          // Large flashing red skull/circle
          const pulse = (Math.sin(Date.now() / 150) + 1) * 2;
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(rx, ry, 6 + pulse, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else if (e.type.startsWith('zombie_')) {
          // Purple dot
          ctx.fillStyle = '#c084fc';
          ctx.beginPath();
          ctx.arc(rx, ry, 3.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Red Raider dot
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(rx, ry, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 4. Center Player Vehicle Blip & Heading Arrow
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(p.angle);

      // Player Arrow
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(-6, -5);
      ctx.lineTo(-3, 0);
      ctx.lineTo(-6, 5);
      ctx.closePath();
      ctx.fill();

      // Heading Beam
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(24, 0);
      ctx.stroke();

      ctx.restore();
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [engine]);

  const posX = Math.round(engine.playerVehicle?.x || 0);
  const posY = Math.round(engine.playerVehicle?.y || 0);

  return (
    <div className="relative flex flex-col items-center select-none pointer-events-auto">
      <div 
        onClick={onExpand}
        className="relative p-1 rounded-2xl bg-zinc-950/90 border border-zinc-800 hover:border-amber-500/50 shadow-2xl backdrop-blur-md cursor-pointer group transition-all"
        title={lang === 'ar' ? 'انقر لتوسيع خريطة القطاع الكاملة' : 'Click to expand tactical map'}
      >
        <canvas
          ref={canvasRef}
          width={130}
          height={130}
          className="block rounded-xl w-[110px] h-[110px] sm:w-[130px] sm:h-[130px]"
        />

        {/* Compass Cardinal Indicators */}
        <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-black font-mono text-amber-500/80 pointer-events-none">
          N
        </span>
        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-black font-mono text-zinc-500 pointer-events-none">
          S
        </span>
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] font-black font-mono text-zinc-500 pointer-events-none">
          W
        </span>
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-black font-mono text-zinc-500 pointer-events-none">
          E
        </span>

        {/* Expand Icon on Hover */}
        <div className="absolute top-2 right-2 p-1 rounded-md bg-zinc-900/80 text-zinc-400 group-hover:text-amber-400 opacity-75 group-hover:opacity-100 transition">
          <Maximize2 className="w-3 h-3" />
        </div>
      </div>

      {/* GPS Coordinates Tag */}
      <div className="mt-1 px-2.5 py-0.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-[10px] font-mono text-zinc-400 flex items-center gap-1 shadow-md">
        <Compass className="w-3 h-3 text-amber-400 shrink-0" />
        <span>GPS: {posX}, {posY}</span>
      </div>
    </div>
  );
};
