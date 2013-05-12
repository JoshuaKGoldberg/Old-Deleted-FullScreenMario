// possible addition: map.base, which is the level things like floor and tree trunk go until
/* To do: add checkpoints :

map.checkpoints = [
  new Checkpoint(loc, xloc),
  new Checkpoint(loc, xloc)
];

*/

/*
 * Map creating
 */
function createMaps() {
  currentmap = [1,1];
  jumplev1 = 32;
  jumplev2 = 64;
  ceillev = 88; // The floor is 88 spaces (11 blocks) below the yloc = 0 level
  ceilmax = 104; // The floor is 104 spaces (13 blocks) below the top of the screen (yloc = -16)
  castlev = -48;
  
  mapfuncs = new Array(9);
  for(var i=1; i<=9; ++i) {
    mapfuncs[i] = [0,0,0,0,0];
    for(var j=mapfuncs[i].length; j>0; --j)
      mapfuncs[i][j] = window["World" + i + "" + j];
  }
  
  mapfuncs["Random"] = {
    Overworld: WorldRandomOverworld,
    Underworld: WorldRandomUnderworld,
    Underwater: WorldRandomUnderwater,
    Bridge: WorldRandomBridge,
    Sky: WorldRandomSky,
    Castle: WorldRandomCastle
  };
  
  document.cookie = "";
}

function Map() {
  this.element = this.underwater = this.current = this.current_solid = this.current_char = this.xloc = 0;
  this.canscroll = true;
  this.floor = 104;
  this.time = 400; // optionally specified later
  this.curloc = -1;
  this.gravity = gravity;
  this.maxyvel = unitsize * 1.75;
  this.maxyvelinv = this.maxyvel * -2.1;
}

function Area(setting, rawfunc) {
  this.setting = this.background = setting || "";
  this.floor = 140;
  this.current = this.current_solid = this.current_char = this.width = 0;
  this.underwater = false;
  this.presolids = [];
  this.prechars = [];
  this.rawfunc = rawfunc || function() {};
  this.creation = function() {
    this.rawfunc();      
    processAreaPostFunc(this);
  }
}

function Location(area, entry, xloc) {
  this.area = area;
  this.xloc = xloc || 0;
  this.yloc = this.floor = 0;
  // If entry is true, use entryPlain (beginning of level).
  // If it's valid, use it.
  // Otherwise, use entryNormal (drop from top)
  this.entry = ((entry == true) ? entryPlain : (entry || entryNormal));
}

function PreThing(xloc, yloc, type, arg1, arg2) {
  this.xloc = xloc;
  this.yloc = yloc;
  this.type = type;
  this.arg1 = arg1;
  this.arg2 = arg2;
  this.object = new Thing(type, arg1, arg2);
}

function setMap(one, two) {
  checkReset();
  // if(one === 0 && two === 0) return setMapRandom();
  if(one instanceof Array && one.length == 2) currentmap = one;
  else if(one && two && one <= 8 && two <= 4) currentmap = [one, two];
  pause();
  if(typeof mario != 'undefined' && mario.power) storeMarioStats();
  resetVariables();
  
  map = new Map();
  currentmap.func = mapfuncs[currentmap[0]][currentmap[1]];
  currentmap.func(map);
  map.areanum = map.curloc = 0;
  map.area = map.areas[0];
  
  data.scoreold = data.score.amount;
  
  shiftToLocation(0);
}
// For ease of transfer
// Random map pipe transports are ["Random", "XXXworld", LocationType]
// LocationType is either 1 (down) or -1 (up)
// Down means Mario is moving down; Up means Mario is moving up.
function setMapRandom(transport) {
  checkReset();
  if(typeof(transport) == "string") transport = ["Random", transport];
  else if(!transport) transport = ["Random", "Overworld"];
  data.traveledold = data.traveled;
  resetVariables();
  map = new Map();
  currentmap.func = mapfuncs[transport[0]][transport[1]];
  currentmap.func(map);
  map.areanum = map.curloc = map.sincechange = map.num_random_sections = 0;
  map.area = map.areas[0];
  map.entrancetype = transport[2];
  shiftToLocation(0);
  if(map.randname == "Sky") map.exitloc = ["Random", "Overworld", "Down"];
}
// Because using mapfuncs on custom maps is just silly
function setMapCustom(func) {
  checkReset();
  clearMarioStats();
  resetVariables();
  map = new Map();
  currentmap = ["Custom", "Map"];
  mapfuncs.Custom = {Map: func};
  func(map);
  map.areanum = map.curloc = 0;
  map.area = map.areas[0];
  
  shiftToLocation(0);
}

function shiftToLocation(loc) {
  if(loc instanceof Array) return setMapRandom(loc);
  if(typeof(loc) == "number")
    loc = map.locs[loc];
  map.canscroll = map.shifting = true;
  pause(); // just in case
  areaClear();
  
  map.areanum = loc.area;
  var area = map.area = map.areas[map.areanum];
  map.current = map.area.current = map.current_solid = map.current_char = map.area.current_solid = map.area.current_char = 0;
  resetVariables();

  area.creation();
  
  spawnMap();
  setAreaSettings();
  mario = placeMario(); // To do: this may not be needed, depending on the startfuncs
  map.shifting = false;
  
  bodystyle.visibility = "visible";
  body.className = "body " + map.area.setting;
  if(map.areas[map.areanum].setting != "")
    addEvent(playCurrentTheme, 0);
  data.time.amount = map.time;
  data.world.amount = currentmap[0] + "-" + currentmap[1];
  setDataDisplay();
  startDataTime();
  
  scrollMario(loc.xloc * unitsize);
  locMovePreparations(mario);
  loc.entry(mario, loc.entrything);
  updateAllDisplays();
  
  if(map.random) {
    data.world.amount = "Random Map";
    data.world.element.innerHTML = "WORLD<br>Random Map";
  }
  
  fastforward(speed);
}

// (screen.right - screen.left) / unitsize is width
function processAreaPostFunc(area) {
  map.current = map.current_solid = map.current_char = 0;
  area.width = max(area.width, screen.width);
  
  // If the area has loops (really just castles), do this.
  if(area.sections && area.sections[0]) {
    setBStretch();
    area.sections.current = 0;
    area.sections[0](area.sections.start);
  }
  // Otherwise, give it a ScrollBlocker at the area.width if it's not a random Sky
  else if(!map.randname && area.setting != "Sky") {
    var blocker = new PreThing(area.width, 0, ScrollBlocker);
    area.presolids.push(blocker);
  }
  
  // If it's underwater, give it the waves on top and mario's bubble event
  if(area.underwater) {
    // Random maps give themselves water
    if(!map.randname) {
      var waves = new PreThing(0, 16, Sprite, "Water", [area.width / 3, 1]);
      area.presolids.push(waves);
    }
    var block = new PreThing(0, 0, WaterBlock, area.width);
    area.presolids.push(block);
    
    addEventInterval(marioBubbles, 96, Infinity);
  }
  
  area.presolids.sort(prethingsorter);
  area.prechars.sort(prethingsorter);
}

function setBStretch() {
  bstretch = screen.width / 8 - 2; 
}

function areaClear() {
  var i;
  for(i=0; i<solids.length; ++i)
    removeElementCautious(solids[i].element);
  for(i=0; i<characters.length; ++i)
    if(characters[i].type != "mario")
      removeElementCautious(characters[i].element);
  
  solids = [];
  characters = [];
  map.area.presolids = [];
  map.area.prechars = [];
  events = [];
}

function removeElementCautious(element) {
  if(element && element.parentNode === body)
    body.removeChild(element);
}

// To do: add in other stuff
function setAreaSettings() {
  map.underwater = map.area.underwater;
  map.jumpmod = 1.056 + 3.5 * map.underwater;
  map.has_lakitu = false;
  addEvent(function() {
    if(map.underwater) mario.gravity = gravity / 2.8;
    else mario.gravity = gravity;
  }, 1);
}

// To do: what's the point of having both area.current and map.current?
// Solids are spawned a little bit before characters
function spawnMap() {
  // Spawn solids
  var arr = map.area.presolids, prething, thing;
  while(arr.length > map.current_solid && screen.right + quads.width * 2 + quads.rightdiff >= arr[map.current_solid].xloc * unitsize) {
    prething = arr[map.current_solid];
    thing = prething.object;
    addThing(thing, prething.xloc * unitsize - screen.left, prething.yloc * unitsize);
    thing.placenum = map.current_solid;
    ++map.current_solid;
  }
  // Spawn characters
  arr = map.area.prechars;
  while(arr.length > map.current_char && screen.right + quads.rightdiff >= arr[map.current_char].xloc * unitsize) {
    prething = arr[map.current_char];
    thing = prething.object;
    addThing(thing, prething.xloc * unitsize - screen.left, prething.yloc * unitsize);
    thing.placenum = map.current_char;
    ++map.current_char;
  }
  map.area.current = map.current;
  map.area.current_solid = map.current_solid;
  map.area.current_char = map.current_char;
}

function endLevel() {
  if(map.ending) return;
  map.ending = true;
  if(map.random) setMapRandom(["Random", "Castle"]);
  else setNextLevelArr(currentmap);
  storeMarioStats();
  pause();
  setMap();
}

function setNextLevelArr(arr) {
  if(arr[1]++ == 4) {
    ++arr[0];
    arr[1] = 1;
  }
}

// Distance from the yloc to botmax
//// Assumes yloc is in the form given by mapfuncs - distance from floor
function DtB(yloc, divider) {
  return (yloc + botmax) / (divider || 1);
}
// Shorthand for Distance to Bottom

function goToTransport(transport) {
  // Goes to a new map
  if(transport instanceof Array) { 
    map.ending = true;
    storeMarioStats();
    pause();
    if(map.random) setMapRandom(transport);
    else setMap(transport);
  }
  // Goes to a new Location
  else shiftToLocation(map.locs[transport]);
}
/*
 * Yay, pipe movement!
 * Pipe z-index is normally 3
 * Mario z-index is normally 14
 */
