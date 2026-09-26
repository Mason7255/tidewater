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
  {id:'lobster_trap', fishId:'lobster', name:'Lobster trap', icon:'🦞', cost:1700, level:40, type:'trap', desc:'A commercial-style trap built for valuable lobster.'},
  {id:'bass_spinning_rod', fishId:'bass', name:'Bass spinning rod', icon:'🎣', cost:2300, level:45, type:'rod', desc:'Medium-heavy spinning tackle for hard-fighting bass.'},
  {id:'sturgeon_heavy_rig', fishId:'sturgeon', name:'Sturgeon heavy rig', icon:'⚓', cost:3000, level:50, type:'rig', desc:'A powerful bottom rig for large, ancient fish.'},
  {id:'koi_carp_rod', fishId:'koi', name:'Koi match rod', icon:'🎣', cost:4000, level:55, type:'rod', desc:'Long, controlled tackle for valuable koi.'},
  {id:'squid_jigging_rig', fishId:'squid', name:'Deep squid jigging rig', icon:'🦑', cost:5500, level:60, type:'deep', desc:'Specialized lights and jigs for deep squid.'},
  {id:'octopus_pot', fishId:'octopus', name:'Octopus pot', icon:'🪤', cost:7000, level:65, type:'trap', desc:'A reinforced pot designed for strong, clever cephalopods.'},
  {id:'eel_trap', fishId:'eel', name:'Deep eel trap', icon:'🪤', cost:9000, level:70, type:'trap', desc:'Heavy trap gear for deep, slippery eels.'},
  {id:'marlin_trolling_rig', fishId:'marlin', name:'Marlin trolling rig', icon:'⚓', cost:12000, level:75, type:'biggame', desc:'Heavy offshore trolling gear for powerful billfish.'},
  {id:'dragonfish_deep_rig', fishId:'dragonfish', name:'Dragonfish deep rig', icon:'🐉', cost:16000, level:80, type:'deep', desc:'Extreme deep-water tackle for rare dragonfish.'},
  {id:'megalodon_biggame_rig', fishId:'megalodon', name:'Megalodon big-game rig', icon:'🦈', cost:22000, level:85, type:'biggame', desc:'Massive cable, reel, and terminal tackle for prehistoric predators.'},
  {id:'leviathan_deepsea_rig', fishId:'leviathan', name:'Leviathan deep-sea rig', icon:'🌊', cost:30000, level:90, type:'biggame', desc:'The ultimate fictional deep-water rig for the Leviathan.'}
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
export var COLLECTION_LOG_ITEMS = [
  {id:'old_boot', fishId:'shrimp', name:'Old Boot', icon:'👢', chance:0.0002, flavor:"Somebody's lost boot, waterlogged and sad."},
  {id:'silver_ring', fishId:'anchovies', name:'Silver Ring', icon:'💍', chance:0.0002, flavor:'Tarnished, but still shines under the dock lights.'},
  {id:'tin_can', fishId:'perch', name:'Rusty Tin Can', icon:'🥫', chance:0.0002, flavor:"Someone's lunch, decades ago."},
  {id:'broken_watch', fishId:'bluegill', name:'Broken Watch', icon:'⌚', chance:0.0002, flavor:'Stopped at a time nobody remembers.'},
  {id:'bottle_message', fishId:'carp', name:'Message in a Bottle', icon:'🍾', chance:0.0002, flavor:'The ink has run, but something was written here.'},
  {id:'lost_lure', fishId:'trout', name:'Lost Lure', icon:'🪝', chance:0.0002, flavor:"Another angler's bad luck, sitting on the bottom."},
  {id:'old_key', fishId:'catfish', name:'Rusted Key', icon:'🗝️', chance:0.0002, flavor:'No telling what it used to open.'},
  {id:'small_pearl', fishId:'crab', name:'Small Pearl', icon:'🫧', chance:0.0002, flavor:'Smooth and pale, tucked in the mud.'},
  {id:'lobster_claw', fishId:'lobster', name:'Carved Lobster Claw', icon:'🦞', chance:0.0002, flavor:'A strange keepsake from an old fishing boat.'},
  {id:'bass_lure', fishId:'bass', name:'Vintage Bass Lure', icon:'🪝', chance:0.0002, flavor:'Paint chipped, hooks dulled, story unknown.'},
  {id:'sturgeon_tag', fishId:'sturgeon', name:'Old Sturgeon Tag', icon:'🏷️', chance:0.0002, flavor:'A faded research tag from years ago.'},
  {id:'koi_coin', fishId:'koi', name:'Koi Collector Coin', icon:'🪙', chance:0.0002, flavor:'A polished token stamped with a koi.'},
  {id:'squid_ink', fishId:'squid', name:'Ink Vial', icon:'🧪', chance:0.0002, flavor:'Dark ink sealed in an old glass vial.'},
  {id:'octopus_charm', fishId:'octopus', name:'Octopus Charm', icon:'🧿', chance:0.0002, flavor:'Eight tiny arms carved into a weathered charm.'},
  {id:'eel_scale', fishId:'eel', name:'Eel Scale Charm', icon:'🧿', chance:0.0002, flavor:'A strange charm worn smooth by years underwater.'},
  {id:'captains_compass', fishId:'marlin', name:"Captain's Compass", icon:'🧭', chance:0.0002, flavor:'Still points somewhere. Just maybe not north.'},
  {id:'dragonfang', fishId:'dragonfish', name:'Dragonfang Fragment', icon:'🦷', chance:0.0002, flavor:'A tiny fragment from something that should not be this deep.'},
  {id:'megalodon_tooth', fishId:'megalodon', name:'Megalodon Tooth', icon:'🦷', chance:0.0002, flavor:'A huge fossilized tooth from an ancient predator.'},
  {id:'leviathan_scale', fishId:'leviathan', name:'Leviathan Scale', icon:'🪽', chance:0.0002, flavor:"Bigger than your hand. You don't want to know what shed it."}
];
var MYTHIC_LOG_ITEMS = [];
FISH.forEach(function(fish){
  for(var mythicNumber=1;mythicNumber<=5;mythicNumber++){
    MYTHIC_LOG_ITEMS.push({id:'mythic_'+fish.id+'_'+mythicNumber, fishId:fish.id, name:'Mythic '+mythicNumber, icon:'✦', chance:0.0002, mythic:true, flavor:'A mythic form of '+fish.name+'. Its true name is still waiting to be written.'});
  }
});
COLLECTION_LOG_ITEMS = COLLECTION_LOG_ITEMS.concat(MYTHIC_LOG_ITEMS);
export function logItemById(id){ for(var i=0;i<COLLECTION_LOG_ITEMS.length;i++){ if(COLLECTION_LOG_ITEMS[i].id===id) return COLLECTION_LOG_ITEMS[i]; } return null; }
export function logItemForFish(fishId){ for(var i=0;i<COLLECTION_LOG_ITEMS.length;i++){ if(COLLECTION_LOG_ITEMS[i].fishId===fishId) return COLLECTION_LOG_ITEMS[i]; } return null; }
export function mythicLogItemsForFish(fishId){ return MYTHIC_LOG_ITEMS.filter(function(item){ return item.fishId===fishId; }); }

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
  {id:'log', name:'Find collection log items', icon:'📜', tiers:[1,5,10,19], rewards:[25,100,300,1000], progress:function(){ return Object.keys(state.collectionLog||{}).length; }}
].concat(FISH.map(function(fish){
  return {id:'fish_'+fish.id, name:'Catch '+fish.name, icon:FISH_CHALLENGE_ICONS[fish.id] || '🐟', tiers:FISH_CATCH_THRESHOLDS, rewards:[0,0,0,0,0,0,0,0,0], rewardType:'cosmetic', progress:function(){ return state.caught[fish.id] || 0; }};
}));

export var STARTING_BAIT = 5;
export var BASE_CAST_MS = 5000;
export var NO_BAIT_CAST_MS = 12000;
export var RATING_EXPONENT = 4;

