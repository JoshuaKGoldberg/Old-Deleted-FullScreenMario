/* Things.js */
// Stores Thing creators, functions, and manipulators

/* Typical Things */
// There is a lot of information stored in each of these.
// Variable amounts of arguments are passed to the constructor:
// * var mything = new Thing(ConstructionFunc[, arg1[, arg2[, ...]]]);
// * var mygoomb = new Thing(Goomba);
// * var mykoopa = new Thing(Koopa, true);
function Thing(type) {
  // If there isn't a type, don't do anything
  if(arguments.length == 0 || !type) return;
  
  // Otherwise make this based off the type
  // Make sure this is legally created
  var self = this === window ? new Thing() : this,
      args = self.args = arrayMake(arguments);
  args[0] = self;
  type.apply(self, args);
  self.alive = true;
  self.placed = this.outerok = 0;
  self.xvel = this.xvel || 0;
  self.yvel = this.yvel || 0;
  if(self.tolx == null) self.tolx = 0;
  if(self.toly == null) self.toly = unitsized8;
  
  self.movement = self.movement; // why..?
  self.collide = self.collide || function() {}; // To do: why does taking this out mess things up?
  self.death = self.death || killNormal;
  self.animate = self.animate || emergeUp;
  
  if(self.width * unitsize < quads.width && self.height * unitsize < quads.height)
    self.maxquads = 4; // self could be done with modular stuff... beh
  else self.maxquads = quads.length;
  
  self.quads = new Array(self.maxquads)
  self.overlaps = [];
  
  self.title = self.title || type.name;
  self.spritewidth = self.spritewidth || self.width;
  self.spriteheight = self.spriteheight || self.height;
  self.sprite = "";
  
  try { setContextStuff(self, self.spritewidth, self.spriteheight); }
  catch(err) {
    log("Thing context fail", err, self.title, self);
    setTimeout(function() { setContextStuff(self, self.spritewidth, self.spriteheight); }, 1);
  }
  
  return self;
}

function setContextStuff(me, spritewidth, spriteheight) {
  me.spritewidthpixels = me.spritewidth * unitsize;
  me.spriteheightpixels = me.spriteheight * unitsize;
  me.canvas = getCanvas(me.spritewidthpixels, me.spriteheightpixels);
  me.context = me.canvas.getContext("2d");
  me.imageData = me.context.getImageData(0, 0, me.spritewidthpixels, me.spriteheightpixels);
  me.sprite_type = me.sprite_type || "neither";
  canvasDisableSmoothing(me, me.context);
}

// A helper function to make a Thing given the type and arguments
function ThingCreate(type, args) {
  var newthing = new Thing();
  Thing.apply(newthing, [type].concat(args));
  return newthing;
}

/* Thing Functions */

function setCharacter(me, type) {
  me.type = type.split(" ")[0]; // so 'shell smart' becomes 'shell'
  me.resting = me.under = me.undermid = false;
  me.alive = me.character = true;
  me.libtype = "characters";
  setClassInitial(me, "character " + type);
}

function setSolid(me, name) {
  me.type = "solid";
  me.name = name;
  me.solid = me.alive = true;
  me.speed = me.speed || 0; // vertical speed
  me.collide = me.collide || characterTouchedSolid;
  me.bottomBump = me.bottomBump ||  function() { /*play("Bump");*/ };
  me.action = me.action || function() {};
  me.jump = me.jump || function() {};
  me.spritewidth = me.spritewidth || 8;
  me.spriteheight = me.spriteheight || 8;
  me.libtype = "solids";
  setClassInitial(me, "solid " + name);
}

function setScenery(me, name) {
  setSolid(me, name);
  me.libtype = "scenery";
}

// The primary function for placing a thing on the map
function addThing(me, left, top) {
  // If me is a function (e.g. 'addThing(Goomba, ...)), make a new thing with that
  if(me instanceof Function) {
    me = new Thing(me);
  }
  placeThing(me, left, top);
  window[me.libtype].push(me);
  me.placed = true;
  determineThingQuadrants(me);
  if(me.onadding) me.onadding(); // generally just for sprite cycles
  setThingSprite(me);
  window["last_" + (me.title || me.group || "unknown")] = me;
  return me;
}
// Called by addThing for simple placement
function placeThing(me, left, top) {
  setLeft(me, left);
  setTop(me, top);
  updateSize(me);
  return me;
}

function addText(html, left, top) {
  var element = createElement("div", {innerHTML: html, className: "text",
    left: left,
    top: top,
    onclick: body.onclick || canvas.onclick, 
    style: {
      marginLeft: left + "px",
      marginTop: top + "px"
    }});
  body.appendChild(element);
  texts.push(element);
  return element;
}
// Called by funcSpawner placed by pushPreText
// Kills the text once it's too far away
function spawnText(me, settings) {
  var element = me.element = addText("", me.left, me.top);
  if(typeof(settings) == "object") proliferate(element, settings);
  else element.innerHTML = settings;
  me.movement = false;
}

// Set at the end of shiftToLocation
function checkTexts() {
  var delx = quads.delx,
      element, me, i;
  for(i = texts.length - 1; i >= 0; --i) {
    me = texts[i]
    element = texts[i].element || me;
    me.right = me.left + element.clientWidth
    if(me.right < delx) {
      body.removeChild(element);
      killNormal(me);
      deleteThing(element, texts, i);
    }
  }
}


// To do: make this use a variable number of arguments!
function pushPreThing(type, xloc, yloc, extras, more) {
  var prething = new PreThing(map.refx + xloc, map.refy - yloc, type, extras, more);
  if(prething.object.solid) {
    map.area.width = max(map.area.width, prething.xloc + prething.object.width);
    map.area.presolids.push(prething);
  }
  else map.area.precharacters.push(prething);
  return prething;
}

/*
 * Characters (except Mario, who has his own .js)
 */
 

/*
 * Items
 */

function Mushroom(me, type) {
  me.group = "item";
  me.width = me.height = 8;
  me.speed = .42 * unitsize;
  me.animate = emergeUp;
  me.movement = moveSimple;
  me.collide = collideFriendly;
  me.jump = mushroomJump;
  me.death = killNormal;
  me.nofire = true;
  
  var name = "mushroom";
  switch(type) {
    case 1: me.action = gainLife; name += " gainlife"; break;
    case -1: me.action = killMario; name += " death"; break;
    default: me.action = marioShroom; name += " regular"; break;
  }
  setCharacter(me, name);
}

function mushroomJump(me) {
  me.yvel -= unitsize * 1.4;
  me.top -= unitsize;
  me.bottom -= unitsize;
  updatePosition(me);
}

function FireFlower(me) {
  me.group = "item";
  me.width = me.height = 8;
  me.animate = emergeUp;
  me.collide = collideFriendly;
  me.action = marioShroom;
  me.nofall = me.nofire = true;
  me.movement = false;
  setCharacter(me, "fireflower");
  TimeHandler.addSpriteCycle(me, ["one", "two", "three", "four"]);
}

function FireBall(me, moveleft) {
  me.group = "item";
  me.width = me.height = 4;
  me.speed = unitsize * 1.75;
  me.gravity = gravity * 1.56;
  me.jumpheight = unitsize * 1.56;
  me.nofire = me.nostar = me.collide_primary = true;
  me.moveleft = moveleft;
  me.animate = emergeFire;
  me.movement = moveJumping;
  me.collide = fireEnemy;
  me.death = fireExplodes;
  setCharacter(me, "fireball");
  TimeHandler.addSpriteCycle(me, ["one", "two", "three", "four"], 4);
}
function fireEnemy(enemy, me) {
  if(!me.alive || me.emerging || enemy.nofire || enemy.height <= unitsize) return;

  if(enemy.solid) {
    playLocal("Bump", me.right);
  }
  else {
    playLocal("Kick", me.right);
    enemy.death(enemy, 2);
    scoreEnemyFire(enemy);
  }
  me.death(me);
}
function fireDeleted() {
  --mario.numballs;
}
function fireExplodes(me) {
  var fire = new Thing(Firework);
  addThing(fire, me.left - fire.width / 2, me.top - fire.height / 2);
  fire.animate();
  killNormal(me);
}

function Star(me) { // GOLDEEN GOLDEEN
  me.group = "item";
  me.width = 7;
  me.height = 8;
  me.speed = unitsize * .56;
  me.jumpheight = unitsize * 1.17;
  me.gravity = gravity / 2.8;
  me.animate = emergeUp;
  me.movement = moveJumping;
  me.collide = collideFriendly;
  me.action = marioStar;
  me.death = killNormal;
  me.nofire = true;
  setCharacter(me, "star item"); // Item class so mario's star isn't confused with this
  TimeHandler.addSpriteCycle(me, ["one", "two", "three", "four"], 0, 7);
}

