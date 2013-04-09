function loadEditor() {
  if(editing) return;
  editing = true;
  checkReset();
  pauseTheme();
  clearDataDisplay();
  unpause(); pause();
  for(i in characters) killNormal(characters[i]);
  for(i in solids) killNormal(solids[i]);
  startReset();
  body.className = "Overworld Editor";
  body.id = "editor";
  
  setEditorLibrary();
  setEditorHTML();
  setEditorSection("solids");
  setEditorControls();
  setEditorEvents();
}

function setEditorLibrary() {
  window.editor = {
    solids: {
      Floor: {
        height: Infinity,
        arguments: { width: roundDigit(screen.width / unitsizet4, 4) },
        multiplier: { width: 8 },
        customfunc: function(current, properties) {
          current.y -= screen.height * unitsize; // unitsize will be removed by the placer
          return "pushPreFloor";
        },
        postargs: [
          function(preline, properties) { return properties.width; }
        ],
        loadfunc: function(current, reference, input) {
          updateSidebarOption("width", input.args[0]);
        }
      },
      Brick: {
        width: 8, height: 8,
        arguments: { contents: ["false", "Coins", "Star",/*, "Vine"*/] },
        functions: {
          preview: function(me, properties) {
            StringToBool(properties.hidden) ?  addFollowerClass("hidden") : removeFollowerClass("hidden");
            if(properties.contents != "false")
              addFollowerAttachment({
                width: 8,
                height: 8,
                left: properties.contents == "Coins" ? 1.5 : null,
                className: getFollowerAttachmentItemName(properties.contents.toLowerCase()),
              });
          }
        },
        postargs: [
          function(preline, properties) { return removeLastS(properties.contents); },
          function(preline, properties) { return properties.hidden; }
        ],
        loadfunc: function(current, reference, input) {
          updateSidebarOption("contents", input.args[0]);
        }
      },
      Block: {
        width: 8, height: 8,
        arguments: {
          contents: ["Coin", "Mushroom", "Star", "1Up Mushroom"],
          hidden: Boolean
        },
        functions: {
          preview: function(me, properties) {
            StringToBool(properties.hidden) ? addFollowerClass("hidden") : removeFollowerClass("hidden");
            if(properties.contents != "Coin")
              addFollowerAttachment({
                width: 8,
                height: 8,
                className: getFollowerAttachmentItemName(properties.contents.toLowerCase())
              });
          }
        },
        postargs: [
          function(preline, properties) { if(properties.contents == "1Up Mushroom") return "Mushroom"; else return properties.contents; },
          function(preline, properties) { return StringToBool(properties.hidden); }
        ],
        loadfunc: function(current, reference, input) {
          updateSidebarOption("contents", input.args[0]);
          updateSidebarOption("hidden", BoolToString(input.args[0]));
        }
      },
      Cannon: {
        width: 8,
        arguments: {height: 2},
        multiplier: {height: 8},
        previewstyle: {
          background_position: "top",
          background_size: "70%"
        },
        postargs: [ function(preline, properties) { return properties.height; } ],
        loadfunc: function(current, reference, input) {
          updateSidebarOption("height", input.args[0]);
        }
      },
      Pipe: {
        width: 16,
        arguments: { height: 2, pirhana: Boolean },
        multiplier: {height: 8},
        previewstyle: {
          background_position: "top",
          background_repeat: "no-repeat, repeat-y"
        },
        customfunc: function(current, properties) {
          // current.y += screen.height * unitsizet8; // unitsize will be removed by the placer
          current.y += (properties.height * unitsize * 7);
          return "pushPrePipe";
        },
        functions: {
          preview: function(me, properties) {
            if(StringToBool(properties.pirhana))
              addFollowerAttachment({
                width: 8,
                height: 12,
                top: -12,
                left: 4,
                className: "character pirhana two",
              });
          }
        },
        // height, pirhana, intoloc, exitloc
        postargs: [
          function(me, properties) { return properties.height * 8; },
          function(me, properties) { return properties.pirhana.toLowerCase() }
        ],
        loadfunc: function(current, reference, input) {
          updateSidebarOption("height", input.args[0] / 8);
          updateSidebarOption("pirhana", BoolToString(input.args[1]));
          current.yloc += input.args[0];
        }
      },
      Stone: {
        arguments: { width: 1, height: 1 },
        multiplier: {width: 8, height: 8},
        postargs: [
          function(me, properties) { return properties.width; },
          function(me, properties) { return properties.height; }
        ],
        loadfunc: function(current, reference, input) {
          updateSidebarOption("width", input.args[0]);
          updateSidebarOption("height", input.args[1]);
        }
      },
      CastleBlock: {
        width: 8, height: 8,
        arguments: {
          fireballs: 6,
          // direction: ["CW", "CCW"],
          hidden: Boolean
        },
        functions: {
          preview: function(me, properties) {
            StringToBool(properties.hidden) ?  addFollowerClass("hidden") : removeFollowerClass("hidden");
            for(var i = properties.fireballs - 1; i >= 0; --i) {
              addFollowerAttachment({
                width: 4, height: 4,
                className: "fireball",
                left: (i + 1) * 3 - 1,
                top: (i + 1) * 3 - 1
              });
            }
          }
        },
        postargs: [
          function(preline, properties) { return "[" + properties.fireballs + ", 1]" },
          function(preline, properties) { return properties.hidden.toLowerCase(); }
        ],
        loadfunc: function(current, reference, input) {
          console.log(input);
          updateSidebarOption("fireballs", JSON.parse(input.args[0])[0]);
          updateSidebarOption("hidden", BoolToString(input.args[1]));
        },
      },
      Platform: {
        height: 4,
        arguments: {
          width: 2,
          movement: ["false", "moveFalling", "moveFloating"]
        },
        previewstyle: {
          background_size: "50%",
          background_repeat: "repeat-x",
          background_position: "center center"
        },
        multiplier: { width: 8, height: 1 },
        postargs: [
          function(preline, properties) { return properties.width * 2; },
          function(preline, properties) { return properties.movement; }
        ],
        loadfunc: function(current, reference, input) {
          updateSidebarOption("width", input.args[0]);
          updateSidebarOption("movement", input.args[1]);
        }
      },
      Springboard: {
        width: 8,
        height: 15.5,
        heightoff: .5
      }
    },
    characters: {
      Goomba: { width: 8, height: 8, alt: "flipped" },
      Koopa: {
        width: 8, height: 12,
        arguments: {
          smart: Boolean,
          movement: ["moveSimple", "moveJumping", "moveFloating"]
        },
        functions: {
          preview: function(me, properties) {
            if(me.smart = StringToBool(properties.smart)) addCurrentPreviewClass("smart");
            else removeCurrentPreviewClass("smart");
            switch(properties.movement) {
              case "moveJumping": case "moveFloating": addCurrentPreviewClass("flying"); break;
              default: removeCurrentPreviewClass("flying");
            }
          }
        },
        postargs: [
          function(preline, properties) { return properties.smart.toLowerCase(); },
          function(preline, properties) {
            switch(properties.movement) {
              case "moveSimple": return "undefined";
              case "moveJumping": return "true";
              case "moveFloating":
                var height = preline.yloc,
                    one = height - 32,
                    two = height + 48;
              return "[" + one + ", " + two + "]";
            }
          }
        ]
      },
      Beetle: {
        width: 8.5, height: 8.5,
        widthoff: -.5,
        heightoff: -.5
      },
      HammerBro: { width: 8, height: 12 },
      CheepCheep: {
        width: 8, height: 8, arguments: { red: Boolean },
        functions: {
          preview: function(me, properties) {
            if(me.red = StringToBool(properties.red)) addCurrentPreviewClass("red");
            else removeCurrentPreviewClass("red");
          }
        },
        postargs: [ function(preline, properties) { return properties.red.toLowerCase(); } ]
      },
      Lakitu: { width: 8, height: 12, alt: "hiding" },
      Podoboo: { width: 7, height: 8, alt: "flip-vert" },
      Blooper: { width: 8.5, height: 12, alt: "squeeze" }
    },
    scenery: {
      Bush1: {width: 16, height: 8},
      Bush2: {width: 24, height: 8},
      Bush3: {width: 32, height: 8},
      Cloud1: {width: 16, height: 12, previewstyle: { background_position: "center center" }},
      Cloud2: {width: 24, height: 12, previewstyle: { background_position: "center center" }},
      Cloud3: {width: 32, height: 12, previewstyle: { background_position: "center center" }},
      HillSmall: {width: 24, height: 9.5, heightoff: -1.5},
      HillLarge: {width: 40, height: 17.5, heightoff: -1.5},
      PlantSmall: {width: 7, height: 15, heightoff: -3},
      PlantLarge: {width: 8, height: 23, heightoff: -3},
      Fence: {
        height: 8,
        arguments: { width: 1 },
        multiplier: { width: 8 },
        previewstyle: {
          background_size: "50%",
          background_repeat: "repeat-x",
          background_position: "center bottom"
        },
        postargs: [ function(preline, properties) { return properties.width; } ]
      },
      CastleWall: {
        width: 8, height: 48,
        arguments: { width: 1 },
        multiplier: { width: 8 },
        previewstyle: {
          background_size: "50%",
          background_repeat: "repeat-x",
          background_position: "center top"
        }
      },
      Castle: { width: 72, height: 88 }
    },
    // specials: {
      
    // },
    settings: {
      area: {
        arguments: {
          time: 350,
          night: Boolean,
          setting: ["Overworld", "Underworld", "Underwater", "Castle"]
        }
      },
      fill: {
        arguments: {
          x_spacing: 0,
          y_spacing: 0
        }
      },
      activation: displayEditorSettings,
      nofollow: true
    }
  }
  
  // Make sure extra required properties are either set already or at the default
  var me, locj, load_paths = {}
  for(i in editor) {
    locj = 0;
    for(j in editor[i]) {
      me = editor[i][j];
      // Set the default multipliers
      if(me.multiplier) {
        me.multiplier.width = me.multiplier.width || 1;
        me.multiplier.height = me.multiplier.height || 1;
      }
      else me.multiplier = {width: 1, height: 1};
      // Remember the ordered number - useful for bottom bar
      me.ordernum = locj++;
      // Set the default heightoff and widthoff
      me.heightoff = me.heightoff || 0;
      me.widthoff = me.widthoff || 0;
      // Set the functions list
      me.functions = me.functions || {}
      // Set load_name and current section references so loading maps can work
      load_paths[j] = editor[i][j];
      editor[i][j].section_name = i;
    }
  }
  
  editor.load_paths = load_paths;
  
  // Don't need to have properties set
  editor.fill = {
    x: false,
    y: false,
    numrows: 1,
    numcols: 1,
    placed: {
              0: [],
              col_highest: 0,
              col_lowest: 0,
              row_highest: 0,
              row_lowest: 0
              }
  },
  editor.placed = [];
  editor.controls = [];
  editor.offset = { x: 0 }; // max is set upon running, if actually needed
  editor.startx = unitsizet16;
  editor.starty = 1536 / unitsize;
  editor.locsettings = {
    setting: "Overworld",
    time: 350,
    night: false
  }
}