function intoPipeVert(me, pipe, transport) {
  if(!pipe.transport || !me.resting || 
                        me.right + unitsizet2 > pipe.right ||
                        me.left - unitsizet2 < pipe.left) return;
  pipePreparations(me);
  unpause();
  var move = setInterval(function() {
    shiftVert(me, unitsized4, true);
    if(me.top >= pipe.top) {
      clearInterval(move);
      setTimeout(function() { goToTransport(transport); }, 700);
    }
  }, timer);
}
function intoPipeHoriz(me, pipe, transport) {
  console.log("trying " + me.keys.run + ", " + String(me.resting));
  if(!me.keys.run || !(me.resting || map.underwater)) return;
  pipePreparations(me);
  var move = setInterval(function() {
    shiftHoriz(me, unitsized4, true);
    if(me.left >= pipe.left) {
      clearInterval(move);
      setTimeout(function() { goToTransport(transport); }, 700);
    }
  }, timer);
}
function pipePreparations(me) {
  // clearSounds();
  pauseTheme();
  play("Pipe.wav");
  locMovePreparations(me);
  me.nofall = me.nocollide = nokeys = notime = true;
  me.movement = me.xvel = me.yvel = 0;
}

function locMovePreparations(me) {
  pause();
  me.keys = new Keys();
  me.nocollide = me.piping = me.element.style.zIndex = 1;
  me.placed = false;
  removeCrouch();
  removeClass(me, "running");
  removeClass(me, "jumping");
  removeClass(me, "flipped");
}
function exitPipeVert(me, pipe) {
  me.nofall = nokeys = notime = true;
  play("Pipe.wav");
  setTop(me, pipe.top);
  setMidXObj(me, pipe, true);
  step();
  var dy = unitsize / -4, move = setInterval(function() {
    shiftVert(me, dy, true);
    if(me.bottom <= pipe.top) {
      clearInterval(move);
      me.nocollide = me.piping = me.nofall = nokeys = notime = false;
      me.placed = true;
      me.element.style.zIndex = 14;
      unpause();
    }
  }, timer);
}
function enterCloudWorld(me, nopause) {
  // There are four cloud blocks to the left
  // The vine goes up until it has four blocks above the clouds, then waits 2 seconds
  // Mario climbs up the left until two blocks from the top, then switches & jumps
  if(!nopause) pause();
  else unpause();
  
  if(map.random) map.exitloc = getAfterSkyTransport();
  
  var screenbottom = 140 * unitsize,
      screentop = 72 * unitsize;
  setTop(me, screenbottom);
  setLeft(me, unitsize * 30);
  me.element.style.zIndex = 14;
  removeClass(me, "jumping");
  addClasses(me, ["climbing", "animated"]);
  me.climbing = addSpriteCycleManual(me, ["one", "two"], "climbing");
  me.nofall = true;
  
  me.attached = new Thing(Vine, -1);
  addThing(me.attached, unitsizet32, screenbottom - unitsizet8);
  
  var movement = setInterval(function() {
    // Vine moving up
    shiftVert(me.attached, unitsized4 * -1, true);
    if(me.attached.top <= screentop) {
      clearInterval(movement);
      setTop(me.attached, screentop, true);
      me.attached.movement = false;
      var stopheight = me.attached.top + unitsizet16;
      movement = setInterval(function() {
        // Mario moving up
        shiftVert(me, unitsized4 * -1, true);
        if(me.top <= stopheight) {
          // Mario stops moving up
          removeClass(me, "animated");
          clearInterval(movement);
          setTop(me, stopheight, true);
          clearInterval(movement);
          setTimeout(function() {
            // Mario switches sides
            setLeft(me, unitsize * 36, true);
            addClass(me, "flipped");
            setTimeout(function() {
              // Mario hops off
              // unattachMario(me);
              marioHopsOff(me, me.attached);
              mario.cycles.climbing.push("three"); // emulates running
            }, timer * 28);
          }, timer * 14);
        }
      }, timer);
    }
  }, timer);
}
function entryPlain(me) {
  pause();
  setLeft(me, unitsizet16);
  setBottom(me, map.floor * unitsize);
  me.nocollide = me.piping = false;
  me.placed = true;
  me.element.style.zIndex = 14;
  unpause();
}
function entryNormal(me) {
  pause();
  setLeft(me, unitsizet16);
  setTop(me, unitsizet16);
  me.nocollide = me.piping = false;
  me.placed = true;
  me.element.style.zIndex = 14;
  unpause();
}
function entryRandom(me) {
  data.time.amount = 0;
  data.time.dir = 1;
  map.random = true;
  updateDataElement(data.time);
  if(map.startwidth) {
    if(!map.nofloor) pushPreFloor(0, 0, map.startwidth);
  }
  else map.startwidth = 0;
  map.firstRandomThings(map);
  map.randtype((map.startwidth + 1) * 8); //17 * 8
  entryPlain(me);
  addDistanceCounter();
  addSeedDisplay();
  // To do: remember to set the text & width of the curmap datadisplay
  switch(map.entrancetype) {
    case "Down": 
      entryNormal(mario);
    break;
    case "Up":
      // Use a pipe
      locMovePreparations(mario);
      exitPipeVert(mario, addThing(new Thing(Pipe, 32), unitsizet8, (map.floor - 32) * unitsize));
    break;
    case "Vine":
      // Do that vine stuff
      locMovePreparations(mario);
      addEvent(function() { enterCloudWorld(mario, true); }, 1);
      mario.nofall = true;
      spawnMap();
    break;
    default:
      // Only reached by Overworld the first time
      if(map.randname == "Overworld") addThing(new Thing(Sprite, "Castle", 1), unitsizet16 * -1, (map.floor - 88) * unitsize);
    break;
  }
}

function nextLocation() {
  ++map.curloc;
  map.refx = map.locs[map.curloc].xloc;
  map.refy = map.locs[map.curloc].yloc + map.floor;
  map.areanum = map.locs[map.curloc].area;
}
function setLocationThing(thing) {
  location.thing = thing;
}
function setLocationGeneration(num) {
  map.curloc = num;
  map.refx = map.locs[map.curloc].xloc;
  map.refy = map.locs[map.curloc].yloc + map.floor;
  map.areanum = map.locs[map.curloc].area;
}

// Used by cloud worlds
function setExitLoc(num) {
  map.exitloc = num;
}

/*
 * Adding Functions
 */
// Most of which call pushPre

function pushPreThing(type, xloc, yloc, extras, more) {
  if(isNaN(xloc)) return alert(type.name + ", " + xloc + ", " + yloc);
  var prething = new PreThing(map.refx + xloc, map.refy - yloc, type, extras, more);
  if(prething.object.solid && !prething.object.nostretch) {
    map.area.width = max(map.area.width, prething.xloc + prething.object.width);
    map.area.presolids.push(prething);
  }
  else map.area.prechars.push(prething);
  return prething;
}
function pushPreScenery(name, xloc, yloc, repx, repy) {
  repx = repx || 1; repy = repy || 1;
  var prething = new PreThing(map.refx + xloc, map.refy - yloc, Sprite, name, [repx, repy]);
  prething.yloc -= prething.object.height
  map.area.presolids.push(prething);
  return prething;
}

// Get rid of these two...
function pushPreThingsVert(type, xloc, yloc, height, num, extras, more) {
  for(var i=1; i<=num; ++i)
    pushPreThing(type, xloc, yloc + i * height, extras, more);
}

function fillPreThing(type, xloc, yloc, numx, numy, width, height, extras, more) {
  var x = xloc, y;
  for(var i = 0, j; i < numx; ++i) {
    y = yloc;
    for(j = 0; j < numy; ++j) {
      pushPreThing(type, x, y, extras, more);
      y += height;
    }
    x += width;
  }
}

function pushPreFloor(xloc, yloc, length) {
  pushPreThing(Floor, xloc, yloc || 0, length || 1, DtB(yloc, 8));
}

function makeCeiling(xloc, num) {
  num = num || 1;
  for(var i=0; i<num; ++i)
    pushPreThing(Brick, xloc + i * 8, ceillev);
}
function makeCeilingCastle(xloc, bwidth, bheight) {
  pushPreThing(Stone, xloc, ceillev, bwidth || 1, bheight || 1);
}

function pushPreBridge(xloc, yloc, length, sides) {
  pushPreScenery("Railing", xloc, yloc, length * 2);
  pushPreThing(BridgeBase, xloc, yloc, length);
  if(sides instanceof Array) {
    if(sides[0]) pushPreThing(Stone, xloc - 8, yloc, 1, 64);
    if(sides[1]) pushPreThing(Stone, xloc + length * 8, yloc, 1, 64);
  }
}

function fillPreWater(xloc, yloc, width) {
  // Water is of width 3
  var dtb = DtB(yloc);
  pushPreScenery("Water", xloc, yloc - dtb, width * 4 / 3, dtb / 5.5);
}

function pushPrePlatformGenerator(xloc, width, dir) {
  pushPreThing(PlatformGenerator, xloc, ceilmax + 16, width, dir);
}

// settings = [platwidth, offy1, offy2] (offy is distance from top to platform)
function pushPreScale(xloc, yloc, width, settings) {
  var platwidth = settings[0],
      offx = platwidth * 2,
      offy1 = settings[1] + 1.5,
      offy2 = settings[2] + 1.5,
      me = pushPreThing(Scale, xloc, yloc, width).object;
  
  // Set the platforms
  platleft = pushPreThing(Platform, xloc - offx, yloc - offy1 * 4, platwidth, moveFallingScale).object;
  platright = pushPreThing(Platform, xloc + width * 4 - platwidth - 6, yloc - offy2 * 4, platwidth, moveFallingScale).object;
  platleft.parent = me; platright.parent = me;
  platleft.partner = platright; platright.partner = platleft;
  platleft.tension = offy1 * unitsize * 4 - unitsizet8; 
  platright.tension = offy2 * unitsize * 4 - unitsizet8;
  
  // Set the tension
  me.tensionleft = offy1 * unitsize;
  me.tensionright = offy2 * unitsize;
  
  // Add the strings
  platleft.string = pushPreScenery("String", xloc, yloc - offy1 * 4, 1, offy1 * 4).object;
  platright.string = pushPreScenery("String", xloc + width * 4 - 1, yloc - offy2 * 4, 1, offy2 * 4).object;
}

