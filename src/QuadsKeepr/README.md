QuadsKeepr.js
==============

A grid-based collision detection library derived from Full Screen Mario. It keeps a listing of 'quadrants' (grid cells) and stores which Things are in them.

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
        window.MyQuadsKeeper = new QuadsKeepr({</code><br /><code>
          num_rows: 5,</code><br /><code>
          num_cols: 6
        });
      </code>
    </td>
    <td>
      <em>Creates a new instance of the quadrants keeper with 6 rows and 7 columns (each has 1 on each side for padding).
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        my_solids = [...];</code><br /><code>
        my_characters = [...];</code><br /><code>
        MyQuadsKeeper.determineAllQuadrants(my_solids, my_characters);
      </code>
    </td>
    <td>
      <em>Assuming <code>my_solids</code> and <code>my_characters</code> are both arrays of Things, the quadrants keeper will determine what Things go in which quadrants.</em>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        MyQuadsKeeper.updateQuadrants(1.17);
      </code>
    </td>
    <td>
      <em>If the quadrants have been shifted by an outside source, if the leftmost column is too far to the left, this will continuously delete that leftmost column and create a new one in its place.</em>
      <br />
      <em>Column validity is determined by whether the column's right border is past delx (which is <code>-1 * quad_width</code>).</em>
      <br />
      <em><code>quad_width = (screen_width / (num_cols - 3))</code>.</em>
    </td>
  </tr>
  
</table>