/* Initial HTML setup
 */
function setEditorHTML() {
  setEditorPreviews();
  setEditorBackground();
  setSidebar();
  setEditorScrolling();
  setBottomBar();
  setFollower();
  setGuideLines();
}

function setSidebar() {
  // First, create the text
  var text = "", options = ["Solids", "Characters", "Scenery", "Settings"], i, fillgroup;
  text += "<h1>Map Editor</h1>";
  text += "<div class='group first' id='category'>";
  text += "<select id='sectionselect' class='options big'>";
  for(i in options) text += "<option>" + options[i] + "</option>";
  text += "</select>";
  text += "</div>";
  text += "<div id='previewmain' class='preview'></div>";
  text += "<div class='group' id='options'>";
  text += "</div>";
  
  // Create the sidebar, and add the text
  window.sidebar = document.createElement("div");
  sidebar.id = "sidebar";
  sidebar.innerHTML = text;
  
  /*
  // Add the fill elements
  fillgroup = document.createElement("div");
  fillgroup.id = "settings_fill";
  fillgroup.className = "group lol";
  fillgroup.innerHTML = "<h3>fill</h3>";
  fillgroup.innerHTML += getCurrentOptions(editor.settings.fill);
  fillgroup.style.position = "absolute";
  fillgroup.style.bottom = "70px";
  setInputsChange(editor.fillinputs = fillgroup.getElementsByTagName("input"));
  // Set the fill options
  sidebar.appendChild(fillgroup);
  */
  
  // Add the sidebar to the body
  body.appendChild(sidebar);
  sectionselect.onchange = editorSelectSection;
}
function editorSelectSection() { 
  setEditorSection(this.value.toLowerCase());
}