// worlds gives the pipe [X,Y]
// offset is how far between scrollblocker and main area (8 before first pipe)
// block is whether the screen should be blocked from scrolling to this
function pushPreWarpWorld(xloc, yloc, worlds, offset, block) {
  if(worlds.length == 1) worlds = [-1, worlds[0], -1];
  var startx = (offset || 0) + xloc + 10,
      len = worlds.length, pirhana;
  
  warp = pushPreThing(WarpWorld, xloc, yloc + ceilmax).object;
  var title = pushPreThing(text, startx, 58, ["WELCOME TO WARP ZONE!"], true);
  warp.texts.push(title.object);
  
  for(var i=0; i<len; ++i) {
    if(worlds[i] != -1) {
      pushPrePipe(startx, yloc, 24, false, worlds[i]);
      pirhana = pushPreScenery("pirhana", startx + 4, yloc + 24).object;
      warp.pirhanas.push(pirhana);
      if(worlds[i] instanceof Array)
        warp.texts.push(pushPreThing(text, startx + 4, 38, [worlds[i][0]], true).object);
    }
    startx += 32;
  }
  
  if(block) {
    window.block = pushPreThing(ScrollBlocker, xloc, ceilmax);
    pushPreThing(ScrollBlocker, startx + 16, ceilmax);
  }
}

function goUnderWater() {
  map.area.underwater = true;
}

/*
 * Specific creation of often-used stuff
 */
// The detector has stuff stored in it, so the animation functions can use them
// Some worlds (8-3, for example) have an unusual distance from flag to castle
function endCastleOutside(xloc, yloc, castlevel, wall, dist) {
  if(castlevel) castlevel = castlev;
  dist = dist || 20;
  var detect = pushPreThing(FlagDetector, xloc + 7, yloc + 108).object;
  detect.flag = pushPreThing(Flag, xloc + .5, yloc + 79.5).object;
  detect.stone = pushPreThing(Stone, xloc + 4, yloc + 8).object;
  detect.top = pushPreThing(FlagTop, xloc + 6.5, 84).object;
  detect.pole = pushPreThing(FlagPole, xloc + 8, 80).object;
  var detect2 = pushPreThing(CastleDoorDetector, xloc + 60 + (castlev == 0) * 8, 8).object;
  detect2.castle = pushPreScenery("Castle", xloc + dist, yloc + castlevel).object;
  if(wall) pushPreScenery("CastleWall", xloc + dist + 72, yloc, wall);
  if(castlevel == 0) shiftHoriz(detect2, unitsizet8);
}

function startCastleInside() {
  pushPreThing(Stone, 0, 88, 5, 3);
  pushPreThing(Stone, 0, 48, 3, DtB(48, 8));
  pushPreThing(Stone, 24, 40, 1, DtB(40, 8));
  pushPreThing(Stone, 32, 32, 1, DtB(32, 8));
}

function endCastleInside(xloc, last) {
  var axe = pushPreThing(CastleAxe, xloc + 104, 56).object;
  pushPreThing(ScrollBlocker, xloc + 112, ceilmax); // 104 + 16
  axe.bridge = pushPreThing(CastleBridge, xloc, 24, 13).object;
  axe.chain = pushPreThing(CastleChain, xloc + 96.5, 32).object;
  axe.bowser = pushPreThing(Bowser, xloc + 69, 42).object;
  
  pushPreThing(Stone, xloc, 88, 32);
  fillPreWater(xloc, 0, 26);
  pushPreFloor(xloc + 104, 32, 3);
  pushPreFloor(xloc + 104, 0, 19);
  pushPreThing(Stone, xloc + 112, 80, 2, 3);
  
  // If last == 2, query the NPC from the server
  if(last == 2) placeRandomCastleNPC(xloc);
  
  // Otherwise, either put Peach or that jerk Toad
  else {var npc;
    if(last) npc = pushPreThing(Peach, xloc + 194, 13).object;
    else npc = pushPreThing(Toad, xloc + 194, 12).object;
    npc.text = [
      pushPreThing(text, xloc + 160, 66, ["THANK YOU MARIO!", 88, 24, true]).object,
      pushPreThing(text, xloc + 148, 50, ["Come back soon for the full game!", 88, 24, true]).object
    ];
  }
  
  // Stop that scrolling.
  pushPreThing(ScrollBlocker, xloc + 256, ceilmax);
}

function pushPreSectionPass(xloc, yloc, width, height, secnum) {
  var passer = pushPreThing(Collider, xloc, yloc, [width, height], [sectionPass, sectionColliderInit]).object,
      secnum = map.area.sections.current || 0,
      section = map.area.sections[secnum];
  
  if(section.numpass) ++section.numpass;
  else section.numpass = 1;
  
  if(!section.colliders) section.colliders = [passer];
  else section.colliders.push(passer);
}
function pushPreSectionFail(xloc, yloc, width, height, secnum) {
  var failer = pushPreThing(Collider, xloc, yloc, [width, height], [sectionFail, sectionColliderInit]).object,
      secnum = map.area.sections.current || 0,
      section = map.area.sections[secnum];
  
  if(!section.colliders) section.colliders = [failer];
  else section.colliders.push(failer);
}
function pushCastleDecider(xloc, secnum) {
  pushPreThing(castleDecider, xloc, ceilmax, xloc, secnum);
}
function sectionColliderInit(me) {
  me.sections = map.area.sections;
  me.parent = me.sections[me.sections.current];
  me.movement = false;
}
function sectionPass(character, collider) {
  if(character.type != "mario") return false;
  collider.nocollide = true;
  var parent = collider.parent;
  if(--parent.numpass) return;
  activateSection(collider.parent, true);
}
function sectionFail(character, collider) {
  if(character.type != "mario") return false;
  collider.nocollide = true;
  
  activateSection(collider.parent, false);
}
function activateSection(parent, status) {
  var colliders = parent.colliders;
  for(var i=colliders.length-1; i>=0; --i)
    killNormal(colliders[i]);
  
  parent.activated = true;
  parent.passed = status;
}

function pushPreTree(xloc, yloc, width) {
  pushPreThing(TreeTop, xloc, yloc, width);
  // Although the tree trunks in later trees overlap earlier ones, it's ok because
  // the pattern is indistinguishible when placed correctly.
  var dtb = DtB(yloc - 8);
  pushPreScenery("TreeTrunk", xloc + 8, yloc - dtb - 8, width - 2 , dtb / 8); 
}
function pushPreShroom(xloc, yloc, width) {
  pushPreThing(ShroomTop, xloc, yloc, width);
  var dtb = DtB(yloc - 8);
  pushPreScenery("ShroomTrunk", xloc + width * 4 - 4, yloc - dtb - 8, 1, dtb / 8);
}

function pushPrePipe(xloc, yloc, height, pirhana, intoloc, exitloc) {
  if(!isFinite(height)) {
    height = screen.height;
    yloc -= screen.height;
  }
  var pipe = pushPreThing(Pipe, xloc, yloc + height, height, intoloc).object;
  
  if(pirhana) pipe.pirhana = pushPreThing(Pirhana, xloc + 4, yloc + height);
  if(exitloc) {
    map.locs[exitloc].entrything = pipe;
    map.locs[exitloc].xloc = xloc;
  }
}


function pushPreFuncCollider(xloc, func) {
  pushPreThing(FuncCollider, xloc, ceilmax + 40, func);
}
function pushPreFuncSpawner(xloc, func) {
  pushPreThing(FuncSpawner, xloc, jumplev1, func);
}

function zoneEnableLakitu() {
  map.zone_lakitu = true;
  enterLakitu();
}
function zoneDisableLakitu() {
  if(!map.has_lakitu) return;// killNormal(me);
  
  var lakitu = map.has_lakitu;
  map.zone_lakitu = map.has_lakitu = false;
  
  if(!lakitu.lookleft) {
    lakitu.lookleft = true;
    removeClass(lakitu, "flipped");
  }
  lakitu.movement = function(me) {
    me.xvel = max(me.xvel - unitsized32, unitsize * -1);
  };
}
function zoneStartCheeps(xloc) { pushPreFuncCollider(xloc, zoneEnableCheeps); }
function zoneStopCheeps(xloc) { pushPreFuncCollider(xloc, zoneDisableCheeps); }
function zoneEnableCheeps(me) {
  if(map.zone_cheeps || !me.mario) return;
  startCheepSpawn();
}
function zoneDisableCheeps(me) {
  if(!me.mario) return;
  map.zone_cheeps = false;
}

/*
 * Starting functions
 */
function walkToPipe() {
  mario = placeMario();
  mario.maxspeed = mario.walkspeed;
  nokeys = mario.keys.run = notime = true;
  map.canscroll = false;
  
  var move = setInterval(function() {
    if(mario.piping) {
      if(sounds[0]) sounds[0].pause();
      nokeys = mario.keys.run = notime = false;
      clearInterval(move);
      mario.maxspeed = mario.maxspeedsave;
    }
  }, timer);
  unpause();
}

function startCastle() {
  mario = placeMario();
  setBottom(mario, unitsize * 56);
  setLeft(mario, unitsizet2, true);
  unpause();
}

// This is for patterns
// Sprites will have optional inputs for how many vertically/horizontally
function pushPrePattern(name, xloc, yloc, reps) {
  var xpos = xloc, allsprites = Scenery.sprites, pattern = Scenery.patterns[name];
  for(var i=0; i<reps; ++i) {
    for(var j in pattern) {
      // Get the sprite information
      info = pattern[j];
      if(!(info instanceof Array)) continue;
      //[0] is name, [1/2] are x/yloc, [3/4] are repx/y (1 by default)
      pushPreScenery(info[0], xpos + info[1], yloc + info[2], info[3], info[4]);
    }
    xpos += pattern.width;
  }
}

