map.locs = [
  new Location(0, true),
  new Location(0, exitPipeVert),
  new Location(1)
];
map.areas = [
  new Area("Overworld", function() {
    setLocationGeneration(0);
    
    pushPreCastle(0, 0, true);
    pushPrePattern("backreg", 0, 0, 5);
    pushPreFloor(0, 0, 32);
    pushPrePipe(168, 0, 24, true);
    pushPreThing(Block, 200, jumplev1, Mushroom);
    pushPreThing(Block, 200, jumplev2);
    pushPreThing(Lakitu, 212, 84);
    
    pushPreFloor(272, 0, 44);
    fillPreThing(Coin, 329, 31, 2, 1, 24);
    fillPreThing(Coin, 337, 39, 2, 1, 8);
    fillPreThing(Block, 512, jumplev1, 2, 2, 16, 32);
    
    pushPreFloor(656, 0, 67);
    fillPreThing(Block, 720, jumplev1, 4, 1, 8);
    pushPreThing(Block, 736, jumplev2, [Mushroom, 1], true);
    pushPreThing(Stone, 824, 24, 1, 3);
    fillPreThing(Coin, 841, 55, 4, 1, 8);
    pushPrePipe(928, 0, 32, true);
    fillPreThing(Coin, 953, 55, 4, 1, 8);
    pushPrePipe(1056, 0, 32, true, 2);
    fillPreThing(Coin, 1081, 55, 4, 1, 8);
    fillPreThing(Block, 1168, jumplev1, 2, 1, 8);
    pushPreThing(Block, 1184, jumplev1, Mushroom);
    fillPreThing(Block, 1184, jumplev2, 4, 1, 8);
    fillPreThing(Brick, 1192, jumplev1, 2, 1, 8);
    fillPreThing(Block, 1208, jumplev1, 3, 1, 8);
    
    pushPreFloor(1208, 0, 23);
    pushPrePipe(1304, 0, 16, true, false, 1);
    
    pushPreFloor(1416, 0, 3);
    pushPreFloor(1456, 0, 8);
    pushPreThing(Stone, 1512, 24, 1, 3);
    
    pushPreFloor(1536, 0, 48);
    pushPreFuncCollider(1664, zoneDisableLakitu); // not sure if accurate
    pushPreThing(Stone, 1664, 8);
    pushPreThing(Stone, 1672, 16, 1, 2);
    pushPreThing(Stone, 1680, 24, 1, 3);
    pushPreThing(Stone, 1688, 32, 1, 4);
    pushPreThing(Stone, 1696, 40, 1, 5);
    pushPreThing(Stone, 1704, 48, 1, 6);
    pushPreThing(Stone, 1712, 56, 1, 7);
    pushPreThing(Stone, 1720, 64, 2, 8);
    pushPreThing(Brick, 1760, jumplev1, Coin);
    endCastleOutside(1796);
  }),
  new Area("Underworld", function() {
    setLocationGeneration(2);
    
    makeCeiling(32, 11);
    pushPreFloor(0, 0, 17);
    fillPreThing(Brick, 0, 8, 1, 11, 8, 8);
    fillPreThing(Brick, 24, 16, 1, 3, 8, 8);
    fillPreThing(Coin, 25, 39, 8, 1, 8);
    fillPreThing(Coin, 25, 7, 10, 1, 8);
    fillPreThing(Brick, 32, 32, 6, 1, 8);
    fillPreThing(Brick, 80, 16, 1, 3, 8, 8);
    pushPreThing(PipeSide, 104, 16, 1);
    pushPreThing(Brick, 104, 32, Mushroom);
    pushPreThing(PipeVertical, 120, 88, 88);
  })
];