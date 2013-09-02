map.time = 300;
map.locs = [
  new Location(0, startCastle)
];
map.areas = [
  new Area("Castle", function() {
    setLocationGeneration(0);
    
    startCastleInside();
    
    makeCeilingCastle(40, 19, 3);
    pushPreFloor(40, 24, 8);
    fillPreWater(104, 8, 4);
    
    pushPreFloor(120, 24, 11);
    pushPreThing(Stone, 184, 64, 1, 1);
    pushPreThing(CastleBlock, 184, 56, 6);
    makeCeilingCastle(192, 136);
    fillPreWater(208, 0, 6);
    pushPreThing(Podoboo, 216, -32);
    
    pushPreFloor(232, 24, 3);
    pushPreThing(CastleBlock, 240, 24, 6);
    pushPreThing(Block, 240, 56, Mushroom);
    fillPreWater(256, 0, 6);
    pushPreThing(Podoboo, 264, -32);
    
    pushPreThing(Stone, 280, 32, 37, 1);
    pushPreThing(Stone, 280, 24, 69, 3);
    pushPreFloor(280, 0, 93);
    pushPreThing(Stone, 296, 80, 35, 3);
    pushPreThing(CastleBlock, 296, 56, 6);
    pushPreThing(CastleBlock, 392, 56, 6);
    pushPreThing(CastleBlock, 480, 56, 6);
    pushPreThing(CastleBlock, 536, 56, 6);
    pushPreThing(CastleBlock, 608, 32, 6);
    pushPreThing(Stone, 640, 80, 1, 1);
    pushPreThing(CastleBlock, 640, 72, 6);
    pushPreThing(CastleBlock, 672, 32, 6);
    pushPreThing(Stone, 704, 80, 1, 1);
    pushPreThing(CastleBlock, 704, 72, 6, true);
    pushPreThing(CastleBlock, 736, 32, 6);
    pushPreThing(Stone, 776, 80, 7, 2);
    pushPreThing(Block, 848, 32, Coin, true);
    pushPreThing(Block, 872, 32, Coin, true);
    pushPreThing(Block, 896, 32, Coin, true);
    pushPreThing(Block, 856, 64, Coin, true);
    pushPreThing(Block, 880, 64, Coin, true);
    pushPreThing(Block, 904, 64, Coin, true);
    pushPreThing(Stone, 928, 24, 4, 3);
    pushPreThing(Stone, 984, 24, 5, 3);
    pushPreThing(Stone, 984, 80, 5, 2);
    
    endCastleInside(1024);
  })
];