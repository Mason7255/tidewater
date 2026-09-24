// ---------------------------------------------------------------------------
// state.js — The mutable game state singleton, save-slot persistence, catch
// quality/rating rolls & lookups, and per-species proficiency (these read/
// write `state`, so they live here rather than in data.js).
// ---------------------------------------------------------------------------

// Longest catch log kept in state (and localStorage). Well past what any
// screen displays (recent feed shows 5), just generous enough that record
// lookups by catchId stay populated through normal play.


import { BAIT_TYPES, LEVEL_CAP, OUTFIT_COLORS, QUALITY_TIERS, baitById, equipmentById, equipmentForFish, levelForXp, makeBaitCounts, startingOwnedEquipment } from './data.js';
import { fishById, refreshRecentCatches, stopAutoFish } from './game.js';
import { enterDock } from './menu.js';

export var CATCH_HISTORY_LIMIT = 500;

// ---------- State ----------
// This placeholder deliberately avoids touching data.js (no OUTFIT_COLORS[0],
// no startingOwnedEquipment()/makeBaitCounts() calls): with this many modules
// importing each other, a module-top-level read of another module's import
// can run before that module has gotten to its own declaration — the same
// hazard documented on buildProfXpTable below and in game.js/menu.js. main.js
// replaces this with a real fresh state (via setState(makeFreshState())) as
// the very first thing it does, once every module has finished loading — so
// this placeholder only has to survive that brief window unread.
export var state = {
  name:'', skin:'skin_light', hair:'hair_brown', outfit: 'coral', hat:'none', shirt:'shirt_coral', poleColor:'pole_brown',
  ownedCustomization:{shirts:{shirt_coral:true}, hats:{hat_none:true}, poles:{pole_brown:true}},
  coins:0, gear:'shrimp_net',
  ownedGear:{},
  baitCounts:{},
  selectedBait:'shrimp_bait',
  upgrades:{},
  storageTier:0,
  xp:0,
  caught:{},
  proficiencies:{},
  inventory:[], // {catchId, fishId, stars, float, status:'kept'|'trophy'}
  records:{ bestFloat:1, bestStars:0, bestFishId:null, bestCatchId:null, perSpeciesFloat:{}, perSpeciesStars:{}, perSpeciesCatchId:{} },
  recentCatches:[],
  catchHistory:[],
  collectionLog:{},
  claimedChallenges:{},
  challengeTiers:{},
  soundEnabled:true,
  volume:40
};
export var catchIdCounter = 1;
export function setCatchIdCounter(n){ catchIdCounter = n; }
export function nextCatchId(){ return catchIdCounter++; }
// `state` is exported as a live `var` binding, but other modules can't
// reassign an imported binding directly (only mutate its properties) — so a
// full swap (new game / loaded save) has to happen through this setter,
// which runs inside the module that actually owns the binding.
export function setState(newState){ state = newState; }

