function Mario(me) {
  var name = "mario";
  me.width = 7;
  me.height = 8;
  me.walkspeed = unitsized2;
  me.canjump = me.nofiredeath = me.nofire = me.mario = me.nokillend = 1;
  me.numballs = me.moveleft = me.star = me.dieing = me.nofall = me.maxvel = me.paddling = me.jumpers = me.landing = 0;
  me.running = ''; // Evalues to false for cycle checker
  me.collide = function() { alert("yeah"); };
  me.power = data.mariopower;// 1 for normal, 2 for big, 3 for fiery
  me.maxspeed = me.maxspeedsave = unitsize * 1.35; // Really only used for timed animations
  me.scrollspeed = unitsize * 1.75;
  me.keys = new Keys();
  me.fire = marioFires;
  me.movement = moveMario;
  me.death = killMario;
  setCharacter(me, name);
  me.tolx = unitsizet2;
  me.toly = 0;
  me.gravity = map.gravity;
  if(map.underwater) {
    me.swimming = true;
    addSpriteCycle(me, ["swim1", "swim2"], "swimming");
  }  
}

function checkReset() {
  if(!reset) return;
  clearInterval(reset);
  clearTimeout(reset);
}

function placeMario() {
  clearOldMario();
  mario = new Thing(Mario);
  if(data.mariopower >= 2) {
    marioGetsBig(mario, true);
    if(data.mariopower == 3) marioGetsFire(mario, true);
  }
  return addThing(mario, unitsizet16, (map.floor - mario.height) * unitsize);
}
function clearOldMario() {
  if(!window.mario) return;
  // if(mario.element) removeElement(mario);
  mario.alive = false;
  mario.dead = true;
}

function Keys() {
  // Run: 0 for no, 1 for right, -1 for left
  // Crouch: 0 for no, 1 for yes
  // Jump: 0 for no, jumplev = 1 through jumpmax for yes
  this.run = this.crouch = this.jump = this.jumplev = this.sprint = 0;
}

function removeCrouch() {
  mario.crouching = false;
  mario.toly = mario.tolyold || 0;
  if(mario.power != 1) {
    removeClass(mario, "crouching");
    mario.height = 16;
    updateBottom(mario, 0);
    updateSize(mario);
  }
}

function marioShroom(me) {
  if(me.shrooming) return;
  play("Powerup.wav");
  score(me, 1000, true);
  if(me.power == 3) return;
  me.shrooming = true;
  (++me.power == 2 ? marioGetsBig : marioGetsFire)(me);
  storeMarioStats();
}
// These three modifiers don't change power levels.
function marioGetsBig(me, noanim) {
  setSize(me, 8, 16);
  me.keys.down = 0;
  removeClass(mario, "crouching");
  updateBottom(me, 0);
  updateSize(me);
  if(!noanim) {
    // pause();
    // Mario cycles through 'shrooming1', 'shrooming2', etc.
    var stages = [1,2,1,2,3,2,3,3];
    for(var i = stages.length - 1; i >= 0; --i)
      stages[i] = "shrooming" + stages[i];
    
    // Clear Mario's movements
    mario.xvelold = mario.xvel;
    mario.yvelold = mario.yvel;
    mario.xvel = mario.yvel = mario.movement = false;
    mario.nofall = mario.nocollide = true;
    
    // The last event in stages clears it, resets Mario's movements, and stops
    stages.push(function(me, settings) {
      me.shrooming = settings.length = 0;
      addClass(me, "large");
      mario.nofall = mario.nocollide = false;
      mario.xvel = mario.xvelold;
      mario.yvel = mario.yvelold;
      mario.movement = moveMario;
      delete mario.xvelold; 
      delete mario.yvelold;
      return "";
    });
    
    addSpriteCycle(me, stages, "shrooming", 6);
  }
  else addClass(me, "large");
}
function marioGetsSmall(me) {
  pause();
  addClass(me, "shrooming");
  flicker(me, 140);
  setTimeout(function() {
    removeClasses(me, ["large", "fiery", "shrooming"]);
    me.width = 7;
    me.height = 8;
    updateSize(me);
    me.shrooming = false;
    unpause();
  }, timer * 70);
}
function marioGetsFire(me) {
  removeClass(me, "intofiery");
  addClass(me, "fiery");
  mario.element.className.replace("intofiery"); // To do: why did I put this in...?
  mario.shrooming = false;
}

