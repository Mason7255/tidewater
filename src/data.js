// ---------------------------------------------------------------------------
// data.js — Static game data: XP curve, fish, bait, gear, cosmetics, quality
// tiers, collection log entries, challenges. Pure data + pure lookup helpers,
// no dependency on the mutable `state` object.
// ---------------------------------------------------------------------------
// ---------- OSRS-style XP curve ----------


import { playerLevel, totalFishCaught } from './game.js';
import { state } from './state.js';

export var LEVEL_CAP = 99;
export var xpTable = [0, 0];
(function buildXpTable(){
  var points = 0;
  for(var level=1; level<=LEVEL_CAP; level++){
    xpTable[level] = Math.floor(points/4);
    points += Math.floor(level + 300 * Math.pow(2, level/7));
  }
})();
export function levelForXp(xp){
  for(var l=LEVEL_CAP; l>=1; l--){ if(xp >= xpTable[l]) return l; }
  return 1;
}

// ---------- Data ----------
export var OUTFIT_COLORS = [
  {id:'coral', hex:'#E8734F'}, {id:'teal', hex:'#2C9B92'}, {id:'gold', hex:'#D9A441'},
  {id:'purple', hex:'#7A5FA8'}, {id:'ink', hex:'#3A4A55'}
];
export var HATS = [
  {id:'hat_none', icon:'', label:'None'}, {id:'hat_red_cap', icon:'🧢', label:'Cap'},
  {id:'hat_teal_bucket', icon:'👒', label:'Bucket hat'}, {id:'hat_black_beanie', icon:'🎩', label:'Old hat'}
];
export var CUSTOM_SKINS = [
  {id:'skin_light', name:'Sunlit', color:'#F2C9A0', cost:0},
  {id:'skin_tan', name:'Warm Tan', color:'#C98F68', cost:150},
  {id:'skin_brown', name:'Copper Brown', color:'#8A5A3C', cost:250},
  {id:'skin_deep', name:'Deep Brown', color:'#5B3928', cost:350}
];
export var CUSTOM_HAIR = [
  {id:'hair_brown', name:'Chestnut Hair', color:'#4B2E20', cost:0},
  {id:'hair_black', name:'Black Hair', color:'#202124', cost:120},
  {id:'hair_blond', name:'Sunbleached Hair', color:'#D6A84F', cost:180},
  {id:'hair_red', name:'Copper Hair', color:'#9A4A32', cost:220}
];
export var CUSTOM_SHIRTS = [
  {id:'shirt_coral', name:'Sunset Coral Shirt', color:'#E8734F', cost:0},
  {id:'shirt_teal', name:'Harbor Teal Shirt', color:'#2C9B92', cost:120},
  {id:'shirt_ocean', name:'Open Ocean Shirt', color:'#3E7CB1', cost:180},
  {id:'shirt_lavender', name:'Lavender Tide Shirt', color:'#8B6BB1', cost:250},
  {id:'shirt_moss', name:'Moss Green Shirt', color:'#668A5B', cost:325},
  {id:'shirt_sand', name:'Sandbar Shirt', color:'#C5A36A', cost:450},
  {id:'shirt_navy', name:'Deepwater Navy Shirt', color:'#304D73', cost:650},
  {id:'shirt_crimson', name:'Crimson Wake Shirt', color:'#B84A4A', cost:900},
  {id:'shirt_gold', name:'Golden Hour Shirt', color:'#D9A441', cost:1100},
  {id:'shirt_ink', name:'Ink Black Shirt', color:'#3A4A55', cost:1400}
];
export var CUSTOM_HATS = [
  {id:'hat_none', name:'No Hat', color:'transparent', icon:'', cost:0},
  {id:'hat_red_cap', name:'Red Cap', color:'#C94D4D', icon:'🧢', cost:100},
  {id:'hat_blue_cap', name:'Blue Cap', color:'#3E78B5', icon:'🧢', cost:150},
  {id:'hat_yellow_cap', name:'Yellow Cap', color:'#D9A441', icon:'🧢', cost:200},
  {id:'hat_teal_bucket', name:'Teal Bucket Hat', color:'#2C9B92', icon:'👒', cost:275},
  {id:'hat_purple_bucket', name:'Purple Bucket Hat', color:'#8058A8', icon:'👒', cost:350},
  {id:'hat_black_beanie', name:'Black Beanie', color:'#30363D', icon:'🎩', cost:500},
  {id:'hat_gold_beanie', name:'Golden Beanie', color:'#D9A441', icon:'🎩', cost:800}
];
export var CUSTOM_POLES = [
  {id:'pole_brown', name:'Weathered Wood Pole', color:'#7A5A38', cost:0},
  {id:'pole_red', name:'Redline Pole', color:'#C94D4D', cost:150},
  {id:'pole_blue', name:'Bluewater Pole', color:'#3E78B5', cost:250},
  {id:'pole_teal', name:'Tideglass Pole', color:'#2C9B92', cost:400},
  {id:'pole_purple', name:'Deep Purple Pole', color:'#8058A8', cost:600},
  {id:'pole_white', name:'Moonlit Pole', color:'#D7DDE4', cost:850},
  {id:'pole_gold', name:'Gilded Pole', color:'#D9A441', cost:1200},
  {id:'pole_obsidian', name:'Obsidian Pole', color:'#252B33', cost:1800}
];

// Fish no longer have permanent species rarities. Each individual catch is graded by stars.
export var QUALITY_TIERS = {
  1: {label:'Poor', color:'#9AA0A6'},
  2: {label:'Common', color:'#58B86A'},
  3: {label:'Good', color:'#4A90E2'},
  4: {label:'Great', color:'#A05BEA'},
  5: {label:'Legendary', color:'#D9A441'}
};

export var FISH = [
  {id:'shrimp', name:'Shrimp', level:1, coins:3, xp:10, flavor:"Tiny and quick. Nearly everyone's first catch."},
  {id:'anchovies', name:'Anchovies', level:5, coins:5, xp:16, flavor:"Small schooling baitfish that hug the shallows."},
  {id:'perch', name:'Perch', level:10, coins:8, xp:24, flavor:"A feisty panfish that rewards a light touch."},
  {id:'bluegill', name:'Bluegill', level:15, coins:12, xp:32, flavor:"A familiar freshwater fighter found around structure."},
  {id:'carp', name:'Carp', level:20, coins:18, xp:42, flavor:"Heavy-bodied and stubborn once it realizes it is hooked."},
  {id:'trout', name:'Trout', level:25, coins:28, xp:55, flavor:"Cold-water fish prized for its clean fight and bright scales."},
  {id:'catfish', name:'Catfish', level:30, coins:40, xp:70, flavor:"A strong bottom-feeder that can make a quiet pool feel alive."},
  {id:'crab', name:'Crab', level:35, coins:55, xp:82, flavor:"A sideways scuttler best taken with a proper trap."},
  {id:'lobster', name:'Lobster', level:40, coins:80, xp:100, flavor:"A valuable crustacean that demands sturdier gear."},
  {id:'bass', name:'Bass', level:45, coins:110, xp:120, flavor:"A powerful predator with a sharp strike and hard run."},
  {id:'sturgeon', name:'Sturgeon', level:50, coins:150, xp:145, flavor:"An ancient, heavy fish that tests every part of your setup."},
  {id:'koi', name:'Koi', level:55, coins:200, xp:170, flavor:"A prized ornamental fish with striking colors."},
  {id:'squid', name:'Squid', level:60, coins:275, xp:200, flavor:"A deep-water cephalopod that needs specialized tackle."},
  {id:'octopus', name:'Octopus', level:65, coins:375, xp:235, flavor:"Clever, elusive, and strong enough to turn a simple catch into a battle."},
  {id:'eel', name:'Eel', level:70, coins:500, xp:275, flavor:"Slippery and powerful, with a talent for finding weak points in tackle."},
  {id:'marlin', name:'Marlin', level:75, coins:700, xp:320, flavor:"A fast offshore game fish built for long runs."},
  {id:'dragonfish', name:'Dragonfish', level:80, coins:950, xp:370, flavor:"A strange deep-water predator from waters few anglers reach."},
  {id:'megalodon', name:'Megalodon', level:85, coins:1300, xp:430, flavor:"A monstrous relic of the deep that requires extreme tackle."},
  {id:'leviathan', name:'Leviathan', level:90, coins:1800, xp:500, flavor:"The ultimate deep-water catch. Almost nobody sees one, let alone lands one."}
];