// This is here so the server doesn't have to send it on every single page load
function World11(map) {
  map.locs = [
    new Location(0, true),
    new Location(0, exitPipeVert),
    new Location(1)
  ];
  map.areas = [
    new Area("Overworld", function() {
      setLocationGeneration(0);
      
      var greeter = "";
      greeter += "<div style='width:350px;background-color:#d64d00;border-radius:7px;box-shadow:3px 3px #efb28b inset, -3px -3px black inset;";
      greeter += "background-image: url(\"Theme/Greeting.gif\"), url(\"Theme/Greeting.gif\"), url(\"Theme/Greeting.gif\"), url(\"Theme/Greeting.gif\");";
      greeter += "background-repeat: no-repeat;";
      greeter += "background-position: 7px 7px, 336px 7px, 7px 168px, 336px 168px";
      greeter += "'>";
      greeter += "  <p style='text-align:left;padding:7px 0 11px 11px;color:#ffcccc;font-family: Super Plumber Bros;font-size:77px;text-shadow:3px 8px black'>";
      greeter += "    <span style='font-size:84px'>super</span>";
      greeter += "    <br><br>"; // To do: make this not so font dependant
      greeter += "    <span style='font-size:81px;line-height:96px'>MARIO BROS.</span>";
      greeter += "  </p>";
      greeter += "</div>";
      greeter += "<div style='text-align:right;color:#ffcccc;margin-top:-7px'>&copy;1985 NINTENDO</div>";
      // if(data.lives.amount == 3) {
        greeter += "<p id='explanation' style='text-align:center;<!--/*text-shadow:2px 2px 1px black;*/-->margin-left:7px;'>";
        greeter += "  Arrow/WASD keys move";
        greeter += "  <br>";
        greeter += "  Shift to fire/sprint";
        greeter += "  <br>";
        greeter += "  P/M to pause/mute";
        // greeter += "  <br>";
        // greeter += "  TOP- " + (localStorage.highscore || "000000");
        greeter += "</p>";
      // }
      pushPreThing(text, 20, 91, [greeter]);
      // addEventInterval(function(threshold) {
        // if(mario.left > threshold) {
          // explanation.style.transition = "all 1400ms";
          // explanation.style.opacity = "0";
          // return true;
        // }
      // }, 1, Infinity, unitsize * 96);
      
      
      pushPrePattern("backreg", 0, 0, 5);
      pushPreFloor(0, 0, 69);
      
      pushPreThing(Block, 128, jumplev1);
      pushPreThing(Brick, 160, jumplev1);
      pushPreThing(Block, 168, jumplev1, Mushroom);
      pushPreThing(Goomba, 176, 8);
      pushPreThing(Brick, 176, jumplev1);
      pushPreThing(Block, 176, jumplev2);
      pushPreThing(Block, 184, jumplev1);
      pushPreThing(Brick, 192, jumplev1);
      pushPrePipe(224, 0, 16, false);
      pushPrePipe(304, 0, 24);
      pushPrePipe(368, 0, 32);
      pushPreThing(Goomba, 340, 8);
      pushPrePipe(368, 0, 32);
      pushPreThing(Goomba, 412, 8);
      pushPreThing(Goomba, 422, 8);
      pushPrePipe(456, 0, 32, false, 2);
      pushPreThing(Block, 512, 40, [Mushroom, 1], true);
      pushPreFloor(568, 0, 15);
      pushPreThing(Brick, 618, jumplev1);
      pushPreThing(Block, 626, jumplev1, Mushroom);
      pushPreThing(Brick, 634, jumplev1);
      pushPreThing(Brick, 640, jumplev2);
      pushPreThing(Goomba, 640, jumplev2 + 8);
      pushPreThing(Brick, 648, jumplev2);
      pushPreThing(Brick, 656, jumplev2);
      pushPreThing(Goomba, 656, jumplev2 + 8);
      pushPreThing(Brick, 664, jumplev2);
      pushPreThing(Brick, 672, jumplev2);
      pushPreThing(Brick, 680, jumplev2);
      pushPreThing(Brick, 688, jumplev2);
      pushPreThing(Brick, 696, jumplev2);
      pushPreFloor(712, 0, 64);
      pushPreThing(Brick, 728, jumplev2);
      pushPreThing(Brick, 736, jumplev2);
      pushPreThing(Brick, 744, jumplev2);
      pushPreThing(Brick, 752, jumplev1, Coin);
      pushPreThing(Block, 752, jumplev2);
      pushPreThing(Goomba, 776, 8);
      pushPreThing(Goomba, 788, 8);
      pushPreThing(Brick, 800, jumplev1);
      pushPreThing(Brick, 808, jumplev1, Star);
      pushPreThing(Block, 848, jumplev1);
      pushPreThing(Koopa, 856, 12);
      pushPreThing(Block, 872, jumplev1);
      pushPreThing(Block, 872, jumplev2, Mushroom);
      pushPreThing(Block, 896, jumplev1);
      pushPreThing(Goomba, 912, 8);
      pushPreThing(Goomba, 924, 8);
      pushPreThing(Brick, 944, jumplev1);
      pushPreThing(Brick, 968, jumplev2);
      pushPreThing(Brick, 976, jumplev2);
      pushPreThing(Brick, 984, jumplev2);
      pushPreThing(Goomba, 992, 8);
      pushPreThing(Goomba, 1004, 8);
      pushPreThing(Goomba, 1024, 8);
      pushPreThing(Goomba, 1036, 8);
      pushPreThing(Brick, 1024, jumplev2);
      pushPreThing(Brick, 1032, jumplev1);
      pushPreThing(Block, 1032, jumplev2);
      pushPreThing(Brick, 1040, jumplev1);
      pushPreThing(Block, 1040, jumplev2);
      pushPreThing(Brick, 1048, jumplev2);  
      // To do: clean these genericstones up
      pushPreThing(GenericStone, 1072, 8);
      pushPreThing(GenericStone, 1080, 16, 1, 2);
      pushPreThing(GenericStone, 1088, 24, 1, 3);
      pushPreThing(GenericStone, 1096, 32, 1, 4);
      pushPreThing(GenericStone, 1120, 32, 1, 4);
      pushPreThing(GenericStone, 1128, 24, 1, 3);
      pushPreThing(GenericStone, 1136, 16, 1, 2);
      pushPreThing(GenericStone, 1144, 8);
      pushPreThing(GenericStone, 1184, 8);
      pushPreThing(GenericStone, 1192, 16, 1, 2);
      pushPreThing(GenericStone, 1200, 24, 1, 3);
      pushPreThing(GenericStone, 1208, 32, 1, 4);
      pushPreThing(GenericStone, 1216, 32, 1, 4);
      
      pushPreFloor(1240, 0, 69);
      pushPreThing(GenericStone, 1240, 32, 1, 4);
      pushPreThing(GenericStone, 1248, 24, 1, 3);
      pushPreThing(GenericStone, 1256, 16, 1, 2);
      pushPreThing(GenericStone, 1264, 8, 1, 1);
      pushPrePipe(1304, 0, 16, false, false, 1);
      
      pushPreThing(Brick, 1344, jumplev1);
      pushPreThing(Brick, 1352, jumplev1);
      pushPreThing(Block, 1360, jumplev1);
      pushPreThing(Brick, 1368, jumplev1);
      pushPreThing(Goomba, 1392, 8);
      pushPreThing(Goomba, 1404, 8);
      
      pushPrePipe(1432, 0, 16);
      pushPreThing(GenericStone, 1448, 8);
      pushPreThing(GenericStone, 1456, 16, 1, 2);
      pushPreThing(GenericStone, 1464, 24, 1, 3);
      pushPreThing(GenericStone, 1472, 32, 1, 4);
      pushPreThing(GenericStone, 1480, 40, 1, 5);
      pushPreThing(GenericStone, 1488, 48, 1, 6);
      pushPreThing(GenericStone, 1496, 56, 1, 7);
      pushPreThing(GenericStone, 1504, 64, 2, 8);
      endCastleOutside(1580, 0, castlev);
    }),
    new Area("Underworld", function() {
      setLocationGeneration(2);
      makeCeiling(32, 7);
      pushPreFloor(0, 0, 17);
      fillPreThing(Brick, 0, 8, 1, 11, 8, 8);
      fillPreThing(Brick, 32, 8, 7, 3, 8, 8);
      fillPreThing(Coin, 33, 31, 7, 2, 8, 16);
      fillPreThing(Coin, 41, 63, 5, 1, 8, 8);
      pushPreThing(PipeSide, 104, 16, 1);
      pushPreThing(PipeVertical, 120, 88, 88);
    })
  ];
}

function randMapType(map) {
  map.locs = [
    new Location(0, entryRandom)
  ];
  map.areas = [
    new Area(map.areatype, function() {
      setLocationGeneration(0);
      if(map.randname == "Underwater") {
        goUnderWater();
        // To do: make a unified function for adding in water & blocker, by the block width
        pushPreScenery("Water", 0, ceilmax - 21.5, (map.startwidth + 1) * 8 / 3, 1)
        pushPreThing(WaterBlock, 0, ceilmax, (map.startwidth + 1) * 8);
      }
      // if(map.randname == "Sky")
        // map.locs[0].entry = enterCloudWorld
    })
  ];
  map.treefunc = randTrue(3) ? pushPreTree : pushPreShroom;
  map.treeheight = map.treelev = map.sincechange = 0;
}
function randDayNight() {
  return randTrue(3) ? "" : " Night";
}
function WorldRandomOverworld(map) {
  map.randtype = pushRandomSectionOverworld;
  map.randname = "Overworld";
  map.areatype = "Overworld" + randDayNight();
  map.firstRandomThings = function(map) {
    // castle added by entrancetype
    for(var i=0; i<10; ++i) {
      if(randTrue()) pushRandomGroundScenery(i * 8);
    }
  }
  map.startwidth = 14;
  map.onlysmartkoopas = false;
  randMapType(map);
}
function WorldRandomTrees(map) {
  map.randtype = pushRandomSectionTrees;
  map.randname = "Overworld";
  map.areatype = "Overworld" + randDayNight();
  map.firstRandomThings = function(map) {
    map.treefunc(100, (map.treelev = randTrue() + 2) * 8, randTrue() + 4);
    map.startwidth += 7;
  }
  map.startwidth = 11;
  map.onlysmartkoopas = randTrue();
  randMapType(map);
}
function WorldRandomUnderworld(map) {
  map.randtype = pushRandomSectionUnderworld;
  map.randname = map.areatype = "Underworld";
  map.firstRandomThings = function(map) {
    fillPreThing(Brick, 0, 8, 1, 11, 8, 8);
  }
  map.startwidth = randTrue(3) + 7;
  map.onlysmartkoopas = true;
  map.respawndist = 42;
  map.entrancetype = "Up";
  randMapType(map);
}
function WorldRandomUnderwater(map) {
  map.randtype = pushRandomSectionUnderwater;
  map.randname = "Underwater";
  map.areatype = "Underwater" + randDayNight();
  map.firstRandomThings = function(map) {}
  map.startwidth = randTrue(3) + 7;
  map.entrancetype = "Up";
  map.countCheep = map.countBlooper = 0;
  map.respawndist = 42;
  map.onlysmartkoopas = true;
  randMapType(map);
}
function WorldRandomBridge(map) {
  map.randtype = startRandomSectionBridge;
  map.randname = "Overworld";
  map.areatype = "Overworld" + randDayNight();
  map.firstRandomThings = function(map) {}
  map.startwidth = 14;
  randMapType(map);
}
function WorldRandomSky(map) {
  map.randtype = startRandomSectionSky;
  map.randname = "Sky";
  map.areatype = "Sky" + randDayNight();
  map.firstRandomThings = function(map) {
    pushPreThing(GenericStone, 0, 0, 4);
  }
  map.startwidth = 4;
  map.nofloor = true;
  randMapType(map);
}
function WorldRandomCastle(map) {
  map.randtype = startRandomSectionCastle;
  map.randname = map.areatype = "Castle";
  map.firstRandomThings = function(map) {
    startCastleInside();
    startCastle();
  };
  map.respawndist = 35;
  randMapType(map);
}

