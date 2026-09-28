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


import { playBigOneHitSound, playBigOneMissSound, playBigOneMissTickSound, playBigOneSound, playBigOneWinSound, playBuySound, playCatchSound, playLevelSound, playMythicFoundSound, playSellSound, playTrophySound, playUniqueFoundSound, startWaterAmbience } from './audio.js';
import { BACKGROUNDS, BASE_CAST_MS, BIG_ONE_CHANCE, BIG_ONE_UNIQUE_BONUS_CHANCE, CLOTHING_SLOTS, CONSUMABLES, FISH, HATS, LEVEL_CAP, NO_BAIT_CAST_MS, OUTFIT_COLORS, SHACK_TIERS, TRINKET_SLOTS, backgroundById, baitById, baitForFish, bigOneDifficultyForFish, bigOneLogItemForFish, clothingItems, consumableById, equipmentById, equipmentForFish, isBackgroundUnlocked, levelForXp, logItemForFish, mythicLogItemsForFish, nextShackTier, shackDecorById, shackTierInfo, trinketById, trinketItems, universalLogItems, xpTable } from './data.js';
import { enterDock } from './menu.js';
import { renderPlayer, showCoinGain, showToast, updatePlayerBuffAccessories } from './render.js';
import { renderChallenges, renderInventoryList, renderLog, renderSkills, renderTrophyGrid } from './screens.js';
import { CATCH_HISTORY_LIMIT, buffRemainingMs, fishDisplayEmoji, floatForEntry, floatRarityText, formatFloat, isBuffActive, nextCatchId, proficiencyLevel, proficiencyProgress, proficiencySpeedMultiplier, qualityInfo, rollQuality, saveState, sellPrice, starsForEntry, starsText, state } from './state.js';

// Fishing levels that get the extended "milestone" level-up fanfare instead
// of the regular one (see playLevelSound in audio.js).
var LEVEL_MILESTONES = [10, 25, 50, 75, 99];

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
var STORAGE_NAMES = ['Pockets','Snack tray','Wobbly basket','Fancy cooler','Fish tote','Rolling fish cart','Tiny fish wagon','Dockside locker','Suspiciously large basket','Portable fish shed','Harbor locker','Angler trunk','Boat box','Captain\'s chest','Sea pantry','Floating fish closet','Harbor warehouse','Dock warehouse','Fish depot','Aquatic vault'];
// Fish/equipment tiers unlock at clean multiples of 5 (Lv 5, 10, 15, ... 90).
// This used to be Math.floor((playerLevel()-1)/5), which unlocked each
// storage tier one level AFTER its matching equipment tier (Lv 6, 11, 16...
// instead of 5, 10, 15) -- so a level-up into new gear never had the
// matching storage tier available yet. Math.floor(playerLevel()/5) lines
// the two up: storage tier N unlocks at the same level as equipment tier N.
export function storageUnlockedTier(){ return Math.floor(playerLevel()/5); }
export function storageUpgradeLevel(){ return Math.min(Math.max(0,Number(state.storageTier)||0),storageUnlockedTier()); }
export function storageCapacity(){ return 25 + storageUpgradeLevel()*5; }
export function storageNameForTier(tier){ return STORAGE_NAMES[Math.min(Math.max(0,tier||0),STORAGE_NAMES.length-1)]; }
export function storageName(){ return storageNameForTier(storageUpgradeLevel()); }
// Tiers 0-12 are the original 100*(tier+1)^2 curve, left untouched because
// they already track income well. Tiers 13-19 unlock so late (Lv 66-96) that
// the quadratic formula would leave them under 1% of a player's coin stack;
// these are hand-set to keep pace with how fast late-game income compounds.
var STORAGE_COSTS = [100,400,900,1600,2500,3600,4900,6400,8100,10000,12100,14400,16900,30000,53000,93000,165000,290000,505000,860000];
export function storageCostForTier(tier){ return STORAGE_COSTS[Math.min(Math.max(0,tier),STORAGE_COSTS.length-1)]; }
export function storageUpgradeCost(){ return storageCostForTier(storageUpgradeLevel()); }
export function keptFishCount(){ return state.inventory.filter(function(entry){ return entry.status === 'kept'; }).length; }
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

// Quick-Buy Bait upgrade (see UPGRADES in data.js): tapping the bait counter
// in the dock scene buys one pack (5 bait) of whatever bait matches the
// currently equipped gear, at the same packCost as the Bait shop tab.
export function quickBuyBait(){
  if(!state.upgrades.quick_buy_bait){
    showToast('Buy the Quick-Buy Bait upgrade first.');
    return false;
  }
  var bait = baitById(currentBaitId());
  if(!bait) return false;
  if(state.coins < bait.packCost){
    showToast('Not enough coins for '+bait.name.toLowerCase()+'.');
    return false;
  }
  state.coins -= bait.packCost;
  state.baitCounts[bait.id] = (state.baitCounts[bait.id] || 0) + bait.packAmount;
  saveState();
  updateHud();
  playBuySound();
  showToast('Bought '+bait.packAmount+' '+bait.name.toLowerCase()+'.');
  return true;
}

