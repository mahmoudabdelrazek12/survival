export interface BoundingCircle {
  x: number;
  y: number;
  radius: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  length: number;
  angle: number;
}

export class Collision {
  public static circleCircle(c1: BoundingCircle, c2: BoundingCircle): boolean {
    const dx = c2.x - c1.x;
    const dy = c2.y - c1.y;
    const distSq = dx * dx + dy * dy;
    const radiusSum = c1.radius + c2.radius;
    return distSq <= radiusSum * radiusSum;
  }

  public static pointInCircle(px: number, py: number, circle: BoundingCircle): boolean {
    const dx = px - circle.x;
    const dy = py - circle.y;
    return dx * dx + dy * dy <= circle.radius * circle.radius;
  }

  // Fast Separating Axis Theorem (SAT) for oriented bounding boxes
  public static obbVsObb(b1: BoundingBox, b2: BoundingBox): boolean {
    const corners1 = this.getBoxCorners(b1);
    const corners2 = this.getBoxCorners(b2);

    const axes = [
      { x: Math.cos(b1.angle), y: Math.sin(b1.angle) },
      { x: -Math.sin(b1.angle), y: Math.cos(b1.angle) },
      { x: Math.cos(b2.angle), y: Math.sin(b2.angle) },
      { x: -Math.sin(b2.angle), y: Math.cos(b2.angle) }
    ];

    for (let i = 0; i < axes.length; i++) {
      const axis = axes[i];
      const p1 = this.projectOntoAxis(corners1, axis);
      const p2 = this.projectOntoAxis(corners2, axis);

      if (p1.max < p2.min || p2.max < p1.min) {
        return false; // Found separating axis
      }
    }

    return true; // Overlapping on all axes
  }

  public static circleVsObb(circle: BoundingCircle, box: BoundingBox): boolean {
    // Transform circle center into box local coordinate space
    const cos = Math.cos(-box.angle);
    const sin = Math.sin(-box.angle);
    const dx = circle.x - box.x;
    const dy = circle.y - box.y;

    const localX = cos * dx - sin * dy;
    const localY = sin * dx + cos * dy;

    const halfW = box.width / 2;
    const halfL = box.length / 2;

    // Find closest point on local box
    const closestX = Math.max(-halfL, Math.min(halfL, localX));
    const closestY = Math.max(-halfW, Math.min(halfW, localY));

    const distX = localX - closestX;
    const distY = localY - closestY;

    return distX * distX + distY * distY <= circle.radius * circle.radius;
  }

  // Resolve elastic bounce between two dynamic vehicles/entities
  public static resolveBounce(
    e1: { x: number; y: number; vx: number; vy: number; radius: number; mass: number },
    e2: { x: number; y: number; vx: number; vy: number; radius: number; mass: number }
  ): { impactVelocity: number } {
    const dx = e2.x - e1.x;
    const dy = e2.y - e1.y;
    const dist = Math.hypot(dx, dy) || 0.0001;
    const nx = dx / dist;
    const ny = dy / dist;

    // Separate positions so they don't stick
    const overlap = (e1.radius + e2.radius) - dist;
    if (overlap > 0) {
      const totalMass = e1.mass + e2.mass;
      const m1Ratio = e2.mass / totalMass;
      const m2Ratio = e1.mass / totalMass;

      e1.x -= nx * overlap * m1Ratio;
      e1.y -= ny * overlap * m1Ratio;
      e2.x += nx * overlap * m2Ratio;
      e2.y += ny * overlap * m2Ratio;
    }

    // Relative velocity
    const rvx = e2.vx - e1.vx;
    const rvy = e2.vy - e1.vy;
    const velAlongNormal = rvx * nx + rvy * ny;

    if (velAlongNormal > 0) return { impactVelocity: 0 }; // Separating already

    const restitution = 0.55; // Desert metal bounce factor
    const impulseMag = -(1 + restitution) * velAlongNormal / (1 / e1.mass + 1 / e2.mass);

    e1.vx -= (impulseMag / e1.mass) * nx;
    e1.vy -= (impulseMag / e1.mass) * ny;
    e2.vx += (impulseMag / e2.mass) * nx;
    e2.vy += (impulseMag / e2.mass) * ny;

    return { impactVelocity: Math.abs(velAlongNormal) };
  }

  private static getBoxCorners(box: BoundingBox): { x: number; y: number }[] {
    const cos = Math.cos(box.angle);
    const sin = Math.sin(box.angle);
    const halfW = box.width / 2;
    const halfL = box.length / 2;

    return [
      { x: box.x + cos * halfL - sin * halfW, y: box.y + sin * halfL + cos * halfW },
      { x: box.x - cos * halfL - sin * halfW, y: box.y - sin * halfL + cos * halfW },
      { x: box.x - cos * halfL + sin * halfW, y: box.y - sin * halfL - cos * halfW },
      { x: box.x + cos * halfL + sin * halfW, y: box.y + sin * halfL - cos * halfW },
    ];
  }

  private static projectOntoAxis(points: { x: number; y: number }[], axis: { x: number; y: number }) {
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < points.length; i++) {
      const dot = points[i].x * axis.x + points[i].y * axis.y;
      if (dot < min) min = dot;
      if (dot > max) max = dot;
    }
    return { min, max };
  }
}
