// ---------------------------------------------------------------------------
// game.js — Core play loop: character creation, HUD, the catch/quality roll,
// the recent-catch feed, selling & trophies, the cast animation, and the
// always-on auto-fishing loop.
// ---------------------------------------------------------------------------
// ---------- Character creation ----------
// Plain DOM lookups are safe at module top level (they don't touch any other
// module). Everything that immediately USES an imported value (building the
// swatches from OUTFIT_COLORS/HATS, or calling renderPlayer) is deferred into
// initCharacterCreationUI() below, which main.js calls only after every
// module has finished loading — see the note on buildProfXpTable in state.js
// for why that matters with this many modules importing each other.


import { playCatchSound, playCollectionSound, playLevelSound, playSellSound, playTrophySound, startWaterAmbience } from './audio.js';
import { BASE_CAST_MS, FISH, HATS, LEVEL_CAP, NO_BAIT_CAST_MS, OUTFIT_COLORS, baitById, baitForFish, equipmentById, equipmentForFish, levelForXp, logItemForFish, xpTable } from './data.js';
import { enterDock } from './menu.js';
import { renderPlayer, showCoinGain, showToast } from './render.js';
import { renderChallenges, renderInventoryList, renderLog, renderSkills, renderTrophyGrid } from './screens.js';
import { CATCH_HISTORY_LIMIT, addProficiencyXp, fishDisplayEmoji, floatForEntry, floatRarityText, formatFloat, nextCatchId, proficiencySpeedMultiplier, qualityInfo, rollQuality, saveState, sellPrice, starsForEntry, starsText, state } from './state.js';

export var swatchRow = document.getElementById('swatchRow');
export var hatRow = document.getElementById('hatRow');
export var nameInput = document.getElementById('nameInput');
export var startBtn = document.getElementById('startBtn');

export function initCharacterCreationUI(){
  OUTFIT_COLORS.forEach(function(c){
    var el = document.createElement('div');
    el.className = 'swatch' + (c.id===state.outfit ? ' selected' : '');
    el.style.background = c.hex; el.dataset.id = c.id;
    el.addEventListener('click', function(){
      state.outfit = c.id;
      var shirtMap={coral:'shirt_coral',teal:'shirt_teal',gold:'shirt_gold',purple:'shirt_lavender',ink:'shirt_ink'};
      if(shirtMap[c.id]) { state.shirt=shirtMap[c.id]; state.ownedCustomization.shirts[state.shirt]=true; }
      Array.prototype.forEach.call(swatchRow.children, function(s){ s.classList.remove('selected'); });
      el.classList.add('selected');
      renderPlayer(document.getElementById('previewPlayer'), false);
    });
    swatchRow.appendChild(el);
  });

  HATS.forEach(function(h){
    var el = document.createElement('div');
    el.className = 'hat-opt' + (h.id===state.hat ? ' selected' : '');
    el.dataset.id = h.id;
    el.innerHTML = '<span class="hat-icon">'+(h.icon || '—')+'</span><span>'+h.label+'</span>';
    el.addEventListener('click', function(){
      state.hat = h.id;
      if(state.ownedCustomization && state.ownedCustomization.hats) state.ownedCustomization.hats[h.id]=true;
      Array.prototype.forEach.call(hatRow.children, function(s){ s.classList.remove('selected'); });
      el.classList.add('selected');
      renderPlayer(document.getElementById('previewPlayer'), false);
    });
    hatRow.appendChild(el);
  });

  nameInput.addEventListener('input', function(){ startBtn.disabled = nameInput.value.trim().length === 0; });
  startBtn.addEventListener('click', function(){
    state.name = nameInput.value.trim();
    saveState();
    enterDock();
  });
  renderPlayer(document.getElementById('previewPlayer'), false);
}

// ---------- HUD ----------
export function totalFishCaught(){ var t=0; for(var k in state.caught){ if(state.caught.hasOwnProperty(k)) t+=state.caught[k]; } return t; }
export function playerLevel(){ return levelForXp(state.xp); }
export function currentEquipment(){
  // The equipped gear is authoritative. Never silently substitute Shrimp gear.
  return equipmentById(state.gear) || null;
}
export function currentBaitId(){
  var eq = currentEquipment() || equipmentById('shrimp_net');
  var bait = baitForFish(eq.fishId);
  return bait ? bait.id : null;
}
export function currentBaitCount(){ var id = currentBaitId(); return id ? (state.baitCounts[id] || 0) : 0; }
export function hasBait(){ return currentBaitCount() > 0; }

