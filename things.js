function Thing(type, extra, more) {
  this.element = getDiv();
  this.style = this.element.style;
  if(arguments.length > 0) type(this, extra, more);
  this.alive = true;
  this.placed = 0;
  this.xvel = this.xvel || 0;
  this.yvel = this.yvel || 0;
  if(this.tolx == null) this.tolx = 0;
  if(this.toly == null) this.toly = unitsized8;
  
  this.movement = this.movement;
  this.collide = this.collide || function() {}; // to do: use false checker
  this.death = this.death || killNormal;
  this.animate = this.animate || emergeUp;
  
  if(this.width * 4 < quads.width && this.height * unitsize < quads.height)
    this.maxquads = 4; // This could be done with modular stuff
  else this.maxquads = quads.length;
  
  this.quads = new Array(this.maxquads)
  this.overlaps = [];
}

function setCharacter(me, type) {
  me.type = type.split(" ")[0]; // so 'shell smart' becomes 'shell'
  me.element.className = "character " + type;
  if(me.group == "enemy") addClass(me, "enemy");
  me.resting = me.under = me.undermid = false;
  me.alive = me.character = true;
}

function setSolid(me, name) {
  me.type = "solid";
  me.name = name;
  me.solid = me.alive = true;
  me.element.className = "solid " + name;
  me.speed = me.speed || 0; // vertical speed
  me.collide = me.collide || characterTouchedSolid;
  me.bottomBump = me.bottomBump ||  function() { /*play("Bump.wav");*/ };
  me.action = me.action || function() {};
  me.jump = me.jump || function() {};
}

function addThing(me, left, top) {
  if(!me.element) return;
  placeThing(me, left, top);
  if(me.type == "solid") solids.push(me);
  else characters.push(me);
  me.placed = true;
  if(nextupk) determineThingQuadrants(me);
  if(me.onadding) me.onadding(); // generally just for sprite cycles
  return me;
}
function placeThing(me, left, top) {
  setLeft(me, left);
  setTop(me, top);
  updateSize(me);
  updateDisplay(me);
  body.appendChild(me.element);
  return me;
}

/*
 * Characters (except Mario, who has his own .js)
 */
 
/*
 * NPCs
 */

function Toad(me) {
  me.width = 16;
  me.height = 12;
  me.collide = collideCastleNPC;
  me.group = "toad";
  setSolid(me, "npc toad");
}
function Peach(me) {
  me.width = 16;
  me.height = 13;
  me.collide = collideCastleNPC;
  me.group = "peach";
  setSolid(me, "npc peach");
}
function collideCastleNPC(me, npc) {
  if(!me.mario) return;
  npc.collide = function() {};
  me.keys.run = me.xvel = 0;
  // If the NPC has text associated with it,
  if(npc.text) {
    // Reveal (clear visibility='hidden') each text in order
    for(i=0; i<npc.text.length; ++i)
      addEvent(
        function(me) { me.element.style.visibility = ""; },
        i * 49,
        npc.text[i]
      );
  }
  if(npc.group != "peach")
    addEvent(
      endLevel,
      350,
      i
    );
}
 
/*
 * Items
 */

function Mushroom(me, type) {
  me.group = "item";
  me.width = me.height = 7;
  me.speed = .42 * unitsize;
  me.animate = emergeUp;
  me.movement = moveSimple;
  me.collide = collideFriendly;
  me.jump = mushroomJump;
  me.death = killNormal;
  
  var name = "mushroom";
  switch(type) {
    case 1: me.action = gainLife; name += " gainlife"; break;
    case -1: me.action = killMario; name += " death"; break;
    default: me.action = marioShroom; break;
  }
  setCharacter(me, name);
}

function mushroomJump(me) {
  me.yvel -= unitsize * 1.4;
  me.top -= unitsize;
  me.bottom -= unitsize;
  updateLocation(me);
}

function FireFlower(me) {
  me.group = "item";
  me.width = me.height = 8;
  me.nofall = true;
  
  me.animate = emergeUp;
  me.movement = false;
  me.collide = collideFriendly;
  me.action = marioShroom;
  me.death = killNormal;
  setCharacter(me, "fireflower");
  addSpriteCycle(me, ["one", "two", "three", "four"]);
}

function FireBall(me, moveleft) {
  me.group = "item";
  me.width = me.height = 4;
  me.speed = unitsize * 1.75;
  me.gravity = gravity * 1.56;
  me.jumpheight = unitsize * 1.56;
  me.nofire = me.nostar = true;
  me.moveleft = moveleft;
  me.animate = emergeFire;
  me.movement = moveJumping;
  me.collide = fireEnemy;
  me.death = fireExplodes;
  setCharacter(me, "fireball");
}
function fireEnemy(enemy, me) {
  if(!me.alive || me.emerging || enemy.nofire || enemy.height <= 0) return;
  playLocal("Bump.wav", me.right);
  if(enemy.type != "solid") {
    enemy.death(enemy, 2);
    scoreEnemyFire(enemy);
  }
  me.death(me);
}
function fireExplodes(me) {
  var fire = new Thing(Firework);
  addThing(fire, me.left - fire.width / 2, me.top - fire.height / 2);
  fire.animate();
  killNormal(me);
}

function Star(me) { // GOLDEEN GOLDEEN
  me.group = "item";
  me.width = me.height = 7;
  me.speed = unitsize * .56;
  me.jumpheight = unitsize * 1.17;
  me.gravity = gravity / 2.8;
  me.animate = emergeUp;
  me.movement = moveJumping;
  me.collide = collideFriendly;
  me.action = marioStar;
  me.death = killNormal;
  setCharacter(me, "star item"); // Item class so mario's star isn't confused with this
  addSpriteCycle(me, ["one", "two", "three", "four"], 0, 7);
}

function Shell(me, smart) {
  me.width = 7; me.height = 6;
  me.group = "item";
  me.speed = unitsizet2;
  me.moveleft = me.xvel = me.move = me.hitcount = me.peeking = me.counting = me.landing = 0;
  me.smart = smart;
  me.movement = moveShell;
  me.collide = hitShell;
  me.death = killFlip;
  me.spawntype = Koopa;
  var name = "shell"; if(smart) name += " smart";
  setCharacter(me, name);
}
function hitShell(one, two) {
  // Assuming two is shell
  if(one.type == "shell" && two.type != one.type) return hitShell(two, one);
  
  switch(one.type) {
    // Hitting a wall
    case "solid": 
      if(two.right < one.right) {
        playLocal("Bump.wav", one.left);
        setRight(two, one.left);
        two.xvel = -two.speed;
        two.moveleft = true;
      } else {
        playLocal("Bump.wav", one.right);
        setLeft(two, one.right);
        two.xvel = two.speed;
        two.moveleft = false;
      }
    break;
    
    case "mario":
      var shelltoleft = objectToLeft(two, one);
      var mariojump = one.yvel > 0 && one.bottom <= two.top + unitsizet2;
      
      if(one.star) return two.death(two, 2);
      
      // If the shell is already being landed on by Mario:
      if(two.landing) {
        // If the recorded landing direction hasn't changed:
        if(two.shelltoleft == shelltoleft) {
          // Increase the landing count, and don't do anything.
          ++two.landing;
          addEvent(function(two) { --two.landing; }, 2, two);
          return;
        } else {
          // Otherwise, the shell has reversed direction during land. Mario should die.
          // This prevents accidentally scoring Mario's hit
          mario.death(mario);
          return;
        }
      }
      
      // Mario is kicking the shell (either hitting a still shell or jumping onto a shell)
      if(two.xvel == 0 || mariojump) {
        // Mario has has hit the shell in a dominant matter. You go, Mario!
        two.counting = 0;
        // The shell is peeking
        if(two.peeking) {
          two.height -= unitsized8;
          updateSize(two);
          two.peeking = false;
          removeClass(two, "peeking");
          if(two.resting) score(one, 1000, true);
        }
        // The shell is just being kicked normally
        else if(one.resting && two.resting) score(two, 400, true);
        // If two is in the air, more points happen
        if(!two.resting) score(one, 8000, true);
        
        // If the shell's xvel is 0 (standing still)
        if(two.xvel == 0) {
          if(shelltoleft) {
            two.moveleft = true;
            two.xvel = -two.speed;
          } else {
            two.moveleft = false;
            two.xvel = two.speed;
          }
        }
        // Otherwise set the xvel to 0
        else two.xvel = 0;
        
        // Mario is landing on the shell (movements, xvels already set)
        if(mariojump) {
          play("Kick.wav");
          // The shell is moving
          if(!two.xvel) {
            jumpEnemy(one, two);
            one.yvel *= 2;
            setBottom(one, two.top - unitsize, true);
          }
          // The shell isn't moving
          else {
            // shelltoleft ? setRight(two, one.left) : setLeft(two, one.right);
            score(two, 400, true);
          }
          ++two.landing;
          two.shelltoleft = shelltoleft;
          addEvent(function(two) { --two.landing; }, 2, two);
        }
      }
      else {
        // Since the shell is moving and Mario isn't, if the xvel is towards Mario, that's a death
        if((shelltoleft && two.xvel < 0) || (!shelltoleft && two.xvel > 0))
          one.death(one);
      }
    break;
    
    // Shell hitting another shell
    case "shell":
      // If one is moving...
      if(one.xvel != 0) {
        // and two is also moving, knock off each other
        if(two.xvel != 0) {
          var temp = one.xvel;
          shiftHoriz(one, one.xvel = two.xvel);
          shiftHoriz(two, two.xvel = temp);
        }
        // otherwise one kills two
        else {
          score(two, 500);
          two.death(two);
        }
      }
      // otherwise two kills one
      else if(two.xvel != 0) {
        score(one, 500);
        one.death(one);
      }
    break;
    
    default:
      switch(one.group) {
        case "enemy":
          if(two.xvel) {
            // If the shell is moving, kill the enemy
            if(one.type.split(" ")[0] == "koopa") {
              // If the enemy is a koopa, make it a shell
              // To do: automate this for things with shells (koopas, beetles)
              var spawn = new Thing(Shell, one.smart);
              addThing(spawn, one.left, one.bottom - spawn.height * unitsize);
              killFlip(spawn);
              killNormal(one);
            } // Otherwise just kill it normally
            else killFlip(one);
            
            play("Kick.wav");
            score(one, findScore(two.hitcount), true);
            ++two.hitcount;
          } // Otherwise the enemy just turns around
          else one.moveleft = objectToLeft(one, two);
        break;
        
        case "item":
          if(one.type == "shell") {
            if(two.xvel) killFlip(one);
            if(one.xvel) killFlip(two);
          }
          else return;
        break;
      }
    break;
  }
}
function moveShell(me) {
  if(me.xvel != 0) return;
  
  if(++me.counting == 350) {
    addClass(me, "peeking");
    me.peeking = true;
    me.height += unitsized8;
    updateSize(me);
  } else if(me.counting == 490) {
    var spawn = new Thing(me.spawntype, me.smart);
    addThing(spawn, me.left, me.bottom - spawn.height * unitsize);
    killNormal(me);
  }
}

