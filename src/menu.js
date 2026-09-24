// ---------------------------------------------------------------------------
// menu.js — Title screen, save/load slot picker, options, the custom confirm
// modal, and the topbar save-status indicator.
// ---------------------------------------------------------------------------
// ---------- Start menu / save handling ----------


import { audioMaster, ensureAudio, playClickSound, soundCheck, startWaterAmbience, stopWaterAmbience } from './audio.js';
import { OUTFIT_COLORS, makeBaitCounts, startingOwnedEquipment } from './data.js';
import { animationsEnabled, closeCatchInspect, hatRow, nameInput, renderInventoryStrip, setAnimationsEnabled, startAutoFish, startBtn, stopAutoFish, swatchRow, updateGearCaption, updateHud } from './game.js';
import { renderPlayer, showScreen, showToast } from './render.js';
import { SLOT_COUNT, activeSlot, deleteSlotData, escapeHtml, formatSavedAt, getSlotInfo, loadSlot, saveState, saveToSlot, setActiveSlot, setCatchIdCounter, setState, state } from './state.js';

export var newGameBtn = document.getElementById('newGameBtn');
export var loadGameBtn = document.getElementById('loadGameBtn');
export var optionsBtn = document.getElementById('optionsBtn');
export var menuSaveNote = document.getElementById('menuSaveNote');
export var animationsCheck = document.getElementById('animationsCheck');
export var volumeSlider = document.getElementById('volumeSlider');
// Reads `state`/`soundCheck` (from audio.js) immediately, so — same reasoning
// as buildProfXpTable in state.js — this is deferred into an exported
// function and called from main.js once every module has loaded, rather
// than executing inline at this module's own top level.
export function initSoundOptionsUI(){
  if(soundCheck) { soundCheck.checked = state.soundEnabled !== false; soundCheck.addEventListener('change', function(){ state.soundEnabled=soundCheck.checked; saveState(); if(state.soundEnabled){ ensureAudio(); startWaterAmbience(); playClickSound(); } else { stopWaterAmbience(); } }); }
  if(volumeSlider){
    volumeSlider.value = typeof state.volume === 'number' ? state.volume : 40;
    volumeSlider.addEventListener('input', function(){
      state.volume = parseInt(volumeSlider.value, 10);
      if(audioMaster) audioMaster.gain.value = (state.volume/100) * 0.4;
      saveState();
    });
  }
}

export function makeFreshState(){
  return {
    name:'', skin:'skin_light', hair:'hair_brown', outfit: OUTFIT_COLORS[0].id, hat:'hat_none', shirt:'shirt_coral', poleColor:'pole_brown',
    ownedCustomization:{shirts:{shirt_coral:true}, hats:{hat_none:true}, poles:{pole_brown:true}, skins:{skin_light:true}, hairs:{hair_brown:true}},
    coins:0, gear:'shrimp_net', ownedGear:startingOwnedEquipment(),
    baitCounts:makeBaitCounts(),
    selectedBait:'shrimp_bait',
    upgrades:{}, xp:0, caught:{}, proficiencies:{}, inventory:[],
    records:{ bestFloat:1, bestStars:0, bestFishId:null, bestCatchId:null, perSpeciesFloat:{}, perSpeciesStars:{}, perSpeciesCatchId:{} }, recentCatches:[], catchHistory:[],
    collectionLog:{}, claimedChallenges:{}, challengeTiers:{},
    soundEnabled:true, volume:40
  };
}
// bindSlot: pass a slot number when the fresh game should immediately be
// tied to that (empty) slot, so autosave has somewhere to go. Plain "New
// Game" from the title leaves the session unbound until the player
// explicitly saves, so it never silently clobbers a different slot.
export function resetToFreshGame(bindSlot){
  setState(makeFreshState());
  setActiveSlot(bindSlot || null);
  setCatchIdCounter(1);
  nameInput.value = '';
  startBtn.disabled = true;
  Array.prototype.forEach.call(swatchRow.children, function(el){ el.classList.toggle('selected', el.dataset.id===state.outfit); });
  Array.prototype.forEach.call(hatRow.children, function(el){ el.classList.toggle('selected', el.dataset.id===state.hat); });
  renderPlayer(document.getElementById('previewPlayer'), false);
  document.getElementById('topbar').style.display = 'none';
  document.getElementById('xpBarWrap').style.display = 'none';
  stopAutoFish();
  showScreen('screen-create');
}
export function enterDock(){
  document.getElementById('topbar').style.display = 'flex';
  document.getElementById('xpBarWrap').style.display = 'block';
  renderPlayer(document.getElementById('dockPlayerWrap'), true);
  updateHud(); updateGearCaption(); renderInventoryStrip(); updateSaveIndicator();
  showScreen('screen-dock');
  startAutoFish();
}
export function updateMenu(){
  var used = 0;
  for(var n=1;n<=SLOT_COUNT;n++){ if(getSlotInfo(n)) used++; }
  loadGameBtn.disabled = used === 0;
  menuSaveNote.textContent = used > 0 ? (used+' of '+SLOT_COUNT+' save slots used.') : 'No saved games yet.';
}
newGameBtn.addEventListener('click', function(){ resetToFreshGame(); });
loadGameBtn.addEventListener('click', function(){ openSlots('load', 'screen-menu'); });
optionsBtn.addEventListener('click', function(){ openOptions('screen-menu'); });
animationsCheck.addEventListener('change', function(){ setAnimationsEnabled(animationsCheck.checked); });