function setBottomBar() {
  window.bottombar = document.createElement("div");
  bottombar.id = "bottombar";
  bottombar.style.maxWidth = (innerWidth - sidebar.clientWidth) + "px";
  body.appendChild(bottombar);
}

function setFollower() {
  window.follower = document.createElement("div");
  window.follower_style = follower.style;
  follower.id = "follower";
  follower.style.cursor = "crosshair";
  body.appendChild(follower);
  updateCurrentArguments(editor.current);
}

function setEditorPreviews() {
  window.previews = document.createElement("div");
  previews.id = "previews";
  body.appendChild(previews);
}

function setEditorBackground() {
  var background_style = (window.background = document.createElement("div")).style;
  
  background.id = "background";
  background.className = "mario"; // for the background image
  background_style.zIndex = "-70";
  background_style.cursor = "crosshair";
  background_style.backgroundRepeat = "no-repeat";
  background_style.backgroundPosition = editor.startx + "px " + editor.starty + "px";
  background_style.backgroundSize = (7 * unitsize) + "px, " + unitsizet8 + "px";
  
  body.appendChild(background);
  
  /*
  me.width = 7;
  me.height = 8;
  */
}

function setGuideLines() {
  var lines = {
        floor: 0,
        ceiling: ceillev,
        jumplev1: jumplev1,
        jumplev2: jumplev2
      }, i, parent, line,
      left = 16 * unitsize + "px";
  
  // The parent holds them and provides the marginLeft
  parent = document.createElement("div");
  parent.style.marginLeft = left;
  parent.id = "maplines";
  
  for(i in lines) {
    line = document.createElement("div");
    line.innerText = i;
    line.id = i + "_line";
    line.style.marginTop = (map.floor - lines[i]) * unitsize + "px";
    line.style.marginLeft = "-" + left;
    line.style.paddingLeft = left;
    parent.appendChild(line);
  }
  body.appendChild(parent);
}

