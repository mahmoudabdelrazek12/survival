import React, { useEffect, useRef, useState } from 'react';
import { GameEngine, RunSummary } from './game/core/GameEngine';
import { SaveSystem } from './game/storage/SaveSystem';
import { SaveData, GameState } from './types/game';
import { SoundSynthesizer } from './game/audio/SoundSynthesizer';
import { MainMenu } from './components/MainMenu';
import { GameHUD } from './components/GameHUD';
import { GarageModal } from './components/GarageModal';
import { OutpostModal } from './components/OutpostModal';
import { MissionsModal } from './components/MissionsModal';
import { ShopModal } from './components/ShopModal';
import { ProfileModal } from './components/ProfileModal';
import { SettingsModal } from './components/SettingsModal';
import { AssetCatalogModal } from './components/AssetCatalogModal';
import { AdminDebugModal } from './components/AdminDebugModal';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { MapSelectModal } from './components/MapSelectModal';
import { AndroidExportModal } from './components/AndroidExportModal';
import { PlayStoreValidatorModal } from './components/PlayStoreValidatorModal';
import { AdMobModal, AdType } from './components/AdMobModal';
import { LandscapeOrientationLock } from './components/LandscapeOrientationLock';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [saveData, setSaveData] = useState<SaveData>(() => SaveSystem.load());
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [runSummary, setRunSummary] = useState<RunSummary | null>(null);
  const [bossBanner, setBossBanner] = useState<string | null>(null);
  const [rewardBanner, setRewardBanner] = useState<string | null>(null);

  // Modals state
  const [showGarage, setShowGarage] = useState(false);
  const [showOutpost, setShowOutpost] = useState(false);
  const [showMissions, setShowMissions] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAssets, setShowAssets] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showMapSelect, setShowMapSelect] = useState(false);
  const [showAndroidExport, setShowAndroidExport] = useState(false);
  const [showPlayStoreAudit, setShowPlayStoreAudit] = useState(false);

  // AdMob Modal state
  const [showAdMob, setShowAdMob] = useState(false);
  const [adMobType, setAdMobType] = useState<AdType>('INTERSTITIAL');

  const lang = saveData.settings.language || 'ar';

  // Initialize GameEngine once canvas is mounted
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current);
    engineRef.current = engine;
    engine.init();

    // Hook engine callbacks
    engine.onGameOver = (summary: RunSummary) => {
      setRunSummary(summary);
      setGameState('GAMEOVER');
      setSaveData({ ...engine.saveData });
    };

    engine.onBossEncounter = (bossTitle: string) => {
      setBossBanner(bossTitle);
      setTimeout(() => setBossBanner(null), 4000);
    };

    // Apply saved sound volumes
    SoundSynthesizer.setVolumes(
      0.8,
      engine.saveData.settings.sfxVolume,
      engine.saveData.settings.engineVolume
    );

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  const handleLaunchRun = () => {
    if (!engineRef.current) return;
    engineRef.current.startNewRun();
    setGameState('PLAYING');
  };

  const handlePause = () => {
    if (!engineRef.current) return;
    engineRef.current.pauseGame();
    setGameState('PAUSED');
  };

  const handleResume = () => {
    if (!engineRef.current) return;
    engineRef.current.resumeGame();
    setGameState('PLAYING');
  };

  const handleRestartRun = () => {
    if (!engineRef.current) return;
    engineRef.current.startNewRun();
    setGameState('PLAYING');
  };

  const handleQuitToMenu = () => {
    if (!engineRef.current) return;
    engineRef.current.stopGame();
    setGameState('MENU');
    setSaveData({ ...engineRef.current.saveData });
  };

  const handleSaveUpdated = (updated: SaveData) => {
    setSaveData(updated);
    if (engineRef.current) {
      engineRef.current.saveData = updated;
    }
  };

  const handleAdRewardGranted = (rewardCoins: number, rewardScrap: number) => {
    const nextSave = { ...saveData };
    nextSave.coins += rewardCoins;
    nextSave.scrap += rewardScrap;
    setSaveData(nextSave);
    SaveSystem.save(nextSave);
    if (engineRef.current) {
      engineRef.current.saveData = nextSave;
    }
    setRewardBanner(
      lang === 'ar'
        ? `🎉 تم منحك مكافأة المشاهدة: +${rewardCoins} عملة و +${rewardScrap} خردة!`
        : `🎉 Ad Reward Granted: +${rewardCoins} Coins & +${rewardScrap} Scrap!`
    );
    setTimeout(() => setRewardBanner(null), 4500);
  };

  return (
    <main id="dune-survival-app" className="relative w-screen h-screen overflow-hidden bg-zinc-950 font-sans select-none">
      {/* Landscape Orientation Viewport Enforcer */}
      <LandscapeOrientationLock lang={lang} />

      {/* Underlying WebGL / Canvas Viewport */}
      <canvas
        id="dune-survival-canvas"
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full block touch-none ${
          gameState === 'MENU' ? 'opacity-30 pointer-events-none' : 'opacity-100'
        }`}
      />

      {/* Main Menu Layer */}
      {gameState === 'MENU' && (
        <div className="absolute inset-0 z-20">
          <MainMenu
            saveData={saveData}
            onPlay={handleLaunchRun}
            onOpenGarage={() => setShowGarage(true)}
            onOpenOutpost={() => setShowOutpost(true)}
            onOpenMissions={() => setShowMissions(true)}
            onOpenShop={() => setShowShop(true)}
            onOpenProfile={() => setShowProfile(true)}
            onOpenSettings={() => setShowSettings(true)}
            onOpenAssets={() => setShowAssets(true)}
            onOpenAdmin={() => setShowAdmin(true)}
            onOpenMapSelect={() => setShowMapSelect(true)}
            onOpenAndroidExport={() => setShowAndroidExport(true)}
            onOpenPlayStoreAudit={() => setShowPlayStoreAudit(true)}
            onShowAdMob={() => {
              setAdMobType('INTERSTITIAL');
              setShowAdMob(true);
            }}
            onLanguageChange={(newLang) => {
              setSaveData({
                ...saveData,
                settings: { ...saveData.settings, language: newLang }
              });
            }}
          />
        </div>
      )}

      {/* In-Game Active HUD Layer */}
      {gameState === 'PLAYING' && engineRef.current && (
        <GameHUD
          engine={engineRef.current}
          onPause={handlePause}
          showTouchControls={saveData.settings.showTouchControls || 'ontouchstart' in window}
        />
      )}

      {/* Boss Encounter Warning Toast */}
      {bossBanner && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-red-600/90 text-white font-black text-2xl tracking-widest px-8 py-3 rounded-2xl border-2 border-red-300 shadow-[0_0_50px_rgba(239,68,68,0.7)] animate-bounce text-center">
          ⚠ BOSS INCOMING: {bossBanner} ⚠
        </div>
      )}

      {/* Reward Claimed Toast */}
      {rewardBanner && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 bg-emerald-600/95 text-white font-black text-sm sm:text-base px-6 py-2.5 rounded-full border border-emerald-300 shadow-2xl animate-fade-in text-center">
          {rewardBanner}
        </div>
      )}

      {/* Pause Menu Layer */}
      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRestartRun}
          onOpenSettings={() => setShowSettings(true)}
          onOpenAdmin={() => setShowAdmin(true)}
          onQuitToMenu={handleQuitToMenu}
        />
      )}

      {/* Game Over Layer */}
      {gameState === 'GAMEOVER' && runSummary && (
        <GameOverModal
          summary={runSummary}
          onRestart={handleRestartRun}
          onGoToGarage={() => {
            setGameState('MENU');
            setShowGarage(true);
          }}
          onGoToMenu={handleQuitToMenu}
          onWatchRewardedAd={() => {
            setAdMobType('REWARDED');
            setShowAdMob(true);
          }}
          onShowInterstitialAd={() => {
            setAdMobType('INTERSTITIAL');
            setShowAdMob(true);
          }}
          lang={lang}
        />
      )}

      {/* Modals */}
      {showMapSelect && (
        <MapSelectModal
          saveData={saveData}
          onSelectMap={(mapId) => {
            saveData.settings.selectedMapId = mapId;
            setSaveData({ ...saveData });
            SaveSystem.save(saveData);
            setShowMapSelect(false);
          }}
          onClose={() => setShowMapSelect(false)}
        />
      )}

      {showAndroidExport && (
        <AndroidExportModal
          onClose={() => setShowAndroidExport(false)}
          lang={lang}
        />
      )}

      {showPlayStoreAudit && (
        <PlayStoreValidatorModal
          onClose={() => setShowPlayStoreAudit(false)}
          lang={lang}
        />
      )}

      {showAdMob && (
        <AdMobModal
          type={adMobType}
          isOpen={showAdMob}
          onClose={() => setShowAdMob(false)}
          onRewardGranted={handleAdRewardGranted}
          lang={lang}
        />
      )}

      {showGarage && (
        <GarageModal
          saveData={saveData}
          onClose={() => setShowGarage(false)}
          onSaveUpdated={handleSaveUpdated}
        />
      )}

      {showOutpost && (
        <OutpostModal
          saveData={saveData}
          onClose={() => setShowOutpost(false)}
          onSaveUpdated={handleSaveUpdated}
        />
      )}

      {showMissions && (
        <MissionsModal
          saveData={saveData}
          onClose={() => setShowMissions(false)}
          onSaveUpdated={handleSaveUpdated}
        />
      )}

      {showShop && (
        <ShopModal
          saveData={saveData}
          onClose={() => setShowShop(false)}
          onSaveUpdated={handleSaveUpdated}
        />
      )}

      {showProfile && (
        <ProfileModal
          saveData={saveData}
          onClose={() => setShowProfile(false)}
          onSaveUpdated={handleSaveUpdated}
        />
      )}

      {showSettings && (
        <SettingsModal
          saveData={saveData}
          onClose={() => setShowSettings(false)}
          onSaveUpdated={handleSaveUpdated}
          onTestAdMob={() => {
            setAdMobType('INTERSTITIAL');
            setShowAdMob(true);
          }}
        />
      )}

      {showAssets && (
        <AssetCatalogModal
          onClose={() => setShowAssets(false)}
        />
      )}

      {showAdmin && (
        <AdminDebugModal
          engine={engineRef.current}
          saveData={saveData}
          onClose={() => setShowAdmin(false)}
          onSaveUpdated={handleSaveUpdated}
        />
      )}
    </main>
  );
}
