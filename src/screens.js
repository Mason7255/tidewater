// ---------------------------------------------------------------------------
// screens.js — Secondary screens: inventory, trophy room, records, skills,
// collection log, challenges, and the tackle shop.
// ---------------------------------------------------------------------------
// ---------- Inventory screen ----------


import { playBuySound, playEquipSound } from './audio.js';
import { BAIT_TYPES, CHALLENGES, COLLECTION_LOG_ITEMS, CUSTOM_HAIR, CUSTOM_HATS, CUSTOM_POLES, CUSTOM_SHIRTS, CUSTOM_SKINS, EQUIPMENT, FISH, baitById, baitForFish, equipmentById } from './data.js';
import { closeCatchInspect, currentBaitId, fishById, inspectInventoryEntry, keptFishCount, playerLevel, sellAllKept, sellEntry, sellTrophy, stopAutoFish, storageCapacity, storageCostForTier, storageName, storageNameForTier, storageUpgradeLevel, storageUnlockedTier, trophyEntry, updateGearCaption, updateHud } from './game.js';
import { renderPlayer, showCoinGain, showScreen, showToast } from './render.js';
import { fishDisplayEmoji, floatForEntry, floatRarityText, formatFloat, proficiencyLevel, proficiencyProgress, proficiencySpeedMultiplier, proficiencyXp, qualityForStars, qualityInfo, saveState, sellPrice, starsForEntry, starsText, state } from './state.js';

document.getElementById('sceneInventoryBtn').addEventListener('click', function(){ renderInventoryList(); showScreen('screen-inventory'); });
document.getElementById('backFromInventory').addEventListener('click', function(){ showScreen('screen-dock'); });
document.getElementById('sellAllBtn').addEventListener('click', sellAllKept);

export function renderInventoryList(){
  var list = document.getElementById('inventoryList');
  var kept = state.inventory.filter(function(e){ return e.status === 'kept'; });
  var totalValue = kept.reduce(function(sum, entry){
    var fish = fishById(entry.fishId);
    return sum + (fish ? sellPrice(fish, entry) : 0);
  }, 0);
  document.getElementById('invToolbarCount').textContent = storageName()+' · '+keptFishCount()+' / '+storageCapacity()+' fish · sell all for '+totalValue+' ⛃';
  document.getElementById('sellAllBtn').textContent = kept.length ? '💰 Sell all · '+totalValue+' ⛃' : '💰 Sell all · 0 ⛃';
  document.getElementById('sellAllBtn').disabled = kept.length === 0;
  if(kept.length === 0){
    list.innerHTML = '<div class="inv-empty">Nothing in your inventory yet — go fish!</div>';
    return;
  }

  // Best-quality catches first, then newer catches.
  kept.sort(function(a,b){
    var sa=starsForEntry(a), sb=starsForEntry(b);
    if(sb !== sa) return sb-sa;
    var bf=floatForEntry(b), af=floatForEntry(a);
    if(bf !== af) return af-bf;
    return (b.catchId||0)-(a.catchId||0);
  });

  list.innerHTML = '';
  var currentStars = null;
  kept.forEach(function(entry){
    var f = fishById(entry.fishId);
    if(!f) return;
    var stars = starsForEntry(entry);
    var q = qualityForStars(stars);
    if(stars !== currentStars){
      currentStars = stars;
      var count = kept.filter(function(x){ return starsForEntry(x) === stars; }).length;
      var header = document.createElement('div');
      header.className = 'inventory-rarity-header';
      header.innerHTML = '<span style="color:'+q.color+';">'+starsText(stars)+'</span><strong>'+q.label+'</strong><span class="inventory-rarity-count">'+count+' catch'+(count===1?'':'es')+'</span>';
      list.appendChild(header);
    }

    var price = sellPrice(f, entry);
    var row = document.createElement('div');
    row.className = 'inv-row';
    row.style.cursor = 'pointer';
    row.innerHTML =
      '<div class="dot" style="background:'+q.color+'26; color:'+q.color+';">'+fishDisplayEmoji(f)+'</div>' +
      '<div class="inv-row-body">' +
        '<div class="inv-row-name">'+f.name+(state.records.perSpeciesCatchId[f.id]===entry.catchId ? ' <span class="pb-tag">NEW PB</span>' : '')+'</div>' +
        '<div class="inv-row-species">'+q.label+' · worth '+price+' ⛃</div>' +
      '</div>' +
      '<div class="inv-row-rating">' +
        '<div class="inv-rating-num" style="color:'+q.color+';">'+starsText(stars)+'</div>' +
        '<div class="inv-rating-label" style="color:'+q.color+';">'+q.label+'</div>' +
      '</div>' +
      '<div class="inv-row-actions">' +
        '<button class="btn-tiny gold" data-sell="'+entry.catchId+'">💰 '+price+' ⛃</button>' +
        '<button class="btn-tiny ghost" data-trophy="'+entry.catchId+'">🏆</button>' +
      '</div>';
    list.appendChild(row);
  });

  Array.prototype.forEach.call(list.querySelectorAll('.inv-row'), function(row, index){
    row.addEventListener('click', function(){
      var entry=kept[index];
      if(entry) inspectInventoryEntry(entry);
    });
  });
  Array.prototype.forEach.call(list.querySelectorAll('[data-sell]'), function(btn){
    btn.addEventListener('click', function(ev){ ev.stopPropagation(); sellEntry(parseInt(btn.getAttribute('data-sell'),10)); });
  });
  Array.prototype.forEach.call(list.querySelectorAll('[data-trophy]'), function(btn){
    btn.addEventListener('click', function(ev){ ev.stopPropagation(); trophyEntry(parseInt(btn.getAttribute('data-trophy'),10)); });
  });
}

