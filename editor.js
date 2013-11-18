/* Editor.js */
// Contains all the functions needed to load and use the editor
// Gives a UI for selecting Things and their options
// When done, it makes map based off what's still placed

/* Stuff to do:
---------------
  * Add platforms back in (and a few other missing Things)
  * Give options for different areas

*/


function loadEditor(noreset) {
  // Make sure there aren't any other instances of this
  editorClose();
  
  // If you want to clear the current map
  if(!noreset) {
    window.canedit = true;
    setMap(["Special", "Blank"]);
    window.canedit = false;
  }
  
  // Set the library and controls
  setEditorLibrary();
  setEditorHTML();
  setEditorControls();
  setEditorTriggers();
  setEditorLocalRetrieval();
  
  // Visually update
  classAdd(body, "editor");
  classAdd(editor.sidebar, "expanded");
  TimeHandler.addEvent(classRemove, 35, editor.sidebar, "expanded");
  
  // Let the rest of the game know what's going on
  map.shifting = false;
  window.editing = true;
}

// To do: Merge this into the main library, 
// and make Things.js use it for constructors
function setEditorLibrary() {
  // The editor contains the placeable solids and characters
  window.editor = {
    xloc: 0,
    yloc: 0,
    playing: false,
    canplace: true,
    offset: { x: unitsizet2 }, // max is set upon running, if actually needed
    settings: {
      night: false,
      setting: "Overworld",
      alt: false
    },
    defaults: {
      width: 8,
      height: 8,
      widthoff: 0,
      heightoff: 0,
      minimum: 1,
      followerUpdate: editorFollowerUpdateStandard,
      prefunc: pushPreThing,
      outerok: true
    },
    placed: [],
    characters: {
      Goomba: {},
      Koopa: {
        height: 12,
        arguments: {
          smart: Boolean,
          movement: ["moveSimple", "moveJumping", "moveFloating"]
        },
        followerUpdate: function(reference, pairs) {
          var smart = pairs.smart == "True",
              fname = pairs.movement,
              func = fname == "moveJumping";
          if(fname == "moveFloating") func = [8,72];
          return [smart, func];
        },
        onadds: { nocollide: false }
      },
      Beetle: {
        width: 8.5,
        height: 8.5
      },
      HammerBro: { height: 12 },
      CheepCheep: {
        arguments: {
          smart: Boolean
        },
        attributes: {
          nofall: true
        }
      },
      Lakitu: { height: 12 },
      Podoboo: { width: 7 },
      Blooper: {
        height: 12,
        onadds: {
          nofall: true
        }
      },
      Bowser: {
        width: 16,
        height: 16
      }
    },
    solids: {
      Floor: { 
        arguments: { width: 8 },
        mydefaults: { width: 8 },
        prefunc_custom: function(prestatement, placer, reference, args) {
          var output = "Floor, " + prestatement.xloc + ", " + (prestatement.yloc);
          if(args[1]) output += ", " + args[1];
          return output;
        }
      },
      Brick: {
        arguments: {
          contents: ["false", "Coins", "Star"]
        },
        followerUpdate: function(reference, pairs) {
          var output = [],
              content = pairs.contents;
          output.push(window[pairs.contents]);
          
          return output;
        },
        prefunc_custom: function(prestatement, placer, reference, args) {
          var output = "Brick, ";
          output += prestatement.xloc + ", " + (prestatement.yloc) + ", ";
          output += placer.contents[0].name;
          return output;
        }
      },
      Block: {
        arguments: {
          contents: ["Coin", "Mushroom", "Star", "1Up Mushroom"],
          hidden: Boolean
        },
        followerUpdate: function(reference, pairs) {
          var output = [],
              content = pairs.contents;
          if(content == "1Up Mushroom") output.push([Mushroom, 1]);
          else output.push(window[pairs.contents]);
          
          if(pairs.hidden == "True") {
            TimeHandler.addEvent(function() { editor.follower.hidden = true; });
            output.push(1);
          }
          return output;
        },
        prefunc_custom: function(prestatement, placer, reference, args) {
          var output = "Block, ",
              contents = placer.contents,
              contained = contents[0].name;
          output += prestatement.xloc + ", " + prestatement.yloc;
          
          // If it's got unusal contents, mark them
          if(contained != "Coin") {
            // Contents are generally just the function name (Coins by default), with 1Up and Death mushrooms being the exception
            if(contained == "Mushroom" && contents[1]) {
              output += ", [Mushroom, " + String(contents[1]) + "]";
            }
            else output += ", " + contained;
            // Hidden is simply a bool
            if(placer.hidden) output += ", true";
          } 
          // Otherwise only add more if it's hidden
          else if(placer.hidden) output += ", false, true";
          
          return output;
        }
      },
      Cannon: {
        arguments: { height: 8 },
        sprite_source: "top"
      },
      Pipe: {
        width: 16,
        prefunc: pushPrePipe,
        prefunc_solo: true,
        arguments: {
          height: 8,
          Pirhana: Boolean
        },
        followerUpdate: function(reference, pairs) {
          var output = [];
          output.push(Number(pairs.height));
          output.push(Boolean(pairs.Pirhana));
          return output;
        },
        sprite_source: "top"
      },
      Stone: {
        arguments: {
          width: 8,
          height: 8
        },
        prefunc_custom: function(prestatement, placer, reference, args) {
          var output = "Stone, " + prestatement.xloc + ", " + (prestatement.yloc);
          output += ", " + args[1] + ", " + args[2];
          return output;
        }
      },
      Coral: {
        arguments: { height: 8 }
      },
      CastleBlock: {
        arguments: {
          fireballs: 2,
          direction: ["CW", "CCW"],
          hidden: Boolean
        },
        followerUpdate: function(reference, pairs) {
          var length = Number(pairs.fireballs),
              dt = pairs.direction == "CW",
              hidden = pairs.hidden == "True";
          return [[length, dt], hidden];
        }
      },
      // Disabled because of super glitches, but I really want to put it back in!!
      /*Platform: {
        height: 4,
        arguments: {
          width: 2,
          movement: ["false", "Falling", "Floating", "Sliding", "Transport"]
        },
        mydefaults: { width: 4 },
        previewsize: true,
        followerUpdate: function(reference, pairs) {
          var output = [],
              movement = pairs.movement;
          output.push(pairs.width);
          switch(movement) {
            case "Falling": output.push(moveFalling); break;
            case "Floating": output.push(moveFloating); break;
            case "Sliding": output.push(moveSliding); break;
            case "Transport": output.push(collideTransport); break;
          }
          return output;
        },
        prefunc_custom: function(prestatement, placer, reference, args) {
          var output = "Platform, " + prestatement.xloc + ", " + (prestatement.yloc),
              movement = args[2];
          switch(movement) {
            case moveFalling: output += ", moveFalling"; break;
            case moveFloating: output += ", [moveFloating, 8, 72]"; break;
            case moveSliding: 
              var xloc = prestatement.xloc || 0;
              output += ", [moveSliding";
              output += ", " + (xloc - 24);
              output += ", " + (xloc + 24);
              output += "]";
            break;
            case collideTransport:
              output += ", collideTransport";
            break;
          }
          return output;
        }
      },*/
      Springboard: {
        height: 14.5,
        heightoff: 1.5
      }
    },
    scenery: {
      Bush1: {width: 16},
      Bush2: {width: 24},
      Bush3: {width: 32},
      Cloud1: {width: 16, height: 12},
      Cloud2: {width: 24, height: 12},
      Cloud3: {width: 32, height: 12},
      HillSmall: {width: 24, height: 9.5, heightoff: -1.5},
      HillLarge: {width: 40, height: 17.5, heightoff: -1.5},
      PlantSmall: {width: 7, height: 15, heightoff: 1},
      PlantLarge: {height: 23, heightoff: 1},
      Fence: {},
      Water: {
        width: 4,
        height: 4,
        prefunc: fillPreWater,
        prefunc_solo: true,
        prefunc_custom: function(prestatement, placer, reference, args) {
          return prestatement.xloc + ", " + (prestatement.yloc)/* + ", " + args[0]*/;
        }
      }
    }
  };
  
  // Unfilled required properties are placed here
  var load_paths = {},
      defaults = editor.defaults,
      group, me, locj, i, j;
  // For each group in editor...
  for(i in editor) {
    group = editor[i];
    // For each thing in that group...
    for(j in editor[i]) {
      me = group[j];
      // Proliferate the defaults that don't exist
      proliferate(me, editor.defaults, true);
    }
  }
  
  // Note that everything in scenery is actually pushPreScenery(name, ...)
  group = editor.scenery;
  for(i in group) {
    me = group[i];
    // These are the secondary defaults
    proliferate(me, {
      createfunc: function(me) { return ThingCreate(Sprite, me.spritename); },
      spritename: i,
      prefunc_custom: function(prestatement, placer, reference, args) {
        return "'" + reference.spritename + "', " + prestatement.xloc + ", " + (prestatement.yloc - reference.height);
      }
    }, true);
    // These must happen
    if(me.prefunc == pushPreThing) me.prefunc = pushPreScenery;
  }
}

