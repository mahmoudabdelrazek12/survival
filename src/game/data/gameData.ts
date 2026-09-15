import { VehicleDefinition, WeaponDefinition, Mission, SaveData } from '../../types/game';

export const INITIAL_VEHICLES: VehicleDefinition[] = [
  {
    id: 'desert_vulture',
    name: 'Desert Vulture',
    description: 'Lightweight dune buggy engineered for agile maneuvers, rapid scouting, and quick hit-and-run tactics.',
    unlocked: true,
    cost: 0,
    baseHp: 100,
    baseFuel: 100,
    baseSpeed: 520,
    baseAcceleration: 480,
    baseHandling: 0.95,
    baseArmor: 0.1,
    color: '#eab308', // Amber yellow
    accentColor: '#ca8a04',
    width: 38,
    length: 56
  },
  {
    id: 'dune_marauder',
    name: 'Dune Marauder',
    description: 'Reinforced 4x4 combat interceptor balanced with heavy-duty shock absorbers and spiked bull bars.',
    unlocked: false,
    cost: 1200,
    baseHp: 170,
    baseFuel: 130,
    baseSpeed: 470,
    baseAcceleration: 410,
    baseHandling: 0.82,
    baseArmor: 0.25,
    color: '#ea580c', // Desert Orange
    accentColor: '#9a3412',
    width: 44,
    length: 64
  },
  {
    id: 'iron_sandstorm',
    name: 'Iron Sandstorm',
    description: 'Heavily plated technical assault truck built from salvaged oil tanker parts. Highly durable against enemy ramming.',
    unlocked: false,
    cost: 3500,
    baseHp: 260,
    baseFuel: 160,
    baseSpeed: 420,
    baseAcceleration: 350,
    baseHandling: 0.72,
    baseArmor: 0.45,
    color: '#0284c7', // Steel Cobalt
    accentColor: '#0369a1',
    width: 50,
    length: 74
  },
  {
    id: 'apex_behemoth',
    name: 'Apex Behemoth',
    description: 'The ultimate wasteland warmachine with dual mounted rail brackets, tank treads, and explosive reactive armor.',
    unlocked: false,
    cost: 8000,
    baseHp: 380,
    baseFuel: 210,
    baseSpeed: 380,
    baseAcceleration: 310,
    baseHandling: 0.65,
    baseArmor: 0.60,
    color: '#dc2626', // Crimson Warlord
    accentColor: '#7f1d1d',
    width: 58,
    length: 84
  }
];

export const INITIAL_WEAPONS: Record<string, WeaponDefinition> = {
  vulcan: {
    id: 'vulcan',
    name: 'Twin Vulcan Guns',
    description: 'High rate of fire twin-barrel kinetic rotary cannons. Shreds light buggies and clears unarmored raiders.',
    damage: 18,
    fireRate: 8,
    range: 650,
    speed: 850,
    spread: 0.08,
    unlocked: true,
    cost: 0,
    color: '#fbbf24',
    iconName: 'Crosshair',
    ammoCost: 1,
    maxLevel: 5,
    level: 1
  },
  plasma: {
    id: 'plasma',
    name: 'Plasma Lance',
    description: 'Concentrated ion beam that pierces through multiple enemies and melts thick armor plating.',
    damage: 48,
    fireRate: 2.8,
    range: 750,
    speed: 950,
    spread: 0.02,
    unlocked: false,
    cost: 1500,
    color: '#38bdf8',
    iconName: 'Zap',
    ammoCost: 2,
    maxLevel: 5,
    level: 1
  },
  flak: {
    id: 'flak',
    name: 'Heavy Flak Cannon',
    description: 'Fires explosive canisters that detonate on impact, creating shrapnel clouds that damage surrounding foes.',
    damage: 85,
    fireRate: 1.5,
    range: 600,
    speed: 680,
    spread: 0.05,
    unlocked: false,
    cost: 2800,
    color: '#f97316',
    iconName: 'Bomb',
    ammoCost: 3,
    maxLevel: 5,
    level: 1
  },
  missile: {
    id: 'missile',
    name: 'Swarm Missiles',
    description: 'Launches guided seeker rockets that home in on the closest threatening vehicle or boss target.',
    damage: 120,
    fireRate: 0.9,
    range: 900,
    speed: 550,
    spread: 0.25,
    unlocked: false,
    cost: 4500,
    color: '#ef4444',
    iconName: 'Rocket',
    ammoCost: 4,
    maxLevel: 5,
    level: 1
  },
  flamethrower: {
    id: 'flamethrower',
    name: 'Scorcher Jet',
    description: 'Continuous torrent of burning fuel that incinerates anything chasing or in close proximity to your vehicle.',
    damage: 32,
    fireRate: 14,
    range: 350,
    speed: 400,
    spread: 0.35,
    unlocked: false,
    cost: 3200,
    color: '#f43f5e',
    iconName: 'Flame',
    ammoCost: 1,
    maxLevel: 5,
    level: 1
  }
};

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'm1_buggy_hunter',
    title: 'Scavenger Cleansing',
    description: 'Destroy 8 enemy scout buggies in the desert dunes.',
    targetCount: 8,
    currentCount: 0,
    rewardCoins: 250,
    rewardScrap: 120,
    completed: false,
    claimed: false,
    type: 'kills'
  },
  {
    id: 'm2_scrap_collector',
    title: 'Metal Salvage',
    description: 'Gather 200 units of scrap metal from fallen raiders.',
    targetCount: 200,
    currentCount: 0,
    rewardCoins: 350,
    rewardScrap: 80,
    completed: false,
    claimed: false,
    type: 'scrap'
  },
  {
    id: 'm3_endurance_run',
    title: 'Dune Nomad',
    description: 'Travel a distance of at least 3,500 meters across the sands in a single run.',
    targetCount: 3500,
    currentCount: 0,
    rewardCoins: 500,
    rewardScrap: 200,
    completed: false,
    claimed: false,
    type: 'distance'
  },
  {
    id: 'm4_behemoth_slayer',
    title: 'King of the Dust',
    description: 'Summon and defeat a Dune Behemoth war-rig boss in Sector IV.',
    targetCount: 1,
    currentCount: 0,
    rewardCoins: 1500,
    rewardScrap: 600,
    completed: false,
    claimed: false,
    type: 'boss'
  },
  {
    id: 'm5_survivor_oath',
    title: 'Iron Will',
    description: 'Survive in the hostile wasteland for at least 180 seconds in one run.',
    targetCount: 180,
    currentCount: 0,
    rewardCoins: 600,
    rewardScrap: 250,
    completed: false,
    claimed: false,
    type: 'survival_time'
  }
];

