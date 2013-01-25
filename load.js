function load() {
  // Ease of use body references
  body = document.body;
  bodystyle = body.style;
  
  // Set up the rAF stuff
  window.requestAnimationFrame = window.requestAnimationFrame
                           || window.mozRequestAnimationFrame
                           || window.webkitRequestAnimationFrame
                           || window.msRequestAnimationFrame;
  window.cancelAnimationFrame = window.cancelAnimationFrame
                           || window.webkitCancelRequestAnimationFrame
                           || window.mozCancelRequestAnimationFrame
                           || window.oCancelRequestAnimationFrame
                           || window.msCancelRequestAnimationFrame
  
  // Don't attempt to ajax if on a local system, it'll just crash and you'll look like a fool
  if(window.location.protocol != "file:") {
    // Load
    ajax = new XMLHttpRequest();
    
    // Every once in a while, load setmapfuncs of loader.map using passivelyLoadMap()
    // Over-eager loading ftw!
    loader = {
      map: [1,2],
      ajax: new XMLHttpRequest(), // so it doesn't conflict with the main ajax
      sprites: new setWorker("Sprites"),
      sounds: new setWorker("Sounds")
      // To do: make this read/write the browser cookie, so it doesn't request the server every time
    };
    passivelyLoadMap();
  }
  
  // Once preloading has commenced, go to the real start() function
  start();
}

// To do: make this read to browser cookie, so it doesn't request the server every time
function passivelyLoadMap() {
  x = loader.ajax;
  x.open("GET", "Maps/World" + loader.map[0] + "" + loader.map[1] + ".js", true);
  x.send();
  x.onreadystatechange = function() {
    if(x.readyState != 4) return;
    if(x.status == 200) // Map file found, load it up
      eval("mapfuncs[loader.map[0]][loader.map[1]] = " + x.responseText);
    else if(x.status != 404) // Otherwise, unless it just was a 404, return
      return;
    setNextLevelArr(loader.map);
    if(loader.map[0] > 8) return; // Don't try to load worlds 9 and up
    setTimeout(function() { passivelyLoadMap(); }, 490);
  };
}

function setWorker(name) {
  var worker = new Worker("worker.js");
  worker.addEventListener('message', function(event) {
    alert(event.data); 
  });
  worker.postMessage(name);
  return worker;
}