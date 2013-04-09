function Mario(me) {
  var name = "mario";
  me.width = 7;
  me.height = 8;
  me.walkspeed = unitsized2;
  me.canjump = me.nofiredeath = me.nofire = me.mario = 1;
  me.numballs = me.moveleft = me.star = me.dieing = me.nofall = me.maxvel = me.paddling = 0;
  me.running = ''; // Evalues to false for cycle checker
  me.power = data.mariopower;// 1 for normal, 2 for big, 3 for fiery
  me.collide = function(one, two) { two.collide(two, one); };
  me.maxspeed = me.maxspeedsave = unitsize * 1.35; // Really only used for timed animations
  me.scrollspeed = unitsize * 1.75;
  me.keys = new Keys();
  me.fire = marioFires;
  me.movement = moveMario;
  me.death = killMario;
  setCharacter(me, name);
  me.tolx = unitsizet2;
  me.toly = unitsize;
  me.gravity = map.gravity;
  if(map.underwater) addSpriteCycle(me, ["swim1", "swim2"]);
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
  mario.toly = unitsize;
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
  ++me.power;
  if(me.power == 2) marioGetsBig(me);
  else marioGetsFire(me);
  storeMarioStats();
}
// These three modifiers don't change power levels.
function marioGetsBig(me, noanim) {
  me.height = 16;
  me.width = 8;
  me.keys.down = 0;
  removeClass(mario, "crouching");
  updateBottom(me, 0);
  updateDisplay(me);
  updateSize(me);
  if(!noanim) {
    pause();
    // Manual is used because the game is paused
    var stages = [1,2,1,2,3,2,3];
    for(var i = stages.length - 1; i >= 0; --i)
      stages[i] = "shrooming" + stages[i];
    stages.push(function(me, settings) {
      me.shrooming = false;
      settings.length = 0;
      me.element.className += " large";
      unpause();
      return "";
    });
    addSpriteCycleManual(me, stages, "shrooming", 7);
  } else me.element.className += " large";
}
function marioGetsSmall(me) {
  pause();
  me.element.className += " shrooming";
  flicker(me, 140);
  setTimeout(function() {
    removeClass(me,"large");
    removeClass(me,"fiery");
    removeClass(me,"shrooming");
    me.width = 7;
    me.height = 8;
    updateSize(me);
    me.shrooming = false;
    unpause();
  }, timer * 70);
}
function marioGetsFire() {
  mario.element.className += " fiery";
  removeClass(mario, "intofiery");
  mario.element.className.replace("intofiery");
  mario.shrooming = false;
}