// ---------- Trophy room ----------
document.getElementById('viewTrophyBtn').addEventListener('click', function(){ renderTrophyGrid(); showScreen('screen-trophy'); });
document.getElementById('backFromTrophy').addEventListener('click', function(){ showScreen('screen-dock'); });

export function renderTrophyGrid(){
  var grid = document.getElementById('trophyGrid');
  var trophies = state.inventory.filter(function(e){ return e.status === 'trophy'; });
  if(trophies.length === 0){
    grid.innerHTML = '<div class="inv-empty">No trophies yet — keep a great catch instead of selling it.</div>';
    return;
  }
  grid.innerHTML = '';
  trophies.forEach(function(entry){
    var f = fishById(entry.fishId);
    if(!f) return;
    var q = qualityInfo(starsForEntry(entry));
    var card = document.createElement('div');
    card.className = 'trophy-card';
    card.style.cursor = 'pointer';
    card.innerHTML =
      '<div class="dot" style="background:'+q.color+'26; color:'+q.color+';">'+fishDisplayEmoji(f)+'</div>' +
      '<div class="tname">'+f.name+'</div>' +
      '<div class="trating" style="color:'+q.color+';">'+starsText(starsForEntry(entry))+'</div>' +
      '<div class="tlabel" style="color:'+q.color+';">'+q.label+'</div>' +
      '<button class="btn-tiny ghost" data-selltrophy="'+entry.catchId+'">💰 Sell instead</button>';
    grid.appendChild(card);
  });
  Array.prototype.forEach.call(grid.querySelectorAll('.trophy-card'), function(card, index){
    card.addEventListener('click', function(){
      var entry=trophies[index];
      if(entry) inspectInventoryEntry(entry);
    });
  });
  Array.prototype.forEach.call(grid.querySelectorAll('[data-selltrophy]'), function(btn){
    btn.addEventListener('click', function(ev){ ev.stopPropagation(); sellTrophy(parseInt(btn.getAttribute('data-selltrophy'),10)); });
  });
}

// ---------- Records ----------
document.getElementById('viewRecordsBtn').addEventListener('click', function(){ renderRecords(); showScreen('screen-records'); });
document.getElementById('backFromRecords').addEventListener('click', function(){ showScreen('screen-dock'); });

