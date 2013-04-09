/* How JSList quadrants work:

Each quadrant keeps a list of the elements inside of it.
Each element keeps a list of the quadrants it's in.
Each element keeps a list of all the nodes pointing to it (these are in the quad lists)

Each list has a head node, which contains the information about the list.

Whenever an element rechecks which quads it's in:
* Each node pointing to it is now .false
* It checks all quadrants. For each one it's in:
** It adds a node to the quadrant's list
*** This adds a node to its own node list
** It adds a node to its list of quadrants

When a quadrant looks through its list of elements, starting with the head node:
* If the next element is .false, the current element's .next is that one's .next

Possible addition: make quadrants also use a JSList, for shifting / popping new ones

*/

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
    for(var i=quads.rows-1; i>0; --i) {
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
  if(quads.visible) shiftAll(quads, 0, 0, true);
  quads.rightdiff += xdiff;
  if(quads.leftmost.left <= quads.delx) {
    addQuadCol(quads.rightmost.right);
    shiftQuadCol();
    spawnMap();
    if(quads.visible) {
      hideQuads();
      showQuads();
    }
  }
}

function showQuads() {
  quads.visible = true;
  var quad, style;
  for(var i=0; i<quads.length; ++i) {
    quad = quads[i];
    if(quad.element) continue;
    var k = quad.element = document.createElement('div');
    quad.style = style = quad.element.style;
    k.className = "quad";
    k.style.marginLeft = quads[i].left + "px";
    k.style.marginTop = quads[i].top + "px";
    k.style.width = quads.width + "px";
    k.style.height = quads.height + "px";
    document.body.appendChild(k);
  }
}
function hideQuads() {
  quads.visible = false;
  for(var i=0; i<quads.length; ++i)
    if(quads[i].element) {
      body.removeChild(quads[i].element);
      quads[i].element = quads[i].style = false;
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