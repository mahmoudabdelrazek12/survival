import React, { useState } from 'react';
import { X, Shield, Gauge, Fuel, Magnet, Zap, DollarSign, Wrench, Check } from 'lucide-react';
import { SaveData, VehicleDefinition } from '../types/game';
import { INITIAL_VEHICLES, UPGRADE_CONFIG } from '../game/data/gameData';
import { SaveSystem } from '../game/storage/SaveSystem';
import { SoundSynthesizer } from '../game/audio/SoundSynthesizer';

interface GarageModalProps {
  saveData: SaveData;
  onClose: () => void;
  onSaveUpdated: (data: SaveData) => void;
}

export const GarageModal: React.FC<GarageModalProps> = ({ saveData, onClose, onSaveUpdated }) => {
  const [selectedId, setSelectedId] = useState<string>(saveData.selectedVehicleId);
  const currentVehicle = INITIAL_VEHICLES.find(v => v.id === selectedId) || INITIAL_VEHICLES[0];
  const isUnlocked = saveData.unlockedVehicleIds.includes(currentVehicle.id);
  const isEquipped = saveData.selectedVehicleId === currentVehicle.id;

  const handleEquip = (v: VehicleDefinition) => {
    saveData.selectedVehicleId = v.id;
    SaveSystem.save(saveData);
    onSaveUpdated({ ...saveData });
    SoundSynthesizer.playPickup('scrap');
  };

  const handleBuyVehicle = (v: VehicleDefinition) => {
    if (saveData.coins < v.cost) return;
    saveData.coins -= v.cost;
    saveData.unlockedVehicleIds.push(v.id);
    saveData.selectedVehicleId = v.id;
    SaveSystem.save(saveData);
    onSaveUpdated({ ...saveData });
    SoundSynthesizer.playPickup('coin');
  };

  const getUpgradeCost = (key: keyof typeof UPGRADE_CONFIG, currentLvl: number) => {
    const cfg = UPGRADE_CONFIG[key];
    return Math.round(cfg.baseCost * Math.pow(cfg.costMultiplier, currentLvl));
  };

  const handleUpgrade = (key: keyof typeof UPGRADE_CONFIG) => {
    const levelKey = `${key}Level` as keyof typeof saveData.upgrades;
    const currentLvl = saveData.upgrades[levelKey];
    const cfg = UPGRADE_CONFIG[key];

    if (currentLvl >= cfg.max) return;
    const cost = getUpgradeCost(key, currentLvl);
    if (saveData.coins < cost) return;

    saveData.coins -= cost;
    saveData.upgrades[levelKey] = currentLvl + 1;
    SaveSystem.save(saveData);
    onSaveUpdated({ ...saveData });
    SoundSynthesizer.playPickup('repair');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md font-gaming">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-800 bg-neutral-950/70">
          <div className="flex items-center gap-3">
            <h2 className="font-heading text-3xl font-bold text-neutral-100 tracking-wider">WASTELAND GARAGE</h2>
            <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2.5 py-0.5 rounded-md uppercase font-bold">
              MOD & ASSEMBLY
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-neutral-900 px-3 py-1 rounded-lg border border-neutral-800 text-amber-400 font-bold">
              <DollarSign className="w-4 h-4" /> {saveData.coins.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 bg-neutral-900 px-3 py-1 rounded-lg border border-neutral-800 text-slate-300 font-bold">
              <Wrench className="w-4 h-4" /> {saveData.scrap.toLocaleString()}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Vehicle Picker & Showcase (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Vehicle Selection Carousel Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {INITIAL_VEHICLES.map((v) => {
                const unlocked = saveData.unlockedVehicleIds.includes(v.id);
                const isSelected = selectedId === v.id;

                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedId(v.id)}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between h-24 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 shadow-lg'
                        : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-neutral-200 line-clamp-1">{v.name}</span>
                      {saveData.selectedVehicleId === v.id && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-1 rounded">
                          EQUIPPED
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-end">
                      <div
                        className="w-4 h-4 rounded-full border border-black/40"
                        style={{ backgroundColor: v.color }}
                      />
                      <span className="text-[11px] font-bold text-neutral-400">
                        {unlocked ? 'OWNED' : `${v.cost} COINS`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Vehicle Detail Card */}
            <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-5 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-heading text-3xl font-bold text-neutral-100">{currentVehicle.name}</h3>
                  <p className="text-xs text-neutral-400 max-w-md">{currentVehicle.description}</p>
                </div>
                {/* Equip / Buy Button */}
                {isUnlocked ? (
                  <button
                    disabled={isEquipped}
                    onClick={() => handleEquip(currentVehicle)}
                    className={`px-5 py-2 rounded-xl font-bold text-sm transition flex items-center gap-2 ${
                      isEquipped
                        ? 'bg-neutral-800 text-neutral-500 cursor-default'
                        : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-lg active:scale-95 cursor-pointer'
                    }`}
                  >
                    {isEquipped ? <><Check className="w-4 h-4" /> EQUIPPED</> : 'EQUIP CHASSIS'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuyVehicle(currentVehicle)}
                    disabled={saveData.coins < currentVehicle.cost}
                    className={`px-5 py-2 rounded-xl font-bold text-sm transition flex items-center gap-2 ${
                      saveData.coins >= currentVehicle.cost
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 shadow-lg cursor-pointer'
                        : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    <DollarSign className="w-4 h-4" /> UNLOCK FOR {currentVehicle.cost} COINS
                  </button>
                )}
              </div>

              {/* Specs Bars */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs text-neutral-400 mb-1">
                    <span className="flex items-center gap-1"><Gauge className="w-3.5 h-3.5 text-amber-400" /> MAX SPEED</span>
                    <span className="text-neutral-200 font-bold">{currentVehicle.baseSpeed} KM</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: `${(currentVehicle.baseSpeed / 550) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-neutral-400 mb-1">
                    <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-emerald-400" /> HULL & ARMOR</span>
                    <span className="text-neutral-200 font-bold">{currentVehicle.baseHp} HP ({Math.round(currentVehicle.baseArmor * 100)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${(currentVehicle.baseHp / 400) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-neutral-400 mb-1">
                    <span className="flex items-center gap-1"><Fuel className="w-3.5 h-3.5 text-red-400" /> FUEL CAPACITY</span>
                    <span className="text-neutral-200 font-bold">{currentVehicle.baseFuel} LITERS</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: `${(currentVehicle.baseFuel / 220) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-neutral-400 mb-1">
                    <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-cyan-400" /> DRIFT & HANDLING</span>
                    <span className="text-neutral-200 font-bold">{Math.round(currentVehicle.baseHandling * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500" style={{ width: `${currentVehicle.baseHandling * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Performance Upgrades (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <h3 className="text-xs uppercase tracking-wider text-neutral-400 font-bold">PERMANENT VEHICLE TUNING</h3>

            {(Object.keys(UPGRADE_CONFIG) as (keyof typeof UPGRADE_CONFIG)[]).map((key) => {
              const cfg = UPGRADE_CONFIG[key];
              const levelKey = `${key}Level` as keyof typeof saveData.upgrades;
              const currentLvl = saveData.upgrades[levelKey];
              const isMax = currentLvl >= cfg.max;
              const cost = getUpgradeCost(key, currentLvl);
              const canAfford = saveData.coins >= cost && !isMax;

              return (
                <div key={key} className="bg-neutral-950/70 border border-neutral-800 rounded-xl p-3 flex justify-between items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-sm font-bold text-neutral-200">{cfg.name}</span>
                      <span className="text-xs text-amber-400 font-bold">
                        LVL {currentLvl}/{cfg.max}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mb-2">{cfg.desc}</p>
                    {/* Level pips */}
                    <div className="flex gap-1">
                      {Array.from({ length: cfg.max }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full ${
                            i < currentLvl ? 'bg-amber-500' : 'bg-neutral-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    disabled={!canAfford}
                    onClick={() => handleUpgrade(key)}
                    className={`px-3 py-2 rounded-lg font-bold text-xs whitespace-nowrap transition ${
                      isMax
                        ? 'bg-neutral-800 text-neutral-500 cursor-default'
                        : canAfford
                        ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md cursor-pointer'
                        : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    {isMax ? 'MAXED' : `${cost} COINS`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
