export class Camera {
  public x: number = 0;
  public y: number = 0;
  public viewportWidth: number = 1200;
  public viewportHeight: number = 800;
  public zoom: number = 1.0;

  private shakeIntensity: number = 0;
  private shakeOffsetX: number = 0;
  private shakeOffsetY: number = 0;

  constructor(viewportWidth: number, viewportHeight: number) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
  }

  public resize(width: number, height: number): void {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  public update(targetX: number, targetY: number, targetVx: number, targetVy: number, dt: number): void {
    // Lookahead offset based on velocity
    const lookAheadFactor = 0.45;
    const lookAheadX = targetVx * lookAheadFactor;
    const lookAheadY = targetVy * lookAheadFactor;

    const desiredX = targetX + lookAheadX;
    const desiredY = targetY + lookAheadY;

    // Smooth lerp follow
    const followSpeed = 6.0 * dt;
    this.x += (desiredX - this.x) * Math.min(1, followSpeed);
    this.y += (desiredY - this.y) * Math.min(1, followSpeed);

    // Screen shake update
    if (this.shakeIntensity > 0.1) {
      this.shakeOffsetX = (Math.random() - 0.5) * this.shakeIntensity * 2;
      this.shakeOffsetY = (Math.random() - 0.5) * this.shakeIntensity * 2;
      this.shakeIntensity *= Math.pow(0.05, dt);
    } else {
      this.shakeIntensity = 0;
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }
  }

  public addShake(amount: number): void {
    this.shakeIntensity = Math.min(28, this.shakeIntensity + amount);
  }

  public begin(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(
      this.viewportWidth / 2 + this.shakeOffsetX,
      this.viewportHeight / 2 + this.shakeOffsetY
    );
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.x, -this.y);
  }

  public end(ctx: CanvasRenderingContext2D): void {
    ctx.restore();
  }

  public worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: (worldX - this.x) * this.zoom + this.viewportWidth / 2 + this.shakeOffsetX,
      y: (worldY - this.y) * this.zoom + this.viewportHeight / 2 + this.shakeOffsetY,
    };
  }

  public screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: (screenX - this.viewportWidth / 2 - this.shakeOffsetX) / this.zoom + this.x,
      y: (screenY - this.viewportHeight / 2 - this.shakeOffsetY) / this.zoom + this.y,
    };
  }

  public isVisible(worldX: number, worldY: number, radius = 64): boolean {
    const halfW = (this.viewportWidth / 2) / this.zoom + radius;
    const halfH = (this.viewportHeight / 2) / this.zoom + radius;
    return (
      worldX >= this.x - halfW &&
      worldX <= this.x + halfW &&
      worldY >= this.y - halfH &&
      worldY <= this.y + halfH
    );
  }
}
