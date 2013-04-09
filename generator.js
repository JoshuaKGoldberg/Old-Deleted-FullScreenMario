// jsperf.com/josh-random-number-generators
// It's only 7 lines, who cares if it's ~393 x slower than Math.random()? lulz
function setSeed() {
  seeder = 1777771 / (seed = (Math.round(Math.random() * 10000000))); // 1777771 is prime
  seedlast = .007;
  getSeed = function() { 
    return seedlast = "0." + String(seeder / seedlast).substring(4).replace('.','');
  }
}

// Section Generators
///////////////////////
// Things must be added in (approximately) sorted order!
// If they aren't, then prethings must be sorted....
// which opens possibility of something being added twice. Not good.
function pushRandomSectionOverworld(xloc) {
  // Initial preparations
  var bwidth = max(randTrue(117),1);
  pushPreFloor(xloc, 0, bwidth);
  window.randcount_powerup = 3;
  
  // If the section is 1 or 2 blocks wide, it may have small scenery
  if(bwidth <= 3) {
    if(randTrue()) {
      switch(randTrue(3)) {
        case 0: if(bwidth > 3) { pushPreScenery("HillSmall", xloc, 0); break; }
        case 1: if(bwidth > 2) { pushPreScenery("Bush1", xloc + max(0, randTrue(bwidth - 2)) * 8, 0); break; }
        case 2: pushPreScenery("PlantLarge", xloc + max(0, randTrue(bwidth - 2)) * 8, 0); break;
        case 3: pushPreScenery("PlantSmall", xloc + max(0, randTrue(bwidth - 2)) * 8, 0); break;
      }
    }
  }
  // Otherwise, create the section by chunks
  else {
    // Don't put too much stuff over the edge
    var maxwidth = bwidth - 2, hadcloud = false;
    // Each chunk is 3 blocks wide
    for(var i=randTrue(2); i<maxwidth; i += 3) {
      if(!randTrue(7)) continue;
      
      // Each chunk either has an obstacle...
      if(!randTrue(2))
        pushRandomObstacle(xloc, i);
      // ...or an enemy, which might have bricks/blocks overhead, along with scenery.
      else {
        map.hadObstacle = false;
        pushRandomChunkEnemy(xloc, i);
        pushRandomGroundScenery(xloc + i * 8, i, bwidth);
      }
      
      if(!hadcloud && randTrue()) {
        pushRandomSkyScenery(xloc + i * 8);
        hadcloud = true;
      } else hadcloud = false;
    }
  }
  
  prepareNextGeneratorStandard(xloc, bwidth, pushRandomSectionOverworld);
}

function startRandomSectionBridge(xloc) {
  pushPreFuncCollider(xloc, zoneEnableCheeps);
  // zoneStartCheeps(xloc);
  var bwidth = 5 + randTrue(4), bheight = 24, mwidth = bwidth - 4;
  map.needs_bridge = true;
  map.treelev = map.treeheight = 0; // to do: remember which is which...
  
  pushPreTree(xloc, 0, bwidth + 1);
  
  pushPreThing(GenericStone, xloc + 16, 8, 1, 1);
  pushPreThing(GenericStone, xloc + 24, 16, 1, 2);
  pushPreThing(GenericStone, xloc + 32, bheight, mwidth, bheight / 8);
  pushRandomSectionBridge(xloc + (bwidth - 1) * 8, bheight, true);
  
  spawnMap();
}

