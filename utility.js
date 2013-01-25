/*
 * Basic object positioning helper functions
 */
function updateLocation(me) {
  updatePosition(me);
  updateDisplay(me);
}
function updatePosition(me) {
  if(!me.nomove) shiftHoriz(me, me.xvel);
  if(!me.nofall) shiftVert(me, me.yvel);
}
function updateDisplay(me) {
  if(!me.element) return;
  me.style.marginTop = me.top + "px";
  me.style.marginLeft = me.left + "px";
}
function updateAllDisplays() {
  for(i in solids) updateDisplay(solids[i]);
  for(i in characters) updateDisplay(characters[i]);
}
function updateSize(me) {
  me.element.style.width =  me.width * unitsize + "px";
  me.element.style.height =  me.height * unitsize + "px";
}
function reduceHeight(me, dy, see) {
  me.top += dy;
  me.height -= dy / unitsize;
  
  if(see) {
    updateSize(me);
    updateDisplay(me);
  }
}
function shiftBoth(me, dx, dy, see) {
  me.left += dx; me.right += dx;
  me.top += dy; me.bottom += dy;
  if(see) updateDisplay(me);
}
function shiftHoriz(me, dx, see) {
  me.left += dx;
  me.right += dx;
  if(see) updateDisplay(me);
}
function shiftVert(me, dy, see) {
  me.top += dy;
  me.bottom += dy;
  if(see) updateDisplay(me);
}
function setLeft(me, left, see) {
  me.left = left;
  me.right = me.left + me.width * unitsize;
  if(see) updateDisplay(me);
}
function setRight(me, right, see) {
  me.right = right;
  me.left = me.right - me.width * unitsize;
  if(see) updateDisplay(me);
}
function setTop(me, top, see) {
  me.top = top;
  me.bottom = me.top + me.height * unitsize;
  if(see) updateDisplay(me);
}
function setBottom(me, bottom, see) {
  me.bottom = bottom;
  me.top = me.bottom - me.height * unitsize;
  if(see) updateDisplay(me);
}
function setMidX(me, left, see) {
  setLeft(me, left + me.width * unitsized2, see);
}
function getMidX(me) {
  return me.left + me.width * unitsized2;
}
function setMidY(me, top, see) {
  setTop(me, top + me.height * unitsized2, see);
}
function setMidXObj(me, object, see) {
  setLeft(me, (object.left + object.width * unitsized2) - (me.width * unitsized2), see);
}
function updateLeft(me, dx, see) {
  me.left += dx;
  me.right = me.left + me.width * unitsize;
  if(see) updateDisplay(me);
}
function updateRight(me, dx, see) {
  me.right += dx;
  me.left = me.right - me.width * unitsize;
  if(see) updateDisplay(me);
}
function updateTop(me, dy, see) {
  me.top += dy;
  me.bottom = me.top + me.height * unitsize;
  if(see) updateDisplay(me);
}
function updateBottom(me, dy, see) {
  me.bottom += dy;
  me.top = me.bottom - me.height * unitsize;
  if(see) updateDisplay(me);
}

/*
 * Collisions
 */
function determineThingCollisions(me) {
  if(me.nocollide) return;
  else if(!me.resting || me.resting.yvel == 0) me.resting = false;
  
  // Cur is each quadrant this object is in, and other is each other object in them.
  var cur = me.quads, other, contents;
  
  checkOverlap(me);
  
  while(cur.next) {
    cur = cur.next;
    // cur.contents is now pointing to a quadrant
    other = cur.contents.things;
    while(other.next) {
      other = other.next;
      // other.contents is now pointing to a thing
      // to do: get nocollide working on scenery for performance's sake
      if(me == (contents = other.contents)) break; // breaking should prevent double collisions
      if(!contents.alive || contents.scenery || contents.nocollide) continue; // not removed in upkeep
      // The .hidden check is required. Try the beginning of 2-1 without it.
      if(objectsTouch(me, contents) && (!contents.hidden || solidOnCharacter(contents, me))) {
        // Collisions for non-solids are simple
        if(contents.type != "solid")
          objectsCollided(me, contents);
        // Collisions for solids, slightly less so (overlaps)
        else if(!me.nocollidesolid) {
          objectsCollided(me, contents);
          if(characterOverlapsSolid(me, contents))
            me.overlaps.push(contents);
        }
      }
    }
  }
  
  if(me.undermid) me.undermid.bottomBump(me.undermid, me);
  else if(me.under instanceof Thing) me.under.bottomBump(me.under, me);
  
}