// Assuming one is Mario, two is item
function collideFriendly(one, two) {
  if(one.type != "mario") return;
  two.action(one);
  two.death(two);
}

/*
 * Enemies
 */
function jumpEnemy(me, enemy) {
  if(me.keys.up) me.yvel = unitsize * -1.4;
  else me.yvel = unitsize * -.7;
  me.xvel *= .91;
  play("Kick.wav");
  if(enemy.group != "item" || enemy.type == "shell")
    score(enemy, findScore(me.jumpcount++ + me.jumpers), true);
  ++me.jumpers;
  addEvent(function(me) { --me.jumpers; }, 1, me);
}
function Goomba(me) {
  me.width = me.height = 8;
  me.speed = unitsize * .21;
  me.toly = unitsize;
  me.moveleft = me.noflip = true;
  me.smart = false;
  me.group = "enemy";
  me.movement = moveSimple;
  me.collide = collideEnemy;
  me.death = killGoomba;
  setCharacter(me, "goomba flipper");
  addSpriteCycleSynched(me, ["", "flipped"]);
}
function lulz() {
  var adding = addEventInterval(function() {
    var lol = new Thing(Goomba);
    lol.yvel = -3.5 * Math.random() * unitsize;
    lol.xvel = lol.speed = Math.random() * unitsizet2;
    addThing(lol, (32 * Math.random() + 128) * unitsize, (88 * Math.random()) * unitsize);
  }, 7, -1);
}
// Big: true if it should skip squash (fire, shell, etc)
function killGoomba(me, big) {
  if(!me.alive) return;
  if(!big) {
    var squash = new Thing(DeadGoomba);
    solids.push(squash);
    placeThing(squash, me.left, me.bottom - squash.height * unitsize);
    addEvent(
      function(squash) { ha = squash; squash.death(squash); },
      21,
      squash
    );
    killNormal(me);
  }
  else killFlip(me);
}
function DeadGoomba(me) {
  me.width = 8;
  me.height = 4;
  me.collide = false;
  me.nocollide = true;
  me.movement = false;
  me.death = killNormal;
  setSolid(me, "deadGoomba");
}

function Koopa(me, smart, fly) {
  me.width = 8;
  me.height = 12;
  me.speed = me.xvel = unitsize * .21;
  me.moveleft = true;
  me.group = "enemy";
  me.smart = smart; // will it run off the edge
  var name = "koopa"; if(me.smart) name+= " smart";
  if(fly) {
    if(fly == true) {
      me.movement = moveJumping;
      me.jumpheight = unitsize * 1.17;
      me.gravity = gravity / 2.8;
    }
    else {
      me.movement = moveFloating;
      me.ytop = me.begin = fly[0] * unitsize;
      me.ybot = me.end = fly[1] * unitsize;
      me.nofall = me.fly = true;
      me.changing = me.lol = me.xvel = 0;
      me.yvel = me.maxvel = unitsized4;
    }
    name += " flying";
    me.winged = true;
  }
  else if(me.smart) me.movement = moveSmart;
  else me.movement = moveSimple;
  me.collide = collideEnemy;
  me.death = killKoopa; 
  setCharacter(me, name);
  addSpriteCycleSynched(me, ["one", "two"]);
  me.toly = unitsizet8;
}
// Big: true if it should skip shell (fire, shell, etc)
function killKoopa(me, big) {
  if(!me.alive) return;
  var spawn;
  if((big && big != 2) || me.winged) spawn = new Thing(Koopa, me.smart);
  else spawn = new Thing(Shell, me.smart);
  // Puts it on stack, so it executes immediately after upkeep
  addEvent(
    function(spawn, me) { 
      addThing(spawn, me.left, me.bottom - spawn.height * unitsize);
      spawn.moveleft = me.moveleft;
    },
    0,
    spawn, me
  );
  killNormal(me);
  if(big == 2) killFlip(spawn);
  else return spawn;
}

function Pirhana(me, evil) {
  me.width = 8;
  me.height = me.counter = me.state = 0;
  me.maxheight = 12;
  me.countermax = me.maxheight * 5;
  me.toly = unitsizet8;
  me.nofall = me.deadly = me.nocollidesolid = me.nocollidechar = me.nocollide = true;
  me.group = "enemy";
  me.collide = collideEnemy;
  me.death = killNormal;
  me.movement = movePirhana;
  setCharacter(me, "pirhana");
  addSpriteCycle(me, ["one", "two"]);
}
function movePirhana(me) {
  // State: 0 = resting, 1 = raising, 2 = resting, 3 = lowering
  // While resting, if mario is nearby, don't change
  var marmid = mario.left + mario.width * unitsized2;
  if(me.state == 0 && 
  (marmid > me.left - unitsizet8 && mario.left < me.right + unitsizet8))
   return ++me.counter;
  
  if(me.counter >= me.countermax) {
    me.state = ++me.state % 4;
    me.counter = 1;
    me.nocollide = me.state == 0;
  }
  // To do: rewrite me...
  // If state is used differently, remember to modify:
  //  * activateWarpWorld
  //  * exitPipeVert
  if(me.state % 2 == 1) {
    var dy = -.2; if(me.state == 3) dy = .2;
    me.height -= dy;
    me.top += dy * unitsize;
    if(me.height < .007) me.height = 0;
    // updateDisplay(me);
    updateSize(me);
  }
  // Increment counter if you're not resting while mario is nearby
  ++me.counter;
}

// Really just checks toly for pirhanas.
function marioAboveEnemy(mario, enemy) {
  if(mario.bottom < enemy.top + enemy.toly) return true;
  return false;
}

// Assuming one should generally be Mario/thing, two is enemy
function collideEnemy(one, two) {
  // Check for life
  if(!characterIsAlive(one) || !characterIsAlive(two)) return;
  
  // Check for nocollidechar
  if((one.nocollidechar && !two.mario) || (two.nocollidechar && !one.mario)) return;
  
  // Items
  if(one.group == "item") {
    if(one.type == "shell" || one.type == "fireball") return one.collide(two, one);
    if(two.height < unitsized16 || two.width < unitsized16) return;
    return;
  }
  
  // Mario on top of enemy
  if(!map.underwater && one.mario && ((one.star && !two.nostar) || (!two.deadly && objectOnTop(one, two)))) {
    // Enforces toly
    if(marioAboveEnemy(one, two)) return;
    // Mario is on top of them (or star):
    if(one.mario && !one.star) addEvent(function(one, two) { jumpEnemy(one, two); }, 0, one, two);
    else two.nocollide = true;
    // Kill the enemy
    //// If killed is returned a Thing, then it's a shell
    //// Make sure Mario isn't immediately hitting the shell
    var killed = two.death(two, one.star * 2);
    if(one.star) scoreEnemyStar(two);
    else {
      scoreEnemyStomp(two);
      /*addEvent(function(one, two) { */setBottom(one, min(one.bottom, two.top + unitsize));/* }, 0, one, two);*/
    }
    // Make mario have the hopping thing
    removeClasses(one, "running jumping")
    addClass(one, "hopping");
    one.hopping = true;
  }
  
  // Mario getting hit by an enemy
  else if(one.mario) {
    if(!marioAboveEnemy(one, two)) one.death(one);
  }
  
  // Two regular characters colliding
  else two.moveleft = !(one.moveleft = objectToLeft(one, two));
}

