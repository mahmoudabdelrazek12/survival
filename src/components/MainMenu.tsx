import React from 'react';
import { 
  Play, Wrench, Shield, Target, Crosshair, User, Settings, 
  Palette, Terminal, DollarSign, Cloud, Compass, Smartphone, 
  Sparkles, Globe, Award, Flame
} from 'lucide-react';
import { SaveData } from '../types/game';
import { INITIAL_VEHICLES } from '../game/data/gameData';
import { getMapById } from '../game/data/mapsData';
import { SoundSynthesizer } from '../game/audio/SoundSynthesizer';
import { t } from '../game/data/translations';
import { SaveSystem } from '../game/storage/SaveSystem';
import { AdMobBanner } from './AdMobBanner';

interface MainMenuProps {
  saveData: SaveData;
  onPlay: () => void;
  onOpenGarage: () => void;
  onOpenOutpost: () => void;
  onOpenMissions: () => void;
  onOpenShop: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenAssets: () => void;
  onOpenAdmin: () => void;
  onOpenMapSelect: () => void;
  onOpenAndroidExport: () => void;
  onOpenPlayStoreAudit: () => void;
  onShowAdMob: () => void;
  onLanguageChange: (lang: 'ar' | 'en') => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  saveData,
  onPlay,
  onOpenGarage,
  onOpenOutpost,
  onOpenMissions,
  onOpenShop,
  onOpenProfile,
  onOpenSettings,
  onOpenAssets,
  onOpenAdmin,
  onOpenMapSelect,
  onOpenAndroidExport,
  onOpenPlayStoreAudit,
  onShowAdMob,
  onLanguageChange,
}) => {
  const lang = saveData.settings.language || 'ar';
  const activeVehicle = INITIAL_VEHICLES.find(v => v.id === saveData.selectedVehicleId) || INITIAL_VEHICLES[0];
  const activeMap = getMapById(saveData.settings.selectedMapId || 'dune_sea');

  const handleButtonClick = (action: () => void) => {
    SoundSynthesizer.playClick();
    action();
  };

  const toggleLanguage = () => {
    const nextLang = lang === 'ar' ? 'en' : 'ar';
    SoundSynthesizer.playClick();
    saveData.settings.language = nextLang;
    SaveSystem.save(saveData);
    onLanguageChange(nextLang);
  };

  const dailyStreak = saveData.dailyMissions?.streak || 1;

  return (
    <div 
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="relative w-full h-full flex flex-col justify-between p-3 sm:p-5 select-none font-sans overflow-hidden bg-zinc-950"
    >
      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Sky gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-950/35 via-zinc-950/90 to-zinc-950" />
        
        {/* Warm Ambient Sun Flare */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-amber-500/10 rounded-full blur-[130px]" />
        
        {/* Desert Dune Silhouettes */}
        <svg className="absolute bottom-0 left-0 w-full h-64 opacity-20" preserveAspectRatio="none" viewBox="0 0 1200 300">
          <path d="M0,190 C150,140 350,220 500,160 C650,100 850,230 1000,180 C1100,150 1180,200 1200,210 L1200,300 L0,300 Z" fill="#d97706" />
          <path d="M0,230 C200,190 400,260 600,210 C800,160 1000,250 1200,220 L1200,300 L0,300 Z" fill="#78350f" />
        </svg>

        {/* Ambient Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#451a03_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
      </div>

      {/* Top Header Bar */}
      <div className="relative z-10 flex justify-between items-center gap-3">
        {/* Branding & Version */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 border border-amber-400/50 flex items-center justify-center font-black text-2xl text-black shadow-lg shadow-amber-500/20">
            D
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black tracking-widest text-zinc-100 block leading-none">
              {t(lang, 'appTitle')}
            </span>
            <span className="text-[10px] text-amber-400 font-mono tracking-wider font-bold">
              {t(lang, 'versionInfo')} • ANDROID LANDSCAPE EDITION
            </span>
          </div>
        </div>

        {/* Top Right: Player Stats & Language & Store Audit */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-700 hover:border-amber-400 text-xs font-bold text-zinc-200 transition active:scale-95 shadow cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
          </button>

          {/* Google Play Readiness Audit Button */}
          <button
            onClick={() => handleButtonClick(onOpenPlayStoreAudit)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 hover:bg-emerald-900/80 text-xs font-black text-emerald-300 transition active:scale-95 shadow cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">{lang === 'ar' ? 'جاهزية المتجر' : 'Store Ready'}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          {/* Currencies Pill */}
          <div className="flex items-center gap-3 bg-zinc-950/80 border border-zinc-800/90 px-3.5 py-1.5 rounded-2xl shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold text-xs sm:text-sm">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              <span>{saveData.coins.toLocaleString()}</span>
            </div>
            <div className="h-4 w-px bg-zinc-800" />
            <div className="flex items-center gap-1.5 text-zinc-300 font-mono font-bold text-xs sm:text-sm">
              <Wrench className="w-3.5 h-3.5 text-zinc-400" />
              <span>{saveData.scrap.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Center Hero Launchpad */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto py-2">
        {/* Selected Sector Badge */}
        <button
          onClick={() => handleButtonClick(onOpenMapSelect)}
          className="mb-3 px-4 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/50 text-xs text-zinc-300 flex items-center gap-2 transition active:scale-95 shadow-lg group cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform" />
          <span>{lang === 'ar' ? 'الخريطة المحددة: ' : 'Selected Sector: '}</span>
          <strong className="text-amber-400">{lang === 'ar' ? activeMap.nameAr : activeMap.name}</strong>
          <span className="text-[10px] text-zinc-500 group-hover:text-zinc-300 font-bold">[{lang === 'ar' ? 'تغيير' : 'Change'}]</span>
        </button>

        {/* Big Launch Button */}
        <button
          onClick={() => {
            SoundSynthesizer.playPickup('fuel');
            onPlay();
          }}
          className="group relative px-12 sm:px-16 py-4 sm:py-5 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-zinc-950 font-black text-lg sm:text-2xl tracking-wider transition-all duration-300 shadow-[0_0_50px_rgba(245,158,11,0.4)] hover:shadow-[0_0_70px_rgba(245,158,11,0.65)] active:scale-95 flex items-center gap-3 cursor-pointer border-2 border-amber-300"
        >
          <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-current group-hover:translate-x-1 transition-transform" />
          <span>{t(lang, 'launchExpedition')}</span>
        </button>

        {/* Active Loadout Summary */}
        <div className="mt-4 flex items-center gap-2 text-xs">
          <div className="flex items-center gap-2 bg-zinc-900/70 border border-zinc-800 px-3 py-1.5 rounded-full text-zinc-400">
            <span>{lang === 'ar' ? 'السيارة: ' : 'Rig: '}<strong className="text-zinc-200">{activeVehicle.name}</strong></span>
            <span>•</span>
            <span>{lang === 'ar' ? 'السلاح: ' : 'Gun: '}<strong className="text-amber-400">{saveData.activeWeaponId.toUpperCase()}</strong></span>
          </div>
        </div>
      </div>

      {/* Official Google AdMob Test Banner */}
      <div className="relative z-10 w-full flex justify-center">
        <AdMobBanner
          lang={lang}
          onAdClick={onShowAdMob}
        />
      </div>

      {/* Bottom Functional Grid Navigation */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-2.5 max-w-6xl mx-auto w-full">
        {/* Maps Selection Button */}
        <button
          onClick={() => handleButtonClick(onOpenMapSelect)}
          className="bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/50 p-2 sm:p-2.5 rounded-xl flex flex-col items-center gap-1 transition text-zinc-300 hover:text-white cursor-pointer"
        >
          <Compass className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] sm:text-[11px] font-bold tracking-wider">{t(lang, 'maps')}</span>
        </button>

        {/* Garage */}
        <button
          onClick={() => handleButtonClick(onOpenGarage)}
          className="bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/50 p-2 sm:p-2.5 rounded-xl flex flex-col items-center gap-1 transition text-zinc-300 hover:text-white cursor-pointer"
        >
          <Wrench className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] sm:text-[11px] font-bold tracking-wider">{t(lang, 'garage')}</span>
        </button>

        {/* Daily Missions & Bounties with Streak Flame */}
        <button
          onClick={() => handleButtonClick(onOpenMissions)}
          className="bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/50 p-2 sm:p-2.5 rounded-xl flex flex-col items-center gap-1 transition text-amber-300 hover:text-white cursor-pointer relative"
        >
          <div className="flex items-center gap-0.5">
            <Target className="w-4 h-4 text-amber-400" />
            <Flame className="w-3 h-3 text-orange-400 animate-bounce" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold tracking-wider">{lang === 'ar' ? 'المهام اليومية' : 'Daily Tasks'}</span>
        </button>

        {/* Outpost Base */}
        <button
          onClick={() => handleButtonClick(onOpenOutpost)}
          className="bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/50 p-2 sm:p-2.5 rounded-xl flex flex-col items-center gap-1 transition text-zinc-300 hover:text-white cursor-pointer"
        >
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] sm:text-[11px] font-bold tracking-wider">{t(lang, 'outpost')}</span>
        </button>

        {/* Arsenal */}
        <button
          onClick={() => handleButtonClick(onOpenShop)}
          className="bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/50 p-2 sm:p-2.5 rounded-xl flex flex-col items-center gap-1 transition text-zinc-300 hover:text-white cursor-pointer"
        >
          <Crosshair className="w-4 h-4 text-cyan-400" />
          <span className="text-[10px] sm:text-[11px] font-bold tracking-wider">{t(lang, 'arsenal')}</span>
        </button>

        {/* Android Export Guide */}
        <button
          onClick={() => handleButtonClick(onOpenAndroidExport)}
          className="bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 p-2 sm:p-2.5 rounded-xl flex flex-col items-center gap-1 transition text-emerald-300 hover:text-white cursor-pointer"
        >
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] sm:text-[11px] font-bold tracking-wider">{t(lang, 'androidExport')}</span>
        </button>

        {/* AdMob Test Ad Trigger */}
        <button
          onClick={() => handleButtonClick(onShowAdMob)}
          className="bg-amber-950/30 hover:bg-amber-900/40 border border-amber-500/40 p-2 sm:p-2.5 rounded-xl flex flex-col items-center gap-1 transition text-amber-300 hover:text-white cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] sm:text-[11px] font-bold tracking-wider">ADMOB ADS</span>
        </button>

        {/* Settings */}
        <button
          onClick={() => handleButtonClick(onOpenSettings)}
          className="bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/50 p-2 sm:p-2.5 rounded-xl flex flex-col items-center gap-1 transition text-zinc-300 hover:text-white cursor-pointer"
        >
          <Settings className="w-4 h-4 text-zinc-400" />
          <span className="text-[10px] sm:text-[11px] font-bold tracking-wider">{t(lang, 'settings')}</span>
        </button>
      </div>
    </div>
  );
};