function pushRandomSectionBridge(xloc, bheight, nofirstcol) {
  var bwidth, next_no_unusuals = false;
  bheight = bheight || 24 + randTrue() * 16 - 8;
  
  // Bridges: long, short, etc.
  if(randTrue() || map.needs_bridge) {
    switch(randTrue(3)) {
      // Unusual bridge
      case 0:
        // switch(randTrue()) {
        switch(randTrue()) {
          // 1-4 shorter platforms
          case 0:
            var pnum = randTrue(3) + 1,
            bwidth = pnum * 4;
            next_no_unusuals = true;
            for(var i = 1; i <= pnum * 2; i += 2)
              pushPreBridge(xloc + (i) * 16, bheight, 3);
          break;
          // A smaller bridge width
          case 1:
            bwidth = randTrue(7) + 7;
            var pDtB = DtB(bheight, 8);
            if(!nofirstcol) pushPreThing(GenericStone, xloc, bheight, 1, pDtB);
            pushPreBridge(xloc + 8, bheight, bwidth - 1);
            pushPreThing(GenericStone, xloc + bwidth * 8, bheight, 1, pDtB);
          break;
        }
      break;
      // Typical bridge: a series of long bridges with stone columns between
      default:
        map.needs_bridge = map.treeheight = 0;
        var sep = 17, sepd2 = 8,
            pDtB = DtB(bheight, 8);
        bwidth = (randTrue(3) + 3) * sep;
        
        for(var i=0; i<bwidth; i += sep) {
          if(i || !nofirstcol) pushPreThing(GenericStone, xloc + i * 8, bheight, 1, pDtB);
          pushPreBridge(xloc + (i + 1) * 8, bheight, sep - 1);
          // Add a creature
          if(randTrue()) {
            pushRandomSmallEnemy(xloc + (i + sepd2) * 8, bheight);
          }
          // Add some coins...
          if(randTrue(2)) {
            var big = randTrue(), coinrowsize = 3 + randTrue(2);
            pushRandomCoinRow(xloc + (i + sepd2) * 8, bheight + 32, coinrowsize);
            pushRandomCoinRow(xloc + (i + sepd2) * 8, bheight + 40, getNextCoinRowSize(coinrowsize));
          }
          // ...or maybe add a Mushroom block
          else {
            pushPreThing(Block, xloc + (i + sepd2) * 8, bheight + jumplev1, Mushroom);
          }
        }
        pushPreThing(GenericStone, xloc + (bwidth) * 8, bheight, 1, pDtB);
      break;
    }
  }
  // Tree
  else {
    bwidth = 10;
    pushPreTree(xloc + 16, randTrue() * 8, bwidth);
  }
  
  prepareNextGeneratorStandard(xloc, bwidth + 2, pushRandomSectionBridge, false, next_no_unusuals);
}

// Meh.
function startRandomSectionCastle(xloc) {
  var cwidth = randTrue(7) + 3;
  
  pushPreFloor(xloc + 32, 24, cwidth);
  pushPreThing(GenericStone, xloc + 32, 88, cwidth, 3);
  
  pushRandomSectionCastle(xloc + 32 + cwidth * 8);
  spawnMap();
}

function pushRandomSectionCastle(xloc) {
  var cwidth;

  switch(randTrue()) {
    // Open space
    // If it's above a small size, give it floating platforms
    // Otherwise, maybe give it a platform generator
    case 0:
      
    break;
    // Traditional tunnel area
    case 1:
      switch(randTrue()) {
        case 0:
          
        break;
        case 1:
          
        break;
      }
    break;
  }
  
  pushPreThing(GenerationStarter, xloc + cwidth * 8, ceilmax + 20, pushRandomSectionCastle);
  spawnMap();
}

function pushRandomCoinRow(xloc, yloc, size) {
  if(!size) return;
  if(size == 3) xloc += 8;
  var pattern;
  if(randTrue(2)) {
    switch(size) {
      case 3: pattern = [1,0,1]; break;
      case 4:
        switch(randTrue()) {
          case 0: pattern = [1,0,0,1]; break;
          case 1: pattern = [0,1,1,0]; break;
        }
      break;
      case 5:
        switch(randTrue()) {
          case 0: pattern = [1,0,1,0,1]; break;
          case 1: pattern = [0,1,0,1,0]; break;
        }
      break;
    }
  }
  else pattern = arrayof(true, size);
  
  for(var i=0; i<size; ++i)
    if(pattern[i])
      pushPreThing(Coin, xloc + i * 8, yloc);
}