function Podoboo(me, jumpheight) {
  me.width = 7;
  me.height = 8;
  me.deadly = me.nofall = me.nocollidesolid = me.nofire = true;
  me.gravity = map.gravity / 2.1;
  me.jumpheight = (jumpheight || 64) * unitsize;
  me.speed = -map.maxyvel;
  me.movement = movePodobooInit;
  me.collide = collideEnemy;
  me.betweentime = 70;
  
  setCharacter(me, "podoboo flip-vert");
}
function movePodobooInit(me) {
  if(!characterIsAlive(me)) return;
  me.heightnorm = me.top;
  me.heightfall = me.top - me.jumpheight;
  addEvent(podobooJump, me.betweentime, me);
  me.movement = false;
}
function podobooJump(me) {
  if(!characterIsAlive(me)) return;
  removeClass(me, "flip-vert");
  me.yvel = me.speed + me.gravity;
  me.movement = movePodobooUp;
}
function movePodobooUp(me) {
  shiftVert(me, me.speed, true);
  if(me.top - screen.top > me.heightfall) return;
  me.nofall = false;
  me.movement = movePodobooSwitch;
}
function movePodobooSwitch(me) {
  if(me.yvel <= 0) return;
  addClass(me, "flip-vert");
  me.movement = movePodobooDown;
}
function movePodobooDown(me) {
  if(me.top < me.heightnorm) return;
  setTop(me, me.heightnorm, true);
  me.movement = false;
  me.nofall = true;
  me.heightfall = me.top - me.jumpheight;
  addEvent(podobooJump, me.betweentime, me);
}

function HammerBro(me) {
  me.width = 8;
  me.height = 12;
  me.group = "enemy";
  me.collide = collideEnemy;
  me.statex = me.counter = me.statey = me.counterx = me.countery = me.level = me.throwcount = 0;
  me.death = killFlip;
  me.movement = moveHammerBro;
  setCharacter(me, "hammerbro");
  me.gravity = gravity / 2;
  addSpriteCycle(me, ["one", "two"]);
  addEvent(throwHammer, 35, me, 7);
  addEventInterval(jumpHammerBro, 140, Infinity, me);
}
function moveHammerBro(me) {
  // Slide side to side
  me.xvel = Math.sin(Math.PI * (me.counter += .007)) / 2.1;
  
  // Make him turn to look at mario if needed
  lookTowardMario(me);
  
  // If falling, don't collide with solids
  me.nocollidesolid = me.yvel < 0 || me.falling;
}
function throwHammer(me, count) {
  if(!characterIsAlive(me) || me.right < -unitsizet32) return;
  if(count != 3) {
    switchClass(me, "thrown", "throwing");
  }
  addEvent(function(me) {
    if(count != 3) {
      if(!characterIsAlive(me)) return;
      // Throw the hammer...
      switchClass(me, "throwing", "thrown");
      // var hammer = new Thing(Hammer, me.lookleft);
      addThing(new Thing(Hammer, me.lookleft), me.left - unitsizet2, me.top - unitsizet2);
      // ...and go again
    }
    if(count > 0) addEvent(throwHammer, 7, me, --count);
    else {
      addEvent(throwHammer, 70, me, 7);
      removeClass(me, "thrown");
    }
  }, 14, me);
}
function jumpHammerBro(me) {
  if(!characterIsAlive(me)) return true; // finish
  if(!me.resting) return; // just skip
  // If it's ok, jump down
  if(map.floor - (me.bottom / unitsize) >= jumplev1 - 2 && me.resting.name != "floor" && Math.floor(Math.random() * 2)) {
    me.yvel = unitsize * -.7;
    me.falling = true;
    addEvent(function(me) { me.falling = false; }, 42, me);
  }
  // Otherwise, jump up
  else me.yvel = unitsize * -2.1;
  me.resting = false;
}

function Hammer(me, left) {
  me.width = me.height = 8;
  me.nocollidesolid = me.nocollidechar = me.deadly = me.nofire = true;
  me.collide = collideEnemy;
  me.yvel = -unitsize * 1.4;
  me.xvel = unitsize / 1.4;
  if(left) me.xvel *= -1;
  me.gravity = gravity / 2.1;
  setCharacter(me, "hammer");
}

function Cannon(me, height, nofire) {
  me.width = 8;
  me.height = (height || 1) * 8;
  if(!nofire) me.movement = moveCannonInit;
  me.timer = 117;
  setSolid(me, "cannon");
  me.element.style.zIndex = 8;
}
function moveCannonInit(me) {
  addEventInterval(
    function(me) {
      if(mario.right > me.left - unitsizet8 && mario.left < me.right + unitsizet8)
        return; // don't fire if Mario is too close
      var spawn = new Thing(BulletBill);
      if(objectToLeft(mario, me)) {
        addThing(spawn, me.left, me.top);
        spawn.direction = spawn.moveleft = true;
        spawn.xvel *= -1;
        addClass(spawn, "flipped");
      }
      else addThing(spawn, me.left + me.width, me.top);
      playLocal("Bump.wav", me.right);
    }, 270, -1, me);
  me.movement = false;
}
function BulletBill(me) {
  me.width = 8; me.height = 7;
  me.group = "enemy";
  me.nofall = me.nofire = me.nocollidesolid = me.nocollidechar = true;
  me.speed = me.xvel = unitsized2;
  me.movement = moveSimple;
  me.collide = collideEnemy;
  me.death = killFlip;
  setCharacter(me, "bulletbill");
}


function Bowser(me, hard) {
  me.width = me.height = 16;
  me.speed = .28 * unitsize;
  me.gravity = gravity / 2.8;
  me.deadly = me.dx = me.lookleft = me.nokillend = me.skipoverlaps = true;
  me.moveleft = me.smart = me.movecount = me.jumpcount = me.firecount = me.deathcount = 0;
  me.counter = -.7;
  me.group = "enemy";
  me.movement = moveBowserInit;
  me.collide = collideEnemy;
  me.death = killBowser;
  setCharacter(me, "bowser");
  addSpriteCycle(me, ["one", "two"]);
  if(hard) addEvent(throwHammer, 35, me, 7);
}
function moveBowserInit(me) {
  addEventInterval(bowserJumps, 117, Infinity, me);
  addEventInterval(bowserFires, 280, Infinity, me);
  addEventInterval(bowserFires, 350, Infinity, me);
  addEventInterval(bowserFires, 490, Infinity, me);
  me.movement = moveBowser;
}
function moveBowser(me) {
  if(!characterIsAlive(mario)) return;
  lookTowardMario(me);
  if(me.lookleft) me.xvel = Math.sin(Math.PI * (me.counter += .007)) / 1.4;
  else me.xvel = min(me.xvel + .07, .84);
}
function bowserJumps(me) {
  if(!characterIsAlive(me)) return true;
  if(!me.resting || !me.lookleft) return;
  me.yvel = unitsize * -1.4;
  me.resting = false;
  // If there is a platform, don't bump into it
  me.nocollidesolid = true;
  addEventInterval(function(me) {
    if(me.yvel > unitsize) {
      me.nocollidesolid = false;
      return true;
    }
  }, 3, Infinity, me);
}
function bowserFires(me) {
  if(!characterIsAlive(me) || !characterIsAlive(mario)) return true;
  if(!me.lookleft) return;
  // Close the mouth
  addClass(me, "firing");
  playLocal("Bowser Fires.wav", me.left);
  // After a little bit, open and fire
  addEvent(function(me) {
    var top = me.top + unitsizet4,
        fire = new Thing(BowserFire, roundDigit(mario.bottom, unitsizet8));
    removeClass(me, "firing");
    addThing(fire, me.left - unitsizet8, top);
    play("Bowser Fires.wav");
  }, 14, me);
}
// This is for when Fiery Mario kills bowser - the normal one is listed under the castle things
function killBowser(me, big) {
  if(big) {
    me.nofall = false;
    return killFlip(me);
  }
  
  if(++me.deathcount == 5) {
    me.yvel = me.speed = me.movement = 0;
    killFlip(me, 350);
    score(me, 5000);
  }
}
// Each fireball leaves his mouth, and while moving horizontally, shifts its yloc
function BowserFire(me, ylev) {
  me.width = 12;
  me.height = 4;
  me.xvel = unitsize * -.63;
  me.deadly = me.nofall = me.nocollidesolid = me.nofire = true;
  me.collide = collideEnemy;
  if(ylev) {
    me.ylev = ylev;
    me.movement = moveFlying;
  }
  setCharacter(me, "bowserfire");
  addSpriteCycle(me, ["", "flip-vert"]);
}
function moveFlying(me) {
  if(round(me.bottom) == round(me.ylev)) {
    me.movement = false;
    return;
  }
  shiftVert(me, min(max(0, me.ylev - me.bottom), unitsize));
}

function WaterBlock(me, width) {
  me.height = 16;
  me.width = width;
  setSolid(me, "water-block");
}

function Blooper(me) {
  me.width = 8;
  me.height = 12;
  me.nocollidesolid = me.nofall = me.moveleft = 1;
  me.squeeze = me.counter = 0;
  me.speed = unitsized2;
  me.xvel = me.speedinv = -unitsized4;
  me.movement = moveBlooper;
  me.collide = collideEnemy;
  me.death = killFlip;
  setCharacter(me, "blooper");
}

