import React, { useState } from 'react';
import { X, Info, ExternalLink } from 'lucide-react';
import { Language } from '../game/data/translations';

interface AdMobBannerProps {
  lang?: Language;
  onAdClick?: () => void;
}

export const AdMobBanner: React.FC<AdMobBannerProps> = ({ lang = 'ar', onAdClick }) => {
  const [closed, setClosed] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(false);

  if (closed) return null;

  return (
    <div className="w-full flex flex-col items-center justify-center my-1 z-30 select-none">
      {/* Official Google AdMob Test Banner Container (320x50 / 728x90 Adaptive) */}
      <div className="relative w-full max-w-[728px] sm:h-[50px] bg-zinc-900/95 border border-zinc-700/80 rounded-lg shadow-xl overflow-hidden flex items-center justify-between px-3 py-1.5 backdrop-blur-md">
        {/* Left / Info & Badge */}
        <div className="flex items-center gap-2">
          {/* AdChoices Google Badge */}
          <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded text-[10px] font-black text-black shadow-sm shrink-0">
            <span className="text-blue-600 font-bold">G</span>
            <span>{lang === 'ar' ? 'إعلان' : 'Ad'}</span>
          </div>

          {/* AdMob Test Tag */}
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black text-amber-400 font-mono tracking-wide">
                Google AdMob Test
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono hidden sm:inline">
                ca-app-pub-3940256099942544/6300978111
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 truncate max-w-[200px] sm:max-w-xs">
              {lang === 'ar' ? 'إعلان تجريبي رسمي من Google AdMob - معتمد للأندرويد' : 'Official Google AdMob Adaptive Banner creative test'}
            </span>
          </div>
        </div>

        {/* Center / Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (onAdClick) onAdClick();
              else setShowInfo(!showInfo);
            }}
            className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black font-black text-[10px] sm:text-xs transition active:scale-95 shadow flex items-center gap-1"
          >
            <span>{lang === 'ar' ? 'اختبار' : 'Test'}</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-1 text-zinc-400 hover:text-white rounded transition"
            title="AdMob Integration Info"
          >
            <Info className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setClosed(true)}
            className="p-1 text-zinc-500 hover:text-zinc-300 rounded transition"
            title="Close Banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Info popover if opened */}
      {showInfo && (
        <div 
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
          className="mt-1 w-full max-w-[728px] bg-zinc-950 border border-amber-500/40 p-3 rounded-xl text-xs text-zinc-300 shadow-2xl flex flex-col gap-2 animate-in fade-in duration-150"
        >
          <div className="flex justify-between items-center text-amber-400 font-black">
            <span>{lang === 'ar' ? 'معلومات تكامل Google AdMob للأندرويد:' : 'Google AdMob Android Integration:'}</span>
            <button onClick={() => setShowInfo(false)} className="text-zinc-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            {lang === 'ar'
              ? 'تستخدم اللعبة معرّفات اختبار AdMob المعتمدة من Google (`ca-app-pub-3940256099942544/...`). عند النشر على متجر Google Play، قم فقط بوضع معرفاتك الحقيقية من لوحة AdMob دون أي تعديل على كود اللعبة.'
              : 'This game runs Google AdMob official test units. For production release on Google Play, simply replace the test IDs with your live AdMob App ID & Unit IDs in Capacitor build.'}
          </p>
        </div>
      )}
    </div>
  );
};