/* Preview & panel settings
*/
function displayEditorSettings() {
  bottombar.style.visibility = "hidden";
  
  
  sidebar.appendChild(group);
}

function setEditorSection(name) {
  var section = editor.section = editor[name], first, i;
  editor.section_name = name;
  
  // Make the current preview the first one in section. I wonder if there's a better way to do this...
  for(i in section) { setEditorCurrent(i); break; }
  
  // Clear and reset the bottom bar
  bottombar.innerHTML = bottombar.style.visibility = "";
  for(i in section) addEditorBottomPreview(i, section[i]);
  
  if(section.activation) section.activation();
}

function setEditorCurrent(name) {
  var current = editor.current = editor.section[editor.current_name = name],
      innerHTML = "<h3>" + name + "</h3>",
      elem_inputs, elem_selects, elem_options, elements, elem;
  
  // Fill the options panel
  innerHTML += getCurrentOptions(current);
  options.innerHTML = innerHTML;

  // Set the preview images, and follower size
  previewmain.className = follower.className = getPreviewClassName(name);
  previewmain.removeAttribute("style");
  setExtraPreviewStyle(previewmain, current.previewstyle);
  updateFollowerPreview(current);
  
  // Make changes to the inputs and dropdowns have effects
  // To do: there's probably a better way to do this.
  setInputsChange(options.getElementsByTagName("input"));
  setInputsChange(options.getElementsByTagName("select"));
  setInputsChange(options.getElementsByTagName("option"));
  
  // Finally, set the current follower visual settings
  updateCurrentArguments(current);
}

// setTimeout is used to make sure it's applied after the onchange is recorded
function setInputsChange(elements) {
  var i, j, events = ["onchange", "onclick", "onkeypress", "onkeyup", "onfocus", "onselect", "onmouseup", "onmousedown"], // just in case
      func = function() { setTimeout(updateCurrentArguments); };
  for(i in elements) {
    elem = elements[i];
    for(j in events) elem[events[j]] = func;
  }
}

function updateCurrentArguments(current) {
  var properties = getEditorCurrentProperties();
  current = current || editor.current;
  
  // Now that the properties are known, first apply width and height...
  if(properties.width)
    follower_style.width = (editor.fill.xeachraw = determineFollowerStyleSize(properties.width, "width")) + "px";
  if(properties.height)
    follower_style.height = (editor.fill.eachyraw = determineFollowerStyleSize(properties.height, "height")) + "px";
  
  // ... then clear any attachments
  follower.innerHTML = "";
  
  // ... and if necesary, editor.current's extra function on properties
  if(current && current.functions.preview) current.functions.preview(current, properties);
  
  // Also update the arguments for the fill tool
  // updateFillArguments();
}

function updateFillArguments() {
  var dxs = editor.settings.fill.arguments.x_spacing = editor.fillinputs[0].value,
      dys = editor.settings.fill.arguments.y_spacing = editor.fillinputs[1].value,
      fill = editor.fill;
  
  fill.xeach = fill.xeachraw + dxs * unitsize;
  fill.eachy = fill.eachyraw + dys * unitsize;
}

function getEditorCurrentProperties() {
  var rows = options.getElementsByTagName("tr"),
      cells, properties = {}, name, value, i, j,
      current = editor.current;
  
  // Grab the user-visible properties from the sidebar
  for(i = 0, len = rows.length; i < len; ++i) {
    // For each argument, place it in properties
    cells = rows[i].cells;
    name = extractCellText(cells[0]);
    value = extractCellText(cells[1]);
    properties[name] = value;
  }
  
  // Get the current and section names
  properties.current_name = editor.current_name;
  properties.section_name = editor.section_name;
  
  // Make sure widthoff, heightoff, customfunc, and postargs are set too
  if(current) {
    properties.widthoff = current.widthoff;
    properties.heightoff = current.heightoff;
    properties.customfunc = current.customfunc;
    properties.postargs = current.postargs;
  }
  
  return properties;
}

function determineFollowerStyleSize(amount, name) {
  var multiplier = 1;
  multiplier = editor.current.multiplier[name];
  return amount * unitsize * multiplier;
}

function updateFollowerPreview(current) {
  follower_style.width = (follower.width = current.width) * unitsize + "px";
  follower_style.height = (follower.height = current.height) * unitsize + "px";
}

function followerFollowsCursor(event) {
  var x = roundFollowerDigit(event.x) + (editor.current.widthoff - editor.offset.x) * unitsize,
      y = roundFollowerDigit(event.y) + editor.current.heightoff * unitsize;
  
  follower_style.marginLeft = (follower.x = x) + "px";
  follower_style.marginTop = (follower.y = y) + "px";
}