function World21(map) {
  map.locs = [
    new Location(0, true),
    new Location(0, false, 1260),
    new Location(0, exitPipeVert),
    new Location(1, enterCloudWorld),
    new Location(2)
  ];
  map.areas = [
    new Area("Overworld", function() {
      setLocationGeneration(0);
      
      pushPreScenery("Castle", -16, 0);
      pushPrePattern("backfence", 0, 0, 2);
      pushPrePattern("backfencemin", 768, 0, 1);
      pushPrePattern("backfence", 1152, 0, 2);
      
      pushPreFloor(0, 0, 92);
      pushPreThing(Brick, 120, jumplev1);
      pushPreThing(Brick, 128, jumplev1, Mushroom);
      pushPreThing(Brick, 136, jumplev1);
      pushPreThing(Stone, 160, 8);
      pushPreThing(Stone, 168, 16, 1, 2);
      pushPreThing(Stone, 176, 24, 1, 3);
      pushPreThing(Stone, 184, 32, 1, 4);
      pushPreThing(Stone, 192, 40, 1, 5);
      pushPreThing(Goomba, 192, 48);
      pushPreThing(Block, 224, jumplev1, false, true);
      pushPreThing(Block, 224, jumplev2, [Mushroom, 1], true);
      fillPreThing(Brick, 232, jumplev2, 3, 1, 8, 8);
      pushPreThing(Koopa, 256, 12); 
      pushPreThing(Koopa, 264, 12); 
      pushPreThing(Stone, 272, 32, 1, 4);
      pushPreThing(Stone, 280, 16, 1, 2);
      pushPreThing(Goomba, 336, 8);
      pushPreThing(Goomba, 348, 8);
      pushPrePipe(368, 0, 32, true);
      pushPreThing(Block, 424, jumplev1, Mushroom);
      fillPreThing(Block, 424, jumplev2, 5, 1, 8, 8);
      fillPreThing(Block, 432, jumplev1, 4, 1, 8, 8);
      pushPreThing(Goomba, 472, 8);
      pushPreThing(Goomba, 484, 8);
      pushPreThing(Koopa, 528, 12);
      fillPreThing(Goomba, 544, 8, 3, 1, 12, 8);
      pushPreThing(Brick, 544, jumplev1);
      pushPreThing(Brick, 552, jumplev2, Star);
      fillPreThing(Brick, 560, jumplev2, 3, 1, 8, 8);
      
      pushPrePipe(592, 0, 32, true);
      fillPreThing(Block, 632, jumplev1, 4, 1, 8, 8);
      fillPreThing(Brick, 648, jumplev2, 2, 1, 8, 8);
      pushPreThing(Brick, 664, jumplev2, [Vine, 3]);
      fillPreThing(Brick, 672, jumplev2, 2, 1, 8, 8);
      fillPreThing(Block, 680, jumplev1, 3, 1, 8, 8);
      fillPreThing(Goomba, 704, 8, 3, 1, 12, 8);
      
      fillPreThing(Brick, 736, jumplev2, 4, 1, 8, 8);
      pushPreFloor(768, 0, 10);
      pushPreThing(Goomba, 820, 40, 8, 8);
      pushPrePipe(824, 0, 32, true, 4);

      pushPreFloor(872, 0, 30);
      pushPreThing(Goomba, 916, 24, 8, 8);
      pushPrePipe(920, 0, 16, true, false, 2);
      pushPreThing(Goomba, 962, 8);
      pushPrePipe(976, 0, 32, true);
      pushPreThing(Brick, 1000, jumplev2, Mushroom);
      fillPreThing(Brick, 1008, jumplev2, 3, 1, 8, 8);
      pushPrePipe(1008, 0, 24);
      pushPrePipe(1040, 0, 40, true);
      pushPreThing(Koopa, 1096, 12);
      
      pushPreFloor(1136, 0, 10);
      pushPreThing(Koopa, 1200, 36, false, true);
      
      pushPreFloor(1232, 0, 72);
      pushPreThing(Stone, 1232, 24, 1, 3);
      pushPreThing(Brick, 1288, jumplev1, Coin);
      fillPreThing(Goomba, 1296, 8, 2, 1, 12);
      fillPreThing(Brick, 1312, jumplev2, 5, 1, 8);
      fillPreThing(Koopa, 1352, 12, 2, 1, 16);
      pushPreThing(Block, 1360, jumplev1);
      pushPreThing(Block, 1374, jumplev2, Mushroom);
      pushPrePipe(1408, 0, 24, true);
      pushPreThing(Koopa, 1480, 12);
      fillPreThing(Brick, 1480, jumplev1, 2, 1, 8);
      pushPreThing(Block, 1488, jumplev2, Coin, true);
      pushPreThing(Springboard, 1504, 15.5);
      fillPreThing(Stone, 1520, 80, 2, 1, 8, 8, 1, 10);
      endCastleOutside(1596, 0, castlev);
    }),
    new Area("Sky", function() {
      setLocationGeneration(3);
      
      pushPreThing(Stone, 0, 0, 4);
      pushPreThing(Stone, 40, 0, 72);
      pushPreThing(Platform, 120, 32, 8, collideTransport);
      fillPreThing(Coin, 120, 64, 16, 1, 8);
      fillPreThing(Coin, 256, 80, 3, 1, 8);
      fillPreThing(Coin, 288, 72, 16, 1, 8);
      fillPreThing(Coin, 424, 80, 3, 1, 8);
      
      setExitLoc(1);
      // pushPreThing(LocationShifter, 609, -32, 2, [window.innerWidth / unitsize, 16]);
  }),
    new Area("Underworld", function() {
      setLocationGeneration(4);
      
      makeCeiling(32, 7);
      pushPreFloor(0, 0, 17);
      fillPreThing(Brick, 0, 8, 1, 11, 8, 8);
      fillPreThing(Brick, 32, 8, 7, 3, 8, 8);
      pushPreThingsVert(Coin , 34, 17, 14, 2);
      pushPreThingsVert(Coin , 42, 17, 14, 3);
      pushPreThingsVert(Coin , 50, 17, 14, 3);
      pushPreThingsVert(Coin , 58, 17, 14, 3);
      pushPreThingsVert(Coin , 66, 17, 14, 3);
      pushPreThingsVert(Coin , 74, 17, 14, 3);
      pushPreThingsVert(Coin , 82, 17, 14, 2);
      pushPreThing(PipeSide, 104, 16, 2);
      pushPreThing(PipeVertical, 120, 88, 88);
    })
  ];
}

function World14(map) {map.time = 300;
  map.locs = [
    new Location(0, startCastle)
  ];
  map.areas = [
    new Area("Castle", function() {
      setLocationGeneration(0);
      
      startCastleInside();

      pushPreThing(GenericStone, 40, 88, 19, 3);
      pushPreFloor(40, 24, 8);
      fillPreWater(104, 8, 4);
      
      pushPreFloor(120, 24, 11);
      pushPreThing(GenericStone, 184, 64, 1, 1);
      pushPreThing(CastleBlock, 184, 56);
      makeCeilingCastle(192, 136);
      fillPreWater(208, 0, 6);
      
      pushPreFloor(232, 24, 3);
      pushPreThing(CastleBlock, 240, 24, 6);
      pushPreThing(Block, 240, 56, Mushroom);
      fillPreWater(256, 0, 6);
      
      pushPreThing(GenericStone, 280, 32, 37, 1);
      pushPreThing(GenericStone, 280, 24, 69, 3);
      pushPreFloor(280, 0, 93);
      pushPreThing(GenericStone, 296, 80, 35, 3);
      pushPreThing(CastleBlock, 296, 56);
      pushPreThing(CastleBlock, 392, 56, 6);
      pushPreThing(CastleBlock, 480, 56, 6);
      pushPreThing(CastleBlock, 536, 56, 6);
      pushPreThing(CastleBlock, 608, 32, 6);
      pushPreThing(GenericStone, 640, 80, 1, 1);
      pushPreThing(CastleBlock, 640, 72);
      pushPreThing(CastleBlock, 672, 32, 6);
      pushPreThing(GenericStone, 704, 80, 1, 1);
      pushPreThing(CastleBlock, 704, 72, 6, true);
      pushPreThing(CastleBlock, 736, 32);
      pushPreThing(GenericStone, 776, 80, 7, 2);
      pushPreThing(Block, 848, 32, Coin, true);
      pushPreThing(Block, 872, 32, Coin, true);
      pushPreThing(Block, 896, 32, Coin, true);
      pushPreThing(Block, 856, 64, Coin, true);
      pushPreThing(Block, 880, 64, Coin, true);
      pushPreThing(Block, 904, 64, Coin, true);
      pushPreThing(GenericStone, 928, 24, 4, 3);
      pushPreThing(GenericStone, 984, 24, 5, 3);
      pushPreThing(GenericStone, 984, 80, 5, 2);
      
      endCastleInside(1024);
      pushPreThing(Platform, 1108, 56, 4, [moveSliding, 1080, 1112]).object.nocollidechar = true;
    })
  ];
}

