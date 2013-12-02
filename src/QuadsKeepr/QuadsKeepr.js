/* The actual code!
*/

function QuadsKeepr(settings) {
  "use strict";
  
  /* Member Variables
  */
  var version = "1.0",
      
      // Quadrants, listed as a raw array
      quadrants,
      
      // Quadrants, listed by columns
      columns,
      
      // How many quadrants, rows, and cols
      num_quads,
      num_rows,
      num_cols,
      
      // Sizes of the entire screen
      screen_width,
      screen_height,
      
      // Sizes of each each quadrant
      quad_width,
      quad_height,
      
      // How far off from a quadrant will still count as being in it
      tolerance,
      
      // When to delete a column
      delx,
      
      // How far to the right the spawning column should go
      out_difference,
      
      // The left- and right-most quads (for delx checking)
      leftmost,
      rightmost,
      
      // Names under which external Things should store Quadrant information
      thing_left,
      thing_top,
      thing_right,
      thing_bottom,
      thing_num_quads,
      thing_max_quads,
      thing_quadrants,
      
      // Callbacks for...
      onUpdate,  // when Quadrants are updated
      onCollide; // when two Things touch (not used... yet!)
  
  /* Public gets
  */
  this.getQuadrants = function() { return quadrants; }
  this.getNumQuads = function() { return num_quads; }
  this.getNumRows = function() { return num_rows; }
  this.getNumCols = function() { return num_cols; }
  this.getQuadWidth = function() { return quad_width; }
  this.getQuadHeight = function() { return quad_height; }
  this.getDelX = function() { return delx; }
  this.getOutDifference = function() { return out_difference; }
  
  /* Quadrant creation & initialization
  */

  // Public: resetQuadrants
  var resetQuadrants = this.resetQuadrants = function resetQuadrants() {
    // Clear the member arrays
    quadrants.length = 0;
    columns.length = 0;
    
    // Create the quadrants themselves
    for(var i = 0; i < num_cols; ++i)
      addQuadCol((i - 2) * quad_width);
    
    // Record the leftmost quad
    leftmost = quadrants[0];
  }
  
  // Quadrant Constructor
  function Quadrant(row, left) {
    // Position updating
    this.left   = left;
    this.top    = (row - 1) * quad_height;
    this.right  = this.left + quad_width;
    this.bottom = this.top  + quad_height;
    
    // Keeping track of contained Things
    this.things = [];
    this.numobjects = this.tolx = this.toly = 0;
  }
  
  
  /* Quadrant shuffling
  */
  
  // Public: update
  // Adds new columns to the right, if necessary
  this.updateQuadrants = function(xdiff) {
    xdiff = xdiff || 0;
    out_difference += xdiff;
    // As many times as needed, while the leftmost is out of bounds
    while(leftmost.left <= delx) {
      // Delete the offending columns
      shiftQuadCol();
      // Add a new one instead
      addQuadCol(rightmost.right);
      // If there's a callback for this, run it
      if(onUpdate)
        onUpdate();
    }
  }
  
  // Add a new quadrant column to the right of an x-location
  function addQuadCol(xloc) {
    var column = [];
    
    // Create a num_rows number of quadrants...
    for(var i = 0; i < num_rows; ++i) {
      // (rightmost has to be kept track of anyway)
      rightmost = new Quadrant(i, xloc);
      // Placing each in the column and master list
      column.push(rightmost);
      quadrants.push(rightmost);
    }
    
    // Add the column to the master list of columns
    columns.push(column);
  }
  
  // Deletes the leftmost column of quadrants
  function shiftQuadCol() {
    // Deleting the first column is easy
    columns.shift();
    
    // Deleting the first num_rows quadrants, slightly less so
    for(var i = 0; i < num_rows; ++i)
      quadrants.shift();
    
    // Reset the leftmost quadrant, and the out_difference
    leftmost = quadrants[0];
    out_difference = quad_width;
  }
  
  
  /* Thing manipulations
  */
  
  // Public: determineAllQuadrants
  // Sets the Things (in any number of given arrays) against all Quadrants
  this.determineAllQuadrants = function() {
    var i, len;
    
    // Set each quadrant not to have anything in it
    for(i = 0; i < num_quads; ++i)
      quadrants[i].numthings = 0;
    
    // For each argument, set each of its Things
    for(i = 0, len = arguments.length; i < len; ++i)
      determineThingArrayQuadrants(arguments[i]);
  }
  
  // Calls determineThingQuadrants on every member of an array
  function determineThingArrayQuadrants(things) {
    for(var i = 0, len = things.length; i < len; ++i)
      determineThingQuadrants(things[i]);
  }
  
  // Public: determineThingQuadrants
  // Checks and sets the correct quadrants for a Thing
  var determineThingQuadrants = this.determineThingQuadrants = function(thing) {
    thing[thing_num_quads] = 0;
    // Check each Quadrant for collision
    // (to do: mathematically determine this)
    for(var i = 0; i < num_quads; ++i)
      if(thingInQuadrant(thing, quadrants[i])) {
        setThingInQuadrant(thing, quadrants[i], i);
        if(thing[thing_num_quads] > thing[thing_max_quads])
          return;
      }
  }
  
  // Let a Thing and Quadrant know they're related
  // This assumes the thing already has a [thing_quadrants] array
  function setThingInQuadrant(thing, quadrant, num_quad) {
    // Place the Quadrant in the Thing
    thing[thing_quadrants][thing[thing_num_quads]] = quadrant;
    ++thing[thing_num_quads];
    
    // Place the Thing in the Quadrant
    quadrant.things[quadrant.numthings] = thing;
    ++quadrant.numthings;
  }
  
  // Checks if a Thing is in a Quadrant
  function thingInQuadrant(thing, quadrant) {
    return thing[thing_right] + tolerance >= quadrant.left && thing[thing_left] - tolerance <= quadrant.right
        && thing[thing_bottom] + tolerance >= quadrant.top && thing[thing_top] - tolerance <= quadrant.bottom;
  }
  
  
  /* Resetting
  */
  function reset(settings) {
    quadrants       = [];
    columns         = [];
    
    // These allow for variations in what's given
    num_quads       = settings.num_quads;//       || 4;
    num_rows        = settings.num_rows;//        || 2;
    num_cols        = settings.num_cols;//        || 2;
    // (if num_quads is given)
    if(num_quads) {
      if(num_rows) num_cols = num_quads / num_rows;
      if(num_cols) num_rows = num_quads / num_cols;
    }
    // (if num_quads is not given)
    else {
      if(!num_rows) num_rows = 2;
      if(!num_cols) num_cols = 2;
      num_quads = num_rows * num_cols;
    }
    
    screen_width    = settings.screen_width    || 640;
    screen_height   = settings.screen_height   || 480;
    
    quad_width      = screen_width / (num_cols - 3);
    quad_height     = screen_height / (num_rows - 2);
    
    tolerance       = settings.tolerance       || 0;
    delx            = settings.delx            || quad_width * -2;
    out_difference  = quad_width;
    
    thing_left      = settings.thing_left      || "left";
    thing_right     = settings.thing_right     || "right";
    thing_top       = settings.thing_top       || "top";
    thing_bottom    = settings.thing_bottom    || "bottom";
    thing_num_quads = settings.thing_num_quads || "numquads";
    thing_max_quads = settings.thing_max_quads || "maxquads";
    thing_quadrants = settings.thing_quadrants || "quadrants";
    
    onUpdate        = settings.onUpdate;
    onCollide       = settings.onCollide;
    
    resetQuadrants();
  }
  
  reset(settings || {});
}