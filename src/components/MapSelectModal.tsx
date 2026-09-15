import React from 'react';
import { GAME_MAPS, MapSector } from '../game/data/mapsData';
import { SaveData } from '../types/game';
import { SaveSystem } from '../game/storage/SaveSystem';
import { SoundSynthesizer } from '../game/audio/SoundSynthesizer';
import { t } from '../game/data/translations';
import { MapPin, Skull, Compass, ShieldAlert, Check, X } from 'lucide-react';

interface MapSelectModalProps {
  saveData: SaveData;
  onSelectMap: (mapId: string) => void;
  onClose: () => void;
}

export const MapSelectModal: React.FC<MapSelectModalProps> = ({
  saveData,
  onSelectMap,
  onClose,
}) => {
  const lang = saveData.settings.language || 'ar';
  const selectedId = saveData.settings.selectedMapId || 'dune_sea';

  const handleSelect = (sector: MapSector) => {
    SoundSynthesizer.playClick();
    saveData.settings.selectedMapId = sector.id;
    SaveSystem.save(saveData);
    onSelectMap(sector.id);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'EASY': return 'text-emerald-400 bg-emerald-950/70 border-emerald-500/40';
      case 'MEDIUM': return 'text-amber-400 bg-amber-950/70 border-amber-500/40';
      case 'HARD': return 'text-orange-400 bg-orange-950/70 border-orange-500/40';
      case 'EXTREME': return 'text-rose-400 bg-rose-950/70 border-rose-500/40';
      default: return 'text-zinc-400 bg-zinc-900 border-zinc-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div 
        dir={lang === 'ar' ? 'rtl' : 'ltr'} 
        className="relative w-full max-w-4xl bg-zinc-950 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-wide text-zinc-100">
                {t(lang, 'selectMap')}
              </h2>
              <p className="text-xs text-zinc-400">
                {lang === 'ar' ? 'اختر ساحة المعركة وواجه التضاريس والوحوش الخاصة بها' : 'Select your combat sector with unique terrain friction and hazards'}
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

        {/* Sectors Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {GAME_MAPS.map((sector) => {
            const isSelected = sector.id === selectedId;
            return (
              <div
                key={sector.id}
                onClick={() => handleSelect(sector)}
                className={`relative rounded-xl p-5 border cursor-pointer transition-all duration-200 group overflow-hidden ${
                  isSelected
                    ? 'border-amber-400 bg-gradient-to-br from-amber-950/40 via-zinc-900 to-zinc-950 shadow-lg shadow-amber-500/10'
                    : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70'
                }`}
              >
                {/* Sector Color Indicator Accent */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: sector.groundColor }}
                />

                <div className="flex items-start justify-between gap-3 mb-2 mt-1">
                  <div>
                    <span className="text-[11px] font-mono tracking-wider uppercase text-amber-400/80">
                      {lang === 'ar' ? sector.taglineAr : sector.tagline}
                    </span>
                    <h3 className="text-lg font-black text-zinc-100 group-hover:text-amber-400 transition-colors">
                      {lang === 'ar' ? sector.nameAr : sector.name}
                    </h3>
                  </div>
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getDifficultyColor(sector.difficulty)}`}>
                    {sector.difficulty}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 mb-4 leading-relaxed line-clamp-2">
                  {lang === 'ar' ? sector.descriptionAr : sector.description}
                </p>

                {/* Hazards & Environmental traits */}
                <div className="space-y-2 text-xs border-t border-zinc-800/80 pt-3">
                  <div className="flex items-center gap-2 text-rose-300/90">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                    <span className="truncate">{lang === 'ar' ? sector.hazardLabelAr : sector.hazardLabel}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                    <span>{lang === 'ar' ? 'معامل الاحتكاك:' : 'Traction/Friction:'} {(sector.frictionMultiplier * 100).toFixed(0)}%</span>
                    <span>{lang === 'ar' ? 'تعزيز التفحيط:' : 'Drift Boost:'} +{(sector.driftBoost * 10).toFixed(0)}%</span>
                  </div>
                </div>

                {/* Selected Checkmark */}
                {isSelected && (
                  <div className="absolute top-3 end-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-black text-[11px] font-black shadow">
                    <Check className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'محدد' : 'ACTIVE'}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between">
          <div className="text-xs text-zinc-400 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>
              {lang === 'ar' ? 'القطاع النشط: ' : 'Active Sector: '}
              <strong className="text-zinc-200">
                {lang === 'ar' ? GAME_MAPS.find(m => m.id === selectedId)?.nameAr : GAME_MAPS.find(m => m.id === selectedId)?.name}
              </strong>
            </span>
          </div>
          <button
            onClick={() => {
              SoundSynthesizer.playClick();
              onClose();
            }}
            className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-sm transition-all shadow-md active:scale-95"
          >
            {t(lang, 'close')}
          </button>
        </div>
      </div>
    </div>
  );
};