function getNextCoinRowSize(prev) {
  switch(prev) {
    case 3: return 5;
    case 5: return 3;
    default: return prev;
  }
}

function pushRandomSectionTrees(xloc) {
  var treewidth, treeheight;
  
  switch(randTrue(7)) {
    case 0:
      // Base tree - far below, with variable trees coming up from below
      treewidth = randTrue(14) + 7;
      treeheight = randTrue(3);
      map.treefunc(xloc, treeheight * 8, treewidth);
      var minwidth, topheight;
      for(var i=randTrue(2); i<treewidth - 2; i += minwidth - 1) {
        if(randTrue(2)) pushRandomSmallEnemy(xloc + i * 8, treeheight * 8);
        if(randTrue(2)) {
          minwidth = 3 + (randTrue(3) ? 0 : randTrue(4));
          topheight = min(9, treeheight + randTrue(7) + 3) * 8;
          map.treefunc(xloc + i * 8, topheight, minwidth);
          if(randTrue()) pushRandomSmallEnemy(xloc + i * 8, topheight * 8);
          i += minwidth - 1;
          pushRandomSmallEnemy(xloc + i * 8, treeheight * 8);
        }
      }
    break;
    case 1:
      // Special things: scales and platform generators
      treewidth = 14;
      treeheight = 7;
      switch(randTrue()) {
        // Scales disabled because they may make it impossible to continue
        // case 1:
          // treewidth = 7 + randTrue(2);
          // var left = 7 + randTrue(7), right = 21 - left;
          // pushPreScale(xloc + 8 + (randTrue() + 3), 64 + randTrue(3) * 8, treewidth + 3, [5 + randTrue(2), left, right]);
          // treeheight = randTrue(4);
          // treewidth += 3 + randTrue(3);
        // break;
        default:
          treewidth = 4 + randTrue(2);
          pushPrePlatformGenerator(xloc + 8 * (randTrue() + 1), treewidth, -1);
          treewidth += randTrue(3) + 3;
        break;
      }
    break;
    default:
      // A typical tree
      treewidth = 4 + randSign() + randTrue();
      treeheight = min(randTrue(2) + 4 + randSign(2), map.treelev + 4);
      var treex = xloc - randTrue() * 8;
      if(treeheight == map.treelev) treeheight += randSign();
      map.treefunc(treex, treeheight * 8, treewidth);
      if(treewidth > 3 || randTrue())
        if(randTrue(3))
          pushRandomSmallEnemy(treex + (randTrue() + 1) * 8, treeheight * 8);
      else if(randTrue(2))
        for(var i=1; i<treewidth - 1; ++i)
          // if(randTrue(3))
            pushPreThing(Coin, treex + 1 + i * 8, (treeheight + 1) * 8 - 1);
    break;
  }
  
  var func;
  if(++map.sincechange > 7 && randTrue() ) {
    func = map.randtype;
    map.sincechange = 0
  }
  else func = pushRandomSectionTrees;
  pushPreThing(GenerationStarter, xloc + (treewidth + randSign()) * 8, ceilmax + 20, func);
  spawnMap();
  map.treelev = treeheight;
}

function pushRandomSmallEnemy(xloc, yloc, canjump) {
  // pushPreThing(Beetle, xloc, yloc + 8.5);
  switch(randTrue(7)) {
    case 1: case 2: case 3:
      pushPreThing(Koopa, xloc, yloc + 12, true, canjump);
    break;
    case 7:
      pushPreThing(Beetle, xloc, yloc + 8.5);
    break;
    default:
      pushPreThing(Goomba, xloc, yloc + 8);
    break;
  }
}