// Normally goes up at increasing rate
// Every X seconds, squeezes to go down
//// Minimum Y seconds, continues if Mario is below until bottom is 8 above floor
function moveBlooper(me) {
  switch(me.counter) {
    case 56: me.squeeze = true; ++me.counter; break;
    case 63: squeezeBlooper(me); break;
    default: ++me.counter; break;
  }
  if(me.squeeze) me.yvel = max(me.yvel + .021, .7); // going down
  else me.yvel = min(me.yvel - .035, -.7); // going up
  shiftVert(me, me.yvel, true);
  
  if(!me.squeeze) {
    if(mario.left > me.right + unitsizet8) {
      // Go to the right
      me.xvel = min(me.speed, me.xvel + unitsized32);
    }
    else if(mario.right < me.left - unitsizet8) {
      // Go to the left
      me.xvel = max(me.speedinv, me.xvel - unitsized32);
    }
  }
}
function squeezeBlooper(me) {
  addClass(me, "squeeze");
  // if(!me.squeeze) me.yvel = 0;
  me.squeeze = true;
  me.xvel /= 1.17;
  me.height = 10;
  // TO DO: how to find the floor level for the map!?
  // 364 is an arbitrary number: 91 * unitsize (4)
  if(me.top > mario.bottom || me.bottom > 364) unsqueezeBlooper(me);
}
function unsqueezeBlooper(me) {
  me.squeeze = false;
  removeClass(me, "squeeze");
  me.counter = 0;
  me.height = 12;
  // me.yvel /= 3;
}

// Red cheepcheeps are faster
function CheepCheep(me, red, jumping) {
  me.width = me.height = 8;
  me.group = "enemy";
  var name = "cheepcheep ";
  
  me.red = red;
  if(red) {
    name += " red";
    me.xvel = unitsize / -4;
    me.yvel = unitsize / -24;
  } else {
    me.xvel = unitsize / -6;
    me.yvel = unitsize / -32;
  }
  
  if(jumping) {
    name += " jumping";
    me.jumping = true;
    me.movement = moveCheepJumping;
  } 
  else me.movement = moveCheepInit;
  
  me.nofall = me.nocollidesolid = me.nocollidechar = true;
  me.death = killFlip;
  me.collide = collideEnemy;
  setCharacter(me, name);
  addSpriteCycle(me, ["one", "two"]);
}
function moveCheepInit(me) {
  if(me.top < mario.top) me.yvel *= -1;
  moveCheep(me);
  me.movement = moveCheep;
}
function moveCheep(me) {
  shiftVert(me, me.yvel);
}
function moveCheepJumping(me) {
  shiftVert(me, me.yvel += unitsize / 14);
}
function startCheepSpawn() {
  return map.zone_cheeps = addEventInterval(
    function() {
      if(!map.zone_cheeps) return true;
      var spawn = new Thing(CheepCheep, true, true);
      addThing(spawn, Math.random() * mario.left * mario.maxspeed / unitsized2, screen.height * unitsize);
      spawn.xvel = Math.random() * mario.maxspeed;
      spawn.yvel = unitsize * -2.33;
      addClass(spawn, "flipped");
      spawn.movement = function(me) {
        if(me.top < ceilmax) me.movement = moveCheepJumping; 
        else shiftVert(me, me.yvel);
      };
    }, 21, -1
  );
}

function Bubble(me) {
  me.width = me.height = 2;
  me.nofall = me.nocollide = true;
  me.movement = function(me) {
    me.top < unitsizet16 ? killNormal(me) : shiftVert(me, me.yvel);
  };
  me.yvel = -unitsized4;
  setCharacter(me, "bubble");
}

// Typically at height ??
function Lakitu(me, norepeat) {
  me.width = 8;
  me.height = 12;
  me.nofall = me.noshiftx = me.nocollidesolid = true;
  me.mariodiff = me.counter = 0;
  me.dir = -1;
  me.norepeat = norepeat;
  me.mariodiff = unitsizet16;
  me.group = "enemy";
  me.collide = collideEnemy;
  me.movement = moveLakituInit;
  me.death = killLakitu;
  setCharacter(me, "lakitu");
  map.has_lakitu = me;
}
// The lakitu's position starts to the right of mario ...
function moveLakituInit(me) {
  if(map.has_lakitu && me.norepeat) return killNormal(me);
  addEventInterval(function(me) {
    if(me.alive) throwSpiny(me);
    else return true;
  }, 140, -1, me);
  me.movement = moveLakituInit2;
  moveLakituInit2(me);
  map.has_lakitu = me;
}
function moveLakituInit2(me) {
  if(me.right < mario.left) {
    moveLakitu(me);
    me.movement = moveLakitu;
    map.lakitu = me;
    return true;
  }
  shiftHoriz(me, unitsize * -1);
}
// Then, once it's close enough, is always relative to mario.
// This fluctuates between +/-32 (* unitsize)
function moveLakitu(me) {
  // If mario is moving quickly to the right, move in front of him and stay there
  if(mario.xvel > unitsized8 && mario.left > screen.width * unitsized2) {
    if(me.left < mario.right + unitsizet16) {
      // To the 'left' of mario
      slideToXLoc(me, mario.right + unitsizet32 + mario.xvel, mario.maxspeed * 1.4);
      me.counter = 0;
    }
  }
  // Otherwise, creepily orbit around him
  else {
    // me.xvel = 0;
    me.counter += .007;
    slideToXLoc(me, mario.left + mario.xvel + Math.sin(Math.PI * me.counter) * 117, mario.maxspeed * .7);
  }
  // console.log("moveLakitu after: " + (me.right - me.left) + "\n");
}
function throwSpiny(me) {
  if(!characterIsAlive(me)) return false;
  addClass(me, "hiding");
  addEvent(function(me) {
    if(me.dead) return false;
    var spawn = new Thing(SpinyEgg);
    addThing(spawn, me.left, me.top);
    spawn.yvel = unitsize * -2.1;
    removeClass(me, "hiding");
  }, 21, me);
}
function killLakitu(me) {
  delete me.noscroll;
  killFlip(me);
}

function Spiny(me) {
  me.width = me.height = 8;
  me.group = "enemy";
  me.speed = unitsize * .21;
  me.deadly = me.moveleft = true;
  me.smart = false;
  me.death = killFlip;
  me.collide = collideEnemy;
  me.movement = moveSimple;
  setCharacter(me, "spiny");
  addSpriteCycle(me, ["one", "two"]);
}
function SpinyEgg(me) {
  me.height = 8; me.width = 7;
  me.group = "enemy";
  me.deadly = true;
  me.movement = moveSpinyEgg;
  me.spawntype = Spiny;
  me.spawner = me.death = createSpiny;
  me.collide = collideEnemy;
  setCharacter(me, "spinyegg");
  addSpriteCycle(me, ["one", "two"]);
}
function moveSpinyEgg(me) {
  if(me.resting) createSpiny(me);
}
function createSpiny(me) {
  var spawn = new Thing(Spiny);
  addThing(spawn, me.left, me.top);
  spawn.moveleft = objectToLeft(mario, spawn);
  killNormal(me);
}

function Beetle(me) {
  me.width = me.height = 8.5;
  me.group = "enemy";
  me.speed = me.xvel = unitsize * .21;
  me.moveleft = me.nofire = true;
  me.smart = false;
  me.collide = collideEnemy;
  me.movement = moveSmart;
  me.death = killBeetle;
  setCharacter(me, "beetle");
  // me.toly = unitsizet8;
  addSpriteCycleSynched(me, ["one", "two"]);
}
// Big: true if it should skip shell (fire, shell, etc)
function killBeetle(me, big) {
  if(!me.alive) return;
  var spawn;
  if(big && big != 2) spawn = new Thing(Koopa, me.smart);
  else spawn = new Thing(BeetleShell, me.smart);
  // Puts it on stack, so it executes immediately after upkeep
  addEvent(
    function(spawn, me) {
      addThing(spawn, me.left, me.bottom - spawn.height * unitsize);
      spawn.moveleft = me.moveleft;
    },
    0,
    spawn, me
  );
  killNormal(me);
  if(big == 2) killFlip(spawn);
  else return spawn;
}
function BeetleShell(me) {
  me.width = me.height = 8;
  me.nofire = true;
  me.group = "item";
  me.speed = unitsizet2;
  me.moveleft = me.xvel = me.move = me.hitcount = me.peeking = me.counting = me.landing = 0;
  me.movement = moveShell;
  me.collide = hitShell;
  me.death = killFlip;
  me.spawntype = Beetle;
  setCharacter(me, "shell beetle");
}

