import { VehicleDefinition, UpgradeTree } from '../../types/game';
import { ParticleSystem } from '../systems/ParticleSystem';
import { SoundSynthesizer } from '../audio/SoundSynthesizer';

export class Vehicle {
  public x: number = 0;
  public y: number = 0;
  public vx: number = 0;
  public vy: number = 0;
  public angle: number = 0; // In radians (0 is pointing East/Right)
  public turretAngle: number = 0;

  // Stats
  public def: VehicleDefinition;
  public hp: number;
  public maxHp: number;
  public fuel: number;
  public maxFuel: number;
  public armor: number;
  public maxSpeed: number;
  public acceleration: number;
  public handling: number;
  public mass: number = 1200;
  public magnetRadius: number = 120;
  public damageMultiplier: number = 1.0;

  // State
  public isBoosting: boolean = false;
  public boostTank: number = 100;
  public maxBoost: number = 100;
  public isHandbraking: boolean = false;
  public currentSpeed: number = 0;

  // Dimensions for collision
  public width: number;
  public length: number;
  public radius: number;

  // Visual effects
  private lastSkidLeft: { x: number; y: number } | null = null;
  private lastSkidRight: { x: number; y: number } | null = null;

  constructor(def: VehicleDefinition, upgrades: UpgradeTree) {
    this.def = def;
    this.width = def.width;
    this.length = def.length;
    this.radius = Math.hypot(def.width, def.length) / 2;

    // Apply vehicle base stats + player upgrades
    const speedBoost = 1 + (upgrades.engineLevel * 0.12);
    const accelBoost = 1 + (upgrades.engineLevel * 0.15);
    const hpBoost = upgrades.armorLevel * 30;
    const armorBoost = Math.min(0.75, def.baseArmor + upgrades.armorLevel * 0.06);
    const fuelBoost = 1 + (upgrades.fuelTankLevel * 0.20);
    const handlingBoost = 1 + (upgrades.handlingLevel * 0.14);

    this.maxHp = def.baseHp + hpBoost;
    this.hp = this.maxHp;

    this.maxFuel = def.baseFuel * fuelBoost;
    this.fuel = this.maxFuel;

    this.armor = armorBoost;
    this.maxSpeed = def.baseSpeed * speedBoost;
    this.acceleration = def.baseAcceleration * accelBoost;
    this.handling = def.baseHandling * handlingBoost;
    this.magnetRadius = 120 + upgrades.magnetLevel * 45;
    this.damageMultiplier = 1 + upgrades.weaponPowerLevel * 0.15;
  }