function pushRandomSectionUnderworld(xloc) {
  // Initial preparations
  // var bwidth = max(randTrue(117),1);
  var bwidth = max(randTrue(117),1);
  pushPreFloor(xloc, 0, bwidth);
  window.randcount_powerup = 3;
  
  // If the section is 2 blocks wide, it may have a pipe
  if(bwidth <= 3) {
    if(bwidth == 2)
      (xloc, 0, (randTrue(2) + 2) * 8, true); 
  }
  // Otherwise, create the section by chunks
  else {
    // Don't put too much stuff over the edge
    var maxwidth = bwidth - 2;
    // Each chunk is 3 blocks wide
    for(var i=randTrue(2); i<maxwidth; i += 3) {
      // Tunnel
      if(!randTrue(7)) {
        if(!map.had_tunnel) i += randTrue() + 1;
        var twidth = min(maxwidth - i, 7 + randTrue(3));
        createTunnel(xloc + i * 8, twidth, Brick);
        i += twidth - 3;
        map.had_tunnel = true;
        continue;
      }
      // If there was just a tunnel, make sure not to block it off
      if(map.had_tunnel) {
        map.had_tunnel = false;
        makeCeiling(xloc + i * 8);
        i -= 2;
        continue;
      }
      // Regular section
      // Make sure to have a ceiling
      makeCeiling(xloc + i * 8, 3);
      if(!randTrue(7)) continue;
      
      // Each chunk may either have an obstacle...
      if(randTrue())
        pushRandomObstacle(xloc, i);
      // ...or an enemy, which might have bricks/blocks overhead, along with scenery.
      else pushRandomChunkEnemy(xloc, i);
    }
  }
  
  prepareNextGeneratorStandard(xloc, bwidth, pushRandomSectionUnderworld, true);
}

function pushRandomSectionUnderwater(xloc) {
  // Initial preparations
  // var bwidth = max(randTrue(117),1);
  var bwidth = max(randTrue(117),7);
  bwidth -= bwidth % 3;
  pushPreFloor(xloc, 0, bwidth);
  pushPreScenery("Water", xloc, ceilmax - 21.5, bwidth * 8 / 3, 1)
  pushPreThing(WaterBlock, xloc, ceilmax, bwidth * 8);
  window.randcount_powerup = 3;
  
  // Each chunk is 4 blocks wide, not the normal 3
  for(var i=0; i<bwidth; i += 4) {
    switch(randTrue(21)) {
      case 0: if(i < bwidth -2) { pushRandomObstacle(xloc, i); break; }
      case 1: pushRandomEnemy(xloc, 0, i, true); break;
      default:
        switch(randTrue(7)) {
          case 0:
            // Opening in stone: at least 5 blocks high, out of 11
            var topblock = randTrue() + 2, botblock = randTrue() + 2;
            pushPreThing(GenericStone, xloc + i * 8, botblock * 8, randTrue(3) + 1, botblock); // bottom
            pushPreThing(GenericStone, xloc + i * 8, ceillev, randTrue(3) + 1, topblock); // top
            
          break;
          case 1:
            // Simple stone pattern
            if(randTrue()) pushPreThing(GenericStone, xloc + i * 8, jumplev1, 4);
            if(randTrue()) pushPreThing(GenericStone, xloc + i * 8, jumplev2, 4);
          break;
          case 2:
            // A few coins
            fillPreThing(Coin, xloc + (i + randTrue()) * 8 + 1, (randTrue(8) + 1) * 8 - 1, 3, 1, 8);
          break;
          default:
            if(map.had_coral) {
              map.had_coral = false;
              break;
            }
            map.had_coral = true;
            // Coral sitting on either floor or a jumplev
            // If it's at a jumplev, it has >=1 stones with it
            // var pheight = jumplev1 * (1 + randTrue()), cheight = 3;
            var pwidth = randTrue(3) + 2, pheight = jumplev1 * (1 + randTrue(2)), cheight = 3, cx = xloc + i * 8, cy;
            if(pheight == jumplev1 * 3) {
              var ontop = true;
              pheight -= 8;
            }
            pushPreThing(GenericStone, xloc + i * 8, pheight, pwidth);
            if(!ontop && (randTrue(3) || pwidth <= 3)) cy = pheight + cheight * 8; // above stone
            else cy = pheight - 8; // below stone
            if(randTrue()) pushPreThing(Coral, cx, cy, cheight); // beginning of stone
            if(randTrue() && pwidth > 3 && pheight < 64) pushPreThing(Coral, cx + (pwidth - 1) * 8, cy, cheight); // end of stone
            if(pwidth >= 3) i += (pwidth - 3);
          break;
        }
      break;
    }
    if(map.countCheep > 1) {
      pushPreThing(CheepCheep, xloc + i * 8, randTrue(80) + 8, randTrue());
      map.countCheep = 0;
    }
    if(map.countBlooper > 7) {
      pushPreThing(Blooper, xloc + i * 8, randTrue(80) + 8);
      map.countBlooper = 0;
    }
    if(randTrue(7)) ++map.countCheep;
    if(randTrue(3)) ++map.countBlooper;
  }
  
  if(++map.sincechange < 7) {
    var tonext = prepareNextGeneratorStandard(xloc, bwidth, pushRandomSectionUnderwater, false, true);
    pushPreScenery("Water", xloc + bwidth * 8, ceilmax - 21.5, (tonext + 1) * 8 / 3, 1)
    pushPreThing(WaterBlock, xloc + bwidth * 8, ceilmax, (tonext + 1) * 8);
  }
  else endRandomSectionUnderwater(xloc + bwidth * 8);
}