/* Initial HTML setup
 */
function setEditorHTML() {
  createEditorGuideLines();
  createEditorSidebar();
  createEditorBottomBar();
  createEditorScrollers();
  
  // Set the bottom bar initially
  editor.sectionselect.onchange();
}

// The sidebar contains the main options for placing thing
function createEditorSidebar() {
  var optionNames = ["Solids", "Characters", "Scenery", "Settings"],
      // The main elements
      sidebar = editor.sidebar = createElement("div", {
        id: "sidebar"
      }),
      category = editor.category = createElement("div", {
        id: "category",
        className: "group first"
      }),
      sectionselect = editor.sectionselect = createElement("select", {
        id: "sectionselect",
        className: "options big",
        onchange: editorSelectSection
      }),
      options = editor.options = createElement("div", {
        id: "options",
        className: "options big"
      }),
      i;
  
  // Dat element structure
  sidebar.appendChild(category);
  category.appendChild(sectionselect);
  for(i in optionNames) {
    sectionselect.appendChild(createElement("option", {
      innerText: optionNames[i]
    }));
  }
  sidebar.appendChild(options);
  
  // With it initially set, add the sidebar
  body.appendChild(window.sidebar = sidebar);
}

// Lets the user choose which Thing to place
function createEditorBottomBar() {
  var bar = editor.bottombar = createElement("div", {
    id: "bottombar",
    things: {}
  });
  
  sidebar.appendChild(bar);
}


