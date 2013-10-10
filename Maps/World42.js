map.locs = [
  new Location(0, walkToPipe),
  new Location(1),
  new Location(1, exitPipeVert),
  new Location(2),
  new Location(3, exitPipeVert),
  new Location(4, enterCloudWorld)
];
map.areas = [
  new Area("Overworld", function() { // entrance - loc 0
    setLocationGeneration(0);
    pushPreCastle();
    pushPrePattern("backcloud", 0, 4, 1);
    pushPreFloor(0, 0, 24);
    pushPreThing(PipeSide, 80, 16, 1);
    pushPrePipe(96, 0, 32);
  }),
  new Area("Underworld", function() { // main underworld - locs 1 (entryNormal), 2 (exitPipeVert)
    setLocationGeneration(1);

    fillPreThing(Brick, 0, 8, 1, 11, 8, 8);
    pushPreFloor(0, 0, 11);
    makeCeiling(48, 51);
    
    pushPreFloor(104, 0, 2);
    pushPreFloor(136, 0, 1);
    
    fillPreThing(Brick, 160, 64, 23, 3, 8, 8);
    pushPreFloor(168, 0, 36);
    fillPreThing(Brick, 176, 16, 5, 3, 8, 8);
    pushPreThing(Brick, 216, 32);
    fillPreThing(Coin, 217, 7, 3, 1, 8);
    pushPreThing(Brick, 224, 32, Mushroom);
    fillPreThing(Brick, 240, 8, 18, 4, 8, 8);
    fillPreThing(Goomba, 344, 40, 3, 1, 12);
    pushPreThing(Brick, 344, 64);
    pushPreThing(Brick, 344, 72, Coin);
    pushPreThing(Brick, 344, 80);
    fillPreThing(Brick, 352, jumplev2, 4, 3, 8, 8);
    fillPreThing(Block, 400, jumplev1, 2, 2, 8, 32);
    fillPreThing(Block, 432, jumplev1, 2, 1, 16);
    pushPreThing(Block, 440, jumplev1, Mushroom);
    
    pushPrePlatformGenerator(470, 6, 1);
    // pushPreThing(PlatformGenerator, 470, ceilmax, 6, 1);
    
    pushPreFloor(504, 0, 42);
    pushPreThing(Block, 504, 40, Coin, true);
    pushPreThing(Block, 512, 48, Coin, true);
    pushPreThing(Brick, 512, 64, [Vine, 5]); // goes to bonus overworld
    pushPreThing(Block, 520, 40, Coin, true);
    fillPreThing(Brick, 520, 64, 2, 1, 8);
    pushPreThing(Block, 528, 32, Coin, true);
    makeCeiling(536, 45);
    pushPrePipe(576, 0, 24, true);
    pushPreThing(Brick, 608, jumplev1);
    pushPreThing(Koopa, 616, 12);
    pushPreThing(Brick, 616, jumplev1, Coin);
    pushPrePipe(624, 0, 56, true);
    pushPreThing(Brick, 640, jumplev1);
    pushPreThing(Brick, 648, jumplev1, Star);
    pushPreThing(Beetle, 664, 8.5);
    pushPrePipe(672, 0, 24, true, 3); // goes to second underworld
    pushPreThing(Brick, 696, 40);
    pushPreThing(Beetle, 704, 8.5);
    pushPrePipe(712, 0, 24);
    fillPreThing(Koopa, 800, 12, 2, 1, 12);
    pushPreThing(Stone, 824, 16, 1, 2);
    pushPreThing(Stone, 832, 24, 1, 3);
    
    pushPreFloor(856, 0, 2);
    pushPrePipe(856, 0, 32, true, false, 2);
    
    pushPreFloor(888, 0, 2);
    pushPreThing(Stone, 888, 24, 2, 3);
    
    pushPrePlatformGenerator(918, 6, 1);
    // pushPreThing(PlatformGenerator, 918, ceilmax, 6, 1);
    pushPreFloor(952, 0, 4);
    fillPreThing(Brick, 952, 32, 4, 1, 8);
    pushPreThing(Brick, 952, 64);
    fillPreThing(Brick, 952, 88, 4, 1, 8);
    pushPreThing(Brick, 960, 64, Mushroom);
    pushPreThing(Brick, 968, 64);
    
    pushPrePlatformGenerator(992, 6, -1);
    // pushPreThing(PlatformGenerator, 992, ceilmax, 6, -1);
    
    makeCeiling(1024, 27);
    pushPreFloor(1032, 0, 15);
    pushPrePipe(1048, 0, 16, false, false, 2); // exit of second underworld
    pushPreThing(Koopa, 1096, 12);
    pushPrePipe(1104, 0, 24, true);
    pushPrePipe(1136, 0, 32, true);
    
    pushPreFloor(1168, 0, 9);
    pushPreThing(Stone, 1216, 8);
    pushPreThing(Stone, 1224, 16, 1, 2);
    pushPreThing(Stone, 1232, 24, 1, 3);
    pushPreThing(Beetle, 1232, 32.5);
    
    pushPrePlatformGenerator(1246, 6, 1);
    // pushPreThing(PlatformGenerator, 1246, ceilmax, 6, 1);
    
    pushPreFloor(1280, 0, 23);
    fillPreThing(Brick, 1280, 48, 1, 2, 8, 8);
    fillPreThing(Brick, 1280, 64, 16, 3, 8, 8);
    makeCeiling(1280, 29);
    pushPreThing(Brick, 1288, jumplev1, Mushroom);
    fillPreThing(Brick, 1296, jumplev1, 10, 1, 8);
    fillPreThing(Coin, 1297, 39, 10, 1, 8);
    fillPreThing(Koopa, 1344, 12, 2, 1, 12);
    pushPreThing(Stone, 1384, 8);
    pushPreThing(Stone, 1392, 16, 1, 2);
    pushPreThing(Stone, 1400, 24, 1, 3);
    pushPreThing(Stone, 1408, 32, 1, 4);
    pushPreThing(Beetle, 1432, 8.5);
    pushPrePipe(1440, 0, 56, true);
    
    pushPreThing(Floor, 1480, 0, 39);
    fillPreThing(Brick, 1480, 8, 24, 3, 8, 8);
    pushPreThing(PipeSide, 1496, 40, 4);
    pushPreThing(PipeVertical, 1512, 88, 64);
    fillPreThing(Brick, 1528, 32, 18, 7, 8, 8);
    makeCeiling(1528, 28);
    
    fillPreThing(Brick, 1616, 32, 7, 7, 8, 8);
    pushPreThing(ScrollEnabler, 1610, ceilmax);
    makeCeiling(1616, 17);
    pushPreWarpWorld(1670, 0, [[5,1]], 0, true);
    fillPreThing(Brick, 1776, 8, 2, 11, 8, 8);
  }), 
  new Area("Underworld", function() { // secondary underworld - loc 3
    setLocationGeneration(3);
  
    makeCeiling(32, 7);
    pushPreFloor(0, 0, 17);
    fillPreThing(Brick, 0, 8, 1, 11, 8, 8);
    fillPreThing(Brick, 32, 48, 7, 1, 8);
    pushPreThing(Brick, 32, 56);
    fillPreThing(Coin, 42, 55, 5, 2, 8, 8);
    fillPreThing(Brick, 80, 56, 1, 4, 8, 8);
    fillPreThing(Brick, 88, 56, 2, 1, 8);
    pushPreThing(Brick, 112, 48, Coin);
    pushPreThing(PipeSide, 104, 16, 2);
    pushPreThing(PipeVertical, 120, 88, 88);
  }), 
  new Area("Overworld", function() { // regular exit - loc 4
    setLocationGeneration(4);
    
    pushPrePattern("backreg", 104, 0, 1);
    pushPreFloor(0, 0, 58);
    pushPrePipe(0, 0, 16, true, false, 4);
    pushPreThing(Stone, 16, 8, 1, 1);
    pushPreThing(Stone, 24, 16, 1, 2);
    pushPreThing(Stone, 32, 24, 1, 3);
    pushPreThing(Stone, 40, 32, 1, 4);
    pushPreThing(Stone, 48, 40, 1, 5);
    pushPreThing(Stone, 56, 48, 1, 6);
    pushPreThing(Stone, 64, 56, 1, 7);
    pushPreThing(Stone, 72, 64, 2, 8);
    endCastleOutside(148);
  }), 
  new Area("Overworld", function() { // bonus world! - loc 5
    setLocationGeneration(5);
    
    pushPrePattern("backcloud", -384, 4, 3);
    pushPreFloor(0, 0, 4);
    pushPreFloor(40, 0, 59);
    pushPreShroom(96, 32, 3);
    fillPreThing(Coin, 97, 39, 3, 1, 8);
    pushPreShroom(128, 64, 3);
    fillPreThing(Coin, 129, 71, 3, 1, 8);
    pushPreShroom(144, 16, 3);
    pushPreShroom(176, 16, 5);
    pushPreShroom(176, 64, 3);
    fillPreThing(Coin, 177, 71, 3, 1, 8);
    pushPreShroom(208, 48, 3);
    fillPreThing(Coin, 209, 55, 3, 1, 8);
    pushPreShroom(240, 72, 5);
    fillPreThing(Coin, 241, 79, 5, 1, 8);
    pushPreShroom(248, 24, 7);
    fillPreThing(Coin, 281, 31, 2, 1, 8);
    
    pushPreThing(Stone, 320, 8);
    pushPreThing(Stone, 328, 16, 1, 2);
    pushPreThing(Stone, 336, 24, 1, 3);
    pushPreThing(Stone, 344, 32, 1, 4);
    pushPreThing(Stone, 352, 40, 1, 5);
    pushPreThing(Stone, 360, 48, 1, 6);
    pushPreThing(Stone, 368, 56, 1, 7);
    pushPreThing(Stone, 376, 64, 1, 8);
    pushPreThing(Stone, 384, 72, 1, 9);
    pushPreThing(Stone, 392, 72, 11);
    pushPreWarpWorld(390, 0, [[8,1],[7,1],[6,1]]);
    pushPreThing(Stone, 496, 88, 2, 11);
    pushPreThing(ScrollBlocker, 512, 88);
  })
];