function Mario(me) {
  var name = "mario";
  me.width = 7;
  me.height = 8;
  me.walkspeed = unitsized2;
  me.canjump = me.nofiredeath = me.nofire = 1;
  me.numballs = me.moveleft = me.star = me.dieing = me.running = 0;
  me.power = data.mariopower;// 1 for normal, 2 for big, 3 for fiery
  me.collide = function(one, two) { two.collide(two, one); };
  me.maxspeed = me.maxspeedsave = unitsizet2; // Really only used for timed animations
  me.keys = new Keys();
  me.fire = marioFires;
  me.movement = moveMario;
  me.death = killMario;
  setCharacter(me, name);
  me.tolx = unitsizet2;
  me.toly = unitsize;
  if(map.underwater) me.gravity = gravity / 1.4;
}

function placeMario() {
  newmario = new Thing(Mario);
  return addThing(newmario, unitsizet16, (map.floor - newmario.height) * unitsize);
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
  score(mario, 1000, true);
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
  updateBottom(me, 0);
  updateDisplay(me);
  updateSize(me);
  if(!noanim) {
    pause();
    // This unfortunately can't use addEvent, since it pauses.
    var j = 0, stages = [1,2,1,2,1,2,3,1,2,3,1,3], name = me.element.className;
    var func = function(i, stages) {
      me.element.className = name + " shrooming" + stages[i];
    }
    for(var i=0; i<12; ++i) {
      setTimeout(function() {
        func(j, stages);
        ++j;
      }, timer * i * 5);
    }
    
    setTimeout(function() {
      me.shrooming = false;
      me.element.className = name + " large";
      unpause();
    }, timer * 60);
  } else me.element.className += " large";
}
function marioGetsSmall(me) {
  pause();
  me.element.className += " shrooming";
  flicker(me, 140 * timer);
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

function moveMario() {
  // Jumping
  if(!this.keys.up) this.keys.jump = 0;
  if(this.keys.up && this.keys.jump > 0 && (this.yvel <= 0 || map.underwater) ) {
    if(this.resting) {
      if(this.resting.xvel) this.xvel += this.resting.xvel;
      this.resting = false;
    }
    else {
      if(!this.jumping) this.element.className += " jumping";
      this.jumping = true;
    }
    var dy = unitsize / (Math.pow(++this.keys.jumplev, map.jumpmod - .0014 * this.xvel));
    this.yvel = Math.max(this.yvel - dy, map.maxyvelinv);
  } 
  // Crouching
  else if(this.keys.crouch && !this.crouching) {
    if(this.power != 1) {
      this.crouching = true;
      this.element.className += " crouching";
      this.height = 11;
      this.toly = unitsizet4;
      updateBottom(this, 0);
      updateSize(this);
    }
    // Pipe movement
    if(this.resting.actionTop)
      this.resting.actionTop(this, this.resting, this.resting.transport);
  }
  // Running
  if(this.keys.run != 0 && !this.crouching) {
    var adder = (.07 * (this.keys.sprint + 1)) * this.keys.run;
    this.xvel += adder; this.xvel *= .98;
  } else this.xvel *= .96;
  
  // Movement mods
  // To do: add in unitsize measurement
  if(Math.abs(this.xvel) < .14) {
    removeClass(this, "running");
    this.running = false;
    if(Math.abs(this.xvel) < .049) this.xvel = 0;
  } else if(!this.running) {
    this.element.className += " running";
    this.running = true;
  }
  if(this.xvel > 0) {
    if(this.moveleft && this.resting) {
      removeClass(this, "flipped");
      this.moveleft = false;
    }
    this.xvel = Math.min(this.xvel, this.maxspeed);
  } else if(this.xvel < 0) {
    if(!this.moveleft && this.resting) {
      this.element.className += " flipped";
      this.moveleft = true;
    }
    this.xvel = Math.max(this.xvel, this.maxspeed * -1);
  }
  
  // Etc
  // To do: isn't this never reached?
  if(this.resting) {
    this.keys.jumplev = this.yvel = this.jumpcount = 0;
    if(this.jumping) {
      this.jumping = false;
      removeClass(this, "jumping");
    }
  }
}

function moveMarioVine() {
  if(this.bottom < this.attached.top) return unattachMario(this);
  if(this.keys.run == this.attachoff) {
    while(objectsTouch(this, this.attached))
      shiftHoriz(this, this.keys.run, true);
    return unattachMario(this);
  }
  if(this.keys.up) {
    shiftVert(this, unitsized4 * -1, true);
  } else if(this.keys.crouch) {
  
  }
  
  if(this.bottom < screen.top - unitsizet8) {
    // alert("moving to " + this.attached.locnum + "\n" + map.locs[this.attached.locnum]);
    locMovePreparations(this);
    shiftToLocation(map.locs[this.attached.locnum]);
    return unattachMario(this);
  }
}

function unattachMario(me) {
  me.movement = moveMario;//me.movementsave;
  me.attached.attached = false;
  me.attached = me.yvel = me.attachoff = me.nofall = false;
  me.xvel = me.keys.run;
}

function marioFires() {
  if(this.numballs >= 2) return;
  ++this.numballs;
  var ball = new Thing(FireBall, this.moveleft);
  placeThing(ball, this.right + unitsized4, this.top + unitsizet4);
  if(mario.moveleft) setRight(ball, mario.left - unitsized4, true);
  ball.animate(ball);
}
function emergeFire(me) {
  play("Fireball.wav");
  characters.push(me);
}

function marioStar(me) {
  me.star = true;
  me.element.className += " star";
  play("Starman.mp3", true, true);
  play("Powerup.wav", false, false);
  addEvent(
    function(me) {
      me.star = false;
      removeClass(me,"star");
      play(map.areas[map.areanum].setting + ".mp3", true, true);
    },
    700,
    me
  );
}

function killMario(me, big) {
  if(!me.alive || me.flickering || me.dying) return;
  if(!big && mario.power > 1) {
    play("Power Down.wav");
    me.power = 1;
    storeMarioStats();
    return marioGetsSmall(me);
  }
  play("Mario Dies.wav", true, false);
  pause();
  me.nocollide = me.nofall = me.nomove = nokeys = me.dead = 1;
  me.xvel = me.yvel = me.resting = 0;
  me.element.className = "character mario dead";
  --data.lives.amount;
  if(data.lives.amount <= 0) {
    alert("You have run out of lives. Maybe you're not ready for playing real games...");
    document.location.reload(1);
    document.focus();
  }
  me.element.style.zIndex = 14;
  
  setTimeout(function() {
    me.gravity = unitsize / 21;
    me.nofall = false;
    me.yvel = -1.17 * unitsize;
  }, timer * 28);
  me.dying = setTimeout(function() { setMap(); }, timer * 350);
}

/*
 * ~Persistent data system (eventually will be stored as a cookie)
 */
function Data() {
  this.mariopower = 1;
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
  this.element = document.createElement("div");
  this.name = name;
  this.element.className = "indisplay " + name;
} 

function score(me, amount, appears) {
  if(amount <= 0) return;
  data.score.amount += amount;
  if(appears) {
    var div = new Object();
    div.element = document.createElement("div");
    div.style = div.element.style;
    div.element.className = "score";
    div.element.style.fontSize = (unitsize * 3.5) + "px";
    div.element.innerText = amount;
    body.appendChild(div.element);
    div.top = me.top - me.height * unitsize;
    div.left = (me.left - me.width / 2);
    var move = setInterval(function() {
      shiftVert(div, unitsize / -4.9);
      updateDisplay(div);
    }, timer);
    addEvent(
      function(move, elem) {
        clearInterval(move);
        body.removeChild(elem);
      },
      49,
      move, div.element
    );
  }
  if(data.score > 10000) {
    gainLife();
    data.score = 0;
  }
  updateDataElement(data.score);
}

function findScore(lev) {
  if(lev < data.scorelevs.length) return data.scorelevs[lev];
  gainLife();
  return -1;
}

function gainLife() {
  ++data.lives.amount;
  play("Gain Life.wav");
  updateDataElement(data.lives);
}

function storeMarioStats() {
  data.mariopower = mario.power;
}

// To do: add in length fixer: 0000350 instead of 350
function updateDataElement(me) {
  // var nope = me.length - (me.amount + "").length, text = "";
  // for(var i=0; i<nope; ++i) text += "0";
  me.element.innerText = me.name + "\n"/* + text + ""*/ + me.amount;
}

function setDataDisplay() {
  data.display = document.createElement("div");
  elems = ["score", "coins", "world", "time", "lives"];
  for(var i in elems) {
    data.display.appendChild(data[elems[i]].element);
    updateDataElement(data[elems[i]]);
  }
  data.display.className = "display";
  body.appendChild(data.display);
}

function clearDataDisplay() {
  
}

function startDataTime() {
  addEvent(
    function(me) {
      --me.amount;
      updateDataElement(me);
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
    25,
    data.time
  );
  /*function decreaseTime() {
    if(nokeys || paused) return;
    --data.time.amount;
    updateDataElement(data.time);
    if(data.time.amount == 100) play("Hurry " + map.areas[map.areanum].setting + ".mp3", true, true);
    else if(!data.time.amount) killMario(mario, true);
  }*/
}