export function updateHud(){
  var lvl = playerLevel();
  var bait = baitById(currentBaitId());
  var baitCount = currentBaitCount();
  document.getElementById('fishCount').textContent = totalFishCaught();
  document.getElementById('coinCount').textContent = state.coins;

  var baitCountEl = document.getElementById('baitCornerCount');
  var baitPillEl = document.getElementById('sceneBaitCount');
  if(baitCountEl) baitCountEl.textContent = baitCount;
  if(baitPillEl){
    baitPillEl.classList.toggle('low', baitCount <= 0);
    var canQuickBuy = !!state.upgrades.quick_buy_bait;
    baitPillEl.classList.toggle('buyable', canQuickBuy);
    baitPillEl.title = bait
      ? (canQuickBuy
          ? 'Tap to buy 5 '+bait.name.toLowerCase()+' for '+bait.packCost+' ⛃'
          : bait.name+' — '+baitCount+' remaining')
      : '';
  }

  var storageCountEl = document.getElementById('sceneStorageCount');
  if(storageCountEl) storageCountEl.textContent = keptFishCount()+' / '+storageCapacity();
  var storageProp = document.getElementById('dockBucket');
  if(storageProp){
    storageProp.className = 'dock-bucket storage-tier-'+Math.min(storageUpgradeLevel(),19);
    storageProp.title = storageName();
  }
  var efficiencyLabel = document.getElementById('fishEfficiencyLabel');
  var efficiencyFill = document.getElementById('fishEfficiencyFill');
  var efficiencyFish = fishById((currentEquipment() || {}).fishId);
  if(efficiencyFish && efficiencyLabel && efficiencyFill){
    var efficiencyLevel = proficiencyLevel(efficiencyFish.id);
    var efficiencyProgress = proficiencyProgress(efficiencyFish.id);
    var efficiency = Math.round((1 - proficiencySpeedMultiplier(efficiencyFish.id))*100);
    efficiencyLabel.textContent = efficiencyFish.name+' efficiency · Lv '+efficiencyLevel+' · '+(efficiency ? efficiency+'% faster' : 'base speed');
    efficiencyFill.style.width = efficiencyProgress.pct+'%';
  }
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

  var fishLevelLabel = document.getElementById('fishLevelLabel');
  var fishLevelFill = document.getElementById('fishLevelFill');
  if(fishLevelLabel && fishLevelFill){
    fishLevelLabel.textContent = lvl >= LEVEL_CAP
      ? 'Fishing level ' + lvl + ' · MAX'
      : 'Fishing level ' + lvl + ' · ' + into + '/' + span + ' xp';
    fishLevelFill.style.width = pct + '%';
  }
  renderConsumablesRow();
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
  // The popup's CSS animation is authored for a fixed 2.2-2.75s (see
  // .fx-catch in style.css), but at high fishing speed a cast can complete
  // in well under a second (see castDurationMs() -- speed bonuses alone can
  // cut it to 10% of base). The very next catch used to instantly wipe
  // whatever was still mid-animation, so the faster you fished the less of
  // the popup you actually got to see, down to almost nothing at endgame
  // speeds. Scaling the popup's own lifetime to the current cast duration
  // means it always finishes its fade-out on its own instead of getting cut
  // off -- just quicker when you're fishing quicker, never abruptly gone.
  var castMs = castDurationMs(fish);
  var lifeMs = leveledUp ? 5200 : Math.max(650, Math.min(2700, castMs - 150));
  var xpLifeMs = Math.min(1050, lifeMs);
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
  catchFx.style.animationDuration = (lifeMs/1000)+'s';
  catchFx.innerHTML = '<span class="fx-fish">'+fishDisplayEmoji(fish)+'</span><span>'+fish.name+' <span class="fx-rating">'+starsText(stars)+'</span></span>';
  wrap.appendChild(catchFx);

  var xpFx = document.createElement('div');
  xpFx.style.animationDuration = (xpLifeMs/1000)+'s';
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
  }, lifeMs);
}
var resumeAfterRareCard = false;
function rareLayer(){
  var layer = document.getElementById('rareFeedbackLayer');
  if(!layer){ layer = document.createElement('div'); layer.id = 'rareFeedbackLayer'; document.body.appendChild(layer); }
  return layer;
}
// Big-catch cards stay up until the player closes them; extra cards queue behind the first.
function dismissRareCard(card){
  card.remove();
  var layer = document.getElementById('rareFeedbackLayer');
  if(resumeAfterRareCard && !(layer && layer.querySelector('.rare-persist'))){
    resumeAfterRareCard = false;
    startAutoFish();
  }
}
export function showMegaRareFeedback(item, fish, isNew){
  var layer = rareLayer();
  var reveal = document.createElement('div');
  reveal.className = 'mega-rare-reveal rare-persist';
  reveal.innerHTML = '<div class="mega-rare-spark">✦</div><div class="mega-rare-kicker">MEGA RARE FIND</div><div class="mega-rare-icon">'+item.icon+'</div><div class="mega-rare-name">'+item.name+'</div><div class="mega-rare-source">Found while fishing for '+fish.name+'</div>'+
    '<div class="rare-actions"><button class="btn-secondary rare-close" type="button">Nice!</button></div>';
  layer.appendChild(reveal);
  for(var i=0;i<28;i++){
    var particle = document.createElement('span');
    particle.className = 'mega-rare-particle';
    particle.style.setProperty('--mega-x', Math.cos(Math.PI*2*i/28)*(90+Math.random()*150)+'px');
    particle.style.setProperty('--mega-y', Math.sin(Math.PI*2*i/28)*(70+Math.random()*120)+'px');
    particle.style.animationDelay = (Math.random()*.18)+'s';
    reveal.appendChild(particle);
  }
  reveal.querySelector('.rare-close').addEventListener('click', function(){ dismissRareCard(reveal); });
  if(item.mythic) playMythicFoundSound(isNew); else playUniqueFoundSound(isNew);
}
export function showLegendaryFeedback(fish, stars, float, catchId){
  var layer = rareLayer();
  var reveal = document.createElement('div');
  reveal.className = 'legendary-reveal rare-persist';
  var quality = qualityInfo(stars);
  var entry = null;
  for(var i=0;i<state.inventory.length;i++){ if(state.inventory[i].catchId === catchId){ entry = state.inventory[i]; break; } }
  var price = entry ? sellPrice(fish, entry) : 0;
  reveal.innerHTML = '<div class="legendary-kicker">'+quality.label.toUpperCase()+' CATCH</div><div class="legendary-icon">'+fishDisplayEmoji(fish)+'</div><div class="legendary-name">'+fish.name+'</div><div class="legendary-stars">'+starsText(stars)+'</div><div class="legendary-details">Float '+formatFloat({float:float})+' · '+quality.label+' · Rarity '+floatRarityText({float:float})+'</div>'+
    (entry
      ? '<div class="rare-actions"><button class="btn-secondary" data-act="trophy" data-soundless="true" type="button">🏆 Trophy</button><button class="btn-primary" data-act="sell" data-soundless="true" type="button">Sell '+price+' ⛃</button><button class="btn-secondary rare-close" data-act="keep" type="button">Keep in bucket</button></div>'
      : '<div class="rare-actions"><button class="btn-secondary rare-close" data-act="keep" type="button">Close</button></div>');
  layer.appendChild(reveal);
  resumeAfterRareCard = true;
  var sellArmed = false;
  reveal.addEventListener('click', function(ev){
    var btn = ev.target.closest ? ev.target.closest('button[data-act]') : null;
    if(!btn) return;
    var act = btn.getAttribute('data-act');
    if(act === 'sell'){
      if(stars >= 5 && !sellArmed){ sellArmed = true; btn.textContent = 'Tap again to sell'; return; }
      sellRecentCatch(catchId);
    } else if(act === 'trophy'){
      trophyRecentCatch(catchId);
    }
    dismissRareCard(reveal);
  });
}
export function animateFishToBucket(fish, stars){
  if(!animationsEnabled) return;
  var scene=document.getElementById('dockScene'), bucket=document.getElementById('dockBucket');
  if(!scene || !bucket) return;
  var sceneRect=scene.getBoundingClientRect(), bucketRect=bucket.getBoundingClientRect();
  var sourceRect={left:sceneRect.left+sceneRect.width/2+72, top:sceneRect.top+sceneRect.height-64, width:6, height:6};
  var particleColors={
    1:['#9AA0A6'],
    2:['#58B86A','#9FE08C'],
    3:['#4A90E2','#8DEBFF','#FFFFFF'],
    4:['#A05BEA','#D6A6FF','#8DEBFF','#FFFFFF'],
    5:['#D9A441','#FFE48A','#FFFFFF','#FF9D7A','#8DEBFF']
  }[Math.max(1,Math.min(5,stars||1))];
  var particleCount=stars>=5 ? 18 : (stars>=4 ? 13 : (stars>=3 ? 9 : (stars>=2 ? 6 : 4)));
  for(var i=0;i<particleCount;i++){
    var particle=document.createElement('span');
    particle.className='catch-flight-particle';
    particle.style.left=(sourceRect.left+sourceRect.width/2-3)+'px';
    particle.style.top=(sourceRect.top+sourceRect.height/2-3)+'px';
    particle.style.background=particleColors[i%particleColors.length];
    var angle=(Math.PI*2*i/particleCount)+(Math.random()*.4-.2), distance=18+Math.random()*26;
    particle.style.setProperty('--particle-x',Math.cos(angle)*distance+'px');
    particle.style.setProperty('--particle-y',Math.sin(angle)*distance+'px');
    particle.style.animationDelay=(Math.random()*.08)+'s';
    document.body.appendChild(particle);
    setTimeout(function(el){ return function(){ el.remove(); }; }(particle),520);
  }
  var fishEl=document.createElement('span');
  fishEl.className='catch-fish-flight';
  fishEl.textContent=fishDisplayEmoji(fish);
  fishEl.style.left=(sourceRect.left+sourceRect.width/2-10)+'px';
  fishEl.style.top=(sourceRect.top+sourceRect.height/2-10)+'px';
  document.body.appendChild(fishEl);
  var endX=bucketRect.left+bucketRect.width/2-10, endY=bucketRect.top+bucketRect.height/2-10;
  var midX=(endX-parseFloat(fishEl.style.left))*.5, midY=(endY-parseFloat(fishEl.style.top))*.5-70;
  var flight=fishEl.animate([
    {transform:'translate(0,0) rotate(-18deg) scale(.8)',opacity:1},
    {transform:'translate('+midX+'px,'+(midY-40)+'px) rotate(18deg) scale(1.2)',opacity:1,offset:.45},
    {transform:'translate('+(endX-parseFloat(fishEl.style.left))+'px,'+(endY-parseFloat(fishEl.style.top))+'px) rotate(360deg) scale(.8)',opacity:0}
  ],{duration:1500,easing:'cubic-bezier(.2,.8,.35,1)'});
  flight.onfinish=function(){ fishEl.remove(); bucket.classList.remove('bucket-hit'); void bucket.offsetWidth; bucket.classList.add('bucket-hit'); };
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

// ---------- Mythic clothing ----------
// state.equippedClothing looks like {hat:'mythic_shrimp_hat', shirt:null, ...}.
// Only items the player has actually found (state.collectionLog[id]) can be
// equipped, and only one item per slot at a time. Bonuses stack additively
// across slots and reduce cast time in castDurationMs() below.
export function equippedClothingId(slot){
  return (state.equippedClothing && state.equippedClothing[slot]) || null;
}
export function isClothingOwned(itemId){
  return !!(state.collectionLog && state.collectionLog[itemId]);
}
export function equipClothing(itemId){
  var item = clothingItems().filter(function(c){ return c.id===itemId; })[0];
  if(!item || !isClothingOwned(itemId)) return false;
  if(!state.equippedClothing) state.equippedClothing = {};
  state.equippedClothing[item.slot] = itemId;
  saveState();
  return true;
}
export function unequipClothingSlot(slot){
  if(!state.equippedClothing) state.equippedClothing = {};
  state.equippedClothing[slot] = null;
  saveState();
}
export function totalClothingSpeedBonus(){
  if(!state.equippedClothing) return 0;
  var total = 0;
  CLOTHING_SLOTS.forEach(function(slot){
    var id = state.equippedClothing[slot];
    if(!id || !isClothingOwned(id)) return;
    var item = clothingItems().filter(function(c){ return c.id===id; })[0];
    if(item) total += item.speedBonus || 0;
  });
  return Math.min(total, 0.9); // safety ceiling as more sets get added later
}
// Bluegill set: a flat bonus on fishing XP per catch (see grantFish() below).
export function totalClothingXpBonus(){
  if(!state.equippedClothing) return 0;
  var total = 0;
  CLOTHING_SLOTS.forEach(function(slot){
    var id = state.equippedClothing[slot];
    if(!id || !isClothingOwned(id)) return;
    var item = clothingItems().filter(function(c){ return c.id===id; })[0];
    if(item) total += item.xpBonus || 0;
  });
  return Math.min(total, 0.75); // safety ceiling as more sets get added later
}
// Carp set: multiplies how much each catch counts toward that species'
// proficiency level (see grantFish() below and proficiencyXp() in state.js).
// A flat multiplier on the catch count, not on catches-needed, so it cuts
// the total grind to Lv 99 by bonus/(1+bonus), not by bonus itself.
export function totalClothingProficiencyBonus(){
  if(!state.equippedClothing) return 0;
  var total = 0;
  CLOTHING_SLOTS.forEach(function(slot){
    var id = state.equippedClothing[slot];
    if(!id || !isClothingOwned(id)) return;
    var item = clothingItems().filter(function(c){ return c.id===id; })[0];
    if(item) total += item.proficiencyBonus || 0;
  });
  return Math.min(total, 3); // safety ceiling as more sets get added later
}

// Pack of Cigarettes: a temporary, timed version of a clothing/trinket
// speed bonus -- see isBuffActive() in state.js. Stacks additively with
// those the same way clothing and trinkets stack with each other.
export function totalConsumableSpeedBonus(){
  if(!isBuffActive('cigarettes')) return 0;
  var cig = consumableById('cigarettes');
  return cig ? (cig.magnitude || 0) : 0;
}
export function castDurationMs(fish){
  var base = currentBaitCount() > 0 ? BASE_CAST_MS : NO_BAIT_CAST_MS;
  var totalSpeedBonus = Math.min(totalClothingSpeedBonus() + totalTrinketSpeedBonus() + totalConsumableSpeedBonus(), 0.9);
  var speedMultiplier = 1 - totalSpeedBonus;
  return Math.round(base * proficiencySpeedMultiplier(fish ? fish.id : 'shrimp') * speedMultiplier);
}

// ---------- Trinkets ----------
// state.equippedTrinkets is a flat array of item ids (unlike clothing,
// trinkets aren't tied to a body slot — any owned trinket can go in any of
// the TRINKET_SLOTS). Only lobster_claw (speedBonus) and bass_lure
// (noBaitChance) carry a real effect right now; the rest equip for free
// with no bonus, ready for effects to be added later.
export function equippedTrinketIds(){
  return (state.equippedTrinkets || []).slice();
}
export function isTrinketOwned(itemId){
  return !!(state.collectionLog && state.collectionLog[itemId]);
}
export function isTrinketEquipped(itemId){
  return !!(state.equippedTrinkets && state.equippedTrinkets.indexOf(itemId) >= 0);
}
export function equipTrinket(itemId){
  var item = trinketById(itemId);
  if(!item || !isTrinketOwned(itemId)) return false;
  if(!state.equippedTrinkets) state.equippedTrinkets = [];
  if(state.equippedTrinkets.indexOf(itemId) >= 0) return true;
  if(state.equippedTrinkets.length >= TRINKET_SLOTS) return false;
  state.equippedTrinkets.push(itemId);
  saveState();
  return true;
}
export function unequipTrinket(itemId){
  if(!state.equippedTrinkets) state.equippedTrinkets = [];
  var idx = state.equippedTrinkets.indexOf(itemId);
  if(idx >= 0) state.equippedTrinkets.splice(idx, 1);
  saveState();
}
export function totalTrinketSpeedBonus(){
  if(!state.equippedTrinkets) return 0;
  var total = 0;
  state.equippedTrinkets.forEach(function(id){
    if(!isTrinketOwned(id)) return;
    var item = trinketById(id);
    if(item) total += item.speedBonus || 0;
  });
  return Math.min(total, 0.9);
}
// Broken Watch (the Bluegill unique): stacks additively with the Bluegill
// clothing set's own xpBonus, applied together in grantFish() below.
export function totalTrinketXpBonus(){
  if(!state.equippedTrinkets) return 0;
  var total = 0;
  state.equippedTrinkets.forEach(function(id){
    if(!isTrinketOwned(id)) return;
    var item = trinketById(id);
    if(item) total += item.xpBonus || 0;
  });
  return Math.min(total, 0.75);
}
// Message in a Bottle (the Carp unique): doubles proficiency gains on its
// own (a flat +100%), stacking additively with the Carp clothing set's own
// proficiencyBonus, applied together in grantFish() below.
export function totalTrinketProficiencyBonus(){
  if(!state.equippedTrinkets) return 0;
  var total = 0;
  state.equippedTrinkets.forEach(function(id){
    if(!isTrinketOwned(id)) return;
    var item = trinketById(id);
    if(item) total += item.proficiencyBonus || 0;
  });
  return Math.min(total, 3);
}
// Silver Ring (the Anchovy unique): a relative multiplier on the chance of
// finding a fish-specific unique (logItemForFish) or mythic/outfit piece
// (mythicLogItemsForFish), applied in grantFish() below. Deliberately NOT
// applied to universal drops (the Dev Luck Tablet) -- that one's meant to
// stay an absolute 1-in-10,000,000 regardless of anything else equipped.
// Relative (chance * (1+bonus)), not additive, since these chances are tiny
// fractions (0.0002, 0.001) -- an additive +10 percentage points would
// obliterate the whole rarity curve instead of nudging it.
export function totalMythicLuckBonus(){
  if(!state.equippedTrinkets) return 0;
  var total = 0;
  state.equippedTrinkets.forEach(function(id){
    if(!isTrinketOwned(id)) return;
    var item = trinketById(id);
    if(item) total += item.mythicLuckBonus || 0;
  });
  return Math.min(total, 1); // safety ceiling: at most a 2x multiplier
}
export function trinketNoBaitChance(){
  if(!state.equippedTrinkets) return 0;
  var chance = 0;
  state.equippedTrinkets.forEach(function(id){
    if(!isTrinketOwned(id)) return;
    var item = trinketById(id);
    if(item && item.noBaitChance) chance = Math.max(chance, item.noBaitChance);
  });
  return Math.min(chance, 0.95);
}

// ---------- Fishing Shack (see SHACK_TIERS/SHACK_DECOR in data.js) ----------
// Purely cosmetic coin sink: a decoratable room, separate from anything that
// affects actual fishing. state.shack.tier is a straight coin+level-gated
// upgrade path (same shape as UPGRADES); decor purchases persist across tiers
// (buyShackDecor never checks tier again once owned -- only tierRequired at
// purchase time); trophy mounts are populated from the player's own Trophy
// Room catches rather than bought, and store a snapshot (fishId/stars/float)
// so a mount survives even if the original inventory entry is later sold.
export function shackTier(){ return (state.shack && state.shack.tier) || 0; }
export function shackMountSlotCount(){ return shackTierInfo(shackTier()).mountSlots; }
export function buyShackTier(){
  var next = nextShackTier(shackTier());
  if(!next || playerLevel() < next.level || state.coins < next.cost) return false;
  state.coins -= next.cost;
  state.shack.tier = next.tier;
  saveState(); updateHud();
  playBuySound();
  showToast('Moved into the ' + next.name + '!');
  return true;
}
export function ownsShackDecor(itemId){ return !!(state.shack.owned && state.shack.owned[itemId]); }
export function buyShackDecor(itemId){
  var item = shackDecorById(itemId);
  if(!item || shackTier() < item.tierRequired) return false;
  if(ownsShackDecor(itemId)) return true;
  if(state.coins < item.cost) return false;
  state.coins -= item.cost;
  if(!state.shack.owned) state.shack.owned = {};
  state.shack.owned[itemId] = true;
  saveState(); updateHud();
  playBuySound();
  showToast('Bought ' + item.name + '.');
  return true;
}
export function equipShackDecor(itemId){
  var item = shackDecorById(itemId);
  if(!item || !ownsShackDecor(itemId)) return false;
  state.shack.decor[item.slot] = itemId;
  saveState();
  return true;
}
export function unequipShackDecorSlot(slot){
  if(state.shack.decor) state.shack.decor[slot] = null;
  saveState();
}
export function shackMounts(){
  if(!state.shack.mounts) state.shack.mounts = [];
  return state.shack.mounts;
}
export function mountableTrophies(){
  return state.inventory.filter(function(e){ return e.status === 'trophy'; });
}
export function mountTrophyInSlot(slotIndex, catchId){
  var entry = state.inventory.find(function(e){ return e.catchId === catchId && e.status === 'trophy'; });
  if(!entry || slotIndex < 0 || slotIndex >= shackMountSlotCount()) return false;
  var mounts = shackMounts();
  mounts[slotIndex] = {catchId: entry.catchId, fishId: entry.fishId, stars: starsForEntry(entry), float: floatForEntry(entry)};
  saveState();
  return true;
}
export function unmountShackSlot(slotIndex){
  var mounts = shackMounts();
  mounts[slotIndex] = null;
  saveState();
}

// ---------- Consumables (quick-use row on the dock) ----------
// Buying happens in the shop (screens.js); using one happens right here from
// the dock scene, one click. Using another while a buff is already running
// just resets it to a fresh 60 seconds (and consumes another unit) rather
// than stacking -- "topping off the drink" instead of layering effects.
export function useConsumable(id){
  var c = consumableById(id);
  if(!c) return false;
  var count = state.consumableCounts[c.id] || 0;
  if(count <= 0) return false;
  state.consumableCounts[c.id] = count - 1;
  state.activeBuffs[c.id] = Date.now() + c.duration;
  saveState();
  renderConsumablesRow();
  updatePlayerBuffAccessories();
  showToast(c.useMessage || ('Used ' + c.name + '.'));
  return true;
}
export function renderConsumablesRow(){
  var row = document.getElementById('consumablesRow');
  if(!row) return;
  CONSUMABLES.forEach(function(c){
    var btn = row.querySelector('[data-use-consumable="'+c.id+'"]');
    if(!btn) return;
    var count = state.consumableCounts[c.id] || 0;
    var active = isBuffActive(c.id);
    if(active){
      var secs = Math.max(1, Math.ceil(buffRemainingMs(c.id) / 1000));
      btn.textContent = c.icon + ' ' + secs + 's';
    } else {
      btn.textContent = c.icon + ' ×' + count;
    }
    btn.classList.toggle('active-buff', active);
    btn.disabled = count <= 0;
    btn.title = c.name + ' — ' + c.flavor;
  });
}
Array.prototype.forEach.call(document.querySelectorAll('#consumablesRow [data-use-consumable]'), function(btn){
  btn.addEventListener('click', function(){ useConsumable(btn.getAttribute('data-use-consumable')); });
});
// Countdown display only -- isBuffActive()/buffRemainingMs() check Date.now()
// directly wherever a bonus is actually applied, so gameplay is correct even
// if this tick is paused (backgrounded tab) or hasn't fired yet. Also keeps
// the beer/cigarette accessory on the fisherman itself in sync so it
// disappears within a second of the buff actually expiring.
setInterval(function(){ renderConsumablesRow(); updatePlayerBuffAccessories(); }, 1000);

// ---------- Dock scene background ----------
// Paints whichever background is currently selected into #dockScene. Called
// on entering the dock and whenever the player picks a new background.
// 'default' (or an unrecognized/locked id) leaves the existing CSS-drawn
// scene alone; anything else injects that background's SVG markup and hides
// the default sky/water layers so the two don't overlap.
export function applyBackground(){
  var sceneEl = document.getElementById('dockScene');
  var layerEl = document.getElementById('sceneBgCustom');
  if(!sceneEl || !layerEl) return;
  var bg = backgroundById(state.selectedBackground || 'default');
  if(!bg || bg.id === 'default' || !bg.svg || !isBackgroundUnlocked(bg)){
    sceneEl.setAttribute('data-bg', 'default');
    layerEl.innerHTML = '';
    return;
  }
  sceneEl.setAttribute('data-bg', bg.id);
  layerEl.innerHTML = bg.svg;
}
export function selectBackground(id){
  var bg = backgroundById(id);
  if(!bg || !isBackgroundUnlocked(bg)) return false;
  state.selectedBackground = bg.id;
  saveState();
  applyBackground();
  return true;
}

export function grantFish(fish, forcedQuality){
  var beforeLevel = playerLevel();
  var quality = forcedQuality || rollQuality();
  var stars = quality.stars;
  var fl = quality.float;
  // Bluegill set: flat XP bonus applied here, once, so every downstream use
  // (record, feedback popup, HUD text, level-up check) sees the same final
  // number rather than each recomputing it themselves.
  var xpGained = Math.round(fish.xp * (1 + totalClothingXpBonus() + totalTrinketXpBonus()));
  state.xp += xpGained;
  // Carp set/Message in a Bottle: each catch counts as MORE than one catch
  // toward THIS species' proficiency level, tracked separately from
  // state.caught (the real, un-boosted catch count challenges/unlocks/the
  // inventory chip rely on). The first time a species is touched here it's
  // seeded from the real catch count so far, so older progress isn't lost
  // or retroactively boosted -- only catches from here on get the bonus.
  if(!state.proficiencies) state.proficiencies = {};
  var profBonus = totalClothingProficiencyBonus() + totalTrinketProficiencyBonus();
  var profBase = state.proficiencies[fish.id] != null ? state.proficiencies[fish.id] : (state.caught[fish.id]||0);
  state.proficiencies[fish.id] = profBase + (1 + profBonus);
  state.caught[fish.id] = (state.caught[fish.id]||0) + 1;
  var newCatchId = nextCatchId();
  state.inventory.unshift({catchId: newCatchId, fishId: fish.id, stars: stars, float: fl, status:'kept'});
  var catchRecord = {catchId:newCatchId, fishId:fish.id, stars:stars, float:fl, xp:xpGained, timestamp:Date.now()};
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

  var mythicLuck = totalMythicLuckBonus();
  var logItem = logItemForFish(fish.id);
  if(logItem && Math.random() < Math.min(1, logItem.chance * (1 + mythicLuck))){
    var isNewLogItem = !state.collectionLog[logItem.id];
    state.collectionLog[logItem.id] = (state.collectionLog[logItem.id]||0) + 1;
    setTimeout(function(){
      showMegaRareFeedback(logItem, fish, isNewLogItem);
      showToast((isNewLogItem ? 'New collection log item! ' : 'Found another ') + logItem.icon + ' ' + logItem.name + '.');
    }, isNewLogItem ? 1400 : 1100);
  }
  mythicLogItemsForFish(fish.id).forEach(function(mythicItem){
    if(Math.random() >= Math.min(1, mythicItem.chance * (1 + mythicLuck))) return;
    var isNewMythic = !state.collectionLog[mythicItem.id];
    state.collectionLog[mythicItem.id] = (state.collectionLog[mythicItem.id]||0) + 1;
    setTimeout(function(){
      showMegaRareFeedback(mythicItem, fish, isNewMythic);
      showToast((isNewMythic ? 'Mythic find! ' : 'Found another ') + mythicItem.icon + ' ' + mythicItem.name + ' ' + fish.name + '.');
    }, isNewMythic ? 1400 : 1100);
  });
  // Universal drops (currently just the Dev Luck Tablet, 1-in-10,000,000):
  // not tied to fish.id, so every catch of every species gets a roll.
  universalLogItems().forEach(function(uItem){
    if(Math.random() >= uItem.chance) return;
    var isNewUniversal = !state.collectionLog[uItem.id];
    state.collectionLog[uItem.id] = (state.collectionLog[uItem.id]||0) + 1;
    setTimeout(function(){
      showMegaRareFeedback(uItem, fish, isNewUniversal);
      showToast((isNewUniversal ? 'Impossible find! ' : 'Found another ') + uItem.icon + ' ' + uItem.name + '.');
    }, isNewUniversal ? 1400 : 1100);
  });

  // Auto-Sell (Upgrades tab): silently sells this catch right back off if
  // it's at or below the threshold the player picked. Capped at 3 stars in
  // state.js (setAutoSellThreshold clamps to 0-3) so a 4-5 star trophy-tier
  // catch is never sold out from under the player without a look.
  var autoSoldPrice = 0;
  if(state.upgrades.auto_sell && state.autoSellThreshold > 0 && stars <= state.autoSellThreshold){
    var autoIdx = state.inventory.findIndex(function(e){ return e.catchId === newCatchId; });
    if(autoIdx !== -1){
      autoSoldPrice = sellPrice(fish, state.inventory[autoIdx]);
      state.coins += autoSoldPrice;
      state.inventory.splice(autoIdx, 1);
    }
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
  showCatchFeedback(fish, stars, fl, xpGained, leveledUp, afterLevel);
  if(stars >= 4) showLegendaryFeedback(fish, stars, fl, newCatchId);
  playCatchSound(stars);
  if(autoSoldPrice) showCoinGain(autoSoldPrice);
  if(leveledUp){
    playLevelSound(LEVEL_MILESTONES.indexOf(afterLevel) >= 0);
    showToast('Level up! Fishing level ' + afterLevel + '.');
  }
  if(stars >= 4){
    setTimeout(function(){ showToast('Trophy catch! That '+fish.name+' was '+starsText(stars)+' with a '+fl.toFixed(6)+' float.'); }, 700);
  }
  return {leveledUp: leveledUp, stars: stars, float: fl, xpGained: xpGained};
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
  var history = state.catchHistory || [], recent = [], seenIds = Object.create(null);
  for(var j=0;j<history.length && recent.length<10;j++){
    var catchId = history[j].catchId;
    if(keptIds[catchId] && !seenIds[catchId]){
      seenIds[catchId] = true;
      recent.push(history[j]);
    }
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

document.getElementById('sellRecentBtn').addEventListener('click', sellAllKept);
var baitCounterEl = document.getElementById('sceneBaitCount');
if(baitCounterEl) baitCounterEl.addEventListener('click', quickBuyBait);

export function closeCatchInspect(){
  var modal = document.getElementById('catchInspect');
  if(modal) modal.classList.remove('active');
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
    '<button class="btn-secondary" id="closeCatchInspect" style="width:100%;margin-top:10px;">Keep</button>';
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
  resumeFishingAfterSell();
  showCoinGain(price);
  playSellSound(starsForEntry(entry));
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
  // Inventory entries don't store the xp that catch actually awarded (only
  // catchHistory does), so look it up there for an accurate number -- falls
  // back to the fish's base xp for older saves / entries with no matching
  // history record.
  var histRec = state.catchHistory.find(function(h){ return h.catchId === entry.catchId; });
  var xpShown = histRec && histRec.xp != null ? histRec.xp : f.xp;
  var body=document.getElementById('catchInspectBody');
  body.innerHTML='<div class="inspect-fish" style="color:'+q.color+';">'+fishDisplayEmoji(f)+'</div>'+
    '<h3>'+f.name+'</h3>'+
    '<div class="inspect-stars" style="color:'+q.color+';">'+starsText(stars)+'</div>'+
    '<div class="inspect-rating" style="color:'+q.color+';">'+q.label+'</div>'+
    '<div class="inspect-float">Float: '+fl.toFixed(4)+' · Rarity: '+floatRarityText(entry)+'</div>'+
    '<div class="inspect-stats"><span>Fishing XP <b>+'+xpShown+'</b></span><span>Value <b>'+price+' ⛃</b></span></div>'+
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
// Resume automatically after selling frees space
// when fishing stopped only because storage was full.
function resumeFishingAfterSell(){
  if(keptFishCount() >= storageCapacity()) return;
  if(autoFishing) return;

  if(!autoFishStatusText ||
     !/full.*sell fish|full.*sell a fish/i.test(
       autoFishStatusText.textContent
     )) return;

  startAutoFish();

  if(autoFishStatusText)
    autoFishStatusText.textContent = 'Casting…';
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
    if(autoFishStoppedForFullStorage){
    autoFishStoppedForFullStorage = false;
    startAutoFish();

    var pauseBtn = document.getElementById('togglePauseBtn');
    pauseBtn.textContent = '❚❚';
    pauseBtn.title = 'Pause fishing';
    pauseBtn.setAttribute('aria-label','Pause fishing');

    autoFishStatusText.textContent = 'Casting…';
    autoFishCountText.textContent = '';
  }
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
export var autoFishStoppedForFullStorage = false;
export var autoFishTimer = null;
export var autoFishStatusText = document.getElementById('autoFishStatusText');
export var autoFishCountText = document.getElementById('autoFishCountText');
export var autoFishProgressFill = document.getElementById('autoFishProgressFill');
export var fishingSessionId = 0;
export var activeCastId = 0;
export var awardedCastKey = '';
export var lastAwardedCastKey = '';
export var castActive = false;
export var fishingLockTimer = null;
var fishingOwnerId = Math.random().toString(36).slice(2) + Date.now().toString(36);
var FISHING_LOCK_KEY = 'tidewater_fishing_lock';
var FISHING_LOCK_MS = 3000;

function readFishingLock(){
  try{ return JSON.parse(localStorage.getItem(FISHING_LOCK_KEY) || 'null'); }catch(e){ return null; }
}
function ownsFishingLock(){
  var lock = readFishingLock();
  return !!lock && lock.owner === fishingOwnerId && Date.now() - lock.time < FISHING_LOCK_MS;
}
function acquireFishingLock(){
  var lock = readFishingLock();
  if(lock && lock.owner !== fishingOwnerId && Date.now() - lock.time < FISHING_LOCK_MS) return false;
  try{ localStorage.setItem(FISHING_LOCK_KEY, JSON.stringify({owner:fishingOwnerId,time:Date.now()})); }catch(e){ return true; }
  return ownsFishingLock();
}
function refreshFishingLock(){
  if(!autoFishing || !ownsFishingLock()) return;
  try{ localStorage.setItem(FISHING_LOCK_KEY, JSON.stringify({owner:fishingOwnerId,time:Date.now()})); }catch(e){}
}
function releaseFishingLock(){
  clearInterval(fishingLockTimer);
  fishingLockTimer = null;
  if(!ownsFishingLock()) return;
  try{ localStorage.removeItem(FISHING_LOCK_KEY); }catch(e){}
}

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
  if(!acquireFishingLock()){
    autoFishStatusText.textContent = 'Paused — another game window is fishing';
    return;
  }
  autoFishing = true;
  fishingSessionId++;
  awardedCastKey = '';
  lastAwardedCastKey = '';
  castActive = false;
  clearInterval(fishingLockTimer);
  fishingLockTimer = setInterval(refreshFishingLock, 1000);
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
  releaseFishingLock();
  parkRodIdle();
  if(autoFishProgressFill){
    autoFishProgressFill.style.transition = 'none';
    autoFishProgressFill.style.width = '0%';
  }
  updateGearCaption();
}

// The dedicated topbar control toggles auto-fishing. Ordinary scene clicks
// remain available for inspecting catches and using dock controls.
export function toggleFishingPause(){
  if(autoFishing || castActive){
    stopAutoFish();
    autoFishStatusText.textContent = 'Paused — press play to resume';
    autoFishCountText.textContent = '';
    var pauseBtn = document.getElementById('togglePauseBtn');
    pauseBtn.textContent = '▶';
    pauseBtn.title = 'Resume fishing';
    pauseBtn.setAttribute('aria-label','Resume fishing');
  } else {
    startAutoFish();
    autoFishStatusText.textContent = 'Casting…';
    var resumeBtn = document.getElementById('togglePauseBtn');
    resumeBtn.textContent = '❚❚';
    resumeBtn.title = 'Pause fishing';
    resumeBtn.setAttribute('aria-label','Pause fishing');
  }
  startWaterAmbience();
}
document.getElementById('togglePauseBtn').addEventListener('click', toggleFishingPause);

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
  if(!ownsFishingLock()){
    stopAutoFish();
    autoFishStatusText.textContent = 'Paused — another game window is fishing';
    autoFishCountText.textContent = '';
    return;
  }
  if(keptFishCount() >= storageCapacity()){
    autoFishStoppedForFullStorage = true;
    stopAutoFish();
    autoFishStatusText.textContent = storageName()+' full — sell fish to keep fishing';
    autoFishCountText.textContent = keptFishCount()+' / '+storageCapacity();
    showToast(storageName()+' full. Sell a fish or reach Fishing Lv '+(playerLevel()+1)+'.');
    return;
  }

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
    var savedByTrinket = trinketNoBaitChance() > 0 && Math.random() < trinketNoBaitChance();
    if(!savedByTrinket) state.baitCounts[currentBaitId()] -= 1;
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
    if(lastAwardedCastKey === castKey) return;

    // Consume the token BEFORE grantFish(). If anything inside grantFish()
    // causes another callback synchronously, it still cannot award this cast.
    lastAwardedCastKey = castKey;
    awardedCastKey = '';
    castActive = false;

    var result = grantFish(fish);
    animateFishToBucket(fish, result.stars);
    var q = qualityInfo(result.stars);
    autoFishStatusText.innerHTML = 'Caught a ' + fish.name + ' <span style="color:'+q.color+';">('+starsText(result.stars)+' · '+q.label+')</span>';
    autoFishCountText.innerHTML = '<span style="color:'+q.color+';">+'+result.xpGained+' xp</span>';
    if(autoFishProgressFill) autoFishProgressFill.style.width = '100%';

    // "Big One" roll: independent of the normal catch above (that fish is
    // already caught either way) -- only for a species whose Big One hasn't
    // been logged yet, so the encounter never re-fires once you've landed it.
    var bigOneItem = bigOneLogItemForFish(fish.id);
    var triggerBigOne = !bigOneActive && bigOneItem && !state.collectionLog[bigOneItem.id] && Math.random() < BIG_ONE_CHANCE;

    if(triggerBigOne || result.stars >= 4){
      autoFishing = false;
      fishingSessionId++;
      activeCastId++;
      clearFishingTimer();
      parkRodIdle();
      if(triggerBigOne){
        // Let the normal catch popup play out first, then the sting + banner.
        setTimeout(function(){ beginBigOneEncounter(fish, bigOneItem, result.stars >= 4); }, 1500);
      }
      return;
    }

    // Only after the single fish has been awarded do we schedule the next cast.
    queueNextCast(sessionId, 550);
  }, duration);
}

// ---------------------------------------------------------------------------
// "Big One" encounter: sting + banner (showBigOneBanner, above) -> tap-circle
// minigame -> reward. Fishing is paused for the encounter itself (so it can
// never be missed while the player is away -- it just waits for Press Start)
// but resumes automatically once it resolves, win or lose, the same way
// fishing normally just keeps going between casts. The one exception is when
// this same catch was ALSO a 4-5 star trophy (alsoTrophy) -- that already
// shows its own card requiring a manual "Keep in bucket"/"Sell"/"Trophy"
// choice, so fishing stays paused for the player to deal with that, same as
// any other trophy catch.
// ---------------------------------------------------------------------------
var bigOneActive = false;

function beginBigOneEncounter(fish, bigOneItem, alsoTrophy){
  bigOneActive = true;
  showBigOneBanner(fish, function(){
    startBigOneMinigame(fish, function(success, info){
      bigOneActive = false;
      resolveBigOneOutcome(fish, bigOneItem, success, info);
      if(!alsoTrophy) startAutoFish();
    });
  });
}

function resolveBigOneOutcome(fish, bigOneItem, success, info){
  if(!success){
    playBigOneMissSound();
    showToast('The ' + fish.name + ' shook loose -- ' + info.hits + '/' + info.need + ' needed. It might come back around.');
    return;
  }
  var isNew = !state.collectionLog[bigOneItem.id];
  state.collectionLog[bigOneItem.id] = (state.collectionLog[bigOneItem.id]||0) + 1;
  saveState();
  updateHud();
  var logScreen = document.getElementById('screen-log');
  if(logScreen && logScreen.classList.contains('active')) renderLog();
  playBigOneWinSound();
  showBigOneRewardFeedback(bigOneItem, fish, info);
  showToast((isNew ? 'Big One landed! ' : 'Landed another ') + bigOneItem.icon + ' ' + bigOneItem.name + '.');

  var uniqueItem = logItemForFish(fish.id);
  if(uniqueItem && Math.random() < BIG_ONE_UNIQUE_BONUS_CHANCE){
    var isNewUnique = !state.collectionLog[uniqueItem.id];
    state.collectionLog[uniqueItem.id] = (state.collectionLog[uniqueItem.id]||0) + 1;
    saveState();
    setTimeout(function(){
      showMegaRareFeedback(uniqueItem, fish, isNewUnique);
      showToast((isNewUnique ? 'Bonus find! ' : 'Found another ') + uniqueItem.icon + ' ' + uniqueItem.name + '.');
    }, 1400);
  }
}

// Reuses the mega-rare celebration layer/particles, with Big-One-specific
// copy (kicker + hit-count line) in place of the "MEGA RARE FIND" wording.
function showBigOneRewardFeedback(item, fish, info){
  var layer = rareLayer();
  var reveal = document.createElement('div');
  reveal.className = 'mega-rare-reveal rare-persist';
  reveal.innerHTML = '<div class="mega-rare-spark">✦</div><div class="mega-rare-kicker">BIG ONE LANDED</div><div class="mega-rare-icon">'+item.icon+'</div><div class="mega-rare-name">'+item.name+'</div><div class="mega-rare-source">'+info.hits+'/'+info.total+' circles tapped ('+info.need+' needed)</div>'+
    '<div class="rare-actions"><button class="btn-secondary rare-close" type="button">Nice!</button></div>';
  layer.appendChild(reveal);
  for(var i=0;i<28;i++){
    var particle = document.createElement('span');
    particle.className = 'mega-rare-particle';
    particle.style.setProperty('--mega-x', Math.cos(Math.PI*2*i/28)*(90+Math.random()*150)+'px');
    particle.style.setProperty('--mega-y', Math.sin(Math.PI*2*i/28)*(70+Math.random()*120)+'px');
    particle.style.animationDelay = (Math.random()*.18)+'s';
    reveal.appendChild(particle);
  }
  reveal.querySelector('.rare-close').addEventListener('click', function(){ dismissRareCard(reveal); });
}

// The tap-circle minigame itself. Circles spawn one at a time inside a
// full-screen play area; each has a fixed-size (>=44px, never shrinks)
// pointer target so it's just as tappable on a phone at max difficulty as it
// is on a desktop mouse -- only the *visual* circle inside shrinks over
// `lifetimeMs`. Tap before it fully shrinks = hit, otherwise = miss. Exits
// the moment the outcome is locked in (enough hits to pass, or enough misses
// that passing is no longer possible) rather than always running every
// circle, so a clean run doesn't drag on.
export function startBigOneMinigame(fish, onComplete){
  var diff = bigOneDifficultyForFish(fish);
  var total = diff.circles, need = diff.need, lifetimeMs = diff.lifetimeMs;
  var hits = 0, misses = 0, spawned = 0;
  var maxMisses = total - need;

  var overlay = document.createElement('div');
  overlay.className = 'bigone-game-overlay';
  overlay.innerHTML = '<div class="bigone-game-hud">'+
    '<div class="bigone-hud-pill hit" id="bigOneHitPill">HIT 0/'+need+'</div>'+
    '<div class="bigone-hud-pill miss" id="bigOneMissPill">MISS 0/'+(maxMisses+1)+'</div>'+
    '</div>';
  document.body.appendChild(overlay);
  var hitPill = overlay.querySelector('#bigOneHitPill');
  var missPill = overlay.querySelector('#bigOneMissPill');

  function updateHudPills(){
    hitPill.textContent = 'HIT ' + hits + '/' + need;
    missPill.textContent = 'MISS ' + misses + '/' + (maxMisses+1);
  }

  function teardown(){
    if(overlay.parentNode) overlay.parentNode.removeChild(overlay);
  }

  function spawnNext(){
    if(spawned >= total){ finish(); return; }
    spawned++;

    var margin = 70; // keep circles off the very edges (and clear of the HUD up top)
    var vw = window.innerWidth, vh = window.innerHeight;
    var x = margin + Math.random() * Math.max(1, vw - margin*2);
    var y = 100 + Math.random() * Math.max(1, vh - margin - 100);

    var wrap = document.createElement('div');
    wrap.className = 'bigone-circle-wrap';
    wrap.style.left = x + 'px';
    wrap.style.top = y + 'px';
    wrap.innerHTML = '<div class="bigone-circle"></div>';
    overlay.appendChild(wrap);
    var circle = wrap.querySelector('.bigone-circle');
    // Starts as a wide, open ring (scale 1.4, set in CSS) and closes in to a
    // floor of scale 0.6 -- still a clearly visible, clearly tappable circle
    // right up to the last instant, never collapsing into a tiny blip.
    circle.style.transition = 'transform ' + lifetimeMs + 'ms linear, opacity .15s ease';
    requestAnimationFrame(function(){ circle.style.transform = 'scale(0.6)'; });

    var resolved = false;
    var timer = setTimeout(function(){
      if(resolved) return;
      resolved = true;
      misses++;
      wrap.classList.add('resolved-miss');
      updateHudPills();
      playBigOneMissTickSound();
      setTimeout(function(){ if(wrap.parentNode) wrap.parentNode.removeChild(wrap); }, 220);
      afterResolve();
    }, lifetimeMs);

    wrap.addEventListener('pointerdown', function(){
      if(resolved) return;
      resolved = true;
      clearTimeout(timer);
      hits++;
      wrap.classList.add('resolved-hit');
      updateHudPills();
      playBigOneHitSound();
      setTimeout(function(){ if(wrap.parentNode) wrap.parentNode.removeChild(wrap); }, 220);
      afterResolve();
    }, {once:true});
  }

  function afterResolve(){
    if(hits >= need){ finish(true); return; }
    if(misses > maxMisses){ finish(false); return; }
    setTimeout(spawnNext, 220);
  }

  function finish(forceResult){
    var success = typeof forceResult === 'boolean' ? forceResult : hits >= need;
    setTimeout(function(){
      teardown();
      onComplete(success, {hits:hits, misses:misses, total:spawned, need:need});
    }, 260);
  }

  spawnNext();
}

// ---------------------------------------------------------------------------
// "Big One" encounter banner -- PREVIEW ONLY for now. This is just the
// announcement moment (sting + banner + Press Start) so it can be reviewed
// before the tap-circle minigame itself is built. Nothing calls this yet
// from real gameplay; it's wired up for manual/test triggering in the
// meantime. `fish` is a FISH entry, `onStart` fires once the player presses
// the button (this is where the minigame will eventually take over).
export function showBigOneBanner(fish, onStart){
  playBigOneSound();
  var overlay = document.getElementById('bigOneBanner');
  if(!overlay){
    overlay = document.createElement('div');
    overlay.id = 'bigOneBanner';
    overlay.className = 'bigone-overlay';
    document.body.appendChild(overlay);
  }
  var emoji = fish ? fishDisplayEmoji(fish) : '🐟';
  overlay.innerHTML =
    '<div class="bigone-card">'+
      '<div class="bigone-warn">⚠ SOMETHING HUGE ⚠</div>'+
      '<h2 class="bigone-title">A BIG ONE IS ON THE LINE!</h2>'+
      '<div class="bigone-fish">'+emoji+'</div>'+
      '<p class="bigone-sub">'+(fish ? 'It feels like a massive ' + fish.name + '&hellip;' : 'Something massive is pulling back&hellip;')+'</p>'+
      '<button class="bigone-start-btn" type="button" id="bigOneStartBtn">PRESS START</button>'+
    '</div>';
  requestAnimationFrame(function(){ overlay.classList.add('active'); });
  var btn = overlay.querySelector('#bigOneStartBtn');
  btn.addEventListener('click', function(){
    overlay.classList.remove('active');
    setTimeout(function(){ if(overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 260);
    if(typeof onStart === 'function') onStart();
  }, {once:true});
}