function World24(map) {
map.time = 300;
map.locs = [
  new Location(0, startCastle)
];
map.areas = [
  new Area("Castle", function() {
    setLocationGeneration(0);
    
    startCastleInside();
    
    makeCeilingCastle(40, 11, 3);
    pushPreFloor(40, 24, 11);
    
    fillPreWater(128, 0, 32);
    pushPreThing(Podoboo, 128, -32);
    pushPreThing(GenericStone, 144, 32, 2, 1);
    pushPreThing(GenericStone, 176, 48, 3, 1);
    pushPreThing(CastleBlock, 184, 48);
    pushPreThing(Block, 184, 80, Mushroom);
    pushPreThing(GenericStone, 216, 32, 2, 1);
    pushPreThing(Podoboo, 240, -32);
    
    pushPreFloor(256, 0, 52);
    pushPreThing(GenericStone, 256, 24, 2, 3);
    makeCeilingCastle(272, 49, 4);
    pushPreThing(GenericStone, 296, jumplev1, 36, 1);
    pushPreThing(CastleBlock, 344, 0);
    pushPreThing(CastleBlock, 392, jumplev1, 6);
    pushPreThing(CastleBlock, 440, 0);
    pushPreThing(CastleBlock, 440, jumplev2, 6);
    pushPreThing(CastleBlock, 488, jumplev1, 6);
    pushPreThing(CastleBlock, 536, 0);
    pushPreThing(CastleBlock, 584, jumplev1, 6);
    pushPreThing(GenericStone, 640, 24, 4, 3)
    pushPreThing(CastleBlock, 656, 56, 6);
    
    pushPrePlatformGenerator(686, 3, -1);
    pushPrePlatformGenerator(710, 3, 1);
    
    pushPreFloor(736, 16);
    pushPreThing(CastleBlock, 736, 24, 6, true);
    pushPreFloor(744, 24, 6);
    makeCeilingCastle(744, 6, 3);
    pushPreFloor(792, 0, 10);
    fillPreThing(Coin, 817, 7, 3, 2, 8, 32);
    pushPreThing(CastleBlock, 824, 16);
    fillPreWater(872, 0, 4);
    pushPreThing(GenericStone, 864, 24, 1, 3);
    pushPreFloor(888, 24, 2);
    fillPreWater(904, 0, 4);
    
    pushPreFloor(920, 0, 13);
    pushPreThing(GenericStone, 920, 24, 5, 3);
    makeCeilingCastle(920, 13, 3);
    fillPreThing(GenericStone, 976, 24, 2, 1, 32, 0, 2, 3);
    
    fillPreThing(Brick, 1024, 64, 6, 1, 8);
    endCastleInside(1024);
  })
];
}

function World34(map) {
map.time = 300;
map.locs = [
  new Location(0, startCastle)
];
map.areas = [
  new Area("Castle", function() {
    setLocationGeneration(0);

    startCastleInside();
    
    makeCeilingCastle(40, 11, 3);
    pushPreFloor(40, 24, 11);
    pushPreThing(Podoboo, 128, -32);
    makeCeilingCastle(128, 112);
    
    pushPreFloor(144, 24, 3);
    pushPreThing(CastleBlock, 152, 16, 6);
    pushPreFloor(184, 24, 3);
    pushPreThing(CastleBlock, 192, 16, 6);
    pushPreThing(Podoboo, 208, -32);
    pushPreFloor(224, 24, 3);
    pushPreThing(CastleBlock, 232, 16, 6);
    
    pushPreFloor(264, 0, 13);
    pushPreThing(GenericStone, 264, 24, 2, 3);
    pushPreThing(GenericStone, 280, 80, 11, 2);
    pushPreThing(Block, 336, jumplev1);
    pushPreThing(Block, 344, jumplev1, Mushroom);
    pushPreThing(Block, 352, jumplev1);
    
    pushPreFloor(384, 0, 40);
    pushPreThing(GenericStone, 424, 8, 3, 1);
    pushPreThing(GenericStone, 424, 80, 3, 2);
    pushPreThing(CastleBlock, 432, 16, 6, true);
    pushPreThing(CastleBlock, 432, 64, 6);
    pushPreThing(GenericStone, 504, 8, 3, 1);
    pushPreThing(GenericStone, 504, 80, 3, 2);
    pushPreThing(CastleBlock, 512, 16, 6, true);
    pushPreThing(CastleBlock, 512, 64, 6);
    pushPreThing(GenericStone, 632, 8, 3, 1);
    pushPreThing(GenericStone, 632, 80, 3, 2);
    pushPreThing(CastleBlock, 640, 16, 6);
    pushPreThing(CastleBlock, 640, 64, 6, true);
    pushPreThing(Podoboo, 704, -32);
    fillPreWater(704, 0, 4);
    
    pushPreFloor(720, 24, 6);
    pushPreThing(GenericStone, 720, 80, 6, 2);
    fillPreWater(768, 0, 6);
    pushPreThing(Podoboo, 776, -32);
    pushPreFloor(792, 24, 3);
    fillPreWater(816, 0, 6);
    pushPreThing(Podoboo, 824, -32);
    pushPreFloor(840, 24, 3);
    fillPreWater(864, 0, 6);
    pushPreThing(Podoboo, 872, -32);
    pushPreFloor(888, 0, 17);
    pushPreThing(GenericStone, 888, 24, 5, 3);
    pushPreThing(GenericStone, 888, 80, 17, 2);
    pushPreThing(GenericStone, 944, 24, 10, 3);
    
    endCastleInside(1024, 0);
    fillPreThing(Brick, 1056, 64, 2, 3, 8, 8);
  })
];
}

function World44(map) {
map.locs = [
  new Location(0, startCastle)
];
map.areas = [
  new Area("Castle", function() {
    setLocationGeneration(0);
    
    startCastleInside();
    
    pushPreFloor(40, 24, 2);
    makeCeilingCastle(40, 11);
    fillPreWater(56, 0, 4);
    pushPreFloor(72, 24, 2);
    fillPreWater(88, 0, 4);
    pushPreFloor(104, 24, 3);
    
    this.sections = {
      start: 128,
      0: function(xloc) {
        pushPreFloor(xloc, 0, bstretch + 50);
        makeCeilingCastle(xloc, bstretch + 50);
        pushPreThing(GenericStone, xloc + 16, 56, 6, 4);
        fillPreThing(GenericStone, xloc + 72, 56, 5, 1, 16, 0, 1, 4);
        pushPreThing(GenericStone, xloc + 152, 56, 3, 4);
        pushPreThing(GenericStone, xloc + 176, 56, 6, 1);
        pushPrePipe(xloc + 192, 0, 24, true);
        pushPreThing(GenericStone, xloc + 224, 56, 17, 4);
        pushPreThing(CastleBlock, xloc + 296, 56, [6, 1], true);
        pushPreSectionFail(xloc + 384, 24, 40, 24);
        pushPreSectionPass(xloc + 384, 80, 40, 24);
        pushPreThing(CastleBlock, xloc + 352, 32, [6, 1], true);
        pushPreThing(GenericStone, xloc + 360, 56, bstretch, 4);
        pushPreThing(GenericStone, xloc + 376 + bstretch * 8, 24, 3, 3);
        pushPreThing(GenericStone, xloc + 376 + bstretch * 8, 80, 3, 3);
        pushCastleDecider(xloc + 400 + bstretch * 8, 0);
      },
      1: function(xloc) {
        pushPreFloor(xloc, 0, 8);
        makeCeilingCastle(xloc, bstretch + 42);
        pushPreThing(GenericStone, xloc + 48, 24, 2);
        fillPreWater(xloc + 64, 0, 4);
        pushPreThing(GenericStone, xloc + 72, 40, 2);
        fillPreWater(xloc + 80, 0, 10);
        
        pushPreFloor(xloc + 80, 16);
        pushPreThing(GenericStone, xloc + 80, 24, 5);
        pushPreThing(GenericStone, xloc + 104, 48);
        pushPreThing(GenericStone, xloc + 112, 40, 1, 2);
        pushPreFloor(xloc + 120, 0, 27);
        pushPreThing(GenericStone, xloc + 120, 56, 1, 2);
        pushPreThing(GenericStone, xloc + 128, 24, 26);
        pushPreThing(GenericStone, xloc + 128, 56, 2);
        pushPreThing(GenericStone, xloc + 160, 56, 4);
        pushPreThing(GenericStone, xloc + 200, 48, 1, 3);
        pushPreThing(GenericStone, xloc + 200, 56, 3);
        pushPreThing(GenericStone, xloc + 240, 56, 12);
        pushPreThing(CastleBlock, xloc + 280, 56, [6, 1], true);
        pushPreThing(CastleBlock, xloc + 328, 24, [6, 1], true);
        
        pushPreFloor(xloc + 336, 0, bstretch);
        pushPreThing(GenericStone, xloc + 336, 24, bstretch);
        pushPreThing(GenericStone, xloc + 336, 56, bstretch);
        pushPreSectionPass(xloc + 360, 16, 40, 16);
        pushPreSectionFail(xloc + 360, 48, 40, 24);
        pushPreSectionFail(xloc + 360, 80, 40, 24);
        pushCastleDecider(xloc + 336 + bstretch * 8, 1);
      },
      2: function(xloc) {
        pushPreThing(GenericStone, xloc, 64, 1, 5);
        makeCeilingCastle(xloc, 33, 3);
        pushPreThing(GenericStone, xloc + 8, 80, 2, 2);
        pushPreFloor(xloc, 0, 10);
        pushPreFloor(xloc + 72, 24, 4);
        makeCeilingCastle(xloc + 72, 8);
        pushPreFloor(xloc + 96, 0, 4);
        pushPreFloor(xloc + 120, 24, 2);
        endCastleInside(xloc + 136);
      }
    };
  })
];
}