// give solid a tag for overlap
// remove tag when overlaps = []
function checkOverlap(me) {
  if(me.overlapdir) {
    if((me.overlapdir < 0 && me.right <= me.ocheck.left + unitsizet2)
        || me.left >= me.ocheck.right - unitsizet2) {
      me.overlapdir = 0;
      me.overlaps = [];
    }
    else {
      shiftHoriz(me, me.overlapdir, true);
    }
  }
  else if(me.overlaps.length > 0) {
    // mid = me.omid is the midpoint of what is being overlapped
    var overlaps = me.overlaps, mid = 0, right = {right: -Infinity}, left = {left: Infinity}, over;
    me.overlapfix = true;
    
    for(i in overlaps) {
      over = overlaps[i];
      mid += getMidX(over);
      if(over.right > right.right) right = over;
      if(over.left < left.left) left = over;
    }
    mid /= overlaps.length;
    if(getMidX(me) >= mid - unitsized16) {
      // To the right of the middle: travel until past right
      me.overlapdir = unitsize;
      me.ocheck = right;
    } else {
      // To the left of the middle: travel until past left
      me.overlapdir = unitsize * -1;
      me.ocheck = left;
    }
  }
}
function characterOverlapsSolid(me, solid) {
  return me.top <= solid.top && me.bottom > solid.bottom;
}

// Purposefully only looks at toly; horizontal uses 1 unitsize
function objectsTouch(one, two) {
  if(one.right - unitsize > two.left && one.left + unitsize < two.right)
    if(one.bottom >= two.top && one.top + one.toly <= two.bottom)
      return true;
  return false;
}

function objectsCollided(one, two) {
  // Assume that if there's a solid, it's two. (solids don't collide with each other)
  if(one.type == "solid") return objectsCollided(two, one);
  
  if(two.up && one != two.up) return characterTouchesUp(one, two);
  
  
  if(two.type != "solid") {
    if(one.type == "mario") two.collide(one, two);
    else {
      // if(two.group == "coin" && one.type == "koopa smart") alert("two/one\n" + one.collide);
      one.collide(two, one);
    }
  } else two.collide(one, two);
}

// Sees whether one's midpoint is to the left of two's
function objectToLeft(one, two) {
  return (one.left + one.right) / 2 < (two.left + two.right) / 2;
}
/*
  TO DO: Revamp these!!
*/
function objectOnTop(one, two) {
  if(one.type == "solid" && two.yvel > 0) return false;
  if(one.yvel < two.yvel && two.type != "solid") return false;
  if(one.type == "mario" && one.bottom < two.bottom && two.group == "enemy") return true;
  return(  (one.left + unitsize < two.right && one.right - unitsize > two.left) && 
  (one.bottom - two.yvel <= two.top + two.toly || one.bottom <= two.top + two.toly + Math.abs(one.yvel - two.yvel)));
}
function solidOnCharacter(solid, me) {
  me.midx = me.left + unitsized2 * me.width;
  return me.midx > solid.left && me.midx < solid.right && 
  (solid.bottom - solid.yvel <= me.top + me.toly - me.yvel);
}
// This would make the smart koopas stay on the edges more intelligently
// Can't use objectOnTop for this, else Mario will walk on walls.
function characterOnSolid(me, solid) {
  return (me.resting == solid || (objectOnTop(me, solid) && me.yvel >= 0 &&
    me.left - me.xvel + unitsize != solid.right && me.right - me.xvel - unitsize != solid.left));
}
function characterOnResting(me, solid) {
  return objectOnTop(me, solid) &&
    me.left - me.xvel + unitsize != solid.right && me.right - me.xvel - unitsize != solid.left;
}
function characterOnCharacter(one, two) {
  return(  (one.left - unitsizet2 < two.right && one.right + unitsizet2 > two.left) && 
  (one.bottom - two.yvel <= two.top + two.toly || one.bottom <= two.top + two.toly + Math.abs(one.yvel - two.yvel)));
}

