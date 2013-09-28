/* Sounds.js */
// Stores sounds in a global sounds object, to be played back on command

// Starts pre-emptively loading sounds (see load.js::startLoadingSOunds)
// All sounds are stored in library.sounds, while ones used in this run are also in window.sounds
function resetSounds() {
  window.sounds = {};
  window.theme = false;
  window.muted = (localStorage.muted == "true");
}


// Override is whether the main music pauses
function play(name_raw, override) {
  // First check if this is already in sounds
  var name = "Sounds/" + name_raw,
      sound = sounds[name_raw];
  
  // Is this even needed?
  if(override) log("Play as override?!", arguments);
  
  // If it's not already being played,
  if(!sound) {
    // Check for it in the library
    if(sound = library.sounds[name_raw]) {
      sounds[name_raw] = sound;
    }
    // Otherwise it's not known, complain
    else {
      log("Unknown sound: '" + name_raw + "'");
      return sound;
    }
  }
  
  // Reset the sound, then play it
  if(sound.readyState) {
    sound.pause();
    sound.currentTime = 0;
  }
  sound.volume = !muted;
  sound.play();
  
  // If this is the first time the sound was added, let it know how to stop
  if(!(sound.used++)) sound.addEventListener("ended", function() { mlog("Sounds", sound); soundFinish(sound, name_raw); });
  
  return sound;
}

// The same as regular play, but with lower volume when further from Mario
function playLocal(name, xloc, main, override) {
  var sound = play(name, main, override),
      volume_real;
  // Don't do anything without having played a sound, or if there's no actual Mario
  if(!sound || !window.mario) return;
  
  // If it's out of bounds (or muted), the volume is 0
  if(muted || xloc < 0 || xloc > gamescreen.unitwidth) volume_real = 0;
  // Otherwise it's a function of how far the thing is from Mario
  else volume_real = max(.14, min(.84, 1.4 * (gamescreen.unitwidth - abs(xloc - mario.left)) / gamescreen.unitwidth));
  
  sound.volume = volume_real;
  sound.volume_real = volume_real;
}


// Plays a theme as sounds.theme via play()
// If no theme is provided, it plays the area's theme
function playTheme(name_raw, resume) {
  // First make sure there isn't already a theme playing
  if(sound = sounds.theme) {
    soundStop(sound);
    delete sounds.theme;
    delete sounds[sound.name_raw];
  }
  
  // If the name doesn't exist, get it from the current area
  if(!name_raw) name_raw = area.theme;
  // They all happen to end with .mp3...
  name_raw += ".mp3";
  
  // This creates the sound.
  var sound = sounds.theme = play(name_raw);
  sound.loop = true;
  
  // If it's only used once, add the event listener to resume theme
  if(sound.used == 1) sound.addEventListener("ended", playTheme);
  
  return sound;
}
// The equivalent of playTheme with Hurry added on
function playCurrentThemeHurry(name_raw) {
  playTheme("Hurry " + (name_raw || area.theme));
}

// Called when a sound is done to get it out of sounds
function soundFinish(sound, name_raw) {
  if(sounds[name_raw]) delete sounds[name_raw];
}

function soundStop(sound) {
  // If this sound has a readyState, stop it
  if(sound) {
    sound.pause();
    if(sound.readyState) sound.currentTime = 0;
  }
}

function toggleMute() {
  var level = !(localStorage.muted = data.muted = muted = !muted);
  for(var i in sounds) sounds[i].volume = level;
}

function pauseAllSounds() { for(var i in sounds) sounds[i].pause(); }
function resumeAllSounds() { for(var i in sounds) sounds[i].play(); }
function pauseTheme() { if(sounds.theme) sounds.theme.pause(); }
function resumeTheme() { if(sounds.theme) sounds.theme.play(); }
