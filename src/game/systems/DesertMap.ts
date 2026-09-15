import { MapSector, GAME_MAPS } from '../data/mapsData';

export interface MapObstacle {
  x: number;
  y: number;
  radius: number;
  type: 'rock' | 'ruin' | 'oil_derrick' | 'cactus' | 'bones' | 'toxic_barrel' | 'scrap_pile';
  color: string;
}

export class DesertMap {
  public width = 10000;
  public height = 10000;
  public obstacles: MapObstacle[] = [];
  public currentSector: MapSector;

  constructor(sector?: MapSector) {
    this.currentSector = sector || GAME_MAPS[0];
    this.generateObstacles();
  }

  public setSector(sector: MapSector): void {
    this.currentSector = sector;
    this.generateObstacles();
  }

  private generateObstacles(): void {
    this.obstacles = [];
    const obstacleCount = 190;
    const availableTypes = this.currentSector.obstacleTypes || ['rock', 'ruin', 'oil_derrick', 'cactus', 'bones'];

    for (let i = 0; i < obstacleCount; i++) {
      // Keep clear safe starting area around origin (0, 0)
      let x = (Math.random() - 0.5) * this.width * 0.85;
      let y = (Math.random() - 0.5) * this.height * 0.85;

      if (Math.hypot(x, y) < 400) {
        x += (x >= 0 ? 500 : -500);
        y += (y >= 0 ? 500 : -500);
      }

      const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
      let radius = 30;
      let color = '#78350f';

      if (type === 'rock') {
        radius = 24 + Math.random() * 26;
        color = this.currentSector.duneColor;
      } else if (type === 'ruin') {
        radius = 35 + Math.random() * 20;
        color = '#57534e';
      } else if (type === 'oil_derrick') {
        radius = 42;
        color = '#292524';
      } else if (type === 'bones') {
        radius = 26;
        color = '#f8fafc';
      } else if (type === 'toxic_barrel') {
        radius = 22;
        color = '#4ade80';
      } else if (type === 'scrap_pile') {
        radius = 32;
        color = '#64748b';
      } else {
        radius = 16;
        color = '#15803d';
      }

      this.obstacles.push({ x, y, radius, type, color });
    }
  }

  public getObstaclesNear(x: number, y: number, radius: number): MapObstacle[] {
    const nearby: MapObstacle[] = [];
    const radSq = (radius + 80) * (radius + 80);

    for (let i = 0; i < this.obstacles.length; i++) {
      const obs = this.obstacles[i];
      const dx = obs.x - x;
      const dy = obs.y - y;
      if (dx * dx + dy * dy <= radSq) {
        nearby.push(obs);
      }
    }
    return nearby;
  }

  public render(ctx: CanvasRenderingContext2D, camX: number, camY: number, viewW: number, viewH: number): void {
    const left = camX - viewW / 2 - 100;
    const right = camX + viewW / 2 + 100;
    const top = camY - viewH / 2 - 100;
    const bottom = camY + viewH / 2 + 100;

    // 1. Sector Ground Base
    ctx.fillStyle = this.currentSector.groundColor;
    ctx.fillRect(left, top, right - left, bottom - top);

    // 2. Dune Ridge Waves & Textures
    ctx.strokeStyle = this.currentSector.duneColor;
    ctx.lineWidth = 1.5;
    const duneStep = 240;
    const startY = Math.floor(top / duneStep) * duneStep;

    for (let y = startY; y < bottom; y += duneStep) {
      ctx.beginPath();
      for (let x = left; x < right; x += 60) {
        const offset = Math.sin(x * 0.003 + y * 0.005) * 45;
        if (x === left) ctx.moveTo(x, y + offset);
        else ctx.lineTo(x, y + offset);
      }
      ctx.stroke();
    }

    // 3. Grid coordinates markings
    ctx.fillStyle = this.currentSector.gridColor;
    ctx.font = '10px monospace';
    const gridStep = 500;
    const gxStart = Math.floor(left / gridStep) * gridStep;
    const gyStart = Math.floor(top / gridStep) * gridStep;

    for (let gx = gxStart; gx < right; gx += gridStep) {
      for (let gy = gyStart; gy < bottom; gy += gridStep) {
        ctx.fillText(`SECTOR [${Math.floor(gx / 500)}, ${Math.floor(gy / 500)}]`, gx + 10, gy + 18);
        ctx.strokeStyle = this.currentSector.gridColor;
        ctx.strokeRect(gx, gy, gridStep, gridStep);
      }
    }

    // 4. Render Obstacles
    for (let i = 0; i < this.obstacles.length; i++) {
      const obs = this.obstacles[i];
      if (obs.x < left - 60 || obs.x > right + 60 || obs.y < top - 60 || obs.y > bottom + 60) {
        continue;
      }

      ctx.save();
      ctx.translate(obs.x, obs.y);

      // Cast shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(obs.radius * 0.25, obs.radius * 0.3, obs.radius * 1.1, obs.radius * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();

      if (obs.type === 'rock') {
        ctx.fillStyle = obs.color || '#78350f';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const sides = 7;
        for (let s = 0; s < sides; s++) {
          const a = (s * Math.PI * 2) / sides;
          const r = obs.radius * (0.8 + 0.3 * Math.sin(s * 2.3));
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (obs.type === 'ruin') {
        ctx.fillStyle = '#44403c';
        ctx.strokeStyle = '#1c1917';
        ctx.lineWidth = 2;
        ctx.fillRect(-obs.radius, -obs.radius * 0.7, obs.radius * 2, obs.radius * 1.4);
        ctx.strokeRect(-obs.radius, -obs.radius * 0.7, obs.radius * 2, obs.radius * 1.4);
        ctx.fillStyle = '#0c0a09';
        ctx.fillRect(-obs.radius * 0.6, -obs.radius * 0.4, obs.radius * 0.4, obs.radius * 0.8);
      } else if (obs.type === 'oil_derrick') {
        ctx.strokeStyle = '#18181b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-obs.radius * 0.8, obs.radius * 0.8);
        ctx.lineTo(0, -obs.radius * 0.9);
        ctx.lineTo(obs.radius * 0.8, obs.radius * 0.8);
        ctx.lineTo(-obs.radius * 0.8, obs.radius * 0.8);
        ctx.moveTo(-obs.radius * 0.4, 0);
        ctx.lineTo(obs.radius * 0.4, 0);
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, -obs.radius * 0.9, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (obs.type === 'bones') {
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let b = -obs.radius; b <= obs.radius; b += 10) {
          ctx.moveTo(b, -10);
          ctx.lineTo(b + 4, 10);
        }
        ctx.stroke();
      } else if (obs.type === 'toxic_barrel') {
        // Irradiated green barrel
        ctx.fillStyle = '#15803d';
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, obs.radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Biohazard circle
        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (obs.type === 'scrap_pile') {
        // Scrap metal junkyard heap
        ctx.fillStyle = '#334155';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.fillRect(-obs.radius * 0.8, -obs.radius * 0.6, obs.radius * 1.6, obs.radius * 1.2);
        ctx.strokeRect(-obs.radius * 0.8, -obs.radius * 0.6, obs.radius * 1.6, obs.radius * 1.2);
        // Cross struts
        ctx.strokeStyle = '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(-obs.radius * 0.7, -obs.radius * 0.5);
        ctx.lineTo(obs.radius * 0.7, obs.radius * 0.5);
        ctx.stroke();
      }

      ctx.restore();
    }
  }
}
