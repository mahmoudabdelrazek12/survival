import { Mission, SaveData, DailyMissionState } from '../../types/game';
import { SaveSystem } from '../storage/SaveSystem';
import { SoundSynthesizer } from '../audio/SoundSynthesizer';

export class MissionSystem {
  private static getTodayString(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  public static initializeDailyMissions(saveData: SaveData): DailyMissionState {
    const today = this.getTodayString();

    if (saveData.dailyMissions && saveData.dailyMissions.lastDate === today) {
      return saveData.dailyMissions;
    }

    // New Day: calculate streak
    let newStreak = 1;
    if (saveData.dailyMissions) {
      const lastDate = new Date(saveData.dailyMissions.lastDate);
      const currentDate = new Date(today);
      const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        newStreak = (saveData.dailyMissions.streak || 1) + 1;
      } else if (diffDays > 1) {
        newStreak = 1; // Reset streak if missed day
      } else {
        newStreak = saveData.dailyMissions.streak || 1;
      }
    }

    const freshMissions: Mission[] = [
      {
        id: `daily_zombies_${today}`,
        title: 'Night Horde Purge',
        titleAr: 'تطهير حشود الزومبي الليلية',
        description: 'Eliminate 15 zombies during the night phases.',
        descriptionAr: 'اقضِ على 15 زومبي أثناء فترات الليل المظلمة.',
        targetCount: 15,
        currentCount: 0,
        rewardCoins: 550,
        rewardScrap: 220,
        completed: false,
        claimed: false,
        type: 'zombies',
      },
      {
        id: `daily_missile_${today}`,
        title: 'Orbital Retribution',
        titleAr: 'الضربة الصاروخية التكتيكية',
        description: 'Call in 2 tactical base missile orbital strikes.',
        descriptionAr: 'استدعِ صاروخ القاعدة التكتيكي مرتين على أهداف العدو.',
        targetCount: 2,
        currentCount: 0,
        rewardCoins: 600,
        rewardScrap: 250,
        completed: false,
        claimed: false,
        type: 'missile_strike',
      },
      {
        id: `daily_distance_${today}`,
        title: 'Long Haul Wanderer',
        titleAr: 'طواف الكثبان البعيدة',
        description: 'Travel at least 2,500 meters in a single survival run.',
        descriptionAr: 'اقطع مسافة 2,500 متر عبر الكثبان في رحلة واحدة.',
        targetCount: 2500,
        currentCount: 0,
        rewardCoins: 450,
        rewardScrap: 180,
        completed: false,
        claimed: false,
        type: 'distance',
      },
      {
        id: `daily_raiders_${today}`,
        title: 'Convoy Buster',
        titleAr: 'صائد قوافل قطاع الطرق',
        description: 'Destroy 20 enemy raider trucks or scout buggies.',
        descriptionAr: 'دمر 20 شاحنة ومركبة استطلاع لقطاع الطرق.',
        targetCount: 20,
        currentCount: 0,
        rewardCoins: 500,
        rewardScrap: 200,
        completed: false,
        claimed: false,
        type: 'kills',
      },
      {
        id: `daily_scavenger_${today}`,
        title: 'Scrap & Fuel Hoarder',
        titleAr: 'جامع مؤن الصحراء',
        description: 'Collect 6 fuel canisters or scrap caches in the dunes.',
        descriptionAr: 'اجمع 6 براميل وقود أو صناديق خردة متناثرة.',
        targetCount: 6,
        currentCount: 0,
        rewardCoins: 400,
        rewardScrap: 150,
        completed: false,
        claimed: false,
        type: 'scrap',
      },
    ];

    saveData.dailyMissions = {
      lastDate: today,
      missions: freshMissions,
      streak: newStreak,
      streakClaimedToday: false,
    };

    SaveSystem.save(saveData);
    return saveData.dailyMissions;
  }

  public static getTimeUntilDailyReset(): { hours: number; minutes: number; seconds: number } {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    const diffMs = Math.max(0, tomorrow.getTime() - now.getTime());

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    return { hours, minutes, seconds };
  }

  public static checkProgress(saveData: SaveData, type: Mission['type'], amount: number): boolean {
    let anyCompleted = false;

    // Check Lifetime Missions
    for (let i = 0; i < saveData.missions.length; i++) {
      const mission = saveData.missions[i];
      if (mission.completed || mission.type !== type) continue;

      mission.currentCount = Math.min(mission.targetCount, mission.currentCount + amount);
      if (mission.currentCount >= mission.targetCount) {
        mission.completed = true;
        anyCompleted = true;
        SoundSynthesizer.playPickup('coin');
      }
    }

    // Check Daily Missions
    if (saveData.dailyMissions && saveData.dailyMissions.missions) {
      for (let i = 0; i < saveData.dailyMissions.missions.length; i++) {
        const dMission = saveData.dailyMissions.missions[i];
        if (dMission.completed || dMission.type !== type) continue;

        dMission.currentCount = Math.min(dMission.targetCount, dMission.currentCount + amount);
        if (dMission.currentCount >= dMission.targetCount) {
          dMission.completed = true;
          anyCompleted = true;
          SoundSynthesizer.playPickup('coin');
        }
      }
    }

    if (anyCompleted) {
      SaveSystem.save(saveData);
    }
    return anyCompleted;
  }

  public static claimMission(saveData: SaveData, missionId: string): boolean {
    // Look in lifetime missions
    let mission = saveData.missions.find(m => m.id === missionId);

    // If not found, look in daily missions
    if (!mission && saveData.dailyMissions) {
      mission = saveData.dailyMissions.missions.find(m => m.id === missionId);
    }

    if (!mission || !mission.completed || mission.claimed) {
      return false;
    }

    mission.claimed = true;
    saveData.coins += mission.rewardCoins;
    saveData.scrap += mission.rewardScrap;

    SoundSynthesizer.playPickup('coin');
    SaveSystem.save(saveData);
    return true;
  }

  public static claimDailyStreak(saveData: SaveData): boolean {
    if (!saveData.dailyMissions || saveData.dailyMissions.streakClaimedToday) {
      return false;
    }

    const streakRewardCoins = Math.min(1500, (saveData.dailyMissions.streak || 1) * 200);
    const streakRewardScrap = Math.min(750, (saveData.dailyMissions.streak || 1) * 100);

    saveData.coins += streakRewardCoins;
    saveData.scrap += streakRewardScrap;
    saveData.dailyMissions.streakClaimedToday = true;

    SoundSynthesizer.playPickup('coin');
    SaveSystem.save(saveData);
    return true;
  }
}