// This whole thing is just horrible and terrible... but it works. Meh.
function characterTouchedSolid(me, solid) {
  if(me.type != "mario" && solid.hidden) return;
  
  // Me on top of the solid
  if(characterOnSolid(me, solid)) {
    if(solid.hidden) return;
    me.resting = solid;
  }
  
  // Solid on top of me
  else if(solidOnCharacter(solid, me)) {
    var mid = me.left + me.width * unitsize / 2;
    if(mid > solid.left && mid < solid.right) me.undermid = solid;
    else if(solid.hidden) return;
    if(!me.under) me.under = [solid];
    else me.under.push(solid);
    setTop(me, solid.bottom - me.toly, true);
    me.yvel = 0;
    if(me.type == "mario") me.keys.jump = 0;
    updateDisplay(me);
  }
  
  if(solid.hidden) return;
  
  // Character bumping into the side
  //// .midx is given by solidOnCharacter
  if(!objectOnTop(me, solid) && !objectOnTop(solid, me) && !me.under
   && !(solid.up && me == solid.up)) {
    if(me.right <= solid.right) { // To left of solid
      me.xvel = Math.min(me.xvel, 0);
      shiftHoriz(me, Math.max(solid.left + unitsize - me.right, unitsized2 * -1), true);
    } else if(me.left >= solid.left) { // To right of solid
      me.xvel = Math.max(me.xvel, 0);
      shiftHoriz(me, Math.min(solid.right - unitsize - me.left, unitsized2), true);
    }
    
    if(me.type != "mario") {
      me.moveleft = !me.moveleft;
      if(me.group == "item") me.collide(solid, me);
    } else if(solid.actionLeft)
      solid.actionLeft(me, solid, solid.transport);
    
    updateDisplay(me);
  }
}

function characterTouchesUp(me, solid) {
  switch(me.group) {
    case "item": 
      characterHops(me);
      if(!objectOnTop(me, solid)) me.moveleft = objectToLeft(me, solid);
    break;
    case "coin":
      me.animate(me);
    break;
    default:
      me.death(me, 2);
      scoreEnemyBelow(me);
    break;
  }
}

function characterHops(me) {
  me.yvel = -1.4 * unitsize;
  me.resting = false;
}

/*
 * Scoring on enemies
 */
function scoreEnemyStomp(enemy) {
  var amount = 100;
  switch(enemy.type.split(" ")[0]) {
    case "koopa": 
      if(enemy.fly) amount = 400;
      else amount = 100;
    break;
    case "cheepcheep": amount = 200; break;
    case "hammerbro": amount = 1000; break;
    case "lakitu": amount = 800; break;
    case "bulletbill": amount = 200; break;
    default: amount = 100; break;
  }
  // scoreEnemyFin(enemy, amount);
}
function scoreEnemyFire(enemy) {
  var amount = 200;
  switch(enemy.type.split(" ")[0]) {
    case "goomba": amount = 100; break;
    case "hammerbro": amount = 1000; break;
    case "bowser": amount = 5000; break;
    default: amount = 200; break;
  }
  scoreEnemyFin(enemy, amount);
}
function scoreEnemyStar(enemy) {
  var amount = 200;
  switch(enemy.type.split(" ")[0]) {
    case "goomba": amount = 100; break;
    case "hammerbro": amount = 1000; break;
    default: amount = 200; break;
  }
  scoreEnemyFin(enemy, amount);
}
function scoreEnemyBelow(enemy) {
  var amount = 100;
  switch(enemy.type.split(" ")[0]) {
    case "hammerbro": amount = 1000; break;
    default: amount = 100; break;
  }
  scoreEnemyFin(enemy, amount);
}
function scoreEnemyFin(enemy, amount) {
  score(enemy, amount, true);
}

