import { EnemyType } from '../../types/game';
import { ParticleSystem } from '../systems/ParticleSystem';
import { WeaponSystem } from '../systems/WeaponSystem';
import { LootSystem } from '../systems/LootSystem';
import { SoundSynthesizer } from '../audio/SoundSynthesizer';

export class Enemy {
  public x: number;
  public y: number;
  public vx: number = 0;
  public vy: number = 0;
  public angle: number = 0;
  public type: EnemyType;

  public hp: number;
  public maxHp: number;
  public speed: number;
  public turnSpeed: number;
  public mass: number;
  public radius: number;
  public width: number;
  public length: number;

  public isBoss: boolean = false;
  public bossTitle?: string;

  private fireCooldown: number = 0;
  private shootInterval: number = 1.2;
  private attackRange: number = 550;
  private preferredDistance: number = 220;

  // Boss specific state
  private bossPhase: number = 1;
  private specialAttackTimer: number = 0;

  constructor(x: number, y: number, type: EnemyType, difficultyMultiplier = 1.0) {
    this.x = x;
    this.y = y;
    this.type = type;

    switch (type) {
      case 'scout_buggy':
        this.width = 34;
        this.length = 50;
        this.radius = 28;
        this.maxHp = Math.round(65 * difficultyMultiplier);
        this.speed = 460;
        this.turnSpeed = 3.5;
        this.mass = 800;
        this.shootInterval = 1.1;
        this.preferredDistance = 180;
        break;

      case 'raider_truck':
        this.width = 46;
        this.length = 68;
        this.radius = 38;
        this.maxHp = Math.round(160 * difficultyMultiplier);
        this.speed = 360;
        this.turnSpeed = 2.4;
        this.mass = 2200;
        this.shootInterval = 1.6;
        this.preferredDistance = 280;
        break;

      case 'rocket_chaser':
        this.width = 38;
        this.length = 58;
        this.radius = 32;
        this.maxHp = Math.round(110 * difficultyMultiplier);
        this.speed = 400;
        this.turnSpeed = 2.8;
        this.mass = 1200;
        this.shootInterval = 2.4;
        this.preferredDistance = 420;
        break;

      case 'sand_crawler':
        this.width = 32;
        this.length = 42;
        this.radius = 24;
        this.maxHp = Math.round(45 * difficultyMultiplier);
        this.speed = 500;
        this.turnSpeed = 4.2;
        this.mass = 600;
        this.shootInterval = 999; // Melee rammer
        this.preferredDistance = 0;
        break;

      case 'boss_war_rig':
        this.isBoss = true;
        this.bossTitle = 'DUNE BEHEMOTH: WAR RIG';
        this.width = 80;
        this.length = 150;
        this.radius = 85;
        this.maxHp = Math.round(1800 * difficultyMultiplier);
        this.speed = 280;
        this.turnSpeed = 1.4;
        this.mass = 12000;
        this.shootInterval = 0.5;
        this.preferredDistance = 260;
        break;

      case 'boss_sand_worm':
        this.isBoss = true;
        this.bossTitle = 'THE GREAT DUNE DEVOURER';
        this.width = 90;
        this.length = 180;
        this.radius = 95;
        this.maxHp = Math.round(2400 * difficultyMultiplier);
        this.speed = 340;
        this.turnSpeed = 1.8;
        this.mass = 16000;
        this.shootInterval = 1.8;
        this.preferredDistance = 150;
        break;

      case 'zombie_walker':
        this.width = 24;
        this.length = 32;
        this.radius = 20;
        this.maxHp = Math.round(55 * difficultyMultiplier);
        this.speed = 380;
        this.turnSpeed = 4.8;
        this.mass = 350;
        this.shootInterval = 999; // Melee claw attacker
        this.preferredDistance = 0;
        break;

      case 'zombie_spitter':
        this.width = 30;
        this.length = 38;
        this.radius = 26;
        this.maxHp = Math.round(85 * difficultyMultiplier);
        this.speed = 320;
        this.turnSpeed = 3.2;
        this.mass = 650;
        this.shootInterval = 1.9;
        this.preferredDistance = 320;
        break;

      case 'zombie_brute':
        this.width = 54;
        this.length = 66;
        this.radius = 42;
        this.maxHp = Math.round(380 * difficultyMultiplier);
        this.speed = 290;
        this.turnSpeed = 2.2;
        this.mass = 3500;
        this.shootInterval = 999;
        this.preferredDistance = 0;
        break;

      case 'boss_mutant_colossus':
        this.isBoss = true;
        this.bossTitle = 'NIGHTMARE COLOSSUS';
        this.width = 85;
        this.length = 120;
        this.radius = 80;
        this.maxHp = Math.round(2600 * difficultyMultiplier);
        this.speed = 290;
        this.turnSpeed = 1.6;
        this.mass = 14000;
        this.shootInterval = 1.2;
        this.preferredDistance = 120;
        break;
    }

    this.hp = this.maxHp;
    this.fireCooldown = Math.random() * this.shootInterval;
  }

