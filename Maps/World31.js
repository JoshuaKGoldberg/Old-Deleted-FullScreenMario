map.time = 300;
map.locs = [
  new Location(0, true),
  new Location(0, exitPipeVert),
  new Location(0, false, 1272),
  new Location(1),
  new Location(2, enterCloudWorld)
];
map.areas = [
  new Area("Overworld Night Alt", function() {
    setLocationGeneration(0);
    
    pushPreCastle(0, 0, true);
    pushPrePattern("backfence", 0, 0, 5);
    
    pushPreFloor(0, 0, 45);
    pushPreThing(Block, 128, jumplev1);
    pushPreThing(Block, 152, jumplev1 + 8);
    pushPreThing(Block, 176, 40, Mushroom);
    pushPreThing(Koopa, 200, 12, false, true);
    fillPreThing(Brick, 208, jumplev1, 3, 1, 8);
    pushPreThing(Koopa, 224, 20, false, true);
    pushPrePipe(256, 0, 24, true);
    pushPreThing(Goomba, 296, 8);
    pushPrePipe(304, 0, 32, true, 3);
    
    pushPreFloor(384, 0, 29);
    fillPreThing(Goomba, 424, 8, 3, 1, 12);
    pushPrePipe(456, 0, 24, true);
    pushPreThing(Brick, 488, jumplev1);
    pushPreThing(Koopa, 520, 12);
    pushPrePipe(536, 0, 16, true, false, 1);
    pushPreThing(Stone, 584, 8);
    pushPreThing(Stone, 592, 16, 1, 2);
    pushPreThing(Stone, 600, 24, 1, 3);
    pushPreThing(Stone, 608, 32, 1, 4);
    fillPreWater(616, 10, 16);
    pushPreBridge(616, 32, 8);
    fillPreThing(Goomba, 656, 40, 3, 1, 12);
    pushPreThing(Block, 656, jumplev2, [Mushroom, 1], true);
    pushPreFloor(680, 0, 1);
    pushPreThing(Stone, 680, 32, 1, 4);
    fillPreWater(688, 10, 4);
    
    pushPreFloor(704, 0, 40);
    pushPreThing(Stone, 704, 32, 1, 4);
    pushPreThing(Stone, 712, 16, 1, 2);
    pushPreThing(Brick, 720, jumplev2, Star);
    fillPreThing(Brick, 728, jumplev2, 2, 1, 8);
    fillPreThing(Goomba, 752, 8, 2, 1, 12);
    pushPreThing(Koopa, 808, 12);
    pushPrePipe(824, 0, 32, true);
    fillPreThing(Brick, 888, jumplev1, 11, 1, 8);
    fillPreThing(Brick, 888, jumplev2, 2, 1, 8);
    pushPreThing(HammerBro, 904, jumplev1+12);
    pushPreThing(Block, 904, jumplev2);
    fillPreThing(Brick, 912, jumplev2, 3, 1, 8);
    pushPreThing(HammerBro, 936, 12);
    pushPreThing(Block, 936, jumplev2, Mushroom);
    fillPreThing(Brick, 944, jumplev2, 3, 1, 8);
    pushPreThing(Springboard, 1008, 14.5);
    
    fillPreThing(Brick, 1032, 40, 3, 1, 8);
    fillPreThing(Brick, 1032, 64, 2, 1, 8);
    pushPreThing(Brick, 1048, 64, [Vine, 4]);
    
    pushPreFloor(1056, 0, 10);
    pushPreThing(Stone, 1088, 8);
    pushPreThing(Stone, 1096, 16, 1, 2);
    pushPreThing(Stone, 1104, 24, 1, 3);
    pushPreThing(Stone, 1112, 32, 1, 4);
    pushPreThing(Goomba, 1112, 40);
    pushPreThing(Stone, 1120, 40, 1, 5);
    pushPreThing(Goomba, 1120, 48);
    pushPreThing(Stone, 1128, 48, 1, 6);
    
    pushPreFloor(1152, 0, 33);
    pushPreThing(Koopa, 1192, 12);
    fillPreThing(Brick, 1200, jumplev1, 2, 2, 16, 32);
    fillPreThing(Block, 1208, jumplev1, 1, 2, 0, 32);
    pushPreThing(Koopa, 1216, 76);
    fillPreThing(Goomba, 1232, 8, 3, 1, 12);
    fillPreThing(Brick, 1240, jumplev1, 2, 2, 16, 32);
    pushPreThing(Block, 1248, jumplev1, Mushroom);
    pushPreThing(Block, 1248, jumplev2);
    pushPreThing(Koopa, 1320, 12, false, true);
    pushPreThing(Brick, 1328, jumplev1);
    pushPreThing(Brick, 1336, jumplev1, Coin);
    pushPreThing(Koopa, 1344, 18, false, true);
    fillPreThing(Brick, 1344, jumplev1, 3, 1, 8);
    pushPreThing(Koopa, 1360, 44);
    pushPreThing(Koopa, 1368, 12, false, true);
    pushPreThing(Stone, 1392, 24, 1, 3);
    pushPreThing(Stone, 1400, 48, 1, 6);
    
    pushPreFloor(1440, 0, 40);
    pushPreThing(Stone, 1464, 8);
    pushPreThing(Stone, 1472, 16, 1, 2);
    pushPreThing(Stone, 1480, 24, 1, 3);
    pushPreThing(Stone, 1488, 32, 1, 4);
    pushPreThing(Stone, 1496, 40, 1, 5);
    pushPreThing(Stone, 1504, 48, 1, 6);
    pushPreThing(Koopa, 1504, 60);
    pushPreThing(Stone, 1512, 56, 1, 7);
    pushPreThing(Stone, 1520, 64, 2, 8);
    pushPreThing(Koopa, 1528, 76);
    
    endCastleOutside(1596);
  }),
  new Area("Underworld", function() {
    setLocationGeneration(3);
    pushPreFloor(0, 0, 17);
    fillPreThing(Brick, 0, 8, 1, 11, 8, 8);
    fillPreThing(Brick, 24, 40, 2, 4, 72, 8);
    fillPreThing(Brick, 32, 32, 2, 1, 56);
    fillPreThing(Brick, 32, 56, 2, 2, 56, 8);
    fillPreThing(Coin, 33, 39, 2, 1, 56);
    fillPreThing(Brick, 40, 40, 2, 1, 40);
    pushPreThing(Brick, 40, 64, Mushroom);
    fillPreThing(Coin, 41, 47, 2, 1, 40);
    fillPreThing(Brick, 48, 48, 2, 1, 24);
    fillPreThing(Coin, 49, 55, 2, 2, 24, 16);
    fillPreThing(Brick, 56, 56, 2, 2, 8, 8);
    fillPreThing(Coin, 57, 71, 2, 2, 8, 8);
    pushPreThing(Brick, 80, 64);
    pushPreThing(PipeSide, 104, 16, 1);
    pushPreThing(PipeVertical, 120, 88, 88);
  }),
  new Area("Sky Night", function() {
    setLocationGeneration(4);
    pushPreThing(Stone, 0, 0, 4);
    pushPreThing(Stone, 40, 0, 78);
    pushPreThing(Platform, 128, 24, 6, collideTransport);
    fillPreThing(Coin, 121, 55, 16, 1, 8);
    pushPreThing(Stone, 256, 40);
    fillPreThing(Coin, 273, 55, 16, 1, 8);
    pushPreThing(Stone, 408, 48, 1, 2);
    fillPreThing(Coin, 425, 63, 7, 1, 8);
    pushPreThing(Stone, 488, 48, 1, 2);
    pushPreThing(Stone, 536, 56, 2);
    fillPreThing(Stone, 568, 56, 5, 1, 16);
    fillPreThing(Coin, 569, 63, 10, 1, 8);
    fillPreThing(Coin, 681, 15, 3, 1, 8);
    
    setExitLoc(2);
  })
];