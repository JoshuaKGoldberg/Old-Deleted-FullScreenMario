/* toned.js */
// A mini-library I use for some short, useful functions
// Pass in true to give all the functions to window

function TonedJS(give_window) {
  var toned = {
    /* Object Shenanigans */
    
    // Blindly hand all members of the donor variable to the recipient
    // Ex: give(toned, window);
    giveSup: function(donor, recipient) {
      recipient = recipient || {};
      for(var i in donor)
        recipient[i] = donor[i];
      return recipient;
    },
    // Like giveSup/erior, but it doesn't override pre-existing members
    giveSub: function(donor, recipient) {
      recipient = recipient || {};
      for(var i in donor)
        if(!recipient.hasOwnProperty(i))
          recipient[i] = donor[i];
      return recipient;
    },
    
    // Proliferates all members of the donor to the recipient recursively
    // This is more intelligent than giveSup & giveSub
    proliferate: function(recipient, donor, no_override) {
      var setting, i;
      // For each attribute of the donor
      for(i in donor) {
        // If no_override is specified, don't override if it already exists
        if(no_override && recipient.hasOwnProperty(i)) continue;
        // If it's an object, recurse on a new version of it
        if(typeof(setting = donor[i]) == "object" && setting != null) {
          if(!recipient.hasOwnProperty(i)) recipient[i] = setting instanceof Array ? [] : {};
          proliferate(recipient[i], setting, no_override);
        }
        // Regular primitives are easy to copy otherwise
        else recipient[i] = setting;
      }
      return recipient;
    },
    
    // Blindly grabs the first key or value of the object, depending on grabkey
    getFirst: function(obj, grabkey) {
      for(var i in obj) return grabkey ? i : obj[i];
    },
    
    // Blindly grabs the last key or value of the object, depending on grabkey
    getLast: function(obj, grabkey) {
      for(var i in obj) {} return grabkey ? i : obj[i];
    },
    
    // Follows a path inside an object recursively
    // Path is ["path", "to", "target"], where num is how far along the path it is
    // Num must be given at start, for performance reasons
    // To do: allow a function version?
    followPath: function(obj, path, num) {
      if(path[num] != null && obj[path[num]] != null)
        return followPath(obj[path[num]], path, ++num);
      return obj;
    },
    
    
    /* HTML Element Manipulations */
    
    // Creates an element, and uses proliferate on all the other arguments
    // * createElement()    // (just returns a new div)
    // * createElement("div", {width: "350px", style: {class: "Toned"}});
    createElement: function(type) {
      var elem = document.createElement(type || "div"),
          i = arguments.length;
      while(--i > 0) // because negative
        proliferate(elem, arguments[i]);
      return elem;
    },
    
    // Simple expressions to add/remove classes
    classAdd: function(me, strin) { me.className += " " + strin; },
    classRemove: function(me, strout) { me.className = me.className.replace(new RegExp(" " + strout, "gm"), ""); },
    
    // Position changing
    elementSetPosition: function(me, left, top) {
      if(left == undefined) left = me.left;
      if(top == undefined) top = me.top;
      proliferate(me, {
        left: left,
        top: top,
        style: {
          marginLeft: left + "px",
          marginTop: top + "px"
        }
      });
    },
    elementShiftLeft: function(me, left) {
      if(!me.left) me.left = Number(me.style.marginLeft.replace("px", ""));
      me.style.marginLeft = round(me.left += left) + "px";
    },
    elementShiftTop: function(me, top) {
      if(!me.top) me.top = Number(me.style.marginLeft.replace("px", ""));
      me.style.marginTop = round(me.top += top) + "px";
    },
    
    // Deletes an element if it's in its parent, or the body
    removeChildSafe: function(child, container) {
      if(!child) return;
      container = container || document.body;
      if(container.contains(child)) container.removeChild(child);
    },
    
    // Attempts to find the soonest parent with this tag
    findParentOfType: function(child, type) {
      var parent = child.parentElement;
      if(!parent || parent.nodeName == type) return parent;
      return findParentType(parent, type);
    },
    
    // Clears all timer events from setTimeout and setInterval
    clearAllTimeouts: function() {
      var id = setTimeout(function() {});
      while(id--) clearTimeout(id);
    },
    
    /* String manipulations */
    
    // Removes leading and trailing whitespace (thanks, IE<=8)
    stringTrim: function(me) {
      return me.replace(/^\s+|\s+$/g,''); 
    },
    // Similar to arrayOf
    stringOf: function(me, n) {
      return (n == 0) ? '' : new Array(1 + (n || 1)).join(me);
    },
    // Checks if a haystack contains a needle
    stringHas: function(haystack, needle) {
      return haystack.indexOf(needle) != -1;
    },
    // Case insensitive version of stringHas
    stringHasI: function(haystack, needle) {
      return haystack.toLowerCase().indexOf(needle.toLowerCase()) != -1;
    },
    // Capitalizes only the first 1 or n charactacters of a string
    capitalizeFirst: function(str, n) {
      n = n || 1;
      return str.substr(0,n).toUpperCase() + str.substr(n).toLowerCase();
    },
    
    /* Array manipulations */
    
    // It's nice to have X-dimensional arrays
    ArrayD: function(dim) {
      // 1-dimensionals are easy
      if(arguments.length == 1) return new Array(dim);
      // Otherwise recurse
      var rargs = arrayMake(arguments),
          me = new Array(dim),
          i;
      rargs.shift();
      for(i = dim - 1; i >= 0; --i) {
        me[i]= ArrayD.apply(this, rargs);
      }
      return me;
    },
    // Similar to stringOf
    arrayOf: function(me, n) {
      n = n || 1;
      var arr = new Array(n);
      while(n--) arr[n] = me;
      return arr;
    },
    // Looking at you, function arguments
    arrayMake: function(me) {
      return Array.prototype.slice.call(me);
    },
    // (7,10) = [7,8,9,10]
    arrayRange: function(a, b) {
      var len = 1 + b - a,
          arr = new Array(len),
          val = a, i = 0;
      while(i < len) arr[i++] = val++;
      return arr;
    },
    arrayShuffle: function(arr, start, end) {
      start = start || 0;
      end = end || arr.length;
      for(var i = start, temp, sloc; i <= end; ++i) {
        sloc = randInt(i+1);
        temp = arr[i];
        arr[i] = arr[sloc];
        arr[sloc] = temp;
      }
      return arr;
    },
    // O(n^2) removal 
    removeDuplicates: function(arr) {
      var output = [],
          me, hasdup,
          len, i, j;
      for(i = 0, len = arr.length; i < len; ++i) {
        me = arr[i];
        hasdup = false;
        for(j = 0; j < i; ++j) {
          if(arr[j] == me) {
            hasdup = true;
            break;
          }
        }
        if(!hasdup) output.push(me);
      }
      return output;
    },
    
    /* Number manipulations */
    
    // Converts ('7',3,1) to '117'
    makeDigit: function(num, size, fill) {
      num = String(num);
      return stringOf(fill || 0, max(0, size - num.length)) + num;
    },
    roundDigit: function(n, d) { return Number(d ? ~~(0.5 + (n / d)) * d : round(n)); },
    // It's often faster to store references to common Math functions
    sign: function(n) { return n ? n < 0 ? -1 : 1 : 0; },
    round: function(n) { return ~~(0.5 + n); },
    max: Math.max,
    min: Math.min,
    abs: Math.abs,
    pow: Math.pow,
    ceil: Math.ceil,
    floor: Math.floor,
    random: Math.random,
    // Returns a number between [0, n)
    randInt: function(n) { return floor(Math.random() * (n || 1)); },
    // Positives are true, negatives are false
    signBool: function(n) { return n > 0 ? true : false; },
    
    /* Etcetera */
    
    // It's nice being able log without going through console.. hopefully it gets optimized!
    log: console.log.bind(console),
    
    // Timing
    now: Date.now
  };
  
  if(give_window) toned.giveSub(toned, window);
  
  return toned;
}