// To do: add in unitsize measurement?
function moveMario(me) {
  // Not jumping
  if(!me.keys.up) me.keys.jump = 0;
  
  // Jumping
  else if(me.keys.jump > 0 && (me.yvel <= 0 || map.underwater) ) {
    if(map.underwater) marioPaddles(me);
    if(me.resting) {
      if(me.resting.xvel) me.xvel += me.resting.xvel;
      me.resting = false;
    }
    // Jumping, not resting
    else {
      if(!(me.jumping || map.underwater)) addClass(me, "jumping");
      me.jumping = true;
    }
    if(!map.underwater) {
      var dy = unitsize / (Math.pow(++me.keys.jumplev, map.jumpmod - .0014 * me.xvel));
      me.yvel = max(me.yvel - dy, map.maxyvelinv);
    }
  }
  
  // Crouching
  if(me.keys.crouch && !me.crouching && me.resting) {
    if(me.power != 1) {
      me.crouching = true;
      addClass(me, "crouching");
      me.height = 11;
      me.tolyold = me.toly;
      me.toly = unitsizet4;
      updateBottom(me, 0);
      updateSize(me);
    }
    // Pipe movement
    if(me.resting.actionTop)
      me.resting.actionTop(me, me.resting, me.resting.transport);
  }
  
  // Running
  var decel = .03;
  // If a button is pressed, hold/increase speed
  if(me.keys.run != 0 && !me.crouching) {
    var adder = (.084 * (me.keys.sprint + 1)) * me.keys.run;
    me.xvel += adder; me.xvel *= .98;
    mario.maxvel = max(mario.xvel, mario.maxvel);
    decel = .0007;
  }
  // Otherwise slow down a bit
  else me.xvel *= .96;
  
  if(me.xvel > 0) me.xvel = max(0, me.xvel - decel);
  else me.xvel = min(0, me.xvel + decel);
  
  // Movement mods
  // Slowing down
  if(Math.abs(me.xvel) < .14) {
    removeClass(me, "running");
    me.running.length = 0;
    me.running = false;
    if(Math.abs(me.xvel) < .049) me.xvel = 0;
  }
  // Not moving slowly
  else if(!me.running) {
    me.running = true;
    addClass(me, "running");
    // setMarioRunningCycler sets the time between cycles
    me.running = addSpriteCycle(me, ["one", "two", "three", "two"], "running", setMarioRunningCycler);
  }
  if(me.xvel > 0) {
    me.xvel = min(me.xvel, me.maxspeed);
    if(me.moveleft && (me.resting || map.underwater)) {
      removeClass(me, "flipped");
      me.moveleft = false;
    }
  }
  else if(me.xvel < 0) {
    me.xvel = max(me.xvel, me.maxspeed * -1);
    if(!me.moveleft && (me.resting || map.underwater)) {
      addClass(me, "flipped");
      me.moveleft = true;
    }
  }
  
  // Resting stops a bunch of other stuff
  if(me.resting) {
    // Hopping
    if(me.hopping) {
      removeClass(me, "hopping");
      if(me.xvel != 0) addClass(me, "running");
      me.hopping = false;
    }
    // Jumping
    me.keys.jumplev = me.yvel = me.jumpcount = 0;
    if(me.jumping) {
      me.jumping = false;
      removeClass(me, "jumping");
    }
    // Paddling
    if(me.swimming || me.paddling) {
      me.paddling = me.swimming = false;
      removeClasses(me, "paddling swim1 swim2");
      clearClassCycles(me, "paddling");
      addClass(me, "running");
    }
  }
}

function setMarioRunningCycler(event) {
  event.timeout = 5 + ceil(mario.maxspeedsave - abs(mario.xvel));
}

function marioPaddles(me) {
  if(!me.paddling) {
    addClass(me, "paddling");
    addSpriteCycle(me, ["paddle1", "paddle2", "paddle1", "paddle2", function() { return me.paddling = false; }], "paddling", 7);
    removeClasses(me, "running");
  }
  me.paddling = me.swimming = true;
  me.yvel = unitsize * -.84;
}

function marioBubbles() {
  var bubble = new Thing(Bubble);
  addThing(bubble, mario.right, mario.top);
  // addEvent(killNormal, 140, bubble);
}

function moveMarioVine(me) {
  var attached = me.attached;
  if(me.bottom < attached.top) return unattachMario(me);
  if(me.keys.run == me.attachoff) {
    while(objectsTouch(me, attached))
      shiftHoriz(me, me.keys.run, true);
    return unattachMario(me);
  }
  
  // If Mario is moving up, simply move up
  if(me.keys.up) {
    me.animatednow = true;
    shiftVert(me, unitsized4 * -1, true);
  }
  // If mario is moving down, move down and check for unattachment
  else if(me.keys.crouch) {
    me.animatednow = true;
    shiftVert(me, unitsized2, true);
    if(me.bottom > attached.bottom - unitsizet4) return unattachMario(me);
  }
  else me.animatednow = false;
  
  if(me.animatednow && !me.animated) {
    addClass(me, "animated");
  } else if(!me.animatednow && me.animated) {
    removeClass(me, "animated");
  }
  
  me.animated = me.animatednow;
  
  if(me.bottom < -16) { // ceilmax (104) - ceillev (88)
    locMovePreparations(me);
    shiftToLocation(attached.locnum);
    return unattachMario(me);
  }
}

