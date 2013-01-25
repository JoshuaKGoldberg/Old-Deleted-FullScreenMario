// I made this. STL, you are missed :(

function JSListNode(contents) {
  this.next = false;
  this.contents = contents;
}

function JSList() {
  this.next = this.length = this.last = false;

  this.addNode = function addNode(contents) {
    var newnode = new JSListNode(contents);
    if(!this.last) this.next = this.last = newnode;
    else {
      // To do: see which order of combining the rows works.. just in case.
      this.last.next = newnode;
      this.last = this.last.next;
    }
    ++this.length;
    return newnode;
  };

  // Assume this.last != false
  this.insertContentsAfter = function insertContentsAfter(contents, oldnode) {
    return this.insertNodeAfter(new JSListNode(contents), oldnode);
  };
  this.insertNodeAfter = function insertNodeAfter(newnode, oldnode) {
    if(oldnode.next) newnode.next = oldnode.next;
    oldnode.next = newnode;
    ++this.length;
    return newnode;
  };

  // To do: make make it take in sortfunc as an imput, not use .count!
  // Seriously, get this to work. Shouldn't be that hard.
  this.insertSorted = function insertSorted(contents) {
    var newnode = new JSListNode(contents), next = this.next, prev = this;
    
    // If there is indeed a next, skip until the right slot is found.
    if(next) {
      while(next && next.contents.count < newnode.contents.count) {
        prev = next;
        next = next.next;
      }
    } 
    this.insertNodeAfter(newnode, prev);
    return newnode;
  };
  
  // Assumes the garbage collector does the deletion. Ugh.
  this.unshift = function unshiftNode() {
    if(this.next == this.last || !this.next)
      return this.next = false;
    else {
      var old = this.next;
      this.next = this.next.next;
      return old; // JS will return the old node. Phew.
    }
  };
}

// Events! Fancy function parameters!
// Adds in an event: insertion has to be O(n) search, unfortunately
// Parameters are given as:
//// addEvent(
////   function(name, of, arguments) {
////     /* stuff */
////   },
////   timeout,
////   arg1, arg2, arg3
//// );
// Arguments are saved as an array, then passed in using the apply() function in handleEvents
// Duplicates functionality of setTimeout, but within the game timer
function addEvent(func, count) {
  if(!(func instanceof Function)) return false;
  count = count || 1;
  
  // Get the first two arguments out of there, as they're stored in func & count
  var args = [].splice.call(arguments, 0);
  args.splice(0, 2);
  
  // Create the event, insert it into events, then return it.
  contents = {
    func: func,
    count: gamecount + count,
    args: args,
    timeout: count,
    repeat: false
  };
  events.insertSorted(contents);
  return contents;
}

function addEventInterval(func, count, rep) {
  if(!(func instanceof Function)) return false;
  count = count || 1;
  
  args = [].splice.call(arguments, 0);
  // Rep is an extra parameter, so chop the first 3 instead of 2
  args.splice(0, 3);
  
  contents = {
    func: func,
    count: gamecount + count,
    args: args,
    timeout: count,
    repeat: rep
  };
  
  events.insertSorted(contents);
  return contents;
}

// Checks the first (soonest) event's execution time (count) against current gamecount
// While the most recent event is at exec time, it's run, then unshifted from the list
function handleEvents() {
  ++gamecount;
  var event = events.next, contents, me;
  while(event && event.contents.count <= gamecount) {
    events.unshift();
    var contents = event.contents;
    // Call the function - apply is used to pass in the arguments dynamically
    contents.func.apply(undefined, contents.args);
    // If the event is a repeater, run it again (if repeat = 0, it's done)
    //// If the event's repeat < 0, it's infinite, and you can tell how many times it's run by rep * -1 - 1
    if(contents.repeat) {
      // If rep is a function, run that function (given the args as input), and repeat if it returns true
      if(contents.repeat instanceof Function) {
        repfunc = contents.repeat.bind(contents);
        if(repfunc()) {
          contents.count += contents.timeout;
          events.insertSorted(contents);
        }
      }
      // Otherwise it's a number - decrement it and repeat.
      else {
        --contents.repeat;
        contents.count += contents.timeout;
        events.insertSorted(contents);
      }
    }
    event = event.next;
  }
  nextevent = events.next;
}