export function inspectRecordCatch(catchId){
  if(!catchId) return;
  var entry = state.inventory.find(function(e){ return e.catchId === catchId; });
  if(entry){ inspectInventoryEntry(entry); return; }
  var rec = state.catchHistory.find(function(e){ return e.catchId === catchId; }) || state.inventory.find(function(e){ return e.catchId === catchId; });
  if(!rec && catchId === state.records.bestCatchId){ rec = {fishId:state.records.bestFishId, stars:state.records.bestStars, float:state.records.bestFloat}; }
  if(!rec){
    var ids=Object.keys(state.records.perSpeciesCatchId||{});
    for(var i=0;i<ids.length;i++){ if(state.records.perSpeciesCatchId[ids[i]] === catchId){ rec={fishId:ids[i], stars:state.records.perSpeciesStars[ids[i]], float:state.records.perSpeciesFloat[ids[i]]}; break; } }
  }
  if(!rec) return;
  var f = fishById(rec.fishId); if(!f) return;
  var stars=starsForEntry(rec), q=qualityInfo(stars), fl=floatForEntry(rec);
  var body=document.getElementById('catchInspectBody');
  body.innerHTML='<div class="inspect-fish" style="color:'+q.color+';">'+fishDisplayEmoji(f)+'</div>'+
    '<h3>'+f.name+'</h3>'+
    '<div class="inspect-stars" style="color:'+q.color+';">'+starsText(stars)+'</div>'+
    '<div class="inspect-rating" style="color:'+q.color+';">'+q.label+'</div>'+
    '<div class="inspect-float">Float: '+fl.toFixed(4)+' · Rarity: '+floatRarityText(rec)+'</div>'+
    '<div class="inspect-stats"><span>Fishing XP <b>+'+f.xp+'</b></span><span>Record catch</span></div>'+
    '<button class="btn-secondary" id="inspectRecordCloseBtn" style="width:100%;">Close</button>';
  document.getElementById('catchInspect').classList.add('active');
  document.getElementById('inspectRecordCloseBtn').addEventListener('click',closeCatchInspect);
}

export function renderRecords(){
  var hero = document.getElementById('recordsHero');
  var list = document.getElementById('recordsList');
  if(!state.records.bestFishId){
    hero.innerHTML = '<div class="inv-empty" style="text-align:center;">No catches recorded yet — go fish!</div>';
    list.innerHTML = '';
    return;
  }
  var bestFish = fishById(state.records.bestFishId);
  var bestEntry = state.inventory.find(function(e){ return e.catchId === state.records.bestCatchId; }) || state.catchHistory.find(function(e){ return e.catchId === state.records.bestCatchId; }) || {fishId:state.records.bestFishId, stars:state.records.bestStars, float:state.records.bestFloat};
  var q = qualityInfo(starsForEntry(bestEntry));
  hero.innerHTML =
    '<div class="records-hero" data-record-catch="'+(state.records.bestCatchId||'')+'" style="cursor:pointer;">' +
      '<div class="dot" style="background:'+q.color+'26; color:'+q.color+';">'+fishDisplayEmoji(bestFish)+'</div>' +
      '<div style="font-size:11px; font-weight:800; letter-spacing:0.3px; color:var(--silver);">BEST CATCH EVER · TAP TO INSPECT</div>' +
      '<div class="rname">'+bestFish.name+'</div>' +
      '<div class="rrating" style="color:'+q.color+';">'+starsText(starsForEntry(bestEntry))+' · '+q.label+' · Float '+formatFloat(bestEntry)+' · '+floatRarityText(bestEntry)+'</div>' +
    '</div>';
  var heroEl=hero.querySelector('[data-record-catch]');
  if(heroEl) heroEl.addEventListener('click',function(){ inspectRecordCatch(state.records.bestCatchId); });

  var speciesIds = Object.keys(state.records.perSpeciesFloat || {});
  list.innerHTML = '';
  if(speciesIds.length > 1){
    var heading = document.createElement('div');
    heading.style.cssText = 'font-size:12px; font-weight:800; color:var(--silver); margin-top:4px;';
    heading.textContent = 'PERSONAL BESTS · TAP A CATCH TO INSPECT';
    list.appendChild(heading);
  }
  speciesIds.sort(function(a,b){ return state.records.perSpeciesFloat[a] - state.records.perSpeciesFloat[b]; });
  speciesIds.forEach(function(id){
    var f = fishById(id); if(!f) return;
    var bestFloat = state.records.perSpeciesFloat[id];
    var catchId = state.records.perSpeciesCatchId[id];
    var rec = state.inventory.find(function(e){ return e.catchId === catchId; }) || state.catchHistory.find(function(e){ return e.catchId === catchId; }) || {fishId:id, stars:state.records.perSpeciesStars[id], float:bestFloat};
    var q = qualityInfo(starsForEntry(rec));
    var row = document.createElement('div');
    row.className = 'records-row';
    row.style.cursor = 'pointer';
    row.innerHTML =
      '<div class="dot" style="background:'+q.color+'26; color:'+q.color+';">'+fishDisplayEmoji(f)+'</div>' +
      '<div class="records-row-name">'+f.name+'<small style="display:block;color:var(--silver);font-weight:500;">Float '+formatFloat(rec)+' · '+floatRarityText(rec)+'</small></div>' +
      '<div class="records-row-best" style="color:'+q.color+';">'+starsText(starsForEntry(rec))+'</div>';
    row.addEventListener('click',function(){ inspectRecordCatch(catchId); });
    list.appendChild(row);
  });
}

