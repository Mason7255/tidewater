// ---------------------------------------------------------------------------
// audio.js — Tiny procedural 8-bit sound system (WebAudio oscillators/noise).
// ---------------------------------------------------------------------------

// ---------- Tiny 8-bit sound system ----------
// All effects are synthesized with Web Audio so the game needs no external audio files.
// Catch sounds intentionally have small variations so repeated fishing does not sound identical.


import { state } from './state.js';

export var audioCtx = null;
export var audioMaster = null;
export var waterTimer = null;
export var soundCheck = document.getElementById('soundCheck');

export function ensureAudio(){
  if(state.soundEnabled === false) return null;
  if(!audioCtx){
    var AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return null;
    audioCtx = new AC();
    audioMaster = audioCtx.createGain();
    audioMaster.gain.value = ((typeof state.volume === 'number' ? state.volume : 40)/100) * 0.4;
    audioMaster.connect(audioCtx.destination);
  }
  if(audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}
// Browsers only actually start an AudioContext after a genuine user gesture.
// ensureAudio() above tries to unlock it lazily, on whatever click happens
// to trigger the first sound -- but if THAT particular click doesn't satisfy
// the browser's autoplay gate, the context stays silently suspended until
// something else calls ensureAudio() again. That's why toggling the Sound
// checkbox in Options "fixes" it: that click calls ensureAudio() directly.
// Rather than rely on players finding that workaround, listen for the very
// first interaction anywhere on the page and try to unlock audio right then
// -- self-removing once the context is actually running, harmless to retry
// otherwise.
function tryUnlockAudioOnFirstInteraction(){
  var ctx = ensureAudio();
  if(ctx && ctx.state === 'running'){
    document.removeEventListener('pointerdown', tryUnlockAudioOnFirstInteraction, true);
    document.removeEventListener('keydown', tryUnlockAudioOnFirstInteraction, true);
  }
}
document.addEventListener('pointerdown', tryUnlockAudioOnFirstInteraction, true);
document.addEventListener('keydown', tryUnlockAudioOnFirstInteraction, true);
export function audioTone(freq, duration, type, volume, when){
  var ctx=ensureAudio(); if(!ctx || !audioMaster) return;
  var t=ctx.currentTime+(when||0), osc=ctx.createOscillator(), gain=ctx.createGain();
  osc.type=type||'square'; osc.frequency.setValueAtTime(freq,t);
  gain.gain.setValueAtTime(0.0001,t);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001,volume||0.12),t+0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001,t+duration);
  osc.connect(gain); gain.connect(audioMaster); osc.start(t); osc.stop(t+duration+0.02);
}
export function audioNoise(duration, volume, filterFreq, when){
  var ctx=ensureAudio(); if(!ctx || !audioMaster) return;
  var len=Math.max(1,Math.floor(ctx.sampleRate*duration)), buf=ctx.createBuffer(1,len,ctx.sampleRate), data=buf.getChannelData(0);
  for(var i=0;i<len;i++) data[i]=(Math.random()*2-1)*Math.pow(1-i/len,0.35);
  var src=ctx.createBufferSource(), filter=ctx.createBiquadFilter(), gain=ctx.createGain(), t=ctx.currentTime+(when||0);
  src.buffer=buf; filter.type='lowpass'; filter.frequency.value=filterFreq||1200;
  gain.gain.setValueAtTime(0.0001,t); gain.gain.exponentialRampToValueAtTime(Math.max(0.0001,volume||0.04),t+0.015); gain.gain.exponentialRampToValueAtTime(0.0001,t+duration);
  src.connect(filter); filter.connect(gain); gain.connect(audioMaster); src.start(t); src.stop(t+duration+0.02);
}
// A continuously rising (or falling) pitch sweep from freq0 to freq1 over
// `duration` -- used for the "power-up" feel of the level-up sound below.
// Unlike audioTone, the oscillator's own frequency is ramped in real time
// rather than staying fixed, so it glides instead of stepping.
export function audioChirp(freq0, freq1, duration, type, volume, when){
  var ctx=ensureAudio(); if(!ctx || !audioMaster) return;
  var t=ctx.currentTime+(when||0), osc=ctx.createOscillator(), gain=ctx.createGain();
  osc.type=type||'square';
  osc.frequency.setValueAtTime(Math.max(1,freq0),t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1,freq1),t+duration);
  gain.gain.setValueAtTime(0.0001,t);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001,volume||0.12),t+duration*0.6);
  gain.gain.exponentialRampToValueAtTime(0.0001,t+duration+0.02);
  osc.connect(gain); gain.connect(audioMaster); osc.start(t); osc.stop(t+duration+0.05);
}
// Catch sounds use a short, bright pickup pop. Higher tiers use higher pitches
// so the sound still communicates rarity without becoming a full jingle. This
// is the single most-frequently-triggered sound in the game (every catch,
// including auto-fishing), so — same as playSellSound below — each tier has
// 3 candidate root notes (a semitone up/down from the original root) and
// picks one at random per catch, instead of always playing the same note.
var CATCH_SOUND_ROOTS = {
  1: [329.63, 349.23, 311.13], // E4 / F4  / D#4
  2: [369.99, 392.00, 349.23], // F#4 / G4 / F4
  3: [415.30, 440.00, 392.00], // G#4 / A4 / G4
  4: [493.88, 523.25, 466.16], // B4 / C5  / A#4
  5: [587.33, 622.25, 554.37]  // D5 / D#5 / C#5
};
export function playCatchSound(stars){
  if(!ensureAudio()) return;
  stars=Math.max(1,Math.min(5,stars||1));
  var variants = CATCH_SOUND_ROOTS[stars];
  var root = variants[Math.floor(Math.random()*variants.length)];
  audioTone(root,.055,'square',.085,0);
  audioTone(root*1.5,.095,'sine',.075,.045);
  audioTone(root*2,.12,'sine',.035,.095);
}
export function playFireworkBurst(){
  if(!ensureAudio()) return;
  var roots=[523,659,784,988][Math.floor(Math.random()*4)];
  audioTone(roots,.06,'square',.07,0);
  audioTone(roots*1.5,.07,'triangle',.065,.07);
  audioTone(roots*2,.09,'triangle',.055,.14);
  audioNoise(.18,.028,2600,.10);
}
// Sell sounds: one 3-tone arpeggio per rarity tier, same as before, but each
// tier now has 3 candidate root notes (a semitone up/down from the original
// root) instead of just one. A random candidate is picked per sale, so
// selling a run of same-rarity fish doesn't sound identical every time.
// The three notes per tier stay close enough together that the tier is
// still clearly recognizable by ear, and the tiers themselves never overlap.
var SELL_SOUND_ROOTS = {
  1: [196.00, 207.65, 185.00], // G3 / G#3 / F#3
  2: [246.94, 261.63, 233.08], // B3 / C4  / A#3
  3: [293.66, 311.13, 277.18], // D4 / D#4 / C#4
  4: [369.99, 392.00, 349.23], // F#4 / G4 / F4
  5: [493.88, 523.25, 466.16]  // B4 / C5  / A#4
};
export function playSellSound(stars){
  stars=Math.max(1,Math.min(5,stars||1));
  var variants = SELL_SOUND_ROOTS[stars];
  var root = variants[Math.floor(Math.random()*variants.length)];
  audioTone(root,0.08,'square',0.10,0); audioTone(root*1.5,0.08,'square',0.09,0.07); audioTone(root*2,0.13,'triangle',0.10,0.14);
}
export function playBuySound(){
  audioTone(330,0.07,'square',0.09,0); audioTone(494,0.10,'triangle',0.10,0.07); audioTone(660,0.14,'sine',0.06,0.15);
}
export function playEquipSound(){
  audioTone(440,0.08,'square',0.08,0); audioTone(523,0.10,'triangle',0.08,0.08);
}
export function playTrophySound(){
  audioTone(523,0.09,'square',0.09,0); audioTone(659,0.09,'square',0.09,0.09); audioTone(784,0.18,'triangle',0.10,0.18);
}
// Level-up: a rising "power-up" pitch sweep that resolves into a bright
// landing chord, plus firework-burst sparkle -- same shape as the
// item-get/evolution-style sounds below, just built for the level-up moment.
// milestone=true (levels 10/25/50/75/99) gets a longer, lower-starting sweep
// with a quick flutter right at the peak, a bigger 4-note landing chord, and
// four sparkle bursts instead of one.
export function playLevelSound(milestone){
  if(!ensureAudio()) return;
  if(milestone){
    audioChirp(130, 880, 1.1, 'square', .11, 0);
    audioChirp(130, 880, 1.1, 'triangle', .06, 0);
    audioTone(880, .06, 'square', .07, .98);
    audioTone(940, .06, 'square', .07, 1.03);
    audioTone(880, .06, 'square', .07, 1.08);
    audioTone(940, .06, 'square', .07, 1.13);
    audioTone(1046.50, 1.1, 'sine', .09, 1.1);
    audioTone(1318.51, 1.1, 'sine', .09, 1.1);
    audioTone(1567.98, 1.1, 'sine', .09, 1.1);
    audioTone(2093.00, 1.1, 'sine', .09, 1.1);
    setTimeout(playFireworkBurst, 1150);
    setTimeout(playFireworkBurst, 1380);
    setTimeout(playFireworkBurst, 1620);
    setTimeout(playFireworkBurst, 1900);
  } else {
    audioChirp(220, 660, .55, 'square', .10, 0);
    audioChirp(220, 660, .55, 'triangle', .05, 0);
    audioTone(1046.50, .7, 'sine', .09, .55);
    audioTone(1318.51, .7, 'sine', .09, .55);
    audioTone(1567.98, .7, 'sine', .09, .55);
    setTimeout(playFireworkBurst, 550);
  }
}
// ---------- "Item-get" style rare-find fanfares ----------
// Uniques (COLLECTION_LOG_ITEMS, 1-in-5,000) and mythics (clothing/trinket
// pieces, 1-in-1,000) used to share one identical sound. They're now split:
// uniques get the bigger fanfare since they're the rarer of the two, mythics
// get a shorter version of the same "held note -> quick skip -> triumphant
// landing" rhythm, and finding a duplicate of something already owned (either
// kind) gets a short, light ding instead of the full fanfare.
export function playRepeatFindSound(){
  if(!ensureAudio()) return;
  audioTone(329.63, .10, 'square', .08, 0);   // E5
  audioTone(392.00, .16, 'square', .07, .08); // G5
}
export function playUniqueFoundSound(isNew){
  if(!ensureAudio()) return;
  if(!isNew){ playRepeatFindSound(); return; }
  audioTone(329.63, .22, 'square', .11, 0);    // E5 held
  audioTone(392.00, .09, 'square', .10, .24);  // G5 skip
  audioTone(440.00, .09, 'square', .10, .34);  // A5 skip
  audioTone(523.25, .55, 'square', .12, .46);  // C6 landing
  audioTone(659.25, .5,  'sine',   .07, .48);  // E6 harmony
  audioNoise(.12, .025, 3000, .46);
}
export function playMythicFoundSound(isNew){
  if(!ensureAudio()) return;
  if(!isNew){ playRepeatFindSound(); return; }
  audioTone(329.63, .18, 'square', .10, 0);    // E5 held
  audioTone(392.00, .08, 'square', .09, .20);  // G5 skip
  audioTone(440.00, .36, 'square', .10, .30);  // A5 landing
  audioNoise(.10, .02, 2800, .30);
}
// "Big One" encounter alarm -- a Yankee Stadium two-strike-siren style wail:
// one smooth continuous rise in pitch (not an up-down swoop) with a touch of
// mechanical rasp (a quiet sawtooth layer under the sine) and a thin band of
// motor-like noise, cutting off at the end of the ramp rather than fading
// back down. BIG_ONE_WAIL_MS/BIG_ONE_WAIL_GAP_MS below control the loop
// timing -- startBigOneSirenLoop()/stopBigOneSirenLoop() repeat this back to
// back continuously until the player presses Start.
var BIG_ONE_WAIL_MS = 850;
var BIG_ONE_WAIL_GAP_MS = 350;
export function playBigOneSound(){
  if(!ensureAudio()) return;
  var dur = BIG_ONE_WAIL_MS/1000;
  audioChirp(320, 760, dur, 'sine', 0.18, 0);
  audioChirp(320, 760, dur, 'sawtooth', 0.05, 0); // quiet rasp layer
  audioNoise(dur, 0.045, 2400, 0); // thin motor-like texture
}
var bigOneSirenTimer = null;
export function startBigOneSirenLoop(){
  stopBigOneSirenLoop();
  playBigOneSound();
  bigOneSirenTimer = setInterval(playBigOneSound, BIG_ONE_WAIL_MS + BIG_ONE_WAIL_GAP_MS);
}
export function stopBigOneSirenLoop(){
  if(bigOneSirenTimer){ clearInterval(bigOneSirenTimer); bigOneSirenTimer = null; }
}
// Landing a Big One: a bigger, more triumphant fanfare than the unique/mythic
// finds above, since this one was earned through the tap minigame rather than
// a pure luck roll. Rising arpeggio into a wide landing chord, plus two
// firework bursts instead of one.
export function playBigOneWinSound(){
  if(!ensureAudio()) return;
  audioTone(392.00, .12, 'square', .11, 0);    // G4
  audioTone(523.25, .12, 'square', .11, .11);  // C5
  audioTone(659.25, .12, 'square', .11, .22);  // E5
  audioTone(784.00, .16, 'square', .12, .33);  // G5 skip
  audioTone(1046.50, .7, 'sine', .11, .48);    // C6 landing
  audioTone(1318.51, .7, 'sine', .09, .48);    // E6 harmony
  audioTone(1567.98, .7, 'sine', .08, .48);    // G6 harmony
  audioNoise(.16, .03, 3200, .48);
  setTimeout(playFireworkBurst, 500);
  setTimeout(playFireworkBurst, 720);
}
// Per-circle feedback for the tap minigame -- a quick, light cue on every
// individual tap or timeout, separate from the bigger win/lose fanfares
// below (those play once, at the very end of the whole encounter).
export function playBigOneHitSound(){
  if(!ensureAudio()) return;
  audioTone(880, .05, 'square', .09, 0);
  audioTone(1174.66, .07, 'sine', .07, .04); // quick high skip, satisfying but not distracting
}
export function playBigOneMissTickSound(){
  if(!ensureAudio()) return;
  audioTone(196, .09, 'triangle', .05, 0); // short, low, deliberately unobtrusive
}
// A near-miss/failure cue for the Big One minigame: a short, deflating
// descending pair of notes -- clearly not a reward sound, but not harsh
// either, since the player did nothing "wrong" by missing.
export function playBigOneMissSound(){
  if(!ensureAudio()) return;
  audioTone(330, .16, 'triangle', .08, 0);
  audioTone(247, .28, 'triangle', .08, .12);
}
// ---------- Shrimp Swarm minigame ----------
// Deliberately higher-pitched and quicker than every Big One cue above --
// Shrimp's own flavor is "tiny and quick," and the tag sound in particular
// has to survive being triggered many times in rapid succession without
// getting grating, unlike Big One's more deliberate, spaced-out taps.
export function playShrimpSwarmStartSound(){
  if(!ensureAudio()) return;
  // A quick scatter -- four fast ascending blips, like a school darting off.
  audioTone(660, .05, 'square', .07, 0);
  audioTone(784, .05, 'square', .07, .05);
  audioTone(932, .05, 'square', .07, .10);
  audioTone(1108, .08, 'sine', .08, .15);
  audioNoise(.12, .05, 2200, 0);
}
export function playShrimpSwarmTagSound(){
  if(!ensureAudio()) return;
  audioTone(1400, .04, 'sine', .06, 0); // short and light -- tags fire often
}
export function playShrimpSwarmWinSound(){
  if(!ensureAudio()) return;
  // A bright, coin-flavored jackpot run distinct from Big One's fanfare.
  audioTone(783.99, .1, 'square', .10, 0);    // G5
  audioTone(987.77, .1, 'square', .10, .09);  // B5
  audioTone(1174.66, .1, 'square', .11, .18); // D6
  audioTone(1567.98, .5, 'sine', .12, .28);   // G6 landing
  audioTone(1975.53, .5, 'sine', .09, .28);   // B6 harmony
  audioNoise(.14, .04, 3600, .28);
  setTimeout(playFireworkBurst, 320);
  setTimeout(playFireworkBurst, 520);
}
export function playClickSound(){ audioTone(440,0.035,'square',0.035,0); }
export function playWaterSound(){ audioNoise(0.45,0.012,900,0); audioTone(150+Math.random()*35,0.18,'sine',0.018,0.05); }
export function startWaterAmbience(){
  stopWaterAmbience();
}
export function stopWaterAmbience(){ clearInterval(waterTimer); waterTimer=null; }