  public update(
    dt: number,
    playerX: number,
    playerY: number,
    playerVx: number,
    playerVy: number,
    weaponSystem: WeaponSystem,
    particleSystem: ParticleSystem,
    otherEnemies: Enemy[] = []
  ): void {
    if (this.hp <= 0) return;

    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const distToPlayer = Math.hypot(dx, dy);

    // AI steering target calculation
    let desiredAngle = Math.atan2(dy, dx);

    // Orbit / circling maneuver when within combat range
    if (distToPlayer < this.preferredDistance + 60 && distToPlayer > this.preferredDistance - 60) {
      // Circle tangentially
      desiredAngle += Math.PI / 2;
    } else if (distToPlayer < this.preferredDistance - 80) {
      // Too close: back off or circle away
      desiredAngle = Math.atan2(-dy, -dx);
    }

    // Separation avoidance from other nearby enemy vehicles
    let sepX = 0;
    let sepY = 0;
    for (let i = 0; i < otherEnemies.length; i++) {
      const other = otherEnemies[i];
      if (other === this) continue;
      const ox = this.x - other.x;
      const oy = this.y - other.y;
      const od = Math.hypot(ox, oy);
      if (od > 0 && od < this.radius + other.radius + 30) {
        sepX += (ox / od) * 120;
        sepY += (oy / od) * 120;
      }
    }
    if (sepX !== 0 || sepY !== 0) {
      desiredAngle = Math.atan2(Math.sin(desiredAngle) + sepY * 0.01, Math.cos(desiredAngle) + sepX * 0.01);
    }

    // Smoothly turn vehicle towards desired heading
    let angleDiff = desiredAngle - this.angle;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

    const maxTurnThisFrame = this.turnSpeed * dt;
    this.angle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), maxTurnThisFrame);

    // Drive forward along heading
    const forwardX = Math.cos(this.angle);
    const forwardY = Math.sin(this.angle);

    let currentDriveSpeed = this.speed;
    // Slow down if making a sharp turn
    if (Math.abs(angleDiff) > Math.PI / 3) {
      currentDriveSpeed *= 0.65;
    }

    this.vx += (forwardX * currentDriveSpeed - this.vx) * Math.min(1, 4 * dt);
    this.vy += (forwardY * currentDriveSpeed - this.vy) * Math.min(1, 4 * dt);

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Dust particles
    if (Math.random() > 0.6) {
      particleSystem.addDust(this.x - forwardX * (this.length * 0.4), this.y - forwardY * (this.length * 0.4), -this.vx * 0.2, -this.vy * 0.2, 5);
    }

    // Weapons / Shooting AI
    this.fireCooldown -= dt;
    if (this.fireCooldown <= 0 && distToPlayer < this.attackRange) {
      this.fireCooldown = this.shootInterval;

      // Predictive aiming lead
      const bulletSpeed = 650;
      const travelTime = distToPlayer / bulletSpeed;
      const leadX = playerX + playerVx * travelTime * 0.8;
      const leadY = playerY + playerVy * travelTime * 0.8;
      const aimAngle = Math.atan2(leadY - this.y, leadX - this.x);

      if (this.type === 'scout_buggy') {
        weaponSystem.fireEnemyWeapon(this.x, this.y, aimAngle, 12, 600, 500, '#f87171', 3.5, 'vulcan');
      } else if (this.type === 'raider_truck') {
        weaponSystem.fireEnemyWeapon(this.x, this.y, aimAngle, 22, 620, 600, '#fb923c', 5.0, 'vulcan');
      } else if (this.type === 'rocket_chaser') {
        weaponSystem.fireEnemyWeapon(this.x, this.y, aimAngle, 38, 480, 750, '#f43f5e', 6.0, 'missile');
      } else if (this.type === 'boss_war_rig') {
        // Multi-barrel spread & heavy barrage
        weaponSystem.fireEnemyWeapon(this.x, this.y, aimAngle - 0.18, 25, 620, 700, '#fbbf24', 5.0, 'vulcan');
        weaponSystem.fireEnemyWeapon(this.x, this.y, aimAngle, 30, 650, 750, '#ef4444', 6.5, 'flak');
        weaponSystem.fireEnemyWeapon(this.x, this.y, aimAngle + 0.18, 25, 620, 700, '#fbbf24', 5.0, 'vulcan');
      } else if (this.type === 'boss_sand_worm') {
        // Acid spray burst
        for (let i = -2; i <= 2; i++) {
          weaponSystem.fireEnemyWeapon(this.x, this.y, aimAngle + i * 0.14, 28, 520, 600, '#84cc16', 7.0, 'plasma');
        }
      } else if (this.type === 'zombie_spitter') {
        // Acid bile spit
        weaponSystem.fireEnemyWeapon(this.x, this.y, aimAngle, 24, 460, 520, '#4ade80', 5.5, 'plasma');
      } else if (this.type === 'boss_mutant_colossus') {
        // Shockwave toxic bolts
        for (let i = -1; i <= 1; i++) {
          weaponSystem.fireEnemyWeapon(this.x, this.y, aimAngle + i * 0.22, 35, 540, 650, '#a855f7', 8.0, 'flak');
        }
      }
    }

    // Boss special attack timer
    if (this.isBoss) {
      this.specialAttackTimer += dt;
      if (this.specialAttackTimer > 8) {
        this.specialAttackTimer = 0;
        particleSystem.addExplosion(this.x, this.y, 1.2);
        SoundSynthesizer.playWarning();
      }
    }
  }

  public takeDamage(damage: number, particleSystem: ParticleSystem): boolean {
    this.hp -= damage;
    particleSystem.addSparks(this.x, this.y, 4);

    if (this.hp <= 0) {
      SoundSynthesizer.playExplosion(this.isBoss ? 'large' : 'small');
      particleSystem.addExplosion(this.x, this.y, this.isBoss ? 2.5 : 1.0);
      return true; // Destroyed
    }
    return false;
  }

  public dropLoot(lootSystem: LootSystem): void {
    if (this.type === 'scout_buggy') {
      lootSystem.spawnCluster(this.x, this.y, 35, 20);
    } else if (this.type === 'raider_truck') {
      lootSystem.spawnCluster(this.x, this.y, 90, 50);
    } else if (this.type === 'rocket_chaser') {
      lootSystem.spawnCluster(this.x, this.y, 75, 40);
    } else if (this.type === 'sand_crawler') {
      lootSystem.spawnCluster(this.x, this.y, 25, 15);
    } else if (this.type === 'zombie_walker') {
      lootSystem.spawnCluster(this.x, this.y, 20, 10);
    } else if (this.type === 'zombie_spitter') {
      lootSystem.spawnCluster(this.x, this.y, 45, 25);
    } else if (this.type === 'zombie_brute') {
      lootSystem.spawnCluster(this.x, this.y, 110, 60);
      lootSystem.spawnDrop(this.x, this.y, 'repair', 35);
    } else if (this.isBoss) {
      // Massive boss reward fountain
      lootSystem.spawnCluster(this.x, this.y, 650, 350, true);
      lootSystem.spawnDrop(this.x + 30, this.y + 20, 'fuel', 100);
      lootSystem.spawnDrop(this.x - 30, this.y - 20, 'repair', 100);
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    const halfW = this.width / 2;
    const halfL = this.length / 2;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(3, 5, halfL + 3, halfW + 3, 0, 0, Math.PI * 2);
    ctx.fill();

    if (this.type === 'scout_buggy') {
      // Fast raider buggy
      ctx.fillStyle = '#1c1917';
      // Tires
      ctx.fillRect(-halfL * 0.7, -halfW - 5, halfL * 0.5, 6);
      ctx.fillRect(-halfL * 0.7, halfW - 1, halfL * 0.5, 6);
      ctx.fillRect(halfL * 0.2, -halfW - 5, halfL * 0.5, 6);
      ctx.fillRect(halfL * 0.2, halfW - 1, halfL * 0.5, 6);

      // Body (Rust Crimson)
      ctx.fillStyle = '#b91c1c';
      ctx.strokeStyle = '#450a0a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(halfL, 0);
      ctx.lineTo(halfL * 0.4, -halfW);
      ctx.lineTo(-halfL, -halfW * 0.7);
      ctx.lineTo(-halfL, halfW * 0.7);
      ctx.lineTo(halfL * 0.4, halfW);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Gun Mount
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, -3, 20, 6);
    } else if (this.type === 'raider_truck') {
      // Heavy Raider Truck with armored plates
      ctx.fillStyle = '#18181b';
      // 6 Heavy Wheels
      ctx.fillRect(-halfL * 0.8, -halfW - 6, 16, 7);
      ctx.fillRect(-halfL * 0.8, halfW - 1, 16, 7);
      ctx.fillRect(-halfL * 0.2, -halfW - 6, 16, 7);
      ctx.fillRect(-halfL * 0.2, halfW - 1, 16, 7);
      ctx.fillRect(halfL * 0.4, -halfW - 6, 16, 7);
      ctx.fillRect(halfL * 0.4, halfW - 1, 16, 7);

      // Armored Chassis (Desert Camo Olive)
      ctx.fillStyle = '#854d0e';
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2;
      ctx.fillRect(-halfL, -halfW, this.length, this.width);
      ctx.strokeRect(-halfL, -halfW, this.length, this.width);

      // Heavy Ramming Grill
      ctx.fillStyle = '#292524';
      ctx.fillRect(halfL - 2, -halfW * 0.85, 6, this.width * 0.85);

      // Armored Gun Turret
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(4, -4, 28, 8);
    } else if (this.type === 'boss_war_rig') {
      // Massive War Rig Behemoth
      ctx.fillStyle = '#0f172a';
      // Heavy Tank Tracks / 8 Huge Bogie Wheels
      for (let w = -halfL * 0.8; w < halfL * 0.8; w += 28) {
        ctx.fillRect(w, -halfW - 10, 22, 11);
        ctx.fillRect(w, halfW - 1, 22, 11);
      }

      // Hull - Dark Gunmetal with Hazard Stripes
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 3;
      ctx.fillRect(-halfL, -halfW, this.length, this.width);
      ctx.strokeRect(-halfL, -halfW, this.length, this.width);

      // Hazard Yellow-Black Strips on Cowcatcher
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.moveTo(halfL, -halfW);
      ctx.lineTo(halfL + 20, 0);
      ctx.lineTo(halfL, halfW);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Triple Cannons
      ctx.fillStyle = '#020617';
      ctx.fillRect(10, -22, 45, 8);
      ctx.fillRect(15, -4, 52, 10);
      ctx.fillRect(10, 14, 45, 8);
    } else if (this.type === 'boss_sand_worm') {
      // Segmented Sand Worm
      ctx.fillStyle = '#78350f';
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 3;

      // Segments
      for (let s = -halfL; s <= halfL; s += 24) {
        const segRadius = halfW * (1 - Math.abs(s / halfL) * 0.4);
        ctx.beginPath();
        ctx.arc(s, 0, segRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Maw / Teeth
      ctx.fillStyle = '#fef08a';
      for (let t = -3; t <= 3; t++) {
        ctx.beginPath();
        ctx.arc(halfL + 8, t * 10, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (this.type === 'zombie_walker') {
      // Night Mutant Shambler / Ghoul
      ctx.fillStyle = '#3f6212'; // Rotting flesh green
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 1.5;

      // Torso
      ctx.beginPath();
      ctx.ellipse(0, 0, halfL, halfW, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Flailing arms/claws
      ctx.strokeStyle = '#166534';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(halfL * 0.3, -halfW);
      ctx.lineTo(halfL + 4, -halfW - 6);
      ctx.moveTo(halfL * 0.3, halfW);
      ctx.lineTo(halfL + 4, halfW + 6);
      ctx.stroke();

      // Glowing feral red eyes
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(halfL * 0.5, -4, 2.5, 0, Math.PI * 2);
      ctx.arc(halfL * 0.5, 4, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'zombie_spitter') {
      // Biohazard Acid Spitter
      ctx.fillStyle = '#15803d';
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;

      // Bulbous venom sac
      ctx.beginPath();
      ctx.ellipse(-halfL * 0.2, 0, halfL * 0.8, halfW, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Glowing acid throat
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.arc(halfL * 0.6, 0, 6, 0, Math.PI * 2);
      ctx.fill();

      // Sickly yellow eyes
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(halfL * 0.5, -5, 3, 0, Math.PI * 2);
      ctx.arc(halfL * 0.5, 5, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'zombie_brute') {
      // Hulking Armored Mutant Juggernaut
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;

      // Heavy shoulders
      ctx.fillRect(-halfL, -halfW, this.length, this.width);
      ctx.strokeRect(-halfL, -halfW, this.length, this.width);

      // Spine mutations / spikes
      ctx.fillStyle = '#ef4444';
      for (let sp = -halfL * 0.6; sp <= halfL * 0.6; sp += 14) {
        ctx.beginPath();
        ctx.moveTo(sp, -halfW - 5);
        ctx.lineTo(sp + 4, -halfW);
        ctx.lineTo(sp - 4, -halfW);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(sp, halfW + 5);
        ctx.lineTo(sp + 4, halfW);
        ctx.lineTo(sp - 4, halfW);
        ctx.fill();
      }

      // Bloodthirsty glowing eyes
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(halfL * 0.7, -7, 4, 0, Math.PI * 2);
      ctx.arc(halfL * 0.7, 7, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'boss_mutant_colossus') {
      // Massive Night Boss Colossus
      ctx.fillStyle = '#09090b';
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 3.5;

      // Giant mutated body
      ctx.beginPath();
      ctx.ellipse(0, 0, halfL, halfW, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Bioluminescent purple spikes
      ctx.fillStyle = '#c084fc';
      for (let b = 0; b < 8; b++) {
        const ang = (b * Math.PI * 2) / 8;
        const bx = Math.cos(ang) * halfL * 0.9;
        const by = Math.sin(ang) * halfW * 0.9;
        ctx.beginPath();
        ctx.arc(bx, by, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Multiple demonic red eyes
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(halfL * 0.7, -12, 4, 0, Math.PI * 2);
      ctx.arc(halfL * 0.8, -4, 4, 0, Math.PI * 2);
      ctx.arc(halfL * 0.8, 4, 4, 0, Math.PI * 2);
      ctx.arc(halfL * 0.7, 12, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Default / crawler
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // Render Health Bar over damaged enemies
    if (this.hp < this.maxHp) {
      const barWidth = this.isBoss ? 110 : 44;
      const barHeight = this.isBoss ? 8 : 4;
      const barX = this.x - barWidth / 2;
      const barY = this.y - this.radius - (this.isBoss ? 26 : 14);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

      const hpRatio = Math.max(0, this.hp / this.maxHp);
      ctx.fillStyle = this.isBoss ? '#ef4444' : (hpRatio > 0.4 ? '#22c55e' : '#f97316');
      ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);
    }
  }
}