function createEditorScrollers() {
  var names = ["right", "left"],
      scrollers = {},
      name, i, parent, div, top;
  
  // Set the parent #scrollers to hold them
  parent = createElement("div", {
    id: "scrollers",
    style: {
      zIndex: 7,
      width: (innerWidth - 32) + "px"
    }
  });
  
  // Create the two scrollers
  settings = {
    className: "scroller",
    style: {
      zIndex: 7,
      marginTop: innerHeight / 2 + "px"
    },
    onmouseover: editorFollowerHide,
    onmouseout: editorFollowerShow,
    onmousedown: editorScrollingStart,
    onmouseup: editorScrollingStop
  };
  
  // Create each div
  for(i = names.length - 1; i >= 0; --i) {
    name = names[i];
    div = scrollers[names[i]] = createElement("div", settings);
    parent.appendChild(div);
  }
  // The left one should start hidden
  proliferate(scrollers["left"], {
    id: "left",
    className: "scroller flipped off",
    dx: -7
  });
  // The right one is at the right of the screen
  proliferate(scrollers["right"], {
    id: "right",
    style: { right: "21px" },
    dx: 7
  });
  
  editor.scrollers = scrollers;
  
  body.appendChild(parent);
}

function editorFollowerHide() {
  var follower = editor.follower;
  follower.hiddenOld = follower.hidden;
  follower.hidden = true;
}
function editorFollowerShow() {
  var follower = editor.follower;
  follower.hidden = follower.hiddenOld;
}

function editorScrollingStart(event) {
  var scroller = event.target,
      dx = scroller.dx;
  editorPreventClicks();
  editor.scrolling = TimeHandler.addEventInterval(editorScrolling, 1, Infinity, -dx);
  classRemove(editor.scrollers["left"], "off");
}
function editorScrollingStop() {
  TimeHandler.addEvent(editorClickOff, 3);
  TimeHandler.clearEvent(editor.scrolling);
}
function editorScrolling(dx) {
  scrollEditor(dx);
  if(editor.xloc >= 0) {
    scrollEditor(-editor.xloc);
    editorScrollingStop();
    classAdd(editor.scrollers["left"], "off");
    return true;
  }
}


// Guidelines display helpful boundaries
function createEditorGuideLines() {
  var lines = {
      floor: 0,
      ceiling: ceillev,
      jumplev1: jumplev1,
      jumplev2: jumplev2
    },
    left = 16 * unitsize + "px",
    floor = map.floor,
    i, parent, line;
  
  // The parent holds them and provides the marginLeft
  window.maplines = parent = document.createElement("div");
  parent.style.marginLeft = left;
  parent.id = "maplines";
  
  // Create each line and put it in the parent
  for(i in lines) {
    line = createElement("div", {
      innerText: i,
      className: "mapline",
      id: i + "_line",
      style: {
        marginTop: (floor - lines[i]) * unitsize + "px",
        marginLeft: "-" + left,
        paddingLeft: left
      }
    });
    parent.appendChild(line);
  }
  body.appendChild(parent);
}

// The controls supply typical ops like undo and save
function setEditorControls(names) {
  names = names || ["load", "save", "reset", "undo"/*, "erase"*/];
  var previous = document.getElementById("controls"),
      container = createElement("div", {id: "controls"}),
      controls = editor.controls = {container: container},
      name, div, i;
  
  // Clear anything previously existing
  if(previous) previous.innerHTML = "";
  
  // For each name, add a div
  for(i in names) {
    name = names[i];
    div = createElement("div", {
      id: name,
      alt: name,
      className: "control",
      style: { backgroundImage: "url(Theme/" + name + ".gif)" },
      innerHTML: "<div class='controltext'>" + name + "</div>",
      onclick: editorClickControl
    });
    
    container.appendChild(div);
    controls[name] = div;
  }
  
  sidebar.appendChild(container);
}

// What happens on mouse down/click/etc
function setEditorTriggers() {
  // Everything that allows mouse triggers
  var activators = [maplines, canvas],
      me, i;
  for(i = activators.length - 1; i >= 0; --i) {
    me = activators[i];
    me.onclick = editorMouseClick;
  }
  
  // Make sure the follower's position is updated!
  document.onmousemove = editorFollowerFollowsCursor;
}

// Place a new thing at the editor's location
function editorMouseClick(event) {
  if(!window.editing || editor.clicking) return;
  editorPreventClicks();
  
  // If erasing, do that instead
  if(editor.erasing) return editorPlaceEraser(event);
  
  // Don't do anything if you're in settings, or just clicked a control
  if(editor.in_settings || !editor.canplace) return;
  
  var section_name = editor.section_name,
      current_section = window[section_name],
      thing_name = editor.current_selected,
      follower_old = editor.follower;
  
  // Record this past follower in editor.placed
  editor.placed.push(follower_old);
  
  // To visualize, simply unattach the follower from the editor and make a new one
  editor.follower = false;
  editorSetCurrentThingFromName(null, true);
  // (when paused, this doesn't happen otherwise)
  if(paused) refillCanvas();
  
  // No more follower manipulation is needed, because each Thing stores its own arguments
  // Enabling .was_follower lets the eventual save function know this is a key Thing
  follower_old.was_follower = true;
  delete follower_old.onclick;
  // If it's a live run-though, enable velocity & movement stuff
  if(editor.playing) {
    thingRetrieveVelocity(follower_old);
    proliferate(follower_old, follower_old.reference.attributes);
  }
}

