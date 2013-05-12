function load() {
  // Ease of use body references
  body = document.body;
  bodystyle = body.style;
  
  // Disable common ways of scrolling
  // window.addEventListener('DOMMouseScroll', function(e) { preventDefault(e); }, false);
  // window.onmousewheel = document.onmousewheel = function(e) { preventDefault(e); };

  // Set up the rAF stuff
  window.requestAnimationFrame = window.requestAnimationFrame
                           || window.mozRequestAnimationFrame
                           || window.webkitRequestAnimationFrame
                           || window.msRequestAnimationFrame
                           || function(func) { setTimeout(func, timer); };
  window.cancelAnimationFrame = window.cancelAnimationFrame
                           || window.webkitCancelRequestAnimationFrame
                           || window.mozCancelRequestAnimationFrame
                           || window.oCancelRequestAnimationFrame
                           || window.msCancelRequestAnimationFrame
                           || clearTimeout;
  
  // Don't attempt to ajax if on a local system, it'll just crash and you'll look like a fool
  if(window.location.protocol != "file:") {
    // Use Ajax to get the maps, and store them in localStorage
    ajax = new XMLHttpRequest();
    
    // Every once in a while, load setmapfuncs of loader.map using passivelyLoadMap()
    // Over-eager loading ftw!
    loader = {
      map: [1,2],
      ajax: new XMLHttpRequest(), // so it doesn't conflict with the main ajax
      // sprites: new setWorker("Sprites"),
      // sounds: new setWorker("Sounds")
    };
    // After a little bit, start loading maps
    setTimeout(function() { addEvent(passivelyLoadMap, 1); }, 700);
  }
  
  // Once preloading has commenced, go to the real start() function
  start();
}

function passivelyLoadMap() {
  x = loader.ajax;
  x.open("GET", "Maps/World" + loader.map[0] + "" + loader.map[1] + ".js", true);
  x.send();
  x.onreadystatechange = function() {
    if(x.readyState != 4) return;
    
    // Map file found, load it up!
    if(x.status == 200) {
      mapfuncs[loader.map[0]][loader.map[1]] = Function(x.responseText);
      console.log("Loaded map [" + loader.map[0] + "," + loader.map[1] + "]");
      if(window.parentwindow && parentwindow.onmapload) {
        parentwindow.onmapload(loader.map[0],loader.map[1]);
        setTimeout(function() { parentwindow.onmapload(loader.map[0],loader.map[1]); }, 2100); // just in case
      }
    }
    
    else if(x.status != 404) return; // Otherwise, unless it just was a 404, return
    
    setNextLevelArr(loader.map);
    if(loader.map[0] > 8) return; // Don't try to load worlds 9 and up
    setTimeout(function() { passivelyLoadMap(); }, 7);
  };
}

function setWorker(name) {
  var worker = new Worker("worker.js");
  worker.addEventListener('message', function(event) {
    alert(event.data); // never really used except for testing
  });
  worker.postMessage(name);
  return worker;
}

function manuallyLoadMap(one, two, set) {
  if(one instanceof Array) {
    set = two;
    two = one[1];
    one = one[0];
  }
  var x = new XMLHttpRequest();
  x.open("POST", "Maps/World" + one + "" + two + ".js?random=" + Math.random(), false);
  x.send();
  x.onreadystatechange = function() {
    if(x.readyState != 4) return;
    mapfuncs[one][two] = Function(x.responseText);
    return;
  };
}