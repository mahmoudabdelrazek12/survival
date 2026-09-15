import React, { useState } from 'react';
import { X, Image, Copy, Check, Palette, Sparkles, Filter } from 'lucide-react';

export interface AssetSpecification {
  id: string;
  category: 'vehicles' | 'enemies' | 'weapons' | 'environments' | 'ui_artwork' | 'loot';
  filename: string;
  dimensions: string;
  usage: string;
  location: string;
  background: string;
  artStyle: string;
  prompt: string;
}

export const ASSET_SPECIFICATIONS: AssetSpecification[] = [
  {
    id: 'art_main_menu',
    category: 'ui_artwork',
    filename: 'main_menu_artwork.webp',
    dimensions: '1920x1080 (16:9)',
    usage: 'Main Menu background & Steam/App Store banner artwork',
    location: '/public/assets/images/ui/main_menu_artwork.webp',
    background: 'Fiery twilight desert horizon with distant sand dunes and oil derricks',
    artStyle: 'Gritty Post-Apocalyptic Concept Art, Mad Max & Dune inspired, golden hour rim lighting, dust haze',
    prompt: 'Concept art of a heavily armored post-apocalyptic combat buggy speeding through dramatic golden desert sand dunes at sunset, giant rolling dust storm in background, dramatic orange and deep amber lighting, exhaust flames, cinematic composition, photorealistic textures, 8k resolution, Unreal Engine 5 render style.'
  },
  {
    id: 'art_loading',
    category: 'ui_artwork',
    filename: 'loading_screen_artwork.webp',
    dimensions: '1920x1080 (16:9)',
    usage: 'Initial loading screen and transition backdrop',
    location: '/public/assets/images/ui/loading_screen_artwork.webp',
    background: 'Abandoned rust refinery silhouetted against a brutal daytime sun glare',
    artStyle: 'High-contrast concept digital painting, post-nuclear wasteland, desaturated sand and rust tones',
    prompt: 'A fortified desert survivor outpost built around rusted oil storage tanks, watchtowers with searchlights, solar panel arrays in sand, harsh blinding midday desert sun, heat wave mirage distortion, cinematic matte painting, atmospheric perspective.'
  },
  {
    id: 'veh_desert_vulture',
    category: 'vehicles',
    filename: 'vehicle_desert_vulture_topdown.webp',
    dimensions: '512x512 (1:1)',
    usage: 'Player starter scout buggy top-down in-game sprite & garage preview',
    location: '/public/assets/images/vehicles/desert_vulture.webp',
    background: 'Isolated transparent PNG background (no shadows, neutral studio lighting)',
    artStyle: 'Top-down orthographic 2D game asset, crisp industrial details, wear and tear rust edges',
    prompt: 'Top-down directly overhead 90-degree orthographic view of an agile desert scout buggy, yellow chassis with worn paint and rust patches, exposed engine block, four chunky off-road tires, twin hood-mounted vulcan cannons, roll-cage, clean transparent white background, isolated game sprite.'
  },
  {
    id: 'veh_dune_marauder',
    category: 'vehicles',
    filename: 'vehicle_dune_marauder_topdown.webp',
    dimensions: '512x512 (1:1)',
    usage: 'Reinforced interceptor top-down in-game sprite & garage preview',
    location: '/public/assets/images/vehicles/dune_marauder.webp',
    background: 'Isolated transparent PNG background',
    artStyle: 'Top-down orthographic 2D game asset, armored interceptor with spikes and front cowcatcher',
    prompt: 'Top-down overhead view of a rugged 4x4 wasteland interceptor truck, desert orange and matte black armor plates, steel spiked front bull-bar, roof-mounted gun turret ring, heavy rear suspension, isolated on white background, game ready orthographic sprite.'
  },
  {
    id: 'veh_iron_sandstorm',
    category: 'vehicles',
    filename: 'vehicle_iron_sandstorm_topdown.webp',
    dimensions: '512x512 (1:1)',
    usage: 'Heavy armored assault technical truck sprite',
    location: '/public/assets/images/vehicles/iron_sandstorm.webp',
    background: 'Isolated transparent PNG background',
    artStyle: 'Top-down orthographic 2D game asset, bolted steel armor plating, cobalt blue and rust',
    prompt: 'Top-down overhead orthographic game asset of a heavy armored 6-wheel military wasteland technical, welded scrap armor panels, dual heavy autocannons on turret, fuel drums strapped to rear, isolated transparent background, studio asset.'
  },
  {
    id: 'veh_apex_behemoth',
    category: 'vehicles',
    filename: 'vehicle_apex_behemoth_topdown.webp',
    dimensions: '1024x1024 (1:1)',
    usage: 'Ultimate tier combat fortress tank-truck top-down sprite',
    location: '/public/assets/images/vehicles/apex_behemoth.webp',
    background: 'Isolated transparent PNG background',
    artStyle: 'Top-down orthographic 2D game asset, crimson warlord colorway, double tracks',
    prompt: 'Top-down overhead view of a massive post-apocalyptic warlord war machine, crimson red and dark steel, heavy tracks and massive wheels, dual revolving rocket pods and heavy artillery turret, spiked ramming plow, isolated clean game sprite.'
  },
  {
    id: 'boss_war_rig',
    category: 'enemies',
    filename: 'boss_dune_behemoth_warrig.webp',
    dimensions: '1024x1024 (1:1)',
    usage: 'Major Sector Boss War Rig sprite with 3 independently rotating turrets',
    location: '/public/assets/images/enemies/boss_war_rig.webp',
    background: 'Isolated transparent PNG background',
    artStyle: 'Top-down orthographic boss asset, industrial wasteland nightmare, smoke stacks and hazard stripes',
    prompt: 'Top-down overhead orthographic view of an colossal apocalyptic War Rig truck, 8 huge heavy wheels, smokestacks spewing exhaust, yellow and black hazard striped cowcatcher, multiple gun turrets and rocket launchers, isolated on white background, game sprite.'
  },
  {
    id: 'boss_sand_worm',
    category: 'enemies',
    filename: 'boss_giant_sand_worm.webp',
    dimensions: '1024x1024 (1:1)',
    usage: 'Colossal desert burrowing worm boss sprite and animation frames',
    location: '/public/assets/images/enemies/boss_sand_worm.webp',
    background: 'Isolated transparent PNG background',
    artStyle: 'Top-down orthographic creature asset, chitinous brown desert armored plates, razor maw',
    prompt: 'Top-down overhead view of a monstrous subterranean sand worm beast, segmented armored carapace scales in sand brown and ochre, circular gaping maw lined with crystalline teeth, isolated on transparent background, game monster sprite.'
  },
  {
    id: 'env_dune_tile',
    category: 'environments',
    filename: 'desert_sand_dunes_seamless.webp',
    dimensions: '2048x2048 (1:1 Seamless Tile)',
    usage: 'Ground terrain canvas repeating base texture',
    location: '/public/assets/images/environment/desert_sand_dunes_seamless.webp',
    background: 'Seamlessly repeatable top-down desert sand ripples',
    artStyle: 'PBR texture, fine windblown desert sand grain with subtle gravel and sun-bleached pebble detail',
    prompt: 'Top-down seamlessly tileable desert sand texture with wind-carved dune ripple patterns, warm ochre and golden sand tones, fine mineral pebbles, high detail 4k seamless texture, diffuse map style.'
  },
  {
    id: 'loot_icons_sheet',
    category: 'loot',
    filename: 'loot_pickups_spritesheet.webp',
    dimensions: '1024x1024 (Atlas grid)',
    usage: 'In-game pickups: Gold Coins, Scrap Metal Nut, Fuel Jerrycan, Nanite Repair Kit, Rocket Box',
    location: '/public/assets/images/loot/loot_pickups_spritesheet.webp',
    background: 'Clean grid on transparent background',
    artStyle: 'Stylized isometric and flat game icons, readable at 32x32 to 64x64 icon resolutions',
    prompt: 'Game UI icon sprite set: 1) embossed gold currency coin with skull emblem, 2) rusted heavy hex iron nut scrap, 3) red vintage metal fuel jerrycan, 4) green army field emergency surgical toolkit, 5) olive military missile ammunition crate, isolated white background, clean vector outline style.'
  }
];

