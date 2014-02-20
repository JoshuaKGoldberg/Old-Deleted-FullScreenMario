/* Triggers.js */
// Keeps track of triggers, which mainly consist of key presses,
// and messages, which would be from an index.html UI

function resetTriggers() {
  // Make the controls object
  window.controls = new Controls({
    left:   [37, 65,      "AXIS_LEFT", "DPAD_LEFT"],                     // a,     left
    right:  [39, 68,      "AXIS_RIGHT", "DPAD_RIGHT"],                   // d,     right
    up:     [38, 87, 32,  "FACE_1", "DPAD_UP", "LEFT_BOTTOM_SHOULDER"],  // w,     up
    down:   [40, 83,      "AXIS_DOWN", "DPAD_DOWN"],                     // s,     down
    sprint: [16, 17,      "FACE_1"],                                     // shift, ctrl
    pause:  [80,          "START_FORWARD"],                              // p
    mute:   [77],                                                        // m
    q:      [81],                                                        // q
    l:      [76],                                                        // l
  });
  
  // Gamepad.js support for joysticks and controllers
  window.gamepad = new Gamepad();
  gamepad.bind(Gamepad.Event.BUTTON_DOWN, ControlsPipe("keydown", true));
  gamepad.bind(Gamepad.Event.BUTTON_UP, ControlsPipe("keyup", false));
  gamepad.bind(Gamepad.Event.AXIS_CHANGED, function(event) {
    var value = event.value,
        value_abs = abs(value);
    
    // Don't allow tremors
    if(value_abs < 0.1) return;
    
    // Depending on the axis used...
    switch(event.axis) {
      // Left stick, vertical
      case "LEFT_STICK_Y":
      case "RIGHT_STICK_Y":
        // If it actually has a direction, either go up or down
        if(value_abs > 0.5) {
          keydown(value > 0 ? "DPAD_DOWN" : "DPAD_UP");
        }
        // It doesn't have a direction, so they're both unpressed
        else {
          keyup("DPAD_UP");
          keyup("DPAD_DOWN");
        }
      break;
      // Left stick, horizontal
      case "LEFT_STICK_X":
      case "RIGHT_STICK_X":
        // If it actually has a direction, either go left or right
        if(value_abs > 0.5) {
          keydown(value < 0 ? "DPAD_LEFT" : "DPAD_RIGHT");
        }
        // It doesn't have a direction, so they're both unpressed
        else {
          keyup("DPAD_UP");
          keyup("DPAD_DOWN");
        }
      break;
    }
  });

  gamepad.init();

  // Set the key events on the body
  proliferate(body, {
      onkeydown: ControlsPipe("keydown", true),
      onkeyup: ControlsPipe("keyup", false),
      oncontextmenu: contextmenu,
      onmousedown: mousedown
    });
  
  // Set UI triggers
  setMessageTriggers();
}

// Hash table for onkeydown and onkeyup
function Controls(pipes, gamepadPipes) {
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
      keys.right_down = true; // independent of changes to player.keys.run
    },
    // Up / Jump
    up: function(keys) {
      keys.up = true;
      if(player.canjump &&/* !player.crouching &&*/ (player.resting || map.underwater)) {
        keys.jump = 1;
        player.canjump = keys.jumplev = 0;
        // To do: can player make a jumping sound during the spring, and during the pipe cutscenes?
        AudioPlayer.play(player.power > 1 ? "Jump Super" : "Jump Small");
        if(map.underwater) setTimeout(function() {
          player.jumping = keys.jump = false;
        }, timer * 14);
      }
    },
    // Down / Crouch
    down: function(keys) {
      keys.crouch = true;
    },
    // Sprint / Fire
    sprint: function(keys) {
      if(player.power == 3 && keys.sprint == 0 && !keys.crouch)
        player.fire();
      keys.sprint = 1;
    },
    // Pause
    pause: function(keys) {
      if(!paused && !(window.editing && !editor.playing))
        setTimeout(function() { pause(true); }, 140);
    },
    // Mute / Unmute
    mute: function(keys) {
      AudioPlayer.toggleMute();
    },
    // qqqqqqq
    q: function(keys) {
      if(++qcount > 28) maxlulz();
      switch(qcount) {
        case 7: lulz(); break;
        case 14: superlulz(); break;
        case 21: hyperlulz(); break;
      }
    },
    l: function(keys) {
      toggleLuigi();
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
      player.canjump = true;
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
    if((strict && ((player && player.dead) || window.paused)) || window.nokeys) return;

    // Allow this to be used as keyup(37) or keyup({which: 37})
    if(typeof(event) != "number" || event.which || event.control)
      event = event.which || event.control;

    // If there is a known response to this character code, do it
    if(responses[event])
      responses[event](player.keys);
    // Otherwise only complain if verbosity[name] is true
    else mlog(name, "Could not", name,  event);

    // Record this in the history
    window.gamehistory[gamecount] = [keydown, event];
  };
}

