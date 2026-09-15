export type Language = 'ar' | 'en';

export const TRANSLATIONS = {
  // App Header & Branding
  appTitle: { en: 'DUNE SURVIVAL', ar: 'كثبان النجاة: حرب الصحراء' },
  appSubtitle: { en: 'POST-APOCALYPTIC COMBAT & SURVIVAL', ar: 'قتال وتفحيط وبقاء في عالم ما بعد الكارثة' },
  versionInfo: { en: 'VER. 2.0 • OFFLINE / ONLINE READY', ar: 'إصدار 2.0 • دعم اللعب بدون إنترنت والتخزين السحابي' },

  // Main Menu Buttons
  launchExpedition: { en: 'LAUNCH EXPEDITION', ar: 'انطلاق في الصحراء' },
  garage: { en: 'GARAGE', ar: 'الكراج والمركبات' },
  outpost: { en: 'BASE OUTPOST', ar: 'القاعدة والمحطة' },
  bounties: { en: 'MISSIONS', ar: 'المهام والمكافآت' },
  arsenal: { en: 'ARSENAL', ar: 'الأسلحة والعتاد' },
  maps: { en: 'SECTORS & MAPS', ar: 'المابات والمناطق' },
  settings: { en: 'SETTINGS', ar: 'الإعدادات والتحكم' },
  androidExport: { en: 'ANDROID EXPORT (APK)', ar: 'تصدير أندرويد (APK)' },
  onlineDossier: { en: 'ONLINE / PROFILE', ar: 'الملف السحابي' },
  assetStudio: { en: 'ASSET STUDIO', ar: 'دليل التصميم' },
  devCheats: { en: 'DEV CHEATS', ar: 'أدوات المطور' },

  // Map Selection
  selectSector: { en: 'SELECT EXPEDITION SECTOR', ar: 'اختر ماب المغامرة' },
  sectorDuneSea: { en: 'Dune Sea', ar: 'بحر الكثبان الرميلة' },
  sectorDuneSeaDesc: { en: 'Scorching golden dunes, dust devils, and rogue convoys.', ar: 'كثبان ذهبية حارقة، زوابع رملية، وقوافل قطاع طرق خطيرة.' },
  sectorToxic: { en: 'Toxic Wasteland', ar: 'الأراضي المشعة الملوثة' },
  sectorToxicDesc: { en: 'Green acid swamps, irradiated ruins, and mutated crawlers.', ar: 'مستنقعات حمضية خضراء، براميل إشعاع، ومتحولون زاحفون.' },
  sectorCanyon: { en: 'Canyon of Bones', ar: 'وادي الجماجم الصخري' },
  sectorCanyonDesc: { en: 'Colossal titan skeletons, tight rocky turns, and ambush ravines.', ar: 'هياكل عظمية عملاقة، ممرات صخرية ضيقة، وكمائن قاتلة.' },
  sectorScrapyard: { en: 'Cyber Scrap Graveyard', ar: 'مقبرة الخردة الصناعية' },
  sectorScrapyardDesc: { en: 'Mountains of decommissioned war-bots and slippery oil slicks.', ar: 'جبال من حطام الروبوتات الحربية وبقع زيت تزيد الانزلاق والتفحيط.' },
  startSector: { en: 'CONFIRM SECTOR & DRIVE', ar: 'تأكيد الماب والانطلاق' },

  // HUD
  hullIntegrity: { en: 'HULL INTEGRITY', ar: 'درع وهيكل المركبة' },
  fuelReserve: { en: 'FUEL RESERVE', ar: 'مخزون الوقود' },
  fuelRemaining: { en: 'FUEL', ar: 'مخزون الوقود' },
  nitroBoost: { en: 'NITRO BOOST', ar: 'نيترو توربو' },
  nitroTank: { en: 'NITRO NOS', ar: 'خزان نيترو NOS' },
  timeAlive: { en: 'SURVIVAL TIME', ar: 'زمن البقاء' },
  enemiesDefeated: { en: 'ELIMINATED', ar: 'القتلى' },
  speedKmh: { en: 'KM/H', ar: 'كم/ساعة' },
  lowFuelAlert: { en: 'CRITICAL FUEL! COLLECT JERRYCANS!', ar: 'تحذير: وقود منخفض جداً! اجمع البراميل!' },
  nightHordeAlert: { en: '🚨 NIGHTFALL: MUTANT ZOMBIE HORDE APPROACHING!', ar: '🚨 حلول الليل: هجوم قطيع الزومبي والمتحولين!' },
  daytimeAlert: { en: '☀️ DAWN BREAKS: BANDIT CONVOYS DEPLOYING', ar: '☀️ بزوغ الفجر: انتشار قوافل الدبابات والمركبات' },
  missileReady: { en: 'BASE MISSILE READY', ar: 'صاروخ القاعدة جاهز' },
  missileArmed: { en: 'CALLING MISSILE STRIKE!', ar: 'جاري إطلاق الصاروخ التكتيكي!' },

  // Mobile Controls
  gasPedal: { en: 'GAS', ar: 'بنزين' },
  brakePedal: { en: 'BRAKE', ar: 'فرامل' },
  reverse: { en: 'REV', ar: 'رجوع' },
  steerLeft: { en: 'LEFT', ar: 'يسار' },
  steerRight: { en: 'RIGHT', ar: 'يمين' },
  driftHandbrake: { en: 'DRIFT', ar: 'تفحيط' },
  fireWeapon: { en: 'FIRE', ar: 'إطلاق' },
  tacticalMissile: { en: 'MISSILE', ar: 'صاروخ' },

  // Game Over & AdMob
  strandedInDunes: { en: 'STRANDED IN THE DUNES', ar: 'عالق وسط الكثبان' },
  vehicleDestroyed: { en: 'VEHICLE DESTROYED', ar: 'تم تدمير المركبة' },
  fuelDeathMsg: { en: 'Your engine sputtered out. Scavengers stripped the chassis.', ar: 'نفد الوقود في قلب الصحراء، والتهم قطاع الطرق شاحنتك.' },
  hullDeathMsg: { en: 'Heavy enemy gunfire and zombie claws obliterated your rig.', ar: 'نيران العدو ومخالب الزومبي سحقت هيكل درعك بالكامل.' },
  expeditionScore: { en: 'EXPEDITION SCORE', ar: 'مجموع نقاط المغامرة' },
  retry: { en: 'RETRY RUN', ar: 'إعادة المحاولة' },
  garageBtn: { en: 'GARAGE', ar: 'الكراج' },
  menuBtn: { en: 'MAIN MENU', ar: 'القائمة الرئيسية' },

  // AdMob Test Ads
  admobTestBadge: { en: 'Google AdMob • Test Ad', ar: 'إعلان تجريبي • Google AdMob' },
  interstitialTitle: { en: 'Interstitial Ad (Defeat)', ar: 'إعلان بيني تجريبي (عند الهزيمة)' },
  rewardedRevive: { en: 'WATCH AD TO REVIVE (50% HP + FUEL)', ar: 'شاهد إعلان للإحياء فوراً (50% درع + وقود)' },
  rewardedDouble: { en: 'WATCH AD FOR 2X LOOT (DOUBLE COINS & SCRAP)', ar: 'شاهد إعلان لمضاعفة الغنائم (2X ذهب وخردة)' },
  adClosesIn: { en: 'Reward in:', ar: 'المكافأة خلال:' },
  skipAd: { en: 'Skip Ad', ar: 'تخطي الإعلان' },
  closeAd: { en: 'Close', ar: 'إغلاق' },
  rewardGranted: { en: 'REWARD GRANTED! +1 REVIVE APPLIED', ar: 'تم منح المكافأة بنجاح! تم إحياء مركبتك!' },
  doubleRewardGranted: { en: 'REWARD GRANTED! 2X COINS & SCRAP ADDED', ar: 'تم منح المكافأة! تمت مضاعفة العملات والخردة!' },

  // Settings
  settingsTitle: { en: 'GAME SETTINGS & CONTROLS', ar: 'إعدادات اللعبة والتحكم' },
  languageLabel: { en: 'Game Language', ar: 'لغة اللعبة' },
  controlMode: { en: 'Mobile Controls Scheme', ar: 'أسلوب التحكم في الهواتف' },
  pedalsMode: { en: 'Classic Pedals & Steer Buttons (Recommended)', ar: 'دواسات بنزين وفرامل + أزرار توجيه (موصى به)' },
  joystickMode: { en: 'Virtual Analog Joystick', ar: 'الجويستيك التناظري الافتراضي' },
  sfxVolume: { en: 'Sound Effects (SFX)', ar: 'مؤثرات الصوت (SFX)' },
  engineVolume: { en: 'Engine & Exhaust Roar', ar: 'صوت المحرك والعادم' },
  testAdmobBtn: { en: 'Test AdMob Interstitial Ad Now', ar: 'تجربة إعلان AdMob الآن' },
  closeBtn: { en: 'SAVE & CLOSE', ar: 'حفظ وإغلاق' },

  // Android Export Guide
  exportTitle: { en: 'HOW TO EXPORT TO ANDROID APK / AAB', ar: 'خطوات تصدير اللعبة لتطبيق أندرويد (APK / AAB)' },
  exportIntro: {
    en: 'You can easily package Dune Survival into a native Android APK or Google Play Bundle using Capacitor.',
    ar: 'يمكنك تحويل لعبة Dune Survival بسهولة إلى تطبيق أندرويد حقيقي بصيغة APK أو AAB ونشرها على متجر Google Play باستخدام إطار عمل Capacitor.'
  },
  selectMap: { en: 'SELECT COMBAT SECTOR', ar: 'اختر ماب المغامرة' },
  close: { en: 'CLOSE', ar: 'إغلاق' },
  confirm: { en: 'CONFIRM', ar: 'تأكيد' }
};

export function t(a: any, b: any): string {
  let key = '';
  let lang: Language = 'ar';

  if (typeof a === 'string' && (a === 'ar' || a === 'en')) {
    lang = a as Language;
    key = b;
  } else {
    key = a;
    lang = (b === 'ar' || b === 'en') ? (b as Language) : 'ar';
  }

  const item = (TRANSLATIONS as any)[key];
  if (!item) return key;
  return item[lang] || item['en'] || key;
}