// Each fish now has its own bait. Bait targets that species directly.
export var BAIT_TYPES = [
  {id:'shrimp_bait', fishId:'shrimp', name:'Shrimp bait', icon:'🍤', packCost:8, packAmount:5},
  {id:'anchovy_bait', fishId:'anchovies', name:'Anchovy bait', icon:'🐟', packCost:12, packAmount:5},
  {id:'perch_bait', fishId:'perch', name:'Perch bait', icon:'🐟', packCost:18, packAmount:5},
  {id:'bluegill_bait', fishId:'bluegill', name:'Bluegill bait', icon:'🐟', packCost:25, packAmount:5},
  {id:'carp_bait', fishId:'carp', name:'Carp bait', icon:'🎣', packCost:35, packAmount:5},
  {id:'trout_bait', fishId:'trout', name:'Trout bait', icon:'🌈', packCost:50, packAmount:5},
  {id:'catfish_bait', fishId:'catfish', name:'Catfish bait', icon:'🐱', packCost:70, packAmount:5},
  {id:'crab_bait', fishId:'crab', name:'Crab bait', icon:'🦀', packCost:95, packAmount:5},
  {id:'lobster_bait', fishId:'lobster', name:'Lobster bait', icon:'🦞', packCost:130, packAmount:5},
  {id:'bass_bait', fishId:'bass', name:'Bass bait', icon:'🐟', packCost:170, packAmount:5},
  {id:'sturgeon_bait', fishId:'sturgeon', name:'Sturgeon bait', icon:'🎣', packCost:220, packAmount:5},
  {id:'koi_bait', fishId:'koi', name:'Koi bait', icon:'🐠', packCost:300, packAmount:5},
  {id:'squid_bait', fishId:'squid', name:'Squid bait', icon:'🦑', packCost:400, packAmount:5},
  {id:'octopus_bait', fishId:'octopus', name:'Octopus bait', icon:'🐙', packCost:525, packAmount:5},
  {id:'eel_bait', fishId:'eel', name:'Eel bait', icon:'🐍', packCost:700, packAmount:5},
  {id:'marlin_bait', fishId:'marlin', name:'Marlin bait', icon:'🐟', packCost:900, packAmount:5},
  {id:'dragonfish_bait', fishId:'dragonfish', name:'Dragonfish bait', icon:'🐉', packCost:1200, packAmount:5},
  {id:'megalodon_bait', fishId:'megalodon', name:'Megalodon bait', icon:'🦈', packCost:1600, packAmount:5},
  {id:'leviathan_bait', fishId:'leviathan', name:'Leviathan bait', icon:'🐋', packCost:2200, packAmount:5}
];

export function baitById(id){
  for(var i=0;i<BAIT_TYPES.length;i++){ if(BAIT_TYPES[i].id===id) return BAIT_TYPES[i]; }
  return null;
}
export function baitForFish(fishId){
  for(var i=0;i<BAIT_TYPES.length;i++){ if(BAIT_TYPES[i].fishId===fishId) return BAIT_TYPES[i]; }
  return null;
}

// Species-specific fishing equipment. Each setup is designed for one target species.
// The equipment itself determines what can be caught; matching bait is optional but faster.
export var EQUIPMENT = [
  {id:'shrimp_net', fishId:'shrimp', name:'Shrimp cast net', icon:'🕸️', cost:0, level:1, type:'net', desc:'A small hand-cast net for shallow shrimping.'},
  {id:'anchovy_seine', fishId:'anchovies', name:'Anchovy seine net', icon:'🥅', cost:75, level:5, type:'net', desc:'A fine-mesh seine built for schooling anchovies.'},
  {id:'perch_spinning_rod', fishId:'perch', name:'Perch spinning rod', icon:'🎣', cost:150, level:10, type:'rod', desc:'A responsive light spinning setup for perch.'},
  {id:'bluegill_rod', fishId:'bluegill', name:'Ultralight bluegill rod', icon:'🎣', cost:250, level:15, type:'rod', desc:'A light freshwater rod tuned for bluegill.'},
  {id:'carp_rod', fishId:'carp', name:'Carp rod & rig', icon:'🎣', cost:400, level:20, type:'rod', desc:'A stronger rod and bottom rig for heavy carp.'},
  {id:'trout_fly_rod', fishId:'trout', name:'Trout fly rod', icon:'🪶', cost:650, level:25, type:'rod', desc:'A balanced fly setup for fast, cold-water trout.'},
  {id:'catfish_bottom_rig', fishId:'catfish', name:'Catfish bottom rig', icon:'🪝', cost:900, level:30, type:'rig', desc:'Heavy terminal tackle for powerful bottom-feeders.'},
  {id:'crab_pot', fishId:'crab', name:'Crab pot', icon:'🪤', cost:1200, level:35, type:'trap', desc:'A sturdy baited pot for working crab grounds.'},
  {id:'lobster_trap', fishId:'lobster', name:'Lobster trap', icon:'🦞', cost:2600, level:40, type:'trap', desc:'A commercial-style trap built for valuable lobster.'},
  {id:'bass_spinning_rod', fishId:'bass', name:'Bass spinning rod', icon:'🎣', cost:4600, level:45, type:'rod', desc:'Medium-heavy spinning tackle for hard-fighting bass.'},
  {id:'sturgeon_heavy_rig', fishId:'sturgeon', name:'Sturgeon heavy rig', icon:'⚓', cost:8000, level:50, type:'rig', desc:'A powerful bottom rig for large, ancient fish.'},
  {id:'koi_carp_rod', fishId:'koi', name:'Koi match rod', icon:'🎣', cost:14000, level:55, type:'rod', desc:'Long, controlled tackle for valuable koi.'},
  {id:'squid_jigging_rig', fishId:'squid', name:'Deep squid jigging rig', icon:'🦑', cost:24000, level:60, type:'deep', desc:'Specialized lights and jigs for deep squid.'},
  {id:'octopus_pot', fishId:'octopus', name:'Octopus pot', icon:'🪤', cost:42500, level:65, type:'trap', desc:'A reinforced pot designed for strong, clever cephalopods.'},
  {id:'eel_trap', fishId:'eel', name:'Deep eel trap', icon:'🪤', cost:76000, level:70, type:'trap', desc:'Heavy trap gear for deep, slippery eels.'},
  {id:'marlin_trolling_rig', fishId:'marlin', name:'Marlin trolling rig', icon:'⚓', cost:135000, level:75, type:'biggame', desc:'Heavy offshore trolling gear for powerful billfish.'},
  {id:'dragonfish_deep_rig', fishId:'dragonfish', name:'Dragonfish deep rig', icon:'🐉', cost:245000, level:80, type:'deep', desc:'Extreme deep-water tackle for rare dragonfish.'},
  {id:'megalodon_biggame_rig', fishId:'megalodon', name:'Megalodon big-game rig', icon:'🦈', cost:450000, level:85, type:'biggame', desc:'Massive cable, reel, and terminal tackle for prehistoric predators.'},
  {id:'leviathan_deepsea_rig', fishId:'leviathan', name:'Leviathan deep-sea rig', icon:'🌊', cost:830000, level:90, type:'biggame', desc:'The ultimate fictional deep-water rig for the Leviathan.'}
];

export function equipmentById(id){
  for(var i=0;i<EQUIPMENT.length;i++){ if(EQUIPMENT[i].id===id) return EQUIPMENT[i]; }
  return null;
}
export function equipmentForFish(fishId){
  for(var i=0;i<EQUIPMENT.length;i++){ if(EQUIPMENT[i].fishId===fishId) return EQUIPMENT[i]; }
  return null;
}
export function startingOwnedEquipment(){
  return {shrimp_net:true};
}
export function makeBaitCounts(){
  var counts = {};
  BAIT_TYPES.forEach(function(b){ counts[b.id] = 0; });
  counts.shrimp_bait = STARTING_BAIT;
  return counts;
}