function endRandomSectionUnderwater(xloc) {
  // 1488 is xloc............1488
  pushPreFloor(xloc, 0, 19);
  pushPreScenery("Water", xloc, ceilmax - 21.5, 10.5 * 8 / 3, 1);
  pushPreThing(WaterBlock, xloc, ceilmax, 10.5 * 15);
  pushPreThing(GenericStone, xloc, 8, 5, 1); // 88
  pushPreThing(GenericStone, xloc + 8, 16, 4, 1); // 96
  pushPreThing(GenericStone, xloc + 16, 24, 3, 1); // 04
  pushPreThing(GenericStone, xloc + 24, 32, 2, 1); // 12
  pushPreThing(GenericStone, xloc + 24, 88, 2, 4); // 12
  pushPreThing(PipeSide, xloc + 32, 48, ["Random", randTrue() ?  "Overworld" : "Underworld", "Up"]); // 20
  pushPreThing(GenericStone, xloc + 40, 88, 14, 11); // 28
  map.scrollblockerok = true;
  pushPreThing(ScrollBlocker, xloc + 56, 80, true);
  spawnMap();
}

function startRandomSectionSky(xloc) {
  pushPreThing(Stone, xloc, 0, 78);
  
  pushPreThing(PlatformTransport, xloc + 88, 24, 6, "cloud");
  pushRandomSectionSky(xloc + 80, 1);
  spawnMap();
}

function pushRandomSectionSky(xloc, num) {
  if(num++ > 7) {
    pushPreThing(LocationShifter, xloc - 128, -32, ["Random", "Overworld", "Down"], [window.innerWidth / unitsized2, 16]);
    fillPreThing(Coin, xloc + 8, 8, 3, 1, 8);
    return spawnMap();
  }
  
  var cwidth = 0;
  // Short section
  if(num % 2) {
    fillPreThing(Coin, xloc + 1, 71, 3, 1, 8);
    cwidth = 32;
  }
  // Long section
  else {
    switch(randTrue(num)) {
      // Two double clouds with 7 coins in between
      case 3:
        pushPreThing(GenericStone, xloc + 8, 48, 1, 2);
        fillPreThing(Coin, xloc + 25, 63, 7, 1, 8);
        pushPreThing(GenericStone, xloc + 88, 48, 1, 2);
        cwidth = 104;
      break;
      // Alternating clouds, with coins on top
      case 4: case 5: case 6:
        pushPreThing(GenericStone, xloc + 8, 56, 2);
        for(var i=0; i<=7; i += 2) {
          pushPreThing(GenericStone, xloc + (i + 5) * 8, 56);
          fillPreThing(Coin, xloc + (i + 5) * 8 + 1, 63, 2, 1, 8);
        }
        cwidth = 104;
      break;
      // Typical stretch of 16 coins followed by a cloud
      default:
        fillPreThing(Coin, xloc + 1, 55 + randTrue() * 8, 16, 1, 8);
        cwidth = 128;
      break;
    }
  }
  pushPreThing(GenerationStarter, xloc + cwidth, ceilmax + 20, pushRandomSectionSky, num);
  spawnMap();
}