function keydown(event) {
  if((player && player.dead) || window.paused || window.nokeys) return;
  var responses = controls["keydown"];
  // Allow this to be used as keyup(37) or keyup({which: 37})
  if(typeof(event) === "object" || event.which)
    event = event.which;
  if(responses[event])
      responses[event](player.keys);

  window.gamehistory[gamecount] = [keydown, event];
}

function keyup(event) {
  if(window.nokeys) return;
  var responses = controls["keyup"];
  // Allow this to be used as keyup(37) or keyup({which: 37})
  if(typeof(event) === "object" || event.which)
    event = event.which;
  if(responses[event])
      responses[event](player.keys);

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
    TimeHandler.addEvent(entry[0], i, entry[1]);
    TimeHandler.addEvent(function() { alert(entry[0].name + ", " + entry[1]) }, i);
  }
}


function lulz(options, timer) {
  player.star = true;
  options = options || [Goomba];
  timer = timer || 7;
  TimeHandler.addEventInterval(function() {
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
  TimeHandler.addEventInterval(function(arr) {
      setAreaSetting(arr[randInt(arr.length)]);
    }, 7, Infinity, ["Overworld", "Underworld", "Underwater", "Sky", "Castle"]);
}

//Function to map a new key to a new action
function mapKeyToControl(action, keyCode) {
  
  //check if this mapping already exists
  if(window.controls.pipes[action].indexOf(keyCode) != -1) {
    return;
  }
  
  //add the new key to the current mapping
  window.controls.pipes[action].push(keyCode);
  var newPipes = window.controls.pipes;
  
  //Update the controls of the game
  window.controls = new Controls(newPipes);
  //Update the links between events and the game
  proliferate(body, {
      onkeydown: ControlsPipe("keydown", true),
      onkeyup: ControlsPipe("keyup", false),
      oncontextmenu: contextmenu,
      onmousedown: mousedown
    });
}

/* Triggers (from a UI)
*/
function setMessageTriggers() {
  // Commands will be sent in by these codes
  var command_codes = {
    setMap: triggerSetMap,
    startEditor: function() { loadEditor(); },
    toggleOption: function(data) { 
      var name = "toggle" + data.option;
      console.log(name, window[name]);
      if(window[name]) window[name]();
      else log("Could not toggle", name);
    },
	setKey: function(data) {
	  mapKeyToControl(data.action, data.keyCode);
	}
  };
  
  // When a message is received, send it to the appropriate command code
  window.addEventListener("message", function(event) {
    var data = event.data,
        type = data.type;
    // If the type is known, do it
    if(command_codes[type])
      command_codes[type](data);
    // Otherwise complain
    else {
      console.log("Unknown event type received:", type, ".\n", data);
    }
  });
}

// The UI has requested a map change
function triggerSetMap(data) {
  clearPlayerStats();
  setMap.apply(this, data.map || []);
  setLives(3);
}