export function updateHud(){
  var lvl = playerLevel();
  var bait = baitById(currentBaitId());
  var baitCount = currentBaitCount();
  document.getElementById('fishCount').textContent = totalFishCaught();
  document.getElementById('coinCount').textContent = state.coins;
  document.getElementById('baitCornerIcon').textContent = baitCount > 0 && bait ? bait.icon : '🎣';
  var baitCountEl = document.getElementById('baitCornerCount');
  baitCountEl.textContent = baitCount > 0 ? baitCount : '0';
  baitCountEl.classList.toggle('low', baitCount <= 0);
  document.getElementById('levelNum').textContent = lvl;

  var xpAtLevel = xpTable[lvl];
  var xpAtNext = lvl < LEVEL_CAP ? xpTable[lvl+1] : xpAtLevel;
  var into = state.xp - xpAtLevel;
  var span = Math.max(1, xpAtNext - xpAtLevel);
  var pct = lvl >= LEVEL_CAP ? 100 : Math.min(100, Math.floor((into/span)*100));
  document.getElementById('xpBarFill').style.width = pct + '%';
  document.getElementById('xpLabel').textContent = lvl >= LEVEL_CAP
    ? state.xp + ' xp (max level)'
    : into + ' / ' + span + ' xp to Lv ' + (lvl+1);
}

export function updateGearCaption(){
  var cap = document.getElementById('gearCaption');
  var eq = currentEquipment() || equipmentById('shrimp_net');
  var bait = baitById(currentBaitId());
  var count = currentBaitCount();
  if(autoFishing){
    cap.textContent = count > 0
      ? 'Auto-fishing with '+eq.name.toLowerCase()+' and '+bait.name.toLowerCase()+'.'
      : 'Auto-fishing with '+eq.name.toLowerCase()+' — no matching bait, so it is slower.';
  } else if(count <= 0){
    cap.textContent = 'Using '+eq.name.toLowerCase()+' — no matching bait. It still catches '+fishById(eq.fishId).name.toLowerCase()+', just more slowly.';
  } else {
    cap.textContent = eq.name+' targets '+fishById(eq.fishId).name+'. Matching bait speeds up the catch.';
  }
}

export function renderBaitChips(){
  // Bait is now shown compactly in the top-right corner badge (see updateHud).
  // This stub remains so existing call sites don't need to change.
}

