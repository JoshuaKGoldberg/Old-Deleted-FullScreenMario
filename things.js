function Thing(type, extra, more) {
  this.element = document.createElement("div");
  this.style = this.element.style;
  if(arguments.length > 0) type(this, extra, more);
  this.alive = true;
  this.placed = 0;
  this.xvel = this.xvel || 0;
  this.yvel = this.yvel || 0;
  this.tolx = this.tolx || 0;
  this.toly = this.toly || unitsized8;
  
  this.movement = this.movement;
  this.collide = this.collide || function() {};
  this.death = this.death || killNormal;
  this.animate = this.animate || emergeUp;
  
  if(this.width * 4 < quads.width && this.height * unitsize < quads.height)
    this.maxquads = 4; // This could be done with modular stuff
  else this.maxquads = quads.length;
  
  this.quads = new JSList();
  this.mynodes = new JSList();
  this.overlaps = [];
}

function setCharacter(me, type) {
  me.type = type.split(" ")[0]; // so 'shell smart' becomes 'shell'
  me.element.className = "character " + type;
  if(me.group == "enemy") me.element.className += " enemy";
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
  if(me.type != "mario") return;
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
}

function FireBall(me, moveleft) {
  me.group = "item";
  me.width = me.height = 4;
  me.speed = unitsize * 1.4;
  me.gravity = gravity * 1.4;
  me.jumpheight = unitsize * 1.4;
  me.nofire = true;
  me.moveleft = moveleft;
  me.animate = emergeFire;
  me.movement = moveJumping;
  me.collide = fireEnemy;
  me.death = fireExplodes;
  setCharacter(me, "fireball");
}
function fireEnemy(enemy, me) {
  if(!me.alive || me.emerging || enemy.nofire) return;
  play("Bump.wav");
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
  setCharacter(me, "star");
}

