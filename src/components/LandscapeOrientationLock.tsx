import React, { useState, useEffect } from 'react';
import { Smartphone, RotateCw, Play } from 'lucide-react';
import { Language } from '../game/data/translations';

interface LandscapeOrientationLockProps {
  lang?: Language;
}

export const LandscapeOrientationLock: React.FC<LandscapeOrientationLockProps> = ({ lang = 'ar' }) => {
  const [isPortrait, setIsPortrait] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Check if viewport height exceeds width and width is mobile/tablet range (< 900px)
      const portrait = window.innerHeight > window.innerWidth && window.innerWidth < 800;
      setIsPortrait(portrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isPortrait || dismissed) {
    return null;
  }

  return (
    <div 
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-[999] bg-zinc-950/98 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center select-none"
    >
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-3xl bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.25)]">
          <Smartphone className="w-12 h-12 text-amber-400 animate-[spin_3s_ease-in-out_infinite]" />
        </div>
        <div className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-orange-600 text-black">
          <RotateCw className="w-5 h-5 animate-spin" />
        </div>
      </div>

      <span className="text-xs uppercase tracking-[0.3em] font-black text-amber-400 mb-2 font-mono">
        {lang === 'ar' ? 'وضع اللعب الأفقي إلزامي' : 'LANDSCAPE ORIENTATION REQUIRED'}
      </span>

      <h2 className="text-2xl sm:text-3xl font-black text-zinc-100 mb-3 tracking-wide">
        {lang === 'ar' ? 'يرجى تدوير الهاتف بالعرض' : 'Rotate Your Phone to Landscape'}
      </h2>

      <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mb-8 leading-relaxed">
        {lang === 'ar'
          ? 'تم تصميم أدوات قيادة الدواسات، عداد السرعة، ورادار الخريطة لتعمل حصرياً بالوضع الأفقي كما في ألعاب سباقات وتصويب أندرويد الحقيقية.'
          : 'Cockpit pedals, tactical radar map, and speedometer are optimized exclusively for horizontal landscape gaming.'}
      </p>

      <button
        onClick={() => setDismissed(true)}
        className="px-6 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-bold transition active:scale-95 flex items-center gap-2"
      >
        <Play className="w-3.5 h-3.5" />
        <span>{lang === 'ar' ? 'المتابعة على أي حال (تجربة شاشة)' : 'Continue anyway (Preview)'}</span>
      </button>
    </div>
  );
};