  public update(
    dt: number,
    throttle: number,
    steer: number,
    boost: boolean,
    handbrake: boolean,
    targetAimX: number,
    targetAimY: number,
    particleSystem: ParticleSystem
  ): void {
    if (this.hp <= 0) return;

    // Aim turret towards cursor
    this.turretAngle = Math.atan2(targetAimY - this.y, targetAimX - this.x);

    // Boost handling
    const canBoost = boost && this.fuel > 2 && this.boostTank > 5 && throttle > 0;
    this.isBoosting = canBoost;

    if (this.isBoosting) {
      this.boostTank = Math.max(0, this.boostTank - 35 * dt);
      this.fuel = Math.max(0, this.fuel - 2.8 * dt);
    } else {
      this.boostTank = Math.min(this.maxBoost, this.boostTank + 18 * dt);
    }

    this.isHandbraking = handbrake;

    // Forward direction vector
    const forwardX = Math.cos(this.angle);
    const forwardY = Math.sin(this.angle);

    // Right / lateral direction vector
    const rightX = -Math.sin(this.angle);
    const rightY = Math.cos(this.angle);

    // Deconstruct velocity into forward and lateral components
    const forwardSpeed = this.vx * forwardX + this.vy * forwardY;
    const lateralSpeed = this.vx * rightX + this.vy * rightY;

    // Throttle & Acceleration
    let effectiveAccel = this.acceleration;
    let effectiveMaxSpeed = this.maxSpeed;

    if (this.isBoosting) {
      effectiveAccel *= 1.8;
      effectiveMaxSpeed *= 1.45;
    }

    // Fuel check
    if (this.fuel <= 0) {
      effectiveAccel *= 0.15; // Bare crawl on fumes
      effectiveMaxSpeed *= 0.25;
    } else if (throttle !== 0) {
      // Consume fuel while actively driving
      const burnRate = 0.85 + (this.isBoosting ? 2.5 : 0);
      this.fuel = Math.max(0, this.fuel - burnRate * dt);
    }

    // Drive forward/backward
    let newForwardSpeed = forwardSpeed;
    if (throttle > 0) {
      newForwardSpeed += effectiveAccel * throttle * dt;
      if (newForwardSpeed > effectiveMaxSpeed) {
        newForwardSpeed = effectiveMaxSpeed;
      }
    } else if (throttle < 0) {
      newForwardSpeed += (effectiveAccel * 0.6) * throttle * dt;
      const reverseMax = effectiveMaxSpeed * 0.45;
      if (newForwardSpeed < -reverseMax) {
        newForwardSpeed = -reverseMax;
      }
    } else {
      // Natural deceleration / rolling resistance in deep sand
      newForwardSpeed *= Math.pow(0.2, dt);
    }

    // Handbrake drag
    if (handbrake) {
      newForwardSpeed *= Math.pow(0.04, dt);
    }

    // Steering: turn faster when moving, inverted in reverse
    const speedRatio = Math.min(1, Math.abs(forwardSpeed) / 120);
    const reverseSign = forwardSpeed < -5 ? -1 : 1;
    const turnRate = 3.2 * this.handling * speedRatio * reverseSign;

    if (steer !== 0) {
      this.angle += steer * turnRate * dt;
    }

    // Lateral drift dampening (sand friction vs sliding)
    const driftGrip = handbrake ? 0.05 : (0.88 * this.handling);
    const newLateralSpeed = lateralSpeed * Math.pow(1 - driftGrip, dt * 8);

    // Reconstruct velocity vector
    const updatedForwardX = Math.cos(this.angle);
    const updatedForwardY = Math.sin(this.angle);
    const updatedRightX = -Math.sin(this.angle);
    const updatedRightY = Math.cos(this.angle);

    this.vx = updatedForwardX * newForwardSpeed + updatedRightX * newLateralSpeed;
    this.vy = updatedForwardY * newForwardSpeed + updatedRightY * newLateralSpeed;

    this.currentSpeed = Math.hypot(this.vx, this.vy);

    // Update position
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Dust particles from rear tires
    const rearDist = this.length * 0.4;
    const tireOffset = this.width * 0.4;
    const rearX = this.x - updatedForwardX * rearDist;
    const rearY = this.y - updatedForwardY * rearDist;

    const leftTireX = rearX + updatedRightX * tireOffset;
    const leftTireY = rearY + updatedRightY * tireOffset;
    const rightTireX = rearX - updatedRightX * tireOffset;
    const rightTireY = rearY - updatedRightY * tireOffset;

    if (this.currentSpeed > 60) {
      if (Math.random() > 0.3) {
        particleSystem.addDust(leftTireX, leftTireY, -this.vx * 0.2, -this.vy * 0.2, 5);
        particleSystem.addDust(rightTireX, rightTireY, -this.vx * 0.2, -this.vy * 0.2, 5);
      }
    }

    // Nitro exhaust fire
    if (this.isBoosting) {
      particleSystem.addNitroFlame(rearX, rearY, this.angle);
    }

    // Skid marks on sand when drifting or handbraking
    const isSkidding = (Math.abs(lateralSpeed) > 110 && this.currentSpeed > 90) || (handbrake && this.currentSpeed > 50);
    if (isSkidding) {
      if (this.lastSkidLeft) {
        particleSystem.addSkid(this.lastSkidLeft.x, this.lastSkidLeft.y, leftTireX, leftTireY, 0.4);
      }
      if (this.lastSkidRight) {
        particleSystem.addSkid(this.lastSkidRight.x, this.lastSkidRight.y, rightTireX, rightTireY, 0.4);
      }
      this.lastSkidLeft = { x: leftTireX, y: leftTireY };
      this.lastSkidRight = { x: rightTireX, y: rightTireY };
    } else {
      this.lastSkidLeft = null;
      this.lastSkidRight = null;
    }

    // Vehicle damage smoke / fire effects
    if (this.hp < this.maxHp * 0.45 && Math.random() > 0.4) {
      particleSystem.addDust(this.x, this.y, 0, 0, 8);
    }
    if (this.hp < this.maxHp * 0.2 && Math.random() > 0.5) {
      particleSystem.addNitroFlame(this.x, this.y, Math.random() * Math.PI * 2);
    }

    // Update audio engine sound
    const speedRatioAudio = Math.min(1, this.currentSpeed / this.maxSpeed);
    SoundSynthesizer.updateEngine(speedRatioAudio, throttle !== 0, this.isBoosting);
  }

  public takeDamage(rawDmg: number): number {
    const reducedDmg = Math.max(1, Math.round(rawDmg * (1 - this.armor)));
    this.hp = Math.max(0, this.hp - reducedDmg);
    return reducedDmg;
  }

