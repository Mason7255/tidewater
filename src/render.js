// ---------------------------------------------------------------------------
// render.js — Toasts, the DOM-based player/character renderer, and the
// generic screen-switcher.
// ---------------------------------------------------------------------------

// ---------- Toast ----------


import { CUSTOM_HAIR, CUSTOM_HATS, CUSTOM_POLES, CUSTOM_SHIRTS, CUSTOM_SKINS, HATS, OUTFIT_COLORS, equipmentById } from './data.js';
import { state } from './state.js';

export var toastEl = document.getElementById('toast');
export var toastTimer = null;
export function showToast(msg){
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){ toastEl.classList.remove('show'); }, 2600);
}
export function showCoinGain(amount){
  if(!amount || amount <= 0) return;
  var el = document.getElementById('coinPop');
  if(!el) return;
  el.textContent = '+' + amount + ' ⛃';
  el.classList.remove('show');
  void el.offsetWidth;
  el.classList.add('show');
  clearTimeout(el._timer);
  el._timer = setTimeout(function(){ el.classList.remove('show'); }, 1400);
}

// ---------- Player rendering ----------
export function outfitHex(id){ for(var i=0;i<OUTFIT_COLORS.length;i++){ if(OUTFIT_COLORS[i].id===id) return OUTFIT_COLORS[i].hex; } return OUTFIT_COLORS[0].hex; }
export function skinById(id){ for(var i=0;i<CUSTOM_SKINS.length;i++){ if(CUSTOM_SKINS[i].id===id) return CUSTOM_SKINS[i]; } return CUSTOM_SKINS[0]; }
export function hairById(id){ for(var i=0;i<CUSTOM_HAIR.length;i++){ if(CUSTOM_HAIR[i].id===id) return CUSTOM_HAIR[i]; } return CUSTOM_HAIR[0]; }
export function shirtById(id){ for(var i=0;i<CUSTOM_SHIRTS.length;i++){ if(CUSTOM_SHIRTS[i].id===id) return CUSTOM_SHIRTS[i]; } return CUSTOM_SHIRTS[0]; }
export function hatByCustomId(id){ for(var i=0;i<CUSTOM_HATS.length;i++){ if(CUSTOM_HATS[i].id===id) return CUSTOM_HATS[i]; } return CUSTOM_HATS[0]; }
export function poleById(id){ for(var i=0;i<CUSTOM_POLES.length;i++){ if(CUSTOM_POLES[i].id===id) return CUSTOM_POLES[i]; } return CUSTOM_POLES[0]; }
export function hatIcon(id){
  var custom=hatByCustomId(id);
  if(custom && custom.id!=='hat_none') return custom.icon;
  for(var i=0;i<HATS.length;i++){ if(HATS[i].id===id) return HATS[i].icon; }
  return '';
}
export function pixelAvatarHTML(){
  var shirt = shirtById(state.shirt || 'shirt_coral').color;
  var skin = skinById(state.skin || 'skin_light').color;
  var hair = hairById(state.hair || 'hair_brown').color;
  var hat = hatByCustomId(state.hat || 'hat_none');
  var grid = Array.from({length:16}, function(){ return Array(16).fill('transparent'); });
  function paint(x,y,w,h,c){ for(var yy=y;yy<y+h;yy++) for(var xx=x;xx<x+w;xx++) if(grid[yy]&&grid[yy][xx]!==undefined) grid[yy][xx]=c; }
  paint(5,14,2,2,'#3C302A'); paint(9,14,2,2,'#3C302A');
  paint(4,8,8,6,shirt); paint(3,10,2,3,shirt); paint(11,10,2,3,shirt);
  paint(3,9,2,4,skin); paint(11,9,2,4,skin);
  paint(6,6,4,2,skin); paint(5,3,6,5,skin);
  paint(5,2,6,2,hair); paint(5,3,1,3,hair); paint(10,3,1,2,hair);
  grid[5][6]='#1c1c1c'; grid[5][9]='#1c1c1c';
  grid[8][7]=shade(shirt,-25); grid[8][8]=shade(shirt,-25);
  if(hat && hat.id!=='hat_none'){
    var hc=hat.color;
    if(hat.name.indexOf('Beanie')>=0){ paint(4,1,8,2,hc); paint(5,0,6,1,hc); }
    else if(hat.name.indexOf('Bucket')>=0){ paint(4,1,8,2,hc); paint(3,3,10,1,hc); }
    else { paint(5,1,6,2,hc); paint(4,2,8,1,hc); paint(10,3,3,1,hc); }
  }
  var cells='';
  for(var y=0;y<16;y++) for(var x=0;x<16;x++) cells += '<i class="px" style="background:'+grid[y][x]+'"></i>';
  return '<div class="pixel-avatar">'+cells+'</div>';
}

export function renderPlayer(container, withGear){
  var pole = poleById(state.poleColor || 'pole_brown'), gearHtml = '';
  if(withGear){
    var eq = equipmentById(state.gear) || equipmentById('shrimp_net');
    var kind = eq.type === 'net' ? 'gear-net' : (eq.type === 'trap' ? 'gear-trap' : 'gear-pole');
    var gearIcon = eq.type === 'biggame' ? '⚓' : '';
    gearHtml = '<div class="player-rod '+kind+'" id="playerRod" title="'+eq.name+'" style="background:'+pole.color+';">'+
      (eq.type === 'net' ? '<div class="net-hoop"></div>' : '')+
      (eq.type === 'trap' ? '<div class="trap-box"></div>' : '')+
      (gearIcon ? '<div class="gear-mini-icon">'+gearIcon+'</div>' : '')+
      '</div>';
  }
  container.innerHTML = '<div class="player">'+gearHtml+pixelAvatarHTML()+'</div>';
}

export function shade(hex, percent){
  var num = parseInt(hex.replace('#',''),16);
  var r = (num>>16)+percent, g=(num>>8 & 0x00FF)+percent, b=(num & 0x0000FF)+percent;
  r=Math.min(255,Math.max(0,r)); g=Math.min(255,Math.max(0,g)); b=Math.min(255,Math.max(0,b));
  return '#' + (0x1000000 + r*0x10000 + g*0x100 + b).toString(16).slice(1);
}

export function showScreen(id){
  var target = document.getElementById(id);
  var topbar = document.getElementById('topbar');
  var inGame = !!topbar && topbar.style.display !== 'none';
  var asSheet = inGame && target.classList.contains('panel');
  var screens = document.querySelectorAll('.screen');
  for(var i=0;i<screens.length;i++){ screens[i].classList.remove('active'); }
  if(asSheet) document.getElementById('screen-dock').classList.add('active');
  target.classList.add('active');
  if(asSheet) target.scrollTop = 0;
  document.body.classList.toggle('sheet-open', asSheet);
}
document.getElementById('panelBackdrop').addEventListener('click', function(){ showScreen('screen-dock'); });