function prepareNextGeneratorStandard(xloc, bwidth, func, allow_platforms, no_unusuals) {
  // How the world ends
  var nextdist = 0, nofancy = 0;
  if(!no_unusuals) {
    switch(randTrue(7)) {
      // Spring to the next area
      case 0:
        if(bwidth > 7 && map.underwater && !randTrue(7)) {
          nextdist = randTrue(3) + 7;
          pushPreThing(Springboard, xloc + (bwidth - 1) * 8, 15.5);
        }
        else nofancy = true;
      break;
      // Stairway of stone
      case 1:
        var numpoles = max(1, randTrue(7));
        nextdist = numpoles + randTrue(3);
        pushPreFloor(xloc + bwidth * 8, 0, numpoles);
        for(var j=1; j<=numpoles; ++j) 
          pushPreThing(GenericStone, xloc + (bwidth + j - 1) * 8, j * 8, 1, j);
        // There may be an exit stairway
        if(randTrue()) {
          numpoles = max(1, randTrue(numpoles));
          pushPreFloor(xloc + (bwidth + nextdist + numpoles - 1) * 8, 0, numpoles);
          for(var k=0; k<numpoles; ++k)
            pushPreThing(GenericStone, xloc + (bwidth + nextdist + numpoles + k - 1) * 8, (numpoles - k) * 8, 1, numpoles - k);
          nextdist += numpoles + numpoles - 2;
        }
      break;
      default:
        if(allow_platforms && randTrue()) {
          nextdist = randTrue(1) + 4;
          pushPrePlatformGenerator(xloc + (bwidth + 1.5) * 8, (nextdist - 2) * 2, randSign());
        }
        else nofancy = true;
      break;
    }
  }
  else nextdist = 1;
  if(nofancy || !nextdist || nextdist < 1) nextdist = randTrue(3) + 1;
  if(!no_unusuals && ++map.sincechange > 3) {
    func = getRandomNextSection();
    map.sincechange = 0;
    // pushPreThing(zoneToggler, xloc + bwidth * 8, ceilmax + 40, zoneDisableCheeps);
    pushPreFuncCollider(xloc, zoneDisableCheeps);
    // pushPreThing(zoneToggler, xloc, ceilmax + 40, zoneDisableLakitu);
  }
  pushPreThing(GenerationStarter, xloc + (bwidth + nextdist) * 8, ceilmax + 20, func);
  // console.log(xloc + (bwidth + nextdist) * 8);
  spawnMap();
  return nextdist;
}

function getRandomNextSection() {
  switch(randTrue()) {
    case 0: 
      map.treeheight = 0;
    return pushRandomSectionTrees;
    case 1:
    return startRandomSectionBridge;
  } 
}

function pushRandomChunkEnemy(xloc, i, noRares) {
  pushRandomEnemy(xloc, 0, i, noRares);
  if(randTrue(2)) {
    pushRandomSolidRow(xloc + i * 8, jumplev1, randTrue(2) + 1);
    if(randTrue()) pushRandomEnemy(xloc, jumplev1, i + 1, true);
    if(randTrue()) {
      pushRandomSolidRow(xloc + i * 8, jumplev2, randTrue(2) + 1);
      if(randTrue()) pushRandomEnemy(xloc, jumplev2, i + 1, true);
    }
  }
}

