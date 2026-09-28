// ---------------------------------------------------------------------------
// render.js — Toasts, the DOM-based player/character renderer, and the
// generic screen-switcher.
// ---------------------------------------------------------------------------

// ---------- Toast ----------


import { CLOTHING_SLOTS, CUSTOM_HAIR, CUSTOM_HATS, CUSTOM_POLES, CUSTOM_SHIRTS, CUSTOM_SKINS, HATS, OUTFIT_COLORS, clothingItems, equipmentById } from './data.js';
import { isBuffActive, state } from './state.js';

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
// Cached the moment a full avatar grid is built, so updatePlayerBuffAccessories()
// (called every second, and right after using a consumable) can flip the
// exact same cells on/off without recomputing shirt/skin colors from scratch.
// Each entry is [x, y, offColor, onColor] -- offColor is whatever the
// underlying body art actually paints there (sleeve, skin, or bare
// background), so toggling a buff off restores the real pixel instead of
// punching a transparent hole in the sleeve/hand.
var lastBuffCellPlan = null;

// Most clothing pieces (see CLOTHING_SETS, data.js) are still just a name +
// icon + stat bonus, with no visual effect on the character at all -- the
// avatar only ever draws the base skin/hair/shirt/hat customization above.
// A piece can opt into actually changing how the character looks by
// carrying a `pixels` array: a list of [x,y,hex] cell overrides on the same
// 24x24 grid pixelAvatarHTML() paints everything else on (hand-drawn by the
// player and extracted from an exported PNG -- see the Shrimp-shell Cap
// entry in data.js for the first one). Painted last, after hair/hat/buffs,
// so an equipped piece with pixel art always wins over the base look;
// equipped pieces with no `pixels` field are unaffected (same as before).
function paintEquippedClothingPixels(grid){
  var items = clothingItems();
  CLOTHING_SLOTS.forEach(function(slot){
    var id = state.equippedClothing && state.equippedClothing[slot];
    if(!id) return;
    var item = items.filter(function(c){ return c.id===id; })[0];
    if(!item || !item.pixels) return;
    item.pixels.forEach(function(cell){
      var x=cell[0], y=cell[1], c=cell[2];
      if(grid[y] && grid[y][x]!==undefined) grid[y][x]=c;
    });
  });
}
// Builds the base 24x24 body grid (skin/hair/shirt/hat only, no buffs and no
// equipped clothing pixels) -- shared by pixelAvatarHTML() below (the real,
// live character) and the various itemPreviewAvatarHTML()/hatPreviewAvatarHTML()/
// skinPreviewAvatarHTML()/hairPreviewAvatarHTML()/shirtPreviewAvatarHTML()
// static "what this looks like" card renders, which have no buffs and
// substitute one piece of the player's current look for a candidate option
// without touching the other three. `overrides` (optional) can carry
// hatId/skinId/hairId/shirtId -- any left out fall back to the player's
// actual current state.
function buildBaseAvatarGrid(overrides){
  overrides = overrides || {};
  var shirt = shirtById(overrides.shirtId !== undefined ? overrides.shirtId : (state.shirt || 'shirt_coral')).color;
  var skin = skinById(overrides.skinId !== undefined ? overrides.skinId : (state.skin || 'skin_light')).color;
  var hair = hairById(overrides.hairId !== undefined ? overrides.hairId : (state.hair || 'hair_brown')).color;
  var hat = hatByCustomId(overrides.hatId !== undefined ? overrides.hatId : (state.hat || 'hat_none'));
  var grid = Array.from({length:24}, function(){ return Array(24).fill('transparent'); });
  function paint(x,y,w,h,c){ for(var yy=y;yy<y+h;yy++) for(var xx=x;xx<x+w;xx++) if(grid[yy]&&grid[yy][xx]!==undefined) grid[yy][xx]=c; }
  paint(7,21,3,3,'#3C302A'); paint(14,21,3,3,'#3C302A');
  paint(7,19,10,3,'#304D73');
  paint(6,12,12,7,shirt); paint(4,14,2,6,shirt); paint(18,14,2,6,shirt);
  paint(4,18,2,3,skin); paint(18,18,2,3,skin);
  paint(17,18,2,2,skin);
  paint(9,9,6,3,skin); paint(8,5,8,7,skin);
  paint(8,3,8,3,hair); paint(7,5,2,5,hair); paint(15,5,2,4,hair);
  grid[9][10]='#1c1c1c'; grid[9][13]='#1c1c1c';
  grid[13][10]=shade(shirt,-25); grid[13][11]=shade(shirt,-25); grid[13][12]=shade(shirt,-25);
  if(hat && hat.id!=='hat_none'){
    if(hat.pixels){
      // A hand-drawn hat (e.g. the achievement-unlocked Shrimp Crown --
      // see CUSTOM_HATS, data.js) carries its own exact cell art instead of
      // fitting one of the generic silhouettes below.
      hat.pixels.forEach(function(cell){ var x=cell[0], y=cell[1], c=cell[2]; if(grid[y] && grid[y][x]!==undefined) grid[y][x]=c; });
    } else {
      var hc=hat.color;
      if(hat.name.indexOf('Beanie')>=0){ paint(7,2,10,3,hc); paint(8,1,8,1,hc); }
      else if(hat.name.indexOf('Bucket')>=0){ paint(7,2,10,3,hc); paint(5,5,14,2,hc); }
      else { paint(8,2,8,3,hc); paint(6,4,12,2,hc); paint(16,6,4,1,hc); }
    }
  }
  return {grid:grid, shirt:shirt, skin:skin};
}
function gridToPixelHTML(grid, extraClass){
  var cells='';
  for(var y=0;y<24;y++) for(var x=0;x<24;x++) cells += '<i class="px" style="background:'+grid[y][x]+'"></i>';
  return '<div class="pixel-avatar'+(extraClass ? ' '+extraClass : '')+'">'+cells+'</div>';
}
export function pixelAvatarHTML(){
  var base = buildBaseAvatarGrid();
  var grid = base.grid, shirt = base.shirt, skin = base.skin;
  // Six-Pack (mug in the left/free hand -- the right hand holds the rod) and
  // Cigarettes (a few pixels at the mouth corner, plus a wisp of smoke).
  // These are painted into THIS SAME grid, at cell coordinates that sit
  // right on top of the sleeve/hand and the mouth -- not a separate
  // absolutely-positioned element -- so they can never end up floating
  // somewhere else on the page; they're physically part of the character.
  var foam='#fff8e6', amber='#e8a33d', amberDk='#c9812a';
  var beerPlan = [
    [4,15,shirt,foam],   [5,15,shirt,foam],
    [4,16,shirt,amber],  [5,16,shirt,amber],
    [4,17,shirt,amber],  [5,17,shirt,amber],
    [3,17,'transparent',amberDk],
    [4,18,skin,amberDk], [5,18,skin,amberDk],
    [4,19,skin,amberDk], [5,19,skin,amberDk]
  ];
  var cigPlan = [
    [15,11,skin,'#f5f0e6'],
    [16,11,'transparent','#f5f0e6'],
    [17,11,'transparent','#ff9d4d'],
    [18,11,'transparent','#ff5a3d']
  ];
  var smokePlan = [
    [18,9,'transparent','rgba(225,225,225,.8)'],
    [19,8,'transparent','rgba(225,225,225,.5)']
  ];
  var beerOn = isBuffActive('six_pack'), cigOn = isBuffActive('cigarettes');
  if(beerOn) beerPlan.forEach(function(c){ grid[c[1]][c[0]] = c[3]; });
  if(cigOn){
    cigPlan.forEach(function(c){ grid[c[1]][c[0]] = c[3]; });
    smokePlan.forEach(function(c){ grid[c[1]][c[0]] = c[3]; });
  }
  lastBuffCellPlan = { beer:beerPlan, cig:cigPlan, smoke:smokePlan };
  paintEquippedClothingPixels(grid);
  return gridToPixelHTML(grid);
}
// A static "item icon" render for a single clothing piece's shop/collection
// card -- the same base body as the live character (current skin/hair/shirt/
// hat), with just THIS item's own `pixels` painted on top, regardless of
// what's actually equipped right now or any active buffs. Lets a card show
// what a piece actually looks like instead of a generic emoji. Pieces with
// no `pixels` art yet fall back to their emoji (see clothingItemIconHTML()
// in screens.js) since there's nothing visual to show.
export function itemPreviewAvatarHTML(item){
  var base = buildBaseAvatarGrid();
  var grid = base.grid;
  if(item && item.pixels){
    item.pixels.forEach(function(cell){
      var x=cell[0], y=cell[1], c=cell[2];
      if(grid[y] && grid[y][x]!==undefined) grid[y][x]=c;
    });
  }
  return gridToPixelHTML(grid, 'pixel-avatar-mini');
}
// A static "item icon" render for a single Customize-tab hat tile (see
// customizeTile(), screens.js) -- the player's current skin/hair/shirt with
// THIS hat instead of whatever's actually equipped (state.hat), so every
// tile in the Hats grid shows the real look instead of a generic cap emoji.
// No equipped-clothing pixels here (clothing pieces are a separate system,
// see itemPreviewAvatarHTML() above) -- this is purely a preview of the base
// cosmetic hat on its own.
export function hatPreviewAvatarHTML(hatItem){
  var base = buildBaseAvatarGrid({hatId: hatItem ? hatItem.id : 'hat_none'});
  return gridToPixelHTML(base.grid, 'pixel-avatar-mini');
}
// Same idea as hatPreviewAvatarHTML() above, one per remaining Customize
// category: the player's current look with just that one slot swapped for
// the candidate option, so every tile in Skin/Hair/Shirt shows the real
// look instead of (or in addition to) a flat color square.
export function skinPreviewAvatarHTML(skinItem){
  var base = buildBaseAvatarGrid({skinId: skinItem.id});
  return gridToPixelHTML(base.grid, 'pixel-avatar-mini');
}
export function hairPreviewAvatarHTML(hairItem){
  var base = buildBaseAvatarGrid({hairId: hairItem.id});
  return gridToPixelHTML(base.grid, 'pixel-avatar-mini');
}
export function shirtPreviewAvatarHTML(shirtItem){
  var base = buildBaseAvatarGrid({shirtId: shirtItem.id});
  return gridToPixelHTML(base.grid, 'pixel-avatar-mini');
}

