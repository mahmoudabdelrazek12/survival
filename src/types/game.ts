export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export type WeaponType = 'vulcan' | 'plasma' | 'flak' | 'missile' | 'flamethrower';

export interface WeaponDefinition {
  id: WeaponType;
  name: string;
  description: string;
  damage: number;
  fireRate: number; // shots per second
  range: number;
  speed: number;
  spread: number;
  unlocked: boolean;
  cost: number;
  color: string;
  iconName: string;
  ammoCost: number;
  maxLevel: number;
  level: number;
}

export interface VehicleDefinition {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  cost: number;
  baseHp: number;
  baseFuel: number;
  baseSpeed: number;
  baseAcceleration: number;
  baseHandling: number;
  baseArmor: number; // 0 to 0.7 damage reduction
  color: string;
  accentColor: string;
  width: number;
  length: number;
}

export interface UpgradeTree {
  engineLevel: number;    // +Speed & Acceleration
  armorLevel: number;     // +HP & Damage Reduction
  fuelTankLevel: number;  // +Fuel capacity & Fuel efficiency
  handlingLevel: number;  // +Steering & Drift traction
  magnetLevel: number;    // +Loot pickup radius
  weaponPowerLevel: number; // +Weapon damage
}

export interface OutpostBase {
  solarRefineryLevel: number; // Passive coins/min
  fuelDepotLevel: number;     // Extra starting fuel & fuel cans value
  repairBayLevel: number;     // In-field emergency repair cooldown
  radarArrayLevel: number;    // Minimap range & loot detector
}

export interface Mission {
  id: string;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  targetCount: number;
  currentCount: number;
  rewardCoins: number;
  rewardScrap: number;
  completed: boolean;
  claimed: boolean;
  type: 'kills' | 'scrap' | 'distance' | 'boss' | 'survival_time' | 'zombies' | 'missile_strike';
}

export interface DailyMissionState {
  lastDate: string;
  missions: Mission[];
  streak: number;
  streakClaimedToday: boolean;
}

export interface PlayerStats {
  totalDistanceTraveled: number;
  totalEnemiesDestroyed: number;
  totalBossesDefeated: number;
  totalCoinsCollected: number;
  totalScrapCollected: number;
  totalRunsCount: number;
  longestSurvivalSeconds: number;
}

export interface SaveData {
  version: number;
  playerId: string;
  playerName: string;
  coins: number;
  scrap: number;
  selectedVehicleId: string;
  activeWeaponId: WeaponType;
  unlockedVehicleIds: string[];
  unlockedWeaponIds: WeaponType[];
  upgrades: UpgradeTree;
  outpost: OutpostBase;
  missions: Mission[];
  dailyMissions?: DailyMissionState;
  stats: PlayerStats;
  settings: {
    sfxVolume: number;
    engineVolume: number;
    musicVolume: number;
    particlesQuality: 'low' | 'medium' | 'high';
    showTouchControls: boolean;
    onlineModeEnabled: boolean;
    language: 'ar' | 'en';
    controlType: 'pedals' | 'joystick' | 'wheel';
    controlMode?: 'pedals' | 'joystick';
    admobTestEnabled: boolean;
    selectedMapId: string;
    showMiniMap?: boolean;
    admobBannerEnabled?: boolean;
  };
  lastSavedTimestamp: number;
}

export interface OnlineUser {
  playerId: string;
  username: string;
  authToken: string;
  level: number;
  isBanned: boolean;
  lastCloudSync: number;
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  score: number;
  survivalTime: number;
  bossesKilled: number;
  vehicleUsed: string;
  verified: boolean;
  date: string;
}

export type EnemyType = 
  | 'scout_buggy' 
  | 'raider_truck' 
  | 'rocket_chaser' 
  | 'sand_crawler' 
  | 'zombie_walker' 
  | 'zombie_spitter' 
  | 'zombie_brute' 
  | 'boss_war_rig' 
  | 'boss_sand_worm'
  | 'boss_mutant_colossus';

export interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  isPlayer: boolean;
  rangeRemaining: number;
  color: string;
  radius: number;
  type: WeaponType;
}

export interface LootItem {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'coin' | 'scrap' | 'fuel' | 'repair' | 'ammo';
  value: number;
  radius: number;
  lifeTime: number;
}

export interface SkidMark {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  alpha: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  shape: 'circle' | 'square' | 'smoke' | 'spark';
}