function Coin(me) {
  me.group = "coin";
  me.width = 5;
  me.height = 7;
  me.nofall = me.coin = me.nofire = me.nocollidechar = me.nokillend = me.onlyupsolids = me.skipoverlaps = true;
  me.toly = me.tolx = 0;
  me.collide = hitCoin;
  me.animate = coinEmerge;
  me.death = killNormal;
  setCharacter(me, "coin still");
  addSpriteCycleSynched(me, ["one", "two", "three", "two", "one"]);
}
function hitCoin(me, coin) {
  if(!me.mario) return;
  play("Coin.wav");
  score(me, 200, false);
  gainCoin();
  killNormal(coin);
}
function gainCoin() {
  if(++data.coins.amount >= 100) {
    data.coins.amount = 0;
    gainLife();
  }
  updateDataElement(data.coins);
}
function coinEmerge(me) {
  play("Coin.wav");
  removeClass(me, "still");
  score(me, 200, false);
  gainCoin();
  me.nocollide = me.alive = me.nofall = me.emerging = true;
  determineThingQuadrants(me);
  
  var elem = me.element;
  if(me.blockparent) me.movement = coinEmergeMoveParent;
  else me.movement = coinEmergeMove;
  me.yvel = -unitsize;
  addEvent(function(me) { me.yvel = unitsize; }, 25, me);
  addEvent(function(me) { me.death(me); }, 55, me);
  addSpriteCycle(me, ["anim1", "anim2", "anim3", "anim4", "anim3", "anim2"], 0, 5);
}

function coinEmergeMove(me) {
  shiftVert(me, me.yvel, true);
}
function coinEmergeMoveParent(me) {
  if(me.bottom >= me.blockparent.bottom) killNormal(me);
  else shiftVert(me, me.yvel, true);
}

/*
 * Solids
 */


function Floor(me, length, height) {
  me.width = (length || 1) * 8;
  me.height = (height * 8) || unitsizet32;
  setSolid(me, "floor");
  me.element.style.backgroundSize = (unitsizet8) + "px";
}

// To do: stop using clouds, and use GenericStone instead
function Clouds(me, length) {
  me.width = length * 8;
  me.height = 8;
  setSolid(me, "clouds");
}

function Brick(me, content) {
  me.width = me.height = 8;
  me.used = false;
  me.bottomBump = brickBump;
  if(!content) me.contents = false;
  else {
    if(content instanceof Array) {
      me.contents = content;
      while(me.contents.length < 3) me.contents.push(false);
    } else me.contents = [content, false, false];
  }
  me.death = killNormal;
  setSolid(me, "brick");
  me.tolx = 1;
}
function brickBump(me, character) {
  if(me.up || character.type != "mario") return;
  play("Bump.wav");
  if(me.used) return;
  me.up = character;
  if(character.power > 1 && !me.contents)
    return addEvent(brickBreak, 0, me, character); // wait until after collision testing to delete (for coins)
  
  blockBumpMovement(me);
  if(me.contents) {
    if(mario.power > 1 && me.contents[0] == Mushroom && !me.contents[1]) me.contents[0] = FireFlower;
    addEvent(
      function(me) {
        var out = new Thing(me.contents[0], me.contents[1], me.contents[2]);
        addThing(out, me.left, me.top);
        setMidXObj(out, me, true);
        out.blockparent = me;
        out.animate(out, me);
        if(me.contents[0] == Coin) {
          if(me.lastcoin) makeUsedBlock(me);
          addEvent(
            function(me) {
              me.lastcoin = true;
            },
            245,
            me
          );
        } else makeUsedBlock(me);
      },
      7,
      me
    );
  }
}
function makeUsedBlock(me) {
  me.used = true;
  addClass(me, "used");
}
function brickBreak(me, character) {
  play("Break Block.wav");
  score(me, 50);
  me.up = character;
  addEvent(
    function(me) {
      me.death(me);
      var shards = new Array(4);
      for(var i=0; i<4; ++i) {
        shard = shards[i] = new Thing(BrickShard);
        characters.push(shard);
        placeThing(shard, me.left + (i < 2) * me.width * unitsize - unitsizet2,
          me.top + (i % 2) * me.height * unitsize - unitsizet2);
        shard.xvel = unitsized2 - unitsize * (i > 1);
        shard.yvel = unitsize * -1.4 + i % 2;
        addEvent(
          function(shard) { killNormal(shard); }, 350, shard
        );
      }
    },
    1,
    me
  );
}
// Listed in characters because of gravity. Has nocollide, so it's ok
function BrickShard(me) {
  me.width = me.height = 4;
  me.nocollide = true;
  me.movement = false;
  me.death = killNormal;
  setSolid(me, "brickshard flipper");
  // To do: why does non-manual not work?
  addSpriteCycleManual(me, ["nope", "flipped"]);
}

function attachEmerge(me, solid) {
  me.animate = setInterval(function() {
    setBottom(me, solid.top, true);
    if(!solid.up) {
      clearInterval(me.animate);
      me.animate = false;
    }
  }, timer);
}

function Block(me, content, hidden) {
  me.width = me.height = 8;
  me.used = false;
  me.bottomBump = blockBump;
  if(!content) me.contents = [Coin]; else {
    if(content instanceof Array) {
      me.contents = content;
      while(me.contents.length < 3) me.contents.push(false);
    } else me.contents = [content, false, false];
  }
  me.death = killNormal;
  setSolid(me, "block");
  if(!hidden) me.hidden = false;
  else {
    me.hidden = true;
    me.element.style.opacity = 0;
  }
  me.tolx = 1;
  // addSpriteCycle(me, ["one", "two", "three", "two", "one"]);
  addSpriteCycleSynched(me, ["one", "two", "three", "two", "one"]);
}
function blockBump(me, character) {
  if(character.type != "mario") return;
  if(me.used) {
    play("Bump.wav");
    return;
  }
  me.used = me.element.style.opacity = 1;
  me.hidden = false;
  me.up = character;
  blockBumpMovement(me);
  addClass(me, "used");
  if(mario.power > 1 && me.contents[0] == Mushroom && !me.contents[1]) me.contents[0] = FireFlower;
  addEvent(
    function(me) {
      // out is a coin by default, but can also be other things - [1] and [2] are arguments
      var out = new Thing(me.contents[0], me.contents[1], me.contents[2]);
      addThing(out, me.left, me.top);
      setMidXObj(out, me, true);
      out.blockparent = me;
      out.animate(out, me);
    },
    7,
    me
  );
}

function Pipe(me, height, transport) {
  me.width = 16;
  me.height = height;
  if(transport !== false) {
    me.actionTop = intoPipeVert;
    me.transport = transport;
  }
  setSolid(me, "pipe");
}
function PipeSide(me, transport) {
  me.width = 20;
  me.height = 16;
  if(transport) {
    me.actionLeft = intoPipeHoriz;
    me.transport = transport;
  }
  setSolid(me, "pipe side");
}
function PipeVertical(me, height) {
  me.width = 16;
  me.height = height;
  setSolid(me, "pipe vertical");
}

// Locnum is -1 if this is a cutscene vine
function Vine(me, locnum) {
  me.width = 8;
  me.locnum = locnum;
  if(locnum == -1) me.height = screen.height;
  else me.height = 0;
  me.counter = 0;
  me.tolx = unitsizet4;
  me.animate = attachEmerge;
  me.movement = vineEmerge;
  me.collide = touchVine;
  setSolid(me, "vine");
}

function vineEmerge(me) {
  play("Vine Emerging.wav");
  me.movement = vineMovement;
}

function vineMovement(me) {
  if(++me.counter >= 700) return me.movement = false;
  
  me.height += .25;
  me.top -= unitsized4;
  updateDisplay(me);
  updateSize(me);
  
  if(me.attached) shiftVert(me.attached, -unitsized4, true);
}

function touchVine(me, vine) {
  if(!me.mario || me.attached || me.climbing || me.bottom > vine.bottom + unitsizet2) return;
  vine.attached = me;
  
  me.attached = vine;
  me.nofall = me.skipoverlaps = true;
  me.xvel = me.yvel = me.resting = me.jumping = me.jumpcount = me.running = 0;
  me.attachleft = !objectToLeft(me, vine);
  me.attachoff = me.attachleft * 2 - 1;
  me.movementsave = me.movement;
  me.movement = moveMarioVine;
  me.keys = new Keys();
  
  // Reset classes to be in vine mode
  clearClassCycle(me, "running");
  removeClasses(me, "running flipped");
  if(me.attachleft) addClass(me, "flipped");
  addClass(me, "climbing");
  me.climbing = addSpriteCycle(me, ["one", "two"], "climbing");
  
  // Make sure you're looking at the vine, and from the right distance
  lookTowardThing(me, vine);
  if(!me.attachleft) setRight(me, vine.left + unitsizet4);
  else setLeft(me, vine.right - unitsizet4);
  
}

