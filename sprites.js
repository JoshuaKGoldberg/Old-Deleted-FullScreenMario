/* sprites.js */
// Contains functions for finding, setting, and manipulating sprites

// Resets the main canvas and context
function resetCanvas() {
  // The global canvas is one that fills the screen
  window.canvas = getCanvas(innerWidth, innerHeight, true);
  // window.canvas = createElement(
    // "canvas",
    // {width: innerWidth,
     // height: innerHeight,
     // style: {
       // width: innerWidth + "px",
       // height: innerHeight + "px"
     // }});
  // The context is saved for ease of access
  window.context = canvas.getContext("2d");
  body.appendChild(canvas);
}

/* Sprite Parsing */
// These functions deal turning library.rawsprites strings into library.sprites Uint8ClampedArrays
// * Normal sprites (see library.js::libraryParse):
//    spriteUnravel -> spriteExpand -> spriteGetArray
// * Filtered sprites (see library.js::applyPaletteFilterRecursive)
//    spriteUnravel -> applyPaletteFilter -> spriteExpand -> spriteGetArray

// Given a compressed raw sprite data string, this 'unravels' it (uncompresses)
// This is the first function called on strings in libraryParse
// This could output the Uint8ClampedArray immediately if given the area - deliberately does not, for ease of storage
function spriteUnravel(colors) {
  var paletteref = getPaletteReferenceStarting(window.palette),
      digitsize = window.digitsize,
      clength = colors.length,
      current, rep, nixloc, newp, i, len,
      output = "", loc = 0;
  while(loc < clength) {
    switch(colors[loc]) {
      // A loop, ordered as 'x char times ,'
      case 'x':
        // Get the location of the ending comma
        nixloc = colors.indexOf(",", ++loc);
        // Get the color
        current = makeDigit(paletteref[colors.slice(loc, loc += digitsize)], window.digitsize);
        // Get the rep times
        rep = Number(colors.slice(loc, nixloc));
        // Add that int to output, rep many times
        while(rep--) output += current;
        loc = nixloc + 1;
      break;
      
      // A palette changer, in the form 'p[X,Y,Z...]' (or 'p' for default)
      case 'p':
        // If the next character is a '[', customize.
        if(colors[++loc] == '[') {
          nixloc = colors.indexOf(']');
          // Isolate and split the new palette's numbers
          paletteref = getPaletteReference(colors.slice(loc + 1, nixloc).split(","));
          loc = nixloc + 1;
          digitsize = 1;
        }
        // Otherwise go back to default
        else {
          paletteref = getPaletteReference(window.palette);
          digitsize = window.digitsize;
        }
      break;
      
      // A typical number
      default: 
        output += makeDigit(paletteref[colors.slice(loc, loc += digitsize)], window.digitsize);
      break;
    }
  }
  
  return output;
}

// Now that the sprite is unraveled, expand it to scale (repeat characters)
// Height isn't known, so it'll be created during drawtime
function spriteExpand(colors) {
  var output = "",
      clength = colors.length,
      current, i = 0, j;
  
  // For each number,
  while(i < clength) {
    current = colors.slice(i, i += digitsize);
    // Put it into output as many times as needed
    for(j = 0; j < scale; ++j)
      output += current;
  }
  return output;
}

// Given the expanded version of colors, output the rgba array
// To do: not be so crappy
function spriteGetArray(colors) {
  var clength = colors.length,
      numcolors = clength / digitsize,
      split = colors.match(new RegExp('.{1,' + digitsize + '}', 'g')),
      olength = numcolors * 4,
      output = new Uint8ClampedArray(olength),
      reference, i, j, k;
  // console.log("spriteGetArray",colors);
  // For each color,
  for(i = 0, j = 0; i < numcolors; ++i) {
    // Grab its RGBA ints
    reference = palette[Number(split[i])];
    // Place each in output
    for(k = 0; k < 4; ++k)
      output[j + k] = reference[k];
    j += 4;
  }
  
  return output;
}


/* Sprite Searching */
// These functions find a sprite in library.sprites, and parse it

