import { GameState, SaveData, WeaponType, EnemyType, WeaponDefinition } from '../../types/game';
import { INITIAL_VEHICLES, INITIAL_WEAPONS } from '../data/gameData';
import { MapSector, GAME_MAPS, getMapById } from '../data/mapsData';
import { SaveSystem } from '../storage/SaveSystem';
import { Vehicle } from '../entities/Vehicle';
import { Enemy } from '../entities/Enemy';
import { DesertMap } from '../systems/DesertMap';
import { Camera } from './Camera';
import { InputManager } from './InputManager';
import { WeaponSystem } from '../systems/WeaponSystem';
import { LootSystem } from '../systems/LootSystem';
import { ParticleSystem } from '../systems/ParticleSystem';
import { Collision } from '../systems/Collision';
import { MissionSystem } from '../systems/MissionSystem';
import { SoundSynthesizer } from '../audio/SoundSynthesizer';
import { OnlineServices } from '../network/OnlineServices';

export interface RunSummary {
  survivalTime: number;
  enemiesKilled: number;
  bossesKilled: number;
  coinsEarned: number;
  scrapEarned: number;
  distanceTraveled: number;
  causeOfDeath: 'FUEL_EXHAUSTION' | 'DESTROYED' | 'QUIT';
}

export type DayNightPhase = 'DAY' | 'DUSK' | 'NIGHT' | 'DAWN';

export interface TacticalStrike {
  targetX: number;
  targetY: number;
  delayRemaining: number;
  radius: number;
  damage: number;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  public state: GameState = 'MENU';
  public saveData: SaveData;
  public playerVehicle!: Vehicle;

  // Subsystems
  public map: DesertMap;
  public currentSector: MapSector;
  public camera: Camera;
  public input: InputManager;
  public weapons: WeaponSystem;
  public loot: LootSystem;
  public particles: ParticleSystem;

  // Entities
  public enemies: Enemy[] = [];

  // Day / Night Cycle
  public timeOfDay: number = 0; // 0 to 90 seconds cycle
  public readonly cycleDuration: number = 90; // 40s day, 10s dusk, 30s night, 10s dawn
  public dayNightPhase: DayNightPhase = 'DAY';
  public dayNightRatio: number = 0; // 0 (day) -> 1 (midnight)
  private nightGrowlTimer: number = 0;

  // Base Tactical Missile Strike
  public missileCooldown: number = 0;
  public missileMaxCooldown: number = 22;
  public activeStrikes: TacticalStrike[] = [];

  // Run statistics
  public runTime: number = 0;
  public enemiesKilled: number = 0;
  public bossesKilled: number = 0;
  public coinsEarnedThisRun: number = 0;
  public scrapEarnedThisRun: number = 0;
  public distanceTraveledThisRun: number = 0;
  private lastPlayerX: number = 0;
  private lastPlayerY: number = 0;

  // Wave & Spawning
  private spawnTimer: number = 0;
  private bossSpawned: boolean = false;
  private threatLevel: number = 1.0;

  // Perks
  private emergencyRepairUsed: boolean = false;

  // Dev Cheats
  public godMode: boolean = false;

  // Loop
  private animFrameId: number | null = null;
  private lastTimestamp: number = 0;
  private isRunning: boolean = false;

  // Callbacks
  public onHudUpdate?: () => void;
  public onGameOver?: (summary: RunSummary) => void;
  public onBossEncounter?: (bossName: string) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;
    this.saveData = SaveSystem.load();

    const selectedSectorId = this.saveData.settings.selectedMapId || 'dune_sea';
    this.currentSector = getMapById(selectedSectorId);
    this.map = new DesertMap(this.currentSector);

    this.camera = new Camera(canvas.width, canvas.height);
    this.input = new InputManager();
    this.weapons = new WeaponSystem();
    this.loot = new LootSystem();
    this.particles = new ParticleSystem(this.saveData.settings.particlesQuality);

