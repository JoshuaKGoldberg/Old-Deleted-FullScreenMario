map.locs = [
  new Location(0, true),
  new Location(0, false, 1260),
  new Location(0, exitPipeVert),
  new Location(1, enterCloudWorld),
  new Location(2)
];
map.areas = [
  new Area("Overworld", function() {
    setLocationGeneration(0);
    
    pushPreCastle(0, 0, true);
    pushPrePattern("backfence", 0, 0, 2);
    pushPrePattern("backfencemin", 768, 0, 1);
    pushPrePattern("backfence", 1152, 0, 2);
    
    pushPreFloor(0, 0, 92);
    pushPreThing(Brick, 120, jumplev1);
    pushPreThing(Brick, 128, jumplev1, Mushroom);
    pushPreThing(Brick, 136, jumplev1);
    pushPreThing(Stone, 160, 8);
    pushPreThing(Stone, 168, 16, 1, 2);
    pushPreThing(Stone, 176, 24, 1, 3);
    pushPreThing(Stone, 184, 32, 1, 4);
    pushPreThing(Stone, 192, 40, 1, 5);
    pushPreThing(Goomba, 192, 48);
    pushPreThing(Block, 224, jumplev1, false, true);
    pushPreThing(Block, 224, jumplev2, [Mushroom, 1], true);
    fillPreThing(Brick, 232, jumplev2, 3, 1, 8, 8);
    pushPreThing(Koopa, 256, 12); 
    pushPreThing(Koopa, 264, 12); 
    pushPreThing(Stone, 272, 32, 1, 4);
    pushPreThing(Stone, 280, 16, 1, 2);
    pushPreThing(Goomba, 336, 8);
    pushPreThing(Goomba, 348, 8);
    pushPrePipe(368, 0, 32, true);
    pushPreThing(Block, 424, jumplev1, Mushroom);
    fillPreThing(Block, 424, jumplev2, 5, 1, 8, 8);
    fillPreThing(Block, 432, jumplev1, 4, 1, 8, 8);
    pushPreThing(Goomba, 472, 8);
    pushPreThing(Goomba, 484, 8);
    pushPreThing(Koopa, 528, 12);
    fillPreThing(Goomba, 544, 8, 3, 1, 12, 8);
    pushPreThing(Brick, 544, jumplev1);
    pushPreThing(Brick, 552, jumplev2, Star);
    fillPreThing(Brick, 560, jumplev2, 3, 1, 8, 8);
    
    pushPrePipe(592, 0, 32, true);
    fillPreThing(Block, 632, jumplev1, 4, 1, 8, 8);
    fillPreThing(Brick, 648, jumplev2, 2, 1, 8, 8);
    pushPreThing(Brick, 664, jumplev2, [Vine, 3]);
    fillPreThing(Brick, 672, jumplev2, 2, 1, 8, 8);
    fillPreThing(Block, 680, jumplev1, 3, 1, 8, 8);
    fillPreThing(Goomba, 704, 8, 3, 1, 12, 8);
    
    fillPreThing(Brick, 736, jumplev2, 4, 1, 8, 8);
    pushPreFloor(768, 0, 10);
    pushPreThing(Goomba, 820, 40, 8, 8);
    pushPrePipe(824, 0, 32, true, 4);

    pushPreFloor(872, 0, 30);
    pushPreThing(Goomba, 916, 24, 8, 8);
    pushPrePipe(920, 0, 16, true, false, 2);
    pushPreThing(Goomba, 962, 8);
    pushPrePipe(976, 0, 32, true);
    pushPreThing(Brick, 1000, jumplev2, Mushroom);
    fillPreThing(Brick, 1008, jumplev2, 3, 1, 8, 8);
    pushPrePipe(1008, 0, 24);
    pushPrePipe(1040, 0, 40, true);
    pushPreThing(Koopa, 1096, 12);
    
    pushPreFloor(1136, 0, 10);
    pushPreThing(Koopa, 1200, 36, false, true);
    
    pushPreFloor(1232, 0, 72);
    pushPreThing(Stone, 1232, 24, 1, 3);
    pushPreThing(Brick, 1288, jumplev1, Coin);
    fillPreThing(Goomba, 1296, 8, 2, 1, 12);
    fillPreThing(Brick, 1312, jumplev2, 5, 1, 8);
    fillPreThing(Koopa, 1352, 12, 2, 1, 16);
    pushPreThing(Block, 1360, jumplev1);
    pushPreThing(Block, 1374, jumplev2, Mushroom);
    pushPrePipe(1408, 0, 24, true);
    pushPreThing(Koopa, 1480, 12);
    fillPreThing(Brick, 1480, jumplev1, 2, 1, 8);
    pushPreThing(Block, 1488, jumplev2, Coin, true);
    pushPreThing(Springboard, 1504, 14.5);
    fillPreThing(Stone, 1520, 80, 2, 1, 8, 8, 1, 10);
    endCastleOutside(1596);
  }),
  new Area("Sky", function() {
    setLocationGeneration(3);
    
    pushPreThing(Stone, 0, 0, 4);
    pushPreThing(Stone, 40, 0, 72);
    pushPreThing(Platform, 120, 32, 8, collideTransport);
    fillPreThing(Coin, 120, 64, 16, 1, 8);
    fillPreThing(Coin, 256, 80, 3, 1, 8);
    fillPreThing(Coin, 288, 72, 16, 1, 8);
    fillPreThing(Coin, 424, 80, 3, 1, 8);
    
    setExitLoc(1);
    // pushPreThing(LocationShifter, 609, -32, 2, [window.innerWidth / unitsize, 16]);
}),
  new Area("Underworld", function() {
    setLocationGeneration(4);
    
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