// Goes through all the motions of finding and parsing a thing's sprite
// This is called when the sprite's appearance changes.
function setThingSprite(thing) {
  if(thing.hidden || !thing.title) return;
  // The cache is first chcked for previous references to the same className
  var cache = library.cache,
      width = thing.spritewidth,
      height = thing.spriteheight,
      title = thing.title,
      className = thing.className,
      classes = className.split(/\s+/g).slice(1).sort(), // first one will be thing type (character, solid...)
      key = title + " " + classes, // ex: "Mario mario,running,small,two"
      cached = cache[key],
      sprite;
      
  // If one isn't found, search for it manually
  sprite = getSpriteFromLibrary(thing);
  if(!sprite) {
    log("Could not get sprite from library on " + thing.title);
    return;
  }
  if(sprite.multiple) {
    expandObtainedSpriteMultiple(sprite, thing, width, height);
    thing.sprite_type = sprite.type;
  }
  else {
    expandObtainedSprite(sprite, thing, width, height);
    thing.sprite_type = "normal";
  }
}

// Given a thing, it will determine which sprite in library.sprites it should use
// This is based off a key which uses the setting, title, and classes
function getSpriteFromLibrary(thing) {
  var cache = library.cache,
      title = thing.title,
      libtype = thing.libtype,
      className = thing.className,
      classes = className.split(/\s+/g).slice(1).sort(),
      setting = (map.area || window.defaultsetting).setting.split(" "),
      key, cached, sprite,
      i;
  
  // So it knows to do these conditionally, add them to the front
  for(i in setting) classes.unshift(setting[i]);
  
  key = title + " " + classes; // ex: "Mario mario,running,small,two"
  cached = cache[key],
  sprite;
  
  // Since one isn't found, search for it manually
  if(!cached) {
    sprite = library.sprites[libtype][title];
    if(!sprite || !sprite.constructor) {
      console.log("Error in checking for sprite of " + title + ".");
      console.log("Title " + title, "\nLibtype " + libtype, "\n", thing, "\n");
      return;
    }
    // If it's more complicated, search for it
    if(sprite.constructor != Uint8ClampedArray) {
      sprite = findSpriteInLibrary(thing, sprite, classes);
    }
      
    // The plain data has been found, so that shall be saved
    cached = cache[key] = { raw: sprite };
  }
  else sprite = cached.raw;
  
  // The raw cache has been found or set: now to adjust for flipping
  // To do: use .flip-horiz, .flip-vert
  switch(String(Number(classes.indexOf("flipped") >= 0)) + String(Number(classes.indexOf("flip-vert") >= 0))) {
    case "11":
      if(!cached["flipboth"]) sprite = cached["flipboth"] = flipSpriteArrayBoth(sprite);
      else sprite = cached["flipboth"];
    break;
    case "10":
      if(!cached["fliphoriz"]) sprite = cached["fliphoriz"] = flipSpriteArrayHoriz(sprite, thing);
      else sprite = cached["fliphoriz"];
    break;
    case "01":
      if(!cached["flipvert"]) sprite = cached["flipvert"] = flipSpriteArrayVert(sprite, thing);
      else sprite = cached["flipvert"];
    break;
    default: sprite = cached.raw;
  }
  
  return sprite;
}

// The typical use case: given a sprite and thing+dimensions, expand it based on scale and write it to the sprite
function expandObtainedSprite(sprite, thing, width, height, norefill) {
  // With the rows set, repeat them by unitsize to create the final, parsed product
  var parsed = new Uint8ClampedArray(sprite.length * scale),
      rowsize = width * unitsizet4,
      heightscale = height * scale,
      readloc = 0,
      writeloc = 0,
      si, sj;
  
  // For each row:
  for(si = 0; si < heightscale; ++si) {
    // Add it to parsed x scale
    for(sj = 0; sj < scale; ++sj) {
      memcpyU8(sprite, parsed, readloc, writeloc, rowsize/*, thing*/);
      writeloc += rowsize;
    }
    readloc += rowsize;
  }
  
  // If this isn't part of a multiple sprite, record the sprite into the thing's canvas
  if(!norefill) {
    thing.num_sprites = 1;
    thing.sprite = parsed;
    refillThingCanvas(thing);
  }
  return parsed;
}
// A set of multiple sprites must each be manipulated individually
function expandObtainedSpriteMultiple(sprites, thing, width, height) {
  // The middle (repeated) sprite is used as normal
  var parsed = {}, sprite, part;
  thing.num_sprites = 0;
  
  // Expand each array from the multiple sprites to parsed
  for(part in sprites) {
    // If it's an actual sprite array, parse it
    if((sprite = sprites[part]).constructor == Uint8ClampedArray) {
      ++thing.num_sprites;
      parsed[part] = expandObtainedSprite(sprite, thing, width, height, true);
    }
    // If it's a number, multiply it by the scale
    else if(typeof(sprite) == "number") parsed[part] = sprite * scale;
    // Otherwise just add it
    else parsed[part] = sprite;
  }
  
  // Set the thing canvas (parsed.middle) 
  thing.sprite = parsed.middle;
  thing.sprites = parsed;
  refillThingCanvases(thing, parsed);
}

