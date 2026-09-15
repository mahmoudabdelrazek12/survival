import React from 'react';
import { X, Sun, Fuel, Wrench, Radio, DollarSign } from 'lucide-react';
import { SaveData } from '../types/game';
import { OUTPOST_CONFIG } from '../game/data/gameData';
import { SaveSystem } from '../game/storage/SaveSystem';
import { SoundSynthesizer } from '../game/audio/SoundSynthesizer';

interface OutpostModalProps {
  saveData: SaveData;
  onClose: () => void;
  onSaveUpdated: (data: SaveData) => void;
}

export const OutpostModal: React.FC<OutpostModalProps> = ({ saveData, onClose, onSaveUpdated }) => {
  const getOutpostCost = (key: keyof typeof OUTPOST_CONFIG, currentLvl: number) => {
    const cfg = OUTPOST_CONFIG[key];
    return Math.round(cfg.baseCost * Math.pow(cfg.costMultiplier, currentLvl));
  };

  const handleUpgrade = (key: keyof typeof OUTPOST_CONFIG) => {
    const levelKey = `${key}Level` as keyof typeof saveData.outpost;
    const currentLvl = saveData.outpost[levelKey];
    const cfg = OUTPOST_CONFIG[key];

    if (currentLvl >= cfg.max) return;
    const cost = getOutpostCost(key, currentLvl);
    // Outpost requires scrap metal to build!
    if (saveData.scrap < cost) return;

    saveData.scrap -= cost;
    saveData.outpost[levelKey] = currentLvl + 1;
    SaveSystem.save(saveData);
    onSaveUpdated({ ...saveData });
    SoundSynthesizer.playPickup('repair');
  };

  const getIcon = (key: string) => {
    switch (key) {
      case 'solarRefinery': return <Sun className="w-6 h-6 text-amber-400" />;
      case 'fuelDepot': return <Fuel className="w-6 h-6 text-red-400" />;
      case 'repairBay': return <Wrench className="w-6 h-6 text-emerald-400" />;
      case 'radarArray': return <Radio className="w-6 h-6 text-sky-400" />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md font-gaming">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-800 bg-neutral-950/70">
          <div>
            <h2 className="font-heading text-3xl font-bold text-neutral-100 tracking-wider">SECTOR OUTPOST BASE</h2>
            <p className="text-xs text-neutral-400">Expand permanent wasteland infrastructure with salvaged scrap metal</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-neutral-900 px-3 py-1 rounded-lg border border-neutral-800 text-slate-300 font-bold">
              <Wrench className="w-4 h-4" /> {saveData.scrap.toLocaleString()} SCRAP
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
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(OUTPOST_CONFIG) as (keyof typeof OUTPOST_CONFIG)[]).map((key) => {
            const cfg = OUTPOST_CONFIG[key];
            const levelKey = `${key}Level` as keyof typeof saveData.outpost;
            const currentLvl = saveData.outpost[levelKey];
            const isMax = currentLvl >= cfg.max;
            const cost = getOutpostCost(key, currentLvl);
            const canAfford = saveData.scrap >= cost && !isMax;

            return (
              <div
                key={key}
                className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between gap-4 hover:border-neutral-700 transition"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 shrink-0">
                    {getIcon(key)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-neutral-200">{cfg.name}</h3>
                      <span className="text-xs bg-neutral-800 text-amber-400 font-bold px-2 py-0.5 rounded">
                        LVL {currentLvl}/{cfg.max}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400">{cfg.desc}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
                  <div className="flex gap-1.5 flex-1 max-w-[120px]">
                    {Array.from({ length: cfg.max }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 flex-1 rounded-full ${
                          i < currentLvl ? 'bg-amber-500' : 'bg-neutral-800'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    disabled={!canAfford}
                    onClick={() => handleUpgrade(key)}
                    className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition ${
                      isMax
                        ? 'bg-neutral-800 text-neutral-500 cursor-default'
                        : canAfford
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 shadow-md cursor-pointer'
                        : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    {isMax ? 'MAX CONSTRUCTED' : (
                      <>
                        <Wrench className="w-3.5 h-3.5" /> UPGRADE: {cost} SCRAP
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
