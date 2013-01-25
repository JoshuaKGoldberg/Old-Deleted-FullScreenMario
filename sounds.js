// Main is whether it should override the main background music
// Override is...
//// ...Main = true: whether main loops
//// ...Main = false: whether the main music pauses
function play(name, main, override) {
  return false;
  var div = new Audio("Sounds/" + name);  
  div.name = name;
  if(main) {
    if(sounds[0]) {
      if(sounds[0].name == name) return;
      document.body.removeChild(sounds[0]);
    }
    sounds[0] = div;
    div.loop = override;
  } else {
    div.addEventListener("canplaythrough", function() {
      setTimeout(function() {
        document.body.removeChild(div);
        sounds.splice(sounds.indexOf(div), 1);
      }, div.duration * 1000);
    });
    sounds.push(div);
    if(override && sounds[0]) {
      sounds[0].pause();
    }
  }
  
  // div.setAttribute("src", "Sounds/" + name);
  document.body.appendChild(div);
  div.volume = muted ? 0 : 1;
  div.play();
  return div;
}