export function fishById(id){ for(var i=0;i<FISH.length;i++){ if(FISH[i].id===id) return FISH[i]; } return null; }
export function renderInventoryStrip(){
  var strip = document.getElementById('invStrip');
  var ids = Object.keys(state.caught);
  if(ids.length === 0){ strip.innerHTML = '<div class="inv-empty">Nothing caught yet — go fish!</div>'; return; }
  strip.innerHTML = '';
  ids.forEach(function(id){
    var f = fishById(id); if(!f) return;
    var chip = document.createElement('div'); chip.className = 'inv-chip';
    chip.innerHTML = '<span class="dot">'+fishDisplayEmoji(f)+'</span><span>'+f.name+' ×'+state.caught[id]+'</span>';
    strip.appendChild(chip);
  });
}
export function fishGlyph(){ return '🐟'; }
export function fishEmoji(fish){ return fishDisplayEmoji(fish); }
export var animationsEnabled = true;
export function setAnimationsEnabled(v){ animationsEnabled = v; }
export function levelUnlockText(level){
  var fish = null, eq = null, bait = null;
  for(var i=0;i<FISH.length;i++){ if(FISH[i].level === level){ fish = FISH[i]; break; } }
  if(fish){
    eq = equipmentForFish(fish.id);
    bait = baitForFish(fish.id);
    var parts = ['New fish: '+fish.name];
    if(eq) parts.push(eq.name);
    if(bait) parts.push(bait.name);
    return parts.join(' · ');
  }
  return '';
}
export function showCatchFeedback(fish, stars, float, xp, leveledUp, newLevel){
  if(!animationsEnabled) return;
  /* Use a body-level fixed layer. The old version lived inside the player and
     could be clipped/covered by the fishing result overlay. */
  var wrap = document.getElementById('screenEffects');
  if(!wrap){
    wrap = document.createElement('div');
    wrap.id = 'screenEffects';
    document.body.appendChild(wrap);
  }
  while(wrap.firstChild) wrap.removeChild(wrap.firstChild);

  var playerEl = document.querySelector('#dockPlayerWrap .player');
  var playerRect = playerEl ? playerEl.getBoundingClientRect() : null;
  if(!playerRect) return;

  /* Anchor the effect to the player's current on-screen position. */
  var anchorX = playerRect.left + playerRect.width / 2;
  var anchorY = playerRect.top + 2;
  wrap.style.left = '0px';
  wrap.style.top = '0px';

  var anchor = document.createElement('div');
  anchor.className = 'player-effects';
  anchor.style.left = anchorX + 'px';
  anchor.style.top = anchorY + 'px';
  wrap.appendChild(anchor);
  wrap = anchor;
  var catchFx = document.createElement('div');
  var q = qualityInfo(stars);
  var tier = stars >= 5 ? 'rating-max' : (stars >= 4 ? 'rating-high' : (stars >= 3 ? 'rating-mid' : ''));
  catchFx.className = 'fx-item fx-catch ' + tier;
  catchFx.style.color = q.color;
  catchFx.innerHTML = '<span class="fx-fish">'+fishDisplayEmoji(fish)+'</span><span>'+fish.name+' <span class="fx-rating">'+starsText(stars)+'</span></span>';
  wrap.appendChild(catchFx);

  var xpFx = document.createElement('div');
  xpFx.className = 'fx-item fx-xp';
  xpFx.textContent = '+'+xp+' XP';
  wrap.appendChild(xpFx);

  var burstCount = stars >= 4 ? 18 : (stars >= 3 ? 11 : (stars >= 2 ? 6 : 0));
  for(var i=0;i<burstCount;i++){
    var p = document.createElement('span');
    p.className = 'fx-particle';
    p.style.background = (i%2===0 ? q.color : 'var(--gold)');
    var angle = (Math.PI*2*i/burstCount) + (Math.random()*.4-.2);
    var distance = stars >= 4 ? 75+Math.random()*45 : 45+Math.random()*35;
    p.style.setProperty('--dx', Math.cos(angle)*distance+'px');
    p.style.setProperty('--dy', Math.sin(angle)*distance+'px');
    p.style.animationDelay = (Math.random()*.12)+'s';
    wrap.appendChild(p);
  }

  if(leveledUp){
    var levelFx = document.createElement('div');
    levelFx.className = 'fx-item fx-level';
    levelFx.textContent = 'LEVEL UP!  '+newLevel;
    wrap.appendChild(levelFx);
    var unlockText = levelUnlockText(newLevel);
    if(unlockText){
      var sub = document.createElement('div');
      sub.className = 'fx-level-sub';
      sub.textContent = 'UNLOCKED: ' + unlockText;
      wrap.appendChild(sub);
    }
    var fwColors=['#FFE48A','#FFFFFF','#8DEBFF','#D6A6FF','#FF9D7A'];
    for(var fw=0;fw<4;fw++){
      var burst=document.createElement('div');
      burst.className='fx-firework';
      burst.style.left=(25+fw*17)+'%';
      burst.style.top=(22+(fw%2)*12)+'%';
      burst.style.color=fwColors[fw%fwColors.length];
      burst.style.animationDelay=(fw*.32)+'s';
      for(var bi=0;bi<4;bi++) burst.appendChild(document.createElement('i'));
      wrap.appendChild(burst);
    }
  }
  setTimeout(function(){
    var screen = document.getElementById('screenEffects');
    if(screen) screen.innerHTML = '';
  }, leveledUp ? 5200 : 2700);
}

