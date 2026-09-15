import React from 'react';
import { Skull, Fuel, Clock, DollarSign, Wrench, Navigation, RotateCcw, Home, Trophy, Play, Gift, Sparkles } from 'lucide-react';
import { RunSummary } from '../game/core/GameEngine';
import { t, Language } from '../game/data/translations';
import { SoundSynthesizer } from '../game/audio/SoundSynthesizer';

interface GameOverModalProps {
  summary: RunSummary;
  onRestart: () => void;
  onGoToGarage: () => void;
  onGoToMenu: () => void;
  onWatchRewardedAd: () => void;
  onShowInterstitialAd: () => void;
  lang?: Language;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  summary,
  onRestart,
  onGoToGarage,
  onGoToMenu,
  onWatchRewardedAd,
  onShowInterstitialAd,
  lang = 'ar',
}) => {
  const isFuelDeath = summary.causeOfDeath === 'FUEL_EXHAUSTION';
  const score = Math.round(
    summary.survivalTime * 12 +
    summary.enemiesKilled * 150 +
    summary.bossesKilled * 2500 +
    summary.coinsEarned * 2 +
    summary.scrapEarned * 3
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-lg animate-in fade-in duration-200">
      <div 
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Banner */}
        <div className={`py-6 px-6 text-center border-b ${
          isFuelDeath ? 'bg-amber-950/30 border-amber-800/40' : 'bg-rose-950/30 border-rose-800/40'
        }`}>
          <div className="inline-flex p-3 rounded-2xl bg-zinc-900 border border-zinc-800 mb-2">
            {isFuelDeath ? (
              <Fuel className="w-8 h-8 text-amber-500 animate-bounce" />
            ) : (
              <Skull className="w-8 h-8 text-rose-500 animate-pulse" />
            )}
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-wider text-zinc-100">
            {isFuelDeath ? t(lang, 'strandedInDunes') : t(lang, 'vehicleDestroyed')}
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto leading-relaxed">
            {isFuelDeath ? t(lang, 'fuelDeathMsg') : t(lang, 'hullDeathMsg')}
          </p>
        </div>

        {/* Score & Run Breakdown */}
        <div className="p-6 flex flex-col gap-4">
          {/* Total Run Score */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 text-center">
            <span className="text-xs text-zinc-400 font-black uppercase tracking-widest block mb-1">
              {t(lang, 'expeditionScore')}
            </span>
            <span className="text-4xl sm:text-5xl font-black font-mono text-amber-400">
              {score.toLocaleString()}
            </span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="bg-zinc-900/50 border border-zinc-800/80 p-3 rounded-xl flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-zinc-500 text-[10px] block uppercase font-bold">{t(lang, 'timeAlive')}</span>
                <span className="font-bold text-zinc-200 font-mono">
                  {Math.floor(summary.survivalTime / 60)}m {summary.survivalTime % 60}s
                </span>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800/80 p-3 rounded-xl flex items-center gap-2.5">
              <Skull className="w-4 h-4 text-rose-400 shrink-0" />
              <div>
                <span className="text-zinc-500 text-[10px] block uppercase font-bold">{t(lang, 'enemiesDefeated')}</span>
                <span className="font-bold text-zinc-200 font-mono">{summary.enemiesKilled}</span>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800/80 p-3 rounded-xl flex items-center gap-2.5">
              <Trophy className="w-4 h-4 text-orange-400 shrink-0" />
              <div>
                <span className="text-zinc-500 text-[10px] block uppercase font-bold">{lang === 'ar' ? 'الزعماء' : 'BOSSES'}</span>
                <span className="font-bold text-zinc-200 font-mono">{summary.bossesKilled}</span>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800/80 p-3 rounded-xl flex items-center gap-2.5">
              <DollarSign className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-zinc-500 text-[10px] block uppercase font-bold">{lang === 'ar' ? 'الذهب المجموع' : 'COINS'}</span>
                <span className="font-bold text-amber-400 font-mono">+{summary.coinsEarned}</span>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800/80 p-3 rounded-xl flex items-center gap-2.5">
              <Wrench className="w-4 h-4 text-zinc-400 shrink-0" />
              <div>
                <span className="text-zinc-500 text-[10px] block uppercase font-bold">{lang === 'ar' ? 'الخردة' : 'SCRAP'}</span>
                <span className="font-bold text-zinc-300 font-mono">+{summary.scrapEarned}</span>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800/80 p-3 rounded-xl flex items-center gap-2.5">
              <Navigation className="w-4 h-4 text-sky-400 shrink-0" />
              <div>
                <span className="text-zinc-500 text-[10px] block uppercase font-bold">{lang === 'ar' ? 'المسافة' : 'DISTANCE'}</span>
                <span className="font-bold text-sky-300 font-mono">{summary.distanceTraveled} M</span>
              </div>
            </div>
          </div>

          {/* AdMob Rewarded Action Bonus Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <Gift className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="font-black text-amber-300 block">
                  {lang === 'ar' ? 'مكافأة AdMob: شاهد إعلاناً واحصل على غنائم إضافية' : 'Google AdMob Rewarded Video'}
                </span>
                <span className="text-[11px] text-zinc-400">
                  {lang === 'ar' ? '+350 عملة ذهبية و +150 خردة فورية' : '+350 Coins & +150 Scrap instantly'}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                SoundSynthesizer.playClick();
                onWatchRewardedAd();
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>{lang === 'ar' ? 'مشاهدة' : 'Watch Ad'}</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 pt-0 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={() => {
              SoundSynthesizer.playClick();
              // Show test interstitial ad or restart
              onRestart();
            }}
            className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-sm rounded-xl shadow-xl flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> 
            <span>{t(lang, 'retry')}</span>
          </button>

          <button
            onClick={() => {
              SoundSynthesizer.playClick();
              onGoToGarage();
            }}
            className="py-3 px-5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Wrench className="w-4 h-4" /> 
            <span>{t(lang, 'garageBtn')}</span>
          </button>

          <button
            onClick={() => {
              SoundSynthesizer.playClick();
              onShowInterstitialAd();
            }}
            className="py-3 px-3 bg-zinc-900 hover:bg-zinc-800 text-amber-400 font-bold text-xs rounded-xl border border-zinc-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
            title="AdMob Interstitial Test"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">{lang === 'ar' ? 'إعلان بيني' : 'Interstitial'}</span>
          </button>

          <button
            onClick={() => {
              SoundSynthesizer.playClick();
              onGoToMenu();
            }}
            className="py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition flex items-center justify-center cursor-pointer active:scale-95"
            title="Main Menu"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