/*
 * General actions
 */

function moveSimple(me) {
  if(me.direction != me.moveleft) {
    if(me.moveleft) {
      me.xvel = me.speed * -1;
      removeClass(me,"flipped");
    } else {
      me.element.className += " flipped";
      me.xvel = me.speed; 
    }
    me.direction = me.moveleft;
  }
}

function moveSmart(me) {
  moveSimple(me);
  
  if(this.yvel == 0 && (!this.resting || offResting(this))) {
    this.resting = true;
    this.moveleft = !this.moveleft;
  }
}
function offResting(me) {
  var mid = me.left + me.width * unitsized2;
  if(me.moveleft) return mid < me.resting.left;
  else return mid > me.resting.right;
}

function moveJumping(me) {
  moveSimple(me);
  
  if(me.resting) {
    me.yvel = Math.abs(me.jumpheight) * -1;
    me.resting = false;
  }
}

// These are both crappy and inelegant, but they work. Ugh.
// Floating: the vertical version
// Changing: 0 for normal, |1| for forward/back, |2| for waiting
function moveFloating(me) {
  if(me.changing == 0) {
    if(screen.top + me.bottom > me.end - unitsizet8) me.changing = -1;
    else if(screen.top + me.top < me.begin + unitsizet8) me.changing = 1;
  }
  else { 
    if(me.changing == 1) {
      me.yvel += unitsize / 64;
      if(me.yvel == 0) {
        me.changing = 2;
        addEvent(
          function(me) { me.changing = 1; },
          me.maxvel * 4,
          me
        );
      }
      if(me.yvel > me.maxvel) {
        me.changing = 0;
        me.yvel = me.maxvel;
      }
    } else if(me.changing == -1) {
      me.yvel -= unitsize / 64;
      if(me.yvel == 0) {
        me.changing = -2;
        addEvent(
          function(me) { me.changing = -1; },
          me.maxvel * 4,
          me
        );
      }
      if(me.yvel < me.maxvel * -1) {
        me.changing = 0;
        me.yvel = me.maxvel * -1;
      }
    }
  }
  
  movePlatformNorm(this);
}
// Sliding: the horizontal version
// Changing: 0 for normal, |1| for forward/back, |2| for waiting
// To do: use switch(me.changing)
function moveSliding(me) {
  switch(me.changing) {
    case 0:
      if(screen.left + me.right > me.end - unitsizet8) me.changing = -1;
      else if(screen.left + me.left < me.begin + unitsizet8) me.changing = 1;
    break;
    case 1:
      me.xvel += unitsize / 64;
      if(me.xvel == 0) {
        me.changing = 2;
        addEvent( function(me) { me.changing = 1; }, me.maxvel * 4, me);
      }
      if(me.xvel > me.maxvel) {
        me.changing = 0;
        me.xvel = me.maxvel;
      }
    break;
    case -1:
      me.xvel -= unitsize / 64;
      if(me.xvel == 0) {
        me.changing = -2;
        addEvent( function(me) { me.changing = -1; }, me.maxvel * 4, me);
      }
      if(me.xvel < me.maxvel * -1) {
        me.changing = 0;
        me.xvel = me.maxvel * -1;
      }
    break;
  }
  movePlatformNorm(me);
}