function pushRandomEnemy(xloc, yloc, i, noRares) {
  switch(randTrue(14)) {
    case 0: case 1: fillPreThing(Beetle, xloc + i * 8, yloc + 8.5, randTrue(2), 1, 12); break;
    case 1: 
      if(!noRares) {
        switch(randTrue(4)) {
          case 0:
            pushPreThing(HammerBro, xloc + i * 8, yloc + 12);
            if(randTrue())
              pushPreThing(HammerBro, xloc + i * 8 + 16, yloc + 40);
          break;
          case 1:
            if(map.randname != "Underworld") {
              pushPreThing(Lakitu, xloc + i * 8, yloc + 80, true);
              break;
            }
          case 2:
            pushPreThing(Blooper, xloc + i * 8, yloc + 40);
          break;
        }
        break;
      }
    break;
    default: 
      if(!randTrue(3)) return;
      switch(randTrue(7)) {
        case 1: fillPreThing(Koopa, xloc + i * 8, yloc + 12, randTrue(2), 1, 12, 0, randTrue() || map.onlysmartkoopas); break;
        case 2: fillPreThing(Koopa, xloc + i * 8, yloc + 12, randTrue(2), 1, 12, 0, false, randTrue() || map.onlysmartkoopas); break;
        default: fillPreThing(Goomba, xloc + i * 8, yloc + 8, randTrue(2), 1, 12); break;
      }
    break;
  }
}

function addPipeRandom(xloc, yloc, height) {
  var transport;
  if(height <= 24 || randTrue(2)) transport = false;
  else transport = getRandomTransport();
  pushPrePipe(xloc, yloc, height, true, transport);
}
function getRandomTransport() {
  var nextloc, direction, locpos, loctypes = [["Overworld","Up"], ["Underworld","Down"], ["Underwater","Up"]];
  locpos = randTrue(loctypes.length - 1);
  if(loctypes[locpos][0] == map.randname) locpos = (locpos + randTrue(loctypes.length - 2) + 1) % (loctypes.length);
  nextloc = loctypes[locpos][0];
  direction = loctypes[locpos][1];
  return ["Random", nextloc, direction];
}

function getAfterSkyTransport() {
  switch(randTrue(3)) {
    case 0: return ["Random", "Underworld", "Down"];
    default: return ["Random", "Overworld" + (stringIncludes(body.className, "Night") ? " Night" : ""), "Down"];
  }
}

function pushRandomObstacle(xloc, i) {
  var num = randTrue(3);
  if(num > 1) map.hadPipe = false;
  switch(num) {
    // Adding a Pipe
    case 0: case 1:
      if(i > 1) {
        // The highest possible pipe will be 40 units (5 blocks) high, which is higher than Mario can jump
        // That's why it's only reached if map.hadObstacle = true
        addPipeRandom(xloc + i * 8, 0, (randTrue(2 + (map.hadObstacle == true && map.hadPipe == false && i > 7)) + 2) * 8);
        map.hadObstacle = map.hadPipe = true;
        break;
      }
    // Adding some vertical stones
    case 2:
      var height;
      for(var j=0; j<2; ++j) {
        if(randTrue() || i < 1) continue;
        height = randTrue(2) + 2;
          pushPreThing(Stone, xloc + (i + j) * 8, height * 8, 1, height);
      }
    break;
    // Miscellaneous things
    default:
      var j = randTrue(2);
      switch(randTrue(7)) {
        case 0:
          var height = randTrue(2) + 1;
          pushPreThing(Cannon, xloc + (i + j) * 8, height * 8, height);
          if(height == 1 && randTrue(2) && j != 2) { // durpliact
            var newheight = randTrue() + 2;
            pushPreThing(Cannon, xloc + (i + j) * 8, height * 8 + newheight * 8, newheight);
          }
          map.hadObstacle = true;
        break;
        case 1:
          if(!map.underwater) {
            if(randTrue()) {
              if(!map.underwater && randTrue(2)) pushPreThing(Brick, xloc + i * 8, jumplev1);
              pushPreThing(Block, xloc + (i + 1) * 8, jumplev1, [Mushroom, 1], true);
              if(!map.underwater && randTrue(2)) pushPreThing(Brick, xloc + (i + 2) * 8, jumplev1);
              map.hadObstacle = true;
            }
            break;
          }
        case 2:
          if(!map.underwater) {
            var offx = randTrue();
            if(!offx)
              pushPreThing(Brick, xloc + i * 8, jumplev1, getRandomBrickItem());
            pushPreThing(GenericStone, xloc + (i + offx) * 8, jumplev1, 2);
            addPipeRandom(xloc + (i + offx) * 8, jumplev1, 24 + randTrue() * 8);
            if(offx)
              pushPreThing(Brick, xloc + i * 8, jumplev1, getRandomBrickItem());
            break;
          }
      }
    break;
  }
}

