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
    Sky: WorldRandomSky
  };
  
  document.cookie = "";
}

function Map() {
  this.element = this.underwater = this.current = this.current_solid = this.current_char = this.xloc = 0;
  this.canscroll = true;
  this.floor = 104;
  this.time = 400;
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
  if(!transport) transport = ["Random", "Overworld"];
  data.traveledold = data.traveled;
  clearMarioStats();
  resetVariables();
  map = new Map();
  currentmap.func = mapfuncs[transport[0]][transport[1]];
  currentmap.func(map);
  map.areanum = map.curloc = map.sincechange = 0;
  map.area = map.areas[0];
  map.entrancetype = transport[2];
  shiftToLocation(0);
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
  body.className = map.area.setting;
  if(map.areas[map.areanum].setting != "")
    addEvent(function() { window.theme = play(map.areas[map.areanum].setting.split(" ")[0] + ".mp3", true, true); }, 0);
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
  
  // If the area has loops (really just castles), do this.
  if(area.sections && area.sections[0]) {
    setBStretch();
    area.sections.current = 0;
    area.sections[0](area.sections.start);
  }
  // Otherwise, give it a ScrollBlocker at the area.width
  else {
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
  map.jumpmod = 1.05 + 3.5 * map.underwater;
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
  setNextLevelArr(currentmap);
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
  var move = setInterval(function() {
    shiftVert(me, unitsized4, true);
    if(me.top >= pipe.top) {
      clearInterval(move);
      goToTransport(transport);
    }
  }, timer);
}
function intoPipeHoriz(me, pipe, transport) {
  if(!me.keys.run || !me.resting ||
                      me.top + unitsizet2 < pipe.top ||
                      me.bottom - unitsizet2 > pipe.bottom) return;
  pipePreparations(me);
  var move = setInterval(function() {
    shiftHoriz(me, unitsized4, true);
    if(me.left >= pipe.left) {
      clearInterval(move);
      goToTransport(transport);
    }
  }, timer);
}
function pipePreparations(me) {
  // clearSounds();
  pauseTheme();
  play("Pipe.wav");
  locMovePreparations(me);
  nokeys = true;
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
  me.nofall = true;
  play("Pipe.wav");
  setTop(me, pipe.top);
  setMidXObj(me, pipe, true);
  step();
  var dy = unitsize / -4, move = setInterval(function() {
    shiftVert(me, dy, true);
    if(me.bottom <= pipe.top) {
      clearInterval(move);
      me.nocollide = me.piping = me.nofall = nokeys = false;
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
  setLeft(me, unitsizet32);
  me.element.style.zIndex = 14;
  removeClass(me, "jumping");
  me.element.className += " climbing";
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
          clearInterval(movement);
          setTop(me, stopheight, true);
          clearInterval(movement);
          setTimeout(function() {
          // Mario switches sides
          setLeft(me, unitsize * 36, true);
          me.element.className += " flipped";
            setTimeout(function() {
              // Mario hops off
              marioHopsOff(me, me.attached);
              me.death = function(me) {
                // alert("yeah");
              }
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
  data.time.amount = Infinity;
  notime = map.random = true;
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
  for(var i=0; i<numx; ++i) {
    y = yloc;
    for(var j=0; j<numy; ++j) {
      pushPreThing(type, x, y, extras, more);
      y += height;
    }
    x += width;
  }
}

function pushPreFloor(xloc, yloc, length) {
  pushPreThing(Floor, xloc, yloc, length || 1, DtB(yloc, 8));
}

function makeCeiling(xloc, num) {
  num = num || 1;
  for(var i=0; i<num; ++i)
    pushPreThing(Brick, xloc + i * 8, ceillev);
}
function makeCeilingCastle(xloc, bwidth, bheight) {
  pushPreThing(GenericStone, xloc, ceillev, bwidth || 1, bheight || 1);
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
  platleft = pushPreThing(Platform, xloc - offx, yloc - offy1 * 4, platwidth, moveFalling).object;
  platright = pushPreThing(Platform, xloc + width * 4 - platwidth - 6, yloc - offy2 * 4, platwidth, moveFalling).object;
  platleft.parent = me; platright.parent = me;
  platleft.partner = platright; platleft.tension = offy1 * unitsize * 4 - unitsizet8;
  platright.partner = platleft; platright.tension = offy2 * unitsize * 4 - unitsizet8;
  
  // Set the tension
  me.tensionleft = offy1 * unitsize;
  me.tensionright = offy2 * unitsize;
  
  // Add the strings
  platleft.string = pushPreScenery("String", xloc, yloc - offy1 * 4, 1, offy1 * 4).object;
  platright.string = pushPreScenery("String", xloc + width * 4 - platwidth + 5, yloc - offy2 * 4, 1, offy2 * 4).object;
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
  detect.stone = pushPreThing(GenericStone, xloc + 4, yloc + 8).object;
  detect.top = pushPreThing(FlagTop, xloc + 6.5, 84).object;
  detect.pole = pushPreThing(FlagPole, xloc + 8, 80).object;
  var detect2 = pushPreThing(CastleDoorDetector, xloc + 60 + (castlev == 0) * 8, 8).object;
  detect2.castle = pushPreScenery("Castle", xloc + dist, yloc + castlevel).object;
  if(wall) pushPreScenery("CastleWall", xloc + dist + 72, yloc, wall);
  if(castlevel == 0) shiftHoriz(detect2, unitsizet8);
}

function startCastleInside() {
  pushPreThing(GenericStone, 0, 88, 5, 3);
  pushPreThing(GenericStone, 0, 48, 3, DtB(48, 8));
  pushPreThing(GenericStone, 24, 40, 1, DtB(40, 8));
  pushPreThing(GenericStone, 32, 32, 1, DtB(32, 8));
}

function endCastleInside(xloc, last) {
  var axe = pushPreThing(CastleAxe, xloc + 104, 40).object;
  pushPreThing(ScrollBlocker, xloc + 116, ceilmax); // 104 + 16
  axe.bridge = pushPreThing(CastleBridge, xloc, 24, 13).object;
  axe.chain = pushPreThing(CastleChain, xloc + 96.5, 32).object;
  axe.bowser = pushPreThing(Bowser, xloc + 69, 42).object;
  
  pushPreThing(GenericStone, xloc, 88, 32);
  fillPreWater(xloc, 0, 26);
  pushPreThing(GenericStone, xloc + 104, 32, 3, DtB(24, 8));
  pushPreThing(GenericStone, xloc + 104, 0, 19, DtB(0, 8));
  pushPreThing(GenericStone, xloc + 112, 80, 2, 3);
  var npc;
  if(last) npc = pushPreThing(Peach, xloc + 194, 13).object;
  else npc = pushPreThing(Toad, xloc + 194, 12).object;
  npc.text = [
    pushPreThing(text, xloc + 160, 66, ["THANK YOU MARIO!", 88, 24, true]).object,
    pushPreThing(text, xloc + 148, 50, ["Come back soon for the full game!", 88, 24, true]).object
  ];
  
  if(map.area.noscrollblock)
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
function zoneDisableLakitu(me) {
  if(!map.zone_lakitu || !map.has_lakitu) return killNormal(me);
  
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
function zoneEnableCheeps() {
  if(map.zone_cheeps) return;
  startCheepSpawn();
}
function zoneDisableCheeps() {
  map.zone_cheeps = false;
}

function zoneStopLakitu(xloc) {
  pushPreThing(zoneToggler, xloc, ceilmax + 40, zoneDisableLakitu);
}

// CheepCheep zones
function zoneStartCheeps(xloc) {
  pushPreThing(zoneToggler, xloc, ceilmax + 40, zoneEnableCheeps);
}
function zoneStopCheeps(xloc) {
  pushPreThing(zoneToggler, xloc, ceilmax + 40, zoneDisableCheeps);
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

      pushPreThing(text, 20, 96, ["<div style='width:350px;height:305px;background-color:#d64d00;border-radius:7px;box-shadow:3px 3px #efb28b inset, -3px -3px black inset;'><p style='text-align:left;padding:7px 14px;font-family: Super Mario Bros Alphabet;font-size:106px;line-height:96px;text-shadow:6px 8px black'>Super<br>Mario Bros<br></p><p style='text-align:center;text-shadow:2px 2px 1px #61341b'>Arrow/WASD keys move<br>Shift to fire/sprint<br>P/M to pause/mute</p></div>"]);
      
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
    pushPreThing(Clouds, 0, 0, 4);
    // enterCloudWorld(mario);
  }
  map.startwidth = 4;
  map.nofloor = true;
  randMapType(map);
}
// To do: make this, with transitions?
function WorldRandomCastle(map) {
  map.randtype = startRandomSectionCastle;
  map.randname = map.areatype = "Castle";
  map.firstRandomThings = function(map) {
    startCastleInside();
    startCastle();
  };
  randMapType(map);
}


function World32(map) {
  map.locs = [
    new Location(0, true)
  ];
  map.areas = [
    new Area("Overworld Night Alt", function() {
      setLocationGeneration(0);

      pushPrePattern("backfence", -384, 0, 5);
      pushPreScenery("Castle", -1 * unitsizet4, castlev);
      pushPreFloor(0, 0, 80);
      pushPreThing(Koopa, 136, 12);
      fillPreThing(Goomba, 192, 8, 3, 1, 12);
      fillPreThing(Koopa, 264, 12, 3, 1, 12);
      fillPreThing(Koopa, 344, 12, 2, 1, 12);
      pushPreThing(Stone, 392, 8);
      fillPreThing(Coin, 441, jumplev1-1, 3, 1, 8);
      pushPreThing(Stone, 480, 24, 1, 3);
      pushPreThing(Block, 480, 56, Mushroom);
      pushPreThing(Koopa, 528, 12);
      fillPreThing(Goomba, 568, 8, 3, 1, 12);
      pushPreThing(Stone, 600, 16, 1, 2);
      pushPreThing(Brick, 616, jumplev1, Coin);
      pushPreThing(Brick, 616, jumplev2, Star);
      pushPreThing(Koopa, 624, 12);
      pushPreThing(Stone, 632, 16, 1, 2);
      
      pushPreFloor(656, 0, 41);
      pushPreThing(Koopa, 736, 34, false, true);
      pushPreThing(Koopa, 888, 12);
      fillPreThing(Goomba, 952, 8, 3, 1, 12);
      
      pushPreFloor(1000, 0, 3);
      pushPreThing(Stone, 1008, 16, 1, 2);
      pushPreThing(Brick, 1008, 56);
      
      pushPreFloor(1040, 0, 94);
      pushPreThing(Koopa, 1072, 12);
      fillPreThing(Koopa, 1120, 12, 3, 1, 12);
      fillPreThing(Koopa, 1200, 12, 2, 1, 12);
      fillPreThing(Koopa, 1296, 12, 3, 1, 12);
      fillPreThing(Coin, 1345, 55, 4, 1, 8);
      pushPrePipe(1352, 0, 24, true);
      pushPreThing(Koopa, 1400, 12);
      fillPreThing(Goomba, 1432, 8, 3, 1, 12);
      fillPreThing(Goomba, 1504, 8, 3, 1, 12);
      pushPreThing(Stone, 1536, 8);
      pushPreThing(Stone, 1544, 16, 1, 2);
      pushPreThing(Stone, 1552, 24, 1, 3);
      pushPreThing(Stone, 1560, 32, 1, 4);
      pushPreThing(Stone, 1568, 40, 1, 5);
      pushPreThing(Stone, 1576, 48, 1, 6);
      pushPreThing(Stone, 1584, 56, 1, 7);
      pushPreThing(Stone, 1592, 64, 1, 8);
      pushPreThing(Stone, 1600, 64, 1, 8);
      
      endCastleOutside(1668, 0, castlev);
    })
  ];
}