// ---------- Skills screen ----------
document.getElementById('viewSkillsBtn').addEventListener('click', function(){ renderSkills(); showScreen('screen-skills'); });
document.getElementById('backFromSkills').addEventListener('click', function(){ showScreen('screen-dock'); });

export function renderSkills(){
  var summary = document.getElementById('skillsSummary');
  var grid = document.getElementById('skillsGrid');
  if(!summary || !grid) return;
  var trained = 0;
  FISH.forEach(function(f){ if(proficiencyXp(f.id) > 0) trained++; });
  var avg = Math.floor(FISH.reduce(function(sum,f){ return sum + proficiencyLevel(f.id); },0) / FISH.length);
  summary.innerHTML =
    '<div class="stat-pill level">Species trained <b>'+trained+'/'+FISH.length+'</b></div>' +
    '<div class="stat-pill">Average proficiency <b>'+avg+'</b></div>' +
    '<div class="stat-pill">Fishing level <b>'+playerLevel()+'</b></div>';
  grid.innerHTML = '';
  FISH.forEach(function(f){
    var p = proficiencyProgress(f.id);
    var locked = f.level > playerLevel();
    var row = document.createElement('div');
    row.className = 'skill-row' + (locked ? ' locked' : '');
    var speed = Math.round((1 - proficiencySpeedMultiplier(f.id))*100);
    row.innerHTML =
      '<div class="skill-head">' +
        '<div class="skill-icon">'+fishDisplayEmoji(f)+'</div>' +
        '<div class="skill-name">'+f.name+'<div style="font-size:10px;color:var(--silver);font-weight:500;">'+(locked ? 'Unlocks at Lv '+f.level : 'Unlocked')+'</div></div>' +
        '<div class="skill-level">'+p.level+'</div>' +
      '</div>' +
      '<div class="skill-track"><div class="skill-fill" style="width:'+p.pct+'%;"></div></div>' +
      '<div class="skill-meta"><span>'+(p.level>=99 ? 'MAX' : p.current+' / '+p.needed+' catches')+'</span><span>'+(speed ? speed+'% faster' : 'Base speed')+'</span></div>';
    grid.appendChild(row);
  });
}

// ---------- Collection screen ----------
document.getElementById('viewCollectionBtn').addEventListener('click', function(){ renderCollection(); showScreen('screen-collection'); });
document.getElementById('backFromCollection').addEventListener('click', function(){ showScreen('screen-dock'); });

export function renderCollection(){
  var grid = document.getElementById('collectionGrid');
  grid.innerHTML = '';
  var lvl = playerLevel();
  FISH.forEach(function(f){
    var owned = state.caught[f.id] || 0;
    var tile = document.createElement('div');
    tile.className = 'fish-tile' + (owned ? '' : ' locked');
    var subtext;
    if(owned){ subtext = '×'+owned; }
    else if(f.level > lvl){ subtext = 'Lv '+f.level; }
    else { subtext = 'Unlocked'; }
    tile.innerHTML =
      '<div class="dot">'+(owned ? fishDisplayEmoji(f) : '?')+'</div>' +
      '<div class="fname">'+(owned ? f.name : '???')+'</div>' +
      '<div class="fcount">'+subtext+'</div>';
    grid.appendChild(tile);
  });
}

// ---------- Collection log ----------
document.getElementById('viewLogBtn').addEventListener('click', function(){ renderLog(); showScreen('screen-log'); });
document.getElementById('backFromLog').addEventListener('click', function(){ showScreen('screen-dock'); });

export function renderLog(){
  var grid = document.getElementById('logGrid');
  grid.innerHTML = '';
  COLLECTION_LOG_ITEMS.forEach(function(item){
    var owned = state.collectionLog[item.id] || 0;
    var fish = fishById(item.fishId);
    var tile = document.createElement('div');
    tile.className = 'fish-tile' + (owned ? '' : ' locked');
    var subtext = owned ? '×'+owned+' · 1/5000 drop' : ('From ' + (fish ? fish.name : '?')+' · 1/5000 drop');
    tile.innerHTML =
      '<div class="dot" style="background:rgba(217,164,65,0.16); color:var(--gold);">'+(owned ? item.icon : '?')+'</div>' +
      '<div class="fname">'+(owned ? item.name : '???')+'</div>' +
      '<div class="fcount">'+subtext+'</div>';
    grid.appendChild(tile);
  });
}