function pushRandomSolidRow(xloc, yloc, len) {
  for(var i=0; i<len; ++i) {
    if(randTrue(2)) pushPreThing(Brick, xloc + i * 8, yloc, getRandomBrickItem(map.randname == "Overworld" && yloc == jumplev2));
    else pushPreThing(Block, xloc + i * 8, yloc, getRandomBlockItem());
  }
}

function getRandomBrickItem(higher) {
  if(higher && !randTrue(14)) return [Vine, ["Random", "Sky", "Vine"]];
  return randTrue(7) ? false : (randTrue(2) ? Coin : Star);
}
function getRandomBlockItem() {
  ++randcount_powerup;
  if(randcount_powerup <= 7) return false;
  return randTrue(7) ? false : Mushroom
}

function pushRandomGroundScenery(xloc, curblock, bwidth) {
  switch(randTrue(7)) {
    case 2: if(bwidth - curblock > 4) { pushPreScenery("Bush3", xloc, 0); break; }
    case 1: if(bwidth - curblock > 2) { pushPreScenery("Bush2", xloc, 0); break; }
    case 0: pushPreScenery("Bush1", xloc, 0); break;
    case 3: if(bwidth - curblock > 4) { pushPreScenery("HillLarge", xloc, 0); break; }
    case 4: pushPreScenery("HillSmall", xloc, 0); break;
    case 5: pushPreScenery("PlantLarge", xloc, 0); break;
    case 6: pushPreScenery("PlantSmall", xloc, 0); break;
    case 7: pushPreScenery("Fence", xloc, 0, randTrue(2)+1); break;
  }
}

function pushRandomSkyScenery(xloc) {
  switch(randTrue(2)) {
    case 0: pushPreScenery("Cloud1", xloc, (randTrue(5) + 5) * 8); break;
    case 1: pushPreScenery("Cloud2", xloc, (randTrue(4) + 6) * 8); break;
    case 2: pushPreScenery("Cloud3", xloc, (randTrue(3) + 7) * 8); break;
  }
}

function addDistanceCounter() {
  counter = document.createElement("div");
  counter.className = "indisplay counter";
  counter.innerText = data.traveledold + " blocks traveled";
  body.appendChild(counter);
  addEventInterval(function(counter) {
    data.traveled = max(0,Math.round((mario.right + screen.left) / unitsizet8) - 3);
    counter.innerText = (data.traveledold + data.traveled) + " blocks traveled";
  }, 3, Infinity, counter);
}
function addSeedDisplay() {
  counter = document.createElement("div");
  counter.className = "indisplay seed";
  counter.innerText = "This map's seed is " + seed;
  body.appendChild(counter);
}

function createTunnel(xloc, width, btype) {
  var top = randTrue(2) + 3, bottom = randTrue(2) + 2, hadenemy = false;
  for(var i=0; i<width; ++i) {
    fillPreThing(btype, xloc + i * 8, 8, 1, bottom, 8, 8);
    if(!randTrue(3) && !hadenemy) pushRandomSmallEnemy(xloc + i * 8, bottom * 8);
    else hadenemy = false;
    fillPreThing(btype, xloc + i * 8, 96 - top * 8, 1, top, 8, 8);
  }
  // fillPreThing(btype, xloc, 8, width, bottom, 8, 8);
  // fillPreThing(btype, xloc, 96 - top * 8, width, top, 8, 8);
}