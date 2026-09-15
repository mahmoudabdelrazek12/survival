export interface MapSector {
  id: string;
  name: string;
  nameAr: string;
  tagline: string;
  taglineAr: string;
  description: string;
  descriptionAr: string;
  groundColor: string;
  duneColor: string;
  gridColor: string;
  nightOverlayColor: string;
  headlightColor: string;
  frictionMultiplier: number;
  driftBoost: number;
  ambientParticles: 'dust' | 'radiation' | 'embers' | 'sparks';
  obstacleTypes: ('rock' | 'ruin' | 'oil_derrick' | 'cactus' | 'bones' | 'toxic_barrel' | 'scrap_pile')[];
  hazardLabel: string;
  hazardLabelAr: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXTREME';
}

export const GAME_MAPS: MapSector[] = [
  {
    id: 'dune_sea',
    name: 'Dune Sea',
    nameAr: 'بحر الكثبان الرميلة',
    tagline: 'Endless Scorching Dunes',
    taglineAr: 'كثبان ذهبية حارقة لا نهائية',
    description: 'The vast classical desert filled with roaming raider convoys and shifting sand dunes.',
    descriptionAr: 'الصحراء الكلاسيكية الشاسعة مع قوافل الغزاة المتجولة والكثبان الرملية المتحركة.',
    groundColor: '#b45309',
    duneColor: '#92400e',
    gridColor: 'rgba(120, 53, 15, 0.25)',
    nightOverlayColor: 'rgba(10, 15, 30, 0.78)',
    headlightColor: 'rgba(254, 240, 138, 0.45)',
    frictionMultiplier: 1.0,
    driftBoost: 1.0,
    ambientParticles: 'dust',
    obstacleTypes: ['rock', 'rock', 'cactus', 'ruin', 'bones'],
    hazardLabel: 'Heatstroke & Fast Buggies',
    hazardLabelAr: 'حرارة الكثبان ودبابات الغزاة السريعة',
    difficulty: 'EASY'
  },
  {
    id: 'toxic_wasteland',
    name: 'Toxic Wasteland',
    nameAr: 'الأراضي المشعة الملوثة',
    tagline: 'Bio-Hazardous Green Muck',
    taglineAr: 'مستنقعات حمضية وبراميل نووية',
    description: 'Irradiated marshlands containing corroded radioactive tanks and mutant crawlers.',
    descriptionAr: 'مستنقعات ملوثة بالإشعاع مع بقايا مصانع نووية وزواحف متحولة شرسة.',
    groundColor: '#3f6212',
    duneColor: '#166534',
    gridColor: 'rgba(74, 222, 128, 0.2)',
    nightOverlayColor: 'rgba(4, 24, 16, 0.82)',
    headlightColor: 'rgba(187, 247, 208, 0.5)',
    frictionMultiplier: 0.92,
    driftBoost: 1.25,
    ambientParticles: 'radiation',
    obstacleTypes: ['toxic_barrel', 'ruin', 'rock', 'oil_derrick'],
    hazardLabel: 'Corrosive Sludge & Acid Spitters',
    hazardLabelAr: 'وحل أكال وزومبي باصق للحمض',
    difficulty: 'MEDIUM'
  },
  {
    id: 'canyon_of_bones',
    name: 'Canyon of Bones',
    nameAr: 'وادي الجماجم الصخري',
    tagline: 'Gargantuan Titan Ribcages',
    taglineAr: 'هياكل تيتان عملاقة وممرات ضيقة',
    description: 'Red sandstone gorges lined with monumental prehistoric leviathan skeletons and sharp cliffs.',
    descriptionAr: 'مضائق صخرية حمراء تحيط بها هياكل وحوش عملاقة وممرات انعطاف ضيقة.',
    groundColor: '#991b1b',
    duneColor: '#7f1d1d',
    gridColor: 'rgba(248, 113, 113, 0.25)',
    nightOverlayColor: 'rgba(20, 10, 25, 0.8)',
    headlightColor: 'rgba(254, 215, 170, 0.5)',
    frictionMultiplier: 1.1,
    driftBoost: 0.9,
    ambientParticles: 'embers',
    obstacleTypes: ['bones', 'rock', 'rock', 'ruin'],
    hazardLabel: 'Tight Chokepoints & Heavy Armor',
    hazardLabelAr: 'ممرات ضيقة وشاحنات مصفحة ثقيلة',
    difficulty: 'HARD'
  },
  {
    id: 'scrap_graveyard',
    name: 'Cyber Scrap Graveyard',
    nameAr: 'مقبرة الخردة الصناعية',
    tagline: 'High Speed Oil Slick Arena',
    taglineAr: 'حلبة حطام صناعي وبقع زيتية للتفحيط',
    description: 'Piles of dead war mechs, oily slicks that maximize drift traction, and aggressive cyber-beasts.',
    descriptionAr: 'أكوام من الروبوتات الحربية القديمة وبقع زيت تشعل التفحيط والانزلاق التوربيني.',
    groundColor: '#1f2937',
    duneColor: '#111827',
    gridColor: 'rgba(96, 165, 250, 0.25)',
    nightOverlayColor: 'rgba(10, 15, 25, 0.85)',
    headlightColor: 'rgba(191, 219, 254, 0.55)',
    frictionMultiplier: 0.8,
    driftBoost: 1.6,
    ambientParticles: 'sparks',
    obstacleTypes: ['scrap_pile', 'oil_derrick', 'ruin', 'rock'],
    hazardLabel: 'High Drift Slips & Explosive Scrap',
    hazardLabelAr: 'انزلاقات تفحيط شديدة وخردة متفجرة',
    difficulty: 'EXTREME'
  }
];

export function getMapById(id: string): MapSector {
  return GAME_MAPS.find(m => m.id === id) || GAME_MAPS[0];
}
