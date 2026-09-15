import { Particle, SkidMark } from '../../types/game';

export class ParticleSystem {
  private particles: Particle[] = [];
  private skidMarks: SkidMark[] = [];
  private maxParticles: number = 280;
  private maxSkidMarks: number = 350;

  constructor(quality: 'low' | 'medium' | 'high' = 'high') {
    this.setQuality(quality);
  }

  public setQuality(quality: 'low' | 'medium' | 'high'): void {
    if (quality === 'low') {
      this.maxParticles = 80;
      this.maxSkidMarks = 100;
    } else if (quality === 'medium') {
      this.maxParticles = 180;
      this.maxSkidMarks = 220;
    } else {
      this.maxParticles = 280;
      this.maxSkidMarks = 350;
    }
  }

  public addDust(x: number, y: number, vx: number, vy: number, size = 6): void {
    if (this.particles.length >= this.maxParticles) return;
    this.particles.push({
      x,
      y,
      vx: vx * 0.2 + (Math.random() - 0.5) * 15,
      vy: vy * 0.2 + (Math.random() - 0.5) * 15,
      size: size + Math.random() * 4,
      color: Math.random() > 0.5 ? '#d97706' : '#b45309',
      alpha: 0.45 + Math.random() * 0.2,
      decay: 0.92,
      shape: 'smoke'
    });
  }

  public addNitroFlame(x: number, y: number, angle: number): void {
    if (this.particles.length >= this.maxParticles) return;
    const speed = 120 + Math.random() * 80;
    const spread = (Math.random() - 0.5) * 0.4;
    const thrustAngle = angle + Math.PI + spread;

    this.particles.push({
      x,
      y,
      vx: Math.cos(thrustAngle) * speed,
      vy: Math.sin(thrustAngle) * speed,
      size: 4 + Math.random() * 4,
      color: Math.random() > 0.3 ? '#06b6d4' : '#38bdf8', // Cyan/electric blue
      alpha: 0.9,
      decay: 0.85,
      shape: 'spark'
    });
  }

  public addSparks(x: number, y: number, count = 8): void {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 160;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 2,
        color: '#fbbf24',
        alpha: 1,
        decay: 0.88,
        shape: 'spark'
      });
    }
  }

  public addExplosion(x: number, y: number, scale = 1): void {
    const flameCount = Math.floor(16 * scale);
    const smokeCount = Math.floor(20 * scale);

    // Fire burst
    for (let i = 0; i < flameCount; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = (50 + Math.random() * 180) * scale;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: (8 + Math.random() * 12) * scale,
        color: Math.random() > 0.4 ? '#ea580c' : '#f59e0b',
        alpha: 0.95,
        decay: 0.84,
        shape: 'circle'
      });
    }

    // Heavy dark smoke cloud
    for (let i = 0; i < smokeCount; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = (20 + Math.random() * 90) * scale;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: (12 + Math.random() * 18) * scale,
        color: Math.random() > 0.5 ? '#1f2937' : '#374151',
        alpha: 0.8,
        decay: 0.94,
        shape: 'smoke'
      });
    }
  }

  public addSkid(x1: number, y1: number, x2: number, y2: number, alpha = 0.35): void {
    if (this.skidMarks.length >= this.maxSkidMarks) {
      this.skidMarks.shift();
    }
    this.skidMarks.push({ x1, y1, x2, y2, alpha });
  }

  public update(dt: number): void {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha *= p.decay;
      p.size *= 1.01; // Slightly expand smoke

      if (p.alpha < 0.04) {
        this.particles.splice(i, 1);
      }
    }

    // Fade skidmarks slowly
    for (let i = this.skidMarks.length - 1; i >= 0; i--) {
      const s = this.skidMarks[i];
      s.alpha -= 0.008 * dt;
      if (s.alpha <= 0) {
        this.skidMarks.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    // Render skid marks
    ctx.lineWidth = 3.5;
    for (let i = 0; i < this.skidMarks.length; i++) {
      const s = this.skidMarks[i];
      ctx.strokeStyle = `rgba(120, 53, 15, ${s.alpha * 0.4})`;
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(s.x2, s.y2);
      ctx.stroke();
    }

    // Render particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
      ctx.fillStyle = p.color;

      if (p.shape === 'spark') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  public clear(): void {
    this.particles = [];
    this.skidMarks = [];
  }
}