function moveMario(me) {
  // Jumping
  if(!me.keys.up) me.keys.jump = 0;
  if(me.keys.up && me.keys.jump > 0 && (me.yvel <= 0 || map.underwater) ) {
    if(map.underwater) marioPaddles(me);
    if(me.resting) {
      if(me.resting.xvel) me.xvel += me.resting.xvel;
      me.resting = false;
    }
    else {
      if(!me.jumping) me.element.className += " jumping";
      me.jumping = true;
    }
    if(!map.underwater) {
      var dy = unitsize / (Math.pow(++me.keys.jumplev, map.jumpmod - .0014 * me.xvel));
      me.yvel = max(me.yvel - dy, map.maxyvelinv);
    }
  } 
  // Crouching
  else if(me.keys.crouch && !me.crouching) {
    if(me.power != 1) {
      me.crouching = true;
      me.element.className += " crouching";
      me.height = 11;
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
  if(me.keys.run != 0 && !me.crouching) {
    var adder = (.084 * (me.keys.sprint + 1)) * me.keys.run;
    me.xvel += adder; me.xvel *= .98;
    mario.maxvel = max(mario.xvel, mario.maxvel);
    decel = .0007;
  } else me.xvel *= .96;
  
  if(me.xvel > 0) me.xvel = max(0, me.xvel - decel);
  else me.xvel = min(0, me.xvel + decel);
  
  // Movement mods
  // To do: add in unitsize measurement?
  if(Math.abs(me.xvel) < .14) {
    removeClass(me, "running");
    me.running.length = 0;
    me.running = false;
    if(Math.abs(me.xvel) < .049) me.xvel = 0;
  } else if(!me.running) {
    // me.running = true;
    addClass(me, "running");
    me.running = addSpriteCycle(me, ["one", "two", "three"], "running", 5);
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
      me.element.className += " flipped";
      me.moveleft = true;
    }
  }
  
  // Etc
  // To do: isn't me never reached?
  if(me.resting) {
    me.keys.jumplev = me.yvel = me.jumpcount = 0;
    if(me.jumping) {
      me.jumping = false;
      removeClass(me, "jumping");
    }
  }
}

function marioPaddles(me) {
  ++me.paddling;
  me.element.className += " paddling";
  addEvent(function(me) {
    removeClass(me, "paddling")
    addEvent(function(me) {
      me.element.className += " paddling";
      addEvent(function(me) {
        removeClass(me, "paddling");
      }, 3, me);
    }, 3, me);
  }, 3, me);
  me.yvel = unitsize * -.84;
}

function marioBubbles() {
  var bubble = new Thing(Bubble);
  addThing(bubble, mario.right, mario.top);
  // addEvent(killNormal, 140, bubble);
}

function moveMarioVine(me) {
  if(me.bottom < me.attached.top) return unattachMario(me);
  if(me.keys.run == me.attachoff) {
    while(objectsTouch(me, me.attached))
      shiftHoriz(me, me.keys.run, true);
    return unattachMario(me);
  }
  if(me.keys.up) {
    shiftVert(me, unitsized4 * -1, true);
  } else if(me.keys.crouch) {
    // something
  }
  
  if(me.bottom < -16) { // ceilmax (104) - ceillev (88)
    locMovePreparations(me);
    shiftToLocation(me.attached.locnum);
    return unattachMario(me);
  }
}

function unattachMario(me) {
  me.movement = moveMario;//me.movementsave;
  me.attached.attached = false;
  me.attached = me.yvel = me.attachoff = me.nofall = false;
  me.xvel = me.keys.run;
}

function marioHopsOff(me, solid) {
  removeClasses(me, "climbing running");
  me.element.className += " jumping";
  
  me.piping = me.nocollide = me.nofall = false;
  me.xvel = 3.5;
  me.gravity = gravity /= 2;
  me.yvel = -2.1;
  addEvent(function(me) {
    removeClass(me, "flipped");
    me.gravity = gravity *= 2;
  }, 21, me);
  
  unpause();
}

function marioFires() {
  if(this.numballs >= 2) return;
  ++this.numballs;
  this.element.className += " firing";
  var ball = new Thing(FireBall, this.moveleft, true);
  ball.yvel = unitsize
  placeThing(ball, this.right + unitsized4, this.top + unitsizet8);
  if(mario.moveleft) setRight(ball, mario.left - unitsized4, true);
  ball.animate(ball);
  addEvent(function(me) { removeClass(me, "firing"); }, 7, this);
}
function emergeFire(me) {
  play("Fireball.wav");
  characters.push(me);
}

function marioStar(me) {
  if(me.star) return;
  me.star = true;
  me.element.className += " star";
  play("Starman.mp3", true, true);
  play("Powerup.wav");
  addEvent(marioRemoveStar, 560, me );
  addSpriteCycle(me, ["star1", "star2", "star3", "star4"], "star", 5);
}
function marioRemoveStar(me) {
  if(!me.star) return;
  me.star = false;
  removeClasses(me, "star1 star2 star3 star4");
  removeClass(me, "star");
  me.cycles["star"].length = 0;
  play(map.areas[map.areanum].setting + ".mp3", true, true);
}

function killMario(me, big) {
  if(!me.alive || me.flickering || me.dying) return;
  if(!big && mario.power > 1) {
    play("Power Down.wav");
    me.power = 1;
    storeMarioStats();
    return marioGetsSmall(me);
  }
  pauseTheme();
  play("Mario Dies.wav", false, true);
  me.nocollide = me.nofall = me.nomove = nokeys = me.dead = me.dying = 1;
  me.xvel = me.yvel = me.resting = 0;
  me.element.className = "character mario dead";
  me.element.style.zIndex = 14;
  --data.lives.amount;
  if(!map.random) data.score.amount = data.scoreold;
  
  // If Mario is killed normally, animate him
  if(big != 2) {
    notime = true;
    // if(!map.random) {
      // // pause();
      // notime = true;
    // }
    setTimeout(function() {
      me.counter = -1.4;
      me.dying = setInterval(function() {
        me.counter += .0117;
        shiftVert(me, me.counter, true);
      });
    }, timer * 14);
  }
  
  // If the map is normal, or failing that a game over is reached, timoeut a reset
  if(!map.random || data.lives.amount == 0) {
    reset = setTimeout(data.lives.amount ? setMap : gameOver, timer * 280);
  }
  // If it's random, spawn him again
  else {
    reset = setTimeout(function() {
      clearOldMario();
      mario = addThing(new Thing(Mario), unitsizet16, unitsizet8 * -1 + map.underwater * unitsize * 24);
      nokeys = false;
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
  
  var innerHTML = "<div style='padding-top: " + (innerHeight / 2 - 49) + "px'>GAME OVER</div>";
  innerHTML += "<p style='font-size:14px;opacity:.49;width:490px;margin:auto;margin-top:49px;'>";
  innerHTML += "You have run out of lives. Maybe you're not ready for playing real games...";
  innerHTML += "</p>";
  
  body.className = "Night"; // makes it black
  body.innerHTML = innerHTML;
  body.style.fontSize = "49px";
  
  gamecount = Infinity;
  clearMarioStats();
  game.data = new Data();
  
  setTimeout(gameRestart, 4900);
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
  data.score.amount += amount;
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
  d.style.width = "110%";
  d.style.marginLeft = "-5%";
  d.style.marginRight = "-5%";
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
  addEvent(
    function(me) {
      if(!notime) {
        map.time = --me.amount;
        updateDataElement(me);
      }
      switch(data.time.amount) {
        case 100:
          play("Hurry " + map.areas[map.areanum].setting + ".mp3", true, true);
        break;
        case 0:
          killMario(mario, true);
        break;
        default:
          startDataTime();
        break;
      }
    },
    25, data.time
  );
}