TimeHandlr.js
==============

A timed events library derived from Full Screen Mario. It keeps a listing of functions to execute at certain timeouts and intervals, separate from Javascript's native methods.
This has two primary applications:
<ol>
<li>Provide a flexible alternative to setTimeout and setInterval that respects pauses and resumes in time (such as from game pauses)</li>
<li>Provide functions to automatically 'cycle' between certain classes on an object</li>
</ol>

------------------------------------------------------------------------------------

Essential Functions
-------------------

<table>
  
  <tr>
    <th>Code</th>
    <th>Output</th>
  </tr>
  
  <tr>
    <td>
      <code>
        window.MyEventHandler = new EventHandlr();</code><br /><code>
        MyEventHandler.addEvent(function() { console.log("It's starting!"); });</code><br /><code>
        MyEventHandler.addEvent(function() { console.log("It has ended.."); }, 49);</code><br /><code>
        MyEventHandler.addEvent(function() { console.log("This won't be reached!"); }, 96);</code><br /><code>
        MyEventHandler.addEventInterval(function() { console.log("Running..."); }, 7, 6);</code><br /><code>
        for(var i = 0; i < 70; ++i)</code><br /><code>
          MyEventHandler.handleEvents();
      </code>
    </td>
    <td>
      <code>
        It's starting!</code><br /><code>
        Running...</code><br /><code>
        Running...</code><br /><code>
        Running...</code><br /><code>
        Running...</code><br /><code>
        Running...</code><br /><code>
        Running...</code><br /><code>
        It has ended..</code><br /><code>
      </code>
    </td>
  </tr>
  
</table>

<table>

  <tr>
    <th>Command</th>
    <th>Result</th>
  </tr>
  
  <tr>
    <td><h3>new EventHandlr</h3>
      <code><strong>new EventHandlr</strong>();</code>
      <p>(or)</p>
      <code>
        window.MyEventHandler = <strong>new EventHandlr</strong>({</code><br /><code>
          onSpriteCycleStart: "onadding",</code><br /><code>
          doSpriteCycleStart: "placed",</code><br /><code>
          cycleCheckValidity: "alive",</code><br /><code>
          timingDefault: 9</code><br /><code>
        });
      </code>
    </td>
    <td>
      Creates a new EventHandlr object with the given settings. The following attributes (with defaults in parenthesis) may be passed in:
      <ul>
        <li>Default timing
          <ul>
            <li><code>time</code> (0): What time the game starts at. Only useful if <code>events</code> is also passed in.</li>
            <li><code>events</code> ({}): A pre-existing list of events to be run.
            <li><code>timingDefault</code> (7): The default amount of ticks between cycleClass cycles.</li>
          </ul>
        </li>
        <li>Names of attributes used by cycleClass functions
          <ul>
            <li><code>cycles</code> ("cycle"): What to store an object's cycles under, such as me.cycles.</li>
            <li><code>className</code> ("className"): The actual class name string to be manipulated.</li>
            <li><code>onSpriteCycleStart</code> ("onSpriteCycleStart"): The attribute under which the function to start a cycle is stored.</li>
            <li><code>doSpriteCycleStart</code> ("doSpriteCycleStart"): The boolean attribute to check whether an object should immediately start a cycle.</li>
            <li><code>cycleCheckValidity</code> (null): The (optional) boolean attribute to determine if an object should no longer have a cycle.</li>
          </ul>
        </li>
        <li>Special functions for manipulating classes
          <ul>
            <li><code>addClass</code>: Normally just adds a class to className.</li>
            <li><code>removeClass</code>: Normally just uses a quick regular expression to remove a class from className.</li>
          </ul>
        </li>
      </ul>
    </td>
  </tr>
  
  <tr>
    <td><h3>handleEvents</h3>
      <code><strong>handleEvents</strong>)</code>
    </td>
    <td>
      <p>Increments the game count by one tick, and runs every event scheduled for the new time.</p>
      <code>
        MyEventHandler.addEvent(function() { console.log("Hi!"); });</code><br /><code>
        MyEventHandler.handleEvents();</code><br /><code>
        // Console logs: "Hi!"
      </code>
    </td>
  </tr>
  
  <tr>
    <td><h3>addEvent</h3>
      <code><strong>addEvent</strong>(function,</code><br /><code>
                                      time_delay=1</code><br /><code>
                                      [, arguments...]);</code>
    </td>
    <td>
      <p>Will run the <code>function</code> in <code>time_delay</code> ticks, passing any given arguments. This is equivalent to <code>setTimeout(function)</code>.</p>
      <code>
        MyEventHandler.addEvent(
          function(name) {</code><br /><code>
            console.log("I, " + name + ", will show in seven ticks!"); },</code><br /><code>
            7, "Robert"</code><br /><code>
        );
      </code>
    </td>
  </tr>
  
  <tr>
    <td><h3>addEventInterval</h3>
      <code><strong>addEventInterval</strong>(function,</code><br /><code>
                                              time_delay=1,</code><br /><code>
                                              num_repeats</code><br /><code>
                                              [, arguments...]);</code>
    </td>
    <td>
      <p>Will run the <code>function</code> in <code>time_delay</code> ticks a <code>num_repeats</code> number of times, passing any given arguments. <code>num_repeats</code> may be a function to evaluate or a typical number. This is equivalent to <code>setInterval(function)</code>.</p>
      <code>
        MyEventHandler.addEventInterval(function(name) { console.log("I, " + name + ", will show every seven ticks, fourteen times!"); }, 7, 14, "Blake");
      </code>
    </td>
  </tr>
  
  <tr>
    <td><h3>clearEvent</h3>
      <code><strong>clearEvent</strong>(event);</code>
    </td>
    <td>
      <p>Stops a given event from executing ever again.</p>
      <code>
        var event = MyEventHandler.addEvent(function() { console.log("This never shows!"); });</code><br /><code>
        MyEventHandler.clearEvent(event);
      </code>
    </td>
  </tr>
  
  <tr>
    <td><h3>clearAllEvents</h3>
      <code><strong>clearAllEvents</strong>();</code>
    </td>
    <td>
      <p>Completely erases all events from the scheduler.</p>
      <code>
        var event = MyEventHandler.addEvent(function() { console.log("This never shows!"); });</code><br /><code>
        var event = MyEventHandler.addEventInterval(function() { console.log("This neither!"); }, 7, Infinity);</code><br /><code>
        MyEventHandler.clearAllEvents();
      </code>
    </td>
  </tr>
