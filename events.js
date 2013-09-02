/* Events.js */
// Contains functions that deal with in-game timeouts and intervals

// Parameters are given as:
//// addEvent(
////   function(name, of, arguments) {
////     /* stuff */
////   },
////   timeout,
////   arg1, arg2, arg3
//// );
// Arguments are saved as an array, then passed in using the apply() function in handleEvents
// Duplicates functionality of setTimeout, but within the game timer
function addEvent(func, count) {
  if(!(func instanceof Function)) return false;
  count = count || 1;
  
  // Get the first two arguments out of there, as they're stored in func & count
  var args = arrayMake(arguments);
  args.splice(0, 2);
  
  // Create the event, insert it into events, then return it.
  var contents = {
    func: func,
    count: gamecount + count,
    args: args,
    timeout: count,
    repeat: true
  };
  insertSortedEvent(events, contents, contents.count);
  return contents;
}

function addEventInterval(func, count, reptimes) {
  // Usage: addEventInterval(function, timer, repetition times, ...arguments...);
  // For example: game.addEventInterval(game.scrollTime, 1, Infinity)
  if(!(func instanceof Function)) return false;
  count = count || 1;
  
  var args = arrayMake(arguments);
  // Reptimes is an extra parameter, so chop the first 3 instead of 2
  args.splice(0, 3);
  
  var contents = {
    func: func,
    count: gamecount + count,
    args: args,
    timeout: count,
    repeat: reptimes
  };
  
  contents.func.event = contents; // whoa
  
  insertSortedEvent(events, contents, contents.count);
  return contents;
}

function addEventIntervalSynched(func, count, reptimes, me, settings) {
  var calctime = count * settings.length,
      entry = ceil(gamecount / calctime) * calctime,
      scope = this,
      addfunc = function(scope, args, me) {
        me.startcount = gamecount;
        return addEventInterval.apply(scope, args);
      };
  
  // There is no difference in times, you're good to go
  if(entry == gamecount) {
    return addfunc(scope, arguments, me);
  }
  // There's a difference; delay by that much
  else {
    var dt = entry - gamecount;
    addEvent(addfunc, dt, scope, arguments, me);
  }
}

// Checks the first (soonest) event's execution time (count) against current gamecount
// While the most recent event is at exec time, it's run, then deleted
function handleEvents() {
  ++gamecount;
  var events_current = events[gamecount],
      event, repfunc,
      len, i;
  
  // If there are no events on this timer, return
  if(!events_current) return;
  
  // For each event scheduled for now:
  for(i = 0, len = events_current.length; i < len; ++i) {
    event = events_current[i];
    
    // Call the function - apply is used to pass in the arguments dynamically
    // The event is done if result is true: (by default, it's null - nothing returned)
    if(event.repeat && !event.func.apply(null, event.args)) {
      
      // If it has a count changer (Mario's running), do that
      if(event.count_changer) event.count_changer(event);
      
      // If repeat is a function, then running it determines whether to repeat
      if(event.repeat instanceof Function) {
        // Binding then calling is what actually runs the function
        repfunc = event.repeat.bind(event); 
        if(repfunc()) {
          event.count += event.timeout;
          insertSortedEvent(events, event, event.count);
        }
      }
      
      // Otherwise it's a number - decrement it and repeat if not 0.
      else {
        if(--event.repeat != 0) {
          event.count += event.timeout;
          insertSortedEvent(events, event, event.count);
        }
      }
    }
  }
  
  delete events[gamecount];
}

function insertSortedEvent(events, contents, count) {
  if(!events[count]) events[count] = [];
  events[count].push(contents);
}

function clearEvent(event) {
  if(!event) return;
  event.repeat = false;
}
function clearEventInterval(event) {
  if(!event) return;
  event.repeat = false;
}


/*
 * Sprite Cycles
 */
