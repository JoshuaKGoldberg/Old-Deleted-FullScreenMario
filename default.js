// To do: don't really need to instantiate global variables...
var data, characters, solids, map, Scenery, sounds, quads, screen, paused, nokeys,
  gravity, Scenery, player, nextupk, timenext, spawning, spawnon,
  jumplev1, jumplev2, ceillev, castlev, mapfuncs, ajax, loader, loadmap;

  /* Checkpoints also need to account for areas */
  /* Use something in placeObject for blocks/bricks that can pass parameters to contents */
  
function start() {
  resetUnitsize(4);
  resetTimer(14);
  if(window.innerWidth < unitsize) document.location.reload(true);
  gravity = Math.round(11 * unitsize) / 100;
  Scenery = new loadScenery();
  createQuadrants();
  createMaps();
  setMap();
  
  // // Each one is half a scroll
  // setTimeout(function() { scrollWindow(unitsize * 350, 0); }, 140);
  // setTimeout(function() { scrollWindow(unitsize * 350, 0); }, 140);
  // setTimeout(function() { scrollWindow(unitsize * 350, 0); }, 140);
  // setTimeout(function() { scrollWindow(unitsize * 350, 0); }, 140);
  // setTimeout(function() { scrollWindow(unitsize * 360, 0); }, 140); // end of 8-4
  // setTimeout(function() { scrollWindow(unitsize * 350, 0); }, 140);
  // setTimeout(function() { scrollWindow(unitsize * 294, 0); }, 140);
  
  // shiftToLocation(map.locs[1]);
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
}
function resetTimer(num) {
  window.timer = window.timernorm = num;
  window.timert2 = num * 2;
  window.timerd2 = num / 2;
}
function resetVariables() {
  body.innerHTML = "";
  if(!data) {
    data = new Data();
    setDataDisplay();
  }
  paused = true;
  nokeys = spawning = spawnon = gamecount = muted = 0;
  sounds = [false]; // 0 is background music
  if(characters) characters.length = 0; else characters = new Array();
  if(solids) solids.length = 0; else solids = new Array();
  screen = new setScreen();
  events = new JSList();
  
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
}

function upkeep() {
  if(paused) return;
  nextupk = requestAnimationFrame(upkeep);
  
  // Quadrants upkeep
  determineAllQuadrants();
  
  // Solids upkeep
  maintainSolids();
  
  // Mario specific
  maintainMario();
  
  // Character upkeep
  maintainCharacters();
  
  // Events upkeep
  handleEvents();
}

function maintainSolids() {
  var solid;
  for(var i = 0; i<solids.length; ++i) {
    solid = solids[i];
    if(solid.alive) {
      if(solid.movement) solid.movement(solid);
      updateDisplay(solid);
    }
    if(!solid.alive || (solid.numquads == 0 && map.deletesolids)) {
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
        mario.element.className += " jumping";
        mario.jumping = true;
      }
      if(!mario.piping && mario.top > (screen.bottom - screen.top)) {
        // If Mario is below the screen, kill him dead
        killMario(mario, true);
      }
    }
    if(mario.xvel > 0) {
      // Mario is moving to the right
      if(mario.right > screen.middlex) {
        // If Mario is to the right of the screen's middle, move the screen
        if(mario.right > screen.right - screen.left)
          mario.xvel = Math.min(0, mario.xvel);
      }
    } else if(mario.left < 0) {
      // Stop Mario from going to the left.
      mario.xvel = Math.max(0, mario.xvel);
    }
    if(mario.under) mario.jumpcount = 0;
    // Scrolloffset is how far over the middle mario's right is
    // It's multiplied by 0 or 1 for map.canscroll
    scrolloffset = map.canscroll * (mario.right - screen.middlex);
    if(scrolloffset > 0)
      scrollWindow(Math.round(scrolloffset));
  }
}

function maintainCharacters() {
  var character;
  for(var i = 0; i<characters.length; ++i) {
    character = characters[i];
    // Gravity
    if(!character.resting) {
      if(!character.nofall) character.yvel += character.gravity || map.gravity;
      character.yvel = Math.min(character.yvel, map.maxyvel);
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
    // Under test
    if(character.under)
      character.yvel = 0;
    
    // Movement or deletion
    if(character.alive) {
      if(character.type != "mario" && (character.top > screen.bottom + quads.height
          || character.left > screen.left + screen.right + quads.width))
        deleteThing(character, characters, i);
      else {
        if(!character.nomove && character.movement)
          character.movement(character);
        updateDisplay(character);
      }
    } else deleteThing(character, characters, i);
  }
}

function pause(big) {
  if(paused && !nextupk) return;
  cancelAnimationFrame(nextupk);
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

function toggleMute() {
  if(muted) muted = 0;
  else muted = 1;
  for(var i = 0, len = sounds.length; i<len; ++i)
    sounds[i].volume = muted ? 0 : 1;
}

// To do: put in .shouldscroll
function scrollWindow(x, y) {
  y = y || 0;
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

function shiftToLocation(loc) {
  map.canscroll = true;
  pause();
  setTimeout(function() {
    map.areanum = loc.area;
    map.area = map.areas[map.areanum];
    map.current = map.area.current;
    map.floor = map.area.floor;
    map.underwater = map.area.underwater;
    if(map.underwater) map.gravity = gravity / 2;
    else map.gravity = gravity;
    setAreaSettings();
    
    var dx = loc.xloc * unitsize - screen.left;
    var dy = map.area.yloc * unitsize - screen.top;
    scrollWindow(dx, dy);
    map.floor = screen.top + map.areas[loc.area].floor;
    createQuadrants();
    spawnMap();
    updateDisplay(mario);
    mario.xvel = mario.yvel = 0;
    bodystyle.backgroundColor = map.areas[loc.area].background;
    body.className = map.area.setting;
    unpause();
    setTimeout(function() {
      updateDisplay(mario);
      loc.entry(mario, loc.entrything);
      if(map.areas[map.areanum].setting != "")
        play(map.areas[map.areanum].setting + ".mp3", true, true);
    }, timer * 14);
  }, timer * 14);
}

function keydown(event) {
  // $(document).keydown(function(e){
  if((mario && mario.dead) || paused || nokeys) return;
  switch(event.which) {
    case 37: // left
      mario.keys.run = -1;
    break;
    
    case 38: // up
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
     
    case 39: // right
      mario.keys.run = 1;
    break;
    
    case 40: // down
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
    
    default: return; // for typing, exit this handler for other keys
  }
  // e.preventDefault(); // not necessary, but just so I don't forget...
}
function keyup(event) {
  if(nokeys) return;
  switch(event.which) {
    case 37: // left
      mario.keys.run = 0;
    break;
    
    case 38: // up
      if(!map.underwater) mario.keys.jump = mario.keys.up = 0;
      mario.canjump = true;
    break;

    case 39: // right
      mario.keys.run = 0;
    break;

    case 40: // down
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