export function renderPlayer(container, withGear){
  var pole = poleById(state.poleColor || 'pole_brown'), gearHtml = '';
  if(withGear){
    var eq = equipmentById(state.gear) || equipmentById('shrimp_net');
    var kind = eq.type === 'net' ? 'gear-net' : (eq.type === 'trap' ? 'gear-trap' : 'gear-pole');
    var gearIcon = eq.type === 'biggame' ? '⚓' : '';
    var poleClass = pole.celestial ? ' pole-celestial' : '';
    var poleStyleAttr = pole.celestial ? '' : (' style="background:'+pole.color+';"');
    gearHtml = '<div class="player-rod '+kind+poleClass+'" id="playerRod" title="'+eq.name+'"'+poleStyleAttr+'>'+
      (eq.type === 'net' ? '<div class="net-hoop"></div>' : '')+
      (eq.type === 'trap' ? '<div class="trap-box"></div>' : '')+
      (gearIcon ? '<div class="gear-mini-icon">'+gearIcon+'</div>' : '')+
      '</div>';
  }
  var playerClass = withGear && kind === 'gear-trap' ? 'player has-trap' : 'player';
  container.innerHTML = '<div class="'+playerClass+'">'+gearHtml+pixelAvatarHTML()+'</div>';
  updatePlayerBuffAccessories();
}
// Flips the mug/cigarette/smoke cells (painted into pixelAvatarHTML()'s grid
// above) on or off to match the current buff state, without rebuilding the
// whole avatar -- so an in-progress rod-cast animation elsewhere in .player
// isn't interrupted by this running every second. Not scoped to one
// container: renderPlayer() runs for both the dock scene and the
// character-creation preview, and both share the same state.shirt/state.skin,
// so one cached cell plan is valid for every '.pixel-avatar' found.
export function updatePlayerBuffAccessories(){
  if(!lastBuffCellPlan) return;
  var beerOn = isBuffActive('six_pack'), cigOn = isBuffActive('cigarettes');
  function apply(plan, on){
    plan.forEach(function(c){
      var idx = c[1]*24+c[0];
      Array.prototype.forEach.call(document.querySelectorAll('.pixel-avatar'), function(avatar){
        var el = avatar.children[idx];
        if(el) el.style.background = on ? c[3] : c[2];
      });
    });
  }
  apply(lastBuffCellPlan.beer, beerOn);
  apply(lastBuffCellPlan.cig, cigOn);
  apply(lastBuffCellPlan.smoke, cigOn);
}

