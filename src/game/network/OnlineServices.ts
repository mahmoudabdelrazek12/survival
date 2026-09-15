import { SaveData, OnlineUser, LeaderboardEntry } from '../../types/game';
import { SaveSystem } from '../storage/SaveSystem';

export interface ServerValidationResult {
  valid: boolean;
  reason?: string;
  adjustedCoins?: number;
  adjustedScrap?: number;
}

export class OnlineServices {
  private static currentUser: OnlineUser | null = null;
  private static isConnected: boolean = false;
  private static isSyncing: boolean = false;

  // In-memory or simulated remote leaderboard records
  private static simulatedLeaderboard: LeaderboardEntry[] = [
    { rank: 1, playerId: 'srv_war_lord', playerName: 'Kahn the Ironclad', score: 28400, survivalTime: 540, bossesKilled: 4, vehicleUsed: 'Apex Behemoth', verified: true, date: '2026-09-14' },
    { rank: 2, playerId: 'srv_dune_ghost', playerName: 'Ghost of Sinai', score: 22150, survivalTime: 420, bossesKilled: 3, vehicleUsed: 'Iron Sandstorm', verified: true, date: '2026-09-13' },
    { rank: 3, playerId: 'srv_rust_queen', playerName: 'Rust Valkyrie', score: 18900, survivalTime: 365, bossesKilled: 2, vehicleUsed: 'Dune Marauder', verified: true, date: '2026-09-12' },
    { rank: 4, playerId: 'srv_sand_viper', playerName: 'Dust Devil', score: 14200, survivalTime: 290, bossesKilled: 2, vehicleUsed: 'Desert Vulture', verified: true, date: '2026-09-11' },
    { rank: 5, playerId: 'srv_oasis_hunter', playerName: 'Oasis Raider', score: 9800, survivalTime: 210, bossesKilled: 1, vehicleUsed: 'Desert Vulture', verified: true, date: '2026-09-10' }
  ];

  // Banned player list (server-side security simulation)
  private static bannedPlayerIds: Set<string> = new Set(['srv_cheater_99', 'srv_speed_hacker']);

  public static initialize(): void {
    const savedSession = localStorage.getItem('DUNE_ONLINE_SESSION');
    if (savedSession) {
      try {
        const user = JSON.parse(savedSession) as OnlineUser;
        if (this.bannedPlayerIds.has(user.playerId)) {
          user.isBanned = true;
        }
        this.currentUser = user;
        this.isConnected = true;
      } catch (e) {
        console.warn('Failed to restore online session', e);
      }
    }
  }

  public static getCurrentUser(): OnlineUser | null {
    return this.currentUser;
  }

  public static isOnline(): boolean {
    return this.isConnected && !!this.currentUser && !this.currentUser.isBanned;
  }

  public static async login(username: string, passwordHash?: string): Promise<{ success: boolean; user?: OnlineUser; error?: string }> {
    // Simulating remote authentication endpoint: POST /api/auth/login
    await new Promise(resolve => setTimeout(resolve, 600));

    const trimmed = username.trim();
    if (!trimmed || trimmed.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters long.' };
    }

    const playerId = 'surv_' + Math.abs(this.hashCode(trimmed)).toString(16);

    if (this.bannedPlayerIds.has(playerId)) {
      return { success: false, error: 'Access Denied: This account has been banned by Wasteland Admin.' };
    }

    const user: OnlineUser = {
      playerId,
      username: trimmed,
      authToken: 'jwt_mock_' + Math.random().toString(36).substring(2) + Date.now(),
      level: 1,
      isBanned: false,
      lastCloudSync: Date.now()
    };

    this.currentUser = user;
    this.isConnected = true;
    localStorage.setItem('DUNE_ONLINE_SESSION', JSON.stringify(user));

    // Update player name in local save
    const currentSave = SaveSystem.load();
    currentSave.playerId = user.playerId;
    currentSave.playerName = user.username;
    SaveSystem.save(currentSave);

    return { success: true, user };
  }

  public static async register(username: string): Promise<{ success: boolean; user?: OnlineUser; error?: string }> {
    return this.login(username);
  }

  public static logout(): void {
    this.currentUser = null;
    this.isConnected = false;
    localStorage.removeItem('DUNE_ONLINE_SESSION');
  }

