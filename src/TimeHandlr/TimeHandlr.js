/* TimeHandlr.js
 * A timed events library derived from Full Screen Mario
 * This has two functions:
 * 1. Provide a flexible alternative to setTimeout and setInterval that
 *    respects pauses and resumes in time (such as from game pauses)
 * 2. Provide functions to automatically 'cycle' between certain classes
 *    on an object
*/

function TimeHandlr(settings) {
  "use strict";
  
  /* Member Variables
  */
  var version = "1.0",
      
      // The current (most recently reached) game time
      time,
  
      // An int->event hash table of events to be run
      events,
      
      // Default attribute names, so they can be overriden
      cycles,
      className,
      onSpriteCycleStart,
      doSpriteCycleStart,
      cycleCheckValidity,
      
      // Default time separations
      timingDefault,
      
      // Function handlers
      addClass,
      removeClass;
  
  /* Simple gets
  */
  this.getTime   = function() { return time; };
  this.getEvents = function() { return events; };
  
  /* Event Adding (simple)
   * Sample usage:
   * addEvent(
   *   function(name, of, arguments) { ... },
   *   time_until_execution,
   *   arg1, arg2, arg3
   * );
  */
  
  // Public: addEvent
  // Equivalent to setTimeout
  // Adds a function to execute at a particular time, with arguments
  var addEvent = this.addEvent = function(func, time_exec) {
    // Make sure func is actually a function
    if(!(func instanceof Function)) {
      console.warn("Attempting to add an event that isn't a function.");
      console.log(arguments);
      return false;
    }
    time_exec = time_exec || 1;
    
    // Grab arguments to be passed to the function, excluding func and time_exec
    var args = arrayMake(arguments);
    args.splice(0,2);
    
    // Create the event, keeping track of start and end times
    var event = {
      func: func,
      time_exec: time + time_exec,
      time_repeat: time_exec,
      args: args,
      repeat: 1
    };
    
    // Add the event to events, then return it
    insertEvent(event, event.time_exec);
    return event;
  };
  
  // Public: addEventInterval
  // Equivalent to setInterval
  // Similar to addEvent, but it will be repeated a specified number of times
  // Time delay until execution is the same as the time between subsequent executions
  var addEventInterval = this.addEventInterval = function(func, time_exec, num_repeats) {
    // Make sure func is actually a function
    if(!(func instanceof Function)) {
      console.warn("Attempting to add an event that isn't a function.");
      console.log(arguments);
      return false;
    }
    time_exec = time_exec || 1;
    num_repeats = num_repeats || 1;
    
    // Grab arguments to be passed, excluding func, time_exec, and num_repeats
    var args = arrayMake(arguments);
    args.splice(0, 3);
    
    // Create the event, keeping track of start and end times, and repetitions
    var event = {
      func: func,
      time_exec: time + time_exec,
      time_repeat: time_exec,
      args: args,
      repeat: num_repeats
    };
    
    // These may need to have a reference to the event from the function
    func.event = event;
    
    // Add the event to events, then return it
    insertEvent(event, event.time_exec);
    return event;
  };
  
  // Public: addEventIntervalSynched
  // Delays the typical addEventInterval until it's synched with time
  // (this goes by basic modular arithmetic)
  var addEventIntervalSynched = this.addEventIntervalSynched = function(func, time_exec, num_repeats, me, settings) {
    var calctime = time_exec * settings.length,
        entry = ceil(time / calctime) * calctime,
        scope = this,
        addfunc = function(scope, args, me) {
          me.startcount = time;
          return addEventInterval.apply(scope, args);
        };
    time_exec = time_exec || 1;
    num_repeats = num_repeats || 1;
    
    // If there's no difference in times, you're good to go
    if(entry == time) {
      return addfunc(scope, arguments, me);
    }
    // Otherwise it should be delayed until the time is right
    else {
      var dt = entry - time;
      addEvent(addfunc, dt, scope, arguments, me);
    }
  };
  
  // Quick handler to add an event at a particular time
  // An array must exist so multiple events can be at the same time
  function insertEvent(event, time) {
    // If it doesn't yet have an array, event will be the only contents
    if(!events[time]) return events[time] = [event];
    // Otherwise push it to there
    events[time].push(event);
    return events[time];
  }
  
  
  /* Event Removing (simple)
  */
  
  // Public: clearEvent
  // Makes an event not happen again
  var clearEvent = this.clearEvent = function(event) {
    if(!event) return;
    // Telling it not to repeat anymore is enough
    event.repeat = 0;
  };
  
  // Public: clearAllEvents
  // Completely cancels all events
  var clearAllEvents = this.clearAllEvents = function() {
    events = {};
  };
  
  // Given an object, clear its class cycle under a given name
  var clearClassCycle = this.clearClassCycle = function(me, name) {
    if(!me[cycles] || !me[cycles][name]) return;
    var cycle = me[cycles][name];
    cycle[0] = false;
    cycle.length = false;
    delete me[cycles][name];
  };
  
  // Given an object, clear all its class cycles
  var clearAllCycles = this.clearAllCycles = function(me) {
    var cycles = me[cycles],
        name, cycle;
    for(name in cycles) {
      cycle = cycles[name];
      cycle[0] = false;
      cycle.length = 1;
      delete cycles[name];
    }
  };
  
  /* Sprite Cycles (advanced)
   * Functions to cycle a given objects [className] attribute through an array of names
   * Sample usage:
   * addSpriteCycle(
   *   me,
   *   ["run_one", "run_two", "run_three"]
   *   "running",
   *   7
   * );
   * Note: These require handlers from the user, such as those given by FullScreenMario
  */
  
  // Public: addSpriteCycle
  // Sets a sprite cycle (settings) for an object under name
  var addSpriteCycle = this.addSpriteCycle = function(me, settings, name, timing) {
    // Make sure the object has a holder for cycles...
    if(!me[cycles]) me[cycles] = {};
    // ...and nothing previously existing for that name
    clearClassCycle(me, name);
    
    var timingIsFunc = typeof(timing) == "function";
    name = name || 0;
    
    // Set the cycle under me[cycles][name]
    var cycle = me[cycles][name] = setSpriteCycle(me, settings, timingIsFunc ? 0 : timing);
    
    // If there is a timing function, make it the count changer
    if(cycle.event && timingIsFunc)
      cycle.event.count_changer = timing;
      
    // Immediately run the first class cycle, then return
    cycleClass(me, settings);
    return cycle;
  };
  
  // Public: addSpriteCycleSynched
  // Delays the typical addSpriteCycle until it's synched with time
  // (Note: very similar to addSpriteCycle, and could probably be combined)
  var addSpriteCycleSynched = this.addSpriteCycleSynched = function(me, settings, name, timing) {
    // Make sure the object has a holder for cycles...
    if(!me[cycles]) me[cycles] = {};
    // ...and nothing previously existing for that name
    clearClassCycle(me, name);
    
    // Set the cycle under me[cycles][name]
    name = name || 0;
    var cycle = me[cycles][name] = setSpriteCycle(me, settings, timing, true);
    
    // Immediately run the first class cycle, then return
    cycleClass(me, settings);
    return cycle;
  };
  
  // Initializes a sprite cycle for an object
  function setSpriteCycle(me, settings, timing, synched) {
    // Start off before the beginning of the cycle
    settings.loc = settings.oldclass = -1;
    
    // Let the object know to start the cycle when needed
    var func = synched ? addEventIntervalSynched : addEventInterval;
    me[onSpriteCycleStart] = function() { func(cycleClass, timing || timingDefault, Infinity, me, settings); };
    
    // If it should already start, do that
    if(me[doSpriteCycleStart])
      me[onSpriteCycleStart]();
    
    return settings;
  }
  
  // Moves an object from its current class in the sprite cycle to the next one
  function cycleClass(me, settings) {
    // If anything has been invalidated, return true to stop
    if(!me || !settings || !settings.length) return true;
    if(cycleCheckValidity != null && !me[cycleCheckValidity]) return true;
    
    // Get rid of the previous class, from settings (-1 by default)
    if(settings.oldclass != -1 && settings.oldclass !== "")
      removeClass(me, settings.oldclass);
    
    // Move to the next location in settings, as a circular list
    settings.loc = ++settings.loc % settings.length;
    
    // Current is the sprite, bool, or function currently being added and/or run
    var current = settings[settings.loc];
    // If it isn't false or non-existant, (run if needed and) get it as the next name
    if(current) {
      var name = current instanceof Function ? current(me, settings) : current;
      
      // If the next name is a string, set that as the old class, and add it
      if(typeof(name) == "string") {
        settings.oldclass = name;
        addClass(me, name);
        return false;
      }
      // For non-strings, return true (to stop) if the name evaluated to be false
      else return (name === false);
    }
    // Otherwise since current was false, return true (to stop) if it's === false 
    else return (current === false);
  }
  
  /* Event Handling
  */
  
  // Public: handleEvents
  // Increments time and runs all events at the new events[time]
  this.handleEvents = function() {
    ++time;
    var events_current = events[time];
    if(!events_current) return; // If there isn't anything to run, don't even bother
    
    var event, len, i;
        
    // For each event currently scheduled:
    for(i = 0, len = events_current.length; i < len; ++i) {
      event = events_current[i];
      
      // Call the function, using apply to pass in arguments dynamically
      // If running it returns true, it's done; otherwise check if it should go again
      if(event.repeat > 0 && !event.func.apply(this, event.args)) {
        
        // If it has a count changer (and needs to modify itself), do that
        if(event.count_changer) event.count_changer(event);
        
        // If repeat is a function, running it determines whether to repeat
        if(event.repeat instanceof Function) {
          // Binding then calling is what actually runs the function
          if((event.repeat.bind(event))()) {
            event.count += event.time_repeat;
            insertEvent(event, event.time_exec);
          }
        }
        // Otherwise it's a number: decrement it, and if it's > 0, repeat.
        else if(--event.repeat > 0) {
          event.time_exec += event.time_repeat;
          insertEvent(event, event.time_exec);
        }
      }
    }
    
    // Once all these events are done, ignore the memory
    delete events[time];
  };
  
  /* Utility functions
  */
  
  // Looking at you, function arguments
  function arrayMake(args) {
    return Array.prototype.slice.call(args);
  }

  // Simple expressions to add/remove classes
  function classAdd(me, strin) {
    me.className += " " + strin;
  }
  function classRemove(me, strout) {
    me.className = me.className.replace(new RegExp(" " + strout, "gm"), "");
  }

  // Quick reference for math
  var ceil = Math.ceil;
  
  /* Reset
  */
  
  function reset(settings) {
    time               = settings.time               || 0;
    events             = settings.events             || {};
    // Attribute names
    cycles             = settings.cycles             || "cycles";
    className          = settings.className          || "className";
    onSpriteCycleStart = settings.onSpriteCycleStart || "onSpriteCycleStart";
    doSpriteCycleStart = settings.doSpriteCycleStart || "doSpriteCycleStart";
    cycleCheckValidity = settings.cycleCheckValidity;
    // Timing numbers
    timingDefault      = settings.timingDefault      || 7;
    // Function handlers
    addClass           = settings.addClass           || window.addClass       || classAdd;
    removeClass        = settings.removeClass        || window.removeClass    || classRemove;
  }
  
  reset(settings || {});
}