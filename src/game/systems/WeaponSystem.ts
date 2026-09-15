import { Projectile, WeaponType, WeaponDefinition } from '../../types/game';
import { SoundSynthesizer } from '../audio/SoundSynthesizer';
import { ParticleSystem } from './ParticleSystem';

export class WeaponSystem {
  public projectiles: Projectile[] = [];
  private lastFireTime: Record<string, number> = {};

  public firePlayerWeapon(
    weapon: WeaponDefinition,
    x: number,
    y: number,
    vehicleAngle: number,
    turretAngle: number,
    vx: number,
    vy: number,
    particleSystem: ParticleSystem,
    damageBonusMultiplier = 1.0
  ): boolean {
    const now = performance.now();
    const cooldownMs = (1 / weapon.fireRate) * 1000;
    const lastFired = this.lastFireTime[weapon.id] || 0;

    if (now - lastFired < cooldownMs) {
      return false; // Still on cooldown
    }

    this.lastFireTime[weapon.id] = now;
    SoundSynthesizer.playShoot(weapon.id);

    const dmg = weapon.damage * damageBonusMultiplier;

    if (weapon.id === 'vulcan') {
      // Twin alternating or dual muzzle barrels
      const offset = 10;
      const perpAngle = turretAngle + Math.PI / 2;
      const ox1 = x + Math.cos(turretAngle) * 28 + Math.cos(perpAngle) * offset;
      const oy1 = y + Math.sin(turretAngle) * 28 + Math.sin(perpAngle) * offset;
      const ox2 = x + Math.cos(turretAngle) * 28 - Math.cos(perpAngle) * offset;
      const oy2 = y + Math.sin(turretAngle) * 28 - Math.sin(perpAngle) * offset;

      const spreadAngle = (Math.random() - 0.5) * weapon.spread;
      const fireAngle = turretAngle + spreadAngle;

      this.spawnBullet(ox1, oy1, fireAngle, weapon.speed, dmg, true, weapon.range, weapon.color, 3.5, 'vulcan', vx * 0.4, vy * 0.4);
      this.spawnBullet(ox2, oy2, fireAngle, weapon.speed, dmg, true, weapon.range, weapon.color, 3.5, 'vulcan', vx * 0.4, vy * 0.4);

      particleSystem.addSparks(ox1, oy1, 3);
      particleSystem.addSparks(ox2, oy2, 3);
    } else if (weapon.id === 'plasma') {
      const muzzleX = x + Math.cos(turretAngle) * 32;
      const muzzleY = y + Math.sin(turretAngle) * 32;
      this.spawnBullet(muzzleX, muzzleY, turretAngle, weapon.speed, dmg, true, weapon.range, weapon.color, 6.0, 'plasma', vx * 0.2, vy * 0.2);
      particleSystem.addSparks(muzzleX, muzzleY, 5);
    } else if (weapon.id === 'flak') {
      const muzzleX = x + Math.cos(turretAngle) * 34;
      const muzzleY = y + Math.sin(turretAngle) * 34;
      const spread = (Math.random() - 0.5) * weapon.spread;
      this.spawnBullet(muzzleX, muzzleY, turretAngle + spread, weapon.speed, dmg, true, weapon.range, weapon.color, 7.5, 'flak', vx * 0.2, vy * 0.2);
      particleSystem.addDust(muzzleX, muzzleY, Math.cos(turretAngle) * 40, Math.sin(turretAngle) * 40, 8);
    } else if (weapon.id === 'missile') {
      const muzzleX = x + Math.cos(turretAngle) * 24;
      const muzzleY = y + Math.sin(turretAngle) * 24;
      const spread = (Math.random() - 0.5) * weapon.spread;
      this.spawnBullet(muzzleX, muzzleY, turretAngle + spread, weapon.speed, dmg, true, weapon.range, weapon.color, 5.0, 'missile', vx * 0.3, vy * 0.3);
      particleSystem.addDust(muzzleX, muzzleY, -Math.cos(turretAngle) * 60, -Math.sin(turretAngle) * 60, 6);
    } else if (weapon.id === 'flamethrower') {
      const muzzleX = x + Math.cos(turretAngle) * 28;
      const muzzleY = y + Math.sin(turretAngle) * 28;
      const spread = (Math.random() - 0.5) * weapon.spread;
      this.spawnBullet(muzzleX, muzzleY, turretAngle + spread, weapon.speed, dmg, true, weapon.range, weapon.color, 9.0, 'flamethrower', vx * 0.5, vy * 0.5);
    }

    return true;
  }

