import React, { useState } from 'react';
import { X, Crosshair, Zap, Bomb, Rocket, Flame, DollarSign, Wrench, Check } from 'lucide-react';
import { SaveData, WeaponType, WeaponDefinition } from '../types/game';
import { INITIAL_WEAPONS } from '../game/data/gameData';
import { SaveSystem } from '../game/storage/SaveSystem';
import { SoundSynthesizer } from '../game/audio/SoundSynthesizer';

interface ShopModalProps {
  saveData: SaveData;
  onClose: () => void;
  onSaveUpdated: (data: SaveData) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({ saveData, onClose, onSaveUpdated }) => {
  const [activeWeaponTab, setActiveWeaponTab] = useState<WeaponType>(saveData.activeWeaponId);
  const currentWeapon = INITIAL_WEAPONS[activeWeaponTab] || INITIAL_WEAPONS.vulcan;
  const isUnlocked = saveData.unlockedWeaponIds.includes(currentWeapon.id);
  const isEquipped = saveData.activeWeaponId === currentWeapon.id;

  const handleEquip = (w: WeaponDefinition) => {
    saveData.activeWeaponId = w.id;
    SaveSystem.save(saveData);
    onSaveUpdated({ ...saveData });
    SoundSynthesizer.playPickup('scrap');
  };

  const handleBuy = (w: WeaponDefinition) => {
    if (saveData.coins < w.cost) return;
    saveData.coins -= w.cost;
    saveData.unlockedWeaponIds.push(w.id);
    saveData.activeWeaponId = w.id;
    SaveSystem.save(saveData);
    onSaveUpdated({ ...saveData });
    SoundSynthesizer.playPickup('coin');
  };

  const getWeaponIcon = (id: WeaponType) => {
    switch (id) {
      case 'vulcan': return <Crosshair className="w-5 h-5 text-amber-400" />;
      case 'plasma': return <Zap className="w-5 h-5 text-sky-400" />;
      case 'flak': return <Bomb className="w-5 h-5 text-orange-400" />;
      case 'missile': return <Rocket className="w-5 h-5 text-red-400" />;
      case 'flamethrower': return <Flame className="w-5 h-5 text-rose-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md font-gaming">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-800 bg-neutral-950/70">
          <div>
            <h2 className="font-heading text-3xl font-bold text-neutral-100 tracking-wider">WEAPONS ARSENAL</h2>
            <p className="text-xs text-neutral-400">Equip and mount advanced heavy ordnance onto your vehicle</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-neutral-900 px-3 py-1 rounded-lg border border-neutral-800 text-amber-400 font-bold">
              <DollarSign className="w-4 h-4" /> {saveData.coins.toLocaleString()}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Weapon List (5 cols) */}
          <div className="md:col-span-5 flex flex-col gap-2">
            {(Object.keys(INITIAL_WEAPONS) as WeaponType[]).map((wId) => {
              const weapon = INITIAL_WEAPONS[wId];
              const unlocked = saveData.unlockedWeaponIds.includes(wId);
              const isSelected = activeWeaponTab === wId;

              return (
                <button
                  key={wId}
                  onClick={() => setActiveWeaponTab(wId)}
                  className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/10 shadow-lg'
                      : 'border-neutral-800 bg-neutral-950/70 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-neutral-900 rounded-lg border border-neutral-800">
                      {getWeaponIcon(wId)}
                    </div>
                    <div>
                      <span className="font-bold text-sm text-neutral-200 block">{weapon.name}</span>
                      <span className="text-[11px] text-neutral-400">
                        {unlocked ? (saveData.activeWeaponId === wId ? 'ACTIVE' : 'READY') : `${weapon.cost} COINS`}
                      </span>
                    </div>
                  </div>

                  {saveData.activeWeaponId === wId && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded font-bold">
                      MOUNTED
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Weapon Details & Action (7 cols) */}
          <div className="md:col-span-7 bg-neutral-950/80 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between gap-5">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-neutral-900 rounded-xl border border-neutral-800">
                  {getWeaponIcon(currentWeapon.id)}
                </div>
                <div>
                  <h3 className="font-heading text-3xl font-bold text-neutral-100">{currentWeapon.name}</h3>
                  <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                    {currentWeapon.id === 'missile' ? 'HOMING SEEKER' : currentWeapon.id === 'plasma' ? 'ARMOR PIERCER' : 'KINETIC ORDNANCE'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed mb-4">{currentWeapon.description}</p>

              {/* Stats Bars */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-neutral-400 mb-1">
                    <span>FIREPOWER / DAMAGE</span>
                    <span className="text-neutral-200 font-bold">{currentWeapon.damage} DMG</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: `${(currentWeapon.damage / 130) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-neutral-400 mb-1">
                    <span>CYCLIC RATE OF FIRE</span>
                    <span className="text-neutral-200 font-bold">{currentWeapon.fireRate} ROUNDS/SEC</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: `${(currentWeapon.fireRate / 15) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-neutral-400 mb-1">
                    <span>EFFECTIVE RANGE</span>
                    <span className="text-neutral-200 font-bold">{currentWeapon.range} METERS</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500" style={{ width: `${(currentWeapon.range / 950) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Equip / Buy Button */}
            <div className="pt-4 border-t border-neutral-800">
              {isUnlocked ? (
                <button
                  disabled={isEquipped}
                  onClick={() => handleEquip(currentWeapon)}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${
                    isEquipped
                      ? 'bg-neutral-800 text-neutral-500 cursor-default'
                      : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-lg active:scale-95 cursor-pointer'
                  }`}
                >
                  {isEquipped ? <><Check className="w-4 h-4" /> MOUNTED AS PRIMARY WEAPON</> : 'MOUNT ON TURRET'}
                </button>
              ) : (
                <button
                  onClick={() => handleBuy(currentWeapon)}
                  disabled={saveData.coins < currentWeapon.cost}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${
                    saveData.coins >= currentWeapon.cost
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 shadow-lg cursor-pointer'
                      : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  <DollarSign className="w-4 h-4" /> PURCHASE FOR {currentWeapon.cost} COINS
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