// Called when getSpriteFromLibrary has determined the cache doesn't contain the thing
function findSpriteInLibrary(thing, current, classes) {
  var nogood, check, i, prev = current;
  
  // If it's a sprite multiple, return that
  if(current.multiple) return current;
  
  // TO DO: GET RID OF THIS IN RELEASE
  var loop_num = 0;
  
  // Otherwise, keep searching deeper until a string or SpriteMultiple is found
  while(nogood = true) {
    // TO DO: GET RID OF THIS IN RELEASE
    if(++loop_num > 49) {
      alert(thing.title);
      console.log(thing.title, classes, current);
    }
    // If one of the classes is a child of current, go there and remove the class
    for(i in classes) {
      if(check = current[classes[i]]) {
        current = check;
        classes.splice(i, 1);
        nogood = false;
        break;
      }
    }
    
    // If none match, try the default ('normal')
    if(nogood) {
      if(check = current.normal) {
        nogood = false;
        switch(check.constructor) {
          // If it's a sprite array, you've found it.
          case Uint8ClampedArray:
          case SpriteMultiple:
            return check;
          // If it's an object, recurse normally
          case Object: 
            current = check;
          break;
          default:
            current = current[check];
          break;
        }
      } else nogood = true;
    }
    
    // Check the type to see what to do next
    if(!nogood && current) {
      switch(current.constructor) {
        // You did it!
        case Uint8ClampedArray:
        case SpriteMultiple:
          return current;
        // Keep going
        case "Object": 
          continue;
      }
    } else {
      console.log("\nSprite not found! Title: " + thing.title);
      console.log("Classname:", thing.className);
      console.log("Remaining", classes);
      console.log("Current", current);
      console.log("Prev", prev);
      return new Uint8ClampedArray(thing.spritewidth * thing.spriteheight);
    }
  }
}

/* Pixel drawing */
// With sprites set, they must be drawn

// Draws a thing's sprite to its canvas
// Called when a new sprite is found from the library
// To do: memcpyU8 improvements?
function refillThingCanvas(thing) {
  var canvas = thing.canvas,
      context = thing.context,
      imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  memcpyU8(thing.sprite, imageData.data);
  context.putImageData(imageData, 0, 0);
}
// Like refillThingCanvas, but for multiple sprites
function refillThingCanvases(thing, parsed) {
  var canvases = thing.canvases = {},
      width = thing.spritewidthpixels,
      height = thing.spriteheightpixels,
      part, imageData, canvas, context, i;
  thing.num_sprites = 1;
  
  for(i in parsed) {
    // If it's a Uint8ClampedArray, parse it into a canvas and add it
    if((part = parsed[i]) instanceof Uint8ClampedArray) {
      ++thing.num_sprites;
      // Each canvas has a .canvas and a .context
      canvases[i] = canvas = { canvas: getCanvas(width, height) };
      canvas.context = context = canvas.canvas.getContext("2d");
      imageData = context.getImageData(0, 0, width, height);
      memcpyU8(part, imageData.data);
      context.putImageData(imageData, 0, 0);
    }
    // Otherwise just add it normally
    else {
      canvases[i] = part;
    }
  }
  // Treat the middle canvas as the normal
  canvas = canvases.middle;
  thing.canvas = canvas.canvas;
  thing.context = canvas.context;
}

// This is called every upkeep to refill the main canvas
function refillCanvas() {
  var canvas = window.canvas,
      context = window.context,
      things, thing, left, top, i;
  
  // I could implement dirty rectangles, but why? Worst case == average case...
  // context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = area.fillStyle;
  context.fillRect(0, 0, canvas.width, canvas.height);
  for(i = scenery.length - 1; i >= 0; --i) drawThingOnCanvas(context, scenery[i]);
  for(i = solids.length - 1; i >= 0; --i) drawThingOnCanvas(context, solids[i]);
  for(i = characters.length - 1; i >= 0; --i) drawThingOnCanvas(context, characters[i]);
}