// ---------- Challenges ----------
document.getElementById('viewChallengesBtn').addEventListener('click', function(){ renderChallenges(); showScreen('screen-challenges'); });
document.getElementById('backFromChallenges').addEventListener('click', function(){ showScreen('screen-dock'); });

export function renderChallenges(){
  var list = document.getElementById('challengesList');
  list.innerHTML = '';
  CHALLENGES.forEach(function(c){
    var tier = Math.max(0, Number(state.challengeTiers[c.id] || 0));
    if(tier >= c.tiers.length) return;
    var target = c.tiers[tier];
    var reward = c.rewards[tier];
    var progress = Math.min(target, c.progress());
    var pct = Math.min(100, Math.floor((progress / target) * 100));
    var complete = progress >= target;
    var row = document.createElement('div');
    row.className = 'challenge-row';
    var actionHtml = complete ? '<button class="btn-tiny gold challenge-claim" data-claim="'+c.id+'">'+(c.rewardType==='cosmetic'?'Claim reward':'Claim '+reward+' ⛃')+'</button>' : '<div class="challenge-meta" style="margin-top:0;">'+progress+' / '+target+'</div>';
    var rewardText = c.rewardType === 'cosmetic' ? 'future cosmetic' : reward+' ⛃';
    row.innerHTML =
      '<div class="challenge-icon">'+c.icon+'</div>' +
      '<div class="challenge-body">' +
        '<div class="challenge-title">'+c.name+' <span style="color:var(--gold);font-size:10px;">Tier '+(tier+1)+'</span></div>' +
        '<div class="challenge-progress-track"><div class="challenge-progress-fill" style="width:'+pct+'%;"></div></div>' +
        '<div class="challenge-meta">'+progress+' / '+target+' · reward '+rewardText+'</div>' +
      '</div>' +
      actionHtml;
    list.appendChild(row);
  });
  if(!list.children.length){ list.innerHTML='<div class="inv-empty" style="text-align:center;">All challenge tiers completed!</div>'; return; }
  Array.prototype.forEach.call(list.querySelectorAll('[data-claim]'), function(btn){
    btn.addEventListener('click', function(){
      var id = btn.getAttribute('data-claim');
      var c = CHALLENGES.find(function(x){ return x.id === id; });
      if(!c) return;
      var tier = Math.max(0, Number(state.challengeTiers[c.id] || 0));
      if(tier >= c.tiers.length || c.progress() < c.tiers[tier]) return;
      var reward = c.rewards[tier];
      state.challengeTiers[c.id] = tier + 1;
      delete state.claimedChallenges[c.id];
      if(c.rewardType !== 'cosmetic') state.coins += reward;
      saveState(); updateHud();
      if(c.rewardType !== 'cosmetic') showCoinGain(reward);
      showToast(c.rewardType === 'cosmetic' ? 'Challenge claimed! Cosmetic reward reserved for a future update.' : 'Challenge complete! +'+reward+' coins. Next tier unlocked.');
      renderChallenges();
    });
  });
}

// ---------- Tackle shop / owned equipment ----------
// Open the shop FIRST, then render its contents. This keeps navigation working
// even if a shop-rendering problem occurs.
export var activeShopTab = 'equipment';
export function openTackleShop(tab){
  activeShopTab = ['equipment','bait','storage','customization'].indexOf(tab) >= 0 ? tab : 'equipment';
  showScreen('screen-shop');
  try{
    renderShop();
  }catch(err){
    var fallback = document.getElementById('shopList');
    if(fallback){
      fallback.innerHTML = '<div class=\"inv-empty\">Shop loading error. Bait and equipment are still available; refresh the page to retry.</div>';
    }
    console.error('Tackle Shop render error:', err);
  }
}

export function quickBuySelectedBait(){
  var b=baitById(currentBaitId());
  if(!b) return;
  var fish=fishById(b.fishId);
  if(!fish || playerLevel()<fish.level){ showToast('This bait is not unlocked yet.'); return; }
  if(state.coins<b.packCost){ showToast('You need '+b.packCost+' coins to buy bait.'); return; }
  state.coins-=b.packCost;
  state.baitCounts[b.id]=(state.baitCounts[b.id]||0)+5;
  saveState();
  updateHud();
  updateGearCaption();
  playBuySound();
  showToast('Bought 5 '+b.name.toLowerCase()+'.');
}

