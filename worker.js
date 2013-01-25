var name, ajax, links;

self.addEventListener('message', function(e) {
  name = e.data; 
  loadAjax();
}, false);

function loadAjax() {
  ajax = new XMLHttpRequest();
  ajax.open("GET", name, true);
  ajax.send();
  ajax.onreadystatechange = function() {
    if(ajax.readyState != 4 || ajax.status != 200) return;
    links = parseListing(ajax.responseText);
    preload(0);
  }
}

// Takes a directory listing in string format and returns an array of the body's links
function parseListing(listing) {
  var result = listing.split("Parent Directory</a>")[1];
  // Regular expression to get an array of [="......."]
  regexp = /=[\'"]?([^\'" >]+)/gi;
  result = result.match(regexp);
  // Chops out the =,",' from each element.
  // To do: get the regexp to do this itself...?
  for(var i=0; i<result.length; ++i)
    result[i] = result[i].replace(/[="']/gi,"");
  return result;
}

// For i in links[i], ajax a request of that file
function preload(i) {
  if(i >= links.length) return;
  
  ajax.open("GET", name + "/" + links[i], true);
  ajax.send();
  ajax.onreadystatechange = function() {
    if(ajax.readyState != 4 || ajax.status != 200) return;
    preload(i+1);
  }
}