/* 
*/
function setEditorScrolling() {
  var names = ["right", "left"], scrollers = {},
      i, parent, div, top;
  
  // Set the parent #scrollers to hold them
  parent = document.createElement("div");
  parent.id = "scrollers";
  parent.style.zIndex = "7";
  parent.style.width = (innerWidth - sidebar.clientWidth) + "px";
  body.appendChild(parent);
  
  for(i = names.length - 1; i >= 0; --i) {
    div = scrollers[names[i]] = document.createElement("div");
    div.id = "scroller_" + names[i];
    div.className = "scroller";
    div.style.zIndex = "7";
    div.style.cssFloat = names[i];
    div.style.marginTop = screen.height * unitsized4 + "px";
    div.onmouseover = hideFollower;
    div.onmousedown = window["startEditorScrolling" + capitalizeFirst(names[i])];
    div.onmouseout = div.onmouseup = stopEditorScrolling;
    parent.appendChild(div);
  }
  
  scrollers.left.style.visibility = "hidden";
  editor.offset.max = (innerWidth - sidebar.clientWidth) / unitsize;
  
  editor.scrollers = scrollers;
}

function startEditorScrollingLeft() {
  var scroller_left_style = scroller_left.style,
      editor_offset = editor.offset;
  
  editor.scrolling = setInterval(function() {
    if(editor_offset.x == 0) {
      scroller_left_style.visibility = "hidden";
      return;
    }
    scroller_left_style.visibility = "";
    scrollEditorWindow(8);
  }, timer);
  
  hideFollower();
}
function startEditorScrollingRight() {
  editor.scrolling = setInterval(function() {
    scrollEditorWindow(-8);
  }, timer);
  scroller_left.style.visibility = "";
  hideFollower();
}
function stopEditorScrolling(event) {
  clearInterval(editor.scrolling);
  showFollower();
  followerFollowsCursor(event);
}

function scrollEditorWindow(dx) {
  editor.offset.x += dx;
  
  // To do: unify
  body.style.marginLeft = editor.offset.x * unitsize + "px";
  scrollers.style.marginLeft = editor.offset.x * unitsize * -1 + "px";
  maplines.style.marginLeft = (editor.offset.x - 16) * unitsize * -1 + "px";
}

/* HTML/Text generators
*/
function getCurrentOptions(current) {
  var text = "<table>", arguments = current.arguments;
  if(current.width) text += addAutoOption("width", current.width);
  if(current.height) text += addAutoOption("height", current.height);
  if(arguments) 
    for(i in arguments)
      text += addCurrentOption(i.replace("_","-"), arguments[i]);
  return text + "</table>";
}

function addAutoOption(name, value) {
  if(value == Infinity) value = "Inf.";
  return "<tr class='auto'><td>" + name + ": </td><td class='auto'>" + value + "</td><td>";
}

function addCurrentOption(name, value) {
  var text =  "<tr id='option_" + name + "'><td>" + name + ": </td><td>";

  switch(value) {
    case Infinity: text += "Inf"; break;
    case Boolean:
      text += "<select><option>False</option><option>True</select>";
    break;
    case Number:
      text += "<input type='text' class='lol'>";
    break;
    default: 
      switch(typeof(value)) {
        case "number": text += "<input type='text' class='text' value='" + value + "'>"; break;
        case "string": text += "<input type='text' class='text wide' value='" + value + "'>"; break;
        case "object":
          text += "<select>";
          for(i in value) text += "<option>" + value[i] + "</option>";
          text += "<select>";
        break;
      }
    break;
  }
  return text + "</td></tr>";
}

function updateSidebarOption(nameraw, value) {
  var name = "option_" + nameraw,
      item = document.getElementById(name).cells[1].firstChild,
      valuereal = removeLastS(String(value).toLowerCase());
  switch(item.tagName) {
    case "SELECT": 
      for(var i, j = 0; i = item.options[j]; j++) {
        if(removeLastS(i.value.toLowerCase()) == valuereal) {
          item.selectedIndex = j;
          break;
        }
      }
    break;
    default: item.value = value; break;
  }
  updateCurrentArguments(editor.current);
}

function addEditorBottomPreview(name, thing) {
  var div = document.createElement("div");
  div.className = "previewbottom " + name.toLowerCase() + " one " + (thing.bottomclass || "");
  div.onclick = function() { setEditorCurrent(name); }
  setExtraPreviewStyle(div, thing.previewstyle);
  // setPreviewHovers(div, name);
  bottombar.appendChild(div);
}

function addFollowerAttachment(properties) {
  var div = document.createElement("div"),
      div_style = div.style, i, attr,
      sizes = ["width", "height"],
      margins = ["top", "right", "bottom", "left"];
  
  div.className = "attachment " + (properties.className || "");
  for(i in sizes) {
    attr = sizes[i];
    if(properties[attr])
      div_style[attr] = properties[attr] * unitsize + "px";
  }
  for(i in margins) {
    attr = margins[i];
    if(properties[attr])
      div_style["margin" + capitalizeFirst(attr)] = properties[attr] * unitsize + "px";
  }
  
  follower.appendChild(div);
}

/* Editor mouse events
*/

function setEditorEvents() {
  var activators = [maplines, background, follower], me;
  for(var i = activators.length - 1; i >= 0; --i) {
    me = activators[i];
    me.onmousedown = editorMouseDown;
    me.onmouseup = editorMouseUp;
  }
  
  document.onmousemove = followerFollowsCursor;
}

