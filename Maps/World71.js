map.locs = [
  new Location(0, true),
  new Location(0, exitPipeVert),
  new Location(1)
];
map.areas = [
  new Area("Overworld Alt", function() {
    setLocationGeneration(0);
    
    pushPreCastle(0, 0, true);
    pushPrePattern("backfence", 0, 0, 6);
    pushPreFloor(0, 0, 73);
    pushPreThing(Cannon, 152, 16, 2);
    pushPreThing(Koopa, 208, 22, false, true);
    pushPreThing(Brick, 216, jumplev2, Mushroom);
    pushPreThing(Cannon, 224, 8, 1);
    pushPreThing(Cannon, 224, 24, 2);
    fillPreThing(Brick, 224, jumplev2, 2, 1, 8);
    pushPreThing(Cannon, 288, 16, 2);
    fillPreThing(Block, 312, jumplev1, 4, 1, 8);
    pushPreThing(Koopa, 352, 28, false, true);
    pushPreThing(Cannon, 368, 24, 3);
    pushPreThing(Koopa, 424, 22, false, true);
    pushPreThing(Cannon, 448, 8);
    pushPreThing(Cannon, 448, 24, 2);
    fillPreThing(Brick, 496, jumplev1, 2, 1, 8);
    pushPreThing(Stone, 512, jumplev1);
    pushPreThing(Cannon, 512, 48, 2);
    pushPreThing(Koopa, 520, 16, false, true);
    pushPreThing(Brick, 520, jumplev1, Coin);
    pushPreThing(Brick, 528, jumplev1);
    pushPreThing(Cannon, 544, 16, 2);
    
    pushPreFloor(600, 0, 77);
    pushPrePipe(608, 0, 24, true);
    fillPreThing(Brick, 656, jumplev1, 7, 2, 8, 32);
    pushPreThing(HammerBro, 680, 44);
    pushPreThing(HammerBro, 692, 76);
    pushPrePipe(744, 0, 24, true, 2);
    pushPreThing(Block, 744, jumplev2, [Mushroom, 1], true);
    pushPreThing(Cannon, 832, 16, 2);
    pushPrePipe(872, 0, 24, true);
    pushPreThing(Koopa, 912, 12);
    pushPrePipe(920, 0, 16, true, false, 1);
    pushPreThing(Cannon, 976, 16, 2);
    pushPrePipe(1024, 0, 16, true);
    fillPreThing(Brick, 1072, jumplev1, 5, 2, 8, 32);
    pushPreThing(HammerBro, 1080, 12);
    pushPreThing(HammerBro, 1096, 44);
    pushPreThing(Stone, 1128, 24, 1, 3);
    pushPreThing(Cannon, 1168, 8);
    pushPreThing(Cannon, 1168, 24, 2);
    fillPreThing(Brick, 1192, 40, 2, 1, 8);
    pushPreThing(Springboard, 1208, 14.5);
    pushPreThing(Brick, 1208, 88, Mushroom);
    
    pushPreFloor(1224, 0, 50);
    pushPreThing(Stone, 1224, 8);
    fillPreThing(Brick, 1224, 56, 2, 1, 8);
    pushPreThing(Stone, 1232, 16, 1, 2);
    pushPreThing(Stone, 1240, 24, 1, 3);
    pushPreThing(Stone, 1248, 32, 1, 4);
    pushPreThing(Stone, 1256, 40, 1, 5);
    pushPreThing(Stone, 1264, 48, 1, 6);
    
    pushPreThing(Stone, 1296, 8);
    pushPreThing(Stone, 1304, 16, 1, 2);
    pushPreThing(Stone, 1312, 24, 1, 3);
    pushPreThing(Stone, 1320, 32, 1, 4);
    pushPreThing(Stone, 1328, 40, 1, 5);
    pushPreThing(Stone, 1336, 48, 1, 6);
    pushPreThing(Stone, 1344, 56, 1, 7);
    pushPreThing(Stone, 1352, 64, 2, 8);
    pushPreThing(Beetle, 1352, 72.5);
    
    endCastleOutside(1428);
  }),
  new Area("Underworld", function() {
    setLocationGeneration(2);
    
    makeCeiling(32, 7);
    pushPreFloor(0, 0, 17);
    fillPreThing(Brick, 0, 8, 1, 11, 8, 8);
    fillPreThing(Brick, 32, 8, 7, 3, 8, 8);
    fillPreThing(Coin, 33, 31, 7, 2, 8, 16);
    fillPreThing(Coin, 41, 63, 5, 1, 8, 8);
    pushPreThing(PipeSide, 104, 16, 1);
    pushPreThing(PipeVertical, 120, 88, 88);
  })
];