// ---------- Catch rolling ----------
export function eligibleFish(){
  var eq = currentEquipment();
  if(!eq) return [];
  var lvl = playerLevel();
  var target = fishById(eq.fishId);
  if(!target || target.level > lvl) return [];
  return [target];
}
export function rollFish(){
  // Exactly one fish per completed cast, and it MUST be the species targeted
  // by the equipment currently equipped. There is intentionally no fallback.
  var eq = currentEquipment();
  if(!eq) return null;
  var target = fishById(eq.fishId);
  if(!target || target.level > playerLevel()) return null;
  return target;
}

export function castDurationMs(fish){
  var base = currentBaitCount() > 0 ? BASE_CAST_MS : NO_BAIT_CAST_MS;
  return Math.round(base * proficiencySpeedMultiplier(fish ? fish.id : 'shrimp'));
}

export function grantFish(fish){
  var beforeLevel = playerLevel();
  var quality = rollQuality();
  var stars = quality.stars;
  var fl = quality.float;
  state.xp += fish.xp;
  addProficiencyXp(fish.id, fish.xp);
  state.caught[fish.id] = (state.caught[fish.id]||0) + 1;
  var newCatchId = nextCatchId();
  state.inventory.unshift({catchId: newCatchId, fishId: fish.id, stars: stars, float: fl, status:'kept'});
  var catchRecord = {catchId:newCatchId, fishId:fish.id, stars:stars, float:fl, xp:fish.xp, timestamp:Date.now()};
  state.catchHistory.unshift(catchRecord);
  // Cap the log so long/idle play sessions don't grow this array (and the
  // localStorage payload it's saved in) without bound. Record-holder
  // catches are looked up with a graceful fallback elsewhere, so trimming
  // old entries here is safe.
  if(state.catchHistory.length > CATCH_HISTORY_LIMIT) state.catchHistory.length = CATCH_HISTORY_LIMIT;
  refreshRecentCatches();
  

  if(state.records.bestFishId === null || fl < state.records.bestFloat){
    state.records.bestFloat = fl;
    state.records.bestStars = stars;
    state.records.bestFishId = fish.id;
    state.records.bestCatchId = newCatchId;
  }
  if(state.records.perSpeciesFloat[fish.id] == null || fl < state.records.perSpeciesFloat[fish.id]){
    state.records.perSpeciesFloat[fish.id] = fl;
    state.records.perSpeciesStars[fish.id] = stars;
    state.records.perSpeciesCatchId[fish.id] = newCatchId;
  }

  var logItem = logItemForFish(fish.id);
  if(logItem && Math.random() < logItem.chance){
    var isNewLogItem = !state.collectionLog[logItem.id];
    state.collectionLog[logItem.id] = (state.collectionLog[logItem.id]||0) + 1;
    setTimeout(function(){
      playCollectionSound();
      showToast((isNewLogItem ? 'New collection log item! ' : 'Found another ') + logItem.icon + ' ' + logItem.name + '.');
    }, isNewLogItem ? 1400 : 1100);
  }

  saveState();
  updateHud(); updateGearCaption(); renderInventoryStrip(); renderBaitChips(); renderCatchFeed();
  // Keep the Skills/Log/Challenges pages live if the player is currently viewing them.
  var skillsScreen = document.getElementById('screen-skills');
  if(skillsScreen && skillsScreen.classList.contains('active')) renderSkills();
  var logScreen = document.getElementById('screen-log');
  if(logScreen && logScreen.classList.contains('active')) renderLog();
  var challengesScreen = document.getElementById('screen-challenges');
  if(challengesScreen && challengesScreen.classList.contains('active')) renderChallenges();
  var afterLevel = playerLevel();
  var leveledUp = afterLevel > beforeLevel;
  showCatchFeedback(fish, stars, fl, fish.xp, leveledUp, afterLevel);
  playCatchSound(stars);
  if(leveledUp){
    playLevelSound();
    showToast('Level up! Fishing level ' + afterLevel + '.');
  }
  if(stars >= 4){
    setTimeout(function(){ showToast('Trophy catch! That '+fish.name+' was '+starsText(stars)+' with a '+fl.toFixed(6)+' float.'); }, 700);
  }
  return {leveledUp: leveledUp, stars: stars, float: fl};
}