// Selects solids or characters or etc.
function editorSelectSection() {
  var selected = (this || editor.sectionselect).value.toLowerCase();
  // Clear & load the bottom bar
  // If it's settings, do something
  if(editor.in_settings = selected == "settings") {
    editorSetSection(selected, true);
    editorSetSectionSettings();
  }
  else editorSetSection(selected);
}
function editorSetSection(name, nothing) {
  var section = editor.section = editor[name],
      bottombar = editor.bottombar,
      num_kids = 0,
      canv_sel, canv,
      first, name;
  editor.section_name = name;
  
  // Clear and reset the bottom bar
  bottombar.innerHTML = "";
  if(!nothing) {
    for(name in section) {
      ++num_kids;
      canv = editorAddBottomPreview(bottombar, name, section[name]);
      if(!canv_sel) // This makes it grab the first canvas (comment to get the last)
        canv_sel = canv;
    }
  }
  // Only show the bottom bar if there weren't any settings
  if(num_kids) {
    bottombar.style.visibility = "visible";
    editorSetCurrentThingFromCanvas(canv_sel);
  }
  else bottombar.style.visibility = "hidden";
}
// Adds an equivalent object to the bottom bar
function editorAddBottomPreview(bottombar, name, ref) {
  // Create a canvas based off name & ref
  var width = ref.width,
      height = ref.height,
      thingfunc = window[name],
      // The Thing is used for image drawing
      // If the name doesn't exist as a member of window, it's a Scenery sprite
      thing = thingfunc ? ThingCreate(thingfunc, ref.previewargs) : new Thing(Sprite, name),
      // The holder holds the canvas for positioning reasons
      holder = createElement("div", {
        width: width * unitsize + "px",
        height: height * unitsize + "px",
        name: name,
        className: "holder " + name,
        onclick: editorSetCurrentThing
      }),
      maxWidth = { maxWidth: "100%" },
      maxHeight = { maxHeight: "100%" },
      canvas = proliferate(getCanvas(width * unitsizet2, height * unitsizet2), {
        name: name,
        reference: ref,
        style: { marginLeft: -roundDigit(width / 2, scale) + "px" },
        onclick: editorSetCurrentThing
      }),
      things = bottombar.things,
      sizewidth = width * unitsizet2,
      sizeheight = height * unitsizet2,
      context = canvas.getContext("2d"),
      csource;
  
  // For superior sharpness
  canvasDisableSmoothing(canvas);
  
  // Update it visually
  editor.bottombar.things[name] = canvas.thing = thing;
  addClass(thing, "editor"); // Ones that need to know this is different get that here
  
  // Know where to take from (multiple sprites need to be specified)
  csource = thing.canvas;
  if(thing.canvases) csource = thing.canvases[ref.sprite_source || "middle"].canvas;
  
  // If there's a previewsize, pattern it on the canvas
  if(ref.previewsize) {
    context.fillStyle = context.createPattern(csource, "repeat");
    context.fillRect(0, 0, sizewidth, sizeheight);
  } 
  // Otherwise just draw it normally...
  else {
    context.drawImage(csource, 0, 0, sizewidth, sizeheight);
  }
  
  // Add the canvas to the holder, which is added to bottom bar
  holder.appendChild(holder.canvas = canvas);
  bottombar.appendChild(holder);
  bottombar[name] = holder;
  
  // Return the canvas (the last one will be set as the current)
  return canvas;
}

// Displays the editor settings instead of Thing arguments
function editorSetSectionSettings() {
  var settings = editor.settings,
      html = "<table>",
      rows;
  
  html += "<h3 class='title'>Settings</h3>";
  
  // Add the options, some of which are non-standard
  html += addArgumentOption("night", Boolean, settings.night);
  html += addArgumentOption("setting", ["Overworld", "Underworld", "Underwater", "Castle", "Sky"], settings.setting);
  html += addArgumentOption("alt", Boolean, settings.alt);
  html += "</table>";
  
  // Apply this to options
  options.innerHTML = html;
  
  // Make these valid, and call the setting supdate function
  ensureOptionsAboveZero(editorUpdateSettingsOption);
  
  // Knowing these options, reference them
  rows = editor.sidebar.getElementsByTagName("table")[0].rows;
  editor.settings.night_elem = rows[0].cells[1].firstChild;
  editor.settings.setting_elem = rows[1].cells[1].firstChild;
  editor.settings.alt_elem = rows[2].cells[1].firstChild;
  
  // There's no follower here
  if(editor.follower) killNormal(editor.follower);
  editor.follower = false;
}

// Called instead of editorUpdateFollower for settings
function editorUpdateSettingsOption(event) {
  var settings = editor.settings,
      night = settings.night = settings.night_elem.value == "True",
      alt = settings.alt = settings.alt_elem.value == "True",
      setting = settings.setting = settings.setting_elem.value,
      // // Get the new area setting from the editor settings elemes
      newsetting = setting + (night ? " Night" : "") + (alt ? " " + alt : "");
  setAreaSetting(area, newsetting, newsetting != area.setting);
}