// ---------- Save / Load slot screen ----------
// One shared screen drives both flows: 'load' picks a slot to resume (or
// start fresh into, if empty); 'save' writes the current session into a
// chosen slot. optionsReturnScreen/slotsReturnScreen track whether we got
// here from the title or from mid-game, so Back and post-action land you
// back in the right place.
export var optionsReturnScreen = 'screen-menu';
export var slotsMode = 'load';
export var slotsReturnScreen = 'screen-menu';

export function openOptions(returnScreen){
  optionsReturnScreen = returnScreen;
  var inGame = !!state.name;
  var saveBtn = document.getElementById('openSaveBtn');
  var exitBtn = document.getElementById('exitToTitleBtn');
  saveBtn.disabled = !inGame;
  saveBtn.title = inGame ? '' : 'Start or load a game first.';
  exitBtn.disabled = returnScreen !== 'screen-dock';
  showScreen('screen-options');
}
document.getElementById('backFromOptions').addEventListener('click', function(){
  if(optionsReturnScreen === 'screen-menu') updateMenu();
  showScreen(optionsReturnScreen);
});
document.getElementById('exitToTitleBtn').addEventListener('click', function(){
  if(!state.name) return;
  showConfirm('Exit to title?', 'Anything not saved to a slot will be lost.', 'Exit', function(){
    stopAutoFish();
    document.getElementById('topbar').style.display = 'none';
    document.getElementById('xpBarWrap').style.display = 'none';
    updateMenu();
    showScreen('screen-menu');
  });
});
document.getElementById('openSaveBtn').addEventListener('click', function(){ if(state.name) openSlots('save', optionsReturnScreen); });
document.getElementById('openLoadFromOptionsBtn').addEventListener('click', function(){ openSlots('load', optionsReturnScreen); });
document.getElementById('topbarMenuBtn').addEventListener('click', function(){ openOptions('screen-dock'); });

// ---------- Custom confirm modal ----------
// A real in-page dialog instead of window.confirm(), which some embedded/
// preview browser contexts silently suppress or auto-dismiss, making it
// look like nothing happened when a "sure you want to overwrite?" check
// fires. This one is always visible and always waits for a tap.
export var confirmModal = document.getElementById('confirmModal');
export var confirmModalTitleEl = document.getElementById('confirmModalTitle');
export var confirmModalBodyEl = document.getElementById('confirmModalBody');
export var confirmModalOkBtn = document.getElementById('confirmModalOk');
export var confirmModalCancelBtn = document.getElementById('confirmModalCancel');
export var pendingConfirmAction = null;
export function showConfirm(title, body, okLabel, onConfirm){
  confirmModalTitleEl.textContent = title;
  confirmModalBodyEl.textContent = body;
  confirmModalOkBtn.textContent = okLabel || 'Confirm';
  pendingConfirmAction = onConfirm;
  confirmModal.classList.add('active');
}
export function hideConfirm(){
  confirmModal.classList.remove('active');
  pendingConfirmAction = null;
}
confirmModalOkBtn.addEventListener('click', function(){
  var action = pendingConfirmAction;
  hideConfirm();
  if(action) action();
});
confirmModalCancelBtn.addEventListener('click', hideConfirm);
confirmModal.addEventListener('click', function(e){ if(e.target === confirmModal) hideConfirm(); });

// ---------- Save status indicator (topbar) ----------
// Makes autosave visible: once a session is bound to a slot (by loading
// one, starting fresh into an empty one, or an explicit save) every
// saveState() call in the game keeps that slot current automatically.
// Before that first bind, nothing persists, so this flags it clearly
// rather than leaving it to guesswork.
export function updateSaveIndicator(){
  var el = document.getElementById('saveStatusPill');
  if(!el) return;
  if(activeSlot){
    el.textContent = '● Slot ' + activeSlot;
    el.title = 'Autosaving to Slot ' + activeSlot + '.';
    el.classList.add('saved');
    el.classList.remove('low');
  } else {
    el.textContent = '● Unsaved';
    el.title = 'Not tied to a save slot — use Save Game in the menu, or progress will be lost if you leave.';
    el.classList.add('low');
    el.classList.remove('saved');
  }
}