// ---------- Recent catch feed ----------
export function refreshRecentCatches(){
  // Build a lookup of kept catchIds once (O(inventory)) instead of calling
  // .some() over the whole inventory for every entry in catchHistory
  // (that was O(history × inventory) and ran on every single catch).
  var keptIds = Object.create(null);
  for(var i=0;i<state.inventory.length;i++){
    var e = state.inventory[i];
    if(e.status === 'kept') keptIds[e.catchId] = true;
  }
  var history = state.catchHistory || [], recent = [];
  for(var j=0;j<history.length && recent.length<5;j++){
    if(keptIds[history[j].catchId]) recent.push(history[j]);
  }
  state.recentCatches = recent;
}

export function renderCatchFeed(){
  refreshRecentCatches();
  var list = document.getElementById('catchFeedList');
  if(!list) return;
  if(!state.recentCatches.length){ list.innerHTML='<div class="catch-feed-empty">No catches yet.</div>'; return; }
  list.innerHTML='';
  state.recentCatches.forEach(function(rec){
    var f=fishById(rec.fishId); if(!f) return;
    var stars=starsForEntry(rec), q=qualityInfo(stars), price=sellPrice(f,rec);
    var row=document.createElement('div'); row.className='catch-feed-row';
    row.innerHTML='<span class="catch-feed-icon" style="color:'+q.color+';">'+fishDisplayEmoji(f)+'</span>'+
      '<span class="catch-feed-main"><strong>'+f.name+'</strong><small style="color:'+q.color+';">'+starsText(stars)+' · '+price+' ⛃</small></span>'+
      '<span class="catch-feed-actions"><button class="catch-quick-sell" type="button">Quick sell</button></span>';
    row.addEventListener('click',function(){ inspectRecentCatch(rec); });
    var quick=row.querySelector('.catch-quick-sell');
    var quickStars = starsForEntry(rec);
    quick.disabled=quickStars===5;
    quick.title=quick.disabled?'5-star catches cannot be quick sold.':'';
    quick.addEventListener('click',function(ev){ ev.stopPropagation(); if(starsForEntry(rec)!==5) sellRecentCatch(rec.catchId); });
    list.appendChild(row);
  });
  // Not saving state here: every call site already saves right before
  // calling renderCatchFeed(), so this was a second redundant
  // JSON.stringify + localStorage write on every single catch.
}

export function removeRecentCatch(catchId){
  refreshRecentCatches();
  saveState();
  renderCatchFeed();
}

var resumeFishingOnClose = false;
export function closeCatchInspect(){
  var modal = document.getElementById('catchInspect');
  if(modal){ modal.classList.remove('active'); modal.classList.remove('locked'); }
  if(resumeFishingOnClose){ resumeFishingOnClose = false; startAutoFish(); }
}

export function inspectRecentCatch(rec, exceptional){
  var f=fishById(rec.fishId); if(!f) return;
  var stars=starsForEntry(rec), q=qualityInfo(stars), price=sellPrice(f,rec), fl=floatForEntry(rec);
  var modal=document.getElementById('catchInspect'), body=document.getElementById('catchInspectBody');
  body.innerHTML=(exceptional ? '<div style="font-size:11px;font-weight:900;letter-spacing:1.5px;color:'+q.color+';margin-bottom:8px;">'+(stars===5?'LEGENDARY CATCH!':'GREAT CATCH!')+'</div>' : '')+'<div class="inspect-fish" style="color:'+q.color+';">'+fishDisplayEmoji(f)+'</div>'+
    '<div class="rarity-tag" style="background:'+q.color+'26;color:'+q.color+';">'+q.label+'</div>'+
    '<h3>'+f.name+'</h3>'+
    '<div class="inspect-stars" style="color:'+q.color+';">'+starsText(stars)+'</div>'+
    '<div class="inspect-rating" style="color:'+q.color+';">'+q.label+'</div>'+
    '<div class="inspect-float">Float: '+fl.toFixed(4)+' · Rarity: '+floatRarityText(rec)+'</div>'+
    '<p>'+f.flavor+'</p>'+
    '<div class="inspect-stats"><span>Fishing XP <b>+'+f.xp+'</b></span><span>Value <b>'+price+' ⛃</b></span></div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'+
    '<button class="btn-secondary" id="inspectTrophyBtn">🏆 Trophy</button>'+
    '<button class="btn-primary" id="inspectSellBtn" style="margin-top:0;">Sell '+price+' ⛃</button></div>'+
    '<button class="btn-secondary" id="closeCatchInspect" style="width:100%;margin-top:10px;">'+(exceptional ? 'Keep in bucket' : 'Keep')+'</button>';
  modal.classList.toggle('locked', !!exceptional);
  if(exceptional) resumeFishingOnClose = true;
  modal.classList.add('active');
  document.getElementById('closeCatchInspect').addEventListener('click',closeCatchInspect);
  document.getElementById('inspectSellBtn').addEventListener('click',function(){sellRecentCatch(rec.catchId);});
  document.getElementById('inspectTrophyBtn').addEventListener('click',function(){trophyRecentCatch(rec.catchId);});
}