// Called when something in the bottom bar is clicked
function editorSetCurrentThing(event, sameargs) {
  // Set this as selected for the editor
  var self = event.target,
      name = editor.current_thing_name = self.name,
      refs = editor.current_thing = editor.section[name];
  if(!sameargs) updateCurrentArguments(name, refs);
  editorUpdateFollower();
}
// Manually makes a fake event for editorSetCurrentThing using a bottom bar's canvas
function editorSetCurrentThingFromCanvas(canv, sameargs) {
  editorSetCurrentThing({target: canv}, sameargs);
}
// Manually makes a fake event for editorSetCurrentThing using just a name
function editorSetCurrentThingFromName(name, sameargs) {
  editorSetCurrentThing({target: {name: name || editor.current_thing_name}}, sameargs);
}

// Displays arguments of the selected Thing
function updateCurrentArguments(name, reference) {
  reference = reference || {};
  var options = editor.options,
      html = "<table>",
      mydefaults = reference.mydefaults || {},
      arguments = reference.arguments || {},
      i;
  
  // Add this thing's name
  html += "<h3 class='title'>" + name + "</h3>";
  
  // Size must be there, with or without the arguments
  if(!arguments.width) html += addStaticOption("width", reference.width);
  if(!arguments.height) html += addStaticOption("height", reference.height);
  
  // Add any other arguments
  for(i in arguments) {
    html += addArgumentOption(i.replace("_", "-"), arguments[i], null, mydefaults);
  }
  
  // Submit the HTML
  html += "</table>";
  options.innerHTML = html;
  
  ensureOptionsAboveZero();
}
// An option that can't be changed
function addStaticOption(name, value) {
  if(value == Infinity) value = "Inf.";
  return "<tr id='option_" + name + "' class='auto'><td>" + name + ": </td><td class='auto'>" + value + "</td></tr>";
}
// An option that can be changed (as an argument)
function addArgumentOption(name, value, ref, mydefaults) {
  mydefaults = mydefaults || {};
  var text =  "<tr name='" + name + "' id='option_" + name + "'><td>" + name + ": </td><td>";
  
  switch(value) {
    case Infinity: text += "Inf"; break;
    case Boolean:
      text += "<select name='" + name + "' value='" + (value ? "true" : "false") + "'><option>False</option><option>True</select>";
    break;
    case Number:
      text += "<input name='" + name + "' value='" + String(value || 0) + "' type='Number'>";
    break;
    default: 
      switch(typeof(value)) {
        case "number": text += "<span class='optspan'>" + value + "x</span><input name='" + name + "' type='Number' class='text' value='" + (mydefaults[name] || 1) + "'>"; break;
        case "string": text += "<input name='" + name + "' type='text' class='text wide' value='" + value + "'>"; break;
        case "object":
          text += "<select name='" + name + "'>";
          for(i in value) text += "<option>" + value[i] + "</option>";
          text += "<select>";
        break;
      }
    break;
  }
  return text + "</td></tr>";
}

// Ensures input & select elements are valid, and update when needed
function ensureOptionsAboveZero(updatefunc) {
  updatefunc = updatefunc || editorUpdateFollower;
  // For each input element, don't let it go below 0
  var elements = editor.options.getElementsByTagName("input"),
      element;
  for(i = elements.length - 1; i >= 0; --i) {
    element = elements[i];
    element.onchange = element.onclick = element.onkeypress = editorInputEnsureAboveZero;
  }
  
  // Select elements also need to update the follower on change
  elements = options.getElementsByTagName("select");
  for(i = elements.length - 1; i >= 0; --i) {
    element = elements[i];
    element.onchange = element.onclick = element.onkeypress = editorUpdateFollower;
  }
}

function editorInputEnsureAboveZero(event) {
  // var me = event.target,
      // min = editor.current_thing.minimum || 0,
      // value = me.value = Number(me.value) || min;
  // setTimeout(function() { if(value < me.min) me.value = min; }, 35);
  
  editorUpdateFollower(event);
}

/* The Follower */
function editorUpdateFollower(event) {
  // If settings are chosen, do that instead
  if(editor.in_settings) return editorUpdateSettingsOption(event);
  
  var current_thing = editor.current_thing,
      args, follower; 
  
  // If there's already one, kill it
  if(follower = editor.follower) {
    follower.id = "";
    killNormal(follower);
  }
  
  // If it has its own function (e.g. a Sprite currier), use that
  if(current_thing.createfunc) {
    follower = current_thing.createfunc(editor.current_thing, editorGetArguments());
  }
  // Otherwise pass it to ThingCreate with arguments
  else follower = ThingCreate(
      window[editor.current_thing_name],
      current_thing.followerUpdate(editor.current_thing, editorGetArguments())
    );
  // Arguments set things such as size and adding
    
  editor.follower = follower;
  // Also give it things like the CSS ID and the onclick
  proliferate(follower, {
    id: "follower",
    libtype: editor.section_name, // just in case (for scenery)
    lookleft: true, // just in case (for HammerBro throwing)
    nocollide: true,
    reference: current_thing,
    onclick: editorMouseClick
  }, true);
  
  // Add it, and give it the 'editor' class
  addThing(follower);
  addClass(follower, "editor");
  
  // Don't let it do anything, unless this is a live run-through!
  thingRetrieveVelocity(follower);
  thingStoreVelocity(follower);
  
  // Make sure it has a position
  editorSetFollowerPosition(follower);
  
  // Hide it if there's it's eraser
  if(editor.erasing) follower.hidden = true;
}
// Grabs the inputs and their values from #options
function editorGetArguments() {
  var inputs = arrayMake(editor.options.getElementsByTagName("input")),
      selects = arrayMake(editor.options.getElementsByTagName("select")),
      combined = inputs.concat(selects);
      pairs = generateInputNameValuePairs(combined);
  return pairs;
}
function generateInputNameValuePairs(inputs) {
  var output = {}, i;
  for(i in inputs) {
    output[inputs[i].name] = inputs[i].value;
  }
  return output;
}

