/* Triggers.js */
// Keeps track of triggers, which mainly consist of key presses

function resetTriggers() {
  // Make the controls object
  window.controls = new Controls({
    left: [37, 65],       // a,     left
    right: [39, 68],      // d,     right
    up: [38, 87, 32],     // w,     up
    down: [40, 83],       // s,     down
    sprint: [16, 17],     // shift, ctrl
    pause: [80],          // p
    mute: [77],           // m
    qcount: [81]          // q
  });
  
  // Set the key events on the body
  proliferate(body, {
      onkeydown: ControlsPipe("keydown", true),
      onkeyup: ControlsPipe("keyup", false),
      oncontextmenu: contextmenu,
      onmousedown: mousedown
    });
}

// Hash table for onkeydown and onkeyup
function Controls(pipes) {
  // Pipes is a listing of which actions are piped to by which character codes
  this.pipes = pipes;
  
  // Actions are piped to the corresponding keydown or keyup via the corresponding ControlsPipe
  var keydown = this.keydown = {
    // Left
    left: function(keys) {
      keys.run = -1;
      keys.left_down = true;
    },
    // Right
    right: function(keys) {
      keys.run = 1;
      keys.right_down = true; // independent of changes to mario.keys.run
    },
    // Up / Jump
    up: function(keys) {
      keys.up = true;
      if(mario.canjump &&/* !mario.crouching &&*/ (mario.resting || map.underwater)) {
        keys.jump = 1;
        mario.canjump = keys.jumplev = 0;
        // To do: can mario make a jumping sound during the spring, and during the pipe cutscenes?
        if(mario.power > 1) play("Jump Super");
        else play("Jump Small");
        if(map.underwater) setTimeout(function() {
          mario.jumping = keys.jump = false;
        }, timer * 14);
      }
    },
    // Down / Crouch
    down: function(keys) {
      keys.crouch = true;
    },
    // Sprint / Fire
    sprint: function(keys) {
      if(mario.power == 3 && keys.sprint == 0 && !keys.crouch)
        mario.fire();
      keys.sprint = 1;
    },
    // Pause
    pause: function(keys) {
      if(!paused && !(window.editing && !editor.playing))
        setTimeout(function() { pause(true); }, 140);
    },
    // Mute / Unmute
    mute: function(keys) {
      toggleMute();
    },
    // qqqqqqq
    q: function(keys) {
      if(++qcount > 28) maxlulz();
      switch(qcount) {
        case 7: lulz(); break;
        case 14: superlulz(); break;
        case 21: hyperlulz(); break;
      }
    }
  };
  var keyup = this.keyup = {
    // Left
    left: function(keys) {
      keys.run = 0;
      keys.left_down = false;
    },
    // Right
    right: function(keys) {
      keys.run = 0;
      keys.right_down = false;
    },
    // Up
    up: function(keys) {
      if(!map.underwater) keys.jump = keys.up = 0;
      mario.canjump = true;
    },
    // Down
    down: function(keys) {
      keys.crouch = 0;
      removeCrouch();
    },
    // Spring
    sprint: function(keys) {
      keys.sprint = 0;
    },
    // Pause (if held down)
    pause: function(keys) {
      unpause(true);
    },
  }
  
  var tag, codes, code, i;
  // Map each character code in pipes to the corresponding key event
  // For each tag ("up", "down"...)
  for(tag in pipes) {
    // For each array of character codes, like 38 (up) or 40 (down) 
    codes = pipes[tag];
    for(i in codes) {
      code = codes[i];
      // That code redirects to the equivalent tag (38 -> "up")
      keydown[code] = keydown[tag];
      keyup[code] = keyup[tag];
    }
  }
}

// Generates a pipe to the given name
// For example, ControlsPipe("keydown") pipes to Controls.keydown
function ControlsPipe(name, strict) {
  var responses = controls[name];
  return function(event) {
    if((strict && ((mario && mario.dead) || window.paused)) || window.nokeys) return;
    
    // Allow this to be used as keyup(37) or keyup({which: 37})
    if(typeof(event) != "number" || event.which)
      event = event.which;
    
    // If there is a known response to this character code, do it
    if(responses[event])
      responses[event](mario.keys);
    // Otherwise only complain if verbosity[name] is true
    else mlog(name, "Could not", name,  event);
    
    // Record this in the history
    window.gamehistory[gamecount] = [keydown, event];
  }
}

function keydown(event) {
  if((mario && mario.dead) || window.paused || window.nokeys) return;
  
  // Allow this to be used as keyup(37) or keyup({which: 37})
  if(typeof(event) != "number" || event.which)
    event = event.which;
  
  window.gamehistory[gamecount] = [keydown, event];
}

function keyup(event) {
  if(window.nokeys) return;
  
  // Allow this to be used as keyup(37) or keyup({which: 37})
  if(typeof(event) != "number" || event.which)
    event = event.which;
  
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
function maxlulz() {
  // Sigh....
  // window.palette = arrayShuffle(window.palette, 1);
  // clearAllSprites(true);
  addEventInterval(function(arr) {
      setAreaSetting(arr[randInt(arr.length)]);
    }, 7, Infinity, ["Overworld", "Underworld", "Underwater", "Sky", "Castle"]);
}