export function sellRecentCatch(catchId){
  var idx = state.inventory.findIndex(function(e){ return e.catchId === catchId; });
  if(idx === -1){ closeCatchInspect(); removeRecentCatch(catchId); return; }
  var entry = state.inventory[idx];
  var f = fishById(entry.fishId);
  if(!f) return;
  var price = sellPrice(f, entry);
  state.coins += price;
  state.inventory.splice(idx, 1);
  removeRecentCatch(catchId);
  saveState();
  updateHud();
  showCoinGain(price);
  playSellSound();
  renderInventoryStrip();
  renderInventoryList();
  closeCatchInspect();
  showToast('Sold '+f.name+' for '+price+' coins.');
}

export function trophyRecentCatch(catchId){
  var entry = state.inventory.find(function(e){ return e.catchId === catchId; });
  if(!entry){ closeCatchInspect(); removeRecentCatch(catchId); return; }
  entry.status = 'trophy';
  removeRecentCatch(catchId);
  saveState();
  renderInventoryStrip();
  renderInventoryList();
  renderTrophyGrid();
  closeCatchInspect();
  playTrophySound();
  showToast('Added '+fishById(entry.fishId).name+' to the trophy room.');
}

export function inspectInventoryEntry(entry){
  if(!entry) return;
  var f=fishById(entry.fishId);
  if(!f) return;
  var stars=starsForEntry(entry), q=qualityInfo(stars), price=sellPrice(f,entry), fl=floatForEntry(entry);
  var body=document.getElementById('catchInspectBody');
  body.innerHTML='<div class="inspect-fish" style="color:'+q.color+';">'+fishDisplayEmoji(f)+'</div>'+
    '<h3>'+f.name+'</h3>'+
    '<div class="inspect-stars" style="color:'+q.color+';">'+starsText(stars)+'</div>'+
    '<div class="inspect-rating" style="color:'+q.color+';">'+q.label+'</div>'+
    '<div class="inspect-float">Float: '+fl.toFixed(4)+' · Rarity: '+floatRarityText(entry)+'</div>'+
    '<div class="inspect-stats"><span>Fishing XP <b>+'+f.xp+'</b></span><span>Value <b>'+price+' ⛃</b></span></div>'+
    '<div class="inspect-actions">'+
    '<button class="btn-secondary" id="inspectCloseBtn">Close</button>'+
    (entry.status==='kept' ? '<button class="btn-secondary" id="inspectTrophyBtn">🏆 Trophy</button>' : '')+
    '<button class="btn-primary" id="inspectSellBtn">Sell '+price+' ⛃</button></div>';
  document.getElementById('catchInspect').classList.add('active');
  document.getElementById('inspectCloseBtn').addEventListener('click',closeCatchInspect);
  document.getElementById('inspectSellBtn').addEventListener('click',function(){
    if(entry.status==='trophy') sellTrophy(entry.catchId); else sellEntry(entry.catchId);
    closeCatchInspect();
  });
  var trophyBtn=document.getElementById('inspectTrophyBtn');
  if(trophyBtn) trophyBtn.addEventListener('click',function(){ trophyEntry(entry.catchId); });
}