function World54(map) {
map.time = 300;
map.locs = [
  new Location(0, startCastle)
];
map.areas = [
  new Area("Castle", function() {
    setLocationGeneration(0);
    
    startCastleInside();
    
    makeCeilingCastle(40, 11, 3);
    pushPreFloor(40, 24, 11);
    
    fillPreWater(128, 0, 32);
    pushPreThing(Podoboo, 128, -32);
    pushPreThing(GenericStone, 144, 32, 2, 1);
    pushPreThing(Podoboo, 160, -24);
    pushPreThing(GenericStone, 176, 48, 3, 1);
    pushPreThing(CastleBlock, 184, 48, 12, true);
    pushPreThing(Block, 184, 80, Mushroom);
    pushPreThing(GenericStone, 216, 32, 2, 1);
    pushPreThing(Podoboo, 240, -32);
    
    pushPreFloor(256, 0, 52);
    pushPreThing(GenericStone, 256, 24, 2, 3);
    makeCeilingCastle(272, 49, 4);
    pushPreThing(GenericStone, 296, jumplev1, 36, 1);
    pushPreThing(CastleBlock, 344, 0, 6, true);
    pushPreThing(CastleBlock, 392, jumplev1, 6);
    pushPreThing(CastleBlock, 440, 0, 6, true);
    pushPreThing(CastleBlock, 440, jumplev2);
    pushPreThing(CastleBlock, 488, jumplev1, 6);
    pushPreThing(CastleBlock, 536, 0, 6);
    pushPreThing(CastleBlock, 584, jumplev1, 6);
    pushPreThing(GenericStone, 640, 24, 4, 3)
    pushPreThing(CastleBlock, 656, 56, 6);
    
    pushPrePlatformGenerator(686, 3, -1);
    pushPrePlatformGenerator(710, 3, 1);
    
    pushPreFloor(736, 16);
    pushPreThing(CastleBlock, 736, 24, 6, true);
    pushPreFloor(744, 24, 6);
    makeCeilingCastle(744, 6, 3);
    pushPreFloor(792, 0, 10);
    fillPreThing(Coin, 817, 7, 3, 2, 8, 32);
    pushPreThing(CastleBlock, 824, 16, 6, -1.17);
    fillPreWater(872, 0, 4);
    pushPreThing(GenericStone, 864, 24, 1, 3);
    pushPreThing(Podoboo, 872, -32);
    pushPreFloor(888, 24, 2);
    fillPreWater(904, 0, 4);
    
    pushPreFloor(920, 0, 13);
    pushPreThing(GenericStone, 920, 24, 5, 3);
    makeCeilingCastle(920, 13, 3);
    fillPreThing(GenericStone, 976, 24, 2, 1, 32, 0, 2, 3);
    pushPreThing(Podoboo, 904, -32);
    
    fillPreThing(Brick, 1024, 64, 6, 1, 8);
    endCastleInside(1024);
    pushPreThing(Podoboo, 1048, -40);
  })
];
}

function World64(map) {
map.time = 300;
map.locs = [
  new Location(0, startCastle)
];
map.areas = [
  new Area("Castle", function() {
    setLocationGeneration(0);
    
    startCastleInside();
    
    makeCeilingCastle(40, 19, 3);
    pushPreFloor(40, 24, 8);
    fillPreWater(104, 8, 4);
    
    pushPreFloor(120, 24, 11);
    pushPreThing(GenericStone, 184, 64, 1, 1);
    pushPreThing(CastleBlock, 184, 56, 6);
    makeCeilingCastle(192, 136);
    fillPreWater(208, 0, 6);
    pushPreThing(Podoboo, 216, -32);
    
    pushPreFloor(232, 24, 3);
    pushPreThing(CastleBlock, 240, 24, 6);
    pushPreThing(Block, 240, 56, Mushroom);
    fillPreWater(256, 0, 6);
    pushPreThing(Podoboo, 264, -32);
    
    pushPreThing(GenericStone, 280, 32, 37, 1);
    pushPreThing(GenericStone, 280, 24, 69, 3);
    pushPreFloor(280, 0, 93);
    pushPreThing(GenericStone, 296, 80, 35, 3);
    pushPreThing(CastleBlock, 296, 56, 6);
    pushPreThing(CastleBlock, 392, 56, 6);
    pushPreThing(CastleBlock, 480, 56, 6);
    pushPreThing(CastleBlock, 536, 56, 6);
    pushPreThing(CastleBlock, 608, 32, 6);
    pushPreThing(GenericStone, 640, 80, 1, 1);
    pushPreThing(CastleBlock, 640, 72, 6);
    pushPreThing(CastleBlock, 672, 32, 6);
    pushPreThing(GenericStone, 704, 80, 1, 1);
    pushPreThing(CastleBlock, 704, 72, 6, true);
    pushPreThing(CastleBlock, 736, 32, 6);
    pushPreThing(GenericStone, 776, 80, 7, 2);
    pushPreThing(Block, 848, 32, Coin, true);
    pushPreThing(Block, 872, 32, Coin, true);
    pushPreThing(Block, 896, 32, Coin, true);
    pushPreThing(Block, 856, 64, Coin, true);
    pushPreThing(Block, 880, 64, Coin, true);
    pushPreThing(Block, 904, 64, Coin, true);
    pushPreThing(GenericStone, 928, 24, 4, 3);
    pushPreThing(GenericStone, 984, 24, 5, 3);
    pushPreThing(GenericStone, 984, 80, 5, 2);
    
    endCastleInside(1024);
  })
];
}

function World74(map) {
map.locs = [
  new Location(0, startCastle)
];
map.areas = [
  new Area("Castle", function() {
    setLocationGeneration(0);
    startCastleInside();

    makeCeilingCastle(40, 11, 3);
    pushPreFloor(40, 24, 11);
    fillPreWater(128, 0, 22);
    makeCeilingCastle(128, 16);
    pushPreThing(Platform, 144, 48, 4, moveFalling); // falling
    pushPreThing(Podoboo, 160, -32);
    pushPreThing(Platform, 176, 40, 4, moveFalling); // falling
    
    pushPreThing(GenericStone, 216, 24, 5, DtB(24, 8));
    pushPreThing(GenericStone, 224, 80, 4, 2)
    
    this.sections = {
      start: 256,
      0: function(xloc) {
        pushPreFloor(xloc, 0, bstretch * 3 + 31);
        makeCeilingCastle(xloc, bstretch * 3 + 31);
        
        pushPreThing(GenericStone, xloc + 16, 32, 5);
        pushPreThing(GenericStone, xloc + 32, 40, 3);
        pushPreThing(GenericStone, xloc + 40, 48, 2);
        pushPreThing(GenericStone, xloc + 48, 56, 1);
        pushPreThing(GenericStone, xloc + 56, 56, bstretch, 4);
        
        pushPreSectionPass(xloc + (bstretch + 1) * 8, 24, 40, 24);
        pushPreSectionFail(xloc + (bstretch + 1) * 8, 80, 40, 24);

        pushPreThing(GenericStone, xloc + (bstretch + 11) * 8, 24, bstretch + 2);
        pushPreThing(GenericStone, xloc + (bstretch + 12) * 8, 56, bstretch);
        pushPreSectionFail(xloc + (bstretch * 2 + 6) * 8, 16, 40, 16);
        pushPreSectionPass(xloc + (bstretch * 2 + 6) * 8, 48, 40, 24);
        pushPreSectionFail(xloc + (bstretch * 2 + 6) * 8, 80, 40, 24);
        
        pushPreThing(GenericStone, xloc + (bstretch * 2 + 16) * 8, 56, bstretch + 7, 4);
        pushPreSectionFail(xloc + (bstretch * 2 + 17) * 8, 24, 40, 24);
        pushPreSectionPass(xloc + (bstretch * 2 + 17) * 8, 80, 40, 24);
        pushPreThing(GenericStone, xloc + (bstretch * 3 + 23) * 8, 40, 1);
        pushPreThing(GenericStone, xloc + (bstretch * 3 + 23) * 8, 48, 2);
        pushPreThing(GenericStone, xloc + (bstretch * 3 + 23) * 8, 56, 4);
        
        pushPreThing(GenericStone, xloc + (bstretch * 3 + 28) * 8, 24, 3, 3);
        pushCastleDecider(xloc + (bstretch * 3 + 31) * 8, 0);
      },
      1: function(xloc) {
        pushPreFloor(xloc, 24, 3);
        makeCeilingCastle(xloc, 17);
        pushPreFloor(xloc + 24, 0, 4);
        pushPreThing(GenericStone, xloc + 48, 56, 2);
        fillPreWater(xloc + 56, 0, 6);
        pushPreThing(GenericStone, xloc + 72, 56, 3);
        pushPreFloor(xloc + 80, 0);
        pushPreThing(CastleBlock, xloc + 80, 48, 6, true);
        fillPreWater(xloc + 88, 0, 6);
        pushPreThing(GenericStone, xloc + 104, 56, 4, 1);
        pushPreFloor(xloc + 112, 0, 3);
        
        pushPreSectionFail(xloc + 96 + (bstretch - 6) * 8, 24, 40, 24);
        pushPreSectionPass(xloc + 96 + (bstretch - 6) * 8, 80, 40, 24);
        pushPreFloor(xloc + 136, 0, bstretch - 5);
        pushPreThing(GenericStone, xloc + 136, 56, bstretch - 5, 4);
        makeCeilingCastle(xloc + 136, bstretch - 5);
        
        pushPreSectionFail(xloc + (bstretch * 2 + 9) * 8, 80, 40, 24);
        pushPreSectionPass(xloc + (bstretch * 2 + 10) * 8, 48, 32, 24);
        pushPreSectionFail(xloc + (bstretch * 2 + 10) * 8, 16, 40, 16);
        pushPreFloor(xloc + (bstretch + 12) * 8, 0, bstretch + 10);
        makeCeilingCastle(xloc + (bstretch + 12) * 8, bstretch + 10);
        pushPreThing(GenericStone, xloc + (bstretch + 14) * 8, 56, 3);
        pushPreThing(GenericStone, xloc + (bstretch + 15) * 8, 24, 3);
        pushPreThing(GenericStone, xloc + (bstretch + 19) * 8, 56, bstretch - 4);
        pushPreThing(GenericStone, xloc + (bstretch + 20) * 8, 24, bstretch - 4);
        pushPreThing(GenericStone, xloc + (bstretch * 2 + 17) * 8, 56, 3);
        pushPreThing(GenericStone, xloc + (bstretch * 2 + 18) * 8, 24, 3);
        
        pushPreFloor(xloc + (bstretch * 2 + 22) * 8, 0, bstretch + 12);
        makeCeilingCastle(xloc + (bstretch * 2 + 22) * 8, bstretch + 12);
        pushPreThing(GenericStone, xloc + (bstretch * 2 + 22) * 8, 48, 1, 3);
        pushPreThing(GenericStone, xloc + (bstretch * 2 + 22) * 8, 56, bstretch + 5);
        pushPreThing(GenericStone, xloc + (bstretch * 2 + 24) * 8, 8, bstretch + 10);
        pushPreThing(GenericStone, xloc + (bstretch * 2 + 25) * 8, 16, bstretch + 9);
        pushPreThing(GenericStone, xloc + (bstretch * 2 + 26) * 8, 24, bstretch + 8);
        pushPreSectionFail(xloc + (bstretch * 2 + 28) * 8, 48, 40, 24);
        pushPreSectionPass(xloc + (bstretch * 2 + 28) * 8, 80, 40, 24);
        pushCastleDecider(xloc + (bstretch * 3 + 34) * 8, 1);
      },
      2: function(xloc) {
        pushPreFloor(xloc, 0, 3);
        makeCeilingCastle(xloc, 32);
        pushPreFloor(xloc + 24, 24, 3);
        pushPreFloor(xloc + 48, 0, 2);
        pushPreFloor(xloc + 64, 24, 8);
        pushPreFloor(xloc + 128, 0, 2);
        pushPreFloor(xloc + 144, 24, 2);
        pushPreFloor(xloc + 160, 0, 2);
        pushPreFloor(xloc + 176, 24, 2);
        pushPreFloor(xloc + 192, 0, 2);
        pushPreFloor(xloc + 208, 24, 6);
        endCastleInside(xloc + 256);
      }
    }
  })
];
}

