AudioPlayr.js
==============

An audio library derived from Full Screen Mario
This library preloads and provides functions to play a set of sounds

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
        window.MyAudioPlayer = new AudioPlayr({</code><br /><code>
          directory: "Sounds",</code><br /><code>
          library: {</code><br /><code>
            Sounds: [</code><br /><code>
              "MySound",</code><br /><code>
              "MyOtherSound"</code><br /><code>
            ],</code><br /><code>
            Themes: [ "MyThemeSong" ]</code><br /><code>
          }</code><br /><code>
        });</code><br /><code>
      </code>
    </td>
    <td>
      <em>Creates a new instance of the audio player that looks for audio files that will load "MySound" and "MyOtherSound" from the "Sounds" directory, and "MyThemeSong" from the Themes directory.</em>
      <br />
      <em>By default, the checked extensions are '.mp3' and '.ogg', so they will be looked for in "Sounds/mp3/*.mp3" and "Sounds/ogg/*.mp3" (and "Themes/...").</em>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        MyAudioPlayer.play("MySound");
      </code>
    </td>
    <td>
      <em>"MySound.mp3" or "MySound.ogg" will be played once.</em>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        MyAudioPlayer.playTheme("MyThemeSong");
      </code>
    </td>
    <td>
      <em>"MyThemeSong.mp3" or "MyThemeSong.ogg" will be played on a loop.</em>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        MyAudioPlayer.pause();</code><br /><code>
        MyAudioPlayer.resume();
      </code>
    </td>
    <td>
      <em>Pauses all the sounds, then immediately resumes playing theme.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        MyAudioPlayer.pauseTheme();</code><br /><code>
        MyAudioPlayer.resumeTheme();
      </code>
    </td>
    <td>
      <em>Pauses the current theme song, then immediately resumes playing it.</em>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        MyAudioPlayer.toggleMute();
      </code>
    </td>
    <td>
      <em>Mutes or unmutes all the current sounds. If localStorageMuted is specified, it will save that value to <code>localStorage[localStorageMuted]</code>.</em>
    </td>
  </tr>
</table>