// ---------------------------------------------------------------------------
// main.js — Entry point. Importing each module below runs that module's own
// top-level setup (DOM lookups, event-listener registrations) as a side
// effect — that's most of the original file's "wiring". The few pieces that
// read values from OTHER modules immediately (rather than inside a callback)
// were deferred into named functions — see the comments in state.js,
// game.js, and menu.js — and are called explicitly here, in the same order
// the original single-file script ran them, only after every module has
// finished loading.
// ---------------------------------------------------------------------------
import './data.js';
import { slotKey } from './state.js';
import './audio.js';
import { showScreen } from './render.js';

import { buildProfXpTable, setState } from './state.js';
import { initCharacterCreationUI } from './game.js';
import { initSoundOptionsUI, updateMenu, makeFreshState } from './menu.js';

// Replace the safe-but-inert placeholder from state.js with a real fresh
// state, now that every module (including data.js) has finished loading.
setState(makeFreshState());
buildProfXpTable();
initCharacterCreationUI();
initSoundOptionsUI();

// ---------- Init ----------
// One-time migration: fold the old single autosave key (from before save
// slots existed) into slot 1, so returning players don't lose progress.
(function migrateLegacySave(){
  try{
    var legacy = localStorage.getItem('tidewater_state');
    if(legacy && !localStorage.getItem(slotKey(1))){
      localStorage.setItem(slotKey(1), legacy);
    }
    if(legacy) localStorage.removeItem('tidewater_state');
  }catch(e){}
})();
// Always land on the title screen with a blank in-memory session. Nothing
// is auto-loaded; the player chooses Load Game or New Game.
document.getElementById('topbar').style.display = 'none';
document.getElementById('xpBarWrap').style.display = 'none';
updateMenu();
showScreen('screen-menu');
