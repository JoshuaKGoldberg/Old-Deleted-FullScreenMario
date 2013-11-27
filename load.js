/* Load.js */
// Maps are loaded via AJAX

/* Maps */

function startLoadingMaps() {
    // Don't attempt to ajax if on a local system, it'll just crash and you'll look like a fool
  if(window.location.protocol == "file:") return;
    
  // Over-eager loading ftw!
  passivelyLoadMap([1,2], new XMLHttpRequest());
}

// Finds a map, parses it, then recurses on the next map
function passivelyLoadMap(map, ajax) {
  // Don't try to load worlds 9 and up
  if(!map || map[0] > 8 || map[1] <= 0) return;
  
  // Maps/WorldXY.js
  var url = "Maps/World" + map[0] + "" + map[1] + ".js"
  ajax.open("GET", url, true);
  mlog("Maps", "Requesting:", url);
  ajax.send();
  ajax.onreadystatechange = function() {
    if(ajax.readyState != 4) return;
    
    // Map file found, load it up!
    if(ajax.status == 200) {
      // This is potentially insecure, so I'd like to use an editor-style JSON arrangement instead..
      mapfuncs[map[0]][map[1]] = Function(ajax.responseText);
      if(window.parentwindow && parentwindow.onMapLoad) {
        parentwindow.onMapLoad(map[0],map[1]);
        setTimeout(function() { parentwindow.onMapLoad(map[0],map[1]); }, 2100); // just in case
      }
      mlog("Maps", " Loaded: Maps/World" + map[0] + "" + map[1] + ".js");
    }
    // Otherwise, unless it just was a 404, return
    else if(ajax.status != 404) return;
    
    setTimeout(function() { passivelyLoadMap(setNextLevelArr(map), ajax); }, 7);
  };
}

function setNextLevelArr(arr) {
  if(arr[1]++ == 4) {
    ++arr[0];
    arr[1] = 1;
  }
  return arr;
}