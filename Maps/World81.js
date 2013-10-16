map.time = 300;
map.locs = [
  new Location(0, true),
  new Location(0, exitPipeVert),
  new Location(1)
];
map.areas = [
  new Area("Overworld", function() {
    setLocationGeneration(0);
  
    pushPrePattern("backfence", 0, 0, 10);
    pushPreCastle(0, 0, true);
    pushPreFloor(0, 0, 46);
    pushPreThing(Beetle, 144, 8.5);
    fillPreThing(Goomba, 184, 8, 3, 1, 12);
    fillPreThing(Goomba, 240, 8, 3, 1, 12);
    pushPrePipe(280, 0, 32, true);
    fillPreThing(Koopa, 344, 12, 2, 1, 12);
    pushPreFloor(376, 0, 1);
    pushPreFloor(392, 0, 2);
    pushPreFloor(416, 0, 2);
    pushPreFloor(440, 0, 2);
    pushPreFloor(464, 0, 111);
    pushPreThing(Koopa, 488, 12);
    pushPreThing(Coin, 513, 39);
    fillPreThing(Goomba, 552, 8, 3, 1, 12);
    pushPrePipe(608, 0, 32, true);
    pushPreThing(Block, 640, 40, [Mushroom, 1], true);
    pushPreThing(Beetle, 648, 8.5);
    pushPrePipe(656, 0, 24, true);
    pushPreThing(Coin, 713, 39);
    pushPrePipe(752, 0, 32, true);
    pushPreThing(Coin, 786, 39);
    pushPrePipe(832, 0, 32, true, 2);
    fillPreThing(Goomba, 864, 8, 3, 1, 12);
    fillPreThing(Coin, 873, 71, 2, 1, 8);
    pushPrePipe(920, 0, 16, true, false, 1);
    pushPreThing(Koopa, 952, 12);
    fillPreThing(Koopa, 992, 12, 3, 1, 12);
    fillPreThing(Koopa, 1040, 12, 3, 1, 12);
    pushPrePipe(1120, 0, 24, true);
    fillPreThing(Goomba, 1184, 8, 3, 1, 12);
    pushPreThing(Stone, 1224, 32, 1, 4);
    fillPreThing(Brick, 1232, jumplev2, 4, 1, 8);
    pushPreThing(Block, 1264, jumplev1, Coin, true);
    pushPreThing(Brick, 1264, jumplev2, Mushroom);
    fillPreThing(Brick, 1272, jumplev2, 3, 1, 8);
    pushPreThing(Koopa, 1288, jumplev1, false, true);
    pushPreThing(Stone, 1304, 32, 1, 4);
    
    pushPreFloor(1360, 0, 1);
    pushPreFloor(1376, 0, 2);
    pushPreThing(Koopa, 1376, 32, false, true);
    pushPreFloor(1400, 0, 1);
    pushPreFloor(1416, 0, 2);
    pushPreThing(Koopa, 1416, 28, false, true);
    pushPreFloor(1416, 0, 2);
    
    pushPreFloor(1440, 0, 17);
    fillPreThing(Brick, 1472, 40, 2, 1, 8);
    pushPreThing(Brick, 1488, 40, Star);
    fillPreThing(Brick, 1496, 40, 5, 1, 8);
    pushPreFloor(1584, 0, 1);
    pushPreFloor(1600, 0, 1);
    pushPreFloor(1616, 0, 19);
    fillPreThing(Koopa, 1656, 12, 2, 1, 12);
    pushPreThing(Stone, 1680, 16, 1, 2);
    
    fillPreThing(Coin, 1785, 39, 2, 1, 8);
    
    pushPreFloor(1816, 0, 10);
    fillPreThing(Goomba, 1856, 8, 3, 1, 12);
    pushPreFloor(1904, 0, 2);
    pushPrePipe(1904, 0, 24, true);
    pushPreFloor(1936, 0, 2);
    pushPrePipe(1936, 0, 32, true);
    
    pushPreFloor(1968, 0, 44);
    pushPrePipe(1968, 0, 40);
    pushPreThing(Beetle, 2032, 8.5);
    fillPreThing(Goomba, 2056, 8, 3, 1, 12);
    fillPreThing(Goomba, 2112, 8, 3, 1, 12);
    fillPreThing(Goomba, 2176, 8, 2, 1, 12);
    pushPreThing(Stone, 2200, 8);
    pushPreThing(Stone, 2208, 16, 1, 2);
    pushPreThing(Stone, 2216, 24, 1, 3);
    pushPreThing(Stone, 2224, 32, 1, 4);
    pushPreThing(Stone, 2232, 40, 1, 5);
    pushPreThing(Stone, 2240, 48, 1, 6);
    pushPreThing(Beetle, 2264, 8.5);
    fillPreThing(Coin, 2265, 39, 2, 1, 8);
    
    fillPreThing(Coin, 2329, 39, 2, 1, 40);
    pushPreFloor(2344, 0, 2);
    pushPreFloor(2384, 0, 16);
    fillPreThing(Stone, 2424, 16, 2, 1, 32, 8, 1, 2);
    pushPreThing(Koopa, 2440, 12);
    fillPreThing(Coin, 2529, 39, 2, 1, 8);
    pushPreFloor(2552, 0, 1);
    fillPreThing(Coin, 2569, 39, 2, 1, 8);
    
    pushPreFloor(2592, 0, 35);
    pushPreThing(Koopa, 2656, 12);
    fillPreThing(Koopa, 2712, 12, 3, 1, 12);
    pushPrePipe(2752, 0, 24, true);
    pushPrePipe(2840, 0, 16, true);
    
    pushPreFloor(2880, 0, 1);
    pushPreThing(Stone, 2880, 16, 1, 2);
    pushPreFloor(2896, 0, 1);
    pushPreThing(Stone, 2896, 32, 1, 4);
    pushPreFloor(2912, 0, 1);
    pushPreThing(Stone, 2912, 48, 1, 6);
    pushPreFloor(2928, 0, 34);
    pushPreThing(Stone, 2928, 64, 2, 8);
    endCastleOutside(3004);
  }),
  new Area("Underworld", function() {
    setLocationGeneration(2);
    
    pushPreFloor(0, 0, 17);
    fillPreThing(Brick, 0, 8, 1, 11, 8, 8);
    fillPreThing(Coin, 25, 7, 9, 1, 8, 8);
    fillPreThing(Brick, 24, 32, 9, 1, 8, 8);
    fillPreThing(Coin, 33, 39, 8, 1, 8, 8);
    pushPreThing(Brick, 96, 32, Coin);
    fillPreThing(Brick, 24, 64, 10, 4, 8, 8);
    fillPreThing(Brick, 104, 24, 2, 9, 8, 8);
    pushPreThing(PipeSide, 104, 16, 1);
    pushPreThing(PipeVertical, 120, 100, 100);
  })
];