function unattachMario(me) {
  me.movement = moveMario;//me.movementsave;
  removeClasses(me, "climbing", "animated");
  clearClassCycle(me, "climbing");
  me.yvel = me.skipoverlaps = me.attachoff = me.nofall = me.climbing = me.attached = me.attached.attached = false;
  me.xvel = me.keys.run;
}

function marioHopsOff(me, solid, addrun) {
  removeClasses(me, "climbing running");
  addClass(me, "jumping");
  
  me.piping = me.nocollide = me.nofall = false;
  me.gravity = gravity /= 2;
  me.xvel = 3.5;
  me.yvel = -2.1;
  addEvent(function(me) {
    removeClass(me, "flipped");
    me.gravity = gravity *= 2;
    if(addrun) addClass(me, "running");
  }, 21, me);
  
  unpause();
}

function marioFires() {
  if(mario.numballs >= 2) return;
  ++mario.numballs;
  addClass(mario, "firing");
  var ball = new Thing(FireBall, mario.moveleft, true);
  ball.yvel = unitsize
  placeThing(ball, mario.right + unitsized4, mario.top + unitsizet8);
  if(mario.moveleft) setRight(ball, mario.left - unitsized4, true);
  ball.animate(ball);
  addEvent(function(mario) { removeClass(mario, "firing"); }, 7, mario);
}
function emergeFire(me) {
  play("Fireball.wav");
  characters.push(me);
}

function marioStar(me) {
  if(me.star) return;
  me.star = true;
  play("Starman.mp3", true, true);
  play("Powerup.wav");
  addEvent(marioRemoveStar, 560, me);
  addClass(me, "star");
  addSpriteCycle(me, ["star1", "star2", "star3", "star4"], "star", 5);
}
function marioRemoveStar(me) {
  if(!me.star) return;
  me.star = false;
  removeClasses(me, "star star1 star2 star3 star4");
  if(me.cycles.star) me.cycles.star.length = 0;
  play(map.areas[map.areanum].setting + ".mp3", true, true);
}

// Big means it must happen: 2 means no animation
function killMario(me, big) {
  if(!me.alive || me.flickering || me.dying) return;
  // If this is an auto kill, it's for rizzles
  if(big == 2) {
    notime = true;
    me.element.style.visibility = "hidden";
    me.dead = me.dying = true;
  }
  // Otherwise it's just a regular (enemy, time, etc.) kill
  else {
    // If Mario can survive this, just power down
    if(!big && me.power > 1) {
      play("Power Down.wav");
      me.power = 1;
      storeMarioStats();
      return marioGetsSmall(me);
    }
    // Otherwise, if this isn't a big one, animate
    else if(big != 2) {
      me.element.className = "character mario dead";
      me.dying = true;
      me.xvel = me.resting = me.movement = 0;
      me.element.style.zIndex = 14;
      me.gravity = gravity / 2.1;
      me.yvel = unitsize * -1.4;
    }
  }
  
  // Clear and reset
  pauseTheme();
  play("Mario Dies.wav", false, true);
  me.nocollide = me.nomove = nokeys = 1;
  --data.lives.amount;
  if(!map.random) data.score.amount = data.scoreold;
  
  // If the map is normal, or failing that a game over is reached, timoeut a reset
  if(!map.random || data.lives.amount == 0) {
    reset = setTimeout(data.lives.amount ? setMap : gameOver, timer * 280);
  }
  // Otherwise it's random; spawn him again
  else {
    reset = setTimeout(function() {
      clearOldMario();
      mario = addThing(new Thing(Mario), unitsizet16, unitsizet8 * -1 + map.underwater * unitsize * 24);
      nokeys = notime = false;
      setAreaSettings();
      updateDataElement(data.score);
      updateDataElement(data.lives);
      unpause();
      flicker(mario, 140);
      clearInterval(me.dying);
      // If it's not underwater, give him a block to land on...
      if(!map.underwater) {
        mario.nocollide = true;
        addEvent(function() {
          mario.nocollide = false;
          window.lol = addThing(new Thing(RestingStone), mario.left, mario.bottom + mario.yvel);
        }, map.respawndist || 17);
      }
    }, timer * 140);
  }
}