function Shell(me, smart) {
  me.width = 8; me.height = 7;
  me.group = "item";
  me.speed = unitsizet2;
  me.collide_primary = true;
  me.moveleft = me.xvel = me.move = me.hitcount = me.peeking = me.counting = me.landing = me.enemyhitcount = 0;
  me.smart = smart;
  me.movement = moveShell;
  me.collide = hitShell;
  me.death = killFlip;
  me.spawntype = Koopa;
  var name = "shell" + (smart ? " smart" : " dumb");
  setCharacter(me, name);
}
function hitShell(one, two) {
  // Assuming two is shell
  if(one.type == "shell" && two.type != one.type) return hitShell(two, one);
  
  switch(one.type) {
    // Hitting a wall
    case "solid": 
      if(two.right < one.right) {
        playLocal("Bump", one.left);
        setRight(two, one.left);
        two.xvel = -two.speed;
        two.moveleft = true;
      } else {
        playLocal("Bump", one.right);
        setLeft(two, one.right);
        two.xvel = two.speed;
        two.moveleft = false;
      }
    break;
    
    // Hitting Mario
    case "mario":
      var shelltoleft = objectToLeft(two, one),
          mariojump = one.yvel > 0 && one.bottom <= two.top + unitsizet2;
      
      // Star Mario is pretty easy
      if(one.star) {
        scoreMarioShell(one, two);
        return two.death(two, 2);
      }
      
      // If the shell is already being landed on by Mario:
      if(two.landing) {
        // If the recorded landing direction hasn't changed:
        if(two.shelltoleft == shelltoleft) {
          // Increase the landing count, and don't do anything.
          ++two.landing;
          // If it's now a count of 1, score the shell
          if(two.landing == 1) scoreMarioShell(one, two);
          // Reduce that count very soon
          TimeHandler.addEvent(function(two) { --two.landing; }, 2, two);
        }
        // Otherwise, the shell has reversed direction during land. Mario should die.
        else {
          // This prevents accidentally scoring Mario's hit
          mario.death(mario);
        }
        return;
      }
      
      // Mario is kicking the shell (either hitting a still shell or jumping onto a shell)
      if(two.xvel == 0 || mariojump) {
        // Mario has has hit the shell in a dominant matter. You go, Mario!
        two.counting = 0;
        scoreMarioShell(one, two);
        // The shell is peeking
        if(two.peeking) {
          two.peeking = false;
          removeClass(two, "peeking");
          two.height -= unitsized8;
          updateSize(two);
        }
        
        // If the shell's xvel is 0 (standing still)
        if(two.xvel == 0) {
          if(shelltoleft) {
            two.moveleft = true;
            two.xvel = -two.speed;
          } else {
            two.moveleft = false;
            two.xvel = two.speed;
          }
          // Make sure to know not to kill Mario too soon
          ++two.hitcount;
          TimeHandler.addEvent(function(two) { --two.hitcount; }, 2, two);
        }
        // Otherwise set the xvel to 0
        else two.xvel = 0;
        
        // Mario is landing on the shell (movements, xvels already set)
        if(mariojump) {
          play("Kick");
          // The shell is moving
          if(!two.xvel) {
            jumpEnemy(one, two);
            one.yvel *= 2;
            scoreMarioShell(one, two);
            setBottom(one, two.top - unitsize, true);
          }
          // The shell isn't moving
          else {
            // shelltoleft ? setRight(two, one.left) : setLeft(two, one.right);
            scoreMarioShell(one, two);
          }
          ++two.landing;
          two.shelltoleft = shelltoleft;
          TimeHandler.addEvent(function(two) { --two.landing; }, 2, two);
        }
      }
      else {
        // Since the shell is moving and Mario isn't, if the xvel is towards Mario, that's a death
        if(!two.hitcount && ((shelltoleft && two.xvel < 0) || (!shelltoleft && two.xvel > 0)))
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
            
            play("Kick");
            score(one, findScore(two.enemyhitcount), true);
            ++two.enemyhitcount;
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
  if(two.action) two.action(one);
  two.death(two);
}

/*
 * Enemies
 */
function jumpEnemy(me, enemy) {
  if(me.keys.up) me.yvel = unitsize * -1.4;
  else me.yvel = unitsize * -.7;
  me.xvel *= .91;
  play("Kick");
  if(enemy.group != "item" || enemy.type == "shell")
    score(enemy, findScore(me.jumpcount++ + me.jumpers), true);
  ++me.jumpers;
  TimeHandler.addEvent(function(me) { --me.jumpers; }, 1, me);
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
  setCharacter(me, "goomba");
  TimeHandler.addSpriteCycleSynched(me, [unflipHoriz, flipHoriz]);
}
// Big: true if it should skip squash (fire, shell, etc)
function killGoomba(me, big) {
  if(!me.alive) return;
  if(!big) {
    var squash = new Thing(DeadGoomba);
    addThing(squash, me.left, me.bottom - squash.height * unitsize);
    TimeHandler.addEvent(killNormal, 21, squash);
    killNormal(me);
  }
  else killFlip(me);
}
function DeadGoomba(me) {
  me.width = 8;
  me.height = 4;
  me.movement = false;
  me.nocollide = me.nocollide = true;
  me.death = killNormal;
  setSolid(me, "deadGoomba");
}

// If fly == true, then it's jumping
// If fly is otherwise true (an array), it's floating
function Koopa(me, smart, fly) {
  me.width = 8;
  me.height = 12;
  me.speed = me.xvel = unitsize * .21;
  me.moveleft = me.skipoverlaps = true;
  me.group = "enemy";
  me.smart = smart; // will it run off the edge
  var name = "koopa"; 
  name += (me.smart ? " smart" : " dumb");
  if(me.smart) name+= " smart";
  if(fly) {
    name += " flying";
    me.winged = true;
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
      me.changing = me.xvel = 0;
      me.yvel = me.maxvel = unitsized4;
    }
  }
  else {
    name += " regular";
    if(me.smart) me.movement = moveSmart;
    else me.movement = moveSimple;
  }
  me.collide = collideEnemy;
  me.death = killKoopa; 
  setCharacter(me, name);
  TimeHandler.addSpriteCycleSynched(me, ["one", "two"]);
  me.toly = unitsizet2;
}
// Big: true if it should skip shell (fire, shell, etc)
function killKoopa(me, big) {
  if(!me.alive) return;
  var spawn;
  if((big && big != 2) || me.winged) spawn = new Thing(Koopa, me.smart);
  else spawn = new Thing(Shell, me.smart);
  // Puts it on stack, so it executes immediately after upkeep
  TimeHandler.addEvent(
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
  me.height = 12;
  me.counter = 0;
  me.countermax = me.height * unitsize;
  me.dir = unitsized8;
  me.toly = unitsizet8;
  me.nofall = me.deadly = me.nocollidesolid = me.repeat = true;
  me.group = "enemy";
  me.collide = collideEnemy;
  me.death = killNormal;
  me.movement = movePirhanaInit;
  me.death = killPirhana;
  setCharacter(me, "pirhana");
}
// The visual representation of a pirhana is visual_scenery; the collider is a character
function movePirhanaInit(me) {
  me.hidden = true;
  var scenery = me.visual_scenery = new Thing(Sprite, "Pirhana");
  addThing(scenery, me.left, me.top);
  TimeHandler.addSpriteCycle(scenery, ["one", "two"]);
  me.movement = movePirhanaNew;
  // Pirhanas start out minimal
  movePirhanaNew(me, me.height * unitsize);
}
// Moving a pirhana moves both it and its scenery
function movePirhanaNew(me, amount) {
  amount = amount || me.dir;
  me.counter += amount;
  shiftVert(me, amount);
  shiftVert(me.visual_scenery, amount);
  
  // Height is 0
  if(me.counter <= 0 || me.counter >= me.countermax) {
    me.movement = false;
    me.dir *= -1;
    TimeHandler.addEvent(movePirhanaRestart, 35, me);
  }
}
function movePirhanaRestart(me) {
  var marmid = getMidX(mario);
  // If Mario's too close and counter == 0, don't do anything
  if(me.counter >= me.countermax && marmid > me.left - unitsizet8 && marmid < me.right + unitsizet8) {
    setTimeout(movePirhanaRestart, 7, me);
    return;
  }
  // Otherwise start again
  me.movement = movePirhanaNew;
}
function killPirhana(me) {
  if(!me && !(me = this)) return;
  killNormal(me);
  killNormal(me.visual_scenery);
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
    if(one.collide_primary) return one.collide(two, one);
    // if(two.height < unitsized16 || two.width < unitsized16) return;
    return;
  }
  
  // Mario on top of enemy
  if(!map.underwater && one.mario && ((one.star && !two.nostar) || (!two.deadly && objectOnTop(one, two)))) {
    // Enforces toly
    if(marioAboveEnemy(one, two)) return;
    // Mario is on top of them (or star):
    if(one.mario && !one.star) TimeHandler.addEvent(function(one, two) { jumpEnemy(one, two); }, 0, one, two);
    else two.nocollide = true;
    // Kill the enemy
    //// If killed returns a Thing, then it's a shell
    //// Make sure Mario isn't immediately hitting the shell
    var killed = two.death(two, one.star * 2);
    if(one.star) scoreEnemyStar(two);
    else {
      scoreEnemyStomp(two);
      /*TimeHandler.addEvent(function(one, two) { */setBottom(one, min(one.bottom, two.top + unitsize));/* }, 0, one, two);*/
    }
    // Make Mario have the hopping thing
    addClass(one, "hopping");
    removeClasses(one, "running skidding jumping one two three")
    // addClass(one, "running three");
    one.hopping = true;
    if(mario.power == 1)  setMarioSizeSmall(one);
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
  
  setCharacter(me, "podoboo");
}
function movePodobooInit(me) {
  if(!characterIsAlive(me)) return;
  // For the sake of the editor, flip this & make it hidden on the first movement
  // flipVert(me);
  me.hidden = true;
  me.heightnorm = me.top;
  me.heightfall = me.top - me.jumpheight;
  TimeHandler.addEvent(podobooJump, me.betweentime, me);
  me.movement = false;
}
function podobooJump(me) {
  if(!characterIsAlive(me)) return;
  unflipVert(me);
  me.yvel = me.speed + me.gravity;
  me.movement = movePodobooUp;
  me.hidden = false;
  
  // Sadly, this appears to be occasionally necessary
  setThingSprite(me);
}
function movePodobooUp(me) {
  shiftVert(me, me.speed, true);
  if(me.top - gamescreen.top > me.heightfall) return;
  me.nofall = false;
  me.movement = movePodobooSwitch;
}
function movePodobooSwitch(me) {
  if(me.yvel <= 0) return;
  flipVert(me);
  me.movement = movePodobooDown;
}
function movePodobooDown(me) {
  if(me.top < me.heightnorm) return;
  setTop(me, me.heightnorm, true);
  me.movement = false;
  me.nofall = me.hidden = true;
  me.heightfall = me.top - me.jumpheight;
  TimeHandler.addEvent(podobooJump, me.betweentime, me);
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
  TimeHandler.addSpriteCycle(me, ["one", "two"]);
  TimeHandler.addEvent(throwHammer, 35, me, 7);
  TimeHandler.addEventInterval(jumpHammerBro, 140, Infinity, me);
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
  TimeHandler.addEvent(function(me) {
    if(count != 3) {
      if(!characterIsAlive(me)) return;
      // Throw the hammer...
      switchClass(me, "throwing", "thrown");
      // var hammer = new Thing(Hammer, me.lookleft);
      addThing(new Thing(Hammer, me.lookleft), me.left - unitsizet2, me.top - unitsizet2);
      // ...and go again
    }
    if(count > 0) TimeHandler.addEvent(throwHammer, 7, me, --count);
    else {
      TimeHandler.addEvent(throwHammer, 70, me, 7);
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
    TimeHandler.addEvent(function(me) { me.falling = false; }, 42, me);
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
  TimeHandler.addSpriteCycle(me, ["one", "two", "three", "four"], 3);
}

function Cannon(me, height, nofire) {
  me.width = 8;
  me.height = (height || 1) * 8;
  me.spriteheight = 16;
  if(!nofire) me.movement = moveCannonInit;
  me.timer = 117;
  me.repeat = true;
  setSolid(me, "cannon");
}
function moveCannonInit(me) {
  TimeHandler.addEventInterval(
    function(me) {
      if(mario.right > me.left - unitsizet8 && mario.left < me.right + unitsizet8)
        return; // don't fire if Mario is too close
      var spawn = new Thing(BulletBill);
      if(objectToLeft(mario, me)) {
        addThing(spawn, me.left, me.top);
        spawn.direction = spawn.moveleft = true;
        spawn.xvel *= -1;
        flipHoriz(spawn);
      }
      else addThing(spawn, me.left + me.width, me.top);
      playLocal("Bump", me.right);
    }, 270, Infinity, me);
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
  me.killonend = freezeBowser;
  me.counter = -.7;
  me.group = "enemy";
  me.movement = moveBowserInit;
  me.collide = collideEnemy;
  me.death = killBowser;
  setCharacter(me, "bowser");
  TimeHandler.addSpriteCycle(me, ["one", "two"]);
  if(hard) TimeHandler.addEvent(throwHammer, 35, me, 7);
}
function moveBowserInit(me) {
  TimeHandler.addEventInterval(bowserJumps, 117, Infinity, me);
  TimeHandler.addEventInterval(bowserFires, 280, Infinity, me);
  TimeHandler.addEventInterval(bowserFires, 350, Infinity, me);
  TimeHandler.addEventInterval(bowserFires, 490, Infinity, me);
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
  TimeHandler.addEventInterval(function(me) {
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
  playLocal("Bowser Fires", me.left);
  // After a little bit, open and fire
  TimeHandler.addEvent(function(me) {
    var top = me.top + unitsizet4,
        fire = new Thing(BowserFire, roundDigit(mario.bottom, unitsizet8));
    removeClass(me, "firing");
    addThing(fire, me.left - unitsizet8, top);
    play("Bowser Fires");
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
// For when the axe is hit
function freezeBowser(me) {
  me.movement = false;
  thingStoreVelocity(me);
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
  TimeHandler.addSpriteCycle(me, [unflipVert, flipVert]);
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
  me.spritewidth = me.spriteheight = 1 / scale;
  me.repeat = true;
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
  if(me.squeeze != 2) addClass(me, "squeeze");
  // if(!me.squeeze) me.yvel = 0;
  me.squeeze = 2;
  me.xvel /= 1.17;
  setHeight(me, 10, true, true);
  // (104 (map.floor) - 12 (blooper.height) - 2) * unitsize
  if(me.top > mario.bottom || me.bottom > 360) unsqueezeBlooper(me);
}
function unsqueezeBlooper(me) {
  me.squeeze = false;
  removeClass(me, "squeeze");
  me.counter = 0;
  setHeight(me, 12, true, true);
  // me.yvel /= 3;
}

// Red cheepcheeps are faster
function CheepCheep(me, red, jumping) {
  me.width = me.height = 8;
  me.group = "enemy";
  var name = "cheepcheep " + (red ? "red" : "");
  
  // Doubled for fun! (also editor checking)
  me.red = red;
  setCheepVelocities(me);
  
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
  TimeHandler.addSpriteCycle(me, ["one", "two"]);
}
function setCheepVelocities(me) {
  if(me.red) {
    me.xvel = -unitsized4;
    me.yvel = unitsize / -24;
  } else {
    me.xvel = unitsize / -6;
    me.yvel = -unitsized32;
  }
}
function moveCheepInit(me) {
  setCheepVelocities(me);
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
  return map.zone_cheeps = TimeHandler.addEventInterval(
    function() {
      if(!map.zone_cheeps) return true;
      var spawn = new Thing(CheepCheep, true, true);
      addThing(spawn, Math.random() * mario.left * mario.maxspeed / unitsized2, gamescreen.height * unitsize);
      spawn.xvel = Math.random() * mario.maxspeed;
      spawn.yvel = unitsize * -2.33;
      flipHoriz(spawn);
      spawn.movement = function(me) {
        if(me.top < ceilmax) me.movement = moveCheepJumping; 
        else shiftVert(me, me.yvel);
      };
    }, 21, Infinity
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
  setCharacter(me, "lakitu out");
  map.has_lakitu = me;
}
// The lakitu's position starts to the right of mario ...
function moveLakituInit(me) {
  if(map.has_lakitu && me.norepeat) return killNormal(me);
  TimeHandler.addEventInterval(function(me) {
    if(me.alive) throwSpiny(me);
    else return true;
  }, 140, Infinity, me);
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
  shiftHoriz(me, -unitsize);
}
// Then, once it's close enough, is always relative to mario.
// This fluctuates between +/-32 (* unitsize)
function moveLakitu(me) {
  // If mario is moving quickly to the right, move in front of him and stay there
  if(mario.xvel > unitsized8 && mario.left > gamescreen.width * unitsized2) {
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
  // log("moveLakitu after: " + (me.right - me.left) + "\n");
}
function throwSpiny(me) {
  if(!characterIsAlive(me)) return false;
  switchClass(me, "out", "hiding");
  TimeHandler.addEvent(function(me) {
    if(me.dead) return false;
    var spawn = new Thing(SpinyEgg);
    addThing(spawn, me.left, me.top);
    spawn.yvel = unitsize * -2.1;
    switchClass(me, "hiding", "out");
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
  TimeHandler.addSpriteCycle(me, ["one", "two"]);
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
  TimeHandler.addSpriteCycle(me, ["one", "two"]);
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
  me.width = me.height = 8;
  me.group = "enemy";
  me.speed = me.xvel = unitsize * .21;
  me.moveleft = me.nofire = true;
  me.smart = false;
  me.collide = collideEnemy;
  me.movement = moveSmart;
  me.death = killBeetle;
  setCharacter(me, "beetle");
  // me.toly = unitsizet8;
  TimeHandler.addSpriteCycleSynched(me, ["one", "two"]);
}
// Big: true if it should skip shell (fire, shell, etc)
function killBeetle(me, big) {
  if(!me.alive) return;
  var spawn;
  if(big && big != 2) spawn = new Thing(Koopa, me.smart);
  else spawn = new Thing(BeetleShell, me.smart);
  // Puts it on stack, so it executes immediately after upkeep
  TimeHandler.addEvent(
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
  me.moveleft = me.xvel = me.move = me.hitcount = me.peeking = me.counting = me.landing = me.enemyhitcount = 0;
  me.movement = moveShell;
  me.collide = hitShell;
  me.death = killFlip;
  me.spawntype = Beetle;
  setCharacter(me, "shell beetle");
}

function Coin(me, solid) {
  me.group = "coin";
  me.width = 5;
  me.height = 7;
  me.nofall = me.coin = me.nofire = me.nocollidechar = me.nokillend = me.onlyupsolids = me.skipoverlaps = true;
  me.tolx = 0;
  me.toly = unitsized2;
  me.collide = hitCoin;
  me.animate = coinEmerge;
  me.death = killNormal;
  setCharacter(me, "coin one");
  TimeHandler.addSpriteCycleSynched(me, ["one", "two", "three", "two", "one"]);
  // Enabling solid allows this to deliberately be placed behind characters, for visual reasons (like in 1-3)
  if(solid) me.movement = coinBecomesSolid;
}
function coinBecomesSolid(me) {
  switchContainers(me, characters, solids);
  me.movement = false;
}
function hitCoin(me, coin) {
  if(!me.mario) return;
  play("Coin");
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
function coinEmerge(me, solid) {
  play("Coin");
  removeClass(me, "still");
  switchContainers(me, characters, scenery);
  score(me, 200, false);
  gainCoin();
  me.nocollide = me.alive = me.nofall = me.emerging = true;
  determineThingQuadrants(me);
  
  if(me.blockparent) me.movement = coinEmergeMoveParent;
  else me.movement = coinEmergeMove;
  me.yvel = -unitsize;
  TimeHandler.addEvent(function(me) { me.yvel *= -1; }, 25, me);
  TimeHandler.addEvent(function(me) {
    killNormal(me);
    deleteThing(me, scenery, scenery.indexOf(me));
  }, 49, me);
  TimeHandler.addEventInterval(coinEmergeMovement, 1, Infinity, me, solid);
  TimeHandler.clearClassCycle(me, 0);
  addClass(me, "anim");
  TimeHandler.addSpriteCycle(me, ["anim1", "anim2", "anim3", "anim4", "anim3", "anim2"], 0, 5);
}
function coinEmergeMovement(me, solid) {
  if(!me.alive) return true;
  shiftVert(me, me.yvel);
  // if(solid && solid.alive && me.bottom > solid.bottom || me.top > solid.top) {
    // killNormal(me);
    // return true;
  // }
}

function coinEmergeMove(me) {
  shiftVert(me, me.yvel, true);
}
function coinEmergeMoveParent(me) {
  if(me.bottom >= me.blockparent.bottom) killNormal(me);
  else shiftVert(me, me.yvel, true);
}

/*
 * Mario
 */
 function Mario(me) {
  setMarioSizeSmall(me);
  me.walkspeed = unitsized2;
  me.canjump = me.nofiredeath = me.nofire = me.mario = me.nokillend = 1;
  me.numballs = me.moveleft = me.skidding = me.star = me.dying = me.nofall = me.maxvel = me.paddling = me.jumpers = me.landing = 0;
  me.running = ''; // Evalues to false for cycle checker
  me.power = data.mariopower; // 1 for normal, 2 for big, 3 for fiery
  me.maxspeed = me.maxspeedsave = unitsize * 1.35; // Really only used for timed animations
  me.scrollspeed = unitsize * 1.75;
  me.keys = new Keys();
  me.fire = marioFires;
  me.movement = moveMario;
  me.death = killMario;
  setCharacter(me, "mario normal small still");
  me.tolx = unitsizet2;
  me.toly = 0;
  me.gravity = map.gravity;
  if(map.underwater) {
    me.swimming = true;
    TimeHandler.addSpriteCycle(me, ["swim1", "swim2"], "swimming", 5);
  }  
}

function placeMario(xloc, yloc) {
  clearOldMario();
  window.mario = new Thing(Mario);
  var adder = addThing(mario, xloc || unitsizet16, yloc || (map.floor - mario.height) * unitsize);
  if(data.mariopower >= 2) {
    marioGetsBig(mario, true);
    if(data.mariopower == 3) marioGetsFire(mario, true);
  }
  return adder;
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

// Stores .*vel under .*velold for shroom-style events
function thingStoreVelocity(me, keepmove) {
  me.xvelOld = me.xvel || 0;
  me.yvelOld = me.yvel || 0;
  me.nofallOld = me.nofall || false;
  me.nocollideOld = me.nocollide || false;
  me.movementOld = me.movement || me.movementOld;
  
  me.nofall = me.nocollide = true;
  me.xvel = me.yvel = false;
  if(!keepmove) me.movement = false;
}
// Retrieves .*vel from .*velold
function thingRetrieveVelocity(me, novel) {
  if(!novel) {
    me.xvel = me.xvelOld || 0;
    me.yvel = me.yvelOld || 0;
  }
  me.movement = me.movementOld || me.movement;
  me.nofall = me.nofallOld || false;
  me.nocollide = me.nocollideOld || false;
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
  play("Powerup");
  score(me, 1000, true);
  if(me.power == 3) return;
  me.shrooming = true;
  (++me.power == 2 ? marioGetsBig : marioGetsFire)(me);
  storeMarioStats();
}
// These three modifiers don't change power levels.
function marioGetsBig(me, noanim) {
  setMarioSizeLarge(me);
  me.keys.down = 0;
  removeClasses(mario, "crouching small");
  updateBottom(me, 0);
  updateSize(me);
  if(!noanim) {
    // pause();
    // Mario cycles through 'shrooming1', 'shrooming2', etc.
    addClass(mario, "shrooming");
    var stages = [1,2,1,2,3,2,3];
    for(var i = stages.length - 1; i >= 0; --i)
      stages[i] = "shrooming" + stages[i];
    
    // Clear Mario's movements
    thingStoreVelocity(mario);
    
    // The last event in stages clears it, resets Mario's movements, and stops
    stages.push(function(me, settings) {
      me.shrooming = settings.length = 0;
      addClass(me, "large");
      removeClasses(me, "shrooming shrooming3");
      thingRetrieveVelocity(mario);
      return true;
    });
    
    TimeHandler.addSpriteCycle(me, stages, "shrooming", 6);
  }
  else addClass(me, "large");
}
function marioGetsSmall(me) {
  var bottom = mario.bottom;
  // pause();
  me.keys.down = 0;
  thingStoreVelocity(me);
  addClass(me, "small");
  flicker(me);
  // Step one
  removeClasses(mario, "running skidding jumping fiery");
  addClass(mario, "paddling");
  // Step two (t+21)
  TimeHandler.addEvent(function(mario) {
    removeClass(mario, "large");
    setMarioSizeSmall(mario);
    setBottom(mario, bottom - unitsize);
  }, 21, mario);
  // Step three (t+42)
  TimeHandler.addEvent(function(mario) {
    thingRetrieveVelocity(mario, false);
    mario.nocollidechar = true;
    removeClass(mario, "paddling");
    if(mario.running || mario.xvel) addClass(mario, "running");
    TimeHandler.addEvent(setThingSprite, 1, mario);
  }, 42, mario);
  // Step four (t+70);
  TimeHandler.addEvent(function(mario) {
    mario.nocollidechar = false;
  }, 70, mario);
}
function marioGetsFire(me) {
  removeClass(me, "intofiery");
  addClass(me, "fiery");
  mario.shrooming = false;
}
function setMarioSizeSmall(me) {
  setSize(me, 8, 8, true);
  updateSize(me);
}
function setMarioSizeLarge(me) {
  setSize(me, 8, 16, true);
  updateSize(me);
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
      if(!me.jumping && !map.underwater) {
        switchClass(me, "running skidding", "jumping");
      }
      me.jumping = true;
    }
    if(!map.underwater) {
      var dy = unitsize / (pow(++me.keys.jumplev, map.jumpmod - .0014 * me.xvel));
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
  var decel = 0 ; // (how much to decrease)
  // If a button is pressed, hold/increase speed
  if(me.keys.run != 0 && !me.crouching) {
    var dir = me.keys.run,
        // No sprinting underwater
        sprinting = (me.keys.sprint && !map.underwater) || 0,
        adder = dir * (.098 * (sprinting + 1));
    // Reduce the speed, both by subtracting and dividing a little
    me.xvel += adder || 0;
    me.xvel *= .98;
    decel = .0007;
    // If you're accelerating in the opposite direction from your current velocity, that's a skid
    if(/*sprinting && */signBool(me.keys.run) == me.moveleft) {
      if(!me.skidding) {
        addClass(me, "skidding");
        me.skidding = true;
      }
    }
    // Otherwise make sure you're not skidding
    else if(me.skidding) {
      removeClass(me, "skidding");
      me.skidding = false;
    }
  }
  // Otherwise slow down a bit/*, with a little more if crouching*/
  else {
    me.xvel *= (.98/* - Boolean(me.crouching) * .07*/);
    decel = .035;
  }

  if(me.xvel > decel) me.xvel-=decel;
  else if(me.xvel < -decel) me.xvel+=decel;
  else if(me.xvel!=0) {
	me.xvel = 0;
	if(!window.nokeys && me.keys.run==0) {
      if(me.keys.left_down)me.keys.run=-1;
      else if(me.keys.right_down)me.keys.run=1;
    }  
  }
  
  // Movement mods
  // Slowing down
  if(Math.abs(me.xvel) < .14) {
    if(me.running) {
      me.running = false;
      if(mario.power == 1) setMarioSizeSmall(me);
      removeClasses(me, "running skidding one two three");
      addClass(me, "still");
      TimeHandler.clearClassCycle(me, "running");
    }
  }
  // Not moving slowly
  else if(!me.running) {
    me.running = true;
    switchClass(me, "still", "running");
    marioStartRunningCycle(me);
    if(me.power == 1) setMarioSizeSmall(me);
  }
  if(me.xvel > 0) {
    me.xvel = min(me.xvel, me.maxspeed);
    if(me.moveleft && (me.resting || map.underwater)) {
      unflipHoriz(me);
      me.moveleft = false;
    }
  }
  else if(me.xvel < 0) {
    me.xvel = max(me.xvel, me.maxspeed * -1);
    if(!me.moveleft && (me.resting || map.underwater)) {
      flipHoriz(me);
      me.moveleft = true;
    }
  }
  
  // Resting stops a bunch of other stuff
  if(me.resting) {
    // Hopping
    if(me.hopping) {
      removeClass(me, "hopping");
      if(me.xvel) addClass(me, "running");
      me.hopping = false;
    }
    // Jumping
    me.keys.jumplev = me.yvel = me.jumpcount = 0;
    if(me.jumping) {
      me.jumping = false;
      removeClass(me, "jumping");
      if(me.power == 1) setMarioSizeSmall(me);
      addClass(me, abs(me.xvel) < .14 ? "still" : "running");
    }
    // Paddling
    if(me.paddling) {
      me.paddling = me.swimming = false;
      removeClasses(me, "paddling swim1 swim2");
      TimeHandler.clearClassCycle(me, "paddling");
      addClass(me, "running");
    }
  }
  if(isNaN(me.xvel)) debugger;
}

// Gives Mario visual running
function marioStartRunningCycle(me) {
  // setMarioRunningCycler sets the time between cycles
  me.running = TimeHandler.addSpriteCycle(me, ["one", "two", "three", "two"], "running", setMarioRunningCycler);
}
// Used by Mario's running cycle to determine how fast he should switch between sprites
function setMarioRunningCycler(event) {
  event.timeout = 5 + ceil(mario.maxspeedsave - abs(mario.xvel));
}

function marioPaddles(me) {
  if(!me.paddling) {
    removeClasses(me, /*"running */"skidding paddle1 paddle2 paddle3 paddle4 paddle5");
    addClass(me, "paddling");
    TimeHandler.clearClassCycle(me, "paddling_cycle");
    TimeHandler.addSpriteCycle(me, ["paddle1", "paddle2", "paddle3", "paddle3", "paddle2", "paddle1", function() { return me.paddling = false; }], "paddling_cycle", 5);
  }
  me.paddling = me.swimming = true;
  me.yvel = unitsize * -.84;
}

function marioBubbles() {
  var bubble = new Thing(Bubble);
  addThing(bubble, mario.right, mario.top);
  // TimeHandler.addEvent(killNormal, 140, bubble);
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
    if(!attached.locnum && map.random) goToTransport(["Random", "Sky", "Vine"]);
    else shiftToLocation(attached.locnum);
  }
}

function unattachMario(me) {
  me.movement = moveMario;//me.movementsave;
  removeClasses(me, "climbing", "animated");
  TimeHandler.clearClassCycle(me, "climbing");
  me.yvel = me.skipoverlaps = me.attachoff = me.nofall = me.climbing = me.attached = me.attached.attached = false;
  me.xvel = me.keys.run;
}

function marioHopsOff(me, solid, addrun) {
  removeClasses(me, "climbing running");
  addClass(me, "jumping");
  
  console
  me.piping = me.nocollide = me.nofall = me.climbing = false;
  me.gravity = gravity / 4;
  me.xvel = 3.5;
  me.yvel = -3.5;
  TimeHandler.addEvent(function(me) {
    unflipHoriz(me);
    me.gravity = gravity;
    me.movement = moveMario;
    me.attached = false;
    if(addrun) {
      addClass(me, "running")
      marioStartRunningCycle(me);
    }
  }, 21, me);
  
}

function marioFires() {
  if(mario.numballs >= 2) return;
  ++mario.numballs;
  addClass(mario, "firing");
  var ball = new Thing(FireBall, mario.moveleft, true);
  ball.yvel = unitsize
  addThing(ball, mario.right + unitsized4, mario.top + unitsizet8);
  if(mario.moveleft) setRight(ball, mario.left - unitsized4, true);
  ball.animate(ball);
  ball.ondelete = fireDeleted;
  TimeHandler.addEvent(function(mario) { removeClass(mario, "firing"); }, 7, mario);
}
function emergeFire(me) {
  play("Fireball");
}

function marioStar(me) {
  if(me.star) return;
  ++me.star;
  play("Powerup");
  playTheme("Star", true);
  TimeHandler.addEvent(marioRemoveStar, 560, me);
  switchClass(me, "normal", "star");
  TimeHandler.addSpriteCycle(me, ["star1", "star2", "star3", "star4"], "star", 5);
}
function marioRemoveStar(me) {
  if(!me.star) return;
  --me.star;
  removeClasses(me, "star star1 star2 star3 star4");
  TimeHandler.clearClassCycle(me, "star");
  addClass(me, "normal");
  playTheme();
}

// Big means it must happen: 2 means no animation
function killMario(me, big) {
  if(!me.alive || me.flickering || me.dying) return;
  // If this is an auto kill, it's for rizzles
  if(big == 2) {
    notime = true;
    me.dead = me.dying = true;
  }
  // Otherwise it's just a regular (enemy, time, etc.) kill
  else {
    // If Mario can survive this, just power down
    if(!big && me.power > 1) {
      play("Power Down");
      me.power = 1;
      storeMarioStats();
      return marioGetsSmall(me);
    }
    // Otherwise, if this isn't a big one, animate a death
    else if(big != 2) {
      // Make this look dead
      TimeHandler.clearAllCycles(me);
      setSize(me, 7.5, 7, true);
      updateSize(me);
      setClass(me, "character mario dead");
      // Pause some things
      nokeys = notime = me.dying = true;
      thingStoreVelocity(me);
      // Make this the top of characters
      containerForefront(me, characters);
      // After a tiny bit, animate
      TimeHandler.addEvent(function(me) {
        thingRetrieveVelocity(me, true);
        me.nocollide = true;
        me.movement = me.resting = false;
        me.gravity = gravity / 2.1;
        me.yvel = unitsize * -1.4;
      }, 7, me);
    }
  }

  // Clear and reset
  pauseAllSounds();
  if(!window.editing) play("Mario Dies");
  me.nocollide = me.nomove = nokeys = 1;
  --data.lives.amount;
  if(!map.random) data.score.amount = data.scoreold;
  
  // If it's in editor, (almost) immediately set map
  if(window.editing) {
    setTimeout(function() {
      editorSubmitGameFuncPlay();
      editor.playing = editor.playediting = true;
    }, 35 * timer);
  }
  // If the map is normal, or failing that a game over is reached, timeout a reset
  else if(!map.random || data.lives.amount <= 0) {
    window.reset = setTimeout(data.lives.amount ? setMap : gameOver, timer * 280);
  }
  // Otherwise it's random; spawn him again
  else {
      nokeys = notime = false;
      updateDataElement(data.score);
      updateDataElement(data.lives);
      // placeMario(unitsizet16, unitsizet8 * -1 + (map.underwater * unitsize * 24));
      TimeHandler.addEvent(function() {
        marioDropsIn();
        playTheme();
      // }, 7 * (map.respawndist || 17));
      }, 117);
  }
}
// Used by random maps to respawn
function marioDropsIn() {
  // Clear and place Mario
  clearOldMario();
  placeMario(unitsizet16, unitsizet8 * -1 + (map.underwater * unitsize * 24));
  flicker(mario);
  
  // Give a Resting Stone for him to land, unless it's underwater...
  if(!map.underwater) {
    mario.nocollide = true;
    
    TimeHandler.addEvent(function() {
      mario.nocollide = false;
      addThing(new Thing(RestingStone), mario.left, mario.bottom + mario.yvel);
    }, map.respawndist || 17);
  }
  // ...in which case just fix his gravity
  else mario.gravity = gravity / 2.8;
}

function gameOver() {
  // Having a gamecount of -1 truly means it's all over
  gameon = false;
  pause();
  pauseTheme();
  play("Game Over");
  
  var innerHTML = "<div style='font-size:49px;padding-top: " + (innerHeight / 2 - 28/*49*/) + "px'>GAME OVER</div>";
  // innerHTML += "<p style='font-size:14px;opacity:.49;width:490px;margin:auto;margin-top:49px;'>";
  // innerHTML += "You have run out of lives. Maybe you're not ready for playing real games...";
  innerHTML += "</p>";
  
  body.className = "Night"; // to make it black
  body.innerHTML = innerHTML;
  
  window.gamecount = Infinity;
  clearMarioStats();
  
  setTimeout(gameRestart, 7000);
}

function gameRestart() {
  seedlast = .007;
  body.style.visibility = "hidden";
  body.innerHTML = body.style.paddingTop = body.style.fontSize = "";
  body.appendChild(canvas);
  gameon = true;
  map.random ? setMapRandom() : setMap(1,1);
  TimeHandler.addEvent(function() { body.style.visibility = ""; });
  setLives(3);
}




/*
 * Solids
 */

function Floor(me, length, height) {
  // log(arguments);
  me.width = (length || 1) * 8;
  me.height = (height * 8) || unitsizet32;
  me.spritewidth = 8;
  me.spriteheight = 8;
  me.repeat = true;
  setSolid(me, "floor");
}

// To do: stop using clouds, and use Stone instead
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
  setSolid(me, "brick unused");
  me.tolx = 1;
}
function brickBump(me, character) {
  if(me.up || character.type != "mario") return;
  play("Bump");
  if(me.used) return;
  me.up = character;
  if(character.power > 1 && !me.contents)
    return TimeHandler.addEvent(brickBreak, 2, me, character); // wait until after collision testing to delete (for coins)
  
  // Move the brick
  blockBumpMovement(me);
  
  // If the brick has contents,
  if(me.contents) {
    // Turn normal Mushrooms into FireFlowers if Mario is large
    if(mario.power > 1 && me.contents[0] == Mushroom && !me.contents[1]) me.contents[0] = FireFlower;
    TimeHandler.addEvent(
      function(me) {
        var contents = me.contents,
            out = new Thing(contents[0], contents[1], contents[2]);
        addThing(out, me.left, me.top);
        setMidXObj(out, me, true);
        out.blockparent = me;
        out.animate(out, me);
        // Do special preps for coins
        if(me.contents[0] == Coin) {
          if(me.lastcoin) makeUsedBlock(me);
          TimeHandler.addEvent( function(me) { me.lastcoin = true; }, 245, me );
        } else makeUsedBlock(me);
      }, 
      7,
      me
    );
  }
}
function makeUsedBlock(me) {
  me.used = true;
  switchClass(me, "unused", "used");
}
function brickBreak(me, character) {
  play("Break Block");
  score(me, 50);
  me.up = character;
  TimeHandler.addEvent(placeShards, 1, me);
  killNormal(me);
}
function placeShards(me) {
  for(var i = 0, shard; i < 4; ++i) {
    shard = new Thing(BrickShard);
    addThing(shard,
                me.left + (i < 2) * me.width * unitsize - unitsizet2,
                me.top + (i % 2) * me.height * unitsize - unitsizet2);
    shard.xvel = unitsized2 - unitsize * (i > 1);
    shard.yvel = unitsize * -1.4 + i % 2;
    TimeHandler.addEvent(killNormal, 350, shard);
  }
}
// Listed in characters because of gravity. Has nocollide, so it's ok
function BrickShard(me) {
  me.width = me.height = 4;
  me.nocollide = true;
  me.death = killNormal;
  setCharacter(me, "brickshard");
  TimeHandler.addSpriteCycle(me, [unflipHoriz, flipHoriz]);
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
  setSolid(me, "Block unused");
  if(!hidden) me.hidden = false;
  else {
    me.hidden = me.hidden = me.skipoverlaps = true;
  }
  me.tolx = 1;
  TimeHandler.addSpriteCycleSynched(me, ["one", "two", "three", "two", "one"]);
}
function blockBump(me, character) {
  if(character.type != "mario") return;
  if(me.used) {
    play("Bump");
    return;
  }
  me.used = 1;
  me.hidden = me.hidden = me.skipoverlaps = false;
  me.up = character;
  blockBumpMovement(me);
  removeClass(me, "hidden");
  switchClass(me, "unused", "used");
  if(mario.power > 1 && me.contents[0] == Mushroom && !me.contents[1]) me.contents[0] = FireFlower;
  TimeHandler.addEvent(blockContentsEmerge, 7, me);
}
// out is a coin by default, but can also be other things - [1] and [2] are arguments
function blockContentsEmerge(me) {
  var out = new Thing(me.contents[0], me.contents[1], me.contents[2]);
  addThing(out, me.left, me.top);
  setMidXObj(out, me, true);
  out.blockparent = me;
  out.animate(out, me);
}

function Pipe(me, height, transport) {
  me.width = me.spritewidth = 16;
  me.height = (height || 1) * 8;
  if(transport !== false) {
    me.actionTop = intoPipeVert;
    me.transport = transport;
  }
  setSolid(me, "pipe");
}
function PipeSide(me, transport, small) {
  me.width = me.spritewidth = small ? 8 : 19.5;
  me.height = me.spriteheight = 16;
  if(transport) {
    me.actionLeft = intoPipeHoriz;
    me.transport = transport;
  }
  setSolid(me, "pipe side " + (small ? "small" : ""));
}
function PipeVertical(me, height) {
  me.spritewidth = me.width = 16;
  me.spriteheight = me.repeat = 1;
  me.height = height;
  setSolid(me, "pipe vertical");
}

// Locnum is -1 if this is a cutscene vine
// The actual vine is just a dummy
function Vine(me, locnum) {
  me.width = me.spriteheight = 7;
  me.height = 0;
  me.locnum = locnum;
  me.nocollide = me.nofall = me.repeat = true;
  me.animate = vineEmerge;
  me.movement = vineMovement;
  setCharacter(me, "vine");
}

function vineEmerge(me, solid) {
  play("Vine Emerging");
  setHeight(me, 0);
  me.movement = vineMovement;
  TimeHandler.addEvent(vineEnable, 14, me);
  TimeHandler.addEventInterval(vineStay, 1, 14, me, solid);
}
function vineStay(me, solid) {
  setBottom(me, solid.top);
}
function vineEnable(me) {
  me.nocollide = false;
  me.collide = touchVine;
}

function vineMovement(me) {
  increaseHeightTop(me, unitsized4);
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
  TimeHandler.clearClassCycle(me, "running");
  removeClass(me, "running skidding");
  unflipHoriz(me);
  if(me.attachleft) flipHoriz(me);
  addClass(me, "climbing");
  // setSize(me, 7, 8, true);
  me.climbing = TimeHandler.addSpriteCycle(me, ["one", "two"], "climbing");
  
  // Make sure you're looking at the vine, and from the right distance
  lookTowardThing(me, vine);
  if(!me.attachleft) setRight(me, vine.left + unitsizet4);
  else setLeft(me, vine.right - unitsizet4);
  
}

function Springboard(me) {
  me.width = 8;
  me.height = me.heightnorm = 14.5;
  me.tension = me.tensionsave = 0;
  me.dir = 1; // 1 for down, -1 for up (ydir)
  me.collide = collideSpring;
  setSolid(me, "springboard");
}
function collideSpring(me, spring) {
  if(me.yvel >= 0 && me.mario && !spring.tension && characterOnSolid(me, spring))
    return springMarioInit(spring, me);
  return characterTouchedSolid(me, spring);
}
function springMarioInit(spring, mario) {
  spring.tension = spring.tensionsave = max(mario.yvel * .77, unitsize);
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
  
  updateSize(me.spring);
}
function moveMarioSpringUp(me) {
  if(!me.spring || !objectsTouch(me, me.spring)) {
    me.spring = false;
    me.movement = moveMario;
    return;
  }
}
function moveSpringUp(spring) {
  reduceSpringHeight(spring, -spring.tension);
  spring.tension *= 2;
  if(spring == mario.spring) 
    setBottom(mario, spring.top, true);
  
  if(spring.height > spring.heightnorm) {
    if(spring == mario.spring) {
      mario.yvel = max(-unitsizet2, spring.tensionsave * -.98);
      mario.resting = mario.spring = false;
    }
    reduceSpringHeight(spring, (spring.height - spring.heightnorm) * unitsize);
    spring.tension = spring.tensionsave = spring.movement = false;
  }
}
function reduceSpringHeight(spring, dy) {
  reduceHeight(spring, dy, true);
}

function Stone(me, width, height) {
  me.width = (width * 8) || 8;
  me.height = (height * 8) || 8;
  me.repeat = true;
  setSolid(me, "Stone");
}
// For historical reasons
function GenericStone(me, width, height) { return Stone(me, width, height); }

function RestingStone(me) {
  me.width = me.height = 8;
  me.used = false;
  me.movement = RestingStoneUnused;
  setSolid(me, "Stone hidden");
  me.title = "Stone";
}
function RestingStoneUnused(me) {
  // Wait until Mario isn't resting
  if(!mario.resting) return;
  // If Mario is resting on something else, this is unecessary
  if(mario.resting != me) return killNormal(me);
  // Make the stone wait until it's no longer being rested upon
  me.movement = RestingStoneUsed;
  removeClass(me, "hidden");
  setThingSprite(mario);
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
  TimeHandler.addEventInterval(castleBlockEvent, me.timeout, Infinity, me);
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
  me.deadly = me.nofire = me.nocollidechar = me.nocollidesolid = me.nofall = me.nostar = me.outerok = me.skipoverlaps = true;
  me.movement = false;
  me.collide = collideEnemy;
  setCharacter(me, "fireball castle");
  TimeHandler.addSpriteCycle(me, ["one", "two", "three", "four"], 4);
}

function CastleBridge(me, length) {
  me.height = 8;
  me.width = length * 8 || 4;
  me.spritewidth = 4;
  me.repeat = true;
  setSolid(me, "CastleBridge");
}
function CastleChain(me) {
  me.height = 8;
  me.width = me.spritewidth = 7.5;
  me.nocollide = true;
  setSolid(me, "castlechain");
  // make standardized detector
}
function CastleAxe(me) {
  me.width = me.height = 8;
  me.spritewidth = me.spriteheight = 8;
  me.nocollide = true;
  setSolid(me, "castleaxe");
  TimeHandler.addSpriteCycle(me, ["one", "two", "three", "two"]);
}
// Step 1 of getting to that jerkface Toad
function CastleAxeFalls(me, collider) {
  var axe = collider.axe;
  // Don't do this if Mario would fall without the bridge
  if(!me.mario || 
    me.right < axe.left + unitsize ||
    me.bottom > axe.bottom - unitsize) return;
  // Immediately kill the axe and collider
  killNormal(axe);
  killNormal(collider);
  // Pause Mario & wipe the other characters
  notime = nokeys = true;
  thingStoreVelocity(me);
  killOtherCharacters();
  TimeHandler.addEvent(killNormal, 7, axe.chain);
  TimeHandler.addEvent(CastleAxeKillsBridge, 14, axe.bridge, axe);
  pauseTheme();
  playTheme("World Clear", false, false);
}
// Step 2 of getting to that jerkface Toad
function CastleAxeKillsBridge(bridge, axe) {
  // Decrease the size of the bridge
  bridge.width -= 2;
  bridge.right -= unitsizet2;
  // If it's still here, go again
  if(bridge.width > 0) TimeHandler.addEvent(CastleAxeKillsBridge, 1, bridge, axe);
  // Otherwise call the next step
  else {
    bridge.width = 0;
    TimeHandler.addEvent(CastleAxeKillsBowser, 1, axe.bowser);
  }
  setWidth(bridge, bridge.width);
}
// Step 3 of getting to that jerkface Toad
function CastleAxeKillsBowser(bowser) {
  bowser.nofall = false;
  TimeHandler.addEvent(CastleAxeContinues, 35, mario);
}
// Step 4 of getting to that jerkface Toad
function CastleAxeContinues(mario) {
  map.canscroll = true;
  startWalking(mario);
}
function Toad(me) {
  me.width = 16;
  me.height = me.spriteheight = 12;
  me.group = "toad";
  setSolid(me, "toad npc");
}
function Peach(me) {
  me.width = 16;
  me.height = me.spriteheight = 12;
  me.group = "peach";
  setSolid(me, "peach npc");
}
// CollideCastleNPC is actually called by the FuncCollider
function collideCastleNPC(me, collider) {
  killNormal(collider);
  me.keys.run = 0;
  TimeHandler.addEvent(function(text) {
    var i;
    for(i = 0; i < text.length; ++i)
      TimeHandler.addEvent(proliferate, i * 70, text[i].element, {style: {visibility: "visible"}});
    TimeHandler.addEvent(endLevel, (i + 3) * 70);
  }, 21, collider.text);
} 

function TreeTop(me, width) {
  // Tree trunks are scenery
  me.width = width * 8;
  me.height = 8;
  me.repeat = true;
  setSolid(me, "treetop");
}
function ShroomTop(me, width) {
  // Shroom trunks are scenery
  me.width = width * 8;
  me.height = 8;
  me.repeat = true;
  setSolid(me, "shroomtop");
}

// For the floaty ones, if the yvel is really big, +1000 points
function Platform(me, width, settings) {
  me.width = (width || 4) * 4;
  me.height = 4;
  me.spritewidth = 4;
  me.moving = 0;
  me.repeat = me.killonend = true;
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
  me.width = width * 4;
  me.interval = 35;
  me.height = me.interval * 6;
  me.dir = dir;
  me.nocollide = me.hidden = true;
  me.movement = PlatformGeneratorInit;
  setSolid(me, "platformgenerator");
}
function PlatformGeneratorInit(me) {
  for(var i = 0, inc = me.interval, height = me.height; i < height; i += inc) {
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
  me.height = 5;
  me.width = width * 4;
  me.spritewidth = me.spriteheight = 5;
  me.repeat = me.nocollide = true;
  
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
  me.nocollide = me.repeat = true;
  setSolid(me, "flagpole");
}
function FlagTop(me) {
  me.spritewidth = me.spriteheight = me.width = me.height = 4;
  me.nocollide = true;
  setSolid(me, "flagtop");
}
// The detectors are invisible, and just for ending the level.
function FlagDetector(me) {
  me.width = 2;
  me.height = 100;
  me.collide = FlagCollision;
  setSolid(me, "flagdetector");
  me.hidden = true;
}
function CastleDoorDetector(me) {
  me.width = me.height = 4;
  me.collide = endLevelPoints;
  setSolid(me, "castledoor");
  me.hidden = true;
}
function FlagCollision(me, detector) {
  if(!me || !me.mario) return killNormal(me);
  window.detector = detector;
  pauseAllSounds();
  play("Flagpole");
  
  // Reset and clear most stuff, including killing all other characters
  killOtherCharacters();
  nokeys = notime = mario.nofall = 1;
  
  // Mostly clear Mario, and set him to the pole's left
  mario.xvel = mario.yvel = mario.keys.up = mario.keys.jump = map.canscroll = map.ending = mario.movement = 0;
  mario.nocollidechar = true;
  setRight(me, detector.pole.left, true);
  removeClasses(me, "running jumping skidding");
  addClass(me, "climbing animated");
  updateSize(me);
  TimeHandler.addSpriteCycle(me, ["one", "two"], "climbing");
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
            TimeHandler.clearClassCycle(mario, "climbing");
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
        refillCanvas();
      }, timer);
}
// See http://themushroomkingdom.net/smb_breakdown.shtml near bottom
// Stages: 8, 28, 40, 62
function scoreMarioFlag(diff, stone) {
  var amount;
  // log(diff);
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
  flipHoriz(me);
  TimeHandler.clearClassCycle(me, "climbing");
  setLeft(me, pole.right, true);
  setTimeout(function() {
    play("Stage Clear");
    marioHopsOff(me, pole, true);
  }, timer * 14);
}

// Me === Mario
function endLevelPoints(me, detector) {
  if(!me || !me.mario) return;
  
  // Stop the game, and get rid of mario and the detectors
  notime = nokeys = true;
  killNormal(detector);
  killNormal(me);
  
  // Determine the number of fireballs (1, 3, and 6 become not 0)
  var numfire = getLast(String(data.time.amount));
  if(!(numfire == 1 || numfire == 3 || numfire == 6)) numfire = 0;

  // Count down the points (x50)
  var points = setInterval(function() {
    // 50 for each
    --data.time.amount;
    data.score.amount += 50;
    updateDataElement(data.score);
    updateDataElement(data.time);
    // Each point(x50) plays the coin noise
    play("Coin");
    // Once it's done, move on to the fireworks.
    if(data.time.amount <= 0)  {
      // pause();
      clearInterval(points);
      setTimeout(function() { endLevelFireworks(me, numfire, detector); }, timer * 49);
    }
  }, timerd2);
}
function endLevelFireworks(me, numfire, detector) {
  var nextnum, nextfunc,
      i = 0;
  if(numfire) {
    // var castlemid = detector.castle.left + detector.castle.width * unitsized2;
    var castlemid = detector.left + 32 * unitsized2;
    while(i < numfire)
      explodeFirework(++i, castlemid); //pre-increment since explodeFirework expects numbers starting at 1
    nextnum = timer * (i + 2) * 42;
  }
  else nextnum = 0;
  
  // The actual endLevel happens after all the fireworks are done
  nextfunc = function() { setTimeout(function() { endLevel(); }, nextnum); };
  
  // If the Stage Clear sound is still playing, wait for it to finish
  if(sounds["Stage Clear"] && !sounds["Stage Clear"].paused)
    sounds["Stage Clear"].addEventListener("ended", function() { TimeHandler.addEvent(nextfunc, 35); });
  // Otherwise just start it immediately
  else nextfunc();
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
  me.nocollide = me.nofire = me.nofall = true;
  // Number is >0 if this is ending of level
  if(num)
    switch(num) {
      // These probably aren't the exact same as original... :(
      case 1: me.locs = [unitsizet16, unitsizet16]; break;
      case 2: me.locs = [-unitsizet16, unitsizet16]; break;
      case 3: me.locs = [unitsizet16 * 2, unitsizet16 * 2]; break;
      case 4: me.locs = [unitsizet16 * -2, unitsizet16 * 2]; break;
      case 5: me.locs = [0,unitsizet16 * 1.5]; break;
      default: me.locs = [0,0]; break;
    }
  // Otherwise, it's just a normal explosion
  me.animate = function() {
    var name = me.className + " n";
    if(me.locs) play("Firework");
    TimeHandler.addEvent(function(me) { setClass(me, name + 1); }, 0, me);
    TimeHandler.addEvent(function(me) { setClass(me, name + 2); }, 7, me);
    TimeHandler.addEvent(function(me) { setClass(me, name + 3); }, 14, me);
    TimeHandler.addEvent(function(me) { killNormal(me); }, 21, me);
  }
  setCharacter(me, "firework");
}

function Coral(me, height) {
  me.width = 8;
  me.height = height * 8;
  me.repeat = true;
  setSolid(me, "coral");
}

function BridgeBase(me, width) {
  me.height = 4;
  me.spritewidth = 4;
  me.width = width * 8;
  me.repeat = true;
  setSolid(me, "bridge-base");
}

function WarpWorld(me) {
  me.width = 106; // 13 * 8 + 2
  me.height = 88;
  me.movement = setWarpWorldInit;
  me.collide = enableWarpWorldText;
  me.pirhanas = [];
  me.pipes = [];
  me.texts = [];
  me.hidden = true;
  setSolid(me, "warpworld");
}

function setWarpWorldInit(me) {
  // Just reduces the size 
  shiftHoriz(me, me.width * unitsized2);
  me.width /= 2;
  updateSize(me); 
  me.movement = false;
}

function enableWarpWorldText(me, warp) {
  var pirhanas = warp.pirhanas,
      texts = warp.texts, i;
  for(i in pirhanas) {
    pirhanas[i].death();
  }
  for(i in texts)
    texts[i].element.style.visibility = "";
  killNormal(warp);
}

/* Scenery */

// Scenery sizes are stored in window.scenery
// After creation, they're processed
function resetScenery() {
  window.Scenery = {
    // Individual sizes for scenery
    sprites: {
      "BrickHalf": [8, 4],
      "BrickPlain": [8, 8],
      "Bush1": [16, 8],
      "Bush2": [24, 8],
      "Bush3": [32, 8],
      "Castle": [75, 88],
      "CastleDoor": [8, 20],
      "CastleRailing": [8, 4],
      "CastleRailingFilled": [8, 4],
      "CastleTop": [12, 12],
      "CastleWall": [8, 48],
      "Cloud1": [16, 12],
      "Cloud2": [24, 12],
      "Cloud3": [32, 12],
      "HillSmall": [24, 9.5],
      "HillLarge": [40, 17.5],
      "Fence": [8, 8],
      "Pirhana": [8, 12],
      "pirhana": [8, 12],
      "PlantSmall": [7, 15],
      "PlantLarge": [8, 23],
      "Railing": [4, 4],
      "ShroomTrunk": [8, 8],
      "String": [1, 1],
      "TreeTrunk": [8, 8],
      "Water": { 
          0: 4,
          1: 5,
          spriteCycle: ["one", "two", "three", "four"]
        },
      "WaterFill": [4, 5]
    },
    // Patterns of scenery that can be placed in one call
    // Each ends with "Blank" to signify the ending width
    patterns: {
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
    }
  };
  
  processSceneryPatterns(Scenery.patterns);
}

// Sets the width of them and removes the blank element
function processSceneryPatterns(patterns) {
  var current, i;
  for(i in patterns) {
    current = patterns[i];
    if(!current.length) continue;
    // The last array in current should be ["blank", width]
    current.width = current[current.length - 1][1];
    current.pop();
  }
}


// Used in worlds like 5-2 where patterns are slightly inaccurate
function SceneryBlocker(me, width, height) {
  me.width = width || 8;
  me.height = height || 8;
  me.nocollide = me.hidden = true;
  setSolid(me, "sceneryblocker");
}

// A sprite, based on scenery.sprites[name]
// It's repeated (reps = [x-rep, y-rep]) times ([1,1] by default)
function Sprite(me, name, reps) {
  if(!reps) reps = [1,1];
  // Grab the template from window.Scenery (or complain if it's not there)
  var template = me.template = Scenery.sprites[name];
  if(!template) {
    log("No sprite template found for", name);
    return;
  }
  // Sizing is gotten from the listing under setScenery 
  me.width = (me.spritewidth = template[0]) * (reps[0] || 1);
  me.height = (me.spriteheight = template[1]) * (reps[1] || 1);
  me.unitwidth = me.spritewidth * unitsize;
  me.unitheight = me.spriteheight * unitsize;
  me.nocollide = me.maxquads = 1;
  me.repeat = true;
  setScenery(me, "scenery " + name);
  me.title = name;
  
  // If the listing has a SpriteCycle, do that
  if(template.spriteCycleTimer) TimeHandler.addSpriteCycle(me, spriteCycleTimer, spriteCycleTimer || undefined)
}

// To do: is this ever used? (no longer used in sky)
function LocationShifter(me, loc, size) {
  me.loc = loc;
  me.width = size[0];
  me.height = size[1];
  me.collide = collideLocationShifter;
  me.hidden = true;
  setSolid(me, "blue");
  return;
}
function collideLocationShifter(me, shifter) {
  if(!me.mario) return;
  shifter.nocollide = mario.piping = true;
  TimeHandler.addEvent( 
    function(me) {
      shiftToLocation(shifter.loc);
      if(map.random) entryRandom(me);
    }, 1, me );
}

function ScrollBlocker(me, big) {
  me.width = 40;
  me.height = 140;  //gamescreen.height;
  me.nocollide = me.hidden = true;
  me.big = big;
  me.movement = function() {
    if(me.left - mario.xvel <= gamescreen.right - gamescreen.left) {
      map.canscroll = me.movement = false;
      map.noscroll = me.big; // really just for random
    }
  }
  setSolid(me, "scrollblocker");
}

function ScrollEnabler(me) {
  me.width = 40;
  me.height = 140;//gamescreen.height;
  me.hidden = true;
  me.collide = function() {
    if(me.left - mario.xvel <= gamescreen.right - gamescreen.left) {
      map.canscroll = me.nocollide = true;
    }
  }
  setSolid(me, "scrollenabler");
}

function zoneToggler(me, func) {
  me.width = 40;
  me.height = 140;//gamescreen.height;
  me.func = func;
  me.hidden = true;
  me.collide = function(me, zone) {
    zone.func();
    zone.nocollide = true;
  }
  setSolid(me, "zonetoggler " + func.name);
}

function GenerationStarter(me, func, arg) {
  me.width = 8;
  me.height = gamescreen.height + 20;
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
    me.func((gamescreen.left + me.right) / unitsize, me.arg);
  };
  setSolid(me, "generationstarter");
  me.hidden = true;
}

function castleDecider(me, xloc, secnum) {
  me.height = ceilmax;
  me.width = 10;
  me.nocollide = true;
  me.xloc = xloc;
  me.section = map.area.sections[secnum];
  me.next = map.area.sections[secnum + 1];
  me.movement = function(me) {
    if(me.left > gamescreen.right - gamescreen.left || !me.section.activated) return;
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
  me.hidden = true;
}

// Used for general function activators, like zones
function FuncCollider(me, func, position) {
  // Fancy positions are [width, height]
  if(position) {
    me.width = position[0];
    me.height = position[1];
  }
  // Normally position is nothing
  else {
    me.width = 8;
    me.height = ceilmax + 40;
  }
  me.collide = func;
  me.hidden = true;
  setSolid(me, "funccollider blue " + func.name);
}
function FuncSpawner(me, func, argument) {
  me.width = 8; me.height = 8;
  me.movement = function() { func(me, argument); };
  me.argument = argument;
  me.nocollide = me.hidden = true;
  setSolid(me, "funccollider blue " + func.name);
}

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
    if(!character.mario) return false;
    me.func(character, me);
  }
  setSolid(me, "collider blue " + me.func.name);
  me.hidden = true;
}
