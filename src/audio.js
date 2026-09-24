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
// Catch sounds use a short, bright pickup pop. Higher tiers use higher pitches
// so the sound still communicates rarity without becoming a full jingle.
export function playCatchSound(stars){
  if(!ensureAudio()) return;
  stars=Math.max(1,Math.min(5,stars||1));
  var roots={1:330,2:370,3:415,4:494,5:587};
  var root=roots[stars];
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
export function playSellSound(stars){
  stars=Math.max(1,Math.min(5,stars||1));
  var roots={1:196,2:247,3:294,4:370,5:494};
  var root=roots[stars];
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
export function playLevelSound(){
  if(!ensureAudio()) return;
  // Long arcade-style level-up fanfare followed by three firework bursts.
  audioTone(330,.11,'square',.08,0);
  audioTone(392,.11,'square',.08,.10);
  audioTone(494,.12,'square',.09,.21);
  audioTone(659,.14,'triangle',.10,.34);
  audioTone(784,.14,'triangle',.10,.50);
  audioTone(988,.20,'sine',.08,.67);
  audioTone(1319,.34,'sine',.07,.88);
  playFireworkBurst();
  setTimeout(playFireworkBurst,650);
  setTimeout(playFireworkBurst,1250);
}
export function playCollectionSound(){
  audioTone(587,0.08,'square',0.08,0); audioTone(740,0.08,'square',0.08,0.08); audioTone(988,0.20,'sine',0.07,0.16);
}
export function playMegaRareSound(){
  if(!ensureAudio()) return;
  audioTone(523,.08,'square',.09,0);
  audioTone(659,.08,'triangle',.09,.08);
  audioTone(784,.10,'triangle',.10,.16);
  audioTone(1047,.14,'sine',.11,.26);
  audioTone(1319,.28,'sine',.09,.40);
  audioTone(1568,.18,'sine',.07,.58);
  audioTone(2093,.24,'sine',.05,.72);
  audioNoise(.24,.035,2800,.22);
  audioNoise(.16,.025,4200,.62);
}
export function playClickSound(){ audioTone(440,0.035,'square',0.035,0); }
export function playWaterSound(){ audioNoise(0.45,0.012,900,0); audioTone(150+Math.random()*35,0.18,'sine',0.018,0.05); }
export function startWaterAmbience(){
  stopWaterAmbience();
}
export function stopWaterAmbience(){ clearInterval(waterTimer); waterTimer=null; }

