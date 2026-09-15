import React, { useState, useEffect } from 'react';
import { SoundSynthesizer } from '../game/audio/SoundSynthesizer';
import { Play, CheckCircle2, Gift, X, Award, ExternalLink } from 'lucide-react';

export type AdType = 'INTERSTITIAL' | 'REWARDED';

interface AdMobModalProps {
  type: AdType;
  isOpen: boolean;
  onClose: () => void;
  onRewardGranted?: (rewardType: 'COINS' | 'REVIVE') => void;
  lang?: 'ar' | 'en';
}

export const AdMobModal: React.FC<AdMobModalProps> = ({
  type,
  isOpen,
  onClose,
  onRewardGranted,
  lang = 'ar',
}) => {
  const [countdown, setCountdown] = useState<number>(type === 'REWARDED' ? 5 : 3);
  const [canClose, setCanClose] = useState<boolean>(false);
  const [rewardClaimed, setRewardClaimed] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(type === 'REWARDED' ? 5 : 3);
      setCanClose(false);
      setRewardClaimed(false);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanClose(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, type]);

  if (!isOpen) return null;

  const handleClaimReward = () => {
    SoundSynthesizer.playPickup('coin');
    setRewardClaimed(true);
    if (onRewardGranted) {
      onRewardGranted('COINS');
    }
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const adUnitId =
    type === 'INTERSTITIAL'
      ? 'ca-app-pub-3940256099942544/1033173712' // Google AdMob Official Test Interstitial
      : 'ca-app-pub-3940256099942544/5224354917'; // Google AdMob Official Test Rewarded Video

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-in fade-in duration-200">
      <div 
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        className="relative w-full max-w-lg bg-zinc-950 border-2 border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Top Google AdMob Test Header Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
              Google AdMob Test Ad
            </span>
            <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline truncate max-w-[200px]">
              {adUnitId}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!canClose ? (
              <span className="text-zinc-400 font-mono text-xs">
                {lang === 'ar' ? `إغلاق بعد ${countdown}ث` : `Reward in ${countdown}s`}
              </span>
            ) : (
              <button
                onClick={() => {
                  SoundSynthesizer.playClick();
                  onClose();
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'تخطي / إغلاق' : 'Close Ad'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Ad Video / Creative Canvas Simulator */}
        <div className="relative bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-900 p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
          {/* Simulated Game Ad Banner */}
          <div className="w-20 h-20 mb-4 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center shadow-xl shadow-amber-500/20 ring-4 ring-amber-500/30">
            <Play className="w-10 h-10 text-black fill-black ml-1" />
          </div>

          <span className="text-xs uppercase tracking-widest font-mono text-amber-400 font-bold mb-1">
            {type === 'REWARDED' ? (lang === 'ar' ? 'إعلان بمكافأة مجانية' : 'Rewarded Video Ad') : (lang === 'ar' ? 'إعلان بيني تجريبي' : 'Interstitial Test Ad')}
          </span>

          <h3 className="text-xl font-black text-zinc-100 mb-2">
            {type === 'REWARDED' 
              ? (lang === 'ar' ? 'احصل على 350 عملة و 150 خردة مجانًا!' : 'Get 350 Coins & 150 Scrap Free!')
              : (lang === 'ar' ? 'شكراً لدعمك استمرار اللعبة' : 'Dune Survival: Wasteland Outlaw')}
          </h3>

          <p className="text-xs text-zinc-400 max-w-sm mb-6 leading-relaxed">
            {lang === 'ar'
              ? 'هذا إعلان تجريبي رسمي من Google AdMob لاختبار دمج الإعلانات البينية والإعلانات بمكافأة.'
              : 'This is an official Google AdMob test creative to verify production Android monetization.'}
          </p>

          {/* Video Progress Bar */}
          <div className="w-full max-w-xs h-2 rounded-full bg-zinc-800 overflow-hidden mb-6">
            <div 
              className="h-full bg-amber-400 transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${(( (type === 'REWARDED' ? 5 : 3) - countdown) / (type === 'REWARDED' ? 5 : 3)) * 100}%` }}
            />
          </div>

          {/* Action Button */}
          {type === 'REWARDED' && canClose && !rewardClaimed && (
            <button
              onClick={handleClaimReward}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black text-sm shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all"
            >
              <Gift className="w-4 h-4" />
              <span>{lang === 'ar' ? 'استلم المكافأة الآن (+350 عملة)' : 'Claim Reward (+350 Coins)'}</span>
            </button>
          )}

          {rewardClaimed && (
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm bg-emerald-950/60 px-4 py-2 rounded-xl border border-emerald-500/40 animate-in zoom-in-95">
              <CheckCircle2 className="w-5 h-5" />
              <span>{lang === 'ar' ? 'تمت إضافة المكافأة بنجاح!' : 'Reward Granted Successfully!'}</span>
            </div>
          )}

          {type === 'INTERSTITIAL' && canClose && (
            <button
              onClick={() => {
                SoundSynthesizer.playClick();
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-sm shadow-md transition-all active:scale-95"
            >
              {lang === 'ar' ? 'متابعة اللعب' : 'Continue'}
            </button>
          )}
        </div>

        {/* Footer info note */}
        <div className="px-4 py-2 bg-zinc-950 border-t border-zinc-900 text-center text-[11px] text-zinc-500">
          {lang === 'ar' 
            ? 'AdMob SDK جاهز ومجهز للنشر على Google Play Store'
            : 'AdMob SDK ready for Android build release'}
        </div>
      </div>
    </div>
  );
};