function Shell(me, smart) {
  me.width = 7; me.height = 6;
  me.group = "item";
  me.speed = unitsizet2;
  me.moveleft = me.xvel = me.move = me.hitcount = me.peeking = me.counting = 0;
  me.smart = smart;
  me.movement = moveShell;
  me.collide = hitShell;
  me.death = killFlip;
  var name = "shell"; if(smart) name += " smart";
  setCharacter(me, name);
}
function hitShell(one, two) {
  // Assuming two is shell
  if(one.type == "shell" && two.type != one.type) return hitShell(two, one);
  
  switch(one.type) {
    case "solid": 
    if(two.right < one.right) {
      setRight(two, one.left);
      two.xvel = two.speed * -1;
      two.moveleft = true;
    } else {
      setLeft(two, one.right);
      two.xvel = two.speed;
      two.moveleft = false;
    }
    break;
    
    case "mario":
      var shelltoleft = objectToLeft(two, one);
      var mariojump = one.yvel > 0 && one.bottom <= two.top + unitsizet2;
      
      if(one.star) return two.death(two, 2);
      
      if(two.xvel == 0 || mariojump) {
        // Mario has has hit the shell in a dominant matter. You go, Mario!
        two.counting = 0;
        if(two.peeking) {
          this.height -= unitsized8;
          updateSize(this);
          removeClass(two, "peeking");
        }
        
        if(two.xvel == 0) {
          if(shelltoleft) {
            two.moveleft = true;
            two.xvel = two.speed * -1;
          } else {
            two.moveleft = false;
            two.xvel = two.speed;
          }
        } else two.xvel = 0;
        if(mariojump) {
          setBottom(one, two.top - unitsize, true);
          jumpEnemy(one, two);
        }
      } else one.death(one);
    break;
    
    case "shell":
      if(one.xvel != 0) two.death(two);
      if(two.xvel != 0) one.death(one);
    break;
    
    default:
      switch(one.group) {
        case "enemy":
          if(two.xvel) {
            // If the shell is moving, kill the enemy
            if(one.type.split(" ")[0] == "koopa") {
              // If the enemy is a goomba, make it a shell
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
function moveShell() {
  if(this.xvel != 0) return;
  
  if(++this.counting == 350) {
    this.element.className += " peeking";
    this.peeking = true;
    this.height += unitsized8;
    updateSize(this);
  } else if(this.counting == 490) {
    var spawn = new Thing(Koopa, this.smart);
    addThing(spawn, this.left, this.bottom - spawn.height * unitsize);
    killNormal(this);
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
  else me.yvel = unitsize * -1;
  setBottom(me, Math.min(me.bottom, enemy.top + enemy.toly - unitsized4), true);
  updateLocation(me);
  play("Kick.wav");
  // To do: jumping two goomba simultaneously should give 100 & 400, not 100 & 200
  if(enemy.group != "item" || enemy.type == "shell")
    score(enemy, findScore(me.jumpcount++), true);
  // ++me.jumpcount;
}
function Goomba(me) {
  me.width = me.height = 8;
  me.speed = unitsize * .21;
  me.toly = unitsize;
  me.moveleft = true;
  me.smart = false;
  me.group = "enemy";
  me.movement = moveSimple;
  me.collide = collideEnemy;
  me.death = killGoomba;
  setCharacter(me, "goomba");
}
function lulz() {
  var adding = setInterval(function() {
    var lol = new Thing(Goomba);
    lol.yvel = -3.5 * Math.random() * unitsize;
    lol.xvel = lol.speed = 1.4 * Math.random() * unitsize;
    addThing(lol, 140 * unitsize, 56 * unitsize);
  }, timer * 7);
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
  me.collide = function() {};
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
    },
    0,
    spawn, me
  );
  killNormal(me);
  if(big == 2) killFlip(spawn);
}

function Pirhana(me, evil) {
  me.width = 8;
  me.height = me.counter = me.state = 0;
  me.maxheight = 12;
  me.countermax = me.maxheight * 5;
  me.toly = unitsizet4;
  me.nofall = me.deadly = me.nocollidesolid = me.nocollidechar = true;
  me.group = "enemy";
  me.collide = collideEnemy;
  me.death = killNormal;
  me.movement = movePirhana;
  setCharacter(me, "pirhana");
}
function movePirhana() {
  // State: 0 = resting, 1 = raising, 2 = resting, 3 = lowering
  // While resting, if mario is nearby, don't change
  var marmid = mario.left + mario.width * unitsized2;
  if(this.state == 0 && 
  (marmid > this.left - unitsizet8 && mario.left < this.right + unitsizet8))
   return ++this.counter;
  
  if(this.counter >= this.countermax) {
    this.state = ++this.state % 4;
    this.counter = 1;
  }
  if(this.state % 2 == 1) {
    var dy = -.2; if(this.state == 3) dy = .2;
    this.height -= dy;
    this.top += dy * unitsize;
    if(this.height < .007) this.height = 0;
    updateDisplay(this);
    updateSize(this);
  }
  // Increment counter if you're not resting while mario is nearby
  ++this.counter;
}

// Assuming one should generally be Mario/thing, two is enemy
function collideEnemy(one, two) {
  // This is necessary because Mario often double-jumps Goombas. Hmm.
  if(!one.alive || one.nocollidechar || !two.alive) return;
  
  if(one.group == "item") {
    if(one.type == "shell" || one.type == "fireball") return one.collide(two, one);
    if(two.height == 0 || two.width == 0) return;
    return;
  }
  
  
  if(!map.underwater && one.type == "mario" && (!two.deadly && /*objectOnTop*/characterOnCharacter(one, two)) || one.star) {
    // Mario is on top of them:
    if(one.type == "mario" && !one.star) jumpEnemy(one, two);
    else two.nocollide = true;
    two.death(two, one.star * 2);
    if(one.star) scoreEnemyStar(two);
    else scoreEnemyStomp(two);
  } else if(one.type == "mario") one.death(one);
  else {
    one.moveleft = objectToLeft(one, two);
    two.moveleft = !one.moveleft;
  }
}

function Podoboo(me, jumpheight) {
  me.width = 7;
  me.height = 8;
  me.deadly = me.nofall = me.nocollidesolid = true;
  me.gravity = map.gravity / 2.1;
  
  me.jumpheight = (jumpheight || 64) * unitsize;
  me.counter = me.state = 0;
  me.countermax = 117;
  
  me.speed = map.maxyvel * -1;
  me.movement = movePodobooInit;
  me.collide = collideEnemy;
  
  setCharacter(me, "podoboo flipped-vert");
}
function movePodobooInit(me) {
  me.movement = movePodoboo;
  me.heightnorm = me.top;
  me.heightfall = me.top - me.jumpheight;
}
function movePodoboo(me) {
  // State: 0 = resting, 1 = raising, 2 = slowing, 3 = falling
  switch(me.state) {
    case 0:
      if(++me.counter < me.countermax) return;
      removeClass(me, "flipped-vert");
      me.counter = 0; me.state = 1;
      me.yvel = me.speed + me.gravity;
    break;
    case 1:
      shiftVert(me, me.speed, true);
      if(me.top - screen.top <= me.heightfall) {
        me.state = 2;
        me.nofall = false;
        return;
      }
    break;
    case 2:
      if(me.yvel > 0) {
        me.element.className += " flipped-vert";
        me.state = 3;
        return;
      }
    break;
    case 3:
      if(me.top >= me.heightnorm) {
        setTop(me, me.heightnorm, true);
        me.state = 0;
        me.nofall = true;
      }
    break;
  }
}

function HammerBro(me) {
  me.width = 8;
  me.height = 12;
  me.group = "enemy";
  me.collide = collideEnemy;
  me.statex = me.statey = me.counterx = me.countery = me.level = me.throwcount = 0;
  me.diry = me.target = 1;
  me.xvel = unitsized16;
  me.maxy = map.maxyvel / 1.4;
  me.maxyinv = me.maxy * -1;
  me.movement = moveHammerBroInit;
  setCharacter(me, "hammerbro");
}
// To do: 
function moveHammerBroInit(me) {
  if(!me.resting) return;
  var floor = map.floor * unitsize;
  me.levels = [floor, floor - unitsizet32, floor - unitsizet32 * 2];
  me.level = me.levels.indexOf(me.bottom);
  if(me.level == -1) me.level = 0;
  me.lookleft = objectToLeft(mario, me);
  if(!me.lookleft) me.element.className += " flipped";
  me.movement = moveHammerBro;
}
function moveHammerBro(me) {
  moveHammerBroX(me);
  moveHammerBroY(me);
}
function moveHammerBroX(me) {
  // Switch direction every 70
  if(++me.counterx > 70) {
    me.xvel *= -1;
    me.counterx = 0;
  }
  
  // Throw some hammers, gurl
  me.throwcount = ++me.throwcount % 245;
  if(me.throwcount <= 84 && me.throwcount % 14 == 0) {
    var hammer = new Thing(Hammer, me.lookleft);
    addThing(hammer, me.left - unitsizet2, me.top - unitsizet2);
  }
  
  // Make him turn to look at mario if needed
  if(objectToLeft(mario, me)) {
    if(!me.lookleft) {
      me.lookleft = true;
      removeClass(me, "flipped");
    }
  } else if(me.lookleft) {
    me.lookleft = false;
    me.element.className += " flipped";
  }
}
function moveHammerBroY(me) {
  switch(me.statey) {
    case 0: // Resting on current level
      if(++me.countery == 117) {
        me.countery = me.statey++;
        me.nocollidesolid = true;
        me.nofall = me.diry == 1; // only true if going up
        if(me.level == 2 && Math.floor(Math.random() * 2)) --me.level;
        me.level += me.diry;
      }
    break;
    case 1: // Moving to level + diry until bottom at level
      // If you've moved enough to reach the destination, you're good.
      if((me.diry == 1 && me.bottom < me.levels[me.level]) || (me.diry == -1 && me.bottom >= me.levels[me.level] - unitsizet8))
         return me.statey = 2;
      // Otherwise keep moving up by increasing yvel if needed
      if(me.diry == 1) {
        me.yvel = Math.max(me.yvel - unitsized4, me.maxyinv);
        shiftVert(me, me.yvel, true);
      }
    break;
    case 2: // You've reached the tip of the jump
      if(me.level != 1) me.diry *= -1;
      me.nofall = me.nocollidesolid = false;
      me.statey = 3;
    break;
    case 3: // Wait until falling...
      if(me.yvel >= 0) me.statey = 4;
    break;
    case 4:
      // If you're resting on level, you're good 
      if(me.resting && me.bottom == me.levels[me.level]) return me.statey = 0;
      // If you're not after 7 steps, you're back to floor. to do: or current levl
      if(++me.countery >= 14) {
        me.statey = 0;
        // me.level is location in array of me.bottom OR 0
        me.level = me.levels.indexOf(me.bottom);
        if(me.level == -1) me.level = 0;
        if(me.level != 0) me.diry = -1; else me.diry = 1;
      }
    break;
  }
}

function Hammer(me, left) {
  me.width = me.height = 8;
  me.nocollidesolid = me.deadly = true;
  me.collide = collideEnemy;
  me.yvel = unitsize * -1;
  me.xvel = unitsized2;
  if(left) me.xvel *= -1;
  me.gravity = gravity / 2.1;
  setCharacter(me, "hammer");
}

function Cannon(me, height, nofire) {
  me.width = 8;
  me.height = (height || 1) * 8;
  if(!nofire) me.movement = moveCannon;
  me.timer = 117;
  setSolid(me, "cannon");
  me.element.style.zIndex = 8;
}
function moveCannon(me) {
  if(me.timer > 210) {
    if(mario.right > me.left - unitsizet8 && mario.left < me.right + unitsizet8)
      return; // don't fire if Mario is too close
    var spawn = new Thing(BulletBill);
    if(objectToLeft(mario, me)) {
      addThing(spawn, me.left, me.top);
      spawn.direction = spawn.moveleft = true;
      spawn.xvel *= -1;
      spawn.element.className += " flipped";
    }
    else addThing(spawn, me.left + me.width, me.top);
    me.timer = 0;
  } else ++me.timer;
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


function Bowser(me, powerful) {
  me.width = me.height = 16;
  me.speed = .28 * unitsize;
  me.gravity = unitsize / 42;
  me.deadly = me.dx = me.lookleft = true;
  me.moveleft = me.smart = me.movecount = me.jumpcount = me.firecount = me.deathcount = 0;
  me.group = "enemy";
  me.movement = moveBowser;
  me.collide = collideEnemy;
  me.death = killBowser;
  setCharacter(me, "bowser");
}
// Each fireball leaves his mouth, and in addition to moving x,
//// also travels vertically to a desired level
// Most likely the closest value within an array of levels
//// to mario's current
function moveBowser(me) {
  // I think this should probably be switched, lol
  me.moveleft = objectToLeft(me, mario);
  if(me.moveleft && !me.lookleft) {
    me.element.className += " flipped";
    me.lookleft = true;
  } else if(me.lookleft && !me.moveleft) {
    removeClass(me, "flipped");
    me.lookleft = false;
  }
  // Running
  me.movecount += me.dx;
  if(me.movecount % 140 == 0) me.dx *= -1;
  me.xvel = me.speed * (70 - me.movecount) / 70;
  // Jumping
  if(++me.jumpcount == 175) {
    me.jumpcount = me.resting = 0;
    me.yvel = -1.17 * unitsize;
  }
  // Firing
  if(mario.left < me.right && ++me.firecount == 175) {
    me.firecount = 0;
    bowserFires(me);
  }
}
function bowserFires(me) {
  var fire = new Thing(BowserFire);
  addThing(fire, me.left - unitsizet8, me.top + unitsize);
  play("Bowser Fires.wav");
}
function BowserFire(me) {
  me.width = 12;
  me.height = 4;
  me.xvel = -.63 * unitsize;
  me.deadly = me.nofall = me.nocollidesolid = true;
  me.collide = collideEnemy;
  me.movement = moveFlying;
  setCharacter(me, "bowserfire");
}
// This is for when Fiery Mario kills bowser - the normal one is listed under the castle things
function killBowser(me, big) {
  if(big) return me.nofall = false;
  
  if(++me.deathcount == 5) {
    me.yvel = me.speed = me.movement = 0;
    killFlip(me, 350);
    score(me, 5000);
  }
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
  me.xvel = me.speedinv = unitsized4 * -1;
  me.movement = moveBlooper;
  me.collide = collideEnemy;
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
  if(me.squeeze) me.yvel = Math.max(me.yvel + .021, .7); // going down
  else me.yvel = Math.min(me.yvel - .035, -.7); // going up
  shiftVert(me, me.yvel, true);
  
  if(!me.squeeze) {
    if(mario.left > me.right + unitsizet8) {
      // Go to the right
      me.xvel = Math.min(me.speed, me.xvel + unitsized32);
    }
    else if(mario.right < me.left - unitsizet8) {
      // Go to the left
      me.xvel = Math.max(me.speedinv, me.xvel - unitsized32);
    }
  }
}
function squeezeBlooper(me) {
  me.element.className += " squeeze";
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
  var name = "cheepcheep ";
  
  if(red) {
    name += " red";
    me.red = true;
    me.xvel = me.speedy = unitsize / -6;
  } else me.xvel = me.speedy = unitsized8 * -1;
  
  if(jumping) {
    name += " jumping";
    me.jumping = true;
    me.movement = moveCheepJumping;
  } else me.movement = moveCheep;
  
  me.collide = collideEnemy;
  me.nofall = me.nocollidesolid = true;
  setCharacter(me, name);
}

function moveCheep(me) {
  if(mario.right < me.left) {
    if(mario.bottom < me.top || me.top > 364) {
      // Go up
      me.yvel = Math.min(me.speedy, me.yvel + unitsize / 64);
    }
    if(mario.top > me.bottom) {
      // Go down, if not below the bottom
      me.yvel = Math.max(me.speedy * -1, me.yvel - unitsize / 64);
    }
  }
  shiftVert(me, me.yvel, true);
}

function Lakitu(me) {
  
  setCharacter(me, "lakitu");
}

function Spiny(me) {
  me.width = me.height = 8;
  me.group = "enemy";
  me.speed = unitsize * .21;
  me.deadly = me.moveleft = true;
  me.smart = false;
  me.collide = collideEnemy;
  me.movement = moveSimple;
  setCharacter(me, "spiny");
}
function SpinyEgg(me) {
  me.height = 8; me.width = 7;
  me.group = "enemy";
  me.deadly = true;
  me.movement = moveSpinyEgg;
  setCharacter(me, "spinyegg");
}
function moveSpinyEgg(me) {
  if(me.resting) {
    var spawn = new Thing(Spiny);
    addThing(spawn, me.left, me.top);
    spawn.moveleft = objectToLeft(mario, spawn);
    killNormal(me);
  }
}

function Beetle(me) {
  me.width = me.height = 8.5;
  me.group = "enemy";
  me.speed = me.xvel = unitsize * .21;
  me.moveleft = true;
  me.smart = false;
  me.collide = collideEnemy;
  me.movement = moveSimple;
  me.death = killBeetle;
  setCharacter(me, "beetle");
  // me.toly = unitsizet8;
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
    },
    0,
    spawn, me
  );
  killNormal(me);
  if(big == 2) killFlip(spawn);
}
function BeetleShell(me) {
  me.width = me.height = 8;
  me.group = "item";
  me.speed = unitsizet2;
  me.moveleft = me.xvel = me.move = me.hitcount = me.peeking = me.counting = 0;
  me.movement = moveShell;
  me.collide = hitShell;
  me.death = killFlip;
  setCharacter(me, "shell beetle");
}

/*
 * Solids
 */

function Coin(me) {
  me.group = "coin";
  me.width = 5; me.height = 7;
  me.nofall = me.coin = me.nofire = me.nocollidechar = true;
  me.toly = me.tolx = 0;
  me.collide = hitCoin;
  me.animate = coinEmerge;
  me.death = killNormal;
  setCharacter(me, "coin");
}
function hitCoin(me, coin) {
  // if(!me.coin && coin.coin) hitCoin(coin, me);
  if(me.type != "mario") return;
  // to do: get nocollidechar to work
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
  score(me, 200, true);
  gainCoin();
  me.nocollide = me.alive = me.nofall = me.emerging = true;
  determineThingQuadrants(me);
  
  // I'll get around to automating this, honest!...
  var elem = me.element;
  me.movement = coinEmergeMove;
  me.yvel = unitsize * -1;
  addEvent(function(me) { me.yvel = unitsize; }, 25, me);
  addEvent(function(me) { me.death(me); }, 55, me);
  addEvent(function(elem) { elem.className = "character coin anim1" }, 5, elem);
  addEvent(function(elem) { elem.className = "character coin anim2" }, 10, elem);
  addEvent(function(elem) { elem.className = "character coin anim3" }, 15, elem);
  addEvent(function(elem) { elem.className = "character coin anim4" }, 20, elem);
  addEvent(function(elem) { elem.className = "character coin anim3" }, 25, elem);
  addEvent(function(elem) { elem.className = "character coin anim2" }, 30, elem);
  addEvent(function(elem) { elem.className = "character coin anim1" }, 35, elem);
  addEvent(function(elem) { elem.className = "character coin anim2" }, 40, elem);
  addEvent(function(elem) { elem.className = "character coin anim3" }, 45, elem);
  addEvent(function(elem) { elem.className = "character coin anim4" }, 50, elem);
}

function coinEmergeMove(me) {
  shiftVert(me, me.yvel, true);
}

function Floor(me, length) {
  me.width = length * 8;
  me.height = 384; // 48 * 4
  setSolid(me, "floor");
  me.element.style.backgroundSize = (unitsizet8) + "px";
}

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
  if(character.power > 1 && !me.contents) {
    brickBreak(me, character);
    return;
  }
  blockBumpMovement(me);
  if(me.contents) {
    if(mario.power > 1 && me.contents[0] == Mushroom && !me.contents[1]) me.contents[0] = FireFlower;
    addEvent(
      function(me) {
        var out = new Thing(me.contents[0], me.contents[1], me.contents[2]);
        addThing(out, me.left, me.top);
        setMidXObj(out, me, true);
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
  me.element.className += " used";
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
        shards[i] = new Thing(BrickShard);
        characters.push(shards[i]);
        placeThing(shards[i], me.left + (i < 2) * me.width * unitsize - unitsizet2,
          me.top + (i % 2) * me.height * unitsize - unitsizet2);
        shards[i].xvel = unitsized2 - unitsize * (i > 1);
        shards[i].yvel = unitsize * -1.4;
      }
    },
    0,
    me
  );
}
// Listed in characters because of gravity. Has nocollide, so it's ok
function BrickShard(me) {
  me.width = me.height = 4;
  me.nocollide = true;
  me.movement = false;
  me.death = killNormal;
  setSolid(me, "brickshard");
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
  me.element.className += " used";
  if(mario.power > 1 && me.contents[0] == Mushroom && !me.contents[1]) me.contents[0] = FireFlower;
  addEvent(
    function(me) {
      var out = new Thing(me.contents[0], me.contents[1], me.contents[2]);
      addThing(out, me.left, me.top);
      setMidXObj(out, me, true);
      out.animate(out, me);
    },
    7,
    me
  );
}

function Pipe(me, height, transport) {
  me.width = 16;
  me.height = height;
  if(transport) {
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
  if(locnum == -1) me.height = 72;
  else me.height = 0;
  me.counter = 0;
  me.tolx = unitsizet4;
  me.animate = attachEmerge;
  me.movement = vineEmerge;
  me.collide = touchVine;
  setSolid(me, "vine");
}

function vineEmerge(me) {
  me.movement = vineMovement;
  play("Vine Emerging.wav");
}

function vineMovement(me) {
  if(++me.counter >= 700) return me.movement = false;
  
  me.height += .25;
  me.top -= unitsized4;
  updateDisplay(me);
  updateSize(me);
  
  if(me.attached) shiftVert(me.attached, -1 * unitsized4, true);
}

function touchVine(me, vine) {
  if(me.type != "mario" || me.attached) return;
  vine.attached = me;
  
  me.attached = vine;
  me.nofall = true;
  me.xvel = me.yvel = me.resting = me.jumping = me.jumpcount = me.running = 0;
  me.attachoff = !objectToLeft(me, vine) * 2 - 1;
  me.movementsave = me.movement;
  me.movement = moveMarioVine;
  me.keys = new Keys();
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
  if(me.yvel >= 0 && me.type == "mario" && !spring.tension && characterOnSolid(me, spring))
    return springMarioInit(spring, me);
  return characterTouchedSolid(me, spring);
}
function springMarioInit(spring, mario) {
  spring.tension = spring.tensionsave = mario.yvel * 1.75;
  mario.movement = moveMarioSpringDown;
  mario.spring = spring;
  mario.xvel /= 2.1;
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
      mario.yvel = Math.max(unitsizet2 * -1, spring.tensionsave * -.98);
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

function Stone(me, height) {
  me.width = 8;
  me.height = 8 * height;
  setSolid(me, "stone");
}

function GenericStone(me, width, height) {
  me.width = (width * 8) || 8;
  me.height = (height * 8) || 8;
  setSolid(me, "GenericStone");
}

function CastleBlock(me, length, dt) { // dt = change(theta)
  me.width = me.height = 8;
  if(length) {
    me.balls = new Array(length);
    me.dt = dt || 1;
    me.movement = castleBlockSpawn;
    me.timer = me.counter = 0;
    me.angle = .25;
  }
  setSolid(me, "castleblock");
  me.element.style.backgroundSize = (unitsizet8) + "px";
}
function CastleFireBall(me, distance) {
  me.width = me.height = 4;
  me.deadly = me.nofire = true;
  me.movement = function() {};
  me.collide = collideEnemy;
  setSolid(me, "fireball castle");
}
function castleBlockSpawn(me) {
  me.movement = castleBlockSpin;
  for(var i=0; i<me.balls.length; ++i) {
    spawn = new Thing(CastleFireBall, i * 4);
    var mid = me.width * unitsized4, midx = me.left + mid, midy = me.top + mid;
    me.balls[i] = addThing(spawn, midx + i * unitsize * 3, midy + i * unitsize * 3);
  }
}
function castleBlockSpin(me) {
  if(++me.counter != 14) return;
  me.midx = me.left;// + me.width * unitsize / 2;
  me.midy = me.top;// + me.height * unitsize / 2;
  me.counter = 0;
  me.angle += .0875;
  // Skip i=0 because it doesn't move
  for(var i=0; i<me.balls.length; ++i) {
    // cos is x-loc
    setMidX(me.balls[i], me.midx + (i) * unitsizet4 * Math.cos(me.angle * Math.PI), true);
    setMidY(me.balls[i], me.midy + (i) * unitsizet4 * Math.sin(me.angle * Math.PI), true);
  }
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
  me.width = 16;
  me.height = 8;
  me.collide = CastleAxeFalls;
  setSolid(me, "castleaxe");
}
function CastleAxeFalls(me, axe) {
  if(me.type != "mario" ||
    me.right < axe.left + unitsize || me.bottom > axe.bottom - unitsized2) return;
  me.collide = function() {};
  pause();
  nokeys = true;
  killNormal(axe);
  me.keys.jump = me.jumpcount = me.xvel = me.yvel =
    axe.bowser.xvel = axe.bowser.yvel = axe.bowser.movement = 0;
  setTimeout(function() {
    var i, width = axe.bridge.width;
    killNormal(axe.chain);
    axe.bowser.element.className += " owned";
    for(i=1; i<=width; ++i)
      setTimeout(function() { 
        --axe.bridge.width;
        axe.bridge.right -= unitsize;
        updateSize(axe.bridge, true);
      }, timer * i);
    setTimeout(function() {
      removeClass(axe.bowser, "owned");
      mario.keys.run = 1;
      mario.maxspeed = mario.walkspeed;
      unpause();
      var noise = play("Bowser Falls.wav", true, false);
      noise.addEventListener('ended', function () {
        play("World Clear.wav", true, false);
      } );
    }, timer * (width - 7));
  }, timer * 14);
}

function TreeTop(me, width) {
  // Tree trunks are scenery
  me.width = width * 8;
  me.height = 8;
  setSolid(me, "treetop");
}

// for the floaty ones, if the yvel is really big, +1000 points
function Platform(me, width, settings) {
  me.width = width * 4;
  me.height = 4;
  // To do: make this instanceof(Function)
  if(settings == moveFalling) settings  = [settings];
  if(settings instanceof Array) {
    me.movement = settings[0];
    me.begin = settings[1] * unitsize;
    me.end = settings[2] * unitsize;
    me.maxvel = settings[3] * unitsized4;
    if(me.movement == moveFloating || me.movement == movePlatformSpawn)
      me.yvel = me.maxvel; else me.xvel = me.maxvel;
    me.changing = 0; // 0 for normal, |1| for forward/back, |2| for waiting
  } 
  setSolid(me, "platform");
}
function PlatformGenerator(me, width, dir) {
  me.interval = 64;
  me.width = width * 4;
  me.height = me.interval * 7;
  me.dir = dir;
  me.nocollide = true;
  me.list = new JSList();
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
    me.list.addNode(me.platlast);
    i += me.interval;
  }
  me.movement = false;
}
function movePlatformSpawn(me) {
  // This is like movePlatformNorm, but also checks for whether it's out of bounds
  // Assumes it's been made with a PlatformGenerator as the parent
  // To do: make the PlatformGenerator check one at a time, not each of them.
  if(me.bottom < me.parent.top) {
    setBottom(me, me.parent.bottom, true);
    detachMario(me);
  }
  else if(me.top > me.parent.bottom) {
    setTop(me, me.parent.top, true);
    detachMario(me);
  }
  else movePlatformNorm(me);
}
function movePlatformNorm(me) {
  shiftHoriz(me, me.xvel);
  shiftVert(me, me.yvel, true);
  if(me == mario.resting && me.alive) {
    setBottom(mario, me.top);
    shiftHoriz(mario, me.xvel, true);
  }
}
function detachMario(me) {
  if(mario.resting != me) return;
  mario.resting = false;
}
function PlatformTransport(me, width, name) {
  me.height = 4;
  me.width = width * 4;
  me.moving = 0;
  me.collide = collideTransport;
  setSolid(me, "platform");
  if(name) me.element.className += " " + name;
}
// three background images, like tree
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
  if(me.type != "mario") return killNormal(me);
  pause();
  updateAllDisplays();
  mario.xvel = mario.yvel = mario.keys.up = mario.keys.jump = map.canscroll = 0;
  nokeys = notime = 1;
  setRight(me, detector.pole.left, true);
  removeClass(me, "running");
  removeClass(me, "jumping");
  me.element.className += " climbing";
  play("Flagpole.wav", true);
  var mebot = false, flagbot = false;
  var down = setInterval(function() {
    // Move mario until he hits the bottom, at which point mebot = true
    if(!mebot) {
      if(me.bottom >= detector.stone.top) {
        mebot = true;
        setBottom(me, detector.stone.top, true);
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
function FlagOff(me, pole) {
  me.element.className += " flipped";
  setLeft(me, pole.right, true);
  mario.keys.run = 1;
  me.element.className += " running";
  mario.maxspeed = mario.walkspeed;
  setTimeout(function() {
    play("Stage Clear.wav", true);
    unpause();
    removeClass(me, "climbing");
    removeClass(me, "flipped");
  }, timer * 14);
}
function endLevelPoints(me, detector) {
  killNormal(detector);
  pause();
  var numfire = data.time.amount + "";
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

/*
 * Scenery & etc
 */
function loadScenery() {
  this.sprites = {
    "Bush1": [16, 8],
    "Bush2": [24, 8],
    "Bush3": [32, 8],
    "Cloud1": [16, 12],
    "Cloud2": [24, 12],
    "Cloud3": [32, 12],
    "Cloud3": [32, 12],
    "HillSmall": [24, 9.5],
    "HillLarge": [40, 17.5],
    "Fence": [8,8],
    "PlantSmall": [7, 15],
    "PlantLarge": [8, 23],
    "HillLarge": [40, 17.5],
    "TreeTrunk": [8, 8],
    "Castle": [72, 88],
    "CastleWall": [8, 48],
    "Railing": [4, 4],
    "String": [4, 4],
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
    ]
  };
  processSceneryPatterns(this.patterns);
}

function processSceneryPatterns(patterns) {
  var current;
  for(var i in patterns) {
    current = patterns[i];
    if(!current.length) continue;
    // The last arry in current should be ["blank", width]
    current.width = current[current.length - 1][1];
    current.pop();
  }
}

function Sprite(me, name, reps) {
  repx = reps[0] || 1; repy = reps[1] || 1;
  template = Scenery.sprites[name];
  me.width = template[0] * repx;
  me.height = template[1] * repy;
  me.nocollide = true;
  setSolid(me, "solid scenery " + name);
}

function text(me, settings) {
  me.width = settings[0];
  me.height = settings[1];
  me.element.innerHTML = settings[2];
  if(settings[3]) me.element.style.visibility = "hidden";
  me.nocollide = true;
  setSolid(me, "text");
}

function LocationShifter(me, locnum, size) {
  me.locnum = locnum;
  me.width = size[0];
  me.height = size[1];
  me.collide = collideLocationShifter;
  setSolid(me, "blue");
}
function collideLocationShifter(me, shifter) {
  shifter.collide = false;
  addEvent(
    function(me) {
      locMovePreparations(me);
      shiftToLocation(map.locs[shifter.locnum]);
    },
    7,
    me
  );
}

function ScrollBlocker(me) {
  me.width = 8;
  me.height = screen.height;
  me.nocollide = true;
  me.movement = function() {
    if(me.left - mario.xvel <= screen.right - screen.left) {
      map.canscroll = false;
      me.movement = false;
    }
  }
  setSolid(me, "scrollblocker");
}