function addSpriteCycle(me, settings, name, timing) {
  if(!me.cycles) me.cycles = {};
  clearClassCycle(me, name);
  var cycle = me.cycles[name || 0] = setSpriteCycle(me, settings, typeof(timing) == "function" ? 0 : timing);
  if(cycle.event && typeof(timing) == "function") cycle.event.count_changer = timing;
  cycleClass(me, settings);
  return cycle;
}
function addSpriteCycleSynched(me, settings, name, timing) {
  if(!me.cycles) me.cycles = {}
  settings = settings || ["one", "two"];
  var cycle = me.cycles[name || 0] = setSpriteCycle(me, settings, timing, true);
  clearClassCycle(me, name);
  cycleClass(me, settings);
  return cycle;
}

// Repeated usage: setSpriteCycle(me, ["one", "two"]);
// To cancle, make settings or something in settings false
function setSpriteCycle(me, settings, timing, synched) {
  settings.loc = -1;
  settings.oldclass = "761deadsoldiers"; // never reached - too inconspicuous
  me.onadding = function() { 
    if(synched) settings.event = addEventIntervalSynched(cycleClass, timing || 9, Infinity, me, settings);
    else settings.event = addEventInterval(cycleClass, timing || 9, Infinity, me, settings);
  }
  if(me.placed) me.onadding();
  return settings;
}

function clearClassCycles(me, names) {
  names = names.split(" ");
  for(var i = names.length - 1; i >= 0; --i)
    clearClassCycle(me, names[i]);
}
function clearClassCycle(me, name) {
  if(!characterIsAlive(me) || !me.cycles[name]) return;
  me.cycles[name][0] = false;
  me.cycles[name].length = 1;
  delete me.cycles[name];
}
function clearAllCycles(me) {
  for(var i in me.cycles)
    clearClassCycle(me, i);
}

function cycleClass(me, settings) {
  if(!me || !settings || !settings.length) return true;
  
  if(settings.oldclass != "") removeClass(me, settings.oldclass);
  settings.loc = ++settings.loc % settings.length;
  // Current is the sprite, bool, or function currently being added and/or run
  var current = settings[settings.loc];
  if(current) {
    var name = current instanceof Function ? current(me, settings) : current;
    if(typeof(name) == "string") {
      settings.oldclass = name;
      addClass(me, name);
      return false;
    } 
    else return (name === false);
  }
  // If it's false, this will stop the loop
  else { 
    return (current === false);
  }
}

function addSpriteCycleManual(me, settings, name, timing) {
  if(!me.cycles) me.cycles = {}
  me.cycles[name || 0] = setSpriteCycleManual(me, settings, timing);
}
function setSpriteCycleManual(me, settings, timing) {
  settings.loc = -1;
  settings.oldclass = "761deadsoldiers";
  timing = (timing || 9) * timer;
  var interval = setInterval(function() {
    if(cycleClass(me, settings))
      clearInterval(interval);
  }, timing);
  return settings;
}

function removeSpriteCycle(me, name) {
  // yeah...
}


/*
   "But you were dead a thousand times. Hopeless encounters successfully won.
    A man long dead, grafted to machines your builders did not understand. You follow
    the path, fitting into an infinite pattern.
    Yours to manipulate, to destroy and rebuild.
    I know what you are.
    You are Destiny."
*/
// Call this in generator
function scrollTime(dx) {
  dx = dx || 21;
  mario.nofall = mario.nocollide = nokeys = true;
  addEventInterval(scrollMario, 1, Infinity, dx);
  
  mario.oldtop = mario.top;
  mario.siny = -Math.PI;
  addEventInterval(function() {
    setTop(mario, mario.oldtop - Math.sin(mario.siny -= .125) * unitsizet8);
  }, 1, Infinity);
  addEventInterval(function() {
    shiftVert(mario, -1.4);
    mario.oldtop -= 1.4;
  }, 1, 49);
  
  addEventInterval(function() {
    if(map.has_lakitu) killFlip(map.has_lakitu);
  }, 70);
}