// ---------- Selling / trophy actions ----------
export function sellEntry(catchId){
  var idx = state.inventory.findIndex(function(e){ return e.catchId === catchId; });
  if(idx === -1) return;
  var entry = state.inventory[idx];
  var f = fishById(entry.fishId);
  var price = sellPrice(f, entry);
  state.coins += price;
  state.inventory.splice(idx, 1);
  removeRecentCatch(catchId);
  saveState(); updateHud();
  showCoinGain(price);
  playSellSound();
  renderCatchFeed();
  showToast('Sold '+f.name+' for '+price+' coins.');
  renderInventoryList();
}
export function trophyEntry(catchId){
  var entry = state.inventory.find(function(e){ return e.catchId === catchId; });
  if(!entry) return;
  entry.status = 'trophy';
  saveState();
  playTrophySound();
  showToast('Added to the trophy room.');
  renderInventoryList();
}
export function sellAllKept(){
  var kept = state.inventory.filter(function(e){ return e.status === 'kept' && starsForEntry(e) !== 5; });
  if(kept.length === 0){ showToast('Nothing eligible to sell. 5-star fish are protected.'); return; }
  var total = 0;
  kept.forEach(function(entry){ total += sellPrice(fishById(entry.fishId), entry); });
  var keptIds = {}; kept.forEach(function(entry){ keptIds[entry.catchId] = true; });
  state.inventory = state.inventory.filter(function(e){ return !keptIds[e.catchId]; });
  kept.forEach(function(entry){ removeRecentCatch(entry.catchId); });
  state.coins += total;
  saveState(); updateHud();
  showCoinGain(total);
  playSellSound();
  showToast('Sold '+kept.length+' fish for '+total+' coins.');
  renderCatchFeed();
  renderInventoryList();
  renderInventoryStrip();
}
export function sellTrophy(catchId){
  var idx = state.inventory.findIndex(function(e){ return e.catchId === catchId; });
  if(idx === -1) return;
  var entry = state.inventory[idx];
  var f = fishById(entry.fishId);
  var price = sellPrice(f, entry);
  state.coins += price;
  state.inventory.splice(idx, 1);
  saveState(); updateHud();
  showCoinGain(price);
  playSellSound();
  showToast('Sold trophy '+f.name+' for '+price+' coins.');
  renderTrophyGrid();
}

// ---------- Cast animation ----------
export function playCastAnimation(){
  var rod = document.getElementById('playerRod');
  var lure = document.getElementById('castLure');
  var ripple = document.getElementById('ripple');
  var eq = equipmentById(state.gear) || equipmentById('shrimp_net');
  var isPole = eq.type !== 'net' && eq.type !== 'trap';
  if(rod){ rod.classList.remove('casting','line-out','bob'); void rod.offsetWidth; rod.classList.add('casting'); }
  if(lure){ lure.classList.remove('flying','parked'); lure.style.opacity = isPole ? '' : '0'; if(isPole){ void lure.offsetWidth; lure.classList.add('flying'); } }
  if(ripple){ setTimeout(function(){ ripple.classList.remove('show'); void ripple.offsetWidth; ripple.classList.add('show'); }, isPole ? 320 : 500); }
  setTimeout(function(){
    if(rod){ rod.classList.remove('casting'); if(isPole) rod.classList.add('line-out','bob'); }
    if(lure){ if(isPole) lure.classList.add('parked'); else { lure.classList.remove('parked','flying'); lure.style.opacity='0'; } }
  }, isPole ? 500 : 850);
}
export function parkRodIdle(){
  var rod = document.getElementById('playerRod');
  var lure = document.getElementById('castLure');
  if(rod) rod.classList.remove('line-out','bob','casting');
  lure.classList.remove('flying','parked'); lure.style.opacity = 0;
}

// ---------- Fishing is now always-on auto-fishing; no manual cast ----------

// ---------- Auto-fishing (single authoritative cast loop) ----------
// One cast has exactly one completion timer and exactly one award token.
// There is intentionally no polling loop, animation-frame loop, or second
// catch path.  This keeps fishing deterministic: one cast -> one fish.
export var autoFishing = false;
export var autoFishTimer = null;
export var autoFishStatusText = document.getElementById('autoFishStatusText');
export var autoFishCountText = document.getElementById('autoFishCountText');
export var autoFishProgressFill = document.getElementById('autoFishProgressFill');
export var fishingSessionId = 0;
export var activeCastId = 0;
export var awardedCastKey = '';
export var castActive = false;