// The actual springboard object itself only shows the bottom. 
// SpringboardTop and SpringboardMid are manipulated to give the effect of one coherent image
function Springboard(me) {
  me.width = 8;
  me.height = me.heightnorm = 15.5;
  me.tension = me.tensionsave = 0;
  me.dir = 1; // 1 for down, -1 for up (ydir)
  me.movement = moveSpringInit;
  me.collide = collideSpring;
  setSolid(me, "springboard");
}
function moveSpringInit(me) {
  me.movement = false;
  me.springtop = new Thing(SpringboardTop);
  me.springmid = new Thing(SpringboardMid);
  addThing(me.springtop, me.left, me.top);
  addThing(me.springmid, me.left + unitsize, me.top + unitsize);
}
function SpringboardTop(me) {
  me.width = 8;
  me.height = 1;
  me.nocollide = true;
  setSolid(me, "springboard top");
}
function SpringboardMid(me) {
  me.width = 6;
  me.height = 10;
  me.nocollide = true;
  setSolid(me, "springboard mid");
}
function collideSpring(me, spring) {
  if(me.yvel >= 0 && me.mario && !spring.tension && characterOnSolid(me, spring))
    return springMarioInit(spring, me);
  return characterTouchedSolid(me, spring);
}
function springMarioInit(spring, mario) {
  spring.tension = spring.tensionsave = max(mario.yvel * .77, unitsize);
  console.log(spring.tension);
  mario.movement = moveMarioSpringDown;
  mario.spring = spring;
  mario.xvel /= 2.8;
}
function moveMarioSpringDown(me) {
  // If you've moved off the spring, get outta here
  if(!objectsTouch(me, me.spring)) {
    me.movement = moveMario;
    me.spring.movement = moveSpringUp;
    me.spring = false;
    return;
  }
  // If the spring is contracted, go back up
  if(me.spring.height < unitsize * 2.5 || me.spring.tension < unitsized32) {
    me.movement = moveMarioSpringUp;
    me.spring.movement = moveSpringUp;
    return;
  }
  // Make sure it's hard to slide off
  if(me.left < me.spring.left + unitsizet2 || me.right > me.spring.right - unitsizet2)
    me.xvel /= 1.4;
  
  reduceSpringHeight(me.spring, me.spring.tension);
  setBottom(me, me.spring.top, true);
  me.spring.tension /= 2;
  
  updateSize(me.spring); updateDisplay(me.spring);
}
function moveMarioSpringUp(me) {
  if(!me.spring || !objectsTouch(me, me.spring)) {
    me.spring = false;
    me.movement = moveMario;
    return;
  }
}
function moveSpringUp(spring) {
  reduceSpringHeight(spring, spring.tension * -1);
  spring.tension *= 2;
  if(spring == mario.spring) 
    setBottom(mario, spring.top, true);
  
  if(spring.height > spring.heightnorm) {
    if(spring == mario.spring) {
      mario.yvel = max(unitsizet2 * -1, spring.tensionsave * -.98);
      mario.resting = mario.spring = false;
    }
    reduceSpringHeight(spring, (spring.height - spring.heightnorm) * unitsize);
    spring.tension = spring.tensionsave = spring.movement = false;
  }
}
function reduceSpringHeight(spring, dy) {
  reduceHeight(spring, dy, true);
  reduceHeight(spring.springmid, dy, true);
  setTop(spring.springtop, spring.top, true);
}

// For historical reasons
function GenericStone(me, width, height) { return Stone(me, width, height); }
function Stone(me, width, height) {
  me.width = (width * 8) || 8;
  me.height = (height * 8) || 8;
  setSolid(me, "GenericStone");
}

function RestingStone(me) {
  me.width = me.height = 8;
  me.used = false;
  me.movement = RestingStoneUnused;
  setSolid(me, "GenericStone hidden");
}
function RestingStoneUnused(me) {
  if(!mario.resting) return;
  if(mario.resting != me) return killNormal(me);
  me.movement = RestingStoneUsed;
  theme.play();
  removeClass(me, "hidden");
}
function RestingStoneUsed(me) {
  if(!mario.resting) return killNormal(me);
}

function CastleBlock(me, arg1, arg2) {
  me.width = me.height = 8;
  var length, dt, hidden = false;
  // Check for fireballs
  if(arg1 instanceof Array) {
    length = arg1[0];
    dt = arg1[1];
    hidden = arg2;
  }
  else {
    length = arg1;
    dt = arg2;
  }
  // If it's not hidden, set the background
  if(!hidden) {
    setSolid(me, "castleblock");
    me.element.style.backgroundSize = (unitsizet8) + "px";
  }
  // Otherwise it's invisible
  else setSolid(me, "castleblockinvis");
  
  // Since there are fireballs, set that stuff
  if(length) {
    me.balls = new Array(length);
    me.dt = .07 * (dt ? 1 : -1);
    me.timeout = round(7 / (abs(dt) || 1));
    me.movement = castleBlockSpawn;
    me.timer = me.counter = 0;
    me.angle = .25;
  }
}
function castleBlockSpawn(me) {
  for(var i=0; i<me.balls.length; ++i) {
    spawn = new Thing(CastleFireBall, i * 4);
    var mid = me.width * unitsized4, midx = me.left + mid, midy = me.top + mid;
    me.balls[i] = addThing(spawn, midx + i * unitsize * 3, midy + i * unitsize * 3);
  }
  me.movement = false;
  var interval = abs(me.dt) || 1;
  addEventInterval(castleBlockEvent, me.timeout, Infinity, me);
}
function castleBlockEvent(me) {
  me.midx = me.left;// + me.width * unitsize / 2;
  me.midy = me.top;// + me.height * unitsize / 2;
  me.counter = 0;
  me.angle += me.dt
  // Skip i=0 because it doesn't move
  for(var i = 1; i < me.balls.length; ++i) {
    setMidX(me.balls[i], me.midx + (i) * unitsizet4 * Math.cos(me.angle * Math.PI), true);
    setMidY(me.balls[i], me.midy + (i) * unitsizet4 * Math.sin(me.angle * Math.PI), true);
  }
}
// Set to solids because they spawn with their CastleBlocks
function CastleFireBall(me, distance) {
  me.width = me.height = 4;
  me.deadly = me.nofire = me.nocollidechar = me.nostar = me.skipoverlaps = true;
  me.movement = false;
  me.collide = collideEnemy;
  setSolid(me, "fireball castle");
}

function CastleBridge(me, length) {
  me.height = 8;
  me.width = length * 8 || 4;
  setSolid(me, "CastleBridge");
}
function CastleChain(me) {
  me.height = 8;
  me.width = 7.5;
  me.nocollide = true;
  setSolid(me, "castlechain");
  // make standardized detector
}
function CastleAxe(me) {
  me.width = 24;
  me.height = 24;
  me.collide = CastleAxeFalls;
  setSolid(me, "castleaxe blue");
  addSpriteCycle(me, ["one", "two", "three", "two"]);
}
function CastleAxeFalls(me, axe) {
  if(me.type != "mario" ||
    me.right < axe.left + unitsize || me.bottom > axe.bottom - unitsized2) return;
  axe.nocollide = map.canscroll = nokeys = notime = true;
  pause();
  killOtherCharacters();
  killNormal(axe);
  me.keys.jump = me.jumpcount = me.xvel = me.yvel =
    axe.bowser.xvel = axe.bowser.yvel = axe.bowser.movement = 0;
  setTimeout(function() {
    var i, width = axe.bridge.width;
    killNormal(axe.chain);
    addClass(axe.bowser, "owned");
    for(i=1; i<=width; ++i)
      setTimeout(function() { 
        --axe.bridge.width;
        axe.bridge.right -= unitsize;
        updateSize(axe.bridge, true);
      }, timer * i);
    setTimeout(function() {
      mario.keys.run = 1;
      mario.maxspeed = mario.walkspeed;
      unpause();
      if(axe.bowser) {
        removeClass(axe.bowser, "owned");
        var noise = play("Bowser Falls.wav", true, false);
        noise.addEventListener('ended', function () {
          play("World Clear.wav", true, false);
        } );
      }
    }, timer * (width - 7));
  }, timer * 14);
}

function TreeTop(me, width) {
  // Tree trunks are scenery
  me.width = width * 8;
  me.height = 8;
  setSolid(me, "treetop");
}
function ShroomTop(me, width) {
  // Shroom trunks are scenery
  me.width = width * 8;
  me.height = 8;
  setSolid(me, "shroomtop");
}

function PlatformTransport(me, one, two, three) { return Platform(me, one, two, three); }

// for the floaty ones, if the yvel is really big, +1000 points
function Platform(me, width, settings) {
  me.width = (width || 4) * 4;
  me.height = 4;
  me.moving = 0;
  // To do: make this instanceof(Function)
  if(typeof(settings) == "function") settings  = [settings];
  if(settings instanceof Array) {
    me.movement = settings[0];
    me.begin = settings[1] * unitsize;
    me.end = settings[2] * unitsize;
    me.maxvel = (settings[3] || 1.5) * unitsized4;
    if(me.movement == moveFloating || me.movement == movePlatformSpawn)
      me.yvel = me.maxvel;
    else me.xvel = me.maxvel;
    me.changing = 0; // 0 for normal, |1| for forward/back, |2| for waiting
  }
  if(me.movement == collideTransport) {
    me.movement = false;
    me.collide = collideTransport;
  }
  setSolid(me, "platform");
}
function PlatformGenerator(me, width, dir) {
  me.interval = 56;
  me.width = width * 4;
  me.height = me.interval * 7;
  me.dir = dir;
  me.nocollide = true;
  me.movement = PlatformGeneratorInit;
  setSolid(me, "platformgenerator");
}
function PlatformGeneratorInit(me) {
  var i=0;
  while(i < me.height) {
    me.platlast = new Thing(Platform, me.width / 4, [movePlatformSpawn, 0, 0, 1.5]);
    me.platlast.yvel *= me.dir;
    if(me.dir == 1) addThing(me.platlast, me.left, me.top + i * unitsize);
    else addThing(me.platlast, me.left, me.bottom - i * unitsize);
    me.platlast.parent = me;
    i += me.interval;
  }
  me.movement = false;
}
function movePlatformSpawn(me) {
  // This is like movePlatformNorm, but also checks for whether it's out of bounds
  // Assumes it's been made with a PlatformGenerator as the parent
  // To do: make the PlatformGenerator check one at a time, not each of them.
  if(me.bottom < me.parent.top) {
    setBottom(me, me.parent.bottom);
    detachMario(me);
  }
  else if(me.top > me.parent.bottom) {
    setTop(me, me.parent.top);
    detachMario(me);
  }
  else movePlatformNorm(me);
}
function movePlatformNorm(me) {
  shiftHoriz(me, me.xvel);
  shiftVert(me, me.yvel);
  if(me == mario.resting && me.alive) {
    setBottom(mario, me.top);
    shiftHoriz(mario, me.xvel);
    if(mario.right > innerWidth) setRight(mario, innerWidth);
  }
}
function detachMario(me) {
  if(mario.resting != me) return;
  mario.resting = false;
}

