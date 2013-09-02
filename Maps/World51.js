map.time = 300;
map.locs = [
  new Location(0, true),
  new Location(0, exitPipeVert),
  new Location(1)
];
map.areas = [
  new Area("Overworld Alt", function() {
    setLocationGeneration(0);
    
    pushPreCastle();
    pushPrePattern("backfence", -384, 0, 6);
    pushPreFloor(0, 0, 49);
    pushPreThing(Koopa, 128, 12);
    fillPreThing(Goomba, 152, 8, 3, 1, 12);
    fillPreThing(Koopa, 328, 12, 2, 1, 12);
    pushPrePipe(352, 0, 24, true);
    
    pushPreFloor(408, 0, 41);
    pushPrePipe(408, 0, 24, true);
    pushPreThing(Koopa, 488, 32, false, true);
    fillPreThing(Goomba, 520, 8, 3, 1, 12);
    fillPreThing(Goomba, 608, 8, 3, 1, 12);
    pushPreThing(Koopa, 696, 16, false, true);
    pushPreThing(Stone, 712, 24, 1, 3);
    pushPreThing(Stone, 712, 32, 5);
    fillPreThing(Brick, 720, 64, 2, 1, 16);
    pushPreThing(Brick, 728, 64, Star);
    
    pushPreFloor(768, 0, 18);
    fillPreThing(Goomba, 824, 8, 3, 1, 12);
    pushPreThing(Cannon, 888, 16, 2);
    
    pushPreFloor(928, 0, 36);
    pushPreThing(Stone, 928, 24, 1, 3);
    fillPreThing(Goomba, 968, 8, 3, 1, 12);
    pushPreThing(Koopa, 1016, 12);
    fillPreThing(Goomba, 1080, 8, 3, 1, 12);
    fillPreThing(Koopa, 1152, 12, 2, 1, 12);
    pushPreThing(Stone, 1176, 32, 1, 4);
    pushPreThing(Block, 1184, jumplev1, [Mushroom, 1], true);
    fillPreThing(Brick, 1192, jumplev1, 2, 1, 8);
    
    pushPreFloor(1240, 0, 69);
    pushPreThing(Stone, 1248, jumplev1, 2);
    pushPrePipe(1248, jumplev1, 16, true, 2);
    pushPreThing(Cannon, 1272, 16, 2);
    pushPrePipe(1304, 0, 16, true, false, 1);
    pushPreThing(Cannon, 1360, 16, 2);
    pushPreThing(Koopa, 1424, 12, false, true);
    pushPreThing(Stone, 1456, 8);
    pushPreThing(Brick, 1456, 44);
    pushPreThing(Stone, 1464, 16, 1, 2);
    pushPreThing(Stone, 1472, 24, 1, 3);
    pushPreThing(Stone, 1480, 32, 1, 4);
    pushPreThing(Stone, 1488, 40, 1, 5);
    pushPreThing(Stone, 1512, 64, 2, 7);
    endCastleOutside(1588);
  }),
  new Area("Underworld", function() {
    setLocationGeneration(2);
    makeCeiling(32, 7);
    pushPreFloor(0, 0, 17);
    fillPreThing(Brick, 0, 8, 1, 11, 8, 8);
    fillPreThing(Brick, 32, 48, 7, 1, 8);
    pushPreThing(Brick, 32, 56);
    fillPreThing(Coin, 42, 55, 5, 2, 8, 8);
    fillPreThing(Brick, 80, 56, 1, 4, 8, 8);
    fillPreThing(Brick, 88, 56, 2, 1, 8);
    pushPreThing(Brick, 112, 48, Coin);
    pushPreThing(PipeSide, 104, 16, 1);
    pushPreThing(PipeVertical, 120, 88, 88);
  })
];