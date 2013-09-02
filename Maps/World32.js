map.time = 300;
map.locs = [
  new Location(0, true)
];
map.areas = [
  new Area("Overworld Night Alt", function() {
    setLocationGeneration(0);

    pushPreCastle();
    pushPrePattern("backfence", -384, 0, 6);
    pushPreFloor(0, 0, 80);
    pushPreThing(Koopa, 136, 12);
    fillPreThing(Goomba, 192, 8, 3, 1, 12);
    fillPreThing(Koopa, 264, 12, 3, 1, 12);
    fillPreThing(Koopa, 344, 12, 2, 1, 12);
    pushPreThing(Stone, 392, 8);
    fillPreThing(Coin, 441, jumplev1-1, 3, 1, 8);
    pushPreThing(Stone, 480, 24, 1, 3);
    pushPreThing(Block, 480, 56, Mushroom);
    pushPreThing(Koopa, 528, 12);
    fillPreThing(Goomba, 568, 8, 3, 1, 12);
    pushPreThing(Stone, 600, 16, 1, 2);
    pushPreThing(Brick, 616, jumplev1, Coin);
    pushPreThing(Brick, 616, jumplev2, Star);
    pushPreThing(Koopa, 624, 12);
    pushPreThing(Stone, 632, 16, 1, 2);
    
    pushPreFloor(656, 0, 41);
    pushPreThing(Koopa, 736, 34, false, true);
    pushPreThing(Koopa, 888, 12);
    fillPreThing(Goomba, 952, 8, 3, 1, 12);
    
    pushPreFloor(1000, 0, 3);
    pushPreThing(Stone, 1008, 16, 1, 2);
    pushPreThing(Brick, 1008, 56);
    
    pushPreFloor(1040, 0, 94);
    pushPreThing(Koopa, 1072, 12);
    fillPreThing(Koopa, 1120, 12, 3, 1, 12);
    fillPreThing(Koopa, 1200, 12, 2, 1, 12);
    fillPreThing(Koopa, 1296, 12, 3, 1, 12);
    fillPreThing(Coin, 1345, 55, 4, 1, 8);
    pushPrePipe(1352, 0, 24, true);
    pushPreThing(Koopa, 1400, 12);
    fillPreThing(Goomba, 1432, 8, 3, 1, 12);
    fillPreThing(Goomba, 1504, 8, 3, 1, 12);
    pushPreThing(Stone, 1536, 8);
    pushPreThing(Stone, 1544, 16, 1, 2);
    pushPreThing(Stone, 1552, 24, 1, 3);
    pushPreThing(Stone, 1560, 32, 1, 4);
    pushPreThing(Stone, 1568, 40, 1, 5);
    pushPreThing(Stone, 1576, 48, 1, 6);
    pushPreThing(Stone, 1584, 56, 1, 7);
    pushPreThing(Stone, 1592, 64, 1, 8);
    pushPreThing(Stone, 1600, 64, 1, 8);
    
    endCastleOutside(1668);
  })
];