function editorMouseDown(event) {
  if(editor.section.nofollow) return;
  var x = follower.x,
      y = follower.y,
      fill = editor.fill;
  
  fill.placed[0][0] = addPlacer(x, y);
}

function editorMouseUp(event) {
  editorClick(event);
  // game.fill.placed = [[]];
  // body.removeChild(editor.fillpreview);
  document.onmousemove = followerFollowsCursor;
}

function createFollowerCopy(x, y) {
  // Create lol's first child as a copy of the follower... (outerHTML cannot be modified)
  var lol = document.createElement("div"),
      lol_style;
  lol.innerHTML = follower.outerHTML.replace("id","class");
  // ...so then set lol as the copy child
  lol = lol.firstChild;
  // Set lol's unique traits
  lol.id = "";
  lol.className = follower.className + " fillpreview follower";
  lol_style = lol.style;
  lol_style.marginLeft = x + "px";
  lol_style.marginTop = y + "px";
  lol_style.zIndex = "-96";
  previews.appendChild(lol);
  
  game.clearSelection(); // just because
  return lol;
}

// No longer used for the big stuff - now it's onmousedown
function editorClick(event) {
  // Reset the onmousemove
  document.onmousemove = followerFollowsCursor;
  
  if(event && event.preventDefault) event.preventDefault();
}

function addPlacer(x, y) {
  var placer = createFollowerCopy(x, y),
      record = new recordEditorPlacement(placer, getEditorCurrentProperties()),
      i;
  
  previews.appendChild(placer);
  for(i in editor.controls) removeElementClass(editor.controls[i], "disabled");
  editor.placed.push(record);
  return placer;
}

function recordEditorPlacement(placer, properties) {
  this.name = editor.current;
  this.x = follower.x;
  this.y = follower.y;
  this.placer = placer;
  placer.parent = this;
  this.properties = properties;
}

/* Editor Controls
*/
function setEditorControls() {
  var names = ["load", "save", "reset", "undo"],
      name, i, div, container;
  
  container = document.createElement("div");
  container.id = "controls";
  
  for(i in names) {
    name = names[i];
    div = document.createElement("div");
    div.id = name;
    div.className = "control " + (name != "load" ? "disabled" : "");
    div.style.backgroundImage = "url(Theme/" + name + ".gif)";
    div.onclick = window["editor" + capitalizeFirst(name)];
    
    container.appendChild(div);
    editor.controls[name] = div;
  }

  sidebar.appendChild(container);
}

function editorUndo() {
  switch(editor.placed.length) {
    case 0: return false;
    case 1: for(i in editor.controls) editor.controls[i].className += " disabled"; // loader doesn't care
  }
  previews.removeChild(editor.placed.pop().placer);
  return true;
}

function editorReset() { if(editorUndo()) setTimeout(editorReset, 35); }
function editorResetImmediate() { while(editorUndo()) {}; }

function editorPlay() {
  var rawfunc = getEditorSave(),
      mapfunc = Function(rawfunc);
  body.style.marginLeft = "";
  mapfuncs.Custom = {Map: mapfunc};
  currentmap = ["Custom", "Map"];
  setMap(mapfunc);
}

/* Function creation!
*/
function editorSave() {
  if(editor.placed.length == 0) return;
  var text = getEditorSave();
  createEditorInputWindow("Hit Submit below to start playing!<br><p style='font-size:.7em;text-decoration:line-through'>You may copy this text to work on again later using Load (the button next to Save)</p>", text, submitGameFunc);
  return text;
}

function getEditorSave() {
  var prelines, json, lines, mapfunc;
  
  // Get the prelines based on everything in placed
  prelines = createEditorMapFuncPreLines(editor.placed),
  
  // Sort the prelines based on x, then y, position
  sortEditorMapFuncPreLines(prelines);
  
  // Create a string that can eval/parse to an object storing the lines
  lines = createJSONMapLines(prelines);
  
  // Wrap the lines with the rest of the map function
  mapfunc = createEditorMapFunc(lines);
  
  return mapfunc;
}

function createEditorMapFuncPreLines(placed) {
  var prelines = [], floor = map.floor,
      i, len, current, properties, customfunc, funcname;
  for(i = 0, len = placed.length; i < len; ++i) {
    // Copy over the base attributes
    current = placed[i];
    properties = current.properties;
    // Format the function name
    if(customfunc = properties.customfunc) funcname = (customfunc instanceof Function ? customfunc(current, properties) : customfunc);
    else funcname = properties.section_name == "scenery" ? "pushPreScenery" : "pushPreThing";
    // Create the preline
    prelines[i] = {
      xloc: current.x / unitsize,
      // yloc is set by the bottom left corner for pushPreThing, and top left corner for pushPreScenery
      yloc: floor - current.y / unitsize - Number(funcname == "pushPreThing" ? 0 : properties.height),
      postargs: properties.postargs,
      prefunc: funcname,
      prething: properties.current_name,
      properties: properties
    }
  }
  
  return prelines;
}