function gameOver() {
  pause();
  pauseTheme();
  play("Game Over.mp3");
  
  var innerHTML = "<div style='font-size:49px;padding-top: " + (innerHeight / 2 - 28/*49*/) + "px'>GAME OVER</div>";
  // innerHTML += "<p style='font-size:14px;opacity:.49;width:490px;margin:auto;margin-top:49px;'>";
  // innerHTML += "You have run out of lives. Maybe you're not ready for playing real games...";
  innerHTML += "</p>";
  
  body.className = "Night"; // to make it black
  body.innerHTML = innerHTML;
  
  gamecount = Infinity;
  clearMarioStats();
  game.data = new Data();
  
  setTimeout(gameRestart, 7000);
}

function gameRestart() {
  seedlast = .007;
  body.style.visibility = "hidden";
  body.innerHTML = body.style.paddingTop = body.style.fontSize = "";
  map.random ? setMapRandom() : setMap();
  addEvent(function() { body.style.visibility = ""; });
}

/*
 * ~Persistent data
 */
function Data() {
  this.mariopower = 1;
  this.traveled = this.traveledold = 0; // only used for random
  this.scorelevs = [100, 200, 400, 500, 800, 1000, 2000, 4000, 5000, 8000];
  this.score = new dataObject(0, 6, "SCORE");
  this.time = new dataObject(350, 3, "TIME");
  this.world = new dataObject(0, 0, "WORLD");
  this.coins = new dataObject(0, 0, "COINS");
  this.lives = new dataObject(3, 1, "LIVES");
  this.time.dir = -1;
}
function dataObject(amount, length, name) {
  this.amount = amount;
  this.length = length;
  this.element = document.createElement("td");
  this.name = name;
  this.element.className = "indisplay " + name;
} 

function score(me, amount, appears) {
  if(amount <= 0) return;
  localStorage.highscore = max(localStorage.highscore, data.score.amount += amount);
  if(appears) {
    var div = {
      element: document.createElement("div"),
      top: me.top - me.height * unitsize,
      left: me.left - me.width / 2,
    };
    div.style = div.element.style;
    div.element.className = "score";
    div.element.style.fontSize = (unitsize * 3.5) + "px";
    div.element.innerText = amount;
    updateDisplay(div);
    
    // Can't use event - pauses, like mario shrooming, mess it up
    setTimeout(function() { 
      body.appendChild(div.element);
    
      var move = setInterval(function() {
            shiftVert(div, unitsize / -4.9, true);
          }, timer);
      
      setTimeout(function() {
        clearInterval(move);
        body.removeChild(div.element);
      }, timer * 49);
    }, timer);
  }
  while(data.score > 10000) {
    gainLife();
    data.score = data.score % 10000;
  }
  updateDataElement(data.score);
}

function findScore(lev) {
  if(lev < data.scorelevs.length) return data.scorelevs[lev];
  gainLife();
  return -1;
}

function gainLife(num) {
  data.lives.amount += typeof(num) == "number" ? num : 1;
  play("Gain Life.wav");
  updateDataElement(data.lives);
}

function setLives(num) {
  data.lives.amount = Number(num);
  updateDataElement(data.lives);
}

function storeMarioStats() {
  data.mariopower = mario.power;
}
function clearMarioStats() {
  data.mariopower = mario.power = 1;
}

function updateDataElement(me) {
  var text = me.name + "\n" + (me.amount == "Infinity" ? "Inf" : me.amount);
  me.element.innerText = text;
  if(text.length > 14) me.element.style.width = "490px";
  else me.element.style.width = "";
}

function setDataDisplay() {
  var d = document.createElement("table"),
      elems = ["score", "coins", "world", "time", "lives"];
  d.id = "data_display";
  d.style.width = (screen.right + 14) + "px";
  // d.style.marginLeft = "-14px";
  // d.style.marginRight = "-14px";
  document.body.appendChild(d);
  data.display = d;
  for(var i in elems) {
    d.appendChild(data[elems[i]].element);
    updateDataElement(data[elems[i]]);
  }
  data.display.className = "display";
  body.appendChild(data.display);
}

function clearDataDisplay() {
  body.removeChild(data_display);
}

function startDataTime() {
  addEventInterval(updateDataTime, 25, Infinity, data.time);
}

function updateDataTime(me) {
  if(!notime) {
    map.time = me.amount += me.dir;
    updateDataElement(me);
  }
  if(me.dir != -1) return;
  switch(data.time.amount) {
    case 100:
      playCurrentThemeHurry();
      // play("Hurry " + map.areas[map.areanum].setting + ".mp3", true, true);
    break;
    case 0:
      killMario(mario, true);
    break;
  }
}