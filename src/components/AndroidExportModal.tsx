import React, { useState } from 'react';
import { SoundSynthesizer } from '../game/audio/SoundSynthesizer';
import { Smartphone, Download, Terminal, CheckCircle2, Copy, Check, X, Shield, Sparkles } from 'lucide-react';

interface AndroidExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'ar' | 'en';
}

export const AndroidExportModal: React.FC<AndroidExportModalProps> = ({
  isOpen,
  onClose,
  lang = 'ar',
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyCode = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    SoundSynthesizer.playClick();
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const stepsAr = [
    {
      title: '1. تثبيت Capacitor في المشروع',
      desc: 'Capacitor هو الأداة الرسمية الحديثة لتحويل أي تطبيق ويب (React/Vite) إلى تطبيق Android أصلي APK بسرعة وكفاءة فائقة.',
      code: 'npm install @capacitor/core @capacitor/cli @capacitor/android\nnpx cap init "Dune Survival" "com.dunesurvival.game" --web-dir dist',
    },
    {
      title: '2. بناء ملفات اللعبة وإضافة منصة الأندرويد',
      desc: 'نقوم بتوليد مجلد الإنتاج dist ثم تهيئة مشروع Android Studio الكامل تلقائياً:',
      code: 'npm run build\nnpx cap add android\nnpx cap copy android',
    },
    {
      title: '3. إضافة ملحقات AdMob وشاشة اللمس وملء الشاشة',
      desc: 'لتفعيل إعلانات AdMob وشاشات اللمس الحقيقية وإخفاء أزرار النظام (Immersive Fullscreen):',
      code: 'npm install @capacitor-community/admob\nnpx cap sync',
    },
    {
      title: '4. فتح المشروع في Android Studio وبناء APK',
      desc: 'افتح مجلد android في Android Studio، ثم اختر Build > Build Bundle(s) / APK(s) > Build APK(s) لإنتاج ملف APK قابل للتثبيت على أي هاتف أندرويد مباشرة، أو AAB لرفعه على Google Play Console.',
      code: 'npx cap open android',
    },
  ];

  const stepsEn = [
    {
      title: '1. Install Capacitor in the Project',
      desc: 'Capacitor is the modern open-source runtime to convert React/Vite web apps into high-performance native Android APKs.',
      code: 'npm install @capacitor/core @capacitor/cli @capacitor/android\nnpx cap init "Dune Survival" "com.dunesurvival.game" --web-dir dist',
    },
    {
      title: '2. Build Web Assets & Initialize Android Platform',
      desc: 'Build the production bundle into dist, then generate the complete native Android project directory:',
      code: 'npm run build\nnpx cap add android\nnpx cap copy android',
    },
    {
      title: '3. Install AdMob Plugin & Fullscreen Immersion',
      desc: 'Install the official Community AdMob plugin for monetization and sync the assets:',
      code: 'npm install @capacitor-community/admob\nnpx cap sync',
    },
    {
      title: '4. Open in Android Studio & Generate APK',
      desc: 'Open the android folder in Android Studio, then select Build > Build Bundle(s) / APK(s) > Build APK(s) to produce your signed release APK/AAB for Google Play Store.',
      code: 'npx cap open android',
    },
  ];

  const steps = lang === 'ar' ? stepsAr : stepsEn;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        className="relative w-full max-w-3xl bg-zinc-950 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide text-zinc-100 flex items-center gap-2">
                <span>{lang === 'ar' ? 'دليل تصدير اللعبة إلى أندرويد (APK / Google Play)' : 'Android APK Export Guide'}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Capacitor 6 Ready
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                {lang === 'ar' ? 'خطوات سريعة وسهلة لتوليد ملف APK جاهز للتثبيت على الهواتف' : 'Step-by-step workflow to generate native Android APK & publish to Play Store'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              SoundSynthesizer.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Key Advantages Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 border border-emerald-500/20 flex items-center gap-4 text-xs text-zinc-300">
            <Sparkles className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <strong className="text-emerald-300 font-bold block mb-0.5">
                {lang === 'ar' ? 'اللعبة جاهزة تماماً للأندرويد بدون أي تعديل إضافي!' : 'Engine is 100% Mobile Ready!'}
              </strong>
              {lang === 'ar'
                ? 'تدعم اللمس المتعدد (Multitouch)، وأزرار دواسة البنزين والرجوع المنفصلة، وأسلوب التخزين بدون إنترنت (Offline Storage)، وإعلانات AdMob التجريبية.'
                : 'Features built-in multi-touch pedaling & steering, offline persistence, full responsive canvas, and AdMob integration.'}
            </div>
          </div>

          {/* Steps List */}
          {steps.map((step, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
              <h3 className="text-sm font-black text-amber-300 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                {step.title}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {step.desc}
              </p>
              <div className="relative group mt-2">
                <pre className="p-3 rounded-lg bg-black/80 border border-zinc-800 text-[11px] font-mono text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed select-all">
                  {step.code}
                </pre>
                <button
                  onClick={() => copyCode(step.code, idx)}
                  className="absolute top-2 end-2 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-medium flex items-center gap-1.5 transition-all shadow"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">{lang === 'ar' ? 'تم النسخ!' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{lang === 'ar' ? 'نسخ' : 'Copy'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}

          {/* AdMob Configuration Hint */}
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs text-zinc-400 space-y-1">
            <div className="font-bold text-amber-400 flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              <span>{lang === 'ar' ? 'معرفات AdMob الحقيقية عند الرفع لـ Google Play' : 'Real Google AdMob Production IDs'}</span>
            </div>
            <p>
              {lang === 'ar'
                ? 'عند استخراج APK للنشر، استبدل معرفات الاختبار في `AndroidManifest.xml` بمعرف تطبيق AdMob الحقيقي الخاص بك (App ID) من لوحة تحكم AdMob.'
                : 'When releasing to the Google Play Store, replace the test App ID in AndroidManifest.xml with your real AdMob Application ID.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-zinc-800/80 bg-zinc-900/40 flex items-center justify-end">
          <button
            onClick={() => {
              SoundSynthesizer.playClick();
              onClose();
            }}
            className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm transition-all shadow-md active:scale-95"
          >
            {lang === 'ar' ? 'فهمت ذلك، تم' : 'Got It! Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