export function openSlots(mode, returnScreen){
  slotsMode = mode;
  slotsReturnScreen = returnScreen;
  document.getElementById('slotsTitle').textContent = mode === 'save' ? 'Save game' : 'Load game';
  document.getElementById('slotsIntro').textContent = mode === 'save'
    ? 'Choose a slot to save your progress into. Saving overwrites whatever is already there.'
    : 'Choose a save to continue, or pick an empty slot to start fresh.';
  renderSlots();
  showScreen('screen-slots');
}
document.getElementById('backFromSlots').addEventListener('click', function(){
  if(slotsReturnScreen === 'screen-menu') updateMenu();
  showScreen(slotsReturnScreen);
});

export function renderSlots(justSavedSlot){
  var list = document.getElementById('slotsList');
  list.innerHTML = '';
  for(var n=1; n<=SLOT_COUNT; n++){
    (function(n){
      var info = getSlotInfo(n);
      var card = document.createElement('div');
      card.className = 'slot-card' + (n === activeSlot ? ' active' : '') + (info ? '' : ' empty') + (n === justSavedSlot ? ' just-saved' : '');
      var useLabel = slotsMode === 'save' ? 'Save here' : (info ? 'Load' : 'New game');
      var tags = (n === activeSlot ? ' <span class="slot-current-tag">current</span>' : '') + (n === justSavedSlot ? ' <span class="slot-just-saved-tag">✓ saved</span>' : '');
      if(info){
        card.innerHTML =
          '<div class="slot-card-main">'+
            '<div class="slot-card-name">Slot '+n+' — '+escapeHtml(info.name)+tags+'</div>'+
            '<div class="slot-card-meta">Lv '+info.level+' · '+info.coins+' ⛃ · '+info.fishCaught+' fish caught</div>'+
            '<div class="slot-card-meta subtle">'+formatSavedAt(info.savedAt)+'</div>'+
          '</div>'+
          '<div class="slot-card-actions">'+
            '<button class="btn-tiny gold" data-slot-use="'+n+'">'+useLabel+'</button>'+
            '<button class="btn-tiny ghost" data-slot-delete="'+n+'">Delete</button>'+
          '</div>';
      } else {
        card.innerHTML =
          '<div class="slot-card-main">'+
            '<div class="slot-card-name">Slot '+n+'</div>'+
            '<div class="slot-card-meta">Empty</div>'+
          '</div>'+
          '<div class="slot-card-actions">'+
            '<button class="btn-tiny gold" data-slot-use="'+n+'">'+useLabel+'</button>'+
          '</div>';
      }
      list.appendChild(card);
    })(n);
  }
  Array.prototype.forEach.call(list.querySelectorAll('[data-slot-use]'), function(btn){
    btn.addEventListener('click', function(){
      var n = parseInt(btn.getAttribute('data-slot-use'), 10);
      var info = getSlotInfo(n);
      if(slotsMode === 'save'){
        var doSave = function(){
          saveToSlot(n);
          updateSaveIndicator();
          showToast('Saved to Slot ' + n + '.');
          renderSlots(n); // stay put and show the updated card + a brief confirmation, instead of jumping away
        };
        if(info){
          showConfirm(
            'Overwrite Slot ' + n + '?',
            'This replaces ' + info.name + ' (Lv ' + info.level + ', ' + info.coins + ' ⛃) with your current progress. This can\'t be undone.',
            'Overwrite',
            doSave
          );
        } else {
          doSave();
        }
      } else if(info){
        if(loadSlot(n)) showToast('Loaded ' + info.name + '.');
      } else {
        resetToFreshGame(n);
      }
    });
  });
  Array.prototype.forEach.call(list.querySelectorAll('[data-slot-delete]'), function(btn){
    btn.addEventListener('click', function(){
      var n = parseInt(btn.getAttribute('data-slot-delete'), 10);
      var info = getSlotInfo(n);
      if(!info) return;
      showConfirm(
        'Delete Slot ' + n + '?',
        'This permanently deletes ' + info.name + '\'s save (Lv ' + info.level + '). This can\'t be undone.',
        'Delete',
        function(){
          deleteSlotData(n);
          updateSaveIndicator();
          showToast('Slot ' + n + ' deleted.');
          renderSlots();
        }
      );
    });
  });
}

// Gentle UI clicks for buttons that do not already trigger a more specific sound.
document.addEventListener('click', function(ev){
  var b=ev.target.closest ? ev.target.closest('button') : null;
  if(!b || b.disabled || b.getAttribute('data-soundless')==='true') return;
  if(b.id==='sellAllBtn' || b.id==='inspectSellBtn' || b.id==='inspectTrophyBtn' || b.id==='closeCatchInspect') return;
  playClickSound();
});

export var catchInspectModal = document.getElementById('catchInspect');
if(catchInspectModal){
  catchInspectModal.addEventListener('click', function(e){ if(e.target === catchInspectModal && !catchInspectModal.classList.contains('locked')) closeCatchInspect(); });
}

