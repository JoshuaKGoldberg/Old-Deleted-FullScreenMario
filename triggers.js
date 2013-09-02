/* Triggers.js */
// Keeps track of triggers, which mainly consist of key presses

function resetTriggers() {
  proliferate(body, {
      onkeydown: keydown,
      onkeyup: keyup,
      oncontextmenu: contextmenu,
      onmousedown: mousedown
    });
}

function keydown(event) {
  if((mario && mario.dead) || window.paused || window.nokeys) return;
  
  // Allow this to be used as keyup(37) or keyup({which: 37})
  if(typeof(event) != "number" || event.which)
    event = event.which;
  
  switch(event) {
    case 37: case 65: // left
      mario.keys.run = -1;
    break;
    
    case 38: case 87: case 32: // up
      mario.keys.up = true;
      if(mario.canjump && !mario.crouching && (mario.resting || map.underwater)) {
        mario.keys.jump = 1;
        mario.canjump = mario.keys.jumplev = 0;
        // To do: can mario make a jumping sound during the spring?
        if(mario.power > 1) play("Jump Super.wav");
        else play("Jump Small.wav");
        if(map.underwater) setTimeout(function() {
          mario.jumping = mario.keys.jump = false;
        }, timer * 14);
      }
     break;
     
    case 39: case 68: // right
      mario.keys.run = 1;
    break;
    
    case 40: case 83: // down
      mario.keys.crouch = 1;
    break;
    
    case 16: // sprint
      if(mario.power == 3 && mario.keys.sprint == 0) mario.fire();
      mario.keys.sprint = 1;
    break;
    
    case 80: // pause
      if(!paused && !(window.editing && !editor.playing))
        setTimeout(function() { pause(true); }, 140);
    break;
    
    case 32: // space
      timer = timerd2;
    break;
    
    case 77: // mute/unmute
      toggleMute();
    break;
    
    case 81: // qqqqqqqqqqqqqqqqq
      if(++qcount > 28) maxlulz();
      switch(qcount) {
        case 7: lulz(); break;
        case 14: superlulz(); break;
        case 21: hyperlulz(); break;
      }
    break;
    
    case 66: // B; 8-4 protip
      console.log("See map random! 7777777");
    break;
    
    default: 
      if(!(parentwindow && parentwindow.scrollPageBig)) return;
      parentwindow.keydown(event);
    break;
    
  }
  
  window.gamehistory[gamecount] = [keydown, event];
}

function keyup(event) {
  if(window.nokeys) return;
  
  // Allow this to be used as keyup(37) or keyup({which: 37})
  if(typeof(event) != "number" || event.which)
    event = event.which;
  
  switch(event) {
    case 37: case 65: // left
      mario.keys.run = 0;
    break;
    
    case 38: case 87: case 32: // up
      if(!map.underwater) mario.keys.jump = mario.keys.up = 0;
      mario.canjump = true;
    break;

    case 39: case 68: // right
      mario.keys.run = 0;
    break;

    case 40: case 83: // down
      mario.keys.crouch = 0;
      removeCrouch();
    break;
    
    case 16: // sprint
      mario.keys.sprint = 0;
    break;
    
    case 80: // paused
      unpause(true);
    break;
    
    case 32: // space
      timer = timernorm;
    break;

    default: return; // for typing, exit this handler for other keys
  }
  
  window.gamehistory[gamecount] = [keyup, event];
}


function contextmenu(event) {
  if(event.preventDefault)
    event.preventDefault();
}

function mousedown(event) {
  // Right click
  if(event.which == 3) {
    if(paused) unpause();
    else if((!window.editor) || (!editing && !editor.playing)) pause(true);
    if(event.preventDefault)
      event.preventDefault()
  }
}

function scriptKeys(oldhistory) {
  var i, entry;
  for(i in oldhistory) {
    entry = oldhistory[i];
    addEvent(entry[0], i, entry[1]);
    addEvent(function() { alert(entry[0].name + ", " + entry[1]) }, i);
  }
}


function lulz(options, timer) {
  mario.star = true;
  options = options || [Goomba];
  timer = timer || 7;
  addEventInterval(function() {
    if(characters.length > 210) return;
    var lul = new Thing(options[randInt(options.length)], randBoolJS(), randBoolJS());
    lul.yvel = random() * -unitsizet4;
    lul.xvel = lul.speed = random() * unitsizet2 * randSign();
    addThing(lul, (32 * random() + 128) * unitsize, (88 * random()) * unitsize);
  }, timer, Infinity);
}
function superlulz() {
  lulz([Goomba, Koopa, Beetle, HammerBro, Lakitu, Podoboo, Blooper]);
}
function hyperlulz() {
  lulz([Bowser], 21);
}
// Sigh....
function maxlulz() {
  // window.palette = arrayShuffle(window.palette, 1);
  // clearAllSprites(true);
  addEventInterval(function(arr) {
      setAreaSetting(arr[randInt(arr.length)]);
    }, 7, Infinity, ["Overworld", "Underworld", "Underwater", "Sky", "Castle"]);
}