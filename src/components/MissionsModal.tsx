import React, { useState, useEffect } from 'react';
import { X, Target, Calendar, Flame, CheckCircle2, DollarSign, Wrench, Clock, Sparkles } from 'lucide-react';
import { SaveData, Mission } from '../types/game';
import { MissionSystem } from '../game/systems/MissionSystem';
import { SoundSynthesizer } from '../game/audio/SoundSynthesizer';
import { Language } from '../game/data/translations';

interface MissionsModalProps {
  saveData: SaveData;
  onClose: () => void;
  onSaveUpdated: (data: SaveData) => void;
  lang?: Language;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({ 
  saveData, 
  onClose, 
  onSaveUpdated,
  lang = 'ar' 
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'lifetime'>('daily');
  const [timeLeft, setTimeLeft] = useState(MissionSystem.getTimeUntilDailyReset());

  // Ensure daily missions are initialized
  useEffect(() => {
    MissionSystem.initializeDailyMissions(saveData);
    onSaveUpdated({ ...saveData });

    const interval = setInterval(() => {
      setTimeLeft(MissionSystem.getTimeUntilDailyReset());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleClaim = (missionId: string) => {
    SoundSynthesizer.playClick();
    const success = MissionSystem.claimMission(saveData, missionId);
    if (success) {
      onSaveUpdated({ ...saveData });
    }
  };

  const handleClaimStreak = () => {
    SoundSynthesizer.playClick();
    const success = MissionSystem.claimDailyStreak(saveData);
    if (success) {
      onSaveUpdated({ ...saveData });
    }
  };

  const dailyState = saveData.dailyMissions || MissionSystem.initializeDailyMissions(saveData);
  const streak = dailyState.streak || 1;
  const streakClaimed = dailyState.streakClaimedToday;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md font-sans">
      <div 
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-100 tracking-wide">
                {lang === 'ar' ? 'مركز المهام والجوائز اليومية' : 'MISSIONS & DAILY BOUNTIES'}
              </h2>
              <p className="text-xs text-zinc-400">
                {lang === 'ar' 
                  ? 'أنجز تحديات البقاء لتحصل على الذهب والخردة النادرة لتطوير سيارتك وقاعدتك' 
                  : 'Complete survival challenges to earn coins, scrap, and tech upgrades'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs & Reset Timer */}
        <div className="px-6 py-3 bg-zinc-900/40 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => {
                SoundSynthesizer.playClick();
                setActiveTab('daily');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
                activeTab === 'daily'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>{lang === 'ar' ? 'المهام اليومية' : 'Daily Missions'}</span>
            </button>

            <button
              onClick={() => {
                SoundSynthesizer.playClick();
                setActiveTab('lifetime');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
                activeTab === 'lifetime'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>{lang === 'ar' ? 'الجوائز العامة' : 'Lifetime Bounties'}</span>
            </button>
          </div>

          {activeTab === 'daily' && (
            <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-xl text-xs text-zinc-400">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{lang === 'ar' ? 'تتجدد المهام بعد: ' : 'Resets in: '}</span>
              <strong className="font-mono text-zinc-200">
                {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
              </strong>
            </div>
          )}
        </div>

        {/* Daily Streak Card (Only on daily tab) */}
        {activeTab === 'daily' && (
          <div className="px-6 pt-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400">
                  <Flame className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-zinc-100">
                      {lang === 'ar' ? `سلسلة الأيام المتتالية: ${streak} أيام` : `Daily Login Streak: Day ${streak}`}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                      {lang === 'ar' ? 'مكافأة مضاعفة' : 'Bonus Boost'}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-400">
                    {lang === 'ar' ? 'سجل دخولك يومياً لترقية المكافأة الذهبية' : 'Log in every day to ramp up free resources'}
                  </span>
                </div>
              </div>

              {streakClaimed ? (
                <span className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black flex items-center gap-1.5 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'تم استلام مكافأة اليوم' : 'Claimed Today'}</span>
                </span>
              ) : (
                <button
                  onClick={handleClaimStreak}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs shadow-lg transition active:scale-95 flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{lang === 'ar' ? `استلام مكافأة السلسلة (+${streak * 200} ذهب)` : `Claim Streak (+${streak * 200}c)`}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content Missions List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {(activeTab === 'daily' ? dailyState.missions : saveData.missions).map((mission: Mission) => {
            const progressRatio = Math.min(1, mission.currentCount / mission.targetCount);
            const isReadyToClaim = mission.completed && !mission.claimed;

            return (
              <div
                key={mission.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  mission.claimed
                    ? 'bg-zinc-950/40 border-zinc-800/60 opacity-60'
                    : isReadyToClaim
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-lg'
                    : 'bg-zinc-900/60 border-zinc-800'
                }`}
              >
                <div className="flex-1 w-full">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-zinc-100 text-sm">
                      {lang === 'ar' && mission.titleAr ? mission.titleAr : mission.title}
                    </h3>
                    <span className="text-xs text-zinc-400 font-bold font-mono">
                      {mission.currentCount.toLocaleString()} / {mission.targetCount.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mb-2">
                    {lang === 'ar' && mission.descriptionAr ? mission.descriptionAr : mission.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/80">
                    <div
                      className={`h-full transition-all duration-500 ${
                        mission.completed 
                          ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' 
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${progressRatio * 100}%` }}
                    />
                  </div>
                </div>

                {/* Rewards & Action */}
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                  <div className="flex items-center gap-3 text-xs font-bold font-mono">
                    <span className="flex items-center gap-1 text-amber-400">
                      <DollarSign className="w-3.5 h-3.5" /> +{mission.rewardCoins}
                    </span>
                    <span className="flex items-center gap-1 text-zinc-300">
                      <Wrench className="w-3.5 h-3.5 text-zinc-400" /> +{mission.rewardScrap}
                    </span>
                  </div>

                  {mission.claimed ? (
                    <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold px-3.5 py-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4" /> 
                      <span>{lang === 'ar' ? 'مستلم' : 'CLAIMED'}</span>
                    </span>
                  ) : isReadyToClaim ? (
                    <button
                      onClick={() => handleClaim(mission.id)}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs rounded-xl shadow-lg cursor-pointer active:scale-95 animate-pulse"
                    >
                      {lang === 'ar' ? 'استلام المكافأة' : 'CLAIM REWARD'}
                    </button>
                  ) : (
                    <span className="text-xs text-zinc-500 font-bold px-3 py-1.5 bg-zinc-900 rounded-xl border border-zinc-800">
                      {Math.round(progressRatio * 100)}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
