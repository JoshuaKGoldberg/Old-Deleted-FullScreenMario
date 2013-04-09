// To do: don't really need to instantiate all global variables...?
var data, characters, solids, map, Scenery, sounds, quads, screen, paused, nokeys,
  gravity, Scenery, player, nextupk, timenext, spawning, spawnon, reset, editing, mapinput,
  jumplev1, jumplev2, ceillev, castlev, mapfuncs, ajax, loader, loadmap, deleted, elems;
 
function start() {
  window.updated = false;
  startReset();
  createMaps();
  setMap();
}

function startReset() {
  game = window;
  setSeed();
  resetUnitsize(4);
  resetTimer(14);
  speed = 1;
  if(window.innerWidth < unitsize) document.location.reload(true);
  gravity = Math.round(12 * unitsize) / 100;
  Scenery = new loadScenery();
  createQuadrants();
}

function resetUnitsize(num) {
  window.unitsize = num;
  window.unitsizet2 = unitsize * 2;
  window.unitsizet4 = unitsize * 4;
  window.unitsizet8 = unitsize * 8;
  window.unitsizet16 = unitsize * 16;
  window.unitsizet32 = unitsize * 32;
  window.unitsized2 = unitsize / 2;
  window.unitsized4 = unitsize / 4;
  window.unitsized8 = unitsize / 8;
  window.unitsized16 = unitsize / 16;
  window.unitsized32 = unitsize / 32;
  window.unitsized64 = unitsize / 64;
}
function resetTimer(num) {
  window.timer = window.timernorm = num;
  window.timert2 = num * 2;
  window.timerd2 = num / 2;
}
function resetVariables() {
  body.innerHTML = "";
  // window.scroll();
  if(!data) {
    data = new Data();
    setDataDisplay();
    muted = 0;
  }
  paused = true;
  nokeys = spawning = spawnon = gamecount = notime = qcount = editing = 0;
  if(sounds) {
    if(sounds[0]) {
      sounds.length = 1;
      sounds[0].pause();
    }
    sounds.length = 0;
  }
  sounds = [false]; // 0 is background music
  clearSounds();
  if(characters) characters.length = 0; else characters = new Array();
  if(solids) solids.length = 0; else solids = new Array();
  screen = new setScreen();
  mario = {}; // until he's actually created
  if(!window.parentwindow) window.parentwindow = false; // until it's created
  events = {}
  setBStretch();
  
  deleted = [];
  elems = [];
  // window.onblur = function() { if(!nokeys) pause(true); };
  // window.onfocus = function() { unpause(true); };
}

function setScreen() {
  this.left = this.top = 0;
  this.bottom = window.innerHeight;
  this.right = window.innerWidth;
  this.height = window.innerHeight / unitsize;
  this.width = window.innerWidth / unitsize;
  
  // Middlex is static and only used for scrolling to the right
  this.middlex = (this.left + this.right) / 2;
  
  // This is the bottom of the screen - water, pipes, etc. go until here
  botmax = this.height - ceilmax;
  if(botmax < 0) {
    body.innerHTML = "<div>Your screen isn't high enough. Make it taller, then refresh.</div>";
    doGarbageFunction();
  }
}

function upkeep() {
  if(paused) return;
  nextupk = requestAnimationFrame(upkeep);
  
  // Quadrants upkeep
  determineAllQuadrants();
  
  // Solids upkeep
  maintainSolids();
  
  // Character upkeep
  maintainCharacters();
  
  // Mario specific
  maintainMario();
  
  // Events upkeep
  handleEvents();
  
  // if(++updated > 2) updated = 0;
}

function maintainSolids() {
  var solid;
  for(var i = 0; i<solids.length; ++i) {
    solid = solids[i];
    if(solid.alive) {
      if(solid.movement) solid.movement(solid);
      updateDisplay(solid);
      // if(window.updated) updateDisplay(solid);
      // if(gamecount % 2) updateDisplay(solid);
    }
    if(!solid.alive || solid.right < quads.delx) {
      deleteThing(solid, solids, i);
      continue;
    }
  }
}

function maintainMario() {
  if(mario.alive) {
    if(mario.yvel > 0) {
      // Mario is falling
      if(!map.underwater) mario.keys.jump = 0;
      if(!mario.jumping) {
        addClass(mario, "jumping");
        mario.jumping = true;
      }
      // To do: use a variable for the > ....
      if(!mario.piping && mario.top > (screen.bottom - screen.top)) {
        // If the map has an exit loc (cloud world), transport there
        if(map.exitloc) {
          return (map.random ? setMapRandom : shiftToLocation)(map.exitloc);
        }
        // Otherwise, since Mario is below the screen, kill him dead
        clearMarioStats();
        killMario(mario, 2);
      }
    }
    if(mario.xvel > 0) {
      // Mario is moving to the right
      if(mario.right > screen.middlex) {
        // If Mario is to the right of the screen's middle, move the screen
        if(mario.right > screen.right - screen.left)
          mario.xvel = min(0, mario.xvel);
      }
    } else if(mario.left < 0) {
      // Stop Mario from going to the left.
      mario.xvel = max(0, mario.xvel);
    }
    if(mario.under) mario.jumpcount = 0;
    // Scrolloffset is how far over the middle mario's right is
    // It's multiplied by 0 or 1 for map.canscroll
    scrolloffset = (map.canscroll || (map.random && !map.noscroll)) * (mario.right - screen.middlex);
    if(scrolloffset > 0 && !map.shifting)
      scrollWindow(Math.round(min(mario.scrollspeed, scrolloffset)));
  }
}

