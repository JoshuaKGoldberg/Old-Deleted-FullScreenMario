map.time = 300;
map.locs = [
  new Location(0, true)
];
map.areas = [
  new Area("Overworld Night", function() {
    setLocationGeneration(0);

    pushPreCastle();
    pushPrePattern("backcloud", 0, 4, 7);
    pushPreFloor(0, 0, 16);
    
    pushPreTree(144, 24, 5);
    pushPreTree(176, 48, 6);
    pushPreThing(Goomba, 208, 56);
    pushPreThing(Platform, 240, 72, 6, [moveSliding, 228, 260]);
    pushPreTree(240, 0, 3);
    fillPreThing(Coin, 249, 7, 2, 1, 8);
    pushPreThing(Platform, 264, 40, 6, [moveSliding, 244, 276]);
    pushPreTree(288, 8, 7);
    pushPreThing(Coin, 298, 55);
    fillPreThing(Coin, 337, 55, 3, 1, 8);
    pushPreTree(344, 32, 4);
    pushPreTree(368, 16, 10);
    pushPreTree(376, 48, 6);
    pushPreThing(Block, 392, 80, Mushroom);
    fillPreThing(Coin, 417, 31, 3, 1, 8);
    pushPreThing(Koopa, 416, 60, true);
    pushPreThing(Koopa, 432, 28, true);
    pushPreTree(440, 80, 4);
    fillPreThing(Coin, 449, 87, 2, 1, 8);
    pushPreThing(Platform, 482, 56, 6, moveFalling);
    
    pushPreTree(520, 0, 16);
    pushPreTree(520, 48, 3);
    pushPreThing(Coin, 529, 55);
    pushPreTree(552, 48, 3);
    pushPreThing(Coin, 561, 55);
    pushPreThing(Koopa, 584, 12, true);
    pushPreTree(584, 48, 3);
    pushPreThing(Coin, 593, 55);
    pushPreTree(616, 72, 3);
    pushPreThing(Coin, 625, 79);
    
    pushPreScale(660, 86, 14, [6, 6, 10]);
    pushPreTree(672, 16, 4);
    
    
    pushPreThing(Platform, 752, 32, 6, moveFalling);
    pushPreThing(Platform, 768, 64, 6, moveFalling);
    pushPreTree(776, 32, 3);
    pushPreThing(Platform, 824, 16, 6, moveFalling);
    pushPreTree(832, 64, 4);
    fillPreThing(Coin, 841, 71, 2, 1, 8);
    pushPreTree(856, 16, 5);
    pushPreThing(Coin, 865, 23);
    pushPreTree(864, 48, 3);
    pushPreThing(Coin, 873, 55);
    
    pushPreThing(Koopa, 912, 66, true, [14, 66]);
    pushPreTree(928, 0, 3);
    pushPreTree(952, 24, 12);
    fillPreThing(Koopa, 992, 36, 2, 1, 14, 0, true); 
    pushPreThing(Platform, 1056, 56, 6);
    
    pushPreScale(1100, 86, 8, [6, 4, 10]);
    
    pushPreFloor(1152, 0, 32);
    endCastleOutside(1204, 0, true, 13, 28);
  })
];