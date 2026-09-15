import { SaveData } from '../../types/game';

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
  missions: [
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
  ],
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

const SAVE_KEY = 'DUNE_SURVIVAL_SAVE_DATA_V1';

export class SaveSystem {
  private static cachedData: SaveData | null = null;

  public static load(): SaveData {
    if (this.cachedData) {
      return this.cachedData;
    }

    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) {
        this.cachedData = JSON.parse(JSON.stringify(DEFAULT_SAVE_DATA));
        this.save(this.cachedData!);
        return this.cachedData!;
      }

      const parsed = JSON.parse(raw) as SaveData;
      // Versioning & Migrations
      const merged = this.migrate(parsed);
      this.cachedData = merged;
      return merged;
    } catch (e) {
      console.warn('Failed to load save from localStorage, using defaults', e);
      this.cachedData = JSON.parse(JSON.stringify(DEFAULT_SAVE_DATA));
      return this.cachedData!;
    }
  }

  public static save(data: SaveData): boolean {
    try {
      data.lastSavedTimestamp = Date.now();
      this.cachedData = { ...data };
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Error writing save to localStorage', e);
      return false;
    }
  }

  public static reset(): SaveData {
    localStorage.removeItem(SAVE_KEY);
    this.cachedData = JSON.parse(JSON.stringify(DEFAULT_SAVE_DATA));
    // Generate a fresh random player ID on fresh reset
    this.cachedData!.playerId = 'survivor_' + Math.random().toString(36).substring(2, 9);
    this.save(this.cachedData!);
    return this.cachedData!;
  }

  public static exportJSON(): string {
    const data = this.load();
    return JSON.stringify(data, null, 2);
  }

  public static importJSON(jsonStr: string): { success: boolean; data?: SaveData; error?: string } {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, error: 'Invalid JSON payload' };
      }
      const migrated = this.migrate(parsed);
      this.save(migrated);
      return { success: true, data: migrated };
    } catch (e) {
      return { success: false, error: (e as Error).message || 'Parse error' };
    }
  }

  private static migrate(data: any): SaveData {
    const defaults = JSON.parse(JSON.stringify(DEFAULT_SAVE_DATA));
    if (!data.version || data.version < defaults.version) {
      console.log(`Migrating save data from version ${data.version || 0} to ${defaults.version}`);
    }

    // Deep merge with defaults to avoid missing properties on upgrades or missions
    return {
      version: defaults.version,
      playerId: data.playerId || defaults.playerId,
      playerName: data.playerName || defaults.playerName,
      coins: typeof data.coins === 'number' ? Math.max(0, data.coins) : defaults.coins,
      scrap: typeof data.scrap === 'number' ? Math.max(0, data.scrap) : defaults.scrap,
      selectedVehicleId: data.selectedVehicleId || defaults.selectedVehicleId,
      activeWeaponId: data.activeWeaponId || defaults.activeWeaponId,
      unlockedVehicleIds: Array.isArray(data.unlockedVehicleIds) ? data.unlockedVehicleIds : defaults.unlockedVehicleIds,
      unlockedWeaponIds: Array.isArray(data.unlockedWeaponIds) ? data.unlockedWeaponIds : defaults.unlockedWeaponIds,
      upgrades: { ...defaults.upgrades, ...(data.upgrades || {}) },
      outpost: { ...defaults.outpost, ...(data.outpost || {}) },
      missions: Array.isArray(data.missions) && data.missions.length ? data.missions : defaults.missions,
      stats: { ...defaults.stats, ...(data.stats || {}) },
      settings: { ...defaults.settings, ...(data.settings || {}) },
      lastSavedTimestamp: Date.now(),
    };
  }
}