// Placed via pushPreScale
// pushPreScale(xloc, yloc, width, [platwidth, offy1, offy2]);
// settings = [platwidth, offy1, offy2] (offy is distance from top to platform)
function Scale(me, width, settings) {
  me.height = 7;
  me.width = width * 4;
  me.nocollide = true;
  
  setSolid(me, "scale");
}

function Flag(me) {
  me.width = me.height = 8;
  me.nocollide = true;
  setSolid(me, "flag");
}
function FlagPole(me) {
  me.width = 1;
  me.height = 72;
  me.nocollide = true;
  setSolid(me, "flagpole");
}
function FlagTop(me) {
  me.width = me.height = 4;
  me.nocollide = true;
  setSolid(me, "flagtop");
}
// The detectors are invisible, and just for ending the level.
function FlagDetector(me) {
  me.width = 2;
  me.height = 100;
  me.collide = FlagCollision;
  setSolid(me, "flagdetector");
}
function CastleDoorDetector(me) {
  me.width = me.height = 4;
  me.collide = endLevelPoints;
  setSolid(me, "castledoor");
}
function FlagCollision(me, detector) {
  if(!me || !me.mario || !me.element) return killNormal(me);
  window.detector = detector;
  pause();
  clearSounds();
  play("Flagpole.wav", true);
  
  // Reset and clear most stuff, including killing all other characters
  killOtherCharacters();
  updateAllDisplays();
  nokeys = notime = 1;
  
  // Mostly clear Mario, and set him to the pole's left
  mario.xvel = mario.yvel = mario.keys.up = mario.keys.jump = map.canscroll = map.ending = 0;
  setRight(me, detector.pole.left, true);
  removeClasses(me, ["running jumping"]);
  addClass(me, "climbing animated");
  addSpriteCycleManual(me, ["one", "two"], "climbing");
  marioRemoveStar(mario); // just in case
  
  // Start the movement
  var mebot = false,
      flagbot = false,
      scoreheight = (detector.stone.top - me.bottom) / unitsize,
      down = setInterval(function() {
        // Move mario until he hits the bottom, at which point mebot = true
        if(!mebot) {
          if(me.bottom >= detector.stone.top) {
            scoreMarioFlag(scoreheight, detector.stone);
            mebot = true;
            setBottom(me, detector.stone.top, true);
            removeClass(mario, "animated");
            clearClassCycle(mario, "climbing");
          } else shiftVert(me, unitsize, true);
        }
        // Same for the flag
        if(!flagbot) {
          if(detector.flag.bottom >= detector.stone.top) {
            flagbot = true;
            setBottom(detector.flag, detector.stone.top, true);
          } else shiftVert(detector.flag, unitsize, true);
        }
        // Once both are at the bottom:
        if(mebot && flagbot) {
          setBottom(me, detector.stone.top, true);
          clearInterval(down);
          setTimeout(function() { FlagOff(me, detector.pole); }, timer * 21);
        }
      }, timer);
}
// See http://themushroomkingdom.net/smb_breakdown.shtml near bottom
// Stages: 8, 28, 40, 62
function scoreMarioFlag(diff, stone) {
  var amount;
  // console.log(diff);
  // Cases of...
  if(diff < 28) {
    // 0 to 8
    if(diff < 8) { amount = 100; }
    // 8 to 28
    else { amount = 400; }
  }
  else {
    // 28 to 40
    if(diff < 40) { amount = 800; }
    // 40 to 62
    else if(diff < 62) { amount = 2000; }
    // 62 to infinity and beyond
    else { amount = 5000; }
  }
  score(mario, amount, true);
}

function FlagOff(me, pole) {
  mario.keys.run = notime = nokeys = 1;
  mario.maxspeed = mario.walkspeed;
  addClass(me, "flipped");
  clearClassCycle(me, "climbing");
  setLeft(me, pole.right, true);
  setTimeout(function() {
    play("Stage Clear.wav", true);
    marioHopsOff(me, pole, true);
  }, timer * 14);
}

function endLevelPoints(me, detector) {
  killNormal(detector);
  me.dying = notime = nokeys = true;
  
  var numfire = String(data.time.amount);
  numfire = numfire.substring(numfire.length - 1);
  if(!(numfire == 1 || numfire == 3 || numfire == 6)) numfire = 0;
  me.element.style.opacity = 0;
  var points = setInterval(function() {
    // 50 for each
    --data.time.amount;
    data.score.amount += 50;
    updateDataElement(data.score);
    updateDataElement(data.time);
    if(data.time.amount <= 0)  {
      pause();
      clearInterval(points);
      setTimeout(function() { endLevelFireworks(me, numfire, detector); }, timer * 49);
    }
  }, timer);
}
function endLevelFireworks(me, numfire, detector) {
  var i;
  if(numfire) {
    var castlemid = detector.castle.left + detector.castle.width * unitsized2;
    for(i=0; i<numfire; ++i)
      explodeFirework(i, castlemid);
  }
  setTimeout(function() { endLevel(); }, timer * (i+2) * 42);
}
function explodeFirework(num, castlemid) {
  setTimeout(function() {
    if(!map.ending) return;
    var fire = new Thing(Firework, num);
    addThing(fire, castlemid + fire.locs[0] - unitsize * 6, unitsizet16 + fire.locs[1]);
    fire.animate();
  }, timer * num * 42);
}
function Firework(me, num) {
  me.width = me.height = 8;
  me.nocollide = me.nofire = true;
  // Number is >0 if this is ending of level
  if(num)
    switch(num) {
      // These probably aren't the exact same as original... :(
      case 1: me.locs = [unitsizet16,unitsizet16]; break;
      case 2: me.locs = [unitsizet16 * -1,unitsizet16]; break;
      case 3: me.locs = [unitsizet16 * 2,unitsizet16 * 2]; break;
      case 4: me.locs = [unitsizet16 * -2,unitsizet16 * 2]; break;
      case 5: me.locs = [0,unitsizet16 * 1.5]; break;
      default: me.locs = [0,0]; break;
    }
  // Otherwise, it's just a normal explosion
  me.animate = function() {
    var name = me.element.className + " n";
    if(me.locs) play("Firework.wav");
    addEvent(function(me) { me.element.className = name + 1 }, 0, me);
    addEvent(function(me) { me.element.className = name + 2 }, 7, me);
    addEvent(function(me) { me.element.className = name + 3 }, 14, me);
    addEvent(function(me) { killNormal(me); }, 21, me);
  }
  setSolid(me, "firework");
}

function Coral(me, height) {
  me.width = 8;
  me.height = height * 8;
  setSolid(me, "coral");
}

function BridgeBase(me, width) {
  me.height = 4;
  me.width = width * 8;
  setSolid(me, "bridge-base");
}

function WarpWorld(me) {
  me.width = 106; // 13 * 8 + 2
  me.height = 88;
  me.movement = setWarpWorldInit;
  me.collide = enableWarpWorldText;
  me.pirhanas = [];
  me.texts = [];
  window.lol = me;
  setSolid(me, "warpworld");
}

function setWarpWorldInit(me) {
  // Just reduces the size 
  shiftHoriz(me, me.width * unitsized2);
  me.width /= 2;
  updateSize(me); 
  updateDisplay(me);
  me.movement = false;
}

function enableWarpWorldText(me, warp) {
  var pirhanas = warp.pirhanas, texts = warp.texts, i;
  for(i in pirhanas)
    killNormal(pirhanas[i]);
  for(i in texts)
    texts[i].style.visibility = "";
  killNormal(warp);
}

/*
 * Scenery & etc
 */
