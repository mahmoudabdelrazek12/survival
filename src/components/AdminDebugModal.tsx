import React from 'react';
import { X, Terminal, DollarSign, Wrench, Fuel, Shield, Unlock, Skull, RotateCcw, AlertTriangle } from 'lucide-react';
import { GameEngine } from '../game/core/GameEngine';
import { SaveData } from '../types/game';
import { SaveSystem } from '../game/storage/SaveSystem';

interface AdminDebugModalProps {
  engine: GameEngine | null;
  saveData: SaveData;
  onClose: () => void;
  onSaveUpdated: (data: SaveData) => void;
}

export const AdminDebugModal: React.FC<AdminDebugModalProps> = ({
  engine,
  saveData,
  onClose,
  onSaveUpdated,
}) => {
  const handleAddCoins = (amount: number) => {
    saveData.coins += amount;
    SaveSystem.save(saveData);
    onSaveUpdated({ ...saveData });
  };

  const handleAddScrap = (amount: number) => {
    saveData.scrap += amount;
    SaveSystem.save(saveData);
    onSaveUpdated({ ...saveData });
  };

  const handleFullFuel = () => {
    if (engine && engine.playerVehicle) {
      engine.playerVehicle.fuel = engine.playerVehicle.maxFuel;
      engine.playerVehicle.boostTank = engine.playerVehicle.maxBoost;
    }
  };

  const handleRepair = () => {
    if (engine && engine.playerVehicle) {
      engine.playerVehicle.hp = engine.playerVehicle.maxHp;
    }
  };

  const handleToggleGodMode = () => {
    if (engine) {
      engine.godMode = !engine.godMode;
    }
  };

  const handleUnlockAll = () => {
    if (engine) {
      engine.cheatUnlockAll();
      onSaveUpdated({ ...engine.saveData });
    } else {
      const data = SaveSystem.load();
      data.unlockedVehicleIds = ['desert_vulture', 'dune_marauder', 'iron_sandstorm', 'apex_behemoth'];
      data.unlockedWeaponIds = ['vulcan', 'plasma', 'flak', 'missile', 'flamethrower'];
      SaveSystem.save(data);
      onSaveUpdated(data);
    }
  };

  const handleSpawnBoss = () => {
    if (engine && engine.state === 'PLAYING') {
      engine.spawnBoss('boss_war_rig');
      onClose();
    }
  };

  const handleSpawnWorm = () => {
    if (engine && engine.state === 'PLAYING') {
      engine.spawnBoss('boss_sand_worm');
      onClose();
    }
  };

  const handleResetSave = () => {
    if (confirm('RESET ALL PROGRESS: Are you sure you want to clear your save file and restart as a rookie?')) {
      const fresh = SaveSystem.reset();
      onSaveUpdated(fresh);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md font-gaming">
      <div className="bg-neutral-900 border-2 border-amber-500/50 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-800 bg-amber-500/10">
          <div className="flex items-center gap-2 text-amber-400">
            <Terminal className="w-5 h-5" />
            <h2 className="font-heading text-2xl font-bold tracking-wider">DEV & ADMIN TESTING PANEL</h2>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner */}
        <div className="bg-neutral-950 px-6 py-2 border-b border-neutral-800 flex items-center gap-2 text-[11px] text-amber-500">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>DEVELOPMENT CHEATS ONLY — SAFE TO USE FOR TESTING ALL MECHANICS & GEAR.</span>
        </div>

        {/* Actions Grid */}
        <div className="p-6 grid grid-cols-2 gap-3 text-xs font-bold">
          <button
            onClick={() => handleAddCoins(5000)}
            className="p-3 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500 rounded-xl flex items-center gap-2 text-amber-400 transition"
          >
            <DollarSign className="w-4 h-4" /> +5,000 COINS
          </button>

          <button
            onClick={() => handleAddScrap(2500)}
            className="p-3 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-slate-400 rounded-xl flex items-center gap-2 text-slate-300 transition"
          >
            <Wrench className="w-4 h-4" /> +2,500 SCRAP
          </button>

          <button
            onClick={handleFullFuel}
            disabled={!engine || engine.state !== 'PLAYING'}
            className="p-3 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-xl flex items-center gap-2 text-red-400 disabled:opacity-40 transition"
          >
            <Fuel className="w-4 h-4" /> REFILL FULL FUEL
          </button>

          <button
            onClick={handleRepair}
            disabled={!engine || engine.state !== 'PLAYING'}
            className="p-3 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-xl flex items-center gap-2 text-emerald-400 disabled:opacity-40 transition"
          >
            <Shield className="w-4 h-4" /> FULL HULL REPAIR
          </button>

          <button
            onClick={handleToggleGodMode}
            disabled={!engine || engine.state !== 'PLAYING'}
            className={`p-3 border rounded-xl flex items-center gap-2 transition disabled:opacity-40 ${
              engine?.godMode
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
            }`}
          >
            <Shield className="w-4 h-4" /> GOD MODE: {engine?.godMode ? 'ENABLED' : 'DISABLED'}
          </button>

          <button
            onClick={handleUnlockAll}
            className="p-3 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-cyan-500 rounded-xl flex items-center gap-2 text-cyan-400 transition"
          >
            <Unlock className="w-4 h-4" /> UNLOCK ALL CARS & GUNS
          </button>

          <button
            onClick={handleSpawnBoss}
            disabled={!engine || engine.state !== 'PLAYING'}
            className="p-3 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-orange-500 rounded-xl flex items-center gap-2 text-orange-400 disabled:opacity-40 transition"
          >
            <Skull className="w-4 h-4" /> SUMMON WAR RIG BOSS
          </button>

          <button
            onClick={handleSpawnWorm}
            disabled={!engine || engine.state !== 'PLAYING'}
            className="p-3 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-600 rounded-xl flex items-center gap-2 text-amber-500 disabled:opacity-40 transition"
          >
            <Skull className="w-4 h-4" /> SUMMON DUNE WORM BOSS
          </button>
        </div>

        {/* Footer Danger Zone */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950/70 flex justify-between items-center">
          <span className="text-[11px] text-neutral-500">FACTORY RESET STORAGE</span>
          <button
            onClick={handleResetSave}
            className="px-4 py-2 bg-red-950 hover:bg-red-900 text-red-400 border border-red-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> CLEAR SAVE & RESET
          </button>
        </div>
      </div>
    </div>
  );
};