export function clearFishingTimer(){
  if(autoFishTimer !== null){
    clearTimeout(autoFishTimer);
    autoFishTimer = null;
  }
}

export function startAutoFish(){
  if(autoFishing) return;
  var eq = currentEquipment();
  if(!eq) return;
  autoFishing = true;
  fishingSessionId++;
  awardedCastKey = '';
  castActive = false;
  updateGearCaption();
  queueNextCast(fishingSessionId, 0);
}

export function stopAutoFish(){
  autoFishing = false;
  fishingSessionId++;
  activeCastId++;
  awardedCastKey = '';
  castActive = false;
  clearFishingTimer();
  parkRodIdle();
  if(autoFishProgressFill){
    autoFishProgressFill.style.transition = 'none';
    autoFishProgressFill.style.width = '0%';
  }
  updateGearCaption();
}

// Clicking the fishing scene toggles auto-fishing. A click while fishing
// pauses immediately; the next click resumes a fresh cast.
document.getElementById('dockScene').addEventListener('click', function(){
  if(autoFishing || castActive){
    stopAutoFish();
    autoFishStatusText.textContent = 'Paused — click to resume';
    autoFishCountText.textContent = '';
  } else {
    startAutoFish();
  }
  startWaterAmbience();
});

export function queueNextCast(sessionId, delay){
  clearFishingTimer();
  if(!autoFishing || sessionId !== fishingSessionId) return;
  autoFishTimer = setTimeout(function(){
    autoFishTimer = null;
    beginSingleCast(sessionId);
  }, Math.max(0, delay || 0));
}

export function beginSingleCast(sessionId){
  if(!autoFishing || sessionId !== fishingSessionId) return;

  // There can never be two active casts.  A new cast is only created after
  // the previous cast has already awarded its one fish.
  if(castActive) return;

  // Snapshot equipment at cast start. This cast can ONLY catch this species.
  var eq = currentEquipment();
  var fish = eq ? fishById(eq.fishId) : null;
  if(!fish || fish.level > playerLevel()){
    stopAutoFish();
    return;
  }

  var castId = ++activeCastId;
  var castKey = sessionId + ':' + castId;
  awardedCastKey = castKey;
  castActive = true;

  if(currentBaitCount() > 0){
    state.baitCounts[currentBaitId()] -= 1;
    saveState();
  }
  updateHud();
  playCastAnimation();

  var duration = castDurationMs(fish);
  autoFishStatusText.textContent = 'Line\'s out…';
  autoFishCountText.textContent = '';
  if(autoFishProgressFill){
    autoFishProgressFill.style.transition = 'none';
    autoFishProgressFill.style.width = '0%';
    void autoFishProgressFill.offsetWidth;
    autoFishProgressFill.style.transition = 'width '+duration+'ms linear';
    autoFishProgressFill.style.width = '100%';
  }

  // THE ONLY place a cast can finish. No interval, RAF, animation callback,
  // or other timer is allowed to award a fish.
  autoFishTimer = setTimeout(function(){
    autoFishTimer = null;

    if(!autoFishing || sessionId !== fishingSessionId) return;
    if(awardedCastKey !== castKey) return;

    // Consume the token BEFORE grantFish(). If anything inside grantFish()
    // causes another callback synchronously, it still cannot award this cast.
    awardedCastKey = '';
    castActive = false;

    var result = grantFish(fish);
    var q = qualityInfo(result.stars);
    autoFishStatusText.innerHTML = 'Caught a ' + fish.name + ' <span style="color:'+q.color+';">('+starsText(result.stars)+' · '+q.label+')</span>';
    autoFishCountText.innerHTML = '<span style="color:'+q.color+';">+'+fish.xp+' xp</span>';
    if(autoFishProgressFill) autoFishProgressFill.style.width = '100%';

    if(result.stars >= 4){
      autoFishing = false;
      fishingSessionId++;
      activeCastId++;
      clearFishingTimer();
      parkRodIdle();
      setTimeout(function(){
        var latest = state.catchHistory && state.catchHistory[0];
        if(latest) inspectRecentCatch(latest, true);
      }, 180);
      return;
    }

    // Only after the single fish has been awarded do we schedule the next cast.
    queueNextCast(sessionId, 550);
  }, duration);
}

