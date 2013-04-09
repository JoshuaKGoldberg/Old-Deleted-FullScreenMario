// Main is whether it should override the main background music
// Override is...
//// ...Main = true: whether main loops?
//// ...Main = false: whether the main music pauses
function play(name, main, override) {
  // return false;
  var div = new Audio("Sounds/" + name);  
  div.name = name;
  
  // This does become the main theme
  if(main) {
    if(sounds[0]) {
      if(sounds[0].name == name) return;
      pauseTheme();
      sounds.splice(sounds.indexOf(div), 1);
    }
    sounds[0] = div;
    div.loop = override;
  }
  
  // This does not become the main theme
  else {
    div.addEventListener("canplaythrough", function() {
      setTimeout(function() {
        div.pause();
        sounds.splice(sounds.indexOf(div), 1);
      }, div.duration * 1000);
    });
    sounds.push(div);
    // The main theme is paused during this
    if(override && sounds[0]) {
      pauseTheme();
    }
  }
  
  div.volume = muted ? 0 : 1;
  div.volume_real = 1;
  div.play();
  return div;
}

// The same as regular play, but with lower volume when further from Mario
function playLocal(xloc, name, main, override) {
  var sound = play(name, main, override);
  if(!sound) return;
  if(!mario) sound.volume = sound.volume_real = 1;
  else {
    var volume_real = min(1, 1.4 * (screen.width - abs(xloc - mario.left)) / screen.width);
    // IndexSizeError: DOM Exception 1 pops up a lot without the try brackets
    try {
      sound.volume = volume_real;
      sound.volume_real = volume_real;
    }
    catch(err) {
      // console.log("Error in playLocal: " + err);
    }
  }
}

// Messes up pipe sounds
function clearSounds() {
  // alert("Clearing sounds?")
  if(!sounds || sounds.length == 0) return;
  // alert("Yes: " + sounds.toString());
  for(var i=sounds.length-1; i>=0; --i)
    if(sounds[i])
      sounds[i].pause();
  // sounds.length = 0;
}

function pauseTheme() {
  if(sounds && sounds[0]) sounds[0].pause();
  if(window.theme) theme.pause();
}

function toggleMute() {
  var level = !(data.muted = muted = !muted);
  for(var i = sounds.length - 1; i >= 0; --i)
    sounds[i].volume = level ? sounds[i].volume_real : 0;
  theme.volume = level;
}