export const UPGRADE_CONFIG = {
  engine: { name: 'Engine Tuning', max: 5, baseCost: 150, costMultiplier: 1.8, desc: '+12% Speed & +15% Accel' },
  armor: { name: 'Reinforced Plating', max: 5, baseCost: 200, costMultiplier: 1.75, desc: '+25 HP & +8% Damage Resistance' },
  fuelTank: { name: 'Expanded Cells', max: 5, baseCost: 120, costMultiplier: 1.6, desc: '+20% Fuel Tank & Consumption Cut' },
  handling: { name: 'Sand Grip Tires', max: 5, baseCost: 140, costMultiplier: 1.65, desc: '+15% Drift Traction & Turn Rate' },
  magnet: { name: 'Magnetic Collector', max: 5, baseCost: 100, costMultiplier: 1.7, desc: '+35px Loot Pull Radius' },
  weaponPower: { name: 'Overcharge Coils', max: 5, baseCost: 250, costMultiplier: 1.9, desc: '+15% All Weapons Damage' },
};

export const OUTPOST_CONFIG = {
  solarRefinery: { name: 'Solar Scrap Refinery', max: 5, baseCost: 400, costMultiplier: 2.0, desc: 'Generates +30 coins & +15 scrap every expedition' },
  fuelDepot: { name: 'Synthetic Fuel Depot', max: 5, baseCost: 350, costMultiplier: 1.9, desc: 'Start runs with +25% fuel reserve & canister boost' },
  repairBay: { name: 'Field Nanite Repair Bay', max: 5, baseCost: 500, costMultiplier: 2.2, desc: 'Auto-repairs 15% vehicle hull when under critical 25% HP' },
  radarArray: { name: 'Long-Range Radar Array', max: 5, baseCost: 300, costMultiplier: 1.8, desc: 'Expands minimap detection range & highlights boss convoy' }
};

export const DEFAULT_SAVE_DATA: SaveData = {
  version: 1,
  playerId: 'survivor_' + Math.random().toString(36).substring(2, 9),
  playerName: 'Wasteland Nomad',
  coins: 450,
  scrap: 150,
  selectedVehicleId: 'desert_vulture',
  activeWeaponId: 'vulcan',
  unlockedVehicleIds: ['desert_vulture'],
  unlockedWeaponIds: ['vulcan'],
  upgrades: {
    engineLevel: 0,
    armorLevel: 0,
    fuelTankLevel: 0,
    handlingLevel: 0,
    magnetLevel: 0,
    weaponPowerLevel: 0,
  },
  outpost: {
    solarRefineryLevel: 0,
    fuelDepotLevel: 0,
    repairBayLevel: 0,
    radarArrayLevel: 0,
  },
  missions: INITIAL_MISSIONS,
  stats: {
    totalDistanceTraveled: 0,
    totalEnemiesDestroyed: 0,
    totalBossesDefeated: 0,
    totalCoinsCollected: 0,
    totalScrapCollected: 0,
    totalRunsCount: 0,
    longestSurvivalSeconds: 0,
  },
  settings: {
    sfxVolume: 0.8,
    engineVolume: 0.6,
    musicVolume: 0.5,
    particlesQuality: 'high',
    showTouchControls: true,
    onlineModeEnabled: false,
    language: 'ar',
    controlType: 'pedals',
    admobTestEnabled: true,
    selectedMapId: 'dune_sea',
  },
  lastSavedTimestamp: Date.now(),
};