// Whenever the cursor moves, put it on that location
function editorFollowerFollowsCursor(event) {
  var follower = editor.follower;
  if(!follower) return;
  var xloc = roundFollowerDigit(event.x) + (editor.current_thing.widthoff - editor.offset.x) * unitsize,
      yloc = roundFollowerDigit(event.y) + editor.current_thing.heightoff * unitsize;
  
  editorSetFollowerPosition(follower, xloc, yloc);
}
function editorSetFollowerPosition(follower, xloc, yloc) {
  xloc = xloc || editor.xloc_old || 0;
  yloc = yloc || editor.yloc_old || 0;
  
  setLeft(follower, xloc);
  setTop(follower, yloc);
  
  editor.xloc_old = xloc;
  editor.yloc_old = yloc;
}

// Because Things are placed based on a grid, despite the ability to be free-form.
function roundFollowerDigit(num) {
  // var diff = 4;
  var diff = editor.section_name == "solids" ? 8 : 4;
  // switch(editor.section_name) {
    // case "solids": diff = 8; break;
    // case "characters": diff = 4; break;
    // case "scenery": diff = 2; break;
  // }
  return unitsize * diff * round(num / (unitsize * diff));
}
function roundFollowerPosition(me, num) {
  editorSetFollowerPosition(me, 
      roundFollowerDigit(me.left),
      roundFollowerDigit(me.top)
    );
}

/* Follower Update Methods */

// The default argument generator
// Passes in width and height, in that order, if they're in the arguments
function editorFollowerUpdateStandard(reference, pairs) {
  // Hidden is a necessary check
  if(pairs.hidden == "True") {
    // This is an event because these are set before the new follower is made
    TimeHandler.addEvent(function() { editor.follower.hidden = true; });
  }
  
  // More importantly, check for width and height
  var output = [];
  if(pairs.width) output.push(Number(pairs.width));
  if(pairs.height) output.push(Number(pairs.height));
  return output;
}


/* Editor Controls */

// Launches editorControlXXX, where X is what's clicked
function editorClickControl(event) {
  // So the editor knows not to place anything
  editorPreventClicks();
  // This can either be the control or the control's firstChild
  var target = event.target;
  if(!target.id) target = target.parentNode;
  window["editorControl" + capitalizeFirst(target.id)]();
  // This should stop it from causing a placement
  event.preventDefault();
}
function editorPreventClicks() {
  editor.clicking = true;
  TimeHandler.addEvent(editorClickOff, 3);
}
function editorClickOff() {
  if(window.editor) editor.clicking = false;
}

// Deletes and pops the last thing in placed
function editorControlUndo() {
  var placed = editor.placed,
      last = placed.pop();
  
  if(last && !last.player) {
    killNormal(last);
  }  
}

// Continuously undos until placed is empty
function editorControlReset() {
  var placed = editor.placed,
      len = placed.length,
      timer = roundDigit(35 / len, 21);
  
  TimeHandler.addEventInterval(editorControlUndo, timer, len);
}

// Creates the function and displays the submission window to the user
function editorControlSave() {
  // if(editor.playing || editor.placed.length == 0) return;
  
  // Display the input/submission window to the user
  var rawfunc = editor.rawfunc = editorGetRawFunc(),
      title = "<span style='font-size:1.4em;'>Hit Submit below to start playing!</span>",
      p = "<p style='font-size:.7em;line-height:140%'>This map will be resumed automatically the next time you use the editor on this computer.<br>Alternately, you may copy this text to work on again later using Load (the button next to Save). </p>",
      menu = editorCreateInputWindow(title + "<br>" + p, rawfunc, editorSubmitGameFuncPlay);
  
  return rawfunc;
}

// Stops playing (really just calls loadEditor)
function editorControlCancel() {
  loadEditor();
}

