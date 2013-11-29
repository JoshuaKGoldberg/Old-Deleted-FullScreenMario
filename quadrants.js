// Quads has 7 cols and 6 rows
function resetQuadrants() {
  window.quads = [];
  quads.rows = 5;
  quads.cols = 6;
  setQuadDimensions();
  createQuads();
}

function Quadrant(row, left) {
  this.left = left;
  this.top = (row-1) * quads.height;
  this.right = this.left + quads.width;
  this.bottom = this.top + quads.height;
  
  this.things = []
  this.numobjects = this.tolx = this.toly = 0;
}

// Quads has 7 cols and 6 rows
function createQuadrants() {
  quads = [];
  quads.rows = 5;
  quads.cols = 6;
  setQuadDimensions();
  createQuads();
}

function setQuadDimensions() {
  quads.width = quads.rightdiff = Math.round(window.innerWidth / (quads.cols - 3));
  quads.height = Math.round(window.innerHeight / (quads.rows - 2));
  
  quads.delx = quads.width * -2;
}

function createQuads() {
  for(var i=0; i<quads.cols; ++i)
    addQuadCol((i-2) * quads.width);
  quads.leftmost = quads[0];
}

// Recentx is the .left of the most recently added stuff
function addQuadCol(left) {
  for(var i=0; i<quads.rows; ++i)
    quads.push(new Quadrant(i, left));
  quads.rightmost = quads[quads.length - 1];
}

function shiftQuadCol() {
  var old = [];
  if(!map.nodeletequads) {
    for(var i=quads.rows-1; i>=0; --i) {
      old.push(deleteQuad(quads.shift()));
    }
  }
  quads.leftmost = quads[0];
  quads.rightdiff = quads.width;
}

function deleteQuad(quad) {
  if(quad.element) document.body.removeChild(quad.element);
  return quad;
}
function updateQuads(xdiff) {
  quads.rightdiff += xdiff || 0;
  // if(quads.leftmost.left <= quads.delx) {
  while(quads.leftmost.left <= quads.delx) {
    addQuadCol(quads.rightmost.right);
    shiftQuadCol();
    spawnMap();
  }
}

function determineAllQuadrants() {
  for(var i=0; i<quads.length; ++i)
    quads[i].numthings = 0;
  
  for(var j=0; j<solids.length; ++j)
    if(solids[j].moved != false)
      determineThingQuadrants(solids[j]);
  
  // for(var k=0; k<characters.length; ++k)
    // determineThingQuadrants(characters[k]);
}

function determineThingQuadrants(me) {
  me.numquads = 0;
  for(var i = 0, len = quads.length; i < len; ++i) {
    if(objectInQuadrant(me, quads[i])) {
      setThingInQuadrant(me, quads[i]);
      if(me.numquads > me.maxquads) break;
    }
  }
}

function setThingInQuadrant(me, quad) {
  me.quads[me.numquads] = quad;
  quad.things[quad.numthings] = me;
  ++me.numquads;
  ++quad.numthings;
}