document.getElementById('viewShopBtn').addEventListener('click', function(){ openTackleShop('equipment'); });
var buyMoreBaitBtnEl = document.getElementById('buyMoreBaitBtn');
if(buyMoreBaitBtnEl) buyMoreBaitBtnEl.addEventListener('click', quickBuySelectedBait);
document.getElementById('backFromShop').addEventListener('click', function(){ showScreen('screen-dock'); });
document.getElementById('viewEquipmentBtn').addEventListener('click', function(){ renderOwnedEquipment(); showScreen('screen-equipment'); });
document.getElementById('backFromEquipment').addEventListener('click', function(){ showScreen('screen-dock'); });
document.getElementById('shopTabBait').addEventListener('click', function(){ setShopTab('bait'); });
document.getElementById('shopTabEquipment').addEventListener('click', function(){ setShopTab('equipment'); });
document.getElementById('shopTabStorage').addEventListener('click', function(){ setShopTab('storage'); });
document.getElementById('shopTabCustomization').addEventListener('click', function(){ setShopTab('customization'); });

export function setShopTab(tab){
  activeShopTab = ['equipment','bait','storage','customization'].indexOf(tab) >= 0 ? tab : 'equipment';
  ['Equipment','Bait','Storage','Customization'].forEach(function(name){
    var id='shopTab'+name, active=activeShopTab===name.toLowerCase();
    document.getElementById(id).classList.toggle('active',active);
    document.getElementById(id).setAttribute('aria-selected',active?'true':'false');
  });
  try{ renderShop(); }catch(err){
    var fallback = document.getElementById('shopList');
    if(fallback) fallback.innerHTML = '<div class=\"inv-empty\">Shop could not finish loading. Refresh the page to retry.</div>';
    console.error('Tackle Shop tab error:', err);
  }
}

export function customizationCard(kind, item, owned, selected){
  var preview='';
  if(kind==='skin') preview='<div class="pixel-mini"><div class="pixel-face" style="background:'+item.color+';"></div></div>';
  if(kind==='hair') preview='<div class="pixel-mini"><div class="pixel-hair" style="background:'+item.color+';"></div></div>';
  if(kind==='shirt') preview='<div class="custom-shirt-preview" style="background:'+item.color+';"></div>';
  if(kind==='hat') preview='<div class="custom-hat-preview" style="background:'+item.color+';"></div>';
  if(kind==='pole') preview='<div class="custom-pole-preview" style="background:'+item.color+';"></div>';
  var card=document.createElement('div'); card.className='custom-card'+(selected?' selected-item':'');
  var action=selected ? 'Selected' : (owned ? 'Equip' : item.cost+' ⛃');
  var disabled=!owned && state.coins<item.cost;
  card.innerHTML='<div class="custom-preview">'+preview+'</div><div class="custom-item-title">'+item.name+'</div><div class="custom-item-desc">'+(selected?'Currently equipped.':(owned?'Owned and ready to wear.':'Add it to your angler customization collection.'))+'</div><button class="shop-buy" '+(disabled||selected?'disabled':'')+'>'+action+'</button>';
  card.querySelector('button').addEventListener('click', function(){
    if(selected) return;
    if(!owned){ if(state.coins<item.cost) return; state.coins-=item.cost; state.ownedCustomization[kind+'s'][item.id]=true; showCoinGain(item.cost*-1); }
    if(kind==='skin') state.skin=item.id;
    if(kind==='hair') state.hair=item.id;
    if(kind==='shirt') state.shirt=item.id;
    if(kind==='hat') state.hat=item.id;
    if(kind==='pole') state.poleColor=item.id;
    saveState(); updateHud(); renderPlayer(document.getElementById('dockPlayerWrap'),true); renderCustomizationShop();
    playBuySound();
    showToast((owned?'Equipped ':'Bought and equipped ')+item.name+'.');
  });
  return card;
}