  public repair(amount: number): void {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  public refuel(amount: number): void {
    this.fuel = Math.min(this.maxFuel, this.fuel + amount);
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    const w = this.width;
    const l = this.length;
    const halfW = w / 2;
    const halfL = l / 2;

    // Vehicle shadow on sand
    ctx.fillStyle = 'rgba(15, 10, 5, 0.35)';
    ctx.beginPath();
    ctx.ellipse(4, 6, halfL + 4, halfW + 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Headlight light cones (soft radial gradient)
    ctx.save();
    const lightGrad = ctx.createRadialGradient(halfL, 0, 10, halfL + 220, 0, 260);
    lightGrad.addColorStop(0, 'rgba(254, 240, 138, 0.25)');
    lightGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = lightGrad;
    ctx.beginPath();
    ctx.moveTo(halfL, -halfW * 0.6);
    ctx.lineTo(halfL + 260, -90);
    ctx.lineTo(halfL + 260, 90);
    ctx.lineTo(halfL, halfW * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 4 Offroad Rugged Tires
    ctx.fillStyle = '#18181b';
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1.5;

    const tireW = l * 0.30;
    const tireH = w * 0.24;

    // Front tires
    ctx.fillRect(halfL * 0.45, -halfW - tireH * 0.4, tireW, tireH);
    ctx.fillRect(halfL * 0.45, halfW - tireH * 0.6, tireW, tireH);

    // Rear tires
    ctx.fillRect(-halfL * 0.85, -halfW - tireH * 0.4, tireW, tireH);
    ctx.fillRect(-halfL * 0.85, halfW - tireH * 0.6, tireW, tireH);

    // Main Armored Chassis
    ctx.fillStyle = this.def.color;
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    // Angular wasteland combat shape
    ctx.moveTo(halfL, -halfW * 0.6);
    ctx.lineTo(halfL * 0.8, -halfW);
    ctx.lineTo(-halfL * 0.7, -halfW);
    ctx.lineTo(-halfL, -halfW * 0.7);
    ctx.lineTo(-halfL, halfW * 0.7);
    ctx.lineTo(-halfL * 0.7, halfW);
    ctx.lineTo(halfL * 0.8, halfW);
    ctx.lineTo(halfL, halfW * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Spiked Front Bull-Bar / Ramming Bumper
    ctx.fillStyle = '#44403c';
    ctx.fillRect(halfL - 2, -halfW * 0.75, 7, w * 0.75);
    ctx.strokeStyle = '#78716c';
    ctx.strokeRect(halfL - 2, -halfW * 0.75, 7, w * 0.75);

    // Armored Cockpit Roof & Tinted Windshield
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(halfL * 0.2, -halfW * 0.6);
    ctx.lineTo(halfL * 0.4, 0);
    ctx.lineTo(halfL * 0.2, halfW * 0.6);
    ctx.lineTo(-halfL * 0.35, halfW * 0.5);
    ctx.lineTo(-halfL * 0.35, -halfW * 0.5);
    ctx.closePath();
    ctx.fill();

    // Roll Cage Steel Bars
    ctx.strokeStyle = '#78716c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(halfL * 0.25, -halfW * 0.5);
    ctx.lineTo(-halfL * 0.3, -halfW * 0.45);
    ctx.moveTo(halfL * 0.25, halfW * 0.5);
    ctx.lineTo(-halfL * 0.3, halfW * 0.45);
    ctx.stroke();

    // Rear engine intake / radiator mesh
    ctx.fillStyle = '#292524';
    ctx.fillRect(-halfL * 0.85, -halfW * 0.4, halfL * 0.4, w * 0.4);

    // Turret Base
    ctx.fillStyle = '#27272a';
    ctx.strokeStyle = '#52525b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // Draw Aiming Turret & Barrels (Rotated independently towards mouse)
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.turretAngle);

    // Dual gun barrels
    ctx.fillStyle = '#18181b';
    ctx.strokeStyle = '#52525b';
    ctx.lineWidth = 1.5;
    ctx.fillRect(4, -6, 26, 4);
    ctx.strokeRect(4, -6, 26, 4);
    ctx.fillRect(4, 2, 26, 4);
    ctx.strokeRect(4, 2, 26, 4);

    // Turret Dome
    ctx.fillStyle = '#3f3f46';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#a1a1aa';
    ctx.stroke();

    ctx.restore();
  }

  public renderHeadlights(ctx: CanvasRenderingContext2D, beamColor: string = 'rgba(254, 240, 138, 0.4)'): void {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    const halfL = this.length / 2;
    const halfW = this.width / 2;

    // Dual conical headlight projections
    const coneDist = 380;
    const coneSpread = 140;

    const grad = ctx.createRadialGradient(halfL, 0, 15, halfL + coneDist * 0.6, 0, coneDist);
    grad.addColorStop(0, beamColor);
    grad.addColorStop(0.7, beamColor.replace(/[\d.]+\)$/, '0.15)'));
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(halfL, -halfW * 0.6);
    ctx.lineTo(halfL + coneDist, -coneSpread);
    ctx.lineTo(halfL + coneDist, coneSpread);
    ctx.lineTo(halfL, halfW * 0.6);
    ctx.closePath();
    ctx.fill();

    // Bright headlight bulb glow
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(halfL, -halfW * 0.6, 3.5, 0, Math.PI * 2);
    ctx.arc(halfL, halfW * 0.6, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
