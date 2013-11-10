map.locs = [
  new Location(0, true),
  new Location(0, exitPipeVert),
  new Location(0, entryNormal, 1032),
  new Location(1),
  new Location(2, enterCloudWorld)
];
map.areas = [
  new Area("Overworld Alt", function() {
    setLocationGeneration(0);
    
    pushPreCastle();
    // pushPreScenery("Castle", -1 * unitsizet4, castlev);
    pushPreCastle(0, 0);
    pushPrePattern("backfence", -384, 0, 4);
    pushPrePattern("backfence", 1152, 0, 2);
    pushPreFloor(0, 0, 26);
    pushPreThing(Stone, 96, 8);
    pushPreThing(Stone, 104, 16, 1, 2);
    pushPreThing(Stone, 112, 24, 1, 3);
    pushPreThing(Stone, 120, 24, 1, 3);
    pushPreThing(Stone, 120, 32, 4);
    pushPreThing(Cannon, 136, 48, 2);
    fillPreThing(Coin, 169, 71, 3, 1, 8);
    pushPreThing(Koopa, 184, 12);
    pushPreThing(Springboard, 200, 14.5);
    
    pushPreFloor(232, 0, 37);
    fillPreThing(Brick, 232, jumplev1, 6, 1, 8);
    fillPreThing(Brick, 232, jumplev2, 5, 1, 8);
    fillPreThing(Coin, 233, 39, 3, 1, 8);
    pushPreThing(Brick, 272, jumplev2, Mushroom);
    pushPreThing(Koopa, 320, 32, false, true);
    pushPreThing(Stone, 352, 8);
    pushPreThing(Stone, 360, 16, 1, 2);
    pushPreThing(Stone, 368, 24, 1, 3);
    pushPreThing(HammerBro, 368, 36);
    pushPreThing(Stone, 376, 32, 2, 4);
    pushPreThing(Stone, 392, 16, 1, 2);
    pushPrePipe(440, 0, 24, true, 3);
    pushPreThing(Stone, 496, 8);
    pushPreThing(Stone, 504, 16, 1, 2);
    pushPreThing(Goomba, 504, 24);
    pushPreThing(Stone, 512, 24, 1, 3);
    pushPreThing(Stone, 520, 32, 1, 4);
    pushPreThing(Goomba, 520, 40);
    
    pushPreFloor(544, 0, 24);
    pushPreThing(Stone, 544, 40, 1, 5);
    pushPreThing(Stone, 552, 48, 2, 6);
    fillPreThing(Block, 624, jumplev1, 5, 1, 8);
    pushPreThing(HammerBro, 648, 46);
    pushPreThing(Block, 672, jumplev1, Coin, true);
    pushPreThing(Brick, 680, jumplev2, [Vine, 4]);
    fillPreThing(Brick, 688, jumplev2, 2, 1, 8);
    fillPreThing(Coin, 689, 71, 2, 1, 8);
    fillPreThing(Brick, 712, 40, 3, 1, 8);
    fillPreThing(Coin, 713, 7, 2, 1, 8);
    
    pushPreFloor(768, 0, 31);
    pushPreThing(Koopa, 848, 32, false, true);
    pushPreThing(Cannon, 856, 16, 2);
    pushPrePipe(920, 0, 16, true, false, 1);
    fillPreThing(Brick, 944, jumplev1, 8, 1, 8);
    fillPreThing(Brick, 944, jumplev2, 7, 1, 8);
    pushPreThing(HammerBro, 960, 44);
    pushPreThing(HammerBro, 992, 76);
    pushPreThing(Brick, 1000, jumplev2, Star);
    
    pushPreFloor(1032, 0, 15);
    pushPreThing(Stone, 1032, 24, 1, 3);
    fillPreThing(Beetle, 1088, 8.5, 3, 1, 8.5);
    pushPreThing(Brick, 1128, 16, Coin);
    pushPreThing(Brick, 1136, 16, Mushroom);
    
    fillPreThing(Brick, 1176, 32, 3, 1, 8);
    pushPreFloor(1208, 0, 19);
    fillPreThing(Brick, 1224, jumplev2, 5, 1, 8);
    fillPreThing(Goomba, 1240, 8, 2, 1, 12);
    pushPreThing(Koopa, 1256, 76, true);
    pushPreThing(Koopa, 1304, 28, false, true);
    pushPreThing(Koopa, 1328, 20, false, true);
    pushPreThing(Block, 1344, 32, Mushroom);
    
    fillPreThing(Brick, 1376, jumplev2, 4, 1, 8);
    fillPreThing(Coin, 1377, 71, 2, 1, 8);
    pushPreFloor(1384, 0, 2);
    pushPrePipe(1384, 0, 16);
    
    pushPreFloor(1416, 0, 8);
    pushPreThing(Stone, 1464, 8);
    pushPreThing(Stone, 1472, 16, 1, 2);
    
    pushPreThing(SceneryBlocker, 1480, 8);
    pushPreFloor(1488, 0, 2);
    pushPreThing(Stone, 1488, 32, 1, 4);
    pushPreThing(Koopa, 1488, 64, false, true);
    pushPreThing(Stone, 1496, 40, 1, 5);
    
    pushPreFloor(1512, 0, 35);
    pushPreThing(Stone, 1512, 56, 1, 7);
    pushPreThing(Stone, 1520, 64, 2, 8);
    endCastleOutside(1596);
  }),
  new Area("Underwater", function() {
    setLocationGeneration(3);
    
    goUnderWater();
    
    pushPreFloor(0, 0, 22);
    pushPreThing(Stone, 88, 56, 5);
    pushPreThing(Coral, 96, 24, 3);
    pushPreThing(Coral, 120, 72, 2);
    pushPreThing(Blooper, 136, 24);
    pushPreThing(Coral, 160, 32, 4);
    fillPreThing(Coin, 177, 47, 10, 1, 8, 8);
    
    pushPrePlatformGenerator(182, 6, 1);
    pushPreFloor(208, 24, 2);
    pushPreThing(Stone, 208, 88, 2, 3);
    pushPreThing(CheepCheep, 220, 60);
    pushPrePlatformGenerator(230, 6, 1);
    pushPreFloor(256, 24, 2);
    pushPreThing(Stone, 256, 88, 2, 3);
    pushPreFloor(272, 0, 4);
    pushPreThing(Blooper, 272, 24);
    
    pushPreThing(Coral, 304, 64, 4);
    pushPreThing(Stone, 304, 72, 6);
    pushPreThing(CheepCheep, 312, 20);
    pushPreFloor(320, 0, 2);
    fillPreThing(Coin, 321, 7, 2, 1, 8);
    pushPreThing(Coral, 344, 64, 4);
    pushPreThing(Blooper, 348, 22);
    pushPreFloor(352, 0, 21);
    pushPreThing(Coral, 368, 16, 2);
    
    pushPreThing(CheepCheep, 388, 40, true);
    pushPreThing(Stone, 400, 32, 4);
    fillPreThing(Coin, 401, 39, 4, 1, 8);
    pushPreThing(CheepCheep, 424, 84);
    pushPreThing(Stone, 432, 56, 4);
    fillPreThing(Coin, 433, 63, 4, 1, 8);
    
    pushPreThing(Stone, 472, 8);
    pushPreThing(Stone, 480, 16, 1, 2);
    pushPreThing(Stone, 488, 32, 2, 4);
    pushPreThing(Stone, 488, 88, 2, 4);
    pushPreThing(PipeSide, 496, 48, 1);
    pushPreThing(Stone, 504, 88, 2, 11);
  }),
  new Area("Sky", function() {
    setLocationGeneration(4);

    pushPreThing(Clouds, 0, 0, 4);
    pushPreThing(Clouds, 40, 0, 72);
    pushPreThing(Platform, 120, 32, 8, collideTransport);
    fillPreThing(Coin, 120, 64, 16, 1, 8);
    fillPreThing(Coin, 256, 80, 3, 1, 8);
    fillPreThing(Coin, 288, 72, 16, 1, 8);
    fillPreThing(Coin, 424, 80, 3, 1, 8);
    
    setExitLoc(2);
  })
];