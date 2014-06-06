FullScreenMario
===============

### ***This code is outdated, poorly written, and due to be phased out within a year. It is kept here for historical purposes only. A new version is under development.***

*Active development of a version of FullScreenMario that uses JSON for maps and JS objects for Things is located at https://github.com/Diogenesthecynic/FullScreenMario-JSON. Not all functionality has been copied over to that project, and many maps there are missing key features. Once it has completely made up the features from the main branch, it will be merged back into the project here.*

An HTML5 remake of the original Super Mario Brothers - expanded for modern browsing.

------------------------------------------------------------------------------------

## How to Play

Due to a legal complaint from Nintendo, this project is no longer directly available via www.fullscreenmario.com.
However, you may run or host your own copies of the game on your computer, a cloud IDE, or your own server.

### Your Computer (Local)

You may run the game through the helper UI via index.html, or directly via mario.html.
This will run an entirely local copy of the game (note that via index.html, for security reasons, Chrome may not 
allow you to access the game through the Javascript console).

### Your Computer (Virtual Host)

Download and install the <a href='http://www.apachefriends.org/en/xampp.html'>*AMP stack</a> suitable for your operating system.
Place Full Screen Mario's files in a directory somewhere under htdocs, and access it via localhost in your browser.

* For example, htdocs/FSM/index.html will translate to http://localhost/FSM/

Because your browser will allow AJAX requests via a server, delete the "This is an offline copy..." log message
from maps.js, along with all subsequent functions (they will be loaded over-eagerly by the game).

### Cloud IDE

[![IDE](https://codio-public.s3.amazonaws.com/sharing/demo-in-ide.png)](https://codio.com/p/create/?from_github=Diogenesthecynic/FullScreenMario)

* Select `Preview > Project Index`.
* Select `Preview > New Browser Tab`.
* Click `Preview` and then click inside the game area.

### Your Server

Follow the same steps as running on your computer (virtual host). 

## Cheat Codes

Here's a quick set of cheat codes you can use during the game. If you're using this through the helper UI, you'll have to reference everything as a member of 'game' (which is a link to the frame containing FSM).

### Game Powerups

<html>

<table>

  <tr>
    <th>Command</th>
    <th>Result</th>
  </tr>

  <tr>
    <td><code>playerShroom(player)</code></td>
    <td>The equivalent of the player touching a Mushroom or FireFlower item.</td>
  </tr>

  <tr>
    <td><code>playerStar(player)</code></td>
    <td>The equivalent of the player touching a Star item. Note that if you want the player to be invincible for the rest of the current map, use <code>++player.star</code>.</td>
  </tr>

  <tr>
    <td><code>scrollPlayer(X)</code></td>
    <td>Scrolls the window horizontally by X, keeping the player in the same spot relative to the screen.</td>
  </tr>

  <tr>
    <td><code>scrollTime(T)</code></td>
    <td>Floats the player through the rest of the level (beware, this is best used on the Random worlds!).</td>
  </tr>

  <tr>
    <td><code>fastforward(T)</code></td>
    <td>Sets the game speed to <code>1+T</code>. T=1 results in double the speed, and T=0 is normal speed.</td>
  </tr>

</table>

</html>

### Adding Things

<html>

<table>

  <tr>
    <th>Command</th>
    <th>Result</th>
  </tr>

  <tr>
    <td>
      <code>addThing(ThingFunction, xloc, yloc)</code>
      <br>or</br>
      <code>addThing(new Thing(ThingFunction, arg1, arg2), xloc, yloc)</code>
    </td>
    <td>Creates a new instance of a Thing, such as <code>Goomba</code> or <code>Koopa</code>, at the specified location. Thing functions are located as separate in things.js; in the future they will be stored as JSON objects.</td>
  </tr>

  <tr>
    <td><code>killNormal(MyThing)</code></td>
    <td>Kills a specified Thing. You may find them listed under <code>window.characters</code>, <code>window.solids</code>, and <code>window.scenery</code>.</td>
  </tr>

</table>

</html>

### Map Shifting

<html>

<table>

<tr>
  <th>Command</th>
  <th>Result</th>
</tr>

<tr>
  <td>
    <code>setMap(A,B)</code>
    <br>or</br>
    <code>setMap([A,B])</code>
  </td>
  <td>Starts the World A-B map immediately. If it doesn't exist (such as when maps aren't loaded via AJAX yet), it will log a complaint gracefully.</td>
</tr>

<tr>
  <td>
    <code>setMapRandom()</code>
    <br>or</br>
    <code>setMapRandom("Overworld")</code>
  </td>
  <td>Starts the corresponding random map immediately, similar to setMap. Named options are (Overworld by default):
    <ul>
      <li>Overworld</li>
      <li>Underworld</li>
      <li>Underwater</li>
      <li>Sky</li>
      <li>Castle</li>
    </ul>
  </td>
</tr>

<tr>
  <td>
    <code>shiftToLocation(N)</td>
  </td>
  <td>
    Shifts to the Nth location in the current map. For example, <code>setMap(1,1); shiftToLocation(2);</code> brings the user to the Underworld section of World 1-1. Note that maps are stored under Maps/WorldAB.js as function bodies.
  </td>
</tr>

</table>

</html>
  
## Level Editor

<html>

<table>

<tr>
  <td>
    <code>loadEditor()</code>
  </td>
  <td>
    Starts the in-game level editor.
  </td>
</tr>

</table>
  
</html>

## Developers & Legal

This is released under the <a href="http://creativecommons.org/licenses/by-nc-sa/3.0/">Attribution Non-Commercial Share-Alike</a> license. Full Screen Mario is meant to be both a proof of concept and an entertaining pasttime, not a source of income</a>.

The whole project was originally hosted under www.fullscreenmario.com, but that site was taken down by Nintendo for copyright infringement.