export function renderCustomizationShop(){
  var list=document.getElementById('shopList'); list.innerHTML='';
  var sections=[
    {kind:'skin',title:'SKIN TONES',items:CUSTOM_SKINS,owned:state.ownedCustomization.skins,selected:state.skin||'skin_light'},
    {kind:'hair',title:'HAIR',items:CUSTOM_HAIR,owned:state.ownedCustomization.hairs,selected:state.hair||'hair_brown'},
    {kind:'shirt',title:'SHIRTS',items:CUSTOM_SHIRTS,owned:state.ownedCustomization.shirts,selected:state.shirt||'shirt_coral'},
    {kind:'hat',title:'HATS',items:CUSTOM_HATS,owned:state.ownedCustomization.hats,selected:state.hat||'hat_none'},
    {kind:'pole',title:'POLES',items:CUSTOM_POLES,owned:state.ownedCustomization.poles,selected:state.poleColor||'pole_brown'}
  ];
  sections.forEach(function(section){
    var heading=document.createElement('div'); heading.className='shop-section-title'; heading.textContent=section.title; list.appendChild(heading);
    var grid=document.createElement('div'); grid.className='custom-shop-grid';
    section.items.forEach(function(item){ grid.appendChild(customizationCard(section.kind,item,!!section.owned[item.id],section.selected===item.id)); });
    list.appendChild(grid);
  });
}

export function renderShop(){
  var list=document.getElementById('shopList'); list.innerHTML='';
  if(activeShopTab === 'equipment'){
    var heading=document.createElement('div'); heading.className='shop-section-title'; heading.textContent='EQUIPMENT'; list.appendChild(heading);
    EQUIPMENT.forEach(function(eq){
      var fish=fishById(eq.fishId), owned=!!state.ownedGear[eq.id], locked=playerLevel()<eq.level, equipped=state.gear===eq.id;
      var item=document.createElement('div'); item.className='shop-item'+(equipped?' selected-item':'');
      var buttonText=owned ? (equipped ? 'Equipped' : 'Owned') : (locked ? 'Locked' : eq.cost+' ⛃');
      var disabled=owned || locked || state.coins<eq.cost;
      item.innerHTML='<div class="shop-icon">'+eq.icon+'</div><div class="shop-body"><div class="shop-title">'+eq.name+'</div><div class="shop-desc">'+eq.desc+' Only catches '+fish.name+'. Requires Fishing Lv '+eq.level+'.</div>'+(owned?'<div class="shop-owned">Owned'+(equipped?' · Equipped':'')+'</div>':(locked?'<div class="shop-owned">Unlocks at Fishing Lv '+eq.level+'</div>':''))+(equipped?'<div class="shop-selected-badge">Currently selected</div>':'')+'</div><button class="shop-buy" data-buygear="'+eq.id+'" '+(disabled?'disabled':'')+'>'+buttonText+'</button>';
      list.appendChild(item);
    });
    Array.prototype.forEach.call(list.querySelectorAll('[data-buygear]'),function(btn){
      btn.addEventListener('click',function(){
        var eq=equipmentById(btn.getAttribute('data-buygear')); if(!eq || state.ownedGear[eq.id] || playerLevel()<eq.level || state.coins<eq.cost) return;
        state.coins-=eq.cost; state.ownedGear[eq.id]=true; state.gear=eq.id;
        var b=baitForFish(eq.fishId); if(b) state.selectedBait=b.id;
        saveState(); updateHud(); updateGearCaption(); renderPlayer(document.getElementById('dockPlayerWrap'),true); renderShop();
        playBuySound();
        showToast('Bought '+eq.name+' and equipped it.');
      });
    });
  } else if(activeShopTab === 'bait') {
    var heading=document.createElement('div'); heading.className='shop-section-title'; heading.textContent='BAIT'; list.appendChild(heading);
    BAIT_TYPES.forEach(function(b){
      var owned=state.baitCounts[b.id]||0, fish=fishById(b.fishId), locked=fish && fish.level>playerLevel(), selected=currentBaitId()===b.id;
      var item=document.createElement('div'); item.className='shop-item'+(selected?' selected-item':'');
      item.innerHTML='<div class="shop-icon">'+b.icon+'</div><div class="shop-body"><div class="shop-title">'+b.name+' — pack of '+b.packAmount+'</div><div class="shop-desc">Targets '+fish.name+'. Requires Fishing Lv '+fish.level+'. You have '+owned+'.</div>'+(selected?'<div class="shop-selected-badge">Currently selected</div>':'')+'</div><button class="shop-buy" data-buybait="'+b.id+'" '+(state.coins<b.packCost||locked?'disabled':'')+'>'+b.packCost+' ⛃</button>';
      list.appendChild(item);
    });
    Array.prototype.forEach.call(list.querySelectorAll('[data-buybait]'),function(btn){
      btn.addEventListener('click',function(){
        var b=baitById(btn.getAttribute('data-buybait')); if(!b || state.coins<b.packCost || playerLevel()<fishById(b.fishId).level) return;
        state.coins-=b.packCost; state.baitCounts[b.id]=(state.baitCounts[b.id]||0)+b.packAmount;
        saveState(); updateHud(); updateGearCaption(); renderShop(); playBuySound(); showToast('Bought '+b.packAmount+' '+b.name.toLowerCase()+'.');
      });
    });
  } else if(activeShopTab === 'storage') {
    var storageHeading=document.createElement('div'); storageHeading.className='shop-section-title'; storageHeading.textContent='STORAGE'; list.appendChild(storageHeading);
    var currentTier=storageUpgradeLevel(), unlockedTier=storageUnlockedTier();
    for(var storageTier=0;storageTier<20;storageTier++){
      var storageCost=storageCostForTier(storageTier), owned=storageTier<=currentTier, available=storageTier===currentTier+1 && storageTier<=unlockedTier, locked=storageTier>unlockedTier;
      var storageItem=document.createElement('div'); storageItem.className='shop-item'+(owned?' selected-item':'');
      var storageButton=owned ? (storageTier===currentTier?'Equipped':'Owned') : (locked?'Locked':storageCost+' ⛃');
      var storageMeta=owned ? (storageTier===currentTier?'Currently equipped.':'Owned and ready.') : (locked?'Unlocks at Fishing Lv '+(storageTier*5):'Available now.');
      storageItem.innerHTML='<div class="shop-icon">🧺</div><div class="shop-body"><div class="shop-title">'+storageNameForTier(storageTier)+' — '+(5+storageTier*5)+' fish</div><div class="shop-desc">'+storageMeta+' Adds 5 storage spaces every 5 Fishing Levels.</div></div><button class="shop-buy" data-buystorage="'+storageTier+'" '+(!available||state.coins<storageCost?'disabled':'')+'>'+storageButton+'</button>';
      list.appendChild(storageItem);
    }
    Array.prototype.forEach.call(list.querySelectorAll('[data-buystorage]'),function(btn){
      btn.addEventListener('click',function(){
        var tier=parseInt(btn.getAttribute('data-buystorage'),10), cost=storageCostForTier(tier);
        if(tier!==storageUpgradeLevel()+1 || tier>storageUnlockedTier() || state.coins<cost) return;
        state.coins-=cost; state.storageTier=tier;
        saveState(); updateHud(); renderShop(); playBuySound();
        showToast('Upgraded to '+storageName()+'. Now holds '+storageCapacity()+' fish.');
      });
    });
  } else {
    renderCustomizationShop();
  }
}