function sortEditorMapFuncPreLines(prelines) { prelines.sort(prethingsorter); }

function createJSONMapLines(prelines) {
  var lines = [], j, line, len, preline, line, args;
  for(var i = 0, len = prelines.length; i < len; ++i) {
    preline = prelines[i];
    line = {
      xloc: preline.xloc,
      yloc: preline.yloc,
      prefunc: preline.prefunc,
      prething: preline.prething,
      args: []
    }
    if(args = preline.postargs) {
      for(j in args) 
        line.args.push(args[j](preline, preline.properties) || "undefined");
    }
    lines.push(JSON.stringify(line));
  }
  return lines;
}

function createEditorMapFunc(lines) {
  var finished = "["
    
  for(var i = 0, len = lines.length; i < len; ++i) finished += "  " + lines[i] + ",";
  
  finished = removeLast(finished);
  
  return finished + "]";
}

/* Super duper fancy input window
*/
function createEditorInputWindow(blurb, value, submitfunc) {
  var div = editor.input = document.createElement("div"), input, submit, cancel;
  blurb = blurb || ""; value = value || "";
  
  div.id = "input_window";
  div.style.zIndex = 84;
  div.style.width = (screen.width * unitsize - sidebar.clientWidth) + "px";
  div.innerHTML = blurb;
  
  input = document.createElement("textarea");
  input.id = "window_input";
  input.value = value;
  input.style.width = (screen.width * 4 - sidebar.clientWidth - 49) + "px"; // 70 is for the margin & padding styles
  
  submit = document.createElement("div");
  submit.id = "window_submit";
  submit.className = "window_button"
  submit.innerText = "Submit";
  submit.onclick = submitfunc;
  
  cancel = document.createElement("div");
  cancel.id = "window_cancel";
  cancel.className = "window_button"
  cancel.innerText = "Cancel";
  cancel.onclick = cancelEditorInputWindow;
  
  div.appendChild(input);
  div.appendChild(submit);
  div.appendChild(cancel);
  
  body.appendChild(div);
  follower.style.visibility = "hidden";
  game.scrollEditorWindow(game.editor.offset.x * -1);
}

function cancelEditorInputWindow() {
  follower.style.visibility = "";
  body.removeChild(input_window);
}

function getEditorInputWindowText() {
  return window_input.value;
}

function submitGameFunc() {
  var rawtext = getEditorInputWindowText(),
      uncool = "!@#$%^&\/;", errors, errortext = "",
      gamefunc, ok = true, i;
  
  // Make sure bad characters aren't involved
  for(i = uncool.length - 1; i >= 0; --i) {
    if(rawtext.indexOf(uncool[i]) >= 0) {
      errortext += " " + uncool[i] + " ";
      ok = false;
    }
  }
  if(!ok) return editorWindowError(errortext);
  
  window.gamefunc = gamefunc = parseJSONMapFunc(rawtext);

  if(typeof(gamefunc) == "function") {
    setMapCustom(gamefunc);
    removeElementClass(body, "Editor");
  }
}

function parseJSONMapFunc(rawtext) {
  var text = rawtext.replace(new RegExp("\n","gm")," "),
      lines = JSON.parse(text), line, output = "";
  
  output += "custom = function(map) {";
  output += "  map.locs = [ new Location(0, true) ];";
  output += "  map.areas = [";
  output += "    new Area(\"Overworld Editor\", function() {";
  output += "      setLocationGeneration(0);  "
  
  window.lines = lines;
  
  // lines is an object, which contains:
    // xloc: xloc,
    // yloc: yloc,
    // prefunc: prefunc (if there is one)
    // prething: prething (used if there isn't prefunc)
    // args: [arg1, arg2, arg3]
  for(var i = 0, leni = lines.length; i < leni; ++i) {
    line = lines[i];
    // Start the line with...
    switch(line.prefunc) {
      case "pushPreThing": output += "pushPreThing(" + line.prething + ", "; break;
      case "pushPreScenery": output += "pushPreScenery(\"" + line.prething + "\", "; break;
      default: output += line.prefunc + "("; // a custom function
    }
    // Add xloc and yloc
    output += line.xloc + ", " + line.yloc;
    // Add any arguments
    for(var j = 0, len = line.args.length; j < len; ++j)
      output += ", " + line.args[j];
    output += "); ";
  }
  
  output += "    })";
  output += "  ];";
  output += "};";
  
  window.output = output;
  window.durp = eval(output);
  return eval(output);
}

function editorWindowError(text) {
  alert("Found bad input: " + text);
}


/* Loading previously started stuffs
[  {"xloc":0,"yloc":0,"prefunc":"pushPreFloor","prething":"Floor","args":["24"]},  {"xloc":144,"yloc":8,"prefunc":"pushPrePipe","prething":"Pipe","args":[16,"false"]},  {"xloc":248,"yloc":48,"prefunc":"pushPreThing","prething":"Cannon","args":["2"]}]
*/
function editorLoad() {
  // To do: use localStorage to keep the most recently submitted one?
  createEditorInputWindow("Paste your work in progress here, and click Submit to continue it.", "", submitEditorLoad);
}

