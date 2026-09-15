export interface VirtualJoystickState {
  active: boolean;
  x: number;
  y: number;
  dx: number; // -1 to 1
  dy: number; // -1 to 1
  angle: number;
  intensity: number;
}

export class InputManager {
  private keys: Record<string, boolean> = {};
  public mouseX: number = 0;
  public mouseY: number = 0;
  public isMouseDown: boolean = false;

  // Touch virtual controls
  public joystick: VirtualJoystickState = {
    active: false,
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    angle: 0,
    intensity: 0
  };

  public touchBoost: boolean = false;
  public touchHandbrake: boolean = false;
  public touchFire: boolean = false;
  public touchGas: boolean = false;
  public touchReverse: boolean = false;
  public touchSteerLeft: boolean = false;
  public touchSteerRight: boolean = false;
  public touchMissile: boolean = false;

  // Listeners
  private onKeyDownBound: (e: KeyboardEvent) => void;
  private onKeyUpBound: (e: KeyboardEvent) => void;
  private onMouseMoveBound: (e: MouseEvent) => void;
  private onMouseDownBound: (e: MouseEvent) => void;
  private onMouseUpBound: (e: MouseEvent) => void;

  public onPauseRequested?: () => void;
  public onWeaponSelect?: (index: number) => void;

  constructor() {
    this.onKeyDownBound = this.handleKeyDown.bind(this);
    this.onKeyUpBound = this.handleKeyUp.bind(this);
    this.onMouseMoveBound = this.handleMouseMove.bind(this);
    this.onMouseDownBound = this.handleMouseDown.bind(this);
    this.onMouseUpBound = this.handleMouseUp.bind(this);
  }

  public attach(container?: HTMLElement): void {
    window.addEventListener('keydown', this.onKeyDownBound);
    window.addEventListener('keyup', this.onKeyUpBound);
    window.addEventListener('mousemove', this.onMouseMoveBound);
    window.addEventListener('mousedown', this.onMouseDownBound);
    window.addEventListener('mouseup', this.onMouseUpBound);
  }

  public detach(): void {
    window.removeEventListener('keydown', this.onKeyDownBound);
    window.removeEventListener('keyup', this.onKeyUpBound);
    window.removeEventListener('mousemove', this.onMouseMoveBound);
    window.removeEventListener('mousedown', this.onMouseDownBound);
    window.removeEventListener('mouseup', this.onMouseUpBound);
  }

  private handleKeyDown(e: KeyboardEvent): void {
    this.keys[e.code] = true;
    this.keys[e.key.toLowerCase()] = true;

    if (e.code === 'Escape' || e.key.toLowerCase() === 'p') {
      if (this.onPauseRequested) {
        this.onPauseRequested();
      }
    }

    if (e.key >= '1' && e.key <= '5') {
      const idx = parseInt(e.key) - 1;
      if (this.onWeaponSelect) {
        this.onWeaponSelect(idx);
      }
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    this.keys[e.code] = false;
    this.keys[e.key.toLowerCase()] = false;
  }

  private handleMouseMove(e: MouseEvent): void {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  }

  private handleMouseDown(e: MouseEvent): void {
    if (e.button === 0) {
      this.isMouseDown = true;
    }
  }

  private handleMouseUp(e: MouseEvent): void {
    if (e.button === 0) {
      this.isMouseDown = false;
    }
  }

  // State checks for vehicle controller
  public get throttle(): number {
    // 1 for forward, -1 for reverse
    let t = 0;
    if (this.keys['KeyW'] || this.keys['ArrowUp'] || this.keys['w'] || this.touchGas) t += 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown'] || this.keys['s'] || this.touchReverse) t -= 1;

    // Merge virtual joystick dy (up is negative dy)
    if (this.joystick.active) {
      if (this.joystick.dy < -0.2) t = Math.max(t, -this.joystick.dy);
      else if (this.joystick.dy > 0.2) t = Math.min(t, -this.joystick.dy);
    }
    return Math.max(-1, Math.min(1, t));
  }

  public get steer(): number {
    // -1 for left, 1 for right
    let s = 0;
    if (this.keys['KeyA'] || this.keys['ArrowLeft'] || this.keys['a'] || this.touchSteerLeft) s -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight'] || this.keys['d'] || this.touchSteerRight) s += 1;

    // Merge virtual joystick dx
    if (this.joystick.active) {
      if (Math.abs(this.joystick.dx) > 0.15) {
        s = this.joystick.dx;
      }
    }
    return Math.max(-1, Math.min(1, s));
  }

  public get isBoosting(): boolean {
    return !!(this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.touchBoost);
  }

  public get isHandbraking(): boolean {
    return !!(this.keys['Space'] || this.touchHandbrake);
  }

  public get isFiring(): boolean {
    return this.isMouseDown || this.touchFire || !!this.keys['KeyJ'] || !!this.keys['KeyK'];
  }

  public get isMissileRequested(): boolean {
    const requested = !!(this.keys['KeyF'] || this.keys['KeyE'] || this.keys['KeyQ'] || this.touchMissile);
    if (this.touchMissile) this.touchMissile = false; // consume one-shot
    return requested;
  }
}
