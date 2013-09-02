map.time = 300;
map.locs = [
  new Location(0, true)
];
map.areas = [
  new Area("Overworld Night Alt2", function() {
    setLocationGeneration(0);
    pushPreCastle();
    pushPrePattern("backcloud", 0, 4, 4);
    pushPreFloor(0, 0, 16);
    
    pushPreTree(144, 0, 3);
    pushPreTree(168, 32, 3);
    pushPreTree(192, 0, 3);
    pushPreThing(Platform, 224, 0, 4, [moveFloating, 0, 56]); // should move up and down
    fillPreThing(Coin, 226, 87, 2, 1, 8);
    
    pushPreTree(248, 32, 4);
    pushPreTree(296, 0, 3);
    pushPreThing(Springboard, 304, 14.5);
    pushPreTree(344, 0, 3);
    fillPreThing(Coin, 345, 71, 7, 1, 8);
    pushPreThing(Platform, 348, 64, 4, [moveSliding, 312, 364]);
    pushPreThing(Platform, 388, 47, 4, [moveSliding, 356, 400]);
    pushPreTree(392, 16, 4);
    
    pushPreThing(Block, 440, 80, Mushroom);
    pushPreThing(Platform, 444, 56, 4, [moveSliding, 408, 464]);
    pushPreThing(Platform, 480, 7, 4, [moveFloating, -8, 52]);
    pushPreTree(520, 32, 5);
    
    pushPreScale(572, 86, 8, [4, 4, 12]);
    pushPreScale(636, 86, 6, [4, 4, 12]);
    
    pushPreTree(680, 24, 5);
    pushPreTree(680, 80, 3);
    fillPreThing(Coin, 681, 87, 3, 1, 8);
    pushPreTree(720, 40, 3);
    pushPreTree(744, 0, 3);
    pushPreTree(776, 0, 4);
    fillPreThing(Coin, 801, 39, 4, 1, 8);
    pushPreTree(824, 0, 3);
    pushPreTree(856, 32, 5);
    pushPreTree(904, 0, 5);
    pushPreThing(Springboard, 928, 14.5);
    
    pushPreThing(Platform, 972, 63, 4, [moveSliding, 940, 992]);
    pushPreTree(984, 0, 3);
    pushPreScale(1020, 86, 6, [4, 6, 12]);
    pushPreTree(1056, 0, 4);
    pushPreTree(1056, 64, 3);
    pushPreTree(1080, 32, 4);
    
    pushPreThing(Platform, 1128, 47, 4, moveFalling);
    pushPreThing(Platform, 1160, 55, 4, moveFalling);
    fillPreThing(Coin, 1161, 47, 2, 1, 8);
    pushPreThing(Platform, 1192, 39, 4, moveFalling);
    pushPreThing(Platform, 1224, 47, 4, moveFalling);
    fillPreThing(Coin, 1233, 79, 2, 1, 8);
    pushPreTree(1248, 64, 3);
    
    pushPreFloor(1280, 0, 32);
    endCastleOutside(1332, 0, true, 13, 28);
  })
];