function submitEditorLoad() {
  // Check code copypastad directly from save code
  var rawtext = getEditorInputWindowText(),
      uncool = "!@#$%^&\/;", errors, errortext = "",
      ok = true, i, parsed;
  
  // Make sure bad characters aren't involved
  for(i = uncool.length - 1; i >= 0; --i) {
    if(rawtext.indexOf(uncool[i]) >= 0) {
      errortext += " " + uncool[i] + " ";
      ok = false;
    }
  }
  if(!ok) return editorWindowError(errortext);
  
  try {
    parsed = JSON.parse(rawtext);
  }
  catch(err) {
    alert("Bad input: " + err);
  }
  editorResetImmediate();
  
  editorLoadParsed(parsed);
  body.removeChild(input_window);
}

// For each object in parsed, emulate the effects of actually calling editorMouseDown
function editorLoadParsed(parsed) {
  follower.style.visibility = "visible";
  
  var i, len, current, reference;
  for(i = 0, len = parsed.length; i < len; ++i) {
    current = parsed[i];
    reference = editor.load_paths[parsed[i].prething];
    setEditorSection(reference.section_name);
    setEditorCurrent(current.prething);
    if(reference.loadfunc) reference.loadfunc(current, reference, parsed[i]);
    defaultLoadParse(current, reference, parsed[i]);
  }
}

function defaultLoadParse(current, reference) {
  var xreal = current.xloc * unitsize,
      yreal = (map.floor - current.yloc) * unitsize;
  
  if(reference.section_name == "scenery") yreal -= (reference.height/* + reference.heightdiff*/) * unitsize;
  
  followerFollowsCursor({x: xreal, y: yreal});
  
  editorMouseDown({x: xreal, y: yreal});
}

/* Small helpers
*/
function showFollower() {
  follower_style.visibility = "";
  // follower_style.cursor = background.style.cursor = maplines.style.cursor = "crosshair";
}
function hideFollower() {
  follower_style.visibility = "hidden";
  // follower_style.cursor = background.style.cursor = maplines.style.cursor = "default";
}
function addFollowerClass(name) { follower.className += " " + name; }
function removeFollowerClass(name) { follower.className = follower.className.replace(name, ""); }
function addCurrentPreviewClass(name) {
  name = " " + name;
  previewmain.className += name;
  // bottombar.children[game.editor.current.ordernum].className += name;
  follower.className += name;
}
function removeCurrentPreviewClass(name) {
  previewmain.className = previewmain.className.replace(name, "");
  // var bottom = game.bottombar.children[game.editor.current.ordernum];
  // bottom.className = bottom.className.replace(name, "");
  follower.className = follower.className.replace(name, "");
}
function setExtraPreviewStyle(div, styles) { for(i in styles) div.style[i.replace("_","-")] = styles[i]; }
function getPreviewClassName(name) { return removeLastS(editor.section_name) + " " + name.toLowerCase() + " one"; }
function capitalizeFirst(str) { return str[0].toUpperCase() + str.substr(1); }
function removeLast(str) { return str.substring(0, str.length - 1); }
function removeLastS(str) { return str[str.length - 1] == 's' ? str.substring(0, str.length - 1) : str; }
function extractCellText(cell) {
  // If it contains an input-style element, return the value
  if(cell.firstChild.value) return cell.firstChild.value;
  
  // Otherwise return the text.
  var text = cell.innerText;
  text = text.replace(" ", "").replace(":", "");
  return (text == "Inf.") ? screen.height : text;
}
function StringToBool(text) {
  if(typeof(text) != "string") return text;
  switch(text.toLowerCase()) {
    case "true": case "on": case "1": case "one": return true;
    default: return false;
  }
}
function BoolToString(bool) {
  if(typeof(text) == "boolean") return bool ? "true" : "false";
  switch(bool.toLowerCase()) {
    case "true": case "on": case "1": case "one": return "true";
    default: return "false";
  }
}
function roundFollowerDigit(num) {
  var diff = editor.section_name == "solids" ? 8 : 4;
  // switch(editor.section_name) {
    // case "solids": diff = 8; break;
    // case "characters": diff = 4; break;
    // case "scenery": diff = 2; break;
  // }
  return unitsize * diff * round(num / (unitsize * diff));
}
function getFollowerAttachmentItemName(str) {
  switch(str) {
    case "coin": case "coins": return "character coin still one";
    case "mushroom": return "character mushroom";
    case "star": return "character item star one";
    case "1up mushroom": return "character mushroom gainlife";
    case "vine": return "solid vine";
  }
  //properties.contents.toLowerCase() + " one " + (properties.contents == "Star" ? "item" : "character"
}

function SplitByLines(text) { return text.split(/\r?\n/); }

function clearSelection() {
  // Chrome
  getSelection().empty()
}