// Gets the string version of the editor function
function editorGetRawFunc() {
  var placed = editor.placed,
      lenm1 = placed.length - 1,
      statements = new Array(i),
      // Using the simple Function constructor, the map is the first argument
      rawfunc = "  var map = arguments[0] || new Map();\n",
      i;
  
  // Start the raw func off with the time, location, and area
  rawfunc += "\n  map.time = " + data.time.amount + ";";
  rawfunc += "\n  map.locs = [ new Location(0, true) ];";
  rawfunc += "\n  map.areas = [";
  rawfunc += "\n    new Area('" + area.setting + "', function() {";
  rawfunc += "\n      setLocationGeneration(0);\n\n";
  
  // Generate the pre-statements based on what's placed
  for(i = lenm1; i >= 0; --i) {
    // Manipulations are done by the editorPreStatement object
    statements[i] = new editorPreStatement(placed[i]);
  }
  
  // Sort the pre-statements, for cleanliness
  statements.sort(prethingsorter);
  
  // With them sorted, turn them all into strings (with the 6 spaces in front)
  for(i = lenm1; i >= 0; --i) {
    // Manipulations are done by the editorPreStatement object
    statements[i] = "      " + statements[i].statement;
  }
  
  // So that annoying loading glitch doesn't happen
  statements = removeDuplicates(statements);
  
  // Add these statements to the raw function
  rawfunc += statements.join("\n");
  
  // Finish off the area function
  rawfunc += "\n    })";
  rawfunc += "\n  ];";
  rawfunc += "\n  return map;"
  
  return rawfunc;
}

// Generates a prestatement based off a placed object
function editorPreStatement(placer) {
  this.placer = placer;
  
  // Positioning is important
  this.xloc = (gamescreen.left + placer.left) / unitsize;
  this.yloc = map.floor - placer.top / unitsize;
  
  // Reference and arguments are used to make the statement
  // Using them, get the statement
  this.statement = editorGetStatement(this, placer, placer.reference, placer.args);
}

// Given a prestatement, this returns the string
function editorGetStatement(prestatement, placer, reference, args) {
  // If there isn't a reference, try to get it from the library
  if(!reference) {
    reference = editor[placer.libtype][placer.title];
    // If it's still not there, ignore this thing (like ScrollBlocker)
    if(!reference) return "";
  }
  
  // The statement always starts with the reference's pre-function
  var statement = (reference.prefunc || pushPreThing).name,
      numargs = args.length,
      argstrings, arg;
  
  // If it has a custom prefunction creator (like scenery), do that
  if(reference.prefunc_custom) {
    statement += "(" + reference.prefunc_custom(prestatement, placer, reference, args) + ");";
  }
  // Otherwise generate the arguments
  else {
    argstrings = [];
    
    // Unless reference specifies not to, add the placer's title
    if(!reference.prefunc_solo) argstrings.push(placer.title);
    // else argstrings.push(placer.prefunc);
    
    // Start the argstrings off with the xloc and yloc
    argstrings.push(String(prestatement.xloc));
    argstrings.push(String(prestatement.yloc));
  
    // For each argument (0 is the thing, so 1 onward), add it to the array of strings
    for(var i = 1; i < numargs; ++i) {
      // Add it, giving the thing apostrophes if needed
      switch(typeof(arg = args[i])) {
        case "undefined": break;
        case "number": arg = String(round(arg)); break;
        default: arg = String(arg); break;
      }
      // Don't add it if it's undefined
      if(typeof(arg) != "undefined")
        argstrings.push(arg);
    }
  
    // Make the statement use the arguments, joined by commas
    statement += "(" + argstrings.join(", ") + ");";
  }
  
  return statement;
}

/* Erasing */
function editorControlErase() {
  !editor.erasing ? editorControlEraseOn() : editorControlEraseOff();
}
function editorControlEraseOn() {
  editor.erasing = editor.follower.hidden = true;
  classAdd(body, "erasing");
  classAdd(editor.controls.erase, "enabled");
}
function editorControlEraseOff() {
  editor.erasing = editor.follower.hidden = false;
  classRemove(body, "erasing");
  classRemove(editor.controls.erase, "enabled");
}

function editorPlaceEraser(event) {
  addThing(Eraser, event.x, event.y);
}

function Eraser(me) {
  me.width = me.height = 2;
  me.nocollide = me.nofall = true;
  me.movement = eraserErases;
  setCharacter(me, "eraser");
}
// Checks everything for collision (necessary because sceneries don't collide)
function eraserErases(me) {
  if(!window.editor) return;
  var placed = editor.placed,
      arr = placed.concat(solids).concat(characters).concat(scenery), 
      other, i;
  
  // If this touches anything in placed
  for(i = arr.length - 1; i >= 0; --i) {
    other = arr[i];
    if(other.player || other == editor.follower) continue;
    // These ones touch:
    if(objectsTouch(me, other)) {
      // Kill the other
      killNormal(other);
      // Remove it from placed
      placed.splice(placed.indexOf(other), 1);
      break;
    }
  }
  
  // ...and finally, kill me
  killNormal(me);
}

/* Loading Previous Maps */

// Prompts the user to give part of a function
function editorControlLoad() {
  var blurb = "Paste your work in progress here, and click Submit to continue it.";
  editorCreateInputWindow(blurb, "", editorSubmitLoad);
}

// Takes solids, characters, and scenery, and puts them int oplaced
function addThingsToPlaced() {
  var placed = editor.placed;
  // Grab all the Things, and sort them
  editor.placed = (editor.placed || []).concat(characters).concat(solids).concat(scenery);
  placed.sort(prethingsorter);
  // (don't include player in this)
  placed.splice(placed.indexOf(player), 1);
  
  // Make the new placed all know their reference
  for(i = placed.length - 1; i >= 0; --i) {
    placer = placed[i];
    placer.reference = editor[placer.libtype][placer.title];
  }
}