export function shade(hex, percent){
  var num = parseInt(hex.replace('#',''),16);
  var r = (num>>16)+percent, g=(num>>8 & 0x00FF)+percent, b=(num & 0x0000FF)+percent;
  r=Math.min(255,Math.max(0,r)); g=Math.min(255,Math.max(0,g)); b=Math.min(255,Math.max(0,b));
  return '#' + (0x1000000 + r*0x10000 + g*0x100 + b).toString(16).slice(1);
}

// ---------- Fishing Shack decor icons ----------
// Small blocky "pixel art" pieces for each decor item, built the same way as
// the character (a grid of solid-color cells) instead of a flat swatch.
// Every color in a grid comes from the item's own `color` field via shade()
// -- plus a few fixed accents (wood, gold trim, brushed metal) shared across
// every category so it all still reads as one look. Rug/sofa/curtains/table
// share one generic silhouette-plus-pattern-overlay system (see *Grid()
// below); wall art gets its own tiny bespoke scene per item since there are
// only five and each is meant to look distinct (see wallArtSVG()).
var SHACK_WOOD = '#2a2016', SHACK_GOLD = '#d9a441', SHACK_METAL = '#8a97a0';
function shackTrimColor(trimTone, color){
  if(trimTone==='gold') return SHACK_GOLD;
  if(trimTone==='metal') return SHACK_METAL;
  if(trimTone==='light') return shade(color,45);
  return shade(color,-55);
}
function shackToneMap(color, trimTone){
  return { '.':color, '#':shade(color,-30), '+':shade(color,-55), ',':shade(color,30), '*':shade(color,55), 'K':SHACK_WOOD, 'G':SHACK_GOLD, 'M':SHACK_METAL, 'T':shackTrimColor(trimTone,color) };
}
function shackGridSVG(w,h,grid,tmap){
  var rects='';
  for(var y=0;y<h;y++) for(var x=0;x<w;x++){
    var ch = grid[y][x];
    if(!ch) continue;
    var fill = tmap[ch];
    if(!fill) continue;
    rects += '<rect x="'+x+'" y="'+y+'" width="1.04" height="1.04" fill="'+fill+'"/>';
  }
  return '<svg viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none" class="shack-icon-svg">'+rects+'</svg>';
}
function rugGrid(pattern){
  var w=20,h=6, g=[];
  for(var y=0;y<h;y++){
    var row=[];
    for(var x=0;x<w;x++){
      var edge = (x===0||x===w-1||y===0||y===h-1);
      if(edge){ row.push(pattern==='trimmed' ? 'T' : '#'); continue; }
      var c='.';
      if(pattern==='striped') c = (Math.floor((x-1)/2)%2===0) ? '.' : '#';
      else if(pattern==='textured') c = ((x*7+y*3)%5===0) ? '*' : '.';
      row.push(c);
    }
    g.push(row);
  }
  return g;
}
function sofaGrid(pattern){
  var w=14,h=10, g=[];
  for(var y=0;y<h;y++) g.push(new Array(w).fill(null));
  if(pattern==='bench'){
    for(var x=0;x<w;x++){ g[0][x]='#'; g[1][x]='#'; }
    for(var y=2;y<8;y++) for(var x=0;x<w;x++) g[y][x]='.';
    g[9][2]='K'; g[9][11]='K';
    return g;
  }
  for(var x=0;x<w;x++){ g[0][x]=(pattern==='trimmed')?'T':'.'; g[1][x]=(pattern==='trimmed')?'T':'.'; }
  for(var y=2;y<8;y++){
    for(var x=0;x<w;x++){
      if(x<=1 || x>=12){ g[y][x]='#'; continue; }
      if(x===6||x===7){ g[y][x]='#'; continue; }
      var c='.';
      if(pattern==='striped') c = (Math.floor((x-2)/2)%2===0) ? '.' : '#';
      else if(pattern==='dotted') c = (x%3===0 && y%2===0) ? '#' : '.';
      else if(pattern==='textured') c = ((x*5+y*3)%4===0) ? ',' : '.';
      g[y][x]=c;
    }
  }
  g[9][2]='K'; g[9][4]='K'; g[9][9]='K'; g[9][11]='K';
  return g;
}
function curtainGrid(pattern){
  var w=6,h=14, g=[];
  for(var y=0;y<h;y++) g.push(new Array(w).fill(null));
  for(var x=0;x<w;x++) g[0][x]='K';
  for(var y=1;y<12;y++){
    for(var x=0;x<w;x++){
      var c='.';
      if(pattern==='striped') c = (x%2===0) ? '#' : '.';
      else if(pattern==='dotted') c = ((x+y)%3===0) ? '#' : '.';
      else if(pattern==='textured') c = ((x*3+y)%5===0) ? ',' : '.';
      else if(pattern==='plain') c = (x===2) ? '#' : '.';
      g[y][x]=c;
    }
  }
  var tie = (pattern==='trimmed') ? 'T' : '#';
  g[12][1]=tie; g[12][2]=tie; g[12][3]=tie; g[12][4]=tie;
  g[13][2]=tie; g[13][3]=tie;
  return g;
}
function tableGrid(pattern){
  var w=14,h=9, g=[];
  for(var y=0;y<h;y++) g.push(new Array(w).fill(null));
  if(pattern==='ringed'){
    for(var x=1;x<13;x++){ g[0][x]='.'; g[2][x]='.'; g[3][x]='.'; }
    for(var x=1;x<13;x++) g[1][x]='#';
    g[4][6]='#'; g[4][7]='#';
    for(var y=5;y<9;y++){ g[y][6]='K'; g[y][7]='K'; }
    return g;
  }
  for(var y=0;y<4;y++){
    for(var x=0;x<w;x++){
      var c='.';
      if(pattern==='striped') c = (x%3===0) ? '#' : '.';
      else if(pattern==='plain') c = (y===2) ? '#' : '.';
      else if(pattern==='trimmed') c = (y===0||x===0||x===w-1) ? 'T' : '.';
      g[y][x]=c;
    }
  }
  for(var x=2;x<12;x++) g[4][x]='#';
  for(var y=5;y<9;y++){ g[y][2]='K'; g[y][3]='K'; g[y][10]='K'; g[y][11]='K'; }
  return g;
}
function wallArtSVG(item){
  var w=12,h=8, color=item.color, mat=shade(color,-10), rects='';
  function px(x,y,fill){ rects += '<rect x="'+x+'" y="'+y+'" width="1.04" height="1.04" fill="'+fill+'"/>'; }
  for(var x=0;x<w;x++){ px(x,0,mat); px(x,h-1,mat); }
  for(var y=0;y<h;y++){ px(0,y,mat); px(w-1,y,mat); }
  var x,y;
  switch(item.pattern){
    case 'map':
      for(y=1;y<h-1;y++) for(x=1;x<w-1;x++) px(x,y,color);
      [[3,2],[4,2],[4,3],[8,4],[9,4],[9,5]].forEach(function(c){ px(c[0],c[1], shade(color,-40)); });
      break;
    case 'knot':
      for(y=1;y<h-1;y++) for(x=1;x<w-1;x++) px(x,y, shade(color,-45));
      [[5,1],[6,1],[4,2],[7,2],[3,3],[8,3],[4,4],[7,4],[5,5],[6,5]].forEach(function(c){ px(c[0],c[1], color); });
      break;
    case 'sunset':
      for(y=1;y<4;y++) for(x=1;x<w-1;x++) px(x,y,color);
      for(y=4;y<h-1;y++) for(x=1;x<w-1;x++) px(x,y, shade(color,-55));
      px(5,3, shade(color,60)); px(6,3, shade(color,60)); px(5,4, shade(color,60)); px(6,4, shade(color,60));
      break;
    case 'net':
      for(y=1;y<h-1;y++) for(x=1;x<w-1;x++) px(x,y, ((x+y)%3===0 || (x-y+21)%3===0) ? shade(color,-35) : shade(color,10));
      break;
    case 'portrait':
      for(y=1;y<h-1;y++) for(x=1;x<w-1;x++) px(x,y, shade(color,35));
      px(5,1, shade(color,-40)); px(6,1, shade(color,-40)); px(5,2, shade(color,-40)); px(6,2, shade(color,-40));
      for(x=4;x<8;x++) for(y=3;y<h-1;y++) px(x,y, shade(color,-40));
      break;
    default:
      for(y=1;y<h-1;y++) for(x=1;x<w-1;x++) px(x,y,color);
  }
  return '<svg viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none" class="shack-icon-svg">'+rects+'</svg>';
}
export function shackDecorIconHTML(item){
  if(item.slot==='wallArt') return wallArtSVG(item);
  var tmap = shackToneMap(item.color, item.trimTone);
  var w,h,grid;
  if(item.slot==='rug'){ w=20;h=6; grid=rugGrid(item.pattern); }
  else if(item.slot==='sofa'){ w=14;h=10; grid=sofaGrid(item.pattern); }
  else if(item.slot==='curtains'){ w=6;h=14; grid=curtainGrid(item.pattern); }
  else { w=14;h=9; grid=tableGrid(item.pattern); }
  return shackGridSVG(w,h,grid,tmap);
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
document.getElementById('railInventoryBtn').addEventListener('click', function(){ document.getElementById('sceneInventoryBtn').click(); });
