function playCurrentThemeHurry(name_raw) {
  AudioPlayer.playTheme("Hurry " + (name_raw || area.theme));
}

/* AudioPlayr.js
 * A library to play audio files derived from Full Screen Mario
 * This will:
 * 1. Load files via AJAX upon startup
 * 2. Create appropriate HTML5 <audio> elements 
 * 3. Play and pause those audio files on demand
*/
function AudioPlayr(settings) {
  "use strict";
  
  /* Member variables
  */
  var version = "1.0",
  
      // A list of filenames to be turned into <audio> objects
      library,
      
      // What file types to add as sources to sounds
      filetypes,
      
      // Currently playing sound objects, keyed by name (no extensions)
      sounds,
      
      // The currently playing theme
      theme,
      
      // Whether all sounds should be muted
      muted,
      
      // Directory from which audio files are AJAXed if needed
      directory,
      
      // What name to store the value of muted under localStorage
      localStorageMuted,
      
      // The function or int used to determine what playLocal's volume is
      getVolumeLocal,
      
      // The function or string used to get a default theme name
      getThemeDefault,
      
      // Default settings used when creating a new sound
      soundSettings;
      
  /* Public play functions
  */
  
  // Public: play
  // Plays a file from the library of files
  var play = this.play = function(name_raw) {
    // First check if this is already in sounds
    var sound = sounds[name_raw];
    
    // If it's not already being played...
    if(!sound) {
      // Check for it in the library
      if(sound = library[name_raw]) {
        // Since it exists, add it to sounds
        sounds[name_raw] = sound;
      }
      // If it's not in the library, we've got a problem
      else {
        console.log("Unknown sound: '" + name_raw + "'");
        return sound;
      }
    }
    
    // Reset the sound to the start, at the correct volume
    sound.name_raw = name_raw; // just to be sure
    soundStop(sound);
    sound.volume = !muted;
    
    // This plays the sound.
    sound.play();
    
    // If this was the first time the sound was added, let it know how to stop
    if(!(sound.used++))
      sound.addEventListener("ended", function() {
        soundFinish(sound, name_raw);
      });
    
    return sound;
  }
  
  // Public: playLocal
  // Changes the volume of a sound based on distance from the reference object
  this.playLocal = function(name_raw, location) {
    // Start off with a typical sound
    var sound = play(name_raw),
        volume_real;
    
    // If that sound didn't work, quit it
    if(!sound) return sound;
    
    // There must be a user-defined way to determine what the volume should be
    switch(getVolumeLocal.constructor) {
      case Function:
        volume_real = getVolumeLocal(location);
      break;
      case Number:
        volume_real = getVolumeLocal;
      break;
      default:
        volume_real = Number(volume_real) || 1;
      break;
    }
    sound.volume = sound.volume_real = volume_real /**/ = 0; /**/;
    
    return sound;
  }
  
  // Public: playTheme
  // Plays a theme as sounds.theme via play()
  // If no theme is provided, who the hell knows
  this.playTheme = function(name_raw, resume, loop) {
    // Set loop default to true
    loop = typeof loop !== 'undefined' ? loop : true;
    
    // If name_raw isn't given, use the default getter
    if(!name_raw) 
      switch(getThemeDefault.constructor) {
        case Function:
          name_raw = getThemeDefault();
        break
        case String:
          name_raw = getThemeDefault;
        break;
      }
    
    // First make sure there isn't already a theme playing
    if(sound = theme) {
      soundStop(sound);
      theme = undefined;
      delete sounds[sound.name_raw];
    }
    
    // This creates the sound.
    var sound = theme = play(name_raw);
    sound.loop = loop;
    
    // Don't resume the sound again if specified not to
    if(!resume)
      sound.used = false;
    
    // If it's used (no repeat), add the event listener to resume theme
    if(sound.used == 1)
      sound.addEventListener("ended", this.playTheme);
    
    return sound;
  }
  
  
  /* Public utilities
  */
  
  // Public: addEventListener
  // Adds an event listener to a sound, if it exists
  this.addEventListener = function(name_raw, event, func) {
    var sound = sounds[name_raw];
    if(sound) sound.addEventListenever(event, func);
  }
  
  // Public: addEventImmediate
  // Calls a function when a sound calls a trigger, or immediately if it's not playing
  this.addEventImmediate = function(name_raw, event, func) {
    var sound = sounds[name_raw];
    if(sound && !sound.paused)
      sound.addEventListener(event, func);
    else func();
  }
  
  // Public: toggleMute
  // Swaps whether mute is enabled, saving to localStorage if needed
  this.toggleMute = function() {
    // Swap all sounds' volume on muted
    muted = !muted;
    for(var i in sounds)
      sounds[i].volume = muted ? 0 : (sounds[i].volume_real || 1);
    // If specified, store this in localStorage
    if(localStorageMuted) 
      localStorage[localStorageMuted] = muted;
  }
  
  // Public: simple pause and resume functions
  this.pause = function() { for(var i in sounds) if(sounds[i]) soundPause(sounds[i]); }
  this.resume = function() { for(var i in sounds) if(sounds[i]) soundPlay(sounds[i]); }
  this.pauseTheme = function() { if(theme) theme.pause(); }
  this.resumeTheme = function() { if(theme) theme.play(); }
  this.clear = function() {
    this.pause();
    sounds = {};
    this.theme = undefined;
  }
  
  
  /* Public gets
  */
  this.getLibrary = function() { return library; }
  this.getSounds = function() { return sounds; }
  
  /* Private utilities
  */
  
  // Called when a sound is done to get it out of sounds
  function soundFinish(sound, name_raw) {
    if(sounds[name_raw])
      delete sounds[name_raw];
  }
  
  // Quick play, pause
  function soundPlay(sound) { sound.play(); }
  function soundPause(sound) { sound.pause(); }
  
  // Carefully stops a sound
  function soundStop(sound) {
    if(sound && sound.pause) {
      sound.pause();
      if(sound.readyState)
        sound.currentTime = 0;
    }
  }
  
  
  /* Private loading / resetting
  */
  
  // Sounds given as strings are requested via AJAX
  function libraryLoad() {
    var section, name, s_name, j;
    
    // For each given section (names, themes):
    for(s_name in library) {
      section = library[s_name];
      // For each thing in that section:
      for(j in section) {
        name = section[j];
        // Create the sound and store it in the container
        library[name] = createAudio(name, s_name);
      }
    }
  }
  
  // Creates an audio element, gives it the sources, and starts preloading
  function createAudio(name, section) {
    var sound = document.createElement("Audio"),
        type, i;
    
    // Copy the default settings into the sound
    proliferate(sound, soundSettings);
    
    // Create an audio source for each child
    for(i in filetypes) {
      type = filetypes[i];
      sound.appendChild(proliferate(
        document.createElement("Source"), {
          type: "audio/" + type,
          src: directory + "/" + section + "/" + type + "/" + name + "." + type
        }
      ));
    }
    
    // This preloads the sound.
    sound.play();
    
    return sound;
  }
  
  // (This function copied from toned.js)
  // Copies everything from settings into the elem
  function proliferate(elem, settings) {
    var setting, i;
    for(i in settings) {
      if(typeof(setting = settings[i]) == "object") {
        if(!elem[i]) elem[i] = {};
        proliferate(elem[i], setting);
      }
      else elem[i] = setting;
    }
    return elem;  
  }
  
  /* Reset
  */
  function reset(settings) {
    library           = settings.library           || {};
    filetypes         = settings.filetypes         || ["mp3", "ogg"];
    muted             = settings.muted             || false;
    directory         = settings.directory         || "";
    localStorageMuted = settings.localStorageMuted || "";
    getVolumeLocal    = settings.getVolumeLocal    || 1;
    getThemeDefault   = settings.getThemeDefault   || "Theme";
    
    // Each sound starts with some certain settings
    var soundSetsRef  = settings.soundSettings     || {}
    soundSettings     = settings.soundSettings     || {
      preload: soundSetsRef.preload   || "auto",
      used:    0,
      volume:  0
    };
    
    // Sounds should always start blank
    sounds = {};
    
    // If specified, use localStorageMuted to record muted's value
    if(localStorageMuted)
      muted = localStorage[localStorageMuted];
    
    // Preload everything!
    libraryLoad();
  }
  
  reset(settings || {});
}