// Rare curiosities: a small, per-species chance to also pull up a junk/log
// item alongside the fish itself — tracked separately in the Collection Log.
// Every curiosity below also doubles as an equippable "trinket" (see
// TRINKET_SLOTS / trinketItems() below) — trinket:true marks it as
// eligible to equip. Most have no bonus yet (speedBonus/noBaitChance
// omitted); the two starter trinkets with real effects are lobster_claw
// (+25% fishing speed) and bass_lure (50% chance a cast uses no bait).
export var COLLECTION_LOG_ITEMS = [
  {id:'old_boot', fishId:'shrimp', name:'Old Boot', icon:'👢', chance:0.0002, flavor:"Somebody's lost boot, waterlogged and sad.", trinket:true},
  {id:'silver_ring', fishId:'anchovies', name:'Silver Ring', icon:'💍', chance:0.0002, flavor:'Tarnished, but still shines under the dock lights.', trinket:true},
  {id:'tin_can', fishId:'perch', name:'Rusty Tin Can', icon:'🥫', chance:0.0002, flavor:"Someone's lunch, decades ago.", trinket:true},
  {id:'broken_watch', fishId:'bluegill', name:'Broken Watch', icon:'⌚', chance:0.0002, flavor:'Stopped at a time nobody remembers.', trinket:true},
  {id:'bottle_message', fishId:'carp', name:'Message in a Bottle', icon:'🍾', chance:0.0002, flavor:'The ink has run, but something was written here.', trinket:true},
  {id:'lost_lure', fishId:'trout', name:'Lost Lure', icon:'🪝', chance:0.0002, flavor:"Another angler's bad luck, sitting on the bottom.", trinket:true},
  {id:'old_key', fishId:'catfish', name:'Rusted Key', icon:'🗝️', chance:0.0002, flavor:'No telling what it used to open.', trinket:true},
  {id:'small_pearl', fishId:'crab', name:'Small Pearl', icon:'🫧', chance:0.0002, flavor:'Smooth and pale, tucked in the mud.', trinket:true},
  {id:'lobster_claw', fishId:'lobster', name:'Carved Lobster Claw', icon:'🦞', chance:0.0002, flavor:'A strange keepsake from an old fishing boat.', trinket:true, speedBonus:0.25},
  {id:'bass_lure', fishId:'bass', name:'Vintage Bass Lure', icon:'🪝', chance:0.0002, flavor:'Paint chipped, hooks dulled, story unknown.', trinket:true, noBaitChance:0.5},
  {id:'sturgeon_tag', fishId:'sturgeon', name:'Old Sturgeon Tag', icon:'🏷️', chance:0.0002, flavor:'A faded research tag from years ago.', trinket:true},
  {id:'koi_coin', fishId:'koi', name:'Koi Collector Coin', icon:'🪙', chance:0.0002, flavor:'A polished token stamped with a koi.', trinket:true},
  {id:'squid_ink', fishId:'squid', name:'Ink Vial', icon:'🧪', chance:0.0002, flavor:'Dark ink sealed in an old glass vial.', trinket:true},
  {id:'octopus_charm', fishId:'octopus', name:'Octopus Charm', icon:'🧿', chance:0.0002, flavor:'Eight tiny arms carved into a weathered charm.', trinket:true},
  {id:'eel_scale', fishId:'eel', name:'Eel Scale Charm', icon:'🧿', chance:0.0002, flavor:'A strange charm worn smooth by years underwater.', trinket:true},
  {id:'captains_compass', fishId:'marlin', name:"Captain's Compass", icon:'🧭', chance:0.0002, flavor:'Still points somewhere. Just maybe not north.', trinket:true},
  {id:'dragonfang', fishId:'dragonfish', name:'Dragonfang Fragment', icon:'🦷', chance:0.0002, flavor:'A tiny fragment from something that should not be this deep.', trinket:true},
  {id:'megalodon_tooth', fishId:'megalodon', name:'Megalodon Tooth', icon:'🦷', chance:0.0002, flavor:'A huge fossilized tooth from an ancient predator.', trinket:true},
  {id:'leviathan_scale', fishId:'leviathan', name:'Leviathan Scale', icon:'🪽', chance:0.0002, flavor:"Bigger than your hand. You don't want to know what shed it.", trinket:true}
];
// Trinkets aren't tied to a body slot like clothing — any owned trinket can
// fill any of the equipped slots, up to TRINKET_SLOTS at once.
export var TRINKET_SLOTS = 3;
export function trinketItems(){ return COLLECTION_LOG_ITEMS.filter(function(item){ return !!item.trinket; }); }
export function trinketById(id){ return trinketItems().filter(function(item){ return item.id===id; })[0] || null; }
var MYTHIC_LOG_ITEMS = [];
export var CLOTHING_SLOTS = ['hat','shirt','pants','shoes','gloves'];
// Fish ids in this list get 5 named, wearable mythic pieces (one per slot in
// CLOTHING_SLOTS) instead of the generic "Mythic 1-5" flavor items below.
// Each piece's speedBonus stacks additively and reduces cast time — see
// totalClothingSpeedBonus()/castDurationMs() in game.js. Add a fish's id
// here (and a matching entry in CLOTHING_SETS) to extend clothing to it.
var CLOTHING_FISH_IDS = ['shrimp'];
var CLOTHING_SETS = {
  shrimp: [
    {slot:'hat', name:'Shrimp-shell Cap', icon:'🦐', flavor:'A little snug. Smells faintly of brine.'},
    {slot:'shirt', name:'Shrimp-scale Vest', icon:'🦐', flavor:'Iridescent plating stitched from countless molts.'},
    {slot:'pants', name:'Shrimp-tail Waders', icon:'🦐', flavor:'Surprisingly flexible for something so armored.'},
    {slot:'shoes', name:'Shrimp-foot Boots', icon:'🦐', flavor:'Somehow lets you feel the current through the sole.'},
    {slot:'gloves', name:'Shrimp-claw Gloves', icon:'🦐', flavor:'A firmer grip on the rod than you have ever had.'}
  ]
};
var CLOTHING_SPEED_BONUS_PER_PIECE = 0.04; // 5 pieces => 20% total when a full set is equipped
FISH.forEach(function(fish){
  if(CLOTHING_FISH_IDS.indexOf(fish.id) >= 0){
    CLOTHING_SETS[fish.id].forEach(function(piece){
      MYTHIC_LOG_ITEMS.push({id:'mythic_'+fish.id+'_'+piece.slot, fishId:fish.id, slot:piece.slot, name:piece.name, icon:piece.icon, chance:0.001, mythic:true, clothing:true, speedBonus:CLOTHING_SPEED_BONUS_PER_PIECE, flavor:piece.flavor});
    });
    return;
  }
  for(var mythicNumber=1;mythicNumber<=5;mythicNumber++){
    MYTHIC_LOG_ITEMS.push({id:'mythic_'+fish.id+'_'+mythicNumber, fishId:fish.id, name:'Mythic '+mythicNumber, icon:'✦', chance:0.001, mythic:true, flavor:'A mythic form of '+fish.name+'. Its true name is still waiting to be written.'});
  }
});
COLLECTION_LOG_ITEMS = COLLECTION_LOG_ITEMS.concat(MYTHIC_LOG_ITEMS);
export function logItemById(id){ for(var i=0;i<COLLECTION_LOG_ITEMS.length;i++){ if(COLLECTION_LOG_ITEMS[i].id===id) return COLLECTION_LOG_ITEMS[i]; } return null; }
export function logItemForFish(fishId){ for(var i=0;i<COLLECTION_LOG_ITEMS.length;i++){ if(COLLECTION_LOG_ITEMS[i].fishId===fishId) return COLLECTION_LOG_ITEMS[i]; } return null; }
export function mythicLogItemsForFish(fishId){ return MYTHIC_LOG_ITEMS.filter(function(item){ return item.fishId===fishId; }); }
export function clothingItems(){ return MYTHIC_LOG_ITEMS.filter(function(item){ return !!item.clothing; }); }
export function clothingItemsForSlot(slot){ return clothingItems().filter(function(item){ return item.slot===slot; }); }

// Challenges are tiered. Claiming one removes it and immediately advances that
// challenge family to its next target. When the final tier is claimed, that
// challenge family disappears permanently.
var FISH_CATCH_THRESHOLDS = [5,10,25,50,100,250,500,1000,5000];
var FISH_CHALLENGE_ICONS = {shrimp:'🦐',anchovies:'🐟',perch:'🐟',bluegill:'🐟',carp:'🐟',trout:'🐟',catfish:'🐟',crab:'🦀',lobster:'🦞',bass:'🐟',sturgeon:'🐟',koi:'🐠',squid:'🦑',octopus:'🐙',eel:'🐍',marlin:'🐟',dragonfish:'🐉',megalodon:'🦈',leviathan:'🐋'};
export var CHALLENGES = [
  {id:'catch', name:'Catch fish', icon:'🐟', tiers:[10,100,500,1000,5000], rewards:[20,75,200,500,1500], progress:function(){ return totalFishCaught(); }},
  {id:'level', name:'Reach Fishing Lv', icon:'⭐', tiers:[10,25,50,75,100], rewards:[30,80,200,500,1200], progress:function(){ return playerLevel(); }},
  {id:'trophy', name:'Land a rare catch', icon:'🏆', tiers:[100,1000,10000,100000,1000000], rewards:[50,125,300,1000,3000], progress:function(){ return state.records.bestFloat > 0 && state.records.bestFishId ? Math.floor(1/state.records.bestFloat) : 0; }},
  {id:'species', name:'Discover species', icon:'📖', tiers:[5,10,15,19], rewards:[40,100,250,750], progress:function(){ return Object.keys(state.caught).length; }},
  // Tiers used to top out at 19, back when the log only held the 18 unique
  // curiosities. It now also holds 95 mythic drops (113 possible entries
  // total), so the old cap let players max this out almost immediately with
  // no further progression. Tiers now run the full length of the log, with
  // the final tier a genuine completionist milestone.
  {id:'log', name:'Find collection log items', icon:'📜', tiers:[1,5,15,30,60,113], rewards:[25,100,300,750,2000,5000], progress:function(){ return Object.keys(state.collectionLog||{}).length; }}
].concat(FISH.map(function(fish){
  return {id:'fish_'+fish.id, name:'Catch '+fish.name, icon:FISH_CHALLENGE_ICONS[fish.id] || '🐟', tiers:FISH_CATCH_THRESHOLDS, rewards:[0,0,0,0,0,0,0,0,0], rewardType:'cosmetic', progress:function(){ return state.caught[fish.id] || 0; }};
}));