    this.input.onPauseRequested = () => {
      if (this.state === 'PLAYING') {
        this.pauseGame();
      } else if (this.state === 'PAUSED') {
        this.resumeGame();
      }
    };

    this.input.onWeaponSelect = (index: number) => {
      const weaponIds: WeaponType[] = ['vulcan', 'plasma', 'flak', 'missile', 'flamethrower'];
      const targetId = weaponIds[index];
      if (targetId && this.saveData.unlockedWeaponIds.includes(targetId)) {
        this.saveData.activeWeaponId = targetId;
        SaveSystem.save(this.saveData);
        if (this.onHudUpdate) this.onHudUpdate();
      }
    };
  }

  public init(): void {
    this.input.attach();
    this.resizeCanvas();
    window.addEventListener('resize', this.handleResize);
  }

  public destroy(): void {
    this.stopLoop();
    this.input.detach();
    window.removeEventListener('resize', this.handleResize);
    SoundSynthesizer.stopEngine();
  }

  private handleResize = (): void => {
    this.resizeCanvas();
  };

  public resizeCanvas(): void {
    const parent = this.canvas.parentElement;
    const width = parent ? parent.clientWidth : window.innerWidth;
    const height = parent ? parent.clientHeight : window.innerHeight;

    const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 for mobile efficiency
    this.canvas.width = Math.floor(width * dpr);
    this.canvas.height = Math.floor(height * dpr);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ctx.scale(dpr, dpr);
    this.camera.resize(width, height);
  }

  public startNewRun(): void {
    this.saveData = SaveSystem.load();

    // Map sector
    const selectedSectorId = this.saveData.settings.selectedMapId || 'dune_sea';
    this.currentSector = getMapById(selectedSectorId);
    this.map.setSector(this.currentSector);

    // Find chosen vehicle
    const vehicleDef = INITIAL_VEHICLES.find(v => v.id === this.saveData.selectedVehicleId) || INITIAL_VEHICLES[0];
    this.playerVehicle = new Vehicle(vehicleDef, this.saveData.upgrades);

    // Apply sector friction & drift boost
    if (this.currentSector.frictionMultiplier !== 1.0) {
      this.playerVehicle.handling *= (1 / this.currentSector.frictionMultiplier);
    }

    // Apply outpost starting fuel depot bonus
    if (this.saveData.outpost.fuelDepotLevel > 0) {
      const extraFuelRatio = 1 + this.saveData.outpost.fuelDepotLevel * 0.25;
      this.playerVehicle.maxFuel *= extraFuelRatio;
      this.playerVehicle.fuel = this.playerVehicle.maxFuel;
    }

    // Reset run tracking
    this.playerVehicle.x = 0;
    this.playerVehicle.y = 0;
    this.lastPlayerX = 0;
    this.lastPlayerY = 0;

    this.enemies = [];
    this.weapons.clear();
    this.loot.clear();
    this.particles.clear();

    this.runTime = 0;
    this.timeOfDay = 0;
    this.dayNightPhase = 'DAY';
    this.dayNightRatio = 0;
    this.nightGrowlTimer = 0;

    // Missile recharge time (reduced by outpost radar array level)
    const radarLevel = this.saveData.outpost.radarArrayLevel || 0;
    this.missileMaxCooldown = Math.max(12, 24 - radarLevel * 3);
    this.missileCooldown = 4; // Short starting delay before first strike is ready
    this.activeStrikes = [];

    this.enemiesKilled = 0;
    this.bossesKilled = 0;
    this.coinsEarnedThisRun = 0;
    this.scrapEarnedThisRun = 0;
    this.distanceTraveledThisRun = 0;
    this.spawnTimer = 0;
    this.bossSpawned = false;
    this.threatLevel = 1.0;
    this.emergencyRepairUsed = false;

    this.state = 'PLAYING';
    SoundSynthesizer.resumeContext();

    this.startLoop();
  }

  public pauseGame(): void {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      SoundSynthesizer.stopEngine();
    }
  }

  public resumeGame(): void {
    if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.lastTimestamp = performance.now();
      SoundSynthesizer.resumeContext();
    }
  }

  private startLoop(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTimestamp = performance.now();
    this.loop(this.lastTimestamp);
  }

  private stopLoop(): void {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private loop = (timestamp: number): void => {
    if (!this.isRunning) return;

    let dt = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;

    // Cap delta time to prevent physics clipping through terrain
    if (dt > 0.1) dt = 0.1;

    if (this.state === 'PLAYING') {
      this.update(dt);
    }

    this.render();

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  private update(dt: number): void {
    this.runTime += dt;
    this.threatLevel = 1.0 + (this.runTime / 90) * 0.5;

    // Day / Night Cycle Progression
    // Cycle: 0..42s Day, 42..52s Dusk, 52..80s Night (Zombies!), 80..90s Dawn
    this.timeOfDay = (this.timeOfDay + dt) % this.cycleDuration;
    if (this.timeOfDay < 42) {
      this.dayNightPhase = 'DAY';
      this.dayNightRatio = 0;
    } else if (this.timeOfDay < 52) {
      this.dayNightPhase = 'DUSK';
      this.dayNightRatio = (this.timeOfDay - 42) / 10;
    } else if (this.timeOfDay < 80) {
      this.dayNightPhase = 'NIGHT';
      this.dayNightRatio = 1.0;
    } else {
      this.dayNightPhase = 'DAWN';
      this.dayNightRatio = 1 - (this.timeOfDay - 80) / 10;
    }

    // Night ambient zombie audio
    if (this.dayNightPhase === 'NIGHT') {
      this.nightGrowlTimer -= dt;
      if (this.nightGrowlTimer <= 0) {
        this.nightGrowlTimer = 6 + Math.random() * 5;
        SoundSynthesizer.playZombieGrowl();
      }
    }

    // Base Tactical Missile cooldown & activation
    if (this.missileCooldown > 0) {
      this.missileCooldown -= dt;
    }
    if (this.input.isMissileRequested) {
      this.triggerBaseMissile();
    }

    // Update active tactical strikes
    for (let i = this.activeStrikes.length - 1; i >= 0; i--) {
      const strike = this.activeStrikes[i];
      strike.delayRemaining -= dt;
      if (strike.delayRemaining <= 0) {
        // Detonation!
        SoundSynthesizer.playMissileImpact();
        this.camera.addShake(22);
        this.particles.addExplosion(strike.targetX, strike.targetY, 3.2);

        // Blast radius damage
        for (let eIdx = this.enemies.length - 1; eIdx >= 0; eIdx--) {
          const enemy = this.enemies[eIdx];
          const dist = Math.hypot(enemy.x - strike.targetX, enemy.y - strike.targetY);
          if (dist <= strike.radius + enemy.radius) {
            const falloff = 1 - (dist / (strike.radius + enemy.radius)) * 0.4;
            const dmg = Math.round(strike.damage * falloff);
            const isDead = enemy.takeDamage(dmg, this.particles);
            if (isDead) {
              this.enemiesKilled++;
              MissionSystem.checkProgress(this.saveData, 'kills', 1);
              if (enemy.isBoss) {
                this.bossesKilled++;
                MissionSystem.checkProgress(this.saveData, 'boss', 1);
              }
              enemy.dropLoot(this.loot);
              this.enemies.splice(eIdx, 1);
            }
          }
        }
        this.activeStrikes.splice(i, 1);
      }
    }

    // 1. Calculate distance traveled
    const dStep = Math.hypot(this.playerVehicle.x - this.lastPlayerX, this.playerVehicle.y - this.lastPlayerY);
    this.distanceTraveledThisRun += dStep;
    this.lastPlayerX = this.playerVehicle.x;
    this.lastPlayerY = this.playerVehicle.y;

    MissionSystem.checkProgress(this.saveData, 'distance', Math.round(dStep));
    MissionSystem.checkProgress(this.saveData, 'survival_time', Math.round(dt));

    // 2. Mouse aim in world coordinates
    const worldMouse = this.camera.screenToWorld(this.input.mouseX, this.input.mouseY);

    // If mobile joystick is active, aim in direction of driving or nearest enemy
    let aimX = worldMouse.x;
    let aimY = worldMouse.y;
    if (this.input.joystick.active && !this.input.isMouseDown) {
      aimX = this.playerVehicle.x + Math.cos(this.playerVehicle.angle) * 300;
      aimY = this.playerVehicle.y + Math.sin(this.playerVehicle.angle) * 300;
    }

    // 3. Update Player Vehicle
    this.playerVehicle.update(
      dt,
      this.input.throttle,
      this.input.steer,
      this.input.isBoosting,
      this.input.isHandbraking,
      aimX,
      aimY,
      this.particles
    );

    // Outpost field repair bay check
    if (
      this.saveData.outpost.repairBayLevel > 0 &&
      !this.emergencyRepairUsed &&
      this.playerVehicle.hp < this.playerVehicle.maxHp * 0.25
    ) {
      this.emergencyRepairUsed = true;
      const healAmount = Math.round(this.playerVehicle.maxHp * 0.20 * this.saveData.outpost.repairBayLevel);
      this.playerVehicle.repair(healAmount);
      this.particles.addSparks(this.playerVehicle.x, this.playerVehicle.y, 16);
      SoundSynthesizer.playPickup('repair');
    }

    // Player Shooting
    if (this.input.isFiring) {
      const activeDef = INITIAL_WEAPONS[this.saveData.activeWeaponId] || INITIAL_WEAPONS.vulcan;
      this.weapons.firePlayerWeapon(
        activeDef,
        this.playerVehicle.x,
        this.playerVehicle.y,
        this.playerVehicle.angle,
        this.playerVehicle.turretAngle,
        this.playerVehicle.vx,
        this.playerVehicle.vy,
        this.particles,
        this.playerVehicle.damageMultiplier
      );
    }

    // 4. Update Camera
    this.camera.update(
      this.playerVehicle.x,
      this.playerVehicle.y,
      this.playerVehicle.vx,
      this.playerVehicle.vy,
      dt
    );

    // 5. Enemy Spawning Loop
    this.spawnTimer += dt;
    const spawnInterval = Math.max(1.8, 4.5 - this.threatLevel * 0.6);
    const maxActiveEnemies = Math.min(18, 5 + Math.floor(this.threatLevel * 2.5));

    if (this.spawnTimer >= spawnInterval && this.enemies.length < maxActiveEnemies) {
      this.spawnTimer = 0;
      this.spawnRandomEnemy();
    }

    // Boss trigger at 110s survival or sector distance
    if (!this.bossSpawned && (this.runTime > 110 || this.distanceTraveledThisRun > 5000)) {
      this.spawnBoss('boss_war_rig');
    }

    // 6. Update Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(
        dt,
        this.playerVehicle.x,
        this.playerVehicle.y,
        this.playerVehicle.vx,
        this.playerVehicle.vy,
        this.weapons,
        this.particles,
        this.enemies
      );

      // Despawn enemies left way too far behind (unless boss)
      const distFromPlayer = Math.hypot(enemy.x - this.playerVehicle.x, enemy.y - this.playerVehicle.y);
      if (distFromPlayer > 2200 && !enemy.isBoss) {
        this.enemies.splice(i, 1);
      }
    }

    // 7. Update Weapons / Projectiles & Collisions
    const enemyPositions = this.enemies.map(e => ({ x: e.x, y: e.y }));
    this.weapons.update(dt, this.particles, enemyPositions);

    // Check Projectile Collisions
    for (let pIdx = this.weapons.projectiles.length - 1; pIdx >= 0; pIdx--) {
      const proj = this.weapons.projectiles[pIdx];

      if (proj.isPlayer) {
        // Test against enemies
        let hit = false;
        for (let eIdx = this.enemies.length - 1; eIdx >= 0; eIdx--) {
          const enemy = this.enemies[eIdx];
          const dist = Math.hypot(enemy.x - proj.x, enemy.y - proj.y);
          if (dist <= enemy.radius + proj.radius) {
            hit = true;
            this.camera.addShake(2.5);
            const isDead = enemy.takeDamage(proj.damage, this.particles);

            if (isDead) {
              this.enemiesKilled++;
              MissionSystem.checkProgress(this.saveData, 'kills', 1);
              if (enemy.type.startsWith('zombie_')) {
                MissionSystem.checkProgress(this.saveData, 'zombies', 1);
              }

              if (enemy.isBoss) {
                this.bossesKilled++;
                MissionSystem.checkProgress(this.saveData, 'boss', 1);
                this.camera.addShake(14);
              }

              enemy.dropLoot(this.loot);
              this.enemies.splice(eIdx, 1);
            }
            break;
          }
        }

        if (hit) {
          this.weapons.projectiles.splice(pIdx, 1);
          continue;
        }
      } else {
        // Enemy projectile vs Player
        const pDist = Math.hypot(this.playerVehicle.x - proj.x, this.playerVehicle.y - proj.y);
        if (pDist <= this.playerVehicle.radius + proj.radius) {
          this.weapons.projectiles.splice(pIdx, 1);
          this.camera.addShake(4);

          if (!this.godMode) {
            this.playerVehicle.takeDamage(proj.damage);
            this.particles.addSparks(this.playerVehicle.x, this.playerVehicle.y, 6);
          }
        }
      }
    }

    // 8. Vehicle vs Obstacle Collisions
    const nearbyObstacles = this.map.getObstaclesNear(this.playerVehicle.x, this.playerVehicle.y, this.playerVehicle.radius + 60);
    for (const obs of nearbyObstacles) {
      const dx = this.playerVehicle.x - obs.x;
      const dy = this.playerVehicle.y - obs.y;
      const dist = Math.hypot(dx, dy);
      const minSafeDist = this.playerVehicle.radius + obs.radius;

      if (dist < minSafeDist) {
        // Bounce player off rock/ruin
        const nx = dx / (dist || 1);
        const ny = dy / (dist || 1);
        const overlap = minSafeDist - dist;

        this.playerVehicle.x += nx * overlap;
        this.playerVehicle.y += ny * overlap;

        const impactSpeed = Math.abs(this.playerVehicle.vx * nx + this.playerVehicle.vy * ny);
        this.playerVehicle.vx = (this.playerVehicle.vx - 2 * (this.playerVehicle.vx * nx + this.playerVehicle.vy * ny) * nx) * 0.4;
        this.playerVehicle.vy = (this.playerVehicle.vy - 2 * (this.playerVehicle.vx * nx + this.playerVehicle.vy * ny) * ny) * 0.4;

        if (impactSpeed > 140) {
          this.camera.addShake(5);
          SoundSynthesizer.playExplosion('small');
          this.particles.addSparks(this.playerVehicle.x, this.playerVehicle.y, 10);
          if (!this.godMode) {
            this.playerVehicle.takeDamage(impactSpeed * 0.12);
          }
        }
      }
    }

    // 9. Vehicle vs Enemy Ramming Collisions
    for (const enemy of this.enemies) {
      const eDist = Math.hypot(enemy.x - this.playerVehicle.x, enemy.y - this.playerVehicle.y);
      if (eDist < enemy.radius + this.playerVehicle.radius) {
        const res = Collision.resolveBounce(this.playerVehicle, enemy);
        if (res.impactVelocity > 80) {
          this.camera.addShake(res.impactVelocity * 0.04);
          SoundSynthesizer.playExplosion('small');
          this.particles.addSparks((this.playerVehicle.x + enemy.x) / 2, (this.playerVehicle.y + enemy.y) / 2, 8);

          // Damage to enemy
          const enemyDead = enemy.takeDamage(res.impactVelocity * 0.45, this.particles);
          if (enemyDead) {
            this.enemiesKilled++;
            enemy.dropLoot(this.loot);
            const idx = this.enemies.indexOf(enemy);
            if (idx >= 0) this.enemies.splice(idx, 1);
          }

          // Damage to player
          if (!this.godMode) {
            this.playerVehicle.takeDamage(res.impactVelocity * 0.25);
          }
        }
      }
    }

    // 10. Update Loot & Collection
    this.loot.update(
      dt,
      this.playerVehicle.x,
      this.playerVehicle.y,
      this.playerVehicle.magnetRadius,
      (item) => {
        if (item.type === 'coin') {
          this.coinsEarnedThisRun += item.value;
          this.saveData.coins += item.value;
        } else if (item.type === 'scrap') {
          this.scrapEarnedThisRun += item.value;
          this.saveData.scrap += item.value;
          MissionSystem.checkProgress(this.saveData, 'scrap', item.value);
        } else if (item.type === 'fuel') {
          this.playerVehicle.refuel(item.value);
        } else if (item.type === 'repair') {
          this.playerVehicle.repair(item.value);
        }
      },
      this.particles
    );

    // 11. Update Particles & Skids
    this.particles.update(dt);

    // 12. Check Game Over Conditions
    if (this.playerVehicle.hp <= 0 || (this.playerVehicle.fuel <= 0 && this.playerVehicle.currentSpeed < 5)) {
      this.handleGameOver(this.playerVehicle.hp <= 0 ? 'DESTROYED' : 'FUEL_EXHAUSTION');
    }

    if (this.onHudUpdate) {
      this.onHudUpdate();
    }
  }

  public triggerBaseMissile(): boolean {
    if (this.missileCooldown > 0 || !this.playerVehicle) return false;
    this.missileCooldown = this.missileMaxCooldown;
    MissionSystem.checkProgress(this.saveData, 'missile_strike', 1);

    SoundSynthesizer.playMissileSiren();

    // Acquire best target (prioritizes boss, then closest enemy cluster)
    let targetX = this.playerVehicle.x + Math.cos(this.playerVehicle.angle) * 350;
    let targetY = this.playerVehicle.y + Math.sin(this.playerVehicle.angle) * 350;

    const boss = this.enemies.find(e => e.isBoss);
    if (boss && Math.hypot(boss.x - this.playerVehicle.x, boss.y - this.playerVehicle.y) < 1600) {
      targetX = boss.x;
      targetY = boss.y;
    } else if (this.enemies.length > 0) {
      let closestDist = Infinity;
      for (const e of this.enemies) {
        const d = Math.hypot(e.x - this.playerVehicle.x, e.y - this.playerVehicle.y);
        if (d < closestDist && d < 1200) {
          closestDist = d;
          targetX = e.x;
          targetY = e.y;
        }
      }
    }

    this.activeStrikes.push({
      targetX,
      targetY,
      delayRemaining: 0.95,
      radius: 340,
      damage: 650
    });

    return true;
  }

  public spawnRandomEnemy(): void {
    // Spawn in a ring around the player outside camera view
    const angle = Math.random() * Math.PI * 2;
    const distance = 850 + Math.random() * 300;
    const x = this.playerVehicle.x + Math.cos(angle) * distance;
    const y = this.playerVehicle.y + Math.sin(angle) * distance;

    const roll = Math.random();
    let type: EnemyType = 'scout_buggy';

    // Night Time = Zombie Horde Assault!
    if (this.dayNightPhase === 'NIGHT') {
      if (this.threatLevel > 2.2 && roll < 0.25) {
        type = 'zombie_brute';
      } else if (roll < 0.55) {
        type = 'zombie_spitter';
      } else {
        type = 'zombie_walker';
      }
      const zombie = new Enemy(x, y, type, this.threatLevel * 1.15);
      this.enemies.push(zombie);
      return;
    }

    // Day Time = Raider Patrols & War Convoys
    if (this.threatLevel > 2.2 && roll < 0.25) {
      type = 'rocket_chaser';
    } else if (this.threatLevel > 1.5 && roll < 0.55) {
      type = 'raider_truck';
    } else if (roll < 0.75) {
      type = 'scout_buggy';
    } else {
      type = 'sand_crawler';
    }

    const enemy = new Enemy(x, y, type, this.threatLevel);
    this.enemies.push(enemy);
  }

  public spawnBoss(bossType?: 'boss_war_rig' | 'boss_sand_worm' | 'boss_mutant_colossus'): void {
    this.bossSpawned = true;
    const angle = this.playerVehicle.angle + (Math.random() - 0.5) * 0.5;
    const distance = 950;
    const x = this.playerVehicle.x + Math.cos(angle) * distance;
    const y = this.playerVehicle.y + Math.sin(angle) * distance;

    let targetBoss = bossType;
    if (!targetBoss) {
      targetBoss = this.dayNightPhase === 'NIGHT' ? 'boss_mutant_colossus' : 'boss_war_rig';
    }

    const boss = new Enemy(x, y, targetBoss, 1.0 + this.threatLevel * 0.3);
    this.enemies.push(boss);

    SoundSynthesizer.playWarning();
    this.camera.addShake(10);

    if (this.onBossEncounter) {
      this.onBossEncounter(boss.bossTitle || 'WAR BOSS');
    }
  }

  private handleGameOver(cause: 'FUEL_EXHAUSTION' | 'DESTROYED' | 'QUIT'): void {
    this.state = 'GAMEOVER';
    SoundSynthesizer.stopEngine();

    // Outpost passive income on run finish
    if (this.saveData.outpost.solarRefineryLevel > 0) {
      const passiveCoins = this.saveData.outpost.solarRefineryLevel * 30;
      const passiveScrap = this.saveData.outpost.solarRefineryLevel * 15;
      this.saveData.coins += passiveCoins;
      this.saveData.scrap += passiveScrap;
      this.coinsEarnedThisRun += passiveCoins;
      this.scrapEarnedThisRun += passiveScrap;
    }

    // Update persistent player statistics
    this.saveData.stats.totalRunsCount++;
    this.saveData.stats.totalDistanceTraveled += Math.round(this.distanceTraveledThisRun);
    this.saveData.stats.totalEnemiesDestroyed += this.enemiesKilled;
    this.saveData.stats.totalBossesDefeated += this.bossesKilled;
    this.saveData.stats.totalCoinsCollected += this.coinsEarnedThisRun;
    this.saveData.stats.totalScrapCollected += this.scrapEarnedThisRun;
    if (this.runTime > this.saveData.stats.longestSurvivalSeconds) {
      this.saveData.stats.longestSurvivalSeconds = Math.round(this.runTime);
    }

    SaveSystem.save(this.saveData);

    // Calculate score
    const runScore = Math.round(
      this.runTime * 12 +
      this.enemiesKilled * 150 +
      this.bossesKilled * 2500 +
      this.coinsEarnedThisRun * 2 +
      this.scrapEarnedThisRun * 3
    );

    // If online mode is active, submit score to global leaderboard
    if (this.saveData.settings.onlineModeEnabled || OnlineServices.isOnline()) {
      OnlineServices.submitRunScore(
        runScore,
        Math.round(this.runTime),
        this.bossesKilled,
        this.playerVehicle.def.name
      );
      OnlineServices.cloudSync(this.saveData);
    }

    const summary: RunSummary = {
      survivalTime: Math.round(this.runTime),
      enemiesKilled: this.enemiesKilled,
      bossesKilled: this.bossesKilled,
      coinsEarned: this.coinsEarnedThisRun,
      scrapEarned: this.scrapEarnedThisRun,
      distanceTraveled: Math.round(this.distanceTraveledThisRun),
      causeOfDeath: cause
    };

    if (this.onGameOver) {
      this.onGameOver(summary);
    }
  }

  private render(): void {
    const ctx = this.ctx;
    const viewW = this.camera.viewportWidth;
    const viewH = this.camera.viewportHeight;

    // Clear background
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, 0, viewW, viewH);

    // Begin Camera World Space
    this.camera.begin(ctx);

    // 1. Render Map Terrain & Dunes
    this.map.render(ctx, this.camera.x, this.camera.y, viewW, viewH);

    // 2. Render Skidmarks & Ground Particles
    this.particles.render(ctx);

    // 3. Render Loot Items
    this.loot.render(ctx);

    // 4. Render Enemies
    for (let i = 0; i < this.enemies.length; i++) {
      const enemy = this.enemies[i];
      if (this.camera.isVisible(enemy.x, enemy.y, enemy.radius + 30)) {
        enemy.render(ctx);
      }
    }

    // 5. Render Tactical Missile Target Beacons
    for (const strike of this.activeStrikes) {
      ctx.save();
      ctx.translate(strike.targetX, strike.targetY);

      // Concentric targeting rings
      const pulse = (1 - (strike.delayRemaining / 0.95));
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.arc(0, 0, strike.radius * (1 - pulse * 0.3), 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(-strike.radius * 0.4, 0);
      ctx.lineTo(strike.radius * 0.4, 0);
      ctx.moveTo(0, -strike.radius * 0.4);
      ctx.lineTo(0, strike.radius * 0.4);
      ctx.stroke();

      // Countdown warning text
      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`AIR STRIKE: ${strike.delayRemaining.toFixed(1)}s`, 0, -32);

      ctx.restore();
    }

    // 6. Render Player Vehicle & Headlights
    if (this.playerVehicle) {
      if (this.dayNightRatio > 0.08) {
        this.playerVehicle.renderHeadlights(ctx, this.currentSector.headlightColor);
      }
      this.playerVehicle.render(ctx);
    }

    // 7. Render Projectiles
    this.weapons.render(ctx);

    // End Camera World Space
    this.camera.end(ctx);

    // 8. Screen-Space Atmospheric Night/Dusk Lighting Vignette
    if (this.dayNightRatio > 0.02) {
      ctx.save();
      // Draw screen darkness overlay with radial soft cutout centered on player screen pos
      const screenCenterX = viewW / 2;
      const screenCenterY = viewH / 2;
      const nightAlpha = Math.min(0.82, this.dayNightRatio * 0.78);

      const radGrad = ctx.createRadialGradient(
        screenCenterX,
        screenCenterY,
        140,
        screenCenterX,
        screenCenterY,
        Math.max(viewW, viewH) * 0.85
      );
      radGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      radGrad.addColorStop(0.35, `rgba(5, 10, 22, ${nightAlpha * 0.45})`);
      radGrad.addColorStop(1, `rgba(4, 7, 18, ${nightAlpha})`);

      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, viewW, viewH);
      ctx.restore();
    }
  }

  // Debug / Admin Testing Helpers (Development Only)
  public cheatAddCoins(amount = 2000): void {
    this.saveData.coins += amount;
    SaveSystem.save(this.saveData);
  }

  public cheatAddScrap(amount = 1000): void {
    this.saveData.scrap += amount;
    SaveSystem.save(this.saveData);
  }

  public cheatFullFuel(): void {
    if (this.playerVehicle) {
      this.playerVehicle.fuel = this.playerVehicle.maxFuel;
      this.playerVehicle.boostTank = this.playerVehicle.maxBoost;
    }
  }

  public cheatRepair(): void {
    if (this.playerVehicle) {
      this.playerVehicle.hp = this.playerVehicle.maxHp;
    }
  }

  public cheatUnlockAll(): void {
    this.saveData.unlockedVehicleIds = INITIAL_VEHICLES.map(v => v.id);
    this.saveData.unlockedWeaponIds = Object.keys(INITIAL_WEAPONS) as WeaponType[];
    SaveSystem.save(this.saveData);
  }
}
