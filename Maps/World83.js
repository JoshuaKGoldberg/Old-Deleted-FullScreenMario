map.time = 300;
map.locs = [
  new Location(0, true)
];
map.areas = [
  new Area("Overworld", function() {
    setLocationGeneration(0);
    
    pushPrePattern("backfencemin3", -384, 0, 7);
    pushPreCastle();
    pushPreFloor(0, 0, 69);
    // pushPreScenery("Fence", 120, 0);
    pushPreThing(Cannon, 144, 16, 2);
    pushPreScenery("CastleWall", 192, 0, 8);
    pushPreThing(Koopa, 240, 32, false, true);
    pushPreThing(Cannon, 272, 24, 3);
    pushPreScenery("CastleWall", 296, 0, 14);
    pushPrePipe(424, 0, 32, true);
    fillPreThing(Brick, 480, jumplev1, 8, 1, 8);
    fillPreThing(Brick, 480, jumplev2, 6, 1, 8);
    // pushPreScenery("Fence", 504, 0);
    pushPreThing(HammerBro, 504, 12);
    pushPreThing(HammerBro, 520, 44);
    pushPreThing(Brick, 528, jumplev2, Mushroom);
    pushPreThing(Brick, 536, jumplev2);
    
    pushPreFloor(568, 0, 4);
    pushPreThing(Stone, 568, 32, 1, 4);
    pushPreThing(Stone, 576, 24, 1, 3);
    pushPreThing(Stone, 584, 16, 1, 2);
    pushPreThing(Stone, 592, 8, 1, 1);
    
    pushPreFloor(616, 0, 47);
    pushPreScenery("CastleWall", 632, 0, 6);
    pushPreThing(Cannon, 688, 16, 2);
    pushPreScenery("CastleWall", 704, 0, 6);
    pushPreThing(Koopa, 744, 24, false, true);
    pushPreThing(Stone, 760, 24, 1, 3);
    pushPreScenery("CastleWall", 776, 0, 10);
    pushPreThing(Stone, 872, 32, 2, 4);
    fillPreThing(Brick, 920, jumplev1, 8, 1, 8);
    pushPreThing(Brick, 920, jumplev2);
    pushPreThing(Brick, 928, jumplev2, Mushroom);
    pushPreThing(HammerBro, 936, 44);
    fillPreThing(Brick, 936, jumplev2, 6, 1, 8);
    pushPreThing(HammerBro, 952, 12);
    
    pushPreFloor(1008, 0, 2);
    pushPrePipe(1008, 0, 32, true);
    
    pushPreFloor(1040, 0, 67);
    pushPreScenery("CastleWall", 1056, 0, 34);
    pushPreThing(Koopa, 1096, 12);
    pushPreThing(HammerBro, 1168, 12);
    pushPreThing(HammerBro, 1270, 12);
    pushPrePipe(1344, 0, 24, true);
    pushPreScenery("CastleWall", 1376, 0, 20);
    pushPreThing(HammerBro, 1416, 12);
    pushPreThing(HammerBro, 1480, 12);
    pushPreThing(Brick, 1520, jumplev1, Coin);
    pushPreThing(Stone, 1560, 16, 1, 2);
    
    pushPreThing(Stone, 1584, 16);
    pushPreThing(Stone, 1600, 32);
    pushPreThing(Stone, 1616, 48);
    pushPreThing(SceneryBlocker, 1624, 24, 40, 24);
    pushPreThing(Stone, 1632, 64, 2, 1);
    pushPreFloor(1664, 0, 32);
    endCastleOutside(1708, 0, true, 11, 44);
  })
];