export var STARTING_BAIT = 5;
export var BASE_CAST_MS = 5000;
export var NO_BAIT_CAST_MS = 12000;
export var RATING_EXPONENT = 4;

// ---------- Upgrades ----------
// A deliberate, coin-purchased track for getting better at fishing, separate
// from clothing/trinkets (which come from rare drops, not purchase). Each
// upgrade is a flat one-time buy gated by Fishing Level; state.upgrades[id]
// tracks ownership. More can be added here later without touching anything
// else -- renderUpgrades() in screens.js iterates this list generically.
export var UPGRADES = [
  {
    id:'auto_sell',
    name:'Auto-Sell',
    icon:'💰',
    level:10,
    cost:500,
    desc:'Automatically sells any catch at or below a star threshold you choose (1–3 stars), so your bucket never fills up while you’re away from the dock. Trophy-tier 4–5 star catches are never auto-sold. Off by default -- pick a threshold after buying.'
  }
];
export function upgradeById(id){ for(var i=0;i<UPGRADES.length;i++){ if(UPGRADES[i].id===id) return UPGRADES[i]; } return null; }

// ---------- Consumables ----------
// Repeatable coin sink, unlike the one-time UPGRADES above: bought in packs
// from the shop's Consumables tab, then quick-used right from the dock scene
// (see the consumables row in game.js) for a short 60-second buff. Each use
// consumes one unit and resets the buff to a fresh full duration -- so using
// another one while it's already running just "tops off the drink" rather
// than stacking. state.consumableCounts tracks owned units, state.activeBuffs
// tracks {id: expiresAtEpochMs} -- see isBuffActive()/buffRemainingMs() in
// state.js, which check against Date.now() so a buff still correctly expires
// even if the tab was closed while it was running.
export var CONSUMABLES = [
  {
    id:'six_pack',
    name:'Six-Pack',
    icon:'🍺',
    packCost:30,
    packAmount:6,
    duration:60000,
    effect:'quality',
    magnitude:0.3,
    flavor:'Liquid confidence. Every catch looks like a personal best after a few of these.',
    useMessage:'Cracked one open. Feeling lucky for the next minute.'
  },
  {
    id:'cigarettes',
    name:'Pack of Cigarettes',
    icon:'🚬',
    packCost:60,
    packAmount:20,
    duration:60000,
    effect:'speed',
    magnitude:0.2,
    flavor:'Not medically recommended. Somehow reels faster anyway.',
    useMessage:'Lit one up. Reeling faster for the next minute.'
  }
];
export function consumableById(id){ for(var i=0;i<CONSUMABLES.length;i++){ if(CONSUMABLES[i].id===id) return CONSUMABLES[i]; } return null; }
export function makeConsumableCounts(){
  var counts = {};
  CONSUMABLES.forEach(function(c){ counts[c.id] = 0; });
  return counts;
}

