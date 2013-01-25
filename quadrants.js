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
  
  this.things = new JSList();
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
  for(var i=0; i<quads.rows; ++i)
    old.push(deleteQuad(quads.shift()));
  quads.leftmost = quads[0];
  quads.rightdiff = quads.width;
}

function deleteQuad(quad) {
  // if(quad.element) document.body.removeChild(quad.element);
}
function updateQuads(xdiff) {
  if(quads.leftmost.left > quads.delx) return false;
  addQuadCol(quads.rightmost.right);
  shiftQuadCol();
  spawnMap();
  quads.rightdiff += xdiff;
  return true;
}

function showQuads() {
  for(var i=0; i<quads.length; ++i) {
    var k = quads[i].element = document.createElement('div');
    k.className = "quad";
    k.style.marginLeft = quads[i].left + "px";
    k.style.marginTop = quads[i].top + "px";
    k.style.width = quads.width + "px";
    k.style.height = quads.height + "px";
    document.body.appendChild(k);
  }
}

function determineAllQuadrants() {
  for(var i=0; i<quads.length; ++i)
    refreshQuadList(quads[i]);
  
  for(var j=0; j<solids.length; ++j)
    if(solids[j].moved != false)
      determineThingQuadrants(solids[j]);
  
  // for(var k=0; k<characters.length; ++k)
    // determineThingQuadrants(characters[k]);
}

function determineThingQuadrants(me) {
  while(me.mynodes.next) {
    me.mynodes = me.mynodes.next;
    me.mynodes.nope = true;
  }
  me.mynodes = new JSList();
  me.quads = new JSList();
  
  me.numquads = 0;
  for(var i=0; i<quads.length; ++i) {
    if(objectsTouch(me, quads[i])) {
      setThingInQuadrant(me, quads[i]);
      if(me.numquads > me.maxquads) break;
    }
  }
}

function setThingInQuadrant(me, quad) {
  me.quads.addNode(quad);
  me.mynodes.addNode(quad.things.addNode(me));
  ++me.numquads;
}

function refreshQuadList(quad) {
  var curnode = quad.things;
  var i=0;
  
  while(curnode.next) {
    if(curnode.next.nope) {
      if(curnode.next.next) curnode.next = curnode.next.next;
      else curnode.next = false;
    } else curnode.next = false;
  }
  
  quad.things.last = curnode;
}