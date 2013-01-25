// possible addition: map.base, which is the level things like floor and tree trunk go until
/* To do: add checkpoints :

map.checkpoints = [
  new Checkpoint(loc, xloc),
  new Checkpoint(loc, xloc)
];

/*
 * Map creating
 */
function createMaps() {
  currentmap = [1,1];
  jumplev1 = 32;
  jumplev2 = 64;
  ceillev = 88;
  ceilmax = 104;
  castlev = -48;
  
  mapfuncs = new Array(9);
  for(var i=1; i<=9; ++i)
    mapfuncs[i] = [0,0,0,0,0];
  mapfuncs[1][1] = World11;
}

function Map() {
  this.deletesolids = this.element = this.underwater = this.current = this.xloc = 0;
  this.canscroll = true;
  this.floor = 104;
  this.time = 400;
  this.curloc = -1;
  this.checkpoints = [];
  this.gravity = gravity;
  this.maxyvel = unitsize * 1.75;
  this.maxyvelinv = this.maxyvel * -1.49;
}

function Area(xloc, yloc, setting) {
  this.xloc = xloc || 0;
  this.yloc = yloc || 0;
  this.setting = this.background = setting || "";
  this.floor = 140;
  this.current = this.width = 0;
  this.underwater = false;
  this.prethings = [];
}

function Location(area, xloc, entry) {
  this.area = area;
  this.xloc = xloc;
  this.yloc = 0;
  this.floor = 0;
  
  this.entry = entry || entryNormal;
}

function Checkpoint(xloc, prething, startfunc) {
  this.xloc = xloc;
  this.prething = prething;
  this.startfunc = startfunc || function() {};
}

function PreThing(object, xloc, yloc) {
  this.object = object;
  this.xloc = xloc;
  this.yloc = yloc;
}

function setMap() {
  pause();
  if(typeof mario != 'undefined' && mario.power) storeMarioStats();
  // Initial preparation
  resetVariables();
  prepareMap();
}

function prepareMap() {
  map = new Map();
  if(mapfuncs[currentmap[0]][currentmap[1]] instanceof Function) {
    // If mapfuncs already has the function stored - we want this
    currentmap.func = mapfuncs[currentmap[0]][currentmap[1]];
    setMapPostRequest();
  } else {
    // Manually retrieve the function
    loadMapAjax(setMapPostRequest);
  }
}

// Manual call to load a function - this hopefully isn't called often
// Sets currentmap.func to be the WorldXY creation function using AJAX.
// Because this takes time to load, func is an optional function to call when finished.
function loadMapAjax(func) {
  currentmap.func = false;
  ajax.open("POST","Maps/World" + currentmap[0] + "" + currentmap[1] + ".js", true);
  ajax.send();
  ajax.onreadystatechange = function() {
    if(ajax.readyState != 4 || ajax.status != 200) return;
    currentmap.func = false;
    eval("currentmap.func = " + ajax.responseText);
    func();
  };
}

function setMapPostRequest() {
  // With currentmap.func being the WorldXY function, use it, then sort map
  currentmap.func(map);
  processMapPostFunc(map);
  map.areanum = map.curloc = 0;
  for(var i=0; i<map.areas.length; ++i) {
    map.areas[i].current = 0;
    map.areas[i].prethings.sort(function(a,b) {
      if(a.xloc == b.xloc) return b.yloc - a.yloc;
      else return a.xloc - b.xloc;
    });
  }
  // Start the game already!
  mario = placeMario();
  spawnMap();
  if(map.startfunc) map.startfunc();
  bodystyle.visibility = "visible";
  body.className = map.areas[map.areanum].setting;
  // Mario modifiers
  if(map.areas[map.areanum].setting != "")
    play(map.areas[map.areanum].setting.split(" ")[0] + ".mp3", true, true);
  if(data.mariopower >= 2) marioGetsBig(mario, true);
  if(data.mariopower == 3) marioGetsFire(mario, true);
  // On-screen display
  data.time.amount = map.time;
  data.world.amount = currentmap[0] + "-" + currentmap[1];
  setDataDisplay();
  startDataTime();
  // Consider it started.
  unpause();
  map.ending = notime = false;
}