</table>


Class Cycling
-------------------

<table>
  
  <tr>
    <th>Code</th>
    <th>Output</th>
  </tr>
  
  <tr>
    <td>
      <code>
      window.MyEventHandler = new EventHandlr();</code><br /><code>
      var me = { className: "myclass", doSpriteCycleStart: true};</code><br /><code>
      var log = function log = console.log.bind(console);</code><br /><code>
      MyEventHandler.addSpriteCycle(me, ["one", "two", "three"]);</code><br /><code>
      MyEventHandler.addEventInterval(log, 7, Infinity, me);</code><br /><code>
      log(me.className, "(starting)");</code><br /><code>
      for(var i = 0; i < 49; ++i)</code><br /><code>
        MyEventHandler.handleEvents();
      </code>
    </td>
    <td>
      <code>
        myclass one (starting)</code><br /><code>
        myclass two</code><br /><code>
        myclass three</code><br /><code>
        myclass one</code><br /><code>
        myclass two</code><br /><code>
        myclass three</code><br /><code>
        myclass one</code><br /><code>
        myclass two
      </code>
    </td>
  </tr>

</table>

<table>
  
  <tr>
    <th>Command</th>
    <th>Output</th>
  </tr>
  
  <tr>
    <td><h3>addSpriteCycle</h3>
      <code><strong>addSpriteCycle</strong>(me, classnames[, cyclename[, cycletime]])</code>
    <td>
      <p>Initializes a cycle of <code>.className</code>s for an object. The object will continuously cycle through them until <code>clearAllCycles</code> or <code>clearClassCycle</code> are called.</p>
      <code>
        var me = { className: "myclass", doSpriteCycleStart: true};</code><br /><code>
        MyEventHandler.addSpriteCycle(me, ["one", "two", "three"]);
      </code>
    </td>
  </tr>
  
  <tr>
    <td><h3>addSpriteCycleSynched</h3>
      <code><strong>addSpriteCycleSynched</strong>(me, classnames[, cyclename[, cycletime]])</code>
    </td>
    <td>
      <p>Waits to call <code>addSpriteCycle</code> until it's synchronized with time (using modular arithmetic). Calling multiple of these at different times will result in the events being in sync.</p>
      <code>
        var me = { className: "myclass", doSpriteCycleStart: true};</code><br /><code>
        MyEventHandler.addSpriteCycleSynched(me, ["one", "two", "three"]);
      </code>
    </td>
  </tr>
