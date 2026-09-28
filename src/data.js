// ---------------------------------------------------------------------------
// data.js — Static game data: XP curve, fish, bait, gear, cosmetics, quality
// tiers, collection log entries, challenges. Pure data + pure lookup helpers,
// no dependency on the mutable `state` object.
// ---------------------------------------------------------------------------
// ---------- OSRS-style XP curve ----------


import { playerLevel, totalFishCaught } from './game.js';
import { fishDisplayEmoji, state } from './state.js';

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
  {id:'hat_gold_beanie', name:'Golden Beanie', color:'#D9A441', icon:'🎩', cost:800},
  // Achievement-unlocked, not bought: catch 5,000 shrimp and it's free to
  // claim from the Customize tab (see achievementProgress()/customizeTile(),
  // screens.js, which reads unlockFishId+unlockCount instead of cost for
  // any item that has them). `pixels` is the player's own hand-drawn design
  // (pixelartcss.com, on the 24x24 avatar grid), extracted from their
  // exported PNG the same way as the Shrimp-shell Cap attempt earlier --
  // painted on top of the generic hat-shape logic in pixelAvatarHTML(),
  // render.js, instead of it, whenever this hat is equipped.
  {id:'hat_shrimp_crown', name:'Shrimp Head', color:'#F9104D', icon:'🦐', cost:0, unlockFishId:'shrimp', unlockCount:5000, pixels:[[8,0,'#F9104D'],[9,0,'#F9104D'],[10,0,'#F9104D'],[11,0,'#F9104D'],[12,0,'#DE063E'],[13,1,'#F9104D'],[7,2,'#F9104D'],[8,2,'#F9104D'],[9,2,'#DE063E'],[10,2,'#F9104D'],[11,2,'#F9104D'],[14,2,'#F9104D'],[8,3,'transparent'],[9,3,'transparent'],[10,3,'transparent'],[11,3,'transparent'],[12,3,'#F9104D'],[13,3,'transparent'],[14,3,'#F9104D'],[15,3,'transparent'],[8,4,'#DE063E'],[9,4,'#DE063E'],[10,4,'#DE063E'],[11,4,'#F9104D'],[12,4,'#F9104D'],[13,4,'#F9104D'],[14,4,'#F9104D'],[15,4,'#F9104D'],[16,4,'#F9104D'],[17,4,'#F9104D'],[7,5,'#DE063E'],[8,5,'#DE063E'],[9,5,'#FF0043'],[10,5,'#FF0043'],[11,5,'#FF0043'],[12,5,'#FF0043'],[13,5,'#000000'],[14,5,'#000000'],[15,5,'#FF0043'],[16,5,'#FF0043'],[17,5,'#DE063E'],[18,5,'#F9104D'],[19,5,'#F9104D'],[20,5,'#DE063E'],[7,6,'#DE063E'],[8,6,'#FF0043'],[9,6,'#FF0043'],[10,6,'#DE063E'],[11,6,'#FF0043'],[12,6,'#FF0043'],[13,6,'#000000'],[14,6,'#000000'],[15,6,'#FF0043'],[16,6,'#FF0043'],[17,6,'#FF0043'],[18,6,'#FF0043'],[19,6,'#FF0043'],[20,6,'#F9104D'],[21,6,'#F9104D'],[22,6,'#F9104D'],[23,6,'#DE063E'],[7,7,'#DE063E'],[8,7,'#FF0043'],[9,7,'#DE063E'],[10,7,'#FF0043'],[11,7,'#FF0043'],[12,7,'#FF0043'],[13,7,'#FF0043'],[14,7,'#FF0043'],[15,7,'#FF0043'],[16,7,'#FF0043'],[17,7,'#FF0043'],[18,7,'#DE063E'],[19,7,'#DE063E'],[20,7,'#DE063E'],[21,7,'#DE063E'],[22,7,'#AC002D'],[7,8,'#DE063E'],[8,8,'#FF0043'],[9,8,'#DE063E'],[10,8,'#FF0043'],[11,8,'#FF0043'],[12,8,'#FF0043'],[13,8,'#DE063E'],[14,8,'#FF0043'],[15,8,'#FF0043'],[16,8,'#DE063E'],[17,8,'#DE063E'],[18,8,'#DE063E'],[7,9,'#DE063E'],[8,9,'#FF0043'],[9,9,'#FF0043'],[10,9,'#DE063E'],[11,9,'#FF0043'],[12,9,'#FF0043'],[13,9,'#FF0043'],[14,9,'#FF0043'],[15,9,'#DE063E'],[8,10,'#DE063E'],[9,10,'#FF0043'],[10,10,'#FF0043'],[11,10,'#FF0043'],[12,10,'#DE063E'],[13,10,'#FF0043'],[14,10,'#FF0043'],[15,10,'#DE063E'],[8,11,'#DE063E'],[9,11,'#FF0043'],[10,11,'#FF0043'],[11,11,'#FF0043'],[12,11,'#FF0043'],[13,11,'#FF0043'],[14,11,'#DE063E'],[15,11,'#DE063E']]}
];
export var CUSTOM_POLES = [
  {id:'pole_brown', name:'Weathered Wood Pole', color:'#7A5A38', cost:0},
  {id:'pole_red', name:'Redline Pole', color:'#C94D4D', cost:150},
  {id:'pole_blue', name:'Bluewater Pole', color:'#3E78B5', cost:250},
  {id:'pole_teal', name:'Tideglass Pole', color:'#2C9B92', cost:400},
  {id:'pole_purple', name:'Deep Purple Pole', color:'#8058A8', cost:600},
  {id:'pole_white', name:'Moonlit Pole', color:'#D7DDE4', cost:850},
  {id:'pole_gold', name:'Gilded Pole', color:'#D9A441', cost:1200},
  {id:'pole_obsidian', name:'Obsidian Pole', color:'#252B33', cost:1800},
  // The prestige cosmetic: a flat hex can't carry the shifting iridescent
  // look on its own, so `color` here is just a safe fallback (in case
  // anything ever reads it expecting a plain color) -- the real look is a
  // slow-cycling black/purple/blue/teal gradient driven entirely by CSS
  // (.pole-celestial, style.css), applied instead of the inline color
  // whenever celestial:true (see customizeTile(), screens.js, and
  // renderPlayer(), render.js).
  {id:'pole_celestial', name:'Celestial Rod', color:'#1a0e3a', cost:16500000, celestial:true}
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
// eligible to equip. Many still have no bonus (no stat field set), ready
// for effects to be added later.
export var COLLECTION_LOG_ITEMS = [
  {id:'old_boot', fishId:'shrimp', name:'Old Boot', icon:'👢', chance:0.0002, flavor:"Somebody's lost boot, waterlogged and sad. Weirdly comfortable once it's broken in, though -- worn-in soles make casting a little quicker.", trinket:true, speedBonus:0.1},
  // Used to carry mythicLuckBonus (a flat boost to unique/mythic drop chance)
  // -- moved off to make room for a future clothing set to own that stat
  // instead. Now stacks with the Anchovy outfit's own luckBonus, the same
  // way every other species' unique stacks with its clothing set.
  {id:'silver_ring', fishId:'anchovies', name:'Silver Ring', icon:'💍', chance:0.0002, flavor:'Tarnished, but still shines under the dock lights.', trinket:true, luckBonus:0.15},
  {id:'tin_can', fishId:'perch', name:'Rusty Tin Can', icon:'🥫', chance:0.0002, flavor:"Someone's lunch, decades ago.", trinket:true, sellBonus:0.25},
  {id:'broken_watch', fishId:'bluegill', name:'Broken Watch', icon:'⌚', chance:0.0002, flavor:'Stopped at a time nobody remembers.', trinket:true, xpBonus:0.1},
  {id:'bottle_message', fishId:'carp', name:'Message in a Bottle', icon:'🍾', chance:0.0002, flavor:'The ink has run, but something was written here.', trinket:true, proficiencyBonus:1},
  {id:'lost_lure', fishId:'trout', name:'Lost Lure', icon:'🪝', chance:0.0002, flavor:"Another angler's bad luck, sitting on the bottom -- something's still hooked to it.", trinket:true, doubleCatchBonus:0.2},
  {id:'old_key', fishId:'catfish', name:'Rusted Key', icon:'🗝️', chance:0.0002, flavor:'No telling what it used to open. Whatever it is, it wants to be found.', trinket:true, bigOneLuckBonus:0.4},
  {id:'small_pearl', fishId:'crab', name:'Small Pearl', icon:'🫧', chance:0.0002, flavor:'Smooth and pale, tucked in the mud. Feels like it was waiting for something rarer.', trinket:true, mythicLuckBonus:0.35},
  // Used to carry speedBonus (+25% fishing speed) -- moved off to give the
  // Lobster set a dedicated unique-luck identity to match; every other
  // species' unique also carries that species' own clothing-set stat.
  {id:'lobster_claw', fishId:'lobster', name:'Carved Lobster Claw', icon:'🦞', chance:0.0002, flavor:'A strange keepsake from an old fishing boat. It seems to draw out one-of-a-kind things.', trinket:true, uniqueLuckBonus:0.35},
  {id:'bass_lure', fishId:'bass', name:'Vintage Bass Lure', icon:'🪝', chance:0.0002, flavor:'Paint chipped, hooks dulled, story unknown.', trinket:true, noBaitChance:0.5},
  {id:'sturgeon_tag', fishId:'sturgeon', name:'Old Sturgeon Tag', icon:'🏷️', chance:0.0002, flavor:'A faded research tag from years ago.', trinket:true},
  {id:'koi_coin', fishId:'koi', name:'Koi Collector Coin', icon:'🪙', chance:0.0002, flavor:'A polished token stamped with a koi.', trinket:true},
  {id:'squid_ink', fishId:'squid', name:'Ink Vial', icon:'🧪', chance:0.0002, flavor:'Dark ink sealed in an old glass vial.', trinket:true},
  {id:'octopus_charm', fishId:'octopus', name:'Octopus Charm', icon:'🧿', chance:0.0002, flavor:'Eight tiny arms carved into a weathered charm.', trinket:true},
  {id:'eel_scale', fishId:'eel', name:'Eel Scale Charm', icon:'🧿', chance:0.0002, flavor:'A strange charm worn smooth by years underwater.', trinket:true},
  {id:'captains_compass', fishId:'marlin', name:"Captain's Compass", icon:'🧭', chance:0.0002, flavor:'Still points somewhere. Just maybe not north.', trinket:true, speedBonus:0.25},
  {id:'dragonfang', fishId:'dragonfish', name:'Dragonfang Fragment', icon:'🦷', chance:0.0002, flavor:'A tiny fragment from something that should not be this deep.', trinket:true},
  {id:'megalodon_tooth', fishId:'megalodon', name:'Megalodon Tooth', icon:'🦷', chance:0.0002, flavor:'A huge fossilized tooth from an ancient predator.', trinket:true},
  {id:'leviathan_scale', fishId:'leviathan', name:'Leviathan Scale', icon:'🪽', chance:0.0002, flavor:"Bigger than your hand. You don't want to know what shed it.", trinket:true},
  // Not tied to any single species (fishId:null) -- every cast, from any
  // fish, gets a shot at this one. logItemForFish() only ever matches by an
  // exact fishId string, so a null fishId here can never collide with a
  // per-species lookup; universalLogItems() below is how grantFish() finds
  // it instead. While equipped, every catch is forced to 5-star/Legendary
  // (see the forceLegendary check in rollQuality(), state.js).
  {id:'dev_luck', fishId:null, universal:true, name:'Dev Luck Tablet', icon:'📱', chance:0.0000001, trinket:true, forceLegendary:true, flavor:'1 in 10,000,000. How did you catch this?'},
  // The Golden Treasure Chest: rolls like Dev Luck above (universal, any
  // catch), but doesn't grant a bonus by itself -- owning it lets the player
  // open it from the Collection Log for a chance at one of the 10
  // chestReward items below (see openGoldenChest(), game.js). chestGroup
  // marks the chest and every one of its rewards so the Log UI can bucket
  // them together as their own card instead of "Universal".
  {id:'golden_chest', fishId:null, universal:true, chestGroup:true, rareLabel:'Treasure found! ', name:'Golden Treasure Chest', icon:'🎁', chance:0.0001, flavor:'Heavier than it should be, and it will not stop rattling. Open it from the Collection Log for a shot at what is inside.'},
  // Five of the chest's ten possible rewards are trinkets (the other five
  // are clothing pieces -- see the MYTHIC_LOG_ITEMS push below, since
  // clothingItems() only reads from that array). chestReward:true marks all
  // ten as "not directly catchable" -- no chance field, and skipped by the
  // normal per-catch/universal rolls entirely. No gameplay bonuses on any of
  // them yet; they're cosmetic flexes for now, easy to add bonuses to later.
  {id:'golden_rod', fishId:null, chestGroup:true, chestReward:true, trinket:true, name:'Gilded Rod', icon:'🎣', flavor:'Too fancy to actually cast with. You cast with it anyway.'},
  {id:'golden_net', fishId:null, chestGroup:true, chestReward:true, trinket:true, name:'Gilded Net', icon:'🥅', flavor:'Gold-plated mesh. Somehow still catches fish.'},
  {id:'golden_watch', fishId:null, chestGroup:true, chestReward:true, trinket:true, name:'Gold Watch', icon:'⌚', flavor:'Keeps perfect time. You still lose track of the hours out here.'},
  {id:'golden_necklace', fishId:null, chestGroup:true, chestReward:true, trinket:true, name:'Gold Necklace', icon:'📿', flavor:'A little much for the dock, honestly. Wear it anyway.'},
  {id:'golden_underwear', fishId:null, chestGroup:true, chestReward:true, trinket:true, name:'Golden Underwear', icon:'🩲', flavor:'Somehow the rarest thing in the whole chest. No further questions.'}
];
// Trinkets aren't tied to a body slot like clothing — any owned trinket can
// fill any of the equipped slots, up to TRINKET_SLOTS at once.
export var TRINKET_SLOTS = 3;
export function trinketItems(){ return COLLECTION_LOG_ITEMS.filter(function(item){ return !!item.trinket; }); }
export function trinketById(id){ return trinketItems().filter(function(item){ return item.id===id; })[0] || null; }
// Collection-log items that can drop from ANY catch instead of one species
// (currently just the Dev Luck Tablet) -- rolled separately in grantFish()
// since logItemForFish()/mythicLogItemsForFish() both look items up by a
// specific fishId.
export function universalLogItems(){ return COLLECTION_LOG_ITEMS.filter(function(item){ return !!item.universal; }); }
var MYTHIC_LOG_ITEMS = [];
export var CLOTHING_SLOTS = ['hat','shirt','pants','shoes','gloves'];
// Fish ids in this list get 5 named, wearable mythic pieces (one per slot in
// CLOTHING_SLOTS) instead of the generic "Mythic 1-5" flavor items below.
// Each piece carries its own bonus field, so different outfits can
// specialize in different things:
//   speedBonus -- reduces cast time (totalClothingSpeedBonus()/castDurationMs(), game.js)
//   luckBonus -- nudges the quality roll toward better catches (totalClothingLuckBonus()/rollQuality(), state.js)
//   sellBonus -- increases coins earned per sale (totalClothingSellBonus()/sellPrice(), state.js)
//   xpBonus -- increases fishing XP per catch (totalClothingXpBonus()/grantFish(), game.js)
//   proficiencyBonus -- multiplies how much each catch counts toward that
//     species' proficiency level (totalClothingProficiencyBonus()/grantFish(),
//     game.js) -- a flat multiplier on the catch count, not on XP, so it
//     reduces the total catches needed to hit proficiency Lv 99 by
//     x/(1+x), not by x itself (e.g. a 25% bonus cuts the 5,000-catch
//     grind to 4,000 -- a real 20% fewer fish).
//   doubleCatchBonus -- flat chance for a completed cast to land a second,
//     fully independent fish on top of the first (totalClothingDoubleCatchBonus()/
//     the cast-completion handler, game.js) -- own quality roll, own shot at
//     collection log/mythic drops, own coins and XP, just presented lighter
//     (no trophy-card prompt even at 4-5 stars, so it can never stack a
//     second decision card on top of the real catch's).
//   bigOneLuckBonus -- relative multiplier on the chance a completed cast
//     turns into a "Big One" minigame encounter instead of resolving
//     normally (totalClothingBigOneLuckBonus()/the Big One roll, game.js).
//     Relative (BIG_ONE_CHANCE * (1+bonus)), not additive, since the base
//     chance is already tiny (1/2000) -- same reasoning as mythicLuckBonus
//     below.
//   mythicLuckBonus -- relative multiplier on the chance of finding a
//     mythic/outfit piece (totalClothingMythicLuckBonus()/grantFish(),
//     game.js). Split off from uniqueLuckBonus below so a set/trinket can
//     specialize in one without touching the other.
//   uniqueLuckBonus -- relative multiplier on the chance of finding that
//     species' own one-of-a-kind collection log item
//     (totalClothingUniqueLuckBonus()/grantFish(), game.js).
// Per-piece magnitude has climbed with each new set so far (2% luck, then 3%
// sell/xp, then 5% proficiency, then 3% double-catch, then 6-8% big
// one/mythic/unique) -- there's no rule that later sets have to match
// earlier ones, they just need to feel like a meaningful step up. Add a
// fish's id here (and a matching entry in CLOTHING_SETS) to extend clothing
// to it.
var CLOTHING_FISH_IDS = ['shrimp', 'anchovies', 'perch', 'bluegill', 'carp', 'trout', 'catfish', 'crab', 'lobster'];
var CLOTHING_SPEED_BONUS_PER_PIECE = 0.04; // 5 pieces => 20% total when a full set is equipped
var CLOTHING_LUCK_BONUS_PER_PIECE = 0.02; // 5 pieces => 10% total when a full set is equipped
var CLOTHING_SELL_BONUS_PER_PIECE = 0.03; // 5 pieces => 15% total when a full set is equipped
var CLOTHING_XP_BONUS_PER_PIECE = 0.06; // 5 pieces => 30% total when a full set is equipped
var CLOTHING_PROFICIENCY_BONUS_PER_PIECE = 0.05; // 5 pieces => 25% total when a full set is equipped
var CLOTHING_DOUBLE_CATCH_BONUS_PER_PIECE = 0.03; // 5 pieces => 15% total when a full set is equipped
var CLOTHING_BIGONE_BONUS_PER_PIECE = 0.1; // 5 pieces => +50% relative Big One chance when a full set is equipped
var CLOTHING_MYTHIC_BONUS_PER_PIECE = 0.08; // 5 pieces => +40% relative mythic-find chance when a full set is equipped
var CLOTHING_UNIQUE_BONUS_PER_PIECE = 0.08; // 5 pieces => +40% relative unique-find chance when a full set is equipped
// A clothing piece can carry a `pixels` array ([x,y,hex] cell overrides on
// the 24x24 avatar grid, painted last in pixelAvatarHTML(), render.js) to
// actually change how the character looks when it's equipped -- otherwise a
// piece is stat-only. Every set below dyes the relevant body region (hat/
// torso+sleeves/legs/feet/hands) to that species' signature color, reusing
// the exact same coordinates the base body art already paints at (see
// buildBaseAvatarGrid(), render.js) -- a uniform "gear dye" look rather than
// bespoke art per piece, since the grid is small enough (a hand is only 2x3
// cells) that a fully illustrated design per piece isn't really legible.
function rectPixels(x,y,w,h,hex){
  var cells=[];
  for(var yy=y;yy<y+h;yy++) for(var xx=x;xx<x+w;xx++) cells.push([xx,yy,hex]);
  return cells;
}
function clothingSlotPixels(slot, hex){
  switch(slot){
    case 'hat': return rectPixels(8,2,8,3,hex).concat(rectPixels(6,4,12,2,hex), rectPixels(16,6,4,1,hex));
    case 'shirt': return rectPixels(6,12,12,7,hex).concat(rectPixels(4,14,2,6,hex), rectPixels(18,14,2,6,hex));
    case 'pants': return rectPixels(7,19,10,3,hex);
    case 'shoes': return rectPixels(7,21,3,3,hex).concat(rectPixels(14,21,3,3,hex));
    case 'gloves': return rectPixels(4,18,2,3,hex).concat(rectPixels(18,18,2,3,hex));
    default: return [];
  }
}
var CLOTHING_SET_COLORS = {
  shrimp: '#F28C6B',
  anchovies: '#9FC7E0',
  perch: '#C9A227',
  bluegill: '#3E7CB1',
  carp: '#8C6A3F',
  trout: '#4FA88C',
  catfish: '#6B5D52',
  crab: '#D9622B',
  lobster: '#A32638'
};
var CLOTHING_SETS = {
  shrimp: [
    {slot:'hat', name:'Shrimp-shell Cap', icon:'🦐', flavor:'A little snug. Smells faintly of brine.', speedBonus:CLOTHING_SPEED_BONUS_PER_PIECE, pixels:clothingSlotPixels('hat', CLOTHING_SET_COLORS.shrimp)},
    {slot:'shirt', name:'Shrimp-scale Vest', icon:'🦐', flavor:'Iridescent plating stitched from countless molts.', speedBonus:CLOTHING_SPEED_BONUS_PER_PIECE, pixels:clothingSlotPixels('shirt', CLOTHING_SET_COLORS.shrimp)},
    {slot:'pants', name:'Shrimp-tail Waders', icon:'🦐', flavor:'Surprisingly flexible for something so armored.', speedBonus:CLOTHING_SPEED_BONUS_PER_PIECE, pixels:clothingSlotPixels('pants', CLOTHING_SET_COLORS.shrimp)},
    {slot:'shoes', name:'Shrimp-foot Boots', icon:'🦐', flavor:'Somehow lets you feel the current through the sole.', speedBonus:CLOTHING_SPEED_BONUS_PER_PIECE, pixels:clothingSlotPixels('shoes', CLOTHING_SET_COLORS.shrimp)},
    {slot:'gloves', name:'Shrimp-claw Gloves', icon:'🦐', flavor:'A firmer grip on the rod than you have ever had.', speedBonus:CLOTHING_SPEED_BONUS_PER_PIECE, pixels:clothingSlotPixels('gloves', CLOTHING_SET_COLORS.shrimp)}
  ],
  anchovies: [
    {slot:'hat', name:'Anchovy-scale Cap', icon:'🐟', flavor:'Catches the light like a tiny disco ball.', luckBonus:CLOTHING_LUCK_BONUS_PER_PIECE, pixels:clothingSlotPixels('hat', CLOTHING_SET_COLORS.anchovies)},
    {slot:'shirt', name:'Anchovy-tin Vest', icon:'🐟', flavor:'Smells faintly of the harbor. Somehow charming.', luckBonus:CLOTHING_LUCK_BONUS_PER_PIECE, pixels:clothingSlotPixels('shirt', CLOTHING_SET_COLORS.anchovies)},
    {slot:'pants', name:'Anchovy-school Trousers', icon:'🐟', flavor:'A shimmer that seems to move on its own.', luckBonus:CLOTHING_LUCK_BONUS_PER_PIECE, pixels:clothingSlotPixels('pants', CLOTHING_SET_COLORS.anchovies)},
    {slot:'shoes', name:'Anchovy-fin Loafers', icon:'🐟', flavor:'Every step smells faintly of the boardwalk.', luckBonus:CLOTHING_LUCK_BONUS_PER_PIECE, pixels:clothingSlotPixels('shoes', CLOTHING_SET_COLORS.anchovies)},
    {slot:'gloves', name:'Anchovy-oil Gloves', icon:'🐟', flavor:'Slippery. Lucky, apparently, not clumsy.', luckBonus:CLOTHING_LUCK_BONUS_PER_PIECE, pixels:clothingSlotPixels('gloves', CLOTHING_SET_COLORS.anchovies)}
  ],
  perch: [
    {slot:'hat', name:'Perch-spine Cap', icon:'🐟', flavor:'Bristly. Looks worse than it feels.', sellBonus:CLOTHING_SELL_BONUS_PER_PIECE, pixels:clothingSlotPixels('hat', CLOTHING_SET_COLORS.perch)},
    {slot:'shirt', name:'Perch-scale Vest', icon:'🐟', flavor:'Catches the light like tiny coins.', sellBonus:CLOTHING_SELL_BONUS_PER_PIECE, pixels:clothingSlotPixels('shirt', CLOTHING_SET_COLORS.perch)},
    {slot:'pants', name:'Perch-fin Waders', icon:'🐟', flavor:'Stiff at first, then somehow perfect.', sellBonus:CLOTHING_SELL_BONUS_PER_PIECE, pixels:clothingSlotPixels('pants', CLOTHING_SET_COLORS.perch)},
    {slot:'shoes', name:'Perch-tail Boots', icon:'🐟', flavor:'A little spring in every step.', sellBonus:CLOTHING_SELL_BONUS_PER_PIECE, pixels:clothingSlotPixels('shoes', CLOTHING_SET_COLORS.perch)},
    {slot:'gloves', name:'Perch-gill Gloves', icon:'🐟', flavor:'Haggling feels easier wearing these. Probably a coincidence.', sellBonus:CLOTHING_SELL_BONUS_PER_PIECE, pixels:clothingSlotPixels('gloves', CLOTHING_SET_COLORS.perch)}
  ],
  bluegill: [
    {slot:'hat', name:'Bluegill-scale Cap', icon:'🐟', flavor:'A faint blue sheen in the right light.', xpBonus:CLOTHING_XP_BONUS_PER_PIECE, pixels:clothingSlotPixels('hat', CLOTHING_SET_COLORS.bluegill)},
    {slot:'shirt', name:'Bluegill-fin Vest', icon:'🐟', flavor:'Lighter than it looks. Easy to move in.', xpBonus:CLOTHING_XP_BONUS_PER_PIECE, pixels:clothingSlotPixels('shirt', CLOTHING_SET_COLORS.bluegill)},
    {slot:'pants', name:'Bluegill-tail Waders', icon:'🐟', flavor:'Every cast feels like it teaches you something.', xpBonus:CLOTHING_XP_BONUS_PER_PIECE, pixels:clothingSlotPixels('pants', CLOTHING_SET_COLORS.bluegill)},
    {slot:'shoes', name:'Bluegill-gill Boots', icon:'🐟', flavor:'You notice more standing in these. Hard to explain.', xpBonus:CLOTHING_XP_BONUS_PER_PIECE, pixels:clothingSlotPixels('shoes', CLOTHING_SET_COLORS.bluegill)},
    {slot:'gloves', name:'Bluegill-spine Gloves', icon:'🐟', flavor:'A sharper feel for the line than you had before.', xpBonus:CLOTHING_XP_BONUS_PER_PIECE, pixels:clothingSlotPixels('gloves', CLOTHING_SET_COLORS.bluegill)}
  ],
  carp: [
    {slot:'hat', name:'Carp-scale Cap', icon:'🐟', flavor:'Heavy on the head. You get used to it.', proficiencyBonus:CLOTHING_PROFICIENCY_BONUS_PER_PIECE, pixels:clothingSlotPixels('hat', CLOTHING_SET_COLORS.carp)},
    {slot:'shirt', name:'Carp-hide Vest', icon:'🐟', flavor:'Thick and stubborn, like the fish it came from.', proficiencyBonus:CLOTHING_PROFICIENCY_BONUS_PER_PIECE, pixels:clothingSlotPixels('shirt', CLOTHING_SET_COLORS.carp)},
    {slot:'pants', name:'Carp-tail Waders', icon:'🐟', flavor:'Built for standing still a very long time.', proficiencyBonus:CLOTHING_PROFICIENCY_BONUS_PER_PIECE, pixels:clothingSlotPixels('pants', CLOTHING_SET_COLORS.carp)},
    {slot:'shoes', name:'Carp-fin Boots', icon:'🐟', flavor:'Planted. You are not going anywhere.', proficiencyBonus:CLOTHING_PROFICIENCY_BONUS_PER_PIECE, pixels:clothingSlotPixels('shoes', CLOTHING_SET_COLORS.carp)},
    {slot:'gloves', name:'Carp-whisker Gloves', icon:'🐟', flavor:'You start noticing things about the water you never did before.', proficiencyBonus:CLOTHING_PROFICIENCY_BONUS_PER_PIECE, pixels:clothingSlotPixels('gloves', CLOTHING_SET_COLORS.carp)}
  ],
  trout: [
    {slot:'hat', name:'Trout-spotted Cap', icon:'🐟', flavor:'You swear you felt two takes on that last cast.', doubleCatchBonus:CLOTHING_DOUBLE_CATCH_BONUS_PER_PIECE, pixels:clothingSlotPixels('hat', CLOTHING_SET_COLORS.trout)},
    {slot:'shirt', name:'Trout-scale Vest', icon:'🐟', flavor:'Bright as the fish it came from. Draws a crowd.', doubleCatchBonus:CLOTHING_DOUBLE_CATCH_BONUS_PER_PIECE, pixels:clothingSlotPixels('shirt', CLOTHING_SET_COLORS.trout)},
    {slot:'pants', name:'Trout-tail Waders', icon:'🐟', flavor:'Built for holding steady in fast, cold water.', doubleCatchBonus:CLOTHING_DOUBLE_CATCH_BONUS_PER_PIECE, pixels:clothingSlotPixels('pants', CLOTHING_SET_COLORS.trout)},
    {slot:'shoes', name:'Trout-fin Boots', icon:'🐟', flavor:'Sure-footed on slick rock. You barely notice the current now.', doubleCatchBonus:CLOTHING_DOUBLE_CATCH_BONUS_PER_PIECE, pixels:clothingSlotPixels('shoes', CLOTHING_SET_COLORS.trout)},
    {slot:'gloves', name:'Trout-gill Gloves', icon:'🐟', flavor:'A quicker sense for when a second fish is circling the line.', doubleCatchBonus:CLOTHING_DOUBLE_CATCH_BONUS_PER_PIECE, pixels:clothingSlotPixels('gloves', CLOTHING_SET_COLORS.trout)}
  ],
  catfish: [
    {slot:'hat', name:'Catfish-whisker Cap', icon:'🐱', flavor:"Long whiskers trail off the brim. You swear you can feel the bottom through them.", bigOneLuckBonus:CLOTHING_BIGONE_BONUS_PER_PIECE, pixels:clothingSlotPixels('hat', CLOTHING_SET_COLORS.catfish)},
    {slot:'shirt', name:'Catfish-hide Vest', icon:'🐱', flavor:'Tough and rubbery, built for wrestling something big out of the mud.', bigOneLuckBonus:CLOTHING_BIGONE_BONUS_PER_PIECE, pixels:clothingSlotPixels('shirt', CLOTHING_SET_COLORS.catfish)},
    {slot:'pants', name:'Catfish-fin Waders', icon:'🐱', flavor:'Planted deep in the silt. You can feel every tug down there.', bigOneLuckBonus:CLOTHING_BIGONE_BONUS_PER_PIECE, pixels:clothingSlotPixels('pants', CLOTHING_SET_COLORS.catfish)},
    {slot:'shoes', name:'Catfish-tail Boots', icon:'🐱', flavor:'Heavy soles for wading into the deep, slow water.', bigOneLuckBonus:CLOTHING_BIGONE_BONUS_PER_PIECE, pixels:clothingSlotPixels('shoes', CLOTHING_SET_COLORS.catfish)},
    {slot:'gloves', name:'Catfish-barbel Gloves', icon:'🐱', flavor:'A sixth sense for when something enormous is circling below.', bigOneLuckBonus:CLOTHING_BIGONE_BONUS_PER_PIECE, pixels:clothingSlotPixels('gloves', CLOTHING_SET_COLORS.catfish)}
  ],
  crab: [
    {slot:'hat', name:'Crab-shell Cap', icon:'🦀', flavor:'Hard and knobby. Somehow lucky to wear.', mythicLuckBonus:CLOTHING_MYTHIC_BONUS_PER_PIECE, pixels:clothingSlotPixels('hat', CLOTHING_SET_COLORS.crab)},
    {slot:'shirt', name:'Crab-plate Vest', icon:'🦀', flavor:'Segmented armor plates, faintly iridescent under the sun.', mythicLuckBonus:CLOTHING_MYTHIC_BONUS_PER_PIECE, pixels:clothingSlotPixels('shirt', CLOTHING_SET_COLORS.crab)},
    {slot:'pants', name:'Crab-leg Waders', icon:'🦀', flavor:'Clicks faintly with every step. Nobody knows why.', mythicLuckBonus:CLOTHING_MYTHIC_BONUS_PER_PIECE, pixels:clothingSlotPixels('pants', CLOTHING_SET_COLORS.crab)},
    {slot:'shoes', name:'Crab-claw Boots', icon:'🦀', flavor:'Sidesteps better than they walk straight.', mythicLuckBonus:CLOTHING_MYTHIC_BONUS_PER_PIECE, pixels:clothingSlotPixels('shoes', CLOTHING_SET_COLORS.crab)},
    {slot:'gloves', name:'Crab-pincer Gloves', icon:'🦀', flavor:'A firm, snapping grip that seems to draw out strange things.', mythicLuckBonus:CLOTHING_MYTHIC_BONUS_PER_PIECE, pixels:clothingSlotPixels('gloves', CLOTHING_SET_COLORS.crab)}
  ],
  lobster: [
    {slot:'hat', name:'Lobster-shell Cap', icon:'🦞', flavor:'Polished a deep red. Catches every eye at the dock.', uniqueLuckBonus:CLOTHING_UNIQUE_BONUS_PER_PIECE, pixels:clothingSlotPixels('hat', CLOTHING_SET_COLORS.lobster)},
    {slot:'shirt', name:'Lobster-plate Vest', icon:'🦞', flavor:'Heavy, layered armor plating. Worth more than it looks.', uniqueLuckBonus:CLOTHING_UNIQUE_BONUS_PER_PIECE, pixels:clothingSlotPixels('shirt', CLOTHING_SET_COLORS.lobster)},
    {slot:'pants', name:'Lobster-tail Waders', icon:'🦞', flavor:'A stiff, springy stride that never quite feels natural.', uniqueLuckBonus:CLOTHING_UNIQUE_BONUS_PER_PIECE, pixels:clothingSlotPixels('pants', CLOTHING_SET_COLORS.lobster)},
    {slot:'shoes', name:'Lobster-leg Boots', icon:'🦞', flavor:'Ten legs\' worth of confidence packed into two boots.', uniqueLuckBonus:CLOTHING_UNIQUE_BONUS_PER_PIECE, pixels:clothingSlotPixels('shoes', CLOTHING_SET_COLORS.lobster)},
    {slot:'gloves', name:'Lobster-claw Gauntlets', icon:'🦞', flavor:'Heavy, armored, and strangely precise for something this bulky.', uniqueLuckBonus:CLOTHING_UNIQUE_BONUS_PER_PIECE, pixels:clothingSlotPixels('gloves', CLOTHING_SET_COLORS.lobster)}
  ]
};
FISH.forEach(function(fish){
  if(CLOTHING_FISH_IDS.indexOf(fish.id) >= 0){
    CLOTHING_SETS[fish.id].forEach(function(piece){
      MYTHIC_LOG_ITEMS.push(Object.assign({id:'mythic_'+fish.id+'_'+piece.slot, fishId:fish.id, chance:0.001, mythic:true, clothing:true}, piece));
    });
    return;
  }
  for(var mythicNumber=1;mythicNumber<=5;mythicNumber++){
    MYTHIC_LOG_ITEMS.push({id:'mythic_'+fish.id+'_'+mythicNumber, fishId:fish.id, name:'Mythic '+mythicNumber, icon:'✦', chance:0.001, mythic:true, flavor:'A mythic form of '+fish.name+'. Its true name is still waiting to be written.'});
  }
});
// The other five Golden Treasure Chest rewards (see COLLECTION_LOG_ITEMS
// above) are clothing pieces -- pushed in here, not the main array literal,
// since clothingItems()/clothingItemsForSlot() only read from
// MYTHIC_LOG_ITEMS. fishId:null and no chance field (chestReward:true marks
// them as chest-only, never a direct catch roll); slot/clothing:true is all
// equipClothing()/totalClothingXxxBonus() actually key off, so a null fishId
// works exactly like any other clothing piece once owned.
[
  {slot:'hat', id:'golden_helmet', name:'Gilded Helmet', icon:'🪖', flavor:'Polished to a mirror shine. Mostly ceremonial.'},
  {slot:'shirt', id:'golden_shirt', name:'Gilded Shirt', icon:'👕', flavor:'Not exactly practical for wading, but it sure looks the part.'},
  {slot:'pants', id:'golden_legs', name:'Gilded Legs', icon:'👖', flavor:'Stiff, heavy, and worth more than the boat.'},
  {slot:'shoes', id:'golden_shoes', name:'Gilded Shoes', icon:'👞', flavor:'Squeaky clean. They will not stay that way at the dock.'},
  {slot:'gloves', id:'golden_gloves', name:'Gilded Gloves', icon:'🧤', flavor:'Every knot you tie in these feels a little more official.'}
].forEach(function(piece){
  MYTHIC_LOG_ITEMS.push(Object.assign({fishId:null, chestGroup:true, chestReward:true, clothing:true}, piece));
});
COLLECTION_LOG_ITEMS = COLLECTION_LOG_ITEMS.concat(MYTHIC_LOG_ITEMS);
// All 10 chest rewards together, in a fixed order (Open Chest UI + odds
// display), now that both halves (trinkets in the main array, clothing in
// MYTHIC_LOG_ITEMS) have been merged into COLLECTION_LOG_ITEMS above.
export var GOLDEN_CHEST_REWARD_IDS = ['golden_helmet','golden_shirt','golden_legs','golden_gloves','golden_shoes','golden_rod','golden_net','golden_watch','golden_necklace','golden_underwear'];
export function goldenChestRewardItems(){ return GOLDEN_CHEST_REWARD_IDS.map(function(id){ return logItemById(id); }); }
export function logItemById(id){ for(var i=0;i<COLLECTION_LOG_ITEMS.length;i++){ if(COLLECTION_LOG_ITEMS[i].id===id) return COLLECTION_LOG_ITEMS[i]; } return null; }
export function logItemForFish(fishId){ for(var i=0;i<COLLECTION_LOG_ITEMS.length;i++){ if(COLLECTION_LOG_ITEMS[i].fishId===fishId) return COLLECTION_LOG_ITEMS[i]; } return null; }
export function mythicLogItemsForFish(fishId){ return MYTHIC_LOG_ITEMS.filter(function(item){ return item.fishId===fishId; }); }
export function clothingItems(){ return MYTHIC_LOG_ITEMS.filter(function(item){ return !!item.clothing; }); }

// ---------- "Big One" encounters ----------
// A rarer-than-mythic (see BIG_ONE_CHANCE below), skill-based encounter: land
// it via the tap-circle minigame (game.js) instead of a pure luck roll. One
// per species, added to the Collection Log as its own tier. bigOne:true marks
// it so the Log/UI can badge it separately from trinket/mythic entries.
export var BIG_ONE_LOG_ITEMS = FISH.map(function(fish, idx){
  return {
    id: 'bigone_'+fish.id,
    fishId: fish.id,
    tier: idx,
    name: 'Big '+fish.name,
    icon: fishDisplayEmoji(fish),
    bigOne: true,
    flavor: 'The one that got away from everyone else. Landing this one took real skill, not just luck.'
  };
});
COLLECTION_LOG_ITEMS = COLLECTION_LOG_ITEMS.concat(BIG_ONE_LOG_ITEMS);
export function bigOneLogItemForFish(fishId){ return BIG_ONE_LOG_ITEMS.filter(function(item){ return item.fishId===fishId; })[0] || null; }
// Chance, per catch of a species whose Big One hasn't been logged yet, that
// this cast turns into a Big One encounter instead of resolving normally.
// Rarer than a mythic (1/1000) and a notch more common than a species' own
// unique (1/5,000) -- landing on purpose, via a minigame, is the point, not
// grinding casts for a pure-luck roll.
export var BIG_ONE_CHANCE = 1/2000;
// On a successful Big One catch, an extra shot at that species' own unique
// item (logItemForFish) as a bonus -- on top of the guaranteed Collection Log
// entry, not instead of it.
export var BIG_ONE_UNIQUE_BONUS_CHANCE = 0.1;
// Per-species minigame difficulty. Both the circle count and shrink speed
// scale up together with how far into FISH a species sits (idx 0 = Shrimp,
// idx FISH.length-1 = Leviathan), while the hit/total ratio stays roughly
// constant -- so late-game Big Ones are meaningfully harder to land, not just
// reskinned. Bumped up a full notch from the original pass (more circles,
// faster shrink at every tier) after early testing felt too easy/slow.
export function bigOneDifficultyForFish(fish){
  var idx = FISH.indexOf(fish);
  if(idx < 0) idx = 0;
  return {
    circles: Math.min(16, 9 + Math.floor(idx/2)),
    need: Math.min(12, 6 + Math.floor(idx/3)),
    lifetimeMs: Math.max(450, 1100 - idx*36)
  };
}
export function clothingItemsForSlot(slot){ return clothingItems().filter(function(item){ return item.slot===slot; }); }

// ---------------------------------------------------------------------------
// Per-species minigames -- separate from Big One. Much more common, much
// lower stakes: no penalty for missing, just a shot at a temporary buff. The
// first one is Shrimp's "Swarm"; each future species is expected to get its
// own distinct mechanic (not a Big One reskin), so this stays a dedicated
// block per fish rather than a generic formula like bigOneDifficultyForFish.
// ---------------------------------------------------------------------------
export var SHRIMP_SWARM_CHANCE = 1/1000;
export var SHRIMP_SWARM_CONFIG = {
  durationMs: 12000,
  waveCount: 3,
  perWave: 5, // 3 waves x 5 = 15 shrimp total
  waveGapMs: 4000,
  need: 10 // tag 10 of 15 to trigger the buff below
};
// Not a purchasable CONSUMABLE (see those above) -- earned only by clearing
// the Shrimp Swarm minigame. Still stored the same way in
// state.activeBuffs[id] (see useConsumable()/isBuffActive() in state.js and
// game.js), so the same expiry/countdown machinery just works. Applied as a
// flat multiplier (coinsMult/xpMult), never folded into the additive
// speed/luck/sell/xp/proficiency bonus pools above -- those are clamped at
// well under 10x and would clip a jackpot this size down to almost nothing.
export var SHRIMP_SWARM_BUFF = {
  id: 'shrimp_swarm',
  name: 'Swarm Jackpot',
  icon: '🦐',
  duration: 60000,
  coinsMult: 10,
  xpMult: 10,
  flavor: 'Every catch is worth ten times as much while this lasts.'
};

// Challenges are tiered. Claiming one removes it and immediately advances that
// challenge family to its next target. When the final tier is claimed, that
// challenge family disappears permanently.
var FISH_CATCH_THRESHOLDS = [5,10,25,50,100,250,500,1000,5000];
var FISH_CHALLENGE_ICONS = {shrimp:'🦐',anchovies:'🐟',perch:'🐟',bluegill:'🐟',carp:'🐟',trout:'🐟',catfish:'🐟',crab:'🦀',lobster:'🦞',bass:'🐟',sturgeon:'🐟',koi:'🐠',squid:'🦑',octopus:'🐙',eel:'🐍',marlin:'🐟',dragonfish:'🐉',megalodon:'🦈',leviathan:'🐋'};

// ---------------------------------------------------------------------------
// Per-species challenge cosmetics -- procedurally generated pole/hat recolors,
// one per FISH_CATCH_THRESHOLDS tier (9 tiers x 19 species = 171 items).
// Odd tiers (1,3,5,7,9) reward a themed pole color, each rung richer than the
// last; even tiers (2,4,6,8) reward a themed hat, cycling through the three
// generic hat silhouettes pixelAvatarHTML() (render.js) already knows how to
// draw from a name+color alone (Beanie/Bucket/generic) -- no new pixel art
// needed. Every item here is `challengeReward:true` and `cost:0`: it's never
// for sale and never shown in the Customize grid (see customizeSections(),
// screens.js) until the matching Challenges tier is actually claimed, at
// which point ownership is granted directly (see the challenge-claim handler,
// screens.js) rather than through the shop or the achievement-claim flow the
// Shrimp Head hat uses.
// ---------------------------------------------------------------------------
function hslToHex(h, s, l){
  s = s/100; l = l/100;
  var k = function(n){ return (n + h/30) % 12; };
  var a = s * Math.min(l, 1-l);
  var f = function(n){ return l - a * Math.max(-1, Math.min(k(n)-3, Math.min(9-k(n), 1))); };
  var toHex = function(x){ var v = Math.round(x*255); return (v<16?'0':'') + v.toString(16); };
  return '#' + toHex(f(0)) + toHex(f(8)) + toHex(f(4));
}
// Base hue per species, plus a couple of flags for species whose "personality"
// shouldn't just be a hue: muddy bottom-feeders and armored ancients read as
// desaturated/grayed (muted), the ornamental Koi reads as extra saturated
// (vivid), and the two apex deep-water species read as darker overall (dark)
// so they don't land on the same pastel range as everything else.
var FISH_THEME = {
  shrimp:{hue:350}, anchovies:{hue:205}, perch:{hue:95}, bluegill:{hue:185},
  carp:{hue:42}, trout:{hue:165}, catfish:{hue:28,muted:true}, crab:{hue:14},
  lobster:{hue:358}, bass:{hue:125}, sturgeon:{hue:212,muted:true}, koi:{hue:33,vivid:true},
  squid:{hue:265}, octopus:{hue:312}, eel:{hue:150}, marlin:{hue:222},
  dragonfish:{hue:340}, megalodon:{hue:208,muted:true,dark:true}, leviathan:{hue:258,dark:true}
};
var POLE_TIER_ADJ = ['Faded','Dull','Bright','Vivid','Radiant'];
var HAT_TIER_ADJ = ['Modest','Sturdy','Polished','Prestige'];
var HAT_TIER_SHAPE = ['Beanie','Bucket Hat','Topper','Beanie']; // 'Topper' avoids the
// 'Beanie'/'Bucket' substrings on purpose, so it falls through to the third,
// generic hat silhouette in pixelAvatarHTML() instead of reusing one of those two.
function themeColor(theme, s, l){
  var sat = s * (theme.muted ? 0.6 : theme.vivid ? 1.15 : 1);
  sat = Math.max(10, Math.min(95, sat));
  var light = l - (theme.dark ? 15 : 0);
  light = Math.max(18, Math.min(88, light));
  return hslToHex(theme.hue, sat, light);
}
export var CUSTOM_HAT_CHALLENGE_REWARDS = [];
export var CUSTOM_POLE_CHALLENGE_REWARDS = [];
var FISH_CHALLENGE_COSMETICS = {};
FISH.forEach(function(fish){
  var theme = FISH_THEME[fish.id] || {hue:200};
  var icon = FISH_CHALLENGE_ICONS[fish.id] || '🐟';
  var rewards = [];
  for(var t=0; t<FISH_CATCH_THRESHOLDS.length; t++){
    if(t % 2 === 0){
      var rung = t/2; // 0..4
      var s = 30 + rung*12.5, l = 78 - rung*9;
      var id = 'pole_'+fish.id+'_t'+(t+1);
      var name = POLE_TIER_ADJ[rung]+' '+fish.name+' Pole';
      CUSTOM_POLE_CHALLENGE_REWARDS.push({id:id, name:name, color:themeColor(theme,s,l), cost:0, challengeReward:true});
      rewards.push({kind:'pole', id:id, name:name});
    } else {
      var rung2 = (t-1)/2; // 0..3
      var s2 = 40 + rung2*15, l2 = 65 - rung2*7;
      var id2 = 'hat_'+fish.id+'_t'+(t+1);
      var name2 = HAT_TIER_ADJ[rung2]+' '+fish.name+' '+HAT_TIER_SHAPE[rung2];
      CUSTOM_HAT_CHALLENGE_REWARDS.push({id:id2, name:name2, color:themeColor(theme,s2,l2), icon:icon, cost:0, challengeReward:true});
      rewards.push({kind:'hat', id:id2, name:name2});
    }
  }
  FISH_CHALLENGE_COSMETICS[fish.id] = rewards;
});
// CUSTOM_HATS/CUSTOM_POLES (declared above, before FISH exists) are mutated in
// place here rather than reassigned, so every existing import of them (a live
// ES module binding to the same array) sees the extra 171 items too.
Array.prototype.push.apply(CUSTOM_HATS, CUSTOM_HAT_CHALLENGE_REWARDS);
Array.prototype.push.apply(CUSTOM_POLES, CUSTOM_POLE_CHALLENGE_REWARDS);

export var CHALLENGES = [
  {id:'catch', name:'Catch fish', icon:'🐟', tiers:[10,100,500,1000,5000], rewards:[20,75,200,500,1500], progress:function(){ return totalFishCaught(); }},
  {id:'level', name:'Reach Fishing Lv', icon:'⭐', tiers:[10,25,50,75,100], rewards:[30,80,200,500,1200], progress:function(){ return playerLevel(); }},
  {id:'trophy', name:'Land a rare catch', icon:'🏆', tiers:[100,1000,10000,100000,1000000], rewards:[50,125,300,1000,3000], progress:function(){ return state.records.bestFloat > 0 && state.records.bestFishId ? Math.floor(1/state.records.bestFloat) : 0; }},
  {id:'species', name:'Discover species', icon:'📖', tiers:[5,10,15,19], rewards:[40,100,250,750], progress:function(){ return Object.keys(state.caught).length; }},
  // Tiers used to top out at 19, back when the log only held the 18 unique
  // curiosities. It now also holds 95 mythic drops (113 possible entries
  // total), so the old cap let players max this out almost immediately with
  // no further progression. Tiers now run the full length of the log, with
  // the final tier a genuine completionist milestone. The log actually holds
  // 114 entries as of the Dev Luck Tablet (a 1-in-10,000,000 universal
  // drop), but the final tier deliberately stays at 113 -- a completionist
  // goal shouldn't hinge on a catch that unlikely.
  {id:'log', name:'Find collection log items', icon:'📜', tiers:[1,5,15,30,60,113], rewards:[25,100,300,750,2000,5000], progress:function(){ return Object.keys(state.collectionLog||{}).length; }}
].concat(FISH.map(function(fish){
  return {id:'fish_'+fish.id, name:'Catch '+fish.name, icon:FISH_CHALLENGE_ICONS[fish.id] || '🐟', tiers:FISH_CATCH_THRESHOLDS, rewards:[0,0,0,0,0,0,0,0,0], rewardType:'cosmetic', cosmeticRewards:FISH_CHALLENGE_COSMETICS[fish.id], progress:function(){ return state.caught[fish.id] || 0; }};
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
  },
  {
    id:'quick_buy_bait',
    name:'Quick-Buy Bait',
    icon:'🎣',
    level:5,
    cost:150,
    desc:'Tap the bait counter in the fishing window to instantly buy 5 bait for your current gear, at the same price as a pack from the shop. No more digging through the Bait tab mid-session.'
  }
];
export function upgradeById(id){ for(var i=0;i<UPGRADES.length;i++){ if(UPGRADES[i].id===id) return UPGRADES[i]; } return null; }

// ---------- Fishing Shack ----------
// A pure cosmetic coin sink: a decoratable room (see screen-shack in
// index.html / renderShack() in screens.js) separate from anything that
// affects fishing itself. state.shack holds { tier, decor:{slot:itemId},
// owned:{itemId:true}, mounts:[{catchId,fishId,stars,float}] }.
//
// Tiers are a straight coin-and-level-gated upgrade path, same pattern as
// UPGRADES above -- state.shack.tier tracks how far you've gotten, and
// nextShackTier()/buyShackTier() (game.js) handle moving up one at a time.
// Decor purchases carry over between tiers (nothing is lost moving up), and
// each tier also unlocks a few new tier-exclusive options per slot on top of
// what's already available -- see SHACK_DECOR's tierRequired field.
export var SHACK_TIERS = [
  {tier:0, name:'Old Shack', level:1, cost:0, mountSlots:1, wallColor:'#4b3a2c', floorColor:'#6b4a30', flavor:"Leans a little in the wind, but it's yours."},
  {tier:1, name:'Fixer-Upper Cabin', level:10, cost:2000, mountSlots:1, wallColor:'#5a4632', floorColor:'#7a5636', flavor:'New boards over the old ones. Still smells like the bay.'},
  {tier:2, name:'Cozy Cottage', level:30, cost:12000, mountSlots:2, wallColor:'#6b5a48', floorColor:'#8a6540', flavor:'Actually holds heat now.'},
  {tier:3, name:"Angler's Lodge", level:50, cost:60000, mountSlots:2, wallColor:'#7a6350', floorColor:'#9a7248', flavor:'Big enough for the whole tackle collection.'},
  {tier:4, name:'Waterfront Manor', level:70, cost:250000, mountSlots:3, wallColor:'#8a7360', floorColor:'#a8845a', flavor:'Neighbors ask what you do for a living.'},
  {tier:5, name:"The Captain's Lake House", level:90, cost:1000000, mountSlots:4, wallColor:'#9c8770', floorColor:'#c49a68', flavor:'Retirement, but you never actually retired.'}
];
export function shackTierInfo(tier){ return SHACK_TIERS[Math.max(0, Math.min(SHACK_TIERS.length-1, tier||0))]; }
export function nextShackTier(tier){ return SHACK_TIERS[(tier||0)+1] || null; }

// Five furniture slots (rug/sofa/curtains/wallArt/table) plus a separate
// trophy-mount system (not purchased -- populated from your own Trophy Room
// catches, see mountTrophyInSlot() in game.js). tierRequired gates when an
// item becomes purchasable, matching whatever SHACK_TIERS.tier the player
// has reached; owning an item is permanent once bought, same as clothing.
export var SHACK_DECOR = [
  // Rugs -- pattern drives the little pixel-icon render.js builds (rugGrid());
  // trimTone only matters for pattern:'trimmed' (picks the border color).
  {id:'rug_frayed', slot:'rug', tierRequired:0, cost:80, name:'Frayed Rug', color:'#7a4a3a', pattern:'textured', flavor:'Older than the dock posts.'},
  {id:'rug_stripe', slot:'rug', tierRequired:0, cost:150, name:'Striped Rag Rug', color:'#8a6a3a', pattern:'striped', flavor:'Hand-braided, mismatched colors, somehow works.'},
  {id:'rug_anchor', slot:'rug', tierRequired:0, cost:300, name:'Anchor-Print Rug', color:'#3f5566', pattern:'trimmed', trimTone:'dark', flavor:'A little on the nose, but comfortable.'},
  {id:'rug_persian', slot:'rug', tierRequired:2, cost:5000, name:'Imported Rug', color:'#7a2a3a', pattern:'trimmed', trimTone:'light', flavor:'Where did this even come from.'},
  {id:'rug_fur', slot:'rug', tierRequired:3, cost:20000, name:'Faux Fur Rug', color:'#e8e0d0', pattern:'textured', flavor:"Doesn't match anything else. Doesn't matter."},
  {id:'rug_gold', slot:'rug', tierRequired:5, cost:150000, name:'Gilded Rug', color:'#d9a441', pattern:'trimmed', trimTone:'gold', flavor:'Excessive. Perfect.'},
  // Sofas
  {id:'sofa_bench', slot:'sofa', tierRequired:0, cost:120, name:'Wooden Bench', color:'#6b4a30', pattern:'bench', flavor:'A plank with delusions of furniture.'},
  {id:'sofa_plaid', slot:'sofa', tierRequired:0, cost:250, name:'Plaid Couch', color:'#5a3a2a', pattern:'striped', flavor:'Smells like a campfire. In a good way.'},
  {id:'sofa_leather', slot:'sofa', tierRequired:1, cost:1500, name:'Cracked Leather Sofa', color:'#4a2a1a', pattern:'dotted', flavor:'Found at an estate sale. No questions asked.'},
  {id:'sofa_velvet', slot:'sofa', tierRequired:3, cost:25000, name:'Velvet Sofa', color:'#5a2a4a', pattern:'trimmed', trimTone:'light', flavor:'You have to ask people to take their boots off now.'},
  {id:'sofa_leviathan', slot:'sofa', tierRequired:5, cost:200000, name:'Leviathan-Hide Sofa', color:'#2a4a4a', pattern:'textured', flavor:"Don't ask what it's made of."},
  // Curtains (shared across both windows in the room)
  {id:'curtains_burlap', slot:'curtains', tierRequired:0, cost:60, name:'Burlap Curtains', color:'#8a7250', pattern:'plain', flavor:'Keeps the glare off the water.'},
  {id:'curtains_check', slot:'curtains', tierRequired:0, cost:140, name:'Checkered Curtains', color:'#9a3a3a', pattern:'striped', flavor:'Very kitchen-table energy.'},
  {id:'curtains_navy', slot:'curtains', tierRequired:1, cost:900, name:'Navy Canvas Curtains', color:'#2a3a5a', pattern:'dotted', flavor:'Actual boat sailcloth. Repurposed, obviously.'},
  {id:'curtains_lace', slot:'curtains', tierRequired:3, cost:15000, name:'Lace Curtains', color:'#e8e4d8', pattern:'textured', flavor:"Somebody's grandmother would approve."},
  {id:'curtains_velvet', slot:'curtains', tierRequired:5, cost:120000, name:'Velvet Drapes', color:'#5a1a2a', pattern:'trimmed', trimTone:'gold', flavor:'Blocks out the sunrise. Worth it.'},
  // Wall Art -- these get bespoke little scenes (wallArtSVG() in render.js)
  // rather than the generic pattern system, keyed off this same `pattern` id.
  {id:'wallart_map', slot:'wallArt', tierRequired:0, cost:100, name:'Old Fishing Map', color:'#c9b98a', pattern:'map', flavor:"Half the labels don't exist anymore."},
  {id:'wallart_knot', slot:'wallArt', tierRequired:0, cost:180, name:'Framed Knot Guide', color:'#b09060', pattern:'knot', flavor:'You still only know three of them.'},
  {id:'wallart_painting', slot:'wallArt', tierRequired:1, cost:1200, name:'Sunset Painting', color:'#d97a4a', pattern:'sunset', flavor:'Bought it because the colors matched the room.'},
  {id:'wallart_mounted_net', slot:'wallArt', tierRequired:2, cost:8000, name:'Mounted Net Display', color:'#7a8a8a', pattern:'net', flavor:'The net that started it all. Retired with honors.'},
  {id:'wallart_portrait', slot:'wallArt', tierRequired:4, cost:80000, name:'Oil Portrait (of You, Fishing)', color:'#6a4a2a', pattern:'portrait', flavor:'Commissioned. Slightly too flattering.'},
  // Table
  {id:'table_crate', slot:'table', tierRequired:0, cost:90, name:'Crate Table', color:'#8a6a40', pattern:'striped', flavor:'Still has the shipping stamp on the side.'},
  {id:'table_spool', slot:'table', tierRequired:0, cost:160, name:'Cable Spool Table', color:'#7a5a3a', pattern:'ringed', flavor:'Classic. Everyone had one of these once.'},
  {id:'table_oak', slot:'table', tierRequired:1, cost:1100, name:'Oak Table', color:'#5a3a20', pattern:'plain', flavor:"Sturdy enough to clean a fish on. Please don't."},
  {id:'table_glass', slot:'table', tierRequired:3, cost:18000, name:'Glass-Top Table', color:'#a8c8cc', pattern:'trimmed', trimTone:'metal', flavor:'One wrong cast and this is over.'},
  {id:'table_mahogany', slot:'table', tierRequired:5, cost:140000, name:'Mahogany Table', color:'#3a1e14', pattern:'trimmed', trimTone:'gold', flavor:'Somehow still gets used as a bait station.'}
];
export var SHACK_DECOR_SLOTS = ['rug','sofa','curtains','wallArt','table'];
export function shackDecorForSlot(slot){ return SHACK_DECOR.filter(function(d){ return d.slot===slot; }); }
export function shackDecorById(id){ for(var i=0;i<SHACK_DECOR.length;i++){ if(SHACK_DECOR[i].id===id) return SHACK_DECOR[i]; } return null; }

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
