/* Load.js */
// Maps and sounds are loaded via AJAX

function load() {
  log("Will have to take this out of ui.js...");
}

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
      // log("Loaded map [" + map[0] + "," + map[1] + "]");
      if(window.parentwindow && parentwindow.onmapload) {
        parentwindow.onmapload(map[0],map[1]);
        setTimeout(function() { parentwindow.onmapload(map[0],map[1]); }, 2100); // just in case
      }
      mlog("Maps", " Loaded: Maps/World" + map[0] + "" + map[1] + ".js");
    }
    // Otherwise, unless it just was a 404; return
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


/* Sounds */

function startLoadingSounds() {
  var libsounds = library.sounds;
  setTimeout(function() { loadSounds(libsounds, library.sounds.names, "Sounds/"); }, 7);
  setTimeout(function() { loadSounds(libsounds, library.sounds.themes, "Sounds/Themes/"); }, 14);
}

// Loads sounds (in order) from the reference into the container
function loadSounds(container, reference, prefix) {
  var sound, name_raw, 
      details = {
          preload: 'auto',
          prefix: '',
          name_raw: '',
          src: '',
          used: 0
        },
      len, i;
  for(i = 0, len = reference.length; i < len; ++i) {
    name_raw = reference[i];
    details.name_raw = name_raw;
    details.src = prefix + name_raw;
    
    // Create the sound and store it in the container
    sound = createElement("Audio", details);
    container[name_raw] = sound;
    mlog("Sounds", sound)
    
    // This preloads the sound.
    sound.volume = 0;
    sound.play();
  }
}