  public static async cloudSync(localSave: SaveData): Promise<{ success: boolean; syncedSave?: SaveData; error?: string }> {
    if (!this.currentUser) {
      return { success: false, error: 'User is not logged into online network.' };
    }

    if (this.currentUser.isBanned) {
      return { success: false, error: 'Account is banned from cloud sync.' };
    }

    this.isSyncing = true;
    // Simulate network roundtrip latency: POST /api/player/cloud-save
    await new Promise(resolve => setTimeout(resolve, 800));
    this.isSyncing = false;

    // Server-side validation of currency rate: check for irrational jumps
    const validation = this.validatePlayerData(localSave);
    if (!validation.valid) {
      return { success: false, error: `Cloud Validation Rejected: ${validation.reason}` };
    }

    // Update cloud sync timestamp
    this.currentUser.lastCloudSync = Date.now();
    localStorage.setItem('DUNE_ONLINE_SESSION', JSON.stringify(this.currentUser));
    localStorage.setItem(`DUNE_CLOUD_BACKUP_${this.currentUser.playerId}`, JSON.stringify(localSave));

    return { success: true, syncedSave: localSave };
  }

  public static async fetchLeaderboard(): Promise<LeaderboardEntry[]> {
    // Simulating GET /api/leaderboard
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.simulatedLeaderboard].sort((a, b) => b.score - a.score);
  }

  public static async submitRunScore(score: number, survivalTime: number, bossesKilled: number, vehicleUsed: string): Promise<{ success: boolean; rank?: number }> {
    const user = this.currentUser;
    const playerName = user ? user.username : SaveSystem.load().playerName;
    const playerId = user ? user.playerId : SaveSystem.load().playerId;

    if (user && user.isBanned) {
      return { success: false };
    }

    // Server score sanity check: impossible score vs time check
    const maxTheoreticalScore = (survivalTime * 150) + (bossesKilled * 6000) + 1000;
    const isVerified = score <= maxTheoreticalScore;

    const newEntry: LeaderboardEntry = {
      rank: 0,
      playerId,
      playerName,
      score,
      survivalTime,
      bossesKilled,
      vehicleUsed,
      verified: isVerified,
      date: new Date().toISOString().split('T')[0]
    };

    // Merge into simulated leaderboard
    const existingIndex = this.simulatedLeaderboard.findIndex(e => e.playerId === playerId);
    if (existingIndex >= 0) {
      if (score > this.simulatedLeaderboard[existingIndex].score) {
        this.simulatedLeaderboard[existingIndex] = newEntry;
      }
    } else {
      this.simulatedLeaderboard.push(newEntry);
    }

    this.simulatedLeaderboard.sort((a, b) => b.score - a.score);
    this.simulatedLeaderboard.forEach((entry, idx) => {
      entry.rank = idx + 1;
    });

    const finalRank = this.simulatedLeaderboard.findIndex(e => e.playerId === playerId) + 1;
    return { success: true, rank: finalRank };
  }

  // Admin & Integrity Controls
  public static banPlayer(playerId: string): void {
    this.bannedPlayerIds.add(playerId);
    if (this.currentUser && this.currentUser.playerId === playerId) {
      this.currentUser.isBanned = true;
      localStorage.setItem('DUNE_ONLINE_SESSION', JSON.stringify(this.currentUser));
    }
  }

  public static unbanPlayer(playerId: string): void {
    this.bannedPlayerIds.delete(playerId);
    if (this.currentUser && this.currentUser.playerId === playerId) {
      this.currentUser.isBanned = false;
      localStorage.setItem('DUNE_ONLINE_SESSION', JSON.stringify(this.currentUser));
    }
  }

  public static isPlayerBanned(playerId: string): boolean {
    return this.bannedPlayerIds.has(playerId);
  }

  public static validatePlayerData(data: SaveData): ServerValidationResult {
    // Prevent negative balances or NaN injections
    if (data.coins < 0 || isNaN(data.coins)) {
      return { valid: false, reason: 'Invalid or negative coin balance detected' };
    }
    if (data.scrap < 0 || isNaN(data.scrap)) {
      return { valid: false, reason: 'Invalid or negative scrap balance detected' };
    }
    if (data.coins > 99999999) {
      return { valid: false, reason: 'Suspicious economy overflow: balance exceeded server safety ceiling' };
    }
    return { valid: true };
  }

  private static hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
}