// ---------- Dock scene backgrounds ----------
// Each entry (besides 'default', which just falls back to the existing
// CSS-drawn scene) carries a small self-contained pixel-art SVG that gets
// injected directly into #dockScene — see applyBackground() in game.js. To
// add another one: drop a new object in here with a fresh unlock condition.
// unlock.type 'total' checks totalFishCaught() >= amount -- every background
// unlocks just from fishing in general, not from any specific species, so
// players always have a next one in sight no matter what they're catching.
// (The old 'catch' type, gated on a specific fishId, is still supported
// below in case a future background wants to reward a specific species.)
export var BACKGROUNDS = [
  {id:'default', name:'Classic Ocean', unlock:null, svg:null},
  {
    id:'sunny_shore',
    name:'Sunny Shore',
    unlock:{type:'total', amount:10},
    svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" width="768" height="480" shape-rendering="crispEdges"><rect width="64" height="40" fill="#000"/><rect x="0" y="0" width="64" height="20" fill="#5ec8f0"/><rect x="55" y="2" width="6" height="2" fill="#ffffff"/><rect x="56" y="1" width="4" height="1" fill="#ffffff"/><rect x="5" y="2" width="6" height="2" fill="#ffffff"/><rect x="6" y="1" width="4" height="1" fill="#ffffff"/><rect x="23" y="3" width="6" height="2" fill="#ffffff"/><rect x="24" y="2" width="4" height="1" fill="#ffffff"/><rect x="47" y="7" width="6" height="2" fill="#ffffff"/><rect x="48" y="6" width="4" height="1" fill="#ffffff"/><circle cx="10" cy="6" r="3" fill="#fff6c8"/><polygon points="0,40 0,20 4,20 10,19 16,18 24,19 32,20 40,19 47,17 55,18 63,17 64,20 64,40" fill="#4d7a5b"/><rect x="0" y="19.0" width="64" height="4.5" fill="#2f97c9"/><rect x="0" y="23.2" width="64" height="4.5" fill="#2789b8"/><rect x="0" y="27.4" width="64" height="4.5" fill="#1f7aa5"/><rect x="0" y="31.6" width="64" height="4.5" fill="#186c92"/><rect x="0" y="35.8" width="64" height="4.5" fill="#125e80"/></svg>'
  },
  {
    id:'foggy_harbor',
    name:'Foggy Harbor',
    unlock:{type:'total', amount:25},
    svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" width="768" height="480" shape-rendering="crispEdges"><rect width="64" height="40" fill="#000"/><rect x="0" y="0" width="64" height="22" fill="#b9c4c6"/><rect x="50" y="10" width="6" height="2" fill="#d7dedd"/><rect x="51" y="9" width="4" height="1" fill="#d7dedd"/><rect x="52" y="2" width="6" height="2" fill="#d7dedd"/><rect x="53" y="1" width="4" height="1" fill="#d7dedd"/><rect x="31" y="13" width="6" height="2" fill="#d7dedd"/><rect x="32" y="12" width="4" height="1" fill="#d7dedd"/><rect x="16" y="1" width="6" height="2" fill="#d7dedd"/><rect x="17" y="0" width="4" height="1" fill="#d7dedd"/><rect x="0" y="3" width="6" height="2" fill="#d7dedd"/><rect x="1" y="2" width="4" height="1" fill="#d7dedd"/><rect x="42" y="10" width="6" height="2" fill="#d7dedd"/><rect x="43" y="9" width="4" height="1" fill="#d7dedd"/><polygon points="0,40 0,20 4,21 10,22 14,22 22,21 28,21 32,21 39,22 46,20 54,20 58,22 64,22 64,40" fill="#8ea3a2"/><rect x="0" y="10" width="64" height="14" fill="#c7d2cf"/><rect x="0" y="20.0" width="64" height="4.3" fill="#93a6a3"/><rect x="0" y="24.0" width="64" height="4.3" fill="#849896"/><rect x="0" y="28.0" width="64" height="4.3" fill="#748887"/><rect x="0" y="32.0" width="64" height="4.3" fill="#657875"/><rect x="0" y="36.0" width="64" height="4.3" fill="#566866"/></svg>'
  },
  {
    id:'rainy_docks',
    name:'Rainy Docks',
    unlock:{type:'total', amount:50},
    svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" width="768" height="480" shape-rendering="crispEdges"><rect width="64" height="40" fill="#000"/><rect x="0" y="0" width="64" height="20" fill="#5c6b78"/><rect x="20" y="3" width="6" height="2" fill="#414f5c"/><rect x="21" y="2" width="4" height="1" fill="#414f5c"/><rect x="25" y="1" width="6" height="2" fill="#414f5c"/><rect x="26" y="0" width="4" height="1" fill="#414f5c"/><rect x="4" y="9" width="6" height="2" fill="#414f5c"/><rect x="5" y="8" width="4" height="1" fill="#414f5c"/><rect x="6" y="6" width="6" height="2" fill="#414f5c"/><rect x="7" y="5" width="4" height="1" fill="#414f5c"/><rect x="37" y="1" width="6" height="2" fill="#414f5c"/><rect x="38" y="0" width="4" height="1" fill="#414f5c"/><rect x="32" y="4" width="6" height="2" fill="#414f5c"/><rect x="33" y="3" width="4" height="1" fill="#414f5c"/><rect x="2" y="2" width="6" height="2" fill="#414f5c"/><rect x="3" y="1" width="4" height="1" fill="#414f5c"/><rect x="41" y="9" width="1" height="3" fill="#7fa8c9"/><rect x="50" y="3" width="1" height="3" fill="#7fa8c9"/><rect x="9" y="34" width="1" height="3" fill="#7fa8c9"/><rect x="12" y="23" width="1" height="3" fill="#7fa8c9"/><rect x="7" y="32" width="1" height="3" fill="#7fa8c9"/><rect x="27" y="2" width="1" height="3" fill="#7fa8c9"/><rect x="11" y="27" width="1" height="3" fill="#7fa8c9"/><rect x="53" y="4" width="1" height="3" fill="#7fa8c9"/><rect x="30" y="5" width="1" height="3" fill="#7fa8c9"/><rect x="54" y="3" width="1" height="3" fill="#7fa8c9"/><rect x="15" y="14" width="1" height="3" fill="#7fa8c9"/><rect x="7" y="25" width="1" height="3" fill="#7fa8c9"/><rect x="6" y="14" width="1" height="3" fill="#7fa8c9"/><rect x="5" y="8" width="1" height="3" fill="#7fa8c9"/><rect x="37" y="26" width="1" height="3" fill="#7fa8c9"/><rect x="18" y="34" width="1" height="3" fill="#7fa8c9"/><rect x="15" y="19" width="1" height="3" fill="#7fa8c9"/><rect x="23" y="6" width="1" height="3" fill="#7fa8c9"/><rect x="24" y="23" width="1" height="3" fill="#7fa8c9"/><rect x="12" y="4" width="1" height="3" fill="#7fa8c9"/><rect x="7" y="13" width="1" height="3" fill="#7fa8c9"/><rect x="63" y="34" width="1" height="3" fill="#7fa8c9"/><rect x="54" y="20" width="1" height="3" fill="#7fa8c9"/><rect x="59" y="29" width="1" height="3" fill="#7fa8c9"/><rect x="46" y="19" width="1" height="3" fill="#7fa8c9"/><rect x="31" y="11" width="1" height="3" fill="#7fa8c9"/><rect x="31" y="5" width="1" height="3" fill="#7fa8c9"/><rect x="38" y="33" width="1" height="3" fill="#7fa8c9"/><rect x="63" y="21" width="1" height="3" fill="#7fa8c9"/><rect x="57" y="18" width="1" height="3" fill="#7fa8c9"/><rect x="9" y="7" width="1" height="3" fill="#7fa8c9"/><rect x="53" y="10" width="1" height="3" fill="#7fa8c9"/><rect x="43" y="9" width="1" height="3" fill="#7fa8c9"/><rect x="62" y="26" width="1" height="3" fill="#7fa8c9"/><rect x="5" y="4" width="1" height="3" fill="#7fa8c9"/><rect x="40" y="21" width="1" height="3" fill="#7fa8c9"/><rect x="44" y="31" width="1" height="3" fill="#7fa8c9"/><rect x="58" y="4" width="1" height="3" fill="#7fa8c9"/><rect x="11" y="17" width="1" height="3" fill="#7fa8c9"/><rect x="60" y="4" width="1" height="3" fill="#7fa8c9"/><polygon points="0,40 0,19 5,18 9,21 17,21 23,21 31,20 35,21 42,18 46,20 50,18 54,21 59,21 64,21 64,40" fill="#333e47"/><rect x="0" y="20.0" width="64" height="4.3" fill="#37505e"/><rect x="0" y="24.0" width="64" height="4.3" fill="#2e4552"/><rect x="0" y="28.0" width="64" height="4.3" fill="#263a45"/><rect x="0" y="32.0" width="64" height="4.3" fill="#1d2f39"/><rect x="0" y="36.0" width="64" height="4.3" fill="#15242d"/></svg>'
  },
  {
    id:'amber_dunes',
    name:'Amber Dunes',
    unlock:{type:'total', amount:75},
    svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" width="768" height="480" shape-rendering="crispEdges"><rect width="64" height="40" fill="#000"/><rect x="0" y="0" width="64" height="20" fill="#f2c879"/><rect x="14" y="3" width="6" height="2" fill="#ffe6b3"/><rect x="15" y="2" width="4" height="1" fill="#ffe6b3"/><rect x="24" y="2" width="6" height="2" fill="#ffe6b3"/><rect x="25" y="1" width="4" height="1" fill="#ffe6b3"/><rect x="12" y="6" width="6" height="2" fill="#ffe6b3"/><rect x="13" y="5" width="4" height="1" fill="#ffe6b3"/><circle cx="50" cy="7" r="4" fill="#fff1c1"/><polygon points="0,40 0,20 6,18 11,20 15,21 20,20 28,20 35,21 42,18 49,18 56,20 63,21 64,21 64,40" fill="#a15b34"/><polygon points="0,40 0,23 5,23 10,22 14,22 18,23 25,24 30,24 35,22 40,23 47,23 54,24 60,24 64,23 64,24 64,40" fill="#7c4326"/><rect x="0" y="23.0" width="64" height="3.6999999999999997" fill="#4a6b52"/><rect x="0" y="26.4" width="64" height="3.6999999999999997" fill="#3f5c47"/><rect x="0" y="29.8" width="64" height="3.6999999999999997" fill="#354e3d"/><rect x="0" y="33.2" width="64" height="3.6999999999999997" fill="#2a4032"/><rect x="0" y="36.6" width="64" height="3.6999999999999997" fill="#203228"/></svg>'
  },
  {
    id:'shrimp_dusk',
    name:'Shrimp Cove Dusk',
    unlock:{type:'total', amount:100},
    svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges"><rect width="64" height="40" fill="#000"/><rect x="0" y="0" width="64" height="20" fill="#2b2f6b"/><rect x="0" y="0" width="64" height="10" fill="#ffb98a"/><rect x="0" y="6" width="64" height="6" fill="#ff8f6b"/><circle cx="50" cy="10" r="4" fill="#fff1c1"/><polygon points="0,40 0,20 8,21 14,21 21,18 28,18 33,21 40,21 47,18 55,21 62,19 64,21 64,40" fill="#3a2f52"/><rect x="0" y="20.0" width="64" height="4.3" fill="#2c5f78"/><rect x="0" y="24.0" width="64" height="4.3" fill="#255271"/><rect x="0" y="28.0" width="64" height="4.3" fill="#1f4761"/><rect x="0" y="32.0" width="64" height="4.3" fill="#193d52"/><rect x="0" y="36.0" width="64" height="4.3" fill="#132f40"/></svg>'
  },
  {
    id:'mossy_marsh',
    name:'Mossy Marsh',
    unlock:{type:'total', amount:150},
    svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" width="768" height="480" shape-rendering="crispEdges"><rect width="64" height="40" fill="#000"/><rect x="0" y="0" width="64" height="20" fill="#6a7a4d"/><rect x="6" y="5" width="6" height="2" fill="#8a9a63"/><rect x="7" y="4" width="4" height="1" fill="#8a9a63"/><rect x="44" y="7" width="6" height="2" fill="#8a9a63"/><rect x="45" y="6" width="4" height="1" fill="#8a9a63"/><rect x="41" y="5" width="6" height="2" fill="#8a9a63"/><rect x="42" y="4" width="4" height="1" fill="#8a9a63"/><polygon points="0,40 0,21 8,20 14,19 20,21 27,19 34,18 41,21 47,20 53,19 59,19 64,21 64,40" fill="#3f4d2c"/><rect x="8" y="15" width="1" height="7" fill="#2c3620"/><rect x="22" y="14" width="1" height="8" fill="#2c3620"/><rect x="45" y="15" width="1" height="7" fill="#2c3620"/><rect x="0" y="20.0" width="64" height="4.3" fill="#3d4a2a"/><rect x="0" y="24.0" width="64" height="4.3" fill="#354022"/><rect x="0" y="28.0" width="64" height="4.3" fill="#2c351b"/><rect x="0" y="32.0" width="64" height="4.3" fill="#232a15"/><rect x="0" y="36.0" width="64" height="4.3" fill="#1a1f10"/></svg>'
  },
  {
    id:'golden_palms',
    name:'Golden Palms',
    unlock:{type:'total', amount:225},
    svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" width="768" height="480" shape-rendering="crispEdges"><rect width="64" height="40" fill="#000"/><rect x="0" y="0" width="64" height="20" fill="#f6d17a"/><circle cx="48" cy="7" r="4" fill="#fff1c1"/><polygon points="0,40 0,21 4,19 8,21 13,21 17,19 22,19 28,21 32,20 39,19 45,20 52,20 58,21 63,20 64,21 64,40" fill="#c98a4a"/><rect x="20" y="17" width="1" height="6" fill="#5a3b1e"/><path d="M20.5 17 q-4 -2 -6 -4" stroke="#6e8f3e" stroke-width="1.2" fill="none"/><path d="M20.5 17 q4 -2 6 -4" stroke="#6e8f3e" stroke-width="1.2" fill="none"/><path d="M20.5 17 q0 -3 0 -6" stroke="#6e8f3e" stroke-width="1.2" fill="none"/><rect x="0" y="20.0" width="64" height="4.3" fill="#2f8f8c"/><rect x="0" y="24.0" width="64" height="4.3" fill="#277d7a"/><rect x="0" y="28.0" width="64" height="4.3" fill="#1f6b69"/><rect x="0" y="32.0" width="64" height="4.3" fill="#175958"/><rect x="0" y="36.0" width="64" height="4.3" fill="#104746"/></svg>'
  },
  {
    id:'palm_lagoon',
    name:'Palm Lagoon',
    unlock:{type:'total', amount:325},
    svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" width="768" height="480" shape-rendering="crispEdges"><rect width="64" height="40" fill="#000"/><rect x="0" y="0" width="64" height="20" fill="#7fe0e8"/><rect x="36" y="1" width="6" height="2" fill="#ffffff"/><rect x="37" y="0" width="4" height="1" fill="#ffffff"/><rect x="27" y="4" width="6" height="2" fill="#ffffff"/><rect x="28" y="3" width="4" height="1" fill="#ffffff"/><rect x="36" y="1" width="6" height="2" fill="#ffffff"/><rect x="37" y="0" width="4" height="1" fill="#ffffff"/><circle cx="52" cy="6" r="4" fill="#fff6c8"/><rect x="5" y="17" width="1" height="6" fill="#5a3b1e"/><path d="M5.5 17 q-4 -2 -6 -4" stroke="#2e8b57" stroke-width="1.2" fill="none"/><path d="M5.5 17 q4 -2 6 -4" stroke="#2e8b57" stroke-width="1.2" fill="none"/><path d="M5.5 17 q0 -3 0 -6" stroke="#2e8b57" stroke-width="1.2" fill="none"/><rect x="56" y="15" width="1" height="6" fill="#5a3b1e"/><path d="M56.5 15 q-4 -2 -6 -4" stroke="#2e8b57" stroke-width="1.2" fill="none"/><path d="M56.5 15 q4 -2 6 -4" stroke="#2e8b57" stroke-width="1.2" fill="none"/><path d="M56.5 15 q0 -3 0 -6" stroke="#2e8b57" stroke-width="1.2" fill="none"/><polygon points="0,40 0,19 4,20 11,19 15,21 22,20 28,19 33,21 41,20 47,21 52,19 58,21 64,21 64,40" fill="#3d8f6a"/><rect x="0" y="20.0" width="64" height="4.3" fill="#20b6c4"/><rect x="0" y="24.0" width="64" height="4.3" fill="#18a2b1"/><rect x="0" y="28.0" width="64" height="4.3" fill="#128d9c"/><rect x="0" y="32.0" width="64" height="4.3" fill="#0d7887"/><rect x="0" y="36.0" width="64" height="4.3" fill="#086372"/></svg>'
  },
  {
    id:'blossom_shore',
    name:'Blossom Shore',
    unlock:{type:'total', amount:450},
    svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" width="768" height="480" shape-rendering="crispEdges"><rect width="64" height="40" fill="#000"/><rect x="0" y="0" width="64" height="20" fill="#bfe3f0"/><rect x="23" y="4" width="6" height="2" fill="#ffffff"/><rect x="24" y="3" width="4" height="1" fill="#ffffff"/><rect x="30" y="3" width="6" height="2" fill="#ffffff"/><rect x="31" y="2" width="4" height="1" fill="#ffffff"/><rect x="26" y="2" width="6" height="2" fill="#ffffff"/><rect x="27" y="1" width="4" height="1" fill="#ffffff"/><polygon points="0,40 0,20 7,20 13,20 18,20 22,20 28,21 33,21 39,20 45,19 50,19 58,20 62,21 64,21 64,40" fill="#7d8f9e"/><rect x="6" y="13" width="1" height="8" fill="#5a3b2e"/><rect x="2" y="10" width="9" height="4" fill="#f6b8cf"/><rect x="53" y="12" width="1" height="9" fill="#5a3b2e"/><rect x="49" y="9" width="9" height="4" fill="#f6b8cf"/><rect x="0" y="20.0" width="64" height="4.3" fill="#4090ad"/><rect x="0" y="24.0" width="64" height="4.3" fill="#367e99"/><rect x="0" y="28.0" width="64" height="4.3" fill="#2d6c85"/><rect x="0" y="32.0" width="64" height="4.3" fill="#245a71"/><rect x="0" y="36.0" width="64" height="4.3" fill="#1b485d"/></svg>'
  },
  {
    id:'amber_sunrise',
    name:'Amber Sunrise',
    unlock:{type:'total', amount:600},
    svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" width="768" height="480" shape-rendering="crispEdges"><rect width="64" height="40" fill="#000"/><rect x="0" y="0" width="64" height="20" fill="#ffdca0"/><rect x="0" y="8" width="64" height="12" fill="#ffb15c"/><circle cx="32" cy="13" r="6" fill="#fff3c4"/><polygon points="0,40 0,21 8,21 16,20 23,19 31,19 39,20 47,19 51,19 58,19 64,21 64,21 64,40" fill="#c97a3a"/><path d="M47 3 l2 -2 l2 2 l2 -2 l2 2" stroke="#3a2412" stroke-width="0.5" fill="none"/><path d="M54 7 l2 -2 l2 2 l2 -2 l2 2" stroke="#3a2412" stroke-width="0.5" fill="none"/><path d="M11 7 l2 -2 l2 2 l2 -2 l2 2" stroke="#3a2412" stroke-width="0.5" fill="none"/><rect x="0" y="20.0" width="64" height="4.3" fill="#e8934f"/><rect x="0" y="24.0" width="64" height="4.3" fill="#d67f42"/><rect x="0" y="28.0" width="64" height="4.3" fill="#c26c37"/><rect x="0" y="32.0" width="64" height="4.3" fill="#a9592d"/><rect x="0" y="36.0" width="64" height="4.3" fill="#8c4624"/></svg>'
  },
  {
    id:'twilight_cove',
    name:'Twilight Cove',
    unlock:{type:'total', amount:800},
    svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" width="768" height="480" shape-rendering="crispEdges"><rect width="64" height="40" fill="#000"/><rect x="0" y="0" width="64" height="22" fill="#3b1f5c"/><rect x="0" y="4" width="64" height="10" fill="#a13d6b"/><rect x="0" y="10" width="64" height="8" fill="#e2703f"/><circle cx="46" cy="16" r="5" fill="#ffd873"/><polygon points="0,40 0,21 8,21 14,19 22,22 30,22 37,20 45,21 50,19 58,19 64,22 64,40" fill="#2a1a33"/><rect x="0" y="21.0" width="64" height="4.1" fill="#7a3550"/><rect x="0" y="24.8" width="64" height="4.1" fill="#63304a"/><rect x="0" y="28.6" width="64" height="4.1" fill="#4d2a45"/><rect x="0" y="32.4" width="64" height="4.1" fill="#37243f"/><rect x="0" y="36.2" width="64" height="4.1" fill="#211d39"/></svg>'
  },
  {
    id:'starlit_bay',
    name:'Starlit Bay',
    unlock:{type:'total', amount:1050},
    svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" width="768" height="480" shape-rendering="crispEdges"><rect width="64" height="40" fill="#000"/><rect x="0" y="0" width="64" height="22" fill="#0b1030"/><rect x="30" y="4" width="1" height="1" fill="#ffffff"/><rect x="13" y="11" width="1" height="1" fill="#ffffff"/><rect x="50" y="7" width="1" height="1" fill="#ffffff"/><rect x="19" y="1" width="1" height="1" fill="#ffffff"/><rect x="8" y="0" width="1" height="1" fill="#ffffff"/><rect x="51" y="8" width="1" height="1" fill="#ffffff"/><rect x="37" y="12" width="1" height="1" fill="#ffffff"/><rect x="7" y="3" width="1" height="1" fill="#ffffff"/><rect x="46" y="4" width="1" height="1" fill="#ffffff"/><rect x="22" y="1" width="1" height="1" fill="#ffffff"/><rect x="33" y="3" width="1" height="1" fill="#ffffff"/><rect x="3" y="10" width="1" height="1" fill="#ffffff"/><rect x="33" y="12" width="1" height="1" fill="#ffffff"/><rect x="34" y="3" width="1" height="1" fill="#ffffff"/><rect x="21" y="4" width="1" height="1" fill="#ffffff"/><rect x="37" y="10" width="1" height="1" fill="#ffffff"/><rect x="47" y="1" width="1" height="1" fill="#ffffff"/><rect x="43" y="10" width="1" height="1" fill="#ffffff"/><rect x="49" y="8" width="1" height="1" fill="#ffffff"/><rect x="31" y="2" width="1" height="1" fill="#ffffff"/><rect x="31" y="7" width="1" height="1" fill="#ffffff"/><rect x="35" y="1" width="1" height="1" fill="#ffffff"/><rect x="38" y="0" width="1" height="1" fill="#ffffff"/><rect x="37" y="9" width="1" height="1" fill="#ffffff"/><rect x="39" y="12" width="1" height="1" fill="#ffffff"/><rect x="24" y="6" width="1" height="1" fill="#ffffff"/><rect x="54" y="9" width="1" height="1" fill="#ffffff"/><rect x="36" y="6" width="1" height="1" fill="#ffffff"/><circle cx="14" cy="7" r="4" fill="#eef0d8"/><polygon points="0,40 0,21 6,22 13,19 18,22 22,22 29,18 35,22 40,18 48,20 54,21 58,20 63,22 64,22 64,40" fill="#05070f"/><rect x="0" y="21.0" width="64" height="4.1" fill="#0d1e3a"/><rect x="0" y="24.8" width="64" height="4.1" fill="#0a1830"/><rect x="0" y="28.6" width="64" height="4.1" fill="#081326"/><rect x="0" y="32.4" width="64" height="4.1" fill="#060f1e"/><rect x="0" y="36.2" width="64" height="4.1" fill="#040a16"/></svg>'
  },
  {
    id:'moonlit_peak',
    name:'Moonlit Peak',
    unlock:{type:'total', amount:1350},
    svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" width="768" height="480" shape-rendering="crispEdges"><rect width="64" height="40" fill="#000"/><rect x="0" y="0" width="64" height="22" fill="#171a24"/><rect x="39" y="5" width="6" height="2" fill="#2a2e3a"/><rect x="40" y="4" width="4" height="1" fill="#2a2e3a"/><rect x="47" y="6" width="6" height="2" fill="#2a2e3a"/><rect x="48" y="5" width="4" height="1" fill="#2a2e3a"/><rect x="50" y="1" width="6" height="2" fill="#2a2e3a"/><rect x="51" y="0" width="4" height="1" fill="#2a2e3a"/><rect x="53" y="8" width="6" height="2" fill="#2a2e3a"/><rect x="54" y="7" width="4" height="1" fill="#2a2e3a"/><rect x="49" y="4" width="6" height="2" fill="#2a2e3a"/><rect x="50" y="3" width="4" height="1" fill="#2a2e3a"/><rect x="41" y="1" width="6" height="2" fill="#2a2e3a"/><rect x="42" y="0" width="4" height="1" fill="#2a2e3a"/><polygon points="34,2 32,12 36,12 30,22" fill="#ffe98a"/><polygon points="0,40 0,18 6,17 12,17 20,22 27,21 31,21 35,20 42,21 49,18 53,18 58,22 63,19 64,22 64,40" fill="#0d0f16"/><rect x="0" y="21.0" width="64" height="4.1" fill="#1b2430"/><rect x="0" y="24.8" width="64" height="4.1" fill="#161d28"/><rect x="0" y="28.6" width="64" height="4.1" fill="#121721"/><rect x="0" y="32.4" width="64" height="4.1" fill="#0d121a"/><rect x="0" y="36.2" width="64" height="4.1" fill="#090d13"/></svg>'
  },
  {
    id:'snowfall_cove',
    name:'Snowfall Cove',
    unlock:{type:'total', amount:1700},
    svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" width="768" height="480" shape-rendering="crispEdges"><rect width="64" height="40" fill="#000"/><rect x="0" y="0" width="64" height="20" fill="#cfe6f0"/><rect x="29" y="6" width="6" height="2" fill="#ffffff"/><rect x="30" y="5" width="4" height="1" fill="#ffffff"/><rect x="17" y="3" width="6" height="2" fill="#ffffff"/><rect x="18" y="2" width="4" height="1" fill="#ffffff"/><rect x="11" y="1" width="6" height="2" fill="#ffffff"/><rect x="12" y="0" width="4" height="1" fill="#ffffff"/><rect x="21" y="8" width="6" height="2" fill="#ffffff"/><rect x="22" y="7" width="4" height="1" fill="#ffffff"/><rect x="59" y="39" width="1" height="1" fill="#ffffff"/><rect x="47" y="17" width="1" height="1" fill="#ffffff"/><rect x="17" y="11" width="1" height="1" fill="#ffffff"/><rect x="0" y="21" width="1" height="1" fill="#ffffff"/><rect x="59" y="38" width="1" height="1" fill="#ffffff"/><rect x="10" y="21" width="1" height="1" fill="#ffffff"/><rect x="5" y="24" width="1" height="1" fill="#ffffff"/><rect x="21" y="28" width="1" height="1" fill="#ffffff"/><rect x="54" y="10" width="1" height="1" fill="#ffffff"/><rect x="21" y="15" width="1" height="1" fill="#ffffff"/><rect x="6" y="7" width="1" height="1" fill="#ffffff"/><rect x="16" y="32" width="1" height="1" fill="#ffffff"/><rect x="8" y="24" width="1" height="1" fill="#ffffff"/><rect x="13" y="18" width="1" height="1" fill="#ffffff"/><rect x="26" y="14" width="1" height="1" fill="#ffffff"/><rect x="53" y="5" width="1" height="1" fill="#ffffff"/><rect x="34" y="13" width="1" height="1" fill="#ffffff"/><rect x="50" y="17" width="1" height="1" fill="#ffffff"/><rect x="43" y="2" width="1" height="1" fill="#ffffff"/><rect x="25" y="0" width="1" height="1" fill="#ffffff"/><rect x="52" y="3" width="1" height="1" fill="#ffffff"/><rect x="48" y="31" width="1" height="1" fill="#ffffff"/><rect x="17" y="1" width="1" height="1" fill="#ffffff"/><rect x="30" y="27" width="1" height="1" fill="#ffffff"/><rect x="14" y="38" width="1" height="1" fill="#ffffff"/><rect x="0" y="7" width="1" height="1" fill="#ffffff"/><rect x="25" y="12" width="1" height="1" fill="#ffffff"/><rect x="42" y="0" width="1" height="1" fill="#ffffff"/><rect x="10" y="8" width="1" height="1" fill="#ffffff"/><rect x="2" y="32" width="1" height="1" fill="#ffffff"/><polygon points="0,40 0,19 8,19 14,20 19,18 23,19 31,19 39,20 45,18 53,18 57,18 64,20 64,20 64,40" fill="#e7f1f5"/><polygon points="0,40 0,22 7,23 15,23 20,23 25,23 31,21 38,21 46,23 54,22 59,22 64,23 64,40" fill="#c7d9e0"/><rect x="0" y="22.0" width="64" height="3.9" fill="#3f6d80"/><rect x="0" y="25.6" width="64" height="3.9" fill="#365f70"/><rect x="0" y="29.2" width="64" height="3.9" fill="#2d5162"/><rect x="0" y="32.8" width="64" height="3.9" fill="#254354"/><rect x="0" y="36.4" width="64" height="3.9" fill="#1c3546"/></svg>'
  },
  {
    id:'glacier_inlet',
    name:'Glacier Inlet',
    unlock:{type:'total', amount:2100},
    svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" width="768" height="480" shape-rendering="crispEdges"><rect width="64" height="40" fill="#000"/><rect x="0" y="0" width="64" height="20" fill="#dff2f7"/><rect x="30" y="3" width="6" height="2" fill="#ffffff"/><rect x="31" y="2" width="4" height="1" fill="#ffffff"/><rect x="42" y="5" width="6" height="2" fill="#ffffff"/><rect x="43" y="4" width="4" height="1" fill="#ffffff"/><rect x="42" y="3" width="6" height="2" fill="#ffffff"/><rect x="43" y="2" width="4" height="1" fill="#ffffff"/><circle cx="46" cy="7" r="3" fill="#fffef2"/><polygon points="0,40 0,19 6,18 14,18 20,20 27,20 33,19 39,18 46,18 54,20 62,20 64,20 64,40" fill="#f4fbfc"/><rect x="0" y="19.0" width="64" height="4.5" fill="#2e6f86"/><rect x="0" y="23.2" width="64" height="4.5" fill="#276176"/><rect x="0" y="27.4" width="64" height="4.5" fill="#215366"/><rect x="0" y="31.6" width="64" height="4.5" fill="#1a4556"/><rect x="0" y="35.8" width="64" height="4.5" fill="#143746"/><rect x="10" y="16" width="7" height="5" fill="#eafcff"/><rect x="13" y="12" width="3" height="4" fill="#eafcff"/><rect x="40" y="17" width="9" height="4" fill="#eafcff"/><rect x="44" y="13" width="4" height="4" fill="#eafcff"/></svg>'
  },
  {
    id:'volcanic_horizon',
    name:'Volcanic Horizon',
    unlock:{type:'total', amount:2600},
    svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" width="768" height="480" shape-rendering="crispEdges"><rect width="64" height="40" fill="#000"/><rect x="0" y="0" width="64" height="20" fill="#3a1610"/><rect x="0" y="6" width="64" height="10" fill="#7a2411"/><rect x="0" y="12" width="64" height="8" fill="#c1490f"/><polygon points="20,22 30,4 40,22" fill="#241012"/><circle cx="30" cy="6" r="1.5" fill="#ffdd66"/><polygon points="0,40 0,19 8,19 15,18 23,21 28,18 35,18 40,22 47,20 52,22 60,22 64,22 64,40" fill="#1c0d0d"/><rect x="0" y="21.0" width="64" height="4.1" fill="#5c1e12"/><rect x="0" y="24.8" width="64" height="4.1" fill="#4a180f"/><rect x="0" y="28.6" width="64" height="4.1" fill="#39120c"/><rect x="0" y="32.4" width="64" height="4.1" fill="#280d08"/><rect x="0" y="36.2" width="64" height="4.1" fill="#170705"/></svg>'
  },
  {
    id:'coral_garden',
    name:'Coral Garden',
    unlock:{type:'total', amount:3200},
    svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" width="768" height="480" shape-rendering="crispEdges"><rect width="64" height="40" fill="#000"/><rect x="0" y="0" width="64" height="14" fill="#8fe3ea"/><rect x="0" y="14.0" width="64" height="4.63" fill="#3fc4c9"/><rect x="0" y="18.33" width="64" height="4.63" fill="#33aab0"/><rect x="0" y="22.67" width="64" height="4.63" fill="#289096"/><rect x="0" y="27.0" width="64" height="4.63" fill="#1d767c"/><rect x="0" y="31.33" width="64" height="4.63" fill="#125c62"/><rect x="0" y="35.67" width="64" height="4.63" fill="#0a4448"/><rect x="14" y="30" width="2" height="6" fill="#ff6f61"/><rect x="30" y="32" width="2" height="5" fill="#ffb347"/><rect x="44" y="29" width="2" height="7" fill="#ff6fa1"/><rect x="20" y="33" width="3" height="3" fill="#7fffd4"/></svg>'
  },
  {
    id:'aurora_waters',
    name:'Aurora Waters',
    unlock:{type:'total', amount:4000},
    svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" width="768" height="480" shape-rendering="crispEdges"><rect width="64" height="40" fill="#000"/><rect x="0" y="0" width="64" height="22" fill="#0a1226"/><rect x="23" y="1" width="1" height="1" fill="#ffffff"/><rect x="57" y="5" width="1" height="1" fill="#ffffff"/><rect x="30" y="3" width="1" height="1" fill="#ffffff"/><rect x="62" y="10" width="1" height="1" fill="#ffffff"/><rect x="63" y="2" width="1" height="1" fill="#ffffff"/><rect x="61" y="4" width="1" height="1" fill="#ffffff"/><rect x="58" y="4" width="1" height="1" fill="#ffffff"/><rect x="25" y="4" width="1" height="1" fill="#ffffff"/><rect x="15" y="5" width="1" height="1" fill="#ffffff"/><rect x="22" y="12" width="1" height="1" fill="#ffffff"/><rect x="30" y="2" width="1" height="1" fill="#ffffff"/><rect x="30" y="3" width="1" height="1" fill="#ffffff"/><rect x="46" y="9" width="1" height="1" fill="#ffffff"/><rect x="25" y="12" width="1" height="1" fill="#ffffff"/><rect x="63" y="3" width="1" height="1" fill="#ffffff"/><rect x="38" y="4" width="1" height="1" fill="#ffffff"/><rect x="0" y="5" width="1" height="1" fill="#ffffff"/><rect x="51" y="3" width="1" height="1" fill="#ffffff"/><rect x="51" y="8" width="1" height="1" fill="#ffffff"/><rect x="44" y="9" width="1" height="1" fill="#ffffff"/><polygon points="0,3 0,2.0 6,3.5 12,2.5 18,2.1 24,3.0 30,3.0 36,2.9 42,2.9 48,2.3 54,2.3 60,3.6 64,6 0,6" fill="#4be3a0" opacity="0.55"/><polygon points="0,5 0,4.5 6,5.5 12,5.9 18,6.1 24,6.3 30,4.2 36,4.2 42,5.7 48,5.2 54,4.1 60,5.5 64,8 0,8" fill="#5ecbe6" opacity="0.55"/><polygon points="0,7 0,8.1 6,8.0 12,6.1 18,6.4 24,5.5 30,8.4 36,6.2 42,7.7 48,7.1 54,7.3 60,7.1 64,10 0,10" fill="#9a6fe0" opacity="0.55"/><polygon points="0,40 0,21 4,19 10,21 15,19 22,21 29,20 36,20 41,20 45,20 53,21 58,21 63,21 64,22 64,40" fill="#050810"/><rect x="0" y="21.0" width="64" height="4.1" fill="#132b3f"/><rect x="0" y="24.8" width="64" height="4.1" fill="#0f2233"/><rect x="0" y="28.6" width="64" height="4.1" fill="#0b1a28"/><rect x="0" y="32.4" width="64" height="4.1" fill="#07131e"/><rect x="0" y="36.2" width="64" height="4.1" fill="#040d15"/></svg>'
  },
  {
    id:'midnight_depths',
    name:'Midnight Depths',
    unlock:{type:'total', amount:5000},
    svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" width="768" height="480" shape-rendering="crispEdges"><rect width="64" height="40" fill="#000"/><rect x="0" y="0" width="64" height="10" fill="#06283a"/><rect x="0" y="0.0" width="64" height="6.97" fill="#06283a"/><rect x="0" y="6.67" width="64" height="6.97" fill="#052236"/><rect x="0" y="13.33" width="64" height="6.97" fill="#041c30"/><rect x="0" y="20.0" width="64" height="6.97" fill="#03162a"/><rect x="0" y="26.67" width="64" height="6.97" fill="#021022"/><rect x="0" y="33.33" width="64" height="6.97" fill="#010b1a"/><rect x="33" y="4" width="1" height="1" fill="#7fe9ff"/><rect x="23" y="10" width="1" height="1" fill="#7fe9ff"/><rect x="29" y="10" width="1" height="1" fill="#7fe9ff"/><rect x="18" y="3" width="1" height="1" fill="#7fe9ff"/><rect x="23" y="2" width="1" height="1" fill="#7fe9ff"/><rect x="9" y="8" width="1" height="1" fill="#7fe9ff"/><rect x="27" y="11" width="1" height="1" fill="#7fe9ff"/><rect x="37" y="0" width="1" height="1" fill="#7fe9ff"/><rect x="55" y="2" width="1" height="1" fill="#7fe9ff"/><rect x="1" y="4" width="1" height="1" fill="#7fe9ff"/><rect x="18" y="1" width="1" height="1" fill="#7fe9ff"/><rect x="33" y="7" width="1" height="1" fill="#7fe9ff"/><rect x="55" y="2" width="1" height="1" fill="#7fe9ff"/><rect x="32" y="5" width="1" height="1" fill="#7fe9ff"/></svg>'
  }
];
export function backgroundById(id){ for(var i=0;i<BACKGROUNDS.length;i++){ if(BACKGROUNDS[i].id===id) return BACKGROUNDS[i]; } return BACKGROUNDS[0]; }
export function isBackgroundUnlocked(bg){
  if(!bg || !bg.unlock) return true;
  if(bg.unlock.type === 'total') return totalFishCaught() >= bg.unlock.amount;
  if(bg.unlock.type === 'catch') return (state.caught[bg.unlock.fishId] || 0) >= bg.unlock.amount;
  return false;
}