function maintainCharacters() {
  var character;
  for(var i = 0; i<characters.length; ++i) {
    character = characters[i];
    // Gravity
    if(!character.resting) {
      if(!character.nofall) character.yvel += character.gravity || map.gravity;
      character.yvel = min(character.yvel, map.maxyvel);
    } else character.yvel = 0;
    
    // Position updating and collision detection
    updatePosition(character);
    determineThingQuadrants(character);
    character.under = character.undermid = false;
    determineThingCollisions(character);
    
    // Resting tests
    if(character.resting) {
      if(!characterOnResting(character, character.resting)) {
        character.resting = false; // Necessary for moving platforms :(
      } else {
        /*character.jumping = */character.yvel = false;
        setBottom(character, character.resting.top);
      }
    }
    
    // Movement or deletion
    // To do: rethink this...
    //// Good for performance if screen.bottom - screen.top is saved in screen and updated on shift
    // To do: is map.shifting needed?
    if(character.alive) {
      if(character.type != "mario" && !map.shifting && 
          (character.numquads == 0 || character.left > screen.right + quads.rightdiff)) {
          // (character.top > screen.bottom - screen.top || character.left < + quads.width * -1)) {
        deleteThing(character, characters, i);
      }
      else {
        if(!character.nomove && character.movement)
          character.movement(character);
        /*if(window.updated) */updateDisplay(character);
      }
    }
    else if(!map.shifting) deleteThing(character, characters, i);
  }
}

function pause(big) {
  if(paused && !nextupk) return;
  cancelAnimationFrame(nextupk);
  pauseTheme();
  paused = true;
  if(big) {
    bodystyle.opacity = .7;
    if(sounds instanceof Array && sounds[0]) {
      sounds[0].pause();
      play("Pause.wav");
    }
  }
}

function unpause() {
  if(!paused) return;
  nextupk = requestAnimationFrame(upkeep);
  paused = false;
  if(sounds instanceof Array && sounds[0])
    sounds[0].play();
  bodystyle.opacity = 1;
}

function scrollWindow(x, y) {
  x = x || 0; y = y || 0;
  var xinv = x * -1, yinv = y * -1;
  
  screen.left += x; screen.right += x;
  screen.top += y; screen.bottom += y;
  
  shiftAll(characters, xinv, yinv, false);
  shiftAll(solids, xinv, yinv, false);
  shiftAll(quads, xinv, yinv, false);
  updateQuads(xinv);
  
  // Possibility: increase the body's margin
}
// For performance reasons, shiftAll can NOT update displays from upkeep!
// Use updateAllDisplays() to explicitly do so when needed
function shiftAll(stuff, x, y, update) {
  for(var i = stuff.length - 1; i >= 0; --i)
      shiftBoth(stuff[i], x, y, update);
}

// Similar to scrollWindow, but saves mario's x-loc
function scrollMario(x, y, see) {
  pause();
  var saveleft = mario.left, savetop = mario.top, y = y || 0;
  scrollWindow(x,y);
  setLeft(mario, saveleft, see);
  setTop(mario, savetop, see);
  createQuadrants();
  unpause();
}

function keydown(event) {
  // $(document).keydown(function(e){
  if((mario && mario.dead) || paused || nokeys) return;
  switch(event.which) {
    case 37: case 65: // left
      mario.keys.run = -1;
    break;
    
    case 38: case 87: // up
      mario.keys.up = true;
      if(mario.canjump && (mario.resting || map.underwater)) {
        mario.keys.jump = 1;
        mario.canjump = mario.keys.jumplev = 0;
        // To do: can mario make a jumping sound during the spring?
        if(mario.power > 1) play("Jump Super.wav");
        else play("Jump Small.wav");
        if(map.underwater) setTimeout(function() {
          mario.jumping = mario.keys.jump = false;
        }, timer * 14);
      }
     break;
     
    case 39: case 68: // right
      mario.keys.run = 1;
    break;
    
    case 40: case 83: // down
      mario.keys.crouch = 1;
    break;
    
    case 16: // sprint
      if(mario.power == 3 && mario.keys.sprint == 0) mario.fire();
      mario.keys.sprint = 1;
    break;
    
    case 80: // paused
      if(!paused) setTimeout(function() { pause(true); }, 140);
    break;
    
    case 32: // space
      timer = timerd2;
    break;
    
    case 77: // mute/unmute
      toggleMute();
    break;
    
    case 81: // qqqqqqqqqqqqqqqqq
      if(qcount == -1) break;
      if(++qcount == 7) {
        lulz();
        qcount = -1;
      }
    break;
    
    default: 
      if(!(parentwindow && parentwindow.scrollPageBig)) return;
      parentwindow.keydown(event);
    break;
    
  }
  // e.preventDefault(); // not necessary, but just so I don't forget...
}
function keyup(event) {
  if(nokeys) return;
  switch(event.which) {
    case 37: case 65: // left
      mario.keys.run = 0;
    break;
    
    case 38: case 87: // up
      if(!map.underwater) mario.keys.jump = mario.keys.up = 0;
      mario.canjump = true;
    break;

    case 39: case 68: // right
      mario.keys.run = 0;
    break;

    case 40: case 83: // down
      mario.keys.crouch = 0;
      removeCrouch();
    break;
    
    case 16: // sprint
      mario.keys.sprint = 0;
    break;
    
    case 80: // paused
      unpause(true);
    break;
    
    case 32: // space
      timer = timernorm;
    break;

    default: return; // for typing, exit this handler for other keys
  }
}