export const AssetCatalogModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'ALL ASSETS' },
    { id: 'vehicles', label: 'VEHICLES' },
    { id: 'enemies', label: 'ENEMIES & BOSSES' },
    { id: 'weapons', label: 'WEAPONS' },
    { id: 'environments', label: 'TERRAIN' },
    { id: 'ui_artwork', label: 'UI ARTWORK' },
    { id: 'loot', label: 'LOOT & ICONS' }
  ];

  const filtered = activeCategory === 'all'
    ? ASSET_SPECIFICATIONS
    : ASSET_SPECIFICATIONS.filter(a => a.category === activeCategory);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md font-gaming">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-800 bg-neutral-950/70">
          <div className="flex items-center gap-3">
            <Palette className="w-6 h-6 text-amber-500" />
            <div>
              <h2 className="font-heading text-3xl font-bold text-neutral-100 tracking-wider">
                VISUAL ASSET SPECIFICATIONS & AI PROMPTS
              </h2>
              <p className="text-xs text-neutral-400">
                Unified Art Direction catalog with studio-grade generative prompts for production assets
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 px-6 py-3 border-b border-neutral-800 bg-neutral-950/40 overflow-x-auto">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                activeCategory === c.id
                  ? 'bg-amber-500 text-neutral-950'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* List of Assets */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filtered.map((asset) => (
            <div
              key={asset.id}
              className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-4 flex flex-col gap-3 hover:border-neutral-700 transition"
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded uppercase font-bold mr-2">
                    {asset.category}
                  </span>
                  <span className="font-bold text-neutral-100 text-sm">{asset.filename}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
                  <span>Dim: <strong className="text-neutral-200">{asset.dimensions}</strong></span>
                  <span>|</span>
                  <span>Path: <strong className="text-neutral-300">{asset.location}</strong></span>
                </div>
              </div>

              <div className="text-xs text-neutral-300 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-neutral-900/50 p-2.5 rounded-lg border border-neutral-800/80">
                <div><span className="text-neutral-500 font-bold">Usage:</span> {asset.usage}</div>
                <div><span className="text-neutral-500 font-bold">Background:</span> {asset.background}</div>
                <div className="sm:col-span-2"><span className="text-neutral-500 font-bold">Art Style:</span> {asset.artStyle}</div>
              </div>

              {/* Generative Prompt Box */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 relative group">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1 uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" /> OFFICIAL STUDIO GENERATIVE PROMPT
                  </span>
                  <button
                    onClick={() => handleCopy(asset.id, asset.prompt)}
                    className="flex items-center gap-1 text-[11px] font-bold text-neutral-300 hover:text-amber-400 px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 transition cursor-pointer"
                  >
                    {copiedId === asset.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedId === asset.id ? 'COPIED' : 'COPY PROMPT'}
                  </button>
                </div>
                <p className="text-xs font-mono text-neutral-300 leading-relaxed select-all">
                  "{asset.prompt}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