function collideTransport(me, solid) {
  characterTouchedSolid(me, solid);
  if(solid != me.resting) return;
  
  solid.movement = movePlatformNorm;
  solid.collide = characterTouchedSolid;
  solid.xvel = unitsized2;
}

// To do: make me.collide and stages w/functions
function moveFalling() {
  if(this != mario.resting) return;
  
  shiftVert(this, this.yvel += unitsized32);
  
  if(this.partner) {
    shiftVert(this.partner, this.yvel * -1);
    this.tension += this.yvel;
    if((this.partner.tension -= this.yvel) <= 0) {
      this.collide = this.partner.collide = characterTouchedSolid;
      this.partner.yvel = unitsize;
      this.movement = this.partner.movement = function() {
        shiftVert(this, this.yvel += unitsized32);
      }
    }
  }
  if(this == mario.resting) setBottom(mario, this.top);
}

function moveFlying() {
  
}


function removeClass(me, strin) {
  // me.element.className = me.element.className.split(strin).join(strout);
  me.element.className = me.element.className.replace(new RegExp(" " + strin,"gm"),'');;
  // result = mystring.replace(new RegExp(".","gm")," ");
}

/*
 * Deaths & removing
 */

// Javascript memory management, you are bad and should feel bad.
function deleteThing(me, array, arrayloc) {
  array.splice(arrayloc,1);
  removeElement(me);
}
function removeElement(me) {
  if(!me.element) return;
  document.body.removeChild(me.element);
  me.element = false;
  if(me.type == "fireball") --mario.numballs; // would like to make this part of fireball
}
function killNormal(me) {
  if(!me || !me.alive) return;
  me.alive = me.resting = me.movement = false;
  removeElement(me);
}
function killFlip(me, extra) {
  me.element.className += " flipped-vert";
  me.bottomBump = function() {};
  me.nocollide = true;
  me.resting = me.movement = me.speed = me.xvel = false;
  me.yvel = -1 * unitsize;
  addEvent(function(me) { killNormal(me); }, 70 + (extra || 0));
}

// To do: phase this out in favor of an addEvent-based one
function generalMovement(me, dx, dy, cleartime) {
  var move = setInterval(function() {
    shiftVert(me, dy);
    shiftHoriz(me, dx);
  }, timer);
  setTimeout(function() { clearInterval(move); }, cleartime);
}
function blockBumpMovement(me) {
  var dir = -3, dd = .5;
  var move = setInterval(function() {
    shiftVert(me, dir, true);
    dir += dd;
    if(dir == 3.5) {
      clearInterval(move);
      me.up = false;
    }
    determineThingCollisions(me); // for coins
  }, timer);
}

function emergeUp(me, solid) {
  play("Powerup Appears.wav");
  me.element.className += " flipped";
  me.nomove = me.nocollide = me.alive = me.nofall = me.emerging = true;
  determineThingQuadrants(me);
  var move = setInterval(function() {
    shiftVert(me, -1 * unitsized8, true);
    if(me.bottom <= solid.top) {
      clearInterval(move);
      me.nocollide = me.nomove = me.moveleft = me.nofall = me.emerging = false;
      if(me.movement) {
        me.movementsave = me.movement;
        me.movement = moveSimple;
        me.moving = setInterval(function() {
          if(me.resting != solid) {
            clearTimeout(me.moving);
            me.movement = me.movementsave;
          }
        }, timer);
      }
    }
  }, timer);
}

function flicker(me, cleartime) {
  me.flickering = true;
  var on = me.element.style.visibility == "visible", timing = timer * 8,
  flick = setInterval(function() {
    if(on) me.element.style.visibility = "hidden";
    else me.element.style.visibility = "visible";
    on = !on;
  }, timing);
  setTimeout(function() {
    clearInterval(flick);
    me.element.style.visibility = "visible";
    me.flickering = false;
  }, cleartime);
}