// General function to draw a thing to a context
// Calls drawThingOnCanvas[Single/Multiple] with more arguments
function drawThingOnCanvas(context, me) {
  if(me.hidden) return;
  var leftc = me.left,
      topc = me.top;
  if(leftc > innerWidth) return;
  
  // If there's just one sprite, it's pretty simple
  // drawThingOnCanvasSingle(context, me.canvas, me, leftc, topc);
  if(me.num_sprites == 1) drawThingOnCanvasSingle(context, me.canvas, me, leftc, topc);
  // Otherwise some calculations will be needed
  else drawThingOnCanvasMultiple(context, me.canvases, me.canvas, me, leftc, topc);
}
// Used for the vast majority of sprites, where only one sprite is drawn
function drawThingOnCanvasSingle(context, canvas, me, leftc, topc) {
  if(me.repeat) drawPatternOnCanvas(context, canvas, leftc, topc, me.unitwidth, me.unitheight);
  // else context.putImageData(me.context.getImageData(0, 0, me.spritewidthpixels, me.spriteheightpixels), leftc, topc);
  else context.drawImage(canvas, leftc, topc);
}
// Slower than single; used when things have multiple sprites.
function drawThingOnCanvasMultiple(context, canvases, canvas, me, leftc, topc) {
  var topreal = topc,
      leftreal = leftc,
      rightreal = me.right,
      bottomreal = me.bottom,
      widthreal = me.unitwidth,
      heightreal = me.unitheight,
      spritewidthpixels = me.spritewidthpixels,
      spriteheightpixels = me.spriteheightpixels,
      sdiff, canvasref;
  
  // Vertical sprites may have 'top', 'bottom', 'middle'
  if(me.sprite_type[0] == 'v') {
    // If there's a bottom, draw that and push up bottomreal
    if(canvasref = canvases.bottom) {
      sdiff = canvases.bottomheight || me.spriteheightpixels;
      drawPatternOnCanvas(context, canvasref.canvas, leftreal, bottomreal - sdiff, spritewidthpixels, min(heightreal, spriteheightpixels));
      bottomreal -= sdiff;
      heightreal -= sdiff;
    }
    // If there's a top, draw that and push down topreal
    if(canvasref = canvases.top) {
      sdiff = canvases.topheight || me.spriteheightpixels;
      drawPatternOnCanvas(context, canvasref.canvas, leftreal, topreal, spritewidthpixels, min(heightreal, spriteheightpixels));
      topreal += sdiff;
      heightreal -= sdiff;
    }
  }
  
  // Horizontal sprites may have 'left', 'right', 'middle'
  else if(me.sprite_type[0] == 'h'){
    // If there's a left, draw that and push up leftreal
    if(canvasref = canvases.left) {
      sdiff = canvases.leftwidth || me.spritewidthpixels;
      drawPatternOnCanvas(context, canvasref.canvas, leftreal, topreal, min(widthreal, spritewidthpixels), spriteheightpixels);
      leftreal += sdiff;
      widthreal -= sdiff;
    }
    // If there's a right, draw that and push back rightreal
    if(canvasref = canvases.right) {
      sdiff = canvases.rightwidth || me.spritewidthpixels;
      drawPatternOnCanvas(context, canvasref.canvas, rightreal - sdiff, topreal, min(widthreal, spritewidthpixels), spriteheightpixels);
      rightreal -= sdiff;
      widthreal -= sdiff;
    }
  }
  
  // If there's still room, draw the actual canvas
  if(topreal < bottomreal && leftreal < rightreal) {
    drawPatternOnCanvas(context, canvas, leftreal, topreal, widthreal, heightreal);
  }
}


/* Helpers */

// Given a string of a palette, this returns the actual palette object
function getPaletteReferenceStarting(palette) {
  var output = {};
  for(var i = 0; i < palette.length; ++i)
    output[makeDigit(i, digitsize)] = makeDigit(i, digitsize);
  return output;
}

// Given a new palette string, makes a new palette object? Not sure.
function getPaletteReference(palette) {
  var output = {},
      digitsize = getDigitSize(palette);
  for(var i = 0; i < palette.length; ++i)
    output[makeDigit(i, digitsize)] = makeDigit(palette[i], digitsize);
  return output;
}

