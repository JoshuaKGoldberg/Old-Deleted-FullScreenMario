var loadstart,
    // Security fixes
    isLocal,
    // References
    elemGame,
    game,
    body,
    elemSelect;

function start() {
  // Don't double start
  if(window.loadstart) return;
  window.loadstart = true;
  
  // Know whether this is being run locally
  setLocalStatus();
  
  // Quick UI references
  setReferences();
  
  // Map selection
  setMapSelector();
  
  // Level editor
  setLevelEditor();
  
  // Make lots of friends
  setCheats();
}

function setLocalStatus() {
  window.isLocal = window.location.origin == "file://";
}

function setReferences() {
  // Set the game references (elemGame is not the same as the content window)
  window.elemGame = document.getElementById("game");
  window.game = window.elemGame.contentWindow;
  // Local games may not allow contentWindow shenanigans
  if(!isLocal)
    window.game.parentwindow = window;
  
  window.body = document.body;
  window.elemSelect = document.getElementById("in_mapselect");
}

function setMapSelector(timed) {
  // If this isn't ready and hasn't tried before, try it again
  if(!window.elemSelect && !timed)
    setTimeout(function() {
      setMapSelector(true);
    }, 350);
  
  // Get HTML each of the 32 levels' blocks in order
  var innerHTML = "",
      i, j;
  for(i = 1; i <= 8; ++i)
    for(j = 1; j <= 4; ++j)
      innerHTML += createAdderMap(i, j);
  
  // Add that HTML to #in_mapselect, along with a big one for random maps
  elemSelect.innerHTML += innerHTML + createAdderBigMap("Map Generator!", "setGameMapRandom");
  
  // If this isn't local, actually responding to the game loading maps is doable
  // See load.js
  if(!isLocal) {
    // This will allow for onMapLoad
    game.parentwindow = window;
    
    // If the game already has a map, set the class to be loaded
    var elem;
    for(i = 1; i <= 8; ++i)
      for(j = 1; j <= 4; ++j) {
        console.log("World" + i + String(j), game["World" + i + String(j)]);
        if(game["World" + i + String(j)] && (elem = document.getElementById("maprect" + i + "," + j)))
          elem.className = "maprect";
      }
  }
}

function createAdderMap(i, j) {
  var adder = "";
  adder += "<div class='maprectout'>";
  adder += "<div id='maprect" + i + "," + j;
  adder += "' class='maprect" +  (isLocal ? "" : " off") + "' onclick='setGameMap(" + i + "," + j + ")'>";
  adder += i + "-" + j;
  adder += "</div></div>";
  return adder;
}

function createAdderBigMap(name, onclick, giant) {
  var adder = "";
  adder += "<div class='maprectout'>";
  adder += "<div class='maprect big " + (giant ? "giant" : "" ) + "' onclick='" + onclick + "()'>";
  adder += name;
  adder += "</div></div>";
  return adder;
}

function setGameMap(one, two) {
  // If it hasn't been loaded yet, don't do anything
  if(document.getElementById("maprect" + one + "," + two).className != "maprect")
    return;
  
  // Otherwise go to the map
  game.postMessage({
    type: "setMap",
    map: [one, two]
  }, "*");
  game.focus();
}

// See load.js
function onMapLoad(one, two) {
  var elem = document.getElementById("maprect" + one + "," + two);
  if(elem)
    elem.className = "maprect";
}

function setGameMapRandom() {
  game.postMessage({
    type: "setMap",
    map: ["Random", "Overworld"]
  }, "*");
  game.focus();
}

function setLevelEditor() {
  var out = document.getElementById("in_editor"),
      blurb = "Why use Nintendo's?<br />";
  button = createAdderBigMap("Make your<br />own levels!", "startEditor", true);
  out.innerHTML += blurb + button + "<br />You can save these as text files when you're done.";
}

function startEditor() {
  game.postMessage({
    type: "startEditor"
  }, "*");
  game.focus();
}


function setCheats() {
  var i;
  console.log("Hi, thanks for playing Full Screen Mario! I see you're using the console.");
  console.log("There's not really any way to stop you from messing around so if you'd like to know the common cheats, enter \"displayCheats()\" here.");
  console.log("If you'd like, go ahead and look around the source code. There are a few surprises you might have fun with... ;)");
  console.log("http://www.github.com/DiogenesTheCynic/FullScreenMario");
  window.cheats = {
    Change_Map: "game.setMap([#,#] or #,#);",
    Change_Map_Location: "game.shiftToLocation(#);",
    Fast_Forward: "game.fastforward(amount; 1 by default);",
    Life: "game.gainLife(# amount or Infinity)",
    Low_Gravity: "game.mario.gravity = game.gravity /= 2;",
    Lulz: "game.lulz();",
    Random_Map: "game.setMapRandom();",
    Shroom: "game.marioShroom(game.mario)",
    Star_Power: "game.marioStar(game.mario)",
    Unlimited_Time: "game.data.time.amount = Infinity;"
  }
  cheatsize = 0;
  for(var i in cheats)
    cheatsize = Math.max(cheatsize, i.length);
}

function displayCheats() {
  console.log("These are stored in the global 'cheats' object, by the way.");
  for(i in cheats)
    printCheat(i, cheats[i]);
  return "Have fun!";
}

function printCheat(name, text) {
  for (i = cheatsize - name.length; i > 0; --i)
    name += ".";
  console.log(name.replace("_", " ") + "...... " + text);
}