function World84(map) {
map.locs = [
  new Location(0, startCastle),
  new Location(0, exitPipeVert), // Pipe 1
  new Location(1, exitPipeVert), // Past B
  new Location(2, exitPipeVert), // Past D
  new Location(3, exitPipeVert, 24), // Underwater
  new Location(4, exitPipeVert)  // Pipe 2
];
map.areas = [
  new Area("Castle", function() { // Area 0
    setLocationGeneration(0);
    
    startCastleInside();
    pushPreThing(GenericStone, 40, 24, 1, DtB(24, 8));
    makeCeilingCastle(40, 32);
    fillPreWater(48, 0, 10);
    pushPreThing(GenericStone, 88, 0, 8, DtB(0, 8));
    pushPrePipe(152, 16, Infinity, true, false, 1); // Pipe 1
    pushPreFloor(168, 0, 11);
    
    this.sections = {
      start: 256,
      0: function(xloc) {
        pushPreFloor(xloc, 0, bstretch);
        makeCeilingCastle(xloc, bstretch + 53);
        pushPreSectionFail(xloc, 80, 40, 80);
        pushPrePipe(xloc + bstretch * 8, 16, Infinity, true, 1); // Back to Pipe 1
        pushPreFloor(xloc + bstretch * 8 + 16, 0, 9);
        fillPreThing(Goomba, xloc + bstretch * 8 + 36, 8, 3, 1, 12);
        pushPreFloor(xloc + bstretch * 8 + 88, 24, 4);
        fillPreWater(xloc + bstretch * 8 + 120, 0, 34);
        // To do: make sure this is correct
        pushPreThing(Platform, xloc + bstretch * 8 + 152, 0, 4, [moveSliding, xloc + bstretch * 8 + 140, xloc + bstretch * 8 + 232, 2]);
        pushPreFloor(xloc + bstretch * 8 + 256, 24, 6);
        pushPreThing(GenericStone, xloc + bstretch * 8 + 264, 56, 4);
        pushPrePipe(xloc + bstretch * 8 + 304, 40, Infinity, true, 2); // Goes to Past B
        pushPreFloor(xloc + bstretch * 8 + 320, 24, 7);
        pushPrePipe(xloc + bstretch * 8 + 376, 48, Infinity, true);
        pushPreFloor(xloc + bstretch * 8 + 392, 24, 4);
        pushCastleDecider(xloc + bstretch * 8 + 424, 0);
      }
    }
  }),
  new Area("Castle", function() { // Area 1
    setLocationGeneration(2);
    
    setBStretch();
    pushPreFloor(0, 0, bstretch);
    makeCeilingCastle(0, bstretch);
    this.sections = {
      start: bstretch * 8,
      0: function(xloc) {
        pushPreSectionFail(xloc, 80, 40, 80);
        pushPrePipe(xloc, 16, Infinity, true, false, 2); // Past B
        makeCeilingCastle(xloc, bstretch + 45);
        pushPreFloor(xloc + 16, 0, 5);
        pushPrePipe(xloc + 56, 24, Infinity, true);
        pushPreFloor(xloc + 72, 0, 8);
        fillPreThing(Beetle, xloc + 104, 8.5, 2, 1, 16);
        pushPrePipe(xloc + 136, 16, Infinity, true, 1); // Back to Pipe 1
        pushPreFloor(xloc + 152, 0, 8);
        pushPreThing(Koopa, xloc + 192, 32, false, true);
        pushPreThing(Koopa, xloc + 208, 24, false, true);
        pushPrePipe(xloc + 216, 24, Infinity, true);
        fillPreWater(xloc + 232, 0, 6);
        pushPreFloor(xloc + 256, 0, 13 + bstretch);
        pushPreThing(Block, xloc + 280, jumplev1, Coin, true);
        pushPreThing(GenericStone, xloc + 296, jumplev1, 2);
        pushPrePipe(xloc + 296, jumplev1, 24, true, 3); // Goes Past C
        pushPreThing(Koopa, xloc + 320, 20, false, true);
        pushPreThing(Koopa, xloc + 336, 24, false, true);
        pushCastleDecider(xloc + 360 + bstretch * 8, 0);
      }
    }
  }),
  new Area("Castle", function() {  // Area 2
    setLocationGeneration(3);
    
    pushPreFloor(0, 0, 3);
    makeCeilingCastle(0, 3);
    this.sections = {
      start: 24,
      0: function(xloc) {
        pushPreSectionFail(xloc, 80, 40, 80);
        pushPrePipe(xloc, 16, Infinity, true, false, 3);
        makeCeilingCastle(xloc, bstretch + 38);
        pushPreFloor(xloc + 16, 0);
        pushPreFloor(xloc + 24, 24, 6);
        pushPrePipe(xloc + 72, 40, Infinity, true);
        // start cheeps here
        pushPreFloor(xloc + 88, 24, 6);
        pushPrePipe(xloc + 136, 48, Infinity, true, 1); // Back to Pipe 1
        pushPreFloor(xloc + 152, 24, 6);
        // end cheeps here
        fillPreWater(xloc + 200, 0, 8);
        pushPreFloor(xloc + 232, 24, 4);
        pushPrePipe(xloc + 264, 40, Infinity, true, 4); // To Underwater (Area 3)
        pushPreFloor(xloc + 280, 24, bstretch);
        pushPreFloor(xloc + 280 + bstretch * 8, 0, 3);
        pushCastleDecider(xloc + 304 + bstretch * 8, 0);
      }
    }
  }),
  new Area("Underwater Castle", function() { // Area 3 (Underwater)
    setLocationGeneration(4);
    
    goUnderWater();
    pushPreThing(GenericStone, 0, 88, 2, DtB(88, 8));
    pushPreFloor(16, 0, 1, 62);
    pushPrePipe(24, -200, 216, false, false, 4);
    pushPreFloor(40, 0, 67);
    pushPreThing(GenericStone, 48, 24, 5, 3);
    pushPreThing(GenericStone, 48, 80, 5, 2);
    pushPreThing(GenericStone, 48, 88, 66, 1);
    pushPreThing(GenericStone, 88, 32, 7, 4);
    pushPreThing(GenericStone, 88, 80, 7, 3);
    pushPreThing(CastleBlock, 160, 46, [6, 1], true);
    pushPreThing(Blooper, 224, 16);
    pushPreThing(CastleBlock, 248, 22, [6, 1], true);
    pushPreThing(GenericStone, 312, 24, 3, 3);
    pushPreThing(GenericStone, 312, 80, 3, 3);
    pushPreThing(CastleBlock, 320, 54, [6, 1], true);
    pushPreThing(Blooper, 408, 24);
    pushPreThing(Blooper, 424, 56);
    pushPreThing(CastleBlock, 446, 38, [6, 1], true);
    pushPreThing(CastleBlock, 512, 44, [6, 1], true);
    pushPreThing(GenericStone, 536, 32, 5, 4);
    pushPreThing(GenericStone, 536, 80, 5, 3);
    pushPreThing(PipeSide, 544, 48, 5);
    pushPreThing(GenericStone, 552, 56, 3, 3);
  }),
  new Area("Castle", function() { // Area 4
    setLocationGeneration(5);
    
    pushPrePipe(0, 16, Infinity, true, false, 5);
    makeCeilingCastle(0, 29);
    pushPreFloor(16, 0, 5);
    pushPrePipe(56, 16, Infinity, true);
    pushPreFloor(72, 0, 9);
    pushPreThing(HammerBro, 112, 12);
    fillPreWater(128, 0, 14);
    pushPreThing(Podoboo, 160, -32);
    pushPreFloor(184, 24, 6);
    pushPreThing(GenericStone, 184, 80, 6, 2);
    endCastleInside(232, 0)
  }),
];
}