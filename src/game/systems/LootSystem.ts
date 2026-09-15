import { LootItem } from '../../types/game';
import { SoundSynthesizer } from '../audio/SoundSynthesizer';
import { ParticleSystem } from './ParticleSystem';

export class LootSystem {
  public items: LootItem[] = [];
  private nextId = 1;

  public spawnDrop(x: number, y: number, type: 'coin' | 'scrap' | 'fuel' | 'repair' | 'ammo', value = 1): void {
    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 80;

    this.items.push({
      id: this.nextId++,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      type,
      value,
      radius: type === 'fuel' || type === 'repair' ? 14 : 10,
      lifeTime: 60 // 60 seconds persistence before dust covers it
    });
  }

  public spawnCluster(x: number, y: number, coins: number, scrap: number, allowHealthOrFuel = true): void {
    // Spawn coins
    const coinCount = Math.min(8, Math.max(1, Math.floor(coins / 15)));
    for (let i = 0; i < coinCount; i++) {
      this.spawnDrop(x, y, 'coin', Math.ceil(coins / coinCount));
    }

    // Spawn scrap
    const scrapCount = Math.min(6, Math.max(1, Math.floor(scrap / 12)));
    for (let i = 0; i < scrapCount; i++) {
      this.spawnDrop(x, y, 'scrap', Math.ceil(scrap / scrapCount));
    }

    // Chance of fuel or repair
    if (allowHealthOrFuel) {
      const roll = Math.random();
      if (roll < 0.35) {
        this.spawnDrop(x, y, 'fuel', 30);
      } else if (roll < 0.60) {
        this.spawnDrop(x, y, 'repair', 35);
      }
    }
  }

  public update(
    dt: number,
    playerX: number,
    playerY: number,
    magnetRadius: number,
    onCollect: (item: LootItem) => void,
    particleSystem: ParticleSystem
  ): void {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];

      // Friction on spawn scatter
      item.vx *= Math.pow(0.1, dt);
      item.vy *= Math.pow(0.1, dt);
      item.x += item.vx * dt;
      item.y += item.vy * dt;

      // Distance to player
      const dx = playerX - item.x;
      const dy = playerY - item.y;
      const dist = Math.hypot(dx, dy);

      // Collection radius check
      if (dist < item.radius + 30) {
        SoundSynthesizer.playPickup(item.type);
        particleSystem.addSparks(item.x, item.y, 4);
        onCollect(item);
        this.items.splice(i, 1);
        continue;
      }

      // Magnetic attraction
      if (dist < magnetRadius) {
        const pullFactor = 1 - (dist / magnetRadius);
        const pullSpeed = 420 * (0.3 + pullFactor * 0.7);
        const nx = dx / dist;
        const ny = dy / dist;
        item.x += nx * pullSpeed * dt;
        item.y += ny * pullSpeed * dt;
      }

      item.lifeTime -= dt;
      if (item.lifeTime <= 0) {
        this.items.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const time = performance.now() * 0.004;

    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      const bob = Math.sin(time + item.id) * 3;

      ctx.save();
      ctx.translate(item.x, item.y + bob);

      // Shadow on ground
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.ellipse(0, 8 - bob, item.radius * 0.9, item.radius * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      if (item.type === 'coin') {
        ctx.fillStyle = '#eab308'; // Gold
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', 0, 0.5);
      } else if (item.type === 'scrap') {
        ctx.fillStyle = '#94a3b8'; // Metal gray
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        // Hex nut shape
        ctx.beginPath();
        for (let a = 0; a < 6; a++) {
          const angle = (a * Math.PI) / 3;
          const px = Math.cos(angle) * item.radius;
          const py = Math.sin(angle) * item.radius;
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Inner hole
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (item.type === 'fuel') {
        // Red jerrycan
        ctx.fillStyle = '#dc2626';
        ctx.strokeStyle = '#991b1b';
        ctx.lineWidth = 1.5;
        ctx.fillRect(-7, -9, 14, 18);
        ctx.strokeRect(-7, -9, 14, 18);

        // Canister handle & cap
        ctx.fillStyle = '#475569';
        ctx.fillRect(-3, -12, 6, 3);
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('GAS', 0, 0);
      } else if (item.type === 'repair') {
        // Green med/repair toolkit
        ctx.fillStyle = '#16a34a';
        ctx.strokeStyle = '#14532d';
        ctx.lineWidth = 1.5;
        ctx.fillRect(-8, -8, 16, 16);
        ctx.strokeRect(-8, -8, 16, 16);

        // White cross
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-2, -5, 4, 10);
        ctx.fillRect(-5, -2, 10, 4);
      }

      ctx.restore();
    }
  }

  public clear(): void {
    this.items = [];
  }
}