// (screen.right - screen.left) / unitsize is width
function processMapPostFunc(map) {
  for(var i=0; i<map.areas.length; ++i) { 
    // Give it a ScrollBlocker at the area.width
    var blocker = new PreThing(new Thing(ScrollBlocker), map.areas[i].width, 0);
    map.areas[i].prethings.push(blocker);
    // If it's underwater, give it the waves on top
    if(map.areas[i].underwater) {
      map.refx = map.areas[i].xloc;
      var waves = new PreThing(new Thing(Sprite, "Water", [map.areas[i].width / 3, 1]), 0, 16);
      var block = new PreThing(new Thing(WaterBlock, map.areas[i].width), 0, 0);
      map.areas[i].prethings.unshift(waves);
      map.areas[i].prethings.unshift(block);
    }
  }
  
  setAreaSettings();
}

  // Currently just jumpmod
  // To do: add in other stuff
function setAreaSettings() {
  map.jumpmod = 1.105 + .63 * map.underwater;
}


// To do: Maybe spawn all solids at start and split prethings into solids and characters?
function spawnMap() {
  var arr = map.areas[map.areanum].prethings; // For ease of use
  // Instead of screen.right + quads.width, use rightmost quad col - most recently added
  while(arr.length > map.current && screen.right + quads.rightdiff >= arr[map.current].xloc * unitsize) {
    if(arr[map.current].object.placed) continue;
    addThing(arr[map.current].object,
      arr[map.current].xloc * unitsize - screen.left, arr[map.current].yloc * unitsize);
    ++map.areas[map.areanum].current;
    ++map.current; // equals above?
  }
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

/*
 * Yay, pipe movement!
 * Pipe z-index is normally 3
 * Mario z-index is normally 14
 */
function intoPipeVert(me, pipe, locnum) {
  if(!me.resting || me.right + unitsize > pipe.right || me.left - unitsize < pipe.left) return;
  pipePreparations(me);
  var move = setInterval(function() {
    shiftVert(me, unitsized4, true);
    if(me.top >= pipe.top) {
      clearInterval(move);
      shiftToLocation(map.locs[locnum]);
    }
  }, timer);
}
function intoPipeHoriz(me, pipe, locnum) {
  if(!me.resting || !me.keys.run || me.top + unitsize < pipe.top || me.bottom - unitsize > pipe.bottom) return;
  pipePreparations(me);
  var move = setInterval(function() {
    shiftHoriz(me, unitsized4, true);
    if(me.left >= pipe.left) {
      clearInterval(move);
      shiftToLocation(map.locs[locnum]);
    }
  }, timer);
}
function pipePreparations(me) {
  play("Pipe.wav");
  locMovePreparations(me);
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
  pause();
  play("Pipe.wav");
  setTop(me, pipe.top);
  setMidXObj(me, pipe, true);
  updateDisplay(me);
  var dy = unitsize / -4, move = setInterval(function() {
    shiftVert(me, dy, true);
    if(me.bottom <= pipe.top) {
      clearInterval(move);
      me.nocollide = me.piping = false;
      me.placed = true;
      me.element.style.zIndex = 14;
      unpause();
    }
  }, timer);
}
function enterCloudWorld(me) {
  // There are four cloud blocks to the left
  // The vine goes up until it has four blocks above the clouds, then waits 2 seconds
  // Mario climbs up the left until two blocks from the top, then switches & jumps
  pause();
  var screenbottom = 140 * unitsize;
  setLeft(me, unitsizet32);
  setTop(me, screenbottom);
  me.element.style.zIndex = 14;
  removeClass(me, "jumping");
  
  
  me.attached = new Thing(Vine, -1);
  addThing(me.attached, unitsizet32, screenbottom - unitsizet8);
  
  var movement = setInterval(function() {
    // Vine moving up
    shiftVert(me.attached, unitsized4 * -1, true);
    if(me.attached.bottom <= screenbottom) {
      clearInterval(movement);
      setBottom(me.attached, screenbottom, true);
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
              removeClass(me, "flipped");
              me.piping = true;
              me.nocollide = false;
              unpause();
              me.xvel = 3.5;
            }, timer * 28);
          }, timer * 14);
        }
      }, timer);
    }
  }, timer);
  
  // updateDisplay(me);
  // me.nocollide = me.piping = true;
  // unpause();
}
function entryNormal(me, thing) {
  pause();
  setLeft(me, unitsizet16);
  setTop(me, unitsizet16);
  updateDisplay(me);
  me.nocollide = me.piping = false;
  me.placed = true;
  unpause();
  me.element.style.zIndex = 14;
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

/*
 * Adding Functions
 */
// Most of which call pushPre
function pushPreScenery(name, xloc, yloc, repx, repy) {
  repx = repx || 1; repy = repy || 1;
  var thing = new Thing(Sprite, name, [repx, repy]);
  var prething = new PreThing(thing, map.refx + xloc, map.refy - thing.height - yloc);
  return map.areas[map.areanum].prethings.push(prething) - 1;
}

function pushPreThing(type, xloc, yloc, extras, more) {
  var prething = new PreThing(new Thing(type, extras, more), map.refx + xloc, map.refy - yloc);
  map.last = map.areas[map.areanum].prethings.push(prething) - 1; // remember, map.last is the # position in the array
  map.areas[map.areanum].width = Math.max(map.areas[map.areanum].width, prething.xloc + prething.object.width);
  return map.last;
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

function makeCeiling(xloc, num) {
  for(var i=0; i<num; ++i)
    pushPreThing(Brick, xloc + i * 8, ceillev);
}

function pushPreBridge(xloc, yloc, length, sides) {
  pushPreScenery("Railing", xloc, yloc, length * 2);
  pushPreThing(BridgeBase, xloc, yloc, length);
  if(sides instanceof Array) {
    if(sides[0]) pushPreThing(Stone, xloc - 8, yloc, 64);
    if(sides[1]) pushPreThing(Stone, xloc + length * 8, yloc, 64);
  }
}

function pushPreWater(xloc, yloc, length) {
  // 384 = 48 * 8
  pushPreScenery(Scenery.water, xloc, yloc - 384, [length * 8, 384]);
}

function pushPreScale(xloc, yloc, width, settings) {
  var platwidth = settings[0], offx = platwidth * 2,
  offy1 = settings[1] + 1, offy2 = settings[2] + 1, arr = map.areas[map.areanum].prethings;
  me = arr[pushPreThing(Scale, xloc, yloc, width) - 1].object;
  
  // Set the platforms
  platleft = arr[pushPreThing(Platform, xloc - offx, yloc - offy1 * 4, platwidth, moveFalling)].object;
  platright = arr[pushPreThing(Platform, xloc + width * 2 + offx, yloc - offy2 * 4, platwidth, moveFalling)].object;
  platleft.parent = me; platright.parent = me;
  platleft.partner = platright; platleft.tension = offy1 * unitsize * 4 - unitsizet8;
  platright.partner = platleft; platright.tension = offy2 * unitsize * 4 - unitsizet8;
  
  // Set the tension
  me.tensionleft = offy1 * unitsize; me.tensionright = offy2 * unitsize;
}

function addCheckpoint(xloc, thing) {
  map.checkpoints.push(new Checkpoint(map.areanum, xloc, thing));
}

function setEntrance(obj, loc) {

  map.locs[loc || map.curloc].entrything = map.areas[map.areanum].prethings[map.last].object;
}

function goUnderWater() {
  map.areas[map.areanum].underwater = true;
}

/*
 * Specific creation of often-used stuff
 */
// The detector has stuff stored in it, so the animation functions can use them
// Some worlds (8-3, for example) have an unusual distance from flag to castle
function endCastleOutside(xloc, yloc, castlevel, wall, dist) {
  if(castlevel) castlevel = castlev;
  dist = dist || 20;
  var arr = map.areas[map.areanum].prethings;
  var detect = arr[pushPreThing(FlagDetector, xloc + 7, yloc + 108)].object;
  detect.flag = arr[pushPreThing(Flag, xloc + .5, yloc + 79.5)].object;
  detect.stone = arr[pushPreThing(Stone, xloc + 4, yloc + 8, 1)].object;
  detect.top = arr[pushPreThing(FlagTop, xloc + 6.5, 84)].object;
  detect.pole = arr[pushPreThing(FlagPole, xloc + 8, 80)].object;
  var detect2 = arr[pushPreThing(CastleDoorDetector, xloc + 60 + (castlev == 0) * 8, 8)].object;
  detect2.castle = arr[pushPreScenery("Castle", xloc + dist + (castlevel == 0) * 8, yloc + castlevel)].object;
  if(wall)
    pushPreScenery("CastleWall", xloc + dist + 56 + (castlevel == 0) * 24, yloc, wall);
}

function startCastleInside() {
  var arr = map.areas[map.areanum].prethings;
  
  pushPreThing(GenericStone, 0, 88, 5, 3);
  pushPreThing(GenericStone, 0, 48, 3, 48);
  pushPreThing(GenericStone, 24, 40, 1, 48);
  pushPreThing(GenericStone, 32, 32, 1, 48);
}

function endCastleInside(xloc, last) {
  var arr = map.areas[map.areanum].prethings;
  
  pushPreThing(GenericStone, xloc, 88, 32);
  var axe = arr[pushPreThing(CastleAxe, xloc + 104, 40)].object;
  axe.bridge = arr[pushPreThing(CastleBridge, xloc, 24, 13)].object;
  axe.chain = arr[pushPreThing(CastleChain, xloc + 96.5, 32)].object;
  axe.bowser = arr[pushPreThing(Bowser, xloc + 69, 42)].object;
  // pushScenery(Scenery.water, xloc, -96, [108, 96]);
  pushPreThing(GenericStone, xloc + 104, 32, 3, 24);
  pushPreThing(GenericStone, xloc + 104, 0, 19, 24);
  pushPreThing(GenericStone, xloc + 112, 80, 2, 3);
  var npc;
  if(last) npc = arr[pushPreThing(Peach, xloc + 194, 13)].object;
  else npc = arr[pushPreThing(Toad, xloc + 194, 12)].object;
  npc.text = [
    arr[pushPreThing(text, xloc + 160, 66, [88, 24, "THANK YOU MARIO!", true])].object,
    arr[pushPreThing(text, xloc + 148, 50, [88, 24, "Come back in 2013 for the full game!", true])].object
  ];
}

function pushPreTree(xloc, yloc, width) {
  pushPreThing(TreeTop, xloc, yloc, width);
  // Although the tree trunks in later trees overlap earlier ones, it's ok because
  // the pattern is indistinguishible when placed correctly.
  // To do: var height = distanceToMapBase(yloc) instead of 168
  pushPreScenery("TreeTrunk", xloc + 8, yloc - 168, width -2, 168 / 8); 
}

function pushWater(name, xloc, yloc, width, height) {
  
}

function pushPrePipe(xloc, yloc, height, pirhana, loc) {
  if(pirhana) pushPreThing(Pirhana, xloc + 4, yloc + height);
  return pushPreThing(Pipe, xloc, yloc + height, height, loc);
}

/*
 * Starting function
 */
function walkToPipe() {
  mario.maxspeed = mario.walkspeed;
  nokeys = mario.keys.run = notime = true;
  // addEvent(mario, function() {
    // if(!PipeWalk()) addEvent(mario, PipeWalk);
  // }, 1);
  
  var move = setInterval(function() {
    if(mario.piping) {
      if(sounds[0]) sounds[0].pause();
      nokeys = mario.keys.run = notime = false;
      clearInterval(move);
      mario.maxspeed = mario.maxspeedsave;
    }
  }, timer);
}

// This is never reached because pause when piping means this isn't run
function PipeWalk() {
  if(mario.piping) {
    alert("yeah");
    if(sounds[0]) sounds[0].pause();
    nokeys = mario.keys.run = notime = false;
    mario.maxspeed = mario.maxspeedsave;
    return true;
  }
  return false;
}

function startCastle() {
  setBottom(mario, 54 * unitsize);
  setLeft(mario, unitsizet2, true);
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
    new Location(0, 0),
    new Location(1, 0),
    new Location(0, 920, exitPipeVert)
  ];
  map.areas = [
    new Area(0, 0, "Overworld"),
    new Area(0, 1400, "Underworld")
  ];

  setLocationGeneration(0);
  
  pushPrePattern("backreg", 0, 0, 5);
  pushPreThing(Floor, 0, 0, 69);
  pushPreThing(Block, 128, jumplev1);
  pushPreThing(Brick, 160, jumplev1);
  pushPreThing(Block, 168, jumplev1, Mushroom);
  pushPreThing(Goomba, 176, 8);
  pushPreThing(Brick, 176, jumplev1);
  pushPreThing(Block, 176, jumplev2);
  pushPreThing(Block, 184, jumplev1);
  pushPreThing(Brick, 192, jumplev1);
  pushPrePipe(224, 0, 16);
  pushPrePipe(304, 0, 24);
  pushPrePipe(368, 0, 32);
  pushPreThing(Goomba, 340, 8);
  pushPrePipe(368, 0, 32);
  pushPreThing(Goomba, 412, 8);
  pushPreThing(Goomba, 422, 8);
  pushPrePipe(456, 0, 32, false, 1);
  pushPreThing(Block, 512, 40, [Mushroom, 1], true);
  pushPreThing(Floor, 568, 0, 15);
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
  pushPreThing(Floor, 712, 0, 64);
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
  pushPreThing(Stone, 1072, 8, 1);
  pushPreThing(Stone, 1080, 16, 2);
  pushPreThing(Stone, 1088, 24, 3);
  pushPreThing(Stone, 1096, 32, 4);
  pushPreThing(Stone, 1120, 32, 4);
  pushPreThing(Stone, 1128, 24, 3);
  pushPreThing(Stone, 1136, 16, 2);
  pushPreThing(Stone, 1144, 8, 1);
  pushPreThing(Stone, 1184, 8, 1);
  pushPreThing(Stone, 1192, 16, 2);
  pushPreThing(Stone, 1200, 24, 3);
  pushPreThing(Stone, 1208, 32, 4);
  pushPreThing(Stone, 1216, 32, 4);
  
  pushPreThing(Floor, 1240, 0, 69);
  pushPreThing(Stone, 1240, 32, 4);
  pushPreThing(Stone, 1248, 24, 3);
  pushPreThing(Stone, 1256, 16, 2);
  pushPreThing(Stone, 1264, 8, 1);
  setEntrance(pushPreThing(Pipe, 1304, 16, 16), 2); // goes up
  
  pushPreThing(Brick, 1344, jumplev1);
  pushPreThing(Brick, 1352, jumplev1);
  pushPreThing(Block, 1360, jumplev1);
  pushPreThing(Brick, 1368, jumplev1);
  pushPreThing(Goomba, 1392, 8);
  pushPreThing(Goomba, 1404, 8);
  
  pushPreThing(Pipe, 1432, 16, 16);
  pushPreThing(Stone, 1448, 8, 1);
  pushPreThing(Stone, 1456, 16, 2);
  pushPreThing(Stone, 1464, 24, 3);
  pushPreThing(Stone, 1472, 32, 4);
  pushPreThing(Stone, 1480, 40, 5);
  pushPreThing(Stone, 1488, 48, 6);
  pushPreThing(Stone, 1496, 56, 7);
  pushPreThing(Stone, 1504, 64, 8);
  pushPreThing(Stone, 1512, 64, 8);
  endCastleOutside(1580, 0, castlev);
  
  setLocationGeneration(1);
  
  makeCeiling(32, 7);
  pushPreThing(Floor, 0, 0, 17);
  fillPreThing(Brick, 0, 8, 1, 11, 8, 8);
  fillPreThing(Brick, 32, 8, 7, 3, 8, 8);
  fillPreThing(Coin, 33, 31, 7, 2, 8, 16);
  fillPreThing(Coin, 41, 63, 5, 1, 8, 8);
  pushPreThing(PipeSide, 104, 16, 2);
  pushPreThing(PipeVertical, 120, 88, 88);
}