export function loadState(raw){
  try{
    if(raw){
      var parsed = JSON.parse(raw);
      state = Object.assign(state, parsed);
      state.ownedGear = Object.assign(startingOwnedEquipment(), parsed.ownedGear || {});
      state.ownedCustomization = Object.assign({shirts:{shirt_coral:true}, hats:{hat_none:true}, poles:{pole_brown:true}, skins:{skin_light:true}, hairs:{hair_brown:true}}, parsed.ownedCustomization || {});
      state.ownedCustomization.shirts = Object.assign({shirt_coral:true}, (parsed.ownedCustomization && parsed.ownedCustomization.shirts) || {});
      state.ownedCustomization.hats = Object.assign({hat_none:true}, (parsed.ownedCustomization && parsed.ownedCustomization.hats) || {});
      state.ownedCustomization.poles = Object.assign({pole_brown:true}, (parsed.ownedCustomization && parsed.ownedCustomization.poles) || {});
      state.ownedCustomization.skins = Object.assign({skin_light:true}, (parsed.ownedCustomization && parsed.ownedCustomization.skins) || {});
      state.ownedCustomization.hairs = Object.assign({hair_brown:true}, (parsed.ownedCustomization && parsed.ownedCustomization.hairs) || {});
      if(!state.skin || !state.ownedCustomization.skins[state.skin]) state.skin='skin_light';
      if(!state.hair || !state.ownedCustomization.hairs[state.hair]) state.hair='hair_brown';
      if(!state.shirt || !state.ownedCustomization.shirts[state.shirt]) {
        var oldShirtMap={coral:'shirt_coral',teal:'shirt_teal',gold:'shirt_gold',purple:'shirt_lavender',ink:'shirt_ink'};
        state.shirt = oldShirtMap[state.outfit] || 'shirt_coral';
        state.ownedCustomization.shirts[state.shirt] = true;
      }
      var oldHatMap={none:'hat_none',cap:'hat_red_cap',bucket:'hat_teal_bucket',beanie:'hat_black_beanie'};
      if(oldHatMap[state.hat]) state.hat=oldHatMap[state.hat];
      if(!state.ownedCustomization.hats[state.hat]) { state.hat='hat_none'; }
      if(!state.poleColor || !state.ownedCustomization.poles[state.poleColor]) state.poleColor = 'pole_brown';
      // Migrate the old generic net/pole gear into the new species-specific system.
      if(parsed.gear === 'net') state.gear = 'shrimp_net';
      if(parsed.gear === 'pole') state.gear = parsed.selectedBait ? (baitById(parsed.selectedBait) ? equipmentForFish(baitById(parsed.selectedBait).fishId).id : 'shrimp_net') : 'shrimp_net';
      if(!equipmentById(state.gear) || !state.ownedGear[state.gear]) state.gear = 'shrimp_net';
      state.ownedGear.shrimp_net = true;
      state.upgrades = Object.assign({}, parsed.upgrades || {});
      delete state.upgrades.fastCast;
      delete state.upgrades.autoSell;
      var migratedBaits = makeBaitCounts();
      var oldBaits = parsed.baitCounts || {};
      if(oldBaits.worms || oldBaits.shrimp_bait || oldBaits.cut_bait || oldBaits.glow_lure){
        migratedBaits.shrimp_bait = (oldBaits.worms||0) + (oldBaits.shrimp_bait||0) + (oldBaits.cut_bait||0) + (oldBaits.glow_lure||0);
      }
      BAIT_TYPES.forEach(function(b){ if(oldBaits[b.id] != null) migratedBaits[b.id] = oldBaits[b.id]; });
      state.baitCounts = Object.assign(migratedBaits, parsed.baitCounts || {});
      state.selectedBait = baitById(parsed.selectedBait) ? parsed.selectedBait : 'shrimp_bait';
      state.xp = state.xp || 0;
      state.storageTier = Math.max(0, Number(state.storageTier) || 0);
      state.proficiencies = parsed.proficiencies && typeof parsed.proficiencies === 'object' ? parsed.proficiencies : {};
      state.inventory = Array.isArray(parsed.inventory) ? parsed.inventory : [];
      state.recentCatches = Array.isArray(parsed.recentCatches) ? parsed.recentCatches.slice(0,3) : [];
      state.catchHistory = Array.isArray(parsed.catchHistory) ? parsed.catchHistory : (state.inventory || []).map(function(e){ return {catchId:e.catchId, fishId:e.fishId, stars:e.stars||null, float:e.float!=null?e.float:null, xp:fishById(e.fishId)?fishById(e.fishId).xp:0, timestamp:e.catchId||0}; });
      // Normalize old entries first. Old saves may only have the retired 1-100 rating;
      // that rating is used only once here to recover the closest possible float.
      state.inventory.forEach(function(c){
        if(c.catchId >= catchIdCounter) catchIdCounter = c.catchId + 1;
        if(typeof c.float !== 'number') c.float = legacyFloatFromRating(c.ratingScore != null ? c.ratingScore : c.rating);
        if(!c.stars) c.stars = starsFromFloat(c.float);
        delete c.rating; delete c.ratingScore;
      });
      state.catchHistory.forEach(function(c){
        if(typeof c.float !== 'number') c.float = legacyFloatFromRating(c.ratingScore != null ? c.ratingScore : c.rating);
        if(!c.stars) c.stars = starsFromFloat(c.float);
        delete c.rating; delete c.ratingScore;
      });
      // Trim the history only after the record data has been rebuilt below, so a record
      // can never depend on an entry remaining inside the rolling 500-catch log.
      var oldRecords = parsed.records || {};
      state.records = migrateRecords(oldRecords, state.inventory, state.catchHistory);
      if(state.catchHistory.length > CATCH_HISTORY_LIMIT) state.catchHistory.length = CATCH_HISTORY_LIMIT;
      state.collectionLog = parsed.collectionLog && typeof parsed.collectionLog === 'object' ? parsed.collectionLog : {};
      state.claimedChallenges = parsed.claimedChallenges && typeof parsed.claimedChallenges === 'object' ? parsed.claimedChallenges : {};
      state.challengeTiers = parsed.challengeTiers && typeof parsed.challengeTiers === 'object' ? parsed.challengeTiers : {};
      Object.keys(state.claimedChallenges).forEach(function(k){ if(state.claimedChallenges[k] === true) delete state.claimedChallenges[k]; });
      refreshRecentCatches();
      return true;
    }
  }catch(e){
    console.error('Tidewater save load failed:', e);
  }
  return false;
}
// ---------- Save slots ----------
// Three old-school save slots instead of one silent autosave key.
// saveState() (called throughout the game after state-changing actions)
// only writes once the session is bound to a slot, via New Game into an
// empty slot, Load Game, or an explicit Save Game.
export var SLOT_COUNT = 3;
export var activeSlot = null;
export function setActiveSlot(n){ activeSlot = n; }
export function slotKey(n){ return 'tidewater_slot_'+n; }
export function escapeHtml(s){ return String(s==null?'':s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
export function readSlotRaw(n){ try{ return localStorage.getItem(slotKey(n)); }catch(e){ return null; } }
export function getSlotInfo(n){
  var raw = readSlotRaw(n);
  if(!raw) return null;
  try{
    var p = JSON.parse(raw);
    var caught = p.caught || {};
    var fishTotal = 0; for(var k in caught){ fishTotal += caught[k]||0; }
    return { name: p.name || 'Angler', level: levelForXp(p.xp||0), coins: p.coins||0, fishCaught: fishTotal, savedAt: p.savedAt || null };
  }catch(e){ return null; }
}
export function saveToSlot(n){
  try{
    state.savedAt = Date.now();
    localStorage.setItem(slotKey(n), JSON.stringify(state));
    activeSlot = n;
    return true;
  }catch(e){ return false; }
}
export function deleteSlotData(n){
  try{ localStorage.removeItem(slotKey(n)); }catch(e){}
  if(activeSlot === n) activeSlot = null;
}
export function loadSlot(n){
  var raw = readSlotRaw(n);
  if(!raw) return false;
  stopAutoFish(); // invalidate any pending casts from whatever was previously loaded
  catchIdCounter = 1;
  var ok = loadState(raw);
  if(ok){
    activeSlot = n;
    enterDock();
  }
  return ok;
}
export function formatSavedAt(ts){
  if(!ts) return 'Not saved yet';
  var d = new Date(ts);
  return 'Saved ' + d.toLocaleDateString(undefined,{month:'short', day:'numeric'}) + ' · ' + d.toLocaleTimeString(undefined,{hour:'numeric', minute:'2-digit'});
}
export function saveState(){ if(!activeSlot) return; try{ state.savedAt = Date.now(); localStorage.setItem(slotKey(activeSlot), JSON.stringify(state)); }catch(e){} }

export function starsFromFloat(fl){
  fl = Math.max(0, Math.min(1, Number(fl) || 0));
  return fl < 0.001 ? 5 : (fl < 0.006 ? 4 : (fl < 0.206 ? 3 : (fl < 0.506 ? 2 : 1)));
}
export function rollQuality(){
  // The float is the single source of truth. Lower is rarer/better.
  // 5-star begins at 1/1,000 odds and 4-star at 1/200 odds.
  var fl = Math.random();
  return {stars:starsFromFloat(fl), float:fl};
}
function legacyFloatFromRating(rating){
  if(typeof rating !== 'number' || !isFinite(rating)) return 0.5;
  return Math.max(0, Math.min(1, 1 - rating/100));
}
export function starsForEntry(entry){ return entry && entry.stars ? entry.stars : starsFromFloat(floatForEntry(entry)); }
export function floatForEntry(entry){
  return entry && typeof entry.float === 'number' ? Math.max(0, Math.min(1, entry.float)) : legacyFloatFromRating(entry && (entry.ratingScore != null ? entry.ratingScore : entry.rating));
}
export function formatFloat(entry){
  var fl = floatForEntry(entry);
  if(fl === 0) return '0';
  return fl < 0.0001 ? fl.toPrecision(6) : fl.toFixed(6).replace(/0+$/,'').replace(/\.$/,'');
}
export function rarityDenominator(entry){
  var fl = floatForEntry(entry);
  return fl <= 0 ? Number.MAX_SAFE_INTEGER : Math.max(1, Math.round(1/fl));
}
export function floatRarityText(entry){
  var denominator = rarityDenominator(entry);
  return denominator === Number.MAX_SAFE_INTEGER ? '1/∞' : '1/'+denominator.toLocaleString();
}
export function starsText(stars){ return '★'.repeat(Math.max(1, Math.min(5, stars||1))); }
export function qualityInfo(stars){ return QUALITY_TIERS[Math.max(1, Math.min(5, stars||1))]; }
export function qualityForStars(stars){ return QUALITY_TIERS[Math.max(1, Math.min(5, stars||1))]; }
export function qualityStarsForEntry(entry){ return starsForEntry(entry); }

function migrateRecords(oldRecords, inventory, history){
  var records = {bestFloat:1, bestStars:0, bestFishId:null, bestCatchId:null, perSpeciesFloat:{}, perSpeciesStars:{}, perSpeciesCatchId:{}};
  var all = (inventory || []).concat(history || []);
  var byId = Object.create(null);
  all.forEach(function(e){ if(e && e.catchId != null) byId[e.catchId] = e; });
  var oldBest = oldRecords && oldRecords.bestCatchId != null ? byId[oldRecords.bestCatchId] : null;
  if(oldBest){
    records.bestFloat = floatForEntry(oldBest); records.bestStars = starsForEntry(oldBest); records.bestFishId = oldBest.fishId; records.bestCatchId = oldBest.catchId;
  } else if(oldRecords && oldRecords.bestFishId){
    records.bestFishId = oldRecords.bestFishId;
    records.bestCatchId = oldRecords.bestCatchId || null;
    records.bestFloat = oldRecords.bestFloat != null ? oldRecords.bestFloat : legacyFloatFromRating(oldRecords.bestRating);
    records.bestStars = oldRecords.bestStars || starsFromFloat(records.bestFloat);
  }
  all.forEach(function(e){
    if(!e || !e.fishId || typeof e.float !== 'number') return;
    if(records.bestFishId === null || e.float < records.bestFloat){
      records.bestFloat=e.float; records.bestStars=starsForEntry(e); records.bestFishId=e.fishId; records.bestCatchId=e.catchId;
    }
    if(records.perSpeciesFloat[e.fishId] == null || e.float < records.perSpeciesFloat[e.fishId]){
      records.perSpeciesFloat[e.fishId]=e.float; records.perSpeciesStars[e.fishId]=starsForEntry(e); records.perSpeciesCatchId[e.fishId]=e.catchId;
    }
  });
  // If the old save's record is no longer present, preserve its old record as the
  // best available migration rather than replacing it with a later ordinary catch.
  if(oldRecords && oldRecords.bestFishId && oldBest === null && oldRecords.bestRating != null){
    var legacyBestFloat=legacyFloatFromRating(oldRecords.bestRating);
    if(records.bestFishId === null || legacyBestFloat < records.bestFloat){
      records.bestFloat=legacyBestFloat; records.bestStars=starsFromFloat(legacyBestFloat); records.bestFishId=oldRecords.bestFishId; records.bestCatchId=oldRecords.bestCatchId || null;
    }
  }
  var oldSpecies = oldRecords && oldRecords.perSpecies || {};
  Object.keys(oldSpecies).forEach(function(id){
    if(records.perSpeciesFloat[id] == null){
      var oldFloat = oldRecords.perSpeciesFloat && oldRecords.perSpeciesFloat[id] != null ? oldRecords.perSpeciesFloat[id] : legacyFloatFromRating(oldSpecies[id]);
      records.perSpeciesFloat[id]=oldFloat; records.perSpeciesStars[id]=starsFromFloat(oldFloat); records.perSpeciesCatchId[id]=(oldRecords.perSpeciesCatchId||{})[id] || null;
    }
  });
  return records;
}
export function fishDisplayEmoji(fish){
  var id = fish && fish.id ? fish.id : fish;
  var icons = {shrimp:'🦐', anchovies:'🐟', perch:'🐟', bluegill:'🐟', carp:'🐟', trout:'🐟', catfish:'🐟', crab:'🦀', lobster:'🦞', bass:'🐟', sturgeon:'🐟', koi:'🐠', squid:'🦑', octopus:'🐙', eel:'🐍', marlin:'🐟', dragonfish:'🐉', megalodon:'🦈', leviathan:'🐋'};
  return icons[id] || '🐟';
}
export function sellPrice(fish, entry){
  // Rarity now drives value directly. This preserves the old general price curve
  // without keeping a hidden 1-100 rating in the game.
  var fl = floatForEntry(entry);
  var quality = Math.max(0, Math.min(1, 1-fl));
  var mult = 1 + 11 * Math.pow(quality, 3);
  return Math.max(1, Math.round(fish.coins * mult));
}


// ---------- Species proficiency ----------
// Proficiency is based on catches of that species, so expensive late-game fish
// do not level faster just because they award more fishing XP.
export var profXpTable = [0];
var PROFICIENCY_CATCH_MILESTONES = [
  {catches:0, level:1}, {catches:1, level:2}, {catches:5, level:5},
  {catches:10, level:8}, {catches:25, level:13}, {catches:50, level:19},
  {catches:100, level:28}, {catches:250, level:42}, {catches:500, level:57},
  {catches:1000, level:72}, {catches:2500, level:89}, {catches:5000, level:99}
];
// Not auto-invoked here: LEVEL_CAP comes from data.js, and data.js/state.js
// import each other (CHALLENGES' progress() callbacks need `state`), so this
// module's own top level can't safely assume data.js has fully finished
// evaluating yet. main.js calls this once, after every module is loaded.
export function buildProfXpTable(){
  for(var level=1; level<=LEVEL_CAP; level++){
    profXpTable[level] = level === 1 ? 0 : Math.floor(40 * Math.pow(level-1, 1.75));
  }
}
export function proficiencyXp(fishId){ return Number(state.caught[fishId] || 0); }
export function proficiencyLevel(fishId){
  var catches = proficiencyXp(fishId);
  for(var i=PROFICIENCY_CATCH_MILESTONES.length-1;i>=0;i--){
    var milestone=PROFICIENCY_CATCH_MILESTONES[i];
    if(catches >= milestone.catches){
      var next=PROFICIENCY_CATCH_MILESTONES[i+1];
      if(!next) return milestone.level;
      return Math.min(next.level-1, milestone.level + Math.floor((catches-milestone.catches)/(next.catches-milestone.catches)*(next.level-milestone.level)));
    }
  }
  return 1;
}
function catchesForProficiencyLevel(level){
  if(level<=1) return 0;
  if(level>=99) return 5000;
  for(var catches=0;catches<=5000;catches++){
    var test=0;
    for(var i=PROFICIENCY_CATCH_MILESTONES.length-1;i>=0;i--){
      var milestone=PROFICIENCY_CATCH_MILESTONES[i];
      if(catches>=milestone.catches){
        var next=PROFICIENCY_CATCH_MILESTONES[i+1];
        test=!next ? milestone.level : Math.min(next.level-1, milestone.level + Math.floor((catches-milestone.catches)/(next.catches-milestone.catches)*(next.level-milestone.level)));
        break;
      }
    }
    if(test>=level) return catches;
  }
  return 5000;
}
export function proficiencyProgress(fishId){
  var lvl = proficiencyLevel(fishId);
  var catches = proficiencyXp(fishId);
  if(lvl >= LEVEL_CAP) return {level:lvl, pct:100, current:catches, needed:0};
  var start = catchesForProficiencyLevel(lvl), end = catchesForProficiencyLevel(lvl+1);
  return {level:lvl, pct:Math.min(100, Math.floor(((catches-start)/Math.max(1,end-start))*100)), current:catches-start, needed:end-start};
}
export function proficiencySpeedMultiplier(fishId){
  var lvl = proficiencyLevel(fishId);
  // Each proficiency level adds 1% fishing speed.
  // Lv 1 = +1% speed; Lv 10 = +10%; Lv 99 = +99%.
  // Convert the speed bonus to a time multiplier so the catch duration
  // remains practical: +99% speed is about half the base time.
  return 1 / (1 + (lvl / 100));
}