  public fireEnemyWeapon(
    x: number,
    y: number,
    angle: number,
    damage: number,
    speed: number,
    range: number,
    color = '#f87171',
    radius = 3.5,
    type: WeaponType = 'vulcan'
  ): void {
    this.spawnBullet(x, y, angle, speed, damage, false, range, color, radius, type, 0, 0);
  }

  private spawnBullet(
    x: number,
    y: number,
    angle: number,
    speed: number,
    damage: number,
    isPlayer: boolean,
    range: number,
    color: string,
    radius: number,
    type: WeaponType,
    inheritVx = 0,
    inheritVy = 0
  ): void {
    this.projectiles.push({
      x,
      y,
      vx: Math.cos(angle) * speed + inheritVx,
      vy: Math.sin(angle) * speed + inheritVy,
      damage,
      isPlayer,
      rangeRemaining: range,
      color,
      radius,
      type
    });
  }

  public update(dt: number, particleSystem: ParticleSystem, enemies: { x: number; y: number }[] = []): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];

      // Homing missile logic
      if (p.type === 'missile' && p.isPlayer && enemies.length > 0) {
        let closestDist = Infinity;
        let target: { x: number; y: number } | null = null;
        for (const e of enemies) {
          const d = Math.hypot(e.x - p.x, e.y - p.y);
          if (d < 550 && d < closestDist) {
            closestDist = d;
            target = e;
          }
        }

        if (target) {
          const targetAngle = Math.atan2(target.y - p.y, target.x - p.x);
          const currentAngle = Math.atan2(p.vy, p.vx);
          let diff = targetAngle - currentAngle;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;

          const turnRate = 4.5 * dt;
          const newAngle = currentAngle + Math.sign(diff) * Math.min(Math.abs(diff), turnRate);
          const currentSpeed = Math.hypot(p.vx, p.vy);

          p.vx = Math.cos(newAngle) * currentSpeed;
          p.vy = Math.sin(newAngle) * currentSpeed;
        }

        // Missile smoke trail
        if (Math.random() > 0.4) {
          particleSystem.addDust(p.x, p.y, -p.vx * 0.1, -p.vy * 0.1, 4);
        }
      }

      // Flamethrower expansion
      if (p.type === 'flamethrower') {
        p.radius += 18 * dt;
        if (Math.random() > 0.6) {
          particleSystem.addDust(p.x, p.y, 0, 0, 5);
        }
      }

      const stepDist = Math.hypot(p.vx * dt, p.vy * dt);
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rangeRemaining -= stepDist;

      if (p.rangeRemaining <= 0) {
        if (p.type === 'flak' || p.type === 'missile') {
          particleSystem.addExplosion(p.x, p.y, 0.6);
        }
        this.projectiles.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    for (let i = 0; i < this.projectiles.length; i++) {
      const p = this.projectiles[i];
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = p.isPlayer ? 8 : 4;

      if (p.type === 'vulcan') {
        const angle = Math.atan2(p.vy, p.vx);
        ctx.translate(p.x, p.y);
        ctx.rotate(angle);
        ctx.fillRect(-6, -p.radius / 2, 12, p.radius);
      } else if (p.type === 'plasma') {
        const angle = Math.atan2(p.vy, p.vx);
        ctx.translate(p.x, p.y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, 16, p.radius, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'missile') {
        const angle = Math.atan2(p.vy, p.vx);
        ctx.translate(p.x, p.y);
        ctx.rotate(angle);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-10, -3, 20, 6);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(10, 0, 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  public clear(): void {
    this.projectiles = [];
  }
}
