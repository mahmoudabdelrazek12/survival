import React, { useState } from 'react';
import { X, Volume2, Sparkles, Smartphone, Download, Upload, Globe, Sliders, ShieldCheck } from 'lucide-react';
import { SaveData } from '../types/game';
import { SaveSystem } from '../game/storage/SaveSystem';
import { SoundSynthesizer } from '../game/audio/SoundSynthesizer';
import { t, Language } from '../game/data/translations';

interface SettingsModalProps {
  saveData: SaveData;
  onClose: () => void;
  onSaveUpdated: (data: SaveData) => void;
  onTestAdMob?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  saveData, 
  onClose, 
  onSaveUpdated,
  onTestAdMob
}) => {
  const [lang, setLang] = useState<Language>(saveData.settings.language || 'ar');
  const [controlMode, setControlMode] = useState<'pedals' | 'joystick'>(saveData.settings.controlMode || 'pedals');
  const [sfxVol, setSfxVol] = useState(saveData.settings.sfxVolume);
  const [engineVol, setEngineVol] = useState(saveData.settings.engineVolume);
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>(saveData.settings.particlesQuality);
  const [touchControls, setTouchControls] = useState(saveData.settings.showTouchControls);
  const [onlineMode, setOnlineMode] = useState(saveData.settings.onlineModeEnabled);
  const [jsonText, setJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleApplySettings = () => {
    SoundSynthesizer.playClick();
    saveData.settings.language = lang;
    saveData.settings.controlMode = controlMode;
    saveData.settings.sfxVolume = sfxVol;
    saveData.settings.engineVolume = engineVol;
    saveData.settings.particlesQuality = quality;
    saveData.settings.showTouchControls = touchControls;
    saveData.settings.onlineModeEnabled = onlineMode;

    SoundSynthesizer.setVolumes(0.8, sfxVol, engineVol);
    SaveSystem.save(saveData);
    onSaveUpdated({ ...saveData });
    onClose();
  };

  const handleExport = () => {
    const json = SaveSystem.exportJSON();
    setJsonText(json);
    navigator.clipboard.writeText(json);
    setImportStatus(lang === 'ar' ? 'تم نسخ ملف الحفظ إلى الحافظة!' : 'Save JSON copied to clipboard!');
  };

  const handleImport = () => {
    if (!jsonText.trim()) return;
    const res = SaveSystem.importJSON(jsonText.trim());
    if (res.success && res.data) {
      onSaveUpdated(res.data);
      setImportStatus(lang === 'ar' ? 'تم استيراد الحفظ بنجاح!' : 'Save successfully imported & loaded!');
    } else {
      setImportStatus(lang === 'ar' ? `خطأ في الاستيراد: ${res.error}` : `Import Error: ${res.error}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md font-sans">
      <div 
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/60">
          <div>
            <h2 className="text-xl font-black text-zinc-100 tracking-wider">
              {t(lang, 'settingsTitle')}
            </h2>
            <p className="text-xs text-zinc-400">
              {lang === 'ar' ? 'تخصيص اللغة، أسلوب التحكم، الصوتيات، وإعلانات AdMob' : 'Audio balance, language, control scheme, and AdMob test'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Language Selection */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-black text-zinc-200 block">{t(lang, 'languageLabel')}</span>
                <span className="text-[11px] text-zinc-400">{lang === 'ar' ? 'اختر لغة واجهة اللعبة' : 'Choose game display language'}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setLang('ar')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition ${
                  lang === 'ar' ? 'bg-amber-500 text-black shadow' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                العربية
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition ${
                  lang === 'en' ? 'bg-amber-500 text-black shadow' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Control Scheme Selection */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 p-4 rounded-xl space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-wider">
              <Sliders className="w-4 h-4" />
              <span>{t(lang, 'controlMode')}</span>
            </div>
            <p className="text-xs text-zinc-400">
              {lang === 'ar' 
                ? 'اختر بين دواسات السيارات القياسية (بنزين منفصل ورجوع للخلف منفصل) أو الجويستيك الافتراضي'
                : 'Choose between separate Gas/Reverse pedals or virtual analog joystick'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setControlMode('pedals')}
                className={`p-3 rounded-xl border text-start transition ${
                  controlMode === 'pedals'
                    ? 'border-amber-400 bg-amber-500/10 text-zinc-100 shadow'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <span className="font-black text-xs block mb-0.5 text-amber-300">
                  {lang === 'ar' ? 'دواسات سيارة قياسية (موصى به)' : 'Classic Car Pedals (Recommended)'}
                </span>
                <span className="text-[11px] text-zinc-400 block">
                  {lang === 'ar' ? 'دواسة بنزين خضراء + فرامل ورجوع حمراء + أزرار توجيه' : 'Separate Gas & Brake/Reverse pedals + steer buttons'}
                </span>
              </button>

              <button
                onClick={() => setControlMode('joystick')}
                className={`p-3 rounded-xl border text-start transition ${
                  controlMode === 'joystick'
                    ? 'border-amber-400 bg-amber-500/10 text-zinc-100 shadow'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <span className="font-black text-xs block mb-0.5 text-amber-300">
                  {lang === 'ar' ? 'جويستيك تناظري' : 'Virtual Analog Joystick'}
                </span>
                <span className="text-[11px] text-zinc-400 block">
                  {lang === 'ar' ? 'مقبض دائري للتحكم في كافة الاتجاهات' : 'Single 360-degree analog touch thumbstick'}
                </span>
              </button>
            </div>
          </div>

          {/* Audio Section */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 p-4 rounded-xl space-y-4">
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Volume2 className="w-4 h-4" /> 
              <span>{lang === 'ar' ? 'مستوى الصوتيات والمؤثرات' : 'AUDIO SYNTHESIZER VOLUMES'}</span>
            </h3>

            <div>
              <div className="flex justify-between text-xs text-zinc-300 mb-1">
                <span>{t(lang, 'sfxVolume')}</span>
                <span className="font-bold font-mono">{Math.round(sfxVol * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={sfxVol}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setSfxVol(val);
                  SoundSynthesizer.setVolumes(0.8, val, engineVol);
                  SoundSynthesizer.playPickup('coin');
                }}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-zinc-300 mb-1">
                <span>{t(lang, 'engineVolume')}</span>
                <span className="font-bold font-mono">{Math.round(engineVol * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={engineVol}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setEngineVol(val);
                  SoundSynthesizer.setVolumes(0.8, sfxVol, val);
                }}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Graphics & Touch Section */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 p-4 rounded-xl space-y-4">
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> 
              <span>{lang === 'ar' ? 'الرسوميات واللمس' : 'GRAPHICS & TOUCH'}</span>
            </h3>

            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-black text-zinc-200 block">
                  {lang === 'ar' ? 'دقة وتفاصيل الجزيئات والغبار' : 'PARTICLES & DUST DETAIL'}
                </span>
                <span className="text-[11px] text-zinc-400">
                  {lang === 'ar' ? 'يتحكم في كثافة الغبار وآثار التفحيط' : 'Controls particle count and skid history'}
                </span>
              </div>
              <div className="flex gap-1.5">
                {(['low', 'medium', 'high'] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuality(q)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg uppercase transition ${
                      quality === q
                        ? 'bg-amber-500 text-black'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-zinc-800">
              <div>
                <span className="text-xs font-black text-zinc-200 block flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-cyan-400" /> 
                  <span>{lang === 'ar' ? 'إظهار أزرار التحكم باللمس دائماً' : 'FORCE TOUCH CONTROLS'}</span>
                </span>
                <span className="text-[11px] text-zinc-400">
                  {lang === 'ar' ? 'إظهار الدواسات والأزرار حتى على شاشات الحاسوب' : 'Show on-screen pedals even on desktop'}
                </span>
              </div>
              <button
                onClick={() => setTouchControls(!touchControls)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${
                  touchControls ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {touchControls ? (lang === 'ar' ? 'مفعل دائماً' : 'ALWAYS ON') : (lang === 'ar' ? 'تلقائي' : 'AUTO')}
              </button>
            </div>
          </div>

          {/* AdMob Quick Test */}
          {onTestAdMob && (
            <div className="bg-amber-950/20 border border-amber-500/30 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-amber-300 block">
                  {t(lang, 'testAdmobBtn')}
                </span>
                <span className="text-[11px] text-zinc-400">
                  {lang === 'ar' ? 'اختبار مظهر وتوقيت إعلانات Google AdMob الرسمية' : 'Test Google AdMob test banner creative overlay'}
                </span>
              </div>
              <button
                onClick={onTestAdMob}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition active:scale-95 shadow"
              >
                {lang === 'ar' ? 'تشغيل الإعلان' : 'Play Ad'}
              </button>
            </div>
          )}

          {/* Backup & Save Management */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 p-4 rounded-xl space-y-3">
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Download className="w-4 h-4" /> 
              <span>{lang === 'ar' ? 'نسخ واستيراد الحفظ (JSON)' : 'SAVE BACKUP (JSON)'}</span>
            </h3>
            <textarea
              rows={3}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder={lang === 'ar' ? 'الصق كود الحفظ هنا للاستيراد...' : 'Paste save JSON here to import or click Export...'}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs font-mono text-zinc-300 focus:outline-none focus:border-amber-500"
            />
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <button
                  onClick={handleExport}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-lg transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> 
                  <span>{lang === 'ar' ? 'تصدير الحفظ' : 'EXPORT'}</span>
                </button>
                <button
                  onClick={handleImport}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-lg transition flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" /> 
                  <span>{lang === 'ar' ? 'استيراد' : 'IMPORT'}</span>
                </button>
              </div>
              {importStatus && <span className="text-[11px] text-amber-400">{importStatus}</span>}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800/80 bg-zinc-900/60 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-zinc-400 hover:text-white text-xs font-bold transition"
          >
            {t(lang, 'close')}
          </button>
          <button
            onClick={handleApplySettings}
            className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black rounded-xl shadow-lg transition active:scale-95 cursor-pointer"
          >
            {t(lang, 'closeBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};