/* Editor Input/Submission Window */

function editorCreateInputWindow(blurb, value, callback) {
  // Create the elements
  var bigwidth = gamescreen.unitwidth,
      div = editor.input_window = createElement("div", {
        id: "input_window",
        innerHTML: blurb || "",
        style: { width: bigwidth + "px" }
      }),
      input = div.input = editor.window_input = createElement("textarea", {
        id: "window_input",
        value: value || "",
        style: { width: (bigwidth - 49) + "px" }
      }),
      submit = div.submit = createElement("div", {
        id: "window_submit",
        className: "window_button",
        innerText: "Submit",
        onclick: callback
      }),
      cancel = div.cancel = createElement("div", {
        id: "window_cancel",
        className: "window_button",
        innerText: "Cancel",
        onclick: editorCloseInputWindow
      });
  
  // Add them to each other, and the body
  div.appendChild(input);
  div.appendChild(submit);
  div.appendChild(cancel);
  body.appendChild(div);
  
  // Remove the follower
  killNormal(editor.follower = false);
  editor.follower = false;
  
  return div;
}

function editorCloseInputWindow(noedit) {
  editorPreventClicks();
  // Delete the input window
  removeChildSafe(window.input_window, body);
  
  if(!noedit) {
    // Recreate the current thing
    editorSetCurrentThingFromName();
    
    // Pretty sure this is necessary.
    window.editing = true;
  }
  
  editorUpdateFollower();
}

// It's as if it never happened.
function editorClose(inmap) {
  if(!window.editor) return;
  
  // Clear any visual changes
  classRemove(body, "editor");
  classRemove(body, "erasing");
  
  // Remove the follower
  // if(window.editor) {
    killNormal(editor.follower);
    editor.follower = false;
    delete window.editor;
  // }
  
  // Remove the editor elements (safely)
  var ids = ["maplines", "sidebar", "bottombar", "scrollers"], i;
  for(i in ids) removeChildSafe(document.getElementById(ids[i]), body);
  
  // Stop the mouse triggers
  document.onmousemove = null;
  
  window.editing = false;
  // Unless this is being called by setMap, stop shifting
  if(inmap && window.map) map.shifting = false;
}

// Called by scrollWindow while editing to update the follower
function scrollEditor(xinv, yinv) {
  if(!window.editor) return;
  
  var follower = editor.follower;
  if(!follower) return;
  
  xinv = xinv || 0;
  yinv = yinv || 0;
  // shiftBoth(follower, xinv, yinv);
  shiftAll(scenery, xinv, yinv);
  shiftAll(solids, xinv, yinv);
  shiftAll(characters, xinv, yinv);
  editor.xloc += xinv;
  editor.yloc += yinv;
}

function editorStoreLocally() {
  // Record this in localStorage
  localStorage.editorLastFunc = editor.rawfunc;
}

// Checks for a previously saved function, and loads if found
function setEditorLocalRetrieval() {
  var found = localStorage.editorLastFunc;
  if(!found) return;
  editor.rawfunc = round;
  editorSubmitGameFunc();
}

// Starts the editor with a particular function from editor.rawfunc
function editorSubmitGameFunc() {
  // If there's no raw function known, don't do anything
  if(!window.editor || !editor.rawfunc) return loadEditor();
  
  var rawfunc = editor.rawfunc,
      mapfunc = window.custommapfunc = new Function(editor.rawfunc);

  // Start the map
  mapfuncs.Custom = { Map: mapfunc };
  window.canedit = true;
  setMap(["Custom", "Map"]);
  window.canedit = editor.playing = false;
  
  // Load player and all things 
  entryBlank(player);
  addThingsToPlaced();
  
  // Save and close
  editorStoreLocally();
  editorCloseInputWindow();
}

// Submits the game function, and starts playing
function editorSubmitGameFuncPlay() {
  editorPreventClicks();
  editorSubmitGameFunc();
  editorStartPlaying();
}

// Grabs the raw function from the input window
function editorSubmitLoad() {
  if(!window.editor || !editor.window_input) return;
  editorPreventClicks();
  var rawfunc = editor.window_input.value;
  loadEditor(); 
  editor.rawfunc = rawfunc;
  editorSubmitGameFunc();
}

// Allows player to roam the world
function editorStartPlaying() {
  editorPreventClicks();
  editor.playing = true;
  // Place a player normally
  placePlayer();
  entryPlain(player);
  nokeys = false;
  // Retrieve each thing
  var placed = editor.placed,
      placer, ref, i;
  for(i in placed) {
    placer = placed[i];
    thingRetrieveVelocity(placer);
    // If it needs, give it back some defaults
    ref = editor[placer.libtype][placer.title];
    if(ref)
      proliferate(placer, ref.onadds);
  }
  // Only have the cancel option now
  setEditorControls(["Cancel"]);
}

// Checks for a rawfunc in localStorage, and loads it if possible
function setEditorLocalRetrieval() {
  var found = localStorage.editorLastFunc;
  if(!found) return;
  editor.rawfunc = found;
  editorSubmitGameFunc();
  editorStoreLocally();
  
  // For each thing now placed:
  var placed = editor.placed, i;
  for(i in placed) {
    // thingRetrieveVelocity(placed[i]);
    thingStoreVelocity(placed[i]);
  }
}