// Flipping horizontally is reversing pixels within each row
function flipSpriteArrayHoriz(sprite, thing) {
  var length = sprite.length,
      width = thing.spritewidth,
      height = thing.spriteheight,
      newsprite = new Uint8ClampedArray(length),
      rowsize = width * unitsizet4,
      newloc, oldloc,
      i, j, k;
  // For each row
  for(i = 0; i < length; i += rowsize) {
    newloc = i;
    oldloc = i + rowsize - 4;
    // For each pixel
    for(j = 0; j < rowsize; j += 4) {
      for(k = 0; k < 4; ++k)
        newsprite[newloc + k] = sprite[oldloc + k];
      newloc += 4;
      oldloc -= 4;
    }
  }
  return newsprite;
}
// Flipping vertically is reversing the order of rows
function flipSpriteArrayVert(sprite, thing) {
  var length = sprite.length,
      width = thing.spritewidth,
      height = thing.spriteheight,
      newsprite = new Uint8ClampedArray(length),
      rowsize = width * unitsizet4,
      newloc = 0,
      oldloc = length - rowsize,
      i, j, k;
  
  // For each row
  while(newloc < length) {
    // For each pixel in the rows
    for(i = 0; i < rowsize; i += 4) {
      // For each rgba value
      for(j = 0; j < 4; ++j) {
        newsprite[newloc + i + j] = sprite[oldloc + i + j];
      }
    }
    newloc += rowsize;
    oldloc -= rowsize;
  }
  
  return newsprite;
}
// Flipping both horizontally and vertically is actually just reversing the order of pixels
function flipSpriteArrayBoth(sprite) {
  var length = sprite.length,
      newsprite = new Uint8ClampedArray(length),
      oldloc = sprite.length - 4,
      newloc = 0,
      i;
  while(newloc < length) {
    for(i = 0; i < 4; ++i)
      newsprite[newloc + i] = sprite[oldloc + i];
    newloc += 4;
    oldloc -= 4;
  }
  return newsprite;
}

// Because of how often it's used by the regular draw functions
// Not a fan of this lack of control over pattern source coordinates...
function drawPatternOnCanvas(context, source, leftc, topc, unitwidth, unitheight) {
  context.translate(leftc, topc);
  context.fillStyle = context.createPattern(source, "repeat");
  context.fillRect(0, 0, unitwidth, unitheight);
  context.translate(-leftc, -topc);
}

// Forces each thing to redraw itself
function clearAllSprites(clearcache) {
  var arrs = [window.solids, window.characters, window.scenery],
      arr, i;
  for(arr in arrs)
    for(i in (arr = arrs[arr]))
      setThingSprite(arr[i]);
  if(clearcache) library.cache = {};
}

// http://www.html5rocks.com/en/tutorials/webgl/typed_arrays/
// http://www.javascripture.com/Uint8ClampedArray
// function memcpyU8(source, destination, readloc, writeloc, length) {
  // if(readloc == null) readloc = 0;
  // if(length == null) length = source.length - readloc;
  // destination.set(source.subarray(readloc || 0, length), writeloc || 0);
// }
function memcpyU8(source, destination, readloc, writeloc, writelength/*, thing*/) {
  if(!source || !destination || readloc < 0 || writeloc < 0 || writelength <= 0) return;
  if(readloc >= source.length || writeloc >= destination.length) {
    // console.log("Alert: memcpyU8 requested out of bounds!");
    // console.log("source, destination, readloc, writeloc, writelength, thing");
    // console.log(arguments);
    return;
  }
  if(readloc == null) readloc = 0;
  if(writeloc == null) writeloc = 0;
  if(writelength == null) writelength = max(0, min(source.length, destination.length));

  var lwritelength = writelength + 0; // Allow JIT integer optimization (Firefox needs this)
  var lwriteloc = writeloc + 0;
  var lreadloc = readloc + 0;
  while(lwritelength--)
  // while(--lwritelength)
    destination[lwriteloc++] = source[lreadloc++];
}

// Somewhat cross-platform way to make a canvas' 2d context not smooth pixels
function canvasDisableSmoothing(canvas, context) {
  context = context || canvas.getContext("2d");
  
  context.webkitImageSmoothingEnabled = false;
  context.mozImageSmoothingEnabled = false;
  context.imageSmoothingEnabled = false;
}