function loadScenery() {
  this.sprites = {
    "Bush1": [16, 8],
    "Bush2": [24, 8],
    "Bush3": [32, 8],
    "Castle": [72, 88],
    "CastleWall": [8, 48],
    "Cloud1": [16, 12],
    "Cloud2": [24, 12],
    "Cloud3": [32, 12],
    "HillSmall": [24, 9.5],
    "HillLarge": [40, 17.5],
    "Fence": [8, 8],
    "pirhana": [8, 12],
    "PlantSmall": [7, 15],
    "PlantLarge": [8, 23],
    "Railing": [4, 4],
    "ShroomTrunk": [8, 8],
    "String": [1, 1],
    "TreeTrunk": [8, 8],
    "Water": [3, 5.5]
  };
  this.patterns = {
    backreg: [
      ["HillLarge", 0, 0],
      ["Cloud1", 68, 68],
      ["Bush3", 92, 0],
      ["HillSmall", 128, 0],
      ["Cloud1", 156, 76],
      ["Bush1", 188, 0],
      ["Cloud3", 220, 68],
      ["Cloud2", 292, 76],
      ["Bush2", 332, 0],
      ["Blank", 384]
    ],
    backcloud: [
      ["Cloud2", 28, 64],
      ["Cloud1", 76, 32],
      ["Cloud2", 148, 72],
      ["Cloud1", 228, 0],
      ["Cloud1", 284, 32],
      ["Cloud1", 308, 40],
      ["Cloud1", 372, 0],
      ["Blank", 384]
    ],
    backcloudmin: [ // used for random map generation
      ["Cloud1", 68, 68],
      ["Cloud1", 156, 76],
      ["Cloud3", 220, 68],
      ["Cloud2", 292, 76],
      ["Blank", 384]
    ],
    backfence: [
      ["PlantSmall", 88, 0],
      ["PlantLarge", 104, 0],
      ["Fence", 112, 0, 4],
      ["Cloud1", 148, 68],
      ["PlantLarge", 168, 0],
      ["PlantSmall", 184, 0],
      ["PlantSmall", 192, 0],
      ["Cloud1", 220, 76],
      ["Cloud2", 244, 68],
      ["Fence", 304, 0, 2],
      ["PlantSmall", 320, 0],
      ["Fence", 328, 0],
      ["PlantLarge", 344, 0],
      ["Cloud1", 364, 76],
      ["Cloud2", 388, 68],
      ["Blank", 384]
    ],
    backfencemin: [
      ["PlantLarge", 104, 0],
      ["Fence", 112, 0, 4],
      ["Cloud1", 148, 68],
      ["PlantLarge", 168, 0],
      ["PlantSmall", 184, 0],
      ["PlantSmall", 192, 0],
      ["Cloud1", 220, 76],
      ["Cloud2", 244, 68],
      ["Fence", 304, 0, 2],
      ["PlantSmall", 320, 0],
      ["Fence", 328, 0],
      ["Cloud1", 364, 76],
      ["Cloud2", 388, 68],
      ["Blank", 384]
    ],
    backfencemin2: [
      ["Cloud2", 4, 68],
      ["PlantSmall", 88, 0],
      ["PlantLarge", 104, 0],
      ["Fence", 112, 0, 1],
      ["Fence", 128, 0, 2],
      ["Cloud1", 148, 68],
      // ["PlantLarge", 168, 0],
      ["PlantSmall", 184, 0],
      ["PlantSmall", 192, 0],
      ["Cloud1", 220, 76],
      ["Cloud2", 244, 68],
      ["Fence", 304, 0, 2],
      ["PlantSmall", 320, 0],
      ["Fence", 328, 0],
      ["PlantLarge", 344, 0],
      ["Cloud1", 364, 76],
      ["Cloud2", 388, 68],
      ["Blank", 384]
    ],
    backfencemin3: [
      ["Cloud2", 4, 68],
      ["PlantSmall", 88, 0],
      ["PlantLarge", 104, 0],
      ["Fence", 112, 0, 4],
      ["Cloud1", 148, 68],
      ["PlantSmall", 184, 0],
      ["PlantSmall", 192, 0],
      ["Cloud1", 220, 76],
      ["Cloud2", 244, 68],
      ["Cloud1", 364, 76],
      ["Cloud2", 388, 68],
      ["Blank", 384]
    ]
  };
  processSceneryPatterns(this.patterns);
}

function processSceneryPatterns(patterns) {
  var current, i;
  for(i in patterns) {
    current = patterns[i];
    if(!current.length) continue;
    // The last arry in current should be ["blank", width]
    current.width = current[current.length - 1][1];
    current.pop();
  }
}

// Used in worlds like 5-2 where patterns are slightly inaccurate
function SceneryBlocker(me, width, height) {
  me.width = width || 8;
  me.height = height || 8;
  me.nocollide = true;
  setSolid(me, "sceneryblocker body");
}

function Sprite(me, name, reps) {
  var template = Scenery.sprites[name];
  me.width = template[0] * (reps[0] || 1);
  me.height = template[1] * (reps[1] || 1);
  me.nocollide = true;
  setSolid(me, "scenery " + name);
}

function text(me, settings, hidden) {
  me.element.innerHTML = settings[0];
  if(settings.length > 1) {
    if(settings[1] > 0) me.width = settings[1];
    if(settings[2] > 0) me.height = settings[2];
  } else me.width = me.height = Infinity;
  if(hidden) me.element.style.visibility = "hidden";
  me.nocollide = true;
  setSolid(me, "text");
  me.nostretch = true;
}

function LocationShifter(me, loc, size) {
  me.loc = loc;
  me.width = size[0];
  me.height = size[1];
  me.collide = collideLocationShifter;
  setSolid(me, "blue");
}
function collideLocationShifter(me, shifter) {
  if(!me.mario) return;
  shifter.nocollide = mario.piping = true;
  addEvent(
    function(me) {
      locMovePreparations(me);
      shiftToLocation(shifter.loc);
    },
    1,
    me
  );
}

function ScrollBlocker(me, big) {
  me.width = 40;
  me.height = 140;//screen.height;
  me.nocollide = true;
  me.big = big;
  me.movement = function() {
    if(me.left - mario.xvel <= screen.right - screen.left) {
      map.canscroll = me.movement = false;
      map.noscroll = me.big; // really just for random
    }
  }
  setSolid(me, "scrollblocker");
}

function ScrollEnabler(me) {
  me.width = 40;
  me.height = 140;//screen.height;
  me.collide = function() {
    if(me.left - mario.xvel <= screen.right - screen.left) {
      map.canscroll = me.nocollide = true;
    }
  }
  setSolid(me, "scrollenabler");
}

function zoneToggler(me, func) {
  me.width = 40;
  me.height = 140;//screen.height;
  me.func = func;
  me.collide = function(me, zone) {
    zone.func();
    zone.nocollide = true;
  }
  setSolid(me, "zonetoggler " + func.name);
}

function GenerationStarter(me, func, arg) {
  me.width = 8;
  me.height = screen.height + 20;
  me.func = func;
  me.arg = arg;
  me.collide = function(character, me) {
    if(character.type != "mario") return false;
    spawnMap();
    killNormal(me);
  };
  me.movement = function(me) {
    me.movement = false;
    addClass(me, "used");
    me.func((screen.left + me.right) / unitsize, me.arg);
  };
  setSolid(me, "generationstarter");
}

function castleDecider(me, xloc, secnum) {
  me.height = ceilmax;
  me.width = 10;
  me.nocollide = true;
  me.xloc = xloc;
  me.section = map.area.sections[secnum];
  me.next = map.area.sections[secnum + 1];
  me.movement = function(me) {
    if(me.left > screen.right - screen.left || !me.section.activated) return;
    var section = me.section;
    section.numpass = section.colliders.length =  0;
    if(section.passed) {
      ++map.area.sections.current;
      me.next(me.xloc);
    }
    else section(me.xloc);
    section.activated = section.passed = false;
    spawnMap();
    killNormal(me);
  }
  setSolid(me, "decider blue " + secnum);
}

// Used for general function activators, like zones
function FuncCollider(me, func) {
  me.width = 8;
  me.height = ceilmax + 40;
  me.collide = func;
  setSolid(me, "funccollider blue " + func.name);
}
function FuncSpawner(me, func) {
  me.width = 8; me.height = 8;
  me.movement = func;
  me.nocollide = true;
  setSolid(me, "funccollider blue " + func.name);
}

// Used for more specific stuff, like in castles
// To do: replace this whenever possible
function Collider(me, size, funcs) {
  me.width = size[0];
  me.height = size[1];
  if(funcs instanceof Array) {
    me.func = funcs[0] || function() {};
    me.movement = funcs[1] || function() {}
  }
  else {
    me.func = funcs || function() {};
    me.movement = false;
  }
  me.collide = function(character, me) {
    if(character.type != "mario") return false;
    me.func(character, me);
  }
  setSolid(me, "collider blue " + me.func.name);
}

function CustomThing(me, settings) {
  me.width = settings.width || 8;
  me.height = settings.height || 8;
  me.movement = settings.movement || moveSimple;
  me.collide = settings.collide || collideEnemy;
  me.death = settings.death || killFlip;
  if(settings.extra) settings.extra(me);
  setCharacter(me, settings.type || "custom");
}

function CustomSolid(me, settings) {
  me.width = settings.width || 8;
  me.height = settings.height || 8;
  me.movement = settings.movement || false;
  me.collide = settings.collide || collideSolid;
  me.death = settings.death || killNormal;
  if(settings.extra) settings.extra(me);
  setSolid(me, settings.type || "custom");
}