export function renderOwnedEquipment(){
  var list=document.getElementById('ownedEquipmentList'); list.innerHTML='';
  var owned=EQUIPMENT.filter(function(eq){ return !!state.ownedGear[eq.id]; });
  if(!owned.length){ list.innerHTML='<div class="inv-empty">No equipment owned yet.</div>'; return; }
  owned.forEach(function(eq){
    var fish=fishById(eq.fishId), equipped=state.gear===eq.id;
    var card=document.createElement('div'); card.className='equipment-owned-card';
    card.innerHTML='<div class="shop-icon">'+eq.icon+'</div><div class="shop-body"><div class="shop-title">'+eq.name+'</div><div class="shop-desc">'+eq.desc+' Only catches '+fish.name+'.</div><div class="shop-owned">'+(equipped?'EQUIPPED':'OWNED')+'</div></div>'+(equipped?'<div class="shop-owned">✓</div>':'<button class="shop-buy" data-equip-owned="'+eq.id+'">Equip</button>');
    list.appendChild(card);
  });
  Array.prototype.forEach.call(list.querySelectorAll('[data-equip-owned]'),function(btn){
    btn.addEventListener('click',function(){
      var eq=equipmentById(btn.getAttribute('data-equip-owned')); if(!eq||!state.ownedGear[eq.id]) return;
      stopAutoFish();
      state.gear=eq.id; var b=baitForFish(eq.fishId); if(b) state.selectedBait=b.id;
      saveState(); updateHud(); updateGearCaption(); renderPlayer(document.getElementById('dockPlayerWrap'),true); renderOwnedEquipment(); playEquipSound(); showToast(eq.name+' equipped.');
    });
  });
}

